# Story 1.5: Block Unsafe Publication Candidates with Diagnostics

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a product owner,
I want fail-closed validation and investigation outputs before publication,
so that unsafe or incoherent analytical packages never reach the public surface.

## Acceptance Criteria

1. Given a candidate publication package, when publication-safety and contract validation run, then masking, required fields, grain, key stability, compatibility, and coherence checks execute before promotion.
2. Any failed check blocks the candidate from becoming the active public package.
3. Diagnostic outputs record the failed rule identifier, affected artifact, and blocking reason needed for investigation.
4. The last approved package remains the active baseline when validation fails.

## Tasks / Subtasks

- [x] Define the candidate-validation and blocking outputs for the governed publication flow. (AC: 1, 2, 3, 4)
  - [x] Document the required candidate validation report shape, including rule identifier, artifact, severity, blocking status, and investigation message.
  - [x] Record where candidate diagnostics live and which outputs are safe to retain under `_bmad-output/test-artifacts/fabric-candidate/`.

- [x] Extend the candidate-refresh flow to emit explicit diagnostics before any promotion decision. (AC: 1, 2, 3)
  - [x] Run publication-safety and contract validation against candidate outputs through one governed entrypoint.
  - [x] Write machine-readable diagnostics for success and failure cases without implying that candidate output is approved.
  - [x] Keep candidate/current terminology and approval semantics consistent with Story 1.4 sync-boundary rules.

- [x] Block unsafe candidates from affecting the approved current package or public-site mirror. (AC: 2, 4)
  - [x] Ensure failed candidate validation leaves `platform/fabric/publication/current/` unchanged.
  - [x] Ensure failed candidate validation leaves `apps/public-site/src/data/publication/current/` unchanged.
  - [x] Make the blocking behavior explicit in the diagnostic output and operator-facing console/report messaging.

- [x] Add investigation-friendly diagnostics for publication failures. (AC: 3)
  - [x] Include failed rule identifiers and affected artifacts for schema drift, missing fields, grain issues, key-stability issues, incompatible naming, or broken relationships.
  - [x] Include a compact blocking reason that is readable in logs and reusable in future release evidence.

- [x] Add focused verification for fail-closed candidate blocking. (AC: 1, 2, 3, 4)
  - [x] Verify candidate validation can pass and emit a success report without auto-promoting.
  - [x] Verify candidate validation failures emit the expected diagnostic fields.
  - [x] Verify failed candidate validation preserves the approved current package and public-site mirror unchanged.

## Dev Notes

- Story 1.4 already locked the approved source and destination boundaries for the sync entrypoint. Story 1.5 should build on that boundary discipline rather than reopening source or destination override paths.
- The publication cadence policy already says candidate refreshes never auto-promote and the last approved public package remains active on failure. This story is where that behavior becomes explicit and diagnosable.
- Keep this story focused on validation, diagnostics, and blocking behavior. Release archives, rollback execution records, and richer release identity remain later Epic 6 work.
- Diagnostic outputs must be useful for investigation, but they still need to stay publication-safe and avoid leaking private-prep details or unsafe source identifiers.

### Project Structure Notes

- Reuse the existing governed seams:
  - `platform/fabric/automation/` for candidate refresh and validation orchestration
  - `platform/fabric/validation/` for fail-closed publication checks
  - `platform/fabric/publication/current/` for the approved active package
  - `_bmad-output/test-artifacts/fabric-candidate/` for candidate outputs and diagnostics
  - `apps/public-site/src/data/publication/current/` for the approved web-consumption mirror
  - `tests/publication/` for publication-safe verification
- Do not move diagnostic logic into `apps/public-site/`; the web layer remains a consumer, not a release gate owner.

### Technical Requirements

- Validation must execute before any candidate can affect approved public state.
- Blocking behavior must be fail-closed and explicit.
- Diagnostic outputs must include:
  - rule identifier
  - affected artifact
  - blocking reason
  - candidate package status
- Preserve the approved current package and approved public-site mirror as the active baseline whenever candidate validation fails.
- Keep candidate diagnostics text-diffable and lightweight so they can later feed release evidence and operational status.

### Architecture Compliance

- Respect the three-zone boundary:
  - `platform/fabric/private-prep/` remains local-only and ignored
  - `platform/fabric/` owns validation, candidate diagnostics, and promotion discipline
  - `apps/public-site/` must not receive candidate or failed artifacts
- Validation is a release gate, not a runtime fallback.
- The approved current package and the approved web mirror remain the only active public baselines until a later release story adds explicit promotion and traceability records.

### Library / Framework Requirements

- Continue using the current lightweight Node-based governed tooling.
- Reuse the existing validation library and candidate refresh flow where possible instead of creating a second validator pattern.
- Do not add public-site runtime dependencies for this story.

### Testing Requirements

- Add publication-safe failure fixtures or derived test cases that exercise:
  - schema or field failures
  - broken relationships
  - invalid artifact sets
  - blocking behavior against current and web mirror baselines
- Verify:
  - candidate success reports stay non-promoting
  - failed candidates emit readable diagnostics
  - failed candidates preserve current and web mirror state

### Previous Story Intelligence

- Story 1.2 established stable public keys and the first governed publication contracts.
- Story 1.3 added candidate refresh compatibility, bounded facts, and proxy metrics.
- Story 1.4 added the approved current-package sync boundary and then closed review findings by rejecting non-approved source packages and non-approved destination paths. Story 1.5 should treat those guards as fixed release-boundary rules.

### Git / Repo Intelligence

- The repo is still pre-first-commit on `main`, so Story 1.5 continues to harden the baseline governed publication lane before Epic 2 expands the web surface.
- Trello autosync is already active and will reflect the transition once this story moves beyond `ready-for-dev`.

### References

- `_bmad-output/planning-artifacts/epics.md` - Story 1.5 acceptance criteria and story-level NFR references.
- `_bmad-output/planning-artifacts/architecture.md` - Validation-gate, last-known-good, and release-boundary expectations.
- `_bmad-output/planning-artifacts/prd.md` - FR30, FR31, FR32, FR33 plus last-known-good and blocking requirements.
- `docs/automation/publication-cadence-policy.md` - Candidate/current separation and failure-preserves-approved-state policy.
- `platform/fabric/contracts/current-package-sync-contract.md` - Approved source/destination boundary already locked in Story 1.4.
- `_bmad-output/implementation-artifacts/1-4-support-safe-incremental-updates-and-current-package-sync.md` - Sync-boundary implementation and review fixes to preserve.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created after Story 1.4 review findings were fixed and Story 1.4 was ready to close as done.
- Context synthesized from Story 1.5 acceptance criteria, the architecture release-gate rules, the publication cadence policy, and Story 1.4 boundary-hardening learnings.
- Added structured validation diagnostics to the governed validator so candidate failures now emit `rule_id`, affected artifact, severity, blocking status, and readable messages.
- Extended the candidate refresh entrypoint to write machine-readable status and baseline-preservation metadata without implying promotion.
- Added a candidate validation contract document and focused regression tests for non-promoting success, blocked failure, and approved-baseline preservation.
- Regenerated the candidate refresh report after implementation so the repo now carries the expanded diagnostic report shape.
- Code review exposed a gap where build failures could leave a stale success report in place; patched the candidate refresh entrypoint so build failures now also write a blocked diagnostic report before exiting.

### Completion Notes List

- Candidate validation now produces structured diagnostics instead of plain string-only failures.
- Candidate refresh remains explicitly non-promoting and now records `candidate_status`, blocking counts, diagnostic details, and preserved approved baselines.
- Focused tests now verify both the success path and a blocked failure path while preserving the approved current package and the approved web mirror.
- The validator remains compatible with existing sync and validation consumers because it still returns a string error list alongside the structured diagnostics.
- Candidate build failures now overwrite stale success-state reports with a blocked report, closing the final review finding for this story.

### File List

- `_bmad-output/implementation-artifacts/1-5-block-unsafe-publication-candidates-with-diagnostics.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/test-artifacts/fabric-candidate/candidate-refresh-report.json`
- `package.json`
- `platform/fabric/automation/run-candidate-refresh.mjs`
- `platform/fabric/contracts/candidate-validation-contract.md`
- `platform/fabric/validation/validate-dimensions.mjs`
- `tests/publication/candidate-refresh.test.mjs`

### Change Log

- 2026-03-29: Created Story 1.5 context and moved it to ready-for-dev.
- 2026-03-29: Implemented structured candidate diagnostics, fail-closed blocking reports, candidate regression coverage, regenerated the candidate report, and moved the story to review.
- 2026-03-29: Closed the build-failure reporting gap, expanded regression coverage, reran verification, regenerated the candidate report, and marked the story done.
