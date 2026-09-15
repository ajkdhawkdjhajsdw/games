import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import raw from '../server/content-data.json' with { type: 'json' };
import { alternateDeck, aliasToNode, getCatalog, getGraph, instantiateJobs, MAP_IDS } from '../server/content.ts';
import { chooseBotAction, type BotView } from '../server/bot.ts';
import { createState, isLegalIntent, isLegalSignal, resolveRound, score, SEATS, startNextRound, type Intent, type Seat, type SeatCount } from '../server/rules.ts';
import { validateContent, witnessJobs } from '../scripts/validate-content.ts';

test('all 30 graphs and 20 decks have exactly 60 passing production-resolver certificates', () => {
  const report = validateContent();
  assert.equal(report.witnessCount, 60);
  assert(report.passed);
  const retained = JSON.parse(readFileSync(new URL('../reports/content-validation.json', import.meta.url), 'utf8'));
  assert.equal(retained.contentHash, report.contentHash);
  assert.equal(retained.rulesHash, report.rulesHash);
  assert.deepEqual(retained, report);
});

test('graph topology follows every alias in all exact specification tables', () => {
  for (const mapId of MAP_IDS) for (const count of [2, 3, 4] as SeatCount[]) {
    const graph = getGraph(mapId, count);
    const map = (raw.maps as Record<string, { variants: Record<string, { entries: string[]; junctions: string[] }> }>)[mapId]!;
    const variant = map.variants[count]!;
    variant.entries.forEach((tokens, i) => assert.deepEqual(graph.edges.filter(e => e.from === `E${SEATS[i]}`).map(e => e.to), [...tokens].map(aliasToNode)));
    variant.junctions.forEach((tokens, i) => assert.deepEqual(graph.edges.filter(e => e.from === `J${i + 1}`).map(e => e.to), [...tokens].map(aliasToNode)));
  }
});

test('public map previews exactly match all ten two-seat graphs and contain only allowlisted public fields', () => {
  const previews = JSON.parse(readFileSync(new URL('../public/assets/map-previews.json', import.meta.url), 'utf8'));
  assert.deepEqual(previews, MAP_IDS.map(mapId => getGraph(mapId, 2)));
  assert.equal(previews.length, 10);
  for (const graph of previews) {
    assert.deepEqual(Object.keys(graph).sort(), ['edges', 'hint', 'mapId', 'nodes', 'seatCount', 'title']);
    for (const text of [graph.title, graph.hint]) assert.deepEqual(Object.keys(text).sort(), ['en', 'ru']);
    for (const node of graph.nodes) assert.deepEqual(Object.keys(node).sort(), ['id', 'type', 'x', 'y']);
    for (const edge of graph.edges) assert.deepEqual(Object.keys(edge).sort(), ['from', 'to']);
  }
});

function permutations<T>(items: T[]): T[][] { return items.length ? items.flatMap((v, i) => permutations(items.filter((_, j) => j !== i)).map(rest => [v, ...rest])) : [[]]; }
test('ten graphs are pairwise non-isomorphic within node types for each count', () => {
  for (const count of [2, 3, 4] as SeatCount[]) {
    const canonical = MAP_IDS.map(mapId => {
      const graph = getGraph(mapId, count);
      const groups = ['entry', 'junction', 'berth'].map(type => graph.nodes.filter(n => n.type === type).map(n => n.id));
      const encodings: string[] = [];
      for (const entries of permutations(groups[0]!)) for (const junctions of permutations(groups[1]!)) for (const berths of permutations(groups[2]!)) {
        const mapping = Object.fromEntries(groups.flat().map((node, i) => [node, [...entries, ...junctions, ...berths][i]]));
        encodings.push(graph.edges.map(e => `${mapping[e.from]}:${mapping[e.to]}`).sort().join(','));
      }
      return encodings.sort()[0];
    });
    assert.equal(new Set(canonical).size, 10);
  }
});

test('all 3840 delivered-preference realizations preserve certificate legality and score correctly', () => {
  for (const witness of raw.witnesses) {
    const count = witness.seatCount as SeatCount;
    const graph = getGraph(witness.mapId, count);
    const deliveredJobs = count === 2 ? [3, 3] : count === 3 ? [2, 2, 2] : [2, 2, 1, 1];
    for (let mask = 0; mask < 64; mask++) {
      const jobs = witnessJobs(witness.deckFamily, count);
      let bit = 0;
      SEATS.slice(0, count).forEach((seat, index) => {
        for (let j = 0; j < deliveredJobs[index]!; j++) {
          const job = jobs[seat]![j]!;
          job.preferredBerth = job.validBerths[(mask >> bit++) & 1]!;
        }
      });
      let state = createState(graph, jobs);
      let expectedPreferred = 0;
      witness.targets.forEach((tuple, index) => {
        tuple.forEach((target, seatIndex) => {
          if ('123'.includes(target) && target.length === 1) {
            const ship = state.ships[seatIndex]!;
            if (ship.jobs[ship.jobIndex]!.preferredBerth === aliasToNode(target)) expectedPreferred++;
          }
        });
        const intents = Object.fromEntries(tuple.map((target, i) => [SEATS[i], target === '.' ? { type: 'wait' } : { type: 'move', to: aliasToNode(target) }])) as Partial<Record<Seat, Intent>>;
        const result = resolveRound(state, intents);
        state = result.state;
        if (index < witness.targets.length - 1) state = startNextRound(state);
        else assert.equal(result.outcome?.status, 'success');
      });
      assert.equal(state.deliveries, 6); assert.equal(state.congestion, 0);
      assert.equal(state.preferredDeliveries, expectedPreferred);
      assert.equal(score(state), 120 + 5 * expectedPreferred);
    }
  }
});

test('private job instantiation preserves fixed queues and rejects cross-map decks', () => {
  for (const mapId of MAP_IDS) for (const count of [2, 3, 4] as SeatCount[]) for (const suffix of ['a', 'b']) {
    const deck = `${mapId.slice(1)}${suffix}`;
    const instance = instantiateJobs(mapId, count, deck);
    assert.equal(Object.keys(instance.jobs).length, count);
    const authored = witnessJobs(deck, count);
    for (const seat of SEATS.slice(0, count)) {
      assert.deepEqual(instance.jobs[seat]!.map(j => j.validBerths), authored[seat]!.map(j => j.validBerths));
      assert(instance.jobs[seat]!.every(j => j.validBerths.includes(j.preferredBerth)));
    }
    assert.equal(alternateDeck(alternateDeck(deck)), deck);
  }
  assert.throws(() => instantiateJobs('M01', 2, '02a'));
  assert.throws(() => getGraph('M11', 2));
  assert.throws(() => getGraph('M01', 5 as SeatCount));
  const catalog = JSON.stringify(getCatalog());
  for (const forbidden of ['deckFamily', 'validBerths', 'preferredBerth', 'targets', 'variants']) assert(!catalog.includes(forbidden));
  const graph = getGraph('M01', 2); graph.nodes[0]!.x = 99;
  assert.notEqual(getGraph('M01', 2).nodes[0]!.x, 99);
});

function botView(mapId = 'M01', count: SeatCount = 2): BotView {
  const state = createState(getGraph(mapId, count), witnessJobs(`${mapId.slice(1)}a`, count));
  return { seat: 'A', node: 'EA', job: state.ships[0]!.jobs[0]!, graph: state.graph,
    ships: state.ships.map(s => ({ seat: s.seat, node: s.node, isBot: true })), signals: [], round: 1,
    deadline: 20000, deliveries: 0, congestion: 0, control: 'bot' };
}
test('bot is deterministic, legal, signal responsive and bounded to 7–9s commitment', () => {
  const view = botView();
  const action = chooseBotAction(view, 'persisted seed');
  assert.deepEqual(chooseBotAction(view, 'persisted seed'), action);
  assert(action.commitOffsetMs >= 7000 && action.commitOffsetMs <= 9000);
  const state = createState(view.graph, witnessJobs('01a', 2));
  assert(isLegalIntent(state, view.seat, action.intent));
  assert(action.signal && isLegalSignal(view.graph, view.seat, action.signal));
  assert.equal(action.intent.type, 'move');
  if (action.intent.type === 'move') {
    view.signals = [{ seat: 'B', type: 'NEED', node: action.intent.to }];
    const changed = chooseBotAction(view, 'persisted seed');
    assert.notDeepEqual(changed.intent, action.intent);
  }
});
test('bot chooses available delivery over preference detour and never transits wrong berth', () => {
  const view = botView('M03');
  view.node = 'J1'; view.ships[0]!.node = 'J1';
  view.job = { validBerths: ['B1', 'B2'], preferredBerth: 'B2', flavor: 'tea' };
  assert.deepEqual(chooseBotAction(view, 'seed').intent, { type: 'move', to: 'B1' });
  view.graph.edges = [{ from: 'J1', to: 'B3' }, { from: 'B3', to: 'B2' }];
  assert.deepEqual(chooseBotAction(view, 'seed').intent, { type: 'wait' });
});
test('symmetric bots alternate publicly computable bottleneck priority', () => {
  const base = botView('M06', 4);
  const winners: Seat[] = [];
  for (let round = 1; round <= 4; round++) {
    const moving: Seat[] = [];
    for (const ship of base.ships) {
      const view = { ...base, seat: ship.seat, node: ship.node!, round };
      if (chooseBotAction(view, `seed-${ship.seat}`).intent.type === 'move') moving.push(ship.seat);
    }
    assert.equal(moving.length, 1); winners.push(moving[0]!);
  }
  assert.equal(new Set(winners).size, 4);
});
test('runtime bot imports no content or witness/private-queue access', () => {
  const source = readFileSync(new URL('../server/bot.ts', import.meta.url), 'utf8');
  assert(!/from\s+['"][^'"]*(?:content|validate|solver)/.test(source));
  assert(!/\.jobs\b|\.jobIndex\b|deckFamily|witness|sealed/.test(source));
});
