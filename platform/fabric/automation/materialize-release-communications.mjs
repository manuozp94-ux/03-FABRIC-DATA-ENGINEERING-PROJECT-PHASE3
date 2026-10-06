import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  REPO_ROOT,
  readJsonFile,
  writeJsonFile,
} from "./dimension-build-lib.mjs";
import {
  DEFAULT_RELEASE_LEDGER_DIR,
  DEFAULT_RELEASE_INDEX_PATH,
} from "./materialize-release-identity-record.mjs";

export const DEFAULT_RELEASE_COMMUNICATIONS_CONTRACT_REFERENCE =
  "platform/fabric/contracts/release-communications-contract.md";
export const DEFAULT_CHANGE_SUMMARIES_DIR = path.join(
  DEFAULT_RELEASE_LEDGER_DIR,
  "change-summaries",
);
export const DEFAULT_CURRENT_CHANGE_SUMMARY_PATH = path.join(
  DEFAULT_RELEASE_LEDGER_DIR,
  "current-change-summary.json",
);
export const DEFAULT_CURRENT_OPERATIONAL_STATUS_PATH = path.join(
  DEFAULT_RELEASE_LEDGER_DIR,
  "current-operational-status.json",
);
export const DEFAULT_WEB_RELEASE_DATA_DIR = path.join(
  REPO_ROOT,
  "apps/public-site/src/data/release",
);
export const DEFAULT_WEB_CURRENT_CHANGE_SUMMARY_PATH = path.join(
  DEFAULT_WEB_RELEASE_DATA_DIR,
  "current-change-summary.json",
);
export const DEFAULT_WEB_CURRENT_OPERATIONAL_STATUS_PATH = path.join(
  DEFAULT_WEB_RELEASE_DATA_DIR,
  "current-operational-status.json",
);
const WARNING_AFTER_DAYS = 7;
const STALE_AFTER_DAYS = 14;

export function parseReleaseCommunicationsArgs(argv = process.argv.slice(2)) {
  const parsed = {
    releaseLedgerDir: DEFAULT_RELEASE_LEDGER_DIR,
    releaseId: null,
    recordedAtUtc: null,
    siteDataDir: DEFAULT_WEB_RELEASE_DATA_DIR,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--") {
      continue;
    }
    if (arg === "--release-ledger-dir") {
      parsed.releaseLedgerDir = path.resolve(next);
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
    if (arg === "--site-data-dir") {
      parsed.siteDataDir = path.resolve(next);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

export async function materializeReleaseCommunications(options = {}) {
  const releaseLedgerDir = path.resolve(
    options.releaseLedgerDir ?? DEFAULT_RELEASE_LEDGER_DIR,
  );
  const releaseIndexPath = path.join(releaseLedgerDir, "release-index.json");
  const currentReleasePointerPath = path.join(releaseLedgerDir, "current-release.json");
  const changeSummariesDir = path.join(releaseLedgerDir, "change-summaries");
  const currentChangeSummaryPath = path.join(releaseLedgerDir, "current-change-summary.json");
  const currentOperationalStatusPath = path.join(
    releaseLedgerDir,
    "current-operational-status.json",
  );
  const siteDataDir = path.resolve(options.siteDataDir ?? DEFAULT_WEB_RELEASE_DATA_DIR);
  const recordedAtUtc = options.recordedAtUtc ?? new Date().toISOString();

  const releaseIndex = await readJsonFile(releaseIndexPath);
  const currentReleasePointer = await readJsonFile(currentReleasePointerPath);
  const releaseId = options.releaseId
    ?? currentReleasePointer.release_id
    ?? releaseIndex.current_release_id;

  if (!releaseId) {
    throw new Error("Release communications require a current release identifier.");
  }

  const releaseSummary =
    Array.isArray(releaseIndex.releases)
      ? releaseIndex.releases.find((entry) => entry.release_id === releaseId)
      : null;
  const previousReleaseSummary =
    Array.isArray(releaseIndex.releases)
      ? releaseIndex.releases.find((entry) => entry.release_id !== releaseId) ?? null
      : null;
  const releaseRecordPath = resolveReleaseRecordPath({
    releaseLedgerDir,
    releaseSummary,
    currentReleasePointer,
    releaseId,
  });
  const releaseRecord = await readJsonFile(releaseRecordPath);
  const previousReleaseRecord = previousReleaseSummary
    ? await readJsonFile(path.resolve(REPO_ROOT, previousReleaseSummary.release_record_path))
    : null;

  validateReleaseCommunicationsInput(releaseRecord);
  const refreshEvidence = await resolveRefreshEvidence(releaseRecord);

  const operationalStatus = buildOperationalStatus({
    releaseRecord,
    refreshEvidence,
    recordedAtUtc,
    releaseRecordPath,
    currentReleasePointerPath,
  });
  const changeSummary = buildChangeSummary({
    releaseRecord,
    previousReleaseRecord,
    operationalStatus,
    recordedAtUtc,
    releaseRecordPath,
    operationalStatusPath: currentOperationalStatusPath,
  });
  const markdownSummary = renderChangeSummaryMarkdown({
    changeSummary,
    operationalStatus,
  });

  const perReleaseJsonPath = path.join(changeSummariesDir, `${releaseId}.json`);
  const perReleaseMarkdownPath = path.join(changeSummariesDir, `${releaseId}.md`);

  await mkdir(changeSummariesDir, { recursive: true });
  await writeJsonFile(perReleaseJsonPath, changeSummary);
  await writeFile(perReleaseMarkdownPath, markdownSummary, "utf8");
  await writeJsonFile(currentChangeSummaryPath, changeSummary);
  await writeJsonFile(currentOperationalStatusPath, operationalStatus);
  await writeJsonFile(
    path.join(siteDataDir, "current-change-summary.json"),
    changeSummary,
  );
  await writeJsonFile(
    path.join(siteDataDir, "current-operational-status.json"),
    operationalStatus,
  );

  return {
    change_summary: changeSummary,
    operational_status: operationalStatus,
    change_summary_path: perReleaseJsonPath,
    change_summary_markdown_path: perReleaseMarkdownPath,
    current_change_summary_path: currentChangeSummaryPath,
    current_operational_status_path: currentOperationalStatusPath,
    site_current_change_summary_path: path.join(siteDataDir, "current-change-summary.json"),
    site_current_operational_status_path: path.join(
      siteDataDir,
      "current-operational-status.json",
    ),
  };
}

function resolveReleaseRecordPath({
  releaseLedgerDir,
  releaseSummary,
  currentReleasePointer,
  releaseId,
}) {
  const candidatePath =
    releaseSummary?.release_record_path
    ?? currentReleasePointer?.release_record_path
    ?? path.join(releaseLedgerDir, "releases", `${releaseId}.json`);

  return path.resolve(REPO_ROOT, candidatePath);
}

function validateReleaseCommunicationsInput(releaseRecord) {
  const releaseProofRefreshCompletedAtUtc =
    releaseRecord.validation_state?.proof_refresh_completed_at_utc;
  const activePublicSourceMode =
    releaseRecord.public_proof_assets?.active_public_source_mode;
  const servingExtractStatus =
    releaseRecord.runtime_execution_state?.public_source_state?.serving_extract_status;

  if (!releaseRecord.release_id || !releaseRecord.release_state) {
    throw new Error("Release communications require a release id and release state.");
  }
  if (!releaseProofRefreshCompletedAtUtc) {
    throw new Error("Release communications require a release proof refresh timestamp.");
  }
  if (!releaseRecord.validation_state?.proof_refresh_status) {
    throw new Error("Release communications require proof refresh status.");
  }
  if (!releaseRecord.validation_state?.coherence_promotion_status) {
    throw new Error("Release communications require coherence promotion status.");
  }
  if (!activePublicSourceMode) {
    throw new Error("Release communications require an active public-source mode.");
  }
  if (!servingExtractStatus) {
    throw new Error("Release communications require a serving-extract status.");
  }
}

async function resolveRefreshEvidence(releaseRecord) {
  const releaseProofRefreshCompletedAtUtc =
    releaseRecord.validation_state?.proof_refresh_completed_at_utc ?? null;
  const requireLiveRuntimeRefresh = shouldRequireLiveRuntimeRefresh(releaseRecord);
  const runtimePipelineReportPath = resolveRuntimePipelineReportPath(releaseRecord);
  let latestLiveRuntimeRefreshUtc = null;

  if (runtimePipelineReportPath) {
    try {
      const runtimePipelineReport = await readJsonFile(runtimePipelineReportPath);
      latestLiveRuntimeRefreshUtc =
        extractLatestLiveRuntimeRefreshUtc(runtimePipelineReport);
    } catch (error) {
      if (requireLiveRuntimeRefresh) {
        throw new Error(
          `Release communications require readable live runtime evidence at '${toRepoRelative(runtimePipelineReportPath)}'.`,
        );
      }
    }
  }

  if (requireLiveRuntimeRefresh && !runtimePipelineReportPath) {
    throw new Error(
      "Release communications require a runtime pipeline report path when the public site is reconciled to a Fabric serving extract.",
    );
  }

  if (requireLiveRuntimeRefresh && !latestLiveRuntimeRefreshUtc) {
    throw new Error(
      "Release communications require a latest live runtime refresh timestamp when the public site is reconciled to a Fabric serving extract.",
    );
  }

  const activeRefreshSource =
    requireLiveRuntimeRefresh
      ? "latest_live_runtime_refresh"
      : "release_proof_refresh";
  const activeRefreshUtc =
    activeRefreshSource === "latest_live_runtime_refresh"
      ? latestLiveRuntimeRefreshUtc
      : releaseProofRefreshCompletedAtUtc;

  if (!activeRefreshUtc) {
    throw new Error("Release communications require an active refresh timestamp.");
  }

  return {
    active_refresh_source: activeRefreshSource,
    active_refresh_source_label: humanizeRefreshSource(activeRefreshSource),
    active_refresh_utc: activeRefreshUtc,
    release_proof_refresh_completed_at_utc: releaseProofRefreshCompletedAtUtc,
    latest_live_runtime_refresh_utc: latestLiveRuntimeRefreshUtc,
    runtime_pipeline_report_path:
      runtimePipelineReportPath ? toRepoRelative(runtimePipelineReportPath) : null,
  };
}

function buildOperationalStatus({
  releaseRecord,
  refreshEvidence,
  recordedAtUtc,
  releaseRecordPath,
  currentReleasePointerPath,
}) {
  const approvedInputRefreshTimestampUtc =
    releaseRecord.approved_data_state.approved_refresh_timestamp_utc ?? null;
  const currentReleaseState = releaseRecord.release_state;
  const overallStatus = deriveOverallStatus(releaseRecord);
  const freshness = deriveFreshness({
    recordedAtUtc,
    lastSuccessfulRefreshUtc: refreshEvidence.active_refresh_utc,
  });
  const activeMode =
    releaseRecord.public_proof_assets.active_public_source_mode;
  const targetMode =
    releaseRecord.public_proof_assets.target_public_source_mode;
  const servingExtractStatus =
    releaseRecord.runtime_execution_state.public_source_state.serving_extract_status;

  return {
    report_type: "fab001_operational_status",
    recorded_at_utc: recordedAtUtc,
    contract_reference: DEFAULT_RELEASE_COMMUNICATIONS_CONTRACT_REFERENCE,
    release_id: releaseRecord.release_id,
    current_release_state: currentReleaseState,
    overall_status: overallStatus,
    overall_status_label: humanizeCode(overallStatus),
    last_successful_refresh_utc: refreshEvidence.active_refresh_utc,
    release_proof_refresh_completed_at_utc:
      refreshEvidence.release_proof_refresh_completed_at_utc,
    latest_live_runtime_refresh_utc:
      refreshEvidence.latest_live_runtime_refresh_utc,
    approved_input_refresh_timestamp_utc: approvedInputRefreshTimestampUtc,
    last_approved_release_recorded_at_utc: releaseRecord.recorded_at_utc,
    refresh_evidence: {
      active_source: refreshEvidence.active_refresh_source,
      active_source_label: refreshEvidence.active_refresh_source_label,
      runtime_pipeline_report_path: refreshEvidence.runtime_pipeline_report_path,
    },
    validation_status: {
      coherence_promotion_status:
        releaseRecord.validation_state.coherence_promotion_status,
      proof_refresh_status: releaseRecord.validation_state.proof_refresh_status,
      runtime_reconciliation_status:
        releaseRecord.validation_state.runtime_reconciliation_status,
      runtime_traceability_complete:
        releaseRecord.validation_state.runtime_traceability_complete,
    },
    freshness,
    public_source: {
      active_mode: activeMode,
      active_label: humanizePublicSourceMode(activeMode),
      active_reference:
        releaseRecord.public_proof_assets.active_public_source_reference,
      target_mode: targetMode,
      target_label: humanizePublicSourceMode(targetMode),
      target_reference:
        releaseRecord.public_proof_assets.target_public_source_reference,
      serving_extract_status: servingExtractStatus,
      serving_extract_status_label: humanizeCode(servingExtractStatus),
      note:
        activeMode === "repo_mirror_transitional"
          ? "The public site still consumes a transitional repo mirror while the Fabric serving extract remains the target state."
          : "The public site is consuming a Fabric-derived serving extract reconciled against the latest recorded Fabric runtime refresh.",
    },
    public_routes: releaseRecord.public_proof_assets.public_routes ?? [],
    release_record_path: toRepoRelative(releaseRecordPath),
    current_release_pointer_path: toRepoRelative(currentReleasePointerPath),
    summary_note:
      "This status report is a governed mirror of approved release context plus the latest reconciled Fabric runtime evidence. It is not a request-time live operational feed.",
  };
}

function buildChangeSummary({
  releaseRecord,
  previousReleaseRecord,
  operationalStatus,
  recordedAtUtc,
  releaseRecordPath,
  operationalStatusPath,
}) {
  const whatChanged = deriveWhatChanged({
    releaseRecord,
    previousReleaseRecord,
    operationalStatus,
  });
  const summaryScope = previousReleaseRecord ? "delta" : "baseline";

  return {
    report_type: "fab001_release_change_summary",
    recorded_at_utc: recordedAtUtc,
    contract_reference: DEFAULT_RELEASE_COMMUNICATIONS_CONTRACT_REFERENCE,
    release_id: releaseRecord.release_id,
    summary_scope: summaryScope,
    title:
      summaryScope === "baseline"
        ? "Baseline governed public release summary"
        : "Governed public release update summary",
    why_this_release_mattered: deriveWhyThisReleaseMattered({
      releaseRecord,
      previousReleaseRecord,
    }),
    what_changed: whatChanged,
    associated_release_identifier: releaseRecord.release_id,
    previous_release_id: previousReleaseRecord?.release_id ?? null,
    release_record_path: toRepoRelative(releaseRecordPath),
    operational_status_path: toRepoRelative(operationalStatusPath),
    current_public_source_mode:
      operationalStatus.public_source.active_mode,
    current_public_source_label:
      operationalStatus.public_source.active_label,
    serving_extract_status:
      operationalStatus.public_source.serving_extract_status,
  };
}

function deriveWhatChanged({
  releaseRecord,
  previousReleaseRecord,
  operationalStatus,
}) {
  if (!previousReleaseRecord) {
    const publicSourceBaselineMessage =
      operationalStatus.public_source.active_mode === "fabric_serving_extract"
        ? `Activated the Fabric-derived serving extract as the current governed public source with serving-extract status '${operationalStatus.public_source.serving_extract_status}'.`
        : `Documented the active public-source mode as '${operationalStatus.public_source.active_mode}' while the Fabric serving extract remains '${operationalStatus.public_source.serving_extract_status}'.`;
    return [
      `Established release ${releaseRecord.release_id} as the current governed public proof record.`,
      `Recorded the approved Bronze input package refresh at ${releaseRecord.approved_data_state.approved_refresh_timestamp_utc}.`,
      `Confirmed published proof status '${releaseRecord.validation_state.proof_refresh_status}' with runtime reconciliation '${releaseRecord.validation_state.runtime_reconciliation_status}'.`,
      publicSourceBaselineMessage,
    ];
  }

  const changes = [];

  compareChange(
    changes,
    previousReleaseRecord.approved_data_state?.approved_refresh_timestamp_utc,
    releaseRecord.approved_data_state?.approved_refresh_timestamp_utc,
    (before, after) =>
      `Advanced the approved input refresh timestamp from ${before ?? "none"} to ${after ?? "none"}.`,
  );
  compareChange(
    changes,
    previousReleaseRecord.validation_state?.proof_refresh_status,
    releaseRecord.validation_state?.proof_refresh_status,
    (before, after) =>
      `Updated proof refresh status from '${before ?? "unknown"}' to '${after ?? "unknown"}'.`,
  );
  compareChange(
    changes,
    previousReleaseRecord.validation_state?.runtime_reconciliation_status,
    releaseRecord.validation_state?.runtime_reconciliation_status,
    (before, after) =>
      `Changed runtime reconciliation status from '${before ?? "unknown"}' to '${after ?? "unknown"}'.`,
  );
  compareChange(
    changes,
    previousReleaseRecord.public_proof_assets?.active_public_source_mode,
    releaseRecord.public_proof_assets?.active_public_source_mode,
    (before, after) =>
      `Changed the active public-source mode from '${before ?? "unknown"}' to '${after ?? "unknown"}'.`,
  );
  compareChange(
    changes,
    previousReleaseRecord.runtime_execution_state?.public_source_state?.serving_extract_status,
    releaseRecord.runtime_execution_state?.public_source_state?.serving_extract_status,
    (before, after) =>
      `Updated serving-extract status from '${before ?? "unknown"}' to '${after ?? "unknown"}'.`,
  );
  compareChange(
    changes,
    previousReleaseRecord.runtime_execution_state?.runtime_execution_mode,
    releaseRecord.runtime_execution_state?.runtime_execution_mode,
    (before, after) =>
      `Updated runtime execution mode from '${before ?? "unknown"}' to '${after ?? "unknown"}'.`,
  );

  if (changes.length === 0) {
    changes.push(
      `Reconfirmed governed release ${releaseRecord.release_id} without a material change across the tracked release-communication fields.`,
    );
  }

  return changes;
}

function deriveWhyThisReleaseMattered({ releaseRecord, previousReleaseRecord }) {
  if (!previousReleaseRecord) {
    if (releaseRecord.public_proof_assets?.active_public_source_mode === "fabric_serving_extract") {
      return "This release establishes the governed reviewer-facing summary after the public site moved to the bounded Fabric-derived serving extract.";
    }

    return "This release establishes the first governed reviewer-facing summary for what is live, how it was validated, and which public-source mode is still active.";
  }

  if (
    previousReleaseRecord.public_proof_assets?.active_public_source_mode
    !== releaseRecord.public_proof_assets?.active_public_source_mode
  ) {
    return "This release matters because the public-source mode changed and reviewers need an explicit explanation of what now powers the public surface.";
  }

  if (
    previousReleaseRecord.runtime_execution_state?.public_source_state?.serving_extract_status
    !== releaseRecord.runtime_execution_state?.public_source_state?.serving_extract_status
  ) {
    return "This release matters because the downstream Fabric serving-extract state changed and the public artifact needs an honest status update.";
  }

  return "This release matters because meaningful proof, validation, or runtime-state changes should remain understandable without reading raw diagnostics or internal notebooks.";
}

function deriveOverallStatus(releaseRecord) {
  const validation = releaseRecord.validation_state ?? {};

  if (
    releaseRecord.release_state === "published_approved"
    && validation.coherence_promotable === true
    && validation.proof_refresh_status === "live_refresh_completed"
    && validation.runtime_reconciliation_status === "aligned"
    && validation.runtime_traceability_complete === true
  ) {
    return "healthy_published";
  }

  if (releaseRecord.release_state?.startsWith("published")) {
    return "published_with_attention";
  }

  return "needs_attention";
}

function deriveFreshness({ recordedAtUtc, lastSuccessfulRefreshUtc }) {
  const recordedAt = new Date(recordedAtUtc);
  const refreshAt = new Date(lastSuccessfulRefreshUtc);

  if (Number.isNaN(recordedAt.valueOf()) || Number.isNaN(refreshAt.valueOf())) {
    return {
      status: "unknown",
      status_label: "Unknown",
      age_days: null,
      warning_after_days: WARNING_AFTER_DAYS,
      stale_after_days: STALE_AFTER_DAYS,
    };
  }

  const ageDays = Math.max(
    0,
    Math.floor((recordedAt.valueOf() - refreshAt.valueOf()) / 86_400_000),
  );
  let status = "current";

  if (ageDays > STALE_AFTER_DAYS) {
    status = "stale";
  } else if (ageDays > WARNING_AFTER_DAYS) {
    status = "warning";
  }

  return {
    status,
    status_label: humanizeCode(status),
    age_days: ageDays,
    warning_after_days: WARNING_AFTER_DAYS,
    stale_after_days: STALE_AFTER_DAYS,
  };
}

function compareChange(changes, before, after, formatter) {
  if (before !== after) {
    changes.push(formatter(before, after));
  }
}

function renderChangeSummaryMarkdown({ changeSummary, operationalStatus }) {
  const lines = [
    `# Release Summary: ${changeSummary.release_id}`,
    "",
    `Recorded at: ${changeSummary.recorded_at_utc}`,
    `Release state: ${operationalStatus.current_release_state}`,
    `Overall status: ${operationalStatus.overall_status_label}`,
    "",
    "## Why This Release Mattered",
    "",
    changeSummary.why_this_release_mattered,
    "",
    "## What Changed",
    "",
    ...changeSummary.what_changed.map((item) => `- ${item}`),
    "",
    "## Current Operational Status",
    "",
    `- Last successful refresh: ${operationalStatus.last_successful_refresh_utc}`,
    `- Active refresh source: ${operationalStatus.refresh_evidence.active_source_label}`,
    `- Release proof refresh: ${operationalStatus.release_proof_refresh_completed_at_utc}`,
    `- Latest live runtime refresh: ${operationalStatus.latest_live_runtime_refresh_utc ?? "Not recorded"}`,
    `- Validation status: ${humanizeCode(operationalStatus.validation_status.proof_refresh_status)}`,
    `- Runtime reconciliation: ${humanizeCode(operationalStatus.validation_status.runtime_reconciliation_status)}`,
    `- Active public source: ${operationalStatus.public_source.active_label}`,
    `- Serving extract status: ${operationalStatus.public_source.serving_extract_status_label}`,
    "",
    "## Notes",
    "",
    `- ${operationalStatus.summary_note}`,
    `- ${operationalStatus.public_source.note}`,
    "",
  ];

  return `${lines.join("\n")}\n`;
}

function humanizeCode(value) {
  if (!value) {
    return "Unknown";
  }

  return value
    .toString()
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((segment) => `${segment.charAt(0).toUpperCase()}${segment.slice(1).toLowerCase()}`)
    .join(" ");
}

function humanizePublicSourceMode(mode) {
  switch (mode) {
    case "repo_mirror_transitional":
      return "Repo mirror (transitional)";
    case "fabric_serving_extract":
      return "Fabric serving extract";
    default:
      return humanizeCode(mode);
  }
}

function humanizeRefreshSource(source) {
  switch (source) {
    case "latest_live_runtime_refresh":
      return "Latest live runtime refresh";
    case "release_proof_refresh":
      return "Release proof refresh";
    default:
      return humanizeCode(source);
  }
}

function shouldRequireLiveRuntimeRefresh(releaseRecord) {
  const validation = releaseRecord.validation_state ?? {};
  const activePublicSourceMode =
    releaseRecord.public_proof_assets?.active_public_source_mode;

  return (
    activePublicSourceMode === "fabric_serving_extract"
    && validation.proof_refresh_status === "live_refresh_completed"
    && validation.runtime_reconciliation_status === "aligned"
    && validation.runtime_traceability_complete === true
  );
}

function resolveRuntimePipelineReportPath(releaseRecord) {
  const runtimePipelineReportPath =
    releaseRecord.runtime_execution_state?.runtime_pipeline_report_path;

  if (!runtimePipelineReportPath) {
    return null;
  }

  return path.resolve(REPO_ROOT, runtimePipelineReportPath);
}

function extractLatestLiveRuntimeRefreshUtc(runtimePipelineReport) {
  const runtimeCandidates = [
    runtimePipelineReport.pipeline_job?.endTimeUtc,
    runtimePipelineReport.pipeline_activity_runs
      ?.map((activity) =>
        activity.activityRunEnd
        ?? activity.output?.result?.metadata?.runEndTime
        ?? null)
      .filter(Boolean)
      .sort()
      .at(-1),
    runtimePipelineReport.recorded_at_utc,
  ].filter(Boolean);

  return runtimeCandidates[0] ?? null;
}

function toRepoRelative(filePath) {
  const absolutePath = path.resolve(filePath);
  const relativePath = path.relative(REPO_ROOT, absolutePath);

  if (!relativePath || relativePath.startsWith("..")) {
    return absolutePath;
  }

  return relativePath.split(path.sep).join("/");
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseReleaseCommunicationsArgs(argv);
  const result = await materializeReleaseCommunications(options);

  console.log(`Materialized change summary: ${result.change_summary.release_id}`);
  console.log(`Operational status: ${result.current_operational_status_path}`);
  return result;
}

const executedAsScript =
  process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (executedAsScript) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
