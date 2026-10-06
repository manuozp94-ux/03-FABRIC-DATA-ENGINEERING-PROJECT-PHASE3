# Story 2.3: Publish the Dedicated Case-Study Route Entry

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor,
I want a dedicated case-study route that positions the main proof clearly,
so that I can access the core experience directly from navigation or a shared link.

## Acceptance Criteria

1. Given the landing page exists, when a visitor opens the case-study route directly or from site navigation, then the route includes a route-level title or opening section that identifies it as the main analytical proof surface for the MVP.
2. The page structure supports a business-first reading sequence that can later be enriched with analytical content.
3. The route is shareable, indexable, and usable across supported desktop and mobile layouts.
4. Navigation from the case-study route back to the landing, technical-method, and contact routes uses the same visible navigation pattern defined in the shared site shell.

## Tasks / Subtasks

- [x] Replace the case-study placeholder with a real route entry. (AC: 1, 2)
  - [x] Add an opening section that positions the route as the main analytical proof surface.
  - [x] Keep the route focused on business framing first rather than jumping straight into technical detail.

- [x] Add a business-first proof sequence that can deepen later. (AC: 2)
  - [x] Publish a clear reading ladder for how this route should be interpreted.
  - [x] Use bounded summary signals from the approved publication package without turning the page into the full analytical story too early.

- [x] Keep the route consistent with the shared public shell. (AC: 3, 4)
  - [x] Preserve shared navigation, route metadata, and responsive behavior.
  - [x] Ensure the route remains directly shareable and coherent on mobile and desktop.

- [x] Add the portrait block as a trust-building author cue. (AC: 1, 2)
  - [x] Place the portrait inside the case-study route without letting it overpower the proof narrative.
  - [x] Crop and frame the portrait to show the face clearly while staying visually native to the site shell.

- [x] Verify the route through the approved baseline commands. (AC: 3)
  - [x] Validate Astro build output.
  - [x] Validate Astro check output.

## Dev Notes

- Story 2.3 should turn the case-study route into the primary proof entry, but it should not yet deliver the full business problem narrative, core measures, or supporting cross-functional view from Epic 3.
- The route should feel useful as a direct link from LinkedIn, a resume, or a recruiter handoff.
- The shared public experience must stay consistent with Stories 2.1 and 2.2 rather than introducing a separate visual product.

### Project Structure Notes

- Keep the route in `apps/public-site/src/pages/case-study.astro`.
- Reuse the shared shell in `apps/public-site/src/layouts/Layout.astro`.
- Use approved publication-safe inputs only from `apps/public-site/src/data/publication/current`.

### Technical Requirements

- Static-first Astro page only.
- Maintain a single primary `h1` on the route.
- Keep all proof-entry sections readable without JavaScript.
- Preserve image accessibility with explicit alt text and a stable layout crop.

### Architecture Compliance

- The case-study route is the main proof surface in the public route spine.
- The route should support progressive proof rather than overload.
- The route must remain one bounded case-study entry, not a generalized portfolio landing.

### Library / Framework Requirements

- Reuse Astro only.
- Do not add new runtime dependencies.

### Testing Requirements

- `corepack pnpm run build:public-site`
- `corepack pnpm run check:public-site`

### Previous Story Intelligence

- Story 2.1 established the shell and route spine.
- Story 2.2 made the landing route legible and directional.
- Story 1.4 made the approved publication package available inside the public-site data mirror.

### References

- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/prd.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Replaced the placeholder case-study page with a route entry that explains why this route exists before the deeper analytical content is added.
- Added a published-proof snapshot derived from the approved public package to give the route immediate weight.
- Introduced a portrait block to humanize the route and make direct-link entry feel more credible for hiring and consulting audiences.

### Completion Notes List

- The case-study route now positions itself as the main analytical proof surface rather than a placeholder.
- The page now uses a business-first proof ladder that prepares readers for the deeper analytical story coming in Epic 3.
- The route now includes a portrait-based author cue framed as credibility support rather than portfolio decoration.
- Approved publication-safe data now contributes lightweight summary signals to the route entry.

### File List

- `_bmad-output/implementation-artifacts/2-3-publish-the-dedicated-case-study-route-entry.md`
- `apps/public-site/src/pages/case-study.astro`
- `apps/public-site/src/assets/profile/manuel-portrait.jpg`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-03-29: Created and implemented Story 2.3, then moved it to review.
- 2026-03-30: Completed lightweight code review with no findings and closed the story.
