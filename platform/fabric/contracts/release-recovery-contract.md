# Release Recovery Contract

## Purpose

This contract defines the bounded rollback path for Story `6.3`.

The goal is not to create a full production disaster-recovery estate. The goal is to make it possible to restore the last-known-good approved public state through governed release records, recoverable snapshots, and explicit recovery reports.

## Required Output Zones

Repo-side recovery artifacts:

- `_bmad-output/test-artifacts/release-ledger/recoverable-snapshots/<release_id>/snapshot-manifest.json`
- `_bmad-output/test-artifacts/release-ledger/recovery/recovery-<timestamp>.json`
- `_bmad-output/test-artifacts/release-ledger/recovery/recovery-<timestamp>.md`

## Recoverable Snapshot Scope

Each recoverable snapshot must capture the bounded surfaces needed to restore the active public state:

- `platform/fabric/publication/current/`
- `apps/public-site/src/data/publication/current/`

The snapshot may also include release-data context used by the current public routes:

- `apps/public-site/src/data/release/current-change-summary.json`
- `apps/public-site/src/data/release/current-operational-status.json`

## Recovery Rules

- The default restore target is the `last-known-good` approved release.
- Recovery must restore a previously approved state rather than improvising a new replacement.
- Recovery must preserve traceability to both:
  - the failed or replaced current release
  - the restored release
- Recovery must re-establish the current release pointers and governed release communications for the restored state.
- Recovery must fail closed when the restore target does not have a recoverable snapshot manifest.

## Minimum Recovery Report Fields

Each recovery report must include:

- `recovery_id`
- `recorded_at_utc`
- `failed_release_id`
- `restored_release_id`
- `restore_reason`
- `restore_mode`
- `restored_snapshot_manifest_reference`
- `restored_publication_dir`
- `restored_public_mirror_dir`
- `updated_current_release_id`
- `last_known_good_release_id`

## Deliberate Boundaries

This contract does not require:

- automated Fabric item re-deployment
- automatic semantic-model re-materialization
- automatic report-shell re-patching

The bounded rollback for this story restores the governed repo-side public state and the public-site mirrors first. Fabric runtime artifacts remain traceable through the release ledger and can be re-aligned as a follow-on operational step if needed.
