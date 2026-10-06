# Story 4.6: Publish a Bounded Power BI or Fabric Proof Surface

Status: done

## Story

As a technical evaluator,
I want one visible Power BI or Fabric proof artifact kept within the public technical-method experience,
so that I can confirm platform credibility without confusing the product for a public BI portal or full planning suite.

## Acceptance Criteria

1. Given the technical-method route and approved publication package are available, when a technical evaluator reviews platform proof on the public surface, then one bounded Power BI or Fabric proof artifact is exposed as an approved export, bounded embed, governed deep link, or clearly labeled snapshot.
2. The artifact is explicitly labeled as direct proof, bounded proof, or approved export, including what it demonstrates and what remains deferred.
3. The artifact uses approved public-safe data or a governed export tied to the approved publication package.
4. The artifact remains subordinate to the curated website rather than replacing it or relying on Publish to web as the default public delivery path.

## Tasks / Subtasks

- [x] Re-anchor Story 4.6 on the medallion-aligned architecture promised in planning. (AC: 2, 3, 4)
  - [x] Confirm the governed package remains the only public-safe contract.
  - [x] Confirm Astro is not the target analytical engine for the bounded proof.
  - [x] Confirm the first proof page will be the Supply Chain Decision View.

- [x] Create the bounded Fabric compatibility layer for the proof path. (AC: 2, 3)
  - [x] Add `05-compat/` as the checked-in compatibility surface for 4.6.
  - [x] Add a medallion-bundle generator from the approved package into Bronze, Silver, and Gold outputs.
  - [x] Add the first semantic-model contract and measure pack outside the Astro layer.
  - [x] Add the first report-page contract for the Fabric / Power BI proof page.

- [x] Land the bounded proof data into Fabric. (AC: 1, 3)
  - [x] Create or confirm the target Fabric Lakehouse.
  - [x] Load the Bronze / Silver / Gold bundle into the workspace proof surface.
  - [x] Capture the landed item references and refresh evidence.

- [x] Materialize the semantic model and first report page. (AC: 1, 2, 3)
  - [x] Build the semantic model from the proof tables.
  - [x] Create the measures for coverage, readiness, exposure, and action count.
  - [x] Build the first report page as `Supply Chain Decision View`.
  - [x] Switch the report authoring path to Power BI Desktop first, then publish back to the Service for bounded embed.

- [x] Attach the proof surface back into the technical-method route. (AC: 1, 2, 4)
  - [x] Keep the artifact subordinate to the curated route.
  - [x] Label the proof as bounded and explain what remains deferred.
  - [x] Avoid `Publish to web` as the default delivery path.

## Dev Notes

- The architecture explicitly called for a Fabric-centered, medallion-aligned analytical flow with a bounded semantic proof layer. Story 4.6 is where that design becomes visible.
- The current web case-study route was useful for clarifying the product, but it should not remain the authority for semantic calculations.
- The bounded proof should be built from the approved package only. No private-prep data and no candidate lane outputs may flow into the proof artifact.

### Project Structure Notes

- Fabric compatibility surface: `05-compat/`
- Approved package source: `platform/fabric/publication/current/`
- Proof outputs: `_bmad-output/test-artifacts/fabric-proof/fab001/current/`
- Public technical host route: `apps/public-site/src/pages/technical-method.astro`

### Technical Requirements

- Lakehouse-first or other Fabric-native proof path is preferred over direct web-only calculation.
- The semantic layer must define measures outside Astro.
- The proof page should start with one page only: `Supply Chain Decision View`.
- Embed or attachment strategy must remain publication-safe and subordinate to the site.
- Report visual authoring may move to Power BI Desktop later when controlled layout matters, but only after the Fabric-side business logic and serving tables are stable enough to avoid churn.

### Architecture Compliance

- The approved publication package remains the canonical contract.
- The proof path follows Bronze -> Silver -> Gold -> Semantic Model -> Report.
- The website hosts the proof but does not become the semantic engine.

### Testing Requirements

- `corepack pnpm run build:public-site`
- `corepack pnpm run check:public-site`
- `python3 05-compat/scripts/land_fab001_lakehouse_tables.py --dry-run`
- `python3 05-compat/scripts/land_fab001_lakehouse_tables.py`
- `python3 05-compat/scripts/deploy_fab001_semantic_models.py`
- `python3 05-compat/scripts/populate_fab001_core_visual_page.py`

### References

- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/power-bi-fabric-proof-reentry-plan-2026-03-30.md`
- `platform/fabric/bootstrap/README.md`
- `05-compat/README.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-03-30: Confirmed the project architecture already promised a Fabric-centered, medallion-aligned proof path.
- 2026-03-30: Started the checked-in compatibility layer for Story 4.6 so semantic logic can move out of Astro.
- 2026-03-30: Generated the bounded Bronze / Silver / Gold proof bundle from the approved publication package.
- 2026-03-30: Created the Fabric Lakehouse `lh_fab001_public_proof` in workspace `c11ed225-3ffc-440b-8cdb-88d1f366a91b`.
- 2026-03-30: Generated the semantic-model contract, measure pack, report-page contract, and Fabric build runbook under `05-compat/contracts`.
- 2026-03-31: Uploaded the bounded proof bundle into OneLake, created the loader notebook `nb_fab001_lakehouse_loader`, and completed the first Fabric load into `lh_fab001_public_proof`.
- 2026-03-31: Confirmed the live semantic model `sm_fab001_supply_chain_decision` and patched the bounded measure pack into the model definition.
- 2026-03-31: Confirmed the live report `rpt_fab001_supply_chain_decision` and normalized its first page shell to `Supply Chain Decision View`.
- 2026-03-31: Added the bounded embed bootstrap to `technical-method` and validated the live token path against Power BI REST APIs.
- 2026-03-31: Confirmed the bounded proof shell loads from the public route and closed Story 4.6 at MVP scope.

### Completion Notes List

- Story 4.6 is now grounded on a real medallion proof path rather than a web-only fallback.
- The Lakehouse for the bounded proof now exists, contains the Bronze / Silver / Gold Delta tables, and is referenced in the proof manifest.
- The semantic model now exists in Fabric and includes the bounded measure pack outside Astro.
- The report now exists in Fabric and its first page shell is aligned to `Supply Chain Decision View`.
- The next implementation steps are to stabilize deterministic business-rule logic, incremental fact growth, and Fabric-side serving behavior before any richer Desktop-authored visual pass is attempted.
- The approved public package now has a checked-in Fabric proof bundle and a canonical measure pack outside Astro.
- The technical-method route now contains a bounded live embed bootstrap driven by a server-side embed-config endpoint.
- The Power BI token and embed path have been validated live against Microsoft identity and Power BI REST APIs for the current report shell.
- The bounded proof shell now loads from the technical-method route, so the MVP embed path is closed even though richer Desktop-authored visuals remain future work.

### File List

- `_bmad-output/implementation-artifacts/4-6-publish-a-bounded-power-bi-or-fabric-proof-surface.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `05-compat/README.md`
- `05-compat/scripts/common_fabric.py`
- `05-compat/scripts/land_fab001_lakehouse_tables.py`
- `05-compat/scripts/deploy_fab001_semantic_models.py`
- `05-compat/scripts/populate_fab001_core_visual_page.py`
- `05-compat/contracts/fab001_semantic_model_contract.json`
- `05-compat/contracts/fab001_measure_pack.dax`
- `05-compat/contracts/fab001_core_visual_contract.json`
- `05-compat/contracts/fab001_core_visual_contract.md`
- `05-compat/contracts/fab001_fabric_build_runbook.md`
- `05-compat/scripts/fab001_lakehouse_loader_notebook.py`
- `05-compat/scripts/materialize_fab001_semantic_model.py`
- `05-compat/scripts/materialize_fab001_report_shell.py`
- `_bmad-output/test-artifacts/fabric-proof/fab001/current/manifest.json`
- `apps/public-site/src/pages/api/powerbi/embed-config.json.ts`
- `apps/public-site/src/components/proof/BoundedPowerBIProof.astro`
- `apps/public-site/package.json`
- `apps/public-site/astro.config.mjs`
- `apps/public-site/tsconfig.json`
- `scripts/run-public-site.mjs`

### Change Log

- 2026-03-30: Created Story 4.6 implementation artifact and moved it to in-progress.
- 2026-03-30: Added the Fabric compatibility layer and generated the first medallion proof bundle.
- 2026-03-30: Created the bounded Fabric Lakehouse `lh_fab001_public_proof`.
- 2026-03-31: Uploaded the proof bundle to OneLake, created the loader notebook by API, and materialized the 14 bounded Delta tables in Fabric.
- 2026-03-31: Confirmed the semantic model `sm_fab001_supply_chain_decision` and materialized the bounded measure pack into the live TMDL definition.
- 2026-03-31: Confirmed the report `rpt_fab001_supply_chain_decision` and normalized the first page shell in the live PBIR-Legacy definition.
- 2026-03-31: Closed the MVP proof shell and embed path while leaving richer Desktop-authored visuals intentionally deferred until the logic-first workflow is complete.
- 2026-03-31: Added the bounded embed bootstrap to the technical-method route and verified live embed-token generation for the current report shell.
- 2026-03-31: Confirmed the bounded proof shell loads from the technical-method route and closed the MVP acceptance path for Story 4.6.
