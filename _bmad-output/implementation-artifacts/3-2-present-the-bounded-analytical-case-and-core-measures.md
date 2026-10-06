# Story 3.2: Present the Bounded Analytical Case and Core Measures

Status: done

## Story

As a business-facing viewer,
I want the main analytical slice presented through one bounded supply-chain decision view,
so that I can understand whether inventory posture, service expectations, and demand pressure are aligned without reading the case as a pseudo-ERP or full planning suite.

## Acceptance Criteria

1. Given the business framing is established, when a visitor reviews the main analytical content, then one bounded primary analytical view focused on supply-chain inventory decisions is presented.
2. The page names the core measures, dimensional context, policy assumptions, and reporting window used by the case.
3. The primary view clearly identifies a bounded KPI set that includes inventory coverage, service readiness, inventory value exposure, and recommended action status.
4. The primary view clearly identifies a bounded public policy set that includes inventory policy class, target service-level band, coverage target band, lead-time band, and location role.
5. The accompanying narrative explicitly connects at least one demand signal, one inventory or service-readiness indicator, and the business implication of that relationship within the modeled slice.
6. The presentation stays within the approved MVP slice, avoids turning into a broad multi-dashboard platform, and explicitly reads as a decision-support layer rather than as a replacement transaction or planning system.

## Tasks / Subtasks

- [x] Define the primary decision-view contract on the case-study route. (AC: 1, 2, 6)
  - [x] State the viewer question the main object answers.
  - [x] Keep the narrative supply-chain centered.
  - [x] Add a short non-replacement positioning note so the view does not overclaim.

- [x] Publish the bounded KPI set in business-readable language. (AC: 2, 3)
  - [x] Introduce inventory coverage.
  - [x] Introduce service readiness.
  - [x] Introduce inventory value exposure.
  - [x] Introduce recommended action status.
  - [x] Show the reporting window used by the case.

- [x] Publish the bounded public policy set that explains how the view should be read. (AC: 2, 4)
  - [x] Introduce inventory policy class.
  - [x] Introduce target service-level band.
  - [x] Introduce coverage target band.
  - [x] Introduce lead-time band.
  - [x] Introduce location role.

- [x] Connect the metrics to one clear business implication. (AC: 5)
  - [x] Use at least one demand signal already available in the publication package.
  - [x] Connect that signal to inventory posture and service consequence.
  - [x] Keep the explanation readable for non-specialist business viewers.

- [x] Preserve MVP boundaries for later stories. (AC: 6)
  - [x] Keep detailed sales-demand drilldowns out of this story.
  - [x] Keep transfer classification and logistics-execution detail out of this story.
  - [x] Leave supporting cross-functional views for Story 3.3.

- [x] Verify the route through the approved baseline commands.
  - [x] Validate Astro build output.
  - [x] Validate Astro check output.

## Dev Notes

- Story 3.2 is the first true analytical center of Epic 3. It should prove one inventory decision view, not a family of dashboards.
- The product thesis is now stable: primary analytical value lives in supply chain; sales provides demand signal; logistics constrains execution.
- The goal of this story is clarity, not simulation depth.

### Project Structure Notes

- Keep the work centered in `apps/public-site/src/pages/case-study.astro`.
- Read only from the approved public mirror under `apps/public-site/src/data/publication/current`.
- Do not introduce a second route or separate dashboard surface in this story.

### Technical Requirements

- Static-first Astro page only.
- Maintain a single primary `h1` on the route.
- Preserve responsive reading order and avoid heavy client-side behavior.
- The analytical object may be rendered as a structured narrative, a bounded visual block, or a hybrid, but it must remain readable without JavaScript.

### Architecture Compliance

- Treat the view as a decision-support layer, not as an ERP replacement and not as a full planning engine.
- The main question remains whether inventory posture is aligned with expected demand and target service conditions.
- Supporting demand and logistics views remain subordinate and are deferred to Story 3.3.

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
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-03-30.md`
- `_bmad-output/implementation-artifacts/3-1-frame-the-business-problem-and-reading-sequence.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-03-30: Implemented the first bounded decision view directly in the case-study route using the approved public publication mirror.
- 2026-03-30: Converted the route from high-level framing only into a concrete analytical read with KPI cards, public policy assumptions, and a short current action queue.
- 2026-03-30: Kept the view explicitly positioned as decision support rather than as a replacement ERP or planning suite.

### Completion Notes List

- The case-study route now names a bounded KPI set that includes reporting window, open demand signal, inventory coverage, service readiness, inventory exposure, and recommended action status.
- The route now includes a synthetic but explicit public policy foundation: inventory policy class, target service-level band, coverage target band, lead-time band, and location role.
- The latest snapshot is translated into a short action queue so the main view reads like a supply-chain decision surface rather than a generic narrative page.
- Supporting sales and logistics drilldowns remain deferred to Story 3.3.
- Review follow-up corrections made the main KPI and policy language more defensible by removing a pseudo-days-of-coverage claim, aligning exposure commentary to open demand, and labeling derived reading rules clearly.

### File List

- `_bmad-output/implementation-artifacts/3-2-present-the-bounded-analytical-case-and-core-measures.md`
- `apps/public-site/src/pages/case-study.astro`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-03-30: Created Story 3.2 and moved it to ready-for-dev.
- 2026-03-30: Implemented Story 3.2 and moved it to review.
- 2026-03-30: Addressed review findings and moved Story 3.2 to done.
