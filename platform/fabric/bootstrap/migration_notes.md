# Migration Notes

Status: active note
Last updated: 2026-03-30

## Why this exists

Phase 3 did not initially retain the Fabric bootstrap package that existed in earlier project phases.
Story 4.6 needs a real bounded proof path, so the public-safe bootstrap contract was reintroduced here in a smaller form.

## Reused ideas

The following ideas were carried forward from previous project phases:

- placeholder-only environment contract
- validation-only bootstrap helper
- service-principal runtime token minting as the canonical control-plane path
- explicit separation between public-safe bootstrap notes and live deployment helpers

## What was intentionally not copied forward

- live deployment scripts
- environment-bound SQL apply packs
- report-definition payloads
- private or broader workspace internals

## Current implication

Phase 3 now has enough bootstrap documentation to:

- validate access
- describe the control-plane pattern honestly
- prepare the first real Fabric proof artifact

It still does not claim that full Fabric deployment automation is complete inside this repo.
