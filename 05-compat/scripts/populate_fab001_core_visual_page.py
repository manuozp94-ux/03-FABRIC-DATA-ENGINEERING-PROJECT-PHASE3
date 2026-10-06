#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

from common_fabric import DEFAULT_OUTPUT_DIR, REPO_ROOT, write_json


def build_page_contract() -> dict:
    return {
        "report_name": "rpt_fab001_supply_chain_decision",
        "report_title": "FAB001 Operating Loop Decision Support",
        "artifact_label": "bounded proof",
        "intent": "Show the three governed dashboard views downstream of the bounded operating loop without replacing the curated website.",
        "pages": [
            {
                "page_name": "Sales Dashboard",
                "objective": "Explain historical sales, consumption, and bounded margin behavior.",
                "visuals": [
                    {
                        "type": "card",
                        "title": "Realized Revenue",
                        "measure": "Realized Revenue",
                    },
                    {
                        "type": "card",
                        "title": "Realized Gross Margin",
                        "measure": "Realized Gross Margin",
                    },
                    {
                        "type": "card",
                        "title": "Realized Margin Rate",
                        "measure": "Realized Margin Rate",
                    },
                    {
                        "type": "card",
                        "title": "Fulfilled Qty",
                        "measure": "Fulfilled Qty",
                    },
                    {
                        "type": "line_chart",
                        "title": "Realized Revenue Trend",
                        "dataset": "fact_sales_realization",
                        "axis": "invoice_date",
                        "measure": "Realized Revenue",
                    },
                    {
                        "type": "clustered_bar",
                        "title": "Revenue by Product Family",
                        "dataset": "fact_sales_realization",
                        "axis": "dim_product_family[product_family_name]",
                        "measure": "Realized Revenue",
                    },
                    {
                        "type": "clustered_bar",
                        "title": "Revenue by Account Pattern",
                        "dataset": "fact_sales_realization",
                        "axis": "dim_account[account_pattern_class]",
                        "measure": "Realized Revenue",
                    },
                    {
                        "type": "table",
                        "title": "Customer Consumption Detail",
                        "dataset": "fact_sales_realization",
                        "columns": [
                            "dim_account[account_name]",
                            "dim_account[customer_group]",
                            "Fulfilled Qty",
                            "Realized Revenue",
                            "Realized Gross Margin",
                        ],
                    },
                ],
            },
            {
                "page_name": "Supply Chain Decision Support",
                "objective": "Connect demand pressure, recommendations, purchase orders, supplier lead times, and cost exposure.",
                "visuals": [
                    {
                        "type": "card",
                        "title": "SC Approved Qty",
                        "measure": "SC Approved Qty",
                    },
                    {
                        "type": "card",
                        "title": "Purchase Ordered Qty",
                        "measure": "Purchase Ordered Qty",
                    },
                    {
                        "type": "card",
                        "title": "Open Purchase Qty",
                        "measure": "Open Purchase Qty",
                    },
                    {
                        "type": "card",
                        "title": "Purchase Cost Amount",
                        "measure": "Purchase Cost Amount",
                    },
                    {
                        "type": "card",
                        "title": "Queue-to-PO Traceability Rate",
                        "measure": "Queue-to-PO Traceability Rate",
                    },
                    {
                        "type": "clustered_bar",
                        "title": "Open Purchase Cost by Supplier",
                        "dataset": "fact_purchase_order_line",
                        "axis": "dim_supplier[supplier_name]",
                        "measure": "Purchase Cost Amount",
                    },
                    {
                        "type": "clustered_bar",
                        "title": "Approved Quantity by Product Family",
                        "dataset": "fact_supply_chain_decision_queue_line",
                        "axis": "dim_product_family[product_family_name]",
                        "measure": "SC Approved Qty",
                    },
                    {
                        "type": "table",
                        "title": "Purchase Order Summary",
                        "dataset": "fact_purchase_order_line",
                        "columns": [
                            "purchase_order_code",
                            "dim_supplier[supplier_name]",
                            "purchase_order_status_code",
                            "ordered_qty",
                            "received_qty",
                            "open_qty",
                            "purchase_cost_amount_usd",
                        ],
                    },
                ],
            },
            {
                "page_name": "Inventory Decision Support",
                "objective": "Explain location inventory posture and the logistics actions needed to support service.",
                "visuals": [
                    {
                        "type": "card",
                        "title": "Available Qty",
                        "measure": "Available Qty",
                    },
                    {
                        "type": "card",
                        "title": "Inventory Exposure",
                        "measure": "Inventory Exposure",
                    },
                    {
                        "type": "card",
                        "title": "Movement In Transit Qty",
                        "measure": "Movement In Transit Qty",
                    },
                    {
                        "type": "card",
                        "title": "Active Logistics Action Count",
                        "measure": "Active Logistics Action Count",
                    },
                    {
                        "type": "clustered_bar",
                        "title": "Inventory Exposure by Location",
                        "dataset": "slv_current_inventory_position",
                        "axis": "dim_inventory_location[location_name]",
                        "measure": "Inventory Exposure",
                    },
                    {
                        "type": "clustered_bar",
                        "title": "Approved Logistics Qty by Decision Type",
                        "dataset": "fact_logistics_decision_queue_line",
                        "axis": "decision_type_code",
                        "measure": "Logistics Approved Qty",
                    },
                    {
                        "type": "table",
                        "title": "Location Action Summary",
                        "dataset": "gold_inventory_location_action_summary",
                        "columns": [
                            "location_name",
                            "action_status",
                            "on_hand_qty",
                            "available_qty",
                            "reserved_qty",
                            "in_transit_qty",
                            "inventory_value_proxy",
                            "active_logistics_action_count",
                        ],
                    },
                    {
                        "type": "table",
                        "title": "Inventory Movement Detail",
                        "dataset": "fact_inventory_movement_line",
                        "columns": [
                            "movement_status_code",
                            "movement_type_code",
                            "ship_date",
                            "expected_arrival_date",
                            "movement_qty",
                            "in_transit_qty",
                            "movement_cost_amount_usd",
                        ],
                    },
                ],
            },
        ],
        "publication_boundary_notes": [
            "Approved public-safe data only.",
            "Bounded proof, not an ERP replacement, optimizer, or public BI portal.",
            "Use request-access or authenticated embedding; do not use anonymous Publish to web.",
            "Subordinate to the technical-method route.",
        ],
    }


def build_markdown(contract: dict) -> str:
    lines = [
        "# FAB001 Three-View Report Contract",
        "",
        f"- Report: `{contract['report_name']}`",
        f"- Title: `{contract['report_title']}`",
        f"- Label: `{contract['artifact_label']}`",
        "",
        "## Intent",
        "",
        contract["intent"],
        "",
        "## Visuals",
        "",
    ]
    for page in contract["pages"]:
        lines.extend(
            [
                f"### {page['page_name']}",
                "",
                page["objective"],
                "",
            ]
        )
        for index, visual in enumerate(page["visuals"], start=1):
            lines.append(f"{index}. `{visual['type']}` - **{visual['title']}**")
            if "measure" in visual:
                lines.append(f"   Measure: `{visual['measure']}`")
            if "dataset" in visual:
                lines.append(f"   Dataset: `{visual['dataset']}`")
            if "axis" in visual:
                lines.append(f"   Axis: `{visual['axis']}`")
            if "columns" in visual:
                lines.append(f"   Columns: `{', '.join(visual['columns'])}`")
        lines.append("")
    lines.extend(
        [
            "",
            "## Publication Boundary Notes",
            "",
        ]
    )
    for note in contract["publication_boundary_notes"]:
        lines.append(f"- {note}")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    output_dir = REPO_ROOT / "05-compat" / "contracts"
    output_dir.mkdir(parents=True, exist_ok=True)
    contract = build_page_contract()
    write_json(output_dir / "fab001_core_visual_contract.json", contract)
    (output_dir / "fab001_core_visual_contract.md").write_text(
        build_markdown(contract), encoding="utf-8"
    )

    manifest_path = DEFAULT_OUTPUT_DIR / "manifest.json"
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        manifest["core_visual_contract"] = "05-compat/contracts/fab001_core_visual_contract.json"
        manifest["core_visual_runbook"] = "05-compat/contracts/fab001_fabric_build_runbook.md"
        write_json(manifest_path, manifest)

    print(f"Wrote visual contract: {output_dir / 'fab001_core_visual_contract.json'}")
    print(f"Wrote visual contract: {output_dir / 'fab001_core_visual_contract.md'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
