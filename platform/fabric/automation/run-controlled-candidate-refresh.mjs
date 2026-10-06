import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { REPO_ROOT } from "./dimension-build-lib.mjs";
import {
  DEFAULT_APPROVED_PUBLICATION_DIR,
  DEFAULT_CANDIDATE_OUTPUT_DIR,
  buildControlledCandidatePackageToDirectory,
  parseControlledRefreshArgs,
} from "./controlled-candidate-refresh-lib.mjs";
import { DEFAULT_GENERATION_CONTROLS_DIR } from "./generation-controls-lib.mjs";
import { DEFAULT_WEB_CONSUMPTION_DIR } from "./sync-current-package-to-public-site.mjs";
import { validateControlledCandidatePublicationPackage } from "../validation/validate-controlled-candidate-refresh.mjs";

const DEFAULT_CANDIDATE_ROOT = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-candidate",
);
const DEFAULT_VALIDATION_REPORT_PATH = path.join(
  DEFAULT_CANDIDATE_ROOT,
  "candidate-refresh-report.json",
);

export async function runControlledCandidateRefresh(
  argv = process.argv.slice(2),
  options = {},
) {
  const parsed = parseControlledRefreshArgs(argv);
  const approvedDir = parsed.approvedDir ?? DEFAULT_APPROVED_PUBLICATION_DIR;
  const controlsDir = parsed.controlsDir ?? DEFAULT_GENERATION_CONTROLS_DIR;
  const outputDir = parsed.outputDir ?? DEFAULT_CANDIDATE_OUTPUT_DIR;
  const loadTimestampUtc = parsed.loadTimestampUtc ?? new Date().toISOString();
  const reportPath = path.resolve(
    options.reportPath ?? DEFAULT_VALIDATION_REPORT_PATH,
  );
  const approvedCurrentDir = path.resolve(
    options.approvedCurrentDir ?? DEFAULT_APPROVED_PUBLICATION_DIR,
  );
  const publicMirrorDir = path.resolve(
    options.publicMirrorDir ?? DEFAULT_WEB_CONSUMPTION_DIR,
  );
  const quiet = options.quiet ?? false;
  const setProcessExitCode = options.setProcessExitCode ?? true;

  try {
    const buildResult = await buildControlledCandidatePackageToDirectory({
      approvedDir,
      controlsDir,
      outputDir,
      reportPath: options.buildReportPath,
      windowDays: parsed.windowDays,
      loadTimestampUtc,
    });

    return evaluateControlledCandidatePublicationPackage({
      sourceDir: options.sourceDir,
      approvedDir,
      candidateDir: outputDir,
      controlsDir,
      reportPath,
      approvedCurrentDir,
      publicMirrorDir,
      loadTimestampUtc,
      buildReportPath: buildResult.reportPath,
      generatedMetadata: buildResult.candidatePackage.metadata,
      quiet,
      setProcessExitCode,
    });
  } catch (error) {
    const candidateReport = buildControlledCandidateReport({
      sourceDir: options.sourceDir ?? null,
      approvedDir,
      controlsDir,
      outputDir,
      reportPath,
      approvedCurrentDir,
      publicMirrorDir,
      loadTimestampUtc,
      diagnostics: [
        {
          rule_id: "artifact.candidate_build_failed",
          artifact: "controlled_candidate_build",
          severity: "error",
          blocking: true,
          message: error.message,
        },
      ],
      counts: {},
      generatedRowCounts: {},
      buildReportPath: options.buildReportPath ?? null,
      generatedMetadata: null,
    });

    await persistCandidateReport(candidateReport);

    if (!quiet) {
      console.error(`Controlled candidate refresh blocked: ${loadTimestampUtc}`);
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

export async function evaluateControlledCandidatePublicationPackage(options = {}) {
  const sourceDir = options.sourceDir ?? undefined;
  const approvedDir = path.resolve(options.approvedDir ?? DEFAULT_APPROVED_PUBLICATION_DIR);
  const candidateDir = path.resolve(options.candidateDir ?? DEFAULT_CANDIDATE_OUTPUT_DIR);
  const controlsDir = path.resolve(options.controlsDir ?? DEFAULT_GENERATION_CONTROLS_DIR);
  const reportPath = path.resolve(options.reportPath ?? DEFAULT_VALIDATION_REPORT_PATH);
  const approvedCurrentDir = path.resolve(
    options.approvedCurrentDir ?? DEFAULT_APPROVED_PUBLICATION_DIR,
  );
  const publicMirrorDir = path.resolve(
    options.publicMirrorDir ?? DEFAULT_WEB_CONSUMPTION_DIR,
  );
  const loadTimestampUtc = options.loadTimestampUtc ?? new Date().toISOString();
  const quiet = options.quiet ?? false;
  const setProcessExitCode = options.setProcessExitCode ?? false;

  const validation = await validateControlledCandidatePublicationPackage({
    sourceDir,
    approvedDir,
    candidateDir,
    controlsDir,
  });
  const candidateReport = buildControlledCandidateReport({
    sourceDir: validation.sourceDir,
    approvedDir,
    controlsDir,
    outputDir: candidateDir,
    reportPath,
    approvedCurrentDir,
    publicMirrorDir,
    loadTimestampUtc,
    diagnostics: validation.diagnostics,
    counts: validation.counts,
    generatedRowCounts: validation.generated_row_counts,
    buildReportPath: options.buildReportPath ?? null,
    generatedMetadata: options.generatedMetadata ?? null,
  });

  await persistCandidateReport(candidateReport);

  if (candidateReport.validation_passed) {
    if (!quiet) {
      console.log(`Controlled candidate refresh passed: ${loadTimestampUtc}`);
      console.log(`- approved: ${candidateReport.approved_dir}`);
      console.log(`- controls: ${candidateReport.controls_dir}`);
      console.log(`- output: ${candidateReport.output_dir}`);
      console.log(`- report: ${candidateReport.report_path}`);
      console.log("- promotion: blocked by design until an approved release step exists");
    }
    return candidateReport;
  }

  if (!quiet) {
    console.error(`Controlled candidate refresh blocked: ${loadTimestampUtc}`);
    for (const validationError of candidateReport.validation_errors) {
      console.error(`- ${validationError}`);
    }
  }
  if (setProcessExitCode) {
    process.exitCode = 1;
  }
  return candidateReport;
}

function buildControlledCandidateReport({
  sourceDir,
  approvedDir,
  controlsDir,
  outputDir,
  reportPath,
  approvedCurrentDir,
  publicMirrorDir,
  loadTimestampUtc,
  diagnostics,
  counts,
  generatedRowCounts,
  buildReportPath,
  generatedMetadata,
}) {
  const blockingDiagnostics = diagnostics.filter((diagnostic) => diagnostic.blocking);
  const validationErrors = diagnostics
    .filter((diagnostic) => diagnostic.severity === "error")
    .map(formatCandidateDiagnosticMessage);
  const validationPassed = blockingDiagnostics.length === 0;

  return {
    run_type: "controlled_candidate_refresh",
    promoted: false,
    candidate_status: validationPassed ? "validated_not_promoted" : "blocked",
    source_dir: sourceDir,
    approved_dir: approvedDir,
    controls_dir: controlsDir,
    output_dir: outputDir,
    report_path: reportPath,
    build_report_path: buildReportPath,
    load_timestamp_utc: loadTimestampUtc,
    validation_passed: validationPassed,
    blocking_failure_count: blockingDiagnostics.length,
    blocking_reason_summary: validationErrors[0] ?? null,
    diagnostics,
    validation_errors: validationErrors,
    row_counts: counts,
    generated_row_counts: generatedRowCounts,
    generated_metadata: generatedMetadata,
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
  runControlledCandidateRefresh().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
