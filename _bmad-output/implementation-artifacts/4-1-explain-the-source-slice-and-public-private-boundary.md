# Story 4.1: Explain the Source Slice and Public-Private Boundary

Status: done

## Story

As a technical evaluator,
I want to see what source slice is in scope and how private preparation differs from public analytics,
so that I can assess whether the case is disciplined and bounded.

## Acceptance Criteria

1. Given the technical-method route exists, when a technical evaluator reviews the solution context, then the page identifies the bounded source families included in the case-study slice.
2. The page states the difference between private preparation, governed analytics, and public delivery as separate zones with distinct responsibilities.
3. The explanation clarifies that private preparation materials do not cross directly into the public surface.
4. The page preserves the approved MVP scope rather than implying hidden broader enterprise coverage.

## Tasks / Subtasks

- [x] Identify the bounded source slice on the technical-method route. (AC: 1, 4)
  - [x] Name the source domains that support the current case-study slice.
  - [x] Keep the explanation tied to the approved public package rather than to private internal archives.
  - [x] Clarify that the slice is sufficient for the current case without implying complete enterprise coverage.

- [x] Publish the three-zone boundary clearly. (AC: 2, 3)
  - [x] Explain private preparation as distinct from governed analytics.
  - [x] Explain governed analytics as distinct from public delivery.
  - [x] State explicitly that private preparation assets do not cross directly into the public site.

- [x] Keep the route aligned with the bounded technical-method posture.
  - [x] Preserve the current sober, explanatory tone.
  - [x] Avoid turning the route into a raw documentation dump.
  - [x] Keep the evidence subordinate to the shared public experience.

- [x] Verify the route through the approved baseline commands.
  - [x] Validate Astro build output.
  - [x] Validate Astro check output.

## Dev Notes

- Story 4.1 is the first concrete step of Epic 4. It should make the technical boundary legible before later stories go deeper into masking, grain, and evidence bundles.
- The route should explain the source slice and zone separation without exposing private reconstruction assets or pretending the public package covers the whole operating environment.
- The best outcome is that a technical evaluator can quickly understand what data domains are in scope and how they move through the public-safe boundary.

### Project Structure Notes

- Keep the work centered in `apps/public-site/src/pages/technical-method.astro`.
- Read only from the approved public mirror under `apps/public-site/src/data/publication/current`.
- Do not expose private-preparation paths, internal heuristics, or raw source identifiers on the public route.

### Technical Requirements

- Static-first Astro page only.
- Keep the explanation readable without JavaScript.
- Use bounded narrative panels rather than raw schema dumps in this story.

### Architecture Compliance

- Preserve the three-zone model: private preparation, governed analytics, and public delivery.
- Keep the source explanation bounded to the approved analytical slice that supports the current case study.
- Do not imply that the website reads directly from private prep materials or from unapproved candidate outputs.

### Library / Framework Requirements

- Reuse Astro only.
- Do not add new runtime dependencies.

### Testing Requirements

- `corepack pnpm run build:public-site`
- `corepack pnpm run check:public-site`

### References

- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/power-bi-fabric-proof-reentry-plan-2026-03-30.md`
- `apps/public-site/src/pages/technical-method.astro`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-03-30: Added an approved-source-slice section to the technical-method route using the currently mirrored public package.
- 2026-03-30: Added an explicit three-zone boundary explanation covering private preparation, governed analytics, and public delivery.
- 2026-03-30: Kept the route bounded so it explains method and scope without exposing internal reconstruction work.

### Completion Notes List

- The technical-method route now names the bounded source domains supporting the current case-study slice.
- The route now explains the three-zone architecture in public-readable language.
- The route explicitly states that private preparation assets do not cross directly into the public site.
- The route stays within current MVP scope rather than implying hidden broader enterprise coverage.
- Review follow-up corrections now derive refresh timing from the full approved package and derive the source-slice entries from the mirrored tables instead of relying on a rigid hand-curated list.

### File List

- `_bmad-output/implementation-artifacts/4-1-explain-the-source-slice-and-public-private-boundary.md`
- `apps/public-site/src/pages/technical-method.astro`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-03-30: Implemented Story 4.1 and moved it to review.
- 2026-03-30: Addressed review findings and moved Story 4.1 to done.
