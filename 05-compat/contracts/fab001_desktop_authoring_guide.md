# FAB001 Desktop Authoring Guide

Status: active three-view handoff
Last updated: 2026-04-15

## Why Desktop-first

For this proof surface, the Lakehouse and semantic layer should stay in Fabric, but
the report layout should be authored in Power BI Desktop when:

- the Service editor feels too limited for formatting and layout control
- the page needs deliberate visual hierarchy rather than quick report defaults
- the report should later be versioned as a Power BI Project

Use the Service as the hosting and governed embed surface.
Use Power BI Desktop as the report-design surface.

## Current authoring boundary

The live Lakehouse already contains the refreshed bounded operating-loop tables.
The semantic-model contract now describes the three dashboard views, but full measure
patching requires the live semantic model to sync those Lakehouse tables first.

Until that sync is complete, treat this guide as the Power BI handoff package rather
than a claim that the live report has all three pages fully authored.

## Recommended authoring path

1. Open Power BI Desktop.
2. Connect to the Fabric semantic model `sm_fab001_supply_chain_decision`.
3. Confirm these Lakehouse-backed tables are available in the model: `fact_sales_realization`, `fact_sales_fulfillment_line`, `fact_supply_chain_decision_queue_line`, `fact_purchase_order_line`, `fact_logistics_decision_queue_line`, `fact_inventory_movement_line`, and `slv_current_inventory_position`.
4. If a table is missing, add or sync it from the Lakehouse before applying the related measures.
5. Apply measures from `05-compat/contracts/fab001_measure_pack.dax`.
6. Build the three pages defined in `05-compat/contracts/fab001_core_visual_contract.md`.
7. Publish the report back to the Fabric workspace.
8. Keep dashboard access authenticated or request-gated.

## Page 1: Sales Dashboard

Purpose:

- explain historical sales, consumption, and bounded margin behavior

Primary visuals:

- `card` - `Realized Revenue`
- `card` - `Realized Gross Margin`
- `card` - `Realized Margin Rate`
- `card` - `Fulfilled Qty`
- `line_chart` - `Realized Revenue Trend`
- `clustered_bar` - `Revenue by Product Family`
- `clustered_bar` - `Revenue by Account Pattern`
- `table` - `Customer Consumption Detail`

## Page 2: Supply Chain Decision Support

Purpose:

- connect demand pressure, recommendations, purchase orders, supplier lead times, and cost exposure

Primary visuals:

- `card` - `SC Approved Qty`
- `card` - `Purchase Ordered Qty`
- `card` - `Open Purchase Qty`
- `card` - `Purchase Cost Amount`
- `card` - `Queue-to-PO Traceability Rate`
- `clustered_bar` - `Open Purchase Cost by Supplier`
- `clustered_bar` - `Approved Quantity by Product Family`
- `table` - `Purchase Order Summary`

## Page 3: Inventory Decision Support

Purpose:

- explain location inventory posture and the logistics actions needed to support service

Primary visuals:

- `card` - `Available Qty`
- `card` - `Inventory Exposure`
- `card` - `Movement In Transit Qty`
- `card` - `Active Logistics Action Count`
- `clustered_bar` - `Inventory Exposure by Location`
- `clustered_bar` - `Approved Logistics Qty by Decision Type`
- `table` - `Location Action Summary`
- `table` - `Inventory Movement Detail`

## Publication boundary

- Do not use `Publish to web`.
- Keep the report subordinate to the technical-method route.
- Do not add private-prep or candidate data to the model.
- Do not recreate measures inside Astro.
- Do not present the bounded economics as invoice-source finance.
- Do not present the operating-loop proof as an ERP, optimizer, or real-time control tower.

## Source contracts

- `05-compat/contracts/fab001_core_visual_contract.md`
- `05-compat/contracts/fab001_measure_pack.dax`
- `05-compat/contracts/fab001_semantic_model_contract.json`
- `docs/automation/dashboard-view-contracts.md`
