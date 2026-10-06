# Story 5.5: Refresh the Fabric Proof Stack from Stabilized Serving Logic

Status: done

## Story

As a technical evaluator and product owner,
I want the Fabric proof stack refreshed from stabilized serving logic rather than manual UI iteration,
so that platform credibility follows real analytical behavior instead of visual churn.

## Acceptance Criteria

1. Given a coherence-approved package refresh is available, when the Fabric proof stack is refreshed, then the Bronze, Silver, and Gold proof tables are updated from the stabilized serving logic.
2. The semantic model is refreshed from the same stabilized serving logic input.
3. The existing report shell remains valid or is minimally aligned without requiring richer Desktop composition.
4. The repo documents the exit criteria that must be satisfied before a richer Desktop-authored report pass begins.

## Tasks / Subtasks

- [x] Build a governed runner for stabilized proof refresh. (AC: 1, 2, 3)
  - [x] Refuse to run when the coherence gate is blocked.
  - [x] Build the medallion bundle from the coherence-approved representative package.
  - [x] Refresh the live Lakehouse tables and semantic model from that package.

- [x] Verify the current bounded report proof remains aligned. (AC: 3)
  - [x] Fetch or normalize the report shell after the semantic refresh.
  - [x] Record any required minimal alignment actions honestly.

- [x] Update repo guidance for the post-refresh state. (AC: 4)
  - [x] Update the Fabric runbook to include the coherence gate and stabilized package path.
  - [x] Keep richer Desktop composition explicitly deferred behind documented exit criteria.

- [x] Leave behind preflight tests and refresh reporting. (AC: 1, 2, 3, 4)
  - [x] Add at least one local preflight test that builds the Fabric medallion bundle from the representative package.
  - [x] Write a machine-readable refresh report that references the coherence gate and live refresh outputs.

## Dev Notes

- Story `5.5` should only execute after Story `5.4` reports `promotable`.
- The proof stack remains bounded and public-safe; this is not a switch to unrestricted Fabric or to Desktop-first authoring.
- Honest reporting matters more than overclaiming full visual or semantic completeness.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-04-01: Created Story `5.5` implementation file from the accepted Epic `5` story definition.
- 2026-04-01: Added the stabilized proof-refresh runner plus a local preflight test built on the coherence-approved representative package.
- 2026-04-01: Validated Fabric bootstrap access, landed the representative bundle into the live Lakehouse, and confirmed all 16 bounded proof tables were available.
- 2026-04-01: Refreshed the live semantic model and report shell from the stabilized serving bundle and recorded the updated artifact reports.

### Completion Notes List

- Story `5.5` now has a governed preflight runner that refuses to proceed unless the representative coherence gate is promotable.
- The live Fabric proof stack was refreshed from the coherence-approved representative package, and the Lakehouse now exposes all 16 bounded proof tables including the inbound fact pair.
- The semantic model and current report shell were both patched successfully against the refreshed serving layer without requiring a richer Desktop-authored layout pass.
- The runbook now places the coherence gate ahead of any live Fabric refresh and keeps Desktop polish deferred behind explicit logic-stability exit criteria.

### File List

- `_bmad-output/implementation-artifacts/5-5-refresh-the-fabric-proof-stack-from-stabilized-serving-logic.md`
- `platform/fabric/automation/run-fab001-stabilized-proof-refresh.mjs`
- `tests/publication/fabric-stabilized-refresh.test.mjs`
- `05-compat/contracts/fab001_fabric_build_runbook.md`
- `_bmad-output/test-artifacts/fabric-proof/fab001/current/manifest.json`
- `_bmad-output/test-artifacts/fabric-proof/fab001/semantic-model-live/materialization-report.json`
- `_bmad-output/test-artifacts/fabric-proof/fab001/report-live/report-shell-report.json`
- `_bmad-output/test-artifacts/fabric-proof/fab001/stabilized-refresh-report.json`

### Change Log

- 2026-04-01: Created Story `5.5` and left it `ready-for-dev` pending Story `5.4`.
- 2026-04-01: Implemented the stabilized proof-refresh runner and preflight coverage.
- 2026-04-01: Marked Story `5.5` done after the representative bundle, Lakehouse, semantic model, and report shell were refreshed successfully.
