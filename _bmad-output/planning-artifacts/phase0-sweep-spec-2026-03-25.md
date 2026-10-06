# Phase 0 Sweep Specification

## Purpose

Phase 0 exists to create a controlled bridge between fragmented historical business artifacts and the public-facing MVP data slice. It is not the public portfolio itself. It is the upstream preparation work required to identify canonical source families, preserve useful business behavior, and produce publication-safe inputs for Microsoft Fabric.

The purpose of this sweep is to reduce ambiguity before implementation. It should help answer four questions:

- Which historical files belong to the same source family?
- Which files represent the latest or most useful versions within each family?
- Which records or structures overlap, conflict, or duplicate one another?
- Which bounded source slice is sufficient for the MVP without attempting full enterprise-wide consolidation?

## Scope

Phase 0 should remain planning-led and evidence-driven.

In scope:

- inventorying historical workbook and dashboard families
- identifying likely source families for the MVP
- detecting version overlap, duplicate files, and naming drift
- documenting candidate canonical sources for each MVP source family
- defining masking and abstraction implications for the selected slice
- identifying bounded data-quality issues that should be preserved as controlled realism
- defining the first canonical output contracts needed by the MVP

Out of scope:

- full enterprise-wide consolidation across every historical artifact
- final implementation of the complete canonical data model
- full masking execution across all domains
- broad ontology delivery across the entire future portfolio
- finance-grade reconciliation across all historical sources
- any claim that Phase 0 produces a final source of truth for the full program

## Core Inputs

The Phase 0 sweep should start from the historical archive and prioritize the MVP source families already selected during product-brief work.

Initial priority source families:

- Product Information
- Customer Demand
- Stock Overview
- Account Assignments

Related evidence families to inspect for overlap or later extensions:

- Open Orders
- Inventory Balance Summary
- Inventory Valuation
- Stock Transfer Tool
- Target Stock Plan
- historical Power BI and dashboard artifacts that reveal logic, grain, and naming conventions

## Primary Deliverables

Phase 0 should produce the following planning and evidence outputs:

1. Source Family Inventory  
   A register of workbook families, file variants, dates, and probable business purpose.

2. Version and Overlap Matrix  
   A view of which files appear to supersede, duplicate, subset, or conflict with other files.

3. Canonical Source Candidate Register  
   A decision-oriented table showing the leading candidate source for each MVP family, with rationale and known caveats.

4. Grain and Key Notes  
   A short set of notes on business grain, likely primary keys, natural keys, and join risks.

5. Controlled Realism Register  
   A small list of bounded data-quality issues worth preserving or simulating because they represent real enterprise conditions.

   Current reference:
   - `_bmad-output/planning-artifacts/controlled-realism-register-2026-04-01.md`

6. Masking and Abstraction Implications  
   A document of entity-level masking needs, especially for product identity, customer or account identity, location identity, and operational codes.

7. Initial Canonical Output Contract Drafts  
   Early contracts for:
   - `dim_product`
   - `dim_product_family`
   - `dim_account`
   - `dim_inventory_location`
   - `fact_demand_line`
   - `fact_inventory_snapshot`
   - synthetic economic proxy rules

## Working Method

### Pass 1: Inventory and Classification

Goal:  
Build a structured inventory of the relevant files and group them into candidate source families.

Questions:

- Which folders contain repeated versions of the same business extract?
- Which files appear operational, analytical, or reference-oriented?
- Which file names include reliable date signals?
- Which artifacts likely contain the same business entities at different cuts or grains?

Outputs:

- source family inventory
- first-pass file classification
- file-date extraction notes

### Pass 2: Overlap and Canonical Candidate Analysis

Goal:  
Determine which source within each family should be treated as the best candidate for MVP use.

Questions:

- Which files are latest snapshots versus reusable templates?
- Where do apparent subsets exist, such as `Open Orders` versus `Customer Demand`?
- Which files are operationally closer to current-state readiness versus historical valuation?
- Which source is most suitable for the MVP even if it is not perfect?

Outputs:

- overlap matrix
- canonical source candidate register
- grain and key notes

### Pass 3: MVP Preparation Design

Goal:  
Translate the selected evidence into a bounded prep design for the MVP.

Questions:

- What fields are required for the MVP modeled entities?
- What masking or abstraction is mandatory before public use?
- Which source imperfections should remain as controlled realism?
- Which transformations should happen upstream of the public Fabric platform?

Outputs:

- masking and abstraction implications
- controlled realism register
- initial canonical output contract drafts

## Decision Rules

- Prefer sources that match the MVP grain and business question over sources that are merely broader.
- Prefer operationally legible sources for the first slice over financially richer but more complex sources.
- Treat likely subsets such as `Open Orders` as derived views unless evidence proves a materially different business role.
- Do not require a perfect raw master table when a derived dimension is more honest and sufficient for the MVP.
- Preserve behavior before identity.
- If two candidate sources conflict, document the conflict instead of forcing premature unification.
- If a source adds significant complexity but little MVP value, defer it.

## Known Starting Assumptions

- `Customer Demand` is the canonical demand source candidate.
- `Open Orders` is likely a derived active-status subset rather than a separate MVP source family.
- `Stock Overview` is the canonical operational inventory-readiness source candidate.
- `Inventory Balance Summary` and valuation-oriented sources are likely later extensions.
- `Account Assignments` provides meaningful service-network and fulfillment context.
- `dim_inventory_location` should be derived rather than assumed from a perfect raw location master.
- `dim_product_family` should be derived from operational product attributes.
- the MVP economic layer will be fully synthetic and should not depend on raw pricing or cost files.

## Risks to Watch

- file families with heavy overlap but inconsistent naming
- dashboards or workbooks that embed business rules without explicit source lineage
- silent grain changes across yearly versions
- date ambiguity between extract date, snapshot date, and business event date
- accidental leakage of enterprise identity through product, account, or location labels
- scope creep from “inventory the MVP slice” into “rebuild the full historical archive”

## Exit Criteria

Phase 0 is complete enough for the next planning step when:

- the MVP source families have named canonical source candidates
- major overlap and subset relationships are documented
- likely grain and join risks are noted
- masking and abstraction implications are documented for the MVP slice
- controlled realism decisions are documented
- the controlled realism register exists as a named artifact
- first-pass output contracts exist for the MVP modeled entities

## Relationship to PRD and Implementation

- The PRD should describe what the product must do.
- Phase 0 should describe how historical evidence will be narrowed into safe, bounded, MVP-ready inputs.
- Implementation should only begin after the sweep has reduced ambiguity enough to avoid avoidable rework.
