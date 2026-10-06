#!/usr/bin/env python3
from __future__ import annotations

import base64
import csv
import json
import os
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib import error, parse, request


REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_PUBLICATION_DIR = REPO_ROOT / "platform" / "fabric" / "publication" / "current"
DEFAULT_OUTPUT_DIR = (
    REPO_ROOT / "_bmad-output" / "test-artifacts" / "fabric-proof" / "fab001" / "current"
)
FABRIC_API_BASE_URL = "https://api.fabric.microsoft.com/v1"
FABRIC_SCOPE = "https://api.fabric.microsoft.com/.default"
STORAGE_SCOPE = "https://storage.azure.com/.default"
ONELAKE_DFS_BASE_URL = "https://onelake.dfs.fabric.microsoft.com"


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def read_json_rows(path: Path) -> list[dict[str, Any]]:
    with path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if not isinstance(payload, list):
        raise ValueError(f"{path} did not contain a JSON array.")
    return [row for row in payload if isinstance(row, dict)]


def write_json(path: Path, payload: Any) -> None:
    ensure_dir(path.parent)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=False)
        handle.write("\n")


def write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    ensure_dir(path.parent)
    if not rows:
        with path.open("w", encoding="utf-8", newline="") as handle:
            handle.write("")
        return

    fieldnames: list[str] = []
    seen: set[str] = set()
    for row in rows:
        for key in row.keys():
            if key not in seen:
                seen.add(key)
                fieldnames.append(key)

    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def title_case_code(value: str) -> str:
    return " ".join(segment.capitalize() for segment in value.lower().split("_"))


def require_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


@dataclass
class FabricClient:
    tenant_id: str
    client_id: str
    client_secret: str
    workspace_id: str

    @classmethod
    def from_env(cls) -> "FabricClient":
        return cls(
            tenant_id=require_env("FABRIC_TENANT_ID"),
            client_id=require_env("FABRIC_CLIENT_ID"),
            client_secret=require_env("FABRIC_CLIENT_SECRET"),
            workspace_id=require_env("FABRIC_WORKSPACE_ID"),
        )

    def _token(self, scope: str = FABRIC_SCOPE) -> str:
        token_url = (
            f"https://login.microsoftonline.com/{self.tenant_id}/oauth2/v2.0/token"
        )
        payload = (
            f"client_id={self.client_id}&client_secret={self.client_secret}"
            f"&scope={scope}&grant_type=client_credentials"
        ).encode("utf-8")
        req = request.Request(
            token_url,
            data=payload,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST",
        )
        with request.urlopen(req, timeout=60) as response:
            body = json.loads(response.read().decode("utf-8"))
        return body["access_token"]

    def _request_json(
        self,
        method: str,
        url: str,
        payload: dict[str, Any] | None = None,
        token: str | None = None,
        retries: int = 3,
        retry_delay_seconds: int = 5,
    ) -> tuple[int, dict[str, Any], dict[str, str]]:
        body = None
        headers = {"Accept": "application/json"}
        if payload is not None:
            body = json.dumps(payload).encode("utf-8")
            headers["Content-Type"] = "application/json"
        headers["Authorization"] = f"Bearer {token or self._token()}"
        last_url_error: error.URLError | None = None
        for attempt in range(retries):
            req = request.Request(url, data=body, headers=headers, method=method)
            try:
                with request.urlopen(req, timeout=60) as response:
                    raw = response.read().decode("utf-8")
                    parsed = json.loads(raw) if raw else {}
                    return int(getattr(response, "status", 200)), parsed, dict(response.headers)
            except error.HTTPError as exc:
                raw = exc.read().decode("utf-8", errors="replace")
                try:
                    parsed = json.loads(raw) if raw else {}
                except json.JSONDecodeError:
                    parsed = {"raw": raw}
                return int(exc.code), parsed, dict(exc.headers)
            except error.URLError as exc:
                last_url_error = exc
                if attempt == retries - 1:
                    break
                time.sleep(retry_delay_seconds)
        raise RuntimeError(f"JSON request failed for {url}: {last_url_error}")

    def _request_bytes(
        self,
        method: str,
        url: str,
        body: bytes | None = None,
        headers: dict[str, str] | None = None,
        token: str | None = None,
        scope: str = FABRIC_SCOPE,
        retries: int = 3,
        retry_delay_seconds: int = 5,
    ) -> tuple[int, bytes, dict[str, str]]:
        merged_headers = dict(headers or {})
        merged_headers["Authorization"] = f"Bearer {token or self._token(scope)}"
        last_url_error: error.URLError | None = None
        for attempt in range(retries):
            req = request.Request(url, data=body, headers=merged_headers, method=method)
            try:
                with request.urlopen(req, timeout=120) as response:
                    return int(getattr(response, "status", 200)), response.read(), dict(response.headers)
            except error.HTTPError as exc:
                return int(exc.code), exc.read(), dict(exc.headers)
            except error.URLError as exc:
                last_url_error = exc
                if attempt == retries - 1:
                    break
                time.sleep(retry_delay_seconds)
        raise RuntimeError(f"Byte request failed for {url}: {last_url_error}")

    def workspace_items(self) -> list[dict[str, Any]]:
        status, payload, _ = self._request_json(
            "GET", f"{FABRIC_API_BASE_URL}/workspaces/{self.workspace_id}/items"
        )
        if status != 200:
            raise RuntimeError(f"Workspace items request failed with status {status}: {payload}")
        return payload.get("value", [])

    def find_item(self, display_name: str, item_type: str | None = None) -> dict[str, Any] | None:
        for item in self.workspace_items():
            if item.get("displayName") != display_name:
                continue
            if item_type and item.get("type") != item_type:
                continue
            return item
        return None

    def create_lakehouse(self, display_name: str, description: str) -> dict[str, Any]:
        existing = self.find_item(display_name, "Lakehouse")
        if existing:
            return {"status": "existing", "item": existing}

        token = self._token()
        status, payload, headers = self._request_json(
            "POST",
            f"{FABRIC_API_BASE_URL}/workspaces/{self.workspace_id}/lakehouses",
            {"displayName": display_name, "description": description},
            token=token,
        )

        if status == 201:
            return {"status": "created", "item": payload}

        if status == 202:
            operation_url = headers.get("Location")
            if not operation_url:
                return {"status": "accepted", "operation": None, "item": payload}
            operation_payload = self._poll_operation(operation_url, token)
            return {"status": "accepted", "operation": operation_payload, "item": payload}

        raise RuntimeError(f"Lakehouse creation failed with status {status}: {payload}")

    def _poll_operation(
        self, operation_url: str, token: str, retries: int = 10, delay_seconds: int = 5
    ) -> dict[str, Any]:
        latest: dict[str, Any] = {}
        for _ in range(retries):
            status, payload, _ = self._request_json("GET", operation_url, token=token)
            latest = payload
            if status == 200 and payload.get("status") in {"Succeeded", "Failed"}:
                return payload
            time.sleep(delay_seconds)
        return latest

    def get_lakehouse(self, lakehouse_id: str) -> dict[str, Any]:
        status, payload, _ = self._request_json(
            "GET",
            f"{FABRIC_API_BASE_URL}/workspaces/{self.workspace_id}/lakehouses/{lakehouse_id}",
        )
        if status != 200:
            raise RuntimeError(f"Get Lakehouse failed with status {status}: {payload}")
        return payload

    def list_lakehouse_tables(self, lakehouse_id: str) -> list[dict[str, Any]]:
        status, payload, _ = self._request_json(
            "GET",
            f"{FABRIC_API_BASE_URL}/workspaces/{self.workspace_id}/lakehouses/{lakehouse_id}/tables",
        )
        if status != 200:
            raise RuntimeError(f"List Lakehouse tables failed with status {status}: {payload}")
        return payload.get("data", [])

    def _onelake_url(self, item_id: str, relative_path: str) -> str:
        quoted_path = parse.quote(relative_path.strip("/"), safe="/")
        return f"{ONELAKE_DFS_BASE_URL}/{self.workspace_id}/{item_id}/{quoted_path}"

    def create_onelake_directory(self, item_id: str, relative_path: str) -> None:
        storage_token = self._token(STORAGE_SCOPE)
        url = f"{self._onelake_url(item_id, relative_path)}?resource=directory"
        status, raw, _ = self._request_bytes(
            "PUT",
            url,
            headers={"x-ms-version": "2021-06-08"},
            token=storage_token,
            scope=STORAGE_SCOPE,
        )
        if status not in {200, 201, 202, 409}:
            message = raw.decode("utf-8", errors="replace")
            raise RuntimeError(
                f"Create OneLake directory failed for {relative_path} with status {status}: {message}"
            )

    def upload_onelake_file(self, item_id: str, relative_path: str, local_path: Path) -> None:
        storage_token = self._token(STORAGE_SCOPE)
        parent = Path(relative_path).parent.as_posix()
        if parent and parent != ".":
            current = ""
            for segment in parent.split("/"):
                current = f"{current}/{segment}".strip("/")
                self.create_onelake_directory(item_id, current)

        target_url = f"{self._onelake_url(item_id, relative_path)}?resource=file"
        status, raw, _ = self._request_bytes(
            "PUT",
            target_url,
            headers={"x-ms-version": "2021-06-08"},
            token=storage_token,
            scope=STORAGE_SCOPE,
        )
        if status not in {200, 201}:
            message = raw.decode("utf-8", errors="replace")
            raise RuntimeError(
                f"Create OneLake file failed for {relative_path} with status {status}: {message}"
            )

        payload = local_path.read_bytes()
        append_url = f"{self._onelake_url(item_id, relative_path)}?action=append&position=0"
        status, raw, _ = self._request_bytes(
            "PATCH",
            append_url,
            body=payload,
            headers={
                "x-ms-version": "2021-06-08",
                "Content-Type": "application/octet-stream",
                "Content-Length": str(len(payload)),
            },
            token=storage_token,
            scope=STORAGE_SCOPE,
        )
        if status not in {200, 202}:
            message = raw.decode("utf-8", errors="replace")
            raise RuntimeError(
                f"Append OneLake file failed for {relative_path} with status {status}: {message}"
            )

        flush_url = (
            f"{self._onelake_url(item_id, relative_path)}?action=flush&position={len(payload)}"
        )
        status, raw, _ = self._request_bytes(
            "PATCH",
            flush_url,
            headers={"x-ms-version": "2021-06-08", "Content-Length": "0"},
            token=storage_token,
            scope=STORAGE_SCOPE,
        )
        if status not in {200, 202}:
            message = raw.decode("utf-8", errors="replace")
            raise RuntimeError(
                f"Flush OneLake file failed for {relative_path} with status {status}: {message}"
            )

    def upload_tree_to_onelake(self, item_id: str, local_root: Path, remote_root: str) -> list[str]:
        uploaded: list[str] = []
        for local_path in sorted(path for path in local_root.rglob("*") if path.is_file()):
            relative = local_path.relative_to(local_root).as_posix()
            target = f"{remote_root.strip('/')}/{relative}"
            self.upload_onelake_file(item_id, target, local_path)
            uploaded.append(target)
        return uploaded

    def create_or_update_notebook(
        self,
        display_name: str,
        description: str,
        ipynb_payload: str,
    ) -> dict[str, Any]:
        definition = {
            "format": "ipynb",
            "parts": [
                {
                    "path": "artifact.content.ipynb",
                    "payload": base64.b64encode(ipynb_payload.encode("utf-8")).decode("utf-8"),
                    "payloadType": "InlineBase64",
                }
            ],
        }
        existing = self.find_item(display_name, "Notebook")
        if existing:
            status, payload, headers = self._request_json(
                "POST",
                f"{FABRIC_API_BASE_URL}/workspaces/{self.workspace_id}/notebooks/{existing['id']}/updateDefinition",
                {"definition": definition},
            )
            if status == 200:
                return {"status": "updated", "item": existing}
            if status == 202:
                operation_url = headers.get("Location")
                operation = self._poll_operation(operation_url, self._token()) if operation_url else {}
                return {"status": "updated_pending", "item": existing, "operation": operation}
            raise RuntimeError(f"Update notebook definition failed with status {status}: {payload}")

        status, payload, headers = self._request_json(
            "POST",
            f"{FABRIC_API_BASE_URL}/workspaces/{self.workspace_id}/notebooks",
            {
                "displayName": display_name,
                "description": description,
                "definition": definition,
            },
        )
        if status == 201:
            return {"status": "created", "item": payload}
        if status == 202:
            operation_url = headers.get("Location")
            operation = self._poll_operation(operation_url, self._token()) if operation_url else {}
            item = self.find_item(display_name, "Notebook")
            return {"status": "created_pending", "item": item, "operation": operation}
        raise RuntimeError(f"Create notebook failed with status {status}: {payload}")

    def create_or_update_data_pipeline(
        self,
        display_name: str,
        description: str,
        pipeline_payload: str,
    ) -> dict[str, Any]:
        definition = {
            "parts": [
                {
                    "path": "pipeline-content.json",
                    "payload": base64.b64encode(pipeline_payload.encode("utf-8")).decode("utf-8"),
                    "payloadType": "InlineBase64",
                }
            ],
        }
        existing = self.find_item(display_name, "DataPipeline")
        if existing:
            status, payload, headers = self._request_json(
                "POST",
                f"{FABRIC_API_BASE_URL}/workspaces/{self.workspace_id}/dataPipelines/{existing['id']}/updateDefinition",
                {"definition": definition},
            )
            if status == 200:
                return {"status": "updated", "item": existing}
            if status == 202:
                operation_url = headers.get("Location")
                operation = self._poll_operation(operation_url, self._token()) if operation_url else {}
                return {"status": "updated_pending", "item": existing, "operation": operation}
            raise RuntimeError(
                f"Update data pipeline definition failed with status {status}: {payload}"
            )

        status, payload, headers = self._request_json(
            "POST",
            f"{FABRIC_API_BASE_URL}/workspaces/{self.workspace_id}/dataPipelines",
            {
                "displayName": display_name,
                "description": description,
                "definition": definition,
            },
        )
        if status == 201:
            return {"status": "created", "item": payload}
        if status == 202:
            operation_url = headers.get("Location")
            operation = self._poll_operation(operation_url, self._token()) if operation_url else {}
            item = self.find_item(display_name, "DataPipeline")
            return {"status": "created_pending", "item": item, "operation": operation}
        raise RuntimeError(f"Create data pipeline failed with status {status}: {payload}")

    def run_notebook(
        self,
        notebook_id: str,
        *,
        lakehouse_id: str,
        lakehouse_name: str,
    ) -> dict[str, Any]:
        status, payload, headers = self._request_json(
            "POST",
            f"{FABRIC_API_BASE_URL}/workspaces/{self.workspace_id}/items/{notebook_id}/jobs/instances?jobType=RunNotebook",
            {
                "executionData": {
                    "configuration": {
                        "defaultLakehouse": {
                            "name": lakehouse_name,
                            "id": lakehouse_id,
                            "workspaceId": self.workspace_id,
                        }
                    }
                }
            },
        )
        if status != 202:
            raise RuntimeError(f"Run notebook failed with status {status}: {payload}")
        job_location = headers.get("Location")
        return {"status": "accepted", "job_location": job_location}

    def run_notebook_execute(
        self,
        notebook_id: str,
        *,
        lakehouse_id: str,
        lakehouse_name: str,
        parameters: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        configuration: dict[str, Any] = {
            "useStarterPool": False,
            "defaultLakehouse": {
                "name": lakehouse_name,
                "id": lakehouse_id,
                "workspaceId": self.workspace_id,
            },
        }
        if parameters:
            configuration["parameters"] = {
                key: {"value": str(value), "type": "String"}
                for key, value in parameters.items()
            }
        status, payload, headers = self._request_json(
            "POST",
            f"{FABRIC_API_BASE_URL}/workspaces/{self.workspace_id}/notebooks/{notebook_id}/jobs/execute",
            {"executionData": {"configuration": configuration}},
        )
        if status != 202:
            raise RuntimeError(f"Execute notebook failed with status {status}: {payload}")
        job_location = headers.get("Location")
        return {"status": "accepted", "job_location": job_location}

    def run_data_pipeline(self, pipeline_id: str, *, pipeline_name: str) -> dict[str, Any]:
        status, payload, headers = self._request_json(
            "POST",
            f"{FABRIC_API_BASE_URL}/workspaces/{self.workspace_id}/items/{pipeline_id}/jobs/instances?jobType=Pipeline",
            {"executionData": {"pipelineName": pipeline_name}},
        )
        if status != 202:
            raise RuntimeError(f"Run data pipeline failed with status {status}: {payload}")
        job_location = headers.get("Location")
        return {"status": "accepted", "job_location": job_location}

    def query_pipeline_activity_runs(
        self,
        pipeline_run_id: str,
        *,
        last_updated_after: str,
        last_updated_before: str,
    ) -> list[dict[str, Any]]:
        status, payload, _ = self._request_json(
            "POST",
            f"{FABRIC_API_BASE_URL}/workspaces/{self.workspace_id}/datapipelines/pipelineruns/{pipeline_run_id}/queryactivityruns",
            {
                "filters": [],
                "orderBy": [{"orderBy": "ActivityRunStart", "order": "DESC"}],
                "lastUpdatedAfter": last_updated_after,
                "lastUpdatedBefore": last_updated_before,
            },
        )
        if status != 200:
            raise RuntimeError(f"Query pipeline activity runs failed with status {status}: {payload}")
        if isinstance(payload, list):
            return [entry for entry in payload if isinstance(entry, dict)]
        return payload.get("value", [])

    def poll_job(self, job_location: str, retries: int = 30, delay_seconds: int = 20) -> dict[str, Any]:
        latest: dict[str, Any] = {}
        token = self._token()
        for _ in range(retries):
            status, payload, _ = self._request_json("GET", job_location, token=token)
            latest = payload
            if status == 200 and payload.get("status") in {
                "Completed",
                "Failed",
                "Canceled",
                "Deduped",
            }:
                return payload
            time.sleep(delay_seconds)
        return latest
