# Story 3.3: Add a Supporting Cross-Functional Analytical View

Status: done

## Story

As a business-facing viewer,
I want a supporting cross-functional perspective on the same modeled slice,
so that I can see why the case matters to more than one team.

## Acceptance Criteria

1. Given the main analytical case is available, when a visitor explores supporting evidence on the case-study route, then at least one supporting cross-functional analytical view reinforces the main case without replacing it.
2. The supporting view helps explain how the same modeled slice matters across sales, supply chain, logistics, or related stakeholders.
3. The supporting view may focus on either demand pressure or logistics execution, as long as it remains clearly subordinate to the primary supply-chain view.
4. The supporting view remains bounded to the approved MVP story rather than introducing a second independent case study.
5. The explanation of the supporting view remains accessible beyond color-only cues.

## Tasks / Subtasks

- [x] Choose one supporting perspective that strengthens the main decision view without creating a second product. (AC: 1, 3, 4)
  - [x] Keep the primary analytical object centered on supply-chain posture.
  - [x] Use demand pressure as the first support view for this story.

- [x] Publish a bounded supporting analytical view on the case-study route. (AC: 1, 2)
  - [x] Show where open demand is concentrated by account pattern.
  - [x] Show where open demand is concentrated by product family.
  - [x] Surface current-month concentration so the reader can connect recent pressure to the inventory decision.

- [x] Keep the view readable and subordinate. (AC: 3, 4, 5)
  - [x] Explain explicitly that the section supports the main view rather than replacing it.
  - [x] Keep the section bounded to the same public package and story flow.
  - [x] Avoid color-only interpretation by pairing every visual bar with text values and labels.

- [x] Verify the route through the approved baseline commands.
  - [x] Validate Astro build output.
  - [x] Validate Astro check output.

## Dev Notes

- Story 3.3 uses a sales-facing demand-pressure view as the first supporting perspective.
- The goal is explanation, not drilldown depth. This story should help the reader understand why the primary supply-chain decision view is under pressure.
- Logistics-distribution support remains available for a later refinement if the case still benefits from it.

### Project Structure Notes

- Keep the work centered in `apps/public-site/src/pages/case-study.astro`.
- Read only from the approved public mirror under `apps/public-site/src/data/publication/current`.
- Do not introduce a second route or dashboard surface in this story.

### Technical Requirements

- Static-first Astro page only.
- Preserve responsive reading order and keep the supporting view readable without JavaScript.
- Use text labels alongside any proportional bars or emphasis treatments.

### Architecture Compliance

- The primary decision view remains supply-chain centered.
- The supporting view exists to explain demand pressure behind the same inventory decision.
- The section must remain bounded and clearly subordinate to the main view.

### Library / Framework Requirements

- Reuse Astro only.
- Do not add new runtime dependencies.

### Testing Requirements

- `corepack pnpm run build:public-site`
- `corepack pnpm run check:public-site`

### References

- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/analytical-product-definition-2026-03-30.md`
- `_bmad-output/implementation-artifacts/3-2-present-the-bounded-analytical-case-and-core-measures.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-03-30: Implemented a supporting demand view directly on the case-study route using approved public publication data.
- 2026-03-30: Used open demand by account pattern, product family, and current-month concentration to explain why the main inventory decision view is under pressure.
- 2026-03-30: Kept the support section explicitly subordinate to the primary supply-chain decision view.

### Completion Notes List

- The case-study route now includes one supporting analytical view focused on sales-side demand pressure.
- The support view shows open-demand concentration by account pattern and product family using text plus accessible proportional bars.
- The support view also points out the concentration of pressure in the current month so the reader can connect recent demand to the main inventory posture.
- The route still avoids fragmenting into a second independent dashboard product.

### File List

- `_bmad-output/implementation-artifacts/3-3-add-a-supporting-cross-functional-analytical-view.md`
- `apps/public-site/src/pages/case-study.astro`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-03-30: Implemented Story 3.3 and moved it to review.
- 2026-03-30: Review sweep completed with no findings; moved Story 3.3 to done.
