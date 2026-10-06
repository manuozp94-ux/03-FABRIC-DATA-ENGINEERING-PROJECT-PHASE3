import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  readJsonFile,
  writeJsonFile,
} from "../automation/dimension-build-lib.mjs";
import {
  loadApprovedPublicationPackage,
  loadGenerationControls,
} from "../automation/controlled-candidate-refresh-lib.mjs";
import {
  DEFAULT_REPRESENTATIVE_INTERNAL_DIR,
  DEFAULT_REPRESENTATIVE_OUTPUT_DIR,
  DEFAULT_REPRESENTATIVE_REPORT_PATH,
  loadRepresentativePlanTables,
  parseRepresentativeMarketArgs,
} from "../automation/representative-market-lib.mjs";
import { validateRepresentativeMarket } from "./validate-representative-market.mjs";

export const DEFAULT_REPRESENTATIVE_COHERENCE_REPORT_PATH = path.join(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.."),
  "_bmad-output/test-artifacts/fabric-representative/representative-coherence-report.json",
);

export const REPRESENTATIVE_COHERENCE_RULE_VERSION = "representative_coherence_r1";
export const SCENARIO_REFERENCE_PATH =
  "platform/fabric/contracts/logic-first-scenario-parameter-sets.md";
export const CONTROLLED_REALISM_MATRIX_PATH =
  "platform/fabric/contracts/controlled-realism-test-matrix.md";

export function parseRepresentativeCoherenceArgs(argv = process.argv.slice(2)) {
  const representativeArgs = parseRepresentativeMarketArgs([]);
  const parsed = {
    outputDir: representativeArgs.outputDir ?? DEFAULT_REPRESENTATIVE_OUTPUT_DIR,
    internalDir: representativeArgs.internalDir ?? DEFAULT_REPRESENTATIVE_INTERNAL_DIR,
    marketReportPath: DEFAULT_REPRESENTATIVE_REPORT_PATH,
    reportPath: DEFAULT_REPRESENTATIVE_COHERENCE_REPORT_PATH,
    coherenceRuleVersion: REPRESENTATIVE_COHERENCE_RULE_VERSION,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--") {
      continue;
    }

    if (arg === "--output-dir") {
      parsed.outputDir = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--internal-dir") {
      parsed.internalDir = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--market-report") {
      parsed.marketReportPath = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--report-path") {
      parsed.reportPath = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--coherence-rule-version") {
      parsed.coherenceRuleVersion = next;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

export async function validateRepresentativeCoherence(options = {}) {
  const outputDir = options.outputDir ?? DEFAULT_REPRESENTATIVE_OUTPUT_DIR;
  const internalDir = options.internalDir ?? DEFAULT_REPRESENTATIVE_INTERNAL_DIR;
  const marketReportPath =
    options.marketReportPath ?? DEFAULT_REPRESENTATIVE_REPORT_PATH;
  const coherenceRuleVersion =
    options.coherenceRuleVersion ?? REPRESENTATIVE_COHERENCE_RULE_VERSION;
  const diagnostics = [];

  const structuralReport = await validateRepresentativeMarket({
    outputDir,
    internalDir,
  });
  diagnostics.push(...structuralReport.diagnostics);

  let representativePackage;
  let planTables;
  let generationControls;
  let marketReport;

  try {
    [representativePackage, planTables, generationControls, marketReport] = await Promise.all([
      loadApprovedPublicationPackage(outputDir),
      loadRepresentativePlanTables(internalDir),
      loadGenerationControls(internalDir),
      readJsonFile(marketReportPath),
    ]);
  } catch (error) {
    pushDiagnostic(diagnostics, {
      ruleId: "coherence.inputs_unreadable",
      artifact: "representative_coherence_inputs",
      message: error.message,
    });

    return finalizeCoherenceReport({
      outputDir,
      internalDir,
      marketReportPath,
      coherenceRuleVersion,
      diagnostics,
      counts: {},
      identity: {},
    });
  }

  validateReleaseIdentity({
    marketReport,
    generationControls,
    diagnostics,
  });
  validateDemandSemantics({
    representativePackage,
    diagnostics,
  });
  validateEconomicBehavior({
    representativePackage,
    generationControls,
    diagnostics,
  });
  validateQuarterOverQuarterGrowth({
    representativePackage,
    diagnostics,
  });
  validateJumpAndRecoveryBehavior({
    representativePackage,
    diagnostics,
  });
  validateSnapshotTransitions({
    representativePackage,
    planTables,
    diagnostics,
  });

  return finalizeCoherenceReport({
    outputDir,
    internalDir,
    marketReportPath,
    coherenceRuleVersion,
    diagnostics,
    counts: {
      dim_account: representativePackage.dim_account.length,
      dim_product: representativePackage.dim_product.length,
      dim_inventory_location: representativePackage.dim_inventory_location.length,
      fact_demand_line: representativePackage.fact_demand_line.length,
      fact_inventory_inbound: representativePackage.fact_inventory_inbound.length,
      fact_inventory_snapshot: representativePackage.fact_inventory_snapshot.length,
      plan_account_product_eligibility:
        planTables.plan_account_product_eligibility.length,
      plan_product_location_stocking:
        planTables.plan_product_location_stocking.length,
    },
    identity: {
      representative_source_version:
        marketReport.metadata?.representative_source_version ?? null,
      generation_rule_version:
        marketReport.metadata?.generated_generation_control_version
        ?? generationControls.rule_account_generation_profile[0]?.rule_version
        ?? null,
      scenario_reference: SCENARIO_REFERENCE_PATH,
      controlled_realism_matrix_reference: CONTROLLED_REALISM_MATRIX_PATH,
      coherence_rule_version: coherenceRuleVersion,
      market_report_path: marketReportPath,
    },
  });
}

export async function writeRepresentativeCoherenceReport(options = {}) {
  const reportPath =
    options.reportPath ?? DEFAULT_REPRESENTATIVE_COHERENCE_REPORT_PATH;
  const report = await validateRepresentativeCoherence(options);
  await writeJsonFile(reportPath, report);
  return {
    ...report,
    report_path: reportPath,
  };
}

export async function main(argv = process.argv.slice(2)) {
  const parsed = parseRepresentativeCoherenceArgs(argv);
  const report = await writeRepresentativeCoherenceReport(parsed);

  if (!report.promotable) {
    for (const error of report.errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return report;
  }

  console.log(`Representative coherence approved for ${report.outputDir}`);
  console.log(`Wrote report: ${report.report_path}`);
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

function validateReleaseIdentity({ marketReport, generationControls, diagnostics }) {
  const representativeVersion = marketReport.metadata?.representative_source_version;
  const generationVersion = marketReport.metadata?.generated_generation_control_version;
  const firstRuleVersion =
    generationControls.rule_account_generation_profile[0]?.rule_version ?? null;

  if (!representativeVersion) {
    pushDiagnostic(diagnostics, {
      ruleId: "coherence.release_identity_missing",
      artifact: "representative_market_report.metadata.representative_source_version",
      message: "must exist before the package can become promotable.",
    });
  }

  if (!generationVersion) {
    pushDiagnostic(diagnostics, {
      ruleId: "coherence.release_identity_missing",
      artifact: "representative_market_report.metadata.generated_generation_control_version",
      message: "must exist before the package can become promotable.",
    });
  }

  if (generationVersion && firstRuleVersion && generationVersion !== firstRuleVersion) {
    pushDiagnostic(diagnostics, {
      ruleId: "coherence.rule_version_mismatch",
      artifact: "generation_control_version",
      message: `report version ${generationVersion} does not match loaded control version ${firstRuleVersion}.`,
    });
  }
}

function validateDemandSemantics({ representativePackage, diagnostics }) {
  for (const [index, row] of representativePackage.fact_demand_line.entries()) {
    if (row.demand_qty < 0 || row.delivered_qty < 0 || row.open_qty < 0) {
      pushDiagnostic(diagnostics, {
        ruleId: "coherence.negative_demand_quantity",
        artifact: `fact_demand_line[${index}]`,
        message: "must keep demand, delivered, and open quantities non-negative.",
      });
    }
    if (row.delivered_qty > row.demand_qty) {
      pushDiagnostic(diagnostics, {
        ruleId: "coherence.delivered_exceeds_demand",
        artifact: `fact_demand_line[${index}]`,
        message: "may not deliver more than the requested demand quantity.",
      });
    }
    if (row.open_qty !== Math.max(row.demand_qty - row.delivered_qty, 0)) {
      pushDiagnostic(diagnostics, {
        ruleId: "coherence.open_qty_invalid",
        artifact: `fact_demand_line[${index}]`,
        message: "must satisfy open_qty = max(demand_qty - delivered_qty, 0).",
      });
    }
    if (row.requested_delivery_date < row.event_date) {
      pushDiagnostic(diagnostics, {
        ruleId: "coherence.requested_delivery_before_event",
        artifact: `fact_demand_line[${index}]`,
        message: "may not request delivery before the demand event date.",
      });
    }
  }
}

function validateEconomicBehavior({
  representativePackage,
  generationControls,
  diagnostics,
}) {
  const productRuleByKey = new Map(
    generationControls.rule_product_generation_profile.map((row) => [row.product_sk, row]),
  );
  const unitValueByProduct = new Map();

  for (const [index, row] of representativePackage.fact_demand_line.entries()) {
    if (row.demand_qty <= 0 || row.demand_value_proxy <= 0) {
      pushDiagnostic(diagnostics, {
        ruleId: "coherence.non_positive_demand_value",
        artifact: `fact_demand_line[${index}]`,
        message: "must retain positive demand quantity and demand value proxy.",
      });
      continue;
    }

    const unitValue = row.demand_value_proxy / row.demand_qty;
    const bucket = unitValueByProduct.get(row.product_sk) ?? [];
    bucket.push(unitValue);
    unitValueByProduct.set(row.product_sk, bucket);

    const marginRate = row.gross_margin_proxy / row.demand_value_proxy;
    const allowedMargin = marginBandBounds(
      productRuleByKey.get(row.product_sk)?.target_margin_band_code ?? "MARGIN_28_32",
    );
    if (marginRate < allowedMargin.minimum || marginRate > allowedMargin.maximum) {
      pushDiagnostic(diagnostics, {
        ruleId: "coherence.margin_rate_out_of_band",
        artifact: `fact_demand_line[${index}]`,
        message: `margin rate ${marginRate.toFixed(3)} falls outside ${allowedMargin.minimum.toFixed(3)}..${allowedMargin.maximum.toFixed(3)}.`,
      });
    }
  }

  for (const [productSk, values] of unitValueByProduct.entries()) {
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    if (minValue <= 0 || maxValue / minValue > 1.75) {
      pushDiagnostic(diagnostics, {
        ruleId: "coherence.unit_value_jump_excessive",
        artifact: `fact_demand_line.${productSk}`,
        message: "unit-value behavior varies too aggressively for a coherence-approved public proof surface.",
      });
    }
  }
}

function validateQuarterOverQuarterGrowth({ representativePackage, diagnostics }) {
  const productFamilyByProduct = new Map(
    representativePackage.dim_product.map((row) => [row.product_sk, row.product_family_code]),
  );
  const accountPatternByAccount = new Map(
    representativePackage.dim_account.map((row) => [row.account_sk, row.account_pattern_class]),
  );
  const quarterTotals = new Map();
  const quarterMonths = new Map();

  for (const row of representativePackage.fact_demand_line) {
    const accountPattern = accountPatternByAccount.get(row.account_sk) ?? "UNKNOWN";
    const family = productFamilyByProduct.get(row.product_sk) ?? "UNCLASSIFIED";
    const quarter = quarterKey(row.event_date);
    const aggregateKey = `${accountPattern}|${family}|${quarter}`;

    quarterTotals.set(aggregateKey, (quarterTotals.get(aggregateKey) ?? 0) + row.demand_qty);
    const monthBucket = quarterMonths.get(aggregateKey) ?? new Set();
    monthBucket.add(row.event_date.slice(0, 7));
    quarterMonths.set(aggregateKey, monthBucket);
  }

  const grouped = new Map();
  for (const [aggregateKey, totalQty] of quarterTotals.entries()) {
    const [accountPattern, family, quarter] = aggregateKey.split("|");
    const months = quarterMonths.get(aggregateKey) ?? new Set();
    if (months.size < 3) {
      continue;
    }
    const bucketKey = `${accountPattern}|${family}`;
    const bucket = grouped.get(bucketKey) ?? [];
    bucket.push({ quarter, totalQty });
    grouped.set(bucketKey, bucket);
  }

  for (const [bucketKey, rows] of grouped.entries()) {
    const sorted = [...rows].sort((left, right) => left.quarter.localeCompare(right.quarter));
    const [accountPattern] = bucketKey.split("|");
    const bounds = quarterGrowthBounds(accountPattern);

    for (let index = 1; index < sorted.length; index += 1) {
      const previous = sorted[index - 1];
      const current = sorted[index];
      if (previous.totalQty <= 0) {
        continue;
      }
      const growthRate = (current.totalQty - previous.totalQty) / previous.totalQty;
      if (growthRate < bounds.minimum || growthRate > bounds.maximum) {
        pushDiagnostic(diagnostics, {
          ruleId: "coherence.qoq_growth_out_of_bounds",
          artifact: bucketKey,
          message: `quarter-over-quarter growth ${growthRate.toFixed(3)} falls outside ${bounds.minimum.toFixed(3)}..${bounds.maximum.toFixed(3)} between ${previous.quarter} and ${current.quarter}.`,
        });
      }
    }
  }
}

function validateJumpAndRecoveryBehavior({ representativePackage, diagnostics }) {
  const accountPatternByAccount = new Map(
    representativePackage.dim_account.map((row) => [row.account_sk, row.account_pattern_class]),
  );
  const rowsByPair = new Map();

  for (const row of representativePackage.fact_demand_line) {
    const key = `${row.account_sk}|${row.product_sk}`;
    const bucket = rowsByPair.get(key) ?? [];
    bucket.push(row);
    rowsByPair.set(key, bucket);
  }

  for (const [pairKey, rows] of rowsByPair.entries()) {
    const sorted = [...rows].sort((left, right) => left.event_date.localeCompare(right.event_date));
    const accountPattern = accountPatternByAccount.get(sorted[0]?.account_sk ?? "") ?? "UNKNOWN";
    const maxRatio = jumpRatioThreshold(accountPattern);

    for (let index = 1; index < sorted.length; index += 1) {
      const previous = sorted[index - 1];
      const current = sorted[index];
      if (previous.demand_qty <= 0) {
        continue;
      }
      const ratio = current.demand_qty / previous.demand_qty;
      if (ratio > maxRatio && current.demand_qty - previous.demand_qty >= 18) {
        pushDiagnostic(diagnostics, {
          ruleId: "coherence.event_jump_excessive",
          artifact: pairKey,
          message: `event-to-event quantity jump ${ratio.toFixed(2)}x exceeds the allowed ratio ${maxRatio.toFixed(2)}.`,
        });
      }
    }
  }
}

function validateSnapshotTransitions({
  representativePackage,
  planTables,
  diagnostics,
}) {
  const locationByKey = new Map(
    representativePackage.dim_inventory_location.map((row) => [row.inventory_location_sk, row]),
  );
  const primaryServicePairs = new Set(
    planTables.plan_product_location_stocking
      .filter((row) => row.primary_service_flag)
      .map((row) => `${row.product_sk}|${row.inventory_location_sk}`),
  );
  const rowsByPair = new Map();

  for (const row of representativePackage.fact_inventory_snapshot) {
    const key = `${row.product_sk}|${row.inventory_location_sk}`;
    const bucket = rowsByPair.get(key) ?? [];
    bucket.push(row);
    rowsByPair.set(key, bucket);
  }

  for (const [pairKey, rows] of rowsByPair.entries()) {
    const sorted = [...rows].sort((left, right) => left.snapshot_date.localeCompare(right.snapshot_date));
    const location = locationByKey.get(sorted[0]?.inventory_location_sk ?? "");

    for (let index = 0; index < sorted.length; index += 1) {
      const row = sorted[index];
      if (row.on_hand_qty < 0 || row.available_qty < 0 || row.reserved_qty < 0 || row.in_transit_qty < 0) {
        pushDiagnostic(diagnostics, {
          ruleId: "coherence.negative_inventory_quantity",
          artifact: `fact_inventory_snapshot.${pairKey}`,
          message: "must keep all inventory quantities non-negative.",
        });
      }
      if (row.available_qty > row.on_hand_qty) {
        pushDiagnostic(diagnostics, {
          ruleId: "coherence.available_exceeds_on_hand",
          artifact: `fact_inventory_snapshot.${pairKey}`,
          message: "available quantity may not exceed on-hand quantity.",
        });
      }

      if (location?.node_type_code === "TRANSIT_NODE" || location?.node_type_code === "RESTRICTED_AREA") {
        if (row.available_qty !== 0 || row.readiness_flag === "READY") {
          pushDiagnostic(diagnostics, {
            ruleId: "coherence.non_service_node_ready",
            artifact: `fact_inventory_snapshot.${pairKey}`,
            message: "transit and restricted nodes may not surface as immediately ready service stock.",
          });
        }
      }

      if (index > 0) {
        const previous = sorted[index - 1];
        if (addIsoDays(previous.snapshot_date, 1) !== row.snapshot_date) {
          pushDiagnostic(diagnostics, {
            ruleId: "coherence.snapshot_gap_detected",
            artifact: `fact_inventory_snapshot.${pairKey}`,
            message: "snapshot dates must remain daily and contiguous inside the representative window.",
          });
          break;
        }
      }
    }

    if (!primaryServicePairs.has(pairKey) && location && ["INTERNAL_WAREHOUSE", "FLOOR_AREA", "OVERFLOW_AREA"].includes(location.node_type_code)) {
      const everReady = sorted.some((row) => row.readiness_flag === "READY");
      if (!everReady) {
        pushDiagnostic(diagnostics, {
          ruleId: "coherence.stocked_service_pair_never_ready",
          artifact: `fact_inventory_snapshot.${pairKey}`,
          message: "service-capable stocked pairs should surface at least one ready position across the representative window.",
        });
      }
    }
  }
}

function marginBandBounds(code) {
  const bounds = {
    MARGIN_24_29: { minimum: 0.21, maximum: 0.32 },
    MARGIN_26_31: { minimum: 0.23, maximum: 0.34 },
    MARGIN_28_32: { minimum: 0.25, maximum: 0.35 },
    MARGIN_29_33: { minimum: 0.26, maximum: 0.36 },
    MARGIN_32_37: { minimum: 0.29, maximum: 0.40 },
  };
  return bounds[code] ?? bounds.MARGIN_28_32;
}

function quarterGrowthBounds(accountPattern) {
  const bounds = {
    RECURRING_SERVICE: { minimum: -0.20, maximum: 0.45 },
    PROJECT_BASED: { minimum: -0.35, maximum: 0.70 },
    PARTNER_CHANNEL: { minimum: -0.30, maximum: 0.55 },
    UNKNOWN: { minimum: -0.50, maximum: 0.60 },
  };
  return bounds[accountPattern] ?? bounds.UNKNOWN;
}

function jumpRatioThreshold(accountPattern) {
  return {
    RECURRING_SERVICE: 3.8,
    PROJECT_BASED: 5.0,
    PARTNER_CHANNEL: 4.4,
    UNKNOWN: 4.0,
  }[accountPattern] ?? 4.0;
}

function quarterKey(isoDate) {
  const year = isoDate.slice(0, 4);
  const month = Number.parseInt(isoDate.slice(5, 7), 10);
  const quarter = Math.floor((month - 1) / 3) + 1;
  return `${year}-Q${quarter}`;
}

function addIsoDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function finalizeCoherenceReport({
  outputDir,
  internalDir,
  marketReportPath,
  coherenceRuleVersion,
  diagnostics,
  counts,
  identity,
}) {
  const errors = diagnostics
    .filter((diagnostic) => diagnostic.severity === "error")
    .map(formatDiagnosticMessage);

  const promotable = errors.length === 0;

  return {
    run_type: "representative_coherence_gate",
    output_dir: outputDir,
    internal_dir: internalDir,
    market_report_path: marketReportPath,
    coherence_rule_version: coherenceRuleVersion,
    promotion_status: promotable ? "coherence_approved" : "blocked",
    promotable,
    validation_passed: promotable,
    blocking_failure_count: errors.length,
    diagnostics,
    errors,
    counts,
    identity,
  };
}

function pushDiagnostic(diagnostics, diagnostic) {
  diagnostics.push({
    rule_id: diagnostic.ruleId,
    artifact: diagnostic.artifact,
    severity: diagnostic.severity ?? "error",
    blocking: diagnostic.blocking ?? true,
    message: diagnostic.message,
  });
}

function formatDiagnosticMessage(diagnostic) {
  return `${diagnostic.rule_id} [${diagnostic.artifact}] ${diagnostic.message}`;
}
