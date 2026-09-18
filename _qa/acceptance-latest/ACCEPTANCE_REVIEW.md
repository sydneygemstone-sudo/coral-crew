# Coral and Crew — New Version Acceptance Review
Date: 2026-09-18
Status: CHANGES_REQUESTED
Repo: /Users/gemstone/Desktop/coral-crew
Baseline: 45efd40

## Verified
- npm test: 9/9 passed.
- verify-upgrades.mjs: passed (unique room).
- Full classroom verification: passed 6/6 in isolated room QAISO.
- HTTP/static routes, role locking, two-iPad sync, reconnect, teacher pause/resume, WebKit/iPad landscape and 44px touch targets all passed.
- Browser pageerror count: 0 in isolated full-flow verification.

## Upgrade 1 — Watermelon repetition
- New label: “盛宴备粮”.
- Three taps complete one feast; simulation yields 6 food (visible count may be 5 after automatic consumption).
- “仓储充裕” discourages unnecessary repeated tapping once supply is high.
- Result: repetition is materially reduced, but the action is still fundamentally “tap/chop watermelon”.
- Classroom feedback was stronger (“不要再切西瓜了”), so this is PARTIAL, not a full redesign.

## Upgrade 2 — Kraken pressure
- Kraken client model is much larger and includes six visual tentacles.
- Added warning HUD, dark atmosphere, roar/omen audio, screen shake, ship tilt, red hit flash, boss HP, slam message.
- Natural spawn includes a ~4 second omen before appearance.
- These are meaningful pressure/feedback improvements.

## Blocking / design issues
1. Default iPad quality is “smooth”.
   - CSS hides #vignette in smooth mode, so the new red Kraken hit-flash is invisible by default.
   - client.js sets animation time t=0 in smooth mode, so Kraken body/tentacle animation is effectively static rather than continuously menacing.
   - Screen shake, ship tilt and audio still work, but the intended visual pressure is weakened on the exact classroom device profile.

2. Kraken combat is too easy and does not require cooperation.
   - Simulation has only 2 authoritative tentacles at 40 HP each.
   - Pirate cannon damage is 45 at base level, so each tentacle dies in one successful cannon hit.
   - Direct simulation confirmed pirate can defeat Kraken solo in ~2 seconds with two successful cannon shots, before the ship takes damage.
   - Diver can also damage the core independently.
   - This conflicts with the goal “not one role mechanically soloing the boss”.

3. Visual/state mismatch.
   - Client renders six Kraken tentacles, but authoritative simulation tracks two.
   - The boss can disappear after the two logical tentacles are destroyed while six visual tentacles were shown.
   - This risks making a giant monster feel fake/anticlimactic.

4. Persistent ship-damage feedback is still absent.
   - Current feedback is 280ms red flash + shake + tilt + synthesized hit sound + toast/HUD.
   - No persistent cracks, flooding, broken ship parts or accumulating visual damage state.

## Test note
The original verify-classroom.mjs failed when run against room CORAL because the live classroom room was occupied. An isolated copy using room QAISO passed all 6 sections. This is a test-isolation issue, not a gameplay regression.

## Acceptance decision
Core networking/runtime: PASS.
Upgrade 1 (less repetition): PARTIAL PASS.
Upgrade 2 (Kraken pressure): PARTIAL PASS.
Classroom release verdict: CHANGES_REQUESTED before calling the upgrade complete.

Recommended next patch:
- Keep hit-flash visible in smooth mode.
- Keep low-cost Kraken tentacle motion in smooth mode.
- Make Kraken require both roles (e.g. diver exposes/stuns weak point, pirate cannon can then damage it).
- Align logical tentacle count with rendered tentacles, or visually render only authoritative tentacles.
- Add at least one persistent ship damage layer/state after slams.
