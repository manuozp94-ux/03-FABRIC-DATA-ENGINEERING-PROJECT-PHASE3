# Power BI / Fabric Proof Reentry Plan

Date: 2026-03-30
Status: active reference note

## Why this note exists

The MVP public experience is currently Astro-first. That was a deliberate choice so the business problem, analytical logic, and publication-safe boundary could be clarified before introducing another presentation dependency.

This did **not** mean Power BI or Fabric proof had been dropped. It meant the project was sequencing that proof later and more carefully.

## Current position

- Astro is the primary public narrative and controlled delivery surface.
- The governed publication package remains the contract between the analytical system and the website.
- Fabric-oriented credibility already exists in the data contracts, publication flow, candidate lane, validation, and technical-method content.
- The initial bounded proof artifact now exists through the live report shell, semantic model, and technical-method embed path.
- What remains intentionally later is richer manual report composition after the underlying business logic and serving tables are more stable.

## Why Power BI / Fabric did not come first

- The business case needed to become legible before the tool became the headline.
- A web-first route provides tighter control over copy, layout, boundary language, and publication safety.
- Public Power BI exposure creates more risk if used as the default delivery mechanism.
- The product should demonstrate judgment about when Power BI or Fabric adds value, not treat the tool as the story itself.

## Reentry principle

Power BI / Fabric should return as **technical proof**, not as the main storytelling surface.

The public website remains the main product surface.
Any Power BI or Fabric artifact exposed publicly must stay:

- subordinate to the curated website
- governed by the approved publication boundary
- explicitly labeled as direct proof, bounded proof, or approved export
- publication-safe without implying live private-system access

## Reentry result

Power BI / Fabric reentered once Epic 3 was stable enough that:

1. the main supply-chain decision view is already clear
2. the supporting demand view is already clear
3. freshness and release context are already visible
4. the technical-method route is ready to host bounded proof

That placed reentry naturally in Epic 4 rather than earlier in Epic 3.

Story `4.6` closed that initial reentry milestone by delivering:

- the bounded Fabric Lakehouse path
- the semantic-model contract and live semantic proof
- the report shell and bounded embed route

## Current priority after reentry

The next priority is not richer manual UI work.
The next priority is a logic-first operating workflow:

1. deterministic business-rule parameterization
2. coherent incremental fact growth
3. realism and invariant validation
4. Fabric serving refresh from stabilized logic
5. manual Desktop composition only after logic stability is achieved

## Acceptable proof forms

The preferred proof forms are:

- a bounded Power BI report snapshot or governed export tied to the approved public package
- a Fabric-oriented evidence panel that references semantic, model, validation, or publication artifacts already approved for release
- an approved deep link, screenshot, or exported visual that is clearly subordinate to the technical-method route

## Forms to avoid

- Power BI Publish to web as the default public delivery mechanism
- a second disconnected BI experience that replaces the website
- public exposure of raw workspace structure, private prep assets, or unsafe model internals
- any proof artifact that reads like a full planning suite or ERP replacement

## Current bounded next step

Recommended next story:

`Story 5.1: Define Deterministic Business-Rule Parameter Sets`

Intent:

- make the analytical behavior more real before the visuals become richer
- keep the Fabric proof tied to stabilized serving logic
- ensure later Desktop work validates stable outputs rather than chasing moving targets

## Relationship to the MVP

This reentry does not change the MVP thesis.

The thesis remains:

- primary value: supply-chain decision support
- supporting value: demand and logistics context
- technical proof: Fabric-oriented governed implementation shown in bounded form

Power BI / Fabric proof should strengthen that thesis, not compete with it.
