# Story 1.6: Lock the Publication Contract and Verification Baseline

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a product owner,
I want the publication manifest, sync contract, validation-command flow, and test-tool baseline defined before the proof lane expands,
so that later technical evidence and release stories build on one consistent governed contract.

## Acceptance Criteria

1. Given the Astro starter foundation exists, when the governed publication boundary is prepared for implementation, then the publication manifest schema and required fields are documented and versioned.
2. The sync contract documents the approved source location, destination location, allowed artifact types, and promotion trigger so the handoff does not rely on ad hoc copying.
3. The validation-command flow for local, preview, and CI execution is documented.
4. The minimum test-tool baseline for public-site checks and publication-package verification is selected and recorded.

## Tasks / Subtasks

- [x] Lock the publication manifest contract for the governed publication lane. (AC: 1)
  - [x] Add a versioned publication-manifest schema with the required top-level fields, artifact entries, validation baseline references, and test-tool baseline references.
  - [x] Keep the manifest contract explicit about approved current versus candidate publication lanes.

- [x] Confirm the sync contract is the canonical boundary handoff reference. (AC: 2)
  - [x] Preserve `current-package-sync-contract.md` as the source/destination and allowlist contract.
  - [x] Link the validation and manifest baseline docs back to that sync contract.

- [x] Document the governed validation-command flow. (AC: 3)
  - [x] Record the command sequence for local work.
  - [x] Record the command sequence for preview verification.
  - [x] Record the minimum CI-ready command order without introducing promotion behavior.

- [x] Record the minimum verification baseline. (AC: 4)
  - [x] Select the publication-package verification tools for Phase 1.
  - [x] Select the public-site verification tools for Phase 1.
  - [x] Record explicit non-selections so later stories do not assume browser or visual-regression tooling is already required.

## Dev Notes

- Story 1.4 already locked the sync boundary and Story 1.5 already locked candidate blocking behavior. Story 1.6 should consolidate those seams into one stable contract baseline rather than introducing new publication mechanics.
- The architecture explicitly called out four early watchpoints: manifest contract, sync contract, validation command contract, and test-tool selection. This story closes those gaps as documented baseline, not as release automation.
- Keep this story documentation-first and governance-first. Release archives, promotion workflows, and rollback evidence remain later Epic 6 work.

### Project Structure Notes

- `platform/fabric/contracts/` remains the home for governed publication contracts.
- `docs/automation/` remains the home for operational command flow and testing baseline guidance.
- `package.json` remains the source for the currently supported local entrypoints.

### Technical Requirements

- The manifest schema must be versioned and JSON-based.
- Validation flow must cover local, preview, and CI execution order.
- The recorded test baseline must be honest about current repo capability and explicit about deferred tooling.
- The documented baseline must remain compatible with the current candidate/current/public-mirror separation.

### Architecture Compliance

- Respect the three-zone boundary already established in Stories 1.4 and 1.5.
- Do not add promotion automation or release archives in this story.
- Keep all new baseline artifacts text-diffable and lightweight.

### Library / Framework Requirements

- Publication-package verification baseline: Node.js built-in test runner plus governed validation scripts.
- Public-site verification baseline: Astro build and Astro check.
- No new testing dependency should be introduced by this story.

### Testing Requirements

- Validate existing publication-package tests still pass.
- Validate the governed validation script still passes.
- Validate approved sync still works.
- Validate Astro build and Astro check still pass against the approved mirrored data.

### Previous Story Intelligence

- Story 1.4 established the approved sync contract and boundary discipline.
- Story 1.5 established structured candidate diagnostics and fail-closed blocked reports, including build-failure reporting.
- Story 1.6 should reuse those contracts and make the broader baseline explicit for future epics.

### Git / Repo Intelligence

- Finishing this story closes the early Epic 1 implementation watchpoints called out in the architecture.
- Once 1.6 is done, Epic 1 can move to `done` and Epic 2 becomes the natural next delivery lane.

### References

- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/prd.md`
- `platform/fabric/contracts/current-package-sync-contract.md`
- `platform/fabric/contracts/candidate-validation-contract.md`
- `docs/automation/publication-cadence-policy.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created and implemented after Story 1.5 was closed as done.
- Added a versioned publication-manifest schema to lock the top-level governed publication contract.
- Added a publication validation flow document covering local, preview, and CI-ready command order.
- Added a verification baseline document locking the Phase 1 test-tool choices and explicit non-selections.
- Verified the documented local baseline end to end with publication-package tests, governed validation, approved sync, Astro build, and Astro check.

### Completion Notes List

- The repo now has an explicit versioned publication manifest schema at `platform/fabric/contracts/publication-manifest.schema.json`.
- The validation-command flow is now documented for local, preview, and CI-ready execution in `docs/automation/publication-validation-flow.md`.
- The minimum verification baseline is now recorded in `docs/automation/verification-baseline.md`.
- Story 1.6 intentionally reuses the existing sync contract and candidate validation contract rather than fragmenting the publication boundary further.
- The local baseline was re-verified with:
  - `corepack pnpm run test:fabric-dimensions`
  - `corepack pnpm run validate:fabric-dimensions`
  - `corepack pnpm run sync:public-site-publication`
  - `corepack pnpm run build:public-site`
  - `corepack pnpm run check:public-site`

### File List

- `_bmad-output/implementation-artifacts/1-6-lock-the-publication-contract-and-verification-baseline.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `docs/automation/publication-validation-flow.md`
- `docs/automation/verification-baseline.md`
- `platform/fabric/contracts/publication-manifest.schema.json`

### Change Log

- 2026-03-29: Created and completed Story 1.6, locking the publication manifest schema, validation-command flow, and minimum verification baseline.
