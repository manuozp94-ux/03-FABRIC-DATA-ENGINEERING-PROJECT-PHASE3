# Architecture v2 Delta: Operating-Loop Decision System

Status: draft rebaseline
Date: 2026-04-15
Base architecture: `_bmad-output/planning-artifacts/architecture.md`
Scope decisions: `_bmad-output/planning-artifacts/scope-decisions-v2-2026-04-15.md`

## Purpose

This document defines the architectural delta between the original public-safe
dashboard proof and the current operating-loop decision-support proof.

It does not replace the original architecture. It supersedes it for current build
planning where the project now includes live Fabric execution, operating-loop facts,
Gold dashboard subjects, and a gated Power BI handoff.

## Architecture Spine

```text
Repo governance plane
-> Fabric execution plane
-> Semantic/report handoff
-> Public-site serving mirror
-> Public repo and demo surface
```

## Plane 1: Repo Governance Plane

Responsibilities:

- safe fixtures
- deterministic generation
- representative market expansion
- candidate lane
- validation and coherence gates
- approved Bronze input package
- public-serving extract materialization
- documentation and release evidence

Key paths:

- `platform/fabric/publication/current/`
- `platform/fabric/automation/`
- `platform/fabric/validation/`
- `_bmad-output/test-artifacts/fabric-representative/`
- `_bmad-output/test-artifacts/fabric-public-serving-extract/current/`

Boundary:

- This plane governs what is allowed to enter the bounded proof.
- It is not the final public analytics truth once Fabric Gold exists.

## Plane 2: Fabric Execution Plane

Responsibilities:

- OneLake Bronze file landing
- Fabric notebook execution
- Bronze Delta table materialization
- Silver conformance
- Gold serving outputs
- runtime governance tables
- financial foundation landing

Current live state:

- Lakehouse: `lh_fab001_public_proof`
- Lakehouse table count: `43`
- Bronze tables: `18`
- Silver tables: `4`
- Gold tables: `12`
- financial foundation tables: `5`
- runtime governance tables: `4`

Boundary:

- Fabric executes the bounded proof.
- The proof remains deterministic and public-safe.
- It does not claim full production administration or live enterprise orchestration.

## Plane 3: Semantic And Report Handoff

Responsibilities:

- define model tables
- define relationships
- define DAX measures
- define report pages
- track live semantic sync status
- support Power BI Desktop or Service authoring

Key paths:

- `05-compat/contracts/fab001_semantic_model_contract.json`
- `05-compat/contracts/fab001_measure_pack.dax`
- `05-compat/contracts/fab001_core_visual_contract.md`
- `05-compat/contracts/fab001_desktop_authoring_guide.md`
- `05-compat/contracts/fab001_semantic_model_sync_status.md`

Current live state:

- semantic contract table count: `32`
- measure pack count: `40`
- live patched measures: `15`
- blocked measures: `25`

Current gap:

- several Lakehouse tables exist live but are not yet exposed as semantic model table parts
- full report layout is not yet authored

## Plane 4: Public-Site Serving Mirror

Responsibilities:

- explain business problem
- explain operating loop
- show public-safe Gold-derived summaries
- expose technical method
- provide dashboard screenshots and request-access path
- avoid querying private or live Fabric data at request time

Key paths:

- `apps/public-site/src/data/public-serving/current/`
- `apps/public-site/src/pages/`
- `docs/public-site/project-map.md`
- `docs/public-site/communication-strategy.md`

Current state:

- active public source mode: `fabric_serving_extract`
- site mirror generated at: `2026-04-15T01:44:04.122Z`
- active extract files: `17` plus manifest

## Plane 5: Public Repo And Demo Surface

Responsibilities:

- publish only safe code and docs
- explain phases clearly
- keep generated artifacts curated
- provide reviewer-friendly navigation
- support interview and hiring review

Current gap:

- repo exposure strategy is decided as three existing phase-specific project repositories, not as a split of this Phase 3 repo
- phase boundaries need packaging and README polish
- private-prep and credential exclusion must be audited before publication

Repo target:

- Phase 1 repo: `01-FABRIC-DATA-ENGINEERING-PROJECT-PHASE1`, covering foundation and SQL-to-Fabric parity discipline
- Phase 2 repo: `02-FABRIC-DATA-ENGINEERING-PROJECT-PHASE 2`, covering architecture-first reset and public-safe transformation
- Phase 3 repo: this repo, `03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3`, covering governed operating-loop proof with site, contracts, validation, Fabric Lakehouse handoff, and Power BI request-access story

Priority:

- Prepare Phase 3 first for interview readiness.
- Prepare Phase 1 and Phase 2 after Phase 3 is coherent.

## Current vs Target

### Current

- Lakehouse is current and complete for bounded V1.
- Site mirror is current.
- Semantic model is partially patched.
- Power BI report shell exists but is not yet three-view authored.
- Inventory event ledger explains actions beside snapshots, but does not fully rebuild all snapshots.

### Target

- semantic model exposes all tables required by three dashboard views
- all `40` measures are available in the semantic/report layer
- Power BI has three authored pages
- public site routes explain dashboard screenshots, request-access, and current proof boundaries
- public repo packaging is safe, readable, and prepared across the three existing phase-specific repos
- strict inventory snapshot reconciliation is explicitly labeled as target-state gap

## Architectural Guardrails

- Do not use anonymous Publish to web.
- Do not imply ERP replacement.
- Do not imply optimizer behavior.
- Do not imply real-time operations.
- Do not imply finance-grade valuation.
- Keep Power BI downstream of Gold outputs.
- Keep the public site as the primary explanation surface.
- Keep repo governance and Fabric execution distinct.

## Next Architecture Work

- semantic model table sync plan
- report authoring checklist
- public repo exposure checklist
- inventory reconciliation target-state wording
- public-site demo route and request-access CTA update
