# Controlled Realism Register

Date: 2026-04-01
Status: Active reference

## Purpose

This register makes the controlled-realism policy operational.

It exists to answer a specific architecture question:

- which bounded enterprise imperfections should remain visible in the delivery story
- where those imperfections are allowed to exist
- how they should be represented safely in the MVP

The goal is not to make the public model look messy for drama.
The goal is to preserve believable operational friction where it improves analytical credibility and justifies Bronze-to-Silver governance work.

## Critical Distinction

This project now has two different concepts that can both sound like "Bronze":

1. upstream private-preparation bronze-like evidence
2. Fabric proof Bronze inside `05-compat/`

They are not the same thing.

### Upstream private-preparation layer

- May retain or simulate bounded imperfections.
- Exists to preserve realistic enterprise friction before standardization.
- Is not published as part of the public-safe package.

### Fabric proof Bronze

- Is a landed copy of the approved public package.
- Is already governed and publication-safe.
- Exists to demonstrate the bounded Fabric medallion path, not to expose raw inconsistency directly.

Working rule:

- controlled realism belongs upstream first
- proof Bronze may carry safe traces of those conditions only after they have been abstracted into approved public-safe fields

## Governing Rule

Preserve only imperfections that map to a real business problem, a real modeling choice, or a real data-governance lesson.

Do not preserve imperfections that create complexity without improving the story.

## Active Register

### `CR-01` Naming drift across operational nodes

- Why it matters:
  - Real environments accumulate alternate site, storage, and node labels over time.
- Allowed zone:
  - upstream private preparation
- Public-safe representation:
  - stable `dim_inventory_location` rows
  - abstract `node_type_code`
  - masked `site_code`, `location_code`, and `location_name`
- Silver expectation:
  - collapse variant labels into one canonical location interpretation
- Not allowed:
  - exposing raw warehouse names, 3PL labels, or source aliases in the public package
- Validation implication:
  - canonical location resolution must remain deterministic and stable across reruns

### `CR-02` Late-arriving or partially releasable inbound

- Why it matters:
  - Physical receipt, approval, and usable availability do not always happen at the same moment.
- Allowed zone:
  - upstream private preparation and governed generation logic
- Public-safe representation:
  - `fact_inventory_inbound.receipt_date`
  - `receipt_flow_type`
  - daily lag between inbound and usable `available_qty` where node rules justify it
- Silver expectation:
  - distinguish approved inbound from immediately usable stock
- Not allowed:
  - full raw purchase-order lifecycle or vendor-specific transport detail in the public package
- Validation implication:
  - same-day relief must follow documented node and flow rules

### `CR-03` Demand versus service lag

- Why it matters:
  - Open demand should not disappear instantly just because demand exists.
- Allowed zone:
  - governed fact-generation logic
- Public-safe representation:
  - `demand_qty`
  - `delivered_qty`
  - `open_qty`
  - lagged effect from served demand into the next snapshot where required
- Silver expectation:
  - keep open-demand pressure visible alongside current inventory posture
- Not allowed:
  - perfect same-day fulfillment behavior across every account-product pair
- Validation implication:
  - `open_qty` must always remain derivable and non-negative

### `CR-04` Incomplete master-data coverage

- Why it matters:
  - Real operating slices often contain products, accounts, or locations that do not classify cleanly.
- Allowed zone:
  - both upstream prep and governed public package
- Public-safe representation:
  - `UNCLASSIFIED`
  - `UNKNOWN`
  - bounded fallback keys or fallback classes only where needed
- Silver expectation:
  - retain fallback transparency instead of pretending every entity is perfectly curated
- Not allowed:
  - broad null-heavy payloads or arbitrary corruption
- Validation implication:
  - fallback use must remain bounded, controlled, and vocabulary-valid

### `CR-05` Transit and restricted inventory usability

- Why it matters:
  - On-hand does not always mean ready-to-serve.
- Allowed zone:
  - governed public package
- Public-safe representation:
  - `inventory_status_code`
  - `readiness_flag`
  - node-aware treatment of `TRANSIT_NODE`, `THIRD_PARTY_NODE`, and `RESTRICTED_AREA`
- Silver expectation:
  - explain inventory posture with action and policy context instead of raw balance only
- Not allowed:
  - same-day `READY` interpretation for transit or restricted stock without an explicit approved rule
- Validation implication:
  - usability and readiness must remain consistent with node rules

### `CR-06` Historical version overlap and source drift

- Why it matters:
  - Historical enterprise artifacts often overlap, conflict, or partially supersede one another.
- Allowed zone:
  - upstream private preparation only
- Public-safe representation:
  - none directly in the public package
  - represented indirectly through the existence of the candidate lane, approved package, and publication controls
- Silver expectation:
  - not applicable directly to proof Silver tables
- Not allowed:
  - publishing raw version collisions or source-file conflicts into the public Fabric proof
- Validation implication:
  - approved package promotion must stay fail-closed when source preparation is unresolved

## What This Means For Bronze To Silver Storytelling

If we explain Bronze to Silver in interviews, docs, or the technical-method route, the honest story is:

- private preparation preserves bounded inconsistency
- the approved package abstracts that inconsistency into public-safe entities and facts
- proof Bronze lands the approved package as-is
- proof Silver enriches, standardizes, and interprets those approved signals for analytical use

So the Bronze-to-Silver lesson is still valid, but it should be phrased as:

- upstream realism and normalization discipline
- then governed landing
- then conformed interpretation

not as:

- raw messy Bronze directly exposed inside the public Fabric proof

## References

- `_bmad-output/planning-artifacts/phase0-sweep-spec-2026-03-25.md`
- `_bmad-output/planning-artifacts/masking-abstraction-framework-2026-03-25.md`
- `platform/fabric/contracts/fact-build-rules.md`
- `05-compat/contracts/fab001_medallion_contract.json`
- `docs/public-site/project-map.md`
