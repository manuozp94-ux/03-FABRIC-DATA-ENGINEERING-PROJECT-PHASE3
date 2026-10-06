# Controlled Realism Test Matrix

Status: Active guidance for Story 5.2 and Story 5.4
Last updated: 2026-04-01

## Purpose

This matrix converts the Controlled Realism Register into executable validation expectations.

It exists so Story `5.2` can enforce minimum generation-time checks and Story `5.4` can extend those checks into deeper realism review before promotion.

## How To Use This Matrix

- Story `5.2` should implement every check whose first enforcing story is `5.2`.
- Story `5.4` should keep those checks and add the rows whose first enforcing story is `5.4`.
- Story `6.1` should carry the release-traceability checks forward once promotion records are formalized.

## Gate 1: Rule And State Table Readiness

Before any new governed rows are generated, validate:

- every approved account has a matching `rule_account_generation_profile`
- every approved product has a matching `rule_product_generation_profile`
- every generated demand row resolves to an approved `rule_account_product_eligibility` pair
- every generated inbound row resolves to an approved `rule_inventory_inbound` rule and an approved product-location pair
- the first regulated generation window has opening inventory in `seed_inventory_position`
- shock and pending-receipt state can be carried forward without requiring hidden manual inputs

## Controlled Realism Coverage Matrix

| Register ID | Condition to preserve | Executable check for generated package | First enforcing story |
| --- | --- | --- | --- |
| `CR-01` | Naming drift across operational nodes | Generated facts must resolve only to canonical `inventory_location_sk` values and valid public-safe location vocabulary. No duplicate public location rows may be created from alias behavior. | `5.2` |
| `CR-02` | Late-arriving or partially releasable inbound | `fact_inventory_inbound` may increase `on_hand_qty` without forcing same-day `available_qty` or `READY` state when receipt-flow and node rules do not allow immediate release. | `5.2` |
| `CR-03` | Demand versus service lag | `open_qty` must remain visible and non-negative whenever demand is not fully served. Same-day demand may not imply perfect same-day fulfillment across all generated rows. | `5.2` |
| `CR-04` | Incomplete master-data coverage | Fallback classes such as `UNCLASSIFIED`, `UNKNOWN`, or explicit bounded fallback keys may appear only from approved vocabulary and only within bounded rates recorded by the generator. | `5.2` |
| `CR-05` | Transit and restricted inventory usability | `TRANSIT_NODE`, `THIRD_PARTY_NODE`, and `RESTRICTED_AREA` behavior must not produce same-day `READY` interpretation unless an explicit approved rule allows it. | `5.2` |
| `CR-06` | Historical version overlap and source drift | Candidate generation must fail closed when rule versions, source-prep inputs, or refresh identity are unresolved. Promotion may not proceed from ambiguous or undocumented generation state. | `5.4` |

## Core Generation Invariants

These checks are not optional realism flourishes. They are the minimum arithmetic and vocabulary gates for Story `5.2`.

- all generated facts must preserve valid key resolution
- `demand_qty`, `delivered_qty`, `open_qty`, `receipt_qty`, `on_hand_qty`, `available_qty`, `reserved_qty`, and `in_transit_qty` must remain non-negative
- `delivered_qty <= demand_qty`
- `open_qty = max(demand_qty - delivered_qty, 0)`
- `available_qty <= on_hand_qty`
- if no adjustment fact exists, `ending_on_hand = prior_on_hand + releasable_inbound - served_qty`
- the same rule version, seed inputs, and time window must reproduce the same candidate outputs

## Minimum Executable Test Families

Story `5.2` should create automated checks in these families:

1. `rule_table_completeness`
2. `eligibility_boundary_enforcement`
3. `demand_arithmetic_and_service_lag`
4. `inbound_release_lag_and_receipt_flow_behavior`
5. `snapshot_reconciliation`
6. `fallback_vocabulary_bounds`
7. `reproducibility_by_rule_version_and_window`
8. `candidate_fail_closed_on_missing_generation_inputs`

Story `5.4` should extend the suite with:

1. threshold-based realism review for quarter-over-quarter growth
2. jump and recovery plausibility checks around shocks
3. bounded fallback-rate review
4. candidate-promotion blocking on unresolved release identity

## Relationship To The Register

This matrix does not replace the Controlled Realism Register.

- The register explains why each bounded imperfection matters.
- This matrix explains how those conditions should be enforced during generation and promotion.

## References

- `_bmad-output/planning-artifacts/controlled-realism-register-2026-04-01.md`
- `platform/fabric/contracts/logic-first-scenario-parameter-sets.md`
- `platform/fabric/contracts/fact-build-rules.md`
- `_bmad-output/implementation-artifacts/5-2-generate-coherent-incremental-fact-growth-through-the-approved-package-flow.md`
