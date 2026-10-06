# Sprint Change Proposal

Date: 2026-03-30
Change Type: Scope refinement without sprint rollback
Status: Approved for planning alignment

## Issue Summary

Epic 3 was initially framed around a broad demand-to-inventory-readiness case. During implementation planning, a clearer product insight emerged:

- the strongest analytical value is not in a generic cross-functional story
- the strongest analytical value is in a **supply-chain decision-support tool**
- sales and logistics remain essential, but as input and execution layers around that main decision

Without this correction, Story 3.2 risked becoming either:

- a generic dashboard,
- three loosely related dashboard ideas,
- or a web narrative that sounded clear but hid an analytically vague product core

A second concern also became explicit: the product could start looking like an unnecessary pseudo-ERP or mini planning suite if it tried to solve sales, supply chain, and logistics at full depth in the same first analytical view.

## Impact Analysis

### PRD

Needs stronger language around:

- primary analytical value
- dashboard hierarchy
- bounded policy foundation
- MVP scope versus future expansion

### Architecture

Needs a more explicit primary decision question tied to inventory policy, placement, replenishment, and redistribution.

### UX Design

Needs the primary analytical visualization object anchored to the supply-chain decision view, with supporting view definitions for sales and logistics.

### Story Contract

Story 3.2 needs a tighter implementation contract:

- one primary decision question
- one bounded KPI set
- one bounded policy set
- a clear non-replacement position relative to ERP and planning suites
- explicit deferral of deeper sales and logistics views to Story 3.3 or later

### Epics and Stories

Epic 3 should remain intact but be interpreted more precisely:

- Story 3.1 = business tension and reading sequence
- Story 3.2 = primary supply-chain decision view
- Story 3.3 = supporting sales/logistics views

## Recommended Approach

Proceed without rollback through a **hybrid of direct adjustment and MVP review**.

1. Keep Story 3.1 as the framing layer already underway.
2. Update planning artifacts to reflect the refined product thesis and explicit non-replacement position.
3. Lock Story 3.2 around one primary KPI set and one public policy set.
4. Defer broader supporting views to Story 3.3 instead of expanding 3.2 into a multi-dashboard build.

This keeps momentum, avoids rollback, and reduces the risk of building an analytically vague or overly broad first dashboard.

## Implementation Handoff

This is a **moderate** sprint correction:

- no completed code needs to be reverted
- planning artifacts do need alignment
- Story 3.2 should be rewritten or created against the new contract immediately
- supporting demand and logistics views should remain explicitly subordinate

Primary handoff target:

- active sprint execution for Epic 3

Supporting handoff targets:

- product framing and copy decisions in the case-study route
- future visual refinement backlog after the analytical contract is stable

## Success Criteria

The correction is successful if:

- the repo consistently describes the analytical product as supply-chain-centered
- sales and logistics are framed as supporting views, not separate products
- Story 3.2 can be implemented with a clear main visualization question, KPI set, and policy layer
- copy refinement and future visual work now point to the same analytical core
- the MVP is visibly positioned as a decision-support layer rather than as an ERP or planning-suite replacement
