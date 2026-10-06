# Story 2.1: Establish the Public Site Shell and Navigation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor,
I want a lightweight public site with clear navigation across the core routes,
so that I can understand the experience without getting lost.

## Acceptance Criteria

1. Given the approved MVP route spine, when a visitor opens any core public route, then a shared site shell provides consistent navigation across the landing, case-study, technical-method, and contact routes.
2. Each route has a stable addressable URL and a documented single primary responsibility within the shared public experience.
3. The implementation remains static-first, keyboard-accessible, and light on client-side JavaScript.
4. The public site structure stays within the approved MVP scope rather than expanding into a broad multi-product platform.

## Tasks / Subtasks

- [x] Establish the shared static-first public shell. (AC: 1, 3, 4)
  - [x] Replace the Astro starter shell with a reusable layout that supports route title, description, and a bounded product identity.
  - [x] Keep the implementation server-rendered and free of client-side navigation behavior.

- [x] Add the approved route spine with consistent navigation. (AC: 1, 2, 3)
  - [x] Add route files for landing, case study, technical method, and contact.
  - [x] Add one shared navigation pattern that appears across all core routes.
  - [x] Keep the navigation keyboard-accessible and visually consistent across breakpoints.

- [x] Document route responsibilities within the shared experience. (AC: 2, 4)
  - [x] Give each route a visible route-level purpose statement.
  - [x] Keep the shell explicit that this is one bounded case study, not a broad product catalog.

- [x] Verify the shell remains within the lightweight baseline. (AC: 3)
  - [x] Validate Astro build output.
  - [x] Validate Astro check output.

## Dev Notes

- Epic 1 already locked the governed publication contract, candidate/current rules, and public data mirror. Story 2.1 should consume that stable foundation without adding new runtime data dependencies or app-like behavior.
- The architecture and UX spec both call for a small explicit route spine: landing, case study, technical method, and contact.
- This story is about shell and navigation only. The deeper landing narrative, case-study content, technical evidence, and legal/privacy details belong to later Epic 2 stories.

### Project Structure Notes

- Route files belong under `apps/public-site/src/pages/`.
- Shared shell and navigation belong under `apps/public-site/src/layouts/` and `apps/public-site/src/components/navigation/`.
- Keep route ownership obvious and avoid inventing extra public sections in this story.

### Technical Requirements

- Static-first Astro pages only.
- No client-side router, island navigation, or app-shell behavior.
- Navigation must remain usable by keyboard and readable on mobile.
- Each route should expose a title and route-purpose framing.

### Architecture Compliance

- Respect the bounded route spine defined in the architecture.
- Keep `apps/public-site/` as the public delivery layer only.
- Do not mix governed publication logic into the shell implementation.

### Library / Framework Requirements

- Reuse Astro only.
- Do not add new runtime dependencies.

### Testing Requirements

- `corepack pnpm run build:public-site`
- `corepack pnpm run check:public-site`

### Previous Story Intelligence

- Story 1.4 established the approved sync from governed publication package to the Astro data mirror.
- Story 1.6 locked the verification baseline, so this story should follow the documented build/check flow.

### References

- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/prd.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created and implemented after Epic 1 closed as done.
- Replaced the Astro starter with a shared public shell and route spine aligned to the approved MVP scope.
- Added shared navigation and route-purpose framing across landing, case study, technical method, and contact.

### Completion Notes List

- The public site now has a shared shell and visible navigation across the four core routes.
- Each route has a stable URL and a single stated responsibility within the shared public experience.
- The implementation stays static-first with no client-side navigation layer.
- Navigation active-state handling now normalizes trailing slashes, so `aria-current="page"` works correctly on the interior routes after static build.

### File List

- `_bmad-output/implementation-artifacts/2-1-establish-the-public-site-shell-and-navigation.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-03-29: Created and implemented Story 2.1, then moved it to review.
- 2026-03-29: Closed the lightweight review finding by normalizing route matching in the shared navigation and marked Story 2.1 done.
