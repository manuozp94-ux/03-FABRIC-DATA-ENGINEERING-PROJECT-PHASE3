# Story 6.3: Recover Safely from a Problematic Release

Status: done

## Story

As a product owner,
I want a documented rollback path to the last approved version,
so that I can restore trust quickly after a broken or unsafe release.

## Acceptance Criteria

1. Given a public release is found to be broken, unsafe, or materially misleading, when rollback is initiated, then the last-known-good approved version can be identified and restored through a documented recovery path.
2. The recovery process preserves traceability to both the failed candidate and the restored approved version.
3. Rollback can be executed within one business day using the maintained release records.
4. The recovery process defaults to restoring a previously approved state rather than improvising an unreviewed replacement.

## Tasks / Subtasks

- [x] Define the bounded release-recovery contract. (AC: 1, 2, 3, 4)
  - [x] Lock the recoverable snapshot scope.
  - [x] Lock the minimum recovery-report fields and the default restore target.

- [x] Implement recoverable snapshot capture for approved releases. (AC: 1, 3, 4)
  - [x] Capture the repo-side publication package, the public-site publication mirror, and the release-data mirrors needed to restore the active public state.
  - [x] Update the release record so the recoverable snapshot reference becomes part of maintained release evidence.

- [x] Implement bounded recovery execution. (AC: 1, 2, 3, 4)
  - [x] Restore the last-known-good approved snapshot back into the governed publication and site mirrors.
  - [x] Re-establish current release pointers and governed release communications for the restored state.
  - [x] Write a recovery report that preserves traceability to both the failed and restored release ids.

- [x] Leave behind verification and active story state. (AC: 1, 2, 3, 4)
  - [x] Add node tests for recoverable snapshot capture, successful restore, and fail-closed behavior when no snapshot exists.
  - [x] Capture the current approved release snapshot in the live repo state.
  - [x] Mark Story `6.3` done and close Epic `6` in sprint tracking.

## Dev Notes

- This story restores the governed repo-side public state first. It does not claim to automate every downstream Fabric artifact refresh.
- The restore target defaults to the last-known-good approved release.
- The current repo only has one approved release, so the checked-in artifact evidence captures the recoverable baseline snapshot while the restore path itself is verified in automated tests against a multi-release fixture.

### References

- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/implementation-artifacts/6-1-record-release-identity-and-traceability.md`
- `_bmad-output/implementation-artifacts/6-2-publish-change-summaries-and-operational-status.md`
- `platform/fabric/contracts/release-recovery-contract.md`
- `platform/fabric/automation/materialize-release-recovery-state.mjs`
- `platform/fabric/automation/materialize-release-communications.mjs`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-04-02: Reviewed the release-ledger and discovered that a real rollback path needed recoverable snapshots, not only release pointers.
- 2026-04-02: Added the recovery contract plus a recovery-state materializer that captures recoverable snapshots and executes bounded restoration to the last-known-good approved release.
- 2026-04-02: Added automated tests that verify snapshot capture, successful restore across two synthetic approved releases, and fail-closed behavior when the restore target lacks a snapshot manifest.
- 2026-04-02: Captured the current approved release snapshot in the repo ledger so the live state now has a recoverable baseline.

### Completion Notes List

- Story `6.3` now leaves behind a bounded rollback path rooted in recoverable snapshots and explicit recovery reports.
- The release ledger now includes recoverable snapshot references in the current approved release record.
- Epic `6` now has traceability, change summaries, operational status, and a concrete rollback mechanism instead of only release pointers.

### File List

- `_bmad-output/implementation-artifacts/6-3-recover-safely-from-a-problematic-release.md`
- `platform/fabric/contracts/release-recovery-contract.md`
- `platform/fabric/automation/materialize-release-recovery-state.mjs`
- `tests/publication/release-recovery.test.mjs`
- `_bmad-output/test-artifacts/release-ledger/recoverable-snapshots/`
- `_bmad-output/test-artifacts/release-ledger/releases/rls_fab001_20260401t221500z.json`

### Change Log

- 2026-04-02: Created Story `6.3` implementation file and recovery contract.
- 2026-04-02: Implemented recoverable snapshot capture plus bounded restore-to-last-known-good execution.
- 2026-04-02: Marked Story `6.3` done after the new tests passed and the current approved release snapshot was captured.
