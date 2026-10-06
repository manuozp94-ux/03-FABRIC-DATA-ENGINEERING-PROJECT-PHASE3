import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildDimensionsToDirectory } from "../../platform/fabric/automation/dimension-build-lib.mjs";
import {
  evaluateCandidatePublicationPackage,
  runCandidateRefresh,
} from "../../platform/fabric/automation/run-candidate-refresh.mjs";

const FIXED_TIMESTAMP = "2026-03-29T00:22:41.942Z";

test("candidate validation emits a non-promoting success report", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-candidate-success-"));
  const outputDir = path.join(tempRoot, "candidate", "current");
  const reportPath = path.join(tempRoot, "candidate", "candidate-refresh-report.json");
  const approvedCurrentDir = path.join(tempRoot, "approved", "current");
  const publicMirrorDir = path.join(tempRoot, "web", "current");

  try {
    await buildDimensionsToDirectory({
      outputDir,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });
    await mkdir(approvedCurrentDir, { recursive: true });
    await mkdir(publicMirrorDir, { recursive: true });
    await writeFile(path.join(approvedCurrentDir, "sentinel.json"), "{\"keep\":true}\n", "utf8");
    await writeFile(path.join(publicMirrorDir, "sentinel.json"), "{\"keep\":true}\n", "utf8");

    const report = await evaluateCandidatePublicationPackage({
      outputDir,
      reportPath,
      approvedCurrentDir,
      publicMirrorDir,
      loadTimestampUtc: FIXED_TIMESTAMP,
      quiet: true,
    });

    assert.equal(report.promoted, false);
    assert.equal(report.candidate_status, "validated_not_promoted");
    assert.equal(report.validation_passed, true);
    assert.equal(report.blocking_failure_count, 0);
    assert.deepEqual(report.diagnostics, []);
    assert.deepEqual(report.validation_errors, []);
    assert.equal(report.active_baseline.preserved, true);

    const persisted = JSON.parse(await readFile(reportPath, "utf8"));
    assert.equal(persisted.candidate_status, "validated_not_promoted");
    assert.equal(persisted.promoted, false);
    assert.deepEqual(persisted.diagnostics, []);

    const approvedSentinel = await readFile(
      path.join(approvedCurrentDir, "sentinel.json"),
      "utf8",
    );
    const publicSentinel = await readFile(
      path.join(publicMirrorDir, "sentinel.json"),
      "utf8",
    );
    assert.equal(approvedSentinel, "{\"keep\":true}\n");
    assert.equal(publicSentinel, "{\"keep\":true}\n");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("candidate validation blocks invalid outputs and preserves approved baselines", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-candidate-failure-"));
  const outputDir = path.join(tempRoot, "candidate", "current");
  const reportPath = path.join(tempRoot, "candidate", "candidate-refresh-report.json");
  const approvedCurrentDir = path.join(tempRoot, "approved", "current");
  const publicMirrorDir = path.join(tempRoot, "web", "current");

  try {
    await buildDimensionsToDirectory({
      outputDir,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });
    await mkdir(approvedCurrentDir, { recursive: true });
    await mkdir(publicMirrorDir, { recursive: true });
    await writeFile(path.join(approvedCurrentDir, "sentinel.json"), "{\"keep\":true}\n", "utf8");
    await writeFile(path.join(publicMirrorDir, "sentinel.json"), "{\"keep\":true}\n", "utf8");

    const dimProductPath = path.join(outputDir, "dim_product.json");
    const dimProducts = JSON.parse(await readFile(dimProductPath, "utf8"));
    dimProducts[0].product_code = "";
    await writeFile(dimProductPath, `${JSON.stringify(dimProducts, null, 2)}\n`, "utf8");

    const report = await evaluateCandidatePublicationPackage({
      outputDir,
      reportPath,
      approvedCurrentDir,
      publicMirrorDir,
      loadTimestampUtc: FIXED_TIMESTAMP,
      quiet: true,
    });

    assert.equal(report.promoted, false);
    assert.equal(report.candidate_status, "blocked");
    assert.equal(report.validation_passed, false);
    assert.ok(report.blocking_failure_count > 0);
    assert.equal(report.diagnostics[0].rule_id, "required_field.missing");
    assert.equal(report.diagnostics[0].artifact, "dim_product[0]");
    assert.match(report.blocking_reason_summary, /\[required_field\.missing\]/);

    const persisted = JSON.parse(await readFile(reportPath, "utf8"));
    assert.equal(persisted.candidate_status, "blocked");
    assert.equal(persisted.active_baseline.preserved, true);
    assert.equal(persisted.diagnostics[0].rule_id, "required_field.missing");

    const approvedSentinel = await readFile(
      path.join(approvedCurrentDir, "sentinel.json"),
      "utf8",
    );
    const publicSentinel = await readFile(
      path.join(publicMirrorDir, "sentinel.json"),
      "utf8",
    );
    assert.equal(approvedSentinel, "{\"keep\":true}\n");
    assert.equal(publicSentinel, "{\"keep\":true}\n");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("candidate build failures still write a blocked report and do not leave stale success state", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-candidate-build-failure-"));
  const missingSourceDir = path.join(tempRoot, "missing-source");
  const outputDir = path.join(tempRoot, "candidate", "current");
  const reportPath = path.join(tempRoot, "candidate", "candidate-refresh-report.json");
  const approvedCurrentDir = path.join(tempRoot, "approved", "current");
  const publicMirrorDir = path.join(tempRoot, "web", "current");

  try {
    await mkdir(approvedCurrentDir, { recursive: true });
    await mkdir(publicMirrorDir, { recursive: true });
    await writeFile(path.join(approvedCurrentDir, "sentinel.json"), "{\"keep\":true}\n", "utf8");
    await writeFile(path.join(publicMirrorDir, "sentinel.json"), "{\"keep\":true}\n", "utf8");

    const report = await runCandidateRefresh(
      ["--input", missingSourceDir, "--output", outputDir, "--load-timestamp", FIXED_TIMESTAMP],
      {
        reportPath,
        approvedCurrentDir,
        publicMirrorDir,
        quiet: true,
        setProcessExitCode: false,
      },
    );

    assert.equal(report.promoted, false);
    assert.equal(report.candidate_status, "blocked");
    assert.equal(report.validation_passed, false);
    assert.equal(report.blocking_failure_count, 1);
    assert.equal(report.diagnostics[0].rule_id, "artifact.candidate_build_failed");
    assert.equal(report.diagnostics[0].artifact, "candidate_build");
    assert.match(report.blocking_reason_summary, /\[artifact\.candidate_build_failed\]/);

    const persisted = JSON.parse(await readFile(reportPath, "utf8"));
    assert.equal(persisted.candidate_status, "blocked");
    assert.equal(persisted.validation_passed, false);
    assert.equal(persisted.diagnostics[0].rule_id, "artifact.candidate_build_failed");

    const approvedSentinel = await readFile(
      path.join(approvedCurrentDir, "sentinel.json"),
      "utf8",
    );
    const publicSentinel = await readFile(
      path.join(publicMirrorDir, "sentinel.json"),
      "utf8",
    );
    assert.equal(approvedSentinel, "{\"keep\":true}\n");
    assert.equal(publicSentinel, "{\"keep\":true}\n");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
