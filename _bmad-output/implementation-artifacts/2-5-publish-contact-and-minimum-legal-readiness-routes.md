# Story 2.5: Publish Contact and Minimum Legal-Readiness Routes

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a recruiter, hiring manager, or business prospect,
I want a clear next-step path with minimal privacy and usage notices,
so that I can reach out with confidence and understand how the site handles contact interactions.

## Acceptance Criteria

1. Given the public experience is live, when a visitor navigates to the contact path, then the route explains the kinds of professional conversations or engagements the project supports and offers at least one explicit next-step action.
2. The public site provides a minimal privacy and contact-handling notice appropriate to the approved launch scope.
3. The public site publishes a minimal terms or usage notice at a dedicated `/terms` route linked from the contact and privacy pages.
4. If a contact form is introduced in Phase 1, it routes to an owner-controlled inbox or approved managed service without creating a reusable custom contact database.

## Tasks / Subtasks

- [x] Replace the contact placeholder with a real next-step route. (AC: 1)
  - [x] Explain what kinds of conversations the route supports.
  - [x] Provide a direct, honest next-step action without inventing a new lead workflow.

- [x] Publish minimum legal-readiness support pages. (AC: 2, 3)
  - [x] Add a minimal privacy route with contact-handling language appropriate to the launch scope.
  - [x] Add a minimal terms route linked from the privacy and contact pages.

- [x] Keep the launch bounded and explicit. (AC: 4)
  - [x] State that Phase 1 does not use a public contact form or custom contact database.
  - [x] Keep the legal notices short and native to the same public shell.

- [x] Record deferred refinement work instead of over-polishing the copy too early.
  - [x] Add a backlog note for copy and visualization refinement after the analytical architecture is more complete.

- [x] Verify the route through the approved baseline commands.
  - [x] Validate Astro build output.
  - [x] Validate Astro check output.

## Dev Notes

- This story should finish the minimum public trust layer for Epic 2, not expand into full legal drafting or a CRM-like workflow.
- The public launch should remain honest about the contact boundary: simple professional outreach, minimal handling, no custom contact database.
- Because site voice is still being calibrated, template-grade copy is acceptable here as long as it is clear and professionally restrained.

### Project Structure Notes

- Keep the public routes in `apps/public-site/src/pages/contact.astro`, `apps/public-site/src/pages/privacy.astro`, and `apps/public-site/src/pages/terms.astro`.
- Reuse the shared shell in `apps/public-site/src/layouts/Layout.astro`.
- Treat the longer documents under `docs/client-enablement/` as supporting material, not launch-critical route copy.

### Technical Requirements

- Static-first Astro pages only.
- Maintain one primary `h1` per route through the shared layout.
- Keep all legal-readiness content readable without JavaScript.
- Keep route links explicit and keyboard-friendly.

### Architecture Compliance

- The contact route is part of the main public route spine.
- Privacy and terms are support pages, not separate products.
- The implementation must not introduce a public custom contact database in Phase 1.

### Library / Framework Requirements

- Reuse Astro only.
- Do not add new runtime dependencies.

### Testing Requirements

- `corepack pnpm run build:public-site`
- `corepack pnpm run check:public-site`

### Previous Story Intelligence

- Story 2.1 established the route spine and shared shell.
- Story 2.2 established the landing orientation.
- Story 2.4 established the technical-method route in the same public experience.

### References

- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `docs/public-site/copy-and-visual-refinement-backlog.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Replaced the contact placeholder with a route that explains supported conversations and keeps next steps simple.
- Added minimal privacy and terms routes linked from the support flow and footer.
- Recorded deferred copy and visualization refinement as explicit follow-up work rather than forcing final voice too early.

### Completion Notes List

- The contact route now supports recruiter, hiring, and consulting conversations with an explicit next-step action.
- The public site now includes a minimum privacy notice and a minimum terms route for launch readiness.
- The implementation remains bounded: no public form, no custom contact database, and no expansion into a broader lead workflow.
- A separate backlog now captures later copy and visualization refinement work.

### File List

- `_bmad-output/implementation-artifacts/2-5-publish-contact-and-minimum-legal-readiness-routes.md`
- `apps/public-site/src/pages/contact.astro`
- `apps/public-site/src/pages/privacy.astro`
- `apps/public-site/src/pages/terms.astro`
- `apps/public-site/src/layouts/Layout.astro`
- `docs/public-site/copy-and-visual-refinement-backlog.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-03-30: Created, implemented, lightly reviewed, and closed Story 2.5.
