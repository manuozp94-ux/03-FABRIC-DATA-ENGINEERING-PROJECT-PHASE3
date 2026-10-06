# Phase 0 Source Family Register

## Purpose

This register is the working inventory for Phase 0. It translates the sweep specification into a usable evidence matrix for source-family review, overlap analysis, and canonical-source selection.

## Source Family Inventory

| Source Family | Current Role | Candidate Status | Expected Grain | Date Coverage | Key Risks | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Product Information | Core MVP source | Leading candidate | Product / SKU | To be confirmed | Attribute drift across versions | Primary source for `dim_product` and inputs to `dim_product_family` |
| Customer Demand | Core MVP source | Leading candidate | Demand line item | At least through 2024 | Potential overlap with Open Orders | Canonical demand-source candidate for MVP |
| Stock Overview | Core MVP source | Leading candidate | Inventory snapshot by site and storage location | At least through 2024 | Naming drift across locations and logistics areas | Canonical operational inventory-readiness source candidate |
| Account Assignments | Core MVP source | Leading candidate | Account-to-service assignment | To be confirmed | Temporal mismatch vs. demand/inventory extracts | Provides fulfillment and service-network context |
| Open Orders | Related evidence | Deferred / derived-view candidate | Likely open order line or open order subset | To be confirmed | Subset ambiguity vs. Customer Demand | Treat as derived view unless materially different role is proven |
| Inventory Balance Summary | Related evidence | Deferred extension | Inventory quantity/value summary | To be confirmed | More valuation-oriented than operational | Better candidate for later finance-facing extension |
| Inventory Valuation | Related evidence | Deferred extension | Inventory value / material valuation | To be confirmed | Could pull MVP into finance scope too early | Review later for broader portfolio economics |
| Stock Transfer Tool | Related evidence | Support-only reference | Transfer planning / movement support | Historical | Embedded logic may not align with canonical source grain | Useful for validating location taxonomy and transfer patterns |
| Target Stock Plan | Related evidence | Support-only reference | Planning support / stock targets | Historical | Logic-heavy workbook may blur source vs. analytics | Useful for validating product-family and location planning logic |
| Historical Power BI / Dashboards | Related evidence | Logic-reference source | Semantic / metric layer | Historical | Lineage not always explicit | Useful for business-rule discovery, not raw canonical sourcing |

## Canonical Source Candidate Register

| MVP Entity / Need | Primary Candidate | Backup Candidate | Current Decision | Reasoning | Open Questions |
| --- | --- | --- | --- | --- | --- |
| `dim_product` | Product Information | Historical product extracts if found later | Leading candidate | Most direct product-attribute source reviewed so far | Which product attributes are stable across years? |
| `fact_demand_line` | Customer Demand | Open Orders as derived active subset | Leading candidate | Best fit for demand-line grain and MVP business question | Does Open Orders ever carry materially different line-level meaning? |
| `fact_inventory_snapshot` | Stock Overview | Inventory Balance Summary | Leading candidate | Most operationally aligned source for readiness by location | Which snapshot-date fields are most reliable? |
| `dim_account` / service context | Account Assignments | Later derived account dimension from demand history | Leading candidate | Gives service-network and fulfillment context | How time-sensitive is assignment logic across years? |
| `dim_inventory_location` | Derived from Stock Overview | Enriched with logic from Stock Transfer Tool / Target Stock Plan | Derived entity | No trusted perfect raw master required for MVP | Which node types are enough for MVP classification? |
| `dim_product_family` | Derived from Product Information | Enriched by historical analytics logic if needed | Derived entity | Supports operational grouping without full ontology scope | Which families best balance realism and masking safety? |
| Synthetic economic proxy rules | Derived from product-family and product-attribute rules | N/A | Derived entity | Fully synthetic economic layer is safer and sufficient for MVP | Which margin bands and node adjustments are believable but simple? |

## Overlap and Subset Notes

| Relationship | Current Hypothesis | Confidence | Action |
| --- | --- | --- | --- |
| Customer Demand vs. Open Orders | Open Orders is likely an active-status subset or operational cut of the same demand family | Medium | Validate grain and status semantics during sweep |
| Stock Overview vs. Inventory Balance Summary | Stock Overview is operational readiness; Inventory Balance Summary is more valuation-oriented | Medium-High | Keep Stock Overview in MVP, defer valuation source |
| Account Assignments vs. location reference logic | Account Assignments provides service context, not a full location master | High | Derive `dim_inventory_location` elsewhere |
| Historical tools vs. source extracts | Tools likely embed business logic and naming conventions rather than canonical raw data | High | Use as validation/reference only |

## Grain and Join Risk Notes

| Area | Likely Grain | Join Risk | Current Mitigation |
| --- | --- | --- | --- |
| Demand | Demand line item | Ambiguity if open/closed status is split across files | Treat Open Orders as derived until proven otherwise |
| Inventory | Snapshot by site / storage location / product | Snapshot-date consistency and location naming drift | Preserve snapshot context and derive masked node taxonomy |
| Product | Product / SKU | Attribute drift across yearly versions | Prefer one leading candidate for MVP and document gaps |
| Account / Service | Account assignment | Temporal mismatch against demand and inventory extracts | Treat as contextual dimension, not perfect historical truth |

## Controlled Realism Candidates

| Candidate Issue | Preserve? | Why It Matters |
| --- | --- | --- |
| Version overlap across workbook families | Yes | Reflects real enterprise archive conditions |
| Naming drift in locations and logistics nodes | Yes | Supports governance and standardization story |
| Subset ambiguity between demand-related extracts | Yes | Demonstrates reconciliation and semantic discipline |
| Missing or inconsistent descriptive attributes | Maybe, bounded | Useful if it drives quality rules without becoming noise |
| Random synthetic bad data | No | Not behaviorally meaningful |

## Immediate Next Pass

1. Confirm date coverage and latest known versions for the four MVP core source families.
2. Validate `Customer Demand` versus `Open Orders` grain and business-role difference.
3. Confirm which Stock Overview fields are sufficient to derive `dim_inventory_location`.
4. Draft the first-pass data contracts for MVP modeled entities.
