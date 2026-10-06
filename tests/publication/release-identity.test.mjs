import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildDimensionsToDirectory } from "../../platform/fabric/automation/dimension-build-lib.mjs";
import { buildGenerationControlsToDirectory } from "../../platform/fabric/automation/generation-controls-lib.mjs";
import { buildRepresentativeMarketToDirectory } from "../../platform/fabric/automation/representative-market-lib.mjs";
import { writeRepresentativeCoherenceReport } from "../../platform/fabric/validation/validate-representative-coherence.mjs";
import { runFab001StabilizedProofRefresh } from "../../platform/fabric/automation/run-fab001-stabilized-proof-refresh.mjs";
import { materializeReleaseIdentityRecord } from "../../platform/fabric/automation/materialize-release-identity-record.mjs";

const FIXED_BASELINE_TIMESTAMP = "2026-04-01T19:10:00.000Z";
const FIXED_GENERATION_TIMESTAMP = "2026-04-01T21:45:00.000Z";
const FIXED_RECORDED_AT = "2026-04-02T00:00:00.000Z";
const FIXED_RELEASE_ID = "rls_fab001_20260401t221500z";

test("records a machine-readable release identity ledger from a published proof refresh", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-release-identity-"));
  const seedDir = path.join(tempRoot, "seed", "current");
  const seedControlsDir = path.join(tempRoot, "seed", "internal-controls", "current");
  const representativeDir = path.join(tempRoot, "representative", "current");
  const representativeInternalDir = path.join(tempRoot, "representative", "internal-controls", "current");
  const marketReportPath = path.join(tempRoot, "representative", "representative-market-report.json");
  const coherenceReportPath = path.join(tempRoot, "representative", "representative-coherence-report.json");
  const proofOutputDir = path.join(tempRoot, "proof", "current");
  const semanticOutputDir = path.join(tempRoot, "proof", "semantic");
  const reportShellOutputDir = path.join(tempRoot, "proof", "report");
  const proofRefreshReportPath = path.join(tempRoot, "proof", "stabilized-refresh-report.json");
  const runtimeGovernanceDir = path.join(tempRoot, "proof", "runtime-governance");
  const runtimeControlDir = path.join(runtimeGovernanceDir, "current");
  const runtimePipelineReportPath = path.join(runtimeGovernanceDir, "runtime-pipeline-report.json");
  const runtimeGovernanceReportPath = path.join(runtimeGovernanceDir, "runtime-governance-report.json");
  const releaseLedgerDir = path.join(tempRoot, "release-ledger");

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
    await runFab001StabilizedProofRefresh({
      publicationDir: representativeDir,
      coherenceReportPath,
      proofOutputDir,
      semanticOutputDir,
      reportShellOutputDir,
      reportPath: proofRefreshReportPath,
      skipLive: true,
    });
    const preflightReport = JSON.parse(
      await readFile(proofRefreshReportPath, "utf8"),
    );
    preflightReport.refresh_status = "live_refresh_completed";
    preflightReport.live_steps_executed = true;
    preflightReport.completed_at_utc = FIXED_RECORDED_AT;
    await writeFile(
      proofRefreshReportPath,
      `${JSON.stringify(preflightReport, null, 2)}\n`,
      "utf8",
    );
    await writeRuntimeEvidence({
      runtimeControlDir,
      runtimePipelineReportPath,
      runtimeGovernanceReportPath,
      releaseId: FIXED_RELEASE_ID,
      recordedAtUtc: FIXED_RECORDED_AT,
    });

    const result = await materializeReleaseIdentityRecord({
      coherenceReportPath,
      proofRefreshReportPath,
      runtimePipelineReportPath,
      runtimeGovernanceReportPath,
      outputDir: releaseLedgerDir,
      releaseId: FIXED_RELEASE_ID,
      recordedAtUtc: FIXED_RECORDED_AT,
      sourceControlState: {
        vcs: "git",
        repository_detected: true,
        head_commit_available: false,
        head_commit_sha: null,
        branch_name: null,
        head_resolution: "unborn_or_missing",
        working_tree_summary: {
          tracked_change_count: 0,
          untracked_file_count: 2,
          tracked_change_samples: [],
          untracked_file_samples: ["docs/example.md", "platform/example.mjs"],
          porcelain_clean: false,
        },
        notes: ["Synthetic source-control state for test coverage."],
      },
    });

    assert.equal(result.release_record.release_state, "published_approved");
    assert.equal(result.release_record.release_id, FIXED_RELEASE_ID);
    assert.equal(
      result.release_record.validation_state.coherence_promotion_status,
      "coherence_approved",
    );
    assert.equal(
      result.release_record.public_proof_assets.proof_manifest_reference.endsWith("manifest.json"),
      true,
    );
    assert.equal(
      result.release_record.public_proof_assets.approved_publication_boundary_reference,
      "docs/automation/public-evidence-boundary-policy.md",
    );
    assert.equal(result.release_record.source_control_state.head_commit_available, false);
    assert.equal(
      result.release_record.runtime_execution_state.runtime_execution_mode,
      "pipeline_then_direct_notebook_fallback",
    );
    assert.equal(
      result.release_record.public_proof_assets.active_public_source_mode,
      "repo_mirror_transitional",
    );
    assert.equal(
      result.release_record.runtime_execution_state.public_source_state.serving_extract_status,
      "not_materialized",
    );
    assert.equal(
      result.release_record.recovery_inputs.active_public_source_mode,
      "repo_mirror_transitional",
    );
    assert.equal(
      result.release_record.recovery_inputs.serving_extract_status,
      "not_materialized",
    );
    assert.equal(
      result.release_record.validation_state.runtime_reconciliation_status,
      "aligned",
    );
    assert.equal(
      result.release_record.recovery_inputs.fabric_pipeline_run_id,
      "pipeline-run-id",
    );
    assert.equal(
      result.runtime_reconciliation_path.endsWith("release-runtime-reconciliation.json"),
      true,
    );

    const index = await import("node:fs/promises").then(({ readFile }) =>
      readFile(path.join(releaseLedgerDir, "release-index.json"), "utf8"));
    const parsedIndex = JSON.parse(index);
    assert.equal(parsedIndex.current_release_id, result.release_record.release_id);
    assert.equal(parsedIndex.last_known_good_release_id, result.release_record.release_id);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("blocks release identity materialization when the proof refresh has not been published live", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-release-identity-blocked-"));
  const coherenceReportPath = path.join(tempRoot, "representative-coherence-report.json");
  const proofRefreshReportPath = path.join(tempRoot, "stabilized-refresh-report.json");

  try {
    await writeFile(
      coherenceReportPath,
      `${JSON.stringify({ promotable: true, promotion_status: "coherence_approved" }, null, 2)}\n`,
      "utf8",
    );
    await writeFile(
      proofRefreshReportPath,
      `${JSON.stringify({ refresh_status: "preflight_ready" }, null, 2)}\n`,
      "utf8",
    );

    await assert.rejects(
      () =>
        materializeReleaseIdentityRecord({
          coherenceReportPath,
          proofRefreshReportPath,
          outputDir: path.join(tempRoot, "release-ledger"),
          recordedAtUtc: FIXED_RECORDED_AT,
          sourceControlState: {
            vcs: "git",
            repository_detected: true,
            head_commit_available: true,
            head_commit_sha: "abc123",
            branch_name: "main",
            head_resolution: "resolved",
            working_tree_summary: {
              tracked_change_count: 0,
              untracked_file_count: 0,
              tracked_change_samples: [],
              untracked_file_samples: [],
              porcelain_clean: true,
            },
            notes: [],
          },
        }),
      /requires a live published proof refresh/i,
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("blocks runtime-aware release identity materialization when Fabric control pointers do not align", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-release-runtime-mismatch-"));
  const coherenceReportPath = path.join(tempRoot, "representative-coherence-report.json");
  const proofRefreshReportPath = path.join(tempRoot, "stabilized-refresh-report.json");
  const runtimeGovernanceDir = path.join(tempRoot, "runtime-governance");
  const runtimeControlDir = path.join(runtimeGovernanceDir, "current");
  const runtimePipelineReportPath = path.join(runtimeGovernanceDir, "runtime-pipeline-report.json");
  const runtimeGovernanceReportPath = path.join(runtimeGovernanceDir, "runtime-governance-report.json");

  try {
    await writeFile(
      coherenceReportPath,
      `${JSON.stringify({ promotable: true, promotion_status: "coherence_approved" }, null, 2)}\n`,
      "utf8",
    );
    await writeFile(
      proofRefreshReportPath,
      `${JSON.stringify({
        refresh_status: "live_refresh_completed",
        completed_at_utc: FIXED_RECORDED_AT,
        manifest: { approved_refresh_timestamp_utc: "2026-04-01T22:15:00.000Z" },
      }, null, 2)}\n`,
      "utf8",
    );
    await writeRuntimeEvidence({
      runtimeControlDir,
      runtimePipelineReportPath,
      runtimeGovernanceReportPath,
      releaseId: "rls_fab001_old_release",
      recordedAtUtc: FIXED_RECORDED_AT,
    });

    await assert.rejects(
      () =>
        materializeReleaseIdentityRecord({
          coherenceReportPath,
          proofRefreshReportPath,
          runtimePipelineReportPath,
          runtimeGovernanceReportPath,
          outputDir: path.join(tempRoot, "release-ledger"),
          recordedAtUtc: FIXED_RECORDED_AT,
          sourceControlState: {
            vcs: "git",
            repository_detected: true,
            head_commit_available: true,
            head_commit_sha: "abc123",
            branch_name: "main",
            head_resolution: "resolved",
            working_tree_summary: {
              tracked_change_count: 0,
              untracked_file_count: 0,
              tracked_change_samples: [],
              untracked_file_samples: [],
              porcelain_clean: true,
            },
            notes: [],
          },
        }),
      /Runtime release alignment failed/i,
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

async function writeRuntimeEvidence({
  runtimeControlDir,
  runtimePipelineReportPath,
  runtimeGovernanceReportPath,
  releaseId,
  recordedAtUtc,
}) {
  const { mkdir } = await import("node:fs/promises");
  await mkdir(runtimeControlDir, { recursive: true });

  await writeFile(
    runtimePipelineReportPath,
    `${JSON.stringify({
      report_type: "fab001_runtime_pipeline",
      recorded_at_utc: recordedAtUtc,
      pipeline: {
        id: "pipeline-id",
        displayName: "pl_fab001_runtime_orchestration",
      },
      loader_notebook: {
        id: "loader-notebook-id",
        displayName: "nb_fab001_lakehouse_loader",
      },
      pipeline_job: {
        id: "pipeline-run-id",
        status: "Failed",
        startTimeUtc: recordedAtUtc,
        endTimeUtc: recordedAtUtc,
        failureReason: { message: "Pipeline activity required notebook fallback." },
      },
      pipeline_activity_runs: [
        {
          activityName: "RunFabricProofNotebook",
          activityRunId: "activity-run-id",
          itemId: "loader-notebook-id",
          status: "Failed",
        },
      ],
      loader_notebook_job: {
        id: "direct-loader-job-id",
        status: "Completed",
        startTimeUtc: recordedAtUtc,
        endTimeUtc: recordedAtUtc,
        failureReason: null,
      },
      pipeline_status: "Failed",
      runtime_execution_mode: "pipeline_then_direct_notebook_fallback",
      public_serving_extract: {
        status: "not_materialized",
        produced: false,
        active_public_source_mode: "repo_mirror_transitional",
        target_public_source_mode: "fabric_serving_extract",
        artifact_path: "",
      },
    }, null, 2)}\n`,
    "utf8",
  );

  await writeFile(
    path.join(runtimeControlDir, "ctrl_release_registry.csv"),
    [
      "release_id,release_state,release_record_path,publication_dir,pipeline_item_id,pipeline_name,pipeline_run_id,pipeline_run_status,notebook_item_id,notebook_name,notebook_run_status,public_source_mode,serving_extract_status,recorded_at_utc",
      `${releaseId},runtime_needs_attention,_bmad-output/test-artifacts/release-ledger/releases/${releaseId}.json,platform/fabric/publication/current,pipeline-id,pl_fab001_runtime_orchestration,pipeline-run-id,Failed,loader-notebook-id,RunFabricProofNotebook,Failed,repo_mirror_transitional,not_materialized,${recordedAtUtc}`,
      "",
    ].join("\n"),
    "utf8",
  );
  await writeFile(
    path.join(runtimeControlDir, "ctrl_last_known_good.csv"),
    [
      "active_release_id,last_known_good_release_id,active_pipeline_run_id,active_pipeline_status,public_source_mode,updated_at_utc,recovery_note",
      `${releaseId},${releaseId},pipeline-run-id,Failed,repo_mirror_transitional,${recordedAtUtc},Repo-side approval remains authoritative.`,
      "",
    ].join("\n"),
    "utf8",
  );
  await writeFile(
    path.join(runtimeControlDir, "ctrl_runtime_job_history.csv"),
    [
      "execution_type,job_id,parent_job_id,item_id,item_name,status,started_at_utc,ended_at_utc,failure_reason,recorded_at_utc",
      `pipeline,pipeline-run-id,,pipeline-id,pl_fab001_runtime_orchestration,Failed,${recordedAtUtc},${recordedAtUtc},Pipeline activity required notebook fallback.,${recordedAtUtc}`,
      `direct_notebook_execute,direct-loader-job-id,pipeline-run-id,loader-notebook-id,nb_fab001_lakehouse_loader,Completed,${recordedAtUtc},${recordedAtUtc},,${recordedAtUtc}`,
      "",
    ].join("\n"),
    "utf8",
  );
  await writeFile(
    path.join(runtimeControlDir, "ctrl_asset_refresh_history.csv"),
    [
      "asset_type,asset_name,asset_id,status,refresh_record_path,related_release_id,public_source_mode,recorded_at_utc",
      `semantic_model,sm_fab001_supply_chain_decision,semantic-id,Succeeded,_bmad-output/test-artifacts/fabric-proof/fab001/semantic-model-live/materialization-report.json,${releaseId},repo_mirror_transitional,${recordedAtUtc}`,
      `report_shell,rpt_fab001_supply_chain_decision,report-id,Succeeded,_bmad-output/test-artifacts/fabric-proof/fab001/report-live/report-shell-report.json,${releaseId},repo_mirror_transitional,${recordedAtUtc}`,
      `public_serving_extract,fab001_public_serving_extract,,not_materialized,,${releaseId},repo_mirror_transitional,${recordedAtUtc}`,
      "",
    ].join("\n"),
    "utf8",
  );

  await writeFile(
    runtimeGovernanceReportPath,
    `${JSON.stringify({
      report_type: "fab001_runtime_governance",
      recorded_at_utc: recordedAtUtc,
      pipeline_report_path: runtimePipelineReportPath,
      runtime_governance_root: "Files/fab001/current/runtime-governance/current",
      tables: [
        "ctrl_asset_refresh_history",
        "ctrl_last_known_good",
        "ctrl_release_registry",
        "ctrl_runtime_job_history",
      ],
      governance_result: {
        governance_notebook: {
          id: "governance-notebook-id",
          displayName: "nb_fab001_runtime_governance",
        },
        notebook_job: {
          id: "governance-job-id",
          status: "Completed",
        },
        visible_runtime_tables: [
          "ctrl_asset_refresh_history",
          "ctrl_last_known_good",
          "ctrl_release_registry",
          "ctrl_runtime_job_history",
        ],
      },
    }, null, 2)}\n`,
    "utf8",
  );
}
