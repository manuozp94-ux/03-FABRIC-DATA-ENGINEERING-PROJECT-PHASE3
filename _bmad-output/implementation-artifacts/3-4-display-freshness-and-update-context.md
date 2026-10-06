# Story 3.4: Display Freshness and Update Context

Status: done

## Story

As a visitor,
I want freshness metadata for the published analytical output,
so that I can judge how current and trustworthy the case is.

## Acceptance Criteria

1. Given the approved publication package includes refresh metadata, when a visitor reviews the case-study route, then the last successful refresh or reporting timestamp is displayed in a human-readable date or timestamp format derived from the governed source value.
2. Any needed freshness note or interpretation guidance is shown without implying real-time behavior.
3. The displayed freshness context matches the currently approved publication package.
4. Freshness information remains visible without truncating the timestamp label or value on supported desktop and mobile layouts.

## Tasks / Subtasks

- [x] Publish freshness metadata from the approved public package on the case-study route. (AC: 1, 3)
  - [x] Read the approved refresh timestamp from the mirrored public package.
  - [x] Show the latest published reporting date in a human-readable format.
  - [x] Avoid relying on live or candidate-only state for the public-facing read.

- [x] Add interpretation guidance that keeps the route honest about cadence. (AC: 2)
  - [x] State clearly that the route reflects approved release output rather than real-time operations.
  - [x] Clarify that candidate refreshes remain outside the public surface until approved.

- [x] Keep the section readable across supported layouts. (AC: 4)
  - [x] Render freshness details as regular content cards in the case-study flow.
  - [x] Preserve the timestamp and labels without truncation on desktop and mobile.

- [x] Verify the route through the approved baseline commands.
  - [x] Validate Astro build output.
  - [x] Validate Astro check output.

## Dev Notes

- Story 3.4 closes the trust loop for Epic 3 by telling the reader how current the published slice is and how to interpret that recency.
- The route should remain explicit that approved-package state is public, while candidate refreshes are a separate validation lane.
- This story is about trust and interpretation, not about exposing internal operational monitoring.

### Project Structure Notes

- Keep the work centered in `apps/public-site/src/pages/case-study.astro`.
- Read only from the approved public mirror under `apps/public-site/src/data/publication/current`.
- Use governed timestamps already present in the publication package.

### Technical Requirements

- Static-first Astro page only.
- Use human-readable timestamp formatting.
- Keep freshness cards readable without JavaScript and without depending on runtime fetches.

### Architecture Compliance

- Freshness must reflect the approved public mirror, not the candidate lane.
- The route must reinforce that the public case runs on a governed release cadence rather than a live operational feed.
- The section should support trust in the published slice without expanding the MVP into release-ops tooling.

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
- `_bmad-output/test-artifacts/fabric-candidate/candidate-refresh-report.json`
- `apps/public-site/src/pages/case-study.astro`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-03-30: Added a freshness-and-update section to the case-study route using approved-package timestamps and published reporting dates.
- 2026-03-30: Made the route explicit that candidate refreshes remain outside the public surface until approved.
- 2026-03-30: Kept freshness visible as regular route content rather than as a hidden footnote or runtime-only signal.

### Completion Notes List

- The case-study route now displays the last approved refresh timestamp in human-readable form.
- The route also shows the latest published reporting date and a clear interpretation note about approved-package cadence.
- Freshness context is derived from the mirrored public package and does not imply real-time operational behavior.

### File List

- `_bmad-output/implementation-artifacts/3-4-display-freshness-and-update-context.md`
- `apps/public-site/src/pages/case-study.astro`

### Change Log

- 2026-03-30: Implemented Story 3.4 and moved it to review.
- 2026-03-30: Review sweep completed with no findings; moved Story 3.4 to done.
