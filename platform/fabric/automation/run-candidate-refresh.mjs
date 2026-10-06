import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  DEFAULT_SOURCE_DIR,
  REPO_ROOT,
  buildDimensionsToDirectory,
  parseBuildArgs,
} from "./dimension-build-lib.mjs";
import { DEFAULT_WEB_CONSUMPTION_DIR } from "./sync-current-package-to-public-site.mjs";
import { validatePublicationDimensions } from "../validation/validate-dimensions.mjs";

const DEFAULT_CANDIDATE_ROOT = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-candidate",
);
const DEFAULT_CANDIDATE_OUTPUT_DIR = path.join(DEFAULT_CANDIDATE_ROOT, "current");
const DEFAULT_REPORT_PATH = path.join(
  DEFAULT_CANDIDATE_ROOT,
  "candidate-refresh-report.json",
);
const DEFAULT_APPROVED_CURRENT_DIR = path.join(
  REPO_ROOT,
  "platform/fabric/publication/current",
);

export async function runCandidateRefresh(argv = process.argv.slice(2), options = {}) {
  const parsed = parseBuildArgs(argv);
  const hasExplicitInput = argv.includes("--input");
  const hasExplicitOutput = argv.includes("--output");
  const sourceDir = parsed.sourceDir ?? DEFAULT_SOURCE_DIR;
  const outputDir = hasExplicitOutput
    ? parsed.outputDir
    : DEFAULT_CANDIDATE_OUTPUT_DIR;
  const loadTimestampUtc = parsed.loadTimestampUtc ?? new Date().toISOString();
  const reportPath = path.resolve(options.reportPath ?? DEFAULT_REPORT_PATH);
  const approvedCurrentDir = path.resolve(
    options.approvedCurrentDir ?? DEFAULT_APPROVED_CURRENT_DIR,
  );
  const publicMirrorDir = path.resolve(
    options.publicMirrorDir ?? DEFAULT_WEB_CONSUMPTION_DIR,
  );
  const setProcessExitCode = options.setProcessExitCode ?? true;
  const quiet = options.quiet ?? false;

  try {
    await buildDimensionsToDirectory({
      sourceDir: hasExplicitInput ? sourceDir : DEFAULT_SOURCE_DIR,
      outputDir,
      loadTimestampUtc,
    });

    return evaluateCandidatePublicationPackage({
      sourceDir: hasExplicitInput ? sourceDir : DEFAULT_SOURCE_DIR,
      outputDir,
      reportPath,
      approvedCurrentDir,
      publicMirrorDir,
      loadTimestampUtc,
      setProcessExitCode,
      quiet,
    });
  } catch (error) {
    const candidateReport = buildCandidateReport({
      sourceDir: hasExplicitInput ? sourceDir : DEFAULT_SOURCE_DIR,
      outputDir,
      reportPath,
      approvedCurrentDir,
      publicMirrorDir,
      loadTimestampUtc,
      diagnostics: [
        {
          rule_id: "artifact.candidate_build_failed",
          artifact: "candidate_build",
          severity: "error",
          blocking: true,
          message: error.message,
        },
      ],
      counts: {},
    });

    await persistCandidateReport(candidateReport);

    if (!quiet) {
      console.error(`Candidate refresh blocked: ${loadTimestampUtc}`);
      for (const validationError of candidateReport.validation_errors) {
        console.error(`- ${validationError}`);
      }
    }
    if (setProcessExitCode) {
      process.exitCode = 1;
    }
    return candidateReport;
  }
}

export async function evaluateCandidatePublicationPackage(options = {}) {
  const sourceDir = path.resolve(options.sourceDir ?? DEFAULT_SOURCE_DIR);
  const outputDir = path.resolve(options.outputDir ?? DEFAULT_CANDIDATE_OUTPUT_DIR);
  const reportPath = path.resolve(options.reportPath ?? DEFAULT_REPORT_PATH);
  const loadTimestampUtc = options.loadTimestampUtc ?? new Date().toISOString();
  const approvedCurrentDir = path.resolve(
    options.approvedCurrentDir ?? DEFAULT_APPROVED_CURRENT_DIR,
  );
  const publicMirrorDir = path.resolve(
    options.publicMirrorDir ?? DEFAULT_WEB_CONSUMPTION_DIR,
  );
  const setProcessExitCode = options.setProcessExitCode ?? false;
  const quiet = options.quiet ?? false;

  const validation = await getCandidateValidationOutcome({
    sourceDir,
    outputDir,
  });
  const blockingDiagnostics = validation.diagnostics.filter(
    (diagnostic) => diagnostic.blocking,
  );
  const validationPassed = blockingDiagnostics.length === 0;
  const candidateReport = buildCandidateReport({
    sourceDir,
    outputDir,
    reportPath,
    approvedCurrentDir,
    publicMirrorDir,
    loadTimestampUtc,
    diagnostics: validation.diagnostics,
    counts: validation.counts,
  });

  await persistCandidateReport(candidateReport);

  if (candidateReport.validation_passed) {
    if (!quiet) {
      console.log(`Candidate refresh passed: ${loadTimestampUtc}`);
      console.log(`- source: ${candidateReport.source_dir}`);
      console.log(`- output: ${candidateReport.output_dir}`);
      console.log(`- report: ${reportPath}`);
      console.log("- promotion: blocked by design until an approved release step exists");
    }
    return candidateReport;
  }

  if (!quiet) {
    console.error(`Candidate refresh blocked: ${loadTimestampUtc}`);
    for (const error of candidateReport.validation_errors) {
      console.error(`- ${error}`);
    }
  }
  if (setProcessExitCode) {
    process.exitCode = 1;
  }
  return candidateReport;
}

async function getCandidateValidationOutcome({ sourceDir, outputDir }) {
  try {
    return await validatePublicationDimensions({
      sourceDir,
      outputDir,
    });
  } catch (error) {
    const diagnostic = {
      rule_id: "artifact.package_unreadable",
      artifact: "publication_package",
      severity: "error",
      blocking: true,
      message: error.message,
    };

    return {
      sourceDir,
      outputDir,
      diagnostics: [diagnostic],
      errors: [`[${diagnostic.rule_id}] ${diagnostic.artifact}: ${diagnostic.message}`],
      counts: {},
    };
  }
}

function buildCandidateReport({
  sourceDir,
  outputDir,
  reportPath,
  approvedCurrentDir,
  publicMirrorDir,
  loadTimestampUtc,
  diagnostics,
  counts,
}) {
  const blockingDiagnostics = diagnostics.filter((diagnostic) => diagnostic.blocking);
  const validationErrors = diagnostics
    .filter((diagnostic) => diagnostic.severity === "error")
    .map(formatCandidateDiagnosticMessage);
  const validationPassed = blockingDiagnostics.length === 0;

  return {
    run_type: "candidate_refresh",
    promoted: false,
    candidate_status: validationPassed ? "validated_not_promoted" : "blocked",
    source_dir: sourceDir,
    output_dir: outputDir,
    report_path: reportPath,
    load_timestamp_utc: loadTimestampUtc,
    validation_passed: validationPassed,
    blocking_failure_count: blockingDiagnostics.length,
    blocking_reason_summary: validationErrors[0] ?? null,
    diagnostics,
    validation_errors: validationErrors,
    row_counts: counts,
    active_baseline: {
      current_package_dir: approvedCurrentDir,
      public_mirror_dir: publicMirrorDir,
      preserved: true,
    },
  };
}

async function persistCandidateReport(candidateReport) {
  await mkdir(path.dirname(candidateReport.report_path), { recursive: true });
  await writeFile(
    candidateReport.report_path,
    `${JSON.stringify(candidateReport, null, 2)}\n`,
    "utf8",
  );
}

function formatCandidateDiagnosticMessage(diagnostic) {
  return `[${diagnostic.rule_id}] ${diagnostic.artifact}: ${diagnostic.message}`;
}

const isEntrypoint =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isEntrypoint) {
  runCandidateRefresh().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
