# Fabric Notebook source for FAB001 Lakehouse loading
# Paste this into a new Fabric notebook attached to `lh_fab001_public_proof`
# after uploading the Bronze seed files into the OneLake proof path.

from pyspark.sql import functions as F
from pyspark.sql import Window
from pyspark.sql.types import (
    BooleanType,
    DateType,
    DoubleType,
    IntegerType,
    StringType,
    StructField,
    StructType,
    TimestampType,
)

SOURCE_ROOT = (
    "abfss://c11ed225-3ffc-440b-8cdb-88d1f366a91b@onelake.dfs.fabric.microsoft.com/"
    "06b073a8-8653-4691-829b-0690e06a9de4/Files/fab001/current"
)
LAKEHOUSE_ROOT = SOURCE_ROOT.rsplit("/Files/", 1)[0]
TABLES_ROOT = f"{LAKEHOUSE_ROOT}/Tables"


def schema(fields):
    return StructType([StructField(name, dtype, True) for name, dtype in fields])


def table_config(relative_path, fields):
    return {
        "path": f"{SOURCE_ROOT}/{relative_path}",
        "schema": schema(fields),
        "columns": [name for name, _ in fields],
    }


BRONZE_TABLES = {
    "dim_product": table_config(
        "bronze/dim_product.csv",
        [
            ("product_sk", StringType()),
            ("product_code", StringType()),
            ("product_name", StringType()),
            ("product_family_code", StringType()),
            ("demand_pattern_class", StringType()),
            ("planning_constraint_class", StringType()),
            ("inventory_policy_class", StringType()),
            ("fulfillment_risk_class", StringType()),
            ("lead_time_band", StringType()),
            ("criticality_band", StringType()),
            ("service_profile", StringType()),
            ("value_density_band", StringType()),
            ("unit_economic_band_code", StringType()),
            ("interchangeability_group_code", StringType()),
            ("product_category", StringType()),
            ("weight_value", DoubleType()),
            ("box_qty", IntegerType()),
            ("pallet_qty", IntegerType()),
            ("record_source_family", StringType()),
            ("source_file_version", StringType()),
            ("record_status", StringType()),
            ("publication_safety_flag", StringType()),
            ("load_timestamp_utc", TimestampType()),
        ],
    ),
    "dim_product_family": table_config(
        "bronze/dim_product_family.csv",
        [
            ("product_family_code", StringType()),
            ("product_family_name", StringType()),
            ("family_description", StringType()),
            ("storage_profile", StringType()),
            ("handling_profile", StringType()),
            ("synthetic_margin_band_code", StringType()),
            ("record_source_family", StringType()),
            ("source_file_version", StringType()),
            ("record_status", StringType()),
            ("publication_safety_flag", StringType()),
            ("load_timestamp_utc", TimestampType()),
        ],
    ),
    "dim_account": table_config(
        "bronze/dim_account.csv",
        [
            ("account_sk", StringType()),
            ("account_code", StringType()),
            ("account_name", StringType()),
            ("customer_group", StringType()),
            ("account_pattern_class", StringType()),
            ("service_network_code", StringType()),
            ("fulfillment_context_code", StringType()),
            ("record_source_family", StringType()),
            ("source_file_version", StringType()),
            ("record_status", StringType()),
            ("publication_safety_flag", StringType()),
            ("load_timestamp_utc", TimestampType()),
        ],
    ),
    "dim_inventory_location": table_config(
        "bronze/dim_inventory_location.csv",
        [
            ("inventory_location_sk", StringType()),
            ("site_code", StringType()),
            ("location_code", StringType()),
            ("location_name", StringType()),
            ("node_type_code", StringType()),
            ("logistics_area_code", StringType()),
            ("location_role_description", StringType()),
            ("record_source_family", StringType()),
            ("source_file_version", StringType()),
            ("record_status", StringType()),
            ("publication_safety_flag", StringType()),
            ("load_timestamp_utc", TimestampType()),
        ],
    ),
    "fact_demand_line": table_config(
        "bronze/fact_demand_line.csv",
        [
            ("demand_line_sk", StringType()),
            ("product_sk", StringType()),
            ("account_sk", StringType()),
            ("event_date", DateType()),
            ("requested_delivery_date", DateType()),
            ("demand_status_code", StringType()),
            ("demand_qty", IntegerType()),
            ("delivered_qty", IntegerType()),
            ("open_qty", IntegerType()),
            ("order_group_code", StringType()),
            ("promise_date", DateType()),
            ("priority_code", StringType()),
            ("demand_value_proxy", IntegerType()),
            ("gross_margin_proxy", IntegerType()),
            ("record_source_family", StringType()),
            ("source_file_version", StringType()),
            ("record_status", StringType()),
            ("publication_safety_flag", StringType()),
            ("load_timestamp_utc", TimestampType()),
        ],
    ),
    "fact_inventory_inbound": table_config(
        "bronze/fact_inventory_inbound.csv",
        [
            ("inventory_inbound_sk", StringType()),
            ("product_sk", StringType()),
            ("inventory_location_sk", StringType()),
            ("receipt_date", DateType()),
            ("receipt_qty", IntegerType()),
            ("receipt_flow_type", StringType()),
            ("receipt_value_proxy", IntegerType()),
            ("record_source_family", StringType()),
            ("source_file_version", StringType()),
            ("record_status", StringType()),
            ("publication_safety_flag", StringType()),
            ("load_timestamp_utc", TimestampType()),
        ],
    ),
    "fact_inventory_snapshot": table_config(
        "bronze/fact_inventory_snapshot.csv",
        [
            ("inventory_snapshot_sk", StringType()),
            ("product_sk", StringType()),
            ("inventory_location_sk", StringType()),
            ("snapshot_date", DateType()),
            ("on_hand_qty", IntegerType()),
            ("available_qty", IntegerType()),
            ("inventory_status_code", StringType()),
            ("reserved_qty", IntegerType()),
            ("in_transit_qty", IntegerType()),
            ("inventory_value_proxy", IntegerType()),
            ("node_value_concentration_band", StringType()),
            ("readiness_flag", StringType()),
            ("record_source_family", StringType()),
            ("source_file_version", StringType()),
            ("record_status", StringType()),
            ("publication_safety_flag", StringType()),
            ("load_timestamp_utc", TimestampType()),
        ],
    ),
}

BRONZE_TABLES.update(
    {
        "dim_service_region": table_config(
            "bronze/dim_service_region.csv",
            [
                ("service_region_code", StringType()),
                ("service_region_label", StringType()),
                ("service_region_class", StringType()),
                ("record_source_family", StringType()),
                ("source_file_version", StringType()),
                ("record_status", StringType()),
                ("publication_safety_flag", StringType()),
                ("load_timestamp_utc", TimestampType()),
            ],
        ),
        "dim_supplier": table_config(
            "bronze/dim_supplier.csv",
            [
                ("supplier_sk", StringType()),
                ("supplier_code", StringType()),
                ("supplier_name", StringType()),
                ("supplier_class", StringType()),
                ("supplier_reliability_band", StringType()),
                ("service_region_code", StringType()),
                ("currency_code", StringType()),
                ("record_source_family", StringType()),
                ("source_file_version", StringType()),
                ("record_status", StringType()),
                ("publication_safety_flag", StringType()),
                ("load_timestamp_utc", TimestampType()),
            ],
        ),
        "rule_supplier_product_lead_time": table_config(
            "bronze/rule_supplier_product_lead_time.csv",
            [
                ("supplier_product_lead_time_rule_sk", StringType()),
                ("supplier_sk", StringType()),
                ("product_sk", StringType()),
                ("receiving_inventory_location_sk", StringType()),
                ("lead_time_days", IntegerType()),
                ("minimum_order_qty", IntegerType()),
                ("order_multiple_qty", IntegerType()),
                ("preferred_supplier_flag", BooleanType()),
                ("cost_context_sk", StringType()),
                ("effective_start_date", DateType()),
                ("effective_end_date", DateType()),
                ("rule_version", StringType()),
                ("publication_safety_flag", StringType()),
                ("load_timestamp_utc", TimestampType()),
            ],
        ),
        "rule_location_transfer_lead_time": table_config(
            "bronze/rule_location_transfer_lead_time.csv",
            [
                ("location_transfer_lead_time_rule_sk", StringType()),
                ("origin_inventory_location_sk", StringType()),
                ("destination_inventory_location_sk", StringType()),
                ("transfer_mode_code", StringType()),
                ("transfer_lead_time_days", IntegerType()),
                ("transit_buffer_days", IntegerType()),
                ("effective_start_date", DateType()),
                ("effective_end_date", DateType()),
                ("rule_version", StringType()),
                ("publication_safety_flag", StringType()),
                ("load_timestamp_utc", TimestampType()),
            ],
        ),
        "rule_location_service_lead_time": table_config(
            "bronze/rule_location_service_lead_time.csv",
            [
                ("location_service_lead_time_rule_sk", StringType()),
                ("fulfillment_inventory_location_sk", StringType()),
                ("service_region_code", StringType()),
                ("account_sk", StringType()),
                ("service_lead_time_days", IntegerType()),
                ("service_priority_code", StringType()),
                ("effective_start_date", DateType()),
                ("effective_end_date", DateType()),
                ("rule_version", StringType()),
                ("publication_safety_flag", StringType()),
                ("load_timestamp_utc", TimestampType()),
            ],
        ),
        "fact_supply_chain_decision_queue_line": table_config(
            "bronze/fact_supply_chain_decision_queue_line.csv",
            [
                ("supply_chain_decision_line_sk", StringType()),
                ("decision_date", DateType()),
                ("decision_type_code", StringType()),
                ("recommendation_status_code", StringType()),
                ("product_sk", StringType()),
                ("receiving_inventory_location_sk", StringType()),
                ("supplier_sk", StringType()),
                ("recommended_qty", IntegerType()),
                ("approved_qty", IntegerType()),
                ("planned_order_date", DateType()),
                ("expected_receipt_date", DateType()),
                ("cost_amount_usd", DoubleType()),
                ("decision_reason_code", StringType()),
                ("source_file_version", StringType()),
                ("publication_safety_flag", StringType()),
                ("load_timestamp_utc", TimestampType()),
            ],
        ),
        "fact_logistics_decision_queue_line": table_config(
            "bronze/fact_logistics_decision_queue_line.csv",
            [
                ("logistics_decision_line_sk", StringType()),
                ("decision_date", DateType()),
                ("decision_type_code", StringType()),
                ("recommendation_status_code", StringType()),
                ("product_sk", StringType()),
                ("origin_inventory_location_sk", StringType()),
                ("destination_inventory_location_sk", StringType()),
                ("demand_line_sk", StringType()),
                ("account_sk", StringType()),
                ("recommended_qty", IntegerType()),
                ("approved_qty", IntegerType()),
                ("planned_execution_date", DateType()),
                ("expected_completion_date", DateType()),
                ("cost_amount_usd", DoubleType()),
                ("decision_reason_code", StringType()),
                ("source_file_version", StringType()),
                ("publication_safety_flag", StringType()),
                ("load_timestamp_utc", TimestampType()),
            ],
        ),
        "fact_purchase_order_line": table_config(
            "bronze/fact_purchase_order_line.csv",
            [
                ("purchase_order_line_sk", StringType()),
                ("purchase_order_code", StringType()),
                ("supply_chain_decision_line_sk", StringType()),
                ("product_sk", StringType()),
                ("supplier_sk", StringType()),
                ("receiving_inventory_location_sk", StringType()),
                ("order_date", DateType()),
                ("planned_receipt_date", DateType()),
                ("expected_release_date", DateType()),
                ("actual_receipt_date", DateType()),
                ("ordered_qty", IntegerType()),
                ("received_qty", IntegerType()),
                ("open_qty", IntegerType()),
                ("unit_cost_amount", DoubleType()),
                ("purchase_cost_amount_usd", DoubleType()),
                ("purchase_order_status_code", StringType()),
                ("currency_code", StringType()),
                ("source_file_version", StringType()),
                ("publication_safety_flag", StringType()),
                ("load_timestamp_utc", TimestampType()),
            ],
        ),
        "fact_purchase_order_status_history": table_config(
            "bronze/fact_purchase_order_status_history.csv",
            [
                ("purchase_order_status_history_sk", StringType()),
                ("purchase_order_line_sk", StringType()),
                ("purchase_order_status_code", StringType()),
                ("status_sequence", IntegerType()),
                ("status_start_at_utc", TimestampType()),
                ("status_end_at_utc", TimestampType()),
                ("status_reason_code", StringType()),
                ("source_file_version", StringType()),
                ("publication_safety_flag", StringType()),
                ("load_timestamp_utc", TimestampType()),
            ],
        ),
        "fact_inventory_movement_line": table_config(
            "bronze/fact_inventory_movement_line.csv",
            [
                ("inventory_movement_line_sk", StringType()),
                ("logistics_decision_line_sk", StringType()),
                ("product_sk", StringType()),
                ("origin_inventory_location_sk", StringType()),
                ("destination_inventory_location_sk", StringType()),
                ("ship_date", DateType()),
                ("expected_arrival_date", DateType()),
                ("actual_arrival_date", DateType()),
                ("movement_qty", IntegerType()),
                ("shipped_qty", IntegerType()),
                ("received_qty", IntegerType()),
                ("in_transit_qty", IntegerType()),
                ("unit_cost_amount", DoubleType()),
                ("movement_cost_amount_usd", DoubleType()),
                ("movement_status_code", StringType()),
                ("movement_type_code", StringType()),
                ("source_file_version", StringType()),
                ("publication_safety_flag", StringType()),
                ("load_timestamp_utc", TimestampType()),
            ],
        ),
        "fact_sales_fulfillment_line": table_config(
            "bronze/fact_sales_fulfillment_line.csv",
            [
                ("sales_fulfillment_line_sk", StringType()),
                ("logistics_decision_line_sk", StringType()),
                ("demand_line_sk", StringType()),
                ("product_sk", StringType()),
                ("account_sk", StringType()),
                ("fulfillment_inventory_location_sk", StringType()),
                ("ship_date", DateType()),
                ("planned_delivery_date", DateType()),
                ("actual_delivery_date", DateType()),
                ("fulfilled_qty", IntegerType()),
                ("backordered_qty", IntegerType()),
                ("service_lead_time_days", IntegerType()),
                ("unit_cost_amount", DoubleType()),
                ("cogs_amount", DoubleType()),
                ("fulfillment_status_code", StringType()),
                ("source_file_version", StringType()),
                ("publication_safety_flag", StringType()),
                ("load_timestamp_utc", TimestampType()),
            ],
        ),
    }
)

FINANCIAL_FOUNDATION_TABLES = {
    "dim_pricing_context": table_config(
        "financial-foundation/dim_pricing_context.csv",
        [
            ("pricing_context_sk", StringType()),
            ("customer_group", StringType()),
            ("account_pattern_class", StringType()),
            ("channel_code", StringType()),
            ("market_region_code", StringType()),
            ("pricing_tier_code", StringType()),
            ("price_context_uplift_pct", DoubleType()),
            ("bounded_discount_rate_pct", DoubleType()),
            ("currency_code", StringType()),
            ("foundation_version", StringType()),
            ("publication_safety_flag", StringType()),
            ("load_timestamp_utc", TimestampType()),
        ],
    ),
    "dim_cost_context": table_config(
        "financial-foundation/dim_cost_context.csv",
        [
            ("cost_context_sk", StringType()),
            ("replenishment_posture_code", StringType()),
            ("supply_node_class", StringType()),
            ("valuation_method_code", StringType()),
            ("procurement_profile_code", StringType()),
            ("currency_code", StringType()),
            ("foundation_version", StringType()),
            ("publication_safety_flag", StringType()),
            ("load_timestamp_utc", TimestampType()),
        ],
    ),
    "fact_cost_history": table_config(
        "financial-foundation/fact_cost_history.csv",
        [
            ("cost_history_sk", StringType()),
            ("product_sk", StringType()),
            ("cost_context_sk", StringType()),
            ("currency_code", StringType()),
            ("unit_cost_amount", DoubleType()),
            ("cost_method_code", StringType()),
            ("effective_start_date", DateType()),
            ("effective_end_date", DateType()),
            ("unit_cost_drift_band_code", StringType()),
            ("cost_review_cadence_code", StringType()),
            ("derivation_basis_code", StringType()),
            ("foundation_version", StringType()),
            ("publication_safety_flag", StringType()),
            ("load_timestamp_utc", TimestampType()),
        ],
    ),
    "fact_price_list_history": table_config(
        "financial-foundation/fact_price_list_history.csv",
        [
            ("price_history_sk", StringType()),
            ("product_sk", StringType()),
            ("pricing_context_sk", StringType()),
            ("currency_code", StringType()),
            ("list_price_amount", DoubleType()),
            ("price_basis_code", StringType()),
            ("effective_start_date", DateType()),
            ("effective_end_date", DateType()),
            ("price_review_cadence_code", StringType()),
            ("price_step_band_code", StringType()),
            ("target_margin_band_code", StringType()),
            ("derivation_basis_code", StringType()),
            ("foundation_version", StringType()),
            ("publication_safety_flag", StringType()),
            ("load_timestamp_utc", TimestampType()),
        ],
    ),
    "fact_sales_realization": table_config(
        "financial-foundation/fact_sales_realization.csv",
        [
            ("sales_realization_sk", StringType()),
            ("demand_line_sk", StringType()),
            ("product_sk", StringType()),
            ("account_sk", StringType()),
            ("pricing_context_sk", StringType()),
            ("cost_context_sk", StringType()),
            ("invoice_date", DateType()),
            ("fulfilled_qty", IntegerType()),
            ("unit_price_amount", DoubleType()),
            ("gross_revenue_amount", DoubleType()),
            ("discount_amount", DoubleType()),
            ("net_revenue_amount", DoubleType()),
            ("unit_cost_amount", DoubleType()),
            ("cogs_amount", DoubleType()),
            ("gross_margin_amount", DoubleType()),
            ("gross_margin_pct", DoubleType()),
            ("price_realization_pct", DoubleType()),
            ("currency_code", StringType()),
            ("derivation_basis_code", StringType()),
            ("foundation_version", StringType()),
            ("publication_safety_flag", StringType()),
            ("load_timestamp_utc", TimestampType()),
        ],
    ),
}

SILVER_COLUMN_ORDERS = {
    "slv_demand_line_enriched": [
        "demand_line_sk",
        "product_sk",
        "account_sk",
        "event_date",
        "requested_delivery_date",
        "demand_status_code",
        "demand_qty",
        "delivered_qty",
        "open_qty",
        "order_group_code",
        "promise_date",
        "priority_code",
        "demand_value_proxy",
        "gross_margin_proxy",
        "record_source_family",
        "source_file_version",
        "record_status",
        "publication_safety_flag",
        "load_timestamp_utc",
        "event_month",
        "is_open",
        "product_code",
        "product_name",
        "product_family_code",
        "product_family_name",
        "inventory_policy_class",
        "lead_time_band",
        "criticality_band",
        "account_code",
        "account_name",
        "customer_group",
        "account_pattern_class",
        "service_network_code",
        "fulfillment_context_code",
    ],
    "slv_inventory_inbound_enriched": [
        "inventory_inbound_sk",
        "product_sk",
        "inventory_location_sk",
        "receipt_date",
        "receipt_qty",
        "receipt_flow_type",
        "receipt_value_proxy",
        "record_source_family",
        "source_file_version",
        "record_status",
        "publication_safety_flag",
        "load_timestamp_utc",
        "product_code",
        "product_name",
        "product_family_code",
        "product_family_name",
        "inventory_policy_class",
        "lead_time_band",
        "criticality_band",
        "service_profile",
        "site_code",
        "location_code",
        "location_name",
        "node_type_code",
        "logistics_area_code",
        "location_role_description",
    ],
    "slv_inventory_position_enriched": [
        "inventory_snapshot_sk",
        "product_sk",
        "inventory_location_sk",
        "snapshot_date",
        "on_hand_qty",
        "available_qty",
        "inventory_status_code",
        "reserved_qty",
        "in_transit_qty",
        "inventory_value_proxy",
        "node_value_concentration_band",
        "readiness_flag",
        "record_source_family",
        "source_file_version",
        "record_status",
        "publication_safety_flag",
        "load_timestamp_utc",
        "is_current_snapshot",
        "action_status",
        "target_service_level_band",
        "coverage_target_band",
        "product_code",
        "product_name",
        "product_family_code",
        "product_family_name",
        "inventory_policy_class",
        "lead_time_band",
        "criticality_band",
        "service_profile",
        "site_code",
        "location_code",
        "location_name",
        "node_type_code",
        "logistics_area_code",
        "location_role_description",
        "network_open_demand_qty",
        "network_open_demand_value_proxy",
    ],
    "slv_current_inventory_position": [
        "inventory_snapshot_sk",
        "product_sk",
        "inventory_location_sk",
        "snapshot_date",
        "on_hand_qty",
        "available_qty",
        "inventory_status_code",
        "reserved_qty",
        "in_transit_qty",
        "inventory_value_proxy",
        "node_value_concentration_band",
        "readiness_flag",
        "record_source_family",
        "source_file_version",
        "record_status",
        "publication_safety_flag",
        "load_timestamp_utc",
        "is_current_snapshot",
        "action_status",
        "target_service_level_band",
        "coverage_target_band",
        "product_code",
        "product_name",
        "product_family_code",
        "product_family_name",
        "inventory_policy_class",
        "lead_time_band",
        "criticality_band",
        "service_profile",
        "site_code",
        "location_code",
        "location_name",
        "node_type_code",
        "logistics_area_code",
        "location_role_description",
        "network_open_demand_qty",
        "network_open_demand_value_proxy",
    ],
}

GOLD_COLUMN_ORDERS = {
    "gold_supply_chain_decision_summary": [
        "latest_approved_refresh_utc",
        "latest_demand_date",
        "latest_inventory_date",
        "open_demand_lines",
        "total_open_qty",
        "total_open_demand_value_proxy",
        "total_available_qty",
        "total_inventory_exposure",
        "ready_positions",
        "current_positions",
        "service_readiness_rate",
        "open_demand_coverage_ratio",
        "active_action_count",
        "latest_demand_month",
        "latest_demand_month_share",
    ],
    "gold_supply_chain_action_queue": [
        "product_code",
        "product_name",
        "product_family_name",
        "location_name",
        "node_type_code",
        "inventory_policy_class",
        "lead_time_band",
        "readiness_flag",
        "action_status",
        "available_qty",
        "inventory_value_proxy",
        "network_open_demand_qty",
        "network_open_demand_value_proxy",
    ],
    "gold_demand_support_account_pattern": [
        "account_pattern_class",
        "account_pattern_label",
        "customer_group",
        "open_qty",
        "open_value",
        "open_value_share",
    ],
    "gold_demand_support_product_family": [
        "product_family_code",
        "product_family_label",
        "open_qty",
        "open_value",
        "open_value_share",
    ],
    "gold_public_policy_reference": [
        "inventory_policy_class",
        "inventory_policy_label",
        "criticality_band",
        "target_service_level_band",
        "coverage_target_band",
        "lead_time_band",
        "service_profile",
    ],
}

GOLD_COLUMN_ORDERS.update(
    {
        "gold_supply_chain_decision_queue_summary": [
            "queue_domain",
            "decision_type_code",
            "recommendation_status_code",
            "decision_reason_code",
            "recommendation_count",
            "recommended_qty",
            "approved_qty",
            "recommended_cost_amount_usd",
            "approved_cost_amount_usd",
        ],
        "gold_purchase_order_summary": [
            "purchase_order_status_code",
            "supplier_sk",
            "order_line_count",
            "ordered_qty",
            "received_qty",
            "open_purchase_qty",
            "purchase_cost_amount_usd",
        ],
        "gold_logistics_decision_queue_summary": [
            "queue_domain",
            "decision_type_code",
            "recommendation_status_code",
            "decision_reason_code",
            "recommendation_count",
            "recommended_qty",
            "approved_qty",
            "recommended_cost_amount_usd",
            "approved_cost_amount_usd",
        ],
        "gold_inventory_movement_summary": [
            "movement_status_code",
            "movement_type_code",
            "movement_count",
            "movement_qty",
            "shipped_qty",
            "received_qty",
            "in_transit_qty",
            "movement_cost_amount_usd",
        ],
        "gold_sales_fulfillment_summary": [
            "fulfillment_status_code",
            "fulfillment_line_count",
            "fulfilled_qty",
            "backordered_qty",
            "cogs_amount",
        ],
        "gold_sales_dashboard_summary": [
            "fulfilled_qty",
            "backordered_qty",
            "open_demand_qty",
            "demand_value_proxy",
            "cogs_amount",
            "fulfillment_line_count",
        ],
        "gold_inventory_location_action_summary": [
            "inventory_location_sk",
            "location_name",
            "action_status",
            "position_count",
            "on_hand_qty",
            "available_qty",
            "reserved_qty",
            "in_transit_qty",
            "inventory_value_proxy",
            "active_logistics_action_count",
        ],
    }
)


def write_delta_table(df, table_name, ordered_columns):
    ordered_df = df.select([F.col(column_name) for column_name in ordered_columns])
    target_path = f"{TABLES_ROOT}/{table_name}"
    (
        ordered_df.write.mode("overwrite")
        .format("delta")
        .option("overwriteSchema", "true")
        .save(target_path)
    )
    print(f"Loaded {table_name}: {ordered_df.count()} rows -> {target_path}")
    return ordered_df


def to_service_level_band(column_name):
    return (
        F.when(F.col(column_name).isin("HIGH", "ELEVATED"), F.lit("HIGH"))
        .when(F.col(column_name) == F.lit("BASELINE"), F.lit("STANDARD"))
        .otherwise(F.lit("MONITOR"))
    )


def to_coverage_target_band(column_name):
    return (
        F.when(F.col(column_name) == F.lit("PALLET_BUFFER"), F.lit("BUFFERED"))
        .when(
            F.col(column_name).isin("STAGE_AND_COORDINATE", "HIGH_DENSITY_BIN"),
            F.lit("SHORT"),
        )
        .when(F.col(column_name) == F.lit("CONTROLLED_STOCK"), F.lit("CONTROLLED"))
        .otherwise(F.lit("MONITOR"))
    )


def to_action_status():
    return (
        F.when(
            (F.col("readiness_flag") != F.lit("READY")) & (F.col("available_qty") <= F.lit(0)),
            F.lit("REPLENISH_OR_PRODUCE"),
        )
        .when(F.col("readiness_flag") != F.lit("READY"), F.lit("MONITOR"))
        .otherwise(F.lit("HOLD"))
    )


def collapse_whitespace(expression):
    return F.trim(F.regexp_replace(expression, r"\s+", " "))


def normalize_display_label(column_name):
    cleaned = collapse_whitespace(
        F.regexp_replace(
            F.coalesce(F.col(column_name).cast("string"), F.lit("")),
            r"[-_]+",
            " ",
        )
    )
    return F.when(F.length(cleaned) == F.lit(0), F.lit(None)).otherwise(F.initcap(cleaned))


def normalize_code_value(column_name):
    cleaned = collapse_whitespace(
        F.regexp_replace(
            F.coalesce(F.col(column_name).cast("string"), F.lit("")),
            r"[- ]+",
            "_",
        )
    )
    collapsed = F.regexp_replace(cleaned, r"_+", "_")
    trimmed = F.regexp_replace(collapsed, r"^_+|_+$", "")
    return F.when(F.length(trimmed) == F.lit(0), F.lit(None)).otherwise(F.upper(trimmed))


def title_case_code_value(column_name):
    return F.initcap(F.regexp_replace(F.col(column_name), "_", " "))


bronze = {}
for table_name, config in BRONZE_TABLES.items():
    bronze_df = (
        spark.read.format("csv")
        .option("header", "true")
        .schema(config["schema"])
        .load(config["path"])
    )
    bronze[table_name] = write_delta_table(bronze_df, table_name, config["columns"])

financial_foundation = {}
for table_name, config in FINANCIAL_FOUNDATION_TABLES.items():
    financial_df = (
        spark.read.format("csv")
        .option("header", "true")
        .schema(config["schema"])
        .load(config["path"])
    )
    financial_foundation[table_name] = write_delta_table(
        financial_df,
        table_name,
        config["columns"],
    )

clean_product = bronze["dim_product"].select(
    "product_sk",
    "product_code",
    normalize_display_label("product_name").alias("product_name"),
    "product_family_code",
    "demand_pattern_class",
    "planning_constraint_class",
    "inventory_policy_class",
    "fulfillment_risk_class",
    "lead_time_band",
    "criticality_band",
    "service_profile",
    "value_density_band",
    "unit_economic_band_code",
    "interchangeability_group_code",
    "product_category",
    "weight_value",
    "box_qty",
    "pallet_qty",
    "record_source_family",
    "source_file_version",
    "record_status",
    "publication_safety_flag",
    "load_timestamp_utc",
)

clean_product_family = bronze["dim_product_family"].select(
    "product_family_code",
    normalize_display_label("product_family_name").alias("product_family_name"),
    "family_description",
    "storage_profile",
    "handling_profile",
    "synthetic_margin_band_code",
    "record_source_family",
    "source_file_version",
    "record_status",
    "publication_safety_flag",
    "load_timestamp_utc",
)

clean_account = bronze["dim_account"].select(
    "account_sk",
    "account_code",
    normalize_display_label("account_name").alias("account_name"),
    normalize_display_label("customer_group").alias("customer_group"),
    "account_pattern_class",
    "service_network_code",
    "fulfillment_context_code",
    "record_source_family",
    "source_file_version",
    "record_status",
    "publication_safety_flag",
    "load_timestamp_utc",
)

clean_location = bronze["dim_inventory_location"].select(
    "inventory_location_sk",
    "site_code",
    "location_code",
    normalize_display_label("location_name").alias("location_name"),
    "node_type_code",
    "logistics_area_code",
    "location_role_description",
    "record_source_family",
    "source_file_version",
    "record_status",
    "publication_safety_flag",
    "load_timestamp_utc",
)

clean_demand = bronze["fact_demand_line"].select(
    "demand_line_sk",
    "product_sk",
    "account_sk",
    "event_date",
    "requested_delivery_date",
    normalize_code_value("demand_status_code").alias("demand_status_code"),
    "demand_qty",
    "delivered_qty",
    "open_qty",
    "order_group_code",
    "promise_date",
    normalize_code_value("priority_code").alias("priority_code"),
    "demand_value_proxy",
    "gross_margin_proxy",
    "record_source_family",
    "source_file_version",
    "record_status",
    "publication_safety_flag",
    "load_timestamp_utc",
)

clean_inbound = bronze["fact_inventory_inbound"].select(
    "inventory_inbound_sk",
    "product_sk",
    "inventory_location_sk",
    "receipt_date",
    "receipt_qty",
    normalize_code_value("receipt_flow_type").alias("receipt_flow_type"),
    "receipt_value_proxy",
    "record_source_family",
    "source_file_version",
    "record_status",
    "publication_safety_flag",
    "load_timestamp_utc",
)

clean_inventory_snapshot = bronze["fact_inventory_snapshot"].select(
    "inventory_snapshot_sk",
    "product_sk",
    "inventory_location_sk",
    "snapshot_date",
    "on_hand_qty",
    "available_qty",
    normalize_code_value("inventory_status_code").alias("inventory_status_code"),
    "reserved_qty",
    "in_transit_qty",
    "inventory_value_proxy",
    "node_value_concentration_band",
    normalize_code_value("readiness_flag").alias("readiness_flag"),
    "record_source_family",
    "source_file_version",
    "record_status",
    "publication_safety_flag",
    "load_timestamp_utc",
)

product_context = (
    clean_product.alias("product")
    .join(
        clean_product_family.alias("family"),
        F.col("product.product_family_code") == F.col("family.product_family_code"),
        "left",
    )
    .select(
        F.col("product.product_sk").alias("product_sk"),
        F.col("product.product_code").alias("product_code"),
        F.col("product.product_name").alias("product_name"),
        F.col("product.product_family_code").alias("product_family_code"),
        F.coalesce(
            F.col("family.product_family_name"),
            title_case_code_value("product.product_family_code"),
        ).alias("product_family_name"),
        F.col("product.inventory_policy_class").alias("inventory_policy_class"),
        F.col("product.lead_time_band").alias("lead_time_band"),
        F.col("product.criticality_band").alias("criticality_band"),
        F.col("product.service_profile").alias("service_profile"),
    )
)

account_context = clean_account.select(
    "account_sk",
    "account_code",
    "account_name",
    F.coalesce(
        F.col("customer_group"),
        title_case_code_value("account_pattern_class"),
    ).alias("customer_group"),
    "account_pattern_class",
    "service_network_code",
    "fulfillment_context_code",
)

location_context = clean_location.select(
    "inventory_location_sk",
    "site_code",
    "location_code",
    "location_name",
    "node_type_code",
    "logistics_area_code",
    "location_role_description",
)

demand_enriched = (
    clean_demand.alias("demand")
    .join(product_context.alias("product"), F.col("demand.product_sk") == F.col("product.product_sk"), "left")
    .join(account_context.alias("account"), F.col("demand.account_sk") == F.col("account.account_sk"), "left")
    .select(
        F.col("demand.*"),
        F.date_format(F.col("demand.event_date"), "yyyy-MM").alias("event_month"),
        (F.col("demand.open_qty") > F.lit(0)).cast("boolean").alias("is_open"),
        F.col("product.product_code").alias("product_code"),
        F.col("product.product_name").alias("product_name"),
        F.col("product.product_family_code").alias("product_family_code"),
        F.col("product.product_family_name").alias("product_family_name"),
        F.col("product.inventory_policy_class").alias("inventory_policy_class"),
        F.col("product.lead_time_band").alias("lead_time_band"),
        F.col("product.criticality_band").alias("criticality_band"),
        F.col("account.account_code").alias("account_code"),
        F.col("account.account_name").alias("account_name"),
        F.col("account.customer_group").alias("customer_group"),
        F.col("account.account_pattern_class").alias("account_pattern_class"),
        F.col("account.service_network_code").alias("service_network_code"),
        F.col("account.fulfillment_context_code").alias("fulfillment_context_code"),
    )
)

write_delta_table(
    demand_enriched,
    "slv_demand_line_enriched",
    SILVER_COLUMN_ORDERS["slv_demand_line_enriched"],
)

inbound_enriched = (
    clean_inbound.alias("inbound")
    .join(product_context.alias("product"), F.col("inbound.product_sk") == F.col("product.product_sk"), "left")
    .join(
        location_context.alias("location"),
        F.col("inbound.inventory_location_sk") == F.col("location.inventory_location_sk"),
        "left",
    )
    .select(
        F.col("inbound.*"),
        F.col("product.product_code").alias("product_code"),
        F.col("product.product_name").alias("product_name"),
        F.col("product.product_family_code").alias("product_family_code"),
        F.col("product.product_family_name").alias("product_family_name"),
        F.col("product.inventory_policy_class").alias("inventory_policy_class"),
        F.col("product.lead_time_band").alias("lead_time_band"),
        F.col("product.criticality_band").alias("criticality_band"),
        F.col("product.service_profile").alias("service_profile"),
        F.col("location.site_code").alias("site_code"),
        F.col("location.location_code").alias("location_code"),
        F.col("location.location_name").alias("location_name"),
        F.col("location.node_type_code").alias("node_type_code"),
        F.col("location.logistics_area_code").alias("logistics_area_code"),
        F.col("location.location_role_description").alias("location_role_description"),
    )
)

write_delta_table(
    inbound_enriched,
    "slv_inventory_inbound_enriched",
    SILVER_COLUMN_ORDERS["slv_inventory_inbound_enriched"],
)

open_demand_by_product = (
    clean_demand
    .where(F.col("open_qty") > F.lit(0))
    .groupBy("product_sk")
    .agg(
        F.sum("open_qty").cast("int").alias("network_open_demand_qty"),
        F.sum("demand_value_proxy").cast("int").alias("network_open_demand_value_proxy"),
    )
)

latest_snapshot_date = clean_inventory_snapshot.agg(
    F.max("snapshot_date").alias("latest_snapshot_date")
).first()["latest_snapshot_date"]

inventory_position_enriched = (
    clean_inventory_snapshot.alias("inventory")
    .join(product_context.alias("product"), F.col("inventory.product_sk") == F.col("product.product_sk"), "left")
    .join(
        location_context.alias("location"),
        F.col("inventory.inventory_location_sk") == F.col("location.inventory_location_sk"),
        "left",
    )
    .join(
        open_demand_by_product.alias("demand"),
        F.col("inventory.product_sk") == F.col("demand.product_sk"),
        "left",
    )
    .select(
        F.col("inventory.*"),
        (F.col("inventory.snapshot_date") == F.lit(latest_snapshot_date)).cast("boolean").alias("is_current_snapshot"),
        to_action_status().alias("action_status"),
        to_service_level_band("product.criticality_band").alias("target_service_level_band"),
        to_coverage_target_band("product.inventory_policy_class").alias("coverage_target_band"),
        F.col("product.product_code").alias("product_code"),
        F.col("product.product_name").alias("product_name"),
        F.col("product.product_family_code").alias("product_family_code"),
        F.col("product.product_family_name").alias("product_family_name"),
        F.col("product.inventory_policy_class").alias("inventory_policy_class"),
        F.col("product.lead_time_band").alias("lead_time_band"),
        F.col("product.criticality_band").alias("criticality_band"),
        F.col("product.service_profile").alias("service_profile"),
        F.col("location.site_code").alias("site_code"),
        F.col("location.location_code").alias("location_code"),
        F.col("location.location_name").alias("location_name"),
        F.col("location.node_type_code").alias("node_type_code"),
        F.col("location.logistics_area_code").alias("logistics_area_code"),
        F.col("location.location_role_description").alias("location_role_description"),
        F.coalesce(F.col("demand.network_open_demand_qty"), F.lit(0)).cast("int").alias("network_open_demand_qty"),
        F.coalesce(F.col("demand.network_open_demand_value_proxy"), F.lit(0)).cast("int").alias("network_open_demand_value_proxy"),
    )
)

slv_inventory_position = write_delta_table(
    inventory_position_enriched,
    "slv_inventory_position_enriched",
    SILVER_COLUMN_ORDERS["slv_inventory_position_enriched"],
)

slv_current_inventory_position = write_delta_table(
    slv_inventory_position.where(F.col("is_current_snapshot") == F.lit(True)),
    "slv_current_inventory_position",
    SILVER_COLUMN_ORDERS["slv_current_inventory_position"],
)

latest_approved_refresh_utc = max(
    [
        bronze_df.agg(F.max("load_timestamp_utc").alias("value")).first()["value"]
        for bronze_df in bronze.values()
        if bronze_df.agg(F.max("load_timestamp_utc").alias("value")).first()["value"] is not None
    ],
    default=None,
)
latest_demand_date = clean_demand.agg(F.max("event_date").alias("value")).first()["value"]
latest_inventory_date = clean_inventory_snapshot.agg(F.max("snapshot_date").alias("value")).first()["value"]
open_demand_lines = clean_demand.where(F.col("open_qty") > F.lit(0)).count()
total_open_qty = clean_demand.agg(F.sum("open_qty").alias("value")).first()["value"] or 0
total_open_demand_value_proxy = (
    clean_demand
    .where(F.col("open_qty") > F.lit(0))
    .agg(F.sum("demand_value_proxy").alias("value"))
    .first()["value"]
    or 0
)
total_available_qty = slv_current_inventory_position.agg(F.sum("available_qty").alias("value")).first()["value"] or 0
total_inventory_exposure = (
    slv_current_inventory_position.agg(F.sum("inventory_value_proxy").alias("value")).first()["value"] or 0
)
ready_positions = slv_current_inventory_position.where(F.col("readiness_flag") == F.lit("READY")).count()
current_positions = slv_current_inventory_position.count()
active_action_count = (
    slv_current_inventory_position.where(F.col("action_status") != F.lit("HOLD")).count()
)
service_readiness_rate = float(ready_positions / current_positions) if current_positions else 0.0
open_demand_coverage_ratio = float(total_available_qty / total_open_qty) if total_open_qty else 0.0
latest_demand_month = (
    clean_demand
    .select(F.date_format(F.col("event_date"), "yyyy-MM").alias("event_month"))
    .agg(F.max("event_month").alias("value"))
    .first()["value"]
)
latest_demand_month_value = (
    clean_demand
    .where(F.date_format(F.col("event_date"), "yyyy-MM") == F.lit(latest_demand_month))
    .agg(F.sum("demand_value_proxy").alias("value"))
    .first()["value"]
    or 0
)
total_demand_value = (
    clean_demand.agg(F.sum("demand_value_proxy").alias("value")).first()["value"] or 0
)
latest_demand_month_share = (
    float(latest_demand_month_value / total_demand_value) if total_demand_value else 0.0
)

gold_summary = spark.range(1).select(
    F.lit(latest_approved_refresh_utc).cast("timestamp").alias("latest_approved_refresh_utc"),
    F.lit(latest_demand_date).cast("date").alias("latest_demand_date"),
    F.lit(latest_inventory_date).cast("date").alias("latest_inventory_date"),
    F.lit(open_demand_lines).cast("int").alias("open_demand_lines"),
    F.lit(total_open_qty).cast("int").alias("total_open_qty"),
    F.lit(total_open_demand_value_proxy).cast("int").alias("total_open_demand_value_proxy"),
    F.lit(total_available_qty).cast("int").alias("total_available_qty"),
    F.lit(total_inventory_exposure).cast("int").alias("total_inventory_exposure"),
    F.lit(ready_positions).cast("int").alias("ready_positions"),
    F.lit(current_positions).cast("int").alias("current_positions"),
    F.lit(service_readiness_rate).cast("double").alias("service_readiness_rate"),
    F.lit(open_demand_coverage_ratio).cast("double").alias("open_demand_coverage_ratio"),
    F.lit(active_action_count).cast("int").alias("active_action_count"),
    F.lit(latest_demand_month).cast("string").alias("latest_demand_month"),
    F.lit(latest_demand_month_share).cast("double").alias("latest_demand_month_share"),
)

write_delta_table(
    gold_summary,
    "gold_supply_chain_decision_summary",
    GOLD_COLUMN_ORDERS["gold_supply_chain_decision_summary"],
)

action_priority = (
    F.when(F.col("action_status") == F.lit("REPLENISH_OR_PRODUCE"), F.lit(0))
    .when(F.col("action_status") == F.lit("MONITOR"), F.lit(1))
    .otherwise(F.lit(2))
)

gold_action_queue = (
    slv_current_inventory_position
    .withColumn("action_priority", action_priority)
    .orderBy(F.col("action_priority").asc(), F.col("inventory_value_proxy").desc())
    .limit(8)
)

write_delta_table(
    gold_action_queue,
    "gold_supply_chain_action_queue",
    GOLD_COLUMN_ORDERS["gold_supply_chain_action_queue"],
)

pattern_window = Window.partitionBy()
pattern_support = (
    demand_enriched
    .where(F.col("open_qty") > F.lit(0))
    .groupBy("account_pattern_class", "customer_group")
    .agg(
        F.sum("open_qty").cast("int").alias("open_qty"),
        F.sum("demand_value_proxy").cast("int").alias("open_value"),
    )
    .withColumn(
        "account_pattern_label",
        F.coalesce(F.col("customer_group"), F.initcap(F.regexp_replace(F.col("account_pattern_class"), "_", " "))),
    )
    .withColumn(
        "open_value_share",
        F.when(
            F.sum("open_value").over(pattern_window) == F.lit(0),
            F.lit(0.0),
        ).otherwise(
            F.col("open_value") / F.sum("open_value").over(pattern_window)
        ).cast("double"),
    )
)

write_delta_table(
    pattern_support,
    "gold_demand_support_account_pattern",
    GOLD_COLUMN_ORDERS["gold_demand_support_account_pattern"],
)

family_window = Window.partitionBy()
family_support = (
    demand_enriched
    .where(F.col("open_qty") > F.lit(0))
    .groupBy("product_family_code")
    .agg(
        F.sum("open_qty").cast("int").alias("open_qty"),
        F.sum("demand_value_proxy").cast("int").alias("open_value"),
    )
    .withColumn("product_family_label", F.initcap(F.regexp_replace(F.col("product_family_code"), "_", " ")))
    .withColumn(
        "open_value_share",
        F.when(
            F.sum("open_value").over(family_window) == F.lit(0),
            F.lit(0.0),
        ).otherwise(
            F.col("open_value") / F.sum("open_value").over(family_window)
        ).cast("double"),
    )
)

write_delta_table(
    family_support,
    "gold_demand_support_product_family",
    GOLD_COLUMN_ORDERS["gold_demand_support_product_family"],
)

policy_reference = clean_product.select(
    F.col("inventory_policy_class"),
    F.initcap(F.regexp_replace(F.col("inventory_policy_class"), "_", " ")).alias("inventory_policy_label"),
    F.col("criticality_band"),
    to_service_level_band("criticality_band").alias("target_service_level_band"),
    to_coverage_target_band("inventory_policy_class").alias("coverage_target_band"),
    F.col("lead_time_band"),
    F.col("service_profile"),
)

write_delta_table(
    policy_reference,
    "gold_public_policy_reference",
    GOLD_COLUMN_ORDERS["gold_public_policy_reference"],
)

def decision_queue_summary(df, queue_domain):
    return (
        df
        .groupBy("decision_type_code", "recommendation_status_code", "decision_reason_code")
        .agg(
            F.count("*").cast("int").alias("recommendation_count"),
            F.sum("recommended_qty").cast("int").alias("recommended_qty"),
            F.sum("approved_qty").cast("int").alias("approved_qty"),
            F.sum("cost_amount_usd").cast("double").alias("recommended_cost_amount_usd"),
            F.sum(
                F.when(F.col("approved_qty") > F.lit(0), F.col("cost_amount_usd")).otherwise(F.lit(0.0))
            ).cast("double").alias("approved_cost_amount_usd"),
        )
        .withColumn("queue_domain", F.lit(queue_domain))
    )


write_delta_table(
    decision_queue_summary(bronze["fact_supply_chain_decision_queue_line"], "supply_chain"),
    "gold_supply_chain_decision_queue_summary",
    GOLD_COLUMN_ORDERS["gold_supply_chain_decision_queue_summary"],
)

purchase_order_summary = (
    bronze["fact_purchase_order_line"]
    .groupBy("purchase_order_status_code", "supplier_sk")
    .agg(
        F.count("*").cast("int").alias("order_line_count"),
        F.sum("ordered_qty").cast("int").alias("ordered_qty"),
        F.sum("received_qty").cast("int").alias("received_qty"),
        F.sum("open_qty").cast("int").alias("open_purchase_qty"),
        F.sum("purchase_cost_amount_usd").cast("double").alias("purchase_cost_amount_usd"),
    )
)

write_delta_table(
    purchase_order_summary,
    "gold_purchase_order_summary",
    GOLD_COLUMN_ORDERS["gold_purchase_order_summary"],
)

write_delta_table(
    decision_queue_summary(bronze["fact_logistics_decision_queue_line"], "logistics"),
    "gold_logistics_decision_queue_summary",
    GOLD_COLUMN_ORDERS["gold_logistics_decision_queue_summary"],
)

inventory_movement_summary = (
    bronze["fact_inventory_movement_line"]
    .groupBy("movement_status_code", "movement_type_code")
    .agg(
        F.count("*").cast("int").alias("movement_count"),
        F.sum("movement_qty").cast("int").alias("movement_qty"),
        F.sum("shipped_qty").cast("int").alias("shipped_qty"),
        F.sum("received_qty").cast("int").alias("received_qty"),
        F.sum("in_transit_qty").cast("int").alias("in_transit_qty"),
        F.sum("movement_cost_amount_usd").cast("double").alias("movement_cost_amount_usd"),
    )
)

write_delta_table(
    inventory_movement_summary,
    "gold_inventory_movement_summary",
    GOLD_COLUMN_ORDERS["gold_inventory_movement_summary"],
)

sales_fulfillment_summary = (
    bronze["fact_sales_fulfillment_line"]
    .groupBy("fulfillment_status_code")
    .agg(
        F.count("*").cast("int").alias("fulfillment_line_count"),
        F.sum("fulfilled_qty").cast("int").alias("fulfilled_qty"),
        F.sum("backordered_qty").cast("int").alias("backordered_qty"),
        F.sum("cogs_amount").cast("double").alias("cogs_amount"),
    )
)

write_delta_table(
    sales_fulfillment_summary,
    "gold_sales_fulfillment_summary",
    GOLD_COLUMN_ORDERS["gold_sales_fulfillment_summary"],
)

sales_dashboard_summary = (
    bronze["fact_sales_fulfillment_line"]
    .agg(
        F.sum("fulfilled_qty").cast("int").alias("fulfilled_qty"),
        F.sum("backordered_qty").cast("int").alias("backordered_qty"),
        F.sum("cogs_amount").cast("double").alias("cogs_amount"),
        F.count("*").cast("int").alias("fulfillment_line_count"),
    )
    .withColumn("open_demand_qty", F.lit(total_open_qty).cast("int"))
    .withColumn("demand_value_proxy", F.lit(total_demand_value).cast("int"))
)

write_delta_table(
    sales_dashboard_summary,
    "gold_sales_dashboard_summary",
    GOLD_COLUMN_ORDERS["gold_sales_dashboard_summary"],
)

logistics_action_by_location = (
    bronze["fact_logistics_decision_queue_line"]
    .withColumn(
        "inventory_location_sk",
        F.coalesce(F.col("origin_inventory_location_sk"), F.col("destination_inventory_location_sk")),
    )
    .where(F.col("inventory_location_sk").isNotNull())
    .groupBy("inventory_location_sk")
    .agg(F.count("*").cast("int").alias("active_logistics_action_count"))
)

inventory_location_action_summary = (
    slv_current_inventory_position
    .groupBy("inventory_location_sk", "location_name", "action_status")
    .agg(
        F.count("*").cast("int").alias("position_count"),
        F.sum("on_hand_qty").cast("int").alias("on_hand_qty"),
        F.sum("available_qty").cast("int").alias("available_qty"),
        F.sum("reserved_qty").cast("int").alias("reserved_qty"),
        F.sum("in_transit_qty").cast("int").alias("in_transit_qty"),
        F.sum("inventory_value_proxy").cast("int").alias("inventory_value_proxy"),
    )
    .join(logistics_action_by_location, "inventory_location_sk", "left")
    .withColumn(
        "active_logistics_action_count",
        F.coalesce(F.col("active_logistics_action_count"), F.lit(0)).cast("int"),
    )
)

write_delta_table(
    inventory_location_action_summary,
    "gold_inventory_location_action_summary",
    GOLD_COLUMN_ORDERS["gold_inventory_location_action_summary"],
)

print("FAB001 proof tables loaded successfully from Bronze seed.")
