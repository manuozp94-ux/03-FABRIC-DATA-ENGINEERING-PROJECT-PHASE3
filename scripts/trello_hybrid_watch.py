#!/usr/bin/env python3
"""Watch BMAD source-of-truth artifacts and rerun Trello sync automatically."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
import subprocess
import sys
import time
from typing import Iterable

import trello_hybrid_sync as sync


REPO_ROOT = Path(__file__).resolve().parents[1]
SYNC_SCRIPT_PATH = REPO_ROOT / "scripts/trello_hybrid_sync.py"
DEFAULT_WATCH_ROOTS = [
    REPO_ROOT / "_bmad-output/planning-artifacts",
    REPO_ROOT / "_bmad-output/implementation-artifacts",
    REPO_ROOT / "docs/automation",
]
IGNORED_NAMES = {
    "trello-sync-state.json",
    "trello-watch-state.json",
}


@dataclass(frozen=True)
class FileStamp:
    size: int
    mtime_ns: int


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Continuously watch BMAD artifacts and rerun the Trello hybrid sync when they change."
    )
    parser.add_argument("--env-file", default=str(sync.DEFAULT_ENV_FILE), help="Optional env file with Trello credentials")
    parser.add_argument("--epics-file", default=str(sync.DEFAULT_EPICS_FILE), help="Path to epics.md")
    parser.add_argument("--status-file", default=str(sync.DEFAULT_STATUS_FILE), help="Path to sprint-status.yaml")
    parser.add_argument("--state-file", default=str(sync.DEFAULT_STATE_FILE), help="Path to the Trello sync state JSON")
    parser.add_argument(
        "--watch-root",
        action="append",
        default=[],
        help="Additional root to watch. Defaults cover planning-artifacts and implementation-artifacts.",
    )
    parser.add_argument("--interval-seconds", type=float, default=2.0, help="Polling interval while idle")
    parser.add_argument("--debounce-seconds", type=float, default=4.0, help="Quiet period before rerunning sync after changes")
    parser.add_argument("--archive-missing", action="store_true", help="Archive managed Trello cards removed from BMAD")
    parser.add_argument("--no-initial-sync", action="store_true", help="Skip the first full sync when the watcher starts")
    parser.add_argument("--once", action="store_true", help="Run one full sync and exit")
    return parser.parse_args(argv)


def should_watch(path: Path, *, epics_path: Path, status_path: Path) -> bool:
    if path.name in IGNORED_NAMES:
        return False
    if path == epics_path or path == status_path:
        return True
    if path.parent == status_path.parent and path.suffix == ".md":
        return True
    try:
        relative_path = str(path.resolve().relative_to(REPO_ROOT))
    except ValueError:
        return False
    for definition in sync.CORE_DOCUMENT_DEFINITIONS:
        if Path(relative_path).match(definition.relative_glob):
            return True
    return False


def scan_watch_files(roots: Iterable[Path], *, epics_path: Path, status_path: Path) -> dict[str, FileStamp]:
    snapshot: dict[str, FileStamp] = {}
    for root in roots:
        if root.is_file():
            candidates = [root]
        elif root.exists():
            candidates = [candidate for candidate in root.rglob("*") if candidate.is_file()]
        else:
            continue

        for candidate in candidates:
            if not should_watch(candidate, epics_path=epics_path, status_path=status_path):
                continue
            stat = candidate.stat()
            snapshot[str(candidate.resolve())] = FileStamp(size=stat.st_size, mtime_ns=stat.st_mtime_ns)
    return snapshot


def summarize_changes(previous: dict[str, FileStamp], current: dict[str, FileStamp]) -> str:
    added = sorted(set(current) - set(previous))
    removed = sorted(set(previous) - set(current))
    changed = sorted(
        path
        for path in set(previous) & set(current)
        if previous[path] != current[path]
    )
    parts: list[str] = []
    if added:
        parts.append(f"added {len(added)}")
    if changed:
        parts.append(f"changed {len(changed)}")
    if removed:
        parts.append(f"removed {len(removed)}")
    return ", ".join(parts) if parts else "no file changes"


def build_sync_command(args: argparse.Namespace) -> list[str]:
    command = [
        sys.executable,
        str(SYNC_SCRIPT_PATH),
        "--apply",
        "--env-file",
        args.env_file,
        "--epics-file",
        args.epics_file,
        "--status-file",
        args.status_file,
        "--state-file",
        args.state_file,
    ]
    if args.archive_missing:
        command.append("--archive-missing")
    return command


def run_sync(args: argparse.Namespace) -> int:
    result = subprocess.run(build_sync_command(args), cwd=REPO_ROOT, check=False)
    return result.returncode


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    epics_path = Path(args.epics_file).resolve()
    status_path = Path(args.status_file).resolve()
    watch_roots = [Path(root).resolve() for root in (args.watch_root or [])] or DEFAULT_WATCH_ROOTS

    initial_snapshot = scan_watch_files(watch_roots, epics_path=epics_path, status_path=status_path)
    print(f"[{utc_now()}] Watching {len(watch_roots)} roots and {len(initial_snapshot)} BMAD files for Trello sync.")

    if not args.no_initial_sync:
        print(f"[{utc_now()}] Running initial full sweep sync.")
        result = run_sync(args)
        if result != 0:
            return result
    if args.once:
        return 0

    previous_snapshot = initial_snapshot
    pending_since: float | None = None
    pending_summary = ""

    while True:
        current_snapshot = scan_watch_files(watch_roots, epics_path=epics_path, status_path=status_path)
        if current_snapshot != previous_snapshot:
            pending_since = time.time()
            pending_summary = summarize_changes(previous_snapshot, current_snapshot)
            previous_snapshot = current_snapshot
            print(f"[{utc_now()}] Change detected: {pending_summary}. Waiting for quiet period.")
            time.sleep(args.interval_seconds)
            continue

        if pending_since is not None and (time.time() - pending_since) >= args.debounce_seconds:
            print(f"[{utc_now()}] Quiet period reached after {pending_summary}. Running Trello sync.")
            result = run_sync(args)
            if result != 0:
                return result
            pending_since = None
            pending_summary = ""

        time.sleep(args.interval_seconds)


if __name__ == "__main__":
    raise SystemExit(main())
