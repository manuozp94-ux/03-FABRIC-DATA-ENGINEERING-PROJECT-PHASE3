# Sprint Change Proposal

Date: 2026-04-01
Change Type: Scope correction between Epic 6 and the next active implementation phase
Status: Approved for planning alignment

## Issue Summary

Epic `5` and Story `6.1` successfully left behind:

- coherence-approved representative package generation
- stabilized Fabric proof refresh
- machine-readable release identity and last-known-good pointers

That work also exposed a new problem:

The project demonstrates strong design-time governance and bounded proof landing in Fabric, but it still under-demonstrates:

- platform-native data handling inside Fabric
- enterprise-like orchestration
- runtime governance inside the platform

If Stories `6.2` and `6.3` continue immediately, release operations would harden against a transitional bundle-first runtime shape that the project now intends to correct.

## Recommended Correction

Pause Epic `6` after completed Story `6.1`.

Insert a new Epic `7` before Stories `6.2` and `6.3`:

1. `6.1` Record release identity and traceability
2. `Epic 7` Execute the bounded proof natively in Fabric with enterprise-like orchestration
3. `6.2` Publish change summaries and operational status
4. `6.3` Recover safely from a problematic release

## Why This Correction Is Needed

Without it, the project risks:

- publishing change summaries for a runtime architecture that is about to change
- defining rollback and last-known-good behavior against a less representative operational path
- continuing to describe Silver and Gold as effectively precomputed bundle artifacts instead of as platform-native execution targets
- leaving the site and the proof path split between the old tiny `current` package and the newer representative package

## What Did Not Fail

- Story `6.1` did not fail.
- The representative coherence gate did not fail.
- The Fabric proof path did not fail.
- The release ledger did not fail.

The gap is architectural emphasis:

- repo-side governance is already strong
- Fabric-native execution and orchestration are not yet strong enough for the next release-operations stories

## Roadmap Impact

### Story sequencing

Keep:

- `6.1` complete

Add:

- `Epic 7` Fabric-native enterprise correction

Delay until after Epic `7`:

- `6.2` Publish change summaries and operational status
- `6.3` Recover safely from a problematic release

### Tracking effect

- `epic-6` remains `in-progress` because the tracking model has no `paused` state
- `6.2` and `6.3` remain in `backlog`
- `epic-7` becomes the active implementation focus
- `7.1` is created immediately as `ready-for-dev`

## Success Criteria

The correction is successful if:

- the representative approved package becomes the canonical `current` package target
- the roadmap explicitly shows Epic `6` paused after `6.1`
- Epic `7` exists with decision-complete stories for Fabric-native execution and orchestration
- the main guidance docs stop presenting the current bundle-first path as the intended long-term runtime target
- release operations resume only after the Fabric-native correction closes

## Canonical Design References

- `05-compat/contracts/fab001_fabric_build_runbook.md`
- `docs/automation/logic-first-fabric-proof-workflow.md`
- `_bmad-output/planning-artifacts/pre-epic-6-freeze-line-2026-04-01.md`
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-04-01-representative-entity-expansion.md`
