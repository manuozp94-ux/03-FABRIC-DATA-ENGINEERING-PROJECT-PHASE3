# Story 6.1: Record Release Identity and Traceability

Status: done

## Story

As a product owner,
I want every public release tied to source, data state, and validation results,
so that I can prove exactly what is live and how it was approved.

## Acceptance Criteria

1. Given a public release candidate is promoted, when release metadata is recorded, then the published state can be traced to a release identifier, source-control state, approved data snapshot or refresh state, and validation result.
2. The currently published version and last-known-good approved version are identifiable from the release records.
3. Traceability artifacts are stored in a consistent structure that supports later review and recovery.
4. The release record does not rely on undocumented manual memory to explain what was deployed.
5. The release record includes the approved publication-boundary or manifest reference for the public proof assets included in that release.

## Tasks / Subtasks

- [x] Define the release-ledger structure and contract. (AC: 1, 2, 3, 5)
  - [x] Create a machine-readable ledger layout with release records plus `current` and `last-known-good` pointers.
  - [x] Document the minimum required fields for release identity and traceability.

- [x] Implement governed release-record materialization. (AC: 1, 2, 3, 4, 5)
  - [x] Build a release-record generator that consumes the coherence-approved representative package state and live proof refresh record.
  - [x] Capture explicit source-control state even when no `HEAD` commit exists yet.
  - [x] Refuse to record a published release when the proof refresh is not actually live.

- [x] Leave behind verifiable local evidence. (AC: 1, 2, 3, 4, 5)
  - [x] Generate the first release ledger from the current approved proof state.
  - [x] Add node-based tests for success and fail-closed behavior.

- [x] Align repo guidance and execution state. (AC: 2, 3)
  - [x] Update sprint state so Epic `6` is formally in progress and Story `6.1` is closed.
  - [x] Update repo guidance where release-identity ownership was still pointed at the wrong story phase.

## Dev Notes

- Story `6.1` creates the minimum release identity layer only.
- Change summaries and operational status remain Story `6.2`.
- Recovery execution and rollback workflow remain Story `6.3`.
- The current local repository state has no `HEAD` commit, so the source-control record must stay honest about that condition rather than inventing a commit reference.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-04-01: Reviewed Epic `6` acceptance criteria, existing coherence reports, and the stabilized Fabric proof refresh outputs.
- 2026-04-01: Added the release-identity contract plus a machine-readable ledger materializer with `current` and `last-known-good` pointers.
- 2026-04-01: Generated the first release ledger from the current live proof refresh and captured the local git state honestly as an unborn repository head.
- 2026-04-01: Added node tests for successful release recording and fail-closed behavior when no live published refresh is available.

### Completion Notes List

- Story `6.1` now leaves behind a consistent release-ledger structure under `_bmad-output/test-artifacts/release-ledger/`.
- The release record ties together source-control state, coherence identity, proof refresh state, and manifest/boundary references for the current published proof.
- `current-release` and `last-known-good-release` are now explicit machine-readable pointers instead of implied state.
- The repo now has a stronger foundation for Story `6.2` change summaries and Story `6.3` rollback records.

### File List

- `_bmad-output/implementation-artifacts/6-1-record-release-identity-and-traceability.md`
- `platform/fabric/contracts/release-identity-contract.md`
- `platform/fabric/automation/materialize-release-identity-record.mjs`
- `tests/publication/release-identity.test.mjs`
- `_bmad-output/test-artifacts/release-ledger/release-index.json`
- `_bmad-output/test-artifacts/release-ledger/current-release.json`
- `_bmad-output/test-artifacts/release-ledger/last-known-good-release.json`
- `_bmad-output/test-artifacts/release-ledger/releases/`

### Change Log

- 2026-04-01: Created Story `6.1` implementation file and release-identity design.
- 2026-04-01: Implemented the release-ledger materializer and generated the first release record from the current published proof state.
- 2026-04-01: Marked Story `6.1` done after the ledger, contract, and local tests were in place.
