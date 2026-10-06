# Story 7.1: Canonicalize the Representative Approved Package and Align All Public Surfaces

Status: done

## Story

As a product owner,
I want the coherence-approved representative package to become the one canonical current package across the site, explorer, and proof path,
so that the public story no longer splits between a tiny seed market and a larger approved market.

## Acceptance Criteria

1. Given the representative package has already passed the coherence gate, when the Fabric-native correction begins, then the representative approved package is promoted to the canonical `current` package for publication, public-site mirroring, and Fabric proof refresh inputs.
2. The old tiny `current` slice is explicitly reclassified as a seed-archetype source rather than the active public package.
3. The public site mirror, publication explorer, and project-map guidance all point to the same approved representative package rather than to parallel truths.
4. Promotion remains fail-closed if the representative package is not coherence-approved or if required public artifacts are incomplete.
5. The story exits with implementation-ready alignment rules, affected-surface references, and success checks for the first Fabric-native execution story.

## Tasks / Subtasks

- [x] Define the canonical promotion rule for the representative package. (AC: 1, 4)
  - [x] Identify the exact coherence artifact that authorizes promotion.
  - [x] Define the promotion boundary between representative outputs and `platform/fabric/publication/current`.
  - [x] Define fail-closed behavior when the representative package or mirror is incomplete.

- [x] Align all public-facing consumption surfaces to the same approved package. (AC: 1, 3)
  - [x] Update the public-site mirror flow to consume the canonical representative `current`.
  - [x] Update the publication explorer defaults and labels to distinguish `seed`, `current`, and `candidate`.
  - [x] Update the Fabric proof refresh path to consume the same canonical `current`.

- [x] Reclassify the tiny seed slice explicitly. (AC: 2, 3)
  - [x] Preserve the seed slice as the bounded seed-archetype source.
  - [x] Remove wording that implies the tiny seed slice is still the active public market.
  - [x] Update roadmap and technical-method references where the old `current` semantics linger.

- [x] Leave behind implementation-ready handoff for Story `7.2`. (AC: 5)
  - [x] List the surfaces that will now feed the Fabric-native execution path.
  - [x] List the verification checks required before notebook-first execution takes over Silver and Gold.

## Dev Notes

- This story does not yet move Silver and Gold execution into Fabric.
- This story closes the split-brain state between the current site experience and the representative approved package.
- The result of this story should make Story `7.2` much safer because notebook-first execution will point at one canonical approved package instead of at parallel data truths.

### Project Structure Notes

- Canonical representative package: `_bmad-output/test-artifacts/fabric-representative/current`
- Canonical approval artifact: `_bmad-output/test-artifacts/fabric-representative/representative-coherence-report.json`
- Current publication target: `platform/fabric/publication/current`
- Current public mirror target: `apps/public-site/src/data/publication/current`
- Explorer surface: `tests/publication/exploration/publication-explorer.ipynb`

### Technical Requirements

- The representative package must not become canonical through manual copying without a coherence-approved record.
- The public site, explorer, and Fabric proof path must converge on the same approved package identity.
- The seed slice remains important, but only as generation input and seed-archetype evidence.
- The story must not broaden semantic-model scope, add new public facts, or introduce Desktop-authored report work.

### Architecture Compliance

- Repo-side governance remains the approval boundary.
- Public surfaces must consume one approved truth.
- This story prepares the Fabric-native execution correction; it does not complete it.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-04-01: Reviewed the publication, representative, mirror, and proof-refresh paths to identify the split between the tiny seed package and the representative approved package.
- 2026-04-01: Added a fail-closed promotion script that promotes the coherence-approved representative package to canonical `current`, bootstraps the legacy package into `platform/fabric/publication/seed`, and writes a machine-readable promotion receipt.
- 2026-04-01: Updated the public-site mirror sync flow, the representative-market seed default, the Fabric proof refresh input default, and the publication explorer scopes so all public-facing surfaces now converge on the same approved package.
- 2026-04-01: Applied the promotion to the repo, validated the notebook JSON, passed the full publication test suite, and rebuilt the Astro site successfully against the new canonical `current`.

### Completion Notes List

- The canonical approved package is now `platform/fabric/publication/current`, and it reflects the representative coherence-approved market rather than the earlier tiny slice.
- The earlier tiny package is now preserved as `platform/fabric/publication/seed` for local generation and expansion logic.
- The public-site mirror under `apps/public-site/src/data/publication/current` now matches the same approved representative package.
- The Fabric proof refresh path now defaults to the canonical `current` package, which prepares Story `7.2` for notebook-first execution inside Fabric.
- The publication explorer now distinguishes `seed`, `current`, and `candidate` instead of preserving a parallel `representative` truth.

### File List

- `_bmad-output/implementation-artifacts/7-1-canonicalize-the-representative-approved-package-and-align-all-public-surfaces.md`
- `platform/fabric/automation/promote-representative-package-to-current.mjs`
- `platform/fabric/automation/representative-market-lib.mjs`
- `platform/fabric/automation/run-fab001-stabilized-proof-refresh.mjs`
- `platform/fabric/automation/sync-current-package-to-public-site.mjs`
- `tests/publication/current-promotion.test.mjs`
- `tests/publication/fabric-stabilized-refresh.test.mjs`
- `tests/publication/exploration/publication-explorer.ipynb`
- `platform/fabric/publication/current/`
- `platform/fabric/publication/seed/`
- `apps/public-site/src/data/publication/current/`
- `_bmad-output/test-artifacts/fabric-publication/current-promotion-report.json`

### Change Log

- 2026-04-01: Marked Story `7.1` done after promotion, mirror alignment, explorer alignment, and proof-refresh input alignment were implemented and verified.

### Testing Requirements

- This story should leave behind testable checks for:
  - canonical representative promotion
  - fail-closed current-package replacement
  - mirror alignment
  - explorer alignment
  - proof-refresh input alignment

### References

- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-04-01-fabric-native-enterprise-correction.md`
- `docs/automation/logic-first-fabric-proof-workflow.md`
- `docs/public-site/project-map.md`
- `05-compat/contracts/fab001_fabric_build_runbook.md`
