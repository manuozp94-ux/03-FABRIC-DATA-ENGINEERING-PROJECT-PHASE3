# Story 5.4: Validate Realism, Invariants, and Cross-Table Coherence Before Promotion

Status: done

## Story

As a product owner,
I want realism and invariant checks applied before logic-driven growth is promoted,
so that the public proof remains believable and analytically stable over time.

## Acceptance Criteria

1. Given a logic-driven package refresh is prepared, when coherence validation runs, then the checks reject rows that break quantity, status, or date semantics.
2. Economic proxy behavior, quarter-over-quarter growth, and snapshot transitions are reviewed for unrealistic jumps or contradictions before a package is considered promotable.
3. The promotable package records which rule set, scenario inputs, and representative-market refresh identity produced the refreshed outputs.
4. A failed coherence run blocks promotion to the stabilized serving layer and to any Fabric proof refresh step.

## Tasks / Subtasks

- [x] Create a coherence gate for the representative package. (AC: 1, 4)
  - [x] Validate quantity, date, and status semantics on demand, inbound, and snapshot facts.
  - [x] Reuse existing controlled-realism checks rather than inventing a disconnected gate.
  - [x] Write a machine-readable coherence report with promotable or blocked status.

- [x] Add deeper realism review beyond structural validity. (AC: 2)
  - [x] Review quarter-over-quarter growth for bounded plausibility.
  - [x] Review economic proxy behavior for margin-rate and unit-value contradictions.
  - [x] Review event-to-event jump and recovery behavior for implausible spikes.
  - [x] Review snapshot transitions for impossible inventory state changes.

- [x] Record promotion identity and references. (AC: 3, 4)
  - [x] Capture scenario reference, representative source version, and generation-rule version.
  - [x] Capture the representative market report reference and coherence-rule version.
  - [x] Fail closed when traceability inputs are missing or ambiguous.

- [x] Leave behind automated tests and a reusable runner. (AC: 1, 2, 4)
  - [x] Add passing and blocking tests for the coherence gate.
  - [x] Add a reusable runner that later stories can consume before any live proof refresh.

## Dev Notes

- Story `5.3` created the representative local package and representative internal controls.
- Story `5.4` should treat that representative package as the candidate-for-promotion surface.
- This story does not refresh Fabric live by itself; it creates the promotion gate that Story `5.5` must honor.

### Project Structure Notes

- Representative package: `_bmad-output/test-artifacts/fabric-representative/current`
- Representative internal controls: `_bmad-output/test-artifacts/fabric-representative/internal-controls/current`
- Controlled realism matrix: `platform/fabric/contracts/controlled-realism-test-matrix.md`
- Scenario reference: `platform/fabric/contracts/logic-first-scenario-parameter-sets.md`

### Testing Requirements

- Coherence gate must pass on the representative package produced by Story `5.3`.
- Coherence gate must block intentionally corrupted arithmetic or traceability state.
- Coherence output must remain machine-readable and text-diffable.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-04-01: Created Story `5.4` implementation file from the accepted Epic `5` story definition.
- 2026-04-01: Implemented the representative coherence validator, reusable runner, and machine-readable gate report.
- 2026-04-01: Added approval and blocking tests for the coherence gate and tuned bounded jump checks against the representative market.
- 2026-04-01: Approved the representative package with zero blocking failures and recorded the official coherence report.

### Completion Notes List

- Story `5.4` now blocks promotion unless structural validity, realism checks, and traceability identity all pass on the representative package.
- The coherence gate writes a machine-readable report that later refresh steps can consume without re-deriving release identity by hand.
- Quarter-over-quarter growth, unit-value behavior, jump/recovery plausibility, and snapshot-state transitions are now reviewed together instead of as disconnected checks.
- The official representative coherence report approved the current representative package with zero blocking failures.

### File List

- `_bmad-output/implementation-artifacts/5-4-validate-realism-invariants-and-cross-table-coherence-before-promotion.md`
- `platform/fabric/validation/validate-representative-coherence.mjs`
- `platform/fabric/automation/run-representative-coherence-gate.mjs`
- `tests/publication/representative-coherence.test.mjs`
- `_bmad-output/test-artifacts/fabric-representative/representative-coherence-report.json`

### Change Log

- 2026-04-01: Created Story `5.4` and moved it to `in-progress`.
- 2026-04-01: Implemented the representative coherence gate, tests, and machine-readable reporting.
- 2026-04-01: Marked Story `5.4` done after the representative package passed the coherence gate.
