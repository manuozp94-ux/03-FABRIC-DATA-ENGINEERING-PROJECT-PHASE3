# Implementation Brief: Story 1.4: Support Safe Incremental Updates and Current-Package Sync

## What This Story Is
Approved scenario-driven updates appended through the same governed package flow so that the public analytical case can evolve over time without semantic drift.

## Current Delivery State
- Story state: Done
- Overall project progress: 34/34 stories done

## Explicit Project Detail
- Story purpose: Approved scenario-driven updates appended through the same governed package flow so that the public analytical case can evolve over time without semantic drift.
- Acceptance target: Given an existing approved MVP package, when new approved rows or snapshot periods are introduced, then append or snapshot behavior preserves grain, stable keys, masking rules, and cross-table consistency.
- Acceptance target: Updates that introduce schema drift, incompatible masking, or broken entity relationships are rejected.
- Acceptance target: The current approved publication package can be synchronized to the public-site consumption area through the defined boundary.
- Delivered evidence: The approved current package can now be mirrored into `apps/public-site/src/data/publication/current/` through a dedicated fail-closed sync command.
- Delivered evidence: The sync boundary is documented and allowlisted so candidate artifacts, reports, logs, and unmanaged files do not cross into the Astro consumption copy.
- Delivered evidence: Sync verification now covers the happy path and a fail-closed path where unexpected artifacts leave the destination mirror unchanged.
- Delivered evidence: Story 1.3 rolling public sales output remains compatible with the current-package sync flow.
