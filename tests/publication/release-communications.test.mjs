import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { materializeReleaseCommunications } from "../../platform/fabric/automation/materialize-release-communications.mjs";

const FIXED_RELEASE_ID = "rls_fab001_20260401t221500z";
const FIXED_RECORDED_AT = "2026-04-02T20:30:00.000Z";
const FIXED_RELEASE_RECORDED_AT = "2026-04-02T20:00:01.549Z";
const FIXED_REFRESH_AT = "2026-04-02T19:57:29.000Z";
const FIXED_APPROVED_INPUT_AT = "2026-04-01T22:15:00.000Z";
const FIXED_LIVE_RUNTIME_REFRESH_AT = "2026-04-04T07:12:25.317Z";

test("materializes governed change summaries and operational status from the current release ledger", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-release-comms-"));
  const releaseLedgerDir = path.join(tempRoot, "release-ledger");
  const releasesDir = path.join(releaseLedgerDir, "releases");
  const siteDataDir = path.join(tempRoot, "site-data");
  const releaseRecordPath = path.join(releasesDir, `${FIXED_RELEASE_ID}.json`);

  try {
    await seedReleaseLedger({
      releaseLedgerDir,
      releaseRecordPath,
      releaseRecord: buildReleaseRecord(),
    });

    const result = await materializeReleaseCommunications({
      releaseLedgerDir,
      siteDataDir,
      recordedAtUtc: FIXED_RECORDED_AT,
    });

    assert.equal(result.change_summary.release_id, FIXED_RELEASE_ID);
    assert.equal(result.change_summary.summary_scope, "baseline");
    assert.equal(result.operational_status.overall_status, "healthy_published");
    assert.equal(
      result.operational_status.last_successful_refresh_utc,
      FIXED_REFRESH_AT,
    );
    assert.equal(
      result.operational_status.refresh_evidence.active_source,
      "release_proof_refresh",
    );
    assert.equal(
      result.operational_status.public_source.active_mode,
      "repo_mirror_transitional",
    );
    assert.equal(
      result.operational_status.public_source.serving_extract_status,
      "not_materialized",
    );
    assert.match(
      result.change_summary.what_changed.join(" "),
      /repo_mirror_transitional/i,
    );

    const mirroredStatus = JSON.parse(
      await readFile(path.join(siteDataDir, "current-operational-status.json"), "utf8"),
    );
    const mirroredSummary = JSON.parse(
      await readFile(path.join(siteDataDir, "current-change-summary.json"), "utf8"),
    );
    const markdownSummary = await readFile(
      path.join(releaseLedgerDir, "change-summaries", `${FIXED_RELEASE_ID}.md`),
      "utf8",
    );

    assert.equal(mirroredStatus.release_id, FIXED_RELEASE_ID);
    assert.equal(mirroredSummary.release_id, FIXED_RELEASE_ID);
    assert.match(markdownSummary, /Release Summary: rls_fab001_20260401t221500z/);
    assert.match(markdownSummary, /Repo mirror \(transitional\)/);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("fails closed when the release record does not expose governed public-source state", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-release-comms-blocked-"));
  const releaseLedgerDir = path.join(tempRoot, "release-ledger");
  const releasesDir = path.join(releaseLedgerDir, "releases");
  const releaseRecordPath = path.join(releasesDir, `${FIXED_RELEASE_ID}.json`);
  const brokenRecord = buildReleaseRecord();
  delete brokenRecord.public_proof_assets.active_public_source_mode;

  try {
    await seedReleaseLedger({
      releaseLedgerDir,
      releaseRecordPath,
      releaseRecord: brokenRecord,
    });

    await assert.rejects(
      () =>
        materializeReleaseCommunications({
          releaseLedgerDir,
          siteDataDir: path.join(tempRoot, "site-data"),
          recordedAtUtc: FIXED_RECORDED_AT,
        }),
      /active public-source mode/i,
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("materializes release communications for an active Fabric-derived public serving extract", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-release-comms-serving-extract-"));
  const releaseLedgerDir = path.join(tempRoot, "release-ledger");
  const releasesDir = path.join(releaseLedgerDir, "releases");
  const siteDataDir = path.join(tempRoot, "site-data");
  const releaseRecordPath = path.join(releasesDir, `${FIXED_RELEASE_ID}.json`);

  try {
    await seedReleaseLedger({
      releaseLedgerDir,
      releaseRecordPath,
      releaseRecord: buildReleaseRecord({
        activePublicSourceMode: "fabric_serving_extract",
        activePublicSourceReference: "apps/public-site/src/data/public-serving/current",
        targetPublicSourceReference: "apps/public-site/src/data/public-serving/current",
        servingExtractStatus: "produced_from_reference_gold",
        servingExtractProduced: true,
        servingExtractArtifactPath:
          "_bmad-output/test-artifacts/fabric-public-serving-extract/materialization-report.json",
      }),
    });

    const result = await materializeReleaseCommunications({
      releaseLedgerDir,
      siteDataDir,
      recordedAtUtc: FIXED_RECORDED_AT,
    });

    assert.equal(
      result.operational_status.public_source.active_mode,
      "fabric_serving_extract",
    );
    assert.equal(
      result.operational_status.last_successful_refresh_utc,
      FIXED_LIVE_RUNTIME_REFRESH_AT,
    );
    assert.equal(
      result.operational_status.release_proof_refresh_completed_at_utc,
      FIXED_REFRESH_AT,
    );
    assert.equal(
      result.operational_status.latest_live_runtime_refresh_utc,
      FIXED_LIVE_RUNTIME_REFRESH_AT,
    );
    assert.equal(
      result.operational_status.refresh_evidence.active_source,
      "latest_live_runtime_refresh",
    );
    assert.equal(
      result.operational_status.public_source.active_label,
      "Fabric serving extract",
    );
    assert.equal(
      result.operational_status.public_source.serving_extract_status,
      "produced_from_reference_gold",
    );
    assert.match(
      result.operational_status.public_source.note,
      /reconciled against the latest recorded Fabric runtime refresh/i,
    );
    assert.match(
      result.change_summary.what_changed.join(" "),
      /Activated the Fabric-derived serving extract/i,
    );
    assert.match(
      result.change_summary.why_this_release_mattered,
      /public site moved to the bounded Fabric-derived serving extract/i,
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("fails closed when a reconciled Fabric serving extract is missing live runtime refresh evidence", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-release-comms-missing-runtime-"));
  const releaseLedgerDir = path.join(tempRoot, "release-ledger");
  const releasesDir = path.join(releaseLedgerDir, "releases");
  const releaseRecordPath = path.join(releasesDir, `${FIXED_RELEASE_ID}.json`);

  try {
    await seedReleaseLedger({
      releaseLedgerDir,
      releaseRecordPath,
      releaseRecord: buildReleaseRecord({
        activePublicSourceMode: "fabric_serving_extract",
        activePublicSourceReference: "apps/public-site/src/data/public-serving/current",
        targetPublicSourceReference: "apps/public-site/src/data/public-serving/current",
        servingExtractStatus: "produced_from_reference_gold",
        servingExtractProduced: true,
        servingExtractArtifactPath:
          "_bmad-output/test-artifacts/fabric-public-serving-extract/materialization-report.json",
      }),
      runtimePipelineReport: {
        pipeline_job: {
          id: "pipeline-run-001",
          status: "Completed",
          endTimeUtc: null,
        },
        pipeline_activity_runs: [],
      },
    });

    await assert.rejects(
      () =>
        materializeReleaseCommunications({
          releaseLedgerDir,
          siteDataDir: path.join(tempRoot, "site-data"),
          recordedAtUtc: FIXED_RECORDED_AT,
        }),
      /latest live runtime refresh timestamp/i,
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

async function seedReleaseLedger({
  releaseLedgerDir,
  releaseRecordPath,
  releaseRecord,
  runtimePipelineReport = buildRuntimePipelineReport(),
}) {
  const runtimeDir = path.join(releaseLedgerDir, "runtime-governance");
  const runtimePipelineReportPath = path.join(runtimeDir, "runtime-pipeline-report.json");
  releaseRecord.runtime_execution_state.runtime_pipeline_report_path =
    runtimePipelineReportPath;

  const releaseSummary = {
    release_id: FIXED_RELEASE_ID,
    release_state: releaseRecord.release_state,
    recorded_at_utc: releaseRecord.recorded_at_utc,
    approved_refresh_timestamp_utc:
      releaseRecord.approved_data_state.approved_refresh_timestamp_utc,
    proof_refresh_status: releaseRecord.validation_state.proof_refresh_status,
    coherence_promotion_status:
      releaseRecord.validation_state.coherence_promotion_status,
    runtime_execution_mode:
      releaseRecord.runtime_execution_state.runtime_execution_mode,
    active_public_source_mode:
      releaseRecord.public_proof_assets.active_public_source_mode,
    serving_extract_status:
      releaseRecord.runtime_execution_state.public_source_state.serving_extract_status,
    runtime_reconciliation_status:
      releaseRecord.validation_state.runtime_reconciliation_status,
    release_record_path: releaseRecordPath,
  };

  await writeJson(
    path.join(releaseLedgerDir, "release-index.json"),
    {
      generated_at_utc: FIXED_RECORDED_AT,
      current_release_id: FIXED_RELEASE_ID,
      last_known_good_release_id: FIXED_RELEASE_ID,
      releases: [releaseSummary],
    },
  );
  await writeJson(path.join(releaseLedgerDir, "current-release.json"), {
    role: "current",
    release_id: FIXED_RELEASE_ID,
    release_record_path: releaseRecordPath,
    recorded_at_utc: FIXED_RECORDED_AT,
  });
  await writeJson(path.join(releaseLedgerDir, "last-known-good-release.json"), {
    role: "last_known_good",
    release_id: FIXED_RELEASE_ID,
    release_record_path: releaseRecordPath,
    recorded_at_utc: FIXED_RECORDED_AT,
  });
  await writeJson(runtimePipelineReportPath, runtimePipelineReport);
  await writeJson(releaseRecordPath, releaseRecord);
}

function buildReleaseRecord({
  activePublicSourceMode = "repo_mirror_transitional",
  activePublicSourceReference = "apps/public-site/src/data/publication/current",
  targetPublicSourceReference = "fabric_public_serving_extract_pending",
  servingExtractStatus = "not_materialized",
  servingExtractProduced = false,
  servingExtractArtifactPath = "",
} = {}) {
  return {
    release_id: FIXED_RELEASE_ID,
    release_state: "published_approved",
    recorded_at_utc: FIXED_RELEASE_RECORDED_AT,
    approved_data_state: {
      approved_refresh_timestamp_utc: FIXED_APPROVED_INPUT_AT,
    },
    validation_state: {
      coherence_promotion_status: "coherence_approved",
      coherence_promotable: true,
      proof_refresh_status: "live_refresh_completed",
      proof_refresh_completed_at_utc: FIXED_REFRESH_AT,
      runtime_reconciliation_status: "aligned",
      runtime_traceability_complete: true,
    },
    public_proof_assets: {
      active_public_source_mode: activePublicSourceMode,
      active_public_source_reference: activePublicSourceReference,
      target_public_source_mode: "fabric_serving_extract",
      target_public_source_reference: targetPublicSourceReference,
      public_routes: ["/", "/case-study", "/technical-method", "/contact"],
    },
    runtime_execution_state: {
      runtime_execution_mode: "pipeline_notebook_activity_preview",
      public_source_state: {
        active_mode: activePublicSourceMode,
        target_mode: "fabric_serving_extract",
        serving_extract_status: servingExtractStatus,
        serving_extract_produced: servingExtractProduced,
        active_reference: activePublicSourceReference,
        target_reference: targetPublicSourceReference,
        serving_extract_artifact_path: servingExtractArtifactPath,
      },
    },
  };
}

function buildRuntimePipelineReport({
  liveRuntimeRefreshAt = FIXED_LIVE_RUNTIME_REFRESH_AT,
} = {}) {
  return {
    report_type: "fab001_runtime_pipeline",
    recorded_at_utc: FIXED_RECORDED_AT,
    pipeline_job: {
      id: "pipeline-run-001",
      status: "Completed",
      endTimeUtc: liveRuntimeRefreshAt,
    },
    pipeline_activity_runs: [
      {
        activityName: "RunFabricProofNotebook",
        activityRunEnd: liveRuntimeRefreshAt,
      },
    ],
  };
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
