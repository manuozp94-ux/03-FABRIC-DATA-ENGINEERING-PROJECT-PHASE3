# Decision Log

last_updated: 2026-09-05

## Current Accepted Decisions

### Repo Location

The repo for this conversation is now:

`/Users/manuel.orozco/Desktop/CODEX PROJECTS/03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3`

The previous Desktop/PERSONAL path is historical. For this conversation, that old path has been replaced with a symlink to the current repo so existing Codex workspace metadata still resolves correctly.

### V2 Baseline Supersedes Original Planning For Current Work

The original PRD, architecture, UX, and epics remain useful historical context. Current execution should follow the April 15, 2026 V2 baseline:

- `prd-v2-operating-loop-decision-system-2026-04-15.md`
- `architecture-v2-operating-loop-delta-2026-04-15.md`
- `epics-v2-operating-loop-decision-system-2026-04-15.md`
- `oversight-map-v2-2026-04-15.md`
- `scope-decisions-v2-2026-04-15.md`

### Product Thesis

Operating loop first, Fabric platform second.

The project should demonstrate that Manuel can translate messy operational logic into governed analytical layers that connect demand pressure, recommendations, execution, inventory effects, Gold outputs, Power BI views, and public-site explanation.

### Scope Guardrails

The product is not:

- ERP replacement
- optimizer
- warehouse-management system
- real-time control tower
- finance-grade valuation system
- anonymous public Power BI dashboard

### Dashboard Access

Use screenshots plus request-access. Do not use anonymous Power BI Publish to web as the default public distribution path.

### Power BI Authoring Path

Use Power BI Desktop for richer layout and proof polish when the Service editor becomes limiting.

Use Power BI Service for publish, hosting, and bounded embed.

Do not move the report surface back into Astro calculations; Astro should host the proof and explanation, not recompute the semantic logic.

### Public Repo Strategy

Use the three existing phase-specific project repositories as public proof surfaces:

- `01-FABRIC-DATA-ENGINEERING-PROJECT-PHASE1`
- `02-FABRIC-DATA-ENGINEERING-PROJECT-PHASE 2`
- `03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3`

Prepare Phase 3 first because it contains the current operating-loop proof.

### Inventory Reconciliation

Strict event-ledger inventory reconciliation is a target-state gap. Current language should say the bounded event ledger explains decisions and execution beside inventory posture, without claiming full event-sourced inventory accounting.

### Finish Line

Interview-ready first, public launch second.

Prioritize coherent walkthrough, screenshots, request-access path, repo evidence, and defense answers before broader launch polish.

### Visual Build Later

Manuel wants to drive taste and aesthetics later, with support from tools such as Relume, Figma Make, and v0. These tools may guide visual direction, but they must not override the architecture, accessibility, performance, SEO, or publication-safety constraints.
