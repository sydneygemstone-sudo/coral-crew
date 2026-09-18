# Coral Crew Changelog: 2026-09-18 Consolidation

## 1. Baseline
* **Baseline Commit**: `45efd40749257a3844e3ff68529329932de66647` (`45efd40`)
* **Baseline Subject**: `feat(coral-crew): initial release of Coral Crew 3D LAN co-op game with Game Master protocol`

---

## 2. Changes Implemented in Today's Classroom Session

### Architectural & Deployment Improvements
* **Public Directory Separation**:
  - Moved client assets (`index.html`, `client.js`, `style.css`, `teacher.html`, `qa.html`, `about.html`, `journal.html`, `parents.html`, `archive.css`) into `public/`.
  - Hardened server route handling in `server.mjs`: blocks direct access to `server.mjs`, `simulation.mjs`, `package.json`, and dotfiles with HTTP 403/404, preventing server source code exposure.
* **Classroom Automation Scripts**:
  - `classroom-start.command`: Performs self-test (`npm test`), detects local LAN IP dynamically, boots background daemon on `0.0.0.0:18888`, prints student/teacher URLs & QR code, and opens teacher console.
  - `classroom-stop.command`: Cleanly terminates server by PID file.
  - `classroom-status.command`: Checks process status, port binding, `/health`, `/api/lan`, and recent server logs.
* **Teacher WebSocket Synchronization**:
  - Resolved race condition where teacher connecting to a room before players failed to auto-create room state.
  - Added teacher set broadcasting for live state updates, pause/resume, questions, and rewards.

### Gameplay Balance: Reduced Watermelon Repetition (Upgrade 1)
* **Hunger Burn Rate**: Reduced from `0.7/s` to `0.45/s` (50%+ increase in operational duration).
* **Dock Feeding Satiety**: Dock feeding increases Diver hunger by +65 and HP by +60.
* **Feast Supply ("盛宴备粮")**:
  - Re-themed Pirate chop action to "盛宴备粮".
  - Completing 3 taps yields a generous supply of +6 food (or +8 with knife upgrade) and +4 coins, giving crew ample supplies for exploration.
  - When ship food is >= 8, button label indicates "仓储充裕" to discourage mindless clicking.

### Gameplay Feedback: Enhanced Kraken Pressure (Upgrade 2)
* **Colossal 3D Visuals**:
  - Scaled Kraken model to 2.5x with 6 articulated thrashing tentacles, horned mantle, glowing slit-pupil eyes, and deep underwater shadow.
  - Atmosphere transition: sky and fog shift to a dark stormy abyss (`0x141f2a`, `0x182535`) during Kraken warning and combat phases.
* **Multi-Sensory Feedback Loop**:
  - 4-second Omen warning phase with sub-bass audio cue (`kraken_omen`).
  - Kraken roar audio (`kraken_roar`) on formal arrival.
  - Rhythmic tentacle slam attack every 3.6 seconds (`kraken_hit`) dealing burst ship damage.
  - Screen shake decay system on camera.
  - Damped spring physics on ship tilt (roll/pitch).
  - Red hit flash vignette on impact.
  - Procedural Web Audio synthesis for sub-bass roar and wood crunch impact.
* **Co-op Combat Interactions**:
  - Pirate cannon hits stagger Kraken and add +1.6s stun to attack timer.
  - Diver underwater bubble gun hits deal 25 damage and add +1.8s stun to attack timer.

---

## 3. QA Acceptance Status
* **Verdict**: `CHANGES_REQUESTED`
* **Evidence**: `_qa/acceptance-latest/ACCEPTANCE_REVIEW.md`
* **Summary**:
  - Networking, room isolation, two-iPad sync, WebKit Safari landscape layout, 44px touch targets: **PASS**.
  - Repetition reduction: **PARTIAL PASS** (taps are higher yield, but fundamentally still tap/chop).
  - Kraken pressure: **PARTIAL PASS** (visuals and feedback improved, but smooth-mode vignette/motion gap, visual/logical tentacle count mismatch, and lack of persistent ship damage remain).

---

## 4. Verification Results

| Test / Check | Command | Result |
| :--- | :--- | :--- |
| Core Simulation & Protocol Unit Tests | `npm test` | **9/9 PASS** (~800ms) |
| Upgrade Visuals & Interaction Check | `node verify-upgrades.mjs` | **4/4 PASS** (0 errors) |
| Isolated Full Classroom Verification | `node _qa/acceptance-latest/verify-classroom-isolated.mjs` | **6/6 PASS** (0 errors) |
| Visual Acceptance & Screenshot Capture | `node _qa/acceptance-latest/visual-accept.mjs` | **PASS** (0 errors, 5 screenshots) |

---

## 5. Repository Consolidation & Artifacts

* **Canonical Repository**: `https://github.com/sydneygemstone-sudo/coral-crew.git`
* **Consolidation Baseline Snapshot Commit SHA**: `d4b9f64f8e60711c4436deaa9cd66f765d5a44fb` (`d4b9f64`)
* **Snapshot Tag**: `classroom-20260918-pre-astra`
* **Student-Works Cleanup Commit SHA**: `5ec2b6279930f7b14798c19955743b171f114170` (`5ec2b62`)

### Local Paths Retained
* **Canonical Working Copy**: `/Users/gemstone/Desktop/coral-crew` (Sole active development source)
* **Legacy Copies (Neutralized / Pointer-Only)**:
  - `/Users/gemstone/Desktop/student-works/coral-crew`
  - `/Users/gemstone/dev/student-works/coral-crew`

### Residual Conflicts
* **None**. All legacy copies have been replaced with redirect pointer README files.
