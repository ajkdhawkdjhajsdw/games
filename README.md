# Quiet Harbor / Тихая гавань

A server-authoritative cooperative harbor puzzle for 2–4 players. Each captain has a private delivery card, one public advisory signal, and one simultaneous move per round.

**Status: playable development implementation, not release-ready.** Production Telegram provisioning, human/device acceptance, and production-approved artwork remain open. See [the verification and release ledger](docs/VERIFICATION.md).

## Run locally

Requires Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. The development launcher runs Vite on port 3000 and the API on 3001, explicitly enables synthetic local identities, and stores private state in git-ignored `data/quiet-harbor.sqlite`. Choose **Practice with bots → Learn without a timer → Set sail** for a quick playthrough. For private crews, share the generated invitation with another browser profile.

```sh
npm test                 # rules, service/security, client content, and Vite privacy
npm run validate:content # exact authored graphs/decks and all 60 certificates
npm run build            # TypeScript check and production static client
npm run verify:runtime   # isolated production-mode API smoke check
```

The versioned `.hoplite/settings.json` provides the same setup and run commands for Preview. A scoped development proxy supports browser same-origin requests within the platform-provided preview hostname namespace; it does not trust forwarded hosts or accept cross-site origins. Production does not use that proxy.

## Implemented

- Deterministic simultaneous resolver: contention, swaps, dependency chains, rotations, deliveries, respawns, and congestion-first terminal precedence.
- Exact 10 maps × 3 crew sizes, 20 deck families, and 60 replayable solution certificates. Certificate data and future jobs remain server-side.
- Private rooms, expiring/revocable invitations, readiness barrier, 20-second rounds, 1.5-second intermission, consent-based bots, boundary control transfer, reports, blocks, and SQLite recovery.
- Responsive EN/RU client, chart and playable node-list modes, private draft restoration, shared results, separate mastery tracks, settings, optional audio, and procedural raster assets.
- Signed Telegram initialization-data verification and HttpOnly sessions; local development login is disabled by default in the standalone API and forbidden in production.

## Architecture and deployment

`client/` is React; `server/rules.ts` is the pure resolver; `server/content.ts` instantiates authored jobs; `server/service.ts` owns the authoritative clock and transactions. The service uses Node native HTTP and SQLite, with REST polling rather than WebSockets. It supports **one server process**, not distributed replicas.

`npm run build` emits only the public client to `dist/`. Production requires an HTTPS ingress serving **only `dist/`**, proxying `/api` to `npm start`, and providing explicit environment configuration from [.env.example](.env.example). Do not serve the repository root, server sources, database, reports, or certificates. Do not run the development launcher in production. Real bot secrets are operator-owned and must never enter `VITE_*` variables.

See [service contracts and operations](docs/SERVICE.md), [asset provenance and reproduction](docs/ASSETS.md), and [verification evidence and remaining gates](docs/VERIFICATION.md).

Build with the full dependency set first (`npm ci --include=dev && npm run build`). A runtime-only deployment can then install `npm ci --omit=dev`; `tsx` is a runtime dependency required by `npm start`. CI also removes development dependencies and checks production-mode startup using an in-memory database and a synthetic token, never production data or secrets.