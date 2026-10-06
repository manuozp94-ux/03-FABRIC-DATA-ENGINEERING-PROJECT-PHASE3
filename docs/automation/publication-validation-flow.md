# Publication Validation Flow

Status: active validation reference
Last updated: 2026-04-15

## Purpose

This document locks the governed validation sequence now that the active public source has moved to the bounded Fabric serving extract.

It makes one important distinction explicit:

- validation of the repo-approved package still matters
- but that package is now treated as the approved Bronze input package, not as the active public truth shown by the site

## Core Contract

The governed publication boundary currently has five relevant lanes:

- approved Bronze input package: `platform/fabric/publication/current/`
- candidate package: `_bmad-output/test-artifacts/fabric-candidate/current/`
- active serving-extract mirror: `apps/public-site/src/data/public-serving/current/`
- legacy publication mirror: `apps/public-site/src/data/publication/current/`
- dashboard and operating-loop contracts: `docs/automation/dashboard-view-contracts.md`, `docs/automation/operating-loop-architecture.md`, `05-compat/contracts/fab001_core_visual_contract.md`, and `platform/fabric/contracts/`

Validation must happen before any approved sync or promotion step.

## Local Flow

Use this sequence during normal development:

1. `corepack pnpm run test:fabric-dimensions`
2. `corepack pnpm run validate:fabric-representative-market`
3. `corepack pnpm run materialize:public-site-state`
4. `corepack pnpm run build:public-site`
5. `corepack pnpm run check:public-site`

Intent:

- step 1 verifies the seed build, contract checks, and candidate-lane diagnostics
- step 2 validates the approved representative package that now acts as the current Bronze-input baseline
- step 3 rematerializes the serving extract, runtime governance preview, release identity, release communications, and recovery snapshot in one governed pass
- steps 4 and 5 confirm the Astro consumer remains healthy against the active serving extract

## Preview Flow

Use this sequence before a preview or handoff review:

1. `corepack pnpm run candidate:fabric-refresh`
2. inspect `_bmad-output/test-artifacts/fabric-candidate/candidate-refresh-report.json`
3. `corepack pnpm run test:fabric-dimensions`
4. `corepack pnpm run materialize:public-site-state`
5. `corepack pnpm run build:public-site`
6. `corepack pnpm run check:public-site`

Preview intent:

- candidate diagnostics still prove the bounded refresh lane behaves fail-closed
- the repo-approved Bronze input package remains the only promotable repo baseline for the downstream Fabric serving path

## Current Interpretation

- repo `current` is now the approved Bronze input package
- the site consumes the bounded Fabric-derived serving extract mirrored into the repo
- the legacy publication mirror remains available only as a fallback boundary and historical aid
- the dashboard should read governed Gold and semantic-model outputs, not hand-authored business logic inside Power BI
- operating-loop facts must validate queue-to-execution traceability before they can feed public dashboard outputs

## Operating-Loop Validation

The operating-loop tables are now materialized as bounded V1. Current and next
validation work should check:

- every recommendation resolves to public-safe product, account, location, supplier, or service-region dimensions
- approved recommendations either produce an execution fact or remain explicitly unexecuted
- purchase-order receipt dates respect supplier-product lead-time rules
- transfer arrival dates respect location-transfer lead-time rules
- sales fulfillment dates respect location-service lead-time rules
- inventory snapshots reconcile from prior state plus receipts, transfers, and fulfillment
- cost-effective V1 joins resolve without being described as finance-grade valuation

Current known boundary:

- the event ledger explains decisions and execution facts beside the current snapshots
- strict inventory snapshot reconstruction from event ledger is a V2 target-state gap
- the semantic model is partially patched until missing Lakehouse-backed facts are synced into the model

Accepted V2 direction:

- strict inventory snapshot reconstruction is a target-state gap, not a public-launch blocker for the interview-ready milestone
- dashboard publication uses safe screenshots plus request-access
- public repo release uses the three existing phase-specific repositories, with this Phase 3 repo prepared first

## CI Baseline

Future CI should continue following this minimum order:

1. `corepack pnpm run test:fabric-dimensions`
2. `corepack pnpm run validate:fabric-representative-market`
3. `corepack pnpm run build:public-site`
4. `corepack pnpm run check:public-site`

CI should not auto-promote candidate outputs or run release steps in Phase 1.

## Blocking Rules

- A failed candidate build or validation produces a blocked candidate report.
- A failed validation step blocks any future promotion or sync workflow.
- The last approved repo package and current serving extract remain active when validation fails.
- The legacy publication mirror must not be re-described as the active public truth.

## References

- `docs/automation/fabric-first-medallion-vocabulary.md`
- `docs/automation/operating-loop-architecture.md`
- `docs/automation/dashboard-view-contracts.md`
- `05-compat/contracts/fab001_semantic_model_sync_status.md`
- `_bmad-output/planning-artifacts/oversight-map-v2-2026-04-15.md`
- `_bmad-output/planning-artifacts/scope-decisions-v2-2026-04-15.md`
- `platform/fabric/contracts/current-package-sync-contract.md`
- `platform/fabric/contracts/candidate-validation-contract.md`
- `platform/fabric/contracts/publication-manifest.schema.json`
