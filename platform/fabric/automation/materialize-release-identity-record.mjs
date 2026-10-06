import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { REPO_ROOT, readJsonFile, writeJsonFile } from "./dimension-build-lib.mjs";
import {
  DEFAULT_REPRESENTATIVE_COHERENCE_REPORT_PATH,
} from "../validation/validate-representative-coherence.mjs";
import {
  DEFAULT_FABRIC_PROOF_REPORT_PATH,
} from "./run-fab001-stabilized-proof-refresh.mjs";

const execFileAsync = promisify(execFile);

export const DEFAULT_RELEASE_LEDGER_DIR = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/release-ledger",
);
export const DEFAULT_RELEASES_DIR = path.join(DEFAULT_RELEASE_LEDGER_DIR, "releases");
export const DEFAULT_RELEASE_INDEX_PATH = path.join(
  DEFAULT_RELEASE_LEDGER_DIR,
  "release-index.json",
);
export const DEFAULT_CURRENT_RELEASE_PATH = path.join(
  DEFAULT_RELEASE_LEDGER_DIR,
  "current-release.json",
);
export const DEFAULT_LAST_KNOWN_GOOD_PATH = path.join(
  DEFAULT_RELEASE_LEDGER_DIR,
  "last-known-good-release.json",
);
export const DEFAULT_RELEASE_CONTRACT_REFERENCE =
  "platform/fabric/contracts/release-identity-contract.md";
export const DEFAULT_BOUNDARY_POLICY_REFERENCE =
  "docs/automation/public-evidence-boundary-policy.md";
export const DEFAULT_RUNTIME_PIPELINE_CONTRACT_REFERENCE =
  "05-compat/contracts/fab001_runtime_pipeline_contract.json";
export const DEFAULT_RUNTIME_GOVERNANCE_CONTRACT_REFERENCE =
  "platform/fabric/contracts/runtime-governance-contract.md";
export const DEFAULT_RUNTIME_PIPELINE_REPORT_PATH = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-proof/fab001/runtime-governance/runtime-pipeline-report.json",
);
export const DEFAULT_RUNTIME_GOVERNANCE_REPORT_PATH = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-proof/fab001/runtime-governance/runtime-governance-report.json",
);
export const DEFAULT_RELEASE_RUNTIME_RECONCILIATION_PATH = path.join(
  DEFAULT_RELEASE_LEDGER_DIR,
  "release-runtime-reconciliation.json",
);
const REQUIRED_RUNTIME_TABLES = [
  "ctrl_release_registry",
  "ctrl_last_known_good",
  "ctrl_runtime_job_history",
  "ctrl_asset_refresh_history",
];

export function parseReleaseIdentityArgs(argv = process.argv.slice(2)) {
  const parsed = {
    coherenceReportPath: DEFAULT_REPRESENTATIVE_COHERENCE_REPORT_PATH,
    proofRefreshReportPath: DEFAULT_FABRIC_PROOF_REPORT_PATH,
    runtimePipelineReportPath: DEFAULT_RUNTIME_PIPELINE_REPORT_PATH,
    runtimeGovernanceReportPath: DEFAULT_RUNTIME_GOVERNANCE_REPORT_PATH,
    outputDir: DEFAULT_RELEASE_LEDGER_DIR,
    releaseId: null,
    recordedAtUtc: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--") {
      continue;
    }
    if (arg === "--coherence-report") {
      parsed.coherenceReportPath = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--proof-refresh-report") {
      parsed.proofRefreshReportPath = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--runtime-pipeline-report") {
      parsed.runtimePipelineReportPath = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--runtime-governance-report") {
      parsed.runtimeGovernanceReportPath = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--output-dir") {
      parsed.outputDir = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--release-id") {
      parsed.releaseId = next;
      index += 1;
      continue;
    }
    if (arg === "--recorded-at-utc") {
      parsed.recordedAtUtc = next;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

export async function materializeReleaseIdentityRecord(options = {}) {
  const coherenceReportPath =
    options.coherenceReportPath ?? DEFAULT_REPRESENTATIVE_COHERENCE_REPORT_PATH;
  const proofRefreshReportPath =
    options.proofRefreshReportPath ?? DEFAULT_FABRIC_PROOF_REPORT_PATH;
  const runtimePipelineReportPath =
    options.runtimePipelineReportPath ?? DEFAULT_RUNTIME_PIPELINE_REPORT_PATH;
  const runtimeGovernanceReportPath =
    options.runtimeGovernanceReportPath ?? DEFAULT_RUNTIME_GOVERNANCE_REPORT_PATH;
  const outputDir = options.outputDir ?? DEFAULT_RELEASE_LEDGER_DIR;
  const recordedAtUtc = options.recordedAtUtc ?? new Date().toISOString();

  const coherenceReport = await readJsonFile(coherenceReportPath);
  const proofRefreshReport = await readJsonFile(proofRefreshReportPath);
  const runtimePipelineReport = await readJsonFile(runtimePipelineReportPath);
  const runtimeGovernanceReport = await readJsonFile(runtimeGovernanceReportPath);

  if (!coherenceReport.promotable) {
    throw new Error("Release identity cannot be recorded because the coherence gate is not promotable.");
  }

  if (proofRefreshReport.refresh_status !== "live_refresh_completed") {
    throw new Error(
      `Release identity requires a live published proof refresh, received '${proofRefreshReport.refresh_status}'.`,
    );
  }

  const manifest = proofRefreshReport.manifest ?? {};
  const approvedRefreshTimestampUtc =
    manifest.approved_refresh_timestamp_utc
    ?? proofRefreshReport.completed_at_utc
    ?? recordedAtUtc;
  const releaseId =
    options.releaseId
    ?? `rls_fab001_${sanitizeTimestamp(approvedRefreshTimestampUtc)}`;
  const sourceControlState =
    options.sourceControlState
    ?? (await detectSourceControlState());
  const runtimeControlDir =
    options.runtimeControlDir
    ?? path.join(path.dirname(runtimeGovernanceReportPath), "current");
  const runtimeRows = await loadRuntimeControlRows(runtimeControlDir);
  validateRuntimeEvidence({
    releaseId,
    runtimePipelineReport,
    runtimeGovernanceReport,
    runtimeRows,
  });
  const runtimeExecutionState = buildRuntimeExecutionState({
    runtimePipelineReport,
    runtimeGovernanceReport,
    runtimeRows,
    runtimePipelineReportPath,
    runtimeGovernanceReportPath,
  });

  const releaseRecord = {
    release_id: releaseId,
    release_family: "fab001_public_proof",
    release_state: "published_approved",
    recorded_at_utc: recordedAtUtc,
    release_contract_reference: DEFAULT_RELEASE_CONTRACT_REFERENCE,
    source_control_state: sourceControlState,
    approved_data_state: {
      approved_refresh_timestamp_utc: approvedRefreshTimestampUtc,
      publication_dir: toRepoRelative(proofRefreshReport.publication_dir),
      repo_input_package_identity: {
        package_role: "approved_bronze_input_package",
        package_path: toRepoRelative(proofRefreshReport.publication_dir),
        approved_refresh_timestamp_utc: approvedRefreshTimestampUtc,
      },
      coherence_report_path: toRepoRelative(coherenceReportPath),
      representative_source_version:
        coherenceReport.identity?.representative_source_version ?? null,
      generation_rule_version:
        coherenceReport.identity?.generation_rule_version ?? null,
      coherence_rule_version:
        coherenceReport.identity?.coherence_rule_version ?? null,
      market_report_path: toRepoRelative(
        coherenceReport.identity?.market_report_path ?? coherenceReport.market_report_path,
      ),
      scenario_reference: coherenceReport.identity?.scenario_reference ?? null,
      controlled_realism_matrix_reference:
        coherenceReport.identity?.controlled_realism_matrix_reference ?? null,
    },
    validation_state: {
      coherence_promotion_status: coherenceReport.promotion_status ?? null,
      coherence_promotable: coherenceReport.promotable ?? false,
      coherence_validation_passed: coherenceReport.validation_passed ?? false,
      coherence_blocking_failure_count:
        coherenceReport.blocking_failure_count ?? null,
      proof_refresh_status: proofRefreshReport.refresh_status ?? null,
      proof_refresh_completed_at_utc:
        proofRefreshReport.completed_at_utc ?? null,
      live_steps_executed: proofRefreshReport.live_steps_executed ?? false,
      runtime_reconciliation_status: null,
      runtime_traceability_complete: false,
    },
    public_proof_assets: {
      approved_publication_boundary_reference: DEFAULT_BOUNDARY_POLICY_REFERENCE,
      proof_manifest_reference: toRepoRelative(
        path.join(
          path.dirname(proofRefreshReportPath),
          "current",
          "manifest.json",
        ),
      ),
      medallion_contract_reference: manifest.medallion_contract ?? null,
      semantic_model_contract_reference:
        manifest.semantic_model_contract ?? null,
      core_visual_contract_reference:
        manifest.core_visual_contract ?? null,
      core_visual_runbook_reference:
        manifest.core_visual_runbook ?? null,
      semantic_model_artifact_report_reference: toRepoRelative(
        proofRefreshReport.semantic_model_report?.artifact_report
        ?? manifest.semantic_model?.artifact_report,
      ),
      report_shell_artifact_report_reference: toRepoRelative(
        proofRefreshReport.report_shell_report?.artifact_report
        ?? manifest.report?.artifact_report,
      ),
      public_package_reference: "platform/fabric/publication/current",
      public_mirror_reference:
        runtimeExecutionState.public_source_state.active_reference
        ?? "apps/public-site/src/data/publication/current",
      active_public_source_mode: runtimeExecutionState.public_source_state.active_mode,
      active_public_source_reference:
        runtimeExecutionState.public_source_state.active_reference,
      target_public_source_mode: runtimeExecutionState.public_source_state.target_mode,
      target_public_source_reference:
        runtimeExecutionState.public_source_state.target_reference,
      public_routes: ["/", "/case-study", "/technical-method", "/contact"],
      first_proof_target: manifest.first_proof_target ?? null,
    },
    runtime_execution_state: runtimeExecutionState,
    recovery_inputs: null,
  };

  const releasesDir = path.join(outputDir, "releases");
  const releaseRecordPath = path.join(releasesDir, `${releaseId}.json`);
  const currentPointer = {
    role: "current",
    release_id: releaseId,
    release_record_path: toRepoRelative(releaseRecordPath),
    recorded_at_utc: recordedAtUtc,
  };
  const lastKnownGoodPointer = {
    role: "last_known_good",
    release_id: releaseId,
    release_record_path: toRepoRelative(releaseRecordPath),
    recorded_at_utc: recordedAtUtc,
  };

  const reconciliationPath = path.join(outputDir, "release-runtime-reconciliation.json");
  const runtimeReconciliation = buildRuntimeReconciliation({
    releaseId,
    recordedAtUtc,
    releaseRecordPath,
    currentReleasePath: path.join(outputDir, "current-release.json"),
    lastKnownGoodPath: path.join(outputDir, "last-known-good-release.json"),
    runtimePipelineReport,
    runtimeGovernanceReport,
    runtimeRows,
  });
  releaseRecord.validation_state.runtime_reconciliation_status =
    runtimeReconciliation.alignment.status;
  releaseRecord.validation_state.runtime_traceability_complete =
    runtimeReconciliation.alignment.status === "aligned";
  releaseRecord.recovery_inputs = {
    runtime_reconciliation_reference: toRepoRelative(reconciliationPath),
    repo_current_release_id: releaseId,
    repo_last_known_good_release_id: releaseId,
    fabric_current_release_id:
      runtimeReconciliation.fabric_side.ctrl_release_registry.release_id,
    fabric_last_known_good_release_id:
      runtimeReconciliation.fabric_side.ctrl_last_known_good.last_known_good_release_id,
    runtime_execution_mode: runtimeReconciliation.runtime_execution.mode,
    fabric_pipeline_run_id: runtimeReconciliation.runtime_execution.pipeline_run_id,
    effective_notebook_run_id:
      runtimeReconciliation.runtime_execution.effective_notebook_run_id,
    governance_notebook_run_id:
      runtimeReconciliation.runtime_execution.governance_notebook_run_id,
    active_public_source_mode:
      runtimeReconciliation.public_source.active_mode,
    serving_extract_status:
      runtimeReconciliation.public_source.serving_extract_status,
    serving_extract_record_path:
      runtimeReconciliation.recovery_inputs.serving_extract_record_path,
    semantic_refresh_record_path:
      runtimeReconciliation.recovery_inputs.semantic_refresh_record_path,
    report_shell_refresh_record_path:
      runtimeReconciliation.recovery_inputs.report_shell_refresh_record_path,
  };

  await writeJsonFile(releaseRecordPath, releaseRecord);

  const existingIndex = await safeReadJson(
    path.join(outputDir, "release-index.json"),
  );
  const releaseSummary = {
    release_id: releaseId,
    release_state: releaseRecord.release_state,
    recorded_at_utc: recordedAtUtc,
    approved_refresh_timestamp_utc: approvedRefreshTimestampUtc,
    proof_refresh_status: releaseRecord.validation_state.proof_refresh_status,
    coherence_promotion_status:
      releaseRecord.validation_state.coherence_promotion_status,
    runtime_execution_mode: runtimeExecutionState.runtime_execution_mode,
    active_public_source_mode:
      runtimeExecutionState.public_source_state.active_mode,
    serving_extract_status:
      runtimeExecutionState.public_source_state.serving_extract_status,
    runtime_reconciliation_status:
      releaseRecord.validation_state.runtime_reconciliation_status,
    release_record_path: toRepoRelative(releaseRecordPath),
  };
  const index = buildReleaseIndex(existingIndex, releaseSummary);
  index.current_release_id = releaseId;
  index.last_known_good_release_id = releaseId;
  index.generated_at_utc = recordedAtUtc;

  await writeJsonFile(path.join(outputDir, "release-index.json"), index);
  await writeJsonFile(path.join(outputDir, "current-release.json"), currentPointer);
  await writeJsonFile(
    path.join(outputDir, "last-known-good-release.json"),
    lastKnownGoodPointer,
  );
  await writeJsonFile(reconciliationPath, runtimeReconciliation);

  return {
    release_record: releaseRecord,
    release_record_path: releaseRecordPath,
    release_index_path: path.join(outputDir, "release-index.json"),
    current_release_path: path.join(outputDir, "current-release.json"),
    last_known_good_path: path.join(outputDir, "last-known-good-release.json"),
    runtime_reconciliation_path: reconciliationPath,
  };
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseReleaseIdentityArgs(argv);
  const result = await materializeReleaseIdentityRecord(options);

  console.log(`Recorded release: ${result.release_record.release_id}`);
  console.log(`Release record: ${result.release_record_path}`);
  console.log(`Release index: ${result.release_index_path}`);
  return result;
}

function buildReleaseIndex(existingIndex, releaseSummary) {
  const index = existingIndex && Array.isArray(existingIndex.releases)
    ? existingIndex
    : {
      generated_at_utc: null,
      current_release_id: null,
      last_known_good_release_id: null,
      releases: [],
    };

  const filtered = index.releases.filter(
    (entry) => entry.release_id !== releaseSummary.release_id,
  );
  filtered.push(releaseSummary);
  filtered.sort((left, right) =>
    right.recorded_at_utc.localeCompare(left.recorded_at_utc));

  return {
    ...index,
    releases: filtered,
  };
}

async function detectSourceControlState() {
  const insideWorkTree = await tryExec(["rev-parse", "--is-inside-work-tree"]);
  const head = await tryExec(["rev-parse", "HEAD"]);
  const branch = await tryExec(["branch", "--show-current"]);
  const status = await tryExec(["status", "--short", "--untracked-files=all"]);

  const statusLines = (status.stdout ?? "")
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean);
  const untrackedFiles = statusLines
    .filter((line) => line.startsWith("?? "))
    .map((line) => line.slice(3));
  const trackedChanges = statusLines
    .filter((line) => !line.startsWith("?? "))
    .map((line) => line.slice(3).trim());

  return {
    vcs: "git",
    repository_detected: insideWorkTree.stdout?.trim() === "true",
    head_commit_available: head.code === 0,
    head_commit_sha: head.code === 0 ? head.stdout.trim() : null,
    branch_name: branch.code === 0 ? branch.stdout.trim() || null : null,
    head_resolution: head.code === 0 ? "resolved" : "unborn_or_missing",
    working_tree_summary: {
      tracked_change_count: trackedChanges.length,
      untracked_file_count: untrackedFiles.length,
      tracked_change_samples: trackedChanges.slice(0, 10),
      untracked_file_samples: untrackedFiles.slice(0, 10),
      porcelain_clean: statusLines.length === 0,
    },
    notes:
      head.code === 0
        ? []
        : ["No HEAD commit exists in the current local repository state."],
  };
}

async function tryExec(args) {
  try {
    const { stdout, stderr } = await execFileAsync("git", args, {
      cwd: REPO_ROOT,
      env: process.env,
    });

    return {
      code: 0,
      stdout,
      stderr,
    };
  } catch (error) {
    return {
      code: error.code ?? 1,
      stdout: error.stdout ?? "",
      stderr: error.stderr ?? "",
    };
  }
}

function sanitizeTimestamp(value) {
  return value
    .replace(/\.\d+Z$/, "z")
    .replace(/Z$/, "z")
    .replace(/[:\-]/g, "")
    .replace("T", "t");
}

async function loadRuntimeControlRows(runtimeControlDir) {
  const controlRows = {};

  for (const tableName of REQUIRED_RUNTIME_TABLES) {
    const tablePath = path.join(runtimeControlDir, `${tableName}.csv`);
    controlRows[tableName] = await readCsvRows(tablePath);
  }

  return controlRows;
}

function validateRuntimeEvidence({
  releaseId,
  runtimePipelineReport,
  runtimeGovernanceReport,
  runtimeRows,
}) {
  const pipeline = runtimePipelineReport.pipeline ?? {};
  const pipelineJob = runtimePipelineReport.pipeline_job ?? {};
  const effectiveNotebookJob = getEffectiveNotebookJob(runtimePipelineReport, runtimeRows);
  const governanceJob = runtimeGovernanceReport.governance_result?.notebook_job ?? {};
  const visibleRuntimeTables =
    runtimeGovernanceReport.governance_result?.visible_runtime_tables ?? [];
  const missingVisibleTables = REQUIRED_RUNTIME_TABLES.filter(
    (tableName) => !visibleRuntimeTables.includes(tableName),
  );
  const registryRow = runtimeRows.ctrl_release_registry?.[0] ?? null;
  const lastKnownGoodRow = runtimeRows.ctrl_last_known_good?.[0] ?? null;
  const assetHistory = runtimeRows.ctrl_asset_refresh_history ?? [];
  const publicServingExtractRow =
    assetHistory.find((row) => row.asset_type === "public_serving_extract") ?? null;
  const pipelinePublicServingExtract = runtimePipelineReport.public_serving_extract ?? {};

  if (!pipeline.id || !pipeline.displayName) {
    throw new Error("Runtime traceability requires a recorded Fabric pipeline item.");
  }

  if (!pipelineJob.id || !pipelineJob.status) {
    throw new Error("Runtime traceability requires a recorded Fabric pipeline job.");
  }

  if (!effectiveNotebookJob.job_id || !effectiveNotebookJob.status) {
    throw new Error("Runtime traceability requires an effective notebook execution record.");
  }

  if (!governanceJob.id || governanceJob.status !== "Completed") {
    throw new Error(
      "Runtime traceability requires a completed governance notebook materialization.",
    );
  }

  if (missingVisibleTables.length > 0) {
    throw new Error(
      `Runtime traceability requires all visible control tables, missing: ${missingVisibleTables.join(", ")}.`,
    );
  }

  if (!registryRow || !lastKnownGoodRow) {
    throw new Error("Runtime traceability requires populated release and last-known-good control rows.");
  }

  if (!registryRow.public_source_mode || !registryRow.serving_extract_status) {
    throw new Error(
      "Runtime traceability requires public-source mode and serving-extract status in ctrl_release_registry.",
    );
  }

  if (!lastKnownGoodRow.public_source_mode) {
    throw new Error(
      "Runtime traceability requires public-source mode in ctrl_last_known_good.",
    );
  }

  if (!publicServingExtractRow) {
    throw new Error(
      "Runtime traceability requires a public_serving_extract row in ctrl_asset_refresh_history.",
    );
  }

  if (!publicServingExtractRow.status || !publicServingExtractRow.public_source_mode) {
    throw new Error(
      "Runtime traceability requires status and public-source mode for the public_serving_extract asset row.",
    );
  }

  if (
    pipelinePublicServingExtract.active_public_source_mode
    && pipelinePublicServingExtract.active_public_source_mode !== registryRow.public_source_mode
  ) {
    throw new Error(
      `Runtime release alignment failed: pipeline report active public source mode is '${pipelinePublicServingExtract.active_public_source_mode}', expected '${registryRow.public_source_mode}'.`,
    );
  }

  if (
    pipelinePublicServingExtract.status
    && pipelinePublicServingExtract.status !== publicServingExtractRow.status
  ) {
    throw new Error(
      `Runtime release alignment failed: pipeline report serving extract status is '${pipelinePublicServingExtract.status}', expected '${publicServingExtractRow.status}'.`,
    );
  }

  if (registryRow.release_id !== releaseId) {
    throw new Error(
      `Runtime release alignment failed: Fabric ctrl_release_registry points to '${registryRow.release_id}', expected '${releaseId}'.`,
    );
  }

  if (lastKnownGoodRow.active_release_id !== releaseId) {
    throw new Error(
      `Runtime release alignment failed: Fabric ctrl_last_known_good active release is '${lastKnownGoodRow.active_release_id}', expected '${releaseId}'.`,
    );
  }

  if (lastKnownGoodRow.last_known_good_release_id !== releaseId) {
    throw new Error(
      `Runtime release alignment failed: Fabric ctrl_last_known_good last-known-good release is '${lastKnownGoodRow.last_known_good_release_id}', expected '${releaseId}'.`,
    );
  }
}

function buildRuntimeExecutionState({
  runtimePipelineReport,
  runtimeGovernanceReport,
  runtimeRows,
  runtimePipelineReportPath,
  runtimeGovernanceReportPath,
}) {
  const pipeline = runtimePipelineReport.pipeline ?? {};
  const pipelineJob = runtimePipelineReport.pipeline_job ?? {};
  const effectiveNotebookJob = getEffectiveNotebookJob(runtimePipelineReport, runtimeRows);
  const governanceNotebook =
    runtimeGovernanceReport.governance_result?.governance_notebook ?? {};
  const governanceJob =
    runtimeGovernanceReport.governance_result?.notebook_job ?? {};
  const visibleRuntimeTables =
    runtimeGovernanceReport.governance_result?.visible_runtime_tables ?? [];
  const publicServingExtract =
    getPublicServingExtractState(runtimePipelineReport, runtimeRows);

  return {
    runtime_pipeline_contract_reference: DEFAULT_RUNTIME_PIPELINE_CONTRACT_REFERENCE,
    runtime_governance_contract_reference:
      DEFAULT_RUNTIME_GOVERNANCE_CONTRACT_REFERENCE,
    runtime_pipeline_report_path: toRepoRelative(runtimePipelineReportPath),
    runtime_governance_report_path: toRepoRelative(runtimeGovernanceReportPath),
    runtime_execution_mode:
      runtimePipelineReport.runtime_execution_mode ?? "runtime_mode_not_recorded",
    pipeline: {
      item_id: pipeline.id ?? null,
      item_name: pipeline.displayName ?? null,
      run_id: pipelineJob.id ?? null,
      status: pipelineJob.status ?? null,
    },
    effective_notebook_execution: {
      execution_type: effectiveNotebookJob.execution_type ?? null,
      item_id: effectiveNotebookJob.item_id ?? null,
      item_name: effectiveNotebookJob.item_name ?? null,
      run_id: effectiveNotebookJob.job_id ?? null,
      status: effectiveNotebookJob.status ?? null,
    },
    runtime_governance: {
      notebook_item_id: governanceNotebook.id ?? null,
      notebook_name: governanceNotebook.displayName ?? null,
      notebook_run_id: governanceJob.id ?? null,
      notebook_run_status: governanceJob.status ?? null,
      visible_runtime_tables: visibleRuntimeTables,
    },
    public_source_state: {
      active_mode: publicServingExtract.active_public_source_mode ?? null,
      target_mode: publicServingExtract.target_public_source_mode ?? null,
      serving_extract_status: publicServingExtract.status ?? null,
      serving_extract_produced: publicServingExtract.produced ?? null,
      active_reference:
        publicServingExtract.active_public_source_mode === "repo_mirror_transitional"
          ? "apps/public-site/src/data/publication/current"
          : publicServingExtract.active_reference
            ?? publicServingExtract.artifact_path
            ?? null,
      target_reference:
        publicServingExtract.target_public_source_mode === "fabric_serving_extract"
          ? publicServingExtract.active_reference
            || publicServingExtract.artifact_path
            || "fabric_public_serving_extract_pending"
          : null,
      serving_extract_artifact_path: publicServingExtract.artifact_path ?? null,
    },
  };
}

function buildRuntimeReconciliation({
  releaseId,
  recordedAtUtc,
  releaseRecordPath,
  currentReleasePath,
  lastKnownGoodPath,
  runtimePipelineReport,
  runtimeGovernanceReport,
  runtimeRows,
}) {
  const registryRow = runtimeRows.ctrl_release_registry?.[0] ?? {};
  const lastKnownGoodRow = runtimeRows.ctrl_last_known_good?.[0] ?? {};
  const pipelineJob = runtimePipelineReport.pipeline_job ?? {};
  const effectiveNotebookJob = getEffectiveNotebookJob(runtimePipelineReport, runtimeRows);
  const governanceJob = runtimeGovernanceReport.governance_result?.notebook_job ?? {};
  const assetHistory = runtimeRows.ctrl_asset_refresh_history ?? [];
  const semanticAsset =
    assetHistory.find((row) => row.asset_type === "semantic_model") ?? {};
  const reportAsset =
    assetHistory.find((row) => row.asset_type === "report_shell") ?? {};
  const publicServingExtractAsset =
    assetHistory.find((row) => row.asset_type === "public_serving_extract") ?? {};
  const publicServingExtract =
    getPublicServingExtractState(runtimePipelineReport, runtimeRows);
  const visibleRuntimeTables =
    runtimeGovernanceReport.governance_result?.visible_runtime_tables ?? [];
  const missingVisibleTables = REQUIRED_RUNTIME_TABLES.filter(
    (tableName) => !visibleRuntimeTables.includes(tableName),
  );
  const alignment = {
    current_release_id_match: registryRow.release_id === releaseId,
    active_release_id_match: lastKnownGoodRow.active_release_id === releaseId,
    last_known_good_release_id_match:
      lastKnownGoodRow.last_known_good_release_id === releaseId,
    visible_runtime_tables_match: missingVisibleTables.length === 0,
    public_source_mode_match:
      registryRow.public_source_mode === publicServingExtract.active_public_source_mode,
    serving_extract_status_match:
      registryRow.serving_extract_status === publicServingExtract.status,
    public_serving_asset_mode_match:
      publicServingExtractAsset.public_source_mode === publicServingExtract.active_public_source_mode,
  };
  alignment.status = Object.values(alignment).every(Boolean) ? "aligned" : "mismatch";

  return {
    release_id: releaseId,
    reconciled_at_utc: recordedAtUtc,
    repo_side: {
      current_release_id: releaseId,
      last_known_good_release_id: releaseId,
      release_record_path: toRepoRelative(releaseRecordPath),
      current_release_path: toRepoRelative(currentReleasePath),
      last_known_good_path: toRepoRelative(lastKnownGoodPath),
    },
    fabric_side: {
      ctrl_release_registry: registryRow,
      ctrl_last_known_good: lastKnownGoodRow,
      visible_runtime_tables: visibleRuntimeTables,
    },
    public_source: {
      active_mode: publicServingExtract.active_public_source_mode ?? null,
      target_mode: publicServingExtract.target_public_source_mode ?? null,
      serving_extract_status: publicServingExtract.status ?? null,
      serving_extract_asset: publicServingExtractAsset,
    },
    runtime_execution: {
      mode: runtimePipelineReport.runtime_execution_mode ?? "runtime_mode_not_recorded",
      pipeline_run_id: pipelineJob.id ?? null,
      pipeline_status: pipelineJob.status ?? null,
      effective_notebook_run_id: effectiveNotebookJob.job_id ?? null,
      effective_notebook_status: effectiveNotebookJob.status ?? null,
      governance_notebook_run_id: governanceJob.id ?? null,
      governance_notebook_status: governanceJob.status ?? null,
    },
    alignment,
    recovery_inputs: {
      semantic_refresh_record_path: semanticAsset.refresh_record_path ?? null,
      report_shell_refresh_record_path: reportAsset.refresh_record_path ?? null,
      serving_extract_record_path: publicServingExtractAsset.refresh_record_path ?? null,
      runtime_table_names: visibleRuntimeTables,
    },
  };
}

function getPublicServingExtractState(runtimePipelineReport, runtimeRows) {
  const pipelineState = runtimePipelineReport.public_serving_extract ?? {};
  const assetHistory = runtimeRows.ctrl_asset_refresh_history ?? [];
  const assetRow =
    assetHistory.find((row) => row.asset_type === "public_serving_extract") ?? {};

  return {
    status: pipelineState.status ?? assetRow.status ?? null,
    produced:
      pipelineState.produced
      ?? ((pipelineState.status ?? assetRow.status ?? "").startsWith("produced")),
    active_public_source_mode:
      pipelineState.active_public_source_mode
      ?? assetRow.public_source_mode
      ?? null,
    target_public_source_mode:
      pipelineState.target_public_source_mode
      ?? "fabric_serving_extract",
    artifact_path:
      pipelineState.artifact_path
      ?? assetRow.refresh_record_path
      ?? null,
    active_reference:
      pipelineState.active_reference
      ?? null,
  };
}

function getEffectiveNotebookJob(runtimePipelineReport, runtimeRows) {
  const directLoaderJob = runtimePipelineReport.loader_notebook_job ?? null;

  if (directLoaderJob?.id) {
    return {
      execution_type: "direct_notebook_execute",
      job_id: directLoaderJob.id,
      item_id: runtimePipelineReport.loader_notebook?.id ?? null,
      item_name: runtimePipelineReport.loader_notebook?.displayName ?? null,
      status: directLoaderJob.status ?? null,
    };
  }

  const runtimeHistory = runtimeRows.ctrl_runtime_job_history ?? [];
  const directRow = runtimeHistory.find(
    (row) => row.execution_type === "direct_notebook_execute",
  );
  if (directRow) {
    return {
      execution_type: directRow.execution_type,
      job_id: directRow.job_id,
      item_id: directRow.item_id,
      item_name: directRow.item_name,
      status: directRow.status,
    };
  }

  const notebookActivity =
    runtimeRows.ctrl_runtime_job_history?.find(
      (row) => row.execution_type === "notebook_activity",
    )
    ?? runtimePipelineReport.pipeline_activity_runs?.find((activity) => activity.activityRunId)
    ?? null;

  if (!notebookActivity) {
    return {};
  }

  return {
    execution_type: notebookActivity.execution_type ?? "notebook_activity",
    job_id: notebookActivity.job_id ?? notebookActivity.activityRunId ?? null,
    item_id:
      notebookActivity.item_id
      ?? notebookActivity.itemId
      ?? runtimePipelineReport.loader_notebook?.id
      ?? null,
    item_name:
      notebookActivity.item_name
      ?? notebookActivity.activityName
      ?? runtimePipelineReport.loader_notebook?.displayName
      ?? null,
    status: notebookActivity.status ?? null,
  };
}

async function readCsvRows(filePath) {
  const text = await readFile(filePath, "utf8");
  const records = parseCsv(text.replace(/\r\n/g, "\n"));
  if (records.length === 0) {
    return [];
  }

  const [header, ...rows] = records;
  return rows
    .filter((row) => row.some((value) => value !== ""))
    .map((row) => Object.fromEntries(
      header.map((columnName, index) => [columnName, row[index] ?? ""]),
    ));
}

function parseCsv(text) {
  const rows = [];
  let currentRow = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === "\"") {
      if (insideQuotes && nextCharacter === "\"") {
        currentValue += "\"";
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (character === "," && !insideQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if (character === "\n" && !insideQuotes) {
      currentRow.push(currentValue);
      rows.push(currentRow);
      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += character;
  }

  if (currentValue !== "" || currentRow.length > 0) {
    currentRow.push(currentValue);
    rows.push(currentRow);
  }

  return rows;
}

function toRepoRelative(targetPath) {
  if (!targetPath) {
    return null;
  }

  const resolved = path.resolve(targetPath);
  if (!resolved.startsWith(REPO_ROOT)) {
    return targetPath;
  }

  return path.relative(REPO_ROOT, resolved).split(path.sep).join("/");
}

async function safeReadJson(filePath) {
  try {
    return await readJsonFile(filePath);
  } catch {
    return null;
  }
}

const isEntrypoint =
  process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isEntrypoint) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
