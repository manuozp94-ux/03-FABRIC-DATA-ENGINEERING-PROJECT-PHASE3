# Story 1.4: Support Safe Incremental Updates and Current-Package Sync

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a product owner,
I want approved scenario-driven updates appended through the same governed package flow,
so that the public analytical case can evolve over time without semantic drift.

## Acceptance Criteria

1. Given an existing approved MVP package, when new approved rows or snapshot periods are introduced, then append or snapshot behavior preserves grain, stable keys, masking rules, and cross-table consistency.
2. Updates that introduce schema drift, incompatible masking, or broken entity relationships are rejected.
3. The current approved publication package can be synchronized to the public-site consumption area through the defined boundary.
4. Only approved publishable artifacts cross into the web-consumption copy.

## Tasks / Subtasks

- [x] Define the governed incremental-update and sync boundary for the approved publication package. (AC: 1, 2, 3, 4)
  - [x] Record the approved source package, destination mirror, artifact allowlist, and promotion trigger for syncing `platform/fabric/publication/current/` into `apps/public-site/src/data/publication/current/`.
  - [x] Keep the sync boundary generated and deterministic; no hand-authored business data should live in the web-consumption copy.

- [x] Extend the governed package flow to support safe incremental growth. (AC: 1, 2)
  - [x] Support append or snapshot-style source growth without renumbering stable public keys or breaking current facts and dimensions.
  - [x] Preserve Story 1.2 and Story 1.3 public-safe naming, classification, and controlled vocabulary rules during incremental updates.
  - [x] Keep current-package writes inside `platform/fabric/publication/current/` until validation and sync conditions are satisfied.

- [x] Add a fail-closed current-package sync entrypoint for approved publishable artifacts only. (AC: 2, 3, 4)
  - [x] Create the web-consumption mirror path at `apps/public-site/src/data/publication/current/`.
  - [x] Sync only the approved JSON artifacts from the governed current package; exclude candidate-only reports, private-prep files, logs, and any non-approved intermediates.
  - [x] Make the sync step reject incompatible schemas, unexpected files, or broken entity relationships before any web copy is updated.

- [x] Add focused verification for incremental updates and current-package sync. (AC: 1, 2, 3, 4)
  - [x] Validate that new approved rows or periods preserve grain, key stability, date semantics, and cross-table consistency.
  - [x] Validate that rejected updates leave the previously approved current package and web-consumption mirror untouched.
  - [x] Validate that only the approved artifact set appears under `apps/public-site/src/data/publication/current/`.

## Dev Notes

- Story 1.3 already established candidate refresh compatibility, public-safe facts, and a rolling public sales series from 2024 onward. Story 1.4 should build on that governed package rather than introducing a second publication pattern.
- The architecture is explicit that `platform/fabric/publication/current/` is the governed approved package and `apps/public-site/src/data/publication/current/` is a generated mirror for static site consumption.
- Candidate refreshes must remain non-promoting. Story 1.4 is about safe current-package updates and bounded sync, not auto-promotion of candidate outputs.
- Release archives, last-known-good rollback execution, and richer promotion evidence belong to later Epic 6 stories; keep this story scoped to current-package sync discipline and fail-closed update behavior.

### Project Structure Notes

- Reuse the existing governed seams:
  - `platform/fabric/automation/` for build and sync entrypoints
  - `platform/fabric/validation/` for fail-closed checks
  - `platform/fabric/publication/current/` for the approved governed package
  - `_bmad-output/test-artifacts/fabric-candidate/current/` for non-promoting candidate output
  - `tests/publication/` for publication-safe fixtures and verification
- Create and populate:
  - `apps/public-site/src/data/publication/current/` as the generated web-consumption mirror
- Do not place governed build logic inside `apps/public-site/`; the web layer remains a consumer only.

### Technical Requirements

- Support safe incremental row growth for approved bounded inputs and snapshot periods without changing existing stable public keys.
- Reject schema drift, incompatible public-safe naming, broken joins, unexpected artifact types, or incompatible file layouts before sync.
- Keep public contract field names in `snake_case`.
- Keep sync deterministic and artifact-allowlisted so the destination mirror does not accumulate unmanaged files.
- Ensure the generated web-consumption mirror is safe for future Astro route consumption and remains text-diffable in Git.

### Architecture Compliance

- Respect the three-zone boundary:
  - `platform/fabric/private-prep/` remains local-only and ignored
  - `platform/fabric/` owns generation, validation, approved current-package state, and sync discipline
  - `apps/public-site/` consumes only the approved generated mirror later
- Candidate refresh remains separate from approved sync behavior.
- This story may sync the approved current package into the web-consumption path, but it must not add route rendering, public freshness UI, or release rollback logic yet.

### Library / Framework Requirements

- Continue using the existing lightweight Node-based governed tooling under `platform/fabric/automation/` and `platform/fabric/validation/`.
- Do not introduce new public-site runtime dependencies for this story.
- Keep the web mirror JSON-first and static-friendly for later Astro consumption.

### Testing Requirements

- Add publication-safe fixtures or derived test cases that simulate approved row growth and new snapshot periods.
- Verify:
  - key stability under incremental growth
  - schema compatibility and artifact allowlisting
  - fail-closed behavior when sync inputs are invalid
  - destination mirror consistency under `apps/public-site/src/data/publication/current/`
- Keep the verification surface local-script friendly so it can later feed Story 1.5 publication gates and Story 5 release evidence.

### Previous Story Intelligence

- Story 1.2 established stable public keys, abstracted dimensions, and the first governed publication package.
- Story 1.3 added governed facts, synthetic proxy metrics, candidate refresh compatibility, public-safe field nomenclature, and a rolling 2024-forward sales history model.
- The current publication cadence policy already distinguishes nightly candidate refresh from approval-based public publication; Story 1.4 should preserve that separation while enabling safe approved sync to the web-consumption copy.

### Git / Repo Intelligence

- The repo remains pre-first-commit on `main`, so Story 1.4 still shapes the baseline governed publication flow.
- Trello autosync is already active in the repo and will mirror story-state changes once this story moves through BMAD statuses.

### References

- `_bmad-output/planning-artifacts/epics.md` - Story 1.4 acceptance criteria and NFR references.
- `_bmad-output/planning-artifacts/architecture.md` - Current-package, release, and web-consumption mirror boundaries.
- `_bmad-output/planning-artifacts/prd.md` - FR19, FR20, and FR31 plus early sync-contract expectations.
- `docs/automation/publication-cadence-policy.md` - Candidate/current separation and approval-based publication rhythm.
- `_bmad-output/implementation-artifacts/1-2-publish-masked-dimension-entities.md` - Governed dimension patterns and explicit deferment of web sync.
- `_bmad-output/implementation-artifacts/1-3-publish-bounded-facts-and-proxy-metrics.md` - Governed fact package, candidate refresh, and public-safe naming decisions to preserve.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created after Story 1.3 implementation and verification were completed.
- Context synthesized from Epic 1 Story 1.4 acceptance criteria, the architecture boundary rules, the publication cadence policy, and Story 1.2 and Story 1.3 governed publication learnings.
- Added a fail-closed sync entrypoint that validates the approved current package, allowlists artifacts, and mirrors only approved JSON outputs into `apps/public-site/src/data/publication/current/`.
- Added publication-sync tests covering successful mirror generation and failure behavior that leaves the destination untouched.
- Synced the approved current package into the public-site data mirror after validation passed.
- Code review identified two contract breaches in the sync entrypoint: non-approved source packages and non-approved destination paths were both accepted.
- Patched the sync boundary so only the approved current package can be used as the source and only the approved public-site mirror can be used as the destination unless tests explicitly opt into external temp paths.
- Added regression tests for source-boundary rejection and destination-boundary rejection, plus an explicit missing-artifact fail-closed check before sync begins.

### Completion Notes List

- The approved current package can now be mirrored into `apps/public-site/src/data/publication/current/` through a dedicated fail-closed sync command.
- The sync boundary is documented and allowlisted so candidate artifacts, reports, logs, and unmanaged files do not cross into the Astro consumption copy.
- Sync verification now covers the happy path and a fail-closed path where unexpected artifacts leave the destination mirror unchanged.
- Story 1.3 rolling public sales output remains compatible with the current-package sync flow.
- The sync command now enforces the approved source boundary and approved destination boundary directly, closing the review findings before the story is marked done.

### File List

- `_bmad-output/implementation-artifacts/1-4-support-safe-incremental-updates-and-current-package-sync.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/public-site/src/data/publication/current/dim_account.json`
- `apps/public-site/src/data/publication/current/dim_inventory_location.json`
- `apps/public-site/src/data/publication/current/dim_product.json`
- `apps/public-site/src/data/publication/current/dim_product_family.json`
- `apps/public-site/src/data/publication/current/fact_demand_line.json`
- `apps/public-site/src/data/publication/current/fact_inventory_snapshot.json`
- `package.json`
- `platform/fabric/automation/sync-current-package-to-public-site.mjs`
- `platform/fabric/contracts/current-package-sync-contract.md`
- `tests/publication/publication-sync.test.mjs`

### Change Log

- 2026-03-29: Created Story 1.4 context and moved it to ready-for-dev.
- 2026-03-29: Implemented fail-closed current-package sync, synced the approved package into the public-site data mirror, added sync contract documentation, and moved the story to review.
- 2026-03-29: Closed code-review findings by locking the sync source/destination boundaries, expanding regression coverage, rerunning publication verification, and marking the story done.
