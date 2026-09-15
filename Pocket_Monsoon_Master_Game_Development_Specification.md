# Pocket Monsoon
## Master Game Development Specification

**A small hillside. Six passing clouds. Every drop has somewhere to go.**

| Document field | Value |
|---|---|
| Product | Pocket Monsoon / Карманный муссон |
| Product ID | SG-G07 |
| Document version | 1.0 — implementation handoff baseline |
| Prepared | 15 September 2026 |
| Source | Supplied *Pocket Monsoon — Software Requirements Specification*, v1.0, 8 September 2026 |
| Platform | Telegram Mini App; responsive web application inside Telegram |
| Languages | English and Russian, with identical rules and content |
| Intended session | Approximately 3–5 minutes; never a countdown or obligation |
| Launch content | 24 authored, six-turn terrains plus a guided introduction using R01 |
| Business model | Free puzzle play; optional cosmetic Stars purchase and voluntary support |
| Status | Documentation, not an implemented or player-tested game |
| Reader | Implementation agent, game designer, visual designer, audio producer, QA and release owner |

> **Handoff instruction:** Build the game described here, not a generic farming game and not a collection of attractive but disconnected screens. Implement the deterministic water model first, make its consequences understandable, then give those consequences a tactile, restrained presentation. Generate the required raster artwork through the available image-generation MCP. Generate original audio from the recipes in this document unless an explicitly approved licensed replacement is used. Do not deliver SVG artwork, runtime AI dependencies, placeholder production assets, paid gameplay advantages or an unverified claim that launch requirements are complete.

---

## Contents

1. [Authority, decisions and boundaries](#1-authority-decisions-and-boundaries)
2. [Creative vision and player promise](#2-creative-vision-and-player-promise)
3. [Scope and product structure](#3-scope-and-product-structure)
4. [Exact simulation rules](#4-exact-simulation-rules)
5. [Modes, assistance, scoring and progression](#5-modes-assistance-scoring-and-progression)
6. [Player journey and onboarding](#6-player-journey-and-onboarding)
7. [Screens and interaction contract](#7-screens-and-interaction-contract)
8. [Visual direction and layout system](#8-visual-direction-and-layout-system)
9. [Accessibility and inclusive interaction](#9-accessibility-and-inclusive-interaction)
10. [Raster asset production specification](#10-raster-asset-production-specification)
11. [Audio, music and haptics](#11-audio-music-and-haptics)
12. [Writing and EN/RU localization](#12-writing-and-enru-localization)
13. [Content design and authoring contract](#13-content-design-and-authoring-contract)
14. [State, architecture and persistence](#14-state-architecture-and-persistence)
15. [Telegram and platform integration](#15-telegram-and-platform-integration)
16. [Economy, entitlements and payment safety](#16-economy-entitlements-and-payment-safety)
17. [Network, offline and failure behavior](#17-network-offline-and-failure-behavior)
18. [Performance, loading and device coverage](#18-performance-loading-and-device-coverage)
19. [Privacy, security and observability](#19-privacy-security-and-observability)
20. [Verification and acceptance matrix](#20-verification-and-acceptance-matrix)
21. [Production sequence and completion contract](#21-production-sequence-and-completion-contract)
22. [Design-agent handoff brief](#22-design-agent-handoff-brief)
23. [Risks and explicit release dependencies](#23-risks-and-explicit-release-dependencies)
24. [Sources and licensing references](#24-sources-and-licensing-references)
25. [Authored terrain catalogue and accounting witnesses](#25-authored-terrain-catalogue-and-accounting-witnesses)
26. [Documentation verification record](#26-documentation-verification-record)

---

## 1. Authority, decisions and boundaries

### 1.1 How to read this document

**MUST** is a release requirement. **SHOULD** is the default unless a documented accessibility, compatibility or measured-performance reason justifies another solution. **MAY** is optional and cannot delay a required feature. Numerical art, mix, timing and balance values are production starting points unless identified as simulation invariants. Performance and usability numbers are targets, not measurements already achieved.

This is the single game-specific implementation handoff. It incorporates the supplied SRS and adds the decisions needed to build it. The supplied attachment remains the historical source, not a second document the implementation agent must mine for missing gameplay rules. Conflicts discovered during implementation must be resolved visibly; never silently change rainfall, turn count, routing, consumption or scoring to make a level or animation work.

The source refers to `00_Stark_Games_Marketplace_SRS.md`, but that file was **not supplied**. Its wallet, marketplace account, purchase, leaderboard and deployment contracts are unknown. Section 15 defines a game-owned adapter boundary, not an assertion about existing marketplace endpoints. Build and verify the standalone development integration without inventing a production platform contract. Real shared-platform conformance remains a named release dependency.

### 1.2 Locked additions to the source baseline

These are deliberate specification decisions, not externally verified facts:

| Topic left open in the source | Decision for this game |
|---|---|
| Terrain edge geometry | An outflow connects one orthogonally adjacent cell at a strictly lower elevation. No diagonal, wrapping or teleporting edges. |
| Plant demand range | Integer 1 or 2 per turn in the launch catalogue. Demand 0 and demand above 2 are invalid launch content. |
| Initial conditions | All launch terrains start with zero stored water and zero growth. |
| Starting selection | No rain cell selected on a new terrain. Selecting never spends a turn. |
| Wind vocabulary | Calm, North, East, South, West; exactly one fixed forecast per turn. Arrows name the direction the cloud moves, not where wind originates. |
| Early completion | Continue to exactly six committed turns; do not silently skip remaining rain. |
| Cosmetics | Three free presentation sets; one optional Cloud and Pot Set containing two additional coordinated styles and one result border. No gameplay differences. |
| Practice availability | All 24 terrains are available after the introduction is completed or skipped. Recommended order is guidance, not a hard lock. |
| Daily mechanics | No daily terrain rotation, streak, notification schedule or time-gated reward in launch scope. |
| Rendering | Accessible DOM grid with raster tile/plant layers and CSS transforms; optional lightweight Canvas 2D effects, never a canvas-only interface. |
| Competition | Optional asynchronous same-forecast comparison, feature-gated. No real-time multiplayer, prize economy or anti-cheat promises based on secret solutions. |
| Audio sourcing | Original procedural production is the default. A vetted CC0 interface-sound pack is a fallback, not an undisclosed dependency. |

### 1.3 Non-negotiable exclusions

No plant death, wilting punishment, idle growth, energy, purchasable rain, paid hints, paid undo, stronger plants, loot boxes, advertising interruptions, mandatory referral steps, competitive time bonus, blockchain yield, token farming, user-uploaded levels, unlimited generated worlds, snowmelt, day/night rules or terrain editing during play. Do not add these to make the game feel “complete.” Completeness means finishing the specified experience.

There is no current request to implement the game, generate its production assets, deploy services or charge users. This delivery is the specification only.

## 2. Creative vision and player promise

### 2.1 The fantasy

You are not a gardener commanding plants to grow. You are the keeper of a very small weather system. A cloud fits beneath your thumb. Below it, a hillside has been folded into sixteen little terraces: pale mineral edges, glazed catchment bowls, dark water channels and plants waiting patiently rather than pleading for rescue.

Place the cloud. A faint landing ring shows where the coming wind will carry it. Before committing, you can follow the entire future of three drops: one held on the upper ledge, two slipping through a notch, roots taking their share, a last bead lifting into the air. Then let it rain. The hillside answers with one small, believable change: a leaf opens, a stem straightens, a bell-shaped flower tips towards the sky.

The sixth cloud passes. The hillside becomes a tiny finished postcard, or an honest record of what did grow. Either is calm. The puzzle remains intellectually precise; the game never tells the player they neglected something alive.

### 2.2 Emotional arc

1. **Invitation:** “I can understand this little place.” One board, six visible forecasts, no dashboard of currencies.
2. **Curiosity:** “That drop went somewhere I did not expect.” The preview explains it before a penalty occurs.
3. **Agency:** “I can arrange the rain, not just press watering buttons.” Upstream and downstream choices matter.
4. **Recognition:** “The upper plant still drinks even after blooming.” Rules are consistent, not surprise traps.
5. **Satisfaction:** “I made a whole hillside work together.” Blooming is a consequence of planning, not a slot-machine reward.
6. **Permission to leave:** “The next cloud will wait.” Closing the app changes nothing.

### 2.3 Design pillars and practical tests

| Pillar | Practical consequence | Reject when |
|---|---|---|
| Every drop is accountable | Integer labels, ordered preview and a balance equation for every turn | Particles suggest water that the simulation did not create |
| Cozy does not mean automatic | Placement, storage, demand and timing create readable tradeoffs | A map is solved by repeatedly tapping the visually biggest plant without inspecting anything |
| Care without guilt | Partial results show achieved growth; plants never deteriorate | Copy implies a plant suffered while the user was absent |
| Small enough to hold in mind | Six known forecasts, 16 cells, at most four plants | Presentation introduces hidden resources or a scrolling world |
| Beauty follows information | Handmade raster art sits behind crisp live numbers | A beautiful bloom covers a flow arrow, target or selected landing cell |
| Generosity is structural | Preview, hints and practice undo are free | Help requires money, watching an ad or inviting someone |

### 2.4 Setting, names and botanical identity

The setting is **The Folded Hillside**, a fictional garden built from shallow ceramic terraces. Do not imply realistic horticulture or water engineering. There are no NPC dialogue trees or exposition scenes. One optional line introduces a terrain; the board does the storytelling.

Three chapters are changes of composition and thinking, not new economies:

- **Rain Lessons / Уроки дождя:** cream stone, fresh green shoots, clear sky; learn where water goes.
- **Wind Studies / Этюды ветра:** pale apricot sky, ribbonlike cloud shadows, slightly warmer pottery; learn to choose the origin rather than chase the landing.
- **Terrace Compositions / Террасные композиции:** deeper fern backdrop, layered stone, a few golden seed-head accents; coordinate several needs without adding new rules.

Four fictional plant silhouettes create visual variety. Species never imply a hidden mechanical ability:

| Semantic species ID | EN / RU name | Silhouette and character |
|---|---|---|
| `bellcup` | Bellcup / Колокольная чашка | Compact upright leaves, one soft bell flower; patient and readable at small size |
| `ribbonfern` | Ribbon Fern / Ленточный папоротник | Two curling fronds with clearly separated tips; a lateral silhouette |
| `starleaf` | Starleaf / Звездолист | Low radial leaves and a small star-shaped bloom; rounded rather than spiky |
| `lanternbud` | Lantern Bud / Бутон-фонарик | Slender stem and two rounded hanging buds; tall but contained within its sprite safe zone |

Plant demand and growth target are always explicit data, not inferred from species or pot. The same species may have a different target on another terrain. If a demand-2 plant is shown, its `Needs 2` label is equally prominent in every cosmetic set.

## 3. Scope and product structure

### 3.1 Required launch experience

- Twenty-four authored terrains in three chapters, each with six visible forecasts, a six-turn winning witness, three explanatory hints and accounting evidence.
- A guided two-plant introduction; skippable and replayable.
- Tap/click and keyboard cloud placement; complete forecast-aware preview; explicit commit.
- Free practice, unlimited undo within the six-turn attempt, replay, reset, study solution and save/resume.
- Completion, partial-growth result and a transparent score calculation.
- Localized EN/RU UI, terrain names, hints, help, errors, storefront and accessibility descriptions.
- Settings for sound effects, ambience, music, haptics, reduced motion, high contrast, text size and locale.
- Free cloud/pot appearances, cosmetic inventory and the optional Stars cosmetic purchase through the approved payment adapter.
- A small album of completed terrain postcards and 1/5/15 distinct-terrain mastery badges.
- Offline play for previously downloaded practice content; no silent promotion to ranked play.
- Authoritative replay, action idempotency, persistence, content validation, tests and operational error handling.

### 3.2 Optional same-forecast challenge

Implement the game-side interface and tests behind `sameForecastChallengeEnabled`; enable production only if the platform supplies identity, immutable challenge metadata, authoritative storage and score comparison. A challenge is the same authored terrain version and forecast for every participant. It is not procedurally generated daily content.

Required when enabled: invite/deep link, challenge preview, standard/assisted distinction, participant aliases with consent, authoritative result and tied rankings. No chat, contact scraping, global friend finder, notifications, live presence, rewards, countdown or speed ranking. Disabling this feature must leave all solo content functional.

### 3.3 Information architecture

`Launch → Home → Chapter/Terrain selection → Terrain briefing → Play → Results`

Secondary routes: `Home → Album`, `Home → Collection`, `Home → Settings & Help`; optional `Home/Profile → Platform profile`; a challenge link enters its briefing directly. Back from gameplay saves the acknowledged state and returns to the briefing/home context. Bottom navigation is absent during play.

Recommended routes, independent of marketplace routing:

| Route | Purpose |
|---|---|
| `/` | Continue or choose a terrain |
| `/terrains` | Three chapters and their eight terrain entries |
| `/play/:attemptId` | A specific saved attempt, never a newly randomized board |
| `/results/:attemptId` | Idempotent read-only summary with replay/practice actions |
| `/album` | Completion postcards and mastery |
| `/collection` | Free and owned cosmetics; the one paid set |
| `/settings` | Preferences, language, help, credits, support and privacy |
| `/challenge/:challengeId` | Optional validated challenge briefing |

## 4. Exact simulation rules

### 4.1 Coordinates and terrain

Columns are `A–D` from left to right. Rows are `1–4` from top to bottom. `A1` is top-left; `D4` is bottom-right. Row-major order is `A1, B1, C1, D1, A2, …, D4`; the flattened index is `4 × (row − 1) + columnIndex`, where A is 0. North decreases the row number; East increases the column.

Every one of the 16 cells has:

- `elevation`: integer 0–3, immutable throughout an attempt.
- `capacity`: integer 0–3, immutable; capacity zero is a valid pass-through/drain cell.
- `outflow`: another orthogonally adjacent cell or null. An existing edge MUST decrease elevation strictly.
- `plant`: zero or one plant, with a stable plant ID, species ID, demand 1 or 2 and target growth 2–4.

Every plant cell MUST have capacity at least its demand. A cell cannot drink overflow before the routing phase is finished. Multiple cells may flow into the same lower cell. A cell has at most one outgoing edge; there are no player-controlled splitters. A single rainfall follows one downstream path, not a branching stream. “Sharing” a cascade means retaining water at successive cells along that path; convergence means several possible feeders can reach the same lower cell.

All cells start dry and all plants at growth zero. Maximum elevation 3 means a directed path has at most three edges. The visual board does not rotate or change compass orientation when the device rotates.

### 4.2 State before a turn

`turnsCommitted` is an integer 0–6. The next forecast is `forecasts[turnsCommitted]`. The state contains the stored integer water for every cell, each plant's integer growth, cumulative rainfall/consumption/drainage/evaporation, committed action history and assistance status.

Selection and preview are ephemeral UI state. A preview must not write growth, water, counters, history, assistance or results. Inspecting a plant, opening the accounting panel and previewing every possible cell remain unassisted actions.

### 4.3 One turn: normative operation order

1. **Validate:** attempt is active, fewer than six turns are committed, selected origin is on the grid, request revision matches, action ID is not a conflicting reuse.
2. **Move the cloud once:** apply the current forecast to the selected origin. Calm leaves it unchanged. N/E/S/W attempts one orthogonal step. If that step is off-grid, the cloud stays at its original edge cell. There is no wrap, bounce, partial rainfall or lost cloud.
3. **Rain:** add exactly **3** integer water units to the landing cell, temporarily allowing water to exceed capacity.
4. **Route:** visit all cells in descending elevation, ties in row-major order. For each, `overflow = max(0, water − capacity)`; keep `min(water, capacity)`. Add overflow to its outflow cell, or add it to drainage if there is no outflow. Lower destinations are processed later in this same phase. Do not route stored water below capacity. Do not route after drinking or evaporation.
5. **Drink:** after the entire routing phase, visit plants in row-major order. If stored water is at least demand, consume demand and increase growth by one, capped at target. Otherwise consume all stored water and gain zero growth. Completed plants still consume in exactly the same way; completion is not a valve or bypass. Demand is per turn, not per growth point remaining.
6. **Evaporate:** after all plants drink, each cell loses `min(1, remainingWater)`. This is one unit **per cell**, not one for the entire board. Zero-capacity and empty cells follow the same routing and evaporation rules as every other cell.
7. **Finalize:** increment the turn, accumulate the ledger, append the committed origin and derived landing, save the resulting state atomically and compute the result if this was turn six.

Consumption is independent of plant iteration order because plants cannot transfer water in this phase. Still use row-major order for stable event logs. Animation order is derived from events; it must never define simulation order.

### 4.4 Conservation and bounds

For each turn, with `S` as total stored water before and `E` after:

`S + 3 = E + consumed + drained + evaporated`

All quantities are non-negative integers. At a turn boundary, `0 ≤ water[cell] ≤ capacity[cell]`; `0 ≤ growth[plant] ≤ target[plant]`. For a new six-turn terrain:

`18 = finalStorage + cumulativeConsumed + cumulativeDrained + cumulativeEvaporated`

For launch content, final boundary storage can never exceed 2 per cell because capacity is at most 3 and positive remaining water evaporates once. Total growth is at most 16 for four target-4 plants; the score cannot exceed 160. A target plan's minimum productive water is `sum(demand × target)`; a value above 18 proves impossibility, while a value at or below 18 does **not** prove feasibility. Completed-plant consumption, partial drinking, evaporation and unreachable wind landings can still prevent success.

At a turn boundary, a demand-2 plant always has zero stored water; a demand-1 plant can retain at most one unit, and an empty cell at most two. Do not teach a demand-2 plant to accumulate two separate insufficient one-unit drinks: each insufficient drink is consumed immediately. Final storage after turn six remains in the result; do not apply a seventh evaporation, automatic drainage or an unused-water bonus.

No random number generator, elapsed wall-clock time, locale, animation duration, screen size, cosmetic or floating-point interpolation belongs in the rules kernel.

### 4.5 Worked example: the first causal lesson

Only the relevant cells are listed. A1: elevation 2, capacity 1, demand-1 plant, outflow A2. A2: elevation 1, capacity 3, demand-1 plant, no outflow. Both dry, both below target. Calm forecast; choose A1.

| Phase | A1 water | A2 water | Explanation |
|---|---:|---:|---|
| Start | 0 | 0 | No stored water |
| Rain | 3 | 0 | Three units land at A1 |
| Route A1 | 1 | 2 | A1 holds one; two overflow into A2 |
| Route complete | 1 | 2 | A2 has room for both |
| Drink | 0 | 1 | Each plant consumes one and gains one growth |
| Evaporate | 0 | 0 | A2's remaining one evaporates |

Ledger: `0 + 3 = 0 + 2 consumed + 0 drained + 1 evaporated`. Evaporation is not drainage and neither is consumption. Display all three separately.

### 4.6 Edge-case examples that must remain visible in QA

- **Insufficient demand:** a demand-2 plant receives only one stored unit after routing; it consumes that unit and gains no growth. Never round partial growth up or leave the unit untouched.
- **Completed demand:** a completed demand-1 plant with one unit still consumes it; growth stays at its target. Preview says `Drinks 1 · fully grown`.
- **Carryover:** an empty capacity-3 cell receiving three rain units ends with two after evaporation. If connected downhill, the next rain on it produces overflow before another unit evaporates. The player cannot manually empty the reservoir.
- **Full downstream cell:** incoming overflow can make it exceed capacity; its own routing step passes that excess farther down in the same turn.
- **No outflow:** water below capacity stays; only excess drains. Do not drain an entire terminal cell.
- **Zero-capacity plant:** prohibited by authoring validation because capacity would be below positive demand.
- **Early all-grown board:** show `All plants have bloomed · finish the forecast`; turns remain playable and final drainage still affects score.
- **Rain on empty ground:** fully legal, possibly a strategic reservoir fill or a nonproductive choice. Never auto-redirect to a plant.
- **Preview after turn six:** final history is inspectable; no seventh-turn prediction or commit exists.

### 4.7 Preview event contract

A simulation call returns both the next state and a canonical event list. Events include cloud shift, rainfall, cell retention/overflow, drainage, plant consumption with growth before/after, evaporation and the final ledger. Use the same output for preview and committed replay.

Preview has five selectable phases: `Rain → Flow → Drink → Evaporate → After`. The default is `After`, with an always-visible compact explanation of the full order. A player can step through phases without spending a turn. Actual flow arrows show integer transferred amounts; plant ghosts show resulting growth without replacing the current value. Example: `1/3 → 2/3`, not an unlabeled luminous flower.

Changing selection, forecast turn, attempt revision or terrain version invalidates the old preview. Async results include their input key; ignore stale responses. A preview never guesses the next turn's forecast and never reveals a different rules variant than the committed engine.

## 5. Modes, assistance, scoring and progression

### 5.1 Attempts and mode labels

Separate **play context** (`practice`, `challenge`) from **assistance** (`standard`, `assisted`, `study`). Practice is always unranked even when its assistance is `standard`. The ordinary Home action starts free practice and does not frame unassisted play as morally superior.

| Action | Practice effect | Challenge effect |
|---|---|---|
| Inspect, reposition, preview, accounting, accessibility tools | No assistance change | No assistance change |
| First hint request | Permanently Assisted for that attempt | Persist Assisted before returning the hint |
| First successful undo | Permanently Assisted | Persist Assisted; compare only in assisted group if supported |
| Study reveal | Permanently Study, unranked | Leaves ranked eligibility; explicit confirmation |
| Restart | New attempt with original terrain/forecast | New attempt; previous result remains immutable |
| Change locale, audio or cosmetics | No assistance change | No assistance change |
| Open a separately available solution outside the game | Cannot be reliably detected | Do not claim the leaderboard proves no external help |

If undo is unavailable at turn zero, pressing its disabled control does not mark assistance. Revealing the same hint twice does not create another charge or state change. Mark assistance before showing help so app closure cannot expose a hint while retaining a standard label.

### 5.2 Undo, reset and study

Undo restores the entire previous turn-boundary snapshot: all water, all growth, current turn, all cumulative accounting counters, rain history and provisional result state. Assistance is a monotonic metadata field outside rollback snapshots. Network revisions and audit IDs are also monotonic; undo must not reuse an old revision number.

Practice allows repeated undo back to the initial state, including from the result screen. A previous completed attempt's granted mastery/progress is not retracted by a later practice undo. If a finalized server result has already been published, `Undo in practice` creates a linked unranked practice fork of the snapshot; it cannot rewrite the submitted challenge result. The UI must describe the fork.

Reset requires confirmation only after a committed turn, or when replacing a saved attempt: `Start this terrain again? Your saved attempt will be replaced; completed postcards stay.` It restores original water/growth and the same six forecasts. A reset creates a new attempt ID, not a silent reassignment of a completed attempt.

Each terrain has three progressive dependency hints. Hint 1 names a relationship; hint 2 points to the relevant capacity/demand/timing; hint 3 explains a useful next action or recovery. Author-written hints in section 25 are valid guidance about the terrain, not an unconditional promise that an arbitrary current state can still win. Before suggesting a winning next action, check the current state with the six-turn solver. If no completion is possible, say `This arrangement cannot finish every plant within the remaining turns. You can undo, restart, or explore the rest.` Do not pretend a losing continuation is a solution.

Study reveal during an active attempt permanently marks that attempt Study and shows the full six-origin witness and matching landings, with a phase-by-phase replay and the label `Study · no ranked score`. For a partly played attempt, offer `Study from the beginning` as a separate replay, or a verified continuation if one exists. Never splice the beginning witness onto an incompatible mid-attempt state. Returning from the viewer preserves the active board and its Study label. `Try this plan` creates a new practice attempt from the original initial state, also labeled Study; it does not downgrade assistance to Assisted.

After a finalized result, hints and `Study this terrain` open a separate read-only study session. They do not change the finalized attempt's assistance, score or comparison group. The viewer itself grants no completion or mastery. Completing a six-turn interactive practice/Study attempt by making the moves can grant ordinary progression; watching or auto-playing the read-only solution cannot.

### 5.3 Completion and score

Full completion is evaluated at the end of turn six and means every plant has reached its own target. Anything else is partial growth, regardless of score.

`score = max(0, 20 × plantsAtTarget + 5 × totalGrowth − totalDrainedUnits)`

`totalGrowth` is the sum of final capped growth across plants. Consumed and evaporated water do not directly subtract score. Do not subtract incomplete targets again. There is no move-efficiency, unused-water, first-try, time or spending bonus.

Result example: two completed plants, total growth 6, drainage 0: `40 + 30 − 0 = 70`. If the same board drained 3, score is 67. Display this arithmetic in the score detail panel. Score is a secondary explanation of the attempt; full completion receives visual priority.

For optional comparisons, the partition key includes game ID, terrain ID, terrain version, rules version, exact forecast/seed, challenge ID where applicable and assistance class. Compare full completions separately from partial results; sort by score descending within each group. Equal scores share a rank. Completion timestamp may be used for stable display ordering but must not break ties or reward speed. Replays update a user's best result in the same group, never add cumulative points by resubmitting.

### 5.4 Progression without chores

After completing or skipping the introduction, every terrain is selectable. The interface recommends the next uncompleted terrain in chapter order. Wind and Terrace chapter cards display their learning focus, not locks or purchase buttons. Replaying the tutorial is always free.

Completion earns a postcard using the final board and one contribution towards distinct-terrain mastery. Interactive practice completions count in Standard, Assisted and Study; a read-only Study replay does not. A terrain counts once regardless of versions or repeated completions. Badge thresholds: **1 — First Clearing / Первая ясность; 5 — Rain Listener / Слушатель дождя; 15 — Hillside Keeper / Хранитель склона**. At 24, the album displays `All 24 hillsides explored` only if all 24 are completed; this is an album state, not a new currency tier.

Postcards are deterministic compositions rendered from approved raster assets and state, not a new image-generation call. No completion can be sold, transferred or converted to Stars/TON. There are no retention notifications by default or rewards for returning tomorrow.

## 6. Player journey and onboarding

### 6.1 First minute

1. Load a cream canvas with the wordmark and one still cloud. No fake progress percentage. Call Telegram readiness when the first meaningful screen is usable.
2. Home presents `A little weather, entirely in your hands.` and `Begin`. A quiet sound toggle defaults off until the player opts in. `Skip introduction` is visible, not hidden in Settings.
3. The introduction opens R01 with two plants and all six calm forecasts. Explain `Six turns. Three water units each turn. Nothing changes while you are away.`
4. Highlight the upstream cell without disabling the alternate cell-list navigation. Ask the player to select it. Wrong selections remain inspectable; offer a gentle pointer, never an error buzz.
5. Show the predicted split. Ask: `After the water flows, how many units will be at the lower cell?` Offer numeric choices and `Show me`. This teaching question does not commit a turn or affect scoring.
6. Demonstrate `Water flows before plants drink.` Step the preview through flow, drinking and evaporation. Let the user commit with `Let it rain`.
7. Show two plants' growth increments and `3 rain = 2 consumed + 1 evaporated`. Open the ledger once, then collapse it on request.
8. Explain that a blooming plant still drinks; let the player finish the six turns. The remainder is ordinary gameplay, with optional hints rather than a long forced script.

The introduction uses the actual engine and R01 content, not a cinematic simulation with different capacities. Its teaching mode is Assisted and unranked; completing all six actual turns successfully can grant R01's postcard. Skipping grants no completion and unlocks ordinary selection. Tutorial presentation state is saved separately from game state.

### 6.2 A typical later session

`Continue Wind Study 04 · turn 3 of 6` resumes the exact acknowledged state. The player inspects a plant, sees that East wind will shift the cloud away from the intended landing and chooses the adjacent origin. Preview shows one plant growing and another remaining unchanged. The player changes the placement before committing; no undo or assistance is involved. The cascade resolves in less than half a second, followed by an optional slower inspection. On turn six, the result offers `Next terrain`, `Explore again`, `See the water ledger` and optional `Share postcard`.

### 6.3 When a plan does not finish

Show the same garden, not a darkened failure screen. Copy: `A little more room to grow.` List `2 of 3 plants bloomed` and `8 of 9 growth steps`. Keep the unfinished plant's healthy current-stage artwork. Offer `Undo in practice`, `Try again`, `Study this terrain`, `Choose another hillside`. Do not shake plants, play a sad musical sting, apply red death overlays or force an immediate retry.

## 7. Screens and interaction contract

### 7.1 Global screen states

Every data-bearing screen has defined loading, ready, empty, recoverable-error and unavailable states. Skeletons must use the final layout footprint. Do not show a zero inventory or erase saved progress while loading. A network warning must never masquerade as a legitimate empty collection.

| Screen | Required content and primary action | Important secondary/edge behavior |
|---|---|---|
| Home | Continue card if present; Play/Choose terrain; three chapter cards | Multiple saved attempts list; offline availability; accessible settings |
| Terrain selection | 24 entries with ID, localized name, chapter, plant count, insight and completion mark | No score comparison across different maps; filter optional, search unnecessary |
| Briefing | Full six forecasts, plant demand/targets, board thumbnail, practice/challenge label | Start/Resume; clear same-forecast challenge terms; no premature auto-start |
| Play | Board, all forecasts, turn counter, plant roster, selected origin/landing, preview, commit | Undo/hints/accounting/help; alternate cell list; saved/sync status |
| Results | Final board, completion/partial label, growth, score arithmetic, assistance | Retry/new attempt; study; ledger; next terrain; safe share preview |
| Album | Completed postcards, distinct total, three mastery badges | Empty encouragement without pressure; no dates needed for progression |
| Collection | Free sets, owned set, paid-set preview and price | Preview is temporary; equip persists; payment pending/cancel/error/refunded states |
| Settings & Help | Locale, audio buses, haptics, motion, contrast, text size, rule glossary | Credits/licenses, privacy, support, restore preferences; no destructive reset adjacent to normal toggles |
| Challenge, if enabled | Same board/forecast/version, assistance grouping and opt-in alias | Unavailable/archived/version mismatch; return to ordinary practice |

### 7.2 Play layout at normal text size

At a 390 CSS-pixel portrait viewport, the game uses 16 px outer padding. The board frame is approximately 358 px wide. Within it, use 8 px inner padding and 6 px gaps; each of the four equal cell targets is approximately 81 px square. Do not require pixel-perfect reproduction if browser safe areas change available width; preserve at least 44 × 44 px interactive targets.

Top to bottom:

1. Header: Back, terrain name/ID, compact settings. Approximate height 48–56 px.
2. Forecast strip: six equal entries, numbered 1–6, each with direction shape and accessible direction text. Current turn outlined; past turns marked done. Approximate height 56–64 px; can become two rows for enlarged text.
3. Status: `Turn 2 of 6 · 3 units of rain` and `Practice · Assisted` as appropriate.
4. Board: unchanged north-up 4×4 lattice, coordinates always available.
5. Plant roster: two-column cards for up to four plants at normal size; one column at enlarged size. Each card shows coordinate, species name, demand, growth/target and completion status.
6. Selection summary: `Cloud B2 → rain C2 · East wind`. Without selection: `Choose a rain cell first.`
7. Actions: `Preview cascade`/phase control, primary `Let it rain`, then Undo, Hint, Water ledger. The commit is a regular in-app button, not a required Telegram MainButton.

At a typical tall phone size, the board and current plant counters should be readily visible; avoid filling half the screen with title art. On shorter displays or 200% text, vertical scrolling is correct. Never shrink numbers, conceal forecasts or disable zoom just to make the entire screen fit.

### 7.3 Cell visual anatomy

Each cell has a stable rectangular interaction plane regardless of decorative terrace height. Back-to-front: terrain tile, shallow water fill texture, plant/pot, outgoing channel cue, live numeric badges, selection/focus/landing overlays. Elevation is a visible `H0–H3` chip or compact stepped shape with number. Capacity/current water is `0/2` beside a droplet shape; the detail panel expands it to `Water 0 of 2 capacity`. Plant demand/target are not replaced by the cell water fraction.

Selected cloud origin: dashed dark outline plus cloud marker. Forecast landing: solid blue double ring plus `Rain +3`. When both are the same cell, combine these without hiding either meaning. Preview destination cells use neutral ghost badges prefixed `After`, not numbers that look committed. Outflows are a visible channel and arrow, with destination text in details/list view. A null outflow has a small drain/notch symbol and `No outflow` in details; it does not mean all stored water disappears.

No sprite extends over a neighbor's information area or changes its hitbox. Text/number overlays are HTML, not pixels baked into an asset.

### 7.4 Input and confirmation

- Tap/click selects a cell. A second tap keeps the selection; it never commits implicitly.
- Tapping a plant's roster card focuses its cell and opens details without changing the chosen rain origin unless the user explicitly selects it for rain.
- `Preview cascade` opens the phase inspector. Selection may also update a compact final preview automatically; neither action costs a turn.
- `Let it rain` is disabled without a valid selection, during an unresolved server commit and after turn six. Its accessible disabled reason is available as adjacent text.
- Dragging is optional polish. If supplied, show the landing ring continuously, use pointer capture, cancel safely on interruption and require the same explicit commit button. Do not prevent ordinary vertical scrolling outside the board.
- Enter/Space on a cell selects; it does not both select and commit. Escape closes the topmost panel first, then clears a preview/selection only where clearly announced.
- No double-tap shortcut, long-press requirement or gesture-only action. Every modal traps focus appropriately and restores focus to its opener.

### 7.5 Interaction state machine

`BOOT → READY_UNSELECTED → READY_SELECTED ↔ PREVIEW_INSPECTING → COMMIT_PENDING → RESOLVING → READY_UNSELECTED | RESULT`

Selection clears after a committed turn so the next placement is deliberate. Focus stays on the corresponding cell or next action, not at the document top. A resolved animation may be skipped at any time; gameplay state is already authoritative. Network-pending is distinct from the sub-500 ms local visual sequence. On server delay, display `Saving turn…` with a calm status instead of looping rain.

Local practice passes through the same states, but durable local storage is its acknowledgment. If local saving fails, offer an explicit unsaved-session continuation; do not show `Saved`.

### 7.6 Accounting inspector

Collapsed summary: `Rain 3 · Drank 2 · Drained 0 · Evaporated 1 · Stored 0`.

Expanded content includes starting storage, three rain units, ending storage, all three sinks, a balanced-equation indicator, per-cell transfers, per-plant drinking/growth and a turn selector 1–6. Use `Consumed` in the formal ledger and `Drank` in compact garden-facing copy, with a shared glossary definition. The inspector may replay past phases without changing live state. It identifies actual history versus proposed preview clearly.

## 8. Visual direction and layout system

### 8.1 Art direction: “a ceramic weather study”

The primary direction is a hand-finished, shallow-relief botanical diorama. Terraces feel like cream ceramic and weathered limestone, plants like thick gouache leaves, water like ink-blue enamel. The composition is warm, calm and precise. It is not a glossy casino, emoji collage, pixel farm, photorealistic bonsai photograph, fantasy RPG HUD or dashboard with green cards.

Keep the **interaction grid square and orthographic**. Raster tile art may include a shallow front bevel and soft top-left lighting, but do not rotate the whole board into an isometric diamond. A consistent apparent light direction around 315° produces coherent highlights; shadows are soft, short and purely decorative. All four elevations share the same visible top-face footprint. Elevation differences use bevel texture/step markings, not displacing cells or overlapping their controls.

The atmosphere lives around the board: a faint hill silhouette, two or three quiet background botanical fragments, a gentle horizon wash. During planning, this background is static. Deliberate empty space is preferable to particles and decorative controls.

### 8.2 Palette and roles

| Token | Baseline | Role |
|---|---|---|
| `paper` | `#F6F1E7` | Main canvas |
| `surface` | `#FFFCF5` | Cards and sheets |
| `terrace` | `#DDD0B8` | Ceramic/stone tile body, not body text |
| `ink` | `#203D39` | Main text and highest-priority outlines |
| `mutedInk` | `#52645D` | Secondary text after contrast verification |
| `leaf` | `#39735A` | Plant foliage and completion accents |
| `leafLight` | `#A8C58B` | Decorative leaf highlights |
| `water` | `#245E85` | Rain, stored water and landing outline |
| `waterLight` | `#B8DCE6` | Non-text preview water fill |
| `sun` | `#D5AA54` | Warm decorative accents; never small text on cream |
| `clay` | `#A65D48` | Pot accents and nonfatal warning icon fill |
| `focus` | `#654DB5` | Keyboard focus, distinct from blue selection |

These tokens are proposals, not a certified contrast palette. Measure actual foreground/background pairs in all states, including disabled labels and translucent overlays. Meet WCAG AA text contrast and 3:1 essential non-text contrast. High-contrast mode removes paper grain, deepens outlines and uses solid fills. Color is always redundant with text, number or shape.

### 8.3 Typography, spacing and components

Use **Nunito Sans**, self-hosted with Latin and Cyrillic coverage, as the single font family [R8]. Body 16 px/1.45, compact supporting text 14 px/1.4, button text 16 px/1.25 semibold, screen heading 26–30 px/1.15 bold. Important water and demand values use tabular numerals at 16–20 px. Do not use a decorative script for Russian or substitute a mismatched Cyrillic fallback.

Use a 4 px spacing unit; primary gaps 8/12/16/24. Surface corner radius 16–20 px, button radius 14 px, numeric chip radius 8 px. Shadows are low-opacity and never required to perceive a button. Primary button: solid ink/water, high-contrast light text, minimum height 48 px. Secondary: outlined or lightly tinted with a visible boundary. Destructive actions are text-labeled and separated, not merely reddish.

Loading and error components reuse the same typography. Do not bake the wordmark, localized names, numbers or button text into illustration exports.

### 8.4 Responsive behavior

- **320–479 px:** single column; board uses available width; plant cards wrap; accounting is a sheet or inline expansion. No horizontal page overflow.
- **480–767 px:** centered board up to 420 px wide, more space for roster/details; keep controls near the board.
- **768 px and above:** board left, forecast/plant roster/preview details right within a maximum 960 px content frame; never enlarge the 16 cells into an empty full-screen spreadsheet.
- **Landscape phone:** use a two-column layout only if board cells remain at least 44 px; otherwise keep a scrollable portrait-style column. Do not force orientation.
- **200% text:** preserve board positions while moving extensive labels into a persistent roster and the equivalent cell list. Forecast text may wrap; controls stack. All values remain reachable without truncation-only tooltips.
- Respect both device safe areas and Telegram content safe areas; fixed bottom actions must not cover the last roster row or the system gesture region.

### 8.5 Motion choreography

| Event | Baseline timing | Meaning |
|---|---:|---|
| Selection outline | 90–120 ms | Confirms focus/selection, no elastic overshoot |
| Forecast cloud shift | 60–80 ms | Origin-to-landing movement |
| Rain arrival | 70–90 ms | Exactly three units represented |
| Routing | 110–160 ms total | Transfer labels follow topological waves; long paths stay inside this budget |
| Drinking and growth | 80–100 ms | Water disappears at roots; progress changes |
| Evaporation/settle | 40–60 ms | Remaining unit per wet cell lifts/fades |
| Result bloom accent | Up to 600 ms, nonblocking | Optional completion flourish after input is available |

The main sequence's combined duration MUST be at most 500 ms, not the sum of independent per-cell delays. Parallelize events within a routing wave; provide the phase inspector for slow understanding. The authoritative next state is applied once, not dripped in by animation callbacks. No idle bouncing cloud, constant plant breathing, camera shake or flashing reward burst.

Reduced motion replaces movement with a static before/after state change and text summary; decorative crossfades may be zero. Normal mode never exceeds three flashes in a second. Backgrounding cancels visual playback rather than scheduling a backlog.

## 9. Accessibility and inclusive interaction

Treat accessibility as the board's second, equivalent representation, not a post-launch caption overlay. WCAG 2.2 AA is the baseline target [R6–R7]; the game's **44 × 44 px** touch target is a stronger product requirement than WCAG 2.5.8's general 24 px AA minimum.

### 9.1 Semantic board

The default board supports an accessible grid pattern with one roving tab stop. Arrow keys move by row/column without wrapping; Home/End move within a row; Control+Home/End move to A1/D4. Enter/Space selects the focused cell. Tab moves out to the next action. Alternatively, a simpler correctly labeled 16-button group is acceptable if full keyboard navigation is equally tested; do not mix incomplete ARIA patterns.

Provide a `List view` toggle with 16 row-major entries. Each entry exposes coordinate, elevation, water/capacity, destination or no outflow, plant demand/growth/target and a `Place cloud here` control. Sorting cannot remove the stable coordinates. Selection and phase state are shared between board and list. This view provides complete play, not just read-only inspection.

Example accessible cell description:

`B2. Height 2. Water 0 of 1. Flows to B3. Bellcup: needs 1 per turn, growth 1 of 3. Selected cloud origin. East wind: rain will land at C2.`

Use a polite live region for the summary after a commit: `Turn 2 complete. Bellcup grew to 2 of 3. Two units consumed, one evaporated, none drained.` Announce a summary once; do not announce every decorative droplet. Phase inspector changes announce the chosen phase and its values. New critical errors use an appropriate alert without stealing focus unnecessarily.

### 9.2 Inclusive visual and input requirements

- Every plant need, growth target, elevation, outflow and forecast has numeric/text plus shape representations. Monochrome screenshots must remain solvable.
- Water/current capacity and growth/target use different labels and icons; two unexplained fractions are not acceptable.
- Text scaling 100–200% is available in-app for WebViews that do not honor browser text zoom. Also respect OS/browser enlargement where available; never set `user-scalable=no`.
- Focus is visible at all times, with a high-contrast ring outside the selected-state border. Zooming, resizing and opening panels preserve logical focus and selection.
- All drag/hover/long-press information has a tap, keyboard and screen-reader equivalent.
- No task requires sound or haptics. No demand, forecast or completion cue is audio-only.
- Use semantic buttons, form labels, reduced-motion media preference, readable error text and a logical heading hierarchy.
- Test VoiceOver in iOS Telegram and TalkBack in Android Telegram, not only desktop screen-reader emulation.

## 10. Raster asset production specification

### 10.1 Production policy

The implementation agent has image-generation access through MCP. Use it to produce original, stylistically consistent **raster** assets. Do not assume a particular MCP tool name, image model, transparency support or output resolution; discover the available generation capability before the art pass. Asset generation happens during development, never in the player's session.

Required deliverables are editable high-resolution source images, processed PNG masters, optimized WebP/PNG runtime exports, atlas metadata where used and an asset provenance manifest. No SVG files, SVG data URLs, auto-traced vectors or SVG-based icon library. CSS boxes/borders and Canvas 2D geometric effects are permitted for layout and live overlays; they are not substitutes for the required illustrated terrain, plants and clouds.

Generate clean objects without text and overlay all semantic content in HTML. If the service cannot create transparency, request a flat removable background, segment carefully, remove halos and review at runtime size. Never ship a checkerboard painted into the image. Do not simply generate a complete board screenshot and place invisible hotspots over it.

### 10.2 Style lock and image prompt framework

First produce a **style-lock sheet** containing one terrace, all four plant silhouettes at mature stage, one cloud, one pot and a background swatch. Approve a coherent visual direction before generating hundreds of unrelated variations. A designer may replace this direction later through an explicit approved revision; a missing future moodboard does not block a coherent baseline.

Base prompt, reused with asset-specific suffixes:

> Original cozy botanical puzzle-game asset, miniature ceramic hillside weather study, warm cream limestone and hand-glazed pottery, thick gouache botanical shapes, ink-blue water accents, restrained paper texture, soft top-left light, clean legible silhouette, shallow orthographic top-down presentation with a small front bevel, quiet premium craft aesthetic, limited palette matching cream #F6F1E7, dark green #203D39, leaf #39735A and water #245E85. One isolated subject, centered and fully contained, consistent scale and light, no text, no letters, no numbers, no logo, no watermark, no interface, no frame, no perspective distortion, no photographic background.

Negative direction: avoid glossy mobile-casino rendering, copied franchise motifs, named living-artist imitation, emoji faces, translucent unreadable leaves, excessive glow, heavy grain, sharp thorns, horror expressions, treasure, coins and money imagery. Generated licensing/usage rights must be checked against the actual MCP provider's current terms; generation alone is not legal clearance.

For plants, use an approved mature reference to generate stages with identical pot anchor, camera, silhouette family and palette. Do not ask a model to paint five labeled stages into a single image and rely on its layout accuracy. Generate each or a carefully reviewed unlabeled strip; create the final atlas programmatically after inspection.

### 10.3 Mandatory asset manifest

Runtime filenames below are a contract; `{…}` describes an enumerated variant, not an unresolved creative placeholder. All transparent sprites use straight-alpha PNG masters, with tested alpha after WebP optimization. Keep at least 8% transparent padding around isolated shapes; pack atlases with 2–4 px extrusion to avoid neighboring-sprite bleed.

| Asset ID / runtime filename | Required count | Master / runtime target | Production brief and usage |
|---|---:|---|---|
| `brand/app-icon` | 1 | 1024² / 512² PNG | One cream terrace with a small blue cloud and green shoot; no text; recognizable at 48 px |
| `brand/share-base` | 1 | 2400×1260 / 1200×630 WebP | Empty postcard composition with safe central board area; add localized title/score live when exporting |
| `background/{rain,wind,terrace}` | 3 | 1600×2400 / 800×1200 WebP | Three quiet atmospheric chapter backdrops; center kept low-detail and low-contrast |
| `terrain/tile-h{0,1,2,3}-{a,b}` | 8 | 512² / 192² WebP | Four readable bevel/step heights, two texture variations each; same top plane and tile footprint |
| `terrain/channel` | 1 | 512² / 192² PNG/WebP | Straight shallow blue-ink notch aligned north; rotate only by exact 90° steps; amount/arrow drawn live |
| `terrain/drain` | 1 | 256² / 96² PNG/WebP | Small terminal outlet notch, distinct from evaporation |
| `terrain/water-{1,2,3}` | 3 | 512² / 192² PNG/WebP | Three shallow enamel-fill overlays, no printed numerals; don't imply continuous physics |
| `plant/{bellcup,ribbonfern,starleaf,lanternbud}/stage-{0,1,2,3,4}` | 20 | 512² / 192² PNG/WebP | Healthy stages from shoot to fully open; consistent root anchor at x50%, y78% |
| `cloud/{cotton,pebble,linen,pearl,indigo}` | 5 | 768×512 / 288×192 PNG/WebP | Same cloud silhouette envelope; cotton/pebble/linen free, pearl/indigo in the paid set |
| `pot/{chalk,clay,moss,pearl,indigo}` | 5 | 512² / 192² PNG/WebP | Chalk/clay/moss free; pearl/indigo paid; same number-safe area and visual weight |
| `result/border-{plain,monsoon}` | 2 | 1400² / 700² PNG/WebP | Plain free frame and subtle paid monsoon frame; never alter score hierarchy |
| `chapter/{rain,wind,terrace}` | 3 | 1024×640 / 512×320 WebP | Board-adjacent vignette, no labels; reuse on chapter cards, not as gameplay backgrounds |
| `badge/{first-clearing,rain-listener,hillside-keeper}` | 3 | 512² / 128² PNG/WebP | Ceramic medallions with cloud/leaf/hillside motifs; no currency symbolism |
| `fx/{drop,ripple,evap-wisp,growth-spark}` | 4 | 256² / 64² PNG | Small readable masks/sprites; no random confetti; reduced motion omits these |
| `ui/{icon-id}` | 24 | 256² / 64² PNG | Coherent dark-ink raster icon set listed below; icons accompany live accessible labels |
| `texture/paper` | 1 | 512² / 256² WebP | Seamless subtle paper grain; disabled in high contrast |

Total: **85 primary runtime raster images**, before optional density variants or atlas packing. A build may combine them into atlases but must preserve the manifest IDs. The 24 terrain thumbnails, 24 postcards, item previews, result variations and share cards are **derived compositions**, not 24 separate generated paintings.

The 24 icon IDs are: `back`, `close`, `settings`, `help`, `undo`, `restart`, `play`, `pause`, `next`, `previous`, `check`, `cloud`, `droplet`, `wind-arrow`, `calm`, `height`, `drain`, `evaporate`, `plant`, `sound`, `music`, `haptic`, `share`, `collection`. Rotate `wind-arrow` for direction. Toggles, volume-off slash and selection shapes can be CSS/live overlays; a new raster icon is not required for every state. A text `★` or platform-provided approved Stars representation may label prices; do not download an unofficial Telegram logo or imitate a cryptocurrency mark.

### 10.4 Asset-specific prompt suffixes

| Family | Add to the base prompt |
|---|---|
| Terrain | “One square terrace tile viewed orthographically, unambiguous horizontal top face, shallow visible front lip, no plants, no water, no paths or numbers, same contact footprint as reference.” |
| Bellcup | “A small original plant with two broad leaves and a single bell-shaped blossom, compact upright silhouette, healthy stage [stage description], no pot, roots hidden below fixed lower anchor.” |
| Ribbon Fern | “Two soft ribbon-shaped fronds unfurling in opposite directions, strong negative space between tips, healthy stage [description], no pot, no fern forest background.” |
| Starleaf | “Low radial cluster of rounded star-arranged leaves with one tiny central bloom, gentle geometry, healthy stage [description], no pot.” |
| Lantern Bud | “Contained slender stem with two rounded hanging lantern-like buds, no face or glow, maximum silhouette height equal to reference, healthy stage [description], no pot.” |
| Cloud | “One low wide friendly cloud without a face, opaque light body, readable flat underside, silhouette contained within 80% width and 70% height, no rain, no lightning.” |
| Pot | “A small shallow ceramic catchment pot, wide stable rim, front face quiet enough for separately rendered labels, no plant, no markings.” |
| Background | “Portrait atmospheric garden backdrop, soft distant folded hillside near outer edges, broad quiet cream center, no focal character, no game board, no text.” |
| UI icons | “One chunky ink symbol for [meaning], single consistent stroke-like mass, strong negative space, designed to remain recognizable at 20 pixels, no text, isolated transparent background.” |

### 10.5 Growth-stage mapping

Five illustrations represent normalized visual growth `v0–v4`, not five mandatory gameplay steps:

| Plant target | Growth-to-visual mapping |
|---|---|
| 2 | 0→v0, 1→v2, 2→v4 |
| 3 | 0→v0, 1→v1, 2→v3, 3→v4 |
| 4 | 0→v0, 1→v1, 2→v2, 3→v3, 4→v4 |

Actual growth always remains the live numeric fraction. A target-2 plant must bloom fully at 2, not remain an early-stage shoot. Water deprivation never replaces its art with a wilted sprite. Species assignment in a terrain is presentation-only; use stable plant IDs in saves.

### 10.6 Material and export quality gates

- Review at 1× phone size, 2× density, monochrome, high contrast and dark Telegram chrome. Inspect alpha edges against both cream and dark surfaces.
- A mature plant must not obscure its cell's capacity, height, flow arrow or adjacent plant. A cloud must not cover the selected landing marker or `+3`.
- Keep source color in sRGB; strip location/author metadata from runtime exports. Do not premultiply alpha twice.
- Keep tile and plant anchors consistent to within one runtime pixel when switching states. No apparent hopping between frames.
- Use WebP where supported with PNG fallback for essential transparency if target WebView decoding fails. Essential labels and solid cell outlines render even when an image fails.
- Asset manifest fields: ID, source prompt, model/provider/version when exposed, generation date, seed/reference hashes if available, master/export paths, dimensions, pivot, content hash, license/terms URL and review status. Unknown seeds are recorded as unavailable, not fabricated.
- Retain downloaded license files and attribution notices. Do not hotlink assets in production. Do not claim assets were generated or approved merely because this document supplies their prompts.

## 11. Audio, music and haptics

### 11.1 Sound identity

The game should sound like rain touching glazed pottery beside an open window: soft impacts, short resonances and enough silence to think. No orchestral triumph, casino sparkle, cartoon gulping, repeated birdsong, thunder jump scare or shame cue for incomplete growth. Audio is a subtle explanation of events, not a stream of rewards.

Default all audible buses off on first launch; show an optional `Sound on` control. Persist the choice. Sound effects, ambience and music have separate on/off and volume controls. Haptics default off and are independently optional. No microphone permission or device recording is needed.

### 11.2 Default acquisition plan: generate original audio

Produce all sounds offline during development with deterministic synthesis scripts and retain the scripts/seeds alongside lossless masters. Use a separate audio PRNG, never the gameplay kernel or terrain seed. Suggested fixed audio seed family: `pm-audio-v1:<sound-id>:<variant>` hashed into a documented PRNG. All required event cues can be made with sine/triangle oscillators, enveloped filtered noise, short resonators, tiny delays and gentle saturation; no commercial sample library is required.

Master at 48 kHz, 24-bit PCM WAV. Runtime: MP3 for a broadly compatible compressed path and optional Opus alternative selected by actual decoding support; small critical effects may use 16-bit PCM WAV if this is smaller/safer for the chosen packaging. Do not assume every Telegram WebView decodes Ogg/Opus. Keep lossless masters out of the initial web download.

### 11.3 Sound manifest and recipes

| Sound ID | Variants / duration | Trigger and original synthesis recipe |
|---|---|---|
| `ui-select` | 3 × 55–80 ms | Selecting a new cell; soft 430–620 Hz sine/triangle blip, 3 ms attack, exponential decay, faint band-limited noise; quiet enough for rapid exploration |
| `ui-confirm` | 1 × 110 ms | Commit accepted, not merely tapped; two rounded partials around D5/A5 with a 12 ms stagger; no bell-like piercing high end |
| `ui-open` | 1 × 90 ms | Opening a sheet; low filtered noise brush rising slightly in cutoff |
| `ui-close` | 1 × 70 ms | Closing a sheet; reversed envelope contour, not a reversed speech-like sample |
| `ui-undo` | 1 × 160 ms | Successful undo; two soft notes A4→D4, clear but not a failure sound |
| `cloud-shift` | 2 × 100–140 ms | Non-calm wind movement; low-level band-pass noise sweep 350–1400 Hz, short and airy |
| `rain-drop` | 4 × 65–120 ms | Individual drop accent; downward sine chirp around 1000→450 Hz plus a 5 ms filtered transient and damped ceramic partial near 1500 Hz |
| `water-overflow` | 3 × 120–220 ms | Route wave; filtered pink-noise trickle with 2–3 quiet drop impulses; trigger per wave, not per particle |
| `plant-drink` | 2 × 90–130 ms | Productive drinking group; rounded 220–400 Hz pluck, no human mouth sound; no special penalty cue for partial consumption |
| `plant-grow` | 4 × 180–280 ms | A growth increment; one soft pitched resonance chosen from D5/E5/F#5/A5, with a breathy tail; cap simultaneous voices |
| `water-drain` | 1 × 160 ms | Positive drainage; quieter descending liquid trickle, neutral rather than alarming |
| `water-evaporate` | 1 × 120 ms | At most one grouped cue per turn; very quiet high-pass breath with steep attenuation above 6 kHz |
| `result-complete` | 1 × 1.2–1.8 s | Full completion; sparse D5–A5–B5–F#5 figure over D4/A4, soft mallet synthesis, no explosive cymbal |
| `result-partial` | 1 × 0.7–1.1 s | Six turns with partial growth; stable D4/A4 dyad and gentle resonance, emotionally neutral and complete |
| `mastery` | 1 × 1.0–1.4 s | New distinct-terrain badge; restrained variation of completion motif; play only once and not over another result sting |
| `ambience-rain` | 1 × 12 s seamless loop | Quiet filtered pink noise plus sparse synthetic surface droplets; no storm/wind peaks; not tied to fake continuous rainfall on the board |
| `music-garden` | 1 × 60 s seamless loop | Original sparse sixteen-bar composition defined below; optional two stems for mixing, not extra download requirements |

There are **27 short-effect files plus two loop files**, before alternate codecs. Produce the named variant counts, not 27 different semantic events. Variants cycle deterministically or use the audio-only PRNG; neither changes state or score. Check the count against the final manifest rather than treating this table as permission to omit a cue.

### 11.4 Original music composition brief

Tempo **64 BPM**, 4/4, sixteen bars = 60 seconds. Tonal center D major with open fifths and gentle added-sixth/ninth colors. Sound sources: damped sine/triangle mallet, very low-level warm pad and a short synthetic room tail. No drums, lyrics, recognizable quotations or imitation of a named composer.

One eight-bar phrase repeats with a thinner second half. Notes below are MIDI-style note names; each comma-separated event occupies one beat unless a duration is shown; `rest` is silent. Middle C is C4. Bass/chord notes are held quietly for a bar, with 80–150 ms attack and a short overlap into the next bar. High voice must stay behind UI audio.

| Bar | Quiet harmony | Lead figure |
|---:|---|---|
| 1 | D3–A3–B3–F#4 | D5, rest, A4, rest |
| 2 | D3–A3–E4 | F#5 (2 beats), E5, rest |
| 3 | G3–D4–F#4 | B4, D5, rest, A4 |
| 4 | G3–B3–E4 | E5 (2 beats), rest (2 beats) |
| 5 | E3–B3–D4–G4 | G5, F#5, E5, rest |
| 6 | E3–B3–F#4 | B4 (2 beats), D5, rest |
| 7 | A3–D4–E4 | A4, B4, E5, rest |
| 8 | A3–C#4–E4 | F#5, E5, D5 (2 beats) |
| 9–12 | Same as bars 1–4 | Repeat with only the first non-rest note of each bar; remaining beats rest |
| 13–15 | Same as bars 5–7 | Repeat the written figures one octave lower at lower gain |
| 16 | A3–D4–E4, no strong leading tone | A4 (2 beats), rest (2 beats); tail blends into bar 1 |

Mallet model starting point: fundamental amplitude 1.0, partials at frequency ratios 2.01/3.98 with gains 0.18/0.06 and faster decay; attack 4–8 ms, fundamental decay 0.7–1.3 s; low-pass around 5 kHz. Pad uses filtered triangle/sine voices with tiny static detuning, no nausea-inducing modulation. Render with a tail and create a sample-aligned wrapped tail/crossfade so the loop seam has no click or obvious volume dip. Listen to at least five consecutive repetitions on headphones and a phone speaker before acceptance.

This is an original production recipe, not a guarantee of copyright registration or an already-created soundtrack. If the generated music feels repetitive, reduce note density or offer silence; do not add an unlicensed popular track.

### 11.5 Mix and runtime behavior

- Three buses: SFX, ambience, music, plus master limiter. Suggested mix targets: music about −24 LUFS integrated, ambience about −32 LUFS; individual effects tuned perceptually, not normalized into identical loudness. Master true peak ≤ −1 dBTP. Verify the simultaneous worst-case mix, not only solo files.
- At most eight active short-effect voices. Group simultaneous growth and overflow; no more than one UI selection cue every 60 ms. Spatial panning, if used, stays within ±0.3 and is never needed to locate a cell.
- Duck music about 3 dB during a short result sting, with 80 ms attack and 300 ms release. Do not duck into audible pumping every time the player moves a selection.
- Create/resume Web Audio only following a user gesture and handle rejection; browser autoplay restrictions vary [R5]. A persisted sound-on preference does not authorize surprise playback before the current session permits it.
- Suspend/fade audio on document hidden and Telegram deactivation. Resume only under the user's saved preference and actual browser permission; never replay missed cues on return.
- Preview is silent by default except a quiet UI selection/open cue. A preview replay may optionally play water sounds, never a result or mastery sting.
- Failure to load/decode audio yields functional silent gameplay and an optional unobtrusive settings notice. Do not block the board.

### 11.6 Licensed fallback for interface sounds

If a required interface cue cannot be made to acceptable quality, the approved fallback source is **Kenney — Interface Sounds**, from the original asset page [R9]. Kenney's support page states that assets on its asset pages are CC0 and commercial use is permitted [R10]. Download from that official page, inspect the included license, audition the actual files and record the exact chosen filename, archive hash, license text and any processing in the asset manifest. Do not assume filenames based on a third-party mirror.

Use only quiet click/open/close/confirm sounds from that pack. It is not a source for the full rain ambience or music. Do not hotlink, scrape YouTube, rip another game, use a search-result audio preview or select a Freesound upload without verifying its individual license. If the pack is unavailable or licensing differs, return to the procedural recipe; do not guess. Courtesy credit `Interface sounds, where used: Kenney (CC0)` is welcome even where attribution is not required.

### 11.7 Haptic vocabulary

When supported and explicitly enabled: a light Telegram impact on committed rain; one gentle success notification on full completion; optional very light selection feedback only if it does not fire during continuous drag. No error vibration for partial growth or insufficient water. Do not vibrate for every cell in a cascade. Feature-detect the Telegram haptic API and allow a no-op implementation elsewhere. Audio/haptic preferences do not affect assistance.

## 12. Writing and EN/RU localization

### 12.1 Voice

Warm, concise and observational. Describe the world and the consequence, not the player's virtue. “Two drops continue downhill” is better than “Amazing! You are a rain genius!” Use the game title consistently; avoid pun-heavy core instructions whose Russian version would require a new rule metaphor.

No guilt, urgency, streak anxiety, fake scarcity, “your plants miss you,” “you wasted their chance,” “failed garden,” or claims that virtual growth produces money. Error copy assigns synchronization problems to the system, not the user.

### 12.2 Required terminology

| Concept / string | English | Russian |
|---|---|---|
| Title | Pocket Monsoon | Карманный муссон |
| Commit | Let it rain | Пустить дождь |
| Preview | Preview cascade | Посмотреть каскад |
| Core order | Water flows before plants drink. | Вода стекает до полива растений. |
| Selection prompt | Choose a rain cell first. | Сначала выберите клетку дождя. |
| Completion | A hillside in balance. | Склон расцвёл. |
| Partial result | A little more room to grow. | Ещё есть куда расти. |
| No absence simulation | Your next cloud will wait. | Следующее облако подождёт. |
| Overflow | Overflow | Перелив |
| Drainage | Drainage | Отток за пределы склона |
| Compact drainage | Drained | Ушло со склона |
| Evaporation | Evaporation | Испарение |
| Consumption | Consumed by plants | Поглощено растениями |
| Stored water | Stored water | Запас воды |
| Capacity | Capacity | Вместимость |
| Elevation | Height | Высота |
| Demand | Needs {n} per turn | Нужно {n} за ход |
| Growth | Growth {current} of {target} | Рост: {current} из {target} |
| Completed consumption | Fully grown; still drinks {n}. | Уже выросло; по-прежнему поглощает {n}. |
| Calm | Calm | Штиль |
| North / East / South / West | North / East / South / West | Север / Восток / Юг / Запад |
| Wind definition | The arrow shows where the cloud moves. | Стрелка показывает, куда сместится облако. |
| Assisted | Assisted | С подсказками или отменой |
| Practice | Practice · unranked | Практика · вне рейтинга |
| Study | Study · no ranked score | Разбор · без рейтингового результата |
| Undo | Undo last turn | Отменить ход |
| Hint | Show a hint | Показать подсказку |
| Account ledger | Where the water went | Куда ушла вода |
| Pending save | Saving turn… | Сохраняем ход… |
| Retry save | Check saved turn | Проверить сохранение хода |
| Offline practice | Offline practice; not ranked. | Практика без сети; вне рейтинга. |
| Sync mismatch | The saved turn differs from the preview. We restored the verified state. | Сохранённый ход отличается от прогноза. Мы восстановили проверенное состояние. |
| Cosmetics | Appearance only. The forecast and rules stay the same. | Только внешний вид. Прогноз и правила не меняются. |

Russian phrases in this document are editorial baselines, not a completed native-language sign-off. All 24 terrain names and all 72 hints must receive authored Russian translations before launch; machine translation alone is not that sign-off. Semantic IDs, coordinates, numerical rules and action sequences are shared across locales.

### 12.3 Localization engineering

Use keyed strings and ICU-style message formatting with locale plural rules. Do not concatenate a number and an English noun. Test water-unit forms at 0, 1, 2, 5, 11, 21, 22 and turns at 1, 2, 5, 6. Examples: `1 единица воды`, `2 единицы воды`, `5 единиц воды`; `1 ход`, `2 хода`, `5 ходов`. Coordinates remain Latin A–D with numerals in both locales and are explained in Help.

Use full words in screen-reader labels rather than reading compact `H2` or `1/3` without context. The Stars amount uses localized formatting but the same integer price. Language changes take effect without restarting an attempt, changing forecasts or clearing selection. Persist preference locally and sync it if the platform provides profile preferences.

Budget 35% text expansion from English. Do not use ellipses to hide the only explanation of an essential rule. Run pseudo-localization and explicit Russian 200% text checks across play, hints, payment status and error states. Credits, privacy/support links, share text and accessibility announcements are part of localization scope.

## 13. Content design and authoring contract

### 13.1 Content is authored, not a skin generator

Section 25 defines all 24 baseline terrains with exact terrain data, forecasts, six-input witnesses, ledger snapshots and three English hints each. These are mechanically checked candidates, not a claim that 24 enjoyable levels have been certified by players. Preserve their IDs through editorial iteration and increment content versions when mechanics change.

The first six Rain terrains contain exactly two plants. Later terrains contain two to four, never more than four. A chapter is eight distinct reasoning situations, not the same graph with a different painted background. Every terrain has a primary insight and at least one clear visual explanation of that insight. A novel-looking elevation pattern is not sufficient variety.

Design goals across the catalogue:

- Direct watering versus intentional overflow.
- Two plants sharing a single rainfall cascade.
- A retained reservoir changing the next turn's outcome.
- Demand-2 plants and the difference between drinking and productive growth.
- A completed upstream plant continuing to consume.
- Evaporation timing and why an apparently stored unit may not survive.
- Wind-origin versus landing-cell reasoning, including edge clamping.
- Multiple feeder cells converging into a downstream cell.
- Alternating attention between independent branches.
- A final combination that asks for several understood dependencies, not a new hidden rule.

### 13.2 Authoring schema

Each immutable terrain record contains:

| Field | Contract |
|---|---|
| `terrainId` | Stable `R01…R08`, `W01…W08`, `T01…T08` |
| `terrainVersion` | Positive integer; changes whenever cells, plants, forecast or winning evidence changes |
| `rulesVersion` | Explicit rules version, initially `pm-rules-1` |
| `chapter`, `order` | One of rain/wind/terrace and 1–8 |
| `titleKey`, `introKey` | EN/RU translation references; intro at most two short sentences |
| `cells[16]` | Row-major elevation, capacity, optional outflow and optional plant |
| `plant` | Stable ID, species ID, demand, target; no species-derived hidden rules |
| `forecasts[6]` | Fixed enum values, present before play |
| `initialWater[16]`, `initialGrowth` | Explicit zero values for launch content; do not infer random starting conditions |
| `insightTags` | One primary and up to three secondary tags from an enumerated catalogue |
| `hintKeys[3]` | Three ordered explanatory hints with localization references |
| `winningWitness` | Exactly six selected origins, derived landings, ledger/state snapshots and final score |
| `alternativeEvidence` | Verified alternate solutions or an explicit flag requiring human review |
| `contentHash` | Hash of the canonical expanded mechanical record; decorative assets excluded |
| `editorialStatus` | Mechanical verification, EN review, RU review, playtest review tracked separately |

Templates in section 25 are shorthand for authoring only. Expand them to all 16 explicit cells before validation and hashing. Missing cells, duplicate IDs, unspecified initial values and implicit “sensible defaults” are not allowed in the shipped format.

### 13.3 Publication validation

The content pipeline MUST reject a terrain for any of these reasons:

1. Grid not exactly 4×4; duplicate/missing coordinate; noninteger or out-of-range elevation/capacity.
2. Outflow outside the board, diagonal, self-edge, equal/uphill edge or more than one destination.
3. Missing/duplicate plant ID, invalid species reference, demand outside 1–2, target outside 2–4, capacity below demand or too many plants; wrong plant count in R01–R06.
4. Anything other than six legal forecasts; nonzero launch initial water/growth; witness length other than six.
5. Simulation accounting violation, out-of-bounds state, preview/replay mismatch or a witness that does not finish all plants.
6. A solver finds no six-turn winning sequence, including when wind makes important cells unreachable.
7. Missing any of the three hints, missing EN/RU strings, missing accounting evidence or stale content hash.
8. Gameplay data referring to a missing runtime asset or invalid target-to-growth-stage mapping.

The first five are hard structural/mechanical errors. Number 6 is mandatory even if a designer says the map “looks solvable.” Number 7 includes an editorial launch gate: strings existing is necessary but not equivalent to human review.

### 13.4 Solver and witness requirements

Enumerate legal cloud origins for each turn and simulate the exact rules. A depth-first or dynamic-programming search over at most six steps is sufficient when memoized. State keys include turn index, water, growth and rules/content identity. When optimizing score, preserve drainage or the best drainage for otherwise identical states; merging states with different drainage without care can corrupt score optimization. Do not call a witness optimal unless the search actually proves that objective.

Multiple origins may produce the same landing under boundary wind. Deduplicate those for efficient solving, but retain the canonical selected origins in the user-facing plan. An alternate origin that lands on the same cell is not a meaningfully different solution. Prefer comparing landing sequences and functional dependency order when evaluating variety.

Store full per-turn snapshots for QA and at least the compact accounting table in the design document. Validate the witness with a second independent calculation path, not only the engine function that produced it. Property tests should exercise valid random DAGs as internal test data; that does not authorize infinite generated player content.

The <50 ms preview target is for one deterministic turn, not exhaustive solution search. Run state-aware hint solving in a Web Worker or server job, never on the UI thread. Prefer precomputed continuations for shipped content; show a nonblocking hint-loading state and permit cancellation. If a bounded search cannot finish, return `unknown`, offer an authored dependency hint or Study from the beginning, and do not claim the current state is impossible.

### 13.5 Enjoyment and difficulty review

A mechanically solvable terrain may still be a poor puzzle. Review for redundant cells, unavoidable nonproductive turns, opaque forced sequences, trivial bypasses of the intended insight and indistinguishable solutions. Early lessons may deliberately allow broad safe alternatives. Later terrain should reward understanding without requiring blind search through 16⁶ inputs.

For each candidate record:

- What does the player notice before their first commit?
- Which preview makes the intended dependency apparent?
- Is there a readable recovery after a plausible mistake?
- Does the third hint explain the mechanism rather than dump unexplained coordinates?
- Does wind contribute a planning decision, or merely make the touch target indirect?
- Does a fully grown plant's ongoing consumption matter honestly and visibly?

If an authored terrain has only an opaque unique functional plan, revise its targets/capacities/forecast or replace it before launch. A map's numerical validity does not overrule this source-SRS quality gate. Maintain 24 valid terrains after any replacements.

## 14. State, architecture and persistence

### 14.1 Recommended implementation architecture

Prefer a small TypeScript codebase rather than a general-purpose game engine. A 16-cell deterministic puzzle does not need a 3D engine, physics library or runtime procedural world system.

| Layer | Default implementation direction | Boundary |
|---|---|---|
| Web UI | React + TypeScript with Vite | Screens, DOM grid, accessible controls, raster art and state presentation |
| Rules kernel | Pure shared TypeScript module | Validation, forecast movement, turn simulation, ledger and score; no DOM/network/time |
| Content | Versioned JSON expanded from authoring records | 24 immutable terrains, localization keys, hints and witnesses |
| Presentation | CSS transforms/transitions; optional Canvas 2D effect layer | Consumes events; never mutates water or growth |
| Local persistence | IndexedDB, atomic attempt snapshots and content cache | Offline practice and settings; graceful failure when unavailable |
| Server | Node.js LTS + Fastify or the supplied platform's existing server framework | Authentication, authoritative attempts, replay, challenge state and payment adapter |
| Database | PostgreSQL when a standalone backend is needed | Transactions, unique action/result/payment keys, durable saves |
| Tests | Vitest-style unit/property tests and Playwright-style browser tests | Shared fixtures plus real Telegram device checks |

At implementation kickoff, use the existing repository/framework if one is supplied and suitable. Otherwise use these defaults, resolve mutually compatible stable versions, record exact versions and commit a lockfile. Do not introduce unrelated upgrades or copy floating `latest` CDN imports into production. This specification does not pretend to know the future implementation repository's installed dependency versions.

The game must be testable in a standard browser through a development bridge, and in a real Telegram Mini App through the production bridge. Mocks must be visibly labeled and impossible to enable accidentally in a production build. A green mocked payment screen is not a tested real payment.

### 14.2 Shared kernel contract

Conceptual operations, not a mandate for exact source filenames:

- `validateTerrain(terrain)` → structured errors or accepted canonical terrain.
- `resolveLanding(origin, forecast)` → one grid coordinate.
- `simulateTurn(terrain, state, origin)` → next state, ordered events, per-cell ledger and summary.
- `scoreAttempt(terrain, finalState)` → completion flag and arithmetic components.
- `replayAttempt(terrain, acceptedOrigins)` → verified snapshots/result.
- `findContinuation(terrain, state)` → valid remaining plan or verified no-solution, with explicit timeout/unknown distinction.

The rules module must not import the UI, Telegram SDK, a payment library, analytics, audio or system time. It must use stable integer operations. Shared client/server code is useful but not sufficient independent verification: retain hand-calculated fixtures and a separate content checker.

### 14.3 Attempt state contract

Persist at least:

| Category | Fields |
|---|---|
| Identity | attempt ID, parent/fork ID if relevant, game ID, user scope, created timestamp |
| Versioning | schema version, rules version, terrain ID/version, immutable content hash, forecast hash |
| Context | practice/challenge, challenge ID if present, offline-origin flag, assistance level |
| Progress | committed turn count, water[16], growth by stable plant ID |
| Accounting | cumulative rain, consumption, drainage, evaporation; per-turn ledger |
| Actions | origin and derived landing for each accepted turn, action IDs, accepted revision, replay digest |
| Lifecycle | active/completed/abandoned/system-error, last acknowledged revision, server/local sync status |
| Result | completion/partial, final growth, plants at target, score components, result ID |

Separate UI preferences from the mechanical attempt: locale, text size, motion, contrast, sound, haptics, equipped appearance and optional last selected cell. UI preferences never enter scoring or content hashes. Audit timestamps support operations but never grow plants or expire an in-progress forecast.

### 14.4 Revision and action protocol

For every state-changing request send `attemptId`, `actionId`, `expectedRevision`, action type and legal input. Server resolves user ownership from the validated session, never from an arbitrary client `userId`.

For `commit`, the only player mechanical input is the selected origin. Never trust client-submitted landing, water, growth, score, number of rain units or forecast. For undo/hint/study, validate the operation and persist its assistance effect. `GET` state/results do not grant rewards.

Transactional rules:

1. Check for an existing action ID first. Same ID and same canonical payload returns its original acknowledgment/result even if the caller's expected revision is now old.
2. Same action ID with a different payload is an explicit conflict; never process a second effect.
3. For a new action ID, lock or compare-and-swap the current revision. A stale revision returns `409` plus a recovery reference/current revision, not a best-effort second rain.
4. Validate action and current rules/content version, simulate, write the next state, accepted-action record and any completion/outbox record in one transaction.
5. Increment revision monotonically, including undo. Persist the acknowledgment before returning success.

Two simultaneous taps, network retries, reopened screens and duplicate webhook deliveries must never produce two rains or two completion grants. Store accepted action payloads/results for the lifetime of the attempt. Clients retry the original ID after a timeout; a timeout is not proof that the server rejected the turn.

### 14.5 Save and resume

Save after every acknowledged turn and after assistance changes. Do not rely on `beforeunload` to write the only copy. Closing for 48 hours, several weeks or a changed timezone leaves water, growth, turn, forecast and assistance unchanged. No catch-up simulation runs at boot.

Local IndexedDB writes must atomically persist the snapshot, action and ledger. On server-connected play, the server acknowledgment is the canonical save; local storage caches it. If termination occurs after server acceptance but before the client receives it, resume reconciles the pending action ID before allowing another commit.

Maintain up to one active practice attempt per terrain per user scope by default; starting another asks whether to resume or restart. A separate challenge attempt may coexist. The Home Continue card selects the most recently active acknowledged attempt, with access to the rest. No six-turn attempt is large enough to justify deleting it merely because an unrelated asset cache is full.

### 14.6 Version migration and corruption

- Never silently load a saved attempt against changed capacities or forecasts. Pin its exact rules/content revision until completion; preserve compatible old kernels/content for supported active saves.
- Schema migrations transform structure, not gameplay history. Verify the migrated snapshot against its accepted action log before promoting it.
- If a saved snapshot fails its integrity/replay check, quarantine it, attempt deterministic reconstruction from the action log and preserve the original for bounded diagnostics. Do not display a fictitious completed board.
- If reconstruction is impossible, explain the issue and offer a new practice attempt while preserving unrelated progress/entitlements. Mark the affected attempt as unrecoverable, not user failure.
- Rollback deployments must retain access to the content and rules versions needed by already-started attempts. Cache revisions by immutable hash; do not serve “latest” content under an old hash.

### 14.7 Completion and reward idempotency

An authoritative final replay creates one immutable result per finalized server attempt. Unique constraints protect result ID, attempt completion and each user/terrain mastery contribution. Reopening Results, retrying submission or consuming an outbox twice cannot add another distinct completion. Cosmetics have a separate entitlement ledger; a gameplay result never creates a purchased entitlement.

Offline practice can grant a local postcard immediately after local verification and mark synchronization pending. On reconnect, import its origin history as practice, verify it server-side and deduplicate by local attempt ID/content hash before syncing progress. A rejected or incompatible upload cannot become ranked. Do not erase the local player's board while resolving a sync error.

## 15. Telegram and platform integration

### 15.1 Telegram shell

Use the official Telegram Mini App JavaScript integration and current documentation [R1]. Feature-detect APIs and supported versions instead of assuming every WebView has the newest storage/fullscreen functions.

Required behavior:

- Bootstrap from `Telegram.WebApp` when present; call `ready()` after meaningful initial UI readiness, and request expanded viewport with `expand()` where supported.
- Fullscreen is optional. Request it only after an explicit user action and only when supported; declined/failed fullscreen must leave the game fully usable.
- Respond to stable viewport changes, orientation changes, `themeChanged`, safe-area/content-safe-area changes and activation/deactivation. Do not rebuild the game state on a viewport resize.
- Respect the device safe area and the Telegram UI content inset as separate constraints. Use the current SDK's documented coordinate semantics, avoid adding the same inset twice and verify actual top/bottom clearance in both expanded and fullscreen modes on devices. Browser `env(safe-area-inset-*)` is a fallback, not proof Telegram chrome is covered.
- Integrate Telegram BackButton: close a sheet first, leave play second, return to host at root. Register/unregister handlers cleanly so opening a terrain twice does not duplicate actions.
- Ask closing confirmation only when a real unresolved turn/payment action risks confusion; saved practice does not need a guilt-inducing “don't leave your garden” dialog. If a pending action is resumable, explain that clearly.
- Do not disable Telegram vertical swipes globally just to make optional cloud dragging easier. Protect ordinary scrolling and use supported swipe controls only for the necessary interaction region/period.
- No permission prompts for contacts, geolocation, camera, microphone or write access. None is required by this design.

### 15.2 Authentication and trust

Send the original `initData` string to the server over HTTPS. `initDataUnsafe` may help render a nontrusted loading greeting but MUST NOT authenticate a user or authorize a purchase/result.

Validate Telegram's signed initialization data on the backend according to its current documented algorithm [R1]. For the bot-token HMAC path, derive the secret with HMAC-SHA-256 using key `WebAppData` and message equal to the bot token, then validate the sorted decoded `key=value` data-check string excluding `hash` with constant-time comparison. Preserve received field values rather than parsing and reserializing embedded JSON. Do not conflate this with Telegram's different third-party Ed25519 procedure, which uses a different prefix and exclusions. Use official/current test vectors and reject malformed or duplicate query keys.

Project security baseline: require a valid `auth_date` no more than five minutes old at initial session exchange, allow at most 30 seconds of forward clock skew, bind the verified Telegram user ID to a server session and rate-limit exchanges. These are application policy values, not Telegram-mandated universal limits. Keep active app sessions separate from the launch signature; do not resend a stale launch payload for every move.

Prefer same-origin API calls and Secure, HttpOnly session cookies with appropriate SameSite/CSRF protection. Session idle timeout baseline 30 minutes, absolute lifetime 24 hours; expiry asks for a fresh Telegram launch if no valid refresh path exists. Save the accepted attempt before any reauthentication UI. Never put the bot token in frontend environment variables, bundles, logs or image-generation prompts.

Development identity bypass must be server-side, nonproduction-only, conspicuously labeled and disabled by production build/config validation. A client-supplied `debug=true`, query parameter or localStorage flag must never activate it in production.

### 15.3 Game-owned platform adapter

Define an adapter for these capabilities. These are **conceptual game interfaces**, not discovered Stark Games endpoints:

| Capability | Request intent | Result/constraint |
|---|---|---|
| Authenticate | Exchange verified launch context | Stable user scope/session; no trusted client balance |
| Read/save progress | Load acknowledged attempts, postcards and preferences | Versioned state; no cross-user data exposure |
| Begin/commit/reconcile attempt | Authoritative action protocol | Revisioned, idempotent acknowledgment |
| Read cosmetics | Fetch free/owned set IDs | Server-owned purchased entitlement status |
| Begin Stars checkout | Purchase known SKU at server price | Invoice/order identity; no client-created amount |
| Read order/refund | Reconcile payment/entitlement status | Distinguishes pending, paid, canceled, failed and refunded |
| Challenge | Resolve immutable challenge and submit result | Disabled until the host supports the exact comparison contract |
| Share | Present user-confirmed share options | No automatic message sending |
| Open profile/support | Delegate to configured host destination | Hide optional link if unavailable; never invent a wallet |

If no platform implementation is supplied, provide a local/standalone adapter for development with visible capability status. Do not duplicate a marketplace wallet, global account system or global leaderboard spec. Production integration requires the missing Platform SRS or an approved equivalent API contract, test credentials and owner sign-off.

### 15.4 Sharing and launch parameters

Use a compact opaque `startapp` reference for a challenge or terrain share; the backend resolves it to approved immutable data. Validate syntax/length/expiry or archival state and reject unknown IDs. Do not accept arbitrary serialized board state, an external redirect URL or a score from a launch parameter.

Sharing is voluntary after the player opens a preview. Default share content: localized title, terrain name/ID, a garden-only postcard, completion/partial label and `Try the same forecast`. Show assistance context if a score is included. Do not include Telegram user ID, payment identifiers, wallet address or other participants' profiles. Use supported Telegram share APIs where available and a copy-link fallback otherwise. No auto-send on completion.

Direct browser access without Telegram offers labeled guest practice for downloaded/public content, not forged Telegram identity or a functional paid checkout. Explain how to open in Telegram for purchases/challenges requiring authentication.

### 15.5 Optional TON profile link

The source allows an optional TON link in Profile only. This is **not** a requirement to build wallet connection or an on-chain transaction. Hide the link unless the shared platform already supplies an approved profile capability. The game does not request seed phrases, sign transactions, mint NFTs, show farming yield or accept TON as an alternative payment for its digital cosmetic set. If a future host introduces wallet functionality, it requires a separate reviewed integration and cannot change rain or progression.

## 16. Economy, entitlements and payment safety

### 16.1 Catalogue

| Item | Price / entitlement | Contents |
|---|---|---|
| Free base collection | Free, always usable | Cotton/Pebble/Linen clouds; Chalk/Clay/Moss pots; Plain result border |
| `pm-cloud-pot-set-01` — Cloud and Pot Set / Набор облаков и горшков | Proposed baseline **75 Telegram Stars**; one nonconsumable entitlement | Pearl cloud + pot, Indigo cloud + pot, Monsoon result border |
| Voluntary support | Shared platform's one-time support checkout only | No gameplay or exclusive progression benefit; no game-defined subscription |

The 75-Star amount is the SRS proposal adopted as the default catalogue configuration, still requiring commercial owner approval before live invoices. Do not silently replace it with a fiat price, a recurring subscription or an algorithmic discount. Support contribution amounts belong to the platform contract; if absent, hide Support purchase instead of inventing tiers.

Each owned cloud can combine with each owned pot. The result border is a separate equip choice. A cosmetic preview is temporary until `Equip`; unowned previews do not survive as entitlement. Equipped paid items fall back to the closest free default when a refund removes access.

### 16.2 Fairness and shop UX

The Collection screen explicitly says appearance only. Show the entire set and the exact Stars price before checkout. Never interrupt a terrain with a shop modal, show “buy rain” after a partial result, cover unavailable items with loss-aversion timers or make paid clouds more readable than free ones. Standardized selection outlines, numbers, plant footprints and contrast apply to every set.

The storefront displays `Owned`, `Equipped`, `Preview`, `Buy for 75 Stars`, `Payment pending`, `Unavailable offline` and `Refunded` appropriately. Reopening the app restores entitlements from the server. Do not offer repeated purchase of an already-owned nonconsumable set.

### 16.3 Stars transaction contract

Telegram requires Stars (`XTR`) for digital goods/services inside Telegram [R2–R4]. Use the shared one-time checkout if provided; otherwise the standalone backend must implement the approved Bot API payment flow. Never route this digital purchase to external card checkout, cryptocurrency payment or a client-only success flag.

Flow:

1. Authenticated client requests the fixed SKU. Server reads price from its catalogue, creates an order bound to the verified user and issues an invoice link through the Bot API.
2. Client opens the invoice with the supported Telegram interface. Native UI status is advisory; closing an invoice is not proof of settled payment.
3. On `pre_checkout_query`, server verifies user, order payload, SKU availability, `XTR`, exact integer total and absence of an incompatible completed order. Telegram requires a response within 10 seconds; target under one second and do not wait for asset generation or long jobs.
4. Only a validated server-side `successful_payment` creates the paid entitlement. Check payload, total/currency and Telegram payment charge ID; process with a unique key on the charge and order.
5. Write payment record, entitlement grant and reconciliation/outbox event atomically. Repeated delivery returns the same result, not another set or badge.
6. Client queries/reconciles order status after invoice close, on app resume and after connection recovery. Show `Payment received; restoring your set…` if payment is confirmed but inventory rendering is still catching up.

If payment is canceled or fails, return to the unchanged Collection. If a client says `paid` but the server has no successful event yet, show pending and reconcile; never grant early. If the webhook arrives after the app closes, entitlements appear next time. Prevent duplicate in-flight orders where possible, and reconcile/refund an accidental duplicate charge according to the owner's policy rather than quietly keeping it.

### 16.4 Refunds, support and audit

Use the Bot API's `refundStarPayment` through the approved backend/payment adapter [R3]. Do not assume an app uninstall refunds a charge. Record original charge ID, order, amount/currency, grant and refund status in an auditable ledger. Do not log raw credentials or the full webhook with unrelated user data.

A confirmed refund revokes only the relevant purchased cosmetic entitlement, re-equips free defaults if needed and preserves terrains, water, growth, postcards, mastery and ordinary score history. A retry or duplicate refund event must not revoke unrelated items. Reconciliation must handle an out-of-order payment/refund safely; a later duplicate payment event must not re-grant a refunded entitlement.

Provide a visible payment-support route and the bot's required `/paysupport` handling, plus privacy/terms/support contact before enabling live purchases. Financial-record retention and refund obligations require owner/legal policy for the target jurisdictions; this document does not invent those legal periods. If actual payment infrastructure or approval is missing, ship no live invoice button and report commerce as blocked, not “fully verified.”

## 17. Network, offline and failure behavior

### 17.1 Offline boundary

Previously loaded, version-pinned practice content may run offline after the shell and required assets are available. Cache the shell and immutable content/assets where WebView support permits; service-worker availability and storage persistence must be tested, not assumed. A first-ever offline launch cannot magically download the game: show a useful reconnect screen.

No server-backed attempt accepts new locally authoritative actions under its existing server identity while disconnected, whether practice or challenge. If connection is lost, offer `Wait and reconnect` or `Continue a practice copy`. The copy receives a new local attempt ID, parent ID and fork-revision reference, copies the last acknowledged snapshot/history, inherits assistance without downgrade and remains unranked forever. Upload creates a separately verified practice attempt, deduplicated by its local ID; it never merges into the parent's action branch.

First try to reconcile an uncertain in-flight action. If the network makes reconciliation impossible, the player may explicitly fork **only the last acknowledged snapshot**, with the message `The pending turn is not included in this copy. We will check the original when you reconnect.` Preserve that pending action and the original attempt separately. Do not guess whether it was accepted, copy its predicted effects, cancel it implicitly or resend it under a new ID. Reconnection reconciles the parent and uploads the fork independently. A fresh practice attempt is also available. No paid entitlement is granted from cached checkout state.

Local storage can be evicted by OS/WebView policy; do not promise cloud durability for unsynced guest practice. Display honest sync status on saved attempts. Server-backed progress survives device changes after authentication; guest-only progress does not unless explicitly imported and verified.

### 17.2 Failure-state matrix

| Failure | Preserve | Player-facing behavior | Recovery |
|---|---|---|---|
| No network at launch | Existing local practice | `Offline · downloaded terrains only` or reconnect screen | Load cache; never show fabricated remote balances |
| Commit request times out | Last acknowledged snapshot + pending action ID | `Checking whether the turn was saved…` | Query/retry same ID; no new rain until resolved |
| Duplicate commit | Entire accepted state | Return accepted acknowledgment | No second simulation/grant |
| Stale revision / second device | Local pending input for explanation | `This terrain was updated in another session.` | Fetch canonical state; require a fresh selection |
| Preview/server mismatch | Authoritative state, action audit and diagnostic hashes | Neutral system-error message; never label the player at fault | Pause the affected attempt and follow §17.4; no player-undo assistance penalty |
| Outdated terrain version | Pinned old attempt | `Resuming your original forecast` | Use old version; do not patch live board |
| Local storage quota/unavailable | In-memory state, last durable state | `This device cannot save right now.` | Retry, free only disposable cache, or explicit unsaved practice |
| Corrupt save | Original quarantined record and other progress | Clear restore/new-practice choice | Replay action log; never fabricate recovery |
| Asset load failure | Numbers, grid, interaction | Plain semantic fallback | Retry asset; no opaque blocked board |
| Audio failure/autoplay block | All gameplay | Silent operation; setting remains understandable | User gesture/retry; no modal interruption |
| Payment pending | Order identity and existing inventory | Pending status; no duplicate Buy loop | Server reconciliation |
| Refund confirmed | All gameplay progress | Free appearance restored, concise notice | Entitlement sync |
| Challenge missing/archived | Any personal practice | `This challenge is unavailable. Try the terrain in practice.` | Valid current/pinned practice version only |
| Unsupported Telegram API | Current attempt | No-op/fallback shell feature | Regular viewport, copy link, in-app controls |
| App backgrounded mid-animation | Accepted state | Resume at final acknowledged turn state | No replayed rainfall or accumulated audio |

### 17.3 Retry and concurrency policy

Use bounded exponential backoff with jitter for retryable network/server failures, retaining the same action ID. Do not retry validation/auth/payment errors blindly. Provide explicit retry after a bounded automatic sequence. No indefinite spinner without explanation; after approximately five seconds show a status with recovery options, not a claim that the action failed.

A different device editing the same attempt wins only through server revision ordering, not client wall-clock timestamps. Do not merge two six-turn action branches. Offer a separate practice fork for discarded exploration. Preferences may use independent last-write semantics, but never apply that policy to mechanical state or entitlements.

### 17.4 Simulation mismatch recovery

A client mismatch report pauses further commits and captures the input/content/rules/build hashes. The server independently replays accepted inputs; it never accepts a client-supplied replacement score or grants a free unassisted undo merely because the client requested one. A stale preview for a different selection/revision is a presentation synchronization error and is replaced without changing an already verified state.

For a confirmed same-input rules/rendering mismatch, preserve the affected attempt and result audit, mark it `system-error`, exclude it from ranked/best-result updates and do not record it as a player loss. If an affected result was already published, append an auditable system invalidation; do not rewrite its historical score or erase earlier valid best results. Keep already-earned unrelated progress and all entitlements. After the faulty version is fixed or a verified compatible renderer is loaded, offer a fresh attempt on the identical terrain/forecast with the prior assistance level, or a clearly labeled unranked practice copy. Never implement this recovery as ordinary user Undo, silently alter their assistance class or force them to submit the mismatched outcome. Explain that the affected attempt was interrupted by a game error; a newly recovered score is not promised without an actual verified replay.

## 18. Performance, loading and device coverage

### 18.1 Measurable targets

| Metric | Launch target | Measurement method |
|---|---|---|
| Pure 16-cell turn/preview calculation | <50 ms p95 on reference Android device | At least 1,000 varied valid states, warmed and cold-start separately reported |
| Main local visual resolution | ≤500 ms before next placement can be accepted | Event-to-input-ready timing; server wait reported separately |
| Input feedback | <100 ms p95 | Tap/key to selected/focus state, under representative device load |
| Frame rate | Aim 60 fps; stable ≥30 fps on reference low-end device | Real-device trace during worst four-plant cascade |
| Cold first playable | Target ≤3 s on defined test network after Telegram opens the WebView | 10 Mbps down, 100 ms RTT, empty app cache; median and p95 of repeated runs |
| Initial compressed transfer | ≤2.5 MB excluding optional audio and later cosmetic/chapter assets | Production network waterfall, not source directory size |
| JS + CSS initial compressed payload | ≤350 KB target | Production bundle report; document any justified overage |
| Full optimized raster payload | ≤8 MB target | Sum shipped image exports, excluding source masters |
| Full optional audio transfer | ≤3 MB per chosen codec path | Do not preload both MP3 and Opus copies |
| Decoded image memory | ≤48 MB target | Atlas dimensions × bytes/pixel plus live decoded images; device trace |
| Decoded audio memory | ≤32 MB target | Stream long music or unload inactive loops; account for PCM expansion |
| Total active page memory | ≤120 MB target | Device-specific tooling; identify measurement limitations |

These are acceptance targets to measure on the actual implementation. None is established by this document's existence. The SRS's <50 ms and ≤500 ms expectations remain mandatory even if other budgets are renegotiated explicitly.

### 18.2 Loading strategy

Initial payload includes the shell, font subset(s) for the selected locale, R01/common tiles, free equipped cosmetics and plant sprites needed for the entry terrain. Forecasts and the semantic board can render before decorative backgrounds. Load chapter backdrops, unused species, paid cosmetics, postcards and audio on demand; prefetch the recommended next terrain when idle and online.

Do not preload all source-resolution assets, 24 unique board images or every audio codec. Rasterize derived thumbnails once per content/art version and cache them. Keep atlas sizes at most 2048×2048 unless device testing justifies otherwise. Cap decorative effect canvas device-pixel ratio at 2 and use fewer effects on low-power devices; never reduce numeric readability or change the simulation.

No active `requestAnimationFrame` loop when the board is idle, the tab is hidden or reduced motion is enabled. No polling leaderboard or payment endpoint at subsecond frequency; use bounded reconciliation and appropriate server updates.

### 18.3 Reference coverage

Minimum real-device matrix: Android phone with roughly 4 GB RAM and a Snapdragon 662/680-class or comparable processor; iPhone SE second generation or comparable compact iPhone; one current larger iPhone/Android device; Telegram Desktop. Record exact device, OS, Telegram version, WebView version and build hash in the release report rather than pretending these examples are a measured compatibility guarantee.

Exercise 320, 360, 390, 430 and 768 CSS-pixel widths in browser tests; short viewport heights; portrait/landscape; enlarged RU text; dark Telegram chrome; keyboard opening in support/settings if applicable; notch/fullscreen safe areas. A standalone browser screenshot is not proof that Telegram iOS/Android integration works.

If an optional API is absent, degrade that feature. If essential IndexedDB is unavailable, allow explicit unsaved guest practice or server-backed play where possible. Document any hard minimum platform requirement before release, not through a blank screen.

## 19. Privacy, security and observability

### 19.1 Data minimization

Needed data: verified platform user scope for synchronized play, attempt origins/results/versions, completion and mastery, preference values, cosmetic entitlements and transaction records. Do not collect contacts, geolocation, microphone/camera data, wallet secrets, Telegram message history or arbitrary profile fields.

Challenge aliases are opt-in and sanitized. Default public sharing contains no personal identity. Do not fetch external avatar URLs blindly or embed user-controlled HTML. Account ownership must be enforced on every attempt, order and entitlement operation.

Store secrets only in server-side secret management. Sanitize structured logs; never log raw `initData`, cookies, bot tokens, full payment payloads or unrestricted personal identifiers. User-facing bug reports may include build/content/revision IDs and redacted diagnostics, not the entire authenticated session.

### 19.2 Security checklist

- HTTPS everywhere in production; strict input schema validation; bounded request sizes and rate limits.
- CSP compatible with the chosen Telegram SDK and first-party assets; no broad `unsafe-eval` or wildcard asset origins without a justified reviewed need.
- Verify Bot API webhook secret/configuration; deduplicate update/charge IDs and use transactions.
- Same-origin API/CORS policy, CSRF protection as appropriate to cookie/session design, output escaping and safe URL handling.
- Backend ignores client price, entitlement, score, forecast and assistance claims; validate/import practice under explicit unranked rules.
- Validate shared challenge IDs; no open redirects, arbitrary content fetches or cross-account reads.
- Dependency lockfile, license inventory and vulnerability review before launch; no private assets or secrets in source control.
- Generated/downloaded assets are build inputs only. Never execute text from asset metadata or a generation tool as instructions.

### 19.3 Minimal analytics

Use a privacy-conscious first-party event layer, enabled according to the approved privacy/consent policy. Gameplay must work when analytics is disabled. Suggested events:

| Event | Minimal useful fields | Question answered |
|---|---|---|
| `tutorial_step_completed` | step ID, locale, input mode | Where does explanation become unclear? |
| `terrain_started` | terrain/version, context, resumed flag | Are players choosing another terrain? |
| `preview_opened` | terrain, turn, phase | Is the accounting explanation being used? |
| `turn_committed` | terrain, turn, elapsed bucket, ledger totals | Which resource steps are confusing? |
| `hint_used` / `undo_used` / `study_opened` | terrain, turn, assistance | Which maps need better explanation? |
| `terrain_finished` | completion flag, growth, drainage, score, assistance | Does difficulty match the intended chapter? |
| `sync_error` | typed error, versions, redacted revision IDs | Is persistence/replay reliable? |
| `asset_or_audio_error` | asset ID, capability/build version | Which devices need a fallback? |
| `checkout_status` | SKU, status, opaque internal order reference | Is payment reconciliation reliable? |

Do not collect pointer trails, raw text entry or screen recordings by default. Do not turn the 3–5 minute target into a pressure timer. Aggregate events for tuning, not automated difficulty changes during a player's already-started forecast.

Baseline operational retention proposal: raw nonfinancial diagnostic/analytics events 30 days, anonymized aggregate counts up to 12 months, saved progress until user deletion or the published account-retention policy applies. Financial records follow the legally approved policy. Deletion must cover server progress, identifiers and non-required diagnostics; local device data can be removed through a clear local reset, with an explanation that copies on other devices require their own local cleanup. These policies need owner approval before production collection.

### 19.4 Operational health

Track commit error rate, replay mismatches, content-validation failures, payment-to-entitlement latency, duplicate-action handling, crash-free sessions and p95 calculation time. Any reproducible conservation violation, duplicate charge/grant or cross-user data access is a release blocker. A replay mismatch is an engineering incident; do not penalize the player's score or label them a cheater without independent evidence.

## 20. Verification and acceptance matrix

### 20.1 Rules and property tests

| Test ID | Required assertion |
|---|---|
| `PM-RULE-01` | The SRS A1→A2 fixture routes rain 3 into A1=1/A2=2 before drinking. |
| `PM-RULE-02` | Two demand-1 fixture plants each grow once; final storage 0; consumption 2, evaporation 1, drainage 0. |
| `PM-RULE-03` | Reject equal/uphill/diagonal/self/off-grid edges and capacity outside integer 0–3. |
| `PM-RULE-04` | Overflow through a full downstream cell continues during the same turn. |
| `PM-RULE-05` | No-edge overflow drains only excess, while retained water follows drinking/evaporation. |
| `PM-RULE-06` | Demand-2 with water 1 consumes 1 and grows 0; demand-2 with water 2 consumes 2 and grows 1. |
| `PM-RULE-07` | Fully grown plants still consume; their growth remains capped. |
| `PM-RULE-08` | Evaporation removes one remaining unit per cell, not per board or per plant. |
| `PM-RULE-09` | All four wind directions, calm, interior movement and all edge clamping cases resolve correctly. |
| `PM-RULE-10` | Rain on empty/zero-capacity cells is legal and follows normal routing. |
| `PM-RULE-11` | Per-turn and six-turn conservation hold for every witness and randomized valid fixture. |
| `PM-RULE-12` | Preview is immutable and byte-for-byte mechanically equivalent to commit for the same input state/version. |
| `PM-RULE-13` | Six turns exactly; no seventh commit; early all-grown state still consumes remaining forecast turns. |
| `PM-RULE-14` | Score 70 for two finished plants, growth 6, drainage 0; clamps at zero and excludes evaporation penalties. |
| `PM-RULE-15` | EN/RU, viewport, cosmetics, effects and elapsed time cannot change kernel output. |
| `PM-RULE-16` | A solver timeout is `unknown`, never `unsolvable`; known impossible fixtures fail publication. |

### 20.2 State, platform and commerce tests

| Test ID | Required assertion |
|---|---|
| `PM-STATE-01` | Undo restores all water, growth, turn, history and cumulative counters while keeping assistance and server revision monotonic. |
| `PM-STATE-02` | Closing for 48 simulated hours changes no mechanical state or forecast; no wall-clock growth path exists. |
| `PM-STATE-03` | Interrupt before send, after server acceptance, before acknowledgment and mid-animation; resume yields exactly one committed turn where appropriate. |
| `PM-STATE-04` | Duplicate action ID/same payload returns original result; changed payload is rejected; stale revision never adds rain. |
| `PM-STATE-05` | Simultaneous devices resolve by server revision, without branch merging or time-based overwrites. |
| `PM-STATE-06` | Version-pinned save survives content update; corruption reconstructs from log or fails honestly without erasing other progress. |
| `PM-STATE-07` | Hint/undo/study assistance persists across crash/reload and cannot be rolled back by restoring a board snapshot. |
| `PM-STATE-08` | Result replay/refresh/retry grants one result and one distinct-terrain contribution only. |
| `PM-STATE-09` | Offline practice import stays unranked; disconnected server practice/challenge creates a distinct fork, with pending actions reconciled or explicitly excluded from its last-acknowledged snapshot. |
| `PM-STATE-10` | Local storage failure is visible; `Saved` is never shown for an unpersisted local action. |
| `PM-STATE-11` | Post-result Study leaves the immutable result unchanged; interactive Study copies remain Study and only actual interactive completions grant progression. |
| `PM-STATE-12` | A confirmed system mismatch follows audited invalidation/recovery, not player Undo, score fabrication or an assistance penalty. |
| `PM-TG-01` | Valid signed launch authenticates; modified, duplicate-key, expired and wrong-bot payloads fail. |
| `PM-TG-02` | BackButton, theme, safe areas, viewport and optional fullscreen work in actual Telegram clients without reset/double handlers. |
| `PM-TG-03` | Hidden/deactivated app suspends audio/effects and resumes the acknowledged state without replaying rain. |
| `PM-TG-04` | Missing/newer unsupported APIs fall back without blank screens; external guest launch cannot create trusted identity. |
| `PM-PAY-01` | Server price/SKU/currency/user validation; pre-checkout response meets Telegram's deadline. |
| `PM-PAY-02` | Client invoice close/`paid` alone never grants; validated successful payment grants exactly once. |
| `PM-PAY-03` | Cancel, failed, delayed webhook, duplicate webhook, reopened app and duplicate-order cases reconcile correctly. |
| `PM-PAY-04` | Refund removes only the paid cosmetics and restores defaults; all growth/progress remains. |
| `PM-PAY-05` | Duplicate/out-of-order payment/refund events cannot re-grant a refunded set or revoke another entitlement. |
| `PM-SEC-01` | A user cannot read/mutate another user's attempts, orders, results or inventory by changing IDs. |
| `PM-SEC-02` | Production cannot enable development identity/payment mocks from the client; secrets absent from bundle/logs. |

### 20.3 UI, audio, content and device tests

| Test ID | Required assertion |
|---|---|
| `PM-UX-01` | All six forecasts and every demand/target are available before turn one and never change after a failure/purchase. |
| `PM-UX-02` | Selection origin and wind landing remain distinct; selecting or inspecting never spends a turn. |
| `PM-UX-03` | All five preview phases and the full accounting identity are inspectable without state mutation. |
| `PM-UX-04` | At 390 px, board/plant counters are readable with ≥44 px targets; no required information is hidden by art. |
| `PM-UX-05` | RU at 200% text, monochrome and high contrast retains all forecasts, plant values and actions without lost functionality. |
| `PM-UX-06` | Keyboard and list view complete an entire terrain; focus survives panels, zoom and result navigation. |
| `PM-UX-07` | VoiceOver/TalkBack can select, preview, commit, undo and understand a partial result with no sighted assistance. |
| `PM-UX-08` | Reduced motion has no essential movement; sound/haptics off lose no information. |
| `PM-UX-09` | Partial results have healthy plants, accurate growth and neutral copy; no forced retry or shop interruption. |
| `PM-ART-01` | All 85 required asset IDs resolve; alpha/pivots/style/number-safe areas pass runtime-size review. |
| `PM-ART-02` | No SVG production assets or baked essential text; cosmetic combinations retain equal readability. |
| `PM-AUD-01` | All required cues/loops exist, have provenance, decode on target clients and respect independent bus preferences. |
| `PM-AUD-02` | Audio starts only when permitted; background/resume and sound-off behavior are correct; no clipping at max event density. |
| `PM-CONT-01` | Exactly 24 terrains, 8 per chapter, proper plant counts and valid immutable records. |
| `PM-CONT-02` | Every witness completes in six turns with verified ledger/state snapshots; impossible test map rejected. |
| `PM-CONT-03` | Every map has 3 reviewed EN hints, 3 reviewed RU hints, title/intro, insight tags and useful explanation. |
| `PM-CONT-04` | Human review rejects opaque forced solutions and trivial bypasses; all replacements remain solvable. |
| `PM-PERF-01` | Device measurements meet the calculation and animation gates and report payload/memory/timing budgets honestly. |

### 20.4 Source SRS traceability

| Source obligation | Covered here | Evidence required at game delivery |
|---|---|---|
| G07-F01: visible needs/forecast | §§4, 6–7, 12 | PM-UX-01/05 and EN/RU device captures |
| G07-F02: complete nonmutating preview | §§4.7, 7.6 | PM-RULE-12, PM-UX-03 |
| G07-F03: deterministic integer accounting | §§4, 14 | PM-RULE-01/02/04–15 and content witnesses |
| G07-F04: reject invalid/impossible maps | §13, §25 | PM-RULE-03/16, PM-CONT-01/02 |
| G07-F05: save after acknowledged turns, no absence simulation | §§14, 17 | PM-STATE-02/03/06/10 |
| G07-F06: complete undo, persistent assistance, hints/study | §5, §14 | PM-STATE-01/07, hint continuation tests |
| G07-F07: full versus partial and drainage explanation | §§5.3, 6.3, 7.6 | PM-RULE-14, PM-UX-09 |
| G07-F08: non-color numeric/text/shape information | §§7–10, 12 | PM-UX-04–08 |
| G07-A01 / G07-A02 | §4.5 | PM-RULE-01/02 |
| G07-A03 | §13 | PM-RULE-03/16, PM-CONT-02 |
| G07-A04 | §§14.5, 17 | PM-STATE-02 |
| G07-A05 | §5.2 | PM-STATE-01 |
| G07-A06 | §§5.3, 14.7 | PM-RULE-14, PM-STATE-08 |
| G07-A07 | §§9, 12 | PM-UX-05/07 |
| 24 terrains and content quality | §§13, 25 | Mechanical validation plus observed-player review |
| 75-Star cosmetic proposal, fair economy/refunds | §16 | Owner approval and PM-PAY-01–05 |
| EN/RU and actual device performance | §§12, 18 | Native editorial sign-off and real-device report |

### 20.5 Observed-player gate

Recruit at least 12 target-fit participants across cozy-first and puzzle-first preferences. Include low-end-device and accessibility use cases where possible; do not claim 12 people prove market demand. After the introduction, ask each person to predict a two-cell cascade without prompting. Pass the source gate only if **at least 9 of 12** predict it correctly. Offer an unforced second terrain; **at least 7 of 12** should voluntarily try it.

Record misunderstanding of overflow/drainage/evaporation separately, plus preview usage and whether ongoing consumption at full growth felt surprising. Use observation and short questions, not fictional player personas as a substitute for evidence. If players cannot explain lost water, revise explanations before adding mechanics. Repeat the affected gate after meaningful changes; do not edit the pass threshold to match results.

### 20.6 Evidence requirements

Game delivery includes unit/integration/browser test outputs, content validation report, real-device performance measurements, EN/RU review status, privacy-safe screenshots of key states and a short behavioral demonstration if requested. Capture normal play, wind origin/landing, phase preview, healthy partial result, RU enlarged text and cosmetic parity. Use synthetic/test accounts and sanitized share cards; do not publish private Telegram names, payment data or credentials.

This documentation task does not produce a running-game screenshot or a passed device test. Do not generate a fake “game screenshot” and present it as verified implementation evidence.

## 21. Production sequence and completion contract

### 21.1 Build order for the implementation agent

| Milestone | Deliverables | Exit condition |
|---|---|---|
| M0 — Contracts and setup | Inspect host repository, choose/pin compatible dependencies, establish game adapter, environment template and local run/test commands | Development shell runs; missing production credentials/contracts listed explicitly; no secrets committed |
| M1 — Rules and content | Shared pure kernel, schema, fixtures, solver, all 24 expanded content records and witness replay | Conservation/order/score tests pass; every map structurally valid and solved |
| M2 — Playable semantic slice | R01 and a wind map with DOM grid/list view, preview, commit, undo, results and local save | Entire six-turn game works via touch and keyboard without artwork being needed to understand it |
| M3 — Product flow | All screens, tutorial, hints/study, progression, EN/RU structure, offline/recovery states | Full solo loop and persistence verified; no dead-end buttons |
| M4 — Art and sound | Approved style lock, full raster manifest, original audio, responsive polish, accessibility modes | Production assets replace placeholders; runtime readability, licenses, audio and budgets checked |
| M5 — Telegram and services | Real launch auth, host adapter, authoritative actions/results, entitlements, optional challenge and approved checkout | Integration tests pass; real Telegram lifecycle tested; payment sandbox/test-mode evidence distinguished from live approval |
| M6 — Editorial and player review | Native EN/RU review, all hints, observed-player cycle, content revisions, low-end profiling | Source usability gates and device gates met; 24 enjoyable validated terrains retained |
| M7 — Release candidate | Production build/deployment plan, support/privacy, monitoring, backups, rollback and evidence package | Completion checklist below is satisfied or explicitly marked blocked; no disguised placeholders |

Work in vertical slices; the semantic prototype is an internal step, not the final visual quality bar. Do not spend the entire schedule generating art before proving that the rules and layouts fit on a phone. Do not treat a small successful tutorial as completion of the 24-terrain product.

### 21.2 Required future repository deliverables

The implementation delivery contains application source, shared rules source, backend/platform adapter, migrations where needed, locked dependencies, 24 versioned content records, localization bundles, generated/downloaded asset manifest and licenses, audio generation sources/masters or licensed provenance, automated tests, setup/run/build/test commands, environment-variable names without values, deployment/rollback notes and a verification report.

Suggested command capabilities: install/setup, run local app, run backend, validate content, verify witnesses, unit tests, browser tests, typecheck, lint, production build and asset/license audit. Exact command names follow the future repository's conventions; they must be documented and actually executable. A screenshot-only prototype, static Figma recreation or frontend that trusts client payment/score flags is not the requested completed game.

### 21.3 Definition of Done

The agent may say **“implementation complete”** only when:

- [ ] All six-turn rules and original SRS acceptance cases pass without changing their meaning.
- [ ] All 24 terrains are implemented, solvable, localized, mechanically verified and human-reviewed for their intended insight.
- [ ] Touch, keyboard and alternate-list play work; normal/RU-200%/monochrome/reduced-motion states are verified.
- [ ] Preview, undo, hints, Study, score explanation and partial results are correct and complete.
- [ ] Save/resume, uncertain actions, duplicate requests, offline practice, content versions and result grants are verified.
- [ ] Every required screen/state has working actions; placeholders and fake production data are removed.
- [ ] Raster artwork, derived compositions, optional audio and haptics meet the manifest and quality gates; no prohibited SVG assets.
- [ ] Actual Telegram clients, not only browser mocks, pass launch/lifecycle/safe-area/back behavior.
- [ ] Shared-platform integration is approved, or the delivery is explicitly labeled standalone with platform release blocked.
- [ ] Live-commerce prerequisites are approved and payment/refund flows are verified in the available official test environment; untested live behavior is not claimed.
- [ ] Enabled challenge functionality passes identical-forecast/assistance/replay tests; disabled optional scope is stated plainly.
- [ ] Native EN/RU editorial approval and the 12-player source gate are recorded, or clearly reported as outstanding human gates.
- [ ] Device performance, payload, memory, security/privacy and asset-license reports are attached.
- [ ] Production deployment, support, backups, schema migration and rollback procedures exist and have been exercised appropriately.

If human review, a real device, credentials or the missing Platform SRS is unavailable, continue all safe independent work and finish with a precise blocked-items list. Do not invent sign-offs, claim a simulator is a real device, weaken tests or call a disabled paid feature verified. Distinguish **code complete**, **verified release candidate** and **production released**.

## 22. Design-agent handoff brief

This section can be copied to a visual-design AI while retaining the rest of this document as the mechanical authority.

> Design a polished Telegram Mini App called **Pocket Monsoon / Карманный муссон**. It is a cozy but exact six-turn water-routing puzzle, not a farming idle game. The visual metaphor is a miniature ceramic hillside weather study: warm cream terraces, hand-painted botanical raster sprites, ink-blue water, shallow orthographic relief and quiet premium craft. The board is a square north-up 4×4 grid with stable rectangular touch cells. Do not turn it into an isometric diamond, rotate the compass or obscure data with vegetation.
>
> The crucial screen must show all six forecasts, the current turn, every plant's demand and growth target, cell water/capacity, height and downhill direction. A cloud's selected origin and its wind-shifted landing are visibly different. There is an explicit “Let it rain” button and a complete five-phase preview. The three units of rain are accounted for as stored, consumed, drained or evaporated. Plants remain healthy even in partial results.
>
> Produce: a mood/style sheet; a 390×844 portrait Home; normal gameplay with two plants; later gameplay with four plants; a wind preview showing separate origin and landing; the expanded water ledger; a full and a partial result; terrain selection; Collection with an appearance-only 75-Star set; Settings; a 320-pixel-width adaptation; a Russian 200%-text layout; high-contrast/reduced-motion representations; and a desktop two-column layout. These are design canvases, not a requirement to make all content fit without scrolling. Include loading, disabled, pending-save, offline and error states for the affected components.
>
> Use live text and numeric overlays, not text baked into images. Use Nunito Sans with Cyrillic coverage. All touch actions must be at least 44×44 CSS pixels; no essential drag or hover. Artwork is raster and will be generated through MCP; SVG assets are not wanted. Make free and paid cosmetics equally readable. Do not add coins, energy, deadlines, loot boxes, daily streaks, plant death, an avatar economy or a wallet to gameplay.
>
> Deliver a reusable component/token sheet, clear layer/anchor notes for each cell, export-safe raster guidance and annotated interaction states. Preserve the mechanics, screen-reader/list equivalence and six-turn content. New design ideas may improve composition and material character; any proposed rule or information-hierarchy change must be flagged for approval rather than silently incorporated.

The design pass may revise palette, material finish and composition after review. It cannot alter simulation, content hashes, assistance, payment truth, conservation or required information. Once approved, update this master document's visual tokens/asset prompts and keep one source of truth; do not leave a contradictory second design specification unexplained.

## 23. Risks and explicit release dependencies

| Risk/dependency | Why it matters | Required response |
|---|---|---|
| Missing Platform SRS | Shared account/wallet/API behavior is unknown | Obtain actual contract; use adapter and honest standalone development mode meanwhile |
| Tight water budget | Demand/targets can create impossible or forced maps | Mechanical validation, solver, independent replay and human content review |
| Rule order feels arbitrary | Routing, drinking and evaporation are distinct phases | Teaching fixture, complete preview, visible ledger; no extra weather types as a distraction |
| Four-plant information density | Art/labels can exceed phone space | Roster + cell list, measured 390 px and RU-200% layouts; never shrink essential text away |
| Cosmetic inconsistency | Image generation can drift or hide information | Style-lock reference, exact anchors, runtime-size review and identical live overlays |
| Audio fatigue | A 3–5 minute puzzle repeats short cues often | Sparse mix, variant grouping, default-off opt-in, independent controls and silent play |
| WebView suspension/storage eviction | Mobile lifecycle can interrupt saves/audio | Acknowledged transactions, pending-action reconciliation, honest offline durability |
| Public solutions | Deterministic authored puzzles cannot hide answers | Recreational same-forecast comparison, no prize claim or invasive anti-cheat |
| Price/provider terms change | Live payments and asset rights are external | Recheck official docs/terms at implementation and before launch; owner approval |
| Future design revision | User plans a separate visual-design pass | Use the complete baseline now; integrate approved changes without breaking mechanics |
| Human gates unavailable | An agent cannot fabricate usability/editorial approval | Report exactly what is tested and what remains blocked |

Owner-provided prerequisites before production: actual host/platform contract, Telegram bot and Mini App configuration, approved HTTPS hosting/API/database, payment catalogue approval, support identity/contact, privacy/terms/legal policy, production secret provisioning, available target devices and human editorial/playtest participants. These are named external inputs, not decisions left for the gameplay programmer to guess.

## 24. Sources and licensing references

Research checked on **15 September 2026**. External APIs and licenses must be rechecked against the actual implementation versions and downloaded files. These links inform platform, accessibility and acquisition constraints; they are not dependencies required to understand the game's rules. No reference implies that downloaded assets, payments or real-device tests have already been performed.

| Ref | Source | Used for |
|---|---|---|
| R0 | User-supplied *07_Pocket_Monsoon_SRS.md*, v1.0, 8 September 2026 | Game identity, fixed simulation, scope, scoring, content, economy and original acceptance gates |
| R1 | [Telegram Mini Apps — official documentation](https://core.telegram.org/bots/webapps) | WebApp integration, validated init data, viewports/safe areas, lifecycle, sharing and capability detection |
| R2 | [Telegram — Payments for Digital Goods and Services](https://core.telegram.org/bots/payments-stars) | Stars-only digital-goods flow, server payment confirmation, support and refund responsibilities |
| R3 | [Telegram Bot API](https://core.telegram.org/bots/api) — `createInvoiceLink`, `answerPreCheckoutQuery`, `SuccessfulPayment`, `refundStarPayment` | Backend invoice, validation, acknowledgment and refund API contracts |
| R4 | [Telegram Stars announcement](https://telegram.org/blog/telegram-stars) | Product context for Stars digital purchases; not a substitute for current API documentation |
| R5 | [MDN Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices), [Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay), [AudioContext.resume](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/resume) | Procedural audio options, browser permission behavior, context suspension/resume |
| R6 | [W3C WCAG 2.2 — Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | Correct distinction between AA's 24 px target criterion and this game's stronger 44 px touch requirement |
| R7 | [W3C WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/), [Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text) | Keyboard, non-color information, contrast, focus and 200% text behavior |
| R8 | [Nunito Sans — Google Fonts](https://fonts.google.com/specimen/Nunito+Sans), [font source directory](https://github.com/google/fonts/tree/main/ofl/nunitosans), [SIL OFL license file](https://github.com/google/fonts/blob/main/ofl/nunitosans/OFL.txt) | Self-hosted Latin/Cyrillic type family, current font source and redistribution/license notice |
| R9 | [Kenney — Interface Sounds](https://kenney.nl/assets/interface-sounds) | Approved optional source for quiet interface cues only |
| R10 | [Kenney — Support/licensing FAQ](https://kenney.nl/support) | CC0/commercial-use statement; verify downloaded archive's own license and record selected files |

The source SRS mentions reference identifiers R07 and R10 from another reference system whose bibliography was not supplied. Those identifiers are not assumed to refer to this document's R7/R10. No missing external game reference has been fabricated or used to claim measured retention/botanical realism.

## 25. Authored terrain catalogue and accounting witnesses

All 24 baseline terrains are specified below. The rules in §4 and assistance lifecycle in §5 remain authoritative; these are mechanically verified candidate puzzles, not player-certified final balance.

### 25.1 Exact conventions and verification boundary

Coordinates use columns **A–D** left to right and rows **1–4** top to bottom. Every matrix below gives **elevation/capacity**, with row 1 first and columns A, B, C, D in that order. All 16 cells are playable selections. `0/0` is ordinary zero-height, zero-storage ground: absent an explicitly listed edge, rain there drains immediately. It is not a wall or an excluded input. There are no implicit edges, diagonal transfers, source limits, passive releases or tile bonuses. An empty cell is one without a listed plant, including positive-capacity basins. All initial water and growth are zero.

Plant notation is `P#:cell demand/target`; plant order fixes the growth-vector order in every snapshot. Demand is always 1 or 2 and target is 2–4. R01–R06 each have exactly two plants; the remaining terrains have two to four. All listed edges are orthogonally adjacent and strictly downhill; routing uses descending elevation with row-major ties. Rain chapter forecasts are all calm. Forecasts and plans always list exactly six turns.

A turn means: shift the selected cloud cell one step in the visible forecast direction, keeping the selected cell if the push leaves the board; add exactly 3 rain units at the landing; route all overflow in the stated order while retaining each cell's capacity; let **every** plant consume its full demand if available and add at most one growth, capped at target, or consume all available water without growth if short; finally evaporate 1 remaining water unit **per cell**. Completed plants still consume. Plants and basins do not release stored water automatically. Success is checked at the end of the sixth turn; an earlier completed garden still takes the remaining inputs for this fixed-horizon fixture.

In the tables, **S** = total starting storage, **R** = rain, **E** = total ending storage, **C** = consumption (including insufficient and completed-plant drinks), **D** = drainage, **V** = evaporation, and **G** = cumulative growth vector after that turn. Every row satisfies **S + R = E + C + D + V**. The final column enumerates every nonzero end-water cell; `—` means all 16 cells are dry. Selection→landing is explicit even in calm. Final score is `max(0, 20 × finished plants + 5 × total growth − cumulative drainage)`.

Each primary plan is a **feasibility witness**, not an optimal-score claim or the only intended answer. Early lessons deliberately include redundant showers to expose ongoing consumption. Each terrain also has an independently searched alternate whose water/growth/accounting trajectory differs from the primary witness; alternate plans are not merely wind-clamp aliases. Exact alternate landings follow from the same visible forecasts. No solution-count, uniqueness, optimality or exhaustive difficulty claim is made.

**Study reveal:** primary plans and snapshots are authoring/Study material, not unsolicited default-play instructions. The three authored hints per terrain form an increasingly specific ladder; requesting one during an active attempt marks at least Assisted; Study never downgrades, and post-result help uses the separate session defined in §5.2. EN copy below is proposed and needs human editorial review; production also requires reviewed RU translations with identical coordinates and values. Human enjoyment, legibility, accessibility, observation with new players and actual-device performance remain unverified. R01/R02/W01 are deliberately generous; W07/T06 contain optional reservoir experiments, not mandatory superior routes. Specifically review whether those repeated reservoir lessons are enjoyable enough to retain.

### 25.2 Presentation metadata and production expansion

Every terrain below has initial `terrainVersion=1`, `rulesVersion=pm-rules-1` and chapter/order derived from its ID. The catalogue revision is `PM-24-proposal-1`. Serialized forecast tokens are `calm`, `N`, `E`, `S`, `W`; map them to the full localized direction names, never to the direction the wind comes from.

Within each terrain, plant P1 uses `bellcup`, P2 `ribbonfern`, P3 `starleaf` and P4 `lanternbud`. Namespace IDs as `{terrainId}:P1` and so on in the production data. The listed P-number order defines the snapshot growth vector; it need not be the row-major plant-processing or screen-reader order. Each plant's demand and target remain the listed values regardless of species.

Use the English titles in the exact records as the EN title strings. The table supplies draft RU titles and short EN briefing copy. The briefing sentence is atmospheric and optional to read; the complete numerical briefing remains mandatory. Localize these sentences and the three hints per terrain into reviewed Russian before release. Metadata is presentation-only and must not change a water calculation. These drafts do not substitute for native editorial approval.

| ID | Draft Russian title | English briefing sentence |
|---|---|---|
| R01 | Первый дождь на двоих | One small cloud, two patient cups. |
| R02 | Нижний вход | Not every door leads to both flowers. |
| R03 | Чаша на завтра | The hillside can remember a drop. |
| R04 | Две капли для колокольной чашки | Some roots listen for rain in pairs. |
| R05 | Ступень в обход | A step that holds nothing can still give. |
| R06 | Цветок вырос, но всё ещё пьёт | The flower is open. Its cup is not closed. |
| R07 | Два пути — один сад | Two paths arrive at the same quiet place. |
| R08 | Три капли — три корня | Three roots share a rhythm; one keeps its own. |
| W01 | На шаг восточнее | Let the cloud begin one step away. |
| W02 | Укрытый край | At the rim, the wind runs out of hillside. |
| W03 | Перекрёстный ветер, две чаши | The sky changes direction. The bowls remember. |
| W04 | Поймать северный склон | Catch the upper terrace while the sky allows. |
| W05 | Ветер у слияния | Different breezes, one meeting place. |
| W06 | Ветер на ступенях | The stairs carry rain; you carry the forecast. |
| W07 | Пустая чаша | An empty bowl is an invitation, not a promise. |
| W08 | Финал прогноза | Six passing clouds, one careful arrangement. |
| T01 | Повторный дождь открывает перелив | A full bowl changes the next shower. |
| T02 | Два входа — одна потребность | One flower hears two different approaches. |
| T03 | Два длинных ряда | Two rows of leaves, one sky to share. |
| T04 | Одна вершина — два подножия | The summit asks you to look both ways. |
| T05 | Широкая чаша, узкая горловина | A wide cup can make a narrow gift. |
| T06 | Водоём — не кран | Still water waits; only the overflow travels. |
| T07 | Двое противоположных ворот | The hillside has two doors to the weather. |
| T08 | Карманный муссон | One small forecast. A whole hillside listening. |

For production expansion, populate every cell explicitly from its matrix, add only the listed outflows/plants, attach the metadata above and the three hints, and compute the canonical mechanical content hash. Store the six table rows as primary snapshot fixtures. Re-simulate the alternate selections to produce their full fixtures; all inputs needed to do so are contained here. No separate authoring file is required to implement these levels.

### 25.3 Exact terrain records

#### R01 — First Shared Rain

**Insight:** `tutorial-two-cell-cascade`. The source-SRS teaching fixture: the upper cup keeps one drop and sends two to its lower neighbor. The lower plant needs one more growth step; direct showers also demonstrate carryover and ongoing consumption.

```text
       A   B   C   D
1      2/1 0/0 0/0 0/0
2      1/3 0/0 0/0 0/0
3      0/0 0/0 0/0 0/0
4      0/0 0/0 0/0 0/0
```

**Edges:** A1→A2. **Plants:** P1:A1 1/2; P2:A2 1/3.
**Forecast:** calm, calm, calm, calm, calm, calm.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | A1→A1 | 0 | 3 | 0 | 2 | 0 | 1 | 1/1 | — |
| 2 | A2→A2 | 0 | 3 | 1 | 1 | 0 | 1 | 1/2 | A2=1 |
| 3 | A1→A1 | 1 | 3 | 1 | 2 | 0 | 1 | 2/3 | A2=1 |
| 4 | A2→A2 | 1 | 3 | 1 | 1 | 1 | 1 | 2/3 | A2=1 |
| 5 | A1→A1 | 1 | 3 | 1 | 2 | 0 | 1 | 2/3 | A2=1 |
| 6 | A2→A2 | 1 | 3 | 1 | 1 | 1 | 1 | 2/3 | A2=1 |

**Six-turn totals:** C=9, D=2, V=6, E=1; all 2 plants complete, total growth 5, score **63**.
**Verified alternate selections:** A1, A1, A2, A1, A1, A1. **Landings:** A1, A1, A2, A1, A1, A1; score 65.

1. **Hint 1:** Follow A1's arrow to A2. Water moves between the cups before either plant drinks.
2. **Hint 2:** A1 keeps one of three drops and sends two to A2. Both plants can grow from that one shower.
3. **Hint 3:** Give A1 at least two showers. A2 needs three growth steps; another upper shower or a direct lower shower can supply the extra step. Preview its surviving water.

#### R02 — The Lower Door

**Insight:** `direct-versus-cascade`. Compare direct rain into a smaller lower cup against the upper cascade. Both routes are legal, but lower-only showers cost drainage and cannot replace the upper plant's visits.

```text
       A   B   C   D
1      0/0 0/0 0/0 0/0
2      0/0 1/1 0/0 0/0
3      0/0 0/2 0/0 0/0
4      0/0 0/0 0/0 0/0
```

**Edges:** B2→B3. **Plants:** P1:B2 1/3; P2:B3 1/3.
**Forecast:** calm, calm, calm, calm, calm, calm.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | B2→B2 | 0 | 3 | 0 | 2 | 0 | 1 | 1/1 | — |
| 2 | B3→B3 | 0 | 3 | 0 | 1 | 1 | 1 | 1/2 | — |
| 3 | B2→B2 | 0 | 3 | 0 | 2 | 0 | 1 | 2/3 | — |
| 4 | B3→B3 | 0 | 3 | 0 | 1 | 1 | 1 | 2/3 | — |
| 5 | B2→B2 | 0 | 3 | 0 | 2 | 0 | 1 | 3/3 | — |
| 6 | B3→B3 | 0 | 3 | 0 | 1 | 1 | 1 | 3/3 | — |

**Six-turn totals:** C=9, D=3, V=6, E=0; all 2 plants complete, total growth 6, score **67**.
**Verified alternate selections:** B2, B2, B2, B2, B2, B2. **Landings:** B2, B2, B2, B2, B2, B2; score 70.

1. **Hint 1:** The arrow runs from B2 to B3. Both pots resolve before either flower drinks.
2. **Hint 2:** B2 keeps one drop and sends two to B3. That is enough for both flowers to grow.
3. **Hint 3:** Use at least three showers on B2. Extra showers on B3 cannot replace the upper flower's three visits.

#### R03 — A Bowl for Tomorrow

**Insight:** `evaporation-carryover`. Seven required growth steps exceed the number of turns. The wide upper bowl must use water on a later turn while the cloud visits the other plant.

```text
       A   B   C   D
1      0/0 0/0 0/0 0/0
2      0/0 1/3 0/0 0/0
3      0/0 0/0 0/0 0/2
4      0/0 0/0 0/0 0/0
```

**Edges:** none. **Plants:** P1:B2 1/4; P2:D3 1/3.
**Forecast:** calm, calm, calm, calm, calm, calm.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | B2→B2 | 0 | 3 | 1 | 1 | 0 | 1 | 1/0 | B2=1 |
| 2 | D3→D3 | 1 | 3 | 0 | 2 | 1 | 1 | 2/1 | — |
| 3 | B2→B2 | 0 | 3 | 1 | 1 | 0 | 1 | 3/1 | B2=1 |
| 4 | D3→D3 | 1 | 3 | 0 | 2 | 1 | 1 | 4/2 | — |
| 5 | D3→D3 | 0 | 3 | 0 | 1 | 1 | 1 | 4/3 | — |
| 6 | D3→D3 | 0 | 3 | 0 | 1 | 1 | 1 | 4/3 | — |

**Six-turn totals:** C=8, D=4, V=6, E=0; all 2 plants complete, total growth 7, score **71**.
**Verified alternate selections:** B2, D3, B2, D3, D3, B2. **Landings:** B2, D3, B2, D3, D3, B2; score 72.

1. **Hint 1:** B2 holds three, drinks one and loses one to evaporation. One drop survives the turn.
2. **Hint 2:** On the next turn, that surviving drop can grow B2 even if rain lands at D3.
3. **Hint 3:** Separate two B2 showers with other actions and leave time for their next-turn growth. D3 needs three showers.

#### R04 — Two for the Bellcup

**Insight:** `two-plus-one-split`. A demand-two upstream plant shares exactly one spare drop with a demand-one neighbor. Its high target makes four upstream visits necessary.

```text
       A   B   C   D
1      0/0 0/0 0/0 0/0
2      0/0 2/2 0/0 0/0
3      0/0 1/1 0/0 0/0
4      0/0 0/0 0/0 0/0
```

**Edges:** B2→B3. **Plants:** P1:B2 2/4; P2:B3 1/4.
**Forecast:** calm, calm, calm, calm, calm, calm.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | B2→B2 | 0 | 3 | 0 | 3 | 0 | 0 | 1/1 | — |
| 2 | B3→B3 | 0 | 3 | 0 | 1 | 2 | 0 | 1/2 | — |
| 3 | B2→B2 | 0 | 3 | 0 | 3 | 0 | 0 | 2/3 | — |
| 4 | B2→B2 | 0 | 3 | 0 | 3 | 0 | 0 | 3/4 | — |
| 5 | B3→B3 | 0 | 3 | 0 | 1 | 2 | 0 | 3/4 | — |
| 6 | B2→B2 | 0 | 3 | 0 | 3 | 0 | 0 | 4/4 | — |

**Six-turn totals:** C=14, D=4, V=0, E=0; all 2 plants complete, total growth 8, score **76**.
**Verified alternate selections:** B2, B2, B2, B2, B2, B2. **Landings:** B2, B2, B2, B2, B2, B2; score 80.

1. **Hint 1:** The Bellcup at B2 needs two drops at once. A single drop is consumed without growth.
2. **Hint 2:** A shower at B2 supplies its two-drop demand and sends the third drop to B3.
3. **Hint 3:** Reserve at least four of the six showers for B2. Those four showers can also finish B3.

#### R05 — The Bypass Step

**Insight:** `bypass-and-demand-threshold`. The zero-storage step is a real rain inlet. The upper bowl can bank growth, but its one-drop repeat overflow cannot satisfy the downstream two-drop plant.

```text
       A   B   C   D
1      0/0 0/0 0/0 0/0
2      0/0 2/3 0/0 0/0
3      0/0 1/0 0/2 0/0
4      0/0 0/0 0/0 0/0
```

**Edges:** B2→B3; B3→C3. **Plants:** P1:B2 1/4; P2:C3 2/3.
**Forecast:** calm, calm, calm, calm, calm, calm.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | B2→B2 | 0 | 3 | 1 | 1 | 0 | 1 | 1/0 | B2=1 |
| 2 | B3→B3 | 1 | 3 | 0 | 3 | 1 | 0 | 2/1 | — |
| 3 | B2→B2 | 0 | 3 | 1 | 1 | 0 | 1 | 3/1 | B2=1 |
| 4 | B3→B3 | 1 | 3 | 0 | 3 | 1 | 0 | 4/2 | — |
| 5 | B3→B3 | 0 | 3 | 0 | 2 | 1 | 0 | 4/3 | — |
| 6 | C3→C3 | 0 | 3 | 0 | 2 | 1 | 0 | 4/3 | — |

**Six-turn totals:** C=12, D=4, V=2, E=0; all 2 plants complete, total growth 7, score **71**.
**Verified alternate selections:** B2, B3, B2, B3, B3, B2. **Landings:** B2, B3, B2, B3, B3, B2; score 72.

1. **Hint 1:** B3 has no storage. Rain placed there immediately follows its arrow into C3.
2. **Hint 2:** C3 needs two drops in the same turn; it cannot save an insufficient single drop for later.
3. **Hint 3:** Space two B2 showers, with the second by turn five, and give C3 three full showers directly or through B3.

#### R06 — A Full Flower Still Drinks

**Insight:** `completed-plant-demand`. Unequal targets finish the upper flower early. Its demand remains in the budget, yet its one-drop cup still sends exactly two drops downstream.

```text
       A   B   C   D
1      0/0 0/0 0/0 0/0
2      2/1 1/2 0/0 0/0
3      0/0 0/0 0/0 0/0
4      0/0 0/0 0/0 0/0
```

**Edges:** A2→B2. **Plants:** P1:A2 1/2; P2:B2 2/4.
**Forecast:** calm, calm, calm, calm, calm, calm.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | A2→A2 | 0 | 3 | 0 | 3 | 0 | 0 | 1/1 | — |
| 2 | B2→B2 | 0 | 3 | 0 | 2 | 1 | 0 | 1/2 | — |
| 3 | A2→A2 | 0 | 3 | 0 | 3 | 0 | 0 | 2/3 | — |
| 4 | B2→B2 | 0 | 3 | 0 | 2 | 1 | 0 | 2/4 | — |
| 5 | A2→A2 | 0 | 3 | 0 | 3 | 0 | 0 | 2/4 | — |
| 6 | A2→A2 | 0 | 3 | 0 | 3 | 0 | 0 | 2/4 | — |

**Six-turn totals:** C=16, D=2, V=0, E=0; all 2 plants complete, total growth 6, score **68**.
**Verified alternate selections:** A2, A2, A2, A2, A2, A2. **Landings:** A2, A2, A2, A2, A2, A2; score 70.

1. **Hint 1:** A2 needs only two growth steps; B2 needs four. A finished bloom is not an empty channel.
2. **Hint 2:** After A2 finishes, it still keeps and drinks one drop. Its remaining two drops can still grow B2.
3. **Hint 3:** Keep using A2 after it blooms if you want to feed B2 without the direct shower's one-drop drainage.

#### R07 — Two Paths, One Garden

**Insight:** `converging-feeders`. Both feeder plants need three visits, consuming all six inputs. Their shared middle flower has a lower combined need; an empty terminal basin catches the extra drop.

```text
       A   B   C   D
1      0/0 2/1 0/0 0/0
2      2/1 1/1 0/1 0/0
3      0/0 0/0 0/0 0/0
4      0/0 0/0 0/0 0/0
```

**Edges:** A2→B2; B1→B2; B2→C2. **Plants:** P1:A2 1/3; P2:B1 1/3; P3:B2 1/4.
**Forecast:** calm, calm, calm, calm, calm, calm.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | A2→A2 | 0 | 3 | 0 | 2 | 0 | 1 | 1/0/1 | — |
| 2 | B1→B1 | 0 | 3 | 0 | 2 | 0 | 1 | 1/1/2 | — |
| 3 | A2→A2 | 0 | 3 | 0 | 2 | 0 | 1 | 2/1/3 | — |
| 4 | B1→B1 | 0 | 3 | 0 | 2 | 0 | 1 | 2/2/4 | — |
| 5 | A2→A2 | 0 | 3 | 0 | 2 | 0 | 1 | 3/2/4 | — |
| 6 | B1→B1 | 0 | 3 | 0 | 2 | 0 | 1 | 3/3/4 | — |

**Six-turn totals:** C=12, D=0, V=6, E=0; all 3 plants complete, total growth 10, score **110**.
**Verified alternate selections:** B1, B1, B1, A2, A2, A2. **Landings:** B1, B1, B1, A2, A2, A2; score 110.

1. **Hint 1:** A2 and B1 both send water into B2. Neither feeder can water the other.
2. **Hint 2:** Each feeder needs three showers, so there is no spare turn for a middle-only shower.
3. **Hint 3:** Divide the six inputs three-and-three between A2 and B1. B2 grows along the way; C2's final drop evaporates.

#### R08 — Three Drops, Three Roots

**Insight:** `chain-versus-banked-solo`. The Rain chapter combines a three-plant cascade with a separate banking bowl. Four chain visits and two suitably spaced bowl visits fill a real six-turn budget.

```text
       A   B   C   D
1      0/0 3/1 0/0 0/0
2      0/0 2/1 1/1 0/0
3      0/0 0/0 0/0 0/3
4      0/0 0/0 0/0 0/0
```

**Edges:** B1→B2; B2→C2. **Plants:** P1:B1 1/3; P2:B2 1/4; P3:C2 1/3; P4:D3 1/4.
**Forecast:** calm, calm, calm, calm, calm, calm.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | D3→D3 | 0 | 3 | 1 | 1 | 0 | 1 | 0/0/0/1 | D3=1 |
| 2 | B1→B1 | 1 | 3 | 0 | 4 | 0 | 0 | 1/1/1/2 | — |
| 3 | D3→D3 | 0 | 3 | 1 | 1 | 0 | 1 | 1/1/1/3 | D3=1 |
| 4 | B1→B1 | 1 | 3 | 0 | 4 | 0 | 0 | 2/2/2/4 | — |
| 5 | B1→B1 | 0 | 3 | 0 | 3 | 0 | 0 | 3/3/3/4 | — |
| 6 | B1→B1 | 0 | 3 | 0 | 3 | 0 | 0 | 3/4/3/4 | — |

**Six-turn totals:** C=16, D=0, V=2, E=0; all 4 plants complete, total growth 14, score **150**.
**Verified alternate selections:** B1, B1, D3, B1, D3, B1. **Landings:** B1, B1, D3, B1, D3, B1; score 150.

1. **Hint 1:** A shower at B1 can grow B1, B2 and C2 in the same turn. B2 has the largest chain target.
2. **Hint 2:** D3 needs four growth steps but can earn two steps from each well-spaced shower.
3. **Hint 3:** Plan two nonconsecutive D3 showers, with the second no later than turn five; spend the other four inputs on the chain.

#### W01 — One Step East

**Insight:** `cloud-versus-landing`. A constant eastward forecast isolates the distinction between the selected cell and the wet cell, while retaining the readable one-plus-two cascade.

```text
       A   B   C   D
1      0/0 0/0 0/0 0/0
2      0/0 0/0 1/1 0/0
3      0/0 0/0 0/2 0/0
4      0/0 0/0 0/0 0/0
```

**Edges:** C2→C3. **Plants:** P1:C2 1/3; P2:C3 2/3.
**Forecast:** E, E, E, E, E, E.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | B2→C2 | 0 | 3 | 0 | 3 | 0 | 0 | 1/1 | — |
| 2 | B3→C3 | 0 | 3 | 0 | 2 | 1 | 0 | 1/2 | — |
| 3 | B2→C2 | 0 | 3 | 0 | 3 | 0 | 0 | 2/3 | — |
| 4 | B3→C3 | 0 | 3 | 0 | 2 | 1 | 0 | 2/3 | — |
| 5 | B2→C2 | 0 | 3 | 0 | 3 | 0 | 0 | 3/3 | — |
| 6 | B2→C2 | 0 | 3 | 0 | 3 | 0 | 0 | 3/3 | — |

**Six-turn totals:** C=16, D=2, V=0, E=0; all 2 plants complete, total growth 6, score **68**.
**Verified alternate selections:** B2, B2, B2, B2, B2, B2. **Landings:** C2, C2, C2, C2, C2, C2; score 70.

1. **Hint 1:** The cloud moves east before rain falls. The outlined landing cell, not the selected cell, receives three drops.
2. **Hint 2:** To rain at C2, select B2. Selecting C2 would wet D2 instead.
3. **Hint 3:** Select B2 on at least three turns to grow both plants. B3 selects a lower-only shower at C3.

#### W02 — The Sheltered Rim

**Insight:** `clamped-edge-and-window`. The northeast inlet can anchor against either forecast. The southern bowl cannot receive north-wind rain, so its banking visits use east-wind slots.

```text
       A   B   C   D
1      0/0 0/0 0/0 2/1
2      0/0 0/0 0/0 1/2
3      0/0 0/0 0/0 0/0
4      0/0 0/3 0/0 0/0
```

**Edges:** D1→D2. **Plants:** P1:D1 1/3; P2:D2 2/3; P3:B4 1/4.
**Forecast:** E, N, E, N, E, N.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | A4→B4 | 0 | 3 | 1 | 1 | 0 | 1 | 0/0/1 | B4=1 |
| 2 | D1→D1 | 1 | 3 | 0 | 4 | 0 | 0 | 1/1/2 | — |
| 3 | A4→B4 | 0 | 3 | 1 | 1 | 0 | 1 | 1/1/3 | B4=1 |
| 4 | D1→D1 | 1 | 3 | 0 | 4 | 0 | 0 | 2/2/4 | — |
| 5 | D1→D1 | 0 | 3 | 0 | 3 | 0 | 0 | 3/3/4 | — |
| 6 | D1→D1 | 0 | 3 | 0 | 3 | 0 | 0 | 3/3/4 | — |

**Six-turn totals:** C=16, D=0, V=2, E=0; all 3 plants complete, total growth 10, score **110**.
**Verified alternate selections:** D1, D1, A4, D1, A4, D1. **Landings:** D1, D1, B4, D1, B4, D1; score 110.

1. **Hint 1:** A push beyond the board leaves the cloud on its selected edge cell; it never wraps around.
2. **Hint 2:** D1 is a safe anchor in both east and north wind. B4 is reachable only on the east-wind turns here.
3. **Hint 3:** Use two of turns one, three and five for B4, and at least three other turns for D1. Leave a turn after B4's last rain.

#### W03 — Crosswinds, Twin Banks

**Insight:** `two-bank-scheduling`. Two independent wide bowls need two separated showers each; the demand-two rim plant needs two immediate drinks. West wind temporarily closes the rim option.

```text
       A   B   C   D
1      0/0 0/0 0/0 0/0
2      0/0 1/3 0/0 0/2
3      0/0 0/0 1/3 0/0
4      0/0 0/0 0/0 0/0
```

**Edges:** none. **Plants:** P1:B2 1/4; P2:C3 1/4; P3:D2 2/2.
**Forecast:** N, E, S, W, N, E.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | B3→B2 | 0 | 3 | 1 | 1 | 0 | 1 | 1/0/0 | B2=1 |
| 2 | B3→C3 | 1 | 3 | 1 | 2 | 0 | 1 | 2/1/0 | C3=1 |
| 3 | D1→D2 | 1 | 3 | 0 | 3 | 1 | 0 | 2/2/1 | — |
| 4 | C2→B2 | 0 | 3 | 1 | 1 | 0 | 1 | 3/2/1 | B2=1 |
| 5 | C4→C3 | 1 | 3 | 1 | 2 | 0 | 1 | 4/3/1 | C3=1 |
| 6 | D2→D2 | 1 | 3 | 0 | 3 | 1 | 0 | 4/4/2 | — |

**Six-turn totals:** C=12, D=2, V=4, E=0; all 3 plants complete, total growth 10, score **108**.
**Verified alternate selections:** B3, B3, B1, D3, D3, D2. **Landings:** B2, C3, B2, C3, D2, D2; score 108.

1. **Hint 1:** B2 and C3 can each use a shower twice, once now and once on the next turn.
2. **Hint 2:** D2 needs two drops together and retains no water after drinking and evaporation. West wind cannot land in column D.
3. **Hint 3:** Give each wide bowl two nonconsecutive showers ending by turn five. Put D2's two showers outside the west-wind turn.

#### W04 — Catch the North Face

**Insight:** `opposite-boundary-windows`. Opposite corners open on different turns. Unequal chain targets preserve a lower-only fallback instead of requiring one opaque corner sequence.

```text
       A   B   C   D
1      3/1 0/0 0/0 0/0
2      2/2 0/0 0/0 0/0
3      0/0 0/0 0/0 0/0
4      0/0 0/0 0/0 0/3
```

**Edges:** A1→A2. **Plants:** P1:A1 1/2; P2:A2 2/3; P3:D4 1/4.
**Forecast:** N, S, W, N, E, S.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | A1→A1 | 0 | 3 | 0 | 3 | 0 | 0 | 1/1/0 | — |
| 2 | D4→D4 | 0 | 3 | 1 | 1 | 0 | 1 | 1/1/1 | D4=1 |
| 3 | A1→A1 | 1 | 3 | 0 | 4 | 0 | 0 | 2/2/2 | — |
| 4 | A1→A1 | 0 | 3 | 0 | 3 | 0 | 0 | 2/3/2 | — |
| 5 | D4→D4 | 0 | 3 | 1 | 1 | 0 | 1 | 2/3/3 | D4=1 |
| 6 | A1→A2 | 1 | 3 | 0 | 3 | 1 | 0 | 2/3/4 | — |

**Six-turn totals:** C=15, D=1, V=2, E=0; all 3 plants complete, total growth 9, score **104**.
**Verified alternate selections:** A1, D4, A1, A1, D4, D4. **Landings:** A1, D4, A1, A1, D4, D4; score 104.

1. **Hint 1:** A1 cannot receive a southward or eastward push. D4 cannot receive a northward or westward push.
2. **Hint 2:** The lower plant A2 needs three drinks, while A1 needs only two. A2 can sometimes be watered when A1 is unavailable.
3. **Hint 3:** D4 can bank four growth steps from rain on turns two and five. Use the remaining windows to finish the A1–A2 pair.

#### W05 — A Crosswind Confluence

**Insight:** `asymmetric-feeders-in-wind`. Unlike the Rain confluence, one feeder drinks two and the other one. Both grow the shared flower, but only the one-drop feeder also wets the terminal basin.

```text
       A   B   C   D
1      0/0 2/1 0/0 0/0
2      2/2 1/1 0/0 0/0
3      0/0 0/1 0/0 0/0
4      0/0 0/0 0/0 0/0
```

**Edges:** A2→B2; B1→B2; B2→B3. **Plants:** P1:A2 2/3; P2:B1 1/3; P3:B2 1/4.
**Forecast:** N, E, S, W, N, W.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | A3→A2 | 0 | 3 | 0 | 3 | 0 | 0 | 1/0/1 | — |
| 2 | A1→B1 | 0 | 3 | 0 | 2 | 0 | 1 | 1/1/2 | — |
| 3 | A1→A2 | 0 | 3 | 0 | 3 | 0 | 0 | 2/1/3 | — |
| 4 | C1→B1 | 0 | 3 | 0 | 2 | 0 | 1 | 2/2/4 | — |
| 5 | A3→A2 | 0 | 3 | 0 | 3 | 0 | 0 | 3/2/4 | — |
| 6 | C1→B1 | 0 | 3 | 0 | 2 | 0 | 1 | 3/3/4 | — |

**Six-turn totals:** C=15, D=0, V=3, E=0; all 3 plants complete, total growth 10, score **110**.
**Verified alternate selections:** B1, A1, A1, C1, A3, A2. **Landings:** B1, B1, A2, B1, A2, A2; score 110.

1. **Hint 1:** The two feeder pots have different demands, even though their arrows meet at B2.
2. **Hint 2:** A2 sends one drop downstream; B1 sends two. B2 needs only one, and the spare drop at B3 evaporates.
3. **Hint 3:** Use each feeder three times. Do not schedule A2 in east wind or B1 in south wind; the other slots can be rearranged.

#### W06 — Wind Along the Stair

**Insight:** `empty-summit-and-tail-target`. A zero-capacity summit and a direct top-plant inlet are equivalent routes, not new mechanics. A higher tail target creates a useful lower-only action when the top row is closed.

```text
       A   B   C   D
1      3/0 2/1 0/0 0/0
2      0/0 1/1 0/1 0/0
3      0/0 0/0 0/0 0/3
4      0/0 0/0 0/0 0/0
```

**Edges:** A1→B1; B1→B2; B2→C2. **Plants:** P1:B1 1/3; P2:B2 1/3; P3:C2 1/4; P4:D3 1/4.
**Forecast:** N, E, S, W, E, N.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | A1→A1 | 0 | 3 | 0 | 3 | 0 | 0 | 1/1/1/0 | — |
| 2 | D3→D3 | 0 | 3 | 1 | 1 | 0 | 1 | 1/1/1/1 | D3=1 |
| 3 | C1→C2 | 1 | 3 | 0 | 2 | 2 | 0 | 1/1/2/2 | — |
| 4 | A1→A1 | 0 | 3 | 0 | 3 | 0 | 0 | 2/2/3/2 | — |
| 5 | D3→D3 | 0 | 3 | 1 | 1 | 0 | 1 | 2/2/3/3 | D3=1 |
| 6 | B1→B1 | 1 | 3 | 0 | 4 | 0 | 0 | 3/3/4/4 | — |

**Six-turn totals:** C=14, D=2, V=2, E=0; all 4 plants complete, total growth 14, score **148**.
**Verified alternate selections:** A1, A1, D2, A1, D3, A1. **Landings:** A1, B1, D3, A1, D3, A1; score 150.

1. **Hint 1:** A1 holds nothing, so all three drops continue through B1, B2 and C2 in one turn.
2. **Hint 2:** South wind on turn three cannot land in row one. The tail C2 or the separate bowl D3 is still reachable.
3. **Hint 3:** Combine three top-chain showers, one extra C2 drink and two spaced D3 showers. A fourth top shower can replace the tail-only drink if reachable.

#### W07 — The Empty Cup

**Insight:** `reservoir-primer-versus-bypass`. An optional reservoir experiment contrasts consecutive refill overflow with a direct inlet. It is not a passive tap or a required efficiency upgrade; the witness makes its cost visible.

```text
       A   B   C   D
1      0/0 3/3 0/0 0/0
2      0/0 2/1 1/1 0/0
3      1/3 0/0 0/0 0/0
4      0/0 0/0 0/0 0/0
```

**Edges:** B1→B2; B2→C2. **Plants:** P1:B2 1/3; P2:C2 1/3; P3:A3 1/4.
**Forecast:** N, E, S, W, N, E.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | B1→B1 | 0 | 3 | 2 | 0 | 0 | 1 | 0/0/0 | B1=2 |
| 2 | A1→B1 | 2 | 3 | 2 | 2 | 0 | 1 | 1/1/0 | B1=2 |
| 3 | A2→A3 | 2 | 3 | 2 | 1 | 0 | 2 | 1/1/1 | B1=1, A3=1 |
| 4 | C2→B2 | 2 | 3 | 0 | 3 | 1 | 1 | 2/2/2 | — |
| 5 | A4→A3 | 0 | 3 | 1 | 1 | 0 | 1 | 2/2/3 | A3=1 |
| 6 | A2→B2 | 1 | 3 | 0 | 3 | 1 | 0 | 3/3/4 | — |

**Six-turn totals:** C=10, D=2, V=6, E=0; all 3 plants complete, total growth 10, score **108**.
**Verified alternate selections:** B3, A2, A2, C2, A4, A1. **Landings:** B2, B2, A3, B2, A3, B1; score 107.

1. **Hint 1:** The empty B1 cup has no plant. After its first shower it keeps two drops, but sends nothing downstream.
2. **Hint 2:** A second immediate shower at B1 overflows two drops, enough for B2 and C2. Stored water does not flow by itself on dry turns.
3. **Hint 3:** You may prime B1 on turns one and two, then use direct B2 showers. A3 can bank its four steps from turns three and five.

#### W08 — Forecast Finale

**Insight:** `wind-windows-with-bypass-choice`. The rim bowl has scarce banking windows, while the chain's middle target exceeds its upper target. A lower inlet can rescue a forecast slot that cannot reach the upper feeder.

```text
       A   B   C   D
1      0/0 0/0 0/0 0/0
2      3/1 2/1 0/0 0/0
3      0/0 1/1 0/0 0/0
4      0/0 0/0 0/0 0/3
```

**Edges:** A2→B2; B2→B3. **Plants:** P1:A2 1/3; P2:B2 1/4; P3:B3 1/3; P4:D4 1/4.
**Forecast:** N, E, S, W, E, N.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | A3→A2 | 0 | 3 | 0 | 3 | 0 | 0 | 1/1/1/0 | — |
| 2 | D4→D4 | 0 | 3 | 1 | 1 | 0 | 1 | 1/1/1/1 | D4=1 |
| 3 | A1→A2 | 1 | 3 | 0 | 4 | 0 | 0 | 2/2/2/2 | — |
| 4 | A2→A2 | 0 | 3 | 0 | 3 | 0 | 0 | 3/3/3/2 | — |
| 5 | D4→D4 | 0 | 3 | 1 | 1 | 0 | 1 | 3/3/3/3 | D4=1 |
| 6 | A3→A2 | 1 | 3 | 0 | 4 | 0 | 0 | 3/4/3/4 | — |

**Six-turn totals:** C=16, D=0, V=2, E=0; all 4 plants complete, total growth 14, score **150**.
**Verified alternate selections:** A3, A2, D4, A2, D4, A3. **Landings:** A2, B2, D4, A2, D4, A2; score 149.

1. **Hint 1:** D4 is reachable on turns two, three and five. Its second shower must leave time for a following growth step.
2. **Hint 2:** B2 needs four drinks, but A2 needs only three. One shower may enter at B2 if wind blocks A2.
3. **Hint 3:** Try D4 on turns two and five, or three and five. In the latter plan, use B2 directly on the east-wind second turn.

#### T01 — Repeated Rain Opens the Spillway

**Insight:** `banking-versus-repeat-overflow`. A wide planted bowl now feeds a needy neighbor. Spacing maximizes its own growth per shower; consecutive visits sacrifice that advantage to deliver a useful one-drop spill.

```text
       A   B   C   D
1      0/0 0/0 0/0 0/0
2      2/3 1/1 0/0 0/0
3      0/0 0/0 0/2 0/0
4      0/0 0/0 0/0 0/0
```

**Edges:** A2→B2. **Plants:** P1:A2 1/4; P2:B2 1/3; P3:C3 2/2.
**Forecast:** calm, calm, calm, calm, calm, calm.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | A2→A2 | 0 | 3 | 1 | 1 | 0 | 1 | 1/0/0 | A2=1 |
| 2 | A2→A2 | 1 | 3 | 1 | 2 | 0 | 1 | 2/1/0 | A2=1 |
| 3 | A2→A2 | 1 | 3 | 1 | 2 | 0 | 1 | 3/2/0 | A2=1 |
| 4 | B2→B2 | 1 | 3 | 0 | 2 | 2 | 0 | 4/3/0 | — |
| 5 | C3→C3 | 0 | 3 | 0 | 2 | 1 | 0 | 4/3/1 | — |
| 6 | C3→C3 | 0 | 3 | 0 | 2 | 1 | 0 | 4/3/2 | — |

**Six-turn totals:** C=11, D=4, V=3, E=0; all 3 plants complete, total growth 9, score **101**.
**Verified alternate selections:** A2, A2, A2, A2, C3, C3. **Landings:** A2, A2, A2, A2, C3, C3; score 103.

1. **Hint 1:** A2 keeps one drop after a shower. A shower immediately afterward therefore spills one into B2.
2. **Hint 2:** Spacing every A2 shower helps A2 but leaves B2 dry. C3 still needs two full two-drop drinks.
3. **Hint 3:** Start with three consecutive A2 showers, then one B2 and two C3 showers. Four consecutive A2 showers plus two C3 showers also work.

#### T02 — Two Inlets, One Thirst

**Insight:** `partial-consumption-is-not-growth`. Both routes conserve all rain as plant consumption, but only one satisfies the middle demand. Consumption totals alone therefore do not predict progress.

```text
       A   B   C   D
1      0/0 2/2 0/0 0/0
2      2/1 1/2 0/0 0/0
3      0/0 0/0 0/0 0/0
4      0/0 0/0 0/0 0/0
```

**Edges:** A2→B2; B1→B2. **Plants:** P1:A2 1/3; P2:B1 2/3; P3:B2 2/3.
**Forecast:** calm, calm, calm, calm, calm, calm.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | A2→A2 | 0 | 3 | 0 | 3 | 0 | 0 | 1/0/1 | — |
| 2 | B1→B1 | 0 | 3 | 0 | 3 | 0 | 0 | 1/1/1 | — |
| 3 | A2→A2 | 0 | 3 | 0 | 3 | 0 | 0 | 2/1/2 | — |
| 4 | B1→B1 | 0 | 3 | 0 | 3 | 0 | 0 | 2/2/2 | — |
| 5 | A2→A2 | 0 | 3 | 0 | 3 | 0 | 0 | 3/2/3 | — |
| 6 | B1→B1 | 0 | 3 | 0 | 3 | 0 | 0 | 3/3/3 | — |

**Six-turn totals:** C=18, D=0, V=0, E=0; all 3 plants complete, total growth 9, score **105**.
**Verified alternate selections:** A2, A2, A2, B1, B1, B1. **Landings:** A2, A2, A2, B1, B1, B1; score 105.

1. **Hint 1:** B2 needs two drops together. A single incoming drop is still consumed, but earns no growth.
2. **Hint 2:** A2 sends two drops and grows B2; B1 sends only one. Water from different turns cannot combine inside a thirsty plant.
3. **Hint 3:** Give A2 and B1 three showers each. B2's three growth steps come specifically from the A2 showers.

#### T03 — Two Long Rows

**Insight:** `independent-efficient-splits`. Two disconnected chains reverse the order of one-drop and two-drop demands. Six showers can supply all eighteen required consumption units with no drainage or evaporation.

```text
       A   B   C   D
1      3/1 2/2 0/0 0/0
2      0/0 0/0 0/0 0/0
3      0/0 0/0 0/0 0/0
4      0/0 0/0 2/2 1/1
```

**Edges:** A1→B1; C4→D4. **Plants:** P1:A1 1/3; P2:B1 2/3; P3:C4 2/3; P4:D4 1/3.
**Forecast:** calm, calm, calm, calm, calm, calm.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | A1→A1 | 0 | 3 | 0 | 3 | 0 | 0 | 1/1/0/0 | — |
| 2 | C4→C4 | 0 | 3 | 0 | 3 | 0 | 0 | 1/1/1/1 | — |
| 3 | A1→A1 | 0 | 3 | 0 | 3 | 0 | 0 | 2/2/1/1 | — |
| 4 | C4→C4 | 0 | 3 | 0 | 3 | 0 | 0 | 2/2/2/2 | — |
| 5 | A1→A1 | 0 | 3 | 0 | 3 | 0 | 0 | 3/3/2/2 | — |
| 6 | C4→C4 | 0 | 3 | 0 | 3 | 0 | 0 | 3/3/3/3 | — |

**Six-turn totals:** C=18, D=0, V=0, E=0; all 4 plants complete, total growth 12, score **140**.
**Verified alternate selections:** A1, A1, A1, C4, C4, C4. **Landings:** A1, A1, A1, C4, C4, C4; score 140.

1. **Hint 1:** Each row consumes exactly three drops when watered through its upstream plant.
2. **Hint 2:** The upper row splits one then two; the lower row splits two then one. Check capacity rather than assuming all upstream plants are identical.
3. **Hint 3:** Rain three times at A1 and three times at C4, in any order. Direct lower-pot showers cannot grow their upstream partners.

#### T04 — One Top, Two Bottoms

**Insight:** `feeder-selects-cascade-depth`. A four-plant confluence turns feeder demand into reach: one arm waters only the middle, the other reaches the tail. The middle flower finishes early but remains in the budget.

```text
       A   B   C   D
1      0/0 3/1 0/0 0/0
2      3/2 2/1 1/1 0/0
3      0/0 0/0 0/0 0/0
4      0/0 0/0 0/0 0/0
```

**Edges:** A2→B2; B1→B2; B2→C2. **Plants:** P1:A2 2/3; P2:B1 1/3; P3:B2 1/4; P4:C2 1/3.
**Forecast:** calm, calm, calm, calm, calm, calm.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | A2→A2 | 0 | 3 | 0 | 3 | 0 | 0 | 1/0/1/0 | — |
| 2 | B1→B1 | 0 | 3 | 0 | 3 | 0 | 0 | 1/1/2/1 | — |
| 3 | A2→A2 | 0 | 3 | 0 | 3 | 0 | 0 | 2/1/3/1 | — |
| 4 | B1→B1 | 0 | 3 | 0 | 3 | 0 | 0 | 2/2/4/2 | — |
| 5 | A2→A2 | 0 | 3 | 0 | 3 | 0 | 0 | 3/2/4/2 | — |
| 6 | B1→B1 | 0 | 3 | 0 | 3 | 0 | 0 | 3/3/4/3 | — |

**Six-turn totals:** C=18, D=0, V=0, E=0; all 4 plants complete, total growth 13, score **145**.
**Verified alternate selections:** B1, B1, B1, A2, A2, A2. **Landings:** B1, B1, B1, A2, A2, A2; score 145.

1. **Hint 1:** A2 sends one spare drop to B2. B1 sends two, enough to continue through B2 into C2.
2. **Hint 2:** C2's three drinks must come from B1 showers. Finishing B2 does not free its one-drop share.
3. **Hint 3:** Use each feeder three times. Follow a B1 shower all the way to C2 in preview to see the complete three-drop budget.

#### T05 — Wide Bowl, Narrow Neck

**Insight:** `spill-threshold-versus-middle-entry`. A one-drop repeat spill can fill the neck but never reach the two-drop tail. The alternative is genuine: bypass the bowl and a middle-entry shower can grow both lower plants.

```text
       A   B   C   D
1      0/0 0/0 0/0 0/0
2      3/3 2/1 1/2 0/0
3      0/0 0/0 0/0 0/0
4      0/0 0/0 0/0 0/0
```

**Edges:** A2→B2; B2→C2. **Plants:** P1:A2 1/4; P2:B2 1/2; P3:C2 2/3.
**Forecast:** calm, calm, calm, calm, calm, calm.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | A2→A2 | 0 | 3 | 1 | 1 | 0 | 1 | 1/0/0 | A2=1 |
| 2 | A2→A2 | 1 | 3 | 1 | 2 | 0 | 1 | 2/1/0 | A2=1 |
| 3 | A2→A2 | 1 | 3 | 1 | 2 | 0 | 1 | 3/2/0 | A2=1 |
| 4 | C2→C2 | 1 | 3 | 0 | 3 | 1 | 0 | 4/2/1 | — |
| 5 | C2→C2 | 0 | 3 | 0 | 2 | 1 | 0 | 4/2/2 | — |
| 6 | C2→C2 | 0 | 3 | 0 | 2 | 1 | 0 | 4/2/3 | — |

**Six-turn totals:** C=12, D=3, V=3, E=0; all 3 plants complete, total growth 9, score **102**.
**Verified alternate selections:** B2, B2, A2, B2, A2, A2. **Landings:** B2, B2, A2, B2, A2, A2; score 105.

1. **Hint 1:** Repeated A2 rain spills just one drop. B2 keeps it all, so C2 receives nothing from that spill.
2. **Hint 2:** Rain directly at B2 instead: it keeps one and sends two to C2, satisfying both lower demands.
3. **Hint 3:** Either start with three A2 showers then give C2 three drinks, or space A2's banking showers and use B2 as a shared lower inlet.

#### T06 — The Holding Pond Is Not a Tap

**Insight:** `reservoir-overflow-depth`. A primed pond releases only two overflow drops, one short of the three-plant chain. The witness deliberately explores the pond; a direct-inlet solution is also valid and is not treated as cheating.

```text
       A   B   C   D
1      3/3 2/1 0/0 0/0
2      0/0 1/1 0/1 0/0
3      0/0 0/0 0/0 0/3
4      0/0 0/0 0/0 0/0
```

**Edges:** A1→B1; B1→B2; B2→C2. **Plants:** P1:B1 1/3; P2:B2 1/3; P3:C2 1/2; P4:D3 1/4.
**Forecast:** calm, calm, calm, calm, calm, calm.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | A1→A1 | 0 | 3 | 2 | 0 | 0 | 1 | 0/0/0/0 | A1=2 |
| 2 | A1→A1 | 2 | 3 | 2 | 2 | 0 | 1 | 1/1/0/0 | A1=2 |
| 3 | D3→D3 | 2 | 3 | 2 | 1 | 0 | 2 | 1/1/0/1 | A1=1, D3=1 |
| 4 | B1→B1 | 2 | 3 | 0 | 4 | 0 | 1 | 2/2/1/2 | — |
| 5 | D3→D3 | 0 | 3 | 1 | 1 | 0 | 1 | 2/2/1/3 | D3=1 |
| 6 | B1→B1 | 1 | 3 | 0 | 4 | 0 | 0 | 3/3/2/4 | — |

**Six-turn totals:** C=12, D=0, V=6, E=0; all 4 plants complete, total growth 12, score **140**.
**Verified alternate selections:** B1, B1, D3, B1, D3, A1. **Landings:** B1, B1, D3, B1, D3, A1; score 140.

1. **Hint 1:** A1's first shower stays in the pond. On the next turn a refill can spill two, not three.
2. **Hint 2:** Those two drops grow B1 and B2 but stop before C2. A direct B1 shower can reach all three plants.
3. **Hint 3:** After two opening A1 showers, use B1 twice and bank D3 with two spaced showers. Or skip the pond and use the direct inlet.

#### T07 — Two Opposite Gates

**Insight:** `forecast-fallback-versus-score`. Opposite-corner chains alternate access windows. The lower plants need more growth than their feeders, allowing direct lower-entry fallbacks at a drainage cost rather than a hard failure.

```text
       A   B   C   D
1      3/1 0/0 0/0 0/0
2      2/2 0/0 0/0 0/0
3      0/0 0/0 0/0 0/0
4      0/0 0/0 1/1 2/2
```

**Edges:** A1→A2; D4→C4. **Plants:** P1:A1 1/2; P2:A2 2/3; P3:D4 2/2; P4:C4 1/3.
**Forecast:** N, S, W, E, N, S.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | A1→A1 | 0 | 3 | 0 | 3 | 0 | 0 | 1/1/0/0 | — |
| 2 | D4→D4 | 0 | 3 | 0 | 3 | 0 | 0 | 1/1/1/1 | — |
| 3 | D4→C4 | 0 | 3 | 0 | 1 | 2 | 0 | 1/1/1/2 | — |
| 4 | D4→D4 | 0 | 3 | 0 | 3 | 0 | 0 | 1/1/2/3 | — |
| 5 | A1→A1 | 0 | 3 | 0 | 3 | 0 | 0 | 2/2/2/3 | — |
| 6 | A1→A2 | 0 | 3 | 0 | 2 | 1 | 0 | 2/3/2/3 | — |

**Six-turn totals:** C=15, D=3, V=0, E=0; all 4 plants complete, total growth 10, score **127**.
**Verified alternate selections:** A1, D4, A1, D4, A1, D4. **Landings:** A1, D4, A1, D4, A1, D4; score 130.

1. **Hint 1:** A1 is reachable in north or west wind; D4 is reachable in south or east wind.
2. **Hint 2:** Each feeder needs only two growth steps, but its lower partner needs three. A lower-only rain can fill that difference.
3. **Hint 3:** You can alternate corner inlets for no drainage, or replace one visit per chain with a reachable lower inlet. Preview the drainage difference.

#### T08 — The Pocket Monsoon

**Insight:** `bank-or-spill-final-synthesis`. Two unlike feeders share a middle and a tail under wind. The wide bowl can bank for itself or spill into the middle; only the narrow feeder reliably reaches the tail with a full shower.

```text
       A   B   C   D
1      0/0 0/0 0/0 0/0
2      3/1 2/1 3/3 0/0
3      0/0 1/1 0/0 0/0
4      0/0 0/0 0/0 0/0
```

**Edges:** A2→B2; C2→B2; B2→B3. **Plants:** P1:A2 1/3; P2:B2 1/4; P3:B3 1/3; P4:C2 1/4.
**Forecast:** E, N, S, W, E, N.

| Turn | Select→land | S | R | E | C | D | V | G | End water |
|---:|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| 1 | B2→C2 | 0 | 3 | 1 | 1 | 0 | 1 | 0/0/0/1 | C2=1 |
| 2 | A3→A2 | 1 | 3 | 0 | 4 | 0 | 0 | 1/1/1/2 | — |
| 3 | A1→A2 | 0 | 3 | 0 | 3 | 0 | 0 | 2/2/2/2 | — |
| 4 | D2→C2 | 0 | 3 | 1 | 1 | 0 | 1 | 2/2/2/3 | C2=1 |
| 5 | B2→C2 | 1 | 3 | 1 | 2 | 0 | 1 | 2/3/2/4 | C2=1 |
| 6 | A3→A2 | 1 | 3 | 0 | 4 | 0 | 0 | 3/4/3/4 | — |

**Six-turn totals:** C=15, D=0, V=3, E=0; all 4 plants complete, total growth 14, score **150**.
**Verified alternate selections:** A2, A3, C1, A2, B2, A3. **Landings:** B2, A2, C2, A2, C2, A2; score 149.

1. **Hint 1:** A2 sends two drops through B2 to B3. C2 first saves water for itself; an immediate repeat sends only one to B2.
2. **Hint 2:** B2 needs four steps, one more than A2 and B3. Its extra drink can come from another A2 shower, a C2 repeat spill, or direct rain.
3. **Hint 3:** One route banks C2 on turns one and five and uses A2 on the other four. Another repeats C2 on turns four and five to supply B2's extra drink.

## 26. Documentation verification record

**Checked on 15 September 2026.** This record describes specification/content arithmetic checks, not a completed application or observed-player test.

| Check performed | Confirmed result |
|---|---|
| Catalogue structure | 24 terrains; 8 Rain, 8 Wind, 8 Terrace; R01–R06 each have exactly 2 plants; later terrains have 2–4 |
| Structural validation | All 16 cells per terrain checked; integer bounds, plant demands/targets, capacity versus demand, zero initial state, legal adjacent downhill edges and 6 forecasts/inputs |
| Primary and alternate solutions | 48 successful six-turn replays: one primary and one alternate per terrain; alternatives are not merely identical wind-clamped landings |
| First calculation path | Descending-elevation simulation with memoized alternate-plan search; 2,022 distinct checked transitions satisfied the conservation identity |
| Independent calculation path | Separately written rain-path overflow calculation, followed by drinking and per-cell evaporation; all 288 turn snapshots matched water arrays, growth, consumption, drainage, evaporation and scores |
| Document/data agreement | The actual Markdown matrices, edges, plants, forecasts, selected/landing coordinates, all 144 primary ledger rows, growth vectors, nonzero final cell storage, hints and alternate inputs/scores were parsed and cross-checked |
| Source fixture | The A1→A2 teaching case yields consumption 2, evaporation 1, drainage 0 and growth +1 for both plants; R01 starts with this exact fixture |
| Inventory arithmetic | 85 required primary raster images; 27 short audio-effect files plus 2 loops, before codec/density alternatives |
| Requirement traceability | All 8 source functional requirements and all 7 source acceptance cases are mapped; 57 individually identified future implementation QA cases |
| Documentation review | Rule/forecast interpretation, Study/final-result immutability, monotonic assistance, disconnected-practice forks and system-mismatch recovery reviewed and clarified |

Primary-witness coverage: **14** terrains retain water between turns; **14** include drainage; **22** route overflow; **1** demonstrates positive consumption without sufficient water for growth; **16** water an already-completed plant; **7** exercise a wind push held at a boundary. These counts describe the supplied primary plans, not every possible action or a promise of balanced difficulty.

Catalogue text SHA-256: `3dc29d25d505dbe53f7f9953f932eaddd327ac05fc7e5df8d38af2251c930e3b`. The hashed bytes are UTF-8 with LF line endings, starting at the `## 25.` heading and ending immediately before the `## 26.` heading, including the separating blank lines. This is an authoring-evidence checksum, not the future per-terrain mechanical content hash.

**Not performed in this documentation task:** game implementation; production image/audio generation or asset download; browser/Telegram gameplay tests; live payment/refund tests; device profiling; 12-person comprehension/enjoyment testing; native EN/RU sign-off; reconciliation with the absent Platform SRS; deployment. All remain explicit implementation/release obligations rather than invented completed results.

The final handoff is this one Markdown document. Temporary arithmetic scripts and research notes used during preparation are not application source or required companion documents. An implementation agent can reconstruct the complete catalogue from §25 and validate it using §4, §13 and §20.
