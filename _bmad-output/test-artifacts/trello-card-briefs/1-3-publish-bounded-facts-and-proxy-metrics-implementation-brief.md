# Implementation Brief: Story 1.3: Publish Bounded Facts and Proxy Metrics

## What This Story Is
Governed fact tables and synthetic proxy metrics generated from the approved source slice so that the analytical case can show demand and inventory-readiness behavior without using unsafe commercial data.

## Current Delivery State
- Story state: Done
- Overall project progress: 34/34 stories done

## Explicit Project Detail
- Story purpose: Governed fact tables and synthetic proxy metrics generated from the approved source slice so that the analytical case can show demand and inventory-readiness behavior without using unsafe commercial data.
- Acceptance target: Given approved Customer Demand and Stock Overview inputs plus the governed dimensions, when the fact build runs, then `fact_demand_line` and `fact_inventory_snapshot` are produced at their contract-defined grain.
- Acceptance target: `event_date` and `snapshot_date` semantics are labeled consistently in the published schema or package documentation so reviewers can distinguish event-based versus snapshot-based analysis.
- Acceptance target: Every fact row resolves to the required dimension keys or an approved explicit fallback.
- Delivered evidence: Governed outputs now include `fact_demand_line` and `fact_inventory_snapshot` in `platform/fabric/publication/current/`.
- Delivered evidence: Fact rows resolve against the governed Story 1.2 dimensions and preserve explicit date semantics for `event_date` versus `snapshot_date`.
- Delivered evidence: Proxy metrics now exist as synthetic bounded outputs only: `demand_value_proxy`, `gross_margin_proxy`, `inventory_value_proxy`, `node_value_concentration_band`, and `readiness_flag`.
- Delivered evidence: Validation now covers fact grain, required fields, controlled vocabularies, key resolution, date semantics, and `open_qty` derivation.
