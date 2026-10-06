# Transparency Boundary Coverage Matrix

Date: 2026-03-27
Scope: Trace the concern of curated transparency, public-proof boundaries, repo-visible asset limits, and protection of private delivery leverage across PRD, architecture, UX, and epic/story planning artifacts.

## Short Answer

This concern is not owned by UX alone.

- UX owns how trust, proof, and omission feel to the visitor.
- Architecture owns the hard private/governed/public boundary.
- Epics and stories own implementable enforcement, release gates, and acceptance criteria.

The repo now has meaningful coverage for this concern, but there were three gaps at scan time:

1. `epics.md` was stale relative to the new UX specification.
2. Story-level coverage was strong on publication safety, but weaker on explicit public-repo/public-evidence boundary policy.
3. There are no separate story files yet, so all story scanning currently depends on embedded stories inside `epics.md`.

## Scan Scope

Artifacts reviewed:

- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/implementation-readiness-report-2026-03-27.md`

Search themes used during scan:

- `public`
- `private`
- `repo`
- `git`
- `publication`
- `masking`
- `abstraction`
- `technical evidence`
- `proof`
- `release`

## Coverage Matrix

| Concern Area | PRD | Architecture | UX | Epics / Stories | Status | Notes |
|---|---|---|---|---|---|---|
| Public proof must stay bounded | Present | Present | Present | Present | Covered | Core product framing is consistently bounded to one public case-study proof surface. |
| Private/governed/public zone separation | Present | Strong | Implied | Strong | Covered | Architecture and epics make the zone boundary explicit. |
| Publication-safe masking and abstraction | Strong | Strong | Implied through trust | Strong | Covered | Already treated as a release and modeling discipline, not just a copywriting issue. |
| Technical evidence should prove rigor without overwhelming users | Present | Present | Strong | Present | Covered | UX now adds progressive proof language that epics needed to inherit. |
| Public repo or repo-visible artifact boundary | Partial | Partial | Partial | Partial before patch | Improved | This was the main gap. Coverage is now more explicit in `epics.md` through a new requirement and Story 4.5. |
| Explicit classification of artifacts as public-safe vs private-only | Partial | Partial | Implied | Partial before patch | Improved | Now added to story acceptance criteria and release traceability expectations in `epics.md`. |
| Release record should include publication-boundary evidence | Partial | Present | N/A | Partial before patch | Improved | Strengthened in Epic 5 by adding manifest/boundary references to release records and summaries. |
| UX should make omission feel intentional rather than evasive | Weak | N/A | Strong | Weak before patch | Improved | The UX spec now states this clearly; epics now acknowledge the UX design requirements. |
| Privacy/contact/support pages reinforce trust but do not leak process | Present | Present | Strong | Present | Covered | Already part of launch-scope legal readiness and public trust behavior. |
| Separate story files exist for downstream execution | N/A | N/A | N/A | Not present | Gap remains | Stories are still embedded in `epics.md`; no standalone story markdown files exist yet. |

## Source Highlights

### PRD

- Skeptical technical reviewers are expected to inspect bounded proof rather than vague claims.
- The product owner journey already says public technical archives must be separated from private historical evidence and sensitive preparation materials.
- Phase 1 explicitly excludes the broader consulting-services operating system and keeps the MVP focused on public analytical proof.

### Architecture

- The architecture defines three zones: private preparation, governed publishable analytics, and public delivery.
- It explicitly treats private-to-public artifact boundaries, release gates, and last-known-good states as architectural concerns.
- It distinguishes reusable delivery-method elements from what must remain internal or case-specific.

### UX

- The UX spec now frames the experience as progressive proof, not full process exposure.
- It treats trust signals and methodological boundaries as part of the user experience.
- It positions support pages such as privacy/contact handling as bounded trust assets rather than disclosure dumps.

### Epics / Stories

- Epics already covered publication safety, masking, technical-method proof, and release traceability.
- The scan exposed a need for stronger explicit handling of repo-visible boundaries and curated transparency.
- `epics.md` was patched during this scan to:
  - acknowledge the current UX spec
  - add a publication-boundary requirement
  - add Story 4.5 for curated public evidence and repo exposure policy
  - strengthen Epic 5 release traceability around publication manifests and proof-scope changes

## Current Gaps That Still Remain

### 1. Standalone Story Files

There are still no separate story markdown files under `_bmad-output` or a stories folder. That means downstream execution and traceability still rely on embedded stories inside `epics.md`.

### 2. Stale Readiness Report

`implementation-readiness-report-2026-03-27.md` still claims that no epics or stories artifact exists. That report is now out of date relative to the repo state.

### 3. Future Backlog Hardening

If this concern becomes central to implementation, future stories may still benefit from:

- a formal publication manifest schema
- a documented asset-classification checklist for public-proof vs private-only artifacts
- a reusable repo-visibility policy for future client-safe case studies

## Recommended Next Steps

1. Regenerate or patch the implementation-readiness report so it reflects the existence of `epics.md` and the new UX specification.
2. Create standalone story files for the stories that now carry publication-boundary enforcement, especially Story 4.5 and the Epic 5 release-governance stories.
3. If desired, create a small reusable checklist or manifest template that classifies candidate public artifacts as `public-proof`, `public-safe operational`, or `private-only`.
