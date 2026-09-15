# Museum of Almost — Master Game Development Specification

**A small intervention. A whole world that makes sense.**

| Document field | Value |
|---|---|
| Product ID | SG-G10 |
| English title | Museum of Almost |
| Russian title | Музей почти верного |
| Document version | 1.0 — 15 September 2026 |
| Document language | English; player-facing launch content in English and Russian |
| Product | A portrait-first Telegram Mini App; browser preview and accessible desktop support |
| Experience | Solo, untimed causal-repair puzzles; approximately 2–4 minutes per exhibit |
| Launch scope | 24 authored exhibits, three collections, six interactive objects and four local rule cards per exhibit |
| Deliverable type | Specification only. This document does not constitute a game implementation. |
| Status | Complete design baseline for implementation; human, device, legal and production release gates remain mandatory |
| Primary source | *Museum of Almost — Software Requirements Specification*, SG-G10 v1.0, 8 September 2026, supplied by the product owner |

---

## Contents

1. [Document authority and implementation contract](#1-document-authority-and-implementation-contract)
2. [The game we are making](#2-the-game-we-are-making)
3. [Scope, progression and player promises](#3-scope-progression-and-player-promises)
4. [Exact puzzle and scoring model](#4-exact-puzzle-and-scoring-model)
5. [Player journey and interaction design](#5-player-journey-and-interaction-design)
6. [Screen-by-screen specification](#6-screen-by-screen-specification)
7. [Visual direction and design-system contract](#7-visual-direction-and-design-system-contract)
8. [Asset production and MCP image-generation brief](#8-asset-production-and-mcp-image-generation-brief)
9. [Audio, animation and haptics](#9-audio-animation-and-haptics)
10. [Complete launch exhibit catalogue](#10-complete-launch-exhibit-catalogue)
11. [Content data, validation and publishing](#11-content-data-validation-and-publishing)
12. [Application architecture and persistence](#12-application-architecture-and-persistence)
13. [Telegram, payments and platform boundaries](#13-telegram-payments-and-platform-boundaries)
14. [Localization and accessibility](#14-localization-and-accessibility)
15. [Performance, security, privacy and operations](#15-performance-security-privacy-and-operations)
16. [Verification and release acceptance](#16-verification-and-release-acceptance)
17. [Delivery sequence and definition of done](#17-delivery-sequence-and-definition-of-done)
18. [External references and rights policy](#18-external-references-and-rights-policy)
19. [Portable brief for a separate design AI](#19-portable-brief-for-a-separate-design-ai)

---

## 1. Document authority and implementation contract

### 1.1 How the implementation agent must use this document

This is one self-contained production brief, not a mood board or a request to improvise a game loosely inspired by a concept. Build the specified experience, content, tools, assets, persistence and verification. Do not substitute a generic spot-the-difference game, a physics sandbox, a quiz, a match game or a collection of static screenshots.

**MUST** is a release requirement. **SHOULD** is the default unless a documented, tested equivalent is better. **MAY** denotes an optional enhancement that must not delay or compromise the required product. All features listed as launch scope are required; phase boundaries later in this document are work order, not permission to ship a six-exhibit substitute.

The implementation agent may choose maintainable internal code organization and compatible library versions. It may not silently reduce the catalogue, remove the alternate object interface, monetize assistance, change the repair model or replace final raster artwork with programmer placeholders.

There are three distinct completion claims:

- **Implementation complete:** required code, authored content, final asset exports, migrations, automated verification and operating documentation exist and pass their executable checks.
- **Release candidate:** the actual deployed candidate has passed the named device, editorial, accessibility, rights and payment checks that can be performed with available people and credentials.
- **Launch approved:** the owner has accepted the remaining human and operational gates. An agent must not claim observed user research or production payments were verified if they were not.

### 1.2 Relationship to the supplied SRS

Preserve all G10-F01–F08 requirements and G10-A01–A07 acceptance cases. This master specifies details left open by that SRS. Explicit refinements are:

1. Each launch exhibit uses **two source objects and four derived objects**, giving six interactive objects and one local transformation rule per derived object.
2. Every tested proposal changes exactly one source relative to the exhibit's immutable opening snapshot, not relative to the preceding test.
3. A recomputed world obeys its local transformation rules even when it is not the requested world. A failed repair is a **target mismatch**, not evidence that deterministic local laws stopped working.
4. Three exhibits are deliberately Open solution: L04, A05 and W06. All others are Single solution. Enumerated alternatives are binding.
5. All exhibits are free and selectable. A recommended route and optional tutorial support discovery without imposing performance locks.
6. The proposed Gallery Frame Set price is fixed at **75 Telegram Stars** for this implementation baseline. It is a one-time cosmetic product, never a gameplay requirement.

The source references `00_Stark_Games_Marketplace_SRS.md` and a reference called R07. Neither was supplied. Do not assume their contents, cite R07 as evidence, fabricate marketplace endpoints or make the game depend on an absent document. Sections 12–15 provide the standalone minimum. If a real host platform is supplied later, adapt its authenticated identity, entitlement and navigation contracts while preserving this game's semantics. Any incompatible host requirement needs an explicit recorded decision.

### 1.3 Non-negotiable product rules

- The player changes a cause, not a rendered consequence.
- There is no countdown, energy, life count, paid hint, rewarded ad, mandatory share or wallet gate.
- Failed tests cost nothing and have no score penalty.
- Every essential state and rule is available as text without inspecting artwork.
- No hidden real-world physics, randomness or artist intention determines correctness.
- A legal solution accepted by the declared model is accepted in play.
- Art, sound and animation express the model; they never override it.
- Image generation is a production tool, not a live puzzle author. Unreviewed generated puzzles never reach players.
- **No SVG artwork or SVG icon dependency.** Final visual assets are raster images; ordinary HTML/CSS layout is allowed. Do not generate a single full-screen image and pretend it is a playable interface.

## 2. The game we are making

### 2.1 The invitation

Some museums preserve things exactly as they were. This museum preserves things that are **almost as they should be**.

A paper moth refuses to settle. A tiny canal delivers its ferry to nobody. A lighthouse is much too loud, despite having no voice. Nothing is ruined. Somewhere, one ordinary setting is wrong.

The visitor is invited to restore coherence. They inspect the exhibit's four local rules, read the curator's intended arrangement, change a single control and test their idea. The satisfying moment is not a green tick appearing over an answer: it is several small consequences falling into place, followed by an explanation the player can retell.

**Player fantasy:** “I understood this peculiar little world well enough to put it right.”

**Emotional sequence:** curiosity → recognition of a mismatch → a small hypothesis → consequence → calm satisfaction. A failed hypothesis should feel informative, never humiliating.

### 2.2 Tone and identity

The museum is warm, precise and gently absurd. It takes a paper boat's comfort seriously without making the visitor feel childish. It is not spooky, broken-down, haunted, competitive or clinical.

The unseen curator speaks through short accession notes. No animated talking mascot, voice actor, branching dialogue system or lengthy lore screen is needed. Each exhibit has one amusing title, one optional curatorial sentence and one clear target. Charm belongs in the title and note; correctness belongs in literal rules and state labels.

Recurring motifs:

- An ink-blue accession number in the top-left corner of each placard.
- A small brass registration tab that moves into alignment only after verified repair.
- Paper, wood, enamel and frosted glass, with clean manufactured toy mechanisms.
- A tiny recurring paper visitor: a moth in Light, a folded parcel in Air, a paper boat or letter in Water. These are specified objects where interactive; elsewhere any motif is background decoration without a hit region or implied clue.
- The curator's final message: **“Nothing here needed to be perfect. It only needed to agree.”** / **«Здесь ничто не обязано быть идеальным. Важно, чтобы всё было согласовано.»**

Do not imply that the real player, a person or a disability needs fixing. The “almost” refers to the exhibits' arrangements.

### 2.3 Three collections

| Collection | Curatorial idea | Material and accent | Mechanical emphasis | Emotional movement |
|---|---|---|---|---|
| Light / Свет | “A place for every shadow.” / «Каждой тени — своё место.» | Cream card, frosted glass, muted gold | Opposites, branches, filters, conjunctions, protected intermediate states | Learning to read the museum |
| Air / Воздух | “Invisible things leave instructions.” / «Невидимое оставляет подсказки.» | Pale mint enamel, linen, dusty teal | Direction, routing, thresholds, merge points, alternative causes | Following an unseen influence |
| Water / Вода | “A small decision travels.” / «Маленькое решение движется дальше.» | Blue ceramic, warm timber, desaturated blue | Balance, diversion, level constraints, symptom-versus-cause choices | Connecting the whole museum |

### 2.4 What makes the game distinctive

The same exhibit has four representations of one model: the scene, object list, local rules and causal recap. Their agreement is the product. The six objects are not six places to search for a concealed answer. They are a readable miniature system.

This is not a claim of original scientific discovery or experimentally proven educational benefit. “Causal-repair puzzle” describes the interaction. Local rules intentionally simplify invented tabletop machines.

## 3. Scope, progression and player promises

### 3.1 Required and excluded scope

| Area | Required at launch | Explicitly excluded |
|---|---|---|
| Catalogue | 24 final, reviewed exhibits: L01–L08, A01–A08, W01–W08 | Random/generated-at-runtime puzzles; recolors counted as new puzzles |
| Core play | Inspect, one-source proposal, unlimited test, undo, reset, three free hint tiers, Study reveal | Direct effect editing; two-source repairs; physical simulation |
| Navigation | Foyer, collection shelf, exhibit, result, settings, cosmetic preview, private progress | Walking avatar, navigable 3D museum, multiplayer rooms |
| Access | Scene and complete object-list modes, keyboard, screen reader semantics, high contrast, reduced motion, EN/RU | Audio-only clues; gesture-only controls |
| Progress | Explored/repaired distinctions; 1/5/15 mastery; 24-exhibit closing note | Streak loss, attendance rewards, experience grind |
| Social | Optional spoiler-free challenge link and opt-in exhibit boards | Required invitations, chat access, referrals that affect scores |
| Commerce | One 75-Star cosmetic frame set; verified entitlement and refund handling | Random purchases, subscriptions, consumables, paid readability |
| Platform | Telegram launch/authentication, host-safe navigation, secure persistence | NFTs, token earnings, transaction signing, a new wallet implementation |
| Authoring | Declarative content schema, exhaustive validator, build-time editorial reports | Public upload/editor or a costly visual CMS |

No ads are part of this baseline. No notification permissions are required. A session can end after any exhibit without losing eligibility or a streak.

### 3.2 Recommended progression, not access restriction

The recommended order is Light → Air → Water and increasing accession number within a collection. All 24 are available from the shelf immediately. L01 is suggested for first-time visitors. A challenge link may open any exhibit and must offer a dismissible explanation of the one-source rule.

Approximate first-play expectations, to be measured rather than enforced:

- L01: 60–120 seconds including teaching.
- Early collection exhibits: 90–180 seconds.
- Branching, protected-target and Open solution exhibits: 2–4 minutes.
- First tour: roughly 60–90 minutes across any number of sessions. This is a planning estimate, not a retention KPI or guarantee.

Difficulty is not produced by hiding more details or punishing experiments. It comes from interpreting multiple explicit conditions, distinguishing an intermediate symptom from the target, and noticing that two valid repairs can coexist. With only two controls, exhaustive player experimentation is intentionally possible and acceptable.

### 3.3 Progress semantics

An exhibit has these account-visible states:

- **Unvisited:** no session opened.
- **In progress:** opened, without a successful repair or Study reveal.
- **Studied:** full explanation requested before the first ranked completion. Display an open-book label, not a failed stamp.
- **Repaired:** a legal solution was verified before Study, with 0–3 hint tiers. Hint-assisted repairs count as repaired.

“Explored” counts the union of Studied and Repaired. “Repaired” counts distinct exhibit IDs, once each, with a verified eligible completion. If an already repaired exhibit is later opened in Study, keep its historical repaired status and original result. Replays never overwrite that result.

Mastery is private and non-financial:

| Threshold | EN / RU title | Reward |
|---|---|---|
| 1 distinct repaired exhibit | First Alignment / Первое совпадение | Raster stamp in the private visitor card |
| 5 | A Good Eye for Causes / Внимание к причинам | Second stamp |
| 15 | Keeper of Coherence / Хранитель порядка | Third stamp |
| 24 explored | The Museum at Rest / Музей в равновесии | Final curatorial note and a free closing postcard |

No mastery reward reveals objects, improves contrast or locks content. A player who studies every exhibit can still finish their tour and see the ending. They are not given fabricated ranked scores.

### 3.4 Replay and collection presentation

The shelf shows title, accession number, solution type and progress label. Unvisited thumbnails are editorial crops that do not show a solved arrangement. Repaired scenes can be viewed in a clearly labeled “Restored view.” Opening “Practice again” restores the original corrupted state, marks the session Practice and retains the historical assistance/score record.

Use “Continue your tour” for the lowest uncompleted recommended exhibit, or the last unfinished one if it exists. When all are explored, use “Visit an exhibit.” No randomized daily challenge is required; optional sharing simply selects an existing exhibit/version.

## 4. Exact puzzle and scoring model

### 4.1 Entities and notation

An exhibit is a finite directed acyclic graph with six semantic nodes. Two are **sources** with finite allowed domains; four are **effects** computed by four total deterministic functions. An effect can depend on either source or earlier effects. The dependency graph contains no cycles, external clocks, randomness or floating-point simulation.

Let:

- `S0` = the two source values in the immutable corrupted opening state.
- `Sc` = the authored canonical source configuration.
- `F(S)` = all four effects, evaluated in validated topological order.
- `T(S, F(S))` = the target predicate printed on the target placard.
- `P = (sourceId, replacementValue)` = a proposal with a value different from `S0[sourceId]`.
- `apply(S0, P)` = a copy of `S0` with exactly that one source changed.

A repair succeeds iff the proposal is legal, all declared functions evaluate within their domains, and `T(apply(S0, P), F(apply(S0, P)))` is true. Internal rule integrity is always checked, but target clauses are what normally become satisfied or unsatisfied during play.

Publication invariants:

1. `S0` and `Sc` differ in exactly one source.
2. `T(S0, F(S0))` is false.
3. `T(Sc, F(Sc))` is true.
4. Every permitted source pair has a well-defined effect state in the declared domains.
5. Enumerating every legal single-source proposal produces exactly the declared solution set.
6. Single solution means that set has size one; Open solution means size greater than one.
7. An Open solution's canonical configuration is an authoring reference, not a privileged answer.

### 4.2 Local rules versus target conditions

Example: a left lamp produces a rightward shadow. A right lamp produces a leftward shadow. Both scenes obey that rule. If the museum's target requests a rightward shadow, the right-lamp scene is **not the requested arrangement**; it is not a scene whose shadow inexplicably violates its lamp.

The interface separates:

- **Local rules:** four always-available explanations of how effects are calculated.
- **Target:** an explicit conjunction of desired conditions.
- **Test report:** each target condition marked Met or Not yet; the current observed value; and links to relevant local rules without identifying a corrective control automatically.

Do not paint a valid local rule red merely because the target is unmet. If a declared rule fails to evaluate, treat this as a content/system error, stop ranked submission and offer another exhibit. Never ask the player to solve a broken model.

Each confirmed test also exposes **Four local rules evaluated** with expandable per-rule input/output values and integrity status. In a valid candidate all four transformation checks are satisfied, while one or more target conditions may remain unmet. This explicitly fulfills the rule-by-rule reporting requirement without falsely describing a target mismatch as a broken law.

### 4.3 Exactly one intervention

The source inspector exposes all allowed replacement values, including the original value labeled “Original.” Selecting it clears the proposal. Selecting a second source replaces, rather than adds to, the current proposal. Show: “One change at a time. Your previous proposal was replaced.”

Each test applies the proposal to `S0`, even if the previous test left a different arrangement on screen. There is no accumulation of successful partial changes and no accidental two-source bypass.

Maintain three distinct concepts:

1. **Opening state:** immutable `S0 + F(S0)`.
2. **Staged proposal:** one selected source/value, not yet tested. Show a compact “Proposed” label; keep the scene in its last verified state.
3. **Last tested state:** server-acknowledged candidate and its recomputed effects. Label it “Tested arrangement” until reset or the next result.

The source inspector always shows “Opening value,” “Last tested value” and, when present, “Proposed value” distinctly. The public current-state sentence refers to the state actually rendered. Never show changed source artwork with unchanged effects as if it were a valid tested scene.

### 4.4 Undo, reset and test history

- **Undo proposal:** restore the previous staged proposal from a session stack, with the empty proposal as a valid entry. It does not reverse an awarded completion or erase a test.
- **Return to opening:** clear the proposal, render `S0`, and retain assistance, completion and history. This is the player-facing reset.
- **Test history:** show the last 20 accepted tests in chronological order in an optional sheet, with source, replacement, result and target statuses. Re-selecting an entry stages that proposal but does not grant a new result. Server storage may retain a bounded last 100 test summaries per exhibit/version; the score is not computed from history length.
- **Unlimited tests:** no gameplay quota. Network abuse controls may temporarily throttle rapid automated requests but must not consume resources or damage a record.

Invalid source IDs, invalid enum values, edits to effects and multi-source payloads are rejected without state, assistance or score mutation.

### 4.5 Assistance and Study

Three cumulative hint tiers are free:

1. **Relevant group:** point to a group of related objects, not an isolated answer.
2. **A causal edge:** explain the first useful dependency to follow.
3. **Candidate control:** name a source to consider, but do not automatically choose its replacement value. In Open solution cases explicitly acknowledge both valid control candidates.

The hint sheet states the effect before confirmation: “Next hint: score −10. Tests are always free.” Previously unlocked hints can be reread without further cost. The actual hint content is returned only after the server has acknowledged the assistance update. A repeated request with the same idempotency key cannot advance another tier.

**Study this exhibit** uses a confirmation: “Show the repair and its explanation? This exhibit/version will not receive a ranked result on this first play.” It then shows a canonical repair, every changed effect and all accepted alternative repairs. It is not an animated automatic solve disguised as a hint.

Study is permanent for first-play eligibility on that exhibit's active competition version. Closing, resetting, clearing browser storage, switching locale or opening another device cannot erase assistance. Existing historical eligible completions remain historical; later study does not retroactively change them.

### 4.6 Scores, boards and ties

For the first eligible successful completion of an exhibit/version:

`score = 100 − 10 × highest_hint_tier_used`, where the tier is 0, 1, 2 or 3.

Valid scores are exactly 100, 90, 80 and 70. Failed tests, elapsed time, inspector openings, resets, object-list usage, reduced motion and locale changes do not affect score. Study-first completions have `score = null`, never a displayed zero implying failure.

The first eligible completion is the official record. Practice cannot replace it with a higher result after the answer is known. All score calculations and single-grant decisions happen on the service.

Boards are optional to view and opt-in to appear on. Partition them by `(exhibitId, competitionVersion, assistanceTier)`. Study and practice are excluded. Since everyone in one assistance partition has the same score, show a shared standing and “Visitors who repaired this exhibit,” not an artificial fastest-first contest. Stable pagination may use an internal ID but must not imply superior rank. No global summed leaderboard is required.

Use a generated pseudonym such as “Visitor 4827” by default. Never expose Telegram username, avatar, raw ID or study/test history on a board without a separate product requirement and consent. There are no cash, token or transferable rewards, and no claim that a client-visible deterministic puzzle is cheat-proof.

## 5. Player journey and interaction design

### 5.1 The first minute

1. The Mini App opens to a calm foyer with the title, “Change the cause, not the shadow,” and **Enter the museum**. Audio is off until explicitly enabled.
2. The first visit recommends L01. The museum presents its title and a short target, not a long tutorial modal.
3. An explicitly labeled teaching viewport initially isolates only the lamp and shadow. It is a cropped introduction to the same six-node model, not a two-object puzzle with different rules. After inspecting either teaching object, offer **See the whole exhibit**; Skip, opening the object list or staging a proposal expands immediately to all six objects before testing. The complete object list and all rules remain available throughout, including to screen readers.
4. The player inspects the shadow and sees “Effect — follows the lamp and shutter. Effects cannot be edited.”
5. They inspect the lamp and see its two allowed positions. Explain how to stage a proposal and select **Test the repair**, without naming the correct value unless a hint is requested.
6. The verified repair reveals the causal changes and a short recap. Offer **Next exhibit**, **See the cause chain** and **Back to collection**.

No tutorial action requires a wrong answer. Returning users can skip the focus treatment. Explain a new UI control in place; do not create a multi-page onboarding carousel.

### 5.2 Core loop

`Enter → Read target/rules → Inspect → Stage one change → Test → Examine consequences → Try again or celebrate → Understand recap → Continue/leave`

The target remains accessible during every step. A hint button, object-list toggle and settings entry remain available without leaving the exhibit. On narrow screens the rule panel may collapse, but its title and count remain visible.

### 5.3 Input contract

- Tap/click an object to open its inspector. A second tap does not silently change a source.
- Source values are a labeled radio group or segmented controls; no drag is required.
- Effects have an explanation and “Show related rules,” but no editable control.
- The active object has a visible outline plus a named selection state; color alone is insufficient.
- Tab order follows heading → target → scene/list toggle → six objects in logical reading order → inspector controls → Test → secondary actions. Sheets use standard dialog focus containment and return focus to their opener.
- Enter/Space activate controls. Escape closes a dismissible sheet, clears no game state and never exits the app accidentally.
- Optional pinch zoom is supplemental. Provide explicit zoom in/out and reset controls for the scene.
- A desktop hover may show an object name but never information unavailable through tap or keyboard.

### 5.4 Verified-repair reveal

After a successful service response, animate only nodes whose values changed, following graph depth. Independent nodes at the same depth may animate together. The source settles first, then its consequences; a short final alignment gesture completes the scene.

Target duration is 900–1,400 ms, hard cap 1,600 ms. The result content is already present and accessible; the animation never blocks Next. Skip, reduced motion, app deactivation and navigation all land on exactly the same final state.

A failed test uses the same deterministic state transition but no celebratory sound or harsh buzzer. Show **“Not this arrangement yet.”** and the exact unmet target conditions. Do not flash the answer, auto-highlight the guilty source or say “Close!” for a candidate that has no defined distance from the solution.

### 5.5 Lifecycle and exceptional behavior

| Situation | Required behavior |
|---|---|
| App closes during inspection | Last acknowledged session and preferences resume |
| App closes while a proposal save is pending | Restore acknowledged state; offer locally pending proposal only after reconciliation |
| Test times out | Say “Result not confirmed”; retry the same action key or fetch the action outcome, not a new grant |
| Offline after content loaded | Keep rules and inspection available; label Offline practice; local tests may run without ranked claims |
| Offline user requests a hint/Study | Require reconnection before disclosing new assistance; previously acknowledged hints remain readable |
| Online again | Refresh session revision before submitting a proposal; no automatic bulk upload of local test history |
| Authentication expires | Preserve non-sensitive local proposal; re-authenticate; do not silently create a guest ranked account |
| Second device modifies session | Service returns revision conflict; show refreshed state and allow deliberate restaging |
| Image fails | Show complete textual object interface and an asset retry; never block solving on decoration |
| Audio fails | Continue silently; no repeated error toast |
| Exhibit withdrawn or version retired | Explain unavailability, preserve historical record, offer shelf; do not load a different puzzle under the same challenge silently |
| Service/content integrity error | Stop score submission; preserve session; offer Retry or another exhibit |

Offline practice is not a secret-exposure guarantee: the model must be inspectable to be accessible. Assistance flags cover the product's own disclosures, not what a person can deduce or find elsewhere.

A locally matching offline target is labeled **Offline practice match — not saved**. It grants no Repaired/Explored status, mastery, score, board entry or completion. On reconnection the visitor may deliberately re-stage and submit that proposal against the refreshed authoritative session; only the resulting service acknowledgment can grant progress. Never automatically convert a cached local success into an official record.

## 6. Screen-by-screen specification

### 6.1 Global layout

Design at **390 × 844 CSS pixels** first. Support 320 px width, 360 px common phones, 430 px larger phones, 768 px tablets and desktop. Respect Telegram-provided content/safe-area information and dynamic viewport changes. Do not place controls under the native header, device cutout or bottom system gesture area.

Phone spacing scale: 4, 8, 12, 16, 24 and 32 px. Main horizontal padding 16 px. Minimum tap box **44 × 44 CSS px**, preferred primary-button height 48 px. The scene occupies approximately 320–370 px height at the primary design size, but must yield space to resized text. Do not require the target, six objects and all four rules to fit above the fold.

Desktop: centered content maximum 1,160 px, scene and inspection/rules in a 60/40 split. No new desktop-only clues. Phone landscape may use a two-column layout where practical; it must never force orientation.

### 6.2 Required screens and states

| Screen | Required content/actions | Important states |
|---|---|---|
| Boot | Accessible title, restrained loading indicator, Retry on failure | Loading, auth required, offline cache, maintenance |
| Foyer | Logo as live type, entry CTA, continue card, three collection entrances, settings | First visit, returning, tour completed |
| Collection shelf | Eight exhibit cards; progress summary; optional solution-type filter | Unvisited, in progress, studied, repaired, withdrawn |
| Exhibit | Title, ID, target, scene/list, six objects, four rules, inspector, test controls | Opening, proposal pending, testing, mismatch, success, Study |
| Object inspector | Name, Source/Effect badge, current public state, related rules; source values where legal | Selected effect, selected source, proposal save pending/error |
| Rules sheet | Four numbered cards; visible parent → effect relationships; connection overview; local-model disclaimer; target repeated | Expanded card, rule linked from inspector |
| Test report | Proposal, server-confirmed arrangement, target-clause statuses | All met, some unmet, unconfirmed, integrity error |
| Hint/Study sheet | Assistance tier, next tier warning, unlocked hints, reveal confirmation | 0–3 hints, offline, already studied |
| Result/recap | Restored scene, exact score or Study/Practice label, chain, alternatives, Next | First grant, resumed result, Open solution |
| Visitor card | Explored/repaired counts, three mastery stamps, closing note when earned | Empty, partially complete, complete |
| Cosmetic preview | Default versus Gallery Frame Set, 75 Stars, “cosmetic only,” Buy/Owned | Available, invoice pending, cancelled, owned, refunded, disabled |
| Settings/support | EN/RU, audio, music, haptics, motion, contrast, object-list default, privacy/delete/support | Saved, offline preferences, deletion pending |
| Credits | Original creators, applicable tool/provider disclosure and third-party license notices | Text reflow, accessible source links |
| Optional exhibit board | Assistance partition, shared standing, opt-in/out | Empty, loading, opted out, unavailable |

### 6.3 Phone exhibit composition

From top to bottom:

1. Header: Back, accession number, settings.
2. Title, collection and Single/Open solution pill.
3. **Target placard**, with separately scannable conditions. Its wording is not hidden behind an icon.
4. Scene/Object list tabs. Scene offers visible “Objects 6” and “Show object names.” Object names may be toggled freely without score impact.
5. Responsive scene or full state list. Inspector opens inline below the scene on phones, not over the object the player is reading. A sheet is acceptable only if it can be dismissed without losing selection.
6. Proposed change summary and primary **Test the repair** button.
7. Local rules, hint tier, Undo proposal, Return to opening and Study actions.

The Test button may remain sticky inside the content-safe area, but must not obscure focused text or the last list item. Add matching scroll padding. Only one primary Test control is exposed to assistive technology; a Telegram native MainButton mirror is unnecessary and should not create duplicate submission paths.

### 6.4 Controls, empty states and feedback

Test is disabled when there is no proposal, a proposal acknowledgment is pending, a test is in flight or authentication is invalid. Explain disabled state beside the proposal area rather than via an inaccessible tooltip.

A test report lists observed target values, for example:

- Rightward shadow: **Met — shadow points right**.
- Shaded right seat: **Met — seat is shaded**.
- Resting moth: **Not yet — moth is moving**.

This example illustrates report format; actual combinations must come from the model and cannot contradict it.

Success copy is **“Everything makes sense now.”** A small score line follows; do not use explosive coins, confetti, casino audio or a fake rarity label. In Study use **“Now you can follow the cause.”**

Each rule card shows its parent-node names and computed effect as a visible relationship, for example **Lamp + Shutter → Shadow**. An always-free **Connections** expansion displays the complete six-node DAG using HTML/CSS node cards and raster connectors, with an equivalent edge list for assistive technology. It is available before solving and reveals only public dependencies/current states, never a marked corrupted source. Selecting a node opens the same inspector as the scene; duplicated representations do not create extra semantic objects.

The result's expanded recap includes a data-generated before/after table for the changed source and **every changed effect**, plus unchanged target conditions that were preserved. The authored recap paragraph is commentary, not a substitute for those complete deltas. Open solution recaps list both accepted interventions equally.

### 6.5 Sharing and deep links

Share only on explicit action. Default card contains title, accession number, unsolved editorial thumbnail, solution type and **“Can you make this exhibit agree?”** No repair choice, hint text, solved image, test count, personal ID or exact score is embedded by default.

A challenge links to a server-resolved opaque code for an immutable exhibit/competition version. It does not contain a source value or solution. A user who already played sees “You have visited this exhibit before”; no new ranked first attempt is created. A retired challenge receives a clear unavailable message with an option to open the latest version as a separate action.

A separately labeled “Share the explanation” is not required for launch. Do not accidentally share a causal recap through the spoiler-free action.

## 7. Visual direction and design-system contract

### 7.1 Art style: editorial tabletop theatre

Flat, layered, hand-finished editorial dioramas with disciplined perspective. Think carefully cut card, small wooden stands, enamel controls and frosted-glass inserts, seen slightly from above. Use a shallow 3/4 view with a stable horizon, not perspective that obscures left and right.

Outline language: crisp ink blue, moderately rounded joins, nominal 2–3 px at a 390 px rendered scene width. Texture lives in large material planes at low contrast; clue edges and controls remain clean. Use small, believable material shadows for depth, but **decorative cast shadows must never compete with a puzzle shadow**. In Light exhibits use contact shading only for non-clue objects and reserve directional cast shadows for the actual modeled effect.

The collection's accent color changes, not the readability of clues. Give every source a physical adjustment affordance—handle, dial, movable mount or gate—and every effect a plausible observed output. Effects do not carry source-like knobs.

### 7.2 Palette and type

| Token | Suggested value | Use |
|---|---|---|
| `paper` | `#F5F0E5` | Main warm background |
| `surface` | `#FFFCF5` | Cards, inspector |
| `ink` | `#20364A` | Main text, outlines |
| `mutedInk` | `#52616B` | Secondary text after contrast verification |
| `lightAccent` | `#D7AE59` | Light material accent; not body text |
| `airAccent` | `#77A69A` | Air material accent |
| `waterAccent` | `#779CB8` | Water material accent |
| `successInk` | `#2D6553` | Success text/icon after contrast test |
| `attentionInk` | `#8A4B34` | Mismatch label; never red-only semantics |
| `focus` | `#245EA8` | Focus outline on a contrasting underlay |

These are art tokens, not an untested compliance claim. Test every actual foreground/background pair; substitute darker semantic text tokens where needed. Accent fills always use ink text or an independently validated alternative.

- Display/title: **Lora**, weight 600, 24–28 px phone titles, 32–40 px foyer heading.
- Interface/body: **Nunito Sans**, weights 400/600/700, 16 px body with 1.45–1.6 line height; labels 14 px minimum; no critical copy smaller than 14 px.
- Both families have Latin and Cyrillic coverage in their official metadata [R06]. Self-host WOFF2 subsets, retain licenses and test `Ёё`, punctuation, arrows represented as text where appropriate, and numeric glyphs.
- Fallbacks: Georgia for display; system sans-serif for UI. Font failure must not hide text or break button layout.
- No baked-in text inside generated art. The title is live typography, not an unreadable AI logo.

### 7.3 Components and state differentiation

Cards use a restrained 12 px corner radius, 1 px ink-tinted border and subtle paper-depth shadow. Primary buttons use ink background and light text; secondary buttons are surface-filled with a clear border. No glassmorphism, glowing neon, noisy gradients or interchangeable generic mobile-game chrome.

Source/Effect badges use both words and distinct raster icons: a small handle for Source, a branching mark for Effect. The active proposal has a dotted registration border; the last tested state has a solid border and explicit label. Success uses a stamp plus text; Study uses an open-book icon plus text.

The free default frame is already complete and beautiful. The paid frame cannot be the version with legible labels, correct contrast or clear outlines.

### 7.4 Motion-safe and high-contrast art

- Reduced motion replaces transitions with immediate state changes or a ≤120 ms opacity fade. No sliding scene, parallax, zoom celebration, shaking or moving background.
- High contrast adds strong free outlines, opaque text surfaces and explicit state-name chips for everyone. It is not a purchasable skin.
- Ambient fans, water and paper movement are bounded cosmetic motion derived from the current state. A stopped fan never rotates; a dry floor never shimmers like water. Animation must not communicate a value unavailable in static text.
- Do not flash more than three times per second; in practice use no flashing effects.

## 8. Asset production and MCP image-generation brief

### 8.1 Production strategy

Generate art during development through the available image-generation MCP. Record the actual provider/tool, model identifier, prompt, generation date, reference rights, seed if exposed, and output file hashes. **Do not invent an MCP method name or claim a seed exists if that tool does not expose one.** Inspect the tool's available interface when implementation starts.

Build one approved style reference and one complete L01 scene first. After its readability and layered-state behavior pass, produce the other collections in batches. Do not generate 24 inconsistent full paintings and attempt to retrofit invisible hotspots afterward.

The playable renderer uses aligned raster layers and real DOM controls. A scene background is static; source and effect objects have state-specific layers or approved transforms. Logic selects visual states. The image model never decides where an object's shadow belongs at runtime.

### 8.2 Asset inventory and required outputs

| ID family | Quantity | Deliverable and purpose |
|---|---:|---|
| `brand/style-board` | 1 | Approved material, outline, perspective and palette reference; production-only |
| `brand/hero` | 1 | Foyer diorama, 1600×1000 master, responsive exports; no puzzle clue or text |
| `collection/{light,air,water}/header` | 3 | 1200×480 collection crops; decorative, no baked labels |
| `collection/{collection}/material-sheet` | 3 | Production reference sheets, not runtime downloads |
| `exhibit/{id}/background` | 24 | 1200×1200 transparent-safe scene master or opaque wall/floor background; no interactive objects baked in |
| `exhibit/{id}/object/{node}/{state}` | 144 logical object slots; **317 state mappings: 104 source + 213 effect** | Aligned RGBA masters or approved shared-sprite/transform mappings for every domain value; 144 files alone do not satisfy this inventory |
| `exhibit/{id}/hit-regions` | 24 data records | Normalized hit geometry, labels, draw order and focus order; semantic data, not SVG |
| `exhibit/{id}/thumbnail` | 24 | 480×360 editorial crop; must not reveal repair |
| `exhibit/{id}/share` | 24 | 1200×630 spoiler-free card assembled from approved art and live-rendered localized text |
| `ui/icon/{name}` | 20 | Raster UI icons: back, close, settings, inspect, source, effect, test, undo, reset, hint, study, rules, objects, scene, sound, music, share, zoom-in, zoom-out, check; export at 1×/2×/3× |
| `ui/graph-connectors` | 1 small atlas | Straight, elbow, junction and arrowhead pieces for the public dependency diagram; reusable, no SVG |
| `ui/registration-tab` | 1 object, 2 poses | Offset and aligned brass tab for the verified-repair finish; independent of paid frames |
| `ui/status` | 4 | Unvisited, in-progress, studied, repaired raster status marks |
| `ui/mastery` | 3 | 1/5/15 mastery stamps, 256×256 masters |
| `ui/closing-postcard` | 1 | Free end-of-tour illustration, 1200×800 master |
| `frame/default` | 1 set | Scene surround, nameplate border and result treatment, all free |
| `frame/gallery-set` | 3 coordinated treatments | Brass Registration, Sea-Glass Edge and Paper Archive; sold together as one 75-Star entitlement |
| `audio/*` | Section 9 manifest | Original procedural masters and compressed runtime files |
| `fonts/*` | 2 families, required scripts/weights only | Self-hosted files plus original OFL notices |
| `legal/asset-register` | 1 register | Provenance, rights and hashes for every shipped asset family |

The three paid treatments only alter the outside frame, nameplate border and result stationery. They never alter the six objects, arrows, target labels, control positions or score. Support a nine-slice raster frame where useful; do not rasterize the whole app.

### 8.3 Layer contract

Use a normalized scene space `[0,1] × [0,1]`. Each object's production record includes:

- Stable exhibit and node IDs; semantic Source/Effect role.
- Bounds and anchor/pivot in normalized coordinates.
- Parent layer, draw order and state-to-file mapping.
- Hit rectangle or polygon; non-overlap checks after scaling to the minimum viewport.
- Current-state text key and object-list label key.
- Selection-outline mask or reusable raster outline; free high-contrast equivalent.
- Allowed visual transforms. Explicit left/right images are preferred when mirroring would reverse asymmetrical details; never mirror text or the complete scene.

Source art and its meaningful output must be separable. Remove AI-generated extra switches, unmodeled hoses, spare handles and mystery gauges. Physical connecting rods/tubes may appear as decoration only when they match declared causal edges; never imply an edge that the rules contradict.

If a tool cannot produce reliable alpha or consistent variants, generate on a flat chroma background, segment offline, clean manually or with image processing, and inspect the edge at 100% and at phone size. Do not accept checkerboard pixels painted into an image as transparency.

### 8.4 Reusable image prompt

Use the following as a semantic brief, adapted to the actual MCP's parameter names:

> Create an original editorial tabletop museum diorama for “Museum of Almost.” Warm off-white paper gallery, crisp dark ink-blue outlines, shallow three-quarter orthographic-like perspective, carefully cut card and enamel toy mechanisms, restrained [COLLECTION] accent, deliberate negative space, quiet wit, premium illustrated puzzle-book finish. Compose for a square playable scene viewed at 350 CSS pixels wide. Use the approved style reference. The six semantic objects are [EXACT SIX OBJECTS]. Their positions are [LAYOUT]. The requested object or layer is [LAYER AND STATE]. Puzzle-relevant direction is [EXPLICIT LEFT/RIGHT/UP/DOWN]. Keep each interactive silhouette distinct and large enough to associate with a 44 CSS pixel target. No words, letters, numbers, logos, watermarks, decorative controls, extra objects that look interactive, photorealism, glossy 3D rendering, tiny hidden clues, ambiguous cast shadows or artist-name imitation. Output a raster image; preserve the agreed framing and object anchors across variants.

For object variants, use the approved scene as a reference but request **only the specified object/layer** in the specified state. Never solve state consistency by asking the model to “make the whole image correct.” Build a contact sheet of all states for that object and reject shape drift, camera drift and changing scale.

### 8.5 Export and readability gates

- Masters: lossless PNG, at least 1200 px scene dimension; preserve layered source where available.
- Runtime: WebP, with PNG fallback where a tested transparency/decoder issue requires it. AVIF is optional after WebView testing; not a mandatory dependency.
- Do not ship full masters to phones. Typical scene exports use 768 or 1024 px, selected against real device clarity and decode memory.
- Cropped sprites are preferred over one full-canvas image per state. Atlas only where it reduces requests without decoding excessive unused states.
- No sprite state referenced by the model may be missing. Placeholder and final files must not share a hash or path in a way that allows a placeholder to survive a final build unnoticed.
- Source controls and modeled output differences must remain readable at 320 px viewport width and in grayscale. Text and shape redundancy cover hue-based differences.
- Keep art rights and asset manifests local to the project; do not hotlink third-party assets or download files on a player's device from arbitrary creator sites.
- Automated no-SVG check includes the renderer's icon library and generated exports. HTML/CSS borders and accessible text are not prohibited.

### 8.6 Art acceptance checklist per exhibit

Exactly six semantic objects; four modeled effects; no extra control-looking props; all states match the truth table; no contradiction between scene and object list; all six scene targets remain discoverable, meet 44 px at the supported layout/zoom and do not overlap; a complete object list is also present, not an excuse for broken scene controls; orientation preserved in EN/RU; all labels outside artwork; high-contrast and reduced-motion states tested; unsolved share crop spoiler-reviewed; provenance recorded. Adjust composition and responsive layout rather than silently shrinking hit targets.

## 9. Audio, animation and haptics

### 9.1 Sonic identity

The museum sounds like paper, felt, small wooden mechanisms and a few soft glass tones. No generic victory fanfare, coin shower, error siren, ticking countdown or endless loud room loop. Audio is pleasant optional reinforcement, never evidence required to solve.

The baseline uses **original procedural synthesis and rendered noise**, so implementation does not depend on unlicensed recordings. The agent must create and retain repeatable render recipes, seed values, lossless masters and the asset register. Optional stock UI texture may come from the approved Kenney pack in section 18, after actual archive/license verification; it must not replace the museum's entire sound identity.

### 9.2 Mixing and runtime behavior

- First launch: all audible output off. Sound is the master mute and enables effects/ambience through a user gesture; Music is a separate opt-in preference behind that master mute. Enabling Music while Sound is off offers an explicit Enable sound action rather than playing unexpectedly. Haptics default off.
- Create/resume the AudioContext only from a permitted interaction. A rejected resume/play promise leaves the game usable and silent [R04].
- Independent master, effects, ambience and music gain controls; settings persist. A simple user UI may expose Sound, Music and volume rather than four expert mixers.
- Starting mix targets, not platform requirements: short cues around −20 to −16 LUFS where measurable, music around −26 to −22 LUFS, ambience lower; true peak ≤−1 dBTP. Audition on quiet phone speakers and headphones, not only meters.
- Effects voice cap 8; one ambience bed; one music bed. Coalesce rapid selection sounds and allow no more than one test cue per accepted UI action.
- Pause/suspend on app deactivation, hidden document and interrupted audio session. Resume only when allowed and still enabled; never replay queued sounds from the background.
- Bundle compressed mono cues where spatial information is unnecessary. Use AAC/MP3 or tested WebView-supported alternatives; do not require a single codec without fallback. Keep WAV masters out of the first-load bundle.

### 9.3 Complete sound manifest

All recipes use 48 kHz lossless masters, gain envelopes with nonzero ramps, seeded noise where used and no borrowed melody. Numerical values are starting synthesis settings; final listening acceptance remains required.

| Asset ID | Trigger and length | Procedural recipe / direction |
|---|---|---|
| `sfx/select` | Object selected, 45–70 ms | 1.2 kHz band-passed noise tap, 2 ms attack, exponential decay; soft paper contact |
| `sfx/value` | Proposal value changed, 70–100 ms | Two muted triangle partials around 220/440 Hz, 4 ms attack, short decay; wooden detent |
| `sfx/panel-open` | Inspector/rules opened, 100–160 ms | Low-level filtered noise sweep 1.8→0.9 kHz; felt-covered card movement |
| `sfx/panel-close` | Panel closed, 80–120 ms | Shorter downward paper-noise envelope, quieter than open |
| `sfx/test` | Accepted local submit starts, 100–150 ms | Soft 180 Hz wooden click plus brief 700 Hz partial; no success implication |
| `sfx/mismatch` | Confirmed target mismatch, 160–220 ms | Single damped 330 Hz triangle with low overtone; neutral, not a descending failure sting |
| `sfx/undo` | Undo proposal, 90–130 ms | Soft two-step felt taps 30 ms apart, no reverse audio gimmick |
| `sfx/reset` | Return to opening, 150–200 ms | Low-volume paper slide plus one wooden stop |
| `sfx/hint` | New acknowledged hint disclosed, 250–350 ms | Two soft glass partial clusters near 523/659 Hz, ≤80 ms stagger |
| `sfx/study` | Study confirmation acknowledged, 220–300 ms | Page turn from filtered noise; no reward chord |
| `sfx/repair-light` | Verified Light repair, 700–1,000 ms | Sparse C5–E5–G5 glass motif with soft inharmonic partials; damped tails |
| `sfx/repair-air` | Verified Air repair, 700–1,000 ms | Same original motif on breathy triangles and a faint noise attack |
| `sfx/repair-water` | Verified Water repair, 700–1,000 ms | Same motif on rounded sine droplets; avoid wet, startling transients |
| `sfx/stamp` | First completion registration, 100–160 ms | Low wooden impulse with 1 kHz paper thud; once per confirmed first result |
| `sfx/mastery` | Newly earned private stamp, 700–1,000 ms | Restrained C5–G5–E5 response; not stacked over repair motif—queue or omit one |
| `sfx/lamp` | Modeled lamp state changes, 70–100 ms | Muted switch detent; no electrical crackle |
| `sfx/fan` | Modeled fan starts/stops, 250–400 ms | Filtered noise with gentle amplitude modulation, ramp to silence; not a continuous mandatory loop |
| `sfx/valve` | Modeled valve/gate changes, 120–200 ms | Low friction noise and wooden stop |
| `sfx/drop` | Modeled dropper changes to dropping, 100–180 ms | Sine pitch glide 700→420 Hz, exponential decay; one illustrative drop |
| `sfx/chime` | Chime effect becomes ringing, 400–700 ms | Two damped sine clusters, about 660/990 Hz; textual Ringing label remains authoritative |
| `sfx/finale` | First 24-explored closing note, 1.2–1.6 s | Quiet resolution using the same motif, no autoplay if sound off |
| `amb/foyer` | Optional bed, 24 s seamless | Very quiet filtered room noise with no people, speech or identifying real recording |
| `amb/light` | Optional bed, 24 s seamless | Foyer bed plus faint glass-resonance texture; no directional clue |
| `amb/air` | Optional bed, 24 s seamless | Slow low-level broad filtered air; never implies an active fan in a still scene |
| `amb/water` | Optional bed, 24 s seamless | Soft room bed, not an always-running stream; per-object water cues remain state-bound |
| `music/museum` | Optional 48 s loop | Original sparse C-major/A-minor pentatonic felt/wood pattern; ≤12 note attacks per 8 bars, about 60 BPM, generous rests |

Ambient beds are nondiegetic room tone. In a scene where even quiet air/water texture could suggest a false state, use the neutral foyer bed or silence. Loop boundaries need equal-power crossfades and no click; test several loop cycles.

### 9.4 Animation inventory

| Motion | Timing | Rule |
|---|---:|---|
| Control press | 80–120 ms | Small surface response; no layout shift |
| Inspector entrance | 140–180 ms | Fade/short translation; reduced motion removes translation |
| Proposal marker | ≤120 ms | No scene-state prediction |
| Node transition after test | 180–280 ms per graph depth, overlapping where safe | Only affected nodes; state labels update atomically with acknowledged snapshot |
| Final registration tab | 180–250 ms | Only after verified success |
| Ambient movement | Low amplitude, nonessential | Stops in reduced motion and while backgrounded |
| Result stamp | 180–240 ms | No screen shake; does not block interaction |

A source with three values needs a legible static pose for each; it does not need a cinematic animation between every pair. CSS transforms and raster state changes are sufficient. Do not introduce a heavyweight animation/3D engine solely for this list.

### 9.5 Haptics

If supported by Telegram and enabled: a light selection haptic for a source proposal and one success notification for a verified repair. No vibration on every effect in the chain, no punishment haptic for a mismatch, and no essential information delivered only through vibration. Unsupported methods are no-ops after capability detection.

## 10. Complete launch exhibit catalogue

### 10.1 Reading the catalogue

The following 24 records are the authored puzzle baseline. Each contains the full finite model, a named visual brief, the four rule-card meanings, target, three hints and recap. The JSON blocks are **specification fixtures**, not game implementation code. They make the acceptance set auditable and provide direct input for the future content-authoring conversion.

Fields:

- `sources`: exactly two node IDs and their legal domains.
- `derived`: exactly four effect IDs and domains.
- `initial` and `canonical`: opening/canonical source snapshots.
- `rules`: one expression per effect. Expressions refer only to declared nodes. Array order is not an excuse to skip graph validation.
- `target`: Boolean expression; each top-level conjunction becomes a separately reportable target clause.
- `solutions`: the complete legal single-source repair set.

The restricted expression notation supports string/integer literals, node references, `==`, `!=`, `and`, `or`, parentheses and `choose(condition, valueIfTrue, valueIfFalse)`. `choose` selects exactly one branch. No arbitrary calls, property access, arithmetic, user code or runtime `eval` are allowed in the shipped system; compile these authoring expressions into an allowlisted AST at build time.

Every rule-card pair below is **English / Russian**. Values in JSON are stable semantic tokens, not untranslated interface copy. The localization rules in section 14 define the state-label catalogue and grammatical templates.

Every scene uses a six-object layout: source controls in the upper or side operating area, effects in readable cause-chain order, with connecting mechanisms matching declared dependencies. Each exhibit's specific visual brief overrides generic composition when needed. The four rules are local toy-machine conventions, not a scientific claim. Present the shared disclaimer: **“This exhibit follows the four rules below.” / «Этот экспонат работает по четырём правилам ниже.»**

<!-- CATALOGUE_START -->

### 10.2 Light collection — L01–L08

#### L01 — A Shadow in the Wrong Seat / Тень не на своём месте

**Single solution · Introduction · Opposite direction and a short branch.**

Curator: “The moth reserved the seat on the right.” / «Мотылёк забронировал место справа.»

**Six objects:** `lamp` Lamp / Лампа; `shutter` Shutter / Заслонка; `shadow` Shadow / Тень; `leftSeat` Left seat / Левое сиденье; `rightSeat` Right seat / Правое сиденье; `moth` Paper moth / Бумажный мотылёк.

**Art:** a brass lamp on a horizontal two-position mount, an obvious open/closed shutter, two broad paper seats and one moth on a short articulated stalk. The modeled shadow is a large clean shape, not a tiny tonal patch. Keep the teaching focus on lamp and shadow; the two seats remain distinct.

```json
{
  "id": "L01", "solutionType": "single",
  "sources": {"lamp": ["left", "right"], "shutter": ["open", "closed"]},
  "derived": {"shadow": ["left", "right", "none"], "leftSeat": ["lit", "shaded"], "rightSeat": ["lit", "shaded"], "moth": ["resting", "moving"]},
  "initial": {"lamp": "right", "shutter": "open"},
  "canonical": {"lamp": "left", "shutter": "open"},
  "rules": {
    "shadow": "choose(shutter == 'closed', 'none', choose(lamp == 'left', 'right', 'left'))",
    "leftSeat": "choose(shadow == 'left', 'shaded', 'lit')",
    "rightSeat": "choose(shadow == 'right', 'shaded', 'lit')",
    "moth": "choose(rightSeat == 'shaded', 'resting', 'moving')"
  },
  "target": "shadow == 'right' and rightSeat == 'shaded' and moth == 'resting'",
  "solutions": [{"source": "lamp", "value": "left"}]
}
```

**Four rule cards:**
1. An open shutter lets the lamp cast a shadow on the opposite side. A closed shutter produces no shadow. / Открытая заслонка позволяет лампе отбрасывать тень на противоположную сторону. При закрытой заслонке тени нет.
2. The left seat is shaded only by a leftward shadow; otherwise its display is lit. / Левое сиденье находится в тени только при тени слева; иначе его подсветка включена.
3. The right seat is shaded only by a rightward shadow; otherwise its display is lit. / Правое сиденье находится в тени только при тени справа; иначе его подсветка включена.
4. The paper moth rests when the right seat is shaded; otherwise it moves. / Бумажный мотылёк замирает, когда правое сиденье в тени; иначе он движется.

**Target:** Shadow right; right seat shaded; moth resting. / Тень справа; правое сиденье в тени; мотылёк неподвижен.

**Hints:** H1 “Follow the lamp, shadow and right seat.” / «Проследите связь лампы, тени и правого сиденья.» H2 “The shadow falls opposite the lamp when the shutter is open.” / «При открытой заслонке тень находится с противоположной от лампы стороны.» H3 “Consider changing the lamp's side.” / «Попробуйте изменить сторону лампы.»

**Recap:** “Lamp left → shadow right → right seat shaded → moth rests. Closing the shutter removes the shadow rather than moving it.” / «Лампа слева → тень справа → правое сиденье в тени → мотылёк замирает. Закрытая заслонка убирает тень, а не перемещает её.»

#### L02 — The Leaf That Would Not Arrive / Лист, который не приходил

**Single solution · Foundation · Two independent inputs merge.**

Curator: “A postcard is waiting for the right kind of autumn.” / «Открытка ждёт подходящую осень.»

**Six objects:** `lamp` Lamp height / Высота лампы; `lens` Stencil selector / Переключатель трафарета; `shape` Shape window / Окно формы; `spread` Projection screen / Экран проекции; `postcard` Postcard / Открытка; `envelope` Envelope / Конверт.

**Art:** a miniature printing desk. The shape window displays a disk or leaf; a separate screen shows a broad or narrow projection footprint. A mechanical postcard tray combines those two readings. Do not draw a seventh interactive printing button.

```json
{
  "id": "L02", "solutionType": "single",
  "sources": {"lamp": ["low", "high"], "lens": ["round", "leaf"]},
  "derived": {"shape": ["disk", "leaf"], "spread": ["wide", "small"], "postcard": ["finished", "unfinished"], "envelope": ["sealed", "open"]},
  "initial": {"lamp": "low", "lens": "round"},
  "canonical": {"lamp": "low", "lens": "leaf"},
  "rules": {
    "shape": "choose(lens == 'leaf', 'leaf', 'disk')",
    "spread": "choose(lamp == 'low', 'wide', 'small')",
    "postcard": "choose(shape == 'leaf' and spread == 'wide', 'finished', 'unfinished')",
    "envelope": "choose(postcard == 'finished', 'sealed', 'open')"
  },
  "target": "spread == 'wide' and envelope == 'sealed'",
  "solutions": [{"source": "lens", "value": "leaf"}]
}
```

**Four rule cards:**
1. The round stencil makes a disk; the leaf stencil makes a leaf. / Круглый трафарет создаёт круг, трафарет листа — лист.
2. In this model a low lamp makes a wide projection; a high lamp makes a small one. / В этой модели низкая лампа даёт широкую проекцию, высокая — маленькую.
3. The postcard finishes only with a leaf shape and a wide projection. / Открытка готова только при форме листа и широкой проекции.
4. A finished postcard seals the envelope; otherwise it stays open. / Готовая открытка закрывает конверт; иначе он остаётся открытым.

**Target:** Wide projection and sealed envelope. / Широкая проекция и закрытый конверт.

**Hints:** H1 “Compare the shape window with the postcard.” / «Сопоставьте окно формы и открытку.» H2 “The postcard needs both the leaf and the wide projection.” / «Открытке нужны и лист, и широкая проекция.» H3 “The stencil selector controls the missing ingredient.” / «Недостающее условие зависит от переключателя трафарета.»

**Recap:** “Leaf stencil → leaf shape; the already-low lamp keeps the projection wide → postcard finished → envelope sealed.” / «Трафарет листа → форма листа; уже опущенная лампа сохраняет широкую проекцию → открытка готова → конверт закрыт.»

#### L03 — The Lighthouse's Indoor Voice / Тихий голос маяка

**Single solution · Developing · Three-value control and conjunction.**

Curator: “This lighthouse has been asked to use its indoor voice.” / «Этот маяк попросили вести себя потише.»

**Six objects:** `power` Power dial / Регулятор мощности; `diffuser` Glass selector / Переключатель стекла; `beam` Beam panel / Панель луча; `window` Window / Окно; `gull` Mechanical gull / Механическая чайка; `flag` Keeper's flag / Флажок смотрителя.

**Art:** a small indoor lighthouse, frosted insert and an articulated gull with clearly open or squinting eyes. Beam intensity is also represented by one/two/three patterned bars, not brightness alone. The flag has two distinct poses with live labels.

```json
{
  "id": "L03", "solutionType": "single",
  "sources": {"power": ["low", "medium", "high"], "diffuser": ["clear", "frosted"]},
  "derived": {"beam": ["dim", "even", "glare"], "window": ["sharp", "soft"], "gull": ["awake", "squinting"], "flag": ["welcome", "wait"]},
  "initial": {"power": "high", "diffuser": "frosted"},
  "canonical": {"power": "medium", "diffuser": "frosted"},
  "rules": {
    "beam": "choose(power == 'low', 'dim', choose(power == 'medium', 'even', 'glare'))",
    "window": "choose(diffuser == 'frosted', 'soft', 'sharp')",
    "gull": "choose(beam != 'glare' and window == 'soft', 'awake', 'squinting')",
    "flag": "choose(beam == 'even' and gull == 'awake', 'welcome', 'wait')"
  },
  "target": "flag == 'welcome'",
  "solutions": [{"source": "power", "value": "medium"}]
}
```

**Four rule cards:**
1. Low, medium and high power make a dim, even and glaring beam respectively. / Низкая, средняя и высокая мощность дают тусклый, ровный и слепящий луч соответственно.
2. Frosted glass makes a soft window; clear glass makes a sharp-edged one. / Матовое стекло смягчает свет в окне; прозрачное оставляет резкие границы.
3. The gull opens its eyes only when the window is soft and the beam is not glaring. / Чайка открывает глаза только при мягком свете в окне и отсутствии слепящего луча.
4. The flag welcomes visitors only with an even beam and an open-eyed gull. / Флажок приветствует посетителей только при ровном луче и открытых глазах чайки.

**Target:** The keeper's flag welcomes visitors. / Флажок смотрителя приветствует посетителей.

**Hints:** H1 “Read the beam, gull and flag together.” / «Рассмотрите связь луча, чайки и флажка.» H2 “Removing glare is not enough: the flag specifically needs an even beam.” / «Убрать слепящий свет недостаточно: флажку нужен именно ровный луч.» H3 “Try a different power setting.” / «Попробуйте другое значение мощности.»

**Recap:** “Medium power makes the beam even. The frosted window already softens it, so the gull opens its eyes and the flag welcomes visitors. Low power would wake the gull but leave the flag waiting.” / «Средняя мощность делает луч ровным. Матовое окно уже смягчает свет, поэтому чайка открывает глаза, а флажок приветствует посетителей. Низкая мощность разбудила бы чайку, но флажок остался бы в ожидании.»

#### L04 — One Pool of Gold / Одно золотое пятно

**Open solution · Discovery · Exclusive-one condition; two accepted causes.**

Curator: “The flower asked for one sun, not a committee.” / «Цветок просил одно солнце, а не целый совет.»

**Six objects:** `leftLamp` Left lamp / Левая лампа; `rightLamp` Right lamp / Правая лампа; `leftSpot` Left light patch / Левое световое пятно; `rightSpot` Right light patch / Правое световое пятно; `medallion` Counting medallion / Счётный медальон; `flower` Paper flower / Бумажный цветок.

**Art:** symmetrical lamps but asymmetrically distinctive housings so selection is clear; two large light patches feed a central medallion with zero/one/two embossed marks. The flower is visibly open or closed. Do not decorate the intended route more richly than the alternative.

```json
{
  "id": "L04", "solutionType": "open",
  "sources": {"leftLamp": ["off", "on"], "rightLamp": ["off", "on"]},
  "derived": {"leftSpot": ["dark", "lit"], "rightSpot": ["dark", "lit"], "medallion": ["none", "one", "two"], "flower": ["closed", "open"]},
  "initial": {"leftLamp": "off", "rightLamp": "off"},
  "canonical": {"leftLamp": "on", "rightLamp": "off"},
  "rules": {
    "leftSpot": "choose(leftLamp == 'on', 'lit', 'dark')",
    "rightSpot": "choose(rightLamp == 'on', 'lit', 'dark')",
    "medallion": "choose(leftSpot == 'lit' and rightSpot == 'lit', 'two', choose(leftSpot == 'lit' or rightSpot == 'lit', 'one', 'none'))",
    "flower": "choose(medallion == 'one', 'open', 'closed')"
  },
  "target": "medallion == 'one' and flower == 'open'",
  "solutions": [{"source": "leftLamp", "value": "on"}, {"source": "rightLamp", "value": "on"}]
}
```

**Four rule cards:**
1. The left lamp lights only the left patch. / Левая лампа освещает только левое пятно.
2. The right lamp lights only the right patch. / Правая лампа освещает только правое пятно.
3. The medallion counts the lit patches: none, one or two. / Медальон считает освещённые пятна: ни одного, одно или два.
4. The flower opens only when exactly one patch is lit. / Цветок раскрывается, только когда освещено ровно одно пятно.

**Target:** Medallion shows one; flower open. / Медальон показывает одно пятно; цветок раскрыт.

**Hints:** H1 “Both lamps feed the medallion through their own patches.” / «Обе лампы связаны с медальоном через свои пятна.» H2 “Exactly one lit patch is enough, whichever side it is on.” / «Достаточно ровно одного освещённого пятна с любой стороны.» H3 “Either lamp can be the control you change.” / «Изменить можно любую из двух ламп.»

**Recap:** “Turning on either lamp creates exactly one lit patch and opens the flower. Both repairs are equally correct.” / «Включение любой лампы создаёт ровно одно световое пятно и раскрывает цветок. Оба исправления одинаково верны.»

#### L05 — Moon for a Matinee / Луна для дневного спектакля

**Single solution · Developing · Protected intermediate target.**

Curator: “The moon is ready. Its entrance is not.” / «Луна готова. Её выход — пока нет.»

**Six objects:** `lamp` Lamp selector / Переключатель лампы; `mirror` Mirror routing lever / Рычаг маршрута зеркала; `entry` Entrance beam window / Входное окно луча; `exit` Exit beam window / Выходное окно луча; `moon` Moon disc / Диск луны; `sun` Sun disc / Диск солнца.

**Art:** a tiny theatre with two broad labeled beam windows and a mechanical mirror selector. “Straight” and “Crossed” are toy routing modes, not a claim about arbitrary real mirror angles. The moon and sun occupy separate, fixed sides.

```json
{
  "id": "L05", "solutionType": "single",
  "sources": {"lamp": ["left", "right"], "mirror": ["straight", "crossed"]},
  "derived": {"entry": ["left", "right"], "exit": ["left", "right"], "moon": ["lit", "dark"], "sun": ["lit", "dark"]},
  "initial": {"lamp": "left", "mirror": "straight"},
  "canonical": {"lamp": "left", "mirror": "crossed"},
  "rules": {
    "entry": "lamp",
    "exit": "choose(mirror == 'straight', entry, choose(entry == 'left', 'right', 'left'))",
    "moon": "choose(exit == 'right', 'lit', 'dark')",
    "sun": "choose(exit == 'left', 'lit', 'dark')"
  },
  "target": "entry == 'left' and moon == 'lit' and sun == 'dark'",
  "solutions": [{"source": "mirror", "value": "crossed"}]
}
```

**Four rule cards:**
1. The lamp setting determines the entrance beam side. / Положение лампы определяет сторону входного луча.
2. Straight routing keeps the beam side; crossed routing swaps left and right. / Прямой маршрут сохраняет сторону луча; перекрёстный меняет левую и правую стороны местами.
3. A right exit beam lights the moon; a left exit beam leaves it dark. / Выходной луч справа освещает луну; луч слева оставляет её тёмной.
4. A left exit beam lights the sun; a right exit beam leaves it dark. / Выходной луч слева освещает солнце; луч справа оставляет его тёмным.

**Target:** Entrance beam left, moon lit, sun dark. / Входной луч слева, луна освещена, солнце тёмное.

**Hints:** H1 “The entrance and exit do not have to use the same side.” / «Вход и выход не обязаны находиться с одной стороны.» H2 “Preserve the required entrance while changing the exit.” / «Сохраните нужный вход и измените выход.» H3 “Inspect the mirror routing lever.” / «Проверьте рычаг маршрута зеркала.»

**Recap:** “Crossed routing keeps the left entrance and sends the exit right. Moving the lamp also lights the moon, but violates the required left entrance.” / «Перекрёстный маршрут сохраняет вход слева и направляет выход вправо. Перестановка лампы тоже освещает луну, но нарушает требование входа слева.»

#### L06 — The Window with Two Opinions / Окно с двумя мнениями

**Single solution · Developing · Pattern-coded color and an AND gate.**

Curator: “The plant would like a portrait, not a night photograph.” / «Растение просит портрет, а не ночной снимок.»

**Six objects:** `filter` Filter wheel / Колесо фильтров; `blind` Blind control / Управление жалюзи; `window` Pattern window / Окно узора; `plant` Paper plant / Бумажное растение; `floor` Floor panel / Панель пола; `camera` Camera / Фотоаппарат.

**Art:** amber-circle and blue-triangle filter inserts with both shape and color readable. A paper plant opens its leaves through a visible toy linkage; a floor panel displays large stripes or a plain surface; the camera has a distinct ready flag. No reliance on real plant growth or real color perception.

```json
{
  "id": "L06", "solutionType": "single",
  "sources": {"filter": ["amber", "blue"], "blind": ["open", "closed"]},
  "derived": {"window": ["circle", "triangle"], "plant": ["awake", "asleep"], "floor": ["striped", "plain"], "camera": ["ready", "waiting"]},
  "initial": {"filter": "blue", "blind": "open"},
  "canonical": {"filter": "amber", "blind": "open"},
  "rules": {
    "window": "choose(filter == 'amber', 'circle', 'triangle')",
    "plant": "choose(window == 'circle' and blind == 'open', 'awake', 'asleep')",
    "floor": "choose(blind == 'open', 'striped', 'plain')",
    "camera": "choose(plant == 'awake' and floor == 'striped', 'ready', 'waiting')"
  },
  "target": "window == 'circle' and camera == 'ready'",
  "solutions": [{"source": "filter", "value": "amber"}]
}
```

**Four rule cards:**
1. The amber filter has a circle; the blue filter has a triangle. The window repeats that shape. / На янтарном фильтре круг, на синем — треугольник. Окно повторяет эту форму.
2. The paper plant wakes only with a circle and an open blind. / Бумажное растение просыпается только при круге и открытых жалюзи.
3. Open blinds make the floor striped; closed blinds leave it plain. / Открытые жалюзи создают полосы на полу; закрытые оставляют пол без узора.
4. The camera is ready only with an awake plant and a striped floor. / Фотоаппарат готов только при бодрствующем растении и полосатом полу.

**Target:** Circle in the window and camera ready. / В окне круг; фотоаппарат готов.

**Hints:** H1 “Compare the window, plant and camera.” / «Сопоставьте окно, растение и фотоаппарат.» H2 “The floor already has the pattern the camera needs.” / «На полу уже есть нужный фотоаппарату узор.» H3 “Consider the filter wheel.” / «Обратите внимание на колесо фильтров.»

**Recap:** “Amber-circle filter → circle window → awake plant. The open blind preserves the stripes, so the camera becomes ready.” / «Янтарный фильтр с кругом → круг в окне → растение просыпается. Открытые жалюзи сохраняют полосы, и фотоаппарат готов.»

#### L07 — The Star Needs an Edge / Звезде нужны чёткие края

**Single solution · Synthesis · Independent quality and spill constraints.**

Curator: “The owl approves of stars, but not of unnecessary brightness.” / «Сова одобряет звёзды, но не лишний свет.»

**Six objects:** `iris` Aperture lever / Рычаг диафрагмы; `focus` Focus selector / Переключатель фокуса; `star` Star silhouette / Силуэт звезды; `meter` Spill meter / Измеритель засветки; `drum` Sensor drum / Барабан датчика; `owl` Paper owl / Бумажная сова.

**Art:** an observatory desk with a physically bounded star silhouette, not blurry UI text. The meter uses large one/three-mark readings; a photocell-linked toy drum rotates only when active. The owl's eyes provide the final static state.

```json
{
  "id": "L07", "solutionType": "single",
  "sources": {"iris": ["wide", "narrow"], "focus": ["near", "far"]},
  "derived": {"star": ["sharp", "soft"], "meter": ["high", "low"], "drum": ["active", "quiet"], "owl": ["settled", "alert"]},
  "initial": {"iris": "wide", "focus": "near"},
  "canonical": {"iris": "narrow", "focus": "near"},
  "rules": {
    "star": "choose(focus == 'near', 'sharp', 'soft')",
    "meter": "choose(iris == 'wide', 'high', 'low')",
    "drum": "choose(meter == 'high', 'active', 'quiet')",
    "owl": "choose(star == 'sharp' and drum == 'quiet', 'settled', 'alert')"
  },
  "target": "star == 'sharp' and owl == 'settled'",
  "solutions": [{"source": "iris", "value": "narrow"}]
}
```

**Four rule cards:**
1. Near focus gives the star a sharp edge; far focus gives a soft edge. / Ближний фокус даёт звезде чёткие края, дальний — мягкие.
2. A wide aperture gives high spill; a narrow aperture gives low spill. / Широкая диафрагма даёт высокую засветку, узкая — низкую.
3. High spill activates the sensor drum; low spill keeps it quiet. / Высокая засветка включает барабан датчика, низкая оставляет его неподвижным.
4. The owl settles only with a sharp star and a quiet drum. / Сова успокаивается только при чёткой звезде и неподвижном барабане.

**Target:** Sharp star and settled owl. / Чёткая звезда и спокойная сова.

**Hints:** H1 “The owl reads both the star and the drum.” / «Сова зависит и от звезды, и от барабана.» H2 “The drum follows spill, not focus.” / «Барабан зависит от засветки, а не от фокуса.» H3 “Inspect the aperture lever.” / «Проверьте рычаг диафрагмы.»

**Recap:** “Narrow aperture → low spill → quiet drum. Near focus already keeps the star sharp, so the owl settles.” / «Узкая диафрагма → низкая засветка → неподвижный барабан. Ближний фокус уже сохраняет чёткость звезды, поэтому сова успокаивается.»

#### L08 — Closing Time for the Sun / Солнцу пора закрываться

**Single solution · Collection finale · Three-way preset with converging outputs.**

Curator: “The last visitor prefers the hour between bright and dark.” / «Последний посетитель предпочитает час между светом и темнотой.»

**Six objects:** `mode` Sky-mode dial / Регулятор режима неба; `skylight` Skylight latch / Защёлка светового люка; `dome` Sky dome / Небесный купол; `clock` Clock face / Циферблат; `ticket` Reading ticket / Билет для чтения; `bird` Evening bird / Вечерняя птица.

**Art:** a mechanical planetarium whose sky-mode dial visibly drives both dome and clock. No real-time clock. Day/dusk/night have distinct sun/horizon/star motifs, not hue alone. The ticket has a live text label, not generated lettering.

```json
{
  "id": "L08", "solutionType": "single",
  "sources": {"mode": ["day", "dusk", "night"], "skylight": ["open", "closed"]},
  "derived": {"dome": ["white", "gold", "blue"], "clock": ["noon", "six", "midnight"], "ticket": ["readable", "unreadable"], "bird": ["perched", "waiting"]},
  "initial": {"mode": "day", "skylight": "open"},
  "canonical": {"mode": "dusk", "skylight": "open"},
  "rules": {
    "dome": "choose(mode == 'day', 'white', choose(mode == 'dusk', 'gold', 'blue'))",
    "clock": "choose(mode == 'day', 'noon', choose(mode == 'dusk', 'six', 'midnight'))",
    "ticket": "choose(skylight == 'open' or dome != 'blue', 'readable', 'unreadable')",
    "bird": "choose(clock == 'six' and dome == 'gold' and ticket == 'readable', 'perched', 'waiting')"
  },
  "target": "ticket == 'readable' and bird == 'perched'",
  "solutions": [{"source": "mode", "value": "dusk"}]
}
```

**Four rule cards:**
1. Day makes a white sun dome; dusk a gold horizon dome; night a blue star dome. / День создаёт белый купол с солнцем, сумерки — золотой с горизонтом, ночь — синий со звёздами.
2. The same mode sets the toy clock to noon, six or midnight respectively. / Тот же режим ставит игрушечные часы на полдень, шесть или полночь соответственно.
3. The ticket is readable if the skylight is open or the dome is not blue. / Билет читается, если люк открыт или купол не синий.
4. The bird perches only at six, with a gold dome and a readable ticket. / Птица садится только в шесть, при золотом куполе и читаемом билете.

**Target:** Readable ticket and perched bird. / Читаемый билет и сидящая птица.

**Hints:** H1 “Follow the dome and clock to the bird.” / «Проследите связи купола и часов с птицей.» H2 “One preset changes both the sky and the toy clock.” / «Один режим меняет и небо, и игрушечные часы.» H3 “Consider the sky-mode dial.” / «Обратите внимание на регулятор режима неба.»

**Recap:** “Dusk sets the gold horizon and six o'clock. The ticket remains readable, so the bird takes its place.” / «Сумерки создают золотой горизонт и ставят часы на шесть. Билет остаётся читаемым, и птица занимает своё место.»

<!-- LIGHT_END -->

### 10.3 Air collection — A01–A08

#### A01 — A Flag with Other Plans / У флага другие планы

**Single solution · Introduction · Direction and a one-way mechanism.**

Curator: “The boat trusts the flag more than the timetable.” / «Лодка доверяет флагу больше, чем расписанию.»

**Six objects:** `fan` Fan selector / Переключатель вентилятора; `vent` Vent gate / Заслонка воздуховода; `wind` Airflow window / Окно потока; `flag` Flag / Флаг; `wheel` One-way wheel / Однонаправленное колесо; `boat` Docking boat / Лодка у причала.

**Art:** a harbor under glass, with a large fan selector, broad airflow window and ratchet wheel linked to a boat carriage. Arrows live in the state layer, not as decorative swirls. A stopped fan is visibly stopped.

```json
{
  "id": "A01", "solutionType": "single",
  "sources": {"fan": ["left", "right", "off"], "vent": ["open", "closed"]},
  "derived": {"wind": ["left", "right", "still"], "flag": ["left", "right", "hanging"], "wheel": ["turning", "stopped"], "boat": ["docked", "away"]},
  "initial": {"fan": "left", "vent": "open"},
  "canonical": {"fan": "right", "vent": "open"},
  "rules": {
    "wind": "choose(vent == 'closed' or fan == 'off', 'still', fan)",
    "flag": "choose(wind == 'still', 'hanging', wind)",
    "wheel": "choose(wind == 'right', 'turning', 'stopped')",
    "boat": "choose(wheel == 'turning', 'docked', 'away')"
  },
  "target": "flag == 'right' and boat == 'docked'",
  "solutions": [{"source": "fan", "value": "right"}]
}
```

**Four rule cards:**
1. An open vent passes the selected fan direction. A closed vent or off fan makes still air. / Открытая заслонка пропускает поток в выбранном направлении. Закрытая заслонка или выключенный вентилятор останавливает поток.
2. The flag follows the airflow; in still air it hangs down. / Флаг следует потоку; без потока он свисает.
3. This one-way wheel turns only in rightward airflow. / Это однонаправленное колесо вращается только при потоке вправо.
4. A turning wheel brings the boat to the dock; otherwise it stays away. / Вращающееся колесо подводит лодку к причалу; иначе лодка остаётся вдали.

**Target:** Flag right and boat docked. / Флаг направлен вправо; лодка у причала.

**Hints:** H1 “The flag and boat both depend on the airflow.” / «И флаг, и лодка зависят от потока.» H2 “The wheel accepts only one direction.” / «Колесо работает только в одном направлении.» H3 “Consider the fan selector.” / «Обратите внимание на переключатель вентилятора.»

**Recap:** “Rightward fan → rightward airflow → rightward flag and turning wheel → boat docked. Stopping the air cannot bring the boat home.” / «Вентилятор вправо → поток вправо → флаг вправо и вращение колеса → лодка у причала. Остановка воздуха не возвращает лодку домой.»

#### A02 — The Bell That Forgot to Ring / Колокольчик забыл зазвенеть

**Single solution · Foundation · A correct strength with a separate inhibit control.**

Curator: “The audience arrived. The bell is still considering it.” / «Слушатель уже пришёл. Колокольчик ещё раздумывает.»

**Six objects:** `blower` Blower dial / Регулятор нагнетателя; `mute` Felt mute / Фетровый глушитель; `stream` Stream window / Окно струи; `chime` Chime / Колокольчик; `feather` Feather balance / Балансир с пером; `listener` Paper listener / Бумажный слушатель.

**Art:** a small listening station with a plainly visible removable felt clamp. The feather has three unmistakable heights. Ringing is conveyed by the chime striker pose and text, never only by sound.

```json
{
  "id": "A02", "solutionType": "single",
  "sources": {"blower": ["off", "low", "high"], "mute": ["on", "off"]},
  "derived": {"stream": ["still", "gentle", "strong"], "chime": ["ringing", "silent"], "feather": ["resting", "level", "lifted"], "listener": ["pleased", "waiting"]},
  "initial": {"blower": "low", "mute": "on"},
  "canonical": {"blower": "low", "mute": "off"},
  "rules": {
    "stream": "choose(blower == 'off', 'still', choose(blower == 'low', 'gentle', 'strong'))",
    "chime": "choose(stream == 'gentle' and mute == 'off', 'ringing', 'silent')",
    "feather": "choose(stream == 'still', 'resting', choose(stream == 'gentle', 'level', 'lifted'))",
    "listener": "choose(chime == 'ringing' and feather == 'level', 'pleased', 'waiting')"
  },
  "target": "listener == 'pleased'",
  "solutions": [{"source": "mute", "value": "off"}]
}
```

**Four rule cards:**
1. Off, low and high blower settings produce still, gentle and strong air. / Выключенный, слабый и сильный режимы дают отсутствие потока, мягкий и сильный поток.
2. The chime rings only in gentle air with the mute off; strong air holds the striker aside. / Колокольчик звенит только при мягком потоке и снятом глушителе; сильный поток отводит язычок в сторону.
3. Still air leaves the feather resting, gentle air holds it level, strong air lifts it. / Без потока перо лежит, мягкий поток держит его горизонтально, сильный поднимает.
4. The listener is pleased only with a ringing chime and a level feather. / Слушатель доволен только при звенящем колокольчике и горизонтальном пере.

**Target:** Listener pleased. / Слушатель доволен.

**Hints:** H1 “Compare the feather and the chime.” / «Сопоставьте перо и колокольчик.» H2 “The feather's level pose comes from gentle air, the same stream the chime receives.” / «Горизонтальное положение пера создаётся мягким потоком — тем же, который получает колокольчик.» H3 “Inspect the felt mute.” / «Проверьте фетровый глушитель.»

**Recap:** “Removing the mute lets the existing gentle air ring the chime while keeping the feather level. More air would not help.” / «Снятый глушитель позволяет уже мягкому потоку зазвенеть в колокольчике, сохраняя перо горизонтальным. Усиление потока не поможет.»

#### A03 — The Kite's Small Appointment / Маленькая встреча воздушного змея

**Single solution · Developing · One route powers one destination.**

Curator: “The kite has an appointment upstairs.” / «У воздушного змея встреча наверху.»

**Six objects:** `fan` Fan switch / Выключатель вентилятора; `gate` Fork gate / Заслонка развилки; `windsock` Windsock / Ветроуказатель; `fork` Route window / Окно маршрута; `kite` Kite / Воздушный змей; `parcel` Parcel trolley / Тележка с посылкой.

**Art:** a clear forked duct, a kite on the right route and parcel rail on the left. The windsock indicates supply before the fork. The target openly requests that the parcel remain waiting; do not imply that every object should be activated.

```json
{
  "id": "A03", "solutionType": "single",
  "sources": {"fan": ["off", "on"], "gate": ["left", "right"]},
  "derived": {"windsock": ["empty", "full"], "fork": ["still", "left", "right"], "kite": ["grounded", "high"], "parcel": ["waiting", "delivered"]},
  "initial": {"fan": "on", "gate": "left"},
  "canonical": {"fan": "on", "gate": "right"},
  "rules": {
    "windsock": "choose(fan == 'on', 'full', 'empty')",
    "fork": "choose(windsock == 'full', gate, 'still')",
    "kite": "choose(fork == 'right', 'high', 'grounded')",
    "parcel": "choose(fork == 'left', 'delivered', 'waiting')"
  },
  "target": "windsock == 'full' and kite == 'high' and parcel == 'waiting'",
  "solutions": [{"source": "gate", "value": "right"}]
}
```

**Four rule cards:**
1. An on fan fills the windsock; an off fan leaves it empty. / Включённый вентилятор наполняет ветроуказатель; выключенный оставляет его пустым.
2. A full windsock means the selected fork receives air; otherwise both routes are still. / При наполненном ветроуказателе воздух идёт по выбранной ветке; иначе потока нет.
3. Only the right route lifts the kite. / Только правая ветка поднимает змея.
4. Only the left route delivers the parcel; otherwise it waits. / Только левая ветка доставляет посылку; иначе она ждёт.

**Target:** Windsock full, kite high, parcel waiting. / Ветроуказатель наполнен; змей поднят; посылка ждёт.

**Hints:** H1 “Read both destinations of the fork.” / «Рассмотрите оба назначения развилки.» H2 “The route window feeds both the kite and the parcel; each responds to a different branch.” / «Окно маршрута связано и со змеем, и с посылкой; каждый реагирует на свою ветку.» H3 “Consider the fork gate.” / «Обратите внимание на заслонку развилки.»

**Recap:** “Gate right → the supplied air lifts the kite and leaves the parcel waiting. The fan stays on.” / «Заслонка вправо → имеющийся поток поднимает змея и оставляет посылку в ожидании. Вентилятор остаётся включённым.»

#### A04 — No Draft, Please / Пожалуйста, без сквозняка

**Single solution · Developing · Preserve upstream direction, reverse downstream direction.**

Curator: “The reader likes fresh air. The page has conditions.” / «Читатель любит свежий воздух. У страницы есть условия.»

**Six objects:** `inlet` Inlet selector / Переключатель входа; `deflector` Deflector lever / Рычаг отражателя; `ribbon` Entrance ribbon / Лента у входа; `draft` Desk-flow window / Окно потока у стола; `page` Book page / Страница книги; `candle` Toy candle / Игрушечная свеча.

**Art:** a reading nook with a returning duct and broad ribbon. The candle is an articulated flame-shaped card, explicitly not a real flame. The toy's preferred page direction is a local mechanical convention.

```json
{
  "id": "A04", "solutionType": "single",
  "sources": {"inlet": ["left", "right"], "deflector": ["straight", "return"]},
  "derived": {"ribbon": ["left", "right"], "draft": ["left", "right"], "page": ["flat", "fluttering"], "candle": ["steady", "leaning"]},
  "initial": {"inlet": "right", "deflector": "straight"},
  "canonical": {"inlet": "right", "deflector": "return"},
  "rules": {
    "ribbon": "inlet",
    "draft": "choose(deflector == 'straight', ribbon, choose(ribbon == 'left', 'right', 'left'))",
    "page": "choose(draft == 'left', 'flat', 'fluttering')",
    "candle": "choose(page == 'flat', 'steady', 'leaning')"
  },
  "target": "ribbon == 'right' and page == 'flat' and candle == 'steady'",
  "solutions": [{"source": "deflector", "value": "return"}]
}
```

**Four rule cards:**
1. The entrance ribbon follows the inlet direction. / Входная лента следует направлению входа.
2. Straight routing preserves that direction; return routing reverses it at the desk. / Прямой маршрут сохраняет направление; возвратный меняет его на противоположное у стола.
3. In this toy, leftward desk air holds the page flat; rightward air makes it flutter. / В этой игрушке поток влево прижимает страницу, поток вправо заставляет её колыхаться.
4. The candle linkage is steady with a flat page and leans with a fluttering page. / Связанный механизм свечи стоит ровно при прижатой странице и наклоняется при колышущейся.

**Target:** Entrance ribbon right, page flat, candle steady. / Входная лента вправо; страница прижата; свеча стоит ровно.

**Hints:** H1 “Compare air before and after the deflector.” / «Сопоставьте поток до и после отражателя.» H2 “The deflector maps the entrance ribbon's direction to desk airflow without changing the entrance itself.” / «Отражатель преобразует направление входной ленты в поток у стола, не меняя сам вход.» H3 “Inspect the deflector lever.” / «Проверьте рычаг отражателя.»

**Recap:** “Return routing reverses the air only at the desk. The entrance ribbon stays rightward while the page and candle settle.” / «Возвратный маршрут меняет поток только у стола. Входная лента остаётся направленной вправо, а страница и свеча успокаиваются.»

#### A05 — A Breeze from Either Door / Ветерок из любой двери

**Open solution · Discovery · Two sources merge before three consequences.**

Curator: “The room needs a breeze, not a weather event.” / «Комнате нужен ветерок, а не погодное явление.»

**Six objects:** `window` Window latch / Защёлка окна; `fan` Fan switch / Выключатель вентилятора; `breeze` Breeze meter / Измеритель ветерка; `pennant` Pennant / Вымпел; `pinwheel` Pinwheel / Вертушка; `cup` Teacup / Чашка.

**Art:** window and fan enter the same short manifold. The cup's surface has large smooth/rippled state shapes. Both sources are equally visually inviting; no preferred repair is telegraphed by gold highlighting.

```json
{
  "id": "A05", "solutionType": "open",
  "sources": {"window": ["closed", "open"], "fan": ["off", "on"]},
  "derived": {"breeze": ["none", "gentle", "strong"], "pennant": ["hanging", "right", "taut"], "pinwheel": ["stopped", "turning", "fast"], "cup": ["calm", "rippling"]},
  "initial": {"window": "closed", "fan": "off"},
  "canonical": {"window": "open", "fan": "off"},
  "rules": {
    "breeze": "choose(window == 'open' and fan == 'on', 'strong', choose(window == 'open' or fan == 'on', 'gentle', 'none'))",
    "pennant": "choose(breeze == 'none', 'hanging', choose(breeze == 'gentle', 'right', 'taut'))",
    "pinwheel": "choose(breeze == 'none', 'stopped', choose(breeze == 'gentle', 'turning', 'fast'))",
    "cup": "choose(breeze == 'strong', 'rippling', 'calm')"
  },
  "target": "breeze == 'gentle' and pinwheel == 'turning' and cup == 'calm'",
  "solutions": [{"source": "window", "value": "open"}, {"source": "fan", "value": "on"}]
}
```

**Four rule cards:**
1. One active supply makes a gentle breeze; both make strong air; neither makes no breeze. / Один источник даёт мягкий ветерок, два — сильный поток, ни одного — отсутствие потока.
2. With no breeze the pennant hangs; gentle air points it right; strong air pulls it taut. / Без потока вымпел свисает, мягкий поток направляет его вправо, сильный натягивает.
3. The pinwheel is stopped, turning or fast for no, gentle or strong air respectively. / Без потока вертушка неподвижна, при мягком вращается, при сильном вращается быстро.
4. Strong air ripples the cup; otherwise its surface is calm. / Сильный поток создаёт рябь в чашке; иначе поверхность спокойна.

**Target:** Gentle breeze, normally turning pinwheel, calm cup. / Мягкий ветерок; обычное вращение вертушки; спокойная поверхность в чашке.

**Hints:** H1 “The window and fan join at the breeze meter.” / «Окно и вентилятор соединяются у измерителя ветерка.» H2 “One supply is sufficient; two would be too much.” / «Достаточно одного источника; два дают слишком сильный поток.» H3 “Either the window latch or the fan can be your control.” / «Можно выбрать защёлку окна или вентилятор.»

**Recap:** “Opening the window or switching on the fan creates the same gentle breeze. Both accepted repairs turn the pinwheel without disturbing the cup.” / «Открытое окно или включённый вентилятор создают одинаковый мягкий ветерок. Оба верных исправления вращают вертушку, не тревожа чашку.»

#### A06 — The Paper Orchestra / Бумажный оркестр

**Single solution · Synthesis · Parallel branches combine at an audience mechanism.**

Curator: “The audience asked for a duet, not a marching band.” / «Публика просила дуэт, а не духовой парад.»

**Six objects:** `speed` Fan-speed dial / Регулятор скорости вентилятора; `mode` Reed selector / Переключатель язычков; `streamer` Streamer / Лента; `reed` Reed box / Коробка язычков; `drummer` Paper drummer / Бумажный барабанщик; `audience` Audience card / Карточка публики.

**Art:** two reed tabs are visibly paired in duet mode; solo uses one. An audience card leans forward only in the listening state. Chord/note and soft/loud are displayed with live labels and large symbols, so audio-off play is complete.

```json
{
  "id": "A06", "solutionType": "single",
  "sources": {"speed": ["slow", "fast"], "mode": ["duet", "solo"]},
  "derived": {"streamer": ["level", "taut"], "reed": ["chord", "note"], "drummer": ["soft", "loud"], "audience": ["listening", "waiting"]},
  "initial": {"speed": "fast", "mode": "duet"},
  "canonical": {"speed": "slow", "mode": "duet"},
  "rules": {
    "streamer": "choose(speed == 'slow', 'level', 'taut')",
    "reed": "choose(mode == 'duet', 'chord', 'note')",
    "drummer": "choose(streamer == 'level', 'soft', 'loud')",
    "audience": "choose(reed == 'chord' and drummer == 'soft', 'listening', 'waiting')"
  },
  "target": "audience == 'listening'",
  "solutions": [{"source": "speed", "value": "slow"}]
}
```

**Four rule cards:**
1. Slow air holds the streamer level; fast air pulls it taut. / Медленный поток держит ленту горизонтально, быстрый натягивает её.
2. Duet mode selects a chord; solo mode selects one note. / Режим дуэта выбирает аккорд, соло — одну ноту.
3. A level streamer makes the drummer soft; a taut streamer makes it loud. / Горизонтальная лента задаёт тихую игру барабанщика, натянутая — громкую.
4. The audience listens only to a chord with soft drumming. / Публика слушает только аккорд с тихим барабаном.

**Target:** Audience listening. / Публика слушает.

**Hints:** H1 “Separate the melody branch from the volume branch.” / «Разделите ветку мелодии и ветку громкости.» H2 “The streamer controls the drummer's volume; the reed selector controls the notes separately.” / «Лента управляет громкостью барабанщика; переключатель язычков отдельно управляет нотами.» H3 “Consider the fan-speed dial.” / «Обратите внимание на регулятор скорости вентилятора.»

**Recap:** “Slow fan → level streamer → soft drummer. The duet remains a chord, and the audience begins listening.” / «Медленный вентилятор → горизонтальная лента → тихий барабанщик. Дуэт сохраняет аккорд, и публика начинает слушать.»

#### A07 — A Parcel for the Upper Shelf / Посылка на верхнюю полку

**Single solution · Synthesis · Exact threshold plus route, with unsafe alternatives made explicit.**

Curator: “The address is upstairs. Enthusiasm alone will not deliver it.” / «Адрес наверху. Одного усердия для доставки мало.»

**Six objects:** `pump` Pump dial / Регулятор насоса; `diverter` Route diverter / Переключатель маршрута; `gauge` Pressure gauge / Манометр; `tube` Destination window / Окно назначения; `capsule` Postal capsule / Почтовая капсула; `stamp` Receipt stamp / Штамп квитанции.

**Art:** a pneumatic postal cabinet with large upper/lower route labels. Pressure uses one, two or three embossed bars. A lodged capsule is visibly stationary between guides, not lost or broken.

```json
{
  "id": "A07", "solutionType": "single",
  "sources": {"pump": ["low", "medium", "high"], "diverter": ["upper", "lower"]},
  "derived": {"gauge": [1, 2, 3], "tube": ["upper", "lower"], "capsule": ["upper", "lower", "lodged"], "stamp": ["accepted", "blank"]},
  "initial": {"pump": "medium", "diverter": "lower"},
  "canonical": {"pump": "medium", "diverter": "upper"},
  "rules": {
    "gauge": "choose(pump == 'low', 1, choose(pump == 'medium', 2, 3))",
    "tube": "diverter",
    "capsule": "choose(gauge == 2, tube, 'lodged')",
    "stamp": "choose(capsule == 'upper', 'accepted', 'blank')"
  },
  "target": "gauge == 2 and capsule == 'upper' and stamp == 'accepted'",
  "solutions": [{"source": "diverter", "value": "upper"}]
}
```

**Four rule cards:**
1. Low, medium and high pump settings produce one, two and three pressure marks. / Низкий, средний и высокий режимы дают одну, две и три отметки давления.
2. The diverter selects the upper or lower destination window. / Переключатель выбирает верхнее или нижнее окно назначения.
3. At exactly two marks the capsule reaches the selected destination; at one or three it lodges. / Ровно при двух отметках капсула достигает выбранного места; при одной или трёх застревает.
4. Only an upper-shelf delivery prints the acceptance stamp. / Только доставка на верхнюю полку ставит штамп приёмки.

**Target:** Two pressure marks; capsule upper; receipt accepted. / Две отметки давления; капсула наверху; квитанция принята.

**Hints:** H1 “Compare pressure with destination.” / «Сопоставьте давление и назначение.» H2 “Two marks are already correct; more pressure would lodge the capsule.” / «Две отметки уже верны; большее давление остановит капсулу.» H3 “Inspect the route diverter.” / «Проверьте переключатель маршрута.»

**Recap:** “Upper route plus the existing two pressure marks → upper delivery → acceptance stamp. Increasing power is not the repair.” / «Верхний маршрут и уже имеющиеся две отметки давления → доставка наверх → штамп приёмки. Увеличение мощности не является исправлением.»

#### A08 — The Wind's Final Signature / Последняя подпись ветра

**Single solution · Collection finale · Inhibit gate followed by a directional chain.**

Curator: “The wind has agreed to sign, provided the pen goes the right way.” / «Ветер согласился подписать, если перо пойдёт в нужную сторону.»

**Six objects:** `fan` Rotation selector / Переключатель вращения; `clutch` Clutch lever / Рычаг сцепления; `wheel` Drive wheel / Приводное колесо; `cam` Cam marker / Метка кулачка; `pen` Signing pen / Перо для подписи; `scroll` Visitor scroll / Свиток посетителей.

**Art:** a compact air-powered signing automaton. Clockwise/counterclockwise use asymmetric arrow sprites with live labels. The pen's down state is a broad silhouette change. The scroll's signature is an abstract flourish, not generated personal handwriting or a real name.

```json
{
  "id": "A08", "solutionType": "single",
  "sources": {"fan": ["clockwise", "counterclockwise"], "clutch": ["engaged", "released"]},
  "derived": {"wheel": ["clockwise", "counterclockwise", "stopped"], "cam": ["aligned", "offset"], "pen": ["down", "up"], "scroll": ["signed", "blank"]},
  "initial": {"fan": "counterclockwise", "clutch": "engaged"},
  "canonical": {"fan": "clockwise", "clutch": "engaged"},
  "rules": {
    "wheel": "choose(clutch == 'released', 'stopped', fan)",
    "cam": "choose(wheel == 'clockwise', 'aligned', 'offset')",
    "pen": "choose(cam == 'aligned', 'down', 'up')",
    "scroll": "choose(pen == 'down' and wheel == 'clockwise', 'signed', 'blank')"
  },
  "target": "scroll == 'signed'",
  "solutions": [{"source": "fan", "value": "clockwise"}]
}
```

**Four rule cards:**
1. An engaged clutch passes the selected rotation; a released clutch stops the wheel. / Включённое сцепление передаёт выбранное вращение, отключённое останавливает колесо.
2. Only clockwise rotation aligns the cam. / Только вращение по часовой стрелке совмещает кулачок с меткой.
3. An aligned cam lowers the pen; an offset cam raises it. / Совмещённый кулачок опускает перо, смещённый поднимает.
4. A lowered pen and clockwise wheel sign the scroll; otherwise it stays blank. / Опущенное перо и вращение по часовой стрелке подписывают свиток; иначе он остаётся пустым.

**Target:** Scroll signed. / Свиток подписан.

**Hints:** H1 “Follow wheel → cam → pen.” / «Проследите цепочку: колесо → кулачок → перо.» H2 “Stopping the wheel does not align the cam.” / «Остановка колеса не совмещает кулачок.» H3 “Consider the rotation selector.” / «Обратите внимание на переключатель вращения.»

**Recap:** “Clockwise rotation passes through the engaged clutch, aligns the cam and lowers the pen. The scroll receives its signature.” / «Вращение по часовой стрелке передаётся через включённое сцепление, совмещает кулачок и опускает перо. На свитке появляется подпись.»

<!-- AIR_END -->

### 10.4 Water collection — W01–W08

All Water scenes show a **settled toy-model snapshot**, not water integrating over time. Waiting longer never changes the answer. Tanks, drains and pressure use the local discrete conventions printed on their cards.

#### W01 — A Puddle Outside Its Frame / Лужа за рамкой

**Single solution · Introduction · Fix the spill without removing useful water.**

Curator: “The duck likes the pond. The floor would rather not join it.” / «Утке нравится пруд. Пол предпочёл бы к нему не присоединяться.»

**Six objects:** `tap` Tap / Кран; `drain` Drain lever / Рычаг слива; `basin` Basin / Бассейн; `spill` Overflow channel / Переливной канал; `floor` Floor tile / Плитка пола; `duck` Wooden duck / Деревянная утка.

**Art:** a shallow ceramic basin with two large level marks, a visible overflow lip and a separate floor tile. The duck sits on a transparent carrier, with clearly floating/grounded poses. The drain must be visible, not a one-pixel hole.

```json
{
  "id": "W01", "solutionType": "single",
  "sources": {"tap": ["open", "closed"], "drain": ["open", "closed"]},
  "derived": {"basin": ["empty", "low", "full"], "spill": ["flowing", "stopped"], "floor": ["wet", "dry"], "duck": ["afloat", "grounded"]},
  "initial": {"tap": "open", "drain": "closed"},
  "canonical": {"tap": "open", "drain": "open"},
  "rules": {
    "basin": "choose(tap == 'closed', 'empty', choose(drain == 'open', 'low', 'full'))",
    "spill": "choose(basin == 'full', 'flowing', 'stopped')",
    "floor": "choose(spill == 'flowing', 'wet', 'dry')",
    "duck": "choose(basin == 'empty', 'grounded', 'afloat')"
  },
  "target": "floor == 'dry' and duck == 'afloat' and basin == 'low'",
  "solutions": [{"source": "drain", "value": "open"}]
}
```

**Four rule cards:**
1. In this settled model, a closed tap leaves an empty basin. An open tap gives low water with an open drain, full water with a closed drain. / В этой установившейся модели закрытый кран оставляет бассейн пустым. Открытый кран даёт низкий уровень при открытом сливе и полный бассейн при закрытом.
2. Only a full basin sends water into the overflow channel. / Только полный бассейн направляет воду в переливной канал.
3. Flowing overflow wets the floor; stopped overflow leaves it dry. / Перелив мочит пол; без перелива пол сухой.
4. The duck floats at low or full water and rests on the bottom when empty. / Утка плавает при низком и полном уровне, а в пустом бассейне стоит на дне.

**Target:** Dry floor, floating duck, low basin water. / Сухой пол; утка на плаву; низкий уровень в бассейне.

**Hints:** H1 “Read the floor and duck together.” / «Рассмотрите пол и утку вместе.» H2 “The basin level determines whether the duck floats; an empty basin cannot meet that condition.” / «Уровень бассейна определяет, плавает ли утка; пустой бассейн не выполнит это условие.» H3 “Consider the drain lever.” / «Обратите внимание на рычаг слива.»

**Recap:** “Open drain → low water → no overflow → dry floor, while the duck still floats. Closing the tap would remove the water the target needs.” / «Открытый слив → низкий уровень → нет перелива → сухой пол, а утка остаётся на плаву. Закрытый кран убрал бы воду, нужную по условию.»

#### W02 — The Fountain's Indoor Umbrella / Домашний зонтик фонтана

**Single solution · Developing · The middle setting, not the maximum.**

Curator: “The fountain is practicing restraint.” / «Фонтан упражняется в сдержанности.»

**Six objects:** `pump` Pump dial / Регулятор насоса; `hood` Catching hood / Улавливающий колпак; `jet` Fountain jet / Струя фонтана; `canopy` Catch sensor / Датчик улавливания; `gutter` Return gutter / Возвратный желоб; `postcard` Visitor postcard / Открытка посетителя.

**Art:** a toy fountain with three discrete arch heights. The hood and its catch sensor are separate semantic objects with separate large bounds. A short jet falls before the hood; a tall jet overshoots it; only the neat middle arc enters the hood. An exposed splash tray explains the postcard's modeled wet state for uncaught arcs.

```json
{
  "id": "W02", "solutionType": "single",
  "sources": {"pump": ["low", "medium", "high"], "hood": ["centered", "aside"]},
  "derived": {"jet": ["short", "neat", "tall"], "canopy": ["catching", "missing"], "gutter": ["flowing", "stopped"], "postcard": ["dry", "wet"]},
  "initial": {"pump": "high", "hood": "centered"},
  "canonical": {"pump": "medium", "hood": "centered"},
  "rules": {
    "jet": "choose(pump == 'low', 'short', choose(pump == 'medium', 'neat', 'tall'))",
    "canopy": "choose(hood == 'centered' and jet == 'neat', 'catching', 'missing')",
    "gutter": "choose(canopy == 'catching' and jet == 'neat', 'flowing', 'stopped')",
    "postcard": "choose(canopy == 'catching', 'dry', 'wet')"
  },
  "target": "gutter == 'flowing' and postcard == 'dry'",
  "solutions": [{"source": "pump", "value": "medium"}]
}
```

**Four rule cards:**
1. Low, medium and high pump settings make a short, neat and tall arc. / Низкий, средний и высокий режимы дают короткую, аккуратную и высокую дугу.
2. The centered hood catches only the neat arc; all other combinations miss. / Колпак по центру ловит только аккуратную дугу; при остальных сочетаниях струя проходит мимо.
3. The gutter flows only when the neat arc is caught. / Желоб наполняется только при пойманной аккуратной дуге.
4. In this splash model the postcard is dry when the hood catches the water; otherwise it is wet. / В этой модели брызг открытка сухая, когда колпак ловит воду; иначе она мокрая.

**Target:** Flowing return gutter and dry postcard. / Вода идёт по возвратному желобу; открытка сухая.

**Hints:** H1 “Follow the jet through the hood to the gutter.” / «Проследите путь струи через колпак к желобу.» H2 “Only the middle arc reaches the hood correctly.” / «Только средняя дуга правильно попадает в колпак.» H3 “Consider the pump dial.” / «Обратите внимание на регулятор насоса.»

**Recap:** “Medium pump → neat arc → centered hood catches it → gutter flows and postcard stays dry.” / «Средний режим → аккуратная дуга → колпак по центру ловит воду → желоб работает, открытка сухая.»

#### W03 — The Canal Chooses a Visitor / Канал выбирает посетителя

**Single solution · Developing · Divergence and a joint downstream condition.**

Curator: “The ferry has arrived somewhere. That is not quite the same thing.” / «Паром куда-то прибыл. Но это ещё не совсем то.»

**Six objects:** `gate` Canal gate / Заслонка канала; `supply` Supply switch / Выключатель подачи; `channel` Channel window / Окно канала; `leftLock` Left lock / Левый шлюз; `rightLock` Right lock / Правый шлюз; `ferry` Ferry / Паром.

**Art:** a forked ceramic canal, two visibly separate lock chambers and a ferry carriage at the right dock. The dry branch is drawn as a distinct empty channel, not an invisible path. Direction is fixed relative to the scene.

```json
{
  "id": "W03", "solutionType": "single",
  "sources": {"gate": ["left", "right"], "supply": ["off", "on"]},
  "derived": {"channel": ["dry", "left", "right"], "leftLock": ["empty", "full"], "rightLock": ["empty", "full"], "ferry": ["docked", "waiting"]},
  "initial": {"gate": "left", "supply": "on"},
  "canonical": {"gate": "right", "supply": "on"},
  "rules": {
    "channel": "choose(supply == 'off', 'dry', gate)",
    "leftLock": "choose(channel == 'left', 'full', 'empty')",
    "rightLock": "choose(channel == 'right', 'full', 'empty')",
    "ferry": "choose(rightLock == 'full' and leftLock == 'empty', 'docked', 'waiting')"
  },
  "target": "ferry == 'docked'",
  "solutions": [{"source": "gate", "value": "right"}]
}
```

**Four rule cards:**
1. Supply on sends water to the selected side; supply off leaves the channel dry. / Включённая подача направляет воду в выбранную сторону; выключенная оставляет канал сухим.
2. Only a leftward channel fills the left lock. / Только левый маршрут наполняет левый шлюз.
3. Only a rightward channel fills the right lock. / Только правый маршрут наполняет правый шлюз.
4. The ferry docks only with a full right lock and empty left lock. / Паром причаливает только при полном правом и пустом левом шлюзе.

**Target:** Ferry docked. / Паром у причала.

**Hints:** H1 “The ferry depends on both locks.” / «Паром зависит от обоих шлюзов.» H2 “The channel route fills one lock and leaves the other empty.” / «Маршрут канала наполняет один шлюз и оставляет другой пустым.» H3 “Inspect the canal gate.” / «Проверьте заслонку канала.»

**Recap:** “Gate right → right lock full and left lock empty → ferry docked. Cutting supply would empty both locks.” / «Заслонка вправо → правый шлюз полный, левый пустой → паром у причала. Отключение подачи опустошило бы оба шлюза.»

#### W04 — The Cloud with a Return Address / Облако с обратным адресом

**Single solution · Foundation · A small closed-system chain.**

Curator: “This cloud sends all its rain home.” / «Это облако отправляет весь дождь домой.»

**Six objects:** `heater` Heater selector / Переключатель нагревателя; `lid` Lid latch / Защёлка крышки; `vapor` Vapor window / Окно пара; `ceiling` Condensation panel / Панель конденсации; `dropper` Dropper / Капельник; `garden` Paper garden / Бумажный сад.

**Art:** a sealed tabletop weather cabinet, obvious lid seam, large misted/clear panel and a broad droplet position. This is an illustrated instantaneous model of a toy water cycle, not real heat transfer; no waiting for evaporation and no simulated temperature gauge.

```json
{
  "id": "W04", "solutionType": "single",
  "sources": {"heater": ["cool", "warm"], "lid": ["open", "closed"]},
  "derived": {"vapor": ["absent", "present"], "ceiling": ["clear", "misted"], "dropper": ["stopped", "dropping"], "garden": ["dry", "watered"]},
  "initial": {"heater": "cool", "lid": "closed"},
  "canonical": {"heater": "warm", "lid": "closed"},
  "rules": {
    "vapor": "choose(heater == 'warm', 'present', 'absent')",
    "ceiling": "choose(vapor == 'present' and lid == 'closed', 'misted', 'clear')",
    "dropper": "choose(ceiling == 'misted', 'dropping', 'stopped')",
    "garden": "choose(dropper == 'dropping', 'watered', 'dry')"
  },
  "target": "garden == 'watered'",
  "solutions": [{"source": "heater", "value": "warm"}]
}
```

**Four rule cards:**
1. Warm produces vapor in the window; cool produces none. / Тёплый режим создаёт пар в окне, прохладный — нет.
2. Vapor mists the ceiling only with the lid closed. / Пар покрывает потолок конденсатом только при закрытой крышке.
3. A misted ceiling makes the dropper drip; a clear ceiling stops it. / Конденсат на потолке запускает капельник; чистый потолок останавливает его.
4. A dripping dropper waters the garden; otherwise it stays dry. / Работающий капельник поливает сад; иначе сад сухой.

**Target:** Garden watered. / Сад полит.

**Hints:** H1 “Trace the garden's water back to the vapor window.” / «Проследите воду сада назад к окну пара.» H2 “The lid already keeps vapor inside, but no vapor is being made.” / «Крышка уже удерживает пар внутри, но пар пока не образуется.» H3 “Consider the heater selector.” / «Обратите внимание на переключатель нагревателя.»

**Recap:** “Warm heater → vapor → condensation under the closed lid → drops → watered garden. The scene updates as a settled model, not after a real-time wait.” / «Тёплый нагреватель → пар → конденсат под закрытой крышкой → капли → политый сад. Сцена обновляется как установившаяся модель, без ожидания в реальном времени.»

#### W05 — Two Cups, One Promise / Две чаши, одно обещание

**Single solution · Synthesis · Equality alone is insufficient.**

Curator: “The bridge requires balance, and something worth balancing.” / «Мосту нужно равновесие — и то, что стоит уравновешивать.»

**Six objects:** `splitter` Splitter dial / Регулятор распределителя; `tap` Supply tap / Кран подачи; `leftCup` Left cup / Левая чаша; `rightCup` Right cup / Правая чаша; `scale` Balance beam / Коромысло весов; `bridge` Footbridge / Мостик.

**Art:** twin ceramic cups on a visible beam, with an independent small bridge connected to its latch. Both empty cups are clearly level but cannot lower the bridge. This visual distinction prevents the equality condition from feeling arbitrary.

```json
{
  "id": "W05", "solutionType": "single",
  "sources": {"splitter": ["left", "balanced", "right"], "tap": ["off", "on"]},
  "derived": {"leftCup": ["empty", "full"], "rightCup": ["empty", "full"], "scale": ["level", "tilted"], "bridge": ["lowered", "raised"]},
  "initial": {"splitter": "left", "tap": "on"},
  "canonical": {"splitter": "balanced", "tap": "on"},
  "rules": {
    "leftCup": "choose(tap == 'on' and splitter != 'right', 'full', 'empty')",
    "rightCup": "choose(tap == 'on' and splitter != 'left', 'full', 'empty')",
    "scale": "choose(leftCup == rightCup, 'level', 'tilted')",
    "bridge": "choose(scale == 'level' and leftCup == 'full', 'lowered', 'raised')"
  },
  "target": "leftCup == 'full' and rightCup == 'full' and bridge == 'lowered'",
  "solutions": [{"source": "splitter", "value": "balanced"}]
}
```

**Four rule cards:**
1. With supply on, left or balanced routing fills the left cup; otherwise it is empty. / При включённой подаче левый или равномерный маршрут наполняет левую чашу; иначе она пуста.
2. With supply on, right or balanced routing fills the right cup; otherwise it is empty. / При включённой подаче правый или равномерный маршрут наполняет правую чашу; иначе она пуста.
3. Matching cup states make the beam level; differing states tilt it. / Одинаковые состояния чаш уравновешивают коромысло, разные наклоняют его.
4. The bridge lowers only with a level beam and a full left cup; otherwise it stays raised. / Мост опускается только при ровном коромысле и полной левой чаше; иначе он поднят.

**Target:** Both cups full and bridge lowered. / Обе чаши полны; мост опущен.

**Hints:** H1 “Compare both cups with the bridge latch.” / «Сопоставьте обе чаши с защёлкой моста.» H2 “The bridge reads both the beam's balance and the left cup's fill; two empty cups are not enough.” / «Мост зависит и от равновесия коромысла, и от наполнения левой чаши; двух пустых чаш недостаточно.» H3 “Consider the splitter dial.” / «Обратите внимание на регулятор распределителя.»

**Recap:** “Balanced routing fills both cups → level beam with water present → lowered bridge. Turning supply off would create the wrong kind of balance.” / «Равномерный маршрут наполняет обе чаши → ровное коромысло при наличии воды → опущенный мост. Отключение подачи создаёт неподходящее равновесие.»

#### W06 — Two Ways to Keep a Letter Dry / Два способа сохранить письмо сухим

**Open solution · Discovery · Two different causal routes to the same safe target.**

Curator: “The letter does not mind how you help, only that the ink survives.” / «Письму неважно, как вы поможете, лишь бы сохранились чернила.»

**Six objects:** `tap` Inlet tap / Впускной кран; `drain` Outlet gate / Выпускная заслонка; `inflow` Inflow window / Окно притока; `outflow` Outflow window / Окно оттока; `level` Reservoir gauge / Указатель уровня резервуара; `letter` Letter tray / Лоток с письмом.

**Art:** a recirculating, prefilled reservoir with a clearly marked safe band and overflow band. This model retains stored water and has only safe/high levels; unlike W01, “no inflow” does not mean an empty basin. Print this difference on rule 3, not in hidden lore.

```json
{
  "id": "W06", "solutionType": "open",
  "sources": {"tap": ["open", "closed"], "drain": ["open", "closed"]},
  "derived": {"inflow": ["flowing", "stopped"], "outflow": ["flowing", "stopped"], "level": ["safe", "high"], "letter": ["dry", "wet"]},
  "initial": {"tap": "open", "drain": "closed"},
  "canonical": {"tap": "closed", "drain": "closed"},
  "rules": {
    "inflow": "choose(tap == 'open', 'flowing', 'stopped')",
    "outflow": "choose(drain == 'open', 'flowing', 'stopped')",
    "level": "choose(inflow == 'stopped' or outflow == 'flowing', 'safe', 'high')",
    "letter": "choose(level == 'safe', 'dry', 'wet')"
  },
  "target": "level == 'safe' and letter == 'dry'",
  "solutions": [{"source": "tap", "value": "closed"}, {"source": "drain", "value": "open"}]
}
```

**Four rule cards:**
1. The open inlet tap makes inflow; the closed tap stops it. / Открытый впускной кран создаёт приток, закрытый останавливает его.
2. The open outlet gate makes outflow; the closed gate stops it. / Открытая выпускная заслонка создаёт отток, закрытая останавливает его.
3. This prefilled model is safe if inflow stops or outflow runs. Only inflow without outflow makes a high level; stored water does not disappear. / В этой предварительно наполненной модели уровень безопасен, если приток остановлен или отток работает. Только приток без оттока поднимает уровень; запасённая вода не исчезает.
4. Safe water keeps the letter dry; high water wets it. / Безопасный уровень сохраняет письмо сухим, высокий мочит его.

**Target:** Safe level and dry letter. / Безопасный уровень; сухое письмо.

**Hints:** H1 “Compare what enters with what leaves.” / «Сопоставьте то, что поступает, и то, что уходит.» H2 “Either stopping inflow or enabling outflow can satisfy the safe-level rule.” / «Правило безопасного уровня допускает остановку притока или запуск оттока.» H3 “The inlet tap and outlet gate are both valid control candidates.” / «Впускной кран и выпускная заслонка — оба подходящие переключатели.»

**Recap:** “Close the inlet, or open the outlet. Each single change makes the reservoir safe and keeps the letter dry; neither is the preferred answer.” / «Закройте впуск или откройте выпуск. Каждое одиночное изменение делает уровень безопасным и сохраняет письмо сухим; предпочтительного ответа нет.»

#### W07 — The Island's Borrowed Stair / Одолженная ступенька острова

**Single solution · Synthesis · Middle level plus a preserved route.**

Curator: “The island has borrowed a stair from the water.” / «Остров одолжил у воды ступеньку.»

**Six objects:** `water` Level selector / Переключатель уровня; `sluice` Channel lever / Рычаг канала; `gauge` Level gauge / Шкала уровня; `channel` Direction vane / Указатель направления; `float` Floating step / Плавающая ступенька; `visitor` Paper visitor / Бумажный посетитель.

**Art:** a small island and a large rectangular floating step with three obvious vertical poses. The source selects a model level, not a timer or a pump that must be held. A guide vane shows toward/away through a stable arrow and label.

```json
{
  "id": "W07", "solutionType": "single",
  "sources": {"water": ["low", "mid", "high"], "sluice": ["toward", "away"]},
  "derived": {"gauge": ["low", "mid", "high"], "channel": ["toward", "away"], "float": ["resting", "step", "submerged"], "visitor": ["across", "waiting"]},
  "initial": {"water": "high", "sluice": "toward"},
  "canonical": {"water": "mid", "sluice": "toward"},
  "rules": {
    "gauge": "water",
    "channel": "sluice",
    "float": "choose(gauge == 'low', 'resting', choose(gauge == 'mid', 'step', 'submerged'))",
    "visitor": "choose(float == 'step' and channel == 'toward', 'across', 'waiting')"
  },
  "target": "gauge == 'mid' and visitor == 'across'",
  "solutions": [{"source": "water", "value": "mid"}]
}
```

**Four rule cards:**
1. The level gauge repeats the selected low, middle or high setting. / Шкала повторяет выбранный низкий, средний или высокий уровень.
2. The channel vane repeats toward-island or away-from-island routing. / Указатель канала повторяет маршрут к острову или от острова.
3. Low water leaves the float resting; middle water makes a step; high water submerges its platform in this guided model. / Низкая вода оставляет поплавок внизу, средняя создаёт ступеньку, высокая в этой модели с направляющими погружает площадку.
4. The visitor crosses only with a usable step and a channel toward the island. / Посетитель переходит только при доступной ступеньке и канале к острову.

**Target:** Middle level and visitor across. / Средний уровень; посетитель перешёл на остров.

**Hints:** H1 “Read the level gauge before changing the channel.” / «Прочитайте шкалу уровня перед изменением канала.» H2 “The gauge sets the float's height; the visitor needs that float to become a usable step.” / «Шкала задаёт высоту поплавка; посетителю нужно, чтобы поплавок стал доступной ступенькой.» H3 “Consider the level selector.” / «Обратите внимание на переключатель уровня.»

**Recap:** “Middle level → usable floating step. The preserved islandward channel lets the visitor cross. Lower is not automatically better.” / «Средний уровень → доступная плавающая ступенька. Сохранённый маршрут к острову позволяет перейти. Ниже — не обязательно лучше.»

#### W08 — Everything, in Its Own Time / Всё на своём месте

**Single solution · Museum finale · Water, air and light in one legible chain.**

Curator: “One small river has offered to close the museum.” / «Одна маленькая река вызвалась закрыть музей.»

**Six objects:** `valve` Supply valve / Подающий клапан; `route` Water-route lever / Рычаг водного маршрута; `wheel` Waterwheel / Водяное колесо; `bellows` Bellows / Меха; `lamp` Closing lamp / Лампа закрытия; `guestbook` Guestbook / Гостевая книга.

**Art:** the final exhibit combines ceramic channel, linen bellows and gold lamp on one cabinet. A visible toy linkage drives the bellows from the wheel and the lamp switch from the bellows; no implication of impossible real electricity generation. A paper guestbook receives an abstract museum seal. Its press is decorative machinery inside the guestbook's single composite sprite/hit region, not a seventh object or another control. Do not add extra interactive finale controls.

```json
{
  "id": "W08", "solutionType": "single",
  "sources": {"valve": ["open", "closed"], "route": ["wheel", "bypass"]},
  "derived": {"wheel": ["turning", "stopped"], "bellows": ["steady", "still"], "lamp": ["lit", "dark"], "guestbook": ["signed", "blank"]},
  "initial": {"valve": "open", "route": "bypass"},
  "canonical": {"valve": "open", "route": "wheel"},
  "rules": {
    "wheel": "choose(valve == 'open' and route == 'wheel', 'turning', 'stopped')",
    "bellows": "choose(wheel == 'turning', 'steady', 'still')",
    "lamp": "choose(bellows == 'steady', 'lit', 'dark')",
    "guestbook": "choose(lamp == 'lit' and wheel == 'turning', 'signed', 'blank')"
  },
  "target": "lamp == 'lit' and guestbook == 'signed'",
  "solutions": [{"source": "route", "value": "wheel"}]
}
```

**Four rule cards:**
1. An open valve and wheel route turn the waterwheel; a closed valve or bypass stops it. / Открытый клапан и маршрут через колесо вращают его; закрытый клапан или обход останавливают.
2. A turning wheel drives the bellows steadily; a stopped wheel leaves them still. / Вращающееся колесо приводит меха в равномерное движение; остановленное оставляет их неподвижными.
3. Steady bellows press the toy lamp switch on; still bellows leave the lamp dark. / Равномерно движущиеся меха нажимают игрушечный выключатель лампы; неподвижные оставляют её тёмной.
4. The press signs the guestbook only with a lit lamp and turning wheel. / Пресс подписывает гостевую книгу только при горящей лампе и вращающемся колесе.

**Target:** Closing lamp lit and guestbook signed. / Лампа закрытия горит; гостевая книга подписана.

**Hints:** H1 “Follow the waterwheel through air to light.” / «Проследите путь от водяного колеса через воздух к свету.» H2 “The valve already supplies water, but the route avoids the wheel.” / «Клапан уже подаёт воду, но маршрут обходит колесо.» H3 “Inspect the water-route lever.” / «Проверьте рычаг водного маршрута.»

**Recap:** “Wheel route → turning waterwheel → steady bellows → lit lamp → signed guestbook. One change lets water, air and light agree.” / «Маршрут через колесо → вращение колеса → равномерное движение мехов → горящая лампа → подписанная книга. Одно изменение согласует воду, воздух и свет.»

If this is the 24th explored exhibit, show the closing postcard and curator's final line. If visited earlier through a challenge, show the ordinary result without claiming that the entire museum is complete.

<!-- CATALOGUE_END -->

## 11. Content data, validation and publishing

### 11.1 Production content schema

Convert each catalogue fixture into a versioned, schema-validated content record. The JSON in section 10 fixes the game semantics; the production format adds presentation and operational metadata without changing those semantics.

| Group | Required fields |
|---|---|
| Identity | `gameId`, `exhibitId`, `collectionId`, `catalogueOrder`, `contentVersion`, `rulesVersion`, `competitionVersion`, `assistanceFamilyId`, `schemaVersion` |
| Copy | EN/RU `title`, optional `curatorNote`, `targetHeading`, separately keyed target clauses, four rule cards, three hints, full recap, alternative-repair explanation |
| Model | Source domains, effect domains, allowlisted expression ASTs, node dependencies, topological order, opening sources, target AST, solution type |
| Private authoring data | Canonical sources, complete enumerated repair set, corruption source/value, reviewer decisions, validation report |
| Node presentation | Stable ID, EN/RU name, role, per-state label key, per-state visual mapping, bounds, hit region, focus order, connected rule IDs |
| Media | Background, state sprites, thumbnail, share crop, frame anchors, optional state cues, reduced-motion mapping, hashes and byte sizes |
| Editorial | Difficulty band, dependency-pattern tags, simplified-model note, EN/RU reviewer sign-off, accessibility review status |
| Rights | Asset register references, generator/download provenance, license copies, review status |
| Release | Draft/reviewed/published/withdrawn status, immutable revision checksum, publish timestamp, withdrawal reason, replacement link if any |

Each target clause has its own stable ID and text, even where the master fixture contains a one-clause target. Do not create a target clause by guessing from the illustration. Object names and state labels are keyed by `(exhibitId, nodeId, stateToken, locale)` so that `soft` for a window can differ from `soft` for a drum.

### 11.2 Client-public and service-private data

The client receives the six nodes, all source domains, all four local rules, the opening state, full target, public state labels and artwork. This is required for honest, accessible play and offline inspection.

Keep canonical sources, precomputed solution arrays, unpublished editorial notes and undisclosed hint/reveal text out of the initial client payload and source maps. Hint/reveal endpoints return only acknowledged disclosures. This avoids accidental spoilers; it does not make the puzzle's mathematically enumerable solution secret from a determined client.

Never use “the client cannot know the answer” as the security boundary. The service independently recomputes every result, controls assistance, verifies payments and grants completion once. Do not ship a hidden canonical-answer comparison that rejects an allowed alternative.

### 11.3 Required authoring validator

The content build must fail on any of these conditions:

1. Missing or duplicate exhibit/node/rule/target IDs; not exactly 24 published launch exhibits in the expected three groups of eight.
2. Not exactly two sources and four effects; source/effect ID overlap; missing or duplicate rule ownership.
3. Undeclared references, cycles, non-total functions, wrong output types, duplicate domain values, invalid defaults or any result outside its declared domain.
4. Opening state already satisfies the target; canonical state fails it; more or fewer than one canonical/opening source difference.
5. No legal single-source solution, undeclared accepted alternative, incorrect Single/Open label or a mismatch between enumerated and authored repair sets.
6. A target clause that references unavailable information; a rule that is only present in artwork; a selectable effect or source value not in its domain.
7. Missing EN/RU copy, missing any per-node domain label, placeholder copy, lost directional equivalence or a text key resolving to a raw token in a final build.
8. Missing visual mapping, invalid hit bounds, absent low-motion equivalent, missing rights record, unapproved generated image or an SVG in the shipped art/icon pipeline.
9. Content declared published without required editorial and rights sign-offs.

Additionally emit **warnings requiring editorial disposition**, not automatic puzzle rejection, for unreachable declared effect states, redundant target clauses, repeated dependency patterns and very short repair search spaces. Some redundancy helps teach the chain; it must be intentional. Do not artificially add controls to make a warning disappear.

Enumerate the Cartesian product of source domains to check totality. Separately enumerate only one-source changes from the opening state to check repair acceptance. The latter must not accidentally accept a two-source combination just because it satisfies the target.

### 11.4 Known catalogue accounting and documentary verification

The specification fixtures were independently evaluated during document preparation using a restricted AST evaluator, without building the game. Results for this exact baseline:

| Audit measure | Result |
|---|---:|
| Exhibits | 24 |
| Interactive semantic objects | 144 |
| Source objects / effect objects | 48 / 96 |
| Local rule cards | 96 |
| Full source configurations checked | 112 |
| Legal non-no-op single-source proposals checked | 56 |
| Accepted repairs | 27 |
| Single solution / Open solution exhibits | 21 / 3 |
| Source/effect state-to-visual mappings required | 317 |

**317 is the number of node/domain mappings, not necessarily 317 unique image files.** An approved shared sprite or exact transform can serve multiple mappings, but every mapping must exist and be reviewed. Source/effect labels require the same complete coverage in both locales. This audit confirms finite-model consistency, not art quality, translation approval, accessibility or player enjoyment. The implementation must regenerate the audit from the final shipped content rather than citing this document as a substitute for tests.

The three Open solution exhibits intentionally have two legal proposals and both are valid. Their purpose is to teach non-preferred alternatives, not to supply the collection's hardest challenge. L03, L05, A04, A07, W01, W05 and W07 carry the clearest “plausible symptom fix is not enough” lessons.

### 11.5 Publishing and version policy

Use immutable content artifacts addressed by hash. Editing a live JSON file in place is forbidden. Content publication is a build/deploy operation with a validator report and reviewer metadata; a web CMS is not required.

- `contentVersion` changes for any shipped content or copy revision.
- `rulesVersion` changes when the model, opening source snapshot, domains or target changes.
- `competitionVersion` identifies an immutable accepted-solution/score comparison cohort. A changed opening snapshot, declared rule, domain, target, scoring policy or enumerated accepted repair set **must** create a new competition version. An art-only change or a copy correction with genuinely unchanged meaning keeps the cohort; a different compiled serialization alone is not a semantic change.
- `assistanceFamilyId` persists across cosmetic, wording and solution-equivalent revisions so known answers cannot be converted into a fresh unassisted score. Only an actually new puzzle approved as such receives a new assistance family.

Active sessions stay pinned to a compatible immutable revision. A withdrawn unsafe or impossible revision becomes read-only/unavailable with an explanation; preserve its history rather than silently resuming it under changed rules. An Open solution expanded by a fairness correction must not retroactively call a previously accepted result wrong. Document whether historical rejected proposals can be safely re-evaluated; do not guess or fabricate old grants.

A new competition version is not automatically a fresh opportunity to earn a first-play result. Within one assistance family, a Study-first exposure or an existing eligible first completion closes future first-play eligibility across revisions. Keep the historical result in its original cohort and mark later equivalent revisions Practice. Only an approved genuinely new puzzle with a new assistance family can open new eligibility; distinct-exhibit mastery still counts the exhibit ID once.

Rollback restores a previous content manifest and compatible application build. It does not roll back paid-entitlement ledgers or delete already acknowledged progress.

## 12. Application architecture and persistence

### 12.1 Recommended implementation stack

For a new standalone implementation use TypeScript throughout; React with DOM-based accessible controls and Vite for the web build; a small Node.js HTTP service such as Fastify; PostgreSQL for persistent state; Vitest or equivalent for model/service tests; and Playwright for browser flows. Use a supported Node LTS, pin the exact runtime and package-manager versions, commit the lockfile, and use supported compatible dependency versions at implementation time.

These are a coherent baseline, not a demand to replace an already suitable host stack. The immutable requirements are typed declarative content, a deterministic shared evaluator, authoritative mutations, real database persistence, semantic HTML and a lightweight raster renderer. Do not add Unity, a WebGL engine, a physics library, a message broker, Redis, Kubernetes or a heavyweight game framework unless a demonstrated need justifies it.

Expected code responsibilities:

| Module | Owns | Must not own |
|---|---|---|
| `game-model` | Pure expression evaluation, graph sorting, proposal legality, target clauses | Browser state, payments, random behavior |
| `content` | Authored records, compiled manifests, localization, validator | Secrets, user data, live generation |
| `web` | Navigation, scene layers, accessible object UI, staged proposal, audio | Final authority for score or entitlement |
| `service` | Authentication, revisions, assistance, tests, completion, challenge codes | Trust in client-supplied derived values |
| `telegram-adapter` | Mini App capabilities, native lifecycle, invoice/share integration | Game rule definitions |
| `payments` | Orders, trusted payment events, grants, refunds, reconciliation | Unlocking game mechanics |
| `tooling` | Asset render/optimize scripts, content audit, screenshot/state contact sheets | A required always-running authoring service |

The shared evaluator must produce identical typed results on client and service. Client results are useful previews/offline practice; only service results are official.

### 12.2 Persisted entities and keys

| Entity | Minimum fields / uniqueness |
|---|---|
| Account | Internal opaque ID; Telegram numeric identity stored without precision loss and serialized as a string; created/deleted state; generated public pseudonym |
| Preferences | Locale, sound/music/volume/haptics, contrast, motion override, preferred scene/list mode, board consent |
| Assistance family | Unique account + assistance family; highest acknowledged hint tier; Study-before-first-completion flag; first eligible completion ID or null; eligibility state (open/completed/studied); revision |
| Exhibit progress | Account + exhibit + competition version unique; assistance-family reference; first completion snapshot; progress status; revision; any cached assistance fields are non-authoritative |
| Active session | Progress ID; pinned content/rules versions; opening-state hash; staged proposal; acknowledged proposal-undo stack (bounded to 20); last tested candidate; mode; revision |
| Completion | Unique account + exhibit + competition version; score/null; assistance snapshot; accepted proposal; content hash; server-created timestamp; first-grant ID |
| Mastery award | Unique account + milestone ID (1, 5, 15 or closing postcard); qualifying distinct-exhibit count; first-grant timestamp; no duplicate award across content/competition revisions |
| Test summary | Action ID; session; proposal; target-clause results; content hash; accepted timestamp; bounded retention |
| Idempotency record | Account + route + action key; request digest; response/outcome; resulting revision; expiry |
| Challenge | Opaque code; exhibit and immutable competition/content references; spoiler-free media reference; no solution or sender identity requirement |
| Commerce | Order ID; account; SKU; currency/amount; status; unique Telegram charge ID; entitlement ledger entries; refund state |
| Release manifest | Published exhibit revisions and hashes; minimum compatible schema/application version |

Completion uniqueness and commerce charge uniqueness are database constraints, not only application checks. Keep relational transactions small; do not store decoded image/audio data in database rows.

Rank eligibility and hint cost read the assistance-family row transactionally, not only the current competition's progress row. Award 1/5/15 mastery from `COUNT(DISTINCT exhibitId)` over eligible verified repairs; the closing postcard uses distinct explored exhibit IDs. A new competition version cannot inflate either count. Enforce a single first eligible completion per account/assistance family in addition to the per-competition completion constraint.

### 12.3 Session state machine

Presentation states: `loading`, `opening`, `proposalSaving`, `proposalReady`, `testing`, `testedMismatch`, `solved`, `study`, `practice`, `offline`, `conflict`, `unavailable`.

Do not encode all these into a single persistent status that loses orthogonal facts. Assistance, eligibility, last result and network state are separate fields. A solved exhibit can have a historical result and a current practice session simultaneously.

For a normal test:

1. The client stages one legal proposal, sends its expected revision and action key, and awaits acknowledgment.
2. The service validates ownership/version, saves the proposal/undo entry and increments revision.
3. Test submission references the acknowledged proposal and current expected revision. The service locks the assistance-family record and then the progress/session record, or uses equivalent atomic compare-and-swap with the same cross-record guarantees.
4. Recompute from the immutable opening source snapshot; validate target clauses.
5. Persist the last tested snapshot and test summary. If successful and eligible, insert the first completion and derived mastery grant in the same transaction or a transactionally reliable outbox.
6. Return the complete authoritative state and revision. Animate only after this response.

Hint, Study and test requests serialize against the same assistance-family and progress records, acquired in that order consistently. If a hint acknowledgment commits before solve, that tier affects the score. If the eligible solve commits first, its assistance snapshot is final and a later reveal is a historical/practice disclosure. Do not allow a race to disclose a hint and still certify a lower assistance tier for that same first completion, including across different content/competition revisions in one family.

### 12.4 Minimal HTTP contract

Use same-origin HTTPS JSON endpoints, strict schemas, bounded request sizes and authenticated ownership checks. Paths below are binding logical contracts; a host may remap transport paths without changing behavior.

| Method/path | Request / behavior |
|---|---|
| `POST /api/auth/telegram` | Raw signed `initData`; service validation; exchange for short-lived secure session |
| `POST /api/auth/refresh` | Rotate an active authenticated session within the original 24-hour authentication window; never extend that window using stale launch data |
| `GET /api/me` | Preferences, progress summaries, entitlement flags, session expiry; no private bot secrets |
| `PATCH /api/me/preferences` | Validated preference fields; idempotent save; locale never rewrites model IDs |
| `GET /api/catalogue` | Public published manifest and account progress overlay; private overlay not shared-cacheable |
| `GET /api/exhibits/{id}/content?version=...` | Immutable public content only; ETag/hash validation |
| `POST /api/exhibits/{id}/session` | Open/resume pinned first-play or explicitly marked practice session |
| `PUT /api/sessions/{id}/proposal` | Exactly one `{sourceId, value}` or `null`, `expectedRevision`, action key |
| `POST /api/sessions/{id}/test` | Acknowledged proposal and revision; returns authoritative result and optional first completion |
| `POST /api/sessions/{id}/undo` | Restore prior acknowledged proposal; no assistance reversal |
| `POST /api/sessions/{id}/reset` | Clear proposal and restore opening view; no history/assistance deletion |
| `POST /api/sessions/{id}/hint` | Explicit requested next tier; cumulative acknowledgment; then hint content |
| `POST /api/sessions/{id}/study` | Confirmed reveal; persist Study eligibility change before returning explanation |
| `GET /api/actions/{key}` | Resolve an uncertain mutation owned by the account |
| `POST /api/challenges` | Create or reuse opaque code for an allowed published revision; no solution payload |
| `GET /api/challenges/{code}` | Resolve public challenge reference, or explicit retired/not-found status |
| `GET /api/boards/{exhibitId}` | Version/tier partition; opt-in pseudonyms only; cursor pagination |
| `POST /api/shop/orders` | One allowed SKU; service computes 75 XTR; returns Telegram invoice link |
| `GET /api/shop/orders/{id}` | Authoritative order/entitlement state for the owner |
| `POST /api/telegram/webhook` | Verified Telegram webhook; deduplicated payment and bot-support updates |
| `POST /api/me/delete` | Reauthenticated account deletion request; explicit consequence confirmation |

All game mutations return `actionId`, `sessionId`, `revision`, pinned versions, rendered-state snapshot, proposal, assistance, eligibility and relevant result data. A test additionally returns `ruleEvaluations[]` with each rule's ID, public input/output values and integrity status, plus `targetClauses[]` with stable clause IDs, expected public description, actual public values and met/not-met flags. No undisclosed solution is included in mismatch responses.

Errors use stable codes: `AUTH_REQUIRED`, `INVALID_ACTION`, `INVALID_VALUE`, `DERIVED_NOT_EDITABLE`, `NO_PROPOSAL`, `REVISION_CONFLICT`, `CONTENT_UNAVAILABLE`, `RATE_LIMITED`, `PAYMENT_PENDING`, `SERVICE_UNAVAILABLE`. The response includes retryability, an opaque request ID and, for conflicts, the current authoritative snapshot. Never return a stack trace or internal SQL detail to the player.

### 12.5 Idempotency, conflicts and reconnect

Generate a cryptographically random action key for every deliberate mutation. Repeating the same key with the same request digest returns the same committed outcome before checking whether the now-old expected revision conflicts. Reusing a key with different data is rejected. Retain mutation outcomes at least seven days; permanent completion/charge constraints continue to prevent duplicates after that cache expires.

Network retries must reuse the key. A client timeout is not proof the service rejected the request. On reopening, fetch session and unresolved action outcomes before restaging anything. In a conflict, do not silently last-write-win another device's proposal or assistance update.

Local storage may cache public immutable content, preferences and a pending proposal. It is not authority for progress, score, Study or purchases. Never store the bot token, raw long-lived signed launch data or a reusable authentication secret there. An offline game cache must exclude private API responses and payment pages; a minimal cache is preferable to a complex service worker.

### 12.6 Host integration and standalone preview

A host adapter may supply identity, catalogue navigation, optional cosmetic entitlement and board services. Its interface must have a deterministic test implementation. Production must reject test identities and mock purchases regardless of client query parameters.

The standalone preview uses an explicitly development-only guest profile, clearly labeled **Preview — progress and purchases are not real**. It includes all 24 exhibits and supports the complete object-list interface. A demo mode may not be mistaken for production authentication or used to claim Telegram/payment verification.

## 13. Telegram, payments and platform boundaries

### 13.1 Telegram launch and authentication

Implement the product as a Telegram Main Mini App with an HTTPS origin configured through the owner's bot setup. Load the official Mini App bridge and use feature detection/version checks for optional capabilities [R01]. Browser preview renders without Telegram, but production ranked/account features require verified identity.

- Call `ready()` when the app shell can safely display. Do not report readiness while a blank canvas waits for all 24 scenes.
- Support the ordinary expanded viewport first. Fullscreen is optional and user-triggered; lack of fullscreen never blocks play.
- Respect `viewportChanged`, stable viewport sizing, safe-area/content-safe-area changes, theme changes and activation/deactivation where supported.
- Centralize inset calculations. Telegram content insets, device CSS `env(safe-area-inset-*)` and host header space must not be blindly added twice; test the actual coordinate spaces on supported clients.
- The native BackButton closes the topmost internal sheet first, then follows internal navigation. At the foyer, allow normal Telegram closure. Use closing confirmation only for genuinely pending local work, not to trap a visitor after an acknowledged save.
- Do not request contacts, phone number, location, camera, microphone, chat membership, write access or home-screen installation for the core game.

Send raw `Telegram.WebApp.initData` to the service. `initDataUnsafe` may help show non-authoritative local UI but is never accepted as authentication. Verify the official Telegram signature/HMAC procedure using an audited implementation and constant-time comparison, with correct query parsing and field handling [R01]. Keep the bot token server-side. Reject malformed/duplicate critical parameters, invalid signatures and missing required identity.

For the initial exchange, accept `auth_date` no older than five minutes and no more than 30 seconds in the future; these are this product's security settings, not Telegram-mandated durations. Use a secure HttpOnly session cookie on the same origin with an appropriate tested SameSite policy and CSRF protection; default to Lax where the deployment supports it. Session lifetime is 24 hours, with inactivity/rotation policy documented and no dependence on repeatedly accepting stale launch data. If the session expires, prompt a safe relaunch while preserving the pending non-sensitive proposal.

Test embedded Telegram web clients explicitly: a cookie deployment that works in mobile WebViews may fail under third-party-cookie restrictions. If a supported client cannot use the cookie session, provide a documented memory-only bearer-session fallback obtained through the same verified launch exchange. Its access tokens expire after 15 minutes and can rotate only while authenticated and within the original 24-hour window. Send them in Authorization headers, never URLs or persistent browser storage. Reload without a usable session requires a valid new launch exchange/relaunch, not guest escalation. Do not solve cookie failures by accepting unsigned identity.

Treat Telegram IDs as exact integers/strings, never lossy floating-point identifiers. Validate the signed start parameter or resolve an untrusted launch parameter strictly as an opaque challenge code; neither grants identity or entitlement.

### 13.2 Share implementation

Primary deep-link form: `https://t.me/{configured_bot_username}?startapp={opaque_code}` for the configured Main Mini App [R01]. The actual bot username is deployment configuration, not invented content in this document. Keep codes short and within Telegram's current allowed character/length limits; use a fixed 24-character base64url-safe code rather than packing JSON into the parameter.

Prefer supported Telegram prepared-message sharing when available and authorized by the user's click. Otherwise offer the native share-link flow or Copy link. A cancelled share gives no error punishment and never changes progress. Never infer that invoking a share method proves a message was delivered. Do not require access to the recipient chat.

### 13.3 Gallery Frame Set

**SKU:** `g10_gallery_frames_v1`. **Price:** 75 Stars. **Currency:** `XTR`. **Purchase type:** one-time permanent cosmetic entitlement while not refunded. Included treatments: Brass Registration, Sea-Glass Edge, Paper Archive.

The preview must state exactly what changes: outer scene frame, nameplate border and result stationery. Display the free default beside the paid treatment on the **same** scene state at the same scale and contrast. No fake discount, scarcity timer, crossed-out price or implication that purchase supports a promised financial return.

Digital goods inside Telegram must use Telegram Stars, not TON, card checkout or an external cryptocurrency flow [R02]. Do not ask for a shipping address, card details, email or phone number to sell frames.

### 13.4 Authoritative purchase sequence

1. User presses Buy. The service validates account, SKU and existing entitlement, creates a durable order and generates a Stars invoice through the Bot API. Currency/amount come from the service, not the browser. Use the current Bot API Stars invoice requirements, including an appropriate empty provider token and a single price component where required [R02, R03].
2. The Mini App opens the returned invoice. Disable accidental repeat purchase while that order is pending, but allow cancellation and recovery.
3. Handle `pre_checkout_query` within Telegram's required 10-second window. Validate payload, payer, order state, currency and total before approving. An approval is not a purchase grant.
4. Grant entitlement only after a trusted `successful_payment` update with matching order data. Deduplicate Telegram updates and enforce a unique `telegram_payment_charge_id`.
5. Persist payment and entitlement transactionally. The invoice UI's `paid`/closed callback only prompts an order refresh; it is not payment authority.
6. The UI applies the selected frame after the service reports ownership. If Telegram closes before acknowledgment, show **Payment being confirmed** and resume via order lookup, without charging again.

Handle cancelled, failed, pending, paid and refunded states explicitly. A duplicate charge caused by exceptional race/replay must enter support/refund handling rather than silently disappearing because an entitlement already exists.

### 13.5 Refunds and support

Implement the bot's `/paysupport` handling and a visible support route for payment issues [R02]. Store charge/order identifiers needed for support without exposing them on public boards. Owner-provided contact and policy text are deployment requirements; placeholder support details block production commerce.

Refund through the supported Bot API `refundStarPayment` flow when authorized. Also process applicable trusted refund updates and reconciliation results so reversals outside the immediate UI are reflected. Revoke only the refunded frame entitlement; return its selection to the free default. Solved exhibits, hints, mastery and progress remain intact. Multiple entitled purchases, if ever supported, need a ledger rather than a Boolean that a single refund can incorrectly erase.

Exercise the full sequence in Telegram's supported test environment before enabling real purchases. An additional real smoke purchase/refund requires owner authorization and access; do not spend real Stars during automated QA by default.

### 13.6 Wallet and optional support boundaries

The original SRS places an optional private TON wallet link in the shared platform. This game does **not** implement a wallet, request transaction signing, create tokens, mint exhibits or produce financial rewards. In standalone mode the wallet entry is absent. If the real host supplies a compliant optional wallet-link screen, navigation to it may appear in host settings only; refusal or disconnection has no effect on this game.

No wallet address is a puzzle/account primary key, a board name or an analytics field. Any future host wallet integration needs its own current Telegram-policy and security review; this document is not authorization to add financial actions.

The shared platform's optional one-time support product may be exposed only if a real host contract already defines it. Do not invent a second donation SKU, a TON tipping path or recurring support in this standalone baseline.

## 14. Localization and accessibility

### 14.1 Language contract

English and Russian are full launch languages, not an English game with translated menu buttons. Section 10 supplies the baseline titles, notes, rules, targets, hints and recaps in both languages. The implementation must also translate navigation, state labels, target reports, commerce, network errors, privacy/support surfaces and assistive descriptions.

Select locale from the stored preference, then supported Telegram language, then English. A visible manual switch is always available. Switching language preserves session, proposal, state orientation, target IDs, assistance, score and accepted repairs. The two locales load the same graph and enum IDs; do not duplicate the game model in translation files.

Use complete localized messages with parameters, not English sentence fragments concatenated into Russian. Handle Russian count forms for exhibits, objects, hints and Stars. Allow at least 40% text expansion in controls and 60% in cards; actual fit tests take precedence over estimates. Do not truncate a target, rule, source value or price.

### 14.2 Core interface copy

| Key / purpose | English | Russian |
|---|---|---|
| Enter | Enter the museum | Войти в музей |
| Continue | Continue your tour | Продолжить осмотр |
| Tagline | Change the cause, not the shadow. | Измените причину, а не тень. |
| Target | The intended arrangement | Как должно быть |
| Rules | Local rules | Местные правила |
| Rule report | Four local rules evaluated | Четыре местных правила проверены |
| Connections | Connections | Связи объектов |
| Teaching expansion | See the whole exhibit | Показать весь экспонат |
| Rule disclaimer | This exhibit follows the four rules below. | Этот экспонат работает по четырём правилам ниже. |
| Scene | Scene | Сцена |
| Object list | Object list | Список объектов |
| Show names | Show object names | Показать названия объектов |
| Source | Source · adjustable | Причина · можно изменить |
| Effect | Effect · follows the rules | Следствие · определяется правилами |
| Cannot edit | This object is an effect, not a control. | Это результат, а не переключатель. |
| Current | Current state | Текущее состояние |
| Opening | Opening value | Исходное значение |
| Last tested | Last tested value | Последнее проверенное значение |
| Proposed | Proposed value | Предлагаемое значение |
| Original value | Original · clears proposal | Исходное · отменяет предложение |
| Replace proposal | One change at a time. Your previous proposal was replaced. | Только одно изменение за раз. Предыдущее предложение заменено. |
| Test | Test the repair | Проверить исправление |
| Testing | Testing this arrangement… | Проверяем расположение… |
| No proposal | Choose one source and a different value. | Выберите одну причину и другое значение. |
| Pending proposal | Saving your proposal… | Сохраняем предложение… |
| Undo | Undo proposal | Отменить предложение |
| Reset | Return to opening | Вернуть исходную сцену |
| Reset reassurance | Hints and progress are kept. | Подсказки и прогресс сохранятся. |
| Tested state | Tested arrangement | Проверенное расположение |
| Met | Met | Выполнено |
| Not met | Not yet | Пока не выполнено |
| Mismatch | Not this arrangement yet. | Пока не то расположение. |
| Success | Everything makes sense now. | Теперь всё на своих местах. |
| Hints | Hints · always free | Подсказки · всегда бесплатно |
| Hint warning | Next hint: score −10. Tests are always free. | Следующая подсказка: −10 очков. Проверки всегда бесплатны. |
| All hints | All three hints are available to reread. | Все три подсказки можно перечитать. |
| Study | Study this exhibit | Изучить экспонат |
| Reveal confirm | Show the repair and explanation? This first play will not receive a ranked score. | Показать исправление и объяснение? За это первое прохождение не будет рейтинговых очков. |
| Reveal accept | Show and study | Показать и изучить |
| Study success | Now you can follow the cause. | Теперь можно проследить причину. |
| Study result | Studied · no ranked score | Изучено · без рейтинговых очков |
| Single | Single solution | Одно решение |
| Open | Open solution · more than one valid repair | Несколько верных решений |
| Alternatives | These repairs are equally valid. | Эти исправления одинаково верны. |
| Chain | See the cause chain | Посмотреть цепочку причин |
| Next | Next exhibit | Следующий экспонат |
| Back | Back to collection | К коллекции |
| Practice | Practice again · original result kept | Повторить для практики · результат сохранится |
| Share | Share a spoiler-free challenge | Поделиться задачей без спойлеров |
| Share invitation | Can you make this exhibit agree? | Получится привести экспонат в порядок? |
| Known challenge | You have visited this exhibit before. | Этот экспонат уже знаком. |
| Offline | Offline practice · results are not being saved | Практика без сети · результаты не сохраняются |
| Offline match | Offline practice match · not saved | Условие выполнено без сети · не сохранено |
| Offline hint | Reconnect to unlock a new hint or explanation. | Подключитесь к сети, чтобы открыть новую подсказку или объяснение. |
| Unconfirmed | Result not confirmed. Check connection and retry. | Результат не подтверждён. Проверьте соединение и повторите. |
| Conflict | This exhibit changed on another device. We loaded the saved state. | Экспонат изменён на другом устройстве. Загружено сохранённое состояние. |
| Unavailable | This version is unavailable. Your previous progress is kept. | Эта версия недоступна. Предыдущий прогресс сохранён. |
| Image fallback | The illustration could not load. You can use the complete object list. | Иллюстрация не загрузилась. Можно воспользоваться полным списком объектов. |
| Auth | Reopen the Mini App to continue saving progress. | Откройте мини-приложение заново, чтобы продолжить сохранение прогресса. |
| Rate limit | Please pause briefly, then test again. No progress was lost. | Сделайте небольшую паузу и проверьте снова. Прогресс не потерян. |
| Generic error | We could not confirm that action. Try again. | Не удалось подтвердить действие. Попробуйте ещё раз. |
| Cosmetic | Gallery Frame Set · cosmetic only | Набор музейных рамок · только оформление |
| Buy | Buy for 75 Stars | Купить за 75 звёзд |
| Owned | Owned | Приобретено |
| Pending payment | Payment being confirmed | Ожидаем подтверждения оплаты |
| Cancelled payment | Purchase cancelled. Nothing changed. | Покупка отменена. Ничего не изменилось. |
| Refunded | Purchase refunded. The default frame is restored; your progress is kept. | Покупка возвращена. Восстановлена обычная рамка; прогресс сохранён. |
| Privacy | Privacy and your data | Конфиденциальность и данные |
| Delete | Delete my game data | Удалить мои игровые данные |
| Support | Help and payment support | Помощь и поддержка оплаты |

Remaining simple settings labels use literal localized names: Sound / Звук; Music / Музыка; Volume / Громкость; Haptics / Вибрация; Reduced motion / Меньше движения; High contrast / Высокая контрастность; Language / Язык; Cancel / Отмена; Retry / Повторить; Close / Закрыть; Copy link / Скопировать ссылку. Deletion and legally relevant notices require the owner's actual policy text, not generated legal assurances.

### 14.3 State vocabulary and contextual descriptions

Use the following base vocabulary, then apply the explicit contextual overrides below. Each state is displayed as a standalone labeled value, not as an adjective blindly attached to every object's gender. Numeric pressure values 1/2/3 mean one/two/three **model marks**, not bar, pascals or a real calibration.

| Tokens | English / Russian base labels |
|---|---|
| `left`, `right` | left / левая сторона; right / правая сторона |
| `open`, `closed` | open / открыто; closed / закрыто |
| `on`, `off` | on / включено; off / выключено |
| `low`, `medium`, `mid`, `high` | low / низкий уровень; medium / средний режим; middle / средний уровень; high / высокий уровень |
| `none`, `one`, `two` | none / нет; one / одно; two / два |
| `lit`, `dark`, `shaded` | lit / освещено; dark / темно; shaded / в тени |
| `resting`, `moving` | resting / неподвижно; moving / движется |
| `round`, `disk`, `leaf` | round stencil / круглый трафарет; disk / круг; leaf / лист |
| `wide`, `small`, `narrow` | wide / широко; small / малый размер; narrow / узко |
| `finished`, `unfinished`, `sealed` | finished / готово; unfinished / не готово; sealed / запечатано |
| `clear`, `frosted` | clear glass / прозрачное стекло; frosted glass / матовое стекло |
| `dim`, `even`, `glare` | dim / тусклый свет; even / ровный свет; glare / слепящий свет |
| `sharp`, `soft` | sharp-edged / чёткие края; soft-edged / мягкие края |
| `awake`, `asleep`, `squinting` | awake / бодрствует; asleep / спит; squinting / щурится |
| `welcome`, `wait`, `waiting` | welcoming / приветствие; wait signal / сигнал ожидания; waiting / ожидание |
| `straight`, `crossed`, `return` | straight route / прямой маршрут; crossed route / перекрёстный маршрут; return route / возвратный маршрут |
| `amber`, `blue` | amber / янтарный цвет; blue / синий цвет |
| `circle`, `triangle` | circle / круг; triangle / треугольник |
| `striped`, `plain` | striped / полосы; plain / без узора |
| `ready`, `readable`, `unreadable` | ready / готово; readable / читается; unreadable / не читается |
| `near`, `far` | near focus / ближний фокус; far focus / дальний фокус |
| `active`, `quiet`, `settled`, `alert` | active / работает; quiet / неподвижно; settled / спокойно; alert / настороженно |
| `day`, `dusk`, `night` | day / день; dusk / сумерки; night / ночь |
| `white`, `gold` | white / белый цвет; gold / золотой цвет |
| `noon`, `six`, `midnight` | noon / полдень; six o'clock / шесть часов; midnight / полночь |
| `perched` | perched / сидит на жердочке |
| `still`, `hanging`, `turning`, `stopped` | still / без движения; hanging / свисает; turning / вращается; stopped / остановлено |
| `docked`, `away` | docked / у причала; away / вдали |
| `gentle`, `strong`, `fast`, `slow` | gentle / мягкий поток; strong / сильный поток; fast / быстро; slow / медленно |
| `ringing`, `silent` | ringing / звенит; silent / не звенит |
| `level`, `lifted`, `pleased` | level / горизонтально; lifted / поднято; pleased / довольное состояние |
| `empty`, `full`, `grounded`, `delivered` | empty / пусто; full / наполнено; grounded / на основании; delivered / доставлено |
| `flat`, `fluttering`, `steady`, `leaning` | flat / прижато; fluttering / колышется; steady / ровное положение; leaning / наклонено |
| `taut`, `calm`, `rippling` | taut / натянуто; calm / спокойная поверхность; rippling / рябь |
| `duet`, `solo`, `chord`, `note`, `loud`, `listening` | duet / дуэт; solo / соло; chord / аккорд; note / одна нота; loud / громко; listening / слушает |
| `upper`, `lower`, `lodged`, `accepted`, `blank` | upper / наверху; lower / внизу; lodged / застряло; accepted / принято; blank / без отметки |
| `clockwise`, `counterclockwise` | clockwise / по часовой стрелке; counterclockwise / против часовой стрелки |
| `engaged`, `released`, `aligned`, `offset` | engaged / сцепление включено; released / сцепление отключено; aligned / совмещено; offset / смещено |
| `down`, `up`, `signed` | down / опущено; up / поднято; signed / подписано |
| `flowing`, `wet`, `dry`, `afloat` | flowing / поток идёт; wet / мокро; dry / сухо; afloat / на плаву |
| `centered`, `aside`, `short`, `neat`, `tall` | centered / по центру; aside / в стороне; short / короткая дуга; neat / аккуратная дуга; tall / высокая дуга |
| `catching`, `missing` | catching / вода поймана; missing / вода проходит мимо |
| `cool`, `warm`, `absent`, `present`, `misted` | cool / прохладный режим; warm / тёплый режим; absent / отсутствует; present / присутствует; misted / есть конденсат |
| `dropping`, `watered` | dropping / капает; watered / полито |
| `balanced`, `tilted`, `lowered`, `raised` | balanced / равномерный маршрут; tilted / наклонено; lowered / опущено; raised / поднято |
| `safe`, `toward`, `step`, `submerged`, `across` | safe / безопасный уровень; toward / к острову; step / доступная ступенька; submerged / под водой; across / на острове |
| `wheel`, `bypass` | via wheel / через колесо; bypass / в обход колеса |

Required context overrides:

- Direction of airflow/flags/routes: leftward/rightward / влево/вправо. Position of lamp, shadow or beam window: on the left/right / слева/справа. Upper/lower routing controls: to the upper/lower shelf / на верхнюю/нижнюю полку. Never localize a physical direction through reading-order assumptions.
- L03 `window.soft/sharp`: soft light / мягкий свет; sharp-edged light / свет с резкими границами. A06 `drummer.soft`: soft drumming / тихий барабан. L07 `star.soft`: soft-edged star / мягкие края звезды.
- L06 `filter.amber/blue`: amber circle / янтарный круг; blue triangle / синий треугольник. L08 `dome.white/gold/blue`: white sun / белое солнце; gold horizon / золотой горизонт; blue stars / синие звёзды.
- W04 `ceiling.clear`: no condensation / без конденсата, not transparent glass. L04 `medallion.none/one/two`: 0/1/2 lit patches / 0/1/2 освещённых пятна, with correct Russian plural forms.
- A06 and A08 `waiting` refers to a mechanism's waiting state, not a real person's emotional distress. W07 `channel.away`: away from the island / от острова; A01 `boat.away`: away from dock / вдали от причала.
- W08 `bellows.steady`: moving steadily / равномерное движение; `bellows.still`: not moving / неподвижно. A04 `candle.steady`: upright / стоит ровно.
- Power/pressure controls use low/medium/high setting / низкий/средний/высокий режим. Basin/level gauges use low/middle/high water / низкий/средний/высокий уровень воды. A03 `kite.high`: raised kite / змей поднят.
- Moth `resting` means not moving; feather `resting` means resting on its support; W07 float `resting` means below the usable step position. State names must communicate this context rather than sharing an ambiguous one-word recording.

**Equivalent text template:** “{Object name}. {Source or Effect}. Current state: {contextual state}. {Allowed values if source}. Related rules: {numbers}.” An effect additionally exposes its actual parents and current input states through “Why this state?” without disclosing which control to repair. The target, all four rules and all six such descriptions form a complete nonvisual puzzle.

### 14.4 Accessibility requirements

Target WCAG 2.2 AA for the web interface, with a stricter product minimum of **44 × 44 CSS px** touch targets. WCAG 2.2 AA's general target-size criterion is 24 × 24 with exceptions; do not falsely cite it as a universal 44 px requirement [R05].

- Use semantic buttons, headings, lists, radio groups and dialogs. A canvas or raster scene alone is not the accessible interface.
- Object-list mode must expose all six objects, all permitted source values, all four rules and every target clause. Never paywall or hide it as a developer tool.
- Text contrast ≥4.5:1 for normal text, ≥3:1 for qualifying large text; active control boundaries and meaningful graphical states need appropriate non-text contrast. Test actual token pairs and state imagery [R05].
- Visible keyboard focus, no keyboard trap, logical order, clear selected/disabled states, labeled zoom controls and no reliance on hover.
- Support 200% text resize and reflow at 320 CSS px equivalent width. The diagram may use explicit zoom/pan as essential two-dimensional content; the full textual alternative must reflow without horizontal reading scroll.
- State changes use concise polite live-region announcements: proposal saved, test result, count of unmet target clauses. Do not announce every decorative animation or read the entire scene again after each click.
- Move focus intentionally to result heading after a user-submitted test if the report replaces content; retain it near the Test area if the report is inline. Do not unexpectedly move focus when an image or payment poll resolves.
- Sound, color, motion and haptics always have equivalent text. Reduced motion and high contrast may be inferred from OS preferences and explicitly overridden by the user.
- Visible object names and free outlines are not hints; they do not affect score.
- Test VoiceOver and TalkBack with real nonvisual users before claiming independent nonvisual solvability. Automated labels alone do not prove it.

## 15. Performance, security, privacy and operations

### 15.1 Performance budgets

Reference low/mid device: a physical Samsung Galaxy A14-class Android phone with approximately 4 GB RAM, plus an iPhone SE (2020)-class device for iOS WebView behavior. Record actual hardware, OS and Telegram versions used; these are reference classes, not a claim they have already been tested.

| Measure | Release budget / method |
|---|---|
| Pure graph + target evaluation | p95 ≤50 ms on reference device; measure at least 1,000 evaluations across all source configurations, excluding network/art decode |
| First usable exhibit transfer | ≤3,000,000 compressed application bytes, including shell, required fonts, UI, public model and initial playable scene states; audit cold cache |
| Initial JavaScript | Aim ≤300 kB compressed; investigate >400 kB before release |
| New exhibit assets | Aim ≤1.5 MB, maximum 2 MB additional compressed assets; do not fetch all 24 at boot |
| First usable exhibit time | ≤5 s on controlled 10 Mbps / 150 ms RTT profile, cold app cache, excluding Telegram app startup; list mode must remain available on image failure |
| Interaction response | Visible press/selection response within 100 ms; no unexplained frozen UI during service requests |
| Test round trip | p95 ≤800 ms under reference network and expected load; separate server processing p95 ≤150 ms from network |
| Motion | Aim 60 fps; no sustained <30 fps on reference class; static/reduced-motion mode remains correct |
| Active scene decoded art | Target ≤48 MiB; measure decoded RGBA and atlas sizes, not only compressed files |
| Full runtime media inventory | Target ≤45 MB excluding lossless production masters and optional QA artifacts |
| Background behavior | Suspend animation/audio; no periodic gameplay polling while inactive |

Audio begins downloading only after opt-in or after first-play readiness within a separately measured budget. Prefetch at most the next likely exhibit while active and on an acceptable connection; cancel it on navigation or constrained data. Use immutable CDN caching for hashed public assets and no shared caching for private account responses.

Reserve layout dimensions before image/font load to avoid moving touch targets. Dispose of old image/audio buffers on collection changes. Avoid full-canvas transparent images for every state, expensive live blur filters and unbounded history components.

### 15.2 Security requirements

- HTTPS only; secure session handling; CSRF and origin checks appropriate to the chosen cookie deployment; strict ownership on every session/order/account endpoint.
- Validate schemas and enum domains server-side; reject extra mutation fields. Never execute content strings through `eval`, `Function` or arbitrary expression engines.
- Content Security Policy restricts scripts/assets/connect destinations to the app and required official Telegram endpoints. Configure framing policy for actual Telegram web clients and preview hosts; do not break legitimate embedding with an untested blanket header.
- Verify Telegram webhook secret headers; reject unauthenticated forged updates. Deduplicate update IDs and payment charge IDs separately.
- Bot token, database credentials and session secrets exist only in deployment secret storage. Redact signed launch data, cookies, tokens and payment identifiers from client logs and external error reports.
- Sanitize all interpolated text, including display names if ever added. The launch catalogue contains no user-authored HTML or uploads.
- Bound API bodies, IDs, list lengths and history. As starting abuse settings, limit test mutations to 60/minute/account with a modest burst, auth exchanges to 10/minute/IP with appropriate shared-network handling, and invoice creation to 5/minute/account. Tune from evidence; a 429 does not reduce score or consume attempts.
- Do not permit staging flags, guest-auth headers or mock-payment toggles in production. Verify their rejection with negative tests.
- Scan dependencies and generated asset archives. License or vulnerability scanning cannot be waived merely because a file came from an AI tool or “free asset” website.

### 15.3 Data minimization and retention

Required data: internal account identity, exact Telegram ID for authentication/payment ownership, preferences, progress/assistance, completion records, entitlement ledger and minimal operational metadata. No contact list, location, chat contents, wallet address, microphone capture or social graph.

Default data policy for implementation:

- Progress/preferences: until account deletion or the owner's published inactive-account retention policy.
- Detailed test summaries: last 100 per exhibit/version and at most 30 days; preserve completion summaries separately.
- Idempotency outcomes: at least seven days, then expire if not needed for a pending operation.
- Security/operational logs: 14 days by default, with redaction and access control.
- Analytics events: 90 days at pseudonymous event level, then aggregate or delete.
- Payment/refund records: retain the minimum legally required audit information under the owner's applicable jurisdiction. The owner must supply the actual policy before commerce launch; do not fabricate a universal legal retention period.

Account deletion removes/revokes sessions, public board entries, optional analytics linkage and game data under the published policy. Explain any legally retained payment records and backups. Backups age out on their documented schedule; do not promise instant physical deletion from all backups. Prevent a later stale webhook from recreating a deleted playable account without a legitimate new authenticated action.

### 15.4 Analytics without manipulation

Useful events: `exhibit_opened`, `object_inspected` (node ID only), `interface_mode_changed`, `proposal_staged`, `test_confirmed` (met-clause count, not a public answer), `hint_unlocked`, `study_entered`, `repair_completed`, `recap_opened`, `challenge_requested`, `purchase_state_changed`, `asset_failed` and `session_conflict`.

Record app/content version, pseudonymous account/session, collection/exhibit, locale, interface mode, coarse device class and event time. Do not send raw Telegram data, exact payment identifiers or undisclosed solutions to third-party analytics. The service's necessary private repair record is separate from marketing telemetry.

Questions these events answer: Can visitors discover objects? Which targets repeatedly require Study? Does object-list mode lead to equivalent successful repairs? Are mismatches caused by an unclear rule or a broken save? Where do assets fail? Do people read the recap? None of these metrics justify adding timers, streak pressure or paid hints.

Product indicators are exploratory, not invented success claims: median session duration, per-exhibit hint tier, Study rate, distinct repaired count, recap engagement and error-free session rate. Do not set a conversion target that overrides fair presentation.

### 15.5 Operations and deployment deliverables

Deliver a reproducible local setup, production build, database migrations, safe preview seed/reset, validation command, test commands and deployment runbook. Setup must not require production credentials or mutate a shared production database. Seed profiles use isolated fake accounts and mock entitlements clearly confined to development.

Deployment configuration includes app/public origin, bot username, bot token, webhook secret, database URL, session secret/rotation settings, support contact, privacy/terms URLs, commerce-enabled flag and release manifest hash. Secret values never appear in committed examples.

Required operational capabilities:

- Separate development/staging/production databases and bot configuration.
- Health and readiness endpoints that distinguish HTTP process health from database/content readiness.
- Daily encrypted database backups, an actually exercised restore procedure, target RPO 24 hours and RTO 4 hours for this small non-financial-reward game.
- Basic alerts for elevated 5xx, payment grant/refund failures, content integrity failures and repeated auth/signature errors. Payment events must remain durable for reconciliation.
- Owner-controlled switches for maintenance, commerce disablement, challenge disablement and individual exhibit withdrawal. Disabling commerce must not remove owned frames or core gameplay.
- Safe rolling deployment/version compatibility; immutable asset names; no migration that destroys progress in a routine rollback.
- A support path with an opaque request ID, not an instruction for players to send authentication data.

## 16. Verification and release acceptance

### 16.1 Verification layers

1. **Model unit/property checks:** graph parsing, topological evaluation, legal domains, target clauses, all 112 source configurations and 56 legal single-source proposals, explicit 27-result acceptance set.
2. **Service/database integration:** real transactional persistence, revision conflicts, assistance races, duplicate grants, ownership, unknown outcomes, refund/entitlement events.
3. **UI integration/end-to-end:** complete launch-to-recap flows, scene/list equivalence, keyboard and EN/RU persistence, network failures and asset fallback.
4. **Media/editorial review:** all 317 state mappings, contrast, object discoverability, four-rule fidelity, no SVG/placeholders, sound mix, provenance.
5. **Actual Telegram/device testing:** iOS, Android, desktop and web clients available for the supported release; actual safe areas, back behavior, audio, lifecycle and Stars test flow.
6. **Observed-player testing:** the protocol below. Passing automation alone is not a launch approval.

### 16.2 Acceptance matrix

| Test ID | Requirement / scenario | Required result |
|---|---|---|
| G10-A01 | L01 lamp right → left, shutter open | Shadow right, right seat shaded, moth resting; verified success |
| G10-A02 | Send a direct edit for a derived shadow | Reject without model, revision, score or assistance mutation |
| G10-A03a | Inject lamp → shadow → lamp cycle in authoring data | Publication fails with a readable cycle path |
| G10-A03b | Submit both L04/A05/W06 declared alternatives | Each accepted with equal score policy; undeclared alternatives block publication |
| G10-A04 | Solve via object-list-only mode, no artwork inspection | All states, rules, target and source values available; same accepted repair |
| G10-A05 | Zero-Star user unlocks three hints, closes app, resumes and solves | Tier 3 persists; 70-point first result; no payment prompt |
| G10-A06a | L03 power changed to low rather than medium | Gull may wake, but welcome target fails with actual state; no solution leak |
| G10-A06b | Retry a successful action after lost response | One completion and one mastery grant, same committed outcome |
| G10-A07 | Switch EN ↔ RU before/after proposal and after test | Same semantic state, accepted set, physical left/right, assistance and history |
| G10-M01 | Check every catalogue record | 24 cases, two sources/four effects each, 96 total rules, no invalid graph/domain |
| G10-M02 | Enumerate all full source pairs and all single-source proposals | Exactly 112 full configurations, 56 proposals, 27 valid repairs for baseline |
| G10-M03 | Test one source, then another | Second proposal applies to opening state, not the prior tested state |
| G10-M04 | Malformed enum, no-op, extra source, unknown node, invalid version | Clear stable error; no illegitimate mutation/grant |
| G10-M05 | L05 lamp-right symptom fix; A04 inlet-left symptom fix | Visible downstream improvement but protected entrance target fails |
| G10-M06 | W01 tap close; W05 tap off | Dry floor/level beam alone is insufficient; duck/cup target prevents false success |
| G10-M07 | Same compiled content hash, evaluator version and opening/proposal test vector on client and service | Identical typed outputs and target-clause IDs; no gameplay randomness |
| G10-S01 | Hint/test/Study requests race | Serialized assistance snapshot, no free disclosed hint or double completion |
| G10-S02 | Reveal before solve, reset/reinstall/open other device | Study-first eligibility stays unranked for the assistance family |
| G10-S03 | Replay a known solved exhibit | Original official result kept; practice marked; no score farming |
| G10-S04 | Mutation timeout and same-key retry | Same response/outcome; no double hint tier or duplicated purchase |
| G10-S05 | Two devices propose changes against one revision | Stale action gets conflict and authoritative state; no silent lost update |
| G10-S06 | Close after acknowledged proposal/undo/reset | Exactly acknowledged view/proposal resumes; hints/history remain |
| G10-S07 | Create solution-equivalent competition revision after hints, Study or first completion | Assistance-family state persists; no new unassisted/first-play eligibility; original result retained |
| G10-S08 | Repair multiple revisions of one exhibit | Distinct-exhibit counts unchanged; milestone database constraint prevents duplicate stamps |
| G10-U01 | Inspect all six objects at 320/390 px and with 200% text | Discoverable non-overlapping scene controls and complete object-list alternative; no clipped critical copy |
| G10-U02 | Keyboard-only session | All actions reachable, focus visible/restored, no trap or gesture dependency |
| G10-U03 | Screen reader, sound off, reduced motion | Complete state/rule/target access and understandable reports; no missing information |
| G10-U04 | Failed image/codec/font request | Text mode/fallback font/silence preserves correct playable behavior |
| G10-U05 | Skip reveal, background mid-animation, reduced motion | Same verified final state; no second completion animation grant |
| G10-U06 | Open a share link on new and previously exposed accounts | Correct immutable exhibit; no spoiler; no new first-score eligibility for known content |
| G10-U07 | Withdraw a challenged revision | Explicit unavailable state, preserved history, no silent puzzle substitution |
| G10-T01 | Forged/stale/future initData and wrong account ownership | Reject authentication or resource access without data leak |
| G10-T02 | Actual Telegram insets, keyboard, orientation and native back | Controls stay usable; one coherent navigation stack |
| G10-T03 | No fullscreen/share/haptic support | Core game unaffected; documented fallback |
| G10-P01 | Forged invoice callback or webhook, wrong amount/currency/user | No entitlement; operational error recorded safely |
| G10-P02 | Valid Stars test payment, duplicate update, reopen after payment | Exactly one order grant; owned frame restored from service |
| G10-P03 | Cancel/fail/pending invoice | No phantom ownership or duplicate charge attempt |
| G10-P04 | Authorized refund and duplicate refund event | Only cosmetic entitlement reverted; all puzzle progress preserved |
| G10-P05 | Paid versus default frames in grayscale/high contrast | Identical clue readability, hit areas, game state and assistance |
| G10-Q01 | Cold-load/evaluator/scene memory benchmarks | Section 15 budgets met or release blocked with a documented owner decision |
| G10-Q02 | Asset/content/localization manifest audit | 317 state mappings and both locales complete; no runtime placeholders/SVG/unlicensed files |
| G10-Q03 | Backup restore plus content rollback | Progress/entitlements retained; compatible revision resumes |
| G10-Q04 | Data deletion and public board opt-out | Public entry removed; sessions revoked; retention policy honored |

Automated tests must assert state values, not just that a screenshot contains a success-colored button. Screenshots are useful for appearance and state-mapping regression; behavior tests must inspect the actual result and persistence.

**Source requirement traceability:**

| Original requirement | Master coverage |
|---|---|
| G10-F01 — discoverable objects and list alternative | Sections 5–8, 14; G10-A04, G10-U01–03 |
| G10-F02 — states, roles and legal controls | Sections 4–6, 10–11, 14; G10-A01–02, G10-M04 |
| G10-F03 — exact recomputation and invalid-edit rejection | Sections 4, 11–12; G10-A02–03, G10-M01–07 |
| G10-F04 — authoritative rule/target evaluation and non-spoiling feedback | Sections 4.2, 6.4, 12.3–12.4; G10-A01, G10-A06, G10-S01 |
| G10-F05 — unlimited tests, undo/reset, free assistance | Sections 3–6, 12; G10-A05, G10-S02–06 |
| G10-F06 — acknowledged persistence and locale equivalence | Sections 4, 11–14; G10-A05, G10-A07, G10-S01–08 |
| G10-F07 — graph, alternatives, equivalent text, EN/RU and rights gates | Sections 10–11, 14, 16, 18; G10-A03–04, G10-Q02 |
| G10-F08 — causal recap, next exhibit and spoiler-aware sharing | Sections 5–6, 10, 13; G10-A06b, G10-U05–07 |

### 16.3 Observed-player protocol

Recruit **12 participants**, with a mix of casual puzzle familiarity. Include at least two regular screen-reader users; include low-vision or motor-access needs where feasible, overlapping categories if appropriate. Obtain informed consent for any recording and keep private research media private.

Protocol:

1. Start from a clean test profile; allow the participant to choose language and scene/list interface.
2. Let them play L01 with the normal teaching treatment. Do not explain a control the UI failed to expose.
3. Assign at least two further exhibits balancing protected targets, multi-value controls and Open solution cases across the group. Use L05, A02, A05, A07, W01 and W05 as a balanced pool; do not show the participant solutions first.
4. Ask them to identify all six interactive objects in their chosen interface without facilitator help.
5. After a repair, ask “What did you change, and why did the other things change?” Accept ordinary language; assess the source, at least one causal edge and how the target became met.
6. Record confusion, hint use, accidental taps, contradictory-art interpretations and whether the recap resolved confusion. Time may be measured for research but is never ranked or shown as a countdown.

Launch thresholds inherited from the SRS: **at least 9/12 can explain the repaired cause**, and **at least 10/12 can find all interactive objects without facilitator help**. Also require both screen-reader participants to complete a representative exhibit nonvisually or document and repair the blocker before making a nonvisual-solvability claim. Report the actual sample and limitations; this is formative usability testing, not proof of educational benefit.

If the art hides the rule, simplify the art. If the rule is ambiguous, rewrite the local rule or model and revalidate. Do not add paid highlighting, silent answer rejection or a mandatory hint to rescue a bad exhibit.

### 16.4 Release evidence package

The future implementation handoff must include: commit/build/content hashes; unit/integration/E2E output; full validator report; asset/license register; EN/RU review checklist; state contact sheets; screenshots of 390 px scene/list/result/settings/paid-versus-free comparison; performance measurements; actual Telegram client matrix; Stars test payment/refund evidence with sensitive fields redacted; observed-player summary; and an explicit unresolved-gate list.

Do not publish a screenshot containing personal Telegram details, payment identifiers or private participants. A video that merely records clicks is not proof the result was correct. No gameplay media exists as a result of this documentation-only task.

## 17. Delivery sequence and definition of done

### 17.1 Recommended work order for the implementation agent

| Phase | Work | Exit condition |
|---|---|---|
| 0 — Establish contracts | Read this master, confirm host/standalone mode, inspect MCP tools, set pinned runtime, create threat/data model | No invented platform dependency; all external credentials isolated behind config |
| 1 — Prove the puzzle | Implement restricted model, schemas and validator; convert all 24 fixtures before bulk art generation | Exact 112/56/27 audit and negative validator tests pass |
| 2 — Build one complete exhibit | L01 with final-quality layered art, object list, rules, proposals, service save, hints/Study and recap | End-to-end one-source semantics and accessible text work; visual style approved or explicitly awaiting owner review |
| 3 — Prove difficult cases | L03, L04, L05, A07, W01 and W05; persistence races and failure states | Alternative acceptance, protected conditions and score eligibility verified |
| 4 — Produce the museum | Remaining final scenes, all 317 mappings, 24 thumbnails/share crops, sound manifest, EN/RU interfaces | No placeholders; asset and editorial audits complete |
| 5 — Complete platform behavior | Telegram auth/lifecycle, optional boards/challenges, Stars order/grant/refund, settings and deletion | Real staging services pass; mock routes excluded from production |
| 6 — Polish and verify | Device/inset/performance/accessibility checks, observed users, simplify unclear art/rules | Acceptance matrix and human thresholds pass, or blockers explicitly recorded |
| 7 — Package for operation | Build/deploy runbook, migrations, backups/restore, monitoring, rights and evidence | Reproducible release candidate with exact owner approval status |

Do not generate all final images before validating the models. Do not postpone object-list access or server authority until “polish.” Do not spend project funds, purchase stock assets or make real payments without authorization.

### 17.2 Required final repository deliverables

- Complete web Mini App and service, with stable documented setup/run/build/test commands.
- Typed shared rule evaluator and strict authoring schema/validator.
- All 24 reviewed content records, including EN/RU copy, targets, hints, Study explanations and accepted alternatives.
- Final raster art and all 317 logical state mappings, UI/frames/stamps/postcard, self-hosted fonts and compressed audio, plus reproducible generation/optimization recipes.
- Complete asset manifest and rights records, including original license texts and output hashes.
- Database migrations, isolated development seeds, authoritative progress/assistance/entitlement persistence and idempotency.
- Telegram integration, safe share fallback, optional opt-in board interface and one-time Stars cosmetic flow including refund handling.
- Automated tests and the measured release evidence described in section 16.
- Deployment/configuration examples without secrets, support/privacy integration, operational runbook and backup/restore procedure.
- A concise final implementation report stating what was built, what was actually tested, which build/content hashes were tested and every unresolved external gate.

### 17.3 Definition of done: no substitute deliverables

The implementation is not done if it has fewer than 24 cases, missing Russian content, a fake score in local storage, a payment success mock in production, unlicensed audio, AI-generated unreadable text, inaccessible canvas-only controls, a hidden preferred solution, extra unmodeled interactive props or an untested reset that erases hints.

The visual production is not done if only mood boards/prompts exist, or if one flattened solved image is being used in place of real state layers. Procedural sound is not done if a button is wired to an empty audio URL. “All tests pass” is not acceptable if the required tests were removed or replaced with assertions that never inspect results.

The agent may legitimately finish an implementation while reporting external release blockers. These can include missing bot/deployment credentials, unavailable actual MCP image generation, owner support/legal details, human art/translation approvals, access to physical test devices and recruited participants. Build safe local/staging fallbacks, document exactly what remains, and do not invent credentials, approvals, rights or observations. The game must not be called launch-approved until those gates are satisfied.

### 17.4 Scope-change policy

A separate design AI may improve composition, typography, material finish, component polish and transitions. It may not reduce touch targets, introduce color-only rules, bake text into images, change scene orientation, add a source, remove a rule, charge for assistance or redraw a cosmetic frame to make clues easier to see.

Any change to a domain, dependency, target or accepted repair requires a revised fixture, full enumeration, both-language review and updated art-state mappings. A new coat of paint is not a new puzzle. Two-source chapters, daily generated content and multiplayer remain future work, not unfinished parts of this baseline.

## 18. External references and rights policy

### 18.1 Research basis

Official/public sources below were consulted on **15 September 2026**. They establish external API, accessibility, browser or licensing behavior; the creative game design and numerical product budgets are decisions in this document, not quotations from these sources. Recheck version-sensitive Telegram methods and provider terms at implementation/release time.

| ID | Source | What it supports |
|---|---|---|
| R01 | [Telegram Mini Apps documentation](https://core.telegram.org/bots/webapps) | Signed launch-data validation, lifecycle, viewport/safe areas, native controls, direct links and optional capabilities |
| R02 | [Telegram payments for digital goods and services](https://core.telegram.org/bots/payments-stars) | Stars-only digital goods, payment sequence, support and refunds |
| R03 | [Telegram Bot API](https://core.telegram.org/bots/api) — `createInvoiceLink`, `answerPreCheckoutQuery`, `SuccessfulPayment`, `refundStarPayment`, `RefundedPayment` | Exact implementation-time invoice, payment/update and refund contracts |
| R04 | [MDN: Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) and [Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) | Gesture-gated audio, graceful playback failure, synthesis and loading strategy |
| R05 | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/), [Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | Accessibility criteria; distinguish 24 px AA criterion from this product's 44 px target policy |
| R06 | [Google Fonts repository](https://github.com/google/fonts), [Lora family](https://github.com/google/fonts/tree/main/ofl/lora), [Nunito Sans family](https://github.com/google/fonts/tree/main/ofl/nunitosans) | Official font files, family metadata, Cyrillic/Latin coverage and bundled OFL notices |
| R07 | [Google Fonts licensing guidance](https://fonts.google.com/knowledge/glossary/licensing) | Keep each font's actual license; do not infer rights from price or availability |
| R08 | [Kenney Interface Sounds](https://kenney.nl/assets/interface-sounds) and [Kenney support/licensing](https://kenney.nl/support) | Optional UI texture source; Kenney states its asset-page game assets are CC0 and usable commercially |

Reference IDs in this master are local to this master. In particular, this document's R07 is **not** the missing shared-platform R07 mentioned in the supplied SRS.

### 18.2 Download-ready audio option

The approved optional stock source is **Kenney — Interface Sounds** at the R08 landing page. Use its official Download control during production; do not use a random mirror, scraped video soundtrack or a copied expiring CDN URL. The landing page and creator licensing statement were verified; **no particular archive filename, individual cue filename or checksum is claimed to have been downloaded and approved during this documentation task**.

If stock texture is useful:

1. Download the official pack into a production-source directory, not directly into the shipped public folder.
2. Save the included license and source URL/date. Verify that the downloaded archive actually carries the expected CC0 grant.
3. Audition only a soft click/paper-like sample for `sfx/select`, `sfx/panel-open` or `sfx/panel-close`. Record the exact chosen original filename, any edits and SHA-256 after inspection.
4. Trim silence, remove harsh peaks, match the museum mix and export under the game's stable asset ID. Do not import the entire pack into the runtime bundle.
5. If the pack is unavailable, licensing differs or no cue suits the art direction, use the fully specified procedural recipe. No functional or aesthetic requirement depends on a stock download succeeding.

No other audio website is pre-approved by this document. “Royalty-free” is not the same as unrestricted commercial use or permission to redistribute source recordings. Avoid noncommercial, no-derivatives, unclear AI-music rights, ripped game sounds, celebrity/character voices and recognizable borrowed melodies.

### 18.3 Asset register and generation rights

For each asset/family retain: stable asset ID, creator/provider, source URL or MCP tool/model, acquisition/generation date, original filename/output ID, prompt and lawful reference input, seed if available, license/terms version, commercial-use determination, attribution requirements, modifications, source/output hashes, and reviewer approval.

Generated images are not automatically public domain and are not automatically exclusive. Check the actual provider's commercial-use terms. Do not use named living artists, copyrighted characters, brand logos, real museum identities or unlicensed reference images to obtain a superficially distinctive result. Private user material must not be sent to an external generation service without authorization.

Keep font OFL files with distributed font assets and comply with modification/name restrictions if subsetting or otherwise modifying files. Give optional creator credit even where CC0 does not require it; do not use Kenney's logo or imply endorsement. Show a small accessible Credits screen linked from settings with the game's creators, tools where appropriate and third-party notices.

If rights cannot be established, replace the asset with an original procedural/generated alternative under verified terms. Unclear provenance is a release blocker, not a footnote after launch.

## 19. Portable brief for a separate design AI

The following block can be copied with this master into a visual-design tool. It is a design direction, not permission to alter the mechanics.

> **Design “Museum of Almost,” a premium illustrated causal-repair puzzle game for Telegram Mini Apps.** The user visits 24 small museum dioramas in Light, Air and Water collections. Each has exactly six interactive objects: two adjustable source controls and four derived effects governed by four explicit local rules. The player changes one source, tests freely and enjoys the whole scene becoming the requested arrangement. No timer, energy, coin shower, ad pressure or paid hints.
>
> **Feeling:** warm, observant, witty, precise, quietly satisfying. A museum of carefully cut paper, brass mounts, enamel knobs, ceramic channels, linen bellows and frosted glass. Use crisp ink-blue editorial outlines on warm ivory surfaces. Light has muted gold accents, Air dusty mint/teal, Water desaturated blue. Shallow tabletop perspective; intentional negative space; no photorealism, neon, generic glossy 3D, fantasy treasure chest UI or cluttered hidden-object art.
>
> **Typography:** live Lora headings and Nunito Sans interface copy, with equal English/Russian support. No lettering inside generated art. No SVG assets: layered raster illustration and raster icons, with real HTML/CSS interface elements.
>
> **Design these screens at 390×844 first:** foyer; collection shelf; L01 opening scene; L01 source inspector with staged proposal; mismatch report; successful repair/causal recap; full object-list mode; hint/Study confirmation; settings with accessibility; and default-versus-paid cosmetic frame preview. Include 320 px/reflow and desktop variants. Show actual target/rule text from the master, not lorem ipsum.
>
> **Hierarchy on the exhibit:** title and accession ID → explicit target → Scene/Object list choice → six readable objects → inspector/proposed one-change summary → Test the repair → four local rules and free assistance. All touch targets at least 44 px. Never hide an essential rule in a hover state. Color, sound and movement cannot be the only state distinction.
>
> **Signature moment:** after service-confirmed repair, the changed source settles first; affected objects align along their causal chain; a small brass registration tab slides into place. Restrained 0.9–1.4-second reveal, no blocking celebration. Reduced-motion mode shows the same final arrangement immediately.
>
> **Asset process:** approve one style board and a fully layered L01 first. Then produce consistent backgrounds and per-object state crops using the master catalogue. Do not redraw the whole image for each answer. Each of the 317 logical node-state mappings must be representable and readable; the JSON rules, not the image model, determine correctness.
>
> **Deliver:** design tokens, component states, phone/desktop compositions, scene-layer maps, raster export specifications and a state-contact-sheet approach. Preserve all 24 puzzle models and EN/RU directions. If an attractive composition makes the cause unreadable, simplify it. The free version must already look finished and beautiful.

---

## Final production statement

The finished game should feel like opening a beautifully made drawer, noticing one small disagreement and understanding exactly how to resolve it. Its quality comes from agreement between logic, language, illustration, interaction and sound—not from the number of effects on screen.

**Build a museum that rewards attention without demanding anxiety. Make every cause legible. Let every valid repair count.**
