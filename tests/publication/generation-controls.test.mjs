import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildDimensionsToDirectory } from "../../platform/fabric/automation/dimension-build-lib.mjs";
import {
  GENERATION_CONTROL_FILENAMES,
  buildGenerationControlsToDirectory,
} from "../../platform/fabric/automation/generation-controls-lib.mjs";
import { validateGenerationControls } from "../../platform/fabric/validation/validate-generation-controls.mjs";

const FIXED_TIMESTAMP = "2026-04-01T19:10:00.000Z";
const FIXED_RULE_VERSION = "logic_first_controls_r1";

test("materializes the first generation-control tables from the approved package", async () => {
  const publicationDir = await mkdtemp(path.join(os.tmpdir(), "fabric-publication-"));
  const outputDir = await mkdtemp(path.join(os.tmpdir(), "fabric-generation-controls-"));

  try {
    await buildDimensionsToDirectory({
      outputDir: publicationDir,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });

    const result = await buildGenerationControlsToDirectory({
      publicationDir,
      outputDir,
      ruleVersion: FIXED_RULE_VERSION,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });

    assert.equal(result.controls.rule_account_generation_profile.length, 4);
    assert.equal(result.controls.rule_product_generation_profile.length, 5);
    assert.equal(result.controls.rule_account_product_eligibility.length, 5);
    assert.equal(result.controls.seed_inventory_position.length, 7);
    assert.equal(result.controls.rule_inventory_inbound.length, 7);
    assert.equal(result.controls.state_entity_shock.length, 7);
    assert.equal(result.controls.state_pending_receipt.length, 2);

    const recurringAccount = result.controls.rule_account_generation_profile.find(
      (row) => row.account_pattern_class === "RECURRING_SERVICE",
    );
    assert.equal(
      recurringAccount.seasonality_profile_code,
      "JANUARY_DIP_SPRING_RECOVERY",
    );
    assert.equal(recurringAccount.order_frequency_code, "WEEKLY_REPLENISH");
    assert.equal(recurringAccount.shock_sensitivity_class, "LOW");

    const controlledProduct = result.controls.rule_product_generation_profile.find(
      (row) => row.product_family_code === "CONTROLLED_ITEM",
    );
    assert.equal(controlledProduct.replenishment_posture_code, "REPLENISH_CONTROLLED");
    assert.equal(controlledProduct.target_margin_band_code, "MARGIN_26_31");

    const fallbackEligibility = result.controls.rule_account_product_eligibility.find(
      (row) => row.eligibility_status_code === "OBSERVED_FALLBACK",
    );
    assert.ok(fallbackEligibility);

    const inTransitSeed = result.controls.seed_inventory_position.find(
      (row) => row.opening_inventory_status_code === "IN_TRANSIT",
    );
    assert.ok(inTransitSeed);
    assert.equal(inTransitSeed.opening_in_transit_qty > 0, true);

    const transitInboundRule = result.controls.rule_inventory_inbound.find(
      (row) => row.inventory_location_sk === "LOC_SK_C2FF28F79326",
    );
    assert.ok(transitInboundRule);
    assert.equal(transitInboundRule.allowed_same_day_relief_flag, false);

    const supplyShock = result.controls.state_entity_shock.find(
      (row) =>
        row.entity_scope_code === "PRODUCT_LOCATION"
        && row.shock_profile_code === "SUPPLY_TIGHTNESS",
    );
    assert.ok(supplyShock);

    const pendingReceipt = result.controls.state_pending_receipt.find(
      (row) => row.inventory_location_sk === "LOC_SK_C2FF28F79326",
    );
    assert.ok(pendingReceipt);
    assert.equal(pendingReceipt.pending_qty, 60);

    for (const filename of Object.values(GENERATION_CONTROL_FILENAMES)) {
      const fileContents = await readFile(path.join(outputDir, filename), "utf8");
      assert.ok(fileContents.includes("\n"));
    }
  } finally {
    await rm(publicationDir, { recursive: true, force: true });
    await rm(outputDir, { recursive: true, force: true });
  }
});

test("validates generation controls against approved-package coverage and vocab rules", async () => {
  const publicationDir = await mkdtemp(path.join(os.tmpdir(), "fabric-publication-"));
  const outputDir = await mkdtemp(path.join(os.tmpdir(), "fabric-generation-controls-"));

  try {
    await buildDimensionsToDirectory({
      outputDir: publicationDir,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });
    await buildGenerationControlsToDirectory({
      publicationDir,
      outputDir,
      ruleVersion: FIXED_RULE_VERSION,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });

    const report = await validateGenerationControls({
      publicationDir,
      outputDir,
    });

    assert.deepEqual(report.errors, []);
  } finally {
    await rm(publicationDir, { recursive: true, force: true });
    await rm(outputDir, { recursive: true, force: true });
  }
});

test("generation controls are deterministic for the same approved package and rule version", async () => {
  const publicationDir = await mkdtemp(path.join(os.tmpdir(), "fabric-publication-"));
  const firstOutputDir = await mkdtemp(path.join(os.tmpdir(), "fabric-generation-controls-"));
  const secondOutputDir = await mkdtemp(path.join(os.tmpdir(), "fabric-generation-controls-"));

  try {
    await buildDimensionsToDirectory({
      outputDir: publicationDir,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });

    await buildGenerationControlsToDirectory({
      publicationDir,
      outputDir: firstOutputDir,
      ruleVersion: FIXED_RULE_VERSION,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });
    await buildGenerationControlsToDirectory({
      publicationDir,
      outputDir: secondOutputDir,
      ruleVersion: FIXED_RULE_VERSION,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });

    for (const filename of Object.values(GENERATION_CONTROL_FILENAMES)) {
      const firstContents = await readFile(path.join(firstOutputDir, filename), "utf8");
      const secondContents = await readFile(path.join(secondOutputDir, filename), "utf8");
      assert.equal(secondContents, firstContents);
    }
  } finally {
    await rm(publicationDir, { recursive: true, force: true });
    await rm(firstOutputDir, { recursive: true, force: true });
    await rm(secondOutputDir, { recursive: true, force: true });
  }
});
