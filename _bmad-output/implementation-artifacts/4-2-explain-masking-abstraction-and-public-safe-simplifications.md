# Story 4.2: Explain Masking, Abstraction, and Public-Safe Simplifications

Status: done

## Story

As a technical evaluator,
I want to understand what was masked, abstracted, or synthesized,
so that I can judge credibility without confusing the public model for raw enterprise data.

## Acceptance Criteria

1. Given the technical-method page is available, when a visitor reviews publication-safety design choices, then the masking and abstraction approach used by the product is described with named treatment categories and at least one concrete example of how a raw element becomes public-safe.
2. The page distinguishes public, masked, synthetic, aggregated, omitted, and private-only elements where relevant.
3. The explanation includes a labeled list of which parts of the solution were intentionally simplified for public publication and why.
4. No re-identifiable business labels, unsafe raw examples, or disallowed commercial data details are exposed on the public surface.

## Tasks / Subtasks

- [x] Add named treatment categories to the technical-method route. (AC: 1, 2)
  - [x] Describe public, masked, synthetic, aggregated, omitted, and private-only treatment types.
  - [x] Keep the descriptions grounded in the current approved package rather than in generic theory only.

- [x] Publish concrete public-safe examples. (AC: 1, 4)
  - [x] Show how account, location, or product elements appear after treatment.
  - [x] Use only public-safe forms rather than exposing original enterprise labels.

- [x] Explain intentional simplifications. (AC: 3)
  - [x] List the main public-safe simplifications used in the MVP.
  - [x] Clarify why those simplifications exist and what they protect.

- [x] Keep the route bounded and safe.
  - [x] Avoid exposing raw identifiers, sensitive source names, or internal-only business context.
  - [x] Keep the explanation readable for technical evaluators without turning into a policy dump.

- [x] Verify the route through the approved baseline commands.
  - [x] Validate Astro build output.
  - [x] Validate Astro check output.

## Dev Notes

- Story 4.2 should deepen the technical-method route without changing the product thesis.
- The goal is to show that publication safety is a structured abstraction discipline, not a superficial rename pass.
- The route must explain transformation behavior clearly while staying firmly inside the public boundary.

### Project Structure Notes

- Keep the work centered in `apps/public-site/src/pages/technical-method.astro`.
- Use only approved public mirror data under `apps/public-site/src/data/publication/current`.
- Do not publish raw before/after examples that expose re-identifiable source labels.

### Technical Requirements

- Static-first Astro page only.
- Use bounded narrative panels or lists that remain readable without JavaScript.
- Keep examples concrete enough to be credible without revealing forbidden details.

### Architecture Compliance

- Public-safe abstraction should be explained as preserving business behavior, not enterprise identity.
- The page must distinguish what is published directly from what is synthetic, grouped, omitted, or kept private-only.
- No part of the route should imply direct access to raw enterprise data or private prep assets.

### Library / Framework Requirements

- Reuse Astro only.
- Do not add new runtime dependencies.

### Testing Requirements

- `corepack pnpm run build:public-site`
- `corepack pnpm run check:public-site`

### References

- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/masking-abstraction-framework-2026-03-25.md`
- `apps/public-site/src/pages/technical-method.astro`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-03-30: Added named treatment categories to the technical-method route covering public, masked, synthetic, aggregated, omitted, and private-only handling.
- 2026-03-30: Added concrete public-safe examples showing how identity-bearing elements appear after abstraction.
- 2026-03-30: Added an explicit list of public-safe simplifications used by the MVP.

### Completion Notes List

- The technical-method route now explains publication safety with named treatment categories rather than one generic masking label.
- The page now includes concrete public-safe examples for transformed account, location, and product elements.
- The page now states the main simplifications used to make the public release safe and legible.
- The explanation stays inside the approved boundary and avoids exposing raw enterprise labels or unsafe detail.

### File List

- `_bmad-output/implementation-artifacts/4-2-explain-masking-abstraction-and-public-safe-simplifications.md`
- `apps/public-site/src/pages/technical-method.astro`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-03-30: Implemented Story 4.2 and moved it to review.
- 2026-03-30: Review sweep completed with no findings; moved Story 4.2 to done.
