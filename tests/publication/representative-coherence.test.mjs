import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildDimensionsToDirectory } from "../../platform/fabric/automation/dimension-build-lib.mjs";
import { buildGenerationControlsToDirectory } from "../../platform/fabric/automation/generation-controls-lib.mjs";
import { buildRepresentativeMarketToDirectory } from "../../platform/fabric/automation/representative-market-lib.mjs";
import {
  validateRepresentativeCoherence,
  writeRepresentativeCoherenceReport,
} from "../../platform/fabric/validation/validate-representative-coherence.mjs";

const FIXED_BASELINE_TIMESTAMP = "2026-04-01T19:10:00.000Z";
const FIXED_GENERATION_TIMESTAMP = "2026-04-01T21:30:00.000Z";

test("representative coherence gate approves the representative market and records traceability", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-coherence-"));
  const seedDir = path.join(tempRoot, "seed", "current");
  const seedControlsDir = path.join(tempRoot, "seed", "internal-controls", "current");
  const outputDir = path.join(tempRoot, "representative", "current");
  const internalDir = path.join(tempRoot, "representative", "internal-controls", "current");
  const marketReportPath = path.join(tempRoot, "representative", "representative-market-report.json");
  const coherenceReportPath = path.join(tempRoot, "representative", "representative-coherence-report.json");

  try {
    await buildDimensionsToDirectory({
      outputDir: seedDir,
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });
    await buildGenerationControlsToDirectory({
      publicationDir: seedDir,
      outputDir: seedControlsDir,
      ruleVersion: "logic_first_controls_r1",
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });
    await buildRepresentativeMarketToDirectory({
      seedDir,
      seedControlsDir,
      outputDir,
      internalDir,
      reportPath: marketReportPath,
      loadTimestampUtc: FIXED_GENERATION_TIMESTAMP,
    });

    const report = await writeRepresentativeCoherenceReport({
      outputDir,
      internalDir,
      marketReportPath,
      reportPath: coherenceReportPath,
    });

    assert.equal(report.promotable, true);
    assert.equal(report.identity.scenario_reference.endsWith("logic-first-scenario-parameter-sets.md"), true);
    assert.equal(report.identity.representative_source_version.includes("__representative_market_r1"), true);

    const persisted = JSON.parse(await readFile(coherenceReportPath, "utf8"));
    assert.equal(persisted.promotion_status, "coherence_approved");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("representative coherence gate blocks broken demand semantics", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-coherence-blocked-"));
  const seedDir = path.join(tempRoot, "seed", "current");
  const seedControlsDir = path.join(tempRoot, "seed", "internal-controls", "current");
  const outputDir = path.join(tempRoot, "representative", "current");
  const internalDir = path.join(tempRoot, "representative", "internal-controls", "current");
  const marketReportPath = path.join(tempRoot, "representative", "representative-market-report.json");

  try {
    await buildDimensionsToDirectory({
      outputDir: seedDir,
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });
    await buildGenerationControlsToDirectory({
      publicationDir: seedDir,
      outputDir: seedControlsDir,
      ruleVersion: "logic_first_controls_r1",
      loadTimestampUtc: FIXED_BASELINE_TIMESTAMP,
    });
    await buildRepresentativeMarketToDirectory({
      seedDir,
      seedControlsDir,
      outputDir,
      internalDir,
      reportPath: marketReportPath,
      loadTimestampUtc: FIXED_GENERATION_TIMESTAMP,
    });

    const demandPath = path.join(outputDir, "fact_demand_line.json");
    const demandRows = JSON.parse(await readFile(demandPath, "utf8"));
    demandRows[0].requested_delivery_date = "2025-09-01";
    await writeFile(demandPath, `${JSON.stringify(demandRows, null, 2)}\n`, "utf8");

    const report = await validateRepresentativeCoherence({
      outputDir,
      internalDir,
      marketReportPath,
    });

    assert.equal(report.promotable, false);
    assert.equal(
      report.diagnostics.some(
        (diagnostic) => diagnostic.rule_id === "coherence.requested_delivery_before_event",
      ),
      true,
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
