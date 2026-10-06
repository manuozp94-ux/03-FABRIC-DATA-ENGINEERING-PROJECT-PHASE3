# Story 7.5: Reframe the Technical Narrative Around Fabric-Native Execution

Status: done

## Story

As a technical evaluator,
I want the technical-method narrative and proof documentation to explain what is governed outside Fabric versus executed inside Fabric,
so that the project reads as honest, bounded, and platform-native rather than as a bundle-first compatibility proof only.

## Acceptance Criteria

1. Given the roadmap now includes the Fabric-first medallion correction, when technical narrative artifacts are updated, then the living docs separate the current implemented state from the target intended architecture.
2. The repo-approved package is no longer described as the long-term final public truth.
3. Silver is described as the cleanup and conformance layer, Gold as the serving layer, and the Fabric public serving extract as the target public source.
4. The corrected narrative stays bounded and does not overclaim a full enterprise production platform.

## Tasks / Subtasks

- [x] Lock a canonical terminology reference for the new medallion direction. (AC: 1, 2, 3)
  - [x] Define safe fixtures, seed archetype package, approved Bronze input package, Fabric Bronze, Fabric Silver, Fabric Gold, Fabric public serving extract, and runtime governance.

- [x] Align active roadmap and story artifacts. (AC: 1, 2, 3)
  - [x] Update Epic `7` wording and reopen Stories `7.2`, `7.3`, and `7.4`.
  - [x] Keep Epic `6` paused behind the corrected Epic `7` work.

- [x] Sweep the living technical narrative and public-method docs. (AC: 1, 2, 3, 4)
  - [x] Update automation docs, project-map guidance, compatibility README, and Fabric runbook.
  - [x] Update the technical-method route so it states both the implemented state and the target state.

- [x] Reclassify the current sync/publication boundary as transitional. (AC: 2, 3, 4)
  - [x] Update the active contracts and sync entrypoint wording so repo `current` is treated as the approved Bronze input package during transition.

## Dev Notes

- This story intentionally updates only living docs, active contracts, active roadmap/state files, and the active public technical narrative.
- Historical retrospectives, old implementation briefs, and prior artifact exhaust remain intact.
- The goal of this story is directional clarity and scope control, not implementation of the raw-like Bronze behavior itself.

### References

- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-04-02-fabric-public-serving-truth.md`
- `docs/automation/fabric-first-medallion-vocabulary.md`
- `docs/automation/current-data-pipeline-description.md`
- `apps/public-site/src/pages/technical-method.astro`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Completion Notes List

- Living docs now separate the current implemented state from the target intended Fabric-first medallion architecture.
- Epic `7` no longer reads as if the repo-approved package were the steady-state public truth.
- The repo-side `current` package is now described as the approved Bronze input package during transition.
- The public technical narrative now states that the future public source should be a bounded Fabric-derived serving extract.

### Change Log

- 2026-04-02: Created Story `7.5` to complete the bounded narrative and scope sweep for the Fabric-first medallion direction.
