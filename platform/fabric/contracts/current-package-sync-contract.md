# Current Package Sync Contract

## Purpose

This contract defines the legacy fallback boundary for synchronizing the repo-side `current` package into the publication mirror that predates the active Fabric serving extract.

Important status note:

- this sync path still exists and must remain fail-closed
- but it is no longer the active public-site source and should be treated as a retained fallback boundary only

## Source and Destination

- Approved source package during transition: `platform/fabric/publication/current/`
- Legacy publication mirror during transition: `apps/public-site/src/data/publication/current/`
- Candidate-only package remains separate: `_bmad-output/test-artifacts/fabric-candidate/current/`
- Active site-facing serving extract mirror: `apps/public-site/src/data/public-serving/current/`

Current meaning of the source package:

- approved Bronze input package
- not the intended long-term final public truth

Current meaning of the destination:

- legacy publication mirror only
- retained for fallback and historical inspection, not as the active public-site source

## Allowed Artifacts

Only the approved governed JSON artifacts may cross into the legacy publication mirror:

- `dim_product.json`
- `dim_product_family.json`
- `dim_account.json`
- `dim_inventory_location.json`
- `fact_demand_line.json`
- `fact_inventory_inbound.json`
- `fact_inventory_snapshot.json`

No logs, reports, candidate artifacts, private-prep files, ad hoc notes, or unmanaged files may be synchronized into the site mirror.

## Sync Trigger

- Trigger: explicit approved sync from the repo-side `current` package
- Legacy local entrypoint: `corepack pnpm run sync:public-site-publication`
- Candidate refreshes do not promote or sync automatically
- The sync entrypoint must reject any source path other than `platform/fabric/publication/current/`
- The sync entrypoint must reject any destination path other than `apps/public-site/src/data/publication/current/`

## Fail-Closed Rules

- The source package must pass publication validation before sync.
- The source package must contain only the approved artifact allowlist.
- The source package must contain every required approved artifact before sync begins.
- If validation fails or an unexpected artifact is present, the destination mirror must remain unchanged.
- The web-consumption mirror is generated output only and must not contain hand-authored business data.

## Deliberate Transition Boundary

This contract governs the current implemented sync path only.

It does not claim that:

- repo `current` is the long-term final public truth
- the legacy publication mirror is the intended steady-state source for the public site

The intended steady state is:

- repo-approved Bronze input package
- Fabric Bronze, Silver, and Gold execution
- bounded Fabric-derived public serving extract

## Ownership Boundary

- `platform/fabric/` owns generation, validation, repo package state, the legacy sync boundary, and the active public-serving-extract materialization flow.
- `apps/public-site/` consumes the generated serving extract and governed release mirrors; it does not own governed publication logic.
