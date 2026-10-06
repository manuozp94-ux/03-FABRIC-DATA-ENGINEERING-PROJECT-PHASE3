# Release Communications Contract

## Purpose

This contract defines the governed outputs for Story `6.2`: change summaries and minimum operational status for the published public artifact.

These outputs must stay lightweight, reviewer-friendly, and machine-readable. They are meant to explain what changed and whether the public artifact is healthy without exposing unsafe diagnostic detail on the public surface.

## Required Output Zones

Repo-side governed outputs:

- `_bmad-output/test-artifacts/release-ledger/change-summaries/<release_id>.json`
- `_bmad-output/test-artifacts/release-ledger/change-summaries/<release_id>.md`
- `_bmad-output/test-artifacts/release-ledger/current-change-summary.json`
- `_bmad-output/test-artifacts/release-ledger/current-operational-status.json`

Site-facing governed mirrors:

- `apps/public-site/src/data/release/current-change-summary.json`
- `apps/public-site/src/data/release/current-operational-status.json`

## Required Change Summary Fields

Each governed change summary must include:

- `release_id`
- `summary_scope`
- `title`
- `why_this_release_mattered`
- `what_changed`
- `associated_release_identifier`
- `release_record_path`
- `operational_status_path`
- `current_public_source_mode`
- `serving_extract_status`

The summary may be baseline-oriented when there is no prior release to compare against.

## Required Operational Status Fields

Each governed operational-status record must include:

- `release_id`
- `current_release_state`
- `overall_status`
- `last_successful_refresh_utc`
- `release_proof_refresh_completed_at_utc`
- `latest_live_runtime_refresh_utc`
- `last_approved_release_recorded_at_utc`
- `approved_input_refresh_timestamp_utc`
- `refresh_evidence`
- `validation_status`
- `freshness`
- `public_source`
- `release_record_path`

The status output must surface:

- active last successful refresh
- whether that timestamp came from governed release-proof evidence or the latest reconciled Fabric runtime refresh
- validation status
- current release state
- active public-source mode
- serving-extract status

## Current Public Source And Remaining Gap

Current implemented state:

- the public site consumes a bounded Fabric-derived serving extract mirrored into the site repo
- operational status must say that explicitly, including the serving-extract status and active source mode

Remaining bounded gap:

- the current extract is materialized from bounded Gold reference outputs in the governed repo flow
- the change summary and operational status outputs must keep that distinction visible without overstating a same-pass live Fabric refresh

Freshness alignment rule:

- if the active public source is a reconciled `fabric_serving_extract`, the site-facing `last_successful_refresh_utc` must be derived from the latest readable live Fabric runtime evidence
- the older governed proof-refresh timestamp must remain available separately as `release_proof_refresh_completed_at_utc`
- if that live runtime evidence is missing while Fabric is the reconciled active source, release communications must fail closed rather than publishing stale freshness

## Fail-Closed Rules

- No change summary may be materialized if the referenced release record is missing.
- No operational status may be materialized if the release record does not include release state, validation evidence, and public-source state.
- The public-site mirrors must only be updated from the governed repo-side outputs created by this story.
- Change summaries must not embed raw diagnostics, private-prep details, or unsafe Fabric internals.

## Maintainability Boundary

This story is intended to keep release communications maintainable for a solo builder.

That means:

- the status model should fit inside one generated JSON record
- the summary model should fit inside one generated JSON record plus one generated markdown file
- the public route should consume the generated mirror rather than re-deriving governed release status from scattered files
