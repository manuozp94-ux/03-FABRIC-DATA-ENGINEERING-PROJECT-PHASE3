import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const REPO_ROOT = "/Users/manuel.orozco/Desktop/CODEX PROJECTS/03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3";

test("writes a preview Fabric runtime pipeline definition and bounded runtime-governance payloads", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-runtime-governance-"));
  const outputDir = path.join(tempRoot, "runtime-governance");
  const pipelineReportPath = path.join(outputDir, "runtime-pipeline-report.json");

  try {
    await execFileAsync("python3", [
      "05-compat/scripts/materialize_fab001_runtime_pipeline.py",
      "--preview-only",
      "--output-dir",
      outputDir,
      "--pipeline-report-path",
      pipelineReportPath,
      "--workspace-id",
      "ws-preview",
      "--loader-notebook-id",
      "nb-preview",
    ], {
      cwd: REPO_ROOT,
    });

    const definition = JSON.parse(
      await readFile(path.join(outputDir, "pipeline-definition.json"), "utf8"),
    );
    assert.equal(definition.properties.activities.length, 1);
    assert.equal(definition.properties.activities[0].type, "TridentNotebook");
    assert.equal(
      definition.properties.activities[0].typeProperties.notebookId,
      "nb-preview",
    );
    assert.equal(
      definition.properties.activities[0].typeProperties.workspaceId,
      "ws-preview",
    );

    const releaseRegistryCsv = await readFile(
      path.join(outputDir, "current", "ctrl_release_registry.csv"),
      "utf8",
    );
    assert.match(releaseRegistryCsv, /release_id,release_state,release_record_path,publication_dir,pipeline_item_id,pipeline_name,pipeline_run_id,pipeline_run_status,notebook_item_id,notebook_name,notebook_run_status,public_source_mode,serving_extract_status,recorded_at_utc/);
    assert.match(releaseRegistryCsv, /runtime_active/);
    assert.match(
      releaseRegistryCsv,
      /(repo_mirror_transitional|fabric_serving_extract)/,
    );
    assert.match(
      releaseRegistryCsv,
      /(not_materialized|produced_from_reference_gold)/,
    );

    const runtimeHistoryCsv = await readFile(
      path.join(outputDir, "current", "ctrl_runtime_job_history.csv"),
      "utf8",
    );
    assert.match(runtimeHistoryCsv, /execution_type,job_id,parent_job_id,item_id,item_name,status,started_at_utc,ended_at_utc,failure_reason,recorded_at_utc/);
    assert.match(runtimeHistoryCsv, /pipeline/);
    assert.match(runtimeHistoryCsv, /notebook_activity/);

    const assetHistoryCsv = await readFile(
      path.join(outputDir, "current", "ctrl_asset_refresh_history.csv"),
      "utf8",
    );
    assert.match(assetHistoryCsv, /asset_type,asset_name,asset_id,status,refresh_record_path,related_release_id,public_source_mode,recorded_at_utc/);
    assert.match(assetHistoryCsv, /semantic_model/);
    assert.match(assetHistoryCsv, /report_shell/);
    assert.match(assetHistoryCsv, /public_serving_extract/);

    const pipelineReport = JSON.parse(await readFile(pipelineReportPath, "utf8"));
    assert.equal(pipelineReport.report_type, "fab001_runtime_pipeline");
    assert.equal(pipelineReport.mode, "preview_only");
    assert.match(
      pipelineReport.public_serving_extract.status,
      /^(not_materialized|produced_from_reference_gold)$/,
    );
    assert.match(
      pipelineReport.public_serving_extract.active_public_source_mode,
      /^(repo_mirror_transitional|fabric_serving_extract)$/,
    );
    assert.equal(pipelineReport.runtime_sequence.length, 6);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("writes runtime governance rows that recognize a produced public serving extract", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-runtime-serving-extract-"));
  const outputDir = path.join(tempRoot, "runtime-governance");
  const pipelineReportPath = path.join(outputDir, "runtime-pipeline-report.json");
  const extractReportPath = path.join(tempRoot, "public-serving-extract-report.json");

  try {
    await writeFile(
      extractReportPath,
      `${JSON.stringify({
        report_type: "fab001_public_serving_extract_materialization",
        recorded_at_utc: "2026-04-03T16:00:00.000Z",
        status: "produced_from_reference_gold",
        produced: true,
        active_public_source_mode: "fabric_serving_extract",
        target_public_source_mode: "fabric_serving_extract",
        active_reference: "apps/public-site/src/data/public-serving/current",
        note: "The public site now consumes a bounded Fabric-derived serving extract mirrored into the site repo.",
        materialization_report_path:
          "_bmad-output/test-artifacts/fabric-public-serving-extract/materialization-report.json",
      }, null, 2)}\n`,
      "utf8",
    );

    await execFileAsync("python3", [
      "05-compat/scripts/materialize_fab001_runtime_pipeline.py",
      "--preview-only",
      "--output-dir",
      outputDir,
      "--pipeline-report-path",
      pipelineReportPath,
      "--public-serving-extract-report-path",
      extractReportPath,
      "--workspace-id",
      "ws-preview",
      "--loader-notebook-id",
      "nb-preview",
    ], {
      cwd: REPO_ROOT,
    });

    const releaseRegistryCsv = await readFile(
      path.join(outputDir, "current", "ctrl_release_registry.csv"),
      "utf8",
    );
    assert.match(releaseRegistryCsv, /fabric_serving_extract/);
    assert.match(releaseRegistryCsv, /produced_from_reference_gold/);

    const assetHistoryCsv = await readFile(
      path.join(outputDir, "current", "ctrl_asset_refresh_history.csv"),
      "utf8",
    );
    assert.match(assetHistoryCsv, /public_serving_extract,fab001_public_serving_extract,,produced_from_reference_gold/);

    const pipelineReport = JSON.parse(await readFile(pipelineReportPath, "utf8"));
    assert.equal(pipelineReport.public_serving_extract.status, "produced_from_reference_gold");
    assert.equal(pipelineReport.public_serving_extract.active_public_source_mode, "fabric_serving_extract");
    assert.match(pipelineReport.public_serving_extract.note, /consumes a bounded Fabric-derived serving extract/i);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
