#!/usr/bin/env python3
from __future__ import annotations

from pyspark.sql import functions as F


RUNTIME_GOVERNANCE_ROOT = (
    "abfss://c11ed225-3ffc-440b-8cdb-88d1f366a91b@onelake.dfs.fabric.microsoft.com/"
    "06b073a8-8653-4691-829b-0690e06a9de4/Files/fab001/current/runtime-governance/current"
)
LAKEHOUSE_ROOT = RUNTIME_GOVERNANCE_ROOT.rsplit("/Files/", 1)[0]
TABLES_ROOT = f"{LAKEHOUSE_ROOT}/Tables"
TABLE_COLUMNS = {
    "ctrl_release_registry": [
        "release_id",
        "release_state",
        "release_record_path",
        "publication_dir",
        "pipeline_item_id",
        "pipeline_name",
        "pipeline_run_id",
        "pipeline_run_status",
        "notebook_item_id",
        "notebook_name",
        "notebook_run_status",
        "public_source_mode",
        "serving_extract_status",
        "recorded_at_utc",
    ],
    "ctrl_last_known_good": [
        "active_release_id",
        "last_known_good_release_id",
        "active_pipeline_run_id",
        "active_pipeline_status",
        "public_source_mode",
        "updated_at_utc",
        "recovery_note",
    ],
    "ctrl_runtime_job_history": [
        "execution_type",
        "job_id",
        "parent_job_id",
        "item_id",
        "item_name",
        "status",
        "started_at_utc",
        "ended_at_utc",
        "failure_reason",
        "recorded_at_utc",
    ],
    "ctrl_asset_refresh_history": [
        "asset_type",
        "asset_name",
        "asset_id",
        "status",
        "refresh_record_path",
        "related_release_id",
        "public_source_mode",
        "recorded_at_utc",
    ],
}


def load_control_table(table_name: str):
    source_path = f"{RUNTIME_GOVERNANCE_ROOT}/{table_name}.csv"
    dataframe = spark.read.option("header", True).csv(source_path)
    expected_columns = TABLE_COLUMNS[table_name]
    projected = []
    for column_name in expected_columns:
        if column_name in dataframe.columns:
            projected.append(F.col(column_name).cast("string").alias(column_name))
        else:
            projected.append(F.lit(None).cast("string").alias(column_name))
    return dataframe.select(*projected)


def write_control_table(table_name: str):
    dataframe = load_control_table(table_name)
    row_count = dataframe.count()
    target_path = f"{TABLES_ROOT}/{table_name}"
    (
        dataframe.write.mode("overwrite")
        .format("delta")
        .option("overwriteSchema", "true")
        .save(target_path)
    )
    print(f"Materialized control table {table_name} with {row_count} rows -> {target_path}")


for target_table in TABLE_COLUMNS:
    write_control_table(target_table)

print("FAB001 runtime governance tables refreshed from OneLake control files.")
