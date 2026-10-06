# Dashboard View Contracts

Status: materialized bounded V1 contract
Last updated: 2026-04-14

## Purpose

This document defines the three Power BI dashboard views that should sit downstream
of the bounded operating loop.

Power BI should present governed outputs. It should not become the place where core
business rules are invented.

Gold output reference:

- `platform/fabric/contracts/operating-loop-gold-output-contract.md`

## View 1: Sales Dashboard

### Objective

Explain historical sales and consumption behavior.

### Primary Questions

- Which customers, regions, product families, and products drive realized sales?
- How is sales/consumption trending month by month?
- Which accounts consume consistently versus unevenly?

### Canonical Metrics

- realized revenue amount USD
- fulfilled quantity
- average fulfilled quantity per account
- average realized revenue per account
- realized gross margin amount USD
- realized margin rate
- demand value proxy as comparative context only

### Required Slices

- account
- public-safe service region
- customer group
- product family
- product
- month

### Primary Sources

- `fact_sales_realization`
- `fact_sales_fulfillment_line`
- `fact_demand_line`
- `dim_account`
- `dim_product`
- `dim_product_family`

## View 2: Supply Chain Decision Support

### Objective

Connect demand pressure, inventory policy, purchase decisions, supplier lead time, and
cost exposure.

### Primary Questions

- What should supply chain buy or replenish first?
- Which recommendations became purchase orders?
- Which open purchase orders are expected to relieve risk?
- What is the cost exposure of the planned replenishment?

### Canonical Metrics

- recommended purchase quantity
- approved purchase quantity
- ordered quantity
- received quantity
- open purchase quantity
- expected receipt quantity
- supplier lead-time days
- purchase cost amount USD
- readiness risk count
- coverage ratio

### Required Slices

- supplier
- product
- product family
- receiving location
- public-safe service region
- decision type
- recommendation status
- purchase-order status

### Primary Sources

- `fact_supply_chain_decision_queue_line`
- `fact_purchase_order_line`
- `fact_purchase_order_status_history`
- `fact_inventory_inbound`
- `fact_inventory_snapshot`
- `fact_cost_history`
- `dim_supplier`

## View 3: Inventory Decision Support

### Objective

Explain inventory posture by location and the logistics actions needed to support
service.

### Primary Questions

- Which locations need inventory attention first?
- What is currently available, reserved, restricted, or in transit?
- Which transfers or fulfillment actions are planned or active?
- How much cost is tied to current inventory and movement pressure?

### Canonical Metrics

- on-hand quantity
- available quantity
- reserved quantity
- in-transit quantity
- transfer-out quantity
- transfer-in quantity
- fulfillment quantity
- inventory cost amount USD
- active logistics action count
- backordered or open demand quantity

### Required Slices

- origin location
- destination location
- node type
- logistics area
- public-safe service region
- product
- product family
- action status

### Primary Sources

- `fact_logistics_decision_queue_line`
- `fact_inventory_movement_line`
- `fact_sales_fulfillment_line`
- `fact_inventory_snapshot`
- `fact_cost_history`
- `dim_inventory_location`

## Access Boundary

The first public release should use a request-access model.

Do not use anonymous `Publish to web`.

The public site may explain the dashboard and provide a request path, but the report
itself should remain governed.
