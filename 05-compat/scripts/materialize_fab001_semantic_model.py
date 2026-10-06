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
DEFAULT_CONTRACT_PATH = REPO_ROOT / "05-compat" / "contracts" / "fab001_semantic_model_contract.json"
DEFAULT_OUTPUT_DIR = REPO_ROOT / "_bmad-output" / "test-artifacts" / "fabric-proof" / "fab001" / "semantic-model-live"
DEFAULT_MODEL_NAME = "sm_fab001_supply_chain_decision"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Patch the live FAB001 semantic model with the bounded measure pack."
    )
    parser.add_argument(
        "--semantic-model-name",
        default=DEFAULT_MODEL_NAME,
        help="Display name of the semantic model to patch.",
    )
    parser.add_argument(
        "--contract",
        default=str(DEFAULT_CONTRACT_PATH),
        help="Path to the semantic model contract JSON.",
    )
    parser.add_argument(
        "--output-dir",
        default=str(DEFAULT_OUTPUT_DIR),
        help="Local working directory for fetched and patched TMDL.",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Fail if the live semantic model is missing a table referenced by the contract.",
    )
    return parser.parse_args()


def fetch_definition(client: FabricClient, semantic_model_id: str) -> dict[str, Any]:
    status, payload, headers = client._request_json(
        "POST",
        f"https://api.fabric.microsoft.com/v1/workspaces/{client.workspace_id}/semanticModels/{semantic_model_id}/getDefinition",
        {},
    )
    if status != 202:
        raise RuntimeError(f"Get semantic model definition start failed with status {status}: {payload}")
    operation_id = headers.get("x-ms-operation-id") or headers.get("X-Ms-Operation-Id")
    if not operation_id:
        raise RuntimeError("Get semantic model definition did not return x-ms-operation-id.")

    operation = client.poll_job(
        f"https://api.fabric.microsoft.com/v1/operations/{operation_id}",
        retries=24,
        delay_seconds=5,
    )
    if operation.get("status") != "Succeeded":
        raise RuntimeError(f"Get semantic model definition did not succeed: {operation}")

    result_status, result_payload, _ = client._request_json(
        "GET", f"https://api.fabric.microsoft.com/v1/operations/{operation_id}/result"
    )
    if result_status != 200:
        raise RuntimeError(
            f"Get semantic model definition result failed with status {result_status}: {result_payload}"
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


def build_measure_block(measure: dict[str, str]) -> str:
    name = measure["name"].replace("'", "''")
    expression = measure["expression"]
    if "\n" in expression:
        expr = "\n".join(f"\t\t{line}" for line in expression.splitlines())
        header = f"\tmeasure '{name}' =\n{expr}\n"
    else:
        header = f"\tmeasure '{name}' = {expression}\n"
    return header + f"\t\tformatString: {measure['format_string']}\n"


def patch_table_definition(table_text: str, measures: list[dict[str, str]]) -> str:
    pending: list[dict[str, str]] = []
    for measure in measures:
        escaped_name = measure["name"].replace("'", "''")
        if f"measure '{escaped_name}'" not in table_text:
            pending.append(measure)
    if not pending:
        return table_text

    partition_marker = "\n\tpartition "
    insert_at = table_text.find(partition_marker)
    if insert_at == -1:
        if not table_text.endswith("\n"):
            table_text += "\n"
        insert_at = len(table_text)

    measure_blob = "\n" + "\n".join(build_measure_block(measure) for measure in pending).rstrip() + "\n"
    return table_text[:insert_at] + measure_blob + table_text[insert_at:]


def patch_definition(
    decoded: dict[str, str],
    contract: dict[str, Any],
    *,
    strict: bool = False,
) -> tuple[dict[str, str], list[str]]:
    measures_by_table: dict[str, list[dict[str, str]]] = {}
    for measure in contract["measures"]:
        measures_by_table.setdefault(measure["table"], []).append(measure)

    missing_table_parts: list[str] = []
    for table_name, measures in measures_by_table.items():
        path = f"definition/tables/{table_name}.tmdl"
        if path not in decoded:
            if strict:
                raise RuntimeError(f"Expected table definition part missing: {path}")
            missing_table_parts.append(path)
            continue
        decoded[path] = patch_table_definition(decoded[path], measures)
    return decoded, missing_table_parts


def update_definition(
    client: FabricClient,
    semantic_model_id: str,
    parts: list[dict[str, str]],
) -> dict[str, Any]:
    status, payload, headers = client._request_json(
        "POST",
        f"https://api.fabric.microsoft.com/v1/workspaces/{client.workspace_id}/semanticModels/{semantic_model_id}/updateDefinition",
        {"definition": {"parts": parts}},
    )
    if status not in {200, 202}:
        raise RuntimeError(f"Update semantic model definition failed with status {status}: {payload}")
    if status == 200:
        return {"status": "Succeeded", "result": payload}

    operation_id = headers.get("x-ms-operation-id") or headers.get("X-Ms-Operation-Id")
    if not operation_id:
        raise RuntimeError("Update semantic model definition did not return x-ms-operation-id.")
    operation = client.poll_job(
        f"https://api.fabric.microsoft.com/v1/operations/{operation_id}",
        retries=24,
        delay_seconds=5,
    )
    if operation.get("status") != "Succeeded":
        raise RuntimeError(f"Update semantic model definition did not succeed: {operation}")
    return operation


def main() -> int:
    args = parse_args()
    client = FabricClient.from_env()
    output_dir = Path(args.output_dir).resolve()
    contract = json.loads(Path(args.contract).read_text(encoding="utf-8"))

    item = client.find_item(args.semantic_model_name, "SemanticModel")
    if not item:
        raise RuntimeError(f"Semantic model not found in workspace: {args.semantic_model_name}")

    live_definition = fetch_definition(client, item["id"])
    fetched_dir = output_dir / "fetched"
    patched_dir = output_dir / "patched"
    decoded = decode_parts(live_definition, fetched_dir)
    patched, missing_table_parts = patch_definition(dict(decoded), contract, strict=args.strict)

    for path, payload in patched.items():
        target = patched_dir / path
        ensure_dir(target.parent)
        target.write_text(payload, encoding="utf-8")

    update_result = update_definition(client, item["id"], encode_parts(patched))

    skipped_tables = {
        missing_path.removeprefix("definition/tables/").removesuffix(".tmdl")
        for missing_path in missing_table_parts
    }
    patched_measure_names = [
        measure["name"] for measure in contract["measures"] if measure["table"] not in skipped_tables
    ]
    skipped_measure_names = [
        measure["name"] for measure in contract["measures"] if measure["table"] in skipped_tables
    ]

    report = {
        "semantic_model": item,
        "requested_measure_count": len(contract["measures"]),
        "patched_measure_count": len(patched_measure_names),
        "patched_measures": patched_measure_names,
        "skipped_measure_count": len(skipped_measure_names),
        "skipped_measures": skipped_measure_names,
        "skipped_missing_table_parts": missing_table_parts,
        "strict_mode": args.strict,
        "updated_at_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "update_result": update_result,
    }
    ensure_dir(output_dir)
    (output_dir / "materialization-report.json").write_text(
        json.dumps(report, indent=2), encoding="utf-8"
    )
    print(f"Patched semantic model: {item['displayName']} ({item['id']})")
    print(f"Wrote report: {output_dir / 'materialization-report.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
