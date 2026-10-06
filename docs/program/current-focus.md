# Current Focus

last_updated: 2026-09-05

## Current Stage

The project is in V2 implementation governance after the original PRD, UX, architecture, epics, readiness, and several implementation epics were completed.

The active project definition is:

`governed operating-loop decision-support proof with Fabric execution, public-site explanation, Power BI request-access handoff, and public repo evidence`

## Current Implemented State

Already present in the repo:

- Astro public site under `apps/public-site/`
- BMAD planning and implementation artifacts under `_bmad-output/`
- UX design specification and directions under `_bmad-output/planning-artifacts/`
- Epics and story files under `_bmad-output/planning-artifacts/` and `_bmad-output/implementation-artifacts/`
- Fabric compatibility/contracts/scripts under `05-compat/`
- Fabric automation and public-evidence docs under `docs/automation/`
- Professional-development and interview support docs under `docs/professional-development/`
- Client-enablement legal/commercial scaffolding under `docs/client-enablement/`

## Active V2 Workstream

Per `_bmad-output/implementation-artifacts/sprint-status-v2.yaml`:

- Epic 8 / V2 governance rebaseline: done
- Epic 9 / operating-loop integrity: backlog
- Epic 10 / semantic model and Power BI dashboard: in progress
- Epic 11 / public site demo narrative: backlog
- Epic 12 / public repo release: backlog
- Epic 13 / demo and interview readiness: backlog

Current in-progress item:

- `10-1-sync-missing-tables-into-semantic-model`

## Recommended Next Build Focus

1. Continue Epic 10 by syncing missing Lakehouse-backed operating-loop facts into the semantic model.
2. Apply the full 40-measure pack after table sync succeeds.
3. Author or complete the three Power BI views: Sales, Supply Chain Decision Support, and Inventory Decision Support.
4. Capture safe screenshots and configure the request-access story.
5. Update the public site around the operating-loop narrative and proof status.
6. Prepare Phase 3 public repo evidence before Phase 1 and Phase 2 repo packaging.

## Parallel Work Guidance

Parallel work is appropriate now, but split it by surface:

- Fabric/semantic model window: Epic 10 work only.
- Public-site window: Epic 11 narrative, screenshots, request-access CTA.
- Repo/evidence window: Epic 12 public exposure checklist and README packaging.
- Interview window: Epic 13 demo script, reviewer map, defense Q&A.

Do not let parallel work change the product thesis or add new dashboard subjects before the three agreed views are complete.
