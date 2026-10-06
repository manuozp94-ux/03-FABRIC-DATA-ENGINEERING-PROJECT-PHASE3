# Architecture Teach-Back Playbook

Date: 2026-04-02  
Purpose: help you practice explaining the architecture in your own words so the project does not feel like something only the assistant understands

## How to use this document

After any meaningful architecture change:

1. Read the short prompt.
2. Try to explain it out loud without looking.
3. Compare your version to the reference answer.
4. If you still feel fuzzy, return to the digest docs before continuing implementation.

## Prompt 1: What does the repo do?

Reference answer:

The repo is the governance plane.
It creates the seed archetypes, generation controls, representative package, approval gates, and release records.
Today it also still creates the large fact-row population.

## Prompt 2: What does Fabric do?

Reference answer:

Fabric is the execution plane.
It lands Bronze, derives Silver and Gold, records runtime status, and hosts the semantic model and report shell.

## Prompt 3: Where are the rows generated today?

Reference answer:

The main fact rows are still generated in the repo, especially in the representative market build.
Fabric currently materializes and refines those rows rather than generating the base population from scratch.

## Prompt 4: Why are we correcting the architecture?

Reference answer:

Because the current path still makes the repo-approved package look too much like the final public truth and makes Bronze too clean.
We want a more faithful medallion story where Bronze is raw-like, Silver cleans and conforms, Gold serves, and public truth comes from downstream Fabric outputs.

## Prompt 5: What is transitional right now?

Reference answer:

The site still reads a repo mirror.
That works, but it is transitional.
The target state is for the site to read a bounded Fabric-derived serving extract later.

## Prompt 6: What is the safest one-paragraph explanation of the project?

Reference answer:

This is a governed public-safe analytics case built in two planes. The repo governs seed creation, representative expansion, approval, and release state. Fabric executes the medallion proof, runtime governance, and downstream BI proof surfaces. The current implementation still mirrors the approved repo package into the site, but the active architectural correction is moving the long-term public source downstream into Fabric-serving outputs.

## Red-flag phrases to avoid

Try not to say these unless they are explicitly qualified:

- “the repo package is the public truth”
- “Bronze is already clean”
- “Silver is just enrichment”
- “Fabric already does everything”

Safer replacements:

- “during transition”
- “currently implemented”
- “target state”
- “bounded proof”
- “active correction”

## Minimum confidence test

You are ready to keep implementing if you can answer these from memory:

1. What is the difference between the repo governance plane and the Fabric execution plane?
2. Why is Bronze being reinterpreted?
3. Why should public truth move downstream into Fabric?
4. What still remains transitional today?
