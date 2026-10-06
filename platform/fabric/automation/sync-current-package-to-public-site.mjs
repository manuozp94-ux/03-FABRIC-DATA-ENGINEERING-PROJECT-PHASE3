import { copyFile, mkdir, readdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  DEFAULT_OUTPUT_DIR,
  DEFAULT_SOURCE_DIR,
  OUTPUT_FILENAMES,
  REPO_ROOT,
  readJsonFile,
} from "./dimension-build-lib.mjs";
import { OPERATING_LOOP_PUBLIC_FILENAMES } from "./operating-loop-lib.mjs";
import { validatePublicationDimensions } from "../validation/validate-dimensions.mjs";

export const DEFAULT_WEB_CONSUMPTION_DIR = path.join(
  REPO_ROOT,
  "apps/public-site/src/data/publication/current",
);
export const DEFAULT_CURRENT_PROMOTION_REPORT_PATH = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-publication/current-promotion-report.json",
);
export const TRANSITION_NOTE =
  "Transitional sync only: repo current is the approved Bronze input package today; target public truth should come from a Fabric-derived serving extract.";

export const ALLOWED_ARTIFACT_FILENAMES = [
  ...Object.values(OUTPUT_FILENAMES),
  ...Object.values(OPERATING_LOOP_PUBLIC_FILENAMES),
].sort();
export const REQUIRED_ARTIFACT_FILENAMES = Object.values(OUTPUT_FILENAMES).sort();

export async function syncCurrentPackageToPublicSite(options = {}) {
  const sourcePackageDir = path.resolve(options.sourcePackageDir ?? DEFAULT_OUTPUT_DIR);
  const sourceInputDir = path.resolve(options.sourceInputDir ?? DEFAULT_SOURCE_DIR);
  const destinationDir = path.resolve(options.destinationDir ?? DEFAULT_WEB_CONSUMPTION_DIR);
  const currentPromotionReportPath = path.resolve(
    options.currentPromotionReportPath ?? DEFAULT_CURRENT_PROMOTION_REPORT_PATH,
  );
  const destinationParentDir = path.dirname(destinationDir);
  const stageDir = path.join(
    destinationParentDir,
    `.current-stage-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  );

  assertApprovedSyncBoundary({
    sourcePackageDir,
    destinationDir,
    unsafeAllowExternalSource: options.unsafeAllowExternalSource,
    unsafeAllowExternalDestination: options.unsafeAllowExternalDestination,
  });

  const validationReport = await validateApprovedCurrentPackage({
    sourceDir: sourceInputDir,
    outputDir: sourcePackageDir,
    currentPromotionReportPath,
  });
  if (validationReport.errors.length > 0) {
    throw new Error(
      `Refusing to sync invalid publication package:\n${validationReport.errors.join("\n")}`,
    );
  }

  const unexpectedArtifacts = await findUnexpectedArtifacts(sourcePackageDir);
  if (unexpectedArtifacts.length > 0) {
    throw new Error(
      `Refusing to sync unexpected artifacts from current package: ${unexpectedArtifacts.join(", ")}`,
    );
  }

  const missingArtifacts = await findMissingArtifacts(sourcePackageDir);
  if (missingArtifacts.length > 0) {
    throw new Error(
      `Refusing to sync incomplete current package: missing ${missingArtifacts.join(", ")}`,
    );
  }

  await mkdir(destinationParentDir, { recursive: true });
  await mkdir(stageDir, { recursive: true });

  try {
    const filenamesToSync = await findPresentAllowedArtifacts(sourcePackageDir);
    for (const filename of filenamesToSync) {
      await copyFile(path.join(sourcePackageDir, filename), path.join(stageDir, filename));
    }

    await rm(destinationDir, { recursive: true, force: true });
    await rename(stageDir, destinationDir);
  } catch (error) {
    await rm(stageDir, { recursive: true, force: true });
    throw error;
  }

  return {
    sourcePackageDir,
    sourceInputDir,
    currentPromotionReportPath,
    destinationDir,
    syncedArtifacts: await findPresentAllowedArtifacts(sourcePackageDir),
    counts: validationReport.counts,
  };
}

function assertApprovedSyncBoundary({
  sourcePackageDir,
  destinationDir,
  unsafeAllowExternalSource = false,
  unsafeAllowExternalDestination = false,
}) {
  if (
    !unsafeAllowExternalSource &&
    sourcePackageDir !== path.resolve(DEFAULT_OUTPUT_DIR)
  ) {
    throw new Error(
      `Refusing to sync from non-approved source package: ${sourcePackageDir}`,
    );
  }

  if (
    !unsafeAllowExternalDestination &&
    destinationDir !== path.resolve(DEFAULT_WEB_CONSUMPTION_DIR)
  ) {
    throw new Error(
      `Refusing to sync to non-approved destination mirror: ${destinationDir}`,
    );
  }
}

async function findUnexpectedArtifacts(sourcePackageDir) {
  const directoryEntries = await readdir(sourcePackageDir, { withFileTypes: true });

  return directoryEntries
    .filter(
      (entry) =>
        !entry.isFile() || !ALLOWED_ARTIFACT_FILENAMES.includes(entry.name),
    )
    .map((entry) => entry.name)
    .sort();
}

async function findMissingArtifacts(sourcePackageDir) {
  const directoryEntries = await readdir(sourcePackageDir, { withFileTypes: true });
  const presentArtifacts = new Set(
    directoryEntries.filter((entry) => entry.isFile()).map((entry) => entry.name),
  );

  return REQUIRED_ARTIFACT_FILENAMES.filter((filename) => !presentArtifacts.has(filename));
}

async function findPresentAllowedArtifacts(sourcePackageDir) {
  const directoryEntries = await readdir(sourcePackageDir, { withFileTypes: true });
  const presentArtifacts = new Set(
    directoryEntries.filter((entry) => entry.isFile()).map((entry) => entry.name),
  );

  return ALLOWED_ARTIFACT_FILENAMES.filter((filename) => presentArtifacts.has(filename));
}

async function validateApprovedCurrentPackage({
  sourceDir,
  outputDir,
  currentPromotionReportPath,
}) {
  const shouldTryPromotedValidation =
    outputDir === path.resolve(DEFAULT_OUTPUT_DIR)
    || currentPromotionReportPath !== path.resolve(DEFAULT_CURRENT_PROMOTION_REPORT_PATH);

  if (shouldTryPromotedValidation) {
    const promotedValidation = await validatePromotedCanonicalCurrent({
      outputDir,
      currentPromotionReportPath,
    });
    if (promotedValidation !== null) {
      return promotedValidation;
    }
  }

  return validatePublicationDimensions({
    sourceDir,
    outputDir,
  });
}

async function validatePromotedCanonicalCurrent({ outputDir, currentPromotionReportPath }) {
  let promotionReport;
  try {
    promotionReport = await readJsonFile(currentPromotionReportPath);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }

  if (promotionReport.promotion_status !== "promoted_to_current") {
    throw new Error(
      `Refusing to sync canonical current package without a successful promotion receipt: ${currentPromotionReportPath}`,
    );
  }

  if (
    promotionReport.current_dir
    && path.resolve(promotionReport.current_dir) !== outputDir
  ) {
    throw new Error(
      `Promotion receipt does not authorize current package path ${outputDir}.`,
    );
  }

  const counts = Object.fromEntries(
    await Promise.all(
      Object.entries(OUTPUT_FILENAMES).map(async ([artifact, filename]) => [
        artifact,
        (await readJsonFile(path.join(outputDir, filename))).length,
      ]),
    ),
  );

  const countMismatches = Object.entries(counts).filter(
    ([artifact, count]) => (promotionReport.promoted_counts?.[artifact] ?? count) !== count,
  );

  if (countMismatches.length > 0) {
    throw new Error(
      `Refusing to sync canonical current package because promotion receipt counts no longer match: ${countMismatches
        .map(([artifact, count]) => `${artifact}=${count}`)
        .join(", ")}`,
    );
  }

  return {
    outputDir,
    sourceDir: currentPromotionReportPath,
    diagnostics: [],
    errors: [],
    counts,
  };
}

async function main(argv = process.argv.slice(2)) {
  const parsed = parseSyncArgs(argv);
  const result = await syncCurrentPackageToPublicSite(parsed);

  console.log(`Synced approved publication package to ${result.destinationDir}`);
  console.log(`Note: ${TRANSITION_NOTE}`);
  for (const [artifact, count] of Object.entries(result.counts)) {
    console.log(`- ${artifact}: ${count} rows`);
  }
}

function parseSyncArgs(argv) {
  const parsed = {
    sourcePackageDir: DEFAULT_OUTPUT_DIR,
    sourceInputDir: DEFAULT_SOURCE_DIR,
    destinationDir: DEFAULT_WEB_CONSUMPTION_DIR,
    currentPromotionReportPath: DEFAULT_CURRENT_PROMOTION_REPORT_PATH,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--") {
      continue;
    }
    if (arg === "--source-package") {
      parsed.sourcePackageDir = next;
      index += 1;
      continue;
    }
    if (arg === "--source-input") {
      parsed.sourceInputDir = next;
      index += 1;
      continue;
    }
    if (arg === "--destination") {
      parsed.destinationDir = next;
      index += 1;
      continue;
    }
    if (arg === "--current-promotion-report") {
      parsed.currentPromotionReportPath = next;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

const isEntrypoint =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isEntrypoint) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
