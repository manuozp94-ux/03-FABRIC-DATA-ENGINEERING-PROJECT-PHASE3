# Analytical Case Handoff

Date: 2026-04-08  
Purpose: optimized context handoff for a new conversation focused on understanding the analytical case end to end, especially:

- how new rows are generated
- how the pipeline moves from Bronze to Gold
- what calculations and business rules shape the final analytical outputs

## What To Optimize For In The Next Conversation

The next conversation should focus on the analytical case as an operating model, not as a website project.

The best framing is:

1. how the repo generates a bounded but representative operational market
2. how that approved package becomes Fabric Bronze
3. how Silver cleans, enriches, and conforms the data
4. how Gold turns that into a decision-support layer
5. how the semantic model and report sit on top of that analytical path

Do **not** spend the first part of that conversation on:

- Astro routing
- site mirroring
- public-serving extract mechanics
- release communications

Those matter later, but they add noise if the goal is to understand the analytical case itself.

## One-Sentence Summary Of The Case

This project is a bounded operational analytics case about whether current inventory posture can support expected demand without driving unnecessary inventory exposure or service instability.

## Highest-Value Files To Read In Order

### 1. Business and case framing

- `apps/public-site/src/data/copy/case-study.ts`
- `docs/public-site/project-map.md`

Use these to answer:

- What business problem is being modeled?
- What operating tension is the case trying to make visible?
- What is the primary decision the analytical layer supports?

### 2. Current pipeline truth

- `docs/automation/current-data-pipeline-description.md`

Use this to answer:

- What runs in the repo?
- What runs in Fabric?
- What is the current medallion flow?
- Which tables exist today?

### 3. Row-generation governance

- `platform/fabric/contracts/fact-build-rules.md`
- `platform/fabric/contracts/logic-first-scenario-parameter-sets.md`
- `platform/fabric/contracts/representative-entity-expansion-design.md`

Use these to answer:

- What scenario is being simulated?
- Which parts are deterministic vs bounded variation?
- What rules govern growth, seasonality, shock behavior, and replenishment?
- How are entity populations expanded without exploding into nonsense?

### 4. Generation implementation

- `platform/fabric/automation/dimension-build-lib.mjs`
- `platform/fabric/automation/materialize-generation-controls.mjs`
- `platform/fabric/automation/representative-market-lib.mjs`
- `platform/fabric/validation/validate-representative-coherence.mjs`

Use these to answer:

- How do seed facts become a larger representative market?
- How are new entities and relationships created?
- How do demand, inbound, and snapshot facts get emitted?
- Which invariants are enforced before promotion?

### 5. Fabric execution and transformation path

- `05-compat/scripts/land_fab001_lakehouse_tables.py`
- `05-compat/scripts/fab001_lakehouse_loader_notebook.py`
- `05-compat/contracts/fab001_semantic_model_contract.json`
- `05-compat/scripts/materialize_fab001_semantic_model.py`
- `05-compat/scripts/materialize_fab001_report_shell.py`

Use these to answer:

- How does the approved package become Bronze?
- What exactly gets cleaned and enriched in Silver?
- What gets aggregated in Gold?
- Which tables and measures feed the report?

## Current Tooling Truth

The active path does **not** rely on `dbt`, `DuckDB`, or `T-SQL` in the core analytical flow.

The actual stack is:

- `Node.js / JavaScript (.mjs)` for repo-side generation, rule materialization, validation, and promotion
- `Python` for orchestration, OneLake upload, and Fabric API-driven item/materialization tasks
- `PySpark` inside the Fabric Lakehouse loader notebook for Bronze, Silver, and Gold
- `Delta Lakehouse tables` for persisted Fabric tables
- `DAX + semantic model` for analytical consumption in the Power BI / Fabric layer

## Analytical Model: The Minimum Mental Picture

The operating loop is:

- demand consumes available inventory
- inbound receipts replenish inventory
- the system snapshots resulting product-location posture daily
- the analytical layer summarizes whether readiness, coverage, and exposure still make sense

The three main fact families are:

- `fact_demand_line`
- `fact_inventory_inbound`
- `fact_inventory_snapshot`

The main public-supporting dimensions are:

- `dim_product`
- `dim_product_family`
- `dim_account`
- `dim_inventory_location`

## Part 1: How New Rows Are Generated

This is the part that matters most if the next conversation is about synthetic analytical realism and logic-first growth.

### A. Seed package

The seed package is small and bounded.

It provides:

- the original masked dimensions
- the original masked facts
- the archetypes from which the representative market grows

Key source:

- `platform/fabric/automation/dimension-build-lib.mjs`

### B. Generation controls

The next layer creates rule tables that govern how the synthetic market grows.

Those rules cover:

- account-pattern growth
- seasonality
- shocks
- inventory policy
- economics and target margin bands

Key source:

- `platform/fabric/automation/materialize-generation-controls.mjs`
- `platform/fabric/contracts/logic-first-scenario-parameter-sets.md`

### C. Representative entity expansion

The project does **not** expand blindly.

It first grows the populations of:

- accounts
- products
- inventory locations

Then it creates bounded maps for:

- account-product eligibility
- product-location stocking

That means the logic does **not** assume:

- every account buys every product
- every product stocks everywhere

Key source:

- `platform/fabric/contracts/representative-entity-expansion-design.md`
- `platform/fabric/automation/representative-market-lib.mjs`

Important target cardinalities:

- `dim_account`: about `96`
- `dim_product`: about `140`
- `dim_inventory_location`: about `16`

### D. Deterministic IDs and bounded variation

New entities and facts are generated with stable keys and seeded variation.

Important idea:

- the same rule version and the same window should reproduce the same market

This is a major part of the credibility story.

### E. Daily generation window

The representative market uses this bounded active date window:

- `2025-10-01` to `2026-04-01`

The code enumerates each date and then emits:

- due inbound rows for that day
- due demand rows for that day
- one snapshot row per active product-location state for that day

Key source:

- `platform/fabric/automation/representative-market-lib.mjs`

### F. Demand generation logic

Demand is not random. It is derived from:

1. account-product eligibility
2. account-pattern cadence
3. product-family quantity band
4. seasonality factor
5. account-pattern multiplier

Core helper path:

- `buildDemandSchedule`
- `deriveDemandQty`

Key rules:

- cadence depends on `account_pattern_class`
- base quantity range depends on `product_family_code`
- seasonality depends on date and pattern class
- pattern factor shifts volume by account behavior

Core quantity formula:

- `baseQty = minQty + stableIndex(identityKey, span)`
- `demandQty = round(baseQty * seasonalityFactor * patternFactor)`

### G. Inbound generation logic

Inbound is also schedule-driven, not random.

It is derived from:

- product-location stocking relationships
- receipt cadence by product family
- deterministic offsets
- receipt quantity by family
- receipt flow type by family and node type

Core helper path:

- `buildInboundSchedule`

Important interpretation:

- inbound represents approved replenishment events
- not a full procurement or purchase-order lifecycle

### H. Inventory snapshot generation logic

Inventory snapshots come from a stateful daily loop, not from disconnected balances.

The state is initialized per product-location pair with:

- opening on-hand quantity
- reserved quantity
- future in-transit quantity when applicable

Then, each day:

1. due inbound updates state
2. demand is served from the primary service location
3. open pressure affects reservation logic
4. the system computes available quantity
5. inventory status and readiness are derived
6. one snapshot row is emitted

That means `fact_inventory_snapshot` is the result of the operating loop, not just a static table.

## Part 2: Key Generation-Time Formulas

### Demand line

- `served_qty = min(demand_qty, available_qty)`
- `open_qty = max(demand_qty - served_qty, 0)`
- `demand_status_code` depends on served vs open
- `demand_value_proxy = round(unit_value * demand_qty)`
- `gross_margin_proxy = round(demand_value_proxy * margin_rate)`

### Inbound

- `receipt_value_proxy = round(receipt_qty * unit_value)`

### Inventory

- `available_qty` depends on node type, on-hand, reserved, and future pending qty
- `inventory_status_code` depends on node type and available posture
- `readiness_flag` is a bounded operational interpretation
- `inventory_value_proxy = round(on_hand_qty * family_unit_value)`

These are not finance-grade values.
They are comparative operational proxies unless you are explicitly working on the bounded financial layer.

## Part 3: What Bronze Actually Means Here

Bronze is not “dirty raw ERP dumps.”

It is better described as:

- bounded
- raw-like
- approved
- public-safe

The upload script intentionally introduces some raw-like variation into display and code values before the files land in OneLake.

Examples:

- display labels may vary in case and spacing
- code values may vary in dashes, underscores, and capitalization

Why that matters:

- Silver then has a real cleanup job to do
- Bronze is not pretending to already be fully conformed

Key source:

- `05-compat/scripts/land_fab001_lakehouse_tables.py`

## Part 4: Bronze To Silver

Silver is the first real analytical cleanup and enrichment layer inside Fabric.

Tool:

- `PySpark`

Key source:

- `05-compat/scripts/fab001_lakehouse_loader_notebook.py`

### A. Bronze load

The notebook reads CSV files from OneLake using explicit schemas and writes them as Delta tables.

### B. Cleaning functions

Important helper functions:

- `collapse_whitespace`
- `normalize_display_label`
- `normalize_code_value`
- `title_case_code_value`

These functions do things like:

- trim and collapse whitespace
- normalize underscores and hyphens
- standardize casing
- clean human-readable labels

### C. Cleaned Bronze-derived DataFrames

The notebook creates cleaned versions of:

- products
- product families
- accounts
- locations
- demand
- inbound
- inventory snapshots

### D. Context joins

Then it builds contextual joins:

- `product_context`
- `account_context`
- `location_context`

These become the basis for enriched Silver facts.

### E. Silver output tables

The notebook materializes:

- `slv_demand_line_enriched`
- `slv_inventory_inbound_enriched`
- `slv_inventory_position_enriched`
- `slv_current_inventory_position`

### F. Important Silver derivations

In demand:

- `event_month`
- `is_open`
- joined product/account attributes

In inventory position:

- `is_current_snapshot`
- `action_status`
- `target_service_level_band`
- `coverage_target_band`
- joined product/location attributes
- `network_open_demand_qty`
- `network_open_demand_value_proxy`

This is where the case becomes easier to read analytically.

## Part 5: Silver To Gold

Gold is the serving layer.

Tool:

- `PySpark`

Gold does not primarily clean.
Gold summarizes, prioritizes, and packages the case for decision support.

### A. Gold summary

Table:

- `gold_supply_chain_decision_summary`

Main metrics:

- `latest_approved_refresh_utc`
- `latest_demand_date`
- `latest_inventory_date`
- `open_demand_lines`
- `total_open_qty`
- `total_open_demand_value_proxy`
- `total_available_qty`
- `total_inventory_exposure`
- `ready_positions`
- `current_positions`
- `service_readiness_rate`
- `open_demand_coverage_ratio`
- `active_action_count`
- `latest_demand_month`
- `latest_demand_month_share`

These are built from aggregates over:

- cleaned demand
- current inventory position

### B. Gold action queue

Table:

- `gold_supply_chain_action_queue`

Logic:

- start from `slv_current_inventory_position`
- derive `action_priority`
- sort by:
  - action priority
  - descending inventory value proxy
- keep the top `8`

This is the shortest path from current posture to a recommended next move.

### C. Gold demand support by account pattern

Table:

- `gold_demand_support_account_pattern`

Logic:

- filter open demand only
- group by `account_pattern_class` and `customer_group`
- aggregate `open_qty` and `open_value`
- derive `open_value_share`

### D. Gold demand support by product family

Table:

- `gold_demand_support_product_family`

Logic:

- filter open demand only
- group by `product_family_code`
- aggregate `open_qty` and `open_value`
- derive `open_value_share`

### E. Gold policy reference

Table:

- `gold_public_policy_reference`

Purpose:

- make the decision readable through policy classes, criticality, service, and coverage expectations

## Part 6: What Feeds The Visualization

The report layer does **not** compute business logic from scratch.

It sits on top of:

- Bronze dimensions
- Silver serving tables
- Gold summary and queue tables

Key source:

- `05-compat/contracts/fab001_semantic_model_contract.json`

Important semantic-model tables:

- `dim_product`
- `dim_product_family`
- `dim_account`
- `dim_inventory_location`
- `slv_demand_line_enriched`
- `slv_current_inventory_position`
- `gold_supply_chain_decision_summary`
- `gold_supply_chain_action_queue`

Important measures include:

- `Open Demand Qty`
- `Open Demand Lines`
- `Open Demand Value Proxy`
- `Available Qty`
- `Ready Positions`
- `Current Positions`
- `Service Readiness Rate`
- `Inventory Exposure`
- `Open-Demand Coverage`
- `Active Action Count`

## Suggested Questions For The Next Conversation

Use these to drive a deeper analyst-style review:

1. Which business behaviors are deterministic, and which are bounded variation?
2. How do eligibility and stocking plans prevent unrealistic all-to-all market generation?
3. Where exactly does the inventory loop become stateful?
4. Which Silver columns are pure cleanup, and which are new interpretations?
5. Which Gold metrics are direct aggregates, and which are derived ratios?
6. What assumptions in the generator most strongly shape the final case read?
7. Which parts of the current case still depend on proxy economics rather than realized finance?

## Best Paste-Ready Prompt For The Next Conversation

```text
I want to understand this repo as an analyst studying the logic of the operational case.

Please help me review it in this order:

1. the business problem the case is trying to support
2. how new rows are generated in the representative market
3. how demand, inbound, and inventory snapshot facts are emitted
4. how Bronze is landed and why it is intentionally only raw-like
5. how Silver cleans, enriches, and conforms the data
6. how Gold summarizes the case into decision-support outputs
7. how the semantic model and report consume those outputs

Focus especially on:

- generation controls
- eligibility and stocking logic
- the daily operating loop
- formulas for demand qty, open qty, served qty, inventory status, readiness, and Gold KPIs

Treat the website mechanics as secondary. I want the analytical path first.

Use these files as the primary references:

- docs/automation/current-data-pipeline-description.md
- platform/fabric/contracts/fact-build-rules.md
- platform/fabric/contracts/logic-first-scenario-parameter-sets.md
- platform/fabric/contracts/representative-entity-expansion-design.md
- platform/fabric/automation/representative-market-lib.mjs
- 05-compat/scripts/fab001_lakehouse_loader_notebook.py
- 05-compat/contracts/fab001_semantic_model_contract.json
```

## Final Orientation

If the next conversation starts to drift into UI, site wiring, or release status too early, redirect it back to this sequence:

- scenario
- generation rules
- emitted facts
- Bronze
- Silver
- Gold
- semantic model

That is the shortest path to understanding the analytical case in full.
