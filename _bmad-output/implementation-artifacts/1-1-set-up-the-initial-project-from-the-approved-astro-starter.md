# Story 1.1: Set Up the Initial Project from the Approved Astro Starter

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a product owner,
I want the public-site project initialized from the approved Astro starter with the governed delivery boundaries in place,
so that later publication and validation work can be added without reworking the MVP foundation.

## Acceptance Criteria

1. Given the architecture selects Astro with TypeScript as the approved starter template, when the first implementation story is executed, then the public-site project is initialized with `pnpm create astro@latest` using the approved minimal or basic official starter with TypeScript enabled.
2. The starter setup installs dependencies and initializes Git during project creation.
3. The initial baseline includes the public-site package manifest, Astro config, TypeScript config, `src/pages/`, `src/layouts/`, `src/components/`, and `public/assets/` structure needed for the MVP.
4. The initial structure separates public delivery concerns from governed publication artifacts and private-prep concerns according to the approved folder boundaries.
5. The initial setup preserves the static-first delivery model and leaves React uninstalled until an explicit later `pnpm astro add react` follow-up is approved.
6. The starter-based foundation supports later contract validation and fail-closed publication work without boundary drift.

## Tasks / Subtasks

- [x] Scaffold the public web app in `apps/public-site/` from the approved Astro starter. (AC: 1, 3, 5)
  - [x] Run the official Astro starter against `apps/public-site/` from the repository root, using TypeScript and the minimal or basic official starter.
  - [x] Allow the starter to install dependencies during setup and keep the generated Astro baseline files intact: `package.json`, Astro config, `tsconfig.json`, `src/pages/`, and `public/`.
  - [x] Create or confirm the additional MVP directories inside `apps/public-site/`: `src/layouts/`, `src/components/`, and `public/assets/`.
  - [x] Keep React uninstalled in this story and document any later need as a follow-up, not as starter scope.

- [x] Align the repository root with the approved workspace boundary instead of leaving the starter isolated. (AC: 2, 4, 6)
  - [x] Because the repo root is already populated and not empty, do not run `create-astro` at the root; scaffold only inside `apps/public-site/`.
  - [x] Do not keep a nested `.git` directory inside `apps/public-site/`; if the starter creates one, remove it and initialize Git once at the repository root as the canonical source-control boundary.
  - [x] Add the minimal root workspace files needed for the approved structure, including a root `package.json` and `pnpm-workspace.yaml`, without overwriting existing BMAD or docs assets.

- [x] Establish the three-zone directory seams so later stories land in the correct places. (AC: 4, 6)
  - [x] Create the top-level directories required by the architecture if they do not already exist: `apps/`, `platform/`, `tests/`, and `.github/workflows/`.
  - [x] Add thin placeholder boundaries under `platform/fabric/` for `contracts/`, `publication/`, `validation/`, and `private-prep/`, plus `tests/publication/`, without inventing detailed schemas or automation ahead of Story 1.6.
  - [x] Ensure `apps/public-site/` remains a public-delivery-only surface and does not copy private preparation content or business data into the web layer.

- [x] Verify the starter foundation is healthy and ready for later governed publication work. (AC: 5, 6)
  - [x] Run the minimum starter health checks available after scaffold, such as `pnpm --dir apps/public-site build` and `pnpm --dir apps/public-site astro check` if the generated version supports it.
  - [x] Confirm the resulting structure can later host the publication manifest schema, sync contract, validation-command flow, and test-tool baseline without another repo reorganization.
  - [x] Record any setup deviations or follow-up decisions in story notes rather than silently improvising architecture changes.

## Dev Notes

- The current repository root already contains BMAD planning artifacts, documentation, Trello automation, and implementation tracking files. Story 1.1 must fit the Astro starter into that existing workspace, not replace it.
- The current workspace is not a Git repository yet, and there is no root `package.json` or `pnpm-workspace.yaml`. That makes root-level workspace setup part of the implementation guardrail for this story.
- The architecture expects `apps/public-site/` to be the public delivery layer, `platform/fabric/` to be the governed analytics/publication layer, and `platform/fabric/private-prep/` to remain private. Do not collapse those boundaries while setting up the starter.
- Keep the scaffold static-first. Do not add a global client-side app shell, a public API, a custom app database, or public authentication in this story.
- Do not lock Tailwind, component-library, or test-framework choices beyond what the starter already needs. Story 1.6 is where the publication manifest, sync contract, validation-command flow, and test-tool baseline are made explicit.

### Project Structure Notes

- Expected root additions from architecture: `package.json`, `pnpm-workspace.yaml`, `.github/workflows/`, `apps/public-site/`, `platform/fabric/`, and `tests/publication/`.
- Expected public-site baseline from architecture: `apps/public-site/package.json`, Astro config, `tsconfig.json`, `src/pages/`, `src/layouts/`, `src/components/`, and `public/assets/`.
- Current root inventory before implementation already includes `_bmad/`, `_bmad-output/`, `docs/`, and `scripts/`. Preserve those as-is.
- No `project-context.md` file exists yet, so the story itself must carry the key implementation guardrails.

### Technical Requirements

- Use Astro as the selected starter for the public site; keep the public delivery layer content-first and SEO-forward.
- Scaffold into `apps/public-site/` instead of the repository root because the root is not empty and the architecture expects a multi-area project structure.
- Keep React deferred. If the starter or a follow-up prompt offers official integrations, do not install React in Story 1.1.
- Use the starter outcome to establish the public web seam only. The governed Fabric publication model and private preparation model should be represented by directory boundaries, not by premature implementation detail.

### Architecture Compliance

- Respect the three-zone boundary: private preparation, governed analytics/publication, and public delivery.
- Keep `apps/public-site/` read-only with respect to governed publication data until later sync work is defined.
- Avoid Phase 1 excluded systems: no custom public API, no custom application database, no public authentication flow, and no ad hoc runtime data access from the web layer.
- Preserve the static-first model and route-local ownership so later landing, case-study, technical-method, and contact routes can be added without reworking the starter.

### Library / Framework Requirements

- Architecture-selected web framework: Astro, current `6.x` line, with React `19.2` available only as a later selective island option. [Source: `_bmad-output/planning-artifacts/architecture.md` - Technology Stack]
- Official Astro docs still support `pnpm create astro@latest` for project creation and `pnpm astro add react` for later official React integration as of 2026-03-28. [Source: https://docs.astro.build/ru/install-and-setup/ and https://docs.astro.build/zh-cn/guides/integrations-guide/react/]
- Keep styling lean in the starter step. Do not let the initial scaffold hard-commit the repo to a heavy UI framework before the analytical artifact exists.

### Testing Requirements

- Do not choose or install a heavy test framework in Story 1.1 unless the starter requires it.
- Minimum verification for this story is starter health: successful dependency install, successful build, and successful Astro validation/type checks if supported by the generated version.
- Capture any test-tool recommendation as an implementation note for Story 1.6 instead of making an unreviewed tooling decision here.

### Previous Story Intelligence

- None. This is the first implementation story in the sprint and there is no previous story file to inherit from.

### Git / Repo Intelligence

- `git rev-parse --is-inside-work-tree` currently fails at the repository root, so root-level Git initialization must be treated intentionally during implementation.
- There is no existing root `package.json` or `pnpm-workspace.yaml`, so the developer should not assume a preexisting Node workspace.

### Latest Technical Information

- The current official Astro installation docs still use the `create astro` wizard and support additional CLI flags when needed, so an implementation may use either the interactive wizard or an equivalent current non-interactive form as long as the resulting scaffold matches the approved starter choices.
- The current official React integration docs still use `astro add react`, which reinforces that React should remain an explicit later integration rather than part of the initial scaffold.

### References

- `_bmad-output/planning-artifacts/epics.md` - Story 1.1 acceptance criteria, Additional Requirements, NFR Traceability, and Story-Level NFR References.
- `_bmad-output/planning-artifacts/architecture.md` - Selected Starter: Astro, Core Architectural Decisions, Complete Project Directory Structure, Architectural Boundaries, Gap Analysis Results, and First Implementation Priority.
- `_bmad-output/planning-artifacts/prd.md` - Additional Requirements section covering early locking of the publication manifest, sync contract, validation-command flow, and test-tool baseline.
- `_bmad-output/planning-artifacts/ux-design-specification.md` - Design System Foundation and Implementation Approach sections confirming Astro-first components, semantic HTML, CSS variables, and restrained JS.
- Official Astro docs checked on 2026-03-28:
  - https://docs.astro.build/ru/install-and-setup/
  - https://docs.astro.build/zh-cn/guides/integrations-guide/react/

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from the current sprint plan, epic definition, PRD, architecture, UX spec, and official Astro docs on 2026-03-28.
- `corepack pnpm create astro@latest apps/public-site` scaffolded the official Astro basic starter with TypeScript enabled inside `apps/public-site/`.
- The Astro wizard created `apps/public-site/.git` and attempted dependency installation, but its internal `pnpm` call could not resolve from the environment; the nested Git boundary was removed and `corepack pnpm install` completed immediately afterward from the repository root workspace.
- Validation passed with `ASTRO_TELEMETRY_DISABLED=1 corepack pnpm --dir apps/public-site build` and `ASTRO_TELEMETRY_DISABLED=1 corepack pnpm --dir apps/public-site astro check` after adding `@astrojs/check` and pinning `typescript@^5.9.3` for Astro's checker compatibility.
- Post-review follow-up aligned the recorded baseline to Astro 6, moved optional VS Code helpers to the repository root boundary, and replaced bare root `pnpm` entrypoints with a cross-platform `corepack` wrapper that preserves the validated telemetry-disabled execution path.
- A follow-up `corepack pnpm install` refreshed the workspace links after the wrapper change, and the root-level `corepack pnpm run build:public-site` plus `corepack pnpm run check:public-site` scripts then passed successfully.

### Completion Notes List

- Official Astro basic starter is now scaffolded in `apps/public-site/` with the generated baseline files preserved and React intentionally left uninstalled.
- Repository ownership now lives at the root Git/workspace boundary via `git init`, root `package.json`, and `pnpm-workspace.yaml`; the generated nested `apps/public-site/.git` directory was removed per story guardrail.
- Placeholder boundaries now exist for `.github/workflows/`, `platform/fabric/contracts/`, `platform/fabric/publication/`, `platform/fabric/validation/`, `platform/fabric/private-prep/`, `tests/publication/`, and `apps/public-site/public/assets/`.
- Setup deviation recorded: the Astro wizard attempted dependency installation during scaffold, but its `pnpm` subprocess was unavailable on PATH, so dependencies were installed immediately afterward with `corepack pnpm install` from the workspace root.
- Health checks passed after setup: `build` succeeded, `astro check` succeeded with `@astrojs/check` plus `typescript@^5.9.3`, and telemetry was disabled during validation to avoid sandbox-only preference-directory writes.
- Review follow-ups tightened the root scripts, ignore rules, and workspace ergonomics without changing the Story 1.1 scope: `trello-sync-state.json` is now ignored, `private-prep` contents are ignored by default except for the boundary marker, `.env.local` variants are ignored in the Astro app, and the starter heading/meta rough edges were cleaned up.
- Root-level wrapper verification now passes through the published package scripts, so the repo-level `build:public-site` and `check:public-site` commands match the documented working path instead of relying on ad hoc terminal commands.
- Low-burn follow-up review on the patch-only files found no additional actionable issues, so Story 1.1 is ready to close and the sprint can advance to Story 1.2.

### File List

- `.agents/skills/bmad-sprint-planning/workflow.md`
- `.vscode/extensions.json`
- `.vscode/launch.json`
- `.github/workflows/.gitkeep`
- `.gitignore`
- `_bmad/bmm/workflows/4-implementation/bmad-sprint-planning/workflow.md`
- `_bmad-output/implementation-artifacts/1-1-set-up-the-initial-project-from-the-approved-astro-starter.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/planning-artifacts/architecture.md`
- `apps/public-site/.gitignore`
- `apps/public-site/.vscode/extensions.json` (deleted)
- `apps/public-site/.vscode/launch.json` (deleted)
- `apps/public-site/README.md`
- `apps/public-site/astro.config.mjs`
- `apps/public-site/package.json`
- `apps/public-site/public/assets/.gitkeep`
- `apps/public-site/public/favicon.ico`
- `apps/public-site/public/favicon.svg`
- `apps/public-site/src/assets/astro.svg`
- `apps/public-site/src/assets/background.svg`
- `apps/public-site/src/components/Welcome.astro`
- `apps/public-site/src/layouts/Layout.astro`
- `apps/public-site/src/pages/index.astro`
- `apps/public-site/tsconfig.json`
- `package.json`
- `platform/fabric/contracts/.gitkeep`
- `platform/fabric/private-prep/.gitkeep`
- `platform/fabric/publication/.gitkeep`
- `platform/fabric/validation/.gitkeep`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `scripts/run-public-site.mjs`
- `tests/publication/.gitkeep`

### Change Log

- 2026-03-28: Scaffolded the Astro public-site starter, aligned the root pnpm workspace and Git boundary, added three-zone placeholder directories, and verified the baseline with a successful build plus `astro check`.
- 2026-03-28: Applied post-review Story 1.1 fixes for runnable root scripts, safer ignore rules, root-level editor helpers, sprint-tracker portability, and Astro 6 baseline alignment.
- 2026-03-28: Completed a low-burn closeout review on the follow-up files and marked Story 1.1 done.
