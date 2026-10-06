# Story 4.3: Show Modeled Entities, Grain, and Business-Question Mapping

Status: done

## Story

As a technical evaluator,
I want to inspect the main entities, grain, and mapping from business questions to outputs,
so that I can understand the analytical design choices behind the case.

## Acceptance Criteria

1. Given the governed analytical package is available, when a technical evaluator reviews the model explanation, then the page states the core business grain, names the main modeled entities, and explains the modeling rationale behind the analytical slice.
2. The explanation shows how the main business questions map to published measures, modeled entities, or final analytical outputs.
3. The presentation references the bounded contract-first model rather than ad hoc undocumented transformations.
4. The explanation is delivered as one bounded section or table set that can be reviewed without leaving the shared public experience.

## Tasks / Subtasks

- [x] Explain the core grain used by the public model. (AC: 1, 3)
  - [x] State the two primary fact grains clearly.
  - [x] Explain why the dimensions exist around those grains.
  - [x] Keep the framing contract-first rather than runtime-join-first.

- [x] Name the main modeled entities and their roles. (AC: 1, 4)
  - [x] List the six published tables in one bounded section.
  - [x] Explain each entity’s grain and role in the case.

- [x] Map business questions to outputs. (AC: 2, 4)
  - [x] Connect the primary supply-chain decision question to the published outputs.
  - [x] Connect the supporting demand question to the published outputs.
  - [x] Connect freshness/trust context to the published outputs.

- [x] Keep the route bounded and readable.
  - [x] Avoid raw schema dumps or disconnected documentation sprawl.
  - [x] Keep the explanation inside the shared technical-method route.

- [x] Verify the route through the approved baseline commands.
  - [x] Validate Astro build output.
  - [x] Validate Astro check output.

## Dev Notes

- Story 4.3 should make the model legible enough that a technical evaluator understands what the public analytical slice is made of without opening the repo contracts first.
- The route should make clear that the website reflects a bounded contract-first model, not ad hoc transformation logic improvised in the UI.
- This story should still stay small and public-readable; the goal is comprehension, not full schema exhaustiveness.

### Project Structure Notes

- Keep the work centered in `apps/public-site/src/pages/technical-method.astro`.
- Reference only the approved public mirror under `apps/public-site/src/data/publication/current`.
- Do not turn this story into a raw schema explorer or repo tour.

### Technical Requirements

- Static-first Astro page only.
- Use bounded sections or panel sets that remain readable without JavaScript.
- Keep grain and entity explanations concise but explicit.

### Architecture Compliance

- The route must preserve the contract-first model posture.
- The explanation should align directly to the six-table approved analytical slice.
- The outputs referenced should be real outputs already published in the public experience.

### Library / Framework Requirements

- Reuse Astro only.
- Do not add new runtime dependencies.

### Testing Requirements

- `corepack pnpm run build:public-site`
- `corepack pnpm run check:public-site`

### References

- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/analytical-product-definition-2026-03-30.md`
- `apps/public-site/src/pages/technical-method.astro`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-03-30: Added a core-grain section to the technical-method route explaining the two fact grains and their supporting dimensions.
- 2026-03-30: Added a modeled-entities section naming the six published tables with their grain and analytical role.
- 2026-03-30: Added a business-question mapping section tying published outputs back to the entities and questions they answer.
- 2026-03-30: Re-ran `build:public-site` and `check:public-site`; both passed cleanly during close-out review.

### Completion Notes List

- The technical-method route now explains the core grain of the public model instead of only listing route-level evidence.
- The page now names the six modeled entities explicitly and explains why each one exists.
- The page now maps the main business questions to the real published outputs already visible on the site.
- The route stays bounded and readable without turning into a disconnected schema dump.

### File List

- `_bmad-output/implementation-artifacts/4-3-show-modeled-entities-grain-and-business-question-mapping.md`
- `apps/public-site/src/pages/technical-method.astro`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-03-30: Implemented Story 4.3 and moved it to review.
- 2026-03-30: Closed Story 4.3 after clean review and baseline verification.
