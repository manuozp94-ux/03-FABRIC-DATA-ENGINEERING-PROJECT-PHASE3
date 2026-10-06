import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  DEFAULT_SOURCE_DIR,
  parseBuildArgs,
} from "../automation/dimension-build-lib.mjs";
import {
  DEFAULT_APPROVED_PUBLICATION_DIR,
  DEFAULT_CANDIDATE_OUTPUT_DIR,
  loadApprovedPublicationPackage,
  loadGenerationControls,
} from "../automation/controlled-candidate-refresh-lib.mjs";
import { DEFAULT_GENERATION_CONTROLS_DIR } from "../automation/generation-controls-lib.mjs";
import { validatePublicationDimensions } from "./validate-dimensions.mjs";
import { validateGenerationControls } from "./validate-generation-controls.mjs";

const PRIMARY_KEYS = {
  dim_product: "product_sk",
  dim_product_family: "product_family_code",
  dim_account: "account_sk",
  dim_inventory_location: "inventory_location_sk",
  fact_demand_line: "demand_line_sk",
  fact_inventory_inbound: "inventory_inbound_sk",
  fact_inventory_snapshot: "inventory_snapshot_sk",
};

const DIMENSION_TABLES = [
  "dim_product",
  "dim_product_family",
  "dim_account",
  "dim_inventory_location",
];
const FACT_TABLES = [
  "fact_demand_line",
  "fact_inventory_inbound",
  "fact_inventory_snapshot",
];

export function parseControlledCandidateValidationArgs(argv = process.argv.slice(2)) {
  const parsedBuildArgs = parseBuildArgs([]);
  const parsed = {
    sourceDir: parsedBuildArgs.sourceDir ?? DEFAULT_SOURCE_DIR,
    approvedDir: DEFAULT_APPROVED_PUBLICATION_DIR,
    candidateDir: DEFAULT_CANDIDATE_OUTPUT_DIR,
    controlsDir: DEFAULT_GENERATION_CONTROLS_DIR,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--") {
      continue;
    }

    if (arg === "--input") {
      parsed.sourceDir = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--approved-dir") {
      parsed.approvedDir = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--candidate-dir") {
      parsed.candidateDir = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--controls-dir") {
      parsed.controlsDir = path.resolve(next);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

export async function validateControlledCandidatePublicationPackage(options = {}) {
  const sourceDir = options.sourceDir ?? DEFAULT_SOURCE_DIR;
  const approvedDir = options.approvedDir ?? DEFAULT_APPROVED_PUBLICATION_DIR;
  const candidateDir = options.candidateDir ?? DEFAULT_CANDIDATE_OUTPUT_DIR;
  const controlsDir = options.controlsDir ?? DEFAULT_GENERATION_CONTROLS_DIR;
  const diagnostics = [];

  const publicationReport = await safeValidatePublicationPackage({
    sourceDir,
    outputDir: candidateDir,
  });
  diagnostics.push(...publicationReport.diagnostics);

  const controlsReport = await safeValidateGenerationControls({
    publicationDir: approvedDir,
    outputDir: controlsDir,
  });
  diagnostics.push(...controlsReport.diagnostics);

  let approvedPackage;
  let candidatePackage;
  let generationControls;

  try {
    [approvedPackage, candidatePackage, generationControls] = await Promise.all([
      loadApprovedPublicationPackage(approvedDir),
      loadApprovedPublicationPackage(candidateDir),
      loadGenerationControls(controlsDir),
    ]);
  } catch (error) {
    pushDiagnostic(diagnostics, {
      ruleId: "artifact.package_unreadable",
      artifact: "controlled_candidate_package",
      message: error.message,
    });

    return finalizeControlledCandidateValidation({
      sourceDir,
      approvedDir,
      candidateDir,
      controlsDir,
      diagnostics,
      counts: {},
      generatedRowCounts: {},
    });
  }

  validateApprovedRowsArePreserved({
    approvedPackage,
    candidatePackage,
    diagnostics,
  });

  const generatedRows = buildGeneratedRows({
    approvedPackage,
    candidatePackage,
  });

  validateGeneratedSourceIdentity({
    approvedPackage,
    generatedRows,
    generationControls,
    diagnostics,
  });
  validateAppendOnlyWindow({
    approvedPackage,
    generatedRows,
    diagnostics,
  });
  validateDemandBoundaries({
    approvedPackage,
    generatedRows,
    generationControls,
    diagnostics,
  });
  validateInboundBoundaries({
    approvedPackage,
    generatedRows,
    generationControls,
    diagnostics,
  });
  validateRestrictedInventoryBehavior({
    approvedPackage,
    generatedRows,
    generationControls,
    diagnostics,
  });
  validateSnapshotReconciliation({
    approvedPackage,
    candidatePackage,
    generatedRows,
    generationControls,
    diagnostics,
  });

  return finalizeControlledCandidateValidation({
    sourceDir,
    approvedDir,
    candidateDir,
    controlsDir,
    diagnostics,
    counts: Object.fromEntries(
      Object.entries(candidatePackage).map(([key, rows]) => [key, rows.length]),
    ),
    generatedRowCounts: Object.fromEntries(
      FACT_TABLES.map((tableName) => [tableName, generatedRows[tableName].length]),
    ),
  });
}

export async function main(argv = process.argv.slice(2)) {
  const parsed = parseControlledCandidateValidationArgs(argv);
  const report = await validateControlledCandidatePublicationPackage(parsed);

  if (report.errors.length > 0) {
    for (const error of report.errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return report;
  }

  console.log(`Validated controlled candidate package in ${report.candidateDir}`);
  for (const [key, count] of Object.entries(report.counts)) {
    console.log(`- ${key}: ${count} rows`);
  }
  for (const [key, count] of Object.entries(report.generated_row_counts)) {
    console.log(`- ${key} generated rows: ${count}`);
  }
  return report;
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

async function safeValidatePublicationPackage(options) {
  try {
    const report = await validatePublicationDimensions(options);

    return {
      ...report,
      diagnostics: report.diagnostics.filter((diagnostic) =>
        diagnostic.rule_id !== "coherence.row_count_mismatch"
      ),
    };
  } catch (error) {
    const diagnostic = {
      rule_id: "artifact.package_unreadable",
      artifact: "candidate_publication_package",
      severity: "error",
      blocking: true,
      message: error.message,
    };

    return {
      diagnostics: [diagnostic],
      counts: {},
      errors: [formatDiagnosticMessage(diagnostic)],
    };
  }
}

async function safeValidateGenerationControls(options) {
  try {
    return await validateGenerationControls(options);
  } catch (error) {
    const diagnostic = {
      rule_id: "artifact.controls_unreadable",
      artifact: "generation_controls",
      severity: "error",
      blocking: true,
      message: error.message,
    };

    return {
      diagnostics: [diagnostic],
      counts: {},
      errors: [formatDiagnosticMessage(diagnostic)],
    };
  }
}

function validateApprovedRowsArePreserved({
  approvedPackage,
  candidatePackage,
  diagnostics,
}) {
  for (const tableName of DIMENSION_TABLES) {
    const primaryKey = PRIMARY_KEYS[tableName];
    const approvedRows = approvedPackage[tableName];
    const candidateRows = candidatePackage[tableName];
    const approvedMap = mapRowsByKey(approvedRows, primaryKey);
    const candidateMap = mapRowsByKey(candidateRows, primaryKey);

    if (candidateRows.length !== approvedRows.length) {
      pushDiagnostic(diagnostics, {
        ruleId: "candidate.dimension_mutation_disallowed",
        artifact: tableName,
        message: `must preserve approved row count ${approvedRows.length}, found ${candidateRows.length}.`,
      });
    }

    for (const [rowKey, approvedRow] of approvedMap.entries()) {
      const candidateRow = candidateMap.get(rowKey);
      if (!candidateRow) {
        pushDiagnostic(diagnostics, {
          ruleId: "candidate.approved_row_missing",
          artifact: tableName,
          message: `is missing approved key ${rowKey}.`,
        });
        continue;
      }

      if (JSON.stringify(candidateRow) !== JSON.stringify(approvedRow)) {
        pushDiagnostic(diagnostics, {
          ruleId: "candidate.history_mutation_disallowed",
          artifact: `${tableName}.${rowKey}`,
          message: "differs from the approved baseline row.",
        });
      }
    }

    for (const rowKey of candidateMap.keys()) {
      if (!approvedMap.has(rowKey)) {
        pushDiagnostic(diagnostics, {
          ruleId: "candidate.dimension_mutation_disallowed",
          artifact: `${tableName}.${rowKey}`,
          message: "adds a new dimension row outside the approved baseline.",
        });
      }
    }
  }

  for (const tableName of FACT_TABLES) {
    const primaryKey = PRIMARY_KEYS[tableName];
    const approvedMap = mapRowsByKey(approvedPackage[tableName], primaryKey);
    const candidateMap = mapRowsByKey(candidatePackage[tableName], primaryKey);

    for (const [rowKey, approvedRow] of approvedMap.entries()) {
      const candidateRow = candidateMap.get(rowKey);
      if (!candidateRow) {
        pushDiagnostic(diagnostics, {
          ruleId: "candidate.approved_row_missing",
          artifact: tableName,
          message: `is missing approved key ${rowKey}.`,
        });
        continue;
      }

      if (JSON.stringify(candidateRow) !== JSON.stringify(approvedRow)) {
        pushDiagnostic(diagnostics, {
          ruleId: "candidate.history_mutation_disallowed",
          artifact: `${tableName}.${rowKey}`,
          message: "differs from the approved baseline row.",
        });
      }
    }
  }
}

function buildGeneratedRows({
  approvedPackage,
  candidatePackage,
}) {
  return Object.fromEntries(
    FACT_TABLES.map((tableName) => {
      const primaryKey = PRIMARY_KEYS[tableName];
      const approvedKeys = new Set(
        approvedPackage[tableName].map((row) => row[primaryKey]),
      );

      return [
        tableName,
        candidatePackage[tableName].filter((row) => !approvedKeys.has(row[primaryKey])),
      ];
    }),
  );
}

function validateGeneratedSourceIdentity({
  approvedPackage,
  generatedRows,
  generationControls,
  diagnostics,
}) {
  const approvedSourceVersion = approvedPackage.dim_product[0]?.source_file_version;
  const ruleVersion = generationControls.rule_account_generation_profile?.[0]?.rule_version;

  if (!approvedSourceVersion || !ruleVersion) {
    pushDiagnostic(diagnostics, {
      ruleId: "candidate.generated_source_version_unresolved",
      artifact: "generated_rows",
      message: "cannot resolve approved source version or generation rule version.",
    });
    return;
  }

  const expectedSourceVersion = `${approvedSourceVersion}__${ruleVersion}`;
  const totalGeneratedRows = FACT_TABLES.reduce(
    (total, tableName) => total + generatedRows[tableName].length,
    0,
  );

  if (totalGeneratedRows === 0) {
    pushDiagnostic(diagnostics, {
      ruleId: "candidate.generated_rows_missing",
      artifact: "generated_rows",
      message: "did not append any new governed fact rows.",
    });
  }

  for (const tableName of FACT_TABLES) {
    generatedRows[tableName].forEach((row, index) => {
      if (row.source_file_version !== expectedSourceVersion) {
        pushDiagnostic(diagnostics, {
          ruleId: "candidate.generated_source_version_mismatch",
          artifact: `${tableName}[${index}]`,
          message: `must use source_file_version ${expectedSourceVersion}, found ${row.source_file_version}.`,
        });
      }
    });
  }
}

function validateAppendOnlyWindow({
  approvedPackage,
  generatedRows,
  diagnostics,
}) {
  const demandCutoff = maxDate(approvedPackage.fact_demand_line, "event_date");
  const inboundCutoff = maxDate(approvedPackage.fact_inventory_inbound, "receipt_date");
  const snapshotCutoff = maxDate(approvedPackage.fact_inventory_snapshot, "snapshot_date");

  generatedRows.fact_demand_line.forEach((row, index) => {
    if (row.event_date <= demandCutoff) {
      pushDiagnostic(diagnostics, {
        ruleId: "candidate.append_window_invalid",
        artifact: `fact_demand_line[${index}]`,
        message: `must have event_date after approved cutoff ${demandCutoff}.`,
      });
    }
  });

  generatedRows.fact_inventory_inbound.forEach((row, index) => {
    if (row.receipt_date <= inboundCutoff) {
      pushDiagnostic(diagnostics, {
        ruleId: "candidate.append_window_invalid",
        artifact: `fact_inventory_inbound[${index}]`,
        message: `must have receipt_date after approved cutoff ${inboundCutoff}.`,
      });
    }
  });

  generatedRows.fact_inventory_snapshot.forEach((row, index) => {
    if (row.snapshot_date <= snapshotCutoff) {
      pushDiagnostic(diagnostics, {
        ruleId: "candidate.append_window_invalid",
        artifact: `fact_inventory_snapshot[${index}]`,
        message: `must have snapshot_date after approved cutoff ${snapshotCutoff}.`,
      });
    }
  });
}

function validateDemandBoundaries({
  approvedPackage,
  generatedRows,
  generationControls,
  diagnostics,
}) {
  const accountByKey = mapRowsByKey(approvedPackage.dim_account, "account_sk");
  const productByKey = mapRowsByKey(approvedPackage.dim_product, "product_sk");
  const eligibilityByPair = new Map(
    generationControls.rule_account_product_eligibility.map((row) => [
      `${row.account_sk}|${row.product_sk}`,
      row,
    ]),
  );
  let hasOpenDemand = false;

  generatedRows.fact_demand_line.forEach((row, index) => {
    const pairKey = `${row.account_sk}|${row.product_sk}`;
    const eligibility = eligibilityByPair.get(pairKey);

    if (!eligibility) {
      pushDiagnostic(diagnostics, {
        ruleId: "generation.eligibility_boundary_broken",
        artifact: `fact_demand_line[${index}]`,
        message: `uses unapproved account-product pair ${pairKey}.`,
      });
    }

    if (row.delivered_qty > row.demand_qty) {
      pushDiagnostic(diagnostics, {
        ruleId: "generation.demand_arithmetic_invalid",
        artifact: `fact_demand_line[${index}]`,
        message: "has delivered_qty greater than demand_qty.",
      });
    }

    if (row.open_qty !== Math.max(row.demand_qty - row.delivered_qty, 0)) {
      pushDiagnostic(diagnostics, {
        ruleId: "generation.demand_arithmetic_invalid",
        artifact: `fact_demand_line[${index}]`,
        message: "must satisfy open_qty = max(demand_qty - delivered_qty, 0).",
      });
    }

    if ([row.demand_qty, row.delivered_qty, row.open_qty, row.demand_value_proxy, row.gross_margin_proxy]
      .some((value) => value < 0)) {
      pushDiagnostic(diagnostics, {
        ruleId: "generation.non_negative_metric_required",
        artifact: `fact_demand_line[${index}]`,
        message: "contains a negative generated metric.",
      });
    }

    if (row.open_qty > 0) {
      hasOpenDemand = true;
    }

    if (row.record_status === "generated-fallback") {
      const account = accountByKey.get(row.account_sk);
      const product = productByKey.get(row.product_sk);
      const isFallbackEligible =
        eligibility?.eligibility_status_code === "OBSERVED_FALLBACK"
        || account?.account_pattern_class === "UNKNOWN"
        || product?.product_family_code === "UNCLASSIFIED";

      if (!isFallbackEligible) {
        pushDiagnostic(diagnostics, {
          ruleId: "generation.fallback_vocabulary_unbounded",
          artifact: `fact_demand_line[${index}]`,
          message: "uses generated-fallback status without an approved bounded fallback condition.",
        });
      }
    }
  });

  if (!hasOpenDemand && generatedRows.fact_demand_line.length > 0) {
    pushDiagnostic(diagnostics, {
      ruleId: "generation.service_lag_absent",
      artifact: "fact_demand_line",
      message: "must preserve at least one open generated demand row in the candidate window.",
    });
  }
}

function validateInboundBoundaries({
  approvedPackage,
  generatedRows,
  generationControls,
  diagnostics,
}) {
  const locationByKey = mapRowsByKey(
    approvedPackage.dim_inventory_location,
    "inventory_location_sk",
  );
  const inboundRuleByPair = new Map(
    generationControls.rule_inventory_inbound.map((row) => [
      `${row.product_sk}|${row.inventory_location_sk}`,
      row,
    ]),
  );
  const pendingReceiptKeys = new Set(
    generationControls.state_pending_receipt.map((row) =>
      [
        row.product_sk,
        row.inventory_location_sk,
        row.expected_release_date,
        row.receipt_flow_type,
      ].join("|"),
    ),
  );

  generatedRows.fact_inventory_inbound.forEach((row, index) => {
    const pairKey = `${row.product_sk}|${row.inventory_location_sk}`;
    const pendingKey = [
      row.product_sk,
      row.inventory_location_sk,
      row.receipt_date,
      row.receipt_flow_type,
    ].join("|");
    const inboundRule = inboundRuleByPair.get(pairKey);

    if (!inboundRule) {
      pushDiagnostic(diagnostics, {
        ruleId: "generation.inbound_boundary_broken",
        artifact: `fact_inventory_inbound[${index}]`,
        message: `uses unapproved product-location pair ${pairKey}.`,
      });
    }

    if (!pendingReceiptKeys.has(pendingKey)) {
      pushDiagnostic(diagnostics, {
        ruleId: "generation.pending_receipt_unresolved",
        artifact: `fact_inventory_inbound[${index}]`,
        message: "does not resolve to a pending receipt state row.",
      });
    }

    if (row.receipt_qty < 0 || row.receipt_value_proxy < 0) {
      pushDiagnostic(diagnostics, {
        ruleId: "generation.non_negative_metric_required",
        artifact: `fact_inventory_inbound[${index}]`,
        message: "contains a negative generated inbound metric.",
      });
    }

    const location = locationByKey.get(row.inventory_location_sk);
    if (!location) {
      pushDiagnostic(diagnostics, {
        ruleId: "generation.key_resolution_failed",
        artifact: `fact_inventory_inbound[${index}]`,
        message: "does not resolve to an approved inventory location.",
      });
    }
  });
}

function validateRestrictedInventoryBehavior({
  approvedPackage,
  generatedRows,
  generationControls,
  diagnostics,
}) {
  const locationByKey = mapRowsByKey(
    approvedPackage.dim_inventory_location,
    "inventory_location_sk",
  );
  const inboundRuleByPair = new Map(
    generationControls.rule_inventory_inbound.map((row) => [
      `${row.product_sk}|${row.inventory_location_sk}`,
      row,
    ]),
  );
  const inboundByPairAndDate = new Map();

  generatedRows.fact_inventory_inbound.forEach((row) => {
    const key = `${row.product_sk}|${row.inventory_location_sk}|${row.receipt_date}`;
    const bucket = inboundByPairAndDate.get(key) ?? [];
    bucket.push(row);
    inboundByPairAndDate.set(key, bucket);
  });

  generatedRows.fact_inventory_snapshot.forEach((row, index) => {
    const location = locationByKey.get(row.inventory_location_sk);
    const pairKey = `${row.product_sk}|${row.inventory_location_sk}`;
    const nodeTypeCode = location?.node_type_code ?? "UNKNOWN";
    const inboundRows = inboundByPairAndDate.get(`${pairKey}|${row.snapshot_date}`) ?? [];

    if (row.available_qty > row.on_hand_qty) {
      pushDiagnostic(diagnostics, {
        ruleId: "generation.snapshot_arithmetic_invalid",
        artifact: `fact_inventory_snapshot[${index}]`,
        message: "must keep available_qty less than or equal to on_hand_qty.",
      });
    }

    if ([row.on_hand_qty, row.available_qty, row.reserved_qty, row.in_transit_qty, row.inventory_value_proxy]
      .some((value) => value < 0)) {
      pushDiagnostic(diagnostics, {
        ruleId: "generation.non_negative_metric_required",
        artifact: `fact_inventory_snapshot[${index}]`,
        message: "contains a negative generated inventory metric.",
      });
    }

    if (nodeTypeCode === "TRANSIT_NODE" || nodeTypeCode === "RESTRICTED_AREA") {
      if (row.available_qty !== 0 || row.readiness_flag === "READY" || row.inventory_status_code === "READY") {
        pushDiagnostic(diagnostics, {
          ruleId: "controlled_realism.restricted_inventory_ready_blocked",
          artifact: `fact_inventory_snapshot[${index}]`,
          message: `must not expose READY behavior for node type ${nodeTypeCode}.`,
        });
      }
    }

    if (nodeTypeCode === "THIRD_PARTY_NODE") {
      const hasBlockedSameDayInbound = inboundRows.some((inboundRow) => {
        const inboundRule = inboundRuleByPair.get(pairKey);
        return !allowsSameDayRelief({
          nodeTypeCode,
          receiptFlowType: inboundRow.receipt_flow_type,
          inboundRule,
        });
      });

      if (hasBlockedSameDayInbound && row.readiness_flag === "READY") {
        pushDiagnostic(diagnostics, {
          ruleId: "controlled_realism.restricted_inventory_ready_blocked",
          artifact: `fact_inventory_snapshot[${index}]`,
          message: "must not surface READY status during a blocked same-day third-party receipt.",
        });
      }
    }
  });
}

function validateSnapshotReconciliation({
  approvedPackage,
  generatedRows,
  generationControls,
  diagnostics,
}) {
  const locationByKey = mapRowsByKey(
    approvedPackage.dim_inventory_location,
    "inventory_location_sk",
  );
  const snapshotState = buildLatestSnapshotState({
    inventorySnapshots: approvedPackage.fact_inventory_snapshot,
    inventoryLocations: approvedPackage.dim_inventory_location,
  });
  const generatedDates = [...new Set(
    generatedRows.fact_inventory_snapshot.map((row) => row.snapshot_date),
  )].sort();
  const generatedSnapshotsByDate = groupRowsBy(
    generatedRows.fact_inventory_snapshot,
    (row) => row.snapshot_date,
  );
  const generatedInboundByDate = groupRowsBy(
    generatedRows.fact_inventory_inbound,
    (row) => row.receipt_date,
  );
  const generatedDemandByDate = groupRowsBy(
    generatedRows.fact_demand_line,
    (row) => row.event_date,
  );
  const inboundRuleByPair = new Map(
    generationControls.rule_inventory_inbound.map((row) => [
      `${row.product_sk}|${row.inventory_location_sk}`,
      row,
    ]),
  );

  for (const currentDate of generatedDates) {
    const serviceLocationByProduct = buildServiceLocationMap(snapshotState);
    const servedQtyByPair = new Map();

    for (const row of generatedDemandByDate.get(currentDate) ?? []) {
      const inventoryLocationSk = serviceLocationByProduct.get(row.product_sk);
      if (!inventoryLocationSk) {
        pushDiagnostic(diagnostics, {
          ruleId: "generation.key_resolution_failed",
          artifact: `fact_demand_line.${row.demand_line_sk}`,
          message: "does not resolve to a service inventory location for snapshot reconciliation.",
        });
        continue;
      }
      incrementRollup(
        servedQtyByPair,
        `${row.product_sk}|${inventoryLocationSk}`,
        row.delivered_qty,
      );
    }

    const dueInboundByPair = new Map();
    for (const row of generatedInboundByDate.get(currentDate) ?? []) {
      const pairKey = `${row.product_sk}|${row.inventory_location_sk}`;
      const inboundRule = inboundRuleByPair.get(pairKey);
      const location = locationByKey.get(row.inventory_location_sk);
      const releasableQty = allowsSameDayRelief({
        nodeTypeCode: location?.node_type_code ?? "UNKNOWN",
        receiptFlowType: row.receipt_flow_type,
        inboundRule,
      })
        ? row.receipt_qty
        : 0;

      incrementRollup(dueInboundByPair, pairKey, releasableQty);
    }

    for (const row of generatedSnapshotsByDate.get(currentDate) ?? []) {
      const pairKey = `${row.product_sk}|${row.inventory_location_sk}`;
      const priorState = snapshotState.get(pairKey);

      if (!priorState) {
        pushDiagnostic(diagnostics, {
          ruleId: "generation.snapshot_boundary_broken",
          artifact: `fact_inventory_snapshot.${row.inventory_snapshot_sk}`,
          message: `does not resolve to an approved product-location baseline for ${pairKey}.`,
        });
        continue;
      }

      const expectedOnHand = Math.max(
        priorState.row.on_hand_qty
          + (dueInboundByPair.get(pairKey) ?? 0)
          - (servedQtyByPair.get(pairKey) ?? 0),
        0,
      );

      if (row.on_hand_qty !== expectedOnHand) {
        pushDiagnostic(diagnostics, {
          ruleId: "generation.snapshot_reconciliation_failed",
          artifact: `fact_inventory_snapshot.${row.inventory_snapshot_sk}`,
          message: `must keep on_hand_qty ${expectedOnHand} for ${pairKey} on ${currentDate}, found ${row.on_hand_qty}.`,
        });
      }

      snapshotState.set(pairKey, {
        row,
        location: locationByKey.get(row.inventory_location_sk),
      });
    }
  }
}

function finalizeControlledCandidateValidation({
  sourceDir,
  approvedDir,
  candidateDir,
  controlsDir,
  diagnostics,
  counts,
  generatedRowCounts,
}) {
  const errors = diagnostics
    .filter((diagnostic) => diagnostic.severity === "error")
    .map(formatDiagnosticMessage);

  return {
    sourceDir,
    approvedDir,
    candidateDir,
    controlsDir,
    diagnostics,
    errors,
    counts,
    generated_row_counts: generatedRowCounts,
  };
}

function maxDate(rows, fieldName) {
  return rows.reduce(
    (latest, row) => (row[fieldName] > latest ? row[fieldName] : latest),
    "0000-00-00",
  );
}

function mapRowsByKey(rows, fieldName) {
  return new Map(rows.map((row) => [row[fieldName], row]));
}

function groupRowsBy(rows, deriveKey) {
  const grouped = new Map();

  for (const row of rows) {
    const key = deriveKey(row);
    const bucket = grouped.get(key) ?? [];
    bucket.push(row);
    grouped.set(key, bucket);
  }

  return grouped;
}

function buildLatestSnapshotState({ inventorySnapshots, inventoryLocations }) {
  const locationByKey = new Map(
    inventoryLocations.map((row) => [row.inventory_location_sk, row]),
  );
  const latestRows = new Map();

  for (const row of inventorySnapshots) {
    const key = `${row.product_sk}|${row.inventory_location_sk}`;
    const existing = latestRows.get(key);
    if (!existing || row.snapshot_date > existing.row.snapshot_date) {
      latestRows.set(key, {
        row,
        location: locationByKey.get(row.inventory_location_sk),
      });
    }
  }

  return latestRows;
}

function buildServiceLocationMap(snapshotState) {
  const productCandidates = new Map();

  for (const [pairKey, state] of snapshotState.entries()) {
    const [productSk] = pairKey.split("|");
    const bucket = productCandidates.get(productSk) ?? [];
    bucket.push(state);
    productCandidates.set(productSk, bucket);
  }

  const serviceLocationByProduct = new Map();

  for (const [productSk, candidates] of productCandidates.entries()) {
    const preferred = [...candidates].sort((left, right) => {
      const scoreDelta = serviceLocationScore(right) - serviceLocationScore(left);
      if (scoreDelta !== 0) {
        return scoreDelta;
      }
      return right.row.available_qty - left.row.available_qty;
    })[0];

    serviceLocationByProduct.set(productSk, preferred.row.inventory_location_sk);
  }

  return serviceLocationByProduct;
}

function serviceLocationScore(state) {
  const nodeType = state.location?.node_type_code ?? "UNKNOWN";
  const nodeScore = {
    INTERNAL_WAREHOUSE: 5,
    FLOOR_AREA: 4,
    OVERFLOW_AREA: 3,
    THIRD_PARTY_NODE: 2,
    UNKNOWN: 1,
    TRANSIT_NODE: 0,
    RESTRICTED_AREA: 0,
  };

  return ((state.row.available_qty ?? 0) * 10) + (nodeScore[nodeType] ?? 0);
}

function allowsSameDayRelief({ nodeTypeCode, receiptFlowType, inboundRule }) {
  if (inboundRule && inboundRule.allowed_same_day_relief_flag === false) {
    return false;
  }

  if (receiptFlowType === "KIT_COMPLETION") {
    return true;
  }
  if (nodeTypeCode === "TRANSIT_NODE" || nodeTypeCode === "RESTRICTED_AREA") {
    return false;
  }
  if (nodeTypeCode === "THIRD_PARTY_NODE" && receiptFlowType === "TRANSFER_IN") {
    return false;
  }

  return ["INTERNAL_WAREHOUSE", "FLOOR_AREA", "OVERFLOW_AREA"].includes(nodeTypeCode);
}

function incrementRollup(map, key, increment) {
  map.set(key, (map.get(key) ?? 0) + increment);
}

function pushDiagnostic(
  diagnostics,
  {
    ruleId,
    artifact,
    message,
    severity = "error",
    blocking = true,
  },
) {
  diagnostics.push({
    rule_id: ruleId,
    artifact,
    severity,
    blocking,
    message,
  });
}

function formatDiagnosticMessage(diagnostic) {
  return `[${diagnostic.rule_id}] ${diagnostic.artifact}: ${diagnostic.message}`;
}
