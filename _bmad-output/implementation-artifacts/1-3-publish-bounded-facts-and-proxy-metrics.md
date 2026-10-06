# Story 1.3: Publish Bounded Facts and Proxy Metrics

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a product owner,
I want governed fact tables and synthetic proxy metrics generated from the approved source slice,
so that the analytical case can show demand and inventory-readiness behavior without using unsafe commercial data.

## Acceptance Criteria

1. Given approved Customer Demand and Stock Overview inputs plus the governed dimensions, when the fact build runs, then `fact_demand_line` and `fact_inventory_snapshot` are produced at their contract-defined grain.
2. `event_date` and `snapshot_date` semantics are labeled consistently in the published schema or package documentation so reviewers can distinguish event-based versus snapshot-based analysis.
3. Every fact row resolves to the required dimension keys or an approved explicit fallback.
4. Synthetic economic proxy outputs are derived only from approved public-safe rules rather than raw pricing, rebates, or valuation files.

## Tasks / Subtasks

- [x] Define the tracked contract surfaces for the two governed facts and their proxy rules. (AC: 1, 2, 4)
  - [x] Create `platform/fabric/contracts/fact_demand_line.schema.json` and `fact_inventory_snapshot.schema.json` aligned to the MVP contracts, including required fields, grain, date semantics, and allowed optional proxy fields.
  - [x] Add a tracked rules reference for demand status mapping, inventory status mapping, proxy metric labeling, and permitted economic-rule inputs.

- [x] Extend the governed build flow to publish bounded facts from approved source families. (AC: 1, 2, 3, 4)
  - [x] Add a repeatable build entrypoint that reads only approved `Customer Demand` and `Stock Overview` inputs plus the governed dimensions already produced in Story 1.2.
  - [x] Keep fact generation inside `platform/fabric/` and write outputs only to governed publication paths; do not sync any fact outputs into the Astro app in this story.
  - [x] Add publication-safe fixture coverage for the approved fact inputs instead of committing any raw private extracts.

- [x] Resolve all fact rows against the governed dimensions and explicit fallbacks. (AC: 1, 2, 3)
  - [x] Ensure `fact_demand_line` resolves `product_sk` and `account_sk`, or an approved explicit fallback when required.
  - [x] Ensure `fact_inventory_snapshot` resolves `product_sk` and `inventory_location_sk`, or an approved explicit fallback when required.
  - [x] Document and verify `open_qty` derivation plus the distinction between `event_date` and `snapshot_date`.

- [x] Add synthetic proxy metrics using only approved public-safe rule inputs. (AC: 4)
  - [x] Derive proxy values only from permitted inputs such as product family, weight/size proxies, box/pallet indicators, handling profile, and node type.
  - [x] Clearly label proxy fields as synthetic and bounded; do not consume raw price lists, raw valuation files, rebates, or realized margin data.

- [x] Add focused verification for the fact outputs and proxy metrics. (AC: 1, 2, 3, 4)
  - [x] Validate fact grain, required fields, date semantics, key resolution, fallback usage, and controlled status vocabularies.
  - [x] Validate that proxy metric fields are present only where allowed and remain explicitly labeled as proxy outputs.
  - [x] Keep the implementation compatible with a later nightly candidate refresh flow that validates first and promotes only after approval.

## Dev Notes

- Story 1.2 already established the governed dimension layer, stable public-safe surrogate keys, and the first publication-safe build/validation flow. Story 1.3 should extend that governed package rather than inventing a parallel fact pipeline.
- The approved fact source families are already selected in planning: `Customer Demand` for `fact_demand_line` and `Stock Overview` for `fact_inventory_snapshot`. `Open Orders` remains a later derived-view candidate, not a Story 1.3 source dependency.
- The MVP contracts are explicit that proxy economics must stay synthetic. This story must not pull in raw pricing, raw inventory valuation, rebates, SPA logic, invoice pricing, or exact realized margin.
- The new publication cadence policy says candidate refreshes can run nightly, but public promotion stays approval-based. Keep Story 1.3 outputs compatible with that operating model: refreshable, validated, and non-live by default.
- Story 1.3 is still within the governed Fabric zone only. Do not add public-site sync, release archive promotion, or stale-state UI here; those are later stories.

### Project Structure Notes

- The architecture already names the contract targets for this story:
  - `platform/fabric/contracts/fact_demand_line.schema.json`
  - `platform/fabric/contracts/fact_inventory_snapshot.schema.json`
  - `platform/fabric/automation/` for build logic
  - `platform/fabric/validation/` for publication-safe checks
  - `platform/fabric/publication/current/` for governed outputs
  - `tests/publication/` for publication-safe fixtures and verification
- Story 1.2 already occupies `platform/fabric/contracts/`, `platform/fabric/automation/`, `platform/fabric/validation/`, and `platform/fabric/publication/current/`. Reuse those seams and extend the existing build flow rather than creating a second pattern.
- `apps/public-site/src/data/publication/current/` remains out of scope for this story.

### Technical Requirements

- Use only approved `Customer Demand` and `Stock Overview` inputs for fact generation in this story.
- Preserve contract grain:
  - `fact_demand_line`: one row per masked demand line item
  - `fact_inventory_snapshot`: one row per product-location snapshot
- Preserve date meaning:
  - `event_date` for demand business events
  - `snapshot_date` for inventory point-in-time facts
- Keep demand and inventory statuses in a controlled public-safe vocabulary.
- Keep `open_qty` derivable or directly validated from demand and delivered quantities.
- Keep proxy metrics deterministic and rule-based from permitted public-safe inputs only.

### Architecture Compliance

- Respect the three-zone boundary:
  - `platform/fabric/private-prep/` stays local-only and ignored
  - `platform/fabric/` owns governed contracts, validation, publication outputs, and future promotion logic
  - `apps/public-site/` stays a read-only consumer later, not part of this story
- Facts must resolve against the governed dimensions from Story 1.2 rather than duplicating masking or key logic.
- Keep the current publication package reviewable and text-diffable for later validation, release, and freshness stories.
- Candidate refresh compatibility matters, but auto-promotion does not belong in Story 1.3.

### Library / Framework Requirements

- Keep using the current root Node.js `>=22.12.0`, `pnpm@10.33.0`, TypeScript-first workspace conventions from Stories 1.1 and 1.2.
- Reuse the lightweight Node-based governed build pattern already established in `platform/fabric/automation/` unless a story-scoped reason forces a different approach.
- Do not add public-site runtime dependencies or move analytical logic into Astro.

### Testing Requirements

- Add publication-safe fixtures for `Customer Demand` and any bounded fact inputs required by the contracts.
- Validate:
  - required fields
  - fact grain
  - date semantics
  - dimension-key resolution
  - explicit fallbacks
  - controlled status vocabularies
  - proxy-field labeling and allowed-input discipline
- Keep the verification surface lightweight and local-script friendly so it can later feed the nightly candidate-refresh sidecar and Story 1.5 validation gates.

### Previous Story Intelligence

- Story 1.2 created governed contract schemas, a Node-based build library, a validator, safe fixtures, and current publication outputs under `platform/fabric/publication/current/`.
- Story 1.2 review fixed one important refresh-stability issue by making masked public codes stable across later source growth. Story 1.3 should preserve that stability and resolve facts through those stable dimension keys instead of introducing new renumbering behavior.
- Story 1.2 also anchored a cadence policy in `docs/automation/publication-cadence-policy.md`; Story 1.3 should remain compatible with nightly candidate builds plus weekly approved publication.

### Git / Repo Intelligence

- The repo is still pre-first-commit on `main`, so Story 1.3 continues to establish the baseline governed publication patterns.
- The governed fact work should extend the existing `platform/fabric/` pattern rather than splitting into a separate toolchain or folder convention.

### References

- `_bmad-output/planning-artifacts/epics.md` - Story 1.3 acceptance criteria and story-level NFR references.
- `_bmad-output/planning-artifacts/mvp-data-contracts-2026-03-25.md` - Contracts for `fact_demand_line`, `fact_inventory_snapshot`, synthetic economic proxy rules, and minimum join expectations.
- `_bmad-output/planning-artifacts/architecture.md` - Governing architecture boundaries, publication package structure, and explicit fact schema targets.
- `_bmad-output/planning-artifacts/prd.md` - FR19, FR20, and the public-safe synthetic economic expectations for the MVP slice.
- `_bmad-output/planning-artifacts/phase0-source-family-register-2026-03-25.md` - Canonical source candidate decisions for `Customer Demand`, `Stock Overview`, and the supporting dimension joins.
- `docs/automation/publication-cadence-policy.md` - Target nightly candidate refresh and weekly approved publish policy, plus freshness/stale-state thresholds.
- `_bmad-output/implementation-artifacts/1-2-publish-masked-dimension-entities.md` - Previous story implementation learnings, stable masked key approach, and governed build pattern to reuse.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created after Story 1.2 was completed and marked done on 2026-03-28.
- Context synthesized from `epics.md`, the MVP data contracts, the architecture, the cadence policy, the Phase 0 source-family register, and Story 1.2 learnings.
- Added `customer-demand.json` publication-safe fixture coverage and extended `stock-overview.json` with bounded snapshot fields needed for fact generation.
- Extended the governed build flow to publish `fact_demand_line` and `fact_inventory_snapshot` into the same governed package as the dimensions.
- Added fact schemas, fact-build rules, proxy metric derivation, and validation for date semantics, key resolution, status vocabularies, and proxy-field outputs.
- Updated the internal publication explorer notebook so it can inspect the new fact tables alongside the dimensions.

### Completion Notes List

- Governed outputs now include `fact_demand_line` and `fact_inventory_snapshot` in `platform/fabric/publication/current/`.
- Fact rows resolve against the governed Story 1.2 dimensions and preserve explicit date semantics for `event_date` versus `snapshot_date`.
- Proxy metrics now exist as synthetic bounded outputs only: `demand_value_proxy`, `gross_margin_proxy`, `inventory_value_proxy`, `node_value_concentration_band`, and `readiness_flag`.
- Validation now covers fact grain, required fields, controlled vocabularies, key resolution, date semantics, and `open_qty` derivation.
- Candidate refresh remains compatible and now regenerates the bounded facts in addition to the dimensions.
- Public-facing field names no longer disclose masking mechanics; current and candidate packages now use neutral public nomenclature plus generic provenance labels.
- Public sales activity now extends from approved 2024 start dates forward and adds new synthetic demand-line occurrences in the active refresh window on each package rebuild.

### File List

- `_bmad-output/implementation-artifacts/1-3-publish-bounded-facts-and-proxy-metrics.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `platform/fabric/automation/dimension-build-lib.mjs`
- `platform/fabric/contracts/fact-build-rules.md`
- `platform/fabric/contracts/dim_account.schema.json`
- `platform/fabric/contracts/dim_inventory_location.schema.json`
- `platform/fabric/contracts/dim_product.schema.json`
- `platform/fabric/contracts/fact_demand_line.schema.json`
- `platform/fabric/contracts/fact_inventory_snapshot.schema.json`
- `platform/fabric/publication/current/dim_account.json`
- `platform/fabric/publication/current/dim_inventory_location.json`
- `platform/fabric/publication/current/dim_product.json`
- `_bmad-output/test-artifacts/fabric-candidate/candidate-refresh-report.json`
- `platform/fabric/publication/current/fact_demand_line.json`
- `platform/fabric/publication/current/fact_inventory_snapshot.json`
- `platform/fabric/validation/validate-dimensions.mjs`
- `tests/publication/dimension-build.test.mjs`
- `tests/publication/exploration/publication-explorer.ipynb`
- `tests/publication/fixtures/source-safe/customer-demand.json`
- `tests/publication/fixtures/source-safe/stock-overview.json`

### Change Log

- 2026-03-28: Created Story 1.3 context and moved it to ready-for-dev.
- 2026-03-28: Implemented governed fact generation, proxy metrics, schema contracts, validation, fixture coverage, refreshed current/candidate outputs, and moved the story to review.
- 2026-03-29: Finalized public-safe nomenclature, generic provenance labels, rolling 2024-forward sales generation, refreshed current/candidate outputs, and closed the story as done.
