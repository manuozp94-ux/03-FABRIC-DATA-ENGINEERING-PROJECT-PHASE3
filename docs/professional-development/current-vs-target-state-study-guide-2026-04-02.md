# Current vs Target State Study Guide

Date: 2026-04-02  
Purpose: stop mixing up what is already implemented with what the architecture is actively trying to become

## Why this document exists

One of the easiest ways to get lost in this project is to confuse:

- current implemented state
- target intended architecture

This guide separates them explicitly.

## Current implemented state

Today the project already has:

- repo-side seed creation
- repo-side representative market generation
- repo-side coherence gate
- repo-side approved package promotion
- repo-side mirror into the site
- Fabric Bronze landing
- Fabric Silver derivation
- Fabric Gold derivation
- Fabric runtime-governance tables
- semantic model and report shell

That means the project is already real and already technically meaningful.

## Target intended architecture

The active correction wants to shift the meaning of the layers:

- repo `current` becomes the approved Bronze input package, not the final public truth
- Bronze becomes a bounded raw-like landed layer
- Silver becomes the explicit cleanup and conformance layer
- Gold remains the serving layer
- the site eventually reads a bounded Fabric-derived serving extract instead of a direct repo mirror

## What is transitional right now

These are currently live but not intended steady-state design choices:

- the site reading directly from the repo mirror
- Bronze being interpreted as if it were already the final clean public layer
- Silver carrying enrichment but not yet being the fully explicit cleanup layer

## What is already solid

These ideas are not temporary:

- repo-side governance and approval
- coherence gate before promotion
- Fabric notebook execution
- runtime governance inside Fabric
- semantic model and report shell as downstream proof surfaces

## What must not be confused

Do not say:

- “the repo package is the public truth”
- “Bronze is already fully governed and final”
- “Silver is just extra enrichment”

Safer current phrasing:

- “the repo package is the approved input during transition”
- “Bronze currently lands the approved input”
- “Silver already refines records in Fabric and is being tightened into the true conformance layer”
- “Gold is the serving layer and future source of the public extract”

## Best interview-safe explanation

Use this:

> Today the repo still generates and approves the bounded input package, and the site still reads a transitional mirror of that package. Fabric already executes Bronze, Silver, Gold, runtime governance, and the proof surface. The active correction is making Bronze more honestly raw-like, Silver more clearly the cleanup layer, and Gold the future source of the public extract.

## What to watch as the project evolves

When a story closes, ask:

1. Did this change current state, target state, or both?
2. Did we just improve implementation, or did we also change the meaning of a layer?
3. Would I explain this as “already true” or “direction now active”?

If you can answer those 3 questions, the architecture will stay much more understandable.
