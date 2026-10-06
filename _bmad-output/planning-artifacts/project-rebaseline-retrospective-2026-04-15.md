# Project Rebaseline Retrospective

Status: draft for review
Date: 2026-04-15
Project: FABRIC_PLATFORM_DEV_BMAD

## Purpose

This retrospective captures the scope expansion that happened after the original
epics were completed and defines the correction path for the next build phase.

This is not a blame document. The project learned its way into a stronger shape:
from a public dashboard proof into a governed operating-loop decision system.

## Trigger

The original PRD and epics were built around a public-safe analytical case study with
a Fabric-oriented proof surface. That scope has now grown in a meaningful way.

The current project includes:

- a bounded representative market
- a live Fabric Lakehouse with Bronze, Silver, Gold, runtime governance, and financial foundation tables
- an operating-loop extension with decision queues, purchase orders, movements, fulfillment, and lead-time rules
- a bounded public serving extract mirrored into the Astro site
- a three-view Power BI dashboard contract
- a partial live semantic-model measure patch
- a public communication strategy for website, Power BI, and GitHub

The project definition must be updated so new work can proceed with oversight instead
of accumulating as isolated improvements.

## What Went Well

- The original bounded-proof architecture was strong enough to absorb new scope without collapsing.
- The repo governance plane now has deterministic generation, candidate gating, promotion, validation, release identity, and recovery concepts.
- Fabric now carries a much more credible live proof surface than the original report shell.
- The operating-loop narrative is stronger than the earlier dashboard-first narrative.
- The public-safe boundary has stayed explicit even as table count and analytical ambition increased.
- The site mirror now reads from a bounded Fabric-derived serving extract instead of treating repo `current` as the final public truth.

## What Changed

The core product changed from:

```text
public-safe supply-chain dashboard proof
```

to:

```text
governed operating-loop decision-support proof with Fabric execution, public-site explanation, and gated Power BI handoff
```

The change is justified because the new scope better matches the professional story:

- translate messy operational logic into governed analytical layers
- separate recommendations from execution
- show how decisions create inventory effects
- expose outputs through business-readable and technical-reviewable surfaces

## What Became Risky

- The original PRD no longer fully describes the product being built.
- The original epic list is complete, but no longer enough to govern remaining work.
- The semantic model and report shell can be overstated if the Lakehouse state and Power BI state are not separated clearly.
- The public site can become too narrative-heavy if Power BI and repo evidence do not catch up.
- The project can drift toward ERP, optimizer, or control-tower language if the bounded proof guardrails are not restated.

## Current Truth

As of this rebaseline:

- live Fabric Lakehouse has `43` bounded tables
- repo current package has `18` approved Bronze input tables
- Fabric reference layer has `4` Silver tables and `12` Gold tables
- financial foundation has `5` rule-derived tables
- site serving mirror has the current bounded extract
- semantic contract covers `32` tables and `40` measures
- semantic live patch succeeded for `15` measures
- `25` measures are blocked until missing Lakehouse-backed tables are synced into the semantic model
- the full three-page Power BI report is not yet authored

## Recommended Correction

Create a V2 planning baseline instead of continuing from the original epic plan.

The V2 baseline should include:

- PRD v2 addendum
- architecture delta
- epics and stories v2
- oversight map
- updated references in live project docs

The old PRD, architecture, and epics remain historical truth. The V2 baseline becomes
the current implementation truth.

## Lessons Learned

- The product should be governed by the operating loop first and by Fabric second.
- Gold outputs should be dashboard-subject outputs, not incidental report helpers.
- Power BI should visualize governed outputs, not invent business rules.
- A semantic-model sync status document is necessary because Fabric Lakehouse state and semantic model state can diverge.
- Public readiness requires three coherent surfaces: site, dashboard, and repo evidence.
- Publication scope must stay bounded even when the model becomes richer.

## Accepted Scope Decisions

These user-level decisions are now accepted and recorded in:

- `_bmad-output/planning-artifacts/scope-decisions-v2-2026-04-15.md`

Accepted direction:

- Public repo strategy: three existing phase-specific public repositories, not a split of this Phase 3 repo.
- Dashboard access: screenshots plus request-access.
- Inventory reconciliation: strict event-ledger reconciliation is a target-state gap.
- Demo finish line: interview-ready first, public launch second.

## Next Artifacts

- `_bmad-output/planning-artifacts/prd-v2-operating-loop-decision-system-2026-04-15.md`
- `_bmad-output/planning-artifacts/architecture-v2-operating-loop-delta-2026-04-15.md`
- `_bmad-output/planning-artifacts/epics-v2-operating-loop-decision-system-2026-04-15.md`
- `_bmad-output/planning-artifacts/oversight-map-v2-2026-04-15.md`
