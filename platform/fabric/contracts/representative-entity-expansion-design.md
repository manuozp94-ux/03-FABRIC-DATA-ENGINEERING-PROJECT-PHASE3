# Representative Entity Expansion Design

Status: Approved design for next implementation step
Last updated: 2026-04-01

## Purpose

This document defines the next correction to Epic `5`.

The current logic-first workflow successfully proves:

- masking and abstraction
- deterministic rule governance
- incremental fact generation
- fail-closed candidate validation

But it does so on a seed population that is too small to read like a believable bounded market.

The next step is therefore not richer report work and not deeper realism scoring yet.
The next step is deterministic expansion of the masked entity population so the governed package represents a small market rather than a tiny smoke slice.

## Problem Statement

The current approved package is structurally valid but too sparse:

- `dim_account`: `4`
- `dim_product`: `5`
- `dim_inventory_location`: `7`
- `fact_demand_line`: `134`
- unique account-product pairs in `fact_demand_line`: `5`

That means the current package proves behavior across time, but not enough diversity across customers, products, and stocking relationships.

The masking layer is not the problem.
Masking preserves entity count; it does not create new entities.

The gap is that the bounded source slice was interpreted as a minimal proof slice instead of a representative masked mini-market.

## Design Goal

Create a deterministic, public-safe, representative entity layer that:

- preserves the current masked business scenario
- expands customer, product, and location populations without leaking source identity
- stays governed by explicit archetypes and seed rules
- remains reproducible for the same rule version and expansion parameters
- feeds Story `5.2` generation controls and the candidate refresh lane

## Target Cardinalities For V1

These are the initial target bands for the first representative expansion pass:

- `dim_account`: target `96`, acceptable range `80-120`
- `dim_product`: target `140`, acceptable range `120-160`
- `dim_inventory_location`: target `16`, acceptable range `12-20`
- active account-product eligibility pairs: target `640`, acceptable range `450-900`
- daily inventory-bearing product-location pairs: target `120-220`

These numbers are large enough to feel market-like in exploration and reporting, while still small enough to stay auditable inside the bounded MVP.

## Expansion Principle

The current approved package should be treated as an archetype seed set, not as the final public market population.

The expansion must therefore:

1. start from the approved masked entities
2. derive additional masked entities from seed archetypes
3. preserve public-safe vocabularies and scenario logic
4. regenerate eligibility and stocking coverage deterministically
5. rerun controlled fact generation on top of the expanded population

## What Gets Expanded

### Accounts

Accounts should expand from the existing masked account seeds by `account_pattern_class`.

The expansion should preserve:

- `RECURRING_SERVICE`
- `PROJECT_BASED`
- `PARTNER_CHANNEL`
- bounded `UNKNOWN`

Target shape:

- `RECURRING_SERVICE`: `35%` to `45%`
- `PROJECT_BASED`: `25%` to `35%`
- `PARTNER_CHANNEL`: `20%` to `30%`
- `UNKNOWN`: max `5%`

Each derived account should carry:

- stable masked key and code
- parent archetype reference
- pattern class
- growth profile reference
- seasonality profile reference
- service criticality band
- eligibility-density band

### Products

Products should expand from the current masked product seeds by `product_family_code`.

The expansion should preserve all currently allowed families:

- `STANDARD_COMPONENT`
- `KIT_ASSEMBLY`
- `SMALL_PART`
- `BULKY_ITEM`
- `CONTROLLED_ITEM`
- bounded `UNCLASSIFIED`

Target shape:

- `STANDARD_COMPONENT`: `25%` to `35%`
- `SMALL_PART`: `20%` to `30%`
- `KIT_ASSEMBLY`: `15%` to `25%`
- `BULKY_ITEM`: `10%` to `20%`
- `CONTROLLED_ITEM`: `10%` to `18%`
- `UNCLASSIFIED`: max `6%`

Each derived product should carry:

- stable masked key and code
- parent archetype reference
- family code
- economic profile reference
- replenishment posture reference
- stocking breadth band
- fallback flag when applicable

### Inventory Locations

Locations should expand from current masked node archetypes, not from raw site identities.

The expanded location population must still preserve the node-type diversity already in the package:

- `INTERNAL_WAREHOUSE`
- `FLOOR_AREA`
- `OVERFLOW_AREA`
- `THIRD_PARTY_NODE`
- `TRANSIT_NODE`
- `RESTRICTED_AREA`
- bounded `UNKNOWN`

Target shape:

- at least `2` internal service-capable nodes
- at least `2` floor or overflow nodes
- at least `2` third-party or partner nodes
- at least `1` transit node
- at least `1` restricted node
- bounded `UNKNOWN`, max `1`

## What Does Not Get Expanded Blindly

The model must not perform uncontrolled all-to-all expansion.

Specifically:

- not every account may buy every product
- not every product may stock in every location
- not every location may serve demand directly
- fallback classes may not expand beyond bounded limits

This means the expansion layer must create eligibility and stocking maps, not just larger dimensions.

## Required Internal Planning Tables

The first implementation pass should add these internal tables before regenerated facts are produced:

- `seed_account_archetype`
- `seed_product_archetype`
- `seed_inventory_location_archetype`
- `plan_account_population`
- `plan_product_population`
- `plan_inventory_location_population`
- `plan_account_product_eligibility`
- `plan_product_location_stocking`

These are internal-only controls.
They are not part of the approved public package.

## Deterministic Derivation Rules

### Account derivation

- derive each new account from a seed archetype plus clone ordinal
- hash the archetype key plus ordinal into a stable public-safe `account_sk` and `account_code`
- allow bounded variation in service profile, criticality, and growth bias within the archetype family
- keep the same inputs and version producing the same entity set on rerun

### Product derivation

- derive each new product from a seed archetype plus clone ordinal
- hash the archetype key plus ordinal into a stable public-safe `product_sk` and `product_code`
- vary economic and stocking profile within the family band, not outside it
- preserve family-level replenishment and margin logic

### Location derivation

- derive locations from node archetypes plus site-cluster ordinal
- preserve node-type semantics first and synthetic site identity second
- keep service-capable and non-service-capable nodes intentionally mixed

### Eligibility derivation

- generate account-product eligibility from account pattern plus product family compatibility
- enforce density bands by account type
- allow stronger concentration around core pairings and lighter coverage for extended pairings

### Stocking derivation

- generate product-location stocking from product family, replenishment posture, and node capability
- keep `TRANSIT_NODE` and `RESTRICTED_AREA` behavior bounded and non-service-first
- preserve the existing readiness and releasability semantics

## Guardrails

The expansion pass must fail closed if any of these happen:

- fallback accounts exceed `5%`
- fallback products exceed `6%`
- service-capable inventory locations disappear
- eligibility density explodes into near all-to-all coverage
- a derived product family or account pattern falls outside approved vocabulary
- rerun reproducibility breaks for the same rule version and target cardinalities

## Relationship To Existing Stories

- Story `5.1` already defined behavioral logic.
- Story `5.2` already proved the candidate-generation lane and fail-closed gates.
- Story `5.3` should expand the representative masked population before deeper realism scoring.
- Story `5.4` should then review realism on a representative market, not on a tiny seed population.
- Story `5.5` should only refresh the Fabric proof stack after `5.3` and `5.4` are complete.

## Success Criteria

This correction is successful when:

- the publication explorer shows a market-like number of entities
- the expanded package still remains public-safe and deterministic
- account-product and product-location coverage stay bounded and explainable
- the controlled candidate refresh can run on the expanded population without breaking invariants

## References

- `_bmad-output/planning-artifacts/phase0-sweep-spec-2026-03-25.md`
- `platform/fabric/contracts/logic-first-scenario-parameter-sets.md`
- `platform/fabric/contracts/fact-build-rules.md`
- `platform/fabric/contracts/controlled-realism-test-matrix.md`
- `docs/automation/logic-first-fabric-proof-workflow.md`
