# Interview Slide Content Pack

Date: 2026-04-09  
Purpose: provide prompt-ready slide content for an English 10-12 minute interview deck

## Global Guardrails

Use these rules across every slide:

- keep the business story primary
- treat the portfolio as a bounded proof, not as proof of full enterprise ownership
- do not invent metrics
- do not imply finance-grade or real-time production claims
- do not let Fabric become the whole identity
- keep the story chronological first and technical second

## Slide 1

`title`: From Operations Floor to Governed Analytics Delivery

`objective`: Establish a simple professional identity and frame the deck as a progression rather than a list of tools.

`3-5 bullets`:

- Analytics Engineer and BI Lead with 7+ years across operational, supply chain, pricing, and finance workflows
- Started inside warehouse and customer-facing operations, not from a distance
- Built decision-support systems by turning fragmented logic into usable analytical tools
- Most recent applied work formalizes that path in a governed Microsoft Fabric proof

`speaker notes`:

Start with the shortest honest version of your story. You did not begin as a platform specialist. You began by learning the business from the floor, then kept moving closer to the logic behind decisions. That progression is why you can bridge operations, BI, and Fabric credibly.

`proof anchor`:

- user-supplied work history
- `docs/professional-development/linkedin-profile-copy-2026-04-07.md`
- `docs/professional-development/cv-refresh-draft-2026-04-07.md`

`visual hint`:

One clean hero slide with your name, role line, and a short subtitle such as "From operations execution to governed analytics delivery."

## Slide 2

`title`: Career Arc: 2018 to 2026

`objective`: Show the five chapters of your development so the panel can place later details inside one progression.

`3-5 bullets`:

- 2018-2021: learned the business from the floor and optimized manual processes
- 2019-2021: moved from execution support into KPI-driven tooling across supply chain, logistics, collections, and sales
- 2021-2022: formalized business-rule tooling for planning, allocation, commissions, and rebates
- 2022-2025: scaled BI delivery through Power BI dataflows, semantic logic, and governance direction
- 2025-2026: converted that experience into a governed Fabric portfolio proof

`speaker notes`:

This slide should make the rest of the deck easier to follow. Explain that your title changes matter, but the deeper throughline is the same: remove repeated blockers, make the business more legible, and formalize logic so teams can decide faster.

`proof anchor`:

- user-supplied work history
- `docs/professional-development/cv-refresh-draft-2026-04-07.md`

`visual hint`:

Horizontal timeline with five labeled phases and one sentence under each.

## Slide 3

`title`: Phase 1 - Learn the Business, Earn Trust, Improve the Work

`objective`: Show that your analytical credibility came from operational proximity and hands-on problem solving.

`3-5 bullets`:

- Started in assembly and warehouse execution work
- Applied industrial-engineering thinking to distribute line steps and improve hourly yield
- Stepped into inbound QC coverage when the manager was out
- Earned trust through reliability, curiosity, and process understanding
- Moved into full-time supply chain and logistics support because people saw you could do more than execute tasks

`speaker notes`:

The point of this slide is not the job title. The point is that you learned how the business actually moved before you ever tried to report on it. That gave you grounded judgment later when metrics, tools, and platform choices started to matter.

`proof anchor`:

- user-supplied work history

`visual hint`:

Simple step-up visual: assembly -> QC support -> supply chain/logistics role.

## Slide 4

`title`: Phase 2 - Excel Tools Became Early Decision Support

`objective`: Show how operational support work started turning into analytical support even before your title formally changed.

`3-5 bullets`:

- Built Excel-based inventory and logistics tools to maintain raw material availability without overstocking
- Learned purchase-order planning, inventory planning, and procurement execution in practice
- Managed customer communication across 30+ accounts in central and east-coast regions
- Partnered with outside sales to clean up severe past-due debt on two major accounts without interrupting product supply
- Started producing weekly sales reporting so stakeholders could read account behavior more clearly

`speaker notes`:

Explain that this was the overlap phase where you were still close to execution but increasingly solving information problems. The debt-reduction work is especially useful because it shows business impact, stakeholder handling, and calm execution under constraint.

`proof anchor`:

- user-supplied work history

`visual hint`:

Three-column layout: Supply Chain, Customer Service, Sales Reporting.

## Slide 5

`title`: Phase 3 - From Reporting to Business-Rule Tooling

`objective`: Show the point where you stopped only summarizing data and started formalizing how the business should calculate and act.

`3-5 bullets`:

- Focus shifted toward KPI drivers such as service level, lead time, inventory value, and revenue
- Extracted and summarized ERP facts from SAP BusinessByDesign CSV outputs
- Built demand-planning and forecasting logic that went beyond static reporting
- Developed logistics allocation logic to guide inventory placement across five locations
- Standardized commission, margin, and rebate calculation logic from irregular POS-driven inputs

`speaker notes`:

This is the clearest transition into formal analytics work. Say that the important change was not only more reporting volume. It was the move from displaying facts to codifying rules the business could actually operate from.

`proof anchor`:

- user-supplied work history

`visual hint`:

Flow diagram: ERP extracts -> planning logic -> allocation logic -> pricing and finance logic.

## Slide 6

`title`: Phase 4 - BI Modernization and Governance Direction

`objective`: Show how your scope widened from tool building into platform thinking, BI delivery discipline, and future-proofing.

`3-5 bullets`:

- Maintained and evolved a growing BI environment that at peak supported 30 reports and 12 dashboards with a small team
- Moved Excel-based logic toward Power BI Service through dataflows, modeled datasets, and DAX-based reporting logic
- Built a Power Platform application backed by SharePoint Lists, Power Automate, and Power Apps with Power Fx to calculate special-pricing margins, route approvals, and review active agreement health against updated unit costs
- Worked through weak ERP API documentation while introducing documentation, workspace separation, semantic consistency, and data-quality standards
- Helped shape Azure-oriented governance direction for customer-data collaboration while training a junior analyst to support execution

`speaker notes`:

The main idea here is future-proofing. You were no longer only solving one report at a time. You were trying to reduce logic fragmentation, make KPI definitions reusable, and build a more governed analytical environment. The Power Platform app is a good example because it shows you were not only publishing BI outputs. You were also turning pricing and approval logic into an operational tool sales teams and managers could actually work inside.

`proof anchor`:

- user-supplied work history
- `docs/professional-development/linkedin-profile-copy-2026-04-07.md`

`visual hint`:

Maturity ladder: spreadsheets -> Power BI dataflows and datasets -> workspaces and governance.

## Slide 7

`title`: Phase 5 - Fabric Portfolio Proof as Formalized Method

`objective`: Show how the independent project makes your earlier way of working visible in a governed, explainable, technically current form.

`3-5 bullets`:

- Built a bounded Microsoft Fabric proof around an inventory-readiness decision case rather than a generic sample dataset
- Kept the repo as the governance plane for approved inputs, contracts, validation gates, and release records
- Used Fabric as the execution plane for Bronze landing, Silver cleanup, Gold serving, runtime governance, semantic modeling, and report-shell proof
- Added candidate-lane, coherence-gating, and release-traceability controls so unsafe outputs do not promote casually
- Published the work through a public-safe case-study surface that explains both the business question and the technical method

`speaker notes`:

Be explicit that this is a bounded proof. The value is not that it claims full enterprise ownership. The value is that it makes your method visible: contract-first thinking, governance, medallion responsibilities, semantic alignment, and the ability to explain the work clearly.

`proof anchor`:

- `docs/professional-development/cv-evidence-matrix.md`
- `docs/automation/current-data-pipeline-description.md`
- `05-compat/contracts/fab001_fabric_build_runbook.md`
- `docs/professional-development/architecture-digest-fabric-first-medallion-2026-04-02.md`

`visual hint`:

Two-plane architecture visual: repo governance plane on the left, Fabric execution plane on the right, public-safe case-study surface downstream.

## Slide 8

`title`: Why This Background Fits an Azure and SQL to Fabric Transition

`objective`: Connect your story directly to the employer's situation and make the fit feel natural instead of forced.

`3-5 bullets`:

- I already work best in environments where logic is fragmented and definitions are still being stabilized
- My background is translating operational questions into governed layers, not just building visuals on top
- I have already moved work from manual and ad hoc structures toward more reusable BI and platform patterns
- The platform context is changing toward Fabric, but the core work is still source interpretation, modeling, governance, and adoption
- I can help bridge business stakeholders, BI delivery, and the newer Fabric execution layer while the data culture matures

`speaker notes`:

This is where you make the role fit explicit. Their challenge sounds like a younger data environment moving from Azure and SQL-centered assets into Fabric capacity. That is exactly the kind of transition where your combination of business framing, BI modernization, and Fabric proof work is relevant.

`proof anchor`:

- user-supplied employer context
- user-supplied work history
- `docs/professional-development/cv-refresh-draft-2026-04-07.md`

`visual hint`:

Bridge visual or "current state to target state" arrow with three labels: clarify logic, govern layers, operationalize in Fabric.

## Optional Appendix Slide 9

`title`: Tooling Stack by Era

`objective`: Give technical interviewers a fast inventory of the tools you actually used without derailing the main story.

`3-5 bullets`:

- Historical stack: Excel, CSV exports, SAP BusinessByDesign, SharePoint, Power BI Service, dataflows, datasets, DAX, OData and REST, workspace separation
- Portfolio stack: Node.js automation, JSON contracts, validation gates, Python Fabric API orchestration, PySpark notebooks, Delta Lakehouse tables, semantic model, DAX, report shell, Astro case-study surface
- Common thread: model the business first, then choose the right serving and governance layer

`speaker notes`:

Use this only when the interviewer wants tool specificity. Keep it as a tool inventory, not a brag sheet.

`proof anchor`:

- `docs/professional-development/interview-tool-inventory-2026-04-09.md`
- `package.json`
- `05-compat/README.md`

`visual hint`:

Two-lane table with Historical Stack and Portfolio Stack.

## Optional Appendix Slide 10

`title`: Current vs Target Fabric Architecture

`objective`: Show that you understand the difference between what is already implemented and what the architecture is still moving toward.

`3-5 bullets`:

- Current state: the repo still generates and approves the bounded input package
- Current state: Fabric already lands Bronze and derives Silver, Gold, runtime governance, semantic model, and report shell
- Target state: Bronze becomes more honestly raw-like, Silver owns cleanup and conformance, Gold remains serving
- Target state: long-term public truth should come from a bounded Fabric-derived serving extract

`speaker notes`:

Use the interview-safe phrasing from the study guide. The point is architectural honesty. You understand current state, target state, and the transition between them.

`proof anchor`:

- `docs/professional-development/current-vs-target-state-study-guide-2026-04-02.md`
- `docs/professional-development/architecture-teach-back-playbook-2026-04-02.md`
- `docs/automation/current-data-pipeline-description.md`

`visual hint`:

Before and after medallion diagram with "current implemented state" and "target state" labels.
