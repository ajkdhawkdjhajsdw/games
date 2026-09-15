export const RULES_VERSION = 'QH-1.0';
export const SEATS = ['A', 'B', 'C', 'D'] as const;
export type Seat = (typeof SEATS)[number];
export type SeatCount = 2 | 3 | 4;
export type Berth = 'B1' | 'B2' | 'B3';
export type Localized = { en: string; ru: string };
export interface Graph {
  mapId: string;
  seatCount: SeatCount;
  title: Localized;
  hint: Localized;
  nodes: { id: string; type: 'entry' | 'junction' | 'berth'; x: number; y: number }[];
  edges: { from: string; to: string }[];
}
export interface Job { validBerths: [Berth, Berth]; preferredBerth: Berth; flavor: string }
export interface Ship { seat: Seat; node: string | null; jobIndex: number; jobs: Job[] }
export interface GameState {
  graph: Graph;
  round: number;
  deliveries: number;
  preferredDeliveries: number;
  congestion: number;
  ships: Ship[];
  phase: 'planning' | 'resolved';
}
export type Intent = { type: 'wait' } | { type: 'move'; to: string };
export type Signal = { seat: Seat; type: 'NEED' | 'YIELD' | 'READY'; node: string };
export type Outcome = { status: 'success' | 'failure'; reason: 'DELIVERY_TARGET' | 'CONGESTION_LIMIT' | 'ROUND_LIMIT' } | null;
export type RoundEvent =
  | { type: 'contention'; node: string; seats: Seat[] }
  | { type: 'swap'; nodes: string[]; seats: Seat[] }
  | { type: 'move' | 'blocked' | 'delivery'; seat: Seat; from: string; to: string };

export function score(state: Pick<GameState, 'deliveries' | 'preferredDeliveries' | 'congestion'>): number {
  return Math.max(0, 20 * state.deliveries + 5 * state.preferredDeliveries - 4 * state.congestion);
}

/** Evaluate after resolving the stated round, not at its planning start. */
export function terminal(state: Pick<GameState, 'round' | 'deliveries' | 'congestion'>): Outcome {
  if (state.congestion >= 5) return { status: 'failure', reason: 'CONGESTION_LIMIT' };
  if (state.deliveries >= 6) return { status: 'success', reason: 'DELIVERY_TARGET' };
  if (state.round >= 8) return { status: 'failure', reason: 'ROUND_LIMIT' };
  return null;
}

export function createState(graph: Graph, jobs: Partial<Record<Seat, Job[]>>): GameState {
  const ships = SEATS.slice(0, graph.seatCount).map(seat => {
    if (!jobs[seat]?.length) throw new Error(`Missing jobs for ${seat}`);
    return { seat, node: `E${seat}`, jobIndex: 0, jobs: structuredClone(jobs[seat]!) };
  });
  return { graph: structuredClone(graph), round: 1, deliveries: 0, preferredDeliveries: 0, congestion: 0, ships, phase: 'planning' };
}

export function legalDestinations(graph: Graph, seat: Seat, node: string | null, job: Job | undefined): string[] {
  if (!node || !job) return [];
  return graph.edges.filter(edge => edge.from === node).map(edge => edge.to).filter(id => {
    const target = graph.nodes.find(n => n.id === id);
    return target && (target.type !== 'entry' || id === `E${seat}`)
      && (target.type !== 'berth' || job.validBerths.includes(id as Berth));
  });
}

export function legalMoves(state: GameState, seat: Seat): string[] {
  const ship = state.ships.find(s => s.seat === seat);
  return ship ? legalDestinations(state.graph, seat, ship.node, ship.jobs[ship.jobIndex]) : [];
}

export function isLegalIntent(state: GameState, seat: Seat, intent: Intent): boolean {
  if (!state.ships.some(s => s.seat === seat)) return false;
  return intent?.type === 'wait' || (intent?.type === 'move' && legalMoves(state, seat).includes(intent.to));
}

export function isLegalSignal(graph: Graph, seat: Seat, signal: Signal): boolean {
  const node = graph.nodes.find(n => n.id === signal.node);
  return SEATS.slice(0, graph.seatCount).includes(seat) && signal.seat === seat && ['NEED', 'YIELD', 'READY'].includes(signal.type)
    && !!node && (node.type !== 'entry' || node.id === `E${seat}`);
}

export function resolveRound(state: GameState, intents: Partial<Record<Seat, Intent>>): { state: GameState; events: RoundEvent[]; outcome: Outcome } {
  if (state.phase !== 'planning') throw new Error('Round has already been resolved');
  if (state.round < 1 || state.round > 8 || state.deliveries >= 6 || state.congestion >= 5) throw new Error('Scenario is not active');
  const ships = [...state.ships].sort((a, b) => a.seat.localeCompare(b.seat));
  if (ships.length !== state.graph.seatCount || ships.some((ship, i) => ship.seat !== SEATS[i])) throw new Error('Invalid scenario seats');
  const occupants = new Map<string, Seat>();
  for (const ship of ships) {
    if (!ship.node || !state.graph.nodes.some(n => n.id === ship.node) || occupants.has(ship.node)) throw new Error('Invalid round-start occupancy');
    const node = state.graph.nodes.find(n => n.id === ship.node)!;
    if (node.type === 'berth' || (node.type === 'entry' && ship.node !== `E${ship.seat}`)) throw new Error('Invalid round-start ship location');
    const currentJob = ship.jobs[ship.jobIndex];
    if (!currentJob || currentJob.validBerths.length !== 2 || new Set(currentJob.validBerths).size !== 2
      || !currentJob.validBerths.every(id => state.graph.nodes.some(n => n.id === id && n.type === 'berth'))
      || !currentJob.validBerths.includes(currentJob.preferredBerth)) throw new Error('Invalid current job');
    occupants.set(ship.node, ship.seat);
  }
  if (new Set(ships.map(s => s.seat)).size !== ships.length) throw new Error('Duplicate seat');
  const moves = new Map<Seat, string>();
  for (const seat of Object.keys(intents)) if (!ships.some(s => s.seat === seat)) throw new Error('Unknown intent seat');
  for (const ship of ships) {
    const intent = intents[ship.seat] === undefined ? { type: 'wait' } as const : intents[ship.seat]!;
    if (!isLegalIntent(state, ship.seat, intent)) throw new Error(`Illegal persisted intent for ${ship.seat}`);
    if (intent.type === 'move') moves.set(ship.seat, intent.to);
  }
  const failed = new Set<Seat>();
  const events: RoundEvent[] = [];
  const groups = new Map<string, Seat[]>();
  for (const [seat, to] of moves) groups.set(to, [...(groups.get(to) ?? []), seat]);
  for (const [node, seats] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
    if (seats.length > 1) { seats.forEach(seat => failed.add(seat)); events.push({ type: 'contention', node, seats }); }
  }
  for (const ship of ships) {
    if (failed.has(ship.seat) || !moves.has(ship.seat)) continue;
    const other = occupants.get(moves.get(ship.seat)!);
    if (other && !failed.has(other) && moves.get(other) === ship.node) {
      failed.add(ship.seat); failed.add(other);
      events.push({ type: 'swap', nodes: [ship.node!, moves.get(ship.seat)!].sort(), seats: [ship.seat, other].sort() });
    }
  }
  const successful = new Map<Seat, boolean>();
  function canDepart(seat: Seat, visiting = new Set<Seat>()): boolean {
    if (!moves.has(seat) || failed.has(seat)) return false;
    if (successful.has(seat)) return successful.get(seat)!;
    // Two-cycles were eliminated; a remaining closed cycle rotates together.
    if (visiting.has(seat)) return true;
    visiting.add(seat);
    const occupant = occupants.get(moves.get(seat)!);
    const result = !occupant || canDepart(occupant, visiting);
    visiting.delete(seat);
    successful.set(seat, result);
    return result;
  }
  const next = structuredClone(state);
  next.phase = 'resolved';
  next.congestion += events.length;
  next.ships.sort((a, b) => a.seat.localeCompare(b.seat));
  for (const ship of next.ships) {
    const to = moves.get(ship.seat);
    if (!to) continue;
    const from = ship.node!;
    if (!canDepart(ship.seat)) { events.push({ type: 'blocked', seat: ship.seat, from, to }); continue; }
    ship.node = to;
    events.push({ type: 'move', seat: ship.seat, from, to });
    if (state.graph.nodes.find(n => n.id === to)?.type === 'berth') {
      const job = ship.jobs[ship.jobIndex]!;
      next.deliveries++;
      if (job.preferredBerth === to) next.preferredDeliveries++;
      ship.jobIndex++;
      ship.node = null;
      events.push({ type: 'delivery', seat: ship.seat, from, to });
    }
  }
  return { state: next, events, outcome: terminal(next) };
}

export function startNextRound(state: GameState): GameState {
  if (state.phase !== 'resolved' || terminal(state)) throw new Error('Cannot start another round');
  const next = structuredClone(state);
  next.round++;
  next.phase = 'planning';
  for (const ship of next.ships) {
    if (ship.node === null) {
      if (!ship.jobs[ship.jobIndex]) throw new Error('Job queue exhausted');
      ship.node = `E${ship.seat}`;
    }
  }
  return next;
}
