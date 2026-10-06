#!/usr/bin/env python3
from __future__ import annotations

import argparse
import base64
import json
import time
from pathlib import Path
from typing import Any

from common_fabric import FabricClient, ensure_dir


REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUTPUT_DIR = REPO_ROOT / "_bmad-output" / "test-artifacts" / "fabric-proof" / "fab001" / "report-live"
DEFAULT_REPORT_NAME = "rpt_fab001_supply_chain_decision"
DEFAULT_PAGE_NAME = "Supply Chain Decision View"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fetch and normalize the live FAB001 report shell."
    )
    parser.add_argument(
        "--report-name",
        default=DEFAULT_REPORT_NAME,
        help="Display name of the live report to patch.",
    )
    parser.add_argument(
        "--page-name",
        default=DEFAULT_PAGE_NAME,
        help="Display name to apply to the first report page.",
    )
    parser.add_argument(
        "--output-dir",
        default=str(DEFAULT_OUTPUT_DIR),
        help="Local output directory for fetched and patched PBIR-Legacy parts.",
    )
    return parser.parse_args()


def fetch_report_definition(client: FabricClient, report_id: str) -> dict[str, Any]:
    status, payload, headers = client._request_json(
        "POST",
        f"https://api.fabric.microsoft.com/v1/workspaces/{client.workspace_id}/reports/{report_id}/getDefinition",
        {},
    )
    if status != 202:
        raise RuntimeError(f"Get report definition start failed with status {status}: {payload}")
    operation_id = headers.get("x-ms-operation-id") or headers.get("X-Ms-Operation-Id")
    if not operation_id:
        raise RuntimeError("Get report definition did not return x-ms-operation-id.")

    operation = client.poll_job(
        f"https://api.fabric.microsoft.com/v1/operations/{operation_id}",
        retries=24,
        delay_seconds=5,
    )
    if operation.get("status") != "Succeeded":
        raise RuntimeError(f"Get report definition did not succeed: {operation}")

    result_status, result_payload, _ = client._request_json(
        "GET", f"https://api.fabric.microsoft.com/v1/operations/{operation_id}/result"
    )
    if result_status != 200:
        raise RuntimeError(
            f"Get report definition result failed with status {result_status}: {result_payload}"
        )
    return result_payload


def decode_parts(definition: dict[str, Any], output_dir: Path) -> dict[str, str]:
    ensure_dir(output_dir)
    decoded: dict[str, str] = {}
    for part in definition["definition"]["parts"]:
        payload = base64.b64decode(part["payload"]).decode("utf-8")
        decoded[part["path"]] = payload
        target = output_dir / part["path"]
        ensure_dir(target.parent)
        target.write_text(payload, encoding="utf-8")
    return decoded


def encode_parts(decoded: dict[str, str]) -> list[dict[str, str]]:
    parts: list[dict[str, str]] = []
    for path in sorted(decoded.keys()):
        parts.append(
            {
                "path": path,
                "payload": base64.b64encode(decoded[path].encode("utf-8")).decode("utf-8"),
                "payloadType": "InlineBase64",
            }
        )
    return parts


def patch_report_json(report_text: str, page_name: str) -> str:
    payload = json.loads(report_text)
    sections = payload.get("sections") or []
    if not sections:
        raise RuntimeError("Report shell did not include any sections.")
    sections[0]["displayName"] = page_name
    payload["sections"] = sections
    return json.dumps(payload, indent=2)


def update_report_definition(client: FabricClient, report_id: str, parts: list[dict[str, str]]) -> dict[str, Any]:
    status, payload, headers = client._request_json(
        "POST",
        f"https://api.fabric.microsoft.com/v1/workspaces/{client.workspace_id}/reports/{report_id}/updateDefinition",
        {"definition": {"parts": parts}},
    )
    if status not in {200, 202}:
        raise RuntimeError(f"Update report definition failed with status {status}: {payload}")
    if status == 200:
        return {"status": "Succeeded", "result": payload}

    operation_id = headers.get("x-ms-operation-id") or headers.get("X-Ms-Operation-Id")
    if not operation_id:
        raise RuntimeError("Update report definition did not return x-ms-operation-id.")
    operation = client.poll_job(
        f"https://api.fabric.microsoft.com/v1/operations/{operation_id}",
        retries=24,
        delay_seconds=5,
    )
    if operation.get("status") != "Succeeded":
        raise RuntimeError(f"Update report definition did not succeed: {operation}")
    return operation


def main() -> int:
    args = parse_args()
    client = FabricClient.from_env()
    output_dir = Path(args.output_dir).resolve()

    item = client.find_item(args.report_name, "Report")
    if not item:
        raise RuntimeError(f"Report not found in workspace: {args.report_name}")

    live_definition = fetch_report_definition(client, item["id"])
    fetched_dir = output_dir / "fetched"
    patched_dir = output_dir / "patched"
    decoded = decode_parts(live_definition, fetched_dir)
    decoded["report.json"] = patch_report_json(decoded["report.json"], args.page_name)

    for path, payload in decoded.items():
        target = patched_dir / path
        ensure_dir(target.parent)
        target.write_text(payload, encoding="utf-8")

    update_result = update_report_definition(client, item["id"], encode_parts(decoded))

    report = {
        "report": item,
        "page_name": args.page_name,
        "updated_at_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "update_result": update_result,
    }
    ensure_dir(output_dir)
    (output_dir / "report-shell-report.json").write_text(
        json.dumps(report, indent=2), encoding="utf-8"
    )
    print(f"Patched report shell: {item['displayName']} ({item['id']})")
    print(f"Wrote report: {output_dir / 'report-shell-report.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
