# Story 5.2: Generate Coherent Incremental Fact Growth Through the Approved Package Flow

Status: done

## Story

As a product owner,
I want incremental fact growth generated through documented rule sets and the approved package flow,
so that the analytical case can evolve without breaking grain, masking, or cross-table consistency.

## Acceptance Criteria

1. Given deterministic rule sets are available, when bounded scenario growth is applied to the approved package flow, then new demand and inventory rows preserve stable grain, keys, masking rules, and cross-table consistency.
2. The package refresh remains append- or snapshot-friendly rather than destructively rewriting approved history.
3. The incremental outputs stay aligned to the approved public contracts and fail closed when coherence rules break.
4. The refreshed package can be promoted through the same governed current-package path already used by the MVP.
5. Controlled-realism conditions are translated into explicit generation-time checks so the next regulated refresh does not rely on informal memory.

## Tasks / Subtasks

- [x] Materialize the internal rule and state tables defined by Story 5.1. (AC: 1, 2, 3)
  - [x] Create `rule_account_generation_profile`.
  - [x] Create `rule_product_generation_profile`.
  - [x] Create `rule_account_product_eligibility`.
  - [x] Create `seed_inventory_position`.
  - [x] Create `rule_inventory_inbound`.
  - [x] Create `state_entity_shock`.
  - [x] Create `state_pending_receipt`.

- [x] Build candidate-generation logic for the three governed public facts. (AC: 1, 2, 3, 4)
  - [x] Generate daily `fact_demand_line` rows from approved account-product eligibility and daily control logic.
  - [x] Generate daily `fact_inventory_inbound` rows from replenishment and approval logic rather than raw procurement simulation.
  - [x] Generate end-of-day `fact_inventory_snapshot` rows from prior state, releasable inbound, served demand, and readiness interpretation.

- [x] Encode fail-closed generation gates before candidate promotion. (AC: 1, 3, 5)
  - [x] Reject rows that break arithmetic invariants, key resolution, or vocabulary rules.
  - [x] Reject uncontrolled all-to-all account-product or product-location expansion.
  - [x] Enforce the controlled-realism checks recorded in `platform/fabric/contracts/controlled-realism-test-matrix.md`.

- [x] Route the refreshed outputs through the governed package flow. (AC: 2, 3, 4)
  - [x] Emit regenerated candidate outputs into the existing candidate lane.
  - [x] Keep the approved package untouched until checks pass.
  - [x] Preserve release identity inputs needed by later traceability work.
  - [x] Emit an official fail-closed candidate validation report for the logic-grown refresh lane.

- [x] Leave the implementation handoff ready for the next Epic 5 stories. (AC: 3, 5)
  - [x] Record which checks are enforced directly in Story 5.2.
  - [x] Record that representative entity expansion now sits between Story `5.2` and Story `5.4`.
  - [x] Record which deeper realism reviews stay owned by Story 5.4.

## Dev Notes

- Story 5.1 already closed the operating decisions for generation cadence, eligibility, inbound behavior, snapshot arithmetic, shock limits, and hard invariants.
- Story 5.2 is the first implementation story that turns those decisions into machine-consumable rule tables and generated candidate facts.
- The Bronze naming distinction must remain explicit during implementation:
  - upstream private preparation may preserve controlled realism
  - the Fabric proof Bronze remains a landed copy of the approved public package
- The controlled-realism register is now operational input, not just architectural prose.

### Project Structure Notes

- Canonical rule document: `platform/fabric/contracts/logic-first-scenario-parameter-sets.md`
- Fact baseline rules: `platform/fabric/contracts/fact-build-rules.md`
- Controlled-realism reference: `_bmad-output/planning-artifacts/controlled-realism-register-2026-04-01.md`
- Controlled-realism test matrix: `platform/fabric/contracts/controlled-realism-test-matrix.md`
- Workflow reference: `docs/automation/logic-first-fabric-proof-workflow.md`
- Candidate package lane: `_bmad-output/test-artifacts/fabric-candidate/current/`
- Approved package source: `platform/fabric/publication/current/`

### Technical Requirements

- Rule evaluation remains monthly while fact materialization remains daily.
- The generator may only create demand for approved account-product eligibility rows.
- The generator may only create inbound for approved product-location replenishment rules.
- `fact_inventory_snapshot` must remain derivable from prior state, releasable inbound, served demand, and bounded status interpretation.
- The same rule version, seed inputs, and time window must reproduce the same candidate rows.
- Story 5.2 must not broaden into report redesign, Desktop authoring, or semantic-model rework.

### Controlled-Realism Scope

The first regulated refresh must explicitly cover these controlled-realism conditions:

1. bounded naming drift resolved into canonical public locations
2. late-arriving or partially releasable inbound behavior
3. demand versus service lag
4. incomplete master-data coverage through bounded fallback classes
5. transit and restricted inventory usability
6. source-drift and promotion discipline through fail-closed candidate handling

### Architecture Compliance

- The approved publication package remains the only public-safe contract.
- Internal rule and state tables are implementation controls only; they are not part of the public package.
- Generated candidate outputs must still promote through the same governed current-package path used by the MVP.

### Testing Requirements

- Story 5.2 should implement automated checks for:
  - internal rule-table completeness
  - eligibility-boundary enforcement
  - demand and inbound arithmetic invariants
  - snapshot reconciliation
  - controlled-realism checks marked as `5.2` in `platform/fabric/contracts/controlled-realism-test-matrix.md`
  - rerun reproducibility for the same rule version and time window
- Story 5.3 should expand the entity population into a representative masked mini-market before Story 5.4 starts scoring realism.
- Story 5.4 should deepen threshold-based realism review, jump detection, and promotion blocking beyond the minimum generation gates above.

### References

- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/controlled-realism-register-2026-04-01.md`
- `platform/fabric/contracts/logic-first-scenario-parameter-sets.md`
- `platform/fabric/contracts/fact-build-rules.md`
- `platform/fabric/contracts/controlled-realism-test-matrix.md`
- `docs/automation/logic-first-fabric-proof-workflow.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-04-01: Created the operational Story 5.2 implementation artifact from the approved epic acceptance criteria and the already-closed Story 5.1 generation rules.
- 2026-04-01: Translated the Controlled Realism Register into generation-time test expectations so the next regulated refresh can be enforced systematically.
- 2026-04-01: Materialized the first batch of internal control tables from the approved package and added deterministic validation coverage for those outputs.
- 2026-04-01: Materialized the second batch of internal control and state tables so the candidate lane now carries inbound rules, pending receipts, and seeded shock state.
- 2026-04-01: Added the first controlled candidate-refresh generator that appends new demand, inbound, and snapshot rows from the approved package and internal controls.
- 2026-04-01: Added a dedicated fail-closed validator and official candidate-refresh runner for the logic-grown candidate lane.

### Completion Notes List

- Story 5.2 now has a real implementation artifact in `implementation-artifacts` instead of only a Trello-side brief.
- The story is now explicitly tied to the controlled-realism register and to a dedicated test matrix.
- The scope boundary between Story 5.2 generation gates, Story 5.3 entity expansion, and Story 5.4 deeper realism review is now documented before implementation starts.
- The repo now materializes `rule_account_generation_profile`, `rule_product_generation_profile`, `rule_account_product_eligibility`, and `seed_inventory_position` into the candidate internal-controls lane.
- Validation and deterministic tests now exist for the first internal control batch before demand, inbound, and snapshot regeneration begins.
- The repo now also materializes `rule_inventory_inbound`, `state_entity_shock`, and `state_pending_receipt`, so the full minimum internal control/state layer defined by Story 5.1 exists in executable form.
- The internal control codes now align more closely with the canonical Story 5.1 scenario document instead of using ad hoc first-pass labels.
- The candidate lane now contains a first logic-driven refresh window for `2026-04-02` and `2026-04-03`, generated from the approved package and the internal Story 5.2 controls.
- The logic-grown candidate lane now has a dedicated fail-closed validator that preserves approved history, blocks uncontrolled expansion, enforces controlled-realism gates, and writes the official non-promoting candidate validation report.
- Story 5.2 now enforces append-only preservation, eligibility boundaries, inbound boundaries, snapshot reconciliation, controlled-realism inventory restrictions, and rerun reproducibility for the same rule version and window.
- Story 5.3 is now responsible for widening the entity population into a representative masked mini-market before realism review begins.
- Story 5.4 remains responsible for deeper realism review, threshold-based plausibility scoring, and promotion blocking beyond the minimum `5.2` candidate gates.

### File List

- `_bmad-output/implementation-artifacts/5-2-generate-coherent-incremental-fact-growth-through-the-approved-package-flow.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/test-artifacts/fabric-candidate/internal-controls/current/rule_account_generation_profile.json`
- `_bmad-output/test-artifacts/fabric-candidate/internal-controls/current/rule_product_generation_profile.json`
- `_bmad-output/test-artifacts/fabric-candidate/internal-controls/current/rule_account_product_eligibility.json`
- `_bmad-output/test-artifacts/fabric-candidate/internal-controls/current/seed_inventory_position.json`
- `_bmad-output/test-artifacts/fabric-candidate/internal-controls/current/rule_inventory_inbound.json`
- `_bmad-output/test-artifacts/fabric-candidate/internal-controls/current/state_entity_shock.json`
- `_bmad-output/test-artifacts/fabric-candidate/internal-controls/current/state_pending_receipt.json`
- `_bmad-output/test-artifacts/fabric-candidate/current/fact_demand_line.json`
- `_bmad-output/test-artifacts/fabric-candidate/current/fact_inventory_inbound.json`
- `_bmad-output/test-artifacts/fabric-candidate/current/fact_inventory_snapshot.json`
- `_bmad-output/test-artifacts/fabric-candidate/controlled-candidate-refresh-report.json`
- `platform/fabric/contracts/controlled-realism-test-matrix.md`
- `platform/fabric/contracts/logic-first-scenario-parameter-sets.md`
- `platform/fabric/contracts/fact-build-rules.md`
- `docs/automation/logic-first-fabric-proof-workflow.md`
- `platform/fabric/automation/generation-controls-lib.mjs`
- `platform/fabric/automation/materialize-generation-controls.mjs`
- `platform/fabric/validation/validate-generation-controls.mjs`
- `tests/publication/generation-controls.test.mjs`
- `platform/fabric/automation/controlled-candidate-refresh-lib.mjs`
- `platform/fabric/automation/materialize-controlled-candidate-refresh.mjs`
- `tests/publication/controlled-candidate-refresh.test.mjs`
- `platform/fabric/validation/validate-controlled-candidate-refresh.mjs`
- `platform/fabric/automation/run-controlled-candidate-refresh.mjs`
- `tests/publication/controlled-candidate-validation.test.mjs`

### Change Log

- 2026-04-01: Created Story 5.2 implementation artifact and moved the story to in-progress.
- 2026-04-01: Added a dedicated controlled-realism test matrix so generation-time checks are documented before the first regulated incremental refresh.
- 2026-04-01: Added the first executable generation-control materializer, validator, and test suite for the approved package baseline.
- 2026-04-01: Completed the second generation-control batch and validated the full minimum internal control/state layer against the approved package.
- 2026-04-01: Materialized the first controlled candidate refresh into the existing candidate lane and verified it with a dedicated test plus the full publication suite.
- 2026-04-01: Added a dedicated controlled-candidate validator, a non-promoting candidate report flow, and reproducibility / fail-closed tests for the logic-grown refresh path.
- 2026-04-01: Recorded the follow-on scope correction that inserts representative masked entity expansion before deeper realism review.
