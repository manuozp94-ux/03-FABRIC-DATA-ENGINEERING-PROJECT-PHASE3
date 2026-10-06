# Public-Site Copy and Visual Refinement Backlog

Status: Deferred follow-up
Last updated: 2026-03-30

## Purpose

Epic 2 establishes the route spine, basic layout, and minimum legal-readiness pages.
The copy now in the public site is intentionally serviceable rather than final.
This backlog records the refinement work that should happen after the architecture,
first analytical visualization, and business-story structure are in place.

## Why This Is Deferred

- The current priority is to complete the route structure and move back into the analytical case.
- The right tone depends on the final balance between business framing, technical evidence, and the primary visualization.
- Over-refining the copy before the visual and analytical objects are present would create rework.

## Deferred Refinement Scope

### 1. Voice and Editorial Refinement

- Remove remaining template language from landing, case study, technical method, contact, privacy, and terms routes.
- Calibrate the voice around senior business analysis first and technical implementation second.
- Replace generic explanatory text with tighter business-problem framing and more specific analytical interpretation.

### 2. Primary Analytical Visualization Integration

- Integrate the main analytical visualization only after the business framing and core measures are in place.
- Treat the primary visualization as a supply-chain decision view, not as a generic dashboard.
- Keep supporting visualizations clearly subordinate: sales for demand pressure, logistics for execution context.
- Validate that the visualization remains understandable on smaller screens before treating it as a core proof object.

### 3. Layout and Reading Rhythm

- Tighten spacing, section sequencing, and visual emphasis after the main visualization exists.
- Revisit how portrait, data signals, and narrative blocks share attention on the case-study route.
- Align support pages so they feel native to the same trust system without becoming overdesigned.

## Routes Most Likely To Change

- `apps/public-site/src/pages/index.astro`
- `apps/public-site/src/pages/case-study.astro`
- `apps/public-site/src/pages/technical-method.astro`
- `apps/public-site/src/pages/contact.astro`
- `apps/public-site/src/pages/privacy.astro`
- `apps/public-site/src/pages/terms.astro`

## Recommended Trigger Point

Start this refinement pass after:

1. Epic 3 business framing is in place.
2. Core measures and the primary analytical visualization are visible.
3. The technical-method route has enough stable evidence to avoid rewriting the whole site twice.
