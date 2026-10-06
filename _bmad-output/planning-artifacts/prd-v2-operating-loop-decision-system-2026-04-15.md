# PRD v2: Operating-Loop Decision System Proof

Status: draft rebaseline
Date: 2026-04-15
Owner: Manuel
Supersedes for current planning: `_bmad-output/planning-artifacts/prd.md`
Preserves as historical baseline: original PRD and epics
Scope decisions: `_bmad-output/planning-artifacts/scope-decisions-v2-2026-04-15.md`

## Executive Summary

The project is now a public-safe, governed operating-loop decision-support proof.

It demonstrates how fragmented operational logic can be transformed into governed
analytical layers that support Sales, Supply Chain, and Inventory decisions across
a bounded, synthetic, public-safe market.

The product is not an ERP, optimizer, warehouse-management system, or real-time
control tower. It is a bounded proof of method:

```text
demand pressure
-> decision queues
-> purchase orders, movements, and fulfillment
-> inventory effects
-> Gold dashboard outputs
-> Power BI and public-site explanation
```

The main public value is professional credibility: the project should help a hiring
manager, technical reviewer, recruiter, or business stakeholder understand that Manuel
can translate messy business logic into governed analytical products using Microsoft
Fabric, Power BI, semantic modeling, validation, and public-safe communication.

## Product Thesis

Operating loop first. Fabric platform second.

The portfolio should show that a data professional can:

- understand operational decisions from the business side
- model the causal path between recommendations, execution, and inventory state
- govern data contracts and publication boundaries
- use Fabric as an execution plane rather than as a buzzword
- expose outputs through business-readable dashboards and a public-safe site

## Target Audiences

### Recruiters

Need fast role-fit evidence:

- analytics engineering
- BI leadership
- Fabric execution
- operational decision support

### Hiring Managers

Need business judgment:

- problem framing
- stakeholder relevance
- scope discipline
- ability to bridge business, BI, and platform delivery

### Technical Reviewers

Need implementation evidence:

- contracts
- medallion flow
- validation gates
- semantic model handoff
- live Fabric status
- public-safe release discipline

### Business Stakeholders

Need to recognize the pattern:

- fragmented reporting
- unclear definitions
- sales demand pressure
- inventory risk
- service consequences
- governed decision support

## Current Implemented State

The project currently has:

- Astro public site
- bounded source generation and representative market
- approved Bronze input package
- live Fabric Lakehouse
- Bronze, Silver, Gold, runtime governance, and financial foundation tables
- operating-loop tables for supply-chain and logistics recommendations
- execution facts for purchase orders, movements, and sales fulfillment
- Gold outputs for Sales, Supply Chain, and Inventory dashboard subjects
- bounded public serving extract mirrored into the site
- semantic contract and measure pack for a three-view report
- partial live semantic model patch

## Current Gaps

The current gaps are:

- live semantic model still needs table sync for several new operating-loop facts
- full three-page Power BI report layout is not authored yet
- inventory snapshots are not yet strictly rebuilt from the event ledger
- public repo packaging strategy is decided as three existing phase-specific project repos, with this Phase 3 repo first
- public site needs final demo polish around dashboard request access and current proof status
- V2 docs need to become the current oversight system

## MVP v2 Scope

MVP v2 includes:

- a coherent current-state product definition
- one governed operating-loop case
- three dashboard views
- a request-access Power BI surface
- a public site that explains the business case and technical method
- repo evidence that can be made public safely
- three existing phase-specific project repositories prepared as public proof surfaces
- validation and release checks that prove the public surface is not hand-waved

## Dashboard Views

### Sales Dashboard

Purpose:

- explain historical sales and consumption behavior
- show realized revenue and bounded margin signals where the financial foundation supports it

Key outputs:

- realized revenue
- realized gross margin
- realized margin rate
- fulfilled quantity
- consumption by account, region, product family, and product
- trend over time

### Supply Chain Decision Support

Purpose:

- connect demand pressure, replenishment recommendations, purchase orders, supplier lead times, and cost exposure

Key outputs:

- recommended quantity
- approved quantity
- ordered quantity
- received quantity
- open purchase quantity
- purchase cost amount
- queue-to-PO traceability

### Inventory Decision Support

Purpose:

- show location-level inventory posture and the logistics actions needed to support service

Key outputs:

- available quantity
- on-hand quantity
- reserved quantity
- in-transit quantity
- movement quantity
- active logistics action count
- inventory exposure

## Functional Requirements v2

V2-FR1: The project has a current PRD v2 that describes the operating-loop proof and current completion target.

V2-FR2: The project has an architecture delta that separates repo governance, Fabric execution, semantic/report handoff, public-site mirror, and public repo release concerns.

V2-FR3: The approved Bronze input package remains deterministic, public-safe, and validation-gated.

V2-FR4: Fabric Lakehouse refresh produces or exposes Bronze, Silver, Gold, runtime governance, and financial foundation outputs.

V2-FR5: Recommendation queues remain separate from executed purchase-order, movement, and fulfillment facts.

V2-FR6: Gold outputs are organized by dashboard subject: Sales, Supply Chain, and Inventory.

V2-FR7: The semantic contract lists all tables and measures required for the three dashboard views.

V2-FR8: The semantic-model sync status clearly reports which measures are live and which are blocked by missing table sync.

V2-FR9: The Power BI report contract defines three pages with business-readable visuals.

V2-FR10: The Power BI dashboard uses authenticated or request-access distribution, not anonymous Publish to web.

V2-FR11: The public site explains the operating loop, public-safe boundary, current proof status, safe dashboard screenshots, and request-access path.

V2-FR12: Public repo packaging prepares the three existing phase-specific project repos for public review and excludes private-prep, credentials, sensitive operational material, and noisy generated artifacts.

V2-FR13: Validation commands must pass before any public release or demo handoff.

V2-FR14: The final demo path can be followed in sequence without needing hidden context from the builder.

## Non-Functional Requirements v2

V2-NFR1: Claims must remain bounded and public-safe.

V2-NFR2: The project must not imply full enterprise Fabric administration, real-time production control, raw invoice-source finance, or ERP replacement.

V2-NFR3: Site build and Astro check must pass before public handoff.

V2-NFR4: Representative market validation must pass before treating data as current.

V2-NFR5: Fabric live state and semantic model state must be reported separately.

V2-NFR6: Power BI access must remain governed.

V2-NFR7: Public docs must prefer current-state honesty over polish.

V2-NFR8: Generated or mirrored data must be traceable to source package, Fabric manifest, or serving extract manifest.

## Definition Of Done

MVP v2 is done when:

- PRD v2, architecture delta, epics v2, and oversight map are accepted as current planning truth
- all operating-loop tables are available locally, in Fabric Lakehouse, and in the site serving mirror where applicable
- semantic model exposes the tables needed for the three dashboard views
- all `40` measures in the measure pack are patched or manually available in Power BI
- Power BI report has three pages matching the contract or enough proof-grade layout to support safe screenshots for the interview-ready milestone
- public site describes the operating loop, dashboard screenshots, and dashboard request-access path
- this Phase 3 repo's public exposure checklist is complete
- the existing Phase 1 and Phase 2 repo exposure strategy is documented
- validation commands pass
- demo script and reviewer map exist

## Explicit Deferrals

- real source system connectivity
- true real-time refresh
- writeback from Power BI to operational systems
- supplier optimization
- route optimization
- raw invoice-source financial reporting
- public anonymous Power BI publishing
- full Fabric ontology or Fabric IQ implementation
- custom transactional UI

## Accepted Direction

- Public release uses three existing phase-specific project repositories:
- `01-FABRIC-DATA-ENGINEERING-PROJECT-PHASE1`
- `02-FABRIC-DATA-ENGINEERING-PROJECT-PHASE 2`
- this repo, `03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3`
- This does not mean splitting the Phase 3 repo into three new repositories.
- Dashboard access uses screenshots plus request-access.
- Strict inventory snapshot reconciliation is labeled as a target-state gap.
- Finish line is interview-ready first, public launch second.

## Remaining Product Choices

- Should Power BI Desktop layout be proof-grade or highly polished portfolio-grade for the first screenshot pass?
- Should the site include a direct dashboard request form or a contact route CTA?

## Current Source References

- `docs/public-site/project-map.md`
- `docs/automation/current-data-pipeline-description.md`
- `docs/automation/operating-loop-architecture.md`
- `docs/automation/dashboard-view-contracts.md`
- `docs/public-site/communication-strategy.md`
- `05-compat/contracts/fab001_semantic_model_contract.json`
- `05-compat/contracts/fab001_core_visual_contract.md`
- `05-compat/contracts/fab001_semantic_model_sync_status.md`
- `_bmad-output/test-artifacts/fabric-proof/fab001/current/manifest.json`
