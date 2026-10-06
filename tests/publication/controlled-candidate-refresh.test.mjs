import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildDimensionsToDirectory } from "../../platform/fabric/automation/dimension-build-lib.mjs";
import { buildGenerationControlsToDirectory } from "../../platform/fabric/automation/generation-controls-lib.mjs";
import {
  PUBLIC_OUTPUT_FILENAMES,
  buildControlledCandidatePackageToDirectory,
} from "../../platform/fabric/automation/controlled-candidate-refresh-lib.mjs";

const FIXED_BASELINE_TIMESTAMP = "2026-04-01T19:10:00.000Z";
const FIXED_GENERATION_TIMESTAMP = "2026-04-01T20:00:00.000Z";
const FIXED_RULE_VERSION = "logic_first_controls_r1";

test("materializes a controlled candidate refresh with new demand, inbound, and snapshot rows", async () => {
  const approvedDir = await mkdtemp(path.join(os.tmpdir(), "fabric-approved-"));
  const controlsDir = await mkdtemp(path.join(os.tmpdir(), "fabric-controls-"));
  const outputDir = await mkdtemp(path.join(os.tmpdir(), "fabric-controlled-candidate-"));
  const reportPath = path.join(outputDir, "controlled-candidate-refresh-report.json");

  try {
    await buildDimensionsToDirectory({
      outputDir: approvedDir,
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });
    await buildGenerationControlsToDirectory({
      publicationDir: approvedDir,
      outputDir: controlsDir,
      ruleVersion: FIXED_RULE_VERSION,
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });

    const result = await buildControlledCandidatePackageToDirectory({
      approvedDir,
      controlsDir,
      outputDir,
      reportPath,
      loadTimestampUtc: FIXED_GENERATION_TIMESTAMP,
      windowDays: 2,
    });

    assert.equal(result.candidatePackage.dim_product.length, 5);
    assert.equal(result.candidatePackage.dim_product_family.length, 5);
    assert.equal(result.candidatePackage.dim_account.length, 4);
    assert.equal(result.candidatePackage.dim_inventory_location.length, 7);
    assert.equal(result.candidatePackage.fact_demand_line.length, 144);
    assert.equal(result.candidatePackage.fact_inventory_inbound.length, 9);
    assert.equal(result.candidatePackage.fact_inventory_snapshot.length, 21);
    assert.deepEqual(result.candidatePackage.metadata.generated_dates, ["2026-04-02", "2026-04-03"]);

    const newDemandRows = result.candidatePackage.fact_demand_line.filter(
      (row) => row.source_file_version.endsWith("__logic_first_controls_r1"),
    );
    const newInboundRows = result.candidatePackage.fact_inventory_inbound.filter(
      (row) => row.source_file_version.endsWith("__logic_first_controls_r1"),
    );
    const newSnapshotRows = result.candidatePackage.fact_inventory_snapshot.filter(
      (row) => row.source_file_version.endsWith("__logic_first_controls_r1"),
    );

    assert.equal(newDemandRows.length, 10);
    assert.equal(newInboundRows.length, 2);
    assert.equal(newSnapshotRows.length, 14);
    assert.ok(newDemandRows.every((row) => row.event_date >= "2026-04-02"));
    assert.ok(newInboundRows.every((row) => row.receipt_date === "2026-04-03"));
    assert.ok(newSnapshotRows.some((row) => row.snapshot_date === "2026-04-03"));
    assert.ok(newDemandRows.every((row) => row.open_qty === Math.max(row.demand_qty - row.delivered_qty, 0)));

    for (const filename of Object.values(PUBLIC_OUTPUT_FILENAMES)) {
      const fileContents = await readFile(path.join(outputDir, filename), "utf8");
      assert.ok(fileContents.includes("\n"));
    }

    const report = JSON.parse(await readFile(reportPath, "utf8"));
    assert.equal(report.run_type, "controlled_candidate_refresh");
    assert.deepEqual(report.metadata.generated_dates, ["2026-04-02", "2026-04-03"]);
  } finally {
    await rm(approvedDir, { recursive: true, force: true });
    await rm(controlsDir, { recursive: true, force: true });
    await rm(outputDir, { recursive: true, force: true });
  }
});
