#!/usr/bin/env python3
"""Mirror BMAD sprint tracking into Trello while keeping local files authoritative."""

from __future__ import annotations

import argparse
from collections import OrderedDict
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime, timezone
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import sys
from typing import Any
from urllib import error, parse, request


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_EPICS_FILE = REPO_ROOT / "_bmad-output/planning-artifacts/epics.md"
DEFAULT_STATUS_FILE = REPO_ROOT / "_bmad-output/implementation-artifacts/sprint-status.yaml"
DEFAULT_STATE_FILE = REPO_ROOT / "_bmad-output/implementation-artifacts/trello-sync-state.json"
DEFAULT_ENV_FILE = REPO_ROOT / "scripts/trello_hybrid_sync.local.env"
DEFAULT_CARD_BRIEFS_DIR = REPO_ROOT / "_bmad-output/test-artifacts/trello-card-briefs"
DEFAULT_LOCK_FILE = REPO_ROOT / "_bmad-output/implementation-artifacts/trello-sync.lock"

MANUAL_NOTES_HEADER = "---\nManual Notes Below This Line\n"
LEGACY_STATUS_MAP = {
    "drafted": "ready-for-dev",
    "contexted": "in-progress",
}
CORE_DOCS_LIST = "Core Docs"
STATUS_TO_LIST = {
    "backlog": "Backlog",
    "ready-for-dev": "Ready for Dev",
    "in-progress": "In Progress",
    "review": "Review",
    "done": "Done",
    "optional": "Optional",
}
REQUIRED_LISTS = [*STATUS_TO_LIST.values(), CORE_DOCS_LIST]
TYPE_SORT_ORDER = {
    "document": 0,
    "epic": 1,
    "story": 2,
    "retrospective": 3,
}
TYPE_LABEL_SPECS = {
    "document": ("Type: Doc", "purple"),
    "epic": ("Type: Epic", "blue"),
    "story": ("Type: Story", "green"),
    "retrospective": ("Type: Retro", "orange"),
}
EPIC_LABEL_COLORS = [
    "sky",
    "lime",
    "yellow",
    "pink",
    "black",
    "red",
    "purple",
    "orange",
    "green",
    "blue",
]


class SyncError(RuntimeError):
    """Raised when local BMAD artifacts or remote Trello state are invalid."""


def repo_relative_path(path: Path, repo_root: Path = REPO_ROOT) -> str:
    try:
        return str(path.resolve().relative_to(repo_root.resolve()))
    except ValueError:
        try:
            return str(path.relative_to(repo_root))
        except ValueError:
            return str(path)


@dataclass(frozen=True)
class ProgressSnapshot:
    total_stories: int
    done_stories: int
    epic_statuses: dict[int, str]
    epic_story_totals: dict[int, int]
    epic_story_done: dict[int, int]
    current_focus: str | None
    next_backlog: str | None
    epic_current_focus: dict[int, str | None]
    epic_next_backlog: dict[int, str | None]


@dataclass(frozen=True)
class CoreDocumentDefinition:
    key: str
    title: str
    relative_glob: str
    brief: str
    reader_focus: str
    read_next: tuple[str, ...]


@dataclass(frozen=True)
class SyncItem:
    key: str
    item_type: str
    status: str
    title: str
    brief: str
    epic_number: int | None
    story_number: int | None
    source_path: str | None
    order_index: int

    @property
    def list_name(self) -> str:
        if self.item_type == "document":
            return CORE_DOCS_LIST
        try:
            return STATUS_TO_LIST[self.status]
        except KeyError as exc:
            raise SyncError(f"Unsupported status '{self.status}' for item '{self.key}'.") from exc

    @property
    def card_name(self) -> str:
        if self.item_type == "document":
            return f"Doc: {self.title}"
        if self.item_type == "epic":
            assert self.epic_number is not None
            return f"Epic {self.epic_number}: {self.title}"
        if self.item_type == "story":
            assert self.epic_number is not None
            assert self.story_number is not None
            return f"Story {self.epic_number}.{self.story_number}: {self.title}"
        assert self.epic_number is not None
        return f"Epic {self.epic_number} Retrospective"

    @property
    def type_label(self) -> str:
        return self.item_type.replace("-", " ").title()

    @property
    def desired_label_names(self) -> list[str]:
        type_label_name, _ = TYPE_LABEL_SPECS[self.item_type]
        if self.epic_number is None:
            return [type_label_name]
        return [type_label_name, f"Epic {self.epic_number}"]

    def managed_description(
        self,
        synced_at_utc: str,
        status_path: Path,
        progress: ProgressSnapshot,
        *,
        all_items: list[SyncItem] | None = None,
        repo_root: Path = REPO_ROOT,
    ) -> str:
        lines = [
            f"Summary: {self.brief}",
            "",
            "Explicit Detail",
        ]
        lines.extend(build_explicit_detail_lines(self, progress=progress, all_items=all_items or [self], repo_root=repo_root))

        lines.extend(
            [
                "",
            "Project State",
            ]
        )

        if self.item_type == "document":
            lines.extend(
                [
                    "- Card state: Core reference document",
                    "- This document is part of the active project baseline and helps explain how the work is being planned, governed, or delivered.",
                ]
            )
        else:
            assert self.epic_number is not None
            epic_status = progress.epic_statuses.get(self.epic_number, "backlog")
            epic_done = progress.epic_story_done.get(self.epic_number, 0)
            epic_total = progress.epic_story_totals.get(self.epic_number, 0)

            if self.item_type == "epic":
                lines.extend(
                    [
                        f"- Epic state: {STATUS_TO_LIST[epic_status]}",
                        f"- Epic progress: {epic_done}/{epic_total} stories done",
                    ]
                )
                epic_focus = progress.epic_current_focus.get(self.epic_number)
                epic_backlog = progress.epic_next_backlog.get(self.epic_number)
                if epic_focus:
                    lines.append(f"- Current focus in this epic: {epic_focus}")
                elif epic_backlog:
                    lines.append(f"- Next story in this epic: {epic_backlog}")
            elif self.item_type == "story":
                lines.extend(
                    [
                        f"- Card state: {STATUS_TO_LIST[self.status]}",
                        f"- Epic state: {STATUS_TO_LIST[epic_status]} ({epic_done}/{epic_total} stories done in Epic {self.epic_number})",
                    ]
                )
            else:
                lines.extend(
                    [
                        f"- Card state: {STATUS_TO_LIST[self.status]}",
                        f"- Epic state: {STATUS_TO_LIST[epic_status]} ({epic_done}/{epic_total} stories done in Epic {self.epic_number})",
                        "- This retrospective becomes most useful once the epic is complete.",
                    ]
                )

        lines.append(f"- Overall progress: {progress.done_stories}/{progress.total_stories} stories done")
        if progress.current_focus:
            lines.append(f"- Current project focus: {progress.current_focus}")
        if progress.next_backlog:
            lines.append(f"- Next backlog item: {progress.next_backlog}")

        lines.extend(
            [
                "",
                "[BMAD Sync Managed Block]",
                f"BMAD_KEY: {self.key}",
                f"SYNC_STATE: {self.status}",
                f"TRELLO_LIST: {self.list_name}",
            ]
        )
        if self.item_type == "document":
            if self.source_path:
                lines.append(f"SOURCE_OF_TRUTH: {self.source_path}")
        else:
            lines.append(f"SOURCE_OF_TRUTH: {repo_relative_path(status_path, repo_root)}")
        if self.source_path and self.item_type != "document":
            lines.append(f"LOCAL_ITEM_FILE: {self.source_path}")
        return "\n".join(lines).strip()


@dataclass(frozen=True)
class ManagedAttachment:
    card_key: str
    filename: str
    content: bytes
    mime_type: str
    local_path: Path


CORE_DOCUMENT_DEFINITIONS = [
    CoreDocumentDefinition(
        key="doc-rebaseline-v2",
        title="V2 Rebaseline Retrospective",
        relative_glob="_bmad-output/planning-artifacts/project-rebaseline-retrospective-*.md",
        brief="Explains why the project needed a V2 rebaseline after the operating-loop scope grew beyond the original MVP plan.",
        reader_focus="Use this to understand what changed, why the old delivery map was no longer enough, and which assumptions were reset.",
        read_next=("PRD v2", "Architecture v2 Delta"),
    ),
    CoreDocumentDefinition(
        key="doc-prd-v2",
        title="PRD v2",
        relative_glob="_bmad-output/planning-artifacts/prd-v2-operating-loop-decision-system-*.md",
        brief="Defines the updated product scope for the operating-loop decision system, including dashboard, site, Fabric, and repo-release priorities.",
        reader_focus="Use this as the active product truth for the remaining work after the project moved from dashboard proof to governed operating-loop proof.",
        read_next=("Architecture v2 Delta", "Epics v2"),
    ),
    CoreDocumentDefinition(
        key="doc-architecture-v2",
        title="Architecture v2 Delta",
        relative_glob="_bmad-output/planning-artifacts/architecture-v2-operating-loop-delta-*.md",
        brief="Documents the architecture delta introduced by operational queues, executed events, dashboard subjects, and current-vs-target reconciliation boundaries.",
        reader_focus="Use this to understand the updated system shape and which parts are live, bounded, or target-state gaps.",
        read_next=("Epics v2", "V2 Oversight Map"),
    ),
    CoreDocumentDefinition(
        key="doc-epics-v2",
        title="Epics v2",
        relative_glob="_bmad-output/planning-artifacts/epics-v2-operating-loop-decision-system-*.md",
        brief="Breaks the V2 operating-loop work into governed epics and stories across integrity, semantic model, dashboard, site, repo release, and demo readiness.",
        reader_focus="Use this to understand the active implementation sequence and how each remaining workstream supports the public proof.",
        read_next=("V2 Oversight Map", "V2 Scope Decisions"),
    ),
    CoreDocumentDefinition(
        key="doc-oversight-v2",
        title="V2 Oversight Map",
        relative_glob="_bmad-output/planning-artifacts/oversight-map-v2-*.md",
        brief="Provides the current oversight map for sequencing, visible wins, open risks, and completion criteria after the V2 rebaseline.",
        reader_focus="Use this for day-to-day project steering and to decide what should happen next.",
        read_next=("V2 Scope Decisions", "Epics v2"),
    ),
    CoreDocumentDefinition(
        key="doc-scope-decisions-v2",
        title="V2 Scope Decisions",
        relative_glob="_bmad-output/planning-artifacts/scope-decisions-v2-*.md",
        brief="Records the active scope commitments: three existing phase-specific public repos, screenshots plus request access, strict reconciliation as a target-state gap, and interview-ready first.",
        reader_focus="Use this to keep scope from drifting while still preserving the core product narrative.",
        read_next=("PRD v2", "V2 Oversight Map"),
    ),
    CoreDocumentDefinition(
        key="doc-product-brief",
        title="Product Brief",
        relative_glob="_bmad-output/planning-artifacts/product-brief-FABRIC_PLATFORM_DEV_BMAD-*.md",
        brief="Captures the original problem framing, intended audience, and business direction before formal requirements were written.",
        reader_focus="Use this to understand the real-world problem, the intended audiences, and why this portfolio exists at all.",
        read_next=("PRD", "Architecture Decision Document"),
    ),
    CoreDocumentDefinition(
        key="doc-prd",
        title="PRD",
        relative_glob="_bmad-output/planning-artifacts/prd.md",
        brief="Defines the product scope, success criteria, functional requirements, and non-functional constraints for the portfolio.",
        reader_focus="Use this to see the committed scope, required behaviors, and delivery guardrails that the implementation must satisfy.",
        read_next=("Architecture Decision Document", "Epic and Story Plan"),
    ),
    CoreDocumentDefinition(
        key="doc-architecture",
        title="Architecture Decision Document",
        relative_glob="_bmad-output/planning-artifacts/architecture.md",
        brief="Sets the technical baseline, repo boundaries, delivery model, and implementation constraints for the project.",
        reader_focus="Use this to understand the technical shape of the solution, the repo boundaries, and the rules that keep the public proof safe.",
        read_next=("UX Design Specification", "Epic and Story Plan"),
    ),
    CoreDocumentDefinition(
        key="doc-ux-spec",
        title="UX Design Specification",
        relative_glob="_bmad-output/planning-artifacts/ux-design-specification.md",
        brief="Defines the public experience, content structure, interaction model, and design rules for the site.",
        reader_focus="Use this to understand the public reading sequence, route responsibilities, and how trust should be built through the site.",
        read_next=("Epic and Story Plan", "Publication Cadence Policy"),
    ),
    CoreDocumentDefinition(
        key="doc-epics",
        title="Epic and Story Plan",
        relative_glob="_bmad-output/planning-artifacts/epics.md",
        brief="Breaks the approved scope into epics and stories that can be built, reviewed, and tracked through BMAD.",
        reader_focus="Use this to understand the implementation roadmap, how work is being sequenced, and what each epic is meant to prove.",
        read_next=("Implementation Readiness Report", "Publication Cadence Policy"),
    ),
    CoreDocumentDefinition(
        key="doc-implementation-readiness",
        title="Implementation Readiness Report",
        relative_glob="_bmad-output/planning-artifacts/implementation-readiness-report-*.md",
        brief="Summarizes whether the planning set is coherent enough to begin implementation and where the main execution risks sit.",
        reader_focus="Use this to understand whether the planning set was implementation-ready and what risks were identified before execution began.",
        read_next=("Epic and Story Plan", "Publication Cadence Policy"),
    ),
    CoreDocumentDefinition(
        key="doc-publication-cadence",
        title="Publication Cadence Policy",
        relative_glob="docs/automation/publication-cadence-policy.md",
        brief="Defines the intended refresh and release rhythm so freshness claims stay governed, credible, and maintainable.",
        reader_focus="Use this to understand how refreshes, approvals, and public-facing freshness claims are meant to work over time.",
        read_next=("Epic and Story Plan", "PRD"),
    ),
]
CORE_DOCUMENT_DEFINITIONS_BY_KEY = {definition.key: definition for definition in CORE_DOCUMENT_DEFINITIONS}
PROJECT_PRIMER = (
    "This project is a bounded, publication-safe Microsoft Fabric portfolio and case-study platform. "
    "It demonstrates how a real operational analytics problem can be reshaped into a public proof surface "
    "without exposing private business structure, raw identifiers, or confidential source logic."
)


def resolve_latest_glob_match(repo_root: Path, relative_glob: str) -> Path | None:
    matches = sorted(repo_root.glob(relative_glob))
    if not matches:
        return None
    return matches[-1]


def strip_markdown_frontmatter(text: str) -> str:
    if not text.startswith("---\n"):
        return text
    end_index = text.find("\n---\n", 4)
    if end_index == -1:
        return text
    return text[end_index + 5 :]


def extract_markdown_headings(text: str, *, limit: int = 6) -> list[str]:
    headings: list[str] = []
    for line in strip_markdown_frontmatter(text).splitlines():
        match = re.match(r"^(#{1,3})\s+(.+?)\s*$", line.strip())
        if not match:
            continue
        level = len(match.group(1))
        title = match.group(2).strip()
        headings.append(f"{'#' * level} {title}")
        if len(headings) >= limit:
            break
    return headings


def extract_opening_paragraph(text: str) -> str:
    content = strip_markdown_frontmatter(text)
    paragraph_lines: list[str] = []
    for raw_line in content.splitlines():
        line = raw_line.strip()
        if not line:
            if paragraph_lines:
                break
            continue
        if line.startswith("#") or line.startswith("<!--"):
            if paragraph_lines:
                break
            continue
        paragraph_lines.append(line)
    return " ".join(paragraph_lines)


def extract_markdown_section(text: str, heading_title: str) -> str:
    lines = text.splitlines()
    start_index: int | None = None
    start_level: int | None = None

    for index, raw_line in enumerate(lines):
        match = re.match(r"^(#{1,6})\s+(.+?)\s*$", raw_line.strip())
        if not match:
            continue
        if match.group(2).strip() != heading_title:
            continue
        start_index = index + 1
        start_level = len(match.group(1))
        break

    if start_index is None or start_level is None:
        return ""

    collected: list[str] = []
    for raw_line in lines[start_index:]:
        match = re.match(r"^(#{1,6})\s+(.+?)\s*$", raw_line.strip())
        if match and len(match.group(1)) <= start_level:
            break
        collected.append(raw_line)
    return "\n".join(collected).strip()


def extract_bullets(section_text: str, *, limit: int = 4) -> list[str]:
    bullets: list[str] = []
    for raw_line in section_text.splitlines():
        line = raw_line.strip()
        if not line.startswith("- "):
            continue
        bullets.append(line[2:].strip())
        if len(bullets) >= limit:
            break
    return bullets


def extract_checkbox_items(section_text: str, *, checked: bool, limit: int = 4) -> list[str]:
    items: list[str] = []
    expected = "x" if checked else " "
    pattern = re.compile(r"^- \[([ xX])\]\s+(.+?)\s*$")
    for raw_line in section_text.splitlines():
        line = raw_line.strip()
        match = pattern.match(line)
        if not match:
            continue
        marker = match.group(1).lower()
        normalized = "x" if marker == "x" else " "
        if normalized != expected:
            continue
        items.append(match.group(2).strip())
        if len(items) >= limit:
            break
    return items


def extract_story_acceptance_criteria(text: str, *, limit: int = 4) -> list[str]:
    criteria: list[str] = []
    section = extract_markdown_section(text, "Acceptance Criteria")
    for raw_line in section.splitlines():
        line = raw_line.strip()
        match = re.match(r"^\d+\.\s+(.+?)\s*$", line)
        if not match:
            continue
        criteria.append(match.group(1).strip())
        if len(criteria) >= limit:
            break
    return criteria


def extract_retro_action_items(section_text: str, *, limit: int = 4) -> list[str]:
    action_items: list[str] = []
    owner: str | None = None
    for raw_line in section_text.splitlines():
        stripped = raw_line.strip()
        owner_match = re.match(r"^- Owner:\s*(.+?)\s*$", stripped)
        if owner_match:
            owner = owner_match.group(1).strip()
            continue
        if owner and stripped:
            action_items.append(f"{owner}: {stripped}")
            owner = None
            if len(action_items) >= limit:
                break
    return action_items


def build_document_detail_lines(item: SyncItem, *, repo_root: Path) -> list[str]:
    lines = [
        "- Card intent: Explain one core project document in a way an outside reader can use quickly.",
    ]
    definition = CORE_DOCUMENT_DEFINITIONS_BY_KEY.get(item.key)
    if definition is not None:
        lines.append(f"- Why this document matters: {definition.reader_focus}")
        if definition.read_next:
            lines.append(f"- Read next: {', '.join(definition.read_next)}")
    if item.source_path:
        lines.append(f"- Source file: {item.source_path}")
        source_path = repo_root / item.source_path
        if source_path.exists():
            source_text = load_text(source_path)
            opening_paragraph = extract_opening_paragraph(source_text)
            if opening_paragraph:
                lines.append(f"- Opening context: {opening_paragraph}")
            headings = extract_markdown_headings(source_text, limit=4)
            for heading in headings:
                lines.append(f"- Key section: {heading}")
    lines.append("- Attachment on this card: external-reader brief generated from the current source file")
    return lines


def build_epic_detail_lines(item: SyncItem, *, progress: ProgressSnapshot, all_items: list[SyncItem]) -> list[str]:
    assert item.epic_number is not None
    epic_stories = [entry for entry in all_items if entry.item_type == "story" and entry.epic_number == item.epic_number]
    done_stories = [entry.card_name for entry in epic_stories if entry.status == "done"]
    active_stories = [entry.card_name for entry in epic_stories if entry.status in {"in-progress", "review", "ready-for-dev"}]
    backlog_stories = [entry.card_name for entry in epic_stories if entry.status == "backlog"]
    lines = [
        f"- Epic mission: {item.brief}",
        f"- Story count in this epic: {len(epic_stories)} total, {len(done_stories)} done",
    ]
    if done_stories:
        for card_name in done_stories[:4]:
            lines.append(f"- Completed story: {card_name}")
    if active_stories:
        for card_name in active_stories[:3]:
            lines.append(f"- Active story: {card_name}")
    if backlog_stories:
        lines.append(f"- Next planned story: {backlog_stories[0]}")
    elif progress.epic_current_focus.get(item.epic_number):
        lines.append(f"- Current focus in this epic: {progress.epic_current_focus[item.epic_number]}")
    return lines


def build_story_detail_lines(item: SyncItem, *, repo_root: Path) -> list[str]:
    lines = [
        f"- Story purpose: {item.brief}",
    ]
    if not item.source_path:
        return lines

    source_path = repo_root / item.source_path
    if not source_path.exists():
        lines.append("- Story file: not created yet in implementation artifacts")
        return lines

    source_text = load_text(source_path)
    acceptance_criteria = extract_story_acceptance_criteria(source_text, limit=3)
    if acceptance_criteria:
        for criterion in acceptance_criteria:
            lines.append(f"- Acceptance target: {criterion}")

    completion_notes = extract_bullets(extract_markdown_section(source_text, "Completion Notes List"), limit=4)
    if completion_notes:
        for note in completion_notes:
            lines.append(f"- Delivered evidence: {note}")
        return lines

    completed_tasks = extract_checkbox_items(extract_markdown_section(source_text, "Tasks / Subtasks"), checked=True, limit=4)
    for task in completed_tasks:
        lines.append(f"- Completed task: {task}")

    pending_tasks = extract_checkbox_items(extract_markdown_section(source_text, "Tasks / Subtasks"), checked=False, limit=2)
    for task in pending_tasks:
        lines.append(f"- Remaining task: {task}")
    return lines


def build_retrospective_detail_lines(item: SyncItem, *, repo_root: Path) -> list[str]:
    lines = [
        "- Card intent: Capture what the epic taught us and what must carry forward into the next one.",
    ]
    if not item.source_path:
        lines.extend(
            [
                "- Current state: This retrospective has not been written yet.",
                "- Expected contents: wins, pain points, review patterns, technical debt, and next-epic actions.",
            ]
        )
        return lines

    source_path = repo_root / item.source_path
    if not source_path.exists():
        lines.append("- Retrospective file reference exists but the markdown file is missing.")
        return lines

    source_text = load_text(source_path)
    intended_outcome = extract_markdown_section(source_text, "Intended Outcome")
    if intended_outcome:
        lines.append(f"- Intended outcome: {intended_outcome.replace(chr(10), ' ').strip()}")

    for bullet in extract_bullets(extract_markdown_section(source_text, "What We Completed"), limit=4):
        lines.append(f"- Completed in the epic: {bullet}")
    for bullet in extract_bullets(extract_markdown_section(source_text, "What Went Well"), limit=3):
        lines.append(f"- What went well: {bullet}")
    for bullet in extract_bullets(extract_markdown_section(source_text, "What Was Harder Than Expected"), limit=3):
        lines.append(f"- Harder than expected: {bullet}")
    for action in extract_retro_action_items(extract_markdown_section(source_text, "Action Items"), limit=4):
        lines.append(f"- Action item: {action}")

    closing_summary = extract_markdown_section(source_text, "Closing Summary")
    if closing_summary:
        lines.append(f"- Closing takeaway: {closing_summary.replace(chr(10), ' ').strip()}")
    return lines


def build_explicit_detail_lines(
    item: SyncItem,
    *,
    progress: ProgressSnapshot,
    all_items: list[SyncItem],
    repo_root: Path,
) -> list[str]:
    if item.item_type == "document":
        return build_document_detail_lines(item, repo_root=repo_root)
    if item.item_type == "epic":
        return build_epic_detail_lines(item, progress=progress, all_items=all_items)
    if item.item_type == "story":
        return build_story_detail_lines(item, repo_root=repo_root)
    return build_retrospective_detail_lines(item, repo_root=repo_root)


def build_reader_brief_content(
    definition: CoreDocumentDefinition,
    *,
    source_path: str,
    source_text: str,
    progress: ProgressSnapshot,
) -> str:
    headings = extract_markdown_headings(source_text)
    opening_paragraph = extract_opening_paragraph(source_text)
    lines = [
        f"# External Brief: {definition.title}",
        "",
        "## Project Snapshot",
        f"- Project summary: {PROJECT_PRIMER}",
        f"- Overall delivery progress: {progress.done_stories}/{progress.total_stories} stories done",
    ]
    if progress.current_focus:
        lines.append(f"- Current project focus: {progress.current_focus}")
    if progress.next_backlog:
        lines.append(f"- Next backlog item: {progress.next_backlog}")
    lines.extend(
        [
            "",
            "## What This Document Is",
            definition.brief,
            "",
            "## Why It Matters",
            definition.reader_focus,
            "",
            "## Current Source File",
            f"- `{source_path}`",
        ]
    )
    if opening_paragraph:
        lines.extend(
            [
                "",
                "## Opening Context From The Source",
                opening_paragraph,
            ]
        )
    if headings:
        lines.extend(
            [
                "",
                "## Key Sections In The Source",
                *[f"- {heading}" for heading in headings],
            ]
        )
    lines.extend(
        [
            "",
            "## Suggested Next Reading",
            *[f"- {title}" for title in definition.read_next],
        ]
    )
    return "\n".join(lines).strip() + "\n"


def build_item_attachment_content(
    item: SyncItem,
    *,
    progress: ProgressSnapshot,
    all_items: list[SyncItem],
    repo_root: Path,
) -> tuple[str, str]:
    if item.item_type == "document":
        definition = CORE_DOCUMENT_DEFINITIONS_BY_KEY[item.key]
        source_text = load_text(repo_root / item.source_path) if item.source_path else ""
        return (
            "external-reader-brief",
            build_reader_brief_content(
                definition,
                source_path=item.source_path or "",
                source_text=source_text,
                progress=progress,
            ),
        )

    if item.item_type == "epic":
        title = f"# Executive Brief: {item.card_name}"
        detail_lines = build_epic_detail_lines(item, progress=progress, all_items=all_items)
        body = [
            title,
            "",
            "## What This Epic Is",
            item.brief,
            "",
            "## Current Delivery State",
            f"- Epic state: {STATUS_TO_LIST[progress.epic_statuses.get(item.epic_number, 'backlog')]}",
            f"- Overall project progress: {progress.done_stories}/{progress.total_stories} stories done",
            "",
            "## Explicit Project Detail",
            *[f"{line}" for line in detail_lines],
        ]
        if progress.current_focus:
            body.extend(["", "## Current Project Focus", f"- {progress.current_focus}"])
        return ("executive-brief", "\n".join(body).strip() + "\n")

    if item.item_type == "story":
        title = f"# Implementation Brief: {item.card_name}"
        detail_lines = build_story_detail_lines(item, repo_root=repo_root)
        body = [
            title,
            "",
            "## What This Story Is",
            item.brief,
            "",
            "## Current Delivery State",
            f"- Story state: {STATUS_TO_LIST[item.status]}",
            f"- Overall project progress: {progress.done_stories}/{progress.total_stories} stories done",
            "",
            "## Explicit Project Detail",
            *[f"{line}" for line in detail_lines],
        ]
        return ("implementation-brief", "\n".join(body).strip() + "\n")

    title = f"# Retrospective Brief: {item.card_name}"
    detail_lines = build_retrospective_detail_lines(item, repo_root=repo_root)
    body = [
        title,
        "",
        "## What This Retrospective Is",
        item.brief,
        "",
        "## Current Delivery State",
        f"- Retrospective state: {STATUS_TO_LIST[item.status]}",
        f"- Overall project progress: {progress.done_stories}/{progress.total_stories} stories done",
        "",
        "## Explicit Project Detail",
        *[f"{line}" for line in detail_lines],
    ]
    return ("retrospective-brief", "\n".join(body).strip() + "\n")


def build_managed_attachments(
    items: list[SyncItem],
    *,
    repo_root: Path = REPO_ROOT,
    output_dir: Path = DEFAULT_CARD_BRIEFS_DIR,
) -> dict[str, ManagedAttachment]:
    progress = build_progress_snapshot(items)
    output_dir.mkdir(parents=True, exist_ok=True)
    attachments: dict[str, ManagedAttachment] = {}

    for item in items:
        attachment_kind, content_text = build_item_attachment_content(
            item,
            progress=progress,
            all_items=items,
            repo_root=repo_root,
        )
        content_bytes = content_text.encode("utf-8")
        digest = hashlib.sha256(content_bytes).hexdigest()[:10]
        file_name = f"managed-{attachment_kind}-{item.key}-{digest}.md"
        local_path = output_dir / f"{item.key}-{attachment_kind}.md"
        local_path.write_bytes(content_bytes)
        attachments[item.key] = ManagedAttachment(
            card_key=item.key,
            filename=file_name,
            content=content_bytes,
            mime_type="text/markdown",
            local_path=local_path,
        )

    return attachments


def build_core_document_items(*, repo_root: Path, start_order_index: int) -> list[SyncItem]:
    items: list[SyncItem] = []
    for offset, definition in enumerate(CORE_DOCUMENT_DEFINITIONS):
        path = resolve_latest_glob_match(repo_root, definition.relative_glob)
        if path is None:
            continue
        items.append(
            SyncItem(
                key=definition.key,
                item_type="document",
                status="reference",
                title=definition.title,
                brief=definition.brief,
                epic_number=None,
                story_number=None,
                source_path=repo_relative_path(path, repo_root),
                order_index=start_order_index + offset,
            )
        )
    return items


def resolve_latest_retro_match(repo_root: Path, epic_number: int) -> Path | None:
    pattern = f"_bmad-output/implementation-artifacts/epic-{epic_number}-retro-*.md"
    return resolve_latest_glob_match(repo_root, pattern)


class TrelloClient:
    """Tiny Trello API client using only the Python standard library."""

    def __init__(self, board_id: str, api_key: str, token: str) -> None:
        self.board_id = board_id
        self.api_key = api_key
        self.token = token

    def _request(self, method: str, path: str, params: dict[str, Any] | None = None) -> Any:
        query_params = {"key": self.api_key, "token": self.token}
        if params:
            query_params.update(params)
        url = f"https://api.trello.com/1{path}?{parse.urlencode(query_params, doseq=True)}"
        req = request.Request(url, method=method)
        return self._execute_request(req, path)

    def _execute_request(self, req: request.Request, path: str) -> Any:
        try:
            with request.urlopen(req) as response:
                charset = response.headers.get_content_charset("utf-8")
                payload = response.read().decode(charset)
        except error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            raise SyncError(f"Trello API error {exc.code} for {path}: {body}") from exc
        except error.URLError as exc:
            raise SyncError(f"Could not reach Trello API for {path}: {exc.reason}") from exc

        if not payload:
            return None
        return json.loads(payload)

    def _multipart_request(
        self,
        *,
        method: str,
        path: str,
        fields: dict[str, str],
        file_name: str,
        file_bytes: bytes,
        mime_type: str,
    ) -> Any:
        boundary = f"----CodexTrelloBoundary{hashlib.sha256(file_bytes).hexdigest()[:16]}"
        query_params = {"key": self.api_key, "token": self.token}
        url = f"https://api.trello.com/1{path}?{parse.urlencode(query_params, doseq=True)}"

        body = bytearray()
        for field_name, field_value in fields.items():
            body.extend(
                (
                    f"--{boundary}\r\n"
                    f'Content-Disposition: form-data; name="{field_name}"\r\n\r\n'
                    f"{field_value}\r\n"
                ).encode("utf-8")
            )
        body.extend(
            (
                f"--{boundary}\r\n"
                f'Content-Disposition: form-data; name="file"; filename="{file_name}"\r\n'
                f"Content-Type: {mime_type}\r\n\r\n"
            ).encode("utf-8")
        )
        body.extend(file_bytes)
        body.extend(f"\r\n--{boundary}--\r\n".encode("utf-8"))

        req = request.Request(
            url,
            data=bytes(body),
            method=method,
            headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        )
        return self._execute_request(req, path)

    def fetch_open_lists(self) -> list[dict[str, Any]]:
        return self._request(
            "GET",
            f"/boards/{self.board_id}/lists",
            {"filter": "open", "fields": "id,name"},
        )

    def create_list(self, name: str) -> dict[str, Any]:
        return self._request(
            "POST",
            f"/boards/{self.board_id}/lists",
            {"name": name, "pos": "bottom"},
        )

    def fetch_open_cards(self) -> list[dict[str, Any]]:
        return self._request(
            "GET",
            f"/boards/{self.board_id}/cards",
            {"filter": "open", "fields": "id,name,desc,idList,pos,idLabels"},
        )

    def fetch_card_attachments(self, card_id: str) -> list[dict[str, Any]]:
        return self._request(
            "GET",
            f"/cards/{card_id}/attachments",
            {"fields": "id,name,url"},
        )

    def fetch_board_labels(self) -> list[dict[str, Any]]:
        return self._request(
            "GET",
            f"/boards/{self.board_id}/labels",
            {"fields": "id,name,color"},
        )

    def create_label(self, *, name: str, color: str) -> dict[str, Any]:
        return self._request(
            "POST",
            f"/boards/{self.board_id}/labels",
            {"name": name, "color": color},
        )

    def update_label(self, label_id: str, *, name: str, color: str) -> dict[str, Any]:
        return self._request(
            "PUT",
            f"/labels/{label_id}",
            {"name": name, "color": color},
        )

    def add_label_to_card(self, card_id: str, label_id: str) -> dict[str, Any]:
        return self._request(
            "POST",
            f"/cards/{card_id}/idLabels",
            {"value": label_id},
        )

    def remove_label_from_card(self, card_id: str, label_id: str) -> dict[str, Any]:
        return self._request(
            "DELETE",
            f"/cards/{card_id}/idLabels/{label_id}",
        )

    def create_card(self, *, name: str, desc: str, list_id: str, pos: int) -> dict[str, Any]:
        return self._request(
            "POST",
            "/cards",
            {"name": name, "desc": desc, "idList": list_id, "pos": str(pos)},
        )

    def update_card(self, card_id: str, *, name: str, desc: str, list_id: str, pos: int) -> dict[str, Any]:
        return self._request(
            "PUT",
            f"/cards/{card_id}",
            {"name": name, "desc": desc, "idList": list_id, "pos": str(pos)},
        )

    def archive_card(self, card_id: str) -> dict[str, Any]:
        return self._request("PUT", f"/cards/{card_id}", {"closed": "true"})

    def delete_attachment(self, card_id: str, attachment_id: str) -> dict[str, Any]:
        return self._request("DELETE", f"/cards/{card_id}/attachments/{attachment_id}")

    def upload_attachment_from_bytes(
        self,
        *,
        card_id: str,
        file_name: str,
        file_bytes: bytes,
        mime_type: str,
    ) -> dict[str, Any]:
        return self._multipart_request(
            method="POST",
            path=f"/cards/{card_id}/attachments",
            fields={"name": file_name},
            file_name=file_name,
            file_bytes=file_bytes,
            mime_type=mime_type,
        )


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Mirror BMAD sprint-tracking artifacts into Trello while keeping local files authoritative."
    )
    parser.add_argument("--env-file", default=str(DEFAULT_ENV_FILE), help="Optional env file with Trello credentials")
    parser.add_argument("--epics-file", default=str(DEFAULT_EPICS_FILE), help="Path to epics.md")
    parser.add_argument("--status-file", default=str(DEFAULT_STATUS_FILE), help="Path to sprint-status.yaml")
    parser.add_argument("--state-file", default=str(DEFAULT_STATE_FILE), help="Path to the local Trello sync state JSON")
    parser.add_argument("--board-id", default=None, help="Trello board id")
    parser.add_argument("--api-key", default=None, help="Trello API key")
    parser.add_argument("--token", default=None, help="Trello API token")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Perform live Trello API changes. Without this flag the script runs in dry-run mode.",
    )
    parser.add_argument(
        "--archive-missing",
        action="store_true",
        help="Archive previously managed Trello cards that no longer exist in local BMAD files.",
    )
    parser.add_argument(
        "--archive-duplicates",
        action="store_true",
        help="Archive duplicate open Trello cards that resolve to the same managed BMAD item.",
    )
    return parser.parse_args(argv)


def load_text(path: Path) -> str:
    if not path.exists():
        raise SyncError(f"Required file not found: {path}")
    return path.read_text(encoding="utf-8")


def load_env_file(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}

    values: dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[len("export ") :].strip()
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = strip_wrapping_quotes(value.strip())
    return values


def resolve_auth_args(args: argparse.Namespace) -> argparse.Namespace:
    env_values = load_env_file(Path(args.env_file).resolve())
    args.board_id = args.board_id or env_values.get("TRELLO_BOARD_ID") or os.getenv("TRELLO_BOARD_ID")
    args.api_key = args.api_key or env_values.get("TRELLO_API_KEY") or os.getenv("TRELLO_API_KEY")
    args.token = args.token or env_values.get("TRELLO_API_TOKEN") or os.getenv("TRELLO_API_TOKEN")
    return args


def normalize_status(raw_status: str) -> str:
    return LEGACY_STATUS_MAP.get(raw_status, raw_status)


def parse_epics(epics_path: Path) -> tuple[dict[int, str], dict[str, str], dict[int, str], dict[str, str]]:
    epic_titles: dict[int, str] = {}
    story_titles: dict[str, str] = {}
    epic_briefs: dict[int, str] = {}
    story_briefs: dict[str, str] = {}
    lines = load_text(epics_path).splitlines()
    epic_header = re.compile(r"^(##|###) Epic (\d+): (.+)$")
    story_header = re.compile(r"^### Story (\d+)\.(\d+): (.+?)(?: \(|$)")

    index = 0
    while index < len(lines):
        line = lines[index]

        epic_match = epic_header.match(line)
        if epic_match:
            epic_number = int(epic_match.group(2))
            epic_titles.setdefault(epic_number, epic_match.group(3).strip())
            summary = next_non_empty_line(lines, index + 1)
            if summary and not summary.startswith("**FRs covered:**"):
                epic_briefs.setdefault(epic_number, summary)
            index += 1
            continue

        story_match = story_header.match(line)
        if story_match:
            epic_num = int(story_match.group(1))
            story_num = int(story_match.group(2))
            story_key = f"{epic_num}-{story_num}"
            story_titles[story_key] = story_match.group(3).strip()
            story_briefs[story_key] = parse_story_brief(lines, index + 1, story_titles[story_key])
            index += 1
            continue

        index += 1

    if not epic_titles:
        raise SyncError(f"No epic titles were found in {epics_path}")
    if not story_titles:
        raise SyncError(f"No story titles were found in {epics_path}")
    return epic_titles, story_titles, epic_briefs, story_briefs


def next_non_empty_line(lines: list[str], start_index: int) -> str | None:
    for line in lines[start_index:]:
        stripped = line.strip()
        if stripped:
            return stripped
    return None


def parse_story_brief(lines: list[str], start_index: int, fallback_title: str) -> str:
    role = ""
    action = ""
    benefit = ""

    for line in lines[start_index:]:
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith("### ") or stripped.startswith("## "):
            break
        if stripped.startswith("**Acceptance Criteria:**"):
            break
        if stripped.lower().startswith("as a "):
            role = stripped.rstrip(",.")
            continue
        if stripped.lower().startswith("i want "):
            action = stripped[7:].rstrip(",.")
            continue
        if stripped.lower().startswith("so that "):
            benefit = stripped[8:].rstrip(",.")
            continue

    if action and benefit:
        return f"{action[:1].upper()}{action[1:]} so that {benefit}."
    if action:
        return f"{action[:1].upper()}{action[1:]}."
    if role:
        return role
    return fallback_title


def parse_sprint_status(status_path: Path) -> tuple[dict[str, str], OrderedDict[str, str]]:
    metadata: dict[str, str] = {}
    development_status: OrderedDict[str, str] = OrderedDict()
    in_development_status = False

    for raw_line in load_text(status_path).splitlines():
        if not raw_line.strip() or raw_line.lstrip().startswith("#"):
            continue

        if raw_line.strip() == "development_status:":
            in_development_status = True
            continue

        if not in_development_status:
            meta_match = re.match(r"^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.+?)\s*$", raw_line)
            if meta_match:
                metadata[meta_match.group(1)] = strip_wrapping_quotes(meta_match.group(2))
            continue

        status_match = re.match(r"^\s{2}([^:#][^:]*?)\s*:\s*(.+?)\s*$", raw_line)
        if status_match:
            development_status[status_match.group(1)] = normalize_status(strip_wrapping_quotes(status_match.group(2)))

    if not development_status:
        raise SyncError(f"No development_status section could be parsed from {status_path}")
    return metadata, development_status


def strip_wrapping_quotes(value: str) -> str:
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {'"', "'"}:
        return value[1:-1]
    return value


def build_sync_items(
    epics_path: Path,
    status_path: Path,
    *,
    repo_root: Path = REPO_ROOT,
    include_core_documents: bool = True,
) -> tuple[dict[str, str], OrderedDict[str, str], list[SyncItem]]:
    epic_titles, story_titles, epic_briefs, story_briefs = parse_epics(epics_path)
    metadata, development_status = parse_sprint_status(status_path)
    items: list[SyncItem] = []

    for order_index, (key, status) in enumerate(development_status.items(), start=1):
        epic_retro_match = re.fullmatch(r"epic-(\d+)-retrospective", key)
        epic_match = re.fullmatch(r"epic-(\d+)", key)
        story_match = re.fullmatch(r"(\d+)-(\d+)-.+", key)

        if epic_retro_match:
            epic_number = int(epic_retro_match.group(1))
            retro_path = resolve_latest_retro_match(repo_root, epic_number)
            items.append(
                SyncItem(
                    key=key,
                    item_type="retrospective",
                    status=status,
                    title=f"Retrospective for Epic {epic_number}",
                    brief=f"Capture what worked, what changed, and what to improve after Epic {epic_number} is complete.",
                    epic_number=epic_number,
                    story_number=None,
                    source_path=repo_relative_path(retro_path, repo_root) if retro_path else None,
                    order_index=order_index,
                )
            )
            continue

        if epic_match:
            epic_number = int(epic_match.group(1))
            title = epic_titles.get(epic_number, f"Epic {epic_number}")
            items.append(
                SyncItem(
                    key=key,
                    item_type="epic",
                    status=status,
                    title=title,
                    brief=epic_briefs.get(epic_number, title),
                    epic_number=epic_number,
                    story_number=None,
                    source_path=None,
                    order_index=order_index,
                )
            )
            continue

        if story_match:
            epic_number = int(story_match.group(1))
            story_number = int(story_match.group(2))
            story_title = story_titles.get(f"{epic_number}-{story_number}", key)
            story_path = repo_root / "_bmad-output/implementation-artifacts" / f"{key}.md"
            items.append(
                SyncItem(
                    key=key,
                    item_type="story",
                    status=status,
                    title=story_title,
                    brief=story_briefs.get(f"{epic_number}-{story_number}", story_title),
                    epic_number=epic_number,
                    story_number=story_number,
                    source_path=repo_relative_path(story_path, repo_root),
                    order_index=order_index,
                )
            )
            continue

        raise SyncError(f"Unrecognized sprint-status key format: {key}")

    if include_core_documents:
        items.extend(build_core_document_items(repo_root=repo_root, start_order_index=len(items) + 1))

    return metadata, development_status, items


def extract_bmad_key(description: str) -> str | None:
    match = re.search(r"^BMAD_KEY:\s*(.+)$", description, flags=re.MULTILINE)
    return match.group(1).strip() if match else None


def extract_manual_notes(description: str) -> str:
    if not description:
        return ""
    if MANUAL_NOTES_HEADER in description:
        _, manual_notes = description.split(MANUAL_NOTES_HEADER, 1)
        return manual_notes.strip()
    if "BMAD_KEY:" in description:
        return ""
    return description.strip()


def build_progress_snapshot(items: list[SyncItem]) -> ProgressSnapshot:
    story_items = [item for item in items if item.item_type == "story"]
    epic_items = [item for item in items if item.item_type == "epic"]
    epic_statuses = {item.epic_number: item.status for item in epic_items}
    epic_story_totals: dict[int, int] = {}
    epic_story_done: dict[int, int] = {}
    epic_current_focus: dict[int, str | None] = {}
    epic_next_backlog: dict[int, str | None] = {}

    for story in story_items:
        epic_story_totals[story.epic_number] = epic_story_totals.get(story.epic_number, 0) + 1
        if story.status == "done":
            epic_story_done[story.epic_number] = epic_story_done.get(story.epic_number, 0) + 1

    priority_statuses = {"in-progress", "review", "ready-for-dev"}
    current_focus_item = next((story for story in story_items if story.status in priority_statuses), None)
    if current_focus_item is None:
        current_focus_item = next((story for story in story_items if story.status == "backlog"), None)
    next_backlog_item = next((story for story in story_items if story.status == "backlog"), None)

    for epic_number in epic_story_totals:
        epic_stories = [story for story in story_items if story.epic_number == epic_number]
        epic_focus = next((story for story in epic_stories if story.status in priority_statuses), None)
        if epic_focus is None:
            epic_focus = next((story for story in epic_stories if story.status == "backlog"), None)
        epic_backlog = next((story for story in epic_stories if story.status == "backlog"), None)
        epic_current_focus[epic_number] = epic_focus.card_name if epic_focus else None
        epic_next_backlog[epic_number] = epic_backlog.card_name if epic_backlog else None

    return ProgressSnapshot(
        total_stories=len(story_items),
        done_stories=sum(1 for story in story_items if story.status == "done"),
        epic_statuses=epic_statuses,
        epic_story_totals=epic_story_totals,
        epic_story_done=epic_story_done,
        current_focus=current_focus_item.card_name if current_focus_item else None,
        next_backlog=next_backlog_item.card_name if next_backlog_item else None,
        epic_current_focus=epic_current_focus,
        epic_next_backlog=epic_next_backlog,
    )


def compose_description(
    item: SyncItem,
    *,
    existing_description: str,
    synced_at_utc: str,
    status_path: Path,
    epics_path: Path,
    progress: ProgressSnapshot,
    all_items: list[SyncItem] | None = None,
) -> str:
    manual_notes = extract_manual_notes(existing_description)
    managed_block = item.managed_description(
        synced_at_utc,
        status_path,
        progress,
        all_items=all_items,
        repo_root=REPO_ROOT,
    )
    if manual_notes:
        return f"{managed_block}\n\n{MANUAL_NOTES_HEADER}{manual_notes}\n"
    return f"{managed_block}\n\n{MANUAL_NOTES_HEADER}"


def load_state(state_path: Path) -> dict[str, Any]:
    if not state_path.exists():
        return {"items": {}}
    try:
        return json.loads(state_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise SyncError(f"State file is not valid JSON: {state_path}") from exc


def save_state(state_path: Path, *, board_id: str | None, item_to_card_id: dict[str, str]) -> None:
    state_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "board_id": board_id,
        "updated_at_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "items": item_to_card_id,
    }
    state_path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def build_managed_label_specs(items: list[SyncItem]) -> dict[str, str]:
    specs = {name: color for name, color in TYPE_LABEL_SPECS.values()}
    epic_numbers = sorted({item.epic_number for item in items if item.epic_number is not None})
    for epic_number in epic_numbers:
        color = EPIC_LABEL_COLORS[(epic_number - 1) % len(EPIC_LABEL_COLORS)]
        specs[f"Epic {epic_number}"] = color
    return specs


def ensure_required_lists(
    *,
    dry_run: bool,
    client: TrelloClient | None,
    existing_lists: dict[str, dict[str, Any]],
) -> dict[str, dict[str, Any]]:
    resolved_lists = dict(existing_lists)
    for list_name in REQUIRED_LISTS:
        if list_name in resolved_lists:
            continue
        if dry_run:
            fake_id = f"dry-run-list-{list_name.lower().replace(' ', '-')}"
            resolved_lists[list_name] = {"id": fake_id, "name": list_name}
            print(f"DRY RUN: would create list '{list_name}'")
            continue
        assert client is not None
        created = client.create_list(list_name)
        resolved_lists[list_name] = created
        print(f"Created list '{list_name}'")
    return resolved_lists


def ensure_required_labels(
    *,
    dry_run: bool,
    client: TrelloClient | None,
    existing_labels: dict[str, dict[str, Any]],
    required_label_specs: dict[str, str],
) -> dict[str, dict[str, Any]]:
    resolved_labels = dict(existing_labels)
    for label_name, color in required_label_specs.items():
        existing_label = resolved_labels.get(label_name)
        if existing_label is None:
            if dry_run:
                fake_id = f"dry-run-label-{label_name.lower().replace(' ', '-').replace(':', '')}"
                resolved_labels[label_name] = {"id": fake_id, "name": label_name, "color": color}
                print(f"DRY RUN: would create label '{label_name}' ({color})")
                continue
            assert client is not None
            created = client.create_label(name=label_name, color=color)
            resolved_labels[label_name] = created
            print(f"Created label '{label_name}' ({color})")
            continue

        if existing_label.get("color") == color:
            continue
        if dry_run:
            print(f"DRY RUN: would update label '{label_name}' color to '{color}'")
            resolved_labels[label_name] = {**existing_label, "color": color}
            continue
        assert client is not None
        updated = client.update_label(existing_label["id"], name=label_name, color=color)
        resolved_labels[label_name] = updated
        print(f"Updated label '{label_name}' color to '{color}'")
    return resolved_labels


def group_positions(items: list[SyncItem]) -> dict[str, int]:
    counters: dict[str, int] = {}
    positions: dict[str, int] = {}
    for item in items:
        counters[item.list_name] = counters.get(item.list_name, 0) + 1
        positions[item.key] = counters[item.list_name]
    return positions


def choose_preferred_card(
    candidate_cards: list[dict[str, Any]],
    *,
    preferred_list_id: str,
    preferred_card_id: str | None = None,
) -> dict[str, Any] | None:
    if not candidate_cards:
        return None
    if preferred_card_id:
        preferred = next((card for card in candidate_cards if card.get("id") == preferred_card_id), None)
        if preferred is not None:
            return preferred
    if len(candidate_cards) == 1:
        return candidate_cards[0]

    list_matches = [card for card in candidate_cards if card.get("idList") == preferred_list_id]
    if len(list_matches) == 1:
        return list_matches[0]
    if list_matches:
        candidate_cards = list_matches

    managed_matches = [card for card in candidate_cards if extract_bmad_key(card.get("desc", ""))]
    if len(managed_matches) == 1:
        return managed_matches[0]
    if managed_matches:
        candidate_cards = managed_matches

    return min(candidate_cards, key=lambda card: (float(card.get("pos", 0)), card.get("id", "")))


@contextmanager
def held_sync_lock(lock_path: Path):
    lock_path.parent.mkdir(parents=True, exist_ok=True)
    with lock_path.open("w", encoding="utf-8") as lock_file:
        fcntl.flock(lock_file.fileno(), fcntl.LOCK_EX)
        try:
            lock_file.seek(0)
            lock_file.truncate()
            lock_file.write(str(os.getpid()))
            lock_file.flush()
            yield
        finally:
            fcntl.flock(lock_file.fileno(), fcntl.LOCK_UN)


def sync_managed_attachment(
    *,
    client: TrelloClient,
    card_id: str,
    card_name: str,
    attachment: ManagedAttachment,
) -> bool:
    existing_attachments = client.fetch_card_attachments(card_id)
    managed_prefixes = [
        f"managed-brief-{attachment.card_key}-",
        f"managed-external-brief-{attachment.card_key}-",
        f"managed-executive-brief-{attachment.card_key}-",
        f"managed-implementation-brief-{attachment.card_key}-",
        f"managed-retrospective-brief-{attachment.card_key}-",
    ]
    matching_attachment = next(
        (entry for entry in existing_attachments if entry.get("name") == attachment.filename),
        None,
    )
    if matching_attachment is not None:
        return False

    for existing in existing_attachments:
        name = existing.get("name", "")
        if not any(name.startswith(prefix) for prefix in managed_prefixes):
            continue
        try:
            client.delete_attachment(card_id, existing["id"])
            print(f"Removed outdated attachment '{name}' from '{card_name}'")
        except SyncError as exc:
            message = str(exc)
            if "Trello API error 404" in message or "Could not find the specified attachment" in message:
                print(
                    f"Skipped missing outdated attachment '{name}' on '{card_name}' "
                    f"because Trello already removed it."
                )
                continue
            raise

    client.upload_attachment_from_bytes(
        card_id=card_id,
        file_name=attachment.filename,
        file_bytes=attachment.content,
        mime_type=attachment.mime_type,
    )
    print(f"Uploaded attachment '{attachment.filename}' to '{card_name}'")
    return True


def collect_duplicate_cards(
    *,
    open_cards: list[dict[str, Any]],
    items: list[SyncItem],
    kept_card_ids_by_key: dict[str, str],
) -> list[tuple[dict[str, Any], str]]:
    desired_item_by_key = {item.key: item for item in items}
    desired_item_by_name = {item.card_name: item for item in items}
    cards_by_bmad_key: dict[str, list[dict[str, Any]]] = {}
    cards_by_name: dict[str, list[dict[str, Any]]] = {}

    for card in open_cards:
        bmad_key = extract_bmad_key(card.get("desc", ""))
        if bmad_key:
            cards_by_bmad_key.setdefault(bmad_key, []).append(card)
        cards_by_name.setdefault(card.get("name", ""), []).append(card)

    duplicate_cards: dict[str, tuple[dict[str, Any], str]] = {}

    for item_key, kept_card_id in kept_card_ids_by_key.items():
        item = desired_item_by_key[item_key]

        for card in cards_by_bmad_key.get(item_key, []):
            card_id = card.get("id")
            if card_id == kept_card_id:
                continue
            duplicate_cards[card_id] = (
                card,
                f"duplicate BMAD key '{item_key}' for '{item.card_name}' (keeping {kept_card_id})",
            )

        for card in cards_by_name.get(item.card_name, []):
            card_id = card.get("id")
            if card_id == kept_card_id:
                continue
            duplicate_cards.setdefault(
                card_id,
                (
                    card,
                    f"duplicate card name for '{item.card_name}' (keeping {kept_card_id})",
                ),
            )

    return sorted(
        duplicate_cards.values(),
        key=lambda entry: (
            entry[0].get("name", ""),
            float(entry[0].get("pos", 0)),
            entry[0].get("id", ""),
        ),
    )


def sync_to_trello(
    *,
    items: list[SyncItem],
    epics_path: Path,
    status_path: Path,
    state_path: Path,
    board_id: str | None,
    api_key: str | None,
    token: str | None,
    dry_run: bool,
    archive_missing: bool,
    archive_duplicates: bool,
) -> int:
    state = load_state(state_path)
    previous_item_map = state.get("items", {})
    synced_at_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    progress = build_progress_snapshot(items)
    managed_attachments = build_managed_attachments(items, repo_root=REPO_ROOT)

    if dry_run:
        client = None
        open_cards: list[dict[str, Any]] = []
        existing_lists: dict[str, dict[str, Any]] = {}
        existing_labels: dict[str, dict[str, Any]] = {}
        cards_by_id: dict[str, dict[str, Any]] = {}
        cards_by_bmad_key: dict[str, list[dict[str, Any]]] = {}
        cards_by_name: dict[str, list[dict[str, Any]]] = {}
    else:
        if not board_id or not api_key or not token:
            raise SyncError(
                "Live sync requires TRELLO_BOARD_ID, TRELLO_API_KEY, and TRELLO_API_TOKEN "
                "(or --board-id, --api-key, and --token)."
            )
        client = TrelloClient(board_id=board_id, api_key=api_key, token=token)
        existing_lists = {entry["name"]: entry for entry in client.fetch_open_lists()}
        existing_labels = {entry["name"]: entry for entry in client.fetch_board_labels()}
        open_cards = client.fetch_open_cards()
        cards_by_id = {card["id"]: card for card in open_cards}
        cards_by_bmad_key = {}
        cards_by_name = {}
        for card in open_cards:
            bmad_key = extract_bmad_key(card.get("desc", ""))
            if bmad_key:
                cards_by_bmad_key.setdefault(bmad_key, []).append(card)
            cards_by_name.setdefault(card.get("name", ""), []).append(card)

    resolved_lists = ensure_required_lists(dry_run=dry_run, client=client, existing_lists=existing_lists)
    managed_label_specs = build_managed_label_specs(items)
    resolved_labels = ensure_required_labels(
        dry_run=dry_run,
        client=client,
        existing_labels=existing_labels,
        required_label_specs=managed_label_specs,
    )
    managed_label_ids = {label["id"] for label in resolved_labels.values() if label["name"] in managed_label_specs}
    label_names_by_id = {label["id"]: name for name, label in resolved_labels.items()}
    positions = group_positions(items)
    desired_keys = {item.key for item in items}
    new_state_map: dict[str, str] = {}
    created_count = 0
    updated_count = 0
    unchanged_count = 0
    archived_count = 0

    for item in items:
        list_id = resolved_lists[item.list_name]["id"]
        previous_card_id = previous_item_map.get(item.key)
        existing_card = None
        if previous_card_id:
            existing_card = cards_by_id.get(previous_card_id)
        if existing_card is None:
            existing_card = choose_preferred_card(
                cards_by_bmad_key.get(item.key, []),
                preferred_list_id=list_id,
                preferred_card_id=previous_card_id,
            )
        if existing_card is None and not dry_run:
            existing_card = choose_preferred_card(
                cards_by_name.get(item.card_name, []),
                preferred_list_id=list_id,
                preferred_card_id=previous_card_id,
            )

        description = compose_description(
            item,
            existing_description=existing_card.get("desc", "") if existing_card else "",
            synced_at_utc=synced_at_utc,
            status_path=status_path,
            epics_path=epics_path,
            progress=progress,
            all_items=items,
        )
        pos = positions[item.key]
        desired_label_ids = {resolved_labels[label_name]["id"] for label_name in item.desired_label_names}
        content_updated = False

        if existing_card is None:
            if dry_run:
                fake_card_id = f"dry-run-card-{item.key}"
                print(f"DRY RUN: would create card '{item.card_name}' in list '{item.list_name}'")
                new_state_map[item.key] = fake_card_id
                current_label_ids: set[str] = set()
            else:
                assert client is not None
                created = client.create_card(name=item.card_name, desc=description, list_id=list_id, pos=pos)
                print(f"Created card '{item.card_name}' in list '{item.list_name}'")
                new_state_map[item.key] = created["id"]
                current_label_ids = set()
            created_count += 1
        else:
            new_state_map[item.key] = existing_card["id"]
            current_label_ids = set(existing_card.get("idLabels", []))
            needs_update = any(
                [
                    existing_card.get("name") != item.card_name,
                    existing_card.get("desc") != description,
                    existing_card.get("idList") != list_id,
                ]
            )

            if needs_update:
                if dry_run:
                    print(f"DRY RUN: would update card '{item.card_name}'")
                else:
                    assert client is not None
                    client.update_card(existing_card["id"], name=item.card_name, desc=description, list_id=list_id, pos=pos)
                    print(f"Updated card '{item.card_name}'")
                content_updated = True
                updated_count += 1
            else:
                unchanged_count += 1

        card_id = new_state_map[item.key]
        labels_to_add = sorted(desired_label_ids - current_label_ids)
        labels_to_remove = sorted((current_label_ids & managed_label_ids) - desired_label_ids)

        if existing_card is not None and (labels_to_add or labels_to_remove) and not content_updated:
            if unchanged_count > 0:
                unchanged_count -= 1
                updated_count += 1

        for label_id in labels_to_add:
            label_name = label_names_by_id[label_id]
            if dry_run:
                print(f"DRY RUN: would add label '{label_name}' to '{item.card_name}'")
            else:
                assert client is not None
                client.add_label_to_card(card_id, label_id)
                print(f"Added label '{label_name}' to '{item.card_name}'")

        for label_id in labels_to_remove:
            label_name = label_names_by_id[label_id]
            if dry_run:
                print(f"DRY RUN: would remove label '{label_name}' from '{item.card_name}'")
            else:
                assert client is not None
                client.remove_label_from_card(card_id, label_id)
                print(f"Removed label '{label_name}' from '{item.card_name}'")

        attachment = managed_attachments.get(item.key)
        if attachment is not None:
            if dry_run:
                print(
                    f"DRY RUN: would ensure attachment '{attachment.filename}' on '{item.card_name}' "
                    f"from '{repo_relative_path(attachment.local_path, REPO_ROOT)}'"
                )
            else:
                assert client is not None
                attachment_updated = sync_managed_attachment(
                    client=client,
                    card_id=card_id,
                    card_name=item.card_name,
                    attachment=attachment,
                )
                if attachment_updated and existing_card is not None and not content_updated and not labels_to_add and not labels_to_remove:
                    if unchanged_count > 0:
                        unchanged_count -= 1
                    updated_count += 1

    if archive_missing:
        managed_cards = cards_by_bmad_key if not dry_run else {}
        for bmad_key, matching_cards in managed_cards.items():
            if bmad_key in desired_keys:
                continue
            for card in matching_cards:
                if dry_run:
                    print(f"DRY RUN: would archive card '{card['name']}'")
                else:
                    assert client is not None
                    client.archive_card(card["id"])
                    print(f"Archived card '{card['name']}'")
                archived_count += 1

    if archive_duplicates:
        duplicate_cards = collect_duplicate_cards(
            open_cards=open_cards,
            items=items,
            kept_card_ids_by_key=new_state_map,
        )
        for card, reason in duplicate_cards:
            if dry_run:
                print(f"DRY RUN: would archive duplicate card '{card['name']}' because {reason}")
            else:
                assert client is not None
                client.archive_card(card["id"])
                print(f"Archived duplicate card '{card['name']}' because {reason}")
            archived_count += 1

    mode_label = "Dry run" if dry_run else "Sync"
    if not dry_run:
        save_state(state_path, board_id=board_id, item_to_card_id=new_state_map)
    print(
        f"{mode_label} complete: created {created_count}, updated {updated_count}, "
        f"unchanged {unchanged_count}, archived {archived_count}."
    )
    return 0


def main(argv: list[str] | None = None) -> int:
    args = resolve_auth_args(parse_args(argv or sys.argv[1:]))
    dry_run = not args.apply
    epics_path = Path(args.epics_file).resolve()
    status_path = Path(args.status_file).resolve()
    state_path = Path(args.state_file).resolve()

    try:
        with held_sync_lock(DEFAULT_LOCK_FILE):
            _, _, items = build_sync_items(epics_path=epics_path, status_path=status_path, repo_root=REPO_ROOT)
            return sync_to_trello(
                items=items,
                epics_path=epics_path,
                status_path=status_path,
                state_path=state_path,
                board_id=args.board_id,
                api_key=args.api_key,
                token=args.token,
                dry_run=dry_run,
                archive_missing=args.archive_missing,
                archive_duplicates=args.archive_duplicates,
            )
    except SyncError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
