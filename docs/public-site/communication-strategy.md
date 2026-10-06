# Public Communication Strategy

Status: active strategy
Last updated: 2026-04-15

## Purpose

This document defines the communication spine for the public portfolio surface.

The project should be understood as a bounded proof of governed operational analytics,
not as a generic dashboard portfolio.

Current planning baseline:

- `_bmad-output/planning-artifacts/prd-v2-operating-loop-decision-system-2026-04-15.md`
- `_bmad-output/planning-artifacts/oversight-map-v2-2026-04-15.md`
- `_bmad-output/planning-artifacts/scope-decisions-v2-2026-04-15.md`

## Core Message

I turn fragmented operational logic into governed decision-support systems.

For this project, the proof is a public-safe operating loop:

```text
demand pressure
-> supply-chain and logistics decisions
-> orders, movements, fulfillment, and inventory effects
-> Gold analytical outputs
-> Power BI and public-site explanation
```

The public site explains the business and trust boundary. Power BI demonstrates the
analytical serving layer. GitHub shows the contracts, validation, and delivery method.

## Audience Tiers

### Recruiters

Need to understand:

- what kind of professional this work represents
- why the work is relevant to analytics engineering, BI leadership, and Fabric roles
- what the visible artifacts are

Best path:

- home page
- case study
- recruiter story map
- dashboard screenshots or request-access CTA

### Hiring Managers

Need to understand:

- what business problem is being solved
- how the work would help commercial, supply chain, and logistics stakeholders
- what judgment was used to keep scope realistic

Best path:

- case study
- dashboard views
- operating-loop explanation
- selected repo evidence

### Technical Reviewers

Need to understand:

- contracts
- medallion responsibilities
- validation gates
- semantic model and Power BI handoff
- public-safe boundary

Best path:

- technical-method page
- operating-loop architecture
- current data pipeline description
- contract files
- validation baseline

## Narrative Order

Use this order everywhere:

1. Business problem.
2. Operating loop.
3. Bounded proof scope.
4. Fabric medallion and governance path.
5. Dashboard views.
6. Public-safe release and access model.

Avoid opening with tools, scripts, folder structure, or certification language.

## Public Site Role

The public site is the main explanation surface.

It should:

- introduce the business problem quickly
- show why demand, inventory, service, and exposure conflict
- explain the operating loop in business language
- state what the proof covers and what it deliberately excludes
- route technical reviewers to the method page
- provide a request-access path for the gated Power BI dashboard

It should not:

- expose private-prep material
- read Fabric live at request time
- imply real-time operations
- imply raw invoice-source finance
- publish anonymous Power BI access

## Dashboard Role

Power BI is supporting proof, not the whole portfolio.

The dashboard should be organized into three views:

- `Sales Dashboard`
- `Supply Chain Decision Support`
- `Inventory Decision Support`

Each view should feel like a different readout of the same operating loop.

The access model should be request-based for the first public release. This is a
governance decision, not a limitation.

Current access direction:

- publish safe screenshots or preview images for fast public review
- offer request-access for the live Power BI dashboard
- avoid anonymous `Publish to web`

## GitHub Role

GitHub should show how the proof is governed.

The public repo strategy uses the three existing phase-specific project repositories:

- Phase 1: `01-FABRIC-DATA-ENGINEERING-PROJECT-PHASE1`, covering SQL-to-Fabric foundation and parity discipline
- Phase 2: `02-FABRIC-DATA-ENGINEERING-PROJECT-PHASE 2`, covering architecture-first and public-safe reset
- Phase 3: this repo, `03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3`, covering the governed operating-loop proof with site, contracts, validation, Fabric handoff, screenshots, and request-access story

Prepare Phase 3 first for interview readiness.

This does not mean splitting the current Phase 3 repo into three new repositories.

Avoid pushing uncurated local artifacts or private operational material.

## Terms To Use

- bounded proof
- operating loop
- decision-support system
- public-safe analytical case
- approved Bronze input package
- Fabric execution plane
- bounded public serving extract
- semantic handoff
- request-access dashboard

## Terms To Avoid

- ERP replacement
- optimizer
- live cockpit
- real-time production system
- finance-grade valuation
- raw invoice-source reporting
- full enterprise Fabric administration
- anonymous public dashboard

## Completion Standard

The communication layer is ready when a reviewer can answer:

- What business problem is this proof solving?
- What decisions does it support?
- How does a recommendation become an inventory effect?
- What does Fabric execute?
- What does Power BI show?
- What is public-safe and what is intentionally withheld?
- What is live today versus target-state next work?
- Why strict inventory reconciliation is target-state rather than claimed complete today?
