# Story 1.2: Publish Masked Dimension Entities

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a product owner,
I want masked, publication-safe dimension entities built from the bounded source slice,
so that the public case can describe products, accounts, and locations without exposing enterprise identity.

## Acceptance Criteria

1. Given approved Product Information, Account Assignments, and Stock Overview inputs, when the dimension build runs, then `dim_product`, `dim_product_family`, `dim_account`, and `dim_inventory_location` are produced at the contract-defined grain.
2. Direct identifiers for products, accounts, sites, 3PLs, and internal labels are removed or abstracted while preserving meaningful business behavior.
3. Surrogate keys plus explicit safe fallback values such as `UNCLASSIFIED` or `UNKNOWN` are handled where required by the contracts.
4. Product-family and node-type classification logic is deterministic, documented, and publication-safe.

## Tasks / Subtasks

- [x] Define the tracked contract surfaces for the four governed dimensions. (AC: 1, 3, 4)
  - [x] Create `platform/fabric/contracts/dim_product.schema.json`, `dim_product_family.schema.json`, `dim_account.schema.json`, and `dim_inventory_location.schema.json` aligned to the MVP contracts, including required fields, grain expectations, and allowed fallback values.
  - [x] Add a concise tracked rules reference beside the schemas that records masked label conventions, allowed fallback values, product-family assignment logic, and allowed `node_type_code` vocabulary.

- [x] Implement the first governed dimension build flow inside `platform/fabric/`. (AC: 1, 2, 3, 4)
  - [x] Create `platform/fabric/automation/` and add a repeatable local build entrypoint that reads only the approved source families: `Product Information`, `Account Assignments`, and `Stock Overview`.
  - [x] Keep actual private source inputs outside the committed repo; if runnable tests need sample data, use small publication-safe fixtures under `tests/publication/fixtures/` or an equivalent tracked safe area.
  - [x] Write generated public-safe outputs to governed publication paths only, starting with `platform/fabric/publication/current/`; do not sync anything into `apps/public-site/src/data/publication/current/` in this story.

- [x] Apply masking, surrogate-key, and fallback logic to every published dimension. (AC: 2, 3, 4)
  - [x] Remove or abstract product, account, site, 3PL, and internal labels from published fields so the outputs preserve behavior rather than enterprise identity.
  - [x] Generate stable surrogate keys and explicit fallbacks such as `UNCLASSIFIED` and `UNKNOWN` where the contracts require them.
  - [x] Ensure the same approved inputs always yield the same product-family and node-type classifications.

- [x] Add focused publication-safe verification for the dimension outputs. (AC: 1, 2, 3, 4)
  - [x] Add lightweight validation or tests for required fields, uniqueness at contract grain, controlled vocabulary, fallback coverage, and absence of leaked private identifiers.
  - [x] Prove deterministic reruns over the same bounded inputs, either by a repeated build check or by equivalent automated assertions.

## Dev Notes

- Story 1.1 already established the repo root as the canonical workspace and created the three-zone boundary. Story 1.2 should add the first real governed analytical assets under `platform/fabric/` without pulling any data-handling logic into `apps/public-site/`.
- The approved bounded source families for this story are already selected in planning: `Product Information` for `dim_product`, `Account Assignments` for `dim_account`, and `Stock Overview` for `dim_inventory_location`; `dim_product_family` is a derived entity built from product attributes and documented logic.
- The masking framework is explicit that the goal is to preserve business behavior, not enterprise identity. Product families and node types should therefore encode operational differences without leaking original names, site codes, warehouse brands, or internal terminology.
- `platform/fabric/private-prep/` is intentionally gitignored except for its boundary marker. Treat it as a private local working area, not the place for tracked source-of-truth schemas, deterministic public-safe rule docs, or committed fixtures.
- This story is about governed dimension generation only. Do not introduce public-site data sync, release promotion, rollback logic, or a full validation pipeline here; those seams are covered in later Epic 1 stories, especially Stories 1.4 through 1.6.

### Project Structure Notes

- The architecture already reserves these tracked paths for Story 1.2 work:
  - `platform/fabric/contracts/` for analytical contract schemas
  - `platform/fabric/automation/` for local governed build automation
  - `platform/fabric/validation/` for publication rules or checks when needed
  - `platform/fabric/publication/current/` for the current governed package
  - `tests/publication/` for publication-safe verification and fixtures
- `apps/public-site/src/data/publication/current/` is a later generated mirror for approved release artifacts. Do not populate that web-consumption path in this story.
- `platform/fabric/publication/releases/<release_id>/` is also later-stage release archive scope; Story 1.2 can stay focused on current governed outputs and the rules that make them safe and repeatable.
- No tracked files currently exist under `platform/fabric/` beyond the `.gitkeep` boundary markers, so this story sets the first real governed contract and automation assets in that zone.

### Technical Requirements

- Use only the approved bounded source families named in the planning set for this story. Do not widen scope to other historical workbooks or ad hoc evidence families.
- Keep publication outputs stable, reviewable, and explicitly masked. Public-safe labels should be neutral and behaviorally meaningful rather than brand-like or enterprise-specific.
- `dim_product_family` must be rule-based and derived from product attributes or documented logic patterns, not from raw branded nomenclature.
- `dim_inventory_location` is a derived entity from `Stock Overview` and bounded helper logic. Do not invent a separate raw location master just to satisfy the story.
- Because the current repo is a Node.js `22.12.0+`, pnpm-based, TypeScript-first workspace, prefer lightweight automation that is directly runnable from the existing repo without introducing a heavy new execution stack. If a new helper is required, keep it explicit and easy to run locally.
- Favor text-diffable public-safe artifacts and tracked rule documentation so later validation, release, and review stories can build on them without reverse engineering this step.

### Architecture Compliance

- Respect the three-zone boundary:
  - `platform/fabric/private-prep/` for local private work only
  - `platform/fabric/` for governed contracts, validation, and publication outputs
  - `apps/public-site/` for public rendering only
- Contract schemas in `platform/fabric/contracts/` remain the analytical source of truth.
- The public site must not import from `private-prep/` or contain hand-authored business data.
- Governed outputs for this story should stay inside `platform/fabric/publication/current/` or equivalent governed paths until later sync and promotion stories are implemented.
- Keep Story 1.6 in mind: this implementation should make later manifest, sync-contract, and validation-command work easier, not harder, but should not try to fully solve those later seams early.

### Library / Framework Requirements

- Root workspace baseline from Story 1.1:
  - Node.js `>=22.12.0`
  - `pnpm@10.33.0`
  - TypeScript-first project structure
- Public web framework remains Astro `6.x` with React deferred. Story 1.2 should not add public-site runtime dependencies or move governed logic into the Astro app.
- The architecture names the dimension schema files explicitly. Match those filenames exactly so later automation and validation stories can build on a stable contract surface.

### Testing Requirements

- Add focused publication checks for:
  - required fields present
  - uniqueness at the declared dimension grain
  - controlled vocabulary enforcement for node types
  - explicit fallback handling (`UNCLASSIFIED`, `UNKNOWN`)
  - absence of leaked private identifiers or unapproved business labels
- Use only publication-safe fixtures in tracked test assets. Never commit raw private source extracts to the repo.
- Keep the verification surface lightweight and story-scoped. Story 1.6 will formalize the broader validation-command flow and minimum test-tool baseline.

### Previous Story Intelligence

- Story 1.1 created the root pnpm workspace, established `apps/public-site/`, `platform/fabric/`, and `tests/publication/`, and confirmed the repo is now a single root Git boundary.
- Root command discipline is already explicit: the repo favors runnable-from-root commands and avoids hidden nested workspace assumptions. Match that pattern if Story 1.2 adds new automation entrypoints.
- The `.gitignore` now protects `platform/fabric/private-prep/*`, so tracked implementation logic, reference docs, and safe fixtures must live in governed or test paths instead of the private-prep zone.
- Story 1.1 intentionally left React and broader publication contract machinery out of scope. Keep Story 1.2 equally disciplined.

### Git / Repo Intelligence

- `git rev-parse --is-inside-work-tree` succeeds at the repository root.
- `git log --oneline -5` currently reports no commits yet on `main`, so Story 1.2 will still be shaping the earliest durable repo conventions.
- The only tracked files under `platform/fabric/` today are `.gitkeep` markers, which makes filename choice and folder placement in this story especially important for later consistency.

### References

- `_bmad-output/planning-artifacts/epics.md` - Story 1.2 acceptance criteria, FR29 mapping, and story-level NFR references for NFR10-NFR12 and NFR34-NFR36.
- `_bmad-output/planning-artifacts/architecture.md` - Frontend/Node baseline, complete project structure, governed Fabric boundary, publication-package boundary, and explicit schema filenames.
- `_bmad-output/planning-artifacts/prd.md` - FR29, NFR10-NFR12, NFR34-NFR36, and Additional Requirements for early governed delivery discipline.
- `_bmad-output/planning-artifacts/masking-abstraction-framework-2026-03-25.md` - Core masking principle, entity-specific abstraction guidance, suggested node-type categories, and product-family abstraction approach.
- `_bmad-output/planning-artifacts/mvp-data-contracts-2026-03-25.md` - Shared conventions plus the bounded contracts for `dim_product`, `dim_product_family`, `dim_account`, and `dim_inventory_location`.
- `_bmad-output/planning-artifacts/phase0-source-family-register-2026-03-25.md` - Canonical source candidate decisions, grain risks, and derivation notes for the four Story 1.2 dimensions.
- `_bmad-output/planning-artifacts/implementation-readiness-report-2026-03-28.md` - Confirmed March 28 readiness state and aligned planning-document selection.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from the current sprint plan after Story 1.1 was closed on 2026-03-28.
- Context synthesized from `epics.md`, `architecture.md`, `prd.md`, the masking framework, MVP data contracts, the Phase 0 source-family register, the implementation-readiness report, and Story 1.1 learnings.
- Git repository detected at the root, with no commits yet on `main`.
- Added governed contract schemas plus a tracked masking-rule reference under `platform/fabric/contracts/`.
- Added a zero-dependency Node build flow in `platform/fabric/automation/` and a matching validator in `platform/fabric/validation/`.
- Added publication-safe fixtures under `tests/publication/fixtures/source-safe/` and generated governed outputs under `platform/fabric/publication/current/`.
- Verification passed with `corepack pnpm run build:fabric-dimensions -- --load-timestamp 2026-03-28T20:45:00.000Z`, `corepack pnpm run validate:fabric-dimensions`, and `corepack pnpm run test:fabric-dimensions`.
- Low-burn review found one refresh-stability issue in the original masking-code assignment approach; fixed by switching masked public codes to stable hash-derived values and adding a regression test that proves existing public-safe labels do not renumber when earlier source rows appear later.
- Follow-up abstraction patch raised the public-safe vocabulary level: product families now use more neutral operational classes, product outputs now expose proxy analytical classes instead of direct `forecasting_category` / `planning_model`, and account segmentation now uses `account_pattern_class`.

### Completion Notes List

- Publication-safe contract schemas now exist for `dim_product`, `dim_product_family`, `dim_account`, and `dim_inventory_location`.
- The build flow reads only the approved bounded source families from tracked safe fixtures and writes masked outputs to `platform/fabric/publication/current/`.
- Surrogate keys, `UNCLASSIFIED`/`UNKNOWN` fallbacks, deterministic product-family rules, and deterministic node-type rules are now implemented and documented.
- Product outputs now include deterministic proxy classes for demand pattern, planning constraint, inventory policy, fulfillment risk, lead time, criticality, service profile, value density, synthetic unit economics, and substitution grouping.
- Account outputs now use `account_pattern_class` with more abstract public-safe segmentation instead of the earlier closer-to-business `customer_group` vocabulary.
- Root scripts now support build, validation, and test execution for the governed dimensions without introducing extra dependencies.
- Verification passed end to end, and the follow-up review fix closed the only material finding.

### File List

- `_bmad-output/implementation-artifacts/1-2-publish-masked-dimension-entities.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `package.json`
- `platform/fabric/automation/build-dimensions.mjs`
- `platform/fabric/automation/dimension-build-lib.mjs`
- `platform/fabric/contracts/dim_account.schema.json`
- `platform/fabric/contracts/dim_inventory_location.schema.json`
- `platform/fabric/contracts/dim_product.schema.json`
- `platform/fabric/contracts/dim_product_family.schema.json`
- `platform/fabric/contracts/dimension-build-rules.md`
- `platform/fabric/publication/current/dim_account.json`
- `platform/fabric/publication/current/dim_inventory_location.json`
- `platform/fabric/publication/current/dim_product.json`
- `platform/fabric/publication/current/dim_product_family.json`
- `platform/fabric/validation/validate-dimensions.mjs`
- `tests/publication/dimension-build.test.mjs`
- `tests/publication/fixtures/source-safe/account-assignments.json`
- `tests/publication/fixtures/source-safe/product-information.json`
- `tests/publication/fixtures/source-safe/stock-overview.json`

### Change Log

- 2026-03-28: Created Story 1.2 context and moved it to ready-for-dev.
- 2026-03-28: Implemented the first governed dimension contracts, build flow, publication-safe fixtures, generated current outputs, and lightweight validation/tests; moved the story to review.
- 2026-03-28: Completed low-burn code review, fixed masked-code refresh stability, and marked the story done.
- 2026-03-28: Applied a follow-up abstraction patch to reduce business-near taxonomies in `dim_product` and `dim_account`, expanded product proxy attributes, and corrected the internal exploration notebook display cell.
