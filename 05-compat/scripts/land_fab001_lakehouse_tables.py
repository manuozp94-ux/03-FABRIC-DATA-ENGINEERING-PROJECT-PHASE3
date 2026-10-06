#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import shutil
import time
from collections import defaultdict
from pathlib import Path
from typing import Any

from common_fabric import (
    DEFAULT_OUTPUT_DIR,
    DEFAULT_PUBLICATION_DIR,
    FabricClient,
    REPO_ROOT,
    ensure_dir,
    read_json_rows,
    title_case_code,
    utc_now_iso,
    write_csv,
    write_json,
)


BRONZE_FILES = {
    "dim_product": "dim_product.json",
    "dim_product_family": "dim_product_family.json",
    "dim_account": "dim_account.json",
    "dim_inventory_location": "dim_inventory_location.json",
    "fact_demand_line": "fact_demand_line.json",
    "fact_inventory_inbound": "fact_inventory_inbound.json",
    "fact_inventory_snapshot": "fact_inventory_snapshot.json",
    "dim_service_region": "dim_service_region.json",
    "dim_supplier": "dim_supplier.json",
    "rule_supplier_product_lead_time": "rule_supplier_product_lead_time.json",
    "rule_location_transfer_lead_time": "rule_location_transfer_lead_time.json",
    "rule_location_service_lead_time": "rule_location_service_lead_time.json",
    "fact_supply_chain_decision_queue_line": "fact_supply_chain_decision_queue_line.json",
    "fact_logistics_decision_queue_line": "fact_logistics_decision_queue_line.json",
    "fact_purchase_order_line": "fact_purchase_order_line.json",
    "fact_purchase_order_status_history": "fact_purchase_order_status_history.json",
    "fact_inventory_movement_line": "fact_inventory_movement_line.json",
    "fact_sales_fulfillment_line": "fact_sales_fulfillment_line.json",
}
FINANCIAL_FOUNDATION_FILES = {
    "dim_pricing_context": "dim_pricing_context.json",
    "dim_cost_context": "dim_cost_context.json",
    "fact_cost_history": "fact_cost_history.json",
    "fact_price_list_history": "fact_price_list_history.json",
    "fact_sales_realization": "fact_sales_realization.json",
}

DEFAULT_LAKEHOUSE_NAME = "lh_fab001_public_proof"
DEFAULT_NOTEBOOK_NAME = "nb_fab001_lakehouse_loader"
DEFAULT_ONELAKE_BUNDLE_ROOT = "Files/fab001/current"
DEFAULT_REFERENCE_ROOT = "reference"
DEFAULT_FINANCIAL_FOUNDATION_DIR = (
    REPO_ROOT / "_bmad-output" / "test-artifacts" / "fabric-financial" / "current"
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create the bounded Fabric medallion bundle for notebook-first Fabric execution."
    )
    parser.add_argument(
        "--publication-dir",
        default=str(DEFAULT_PUBLICATION_DIR),
        help="Approved publication package directory.",
    )
    parser.add_argument(
        "--output-dir",
        default=str(DEFAULT_OUTPUT_DIR),
        help="Output directory for the medallion bundle.",
    )
    parser.add_argument(
        "--financial-foundation-dir",
        default=None,
        help="Optional bounded financial foundation directory to land into Fabric alongside the core proof bundle.",
    )
    parser.add_argument(
        "--lakehouse-name",
        default=DEFAULT_LAKEHOUSE_NAME,
        help="Target Fabric Lakehouse display name when creating one.",
    )
    parser.add_argument(
        "--create-lakehouse",
        action="store_true",
        help="Create or confirm the target Lakehouse in Fabric.",
    )
    parser.add_argument(
        "--upload-bundle",
        action="store_true",
        help="Upload the generated proof bundle into the target Lakehouse Files area.",
    )
    parser.add_argument(
        "--notebook-name",
        default=DEFAULT_NOTEBOOK_NAME,
        help="Notebook display name used for the explicit-schema lakehouse loader.",
    )
    parser.add_argument(
        "--create-loader-notebook",
        action="store_true",
        help="Create or update the Fabric notebook that loads the proof bundle into tables.",
    )
    parser.add_argument(
        "--run-loader-notebook",
        action="store_true",
        help="Run the Fabric notebook loader against the target Lakehouse.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the planned outputs without writing files.",
    )
    return parser.parse_args()


def to_service_level_band(criticality_band: str) -> str:
    if criticality_band in {"HIGH", "ELEVATED"}:
        return "HIGH"
    if criticality_band == "BASELINE":
        return "STANDARD"
    return "MONITOR"


def to_coverage_target_band(inventory_policy_class: str) -> str:
    if inventory_policy_class == "PALLET_BUFFER":
        return "BUFFERED"
    if inventory_policy_class in {"STAGE_AND_COORDINATE", "HIGH_DENSITY_BIN"}:
        return "SHORT"
    if inventory_policy_class == "CONTROLLED_STOCK":
        return "CONTROLLED"
    return "MONITOR"


def action_status(readiness_flag: str, available_qty: float | int) -> str:
    if readiness_flag != "READY" and available_qty <= 0:
        return "REPLENISH_OR_PRODUCE"
    if readiness_flag != "READY":
        return "MONITOR"
    return "HOLD"


def load_publication_rows(publication_dir: Path) -> dict[str, list[dict[str, Any]]]:
    return {
        name: read_json_rows(publication_dir / filename)
        for name, filename in BRONZE_FILES.items()
    }


def resolve_financial_foundation_dir(
    publication_dir: Path, financial_foundation_dir_arg: str | None
) -> Path | None:
    if financial_foundation_dir_arg:
        candidate = Path(financial_foundation_dir_arg).resolve()
        return candidate if candidate.exists() else None

    if publication_dir == DEFAULT_PUBLICATION_DIR and DEFAULT_FINANCIAL_FOUNDATION_DIR.exists():
        return DEFAULT_FINANCIAL_FOUNDATION_DIR

    return None


def load_financial_foundation_rows(
    financial_foundation_dir: Path | None,
) -> dict[str, list[dict[str, Any]]]:
    if financial_foundation_dir is None:
        return {}

    return {
        name: read_json_rows(financial_foundation_dir / filename)
        for name, filename in FINANCIAL_FOUNDATION_FILES.items()
    }


def raw_like_display(value: Any, index: int) -> Any:
    if value in {None, ""}:
        return value
    text = str(value)
    mode = index % 4
    if mode == 0:
        return text.lower().replace(" ", "-")
    if mode == 1:
        return f" {text.upper()} "
    return text


def raw_like_code(value: Any, index: int) -> Any:
    if value in {None, ""}:
        return value
    text = str(value)
    mode = index % 4
    if mode == 0:
        return text.lower().replace("_", " ")
    if mode == 1:
        return f" {text.lower().replace('_', '-')} "
    return text


def build_bronze_transport_rows(
    rows: dict[str, list[dict[str, Any]]],
) -> dict[str, list[dict[str, Any]]]:
    bronze_rows: dict[str, list[dict[str, Any]]] = {}
    for table_name, table_rows in rows.items():
        bronze_rows[table_name] = []
        for index, row in enumerate(table_rows):
            transport_row = dict(row)
            if table_name == "dim_product":
                transport_row["product_name"] = raw_like_display(
                    transport_row.get("product_name"), index
                )
            elif table_name == "dim_product_family":
                transport_row["product_family_name"] = raw_like_display(
                    transport_row.get("product_family_name"), index
                )
            elif table_name == "dim_account":
                transport_row["account_name"] = raw_like_display(
                    transport_row.get("account_name"), index
                )
                transport_row["customer_group"] = raw_like_display(
                    transport_row.get("customer_group"), index
                )
            elif table_name == "dim_inventory_location":
                transport_row["location_name"] = raw_like_display(
                    transport_row.get("location_name"), index
                )
            elif table_name == "fact_demand_line":
                transport_row["demand_status_code"] = raw_like_code(
                    transport_row.get("demand_status_code"), index
                )
                transport_row["priority_code"] = raw_like_code(
                    transport_row.get("priority_code"), index
                )
            elif table_name == "fact_inventory_inbound":
                transport_row["receipt_flow_type"] = raw_like_code(
                    transport_row.get("receipt_flow_type"), index
                )
            elif table_name == "fact_inventory_snapshot":
                transport_row["inventory_status_code"] = raw_like_code(
                    transport_row.get("inventory_status_code"), index
                )
                transport_row["readiness_flag"] = raw_like_code(
                    transport_row.get("readiness_flag"), index
                )
            bronze_rows[table_name].append(transport_row)
    return bronze_rows


def build_silver(rows: dict[str, list[dict[str, Any]]]) -> dict[str, list[dict[str, Any]]]:
    products = rows["dim_product"]
    families = rows["dim_product_family"]
    accounts = rows["dim_account"]
    locations = rows["dim_inventory_location"]
    demand_lines = rows["fact_demand_line"]
    inventory_inbound = rows["fact_inventory_inbound"]
    inventory_positions = rows["fact_inventory_snapshot"]

    product_by_sk = {row["product_sk"]: row for row in products}
    family_by_code = {row["product_family_code"]: row for row in families}
    account_by_sk = {row["account_sk"]: row for row in accounts}
    location_by_sk = {row["inventory_location_sk"]: row for row in locations}

    latest_snapshot_date = max(
        (row["snapshot_date"] for row in inventory_positions if row.get("snapshot_date")),
        default="",
    )

    silver_demand: list[dict[str, Any]] = []
    for row in demand_lines:
        product = product_by_sk.get(row["product_sk"], {})
        family = family_by_code.get(product.get("product_family_code"), {})
        account = account_by_sk.get(row["account_sk"], {})
        silver_demand.append(
            {
                **row,
                "event_month": row["event_date"][:7],
                "is_open": row["open_qty"] > 0,
                "product_code": product.get("product_code", ""),
                "product_name": product.get("product_name", ""),
                "product_family_code": product.get("product_family_code", ""),
                "product_family_name": family.get("product_family_name", ""),
                "inventory_policy_class": product.get("inventory_policy_class", ""),
                "lead_time_band": product.get("lead_time_band", ""),
                "criticality_band": product.get("criticality_band", ""),
                "account_code": account.get("account_code", ""),
                "account_name": account.get("account_name", ""),
                "customer_group": account.get("customer_group", ""),
                "account_pattern_class": account.get("account_pattern_class", ""),
                "service_network_code": account.get("service_network_code", ""),
                "fulfillment_context_code": account.get("fulfillment_context_code", ""),
            }
        )

    open_demand_by_product: dict[str, dict[str, float | int]] = defaultdict(
        lambda: {"open_demand_qty": 0, "open_demand_value_proxy": 0}
    )
    for row in demand_lines:
        if row["open_qty"] <= 0:
            continue
        bucket = open_demand_by_product[row["product_sk"]]
        bucket["open_demand_qty"] += row["open_qty"]
        bucket["open_demand_value_proxy"] += row["demand_value_proxy"]

    silver_inventory: list[dict[str, Any]] = []
    silver_inbound: list[dict[str, Any]] = []
    current_inventory: list[dict[str, Any]] = []
    for row in inventory_positions:
        product = product_by_sk.get(row["product_sk"], {})
        family = family_by_code.get(product.get("product_family_code"), {})
        location = location_by_sk.get(row["inventory_location_sk"], {})
        demand_bucket = open_demand_by_product.get(
            row["product_sk"], {"open_demand_qty": 0, "open_demand_value_proxy": 0}
        )
        enriched = {
            **row,
            "is_current_snapshot": row["snapshot_date"] == latest_snapshot_date,
            "action_status": action_status(row["readiness_flag"], row["available_qty"]),
            "target_service_level_band": to_service_level_band(
                product.get("criticality_band", "UNKNOWN")
            ),
            "coverage_target_band": to_coverage_target_band(
                product.get("inventory_policy_class", "UNKNOWN")
            ),
            "product_code": product.get("product_code", ""),
            "product_name": product.get("product_name", ""),
            "product_family_code": product.get("product_family_code", ""),
            "product_family_name": family.get("product_family_name", ""),
            "inventory_policy_class": product.get("inventory_policy_class", ""),
            "lead_time_band": product.get("lead_time_band", ""),
            "criticality_band": product.get("criticality_band", ""),
            "service_profile": product.get("service_profile", ""),
            "site_code": location.get("site_code", ""),
            "location_code": location.get("location_code", ""),
            "location_name": location.get("location_name", ""),
            "node_type_code": location.get("node_type_code", ""),
            "logistics_area_code": location.get("logistics_area_code", ""),
            "location_role_description": location.get("location_role_description", ""),
            "network_open_demand_qty": demand_bucket["open_demand_qty"],
            "network_open_demand_value_proxy": demand_bucket["open_demand_value_proxy"],
        }
        silver_inventory.append(enriched)
        if enriched["is_current_snapshot"]:
            current_inventory.append(enriched)

    for row in inventory_inbound:
        product = product_by_sk.get(row["product_sk"], {})
        family = family_by_code.get(product.get("product_family_code"), {})
        location = location_by_sk.get(row["inventory_location_sk"], {})
        silver_inbound.append(
            {
                **row,
                "product_code": product.get("product_code", ""),
                "product_name": product.get("product_name", ""),
                "product_family_code": product.get("product_family_code", ""),
                "product_family_name": family.get("product_family_name", ""),
                "inventory_policy_class": product.get("inventory_policy_class", ""),
                "lead_time_band": product.get("lead_time_band", ""),
                "criticality_band": product.get("criticality_band", ""),
                "service_profile": product.get("service_profile", ""),
                "site_code": location.get("site_code", ""),
                "location_code": location.get("location_code", ""),
                "location_name": location.get("location_name", ""),
                "node_type_code": location.get("node_type_code", ""),
                "logistics_area_code": location.get("logistics_area_code", ""),
                "location_role_description": location.get("location_role_description", ""),
            }
        )

    return {
        "slv_demand_line_enriched": silver_demand,
        "slv_inventory_inbound_enriched": silver_inbound,
        "slv_inventory_position_enriched": silver_inventory,
        "slv_current_inventory_position": current_inventory,
    }


def build_gold(
    rows: dict[str, list[dict[str, Any]]], silver: dict[str, list[dict[str, Any]]]
) -> dict[str, list[dict[str, Any]]]:
    products = rows["dim_product"]
    accounts = rows["dim_account"]
    demand_lines = rows["fact_demand_line"]
    current_inventory = silver["slv_current_inventory_position"]

    open_demand_lines = sum(1 for row in demand_lines if row["open_qty"] > 0)
    total_open_qty = sum(row["open_qty"] for row in demand_lines)
    total_open_demand_value = sum(
        row["demand_value_proxy"] for row in demand_lines if row["open_qty"] > 0
    )
    total_available_qty = sum(row["available_qty"] for row in current_inventory)
    total_inventory_exposure = sum(row["inventory_value_proxy"] for row in current_inventory)
    ready_positions = sum(1 for row in current_inventory if row["readiness_flag"] == "READY")
    current_positions = len(current_inventory)
    active_action_count = sum(1 for row in current_inventory if row["action_status"] != "HOLD")
    service_readiness_rate = (
        ready_positions / current_positions if current_positions else 0
    )
    open_demand_coverage_ratio = (
        total_available_qty / total_open_qty if total_open_qty else 0
    )

    demand_dates = sorted(row["event_date"] for row in demand_lines if row.get("event_date"))
    inventory_dates = sorted(
        row["snapshot_date"]
        for row in rows["fact_inventory_snapshot"]
        if row.get("snapshot_date")
    )
    publication_timestamps = sorted(
        row["load_timestamp_utc"]
        for table in rows.values()
        for row in table
        if row.get("load_timestamp_utc")
    )

    latest_demand_month = max((row["event_date"][:7] for row in demand_lines), default="")
    month_demand_value = sum(
        row["demand_value_proxy"]
        for row in demand_lines
        if row["event_date"].startswith(latest_demand_month)
    )
    total_demand_value = sum(row["demand_value_proxy"] for row in demand_lines)
    latest_demand_month_share = (
        month_demand_value / total_demand_value if total_demand_value else 0
    )

    action_priority = {"REPLENISH_OR_PRODUCE": 0, "MONITOR": 1, "HOLD": 2}
    action_queue = sorted(
        current_inventory,
        key=lambda row: (
            action_priority.get(str(row["action_status"]), 9),
            -float(row["inventory_value_proxy"]),
        ),
    )[:8]
    gold_action_queue = [
        {
            "product_code": row["product_code"],
            "product_name": row["product_name"],
            "product_family_name": row["product_family_name"],
            "location_name": row["location_name"],
            "node_type_code": row["node_type_code"],
            "inventory_policy_class": row["inventory_policy_class"],
            "lead_time_band": row["lead_time_band"],
            "readiness_flag": row["readiness_flag"],
            "action_status": row["action_status"],
            "available_qty": row["available_qty"],
            "inventory_value_proxy": row["inventory_value_proxy"],
            "network_open_demand_qty": row["network_open_demand_qty"],
            "network_open_demand_value_proxy": row["network_open_demand_value_proxy"],
        }
        for row in action_queue
    ]

    pattern_support: dict[str, dict[str, float | int]] = defaultdict(
        lambda: {"open_qty": 0, "open_value": 0}
    )
    family_support: dict[str, dict[str, float | int]] = defaultdict(
        lambda: {"open_qty": 0, "open_value": 0}
    )
    product_by_sk = {row["product_sk"]: row for row in products}
    account_by_sk = {row["account_sk"]: row for row in accounts}

    for row in demand_lines:
        if row["open_qty"] <= 0:
            continue
        account_pattern = account_by_sk.get(row["account_sk"], {}).get(
            "account_pattern_class", "UNKNOWN"
        )
        customer_group = account_by_sk.get(row["account_sk"], {}).get(
            "customer_group", title_case_code(account_pattern)
        )
        family_code = product_by_sk.get(row["product_sk"], {}).get(
            "product_family_code", "UNKNOWN"
        )
        pattern_bucket = pattern_support[account_pattern]
        pattern_bucket["open_qty"] += row["open_qty"]
        pattern_bucket["open_value"] += row["demand_value_proxy"]
        pattern_bucket["customer_group"] = customer_group
        family_bucket = family_support[family_code]
        family_bucket["open_qty"] += row["open_qty"]
        family_bucket["open_value"] += row["demand_value_proxy"]

    gold_pattern_support = [
        {
            "account_pattern_class": key,
            "account_pattern_label": value.get("customer_group", title_case_code(key)),
            "customer_group": value.get("customer_group", title_case_code(key)),
            "open_qty": value["open_qty"],
            "open_value": value["open_value"],
            "open_value_share": (
                value["open_value"] / total_open_demand_value if total_open_demand_value else 0
            ),
        }
        for key, value in sorted(
            pattern_support.items(), key=lambda item: item[1]["open_value"], reverse=True
        )
    ]
    gold_family_support = [
        {
            "product_family_code": key,
            "product_family_label": title_case_code(key),
            "open_qty": value["open_qty"],
            "open_value": value["open_value"],
            "open_value_share": (
                value["open_value"] / total_open_demand_value if total_open_demand_value else 0
            ),
        }
        for key, value in sorted(
            family_support.items(), key=lambda item: item[1]["open_value"], reverse=True
        )
    ]

    gold_policy_reference = [
        {
            "inventory_policy_class": row["inventory_policy_class"],
            "inventory_policy_label": title_case_code(row["inventory_policy_class"]),
            "criticality_band": row["criticality_band"],
            "target_service_level_band": to_service_level_band(row["criticality_band"]),
            "coverage_target_band": to_coverage_target_band(row["inventory_policy_class"]),
            "lead_time_band": row["lead_time_band"],
            "service_profile": row["service_profile"],
        }
        for row in products
    ]

    gold_summary = [
        {
            "latest_approved_refresh_utc": publication_timestamps[-1] if publication_timestamps else "",
            "latest_demand_date": demand_dates[-1] if demand_dates else "",
            "latest_inventory_date": inventory_dates[-1] if inventory_dates else "",
            "open_demand_lines": open_demand_lines,
            "total_open_qty": total_open_qty,
            "total_open_demand_value_proxy": total_open_demand_value,
            "total_available_qty": total_available_qty,
            "total_inventory_exposure": total_inventory_exposure,
            "ready_positions": ready_positions,
            "current_positions": current_positions,
            "service_readiness_rate": round(service_readiness_rate, 6),
            "open_demand_coverage_ratio": round(open_demand_coverage_ratio, 6),
            "active_action_count": active_action_count,
            "latest_demand_month": latest_demand_month,
            "latest_demand_month_share": round(latest_demand_month_share, 6),
        }
    ]

    supply_chain_queue_summary = summarize_decision_queue(
        rows.get("fact_supply_chain_decision_queue_line", []),
        "cost_amount_usd",
        "supply_chain",
    )
    purchase_order_summary = summarize_purchase_orders(rows.get("fact_purchase_order_line", []))
    logistics_queue_summary = summarize_decision_queue(
        rows.get("fact_logistics_decision_queue_line", []),
        "cost_amount_usd",
        "logistics",
    )
    inventory_movement_summary = summarize_inventory_movements(
        rows.get("fact_inventory_movement_line", [])
    )
    sales_fulfillment_summary = summarize_sales_fulfillment(
        rows.get("fact_sales_fulfillment_line", [])
    )
    sales_dashboard_summary = summarize_sales_dashboard(
        rows.get("fact_sales_fulfillment_line", []),
        demand_lines,
    )
    inventory_location_action_summary = summarize_inventory_location_actions(
        current_inventory,
        rows.get("fact_logistics_decision_queue_line", []),
    )

    return {
        "gold_supply_chain_decision_summary": gold_summary,
        "gold_supply_chain_action_queue": gold_action_queue,
        "gold_demand_support_account_pattern": gold_pattern_support,
        "gold_demand_support_product_family": gold_family_support,
        "gold_public_policy_reference": gold_policy_reference,
        "gold_supply_chain_decision_queue_summary": supply_chain_queue_summary,
        "gold_purchase_order_summary": purchase_order_summary,
        "gold_logistics_decision_queue_summary": logistics_queue_summary,
        "gold_inventory_movement_summary": inventory_movement_summary,
        "gold_sales_fulfillment_summary": sales_fulfillment_summary,
        "gold_sales_dashboard_summary": sales_dashboard_summary,
        "gold_inventory_location_action_summary": inventory_location_action_summary,
    }


def summarize_decision_queue(
    rows: list[dict[str, Any]],
    cost_field: str,
    queue_domain: str,
) -> list[dict[str, Any]]:
    buckets: dict[tuple[str, str, str], dict[str, Any]] = {}
    for row in rows:
        key = (
            row.get("decision_type_code", "UNKNOWN"),
            row.get("recommendation_status_code", "UNKNOWN"),
            row.get("decision_reason_code", "UNKNOWN"),
        )
        bucket = buckets.setdefault(
            key,
            {
                "queue_domain": queue_domain,
                "decision_type_code": key[0],
                "recommendation_status_code": key[1],
                "decision_reason_code": key[2],
                "recommendation_count": 0,
                "recommended_qty": 0,
                "approved_qty": 0,
                "recommended_cost_amount_usd": 0.0,
                "approved_cost_amount_usd": 0.0,
            },
        )
        recommended_qty = int(row.get("recommended_qty") or 0)
        approved_qty = int(row.get("approved_qty") or 0)
        cost_amount = float(row.get(cost_field) or 0)
        bucket["recommendation_count"] += 1
        bucket["recommended_qty"] += recommended_qty
        bucket["approved_qty"] += approved_qty
        bucket["recommended_cost_amount_usd"] += cost_amount
        bucket["approved_cost_amount_usd"] += cost_amount if approved_qty > 0 else 0.0

    return sorted(buckets.values(), key=lambda row: (row["queue_domain"], row["decision_type_code"], row["recommendation_status_code"]))


def summarize_purchase_orders(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    buckets: dict[tuple[str, str], dict[str, Any]] = {}
    for row in rows:
        key = (
            row.get("purchase_order_status_code", "UNKNOWN"),
            row.get("supplier_sk", "UNKNOWN"),
        )
        bucket = buckets.setdefault(
            key,
            {
                "purchase_order_status_code": key[0],
                "supplier_sk": key[1],
                "order_line_count": 0,
                "ordered_qty": 0,
                "received_qty": 0,
                "open_purchase_qty": 0,
                "purchase_cost_amount_usd": 0.0,
            },
        )
        bucket["order_line_count"] += 1
        bucket["ordered_qty"] += int(row.get("ordered_qty") or 0)
        bucket["received_qty"] += int(row.get("received_qty") or 0)
        bucket["open_purchase_qty"] += int(row.get("open_qty") or 0)
        bucket["purchase_cost_amount_usd"] += float(row.get("purchase_cost_amount_usd") or 0)

    return sorted(buckets.values(), key=lambda row: (row["purchase_order_status_code"], row["supplier_sk"]))


def summarize_inventory_movements(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    buckets: dict[tuple[str, str], dict[str, Any]] = {}
    for row in rows:
        key = (
            row.get("movement_status_code", "UNKNOWN"),
            row.get("movement_type_code", "UNKNOWN"),
        )
        bucket = buckets.setdefault(
            key,
            {
                "movement_status_code": key[0],
                "movement_type_code": key[1],
                "movement_count": 0,
                "movement_qty": 0,
                "shipped_qty": 0,
                "received_qty": 0,
                "in_transit_qty": 0,
                "movement_cost_amount_usd": 0.0,
            },
        )
        bucket["movement_count"] += 1
        bucket["movement_qty"] += int(row.get("movement_qty") or 0)
        bucket["shipped_qty"] += int(row.get("shipped_qty") or 0)
        bucket["received_qty"] += int(row.get("received_qty") or 0)
        bucket["in_transit_qty"] += int(row.get("in_transit_qty") or 0)
        bucket["movement_cost_amount_usd"] += float(row.get("movement_cost_amount_usd") or 0)

    return sorted(buckets.values(), key=lambda row: (row["movement_status_code"], row["movement_type_code"]))


def summarize_sales_fulfillment(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    buckets: dict[str, dict[str, Any]] = {}
    for row in rows:
        status = row.get("fulfillment_status_code", "UNKNOWN")
        bucket = buckets.setdefault(
            status,
            {
                "fulfillment_status_code": status,
                "fulfillment_line_count": 0,
                "fulfilled_qty": 0,
                "backordered_qty": 0,
                "cogs_amount": 0.0,
            },
        )
        bucket["fulfillment_line_count"] += 1
        bucket["fulfilled_qty"] += int(row.get("fulfilled_qty") or 0)
        bucket["backordered_qty"] += int(row.get("backordered_qty") or 0)
        bucket["cogs_amount"] += float(row.get("cogs_amount") or 0)

    return sorted(buckets.values(), key=lambda row: row["fulfillment_status_code"])


def summarize_sales_dashboard(
    fulfillment_rows: list[dict[str, Any]],
    demand_rows: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    fulfilled_qty = sum(int(row.get("fulfilled_qty") or 0) for row in fulfillment_rows)
    backordered_qty = sum(int(row.get("backordered_qty") or 0) for row in fulfillment_rows)
    cogs_amount = sum(float(row.get("cogs_amount") or 0) for row in fulfillment_rows)
    demand_value_proxy = sum(int(row.get("demand_value_proxy") or 0) for row in demand_rows)
    open_demand_qty = sum(int(row.get("open_qty") or 0) for row in demand_rows)
    return [
        {
            "fulfilled_qty": fulfilled_qty,
            "backordered_qty": backordered_qty,
            "open_demand_qty": open_demand_qty,
            "demand_value_proxy": demand_value_proxy,
            "cogs_amount": cogs_amount,
            "fulfillment_line_count": len(fulfillment_rows),
        }
    ]


def summarize_inventory_location_actions(
    current_inventory_rows: list[dict[str, Any]],
    logistics_queue_rows: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    action_count_by_location: dict[str, int] = defaultdict(int)
    for row in logistics_queue_rows:
        location_sk = row.get("origin_inventory_location_sk") or row.get("destination_inventory_location_sk")
        if location_sk:
            action_count_by_location[location_sk] += 1

    buckets: dict[tuple[str, str], dict[str, Any]] = {}
    for row in current_inventory_rows:
        key = (
            row.get("inventory_location_sk", "UNKNOWN"),
            row.get("action_status", "UNKNOWN"),
        )
        bucket = buckets.setdefault(
            key,
            {
                "inventory_location_sk": key[0],
                "location_name": row.get("location_name", ""),
                "action_status": key[1],
                "position_count": 0,
                "on_hand_qty": 0,
                "available_qty": 0,
                "reserved_qty": 0,
                "in_transit_qty": 0,
                "inventory_value_proxy": 0,
                "active_logistics_action_count": action_count_by_location.get(key[0], 0),
            },
        )
        bucket["position_count"] += 1
        bucket["on_hand_qty"] += int(row.get("on_hand_qty") or 0)
        bucket["available_qty"] += int(row.get("available_qty") or 0)
        bucket["reserved_qty"] += int(row.get("reserved_qty") or 0)
        bucket["in_transit_qty"] += int(row.get("in_transit_qty") or 0)
        bucket["inventory_value_proxy"] += int(row.get("inventory_value_proxy") or 0)

    return sorted(buckets.values(), key=lambda row: (row["location_name"], row["action_status"]))


def build_manifest(
    publication_dir: Path,
    output_dir: Path,
    bronze_rows: dict[str, list[dict[str, Any]]],
    financial_foundation_rows: dict[str, list[dict[str, Any]]],
    silver: dict[str, list[dict[str, Any]]],
    gold: dict[str, list[dict[str, Any]]],
    lakehouse_result: dict[str, Any] | None = None,
    existing_manifest: dict[str, Any] | None = None,
) -> dict[str, Any]:
    publication_timestamps = sorted(
        row["load_timestamp_utc"]
        for table in bronze_rows.values()
        for row in table
        if row.get("load_timestamp_utc")
    )
    manifest = {
        "generated_at_utc": utc_now_iso(),
        "source_publication_dir": str(publication_dir),
        "output_dir": str(output_dir),
        "first_proof_target": {
            "lakehouse_name": DEFAULT_LAKEHOUSE_NAME,
            "semantic_model_name": "sm_fab001_supply_chain_decision",
            "report_name": "rpt_fab001_supply_chain_decision",
            "page_name": "Supply Chain Decision View",
        },
        "approved_refresh_timestamp_utc": publication_timestamps[-1] if publication_timestamps else "",
        "bronze_tables": {
            table_name: {
                "rows": len(table_rows),
                "path": f"bronze/{table_name}.csv",
                "execution_mode": "transport_seed",
            }
            for table_name, table_rows in bronze_rows.items()
        },
        "financial_foundation_tables": {
            table_name: {
                "rows": len(table_rows),
                "path": f"financial-foundation/{table_name}.csv",
                "execution_mode": "repo_rule_derived_foundation",
            }
            for table_name, table_rows in financial_foundation_rows.items()
        },
        "silver_tables": {
            table_name: {
                "rows": len(table_rows),
                "path": f"{DEFAULT_REFERENCE_ROOT}/silver/{table_name}.csv",
                "execution_mode": "fabric_notebook_runtime",
                "local_reference_only": True,
            }
            for table_name, table_rows in silver.items()
        },
        "gold_tables": {
            table_name: {
                "rows": len(table_rows),
                "path": f"{DEFAULT_REFERENCE_ROOT}/gold/{table_name}.csv",
                "execution_mode": "fabric_notebook_runtime",
                "local_reference_only": True,
            }
            for table_name, table_rows in gold.items()
        },
        "lakehouse": lakehouse_result
        or (existing_manifest or {}).get("lakehouse")
        or {"status": "not_requested"},
        "runtime_execution": {
            "authoritative_layer": "fabric_notebook",
            "bronze_seed_root": f"{DEFAULT_ONELAKE_BUNDLE_ROOT}/bronze",
            "financial_foundation_root": (
                f"{DEFAULT_ONELAKE_BUNDLE_ROOT}/financial-foundation"
                if financial_foundation_rows
                else None
            ),
            "bronze_realism_mode": "controlled_realism_minimal",
            "local_reference_root": DEFAULT_REFERENCE_ROOT,
            "notebook_name": DEFAULT_NOTEBOOK_NAME,
        },
        "notes": [
            "Bronze is a bounded raw-like transport layer derived from the coherence-approved repo package.",
            "Controlled realism in Bronze is intentionally minimal and recoverable so Silver can own cleanup and conformance inside Fabric.",
            "Silver and Gold are derived inside Fabric by the loader notebook from Bronze seed tables.",
            "Local Silver and Gold CSVs now exist only as bounded reference outputs for verification.",
            "The semantic model should be built from these proof tables, not from Astro calculations.",
        ],
        "medallion_contract": "05-compat/contracts/fab001_medallion_contract.json",
    }
    if financial_foundation_rows:
        manifest["notes"].append(
            "Bounded financial foundation tables are also landed into the Lakehouse so Fabric and the public serving layer share the same rule-derived price, cost, and fulfilled-line realization basis."
        )
    for key, value in (existing_manifest or {}).items():
        if key not in manifest:
            manifest[key] = value
    return manifest


def print_plan(
    rows: dict[str, list[dict[str, Any]]],
    financial_foundation_rows: dict[str, list[dict[str, Any]]],
    silver: dict[str, list[dict[str, Any]]],
    gold: dict[str, list[dict[str, Any]]],
) -> None:
    print("Planned Fabric proof bundle:")
    print("  Bronze (bounded raw-like transport):")
    for name, table_rows in rows.items():
        print(f"    - {name}: {len(table_rows)} rows")
    if financial_foundation_rows:
        print("  Financial foundation (bounded rule-derived):")
        for name, table_rows in financial_foundation_rows.items():
            print(f"    - {name}: {len(table_rows)} rows")
    print("  Local reference Silver:")
    for name, table_rows in silver.items():
        print(f"    - {name}: {len(table_rows)} rows")
    print("  Local reference Gold:")
    for name, table_rows in gold.items():
        print(f"    - {name}: {len(table_rows)} rows")


def build_loader_notebook_ipynb(loader_source: str) -> str:
    payload = {
        "nbformat": 4,
        "nbformat_minor": 5,
        "cells": [
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [f"{line}\n" for line in loader_source.splitlines()],
            }
        ],
        "metadata": {"language_info": {"name": "python"}},
    }
    return json.dumps(payload)


def resolve_lakehouse_item(
    client: FabricClient,
    args: argparse.Namespace,
    manifest: dict[str, Any] | None,
) -> dict[str, Any]:
    lakehouse_info = (manifest or {}).get("lakehouse") or {}
    item = lakehouse_info.get("item")
    if item and item.get("id"):
        return item

    existing = client.find_item(args.lakehouse_name, "Lakehouse")
    if existing:
        return existing

    raise RuntimeError(
        "Target Lakehouse was not found. Run with --create-lakehouse first or confirm the workspace item."
    )


def wait_for_expected_lakehouse_tables(
    client: FabricClient,
    lakehouse_id: str,
    expected_table_names: list[str],
    retries: int = 12,
    delay_seconds: int = 5,
) -> list[dict[str, Any]]:
    latest_tables: list[dict[str, Any]] = []
    expected = set(expected_table_names)

    for attempt in range(retries):
        latest_tables = client.list_lakehouse_tables(lakehouse_id)
        available = {table.get("name") for table in latest_tables}
        if expected.issubset(available):
            return latest_tables
        if attempt < retries - 1:
            time.sleep(delay_seconds)

    return latest_tables


def main() -> int:
    args = parse_args()
    publication_dir = Path(args.publication_dir).resolve()
    output_dir = Path(args.output_dir).resolve()
    financial_foundation_dir = resolve_financial_foundation_dir(
        publication_dir, args.financial_foundation_dir
    )
    bronze_dir = output_dir / "bronze"
    financial_output_dir = output_dir / "financial-foundation"
    reference_silver_dir = output_dir / DEFAULT_REFERENCE_ROOT / "silver"
    reference_gold_dir = output_dir / DEFAULT_REFERENCE_ROOT / "gold"
    legacy_silver_dir = output_dir / "silver"
    legacy_gold_dir = output_dir / "gold"

    publication_rows = load_publication_rows(publication_dir)
    financial_foundation_rows = load_financial_foundation_rows(financial_foundation_dir)
    bronze_rows = build_bronze_transport_rows(publication_rows)
    silver = build_silver(publication_rows)
    gold = build_gold(publication_rows, silver)

    if args.dry_run:
        print_plan(bronze_rows, financial_foundation_rows, silver, gold)
        return 0

    shutil.rmtree(legacy_silver_dir, ignore_errors=True)
    shutil.rmtree(legacy_gold_dir, ignore_errors=True)
    ensure_dir(bronze_dir)
    if financial_foundation_rows:
        ensure_dir(financial_output_dir)
    ensure_dir(reference_silver_dir)
    ensure_dir(reference_gold_dir)

    for table_name, table_rows in bronze_rows.items():
        write_csv(bronze_dir / f"{table_name}.csv", table_rows)
    for table_name, table_rows in financial_foundation_rows.items():
        write_csv(financial_output_dir / f"{table_name}.csv", table_rows)
    for table_name, table_rows in silver.items():
        write_csv(reference_silver_dir / f"{table_name}.csv", table_rows)
    for table_name, table_rows in gold.items():
        write_csv(reference_gold_dir / f"{table_name}.csv", table_rows)

    existing_manifest = None
    manifest_path = output_dir / "manifest.json"
    if manifest_path.exists():
        existing_manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

    lakehouse_result = None
    client = None
    if (
        args.create_lakehouse
        or args.upload_bundle
        or args.create_loader_notebook
        or args.run_loader_notebook
    ):
        client = FabricClient.from_env()

    if args.create_lakehouse:
        lakehouse_result = client.create_lakehouse(
            args.lakehouse_name,
            "Bounded Lakehouse for the Phase 3 public proof surface.",
        )

    manifest = build_manifest(
        publication_dir,
        output_dir,
        bronze_rows,
        financial_foundation_rows,
        silver,
        gold,
        lakehouse_result,
        existing_manifest=existing_manifest,
    )
    write_json(manifest_path, manifest)

    live_updates: dict[str, Any] = {}
    if args.upload_bundle or args.create_loader_notebook or args.run_loader_notebook:
        lakehouse_item = resolve_lakehouse_item(client, args, manifest)
        live_updates["lakehouse"] = {"status": "existing", "item": lakehouse_item}

        if args.upload_bundle:
            uploaded_paths = client.upload_tree_to_onelake(
                lakehouse_item["id"], bronze_dir, f"{DEFAULT_ONELAKE_BUNDLE_ROOT}/bronze"
            )
            if financial_foundation_rows:
                uploaded_paths.extend(
                    client.upload_tree_to_onelake(
                        lakehouse_item["id"],
                        financial_output_dir,
                        f"{DEFAULT_ONELAKE_BUNDLE_ROOT}/financial-foundation",
                    )
                )
            live_updates["onelake_bundle"] = {
                "uploaded_files": len(uploaded_paths),
                "remote_root": f"{DEFAULT_ONELAKE_BUNDLE_ROOT}/bronze",
                "sample_paths": uploaded_paths[:10],
            }

        notebook_item = None
        if args.create_loader_notebook or args.run_loader_notebook:
            loader_source = (
                Path(__file__).resolve().parent / "fab001_lakehouse_loader_notebook.py"
            ).read_text(encoding="utf-8")
            notebook_payload = build_loader_notebook_ipynb(loader_source)
            notebook_result = client.create_or_update_notebook(
                args.notebook_name,
                "Explicit-schema Bronze seed loader and Silver/Gold runtime derivation notebook for FAB001.",
                notebook_payload,
            )
            notebook_item = notebook_result.get("item") or client.find_item(
                args.notebook_name, "Notebook"
            )
            live_updates["loader_notebook"] = notebook_result

        if args.run_loader_notebook:
            if not notebook_item or not notebook_item.get("id"):
                raise RuntimeError("Loader notebook is missing an item id and cannot be run.")
            notebook_run = client.run_notebook(
                notebook_item["id"],
                lakehouse_id=lakehouse_item["id"],
                lakehouse_name=lakehouse_item["displayName"],
            )
            job_location = notebook_run.get("job_location")
            if not job_location:
                raise RuntimeError("Notebook run did not return a job location.")
            job_status = client.poll_job(job_location)
            notebook_run["job_status"] = job_status
            live_updates["loader_notebook_run"] = notebook_run
            if job_status.get("status") != "Completed":
                raise RuntimeError(f"Notebook run did not complete successfully: {job_status}")
            expected_table_names = list(BRONZE_FILES.keys()) + list(silver.keys()) + list(gold.keys())
            if financial_foundation_rows:
                expected_table_names.extend(financial_foundation_rows.keys())
            tables = wait_for_expected_lakehouse_tables(
                client,
                lakehouse_item["id"],
                expected_table_names,
            )
            live_updates["lakehouse_tables"] = {
                "count": len(tables),
                "names": [table.get("name") for table in tables],
            }

    if live_updates:
        manifest.update(live_updates)
        write_json(manifest_path, manifest)

    print_plan(bronze_rows, financial_foundation_rows, silver, gold)
    print(f"Wrote manifest: {manifest_path}")
    if live_updates.get("onelake_bundle"):
        print(
            "Uploaded bundle to OneLake:",
            live_updates["onelake_bundle"]["uploaded_files"],
            "files",
        )
    if live_updates.get("lakehouse_tables"):
        print(
            "Lakehouse tables available:",
            live_updates["lakehouse_tables"]["count"],
            "tables",
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
