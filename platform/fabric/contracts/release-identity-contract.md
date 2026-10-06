# Release Identity Contract

## Purpose

This contract defines the minimum machine-readable release records for Epic 6 and the reopened Epic `7` correction work.

The current contract must now distinguish two identities:

- repo input identity
- Fabric serving identity

That distinction matters because the repo-approved package is no longer treated as the intended final public truth.

## Required Outputs

The release ledger lives under:

- `_bmad-output/test-artifacts/release-ledger/`

Minimum files:

- `release-index.json`
- `current-release.json`
- `last-known-good-release.json`
- `releases/<release_id>.json`

## Minimum Release Record Fields

Each release record must include:

- `release_id`
- `release_family`
- `release_state`
- `recorded_at_utc`
- `source_control_state`
- `approved_data_state`
- `validation_state`
- `public_proof_assets`
- `runtime_execution_state`
- `recovery_inputs`

## Required Identity Split

Moving forward, the release record must be able to distinguish:

- repo-side approved Bronze input package identity
- Fabric Bronze, Silver, Gold runtime identity
- Fabric public-serving identity or extract identity
- active public-source mode

Recommended public-source modes:

- `repo_mirror_transitional`
- `fabric_serving_extract`

## Traceability Requirements

The record must tie the published state to:

- source-control state
- approved repo input snapshot or refresh identity
- validation result
- proof-manifest reference
- publication-boundary policy reference
- Fabric runtime pipeline identity
- effective notebook execution identity
- runtime-governance control-plane evidence
- active public-source identity

## Current and Last-Known-Good Pointers

`release-index.json` plus the two pointer files must make it possible to identify:

- the currently published release
- the current last-known-good approved release

For a single approved release, both pointers may reference the same release id.

## Runtime Reconciliation

The release ledger must also leave behind a machine-readable runtime reconciliation artifact:

- `release-runtime-reconciliation.json`

This artifact must compare the repo-side `current` and `last-known-good` pointers with:

- `ctrl_release_registry`
- `ctrl_last_known_good`
- visible runtime-governance tables
- active public-source mode

The reconciliation result must make it clear whether repo-side release identity and Fabric-side runtime identity are aligned.

## Current State And Remaining Gap

Current implemented state:

- release records already capture runtime pipeline, notebook, and control-table evidence
- the active public source is `fabric_serving_extract`
- release records capture both repo input identity and active public-source identity explicitly rather than leaving public-source state implicit in runtime-only artifacts

Remaining bounded gap:

- release reconciliation must continue comparing runtime public-source state and serving-extract status as part of alignment
- release records should continue surfacing whether the serving extract came from bounded Gold reference outputs or from a fully live Fabric-runtime pass

## Deliberate Boundaries

This contract still does not require direct rollback execution details.

Related contracts now live under:

- `platform/fabric/contracts/release-communications-contract.md`
- `platform/fabric/contracts/release-recovery-contract.md`
