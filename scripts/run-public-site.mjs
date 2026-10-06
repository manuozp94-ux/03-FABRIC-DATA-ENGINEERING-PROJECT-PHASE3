#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const forwardedArgs = process.argv.slice(2);

if (forwardedArgs.length === 0) {
  console.error("Usage: node scripts/run-public-site.mjs <pnpm args...>");
  process.exit(1);
}

const corepackCommand = process.platform === "win32" ? "corepack.cmd" : "corepack";
const repoRoot = process.cwd();

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const contents = fs.readFileSync(filePath, "utf-8");
  const parsed = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

const repoEnv = loadEnvFile(path.join(repoRoot, ".env"));

const result = spawnSync(corepackCommand, ["pnpm", "--dir", "apps/public-site", ...forwardedArgs], {
  stdio: "inherit",
  env: {
    ...process.env,
    ...repoEnv,
    ASTRO_TELEMETRY_DISABLED: "1",
    PROJECT_REPO_ROOT: repoRoot,
  },
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
