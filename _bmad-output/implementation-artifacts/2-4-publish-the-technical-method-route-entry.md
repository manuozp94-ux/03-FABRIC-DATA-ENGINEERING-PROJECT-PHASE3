# Story 2.4: Publish the Technical-Method Route Entry

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a technical evaluator,
I want a dedicated technical-method route within the same public experience,
so that I can find engineering proof without losing the shared product flow.

## Acceptance Criteria

1. Given the public route spine exists, when a visitor opens the technical-method route, then the route includes a route-level title or opening section that presents it as the location for implementation and analytical-method proof.
2. The route is directly addressable from navigation and through a shareable public URL.
3. The page layout uses the shared SEO and accessibility baseline without requiring app-like client-side navigation.
4. The route states that its proof surface is a bounded Phase 1 evidence experience rather than a full documentation or certification portal.
5. The route preserves the shared experience instead of feeling like a separate disconnected product.

## Tasks / Subtasks

- [x] Replace the technical-method placeholder with a real route entry. (AC: 1, 4, 5)
  - [x] Add an opening section that explains what kind of technical proof belongs here.
  - [x] Keep the route grounded in method and evidence rather than turning it into a documentation dump.

- [x] Add bounded evidence summaries from the approved public package. (AC: 1, 4)
  - [x] Show current publication package scope and freshness at a glance.
  - [x] Explain the public/private boundary, validation discipline, and candidate/current separation in plain language.

- [x] Keep the route consistent with the shared public shell. (AC: 2, 3, 5)
  - [x] Preserve shared navigation, route metadata, and responsive behavior.
  - [x] Keep the route directly shareable and coherent across mobile and desktop layouts.

- [x] Verify the route through the approved baseline commands. (AC: 3)
  - [x] Validate Astro build output.
  - [x] Validate Astro check output.

## Dev Notes

- Story 2.4 should make the technical-method route useful as a first-stop validation layer for technical reviewers, but it should not attempt to expose every internal process artifact.
- The route should explain what is included, what is intentionally excluded, and why the public version remains bounded.
- The route should feel connected to the case-study route rather than like a separate documentation product.

### Project Structure Notes

- Keep the route in `apps/public-site/src/pages/technical-method.astro`.
- Reuse the shared shell in `apps/public-site/src/layouts/Layout.astro`.
- Use approved publication-safe inputs only from `apps/public-site/src/data/publication/current`.

### Technical Requirements

- Static-first Astro page only.
- Maintain a single primary `h1` on the route.
- Keep all evidence-entry sections readable without JavaScript.
- Preserve semantic headings, readable panels, and clear next-step links.

### Architecture Compliance

- The technical-method route is the bounded engineering proof layer inside the same public experience.
- The route must not drift into a full documentation portal or certification site.
- The route should reinforce the case-study narrative rather than compete with it.

### Library / Framework Requirements

- Reuse Astro only.
- Do not add new runtime dependencies.

### Testing Requirements

- `corepack pnpm run build:public-site`
- `corepack pnpm run check:public-site`

### Previous Story Intelligence

- Story 2.1 established the shell and route spine.
- Story 2.3 established the case-study route as the main proof entry.
- Stories 1.4, 1.5, and 1.6 established the governed publication, candidate, and validation baseline this route now summarizes.

### References

- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/prd.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Replaced the placeholder technical-method page with a route entry that explains the public method layer without pretending to be a full docs portal.
- Added bounded evidence summaries tied to the approved public package so the route can support technical review immediately.
- Kept the page in the same shared experience and voice as the landing and case-study routes.

### Completion Notes List

- The technical-method route now identifies itself as the location for implementation and publication-method proof.
- The page now explains the current public package, validation discipline, and public/private boundary in a compact way.
- The route now states clearly what is included in Phase 1 and what remains intentionally outside the public surface.
- The implementation remains static-first and consistent with the shared site shell.

### File List

- `_bmad-output/implementation-artifacts/2-4-publish-the-technical-method-route-entry.md`
- `apps/public-site/src/pages/technical-method.astro`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-03-30: Created and implemented Story 2.4, then moved it to review.
- 2026-03-30: Completed lightweight code review with no findings and closed the story.
