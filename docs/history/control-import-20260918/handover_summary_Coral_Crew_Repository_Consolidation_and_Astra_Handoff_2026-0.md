# Coral Crew Repository Consolidation & Astra Handoff Plan

Date: 2026-09-18
Mode: REPOSITORY_CONSOLIDATION_ONLY
Do not start gameplay development in this task.

## Objective
Create one unambiguous source of truth for Coral Crew on GitHub, preserve today's classroom code and QA evidence, add complete handoff logs/briefs for Astra, and remove/neutralize stale local duplicate copies so future sessions cannot accidentally develop against an older version.

## Current observed topology

### Canonical active standalone repo
Path:
`/Users/gemstone/Desktop/coral-crew`

Remote:
`https://github.com/sydneygemstone-sudo/coral-crew.git`

Branch:
`main`

Current HEAD / origin/main observed locally:
`45efd40749257a3844e3ff68529329932de66647`

Working tree:
DIRTY. It contains today's classroom changes plus QA/deployment artifacts.
Do not reset, clean, discard, or replace this tree.

Important dirty state includes:
- staged move of browser assets from repo root into `public/`
- unstaged edits to `public/client.js`, `public/index.html`, `public/style.css`, `public/teacher.html`, `server.mjs`, `simulation.mjs`, `test.mjs`, `.gitignore`
- untracked `_qa/`, `verify-classroom.mjs`, `verify-upgrades.mjs`, classroom start/status/stop scripts, and deployment note

Latest QA:
`/Users/gemstone/Desktop/coral-crew/_qa/acceptance-latest/ACCEPTANCE_REVIEW.md`
SHA256:
`9250663e4af582cc342ee54f4186595f64279560ff62fecb0ccf33b1599119cc`
Status:
`CHANGES_REQUESTED`

Final classroom gameplay brief currently stored outside repo:
`/Users/gemstone/dual-host-mcp-gateway/control/artifacts/coral-crew/brief_Coral_Crew_Strong_Co-op_Classroom_Upgrade_Brief_2026-09-18.md`
SHA256:
`4d93d3dfb84ccabdd4bd27947baf021ec13b4fdc5987ed919e9a043fbbb5040b`

### Legacy duplicate copy 1
`/Users/gemstone/Desktop/student-works/coral-crew`
Parent remote:
`https://github.com/sydneygemstone-sudo/student-works.git`

### Legacy duplicate copy 2
`/Users/gemstone/dev/student-works/coral-crew`
Parent remote:
`https://github.com/sydneygemstone-sudo/student-works.git`

The two legacy copies match each other on sampled key files and are stale relative to the active standalone repo.

Observed key hashes:

- legacy `server.mjs` (both copies):
  `65da319d7c026df6b5a4421e151404947bd24f131aecb1ef818be4b298ef90b0`
- active `server.mjs`:
  `22a841f983b75387fd38b16a59907a655383f36054504c8629382d0238589902`

- legacy `simulation.mjs` (both):
  `2672fb3da94cb8b5043d22babe123886d579bb7bf95eaac9aafe46601c20a8a8`
- active `simulation.mjs`:
  `7c437c502afd10a870e05d662eb9bcd0ec7aa10fc3bbbe8c5eeb2d07963cc211`

- legacy `client.js` (both):
  `e4c43db5f653d55ace06c5b5baf67e5a9c5154dd0dd8cdee932604a8a49f7dc7`
- active `public/client.js`:
  `c84903a04e3bad7f23cc968fb11a475f3cdd28da50842b7b0e6bd7ee2ea9ae50`

- legacy `test.mjs` (both):
  `f7df4793bf364575cb9d7fa5e5a87e564906c10395d411ada308031305300706`
- active `test.mjs`:
  `0c55394964f5cc69e89ac351492ca38da7c78dd72ece1615176aacb0adeaa078`

Conclusion: the standalone repo is the only active source and the student-works copies must not be merged back over it.

## Desired final GitHub state

### A. `sydneygemstone-sudo/coral-crew`
This becomes the sole canonical development repository.

Its default/main branch should contain the latest classroom snapshot, including:
- today's actual classroom code changes
- `_qa/acceptance-latest/ACCEPTANCE_REVIEW.md`
- QA screenshots/scripts that are useful for future visual verification
- `docs/FINAL_GAMEPLAY_BRIEF_20260918.md` copied from the control artifact
- `docs/ASTRA_HANDOFF_20260918.md`
- `docs/CHANGELOG_20260918.md`
- existing classroom/runtime scripts that are actually needed

Do not implement new gameplay mechanics during consolidation.

After verification, create a snapshot tag such as:
`classroom-20260918-pre-astra`

The purpose of the tag is rollback/reference, not a release-quality claim.

### B. `sydneygemstone-sudo/student-works`
The stale Coral Crew source must stop presenting itself as a second development source.

Preferred remote cleanup:
replace the tracked legacy `coral-crew/` implementation in the current student-works tree with a tiny pointer README stating:
- project moved to standalone canonical repo
- canonical URL: `https://github.com/sydneygemstone-sudo/coral-crew`
- do not develop against this directory
- historical versions remain available in student-works Git history

Do this in a clean temporary worktree/clone if either existing student-works checkout contains unrelated dirty/untracked work. Never discard unrelated student projects.

Commit this as a separate repository-hygiene change.

## Canonical documentation for Astra

### `docs/ASTRA_HANDOFF_20260918.md`
Must state clearly:
- canonical repo and branch
- snapshot tag and commit SHA
- current QA result is CHANGES_REQUESTED, not accepted-final
- exact required reading order:
  1. `docs/ASTRA_HANDOFF_20260918.md`
  2. `_qa/acceptance-latest/ACCEPTANCE_REVIEW.md`
  3. `docs/FINAL_GAMEPLAY_BRIEF_20260918.md`
  4. existing tests and source
- Astra must inspect implementation/tests before coding
- AGY or prior worker claims are not authoritative without code/test evidence
- next phase is final gameplay development, not repository reconstruction

### `docs/CHANGELOG_20260918.md`
Record:
- baseline commit `45efd40`
- today's classroom changes as observed
- verification commands/results
- QA evidence paths
- consolidation commit SHA
- tag
- student-works pointer cleanup commit SHA
- any residual local paths that could not safely be removed

## Verification before publishing canonical snapshot
Run at minimum:
- `npm test`
- `node verify-upgrades.mjs`
- classroom verification in isolated room if current script supports it
- browser/static route sanity check
- no obvious console/page errors if current QA tooling supports this

Repository consolidation must not silently change gameplay to make tests pass.

If a verification fails:
- preserve current code
- document the failure
- do not invent a pass
- still create a traceable consolidation branch/commit only if it is safe and clearly marked

## Local cleanup target
After both GitHub repositories are verified:

Keep exactly one active local Coral Crew source checkout:
`/Users/gemstone/Desktop/coral-crew`

It must end with a clean working tree tracking the canonical GitHub commit.

For:
- `/Users/gemstone/Desktop/student-works/coral-crew`
- `/Users/gemstone/dev/student-works/coral-crew`

do not simply rm -rf inside a tracked parent repo.

Instead:
1. first update `student-works` remote so `coral-crew/` is a pointer-only directory;
2. synchronize each local student-works checkout with that commit using non-destructive fast-forward/pull behavior;
3. preserve unrelated untracked or dirty student work;
4. if a checkout cannot be safely synchronized, do not force/reset it; report it as residual conflict requiring manual decision.

Safe ephemeral cleanup in canonical repo may remove ignored runtime/cache output such as `.runtime/` after confirming no evidence is needed.
Do not delete QA evidence that is being committed.
Do not delete `node_modules` unless there is a specific reason; it is ignored and not a version-source conflict.

## Previous mistaken development task
A prior MCP task was staged but never started:
`task_20260918_205702_f13f70`
It requested Strong-Co-op gameplay development.
It must NOT be approved for this consolidation phase.
Prefer rejecting it as superseded so it cannot be accidentally dispatched later.

Suggested rejection reason:
`Superseded: repository consolidation and Astra handoff only; no gameplay development yet.`

## Completion receipt
Final report must include:
- canonical coral-crew GitHub repo
- canonical branch
- final snapshot commit SHA
- tag
- all tests/verification with real results
- files added for Astra handoff
- student-works cleanup commit SHA
- local paths remaining
- `git status --short` for canonical checkout
- whether both student-works local copies are now pointer-only / synchronized
- any unrelated dirty data intentionally preserved
- explicit statement: NO NEW GAMEPLAY DEVELOPMENT PERFORMED
