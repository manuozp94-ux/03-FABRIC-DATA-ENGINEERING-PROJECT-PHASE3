# Fabric Public Serving Extract Contract

## Purpose

This contract defines the bounded public-serving extract that sits downstream of the
Fabric Gold serving outputs.

The extract exists to give the public site a reviewer-friendly source that is:

- downstream of the Fabric medallion path
- bounded and publication-safe
- small enough to inspect and restore
- explicit about its provenance

## Source Boundary

The current implementation derives the extract from:

- `_bmad-output/test-artifacts/fabric-proof/fab001/current/reference/gold/`
- `platform/fabric/publication/current/` for approved-input provenance and source-slice metadata
- `_bmad-output/test-artifacts/fabric-financial/current/` for bounded realized revenue, COGS, and gross-margin inputs derived from the internal financial foundation

This is intentionally bounded. It does not claim that the public site reads Fabric
tables live at request time.

## Required Output Zones

Repo-side governed extract:

- `_bmad-output/test-artifacts/fabric-public-serving-extract/current/`
- `_bmad-output/test-artifacts/fabric-public-serving-extract/materialization-report.json`

Site-facing mirror:

- `apps/public-site/src/data/public-serving/current/`

## Required Extract Files

Each materialized extract must include:

- `manifest.json`
- `decision-summary.json`
- `action-queue.json`
- `demand-support-account-pattern.json`
- `demand-support-product-family.json`
- `financial-summary.json`
- `monthly-financial-trend.json`
- `public-policy-reference.json`
- `source-slice-summary.json`
- `unit-economics-reference.json`

## Minimum Behavior

- The extract must fail closed if any required Gold reference file is missing.
- The extract must preserve reviewer-facing decision outputs while staying bounded.
- The extract must include enough source metadata for the technical-method route to explain provenance without reopening raw facts directly in the site.
- The extract may expose a bounded economic reading layer.
- That layer may include:
  - explicitly proxy-based comparative metrics
  - bounded realized metrics derived from the internal financial foundation
- Any realized metric published here must remain publication-safe and must not be described as raw invoice-source or finance-grade enterprise truth.
- The site mirror must be generated from the governed extract output, not hand-authored.

## Current Versus Target

Current implemented state after this change:

- the public site consumes a bounded Fabric-derived serving extract mirrored into the site repo
- the approved repo package remains the Bronze-input baseline and provenance source
- the active extract now includes both:
  - proxy-based comparative metrics
  - bounded realized revenue, COGS, and gross-margin metrics derived from fulfilled-line sales realization

Current limit after this change:

- the extract is finance-capable enough to support bounded realized metrics
- it is still derived from rule-resolved internal financial-foundation artifacts rather than raw invoice-source or ERP-grade finance truth

Target extension from the current state:

- refresh the public serving extract directly from Fabric-runtime outputs rather than from the bounded local proof artifacts
- optionally strengthen the current bounded realized layer with deeper source evidence if the project scope ever expands beyond publication-safe portfolio boundaries

## Deliberate Boundaries

This contract does not require:

- live query access from the public site into Fabric
- unrestricted Gold-table publication
- a full operational API for the site
- publication of every Silver or Gold column
- finance-grade valuation, realized revenue, or realized margin

Related next-depth design:

- `platform/fabric/contracts/financial-analytics-layer-v1-design.md`
