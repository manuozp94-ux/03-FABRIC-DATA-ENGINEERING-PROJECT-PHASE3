# Fabric Proof Naming Audit

Date: 2026-04-01
Status: advisory

## Purpose

Review whether current Fabric and proof-surface nomenclature helps or hurts architectural clarity, public explanation, and future maintainability.

## Current Naming Snapshot

Observed names in the current proof path include:

- Lakehouse: `lh_fab001_public_proof`
- Semantic model: `sm_fab001_supply_chain_decision`
- Report: `rpt_fab001_supply_chain_decision`
- Loader notebook: `nb_fab001_lakehouse_loader`
- Bundle root: `Files/fab001/current`
- Proof family identifier: `fab001`
- Public page name: `Supply Chain Decision View`
- Workspace-facing string observed in report artifacts: `fabric-portfolio-proof-dev`

## Overall Judgment

The current names are technically consistent and workable.
The problem is not chaos.
The problem is mixed naming intent.

Different parts of the naming scheme are optimizing for different things:

- scriptability and deterministic prefixes
- architectural clarity
- human readability
- public explanation

That creates mild friction, especially when trying to explain the architecture succinctly.

## What Is Working

### 1. `fab001` as a proof family identifier

This is useful internally.
It gives the proof path a stable short id across scripts, folders, and contracts.

Judgment:

- keep as internal identifier

### 2. Prefixes like `lh_`, `sm_`, `rpt_`, `nb_`

These are technically clean and predictable.

Judgment:

- keep for internal/live item naming unless there is a strong platform standard pushing elsewhere

### 3. `Supply Chain Decision View`

This is the strongest human-facing name in the current stack.

Judgment:

- keep or evolve from this, not away from it

## What Feels Weak or Mixed

### 1. `public_proof`

This is accurate, but slightly awkward.
It sounds like a safety label more than a product-surface name.

Issue:

- good for internal honesty
- less good for crisp explanation to reviewers

### 2. `supply_chain_decision`

This is directionally right, but a bit generic.
It describes the domain better than the actual decision or proof role.

Issue:

- stable enough technically
- not especially distinctive

### 3. Mixed level of abstraction

Some names are operational and internal:

- `fab001`
- `lh_fab001_public_proof`
- `nb_fab001_lakehouse_loader`

Some are fairly human-facing:

- `Supply Chain Decision View`

Some are semi-public but still technical:

- `sm_fab001_supply_chain_decision`

Issue:

- the stack has not yet decided when it is naming for machines, when for maintainers, and when for public explanation

## Recommendation: Use a Two-Layer Naming Strategy

### Layer 1: Stable technical names

Keep these for actual Fabric items and scripts unless a rename is operationally cheap:

- `lh_fab001_public_proof`
- `sm_fab001_supply_chain_decision`
- `rpt_fab001_supply_chain_decision`
- `nb_fab001_lakehouse_loader`
- `fab001`

Reason:

- they are already wired through contracts, manifests, scripts, and fetched artifacts
- renaming now would likely create more churn than value

### Layer 2: Public or architectural aliases

Use cleaner descriptive aliases in docs, diagrams, and interviews:

- Fabric Proof Workspace
- Public Proof Lakehouse
- Supply Chain Decision Semantic Model
- Supply Chain Decision Proof Report
- Loader Notebook

Reason:

- this gives architectural clarity without destabilizing the live technical path

## Rename Guidance

### Safe to leave as-is

- `fab001`
- item-type prefixes
- notebook loader name
- bundle root under `Files/fab001/current`

### Good candidates for aliasing rather than renaming

- workspace name in narrative materials
- Lakehouse name in diagrams
- semantic model name in public-facing explanations
- report name in public-facing explanations

### Rename only if there is a compelling future refactor

- anything already embedded in fetched PBIR/TMDL artifacts
- anything that would require broad script, report, and contract churn

## Naming Principles for Future Items

If Epic 6 or later adds more proof artifacts, prefer:

- stable short internal ids for scripts and file-system contracts
- descriptive human aliases in diagrams and docs
- avoiding names that mix safety labels, proof labels, and domain labels in one long string unless the context truly requires it

## Bottom-Line Recommendation

Do not launch a rename campaign right now.

The better move is:

1. keep live technical names stable
2. introduce a cleaner alias layer in docs, diagrams, and interview framing
3. only rename real Fabric artifacts if future release operations make that change low-risk and high-value
