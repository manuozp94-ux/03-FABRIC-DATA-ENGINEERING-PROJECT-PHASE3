# Story 7.2: Refactor the Fabric Notebook into the Authoritative Bronze-Silver-Gold Execution Path

Status: done

## Story

As a technical evaluator and product owner,
I want the Fabric notebook to materialize a raw-like Bronze input, perform real Silver conformance inside Fabric, and keep Gold strictly as the serving layer,
so that the proof demonstrates a bounded but faithful Fabric medallion path rather than a repo-clean package that only gets lightly enriched.

## Acceptance Criteria

1. Given the approved repo input package is available, when the corrected Fabric-native execution path is implemented, then Bronze preserves bounded controlled-realism traces rather than being described as the final clean public truth.
2. Silver explicitly owns normalization, conformance, and cleanup work inside Fabric.
3. Gold remains the downstream serving layer rather than the place where Bronze cleanup is hidden.
4. The notebook remains schema-explicit, deterministic, and aligned to the medallion contract.
5. Local refresh orchestration verifies that the Fabric tables still match the expected bounded proof shape.

## Tasks / Subtasks

- [x] Redefine Bronze as the approved raw-like input package. (AC: 1, 4)
  - [x] Decide which controlled-realism traces remain in Bronze.
  - [x] Keep Bronze schemas explicit while allowing bounded raw-like variation.
  - [x] Update the bundle and manifest so Bronze is no longer described as the final clean public contract.

- [x] Move cleanup and conformance into Silver. (AC: 2, 4, 5)
  - [x] Refactor the notebook so Silver owns normalization, cleanup, and conformance work.
  - [x] Keep Gold limited to downstream serving outputs.
  - [x] Preserve deterministic validation and bounded proof shape checks.

- [x] Align contracts and runbooks to the reopened scope. (AC: 1, 2, 3, 4)
  - [x] Update the medallion contract to describe Bronze as raw-like input, Silver as conformance, and Gold as serving.
  - [x] Update the Fabric runbook and compatibility guidance to match the stronger Fabric-first medallion intent.

- [x] Leave behind validation and handoff evidence for the next reopened stories. (AC: 5)
  - [x] Add or update tests for bounded raw-like Bronze plus Silver cleanup expectations.
  - [x] Capture which parts of runtime orchestration and release traceability depend on the corrected Silver behavior.

## Dev Notes

- Story `7.2` still keeps representative row generation and coherence gating outside Fabric for now.
- The reopened scope changes the meaning of Bronze and Silver, not the decision to keep row generation repo-side for the moment.
- The site and release layers now aim toward a Fabric-derived serving extract, so this story must preserve that downstream direction.

### References

- `_bmad-output/planning-artifacts/epics.md`
- `05-compat/scripts/land_fab001_lakehouse_tables.py`
- `05-compat/scripts/fab001_lakehouse_loader_notebook.py`
- `05-compat/contracts/fab001_medallion_contract.json`
- `05-compat/contracts/fab001_fabric_build_runbook.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-04-01: Reviewed the current bundle-first proof path and confirmed that the notebook was still loading precomputed Silver and Gold CSVs.
- 2026-04-01: Refactored the notebook to load only Bronze CSVs and derive Silver and Gold inside Fabric with schema-explicit joins, bounded action logic, and serving aggregates.
- 2026-04-01: Refactored the local proof bundle so Bronze remains the transported payload while local Silver and Gold move into `reference/` outputs for verification only.
- 2026-04-01: Updated the medallion contract and runbook to mark Silver and Gold as notebook-derived, passed the full publication suite, and ran the live Fabric notebook path successfully with 7 uploaded Bronze files and 16 visible Lakehouse tables.
- 2026-04-02: Reworked the local Bronze bundle into a bounded raw-like transport layer with controlled realism in descriptive labels and selected operational status fields.
- 2026-04-02: Added explicit normalization helpers in the Fabric loader notebook so Silver now owns cleanup and conformance before Gold serving tables are derived.
- 2026-04-02: Regenerated the checked-in proof artifact bundle, updated the medallion test expectations, and passed the full publication suite plus Astro validation.

### Reopened Scope Notes

- The original notebook-first Silver and Gold refactor remains valid as delivered evidence.
- This story is reopened because the project no longer wants Bronze to read as the final clean public truth.
- The next pass must make Bronze intentionally raw-like within bounded public-safe limits and shift real cleanup responsibility into Silver.

### File List

- `_bmad-output/implementation-artifacts/7-2-refactor-the-fabric-notebook-into-the-authoritative-bronze-silver-gold-execution-path.md`
- `05-compat/scripts/fab001_lakehouse_loader_notebook.py`
- `05-compat/scripts/land_fab001_lakehouse_tables.py`
- `05-compat/contracts/fab001_medallion_contract.json`
- `05-compat/contracts/fab001_fabric_build_runbook.md`
- `05-compat/README.md`
- `tests/publication/fabric-medallion.test.mjs`
- `_bmad-output/test-artifacts/fabric-proof/fab001/current/manifest.json`

### Change Log

- 2026-04-01: Created Story `7.2` and implemented notebook-first Bronze-to-Gold derivation.
- 2026-04-01: Marked Story `7.2` done after local verification and the live Fabric notebook run both succeeded.
- 2026-04-02: Reopened Story `7.2` so Bronze is treated as a bounded raw-like input and Silver becomes the true conformance layer inside Fabric.
- 2026-04-02: Re-closed Story `7.2` after introducing bounded raw-like Bronze transport, explicit Silver cleanup helpers, updated verification artifacts, and a full green validation pass.
