# Scope Decisions v2

Status: accepted direction
Date: 2026-04-15
Owner: Manuel

## Purpose

This document records the product-direction decisions that unblock the V2 build plan.

These decisions govern the next implementation sequence until explicitly superseded.

## Decisions

### Decision 1: Public Repo Strategy

Decision:

- Use the three existing phase-specific project repositories as the public release surfaces.
- The repositories are `01-FABRIC-DATA-ENGINEERING-PROJECT-PHASE1`, `02-FABRIC-DATA-ENGINEERING-PROJECT-PHASE 2`, and this repo, `03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3`.
- Do not split the current Phase 3 repo into three new repositories.

Rationale:

- Each existing phase repo can tell a clean story without forcing reviewers to navigate one very large repo.
- Phase boundaries become easier to explain publicly.
- Earlier phases can be curated without exposing unfinished Phase 3 internals prematurely.

Implication:

- Phase 1, Phase 2, and Phase 3 each need a public-safe README and exposure checklist in their own existing repositories.
- Phase 3 remains the first priority because it contains the current operating-loop proof.

### Decision 2: Dashboard Access

Decision:

- Use screenshots plus request-access.

Rationale:

- Screenshots make the public site reviewable without requiring immediate access.
- Request-access preserves governance and avoids anonymous `Publish to web`.
- The dashboard remains supporting evidence rather than the whole public product.

Implication:

- The site should include safe dashboard screenshots or preview images.
- The site should include a clear request-access CTA.
- Live access should remain authenticated or manually approved.

### Decision 3: Inventory Reconciliation

Decision:

- Declare strict event-ledger inventory reconciliation as a target-state gap.

Rationale:

- The current bounded V1 already shows the operating-loop pattern with decision queues, execution facts, and inventory posture.
- Completing strict inventory reconstruction before the first interview-ready milestone could distract from demo readiness.
- Honest target-state language is stronger than overclaiming causal completeness.

Implication:

- Current language should say the event ledger explains decisions and execution beside current snapshots.
- The project should not claim full event-sourced inventory accounting yet.
- Validation can still check lead times and traceability now, while strict conservation moves to later hardening.

### Decision 4: Finish Line

Decision:

- Interview-ready first, public launch second.

Rationale:

- The highest near-term value is a coherent, defensible walkthrough.
- Public launch quality can follow after the semantic/report and repo exposure surfaces are stable.

Implication:

- Prioritize demo script, reviewer map, dashboard screenshots, semantic status honesty, and public-safe explanation.
- Defer broader launch polish until the interview-ready path is stable.

## Current Priority Order

1. Make the V2 planning baseline accepted and visible.
2. Complete semantic/report handoff enough to support screenshots.
3. Author or capture safe dashboard screenshots.
4. Add request-access CTA to the site.
5. Prepare this Phase 3 public repo first.
6. Create interview walkthrough and defense pack.
7. Prepare the existing Phase 1 and Phase 2 repos after the Phase 3 story is stable.

## Supersession Rule

If any of these decisions change, create a new dated scope-decision document and update:

- `_bmad-output/planning-artifacts/oversight-map-v2-2026-04-15.md`
- `_bmad-output/planning-artifacts/prd-v2-operating-loop-decision-system-2026-04-15.md`
- `docs/public-site/project-map.md`
- `docs/public-site/communication-strategy.md`
