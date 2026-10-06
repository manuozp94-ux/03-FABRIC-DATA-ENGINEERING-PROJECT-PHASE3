# Sprint Change Proposal

Date: 2026-04-01
Change Type: Scope correction inside Epic 5
Status: Approved for planning alignment

## Issue Summary

Epic `5` successfully delivered deterministic rule governance, internal controls, logic-grown candidate refresh, and fail-closed validation.

That work exposed a new problem:

The current approved package is structurally correct but population-poor.

The project is currently proving logic on a tiny seed market:

- `4` masked accounts
- `5` masked products
- `7` masked inventory locations
- `5` active account-product relationships

This is enough for smoke-proofing the logic-first workflow.
It is not enough for believable exploration, representative Power BI proofing, or stable narrative about a bounded operating market.

## Recommended Correction

Insert one explicit entity-expansion step before deeper realism review.

The next priority inside Epic `5` should be:

1. deterministic rules and controls
2. initial controlled candidate refresh
3. representative masked entity expansion
4. realism and coherence review on the expanded market
5. Fabric proof refresh from the stabilized and expanded serving logic

## Why This Correction Is Needed

Without it, the project risks:

- over-optimizing realism checks for a population that is too small to matter
- building Power BI proof surfaces on top of entity diversity that feels obviously artificial
- mistaking time-series row count for business variety
- defending the masking layer for a problem that is really a population-design gap

## What Did Not Fail

- The masking design did not fail.
- The candidate lane did not fail.
- The logic-first workflow did not fail.

The gap is that the bounded source slice was treated as the final entity universe instead of as the seed archetype universe.

## Roadmap Impact

### Story sequencing

Add a new story inside Epic `5`:

- `5.3` Expand the masked entity population to a representative bounded market

Keep the existing story sequence after that:

- `5.4` Validate realism, invariants, and cross-table coherence before promotion
- `5.5` Refresh the Fabric proof stack from stabilized serving logic

### Scope effect

This is not a new epic.
It is a correction inside the current logic-first operationalization path.

## Success Criteria

The correction is successful if:

- the next story explicitly targets representative population size rather than only more fact rows
- the publication explorer can show a small market instead of a tiny smoke slice
- the expanded package still stays deterministic, public-safe, and bounded
- realism review starts only after that representative base exists

## Canonical Design Reference

- `platform/fabric/contracts/representative-entity-expansion-design.md`
