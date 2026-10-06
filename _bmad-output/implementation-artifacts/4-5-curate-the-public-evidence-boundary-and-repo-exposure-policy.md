# Story 4.5: Curate the Public Evidence Boundary and Repo Exposure Policy

Status: done

## Story

As a technical evaluator and product owner,
I want the public technical evidence and repo-visible assets curated through an explicit boundary policy,
so that the project proves rigor without exposing the full internal operating system or private delivery leverage.

## Acceptance Criteria

1. Given technical proof assets, documentation, or code-adjacent artifacts are prepared for public release, when the public evidence bundle is assembled, then each artifact is classified as public-proof, public-safe operational, or private-only before publication.
2. Only approved public-proof and public-safe operational artifacts are exposed on the public surface or in any public repo-visible package.
3. Reusable internal playbooks, client-delivery assets, sensitive mappings, private-preparation materials, and internal-only heuristics remain excluded from public publication.
4. The public explanation identifies which asset classes are intentionally excluded from publication and why they remain outside the public delivery system.

## Tasks / Subtasks

- [x] Create a canonical public-evidence boundary policy. (AC: 1, 2, 3)
  - [x] Define the three policy classes: public-proof, public-safe operational, and private-only.
  - [x] Define allowed exposure behavior for each class.
  - [x] Name explicitly excluded asset classes.

- [x] Surface the policy on the public technical-method route. (AC: 1, 2, 4)
  - [x] Add a bounded explanation of the three policy classes.
  - [x] Add explicit excluded asset classes and their reasons.
  - [x] Keep the explanation route-native and public-readable.

- [x] Keep the policy aligned with the MVP boundary. (AC: 2, 3, 4)
  - [x] Make clear that operational context can be repo-visible without becoming the public product.
  - [x] Keep private-only materials outside the public route and outside public-proof packages.

- [x] Verify the route through the approved baseline commands.
  - [x] Validate Astro build output.
  - [x] Validate Astro check output.

## Dev Notes

- Story 4.5 should make the evidence boundary explicit, not just implied by the route structure.
- The policy should help explain why some safe operational assets are repo-visible while still remaining subordinate to the public case.
- The public explanation should stay compact and should not list every file in the repo.

### Project Structure Notes

- Keep the web implementation centered in `apps/public-site/src/pages/technical-method.astro`.
- Store the canonical policy in `docs/automation/public-evidence-boundary-policy.md`.
- Do not create a separate policy microsite or additional public route.

### Technical Requirements

- Static-first Astro page only.
- Keep the policy summary readable without JavaScript.
- Use policy classes, not ad hoc one-off labels.

### Architecture Compliance

- The public boundary must remain consistent with the contract-first and approved-package posture.
- Repo-visible operational materials may support trust but should not replace the public product.
- Private-only classes must be explicitly protected from public exposure.

### Library / Framework Requirements

- Reuse Astro only.
- Do not add new runtime dependencies.

### Testing Requirements

- `corepack pnpm run build:public-site`
- `corepack pnpm run check:public-site`

### References

- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `docs/automation/public-evidence-boundary-policy.md`
- `apps/public-site/src/pages/technical-method.astro`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-03-30: Added a canonical public-evidence boundary policy under `docs/automation`.
- 2026-03-30: Added a public-facing evidence-boundary section to the technical-method route.
- 2026-03-30: Added explicit excluded asset classes and reasons they remain outside the public delivery system.
- 2026-03-30: Re-ran `build:public-site` and `check:public-site`; both passed cleanly during close-out review.

### Completion Notes List

- The project now has an explicit policy for what counts as public-proof, public-safe operational, and private-only.
- The technical-method route now explains the evidence boundary instead of leaving it implicit.
- Explicit excluded asset classes are now named and justified on the public surface.

### File List

- `docs/automation/public-evidence-boundary-policy.md`
- `_bmad-output/implementation-artifacts/4-5-curate-the-public-evidence-boundary-and-repo-exposure-policy.md`
- `apps/public-site/src/pages/technical-method.astro`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-03-30: Implemented Story 4.5 and moved it to review.
- 2026-03-30: Closed Story 4.5 after clean verification and bounded review.
