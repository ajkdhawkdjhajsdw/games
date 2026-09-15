# Verification and remaining release gates

## Delivery status

Playable development implementation of QH-MGDS-1.0. This is **not implementation-complete or release-ready against every MUST in the master specification**. The free core game is implemented; the production and human acceptance gates below remain open. Optional Stars commerce is not activated and no payments are accepted.

## Reproducible checks

Final local run: **51/51 tests passed**, production build passed, and content validation passed.

- `npm test`: deterministic resolver, permutation independence, strict owner DTOs, invalid commands, deadline admission, automatic Wait, readiness barrier, consent/control transfer, transactional retries, SQLite restart recovery, result/mastery settlement, session/Telegram signatures, origin rejection, EN/RU copy, exact public map previews, asset paths, and development static-source denial.
- `npm run validate:content`: 30 exact graph variants, 20 deck families, 60/60 solution certificates replayed through the production resolver. The suite additionally covers all 3,840 delivered-preference profiles. `reports/content-validation.json` is server-side verification evidence, not a public runtime asset.
- `npm run build`: TypeScript check and Vite production client compilation. No performance/SLO or sustained load claim follows from build duration.

## Browser evidence (15 September 2026)

Verified in sandbox Chromium with synthetic local identities:

- Home, ten-map practice selector, development authentication, room creation, and real server-backed gameplay.
- Completed an untimed two-seat shift: six deliveries, six preferred deliveries, zero congestion, score 150. Exercised rematch, ready/start barrier, and planning again.
- Saved an uncommitted B1 choice, reloaded, and confirmed the private draft was restored before committing.
- Created three- and four-seat timed practice rooms; observed nine-node boards, correct crew counts, and 20-second planning clocks. Intentionally leaving the sole human closed each practice room.
- Created a private lobby and observed an invitation input without publishing its token. Multi-human isolation, joining, revocation, and blocks are covered by HTTP tests; a real multi-device group session remains unverified.
- Switched to Russian; verified 390px chart layout and 320px automatic node-list layout without horizontal overflow. Selected and committed a move through the 320px Russian node list; round advanced from one to two. Visible button targets in that active screen met 44×44px.
- Verified the congestion-first tutorial answer. Final browser error log was empty.

These are emulated viewport checks, not physical iOS/Android or Telegram WebView certification. Full screen-reader, contrast, large-text, keyboard, audio listening, and safe-area acceptance remain pending.

## Security and preview notes

Development static access to private decks, server code, test witnesses, scripts, and reports returns 403 for direct, raw-query, and absolute `/@fs/` paths. The production bundle uses only allowlisted public map data. SQLite files and workspace artifacts are excluded from version control and Vite serving.

The development proxy normalizes an Origin only when it exactly equals HTTPS plus the original Host and the hostname falls within the trusted runtime preview namespace. It preserves `Sec-Fetch-Site`; same-origin authentication returned 200 while sibling-preview, cross-site, and null-origin requests returned 403. This is browser same-origin enforcement within a platform-owned namespace, **not exact production deployment-origin pinning**. The production API retains explicit `APP_ORIGINS`.

Preview initially reported an exited Vite process. The launcher now disables Vite's stdin-EOF shutdown in noninteractive environments. The platform then retained a stale crashed-run record; this was reported, a direct foreground diagnostic confirmed the repaired launcher, and managed Preview subsequently reconciled to ready. Actual browser gameplay was verified separately from HTTP readiness.

## Open release work

- Real Telegram bot/domain configuration, HTTPS ingress, production deployment, operator-owned privacy/support contacts, real signed Telegram launch and invite/deep-link behavior on devices.
- Production-curated raster artwork. No image-generation tool was available; bundled illustrations are original procedural development art, not a claim of the specified image-generation/art-direction acceptance. Audio is synthesized development audio, not human listening-approved production sound.
- Full scripted tutorial beats, complete haptic/audio-event coverage and human accessibility review; current learning mode offers real untimed play and a rules/comprehension page rather than every prescribed guided beat.
- Human cooperative playtests, usability metrics, retention/analytics policy, observed performance budgets and network/load tests.
- Production retention/cleanup operations, backup/restore drills, ingress rate limits, monitoring and incident runbooks. Current persistence is a single SQLite owner with REST polling, not the recommended distributed PostgreSQL/WebSocket architecture.
- Optional cosmetic purchase/receipt/refund integration remains disabled. No wallet, paid moves, or gameplay monetization was added.
