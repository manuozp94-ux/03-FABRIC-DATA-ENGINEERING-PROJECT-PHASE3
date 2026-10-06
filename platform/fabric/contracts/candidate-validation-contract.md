# Candidate Validation Contract

## Purpose

This contract defines the fail-closed validation and diagnostic outputs for candidate publication packages before any approved release step exists.

## Candidate Scope

- Candidate package root: `_bmad-output/test-artifacts/fabric-candidate/`
- Candidate package output: `_bmad-output/test-artifacts/fabric-candidate/current/`
- Candidate validation report: `_bmad-output/test-artifacts/fabric-candidate/candidate-refresh-report.json`

Candidate outputs are investigatory and non-promoting. They must never become the active public package or public-site mirror automatically.

## Validation Expectations

Candidate validation must execute publication-safety and contract checks before any promotion decision:

- candidate build completeness and source readability
- required fields
- non-empty artifact arrays
- uniqueness and key stability expectations
- controlled vocabularies
- cross-table consistency and coherence
- public-window date semantics
- sensitive-source exposure checks

## Diagnostic Output Shape

The candidate validation report must remain machine-readable and text-diffable. At minimum it must include:

- `run_type`
- `candidate_status`
- `promoted`
- `validation_passed`
- `blocking_failure_count`
- `blocking_reason_summary`
- `diagnostics`
- `validation_errors`
- `row_counts`
- `active_baseline`

Each diagnostic entry must include:

- `rule_id`
- `artifact`
- `severity`
- `blocking`
- `message`

## Blocking Rules

- Any blocking diagnostic leaves the candidate in `blocked` status.
- Candidate build failures must also emit a blocked report and overwrite any prior success-state report for the same candidate lane.
- A blocked candidate must not overwrite `platform/fabric/publication/current/`.
- A blocked candidate must not overwrite `apps/public-site/src/data/publication/current/`.
- The last approved package remains the active public baseline whenever candidate validation fails.

## Baseline References

The candidate validation report should reference the currently active approved baselines:

- `platform/fabric/publication/current/`
- `apps/public-site/src/data/publication/current/`

These references are evidence of the preserved active state, not a promotion record.
