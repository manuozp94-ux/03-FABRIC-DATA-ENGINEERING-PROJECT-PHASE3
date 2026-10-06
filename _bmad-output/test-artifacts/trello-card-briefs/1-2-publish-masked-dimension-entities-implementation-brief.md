# Implementation Brief: Story 1.2: Publish Masked Dimension Entities

## What This Story Is
Masked, publication-safe dimension entities built from the bounded source slice so that the public case can describe products, accounts, and locations without exposing enterprise identity.

## Current Delivery State
- Story state: Done
- Overall project progress: 34/34 stories done

## Explicit Project Detail
- Story purpose: Masked, publication-safe dimension entities built from the bounded source slice so that the public case can describe products, accounts, and locations without exposing enterprise identity.
- Acceptance target: Given approved Product Information, Account Assignments, and Stock Overview inputs, when the dimension build runs, then `dim_product`, `dim_product_family`, `dim_account`, and `dim_inventory_location` are produced at the contract-defined grain.
- Acceptance target: Direct identifiers for products, accounts, sites, 3PLs, and internal labels are removed or abstracted while preserving meaningful business behavior.
- Acceptance target: Surrogate keys plus explicit safe fallback values such as `UNCLASSIFIED` or `UNKNOWN` are handled where required by the contracts.
- Delivered evidence: Publication-safe contract schemas now exist for `dim_product`, `dim_product_family`, `dim_account`, and `dim_inventory_location`.
- Delivered evidence: The build flow reads only the approved bounded source families from tracked safe fixtures and writes masked outputs to `platform/fabric/publication/current/`.
- Delivered evidence: Surrogate keys, `UNCLASSIFIED`/`UNKNOWN` fallbacks, deterministic product-family rules, and deterministic node-type rules are now implemented and documented.
- Delivered evidence: Product outputs now include deterministic proxy classes for demand pattern, planning constraint, inventory policy, fulfillment risk, lead time, criticality, service profile, value density, synthetic unit economics, and substitution grouping.
