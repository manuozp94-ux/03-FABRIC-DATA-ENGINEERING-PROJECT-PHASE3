#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const steps = [
  {
    label: "Materialize financial analytics foundation",
    command: "node",
    args: ["platform/fabric/automation/materialize-financial-analytics-foundation.mjs"],
  },
  {
    label: "Materialize bounded Fabric public serving extract",
    command: "node",
    args: ["platform/fabric/automation/materialize-fabric-public-serving-extract.mjs"],
  },
  {
    label: "Refresh runtime-governance preview",
    command: "python3",
    args: ["05-compat/scripts/materialize_fab001_runtime_pipeline.py", "--preview-only"],
  },
  {
    label: "Materialize release identity",
    command: "node",
    args: ["platform/fabric/automation/materialize-release-identity-record.mjs"],
  },
  {
    label: "Materialize release communications",
    command: "node",
    args: ["platform/fabric/automation/materialize-release-communications.mjs"],
  },
  {
    label: "Capture recovery snapshot",
    command: "node",
    args: ["platform/fabric/automation/materialize-release-recovery-state.mjs", "--capture-snapshot"],
  },
];

for (const step of steps) {
  console.log(`\n==> ${step.label}`);
  const result = spawnSync(step.command, step.args, {
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    console.error(`\n${step.label} failed: ${result.error.message}`);
    process.exit(1);
  }

  if ((result.status ?? 1) !== 0) {
    console.error(`\n${step.label} failed with exit code ${result.status ?? 1}.`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nPublic-site governed state refreshed.");
