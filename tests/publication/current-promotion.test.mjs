import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildDimensionsToDirectory, readJsonFile, writeJsonFile } from "../../platform/fabric/automation/dimension-build-lib.mjs";
import { buildGenerationControlsToDirectory } from "../../platform/fabric/automation/generation-controls-lib.mjs";
import {
  promoteRepresentativePackageToCurrent,
} from "../../platform/fabric/automation/promote-representative-package-to-current.mjs";
import { buildRepresentativeMarketToDirectory } from "../../platform/fabric/automation/representative-market-lib.mjs";
import {
  ALLOWED_ARTIFACT_FILENAMES,
  syncCurrentPackageToPublicSite,
} from "../../platform/fabric/automation/sync-current-package-to-public-site.mjs";
import { writeRepresentativeCoherenceReport } from "../../platform/fabric/validation/validate-representative-coherence.mjs";

const FIXED_BASELINE_TIMESTAMP = "2026-04-01T19:10:00.000Z";
const FIXED_GENERATION_TIMESTAMP = "2026-04-01T21:45:00.000Z";

test("promotes the coherence-approved representative package to canonical current, bootstraps seed, and aligns the mirror", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-current-promotion-"));
  const currentDir = path.join(tempRoot, "publication", "current");
  const seedDir = path.join(tempRoot, "publication", "seed");
  const mirrorDir = path.join(tempRoot, "web", "current");
  const seedControlsDir = path.join(tempRoot, "seed", "internal-controls", "current");
  const representativeDir = path.join(tempRoot, "representative", "current");
  const representativeInternalDir = path.join(tempRoot, "representative", "internal-controls", "current");
  const marketReportPath = path.join(tempRoot, "representative", "representative-market-report.json");
  const coherenceReportPath = path.join(tempRoot, "representative", "representative-coherence-report.json");
  const promotionReportPath = path.join(tempRoot, "publication", "current-promotion-report.json");

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

    const report = await promoteRepresentativePackageToCurrent({
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

    assert.equal(report.promotion_status, "promoted_to_current");
    assert.equal(report.seed_bootstrapped, true);

    const currentAccounts = await readJsonFile(path.join(currentDir, "dim_account.json"));
    const seedAccounts = await readJsonFile(path.join(seedDir, "dim_account.json"));
    const mirrorProducts = await readJsonFile(path.join(mirrorDir, "dim_product.json"));

    assert.equal(currentAccounts.length, 96);
    assert.equal(seedAccounts.length, 4);
    assert.equal(mirrorProducts.length, 140);

    const currentDemand = await readFile(path.join(currentDir, "fact_demand_line.json"), "utf8");
    const mirrorDemand = await readFile(path.join(mirrorDir, "fact_demand_line.json"), "utf8");
    assert.equal(mirrorDemand, currentDemand);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("fails closed when the representative coherence report is not promotable and preserves current plus mirror", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-current-promotion-blocked-"));
  const currentDir = path.join(tempRoot, "publication", "current");
  const seedDir = path.join(tempRoot, "publication", "seed");
  const mirrorDir = path.join(tempRoot, "web", "current");
  const representativeDir = path.join(tempRoot, "representative", "current");
  const coherenceReportPath = path.join(tempRoot, "representative", "representative-coherence-report.json");
  const promotionReportPath = path.join(tempRoot, "publication", "current-promotion-report.json");

  try {
    await buildDimensionsToDirectory({
      outputDir: currentDir,
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });
    await mkdir(mirrorDir, { recursive: true });
    await writeFile(path.join(mirrorDir, "sentinel.json"), "{\"keep\":true}\n", "utf8");
    await mkdir(representativeDir, { recursive: true });
    await writeJsonFile(coherenceReportPath, {
      promotable: false,
      promotion_status: "blocked",
      outputDir: representativeDir,
      counts: {},
      identity: {},
    });

    const report = await promoteRepresentativePackageToCurrent({
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

    assert.equal(report.promotion_status, "blocked");

    const currentAccounts = await readJsonFile(path.join(currentDir, "dim_account.json"));
    assert.equal(currentAccounts.length, 4);

    const mirrorFiles = await readdir(mirrorDir);
    assert.deepEqual(mirrorFiles, ["sentinel.json"]);
    await assert.rejects(readFile(path.join(seedDir, "dim_account.json"), "utf8"), { code: "ENOENT" });
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("syncs the canonical current package to the mirror using the promotion receipt instead of legacy source row counts", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-current-sync-promoted-"));
  const currentDir = path.join(tempRoot, "publication", "current");
  const seedDir = path.join(tempRoot, "publication", "seed");
  const mirrorDir = path.join(tempRoot, "web", "current");
  const seedControlsDir = path.join(tempRoot, "seed", "internal-controls", "current");
  const representativeDir = path.join(tempRoot, "representative", "current");
  const representativeInternalDir = path.join(tempRoot, "representative", "internal-controls", "current");
  const marketReportPath = path.join(tempRoot, "representative", "representative-market-report.json");
  const coherenceReportPath = path.join(tempRoot, "representative", "representative-coherence-report.json");
  const promotionReportPath = path.join(tempRoot, "publication", "current-promotion-report.json");

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

    await writeFile(path.join(mirrorDir, "stale.json"), "{\"old\":true}\n", "utf8");

    const result = await syncCurrentPackageToPublicSite({
      sourcePackageDir: currentDir,
      destinationDir: mirrorDir,
      currentPromotionReportPath: promotionReportPath,
      unsafeAllowExternalSource: true,
      unsafeAllowExternalDestination: true,
    });

    assert.deepEqual(result.syncedArtifacts, ALLOWED_ARTIFACT_FILENAMES);
    const destinationFiles = (await readdir(mirrorDir)).sort();
    assert.deepEqual(destinationFiles, ALLOWED_ARTIFACT_FILENAMES);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
