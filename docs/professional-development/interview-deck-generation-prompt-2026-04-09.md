# Interview Deck Generation Prompt

Date: 2026-04-09  
Purpose: provide one master prompt for PowerPoint, Canva, or other AI presentation tooling

## How To Use

Use this prompt after reviewing:

- `docs/professional-development/interview-deck-outline-2026-04-09.md`
- `docs/professional-development/interview-slide-content-pack-2026-04-09.md`
- `docs/professional-development/interview-story-bank-2026-04-09.md`

If the tool supports speaker notes, keep them.
If it supports style control, keep the deck restrained and interview-safe.

## Master Prompt

```text
Act as a senior presentation strategist for an interview deck.

Create a clean, business-first, English presentation for a mixed interview panel.
The deck should support a 10-12 minute walkthrough.

Candidate profile:
- Analytics Engineer / BI Lead
- 7+ years of experience across operations, supply chain, logistics, customer service, pricing, finance, BI delivery, and Microsoft Fabric-oriented analytics work
- strongest value: turning fragmented operational logic into governed decision-support systems

Presentation goal:
- show a coherent progression from operations-grounded problem solver to KPI-driven analyst to BI/platform lead to Fabric-oriented analytics engineer
- present the independent Fabric portfolio as the capstone that formalizes earlier real-world patterns, not as a disconnected side project
- end with a clear fit for a company moving from an Azure and SQL-centered environment toward Fabric capacity

Audience:
- mixed panel with both business and technical interviewers
- prioritize business readability first, then selective technical credibility

Structure:
- 8 core slides
- 2 optional appendix slides

Required slides:
1. Title and one-line professional identity
2. Career arc timeline from 2018 to 2026
3. Operations foundation and early process improvement
4. Early analytics tooling across supply chain, logistics, collections, and sales reporting
5. Formal analyst phase with planning, allocation, margin, commission, and rebate logic
6. BI modernization phase with Power BI, dataflows, semantic consistency, workspace separation, and governance direction
7. Fabric portfolio proof with repo governance plane, Fabric execution plane, Bronze/Silver/Gold, semantic model, report shell, runtime and release controls
8. Why this background fits an Azure and SQL to Fabric transition
9. Optional appendix: tooling stack by era
10. Optional appendix: current vs target Fabric architecture

Use the following slide schema internally for each slide:
- title
- objective
- 3 to 5 bullets
- speaker notes
- proof anchor
- visual hint

Hard constraints:
- do not invent metrics, achievements, or technologies
- do not imply full enterprise Fabric administration
- do not imply finance-grade production ownership
- describe the Fabric project as a bounded proof, governed package, and public-safe analytical case
- keep Microsoft Fabric important, but not the candidate's only identity
- do not make the deck look like a flashy sales pitch
- avoid clutter, buzzword clouds, and dense architecture walls

Tone and design direction:
- calm, credible, modern, understated
- one simple timeline visual
- one simple two-plane architecture visual
- one clean maturity or transformation visual
- minimal text per slide
- use speaker notes for the fuller explanation

Preferred wording:
- governed analytical products
- decision-support systems
- repo governance plane
- Fabric execution plane
- bounded proof
- public-safe analytical case
- semantic model and report shell
- current implemented state
- target state

Source material to honor:
[PASTE THE CONTENT FROM interview-slide-content-pack-2026-04-09.md HERE]

Deliver:
1. final slide-by-slide presentation copy
2. speaker notes per slide
3. suggested visual layout per slide
4. optional appendix slides
5. one short title option and one stronger title option
```

## Output Check

Before accepting generated output, verify:

- each core slide stays within 45-75 seconds of speaking time
- the deck stays chronological first and technical second
- slide 7 uses safe language like `bounded proof` and `governed package`
- slide 8 clearly addresses Azure/SQL to Fabric transition fit
- nothing sounds inflated, flashy, or overly AI-written
