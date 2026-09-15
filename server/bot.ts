import { createHash } from 'node:crypto';
import { legalDestinations, SEATS, type Berth, type Graph, type Intent, type Job, type Seat, type Signal } from './rules.ts';

export interface BotView {
  seat: Seat;
  node: string;
  job: Job;
  graph: Graph;
  ships: { seat: Seat; node: string | null; isBot: boolean }[];
  signals: Signal[];
  round: number;
  deadline: number;
  deliveries: number;
  congestion: number;
  control: 'bot';
}

function tie(seed: string, value: string): number {
  return createHash('sha256').update(`${seed}:${value}`).digest().readUInt32BE(0);
}

function distance(graph: Graph, from: string, targets: string[], job: Job): number {
  const queue: [string, number][] = [[from, 0]];
  const seen = new Set<string>();
  while (queue.length) {
    const [node, steps] = queue.shift()!;
    if (targets.includes(node)) return steps;
    if (seen.has(node)) continue;
    seen.add(node);
    if (graph.nodes.find(n => n.id === node)?.type === 'berth') continue;
    for (const edge of graph.edges.filter(e => e.from === node)) {
      const target = graph.nodes.find(n => n.id === edge.to)!;
      if (target.type === 'entry' || (target.type === 'berth' && !job.validBerths.includes(edge.to as Berth))) continue;
      queue.push([edge.to, steps + 1]);
    }
  }
  return Infinity;
}

/** The caller persists the seed and constructs this allowlisted view, never a room aggregate. */
export function chooseBotAction(view: BotView, seed: string): { intent: Intent; signal: Signal | null; commitOffsetMs: number } {
  const current = distance(view.graph, view.node, view.job.validBerths, view.job);
  const candidates = legalDestinations(view.graph, view.seat, view.node, view.job).map(node => {
    const occupant = view.ships.find(s => s.node === node && s.seat !== view.seat);
    const requested = view.signals.some(s => s.seat !== view.seat && s.node === node && s.type === 'NEED');
    const possibleExit = !occupant || view.graph.edges.some(e => e.from === node && view.graph.nodes.find(n => n.id === e.to)?.type !== 'entry');
    const dist = distance(view.graph, node, view.job.validBerths, view.job);
    const preferred = distance(view.graph, node, [view.job.preferredBerth], view.job);
    let priorityRisk = 0;
    if (view.ships.filter(s => s.isBot).length >= 2 && view.graph.nodes.find(n => n.id === node)?.type === 'junction') {
      const rank = (seat: Seat) => (view.round + SEATS.indexOf(seat)) % view.graph.seatCount;
      const higher = view.ships.some(s => s.isBot && s.seat !== view.seat && s.node && rank(s.seat) < rank(view.seat)
        && view.graph.edges.some(e => e.from === s.node && e.to === node));
      if (higher) priorityRisk = 30;
    }
    return { node, dist, preferred, risk: (requested ? 100 : 0) + (occupant ? 20 : 0) + priorityRisk, possibleExit };
  }).filter(c => c.possibleExit && c.dist < current && c.risk < 30);
  candidates.sort((a, b) => a.risk - b.risk || a.dist - b.dist || a.preferred - b.preferred
    || tie(seed, `${view.round}:${a.node}`) - tie(seed, `${view.round}:${b.node}`));
  const best = candidates[0];
  return {
    intent: best ? { type: 'move', to: best.node } : { type: 'wait' },
    signal: best ? { seat: view.seat, type: 'NEED', node: best.node } : { seat: view.seat, type: 'YIELD', node: view.node },
    commitOffsetMs: 7000 + tie(seed, `commit:${view.round}:${view.seat}`) % 2001,
  };
}
