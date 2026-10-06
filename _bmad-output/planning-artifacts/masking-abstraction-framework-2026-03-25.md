# Masking and Abstraction Framework

Date: 2026-03-25
Purpose: Define how confidential historical business data should be transformed into publication-safe, behaviorally coherent analytical inputs for the portfolio and future Fabric implementations.

## Core Principle

The objective is not to preserve enterprise identity. The objective is to preserve business behavior.

This framework treats masking as a controlled abstraction process rather than as a simple renaming exercise. The public portfolio should retain realistic operational patterns, business-rule relationships, and analytical usefulness without exposing company identity, customer identity, proprietary nomenclature, or source-system lineage.

## Design Goals

- Preserve the business behaviors that make the case study credible.
- Remove or abstract enterprise-identifying attributes.
- Keep the transformed model analytically useful for Microsoft Fabric delivery.
- Support incremental updates over time.
- Make the public domain coherent enough to explain and defend professionally.
- Keep the abstraction reusable for future case studies, not only for one dashboard.

## Controlled Realism

Realistic enterprise friction should be preserved intentionally, not generated randomly. The goal is to retain or simulate believable imperfections that justify architecture, data-quality controls, testing, and governance decisions without introducing meaningless noise.

Preserve or introduce only bounded, explainable issues such as:

- overlapping historical snapshots or workbook versions
- naming drift across files, nodes, or reporting layers
- late-arriving or partially populated records
- differences between active-order and broader demand views
- evolving location taxonomies or storage codes over time
- incomplete master-data coverage where it mirrors real operational conditions

Avoid artificial noise such as:

- random typographical errors with no pattern
- arbitrary null injection
- inconsistencies that do not map to a real business problem
- synthetic corruption that adds complexity without analytical value

Working rule:
- upstream private-preparation layers may retain or simulate bounded imperfections
- downstream public analytical layers should demonstrate how those conditions are detected, standardized, tested, and governed

Canonical register:
- `_bmad-output/planning-artifacts/controlled-realism-register-2026-04-01.md`

## Preservation Rules

The following classes of information should be preserved in behavior, even if their labels or values are abstracted:

- demand patterns and line-item grain
- fulfillment and inventory readiness logic
- relative differences between inventory nodes
- product-family differences relevant to planning or storage
- planning categories and replenishment logic
- lead-time, availability, and allocation patterns
- pricing, costing, and margin relationships where later needed
- cross-functional relationships between sales, logistics, supply chain, and finance

## Abstraction Rules

The following classes of information should be abstracted or masked by default:

- legal entity names
- customer names and account names
- direct account IDs and external references
- product names, branded descriptions, and SKU conventions that reveal the source business
- warehouse, 3PL, site, and storage-location names
- internal personnel names and operational contacts
- source-system labels, source filenames, and internal reporting vocabulary that reveal provenance

## Abstraction Layers

### Layer 1: Identity Removal

Remove or replace identifiers that directly reveal the original enterprise environment.

Examples:
- Replace customer names with neutral account labels.
- Replace site and 3PL names with masked inventory-node labels.
- Replace people and role owners with generalized role categories.

### Layer 2: Structural Normalization

Reshape inconsistent historical files into canonical entities with stable keys and dates.

Examples:
- unify repeated workbook families into one canonical table per domain
- assign stable surrogate keys
- convert workbook snapshots into explicit event or snapshot dates
- normalize headers and units

### Layer 3: Domain Translation

Only when necessary, translate the source business domain into a sufficiently generalized public equivalent.

The default recommendation is to prefer a neutral and credible domain such as:
- component distribution network
- multi-site operational supply and demand environment
- industrial parts distribution and replenishment environment

A full industry swap should only be used when lighter abstraction still leaves too much identifiable context.

### Layer 4: Behavioral Validation

After abstraction, validate that the transformed model still supports the target analytical questions.

Examples:
- Can demand still be compared to inventory readiness?
- Can products still be grouped into operational families?
- Can inventory nodes still be analyzed by role, readiness, and suitability?
- Can account-to-service-network relationships still be explained?

## Entity-Specific Masking Guidance

### Products

Preserve:
- stable product grain
- product-family behavior
- planning model behavior
- package, pallet, weight, and storage-relevant attributes when useful

Abstract:
- branded product names
- source SKU conventions when identifiable
- source category labels when too industry-specific

Recommended output:
- `dim_product`
- `dim_product_family`

### Accounts and Customers

Preserve:
- account grain
- channel or account-type differences
- relevant demand behavior by account group
- account-to-service-network relationships

Abstract:
- customer names
- direct account identifiers
- contract or agreement references
- identifiable market names

Recommended output:
- `dim_account`
- optional masked account-group hierarchy

### Inventory Locations and Service Network

Preserve:
- node role differences
- site versus storage-location structure
- 3PL versus internal node distinctions
- readiness and allocation relevance

Abstract:
- site names
- warehouse names
- 3PL brand names
- storage-location codes when directly identifying

Recommended output:
- `dim_inventory_location`
- optional `dim_inventory_node_type`

Suggested masked categories:
- internal warehouse
- external logistics partner
- transit node
- floor storage area
- quarantine or restricted area
- overflow or conditional inventory node

### Contacts and Operating Roles

Preserve:
- role existence where analytically useful
- functional ownership categories

Abstract:
- person names
- direct contact details

Recommended output:
- generalized role attributes only when required

### References and Operational Documents

Preserve:
- event timing and business relevance
- whether a reference exists and what process it belongs to

Abstract:
- raw purchase order references
- customer document references
- enterprise-specific codes

Recommended output:
- masked operational reference IDs only if needed for traceability inside the public model

## Product Family Abstraction Approach

The MVP should include a derived family classification that supports inventory organization and readiness storytelling.

The first public family design should be based on operational behavior, not brand nomenclature.

Suggested family dimensions:
- long-profile or rail-like items
- kits and attachment bundles
- small hardware and fasteners
- bulky or pallet-intensive items
- specialty or constrained-planning items

Candidate source attributes for deriving families:
- product system family
- forecasting category
- product category description
- weight
- box quantity
- pallet quantity
- planning model

## Industry Translation Guidance

Industry translation should be applied progressively.

### Preferred Path

1. Start with masking and neutral labeling.
2. Test whether the portfolio still feels too traceable.
3. Only then introduce a stronger industry translation layer.

### Decision Rule

If the transformed model still reveals too much through product vocabulary, channel structure, or logistics terminology, move from neutral abstraction to a public equivalent industry framing.

The target public domain does not need to be identical to the original one. It only needs to behave similarly enough to support the analytical logic.

## Dates and Time Logic

Dates should be preserved in analytical function but not necessarily in exact public business chronology.

Preserve:
- time order
- periodicity
- seasonality where useful
- snapshot or event semantics

Adjust only when needed:
- exact dates
- exact recency
- exact cadence of enterprise events

Recommended output fields:
- `event_date`
- `snapshot_date`
- `effective_start_date`
- `effective_end_date`
- `load_date`

## Metrics and Numeric Treatment

Preserve:
- relative relationships
- operational thresholds
- ranking and mix behavior
- volume patterns sufficient for case credibility

Consider abstracting when necessary:
- exact unit prices
- exact margins
- exact quantities where scale itself is identifying

Safe transformation options:
- scaling within a controlled factor
- bucketing into ranges
- ratio-preserving transformations
- family-level aggregation where detailed exposure is unnecessary

## Incremental and Public-Safe Data Strategy

The transformed public model should support periodic refresh, not only one-time publication.

Recommended design:
- canonical private source tables upstream
- masking and abstraction layer with stable surrogate keys
- publication-safe snapshot or event tables downstream
- explicit update dates on all major facts

This allows the portfolio to simulate or maintain a living analytical system without exposing raw confidential lineage.

## MVP Application for the Current Project

For the first MVP, the abstraction boundary should focus on four source families:

- Product Information
- Customer Demand
- Stock Overview
- Account Assignments

The MVP public model should derive at least the following entities:

- `dim_product`
- `dim_product_family`
- `dim_account`
- `dim_inventory_location`
- `fact_demand_line`
- `fact_inventory_snapshot`
- optional masked assignment bridge between accounts and service-network context

## Non-Goals

The framework does not require the following in the MVP:

- full enterprise-wide canonicalization of every historical file
- one perfect final abstraction for every domain at once
- full ontology design before publication of the first case
- full physical-capacity optimization logic
- fully automated masking of every edge case before the first publishable slice

## Working Rule for Future Phases

When in doubt, choose the simplest abstraction that preserves analytical credibility while reducing traceability.

Escalate to a stronger domain translation only when lighter masking is not sufficient.
