# MVP Visual Synthesis Brief

Date: 2026-04-01
Status: advisory

## Core Recommendation

Do not create one large “full architecture” diagram.

That would likely repeat what the repo already says in prose while making the system feel bigger and less legible than it needs to.

Instead, create a very small set of focused views that explain:

- boundary
- operating flow
- visible proof surface

## Why a Smaller Diagram Set Is Better

- The architecture is now rich enough that a single diagram would become noisy.
- The public audience does not need the whole internal operating system.
- The site currently needs compression and synthesis more than more explanation.

## Recommended Diagram Set

### 1. Boundary View

Purpose:

- explain the three-zone system clearly and fast

Audience:

- technical reviewers
- hiring managers
- non-technical but curious stakeholders

Content:

- Private preparation zone
- Governed analytics zone
- Public delivery zone
- optional side branch to bounded Fabric proof

Key message:

- sensitive reconstruction stays upstream
- public site and Fabric proof only consume governed outputs

Best placement:

- technical-method route
- interviews
- high-level README / project-map references

### 2. Operating Workflow View

Purpose:

- explain how the current MVP actually moves from seed to live proof

Audience:

- technical evaluators
- data platform interviewers

Content:

- seed slice
- generation controls
- representative package
- coherence gate
- Fabric proof refresh
- semantic model
- report shell

Key message:

- the proof stack follows stabilized logic, not ad hoc UI iteration

Best placement:

- technical-method route
- Fabric runbook summary
- interview walkthrough material

### 3. Proof Surface View

Purpose:

- show what the user can actually inspect today

Audience:

- reviewers who want to understand what is real now versus what is deferred

Content:

- Astro site
- case-study route
- technical-method route
- bounded Fabric embed
- Lakehouse / semantic / report relationship as a compact side map

Key message:

- the website is the product surface
- Fabric is bounded technical proof inside that surface

Best placement:

- technical-method route
- interview deck or talking points

## Optional Fourth Asset

If one extra visual is justified, do not make it an architecture diagram.
Make it an example operating view instead.

Recommended example:

- a simple visual of the inventory loop

Possible content:

- opening position
- inbound receipts
- serviced demand
- resulting snapshot posture

Why this is useful:

- it explains `fact_inventory_inbound` immediately
- it makes the logic-first path feel concrete
- it supports both business and technical audiences

## Format Guidance

Prefer:

- Mermaid for first-pass repo-native diagrams
- simple SVG or polished exports later if the site needs a stronger visual finish

Avoid:

- giant enterprise architecture maps
- diagrams that list every artifact and script
- visuals that expose private-prep complexity the public site is intentionally avoiding

## Suggested Sequence

1. Boundary view
2. Operating workflow view
3. Proof surface view
4. Optional inventory-loop example

## Bottom-Line Recommendation

Yes, the project should add visuals.

But the goal is not to document everything.
The goal is to make the current MVP easier to understand than the full architecture would be on its own.
