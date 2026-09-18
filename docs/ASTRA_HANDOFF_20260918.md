# Astra Handoff: Coral Crew (2026-09-18)

> **IMPORTANT NOTICE FOR ASTRA**:
> Read this document **first** before touching any code or planning any changes.

---

## 1. Canonical Source of Truth

* **Canonical Remote Repository**: `https://github.com/sydneygemstone-sudo/coral-crew.git`
* **Canonical Local Path**: `/Users/gemstone/Desktop/coral-crew`
* **Default Branch**: `main`
* **Snapshot Tag**: `classroom-20260918-pre-astra`
* **Consolidation Baseline Snapshot Commit**: `d4b9f64f8e60711c4436deaa9cd66f765d5a44fb`
* **Student-Works Cleanup Commit**: `5ec2b6279930f7b14798c19955743b171f114170`
* **Current Version**: `2026-09-18 classroom pre-Astra snapshot`

> [!WARNING]
> **DO NOT** look for Coral Crew source code in `student-works/coral-crew` or any other directory.
> All legacy `student-works` copies have been deprecated and replaced with pointer README files.
> `/Users/gemstone/Desktop/coral-crew` is the **only** canonical development repository.

---

## 2. Current Status & QA Verdict

* **Current QA Status**: `CHANGES_REQUESTED` (See `_qa/acceptance-latest/ACCEPTANCE_REVIEW.md`)
* **Is this the final completed version?**: **NO.**
* **What is this version?**:
  This is the frozen, working classroom snapshot following today's (2026-09-18) real dual-iPad test with Lisha and Quentin.
  All networking, room isolation, teacher control, dual-iPad sync, and runtime tests are 100% passing.
  However, gameplay depth (Strong Co-op, Kraken co-op gating, persistent ship damage, watermelon timing mini-game) is **not yet implemented** and is explicitly assigned to Astra.

---

## 3. Mandatory Reading Order for Astra

When your quota is restored and you take over development, you **must** read the project files in the following exact sequence:

1. **`docs/ASTRA_HANDOFF_20260918.md`** (this document) — orientation, ground rules, and repository topology.
2. **`_qa/acceptance-latest/ACCEPTANCE_REVIEW.md`** — the real QA acceptance report documenting verified runtime features and specific gaps/blockers.
3. **`docs/FINAL_GAMEPLAY_BRIEF_20260918.md`** — the product specification detailing the Strong Co-op upgrade, Pirate work stations, watermelon timing mini-game, and Kraken co-op combat requirements.
4. **Automated Tests**:
   - `test.mjs` (authoritative unit tests: movement, state synchronization, role lock, teacher auth, reconnect)
   - `verify-upgrades.mjs` (E2E browser check for upgrade labels, feast yield, boss HUD)
   - `_qa/acceptance-latest/verify-classroom-isolated.mjs` (isolated full classroom flow verification)
   - `_qa/acceptance-latest/visual-accept.mjs` (WebKit visual snapshot test)
5. **Actual Source Code**:
   - `simulation.mjs` (authoritative game loop and state transitions)
   - `server.mjs` (HTTP server, WebSocket rooms, teacher controls, token auth)
   - `public/client.js` (Three.js 3D rendering, Web Audio synthesis, UI updates, controls)
   - `public/index.html` & `public/style.css` (DOM structure, touch HUD, hit-flash vignette)
   - `public/teacher.html` (Teacher monitoring and remote control console)

---

## 4. Crucial Guidelines for Astra

1. **Inspect Before Coding**:
   Astra must inspect the actual AGY implementation, live classroom status, and test suite before writing any code. Never assume AGY claims in chat history are accurate without verifying against code and test evidence.
2. **Do Not Guess From Chat Memory**:
   Do not reconstruct requirements or repository history from chat memory. The ground truth is committed here in Git.
3. **Do Not Reconstruct the Repository**:
   The repository architecture (`public/` static separation, `0.0.0.0:18888` dynamic LAN IP, `.command` deployment scripts, WebSocket room architecture) is stable, verified, and complete. Your mission is **gameplay development (P0 / P1 / P2 from the brief)**, not architectural churn.
4. **Preserve Verified Runtime Invariants**:
   - Native `npm test` must always pass.
   - Dual iPad Safari (WebKit) landscape orientation with `touch-action: none` and 44px+ touch targets must be maintained.
   - Zero console errors in WebKit during full match play.
   - Role locking and 48-char reconnect tokens must continue to prevent race conditions.

---

## 5. Next Development Tasks (For Astra)

When ready, consult `docs/FINAL_GAMEPLAY_BRIEF_20260918.md` section 9 for priority breakdown:

* **P0**:
  - Keep hit-flash vignette and continuous tentacle wave motion active in `smooth` mode (default iPad profile).
  - Align authoritative simulation tentacles (currently 2 tracked) with visually rendered tentacles (6 rendered).
  - Eliminate Pirate solo-Kraken exploit (Kraken should not be defeatable by cannon spam alone).
  - Implement persistent visual ship damage states (damaged -> leaking -> critical).
* **P1**:
  - Implement Strong Co-op dependency (e.g., Diver exposes/stuns Kraken weak point -> Pirate cannon can then damage it).
  - Real mutual rescue / dependency interaction between Pirate and Diver.
  - Pirate work station exclusivity (cannot simultaneously chop and fire cannon).
  - Watermelon 3-step timing/accuracy mini-game.
* **P2**:
  - Ship steering / repositioning.
  - Directional / limited sonar range.
  - Purposeful underwater pickups (magic pearls, rare food).
  - Stronger shark penalty loop.
