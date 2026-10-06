import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildDimensionsToDirectory } from "../../platform/fabric/automation/dimension-build-lib.mjs";
import { buildGenerationControlsToDirectory } from "../../platform/fabric/automation/generation-controls-lib.mjs";
import { buildRepresentativeMarketToDirectory } from "../../platform/fabric/automation/representative-market-lib.mjs";
import { validateRepresentativeMarket } from "../../platform/fabric/validation/validate-representative-market.mjs";

const FIXED_BASELINE_TIMESTAMP = "2026-04-01T19:10:00.000Z";
const FIXED_GENERATION_TIMESTAMP = "2026-04-01T21:00:00.000Z";

test("materializes a representative local market with bounded entity diversity", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-representative-"));
  const seedDir = path.join(tempRoot, "seed", "current");
  const seedControlsDir = path.join(tempRoot, "seed", "internal-controls", "current");
  const outputDir = path.join(tempRoot, "representative", "current");
  const internalDir = path.join(tempRoot, "representative", "internal-controls", "current");
  const reportPath = path.join(tempRoot, "representative", "representative-market-report.json");

  try {
    await buildDimensionsToDirectory({
      outputDir: seedDir,
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });
    await buildGenerationControlsToDirectory({
      publicationDir: seedDir,
      outputDir: seedControlsDir,
      ruleVersion: "logic_first_controls_r1",
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });

    const result = await buildRepresentativeMarketToDirectory({
      seedDir,
      seedControlsDir,
      outputDir,
      internalDir,
      reportPath,
      loadTimestampUtc: FIXED_GENERATION_TIMESTAMP,
    });

    assert.equal(result.representativePackage.dim_account.length, 96);
    assert.equal(result.representativePackage.dim_product.length, 140);
    assert.equal(result.representativePackage.dim_inventory_location.length, 16);
    assert.equal(result.plans.plan_account_product_eligibility.length, 640);
    assert.equal(result.plans.plan_product_location_stocking.length >= 120, true);
    assert.equal(result.plans.plan_product_location_stocking.length <= 220, true);
    assert.equal(result.representativePackage.fact_demand_line.length > 3000, true);
    assert.equal(result.representativePackage.fact_inventory_inbound.length > 500, true);
    assert.equal(result.representativePackage.fact_inventory_snapshot.length > 5000, true);

    const unknownAccounts = result.representativePackage.dim_account.filter(
      (row) => row.account_pattern_class === "UNKNOWN",
    ).length;
    const unclassifiedProducts = result.representativePackage.dim_product.filter(
      (row) => row.product_family_code === "UNCLASSIFIED",
    ).length;
    const customerGroups = new Set(
      result.representativePackage.dim_account.map((row) => row.customer_group),
    );

    assert.equal(unknownAccounts, 4);
    assert.equal(unclassifiedProducts, 8);
    assert.deepEqual(
      [...customerGroups].sort(),
      ["Channel Support", "Field Service", "Legacy Coverage", "Project Delivery"],
    );
    assert.ok(
      result.representativePackage.dim_account.every(
        (row) => row.account_name.includes(row.customer_group),
      ),
    );
    assert.ok(
      result.representativePackage.dim_product.every(
        (row) => !/[A-F0-9]{6}$/.test(row.product_name),
      ),
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("representative market validation passes for the generated local package", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-representative-validate-"));
  const seedDir = path.join(tempRoot, "seed", "current");
  const seedControlsDir = path.join(tempRoot, "seed", "internal-controls", "current");
  const outputDir = path.join(tempRoot, "representative", "current");
  const internalDir = path.join(tempRoot, "representative", "internal-controls", "current");
  const reportPath = path.join(tempRoot, "representative", "representative-market-report.json");

  try {
    await buildDimensionsToDirectory({
      outputDir: seedDir,
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });
    await buildGenerationControlsToDirectory({
      publicationDir: seedDir,
      outputDir: seedControlsDir,
      ruleVersion: "logic_first_controls_r1",
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });
    await buildRepresentativeMarketToDirectory({
      seedDir,
      seedControlsDir,
      outputDir,
      internalDir,
      reportPath,
      loadTimestampUtc: FIXED_GENERATION_TIMESTAMP,
    });

    const report = await validateRepresentativeMarket({
      outputDir,
      internalDir,
    });

    assert.deepEqual(report.errors, []);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("representative market materialization is deterministic for the same seeds and timestamp", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-representative-repro-"));
  const seedDir = path.join(tempRoot, "seed", "current");
  const seedControlsDir = path.join(tempRoot, "seed", "internal-controls", "current");
  const firstOutputDir = path.join(tempRoot, "representative-a", "current");
  const firstInternalDir = path.join(tempRoot, "representative-a", "internal-controls", "current");
  const firstReportPath = path.join(tempRoot, "representative-a", "representative-market-report.json");
  const secondOutputDir = path.join(tempRoot, "representative-b", "current");
  const secondInternalDir = path.join(tempRoot, "representative-b", "internal-controls", "current");
  const secondReportPath = path.join(tempRoot, "representative-b", "representative-market-report.json");

  try {
    await buildDimensionsToDirectory({
      outputDir: seedDir,
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });
    await buildGenerationControlsToDirectory({
      publicationDir: seedDir,
      outputDir: seedControlsDir,
      ruleVersion: "logic_first_controls_r1",
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });

    await buildRepresentativeMarketToDirectory({
      seedDir,
      seedControlsDir,
      outputDir: firstOutputDir,
      internalDir: firstInternalDir,
      reportPath: firstReportPath,
      loadTimestampUtc: FIXED_GENERATION_TIMESTAMP,
    });
    await buildRepresentativeMarketToDirectory({
      seedDir,
      seedControlsDir,
      outputDir: secondOutputDir,
      internalDir: secondInternalDir,
      reportPath: secondReportPath,
      loadTimestampUtc: FIXED_GENERATION_TIMESTAMP,
    });

    const firstDemand = await readFile(path.join(firstOutputDir, "fact_demand_line.json"), "utf8");
    const secondDemand = await readFile(path.join(secondOutputDir, "fact_demand_line.json"), "utf8");
    const firstPlans = await readFile(
      path.join(firstInternalDir, "plan_account_product_eligibility.json"),
      "utf8",
    );
    const secondPlans = await readFile(
      path.join(secondInternalDir, "plan_account_product_eligibility.json"),
      "utf8",
    );

    assert.equal(firstDemand, secondDemand);
    assert.equal(firstPlans, secondPlans);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
