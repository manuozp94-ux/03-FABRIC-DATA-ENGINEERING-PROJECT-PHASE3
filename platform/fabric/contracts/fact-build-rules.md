# Fact Build Rules

## Purpose

This document records the publication-safe fact and proxy-metric rules used by Story 1.3 to extend the governed package beyond dimensions.

For logic-first incremental growth, the masked scenario anchor and deterministic parameter bands now live in `platform/fabric/contracts/logic-first-scenario-parameter-sets.md`.

## Date Semantics

- Rule evaluation uses a monthly control cadence while materialized facts are emitted daily.
- `fact_demand_line.event_date` is the business event date for the demand line.
- `fact_demand_line.requested_delivery_date` is the requested fulfillment date associated with the public demand-line occurrence.
- `fact_demand_line.promise_date` is optional and only appears when a bounded promise date exists in the source fixture.
- `fact_inventory_inbound.receipt_date` is the approved inbound receipt date for the public product-location occurrence.
- `fact_inventory_snapshot.snapshot_date` is the point-in-time inventory state date for the public product-location record.
- `fact_demand_line` extends from January 1, 2024 onward and adds new public sales activity in the active refresh window whenever the package is regenerated.
- `fact_inventory_inbound` represents approved receipts only. It is not a full purchase-order, ASN, or procurement-process fact.

## Demand Status Mapping

- `CANCELLED` when a bounded source status indicates cancellation.
- `FULFILLED` when `open_qty <= 0` and `demand_qty > 0`.
- `PARTIALLY_FULFILLED` when delivered quantity is positive and open quantity remains.
- `OPEN` when open quantity remains and no stronger terminal state applies.
- `UNKNOWN` as the final fallback.

## Inventory Status Mapping

- `IN_TRANSIT` when a bounded source status indicates transit behavior or the resolved node type is `TRANSIT_NODE`.
- `RESTRICTED` when a bounded source status indicates restricted behavior or the resolved node type is `RESTRICTED_AREA`.
- `READY` when available quantity is positive and no stronger transit/restricted state applies.
- `AT_RISK` when available quantity is zero and the row is not transit/restricted.
- `UNKNOWN` as the final fallback.

## Open Quantity Rule

- `open_qty` is always derived as `max(demand_qty - delivered_qty, 0)`.
- Validation must reject rows where `open_qty` no longer matches that derivation.

## Inventory Loop Rule

- The bounded operating loop is:
  - prior inventory snapshot
  - plus approved inbound receipts
  - minus served demand
  - equals next inventory posture before status interpretation
- `fact_inventory_inbound` is the approved inbound side of that loop.
- `fact_inventory_snapshot` should remain the end-of-day state, not a disconnected balance placeholder.
- If no adjustment fact exists, the default reconciliation rule is:
  - `ending_on_hand = prior_on_hand + releasable_inbound - served_qty`

## Proxy Metric Rules

- Proxy metrics are synthetic and comparative only.
- No proxy field represents a real customer price, true margin, raw inventory valuation, rebate, SPA, or realized financial output.
- Inputs allowed:
  - `product_family_code`
  - `demand_pattern_class`
  - `planning_constraint_class`
  - `weight_value`
  - `box_qty`
  - `pallet_qty`
  - `node_type_code`
  - `handling_profile`
  - bounded quantity fields already inside the governed package
- Later incremental generation may also use effective-dated parameter tables derived from the logic-first scenario anchor, as long as the resulting outputs remain synthetic, comparative, and publication-safe.

### Demand Proxies

- `demand_value_proxy` is derived from a synthetic standard price band and line quantity.
- `gross_margin_proxy` is derived from `demand_value_proxy` and the deterministic synthetic margin band associated with the resolved product family.

### Inventory Proxies

- `receipt_value_proxy` is derived from synthetic unit cost and approved inbound quantity for comparative replenishment analysis.
- `inventory_value_proxy` is derived from synthetic unit cost, available or in-transit quantity, and a bounded node-type adjustment factor.
- `node_value_concentration_band` is a coarse public-safe concentration label, not a real valuation class.
- `readiness_flag` is a bounded operational interpretation of inventory status, not a promise of service performance.

## Join Expectations

- `fact_demand_line.product_sk` resolves to `dim_product.product_sk` or a documented explicit fallback key if later needed.
- `fact_demand_line.account_sk` resolves to `dim_account.account_sk` or a documented explicit fallback key if later needed.
- `fact_inventory_snapshot.product_sk` resolves to `dim_product.product_sk` or a documented explicit fallback key if later needed.
- `fact_inventory_snapshot.inventory_location_sk` resolves to `dim_inventory_location.inventory_location_sk` or a documented explicit fallback key if later needed.
- `fact_inventory_inbound.product_sk` resolves to `dim_product.product_sk` or a documented explicit fallback key if later needed.
- `fact_inventory_inbound.inventory_location_sk` resolves to `dim_inventory_location.inventory_location_sk` or a documented explicit fallback key if later needed.

## Generation Governance References

- The canonical closed decisions for generation behavior live in:
  - `platform/fabric/contracts/logic-first-scenario-parameter-sets.md`
- Story `5.2` should materialize the internal rule and state tables defined there before it generates new governed rows.
- Story `5.2` should enforce the minimum controlled-realism and invariant checks documented in:
  - `platform/fabric/contracts/controlled-realism-test-matrix.md`
