---
date: 2026-03-28
project: FABRIC_PLATFORM_DEV_BMAD
workflow: bmad-correct-course
mode: Batch
approval_status: approved_for_application
approved_on: 2026-03-28
change_scope: Moderate
change_trigger: >
  Pre-implementation readiness review exposed under-specified proof-lane requirements:
  the main PRD is lighter than companion artifacts on Fabric architecture proof,
  bounded DP-700 evidence framing, reusable delivery-method boundaries, and the
  early publication-contract decisions needed to avoid implementation drift.
trigger_sources:
  - _bmad-output/planning-artifacts/implementation-readiness-report-2026-03-28.md
  - _bmad-output/planning-artifacts/prd-sweep-architecture-learning-client-enablement-2026-03-27.md
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
assumptions:
  - No explicit user-supplied trigger was provided; the latest readiness findings were used as the best available change trigger.
  - No project-context.md file was found.
  - No active sprint-status.yaml file was found, so no sprint-status artifact was updated in this pass.
---

# Sprint Change Proposal

## 1. Issue Summary

### Triggering Story

- Primary trigger story: `Story 4.4: Publish the Bounded Technical Evidence Bundle`
- Discovery point: pre-implementation readiness review on 2026-03-28

### Problem Statement

The project direction is still sound, but the planning set is unevenly explicit. The companion sweep, architecture, and readiness artifacts clearly expect:

- reviewable Fabric architecture proof
- bounded DP-700-relevant learning evidence with explicit in-scope vs deferred proof
- a reusable delivery-method boundary that stays parallel to, not inside, the Phase 1 MVP
- early locking of the publication manifest, sync contract, validation-command flow, and test-tool baseline

The main PRD and current story map only partially formalize those expectations. If the team proceeds as-is, the likely failure mode is not the wrong MVP, but delivery drift: implementation teams may build the technical-method route, release evidence, and supporting docs inconsistently, or accidentally let client-enablement materials bleed into Phase 1 scope.

### Evidence

- The readiness report states that Fabric architecture proof, DP-700 learning evidence, and reusable client-enablement method are "only partially formalized in the main PRD."
- The architecture document marks early implementation seams as important gaps: exact publication manifest schema, sync/promotion contract, validation command sequence, and test-tool selection.
- The epics document already expects the technical evidence bundle to surface DP-700-relevant lifecycle and governance proof, but the PRD wording is still broader and less operational.

## 2. Checklist Results

### Section 1: Understand the Trigger and Context

- `[x]` 1.1 Trigger identified: `Story 4.4` is the first story where the ambiguity becomes implementation-critical.
- `[x]` 1.2 Core problem defined: underweighted requirements and early-delivery ambiguity, not a strategic pivot.
- `[x]` 1.3 Supporting evidence captured from the readiness report, sweep note, architecture gap analysis, and current epic/story wording.

### Section 2: Epic Impact Assessment

- `[x]` 2.1 Epic 4 can still be completed, but its proof lane should be made more explicit before implementation.
- `[x]` 2.2 Epic-level changes required:
  - tighten Epic 4 proof expectations
  - add one early-delivery story in Epic 1 for publication-contract and verification baseline decisions
  - slightly strengthen Epic 5 release-summary expectations
- `[x]` 2.3 Remaining epic impact reviewed:
  - Epic 1 affected by the need to lock implementation contracts earlier
  - Epic 2 lightly affected because the technical-method route should advertise bounded proof coverage clearly
  - Epic 5 affected because release summaries should capture proof-scope and boundary changes
- `[x]` 2.4 No new epic is required; story-level adjustment is sufficient.
- `[x]` 2.5 Priority change recommended: execute the new early-delivery contract story immediately after `Story 1.1`, before broadening technical-method implementation.

### Section 3: Artifact Conflict and Impact Analysis

- `[x]` 3.1 PRD conflict: partial. The PRD direction is correct, but FR24/FR27 and the supporting requirements are not explicit enough for implementation-grade proof decisions.
- `[x]` 3.2 Architecture conflict: low. The architecture is already explicit; only a small handoff clarification is recommended.
- `[x]` 3.3 UX conflict: low. UX intent is aligned, but the technical-proof flow should explicitly signal bounded proof coverage and deferred items.
- `[x]` 3.4 Secondary artifact impact:
  - release-summary templates
  - publication manifest definition
  - validation command documentation
  - test-tool selection notes

### Section 4: Path Forward Evaluation

- `[x]` 4.1 Option 1, Direct Adjustment: viable
  - Effort: Medium
  - Risk: Low
- `[ ]` 4.2 Option 2, Potential Rollback: not viable
  - Effort: High
  - Risk: Medium
  - Reason: no implemented feature needs rollback; the issue is planning precision, not shipped behavior
- `[ ]` 4.3 Option 3, PRD MVP Review: not the primary path
  - Effort: Medium
  - Risk: Medium
  - Reason: the MVP itself is still achievable; the main need is specification tightening, not scope reduction
- `[x]` 4.4 Selected approach: Hybrid leaning Option 1
  - Directly tighten the PRD and stories
  - Add one early-delivery story to lock cross-boundary contracts
  - Preserve MVP scope and phase boundaries

### Section 5: Proposal Components

- `[x]` 5.1 Issue summary prepared
- `[x]` 5.2 Epic and artifact impacts documented
- `[x]` 5.3 Recommended path and rationale documented
- `[x]` 5.4 MVP impact and action plan defined
- `[x]` 5.5 Handoff plan prepared

### Section 6: Final Review and Handoff

- `[x]` 6.1 Checklist reviewed for completeness
- `[x]` 6.2 Proposal reviewed for consistency
- `[x]` 6.3 User approval received on 2026-03-28 and applied to the planning artifacts
- `[N/A]` 6.4 `sprint-status.yaml` not updated because no active sprint-status file exists in the repo

## 3. Impact Analysis

### Epic Impact

#### Epic 1: Publish a Safe Analytical MVP Slice

Needs a new early story to define the publication manifest schema, sync contract, validation command flow, and test-tool baseline before the rest of the proof lane advances.

#### Epic 2: Launch the Shared Public Entry Experience

`Story 2.4` should more clearly state that the technical-method route presents bounded proof coverage, not an unbounded certification or documentation portal.

#### Epic 4: Prove the Technical Method on the Same Surface

This is the most impacted epic. `Story 4.4` is directionally correct but should explicitly require:

- a compact proof-coverage note
- an included-vs-deferred DP-700 evidence boundary
- durable references to release evidence and governance artifacts

#### Epic 5: Operate Releases with Traceability and Recovery

`Story 5.2` should explicitly record proof-scope and publication-boundary changes when those shift between releases.

### Artifact Conflicts

#### PRD

Needs stronger operational wording for:

- FR24 technical evidence bundle content
- FR27 bounded learning evidence expectations
- early delivery decisions for manifest/sync/validation/testing
- explicit separation between Phase 1 MVP runtime scope and reusable client-enablement materials

#### Architecture

No structural rework needed. One small clarification is recommended so the implementation handoff explicitly includes the proof-coverage note as part of the early contract-locking work.

#### UX Design

No structural rework needed. One small addition is recommended so progressive proof explicitly includes an "included / deferred" evidence cue for technical readers.

### Technical Impact

- Prevents ad hoc evidence-package structure
- Reduces risk of inconsistent technical-method route content
- Keeps client-enablement docs out of Phase 1 runtime acceptance scope
- Makes release summaries more useful to future reviewers and recruiters

## 4. Recommended Approach

### Recommendation

Proceed with a moderate-scope direct adjustment. Do not reset the MVP. Do not create a new epic. Instead:

1. tighten the PRD so the proof lane is implementation-grade
2. add one early-delivery story in Epic 1
3. strengthen `Story 4.4` and `Story 5.2`
4. make minor architecture and UX clarifications

### Rationale

- Lowest-risk path: it keeps the current product shape intact
- Highest leverage: it removes ambiguity before implementation spreads it across multiple artifacts
- Best for momentum: it avoids a reset while still correcting real drift risk
- Sustainable: it aligns the PRD with the already-stronger architecture and epic documents

### Effort, Risk, and Timeline

- Effort: Medium
- Delivery risk if accepted: Low
- Timeline impact: small near-term planning delay, likely saving rework during Epic 4 and release implementation

## 5. Detailed Change Proposals

### Proposal A: Tighten PRD FR24 and FR27

**Artifact:** `prd.md`

**Section:** Technical Credibility & Learning Evidence

**OLD**

- `FR24: Visitors can review a minimum technical evidence bundle from within the same public experience, including an architecture summary, model or lineage view, grain or schema summary, validation summary, and release/version references.`
- `FR27: The product owner can publish bounded Fabric-oriented learning evidence tied to the implemented solution without turning the product into a full certification-prep site.`

**NEW**

- `FR24: Visitors can review a minimum technical evidence bundle from within the same public experience, including an architecture summary, model or lineage view, grain or schema summary, validation summary, release/version references, and a compact statement of which lifecycle, governance, monitoring, or semantic-ownership proof items are intentionally included in Phase 1.`
- `FR27: The product owner can publish bounded Fabric-oriented learning evidence tied to the implemented solution, explicitly label which DP-700-relevant proof areas are demonstrated, and identify intentionally deferred areas without turning the product into a full certification-prep site.`

**Rationale**

These changes turn the current broad intent into something reviewers and implementers can build consistently.

### Proposal B: Add PRD Additional Requirements for Early Contract Locking and Scope Boundary

**Artifact:** `prd.md`

**Section:** Additional Requirements

**OLD**

- No explicit requirement in the main PRD locks the publication manifest schema, sync contract, validation command flow, or test-tool baseline early.

**NEW**

- `Early implementation work must lock the publication manifest schema, public-package sync contract, validation-command flow, and minimum test-tool baseline before the technical-method route and release evidence are expanded.`
- `Phase 1 must treat reusable client-enablement and jurisdiction-specific legal/commercial packs as reference materials outside runtime MVP acceptance scope, even when they exist in the repo.`
- `The technical evidence bundle must rely on durable release artifacts and governed proof references rather than ad hoc narrative-only evidence.`

**Rationale**

This closes the gap between architecture intent and the main PRD.

### Proposal C: Add a New Early Story in Epic 1

**Artifact:** `epics.md`

**Section:** Epic 1

**OLD**

- No dedicated story explicitly locks the manifest, sync, validation-command, and test-tool decisions even though later stories depend on them.

**NEW**

```md
### Story 1.6: Lock the Publication Contract and Verification Baseline (FR24, FR31, FR34)

As a product owner,
I want the publication manifest, sync contract, validation-command flow, and test-tool baseline defined before the proof lane expands,
So that later technical evidence and release stories build on one consistent governed contract.

**Acceptance Criteria:**

**Given** the Astro starter foundation exists
**When** the governed publication boundary is prepared for implementation
**Then** the publication manifest schema and required fields are documented and versioned
**And** the sync contract between governed publication outputs and web-consumption data is defined clearly enough to avoid hand-authored drift
**And** the validation-command flow for local, preview, and CI execution is documented
**And** the minimum test-tool baseline for public-site checks and publication-package verification is selected and recorded
```

**Rationale**

This converts architecture watchpoints into backlog work before they become delivery inconsistency.

### Proposal D: Strengthen Story 4.4

**Artifact:** `epics.md`

**Section:** Story 4.4

**OLD**

- `And the evidence bundle includes bounded Fabric-oriented learning evidence relevant to lifecycle, governance, monitoring, or semantic ownership`
- `And the page makes it clear that the project is not a full certification-prep site even though it exposes DP-700-relevant proof`

**NEW**

- `And the evidence bundle includes bounded Fabric-oriented learning evidence relevant to lifecycle, governance, monitoring, or semantic ownership, with a compact included-versus-deferred proof note`
- `And the page makes it clear which DP-700-relevant proof areas are demonstrated directly, which are supported indirectly through release artifacts, and which remain intentionally deferred`

**Rationale**

This prevents the technical-method route from being either too vague or too broad.

### Proposal E: Strengthen Story 5.2

**Artifact:** `epics.md`

**Section:** Story 5.2

**OLD**

- `And meaningful changes to public-proof scope, exposed technical evidence, or publication-boundary decisions are recorded in the release summary`

**NEW**

- `And meaningful changes to public-proof scope, exposed technical evidence, publication-boundary decisions, or DP-700-proof coverage are recorded in the release summary`

**Rationale**

The release log should explain not only what changed, but also whether the proof surface itself expanded, narrowed, or stayed intentionally bounded.

### Proposal F: Clarify the Architecture Handoff

**Artifact:** `architecture.md`

**Section:** Implementation Handoff

**OLD**

- `Initialize the Astro public site as the first implementation story, then immediately define the publication manifest schema, sync contract, and validation command flow that feed the shared public surface.`

**NEW**

- `Initialize the Astro public site as the first implementation story, then immediately define the publication manifest schema, sync contract, validation command flow, and compact proof-coverage record that feed the shared public surface.`

**Rationale**

This keeps the architecture handoff aligned with the technical-method route expectations.

### Proposal G: Clarify UX Progressive Proof

**Artifact:** `ux-design-specification.md`

**Section:** Design Opportunities / Effortless Interactions

**OLD**

- `Progressive disclosure can let users move from high-level problem framing into methodology, model logic, and proof artifacts only when they want deeper detail.`

**NEW**

- `Progressive disclosure can let users move from high-level problem framing into methodology, model logic, and proof artifacts only when they want deeper detail, including a compact cue for what technical proof is included in Phase 1 and what is intentionally deferred.`

**Rationale**

This keeps trust high for technical readers without interrupting the business-first narrative.

## 6. High-Level Action Plan

1. Update `prd.md` with tighter FR24/FR27 wording and the new additional requirements.
2. Update `epics.md` to add `Story 1.6`, strengthen `Story 4.4`, and strengthen `Story 5.2`.
3. Apply small alignment edits to `architecture.md` and `ux-design-specification.md`.
4. Regenerate sprint status only after an actual sprint-status file exists or is introduced.
5. Route implementation of approved changes to backlog grooming before coding begins.

## 7. Handoff Plan

### Scope Classification

Moderate

### Handoff Recipients

- Product Owner / Scrum Master
  - approve the correction
  - insert the new early-delivery story
  - resequence backlog execution so `Story 1.6` is executed immediately after `Story 1.1`
- Product Manager / Architect
  - validate the tightened PRD and proof-boundary wording
- Development team
  - implement only after the planning artifacts are updated and approved

### Success Criteria

- The PRD, epics, architecture, and UX docs all say the same thing about the proof lane.
- The technical-method route has a clear bounded-proof contract before implementation starts.
- Phase 1 runtime scope stays separate from client-enablement reference materials.
- Release summaries can explain proof-scope changes without ambiguity.

## 8. Approval Status

User approval was provided on 2026-03-28 and the approved planning-artifact changes were applied.

Recommended response options:

- `implemented` planning-artifact updates are now in place
- `revise` can be used later if follow-up adjustments are needed
