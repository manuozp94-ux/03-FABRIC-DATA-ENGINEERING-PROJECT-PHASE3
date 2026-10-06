# Epics V2 Trello Mirror: Operating-Loop Decision System

Status: active Trello mirror
Date: 2026-04-15
Canonical source: `_bmad-output/planning-artifacts/epics-v2-operating-loop-decision-system-2026-04-15.md`

This file maps the V2 operating-loop plan into the numeric epic/story shape expected by `scripts/trello_hybrid_sync.py`.
The contractual V2 naming remains `v2.1` through `v2.6`; Trello uses Epics 8-13 to continue after completed Epics 1-7.

## Epic 8: Rebaseline Project Governance

Establish the V2 planning baseline so future work is governed by current product truth.

### Story 8.1: Publish Rebaseline Planning Pack

As a portfolio owner,
I want the V2 planning pack to exist as an explicit baseline,
so that the next work starts from current product truth instead of the older MVP story.

**Acceptance Criteria:**

- PRD v2 exists
- architecture delta exists
- epics v2 exist
- oversight map exists
- current docs reference the V2 planning baseline

### Story 8.2: Update Current-State Documentation Spine

As a reviewer,
I want the system-flow and publication docs to reflect the operating-loop architecture,
so that the repo stops telling the older, simpler story.

**Acceptance Criteria:**

- `docs/public-site/project-map.md` points to the V2 baseline
- `docs/automation/current-data-pipeline-description.md` separates Lakehouse, semantic model, site mirror, and report status
- `docs/automation/logic-first-fabric-proof-workflow.md` reflects that operating-loop tables are now materialized
- `docs/automation/publication-validation-flow.md` reflects current operating-loop validation

### Story 8.3: Define Oversight Cadence And Decision Log

As a builder,
I want open decisions, sequence, and completion criteria visible,
so that oversight is easier when scope shifts.

**Acceptance Criteria:**

- open decisions are listed
- next build sequence is visible
- completion criteria are testable
- blocked items have owners or explicit next actions

## Epic 9: Complete Operating-Loop Integrity

Make the bounded operating loop credible as a causal decision-support model.

### Story 9.1: Validate Queue-To-Execution Traceability

As a technical reviewer,
I want recommendations separated from executed facts,
so that the model can explain intent without pretending every recommendation happened.

**Acceptance Criteria:**

- supply-chain approved recommendations can be tied to purchase-order lines or explicitly remain unexecuted
- logistics approved recommendations can be tied to movements, fulfillment, or explicitly remain unexecuted
- validation reports mismatches without promoting unsafe results

### Story 9.2: Validate Lead-Time Rules

As a supply-chain reviewer,
I want receipt, transfer, and service timing to resolve through governed lead-time tables,
so that the operating loop has credible timing behavior.

**Acceptance Criteria:**

- purchase-order receipt dates respect supplier-product lead-time rules
- transfer arrivals respect location-transfer lead-time rules
- sales fulfillment dates respect service lead-time rules
- exceptions are blocked or explicitly classified

### Story 9.3: Decide Inventory Snapshot Reconciliation Scope

As a demo presenter,
I want strict reconciliation framed honestly as target-state work,
so that the current bounded proof remains credible without overstating event-sourced accounting completeness.

**Acceptance Criteria:**

- current snapshot-generation method is documented
- target event-ledger reconciliation rule is documented
- strict event-ledger reconciliation is declared as a target-state gap
- public language names the current bounded V1 as explanatory, not full event-sourced inventory accounting
- demo language does not weaken the current proof or overstate causal completeness

### Story 9.4: Add Inventory Conservation Validation

As a data quality owner,
I want inventory movement math validated before release,
so that the dashboard is supported by explicit conservation checks.

**Acceptance Criteria:**

- validation checks receipts, transfer outs, transfer ins, fulfillment, and ending inventory
- tolerances are explicit
- failures block release or route to candidate diagnostics

## Epic 10: Finish Semantic Model And Power BI Dashboard

Make the three dashboard views available through a governed Power BI surface.

### Story 10.1: Sync Missing Tables Into Semantic Model

As a report builder,
I want the operating-loop fact tables available in the semantic model,
so that the three dashboard pages can use the same governed model.

**Acceptance Criteria:**

- missing table parts are added or synced for `fact_sales_realization`
- missing table parts are added or synced for `fact_sales_fulfillment_line`
- missing table parts are added or synced for `fact_supply_chain_decision_queue_line`
- missing table parts are added or synced for `fact_purchase_order_line`
- missing table parts are added or synced for `fact_logistics_decision_queue_line`
- missing table parts are added or synced for `fact_inventory_movement_line`

### Story 10.2: Apply Full Measure Pack

As a semantic model owner,
I want all 40 bounded measures patched successfully,
so that the dashboard contract and live model are aligned.

**Acceptance Criteria:**

- `materialize_fab001_semantic_model.py` reports `requested_measure_count = 40`
- `patched_measure_count = 40`
- skipped measures equal `0`
- sync status doc is updated

### Story 10.3: Author Sales Dashboard Page

As a sales stakeholder,
I want a business-first page for history, trend, customer, region, product-family, and product consumption,
so that realized sales value can be explained in USD.

**Acceptance Criteria:**

- page exists in Power BI
- visuals match the contract
- realized revenue and margin language remains bounded
- page can be explained without private context

### Story 10.4: Author Supply Chain Decision Support Page

As a supply-chain stakeholder,
I want a page that connects demand, inventory posture, and purchase-order recommendations,
so that cost exposure and replenishment decisions are explainable.

**Acceptance Criteria:**

- page exists in Power BI
- visuals match the contract
- queue-to-PO traceability is visible
- purchase-order cost exposure is visible

### Story 10.5: Author Inventory Decision Support Page

As a logistics stakeholder,
I want a page that shows inventory by location and needed actions,
so that transfer and fulfillment posture can be understood in cost terms.

**Acceptance Criteria:**

- page exists in Power BI
- visuals match the contract
- inventory posture by location is visible
- logistics actions and movements are visible

### Story 10.6: Configure Dashboard Access Path

As a public reviewer,
I want screenshots and a request-access path instead of anonymous dashboard exposure,
so that the proof is visible without weakening governance.

**Acceptance Criteria:**

- anonymous Publish to web is not used
- access path is request-based or authenticated
- safe screenshots are captured or prepared for the public site
- public site explains how to request access
- dashboard screenshots or preview images are safe if used

## Epic 11: Polish Public Site Demo Narrative

Make the public site the clean explanation surface for the operating-loop proof.

### Story 11.1: Update Case Study Around Operating Loop

As a hiring reviewer,
I want the case study to start with the operating problem,
so that the technical work reads as a solution instead of a tool inventory.

**Acceptance Criteria:**

- business problem starts with operating loop, not tool list
- Sales, Supply Chain, and Inventory views are introduced as one system
- public-safe boundary is stated plainly

### Story 11.2: Update Technical Method With Current Fabric State

As a technical reviewer,
I want the site to distinguish Lakehouse, semantic model, report, and target-state gaps,
so that the architecture is honest and easy to defend.

**Acceptance Criteria:**

- Lakehouse table count and layer status are current
- semantic model partial/full state is described honestly
- current-vs-target architecture is visible

### Story 11.3: Add Dashboard Request-Access CTA

As a reviewer,
I want a clear path to request dashboard access,
so that the public site can show evidence without opening protected BI content anonymously.

**Acceptance Criteria:**

- CTA exists on relevant route
- CTA avoids implying anonymous public access
- contact path is clear

### Story 11.4: Build Demo Walkthrough Page Or Section

As an interview presenter,
I want a guided demo route,
so that the project can be reviewed without requiring me to narrate every dependency live.

**Acceptance Criteria:**

- reviewer can follow the story without the builder narrating every detail
- demo sequence covers business problem, architecture, Fabric, dashboard, and repo evidence

## Epic 12: Prepare Public Repo Release

Publish or prepare the existing phase-specific GitHub repositories that support review without leaking private material.

### Story 12.1: Decide Repo Packaging Strategy

As a portfolio publisher,
I want the existing Phase 1, Phase 2, and Phase 3 repositories selected as the packaging strategy,
so that each project phase has a clean review boundary.

**Acceptance Criteria:**

- the existing Phase 1, Phase 2, and Phase 3 repositories are selected as the packaging strategy
- phase boundaries are documented
- private-only paths are excluded
- Phase 3 is prioritized first for interview readiness

### Story 12.2: Create Public Exposure Checklist

As a release owner,
I want a safety checklist before public repo exposure,
so that credentials, private prep, and generated artifacts are handled deliberately.

**Acceptance Criteria:**

- credential scan requirement is listed
- private-prep exclusion is listed
- generated artifact inclusion rules are listed
- public README requirements are listed

### Story 12.3: Prepare Phase README Files

As a public reviewer,
I want each phase repo to explain its role,
so that the portfolio reads as a sequence instead of one oversized dump.

**Acceptance Criteria:**

- Phase 1 repo README explains foundation
- Phase 2 repo README explains architecture/public-safe reset
- Phase 3 repo README explains operating-loop proof
- each README links to public-safe evidence only
- Phase 3 README is prepared before Phase 1 and Phase 2 README polish

### Story 12.4: Run Public Release Validation

As a publisher,
I want final validation before repository release,
so that the public surface is coherent and safe.

**Acceptance Criteria:**

- site build passes
- site check passes
- representative validation passes
- publication boundary review is complete

## Epic 13: Demo And Interview Readiness

Make the project explainable under interview, recruiter, and technical-review pressure.

### Story 13.1: Create Demo Script

As a candidate,
I want 5-minute, 12-minute, and technical-deep-dive scripts,
so that I can adapt the story to different interview contexts.

**Acceptance Criteria:**

- 5-minute version exists
- 12-minute version exists
- technical deep-dive path exists
- all claims map to repo evidence
- strict inventory reconciliation is described as target-state gap
- dashboard screenshots plus request-access are described as the access model

### Story 13.2: Create Reviewer Map

As a presenter,
I want reviewer-specific paths,
so that recruiters, hiring managers, technical reviewers, and business stakeholders can each find the right evidence quickly.

**Acceptance Criteria:**

- recruiter path exists
- hiring manager path exists
- technical reviewer path exists
- business stakeholder path exists

### Story 13.3: Create Defense Q&A

As a candidate,
I want concise answers for likely objections,
so that AI assistance, repo verbosity, architecture gaps, and bounded finance claims are easy to explain.

**Acceptance Criteria:**

- AI-assisted work answer exists
- repo verbosity answer exists
- current-vs-target Fabric answer exists
- bounded finance answer exists
- semantic model gap answer exists

### Story 13.4: Final Smoke Review

As a demo owner,
I want one final readiness pass,
so that nothing in the public demo requires private data or fragile live narration to defend.

**Acceptance Criteria:**

- public site opens locally
- dashboard access story is explainable
- repo evidence path is explainable
- no claim requires private data to defend
