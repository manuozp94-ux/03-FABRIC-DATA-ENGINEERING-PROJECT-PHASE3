# Logic-First Scenario Anchor and Parameter Sets

Status: Active Story 5.1 baseline
Last updated: 2026-04-01

## Purpose

This document defines the masked industry scenario and the first deterministic parameter sets for logic-first synthetic growth.

It exists so Story `5.2` can generate incremental fact growth from explicit business rules instead of undocumented randomization.

## Official Masked Scenario

- Scenario name: multi-site distribution of electrical supplies for commercial installation and retrofit work
- Organization role: distributor with light kit assembly, regional stock positioning, and fulfillment coordination across multiple inventory nodes
- Core analytical question: whether inventory policy, placement, and replenishment posture stay aligned with expected demand without driving avoidable inventory exposure or fulfillment instability
- Primary operating tension:
  - sales wants availability and revenue capture
  - supply chain wants lower exposure and tighter working inventory
  - logistics wants stable replenishment, fewer rush movements, and more predictable lead time behavior

## Masking Intent

- Preserve the operating mechanics already visible in the bounded source slice.
- Avoid direct solar framing, product naming, supplier naming, or customer naming.
- Keep the business recognizable as technical distribution without making the public case traceable to the source industry.

## Explicit Non-Goals

- This scenario is not a utility, grid, or field-service dispatch model.
- It is not a detailed manufacturing-costing model.
- It is not a full APS, ERP, or optimization engine.
- It does not publish real commercial price lists, cost files, margin logic, or account identities.

## Deterministic Scenario Interpretation

### Product family interpretation

| `product_family_code` | Masked interpretation | Operational meaning |
| --- | --- | --- |
| `STANDARD_COMPONENT` | Core electrical components with recurring use | Stable replenishment items expected to support ongoing baseline demand |
| `KIT_ASSEMBLY` | Pre-grouped installation kits | Demand often follows project timing and can amplify short-term readiness pressure |
| `SMALL_PART` | Small connectors, accessories, fasteners, and minor pack items | High-volume lines with low unit exposure and strong readiness expectations |
| `BULKY_ITEM` | Voluminous materials or packaged items with handling friction | Lower storage density, more transport pressure, and less evenly distributed stock |
| `CONTROLLED_ITEM` | Items with tighter handling, documentation, or supply constraints | Higher replenishment friction and slower recovery under supply stress |
| `UNCLASSIFIED` | Safe fallback family | Neutral fallback until a deterministic classification is available |

### Account pattern interpretation

| `account_pattern_class` | Masked interpretation | Operational meaning |
| --- | --- | --- |
| `RECURRING_SERVICE` | Replenishment-oriented service and maintenance accounts | Smoother repeat demand and lower tolerance for stockouts on everyday items |
| `PROJECT_BASED` | Installation and retrofit project accounts | Demand arrives in phases, with ramps, pauses, and sudden drops |
| `PARTNER_CHANNEL` | Channel, branch, or intermediary resale demand | Aggregated demand with moderate volatility and quarter-end pushes |
| `UNKNOWN` | Safe fallback segment | Kept stable and conservative until more behavior is inferred |

## Initial Parameter Sets

### Product family economics

The exact value chosen inside each band should be seeded and repeatable by family, entity, and time bucket.

| `product_family_code` | Unit-cost drift cadence | Unit-cost drift step band | Price-review cadence | Price-step band | Target margin band |
| --- | --- | --- | --- | --- | --- |
| `STANDARD_COMPONENT` | Monthly | `+0.5%` to `+0.9%` | Every 6 months | `+2.5%` to `+4.0%` | `28%` to `32%` |
| `KIT_ASSEMBLY` | Monthly | `+0.6%` to `+1.0%` | Every 6 months | `+3.0%` to `+4.5%` | `29%` to `33%` |
| `SMALL_PART` | Monthly | `+0.4%` to `+0.8%` | Every 6 months | `+2.0%` to `+3.5%` | `32%` to `37%` |
| `BULKY_ITEM` | Monthly | `+0.7%` to `+1.2%` | Every 3 months | `+3.5%` to `+5.5%` | `24%` to `29%` |
| `CONTROLLED_ITEM` | Monthly | `+0.8%` to `+1.3%` | Every 3 months | `+3.0%` to `+5.0%` | `26%` to `31%` |
| `UNCLASSIFIED` | Monthly | `+0.5%` to `+1.0%` | Every 6 months | `+2.5%` to `+4.0%` | `26%` to `31%` |

### Account-pattern growth

| `account_pattern_class` | Baseline QoQ growth band | Volatility class | Seasonality profile | Step behavior | Shock sensitivity |
| --- | --- | --- | --- | --- | --- |
| `RECURRING_SERVICE` | `+2.0%` to `+4.0%` | Low | `JANUARY_DIP_SPRING_RECOVERY` | Smooth drift | Low |
| `PROJECT_BASED` | `+1.0%` to `+3.0%` baseline | High | `INSTALLATION_SEASON_LIFT` | Stepwise ramps and pauses | High |
| `PARTNER_CHANNEL` | `+2.0%` to `+4.5%` | Medium | `QUARTER_END_PUSH` | Aggregated waves | Medium |
| `UNKNOWN` | `0.0%` to `+2.0%` | Medium | `FLAT_BASELINE` | Mostly flat | Low |

### Seasonality profiles

| `seasonality_profile_code` | Monthly / quarterly effect |
| --- | --- |
| `FLAT_BASELINE` | Hold monthly demand close to baseline with only minor seeded variation around `0.98x` to `1.02x` |
| `JANUARY_DIP_SPRING_RECOVERY` | January softens to roughly `0.90x` to `0.95x`, February recovers toward `0.96x` to `1.00x`, and March through May lift toward `1.03x` to `1.08x` |
| `INSTALLATION_SEASON_LIFT` | Q2 and Q3 trend above baseline at roughly `1.05x` to `1.12x`; Q1 starts softer and Q4 normalizes toward baseline |
| `QUARTER_END_PUSH` | Final month of each quarter lifts toward `1.05x` to `1.10x`, while other months stay close to baseline |

### Bounded shock profiles

| `shock_profile_code` | Primary effect | Magnitude band | Typical duration | Recovery behavior | Most likely targets |
| --- | --- | --- | --- | --- | --- |
| `PROJECT_RAMP_UP` | Demand acceleration | `+20%` to `+45%` against local baseline | 1 to 2 months | Settle to `+5%` to `+10%` above prior baseline across the next quarter | `PROJECT_BASED`, `KIT_ASSEMBLY`, `STANDARD_COMPONENT` |
| `TEMPORARY_DEMAND_DROP` | Demand contraction | `-15%` to `-35%` against local baseline | 1 to 2 months | Recover to `90%` to `100%` of baseline within 1 to 2 months | All patterns, most common in `PROJECT_BASED` and `PARTNER_CHANNEL` |
| `SUPPLY_TIGHTNESS` | Readiness decline and replenishment delay | `-10%` to `-25%` ready quantity pressure | 1 to 3 months | Recover gradually over 1 quarter after replenishment normalizes | `CONTROLLED_ITEM`, `BULKY_ITEM`, constrained nodes |
| `COST_SURGE_WINDOW` | Temporary margin compression before price catch-up | Additional `+0.5%` to `+1.5%` monthly cost pressure | 2 to 4 months | Margin returns toward target after next price-review step | `BULKY_ITEM`, `CONTROLLED_ITEM`, selected `STANDARD_COMPONENT` bands |

### Inventory and readiness policy guidance

| `product_family_code` | Default ready-share target | Risk tendency | Operational interpretation |
| --- | --- | --- | --- |
| `STANDARD_COMPONENT` | `70%` to `85%` | Low | Expected to remain broadly available in internal warehouse positions |
| `KIT_ASSEMBLY` | `60%` to `75%` | Medium | Readiness depends on component completeness and project timing |
| `SMALL_PART` | `75%` to `90%` | Low | High readiness expectation with less tolerance for repeated `AT_RISK` periods |
| `BULKY_ITEM` | `45%` to `65%` | Medium to high | More concentration, more transit behavior, and lower distributed stock depth are acceptable |
| `CONTROLLED_ITEM` | `50%` to `70%` | High | Longer recovery windows and higher sensitivity to supply tightness are acceptable |
| `UNCLASSIFIED` | `55%` to `70%` | Medium | Conservative middle band until better classification exists |

## Deterministic vs Bounded Variation

### Deterministic rules

- the masked industry scenario and public-safe interpretation
- the mapping from product families and account patterns to rule profiles
- the cadence of cost drift and price review
- the target margin bands by family
- the assignment of seasonality profiles by account pattern
- the eligible shock types by family and account pattern
- the recovery shape attached to each shock profile
- the readiness target bands by product family

### Bounded-variation inputs

- the exact cost or price step chosen inside an approved band
- the exact quarter-over-quarter demand growth factor chosen inside an approved band
- whether an eligible shock triggers inside a valid time window
- which eligible entities receive a shock within the configured share
- the exact monthly recovery path inside the approved recovery band

### Repeatability rule

- All bounded variation should be seeded from a stable combination of entity key, time bucket, and rule code.
- Rerunning the same approved time window with the same parameter version should reproduce the same outputs.

## Fact Influence Map

### `fact_demand_line`

- influenced by account-pattern growth
- influenced by seasonality profile
- influenced by demand-side shock profiles
- influenced by family-level price cadence and margin bands for proxy metrics

### `fact_inventory_snapshot`

- influenced by family-level readiness targets
- influenced by supply-tightness shocks
- influenced by demand pressure carried forward from recent demand behavior
- influenced by node concentration expectations for bulky and controlled items

### `fact_inventory_inbound`

- influenced by family-level replenishment posture
- influenced by supply-side shock profiles and recovery windows
- influenced by node-role constraints around transit, controlled, and overflow receipt behavior
- should remain the approved inbound side of the loop that later supports inventory carry-forward

### Proxy metrics

- `demand_value_proxy` should reflect synthetic price bands and demand quantity only
- `gross_margin_proxy` should reflect the family-level target margin band plus seeded bounded variation
- `inventory_value_proxy` should reflect synthetic unit cost plus quantity posture and node adjustment
- no rule in this document may be interpreted as a real price list, customer contract, or realized financial measure

## Story 5.2 Consumption Contract

Story `5.2` should materialize these parameter categories in a machine-consumable form before it generates new rows:

- `rule_product_family_economics`
- `rule_account_pattern_growth`
- `rule_seasonality_profile`
- `rule_shock_profile`
- `rule_inventory_policy`

Story `5.2` should then:

1. effective-date the rules by refresh window
2. apply seeded variation inside the documented bands
3. preserve stable grain, keys, and masking behavior
4. emit refreshed candidate outputs through the approved package flow only

The minimum generation-time realism and invariant checks for Story `5.2` now live in:

- `platform/fabric/contracts/controlled-realism-test-matrix.md`

## Reopened Rule Decisions For New Fact Generation

The parameter bands above are now sufficient for scenario framing, but Story `5.1` has been reopened to settle the governing rules that convert those bands into actual new fact rows.

## Closed Generation Decisions

The decision queue below is now resolved for Story `5.1`. Story `5.2` should treat these as the default operating rules unless a later approved change explicitly revises them.

### 1. Generation clock

- Rule evaluation runs at a monthly control cadence.
- Fact materialization runs daily.
- `fact_demand_line` is emitted at daily event grain.
- `fact_inventory_inbound` is emitted at daily approved-receipt grain.
- `fact_inventory_snapshot` is emitted as an end-of-day daily snapshot.
- Monthly rule state may change only at a new effective month, but daily rows may reflect weekday distribution, local eligibility, and active shock state.

### 2. `fact_demand_line` creation

- Keep the public grain as one row per account, product, and daily event occurrence.
- Generate total daily quantity first, then split into `1..N` demand lines when the account-pattern and line-split rule allow it.
- Default line counts by `account_pattern_class`:
  - `RECURRING_SERVICE`: `1` line per active day unless quantity exceeds the split threshold
  - `PROJECT_BASED`: `1..3` lines per active day based on step behavior and project ramp state
  - `PARTNER_CHANNEL`: `1..2` lines per active day, favoring quarter-end consolidation
  - `UNKNOWN`: `1` line only
- Eligible account-product combinations must come from the governed eligibility table, not from unrestricted all-to-all expansion.
- Daily demand quantity is derived in this order:
  1. prior baseline for the account-product pair
  2. monthly growth factor
  3. seasonality multiplier
  4. active demand shock effect
  5. bounded seeded daily distribution
- `delivered_qty` is constrained by releasable inventory and same-day service posture.
- `open_qty` remains `max(demand_qty - delivered_qty, 0)` with no exceptions.

### 3. `fact_inventory_inbound` creation

- Keep the public grain as one row per approved receipt event at product-location grain.
- Create inbound from replenishment logic plus approval logic, not from raw purchase-order lifecycle simulation.
- `fact_inventory_inbound` represents only approved inbound that is expected to affect inventory posture.
- Allowed MVP receipt-flow types:
  - `SUPPLIER_RECEIPT`
  - `TRANSFER_IN`
  - `KIT_COMPLETION`
  - `RETURN_TO_STOCK`
  - `UNKNOWN` only as bounded fallback
- Default receipt-flow posture:
  - `STANDARD_COMPONENT`: prefer `SUPPLIER_RECEIPT`, allow `TRANSFER_IN`
  - `KIT_ASSEMBLY`: prefer `KIT_COMPLETION`, allow `SUPPLIER_RECEIPT`
  - `SMALL_PART`: prefer `SUPPLIER_RECEIPT`
  - `BULKY_ITEM`: prefer `TRANSFER_IN` or staged `SUPPLIER_RECEIPT`
  - `CONTROLLED_ITEM`: prefer `SUPPLIER_RECEIPT` with slower availability release
- Same-day inventory relief rules:
  - `SUPPLIER_RECEIPT` to `INTERNAL_WAREHOUSE` or `FLOOR_AREA` may increase same-day `on_hand_qty`
  - `KIT_COMPLETION` may increase same-day `on_hand_qty`
  - `TRANSFER_IN` into `TRANSIT_NODE` or `THIRD_PARTY_NODE` should not become same-day available stock by default
  - receipts into `RESTRICTED_AREA` should not become same-day ready stock by default

### 4. Eligible entity combinations

- New demand rows may only be created for approved account-product pairs.
- New inbound rows may only be created for approved product-location pairs.
- `Story 5.2` must materialize constrained eligibility tables before generating rows:
  - one for account-product demand eligibility
  - one for product-location inbound eligibility
- Eligibility should be seeded from observed history first.
- Controlled extension beyond observed history is allowed only when:
  - the account pattern and product family are explicitly compatible
  - the compatible pair has an approved rule row
  - the expansion stays bounded and repeatable

### 5. Persisted state versus recomputed state

Persist between refresh windows:

- account-product recent demand baseline
- account-product active shock state and cooldown state
- product-location replenishment backlog
- product-location pending receipt queue
- prior end-of-day inventory quantities
- readiness-pressure carry-forward

Recompute each refresh window from rules:

- effective cost-drift step
- effective price-step state
- synthetic margin variation
- seasonality multiplier
- daily split pattern
- local weekday distribution

### 6. Shock triggering logic

- Maximum concurrent shocks:
  - one demand-side shock per account-product pair per month
  - one supply-side shock per product-location pair per month
- Demand shocks and supply shocks may overlap, but only across different state domains.
- A single entity may not carry two demand shocks at once or two supply shocks at once.
- Cooldown defaults:
  - `PROJECT_RAMP_UP`: 1 quarter cooldown after recovery ends
  - `TEMPORARY_DEMAND_DROP`: 1 month cooldown
  - `SUPPLY_TIGHTNESS`: 1 quarter cooldown for `CONTROLLED_ITEM`, 2 months otherwise
  - `COST_SURGE_WINDOW`: may overlap with supply shocks, but not repeat in consecutive months for the same family band

### 7. Cross-table causality

- Demand does not reduce inventory perfectly and instantly across the whole model.
- Use partial lag as the default causal relationship:
  - same-day served demand reduces same-day or next-snapshot inventory depending on node usability
  - unserved demand increases open pressure immediately
  - approved inbound may relieve `on_hand_qty` the same day only when the receipt-flow and node rules allow it
  - `available_qty` may lag `on_hand_qty` for transit, third-party, and restricted nodes
- Inventory pressure should therefore be calculated from:
  - prior snapshot state
  - releasable inbound
  - served outbound demand
  - active supply shock state
  - readiness-target correction

### 8. `fact_inventory_snapshot` generation

- Use a hybrid daily end-of-day snapshot.
- Compute the next snapshot in this order:
  1. prior snapshot state
  2. add approved inbound that is releasable to `on_hand_qty`
  3. subtract served demand or bounded outbound consumption
  4. update `reserved_qty` from remaining open demand pressure
  5. update `in_transit_qty` from pending but not yet releasable inbound
  6. derive `available_qty = max(on_hand_qty - reserved_qty, 0)`
  7. derive `inventory_status_code`
  8. derive `readiness_flag`
- Family readiness targets do not overwrite arithmetic state. They act as directional pressure on replenishment and risk interpretation.

### 9. Hard invariants

- All generated facts must preserve valid key resolution.
- No demand row may exist outside approved account-product eligibility.
- No inbound row may exist outside approved product-location eligibility.
- `demand_qty`, `delivered_qty`, `open_qty`, `receipt_qty`, `on_hand_qty`, `available_qty`, `reserved_qty`, and `in_transit_qty` must remain non-negative.
- `delivered_qty` may not exceed `demand_qty`.
- `open_qty` must always equal `max(demand_qty - delivered_qty, 0)`.
- `available_qty` may not exceed `on_hand_qty`.
- If no adjustment fact exists, daily snapshot reconciliation defaults to:
  - `ending_on_hand = prior_on_hand + releasable_inbound - served_qty`
- `IN_TRANSIT` and `RESTRICTED` node behavior must not produce same-day `READY` interpretation unless an explicit approved rule says otherwise.
- The same rule version, seed inputs, and time window must reproduce the same rows.

## Machine-Consumable Internal Tables For Story 5.2

These are internal control and state tables for generation logic. They are not part of the public publication package.

Story `5.2` should not treat table materialization alone as sufficient. Generated candidate outputs must also satisfy the controlled-realism and invariant checks documented in:

- `platform/fabric/contracts/controlled-realism-test-matrix.md`

### `rule_account_generation_profile`

- Grain: one row per approved account
- Purpose: govern growth, seasonality, daily ordering behavior, and demand-side shock eligibility
- Minimum fields:
  - `account_sk`
  - `account_pattern_class`
  - `seasonality_profile_code`
  - `baseline_qoq_growth_band_code`
  - `volatility_class`
  - `shock_sensitivity_class`
  - `order_frequency_code`
  - `line_split_behavior_code`
  - `effective_start_date`
  - `effective_end_date`
  - `rule_version`

### `rule_product_generation_profile`

- Grain: one row per approved product
- Purpose: govern economics, replenishment posture, and family-specific supply behavior
- Minimum fields:
  - `product_sk`
  - `product_family_code`
  - `unit_cost_drift_band_code`
  - `price_review_cadence_code`
  - `price_step_band_code`
  - `target_margin_band_code`
  - `replenishment_posture_code`
  - `lead_time_band`
  - `criticality_band`
  - `effective_start_date`
  - `effective_end_date`
  - `rule_version`

### `rule_account_product_eligibility`

- Grain: one row per approved account-product pair
- Purpose: prevent combinatorial explosion and encode which accounts may generate demand for which products
- Minimum fields:
  - `account_sk`
  - `product_sk`
  - `eligibility_status_code`
  - `activation_bias_code`
  - `baseline_share_band_code`
  - `effective_start_date`
  - `effective_end_date`
  - `rule_version`

### `seed_inventory_position`

- Grain: one row per approved product-location seed state
- Purpose: establish the opening inventory state for the first governed generation window
- Minimum fields:
  - `product_sk`
  - `inventory_location_sk`
  - `seed_date`
  - `opening_on_hand_qty`
  - `opening_available_qty`
  - `opening_reserved_qty`
  - `opening_in_transit_qty`
  - `opening_inventory_status_code`
  - `opening_readiness_flag`
  - `rule_version`

### `rule_inventory_inbound`

- Grain: one row per approved product-location replenishment rule
- Purpose: govern how replenishment events become approved inbound receipts
- Minimum fields:
  - `product_sk`
  - `inventory_location_sk`
  - `preferred_receipt_flow_type`
  - `allowed_same_day_relief_flag`
  - `receipt_size_band_code`
  - `replenishment_trigger_code`
  - `lead_time_offset_days`
  - `approval_lag_days`
  - `cooldown_days`
  - `effective_start_date`
  - `effective_end_date`
  - `rule_version`

### `state_entity_shock`

- Grain: one row per active entity shock instance
- Purpose: persist recovery and cooldown state across refresh windows
- Minimum fields:
  - `entity_scope_code`
  - `entity_key`
  - `shock_profile_code`
  - `shock_start_date`
  - `shock_end_date`
  - `recovery_end_date`
  - `cooldown_end_date`
  - `state_version`

### `state_pending_receipt`

- Grain: one row per planned but not yet releasable inbound event
- Purpose: carry forward inbound that has been scheduled but has not yet become usable inventory
- Minimum fields:
  - `product_sk`
  - `inventory_location_sk`
  - `planned_receipt_date`
  - `expected_release_date`
  - `receipt_flow_type`
  - `pending_qty`
  - `state_version`

### Decision queue

The original queue is retained below as traceability context, but the decisions above are now the governing answer for Story `5.1`.

1. `fact_demand_line` creation grain

- Keep one demand row per account, product, and event occurrence.
- Decide whether new rows are generated daily, weekly, or monthly and whether one bucket may emit more than one line.
- Decide whether line counts are generated first and quantities derived second, or whether total quantity is generated first and then split into rows.

2. `fact_inventory_inbound` creation grain

- Keep one inbound row per approved receipt event at product-location grain.
- Decide whether receipt generation is direct from replenishment rules or derived from planned receipts plus approval logic.
- Decide which receipt-flow types are valid for the MVP:
  - `SUPPLIER_RECEIPT`
  - `TRANSFER_IN`
  - `KIT_COMPLETION`
  - bounded fallback values only when required

3. Eligible entity combinations

- Decide whether every account can buy every product family or whether eligibility is constrained by `account_pattern_class`, `product_family_code`, and prior observed combinations.
- Prefer constrained eligibility so refreshes look like business extension rather than combinatorial explosion.

4. Baseline carry-forward behavior

- Decide which prior-window fields persist into the next window as state:
  - recent demand baseline
  - recent inbound cadence and replenishment backlog
  - active shock recovery stage
  - readiness pressure carry-forward
- Decide which fields are always recomputed from local rules:
  - synthetic price step
  - synthetic margin variation
  - local seasonality multiplier

5. Shock triggering logic

- Decide the maximum number of concurrent shocks allowed per entity and time bucket.
- Decide whether demand shocks and supply shocks may overlap or must be mutually exclusive.
- Decide whether certain account or family classes have cooldown windows after a shock ends.

6. Cross-table causality

- Decide how demand growth affects inventory pressure:
  - immediate same-window effect
  - lagged next-snapshot effect
  - mixed effect with partial carry-forward
- Prefer a lagged or partial-lag relationship so inventory pressure reads like replenishment friction instead of instant perfect response.
- Decide how inbound receipts affect inventory pressure:
  - same-day relief for approved receipts
  - next-snapshot relief only
  - mixed effect when controlled or transit nodes delay usable availability

7. Inventory snapshot generation

- Decide whether snapshots are derived from:
  - prior snapshot plus inbound and outbound net movements
  - family readiness targets plus current demand pressure
  - a hybrid of both
- Prefer the hybrid: use prior snapshot state, add approved inbound, subtract served demand, then move toward a family readiness target subject to demand and shock pressure.

8. Hard invariants

- New demand rows must preserve valid key resolution and date semantics.
- New inbound rows must preserve valid key resolution, approved receipt semantics, and non-negative receipt quantities.
- Quantity fields must remain non-negative and consistent with open-quantity derivation.
- Inventory snapshots must not generate impossible status transitions without a documented cause.
- Seeded reruns of the same rule version and window must reproduce the same rows.

## Deferred Concerns

- Power BI Desktop layout refinement
- richer visual composition
- direct semantic-model redesign
- broader industry storytelling beyond this masked scenario

These stay out of scope for Story `5.1`.

## References

- `docs/automation/logic-first-fabric-proof-workflow.md`
- `platform/fabric/contracts/fact-build-rules.md`
- `05-compat/contracts/fab001_fabric_build_runbook.md`
- `_bmad-output/implementation-artifacts/5-1-define-deterministic-business-rule-parameter-sets-for-synthetic-economics-demand-growth-and-shock-behavior.md`
