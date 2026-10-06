# Sprint Change Proposal: Tighten Epic 7 Around Raw-Like Bronze Input and Fabric-Derived Public Truth

Status: approved working correction
Date: 2026-04-02

## Why this correction is happening now

The project already demonstrates:

- repo-side seed creation and approval governance
- representative market expansion
- coherence gating
- Fabric notebook execution
- Fabric runtime governance

But the current living narrative still leaves one misleading impression:

- the repo-approved `current` package still reads too much like the final public truth
- Bronze still reads too much like a fully governed landing copy rather than a realistic input that still needs conformance work
- Silver still reads too much like enrichment instead of the layer that should own cleanup and normalization

If Epic `7` continues without correcting that meaning, Epic `6` release operations will harden against a transitional public-data shape rather than against the intended steady state.

## What did not fail

This correction does not invalidate the work already completed.

What remains valid:

- the representative package and coherence gate
- the Fabric notebook-first medallion path
- the Fabric pipeline and runtime-governance layer
- the release ledger and runtime reconciliation work

The change is about tightening architectural intent, not discarding the bounded proof.

## New official direction

The project now treats the active transition and the target architecture separately.

### Current implemented state

- the repo still generates the approved package
- the approved repo package still feeds the site mirror during transition
- Fabric already lands Bronze and derives Silver and Gold

### Target intended state

- the repo remains the place for safe seed creation, controlled realism inputs, and approval gates
- the approved repo package becomes the raw-like Bronze input package, not the final public truth
- Fabric Bronze lands that bounded raw-like input
- Fabric Silver performs the true conformance and cleanup work
- Fabric Gold produces the bounded serving layer
- the public/site truth eventually comes from a bounded Fabric-derived serving extract rather than a direct repo mirror

## Roadmap effect

- Epic `7` remains the active correction epic.
- Stories `7.2`, `7.3`, and `7.4` are reopened so their acceptance criteria match the stronger Fabric-first medallion direction.
- Story `7.5` becomes the living narrative and contract sweep that aligns the repo to this direction.
- Stories `6.2` and `6.3` remain paused until the corrected Epic `7` path is in place.

## Success condition

The correction is considered successful when:

- living docs stop describing repo `current` as the long-term public truth
- Bronze is described as a bounded raw-like input, not as an already-clean final package
- Silver is described as the primary cleanup and conformance layer
- Gold is described as serving plus the future source of the public extract
- release and runtime contracts acknowledge both repo input identity and Fabric serving identity
