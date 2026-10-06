import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildDimensionsToDirectory } from "../../platform/fabric/automation/dimension-build-lib.mjs";
import { buildGenerationControlsToDirectory } from "../../platform/fabric/automation/generation-controls-lib.mjs";
import { promoteRepresentativePackageToCurrent } from "../../platform/fabric/automation/promote-representative-package-to-current.mjs";
import { buildRepresentativeMarketToDirectory } from "../../platform/fabric/automation/representative-market-lib.mjs";
import { writeRepresentativeCoherenceReport } from "../../platform/fabric/validation/validate-representative-coherence.mjs";
import { runFab001StabilizedProofRefresh } from "../../platform/fabric/automation/run-fab001-stabilized-proof-refresh.mjs";

const FIXED_BASELINE_TIMESTAMP = "2026-04-01T19:10:00.000Z";
const FIXED_GENERATION_TIMESTAMP = "2026-04-01T21:45:00.000Z";

test("builds the Fabric medallion bundle from the coherence-approved representative package before any live refresh", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-stabilized-refresh-"));
  const currentDir = path.join(tempRoot, "publication", "current");
  const seedDir = path.join(tempRoot, "publication", "seed");
  const mirrorDir = path.join(tempRoot, "web", "current");
  const seedControlsDir = path.join(tempRoot, "seed", "internal-controls", "current");
  const representativeDir = path.join(tempRoot, "representative", "current");
  const representativeInternalDir = path.join(tempRoot, "representative", "internal-controls", "current");
  const marketReportPath = path.join(tempRoot, "representative", "representative-market-report.json");
  const coherenceReportPath = path.join(tempRoot, "representative", "representative-coherence-report.json");
  const promotionReportPath = path.join(tempRoot, "publication", "current-promotion-report.json");
  const proofOutputDir = path.join(tempRoot, "proof", "current");
  const semanticOutputDir = path.join(tempRoot, "proof", "semantic");
  const reportShellOutputDir = path.join(tempRoot, "proof", "report");
  const reportPath = path.join(tempRoot, "proof", "stabilized-refresh-report.json");

  try {
    await buildDimensionsToDirectory({
      outputDir: currentDir,
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });
    await buildGenerationControlsToDirectory({
      publicationDir: currentDir,
      outputDir: seedControlsDir,
      ruleVersion: "logic_first_controls_r1",
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });
    await buildRepresentativeMarketToDirectory({
      seedDir: currentDir,
      seedControlsDir,
      outputDir: representativeDir,
      internalDir: representativeInternalDir,
      reportPath: marketReportPath,
      loadTimestampUtc: FIXED_GENERATION_TIMESTAMP,
    });
    await writeRepresentativeCoherenceReport({
      outputDir: representativeDir,
      internalDir: representativeInternalDir,
      marketReportPath,
      reportPath: coherenceReportPath,
    });
    await promoteRepresentativePackageToCurrent({
      representativeDir,
      coherenceReportPath,
      currentDir,
      seedDir,
      mirrorDir,
      reportPath: promotionReportPath,
      unsafeAllowExternalRepresentative: true,
      unsafeAllowExternalCurrent: true,
      unsafeAllowExternalSeed: true,
      unsafeAllowExternalMirror: true,
      unsafeAllowExternalReport: true,
    });

    const refreshReport = await runFab001StabilizedProofRefresh({
      publicationDir: currentDir,
      coherenceReportPath,
      proofOutputDir,
      semanticOutputDir,
      reportShellOutputDir,
      reportPath,
      skipLive: true,
    });

    assert.equal(refreshReport.refresh_status, "preflight_ready");
    assert.equal(refreshReport.manifest.bronze_tables.dim_account.rows, 96);
    assert.equal(refreshReport.manifest.bronze_tables.dim_product.rows, 140);
    assert.equal(refreshReport.manifest.bronze_tables.fact_demand_line.rows > 10000, true);
    assert.equal(refreshReport.manifest.bronze_tables.fact_inventory_snapshot.rows > 30000, true);
    assert.equal(refreshReport.semantic_model_report, null);
    assert.equal(refreshReport.report_shell_report, null);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
