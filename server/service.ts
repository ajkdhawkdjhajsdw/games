import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomBytes, randomUUID } from 'node:crypto';
import { Auth, ApiError, fail, hash, safeName, verifyTelegram, type AuthConfig } from './auth.ts';
import { Store, type StoredUser } from './store.ts';
import { alternateDeck, CONTENT_VERSION, getCatalog, getGraph, instantiateJobs, MAP_IDS } from './content.ts';
import { chooseBotAction } from './bot.ts';
import { createState, isLegalIntent, isLegalSignal, legalMoves, resolveRound, RULES_VERSION, score, SEATS, startNextRound, type GameState, type Intent, type Outcome, type RoundEvent, type Seat, type SeatCount, type Signal } from './rules.ts';

type Phase = 'lobby' | 'starting' | 'planning' | 'intermission' | 'ended' | 'closed' | 'aborted';
interface Player {
  seat: Seat; userId: string | null; name: string; bot: boolean; ready: boolean; joinedAt: number;
  clientId: string | null; lastSeen: number; connected: boolean; left: boolean; allowBot: boolean;
  controlEpoch: number; seq: number; privateRevision: number; ack: boolean; humanCommits: number;
  destination: Intent; committed: boolean; signal: Signal | null; missed: number;
  observerClientId?: string | null;
  pendingHuman?: { clientId: string; lastSeen: number }; pendingBot?: boolean;
  botPlan?: { intent: Intent; signal: Signal | null; commitAt: number };
}
interface Ack { accepted: true; commandId: string; round: number; committed: boolean; revision: number }
interface Result { scenarioId: string; mapId: string; capacity: SeatCount; status: string; reason: string; score: number; deliveries: number; preferredDeliveries: number; congestion: number; round: number; mode: string; rulesVersion: string; contentVersion: string }
export interface Room {
  id: string; revision: number; publicRevision: number; configVersion: number; mapId: string; capacity: SeatCount;
  phase: Phase; hostSeat: Seat | null; untimed: boolean; everBotControlled: boolean; players: Player[];
  inviteHash: string; inviteExpiresAt: number; updatedAt: number; lastTick: number;
  scenarioId: string | null; deckFamily?: string; nextDeck?: string; state?: GameState;
  startExpiresAt?: number; startsAt?: number; roundStartedAt?: number; deadlineAt?: number; nextRoundStartsAt?: number;
  absentSince?: number; endedAt?: number; provisional?: boolean; result: Result | null;
  history: { round: number; events: RoundEvent[]; deliveries: number; congestion: number }[];
  receipts: Record<string, { digest: string; ack: Ack }>;
  removedUserIds?: string[];
}
export interface ServiceOptions extends AuthConfig { databasePath?: string; now?: () => number; tickMs?: number }
const active = (r: Room) => ['starting', 'planning', 'intermission'].includes(r.phase);
const mode = (r: Room) => r.untimed ? 'untimed' : r.everBotControlled ? 'mixed' : 'human-only';
const uuid = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
const text = (v: unknown, max = 128): string => typeof v === 'string' && v.length <= max ? v : fail(400, 'INVALID_REQUEST', 'Check the request and try again.');
function player(seat: Seat, user: StoredUser | null, clientId: string | null, now: number): Player {
  return { seat, userId: user?.id ?? null, name: user?.name ?? `Captain ${seat}`, bot: !user, ready: !user, joinedAt: now, clientId, lastSeen: now, connected: !!user, left: false, allowBot: false, controlEpoch: 1, seq: 0, privateRevision: 0, ack: !user, humanCommits: 0, destination: { type: 'wait' }, committed: false, signal: null, missed: 0 };
}
function destination(body: Record<string, unknown>): Intent {
  const value = body.destination ?? body.destinationNodeId;
  if (value === null || value === 'WAIT' || value === 'wait') return { type: 'wait' };
  if (typeof value === 'string' && value.length <= 16) return { type: 'move', to: value };
  return fail(400, 'INVALID_DESTINATION', 'Choose a permitted adjacent node or Wait.');
}
function signalValue(value: unknown, seat: Seat): Signal | null {
  if (value === null) return null;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fail(400, 'INVALID_SIGNAL', 'Choose a signal and a permitted node.');
  const s = value as Record<string, unknown>;
  return { seat, type: text(s.type ?? s.kind, 8) as Signal['type'], node: text(s.node, 16) };
}

export class HarborService {
  readonly store: Store;
  readonly auth: Auth;
  readonly server;
  readonly now: () => number;
  private timer: ReturnType<typeof setInterval> | undefined;
  private limits = new Map<string, { tokens: number; at: number }>();
  constructor(options: ServiceOptions) {
    this.store = new Store(options.databasePath);
    this.auth = new Auth(this.store, options);
    this.now = options.now ?? Date.now;
    this.server = createServer((req, res) => { void this.handle(req, res); });
    this.server.requestTimeout = 10_000;
    this.server.headersTimeout = 10_000;
    this.recover();
    if (options.tickMs !== 0) { this.timer = setInterval(() => this.tick(), options.tickMs ?? 250); this.timer.unref(); }
  }
  close(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    return new Promise((resolve, reject) => this.server.close(error => { this.store.close(); error && (error as NodeJS.ErrnoException).code !== 'ERR_SERVER_NOT_RUNNING' ? reject(error) : resolve(); }));
  }
  private rate(key: string, capacity: number, perSecond: number): void {
    const now = this.now();
    const bucket = this.limits.get(key) ?? { tokens: capacity, at: now };
    bucket.tokens = Math.min(capacity, bucket.tokens + Math.max(0, now - bucket.at) / 1000 * perSecond);
    bucket.at = now;
    this.limits.set(key, bucket);
    if (bucket.tokens < 1) fail(429, 'RATE_LIMITED', 'Please wait before trying again.');
    bucket.tokens--;
    if (this.limits.size > 10_000) for (const [id, b] of this.limits) if (now - b.at > 3_600_000) this.limits.delete(id);
  }
  private save(r: Room, now: number, publicChange = true): void {
    if (publicChange) r.publicRevision++;
    this.store.saveRoom(r, now);
  }
  private member(r: Room, user: StoredUser): Player {
    if (r.removedUserIds?.includes(user.id)) fail(403, 'ROOM_UNAVAILABLE', 'This room is not available.');
    return r.players.find(p => p.userId === user.id && !p.left) ?? fail(403, 'NOT_MEMBER', 'This room is not available.');
  }
  private host(r: Room, p: Player): void { if (r.hostSeat !== p.seat) fail(403, 'HOST_REQUIRED', 'Only the lobby host can do that.'); }
  private available(id: string): Room { return this.store.getRoom<Room>(id) ?? fail(404, 'ROOM_UNAVAILABLE', 'This room is not available.'); }
  private safety(r: Room): void {
    const humans = r.players.filter(p => p.userId && !p.left);
    if (humans.some(a => humans.some(b => a !== b && this.store.blocked(a.userId!, b.userId!)))) fail(403, 'ROOM_UNAVAILABLE', 'This room is not available.');
  }
  private presence(r: Room, p: Player, clientId: string, now: number): boolean {
    const before = { connected: p.connected, hostSeat: r.hostSeat, provisional: r.provisional };
    if (p.connected && (p.clientId === clientId || (p.bot && p.observerClientId === clientId))) p.lastSeen = now;
    else if (!active(r) && !r.provisional && !p.bot) { p.clientId = clientId; p.connected = true; p.lastSeen = now; }
    else {
      // A new or expired lease observes immediately but only controls at a boundary.
      if (!p.connected || p.pendingHuman?.clientId === clientId) p.pendingHuman = { clientId, lastSeen: now };
    }
    if (p.pendingHuman?.clientId === clientId) { p.pendingHuman.lastSeen = now; p.lastSeen = now; p.connected = true; }
    if (r.provisional && p.connected) { r.provisional = false; this.finalize(r, now); }
    this.rehost(r);
    return before.connected !== p.connected || before.hostSeat !== r.hostSeat || before.provisional !== r.provisional;
  }
  private rehost(r: Room): void {
    if (r.players.some(p => p.seat === r.hostSeat && p.userId && p.connected && !p.left)) return;
    r.hostSeat = r.players.filter(p => p.userId && p.connected && !p.left).sort((a,b) => a.joinedAt-b.joinedAt || a.userId!.localeCompare(b.userId!))[0]?.seat ?? null;
  }
  private blockAndLeave(r: Room, p: Player, user: StoredUser, seat: unknown, now: number): void {
    const target = r.players.find(other => other.seat === seat && other !== p && other.userId);
    if (!target) fail(400, 'INVALID_REQUEST', 'Choose a human participant.');
    this.store.db.prepare('INSERT OR IGNORE INTO blocks VALUES (?,?)').run(user.id, target.userId!);
    p.left = true; p.connected = false; p.allowBot = false; delete p.pendingHuman; delete p.pendingBot;
    if (r.phase === 'lobby') { r.players = r.players.filter(other => other !== p); r.configVersion++; r.players.forEach(other => { other.ready = !other.userId; }); this.rotate(r, now); }
    this.rehost(r);
    if (!r.players.some(other => other.userId && !other.left) && r.phase !== 'ended') this.closeRoom(r, 'ALL_LEFT', now);
  }
  private begin(r: Room, now: number): void {
    this.safety(r);
    const host = r.players.find(p => p.seat === r.hostSeat);
    r.players.sort((a,b) => a.joinedAt - b.joinedAt);
    r.players.forEach((p, index) => { p.seat = SEATS[index]!; });
    r.hostSeat = host?.seat ?? null;
    const jobs = instantiateJobs(r.mapId, r.capacity, r.nextDeck);
    r.deckFamily = jobs.deckFamily; delete r.nextDeck;
    r.state = createState(getGraph(r.mapId, r.capacity), jobs.jobs);
    r.scenarioId = randomUUID(); r.history = []; r.result = null; r.receipts = {};
    r.phase = 'starting'; r.startExpiresAt = now + 10_000; delete r.startsAt;
    r.everBotControlled = false;
    for (const p of r.players) { p.ack = !p.userId; p.controlEpoch++; p.seq = 0; p.humanCommits = 0; p.privateRevision++; p.committed = false; p.destination = { type: 'wait' }; p.signal = null; p.missed = 0; delete p.pendingHuman; delete p.pendingBot; delete p.botPlan; }
  }
  private boundary(r: Room, startsAt: number): void {
    r.phase = 'planning'; r.roundStartedAt = startsAt;
    r.deadlineAt = r.untimed ? undefined : startsAt + 20_000;
    delete r.nextRoundStartsAt;
    for (const p of r.players) {
      const safe = !p.userId || !r.players.some(other => other.userId && other !== p && this.store.blocked(p.userId!, other.userId));
      if (p.pendingHuman && p.connected && !p.left && safe && startsAt - p.pendingHuman.lastSeen < 15_000) {
        p.bot = false; p.clientId = p.pendingHuman.clientId; delete p.observerClientId; p.controlEpoch++;
      } else if (p.pendingBot && p.allowBot && safe) { p.observerClientId = p.clientId; p.bot = true; p.clientId = null; p.controlEpoch++; }
      delete p.pendingHuman; delete p.pendingBot; delete p.botPlan;
      p.seq = 0; p.destination = { type: 'wait' }; p.committed = false; p.signal = null; p.privateRevision++;
      if (p.bot) r.everBotControlled = true;
    }
  }
  private finalize(r: Room, now: number): void {
    if (!r.result || r.provisional) return;
    const users = r.players.filter(p => p.userId && !p.left).map(p => p.userId!);
    this.store.db.prepare('INSERT OR IGNORE INTO results VALUES (?,?,?,?)').run(r.scenarioId!, JSON.stringify(users), JSON.stringify(r.result), now);
    if (r.result.status === 'success' && !r.untimed) for (const p of r.players) {
      if (!p.userId || p.left || p.humanCommits < 2) continue;
      this.store.db.prepare('INSERT OR IGNORE INTO mastery VALUES (?,?,?)').run(p.userId, `${CONTENT_VERSION}:${r.mapId}:${r.deckFamily}`, r.everBotControlled ? 'practice' : 'human-only');
    }
  }
  private finish(r: Room, outcome: NonNullable<Outcome>, now: number): void {
    const s = r.state!;
    r.phase = 'ended'; r.endedAt = now;
    r.result = { scenarioId: r.scenarioId!, mapId: r.mapId, capacity: r.capacity, ...outcome, score: score(s), deliveries: s.deliveries, preferredDeliveries: s.preferredDeliveries, congestion: s.congestion, round: s.round, mode: mode(r), rulesVersion: RULES_VERSION, contentVersion: CONTENT_VERSION };
    for (const p of r.players) { delete p.pendingHuman; delete p.pendingBot; }
    r.provisional = !r.players.some(p => p.userId && p.connected && !p.left);
    this.finalize(r, now);
  }
  private closeRoom(r: Room, reason: string, now: number, aborted = false): void {
    r.phase = aborted ? 'aborted' : 'closed'; r.endedAt = now; r.provisional = false;
    r.result = { scenarioId: r.scenarioId ?? '', mapId: r.mapId, capacity: r.capacity, status: aborted ? 'aborted' : 'closed', reason, score: 0, deliveries: r.state?.deliveries ?? 0, preferredDeliveries: 0, congestion: r.state?.congestion ?? 0, round: r.state?.round ?? 0, mode: mode(r), rulesVersion: RULES_VERSION, contentVersion: CONTENT_VERSION };
    for (const p of r.players) { delete p.pendingHuman; delete p.pendingBot; }
  }
  private resolve(r: Room, at: number): void {
    const intents: Partial<Record<Seat, Intent>> = {};
    for (const p of r.players) {
      if (p.committed) intents[p.seat] = p.destination;
      else if (!p.bot) { p.missed++; if (p.allowBot) p.pendingBot = true; }
    }
    const resolved = resolveRound(r.state!, intents);
    r.state = resolved.state;
    r.history.push({ round: r.state.round, events: resolved.events, deliveries: r.state.deliveries, congestion: r.state.congestion });
    if (resolved.outcome) this.finish(r, resolved.outcome, at);
    else { r.phase = 'intermission'; r.nextRoundStartsAt = at + 1500; }
  }
  private bots(r: Room, now: number): boolean {
    if (r.phase !== 'planning' || (!r.untimed && now < r.roundStartedAt! + 6000)) return false;
    let changed = false;
    for (const p of r.players.filter(p => p.bot && !p.committed)) {
      const ship = r.state!.ships.find(s => s.seat === p.seat)!;
      if (!p.botPlan) {
        const plan = chooseBotAction({ seat: p.seat, node: ship.node!, job: structuredClone(ship.jobs[ship.jobIndex]!), graph: structuredClone(r.state!.graph), ships: r.players.map(other => ({ seat: other.seat, node: r.state!.ships.find(s => s.seat === other.seat)!.node, isBot: other.bot })), signals: r.players.flatMap(other => other.signal ? [{ ...other.signal }] : []), round: r.state!.round, deadline: r.deadlineAt ?? 0, deliveries: r.state!.deliveries, congestion: r.state!.congestion, control: 'bot' }, `${r.scenarioId}:${p.seat}`);
        p.botPlan = { intent: plan.intent, signal: plan.signal, commitAt: r.untimed ? now : r.roundStartedAt! + plan.commitOffsetMs };
        p.signal = plan.signal; changed = true;
      }
      if (now >= p.botPlan.commitAt) { p.destination = p.botPlan.intent; p.committed = true; changed = true; }
    }
    return changed;
  }
  private advance(r: Room, now: number): boolean {
    let changed = false;
    for (const p of r.players) if (p.userId && p.connected && now >= p.lastSeen + 15_000) { p.connected = false; changed = true; }
    this.rehost(r);
    const present = r.players.some(p => p.userId && p.connected && !p.left);
    if (present) { if (r.absentSince !== undefined) changed = true; delete r.absentSince; }
    else if (r.absentSince === undefined) { r.absentSince = Math.min(now, Math.max(...r.players.filter(p => p.userId && !p.left).map(p => p.lastSeen + 15_000), now - 30_000)); changed = true; }
    if ((active(r) || r.provisional) && r.absentSince !== undefined && now >= r.absentSince + 30_000) { this.closeRoom(r, 'ABANDONED', now); return true; }
    if (r.phase === 'lobby' && now >= r.updatedAt + 900_000) { this.closeRoom(r, 'LOBBY_EXPIRED', now); return true; }
    if (r.phase === 'ended' && !r.provisional && now >= r.endedAt! + 600_000) { r.phase = 'closed'; return true; }
    if (r.phase === 'starting') {
      if (r.startsAt !== undefined && now >= r.startsAt) { this.boundary(r, r.startsAt); changed = true; }
      else if (r.startsAt === undefined && now >= r.startExpiresAt!) { r.phase = 'lobby'; r.state = undefined; r.players.forEach(p => { p.ready = !p.userId; }); changed = true; }
    }
    if (r.phase === 'intermission' && now >= r.nextRoundStartsAt!) { const at = r.nextRoundStartsAt!; r.state = startNextRound(r.state!); this.boundary(r, at); changed = true; }
    if (r.phase === 'planning') {
      changed = this.bots(r, now) || changed;
      if ((!r.untimed && now >= r.deadlineAt!) || (r.untimed && r.players.every(p => p.committed))) { this.resolve(r, now); changed = true; }
    }
    return changed;
  }
  private recover(): void {
    const now = this.now();
    for (const r of this.store.allRooms<Room>()) this.store.transaction(() => {
      if (active(r) && now - r.lastTick > 30_000) this.closeRoom(r, 'SERVICE_RECOVERING', now, true);
      else this.advance(r, now);
      r.lastTick = now; this.save(r, now);
    });
  }
  tick(): void {
    const now = this.now();
    for (const r of this.store.allRooms<Room>()) {
      if (!active(r) && !r.provisional && r.phase !== 'lobby' && r.phase !== 'ended') continue;
      try { this.store.transaction(() => { const changed = this.advance(r, now); if (changed || now - r.lastTick >= 5000) { r.lastTick = now; this.save(r, now, changed); } }); }
      catch { this.store.transaction(() => { const current = this.available(r.id); this.closeRoom(current, 'SERVICE_RECOVERING', now, true); this.save(current, now); }); }
    }
    this.store.db.prepare('DELETE FROM outbox WHERE created_at<?').run(now - 7 * 86_400_000);
    for (const r of this.store.allRooms<Room>()) if (!active(r) && r.endedAt && now > r.endedAt + 86_400_000 && r.state) this.store.transaction(() => {
      delete r.state; delete r.deckFamily; delete r.nextDeck; r.receipts = {};
      for (const p of r.players) { p.destination = { type: 'wait' }; delete p.botPlan; }
      this.save(r, now, false);
    });
  }
  snapshot(r: Room, user: StoredUser, clientId: string, now: number) {
    const p = this.member(r, user);
    const ship = r.state?.ships.find(s => s.seat === p.seat);
    const job = ship && ship.node !== null && r.phase !== 'ended' && r.phase !== 'closed' && r.phase !== 'aborted' ? ship.jobs[ship.jobIndex] : undefined;
    return {
      id: r.id, phase: r.phase.toUpperCase(), mapId: r.mapId, capacity: r.capacity, hostSeat: r.hostSeat,
      mode: mode(r).toUpperCase().replace('-', '_'), untimed: r.untimed, revision: r.publicRevision, configVersion: r.configVersion,
      scenarioId: r.scenarioId, round: r.state?.round ?? r.result?.round ?? 0,
      deadlineAt: r.deadlineAt ?? null, startsAt: r.startsAt ?? null, startAt: r.startsAt ?? null,
      nextRoundStartsAt: r.nextRoundStartsAt ?? null, serverNow: now,
      deliveries: r.state?.deliveries ?? r.result?.deliveries ?? 0, congestion: r.state?.congestion ?? r.result?.congestion ?? 0,
      graph: getGraph(r.mapId, r.capacity),
      players: r.players.map(other => ({
        seat: other.seat, name: other.name, bot: other.bot,
        node: r.state?.ships.find(s => s.seat === other.seat)?.node ?? (r.phase === 'lobby' ? `E${other.seat}` : null),
        ready: other.ready, committed: other.committed, connected: other.connected && !other.left,
        signal: other.signal ? { seat: other.signal.seat, type: other.signal.type, kind: other.signal.type, node: other.signal.node } : null,
      })),
      owner: {
        seat: p.seat, job: job ? { valid: [...job.validBerths], preferred: job.preferredBerth, cargo: job.flavor } : null,
        legalMoves: r.state?.phase === 'planning' ? legalMoves(r.state, p.seat) : [],
        committed: p.committed, destination: p.destination.type === 'move' ? p.destination.to : 'WAIT',
        controlEpoch: p.controlEpoch, seq: p.seq, privateRevision: p.privateRevision,
        canControl: r.phase === 'planning' && !p.bot && p.connected && p.clientId === clientId && !p.pendingHuman && !p.committed,
        acknowledged: p.ack, allowBot: p.allowBot, botConsent: p.allowBot,
        takeoverOffered: p.missed > 0, pendingControl: !!p.pendingHuman || !!p.pendingBot,
      },
      result: r.provisional || !r.result ? null : {
        scenarioId: r.result.scenarioId, mapId: r.result.mapId, capacity: r.result.capacity,
        status: r.result.status, outcome: r.result.status.toUpperCase(), reason: r.result.reason, score: r.result.score,
        deliveries: r.result.deliveries, preferredDeliveries: r.result.preferredDeliveries,
        congestion: r.result.congestion, round: r.result.round, mode: r.result.mode,
        rulesVersion: r.result.rulesVersion, contentVersion: r.result.contentVersion,
      },
      provisional: !!r.provisional,
      history: r.history.map(h => ({
        round: h.round, deliveries: h.deliveries, congestion: h.congestion,
        conflicts: h.events.flatMap(e => e.type === 'contention' ? [e.node] : e.type === 'swap' ? e.nodes : []),
        events: h.events.map(e => e.type === 'contention' ? { type: e.type, node: e.node, seats: [...e.seats] }
          : e.type === 'swap' ? { type: e.type, nodes: [...e.nodes], seats: [...e.seats] }
          : { type: e.type, seat: e.seat, from: e.from, to: e.to }),
      })),
    };
  }
  private rotate(r: Room, now: number): string { const token = randomBytes(24).toString('base64url'); r.inviteHash = hash(token); r.inviteExpiresAt = now + 1_800_000; return token; }
  private create(user: StoredUser, clientId: string, body: Record<string, unknown>, now: number) {
    const capacity = body.capacity ?? 2;
    const bots = body.bots ?? 0;
    const mapId = body.mapId ?? 'M01';
    if (![2,3,4].includes(Number(capacity)) || typeof capacity !== 'number' || !Number.isInteger(bots) || Number(bots) < 0 || Number(bots) >= capacity || !MAP_IDS.includes(String(mapId)) || (body.untimed !== undefined && typeof body.untimed !== 'boolean')) fail(400, 'INVALID_REQUEST', 'Choose a valid harbor and crew size.');
    const r: Room = { id: randomUUID(), revision: 0, publicRevision: 0, configVersion: 1, mapId: String(mapId), capacity: capacity as SeatCount, phase: 'lobby', hostSeat: 'A', untimed: body.untimed === true, everBotControlled: Number(bots) > 0, players: [player('A', user, clientId, now)], inviteHash: '', inviteExpiresAt: 0, updatedAt: now, lastTick: now, scenarioId: null, result: null, history: [], receipts: {} };
    for (let i = 0; i < Number(bots); i++) r.players.push(player(SEATS[i+1]!, null, null, now));
    const inviteToken = this.rotate(r, now);
    if (r.players.length === capacity && Number(bots) === capacity - 1) { r.players[0]!.ready = true; this.begin(r, now); }
    this.save(r, now);
    return { room: this.snapshot(r, user, clientId, now), inviteToken };
  }
  private command(r: Room, p: Player, user: StoredUser, clientId: string, body: Record<string, unknown>, now: number, presenceChanged = false): { ack: Ack; inviteToken?: string } {
    const commandId = text(body.commandId);
    if (!uuid.test(commandId)) fail(400, 'INVALID_REQUEST', 'A command identifier is required.');
    const aliases: Record<string, string> = { 'room.ready': 'ready', 'room.start': 'start', 'room.leave': 'leave', 'move.choose': 'choose', 'signal.set': 'signal', 'move.commit': 'commit', 'control.reclaim': 'reclaim', 'control.acceptBot': 'acceptBot', 'state.resync': 'heartbeat', 'start.ack': 'ack', 'room.rotateInvite': 'invite', 'room.botConsent': 'allowBot', 'room.rematch': 'rematch' };
    const type = aliases[String(body.type)] ?? String(body.type);
    const key = `${user.id}:${commandId}`;
    const digest = hash(JSON.stringify(body));
    const previous = r.receipts[key];
    if (previous) { if (previous.digest !== digest) fail(409, 'COMMAND_REUSED', 'Use a new command identifier.'); this.save(r, now, presenceChanged); return { ack: previous.ack }; }
    let inviteToken: string | undefined;
    const gameplay = ['choose','signal','commit'].includes(type);
    if (gameplay) {
      this.rate(`${user.id}:${type}`, type === 'signal' ? 8 : type === 'choose' ? 20 : 8, type === 'choose' ? 10 : 4);
      if (r.phase !== 'planning' || (!r.untimed && now >= r.deadlineAt!)) fail(409, 'ROUND_CLOSED', 'This round has already closed.');
      if (body.scenarioId !== r.scenarioId || body.round !== r.state!.round) fail(409, 'STALE_ROUND', 'Refresh the current round.');
      if (p.bot || !p.connected || p.clientId !== clientId || p.pendingHuman || body.controlEpoch !== p.controlEpoch) fail(409, 'STALE_CONTROL', 'Control returns at a round boundary.');
      if (p.committed) fail(409, 'ALREADY_COMMITTED', 'Your route and signal are locked.');
      const seq = body.seq ?? body.seatCommandSeq;
      if (!Number.isSafeInteger(seq) || Number(seq) <= p.seq) fail(409, 'STALE_COMMAND', 'Refresh the current round.');
      if (type === 'choose' || type === 'commit') {
        const intent = destination(body);
        if (!isLegalIntent(r.state!, p.seat, intent)) fail(400, 'INVALID_DESTINATION', 'Choose a permitted adjacent node or Wait.');
        const finalSignal = type === 'commit' ? signalValue(body.signal, p.seat) : p.signal;
        if (finalSignal && !isLegalSignal(r.state!.graph, p.seat, finalSignal)) fail(400, 'INVALID_SIGNAL', 'Choose a permitted signal node.');
        p.destination = intent;
        if (type === 'commit') { p.signal = finalSignal; p.committed = true; p.humanCommits++; }
      } else {
        const signal = signalValue(body.signal, p.seat);
        if (signal && !isLegalSignal(r.state!.graph, p.seat, signal)) fail(400, 'INVALID_SIGNAL', 'Choose a permitted signal node.');
        p.signal = signal;
      }
      p.seq = Number(seq); p.privateRevision++;
    } else if (type === 'ack') {
      if (r.phase !== 'starting') fail(409, 'PHASE_CLOSED', 'The start window has closed.');
      if (body.scenarioId !== r.scenarioId || p.clientId !== clientId) fail(409, 'STALE_CONTROL', 'Refresh before starting.');
      p.ack = true;
      if (r.players.every(other => other.ack) && r.startsAt === undefined) r.startsAt = now + 3000;
    } else if (type === 'ready' || type === 'start' || type === 'configure' || type === 'remove') {
      if (r.phase !== 'lobby') fail(409, 'PHASE_CLOSED', 'Lobby settings are locked.');
      if (body.configVersion === undefined ? body.revision !== r.publicRevision : body.configVersion !== r.configVersion) fail(409, 'STALE_CONFIG', 'The lobby changed. Review it before continuing.');
      if (type === 'ready') { if (typeof body.ready !== 'boolean') fail(400, 'INVALID_REQUEST', 'Choose readiness.'); p.ready = body.ready; }
      else {
        this.host(r, p);
        if (type === 'start') { if (r.players.length !== r.capacity || r.players.some(other => other.userId && (!other.ready || !other.connected || other.left))) fail(409, 'NOT_READY', 'All captains must be connected and ready.'); this.begin(r, now); }
        if (type === 'configure') { if (!MAP_IDS.includes(String(body.mapId))) fail(400, 'INVALID_REQUEST', 'Choose a harbor.'); r.mapId = String(body.mapId); r.configVersion++; r.players.forEach(other => { other.ready = !other.userId; }); }
        if (type === 'remove') {
          const target = r.players.find(other => other.seat === body.seat && other !== p);
          if (!target) fail(400, 'INVALID_REQUEST', 'Choose a lobby participant.');
          if (target.userId) (r.removedUserIds ??= []).push(target.userId);
          r.players = r.players.filter(other => other !== target); r.configVersion++; r.players.forEach(other => { other.ready = !other.userId; }); inviteToken = this.rotate(r, now);
        }
      }
    } else if (type === 'invite') { this.host(r, p); if (r.phase !== 'lobby') fail(409, 'PHASE_CLOSED', 'Invites are available in the lobby.'); inviteToken = this.rotate(r, now); }
    else if (type === 'allowBot') { const consent = body.allowBot ?? body.enabled; if (typeof consent !== 'boolean') fail(400, 'INVALID_REQUEST', 'Choose bot consent.'); p.allowBot = consent; if (!p.allowBot) delete p.pendingBot; }
    else if (type === 'safety.report') {
      this.rate(`report:${user.id}`, 5, 5/3600);
      const category = body.category === 'name' ? 'unsafe_name' : body.category === 'technical' ? 'other' : text(body.category, 32);
      if (!['harassment','unsafe_name','cheating','other'].includes(category)) fail(400, 'INVALID_REQUEST', 'Choose a report category.');
      this.store.db.prepare('INSERT INTO reports VALUES (?,?,?,?,?,?,?)').run(randomUUID(), user.id, r.id, r.scenarioId, category, text(body.detail ?? '', 1000), now);
    } else if (type === 'safety.block') {
      this.blockAndLeave(r, p, user, body.seat, now);
    }
    else if (type === 'acceptBot' || type === 'reclaim') {
      if (!active(r) || body.scenarioId !== r.scenarioId) fail(409, 'PHASE_CLOSED', 'Control requests are available during a scenario.');
      this.safety(r);
      if (type === 'acceptBot') { if (p.missed < 1) fail(409, 'NO_TAKEOVER_OFFER', 'Bot replacement is offered after a missed round.'); p.allowBot = true; p.pendingBot = true; }
      else { p.pendingHuman = { clientId, lastSeen: now }; p.connected = true; p.lastSeen = now; }
    } else if (type === 'leave') {
      if (typeof body.allowBot !== 'boolean') fail(400, 'INVALID_REQUEST', 'Choose whether a bot may help after you leave.');
      p.left = true; p.connected = false; p.allowBot = body.allowBot; delete p.pendingHuman;
      p.pendingBot = p.allowBot;
      if (r.phase === 'lobby') { r.players = r.players.filter(other => other !== p); r.configVersion++; r.players.forEach(other => { other.ready = !other.userId; }); this.rotate(r, now); }
      this.rehost(r);
      if (!r.players.some(other => other.userId && !other.left) && r.phase !== 'ended') this.closeRoom(r, 'ALL_LEFT', now);
    } else if (type === 'rematch') {
      this.host(r, p);
      if (r.phase !== 'ended' || r.provisional || now >= r.endedAt! + 600_000) fail(409, 'PHASE_CLOSED', 'Create a fresh room to play again.');
      const next = body.nextHarbor === true || body.nextMap === true;
      r.nextDeck = !next && r.deckFamily ? alternateDeck(r.deckFamily) : undefined;
      if (next) r.mapId = MAP_IDS[(MAP_IDS.indexOf(r.mapId)+1) % MAP_IDS.length]!;
      r.players = r.players.filter(other => !other.userId || (other.connected && !other.left));
      r.players.forEach((other, i) => { other.seat = SEATS[i]!; other.bot = !other.userId; other.ready = !other.userId; other.controlEpoch++; other.ack = false; other.committed = false; other.signal = null; other.destination = { type: 'wait' }; });
      r.hostSeat = p.seat; r.phase = 'lobby'; r.state = undefined; r.scenarioId = null; r.result = null; r.history = []; r.configVersion++; r.everBotControlled = r.players.some(other => other.bot); delete r.endedAt; delete r.deadlineAt; r.receipts = {}; inviteToken = this.rotate(r, now);
    } else if (type !== 'heartbeat') fail(400, 'INVALID_REQUEST', 'Unknown command.');
    r.updatedAt = now;
    const publicChange = presenceChanged || (type !== 'choose' && type !== 'heartbeat');
    const advanced = this.advance(r, now);
    const ack: Ack = { accepted: true, commandId, round: r.state?.round ?? 0, committed: p.committed, revision: r.publicRevision + (publicChange || advanced ? 1 : 0) };
    r.receipts[key] = { digest, ack };
    if (Object.keys(r.receipts).length > 4000) delete r.receipts[Object.keys(r.receipts)[0]!];
    this.save(r, now, publicChange || advanced);
    return { ack, ...(inviteToken ? { inviteToken } : {}) };
  }
  private async body(req: IncomingMessage): Promise<Record<string, unknown>> {
    if (!String(req.headers['content-type']).startsWith('application/json')) fail(415, 'INVALID_REQUEST', 'Send JSON.');
    let bytes = 0; const chunks: Buffer[] = [];
    for await (const chunk of req) { bytes += chunk.length; if (bytes > 8192) fail(413, 'INVALID_REQUEST', 'Request is too large.'); chunks.push(Buffer.from(chunk)); }
    try { const value: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8')); if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(); return value as Record<string, unknown>; }
    catch { return fail(400, 'INVALID_REQUEST', 'Send a valid JSON object.'); }
  }
  private async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff');
    const send = (status: number, value: unknown) => { res.writeHead(status); res.end(JSON.stringify(value)); };
    try {
      this.auth.origin(req);
      const path = new URL(req.url ?? '/', 'http://localhost').pathname;
      if (path === '/api/health' && req.method === 'GET') { send(200, { ok: true }); return; }
      const clientId = text(req.headers['x-client-id'], 80);
      if (!/^[A-Za-z0-9_-]{8,80}$/.test(clientId)) fail(400, 'INVALID_REQUEST', 'A client identifier is required.');
      const body = req.method === 'POST' ? await this.body(req) : {};
      const now = this.now();
      if (path === '/api/auth/dev' && req.method === 'POST') {
        if (this.auth.config.production || !this.auth.config.allowDevAuth) fail(404, 'ROOM_UNAVAILABLE', 'This service is not available.');
        this.rate(`auth:${req.socket.remoteAddress}`, 20, 20/60);
        const user = this.auth.login(res, `dev:${randomUUID()}`, safeName(body.name), now);
        send(200, { user: { id: user.id, name: user.name }, devAuth: true, devAuthEnabled: true }); return;
      }
      if (path === '/api/auth/telegram' && req.method === 'POST') {
        this.rate(`auth:${req.socket.remoteAddress}`, 20, 20/60);
        if (!this.auth.config.botToken) fail(503, 'AUTH_UNAVAILABLE', 'Telegram authentication is not configured.');
        const identity = verifyTelegram(text(body.initData, 8192), this.auth.config.botToken, now);
        const user = this.auth.login(res, identity.subject, identity.name, now);
        send(200, { user: { id: user.id, name: user.name }, devAuth: false, devAuthEnabled: false }); return;
      }
      const user = this.auth.session(req, now);
      if (path === '/api/session' && req.method === 'GET') { send(200, { user: user ? { id: user.id, name: user.name } : null, devAuth: this.auth.config.allowDevAuth && !this.auth.config.production, devAuthEnabled: this.auth.config.allowDevAuth && !this.auth.config.production }); return; }
      if (!user) fail(401, 'AUTH_REQUIRED', 'Sign in to Quiet Harbor.');
      this.rate(`user:${user.id}`, 120, 20);
      if (path === '/api/auth/logout' && req.method === 'POST') { this.auth.logout(req, res); send(200, { ok: true }); return; }
      if (path === '/api/maps' && req.method === 'GET') { send(200, { maps: getCatalog() }); return; }
      if (path === '/api/profile' && req.method === 'GET') {
        const tracks = this.store.db.prepare('SELECT track,COUNT(*) AS count FROM mastery WHERE user_id=? GROUP BY track').all(user.id);
        send(200, { user: { id: user.id, name: user.name }, mastery: { human: Number(tracks.find(t => t.track === 'human-only')?.count ?? 0), humanOnly: Number(tracks.find(t => t.track === 'human-only')?.count ?? 0), practice: Number(tracks.find(t => t.track === 'practice')?.count ?? 0) } }); return;
      }
      if (path === '/api/results' && req.method === 'GET') {
        const results = this.store.db.prepare('SELECT result,users FROM results ORDER BY created_at DESC').all().filter(row => (JSON.parse(String(row.users)) as string[]).includes(user.id)).slice(0,50).map(row => JSON.parse(String(row.result)));
        send(200, { results }); return;
      }
      if (path === '/api/rooms' && req.method === 'POST') {
        this.rate(`create:${user.id}`, 5, 5/60);
        send(201, this.store.transaction(() => this.create(user, clientId, body, now))); return;
      }
      if (path === '/api/join' && req.method === 'POST') {
        this.rate(`join:${user.id}`, 10, 10/60); this.rate(`join-ip:${req.socket.remoteAddress}`, 30, 30/60);
        const token = text(body.token, 64);
        const result = this.store.transaction(() => {
          const r = this.store.allRooms<Room>().find(room => room.inviteHash === hash(token));
          if (!r || r.inviteExpiresAt <= now || r.phase !== 'lobby') fail(404, 'INVITE_UNAVAILABLE', 'This invite expired, was replaced, or the room has started.');
          if (this.advance(r, now)) this.save(r, now);
          if (r.phase !== 'lobby') fail(404, 'INVITE_UNAVAILABLE', 'This invite is no longer available.');
          if (r.removedUserIds?.includes(user.id)) fail(404, 'ROOM_UNAVAILABLE', 'This room is not available.');
          let p = r.players.find(p => p.userId === user.id && !p.left);
          if (!p) {
            if (r.players.length >= r.capacity || r.players.some(other => other.userId && this.store.blocked(user.id, other.userId))) fail(404, 'ROOM_UNAVAILABLE', 'This room is not available.');
            const seat = SEATS.find(seat => !r.players.some(other => other.seat === seat))!;
            p = player(seat, user, clientId, now); r.players.push(p); r.players.sort((a,b) => a.seat.localeCompare(b.seat)); r.configVersion++; r.players.forEach(other => { other.ready = !other.userId; });
          }
          this.presence(r, p, clientId, now); r.updatedAt = now; this.save(r, now);
          return { room: this.snapshot(r, user, clientId, now) };
        }); send(200, result); return;
      }
      const match = /^\/api\/rooms\/([a-f\d-]{36})(?:\/(commands|reports|blocks))?$/.exec(path);
      if (match && ((req.method === 'GET' && !match[2]) || req.method === 'POST')) {
        if (match[2] === 'commands' && ['leave', 'room.leave', 'safety.block'].includes(String(body.type))) {
          const prior = this.available(match[1]!).receipts[`${user.id}:${body.commandId}`];
          if (prior) {
            if (prior.digest !== hash(JSON.stringify(body))) fail(409, 'COMMAND_REUSED', 'Use a new command identifier.');
            send(200, { left: true, ack: prior.ack }); return;
          }
        }
        // Advance independently so an invalid command cannot roll back a deadline.
        this.store.transaction(() => { const r = this.available(match[1]!); this.member(r, user); if (this.advance(r, now)) this.save(r, now); });
        const result = this.store.transaction(() => {
          const r = this.available(match[1]!); const p = this.member(r, user); const presenceChanged = this.presence(r, p, clientId, now);
          if (match[2] === 'reports' && req.method === 'POST') {
            this.rate(`report:${user.id}`, 5, 5/3600);
            const category = text(body.category, 32);
            if (!['harassment','unsafe_name','cheating','other'].includes(category)) fail(400, 'INVALID_REQUEST', 'Choose a report category.');
            this.store.db.prepare('INSERT INTO reports VALUES (?,?,?,?,?,?,?)').run(randomUUID(), user.id, r.id, r.scenarioId, category, text(body.detail ?? '', 1000), now);
            this.save(r, now, presenceChanged); return { ok: true };
          }
          if (match[2] === 'blocks' && req.method === 'POST') {
            this.blockAndLeave(r, p, user, body.seat, now);
            this.save(r, now); return { ok: true, left: true };
          }
          const response = match[2] === 'commands' && req.method === 'POST' ? this.command(r, p, user, clientId, body, now, presenceChanged) : undefined;
          if (!response) this.save(r, now, presenceChanged);
          return { ...(p.left ? { left: true } : { room: this.snapshot(r, user, clientId, now) }), ...response };
        }); send(200, result); return;
      }
      fail(404, 'NOT_FOUND', 'This endpoint is not available.');
    } catch (error) {
      const known = error instanceof ApiError;
      send(known ? error.status : 503, { error: { code: known ? error.code : 'SERVICE_RECOVERING', message: known ? error.message : 'The harbor is reconnecting. Please try again.' } });
    }
  }
}
