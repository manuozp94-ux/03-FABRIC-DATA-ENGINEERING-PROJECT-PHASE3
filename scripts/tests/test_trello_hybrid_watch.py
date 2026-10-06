from __future__ import annotations

import importlib.util
from pathlib import Path
from types import SimpleNamespace
import sys
import tempfile
import unittest
from unittest import mock


SCRIPTS_DIR = Path(__file__).resolve().parents[1]
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

MODULE_PATH = SCRIPTS_DIR / "trello_hybrid_watch.py"
SPEC = importlib.util.spec_from_file_location("trello_hybrid_watch", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = MODULE
assert SPEC.loader is not None
SPEC.loader.exec_module(MODULE)


class TrelloHybridWatchTests(unittest.TestCase):
    def test_build_sync_command_uses_current_sync_script(self) -> None:
        args = SimpleNamespace(
            env_file="/tmp/trello.env",
            epics_file="/tmp/epics.md",
            status_file="/tmp/sprint-status.yaml",
            state_file="/tmp/trello-sync-state.json",
            archive_missing=True,
        )

        command = MODULE.build_sync_command(args)

        self.assertEqual(command[0], sys.executable)
        self.assertEqual(command[1], str(MODULE.SYNC_SCRIPT_PATH))
        self.assertIn("--apply", command)
        self.assertIn("--archive-missing", command)

    def test_run_sync_shells_out_to_fresh_sync_process(self) -> None:
        args = SimpleNamespace(
            env_file="/tmp/trello.env",
            epics_file="/tmp/epics.md",
            status_file="/tmp/sprint-status.yaml",
            state_file="/tmp/trello-sync-state.json",
            archive_missing=False,
        )

        with mock.patch.object(MODULE.subprocess, "run") as mock_run:
            mock_run.return_value = SimpleNamespace(returncode=0)

            result = MODULE.run_sync(args)

        self.assertEqual(result, 0)
        mock_run.assert_called_once()
        called_command = mock_run.call_args.args[0]
        self.assertEqual(called_command[0], sys.executable)
        self.assertEqual(called_command[1], str(MODULE.SYNC_SCRIPT_PATH))
        self.assertEqual(mock_run.call_args.kwargs["cwd"], MODULE.REPO_ROOT)
        self.assertFalse(mock_run.call_args.kwargs["check"])

    def test_should_watch_only_bmad_driving_files(self) -> None:
        epics_path = Path("/tmp/epics.md")
        status_path = Path("/tmp/sprint-status.yaml")

        self.assertTrue(MODULE.should_watch(epics_path, epics_path=epics_path, status_path=status_path))
        self.assertTrue(MODULE.should_watch(status_path, epics_path=epics_path, status_path=status_path))
        self.assertTrue(
            MODULE.should_watch(
                Path("/tmp/implementation-artifacts/1-1-story.md"),
                epics_path=epics_path,
                status_path=Path("/tmp/implementation-artifacts/sprint-status.yaml"),
            )
        )
        self.assertFalse(
            MODULE.should_watch(
                Path("/tmp/implementation-artifacts/trello-sync-state.json"),
                epics_path=epics_path,
                status_path=Path("/tmp/implementation-artifacts/sprint-status.yaml"),
            )
        )
        self.assertFalse(
            MODULE.should_watch(
                Path("/tmp/planning-artifacts/prd.md"),
                epics_path=epics_path,
                status_path=status_path,
            )
        )

    def test_summarize_changes_reports_added_changed_removed(self) -> None:
        before = {
            "/tmp/a.md": MODULE.FileStamp(size=10, mtime_ns=1),
            "/tmp/b.md": MODULE.FileStamp(size=20, mtime_ns=2),
        }
        after = {
            "/tmp/b.md": MODULE.FileStamp(size=21, mtime_ns=3),
            "/tmp/c.md": MODULE.FileStamp(size=5, mtime_ns=4),
        }

        summary = MODULE.summarize_changes(before, after)

        self.assertIn("added 1", summary)
        self.assertIn("changed 1", summary)
        self.assertIn("removed 1", summary)

    def test_scan_watch_files_discovers_relevant_files_only(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            planning = root / "planning-artifacts"
            implementation = root / "implementation-artifacts"
            planning.mkdir()
            implementation.mkdir()

            epics_path = planning / "epics.md"
            status_path = implementation / "sprint-status.yaml"
            story_path = implementation / "1-1-story.md"
            ignored_state = implementation / "trello-sync-state.json"
            irrelevant_doc = planning / "architecture.md"

            epics_path.write_text("## Epic 1: Demo\n", encoding="utf-8")
            status_path.write_text("development_status:\n", encoding="utf-8")
            story_path.write_text("# Story\n", encoding="utf-8")
            ignored_state.write_text("{}", encoding="utf-8")
            irrelevant_doc.write_text("# Architecture\n", encoding="utf-8")

            snapshot = MODULE.scan_watch_files([planning, implementation], epics_path=epics_path, status_path=status_path)

            self.assertEqual(set(snapshot.keys()), {str(epics_path.resolve()), str(status_path.resolve()), str(story_path.resolve())})


if __name__ == "__main__":
    unittest.main()
