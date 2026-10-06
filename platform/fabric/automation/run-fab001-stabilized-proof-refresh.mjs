import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import {
  DEFAULT_OUTPUT_DIR,
  REPO_ROOT,
  readJsonFile,
  writeJsonFile,
} from "./dimension-build-lib.mjs";
import {
  DEFAULT_REPRESENTATIVE_COHERENCE_REPORT_PATH,
} from "../validation/validate-representative-coherence.mjs";
import {
  DEFAULT_FINANCIAL_CONTROLS_DIR,
  DEFAULT_FINANCIAL_FOUNDATION_DIR,
} from "./financial-analytics-lib.mjs";

const execFileAsync = promisify(execFile);

export const DEFAULT_FABRIC_PROOF_OUTPUT_DIR = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-proof/fab001/current",
);
export const DEFAULT_FABRIC_PROOF_REPORT_PATH = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-proof/fab001/stabilized-refresh-report.json",
);
export const DEFAULT_SEMANTIC_OUTPUT_DIR = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-proof/fab001/semantic-model-live",
);
export const DEFAULT_REPORT_SHELL_OUTPUT_DIR = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-proof/fab001/report-live",
);

export function parseFab001StabilizedRefreshArgs(argv = process.argv.slice(2)) {
  const parsed = {
    publicationDir: DEFAULT_OUTPUT_DIR,
    coherenceReportPath: DEFAULT_REPRESENTATIVE_COHERENCE_REPORT_PATH,
    proofOutputDir: DEFAULT_FABRIC_PROOF_OUTPUT_DIR,
    semanticOutputDir: DEFAULT_SEMANTIC_OUTPUT_DIR,
    reportShellOutputDir: DEFAULT_REPORT_SHELL_OUTPUT_DIR,
    reportPath: DEFAULT_FABRIC_PROOF_REPORT_PATH,
    financialFoundationDir: null,
    financialControlsDir: null,
    skipLive: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--") {
      continue;
    }
    if (arg === "--publication-dir") {
      parsed.publicationDir = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--coherence-report") {
      parsed.coherenceReportPath = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--proof-output-dir") {
      parsed.proofOutputDir = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--semantic-output-dir") {
      parsed.semanticOutputDir = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--report-shell-output-dir") {
      parsed.reportShellOutputDir = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--report-path") {
      parsed.reportPath = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--financial-foundation-dir") {
      parsed.financialFoundationDir = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--financial-controls-dir") {
      parsed.financialControlsDir = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--skip-live") {
      parsed.skipLive = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

export async function runFab001StabilizedProofRefresh(options = {}) {
  const publicationDir = options.publicationDir ?? DEFAULT_OUTPUT_DIR;
  const coherenceReportPath =
    options.coherenceReportPath ?? DEFAULT_REPRESENTATIVE_COHERENCE_REPORT_PATH;
  const proofOutputDir = options.proofOutputDir ?? DEFAULT_FABRIC_PROOF_OUTPUT_DIR;
  const semanticOutputDir = options.semanticOutputDir ?? DEFAULT_SEMANTIC_OUTPUT_DIR;
  const reportShellOutputDir =
    options.reportShellOutputDir ?? DEFAULT_REPORT_SHELL_OUTPUT_DIR;
  const reportPath = options.reportPath ?? DEFAULT_FABRIC_PROOF_REPORT_PATH;
  const financialFoundationDir =
    options.financialFoundationDir
    ?? (
      shouldUseDefaultFinancialFoundation(publicationDir)
        ? DEFAULT_FINANCIAL_FOUNDATION_DIR
        : null
    );
  const financialControlsDir =
    options.financialControlsDir
    ?? (
      shouldUseDefaultFinancialFoundation(publicationDir)
        ? DEFAULT_FINANCIAL_CONTROLS_DIR
        : null
    );
  const skipLive = options.skipLive ?? false;

  let coherenceReport;
  try {
    coherenceReport = await readJsonFile(coherenceReportPath);
  } catch (error) {
    const report = {
      run_type: "fab001_stabilized_proof_refresh",
      refresh_status: "blocked",
      publication_dir: publicationDir,
      coherence_report_path: coherenceReportPath,
      blocking_reason: error.message,
      live_steps_executed: false,
      skip_live: skipLive,
    };
    await writeJsonFile(reportPath, report);
    throw new Error(`Could not read coherence report: ${error.message}`);
  }

  if (!coherenceReport.promotable) {
    const report = {
      run_type: "fab001_stabilized_proof_refresh",
      refresh_status: "blocked",
      publication_dir: publicationDir,
      coherence_report_path: coherenceReportPath,
      coherence_status: coherenceReport.promotion_status,
      blocking_reason: "Representative coherence gate is not promotable.",
      live_steps_executed: false,
      skip_live: skipLive,
    };
    await writeJsonFile(reportPath, report);
    return report;
  }

  const steps = [];

  try {
    if (financialFoundationDir) {
      const financialArgs = [
        "platform/fabric/automation/materialize-financial-analytics-foundation.mjs",
        "--input",
        publicationDir,
        "--output",
        financialFoundationDir,
      ];
      if (financialControlsDir) {
        financialArgs.push("--controls", financialControlsDir);
      }
      steps.push(await runNodeStep(financialArgs));
    }

    const lakehouseLandingArgs = [
      "05-compat/scripts/land_fab001_lakehouse_tables.py",
      "--publication-dir",
      publicationDir,
      "--output-dir",
      proofOutputDir,
    ];
    if (financialFoundationDir) {
      lakehouseLandingArgs.push("--financial-foundation-dir", financialFoundationDir);
    }
    steps.push(
      await runPythonStep(lakehouseLandingArgs),
    );

    if (!skipLive) {
      const liveLakehouseArgs = [
        "05-compat/scripts/land_fab001_lakehouse_tables.py",
        "--publication-dir",
        publicationDir,
        "--output-dir",
        proofOutputDir,
        "--upload-bundle",
        "--create-loader-notebook",
        "--run-loader-notebook",
      ];
      if (financialFoundationDir) {
        liveLakehouseArgs.push("--financial-foundation-dir", financialFoundationDir);
      }
      steps.push(
        await runPythonStep(liveLakehouseArgs),
      );
      steps.push(
        await runPythonStep([
          "05-compat/scripts/materialize_fab001_semantic_model.py",
          "--output-dir",
          semanticOutputDir,
        ]),
      );
      steps.push(
        await runPythonStep([
          "05-compat/scripts/materialize_fab001_report_shell.py",
          "--output-dir",
          reportShellOutputDir,
        ]),
      );
    }

    const manifest = await safeReadJson(path.join(proofOutputDir, "manifest.json"));
    const semanticReport = await safeReadJson(
      path.join(semanticOutputDir, "materialization-report.json"),
    );
    const reportShellReport = await safeReadJson(
      path.join(reportShellOutputDir, "report-shell-report.json"),
    );

    const report = {
      run_type: "fab001_stabilized_proof_refresh",
      refresh_status: skipLive ? "preflight_ready" : "live_refresh_completed",
      publication_dir: publicationDir,
      coherence_report_path: coherenceReportPath,
      coherence_identity: coherenceReport.identity ?? {},
      skip_live: skipLive,
      live_steps_executed: !skipLive,
      steps,
      manifest,
      semantic_model_report: semanticReport,
      report_shell_report: reportShellReport,
    };

    await writeJsonFile(reportPath, report);
    return report;
  } catch (error) {
    const report = {
      run_type: "fab001_stabilized_proof_refresh",
      refresh_status: "failed",
      publication_dir: publicationDir,
      coherence_report_path: coherenceReportPath,
      coherence_identity: coherenceReport.identity ?? {},
      skip_live: skipLive,
      live_steps_executed: !skipLive,
      steps,
      failure_message: error.message,
    };
    await writeJsonFile(reportPath, report);
    throw error;
  }
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseFab001StabilizedRefreshArgs(argv);
  const report = await runFab001StabilizedProofRefresh(options);

  console.log(`Fabric proof refresh status: ${report.refresh_status}`);
  console.log(`Wrote report: ${options.reportPath ?? DEFAULT_FABRIC_PROOF_REPORT_PATH}`);
  return report;
}

async function runPythonStep(args) {
  const { stdout, stderr } = await execFileAsync("python3", args, {
    cwd: REPO_ROOT,
    env: process.env,
  });

  return {
    command: ["python3", ...args].join(" "),
    stdout: stdout.trim(),
    stderr: stderr.trim(),
  };
}

async function runNodeStep(args) {
  const { stdout, stderr } = await execFileAsync("node", args, {
    cwd: REPO_ROOT,
    env: process.env,
  });

  return {
    command: ["node", ...args].join(" "),
    stdout: stdout.trim(),
    stderr: stderr.trim(),
  };
}

function shouldUseDefaultFinancialFoundation(publicationDir) {
  return path.resolve(publicationDir) === path.resolve(DEFAULT_OUTPUT_DIR);
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
