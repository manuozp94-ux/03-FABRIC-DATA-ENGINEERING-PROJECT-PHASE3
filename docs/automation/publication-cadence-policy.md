# Publication Cadence Policy

## Purpose

This document defines the target operating cadence for the public analytical portfolio so freshness claims remain credible, governed, and maintainable for a solo senior builder.

## Target Policy

- Candidate refreshes should run on a nightly cadence when bounded source inputs are available.
- Public promotion should happen on an approval-based cadence, with weekly publication as the default operating rhythm unless a meaningful change justifies an earlier release.
- Candidate refreshes must never auto-promote the public package. Validation and approval stay between candidate generation and public release.
- The last approved public package remains active whenever a candidate build or validation step fails.

## Freshness Presentation Rules

- Show `last successful refresh` separately from `last approved release`.
- Show a freshness warning after 7 days without a successful approved refresh.
- Show a stale state after 14 days without a successful approved refresh.
- Do not imply live or continuous freshness unless the repo later gains a governed schedule, validation evidence, and release promotion records that support that claim.

## Recommended Sidecar Job

The best sidecar process for this repo is a non-promoting candidate refresh job:

1. Run the governed build against bounded source inputs.
2. Run publication-safe validation.
3. Record the candidate refresh timestamp and result.
4. Stop on validation failure without overwriting the approved public package.

Current local entrypoint:

- `corepack pnpm run candidate:fabric-refresh`

This sidecar supports a strong senior-level portfolio narrative because it proves operational discipline without overclaiming real-time production behavior.

## Story Mapping

- Story 1.4 should support safe incremental updates and candidate/current package separation.
- Story 1.5 should enforce fail-closed publication gates before promotion.
- Story 3.4 should display freshness and update context in the public experience.
- Story 6.1 should record release identity and traceability aligned to this cadence.
- Story 6.2 should publish change summaries and operational status aligned to this cadence.
