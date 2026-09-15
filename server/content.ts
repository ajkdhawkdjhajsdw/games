import { randomInt } from 'node:crypto';
import raw from './content-data.json' with { type: 'json' };
import { SEATS, type Berth, type Graph, type Job, type Seat, type SeatCount } from './rules.ts';

export const CONTENT_VERSION = raw.version;
export const MAP_IDS = Object.keys(raw.maps);
const maps = raw.maps as Record<string, { title: Graph['title']; hint: Graph['hint']; variants: Record<string, { entries: string[]; junctions: string[] }> }>;
const decks = raw.decks as Record<string, Record<Seat, string>>;
export const PAIRS: Record<string, [Berth, Berth]> = { P: ['B1', 'B2'], Q: ['B2', 'B3'], R: ['B1', 'B3'] };
export const FLAVORS = ['tea', 'fabric', 'books', 'bread', 'tools', 'flowers'] as const;

export function aliasToNode(alias: string): string {
  const aliases: Record<string, string> = { a: 'EA', b: 'EB', c: 'EC', d: 'ED', X: 'J1', Y: 'J2', Z: 'J3', W: 'J4', '1': 'B1', '2': 'B2', '3': 'B3' };
  if (!aliases[alias]) throw new Error(`Unknown content alias ${alias}`);
  return aliases[alias];
}

export function getGraph(mapId: string, seatCount: SeatCount): Graph {
  const map = maps[mapId];
  const variant = map?.variants[seatCount];
  if (!variant) throw new Error('Unsupported map or seat count');
  const berthCoordinates = seatCount === 2 ? [[.14, .12], [.5, .12], [.86, .12]] : seatCount === 3 ? [[.12, .12], [.5, .12], [.88, .12]] : [[.12, .14], [.5, .14], [.88, .14]];
  const junctionCoordinates = seatCount === 2 ? [[.28, .43], [.72, .43], [.28, .68], [.72, .68]] : seatCount === 3 ? [[.26, .43], [.74, .43], [.5, .66]] : [[.32, .49], [.68, .49]];
  const entryCoordinates = seatCount === 2 ? [[.12, .89], [.88, .89]] : seatCount === 3 ? [[.14, .89], [.5, .89], [.86, .89]] : [[.08, .86], [.36, .86], [.64, .86], [.92, .86]];
  const nodes: Graph['nodes'] = [];
  berthCoordinates.forEach(([x, y], i) => nodes.push({ id: `B${i + 1}`, type: 'berth', x: x!, y: y! }));
  junctionCoordinates.forEach(([x, y], i) => nodes.push({ id: `J${i + 1}`, type: 'junction', x: x!, y: y! }));
  entryCoordinates.forEach(([x, y], i) => nodes.push({ id: `E${SEATS[i]}`, type: 'entry', x: x!, y: y! }));
  const edges: Graph['edges'] = [];
  variant.entries.forEach((outputs, i) => [...outputs].forEach(alias => edges.push({ from: `E${SEATS[i]}`, to: aliasToNode(alias) })));
  variant.junctions.forEach((outputs, i) => [...outputs].forEach(alias => edges.push({ from: `J${i + 1}`, to: aliasToNode(alias) })));
  return { mapId, seatCount, title: { ...map.title }, hint: { ...map.hint }, nodes, edges };
}

/** Keep this result private; only the owner's current job belongs in a DTO. */
export function instantiateJobs(mapId: string, seatCount: SeatCount, deckFamily?: string): { deckFamily: string; jobs: Partial<Record<Seat, Job[]>> } {
  getGraph(mapId, seatCount);
  const family = deckFamily ?? `${mapId.slice(1)}${randomInt(2) ? 'b' : 'a'}`;
  if (!Object.hasOwn(decks, family) || family.slice(0, 2) !== mapId.slice(1)) throw new Error('Deck does not belong to map');
  const jobs: Partial<Record<Seat, Job[]>> = {};
  for (const seat of SEATS.slice(0, seatCount)) {
    jobs[seat] = [...decks[family]![seat]].map(letter => {
      const validBerths = [...PAIRS[letter]!] as [Berth, Berth];
      return { validBerths, preferredBerth: validBerths[randomInt(2)]!, flavor: FLAVORS[randomInt(FLAVORS.length)]! };
    });
  }
  return { deckFamily: family, jobs };
}

export function alternateDeck(deckFamily: string): string {
  if (!Object.hasOwn(decks, deckFamily)) throw new Error('Unknown deck');
  return `${deckFamily.slice(0, 2)}${deckFamily.endsWith('a') ? 'b' : 'a'}`;
}

export function getCatalog(): Pick<Graph, 'mapId' | 'title' | 'hint'>[] {
  return MAP_IDS.map(mapId => ({ mapId, title: { ...maps[mapId]!.title }, hint: { ...maps[mapId]!.hint } }));
}
