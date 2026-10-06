# FAB001 Fabric Build Runbook

Status: active proof runbook after operating-loop expansion
Last updated: 2026-04-15

## Goal

Turn the repo-approved Bronze input package into the bounded Fabric proof surface and move the meaningful medallion work further inside Fabric:

- Public Proof Lakehouse (`lh_fab001_public_proof`)
- Three-view Decision Support Semantic Model (`sm_fab001_supply_chain_decision`)
- Three-view Decision Support Proof Report (`rpt_fab001_supply_chain_decision`)
- Pages: `Sales Dashboard`, `Supply Chain Decision Support`, and `Inventory Decision Support`

## Current state note

The current live path is valid and materially aligned to the corrected architecture.

- Story `5.5` proved that the bounded Fabric proof can be refreshed from stabilized serving logic.
- Story `6.1` proved that published releases can be traced.
- Epic `7` corrected the runtime path so the bounded proof is executed more natively inside Fabric and so the active public source now comes from a bounded Fabric-derived serving extract.
- The operating-loop expansion added bounded decision queues, purchase-order execution, logistics movement, sales fulfillment, supplier lead-time, transfer lead-time, service lead-time, and dashboard-subject Gold outputs.
- The remaining bounded gap is that the live semantic model must still sync the new Lakehouse tables before all three report pages can be patched end-to-end through automation.

## Current state

- The Lakehouse has already been created in the target workspace.
- The bounded proof bundle has already been uploaded into the Lakehouse Files area under `Files/fab001/current/`.
- The loader notebook `nb_fab001_lakehouse_loader` has already been created by API and completed the first load successfully.
- The Lakehouse currently contains 43 bounded Delta tables across Bronze, Silver, Gold, runtime governance, and financial foundation outputs after the operating-loop refresh.
- The current live refresh path now uses the repo-approved `current` package plus coherence gate rather than the original tiny seed slice.
- The original tiny slice is preserved separately under `platform/fabric/publication/seed` as the seed-archetype source for local representative expansion.
- The medallion proof artifacts are available under:
  - `_bmad-output/test-artifacts/fabric-proof/fab001/current/bronze`
  - `_bmad-output/test-artifacts/fabric-proof/fab001/current/reference/silver`
  - `_bmad-output/test-artifacts/fabric-proof/fab001/current/reference/gold`
- The representative package and promotion gate artifacts are available under:
  - `_bmad-output/test-artifacts/fabric-representative/current`
  - `_bmad-output/test-artifacts/fabric-representative/representative-market-report.json`
  - `_bmad-output/test-artifacts/fabric-representative/representative-coherence-report.json`
- The Fabric-side medallion contract is available in:
  - `05-compat/contracts/fab001_medallion_contract.json`
- The semantic-model contract is available in:
  - `05-compat/contracts/fab001_semantic_model_contract.json`
  - `05-compat/contracts/fab001_measure_pack.dax`
  - `05-compat/contracts/fab001_semantic_model_sync_status.md`
- The alias layer for human-facing explanation is available in:
  - `_bmad-output/planning-artifacts/fabric-proof-alias-map-2026-04-01.md`
- The three-view report contract is available in:
  - `05-compat/contracts/fab001_core_visual_contract.json`
  - `05-compat/contracts/fab001_core_visual_contract.md`
- The live report shell and embed path already exist for MVP proof, but the full three-view layout remains a Desktop/Service authoring step after the semantic table sync.
- Final Desktop-authored visual polish is now appropriate after the semantic model exposes the new operating-loop tables.

## Logic-first operating order

1. Define or update the masked scenario anchor and deterministic business-rule parameters for economics, demand growth, and shock behavior
2. Materialize the representative public-safe package from the seed slice and generation controls
3. Run the representative coherence gate and block promotion if it is not promotable
4. Promote the coherence-approved repo package as the approved Bronze input package during transition
5. Use Fabric-native execution to land Bronze, clean and conform in Silver, and serve from Gold inside the notebook runtime
6. Confirm the Lakehouse `lh_fab001_public_proof` still contains the refreshed proof tables and runtime-governance tables
7. Sync the semantic model with any new Lakehouse tables needed by the three dashboard views
8. Refresh the semantic model with the contract and measures if the serving logic changed
9. Keep the report shell aligned to the refreshed serving layer and three-page visual contract
10. Materialize and publish the bounded Fabric-derived serving extract as the site-facing governed source
11. Author the richer Desktop-based report layout after the logic-stability exit criteria are met

The current canonical parameter reference is:

- `platform/fabric/contracts/logic-first-scenario-parameter-sets.md`
- `platform/fabric/validation/validate-representative-coherence.mjs`
- `platform/fabric/automation/run-representative-coherence-gate.mjs`
- `_bmad-output/planning-artifacts/pre-epic-6-freeze-line-2026-04-01.md`

## Automated path now available

The checked-in scripts below now form the bounded Fabric-native runtime path:

- `python3 05-compat/scripts/land_fab001_lakehouse_tables.py --upload-bundle --create-loader-notebook --run-loader-notebook`
- `python3 05-compat/scripts/materialize_fab001_runtime_pipeline.py --create-pipeline --run-pipeline --materialize-governance`
- `corepack pnpm run materialize:public-site-state`

That command currently:

- writes the bounded raw-like Bronze input locally plus local Silver / Gold reference outputs
- uploads only Bronze seed files into OneLake under `Files/fab001/current/bronze`
- creates or updates `nb_fab001_lakehouse_loader`
- runs the notebook and writes Delta outputs directly under the Lakehouse `Tables/` area, so the path does not depend on a default attached Lakehouse context
- normalizes and conforms bounded Bronze realism inside Silver before Gold serving tables are written
- verifies the landed tables through the Lakehouse API

The runtime-pipeline command now:

- creates or updates `pl_fab001_runtime_orchestration`
- runs the pipeline against `nb_fab001_lakehouse_loader`
- queries the Fabric pipeline activity runs for the notebook execution
- falls back to a direct `RunNotebook` execution when the pipeline notebook activity does not provide default Lakehouse context
- uploads runtime-governance CSVs under `Files/fab001/current/runtime-governance/current`
- creates or updates `nb_fab001_runtime_governance`
- materializes `ctrl_release_registry`, `ctrl_last_known_good`, `ctrl_runtime_job_history`, and `ctrl_asset_refresh_history`
- records `public_source_mode` and `serving_extract_status` so the runtime can state whether the site still depends on the repo mirror or has moved to a Fabric-derived serving extract

The public-site-state command now:

- materializes the bounded Fabric public serving extract into the site repo mirror
- refreshes the runtime-governance preview artifacts against that extract
- rematerializes release identity, release communications, and the recovery snapshot in one governed pass

Epic `7` established the target shape of this flow:

- the representative approved package remains the canonical repo package during transition, but its intended meaning is the approved Bronze input package
- the tiny seed slice is preserved separately as `platform/fabric/publication/seed`
- Bronze remains the transport seed into Fabric, but should preserve bounded raw-like traces rather than reading as final public truth
- Silver and Gold are derived inside the notebook runtime rather than uploaded as precomputed bundle outputs
- Silver is the intended cleanup and conformance layer
- Gold is the intended serving layer and the current source of the bounded public extract materialization path
- a real Fabric pipeline plus runtime governance tables now orchestrate and record the refresh
- the current bounded runtime path records both the pipeline attempt and the direct notebook fallback when the pipeline notebook activity cannot attach the Lakehouse context

It should only run after:

- `_bmad-output/test-artifacts/fabric-representative/representative-coherence-report.json`
- reports `promotion_status = coherence_approved`

## Desktop-authored exit criteria

Keep richer Desktop composition deferred until all of the following are true:

- the representative package is coherence-approved
- the live Fabric proof stack has been refreshed from that stabilized package
- the semantic model and report shell are aligned to the refreshed serving layer
- remaining work is primarily visual layout, interaction polish, or presentation ergonomics rather than business-rule churn

## Recommended table-loading sequence

The CSVs below are the first loading payload only.
They are not the canonical contract.
The canonical contract remains:

- `platform/fabric/contracts/*.schema.json` for approved public rows
- `05-compat/contracts/fab001_medallion_contract.json` for the Fabric-side medallion shape
- `05-compat/contracts/fab001_semantic_model_contract.json` for the semantic layer
- `05-compat/contracts/fab001_runtime_pipeline_contract.json` plus `platform/fabric/contracts/runtime-governance-contract.md` for the runtime-orchestration layer

## Notebook-first loading

Use the notebook scaffold in:

- `05-compat/scripts/fab001_lakehouse_loader_notebook.py`

For this proof, prefer notebook-based loading with explicit schema control over
UI-first inference.

### Bronze

Load these first as landed input tables:

- `dim_product.csv`
- `dim_product_family.csv`
- `dim_account.csv`
- `dim_inventory_location.csv`
- `fact_demand_line.csv`
- `fact_inventory_inbound.csv`
- `fact_inventory_snapshot.csv`

Implemented expectation:

- these landed inputs preserve bounded raw-like traces in descriptive labels and selected operational status fields
- they are still public-safe and deterministic, but they are no longer described as the final clean analytical truth

### Silver

Current implemented path:

- `slv_demand_line_enriched.csv`
- `slv_inventory_inbound_enriched.csv`
- `slv_inventory_position_enriched.csv`
- `slv_current_inventory_position.csv`

Implemented expectation:

- derive these tables inside Fabric from Bronze seed plus notebook logic
- treat them as the primary cleanup, normalization, conformance, and analytical-enrichment layer

### Gold

Current implemented path:

- `gold_supply_chain_decision_summary.csv`
- `gold_supply_chain_action_queue.csv`
- `gold_demand_support_account_pattern.csv`
- `gold_demand_support_product_family.csv`
- `gold_public_policy_reference.csv`

Target path after Epic `7` re-closes:

- derive these tables inside Fabric from Silver outputs plus notebook logic
- keep them as the serving layer rather than the cleanup layer

## Semantic-model scope

Use the contract in `fab001_semantic_model_contract.json` as the source of truth for:

- tables
- relationships
- measures

Use `fab001_measure_pack.dax` as the canonical measure copy source.

## Three-view report scope

Use the report contract in:

- `05-compat/contracts/fab001_core_visual_contract.md`

Pages:

- `Sales Dashboard`
- `Supply Chain Decision Support`
- `Inventory Decision Support`

Desktop authoring guide:

- `05-compat/contracts/fab001_desktop_authoring_guide.md`

Current automation boundary:

- `materialize_fab001_semantic_model.py` can patch measures for tables already present in the live semantic model
- missing semantic table parts are recorded instead of overstating full live model completeness
- Power BI Desktop or Service table sync is still required before all three pages can be fully authored from the live model

## Important boundary

- Do not use `Publish to web` as the default path.
- Keep the proof subordinate to the technical-method route.
- Use only approved public-safe data from the medallion bundle.
- Prefer Power BI Desktop for report composition only after the serving logic is stable enough that manual layout work will not churn.
- Treat the legacy repo publication mirror as a retained fallback only; the active public source is the bounded Fabric-derived serving extract.
