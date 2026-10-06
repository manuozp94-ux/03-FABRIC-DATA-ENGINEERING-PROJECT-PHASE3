# Implementation Brief: Story 1.5: Block Unsafe Publication Candidates with Diagnostics

## What This Story Is
Fail-closed validation and investigation outputs before publication so that unsafe or incoherent analytical packages never reach the public surface.

## Current Delivery State
- Story state: Done
- Overall project progress: 34/34 stories done

## Explicit Project Detail
- Story purpose: Fail-closed validation and investigation outputs before publication so that unsafe or incoherent analytical packages never reach the public surface.
- Acceptance target: Given a candidate publication package, when publication-safety and contract validation run, then masking, required fields, grain, key stability, compatibility, and coherence checks execute before promotion.
- Acceptance target: Any failed check blocks the candidate from becoming the active public package.
- Acceptance target: Diagnostic outputs record the failed rule identifier, affected artifact, and blocking reason needed for investigation.
- Delivered evidence: Candidate validation now produces structured diagnostics instead of plain string-only failures.
- Delivered evidence: Candidate refresh remains explicitly non-promoting and now records `candidate_status`, blocking counts, diagnostic details, and preserved approved baselines.
- Delivered evidence: Focused tests now verify both the success path and a blocked failure path while preserving the approved current package and the approved web mirror.
- Delivered evidence: The validator remains compatible with existing sync and validation consumers because it still returns a string error list alongside the structured diagnostics.
