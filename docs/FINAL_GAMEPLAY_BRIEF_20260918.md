# Coral Crew — Strong Co-op Classroom Upgrade Brief

Date: 2026-09-18
Target repo: /Users/gemstone/Desktop/coral-crew
Current QA source: _qa/acceptance-latest/ACCEPTANCE_REVIEW.md
QA source SHA256: 9250663e4af582cc342ee54f4186595f64279560ff62fecb0ccf33b1599119cc
Intent: create a playable AGY iteration now, push it to GitHub, then let Astra later read BOTH this brief and the acceptance review from GitHub and continue the deeper development.

## 0. Product lesson / design principle
Do NOT interpret “make it more fun” as permission to add random features.
The classroom conclusion is:
- Fun must be specified as concrete player choices, pressure, consequences and cooperation.
- Preserve the attractive existing world/map.
- Connect the existing Pirate, Diver, Ship, Watermelon, Sonar, Shark and Kraken systems into one loop.
- Prefer deeper interaction between existing systems over a large pile of unrelated new mechanics.

## 1. Current verified baseline from QA
The current classroom build already passes the networking/runtime foundation:
- npm test: 9/9
- verify-upgrades: PASS
- isolated full classroom verification: 6/6
- LAN / two-iPad sync, role lock, reconnect, teacher pause/resume, WebKit landscape and 44px targets: PASS
- browser pageerror: 0

The latest QA still requests changes:
1. Smooth/default iPad quality hides the Kraken red hit flash and effectively freezes continuous Kraken animation.
2. Kraken can currently be soloed by Pirate in about two successful cannon hits; cooperation is not required.
3. Six rendered tentacles vs two authoritative tentacles is a visual/state mismatch.
4. Ship damage has no persistent visual state; current feedback is only transient.
5. Watermelon repetition is only partially improved; it is still fundamentally tap/chop repetition.

These are not optional regressions. The new version must preserve the verified runtime baseline while addressing the gameplay problems.

## 2. Primary design goal: Weak Co-op -> Strong Co-op
Current problem: the two players share a server/world but mostly do their own separate jobs.

New rule:
**Neither Pirate nor Diver should be able to complete the main Kraken encounter alone.**

Required dependency examples:
- Diver exposes/stuns/marks a Kraken weak point; Pirate cannon can damage it only during that window.
- If Kraken grabs Diver, Pirate must cannon-hit/distract Kraken to free Diver.
- If Kraken tentacles bind the ship, Diver must attack/free the tentacles from the water while Pirate keeps the ship alive.
- Diver retrieves magic pearls / upgrade resources that Pirate needs for cannon/ship upgrades.
- While Pirate is exhausted/resting, Diver temporarily carries more defensive responsibility.

The exact implementation can be simplified for this AGY pass, but the mechanical dependency must be real, not just narrative text.

## 3. Pirate role: remove “stand still and click everything”
Pirate should have mutually exclusive work stations / positions instead of firing cannon and chopping watermelon simultaneously.

Core Pirate loop:
1. move around the ship;
2. obtain/prepare watermelon supply;
3. use cannon station;
4. steer/reposition ship;
5. manage fatigue/rest.

Important:
- Actions should require the Pirate to be at the relevant place/station.
- Cannon use and watermelon preparation must not be possible simultaneously.
- Pirate has fatigue. Repeated work increases fatigue; at high fatigue Pirate must rest briefly.
- Rest must create gameplay pressure, not dead time: Diver may need to protect the ship during that period.

## 4. Watermelon redesign: timing mini-game, not repeated tapping
Do not solve watermelon boredom by merely adding a cooldown.

Required first-pass mini-game:
- A watermelon appears / is brought to the preparation area.
- A moving timing indicator/bar is shown.
- Pirate needs approximately 3 successful cuts.
- Accurate cuts produce full juice/food supply.
- Badly timed cuts waste some or all of the watermelon.
- If there is no watermelon to prepare, there is no reason to spam the chop action.
- The mechanic should be short and readable for children, not a long rhythm game.

Goal: watermelon becomes a small skill/checkpoint inside the larger loop rather than a mindless button.

## 5. Kraken challenge: make the giant monster mechanically believable
### Required fixes
- Default iPad “smooth” mode must still show a low-cost persistent Kraken threat:
  - hit flash visible;
  - cheap continuous tentacle/body motion;
  - no expensive effect required.
- Authoritative tentacle count must match what is visibly rendered. Prefer six logical tentacles if six are rendered.
- Kraken must not disappear after only two invisible/logical hits while six tentacles are visually present.
- Add persistent ship damage states, not only a 280ms flash:
  - at least 3 readable layers/states such as damaged -> leaking -> critical;
  - visual cracks/water/broken elements are acceptable as long as they remain iPad-friendly.

### Initial tuning target (tunable constants, not sacred numbers)
Use these only as a starting point and keep them easy to adjust:
- 6 authoritative tentacles matching 6 visible tentacles.
- A tentacle is damageable by cannon only after Diver exposes/stuns it.
- Expose/stun window: roughly 3–5 seconds.
- Pirate should need multiple successful cooperation cycles, not two solo shots.
- Target first successful boss clear for two new children: roughly 2–4 minutes, with visible near-failure pressure.
- A completely ignored Kraken should be capable of sinking the ship; players should not be able to idle safely.

The key test is not “more HP”. It is **decision pressure + cooperation**.

## 6. Ship movement / orientation
The map already looks good. Use it.

Desired behavior:
- Pirate can steer/reposition the ship.
- Kraken/resources/objectives can appear in different areas.
- Cannon effectiveness should depend on sensible orientation/range/position so Pirate sometimes has to move the ship instead of stationary spam.
- Keep controls simple enough for iPad classroom play.

If full sailing physics is too large for this AGY pass, implement a simplified but real positional/heading system rather than fake decorative movement.

## 7. Diver role: denser exploration and meaningful risk
The underwater area should not feel empty.

Diver can discover a small, curated set of meaningful pickups:
- magic pearl (important co-op upgrade currency)
- gems / diamonds / treasure
- golden watermelon or rare food resource
- temporary special weapon / machine gun power-up
- other upgrade material

Do NOT turn this into random weapon clutter. Each pickup should have an understandable purpose.

### Sonar
- Sonar should reveal only a limited forward/local area, not the whole map.
- Important resources should have variable/randomized locations per round where practical.
- This creates search decisions rather than walking directly to a known marker.

### Sharks / failure consequence
Sharks must be a real threat.
Avoid consequence-free instant death/reset.

Preferred child-friendly first pass:
- Diver can enter a downed/danger state.
- Teammate has a short rescue opportunity OR the team pays a visible penalty if rescue fails.
- Failing should cost carried loot / time / ship safety / another meaningful resource.
- The exact penalty can be tuned, but death should not be meaningless.

## 8. Day/night and island enemies
These are backlog, NOT the priority of the current AGY pass.

Potential later additions:
- night makes visibility lower and sonar more important;
- island enemies that Pirate can fight with a sword.

Reason to defer:
Pirate already has steering, cannon, watermelon and fatigue. Do not overload the role before the strong co-op core is fun.

## 9. AGY implementation priority for THIS version
Do not attempt every brainstorm equally.

### P0 — preserve and repair current accepted foundation
- keep all existing networking/classroom tests passing;
- smooth-mode Kraken feedback/motion;
- logical/visual tentacle alignment;
- persistent ship damage;
- no Pirate solo-Kraken exploit.

### P1 — create one clearly playable strong-co-op loop
- Diver exposes/stuns weak point -> Pirate cannon damages;
- Pirate and Diver can rescue/help each other in at least one real failure state;
- Pirate cannot simultaneously perform all ship jobs;
- watermelon timing mini-game replaces spam tapping.

### P2 — deepen the round if stable
- basic ship steering/positioning;
- limited sonar;
- a few purposeful underwater pickups;
- stronger shark consequence;
- fatigue/rest loop.

### Defer
- island combat;
- large weapon catalogue;
- elaborate day/night;
- cosmetic content that does not improve the loop.

## 10. Acceptance criteria for the AGY iteration
The version is acceptable to hand off to Astra only if:

1. Existing automated/classroom runtime checks still pass or any intentional test changes are documented.
2. Default iPad smooth mode still visibly communicates Kraken attacks.
3. Visible Kraken tentacles and authoritative simulation state match.
4. Pirate cannot defeat Kraken alone by simply firing cannon repeatedly.
5. At least one boss damage step mechanically requires Diver action first.
6. At least one real rescue/dependency interaction exists between roles.
7. Ship damage has persistent visible state.
8. Watermelon is no longer only repeated taps; a 3-step timing/accuracy mechanic or equivalent skill interaction exists.
9. Pirate actions have location/station exclusivity so cannon + chopping cannot be spammed simultaneously.
10. The two-iPad LAN flow, role lock, teacher controls, reconnect, landscape and touch target requirements remain usable.
11. No console/page errors in the verified classroom flow.
12. New/updated tests cover at minimum:
   - no solo Kraken;
   - role-gated Kraken damage;
   - tentacle state/render count contract if testable;
   - watermelon mini-game outcome/state;
   - persistent ship damage state.
13. The repository contains and commits:
   - _qa/acceptance-latest/ACCEPTANCE_REVIEW.md
   - docs/FINAL_GAMEPLAY_BRIEF_20260918.md (this brief)
   so Astra can later continue from GitHub without relying on chat memory.

## 11. Git/GitHub handoff rule
The working tree is currently dirty and contains the classroom changes + QA artifacts. DO NOT reset, discard or overwrite them.

For this AGY pass:
- treat the current dirty working tree as the classroom baseline;
- preserve current QA artifacts;
- create a dedicated branch such as `agy/strong-coop-v1-20260918`;
- commit the current intended classroom baseline + this gameplay iteration + QA/brief docs in a coherent history;
- push the branch to origin `https://github.com/sydneygemstone-sudo/coral-crew.git`;
- report branch name and final commit SHA;
- do not force-push and do not merge to main unless explicitly requested.

## 12. Astra handoff later
When Astra quota is restored, Astra should start from GitHub and read BOTH:
1. `_qa/acceptance-latest/ACCEPTANCE_REVIEW.md`
2. `docs/FINAL_GAMEPLAY_BRIEF_20260918.md`

Then inspect AGY's actual implementation and tests before planning or coding. Astra should treat the brief as product intent and the acceptance review/tests as evidence, not assume AGY fully satisfied either.
