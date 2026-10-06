import { copyFile, mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  OUTPUT_FILENAMES,
  REPO_ROOT,
  readJsonFile,
  writeJsonFile,
} from "./dimension-build-lib.mjs";
import {
  DEFAULT_CURRENT_CHANGE_SUMMARY_PATH,
  DEFAULT_CURRENT_OPERATIONAL_STATUS_PATH,
  DEFAULT_WEB_CURRENT_CHANGE_SUMMARY_PATH,
  DEFAULT_WEB_CURRENT_OPERATIONAL_STATUS_PATH,
  materializeReleaseCommunications,
} from "./materialize-release-communications.mjs";
import {
  DEFAULT_CURRENT_RELEASE_PATH,
  DEFAULT_LAST_KNOWN_GOOD_PATH,
  DEFAULT_RELEASE_LEDGER_DIR,
  DEFAULT_RELEASE_INDEX_PATH,
} from "./materialize-release-identity-record.mjs";
import {
  DEFAULT_PUBLIC_SERVING_EXTRACT_DIR,
  DEFAULT_WEB_PUBLIC_SERVING_EXTRACT_DIR,
  PUBLIC_SERVING_EXTRACT_FILENAMES,
} from "./materialize-fabric-public-serving-extract.mjs";
import {
  DEFAULT_WEB_CONSUMPTION_DIR,
} from "./sync-current-package-to-public-site.mjs";

export const DEFAULT_RELEASE_RECOVERY_CONTRACT_REFERENCE =
  "platform/fabric/contracts/release-recovery-contract.md";
export const DEFAULT_RECOVERABLE_SNAPSHOTS_DIR = path.join(
  DEFAULT_RELEASE_LEDGER_DIR,
  "recoverable-snapshots",
);
export const DEFAULT_RECOVERY_REPORTS_DIR = path.join(
  DEFAULT_RELEASE_LEDGER_DIR,
  "recovery",
);
export const DEFAULT_PUBLICATION_CURRENT_DIR = path.join(
  REPO_ROOT,
  "platform/fabric/publication/current",
);
export const DEFAULT_WEB_PUBLICATION_CURRENT_DIR = DEFAULT_WEB_CONSUMPTION_DIR;
export const DEFAULT_REPO_PUBLIC_SERVING_EXTRACT_DIR = DEFAULT_PUBLIC_SERVING_EXTRACT_DIR;
export const DEFAULT_WEB_PUBLIC_SERVING_EXTRACT_MIRROR_DIR =
  DEFAULT_WEB_PUBLIC_SERVING_EXTRACT_DIR;

const RECOVERABLE_PUBLICATION_FILENAMES = Object.values(OUTPUT_FILENAMES).sort();
const RELEASE_DATA_FILENAMES = [
  "current-change-summary.json",
  "current-operational-status.json",
];

export function parseReleaseRecoveryArgs(argv = process.argv.slice(2)) {
  const parsed = {
    releaseLedgerDir: DEFAULT_RELEASE_LEDGER_DIR,
    publicationDir: DEFAULT_PUBLICATION_CURRENT_DIR,
    publicMirrorDir: DEFAULT_WEB_PUBLICATION_CURRENT_DIR,
    repoServingExtractDir: DEFAULT_REPO_PUBLIC_SERVING_EXTRACT_DIR,
    siteServingExtractDir: DEFAULT_WEB_PUBLIC_SERVING_EXTRACT_MIRROR_DIR,
    siteReleaseDataDir: path.dirname(DEFAULT_WEB_CURRENT_CHANGE_SUMMARY_PATH),
    captureSnapshot: false,
    executeRecovery: false,
    releaseId: null,
    restoreReleaseId: null,
    failedReleaseId: null,
    restoreReason: "manual_recovery_requested",
    recordedAtUtc: null,
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
    if (arg === "--publication-dir") {
      parsed.publicationDir = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--public-mirror-dir") {
      parsed.publicMirrorDir = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--repo-serving-extract-dir") {
      parsed.repoServingExtractDir = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--site-serving-extract-dir") {
      parsed.siteServingExtractDir = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--site-release-data-dir") {
      parsed.siteReleaseDataDir = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--capture-snapshot") {
      parsed.captureSnapshot = true;
      continue;
    }
    if (arg === "--execute-recovery") {
      parsed.executeRecovery = true;
      continue;
    }
    if (arg === "--release-id") {
      parsed.releaseId = next;
      index += 1;
      continue;
    }
    if (arg === "--restore-release-id") {
      parsed.restoreReleaseId = next;
      index += 1;
      continue;
    }
    if (arg === "--failed-release-id") {
      parsed.failedReleaseId = next;
      index += 1;
      continue;
    }
    if (arg === "--restore-reason") {
      parsed.restoreReason = next;
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

  if (!parsed.captureSnapshot && !parsed.executeRecovery) {
    throw new Error("Use --capture-snapshot and/or --execute-recovery.");
  }

  return parsed;
}

export async function captureReleaseRecoverySnapshot(options = {}) {
  const releaseLedgerDir = path.resolve(options.releaseLedgerDir ?? DEFAULT_RELEASE_LEDGER_DIR);
  const publicationDir = path.resolve(options.publicationDir ?? DEFAULT_PUBLICATION_CURRENT_DIR);
  const publicMirrorDir = path.resolve(options.publicMirrorDir ?? DEFAULT_WEB_PUBLICATION_CURRENT_DIR);
  const repoServingExtractDir = path.resolve(
    options.repoServingExtractDir ?? DEFAULT_REPO_PUBLIC_SERVING_EXTRACT_DIR,
  );
  const siteServingExtractDir = path.resolve(
    options.siteServingExtractDir ?? DEFAULT_WEB_PUBLIC_SERVING_EXTRACT_MIRROR_DIR,
  );
  const siteReleaseDataDir = path.resolve(
    options.siteReleaseDataDir ?? path.dirname(DEFAULT_WEB_CURRENT_CHANGE_SUMMARY_PATH),
  );
  const recordedAtUtc = options.recordedAtUtc ?? new Date().toISOString();

  const releaseIndex = await readJsonFile(path.join(releaseLedgerDir, "release-index.json"));
  const currentReleasePointer = await readJsonFile(path.join(releaseLedgerDir, "current-release.json"));
  const releaseId = options.releaseId
    ?? currentReleasePointer.release_id
    ?? releaseIndex.current_release_id;

  if (!releaseId) {
    throw new Error("Recoverable snapshot capture requires a release id.");
  }

  const releaseSummary = releaseIndex.releases?.find((entry) => entry.release_id === releaseId) ?? null;
  const releaseRecordPath = resolveReleaseRecordPath({
    releaseLedgerDir,
    releaseId,
    releaseSummary,
    pointer: currentReleasePointer,
  });
  const releaseRecord = await readJsonFile(releaseRecordPath);
  const snapshotRoot = path.join(releaseLedgerDir, "recoverable-snapshots", releaseId);
  const snapshotPublicationDir = path.join(snapshotRoot, "publication", "current");
  const snapshotPublicMirrorDir = path.join(snapshotRoot, "site", "data", "publication", "current");
  const snapshotRepoServingExtractDir = path.join(snapshotRoot, "public-serving-extract", "current");
  const snapshotSiteServingExtractDir = path.join(snapshotRoot, "site", "data", "public-serving", "current");
  const snapshotReleaseDataDir = path.join(snapshotRoot, "site", "data", "release");

  await copyAllowlistedFiles({
    sourceDir: publicationDir,
    destinationDir: snapshotPublicationDir,
    filenames: RECOVERABLE_PUBLICATION_FILENAMES,
  });
  await copyAllowlistedFiles({
    sourceDir: publicMirrorDir,
    destinationDir: snapshotPublicMirrorDir,
    filenames: RECOVERABLE_PUBLICATION_FILENAMES,
  });
  await copyAllowlistedFiles({
    sourceDir: repoServingExtractDir,
    destinationDir: snapshotRepoServingExtractDir,
    filenames: PUBLIC_SERVING_EXTRACT_FILENAMES,
  });
  await copyAllowlistedFiles({
    sourceDir: siteServingExtractDir,
    destinationDir: snapshotSiteServingExtractDir,
    filenames: PUBLIC_SERVING_EXTRACT_FILENAMES,
  });
  await copyAllowlistedFiles({
    sourceDir: siteReleaseDataDir,
    destinationDir: snapshotReleaseDataDir,
    filenames: RELEASE_DATA_FILENAMES,
  });

  const snapshotManifest = {
    release_id: releaseId,
    captured_at_utc: recordedAtUtc,
    contract_reference: DEFAULT_RELEASE_RECOVERY_CONTRACT_REFERENCE,
    source_release_record_path: toRepoRelative(releaseRecordPath),
    source_publication_dir: toRepoRelative(publicationDir),
    source_public_mirror_dir: toRepoRelative(publicMirrorDir),
    source_repo_serving_extract_dir: toRepoRelative(repoServingExtractDir),
    source_site_serving_extract_dir: toRepoRelative(siteServingExtractDir),
    source_site_release_data_dir: toRepoRelative(siteReleaseDataDir),
    snapshot_publication_dir: toRepoRelative(snapshotPublicationDir),
    snapshot_public_mirror_dir: toRepoRelative(snapshotPublicMirrorDir),
    snapshot_repo_serving_extract_dir: toRepoRelative(snapshotRepoServingExtractDir),
    snapshot_site_serving_extract_dir: toRepoRelative(snapshotSiteServingExtractDir),
    snapshot_site_release_data_dir: toRepoRelative(snapshotReleaseDataDir),
    recovered_artifacts: {
      publication: RECOVERABLE_PUBLICATION_FILENAMES,
      public_mirror: RECOVERABLE_PUBLICATION_FILENAMES,
      repo_serving_extract: PUBLIC_SERVING_EXTRACT_FILENAMES,
      site_serving_extract: PUBLIC_SERVING_EXTRACT_FILENAMES,
      site_release_data: RELEASE_DATA_FILENAMES,
    },
  };
  const snapshotManifestPath = path.join(snapshotRoot, "snapshot-manifest.json");
  await writeJsonFile(snapshotManifestPath, snapshotManifest);

  releaseRecord.recovery_inputs = {
    ...(releaseRecord.recovery_inputs ?? {}),
    recoverable_snapshot_reference: toRepoRelative(snapshotManifestPath),
    recoverable_snapshot_publication_dir: toRepoRelative(snapshotPublicationDir),
    recoverable_snapshot_public_mirror_dir: toRepoRelative(snapshotPublicMirrorDir),
    recoverable_snapshot_repo_serving_extract_dir: toRepoRelative(snapshotRepoServingExtractDir),
    recoverable_snapshot_site_serving_extract_dir: toRepoRelative(snapshotSiteServingExtractDir),
    recoverable_snapshot_site_release_data_dir: toRepoRelative(snapshotReleaseDataDir),
  };
  await writeJsonFile(releaseRecordPath, releaseRecord);

  return {
    release_id: releaseId,
    release_record_path: releaseRecordPath,
    snapshot_manifest_path: snapshotManifestPath,
  };
}

export async function executeReleaseRecovery(options = {}) {
  const releaseLedgerDir = path.resolve(options.releaseLedgerDir ?? DEFAULT_RELEASE_LEDGER_DIR);
  const publicationDir = path.resolve(options.publicationDir ?? DEFAULT_PUBLICATION_CURRENT_DIR);
  const publicMirrorDir = path.resolve(options.publicMirrorDir ?? DEFAULT_WEB_PUBLICATION_CURRENT_DIR);
  const repoServingExtractDir = path.resolve(
    options.repoServingExtractDir ?? DEFAULT_REPO_PUBLIC_SERVING_EXTRACT_DIR,
  );
  const siteServingExtractDir = path.resolve(
    options.siteServingExtractDir ?? DEFAULT_WEB_PUBLIC_SERVING_EXTRACT_MIRROR_DIR,
  );
  const siteReleaseDataDir = path.resolve(
    options.siteReleaseDataDir ?? path.dirname(DEFAULT_WEB_CURRENT_CHANGE_SUMMARY_PATH),
  );
  const recordedAtUtc = options.recordedAtUtc ?? new Date().toISOString();
  const releaseIndexPath = path.join(releaseLedgerDir, "release-index.json");
  const currentReleasePath = path.join(releaseLedgerDir, "current-release.json");
  const lastKnownGoodPath = path.join(releaseLedgerDir, "last-known-good-release.json");

  const releaseIndex = await readJsonFile(releaseIndexPath);
  const currentReleasePointer = await readJsonFile(currentReleasePath);
  const lastKnownGoodPointer = await readJsonFile(lastKnownGoodPath);
  const failedReleaseId =
    options.failedReleaseId
    ?? currentReleasePointer.release_id
    ?? releaseIndex.current_release_id;
  const restoreReleaseId =
    options.restoreReleaseId
    ?? lastKnownGoodPointer.release_id
    ?? releaseIndex.last_known_good_release_id;

  if (!failedReleaseId || !restoreReleaseId) {
    throw new Error("Release recovery requires both a failed release id and a restore target.");
  }

  const restoreReleaseSummary =
    releaseIndex.releases?.find((entry) => entry.release_id === restoreReleaseId) ?? null;
  if (!restoreReleaseSummary) {
    throw new Error(`Cannot restore unknown release '${restoreReleaseId}'.`);
  }

  const snapshotManifestPath = path.join(
    releaseLedgerDir,
    "recoverable-snapshots",
    restoreReleaseId,
    "snapshot-manifest.json",
  );
  const snapshotManifest = await readSnapshotManifest(snapshotManifestPath);

  await restoreAllowlistedFiles({
    sourceDir: resolveRepoOrAbsolute(snapshotManifest.snapshot_publication_dir),
    destinationDir: publicationDir,
    filenames: RECOVERABLE_PUBLICATION_FILENAMES,
  });
  await restoreAllowlistedFiles({
    sourceDir: resolveRepoOrAbsolute(snapshotManifest.snapshot_public_mirror_dir),
    destinationDir: publicMirrorDir,
    filenames: RECOVERABLE_PUBLICATION_FILENAMES,
  });
  await restoreAllowlistedFiles({
    sourceDir: resolveRepoOrAbsolute(snapshotManifest.snapshot_repo_serving_extract_dir),
    destinationDir: repoServingExtractDir,
    filenames: PUBLIC_SERVING_EXTRACT_FILENAMES,
  });
  await restoreAllowlistedFiles({
    sourceDir: resolveRepoOrAbsolute(snapshotManifest.snapshot_site_serving_extract_dir),
    destinationDir: siteServingExtractDir,
    filenames: PUBLIC_SERVING_EXTRACT_FILENAMES,
  });

  const restoredReleaseRecordPath = resolveReleaseRecordPath({
    releaseLedgerDir,
    releaseId: restoreReleaseId,
    releaseSummary: restoreReleaseSummary,
    pointer: lastKnownGoodPointer,
  });

  const updatedCurrentPointer = {
    role: "current",
    release_id: restoreReleaseId,
    release_record_path: toRepoRelative(restoredReleaseRecordPath),
    recorded_at_utc: recordedAtUtc,
  };
  await writeJsonFile(currentReleasePath, updatedCurrentPointer);

  releaseIndex.current_release_id = restoreReleaseId;
  releaseIndex.generated_at_utc = recordedAtUtc;
  await writeJsonFile(releaseIndexPath, releaseIndex);

  const commsResult = await materializeReleaseCommunications({
    releaseLedgerDir,
    releaseId: restoreReleaseId,
    siteDataDir: siteReleaseDataDir,
    recordedAtUtc,
  });

  const recoveryId = `recovery_${sanitizeTimestamp(recordedAtUtc)}`;
  const recoveryReport = {
    recovery_id: recoveryId,
    recorded_at_utc: recordedAtUtc,
    contract_reference: DEFAULT_RELEASE_RECOVERY_CONTRACT_REFERENCE,
    failed_release_id: failedReleaseId,
    restored_release_id: restoreReleaseId,
    restore_reason: options.restoreReason ?? "manual_recovery_requested",
    restore_mode: "restore_last_known_good_snapshot",
    restored_snapshot_manifest_reference: toRepoRelative(snapshotManifestPath),
    restored_publication_dir: toRepoRelative(publicationDir),
    restored_public_mirror_dir: toRepoRelative(publicMirrorDir),
    restored_repo_serving_extract_dir: toRepoRelative(repoServingExtractDir),
    restored_site_serving_extract_dir: toRepoRelative(siteServingExtractDir),
    restored_site_release_data_dir: toRepoRelative(siteReleaseDataDir),
    updated_current_release_id: restoreReleaseId,
    last_known_good_release_id:
      lastKnownGoodPointer.release_id ?? releaseIndex.last_known_good_release_id ?? restoreReleaseId,
    restored_release_record_path: toRepoRelative(restoredReleaseRecordPath),
    change_summary_path: toRepoRelative(commsResult.change_summary_path),
    operational_status_path: toRepoRelative(commsResult.current_operational_status_path),
  };

  const recoveryReportsDir = path.join(releaseLedgerDir, "recovery");
  const recoveryReportPath = path.join(recoveryReportsDir, `${recoveryId}.json`);
  const recoveryMarkdownPath = path.join(recoveryReportsDir, `${recoveryId}.md`);
  await writeJsonFile(recoveryReportPath, recoveryReport);
  await writeFile(recoveryMarkdownPath, renderRecoveryMarkdown(recoveryReport), "utf8");

  return {
    recovery_report: recoveryReport,
    recovery_report_path: recoveryReportPath,
    recovery_markdown_path: recoveryMarkdownPath,
  };
}

async function readSnapshotManifest(snapshotManifestPath) {
  try {
    return await readJsonFile(snapshotManifestPath);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      throw new Error(
        `Release recovery requires a recoverable snapshot manifest at ${snapshotManifestPath}.`,
      );
    }
    throw error;
  }
}

async function copyAllowlistedFiles({ sourceDir, destinationDir, filenames }) {
  await mkdir(destinationDir, { recursive: true });

  for (const filename of filenames) {
    await copyFile(path.join(sourceDir, filename), path.join(destinationDir, filename));
  }
}

async function restoreAllowlistedFiles({ sourceDir, destinationDir, filenames }) {
  const destinationParentDir = path.dirname(destinationDir);
  const stageDir = path.join(
    destinationParentDir,
    `.recovery-stage-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  );

  await mkdir(stageDir, { recursive: true });

  try {
    for (const filename of filenames) {
      await copyFile(path.join(sourceDir, filename), path.join(stageDir, filename));
    }

    await rm(destinationDir, { recursive: true, force: true });
    await rename(stageDir, destinationDir);
  } catch (error) {
    await rm(stageDir, { recursive: true, force: true });
    throw error;
  }
}

function resolveReleaseRecordPath({ releaseLedgerDir, releaseId, releaseSummary, pointer }) {
  const candidatePath =
    releaseSummary?.release_record_path
    ?? pointer?.release_record_path
    ?? path.join(releaseLedgerDir, "releases", `${releaseId}.json`);

  return resolveRepoOrAbsolute(candidatePath);
}

function resolveRepoOrAbsolute(referencePath) {
  if (!referencePath) {
    return null;
  }

  if (path.isAbsolute(referencePath)) {
    return referencePath;
  }

  return path.resolve(REPO_ROOT, referencePath);
}

function toRepoRelative(filePath) {
  const absolutePath = path.resolve(filePath);
  const relativePath = path.relative(REPO_ROOT, absolutePath);

  if (!relativePath || relativePath.startsWith("..")) {
    return absolutePath;
  }

  return relativePath.split(path.sep).join("/");
}

function sanitizeTimestamp(value) {
  return value
    .replace(/\.\d+Z$/, "z")
    .replace(/Z$/, "z")
    .replace(/[:\-]/g, "")
    .replace("T", "t");
}

function renderRecoveryMarkdown(recoveryReport) {
  const lines = [
    `# Recovery Report: ${recoveryReport.recovery_id}`,
    "",
    `Recorded at: ${recoveryReport.recorded_at_utc}`,
    `Failed release: ${recoveryReport.failed_release_id}`,
    `Restored release: ${recoveryReport.restored_release_id}`,
    `Restore reason: ${recoveryReport.restore_reason}`,
    "",
    "## Restored State",
    "",
    `- Current release id: ${recoveryReport.updated_current_release_id}`,
    `- Last-known-good release id: ${recoveryReport.last_known_good_release_id}`,
    `- Publication dir: ${recoveryReport.restored_publication_dir}`,
    `- Public mirror dir: ${recoveryReport.restored_public_mirror_dir}`,
    `- Snapshot manifest: ${recoveryReport.restored_snapshot_manifest_reference}`,
    "",
  ];

  return `${lines.join("\n")}\n`;
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseReleaseRecoveryArgs(argv);
  const results = {};

  if (options.captureSnapshot) {
    results.capture = await captureReleaseRecoverySnapshot(options);
    console.log(`Captured recoverable snapshot for ${results.capture.release_id}`);
  }

  if (options.executeRecovery) {
    results.recovery = await executeReleaseRecovery(options);
    console.log(`Recovered release to ${results.recovery.recovery_report.restored_release_id}`);
  }

  return results;
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
