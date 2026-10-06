import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  materializeFabricPublicServingExtract,
  PUBLIC_SERVING_EXTRACT_FILENAMES,
} from "../../platform/fabric/automation/materialize-fabric-public-serving-extract.mjs";
import { buildDimensionsToDirectory } from "../../platform/fabric/automation/dimension-build-lib.mjs";
import { buildGenerationControlsToDirectory } from "../../platform/fabric/automation/generation-controls-lib.mjs";
import { buildFinancialFoundationToDirectory } from "../../platform/fabric/automation/financial-analytics-lib.mjs";

const REPO_ROOT = "/Users/manuel.orozco/Desktop/CODEX PROJECTS/03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3";

function sumBy(rows, field) {
  return rows.reduce((sum, row) => sum + Number(row[field] ?? 0), 0);
}

function safeRatio(numerator, denominator) {
  if (!denominator) {
    return 0;
  }
  return numerator / denominator;
}

function assertClose(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < 1e-6, `${message}: expected ${expected}, received ${actual}`);
}

test("materializes bounded financial outputs alongside the public serving extract", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-public-serving-extract-"));
  const publicationDir = path.join(tempRoot, "publication");
  const controlsDir = path.join(tempRoot, "controls");
  const financialFoundationDir = path.join(tempRoot, "financial-foundation");
  const outputDir = path.join(tempRoot, "extract");
  const siteOutputDir = path.join(tempRoot, "site");
  const reportPath = path.join(tempRoot, "materialization-report.json");

  try {
    await buildDimensionsToDirectory({
      outputDir: publicationDir,
      loadTimestampUtc: "2026-04-03T21:00:00.000Z",
    });
    await buildGenerationControlsToDirectory({
      publicationDir,
      outputDir: controlsDir,
      ruleVersion: "logic_first_controls_r1",
      loadTimestampUtc: "2026-04-03T21:00:00.000Z",
    });
    await buildFinancialFoundationToDirectory({
      publicationDir,
      controlsDir,
      outputDir: financialFoundationDir,
      reportPath: path.join(tempRoot, "financial-foundation-report.json"),
      recordedAtUtc: "2026-04-03T21:00:00.000Z",
      loadTimestampUtc: "2026-04-03T21:00:00.000Z",
    });

    await materializeFabricPublicServingExtract({
      goldReferenceDir: path.join(
        REPO_ROOT,
        "_bmad-output/test-artifacts/fabric-proof/fab001/current/reference/gold",
      ),
      approvedPublicationDir: publicationDir,
      financialFoundationDir,
      outputDir,
      siteOutputDir,
      reportPath,
      currentReleasePointerPath: path.join(
        REPO_ROOT,
        "_bmad-output/test-artifacts/release-ledger/current-release.json",
      ),
      recordedAtUtc: "2026-04-03T21:00:00.000Z",
    });

    const financialSummary = JSON.parse(
      await readFile(path.join(outputDir, "financial-summary.json"), "utf8"),
    );
    const monthlyTrend = JSON.parse(
      await readFile(path.join(outputDir, "monthly-financial-trend.json"), "utf8"),
    );
    const salesRealization = JSON.parse(
      await readFile(path.join(financialFoundationDir, "fact_sales_realization.json"), "utf8"),
    );
    const unitEconomics = JSON.parse(
      await readFile(path.join(outputDir, "unit-economics-reference.json"), "utf8"),
    );
    const manifest = JSON.parse(
      await readFile(path.join(outputDir, "manifest.json"), "utf8"),
    );
    const mirroredFinancialSummary = JSON.parse(
      await readFile(path.join(siteOutputDir, "financial-summary.json"), "utf8"),
    );

    assert.equal(financialSummary.report_type, "fab001_public_serving_financial_summary");
    assert.ok(financialSummary.total_demand_value_proxy > 0);
    assert.ok(financialSummary.total_gross_margin_proxy > 0);
    assert.ok(financialSummary.total_inventory_exposure > 0);
    assert.ok(financialSummary.inventory_to_open_demand_ratio > 0);
    assert.ok(financialSummary.total_realized_revenue_amount > 0);
    assert.ok(financialSummary.total_realized_gross_margin_amount > 0);
    assertClose(
      financialSummary.total_realized_revenue_amount,
      sumBy(salesRealization, "net_revenue_amount"),
      "financial summary realized revenue should reconcile to fulfilled-line sales realization",
    );
    assertClose(
      financialSummary.total_realized_cogs_amount,
      sumBy(salesRealization, "cogs_amount"),
      "financial summary realized COGS should reconcile to fulfilled-line sales realization",
    );
    assertClose(
      financialSummary.total_realized_gross_margin_amount,
      sumBy(salesRealization, "gross_margin_amount"),
      "financial summary realized gross margin should reconcile to fulfilled-line sales realization",
    );
    assertClose(
      financialSummary.realized_margin_rate,
      safeRatio(
        financialSummary.total_realized_gross_margin_amount,
        financialSummary.total_realized_revenue_amount,
      ),
      "financial summary realized margin rate should reconcile to realized revenue and margin",
    );

    assert.ok(monthlyTrend.length >= 6);
    assert.equal(monthlyTrend.at(-1).month, "2026-04");
    assert.ok(monthlyTrend.at(-1).demand_value_proxy > 0);
    assert.ok(monthlyTrend.at(-1).month_end_inventory_exposure >= 0);
    assert.ok(monthlyTrend.at(-1).realized_revenue_amount >= 0);
    const realizationByMonth = new Map();
    for (const row of salesRealization) {
      const month = String(row.invoice_date ?? "").slice(0, 7);
      if (!month) {
        continue;
      }
      const bucket = realizationByMonth.get(month) ?? {
        revenue: 0,
        cogs: 0,
        margin: 0,
      };
      bucket.revenue += Number(row.net_revenue_amount ?? 0);
      bucket.cogs += Number(row.cogs_amount ?? 0);
      bucket.margin += Number(row.gross_margin_amount ?? 0);
      realizationByMonth.set(month, bucket);
    }
    for (const row of monthlyTrend) {
      const expected = realizationByMonth.get(row.month) ?? {
        revenue: 0,
        cogs: 0,
        margin: 0,
      };
      assertClose(
        row.realized_revenue_amount,
        expected.revenue,
        `monthly trend realized revenue should reconcile for ${row.month}`,
      );
      assertClose(
        row.realized_cogs_amount,
        expected.cogs,
        `monthly trend realized COGS should reconcile for ${row.month}`,
      );
      assertClose(
        row.realized_gross_margin_amount,
        expected.margin,
        `monthly trend realized gross margin should reconcile for ${row.month}`,
      );
      assertClose(
        row.realized_margin_rate,
        safeRatio(expected.margin, expected.revenue),
        `monthly trend realized margin rate should reconcile for ${row.month}`,
      );
    }

    assert.ok(unitEconomics.length >= 4);
    assert.ok(
      unitEconomics.some((row) => row.product_family_code === "CONTROLLED_ITEM"),
    );
    assert.ok(
      unitEconomics.every(
        (row) => row.standard_price_max >= row.standard_price_min,
      ),
    );

    assert.deepEqual(mirroredFinancialSummary, financialSummary);
    assert.deepEqual(
      manifest.files.map((file) => file.filename).sort(),
      PUBLIC_SERVING_EXTRACT_FILENAMES.filter((filename) => filename !== "manifest.json").sort(),
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("fails closed when a required Gold reference file is missing", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-public-serving-extract-missing-gold-"));
  const publicationDir = path.join(tempRoot, "publication");
  const controlsDir = path.join(tempRoot, "controls");
  const financialFoundationDir = path.join(tempRoot, "financial-foundation");
  const goldReferenceDir = path.join(tempRoot, "gold");

  try {
    await buildDimensionsToDirectory({
      outputDir: publicationDir,
      loadTimestampUtc: "2026-04-03T21:00:00.000Z",
    });
    await buildGenerationControlsToDirectory({
      publicationDir,
      outputDir: controlsDir,
      ruleVersion: "logic_first_controls_r1",
      loadTimestampUtc: "2026-04-03T21:00:00.000Z",
    });
    await buildFinancialFoundationToDirectory({
      publicationDir,
      controlsDir,
      outputDir: financialFoundationDir,
      reportPath: path.join(tempRoot, "financial-foundation-report.json"),
      recordedAtUtc: "2026-04-03T21:00:00.000Z",
      loadTimestampUtc: "2026-04-03T21:00:00.000Z",
    });
    await cp(
      path.join(REPO_ROOT, "_bmad-output/test-artifacts/fabric-proof/fab001/current/reference/gold"),
      goldReferenceDir,
      { recursive: true },
    );
    await rm(path.join(goldReferenceDir, "gold_supply_chain_decision_summary.csv"));

    await assert.rejects(
      materializeFabricPublicServingExtract({
        goldReferenceDir,
        approvedPublicationDir: publicationDir,
        financialFoundationDir,
        outputDir: path.join(tempRoot, "extract"),
        siteOutputDir: path.join(tempRoot, "site"),
        reportPath: path.join(tempRoot, "report.json"),
        currentReleasePointerPath: path.join(
          REPO_ROOT,
          "_bmad-output/test-artifacts/release-ledger/current-release.json",
        ),
        recordedAtUtc: "2026-04-03T21:00:00.000Z",
      }),
      /gold_supply_chain_decision_summary\.csv|ENOENT/,
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("fails closed when the financial foundation required for realized metrics is missing", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-public-serving-extract-missing-financial-"));
  const publicationDir = path.join(tempRoot, "publication");
  const controlsDir = path.join(tempRoot, "controls");
  const financialFoundationDir = path.join(tempRoot, "financial-foundation");

  try {
    await buildDimensionsToDirectory({
      outputDir: publicationDir,
      loadTimestampUtc: "2026-04-03T21:00:00.000Z",
    });
    await buildGenerationControlsToDirectory({
      publicationDir,
      outputDir: controlsDir,
      ruleVersion: "logic_first_controls_r1",
      loadTimestampUtc: "2026-04-03T21:00:00.000Z",
    });
    await buildFinancialFoundationToDirectory({
      publicationDir,
      controlsDir,
      outputDir: financialFoundationDir,
      reportPath: path.join(tempRoot, "financial-foundation-report.json"),
      recordedAtUtc: "2026-04-03T21:00:00.000Z",
      loadTimestampUtc: "2026-04-03T21:00:00.000Z",
    });
    await rm(path.join(financialFoundationDir, "fact_sales_realization.json"));

    await assert.rejects(
      materializeFabricPublicServingExtract({
        goldReferenceDir: path.join(
          REPO_ROOT,
          "_bmad-output/test-artifacts/fabric-proof/fab001/current/reference/gold",
        ),
        approvedPublicationDir: publicationDir,
        financialFoundationDir,
        outputDir: path.join(tempRoot, "extract"),
        siteOutputDir: path.join(tempRoot, "site"),
        reportPath: path.join(tempRoot, "report.json"),
        currentReleasePointerPath: path.join(
          REPO_ROOT,
          "_bmad-output/test-artifacts/release-ledger/current-release.json",
        ),
        recordedAtUtc: "2026-04-03T21:00:00.000Z",
      }),
      /fact_sales_realization\.json|ENOENT/,
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
