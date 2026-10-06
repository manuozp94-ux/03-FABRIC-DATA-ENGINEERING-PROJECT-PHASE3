import { copyFile, mkdir, readdir, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  DEFAULT_OUTPUT_DIR,
  OUTPUT_FILENAMES,
  REPO_ROOT,
  readJsonFile,
  writeJsonFile,
} from "./dimension-build-lib.mjs";
import {
  ALLOWED_ARTIFACT_FILENAMES,
  DEFAULT_WEB_CONSUMPTION_DIR,
} from "./sync-current-package-to-public-site.mjs";
import {
  DEFAULT_REPRESENTATIVE_OUTPUT_DIR,
} from "./representative-market-lib.mjs";
import {
  DEFAULT_REPRESENTATIVE_COHERENCE_REPORT_PATH,
} from "../validation/validate-representative-coherence.mjs";

export const DEFAULT_PUBLICATION_SEED_DIR = path.join(
  REPO_ROOT,
  "platform/fabric/publication/seed",
);
export const DEFAULT_CURRENT_PROMOTION_REPORT_PATH = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-publication/current-promotion-report.json",
);

export function parseRepresentativePromotionArgs(argv = process.argv.slice(2)) {
  const parsed = {
    representativeDir: DEFAULT_REPRESENTATIVE_OUTPUT_DIR,
    coherenceReportPath: DEFAULT_REPRESENTATIVE_COHERENCE_REPORT_PATH,
    currentDir: DEFAULT_OUTPUT_DIR,
    seedDir: DEFAULT_PUBLICATION_SEED_DIR,
    mirrorDir: DEFAULT_WEB_CONSUMPTION_DIR,
    reportPath: DEFAULT_CURRENT_PROMOTION_REPORT_PATH,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--") {
      continue;
    }
    if (arg === "--representative-dir") {
      parsed.representativeDir = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--coherence-report") {
      parsed.coherenceReportPath = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--current-dir") {
      parsed.currentDir = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--seed-dir") {
      parsed.seedDir = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--mirror-dir") {
      parsed.mirrorDir = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--report-path") {
      parsed.reportPath = path.resolve(next);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

export async function promoteRepresentativePackageToCurrent(options = {}) {
  const representativeDir = path.resolve(
    options.representativeDir ?? DEFAULT_REPRESENTATIVE_OUTPUT_DIR,
  );
  const coherenceReportPath = path.resolve(
    options.coherenceReportPath ?? DEFAULT_REPRESENTATIVE_COHERENCE_REPORT_PATH,
  );
  const currentDir = path.resolve(options.currentDir ?? DEFAULT_OUTPUT_DIR);
  const seedDir = path.resolve(options.seedDir ?? DEFAULT_PUBLICATION_SEED_DIR);
  const mirrorDir = path.resolve(options.mirrorDir ?? DEFAULT_WEB_CONSUMPTION_DIR);
  const reportPath = path.resolve(
    options.reportPath ?? DEFAULT_CURRENT_PROMOTION_REPORT_PATH,
  );

  assertPromotionBoundary({
    representativeDir,
    currentDir,
    seedDir,
    mirrorDir,
    reportPath,
    unsafeAllowExternalRepresentative: options.unsafeAllowExternalRepresentative,
    unsafeAllowExternalCurrent: options.unsafeAllowExternalCurrent,
    unsafeAllowExternalSeed: options.unsafeAllowExternalSeed,
    unsafeAllowExternalMirror: options.unsafeAllowExternalMirror,
    unsafeAllowExternalReport: options.unsafeAllowExternalReport,
  });

  let coherenceReport;
  try {
    coherenceReport = await readJsonFile(coherenceReportPath);
  } catch (error) {
    const report = {
      promotion_status: "blocked",
      blocking_reason: `Could not read coherence report: ${error.message}`,
      representative_dir: representativeDir,
      current_dir: currentDir,
      seed_dir: seedDir,
      mirror_dir: mirrorDir,
      coherence_report_path: coherenceReportPath,
    };
    await writeJsonFile(reportPath, report);
    return report;
  }

  if (!coherenceReport.promotable) {
    const report = {
      promotion_status: "blocked",
      blocking_reason: "Representative coherence gate is not promotable.",
      representative_dir: representativeDir,
      current_dir: currentDir,
      seed_dir: seedDir,
      mirror_dir: mirrorDir,
      coherence_report_path: coherenceReportPath,
      coherence_identity: coherenceReport.identity ?? {},
    };
    await writeJsonFile(reportPath, report);
    return report;
  }

  if (
    coherenceReport.outputDir
    && path.resolve(coherenceReport.outputDir) !== representativeDir
  ) {
    const report = {
      promotion_status: "blocked",
      blocking_reason:
        "Coherence report does not authorize the requested representative package path.",
      representative_dir: representativeDir,
      current_dir: currentDir,
      seed_dir: seedDir,
      mirror_dir: mirrorDir,
      coherence_report_path: coherenceReportPath,
      coherence_output_dir: coherenceReport.outputDir,
    };
    await writeJsonFile(reportPath, report);
    return report;
  }

  const representativeUnexpected = await findUnexpectedArtifacts(representativeDir);
  const representativeMissing = await findMissingArtifacts(representativeDir);
  if (representativeUnexpected.length > 0 || representativeMissing.length > 0) {
    const report = {
      promotion_status: "blocked",
      blocking_reason: "Representative package is incomplete or contains unexpected artifacts.",
      representative_dir: representativeDir,
      current_dir: currentDir,
      seed_dir: seedDir,
      mirror_dir: mirrorDir,
      coherence_report_path: coherenceReportPath,
      unexpected_artifacts: representativeUnexpected,
      missing_artifacts: representativeMissing,
    };
    await writeJsonFile(reportPath, report);
    return report;
  }

  const promotedCounts = await readPackageCounts(representativeDir);
  const coherenceCountMismatches = Object.entries(promotedCounts)
    .filter(([artifact, count]) => (coherenceReport.counts?.[artifact] ?? count) !== count)
    .map(([artifact, count]) => ({
      artifact,
      expected: coherenceReport.counts?.[artifact] ?? null,
      actual: count,
    }));

  if (coherenceCountMismatches.length > 0) {
    const report = {
      promotion_status: "blocked",
      blocking_reason:
        "Representative package counts no longer match the coherence-approved record.",
      representative_dir: representativeDir,
      current_dir: currentDir,
      seed_dir: seedDir,
      mirror_dir: mirrorDir,
      coherence_report_path: coherenceReportPath,
      coherence_count_mismatches: coherenceCountMismatches,
    };
    await writeJsonFile(reportPath, report);
    return report;
  }

  const currentExists = await directoryExists(currentDir);
  const seedExists = await directoryExists(seedDir);
  if (!seedExists && !currentExists) {
    const report = {
      promotion_status: "blocked",
      blocking_reason:
        "Cannot bootstrap the seed archetype package because no existing current package was found.",
      representative_dir: representativeDir,
      current_dir: currentDir,
      seed_dir: seedDir,
      mirror_dir: mirrorDir,
      coherence_report_path: coherenceReportPath,
    };
    await writeJsonFile(reportPath, report);
    return report;
  }

  const currentParentDir = path.dirname(currentDir);
  const mirrorParentDir = path.dirname(mirrorDir);
  const seedParentDir = path.dirname(seedDir);
  const nonce = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const currentStageDir = path.join(currentParentDir, `.current-stage-${nonce}`);
  const mirrorStageDir = path.join(mirrorParentDir, `.mirror-stage-${nonce}`);
  const seedStageDir = path.join(seedParentDir, `.seed-stage-${nonce}`);
  const currentBackupDir = path.join(currentParentDir, `.current-backup-${nonce}`);
  const mirrorBackupDir = path.join(mirrorParentDir, `.mirror-backup-${nonce}`);

  await mkdir(currentParentDir, { recursive: true });
  await mkdir(mirrorParentDir, { recursive: true });
  await stageApprovedPackage(representativeDir, currentStageDir);
  await stageApprovedPackage(representativeDir, mirrorStageDir);

  let seedBootstrapped = false;
  if (!seedExists) {
    const currentUnexpected = await findUnexpectedArtifacts(currentDir);
    const currentMissing = await findMissingArtifacts(currentDir);
    if (currentUnexpected.length > 0 || currentMissing.length > 0) {
      const report = {
        promotion_status: "blocked",
        blocking_reason:
          "Existing current package cannot be preserved as a seed archetype because it is incomplete or contains unexpected artifacts.",
        representative_dir: representativeDir,
        current_dir: currentDir,
        seed_dir: seedDir,
        mirror_dir: mirrorDir,
        coherence_report_path: coherenceReportPath,
        unexpected_artifacts: currentUnexpected,
        missing_artifacts: currentMissing,
      };
      await safeCleanup([currentStageDir, mirrorStageDir]);
      await writeJsonFile(reportPath, report);
      return report;
    }

    await mkdir(seedParentDir, { recursive: true });
    await stageApprovedPackage(currentDir, seedStageDir);
    seedBootstrapped = true;
  }

  try {
    if (currentExists) {
      await rename(currentDir, currentBackupDir);
    }
    await rename(currentStageDir, currentDir);

    if (await directoryExists(mirrorDir)) {
      await rename(mirrorDir, mirrorBackupDir);
    }
    await rename(mirrorStageDir, mirrorDir);

    if (seedBootstrapped) {
      await rename(seedStageDir, seedDir);
    }

    await safeCleanup([currentBackupDir, mirrorBackupDir]);
  } catch (error) {
    await safeCleanup([currentStageDir, mirrorStageDir, seedStageDir]);
    await rollbackRename(currentDir, currentBackupDir);
    await rollbackRename(mirrorDir, mirrorBackupDir);

    const report = {
      promotion_status: "failed",
      failure_message: error.message,
      representative_dir: representativeDir,
      current_dir: currentDir,
      seed_dir: seedDir,
      mirror_dir: mirrorDir,
      coherence_report_path: coherenceReportPath,
      seed_bootstrapped: seedBootstrapped,
    };
    await writeJsonFile(reportPath, report);
    throw error;
  }

  const report = {
    promotion_status: "promoted_to_current",
    promoted_at_utc: new Date().toISOString(),
    representative_dir: representativeDir,
    current_dir: currentDir,
    seed_dir: seedDir,
    mirror_dir: mirrorDir,
    coherence_report_path: coherenceReportPath,
    coherence_identity: coherenceReport.identity ?? {},
    promoted_counts: promotedCounts,
    seed_bootstrapped: seedBootstrapped,
    legacy_current_reclassified_as: "seed_archetype_source",
    public_surfaces_aligned: [
      "platform/fabric/publication/current",
      "apps/public-site/src/data/publication/current",
      "tests/publication/exploration/publication-explorer.ipynb",
      "platform/fabric/automation/run-fab001-stabilized-proof-refresh.mjs",
    ],
  };
  await writeJsonFile(reportPath, report);
  return report;
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseRepresentativePromotionArgs(argv);
  const report = await promoteRepresentativePackageToCurrent(options);

  console.log(`Promotion status: ${report.promotion_status}`);
  console.log(`Wrote report: ${options.reportPath ?? DEFAULT_CURRENT_PROMOTION_REPORT_PATH}`);
  if (report.promoted_counts) {
    for (const [artifact, count] of Object.entries(report.promoted_counts)) {
      console.log(`- ${artifact}: ${count} rows`);
    }
  }
  if (report.blocking_reason) {
    console.error(report.blocking_reason);
  }
  return report;
}

async function stageApprovedPackage(sourceDir, stageDir) {
  await mkdir(stageDir, { recursive: true });
  for (const filename of ALLOWED_ARTIFACT_FILENAMES) {
    await copyFile(path.join(sourceDir, filename), path.join(stageDir, filename));
  }
}

async function readPackageCounts(sourceDir) {
  const entries = await Promise.all(
    ALLOWED_ARTIFACT_FILENAMES.map(async (filename) => [
      filename.replace(/\.json$/, ""),
      (await readJsonFile(path.join(sourceDir, filename))).length,
    ]),
  );

  return Object.fromEntries(entries);
}

async function findUnexpectedArtifacts(sourceDir) {
  const directoryEntries = await readdir(sourceDir, { withFileTypes: true });

  return directoryEntries
    .filter(
      (entry) =>
        !entry.isFile() || !ALLOWED_ARTIFACT_FILENAMES.includes(entry.name),
    )
    .map((entry) => entry.name)
    .sort();
}

async function findMissingArtifacts(sourceDir) {
  const directoryEntries = await readdir(sourceDir, { withFileTypes: true });
  const presentArtifacts = new Set(
    directoryEntries.filter((entry) => entry.isFile()).map((entry) => entry.name),
  );

  return ALLOWED_ARTIFACT_FILENAMES.filter((filename) => !presentArtifacts.has(filename));
}

async function directoryExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function rollbackRename(activeDir, backupDir) {
  const activeExists = await directoryExists(activeDir);
  const backupExists = await directoryExists(backupDir);
  if (!backupExists) {
    return;
  }
  if (activeExists) {
    await rm(activeDir, { recursive: true, force: true });
  }
  await rename(backupDir, activeDir);
}

async function safeCleanup(paths) {
  await Promise.all(paths.map((targetPath) => rm(targetPath, { recursive: true, force: true })));
}

function assertPromotionBoundary({
  representativeDir,
  currentDir,
  seedDir,
  mirrorDir,
  reportPath,
  unsafeAllowExternalRepresentative = false,
  unsafeAllowExternalCurrent = false,
  unsafeAllowExternalSeed = false,
  unsafeAllowExternalMirror = false,
  unsafeAllowExternalReport = false,
}) {
  if (
    !unsafeAllowExternalRepresentative
    && representativeDir !== path.resolve(DEFAULT_REPRESENTATIVE_OUTPUT_DIR)
  ) {
    throw new Error(`Refusing to promote from non-approved representative source: ${representativeDir}`);
  }

  if (!unsafeAllowExternalCurrent && currentDir !== path.resolve(DEFAULT_OUTPUT_DIR)) {
    throw new Error(`Refusing to replace non-approved current package path: ${currentDir}`);
  }

  if (!unsafeAllowExternalSeed && seedDir !== path.resolve(DEFAULT_PUBLICATION_SEED_DIR)) {
    throw new Error(`Refusing to write seed archetype package outside the approved boundary: ${seedDir}`);
  }

  if (!unsafeAllowExternalMirror && mirrorDir !== path.resolve(DEFAULT_WEB_CONSUMPTION_DIR)) {
    throw new Error(`Refusing to replace non-approved public mirror path: ${mirrorDir}`);
  }

  if (
    !unsafeAllowExternalReport
    && reportPath !== path.resolve(DEFAULT_CURRENT_PROMOTION_REPORT_PATH)
  ) {
    throw new Error(`Refusing to write promotion report outside the approved boundary: ${reportPath}`);
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
