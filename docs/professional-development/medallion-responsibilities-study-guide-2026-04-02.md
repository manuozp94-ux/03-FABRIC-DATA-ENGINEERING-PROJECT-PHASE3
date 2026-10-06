# Medallion Responsibilities Study Guide

Date: 2026-04-02  
Purpose: explain what each layer should do in this project, what it does now, and what we still need to tighten

## Why this matters

A medallion architecture becomes confusing when the layer names exist, but the responsibilities are blurry.

This guide is here to keep one thing clear:

- Bronze, Silver, and Gold are not just storage zones
- each one should have a distinct job

## Bronze

### What Bronze should mean in this project

Bronze should be the first landed version of the approved input inside Fabric.

Target responsibilities:

- preserve bounded raw-like signals
- keep the input close to what arrives from the approved repo package
- avoid hiding all cleanup before Fabric

Examples of bounded raw-like traces we intend Bronze to carry:

- naming drift
- missing fields
- mild duplicates
- limited date or code inconsistency

### What Bronze does today

Today Bronze is still a landed copy of the repo-approved package.

That means it works operationally, but it is still too clean to teach the full Bronze lesson we want.

### Main correction still pending

Bronze needs to become more honestly raw-like while staying public-safe.

## Silver

### What Silver should mean in this project

Silver should be the real conformance and cleanup layer inside Fabric.

Target responsibilities:

- normalize values
- clean inconsistent fields
- perform bounded deduplication
- align schemas
- enrich with reference context
- create analytically usable, conformed records

### What Silver does today

Today Silver already enriches and interprets records in Fabric.

That is good, but the project still needs to push more of the explicit cleanup burden into Silver so the responsibility is clearer.

### Main correction still pending

Silver needs to become the obvious place where Bronze problems get cleaned up.

## Gold

### What Gold should mean in this project

Gold should be the serving layer.

Target responsibilities:

- KPI-ready tables
- support tables
- action queues
- grouped demand and inventory outputs
- future public serving extract source

### What Gold does today

Gold already behaves mostly like a serving layer.

This is the healthiest part of the medallion meaning right now.

### Main correction still pending

Gold should stay downstream and not quietly absorb cleanup responsibilities that belong in Silver.

## Repo versus Fabric responsibilities

### Repo

The repo should own:

- safe fixtures
- seed archetypes
- rule generation
- representative expansion
- approval gates
- release governance

### Fabric

Fabric should own:

- Bronze landing
- Silver cleanup and conformance
- Gold serving
- runtime governance
- semantic model
- report shell
- future public serving extract

## The key test

If you ask “where should this problem be solved?”:

- if it is about approval, safety, or what may enter the system, it probably belongs in the repo
- if it is about conformance and analytical refinement after landing, it probably belongs in Fabric

## Short self-check

If you can answer these quickly, you understand the medallion responsibilities:

1. Why is Bronze not the final truth?
2. Why should Silver own cleanup instead of Gold?
3. Why is Gold a better source for a future public extract than repo `current`?

If those answers still feel fuzzy, read:

- [architecture-digest-fabric-first-medallion-2026-04-02.md](/Users/manuel.orozco/Desktop/CODEX%20PROJECTS/03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3/docs/professional-development/architecture-digest-fabric-first-medallion-2026-04-02.md)
- [current-data-pipeline-description.md](/Users/manuel.orozco/Desktop/CODEX%20PROJECTS/03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3/docs/automation/current-data-pipeline-description.md)
