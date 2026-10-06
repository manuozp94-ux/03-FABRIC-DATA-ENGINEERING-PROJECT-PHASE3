# Story 5.1: Define Deterministic Business-Rule Parameter Sets for Synthetic Economics, Demand Growth, and Shock Behavior

Status: done

## Story

As a product owner,
I want explicit deterministic rule sets for synthetic economics, customer growth, and bounded shocks,
so that incremental data growth is explainable, repeatable, and stable before richer report composition begins.

## Acceptance Criteria

1. Given the approved publication package and current Fabric proof path exist, when the next operating phase begins, then the repo defines deterministic parameter sets for synthetic economics, demand growth, and bounded shock behavior rather than relying on undocumented randomness.
2. The parameter sets describe how unit cost drift, price-step cadence, target margin bands, customer growth patterns, and bounded ramp-up or drop events should behave over time.
3. The rules are documented in a form that can drive later incremental fact generation while preserving stable grain, masking rules, and cross-table consistency.
4. The documented rule sets explicitly state which behaviors are deterministic, which are bounded-variation inputs, and which report-layout concerns are intentionally deferred.

## Tasks / Subtasks

- [x] Define the minimum parameter categories needed for logic-first growth. (AC: 1, 2, 3)
  - [x] Document the masked scenario anchor for the logic-first operating phase.
  - [x] Document economic-rule parameters for cost drift, price-review cadence, and target margin bands.
  - [x] Document account-growth parameters for baseline growth, seasonality, and bounded volatility.
  - [x] Document bounded shock parameters for temporary ramps, dips, and recovery behavior.

- [x] Define rule-governance expectations for later incremental generation. (AC: 1, 3, 4)
  - [x] Distinguish deterministic rules from bounded variation inputs.
  - [x] Record which rule categories may influence demand facts, inventory snapshots, and proxy metrics.
  - [x] Keep report-layout and Desktop-authoring concerns explicitly out of scope for this story.

- [x] Attach the rule set to the current logic-first workflow and next-step handoff. (AC: 3, 4)
  - [x] Reference the logic-first workflow document and the Fabric build runbook.
  - [x] State how Story 5.2 will consume these parameters for incremental fact growth.

- [x] Reopen Story 5.1 to refine the generation rules that will govern new fact rows. (AC: 2, 3, 4)
  - [x] Define how new `fact_demand_line` rows are created by account, product, and date bucket.
  - [x] Define how new `fact_inventory_inbound` rows are created by product, location, receipt flow, and date bucket.
  - [x] Define how new `fact_inventory_snapshot` rows are derived from demand pressure, readiness targets, and recovery behavior.
  - [x] Define which state persists from one refresh window to the next versus which values are recomputed from local rules.
  - [x] Freeze the invariants that later generation work must never violate.

## Dev Notes

- Story 5.1 now anchors the logic-first phase on a masked industry scenario: multi-site distribution of electrical supplies for commercial installation and retrofit work.
- The purpose of the mask is not to invent a new business but to preserve the operating mechanics of the bounded source slice without exposing a closer-to-source industry framing.
- The current priority remains analytical realism and repeatability, not richer UI authoring.

### Project Structure Notes

- Canonical parameter document: `platform/fabric/contracts/logic-first-scenario-parameter-sets.md`
- Existing fact-rule baseline: `platform/fabric/contracts/fact-build-rules.md`
- Workflow reference: `docs/automation/logic-first-fabric-proof-workflow.md`
- Fabric proof runbook: `05-compat/contracts/fab001_fabric_build_runbook.md`

### Technical Requirements

- Keep the rule sets documented in a machine-translatable form for Story 5.2.
- Preserve the current public-safe vocabulary such as `product_family_code` and `account_pattern_class`.
- Treat all economic values as synthetic bands and not as real commercial measures.
- Define repeatability explicitly so the same rule version and time window can be rerun without semantic drift.
- Treat reopened work on Story 5.1 as generation-governance refinement, not as report or semantic-model redesign.

### Reopened Discussion Scope

The story settled the governing rules for how incremental fact rows should actually be generated, not just which parameter bands exist.

The decision areas that were closed are:

1. demand-row creation rules
2. inbound-receipt creation rules
3. inventory-snapshot carry-forward rules
4. shock eligibility and event frequency
5. cross-table causality between demand growth, inbound, and readiness pressure
6. invariant checks that must fail closed before promotion

### Architecture Compliance

- The approved publication package remains the only public-safe contract.
- The synthetic scenario anchor must remain subordinate to the existing supply-chain decision-support thesis.
- Story 5.1 may define rules and parameters only; it must not broaden scope into report redesign or Desktop-first authoring.

### Testing Requirements

- No new runtime code was required for this close-out because the work was generation-governance definition.
- Consistency was validated by aligning the canonical rule document, workflow document, fact-build rules, project map, and sprint status.

### References

- `platform/fabric/contracts/logic-first-scenario-parameter-sets.md`
- `platform/fabric/contracts/fact-build-rules.md`
- `docs/automation/logic-first-fabric-proof-workflow.md`
- `05-compat/contracts/fab001_fabric_build_runbook.md`
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-03-31.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-03-31: Reviewed the story against the current fact-build rules and confirmed that a scenario anchor was still missing from the logic-first phase.
- 2026-03-31: Chose a new masked industry frame centered on electrical-supplies distribution so the public scenario would stay credible without staying too close to the source-industry framing.
- 2026-03-31: Added the canonical scenario-and-parameter document under `platform/fabric/contracts` and aligned the workflow and fact-rule references around it.
- 2026-04-01: Reopened Story 5.1 to refine the governing rules for actual fact generation before Story 5.2 implementation begins.
- 2026-04-01: Closed the generation-governance decisions, internal rule/state tables, and invariants required before Story 5.2 can materialize incremental rows.

### Completion Notes List

- Story 5.1 now has one canonical scenario anchor instead of relying on implicit source-industry assumptions.
- The repo now defines deterministic interpretations for product families and account patterns in the masked business frame.
- The repo now defines initial parameter bands for cost drift, price cadence, target margin, account growth, seasonality, shock behavior, and inventory-readiness posture.
- Deterministic rules and bounded-variation inputs are now separated explicitly so Story 5.2 can consume them without improvising randomization behavior.
- The repo now defines the closed operating answer for daily demand generation, approved inbound generation, and end-of-day inventory snapshot derivation.
- The repo now defines the minimum internal rule/state tables Story 5.2 must materialize before it emits new governed fact rows.
- Report-layout and Power BI Desktop concerns remain intentionally deferred until post-logic stabilization.
- Story 5.1 exits with generation-governance rules closed so Story 5.2 can focus on implementation.

### File List

- `_bmad-output/implementation-artifacts/5-1-define-deterministic-business-rule-parameter-sets-for-synthetic-economics-demand-growth-and-shock-behavior.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `platform/fabric/contracts/logic-first-scenario-parameter-sets.md`
- `platform/fabric/contracts/fact-build-rules.md`
- `docs/automation/logic-first-fabric-proof-workflow.md`
- `docs/public-site/project-map.md`
- `05-compat/contracts/fab001_fabric_build_runbook.md`

### Change Log

- 2026-03-31: Closed the gap between planning and implementation by adding an explicit masked scenario anchor for the logic-first phase.
- 2026-03-31: Documented the first deterministic parameter sets for economics, growth, seasonality, shocks, and readiness behavior.
- 2026-03-31: Marked Story 5.1 done and shifted the next delivery focus toward Story 5.2 incremental fact growth.
- 2026-04-01: Reopened Story 5.1 for one more refinement pass focused on the governing rules for new fact generation.
- 2026-04-01: Closed Story 5.1 again after documenting the operating generation rules and internal control tables needed for Story 5.2.
