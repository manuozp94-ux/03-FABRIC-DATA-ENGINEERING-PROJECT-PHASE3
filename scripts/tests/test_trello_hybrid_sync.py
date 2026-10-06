from __future__ import annotations

import importlib.util
from pathlib import Path
import sys
import tempfile
import textwrap
import unittest


MODULE_PATH = Path(__file__).resolve().parents[1] / "trello_hybrid_sync.py"
SPEC = importlib.util.spec_from_file_location("trello_hybrid_sync", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = MODULE
assert SPEC.loader is not None
SPEC.loader.exec_module(MODULE)


class TrelloHybridSyncTests(unittest.TestCase):
    def test_parse_epics_extracts_titles_and_briefs(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            epics_path = Path(tmp_dir) / "epics.md"
            epics_path.write_text(
                textwrap.dedent(
                    """
                    ## Epic 1: Launch the Core Experience
                    The public site should make the portfolio legible to hiring and consulting audiences.

                    ### Story 1.1: Build the Landing Page (FR1)
                    As a hiring manager,
                    I want a landing page that explains the portfolio quickly,
                    So that I can judge whether the case study is relevant.
                    """
                ).strip()
                + "\n",
                encoding="utf-8",
            )

            epic_titles, story_titles, epic_briefs, story_briefs = MODULE.parse_epics(epics_path)

            self.assertEqual(epic_titles[1], "Launch the Core Experience")
            self.assertEqual(story_titles["1-1"], "Build the Landing Page")
            self.assertEqual(
                epic_briefs[1],
                "The public site should make the portfolio legible to hiring and consulting audiences.",
            )
            self.assertEqual(
                story_briefs["1-1"],
                "A landing page that explains the portfolio quickly so that I can judge whether the case study is relevant.",
            )

    def test_parse_sprint_status_preserves_order_and_normalizes_legacy_status(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            status_path = Path(tmp_dir) / "sprint-status.yaml"
            status_path.write_text(
                textwrap.dedent(
                    """
                    generated: 2026-03-28T12:23:02-0600
                    project: Demo
                    development_status:
                      epic-1: contexted
                      1-1-build-the-landing-page: drafted
                      epic-1-retrospective: optional
                    """
                ).strip()
                + "\n",
                encoding="utf-8",
            )

            metadata, development_status = MODULE.parse_sprint_status(status_path)

            self.assertEqual(metadata["project"], "Demo")
            self.assertEqual(
                list(development_status.keys()),
                ["epic-1", "1-1-build-the-landing-page", "epic-1-retrospective"],
            )
            self.assertEqual(development_status["epic-1"], "in-progress")
            self.assertEqual(development_status["1-1-build-the-landing-page"], "ready-for-dev")

    def test_compose_description_preserves_manual_notes(self) -> None:
        item = MODULE.SyncItem(
            key="1-1-build-the-landing-page",
            item_type="story",
            status="ready-for-dev",
            title="Build the Landing Page",
            brief="Create the first public route so the project has a stable visible entry point.",
            epic_number=1,
            story_number=1,
            source_path="_bmad-output/implementation-artifacts/1-1-build-the-landing-page.md",
            order_index=1,
        )
        progress = MODULE.build_progress_snapshot([item])
        existing_description = textwrap.dedent(
            """
            [BMAD Sync Managed Block]
            BMAD_KEY: 1-1-build-the-landing-page

            ---
            Manual Notes Below This Line
            Keep this note.
            """
        ).strip()

        composed = MODULE.compose_description(
            item,
            existing_description=existing_description,
            synced_at_utc="2026-03-28T18:30:00Z",
            status_path=MODULE.DEFAULT_STATUS_FILE,
            epics_path=MODULE.DEFAULT_EPICS_FILE,
            progress=progress,
        )

        self.assertIn("Summary: Create the first public route so the project has a stable visible entry point.", composed)
        self.assertIn("- Card state: Ready for Dev", composed)
        self.assertIn("SYNC_STATE: ready-for-dev", composed)
        self.assertIn("Keep this note.", composed)
        self.assertIn(MODULE.MANUAL_NOTES_HEADER, composed)

    def test_compose_description_is_stable_across_sync_timestamps(self) -> None:
        item = MODULE.SyncItem(
            key="1-1-build-the-landing-page",
            item_type="story",
            status="ready-for-dev",
            title="Build the Landing Page",
            brief="Create the first public route so the project has a stable visible entry point.",
            epic_number=1,
            story_number=1,
            source_path="_bmad-output/implementation-artifacts/1-1-build-the-landing-page.md",
            order_index=1,
        )
        progress = MODULE.build_progress_snapshot([item])

        first = MODULE.compose_description(
            item,
            existing_description="",
            synced_at_utc="2026-03-28T18:30:00Z",
            status_path=MODULE.DEFAULT_STATUS_FILE,
            epics_path=MODULE.DEFAULT_EPICS_FILE,
            progress=progress,
        )
        second = MODULE.compose_description(
            item,
            existing_description="",
            synced_at_utc="2026-03-29T18:30:00Z",
            status_path=MODULE.DEFAULT_STATUS_FILE,
            epics_path=MODULE.DEFAULT_EPICS_FILE,
            progress=progress,
        )

        self.assertEqual(first, second)

    def test_sync_item_exposes_expected_visual_labels(self) -> None:
        story_item = MODULE.SyncItem(
            key="2-1-establish-navigation",
            item_type="story",
            status="ready-for-dev",
            title="Establish Navigation",
            brief="Create the main route structure for the case-study experience.",
            epic_number=2,
            story_number=1,
            source_path="_bmad-output/implementation-artifacts/2-1-establish-navigation.md",
            order_index=1,
        )
        retro_item = MODULE.SyncItem(
            key="epic-2-retrospective",
            item_type="retrospective",
            status="optional",
            title="Retrospective for Epic 2",
            brief="Capture lessons from the epic.",
            epic_number=2,
            story_number=None,
            source_path=None,
            order_index=2,
        )
        doc_item = MODULE.SyncItem(
            key="doc-prd",
            item_type="document",
            status="reference",
            title="PRD",
            brief="Defines the project requirements.",
            epic_number=None,
            story_number=None,
            source_path="_bmad-output/planning-artifacts/prd.md",
            order_index=3,
        )

        self.assertEqual(story_item.desired_label_names, ["Type: Story", "Epic 2"])
        self.assertEqual(retro_item.desired_label_names, ["Type: Retro", "Epic 2"])
        self.assertEqual(doc_item.desired_label_names, ["Type: Doc"])
        self.assertEqual(doc_item.list_name, MODULE.CORE_DOCS_LIST)
        self.assertEqual(doc_item.card_name, "Doc: PRD")

    def test_build_managed_label_specs_includes_type_epic_and_doc_labels(self) -> None:
        items = [
            MODULE.SyncItem(
                key="doc-prd",
                item_type="document",
                status="reference",
                title="PRD",
                brief="Requirements baseline.",
                epic_number=None,
                story_number=None,
                source_path="_bmad-output/planning-artifacts/prd.md",
                order_index=1,
            ),
            MODULE.SyncItem(
                key="epic-1",
                item_type="epic",
                status="backlog",
                title="Launch",
                brief="Launch the public surface.",
                epic_number=1,
                story_number=None,
                source_path=None,
                order_index=2,
            ),
            MODULE.SyncItem(
                key="3-1-frame-the-problem",
                item_type="story",
                status="backlog",
                title="Frame the Problem",
                brief="Explain the business case.",
                epic_number=3,
                story_number=1,
                source_path="_bmad-output/implementation-artifacts/3-1-frame-the-problem.md",
                order_index=3,
            ),
        ]

        specs = MODULE.build_managed_label_specs(items)

        self.assertEqual(specs["Type: Doc"], "purple")
        self.assertEqual(specs["Type: Epic"], "blue")
        self.assertEqual(specs["Type: Story"], "green")
        self.assertEqual(specs["Type: Retro"], "orange")
        self.assertEqual(specs["Epic 1"], "sky")
        self.assertEqual(specs["Epic 3"], "yellow")

    def test_build_core_document_items_uses_latest_matching_report(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            (root / "_bmad-output/planning-artifacts").mkdir(parents=True, exist_ok=True)
            (root / "docs/automation").mkdir(parents=True, exist_ok=True)

            for relative_path in [
                "_bmad-output/planning-artifacts/product-brief-FABRIC_PLATFORM_DEV_BMAD-2026-03-20.md",
                "_bmad-output/planning-artifacts/prd.md",
                "_bmad-output/planning-artifacts/architecture.md",
                "_bmad-output/planning-artifacts/ux-design-specification.md",
                "_bmad-output/planning-artifacts/epics.md",
                "_bmad-output/planning-artifacts/implementation-readiness-report-2026-03-27.md",
                "_bmad-output/planning-artifacts/implementation-readiness-report-2026-03-28.md",
                "docs/automation/publication-cadence-policy.md",
            ]:
                path = root / relative_path
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text("# Placeholder\n", encoding="utf-8")

            items = MODULE.build_core_document_items(repo_root=root, start_order_index=10)

            self.assertEqual(len(items), 7)
            readiness_item = next(item for item in items if item.key == "doc-implementation-readiness")
            self.assertEqual(
                readiness_item.source_path,
                "_bmad-output/planning-artifacts/implementation-readiness-report-2026-03-28.md",
            )
            self.assertEqual(items[0].order_index, 10)
            self.assertEqual(items[-1].card_name, "Doc: Publication Cadence Policy")

    def test_build_sync_items_classifies_story_epic_retrospective_and_docs(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            epics_path = root / "_bmad-output/planning-artifacts/epics.md"
            status_path = root / "_bmad-output/implementation-artifacts/sprint-status.yaml"
            epics_path.parent.mkdir(parents=True, exist_ok=True)
            status_path.parent.mkdir(parents=True, exist_ok=True)
            (root / "docs/automation").mkdir(parents=True, exist_ok=True)
            (root / "_bmad-output/implementation-artifacts").mkdir(parents=True, exist_ok=True)

            epics_path.write_text(
                textwrap.dedent(
                    """
                    ## Epic 2: Public Experience
                    Create the public proof surface.

                    ### Story 2.1: Establish Navigation (FR5)
                    As a visitor,
                    I want a stable route structure,
                    So that I can move through the case study easily.
                    """
                ).strip()
                + "\n",
                encoding="utf-8",
            )
            status_path.write_text(
                textwrap.dedent(
                    """
                    generated: 2026-03-28T12:23:02-0600
                    project: Demo
                    development_status:
                      epic-2: backlog
                      2-1-establish-navigation: ready-for-dev
                      epic-2-retrospective: optional
                    """
                ).strip()
                + "\n",
                encoding="utf-8",
            )

            for relative_path in [
                "_bmad-output/planning-artifacts/product-brief-FABRIC_PLATFORM_DEV_BMAD-2026-03-20.md",
                "_bmad-output/planning-artifacts/prd.md",
                "_bmad-output/planning-artifacts/architecture.md",
                "_bmad-output/planning-artifacts/ux-design-specification.md",
                "_bmad-output/planning-artifacts/implementation-readiness-report-2026-03-28.md",
                "docs/automation/publication-cadence-policy.md",
            ]:
                path = root / relative_path
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text("# Placeholder\n", encoding="utf-8")

            _, _, items = MODULE.build_sync_items(
                epics_path,
                status_path,
                repo_root=root,
                include_core_documents=True,
            )

            self.assertEqual([item.item_type for item in items[:3]], ["epic", "story", "retrospective"])
            self.assertEqual(items[0].card_name, "Epic 2: Public Experience")
            self.assertEqual(items[1].card_name, "Story 2.1: Establish Navigation")
            self.assertEqual(items[2].list_name, "Optional")
            self.assertEqual(items[3].list_name, MODULE.CORE_DOCS_LIST)
            self.assertEqual(items[3].card_name, "Doc: Product Brief")

    def test_build_reader_brief_content_includes_project_and_source_context(self) -> None:
        definition = MODULE.CoreDocumentDefinition(
            key="doc-prd",
            title="PRD",
            relative_glob="_bmad-output/planning-artifacts/prd.md",
            brief="Defines the product scope and requirements.",
            reader_focus="Use this to understand the bounded product commitments.",
            read_next=("Architecture Decision Document", "Epic and Story Plan"),
        )
        progress = MODULE.ProgressSnapshot(
            total_stories=10,
            done_stories=6,
            epic_statuses={1: "done", 2: "in-progress"},
            epic_story_totals={1: 6, 2: 4},
            epic_story_done={1: 6, 2: 0},
            current_focus="Story 2.1: Establish Navigation",
            next_backlog="Story 2.2: Publish the Landing Page Orientation",
            epic_current_focus={2: "Story 2.1: Establish Navigation"},
            epic_next_backlog={2: "Story 2.2: Publish the Landing Page Orientation"},
        )
        source_text = textwrap.dedent(
            """
            ---
            author: Demo
            ---

            # Product Requirements Document

            This document defines the bounded public MVP.

            ## Scope

            ## Constraints
            """
        ).strip() + "\n"

        content = MODULE.build_reader_brief_content(
            definition,
            source_path="_bmad-output/planning-artifacts/prd.md",
            source_text=source_text,
            progress=progress,
        )

        self.assertIn("# External Brief: PRD", content)
        self.assertIn("Overall delivery progress: 6/10 stories done", content)
        self.assertIn("Current project focus: Story 2.1: Establish Navigation", content)
        self.assertIn("This document defines the bounded public MVP.", content)
        self.assertIn("- ## Scope", content)
        self.assertIn("- Architecture Decision Document", content)

    def test_build_managed_attachments_writes_reader_briefs(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            source_path = root / "_bmad-output/planning-artifacts/prd.md"
            source_path.parent.mkdir(parents=True, exist_ok=True)
            source_path.write_text(
                textwrap.dedent(
                    """
                    # PRD

                    This is the opening paragraph.

                    ## Scope
                    """
                ).strip() + "\n",
                encoding="utf-8",
            )
            output_dir = root / "_bmad-output/test-artifacts/trello-card-briefs"
            items = [
                MODULE.SyncItem(
                    key="doc-prd",
                    item_type="document",
                    status="reference",
                    title="PRD",
                    brief="Defines the project requirements.",
                    epic_number=None,
                    story_number=None,
                    source_path="_bmad-output/planning-artifacts/prd.md",
                    order_index=1,
                )
            ]

            attachments = MODULE.build_managed_attachments(items, repo_root=root, output_dir=output_dir)

            self.assertIn("doc-prd", attachments)
            attachment = attachments["doc-prd"]
            self.assertTrue(attachment.filename.startswith("managed-external-reader-brief-doc-prd-"))
            self.assertEqual(attachment.local_path, output_dir / "doc-prd-external-reader-brief.md")
            self.assertTrue(attachment.local_path.exists())
            self.assertIn("External Brief: PRD", attachment.local_path.read_text(encoding="utf-8"))
            self.assertIn("This is the opening paragraph.", attachment.local_path.read_text(encoding="utf-8"))

    def test_build_managed_attachments_creates_epic_and_retro_briefs(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            retro_path = root / "_bmad-output/implementation-artifacts/epic-1-retro-2026-03-29.md"
            retro_path.parent.mkdir(parents=True, exist_ok=True)
            retro_path.write_text(
                textwrap.dedent(
                    """
                    # Epic 1 Retrospective

                    ## Intended Outcome

                    Lock the governed publication spine.

                    ## What We Completed

                    - Story 1.1 established the repo.
                    - Story 1.2 published dimensions.

                    ## Action Items

                    - Owner: Engineering
                      Keep sync boundaries explicit.
                    """
                ).strip() + "\n",
                encoding="utf-8",
            )
            output_dir = root / "_bmad-output/test-artifacts/trello-card-briefs"
            items = [
                MODULE.SyncItem(
                    key="epic-1",
                    item_type="epic",
                    status="done",
                    title="Publish a Safe Analytical MVP Slice",
                    brief="Produce one bounded publication-safe analytical package.",
                    epic_number=1,
                    story_number=None,
                    source_path=None,
                    order_index=1,
                ),
                MODULE.SyncItem(
                    key="1-1-establish-baseline",
                    item_type="story",
                    status="done",
                    title="Establish Baseline",
                    brief="Set the initial project boundary.",
                    epic_number=1,
                    story_number=1,
                    source_path=None,
                    order_index=2,
                ),
                MODULE.SyncItem(
                    key="epic-1-retrospective",
                    item_type="retrospective",
                    status="done",
                    title="Retrospective for Epic 1",
                    brief="Capture what worked and what to improve.",
                    epic_number=1,
                    story_number=None,
                    source_path="_bmad-output/implementation-artifacts/epic-1-retro-2026-03-29.md",
                    order_index=3,
                ),
            ]

            attachments = MODULE.build_managed_attachments(items, repo_root=root, output_dir=output_dir)

            self.assertIn("epic-1", attachments)
            self.assertIn("epic-1-retrospective", attachments)
            epic_attachment = attachments["epic-1"]
            retro_attachment = attachments["epic-1-retrospective"]
            self.assertTrue(epic_attachment.filename.startswith("managed-executive-brief-epic-1-"))
            self.assertTrue(retro_attachment.filename.startswith("managed-retrospective-brief-epic-1-retrospective-"))
            self.assertIn(
                "Executive Brief: Epic 1: Publish a Safe Analytical MVP Slice",
                epic_attachment.local_path.read_text(encoding="utf-8"),
            )
            self.assertIn(
                "Retrospective Brief: Epic 1 Retrospective",
                retro_attachment.local_path.read_text(encoding="utf-8"),
            )
            self.assertIn("Keep sync boundaries explicit.", retro_attachment.local_path.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
