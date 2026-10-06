#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

from common_fabric import DEFAULT_OUTPUT_DIR, REPO_ROOT, write_json


SEMANTIC_MODEL_NAME = "sm_fab001_supply_chain_decision"
LAKEHOUSE_NAME = "lh_fab001_public_proof"


def table(name: str, source_layer: str, hidden: bool = False) -> dict:
    return {
        "name": name,
        "source_layer": source_layer,
        "source_object": name,
        "hidden": hidden,
    }


def relationship(
    from_table: str,
    from_column: str,
    to_table: str,
    to_column: str,
    *,
    active: bool = True,
    role: str | None = None,
) -> dict:
    payload = {
        "from_table": from_table,
        "from_column": from_column,
        "to_table": to_table,
        "to_column": to_column,
        "cardinality": "one-to-many",
        "cross_filter_direction": "single",
        "active": active,
    }
    if role:
        payload["role"] = role
    return payload


def measure(name: str, table_name: str, expression: str, format_string: str) -> dict:
    return {
        "name": name,
        "table": table_name,
        "expression": expression,
        "format_string": format_string,
    }


def build_contract() -> dict:
    measures = [
        measure(
            "Open Demand Qty",
            "slv_demand_line_enriched",
            "CALCULATE(SUM('slv_demand_line_enriched'[open_qty]))",
            "#,0",
        ),
        measure(
            "Open Demand Lines",
            "slv_demand_line_enriched",
            "CALCULATE(COUNTROWS('slv_demand_line_enriched'), 'slv_demand_line_enriched'[is_open] = TRUE())",
            "#,0",
        ),
        measure(
            "Open Demand Value Proxy",
            "slv_demand_line_enriched",
            "CALCULATE(SUM('slv_demand_line_enriched'[demand_value_proxy]), 'slv_demand_line_enriched'[is_open] = TRUE())",
            "$#,0",
        ),
        measure(
            "Demand Value Proxy",
            "slv_demand_line_enriched",
            "SUM('slv_demand_line_enriched'[demand_value_proxy])",
            "$#,0",
        ),
        measure(
            "Available Qty",
            "slv_current_inventory_position",
            "SUM('slv_current_inventory_position'[available_qty])",
            "#,0",
        ),
        measure(
            "On Hand Qty",
            "slv_current_inventory_position",
            "SUM('slv_current_inventory_position'[on_hand_qty])",
            "#,0",
        ),
        measure(
            "Reserved Qty",
            "slv_current_inventory_position",
            "SUM('slv_current_inventory_position'[reserved_qty])",
            "#,0",
        ),
        measure(
            "In Transit Qty",
            "slv_current_inventory_position",
            "SUM('slv_current_inventory_position'[in_transit_qty])",
            "#,0",
        ),
        measure(
            "Ready Positions",
            "slv_current_inventory_position",
            "CALCULATE(COUNTROWS('slv_current_inventory_position'), 'slv_current_inventory_position'[readiness_flag] = \"READY\")",
            "#,0",
        ),
        measure(
            "Current Positions",
            "slv_current_inventory_position",
            "COUNTROWS('slv_current_inventory_position')",
            "#,0",
        ),
        measure(
            "Service Readiness Rate",
            "slv_current_inventory_position",
            "DIVIDE([Ready Positions], [Current Positions])",
            "0.0%",
        ),
        measure(
            "Inventory Exposure",
            "slv_current_inventory_position",
            "SUM('slv_current_inventory_position'[inventory_value_proxy])",
            "$#,0",
        ),
        measure(
            "Open-Demand Coverage",
            "slv_current_inventory_position",
            "DIVIDE([Available Qty], [Open Demand Qty])",
            "0.0%",
        ),
        measure(
            "Active Action Count",
            "slv_current_inventory_position",
            "CALCULATE(COUNTROWS('slv_current_inventory_position'), 'slv_current_inventory_position'[action_status] <> \"HOLD\")",
            "#,0",
        ),
        measure(
            "Latest Approved Refresh",
            "slv_current_inventory_position",
            "MAX('slv_current_inventory_position'[load_timestamp_utc])",
            "yyyy-mm-dd hh:mm",
        ),
        measure(
            "Realized Revenue",
            "fact_sales_realization",
            "SUM('fact_sales_realization'[net_revenue_amount])",
            "$#,0",
        ),
        measure(
            "Realized COGS",
            "fact_sales_realization",
            "SUM('fact_sales_realization'[cogs_amount])",
            "$#,0",
        ),
        measure(
            "Realized Gross Margin",
            "fact_sales_realization",
            "SUM('fact_sales_realization'[gross_margin_amount])",
            "$#,0",
        ),
        measure(
            "Realized Margin Rate",
            "fact_sales_realization",
            "DIVIDE([Realized Gross Margin], [Realized Revenue])",
            "0.0%",
        ),
        measure(
            "Fulfilled Qty",
            "fact_sales_realization",
            "SUM('fact_sales_realization'[fulfilled_qty])",
            "#,0",
        ),
        measure(
            "Average Revenue per Account",
            "fact_sales_realization",
            "DIVIDE([Realized Revenue], DISTINCTCOUNT('fact_sales_realization'[account_sk]))",
            "$#,0",
        ),
        measure(
            "Backordered Qty",
            "fact_sales_fulfillment_line",
            "SUM('fact_sales_fulfillment_line'[backordered_qty])",
            "#,0",
        ),
        measure(
            "Fulfillment Line Count",
            "fact_sales_fulfillment_line",
            "COUNTROWS('fact_sales_fulfillment_line')",
            "#,0",
        ),
        measure(
            "SC Recommended Qty",
            "fact_supply_chain_decision_queue_line",
            "SUM('fact_supply_chain_decision_queue_line'[recommended_qty])",
            "#,0",
        ),
        measure(
            "SC Approved Qty",
            "fact_supply_chain_decision_queue_line",
            "SUM('fact_supply_chain_decision_queue_line'[approved_qty])",
            "#,0",
        ),
        measure(
            "SC Decision Cost Amount",
            "fact_supply_chain_decision_queue_line",
            "SUM('fact_supply_chain_decision_queue_line'[cost_amount_usd])",
            "$#,0",
        ),
        measure(
            "Approved SC Decisions",
            "fact_supply_chain_decision_queue_line",
            "CALCULATE(DISTINCTCOUNT('fact_supply_chain_decision_queue_line'[supply_chain_decision_line_sk]), 'fact_supply_chain_decision_queue_line'[recommendation_status_code] = \"APPROVED\")",
            "#,0",
        ),
        measure(
            "Purchase Ordered Qty",
            "fact_purchase_order_line",
            "SUM('fact_purchase_order_line'[ordered_qty])",
            "#,0",
        ),
        measure(
            "Purchase Received Qty",
            "fact_purchase_order_line",
            "SUM('fact_purchase_order_line'[received_qty])",
            "#,0",
        ),
        measure(
            "Open Purchase Qty",
            "fact_purchase_order_line",
            "SUM('fact_purchase_order_line'[open_qty])",
            "#,0",
        ),
        measure(
            "Purchase Cost Amount",
            "fact_purchase_order_line",
            "SUM('fact_purchase_order_line'[purchase_cost_amount_usd])",
            "$#,0",
        ),
        measure(
            "Purchase Order Lines",
            "fact_purchase_order_line",
            "COUNTROWS('fact_purchase_order_line')",
            "#,0",
        ),
        measure(
            "Executed Purchase Decisions",
            "fact_purchase_order_line",
            "DISTINCTCOUNT('fact_purchase_order_line'[supply_chain_decision_line_sk])",
            "#,0",
        ),
        measure(
            "Queue-to-PO Traceability Rate",
            "fact_purchase_order_line",
            "DIVIDE([Executed Purchase Decisions], [Approved SC Decisions])",
            "0.0%",
        ),
        measure(
            "Logistics Recommended Qty",
            "fact_logistics_decision_queue_line",
            "SUM('fact_logistics_decision_queue_line'[recommended_qty])",
            "#,0",
        ),
        measure(
            "Logistics Approved Qty",
            "fact_logistics_decision_queue_line",
            "SUM('fact_logistics_decision_queue_line'[approved_qty])",
            "#,0",
        ),
        measure(
            "Active Logistics Action Count",
            "fact_logistics_decision_queue_line",
            "COUNTROWS('fact_logistics_decision_queue_line')",
            "#,0",
        ),
        measure(
            "Movement Qty",
            "fact_inventory_movement_line",
            "SUM('fact_inventory_movement_line'[movement_qty])",
            "#,0",
        ),
        measure(
            "Movement In Transit Qty",
            "fact_inventory_movement_line",
            "SUM('fact_inventory_movement_line'[in_transit_qty])",
            "#,0",
        ),
        measure(
            "Movement Cost Amount",
            "fact_inventory_movement_line",
            "SUM('fact_inventory_movement_line'[movement_cost_amount_usd])",
            "$#,0",
        ),
    ]

    return {
        "schema_version": "2026-04-15",
        "semantic_model": {
            "name": SEMANTIC_MODEL_NAME,
            "source_type": "lakehouse",
            "source_item_name": LAKEHOUSE_NAME,
            "edit_mode": "desktop_or_service_table_sync_required_before_full_measure_patch",
            "default_semantic_model_assumed": False,
            "manual_sync_required": True,
            "purpose": "Bounded three-view operating-loop semantic proof for Sales, Supply Chain, and Inventory Decision Support.",
        },
        "tables": [
            table("dim_product", "bronze"),
            table("dim_product_family", "bronze"),
            table("dim_account", "bronze"),
            table("dim_inventory_location", "bronze"),
            table("dim_service_region", "bronze"),
            table("dim_supplier", "bronze"),
            table("slv_demand_line_enriched", "silver"),
            table("slv_current_inventory_position", "silver"),
            table("slv_inventory_inbound_enriched", "silver", hidden=True),
            table("slv_inventory_position_enriched", "silver", hidden=True),
            table("fact_sales_realization", "financial_foundation"),
            table("fact_sales_fulfillment_line", "bronze"),
            table("fact_supply_chain_decision_queue_line", "bronze"),
            table("fact_purchase_order_line", "bronze"),
            table("fact_purchase_order_status_history", "bronze", hidden=True),
            table("fact_logistics_decision_queue_line", "bronze"),
            table("fact_inventory_movement_line", "bronze"),
            table("rule_supplier_product_lead_time", "bronze", hidden=True),
            table("rule_location_transfer_lead_time", "bronze", hidden=True),
            table("rule_location_service_lead_time", "bronze", hidden=True),
            table("gold_sales_dashboard_summary", "gold", hidden=True),
            table("gold_supply_chain_decision_summary", "gold", hidden=True),
            table("gold_supply_chain_action_queue", "gold"),
            table("gold_supply_chain_decision_queue_summary", "gold"),
            table("gold_purchase_order_summary", "gold"),
            table("gold_inventory_location_action_summary", "gold"),
            table("gold_logistics_decision_queue_summary", "gold"),
            table("gold_inventory_movement_summary", "gold"),
            table("gold_sales_fulfillment_summary", "gold"),
            table("gold_demand_support_account_pattern", "gold"),
            table("gold_demand_support_product_family", "gold"),
            table("gold_public_policy_reference", "gold"),
        ],
        "relationships": [
            relationship("dim_product_family", "product_family_code", "dim_product", "product_family_code"),
            relationship("dim_product", "product_sk", "slv_demand_line_enriched", "product_sk"),
            relationship("dim_product", "product_sk", "slv_current_inventory_position", "product_sk"),
            relationship("dim_product", "product_sk", "fact_sales_realization", "product_sk"),
            relationship("dim_product", "product_sk", "fact_sales_fulfillment_line", "product_sk"),
            relationship("dim_product", "product_sk", "fact_supply_chain_decision_queue_line", "product_sk"),
            relationship("dim_product", "product_sk", "fact_purchase_order_line", "product_sk"),
            relationship("dim_product", "product_sk", "fact_logistics_decision_queue_line", "product_sk"),
            relationship("dim_product", "product_sk", "fact_inventory_movement_line", "product_sk"),
            relationship("dim_account", "account_sk", "slv_demand_line_enriched", "account_sk"),
            relationship("dim_account", "account_sk", "fact_sales_realization", "account_sk"),
            relationship("dim_account", "account_sk", "fact_sales_fulfillment_line", "account_sk"),
            relationship(
                "dim_inventory_location",
                "inventory_location_sk",
                "slv_current_inventory_position",
                "inventory_location_sk",
            ),
            relationship(
                "dim_inventory_location",
                "inventory_location_sk",
                "fact_sales_fulfillment_line",
                "fulfillment_inventory_location_sk",
                role="fulfillment_location",
            ),
            relationship(
                "dim_inventory_location",
                "inventory_location_sk",
                "fact_supply_chain_decision_queue_line",
                "receiving_inventory_location_sk",
                role="receiving_location",
            ),
            relationship(
                "dim_inventory_location",
                "inventory_location_sk",
                "fact_purchase_order_line",
                "receiving_inventory_location_sk",
                role="receiving_location",
            ),
            relationship(
                "dim_inventory_location",
                "inventory_location_sk",
                "fact_logistics_decision_queue_line",
                "origin_inventory_location_sk",
                role="origin_location",
            ),
            relationship(
                "dim_inventory_location",
                "inventory_location_sk",
                "fact_logistics_decision_queue_line",
                "destination_inventory_location_sk",
                active=False,
                role="destination_location",
            ),
            relationship(
                "dim_inventory_location",
                "inventory_location_sk",
                "fact_inventory_movement_line",
                "origin_inventory_location_sk",
                role="origin_location",
            ),
            relationship(
                "dim_inventory_location",
                "inventory_location_sk",
                "fact_inventory_movement_line",
                "destination_inventory_location_sk",
                active=False,
                role="destination_location",
            ),
            relationship("dim_supplier", "supplier_sk", "fact_supply_chain_decision_queue_line", "supplier_sk"),
            relationship("dim_supplier", "supplier_sk", "fact_purchase_order_line", "supplier_sk"),
            relationship("dim_service_region", "service_region_code", "dim_supplier", "service_region_code"),
        ],
        "dashboard_views": [
            {
                "name": "Sales Dashboard",
                "primary_tables": [
                    "fact_sales_realization",
                    "fact_sales_fulfillment_line",
                    "slv_demand_line_enriched",
                    "gold_sales_dashboard_summary",
                ],
            },
            {
                "name": "Supply Chain Decision Support",
                "primary_tables": [
                    "fact_supply_chain_decision_queue_line",
                    "fact_purchase_order_line",
                    "gold_supply_chain_decision_queue_summary",
                    "gold_purchase_order_summary",
                ],
            },
            {
                "name": "Inventory Decision Support",
                "primary_tables": [
                    "slv_current_inventory_position",
                    "fact_logistics_decision_queue_line",
                    "fact_inventory_movement_line",
                    "fact_sales_fulfillment_line",
                    "gold_inventory_location_action_summary",
                ],
            },
        ],
        "measures": measures,
        "report_assumptions": [
            "The semantic model is built from the bounded proof tables, not from Astro calculations.",
            "Sales metrics use bounded rule-derived realized sales, not invoice-source finance.",
            "Supply-chain metrics separate recommendation queues from executed purchase-order facts.",
            "Inventory metrics use current-position Silver plus bounded logistics and fulfillment event facts.",
            "Full live measure patching requires the live semantic model to sync the new Lakehouse tables first.",
        ],
    }


def build_measure_pack(contract: dict) -> str:
    lines = [
        f"// Semantic model: {contract['semantic_model']['name']}",
        f"// Source item: {contract['semantic_model']['source_item_name']}",
        "",
    ]
    for measure in contract["measures"]:
        lines.append(f"// Table: {measure['table']}")
        lines.append(f"MEASURE '{measure['table']}'[{measure['name']}] = {measure['expression']}")
        lines.append(f"FORMAT_STRING = \"{measure['format_string']}\"")
        lines.append("")
    return "\n".join(lines).strip() + "\n"


def main() -> int:
    output_dir = REPO_ROOT / "05-compat" / "contracts"
    output_dir.mkdir(parents=True, exist_ok=True)
    contract = build_contract()
    write_json(output_dir / "fab001_semantic_model_contract.json", contract)
    (output_dir / "fab001_measure_pack.dax").write_text(
        build_measure_pack(contract), encoding="utf-8"
    )

    manifest_path = DEFAULT_OUTPUT_DIR / "manifest.json"
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        manifest["semantic_model_contract"] = "05-compat/contracts/fab001_semantic_model_contract.json"
        manifest["measure_pack"] = "05-compat/contracts/fab001_measure_pack.dax"
        write_json(manifest_path, manifest)

    print(f"Wrote semantic model contract: {output_dir / 'fab001_semantic_model_contract.json'}")
    print(f"Wrote measure pack: {output_dir / 'fab001_measure_pack.dax'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
