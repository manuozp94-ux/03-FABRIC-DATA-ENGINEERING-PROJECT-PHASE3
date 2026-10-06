# Operating Loop Gold Output Contract

Status: materialized bounded V1 Gold contract
Last updated: 2026-04-14

## Purpose

This contract defines the planned Gold outputs for the three dashboard views.

Gold should carry dashboard-ready business outputs. Power BI may format, filter, and
visualize them, but it should not invent the causal business rules.

## Sales Dashboard Outputs

### `gold_sales_dashboard_summary`

Grain:

- one row for the current approved release and reporting window

Purpose:

- provide headline realized-sales and consumption metrics

Minimum measures:

- realized revenue amount USD
- realized COGS amount USD
- realized gross margin amount USD
- realized margin rate
- fulfilled quantity
- open demand quantity
- latest sales month

### `gold_sales_consumption_by_account`

Grain:

- one row per account and month

Purpose:

- support average consumption and realized revenue by customer

### `gold_sales_consumption_by_region`

Grain:

- one row per public-safe service region and month

Purpose:

- support regional sales trend without publishing real geography

### `gold_sales_consumption_by_product_family`

Grain:

- one row per product family and month

Purpose:

- support product-family consumption, revenue, and margin trend

### `gold_sales_consumption_by_product`

Grain:

- one row per product and month

Purpose:

- support product-level sales analysis while preserving public-safe product names

## Supply Chain Decision Support Outputs

### `gold_supply_chain_decision_queue_summary`

Grain:

- one row per decision type, recommendation status, product family, and reporting window

Purpose:

- summarize replenishment recommendations by decision type

Minimum measures:

- recommendation count
- recommended quantity
- approved quantity
- recommended cost amount USD
- approved cost amount USD
- average supplier lead-time days

### `gold_purchase_order_summary`

Grain:

- one row per purchase-order status, supplier, product family, and reporting window

Purpose:

- show active purchase-order posture and expected relief

Minimum measures:

- order line count
- ordered quantity
- received quantity
- open purchase quantity
- purchase cost amount USD
- expected receipt quantity
- late or at-risk line count

### `gold_supply_chain_risk_by_product_location`

Grain:

- one row per product and receiving inventory location for the current approved state

Purpose:

- connect demand pressure, inventory posture, and replenishment action

## Inventory Decision Support Outputs

### `gold_inventory_location_action_summary`

Grain:

- one row per location, product family, action status, and current approved state

Purpose:

- summarize where inventory attention is needed

Minimum measures:

- on-hand quantity
- available quantity
- reserved quantity
- in-transit quantity
- inventory cost amount USD
- active logistics action count
- open demand supported quantity

### `gold_logistics_decision_queue_summary`

Grain:

- one row per logistics decision type, recommendation status, origin location, destination location, and reporting window

Purpose:

- summarize transfer and fulfillment recommendations by decision type

Minimum measures:

- recommendation count
- recommended quantity
- approved quantity
- movement cost amount USD
- average transfer lead-time days
- average service lead-time days

### `gold_inventory_movement_summary`

Grain:

- one row per movement status, origin location, destination location, product family, and reporting window

Purpose:

- show shipped, in-transit, received, and cancelled movement posture

### `gold_sales_fulfillment_summary`

Grain:

- one row per fulfillment status, service region, account pattern, product family, and reporting window

Purpose:

- show how demand became shipped, delivered, or backordered

## Boundary Rules

- Gold outputs may include bounded cost-effective V1 metrics.
- Gold outputs must not describe cost-effective V1 as raw invoice-source finance.
- Gold outputs must not expose real suppliers, real geography, or raw customer identities.
- Gold outputs should be regenerated from Silver/event-ledger logic, not hand-authored for the dashboard.
- Candidate outputs must not publish automatically.
