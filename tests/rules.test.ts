import test from 'node:test';
import assert from 'node:assert/strict';
import { createState, isLegalIntent, isLegalSignal, legalMoves, resolveRound, score, startNextRound, terminal, type Graph, type Intent, type Job, type Seat, type SeatCount } from '../server/rules.ts';

const job: Job = { validBerths: ['B1', 'B2'], preferredBerth: 'B1', flavor: 'tea' };
function fixture(nodes: string[], edges: [string, string][]) {
  const graph: Graph = { mapId: 'fixture', seatCount: nodes.length as SeatCount, title: { en: '', ru: '' }, hint: { en: '', ru: '' },
    nodes: [...new Set([...nodes, ...edges.flat(), ...['EA', 'EB', 'EC', 'ED', 'B1', 'B2', 'B3']])].map(id => ({ id, type: id.startsWith('B') ? 'berth' : id.startsWith('E') ? 'entry' : 'junction', x: 0, y: 0 })), edges: edges.map(([from, to]) => ({ from, to })) };
  const state = createState(graph, { A: [job, job, job, job], B: [job, job, job, job], C: [job, job, job, job], D: [job, job, job, job] });
  state.ships.forEach((ship, i) => { ship.node = nodes[i]!; });
  return state;
}
const moves = (...targets: (string | null)[]) => Object.fromEntries(targets.map((to, i) => [(['A', 'B', 'C', 'D'] as Seat[])[i], to ? { type: 'move', to } : { type: 'wait' }])) as Partial<Record<Seat, Intent>>;

test('two and three proposals charge once per destination including a berth', () => {
  for (const target of ['J4', 'B1']) {
    const state = fixture(['J1', 'J2', 'J3'], [['J1', target], ['J2', target], ['J3', target]]);
    const result = resolveRound(state, moves(target, target, target));
    assert.equal(result.state.congestion, 1); assert.equal(result.state.deliveries, 0);
    assert.deepEqual(result.state.ships.map(s => s.node), ['J1', 'J2', 'J3']);
  }
});
test('waiting occupant blocks without charge; two targeting it charge once', () => {
  const state = fixture(['J1', 'J2', 'J3'], [['J1', 'J2'], ['J3', 'J2']]);
  assert.equal(resolveRound(state, moves('J2')).state.congestion, 0);
  assert.equal(resolveRound(state, moves('J2', null, 'J2')).state.congestion, 1);
});
test('swap fails, contention takes precedence over swap', () => {
  const state = fixture(['J1', 'J2', 'J3'], [['J1', 'J2'], ['J2', 'J1'], ['J3', 'J2']]);
  assert.equal(resolveRound(state, moves('J2', 'J1')).state.congestion, 1);
  const result = resolveRound(state, moves('J2', 'J1', 'J2'));
  assert.equal(result.state.congestion, 1);
  assert(!result.events.some(e => e.type === 'swap'));
  assert.deepEqual(result.state.ships.map(s => s.node), ['J1', 'J2', 'J3']);
});
test('dependency chains succeed to empty space and block to waiting occupants', () => {
  const state = fixture(['J1', 'J2', 'J3'], [['J1', 'J2'], ['J2', 'J3'], ['J3', 'J4']]);
  assert.deepEqual(resolveRound(state, moves('J2', 'J3', 'J4')).state.ships.map(s => s.node), ['J2', 'J3', 'J4']);
  assert.deepEqual(resolveRound(state, moves('J2', 'J3')).state.ships.map(s => s.node), ['J1', 'J2', 'J3']);
});
test('three and four cycles rotate simultaneously', () => {
  for (const nodes of [['J1', 'J2', 'J3'], ['J1', 'J2', 'J3', 'J4']]) {
    const targets = [...nodes.slice(1), nodes[0]!];
    const state = fixture(nodes, nodes.map((n, i) => [n, targets[i]!]));
    const result = resolveRound(state, moves(...targets));
    assert.deepEqual(result.state.ships.map(s => s.node), targets);
    assert.equal(result.state.congestion, 0);
  }
});
test('deliver only after dependencies, then respawn next round and consume one job', () => {
  const state = fixture(['J1', 'J2'], [['J1', 'J2'], ['J2', 'B1']]);
  const result = resolveRound(state, moves('J2', 'B1'));
  assert.deepEqual(result.state.ships.map(s => s.node), ['J2', null]);
  assert.equal(result.state.ships[1]!.jobIndex, 1);
  assert.equal(result.state.preferredDeliveries, 1);
  assert.equal(startNextRound(result.state).ships[1]!.node, 'EB');
  assert(!JSON.stringify(result.events).includes('preferred'));
  assert.throws(() => resolveRound(result.state, {}));
});
test('terminal precedence and all same-round deliveries count', () => {
  assert.equal(terminal({ round: 8, deliveries: 6, congestion: 5 })!.reason, 'CONGESTION_LIMIT');
  assert.equal(terminal({ round: 8, deliveries: 6, congestion: 4 })!.reason, 'DELIVERY_TARGET');
  assert.equal(terminal({ round: 8, deliveries: 5, congestion: 4 })!.reason, 'ROUND_LIMIT');
  const state = fixture(['J1', 'J2', 'J3'], [['J1', 'B1'], ['J2', 'B2'], ['J3', 'B3']]);
  state.deliveries = 5;
  state.ships[2]!.jobs[0] = { ...job, validBerths: ['B1', 'B3'] };
  const result = resolveRound(state, moves('B1', 'B2', 'B3'));
  assert.equal(result.state.deliveries, 8);
  assert.throws(() => startNextRound(result.state));
  assert.equal(score({ deliveries: 6, preferredDeliveries: 4, congestion: 2 }), 132);
  assert.equal(score({ deliveries: 0, preferredDeliveries: 0, congestion: 5 }), 0);
});
test('same-round sixth delivery and fifth congestion point fail without suppressing delivery', () => {
  const state = fixture(['J1', 'J2', 'J3'], [['J1', 'J4'], ['J2', 'J4'], ['J3', 'B1']]);
  state.deliveries = 5; state.congestion = 4;
  const result = resolveRound(state, moves('J4', 'J4', 'B1'));
  assert.equal(result.state.deliveries, 6);
  assert.equal(result.state.congestion, 5);
  assert.equal(result.outcome?.reason, 'CONGESTION_LIMIT');
  assert.equal(result.state.ships[2]!.node, null);
});
test('two disjoint swaps charge twice and a failed dependency blocks the whole chain', () => {
  const swaps = fixture(['J1', 'J2', 'J3', 'J4'], [['J1', 'J2'], ['J2', 'J1'], ['J3', 'J4'], ['J4', 'J3']]);
  assert.equal(resolveRound(swaps, moves('J2', 'J1', 'J4', 'J3')).state.congestion, 2);
  const chain = fixture(['J1', 'J2', 'J3', 'J4'], [['J1', 'J2'], ['J2', 'J3'], ['J3', 'J5'], ['J4', 'J5']]);
  const result = resolveRound(chain, moves('J2', 'J3', 'J5', 'J5'));
  assert.equal(result.state.congestion, 1);
  assert.deepEqual(result.state.ships.map(s => s.node), ['J1', 'J2', 'J3', 'J4']);
});
test('eighth round permits final job delivery but never a ninth-round respawn', () => {
  const state = fixture(['J1', 'J2'], [['J1', 'B1']]);
  state.round = 8; state.ships[0]!.jobIndex = 3;
  const result = resolveRound(state, moves('B1'));
  assert.equal(result.state.ships[0]!.jobIndex, 4);
  assert.equal(result.state.ships[0]!.node, null);
  assert.equal(result.outcome?.reason, 'ROUND_LIMIT');
  assert.throws(() => startNextRound(result.state));
});
test('reject forged wrong berths, nonedges, entries and integrity faults', () => {
  const state = fixture(['J1', 'J2'], [['J1', 'B3'], ['J1', 'EB'], ['J1', 'J2']]);
  assert.deepEqual(legalMoves(state, 'A'), ['J2']);
  assert(!isLegalIntent(state, 'A', { type: 'move', to: 'J1' }));
  assert.throws(() => resolveRound(state, moves('B3')));
  assert.throws(() => resolveRound(state, { A: null } as unknown as Partial<Record<Seat, Intent>>));
  assert.throws(() => resolveRound(state, { C: { type: 'wait' } }));
  assert(isLegalSignal(state.graph, 'A', { seat: 'A', type: 'NEED', node: 'B3' }));
  assert(!isLegalSignal(state.graph, 'A', { seat: 'A', type: 'NEED', node: 'EB' }));
  state.ships[1]!.node = 'J1';
  assert.throws(() => resolveRound(state, {}));
});
test('missing commitments wait and resolver leaves input unchanged', () => {
  const state = fixture(['J1', 'J2'], [['J1', 'J2']]);
  const copy = structuredClone(state);
  assert.deepEqual(resolveRound(state, {}).state.ships, state.ships);
  assert.deepEqual(state, copy);
});
test('all ship/intent iteration permutations produce identical results', () => {
  const state = fixture(['J1', 'J2', 'J3', 'J4'], [['J1', 'J2'], ['J2', 'J3'], ['J3', 'J4'], ['J4', 'B1']]);
  function permutations<T>(items: T[]): T[][] { return items.length ? items.flatMap((v, i) => permutations(items.filter((_, j) => j !== i)).map(rest => [v, ...rest])) : [[]]; }
  const intents = moves('J2', 'J3', 'J4', 'B1');
  const expected = resolveRound(state, intents);
  for (const ships of permutations(state.ships)) {
    assert.deepEqual(resolveRound({ ...state, ships }, Object.fromEntries(ships.map(s => [s.seat, intents[s.seat]]))), expected);
  }
});
