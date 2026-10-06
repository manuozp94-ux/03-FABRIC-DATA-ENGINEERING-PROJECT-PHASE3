# Story 2.2: Publish the Landing Page Orientation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor,
I want a landing page that explains the project and its promise quickly,
so that I can decide whether to explore the case study further.

## Acceptance Criteria

1. Given the public site shell is available, when a visitor lands on the home route, then the page presents a visible headline and supporting introduction that state the project purpose, core case-study promise, and intended audiences.
2. The landing page provides at least one visible navigation or call-to-action link into each of the case study, technical method, and contact journeys.
3. The page includes a route title, one primary `h1`, a meta description, and a responsive layout that preserves reading order without horizontal scrolling at standard mobile width.
4. The landing page states that the product is one bounded public case study rather than a generic portfolio index.

## Tasks / Subtasks

- [x] Replace the placeholder landing copy with a real orientation layer. (AC: 1, 4)
  - [x] Publish a clearer landing headline and supporting introduction for mixed business and technical audiences.
  - [x] State the bounded case-study promise explicitly instead of leaving the landing page as a shell-only placeholder.

- [x] Add visible next-step paths from the landing route. (AC: 2)
  - [x] Add visible calls to action for case study, technical method, and contact.
  - [x] Keep the landing route aligned to the shared navigation rather than inventing extra destinations.

- [x] Keep the landing route lightweight and readable. (AC: 3)
  - [x] Preserve the shared metadata, single primary `h1`, and static-first delivery.
  - [x] Keep the layout responsive and verify no horizontal-scroll regression at standard mobile width.

- [x] Verify the route through the approved baseline commands. (AC: 3)
  - [x] Validate Astro build output.
  - [x] Validate Astro check output.

## Dev Notes

- Epic 2 is the public entry experience epic. It turns the governed proof work from Epic 1 into a readable public surface without becoming a broad marketing site or a generic portfolio index.
- Story 2.1 already created the shared shell, route spine, and navigation. Story 2.2 should deepen only the landing route, not expand the route map.
- The landing page needs to work for mixed audiences: hiring teams, technical reviewers, and consulting conversations.

### Project Structure Notes

- Keep the landing route in `apps/public-site/src/pages/index.astro`.
- Reuse the existing shared shell in `apps/public-site/src/layouts/Layout.astro`.
- Avoid introducing client-side frameworks, data fetching, or route-level complexity for this story.

### Technical Requirements

- Static-first Astro page only.
- Maintain a single primary `h1` on the route.
- Keep CTA links visible and semantic.
- Preserve reading order and responsive behavior.

### Architecture Compliance

- Keep the public route spine explicit and small.
- Treat the landing route as orientation, not as the main analytical proof surface.
- Do not turn the landing page into a generic portfolio hub.

### Library / Framework Requirements

- Reuse Astro only.
- Do not add new runtime dependencies.

### Testing Requirements

- `corepack pnpm run build:public-site`
- `corepack pnpm run check:public-site`

### Previous Story Intelligence

- Story 2.1 established the shared shell, navigation, and route ownership.
- Story 1.6 locked the verification baseline, so Story 2.2 should stay inside the same build/check path.

### References

- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/prd.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Started from the shared shell built in Story 2.1 and replaced the landing placeholder with a real orientation layer.
- Kept the page static-first and routed all visible next steps back into the approved Epic 2 route spine.
- Preserved the one-case-study positioning so the route reads like an entry surface, not a portfolio index.

### Completion Notes List

- The landing route now states the project purpose, bounded case-study promise, and intended audiences directly on the page.
- The page now exposes visible next-step links into the case study, technical method, and contact journeys.
- The landing route now explains the intended reading sequence and explicitly says the product is one bounded public case study.
- The implementation remains inside the Astro static-first shell with no extra runtime dependencies.

### File List

- `_bmad-output/implementation-artifacts/2-2-publish-the-landing-page-orientation.md`
- `apps/public-site/src/pages/index.astro`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-03-29: Created and implemented Story 2.2, then moved it to review.
- 2026-03-29: Completed lightweight code review with no findings and closed the story.
