# Trello Hybrid Sync

This repo now includes a hybrid BMAD-to-Trello sync script at `scripts/trello_hybrid_sync.py`.

## Source of Truth

Local BMAD artifacts remain authoritative:

- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/*.md` story files when they exist

For the V2 operating-loop rebaseline, use the Trello-specific mirror files:

- `_bmad-output/planning-artifacts/epics-v2-trello.md`
- `_bmad-output/implementation-artifacts/sprint-status-v2.yaml`
- `_bmad-output/implementation-artifacts/trello-sync-state-v2.json`

The canonical V2 planning source remains `_bmad-output/planning-artifacts/epics-v2-operating-loop-decision-system-2026-04-15.md`.
The Trello mirror maps V2 epics `v2.1-v2.6` into Trello Epics `8-13` so the new work continues after the completed historical Epics `1-7`.

Trello is a mirrored planning surface for visibility and collaboration. If local files and Trello disagree, update the local BMAD files first and rerun the sync.

## Trello Mapping

The script creates or reuses these Trello lists:

- `Core Docs`
- `Backlog`
- `Ready for Dev`
- `In Progress`
- `Review`
- `Done`
- `Optional`

The script also creates and manages visual labels:

- Type labels: `Type: Doc`, `Type: Epic`, `Type: Story`, `Type: Retro`
- Epic labels: `Epic 1`, `Epic 2`, ... generated from the epic numbers present in the local BMAD files

These managed labels are deterministic and rerunnable. The sync may add or remove only the labels it owns. Any other manual labels you add in Trello are left alone.

Each BMAD item becomes a Trello card:

- Core documents become cards such as `Doc: PRD`, `Doc: Architecture Decision Document`, and `Doc: Publication Cadence Policy`
- Epic entries like `epic-1` become cards such as `Epic 1: Publish a Safe Analytical MVP Slice`
- Story entries like `1-1-set-up-the-initial-project-from-the-approved-astro-starter` become cards such as `Story 1.1: Set Up the Initial Project from the Approved Astro Starter`
- Retrospective entries like `epic-1-retrospective` become cards such as `Epic 1 Retrospective`

Each mirrored card receives:

- one type label
- one epic label when the card belongs to a specific epic

The card description now starts with a short human-readable summary and a project-state section so the board is easier to scan. A small managed block is still kept at the bottom with the BMAD key, sync state, Trello list, and local source reference. Manual notes are preserved below the script-managed section.

The `Core Docs` list is curated from the project baseline documents:

- V2 rebaseline retrospective
- PRD v2
- architecture v2 delta
- epics v2
- V2 oversight map
- V2 scope decisions
- product brief
- PRD
- architecture
- UX design specification
- epic/story plan
- latest implementation readiness report
- publication cadence policy

Each Trello card now also gets one managed attachment:

- `Core Docs`: generated external-reader brief in Markdown
- `Epics`: generated executive brief in Markdown
- `Stories`: generated implementation brief in Markdown
- `Retrospectives`: generated retrospective brief in Markdown

These briefs are created from the local BMAD and planning artifacts and uploaded to Trello so someone outside the repo can understand what the card means without reconstructing project context from scratch.

## Credentials

Export these environment variables before running a live sync:

```bash
export TRELLO_API_KEY="your_api_key"
export TRELLO_API_TOKEN="your_api_token"
export TRELLO_BOARD_ID="your_board_id"
```

You can also copy `scripts/trello_hybrid_sync.env.example` into `scripts/trello_hybrid_sync.local.env` and let the scripts read it automatically.

## Usage

Dry run first:

```bash
python3 scripts/trello_hybrid_sync.py
```

Live sync:

```bash
python3 scripts/trello_hybrid_sync.py --apply
```

Dry run the V2 rebaseline mirror:

```bash
python3 scripts/trello_hybrid_sync.py --epics-file _bmad-output/planning-artifacts/epics-v2-trello.md --status-file _bmad-output/implementation-artifacts/sprint-status-v2.yaml --state-file _bmad-output/implementation-artifacts/trello-sync-state-v2.json
```

Live sync the V2 rebaseline mirror:

```bash
python3 scripts/trello_hybrid_sync.py --epics-file _bmad-output/planning-artifacts/epics-v2-trello.md --status-file _bmad-output/implementation-artifacts/sprint-status-v2.yaml --state-file _bmad-output/implementation-artifacts/trello-sync-state-v2.json --apply
```

Live sync and archive Trello cards that no longer exist in BMAD:

```bash
python3 scripts/trello_hybrid_sync.py --apply --archive-missing
```

If you store secrets in `scripts/trello_hybrid_sync.local.env`, the sync can run without passing credentials on the command line:

```bash
python3 scripts/trello_hybrid_sync.py --apply
```

## State File

On live sync, the script writes a local mapping file here:

```text
_bmad-output/implementation-artifacts/trello-sync-state.json
```

This mapping helps the script reconnect BMAD items to Trello card ids across reruns.

The V2 rebaseline mirror writes a separate state file:

```text
_bmad-output/implementation-artifacts/trello-sync-state-v2.json
```

Latest V2 live sync snapshot:

- sync timestamp: `2026-04-15T17:31:53Z`
- managed V2 items in state file: `50`
- latest Trello result: `0` cards created, `3` cards updated, `47` unchanged, `0` archived
- initial V2 Trello load: `43` cards created, `7` existing Core Docs updated, `0` archived
- generated V2 card briefs: `43`
- current active Trello focus: `Epic 10: Finish Semantic Model And Power BI Dashboard`
- current active story: `Story 10.1: Sync Missing Tables Into Semantic Model`

## Autosync Sweep

The repo now includes a watcher at `scripts/trello_hybrid_watch.py`.

It watches the BMAD source-of-truth files that actually drive the board:

- `_bmad-output/planning-artifacts/epics.md`
- curated core planning docs such as the product brief, PRD, architecture, UX spec, latest readiness report, and publication cadence policy
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/*.md`

When those files change, the watcher waits for a short quiet period and then reruns the live Trello sync automatically.

Run one initial sweep and stay watching:

```bash
python3 scripts/trello_hybrid_watch.py
```

Run the initial sweep once and exit:

```bash
python3 scripts/trello_hybrid_watch.py --once
```

Run the V2 mirror watcher once and exit:

```bash
python3 scripts/trello_hybrid_watch.py --epics-file _bmad-output/planning-artifacts/epics-v2-trello.md --status-file _bmad-output/implementation-artifacts/sprint-status-v2.yaml --state-file _bmad-output/implementation-artifacts/trello-sync-state-v2.json --once
```

Tune the watch loop:

```bash
python3 scripts/trello_hybrid_watch.py --interval-seconds 2 --debounce-seconds 4
```

## macOS Background Mode

For a persistent background watcher on macOS, use:

```text
scripts/trello_hybrid_watch.launchd.plist.template
```

Recommended flow:

1. Copy the template to `~/Library/LaunchAgents/com.manuel.fabric-bmad.trello-watch.plist`
2. Replace `&lt;REPO_ROOT&gt;` with your project path
3. Replace `&lt;PYTHON3_PATH&gt;` with your Python path, for example `/usr/bin/python3`
4. Load it with:

```bash
launchctl load ~/Library/LaunchAgents/com.manuel.fabric-bmad.trello-watch.plist
```

To restart after edits:

```bash
launchctl unload ~/Library/LaunchAgents/com.manuel.fabric-bmad.trello-watch.plist
launchctl load ~/Library/LaunchAgents/com.manuel.fabric-bmad.trello-watch.plist
```

The template logs to:

- `_bmad-output/implementation-artifacts/trello-watch.stdout.log`
- `_bmad-output/implementation-artifacts/trello-watch.stderr.log`

## Recommended Workflow

1. Update BMAD through the normal flow: sprint planning, create story, dev story, code review.
2. Either rerun `python3 scripts/trello_hybrid_sync.py --apply` manually or keep `python3 scripts/trello_hybrid_watch.py` running.
3. Use Trello for visibility, manual notes, comments, and lightweight coordination.
4. Avoid changing card names or moving cards as the source of truth. The next sync will overwrite mirrored fields.

## Current Limitation

This implementation is intentionally local-first. It mirrors BMAD into Trello, but it does not pull Trello status changes back into `sprint-status.yaml`.
