# Story 7.4: Integrate Fabric Runtime Execution with Release Traceability and Recovery Inputs

Status: done

## Story

As a product owner,
I want Epic `6` release records to incorporate Fabric runtime identity, control-plane evidence, and downstream serving-output identity,
so that later change summaries and recovery steps describe the real operational path rather than only a transitional local refresh path.

## Acceptance Criteria

1. Given the corrected Fabric-native execution and orchestration layers exist, when release traceability is extended, then release records can reference the repo input package, Fabric pipeline run, notebook execution, runtime-control state, and Fabric serving-output identity.
2. The current and last-known-good release identities can be reconciled between repo-side records and Fabric-side control tables.
3. The release record can state which public source is currently active during the transition.
4. The resulting traceability inputs are sufficient for Epic `6` change summaries and rollback work without requiring another architecture correction first.

## Tasks / Subtasks

- [x] Extend the release-identity contract and implementation target with serving-output evidence. (AC: 1, 3, 4)
  - [x] Add the repo input package identity, Fabric serving identity, and public-source-state fields.
  - [x] Keep fail-closed behavior when the serving-side runtime artifacts are missing or incomplete.

- [x] Extend reconciliation between repo-side release pointers and Fabric-side control tables. (AC: 1, 2, 3, 4)
  - [x] Compare repo pointers with Fabric runtime state and serving-output state.
  - [x] Capture which source currently powers the public surface during transition.

- [x] Verify the revised traceability path. (AC: 1, 2, 3, 4)
  - [x] Add or update tests for the serving-identity extension.
  - [x] Re-materialize the local release-ledger artifacts once the reopened scope lands.

- [x] Align handoff for Epic `6`. (AC: 2, 3, 4)
  - [x] Capture the updated inputs that Stories `6.2` and `6.3` will consume once Epic `7` re-closes.

## Dev Notes

- Story `7.4` should extend Story `6.1`, not replace it.
- Story `7.4` should consume the runtime evidence created in Story `7.3`.
- The goal is still not to eliminate the bounded direct-notebook fallback immediately. The goal is to record the stronger runtime path honestly and make it usable for change summaries and rollback inputs.

### References

- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/implementation-artifacts/6-1-record-release-identity-and-traceability.md`
- `_bmad-output/implementation-artifacts/7-3-add-a-real-fabric-pipeline-plus-runtime-governance-tables.md`
- `platform/fabric/contracts/release-identity-contract.md`
- `platform/fabric/contracts/runtime-governance-contract.md`
- `platform/fabric/automation/materialize-release-identity-record.mjs`
- `05-compat/scripts/materialize_fab001_runtime_pipeline.py`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-04-02: Story created during Epic `7` continuation after Story `7.3` closed with a bounded live runtime path.
- 2026-04-02: Extended the release-ledger materializer to consume the runtime pipeline report, runtime governance report, and local `ctrl_*` control rows.
- 2026-04-02: Added runtime reconciliation output plus fail-closed validation for mismatched Fabric control pointers.
- 2026-04-02: Re-materialized the live repo release ledger so the current release record now includes pipeline, notebook, governance, and recovery inputs.
- 2026-04-02: Extended the release ledger to capture repo input package identity, active public-source mode, and serving-extract status from runtime governance.
- 2026-04-02: Tightened reconciliation so it now compares public-source mode and serving-extract status in addition to release pointers.
- 2026-04-02: Re-materialized the local release-ledger artifacts after the serving-identity extension and revalidated the full publication suite.
- 2026-04-02: Ran the full publication test suite with `33/33` passing after the runtime-aware ledger changes.

### Reopened Scope Notes

- The existing runtime-aware release ledger remains valid delivered evidence.
- This story is reopened because the ledger now needs to describe both the repo input package and the downstream Fabric-derived serving output.
- Story `6.2` and Story `6.3` should resume only after that dual-identity release model is in place.

### File List

- `_bmad-output/implementation-artifacts/7-4-integrate-fabric-runtime-execution-with-release-traceability-and-recovery-inputs.md`
- `platform/fabric/contracts/release-identity-contract.md`
- `platform/fabric/automation/materialize-release-identity-record.mjs`
- `tests/publication/release-identity.test.mjs`
- `_bmad-output/test-artifacts/release-ledger/release-index.json`
- `_bmad-output/test-artifacts/release-ledger/current-release.json`
- `_bmad-output/test-artifacts/release-ledger/last-known-good-release.json`
- `_bmad-output/test-artifacts/release-ledger/release-runtime-reconciliation.json`
- `_bmad-output/test-artifacts/release-ledger/releases/rls_fab001_20260401t221500z.json`

### Change Log

- 2026-04-02: Created Story `7.4` implementation file and moved it directly into active development.
- 2026-04-02: Marked Story `7.4` done after the runtime-aware release ledger, reconciliation artifact, and fail-closed tests were in place.
- 2026-04-02: Reopened Story `7.4` so release traceability captures both repo input identity and Fabric serving identity.
- 2026-04-02: Re-closed Story `7.4` after the release ledger and reconciliation artifacts began recording active public-source mode and serving-extract state.
