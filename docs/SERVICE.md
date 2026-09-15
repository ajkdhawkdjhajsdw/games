# Quiet Harbor service

## Implemented deployment scope

This is a **single Node.js 24 process**, native HTTP, TypeScript through `tsx`, and Node's built-in `node:sqlite`. There are no third-party server runtime dependencies. SQLite WAL stores room aggregates, hashed sessions, transactional command receipts, public results, mastery, blocks, reports, and an outbox. It is a playable standalone implementation, **not** the specification's recommended Fastify/WebSocket/PostgreSQL deployment, not horizontally scalable, and not a production-readiness claim.

Run `npm run dev` for the repository's development launcher, or configure environment variables then `npm start` for the API on port 3001. The Vite frontend proxies `/api` to that port. `.env.example` documents configuration; the standalone entrypoint does not implicitly load `.env`. Use Node's environment-file mechanism or deployment-injected environment. Production must run behind HTTPS, with an exact `APP_ORIGINS` allowlist, real Telegram bot configuration, and one process owning a durable private `DATABASE_PATH`. Do not publish the database, server directory, or content validation assets as static files. Do not use multiple replicas against this file.

SQLite updates use synchronous `BEGIN IMMEDIATE` transactions. A room's aggregate revision compare-and-swap, accepted-command receipt, resolution, result/mastery insertion, and metadata-only outbox insert commit together. No command awaits inside the transaction. The event loop is the single serialized admission gate; SQL uniqueness protects repeated effects. Outbox entries are a durable change journal, not an external broker: REST polling re-reads the current authoritative state, so a crash after persistence does not lose the result. There is no WebSocket transport, replay stream, distributed worker, database migration framework, or measured load/SLO evidence yet.

## Authentication and HTTP requirements

All API requests except health use `X-Client-Id: <8–80 ASCII letters/digits/_/->`, generated independently per browser tab and retained in session storage. Sessions use `qh_session`, HttpOnly, SameSite=Lax, one-hour lifetime, scoped to `/api`; production adds Secure. Only a SHA-256 session-token hash is stored. Every POST requires JSON, at most 8192 bytes, and an exact allowed `Origin`. Cross-site fetches are rejected. Responses are `Cache-Control: no-store`. Authentication and requests are not body-logged; unrecognized errors expose only `SERVICE_RECOVERING`.

- `GET /api/health` → `{ok:true}`.
- `GET /api/session` → `{user:{id,name}|null,devAuth:boolean}`.
- `POST /api/auth/dev {name}` → session and `{user,devAuth:true}`. Creates a new synthetic identity; it cannot authenticate as an arbitrary existing account. Enabled **only** by `ALLOW_DEV_AUTH=1` outside production. Production refuses that flag at startup.
- `POST /api/auth/telegram {initData}` → session and `{user,devAuth:false}`. Server verifies the Telegram HMAC, duplicate/invalid parameters, signed user identity, `auth_date` no older than five minutes and at most 30 seconds ahead. Bot token never enters a Vite variable or client DTO.
- `POST /api/auth/logout {}` revokes the current session.

Authentication is rate-limited per socket IP; room creation, join attempts, gameplay changes and reports have per-user limits. Client-supplied forwarding headers are deliberately not trusted. Behind a reverse proxy the IP fallback is therefore shared by proxy clients; configure trusted ingress limits before launch. In-memory rate buckets reset on process restart. Telegram platform secrets and actual deployment verification remain operator dependencies.

Development API defaults use `http://localhost:3000` and `http://127.0.0.1:3000`, with exact origin matching. Vite's development proxy additionally normalizes an Origin to the latter only when it exactly equals `https://` plus the original Host and that hostname matches the trusted runtime `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` namespace. It does not trust forwarded headers or normalize missing, null, mismatched, or cross-namespace origins; `Sec-Fetch-Site` is preserved for API rejection of cross-site requests. This is a scoped browser same-origin development exception, not exact deployment-origin pinning. Other external development hosts need explicit `APP_ORIGINS`. Production must not use the Vite proxy: it retains its explicit HTTPS allowlist and disables development authentication.

## Public APIs

Authenticated:

- `GET /api/maps` → `{maps:[{mapId,title:{en,ru},hint:{en,ru}}]}`; no decks or witnesses.
- `POST /api/rooms {mapId?,capacity?:2|3|4,bots?:number,untimed?:boolean}` → `{room,inviteToken}` (201). Defaults: M01, 2 seats, no bots, timed. A full one-human/bot practice room immediately enters the start-acknowledgement phase, not an invisible timed round.
- `POST /api/join {token}` → `{room}`. Lobby only; invite expires after 30 minutes. Existing authenticated members resync via the room endpoint, not an expired invite. Rotation invalidates old tokens atomically. Only invite hashes are persisted.
- `GET /api/rooms/:id` → `{room}` and heartbeat for the requesting lease. Poll every 1–5 seconds while visible and immediately after reconnect. No spectators; every read/write rechecks membership.
- `POST /api/rooms/:id/commands` → `{room,ack,inviteToken?}`; accepted leave returns `{left:true,ack}`.
- `GET /api/profile` → `{user:{id,name},mastery:{human,practice}}`.
- `GET /api/results` → `{results:[...]}`, the user's private latest 50 team results; no public board or names.
- `POST /api/rooms/:id/reports {category,detail?}` → `{ok:true}`. Categories: `harassment`, `unsafe_name`, `cheating`, `other`. Details at most 1000 characters, five reports/hour/user.
- `POST /api/rooms/:id/blocks {seat}` → `{ok:true}`. Target must be another human room member. Symmetric block checks prevent subsequent joins/starts and control transfers. Blocking does not let a host eject an active player or rewrite a result.

Errors: `{error:{code,message}}`, no aggregate/debug/private state. Examples: `AUTH_REQUIRED`, `NOT_MEMBER`, `ROOM_UNAVAILABLE`, `INVITE_UNAVAILABLE`, `PHASE_CLOSED`, `ROUND_CLOSED`, `STALE_ROUND`, `STALE_CONTROL`, `STALE_COMMAND`, `STALE_CONFIG`, `ALREADY_COMMITTED`, `COMMAND_REUSED`, `INVALID_DESTINATION`, `INVALID_SIGNAL`, `RATE_LIMITED`, `SERVICE_RECOVERING`. Fetch the current permitted snapshot after a rejection; never replay an old action into the next round.

### Room snapshot

```ts
{
  id, phase, mapId, capacity, hostSeat,
  mode: 'HUMAN_ONLY' | 'MIXED' | 'UNTIMED', untimed,
  revision, configVersion, scenarioId, round,
  deadlineAt, startsAt, startAt, nextRoundStartsAt, serverNow,
  deliveries, congestion,
  graph: { mapId, seatCount, title, hint, nodes, edges },
  players: [{ seat, name, bot, node, ready, committed, connected,
              signal: null | {seat,type,kind,node} }],
  owner: {
    seat, job: null | {valid:[berth,berth],preferred:berth,cargo},
    legalMoves: string[], committed, destination: 'WAIT' | node,
    controlEpoch, seq, privateRevision, canControl, acknowledged,
    allowBot, botConsent, takeoverOffered, pendingControl
  },
  result: null | {scenarioId,mapId,capacity,status,outcome,reason,score,
                 deliveries,preferredDeliveries,congestion,round,mode,
                 rulesVersion,contentVersion},
  provisional,
  history: [{round,deliveries,congestion,conflicts,events}]
}
```

Phases are uppercase `LOBBY`, `STARTING`, `PLANNING`, `INTERMISSION`, `ENDED`, `CLOSED`, `ABORTED`. Resolution is synchronous and atomic; there is no separately observable `RESOLVING` snapshot. `startAt` aliases `startsAt`; signal `kind` aliases `type`; `botConsent` aliases `allowBot`; result `outcome` is the uppercase form of `status` for client integration. Result `mode` retains the storage labels `human-only`, `mixed`, or `untimed`. Only the owner's current job is included. Future jobs, deck selectors, bot seeds/plans, other owners' drafts/commits, consent histories, account subjects, session material, reports and block lists never enter snapshots. Preferred totals appear only in finalized recap. Explicitly allowlisted history contains already-resolved public movement, not preferred-delivery attribution. Private draft changes increment the owner's private revision and internal transaction revision, not public revision; public presence/control changes do advance public revision.

### Command envelopes

Every command has a UUID `commandId` and `type`. Identity and seat come from session membership, never the payload. Accepted IDs are stored with a payload digest and original acknowledgement; identical retries recover that acknowledgement, changed payloads get `COMMAND_REUSED`. Receipts are bounded to the latest 4000 accepted commands in the room/scenario, are cleared on a fresh scenario, and are not a permanent idempotency ledger.

Lobby `ready`, `start`, `configure`, `remove` require `configVersion` from the current snapshot. Joining, removing or configuring resets readiness and increments this version.

| Type | Additional payload | Behavior |
|---|---|---|
| `ready` | `ready:boolean,configVersion` | Own readiness only |
| `start` | `configVersion` | Host; full crew, connected humans all ready; freezes scenario |
| `configure` | `mapId,configVersion` | Host lobby map change; capacity/bot count are chosen at creation |
| `remove` | `seat,configVersion` | Host lobby removal, readiness reset and invite rotation |
| `invite` | none | Host lobby invite rotation; returns new `inviteToken` |
| `ack` | `scenarioId` | Original participating controller acknowledges the initial private snapshot |
| `choose` | gameplay envelope + `destination` | Replace private draft only |
| `signal` | gameplay envelope + `signal` | Replace/clear public advisory signal |
| `commit` | gameplay envelope + **final** `destination,signal` | Validate and lock both atomically, independent of earlier choose/signal delivery |
| `allowBot` | `allowBot:boolean` | Own consent, default false |
| `acceptBot` | `scenarioId` | After a missed round, owner explicitly consents and queues next-boundary bot |
| `reclaim` | `scenarioId` | Verified owner queues this tab for next-boundary control |
| `heartbeat` | none | Owner liveness/resync; ordinary GET also heartbeats |
| `leave` | `allowBot:boolean` | Explicit leave; queues consented bot only at boundary |
| `rematch` | `nextHarbor?:boolean` | Host ended-room return to lobby, ready reset, new scenario on start |

Gameplay envelope: `scenarioId`, integer `round`, `controlEpoch`, increasing `seq` (or `seatCommandSeq`). `destination` is a permitted adjacent node or `"WAIT"`; `null` is also accepted as Wait. `signal` is `null` or `{type:'NEED'|'YIELD'|'READY',node}`; `kind` is an alias for `type`. Commit requires a complete explicit signal value, including `null`. Gameplay does not require public revision equality. Aliases supported: `move.choose`, `move.commit`, `signal.set`, `room.ready`, `room.start`, `room.leave`, `control.reclaim`, `control.acceptBot`, `state.resync`.

## Timing, controllers and recovery

Start waits up to 10 seconds for every human acknowledgement, then publishes a start three seconds ahead. Missing acknowledgements return to lobby with readiness reset. Timed rounds always last 20 seconds, even when all players commit. Uncommitted drafts become Wait, never an implied commitment. Result persistence schedules a 1500ms intermission, including after a delayed timer or recoverable restart; the expired planning deadline is never extended. Untimed practice advances once all seats commit; practice bots act immediately in that mode.

Standard bots construct plans at six seconds through an explicit restricted view (own current job, graph, public occupancy/signals/totals only), and commit deterministically between seven and nine seconds. The room aggregate/decks/other intents never go into the bot policy. Bot-controlled planning latches Mixed until a new scenario. Bot consent defaults off. A missed human commitment can queue a previously consented bot; host cannot consent for another owner.

Presence expires after 15 seconds. A disconnected or replacement tab sees an owner-private read-only snapshot and queues/reclaims control at the next round boundary, with a new epoch and reset sequence. Accepted prior commitment remains sealed. Additional tabs cannot write simply because they share a session. In polling transport there is no socket-close signal; disconnection is established by the lease timeout. A new tab's explicit `reclaim` immediately makes the old controller read-only until the boundary. Human reclaim wins over bot takeover if eligibility, membership, connected lease and safety checks still hold at application.

If all humans deliberately leave, close immediately without rewards. If all transports disappear, retain 30 seconds of reconnect grace while deadlines continue. A terminal result while all humans are absent remains provisional and hidden; reconnect within grace finalizes that exact result, otherwise close without completion. Host transfers to the earliest joined connected human; bots never host. Lobby inactivity expires after 15 minutes; ended rematch windows after 10 minutes.

Durable UTC timestamps permit short restart recovery: expired persisted commitments resolve once; already persisted results are read again. A recorded active-state service interruption longer than 30 seconds aborts with `SERVICE_RECOVERING`, no invented congestion loss or mastery. An integrity exception aborts rather than normalizing corrupt intents into legal moves. A 250ms local timer advances rooms; persisted service-liveness checkpoints are at most five seconds apart during active processing. This is conservative single-process recovery, not high availability or cross-region clock/leader management.

## Results, retention and remaining release work

Final results are private team results. Score comes from the pure rules module. Successful timed Human-only runs and Mixed runs award separate mastery tracks when that human actually accepted at least two commitments; auto-Waits, bot actions, failures, untimed runs and attendance alone do not qualify. Distinct completion key uses content version, map and private deck family; preference randomization/seat count do not create extra completions. SQL uniqueness makes result/mastery effects idempotent. Rematch alternates the server-only deck family and resamples preferences; next harbor starts a fresh family choice. There are no public boards, sharing-consent publication, commerce, rewards currency, admin moderation UI or fabricated analytics integrations.

The timer removes terminal private game state, deck selectors, intents, bot plans and receipts after 24 hours, and outbox metadata after seven days. The finalized recap survives this private-state purge. Expired sessions are removed on login. Public room diagnostic history is currently retained with the room; reports, user settings/results, blocks and backups do **not** yet have the complete operator retention/deletion workflow required for release. Reports are durably stored but no notification or staffed moderation queue is claimed. No support/privacy contact, lawful-policy approval, live Telegram device verification, penetration test, production backup/restore drill or load benchmark is supplied by this service.

Verification: `npx tsx --test tests/service.test.ts` exercises the real HTTP server with separate authenticated users and a real temporary SQLite file for restart tests. Tests cover serialized privacy/error paths, Origin/session/HMAC defenses, fixed timing, all-ready start barrier, final commit races, forged destinations and seats, replay/sequence guards, owner leases and epoch transfer, bot timing/consent, invite rotation/safety membership, abandonment, and crash recovery. See the repository's full test command for pure rules/content verification.
