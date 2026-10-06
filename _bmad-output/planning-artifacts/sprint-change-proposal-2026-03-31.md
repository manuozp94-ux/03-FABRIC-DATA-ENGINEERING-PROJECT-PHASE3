# Sprint Change Proposal

Date: 2026-03-31
Change Type: Priority reorder and workflow integration
Status: Approved for planning alignment

## Issue Summary

The project successfully established the first bounded Fabric proof path in Story `4.6`, including the Lakehouse, semantic model, report shell, and bounded embed route.

That success changed the next bottleneck.

The project no longer needs to prioritize manual Power BI UI work as the immediate next step.
The higher-value next step is to make the analytical logic itself more real, more incremental, and more coherent before richer report composition begins.

Without this correction, the project risks:

- spending manual Desktop time on visuals that will churn
- using report design as a substitute for unresolved business-rule decisions
- proving tool usage before proving stable analytical behavior

## Recommended Correction

Adopt a logic-first workflow for the next delivery phase:

1. deterministic business-rule parameterization
2. coherent incremental fact growth through the approved package flow
3. realism and invariant validation before promotion
4. Fabric Bronze / Silver / Gold refresh from stabilized logic
5. semantic proof refresh
6. manual Desktop composition only after logic stability is achieved

## Roadmap Impact

### Epic sequencing

- Keep Epic `4` complete as the initial technical-proof milestone.
- Insert a new Epic `5` focused on logic-first Fabric operationalization.
- Move release traceability and recovery to Epic `6`.

### Story impact

New Epic `5` stories:

- `5.1` deterministic business-rule parameter sets
- `5.2` coherent incremental fact growth
- `5.3` realism, invariant, and coherence validation
- `5.4` Fabric proof refresh from stabilized serving logic

Renumbered release stories:

- old `5.1` -> new `6.1`
- old `5.2` -> new `6.2`
- old `5.3` -> new `6.3`

## Workflow Integration

The repo should now treat the following as the standard operating sequence:

- rules first
- approved package refresh second
- Fabric serving refresh third
- semantic refresh fourth
- optional Desktop polish fifth

This keeps the report layer subordinate to stable analytical behavior and aligns better with the project’s stated principle of proving judgment before presentation polish.

## Success Criteria

The correction is successful if:

- the roadmap clearly shows logic-first work ahead of richer report authoring
- the current sprint focus moves to deterministic rule design and incremental serving stability
- the Fabric proof shell remains valid but no longer drives priority by itself
- Trello mirrors the new epic sequence and current focus
