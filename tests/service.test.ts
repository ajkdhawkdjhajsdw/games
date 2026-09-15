import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { HarborService, type Room } from '../server/service.ts';
import { verifyTelegram } from '../server/auth.ts';

const origin = 'http://localhost:5173';
type View = ReturnType<HarborService['snapshot']>;
interface Client { cookie: string; id: string }
interface Response { room: View; inviteToken: string; ack: { accepted: boolean; commandId: string; committed: boolean; revision: number }; error: { code: string }; left: boolean; user: { id: string; name: string }; results: unknown[]; mastery: { human: number; practice: number } }
async function fixture(path = ':memory:', origins = [origin]) {
  let now = 1_800_000_000_000;
  let service = new HarborService({ production: false, allowDevAuth: true, origins, databasePath: path, now: () => now, tickMs: 0 });
  let base = '';
  async function listen() { await new Promise<void>(resolve => service.server.listen(0, '127.0.0.1', resolve)); const addr = service.server.address(); assert(addr && typeof addr !== 'string'); base = `http://127.0.0.1:${addr.port}`; }
  await listen();
  async function request(client: Client, route: string, body?: unknown, extras: Record<string,string> = {}) {
    const response = await fetch(base + '/api' + route, { method: body === undefined ? 'GET' : 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'X-Client-Id': client.id, Cookie: client.cookie, ...extras }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const data = await response.json() as Response;
    return { response, data, status: response.status };
  }
  async function login(name: string): Promise<Client> { const client = { cookie: '', id: randomUUID() }; const { response, status } = await request(client, '/auth/dev', { name }); assert.equal(status, 200); client.cookie = response.headers.get('set-cookie')!.split(';')[0]!; return client; }
  async function command(client: Client, room: View, type: string, payload: Record<string,unknown> = {}) {
    return request(client, `/rooms/${room.id}/commands`, { type, commandId: randomUUID(), scenarioId: room.scenarioId, round: room.round, controlEpoch: room.owner.controlEpoch, seq: room.owner.seq+1, configVersion: room.configVersion, ...payload });
  }
  async function get(client: Client, id: string) { const result = await request(client, `/rooms/${id}`); assert.equal(result.status, 200, JSON.stringify(result.data)); return result.data.room; }
  async function duo() {
    const a = await login('Captain Alpha'), b = await login('Captain Beta');
    const created = await request(a, '/rooms', { mapId: 'M01', capacity: 2, bots: 0 });
    assert.equal(created.status, 201);
    const joined = await request(b, '/join', { token: created.data.inviteToken }); assert.equal(joined.status, 200);
    let room = await get(a, created.data.room.id);
    assert.equal((await command(a, room, 'ready', { ready: true })).status, 200);
    assert.equal((await command(b, await get(b, room.id), 'ready', { ready: true })).status, 200);
    const started = await command(a, await get(a, room.id), 'start'); assert.equal(started.status, 200);
    room = started.data.room;
    await command(a, room, 'ack'); await command(b, await get(b, room.id), 'ack');
    now += 3000; service.tick(); room = await get(a, room.id); assert.equal(room.phase, 'PLANNING');
    return { a, b, room, token: created.data.inviteToken };
  }
  return { get service() { return service; }, request, login, command, get, duo, time: () => now,
    advance(ms: number) { now += ms; service.tick(); },
    async restart(ms = 0) { await service.close(); now += ms; service = new HarborService({ production: false, allowDevAuth: true, origins, databasePath: path, now: () => now, tickMs: 0 }); await listen(); },
    close: () => service.close(),
  };
}

function noSecrets(value: unknown) {
  const serialized = JSON.stringify(value);
  for (const key of ['jobs','validBerths','preferredBerth','deckFamily','inviteHash','receipts','botPlan','humanCommits','userId','clientId','subject']) assert(!serialized.includes(`"${key}"`), `unexpected private key ${key}`);
}

test('HTTP owner allowlist, unauthenticated and nonmember isolation, and safe names', async t => {
  const f = await fixture(); t.after(f.close);
  const { a, b, room } = await f.duo();
  const outsider = await f.login('<b>Guest</b>\u0000');
  const aView = await f.get(a, room.id), bView = await f.get(b, room.id);
  assert.equal(aView.owner.seat, 'A'); assert.equal(bView.owner.seat, 'B');
  assert.deepEqual(aView.players, bView.players);
  assert.deepEqual(Object.keys(aView.players[1]!).sort(), ['bot','committed','connected','name','node','ready','seat','signal'].sort());
  assert(aView.owner.job && bView.owner.job); noSecrets(aView); noSecrets(bView);
  const excluded = await f.request(outsider, `/rooms/${room.id}`); assert.equal(excluded.status, 403); noSecrets(excluded.data); assert.equal(Object.keys(excluded.data).join(), 'error');
  assert.equal((await f.request({ id: randomUUID(), cookie: '' }, `/rooms/${room.id}`)).status, 401);
  assert.equal((await f.request(outsider, `/rooms/${room.id}/commands`, { type: 'commit', commandId: randomUUID(), seat: 'A' })).status, 403);
  const session = await f.request(outsider, '/session'); assert.equal(session.data.user.name, '<b>Guest</b>');
  assert.equal((await f.request(a, `/rooms/${room.id}`)).response.headers.get('cache-control'), 'no-store');
});

test('atomic final commit, immutable signal, exact retry, sequence and forged destination rejection', async t => {
  const f = await fixture(); t.after(f.close);
  const { a, b, room } = await f.duo();
  const revision = room.revision;
  let result = await f.command(a, room, 'choose', { destination: room.owner.legalMoves[0] });
  assert.equal(result.status, 200); assert.equal(result.data.room.revision, revision);
  assert.equal((await f.get(b, room.id)).owner.destination, 'WAIT');
  result = await f.command(a, result.data.room, 'choose', { destination: 'B1' });
  assert.equal(result.status, 400); assert.equal(result.data.error.code, 'INVALID_DESTINATION'); noSecrets(result.data);
  let current = await f.get(a, room.id);
  for (let i=0;i<3;i++) { const result = await f.command(a, current, 'signal', { signal: { kind: 'NEED', node: 'J1' } }); assert.equal(result.status, 200); current = result.data.room; }
  const stale = await f.command(a, current, 'choose', { destination: 'WAIT', seq: current.owner.seq }); assert.equal(stale.data.error.code, 'STALE_COMMAND');
  const body = { type: 'commit', commandId: randomUUID(), scenarioId: current.scenarioId, round: current.round, controlEpoch: current.owner.controlEpoch, seq: current.owner.seq+1, destination: 'WAIT', signal: { type: 'YIELD', node: 'EA' } };
  const committed = await f.request(a, `/rooms/${room.id}/commands`, body); assert.equal(committed.status, 200); assert.equal(committed.data.room.owner.destination, 'WAIT'); assert.equal(committed.data.room.players[0]!.signal!.type, 'YIELD');
  assert.deepEqual((await f.request(a, `/rooms/${room.id}/commands`, body)).data.ack, committed.data.ack);
  assert.equal((await f.request(a, `/rooms/${room.id}/commands`, { ...body, destination: 'J1' })).data.error.code, 'COMMAND_REUSED');
  assert.equal((await f.command(a, committed.data.room, 'signal', { signal: null })).data.error.code, 'ALREADY_COMMITTED');
  assert.equal((await f.command(b, await f.get(b, room.id), 'commit', { destination: 'WAIT', signal: null })).status, 200);
  assert.equal((await f.get(a, room.id)).phase, 'PLANNING', 'all commits never shorten a standard round');
});

test('deadline admission, automatic Wait, 1500ms intermission and stale round scope', async t => {
  const f = await fixture(); t.after(f.close);
  const { a, b, room } = await f.duo();
  await f.command(a, room, 'choose', { destination: room.owner.legalMoves[0] });
  f.advance(14_000); await f.get(a, room.id); await f.get(b, room.id);
  f.advance(6000);
  const late = await f.command(a, room, 'commit', { destination: 'WAIT', signal: null }); assert.equal(late.data.error.code, 'ROUND_CLOSED');
  let current = await f.get(a, room.id); assert.equal(current.phase, 'INTERMISSION'); assert.equal(current.players[0]!.node, 'EA'); assert.equal(current.history.length, 1);
  f.advance(1499); assert.equal((await f.get(a, room.id)).phase, 'INTERMISSION');
  f.advance(1); current = await f.get(a, room.id); assert.equal(current.round, 2); assert.equal(current.deadlineAt, f.time()+20_000); assert.equal(current.players[0]!.signal, null);
  assert.equal((await f.command(a, current, 'commit', { round: 1, destination: 'WAIT', signal: null })).data.error.code, 'STALE_ROUND');
});

test('wrong current-job berth is rejected even when adjacent; another seat cannot be forged', async t => {
  const f = await fixture(); t.after(f.close);
  const { a, b, room } = await f.duo();
  f.service.store.transaction(() => {
    const persisted = f.service.store.getRoom<Room>(room.id)!;
    const ship = persisted.state!.ships[0]!; ship.node = 'J1'; ship.jobs[0] = { validBerths: ['B2','B3'], preferredBerth: 'B2', flavor: 'tea' };
    f.service.store.saveRoom(persisted, f.time());
  });
  const current = await f.get(a, room.id); assert(!current.owner.legalMoves.includes('B1'));
  assert.equal((await f.command(a, current, 'commit', { destination: 'B1', signal: null })).data.error.code, 'INVALID_DESTINATION');
  assert.equal((await f.command(b, await f.get(b, room.id), 'commit', { seat: 'A', destination: 'WAIT', signal: null })).status, 200);
  assert.equal((await f.get(a, room.id)).owner.committed, false);
});

test('start acknowledgement barrier and countdown, missing ack returns everyone to lobby', async t => {
  const f = await fixture(); t.after(f.close);
  const a = await f.login('Practice');
  const result = await f.request(a, '/rooms', { capacity: 2, bots: 1, untimed: true }); assert.equal(result.data.room.phase, 'STARTING');
  f.advance(9999); assert.equal((await f.get(a, result.data.room.id)).phase, 'STARTING');
  f.advance(1); let room = await f.get(a, result.data.room.id); assert.equal(room.phase, 'LOBBY'); assert.equal(room.players[0]!.ready, false);
  room = (await f.command(a, room, 'ready', { ready: true })).data.room;
  room = (await f.command(a, room, 'start')).data.room;
  room = (await f.command(a, room, 'ack')).data.room;
  assert.equal(room.startsAt, f.time()+3000);
  f.advance(2999); assert.equal((await f.get(a, room.id)).phase, 'STARTING');
  f.advance(1); room = await f.get(a, room.id); assert.equal(room.phase, 'PLANNING'); assert.equal(room.deadlineAt, null);
  room = (await f.command(a, room, 'commit', { destination: 'WAIT', signal: null })).data.room;
  assert.equal(room.phase, 'INTERMISSION', 'untimed practice advances after commitments');
});

test('tab handoff is read-only until boundary; epochs reject replaced tab and preserve commitment', async t => {
  const f = await fixture(); t.after(f.close);
  const { a, b, room } = await f.duo();
  const tab = { ...a, id: randomUUID() };
  assert.equal((await f.get(tab, room.id)).owner.canControl, false);
  assert.equal((await f.command(tab, room, 'commit', { destination: 'WAIT', signal: null })).data.error.code, 'STALE_CONTROL');
  let committed = (await f.command(a, room, 'commit', { destination: 'WAIT', signal: null })).data.room;
  assert.equal((await f.command(tab, await f.get(tab, room.id), 'reclaim')).status, 200);
  f.advance(14_000); await f.get(tab, room.id); await f.get(b, room.id);
  f.advance(6000); committed = await f.get(tab, room.id); assert.equal(committed.owner.committed, true);
  f.advance(1500); const transferred = await f.get(tab, room.id);
  assert(transferred.owner.controlEpoch > room.owner.controlEpoch); assert.equal(transferred.owner.canControl, true);
  assert.equal((await f.command(a, transferred, 'commit', { destination: 'WAIT', signal: null })).data.error.code, 'STALE_CONTROL');
  assert.equal((await f.command(tab, transferred, 'commit', { destination: 'WAIT', signal: null })).status, 200);
});

test('bot takeover requires owner consent and activates only after a missed round boundary', async t => {
  const f = await fixture(); t.after(f.close);
  const { a, b, room } = await f.duo();
  assert.equal(room.owner.allowBot, false);
  await f.command(a, room, 'allowBot', { allowBot: true });
  await f.command(b, await f.get(b, room.id), 'commit', { destination: 'WAIT', signal: null });
  f.advance(14_000); await f.get(a, room.id); await f.get(b, room.id);
  f.advance(6000); let current = await f.get(a, room.id); assert.equal(current.players[0]!.bot, false);
  f.advance(1500); current = await f.get(a, room.id); assert.equal(current.players[0]!.bot, true); assert.equal(current.mode, 'MIXED'); assert.equal(current.owner.canControl, false);
  f.advance(5999); assert.equal((await f.get(a, room.id)).players[0]!.signal, null);
  f.advance(1); assert((await f.get(a, room.id)).players[0]!.signal);
  f.advance(3000); assert.equal((await f.get(a, room.id)).players[0]!.committed, true);
});

test('continuous bot observers remain present without reclaiming control', async t => {
  const f = await fixture(); t.after(f.close);
  const { a, b, room } = await f.duo();
  await f.command(a, room, 'allowBot', { allowBot: true });
  for (let i = 0; i < 4; i++) { f.advance(5000); await f.get(a, room.id); await f.get(b, room.id); }
  f.advance(1500);
  let current = await f.get(a, room.id);
  assert.equal(current.players[0]!.bot, true);
  const botEpoch = current.owner.controlEpoch;
  assert.equal((await f.command(a, current, 'commit', { destination: 'WAIT', signal: null })).data.error.code, 'STALE_CONTROL');
  for (let i = 0; i < 4; i++) {
    f.advance(5000); current = await f.get(a, room.id); await f.get(b, room.id);
    assert.equal(current.players[0]!.connected, true);
    assert.equal(current.owner.pendingControl, false);
    assert.equal(current.owner.canControl, false);
  }
  f.advance(1500); current = await f.get(a, room.id);
  assert.equal(current.round, 3);
  assert.equal(current.players[0]!.bot, true);
  assert.equal(current.owner.controlEpoch, botEpoch);
  assert.equal((await f.command(a, current, 'reclaim')).status, 200);
  for (let i = 0; i < 4; i++) { f.advance(5000); await f.get(a, room.id); await f.get(b, room.id); }
  f.advance(1500); current = await f.get(a, room.id);
  assert.equal(current.players[0]!.bot, false);
  assert.equal(current.owner.canControl, true);
  assert(current.owner.controlEpoch > botEpoch);
});

for (const endpoint of ['commands', 'blocks'] as const) test(`${endpoint} blocking atomically leaves without removing the target`, async t => {
  const f = await fixture(); t.after(f.close);
  const { a, b, room } = await f.duo();
  const before = await f.get(b, room.id);
  const blocked = endpoint === 'commands'
    ? await f.command(a, room, 'safety.block', { seat: 'B' })
    : await f.request(a, `/rooms/${room.id}/blocks`, { seat: 'B' });
  assert.equal(blocked.status, 200);
  assert.equal(blocked.data.left, true);
  assert.equal(blocked.data.room, undefined);
  assert.equal((await f.request(a, `/rooms/${room.id}`)).status, 403);
  assert.equal((await f.request({ ...a, id: randomUUID() }, `/rooms/${room.id}`)).status, 403);
  assert.equal((await f.command(a, room, 'commit', { destination: 'WAIT', signal: null })).status, 403);
  const remaining = await f.get(b, room.id);
  assert.equal(remaining.scenarioId, before.scenarioId);
  assert.equal(remaining.round, before.round);
  assert.equal(remaining.phase, 'PLANNING');
  assert.equal(remaining.players[0]!.connected, false);
  assert.equal(remaining.hostSeat, 'B');
  assert.equal(remaining.owner.canControl, true);
  assert.equal((await f.command(b, remaining, 'commit', { destination: 'WAIT', signal: null })).status, 200);
  const fresh = await f.request(b, '/rooms', { capacity: 2 });
  assert.equal((await f.request(a, '/join', { token: fresh.data.inviteToken })).status, 404);
});

test('removed lobby members cannot use fresh invites or reconnect, including after restart', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'quiet-harbor-removal-'));
  const f = await fixture(join(directory, 'service.sqlite'));
  t.after(async () => { await f.close(); rmSync(directory, { recursive: true, force: true }); });
  const a = await f.login('Host'), b = await f.login('Removed'), c = await f.login('Eligible');
  const created = await f.request(a, '/rooms', { capacity: 2 });
  const id = created.data.room.id;
  await f.request(b, '/join', { token: created.data.inviteToken });
  const removed = await f.command(a, await f.get(a, id), 'remove', { seat: 'B' });
  assert.equal(removed.status, 200);
  assert(removed.data.inviteToken);
  assert.equal('removedUserIds' in removed.data.room, false);
  for (let attempt = 0; attempt < 2; attempt++) {
    assert.equal((await f.request(b, '/join', { token: removed.data.inviteToken })).data.error.code, 'ROOM_UNAVAILABLE');
    assert.equal((await f.request(b, `/rooms/${id}`)).status, 403);
    assert.equal((await f.request({ ...b, id: randomUUID() }, `/rooms/${id}`)).status, 403);
    if (attempt === 0) await f.restart();
  }
  assert.equal((await f.request(c, '/join', { token: removed.data.inviteToken })).status, 200);
  const fresh = await f.request(a, '/rooms', { capacity: 2 });
  assert.equal((await f.request(b, '/join', { token: fresh.data.inviteToken })).status, 200, 'removal is scoped to its room');
});

test('rotated invites, locked active joins, membership safety reports and symmetric blocks', async t => {
  const f = await fixture(); t.after(f.close);
  const a = await f.login('Host'), b = await f.login('Guest'), c = await f.login('Stranger');
  const created = await f.request(a, '/rooms', { capacity: 2 });
  const rotated = await f.command(a, created.data.room, 'invite'); assert(rotated.data.inviteToken);
  assert.equal((await f.request(b, '/join', { token: created.data.inviteToken })).status, 404);
  assert.equal((await f.request(b, '/join', { token: rotated.data.inviteToken })).status, 200);
  assert.equal((await f.request(c, `/rooms/${created.data.room.id}/reports`, { category: 'other', detail: 'Test' })).status, 403);
  assert.equal((await f.request(a, `/rooms/${created.data.room.id}/reports`, { category: 'other', detail: 'Synthetic evidence' })).status, 200);
  assert.equal((await f.request(a, `/rooms/${created.data.room.id}/blocks`, { seat: 'B' })).status, 200);
  const fresh = await f.request(b, '/rooms', { capacity: 2 }); assert.equal((await f.request(a, '/join', { token: fresh.data.inviteToken })).status, 404);
  const active = await f.duo(); assert.equal((await f.request(c, '/join', { token: active.token })).status, 404);
});

test('SQLite survives restart; accepted retries and round resolution are exactly once', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'quiet-harbor-'));
  const f = await fixture(join(directory, 'service.sqlite')); t.after(async () => { await f.close(); rmSync(directory, { recursive: true, force: true }); });
  const { a, b, room } = await f.duo();
  const body = { type: 'commit', commandId: randomUUID(), scenarioId: room.scenarioId, round: room.round, controlEpoch: room.owner.controlEpoch, seq: 1, destination: 'WAIT', signal: null };
  const first = await f.request(a, `/rooms/${room.id}/commands`, body); assert.equal(first.status, 200);
  f.advance(14_000); await f.get(a, room.id); await f.get(b, room.id);
  await f.restart(6000);
  let current = await f.get(a, room.id); assert.equal(current.phase, 'INTERMISSION'); assert.equal(current.history.length, 1);
  assert.deepEqual((await f.request(a, `/rooms/${room.id}/commands`, body)).data.ack, first.data.ack);
  await f.restart(); current = await f.get(a, room.id); assert.equal(current.history.length, 1);
  const duplicate = f.service.store.db.prepare('SELECT room_id,revision,COUNT(*) AS n FROM outbox GROUP BY room_id,revision HAVING n>1').all(); assert.equal(duplicate.length, 0);
  await f.restart(31_000); assert.equal((await f.get(a, room.id)).phase, 'ABORTED');
});

test('all humans intentionally leaving closes without results or mastery', async t => {
  const f = await fixture(); t.after(f.close);
  const { a, b, room } = await f.duo();
  assert.equal((await f.command(a, room, 'leave', { allowBot: true })).data.left, true);
  assert.equal((await f.command(b, await f.get(b, room.id), 'leave', { allowBot: true })).data.left, true);
  const persisted = f.service.store.getRoom<Room>(room.id)!; assert.equal(persisted.phase, 'closed'); assert.equal(persisted.result!.reason, 'ALL_LEFT');
  assert.equal((await f.request(a, '/results')).data.results.length, 0);
  assert.deepEqual((await f.request(a, '/profile')).data.mastery, { human: 0, humanOnly: 0, practice: 0 });
});

test('private drafts keep public revision stable; reconnect and retried commands persist liveness', async t => {
  const f = await fixture(); t.after(f.close);
  const { a, b, room } = await f.duo();
  const draft = await f.command(a, room, 'choose', { destination: 'WAIT' });
  assert.equal(draft.data.room.revision, room.revision);
  assert(draft.data.room.owner.privateRevision > room.owner.privateRevision);
  const body = { type: 'heartbeat', commandId: randomUUID() };
  const first = await f.request(a, `/rooms/${room.id}/commands`, body);
  f.advance(10_000);
  assert.deepEqual((await f.request(a, `/rooms/${room.id}/commands`, body)).data.ack, first.data.ack);
  await f.get(b, room.id);
  f.advance(6000);
  assert.equal((await f.get(a, room.id)).owner.canControl, true, 'an accepted retry renews its existing lease');
  f.advance(14_000); await f.get(b, room.id);
  f.advance(1000);
  const disconnected = await f.get(b, room.id);
  assert.equal(disconnected.players[0]!.connected, false);
  const returned = await f.get(a, room.id);
  assert(returned.revision > disconnected.revision);
  assert.equal(returned.players[0]!.connected, true);
  assert.equal(returned.owner.canControl, false);
  assert.deepEqual((await f.get(b, room.id)).players, returned.players);
});

test('late resolution publishes a full intermission, never extends the closed planning window', async t => {
  const f = await fixture(); t.after(f.close);
  const { a, b, room } = await f.duo();
  f.advance(14_000); await f.get(a, room.id); await f.get(b, room.id);
  f.advance(7000);
  const late = await f.command(a, room, 'commit', { destination: 'WAIT', signal: null });
  assert.equal(late.data.error.code, 'ROUND_CLOSED');
  const current = await f.get(a, room.id);
  assert.equal(current.nextRoundStartsAt, f.time() + 1500);
  f.advance(1499); assert.equal((await f.get(a, room.id)).phase, 'INTERMISSION');
  f.advance(1); assert.equal((await f.get(a, room.id)).deadlineAt, f.time() + 20_000);
});

test('replacement cannot be accepted before a missed round offers it', async t => {
  const f = await fixture(); t.after(f.close);
  const { a, room } = await f.duo();
  assert.equal((await f.command(a, room, 'acceptBot')).data.error.code, 'NO_TAKEOVER_OFFER');
  assert.equal((await f.get(a, room.id)).owner.allowBot, false);
});

test('successful results and eligible mastery settle once; private state is completely purged', async t => {
  const f = await fixture(); t.after(f.close);
  const { a, b, room } = await f.duo();
  f.service.store.transaction(() => {
    const r = f.service.store.getRoom<Room>(room.id)!;
    r.state!.round = 7; r.state!.deliveries = 5;
    const ship = r.state!.ships[0]!;
    ship.node = 'J1'; ship.jobs[0] = { validBerths: ['B1', 'B2'], preferredBerth: 'B1', flavor: 'tea' };
    r.players.forEach(p => { p.humanCommits = 1; });
    f.service.store.saveRoom(r, f.time());
  });
  await f.command(a, await f.get(a, room.id), 'commit', { destination: 'B1', signal: null });
  await f.command(b, await f.get(b, room.id), 'commit', { destination: 'WAIT', signal: null });
  f.advance(14_000); await f.get(a, room.id); await f.get(b, room.id);
  f.advance(6000);
  const ended = await f.get(a, room.id);
  assert.equal(ended.result?.status, 'success'); assert.equal(ended.result.deliveries, 6);
  assert.equal(ended.owner.job, null); noSecrets(ended);
  for (const client of [a, b]) {
    assert.equal((await f.request(client, '/results')).data.results.length, 1);
    assert.equal((await f.request(client, '/profile')).data.mastery.human, 1);
  }
  await f.get(a, room.id); f.advance(1000);
  assert.equal(f.service.store.db.prepare('SELECT COUNT(*) AS n FROM results').get()!.n, 1);
  f.service.store.transaction(() => {
    const r = f.service.store.getRoom<Room>(room.id)!;
    r.endedAt = f.time() - 86_400_001;
    r.players[0]!.botPlan = { intent: { type: 'move', to: 'B1' }, signal: null, commitAt: f.time() };
    f.service.store.saveRoom(r, f.time());
  });
  f.advance(1);
  const purged = f.service.store.getRoom<Room>(room.id)!;
  assert.equal(purged.state, undefined); assert.equal(purged.deckFamily, undefined);
  assert.deepEqual(purged.receipts, {});
  for (const p of purged.players) { assert.equal(p.botPlan, undefined); assert.deepEqual(p.destination, { type: 'wait' }); }
  const recap = await f.get(a, room.id);
  assert.deepEqual(recap.result, ended.result); assert.equal(recap.deliveries, 6); assert.equal(recap.round, 7);
});

function signedTelegram(token: string, date: number, user = { id: 123, first_name: 'Synthetic' }) {
  const params = new URLSearchParams({ auth_date: String(date), query_id: 'synthetic-query', user: JSON.stringify(user) });
  const check = [...params.entries()].sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => `${k}=${v}`).join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(token).digest();
  params.set('hash', createHmac('sha256', secret).update(check).digest('hex')); return params.toString();
}

test('Telegram authenticates signed fresh identity only; replay age, forged payload and duplicates fail', () => {
  const now = 1_800_000_000_000, token = 'synthetic-bot-token';
  const data = signedTelegram(token, now/1000);
  assert.deepEqual(verifyTelegram(data, token, now), { subject: 'telegram:123', name: 'Synthetic' });
  assert.throws(() => verifyTelegram(data, token, now+300_001));
  assert.throws(() => verifyTelegram(data.replace('Synthetic','Forged'), token, now));
  assert.throws(() => verifyTelegram(data+'&auth_date=1', token, now));
  assert.throws(() => verifyTelegram(signedTelegram(token, now/1000+31), token, now));
  assert.throws(() => verifyTelegram(data, 'different-token', now));
});

test('production Telegram HTTP login issues a hashed, Secure session and rejects signed-data tampering', async t => {
  let now = 1_800_000_000_000;
  const botToken = 'synthetic-production-test-token';
  const service = new HarborService({ production: true, allowDevAuth: false, botToken, origins: ['https://game.example'], databasePath: ':memory:', now: () => now, tickMs: 0 });
  t.after(() => service.close());
  await new Promise<void>(resolve => service.server.listen(0, '127.0.0.1', resolve));
  const address = service.server.address(); assert(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}/api`;
  const headers = { Origin: 'https://game.example', 'X-Client-Id': randomUUID(), 'Content-Type': 'application/json' };
  const initData = signedTelegram(botToken, now / 1000);
  const preview = await fetch(base + '/auth/telegram', { method: 'POST', headers: { ...headers, Origin: 'https://preview.example', 'X-Forwarded-Host': 'preview.example', 'X-Forwarded-Proto': 'https' }, body: JSON.stringify({ initData }) });
  assert.equal(preview.status, 403); assert.equal(preview.headers.get('set-cookie'), null);
  const login = await fetch(base + '/auth/telegram', { method: 'POST', headers, body: JSON.stringify({ initData }) });
  assert.equal(login.status, 200);
  const data = await login.json() as Response; noSecrets(data);
  assert.equal(data.user.name, 'Synthetic');
  const cookie = login.headers.get('set-cookie')!;
  assert.match(cookie, /HttpOnly; SameSite=Lax; Max-Age=3600; Secure/);
  const stored = service.store.db.prepare('SELECT hash FROM sessions').get()!;
  assert.match(String(stored.hash), /^[a-f\d]{64}$/);
  assert(!JSON.stringify(stored).includes(cookie.split(';')[0]!.split('=')[1]!));
  const sessionHeaders = { ...headers, Cookie: cookie.split(';')[0]! };
  const session = await fetch(base + '/session', { headers: sessionHeaders });
  assert.deepEqual((await session.json() as Response).user, data.user);
  const forged = await fetch(base + '/auth/telegram', { method: 'POST', headers, body: JSON.stringify({ initData: initData.replace('Synthetic', 'Forged') }) });
  assert.equal(forged.status, 401); assert.equal(forged.headers.get('set-cookie'), null);
  noSecrets(await forged.json());
  now += 3_600_000;
  const expired = await fetch(base + '/session', { headers: sessionHeaders });
  assert.equal((await expired.json() as Response).user, null);
});

test('Origin defense, HttpOnly sessions, dev-auth disabled by default and production guard', async t => {
  const f = await fixture(); t.after(f.close);
  const a = await f.login('Captain');
  assert.equal((await f.request(a, '/rooms', { capacity: 2 }, { Origin: 'https://attacker.example' })).status, 403);
  const login = await f.request(a, '/auth/dev', { name: 'Captain' });
  assert.match(login.response.headers.get('set-cookie')!, /HttpOnly; SameSite=Lax; Max-Age=3600/);
  assert.throws(() => new HarborService({ production: true, allowDevAuth: true, origins: ['https://game.example'], databasePath: ':memory:' }));
  const disabled = new HarborService({ production: false, allowDevAuth: false, origins: [origin], databasePath: ':memory:', tickMs: 0 });
  t.after(() => disabled.close()); await new Promise<void>(resolve => disabled.server.listen(0, '127.0.0.1', resolve));
  const address = disabled.server.address(); assert(address && typeof address !== 'string');
  const response = await fetch(`http://127.0.0.1:${address.port}/api/auth/dev`, { method: 'POST', headers: { Origin: origin, 'Content-Type':'application/json', 'X-Client-Id': randomUUID() }, body:'{}' }); assert.equal(response.status, 404);
  f.advance(3_600_001); assert.equal((await f.request(a, '/profile')).status, 401);
});

test('development preview origins require an exact allowlist entry, not forwarded host trust', async t => {
  const previewOrigin = 'https://quiet-harbor-preview.example';
  const f = await fixture(':memory:', [origin, previewOrigin]); t.after(f.close);
  const a = await f.login('Preview Captain');
  assert.equal((await f.request(a, '/rooms', { capacity: 2 }, { Origin: previewOrigin })).status, 201);
  for (const forgedOrigin of ['', 'null', previewOrigin + '.attacker.example', 'https://another-preview.example']) {
    const result = await f.request(a, '/rooms', { capacity: 2 }, { Origin: forgedOrigin, 'X-Forwarded-Host': 'quiet-harbor-preview.example', 'X-Forwarded-Proto': 'https', 'Sec-Fetch-Site': 'same-origin' });
    assert.equal(result.status, 403); assert.equal(result.data.error.code, 'ORIGIN_DENIED');
  }
  assert.equal((await f.request(a, '/rooms', { capacity: 2 }, { Origin: previewOrigin, 'Sec-Fetch-Site': 'cross-site' })).status, 403);
});
