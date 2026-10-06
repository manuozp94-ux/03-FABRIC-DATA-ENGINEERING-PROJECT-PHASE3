# Epics v2: Operating-Loop Decision System

Status: draft rebaseline
Date: 2026-04-15
Source PRD: `_bmad-output/planning-artifacts/prd-v2-operating-loop-decision-system-2026-04-15.md`
Scope decisions: `_bmad-output/planning-artifacts/scope-decisions-v2-2026-04-15.md`

## Epic v2.1: Rebaseline Project Governance

Goal:

- establish the V2 planning baseline so future work is governed by current product truth

Stories:

### Story v2.1.1: Publish Rebaseline Planning Pack

Acceptance criteria:

- PRD v2 exists
- architecture delta exists
- epics v2 exist
- oversight map exists
- current docs reference the V2 planning baseline

### Story v2.1.2: Update Current-State Documentation Spine

Acceptance criteria:

- `docs/public-site/project-map.md` points to the V2 baseline
- `docs/automation/current-data-pipeline-description.md` separates Lakehouse, semantic model, site mirror, and report status
- `docs/automation/logic-first-fabric-proof-workflow.md` reflects that operating-loop tables are now materialized
- `docs/automation/publication-validation-flow.md` reflects current operating-loop validation

### Story v2.1.3: Define Oversight Cadence And Decision Log

Acceptance criteria:

- open decisions are listed
- next build sequence is visible
- completion criteria are testable
- blocked items have owners or explicit next actions

## Epic v2.2: Complete Operating-Loop Integrity

Goal:

- make the bounded operating loop credible as a causal decision-support model

Stories:

### Story v2.2.1: Validate Queue-To-Execution Traceability

Acceptance criteria:

- supply-chain approved recommendations can be tied to purchase-order lines or explicitly remain unexecuted
- logistics approved recommendations can be tied to movements, fulfillment, or explicitly remain unexecuted
- validation reports mismatches without promoting unsafe results

### Story v2.2.2: Validate Lead-Time Rules

Acceptance criteria:

- purchase-order receipt dates respect supplier-product lead-time rules
- transfer arrivals respect location-transfer lead-time rules
- sales fulfillment dates respect service lead-time rules
- exceptions are blocked or explicitly classified

### Story v2.2.3: Decide Inventory Snapshot Reconciliation Scope

Acceptance criteria:

- current snapshot-generation method is documented
- target event-ledger reconciliation rule is documented
- strict event-ledger reconciliation is declared as a target-state gap
- public language names the current bounded V1 as explanatory, not full event-sourced inventory accounting
- demo language does not weaken the current proof or overstate causal completeness

### Story v2.2.4: Add Inventory Conservation Validation

Acceptance criteria:

- validation checks receipts, transfer outs, transfer ins, fulfillment, and ending inventory
- tolerances are explicit
- failures block release or route to candidate diagnostics

## Epic v2.3: Finish Semantic Model And Power BI Dashboard

Goal:

- make the three dashboard views available through a governed Power BI surface

Stories:

### Story v2.3.1: Sync Missing Tables Into Semantic Model

Acceptance criteria:

- missing table parts are added or synced for `fact_sales_realization`
- missing table parts are added or synced for `fact_sales_fulfillment_line`
- missing table parts are added or synced for `fact_supply_chain_decision_queue_line`
- missing table parts are added or synced for `fact_purchase_order_line`
- missing table parts are added or synced for `fact_logistics_decision_queue_line`
- missing table parts are added or synced for `fact_inventory_movement_line`

### Story v2.3.2: Apply Full Measure Pack

Acceptance criteria:

- `materialize_fab001_semantic_model.py` reports `requested_measure_count = 40`
- `patched_measure_count = 40`
- skipped measures equal `0`
- sync status doc is updated

### Story v2.3.3: Author Sales Dashboard Page

Acceptance criteria:

- page exists in Power BI
- visuals match the contract
- realized revenue and margin language remains bounded
- page can be explained without private context

### Story v2.3.4: Author Supply Chain Decision Support Page

Acceptance criteria:

- page exists in Power BI
- visuals match the contract
- queue-to-PO traceability is visible
- purchase-order cost exposure is visible

### Story v2.3.5: Author Inventory Decision Support Page

Acceptance criteria:

- page exists in Power BI
- visuals match the contract
- inventory posture by location is visible
- logistics actions and movements are visible

### Story v2.3.6: Configure Dashboard Access Path

Acceptance criteria:

- anonymous Publish to web is not used
- access path is request-based or authenticated
- safe screenshots are captured or prepared for the public site
- public site explains how to request access
- dashboard screenshots or preview images are safe if used

## Epic v2.4: Polish Public Site Demo Narrative

Goal:

- make the public site the clean explanation surface for the operating-loop proof

Stories:

### Story v2.4.1: Update Case Study Around Operating Loop

Acceptance criteria:

- business problem starts with operating loop, not tool list
- Sales, Supply Chain, and Inventory views are introduced as one system
- public-safe boundary is stated plainly

### Story v2.4.2: Update Technical Method With Current Fabric State

Acceptance criteria:

- Lakehouse table count and layer status are current
- semantic model partial/full state is described honestly
- current-vs-target architecture is visible

### Story v2.4.3: Add Dashboard Request-Access CTA

Acceptance criteria:

- CTA exists on relevant route
- CTA avoids implying anonymous public access
- contact path is clear

### Story v2.4.4: Build Demo Walkthrough Page Or Section

Acceptance criteria:

- reviewer can follow the story without the builder narrating every detail
- demo sequence covers business problem, architecture, Fabric, dashboard, and repo evidence

## Epic v2.5: Prepare Public Repo Release

Goal:

- publish or prepare the existing phase-specific GitHub repositories that support review without leaking private material

Stories:

### Story v2.5.1: Decide Repo Packaging Strategy

Acceptance criteria:

- the existing Phase 1, Phase 2, and Phase 3 repositories are selected as the packaging strategy
- phase boundaries are documented
- private-only paths are excluded
- Phase 3 is prioritized first for interview readiness

### Story v2.5.2: Create Public Exposure Checklist

Acceptance criteria:

- credential scan requirement is listed
- private-prep exclusion is listed
- generated artifact inclusion rules are listed
- public README requirements are listed

### Story v2.5.3: Prepare Phase README Files

Acceptance criteria:

- Phase 1 repo README explains foundation
- Phase 2 repo README explains architecture/public-safe reset
- Phase 3 repo README explains operating-loop proof
- each README links to public-safe evidence only
- Phase 3 README is prepared before Phase 1 and Phase 2 README polish

### Story v2.5.4: Run Public Release Validation

Acceptance criteria:

- site build passes
- site check passes
- representative validation passes
- publication boundary review is complete

## Epic v2.6: Demo And Interview Readiness

Goal:

- make the project explainable under interview, recruiter, and technical-review pressure

Stories:

### Story v2.6.1: Create Demo Script

Acceptance criteria:

- 5-minute version exists
- 12-minute version exists
- technical deep-dive path exists
- all claims map to repo evidence
- strict inventory reconciliation is described as target-state gap
- dashboard screenshots plus request-access are described as the access model

### Story v2.6.2: Create Reviewer Map

Acceptance criteria:

- recruiter path exists
- hiring manager path exists
- technical reviewer path exists
- business stakeholder path exists

### Story v2.6.3: Create Defense Q&A

Acceptance criteria:

- AI-assisted work answer exists
- repo verbosity answer exists
- current-vs-target Fabric answer exists
- bounded finance answer exists
- semantic model gap answer exists

### Story v2.6.4: Final Smoke Review

Acceptance criteria:

- public site opens locally
- dashboard access story is explainable
- repo evidence path is explainable
- no claim requires private data to defend
