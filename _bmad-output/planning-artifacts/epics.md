---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/product-brief-FABRIC_PLATFORM_DEV_BMAD-2026-03-20.md
  - _bmad-output/planning-artifacts/masking-abstraction-framework-2026-03-25.md
  - _bmad-output/planning-artifacts/internal-planning-notes-2026-03-24.md
  - _bmad-output/planning-artifacts/brand-and-content-engine-2026-03-25.md
  - _bmad-output/planning-artifacts/future-integration-decisions-2026-03-26.md
  - _bmad-output/planning-artifacts/mvp-data-contracts-2026-03-25.md
  - _bmad-output/planning-artifacts/phase0-source-family-register-2026-03-25.md
  - _bmad-output/planning-artifacts/phase0-sweep-spec-2026-03-25.md
  - _bmad-output/planning-artifacts/client-engagement-legal-enablement-2026-03-27.md
  - _bmad-output/planning-artifacts/prd-sweep-architecture-learning-client-enablement-2026-03-27.md
  - _bmad-output/planning-artifacts/visual-build-notes-2026-03-27.md
---

# FABRIC_PLATFORM_DEV_BMAD - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for FABRIC_PLATFORM_DEV_BMAD, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Visitors can access a public landing page that introduces the project, its purpose, and its primary case-study promise.
FR2: Visitors can access a dedicated case-study route that presents the main analytical proof.
FR3: Visitors can access a dedicated technical-method route that presents the minimum technical evidence bundle for the case.
FR4: Visitors can access a dedicated contact or next-step route.
FR5: Each public route has one primary responsibility in the reading sequence: landing for orientation, case study for business proof, technical method for engineering proof, and contact for engagement.
FR6: Visitors can navigate between the landing, case study, technical-method, and contact routes from the same shared public experience.
FR7: Each public route is directly addressable through a shareable public URL.
FR8: Visitors can recognize that the experience is one bounded case study rather than a broad multi-product platform.
FR9: Visitors can understand the primary business problem addressed by the case study.
FR10: Business-facing viewers can understand the competing incentives between relevant teams in the modeled scenario.
FR11: Visitors can understand why the selected analytical slice matters to cross-functional decision-making.
FR12: Visitors can understand the intended reading sequence of business tension, analytical clarification, and technical credibility.
FR13: Visitors can identify which parts of the broader business environment are intentionally excluded from the MVP.
FR14: Visitors can review one bounded analytical case study focused on commercial demand to multi-site inventory readiness.
FR15: Visitors can review the core measures, dimensional context, and reporting window used by the case.
FR16: Business-facing viewers can understand the relationship between demand signals and inventory readiness within the modeled slice.
FR17: Visitors can review at least one supporting cross-functional analytical view that reinforces the main case without expanding the MVP into a multi-dashboard platform.
FR18: Visitors can review freshness metadata for the published analytical output, including the last successful refresh or reporting timestamp.
FR19: The product owner can refresh the analytical case through bounded incremental updates against approved public input tables while preserving the approved public contract.
FR20: The product owner can extend the analytical case with approved scenario-driven row growth only when grain, key stability, masking rules, and cross-table consistency checks pass.
FR21: Technical evaluators can review the bounded source-slice definition used by the case study.
FR22: Technical evaluators can review the publication-safe abstraction and masking approach used by the product.
FR23: Technical evaluators can review the core business grain, entity boundaries, and modeling rationale behind the analytical slice.
FR24: Visitors can review a minimum technical evidence bundle from within the same public experience, including an architecture summary, model or lineage view, grain or schema summary, validation summary, release/version references, and a compact statement of which lifecycle, governance, monitoring, or semantic-ownership proof items are intentionally included in Phase 1.
FR25: Technical evaluators can understand how the private preparation layer differs from the public analytical layer.
FR26: Technical evaluators can understand how the main business questions map to published measures, modeled entities, and final analytical outputs.
FR27: The product owner can publish bounded Fabric-oriented learning evidence tied to the implemented solution, explicitly label which DP-700-relevant proof areas are demonstrated, and identify intentionally deferred areas without turning the product into a full certification-prep site.
FR28: Visitors can understand which elements of the solution are intentionally simplified for public publication and which reflect real analytical discipline.
FR29: The product owner can classify data elements used by the case as public, masked, synthetic, aggregated, omitted, or private-only.
FR30: The product owner can execute a publication-safety gate before release, and the public artifact cannot be published when required safety checks fail.
FR31: The product owner can execute versioned data-contract validation against approved public inputs, including required fields, grain rules, key stability, masking rules, and cross-table consistency.
FR32: The product owner can investigate data-quality, coherence, schema-drift, or masking issues that affect the public artifact.
FR33: The product owner can hold or block a release when publication-safety or contract-validation checks fail.
FR34: The product owner can version meaningful changes to the analytical product and its supporting technical evidence.
FR35: Each public release can be traced to a source commit, approved data snapshot or refresh state, validation result, and change summary.
FR36: The product owner can publish release notes or change summaries for meaningful updates.
FR37: The product owner can identify the currently published version and the last known good approved version of the case-study artifact.
FR38: The product owner can capture minimum operational status for the public artifact, including last successful refresh, validation status, and release state.
FR39: The product owner can recover from a problematic release using a documented rollback path tied to a prior approved version.
FR40: Recruiters, hiring managers, and business prospects can identify a clear next-step or contact path from the public experience.
FR41: Visitors can understand the kinds of professional conversations or engagements the project supports without requiring a full consulting services catalog.
FR42: The public site can provide a minimal privacy and contact-handling notice appropriate to the launch scope.
FR43: The public site can provide a minimal terms or usage notice if required by the launch context.

### NonFunctional Requirements

NFR1: The landing page and primary case-study entry route should achieve a Largest Contentful Paint of 2.5 seconds or less under a standard mobile web test profile for production builds.
NFR2: Primary public routes should become visually stable with a Cumulative Layout Shift of 0.1 or less during initial load.
NFR3: Content-heavy public routes should remain usable with JavaScript disabled or degraded, except for clearly non-essential enhanced interactions.
NFR4: The site should avoid unnecessary client-side bundles so that the main public routes can be loaded and understood on average mobile connections without long blocking delays.
NFR5: Published analytical visuals, diagrams, and media assets should be optimized so they do not materially degrade first-load performance on the main public routes.
NFR6: All public pages and contact-handling flows must be served over HTTPS.
NFR7: Any personal data collected through public contact paths must be limited to the minimum information necessary for response and follow-up.
NFR8: The Phase 1 release must not create or maintain a custom reusable contact database, mailing list, or audience-segmentation store as part of the product itself.
NFR9: If a public contact form is used in Phase 1, it must route inquiries to an owner-controlled inbox or approved managed service and present a clear contact-handling notice at submission time.
NFR10: Public analytical outputs must not expose raw private identifiers, re-identifiable business labels, or unapproved sensitive source details.
NFR11: Every public release must pass a documented publication-safety review covering masking, abstraction, synthetic-data disclosure where relevant, and public/private boundary checks before publication.
NFR12: Access to private preparation materials, private evidence, and non-public technical artifacts must remain separated from the public-facing release surface and public repo outputs.
NFR13: The public site should maintain at least 99.5% monthly availability for the published routes under normal operating conditions, excluding planned maintenance windows.
NFR14: Each public release must have a last-known-good version that can be restored if a release introduces broken content, unsafe content, or materially misleading analytical output.
NFR15: When a refresh, validation, or publication-safety check fails, the product must default to preserving the previous approved public state rather than publishing partial or unapproved output.
NFR16: Release state, validation status, and last successful refresh timestamp must be recoverable for each published version.
NFR17: A rollback to the prior approved public version should be executable within one business day using the documented release and traceability records.
NFR18: The public web experience should meet a practical WCAG 2.2 AA-aligned baseline for core routes and interactions.
NFR19: All core navigation and contact actions must be usable by keyboard alone.
NFR20: Color contrast, focus visibility, heading structure, and link labeling must support non-visual and low-vision navigation of the primary routes.
NFR21: Meaningful charts, diagrams, and analytical visuals must include text alternatives, captions, or adjacent explanations that do not rely on color alone.
NFR22: The site should remain readable and functional at 200% zoom on supported browsers without loss of core content or navigation.
NFR23: The published site must function correctly on current major versions of Chrome, Edge, Safari, and Firefox, plus recent mobile Safari and mobile Chrome.
NFR24: The intended reading sequence of business tension, analytical clarification, and technical credibility must remain understandable on both desktop and mobile layouts.
NFR25: Core route navigation, case-study reading, and contact actions must remain usable across supported viewport sizes without horizontal scrolling for standard content.
NFR26: Non-essential presentation enhancements may degrade gracefully, but core content, navigation, and proof artifacts must remain available across supported browsers.
NFR27: Each indexable public route must include a unique title tag, meta description, canonical URL, and semantic heading structure.
NFR28: The site must expose a crawlable internal-linking structure connecting the landing, case study, technical-method, and contact routes.
NFR29: The production site must provide a sitemap and robots configuration that support intended search indexing of public routes.
NFR30: Shareable public routes should provide social-preview metadata sufficient for clear link previews in recruiter, social, and messaging contexts.
NFR31: Public route URLs should remain stable once shared, except where a documented redirect preserves inbound discoverability.
NFR32: The Phase 1 release should support normal portfolio-review traffic and moderate short-term spikes from social sharing, recruiting outreach, or interview loops without requiring architectural redesign.
NFR33: If traffic exceeds the expected Phase 1 operating range, the system should fail gracefully by preserving access to core public content rather than degrading into broken navigation or incomplete page rendering.
NFR34: Public release artifacts, technical evidence, and analytical-source assumptions must be versioned in a way that allows a reviewer to trace a published state back to its supporting implementation record.
NFR35: Meaningful changes to the public artifact should include a change summary or release note describing what changed and why.
NFR36: The route structure, core metadata, and technical-evidence links should be maintainable by a solo builder without requiring a major site re-architecture for normal Phase 1 updates.

### Additional Requirements

- Initialize the public web layer with `pnpm create astro@latest` using a minimal or basic official starter with TypeScript enabled, and add React later only with `pnpm astro add react`.
- Treat Astro public-site initialization as the first implementation story for the web layer.
- Enforce a three-zone architecture with a private preparation zone, a governed Fabric analytics and publication zone, and a public delivery zone.
- Use a Fabric-centered, medallion-aligned analytical flow with public-safe landed source tables, standardized modeled preparation, a curated serving layer, and a bounded semantic proof layer.
- Use a versioned publication package as the only contract between the governed analytics zone and the public web layer.
- The public web layer must never import private-prep outputs or query private analytical stores directly.
- No Phase 1 custom public REST API, GraphQL API, public end-user authentication flow, or custom application database is allowed.
- Any Phase 1 contact form must route to an owner-controlled inbox or approved managed service and must not create a reusable contact database.
- Power BI or Fabric artifacts, if later embedded or linked publicly, must remain subordinate to the curated public website and pass explicit publication-safety review.
- Contract-first validation must run at each boundary and fail closed when masking, grain, compatibility, or publication checks fail.
- Public code, documentation, screenshots, manifests, and technical proof assets must be released through an explicit publication-boundary decision that classifies them as public-proof, public-safe operational, or private-only.
- Historical and public updates must be append- or snapshot-friendly, preserve explicit dates, and maintain version traceability rather than destructively rewriting published history.
- MVP source-family scope remains bounded to Product Information, Customer Demand, Stock Overview, and Account Assignments; `Open Orders`, valuation-oriented sources, and CRM integrations remain outside the core Phase 1 path unless scope is formally expanded.
- The public analytical model must honor the MVP contracts for `dim_product`, `dim_product_family`, `dim_account`, `dim_inventory_location`, `fact_demand_line`, `fact_inventory_snapshot`, and synthetic economic proxy outputs.
- Each modeled entity should carry stable publication metadata where applicable, including `record_source_family`, `source_file_version`, `publication_safety_flag`, and `load_timestamp_utc`.
- Public modeled entities should use surrogate keys when natural keys are sensitive or unstable, and the model must support explicit public-safe fallbacks such as `UNCLASSIFIED` and `UNKNOWN` where the contracts require them.
- Contract payload field names must remain in `snake_case`; any UI-friendly renaming must happen only in a small web-boundary mapping layer.
- All machine-readable timestamps must use ISO 8601 UTC; `event_date` must represent demand-related business events and `snapshot_date` must represent point-in-time inventory facts.
- Product-family rules, node-type rules, and synthetic economic proxy rules must be deterministic, documented, publication-safe, and must not depend on raw pricing or raw valuation files.
- Controlled realism may preserve meaningful enterprise-like issues such as overlapping versions, naming drift, late-arriving records, and incomplete master data, but not arbitrary corruption or random noise.
- Identity-revealing labels for products, accounts, sites, 3PLs, people, source files, and internal reporting vocabulary must be removed or abstracted while preserving business behavior.
- The public technical evidence bundle must surface architecture proof, lineage or model context, validation status, release and version references, and DP-700-relevant lifecycle and governance evidence without becoming a full certification-prep product.
- Keep the public route spine small and explicit around landing, case study, technical method, and contact or privacy responsibilities aligned to the required reading sequence.
- Hosting and release flow should assume Git as canonical source control, a managed Astro-friendly hosting target such as Vercel, and minimal but explicit environment separation across web and Fabric stages.
- Lightweight observability must capture deployment logs, build logs, validation status, release identifiers, freshness metadata, and last-known-good release references.
- Early implementation stories must lock the publication manifest schema, publication sync contract, validation-command flow, and test-tool choices to avoid delivery drift.
- Phase 1 legal readiness is limited to essential public-facing website documents; the broader Mexico and U.S. legal-commercial packs and reusable client-delivery operating system remain post-MVP support layers.
- Future visual exploration can inform layout direction later, but it must not override established architecture, accessibility, performance, SEO, or publication-safety constraints.

### UX Design Requirements

The UX design specification is now available in `_bmad-output/planning-artifacts/ux-design-specification.md` and adds the following requirements:

- `UX-DR1`: The public experience must build trust through progressive proof rather than exposing all technical detail at once.
- `UX-DR2`: Technical credibility must be discoverable from the shared public experience without turning the public surface into a dump of the full internal process.
- `UX-DR3`: Route purpose, trust signals, and support pages such as privacy/contact handling must reinforce a calm, bounded, professional experience.
- `UX-DR4`: The product should make public-safe boundaries feel intentional and credible, not evasive or hand-wavy.

### FR Coverage Map

FR1: Epic 2 - Public landing page
FR2: Epic 2 - Dedicated case-study route
FR3: Epic 2 - Dedicated technical-method route
FR4: Epic 2 - Dedicated contact or next-step route
FR5: Epic 2 - Route responsibilities in shared reading sequence
FR6: Epic 2 - Navigation across the shared public experience
FR7: Epic 2 - Shareable public URLs
FR8: Epic 2 - Bounded single-case-study positioning
FR9: Epic 3 - Primary business problem framing
FR10: Epic 3 - Cross-functional team tension
FR11: Epic 3 - Decision value of the selected analytical slice
FR12: Epic 3 - Intended reading sequence
FR13: Epic 3 - Clear MVP exclusions
FR14: Epic 3 - One bounded analytical case study
FR15: Epic 3 - Core measures, dimensions, and reporting window
FR16: Epic 3 - Demand-to-readiness relationship
FR17: Epic 3 - Supporting cross-functional analytical view
FR18: Epic 3 - Freshness metadata on published output
FR19: Epic 1 - Refresh analytical case through bounded approved inputs
FR20: Epic 1 - Extend analytical case with safe scenario-driven growth
FR21: Epic 4 - Bounded source-slice definition
FR22: Epic 4 - Publication-safe abstraction and masking explanation
FR23: Epic 4 - Grain, entity boundaries, and modeling rationale
FR24: Epic 4 - Minimum technical evidence bundle with architecture, model or lineage, grain or schema, validation, release references, and a Phase 1 proof-boundary note
FR25: Epic 4 - Private-prep versus public-analytics distinction
FR26: Epic 4 - Mapping business questions to measures and entities
FR27: Epic 4 - Bounded Fabric learning evidence with labeled demonstrated and intentionally deferred DP-700 proof areas
FR28: Epic 4 - Simplified-for-public versus real analytical discipline explanation
FR29: Epic 1 - Data classification across public, masked, synthetic, aggregated, omitted, and private-only elements
FR30: Epic 1 - Publication-safety gate before release
FR31: Epic 1 - Versioned data-contract validation
FR32: Epic 1 - Investigation of coherence, schema, and masking issues
FR33: Epic 1 - Hold or block unsafe releases
FR34: Epic 6 - Version meaningful product and evidence changes
FR35: Epic 6 - Trace each public release to source, data state, validation result, and change summary
FR36: Epic 6 - Publish release notes or change summaries
FR37: Epic 6 - Identify current and last-known-good versions
FR38: Epic 6 - Capture operational status and release state
FR39: Epic 6 - Recover through a documented rollback path
FR40: Epic 2 - Clear contact or next-step path
FR41: Epic 2 - Explain supported professional conversations or engagements
FR42: Epic 2 - Minimal privacy and contact-handling notice
FR43: Epic 2 - Minimal terms or usage notice

## NFR Traceability Map

| NFR Group | Primary Stories | Verification Focus |
| --------- | --------------- | ------------------ |
| NFR1-NFR5 Performance | Story 1.1, Story 2.1, Story 2.2, Story 2.4 | starter/build baseline, lean route delivery, asset and layout discipline |
| NFR6-NFR12 Security, Privacy, Publication Safety | Story 1.5, Story 2.5, Story 4.2, Story 4.5, Story 6.1 | HTTPS assumptions, contact handling, publication boundaries, release approval |
| NFR13-NFR17 Reliability, Recoverability | Story 1.5, Story 6.1, Story 6.2, Story 6.3 | fail-closed validation, release status, last-known-good recovery |
| NFR18-NFR22 Accessibility | Story 2.1, Story 2.2, Story 2.3, Story 2.4, Story 2.5, Story 3.3 | keyboard access, semantic structure, readable analytical explanation, text alternatives |
| NFR23-NFR26 Compatibility, Responsive Support | Story 1.1, Story 2.1, Story 2.2, Story 2.3, Story 2.4, Story 3.4 | supported browsers, responsive route behavior, stable reading sequence |
| NFR27-NFR31 SEO, Discoverability | Story 2.1, Story 2.2, Story 2.3, Story 2.4, Story 2.5 | route metadata, canonical URLs, crawlable linking, stable shareable routes |
| NFR32-NFR33 Scalability | Story 1.1, Story 2.1, Story 6.2 | lightweight delivery baseline and graceful status handling |
| NFR34-NFR36 Maintainability, Traceability | Story 1.6, Story 5.1, Story 5.2, Story 5.3, Story 5.4, Story 6.1, Story 6.2, Story 6.3 | version traceability, release evidence, solo-maintainable update flow |

## Story-Level NFR References

| Story | Primary NFR Groups | Implementation Verification Focus |
| ----- | ------------------ | --------------------------------- |
| Story 1.1 | NFR1-NFR5, NFR23-NFR26, NFR32-NFR33 | starter performance baseline, responsive route shell, static-first scalability |
| Story 1.2 | NFR10-NFR12, NFR34-NFR36 | safe masking, public/private separation, maintainable modeled outputs |
| Story 1.3 | NFR10-NFR12, NFR34-NFR36 | safe fact publication, bounded proxy logic, traceable analytical contracts |
| Story 1.4 | NFR10-NFR12, NFR14-NFR17, NFR34-NFR36 | fail-closed sync, recoverable approved package updates, governed promotion |
| Story 1.5 | NFR6-NFR12, NFR13-NFR17 | publication safety, blocking behavior, validation diagnostics, last-known-good preservation |
| Story 1.6 | NFR14-NFR17, NFR34-NFR36 | release contract discipline, CI-ready validation flow, maintainable verification baseline |
| Story 2.1 | NFR1-NFR5, NFR18-NFR31, NFR32-NFR33 | lightweight shell, accessibility, metadata, crawlable route structure, traffic resilience |
| Story 2.2 | NFR1-NFR5, NFR18-NFR31 | landing-page performance, semantic structure, SEO metadata, responsive readability |
| Story 2.3 | NFR18-NFR31 | route accessibility, shareable URL behavior, responsive and discoverable case-study entry |
| Story 2.4 | NFR1-NFR5, NFR18-NFR31 | technical-route performance, accessibility, metadata, bounded discoverability |
| Story 2.5 | NFR6-NFR12, NFR18-NFR31 | contact/privacy or terms handling, keyboard access, metadata, stable support routes |
| Story 3.1 | NFR18-NFR26 | readable framing, supported reading sequence, accessible business context on all layouts |
| Story 3.2 | NFR18-NFR26 | accessible analytical explanation, bounded content structure, readable measures and narrative |
| Story 3.3 | NFR18-NFR26 | accessible supporting view, non-color-only interpretation, responsive supporting proof |
| Story 3.4 | NFR14-NFR17, NFR23-NFR26, NFR34-NFR36 | trustworthy freshness context, supported-layout visibility, traceable published status |
| Story 4.1 | NFR10-NFR12, NFR34-NFR36 | explicit public/private boundary explanation, safe source-scope disclosure, traceable structure |
| Story 4.2 | NFR10-NFR12, NFR34-NFR36 | safe masking explanation, public-proof boundaries, documented simplification policy |
| Story 4.3 | NFR18-NFR26, NFR34-NFR36 | readable technical explanation, responsive schema or grain presentation, traceable model rationale |
| Story 4.4 | NFR27-NFR31, NFR34-NFR36 | technical-evidence metadata, stable references, bounded DP-700 proof traceability |
| Story 4.5 | NFR6-NFR12, NFR34-NFR36 | publication-boundary enforcement, repo exposure policy, release-safe evidence curation |
| Story 4.6 | NFR27-NFR31, NFR34-NFR36 | bounded Power BI or Fabric proof artifact, labeled platform evidence, subordinate public technical proof |
| Story 5.1 | NFR34-NFR36 | documented rule governance, reusable parameter structure, logic-first handoff discipline |
| Story 5.2 | NFR10-NFR12, NFR14-NFR17, NFR34-NFR36 | coherent incremental growth, fail-closed package refresh, maintainable data evolution |
| Story 5.3 | NFR10-NFR12, NFR14-NFR17, NFR34-NFR36 | representative masked market expansion, bounded archetype derivation, deterministic eligibility density |
| Story 5.4 | NFR6-NFR17, NFR34-NFR36 | realism checks, invariant enforcement, recoverable promotion behavior |
| Story 5.5 | NFR27-NFR31, NFR34-NFR36 | logic-stable Fabric proof refresh, bounded semantic updates, deferred manual layout discipline |
| Story 6.1 | NFR6-NFR17, NFR34-NFR36 | secure release records, recoverable traceability, version and approval evidence |
| Story 6.2 | NFR13-NFR17, NFR34-NFR36 | operational status discipline, maintainable release notes, recoverable public-state reporting |
| Story 6.3 | NFR14-NFR17, NFR34-NFR36 | rollback readiness, last-known-good restoration, traceable recovery execution |

## Epic List

### Epic 1: Publish a Safe Analytical MVP Slice
The product owner can produce one bounded, publication-safe analytical package that is ready to be surfaced publicly without leaking private structure or breaking core contracts.
**FRs covered:** FR19, FR20, FR29, FR30, FR31, FR32, FR33

### Epic 2: Launch the Shared Public Entry Experience
Visitors can enter the product through a clear, bounded, shareable public experience that explains what the case is, how to navigate it, and how to take the next step safely.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR40, FR41, FR42, FR43

### Epic 3: Explain the Business Case Through One Analytical Story
Business-facing viewers can understand the supply-chain inventory decision problem, the cross-functional tension behind it, the bounded analytical slice, and the decision value of the published case.
**FRs covered:** FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18

### Epic 4: Prove the Technical Method on the Same Surface
Technical evaluators can inspect how the public case is built, what was masked or simplified, how the modeled entities and grain work, and why the solution reflects real analytical discipline.
**FRs covered:** FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28

### Epic 5: Operationalize Logic-First Fabric Serving
The product owner can turn the current proof shell into a logic-first operating path where deterministic rules, coherent incremental growth, and stabilized Fabric serving tables become the priority before richer report composition.
**FRs covered:** Deepens FR19, FR20, FR24, and FR27 through a logic-first operating workflow

### Epic 6: Operate Releases with Traceability and Recovery
The product owner can version, monitor, explain, and recover public releases so the case remains trustworthy as it evolves.
**FRs covered:** FR34, FR35, FR36, FR37, FR38, FR39

### Epic 7: Execute the Bounded Proof Natively in Fabric with Enterprise-Like Orchestration
The product owner can preserve bounded public-safe governance in the repo while moving runtime execution, orchestration, and runtime traceability deeper into Fabric so the proof demonstrates platform-native data handling more credibly.
**FRs covered:** Deepens FR19, FR20, FR24, FR27, FR35, and FR38 through Fabric-native runtime execution and orchestration

## Epic 1: Publish a Safe Analytical MVP Slice

The product owner can produce one bounded, publication-safe analytical package that is ready to be surfaced publicly without leaking private structure or breaking core contracts.

### Story 1.1: Set Up the Initial Project from the Approved Astro Starter (FR31, FR33)

As a product owner,
I want the public-site project initialized from the approved Astro starter with the governed delivery boundaries in place,
So that later publication and validation work can be added without reworking the MVP foundation.

**Acceptance Criteria:**

**Given** the architecture selects Astro with TypeScript as the approved starter template
**When** the first implementation story is executed
**Then** the public-site project is initialized with `pnpm create astro@latest` using the approved minimal or basic official starter with TypeScript enabled
**And** the starter setup installs dependencies and initializes Git during project creation
**And** the initial baseline includes the public-site package manifest, Astro config, TypeScript config, `src/pages/`, `src/layouts/`, `src/components/`, and `public/assets/` structure needed for the MVP
**And** the initial structure separates public delivery concerns from governed publication artifacts and private-prep concerns according to the approved folder boundaries
**And** the initial setup preserves the static-first delivery model and leaves React uninstalled until an explicit later `pnpm astro add react` follow-up is approved
**And** the starter-based foundation supports later contract validation and fail-closed publication work without boundary drift

### Story 1.2: Publish Masked Dimension Entities (FR29)

As a product owner,
I want masked, publication-safe dimension entities built from the bounded source slice,
So that the public case can describe products, accounts, and locations without exposing enterprise identity.

**Acceptance Criteria:**

**Given** approved Product Information, Account Assignments, and Stock Overview inputs
**When** the dimension build runs
**Then** `dim_product`, `dim_product_family`, `dim_account`, and `dim_inventory_location` are produced at the contract-defined grain
**And** direct identifiers for products, accounts, sites, 3PLs, and internal labels are removed or abstracted while preserving meaningful business behavior
**And** surrogate keys plus explicit safe fallback values such as `UNCLASSIFIED` or `UNKNOWN` are handled where required by the contracts
**And** product-family and node-type classification logic is deterministic, documented, and publication-safe

### Story 1.3: Publish Bounded Facts and Proxy Metrics (FR19, FR20)

As a product owner,
I want governed fact tables and synthetic proxy metrics generated from the approved source slice,
So that the analytical case can show demand and inventory-readiness behavior without using unsafe commercial data.

**Acceptance Criteria:**

**Given** approved Customer Demand and Stock Overview inputs plus the governed dimensions
**When** the fact build runs
**Then** `fact_demand_line` and `fact_inventory_snapshot` are produced at their contract-defined grain
**And** `event_date` and `snapshot_date` semantics are labeled consistently in the published schema or package documentation so reviewers can distinguish event-based versus snapshot-based analysis
**And** every fact row resolves to the required dimension keys or an approved explicit fallback
**And** synthetic economic proxy outputs are derived only from approved public-safe rules rather than raw pricing, rebates, or valuation files

### Story 1.4: Support Safe Incremental Updates and Current-Package Sync (FR19, FR20, FR31)

As a product owner,
I want approved scenario-driven updates appended through the same governed package flow,
So that the public analytical case can evolve over time without semantic drift.

**Acceptance Criteria:**

**Given** an existing approved MVP package
**When** new approved rows or snapshot periods are introduced
**Then** append or snapshot behavior preserves grain, stable keys, masking rules, and cross-table consistency
**And** updates that introduce schema drift, incompatible masking, or broken entity relationships are rejected
**And** the current approved publication package can be synchronized to the public-site consumption area through the defined boundary
**And** only approved publishable artifacts cross into the web-consumption copy

### Story 1.5: Block Unsafe Publication Candidates with Diagnostics (FR30, FR31, FR32, FR33)

As a product owner,
I want fail-closed validation and investigation outputs before publication,
So that unsafe or incoherent analytical packages never reach the public surface.

**Acceptance Criteria:**

**Given** a candidate publication package
**When** publication-safety and contract validation run
**Then** masking, required fields, grain, key stability, compatibility, and coherence checks execute before promotion
**And** any failed check blocks the candidate from becoming the active public package
**And** diagnostic outputs record the failed rule identifier, affected artifact, and blocking reason needed for investigation
**And** the last approved package remains the active baseline when validation fails

### Story 1.6: Lock the Publication Contract and Verification Baseline (FR24, FR31, FR34)

As a product owner,
I want the publication manifest, sync contract, validation-command flow, and test-tool baseline defined before the proof lane expands,
So that later technical evidence and release stories build on one consistent governed contract.

**Acceptance Criteria:**

**Given** the Astro starter foundation exists
**When** the governed publication boundary is prepared for implementation
**Then** the publication manifest schema and required fields are documented and versioned
**And** the sync contract documents the approved source location, destination location, allowed artifact types, and promotion trigger so the handoff does not rely on ad hoc copying
**And** the validation-command flow for local, preview, and CI execution is documented
**And** the minimum test-tool baseline for public-site checks and publication-package verification is selected and recorded

## Epic 2: Launch the Shared Public Entry Experience

Visitors can enter the product through a clear, bounded, shareable public experience that explains what the case is, how to navigate it, and how to take the next step safely.

### Story 2.1: Establish the Public Site Shell and Navigation (FR5, FR6, FR7, FR8)

As a visitor,
I want a lightweight public site with clear navigation across the core routes,
So that I can understand the experience without getting lost.

**Acceptance Criteria:**

**Given** the approved MVP route spine
**When** a visitor opens any core public route
**Then** a shared site shell provides consistent navigation across the landing, case-study, technical-method, and contact routes
**And** each route has a stable addressable URL and a documented single primary responsibility within the shared public experience
**And** the implementation remains static-first, keyboard-accessible, and light on client-side JavaScript
**And** the public site structure stays within the approved MVP scope rather than expanding into a broad multi-product platform

### Story 2.2: Publish the Landing Page Orientation (FR1, FR8)

As a visitor,
I want a landing page that explains the project and its promise quickly,
So that I can decide whether to explore the case study further.

**Acceptance Criteria:**

**Given** the public site shell is available
**When** a visitor lands on the home route
**Then** the page presents a visible headline and supporting introduction that state the project purpose, core case-study promise, and intended audiences
**And** the landing page provides at least one visible navigation or call-to-action link into each of the case study, technical method, and contact journeys
**And** the page includes a route title, one primary `h1`, a meta description, and a responsive layout that preserves reading order without horizontal scrolling at standard mobile width
**And** the landing page states that the product is one bounded public case study rather than a generic portfolio index

### Story 2.3: Publish the Dedicated Case-Study Route Entry (FR2)

As a visitor,
I want a dedicated case-study route that positions the main proof clearly,
So that I can access the core experience directly from navigation or a shared link.

**Acceptance Criteria:**

**Given** the landing page exists
**When** a visitor opens the case-study route directly or from site navigation
**Then** the route includes a route-level title or opening section that identifies it as the main analytical proof surface for the MVP
**And** the page structure supports a business-first reading sequence that can later be enriched with analytical content
**And** the route is shareable, indexable, and usable across supported desktop and mobile layouts
**And** navigation from the case-study route back to the landing, technical-method, and contact routes uses the same visible navigation pattern defined in the shared site shell

### Story 2.4: Publish the Technical-Method Route Entry (FR3)

As a technical evaluator,
I want a dedicated technical-method route within the same public experience,
So that I can find engineering proof without losing the shared product flow.

**Acceptance Criteria:**

**Given** the public route spine exists
**When** a visitor opens the technical-method route
**Then** the route includes a route-level title or opening section that presents it as the location for implementation and analytical-method proof
**And** the route is directly addressable from navigation and through a shareable public URL
**And** the page layout uses the shared SEO and accessibility baseline without requiring app-like client-side navigation
**And** the route states that its proof surface is a bounded Phase 1 evidence experience rather than a full documentation or certification portal
**And** the route preserves the shared experience instead of feeling like a separate disconnected product

### Story 2.5: Publish Contact and Minimum Legal-Readiness Routes (FR4, FR40, FR41, FR42, FR43)

As a recruiter, hiring manager, or business prospect,
I want a clear next-step path with minimal privacy and usage notices,
So that I can reach out with confidence and understand how the site handles contact interactions.

**Acceptance Criteria:**

**Given** the public experience is live
**When** a visitor navigates to the contact path
**Then** the route explains the kinds of professional conversations or engagements the project supports and offers at least one explicit next-step action
**And** the public site provides a minimal privacy and contact-handling notice appropriate to the approved launch scope
**And** if FR43 remains in launch scope, the public site publishes the minimal terms or usage notice at a dedicated `/terms` route linked from the contact and privacy pages
**And** if a contact form is introduced in Phase 1, it routes to an owner-controlled inbox or approved managed service without creating a reusable custom contact database

## Epic 3: Explain the Business Case Through One Analytical Story

Business-facing viewers can understand the supply-chain inventory decision problem, the cross-functional tension, the bounded analytical slice, and the decision value of the published case without mistaking it for a replacement ERP or planning suite.

### Story 3.1: Frame the Business Problem and Reading Sequence (FR9, FR10, FR12, FR13)

As a business-facing viewer,
I want the case-study page to explain the operating tension and intended reading order,
So that I understand why the analytical story matters before I inspect technical detail.

**Acceptance Criteria:**

**Given** the case-study route exists
**When** a visitor enters the main case-study page
**Then** the page explains the primary business problem addressed by the case study using non-specialist language and without assuming Fabric-specific vocabulary
**And** the page names at least two competing team incentives or operating pressures within the modeled scenario, such as grossing pressure in sales, inventory-value pressure in supply chain, or lead-time stability pressure in logistics
**And** the page communicates the intended reading sequence of business tension first, analytical clarification second, and technical credibility third
**And** the page identifies which parts of the broader business environment are intentionally excluded from the MVP

### Story 3.2: Present the Bounded Analytical Case and Core Measures (FR11, FR14, FR15, FR16)

As a business-facing viewer,
I want the main analytical slice presented with its core measures and dimensions,
So that I can understand the relationship between demand signals, inventory posture, and service-readiness trade-offs.

**Acceptance Criteria:**

**Given** the business framing is established
**When** a visitor reviews the main analytical content
**Then** one bounded primary analytical view focused on supply-chain inventory decisions is presented
**And** the page names the core measures, dimensional context, policy assumptions, and reporting window used by the case
**And** the page frames the analytical object as a decision-support layer rather than as a replacement transaction or planning system
**And** the page identifies a bounded primary KPI set that includes inventory coverage, service readiness, inventory exposure, and recommended action status
**And** the page identifies a bounded public policy set that includes inventory policy class, service-level band, coverage target band, lead-time band, and location role
**And** the page includes accompanying narrative that explicitly connects at least one demand signal, one inventory or service-readiness indicator, and the business implication of that relationship within the modeled slice
**And** the presentation stays within the approved MVP slice rather than expanding into a broad multi-dashboard platform

### Story 3.3: Add a Supporting Cross-Functional Analytical View (FR17)

As a business-facing viewer,
I want a supporting cross-functional perspective on the same modeled slice,
So that I can see why the case matters to more than one team.

**Acceptance Criteria:**

**Given** the main analytical case is available
**When** a visitor explores supporting evidence on the case-study route
**Then** at least one supporting cross-functional analytical view reinforces the main case without replacing it
**And** the supporting view helps explain how the same modeled slice matters across sales, supply chain, logistics, or related stakeholders
**And** the supporting view may focus on either demand pressure or logistics execution, as long as it remains clearly subordinate to the primary supply-chain view
**And** the supporting view remains bounded to the approved MVP story rather than introducing a second independent case study
**And** the explanation of the supporting view remains accessible beyond color-only cues

### Story 3.4: Display Freshness and Update Context (FR18)

As a visitor,
I want freshness metadata for the published analytical output,
So that I can judge how current and trustworthy the case is.

**Acceptance Criteria:**

**Given** the approved publication package includes refresh metadata
**When** a visitor reviews the case-study route
**Then** the last successful refresh or reporting timestamp is displayed in a human-readable date or timestamp format derived from the governed source value
**And** any needed freshness note or interpretation guidance is shown without implying real-time behavior
**And** the displayed freshness context matches the currently approved publication package
**And** freshness information remains visible without truncating the timestamp label or value on supported desktop and mobile layouts

## Epic 4: Prove the Technical Method on the Same Surface

Technical evaluators can inspect how the public case is built, what was masked or simplified, how the modeled entities and grain work, and why the solution reflects real analytical discipline.

### Story 4.1: Explain the Source Slice and Public-Private Boundary (FR21, FR25)

As a technical evaluator,
I want to see what source slice is in scope and how private preparation differs from public analytics,
So that I can assess whether the case is disciplined and bounded.

**Acceptance Criteria:**

**Given** the technical-method route exists
**When** a technical evaluator reviews the solution context
**Then** the page identifies the bounded source families included in the case-study slice
**And** the page states the difference between private preparation, governed analytics, and public delivery as separate zones with distinct responsibilities
**And** the explanation clarifies that private preparation materials do not cross directly into the public surface
**And** the page preserves the approved MVP scope rather than implying hidden broader enterprise coverage

### Story 4.2: Explain Masking, Abstraction, and Public-Safe Simplifications (FR22, FR28)

As a technical evaluator,
I want to understand what was masked, abstracted, or synthesized,
So that I can judge credibility without confusing the public model for raw enterprise data.

**Acceptance Criteria:**

**Given** the technical-method page is available
**When** a visitor reviews publication-safety design choices
**Then** the masking and abstraction approach used by the product is described with named treatment categories and at least one concrete example of how a raw element becomes public-safe
**And** the page distinguishes public, masked, synthetic, aggregated, omitted, and private-only elements where relevant
**And** the explanation includes a labeled list of which parts of the solution were intentionally simplified for public publication and why
**And** no re-identifiable business labels, unsafe raw examples, or disallowed commercial data details are exposed on the public surface

### Story 4.3: Show Modeled Entities, Grain, and Business-Question Mapping (FR23, FR26)

As a technical evaluator,
I want to inspect the main entities, grain, and mapping from business questions to outputs,
So that I can understand the analytical design choices behind the case.

**Acceptance Criteria:**

**Given** the governed analytical package is available
**When** a technical evaluator reviews the model explanation
**Then** the page states the core business grain, names the main modeled entities, and explains the modeling rationale behind the analytical slice
**And** the explanation shows how the main business questions map to published measures, modeled entities, or final analytical outputs
**And** the presentation references the bounded contract-first model rather than ad hoc undocumented transformations
**And** the explanation is delivered as one bounded section or table set that can be reviewed without leaving the shared public experience

### Story 4.4: Publish the Bounded Technical Evidence Bundle (FR24, FR27)

As a technical evaluator,
I want a compact evidence bundle with architecture, validation, release, and learning references,
So that I can confirm the solution reflects real Fabric-oriented analytical discipline.

**Acceptance Criteria:**

**Given** the technical-method route is populated
**When** a technical evaluator reviews supporting proof
**Then** the public experience exposes a minimum technical evidence bundle including an architecture summary, a model or lineage-oriented view, a grain or schema summary, a validation summary, and release or version references
**And** the evidence bundle includes a labeled proof-coverage note that distinguishes directly demonstrated, indirectly supported, and intentionally deferred DP-700-relevant areas
**And** each referenced proof artifact points to a governed page section, release artifact, or approved documentation reference rather than an implied future asset
**And** the evidence bundle remains available from within the same shared public experience rather than requiring a second disconnected product

### Story 4.5: Curate the Public Evidence Boundary and Repo Exposure Policy (FR24, FR25, FR28)

As a technical evaluator and product owner,
I want the public technical evidence and repo-visible assets curated through an explicit boundary policy,
So that the project proves rigor without exposing the full internal operating system or private delivery leverage.

**Acceptance Criteria:**

**Given** technical proof assets, documentation, or code-adjacent artifacts are prepared for public release
**When** the public evidence bundle is assembled
**Then** each artifact is classified as public-proof, public-safe operational, or private-only before publication
**And** only approved public-proof and public-safe operational artifacts are exposed on the public surface or in any public repo-visible package
**And** reusable internal playbooks, client-delivery assets, sensitive mappings, private-preparation materials, and internal-only heuristics remain excluded from public publication
**And** the public explanation identifies which asset classes are intentionally excluded from publication and why they remain outside the public delivery system

### Story 4.6: Publish a Bounded Power BI or Fabric Proof Surface (FR24, FR27, FR28)

As a technical evaluator,
I want one visible Power BI or Fabric proof artifact kept within the public technical-method experience,
So that I can confirm platform credibility without confusing the product for a public BI portal or full planning suite.

**Acceptance Criteria:**

**Given** the technical-method route and approved publication package are available
**When** a technical evaluator reviews platform proof on the public surface
**Then** one bounded Power BI or Fabric proof artifact is exposed as an approved export, bounded embed, governed deep link, or clearly labeled snapshot
**And** the artifact is explicitly labeled as direct proof, bounded proof, or approved export, including what it demonstrates and what remains deferred
**And** the artifact uses approved public-safe data or a governed export tied to the approved publication package
**And** the artifact remains subordinate to the curated website rather than replacing it or relying on Publish to web as the default public delivery path

## Epic 5: Operationalize Logic-First Fabric Serving

The product owner can turn the current proof shell into a logic-first operating path where deterministic rules, coherent incremental growth, and stabilized Fabric serving tables become the priority before richer report composition.

### Story 5.1: Define Deterministic Business-Rule Parameter Sets (FR19, FR20)

As a product owner,
I want deterministic parameter sets for economics, demand growth, and bounded shocks,
So that incremental data growth becomes explainable, repeatable, and stable before report-layout work expands.

**Acceptance Criteria:**

**Given** the current proof shell exists
**When** the next operating phase is defined
**Then** the repo documents deterministic parameter sets for unit-cost drift, price-step cadence, target margin bands, customer growth behavior, and bounded shock patterns
**And** the rule sets distinguish deterministic rules from bounded variation inputs
**And** the documentation states which report-design concerns are intentionally deferred until after logic stability
**And** the parameter categories are usable by later incremental-generation and validation stories without relying on undocumented randomness

### Story 5.2: Generate Coherent Incremental Fact Growth Through the Approved Package Flow (FR19, FR20)

As a product owner,
I want incremental fact growth generated through documented rule sets and the approved package flow,
So that the analytical case can evolve without breaking grain, masking, or cross-table consistency.

**Acceptance Criteria:**

**Given** deterministic rule sets are available
**When** bounded scenario growth is applied to the approved package flow
**Then** new demand and inventory rows preserve stable grain, keys, masking rules, and cross-table consistency
**And** the package refresh remains append- or snapshot-friendly rather than destructively rewriting approved history
**And** the incremental outputs stay aligned to the approved public contracts and fail closed when coherence rules break
**And** the refreshed package can be promoted through the same governed current-package path already used by the MVP

### Story 5.3: Expand the Masked Entity Population to a Representative Bounded Market (FR19, FR20)

As a product owner,
I want the bounded public-safe package expanded from a tiny seed slice into a representative masked mini-market,
So that later realism review, Fabric proof refresh, and report exploration operate on believable entity diversity rather than on a smoke-scale population.

**Acceptance Criteria:**

**Given** the current approved package only contains a tiny seed market
**When** the next implementation step begins
**Then** the repo defines deterministic entity-expansion rules for accounts, products, inventory locations, and eligibility coverage rather than treating the seed slice as the final entity universe
**And** the design sets target cardinalities and bounded distribution rules that move the package toward approximately `100` accounts and `100-200` products without breaking masking, vocabulary, or scenario logic
**And** the expansion layer stays internal and deterministic, using seed archetypes plus governed derivation rules rather than raw source leakage or undocumented random cloning
**And** the next generation-control and candidate-refresh passes can consume the expanded entity population without uncontrolled all-to-all account-product or product-location coverage
**And** the story exits with implementation-ready table definitions, guardrails, and success metrics so realism review starts on a representative market

### Story 5.4: Validate Realism, Invariants, and Cross-Table Coherence Before Promotion (FR19, FR20)

As a product owner,
I want realism and invariant checks applied before logic-driven growth is promoted,
So that the public proof remains believable and analytically stable over time.

**Acceptance Criteria:**

**Given** a logic-driven package refresh is prepared
**When** coherence validation runs
**Then** the checks reject rows that break quantity, status, or date semantics
**And** economic proxy behavior, quarter-over-quarter growth, and snapshot transitions are reviewed for unrealistic jumps or contradictions
**And** the promoted package records which rule set or scenario inputs produced the refreshed outputs
**And** a failed coherence run blocks promotion to the stabilized serving layer

### Story 5.5: Refresh the Fabric Proof Stack from Stabilized Serving Logic (FR24, FR27)

As a technical evaluator and product owner,
I want the Fabric proof stack refreshed from stabilized serving logic rather than manual UI iteration,
So that platform credibility follows real analytical behavior instead of visual churn.

**Acceptance Criteria:**

**Given** a coherence-approved package refresh is available
**When** the Fabric proof stack is refreshed
**Then** the Bronze, Silver, and Gold proof tables plus the semantic model are updated from the stabilized serving logic
**And** the existing report shell remains valid or is minimally aligned without requiring richer Desktop composition
**And** the technical-method route can still describe the proof honestly while final manual layout work remains deferred
**And** the repo documents the exit criteria that must be satisfied before a richer Desktop-authored report pass begins

## Epic 6: Operate Releases with Traceability and Recovery

The product owner can version, monitor, explain, and recover public releases so the case remains trustworthy as it evolves.

Implementation note:

- Story `6.1` remains valid and complete.
- Stories `6.2` and `6.3` are intentionally paused in backlog until the Fabric-native correction in Epic `7` is complete.
- Epic `6` resumes after Epic `7` closes so release operations harden against the corrected runtime architecture rather than against the transitional bundle-first path.

### Story 6.1: Record Release Identity and Traceability (FR34, FR35, FR37)

As a product owner,
I want every public release tied to source, data state, and validation results,
So that I can prove exactly what is live and how it was approved.

**Acceptance Criteria:**

**Given** a public release candidate is promoted
**When** release metadata is recorded
**Then** the published state can be traced to a release identifier, source-control state, approved data snapshot or refresh state, and validation result
**And** the currently published version and last-known-good approved version are identifiable from the release records
**And** traceability artifacts are stored in a consistent structure that supports later review and recovery
**And** the release record does not rely on undocumented manual memory to explain what was deployed
**And** the release record includes the approved publication-boundary or manifest reference for the public proof assets included in that release

### Story 6.2: Publish Change Summaries and Operational Status (FR36, FR38)

As a product owner,
I want each meaningful release to include a clear change summary and status signals,
So that reviewers can understand what changed and whether the public artifact is healthy.

**Acceptance Criteria:**

**Given** a meaningful update is ready for publication
**When** the release is recorded
**Then** a change summary or release note records what changed, why the change was made, and the associated release identifier
**And** minimum operational status for the public artifact records the last successful refresh, validation status, and current release state
**And** deployment or validation outputs support the recorded status without exposing unsafe diagnostic detail on the public surface
**And** the status information can be updated as part of the release record without requiring a schema change, route redesign, or edits in more than two governed publication locations
**And** meaningful changes to public-proof scope, exposed technical evidence, publication-boundary decisions, or DP-700-proof coverage are recorded in the release summary

### Story 6.3: Recover Safely from a Problematic Release (FR39)

As a product owner,
I want a documented rollback path to the last approved version,
So that I can restore trust quickly after a broken or unsafe release.

**Acceptance Criteria:**

**Given** a public release is found to be broken, unsafe, or materially misleading
**When** rollback is initiated
**Then** the last-known-good approved version can be identified and restored through a documented recovery path
**And** the recovery process preserves traceability to both the failed candidate and the restored approved version
**And** rollback can be executed within one business day using the maintained release records
**And** the recovery process defaults to restoring a previously approved state rather than improvising an unreviewed replacement

## Epic 7: Execute the Bounded Proof Natively in Fabric with Enterprise-Like Orchestration

The product owner can preserve bounded public-safe governance in the repo while moving runtime execution, orchestration, and runtime traceability deeper into Fabric so the proof demonstrates platform-native data handling more credibly.

### Story 7.1: Canonicalize the Representative Approved Package and Align All Public Surfaces (FR19, FR20, FR24)

As a product owner,
I want the coherence-approved representative package to become the one canonical current package across the site, explorer, and proof path,
So that the public story no longer splits between a tiny seed market and a larger approved market.

**Acceptance Criteria:**

**Given** the representative package has already passed the coherence gate
**When** the Fabric-native correction begins
**Then** the representative approved package is promoted to the canonical `current` package for publication, public-site mirroring, and Fabric proof refresh inputs
**And** the old tiny `current` slice is explicitly reclassified as a seed-archetype source rather than the active public package
**And** the public site mirror, publication explorer, and project-map guidance all point to the same approved representative package rather than to parallel truths
**And** the promotion remains fail-closed if the representative package is not coherence-approved or if required public artifacts are incomplete
**And** the story exits with implementation-ready alignment rules, affected-surface references, and success checks for the first Fabric-native execution story

### Story 7.2: Refactor the Fabric Notebook into the Authoritative Bronze→Silver→Gold Execution Path (FR24, FR27)

As a technical evaluator and product owner,
I want the Fabric notebook to materialize a raw-like Bronze input, perform real Silver conformance inside Fabric, and keep Gold strictly as the serving layer,
So that the proof demonstrates a bounded but faithful Fabric medallion path rather than a repo-clean package that only gets lightly enriched.

**Acceptance Criteria:**

**Given** the approved repo input package is available
**When** the corrected Fabric-native execution path is implemented
**Then** Bronze preserves bounded controlled-realism traces rather than being described as the final clean public truth
**And** Silver explicitly owns normalization, conformance, and cleanup work inside Fabric
**And** Gold remains the downstream serving layer rather than the place where Bronze cleanup is hidden
**And** the notebook remains schema-explicit, deterministic, and aligned to the medallion contract
**And** local refresh orchestration verifies that the Fabric tables still match the expected bounded proof shape

### Story 7.3: Add a Real Fabric Pipeline plus Runtime Governance Tables (FR24, FR35, FR38)

As a product owner,
I want a real Fabric pipeline and runtime control tables added to the proof path,
So that orchestration, run status, and last-known-good signals exist inside the platform rather than only in local repo artifacts.

**Acceptance Criteria:**

**Given** the corrected raw-like Bronze-to-Gold path exists
**When** enterprise-like orchestration is added
**Then** a Fabric pipeline or equivalent orchestrated runtime sequence drives Bronze landing, Silver cleanup, Gold serving refresh, and status capture
**And** bounded runtime-governance tables record release identity, pipeline and notebook run status, active release pointers, and last-known-good references inside Fabric
**And** the pipeline remains subordinate to the repo-side approval gate rather than bypassing governed package promotion
**And** the pipeline records whether a bounded public serving extract was produced
**And** the new runtime-governance layer stays bounded and public-safe rather than expanding into a full enterprise operations estate

### Story 7.4: Integrate Fabric Runtime Execution with Release Traceability and Recovery Inputs (FR35, FR37, FR38, FR39)

As a product owner,
I want Epic `6` release records to incorporate Fabric runtime identity and control-plane evidence,
So that later change summaries and recovery steps describe the real operational path rather than only a transitional local refresh path.

**Acceptance Criteria:**

**Given** the corrected Fabric-native execution and orchestration layers exist
**When** release traceability is extended
**Then** release records can reference the repo input package, Fabric pipeline run, notebook execution, runtime-control state, and Fabric serving-output identity
**And** the current and last-known-good release identities can be reconciled between repo-side records and Fabric-side control tables
**And** the release record can state which public source is currently active during the transition
**And** the resulting traceability inputs are sufficient for Epic `6` change summaries and rollback work without requiring another architecture correction first

### Story 7.5: Reframe the Technical Narrative Around Fabric-Native Execution (FR24, FR27, FR28)

As a technical evaluator,
I want the technical-method narrative and proof documentation to explain what is governed outside Fabric versus executed inside Fabric,
So that the project reads as honest, bounded, and platform-native rather than as a bundle-first compatibility proof only.

**Acceptance Criteria:**

**Given** the roadmap now includes the Fabric-native correction
**When** technical narrative artifacts are updated
**Then** the public and repo-facing documentation separates the current implemented state from the target intended architecture
**And** the narrative makes it explicit that repo-side governance remains the approval boundary while Fabric handles the intended Bronze, Silver, Gold, and public-serving path
**And** the repo-approved package is no longer described as the long-term final public truth
**And** Silver is described as the cleanup and conformance layer, Gold as the serving layer, and the Fabric public extract as the target public source
**And** the corrected narrative stays bounded and does not overclaim a full enterprise production platform
