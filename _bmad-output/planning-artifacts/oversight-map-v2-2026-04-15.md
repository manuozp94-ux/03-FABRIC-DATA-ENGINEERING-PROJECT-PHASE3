# Oversight Map v2

Status: draft
Date: 2026-04-15
Decision reference: `_bmad-output/planning-artifacts/scope-decisions-v2-2026-04-15.md`

## Purpose

This map is the operating dashboard for the next phase of work. It keeps the project
from drifting by separating what is current, what is blocked, what is next, and what
requires Manuel's decision.

## Current Truth Summary

Data state:

- local approved Bronze input package exists
- Fabric Lakehouse is refreshed
- public-site serving mirror is refreshed
- operating-loop tables exist
- Gold dashboard-subject outputs exist

Semantic/report state:

- semantic contract is updated
- measure pack is updated
- live semantic model patch is partial
- Power BI three-page layout is not complete

Communication state:

- operating-loop narrative exists
- public-site strategy exists
- project map exists
- V2 planning baseline now exists as draft

## Workstreams

### Workstream A: Governance And Documentation

Goal:

- make V2 the current source of truth

Current artifacts:

- `project-rebaseline-retrospective-2026-04-15.md`
- `prd-v2-operating-loop-decision-system-2026-04-15.md`
- `architecture-v2-operating-loop-delta-2026-04-15.md`
- `epics-v2-operating-loop-decision-system-2026-04-15.md`
- `scope-decisions-v2-2026-04-15.md`

Next:

- review and accept V2 baseline
- update references in current docs
- keep old docs as historical context

### Workstream B: Operating-Loop Integrity

Goal:

- make the causal loop defensible

Next:

- validate queue-to-execution traceability
- validate lead-time rules
- document strict inventory snapshot reconciliation as target-state gap
- add or harden conservation checks

### Workstream C: Semantic Model And Power BI

Goal:

- make the three dashboard views live and presentable

Blocked by:

- semantic model table sync for missing facts

Next:

- sync missing tables into semantic model
- rerun measure patch
- author enough report layout to capture safe screenshots
- configure screenshots plus request-access path

### Workstream D: Public Site And Demo

Goal:

- make the proof easy to understand publicly

Next:

- update case-study narrative around operating loop
- update technical-method route with current live state
- add dashboard screenshots and request-access CTA
- create demo walkthrough section or script

### Workstream E: Public Repo Release

Goal:

- make GitHub evidence safe and useful

Next:

- prepare the three existing phase-specific public repositories
- prioritize Phase 3 first
- audit private-only paths
- prepare phase READMEs
- run public exposure checklist

## Immediate Build Sequence

Recommended order:

1. Accept or revise PRD v2.
2. Accept or revise architecture v2 delta.
3. Treat epics v2 as the active backlog.
4. Update project docs to point to V2 baseline.
5. Complete semantic-model table sync.
6. Patch all `40` measures.
7. Author three Power BI pages or enough proof-grade layout to capture safe screenshots.
8. Update site narrative, screenshots, and request-access path.
9. Prepare this Phase 3 public repo first, then the existing Phase 1 and Phase 2 repos.
10. Create interview walkthrough and defense pack.
11. Run final validation and demo smoke review.

## Decisions Required From Manuel

Decision 1: Public repo strategy.

- Accepted: public release uses the three existing phase-specific project repos.
- Repos: `01-FABRIC-DATA-ENGINEERING-PROJECT-PHASE1`, `02-FABRIC-DATA-ENGINEERING-PROJECT-PHASE 2`, and this repo, `03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3`.
- Clarification: the Phase 3 repo should not be split into three new repositories.
- Execution note: Phase 3 should be prepared first because it contains the current operating-loop proof.

Decision 2: Dashboard access.

- Accepted: screenshots plus request-access.
- Execution note: screenshots make the public site reviewable; request-access preserves governance.

Decision 3: Inventory reconciliation.

- Accepted: label strict event-ledger reconciliation as a target-state gap.
- Execution note: current bounded V1 can explain recommendations and execution beside inventory posture, but must not claim full event-sourced inventory accounting.

Decision 4: Demo finish line.

- Accepted: interview-ready first, public launch second.
- Execution note: prioritize coherent walkthrough, screenshots, request-access path, and defense answers before broader public-launch polish.

## Validation Checklist

Before demo or publication:

- `corepack pnpm run test:fabric-dimensions`
- `corepack pnpm run validate:fabric-representative-market`
- `corepack pnpm run materialize:public-site-state`
- `corepack pnpm run build:public-site`
- `corepack pnpm run check:public-site`
- Fabric Lakehouse manifest reviewed
- semantic model sync status reviewed
- Power BI access mode reviewed
- public repo exposure checklist reviewed

## Stop-Doing List

- do not add new dashboard subjects before the three agreed views are complete
- do not add real geography
- do not add writeback
- do not make Power BI the source of business rules
- do not publish anonymous dashboard access
- do not polish screenshots before the semantic/report status is honest
- do not let Fabric terminology replace the business story
