# Implementation Brief: Story 1.1: Set Up the Initial Project from the Approved Astro Starter

## What This Story Is
The public-site project initialized from the approved Astro starter with the governed delivery boundaries in place so that later publication and validation work can be added without reworking the MVP foundation.

## Current Delivery State
- Story state: Done
- Overall project progress: 34/34 stories done

## Explicit Project Detail
- Story purpose: The public-site project initialized from the approved Astro starter with the governed delivery boundaries in place so that later publication and validation work can be added without reworking the MVP foundation.
- Acceptance target: Given the architecture selects Astro with TypeScript as the approved starter template, when the first implementation story is executed, then the public-site project is initialized with `pnpm create astro@latest` using the approved minimal or basic official starter with TypeScript enabled.
- Acceptance target: The starter setup installs dependencies and initializes Git during project creation.
- Acceptance target: The initial baseline includes the public-site package manifest, Astro config, TypeScript config, `src/pages/`, `src/layouts/`, `src/components/`, and `public/assets/` structure needed for the MVP.
- Delivered evidence: Official Astro basic starter is now scaffolded in `apps/public-site/` with the generated baseline files preserved and React intentionally left uninstalled.
- Delivered evidence: Repository ownership now lives at the root Git/workspace boundary via `git init`, root `package.json`, and `pnpm-workspace.yaml`; the generated nested `apps/public-site/.git` directory was removed per story guardrail.
- Delivered evidence: Placeholder boundaries now exist for `.github/workflows/`, `platform/fabric/contracts/`, `platform/fabric/publication/`, `platform/fabric/validation/`, `platform/fabric/private-prep/`, `tests/publication/`, and `apps/public-site/public/assets/`.
- Delivered evidence: Setup deviation recorded: the Astro wizard attempted dependency installation during scaffold, but its `pnpm` subprocess was unavailable on PATH, so dependencies were installed immediately afterward with `corepack pnpm install` from the workspace root.
