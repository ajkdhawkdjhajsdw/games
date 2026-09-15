export type Locale = 'en' | 'ru';
export type Signal = { kind: 'NEED' | 'YIELD' | 'READY'; node: string };
export type GraphNode = { id: string; type: 'entry' | 'junction' | 'berth'; x: number; y: number };
export type Graph = { nodes: GraphNode[]; edges: { from: string; to: string }[] };
export type MapInfo = { id: string; title: Record<Locale, string>; hint: Record<Locale, string> };
export type Player = { seat: string; name: string; bot: boolean; node: string | null; ready: boolean; committed: boolean; connected: boolean; signal: Signal | null };
export type Room = {
  id: string; phase: string; mapId: string; capacity: number; hostSeat: string | null;
  mode: string; revision: number; configVersion: number; scenarioId: string | null; round: number;
  deadlineAt: number | null; serverNow: number; nextRoundStartsAt?: number; startAt?: number;
  deliveries: number; congestion: number; graph: Graph; players: Player[];
  owner: { seat: string; job: { valid: string[]; preferred: string; cargo: string } | null; legalMoves: string[]; committed: boolean; destination: string | null; controlEpoch: number; seq: number; canControl: boolean; botConsent?: boolean };
  result: { outcome: string; reason: string; score: number; deliveries: number; preferredDeliveries: number; congestion: number } | null;
  history: { round: number; deliveries: number; congestion: number; conflicts?: string[] }[];
  untimed?: boolean;
};
