# Implementation Brief: Story 7.4: Integrate Fabric Runtime Execution with Release Traceability and Recovery Inputs

## What This Story Is
Epic `6` release records to incorporate Fabric runtime identity and control-plane evidence so that later change summaries and recovery steps describe the real operational path rather than only a transitional local refresh path.

## Current Delivery State
- Story state: Done
- Overall project progress: 34/34 stories done

## Explicit Project Detail
- Story purpose: Epic `6` release records to incorporate Fabric runtime identity and control-plane evidence so that later change summaries and recovery steps describe the real operational path rather than only a transitional local refresh path.
- Acceptance target: Given the corrected Fabric-native execution and orchestration layers exist, when release traceability is extended, then release records can reference the repo input package, Fabric pipeline run, notebook execution, runtime-control state, and Fabric serving-output identity.
- Acceptance target: The current and last-known-good release identities can be reconciled between repo-side records and Fabric-side control tables.
- Acceptance target: The release record can state which public source is currently active during the transition.
- Completed task: Extend the release-identity contract and implementation target with serving-output evidence. (AC: 1, 3, 4)
- Completed task: Add the repo input package identity, Fabric serving identity, and public-source-state fields.
- Completed task: Keep fail-closed behavior when the serving-side runtime artifacts are missing or incomplete.
- Completed task: Extend reconciliation between repo-side release pointers and Fabric-side control tables. (AC: 1, 2, 3, 4)
