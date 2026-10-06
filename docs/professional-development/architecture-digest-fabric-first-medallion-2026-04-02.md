# Architecture Digest: Fabric-First Medallion

Date: 2026-04-02  
Purpose: make the current project architecture explainable in a short human way before the repo gets any more complex

## Why this document exists

The project now has enough moving parts that it can start to feel harder to explain than it is to build.

This digest is the shortest stable explanation of the architecture.
Use it when you need to remember:

- what runs in repo
- what runs in Fabric
- what is true today
- what we are actively correcting

## One-minute version

This project is a governed, public-safe analytics case built in two planes.

- The repo is the governance plane.
- Fabric is the execution plane.

Today, the repo still generates the approved input package and the site still reads a mirrored copy of that package.

But the intended architecture is stronger:

- the repo should approve a bounded raw-like Bronze input
- Fabric should land Bronze, clean and conform in Silver, and serve from Gold
- the future public source should come from a bounded Fabric-derived serving extract

## What the repo does

The repo currently owns:

- safe source fixtures
- seed archetype build
- generation controls
- representative market generation
- coherence gate
- approved package promotion
- release ledger

The repo is still the place where most fact rows are generated today.

That is important:

- Fabric is not yet generating the main fact population from scratch
- Fabric is currently materializing and refining it

## What Fabric does

Fabric currently owns:

- Bronze landing into the Lakehouse
- Silver derivation in the notebook
- Gold serving derivation in the notebook
- runtime-governance tables
- semantic model
- report shell

So the project already proves data handling inside Fabric, but not yet the final target shape of a more realistic Bronze-to-Silver cleanup story.

## What is true now

Right now:

- `platform/fabric/publication/current` is still the approved repo package
- that package still feeds the Astro mirror
- the site still reads the mirrored repo package
- Fabric already lands Bronze and derives Silver and Gold

This means the architecture is working, but still transitional.

## What is being corrected now

The active correction is about meaning, not about throwing away the current work.

We are tightening these ideas:

- repo `current` should be treated as the approved Bronze input package, not as the long-term final public truth
- Bronze should preserve bounded raw-like traces
- Silver should own cleanup and conformance
- Gold should stay downstream as serving
- the public/site truth should eventually come from a Fabric-derived serving extract

## The mental model to keep

Use this sentence:

> The repo decides what may enter the system, and Fabric decides how that approved input is refined into analytical serving outputs.

That sentence is currently the safest high-level description of the project.

## Best companion references

- [current-data-pipeline-description.md](/Users/manuel.orozco/Desktop/CODEX%20PROJECTS/03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3/docs/automation/current-data-pipeline-description.md)
- [fabric-first-medallion-vocabulary.md](/Users/manuel.orozco/Desktop/CODEX%20PROJECTS/03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3/docs/automation/fabric-first-medallion-vocabulary.md)
- [current-vs-target-state-study-guide-2026-04-02.md](/Users/manuel.orozco/Desktop/CODEX%20PROJECTS/03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3/docs/professional-development/current-vs-target-state-study-guide-2026-04-02.md)
