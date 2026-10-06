# Pre-Epic 6 Freeze Line

Date: 2026-04-01
Status: active working constraint

## Purpose

Lock the short gate before Epic 6 so the project enters release operations with more clarity, not more analytical sprawl.

## Active Constraints

The following rules are active until Epic 6 establishes release identity, change summaries, and rollback discipline:

1. No new public fact tables unless Epic 6 exposes a genuine release-operations gap.
2. No semantic-model expansion before Epic 6 is complete.
3. No Power BI Desktop polish detour before release identity, change summaries, and rollback are in place.
4. No live Fabric artifact renames during this gate.

## Allowed Work In This Gate

- message architecture and bounded copy refinement
- alias-based naming clarification in docs and public explanation layers
- small visual synthesis assets that compress understanding
- release-readiness clarification that supports Epic 6 entry

## Explicitly Out Of Scope

- new analytics scope
- new public routes
- deeper Fabric feature expansion
- a broader reporting surface
- renaming live Lakehouse, semantic model, report, or notebook artifacts

## References

- `product-owner-balance-review-2026-04-01.md`
- `pre-epic-6-product-owner-review-2026-04-01.md`
