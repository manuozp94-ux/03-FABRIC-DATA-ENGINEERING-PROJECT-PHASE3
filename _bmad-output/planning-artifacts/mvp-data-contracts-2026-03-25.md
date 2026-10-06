# MVP Data Contracts

## Purpose

These contracts define the minimum acceptable structure for the first public MVP slice. They are not enterprise-wide canonical standards. They are bounded contracts that describe what each modeled entity must contain so the MVP can support:

- commercial demand to multi-site inventory readiness
- derived product-family analysis
- derived inventory-location analysis
- a fully synthetic economic proxy layer
- a public analytical surface that is safe to publish

The contracts below are intentionally narrow. They are designed to reduce ambiguity before implementation and to provide a stable target for Phase 0 sweep and prep work.

## Contract Principles

- Every modeled entity must be publication-safe and masked where needed.
- Every fact must have an explicit business grain.
- Every fact must carry an explicit business date or snapshot date.
- Derived dimensions are acceptable when a perfect raw master does not exist or is not required for the MVP.
- Controlled realism may remain upstream, but contract outputs should be stable enough for governed downstream use.
- The synthetic economic layer must be derived from public-safe rules, not raw commercial pricing or raw inventory cost.
- The MVP does not need exhaustive field coverage. It needs sufficient fields to tell one coherent business story well.

## Shared Conventions

### Required Metadata Fields

Unless noted otherwise, each modeled entity should carry the following metadata fields where applicable:

- `record_source_family`
- `source_file_version`
- `record_status`
- `publication_safety_flag`
- `load_timestamp_utc`

### Key Conventions

- Surrogate keys should be used for public modeled entities when raw natural keys are sensitive or unstable.
- Natural business keys may be retained internally for traceability, but should not be exposed publicly if they reveal enterprise identity.
- Derived dimensions should document their classification logic explicitly.

### Date Conventions

- Use `event_date` for demand-related business events.
- Use `snapshot_date` for inventory state and similar point-in-time facts.
- If both extract date and business date exist, preserve the distinction.

## Contract: `dim_product`

### Purpose

Represents the masked product-level entity used to analyze demand, inventory, family membership, and synthetic economic behavior.

### Grain

One row per masked product entity in MVP scope.

### Required Fields

- `product_sk`
- `masked_product_code`
- `masked_product_name`
- `product_family_code`
- `forecasting_category`
- `product_category`
- `planning_model`
- `weight_value`
- `box_qty`
- `pallet_qty`
- `record_source_family`
- `source_file_version`
- `publication_safety_flag`

### Optional Fields

- `system_family`
- `material_group`
- `product_status`
- `product_size_band`
- `handling_profile`

### Source Candidate

- Primary: `Product Information`

### Quality Rules

- Every product in MVP facts must resolve to one `product_sk`.
- Every product must map to one `product_family_code` or an explicit `UNCLASSIFIED` fallback.
- Masked product labels must not expose original enterprise identifiers.

## Contract: `dim_product_family`

### Purpose

Represents the operational grouping used to organize demand, inventory, and synthetic economic behavior beyond individual SKU-level analysis.

### Grain

One row per derived product family.

### Required Fields

- `product_family_code`
- `product_family_name`
- `family_description`
- `storage_profile`
- `handling_profile`
- `synthetic_margin_band_code`
- `publication_safety_flag`

### Optional Fields

- `family_size_bias`
- `family_weight_bias`
- `family_complexity_band`
- `notes`

### Source Candidate

- Derived from `dim_product` attributes and historical logic patterns

### Quality Rules

- Product family assignments must be rule-based and documented.
- Family names must be publication-safe and industry-neutral enough for public use.
- Margin band assignment must be deterministic for each family.

## Contract: `dim_account`

### Purpose

Represents the masked commercial account or demand-origin context used to segment demand and interpret service-network relationships.

### Grain

One row per masked account entity in MVP scope.

### Required Fields

- `account_sk`
- `masked_account_code`
- `masked_account_name`
- `customer_group`
- `service_network_code`
- `fulfillment_context_code`
- `record_source_family`
- `source_file_version`
- `publication_safety_flag`

### Optional Fields

- `account_region_code`
- `channel_code`
- `forecast_participation_flag`
- `account_status`

### Source Candidate

- Primary: `Account Assignments`
- Secondary context may later be derived from demand history

### Quality Rules

- Each in-scope demand line should resolve to one account context or an explicit `UNKNOWN` fallback.
- Public account labels must not reveal real customer identity.
- Service-network codes must be masked or abstracted when needed.

## Contract: `dim_inventory_location`

### Purpose

Represents the derived inventory node structure used to analyze where stock is held and how location roles affect readiness.

### Grain

One row per derived inventory location or node in MVP scope.

### Required Fields

- `inventory_location_sk`
- `masked_site_code`
- `masked_location_code`
- `masked_location_name`
- `node_type_code`
- `logistics_area_code`
- `location_role_description`
- `publication_safety_flag`

### Optional Fields

- `site_group_code`
- `node_capacity_class`
- `storage_zone_class`
- `fulfillment_relevance_flag`
- `notes`

### Source Candidate

- Primary derivation from `Stock Overview`
- Optional enrichment from `Stock Transfer Tool` and `Target Stock Plan`

### Quality Rules

- Every inventory fact row must resolve to one `inventory_location_sk`.
- Node types must come from a limited controlled vocabulary.
- Masked location fields must not expose real warehouse, 3PL, or internal naming.

### Controlled Vocabulary Starter

Recommended starter values for `node_type_code`:

- `INTERNAL_WAREHOUSE`
- `THIRD_PARTY_NODE`
- `TRANSIT_NODE`
- `FLOOR_AREA`
- `RESTRICTED_AREA`
- `OVERFLOW_AREA`
- `UNKNOWN`

## Contract: `fact_demand_line`

### Purpose

Represents the line-level demand fact used to measure commercial demand against available inventory readiness.

### Grain

One row per masked demand line item.

### Required Fields

- `demand_line_sk`
- `product_sk`
- `account_sk`
- `event_date`
- `requested_delivery_date`
- `demand_status_code`
- `demand_qty`
- `delivered_qty`
- `open_qty`
- `record_source_family`
- `source_file_version`
- `publication_safety_flag`

### Optional Fields

- `order_group_code`
- `promise_date`
- `priority_code`
- `demand_value_proxy`
- `gross_margin_proxy`

### Source Candidate

- Primary: `Customer Demand`
- `Open Orders` may later become a derived active-status view

### Quality Rules

- Grain must remain line-level for the MVP.
- `open_qty` should be derivable or directly validated from demand and delivered quantities.
- Demand status logic must be documented if multiple source states are collapsed.
- Every fact row must resolve to one product and one account.

## Contract: `fact_inventory_snapshot`

### Purpose

Represents the inventory state by product and location at a point in time for readiness analysis.

### Grain

One row per product-location snapshot.

### Required Fields

- `inventory_snapshot_sk`
- `product_sk`
- `inventory_location_sk`
- `snapshot_date`
- `on_hand_qty`
- `available_qty`
- `inventory_status_code`
- `record_source_family`
- `source_file_version`
- `publication_safety_flag`

### Optional Fields

- `reserved_qty`
- `in_transit_qty`
- `inventory_value_proxy`
- `node_value_concentration_band`
- `readiness_flag`

### Source Candidate

- Primary: `Stock Overview`
- Inventory valuation-oriented sources are deferred for later extension

### Quality Rules

- Snapshot grain must remain explicit.
- Every fact row must resolve to one product and one inventory location.
- Snapshot-date logic must be preserved clearly enough to compare periods later if needed.
- Inventory status codes should be mapped to a controlled public-safe vocabulary.

## Contract: `fact_inventory_inbound`

### Purpose

Represents approved inbound inventory receipts by product and location so the MVP can support a simple inventory loop instead of treating snapshots as isolated states.

### Grain

One row per approved inbound receipt event at product-location grain.

### Required Fields

- `inventory_inbound_sk`
- `product_sk`
- `inventory_location_sk`
- `receipt_date`
- `receipt_qty`
- `receipt_flow_type`
- `record_source_family`
- `source_file_version`
- `publication_safety_flag`

### Optional Fields

- `receipt_value_proxy`

### Source Candidate

- Primary: bounded inbound receipt or approved inventory-entry slice
- For the current MVP, a governed source-safe receipt fixture is acceptable until richer replenishment logic is materialized

### Quality Rules

- Grain must remain one row per approved receipt event.
- Every fact row must resolve to one product and one inventory location.
- The fact represents approved receipts only; it is not a full purchase-order lifecycle.
- Receipt-flow types should be mapped to a controlled public-safe vocabulary.

## Contract: Synthetic Economic Proxy Rules

### Purpose

Provides a public-safe dollars-and-cents layer without using raw commercial pricing or raw inventory cost.

### Grain

Rule-based derived layer applied at product-family level, with bounded node-type adjustments where needed.

### Required Rule Outputs

- `synthetic_unit_cost`
- `synthetic_margin_band_code`
- `node_type_margin_adjustment`
- `synthetic_standard_price`
- `inventory_value_proxy`
- `demand_value_proxy`
- `gross_margin_proxy`

### Inputs Allowed

- derived product family
- product weight or size proxies
- box and pallet quantity indicators
- handling profile
- node type

### Inputs Not Allowed in MVP

- raw price lists
- raw inventory valuation files
- customer-specific discounts
- rebates or SPA logic
- realized invoice pricing
- exact realized margin

### Quality Rules

- Economic outputs must be clearly labeled as proxy metrics.
- Margin bands must be deterministic by rule, not ad hoc per product.
- Node-type adjustments must be bounded and documented.
- No public economic field should claim to represent actual company financials.

## Minimum Join Expectations

- `fact_demand_line.product_sk` -> `dim_product.product_sk`
- `fact_demand_line.account_sk` -> `dim_account.account_sk`
- `fact_inventory_snapshot.product_sk` -> `dim_product.product_sk`
- `fact_inventory_snapshot.inventory_location_sk` -> `dim_inventory_location.inventory_location_sk`
- `fact_inventory_inbound.product_sk` -> `dim_product.product_sk`
- `fact_inventory_inbound.inventory_location_sk` -> `dim_inventory_location.inventory_location_sk`
- `dim_product.product_family_code` -> `dim_product_family.product_family_code`

## Contract Completion Criteria

These contracts are ready enough for the next step when:

- each entity has a stable grain definition
- minimum required fields are accepted
- leading source candidates are identified
- masking expectations are explicit
- quality rules are clear enough to guide transformation and validation

At that point, the next sidecar can be a field-mapping worksheet or first-pass transformation design.
