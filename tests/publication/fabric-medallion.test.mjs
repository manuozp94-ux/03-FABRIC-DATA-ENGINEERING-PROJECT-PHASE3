import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";

import { buildDimensionsToDirectory } from "../../platform/fabric/automation/dimension-build-lib.mjs";
import { buildGenerationControlsToDirectory } from "../../platform/fabric/automation/generation-controls-lib.mjs";
import { buildFinancialFoundationToDirectory } from "../../platform/fabric/automation/financial-analytics-lib.mjs";

const execFileAsync = promisify(execFile);
const FIXED_TIMESTAMP = "2026-04-01T18:20:00.000Z";

test("builds a local Fabric medallion bundle with Bronze transport and notebook-derived Silver and Gold references", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-medallion-bundle-"));
  const publicationDir = path.join(tempRoot, "publication", "current");
  const outputDir = path.join(tempRoot, "proof");

  try {
    await buildDimensionsToDirectory({
      outputDir: publicationDir,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });

    await execFileAsync("python3", [
      "05-compat/scripts/land_fab001_lakehouse_tables.py",
      "--publication-dir",
      publicationDir,
      "--output-dir",
      outputDir,
    ], {
      cwd: "/Users/manuel.orozco/Desktop/CODEX PROJECTS/03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3",
    });

    const manifest = JSON.parse(
      await readFile(path.join(outputDir, "manifest.json"), "utf8"),
    );
    assert.equal(manifest.bronze_tables.fact_inventory_inbound.rows, 7);
    assert.equal(manifest.silver_tables.slv_inventory_inbound_enriched.rows, 7);
    assert.equal(
      manifest.silver_tables.slv_inventory_inbound_enriched.execution_mode,
      "fabric_notebook_runtime",
    );
    assert.equal(
      manifest.gold_tables.gold_supply_chain_decision_summary.execution_mode,
      "fabric_notebook_runtime",
    );
    assert.equal(manifest.runtime_execution.authoritative_layer, "fabric_notebook");
    assert.equal(manifest.runtime_execution.bronze_seed_root, "Files/fab001/current/bronze");
    assert.equal(manifest.runtime_execution.bronze_realism_mode, "controlled_realism_minimal");
    assert.match(manifest.notes.join("\n"), /bounded raw-like transport layer/i);
    assert.match(manifest.notes.join("\n"), /Silver can own cleanup and conformance inside Fabric/i);

    const bronzeCsv = await readFile(
      path.join(outputDir, "bronze", "fact_inventory_inbound.csv"),
      "utf8",
    );
    assert.match(bronzeCsv, /inventory_inbound_sk,product_sk,inventory_location_sk,receipt_date,receipt_qty,receipt_flow_type,receipt_value_proxy/);
    assert.match(bronzeCsv, /supplier receipt|supplier-receipt/);

    const bronzeAccountCsv = await readFile(
      path.join(outputDir, "bronze", "dim_account.csv"),
      "utf8",
    );
    assert.match(bronzeAccountCsv, /field-service|PROJECT DELIVERY|CHANNEL SUPPORT/);

    const referenceSilverCsv = await readFile(
      path.join(outputDir, "reference", "silver", "slv_inventory_inbound_enriched.csv"),
      "utf8",
    );
    assert.match(referenceSilverCsv, /product_family_name/);
    assert.match(referenceSilverCsv, /location_name/);
    assert.match(referenceSilverCsv, /SUPPLIER_RECEIPT/);

    const referenceDemandCsv = await readFile(
      path.join(outputDir, "reference", "silver", "slv_demand_line_enriched.csv"),
      "utf8",
    );
    assert.match(referenceDemandCsv, /customer_group/);
    assert.match(referenceDemandCsv, /Field Service|Project Delivery|Channel Support/);

    const referenceGoldCsv = await readFile(
      path.join(outputDir, "reference", "gold", "gold_demand_support_account_pattern.csv"),
      "utf8",
    );
    assert.match(referenceGoldCsv, /customer_group/);

    const rootEntries = await readdir(outputDir);
    assert.equal(rootEntries.includes("silver"), false);
    assert.equal(rootEntries.includes("gold"), false);

    const notebookSource = await readFile(
      path.join(
        "/Users/manuel.orozco/Desktop/CODEX PROJECTS/03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3",
        "05-compat/scripts/fab001_lakehouse_loader_notebook.py",
      ),
      "utf8",
    );
    assert.doesNotMatch(notebookSource, /SOURCE_ROOT}\/silver|SOURCE_ROOT}\/gold|silver\/.*\.csv|gold\/.*\.csv/);
    assert.doesNotMatch(notebookSource, /\.saveAsTable\(/);
    assert.match(notebookSource, /TABLES_ROOT/);
    assert.match(notebookSource, /\.save\(target_path\)/);
    assert.match(notebookSource, /normalize_display_label/);
    assert.match(notebookSource, /normalize_code_value/);
    assert.match(notebookSource, /"slv_demand_line_enriched"/);
    assert.match(notebookSource, /"gold_supply_chain_decision_summary"/);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("lands bounded financial foundation tables into the Fabric proof bundle when provided", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-medallion-financial-bundle-"));
  const publicationDir = path.join(tempRoot, "publication", "current");
  const controlsDir = path.join(tempRoot, "internal-controls", "current");
  const financialFoundationDir = path.join(tempRoot, "financial-foundation");
  const outputDir = path.join(tempRoot, "proof");

  try {
    await buildDimensionsToDirectory({
      outputDir: publicationDir,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });
    await buildGenerationControlsToDirectory({
      publicationDir,
      outputDir: controlsDir,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });
    await buildFinancialFoundationToDirectory({
      publicationDir,
      controlsDir,
      outputDir: financialFoundationDir,
      reportPath: path.join(tempRoot, "financial-foundation-report.json"),
      loadTimestampUtc: FIXED_TIMESTAMP,
    });

    await execFileAsync("python3", [
      "05-compat/scripts/land_fab001_lakehouse_tables.py",
      "--publication-dir",
      publicationDir,
      "--financial-foundation-dir",
      financialFoundationDir,
      "--output-dir",
      outputDir,
    ], {
      cwd: "/Users/manuel.orozco/Desktop/CODEX PROJECTS/03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3",
    });

    const manifest = JSON.parse(
      await readFile(path.join(outputDir, "manifest.json"), "utf8"),
    );
    assert.equal(manifest.financial_foundation_tables.dim_pricing_context.rows, 4);
    assert.equal(manifest.financial_foundation_tables.dim_cost_context.rows, 5);
    assert.equal(manifest.financial_foundation_tables.fact_cost_history.rows > 0, true);
    assert.equal(manifest.financial_foundation_tables.fact_price_list_history.rows > 0, true);
    assert.equal(manifest.financial_foundation_tables.fact_sales_realization.rows > 0, true);
    assert.equal(
      manifest.runtime_execution.financial_foundation_root,
      "Files/fab001/current/financial-foundation",
    );
    assert.match(
      manifest.notes.join("\n"),
      /financial foundation tables are also landed into the Lakehouse/i,
    );

    const realizationCsv = await readFile(
      path.join(outputDir, "financial-foundation", "fact_sales_realization.csv"),
      "utf8",
    );
    assert.match(realizationCsv, /sales_realization_sk,demand_line_sk,product_sk,account_sk/);
    assert.match(realizationCsv, /FULFILLMENT_LINE_RULE_RESOLVED/);

    const notebookSource = await readFile(
      path.join(
        "/Users/manuel.orozco/Desktop/CODEX PROJECTS/03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3",
        "05-compat/scripts/fab001_lakehouse_loader_notebook.py",
      ),
      "utf8",
    );
    assert.match(notebookSource, /financial-foundation\/fact_sales_realization\.csv/);
    assert.match(notebookSource, /"dim_pricing_context"/);
    assert.match(notebookSource, /"fact_price_list_history"/);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
