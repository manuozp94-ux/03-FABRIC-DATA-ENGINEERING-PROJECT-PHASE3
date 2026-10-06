# Story 6.2: Publish Change Summaries and Operational Status

Status: done

## Story

As a product owner,
I want each meaningful release to include a clear change summary and status signals,
so that reviewers can understand what changed and whether the public artifact is healthy.

## Acceptance Criteria

1. Given a meaningful update is ready for publication, when the release is recorded, then a change summary or release note records what changed, why the change was made, and the associated release identifier.
2. Minimum operational status for the public artifact records the last successful refresh, validation status, and current release state.
3. Deployment or validation outputs support the recorded status without exposing unsafe diagnostic detail on the public surface.
4. The status information can be updated as part of the release record without requiring a schema change, route redesign, or edits in more than two governed publication locations.
5. Meaningful changes to public-proof scope, exposed technical evidence, publication-boundary decisions, or DP-700 proof coverage are recorded in the release summary.

## Tasks / Subtasks

- [x] Define the release-communications contract and governed output shape. (AC: 1, 2, 3, 4, 5)
  - [x] Lock the machine-readable change-summary and operational-status fields.
  - [x] Keep the public-site mirrors lightweight and generated.

- [x] Implement governed release-communications materialization. (AC: 1, 2, 3, 4, 5)
  - [x] Build a materializer that consumes the current release ledger and emits per-release and current pointers.
  - [x] Generate both machine-readable JSON and reviewer-friendly markdown.
  - [x] Mirror the current operational status and change summary into the public-site data folder.

- [x] Connect the public case-study freshness context to governed release status. (AC: 2, 3, 4)
  - [x] Replace ad hoc freshness-only interpretation with governed release status and public-source context.
  - [x] Keep the route honest about the current transitional public-source mode.

- [x] Leave behind verification and active story state. (AC: 1, 2, 3, 4, 5)
  - [x] Add tests for successful materialization and fail-closed behavior.
  - [x] Update sprint tracking and mark Story `6.2` done.

## Dev Notes

- Story `6.2` extends Story `6.1`; it does not replace the release ledger.
- The current public source remains transitional, so the change summary and operational status must say that explicitly rather than implying the Fabric serving extract already powers the site.
- This story intentionally keeps release communications in two governed publication locations only: the repo-side release-ledger outputs and the generated public-site mirrors.

### References

- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/implementation-artifacts/6-1-record-release-identity-and-traceability.md`
- `platform/fabric/contracts/release-identity-contract.md`
- `platform/fabric/contracts/release-communications-contract.md`
- `platform/fabric/automation/materialize-release-identity-record.mjs`
- `platform/fabric/automation/materialize-release-communications.mjs`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-04-02: Reviewed the Epic `6.2` acceptance criteria and confirmed the repo already had release identity but not reviewer-facing change summaries or machine-readable operational status.
- 2026-04-02: Added the release-communications contract plus a materializer that consumes the current release ledger and emits per-release summaries, current status pointers, and public-site mirrors.
- 2026-04-02: Wired the case-study freshness section to the governed operational-status mirror so release context is no longer scattered across route logic alone.
- 2026-04-02: Added node tests for successful release-communications materialization and fail-closed handling when governed public-source state is missing.

### Completion Notes List

- Story `6.2` now leaves behind governed change summaries and operational status under `_bmad-output/test-artifacts/release-ledger/`.
- The public site can consume a generated release-status mirror rather than inferring its freshness context only from publication timestamps.
- The release communications remain honest about the current transitional public-source mode and the not-yet-materialized Fabric serving extract.

### File List

- `_bmad-output/implementation-artifacts/6-2-publish-change-summaries-and-operational-status.md`
- `platform/fabric/contracts/release-communications-contract.md`
- `platform/fabric/contracts/release-identity-contract.md`
- `platform/fabric/automation/materialize-release-communications.mjs`
- `tests/publication/release-communications.test.mjs`
- `apps/public-site/src/pages/case-study.astro`
- `_bmad-output/test-artifacts/release-ledger/change-summaries/`
- `_bmad-output/test-artifacts/release-ledger/current-change-summary.json`
- `_bmad-output/test-artifacts/release-ledger/current-operational-status.json`
- `apps/public-site/src/data/release/current-change-summary.json`
- `apps/public-site/src/data/release/current-operational-status.json`

### Change Log

- 2026-04-02: Created Story `6.2` implementation file and release-communications design.
- 2026-04-02: Implemented governed change-summary and operational-status materialization with public-site mirrors.
- 2026-04-02: Marked Story `6.2` done after generated artifacts, case-study wiring, and node-based validation were in place.
