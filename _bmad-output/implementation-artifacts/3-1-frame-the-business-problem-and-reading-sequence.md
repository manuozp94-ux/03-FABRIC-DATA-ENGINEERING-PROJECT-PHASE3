# Story 3.1: Frame the Business Problem and Reading Sequence

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business-facing viewer,
I want the case-study page to explain the operating tension and intended reading order,
so that I understand why the analytical story matters before I inspect technical detail.

## Acceptance Criteria

1. Given the case-study route exists, when a visitor enters the main case-study page, then the page explains the primary business problem addressed by the case study using non-specialist language and without assuming Fabric-specific vocabulary.
2. The page names at least two competing team incentives or operating pressures within the modeled scenario.
3. The page communicates the intended reading sequence of business tension first, analytical clarification second, and technical credibility third.
4. The page identifies which parts of the broader business environment are intentionally excluded from the MVP.

## Tasks / Subtasks

- [x] Strengthen the case-study opening around one explicit operating tension. (AC: 1, 2)
  - [x] Rewrite the top-of-page framing so the business problem is immediately legible to non-technical readers.
  - [x] Name at least two competing pressures directly, with language tied to sales, supply chain, logistics, or inventory planning.

- [x] Make the reading sequence more explicit in the case-study route. (AC: 3)
  - [x] Clarify that the route should be read as business problem first, analytical clarification second, and technical credibility third.
  - [x] Keep the reading sequence visible without over-explaining the site itself.

- [x] Define the MVP boundary in business terms. (AC: 4)
  - [x] State what the public case does cover.
  - [x] State what it does not attempt to model in Phase 1, so the audience does not assume enterprise-wide scope.

- [x] Keep the route aligned to the shared Epic 2 shell and current editorial direction.
  - [x] Preserve the current sober, business-first tone.
  - [x] Avoid reverting into Fabric-first or manifesto-style copy.

- [x] Verify the route through the approved baseline commands.
  - [x] Validate Astro build output.
  - [x] Validate Astro check output.

## Dev Notes

- Story 3.1 deepens the business framing already introduced in Story 2.3. It should not yet add the main measures or the primary analytical visualization from Story 3.2.
- The best outcome for this story is that a business-facing reader can explain the operating problem in plain language within the first few minutes.
- The page should sound like a senior analyst with operational context, not like a product manifesto and not like a Fabric marketing page.

### Project Structure Notes

- Keep the work centered in `apps/public-site/src/pages/case-study.astro`.
- Reuse the shared shell in `apps/public-site/src/layouts/Layout.astro`.
- Read only from the approved public mirror under `apps/public-site/src/data/publication/current`.

### Technical Requirements

- Static-first Astro page only.
- Maintain a single primary `h1` on the route.
- Keep the business framing readable without JavaScript and without requiring the technical-method route to make sense of the case.
- Preserve responsive reading order and avoid adding dashboard-like complexity in this story.

### Architecture Compliance

- The canonical use case remains commercial demand to multi-site inventory readiness.
- The business value is decision clarification across sales, supply chain, and logistics, not full operational automation.
- The case-study route remains the primary business-proof route in the public experience.

### Library / Framework Requirements

- Reuse Astro only.
- Do not add new runtime dependencies.

### Testing Requirements

- `corepack pnpm run build:public-site`
- `corepack pnpm run check:public-site`

### Previous Story Intelligence

- Story 2.3 already established the case-study route, portrait block, and first-pass business framing.
- Story 2.4 established the technical-method route as the place for deeper implementation detail.
- Story 2.5 completed the minimum public support pages, so Story 3.1 can now focus on the analytical story rather than route completeness.

### Story-Specific Guidance

- Pull the core tension from the PRD and architecture rather than inventing a new scenario.
- The two safest competing incentives already supported by the planning artifacts are:
  - sales pursuing the highest grossing outcome possible
  - supply chain pursuing the lowest practical inventory value possible
- A third supporting pressure can come from logistics through stable and fast lead time expectations, but the page does not need to solve every cross-functional nuance in this story.
- The excluded scope should stay concrete and business-readable. Good exclusions for this story include full enterprise planning, supplier negotiations, financial close logic, and every exception path outside the bounded slice.
- The broader product thesis is now supply-chain decision support first, with sales and logistics as supporting perspectives.

### References

- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/analytical-product-definition-2026-03-30.md`
- `_bmad-output/implementation-artifacts/2-3-publish-the-dedicated-case-study-route-entry.md`
- `_bmad-output/implementation-artifacts/2-4-publish-the-technical-method-route-entry.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-03-30: Created Story 3.1 from Epic 3 requirements plus current case-study state and recent editorial direction.
- 2026-03-30: Updated the case-study route to frame team tension around sales, supply chain, and logistics using business-facing KPI language.
- 2026-03-30: Reframed the MVP boundary as present scope plus future analytical expansion rather than as a hard exclusion dump.

### Completion Notes List

- The case-study route now names three competing team priorities directly: grossing pressure in sales, inventory-value pressure in supply chain, and lead-time stability in logistics.
- The reading sequence is now stated more explicitly as business tension first, analytical clarification second, and technical credibility third.
- The page now describes current analytical scope and later expansion paths in business terms, setting up Story 3.2 without pretending that the first release covers every downstream KPI.

### File List

- `_bmad-output/implementation-artifacts/3-1-frame-the-business-problem-and-reading-sequence.md`
- `apps/public-site/src/pages/case-study.astro`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-03-30: Created Story 3.1 and moved it to ready-for-dev.
- 2026-03-30: Implemented Story 3.1 and moved it to review.
- 2026-03-30: Review sweep completed with no findings; moved Story 3.1 to done.
