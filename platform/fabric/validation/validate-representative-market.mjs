import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  loadApprovedPublicationPackage,
  loadGenerationControls,
} from "../automation/controlled-candidate-refresh-lib.mjs";
import {
  DEFAULT_REPRESENTATIVE_INTERNAL_DIR,
  DEFAULT_REPRESENTATIVE_OUTPUT_DIR,
  REPRESENTATIVE_PLAN_FILENAMES,
  REPRESENTATIVE_TARGET_COUNTS,
  loadRepresentativePlanTables,
  parseRepresentativeMarketArgs,
} from "../automation/representative-market-lib.mjs";
import { validateGenerationControls } from "./validate-generation-controls.mjs";

export async function validateRepresentativeMarket(options = {}) {
  const outputDir = options.outputDir ?? DEFAULT_REPRESENTATIVE_OUTPUT_DIR;
  const internalDir = options.internalDir ?? DEFAULT_REPRESENTATIVE_INTERNAL_DIR;
  const diagnostics = [];

  const [representativePackage, planTables, generationControls] = await Promise.all([
    loadApprovedPublicationPackage(outputDir),
    loadRepresentativePlanTables(internalDir),
    loadGenerationControls(internalDir),
  ]);

  validateTargetCounts(representativePackage, planTables, diagnostics);
  validateFallbackRates(representativePackage, diagnostics);
  validatePlanReferentialIntegrity(representativePackage, planTables, diagnostics);
  validateFactReferentialIntegrity(representativePackage, diagnostics);
  validateCoverageDensity(planTables, diagnostics);

  const generationControlReport = await validateGenerationControls({
    publicationDir: outputDir,
    outputDir: internalDir,
  });
  diagnostics.push(...generationControlReport.diagnostics);

  const errors = diagnostics
    .filter((diagnostic) => diagnostic.severity === "error")
    .map(formatDiagnosticMessage);

  return {
    outputDir,
    internalDir,
    diagnostics,
    errors,
    counts: {
      ...Object.fromEntries(
        Object.entries(representativePackage)
          .filter(([, rows]) => Array.isArray(rows))
          .map(([tableName, rows]) => [tableName, rows.length]),
      ),
      plan_account_product_eligibility:
        planTables.plan_account_product_eligibility.length,
      plan_product_location_stocking:
        planTables.plan_product_location_stocking.length,
      rule_account_generation_profile:
        generationControls.rule_account_generation_profile.length,
    },
  };
}

export async function main(argv = process.argv.slice(2)) {
  const parsedArgs = parseRepresentativeMarketArgs(argv);
  const report = await validateRepresentativeMarket({
    outputDir: parsedArgs.outputDir,
    internalDir: parsedArgs.internalDir,
  });

  if (report.errors.length > 0) {
    for (const error of report.errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return report;
  }

  console.log(`Validated representative market in ${report.outputDir}`);
  for (const [key, count] of Object.entries(report.counts)) {
    console.log(`- ${key}: ${count} rows`);
  }
  return report;
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

function validateTargetCounts(representativePackage, planTables, diagnostics) {
  assertEqualCount(
    representativePackage.dim_account.length,
    Object.values(REPRESENTATIVE_TARGET_COUNTS.accounts).reduce((sum, value) => sum + value, 0),
    "dim_account",
    diagnostics,
  );
  assertEqualCount(
    representativePackage.dim_product.length,
    Object.values(REPRESENTATIVE_TARGET_COUNTS.products).reduce((sum, value) => sum + value, 0),
    "dim_product",
    diagnostics,
  );
  assertEqualCount(
    representativePackage.dim_inventory_location.length,
    Object.values(REPRESENTATIVE_TARGET_COUNTS.locations).reduce((sum, value) => sum + value, 0),
    "dim_inventory_location",
    diagnostics,
  );
  assertEqualCount(
    planTables.plan_account_product_eligibility.length,
    REPRESENTATIVE_TARGET_COUNTS.eligibilityPairs,
    "plan_account_product_eligibility",
    diagnostics,
  );
  assertRangeCount(
    planTables.plan_product_location_stocking.length,
    REPRESENTATIVE_TARGET_COUNTS.stockingPairsMin,
    REPRESENTATIVE_TARGET_COUNTS.stockingPairsMax,
    "plan_product_location_stocking",
    diagnostics,
  );
}

function validateFallbackRates(representativePackage, diagnostics) {
  const unknownAccounts = representativePackage.dim_account.filter(
    (row) => row.account_pattern_class === "UNKNOWN",
  ).length;
  const unclassifiedProducts = representativePackage.dim_product.filter(
    (row) => row.product_family_code === "UNCLASSIFIED",
  ).length;
  const unknownLocations = representativePackage.dim_inventory_location.filter(
    (row) => row.node_type_code === "UNKNOWN",
  ).length;

  assertRate(unknownAccounts, representativePackage.dim_account.length, 0.05, "dim_account.UNKNOWN", diagnostics);
  assertRate(unclassifiedProducts, representativePackage.dim_product.length, 0.06, "dim_product.UNCLASSIFIED", diagnostics);
  if (unknownLocations > 1) {
    pushDiagnostic(diagnostics, {
      ruleId: "representative.unknown_location_bounded",
      artifact: "dim_inventory_location.UNKNOWN",
      severity: "error",
      message: `must not exceed 1 representative location, found ${unknownLocations}.`,
    });
  }
}

function validatePlanReferentialIntegrity(representativePackage, planTables, diagnostics) {
  const accountKeys = new Set(representativePackage.dim_account.map((row) => row.account_sk));
  const productKeys = new Set(representativePackage.dim_product.map((row) => row.product_sk));
  const locationKeys = new Set(
    representativePackage.dim_inventory_location.map((row) => row.inventory_location_sk),
  );

  for (const row of planTables.plan_account_population) {
    if (!accountKeys.has(row.account_sk)) {
      pushMissingReference(diagnostics, "plan_account_population", row.account_sk);
    }
  }
  for (const row of planTables.plan_product_population) {
    if (!productKeys.has(row.product_sk)) {
      pushMissingReference(diagnostics, "plan_product_population", row.product_sk);
    }
  }
  for (const row of planTables.plan_inventory_location_population) {
    if (!locationKeys.has(row.inventory_location_sk)) {
      pushMissingReference(diagnostics, "plan_inventory_location_population", row.inventory_location_sk);
    }
  }
  for (const row of planTables.plan_account_product_eligibility) {
    if (!accountKeys.has(row.account_sk) || !productKeys.has(row.product_sk)) {
      pushMissingReference(
        diagnostics,
        "plan_account_product_eligibility",
        `${row.account_sk}|${row.product_sk}`,
      );
    }
  }
  for (const row of planTables.plan_product_location_stocking) {
    if (!productKeys.has(row.product_sk) || !locationKeys.has(row.inventory_location_sk)) {
      pushMissingReference(
        diagnostics,
        "plan_product_location_stocking",
        `${row.product_sk}|${row.inventory_location_sk}`,
      );
    }
  }
}

function validateFactReferentialIntegrity(representativePackage, diagnostics) {
  const accountKeys = new Set(representativePackage.dim_account.map((row) => row.account_sk));
  const productKeys = new Set(representativePackage.dim_product.map((row) => row.product_sk));
  const locationKeys = new Set(
    representativePackage.dim_inventory_location.map((row) => row.inventory_location_sk),
  );

  for (const row of representativePackage.fact_demand_line) {
    if (!productKeys.has(row.product_sk) || !accountKeys.has(row.account_sk)) {
      pushMissingReference(
        diagnostics,
        "fact_demand_line",
        `${row.account_sk}|${row.product_sk}`,
      );
    }
  }
  for (const row of representativePackage.fact_inventory_inbound) {
    if (!productKeys.has(row.product_sk) || !locationKeys.has(row.inventory_location_sk)) {
      pushMissingReference(
        diagnostics,
        "fact_inventory_inbound",
        `${row.product_sk}|${row.inventory_location_sk}`,
      );
    }
  }
  for (const row of representativePackage.fact_inventory_snapshot) {
    if (!productKeys.has(row.product_sk) || !locationKeys.has(row.inventory_location_sk)) {
      pushMissingReference(
        diagnostics,
        "fact_inventory_snapshot",
        `${row.product_sk}|${row.inventory_location_sk}`,
      );
    }
  }
}

function validateCoverageDensity(planTables, diagnostics) {
  const eligibilityPairs = new Set(
    planTables.plan_account_product_eligibility.map((row) => `${row.account_sk}|${row.product_sk}`),
  );
  const stockingPairs = new Set(
    planTables.plan_product_location_stocking.map(
      (row) => `${row.product_sk}|${row.inventory_location_sk}`,
    ),
  );

  if (eligibilityPairs.size !== planTables.plan_account_product_eligibility.length) {
    pushDiagnostic(diagnostics, {
      ruleId: "representative.eligibility_pairs_unique",
      artifact: "plan_account_product_eligibility",
      severity: "error",
      message: "must contain unique account-product pairs.",
    });
  }
  if (stockingPairs.size !== planTables.plan_product_location_stocking.length) {
    pushDiagnostic(diagnostics, {
      ruleId: "representative.stocking_pairs_unique",
      artifact: "plan_product_location_stocking",
      severity: "error",
      message: "must contain unique product-location pairs.",
    });
  }
}

function assertEqualCount(actual, expected, artifact, diagnostics) {
  if (actual !== expected) {
    pushDiagnostic(diagnostics, {
      ruleId: "representative.count_exact",
      artifact,
      severity: "error",
      message: `must equal ${expected}, found ${actual}.`,
    });
  }
}

function assertRangeCount(actual, minimum, maximum, artifact, diagnostics) {
  if (actual < minimum || actual > maximum) {
    pushDiagnostic(diagnostics, {
      ruleId: "representative.count_range",
      artifact,
      severity: "error",
      message: `must stay between ${minimum} and ${maximum}, found ${actual}.`,
    });
  }
}

function assertRate(numerator, denominator, maxRate, artifact, diagnostics) {
  const rate = denominator === 0 ? 0 : numerator / denominator;
  if (rate > maxRate) {
    pushDiagnostic(diagnostics, {
      ruleId: "representative.rate_bounded",
      artifact,
      severity: "error",
      message: `must stay at or below ${(maxRate * 100).toFixed(1)}%, found ${(rate * 100).toFixed(1)}%.`,
    });
  }
}

function pushMissingReference(diagnostics, artifact, key) {
  pushDiagnostic(diagnostics, {
    ruleId: "representative.missing_reference",
    artifact,
    severity: "error",
    message: `contains a missing representative reference for ${key}.`,
  });
}

function pushDiagnostic(diagnostics, diagnostic) {
  diagnostics.push({
    severity: diagnostic.severity ?? "error",
    artifact: diagnostic.artifact,
    rule_id: diagnostic.ruleId,
    message: diagnostic.message,
  });
}

function formatDiagnosticMessage(diagnostic) {
  return `${diagnostic.rule_id} [${diagnostic.artifact}] ${diagnostic.message}`;
}
