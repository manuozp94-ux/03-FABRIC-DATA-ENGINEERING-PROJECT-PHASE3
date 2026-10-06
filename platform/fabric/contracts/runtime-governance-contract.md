# Runtime Governance Contract

## Purpose

This contract defines the bounded runtime-governance layer for Story `7.3`.

The goal is to keep runtime identity and status visible inside Fabric without pretending that this proof is a full enterprise operations estate.

The reopened Story `7.3` now requires one extra distinction:

- what repo input was approved
- what Fabric serving output was actually produced
- which public source is currently active

## Control Tables

The Lakehouse runtime-governance layer must materialize these tables:

- `ctrl_release_registry`
- `ctrl_last_known_good`
- `ctrl_runtime_job_history`
- `ctrl_asset_refresh_history`

## Required Behavior

- The runtime-governance tables must be written inside the proof Lakehouse.
- They must be sourced from the approved repo input package path and the bounded live proof refresh path.
- They must remain subordinate to the repo-side approval gate rather than becoming an alternate approval path.
- They must be able to indicate whether a bounded public serving extract was produced.

## Minimum Table Intent

### `ctrl_release_registry`

Tracks the active release identity visible to the runtime path.

Minimum fields:

- `release_id`
- `release_state`
- `release_record_path`
- `publication_dir`
- `pipeline_item_id`
- `pipeline_name`
- `pipeline_run_id`
- `pipeline_run_status`
- `notebook_item_id`
- `notebook_name`
- `notebook_run_status`
- `public_source_mode`
- `serving_extract_status`
- `recorded_at_utc`

### `ctrl_last_known_good`

Tracks the active and last-known-good pointers inside Fabric.

Minimum fields:

- `active_release_id`
- `last_known_good_release_id`
- `active_pipeline_run_id`
- `active_pipeline_status`
- `public_source_mode`
- `updated_at_utc`
- `recovery_note`

### `ctrl_runtime_job_history`

Tracks bounded runtime jobs for the proof path.

Minimum fields:

- `execution_type`
- `job_id`
- `parent_job_id`
- `item_id`
- `item_name`
- `status`
- `started_at_utc`
- `ended_at_utc`
- `failure_reason`
- `recorded_at_utc`

### `ctrl_asset_refresh_history`

Tracks downstream proof assets that depend on the Lakehouse refresh path.

Minimum fields:

- `asset_type`
- `asset_name`
- `asset_id`
- `status`
- `refresh_record_path`
- `related_release_id`
- `public_source_mode`
- `recorded_at_utc`

## Current State And Retained Fallback

Current implemented state:

- runtime governance already records pipeline, notebook, and asset status
- the active public-site source is `fabric_serving_extract`
- the serving extract status is recorded explicitly, including the current bounded state `produced_from_reference_gold`

Retained fallback requirement:

- runtime governance must distinguish `repo_mirror_transitional` versus `fabric_serving_extract`
- runtime governance must record whether the serving extract was produced
- runtime governance should surface that distinction both in the release pointer rows and in downstream asset history

## Deliberate Boundaries

Story `7.3` still does not require:

- multi-environment promotion
- enterprise alert routing
- broad operational telemetry
- full scheduler policy
- full rollback execution
