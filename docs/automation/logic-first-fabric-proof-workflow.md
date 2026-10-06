# Logic-First Fabric Proof Workflow

Status: Active workflow
Last updated: 2026-04-15

## Purpose

This workflow explains the current order of work after the Epic `7` correction closed and the active public source moved to the bounded Fabric serving extract.

The core decision is now:

- keep repo-side governance and approval outside Fabric
- move the meaningful medallion refinement work further inside Fabric
- avoid hardening release operations until the Bronze, Silver, Gold story matches the intended case

## Why This Workflow Exists

The repo already contains:

- the bounded compatibility layer
- the live Lakehouse, semantic model, and report shell path
- notebook-first Fabric execution
- runtime governance and release reconciliation

The remaining technical gap is no longer about architecture ownership.
It is about hardening the already-corrected path and keeping the last bounded limitations explicit.

The operating-loop V1 is now materialized:

- recommendations are separated from executed events
- purchase orders, movements, and fulfillment facts exist
- Gold outputs are split into Sales, Supply Chain, and Inventory subjects

The next product gaps are semantic/report completion and stricter causal
reconciliation:

- sync the new operating-loop facts into the live semantic model
- patch the full measure pack
- author the three Power BI pages
- describe strict inventory snapshot reconciliation as a target-state gap
- capture safe dashboard screenshots and keep live Power BI request-gated

## Working Sequence

1. Keep the repo-side governance boundary stable

- safe fixtures, masking, generation controls, representative expansion, and coherence gating remain outside Fabric for now
- repo-side approval still decides what may enter the bounded Fabric proof

2. Treat repo `current` as the approved Bronze input package

- do not keep describing repo `current` as the long-term final public truth
- keep the legacy publication mirror only as fallback context, not as the active site source

3. Tighten Bronze into a bounded raw-like input

- preserve minimal controlled-realism traces
- keep the package public-safe but no longer conceptually over-clean
- avoid pretending Bronze is already the fully conformed analytical truth

4. Move the real cleanup burden into Silver

- normalization
- bounded deduplication
- date/code cleanup
- conformance and enrichment needed before serving

5. Keep Gold as serving only

- KPI-support tables
- action queues
- grouped support outputs
- future bounded public-serving extract

6. Keep runtime orchestration and release identity aligned to the stronger path

- pipeline and runtime-governance tables should describe Bronze input, Silver cleanup, Gold serving, and public-source state
- release records now describe both repo input identity and Fabric serving identity

7. Consume the serving extract in the site and communication layer

- public routes, release communications, and operational status should all point to the bounded Fabric serving extract
- keep the remaining bounded gap explicit: the extract is currently materialized from reference Gold outputs, not re-derived from a same-pass live Fabric refresh in every run

8. Complete semantic/report handoff before visual polish

- sync missing Lakehouse-backed fact tables into the semantic model
- rerun the semantic measure patch until all measures are available
- author the three Power BI pages from the report contract
- keep Power BI downstream of Gold outputs rather than using it to invent core business rules

9. Keep strict inventory reconciliation as target state for the interview-ready milestone

- keep `fact_inventory_inbound` as the receipt-side view, not the purchase-order grain
- label strict event-ledger reconciliation as target state
- do not claim full event-sourced inventory accounting in the public or interview narrative

## Operating-Loop Build Order

1. Define contracts and vocabulary. `Done`
2. Build the smallest supply-chain causal loop:
   `decision -> purchase order -> receipt -> inventory snapshot -> Supply Chain Gold output`. `Done as bounded V1`
3. Add validation for lead time, inventory conservation, cost resolution, and queue-to-execution traceability. `Next hardening`
4. Add logistics transfers and sales fulfillment. `Done as bounded V1`
5. Split the dashboard contract into:
   - `Sales Dashboard`
   - `Supply Chain Decision Support`
   - `Inventory Decision Support`
   `Done`
6. Complete semantic-model sync and report authoring. `Next`

## Logic-Stability Exit Criteria

The current logic-stability checkpoint is satisfied when:

- Bronze is described and implemented as a bounded raw-like input
- Silver clearly owns cleanup and conformance
- Gold clearly owns serving
- runtime governance can report the serving-extract state and active public-source mode
- release identity can describe both the repo input package and the Fabric serving output

## Relationship To Existing Stories

- Story `6.1` remains valid as the first release-identity layer.
- Story `7.1` remains valid as the canonical-package alignment move that eliminated the split tiny market.
- Stories `7.2`, `7.3`, and `7.4` strengthened the Fabric-first medallion meaning and are now complete.
- Story `7.5` completed the living-doc sweep that aligned the narrative to this stronger direction.
- Stories `6.2` and `6.3` are now complete and consume the corrected public-source state.

## Source References

- `docs/automation/fabric-first-medallion-vocabulary.md`
- `docs/automation/current-data-pipeline-description.md`
- `docs/automation/operating-loop-architecture.md`
- `docs/automation/dashboard-view-contracts.md`
- `05-compat/contracts/fab001_fabric_build_runbook.md`
- `05-compat/contracts/fab001_semantic_model_sync_status.md`
- `platform/fabric/contracts/runtime-governance-contract.md`
- `platform/fabric/contracts/release-identity-contract.md`
- `_bmad-output/planning-artifacts/prd-v2-operating-loop-decision-system-2026-04-15.md`
- `_bmad-output/planning-artifacts/epics-v2-operating-loop-decision-system-2026-04-15.md`
- `_bmad-output/planning-artifacts/scope-decisions-v2-2026-04-15.md`
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-04-02-fabric-public-serving-truth.md`
