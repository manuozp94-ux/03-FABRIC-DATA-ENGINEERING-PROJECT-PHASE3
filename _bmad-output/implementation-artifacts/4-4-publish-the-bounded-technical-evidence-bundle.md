# Story 4.4: Publish the Bounded Technical Evidence Bundle

Status: done

## Story

As a technical evaluator,
I want a compact evidence bundle with architecture, validation, release, and learning references,
so that I can confirm the solution reflects real Fabric-oriented analytical discipline.

## Acceptance Criteria

1. Given the technical-method route is populated, when a technical evaluator reviews supporting proof, then the public experience exposes a minimum technical evidence bundle including an architecture summary, a model or lineage-oriented view, a grain or schema summary, a validation summary, and release or version references.
2. The evidence bundle includes a labeled proof-coverage note that distinguishes directly demonstrated, indirectly supported, and intentionally deferred DP-700-relevant areas.
3. Each referenced proof artifact points to a governed page section, release artifact, or approved documentation reference rather than an implied future asset.
4. The evidence bundle remains available from within the same shared public experience rather than requiring a second disconnected product.

## Tasks / Subtasks

- [x] Add a compact technical evidence bundle to the technical-method route. (AC: 1, 4)
  - [x] Summarize architecture and boundary proof already visible on the route.
  - [x] Summarize model and grain proof already visible on the route.
  - [x] Add validation and promotion references grounded in governed docs and contracts.
  - [x] Add release and package identity references tied to the approved package.

- [x] Add a proof-coverage note for DP-700-relevant areas. (AC: 2)
  - [x] Distinguish directly demonstrated proof.
  - [x] Distinguish indirectly supported proof.
  - [x] Distinguish intentionally deferred proof.

- [x] Keep the bundle bounded and route-native. (AC: 3, 4)
  - [x] Reference existing route sections or governed artifact paths.
  - [x] Avoid turning the route into a repo dump or disconnected documentation portal.

- [x] Verify the route through the approved baseline commands.
  - [x] Validate Astro build output.
  - [x] Validate Astro check output.

## Dev Notes

- Story 4.4 should make technical proof more explicit without changing the public site into a second documentation system.
- The bundle should summarize what is already proven on the route and tie it to governed references where needed.
- The proof-coverage note should stay honest about what the MVP does not yet demonstrate directly.

### Project Structure Notes

- Keep the work centered in `apps/public-site/src/pages/technical-method.astro`.
- Reference the approved public mirror, automation docs, and governed contracts only.
- Do not add a separate technical-evidence route or external microsite.

### Technical Requirements

- Static-first Astro page only.
- Keep the evidence bundle compact and readable without JavaScript.
- Use governed references already available in the repo.

### Architecture Compliance

- The evidence bundle must preserve the contract-first and approved-package posture.
- Any technical proof shown publicly must remain subordinate to the curated web experience.
- Deferred proof areas must be identified as deferred rather than implied current capability.

### Library / Framework Requirements

- Reuse Astro only.
- Do not add new runtime dependencies.

### Testing Requirements

- `corepack pnpm run build:public-site`
- `corepack pnpm run check:public-site`

### References

- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/power-bi-fabric-proof-reentry-plan-2026-03-30.md`
- `docs/automation/verification-baseline.md`
- `docs/automation/publication-validation-flow.md`
- `platform/fabric/contracts/candidate-validation-contract.md`
- `platform/fabric/contracts/current-package-sync-contract.md`
- `platform/fabric/contracts/publication-manifest.schema.json`
- `apps/public-site/src/pages/technical-method.astro`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-03-30: Added a compact technical evidence bundle section to the technical-method route.
- 2026-03-30: Added DP-700-relevant proof-coverage notes distinguishing direct, indirect, and deferred proof.
- 2026-03-30: Tied the evidence bundle to approved package identity and governed repo references.
- 2026-03-30: Re-ran `build:public-site` and `check:public-site`; both passed cleanly during close-out review.

### Completion Notes List

- The technical-method route now includes a bounded evidence bundle instead of relying on implied technical credibility.
- The route now names where architecture, model, validation, and release proof come from.
- The route now states which proof areas are direct, indirect, or deferred in Phase 1.

### File List

- `_bmad-output/implementation-artifacts/4-4-publish-the-bounded-technical-evidence-bundle.md`
- `apps/public-site/src/pages/technical-method.astro`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-03-30: Implemented Story 4.4 and moved it to review.
- 2026-03-30: Closed Story 4.4 after clean verification and bounded review.
