import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildDimensionsToDirectory } from "../../platform/fabric/automation/dimension-build-lib.mjs";
import { buildGenerationControlsToDirectory } from "../../platform/fabric/automation/generation-controls-lib.mjs";
import {
  FINANCIAL_FOUNDATION_FILENAMES,
  buildFinancialFoundationToDirectory,
} from "../../platform/fabric/automation/financial-analytics-lib.mjs";

const FIXED_BASELINE_TIMESTAMP = "2026-04-01T19:10:00.000Z";

test("materializes bounded effective-dated price and cost history from approved-package rules", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-financial-foundation-"));
  const publicationDir = path.join(tempRoot, "publication");
  const controlsDir = path.join(tempRoot, "controls");
  const outputDir = path.join(tempRoot, "financial");
  const reportPath = path.join(tempRoot, "foundation-report.json");

  try {
    await buildDimensionsToDirectory({
      outputDir: publicationDir,
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });
    await buildGenerationControlsToDirectory({
      publicationDir,
      outputDir: controlsDir,
      ruleVersion: "logic_first_controls_r1",
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });

    const result = await buildFinancialFoundationToDirectory({
      publicationDir,
      controlsDir,
      outputDir,
      reportPath,
      foundationVersion: "financial_foundation_r1",
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });

    assert.equal(result.foundation.dim_pricing_context.length, 4);
    assert.equal(result.foundation.dim_cost_context.length, 5);
    assert.equal(result.foundation.fact_cost_history.length, 35);
    assert.equal(result.foundation.fact_price_list_history.length, 140);
    assert.equal(result.foundation.fact_sales_realization.length > 0, true);

    const fieldServiceContext = result.foundation.dim_pricing_context.find(
      (row) => row.customer_group === "Field Service",
    );
    assert.equal(fieldServiceContext.channel_code, "DIRECT_SERVICE");
    assert.equal(fieldServiceContext.price_context_uplift_pct > 0, true);
    assert.equal(fieldServiceContext.bounded_discount_rate_pct, 0.02);

    const controlledCostRows = result.foundation.fact_cost_history.filter(
      (row) => row.unit_cost_drift_band_code === "COST_DRIFT_08_13",
    );
    assert.equal(controlledCostRows.length, 10);
    assert.equal(
      controlledCostRows.every((row, index, rows) =>
        index === 0 || row.unit_cost_amount >= rows[index - 1].unit_cost_amount
      ),
      true,
    );

    const baselineProductSk = result.foundation.fact_price_list_history[0].product_sk;
    const servicePrice = result.foundation.fact_price_list_history.find(
      (row) =>
        row.product_sk === baselineProductSk
        && row.pricing_context_sk === fieldServiceContext.pricing_context_sk
        && row.effective_start_date === "2024-01-01",
    );
    const partnerContext = result.foundation.dim_pricing_context.find(
      (row) => row.customer_group === "Channel Support",
    );
    const partnerPrice = result.foundation.fact_price_list_history.find(
      (row) =>
        row.product_sk === baselineProductSk
        && row.pricing_context_sk === partnerContext.pricing_context_sk
        && row.effective_start_date === "2024-01-01",
    );
    assert.ok(servicePrice);
    assert.ok(partnerPrice);
    assert.equal(servicePrice.list_price_amount > partnerPrice.list_price_amount, true);

    const sampleRealization = result.foundation.fact_sales_realization[0];
    assert.equal(sampleRealization.fulfilled_qty > 0, true);
    assert.equal(sampleRealization.net_revenue_amount <= sampleRealization.gross_revenue_amount, true);
    assert.equal(sampleRealization.cogs_amount > 0, true);
    assert.equal(sampleRealization.price_realization_pct > 0, true);

    const report = JSON.parse(await readFile(reportPath, "utf8"));
    assert.equal(report.status, "completed");
    assert.equal(
      report.current_boundary.sales_realization_status,
      "fulfilled_line_effective_dated_rule_resolved",
    );

    for (const filename of Object.values(FINANCIAL_FOUNDATION_FILENAMES)) {
      const fileContents = await readFile(path.join(outputDir, filename), "utf8");
      assert.ok(fileContents.includes("\n"));
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("financial foundation materialization is deterministic for the same approved package and controls", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-financial-foundation-det-"));
  const publicationDir = path.join(tempRoot, "publication");
  const controlsDir = path.join(tempRoot, "controls");
  const firstOutputDir = path.join(tempRoot, "financial-a");
  const secondOutputDir = path.join(tempRoot, "financial-b");
  const firstReportPath = path.join(tempRoot, "foundation-a.json");
  const secondReportPath = path.join(tempRoot, "foundation-b.json");

  try {
    await buildDimensionsToDirectory({
      outputDir: publicationDir,
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });
    await buildGenerationControlsToDirectory({
      publicationDir,
      outputDir: controlsDir,
      ruleVersion: "logic_first_controls_r1",
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });

    await buildFinancialFoundationToDirectory({
      publicationDir,
      controlsDir,
      outputDir: firstOutputDir,
      reportPath: firstReportPath,
      foundationVersion: "financial_foundation_r1",
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });
    await buildFinancialFoundationToDirectory({
      publicationDir,
      controlsDir,
      outputDir: secondOutputDir,
      reportPath: secondReportPath,
      foundationVersion: "financial_foundation_r1",
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });

    for (const filename of Object.values(FINANCIAL_FOUNDATION_FILENAMES)) {
      const firstContents = await readFile(path.join(firstOutputDir, filename), "utf8");
      const secondContents = await readFile(path.join(secondOutputDir, filename), "utf8");
      assert.equal(firstContents, secondContents);
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
