# Verification Baseline

## Purpose

This document records the minimum test-tool baseline for the public site and the governed publication package so later proof, release, and operational stories do not improvise different verification stacks.

## Selected Tools

### Publication Package Verification

- Node.js built-in test runner via `node --test`
- governed validation script: `platform/fabric/validation/validate-dimensions.mjs`
- candidate refresh diagnostics: `platform/fabric/automation/run-candidate-refresh.mjs`

Why this baseline:

- lightweight and already in use
- static, text-diffable outputs
- no extra runner dependency required for governed data-contract checks

### Public-Site Verification

- Astro production build
- Astro check

Current entrypoints:

- `corepack pnpm run build:public-site`
- `corepack pnpm run check:public-site`

Why this baseline:

- validates the static consumer against approved mirrored publication data
- preserves the static-first Phase 1 posture
- avoids prematurely selecting a browser automation stack before the public routes exist

## Explicit Non-Selections for Phase 1 Baseline

These are intentionally deferred, not rejected forever:

- Playwright
- Cypress
- visual regression tooling
- Lighthouse CI
- dedicated schema-validation framework beyond the current governed scripts

They may be added later when Epic 2 and Epic 3 create enough public surface to justify them.

## Minimum Verification Scope by Lane

### Governed Publication Lane

- contract tests
- fail-closed sync tests
- candidate blocking tests
- direct validation script run

### Public-Site Lane

- production build
- Astro check

## References

- `package.json`
- `docs/automation/publication-validation-flow.md`
- `_bmad-output/planning-artifacts/architecture.md`
