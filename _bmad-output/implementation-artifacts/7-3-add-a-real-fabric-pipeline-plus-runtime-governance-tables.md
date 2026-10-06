# Story 7.3: Add a Real Fabric Pipeline plus Runtime Governance Tables

Status: done

## Story

As a product owner,
I want a real Fabric pipeline and runtime control tables added to the proof path,
so that orchestration, run status, last-known-good signals, and serving-extract status exist inside the platform rather than only in local repo artifacts.

## Acceptance Criteria

1. Given the corrected Bronze-to-Gold Fabric execution path exists, when enterprise-like orchestration is added, then a Fabric pipeline or equivalent orchestrated runtime sequence drives Bronze landing, Silver cleanup, Gold serving refresh, and status capture.
2. Bounded runtime-governance tables record release identity, pipeline and notebook run status, active release pointers, and last-known-good references inside Fabric.
3. The pipeline remains subordinate to the repo-side approval gate rather than bypassing governed package promotion.
4. The pipeline records whether a bounded public serving extract was produced.
5. The new runtime-governance layer stays bounded and public-safe rather than expanding into a full enterprise operations estate.

## Tasks / Subtasks

- [x] Rework the runtime sequence around the corrected medallion path. (AC: 1, 3, 4)
  - [x] Ensure the orchestrated sequence explicitly covers Bronze input, Silver cleanup, Gold serving, and serving-extract status.
  - [x] Capture whether the downstream public-serving extract was produced successfully.

- [x] Extend bounded runtime-governance tables for the new public-source model. (AC: 2, 4, 5)
  - [x] Update the runtime-governance contract and payload shape.
  - [x] Add the public-source state needed to distinguish repo-mirror versus Fabric-derived serving output.

- [x] Align the bounded operating guidance to the reopened scope. (AC: 3, 5)
  - [x] Update compatibility guidance and the Fabric runbook.
  - [x] Keep pipeline and control tables subordinate to repo-side approval.

- [x] Leave behind verification and handoff evidence. (AC: 1, 2, 4, 5)
  - [x] Add or update tests for the revised runtime payload and serving-extract status.
  - [x] Capture the handoff that the reopened Story `7.4` now depends on.

## Dev Notes

- Story `7.3` should not reopen the representative-package or release-ledger design; it should consume them.
- The goal remains a bounded enterprise-like control plane, not a full production operations estate.
- The reopened scope now assumes Bronze is raw-like input and Silver owns conformance, so runtime signals must reflect that stronger path.

### References

- `_bmad-output/planning-artifacts/epics.md`
- `05-compat/contracts/fab001_runtime_pipeline_contract.json`
- `platform/fabric/contracts/runtime-governance-contract.md`
- `05-compat/scripts/materialize_fab001_runtime_pipeline.py`
- `05-compat/scripts/fab001_runtime_governance_notebook.py`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-04-01: Created the bounded runtime-pipeline contract, governance notebook, and runtime materializer script.
- 2026-04-01: Added local preview generation plus publication tests for pipeline definition and `ctrl_*` payloads.
- 2026-04-02: Created the live Fabric items `pl_fab001_runtime_orchestration` and `nb_fab001_runtime_governance`.
- 2026-04-02: Hardened the Fabric client against transient connectivity failures and switched notebook source paths to stable OneLake `abfss://...` locations.
- 2026-04-02: Confirmed the pipeline notebook activity still fails without default Lakehouse context, then completed the bounded runtime path through an explicit direct-notebook fallback plus governance-table materialization.
- 2026-04-02: Extended the runtime contract and preview pipeline report so the orchestrated sequence explicitly records Bronze input, Silver cleanup, Gold serving, and serving-extract status.
- 2026-04-02: Added `public_source_mode` and `serving_extract_status` to governance payloads and preview artifacts, including a bounded `public_serving_extract` asset row.
- 2026-04-02: Regenerated the checked-in runtime-governance preview artifacts and revalidated the full publication suite.

### Reopened Scope Notes

- The existing pipeline item, governance notebook, and `ctrl_*` tables remain valid delivered evidence.
- This story is reopened because runtime orchestration now needs to describe the stronger Bronze raw-like -> Silver conformance -> Gold serving path.
- The next pass must also record whether the downstream Fabric serving extract was produced.

### File List

- `_bmad-output/implementation-artifacts/7-3-add-a-real-fabric-pipeline-plus-runtime-governance-tables.md`
- `05-compat/contracts/fab001_runtime_pipeline_contract.json`
- `platform/fabric/contracts/runtime-governance-contract.md`
- `05-compat/scripts/common_fabric.py`
- `05-compat/scripts/materialize_fab001_runtime_pipeline.py`
- `05-compat/scripts/fab001_runtime_governance_notebook.py`
- `05-compat/scripts/fab001_lakehouse_loader_notebook.py`
- `05-compat/README.md`
- `05-compat/contracts/fab001_fabric_build_runbook.md`
- `tests/publication/fabric-runtime-governance.test.mjs`
- `_bmad-output/test-artifacts/fabric-proof/fab001/runtime-governance/pipeline-definition.json`
- `_bmad-output/test-artifacts/fabric-proof/fab001/runtime-governance/runtime-pipeline-report.json`
- `_bmad-output/test-artifacts/fabric-proof/fab001/runtime-governance/current/ctrl_release_registry.csv`
- `_bmad-output/test-artifacts/fabric-proof/fab001/runtime-governance/current/ctrl_asset_refresh_history.csv`

### Change Log

- 2026-04-02: Marked Story `7.3` done after the runtime report and governance report were written and the four `ctrl_*` tables became visible in the live Lakehouse.
- 2026-04-02: Reopened Story `7.3` so runtime orchestration tracks the corrected Bronze, Silver, Gold, and future public-serving path.
- 2026-04-02: Re-closed Story `7.3` after extending runtime governance with public-source mode, serving-extract status, refreshed preview artifacts, and a full green validation pass.
