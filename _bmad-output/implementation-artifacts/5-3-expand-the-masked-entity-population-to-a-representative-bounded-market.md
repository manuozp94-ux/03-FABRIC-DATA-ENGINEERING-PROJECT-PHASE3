# Story 5.3: Expand the Masked Entity Population to a Representative Bounded Market

Status: done

## Story

As a product owner,
I want the bounded public-safe package expanded from a tiny seed slice into a representative masked mini-market,
so that later realism review, Fabric proof refresh, and report exploration operate on believable entity diversity rather than on a smoke-scale population.

## Acceptance Criteria

1. Given the current approved package only contains a tiny seed market, when the next implementation step begins, then the repo defines deterministic entity-expansion rules for accounts, products, inventory locations, and eligibility coverage rather than treating the seed slice as the final entity universe.
2. The design sets target cardinalities and bounded distribution rules that move the package toward approximately `100` accounts and `100-200` products without breaking masking, vocabulary, or scenario logic.
3. The expansion layer stays internal and deterministic, using seed archetypes plus governed derivation rules rather than raw source leakage or undocumented random cloning.
4. The next generation-control and candidate-refresh passes can consume the expanded entity population without introducing uncontrolled all-to-all account-product or product-location coverage.
5. The story exits with implementation-ready table definitions, guardrails, and success metrics so Story `5.4` can review realism on a representative market.

## Tasks / Subtasks

- [x] Define the representative target population for the bounded market. (AC: 1, 2, 5)
  - [x] Lock target ranges for accounts, products, locations, and active account-product relationships.
  - [x] Lock bounded fallback-rate limits for `UNKNOWN` and `UNCLASSIFIED`.
  - [x] State what counts as “representative enough” for the MVP.

- [x] Define the deterministic derivation model for expanded entities. (AC: 1, 2, 3)
  - [x] Define account derivation from masked archetypes.
  - [x] Define product derivation from masked archetypes.
  - [x] Define location derivation from node-type archetypes.
  - [x] Define stable key and code generation rules for derived entities.

- [x] Define bounded coverage rules instead of uncontrolled expansion. (AC: 3, 4)
  - [x] Define account-product eligibility-density rules.
  - [x] Define product-location stocking coverage rules.
  - [x] Define which combinations remain intentionally impossible.

- [x] Define the internal-only tables required for implementation. (AC: 3, 4, 5)
  - [x] Define seed archetype tables.
  - [x] Define population-plan tables.
  - [x] Define eligibility and stocking-plan tables.

- [x] Attach the expansion design to the existing logic-first workflow. (AC: 4, 5)
  - [x] State how Story `5.2` outputs become seed inputs for this story.
  - [x] State how Story `5.4` depends on the expanded population.
  - [x] Keep manual report-authoring explicitly out of scope.

## Dev Notes

- The goal of this story is not more fact rows by themselves.
- The goal is more representative entity diversity under the same public-safe scenario.
- The current logic-first lane remains valid; this story widens the population it operates on.

### Project Structure Notes

- Canonical design document: `platform/fabric/contracts/representative-entity-expansion-design.md`
- Workflow reference: `docs/automation/logic-first-fabric-proof-workflow.md`
- Current approved package: `platform/fabric/publication/current`
- Current candidate lane: `_bmad-output/test-artifacts/fabric-candidate/current`

### Technical Requirements

- Treat the current approved package as seed archetypes, not as the final market population.
- Preserve all current public-safe vocabularies.
- Keep expansion reproducible for the same rule version and target counts.
- Keep fallback classes explicitly bounded.
- Do not broaden into Fabric live refresh or Power BI Desktop work in this story.

### Architecture Compliance

- Entity expansion is internal planning and generation control work only.
- The approved public package remains the trust anchor until the expanded candidate path is validated.
- Story `5.4` should evaluate realism on the expanded population, not on the current tiny seed market.

### Testing Requirements

- This story should leave behind deterministic design constraints that can be tested when implementation begins:
  - target-count compliance
  - fallback-rate compliance
  - reproducible derived entity keys
  - bounded eligibility density
  - bounded stocking density

### References

- `platform/fabric/contracts/representative-entity-expansion-design.md`
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-04-01-representative-entity-expansion.md`
- `platform/fabric/contracts/logic-first-scenario-parameter-sets.md`
- `docs/automation/logic-first-fabric-proof-workflow.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-04-01: Confirmed that the current approved package is operating on a tiny seed population of `4` accounts, `5` products, and `7` inventory locations.
- 2026-04-01: Identified that the gap is not masking failure but the absence of a representative entity-expansion layer between the source-safe seed slice and later realism review.
- 2026-04-01: Created the canonical entity-expansion design and inserted this story as the next planning step inside Epic `5`.
- 2026-04-01: Implemented a deterministic representative-market materializer that expands the local bounded package to `96` accounts, `140` products, `16` locations, `640` eligibility pairs, and `196` stocking pairs.
- 2026-04-01: Added representative-market validation and tests, generated local representative tables, and updated the publication explorer with preview limits plus representative scopes.

### Completion Notes List

- Story `5.3` now materializes a representative masked mini-market locally without changing the approved public trust anchor.
- The repo now contains deterministic seed, plan, and stocking tables plus a representative local package and representative internal controls.
- The publication explorer can browse `representative` and `representative_controls` scopes with row-limited previews instead of rendering full tables by default.
- Story `5.4` can now review realism on a market-like entity population instead of on the original smoke-scale seed slice.

### File List

- `_bmad-output/implementation-artifacts/5-3-expand-the-masked-entity-population-to-a-representative-bounded-market.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `platform/fabric/contracts/representative-entity-expansion-design.md`
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-04-01-representative-entity-expansion.md`
- `docs/automation/logic-first-fabric-proof-workflow.md`
- `docs/public-site/project-map.md`
- `_bmad-output/planning-artifacts/epics.md`
- `platform/fabric/automation/representative-market-lib.mjs`
- `platform/fabric/automation/materialize-representative-market.mjs`
- `platform/fabric/validation/validate-representative-market.mjs`
- `tests/publication/representative-market.test.mjs`
- `tests/publication/exploration/publication-explorer.ipynb`
- `_bmad-output/test-artifacts/fabric-representative/current/dim_account.json`
- `_bmad-output/test-artifacts/fabric-representative/current/dim_product.json`
- `_bmad-output/test-artifacts/fabric-representative/current/dim_inventory_location.json`
- `_bmad-output/test-artifacts/fabric-representative/current/fact_demand_line.json`
- `_bmad-output/test-artifacts/fabric-representative/current/fact_inventory_inbound.json`
- `_bmad-output/test-artifacts/fabric-representative/current/fact_inventory_snapshot.json`
- `_bmad-output/test-artifacts/fabric-representative/internal-controls/current/seed_account_archetype.json`
- `_bmad-output/test-artifacts/fabric-representative/internal-controls/current/seed_product_archetype.json`
- `_bmad-output/test-artifacts/fabric-representative/internal-controls/current/seed_inventory_location_archetype.json`
- `_bmad-output/test-artifacts/fabric-representative/internal-controls/current/plan_account_population.json`
- `_bmad-output/test-artifacts/fabric-representative/internal-controls/current/plan_product_population.json`
- `_bmad-output/test-artifacts/fabric-representative/internal-controls/current/plan_inventory_location_population.json`
- `_bmad-output/test-artifacts/fabric-representative/internal-controls/current/plan_account_product_eligibility.json`
- `_bmad-output/test-artifacts/fabric-representative/internal-controls/current/plan_product_location_stocking.json`
- `_bmad-output/test-artifacts/fabric-representative/representative-market-report.json`

### Change Log

- 2026-04-01: Created Story `5.3` and moved it to `ready-for-dev`.
- 2026-04-01: Moved Story `5.3` to `in-progress` and implemented the representative-market materializer, validator, tests, and notebook updates.
- 2026-04-01: Marked Story `5.3` done after generating the local representative package and passing the full publication test suite.
