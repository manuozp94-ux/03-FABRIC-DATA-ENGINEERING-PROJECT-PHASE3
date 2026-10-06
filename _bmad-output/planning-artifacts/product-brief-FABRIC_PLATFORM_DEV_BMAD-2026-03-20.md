---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
inputDocuments: []
date: 2026-03-20
author: Manuel
---

# Product Brief: FABRIC_PLATFORM_DEV_BMAD

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

This project is a professional portfolio and case-study platform designed to demonstrate modern Data Engineering, Analytics Engineering, and Data Analysis capabilities using Microsoft Fabric. It is grounded in seven years of real-world experience in a solar-components manufacturing and distribution environment, but restructured into a publishable and confidentiality-safe form.

The project does not attempt to reproduce internal company systems or expose their underlying source logic. Instead, it begins from publication-safe, business-ready input streams and focuses on how a modern Fabric-native analytics platform should be designed today: from ingestion and transformation through semantic modeling and analytical exposure.

Upstream of the public portfolio, the project requires a private historical consolidation and abstraction phase. This phase identifies overlapping versions of analytical artifacts, resolves competing records across Excel files and Power BI dashboards, defines canonical cross-functional source tables, and prepares publication-safe incremental inputs. The public portfolio starts only after that controlled boundary is established.

The initial MVP case study will focus on commercial demand to multi-site inventory readiness, connecting demand signals, planning logic, inventory positioning, replenishment, and logistics context into a modern analytical workflow. Over time, the portfolio will expand into a broader set of case studies reflecting cross-functional expertise across sales, logistics, accounting, finance, supply chain, data engineering, and data analysis.

The broader objective is to create a portfolio asset that supports recruiting, consulting, educational content, and certification-aligned professional growth, including Microsoft Fabric readiness such as DP-700.

---

## Core Vision

### Problem Statement

Experienced data professionals often have their most meaningful work locked inside confidential business environments, fragmented historical artifacts, and legacy analytical solutions. These materials contain valuable business knowledge, but they cannot be shown publicly in their original form because of confidentiality, privacy, and intellectual property constraints.

At the same time, historical internal analytics implementations may no longer represent current best practices or modern platform capabilities. This creates a portfolio challenge: how to demonstrate real business-facing data expertise without reproducing confidential systems and without anchoring the public narrative in outdated implementations.

### Problem Impact

If this challenge remains unsolved, years of applied experience become difficult to communicate to recruiters, hiring managers, and potential consulting clients. Public portfolio work then risks looking generic, disconnected from real business complexity, or overly academic.

It also limits the ability to demonstrate cross-functional strength across commercial operations, logistics, supply chain, accounting, finance, semantic modeling, analytical delivery, and end-to-end testing in a way that feels commercially credible today.

### Why Existing Solutions Fall Short

Traditional portfolios often rely on generic public datasets and simplified examples that do not reflect the complexity of real planning and analytics work. Historical internal solutions, meanwhile, were built for operational use, not as modern, portable, publishable showcases of architecture quality.

The historical asset base for this project also includes significant overlap across versions of Excel files and dashboards from approximately 2018 to 2023. That means the problem is not only one of masking sensitive content, but of first reconstructing a coherent single source of truth before any publication-safe analytical model can be created.

Existing tool-specific implementations also tend to fragment business logic across spreadsheets, dashboard measures, and embedded transformations, making it difficult to present a clean and modern analytics operating model.

### Proposed Solution

Build a Fabric-first portfolio architecture that begins from publication-safe, business-ready input streams and demonstrates modern ingestion, transformation, semantic modeling, and analytical exposure patterns. The platform is designed as an end-to-end testable analytics stack, with quality checkpoints from ingestion through analytical output.

Upstream of the public platform, a controlled private enablement layer consolidates historical artifacts, resolves overlapping records, defines canonical source tables, and converts confidential cross-functional business assets into publication-safe, incrementally maintainable analytical inputs. This layer preserves business behavior without exposing source lineage, identifying structures, or proprietary operational details.

The first public case study will focus on a generalized commercial demand to multi-site inventory readiness scenario, using abstracted business entities such as demand signals, inventory positions, replenishment decisions, inter-location inventory movement, pricing and costing relationships, and location-aware planning flows. The broader portfolio will later extend into adjacent domains including finance, accounting, logistics, sales operations, and cross-functional analytics design.

The project will emphasize business-rule extraction, ontology design, medallion-aligned transformation patterns, Fabric-native implementation, and structured AI-assisted development methods. Analytical exposure will remain a checkpointed decision, allowing validation of whether Power BI remains the best final presentation surface or whether other web-based delivery surfaces are more appropriate for public publishing.

### Key Differentiators

- Built from real business experience accumulated over seven years, not synthetic exercises alone
- Deep knowledge of the underlying source domains and the internal relationships between them
- Backed by an internal portfolio of roughly 30 decision-oriented visualizations and calculations developed for distinct operational needs
- Strong case density: even with a limited number of source domains, the relational flexibility across sales, logistics, supply chain, accounting, finance, and operations creates many meaningful analytical scenarios
- Designed as an end-to-end testable stack from ingestion to analytical output
- Uses Microsoft Fabric as the primary end-to-end platform for ingestion, transformation, semantic modeling, and analytical delivery
- Treats business ontology and rule design as central architectural assets
- Includes a private abstraction boundary capable of turning fragmented confidential assets into publication-safe incremental analytical inputs
- Uses a structured AI-assisted, agent-supported delivery method to improve clarity, consistency, and development speed, while keeping operational analytics expertise as the headline strength
- Supports multiple outcomes at once: professional portfolio, consulting showcase, educational content engine, and certification-aligned practice environment


## Target Users

### Primary Users

#### Hiring Manager or Technical Decision Maker

A primary user is a hiring manager, analytics leader, data leader, or technical evaluator who needs to determine whether this portfolio demonstrates real-world capability beyond generic sample projects. This user wants fast evidence of business understanding, architectural judgment, and practical Microsoft Fabric execution grounded in operational complexity.

They are motivated by finding someone who can bridge fragmented business realities, business-rule design, platform thinking, and analytical delivery. They are less interested in polished buzzwords than in whether the work reflects credible decision-making, clear structure, and realistic implementation discipline.

Success for this user looks like understanding within minutes that the project is based on authentic operational complexity, uses a modern Fabric-native approach, and reflects a professional who can connect business context to platform design and analytical products.

#### Recruiter or Talent Acquisition Screen

Another primary user is a recruiter or talent acquisition partner who needs to evaluate professional fit quickly, even without deep technical expertise. This user needs a clear explanation of role fit, business relevance, platform specialization, and evidence that the work is more substantial than a generic portfolio exercise.

They benefit from concise framing, visible business use cases, and a structure that makes it easy to understand the project's value, domain scope, and technical focus without reading every artifact in depth.

Success for this user looks like quickly identifying the portfolio as credible, role-relevant, and worth advancing into interview or deeper review.

### Secondary Users

#### Prospective Consulting Client or Operational Analytics Sponsor

A secondary but commercially important user is a prospective consulting client, analytics sponsor, or operational decision-maker working in a company where data still lives across disconnected files, shared repositories, spreadsheets, and fragmented reporting layers. This user is often dealing with growth, increasing coordination complexity, inconsistent logic, and weak platform governance.

They are motivated by finding a practical path from fragmented operational analytics toward a more governed, scalable, and decision-oriented environment. They benefit from case studies and business use cases that show how the same portfolio can apply to real transformation scenarios, even when the public presentation is oriented primarily toward employability and professional credibility.

Success for this user looks like recognizing that the portfolio reflects the same class of problems they face and that the approach could translate into advisory, architecture, or implementation support.

#### Educational and Community Audience

Another secondary audience includes practitioners, learners, and community members who may discover the project through long-form videos, short explainers, development diaries, or technical commentary shared on channels such as YouTube and LinkedIn. This audience is not the primary buyer, but it can amplify reach, trust, and authority.

This audience benefits from transparent explanations, structured breakdowns, and selected educational content that supports the portfolio without replacing its main purpose. In this model, content serves as a discovery and trust-building channel rather than the central product.

### User Journey

#### Hiring Evaluation Journey

- **Discovery:** Finds the portfolio through resume links, direct applications, LinkedIn, or recruiter outreach.
- **Onboarding:** Understands within the first minute that the project is based on real operational complexity rather than a synthetic demo.
- **Core Usage:** Reviews the main case study, supporting business use cases, architecture framing, and selected implementation artifacts.
- **Success Moment:** Concludes that the portfolio demonstrates applied judgment across business context, Fabric platform design, and analytical delivery.
- **Long-term:** Advances the candidate to interview, deeper technical review, or role qualification.

#### Consulting Trust Journey

- **Discovery:** Finds the portfolio through referrals, LinkedIn, YouTube, or shared case-study content.
- **Onboarding:** Quickly sees that the project addresses familiar problems such as siloed information, fragmented reporting logic, and the need for a governed analytics platform.
- **Core Usage:** Reviews applied scenarios and business use cases to assess whether the approach can map to their own environment.
- **Success Moment:** Recognizes the portfolio as credible proof of transformation thinking, not just a technical showcase.
- **Long-term:** Moves toward a discovery call, advisory conversation, or architecture-focused consulting discussion.

#### Educational Discovery Journey

- **Discovery:** Encounters the project through video content, technical explainers, or short development narratives.
- **Onboarding:** Understands that the project documents how real operational analytics problems can be translated into a modern Fabric-native platform.
- **Core Usage:** Engages with selected educational content that reinforces the credibility of the portfolio and explains parts of the build process.
- **Success Moment:** Recognizes the creator as someone who can both build and explain complex analytics work clearly.
- **Long-term:** Shares content, follows the project, or later converts into a hiring lead, client lead, or trusted referrer.


## Success Metrics

From first principles, this project succeeds only if it creates three durable outcomes: measurable business advancement, credible public proof, and reusable delivery capability.

The portfolio must generate real advancement opportunities from the right audiences. For hiring audiences, success means recruiters, hiring managers, or technical evaluators move the creator forward into screenings, interviews, or role-fit discussions. For consulting audiences, success means qualified prospects move forward into discovery calls or comparable next-stage commercial conversations.

A qualified opportunity is any inbound or outbound-triggered next step that demonstrates credible professional or commercial intent after exposure to the portfolio, a case study, or supporting content. In practice, this means an opportunity only counts once it advances to a clearly defined next stage such as a screening, interview, referral conversation, or booked discovery call.

The project must also create credible public proof. If no publishable case study, asset, or supporting content reaches a defined quality threshold, the system cannot reliably build trust, support conversion, or validate market relevance.

Finally, the project must build reusable delivery capability. It should produce end-to-end Fabric deliverables with documented evidence and repeatable patterns that reduce future implementation friction and improve execution maturity over time.

### Business Objectives

#### 3-Month Objectives

- Publish a credible MVP case study that is safe to share publicly.
- Launch a portfolio surface with one clear path for hiring conversations and one clear path for consulting inquiries.
- Produce the first reusable internal assets for future Fabric work, including documentation, templates, or bootstraps.
- Begin a study guide that documents architecture, decisions, and implementation patterns for future reuse.
- Generate early signals of traction through recruiter engagement, hiring interest, or first consulting conversations.

#### 12-Month Objectives

- Build a repeatable portfolio and content engine that produces stable employment opportunities and qualified consulting interest.
- Establish a recognizable professional profile around Microsoft Fabric, operational analytics transformation, and modern analytics platform design.
- Generate enough professional opportunity to support sustainable income growth through employment, consulting, or both.
- Reach a level of technical maturity that supports passing DP-700 and operating credibly across Data Engineering, Analytics Engineering, Data Architecture, and Data Analysis responsibilities.
- Maintain a reusable library of patterns, templates, and decision support assets that reduce friction for future Fabric architecture and implementation work.

### Key Performance Indicators

#### Formal Success Metrics

- Qualified opportunities advanced to next stage per month
- Publishable assets that meet a defined quality threshold
- End-to-end Fabric deliverables completed with documented evidence and repeatable patterns

#### Secondary Signals

- Qualified recruiter or hiring manager responses
- Interview or screening invitations
- Qualified consulting inquiries
- Discovery calls booked
- Visit-to-qualified-contact conversion rate
- Case studies released
- Time to first publishable artifact
- Supporting content pieces released
- DP-700 certification achieved
- Reusable templates, bootstraps, or starter assets created
- Study-guide entries or knowledge assets created

#### Warning Signals

- Scope expands faster than publishable outputs
- No meaningful public artifact is released within the intended timeframe
- The portfolio attracts attention but does not produce contact actions
- Content volume increases without measurable advancement opportunities
- Internal work produces activity but not reusable delivery leverage

## MVP Scope

### Core Features

The MVP should be a bounded but complete public reference slice that proves the project can transform masked historical business evidence into a publishable, Fabric-native analytical product.

The MVP should include the following core features:

- A governed preparation boundary that converts a limited subset of historical source data into publication-safe, masked, behaviorally coherent analytical inputs.
- A Microsoft Fabric delivery path that shows ingestion, transformation, and business-ready analytical modeling from those prepared inputs.
- A single primary case study focused on commercial demand to multi-site inventory readiness.
- A derived inventory-location dimension that represents sites, storage locations, logistics areas, and inventory-node roles without exposing enterprise-identifying labels.
- A derived product-family classification that groups products into operationally meaningful families for planning, storage, and readiness analysis.
- A fully synthetic economic proxy layer that derives cost, price, and margin-oriented metrics from product-family logic, physical and logistical attributes, and limited node-type adjustments rather than from raw commercial source pricing.
- A supporting analytical view that shows cross-functional family readiness by location, making the case relevant to sales, supply chain, and logistics teams.
- A published analytical surface and landing page that communicate the case clearly to recruiters and prospective clients.

### In-Scope Source Families

The initial MVP source slice should be built from four core source families:

- Product Information
- Customer Demand
- Stock Overview
- Account Assignments

Customer Demand should serve as the canonical demand source for the MVP. Open Orders may later be represented as an active-status subset or derived analytical view, but should not be treated as a separate core source unless later validation shows a materially different business role.

Stock Overview should serve as the primary operational inventory-readiness source for the MVP. Inventory Balance Summary is better treated as a later extension for reconciliation, historical valuation, or finance-facing analysis rather than as a core operational source in the first slice.

### In-Scope Modeled Entities

The MVP model should derive and expose a small but meaningful set of analytical entities from those source families:

- `dim_product`
- `dim_product_family`
- `dim_account`
- `dim_inventory_location`
- `fact_demand_line`
- `fact_inventory_snapshot`
- synthetic economic proxy measures derived from product-family rules and bounded node-type adjustments

The MVP does not require a perfect canonical raw location master before delivery. Instead, the inventory-location layer should be derived from operational stock visibility and enriched with assignment context where useful.

The MVP also does not require raw commercial pricing or inventory-cost source files. The public-facing economic layer should remain fully synthetic and should be used only to support value-oriented proxy analysis.

### Out of Scope for MVP

The following items are explicitly out of scope for the MVP:

- full consolidation of every historical workbook family into a complete enterprise-wide canonical model
- complete mapping of all business rules across all domains
- full portfolio coverage across sales, logistics, finance, accounting, and supply chain in a single release
- full ontology implementation across the broader platform
- advanced Copilot or agent-driven analytical interaction as a core feature
- multiple case studies in the initial release
- a complete consulting offer catalog or service-package design
- full physical-capacity optimization logic for inventory placement
- creation of a perfect enterprise-wide 3PL or location master before the first publishable slice
- raw customer-specific price lists, rebates, discounts, SPA logic, realized invoice pricing, or finance-grade realized margin analysis

### MVP Success Criteria

The MVP succeeds when a visitor can immediately understand that this is not a generic data portfolio artifact, but a credible end-to-end demonstration of how fragmented operational data can be turned into a governed analytical product using Microsoft Fabric.

The MVP also succeeds when it demonstrates all of the following in a bounded way:

- masked and publication-safe use of realistic operational data conditions
- a clear path from source-derived inputs to business-ready analytical outputs
- a convincing demand-to-inventory-readiness case across multiple inventory nodes
- meaningful organization of products into operational families
- one supporting cross-functional view that shows why the same modeled slice matters to sales, supply chain, and logistics
- a synthetic economic overlay that introduces dollars-and-cents proxy logic without exposing actual commercial terms
- a public analytical artifact that can be confidently shared in professional contexts

For the creator, the MVP is successful when it becomes a portfolio page that can be included in a CV, shared with recruiters, and defended clearly in hiring or consulting conversations.

### Future Vision

After the MVP, the project can expand in several directions:

- historical sweep and canonical consolidation across the larger archive
- richer masking and abstraction patterns across additional domains
- additional case studies across finance, accounting, logistics, and supply chain
- stronger semantic and ontology layers
- more complete inventory-network and allocation modeling
- more realistic economic modeling once the public abstraction framework is mature enough to support it safely
- reusable templates and bootstraps for future Fabric architecture work
- educational content and technical walkthroughs that support discovery and trust
- optional AI-assisted analytical experiences once the underlying model is mature enough to support them safely

