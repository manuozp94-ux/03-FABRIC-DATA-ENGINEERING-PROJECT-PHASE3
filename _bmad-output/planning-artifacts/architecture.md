---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
  - 7
  - 8
lastStep: 8
status: 'complete'
completedAt: '2026-03-27'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief-FABRIC_PLATFORM_DEV_BMAD-2026-03-20.md
  - _bmad-output/planning-artifacts/masking-abstraction-framework-2026-03-25.md
  - _bmad-output/planning-artifacts/mvp-data-contracts-2026-03-25.md
  - _bmad-output/planning-artifacts/phase0-source-family-register-2026-03-25.md
  - _bmad-output/planning-artifacts/phase0-sweep-spec-2026-03-25.md
  - _bmad-output/planning-artifacts/future-integration-decisions-2026-03-26.md
  - _bmad-output/planning-artifacts/prd-sweep-architecture-learning-client-enablement-2026-03-27.md
  - docs/research/fabric/index.md
  - docs/research/fabric/source-registry.md
  - docs/research/fabric/distilled-notes/dp-700-study-guide.md
workflowType: 'architecture'
project_name: 'FABRIC_PLATFORM_DEV_BMAD'
user_name: 'Manuel'
date: '2026-03-27'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

The PRD defines 43 functional requirements across seven capability areas. Architecturally, they describe one bounded public product with four primary route responsibilities: landing, case study, technical method, and contact. The product is not a generic portfolio website and not a generalized data platform. It is one governed analytical case study that must make business value legible first and technical credibility legible second from within the same shared experience.

The core product capabilities imply three distinct working zones:

1. a private working and preparation zone where historical evidence is narrowed, standardized, masked, and validated
2. a governed publishable analytics zone where the MVP data contracts, modeled entities, semantic logic, and release artifacts are produced
3. a public delivery zone where the analytical proof is framed through an indexable web experience

This separation is central to the architecture. The system is not only required to produce analytical outputs, but to enforce what may and may not cross from private preparation into public publication.

**Business Semantics:**

The canonical business use case is a supply-chain inventory decision problem informed by commercial demand and constrained by multi-site logistics. The primary decision question is whether the analytical product can clarify inventory policy, placement, replenishment, and redistribution choices across sales, supply chain, and logistics without exposing confidential source structure. The primary business value is decision clarification, not operational automation.

Architecturally, this product should be treated as a decision-support layer over fragmented systems, not as a replacement transaction backbone or a full planning suite. That constraint protects scope, keeps the public MVP honest, and prevents the design from drifting into pseudo-ERP behavior.

The architecture therefore treats the analytical product hierarchy explicitly:

- a primary supply-chain decision view
- a sales-oriented demand context layer
- a logistics-oriented execution context layer

This means the architecture must preserve:

- demand behavior
- inventory-readiness behavior
- product-family behavior
- account and service-context behavior
- location and node-role behavior

It must also preserve one bounded Phase 1 proof: that fragmented business evidence can be translated into a publication-safe, Fabric-oriented analytical product with one coherent public case and one clear primary decision surface.

**Non-Functional Requirements:**

The non-functional requirements make this architecture credibility-sensitive in three dimensions: public experience quality, public-safety discipline, and solo-builder sustainability.

Performance, accessibility, responsive behavior, and SEO are not cosmetic concerns. They constrain rendering strategy, route decomposition, metadata ownership, and how the public proof is delivered. Reliability, rollback, and traceability are also architecture-shaping because unsafe or incoherent public releases would damage both technical trust and business credibility.

Security and privacy requirements are especially important because the system includes public contact paths, a publication-safe data boundary, and explicit restrictions against Phase 1 contact-database behavior. The architecture must support minimal contact handling, but must not drift into a custom audience-management or CRM-like subsystem.

**Scale & Complexity:**

This is a high-complexity project because several hard constraints meet in one bounded MVP:

- publication-safe transformation of fragmented historical evidence
- stable public data contracts over evolving inputs
- bounded incremental growth without semantic drift
- dual-audience proof in one shared public surface
- release governance, rollback, and traceability for public analytical artifacts
- SEO-forward and accessibility-aware web delivery
- solo-builder maintainability with minimal operational sprawl

- Primary domain: Fabric-centered analytical product with public web delivery
- Complexity level: High
- Estimated architectural components: 8 major component zones

### Technical Constraints & Dependencies

**Source Family Classification:**

The architecture depends on a narrow operational source slice rather than broad enterprise coverage. The confirmed MVP source families are:

- Product Information as the primary product and attribute source
- Customer Demand as the canonical demand source
- Stock Overview as the canonical operational inventory-readiness source
- Account Assignments as the service and fulfillment context source

Related sources such as Open Orders and Inventory Balance Summary remain reference or extension candidates, not core MVP inputs, unless later evidence proves a materially different business role.

**Data Contract Dependencies:**

The MVP is constrained by explicit contracts for:

- `dim_product`
- `dim_product_family`
- `dim_account`
- `dim_inventory_location`
- `fact_demand_line`
- `fact_inventory_snapshot`
- synthetic economic proxy outputs

These contracts establish the canonical business grain, minimum required fields, masking expectations, and quality rules. Architecture must assume contract versioning, compatibility rules, and breaking-change control are required, even if the implementation remains lightweight in Phase 1.

**Boundary, Lifecycle, and Environment Dependencies:**

The architecture must support a lifecycle that includes source preparation, masking, validation, refresh, publication, and rollback. That means Step 2 must already recognize the need for:

- clear private-to-public artifact boundaries
- release gates for publication safety and contract validation
- identifiable last-known-good public states
- traceability from public release back to source commit, data state, and change rationale
- at least a minimal environment and promotion model, even if solo-operated

The project is also shaped by a secondary dependency: it should produce reviewable Fabric evidence that supports DP-700-aligned learning. That raises the importance of lifecycle management, governance, observability, and semantic ownership beyond what a normal portfolio site would require.

**Reusable Delivery Model:**

This architecture is not only a one-off portfolio design. It is also the first reference implementation of a reusable delivery pattern. The architecture therefore needs to distinguish:

- what is case-specific to this demand-to-inventory-readiness scenario
- what should become reusable for future client-safe analytical case studies
- what must remain internal to private preparation or client-specific contexts

This affects naming, packaging, release discipline, documentation, and future extension paths.

### Cross-Cutting Concerns Identified

The following concerns will influence multiple architectural decisions:

- publication safety and masking enforcement as release gates
- stable business grain and versioned public data-contract validation
- explicit private working zone vs governed publishable zone vs public delivery zone
- source-family ambiguity and subset handling, especially around demand and inventory-related evidence
- release governance, rollback, traceability, and last-known-good identification
- lifecycle management including refresh cadence, validation behavior, and promotion logic
- observability requirements such as freshness visibility, release IDs, validation status, and change auditability
- web-delivery constraints including SEO, accessibility, responsive readability, and route-level proof ownership
- solo-builder maintainability through limited moving parts and bounded operational scope
- reusable delivery-method standardization without expanding Phase 1 into a generalized consulting platform
- explicit Phase 1 scope protection against CRM, custom contact database, broad content-platform expansion, or client-ops system drift

## Starter Template Evaluation

### Primary Technology Domain

Public web delivery for a Fabric-centered analytical product, with content-first multi-page routing and selective interactivity.

### Starter Options Considered

**Astro with optional React integration**  
Best fit for the current PRD. Astro is optimized for content-driven websites, defaults to minimal client-side JavaScript, supports strong SEO and static-first delivery, and can add React only where interactive components are needed. This aligns well with the MVP's shared public surface, route-level proof responsibilities, and solo-builder maintainability constraints.

**Next.js default App Router starter**  
A credible alternative with stronger mainstream React recognition and mature routing, metadata, and deployment patterns. It fits if the public product later becomes more application-like, but it introduces more framework weight than the current Phase 1 public surface requires.

**Custom empty starter**  
Rejected. It would increase setup cost, reduce consistency, and delay publishability without adding architectural value for the current MVP.

### Selected Starter: Astro

**Rationale for Selection:**  
Astro best matches the current architecture constraints: SEO-forward multi-page delivery, minimal client-side JavaScript, strong content presentation, and selective interactivity. It supports a public proof surface that stays lightweight while preserving room for React-based components if later case-study visuals or interactions need them.

**Initialization Command:**

```bash
pnpm create astro@latest
```

**Recommended setup choices during initialization:**

- TypeScript: yes
- Starter: minimal or basic official starter
- Install dependencies: yes
- Initialize git: yes

**Follow-up integration command:**

```bash
pnpm astro add react
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**  
TypeScript-first web project with Node.js-based local development and build tooling.

**Styling Solution:**  
Keep styling lean at first. Do not let the starter force a design-system-heavy direction before the analytical artifact exists. Tailwind or plain scoped styling can be evaluated later, but styling should remain subordinate to clarity and performance.

**Build Tooling:**  
Astro provides a static-first build model with support for server-rendered behavior where needed. This supports the current public-proof architecture better than a client-heavy app shell.

**Testing Framework:**  
No strong need to lock test tooling in the starter step. Testing choices should be made later based on route behavior, component complexity, and deployment flow.

**Code Organization:**  
Multi-page content structure with explicit route ownership fits the PRD well: landing, case study, technical method, and contact.

**Development Experience:**  
Low operational overhead, fast local iteration, and the ability to add React only where necessary make Astro a strong fit for a solo builder with bounded Phase 1 scope.

**Note:** Project initialization using this command should be the first implementation story. This starter decision applies to the public web layer only. The Fabric analytical platform, private preparation workflow, and publication-safe data lifecycle remain separate architectural concerns and should not be collapsed into the web starter choice.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- Use a three-zone architecture: private preparation zone, governed Fabric analytics zone, and public delivery zone.
- Use a Fabric-centered analytical spine with public-safe landed inputs, curated modeled outputs, and a bounded semantic serving layer.
- Treat the public website as a separate delivery layer that consumes a versioned publication package rather than querying private analytical sources directly.
- Do not implement public end-user authentication, a custom app database, or a custom public data API in Phase 1.
- Enforce publication-safety and data-contract validation as release gates before public publication.

**Important Decisions (Shape Architecture):**

- Use a contract-first dimensional serving model bounded to the MVP entities and facts already defined in planning.
- Use Astro for the public web layer, with React islands only where selective interactivity is necessary.
- Use static-first public delivery and route-local interactivity instead of app-wide client state.
- Use minimal environment separation that still supports release control: local and preview/production for the web layer, and at least development and publishable stages for the Fabric layer.
- Avoid using Power BI Publish to web as the primary public delivery mechanism because it creates public exposure risks and weakens control of the shared public surface.
- Treat manual Power BI report composition as a late delivery step that follows stable serving logic rather than a discovery mechanism for unresolved business rules.

**Deferred Decisions (Post-MVP):**

- Custom CRM or contact database behavior
- Public user accounts and authentication flows
- Public REST or GraphQL APIs
- Real-time or streaming public web interactions
- Warehouse-first or multi-serving-surface expansion if Lakehouse-centered serving proves insufficient
- Advanced frontend state management or application-shell behavior

### Data Architecture

**Primary Analytical Storage Model:**  
Use a Fabric-centered, medallion-aligned flow for the public-safe analytical system:

- public-safe landed source tables
- standardized and validated modeled preparation layer
- curated serving layer for dimensions, facts, and proxy metrics
- bounded semantic layer for analytical proof

**Serving Model Decision:**  
Use the MVP data contracts as the canonical business-model contract for the analytical layer. The governing entities remain:

- `dim_product`
- `dim_product_family`
- `dim_account`
- `dim_inventory_location`
- `fact_demand_line`
- `fact_inventory_snapshot`

**Application Database Decision:**  
Do not introduce a separate custom application database for the public website in Phase 1. The site does not need its own persistent relational store to fulfill the MVP.

**Validation Strategy:**  
Use contract-first validation at the boundaries between:

- private preparation and governed Fabric inputs
- governed analytical outputs and public publication package
- public publication package and deployed public release

Validation must fail closed. If masking, grain, compatibility, or publication checks fail, the public release does not advance.

**Historical Update Strategy:**  
Use append and snapshot-friendly update behavior with explicit dates and version traceability. Avoid destructive rewriting of public-facing historical states unless a controlled correction is required.

**Logic-First Delivery Workflow:**  
Treat business-rule parameterization, incremental fact generation, and Fabric-side serving stability as the gating path for future proof refinement. The preferred sequence is:

- deterministic rule sets and scenario parameters
- approved incremental package refresh
- Bronze / Silver / Gold Fabric refresh
- semantic-model refresh
- optional manual report composition once logic is stable

**Caching Strategy:**  
Use static-first publication for the website. Favor prebuilt pages, versioned artifacts, and lightweight generated content over live query caching against analytical systems.

### Authentication & Security

**Public Authentication Decision:**  
Do not implement end-user authentication for the public site in Phase 1.

**Administrative Access Model:**  
Administrative and release actions should rely on existing platform identities and repository controls rather than custom auth flows. That means Git-based source control, hosting-platform access control, and Fabric workspace permissions remain the primary control surfaces.

**Authorization Pattern:**  
Use least-privilege separation by zone:

- private preparation artifacts remain private
- governed analytical artifacts remain controlled
- public delivery artifacts contain only approved, publication-safe outputs

**Contact Handling Security:**  
If a contact form exists in Phase 1, it should route to an approved managed inbox or service and must not create a reusable custom contact database.

**Encryption Strategy:**  
Rely on managed platform defaults for encryption in transit and at rest. Do not introduce bespoke cryptography into the MVP architecture.

### API & Communication Patterns

**Public API Decision:**  
Do not create a custom public REST or GraphQL API in Phase 1.

**Inter-Zone Communication Decision:**  
Use a versioned publication package as the contract between the governed Fabric analytics zone and the public website. This package may contain approved JSON summaries, markdown or narrative artifacts, exported visuals, metadata, release references, and bounded links to analytical proof artifacts.

**Error Handling Standard:**  
Treat most failure handling as release-time validation, not runtime fallback logic. The system should prefer refusing publication over serving questionable public proof.

**Public Analytical Delivery Decision:**  
Do not rely on Power BI Publish to web as the sole or default public delivery mechanism. If any embedded or linked Fabric or Power BI artifact is later exposed publicly, it must pass explicit publication-safety review and remain subordinate to the curated public web experience.

### Frontend Architecture

**Framework Decision:**  
Use Astro as the public web framework. Keep React available only for selective interactive components that materially improve understanding of the case study.

**Version Baseline:**  
Assume:

- Node.js `22.12.0+`
- Astro current `6.x` line
- `@astrojs/react` matching integration line when selectively introduced later
- React `19.2`

**State Management Decision:**  
Use server- and content-driven rendering by default. Avoid global client-side state management in Phase 1 unless a later page proves it is necessary.

**Routing Decision:**  
Keep the route spine explicit and small:

- landing
- case study
- technical method
- contact

Support pages remain outside the main route spine:

- privacy
- `terms` when FR43 remains in launch scope

If FR43 remains in Phase 1 launch scope, implement `terms` as a pre-rendered public support route linked from both the contact and privacy pages. Keep that minimal terms or usage notice in the public-site route layer rather than relying on separate client-enablement documentation to fulfill the launch requirement.

**Performance Decision:**  
Pre-render wherever practical. Use progressive enhancement for interactive elements. Keep JavaScript budgets lean and treat heavy hydration as an exception that must justify itself.

**Styling Decision:**  
Do not let the initial implementation overcommit to a heavy design-system architecture before the analytical proof is working. Use a maintainable token-based styling foundation that can absorb later visual-direction work without replatforming the site.

### Infrastructure & Deployment

**Web Hosting Decision:**  
Use a managed platform that supports low-friction Astro deployment and preview workflows. Vercel is the current default choice for the public web layer because it supports Astro cleanly and reduces operational overhead.

**Source Control Decision:**  
Use Git as the canonical source of truth for website code, technical evidence, and release history.

**Fabric Lifecycle Decision:**  
Use Fabric lifecycle capabilities such as Git integration and deployment or promotion patterns where feasible, but keep the MVP implementation bounded and understandable. The goal is credible lifecycle discipline, not maximum platform complexity.

**Environment Decision:**  
Use minimal but explicit environment separation:

- web: local, preview, production
- Fabric: development and publishable stages at minimum

**Monitoring and Logging Decision:**  
Use lightweight operational observability suited to a solo builder:

- deployment logs
- build logs
- validation status
- release identifiers
- freshness metadata
- last-known-good release references

**Scaling Decision:**  
Rely on static-first delivery and managed hosting elasticity rather than building custom scaling mechanisms.

### Decision Impact Analysis

**Implementation Sequence:**

1. establish the private/public boundary and publication package contract
2. build the governed Fabric analytical slice around the MVP data contracts
3. define semantic and proof outputs required for the public case
4. scaffold the Astro public surface
5. connect curated publication artifacts into the shared public experience
6. add release validation, traceability, and rollback mechanics
7. layer in selective React-based interactivity only where it improves comprehension

**Cross-Component Dependencies:**

- the public site depends on the governed publication package, not on private analytical sources
- release governance depends on data-contract validation and publication-safety review
- technical credibility on the public surface depends on Fabric lifecycle and semantic outputs being versioned and explainable
- later visual-design work depends on the web layer staying technically lightweight and structurally stable

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**  
The highest-risk conflict points for this project are:

- naming differences between Fabric data contracts and web-layer code
- route and file naming inconsistencies in the public web layer
- disagreement about where publication artifacts live and how they are consumed
- inconsistent date, freshness, and release-metadata formats
- inconsistent validation and error-reporting behavior across zones
- drift between static-first delivery and ad hoc runtime data access
- accidental introduction of global client state, public APIs, or custom persistence that Phase 1 does not allow

### Naming Patterns

**Data Contract Naming Conventions:**  
Public analytical contract fields must remain in `snake_case` when they are defined in publication artifacts or contract payloads. This preserves stability with the analytical layer and avoids silent schema drift.

Examples:

- `product_family_key`
- `snapshot_date`
- `generated_at_utc`
- `release_id`

**Code Naming Conventions:**  
Application code should use standard TypeScript naming:

- components: `PascalCase`
- functions and variables: `camelCase`
- constants: `UPPER_SNAKE_CASE` only when truly constant
- route folders and non-component filenames: `kebab-case`

Examples:

- component: `CaseStudyHero.astro`
- React island: `TrendExplorer.tsx`
- utility: `mapPublicationSummary.ts`
- route file: `src/pages/technical-method.astro`

**Boundary Rule:**  
Do not rename analytical contract fields at the source to make them "look more frontend-like." If UI-friendly names are needed, adapt them explicitly in a small mapping layer at the web boundary.

### Structure Patterns

**Project Organization:**  
The public site should stay route-oriented and lightweight.

Recommended structure:

- `src/pages` for route ownership
- `src/layouts` for page shells
- `src/components` for shared UI building blocks
- `src/components/case-study` for case-specific UI pieces when needed
- `src/lib` for adapters, formatting, validation helpers, and metadata utilities
- `src/content` only if editorial content grows enough to justify it
- `src/data/publication` or equivalent for approved generated publication artifacts consumed by the site
- `public/` for static assets that do not need compilation

**Testing Structure:**  
If tests are added in Phase 1:

- component or utility tests may be colocated
- end-to-end tests should live in a dedicated top-level testing area such as `tests/e2e`

This keeps small verification close to code while preserving a clear place for public-surface validation.

**Artifact Boundary Structure:**  
Private preparation outputs must never be mixed into the public web source tree. Only approved publication-package artifacts may cross into the web-delivery layer.

### Format Patterns

**Publication Artifact Formats:**  
Publication artifacts should use explicit, machine-readable fields and stable envelopes.

Preferred metadata fields:

- `release_id`
- `artifact_version`
- `generated_at_utc`
- `snapshot_date`
- `freshness_note` when needed for interpretation

**Date and Time Format Rule:**  
All machine-readable timestamps should be ISO 8601 UTC.

Examples:

- `2026-03-27T14:15:00Z`
- `2026-03-27`

If a human-readable display format is used in the UI, it should be derived from the canonical machine-readable value rather than stored separately as the source of truth.

**Boolean and Null Handling:**  
Use true JSON booleans and explicit `null` values where absence is real. Do not use `1/0`, `"yes/no"`, or placeholder strings such as `"N/A"` inside structured contract payloads unless the contract explicitly requires it.

**Internal Validation Result Format:**  
Internal build or validation outputs should use a simple consistent structure.

Example:

```json
{
  "status": "failed",
  "message": "Publication contract validation failed",
  "details": ["missing snapshot_date", "invalid masking classification"]
}
```

### Communication Patterns

**Inter-Zone Communication Rule:**  
The public site must consume approved publication artifacts only. It must not query private analytical stores directly and must not depend on a custom public API in Phase 1.

**UI Communication Pattern:**  
Use direct props and local composition for page-to-component communication. Avoid introducing an event bus, cross-page client messaging layer, or shared global browser state unless a later architectural update explicitly approves it.

**React Island Scope Rule:**  
React islands should be small, intentional, and local to a page concern. They are enhancements to explanation, not the core delivery model.

Examples of acceptable island use:

- scenario toggles
- small chart interaction
- bounded comparison controls

Examples to avoid in Phase 1:

- global app shell state
- site-wide client store
- runtime data orchestration across pages

### Process Patterns

**Validation Timing Rule:**  
Validation should happen before publication, not after public release. If publication-safety or contract checks fail, the release stops.

**Loading-State Pattern:**  
Because the web layer is static-first, loading states should be rare and local. Use them only where an explicitly interactive component needs them.

Preferred pattern:

- static content first
- minimal local loading indicator for a bounded island if necessary
- no app-wide spinner architecture

**Error Handling Pattern:**  
Separate user-facing errors from diagnostic errors.

User-facing errors should:

- stay plain and calm
- explain what the visitor can still do next
- avoid leaking technical details

Diagnostic outputs should:

- remain in logs, validation outputs, or release artifacts
- include contract and release context where useful

**Release Pattern:**  
Every meaningful public release should be traceable to:

- a source-control state
- a publication artifact version
- a validation outcome
- a last-known-good fallback reference

### Enforcement Guidelines

**All AI Agents MUST:**

- preserve the three-zone boundary: private preparation, governed analytics, and public delivery
- preserve the contract-first analytical model and not invent replacement entities or fields casually
- preserve the static-first web model and avoid introducing public APIs, public auth, or custom persistence in Phase 1
- document any justified exception where a pattern must be bent for a concrete reason
- avoid silent renaming, silent scope expansion, or silent boundary crossing

**Pattern Enforcement:**

- review new files and code paths against these rules before merge or adoption
- treat architecture.md as the source of truth for consistency defaults
- record any exception or pattern change in the architecture document or a linked decision note before relying on it broadly

### Pattern Examples

**Good Examples:**

- A publication artifact exposes `snapshot_date`, while the UI formats it into a readable label without changing the source field name.
- A case-study interactive block is implemented as one small React island inside an Astro page rather than turning the whole route into a client-heavy app.
- A release is blocked because masking validation failed, and the site keeps the last known good published state.

**Anti-Patterns:**

- Renaming `fact_inventory_snapshot` fields in the generated artifact just to match frontend taste
- Adding a custom API route so the website can query analytical data live in Phase 1
- Introducing a contact database because a form was added
- Creating a global client store for a site that mainly serves pre-rendered case-study pages
- Mixing private-preparation files into the web-facing artifact directory

## Project Structure & Boundaries

### Requirements Mapping

- FR Category: Public Discovery & Navigation -> `apps/public-site/src/pages/`, `apps/public-site/src/components/navigation/`
- FR Category: Business Problem Framing -> `apps/public-site/src/pages/case-study.astro`, `apps/public-site/src/components/case-study/`
- FR Category: Analytical Case Delivery -> `platform/fabric/contracts/`, `platform/fabric/publication/`, `apps/public-site/src/data/publication/current/`
- FR Category: Technical Credibility & Learning Evidence -> `apps/public-site/src/pages/technical-method.astro`, `apps/public-site/src/components/technical-method/`, `docs/research/fabric/`
- FR Category: Publication Governance & Data Stewardship -> `platform/fabric/private-prep/`, `platform/fabric/validation/`, `platform/fabric/publication/releases/`
- FR Category: Release & Traceability -> `.github/workflows/`, `platform/fabric/publication/releases/`, `tests/publication/`, `_bmad-output/implementation-artifacts/`
- FR Category: Engagement & Legal Readiness -> `apps/public-site/src/pages/contact.astro`, `apps/public-site/src/pages/privacy.astro`, `apps/public-site/src/pages/terms.astro`, `docs/client-enablement/`

### Complete Project Directory Structure

```text
03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3/
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── .env.example
├── .gitignore
├── .github/
│   └── workflows/
│       ├── public-site-ci.yml
│       └── publication-validation.yml
├── _bmad/
├── _bmad-output/
│   ├── planning-artifacts/
│   ├── implementation-artifacts/
│   └── test-artifacts/
├── docs/
│   ├── research/
│   │   └── fabric/
│   ├── client-enablement/
│   └── architecture-decisions/
│       └── README.md
├── apps/
│   └── public-site/
│       ├── package.json
│       ├── astro.config.mjs
│       ├── tsconfig.json
│       ├── .env.example
│       ├── public/
│       │   └── assets/
│       └── src/
│           ├── pages/
│           │   ├── index.astro
│           │   ├── case-study.astro
│           │   ├── technical-method.astro
│           │   ├── contact.astro
│           │   ├── privacy.astro
│           │   └── terms.astro
│           ├── layouts/
│           │   └── SiteLayout.astro
│           ├── components/
│           │   ├── navigation/
│           │   ├── case-study/
│           │   ├── technical-method/
│           │   └── contact/
│           ├── islands/
│           │   └── TrendExplorer.tsx
│           ├── lib/
│           │   ├── publication/
│           │   │   ├── types.ts
│           │   │   ├── loaders.ts
│           │   │   ├── formatters.ts
│           │   │   └── assertions.ts
│           │   ├── seo/
│           │   └── format/
│           ├── data/
│           │   └── publication/
│           │       └── current/
│           │           ├── release-metadata.json
│           │           ├── case-study-summary.json
│           │           ├── analytical-snapshot.json
│           │           └── technical-method.md
│           └── styles/
│               ├── global.css
│               └── tokens.css
├── platform/
│   └── fabric/
│       ├── README.md
│       ├── contracts/
│       │   ├── dim_product.schema.json
│       │   ├── dim_product_family.schema.json
│       │   ├── dim_account.schema.json
│       │   ├── dim_inventory_location.schema.json
│       │   ├── fact_demand_line.schema.json
│       │   └── fact_inventory_snapshot.schema.json
│       ├── private-prep/
│       │   ├── source-selection/
│       │   ├── masking/
│       │   └── validation/
│       ├── validation/
│       │   ├── publication-rules/
│       │   └── release-checks/
│       ├── publication/
│       │   ├── manifests/
│       │   ├── current/
│       │   └── releases/
│       │       └── <release_id>/
│       │           ├── manifest.json
│       │           ├── validation-report.json
│       │           └── publication-package/
│       └── automation/
│           ├── validate-publication.ts
│           ├── promote-release.ts
│           └── sync-web-publication.ts
├── tests/
│   ├── e2e/
│   │   └── public-site/
│   ├── publication/
│   │   ├── contracts/
│   │   └── releases/
│   └── fixtures/
│       └── publication/
│           ├── valid/
│           └── invalid/
└── scripts/
    └── repo/
        ├── checks/
        ├── release/
        └── maintenance/
```

### Architectural Boundaries

**Public Web Boundary:**  
`apps/public-site/` is the public delivery layer only. It may render approved publication artifacts, public pages, and minimal contact or legal pages. It must not contain private preparation logic or raw business evidence.

**Governed Fabric Boundary:**  
`platform/fabric/` is the governed analytical zone. It owns contracts, validation, publication manifests, release evidence, and promotion. It does not own the public presentation layer.

**Private Preparation Boundary:**  
`platform/fabric/private-prep/` exists for source narrowing, masking, and private validation before public-safe publication. Nothing from this area may be imported into the public site or copied into public assets directly.

**Publication Package Boundary:**  
`platform/fabric/publication/releases/<release_id>/` is the durable archive of approved releases. `platform/fabric/publication/current/` is the currently promoted governed package. `apps/public-site/src/data/publication/current/` is a generated mirror of the currently approved package for static site consumption. No hand-authored business data lives in the web copy.

**Documentation Boundary:**  
`docs/research/`, `docs/client-enablement/`, and `docs/architecture-decisions/` remain reference and enablement materials. They support the product and future delivery practice, but they are not runtime dependencies for the public web app.

### Component Boundaries

- Route pages own route-level composition and metadata.
- Shared components own presentation patterns, not business-contract mutation.
- `src/islands/` is reserved for isolated client-side enhancements only.
- `src/lib/publication/` owns loading, typing, assertions, and UI-boundary formatting for approved publication data.
- Fabric automation owns publication generation and promotion, not public rendering.

### Service and Data Boundaries

- No custom public API in Phase 1.
- No custom application database in Phase 1.
- `apps/public-site/` may read only from approved publication data prepared for the web layer.
- Contract schemas live in `platform/fabric/contracts/` and remain the analytical source of truth.
- Release metadata must connect publication artifacts, validation status, and deployed public state.

### Verification Boundaries

**Allowed:**

- public site reads generated publication copy
- tests read fixtures and approved release artifacts
- automation promotes only validated publication packages

**Read-Only:**

- `platform/fabric/publication/releases/`
- `platform/fabric/publication/current/`
- `apps/public-site/src/data/publication/current/` once synced for a release

**Prohibited in Phase 1:**

- public-site imports from `private-prep/`
- API routes for analytical retrieval
- custom persistence for contact capture
- hidden alternate data paths around publication validation

### Parallel Work Readiness

Once this structure is saved, safe parallel work opens up across:

- `apps/public-site/` for the web surface
- `platform/fabric/` for publication, validation, and release flow
- `docs/` for research, evidence, and client-enablement follow-ons

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**  
The architecture is internally coherent. Astro, static-first delivery, local React islands, no public API, no custom app database, and a versioned publication package all reinforce the same product strategy. The Fabric-centered analytical spine, the three-zone boundary, and the public web layer fit together without contradiction.

No conflicting architecture decisions were identified. The remaining open items are implementation-bootstrapping details, not architecture-level disagreements.

**Pattern Consistency:**  
The implementation patterns support the architectural decisions well. Naming rules, publication-boundary rules, static-first defaults, and fail-closed validation behavior all match the chosen stack and the publication-safety goals. The patterns reduce the most likely sources of drift: field renaming, boundary crossing, ad hoc data access, and unnecessary client complexity.

**Structure Alignment:**  
The project structure supports the architecture. The public site, governed Fabric layer, private preparation layer, validation areas, release evidence, and documentation surfaces each have a clear home. The current structure also supports the intended release model, where approved publication artifacts move into the public web layer through a controlled boundary rather than direct runtime access.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**  
All major FR categories from the PRD are architecturally supported:

- Public discovery and navigation are supported by the Astro route spine and shared page/layout structure.
- Business problem framing and analytical case delivery are supported by the case-study route, publication package design, and component boundaries.
- Technical credibility and learning evidence are supported by the technical-method route, Fabric contracts, release evidence, and research docs.
- Publication governance and data stewardship are supported by private-prep, validation, release artifacts, and fail-closed promotion rules.
- Release, observability, and traceability are supported by publication manifests, release folders, validation outputs, and last-known-good concepts.
- Engagement and legal readiness are supported by the contact route plus privacy and optional `terms` support pages in the public site, while longer client-enablement documentation remains separate from the launch-critical public routes.

**Non-Functional Requirements Coverage:**  
The architecture supports the key NFRs:

- Performance: static-first Astro delivery, limited islands, lean JS expectations
- Security and privacy: no public API, no Phase 1 app database, private/public separation, publication gates
- Reliability and recoverability: release archives, validation reports, last-known-good fallback model
- Accessibility and responsive support: route-based site structure with controlled presentation layer
- SEO and discoverability: multi-page public surface, explicit route ownership, metadata-friendly delivery
- Maintainability and traceability: contract-first modeling, folder boundaries, release evidence, architecture decision space

### Implementation Readiness Validation ✅

**Decision Completeness:**  
Critical architectural decisions are documented clearly enough to guide implementation. The stack, platform boundaries, data-flow model, release model, and scope protections are all explicit.

**Structure Completeness:**  
The project structure is concrete enough for implementation. Major directories, ownership boundaries, release locations, and verification surfaces are defined. Future agents should not need to guess where core responsibilities live.

**Pattern Completeness:**  
The implementation rules cover the most important conflict points: naming, structure, data formats, communication boundaries, validation timing, and release behavior. They are strong enough to prevent most agent-level inconsistency during early delivery.

### Gap Analysis Results

**Critical Gaps:**  
None identified. No missing decision currently blocks implementation.

**Important Gaps:**  
A small set of early implementation decisions should be handled explicitly in the first stories or ADRs so agents do not improvise them differently:

- exact publication manifest schema and required fields
- exact sync and promotion contract between `platform/fabric/publication/current/` and `apps/public-site/src/data/publication/current/`
- exact validation command sequence for local, preview, and CI execution
- exact test-tool selection for the public site and publication-package checks

These are not architecture blockers, but they are the main areas where early implementation could drift if left implicit.

**Nice-to-Have Gaps:**  

- Mermaid or visual architecture diagrams for onboarding
- a lightweight release checklist template
- a visual-build handoff note once the aesthetic phase starts

### Validation Issues Addressed

The main issues discovered during validation were not contradictory decisions, but under-specified early-delivery seams. These were addressed by making the architecture more explicit about:

- validation and release-evidence boundaries
- generated publication-package consumption on the web side
- typed publication handling in the public site
- verification structure for contracts, releases, and invalid fixtures

The remaining open items are intentionally deferred to first implementation stories rather than being left as silent assumptions.

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**

- Strong scope discipline around a bounded MVP
- Clear private, governed, and public separation
- Static-first web architecture aligned to the PRD
- Contract-first analytical model with release traceability
- Good anti-drift implementation rules for future coding agents

**Early Watchpoints:**

- lock the publication manifest contract early
- lock the publication sync contract early
- lock the validation command contract early

**Areas for Future Enhancement:**

- richer deployment automation
- more explicit validation tooling specifications
- visual architecture diagrams
- post-MVP workflow generalization for future client cases

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all architectural decisions as the default source of truth.
- Respect the three-zone boundary and publication package model.
- Keep the public site static-first and avoid introducing Phase 1-excluded systems.
- Record any justified exception in architecture decision notes before normalizing it.

**First Implementation Priority:**  
Initialize the Astro public site as the first implementation story, then immediately define the publication manifest schema, sync contract, validation command flow, and compact proof-coverage record that feed the shared public surface.
