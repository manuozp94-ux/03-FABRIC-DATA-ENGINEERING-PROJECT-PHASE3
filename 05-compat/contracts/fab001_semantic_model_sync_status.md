# FAB001 Semantic Model Sync Status

Status: live partial patch after operating-loop expansion
Last updated: 2026-04-15T02:02:22Z

## Summary

The Lakehouse is current, but the live semantic model still needs a table-sync pass
before the full three-view Power BI report can be authored from the live model.

This is an honest boundary, not a data-generation gap.

## Current Fabric Lakehouse State

Live Lakehouse:

- `lh_fab001_public_proof`
- Lakehouse item id: `06b073a8-8653-4691-829b-0690e06a9de4`
- table count: `43`
- latest loader notebook run status: `Completed`
- latest loader notebook run window: `2026-04-15T01:39:54Z` to `2026-04-15T01:43:18Z`

Current table-family counts:

- Bronze input tables: `18`
- Silver tables: `4`
- Gold tables: `12`
- Financial foundation tables: `5`
- Runtime governance tables: `4`

## Current Semantic Model State

Live semantic model:

- `sm_fab001_supply_chain_decision`
- semantic model item id: `5ee1b0dd-daca-4c76-8316-06369d420278`
- contract table count: `32`
- live table definition parts currently fetched/patched: `8`
- requested measures: `40`
- patched measures: `15`
- skipped measures: `25`

The live patch succeeded for measures attached to tables that already exist in the
semantic model.

Patched table parts:

- `dim_account`
- `dim_inventory_location`
- `dim_product`
- `dim_product_family`
- `gold_supply_chain_action_queue`
- `gold_supply_chain_decision_summary`
- `slv_current_inventory_position`
- `slv_demand_line_enriched`

Measure-blocking missing table parts:

- `fact_sales_realization`
- `fact_sales_fulfillment_line`
- `fact_supply_chain_decision_queue_line`
- `fact_purchase_order_line`
- `fact_logistics_decision_queue_line`
- `fact_inventory_movement_line`

## Interpretation

The Lakehouse already has the operating-loop data needed for the three dashboard
views. The semantic model does not yet expose all of those tables as TMDL table
parts, so automation cannot safely attach measures to the missing tables.

The next Power BI/Fabric step is:

1. Sync or add the missing Lakehouse tables into `sm_fab001_supply_chain_decision`.
2. Re-run `python3 05-compat/scripts/materialize_fab001_semantic_model.py`.
3. Confirm `patched_measure_count` equals `40`.
4. Author the three pages from `05-compat/contracts/fab001_core_visual_contract.md`.

## Source Artifacts

- semantic contract: `05-compat/contracts/fab001_semantic_model_contract.json`
- measure pack: `05-compat/contracts/fab001_measure_pack.dax`
- report contract: `05-compat/contracts/fab001_core_visual_contract.md`
- sync report: `_bmad-output/test-artifacts/fabric-proof/fab001/semantic-model-live/materialization-report.json`
- Lakehouse manifest: `_bmad-output/test-artifacts/fabric-proof/fab001/current/manifest.json`
