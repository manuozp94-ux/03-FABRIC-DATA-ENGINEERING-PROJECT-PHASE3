#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from common_fabric import (
    FabricClient,
    ensure_dir,
    read_json_rows,
    utc_now_iso,
    write_csv,
    write_json,
)


REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CONTRACT_PATH = (
    REPO_ROOT / "05-compat" / "contracts" / "fab001_runtime_pipeline_contract.json"
)
DEFAULT_MEDALLION_CONTRACT_PATH = (
    REPO_ROOT / "05-compat" / "contracts" / "fab001_medallion_contract.json"
)
DEFAULT_RELEASE_LEDGER_DIR = REPO_ROOT / "_bmad-output" / "test-artifacts" / "release-ledger"
DEFAULT_PROOF_DIR = REPO_ROOT / "_bmad-output" / "test-artifacts" / "fabric-proof" / "fab001"
DEFAULT_OUTPUT_DIR = DEFAULT_PROOF_DIR / "runtime-governance"
DEFAULT_PIPELINE_REPORT_PATH = DEFAULT_OUTPUT_DIR / "runtime-pipeline-report.json"
DEFAULT_GOVERNANCE_REPORT_PATH = DEFAULT_OUTPUT_DIR / "runtime-governance-report.json"
DEFAULT_PUBLIC_SERVING_EXTRACT_REPORT_PATH = (
    REPO_ROOT / "_bmad-output" / "test-artifacts" / "fabric-public-serving-extract" / "materialization-report.json"
)
DEFAULT_SEMANTIC_REPORT_PATH = (
    DEFAULT_PROOF_DIR / "semantic-model-live" / "materialization-report.json"
)
DEFAULT_REPORT_SHELL_REPORT_PATH = (
    DEFAULT_PROOF_DIR / "report-live" / "report-shell-report.json"
)
DEFAULT_LAKEHOUSE_NAME = "lh_fab001_public_proof"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Create or run the bounded FAB001 Fabric pipeline and materialize runtime governance "
            "tables inside the proof Lakehouse."
        )
    )
    parser.add_argument(
        "--contract",
        default=str(DEFAULT_CONTRACT_PATH),
        help="Path to the runtime pipeline contract JSON.",
    )
    parser.add_argument(
        "--medallion-contract",
        default=str(DEFAULT_MEDALLION_CONTRACT_PATH),
        help="Path to the medallion contract JSON.",
    )
    parser.add_argument(
        "--release-ledger-dir",
        default=str(DEFAULT_RELEASE_LEDGER_DIR),
        help="Path to the local release ledger directory.",
    )
    parser.add_argument(
        "--output-dir",
        default=str(DEFAULT_OUTPUT_DIR),
        help="Local output directory for runtime pipeline and governance artifacts.",
    )
    parser.add_argument(
        "--pipeline-report-path",
        default=str(DEFAULT_PIPELINE_REPORT_PATH),
        help="Where to write or read the runtime pipeline report.",
    )
    parser.add_argument(
        "--governance-report-path",
        default=str(DEFAULT_GOVERNANCE_REPORT_PATH),
        help="Where to write the runtime governance report.",
    )
    parser.add_argument(
        "--semantic-report-path",
        default=str(DEFAULT_SEMANTIC_REPORT_PATH),
        help="Semantic-model materialization report used by runtime governance.",
    )
    parser.add_argument(
        "--report-shell-report-path",
        default=str(DEFAULT_REPORT_SHELL_REPORT_PATH),
        help="Report-shell materialization report used by runtime governance.",
    )
    parser.add_argument(
        "--public-serving-extract-report-path",
        default=str(DEFAULT_PUBLIC_SERVING_EXTRACT_REPORT_PATH),
        help="Public-serving-extract materialization report used by runtime governance.",
    )
    parser.add_argument(
        "--preview-only",
        action="store_true",
        help="Write local pipeline definition and governance payload previews without Fabric calls.",
    )
    parser.add_argument(
        "--workspace-id",
        default="preview-workspace-id",
        help="Workspace id to use in preview mode when no live Fabric call is made.",
    )
    parser.add_argument(
        "--loader-notebook-id",
        default="preview-loader-notebook-id",
        help="Loader notebook id to use in preview mode when no live Fabric call is made.",
    )
    parser.add_argument(
        "--create-pipeline",
        action="store_true",
        help="Create or update the Fabric runtime pipeline item.",
    )
    parser.add_argument(
        "--run-pipeline",
        action="store_true",
        help="Run the Fabric runtime pipeline and poll the pipeline job.",
    )
    parser.add_argument(
        "--materialize-governance",
        action="store_true",
        help="Upload runtime-governance CSVs, create/update the governance notebook, and materialize control tables.",
    )
    return parser.parse_args()


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def build_pipeline_definition(*, notebook_id: str, workspace_id: str, contract: dict[str, Any]) -> dict[str, Any]:
    pipeline_contract = contract["pipeline"]
    return {
        "properties": {
            "activities": [
                {
                    "name": pipeline_contract["activity_name"],
                    "type": "TridentNotebook",
                    "dependsOn": [],
                    "policy": {
                        "timeout": "0.12:00:00",
                        "retry": 0,
                        "retryIntervalInSeconds": 30,
                        "secureOutput": False,
                        "secureInput": False,
                    },
                    "typeProperties": {
                        "notebookId": notebook_id,
                        "workspaceId": workspace_id,
                        "sessionTag": pipeline_contract["session_tag"],
                    },
                }
            ],
            "annotations": [
                "bounded-proof",
                "story-7.3",
                "repo-governed-fabric-runtime",
            ],
        }
    }


def normalize_timestamp(value: str | None) -> str:
    if not value:
        return utc_now_iso()
    text = value.replace("Z", "+00:00")
    parsed = datetime.fromisoformat(text)
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc).replace(microsecond=0).isoformat()


def read_optional_json(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None
    return load_json(path)


def build_public_serving_extract_state(
    *,
    contract: dict[str, Any],
    pipeline_report: dict[str, Any],
    extract_report: dict[str, Any] | None = None,
) -> dict[str, Any]:
    extract_contract = contract.get("public_serving_extract", {})
    extract_state = dict(pipeline_report.get("public_serving_extract", {}))
    if extract_report:
        extract_state = {
            "status": extract_report.get("status"),
            "produced": extract_report.get("produced"),
            "active_public_source_mode": extract_report.get("active_public_source_mode"),
            "target_public_source_mode": extract_report.get("target_public_source_mode"),
            "active_reference": extract_report.get("active_reference"),
            "artifact_path": extract_report.get("materialization_report_path"),
            "note": extract_report.get("note"),
            **extract_state,
        }
    default_status = extract_contract.get("default_status", "not_materialized")
    fallback_mode = extract_contract.get("fallback_state", "repo_mirror_transitional")
    extract_state.setdefault("status", default_status)
    extract_state.setdefault("produced", extract_state["status"].startswith("produced"))
    extract_state.setdefault(
        "active_public_source_mode",
        extract_contract.get("target_state", "fabric_serving_extract")
        if extract_state.get("produced")
        else fallback_mode,
    )
    extract_state.setdefault(
        "target_public_source_mode",
        extract_contract.get("target_state", "fabric_serving_extract"),
    )
    if "note" not in extract_state:
        extract_state["note"] = (
            "The public site now consumes a bounded Fabric-derived serving extract mirrored into the site repo."
            if extract_state.get("produced")
            else "The bounded Fabric public serving extract is not materialized yet; the repo mirror remains the active public source during transition."
        )
    extract_state.setdefault("active_reference", "")
    return extract_state


def build_runtime_governance_rows(
    *,
    contract: dict[str, Any],
    release_ledger_dir: Path,
    pipeline_report: dict[str, Any],
    public_serving_extract_report: dict[str, Any] | None,
    semantic_report: dict[str, Any] | None,
    report_shell_report: dict[str, Any] | None,
    medallion_contract: dict[str, Any],
) -> dict[str, list[dict[str, Any]]]:
    current_release = load_json(release_ledger_dir / "current-release.json")
    last_known_good = load_json(release_ledger_dir / "last-known-good-release.json")

    pipeline_item = pipeline_report.get("pipeline", {})
    pipeline_job = pipeline_report.get("pipeline_job", {})
    pipeline_status = pipeline_job.get("status") or pipeline_report.get("pipeline_status") or "Unknown"
    notebook_activity = first_notebook_activity(
        pipeline_report.get("pipeline_activity_runs", [])
    )
    direct_loader_job = pipeline_report.get("loader_notebook_job", {})
    effective_notebook_status = (
        notebook_activity.get("status")
        or direct_loader_job.get("status")
    )
    recorded_at = pipeline_report.get("recorded_at_utc") or utc_now_iso()
    public_serving_extract = build_public_serving_extract_state(
        contract=contract,
        pipeline_report=pipeline_report,
        extract_report=public_serving_extract_report,
    )
    public_source_mode = public_serving_extract["active_public_source_mode"]
    serving_extract_status = public_serving_extract["status"]

    semantic_item = (semantic_report or {}).get("semantic_model", {})
    semantic_update = (semantic_report or {}).get("update_result", {})
    report_item = (report_shell_report or {}).get("report", {})
    report_update = (report_shell_report or {}).get("update_result", {})

    release_registry = [
        {
            "release_id": current_release.get("release_id"),
            "release_state": (
                "runtime_active"
                if effective_notebook_status == "Completed"
                else "runtime_needs_attention"
            ),
            "release_record_path": current_release.get("release_record_path"),
            "publication_dir": "platform/fabric/publication/current",
            "pipeline_item_id": pipeline_item.get("id"),
            "pipeline_name": pipeline_item.get("displayName") or pipeline_item.get("name"),
            "pipeline_run_id": pipeline_job.get("id"),
            "pipeline_run_status": pipeline_status,
            "notebook_item_id": notebook_activity.get("itemId") or pipeline_report.get("loader_notebook", {}).get("id"),
            "notebook_name": notebook_activity.get("activityName") or pipeline_report.get("loader_notebook", {}).get("displayName"),
            "notebook_run_status": effective_notebook_status,
            "public_source_mode": public_source_mode,
            "serving_extract_status": serving_extract_status,
            "recorded_at_utc": recorded_at,
        }
    ]

    last_known_good_rows = [
        {
            "active_release_id": current_release.get("release_id"),
            "last_known_good_release_id": last_known_good.get("release_id"),
            "active_pipeline_run_id": pipeline_job.get("id"),
            "active_pipeline_status": pipeline_status,
            "public_source_mode": public_source_mode,
            "updated_at_utc": recorded_at,
            "recovery_note": "Repo-side approval remains authoritative; Fabric runtime governance mirrors the active and last-known-good pointers.",
        }
    ]

    runtime_history = [
        {
            "execution_type": "pipeline",
            "job_id": pipeline_job.get("id"),
            "parent_job_id": None,
            "item_id": pipeline_item.get("id"),
            "item_name": pipeline_item.get("displayName") or pipeline_item.get("name"),
            "status": pipeline_status,
            "started_at_utc": normalize_timestamp(
                pipeline_job.get("startTimeUtc") or pipeline_job.get("start_time_utc")
            ),
            "ended_at_utc": normalize_timestamp(
                pipeline_job.get("endTimeUtc") or pipeline_job.get("end_time_utc")
            ),
            "failure_reason": pipeline_job.get("failureReason"),
            "recorded_at_utc": recorded_at,
        }
    ]

    if notebook_activity:
        runtime_history.append(
            {
                "execution_type": "notebook_activity",
                "job_id": notebook_activity.get("activityRunId") or notebook_activity.get("id"),
                "parent_job_id": pipeline_job.get("id"),
                "item_id": notebook_activity.get("itemId") or pipeline_report.get("loader_notebook", {}).get("id"),
                "item_name": notebook_activity.get("activityName"),
                "status": notebook_activity.get("status"),
                "started_at_utc": normalize_timestamp(
                    notebook_activity.get("activityRunStart") or notebook_activity.get("activityRunStartTime")
                ),
                "ended_at_utc": normalize_timestamp(
                    notebook_activity.get("activityRunEnd") or notebook_activity.get("activityRunEndTime")
                ),
                "failure_reason": notebook_activity.get("error") or notebook_activity.get("failureReason"),
                "recorded_at_utc": recorded_at,
            }
        )
    if direct_loader_job:
        runtime_history.append(
            {
                "execution_type": "direct_notebook_execute",
                "job_id": direct_loader_job.get("id"),
                "parent_job_id": pipeline_job.get("id"),
                "item_id": pipeline_report.get("loader_notebook", {}).get("id"),
                "item_name": pipeline_report.get("loader_notebook", {}).get("displayName"),
                "status": direct_loader_job.get("status"),
                "started_at_utc": normalize_timestamp(direct_loader_job.get("startTimeUtc")),
                "ended_at_utc": normalize_timestamp(direct_loader_job.get("endTimeUtc")),
                "failure_reason": direct_loader_job.get("failureReason"),
                "recorded_at_utc": recorded_at,
            }
        )

    asset_history = [
        {
            "asset_type": "semantic_model",
            "asset_name": semantic_item.get("displayName") or semantic_item.get("name") or "sm_fab001_supply_chain_decision",
            "asset_id": semantic_item.get("id"),
            "status": semantic_update.get("status") or "unknown",
            "refresh_record_path": "_bmad-output/test-artifacts/fabric-proof/fab001/semantic-model-live/materialization-report.json",
            "related_release_id": current_release.get("release_id"),
            "public_source_mode": public_source_mode,
            "recorded_at_utc": recorded_at,
        },
        {
            "asset_type": "report_shell",
            "asset_name": report_item.get("displayName") or report_item.get("name") or "rpt_fab001_supply_chain_decision",
            "asset_id": report_item.get("id"),
            "status": report_update.get("status") or "unknown",
            "refresh_record_path": "_bmad-output/test-artifacts/fabric-proof/fab001/report-live/report-shell-report.json",
            "related_release_id": current_release.get("release_id"),
            "public_source_mode": public_source_mode,
            "recorded_at_utc": recorded_at,
        },
        {
            "asset_type": "public_serving_extract",
            "asset_name": "fab001_public_serving_extract",
            "asset_id": public_serving_extract.get("id"),
            "status": serving_extract_status,
            "refresh_record_path": public_serving_extract.get("artifact_path") or "",
            "related_release_id": current_release.get("release_id"),
            "public_source_mode": public_source_mode,
            "recorded_at_utc": recorded_at,
        },
    ]

    return {
        "ctrl_release_registry": release_registry,
        "ctrl_last_known_good": last_known_good_rows,
        "ctrl_runtime_job_history": runtime_history,
        "ctrl_asset_refresh_history": asset_history,
    }


def first_notebook_activity(activity_runs: list[dict[str, Any]]) -> dict[str, Any]:
    for activity in activity_runs:
        if activity.get("activityName"):
            return activity
    return {}


def write_runtime_governance_preview(
    *,
    output_dir: Path,
    rows_by_table: dict[str, list[dict[str, Any]]],
    pipeline_definition: dict[str, Any],
) -> dict[str, str]:
    ensure_dir(output_dir)
    definition_path = output_dir / "pipeline-definition.json"
    write_json(definition_path, pipeline_definition)
    control_dir = output_dir / "current"
    for table_name, rows in rows_by_table.items():
        write_csv(control_dir / f"{table_name}.csv", rows)
    return {
        "pipeline_definition_path": str(definition_path),
        "control_root": str(control_dir),
    }


def materialize_governance_live(
    *,
    client: FabricClient,
    contract: dict[str, Any],
    medallion_contract: dict[str, Any],
    output_dir: Path,
    rows_by_table: dict[str, list[dict[str, Any]]],
    lakehouse_item: dict[str, Any],
) -> dict[str, Any]:
    control_dir = output_dir / "current"
    for table_name, rows in rows_by_table.items():
        write_csv(control_dir / f"{table_name}.csv", rows)

    governance_notebook_source = (
        REPO_ROOT / "05-compat" / "scripts" / "fab001_runtime_governance_notebook.py"
    ).read_text(encoding="utf-8")
    governance_notebook = client.create_or_update_notebook(
        contract["governance_notebook"]["name"],
        contract["governance_notebook"]["description"],
        build_notebook_ipynb(governance_notebook_source),
    )

    uploaded_files = client.upload_tree_to_onelake(
        lakehouse_item["id"],
        control_dir,
        contract["runtime_governance"]["remote_root"],
    )
    notebook_item = governance_notebook.get("item") or client.find_item(
        contract["governance_notebook"]["name"],
        "Notebook",
    )
    if not notebook_item:
        raise RuntimeError("Governance notebook item was not available after create/update.")

    notebook_run = client.run_notebook(
        notebook_item["id"],
        lakehouse_id=lakehouse_item["id"],
        lakehouse_name=DEFAULT_LAKEHOUSE_NAME,
    )
    if not notebook_run.get("job_location"):
        raise RuntimeError("Governance notebook run did not return a job location.")
    notebook_job = client.poll_job(notebook_run["job_location"], retries=24, delay_seconds=10)
    if notebook_job.get("status") != "Completed":
        raise RuntimeError(f"Governance notebook did not complete successfully: {notebook_job}")

    visible_tables = {
        table.get("name")
        for table in client.list_lakehouse_tables(lakehouse_item["id"])
    }
    expected_tables = set(contract["runtime_governance"]["tables"])
    missing_tables = sorted(expected_tables.difference(visible_tables))
    if missing_tables:
        raise RuntimeError(f"Runtime-governance tables missing from Lakehouse: {missing_tables}")

    return {
        "governance_notebook": notebook_item,
        "uploaded_files": uploaded_files,
        "notebook_job": notebook_job,
        "visible_runtime_tables": sorted(expected_tables),
    }


def build_notebook_ipynb(source: str) -> str:
    notebook = {
        "cells": [
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [line if line.endswith("\n") else f"{line}\n" for line in source.splitlines()],
            }
        ],
        "metadata": {
            "language_info": {"name": "python"},
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
        },
        "nbformat": 4,
        "nbformat_minor": 5,
    }
    return json.dumps(notebook, indent=2)


def main() -> int:
    args = parse_args()
    contract = load_json(Path(args.contract))
    medallion_contract = load_json(Path(args.medallion_contract))
    output_dir = Path(args.output_dir).resolve()
    pipeline_report_path = Path(args.pipeline_report_path).resolve()
    governance_report_path = Path(args.governance_report_path).resolve()
    release_ledger_dir = Path(args.release_ledger_dir).resolve()
    semantic_report = read_optional_json(Path(args.semantic_report_path).resolve())
    report_shell_report = read_optional_json(Path(args.report_shell_report_path).resolve())
    public_serving_extract_report = read_optional_json(
        Path(args.public_serving_extract_report_path).resolve()
    )

    ensure_dir(output_dir)

    if args.preview_only:
        pipeline_definition = build_pipeline_definition(
            notebook_id=args.loader_notebook_id,
            workspace_id=args.workspace_id,
            contract=contract,
        )
        preview_pipeline_report = {
            "pipeline": {
                "id": "preview-pipeline-id",
                "displayName": contract["pipeline"]["name"],
            },
            "loader_notebook": {
                "id": args.loader_notebook_id,
                "displayName": contract["loader_notebook"]["name"],
            },
            "pipeline_job": {
                "id": "preview-pipeline-run-id",
                "status": "Completed",
                "startTimeUtc": utc_now_iso(),
                "endTimeUtc": utc_now_iso(),
                "failureReason": None,
            },
            "pipeline_activity_runs": [
                {
                    "activityName": contract["pipeline"]["activity_name"],
                    "activityRunId": "preview-activity-run-id",
                    "status": "Completed",
                    "activityRunStart": utc_now_iso(),
                    "activityRunEnd": utc_now_iso(),
                }
            ],
            "recorded_at_utc": utc_now_iso(),
            "pipeline_status": "Completed",
            "runtime_execution_mode": "pipeline_notebook_activity_preview",
            "runtime_sequence": contract.get("runtime_sequence", []),
            "public_serving_extract": build_public_serving_extract_state(
                contract=contract,
                pipeline_report={},
                extract_report=public_serving_extract_report,
            ),
        }
        rows_by_table = build_runtime_governance_rows(
            contract=contract,
            release_ledger_dir=release_ledger_dir,
            pipeline_report=preview_pipeline_report,
            public_serving_extract_report=public_serving_extract_report,
            semantic_report=semantic_report,
            report_shell_report=report_shell_report,
            medallion_contract=medallion_contract,
        )
        preview_paths = write_runtime_governance_preview(
            output_dir=output_dir,
            rows_by_table=rows_by_table,
            pipeline_definition=pipeline_definition,
        )
        write_json(
            pipeline_report_path,
            {
                **preview_pipeline_report,
                "report_type": "fab001_runtime_pipeline",
                "mode": "preview_only",
                "pipeline_definition_path": preview_paths["pipeline_definition_path"],
                "control_root": preview_paths["control_root"],
            },
        )
        print(f"Wrote preview pipeline definition: {preview_paths['pipeline_definition_path']}")
        print(f"Wrote preview runtime-governance payloads: {preview_paths['control_root']}")
        return 0

    if not (args.create_pipeline or args.run_pipeline or args.materialize_governance):
        raise RuntimeError(
            "Nothing to do. Use --preview-only or one of --create-pipeline, --run-pipeline, --materialize-governance."
        )

    client = FabricClient.from_env()
    lakehouse_item = client.find_item(DEFAULT_LAKEHOUSE_NAME, "Lakehouse")
    if not lakehouse_item:
        raise RuntimeError(f"Lakehouse not found in workspace: {DEFAULT_LAKEHOUSE_NAME}")
    loader_notebook = client.find_item(contract["loader_notebook"]["name"], "Notebook")
    if not loader_notebook:
        raise RuntimeError(f"Loader notebook not found in workspace: {contract['loader_notebook']['name']}")

    pipeline_definition = build_pipeline_definition(
        notebook_id=loader_notebook["id"],
        workspace_id=client.workspace_id,
        contract=contract,
    )

    pipeline_item = client.find_item(contract["pipeline"]["name"], "DataPipeline")
    pipeline_result: dict[str, Any] | None = None
    if args.create_pipeline:
        pipeline_result = client.create_or_update_data_pipeline(
            contract["pipeline"]["name"],
            contract["pipeline"]["description"],
            json.dumps(pipeline_definition, indent=2),
        )
        pipeline_item = pipeline_result.get("item") or client.find_item(
            contract["pipeline"]["name"],
            "DataPipeline",
        )
    if not pipeline_item:
        raise RuntimeError(f"Runtime pipeline not found in workspace: {contract['pipeline']['name']}")

    pipeline_report: dict[str, Any] = {
        "report_type": "fab001_runtime_pipeline",
        "recorded_at_utc": utc_now_iso(),
        "pipeline": pipeline_item,
        "loader_notebook": loader_notebook,
        "pipeline_definition": pipeline_definition,
        "pipeline_result": pipeline_result,
        "runtime_sequence": contract.get("runtime_sequence", []),
        "public_serving_extract": build_public_serving_extract_state(
            contract=contract,
            pipeline_report={},
            extract_report=public_serving_extract_report,
        ),
    }

    if args.run_pipeline:
        run_result = client.run_data_pipeline(
            pipeline_item["id"],
            pipeline_name=contract["pipeline"]["name"],
        )
        if not run_result.get("job_location"):
            raise RuntimeError("Runtime pipeline run did not return a job location.")
        pipeline_job = client.poll_job(run_result["job_location"], retries=36, delay_seconds=15)
        if not pipeline_job:
            raise RuntimeError("Runtime pipeline poll returned no payload.")
        start_time = normalize_timestamp(pipeline_job.get("startTimeUtc") or pipeline_job.get("start_time_utc"))
        end_time = normalize_timestamp(
            pipeline_job.get("endTimeUtc")
            or pipeline_job.get("end_time_utc")
            or utc_now_iso()
        )
        activity_runs = client.query_pipeline_activity_runs(
            pipeline_job["id"],
            last_updated_after=(datetime.fromisoformat(start_time.replace("Z", "+00:00")) - timedelta(minutes=5)).replace(microsecond=0).isoformat(),
            last_updated_before=(datetime.fromisoformat(end_time.replace("Z", "+00:00")) + timedelta(minutes=5)).replace(microsecond=0).isoformat(),
        )
        pipeline_report["pipeline_job"] = pipeline_job
        pipeline_report["pipeline_activity_runs"] = activity_runs
        pipeline_report["pipeline_status"] = pipeline_job.get("status")
        if pipeline_job.get("status") != "Completed":
            direct_loader_run = client.run_notebook(
                loader_notebook["id"],
                lakehouse_id=lakehouse_item["id"],
                lakehouse_name=DEFAULT_LAKEHOUSE_NAME,
            )
            if not direct_loader_run.get("job_location"):
                raise RuntimeError("Direct loader notebook fallback did not return a job location.")
            direct_loader_job = client.poll_job(
                direct_loader_run["job_location"],
                retries=36,
                delay_seconds=15,
            )
            pipeline_report["loader_notebook_job"] = direct_loader_job
            pipeline_report["runtime_execution_mode"] = "pipeline_then_direct_notebook_fallback"
            if direct_loader_job.get("status") != "Completed":
                raise RuntimeError(
                    f"Direct loader notebook fallback did not complete successfully: {direct_loader_job}"
                )
        else:
            pipeline_report["runtime_execution_mode"] = "pipeline_notebook_activity"
    write_json(pipeline_report_path, pipeline_report)

    if args.materialize_governance:
        rows_by_table = build_runtime_governance_rows(
            contract=contract,
            release_ledger_dir=release_ledger_dir,
            pipeline_report=pipeline_report,
            public_serving_extract_report=public_serving_extract_report,
            semantic_report=semantic_report,
            report_shell_report=report_shell_report,
            medallion_contract=medallion_contract,
        )
        governance_result = materialize_governance_live(
            client=client,
            contract=contract,
            medallion_contract=medallion_contract,
            output_dir=output_dir,
            rows_by_table=rows_by_table,
            lakehouse_item=lakehouse_item,
        )
        write_json(
            governance_report_path,
            {
                "report_type": "fab001_runtime_governance",
                "recorded_at_utc": utc_now_iso(),
                "pipeline_report_path": str(pipeline_report_path),
                "runtime_governance_root": contract["runtime_governance"]["remote_root"],
                "tables": sorted(rows_by_table.keys()),
                "governance_result": governance_result,
            },
        )
        print(f"Wrote runtime governance report: {governance_report_path}")

    print(f"Wrote runtime pipeline report: {pipeline_report_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
