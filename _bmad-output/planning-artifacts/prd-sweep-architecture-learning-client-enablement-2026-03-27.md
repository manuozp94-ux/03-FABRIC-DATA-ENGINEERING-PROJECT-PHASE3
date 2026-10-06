# PRD Sweep: Architecture, Learning, and Client Enablement

Date: 2026-03-27
Scope: Review Steps 1-8 of the current PRD against new discussion rounds covering Fabric architecture rigor, DP-700 alignment, reusable client-delivery method, and jurisdiction-separated client/legal enablement.
Primary document reviewed: `_bmad-output/planning-artifacts/prd.md`

## Short Answer

The new rounds do influence the interpretation of the first 8 steps, but they do not invalidate them.

Current conclusion:

- Steps 1-8 remain directionally sound
- The core product scope is still coherent
- The new information mostly exposes underweighted themes rather than wrong decisions

## What The Existing PRD Already Covers Well

### Product Shape

- one bounded analytical MVP
- shared public surface
- analytical artifact first, web framing second
- SEO-forward multi-page web approach
- tight Phase 1 vs Phase 2 vs Phase 3 scope split

### Public-Safety and Data Discipline

- publication-safe boundary
- masking and abstraction logic
- incremental, bounded scenario-driven updates
- emphasis on stable grain and coherent cross-table behavior

### Technical Credibility

- technical depth must be legible from the same public surface
- Git/versioning/release notes are already treated as supporting proof
- troubleshooting and recoverability are already recognized in journeys

### Scope Guardrails

- CRM remains out of MVP
- legal/commercial packs are already pushed to Phase 2
- content engine and broader business systems are not part of Phase 1

## What Is Present But Still Underweighted

These themes exist in the PRD, but not yet strongly enough to guide downstream architecture and functional requirements.

### 1. Fabric Architecture Intent

The PRD says the project is Fabric-oriented, but it does not yet clearly lock:

- the canonical layer order
- the default MVP Fabric shape
- the minimum proof artifacts that make the architecture reviewable

### 2. DP-700 Learning Mission

The PRD implies learning value, but it does not explicitly say:

- the project is also a structured learning vehicle
- what DP-700-relevant evidence should be produced
- which exam-relevant themes are intentionally in or out of Phase 1

### 3. Reusable Delivery Method

The PRD is strong as a product brief for this case, but it is lighter than it should be on:

- what parts of the method are reusable across domains
- how future client engagements can inherit the process
- which artifacts should become standard templates

## What Is Newly Added Outside The PRD

The following ideas now exist in planning notes and companion scaffolding, but are not yet fully expressed in the PRD itself:

- reusable client-engagement operating layer
- Mexico and U.S. legal/commercial documentation packs
- domain-adaptable delivery method for future client cases
- stronger architecture-proof expectation
- stronger DP-700 evidence framing

Supporting companion note:

- `_bmad-output/planning-artifacts/client-engagement-legal-enablement-2026-03-27.md`

## What Should Change Going Forward

### Carry Into Step 9 Functional Requirements

Step 9 should explicitly include capabilities for:

- publication-safety review and approval before release
- stable data-contract validation
- release/change documentation
- route-level proof responsibilities on the public surface
- architecture-evidence outputs that strengthen Fabric credibility

### Carry Into Formal Architecture Workflow

The architecture workflow should explicitly decide:

- bounded MVP Fabric shape
- semantic-model ownership
- lineage/proof artifacts
- refresh and promotion model
- what is intentionally simplified for a public portfolio versus production

### Carry Into Supporting Learning Docs

The DP-700 layer should eventually document:

- what skill areas the MVP covers directly
- what evidence exists for lifecycle, governance, monitoring, and optimization
- what remains deferred

## Sweep Judgment By Prior Step

### Step 1-2c

Still valid. No rewrite needed.

### Step 3

Still valid. Success criteria already support shared-surface proof and technical credibility, but could later be reinforced with architecture-evidence language.

### Step 4

Still valid. Journeys already support public proof, versioning, troubleshooting, and business/technical dual-read.

### Step 5

Still valid. Domain-specific requirements still fit the current MVP.

### Step 6

Still valid. The innovation framing remains disciplined and should not be inflated.

### Step 7

Still valid. Web architecture choices still fit the product.

### Step 8

Still valid and now more important. The phase split correctly keeps legal/commercial enablement out of Phase 1.

## Net Recommendation

Do not rewrite Steps 1-8 from scratch.

Instead:

1. treat this sweep as a companion interpretation layer
2. let Step 9 functional requirements absorb the new architecture/evidence expectations
3. let the later architecture workflow absorb the detailed Fabric decisions
4. keep the new client-enablement layer as a parallel support system, not as a Phase 1 expansion

## Practical Takeaway

We are not missing the mission.

We are refining it into four aligned lanes:

- public analytical proof
- Fabric architecture credibility
- DP-700-aligned learning evidence
- reusable client-engagement method

That is a strengthening move, not a reset.
