# Public Evidence Boundary Policy

Status: Active policy
Last updated: 2026-03-30

## Purpose

This policy defines which technical-evidence and code-adjacent assets may appear:

- on the public site
- in repo-visible public-proof materials
- in repo-visible public-safe operational materials

It also defines what remains private-only and must stay outside public publication.

## Policy Classes

### 1. Public-proof

Definition:

- Assets that may be surfaced directly on the public site or packaged as bounded public proof.

Typical examples:

- approved public data package references
- public route sections tied to approved data
- bounded schema or manifest references
- technical evidence that is intentionally part of the public case

Rule:

- Public-proof assets may appear on the public surface when they are tied to approved data and do not expose private operating detail.

### 2. Public-safe operational

Definition:

- Assets that may remain repo-visible and may be cited for governance context, but are not the public product itself.

Typical examples:

- validation baseline documents
- publication validation flow documents
- candidate refresh reports
- notebook-based inspection tools
- bounded operational notes that explain governance behavior

Rule:

- Public-safe operational assets may be referenced publicly when they support trust, governance, or repeatability without exposing private delivery leverage.

### 3. Private-only

Definition:

- Assets that must stay outside the public site and outside any repo-visible public package.

Typical examples:

- private-preparation materials
- client-delivery playbooks
- sensitive mappings
- reconstruction helpers
- internal-only heuristics
- reusable delivery leverage not required for public proof

Rule:

- Private-only assets are excluded from public publication even if they would improve completeness, because the public product is bounded on purpose.

## Exposure Rules

Before an asset is exposed on the public surface or kept in a repo-visible public package, it must be classified as one of the three policy classes above.

Allowed outcomes:

- `Public-proof`: may be surfaced directly
- `Public-safe operational`: may remain repo-visible and may be referenced when needed
- `Private-only`: excluded from public publication

## Explicit Exclusions

The following classes remain excluded from public publication:

- reusable internal playbooks
- client-delivery assets
- sensitive mappings
- private-preparation materials
- internal-only heuristics

## Why This Policy Exists

The project should prove rigor without exposing the full internal operating system behind the work.

This policy keeps the public story credible while preserving a real boundary between:

- public proof
- operational context
- private delivery leverage
