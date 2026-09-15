# Orbit Kitchen
# Master Game Development Specification

**A small kitchen. One shared orbit. A beautifully considered service.**

| Document field | Value |
|---|---|
| Product | Orbit Kitchen / Орбитальная кухня |
| Product identifier | SG-G08 |
| Document | Master Game Development Specification, version 1.0 |
| Baseline date | 15 September 2026 |
| Language | English specification; English and Russian product |
| Primary destination | Telegram Mini App, with a browser development and guest-practice fallback |
| Source | `08_Orbit_Kitchen_SRS.md`, v1.0, 8 September 2026 |
| Intended implementer | An autonomous development agent with repository access and image-generation MCP access |
| Scope of this deliverable | Documentation only. No game, production asset pack, payment integration, or deployed application has been built as part of this specification. |
| Content verification | All 24 reference action traces were mechanically replayed during document preparation. Production-engine certification and observed-player validation remain implementation release gates. |

## How to use this document

This is the single production brief for the game: product definition, rules, authored content, interface, art, asset generation, sound, architecture, persistence, monetization, accessibility, verification, and delivery. An implementation must not substitute a visually attractive prototype for the complete product defined here.

**MUST** identifies a release requirement. **SHOULD** identifies the default engineering or creative approach; a deviation needs a documented reason and equivalent verification. **MAY** identifies explicitly optional work. A target is not evidence that the target has already been achieved.

The source SRS references `00_Stark_Games_Marketplace_SRS.md`. That document was not supplied. Shared authentication, XP, ranking, wallet, and marketplace interfaces are therefore **not established facts**. Section 17 defines integration boundaries and a standalone fallback, not imaginary existing marketplace APIs. When the shared specification becomes available, reconcile integration contracts without silently changing the game rules.

This document preserves the SRS's mandatory gameplay. It supplies concrete content, presentation, technical defaults, and resolutions where the SRS was silent. A later approved design document may replace colors, illustration treatments, or composition within the readability constraints here; it may not change turn costs, recipes, freshness, payment fairness, or accessibility by implication.

### Contents

1. [Product promise and creative direction](#1-product-promise-and-creative-direction)
2. [Scope, principles, and explicit exclusions](#2-scope-principles-and-explicit-exclusions)
3. [Player journey and progression](#3-player-journey-and-progression)
4. [Authoritative gameplay rules](#4-authoritative-gameplay-rules)
5. [Actions, previews, and interaction contracts](#5-actions-previews-and-interaction-contracts)
6. [Screens and responsive layouts](#6-screens-and-responsive-layouts)
7. [Art direction and design system](#7-art-direction-and-design-system)
8. [Complete visual asset specification](#8-complete-visual-asset-specification)
9. [Image-generation production workflow](#9-image-generation-production-workflow)
10. [Audio, music, and haptics](#10-audio-music-and-haptics)
11. [Accessibility and inclusive interaction](#11-accessibility-and-inclusive-interaction)
12. [English/Russian localization and writing](#12-englishrussian-localization-and-writing)
13. [Authored shift catalogue and reference solutions](#13-authored-shift-catalogue-and-reference-solutions)
14. [Content schema and certification](#14-content-schema-and-certification)
15. [Runtime architecture and state model](#15-runtime-architecture-and-state-model)
16. [Synchronization, undo, and recovery](#16-synchronization-undo-and-recovery)
17. [Telegram and shared-platform integration](#17-telegram-and-shared-platform-integration)
18. [Cosmetics, Stars, and optional wallet features](#18-cosmetics-stars-and-optional-wallet-features)
19. [Security, privacy, and abuse resistance](#19-security-privacy-and-abuse-resistance)
20. [Performance and delivery budgets](#20-performance-and-delivery-budgets)
21. [QA, acceptance tests, and research gates](#21-qa-acceptance-tests-and-research-gates)
22. [Analytics and operational observability](#22-analytics-and-operational-observability)
23. [Implementation sequence and deliverables](#23-implementation-sequence-and-deliverables)
24. [Definition of done and handoff contract](#24-definition-of-done-and-handoff-contract)
25. [Source traceability, decisions, and references](#25-source-traceability-decisions-and-references)

---

## 1. Product promise and creative direction

### 1.1 The game in one paragraph

Orbit Kitchen is a calm, turn-based scheduling puzzle inside a tiny orbital galley. Eight ingredient berths surround a cheerful enamel service robot. The stations stay still; one clockwise rotation moves **every ingredient together**. The player loads ingredients, gives each exactly the required number of cooking steps, and serves orders in the displayed sequence before the turn budget or an ingredient's freshness runs out. The satisfying moment is not fast tapping. It is realizing that one rotation can finish one preparation, position another at the stove, and clear the loading berth at the same time.

### 1.2 Emotional promise

The player should feel: **“I can see the whole situation. I have time to think. That was a neat little plan.”**

The kitchen is a place of quiet competence, not frantic employment. There are no angry customers, clocks counting down in real time, screaming failure sounds, streak threats, or purchases offered as emergency relief. A pause of ten seconds or ten days has exactly the same mechanical effect: none.

The target session is 3–5 minutes, including reading, planning, play, and a brief result. Shorter tutorial shifts are intentional. This duration is a research target, not a timer or a promise that every player finishes within five minutes.

### 1.3 The world

The galley belongs to **Orbital Service Module 08**, a small communal kitchen on a research station. Through a softly painted porthole, a distant planet occupies a quiet corner of the screen. Cargo labels, curved ceramic plates, and tidy station numbers suggest a practical place made affectionate through use.

The host is **Miro**, a compact enamel kitchen robot with a cobalt body, a cream face panel, two simple eyes, and one oversized oven mitt. Miro's personality comes from small, readable poses: attentive, considering, pleased, and reassuring. Miro is decorative. It never chooses moves, blocks labels, changes recipes, or becomes a tapping target required to progress.

The ingredients are ordinary-looking fictional galley produce. Their recipe rules belong to this game, not to real-world cooking. The art must not imply that a food-safety simulation or cultural cooking knowledge is necessary. No ingredient has a face; the player is preparing food, not harming tiny characters.

### 1.4 Signature moments

- **The first collective movement:** two visible ingredients advance together, making the global rotary rule immediately tangible.
- **A clean handoff:** a finished plate leaves station 5 while another ingredient is ready for its cooking step.
- **The last fresh moment:** a dish with freshness 1 can still be served now; an explicit preview makes the rule legible rather than surprising.
- **An intentional spare:** an unneeded ingredient can be parked instead of discarded. The objective is service, not an invented cleanliness score.
- **A small completion ritual:** three order tickets settle into a finished stack, a restrained ceramic chime sounds if enabled, and the score explains itself.

### 1.5 Creative boundaries

Do not turn “orbit” into constant camera movement, floating interface controls, gravity physics, or space combat. Do not turn “kitchen” into a real-time restaurant simulator. The motion is a legible mechanical diagram wrapped in warm illustrated materials.

**Creative shorthand:** observatory diagram × enamel lunch counter × calm pocket puzzle.

---

## 2. Scope, principles, and explicit exclusions

### 2.1 Mandatory release scope

- 24 authored shifts: six one-order Training shifts, six two-order Bridge shifts, twelve three-order Standard shifts.
- Eight fixed board positions, clockwise-only rotation, loading at position 0, cooking at position 2, service at position 5.
- Four ingredient identities, one fixed recipe per identity, cook targets of one or two.
- Exact integer freshness, action previews, full queue visibility, item inspection, burns, spoilage, and manual discards.
- Free replay, reset, undo, three hint tiers, full Study solutions, persistence, and recovery.
- English and Russian, mobile and desktop input, a complete list-based accessibility layout.
- Server-authoritative verification of authenticated results; clearly labeled provisional/offline/guest states.
- Per-shift/version ranking partitions where the ranking capability is available; no combined leaderboard across unlike shifts.
- Free default crockery and the decorative Station Crockery Set, with a real Stars purchase lifecycle for the Telegram production build.
- A secondary one-time support contribution, subject to the same fulfillment and support discipline.
- Complete final graphics and audio, asset provenance, test coverage, deployment instructions, and operational visibility.

### 2.2 Optional, isolated capabilities

- A same-shift asynchronous challenge link. This is a small invitation to attempt the same content, not a multiplayer simulation.
- TON wallet verification in Profile, only if a supplied platform contract actually requires it.
- An optional music bed and galley ambience; the mandatory build includes the settings and original audio assets, but both begin disabled.

These capabilities must not block ordinary play. An absent optional service is hidden or clearly unavailable, never represented by fabricated data.

### 2.3 Explicitly excluded

Real-time customers; time-pressure mode; automatic rotation; counterclockwise rotation; ingredient dragging as the only control; two-ingredient recipes; inventory mixing; production timers; idle earnings; energy; lives; random loot; paid solutions; paid hints; paid turns; paid freshness; stronger ingredients; consumable boosters; ads interrupting a shift; public chat; voice co-op; player trading; NFT food; on-chain cooking; token rewards; blockchain payment for in-app digital goods; leaderboards based on elapsed real time.

Do not add an excluded feature as “polish.” A future two-ingredient system requires a new rules version, dedicated interaction design, and an independent solvability review.

### 2.4 Product invariants

1. Information is exposed before commitment.
2. Invalid attempts never spend turns, freshness, or score.
3. Every accepted gameplay action costs exactly one turn.
4. Time outside accepted actions changes nothing on the board.
5. Money changes appearance only.
6. A player can always inspect, leave, retry, or study for free.
7. Correctness is independent of animation, language, device speed, and connectivity.
8. A beautiful asset may not make a rule harder to read.

---

## 3. Player journey and progression

### 3.1 First launch

1. Initialize the shell, restore any existing run, and select the saved language or Telegram language fallback.
2. A new player sees a compact welcome: **“Everything moves together. Take your time.”** Primary action: **Start the first shift**. Secondary action: **Browse all shifts**.
3. Start T01. Show the two occupied slots, all station numbers, the single order, and the Rotate control. Do not front-load an encyclopedia of freshness rules.
4. The initial non-blocking prompt says: **“Rotate once. Watch both ingredients.”** Preview ghosts illustrate both destinations.
5. After the rotation, expose the legal Serve action with **“The ready carrot has reached station 5.”**
6. After service, explain that the numbers on ingredients count remaining action-based freshness, not seconds. Offer **Continue to loading** and **All shifts**.
7. Continue through T02–T06 if desired. No forced lesson lock, account-wall detour, or purchase screen interrupts the sequence.

Tutorial prompts are instructional overlays, not changes to the rule engine. Required values remain visible even before their detailed explanation. Built-in onboarding copy does not itself mark a run Assisted; opening a player-requested hint or using undo does.

### 3.2 Returning player

The hub prioritizes **Continue shift** if a recoverable run exists, followed by the next recommended uncompleted shift and **All shifts**. Show synchronization state beside Continue, not hidden in Settings. A content update must not replace a saved shift silently.

### 3.3 Shift selection

All 24 shifts are free and selectable from the start. The catalogue is organized as:

- **Learning the orbit:** T01–T06.
- **Coordinating two plates:** B01–B06.
- **The service notebook:** S01–S12.

The sequence is recommended, not an energy gate or unlock tree. Each card shows title, mode, order count, turn budget, personal completion, best eligible score, and assistance label. Standard score numbers are comparable only within the same shift revision and assistance partition.

Do not invent three-star thresholds from the supplied witness traces. Those traces prove feasibility; they do not prove optimality.

### 3.4 Mastery

Award account-level milestone badges for completing **1, 5, and 15 distinct shifts**. A shift counts once, independent of replay count, content updates, or assistance. Training, Bridge, Assisted, and Study successes count because these are participation milestones, not claims of unaided competitive mastery. Explain this in the badge information sheet.

| Threshold | English badge | Russian badge | Visual |
|---|---|---|---|
| 1 distinct shift | First Orbit | Первый виток | One cream plate and one cobalt arc |
| 5 distinct shifts | Galley Regular | Свой на кухне | Two nested plates with five small ticks |
| 15 distinct shifts | Quiet Conductor | Мастер спокойной смены | Three coordinated arcs and a small serving star |

Badges are free. They do not affect the board or substitute for the paid crockery entitlement. Guest milestone progress is local until an authenticated, verified import succeeds.

### 3.5 Completion and replay

Success automatically ends gameplay as soon as the final order is served. Remaining ingredients and queue entries stay visible in the frozen board snapshot; they do not require cleanup.

Results provide **Next shift**, **Replay free**, **Review board**, and **Exit to shifts**. Incomplete results provide **Retry free**, **Undo last action**, **Opening hints**, **Study solution**, and **Exit to shifts**. A post-terminal undo creates a practice fork that is at least Assisted and remains Study if its parent was Study; section 16 defines this precisely.

No result uses “Buy to continue,” “Save this dish,” or a shop placement that suggests the failed attempt can be repaired with money.

---

## 4. Authoritative gameplay rules

### 4.1 Board coordinates

Positions are immutable integers 0–7, arranged clockwise. Position 0 is at the top of the ring; position 2 is at the right; position 4 is at the bottom; position 6 is at the left. Position 5 is the lower-left diagonal.

- **Station 0 — Load:** creates the next queued ingredient in an empty position 0.
- **Station 2 — Cook:** adds exactly one cooking step to its eligible occupant.
- **Station 5 — Serve:** removes the correctly prepared next order.

Stations and position labels do not rotate. Ingredients and their identities do. Every occupied position `i` maps to `(i + 1) mod 8` in a rotation. An empty position also moves as part of this permutation; the operation does not slide only selected items or stop at occupied destinations.

### 4.2 Ingredient and recipe catalogue

Each identity has one immutable target in rules version `g08-rules-1`. Recipes are matched by identifiers, not localized text or artwork.

| Code in this document | Ingredient ID | Recipe ID | English display name | Russian display name | Short EN / RU board label | Target | Distinctive silhouette |
|---|---|---|---|---|---|---:|---|
| C | `comet_carrot` | `comet_carrot_1` | Comet Carrot | Морковь-комета | Carrot / Морковь | 1 | Long tapered body and a forked leaf crown |
| T | `sun_tomato` | `sun_tomato_1` | Sun Tomato | Солнечный томат | Tomato / Томат | 1 | Broad lobed sphere and a star-shaped calyx |
| M | `mooncap` | `mooncap_2` | Mooncap Mushroom | Лунный гриб | Mooncap / Гриб | 2 | Wide semicircular cap and a short thick stem |
| P | `star_pod` | `star_pod_2` | Star Pod | Звёздный стручок | Pod / Стручок | 2 | Crescent pod with three clearly separated lobes |

Recipe names for completed orders are **Comet Carrot Plate**, **Sun Tomato Plate**, **Mooncap Plate**, and **Star Pod Plate**, localized as **Тарелка моркови-кометы**, **Тарелка солнечного томата**, **Тарелка лунных грибов**, and **Тарелка звёздных стручков**. Names are fictional descriptors, not extra ingredient requirements.

### 4.3 State of an item

An item has `itemId`, `ingredientId`, `cookCount`, and `freshness`. Its occupied slot comes from the ring array. Do not persist a second independent slot coordinate that can disagree with the array.

- Raw: `cookCount = 0`, freshness above zero.
- Part-cooked: `0 < cookCount < target`, freshness above zero.
- Ready: `cookCount = target`, freshness above zero.
- Burnt: `cookCount > target`.
- Spoiled: `freshness = 0`.

Burnt and spoiled are independent derived flags. A burnt item with positive freshness continues aging and can later be both. It remains one item, occupies one slot, and produces at most one discard when removed. The renderer must retain both reasons in inspection text.

There is no passive cooking, cooling, recovery, freshness refill, automatic disposal, or transformation into a different ingredient. Cooking does not reset freshness. Ready dishes age exactly like raw ingredients.

### 4.4 Initial and loaded freshness

Every newly loaded ingredient starts at **16**. It does not age on its loading turn. Every preloaded item is already on the ring before the first action and therefore ages after that action if it remains.

Authored starting positions may include reduced freshness, part-cooked, ready, burnt, or spoiled items. Those values are part of the immutable shift definition and are displayed before the first action. They are never random difficulty modifiers. All initial statuses must be validated immediately on loading the content.

Freshness is clamped to the inclusive range 0–16. There are no fractional units or negative values.

### 4.5 Gameplay actions

The only turn-consuming actions are `rotate`, `load`, `cook`, `serve`, and `discard`. Selection, inspection, scrolling, opening a drawer, language changes, audio settings, leaving the screen, and network retries consume no turn.

| Action | Legal when | Immediate effect |
|---|---|---|
| Rotate | Run is active and a turn remains | Atomically move every ring occupant one position clockwise |
| Load | Active run; queue has a next entry; position 0 empty | Create the next raw item at position 0 with freshness 16; advance queue index |
| Cook | Active run; position 2 contains a non-burnt, non-spoiled item | Increase its cook count by exactly one |
| Serve | Active run; position 5 has the active order's ingredient, exact target count, and positive freshness | Remove item; advance order index |
| Discard | Active run; selected item still occupies the specified slot | Remove that item and increment discard count by one |

Cooking an already-ready item is **legal but destructive**: it produces a burnt item. It must be exposed as an explicit dangerous action, not silently performed or incorrectly rejected by the engine. The interface adds the confirmation described in section 5. Cooking an already-burnt or spoiled item is illegal.

Rotation is legal even on an empty or completely full ring. An empty rotation still spends a turn. A full ring rotates without collisions or overwrites.

### 4.6 Exact resolution order

For each proposed gameplay action:

1. Validate authentication, run ownership, envelope shape, and action-ID format.
2. Resolve idempotent duplicates before checking the current revision or attempting a new mutation; reject reuse with different semantic content.
3. For a new action, validate its pinned content/rules versions, expected state revision, and legality against the canonical pre-action state. An invalid action returns an explanation with no gameplay mutation.
4. Capture the IDs of all items present before the action, and save the reversible pre-action gameplay snapshot.
5. Apply the action atomically. A Serve removes its dish **before aging**. A Cook increments its count before deriving burn state.
6. Increase `turnUsed` by one.
7. Age each pre-action item that still exists on the ring by one, clamped at zero. Do not age an item newly created by this action.
8. Derive burnt/spoiled/ready flags, including on items unrelated to the active order.
9. If every order has been served, set status to `success`.
10. Otherwise, if `turnUsed = turnBudget`, set status to `incomplete`; otherwise remain `active`.
11. Advance the state revision, persist the accepted event and state transactionally, and publish the authoritative result.

Even the successful final turn performs its specified aging on leftover items before the final snapshot is stored. Newly spoiled leftovers do not invalidate success.

### 4.7 Important boundary cases

- A ready matching item at station 5 with freshness 1 can be served now.
- A ready item with freshness 1 at position 4 cannot survive a rotation to station 5: it arrives, ages to zero, and is not servable next turn.
- The SRS's specific example, position 4 at freshness 2, rotates to position 5 at freshness 1 and is then safely served.
- A Serve of the last order on turn 24 wins; success takes precedence over turn exhaustion.
- A wrong ingredient, undercooked dish, burnt dish, spoiled dish, empty station, blocked load, or empty discard is rejected without aging anything.
- Orders activate sequentially. A ready later order cannot be served early. Identical consecutive orders still require two separate served items.
- Queue order is immutable. Loading is the only way to advance the queue. There is no skip, shuffle, or queue discard command.
- Discard can target any occupied ring slot, including a fresh or ready item. It cannot target an unconsumed queue entry.
- Spoilage alone adds no discard and applies no score penalty. Burn damage alone adds no discard. Neither frees a slot.
- Leftovers and unconsumed queue entries are allowed at success. Parking a decoy is a legitimate strategy.
- A shift is not automatically ended just because a planner could prove the current state unsolvable. The player may inspect, undo, or experiment until turn exhaustion, restart, or exit.

### 4.8 Scoring

A successful run has:

`turnsRemaining = turnBudget - turnUsed`

`score = max(0, 100 + 5 × turnsRemaining - 10 × discardCount)`

There is no speed bonus, freshness bonus, penalty for invalid input, leftover penalty, or bonus for cosmetics. Example: three orders, two turns remaining, one discard: `100 + 10 - 10 = 100`.

An incomplete run has no ranked score. Show its served count, turns, and discards; do not fabricate a successful-score result of zero. Successful Training and Bridge runs may show the same arithmetic as a personal learning result, but never appear in Standard rankings.

### 4.9 Classification axes

Keep these independent:

- **Content mode:** Training / Bridge / Standard.
- **Assistance:** Unassisted / Assisted / Study.
- **Verification:** Verified / Pending verification / Local only.
- **Outcome:** Active / Success / Incomplete / Abandoned.

A valid undo or tier 1/2 hint changes an active Unassisted attempt to Assisted. Displaying a full solution changes an active attempt to Study. Assistance is monotonic within an attempt: undo cannot erase it. After terminal results, disclosures instead set the separate continuation assistance floor defined in section 16.7; they never rewrite a historical result. Ordinary item inspection and previews do not count as assistance.

Standard ranking keys include shift ID, content revision, rules version, and assistance partition. Unassisted and Assisted are separate visible tabs. Study scores are personal study records and are not ranked. Guest and pending results are never shown as verified rankings.

---

## 5. Actions, previews, and interaction contracts

### 5.1 Main controls

The bottom action area contains one prominent **Rotate kitchen** button and three separate station panels: **0 · Load**, **2 · Cook**, **5 · Serve**. Each panel shows its current legal action, or explanatory text when no action is legal. Do not make a fake enabled button merely to display a reason.

Examples: **Loading position occupied**, **No ingredients left**, **Nothing at the stove**, **This is not the next order**, **Needs one more cooking step**, **Burnt — discard only**.

An invalid keyboard shortcut or stale command still receives an accessible explanation. The server must enforce legality even if the interface normally exposes only valid actions.

### 5.2 Preview is part of the mechanic

The interface must always make the next rotation preview available without spending a turn. Show subtle destination outlines and a **Preview rotation** text toggle; pointer hover may enhance this but cannot be the sole access path. A preview is a derived projection of the same transition rules, not separate approximate math.

For every legal action, preview:

- Turn cost: exactly one.
- The selected or station item's projected cook state and freshness.
- All items that will newly become spoiled at the end of this action.
- Any new burn caused by cooking again.
- On rotation, each item's destination slot and any station arrival.
- Whether a Serve completes the shift on the last allowed turn.

Use **“After this action: Pod at slot 3 becomes spoiled.”** Do not say “your order will fail” if the endangered item is an irrelevant spare.

Freshness presentation: 5–16 neutral; 2–4 caution label **Low freshness**; 1 explicit **Last fresh action**; 0 **Spoiled**. Numerals are always visible. Caution colors are redundant with text and shape.

### 5.3 Dangerous actions

- Discard opens a compact confirmation with ingredient, slot, current status, **1 turn**, and **−10 from a successful score**. Buttons: **Keep item** and **Discard item**.
- Cooking a ready item opens **“This dish is ready. Cooking again will burn it.”** Buttons: **Keep ready dish** and **Cook again**.
- A rotation or otherwise ordinary action that causes spoilage receives a clear pre-commit warning, but not a mandatory modal on every move. Do not make mobile play a sequence of warning dialogs.
- Confirmations capture item ID and state revision. If the board changes before confirmation, invalidate the stale confirmation and refresh it; never discard a replacement occupant by accident.

### 5.4 Item inspection

Tap/click a slot or select it with the keyboard. An inspector shows ingredient name and silhouette, position number, recipe target, cook progress as both `1 / 2` and text, exact freshness, status reasons, and the relevant destination.

Distinguish **“Can cook now at station 2”**, **“Ready; service is station 5”**, and **“Ready, but order 2 must wait for order 1.”** A location route is not a promise of a feasible overall solution. Burnt/spoiled inspectors say why cooking/service is unavailable and expose Discard.

The selected item is identified by item ID so it can be followed across rotation. If it is removed, close or empty its inspector gracefully. No stat panel may silently switch to a different ingredient because it inherited the selected slot.

### 5.5 Touch and keyboard

Touch controls use explicit taps; no swipe or drag is required. Do not intercept ordinary page scrolling to rotate the kitchen.

Keyboard mappings, shown in Help:

| Input | Effect |
|---|---|
| Tab / Shift+Tab | Navigate actionable controls and the ring/list region |
| Arrow keys within ring | Move through slots clockwise/counterclockwise for inspection; never rotate the game |
| Enter / Space | Activate the focused control |
| R | Rotate, if shortcuts are enabled and focus is not in a text field or modal |
| L / C / S | Attempt Load / Cook / Serve under the same shortcut conditions |
| U | Request undo |
| Escape | Close the topmost dismissible overlay; otherwise do not spend an action |

Do not assign Delete/Backspace to immediate discard. Avoid accidental key-repeat turns: ignore `KeyboardEvent.repeat` for gameplay shortcuts. Supply a setting to disable single-character shortcuts.

### 5.6 Input and animation

A logical action commits independently of visual animation. A brief input latch prevents duplicate activation from the same gesture; it is not a real-time mechanic. There is no queued hidden burst of rotations. A new deliberate action is accepted after the local transition is ready; if the previous animation is still finishing, complete it coherently before presenting the new state.

Every deliberate activation receives a unique action ID. Retransmission of that activation reuses the ID. Two deliberately separate rotations are two actions, not deduplicated because they look alike.

### 5.7 Hints

Each shift has three tiers:

1. A conceptual observation from section 13: Assisted.
2. An opening-plan suggestion from section 13: Assisted.
3. The complete certified starting-board trace: Study.

The heading is always **Opening plan — assumes the original board**. Hints are intentionally static, including mid-run and after undo. They must not claim to be an adaptive solution to the current state. Opening them does not reset anything.

A separate **Restart with this study plan** action asks for confirmation and creates a fresh Study attempt with step-by-step guidance. The player may also keep playing the current board. No runtime search service is required for this baseline hint system.

Guided Study tracks the expanded witness's gameplay-action prefix, not elapsed time or total command count. Advance the guide only after the expected legal action; invalid input and metadata operations do not advance it. Undo to a matching prefix restores the corresponding step. If the player takes a different legal action, visibly pause guidance with **Your board differs from the opening plan** and offer a free guided restart or continued unguided Study. Resume only after returning to an exact matching prefix; do not present a stale next instruction as adaptive advice. Reconcile the guide against acknowledged/predicted state after network corrections.

Hints opened from Results are explicitly a review of the original board. They do not reset the frozen board or relabel the completed score; disclosure is recorded separately and inherited by practice continuations as specified in section 16.7.

---

## 6. Screens and responsive layouts

### 6.1 Screen inventory

| Screen | Required content | Required states |
|---|---|---|
| Boot / restoration | Mark, concise loading status, retry if needed | Loading, offline cache available, cache unavailable, version mismatch, authentication error |
| Welcome / hub | Continue, recommended shift, catalogue, mastery, settings, secondary cosmetics entry | New user, returning user, pending sync, no saved run |
| Shift catalogue | Three groups, title, mode, budget, orders, completion, personal best | Empty local history, loading verified history, service unavailable |
| Gameplay | Orders, queue, turns, board/list, station controls, preview, assistance and sync labels | Every legal/illegal action state, active tutorial, risky action, pending sync |
| Queue drawer | All queue entries in exact order; consumed state and next marker | Empty queue, remaining entries, large text |
| Inspector | Full item state and safe contextual controls | Empty slot, raw, part-cooked, ready, wrong order, burnt, spoiled, both |
| Hints / study | Three tiers, assistance warning, opening-state label, trace | Opening board, mid-run, guided restart, exhausted budget |
| Results | Outcome, order checklist, arithmetic or incomplete statistics, free actions | Verified, pending, local, Assisted, Study, milestone earned |
| Rankings | Shift/revision identity, Unassisted/Assisted tabs, personal row | Loading, no entries, offline, retired version, service error |
| Crockery store | Exact cosmetic preview, price, no-power statement, restore/reconcile status | Not owned, invoice open, pending, verified owned, failed, refunded |
| Settings / Profile | Language, sound, music, ambience, motion, board/list, contrast, shortcuts, help, privacy, support | Telegram and guest; optional wallet capability absent/present |
| Help / credits | Rules, recipes, controls, licenses, version, support | EN/RU and large text |

### 6.2 Portrait composition at 390 × 844 CSS pixels

This is the primary design composition, not a hard-coded device viewport. Telegram chrome and safe areas reduce the usable rectangle.

```text
┌────────────────────────────────────┐
│ Back       Orbit Kitchen   Settings│
│ Standard · S04       Synced        │
│ [1 ACTIVE]  [2 NEXT]  [3 LATER]     │
│ Queue: ...             View all   │
│ 24 turns left       Unassisted    │
│                                    │
│               0 LOAD               │
│          7             1           │
│                                    │
│       6       MIRO       2 COOK     │
│                                    │
│        5 SERVE          3          │
│                  4                 │
│                                    │
│ Preview: all ingredients move →    │
│ [        Rotate kitchen        ]   │
│ [0 Load]    [2 Cook]    [5 Serve]   │
│ Undo           Hints      Board/list│
└────────────────────────────────────┘
```

The diagram indicates hierarchy, not exact character-based geometry. The actual ring is circular, clockwise, and centered. Order cards must remain recognizably ordered even when recipe names wrap.

### 6.3 Board geometry

At normal text size, use a board diameter up to 344 CSS pixels, constrained to the available width after 16-pixel side margins. The center-to-slot radius is approximately `0.385 × boardDiameter`; slot angle is `−90° + 45° × index`.

Use 48-pixel minimum primary slot targets where possible, never less than the project's 44-pixel touch target baseline. Ingredient art is approximately 44–56 pixels; the stable number, compact name, cook count, and freshness labels sit in a tested label envelope. Ingredient sprites remain upright during movement. Station labels remain fixed and must not be occluded by Miro, queue cards, or effects.

The ring path and station connectors are simple CSS geometry, not an SVG artwork dependency. Render positions from a shared layout function. Layout geometry never determines logical item location.

### 6.4 Responsive rules

- At 320 CSS pixels wide, preserve readable numbers and target sizes. Use shorter translated board labels or switch to the list layout; do not scale the entire interface down.
- At short heights, allow vertical scrolling. Essential controls may be sticky only if sufficient bottom padding prevents content from being hidden beneath them.
- At 200% text enlargement or when the ring label envelope no longer fits, use the slot list. The user can choose list layout manually at any text size.
- On tablet/desktop, cap the main play region; use an optional side column for the queue, item inspector, and instructions. Do not stretch the ring across the screen.
- In landscape, prefer two columns or the list rather than requiring a device rotation.
- No essential information may be available only in a clipped carousel, hover tooltip, or horizontally scrolling row with no visible affordance.
- Modal sheets have an accessible title, internal scrolling, visible close control, safe-area padding, focus containment, and focus restoration.

### 6.5 Order and queue presentation

All orders are visible from the start: one in Training, two in Bridge, three in Standard. Display explicit sequence numbers; only the first unserved order is active. A served order stays visible with a checkmark and accessible “served” text.

Show the next ingredient and queue count in the compact strip. **View all ingredients** opens the entire immutable sequence, including consumed entries, without spending a turn. No mystery bags, concealed later orders, or ambiguous question-mark placeholders.

For S08's empty queue, write **No queued ingredients — use the starting board**. For a depleted queue, write **All queued ingredients loaded**. These are different explanations.

### 6.6 Results composition

Success headline: **Service complete.** Incomplete headline: **The shift is unfinished.** Supporting copy: **“Your plan is safe to revisit. Retry or study for free.”**

Successful arithmetic displays:

- Base service: 100.
- Turns remaining: `{n} × 5`.
- Discards: `{d} × −10`.
- Total: computed score, clamped at zero.
- Assistance, mode, revision, and verification status.

Show freshness only as a review detail, not a hidden bonus. Result animation is skippable by the first interaction and never delays free retry.

---

## 7. Art direction and design system

### 7.1 Visual language

The board should feel like a precise orbital diagram printed onto a cream ceramic worktop. Cobalt station plates anchor the composition. Ingredients use warm ivory body highlights, distinctive silhouettes, and controlled produce-color accents. Materials are matte enamel, glazed ceramic, frosted glass, paper order tickets, and soft painted space outside the galley.

Use a restrained three-quarter illustration treatment for characters and food, but preserve a top-down readable footprint. Food is not photorealistic. Do not use greasy shine, heavy bloom, distressed grunge, dense stars behind numerals, or realistic food spoilage imagery.

### 7.2 Color tokens

These are initial production values. Validate the actual pairings in rendered states, including disabled explanations, premium trim, and dark mode.

| Token | Light theme | Dark theme | Use |
|---|---|---|---|
| `background` | `#F6F1E6` | `#121B30` | Main canvas |
| `surface` | `#FFFCF5` | `#1B2943` | Cards and sheets |
| `text.primary` | `#18233B` | `#FFF4DD` | Main copy |
| `text.secondary` | `#535F73` | `#BFCAE0` | Supporting copy |
| `action.primary` | `#244CDB` | `#AFC4FF` | Primary button fill |
| `action.onPrimary` | `#FFFCF5` | `#121B30` | Primary button label |
| `border.strong` | `#8590A3` | `#8D9AB4` | Meaningful boundaries and focus-adjacent details |
| `warning.surface` | `#FFF0CC` | `#3C2E13` | Freshness warning |
| `warning.text` | `#754300` | `#FFE1A3` | Warning text |
| `danger.surface` | `#FFE3E7` | `#3C1E2A` | Destructive confirmation |
| `danger.text` | `#8F263D` | `#FFB9C7` | Burn/spoil/destructive text |
| `success.surface` | `#DEF2E8` | `#17382F` | Served/complete state |
| `success.text` | `#17634B` | `#AEE9CE` | Success copy |

Freshness numerals sit on an opaque readable chip, never directly on variable food art. Station numbers use a similarly controlled surface. Ingredient accent colors do not encode identity without shape and name.

### 7.3 Type and spacing

Use **Manrope**, self-hosted with Latin and Cyrillic coverage, under its SIL Open Font License 1.1. Retain the downloaded license and exact file hash. Use a system sans-serif fallback and ensure loading the custom font does not shift the board into overlap.

- Display/title: 28–32 px, weight 700–800.
- Screen heading: 22–24 px, weight 700.
- Body and main buttons: 16 px, line height 1.4–1.5.
- Board labels and numeric chips: normally 14 px, weight 650–750.
- Nonessential metadata: no smaller than 12 px.
- Tabular numerals for freshness, turns, and score.
- Spacing scale: 4, 8, 12, 16, 24, 32 px.
- Main cards: 16–20 px radius; buttons: 14–16 px; chips: 8–10 px.
- Shadows are low-contrast and shallow; boundaries must not rely only on shadows.

### 7.4 Motion language

| Event | Standard presentation | Reduced motion |
|---|---|---|
| Rotate | 220–280 ms clockwise translation along the ring, upright sprites | Immediate relocation plus a brief static “Moved to slot…” marker |
| Load | 160–200 ms small settle, maximum 4 px translation | Immediate appearance with “Loaded” label |
| Cook | 180–240 ms glow/steam accent; no camera shake | Change sprite/count and show cooking result text |
| Serve | 200–260 ms plate-to-order acknowledgement | Immediate removal and served checkmark |
| Discard | 120–160 ms fade; no comedy explosion | Immediate removal |
| Freshness change | Numeric update with a subtle 100–150 ms emphasis | Immediate number update |
| Success | At most 700 ms combined ticket/chime flourish | Static completion illustration |

No idle animation is required for information. Decorative Miro idle movement, if implemented, is very small, infrequent, and disabled under reduced motion. Do not animate an always-moving galaxy or keep a render loop alive merely for ambience.

### 7.5 Cosmetic integrity

The paid set uses fine **Constellation Porcelain** patterns: cobalt dots, cream arcs, and a small brass-colored accent on station trim. It may replace the decorative station surround, plate pattern, and result frame. It must not alter slot geometry, hit areas, ingredient shapes, cook indicators, freshness chips, labels, previews, or contrast-critical surfaces.

### 7.6 Design handoff brief for a separate design AI

> Design Orbit Kitchen, a premium-feeling but friendly Telegram pocket puzzle, not a frantic restaurant game. The invariant board has eight clockwise positions, Load at 0/top, Cook at 2/right, Serve at 5/lower-left. Show all three orders, the ingredient queue entry point, remaining turns, exact freshness and cook counts, and large controls below the ring. Use warm ceramic cream, cobalt enamel, legible orbital-diagram geometry, restrained illustrated produce, and a small decorative enamel robot. Generate raster illustration assets, not SVG. Keep text as editable interface text. Deliver mobile normal, dark, warning, large-text/list, tutorial, result, catalogue, and cosmetic-preview designs. Include Russian layouts. The premium set is cosmetic only. Do not change game rules, hide the queue, move stations, add clocks, or put tiny action buttons around the ring.

The implementation agent should be able to build from this section without another design deliverable. If a separate approved design arrives later, reconcile it against sections 4–6 and 11 before using it.

---

## 8. Complete visual asset specification

### 8.1 File policy

**No SVG assets are required or permitted as a shortcut for the requested illustrated art.** Use MCP-generated raster artwork, processed raster exports, CSS for simple layout primitives, and live HTML text. Do not install an SVG icon package and silently substitute it for the specified asset pipeline.

Keep high-resolution masters separate from runtime exports. Use transparent PNG masters for isolated objects; runtime WebP with alpha and PNG fallback where needed. Backgrounds can use WebP without alpha. Do not bake names, station numbers, prices, warnings, or translated copy into images.

A “source unit” below is one authored image or atlas. Density exports and compressed derivatives do not count as additional creative assets. Baseline: **60 visual source units**, plus derived thumbnails and density variants.

### 8.2 Master manifest

| Family / stable IDs | Count | Master size | Runtime use and acceptance |
|---|---:|---|---|
| `brand/orbit-mark` | 1 | 1024×1024 RGBA | Original plate-and-orbit mark; text wordmark remains HTML; legible at 32 px |
| `environment/galley-portrait`, `galley-wide` | 2 | 1024×1536; 1920×1080 RGB | Quiet edge/porthole atmosphere; center has low detail; never necessary to read rules |
| `miro/idle`, `thinking`, `pleased`, `reassuring` | 4 | 768×768 RGBA | Consistent robot, same palette/scale/light; no text; readable face at small size |
| `stations/load-base`, `cook-base`, `serve-base` | 3 | 512×512 RGBA | Tray, heat plate, serving plate; fixed readable footprint, decorative underlays only |
| `food/{ingredient}/{state}` | 18 | 512×512 RGBA | Exact state matrix below; identical identity silhouette and framing across states |
| `ui/{icon}` | 18 | 256×256 RGBA | Exact icon list below; bold enough at 20–24 px, supplemented by accessible text |
| `fx/steam`, `fx/service-spark` | 2 | 768×128 RGBA, six 128×128 frames | Small one-shot effects; no baked gameplay information |
| `results/complete`, `incomplete`, `study` | 3 | 1024×640 RGBA | Quiet postcard-scale still illustrations; not full-screen blocking celebration |
| `premium/load-trim`, `cook-trim`, `serve-trim`, `pattern-tile`, `result-frame`, `store-preview` | 6 | Trims 512²; tile 256²; frame/preview 1024×640 | Constellation Porcelain; exact free-board geometry; pattern is seamless |
| `mastery/first-orbit`, `galley-regular`, `quiet-conductor` | 3 | 512×512 RGBA | Distinct milestone marks, legible at 48 px; no baked numbers or words |

### 8.3 Ingredient state matrix

| Ingredient | Raw | Part-cooked | Ready | Burnt | Spoiled | Total |
|---|---|---|---|---|---|---:|
| Comet Carrot | Yes | No | Yes | Yes | Yes | 4 |
| Sun Tomato | Yes | No | Yes | Yes | Yes | 4 |
| Mooncap | Yes | `cookCount=1` | Yes | Yes | Yes | 5 |
| Star Pod | Yes | `cookCount=1` | Yes | Yes | Yes | 5 |

Raw: pale, clear shape and ingredient accent. Part-cooked: a modest warm edge and shallow score marks, not a new object. Ready: a tidy glaze highlight and consistent plating accent. Burnt: charcoal edge marks that preserve the original shape. Spoiled: desaturated cool patches and a plain “Spoiled” badge in HTML; no photorealistic mold, insects, or gross-out imagery.

For an item both burnt and spoiled, use the burnt sprite with the spoiled status treatment and both textual reasons. Do not create an undocumented sixth mechanical state or allow artwork choice to suppress a reason.

Order-card thumbnails are derived from the ready sprites and default plate assets. They are not a second inconsistent food catalogue. Premium plates may surround the same thumbnail but may not alter its ingredient identity.

### 8.4 Exact icon list

`rotate`, `load`, `cook`, `serve`, `discard`, `undo`, `hint`, `info`, `close`, `back`, `settings`, `sound-on`, `sound-off`, `check`, `offline`, `warning`, `burnt`, `spoiled`.

Use text for Share, wallet, music, ambience, and other secondary actions rather than expanding the icon set without need. The rotation icon must visibly imply clockwise movement. Burnt and spoiled icons must have different shapes, not merely red versus gray versions of one mark.

### 8.5 Export requirements

- Food runtime exports: typically 112×112 and 224×224; display no larger than 56 CSS pixels on the ring without an appropriate derivative.
- Miro: 160×160 and 320×320 runtime variants; keep the center decoration smaller than the ring's information footprint.
- Icons: 24/48 px exports and 32/64 px where actually used.
- Preserve 8–12% transparent padding for food without excessive empty canvas. Record optical center and content bounds in the asset manifest.
- Light from upper left; soft shadows should be separate CSS or consistently baked only once. Never stack two contradictory shadows.
- Premultiplied-alpha edges must not produce black or white fringes on either theme.
- UI/ring images must be crisp at device-pixel ratios 1 and 2. Do not ship 1024-pixel masters into a 24-pixel button.
- Backgrounds are cropped with an intentional focal region, not stretched. The porthole must not land behind the active order text on narrow screens.
- All references use manifest IDs, not ad hoc filenames embedded across components.

### 8.6 Provenance record per asset

Store asset ID, source/master filename, exported filenames, dimensions, alpha mode, purpose, source type, model/provider if generated, generation date, prompt/edit history reference, seed if provided, source URL if downloaded, license/terms record, modifications, approval status, and SHA-256 hashes.

Do not invent an image-generation seed when the MCP provider does not expose one. A seed is not a guarantee of exact regeneration across model revisions. Preserve approved masters.

---

## 9. Image-generation production workflow

### 9.1 Production order

1. Generate one style board containing material samples, one ingredient, one station plate, and Miro. This is an internal exploration asset, not one of the 60 shipping source units.
2. Generate a 390×844 gameplay concept and a warning/list-layout concept as visual references. Interface text in concepts is provisional and must be rebuilt as real text.
3. Select a coherent direction against the rubric below; record the selection. Do not continually regenerate unrelated styles for each asset.
4. Approve four raw ingredient masters. Use image editing/reference conditioning to derive their states and maintain silhouettes.
5. Produce station and Miro sets from the approved references.
6. Produce remaining manifest assets, then density exports and an asset contact sheet.
7. Verify the real interface with runtime assets at actual size in both languages and themes.

The agent has image-generation MCP access according to the commissioning brief, but no specific tool name, model, or commercial-use terms are assumed. Inspect the available capability and its terms at implementation time. Do not claim images were generated if only prompts were written.

### 9.2 Global art prompt

> Create an original raster illustration asset for Orbit Kitchen, a calm orbital-galley scheduling puzzle. Warm ivory ceramic, saturated but controlled cobalt enamel, soft upper-left lighting, clean friendly silhouettes, subtle hand-painted material transitions, precise product-illustration composition, no heavy outlines, no photographic food texture, no dramatic perspective. The visual language is a readable observatory diagram meeting a carefully made enamel lunch counter. Keep the silhouette clear at mobile icon scale. No text, numbers, logos, watermark, interface mockup, recognizable franchise character, or imitation of a named artist. Use the attached approved style reference for palette, lighting, and shape language.

### 9.3 Asset-specific prompt additions

**Miro:** “One compact enamel service robot, cobalt rounded body, cream face panel, two simple dark eyes, a single oversized cream oven mitt. Friendly without exaggerated baby proportions. Isolated full figure on transparent background, identical body construction across poses. Pose: [idle/thinking/pleased/reassuring]. Keep all limbs inside the frame.”

**Ingredient:** “One [ingredient], preserving this exact identifier silhouette: [matrix description]. Mostly cream-lit body with [orange/coral/lilac/green] accent. State: [raw/part-cooked/ready/burnt/spoiled] using the state's specified subtle treatment. No facial features. Three-quarter view with a readable top-down footprint. Isolated transparent background, centered, 10% padding. Do not add extra ingredients, cutlery, label, plate, or steam unless this asset's specification explicitly requires it.”

**Station underlay:** “A single [loading tray/cooking heat plate/serving plate] made of cream ceramic with cobalt inset detail, seen from the approved board angle. Symmetric readable footprint. No number, word, ingredient, robot, button, or background. Decorative station underlay, not an interactive UI illustration.”

**Environment:** “Interior edge of a tiny orbital galley, one distant planetary porthole, warm ceramic and cobalt enamel details. Central 70% is quiet cream negative space suitable behind a puzzle interface. Low contrast, no people, food, text, controls, dramatic stars, or strong focal object in the center. Composition: [portrait/wide].”

**Premium trim:** “Constellation Porcelain decorative trim for the approved [station]. Preserve exactly the approved silhouette and interior clear area. Fine cobalt dots, fine cream arcs, one restrained brass-colored accent. No metallic glare, extra border thickness, icon, numeral, or altered target footprint.”

**Results:** “A quiet galley postcard illustration: [three neatly completed order tickets and a resting serving plate / a notebook left open for another try / an open recipe notebook and a small orbital diagram]. Reassuring, not triumphant fireworks or failure damage. Leave generous blank space for live interface copy. No baked text.”

**Icons:** “One original simple raster UI symbol for [function], cobalt/cream visual language, strong recognizable silhouette at 24 px, transparent background, no letters, no decorative noise. [For rotate: unmistakably clockwise.]”

### 9.4 Review rubric

Reject and correct an asset if any answer is no:

- Is its identity recognizable at the actual runtime display size, in grayscale as well as color?
- Does it match the approved palette, light direction, angle, and material roughness?
- Does the state remain the same ingredient rather than becoming a different shape?
- Are there no stray objects, text fragments, false eyes, duplicated limbs, halos, or clipped edges?
- Does it work against both theme surfaces?
- Does it leave the numeric and textual overlays unobstructed?
- Is the source and usage-rights record complete?
- Is it within the compressed and decoded-memory budgets?

If a generation service cannot produce reliable transparency, use a controlled solid background and a documented raster removal/matting pass. Inspect the result on dark and light checkerboards. Do not silently ship poor cutouts.

---

## 10. Audio, music, and haptics

### 10.1 Sound identity

Sound should suggest ceramic, a soft mechanical detent, a small induction stove, and an orderly galley. Avoid slot-machine cascades, alarm sirens, shouted orders, excessive cuteness, or a cash-register sound for ordinary service.

**Preferred acquisition: original, deterministic procedural synthesis rendered to files during implementation.** No downloaded recording is necessary to finish the game. Optional external candidates are listed in section 10.7, but none has been downloaded or auditioned for this documentation deliverable.

### 10.2 Audio manifest

Baseline: 18 event sounds, one ambience loop, and one original music loop. All 20 are mandatory production deliverables; enabling music and ambience is optional for the player and defaults off. Completion/incomplete cues below are the result stingers; do not add another overlapping fanfare.

| ID | Trigger | Duration target | Synthesis / treatment |
|---|---|---:|---|
| `ui_press` | Ordinary UI activation | 35–60 ms | Low-amplitude filtered noise tick plus a short 700 Hz sine |
| `ui_open` | Drawer or sheet opens | 90–130 ms | Soft rising two-note wooden/plucked tone |
| `ui_close` | Drawer or sheet closes | 70–110 ms | Quieter descending counterpart |
| `rotate_detent` | One accepted rotation | 180–240 ms | Three soft detent pulses across the movement, high frequencies rolled off |
| `load_cradle` | Ingredient loaded | 100–150 ms | Ceramic body tap around 420 Hz with a faint short overtone |
| `cook_step` | Nonfinal cooking step | 160–220 ms | Filtered seeded noise sizzle with a soft attack; no real kitchen sample required |
| `cook_ready` | Cooking reaches exact target | 180–250 ms | Short sizzle plus a warm 660/880 Hz dyad |
| `serve_bell` | Order served | 220–330 ms | Small ceramic/bell partials, restrained major interval |
| `discard_soft` | Confirmed discard | 90–140 ms | Soft low thud and short paper/noise tail; never a punishment explosion |
| `undo_return` | Accepted undo | 140–220 ms | Gentle descending pluck; not a literal reversed copyrighted effect |
| `hint_open` | Hint content revealed | 160–240 ms | Quiet two-note glint distinct from success |
| `warning_fresh` | An action newly moves a relevant visible item into a warning tier | 100–160 ms | One soft rounded note; coalesce simultaneous warnings |
| `burnt` | Item newly becomes burnt | 150–220 ms | Small muted puff and low tone, no harsh buzzer |
| `spoiled` | Item newly reaches zero | 120–200 ms | Muted downward pair, clearly different from burnt |
| `complete` | Shift succeeds | 550–800 ms | Original three-note ceramic cadence; replace final serve cue rather than stacking both |
| `incomplete` | Turn budget ends without success | 300–450 ms | Calm unresolved two-note phrase, lower loudness than completion |
| `mastery` | New free milestone | 500–700 ms | Small upward extension of the service motif, scheduled after results settle |
| `purchase_verified` | Server confirms a new entitlement | 350–500 ms | Restrained glass/ceramic acknowledgement; never trigger for pending/cancelled |
| `galley_ambience` | Player explicitly enables ambience | 12 s seamless loop | Very quiet filtered pink-noise ventilation; no voices or identifiable recording |
| `galley_music` | Player explicitly enables music | 48 s seamless musical loop | Original 16-bar, 80 BPM, 4/4 sparse music bed described below |

Invalid actions use a short textual explanation; at most reuse a quieter `ui_press`, not an error alarm. Audio events are emitted once per logical event ID. Server acknowledgements, duplicate requests, and state restoration must not replay the same sounds.

### 10.3 Reproducible procedural production

The implementation agent must deliver an offline generator script and parameter manifest, not rely on live generation to make the app playable.

- Generate at 48 kHz. Keep 24-bit PCM masters where the pipeline supports them; export 16-bit PCM WAV effects for broad decoding support.
- Seed a documented pseudo-random generator for noise layers; baseline seed `0x4F524249`, with stable per-asset derivations. Do not use unseeded randomness in reproducibility tests.
- Use sine/triangle oscillators, seeded noise, filters, and short amplitude envelopes. Each sound needs a 3–8 ms onset fade and an appropriate release to avoid clicks.
- Normalize conservatively; no sample may clip. Effect masters should remain below −1 dBFS peak. Final mix must be checked with overlapping voices, not only isolated files.
- Export a manifest containing generator version, parameters, seed, duration, sample rate, channel count, peak level, and hashes.
- Effects are mono unless spatial width has a clear benefit. Do not pan feedback according to slot location as its only spatial explanation.
- The generator source is project-authored or appropriately licensed. Original generated output is not automatically CC0; record the project's chosen ownership/license treatment.

### 10.4 Original music specification

Use a soft mallet voice, a sparse rounded bass, and a very quiet filtered pad. No drums are required. At 80 BPM, one quarter note is 0.75 seconds; sixteen 4/4 bars form a 48-second loop.

Use four four-bar harmonic regions: **Dmaj7, G6, Bm7, Asus2**. A suitable starting voicing is D3/F♯3/A3/C♯4, G2/B2/D3/E3, B2/D3/F♯3/A3, and A2/B2/E3. Keep the bass low in the mix and avoid a large sub-bass component.

A simple original motif uses A4, F♯4, E4, D4 with rests and variation; introduce it sparingly in bars 1, 5, 9, and 13 rather than filling every beat. Do not sample, imitate, or interpolate an identifiable song. The final composition must be auditioned for repetition fatigue over a five-minute session.

Render a lossless master and compressed runtime alternatives supported by target clients. Prefer Opus where supported, with an AAC/MP3 fallback selected by capability testing. Account for encoder delay and loop seams; use a short controlled crossfade if needed. A small audible loop gap is not “seamless.”

### 10.5 Runtime mix and settings

- SFX preference defaults on, but no sound plays before a user activation successfully unlocks audio.
- Music and ambience default off; haptics default off.
- Expose separate SFX, music, and ambience controls plus a master mute. Persist preferences.
- Create/resume the `AudioContext` in a user gesture. Handle suspended contexts, decode failures, and rejected playback without blocking gameplay.
- Suspend or mute when the app is hidden/inactive. Never resume audible playback unexpectedly after backgrounding; follow the saved preference and actual browser permission state.
- Limit simultaneous effects to eight voices, stealing the oldest low-priority decorative sound first. Important feedback must never create clipping under rapid legal actions.
- Duck music modestly under service/result cues. Do not duck by changing the game's timing.
- Aim for comfortable short-form music loudness around −22 to −18 LUFS integrated, with no final mixed clipping. Audition on a phone speaker, headphones, and at low volume.
- Warning sounds occur on state transitions, not every render, every idle second, or every time a drawer is opened.

### 10.6 Haptics

Use Telegram's haptic capability only if supported and enabled. A light impact may accompany a committed rotation or load; a restrained success notification may accompany completion. No continuous vibration, per-freshness countdown vibration, or haptic-only warning. Web fallback is silent when no approved haptic API exists.

### 10.7 Optional downloadable audio and licensing

The recommended optional source is **Kenney — Interface Sounds**: <https://kenney.nl/assets/interface-sounds>. Kenney's official support page states that assets on its asset pages are CC0 and permits commercial use: <https://kenney.nl/support>. This establishes a suitable source category, not a claim that a particular archive or sound has already been inspected.

If the agent chooses this route, download from the official pack page, retain the included license, audition specific files, and map only appropriate soft UI sounds to manifest IDs. Do not invent filenames from an archive not yet downloaded. Do not use Kenney's logo to imply endorsement. Generation remains the fallback if availability or fit is poor.

Freesound is a secondary option only for individually inspected CC0 files. Its entire catalogue is not CC0. Avoid noncommercial licenses, unverified “royalty-free” uploads, identifiable voices, branded device sounds, and music clips. A free download is not permission to redistribute.

For each external file record the exact source URL, author, license/version, acquisition date, original filename/hash, modifications, and required notice. Store the license alongside the asset; do not hotlink runtime audio. See references R08–R11.

---

## 11. Accessibility and inclusive interaction

Target WCAG 2.2 AA for the applicable web interface, with the stronger product control-size targets below. This document does not claim conformance before testing.

### 11.1 Visual accessibility

- Text contrast: at least 4.5:1 for normal text and 3:1 for qualifying large text.
- Meaningful control boundaries, focus indicators, and essential non-text graphics: at least 3:1 against adjacent colors where applicable.
- Primary controls and touchable slots: target 48×48 CSS pixels; project minimum 44×44 except noninteractive decoration. WCAG 2.2 AA's general minimum is 24×24 with exceptions; this product deliberately uses larger controls.
- Never rely only on hue for ingredient identity, freshness, cook state, assistance, sync state, or completion.
- Do not prevent browser zoom. Support 200% text enlargement and narrow reflow using the slot list rather than clipping labels.
- Reduced motion follows the OS preference by default and is independently selectable. No flashing effects or sudden camera motion.
- A high-contrast setting removes decorative textures and strengthens surfaces/boundaries without changing rule information.

### 11.2 Semantic board and list

The circular board is not a screenshot of the game. Use semantic interactive elements and an accessible ordered representation of slots. The optional list shows eight rows in fixed slot order, each with station label where relevant, ingredient/status, cook count, freshness, and inspect action.

Example accessible name: **“Slot 2, Cook station. Mooncap. Cooking 1 of 2. Freshness 8. One more cooking step needed.”** Empty example: **“Slot 0, Load station. Empty.”**

The accessible order is 0–7 regardless of sprite movement or DOM animation. The active order is labeled “Order 1 of 3, active,” not only outlined in cobalt. Queue content is accessible in full.

### 11.3 Announcements

Use a concise polite live region after a committed action, e.g. **“Rotated clockwise. Carrot at slot 5, freshness 1. Serve is available.”** Coalesce multiple changes into one useful summary. Do not announce eight unrelated freshness decrements individually.

Warnings, rejected actions, and synchronization conflicts must be announced. Routine sync acknowledgements should not interrupt every turn. Screen-reader users must be able to request the full board state without waiting for a timed announcement.

### 11.4 Cognitive and motor access

No drag-only action, quick-time event, double-tap requirement, timed tutorial, precision hover, or hold-to-rotate control. Keep station numbering and placement consistent across skins and themes. Confirm destructive intent, explain invalidity plainly, and offer free recovery.

### 11.5 Required checks

Manual keyboard-only completion; VoiceOver on an actual supported iPhone/Telegram client; TalkBack on an actual supported Android/Telegram client; browser screen-reader/list fallback; 200% text in Russian; reduced motion; high contrast; sound entirely disabled; portrait and landscape; all premium skins. Browser emulation alone is insufficient evidence of Telegram-client behavior.

---

## 12. English/Russian localization and writing

### 12.1 Localization contract

Default to the saved explicit language choice; otherwise use Telegram's language code, choosing Russian for `ru`/`ru-*` and English for other unsupported languages. Browser guest mode follows the same saved-choice then browser-language fallback. Only EN and RU are shipped in this release.

Use stable translation keys and ICU-style formatting through a maintained compatible formatter. Never construct sentences by concatenating translated fragments. Ingredient and recipe IDs are immutable; changing language cannot reorder the queue or change a recipe target.

Reserve enough space for Russian expansion; use reviewed short board labels from section 4 and full names in inspection. No automatic truncation of essential warnings or active-order meaning. Font files must include actual Cyrillic glyphs, not silently fall back mid-word.

### 12.2 Required copy baseline

| Key | English | Russian |
|---|---|---|
| `brand.title` | Orbit Kitchen | Орбитальная кухня |
| `welcome.promise` | Everything moves together. Take your time. | Всё движется вместе. Не спешите. |
| `welcome.start` | Start the first shift | Начать первую смену |
| `nav.shifts` | All shifts | Все смены |
| `nav.continue` | Continue shift | Продолжить смену |
| `nav.back` | Back | Назад |
| `nav.settings` | Settings | Настройки |
| `nav.help` | How to play | Как играть |
| `mode.training` | Training | Обучение |
| `mode.bridge` | Bridge | Переходные смены |
| `mode.standard` | Standard | Стандарт |
| `assistance.none` | Unassisted | Без помощи |
| `assistance.assisted` | Assisted | С помощью |
| `assistance.study` | Study | Разбор |
| `action.rotate` | Rotate kitchen | Повернуть кухню |
| `action.load` | Load ingredient | Загрузить ингредиент |
| `action.cook` | Cook once | Приготовить на один шаг |
| `action.cookAgain` | Cook again | Приготовить ещё раз |
| `action.serve` | Serve dish | Подать блюдо |
| `action.discard` | Discard item | Убрать ингредиент |
| `action.keep` | Keep item | Оставить ингредиент |
| `action.undo` | Undo | Отменить ход |
| `action.retry` | Retry free | Повторить бесплатно |
| `action.next` | Next shift | Следующая смена |
| `action.exit` | Exit to shifts | К списку смен |
| `action.inspect` | Inspect item | Посмотреть ингредиент |
| `action.viewQueue` | View all ingredients | Все ингредиенты |
| `action.preview` | Preview rotation | Предпросмотр поворота |
| `action.list` | Slot list | Список позиций |
| `action.ring` | Ring view | Круговая схема |
| `station.load` | 0 · Load | 0 · Загрузка |
| `station.cook` | 2 · Cook | 2 · Готовка |
| `station.serve` | 5 · Serve | 5 · Подача |
| `rule.rotation` | One rotation moves every ingredient. | Один поворот сдвигает все ингредиенты. |
| `rule.noClock` | Freshness changes after actions, not with time. | Свежесть меняется после действий, а не с течением времени. |
| `rule.serviceFirst` | Serving happens before freshness decreases. | Сначала блюдо подаётся, затем уменьшается свежесть. |
| `rule.cookTarget` | Match the exact cooking count. | Нужно точное число шагов готовки. |
| `state.raw` | Raw | Сырой ингредиент |
| `state.partial` | Part-cooked | Частично приготовлено |
| `state.ready` | Ready | Готово |
| `state.burnt` | Burnt | Пригорело |
| `state.spoiled` | Spoiled | Испорчено |
| `state.both` | Burnt and spoiled | Пригорело и испортилось |
| `state.discardOnly` | Discard only | Можно только убрать |
| `state.empty` | Empty | Пусто |
| `freshness.label` | Freshness: {count} | Свежесть: {count} |
| `freshness.low` | Low freshness | Мало свежести |
| `freshness.last` | Last fresh action | Последнее действие до порчи |
| `freshness.preview` | After this action, {ingredient} at slot {slot} becomes spoiled. | После этого действия {ingredient} на позиции {slot} испортится. |
| `cook.progress` | Cooking: {current} / {target} | Готовка: {current} / {target} |
| `order.active` | Order {index} of {total} · Active | Заказ {index} из {total} · Текущий |
| `order.waiting` | Order {index} of {total} · Waiting | Заказ {index} из {total} · Ожидает |
| `order.served` | Order {index} of {total} · Served | Заказ {index} из {total} · Подан |
| `queue.next` | Next ingredient | Следующий ингредиент |
| `queue.noneAuthored` | No queued ingredients — use the starting board. | Очередь пуста — используйте ингредиенты на поле. |
| `queue.depleted` | All queued ingredients loaded. | Все ингредиенты из очереди загружены. |
| `error.wrongOrder` | This is not the next order. | Это не следующий заказ. |
| `error.undercooked` | This dish needs more cooking. | Этому блюду нужна ещё готовка. |
| `error.loadBlocked` | Loading position occupied. | Позиция загрузки занята. |
| `error.emptyCook` | Nothing at the stove. | На станции готовки пусто. |
| `error.emptyServe` | Nothing at the serving station. | На станции подачи пусто. |
| `error.emptyDiscard` | This slot is empty. | Эта позиция пуста. |
| `error.noTurnSpent` | No turn was spent. | Ход не потрачен. |
| `danger.overcook` | This dish is ready. Cooking again will burn it. | Блюдо уже готово. Ещё один шаг готовки — и оно пригорит. |
| `danger.discardCost` | Costs 1 turn and subtracts 10 from a successful score. | Стоит 1 ход и уменьшает итог успешной смены на 10 очков. |
| `hint.title` | Opening plan — assumes the original board | План начала — для исходного поля |
| `hint.assisted` | This hint marks this attempt Assisted. It is free. | Эта подсказка отметит попытку как «С помощью». Она бесплатна. |
| `hint.study` | Showing the full solution marks this attempt Study. | Полное решение отметит эту попытку как «Разбор». |
| `hint.restart` | Restart with this study plan | Начать заново по этому плану |
| `result.success` | Service complete. | Все заказы поданы. |
| `result.incomplete` | The shift is unfinished. | Смена не завершена. |
| `result.reassure` | Retry or study for free. | Повторите попытку или бесплатно посмотрите разбор. |
| `result.base` | Base service | За завершение смены |
| `result.discards` | Discards | Убрано ингредиентов |
| `result.total` | Total score | Всего очков |
| `result.unranked` | Not ranked | Вне рейтинга |
| `sync.saved` | Synced | Сохранено на сервере |
| `sync.pending` | Saved on this device · waiting to sync | Сохранено на устройстве · ожидает синхронизации |
| `sync.local` | Local practice only | Только локальная тренировка |
| `sync.provisional` | Result pending verification | Результат ожидает проверки |
| `sync.conflict` | Another device has a different continuation. | На другом устройстве смена продолжена иначе. |
| `shop.title` | Station Crockery Set | Набор посуды для станций |
| `shop.cosmeticOnly` | Appearance only. No gameplay advantage. | Только внешний вид. Без преимуществ в игре. |
| `shop.pending` | Payment is pending. Your shift is unchanged. | Платёж обрабатывается. Смена не изменилась. |
| `shop.owned` | Owned | Куплено |
| `shop.refunded` | Refunded. Free crockery is active. | Возврат выполнен. Выбрана бесплатная посуда. |
| `shop.support` | Support development | Поддержать разработку |
| `settings.sound` | Sound effects | Звуковые эффекты |
| `settings.music` | Music | Музыка |
| `settings.ambience` | Galley ambience | Атмосфера кухни |
| `settings.motion` | Reduced motion | Меньше движения |
| `settings.contrast` | High contrast | Высокий контраст |
| `settings.shortcuts` | Single-key shortcuts | Управление одной клавишей |

Use nominative ingredient names in the provided freshness sentence, or introduce localized grammatical forms explicitly; do not apply an English possessive/template strategy to Russian.

### 12.3 Plural patterns

Keep turn-count language separate from rotation-action language.

- EN `turns.remaining`: `{count, plural, one {# turn remaining} other {# turns remaining}}`
- RU `turns.remaining`: `{count, plural, one {Остался # ход} few {Осталось # хода} many {Осталось # ходов} other {Осталось # хода}}`
- EN `orders.remaining`: `{count, plural, one {# order remaining} other {# orders remaining}}`
- RU `orders.remaining`: `{count, plural, one {Остался # заказ} few {Осталось # заказа} many {Осталось # заказов} other {Осталось # заказа}}`

Counts are nonnegative integers. Test 0, 1, 2, 4, 5, 11, 14, 21, 22, and 24 where meaningful. Do not hide a number to avoid a plural issue.

### 12.4 Editorial rules

Warm, concise, precise. Explain what happened and what the player can do. Avoid blame, shame, urgency, infantilizing praise, real cooking claims, and jokes that obscure a failure reason. The English and Russian copy above is a production baseline, not a claim of completed native-speaker review. Every remaining system message, hint, title, support text, and accessibility label must also be localized and reviewed before release.

---

## 13. Authored shift catalogue and reference solutions

### 13.1 Reading the content tables

These are the complete initial configurations for release content revision **`1`**. They are not randomly generated examples. Canonical shift IDs are `g08-t01` through `g08-t06`, `g08-b01` through `g08-b06`, and `g08-s01` through `g08-s12`; the shorter uppercase codes are display/debug labels.

Ingredient codes C/T/M/P refer to section 4. Orders and queues are read left to right. A dash means an empty list. Every unspecified slot is empty. Initial-item notation is **`slot:ingredient/cookCount/freshness`**. For example, `4:C/1/2` is a ready carrot at slot 4 with freshness 2.

All initial values are explicit. A seed's display status is derived from its target, cook count, and freshness; never infer a default freshness for a table entry that already supplies one. Queue entries always create raw, freshness-16 ingredients when loaded.

Reference trace notation:

- `L` = Load; `R` = Rotate clockwise; `K` = Cook; `V` = Serve.
- `R3` means three separately accepted rotations; `K2` means two separately accepted cooking actions. Each still consumes a turn and ages items separately.
- `D0` means discard the item currently at slot 0 after validating its identity. It is not a queue discard.
- Spaces are separators, not pauses that affect freshness.

Reference solutions are **feasibility witnesses, not optimal solutions**. A player may find a faster or lower-discard route. Do not reject a valid alternative, cap its score at the witness score, or label the witness as “perfect.”

### 13.2 Titles, themes, and learning purpose

| ID | English title | Russian title | Scheduling purpose |
|---|---|---|---|
| T01 | Everything Moves | Всё движется | Two visible items prove that rotation is global; first service |
| T02 | The Loading Berth | Позиция загрузки | Load, reach station 2, cook once, reach station 5 |
| T03 | A Second Warmth | Ещё шаг готовки | Target-two recipe; two Cook actions without moving the item |
| T04 | The Last Fresh Moment | Последний свежий момент | Freshness 2 at slot 4; serve at freshness 1 before aging |
| T05 | A Scorched Start | Пригоревшее начало | Recognize a pre-burnt item and practice discard; compare moving it aside |
| T06 | Not on the Ticket | Не в заказе | Read the queue and park an unneeded ingredient |
| B01 | Two Plates, One Orbit | Две тарелки, один круг | Load consecutive items and cook each as it arrives |
| B02 | Unequal Recipes | Разная готовка | One target-one and one target-two recipe in a pipeline |
| B03 | Serve, Then Simmer | Сначала подача | A ready order and a raw item offer competing legal station actions |
| B04 | A Plate Already Waiting | Тарелка уже ждёт | Combine a preloaded ready item with a newly loaded one |
| B05 | The Occupied Berth | Занятая позиция | Spoiled is distinct from burnt; discard or rotate to free loading |
| B06 | Read the Whole Queue | Прочитайте всю очередь | A leading spare need not be discarded or cooked |
| S01 | First Full Service | Первая полная смена | Three target-one orders and overlapping preparation |
| S02 | Double-Step Supper | Ужин в два шага | Three target-two orders; more cooking means more global aging |
| S03 | At the Service Hatch | У окна подачи | Serve an urgent ready item while preparing two later orders |
| S04 | The Three-Way Handoff | Тройная передача | Three seeded positions and tightly coupled freshness deadlines |
| S05 | Cargo in Motion | Груз в движении | A preloaded raw item joins two later loads |
| S06 | The Wrong Plate First | Не та тарелка | Ready does not mean active; preserve a later order through a lap |
| S07 | The Spare Crate | Лишний ящик | Complete service while an unnecessary parked ingredient spoils |
| S08 | A Full Carousel | Полный круг | All eight slots occupied; atomic rotation and irrelevant leftovers |
| S09 | Just Enough Warmth | Ровно столько тепла | Finish the partly cooked mooncap, then cook the raw pod twice, within short freshness windows |
| S10 | The Long Way Round | Долгий путь по кругу | A ready pod waits for its ordered return to service |
| S11 | Serve This One Now | Это блюдо — сейчас | Freshness-1 service first, then two double-step preparations |
| S12 | Midnight Mise en Place | Полночная подготовка | Combine pre-cooked states, a tempting wrong dish, and tight early scheduling |

The notebook should convey different scheduling motifs rather than falsely promise strictly increasing turn counts. Tight freshness and crowded information can make an eleven-turn shift more demanding than a nineteen-turn one. These difficulty assumptions require the player tests in section 21.

### 13.3 Complete initial configurations

| ID | Budget | Orders | Queue | Initial ring |
|---|---:|---|---|---|
| T01 | 6 | C | - | `4:C/1/16; 1:T/0/16` |
| T02 | 12 | C | C | - |
| T03 | 13 | M | M | - |
| T04 | 6 | C | - | `4:C/1/2` |
| T05 | 14 | C | C | `0:C/2/9` |
| T06 | 16 | P | TP | - |
| B01 | 20 | CT | CT | - |
| B02 | 21 | CM | CM | - |
| B03 | 16 | CM | - | `5:C/1/3; 2:M/0/12` |
| B04 | 18 | CT | T | `4:C/1/5` |
| B05 | 20 | MC | MC | `0:P/0/0` |
| B06 | 20 | TC | PTC | - |
| S01 | 24 | CTC | CTC | - |
| S02 | 24 | MPM | MPM | - |
| S03 | 24 | CMP | P | `5:C/1/2; 2:M/1/9` |
| S04 | 24 | MTC | - | `0:C/0/10; 2:T/0/8; 4:M/2/3` |
| S05 | 24 | PCT | CT | `1:P/0/16` |
| S06 | 24 | CTM | M | `5:T/1/16; 2:C/0/14` |
| S07 | 24 | CMT | PCMT | - |
| S08 | 24 | CPT | - | `0:C/2/5; 1:T/0/0; 2:P/1/12; 3:M/0/16; 4:C/1/8; 5:T/0/16; 6:M/0/16; 7:T/1/16` |
| S09 | 24 | CMP | - | `2:M/1/8; 0:P/0/12; 4:C/1/3` |
| S10 | 24 | MPT | T | `6:P/2/16; 0:M/0/16` |
| S11 | 24 | CMP | - | `5:C/1/1; 2:M/0/10; 0:P/0/13` |
| S12 | 24 | CMP | TC | `4:C/1/4; 2:M/0/9; 0:P/1/14; 5:T/1/16` |

### 13.4 Mechanically checked witness traces

“Serve freshness” lists each order's freshness immediately **before** its successful Serve. It is an especially useful regression check for end-of-turn ordering. Expected scores are for these traces without undo/hints; assistance does not change arithmetic.

| ID | Reference trace | Turns | Remaining | Discards | Score | Serve freshness |
|---|---|---:|---:|---:|---:|---|
| T01 | `R V` | 2 | 4 | 0 | 120 | 15 |
| T02 | `L R2 K R3 V` | 8 | 4 | 0 | 120 | 10 |
| T03 | `L R2 K2 R3 V` | 9 | 4 | 0 | 120 | 9 |
| T04 | `R V` | 2 | 4 | 0 | 120 | 1 |
| T05 | `D0 L R2 K R3 V` | 9 | 5 | 1 | 115 | 10 |
| T06 | `L R L R2 K2 R3 V` | 11 | 5 | 0 | 125 | 9 |
| B01 | `L R L R K R K R2 V R V` | 12 | 8 | 0 | 140 | 8, 8 |
| B02 | `L R L R K R K2 R2 V R V` | 13 | 8 | 0 | 140 | 7, 7 |
| B03 | `V K2 R3 V` | 7 | 9 | 0 | 145 | 3, 6 |
| B04 | `R V L R2 K R3 V` | 10 | 8 | 0 | 140 | 4, 10 |
| B05 | `D0 L R L R K2 R K R2 V R V` | 14 | 6 | 1 | 120 | 7, 7 |
| B06 | `L R L R L R K R K R2 V R V` | 14 | 6 | 0 | 130 | 8, 8 |
| S01 | `L R L R K L R K R K R V R V R V` | 16 | 8 | 0 | 140 | 6, 6, 7 |
| S02 | `L R L R K2 L R K2 R K2 R V R V R V` | 19 | 5 | 0 | 125 | 3, 3, 5 |
| S03 | `V K L R2 K2 R V R2 V` | 12 | 12 | 0 | 160 | 2, 1, 8 |
| S04 | `K R V R K R V R2 V` | 10 | 14 | 0 | 170 | 1, 2, 1 |
| S05 | `R K2 L R L R K R K V R2 V R V` | 16 | 8 | 0 | 140 | 6, 7, 7 |
| S06 | `K R3 V R L R2 K2 R2 V R V` | 16 | 8 | 0 | 140 | 10, 3, 8 |
| S07 | `L R L R L R K L R K2 R K R V R V R V` | 19 | 5 | 0 | 125 | 5, 5, 6 |
| S08 | `K R V R2 V R3 V` | 10 | 14 | 0 | 170 | 6, 7, 7 |
| S09 | `K R V R K2 R V R2 V` | 11 | 13 | 0 | 165 | 1, 1, 2 |
| S10 | `R2 K2 R3 V L R2 V K R3 V` | 17 | 7 | 0 | 135 | 9, 5, 9 |
| S11 | `V K2 R2 K2 R V R2 V` | 12 | 12 | 0 | 160 | 1, 2, 2 |
| S12 | `K2 R V R K R V R2 V` | 11 | 13 | 0 | 165 | 1, 2, 4 |

Additional expected events:

- S07: the first queued Pod, which is not an order, reaches freshness zero at the end of turn 17. No discard is added; the shift succeeds on turn 19. This is intentional, not a content bug.
- S08: the initial burnt Carrot at slot 0 reaches freshness zero at the end of turn 5 and then has both flags. The initially spoiled Tomato is already spoiled before turn 1. Neither adds a discard.
- T05 and B05: the provided witness deliberately demonstrates Discard. Rotating the blocked item aside is also legal and may yield a better score. The game must not require unnecessary disposal to follow the lesson.
- S12: the queued Tomato and Carrot need not be loaded. The ready Tomato initially at station 5 is not the active order.

### 13.5 Tier 1 and tier 2 hints, English

Tier 3 for each row is the corresponding full trace above, rendered as localized, numbered actions with the original board available for inspection.

| ID | Tier 1 — observation | Tier 2 — opening plan |
|---|---|---|
| T01 | The stations stay still; both ingredients move. | Rotate once. The ready carrot reaches station 5. |
| T02 | Cooking is at station 2, not at the loading position. | Load the carrot, rotate twice, and cook once. |
| T03 | Mooncap needs two separate cooking actions. | Reach station 2, then cook twice before rotating away. |
| T04 | Serving removes a dish before that action's aging. | Rotate now; the carrot arrives with freshness 1. Serve next. |
| T05 | Burnt food cannot be rescued by more cooking. | Practice discarding the burnt carrot, then load the fresh one. Moving the burnt item aside is also legal. |
| T06 | The first queued ingredient is not always required. | Load the tomato and rotate it aside; then load the pod. Leave the tomato uncooked. |
| B01 | You can prepare a second ingredient before serving the first. | Load carrot, rotate, load tomato; cook each at station 2. |
| B02 | Both cooking actions age every other existing item. | Prepare the carrot first; give the mooncap both cooking steps on its first visit to station 2. |
| B03 | A ready plate is already at the serving hatch. | Serve the carrot, then cook the mooncap twice before moving it. |
| B04 | The first order does not need to be loaded or cooked. | Rotate and serve the ready carrot, then use the queued tomato. |
| B05 | Spoiled food keeps occupying its slot. | Discard the spoiled pod to practice clearing the berth; then load mooncap followed by carrot. Rotation is another way to clear the berth. |
| B06 | An unneeded item can travel without being cooked. | Park the leading pod and load tomato then carrot behind it. |
| S01 | Three preparations can share the same rotation. | Load carrot, rotate, load tomato; cook the first carrot before loading the third item. |
| S02 | A full cooking step is still a turn for all other food. | Cook each item twice during its first visit to station 2; load the third while the first is still there. |
| S03 | The carrot is already ready; the mooncap needs just one more step. | Serve carrot, finish mooncap, then load pod. Cook pod twice before mooncap's service. |
| S04 | The tomato must be cooked before the first rotation. | Cook tomato, rotate, and serve mooncap. Then bring carrot to station 2. |
| S05 | The pod reaches the stove before either queued ingredient. | Rotate once, cook pod twice, then start loading carrot and tomato behind it. |
| S06 | A ready tomato cannot jump ahead of the carrot order. | Cook and serve carrot first. Let tomato continue around; load mooncap after tomato clears slot 0. |
| S07 | The leading pod is spare cargo, not an order. | Park it and prepare carrot, mooncap, and tomato in that order. Its eventual spoilage is not an extra penalty. |
| S08 | A full ring still rotates atomically. | Finish the pod at station 2, rotate, then serve the ready carrot. Ignore ingredients that are not needed. |
| S09 | The carrot and mooncap have short but usable windows. | Finish mooncap before rotating; serve carrot, then give pod both cooking steps when it reaches station 2. |
| S10 | The ready pod must circle back, but mooncap is the first order. | Cook mooncap twice at station 2 and serve it. Load tomato while pod approaches its later service. |
| S11 | Freshness 1 at station 5 is still enough for immediate service. | Serve carrot first. Cook mooncap twice, then rotate pod to station 2 for its two steps. |
| S12 | The tomato at the hatch is a distraction; mooncap still needs two steps. | Cook mooncap twice, rotate once, and serve carrot at freshness 1. Finish pod on its next stove visit. |

### 13.6 Tier 1 and tier 2 hints, Russian

| ID | Tier 1 — observation | Tier 2 — opening plan |
|---|---|---|
| T01 | Станции стоят на месте, а оба ингредиента движутся. | Поверните кухню один раз. Готовая морковь окажется на станции 5. |
| T02 | Готовка находится на станции 2, а не на позиции загрузки. | Загрузите морковь, поверните дважды и приготовьте на один шаг. |
| T03 | Лунному грибу нужны два отдельных шага готовки. | Доберитесь до станции 2 и приготовьте дважды, прежде чем поворачивать дальше. |
| T04 | При подаче блюдо убирается до уменьшения свежести. | Поверните сейчас: у моркови останется 1 свежесть. Следующим действием подайте её. |
| T05 | Пригоревший ингредиент нельзя спасти новой готовкой. | Попробуйте убрать пригоревшую морковь, затем загрузите свежую. Отодвинуть пригоревшую поворотом тоже можно. |
| T06 | Первый ингредиент в очереди нужен не всегда. | Загрузите томат и отодвиньте его поворотом, затем загрузите стручок. Томат готовить не нужно. |
| B01 | Второй ингредиент можно готовить до подачи первого. | Загрузите морковь, поверните, загрузите томат; готовьте каждый на станции 2. |
| B02 | Каждый шаг готовки уменьшает свежесть остальных ингредиентов на поле. | Сначала приготовьте морковь. Грибу дайте оба шага при первом попадании на станцию 2. |
| B03 | Готовая тарелка уже находится на станции подачи. | Подайте морковь, затем дважды приготовьте гриб, не перемещая его. |
| B04 | Первый заказ не нужно загружать или готовить. | Поверните и подайте готовую морковь, затем используйте томат из очереди. |
| B05 | Испорченный ингредиент продолжает занимать позицию. | Уберите испорченный стручок, затем загрузите гриб и морковь. Освободить загрузку можно и поворотом. |
| B06 | Ненужный ингредиент может двигаться без готовки. | Оставьте первый стручок на круге и загрузите за ним томат, затем морковь. |
| S01 | Один поворот может помочь сразу трём блюдам. | Загрузите морковь, поверните, загрузите томат; приготовьте первую морковь до загрузки третьего ингредиента. |
| S02 | Шаг готовки — это ход и для всех остальных ингредиентов. | Готовьте каждый ингредиент дважды при первом попадании на станцию 2; третий загрузите, пока первый ещё там. |
| S03 | Морковь уже готова, а грибу нужен ещё один шаг. | Подайте морковь, доготовьте гриб, затем загрузите стручок. Приготовьте стручок дважды до подачи гриба. |
| S04 | Томат нужно приготовить до первого поворота. | Приготовьте томат, поверните и подайте гриб. Затем доставьте морковь на станцию 2. |
| S05 | Стручок попадёт на готовку раньше ингредиентов из очереди. | Поверните один раз, приготовьте стручок дважды, затем загружайте за ним морковь и томат. |
| S06 | Готовый томат не может обойти заказ моркови. | Сначала приготовьте и подайте морковь. Пусть томат движется дальше; загрузите гриб, когда томат освободит позицию 0. |
| S07 | Первый стручок — лишний груз, а не заказ. | Оставьте его на круге и готовьте морковь, гриб, томат по порядку. Его порча не добавляет штраф. |
| S08 | Даже полностью занятый круг поворачивается целиком. | Доготовьте стручок на станции 2, поверните и подайте готовую морковь. Ненужные ингредиенты можно оставить. |
| S09 | У моркови и гриба мало свежести, но времени в ходах достаточно. | Доготовьте гриб до поворота; подайте морковь, затем дважды приготовьте стручок на станции 2. |
| S10 | Готовому стручку нужно вернуться к подаче, но первый заказ — гриб. | Дважды приготовьте гриб на станции 2 и подайте его. Загрузите томат, пока стручок приближается к подаче. |
| S11 | Свежести 1 на станции 5 достаточно для немедленной подачи. | Сначала подайте морковь. Дважды приготовьте гриб, затем доставьте стручок на станцию 2 для двух шагов готовки. |
| S12 | Томат у подачи отвлекает; грибу всё ещё нужны два шага. | Дважды приготовьте гриб, поверните и подайте морковь со свежестью 1. Доготовьте стручок, когда он придёт на станцию 2. |

### 13.7 Content quality boundaries

The initial-state values intentionally create fresh scheduling problems without introducing new mechanics. The implementation may improve wording and nonmechanical flavor after review, but changing an initial position, queue, order, budget, recipe, or freshness requires a new content revision and fresh certification.

Do not assume arbitrary queue permutations are solvable. In an empty-start two-item queue `[A, B]` with orders `[B, A]`, the early A may not survive the necessary reorder. A spare is not automatically a mandatory discard, either: a validator must evaluate actual rules rather than use an invalid queue-length cost shortcut.

The implementation must report branching and difficulty observations, especially for S04/S09/S11/S12. A tight lesson can intentionally demonstrate one boundary; the whole product must not feel like guessing a hidden exact sequence. Improve previews or presentation before considering any mechanical relaxation. Never sell a rescue to compensate for poor content.

---

## 14. Content schema and certification

### 14.1 Required shift fields

Each immutable shift record contains:

- `shiftId`, integer `contentRevision`, `rulesVersion`, and a canonical content hash.
- `mode`: `training`, `bridge`, or `standard`.
- Localized title keys and localized introductory/teaching text.
- Explicit `turnBudget` and `orderCount`; no global default may overwrite custom tutorial values.
- Ordered recipe IDs, ordered ingredient queue, and exactly eight initial slot entries.
- For each initial item: seed identity, ingredient ID, cook count, freshness.
- Teaching tags, recommended display order, and whether a built-in onboarding prompt is present.
- Three hint tiers with localized content or a reference to the localized trace renderer.
- Expanded reference action list, expected terminal turn, expected discard count, score, and service-freshness list.
- Expected special events where relevant, including S07/S08 spoilage.
- Certification metadata: engine version/hash, content hash, test version, timestamp, and pass/fail report.

Display-code strings C/T/M/P are documentation shorthand. Runtime records use full stable IDs. Tutorial mode and order count are explicit fields, not inferred from filename prefixes.

### 14.2 Representative data shape

The following abbreviated shape illustrates S04. It does not replace the full data tables or establish a marketplace schema.

```json
{
  "shiftId": "g08-s04",
  "contentRevision": 1,
  "rulesVersion": "g08-rules-1",
  "mode": "standard",
  "turnBudget": 24,
  "orderCount": 3,
  "orders": ["mooncap_2", "sun_tomato_1", "comet_carrot_1"],
  "queue": [],
  "initialRing": [
    {"seedId":"slot-0","ingredientId":"comet_carrot","cookCount":0,"freshness":10},
    null,
    {"seedId":"slot-2","ingredientId":"sun_tomato","cookCount":0,"freshness":8},
    null,
    {"seedId":"slot-4","ingredientId":"mooncap","cookCount":2,"freshness":3},
    null,
    null,
    null
  ],
  "referenceTrace": ["cook","rotate","serve","rotate","cook","rotate","serve","rotate","rotate","serve"],
  "expected": {"turnUsed":10,"discardCount":0,"score":170,"serveFreshness":[1,2,1]}
}
```

### 14.3 Certification gates

1. Schema validation: valid IDs, unique seeds, eight slots, no malformed states, correct mode/count/budget constraints, complete EN/RU keys.
2. Rule validation: targets 1/2, integer freshness 0–16, initial cook count 0 through target+1, no duplicate item identity.
3. Replay every reference trace through the **same authoritative rules package used by the server**. Match all expected results, not only completion.
4. Independently cross-check essential rules with a small test oracle/property suite so a shared engine bug cannot certify itself without challenge.
5. Reject invalid or unsuccessful witnesses. A valid witness proves at least one solution within the budget and freshness constraints; an optimality claim requires a separate search proof.
6. Exercise a bounded solver or systematic search for difficulty diagnostics and selected fixtures. For an exhaustively established unsolvable fixture, publication must fail. A search timeout is **inconclusive**, not proof of unsolvability.
7. Check warning previews against actual next states at every witness step.
8. Run all shifts in the real UI, including list layout and all special starting statuses.

The documentation-phase checker was a small standalone arithmetic tool, not the game implementation. Its successful replay is useful evidence for the content tables but does not satisfy production gates 3–8.

### 14.4 Search and optimization discipline

A solver state must include item identities or an explicitly proven symmetry reduction, ring positions, ingredient types, cook counts, freshness, queue index, order index, turn count, and discards if optimizing score. Do not prune merely because an irrelevant item spoils. Do not discard branches solely because a future order is currently ahead of the active order.

If score optimization is implemented, minimize `5 × turnUsed + 10 × discardCount` for a fixed successful shift, subject to the real rules. Minimizing turns alone can miss a better score. Do not label a found solution optimal unless the search establishes that property.

### 14.5 Content revisions

Publish content immutably. Existing runs remain pinned to their content/rules version. Keep supported previous revisions available for resumption and replay. A changed recipe table requires a new rules version, even if the art and names stay the same.

Retiring a vulnerable version removes it from new ranked starts and labels historical rows; it does not silently rewrite completed results. If a security issue makes a saved run unverifiable, offer export/review and a clearly labeled free practice continuation or restart. Do not delete progress without explanation.

---

## 15. Runtime architecture and state model

### 15.1 Default technology direction

No application codebase was supplied beyond an empty repository identity. The default implementation is a small TypeScript web application, not a 3D engine:

- Web: React, TypeScript strict mode, Vite, semantic HTML/CSS, raster images, and Web Audio.
- Game logic: framework-independent deterministic TypeScript module with no DOM, wall clock, network, or animation dependencies.
- Server: Node.js **24 LTS baseline**, a maintained compatible HTTP framework such as Fastify, and PostgreSQL for durable state, payments, and idempotency.
- Validation: a runtime schema library, unit/property tests, and browser end-to-end tests; use existing project equivalents if a real platform repository supplies them.
- Package management: one committed lockfile, reproducible install, pinned supported release lines and exact resolved versions.

React 19.x is a suitable baseline; choose currently maintained compatible patch releases when implementation begins. Do not blindly use `latest`, perform unrelated major upgrades, or claim a document-selected patch was security-verified without checking it. Reuse a supplied platform stack where it meets these contracts instead of deploying a redundant backend.

The board has eight items and does not justify Unity, WebGL, a physics engine, or a continuous canvas renderer. DOM transforms provide readable accessible controls with a small payload. A raster effects layer may use a tiny canvas if measured and justified; it cannot become the authoritative board.

### 15.2 Suggested module boundaries

```text
apps/web             Mini App shell, routes, accessible UI, audio
apps/api             authenticated commands, replay, persistence, payments
packages/g08-rules    pure transitions, legality, preview, score, state schemas
packages/g08-content  immutable shift data, recipes, localized hints, certificates
packages/ui          tokens and reusable accessible controls where useful
assets/masters       approved source art/audio; not shipped to browsers
assets/runtime       optimized manifest-addressed exports
tools/content        content validation and certification
tools/assets         reproducible raster/audio export tools and provenance checks
tests                unit, property, integration, browser, and manual runbooks
```

This is an implementation organization suggestion, not permission to create unnecessary packages. A simpler repository can preserve the same boundaries in directories.

### 15.3 Canonical run state

| Field | Meaning / invariant |
|---|---|
| `runId` | Server-issued opaque identity for authenticated play; separate local namespace for guest runs |
| `ownerId` | Server-side authenticated owner; never taken from an action body as authority |
| `shiftId`, `contentRevision`, `rulesVersion`, `contentHash` | Immutable inputs pinned at run creation |
| `revision` | Monotonic command-state revision, including accepted undo/hint events |
| `ring` | Eight null/item entries; every live item ID occurs once |
| `queueIndex` | Number of consumed queue entries; integer within queue bounds |
| `orderIndex` | Number of served orders; integer within order bounds |
| `turnUsed` | Number of gameplay actions on the active reversible branch, 0 through budget |
| `discardCount` | Discards on the active reversible branch |
| `assistance` | Monotonic Unassisted → Assisted → Study |
| `reviewAssistanceFloor` | Separate monotonic disclosure metadata after terminal results; initially Unassisted, inherited by continuations, excluded from the frozen result certificate |
| `status` | Active, success, incomplete, or abandoned |
| `gameplayHistory` | Reversible accepted gameplay prefix/snapshot references |
| `auditEvents` | Accepted command history and receipts, including undo/hints, not erased by branching |
| `parentRunId` / `forkReason` | Optional practice-fork provenance |
| `createdAt`, `updatedAt` | Operational timestamps only; never age ingredients |

Derived fields include legal actions, item status flags, remaining turns, score, preview state, and next active order. If cached, verify them against their sources; do not allow independently writable score or status flags.

Loaded item IDs can be derived as `runId:q:queueIndexBeforeLoad`; seed IDs as `runId:s:seedId`. Undo and reload at the same queue index restore the same logical queue-entry identity within the run. Never use render position or a random number generated independently on client and server as the canonical identity.

### 15.4 Command envelope

An authenticated command includes `schemaVersion`, `runId`, `actionId`, `baseRevision`, `kind`, and a minimal payload. `actionId` is a UUID or equivalently collision-resistant opaque ID. The server obtains the user from the validated session.

- `rotate`, `load`, `cook`, `serve`: no client-calculated result payload.
- `discard`: expected `itemId` and `slot`; validate both.
- `undo`: expected current gameplay head reference; no arbitrary client-supplied historical snapshot.
- `hint`: tier 1, 2, or 3 and shift/run binding.

Restart, abandon, and post-terminal practice fork are run-lifecycle operations, not hidden turn-consuming gameplay actions. Use shared platform action identifiers and envelopes if supplied, with a versioned mapping to these semantics.

Responses identify action receipt, accepted/rejected status, canonical revision, canonical state or a safely applicable patch, and a stable error code. Localization happens at the presentation layer. Never trust client score, discard totals, freshness, completion flags, or purchase entitlement fields.

### 15.5 Determinism

For a fixed versioned initial state and accepted action stream, client preview, client optimistic state, server state, certification replay, and recovery replay must agree exactly. Use integer game arithmetic and stable ordering. Audio randomization, if any, cannot touch gameplay.

The rules module must not call `Date.now`, random APIs, storage, audio, browser layout measurement, or network clients. Treat generated golden snapshots as versioned test fixtures, not as a substitute for transition tests.

### 15.6 Database responsibilities

Use durable records for users/platform identity mapping, immutable content/version metadata, runs, action receipts, audit events, terminal result certificates, distinct-shift completions, cosmetic entitlements, payment orders/events, and an outbox for shared-service notifications.

Enforce unique constraints for `(owner, actionId)`, `(runId, revision)`, payment charge IDs, active unique cosmetic ownership, and idempotent reward/result events. Serialize run mutations transactionally with row locking or an equivalent compare-and-swap strategy. A response must not claim a saved turn before its authoritative transaction commits.

A terminal result certificate contains the immutable content hash, canonical successful gameplay branch, assistance classification, calculated metrics, and server verification metadata. Keep sufficient evidence to replay published results even after compacting noisy request logs.

---

## 16. Synchronization, undo, and recovery

### 16.1 Acknowledged versus predicted state

Maintain a clear separation between last acknowledged state, ordered pending commands, and locally predicted state. Optimistic feedback is allowed because the same deterministic rules run locally, but it is not a server acknowledgement.

Persist the acknowledged snapshot and pending outbox safely on the device when storage is available. A successful local write permits **Saved on this device**; only a server acknowledgement permits **Synced**. A storage failure must show **Local saving unavailable** and must not falsely promise recovery.

Partition caches and outboxes by environment, bot/application identity, and originating authenticated owner. Guest data has a separate namespace. After an account switch, do not render the previous owner's private run as the new user's continuation or upload its commands under the new session. Keep it isolated for its original owner. Confirm the authenticated owner before replay; only genuinely guest-origin data is eligible for an explicit guest-import choice. Clearing a session must not silently relabel owned data as guest data.

### 16.2 Exactly-once effect

1. The client creates one action ID per deliberate action and persists it with its payload.
2. The server first checks whether that ID already has a receipt for this owner.
3. A matching duplicate returns the original receipt without applying again, even if its original base revision is now old.
4. Reusing an ID with different semantic content is rejected as `ACTION_ID_REUSED`.
5. A new action with an incorrect base revision is rejected as `STALE_REVISION`; it spends nothing.
6. A successful new command and its receipt commit atomically.

Historical duplicate acknowledgements must not roll the client back over a newer acknowledged revision. Return or fetch the current head separately when necessary. Out-of-order network responses are reconciled by receipt identity and revision, not by arrival order.

Invalid actions leave board, turn, freshness, discard count, assistance, and run revision unchanged. A deterministic domain rejection, such as an illegal action or stale revision, may retain a final rejected receipt without becoming a gameplay mutation. Temporary rate limits, unavailable infrastructure, and pre-commit transport failures must not be finalized as permanent action receipts: the same ID remains retryable. If commit outcome is uncertain, resolve it by receipt lookup before attempting a mutation again.

The baseline client sends one command at a time from its ordered outbox. If a bounded batch transport is added, define it as an ordered committed prefix: stop at the first rejected command, return exact receipts for the processed prefix, and explicitly identify the unprocessed tail. Do not silently rewrite base revisions or replace action IDs to merge a conflicting branch. Preserve that branch and offer the choices in section 16.4.

### 16.3 Offline play

Already cached shifts may be played offline. Show a persistent but quiet **Waiting to sync** badge. Locally predicted success is **Pending verification**, not a ranked result or delivered reward.

After reconnection, transmit the same ordered commands and IDs from the last acknowledged revision. The server replays and accepts only valid continuations. Network elapsed time does not age anything. Do not merge timelines by timestamp.

Bound the ordinary outbox to 64 pending commands to prevent uncontrolled storage growth from repeated undo/hint activity. If this limit is reached, do not discard commands or consume an unrecorded action: ask the player to reconnect or explicitly create a separate local-practice continuation. This is a synchronization safeguard, not a paid replay cap. Local practice has no artificial turn-count expansion beyond the shift rules.

Fresh authenticated ranked attempts require a server-issued run and pinned content. Guest/offline-first runs use a distinct local namespace. On authentication, an import endpoint may create a new verified run by replaying the local stream against certified content; it must not simply accept the local terminal snapshot. Until that process succeeds, guest results remain local.

### 16.4 Concurrent devices

The first valid command accepted at a revision wins. A conflicting device receives the current authoritative state plus an explanation. Offer **Use synced continuation** or **Keep my branch as local practice**. Preserve the losing branch until the player chooses; never silently delete it or interleave its rotations with the other branch.

A local branch can later be submitted only as a new replay-verified practice run if the backend supports that explicit import. It is not appended to the original run as if no conflict happened.

### 16.5 Undo during an active run

Undo is free and consumes no gameplay turn. It restores the full pre-action gameplay snapshot of the latest accepted gameplay action: ring identities, positions, cook counts, freshness, queue index, order index, turns, discards, and gameplay status.

It does **not** decrement the monotonic state revision, erase audit events, remove a hint disclosure, restore Unassisted status, or undo a payment. A valid first undo marks the attempt Assisted. Repeated undo is allowed while reversible gameplay actions remain. No redo feature is required; a new action creates a new gameplay branch.

Undo with no reversible action is rejected with an explanation and does not mark assistance. Closing a hint sheet is not undo. Metadata operations never become a substitute target for “undo the last turn.”

### 16.6 Undo after terminal results

Successful/incomplete terminal result snapshots are immutable once acknowledged. **Undo last action** from Results creates a new practice run initialized to the parent run's pre-terminal gameplay snapshot and copied reversible prefix. Its assistance is `max(parent assistance, parent reviewAssistanceFloor, Assisted)` under Unassisted < Assisted < Study: a Study parent or post-result full-solution disclosure must produce a Study continuation, never an Assisted downgrade. It has a new run ID, explicit parent provenance, the same content/budget, and remapped deterministic item identities.

The original legitimately completed result remains valid. The practice fork cannot modify an old Unassisted certificate, duplicate a distinct-shift milestone, or retroactively change the original payment state. Clearly label **Practice continuation — Assisted** or **Practice continuation — Study**, matching the inherited classification. Recompute a new result if this fork completes.

For an offline or pending terminal result, Undo immediately creates an explicitly **local pending practice fork**, not a fictitious acknowledged server run. Persist its temporary identity, parent terminal-action reference, assistance floor, copied gameplay prefix, and dependent commands. On reconnection, verify the parent command stream and disclosures first, create the fork through an idempotent lifecycle operation, then map its temporary identities and replay its pending actions. The server reconstructs the fork from the verified parent, not a trusted client snapshot. If the parent cannot be verified, preserve the branch as Local practice and explain the blocker; do not discard it or call its score verified. A guest-origin parent follows the same dependency order after an explicit authenticated import.

### 16.7 Hint and reset persistence

During active play, the assistance change is part of the accepted hint command. Offline disclosure immediately marks the local attempt and is queued for server replay; it cannot temporarily show a full solution while still presenting the active run as Unassisted.

After terminal results, a hint command records a separate run-associated `reviewAssistanceFloor`: at least Assisted for tier 1/2 and Study for tier 3. It may advance the command revision/audit trail but cannot alter the frozen terminal certificate, its score, or its original assistance. The result keeps its historical label; the review clearly shows **Review: Assisted** or **Review: Study**. Persist this floor, including offline, and inherit it when creating any practice continuation. This prevents viewing a full solution after completion and then obtaining an incorrectly labeled Assisted continuation. No review action silently starts or resets a run.

Restart creates a fresh run from the immutable initial state. Ordinary **Replay free** starts a fresh Unassisted attempt; **Restart with study plan** starts Study. A player's memory of prior study is not cryptographically measurable, and the game must not pretend otherwise. Do not use these rankings for monetary prizes.

Reset/clear affects run progress only. It never clears owned cosmetics, purchases, language, or accessibility preferences. Account-data deletion is a separate explicit privacy workflow, not the reset button.

### 16.8 Recovery matrix

| Interruption | Required result |
|---|---|
| Close after acknowledged action | Reopen exact acknowledged board and freshness |
| Close after local persisted action before ACK | Restore pending state; retry same action ID |
| ACK lost after server commit | Retry obtains receipt; no second rotation |
| Network drops during a confirmation | No command until actual confirmation; later stale target is rejected safely |
| App backgrounds for hours | No aging, turn use, music surprise, or automatic replay |
| Cache fails or is evicted | Recover acknowledged server state; explain any unpersisted local loss honestly |
| Auth expires mid-run | Preserve local state; reauthenticate and sync without resetting gameplay |
| Content updates | Resume pinned version or offer explicit supported recovery |
| Language/theme changes | State hash stays identical |
| Payment flow interrupts app | Resume identical shift; only verified entitlement may change appearance |
| Client detects impossible local state | Stop ranking submission, preserve diagnostics, refetch authoritative state; do not “repair” freshness arbitrarily |

---

## 17. Telegram and shared-platform integration

### 17.1 Mini App shell

Use the official Telegram Mini Apps bridge. Call `ready()` after the initial usable UI is prepared, not after optional music and all backgrounds load. Expansion is useful; fullscreen is optional and must be feature-detected. The game must work without fullscreen.

Apply Telegram theme information through semantic tokens. Handle `themeChanged` without recreating the run. Keep the cobalt/cream identity while meeting contrast requirements; do not blindly apply host colors to ingredient state chips.

Use `viewportStableHeight` and stable viewport-change information for settled layout. Do not pin essential controls to a continuously changing `viewportHeight` during Telegram sheet dragging. Handle resize, orientation, and software-keyboard changes without changing logical state.

### 17.2 Safe areas

Telegram exposes system/device `safeAreaInset` and Telegram-interface `contentSafeAreaInset`, with corresponding change events and CSS variables in supporting clients. These are distinct exclusions. Ordinary browser `env(safe-area-inset-*)` alone is not a complete Telegram layout contract.

Implement one safe-area owner in the shell. Determine the actual content coordinate system and apply each applicable exclusion once; do not universally sum all inset values or double-pad an already inset container. Provide zero/fallback values for unsupported clients and test actual normal/fullscreen clients for both occlusion and excess padding.

Safe-area APIs arrived with Bot API 8.0. Feature-check rather than rejecting older clients solely because these methods are absent. Unsupported optional APIs must not crash ordinary play.

### 17.3 Navigation and lifecycle

Use one owner for native BackButton registration. Back closes the topmost in-app sheet first, then goes to the previous screen. On the top-level hub, hide the in-app native BackButton unless the hosting platform specifies another behavior. Unregister old handlers when their owner unmounts.

Use closing confirmation only for genuinely unsaved/unsynchronized work. It is not a persistence mechanism. Preserve state independently on every acknowledged/persistable transition. Keep Telegram's vertical close/minimize gestures enabled; this game has no competing drag mechanic.

No bot message is sent for every move. Optional challenge sharing is user-initiated. Do not request contact, location, write access, or wallet permission merely to play a cooking puzzle.

### 17.4 Authentication

Send raw `Telegram.WebApp.initData` to the backend over HTTPS and validate it using the current official algorithm. Never treat `initDataUnsafe`, a client-provided user ID, or a query-string username as authenticated identity.

Validate signatures, expected bot/application binding, and `auth_date`. Standalone default: accept initialization data no older than five minutes with at most 30 seconds of tolerated future clock skew, then establish an application session with a 24-hour absolute lifetime. These TTL values are this product's defaults, **not Telegram-mandated values**. Reconcile with the real platform's session policy if supplied.

Test the official HMAC validation path with known fixtures and malformed/expired payloads. If a platform uses the official third-party validation mechanism instead, implement its exact documented validation contract; do not mix algorithms or re-encode fields casually.

Keep bot tokens on the server. A cookie-based same-origin session is preferred where supported; embedded-client storage restrictions may require a carefully scoped short-lived in-memory bearer fallback. Do not persist long-lived bearer credentials in ordinary browser storage. Session expiry cannot erase a run or age food.

Renew from fresh, valid initialization data or an explicitly supplied platform refresh contract, never by repeatedly resubmitting the same expired launch data. If Telegram cannot provide fresh data in the current launch, retain the run/outbox and offer **Reopen from Telegram to reconnect**; a reload is not assumed to refresh `auth_date`. Reauthentication must resolve to the same originating owner before that outbox is replayed. On a different account, use the isolation behavior in section 16.1.

### 17.5 Local storage is not score authority

Use IndexedDB or an equivalent tested local store for recoverable outboxes/caches. Telegram storage facilities may supplement preferences or host integration, but none replaces authoritative replay:

- CloudStorage: per-user/per-bot cloud key/value facility; official limits include 1,024 items and values up to 4,096 **characters**.
- DeviceStorage: available in supporting 9.0+ clients, local device storage up to 5 MB per user/bot; not cross-device synchronization.
- SecureStorage: supporting 9.0+ clients, sensitive local storage with a small item limit; not a home for bot tokens and not proof that a client score is trustworthy.

All storage methods can fail. Feature-detect, handle callbacks/errors, and preserve acknowledged server progress. Do not assume transactions or conflict resolution that the API does not promise.

### 17.6 Shared-platform adapter boundaries

| Adapter | Required game-facing responsibility | If the missing Platform SRS supplies it |
|---|---|---|
| Identity | Authenticated user/session and guest capability | Reuse it; do not create a second user namespace |
| Run persistence | Atomic command receipts, revisions, saved state, replay | Map shared action IDs and revision semantics explicitly |
| Progress | Distinct-shift completion and milestone read/write | Emit idempotent versioned completion events |
| Rankings | Per-shift/version/assistance verified results | Preserve partitions; never combine incompatible boards |
| Entitlements | Verified ownership and revocation of cosmetic SKU | Use the platform purchase ledger and reconciliation path |
| XP | Shared daily XP policy and caps | Ask the service for eligibility; never invent or duplicate the award amount |
| Profile/wallet | Optional verified wallet identity | Delegate to platform Profile; keep it outside gameplay |
| Challenge | Optional same-content invitation creation/resolution | Use the platform's permitted share format |

If standalone, implement identity, run persistence, progress, rankings, and entitlement/payment handling directly with the same semantics. **Standalone has no invented XP currency or XP award amount.** Hide shared XP and TON functionality when no contract exists. All gameplay remains available.

The missing platform contract is an integration dependency to reconcile, not a reason to invent fake existing endpoints. A standalone build can be fully tested, but marketplace-integration readiness may not be claimed until the actual contract is verified.

### 17.7 Suggested standalone API responsibilities

Names below are proposals for a new standalone implementation, not existing infrastructure:

| Route / operation | Responsibility |
|---|---|
| `POST /api/g08/auth/telegram` | Validate initData and establish session |
| `GET /api/g08/bootstrap` | Capabilities, profile preferences, resumable runs, entitlement summary |
| `GET /api/g08/content` | Versioned public catalogue and hashes |
| `POST /api/g08/runs` | Create server-bound run from certified shift |
| `GET /api/g08/runs/{runId}` | Owner-only current canonical state and receipts needed for recovery |
| `POST /api/g08/runs/{runId}/commands` | Validate and atomically apply an ordered command or bounded batch |
| `POST /api/g08/runs/{runId}/practice-fork` | Create post-terminal continuation inheriting at least Assisted, retaining Study |
| `POST /api/g08/import-practice` | Replay a local guest branch into a new owned run |
| `GET /api/g08/rankings` | Filter by exact shift, content/rules revision, assistance; paginated |
| `POST /api/g08/purchases/invoice` | Validate SKU and create a server-priced Stars invoice link |
| `POST /api/g08/telegram/webhook` | Verify webhook origin/secret, process payments idempotently |
| `POST /api/g08/challenges` | Optional user-requested invitation creation |

Avoid a second public “submit score” route that accepts a numeric total. Completion is derived from the command stream. Protect all owner-specific routes and bound request sizes and batch lengths.

### 17.8 Rankings and optional challenges

Use one best verified score per user per exact ranking key; retain that user's successful history privately. Sort by score descending. Equal scores share the same competitive rank; a stable opaque ID may order tied rows visually without implying a speed tiebreaker. No timestamp or elapsed-time bonus.

The standalone public name defaults to a server-generated alias such as **Chef 4F2A**, not a Telegram numeric ID or automatically exposed full name. Offer ranking opt-out. If the platform supplies a reviewed public profile contract, use it instead.

A challenge link identifies a certified shift/revision and optional sender-approved score context. It does not include initData, action history, wallet address, private run IDs, or a solution. The recipient starts an independent attempt with the same conditions. Show separate assistance labels and no countdown. If the version is retired, explain this and offer ordinary free play rather than silently substituting another board.

---

## 18. Cosmetics, Stars, and optional wallet features

### 18.1 Products

| SKU | Default price | Delivery | Restrictions |
|---|---:|---|---|
| `g08_station_crockery_v1` | 75 Stars (`XTR`) | Constellation Porcelain station trim, plate pattern, result border | One active ownership entitlement; purely cosmetic |
| `g08_support_once_v1` | 25 Stars (`XTR`) | A one-time development support acknowledgement | No gameplay, ranking, XP, ingredient, or wallet benefit; non-recurring |

The source's 75-Star proposed price is adopted as the default release configuration. The 25-Star support price is a new explicit product default, not a source requirement or Telegram rule. Prices live in the authoritative product catalogue and must be reviewed before launch. A later price change does not alter rules or existing ownership.

The support purchase is a separate fixed-price Stars invoice, **not** a tip field, subscription, investment, charitable claim, or promised future feature. Telegram Stars invoices do not support `max_tip_amount`/`suggested_tip_amounts` as a tipping mechanism.

### 18.2 Store UX

Offer a side-by-side free/premium board preview with exactly the same ingredient positions and readable overlays. Allow preview without buying. Explain **Appearance only. No gameplay advantage.** before opening the invoice.

The store lives in the hub/Profile, not inside the failure recovery sequence. Purchases are never suggested by a low-freshness warning or insufficient-turn result. No fake sale countdown, artificial scarcity, paid rescue copy, or premium padlock over a gameplay action.

Owned users see **Owned** and can freely toggle default/premium. Pending orders show status and a reconciliation action, not a second charge button. A support acknowledgement is not a competitive badge.

### 18.3 Stars payment contract

Digital goods sold inside Telegram must use Telegram Stars, currency `XTR`. TON, external crypto checkout, or an ordinary fiat checkout cannot replace Stars for this in-app cosmetic.

1. Client asks the authenticated backend for an invoice for a known SKU.
2. Under an atomic per-buyer/SKU checkout lock, server creates or reuses one pending purchase order with buyer, fixed catalogue amount, currency, SKU, and opaque invoice payload. Both one-time SKUs use this coordination, not only the cosmetic.
3. Create the invoice/link with exactly one Stars price line and the official parameters. Never accept a price from the client.
4. Open the Telegram invoice UI. Treat its close status as presentation information only.
5. On `pre_checkout_query`, validate buyer, payload, SKU availability, the order's fixed amount/currency, and duplicate-ownership/checkout constraints under the same serialization boundary; answer within Telegram's 10-second requirement. Only one distinct checkout may be approved for the active one-time purchase. Repeated delivery of the same pre-checkout query reuses its recorded answer.
6. **Do not fulfill on pre-checkout approval or `invoiceClosed: paid`.** Fulfill only after a verified Bot API `successful_payment` event.
7. Persist `telegram_payment_charge_id` and apply the entitlement transactionally and idempotently. Duplicate updates cannot grant or charge twice.
8. Notify/reconcile the client from authoritative entitlement state. If the app was closed, deliver ownership on the next bootstrap.

Protect webhook processing using the official secret/origin validation mechanisms supported by the chosen deployment. A client POST with a charge ID is not payment proof.

An already-open checkout is reused or shown as pending rather than creating another chargeable invoice. A browser cancellation does not release an approved-but-unsettled checkout. Use a documented expiry/reconciliation policy for stale reservations; default unapproved checkout reservations may expire after 15 minutes, while approved unresolved ones require authoritative reconciliation. A later verified payment must still be processed even if its reservation/UI state expired.

Charge-ID deduplication handles repeated delivery of one payment, not two different successful payments. If distinct redundant charges nevertheless settle for the same one-time SKU, fulfill once and initiate/reconcile a compensating **full refund** of the redundant charge under the published policy. Notify the buyer and retain both ledger records. Never silently keep two payments for one delivery. A repurchase is eligible only after the earlier purchase is authoritatively refunded/revoked, not merely because the client says it requested a refund.

### 18.4 Purchase state machine

Typical observed path: `created → invoice_open → pending → paid_verified → fulfilled`.

Alternative states: `cancelled`, `failed`, `expired`, `refund_pending`, `refunded`. `invoice_open` and `pending` are optional UI observations, not prerequisites for payment acceptance. A verified `successful_payment` may transition an existing unpaid order directly to `paid_verified` and fulfillment, including after the client closed or a nonauthoritative cancellation/expiry was displayed. Keep payment facts separate from the most recent UI status. Refund and redundant-charge handling remain idempotent.

No payment state changes turn count, ring contents, freshness, assistance, queue, orders, or score. Enabling a newly purchased skin mid-run is a presentation-only change and must pass an identical gameplay-state hash check.

### 18.5 Refunds and support

Support must handle `/paysupport` and provide a reachable human/operational support channel with published purchase terms, privacy information, and refund policy. Obtain required agreement before purchase. Do not deploy a payment button pointing to a nonexistent support contact.

`refundStarPayment` uses the user ID and Telegram payment charge ID and does not accept a partial-refund amount. Implement full-purchase refund behavior unless Telegram introduces a separately documented supported mechanism.

On authoritative refund confirmation, revoke only the corresponding active entitlement and restore free crockery if selected. Preserve every run, completion, score, and unrelated purchase. Duplicate refund events are harmless. A refunded support purchase loses its acknowledgement without erasing game history.

Reconcile paid-but-undelivered purchases, duplicate/out-of-order updates, and pending refunds. Use official transaction history where appropriate and retain an auditable ledger. If a payment succeeded but local fulfillment failed, show **Payment received; restoring your item**, not a prompt to pay again.

### 18.6 Optional TON verification

If supplied by the platform, expose wallet verification in Profile only. Use TON Connect and validate a fresh, single-use `ton_proof` challenge server-side, bound to the authenticated user, domain, address, and permitted timestamp. A connected address alone is not proof of ownership.

No cooking operation signs a blockchain transaction. No wallet is required to start, save, replay, buy crockery with Stars, or rank a shift. Cancelled, unsupported, or failed wallet flows leave all game state intact. Never ask for a seed phrase or private key.

Follow current Telegram blockchain guidelines and official TON Connect documentation at implementation time. Do not introduce another chain or crypto purchase path under the label “verification.”

---

## 19. Security, privacy, and abuse resistance

### 19.1 Trust boundaries

The browser is untrusted for identity, scores, entitlements, and saved-state claims. Public content and a deterministic engine make the puzzle inspectable; hiding JavaScript is not an anti-cheat strategy.

Server replay establishes that a result is possible under the submitted legal actions. It does **not** prove that the player thought unaided, avoided external solutions, or did not use a solver. The Assisted label accurately records use of in-product assistance, not an unverifiable psychological claim. Do not attach money, scarce assets, or financial rewards to these rankings.

### 19.2 Required protections

- HTTPS for production; secure secret storage; no bot token, database credential, or payment secret in browser bundles, image prompts, source control, analytics, or screenshots.
- Validate every request with strict schemas, known enum values, bounded strings, integer ranges, and bounded batch sizes.
- Authorize ownership of runs, imports, receipts, purchases, and profile operations on every relevant route. Opaque IDs alone are not authorization.
- Parameterized database access; output encoding; safe structured rendering of translated text. Avoid raw HTML injection from remote content or Telegram profile fields.
- CSRF protection appropriate to the session transport; secure cookie flags where cookies are used; explicit CORS allowlists.
- A restrictive Content Security Policy covering the exact official Telegram script/origins and application services required by the launch mode. No blanket wildcard or `unsafe-eval` to make a build error disappear.
- Webhook secret validation, replay-safe payment processing, and rate limiting separate from ordinary player actions.
- Do not accept arbitrary remote URLs for server-side asset fetching, avatar fetching, share previews, or image generation. Build assets at development time from reviewed sources.
- Disable development authentication bypasses, fake entitlements, debug score mutation, and reset endpoints in production. Test that production configuration refuses to enable them.
- Record operational errors without raw initData, authorization headers, full payment payloads, wallet proofs, or private action exports.

### 19.3 Abuse controls without gameplay punishment

Apply reasonable per-account/IP command rate limits and body-size limits at the API edge. Allow normal rapid deliberate use and a complete short shift without throttling; use measured limits rather than pretending a low server capacity is a game rule. A rate-limited command is rejected without spending a turn and can be retried with the same action ID.

Bound batch size, outstanding operations, anonymous import size, and expensive validation/search work. Keep the content solver out of an unbounded public endpoint. A forged result is rejected; do not mutate the user's board to “punish” it. Investigate anomalous patterns before banning a legitimate player whose network duplicated requests.

### 19.4 Data inventory

| Data | Purpose | Default handling |
|---|---|---|
| Telegram/platform identity mapping | Authentication and ownership | Server-only stable identifier; not exposed as a public rank name |
| Preferences | Language, accessibility, audio, cosmetics selection | Local cache plus authenticated sync where available |
| Runs and canonical commands | Recovery and result verification | Owner-only; retain required replay evidence |
| Terminal result certificates | Rankings and completion evidence | Private details; only approved public summary appears in rankings |
| Distinct-shift completion set | 1/5/15 milestones | Minimal per-user shift identifiers and completion metadata |
| Purchase ledger | Delivery, reconciliation, refunds, legal accounting | Restricted service access; no public exposure |
| Optional analytics | Product quality and usability | Pseudonymous and minimized; no raw Telegram profile content |
| Optional wallet proof result | Profile ownership verification | Only if capability is explicitly enabled; no secrets or seed phrases |

### 19.5 Retention, deletion, and public identity

Default operational request logs expire after 30 days; pseudonymous product-event data after 90 days, unless a reviewed operational requirement specifies otherwise. Keep active saved runs and compact replay evidence for retained account progress. Payment/accounting retention must follow the actual operating jurisdiction and published policy; do not invent a universal legal retention period.

Provide a clear account-data deletion request path and ranking opt-out. Delete or anonymize personal gameplay/profile data according to that policy, remove public rank aliases where required, and retain only the minimum legally necessary restricted payment records. Explain any legally required retention. In-app **Reset shift** is not account deletion.

Do not automatically publish Telegram names, profile photos, contacts, wallet addresses, or payment history. Challenge sharing must be a deliberate user action and include only approved content. QA captures use synthetic accounts and fixtures; redact personal information before sharing evidence externally.

### 19.6 Dependency and asset security

Use a committed lockfile, license checks, dependency audit, and reviewed update policy. Sanitize/validate downloaded media with trusted local tooling; strip unnecessary metadata from runtime exports. Keep source/terms records, but do not ship private generation-service request IDs or account metadata inside public assets.

The agent may not bypass unavailable asset permissions, scrape copyrighted recordings from videos, or embed an unauthorized font because it looks close to the mockup. A rights problem is a blocked asset, not a reason to omit the license manifest.

---

## 20. Performance and delivery budgets

### 20.1 Reference environment

Baseline reference classes: an Android phone comparable to a 4 GB Samsung Galaxy A13-class device, and an iPhone 11-class device, each running a supported OS and current available Telegram client. Also test current desktop Telegram and ordinary desktop Chrome/Safari-class browsers.

Record exact physical device, OS, Telegram/browser build, network profile, and application build in results. These are test targets; no hardware benchmarks were performed for this documentation deliverable. Do not replace physical WebView testing with a claim based only on a powerful developer laptop.

### 20.2 Runtime targets

| Metric | Target / interpretation |
|---|---|
| Pure logical turn | Under 50 ms p95 on reference device, including state derivation but excluding network/animation |
| Local action feedback | Visible within 100 ms of deliberate input p95; acknowledged network state is a separate metric |
| Rotation animation | Target 60 fps; no sustained collapse below 30 fps on reference devices |
| First usable cached shell | Target under 1 second when local assets are available |
| Cold first usable board | Target under 2.5 seconds on a documented 10 Mbps / 100 ms RTT test profile with warm server |
| Command API | Target under 300 ms p95 server response in-region under the declared launch load, excluding external payment operations |
| Idle activity | No continuous game simulation or animation loop; negligible work while hidden |
| Application JS heap | Target below 64 MiB after a normal five-minute session; investigate growth over repeated shifts |
| Decoded raster assets | Target below 32 MiB simultaneously resident for the game's managed images |
| Decoded audio | Target below 24 MiB; lazy-load optional music/ambience |
| Layout stability | No control displacement from late font/image loading; reserve image dimensions |

The memory budgets describe the application's allocations, not the total Telegram process footprint. Report measurement limitations rather than claiming unsupported cross-process precision.

### 20.3 Transfer budgets

| Delivery group | Compressed/network budget |
|---|---:|
| Initial application JavaScript | At most 250 KiB gzip/Brotli-equivalent transfer target |
| Initial CSS and critical content/localization | At most 120 KiB combined |
| Initial self-hosted font resources | At most 180 KiB for actually needed subsets |
| Initial board graphics and lightweight shell art | At most 750 KiB |
| Complete first playable cold payload | At most 1.5 MiB, excluding optional audio and deferred store/results art |
| All event SFX | At most 700 KiB runtime exports, loaded after user interaction/as needed |
| Optional music plus ambience | At most 1.2 MiB combined compressed runtime alternatives actually selected |
| Full normal runtime asset/content cache | Target at most 6 MiB; source masters excluded |

Optimize measured bottlenecks rather than lowering image quality blindly. Do not include both every PNG fallback and every WebP variant in the initial preload. Cache immutable hashed assets with long-lived caching; serve a small versioned manifest. HTML/bootstrap/API responses use an appropriate freshness policy and must not leak one user's response into another user's cache.

### 20.4 Loading and degraded states

Load the minimum board, rules, active locale, and required ingredient sprites first. The next shift's small content may be prefetched after readiness. Do not block the first move on premium frames, music, all Miro poses, or a leaderboard request.

An image load failure must preserve a named, shaped/textual fallback and usable controls, while reporting an asset error. That fallback is resilience, not acceptable final art for release. Failed optional audio remains silent. Failed ranking/purchase services do not break a local kitchen shift.

Display useful retry/recovery UI when initial data cannot load within a bounded timeout. A command transport timeout means **unknown acknowledgement**, not automatic failure: retain and retry the same action ID. Use bounded exponential retry with jitter and a maximum interval, and allow manual retry. Retry timers never advance gameplay.

### 20.5 Build and hosting

Serve the Mini App over HTTPS with compression and immutable asset hashes. Run database migrations safely before enabling a compatible build. Separate development/staging/production configuration and payment identities. Keep health/readiness endpoints distinct from gameplay success checks.

Use a single modest application service and managed PostgreSQL initially; do not require Redis, a distributed game server, WebSockets, or Kubernetes without measured need. The launch load test should declare its scope, with a baseline exercise of 100 simulated active sessions and approximately 50 valid commands per second plus retries. This is a test target, not a claimed live capacity or SLA.

Back up durable data and test restoration of runs, receipts, entitlements, and replay evidence. A database restore that loses the payment deduplication ledger is not a successful recovery.

---

## 21. QA, acceptance tests, and research gates

### 21.1 Test hierarchy

1. **Rules unit tests:** legality, exact transitions, statuses, scoring, terminal precedence.
2. **Property tests:** identity preservation, deterministic replay, preview equivalence, invalid-action immutability, undo restoration.
3. **Content certification:** all 24 witnesses and declared special events against the production rules package.
4. **Integration tests:** ownership, revisions, duplicate actions, persistence, offline replay, concurrent devices, payment lifecycle.
5. **Browser tests:** navigation, complete shifts, warnings, keyboard/list, localization, responsive layout, failure recovery.
6. **Physical-client checks:** Telegram WebViews, safe areas, audio unlock, haptics, lifecycle, VoiceOver/TalkBack.
7. **Visual/audio/rights review:** actual exported assets, real-size readability, both themes, sound fatigue, source licenses.
8. **Observed-player study:** the source SRS's comprehension thresholds plus documented content findings.

Passing a mock-only test suite is not evidence that a real payment integration, safe-area layout, or image-generation pipeline works. Label fixture-based and real-client checks separately.

### 21.2 Original SRS acceptance coverage

| Test | Setup / action | Required outcome |
|---|---|---|
| G08-A01 | Occupy all eight slots with unique IDs; rotate | Every ID moves to `(i+1) mod 8`, exactly once; no overwrite or duplication |
| G08-A02 | Ready carrot at slot 4, freshness 2; Rotate, then Serve | After Rotate: slot 5, freshness 1. Serve succeeds before aging |
| G08-A03 | Wrong ready ingredient at slot 5; attempt Serve | Wrong-order explanation; turn, freshness, queue, orders, discards and score inputs unchanged |
| G08-A04 | Target-one ingredient at station 2; cook twice | Burnt after second Cook; Serve rejected; Discard legal; UI requires explicit destructive confirmation for second Cook |
| G08-A05 | Successful three-order run with two turns remaining and one discard | Score exactly 100; no hidden bonus |
| G08-A06 | Save, reopen, undo; retry same rotate action ID | Exact queue/cooks/freshness restored; duplicate rotate applies once |
| G08-A07 | Publish an unsolvable/invalid-witness queue; load one-order tutorial | Invalid content rejected; tutorial budget shown and no Standard rank entry |
| G08-A08 | Russian at 200% text; view next order, fail/retry | Complete next-order meaning remains available; free retry is reachable; no purchase implication |

For A05, a legal fixture uses a 24-turn empty board, orders CTC, queue CCTC, four empty rotations, `L D0`, then the S01 witness. It consumes 22 turns, discards one item, and scores 100. Do not test only the arithmetic function while ignoring gameplay-derived counts.

### 21.3 Extended mechanics and state tests

| ID | Case | Expected assertion |
|---|---|---|
| G08-T01 | New load beside pre-existing items | New item stays at 16; every surviving pre-existing item ages once |
| G08-T02 | Cook on a fresh item | Cooking increments exactly one and freshness decreases one; no freshness reset |
| G08-T03 | Ready item, freshness 1, at station 5 | Immediate matching Serve succeeds |
| G08-T04 | Ready item, freshness 1, at slot 4 | Rotate produces spoiled item at slot 5; Serve then rejected |
| G08-T05 | Empty rotation | Legal, spends one turn, cannot create an item |
| G08-T06 | Full-slot Load / empty Cook / empty Discard | All rejected without gameplay or assistance mutation |
| G08-T07 | Cook already-burnt or spoiled item | Rejected, no additional cook count or turn |
| G08-T08 | Overcook an item at freshness 1 | Becomes burnt and spoiled in the same accepted turn; both reasons displayed |
| G08-T09 | Burnt item ages to zero later | Remains one item; no auto-discard or penalty |
| G08-T10 | Consecutive identical orders | Two separate exact matching items must be served |
| G08-T11 | Last order on final allowed turn | Success wins over budget exhaustion |
| G08-T12 | Final turn without final order | Incomplete; subsequent gameplay actions rejected |
| G08-T13 | Successful run with leftovers/queue | Succeeds without cleanup; no invented leftover penalty |
| G08-T14 | Discard fresh, ready, burnt, spoiled items | Each accepted removal adds one turn and one discard only |
| G08-T15 | Multiple items reach zero in one action | All statuses update correctly; warning output is coalesced, not incomplete |
| G08-T16 | Undo Load/Cook/Rotate/Serve/Discard | Full pre-action gameplay snapshot restored, not only slot positions |
| G08-T17 | Undo after a hint | Assistance remains Assisted/Study; hint event not erased |
| G08-T18 | Undo at initial state | Rejected without assistance change |
| G08-T19 | Post-terminal undo from all assistance classes, including a full solution viewed after completion | Fork assistance equals `max(parent, review floor, Assisted)`; Study never downgrades; original immutable result unchanged |
| G08-T20 | Zero-clamped successful score fixture | Never negative; input counts derived by replay |
| G08-T21 | Language/theme/skin/audio change | Canonical gameplay state hash unchanged |
| G08-T22 | Timer advances while app hidden | No gameplay field changes |
| G08-T23 | Preview each legal action | Projected state and spoil/burn warnings exactly match committed transition |
| G08-T24 | Random legal command sequences | No duplicate live IDs, out-of-range freshness/index, overwritten items, or nondeterminism |

For T11/T12, prepend eight empty rotations to S01's sixteen-turn witness to win exactly on turn 24. With nine empty rotations and only the first fifteen witness actions, turn 24 ends incomplete with the last order unserved. These fixtures check precedence without changing release content.

### 21.4 Synchronization and backend tests

| ID | Case | Expected assertion |
|---|---|---|
| G08-N01 | Same rotate ID transmitted twice | One accepted revision and one rotation |
| G08-N02 | Same ID with altered action/payload | Explicit ID-reuse rejection |
| G08-N03 | Two different IDs at one base revision | One accepted, one stale; no merged state |
| G08-N04 | ACK arrives after a newer ACK | Client never rolls back to older snapshot |
| G08-N05 | Connection drops after commit before response | Retry recovers receipt and canonical head |
| G08-N06 | Reload with pending locally persisted actions | Outbox and predicted state recover; verification remains pending |
| G08-N07 | Cache unavailable/evicted | Clear explanation; acknowledged progress recoverable; no false “saved” label |
| G08-N08 | Another user's run ID or receipt | Authorization denied without data disclosure |
| G08-N09 | Tampered score/freshness/recipe target | Ignored/rejected; server-derived rules prevail |
| G08-N10 | Expired or forged Telegram initData | Authentication rejected; existing local run not destroyed |
| G08-N11 | Version changes during run | Pinned version resumes, or explicit supported recovery shown |
| G08-N12 | Guest result import | Replay required; new server run ID and correct assistance; no direct score trust |
| G08-N13 | Duplicate result/reward notification | One ranking update and one distinct-shift completion effect |
| G08-N14 | Pending outbox bound reached | No silent dropped/unrecorded action; reconnect/local-practice choice |
| G08-N15 | Static hint opened mid-run | Opening-board disclaimer; no claim of adaptive validity; no silent reset |
| G08-N16 | Study trace viewed offline | Local assistance becomes Study immediately and survives reload/replay |
| G08-N17 | Rate-limited action retried with same ID | Temporary rejection does not finalize a permanent receipt; eventual valid retry applies once |
| G08-N18 | Account switch with a pending owned outbox | Old owner's cache stays isolated and is never uploaded as the new user's run or guest import |
| G08-N19 | Session expiry with stale launch initData | No fake renewal; preserve run and require fresh validated launch/platform refresh |
| G08-N20 | Batch transport stops after rejection, if implemented | Exact committed prefix reported; tail explicitly unprocessed and not silently rebased |
| G08-N21 | Undo a pending/offline terminal result | Local dependent fork preserved; parent verification precedes idempotent server fork creation and child replay |
| G08-N22 | Reveal a solution after a verified result, reload, then undo | Original score/classification unchanged; persisted review floor makes continuation Study |
| G08-N23 | Deviate from or undo within guided Study | Guide advances only on matching witness prefix, pauses on divergence, and resumes only at a matching prefix |

### 21.5 Payments and optional integrations

| ID | Case | Expected assertion |
|---|---|---|
| G08-P01 | Client reports invoice paid without successful-payment event | No entitlement granted |
| G08-P02 | Pre-checkout wrong user/SKU/amount/currency | Rejected within required response window |
| G08-P03 | Duplicate successful-payment update | Exactly one fulfilled purchase/entitlement |
| G08-P04 | App closes after payment | Next bootstrap restores verified entitlement |
| G08-P05 | Client cancel followed by authoritative successful payment | Payment fact reconciled and delivery occurs once |
| G08-P06 | Pending/cancelled/failed invoice during shift | Gameplay-state hash identical before and after |
| G08-P07 | Full refund processed twice | Entitlement revoked once; free skin active; progress preserved |
| G08-P08 | Paid but fulfillment transaction/outbox fails | Recoverable ledger state; reconcile without second charge |
| G08-P09 | Already-owned cosmetic purchase request | No accidental duplicate charge; clear owned state |
| G08-P10 | `/paysupport` and purchase terms | Real reachable support path and terms agreement available |
| G08-P11 | Fixed support contribution | XTR invoice, one price line, no tips/subscription fields or gameplay reward |
| G08-P12 | Wallet absent, rejected, or disconnected | Cooking, saving, Stars purchases, and progress remain usable |
| G08-P13 | Reused/expired/wrong-domain TON proof, if enabled | Verification rejected; no wallet-ownership claim |
| G08-P14 | Shared XP cap reached, if integrated | Further gameplay/replay still free and available |
| G08-P15 | Two devices request/approve invoices for one unowned one-time SKU | Atomic checkout reuse/serialization prevents duplicate approval; distinct redundant settled charges are fully refunded, not silently retained |
| G08-P16 | Verified payment with no invoice-open/pending client event | Direct authoritative transition fulfills once without depending on UI telemetry |

Use the official supported test setup or deterministic provider-event fixtures. Do not make real Stars purchases, refunds, or blockchain transactions merely to test without explicit owner authorization. Record whether each test used fixtures, a provider test environment, or an authorized live integration check.

### 21.6 UI, art, sound, and localization matrix

Test at least: 320×568, 360×740, 390×844, 430×932, a short landscape viewport, and a desktop viewport; light/dark; normal/200% text; EN/RU; default/premium; ring/list; reduced motion on/off; sound enabled/muted; online/offline/pending conflict.

Specific checks:

- No station label or number is covered by Miro or an effect.
- Queue drawer reveals the entire sequence and never consumes a turn.
- All three orders remain understandable when Russian names wrap.
- Ring/list layout shows identical state and legal actions.
- All controls work with keyboard and screen reader without hover or drag.
- The eight-slot accessible order remains stable after rotations.
- No live-region storm from eight freshness decrements or duplicate acknowledgements.
- No SVG stand-ins, emoji-only ingredient identity, development placeholders, or inconsistent generated food states remain in final assets.
- No alpha fringes on dark/light surfaces; no low-resolution master improperly stretched.
- Every declared visual/audio asset has a runtime reference or an explicit retained-source purpose; no missing files or accidental unlicensed bundle extras.
- Audio unlock failure is silent and harmless; backgrounding suspends sound; duplicate events do not duplicate effects.
- All sounds are comfortable at low volume and on phone speakers; burn and spoil are distinguishable without being punitive.
- Complete/incomplete illustrations and music do not prolong navigation or delay retry.
- Price and ownership language agree with authoritative server state in both locales.

### 21.7 Observed-player validation

Recruit twelve participants spanning casual puzzle players, optimization-oriented players, and people without cooking-game familiarity. Do not present this document's solutions before the comprehension test. Use a consistent, neutral moderator script and record assistance provided.

Mandatory source thresholds:

- At least **9 of 12** participants explain or demonstrate that one rotation moves **all** ingredients while stations stay still.
- At least **8 of 12** notice a relevant ingredient approaching spoilage **before** it spoils, without the moderator explaining the warning.

Observe T01/T02 for rotary comprehension and a relevant freshness case such as T04/S09 for warning comprehension. Do not count noticing an already-spoiled starting item as anticipating spoilage. Do not count a warning about S07's optional spare as proof the player understood an endangered required order.

Also record:

- Whether players distinguish a turn from a rotation and from elapsed time.
- Whether the full queue is found without instruction.
- Whether target-two cooking and ready/undercooked/wrong-order states are understood.
- Whether people discover pipeline play rather than always completing one dish in isolation.
- Whether tight seeded shifts feel explainable rather than arbitrary.
- Time to first service, active planning time, completion time, invalid-action reasons, hint use, and voluntary retry.
- Comfort of visual density, generated art, sounds, and Russian text.

If the source thresholds fail, improve previews, labels, teaching, or layout and repeat the study with documented participant familiarity. Do not add a paid rescue, weaken tests, or claim the same heavily coached participants establish first-time comprehension. Changes to gameplay/content require new versioned certificates.

No study was performed during this documentation task. Do not write fabricated quotes, participant counts, retention figures, or commercial-success claims into the implementation handoff.

### 21.8 Release-blocking defects

Any incorrect aging, lost/duplicated item, duplicate charge, false entitlement, lost acknowledged progress, unverified ranked score, unsolvable published content, inaccessible essential action, unreadable freshness, unauthorized asset, or payment-related gameplay advantage blocks release.

Small decorative differences may be deferred only if documented and they do not leave a required manifest asset missing. Do not call a prototype “complete” by reclassifying core defects as polish.

---

## 22. Analytics and operational observability

### 22.1 Product events

Collect only information needed to assess clarity and reliability. Suggested event names:

| Event | Essential properties, excluding personal payloads |
|---|---|
| `g08_shift_started` | Shift/revisions, mode, entry source, guest/authenticated, locale, layout |
| `g08_action_accepted` | Action kind, turn, local/server latency bucket; server metrics may replace per-action product telemetry |
| `g08_action_rejected` | Stable reason code, station/action, turn; no raw request secrets |
| `g08_queue_opened` | Shift, turn, layout |
| `g08_preview_used` | Preview type, shift, turn |
| `g08_hint_revealed` | Tier, shift, assistance transition, starting-board/mid-run |
| `g08_undo_used` | Shift, current turn, active/post-terminal fork |
| `g08_shift_finished` | Verified outcome, turns, discards, assistance, mode, score if successful |
| `g08_sync_issue` | Timeout/conflict/storage error/version issue, retry count bucket |
| `g08_layout_changed` | Ring/list, user/automatic, text-size category |
| `g08_purchase_state` | SKU, non-sensitive state, provider/test environment marker |
| `g08_asset_failure` | Manifest ID, build/content version, failure category |

Operational elapsed times are allowed for usability/performance measurement, never for scoring or freshness. Analytics disabled/unavailable must not block play, saving, milestones, or purchases. Avoid duplicating telemetry already provided by a real shared platform.

### 22.2 Useful product questions

- Where do players repeatedly try to serve the wrong order?
- Does the freshness preview reduce preventable spoilage of required ingredients?
- Are T05/B05 teaching discard as an option rather than falsely requiring it?
- Do S04/S09/S11/S12 produce understandable experimentation or opaque frustration?
- Is queue visibility adequate on small screens and in Russian?
- Does the list layout support completion rather than merely displaying a static summary?
- Does a purchase/refund ever correlate with a changed game-state hash?

Do not optimize for artificial session extension, failure-driven purchase conversion, or compulsive daily return. A satisfying three-minute session is a success even when the player closes the app afterward.

### 22.3 Operational signals

Monitor command error rate and latency, stale-revision conflicts, duplicate receipts, database transaction failures, content-certification failures, asset load errors, replay mismatches, webhook failures, pre-checkout response latency, paid-but-unfulfilled orders, and refund reconciliation failures.

Use correlation IDs that do not reveal Telegram IDs. Preserve enough event context to diagnose a versioned rules failure without logging a raw authenticated request. Alert immediately on verified payment without eventual entitlement, replay divergence, or loss of acknowledged state. Do not page an operator merely because a player legitimately spoils food.

### 22.4 Operational controls

Provide server-side capability switches to disable new purchases, hide an unavailable optional integration, or stop new ranked starts for a defective content revision. Existing free practice must remain available where safe. These switches must not rewrite a run's rules or pretend an unavailable service is functioning.

Document rollback, database restoration, payment reconciliation, content retirement, and account-deletion procedures. A deploy rollback must preserve compatibility with any states already acknowledged by the newer build, or require an explicit migration plan.

---

## 23. Implementation sequence and deliverables

### 23.1 Work order for the implementation agent

The agent should execute the following sequence autonomously within authorized access, keeping unresolved external dependencies visible. This is not permission to deploy or spend money without the owner's authorization.

| Milestone | Work | Exit evidence |
|---|---|---|
| M0 — Contract and environment | Read this document and any actual Platform SRS; map adapters; inspect current dependencies, Telegram credentials/configuration needs, image MCP and asset terms | Written contract/dependency checklist; no invented services; reproducible local setup |
| M1 — Deterministic kernel | Implement rule/state module, action validation, preview, scoring, undo semantics | Unit/property tests, boundary fixtures, shared client/server replay agreement |
| M2 — Certified content | Encode all 24 configurations, hints, locale IDs, witnesses; build certification tool | 24 passing certificates with expected metrics/events and content hashes |
| M3 — Functional vertical slice | Build T01→T02→result with accessible DOM board/list and genuine persistence | Browser completion, reload/retry/duplicate-action tests, correct safe local fallback |
| M4 — Complete UX | All screens, tutorial progression, queue/inspector, warnings, history, hints/Study, milestones, ranking partitions | All normal/error/empty/offline states; EN/RU layouts and keyboard completion |
| M5 — Final art and sound | Generate/process all manifest assets, original procedural audio, music, provenance and licenses | Contact sheets, real-size review, runtime manifests, hashes, no placeholders |
| M6 — Telegram and commerce | Real authentication, shell lifecycle, safe areas, Stars ledger/refunds/support; optional adapters only if available | Integration tests and authorized provider/client evidence; identical gameplay through purchase interruption |
| M7 — Quality and recovery | Physical devices, performance, accessibility, offline conflicts, security, backup/restore | Measured reports and resolved release-blocking issues |
| M8 — Player validation and release handoff | Twelve-participant study, revisions if needed, deployment/runbooks, owner-ready final report | Source thresholds met or honestly recorded as blocked; complete delivery checklist |

A temporary text/raster fallback during M3 is permitted for functional work; it cannot remain the claimed final M5 asset set. Do not spend most of the schedule generating decorative art before proving the eight-slot engine and content.

### 23.2 Required implementation repository outputs

- Complete web and server source with strict types and reproducible dependency lock.
- Immutable recipe/shift data, all EN/RU copy, all hint tiers, and production-engine certificates.
- Pure rules package and test fixtures sufficient to reproduce every published result.
- Runtime asset manifest, approved raster masters, optimized exports, audio masters/exports, and generation/export scripts.
- Asset provenance and third-party notices, including font and optional audio licenses.
- Database schema/migrations, initial content seed, and safe isolated development/test reset commands.
- Environment variable template containing names and descriptions only, never secret values.
- Local setup/run/test commands and a documented HTTPS Mini App deployment path.
- Telegram bot configuration instructions, authentication/session policy, webhook configuration, payment support/refund runbook.
- Automated tests, physical-device test record, accessibility checklist, performance report, and player-study summary.
- Release notes, known limitations, version/rollback policy, and operational recovery instructions.

Do not check production databases, real initData, private screenshots, wallet proofs, payment secrets, or user recordings into the repository. Synthetic fixtures must be clearly synthetic.

### 23.3 Environment and preview quality

Setup must be idempotent: install locked dependencies, prepare local configuration safely, migrate the isolated development database, and seed certified content without touching production data. Running setup twice cannot erase unrelated work or charge a payment.

The preview should start using one documented command and expose a real playable app. If an embedded-platform preview requires a development identity, scope it to local/test mode and show that state visibly. Do not bypass production Telegram authentication to make a demo appear integrated.

Provide isolated fixtures for: fresh player; partial acknowledged run; pending outbox; stale-revision conflict; all 24 shifts; default/premium/refunded entitlement; failed/pending payment; reduced-motion/large-text Russian settings. The fixtures exist to reproduce states, not to replace real runtime behavior.

### 23.4 Evidence package

Capture useful fresh evidence from the actual implemented app:

- Light gameplay at 390-pixel width with all information readable.
- Russian large-text/list layout.
- A freshness-1 valid service and a freshness-1 rotation that spoils, supported by interaction assertions.
- Full-ring rotation with stable identities.
- Verified and pending result states with itemized scoring.
- Side-by-side free/premium presentation with unchanged meaningful overlays.
- Recovery after a lost acknowledgement without duplicate rotation.

Screenshots establish appearance, not state-machine correctness. Use test assertions and, where explicitly requested, a short recording for behavior. Redact sensitive content and distinguish fixture screenshots from authorized real integration evidence.

### 23.5 No fake completion

The implementation agent must not finish with only a landing page, a static rotating illustration, random sample levels, generated image prompts without images, sound placeholders, fake payment buttons, client-trusted scores, or a mocked leaderboard presented as real.

If image generation, deployment credentials, live payment testing, the Platform SRS, native-speaker review, or participant recruitment is unavailable, complete the unblocked work and list the exact remaining dependency. Do not invent results. Use the completion wording in section 24 rather than saying “everything is finished” without the evidence.

---

## 24. Definition of done and handoff contract

### 24.1 Functional completeness

- [ ] All 24 defined shifts are present, free, and versioned; counts are exactly 6/6/12.
- [ ] Every shift's production certificate matches the witness metrics or an explicitly versioned approved replacement.
- [ ] Ring rotation, station actions, freshness, burning, spoilage, scoring, and final-turn success follow the exact transition order.
- [ ] Full order and queue information, previews, item inspection, dangerous-action confirmations, and free recovery are usable.
- [ ] Undo restores all gameplay fields; assistance is sticky; terminal forks preserve original result integrity.
- [ ] All screens include loading, empty, rejected, offline, conflict, and unavailable-service states.
- [ ] Milestones and rank partitions behave as specified; Study/guest/pending records are not misrepresented.
- [ ] No excluded economy, timer, pay-to-win effect, or blockchain cooking feature has been added.

### 24.2 Presentation completeness

- [ ] All 60 visual source units and their required runtime derivatives exist and pass real-size review.
- [ ] All 20 audio assets exist, are original/properly licensed, and pass actual listening/runtime checks.
- [ ] No generated text is baked into essential UI; no SVG/emoji placeholder substitutes for the specified art.
- [ ] EN/RU copy, titles, hints, plurals, accessible names, legal/support copy, and failures are complete and reviewed.
- [ ] Ring/list, 200% text, keyboard, screen readers, contrast, safe areas, reduced motion, muted play, and both skins work.
- [ ] The visual design feels like one intentional game, not unrelated generated assets assembled together.

### 24.3 Engineering completeness

- [ ] Authentication and ownership are enforced server-side.
- [ ] Acknowledged state survives close/reopen and recovery; duplicate actions have exactly-once effects.
- [ ] Offline predictions are clearly distinguished from verified state and reconcile without silent branch loss.
- [ ] Scores and entitlements are server-derived; payments/refunds are idempotent and never change gameplay.
- [ ] All build, type, unit, property, content, integration, and browser checks pass.
- [ ] Physical-client, accessibility, performance, security, and backup/restore evidence is recorded.
- [ ] No secrets or unauthorized media are shipped; provenance and licenses are complete.
- [ ] Setup, deployment, support, refund, rollback, migration, and recovery instructions are executable and current.

### 24.4 Human and external gates

- [ ] The supplied real Platform SRS is reconciled if claiming marketplace integration; otherwise the build is explicitly standalone.
- [ ] Production Telegram bot/domain/session configuration is verified in authorized target clients.
- [ ] Stars terms, support channel, merchant configuration, and authorized integration verification are complete before accepting real money.
- [ ] English/Russian editorial review is complete.
- [ ] Observed-player thresholds of 9/12 rotary comprehension and 8/12 anticipatory freshness comprehension are met, with honest evidence.
- [ ] Any optional TON/challenge capability is either correctly implemented and tested or clearly disabled without impacting play.

These gates may require real people or owner-controlled credentials. An agent cannot truthfully replace them with simulated claims. Missing authorization is a stated dependency, not permission to bypass a platform control.

### 24.5 Required final implementation report

The future implementation agent's final report should state:

1. What was delivered and the exact build/content/rules versions.
2. Which automated and manual checks passed, with evidence links.
3. How to run the app and where the authorized preview/deployment is available.
4. Whether it is standalone-ready, marketplace-integrated, or production-ready.
5. Any unmet external gate, known limitation, or disabled optional capability.

Use **“Implementation complete; production release blocked by [specific gate]”** if appropriate. Use **“Production-ready”** only when every applicable release gate has evidence. Do not equate writing tests with running them, generating a file with inspecting it, or opening an invoice with delivering a paid item.

### 24.6 Status of this specification itself

This document completes the requested documentation phase. It defines the production work; it does not claim that the future build, graphics, audio, Telegram integration, payments, accessibility certification, or player study already exist.

Documentation preparation included source-SRS review, current primary-reference research, explicit rule/contract decisions, authored EN/RU content, two independent mechanical checks of all 24 reference traces, and contrast arithmetic for the principal token pairs. The independent content check parsed the delivered tables and verified every listed metric plus the S07/S08 special events. Those checks reduce ambiguity but do not replace testing the implemented product.

---

## 25. Source traceability, decisions, and references

### 25.1 Source requirement mapping

| Source requirement | Master specification coverage |
|---|---|
| Vision: visible coupled scheduling, one player, calm 3–5 minute sessions | §§1–3, 5, 21.7 |
| 24 shifts / eight slots / three stations / one-ingredient recipes | §§2, 4, 13–14 |
| G08-F01: orders, queue, turns, freshness visible | §§5–6, 11–13, 21 |
| G08-F02: legal actions, invalid explanations, rotation/spoil previews | §§4–5, 11–12, 21.2–21.3 |
| G08-F03: action/aging order and atomic identity-preserving rotation | §§4, 14–16, 21.2–21.3 |
| G08-F04: solvable content and authoritative replay | §§13–16, 19, 21 |
| G08-F05: acknowledged persistence, exact undo, free reset preserving cosmetics | §§3, 15–16, 18, 21.4 |
| G08-F06: burn/spoil distinction and complete inspection | §§4–5, 8, 11–13, 21.3 |
| G08-F07: one-order tutorial budgets and ranking exclusion | §§3–4, 13–14, 17.8, 21.2 |
| G08-F08: itemized results and free next/retry/exit, no paid rescue | §§3, 6, 12, 18, 21 |
| Accessibility, reduced motion, 390 px layout, 200% text/list | §§5–7, 11–12, 17, 21.6 |
| Content IDs, hints, unique item IDs, revisions, deduplicated actions | §§13–16 |
| Mastery 1/5/15; shared XP caps do not cap play | §§3, 17.6, 21.5 |
| 50 ms logical turn / 100 ms local feedback targets | §20 |
| Cosmetic 75-Star set, optional support, no paid advantage | §§2, 7–8, 18–19 |
| Optional TON only in Profile; refunds preserve progress | §§17–18, 21.5 |
| EN/RU sample meanings, distinct turn/rotation keys, plurals | §12; all titles/hints in §13 |
| Original acceptance tests G08-A01–A08 | §21.2 |
| Player comprehension gates and opaque-sequence risk | §§13.7, 21.7, 24 |

### 25.2 Explicit resolutions and additions

| Decision | Reason / scope |
|---|---|
| Telegram Mini App is the primary destination | Commissioning brief plus Stars/Profile context; browser guest mode is a fallback, not a separate product |
| Fixed four-ingredient catalogue | Makes the source's one-ingredient target-1/2 rules concrete without adding assembly complexity |
| Preloaded states may be cooked, burnt, spoiled, or partially fresh | Source already requires explicit initial ring states; disclosed values create varied solvable shifts without new rules |
| Burnt and spoiled flags can coexist | Removes ambiguity around continued aging of burnt items |
| Leftovers/queue entries do not block success | Preserves the source's completion condition and avoids inventing a waste penalty |
| Ready-item Cook is legal and destructive with UI confirmation | Required by the source's overcook acceptance test; distinguishes legality from advisable play |
| Hints describe the original board, not arbitrary current states | Provides correct bounded help without pretending a static trace is an adaptive solver |
| Assistance is sticky within an attempt | Prevents undo from erasing disclosure history |
| Post-terminal undo inherits at least Assisted and retains Study | Preserves immutable verified results and disclosure classification while keeping free practice recovery |
| All shifts selectable; mastery counts assisted/study completion | Free access and learning-focused badges, not a hidden skill gate |
| Study is personal and unranked; Unassisted/Assisted separate | Keeps full reveals out of ordinary ranking while preserving source assistance partitions |
| 75-Star cosmetic and 25-Star fixed support default | First adopts the source proposal; second supplies an explicit configurable missing support price |
| No standalone XP amount | Missing shared-platform economy must not be fabricated |
| Raster art and original procedural audio | Matches commissioning brief, provides a complete acquisition path, avoids SVG placeholders and unverified sound licenses |
| No runtime solver required for hints | Offline certification and static beginning-of-shift guidance satisfy the baseline; adaptive advice would be a separately scoped feature |
| Backend/stack/API names are defaults, not existing marketplace facts | The shared Platform SRS was not supplied |

### 25.3 Reference register

External references were consulted on **15 September 2026**. They establish platform/licensing/accessibility facts, not proof of implementation success. Re-check version-sensitive requirements when building and before production release. Public pages can change; retain relevant acquisition-time license files and exact dependency versions.

| ID | Source | Relevance |
|---|---|---|
| R01 | Supplied `08_Orbit_Kitchen_SRS.md`, SG-G08 v1.0, 8 September 2026 | Primary gameplay/product requirements; preserved throughout this document |
| R02 | Referenced `00_Stark_Games_Marketplace_SRS.md` — **not supplied** | Unverified shared contract dependency; no invented interface claims |
| R03 | Telegram Mini Apps: <https://core.telegram.org/bots/webapps> | Bridge, safe areas, stable viewport, BackButton, themes, storage, initData validation, haptics |
| R04 | Telegram Stars digital goods guide: <https://core.telegram.org/bots/payments-stars> | XTR requirement, delivery, payment support, digital-goods payment flow |
| R05 | Telegram Bot API: <https://core.telegram.org/bots/api#createinvoicelink>, <https://core.telegram.org/bots/api#answerprecheckoutquery>, <https://core.telegram.org/bots/api#successfulpayment>, <https://core.telegram.org/bots/api#refundstarpayment>, <https://core.telegram.org/bots/api#getstartransactions> | Invoice shape, ten-second pre-checkout response, authoritative payment facts, refund/reconciliation APIs |
| R06 | Telegram Bot Developer Terms: <https://telegram.org/tos/bot-developers> | Merchant obligations, terms, payment/support responsibilities |
| R07 | WCAG 2.2: <https://www.w3.org/TR/WCAG22/>; target sizing: <https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html>; contrast: <https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html> | Accessibility criteria and distinction between AA minimum and larger product targets |
| R08 | MDN Web Audio best practices: <https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices>; autoplay: <https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay> | User-gesture unlock, sound generation, decoding, playback failure handling |
| R09 | Kenney Interface Sounds: <https://kenney.nl/assets/interface-sounds> | Optional official downloadable UI-sound source; no archive audition claimed |
| R10 | Kenney licensing/support: <https://kenney.nl/support> | Publisher's CC0/commercial-use statement and logo/attribution guidance |
| R11 | Freesound FAQ: <https://freesound.org/help/faq/>; CC0: <https://creativecommons.org/publicdomain/zero/1.0/deed.en>, <https://creativecommons.org/publicdomain/zero/1.0/legalcode.en> | Per-file license review; CC0 scope and limitations |
| R12 | Manrope: <https://fonts.google.com/specimen/Manrope>; license: <https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt> | Typeface source and SIL Open Font License 1.1 |
| R13 | Node.js release schedule: <https://nodejs.org/en/about/previous-releases> | Supported LTS runtime selection; Node 24 baseline |
| R14 | Telegram blockchain guidelines: <https://core.telegram.org/bots/blockchain-guidelines> | Optional wallet integration boundaries and compliance |
| R15 | TON Connect connection/proof specification: <https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md> | Wallet proof challenge and verification contract |
| R16 | Python standard-library WAV support: <https://docs.python.org/3/library/wave.html> | One dependency-light option for reproducible PCM effect export |

The source SRS mentions its own R07/R10 references without supplying their bibliography. The register above is local to this master specification and must not be mistaken for those missing original entries.

### 25.4 Final instruction to the implementation agent

Build the complete calm scheduling game specified here. Keep the mechanics exact, the information visible, the assets coherent, the sound original or cleared, the recovery free, and the payment system honest. Validate what you build with the actual runtime and target clients. If something external is unavailable, say precisely what remains rather than inventing it.

The desired final player impression is simple: **“A tiny kitchen, a clear plan, and everything arriving just where it should.”**

---

**End of Master Game Development Specification.**
