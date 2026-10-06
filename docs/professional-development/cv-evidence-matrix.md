# CV Evidence Matrix

Date: 2026-04-01  
Status: structural professional-development artifact  
Purpose: map repo evidence to employable capabilities, target role families, resume bullets, and interview angles

## How to use this matrix

Use this document when you need to turn repo work into:

- resume bullets
- LinkedIn positioning
- interview story selection
- role targeting
- evidence-backed self-description

This is not meant to be final resume copy.
It is the translation layer between repo artifacts and professional claims.

## Role families used here

- `General`: technical product owner, analytics delivery lead, BI lead, analytics engineer
- `Specialized`: Microsoft Fabric lead, BI modernization lead, semantic-model / governed-reporting lead, consulting-style analytics architect

## Evidence-strength guide

- `High`: directly implemented and visible in code, docs, or runtime/proof assets
- `Medium`: strongly supported by repo artifacts but still benefits from tighter compression in interview or CV language
- `Emerging`: directionally strong, but should be reinforced before becoming a headline claim

## Evidence matrix

| Repo evidence | Demonstrated capability | Strongest role family | Resume bullet candidate | Interview angle | Evidence strength |
| --- | --- | --- | --- | --- | --- |
| `platform/fabric/publication/current`, `platform/fabric/contracts/*.schema.json`, `platform/fabric/validation/` | Contract-first data-product design with governed publication boundaries | General, Specialized | Designed a governed public-safe analytical publication layer with explicit contracts, validation rules, and approved-package discipline for dimensions and facts. | Explain how contracts, validation, and approval boundaries kept the public case truthful without exposing raw business logic. | High |
| `_bmad-output/test-artifacts/fabric-candidate/`, `platform/fabric/contracts/candidate-validation-contract.md`, `platform/fabric/contracts/current-package-sync-contract.md` | Candidate-lane and fail-closed release discipline | General, Specialized | Implemented a candidate-to-approved promotion path that blocks unsafe refreshes before they reach the published analytical surface. | Tell the story of why a candidate lane matters when generated data starts to look plausible but still needs coherence checks. | High |
| `platform/fabric/contracts/logic-first-scenario-parameter-sets.md`, `docs/automation/logic-first-fabric-proof-workflow.md` | Logic-first product sequencing and business-rule governance | General, Specialized | Re-sequenced the MVP around deterministic business-rule logic so reporting and Fabric proof surfaces followed stable serving logic instead of driving discovery prematurely. | Use this to show product judgment: you paused UI/report polish until the logic was stable enough to deserve it. | High |
| `platform/fabric/contracts/fact_inventory_inbound.schema.json`, `05-compat/contracts/fab001_medallion_contract.json`, `platform/fabric/contracts/fact-build-rules.md` | Supply-chain loop modeling and analytical completeness | Specialized | Extended the operating model with governed inbound-inventory facts so inventory snapshots reflected replenishment behavior rather than static posture alone. | Tell the “why inbound mattered” story: the model was technically valid before, but not yet operationally honest. | High |
| `platform/fabric/automation/representative-market-lib.mjs`, `_bmad-output/test-artifacts/fabric-representative/current/`, `_bmad-output/planning-artifacts/sprint-change-proposal-2026-04-01-representative-entity-expansion.md` | Representative synthetic-market design from a bounded seed slice | General, Specialized | Expanded a tiny masked seed slice into a representative bounded market to make generated demand, inventory, and coherence checks analytically credible. | Strong story for correcting an MVP that was too small to prove the right thing. | High |
| `platform/fabric/validation/validate-representative-coherence.mjs`, `_bmad-output/test-artifacts/fabric-representative/representative-coherence-report.json`, `_bmad-output/implementation-artifacts/5-4-validate-realism-invariants-and-cross-table-coherence-before-promotion.md` | Cross-table coherence gating and promotion quality | Specialized | Added realism and cross-table coherence gates before promotion so representative-market outputs were structurally and behaviorally defensible before Fabric refresh. | Use this to demonstrate that you understand the difference between “valid shape” and “credible business behavior.” | High |
| `05-compat/contracts/fab001_fabric_build_runbook.md`, `05-compat/scripts/land_fab001_lakehouse_tables.py`, `_bmad-output/test-artifacts/fabric-proof/fab001/` | Fabric proof-stack operationalization | Specialized | Built and refreshed a bounded Fabric proof stack spanning Lakehouse landing, semantic-model materialization, and report-shell alignment from stabilized serving logic. | Good for BI Lead / Fabric roles: explain the end-to-end proof path and why it stayed subordinate to governed data logic. | High |
| `apps/public-site/src/pages/case-study.astro`, `apps/public-site/src/pages/technical-method.astro`, `docs/public-site/project-map.md` | Translating technical architecture into business-readable narrative | General | Created a web-first analytical case-study surface that explains business stakes, modeling boundaries, and technical proof without depending on a dashboard-only presentation. | Use this when asked how you communicate with mixed audiences or make technical work legible to non-engineers. | High |
| `_bmad-output/planning-artifacts/product-owner-balance-review-2026-04-01.md`, `_bmad-output/planning-artifacts/pre-epic-6-freeze-line-2026-04-01.md`, `_bmad-output/planning-artifacts/pre-epic-6-entry-checkpoint-2026-04-01.md` | Product-owner discipline, scope governance, and synthesis timing | General | Introduced formal balance review, freeze-line controls, and entry checkpoints to stop scope growth and shift the project into a governed pre-release state. | Strong answer for “How do you manage scope in ambiguous work?” | High |
| `docs/client-enablement/shared/discovery/client-discovery-brief-template.md`, `docs/client-enablement/shared/correspondence/README.md`, `docs/client-enablement/README.md` | Repeatable discovery and client-delivery scaffolding | General, Specialized | Designed reusable discovery and engagement templates to support future client-facing analytics work beyond the MVP itself. | Best for consulting, freelancing, or player-coach roles that value structured delivery and stakeholder handling. | Medium |
| `docs/research/fabric/index.md`, `docs/research/fabric/source-registry.md` | Structured technical learning and certification alignment | Specialized | Built an official-source Fabric research hub aligned to DP-700 topics so learning work stayed tied to implementation evidence rather than generic certification prep. | Good answer for “How are you developing Fabric depth?” | Medium |
| `_bmad-output/planning-artifacts/fabric-proof-alias-map-2026-04-01.md`, `docs/public-site/mvp-visual-synthesis.md`, `_bmad-output/planning-artifacts/public-site-message-architecture-2026-04-01.md` | Narrative compression and professional explanation design | General | Added a human-readable naming layer, message architecture, and focused visual synthesis so the MVP could be explained clearly to reviewers, recruiters, and stakeholders. | Strong when asked how you improve communication quality after the technical work is already functioning. | Medium |
| `_bmad-output/planning-artifacts/epics.md`, `_bmad-output/implementation-artifacts/sprint-status.yaml`, `_bmad-output/planning-artifacts/sprint-change-proposal-*.md` | AI-assisted work orchestration with explicit checkpoints | General, Specialized | Directed AI-assisted delivery through epics, story-level checkpoints, course-correction artifacts, and retrospective loops instead of using AI as an unstructured drafting tool. | Best answer when asked how you use AI responsibly in professional delivery. | Medium |

## Strongest role-aligned clusters

### 1. Technical Product Owner / Analytics Delivery Lead

Strongest evidence rows:

- logic-first sequencing
- product-owner discipline and freeze line
- web-first business narrative
- candidate lane and release controls
- AI-assisted orchestration with checkpoints

Best positioning:

- ambiguous problem framing
- scope correction
- business and technical bridge work
- delivery governance

### 2. BI Lead / Microsoft Fabric Modernization Lead

Strongest evidence rows:

- governed publication layer
- inbound fact and operating-loop modeling
- coherence gating
- Fabric proof-stack operationalization
- DP-700-aligned research lane

Best positioning:

- modernization path design
- medallion and semantic alignment
- report-proof delivery from stabilized serving logic
- governance before polish

### 3. Consulting / Boutique Analytics Architect

Strongest evidence rows:

- client-enablement scaffolding
- message architecture and visual synthesis
- representative-market correction
- public-safe boundary discipline

Best positioning:

- discovery to proof path
- public-safe analytical storytelling
- reusable method design
- stakeholder-facing explanation

## Claims that are supportable now

These claims are already safe to use with confidence:

- You can design a governed analytical MVP with explicit contracts, promotion controls, and public-safe boundaries.
- You can lead a logic-first analytics workflow and keep report/UI work subordinate to stable business logic.
- You can use Microsoft Fabric as a bounded proof surface tied to a governed serving layer.
- You can act as a product owner for ambiguous BI or analytics work, including scope correction and pre-release synthesis.
- You can direct AI-assisted delivery with more structure than ad hoc prompting.

## Claims to avoid overstating

These may be directionally true, but should be phrased carefully:

- enterprise-scale Fabric administration
- large-team people management
- full production Power BI design leadership
- broad production CI/CD or SRE ownership
- deep streaming / RTI specialization

These are better framed as:

- bounded proof implementation
- architecture and governance direction
- player-coach style leadership
- strong adjacent readiness with further room to deepen

## Recommended next use

Use this matrix to generate:

1. a role-targeting map
2. a resume bullet bank
3. an interview story bank

If only one next artifact is created, the next one should be:

- `docs/professional-development/interview-story-bank.md`

That would turn this matrix into faster, answer-ready interview material.
