import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import raw from '../server/content-data.json' with { type: 'json' };
import { aliasToNode, CONTENT_VERSION, getGraph, MAP_IDS, PAIRS } from '../server/content.ts';
import { createState, resolveRound, RULES_VERSION, SEATS, startNextRound, type Graph, type Intent, type Job, type Seat, type SeatCount } from '../server/rules.ts';

const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

export function validateGraph(graph: Graph) {
  assert.equal(graph.nodes.length, 9);
  const ids = graph.nodes.map(n => n.id);
  assert.equal(new Set(ids).size, 9);
  assert.equal(graph.nodes.filter(n => n.type === 'entry').length, graph.seatCount);
  assert.equal(graph.nodes.filter(n => n.type === 'berth').length, 3);
  assert.equal(new Set(graph.edges.map(e => `${e.from}:${e.to}`)).size, graph.edges.length);
  for (const edge of graph.edges) {
    assert(ids.includes(edge.from) && ids.includes(edge.to));
    assert.notEqual(edge.from, edge.to);
    assert.notEqual(graph.nodes.find(n => n.id === edge.to)!.type, 'entry');
    assert.notEqual(graph.nodes.find(n => n.id === edge.from)!.type, 'berth');
    assert(!(edge.from.startsWith('E') && edge.to.startsWith('B')), 'Four-job bound requires no direct entry-to-berth edge');
  }
  const allReachable = new Set<string>();
  for (const seat of SEATS.slice(0, graph.seatCount)) {
    const reachable = new Set<string>();
    const pending = [`E${seat}`];
    while (pending.length) {
      const id = pending.pop()!;
      if (reachable.has(id)) continue;
      reachable.add(id); allReachable.add(id);
      if (!id.startsWith('B')) pending.push(...graph.edges.filter(e => e.from === id).map(e => e.to));
    }
    for (const berth of ['B1', 'B2', 'B3']) assert(reachable.has(berth), `${seat} cannot reach ${berth}`);
  }
  assert.equal(allReachable.size, 9);
  return { nineNodes: true, exclusiveEntries: true, noInboundEntries: true, allBerthsReachable: true, allJunctionsReachable: true, fourJobBound: true };
}

export function witnessJobs(deckFamily: string, seatCount: SeatCount): Partial<Record<Seat, Job[]>> {
  const deck = (raw.decks as Record<string, Record<Seat, string>>)[deckFamily]!;
  return Object.fromEntries(SEATS.slice(0, seatCount).map(seat => [seat, [...deck[seat]].map(letter => ({
    validBerths: [...PAIRS[letter]!], preferredBerth: PAIRS[letter]![0], flavor: 'tea',
  }))]));
}

export function validateContent() {
  assert.equal(Object.keys(raw.maps).length, 10);
  assert.equal(Object.keys(raw.decks).length, 20);
  assert.equal(raw.witnesses.length, 60);
  const coverage = new Set<string>();
  const distribution: Record<string, number> = {};
  const cases = raw.witnesses.map(witness => {
    const seatCount = witness.seatCount as SeatCount;
    const key = `${witness.deckFamily}:${seatCount}`;
    assert(!coverage.has(key), 'Duplicate witness'); coverage.add(key);
    const graph = getGraph(witness.mapId, seatCount);
    const checks = validateGraph(graph);
    const jobs = witnessJobs(witness.deckFamily, seatCount);
    for (const queue of Object.values(jobs)) {
      assert.equal(queue.length, 4);
      for (const job of queue) {
        assert.equal(new Set(job.validBerths).size, 2);
        assert(job.validBerths.includes(job.preferredBerth));
      }
    }
    let state = createState(graph, jobs);
    const transitions = witness.targets.map((tuple, index) => {
      assert.equal(tuple.length, seatCount);
      const intents = Object.fromEntries(tuple.map((target, i) => [SEATS[i], target === '.' ? { type: 'wait' } : { type: 'move', to: aliasToNode(target) }])) as Partial<Record<Seat, Intent>>;
      const start = { round: state.round, occupancy: state.ships.map(({ seat, node, jobIndex }) => ({ seat, node, jobIndex })) };
      const result = resolveRound(state, intents);
      state = result.state;
      const transition = { start, intents, events: result.events, end: { occupancy: state.ships.map(({ seat, node, jobIndex }) => ({ seat, node, jobIndex })), deliveries: state.deliveries, preferredDeliveries: state.preferredDeliveries, congestion: state.congestion }, outcome: result.outcome };
      if (index < witness.targets.length - 1) { assert.equal(result.outcome, null); state = startNextRound(state); }
      else assert.deepEqual(result.outcome, { status: 'success', reason: 'DELIVERY_TARGET' });
      return transition;
    });
    assert.equal(state.round, witness.rounds);
    assert.equal(state.deliveries, 6);
    assert.equal(state.congestion, 0);
    assert(state.round <= 8);
    assert.deepEqual(state.ships.map(s => s.jobIndex), seatCount === 2 ? [3, 3] : seatCount === 3 ? [2, 2, 2] : [2, 2, 1, 1]);
    distribution[state.round] = (distribution[state.round] ?? 0) + 1;
    return { mapId: witness.mapId, deckFamily: witness.deckFamily, seatCount, graphHash: hash(graph), deckHash: hash((raw.decks as Record<string, unknown>)[witness.deckFamily]), witnessHash: hash(witness), checks, transitions, final: { round: state.round, deliveries: state.deliveries, preferredDeliveries: state.preferredDeliveries, congestion: state.congestion }, passed: true };
  });
  for (const deck of Object.keys(raw.decks)) for (const count of [2, 3, 4]) assert(coverage.has(`${deck}:${count}`));
  assert.deepEqual(distribution, { 4: 14, 5: 19, 6: 13, 7: 14 });
  return { contentVersion: CONTENT_VERSION, rulesVersion: RULES_VERSION, contentHash: hash(raw), rulesHash: createHash('sha256').update(readFileSync(new URL('../server/rules.ts', import.meta.url))).digest('hex'), graphCount: 30, deckCount: 20, witnessCount: cases.length, passed: cases.every(c => c.passed), finishRoundDistribution: distribution, evidenceLimit: 'Exact authored existence witnesses replayed by production resolver. Not bot-quality, human-playtest, service, or release evidence.', cases };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const report = validateContent();
  mkdirSync('reports', { recursive: true });
  writeFileSync('reports/content-validation.json', `${JSON.stringify(report, null, 2)}\n`);
  mkdirSync('public/assets', { recursive: true });
  writeFileSync('public/assets/map-previews.json', `${JSON.stringify(MAP_IDS.map(mapId => getGraph(mapId, 2)), null, 2)}\n`);
  console.log(`Validated ${report.graphCount} graphs, ${report.deckCount} decks, ${report.witnessCount}/60 witnesses.`);
}
