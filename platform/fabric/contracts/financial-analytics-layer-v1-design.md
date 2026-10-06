# Financial Analytics Layer V1 Design

Status: Active next-depth design with first implementation step complete
Last updated: 2026-04-03

## Purpose

This document defines the shortest honest path from the current synthetic economic
proxy layer to a bounded financial analytics layer that is materially stronger.

It exists to answer five questions:

- why the current project is still proxy-based
- what architecture is already in place
- what source entities are still missing
- what new facts and dimensions would be required
- what could be published safely once the layer exists

## Current State

The current project now includes:

- a public-safe proxy economic layer
- an internal finance-capable foundation with effective-dated cost and price history
- a bounded fulfilled-line sales-realization layer derived from that foundation

It still does not include raw invoice-source finance or enterprise-grade commercial truth.

Current active facts:

- `platform/fabric/publication/current/fact_demand_line.json`
- `platform/fabric/publication/current/fact_inventory_inbound.json`
- `platform/fabric/publication/current/fact_inventory_snapshot.json`

Current public facts are still explicitly proxy-based:

- `demand_value_proxy`
- `gross_margin_proxy`
- `receipt_value_proxy`
- `inventory_value_proxy`

Current derivation basis:

- synthetic unit-cost bands in `platform/fabric/automation/dimension-build-lib.mjs`
- synthetic standard-price logic in `platform/fabric/automation/dimension-build-lib.mjs`
- product-family value and margin rates in `platform/fabric/automation/representative-market-lib.mjs`

Current internal financial-foundation artifacts now include:

- `dim_pricing_context`
- `dim_cost_context`
- `fact_cost_history`
- `fact_price_list_history`
- `fact_sales_realization`

This means the architecture is no longer missing its first financial layer.
What remains missing is a stronger source-evidence layer for invoice-grade finance.

## Why It Is Still Proxy

The current MVP deliberately excluded:

- raw commercial price lists
- customer-specific pricing logic
- discounts, rebates, or SPA logic
- inventory-cost source history
- realized invoice pricing
- finance-grade realized margin analysis

That boundary is explicit in:

- `_bmad-output/planning-artifacts/product-brief-FABRIC_PLATFORM_DEV_BMAD-2026-03-20.md`

So the current project can now support:

- comparative economic interpretation
- decision prioritization
- exposure reading
- bounded monthly financial trend stories
- bounded realized revenue and gross-margin reading at fulfilled-line grain

But it cannot honestly claim:

- real inventory valuation
- raw invoice-source realized revenue by operation
- raw invoice-source realized gross margin by line
- enterprise price realization by customer or channel

## Readiness Assessment

The project is not far in architecture.
It is far only in data evidence.

What is already ready:

- daily demand, inbound, and inventory facts
- effective-dated logic-first rule generation
- Bronze / Silver / Gold execution in Fabric
- release governance and publication controls
- bounded public-serving extraction

What is now present:

- a bounded-real price history fact
- a bounded-real cost history fact
- a fulfilled-line realized sales fact derived from effective-dated price and cost resolution

What is still missing:

- raw invoice-source sales realization
- optional FX and commercial terms support if multi-currency or more realistic discounts are needed
- stronger finance-oriented Silver validation if this layer moves deeper into Fabric runtime

## Design Goal

Financial Analytics Layer V1 should introduce a bounded finance-capable layer that:

- preserves the public-safe nature of the portfolio
- materially improves the realism of value and margin analysis
- supports stronger case-study storytelling
- can run inside the current Fabric-first medallion path
- separates internal finance-ready logic from public-safe publication outputs

## Design Principle

The project should distinguish three layers clearly:

1. Internal finance-capable layer
2. Operational decision layer
3. Public-safe financial publication layer

That distinction matters.
The internal layer can be more detailed than the public site.
The public layer can remain masked, aggregated, or banded without pretending to be
fake finance or exposing real commercial logic.

## Proposed New Facts

### 1. fact_price_list_history

Purpose:

- track effective-dated commercial price logic by product and market context

Recommended grain:

- one row per `product_sk + pricing_context_sk + effective_start_date`

Minimum fields:

- `price_history_sk`
- `product_sk`
- `pricing_context_sk`
- `currency_code`
- `list_price_amount`
- `price_basis_code`
- `effective_start_date`
- `effective_end_date`
- `price_review_cadence_code`
- `price_step_band_code`
- `record_status`
- `source_version`

Notes:

- `pricing_context_sk` can initially map to a bounded customer-group or channel layer
- V1 does not require customer-specific pricing if that would overcomplicate the model

### 2. fact_cost_history

Purpose:

- track effective-dated cost logic by product and optionally by supply node

Recommended grain:

- one row per `product_sk + cost_context_sk + effective_start_date`

Minimum fields:

- `cost_history_sk`
- `product_sk`
- `cost_context_sk`
- `currency_code`
- `unit_cost_amount`
- `cost_method_code`
- `effective_start_date`
- `effective_end_date`
- `unit_cost_drift_band_code`
- `record_status`
- `source_version`

Notes:

- `cost_method_code` should stay explicit:
  - `STANDARD`
  - `AVERAGE`
  - `MOVING_AVERAGE`
- V1 can start with one canonical valuation method if needed

### 3. fact_sales_realization

Purpose:

- connect demand-serving behavior to realized commercial output

Recommended grain:

- one row per fulfilled operational line or invoice line

Minimum fields:

- `sales_realization_sk`
- `demand_line_sk`
- `product_sk`
- `account_sk`
- `invoice_date`
- `fulfilled_qty`
- `unit_price_amount`
- `gross_revenue_amount`
- `discount_amount`
- `net_revenue_amount`
- `unit_cost_amount`
- `cogs_amount`
- `gross_margin_amount`
- `gross_margin_pct`
- `currency_code`
- `record_status`
- `source_version`

Notes:

- if invoice grain is too much for V1, shipment-line or fulfillment-line grain is acceptable
- what matters is that revenue and cost are realized rather than inferred from family bands
- current implementation uses fulfilled-line grain derived from public demand delivery behavior rather than raw invoice files

## Proposed Supporting Dimensions

### dim_pricing_context

Purpose:

- normalize the business context that governs price applicability

Suggested fields:

- `pricing_context_sk`
- `customer_group_code`
- `channel_code`
- `market_region_code`
- `pricing_tier_code`

### dim_cost_context

Purpose:

- normalize the cost basis context

Suggested fields:

- `cost_context_sk`
- `supply_node_class`
- `valuation_method_code`
- `procurement_profile_code`

### dim_currency

Purpose:

- support explicit currency handling even if V1 remains single-currency

Suggested fields:

- `currency_code`
- `currency_name`
- `is_functional_currency`

## Silver Responsibilities

Financial Analytics Layer V1 should push the following work into Silver inside Fabric:

- effective-date resolution for price and cost history
- joins from demand and fulfillment rows to applicable price record
- joins from inventory or fulfillment rows to applicable cost record
- discount and revenue normalization
- valuation-method normalization
- finance-quality null and overlap checks

Silver should own conformance, not the repo-side generator.

## Gold Responsibilities

Gold should publish reviewer-facing and business-facing outputs such as:

- current inventory value by product family
- current inventory value by node class
- monthly net revenue trend
- monthly gross margin trend
- price realization by customer group
- margin concentration by product family
- open demand value versus fulfilled revenue comparison

Gold should not be the place where price or cost history is invented.

## Example Core Calculations

### Inventory valuation

Recommended V1 formula:

- `inventory_value_amount = on_hand_qty * applicable_unit_cost_amount`

Where:

- `applicable_unit_cost_amount` comes from the effective `fact_cost_history` row
- not from family value bands

### Realized revenue

- `gross_revenue_amount = fulfilled_qty * unit_price_amount`
- `net_revenue_amount = gross_revenue_amount - discount_amount`

### Cost of goods sold

- `cogs_amount = fulfilled_qty * applicable_unit_cost_amount`

### Gross margin

- `gross_margin_amount = net_revenue_amount - cogs_amount`
- `gross_margin_pct = gross_margin_amount / nullif(net_revenue_amount, 0)`

### Price realization

- `price_realization_pct = net_revenue_amount / nullif(list_price_reference_amount, 0)`

This metric is optional for V1 if customer-specific pricing remains too detailed.

## Public-Safe Publication Boundary

The site should not blindly expose the internal financial layer.

Instead, the public-serving extract should publish bounded outputs such as:

- aggregated inventory value by family or node type
- aggregated monthly revenue trend
- aggregated monthly gross margin trend
- bounded price-realization bands by customer group
- unit-economics reference ranges rather than raw customer terms

The public extract may contain true calculations built from the internal layer, while
still masking the commercially sensitive details.

That is the key distinction:

- real calculation
- bounded publication

## Recommended V1 Scope

To keep the first implementation bounded, V1 should do this:

1. Add `fact_cost_history`
2. Add `fact_price_list_history`
3. Add `fact_sales_realization`
4. Resolve effective-dated price and cost in Silver
5. Publish a small Gold financial layer
6. Extend the public extract with bounded financial outputs

V1 should not yet do this:

- rebate programs
- SPA logic
- contract-specific deal ladders
- full AR or invoice lifecycle
- tax logic
- multi-entity consolidation
- accounting-grade inventory subledger replacement

## Suggested Implementation Order

### Phase 1: Internal model

- define schemas for `fact_cost_history`, `fact_price_list_history`, and `fact_sales_realization`
- define `dim_pricing_context`, `dim_cost_context`, and `dim_currency`
- materialize bounded history data from current rule logic

### Phase 2: Silver conformance

- resolve effective dates
- attach applicable price and cost rows
- calculate realized revenue, COGS, and gross margin
- add validation rules for overlap, missing history, and currency consistency

### Phase 3: Gold financial views

- `gold_financial_summary`
- `gold_monthly_financial_trend`
- `gold_price_realization_customer_group`
- `gold_inventory_value_product_family`

### Phase 4: Public-serving extension

- publish only bounded, reviewer-friendly financial outputs
- keep true detailed histories out of the public site

## Acceptance Criteria For This Layer

Financial Analytics Layer V1 is ready when:

- inventory value no longer depends on `inventory_value_proxy`
- revenue no longer depends on `demand_value_proxy`
- gross margin no longer depends on `gross_margin_proxy`
- effective price and cost resolution is explicit and testable
- the public site can explain the financial layer without pretending it is accounting-grade ERP truth

Current implementation status:

- effective price and cost resolution is now explicit and testable
- fulfilled-line realized revenue, COGS, and gross margin are now materialized
- inventory valuation and some public aggregate storytelling still retain proxy elements
- the layer is still bounded and rule-derived rather than invoice-source

## Honest Positioning

Once V1 exists, the right claim would be:

- the project includes a bounded financial analytics layer with effective-dated price and cost logic and realized line-level revenue/cost calculations

The wrong claim would still be:

- the project reproduces a full enterprise finance stack

This layer should deepen the case study, not overstate it.
