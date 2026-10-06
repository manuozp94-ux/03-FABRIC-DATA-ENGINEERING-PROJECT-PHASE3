# Analytical Product Definition

Date: 2026-03-30
Status: Active refinement anchor

## Why This Exists

The project reached a useful checkpoint in Epic 3: the case-study route was already explaining cross-functional tension, but the product itself was still described too generically as a demand-to-inventory-readiness case.

This note anchors the sharper definition needed for the next phase of work so that:

- the main analytical product is described consistently across planning artifacts
- the copy stays aligned with the actual decision value of the tool
- Story 3.2 and later visualization work do not drift into three disconnected dashboard ideas

## Product Thesis

The product is best understood as a **supply-chain decision-support tool**, not as a general sales dashboard and not as a standalone logistics control tower.

Its job is to clarify:

- how much inventory should be held
- where inventory should be held
- when inventory should be replenished or redistributed

It uses:

- **sales signals** to understand demand behavior and commercial pressure
- **logistics conditions** to understand whether the network can execute the intended policy

In short:

**primary analytical value lives in supply chain**
**sales provides demand signal**
**logistics constrains execution**

## Positioning Against ERP and Planning Suites

The MVP should not be described as a replacement for an ERP, WMS, OMS, or advanced planning suite.

Its role is narrower and more honest:

- clarify a cross-functional inventory decision
- translate fragmented operational evidence into a governed analytical layer
- make the trade-off between demand pressure, inventory exposure, and execution constraints easier to inspect

The product proves analytical structure and publication discipline. It does not claim to automate enterprise planning end to end.

## Core Decision Question

The central question for the MVP is:

**Is the current inventory position and replenishment posture aligned with expected demand and target service levels without creating unnecessary inventory exposure?**

This is stronger than a generic "what is happening in the data?" framing because it turns the case into a decision-support product rather than a reporting showcase.

## Team Objectives in the Modeled Scenario

The case should explicitly preserve the fact that each team is optimizing for a different success signal:

- **Sales:** highest grossing outcome possible
- **Supply Chain:** lowest practical inventory value possible
- **Logistics:** fastest and most stable lead time possible

These objectives are all valid. The analytical product exists to make the trade-off between them visible enough to support better decisions.

## Dashboard Hierarchy

The MVP should be described as one analytical product with a clear hierarchy of views.

### 1. Primary View

**Supply Chain Decision View**

Purpose:

- evaluate whether inventory policy and readiness are aligned to expected demand and service goals

Likely content:

- inventory exposure
- service-level assumptions or readiness target
- coverage or policy class
- replenishment or production suggestion bands
- decision interpretation

### 2. Supporting View

**Sales Demand View**

Purpose:

- explain why the supply-chain decision view is under pressure

Likely content:

- sales history
- trend by customer, product, region, or family
- consumption patterns
- demand concentration
- later commercial extensions such as margin-oriented analysis

### 3. Supporting View

**Logistics Distribution View**

Purpose:

- explain whether the network can support the desired inventory posture

Likely content:

- inventory by location
- central versus secondary storage role
- transfer suggestions
- classification of transfer actions such as necessary, optional, or not convenient
- later route-cost or movement-efficiency analysis

## Policy Foundation Required Before Full Visualization Depth

The product should not pretend to know the "correct" inventory position without a policy layer behind it.

Before the case expands into stronger prescriptive logic, it needs a bounded public policy foundation such as:

- service-level target by inventory class
- inventory policy class
- lead-time band assumptions
- replenishment rule bands
- transfer or redistribution criteria
- central-warehouse versus secondary-location assumptions

For the public MVP, this policy can remain synthetic and bounded. It does not need to be a full planning engine to be analytically credible.

## MVP Boundaries

The MVP should not try to deliver all three domains at full depth simultaneously.

Instead, it should deliver:

- one **primary supply-chain decision view**
- one or two **supporting views** that explain demand and execution context

The product should not become:

- a broad multi-dashboard reporting suite
- a full MRP or network-optimization engine
- a generic sales reporting portal
- a logistics control tower pretending to automate dispatch

## Story 3.2 MVP Contract

Story 3.2 should lock one bounded primary decision view before the project expands into supporting views.

### Primary Viewer Question

**Can the current inventory position support expected demand and target service conditions without carrying unnecessary inventory exposure?**

### Primary KPI Set

The first public analytical view should stay centered on five readable signals:

- **Inventory Coverage Days**
- **Service Readiness Rate**
- **Inventory Value Exposure**
- **Recommended Action Status** (`hold`, `replenish or produce`, `transfer`, `monitor`)
- **Reporting Window**

These KPIs are enough to show the decision posture without pretending the MVP already contains a full planning engine.

### Public Policy Set

The primary view should be interpreted through a small, explicit policy layer:

- **Inventory Policy Class**
- **Target Service Level Band**
- **Coverage Target Band**
- **Lead Time Band**
- **Location Role**

This policy foundation is synthetic and bounded, but it is still necessary if the case is going to claim that some inventory positions are healthier or riskier than others.

### Deferred Supporting Views

The following ideas remain valid, but should stay out of Story 3.2:

- sales demand concentration and trend analysis
- logistics transfer classification and redistribution suggestions
- deeper commercial extensions such as margin-heavy analysis
- route-cost or movement-efficiency logic

Those belong in Story 3.3 or a later extension, not in the first main decision view.

## Implications For Copy and UX

- The case-study route should describe the product first as a supply-chain decision-support tool.
- Sales and logistics should still be visible, but as contributing perspectives rather than competing product definitions.
- The primary analytical visualization should be anchored to the supply-chain question.
- Supporting visualizations should explain demand pressure and distribution consequences without replacing the main story.

## Implications For Epic 3

- **Story 3.1** frames the conflict and names the KPI pressure of each team.
- **Story 3.2** should build the primary supply-chain analytical view and its core measures.
- **Story 3.3** should add supporting views for sales demand and/or logistics execution without fragmenting the product.
- **Story 3.4** should keep freshness and update context tied to the same product story.
