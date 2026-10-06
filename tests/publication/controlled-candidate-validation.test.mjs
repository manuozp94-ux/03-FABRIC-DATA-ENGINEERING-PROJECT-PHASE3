import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildDimensionsToDirectory } from "../../platform/fabric/automation/dimension-build-lib.mjs";
import { buildGenerationControlsToDirectory } from "../../platform/fabric/automation/generation-controls-lib.mjs";
import { buildControlledCandidatePackageToDirectory } from "../../platform/fabric/automation/controlled-candidate-refresh-lib.mjs";
import {
  evaluateControlledCandidatePublicationPackage,
  runControlledCandidateRefresh,
} from "../../platform/fabric/automation/run-controlled-candidate-refresh.mjs";
import { validateControlledCandidatePublicationPackage } from "../../platform/fabric/validation/validate-controlled-candidate-refresh.mjs";

const FIXED_BASELINE_TIMESTAMP = "2026-04-01T19:10:00.000Z";
const FIXED_GENERATION_TIMESTAMP = "2026-04-01T20:00:00.000Z";
const FIXED_RULE_VERSION = "logic_first_controls_r1";

test("controlled candidate validation passes and reports generated row counts", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-controlled-validate-"));
  const approvedDir = path.join(tempRoot, "approved", "current");
  const controlsDir = path.join(tempRoot, "candidate", "internal-controls", "current");
  const candidateDir = path.join(tempRoot, "candidate", "current");

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
    await buildControlledCandidatePackageToDirectory({
      approvedDir,
      controlsDir,
      outputDir: candidateDir,
      loadTimestampUtc: FIXED_GENERATION_TIMESTAMP,
      windowDays: 2,
    });

    const report = await validateControlledCandidatePublicationPackage({
      approvedDir,
      candidateDir,
      controlsDir,
    });

    assert.equal(report.errors.length, 0);
    assert.equal(report.generated_row_counts.fact_demand_line, 10);
    assert.equal(report.generated_row_counts.fact_inventory_inbound, 2);
    assert.equal(report.generated_row_counts.fact_inventory_snapshot, 14);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("controlled candidate validation blocks broken generated arithmetic", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-controlled-blocked-"));
  const approvedDir = path.join(tempRoot, "approved", "current");
  const controlsDir = path.join(tempRoot, "candidate", "internal-controls", "current");
  const candidateDir = path.join(tempRoot, "candidate", "current");

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
    await buildControlledCandidatePackageToDirectory({
      approvedDir,
      controlsDir,
      outputDir: candidateDir,
      loadTimestampUtc: FIXED_GENERATION_TIMESTAMP,
      windowDays: 2,
    });

    const demandPath = path.join(candidateDir, "fact_demand_line.json");
    const demandRows = JSON.parse(await readFile(demandPath, "utf8"));
    const generatedRow = demandRows.find((row) =>
      row.source_file_version.endsWith("__logic_first_controls_r1"),
    );
    generatedRow.delivered_qty = generatedRow.demand_qty + 1;
    await writeFile(demandPath, `${JSON.stringify(demandRows, null, 2)}\n`, "utf8");

    const report = await validateControlledCandidatePublicationPackage({
      approvedDir,
      candidateDir,
      controlsDir,
    });

    assert.equal(report.errors.length > 0, true);
    assert.equal(
      report.diagnostics.some((diagnostic) => diagnostic.rule_id === "generation.demand_arithmetic_invalid"),
      true,
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("controlled candidate refresh is reproducible for the same rule version and window", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-controlled-repro-"));
  const approvedDir = path.join(tempRoot, "approved", "current");
  const controlsDir = path.join(tempRoot, "candidate", "internal-controls", "current");
  const firstCandidateDir = path.join(tempRoot, "candidate-a", "current");
  const secondCandidateDir = path.join(tempRoot, "candidate-b", "current");

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

    const first = await buildControlledCandidatePackageToDirectory({
      approvedDir,
      controlsDir,
      outputDir: firstCandidateDir,
      loadTimestampUtc: FIXED_GENERATION_TIMESTAMP,
      windowDays: 2,
    });
    const second = await buildControlledCandidatePackageToDirectory({
      approvedDir,
      controlsDir,
      outputDir: secondCandidateDir,
      loadTimestampUtc: FIXED_GENERATION_TIMESTAMP,
      windowDays: 2,
    });

    assert.deepEqual(first.candidatePackage, second.candidatePackage);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("controlled refresh runner writes a non-promoting candidate report and preserves active baselines", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-controlled-runner-"));
  const approvedDir = path.join(tempRoot, "approved", "current");
  const controlsDir = path.join(tempRoot, "candidate", "internal-controls", "current");
  const candidateDir = path.join(tempRoot, "candidate", "current");
  const reportPath = path.join(tempRoot, "candidate", "candidate-refresh-report.json");
  const buildReportPath = path.join(tempRoot, "candidate", "controlled-candidate-refresh-report.json");
  const publicMirrorDir = path.join(tempRoot, "web", "current");

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
    await mkdir(publicMirrorDir, { recursive: true });
    await writeFile(path.join(approvedDir, "sentinel.json"), "{\"keep\":true}\n", "utf8");
    await writeFile(path.join(publicMirrorDir, "sentinel.json"), "{\"keep\":true}\n", "utf8");

    const report = await runControlledCandidateRefresh(
      [
        "--approved-dir",
        approvedDir,
        "--controls-dir",
        controlsDir,
        "--output",
        candidateDir,
        "--window-days",
        "2",
        "--load-timestamp",
        FIXED_GENERATION_TIMESTAMP,
      ],
      {
        reportPath,
        buildReportPath,
        approvedCurrentDir: approvedDir,
        publicMirrorDir,
        quiet: true,
        setProcessExitCode: false,
      },
    );

    assert.equal(report.promoted, false);
    assert.equal(report.candidate_status, "validated_not_promoted");
    assert.equal(report.validation_passed, true);
    assert.equal(report.generated_row_counts.fact_demand_line, 10);
    assert.equal(report.generated_row_counts.fact_inventory_inbound, 2);
    assert.equal(report.generated_row_counts.fact_inventory_snapshot, 14);

    const persisted = JSON.parse(await readFile(reportPath, "utf8"));
    assert.equal(persisted.candidate_status, "validated_not_promoted");
    assert.equal(persisted.active_baseline.preserved, true);

    const preservedApproved = await readFile(path.join(approvedDir, "sentinel.json"), "utf8");
    const preservedMirror = await readFile(path.join(publicMirrorDir, "sentinel.json"), "utf8");
    assert.equal(preservedApproved, "{\"keep\":true}\n");
    assert.equal(preservedMirror, "{\"keep\":true}\n");

    const reevaluated = await evaluateControlledCandidatePublicationPackage({
      approvedDir,
      candidateDir,
      controlsDir,
      reportPath,
      approvedCurrentDir: approvedDir,
      publicMirrorDir,
      quiet: true,
      setProcessExitCode: false,
      generatedMetadata: report.generated_metadata,
      buildReportPath,
    });
    assert.equal(reevaluated.validation_passed, true);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
