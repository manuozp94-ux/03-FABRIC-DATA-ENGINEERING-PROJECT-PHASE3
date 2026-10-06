# Public-Site Copy Audit

Date: 2026-04-01
Status: advisory

## Overall Judgment

The site is structurally disciplined and technically honest, but the copy is now the weakest layer relative to the maturity of the implementation.

The core issue is not that the copy is bad.
The issue is that the product got sharper during Epics 3 to 5, while parts of the narrative still sound like:

- a careful technical explanation
- a portfolio case-study frame
- and a public-safe disclaimer system

more than a strongly positioned analytical product story.

## Best Current Copy Traits

- The site is calm and professional rather than exaggerated.
- It avoids generic AI-product hype.
- It keeps boundaries honest instead of pretending the product is broader than it is.
- It preserves a business-first reading sequence rather than making Fabric the headline.

## Main Copy Risks

### 1. It is still too explanation-heavy in places

The site often explains why it is bounded instead of confidently stating what it helps a reviewer understand.

Risk:

- reviewers may respect the discipline but still miss the value proposition quickly

### 2. It is slightly over-weighted toward defensive framing

There is a lot of careful language about boundaries, masking, omission, and what is not included.
That honesty is valuable, but it can dominate the experience.

Risk:

- the reader comes away understanding caution more than capability

### 3. The product positioning could be more explicit

The current site clearly says “not ERP, not planning suite, not live cockpit.”
It is somewhat less sharp about the affirmative positioning in one sentence.

Desired one-line clarity:

- a governed supply-chain decision-support proof built from real operational logic and presented through a web-first public-safe experience

### 4. The site still sounds more like a technical case than a hiring-market narrative in a few places

That is not fatal, but it likely leaves value on the table for hiring or consulting readers.

## Route-by-Route Notes

### Landing page

File:

- `apps/public-site/src/pages/index.astro`

What works:

- the operating problem is visible quickly
- the route map is clean
- the scope statement is disciplined

What needs work:

- the hero could be more differentiated
- “A case study about demand, inventory, and cross-functional decisions” is accurate but not especially memorable
- “Who this is for” is useful, but the language still reads slightly like explanatory utility rather than positioning

Recommendation:

- sharpen the hero into a more ownable point of view
- make the audience blocks more outcome-oriented

### Case-study route

File:

- `apps/public-site/src/pages/case-study.astro`

What works:

- the route is analytically rich
- it has real substance and operational signal
- it is already the strongest product-like part of the site

What needs work:

- some labels still read more like artifact description than business message
- the route could benefit from a clearer “why this matters” arc before the metrics and views
- it likely needs a copy pass from someone strong in B2B analytical positioning, not just technical correctness

Recommendation:

- tighten the framing around the decision being improved
- make the business stakes and audience payoff more explicit

### Technical-method route

File:

- `apps/public-site/src/pages/technical-method.astro`

What works:

- it is unusually honest
- it explains boundary and method clearly
- it now has enough proof to justify its existence

What needs work:

- it still carries too much “explain the architecture to prove seriousness” energy
- some sections are dense and internally legible but not strongly synthesized
- the route would benefit from fewer words and more visual compression

Recommendation:

- replace some prose with diagrams or compact matrices
- keep the route strong on proof, but lighter on repeated boundary explanation

## Recommended Copy Passes

### Pass 1: Message architecture

Goal:

- define the exact product statement
- define primary audience
- define secondary audience
- define 3 to 5 core messages the site must land

### Pass 2: Positioning and differentiation

Goal:

- sharpen why this is better than a generic dashboard portfolio piece
- sharpen why the web-first plus bounded-Fabric pattern matters

### Pass 3: Marketing/editorial refinement

Goal:

- make the pages feel more intentional, memorable, and professionally framed
- reduce over-explanation without adding hype

## Bottom-Line Recommendation

Yes, this is one of the few areas where an external marketing or positioning advisor could add real value.

The project does not need marketing spin.
It needs:

- tighter message hierarchy
- better narrative compression
- stronger public positioning language

That would likely raise perceived quality more than another increment of technical depth right now.
