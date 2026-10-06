import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  REPO_ROOT,
  readJsonFile,
  writeJsonFile,
} from "./dimension-build-lib.mjs";
import {
  DEFAULT_GENERATION_CONTROLS_DIR,
  GENERATION_CONTROL_FILENAMES,
  loadPublicationPackage,
} from "./generation-controls-lib.mjs";
import { OPERATING_LOOP_PUBLIC_FILENAMES } from "./operating-loop-lib.mjs";

export const DEFAULT_APPROVED_PUBLICATION_DIR = path.join(
  REPO_ROOT,
  "platform/fabric/publication/current",
);
export const DEFAULT_CANDIDATE_OUTPUT_DIR = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-candidate/current",
);
export const DEFAULT_CONTROLLED_CANDIDATE_REPORT_PATH = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-candidate/controlled-candidate-refresh-report.json",
);

export const PUBLIC_OUTPUT_FILENAMES = {
  dim_product: "dim_product.json",
  dim_product_family: "dim_product_family.json",
  dim_account: "dim_account.json",
  dim_inventory_location: "dim_inventory_location.json",
  fact_demand_line: "fact_demand_line.json",
  fact_inventory_inbound: "fact_inventory_inbound.json",
  fact_inventory_snapshot: "fact_inventory_snapshot.json",
  ...OPERATING_LOOP_PUBLIC_FILENAMES,
};

const HASH_NAMESPACE = "fabric-bmad-controlled-candidate-refresh-v1";
const DEFAULT_WINDOW_DAYS = 2;

export function parseControlledRefreshArgs(argv = process.argv.slice(2)) {
  const parsed = {
    approvedDir: DEFAULT_APPROVED_PUBLICATION_DIR,
    controlsDir: DEFAULT_GENERATION_CONTROLS_DIR,
    outputDir: DEFAULT_CANDIDATE_OUTPUT_DIR,
    reportPath: DEFAULT_CONTROLLED_CANDIDATE_REPORT_PATH,
    windowDays: DEFAULT_WINDOW_DAYS,
    loadTimestampUtc: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--") {
      continue;
    }

    if (arg === "--approved-dir") {
      parsed.approvedDir = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--controls-dir") {
      parsed.controlsDir = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--output") {
      parsed.outputDir = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--report-path") {
      parsed.reportPath = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--window-days") {
      parsed.windowDays = Number.parseInt(next, 10);
      index += 1;
      continue;
    }

    if (arg === "--load-timestamp") {
      parsed.loadTimestampUtc = next;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

export async function loadGenerationControls(controlsDir = DEFAULT_GENERATION_CONTROLS_DIR) {
  const entries = await Promise.all(
    Object.entries(GENERATION_CONTROL_FILENAMES).map(async ([key, filename]) => [
      key,
      await readJsonFile(path.join(controlsDir, filename)),
    ]),
  );

  return Object.fromEntries(entries);
}

export async function loadApprovedPublicationPackage(
  approvedDir = DEFAULT_APPROVED_PUBLICATION_DIR,
) {
  return loadPublicationPackage(approvedDir).then(async (base) => {
    const extended = {
      ...base,
      dim_product_family: await readJsonFile(path.join(approvedDir, "dim_product_family.json")),
      dim_inventory_location: await readJsonFile(
        path.join(approvedDir, "dim_inventory_location.json"),
      ),
      fact_inventory_inbound: await readJsonFile(
        path.join(approvedDir, "fact_inventory_inbound.json"),
      ),
    };

    for (const [tableName, filename] of Object.entries(OPERATING_LOOP_PUBLIC_FILENAMES)) {
      extended[tableName] = await readOptionalJsonRows(path.join(approvedDir, filename));
    }

    return extended;
  });
}

export function buildControlledCandidatePackage({
  approvedPackage,
  generationControls,
  windowDays = DEFAULT_WINDOW_DAYS,
  loadTimestampUtc = new Date().toISOString(),
}) {
  const generatedVersion = buildGeneratedSourceVersion({
    approvedPackage,
    generationControls,
  });
  const nextDates = deriveRefreshDates(approvedPackage, windowDays);
  const dim_product = approvedPackage.dim_product;
  const dim_product_family = approvedPackage.dim_product_family;
  const dim_account = approvedPackage.dim_account;
  const dim_inventory_location = approvedPackage.dim_inventory_location;

  const productByKey = new Map(dim_product.map((row) => [row.product_sk, row]));
  const accountRuleByKey = new Map(
    generationControls.rule_account_generation_profile.map((row) => [row.account_sk, row]),
  );
  const productRuleByKey = new Map(
    generationControls.rule_product_generation_profile.map((row) => [row.product_sk, row]),
  );
  const inboundRuleByPair = new Map(
    generationControls.rule_inventory_inbound.map((row) => [
      `${row.product_sk}|${row.inventory_location_sk}`,
      row,
    ]),
  );
  const pendingReceipts = generationControls.state_pending_receipt.map((row) => ({ ...row }));
  const activeShocks = generationControls.state_entity_shock.map((row) => ({ ...row }));
  const latestDemandState = buildLatestDemandState(approvedPackage.fact_demand_line);
  const snapshotState = buildLatestSnapshotState({
    inventorySnapshots: approvedPackage.fact_inventory_snapshot,
    inventoryLocations: dim_inventory_location,
  });
  const serviceLocationByProduct = buildServiceLocationMap(snapshotState);
  const receiptValuePerUnitByProduct = buildReceiptValueUnitMap(
    approvedPackage.fact_inventory_inbound,
  );

  const newDemandRows = [];
  const newInboundRows = [];
  const newSnapshotRows = [];

  for (const currentDate of nextDates) {
    const dueReceiptRows = materializeInboundForDate({
      currentDate,
      pendingReceipts,
      productByKey,
      inboundRuleByPair,
      generatedVersion,
      loadTimestampUtc,
      receiptValuePerUnitByProduct,
    });
    const inboundQtyByPair = rollupByPair(dueReceiptRows, "receipt_qty");
    newInboundRows.push(...dueReceiptRows);

    const demandOutcome = materializeDemandForDate({
      currentDate,
      latestDemandState,
      eligibilityRows: generationControls.rule_account_product_eligibility,
      accountRuleByKey,
      productRuleByKey,
      activeShocks,
      snapshotState,
      serviceLocationByProduct,
      generatedVersion,
      loadTimestampUtc,
    });
    newDemandRows.push(...demandOutcome.rows);

    const futurePendingQtyByPair = computeFuturePendingQtyByPair({
      pendingReceipts,
      currentDate,
    });
    const nextSnapshotRows = materializeSnapshotForDate({
      currentDate,
      snapshotState,
      dueInboundRows: dueReceiptRows,
      inboundQtyByPair,
      openPressureByPair: demandOutcome.openPressureByPair,
      servedQtyByPair: demandOutcome.servedQtyByPair,
      futurePendingQtyByPair,
      generatedVersion,
      loadTimestampUtc,
    });
    newSnapshotRows.push(...nextSnapshotRows);
    for (const row of nextSnapshotRows) {
      const key = `${row.product_sk}|${row.inventory_location_sk}`;
      snapshotState.set(key, {
        ...snapshotState.get(key),
        row,
      });
    }
  }

  return {
    dim_product,
    dim_product_family,
    dim_account,
    dim_inventory_location,
    fact_demand_line: [
      ...approvedPackage.fact_demand_line,
      ...newDemandRows,
    ],
    fact_inventory_inbound: [
      ...approvedPackage.fact_inventory_inbound,
      ...newInboundRows,
    ],
    fact_inventory_snapshot: [
      ...approvedPackage.fact_inventory_snapshot,
      ...newSnapshotRows,
    ],
    ...Object.fromEntries(
      Object.keys(OPERATING_LOOP_PUBLIC_FILENAMES).map((tableName) => [
        tableName,
        approvedPackage[tableName] ?? [],
      ]),
    ),
    metadata: {
      generated_source_version: generatedVersion,
      generated_dates: nextDates,
      new_demand_rows: newDemandRows.length,
      new_inbound_rows: newInboundRows.length,
      new_snapshot_rows: newSnapshotRows.length,
    },
  };
}

async function readOptionalJsonRows(filePath) {
  try {
    return await readJsonFile(filePath);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export async function buildControlledCandidatePackageToDirectory(options = {}) {
  const approvedDir = options.approvedDir ?? DEFAULT_APPROVED_PUBLICATION_DIR;
  const controlsDir = options.controlsDir ?? DEFAULT_GENERATION_CONTROLS_DIR;
  const outputDir = options.outputDir ?? DEFAULT_CANDIDATE_OUTPUT_DIR;
  const reportPath =
    options.reportPath ?? DEFAULT_CONTROLLED_CANDIDATE_REPORT_PATH;
  const approvedPackage = await loadApprovedPublicationPackage(approvedDir);
  const generationControls = await loadGenerationControls(controlsDir);
  const candidatePackage = buildControlledCandidatePackage({
    approvedPackage,
    generationControls,
    windowDays: options.windowDays,
    loadTimestampUtc: options.loadTimestampUtc,
  });

  await Promise.all(
    Object.entries(PUBLIC_OUTPUT_FILENAMES).map(([key, filename]) =>
      writeJsonFile(path.join(outputDir, filename), candidatePackage[key]),
    ),
  );

  const report = {
    run_type: "controlled_candidate_refresh",
    approved_dir: approvedDir,
    controls_dir: controlsDir,
    output_dir: outputDir,
    report_path: reportPath,
    load_timestamp_utc: options.loadTimestampUtc ?? new Date().toISOString(),
    metadata: candidatePackage.metadata,
  };

  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  return {
    approvedDir,
    controlsDir,
    outputDir,
    reportPath,
    candidatePackage,
    report,
  };
}

function buildLatestDemandState(rows) {
  const latestRows = new Map();

  for (const row of rows) {
    const key = `${row.account_sk}|${row.product_sk}`;
    const existing = latestRows.get(key);
    if (!existing || row.event_date > existing.event_date) {
      latestRows.set(key, row);
    }
  }

  return latestRows;
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

  for (const [key, state] of snapshotState.entries()) {
    const [productSk] = key.split("|");
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

function buildReceiptValueUnitMap(rows) {
  const map = new Map();

  for (const row of rows) {
    if (!row.receipt_qty) {
      continue;
    }
    map.set(row.product_sk, row.receipt_value_proxy / row.receipt_qty);
  }

  return map;
}

function materializeInboundForDate({
  currentDate,
  pendingReceipts,
  productByKey,
  inboundRuleByPair,
  generatedVersion,
  loadTimestampUtc,
  receiptValuePerUnitByProduct,
}) {
  const dueRows = [];

  for (const row of pendingReceipts) {
    if (row.expected_release_date !== currentDate) {
      continue;
    }

    const pairKey = `${row.product_sk}|${row.inventory_location_sk}`;
    const inboundRule = inboundRuleByPair.get(pairKey);
    const product = productByKey.get(row.product_sk);
    const unitReceiptValue =
      receiptValuePerUnitByProduct.get(row.product_sk)
      ?? fallbackUnitValue(product?.unit_economic_band_code ?? "BAND_E0");

    dueRows.push({
      inventory_inbound_sk: stableId("INB", `${pairKey}|${currentDate}|${row.receipt_flow_type}`),
      product_sk: row.product_sk,
      inventory_location_sk: row.inventory_location_sk,
      receipt_date: currentDate,
      receipt_qty: toInteger(row.pending_qty),
      receipt_flow_type: row.receipt_flow_type,
      receipt_value_proxy: Math.round(unitReceiptValue * toInteger(row.pending_qty)),
      record_source_family: "inventory_receipt_domain",
      source_file_version: generatedVersion,
      record_status: inboundRule ? "generated-active" : "generated-fallback",
      publication_safety_flag: "publication_safe",
      load_timestamp_utc: loadTimestampUtc,
    });
  }

  return dueRows.sort((left, right) =>
    `${left.product_sk}|${left.inventory_location_sk}`.localeCompare(
      `${right.product_sk}|${right.inventory_location_sk}`,
    ),
  );
}

function materializeDemandForDate({
  currentDate,
  latestDemandState,
  eligibilityRows,
  accountRuleByKey,
  productRuleByKey,
  activeShocks,
  snapshotState,
  serviceLocationByProduct,
  generatedVersion,
  loadTimestampUtc,
}) {
  const rows = [];
  const openPressureByPair = new Map();
  const servedQtyByPair = new Map();

  for (const eligibilityRow of [...eligibilityRows].sort((left, right) =>
    `${left.account_sk}|${left.product_sk}`.localeCompare(
      `${right.account_sk}|${right.product_sk}`,
    ),
  )) {
    const pairKey = `${eligibilityRow.account_sk}|${eligibilityRow.product_sk}`;
    const previousRow = latestDemandState.get(pairKey);
    const accountRule = accountRuleByKey.get(eligibilityRow.account_sk);
    const productRule = productRuleByKey.get(eligibilityRow.product_sk);
    const demandQty = deriveDemandQty({
      currentDate,
      pairKey,
      previousRow,
      accountRule,
      activeShocks,
    });
    const serviceLocationSk = serviceLocationByProduct.get(eligibilityRow.product_sk);
    const snapshotKey = `${eligibilityRow.product_sk}|${serviceLocationSk}`;
    const state = snapshotState.get(snapshotKey);
    const availableQty = state?.row.available_qty ?? 0;
    const servedQty = Math.min(demandQty, Math.max(availableQty, 0));
    const openQty = Math.max(demandQty - servedQty, 0);
    const priorUnitValue =
      previousRow && previousRow.demand_qty > 0
        ? previousRow.demand_value_proxy / previousRow.demand_qty
        : fallbackUnitValue(productRule?.unit_cost_drift_band_code ?? "COST_DRIFT_05_09");
    const demandValueProxy = Math.round(priorUnitValue * demandQty);
    const priorMarginRate =
      previousRow && previousRow.demand_value_proxy > 0
        ? previousRow.gross_margin_proxy / previousRow.demand_value_proxy
        : fallbackMarginRate(productRule?.target_margin_band_code ?? "MARGIN_28_32");
    const grossMarginProxy = Math.round(demandValueProxy * priorMarginRate);
    const requestLagDays = deriveRequestLagDays(accountRule?.order_frequency_code ?? "IRREGULAR");

    const demandRow = {
      demand_line_sk: stableId("DMD", `${pairKey}|${currentDate}`),
      product_sk: eligibilityRow.product_sk,
      account_sk: eligibilityRow.account_sk,
      event_date: currentDate,
      requested_delivery_date: addIsoDays(currentDate, requestLagDays),
      demand_status_code: openQty > 0
        ? (servedQty > 0 ? "PARTIALLY_FULFILLED" : "OPEN")
        : "FULFILLED",
      demand_qty: demandQty,
      delivered_qty: servedQty,
      open_qty: openQty,
      order_group_code: stableCode("ORDER_GROUP", `${pairKey}|${currentDate}`),
      priority_code: openQty > 0 || demandQty >= 20 ? "HIGH" : "MEDIUM",
      demand_value_proxy: demandValueProxy,
      gross_margin_proxy: grossMarginProxy,
      record_source_family: "sales_activity_domain",
      source_file_version: generatedVersion,
      record_status:
        eligibilityRow.eligibility_status_code === "OBSERVED_FALLBACK"
          ? "generated-fallback"
          : "generated-active",
      publication_safety_flag: "publication_safe",
      load_timestamp_utc: loadTimestampUtc,
    };

    rows.push(demandRow);
    latestDemandState.set(pairKey, demandRow);
    incrementRollup(servedQtyByPair, snapshotKey, servedQty);
    incrementRollup(openPressureByPair, snapshotKey, openQty);
  }

  return {
    rows,
    servedQtyByPair,
    openPressureByPair,
  };
}

function materializeSnapshotForDate({
  currentDate,
  snapshotState,
  dueInboundRows,
  inboundQtyByPair,
  openPressureByPair,
  servedQtyByPair,
  futurePendingQtyByPair,
  generatedVersion,
  loadTimestampUtc,
}) {
  const dueInboundPairMap = new Map(
    dueInboundRows.map((row) => [
      `${row.product_sk}|${row.inventory_location_sk}`,
      row,
    ]),
  );

  return [...snapshotState.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([pairKey, state]) => {
      const inboundRule = state.inboundRule ?? null;
      const dueInboundQty = inboundQtyByPair.get(pairKey) ?? 0;
      const dueInboundRow = dueInboundPairMap.get(pairKey);
      const releasableInboundQty =
        dueInboundRow && state.location && allowsInboundRelief(state.location.node_type_code, dueInboundRow.receipt_flow_type)
          ? dueInboundQty
          : 0;
      const carriedTransitQty = dueInboundQty - releasableInboundQty;
      const servedQty = servedQtyByPair.get(pairKey) ?? 0;
      const nextOnHandQty = Math.max(state.row.on_hand_qty + releasableInboundQty - servedQty, 0);
      const nextFuturePendingQty = (futurePendingQtyByPair.get(pairKey) ?? 0) + carriedTransitQty;
      const nextReservedQty = Math.min(nextOnHandQty, openPressureByPair.get(pairKey) ?? 0);
      const nextAvailableQty = deriveAvailableQty({
        nodeTypeCode: state.location?.node_type_code ?? "UNKNOWN",
        onHandQty: nextOnHandQty,
        reservedQty: nextReservedQty,
        futurePendingQty: nextFuturePendingQty,
      });
      const nextInventoryStatus = deriveInventoryStatus({
        nodeTypeCode: state.location?.node_type_code ?? "UNKNOWN",
        availableQty: nextAvailableQty,
        futurePendingQty: nextFuturePendingQty,
      });
      const nextReadinessFlag =
        nextInventoryStatus === "READY" && nextAvailableQty > 0 ? "READY" : "AT_RISK";

      return {
        inventory_snapshot_sk: stableId("INV", `${pairKey}|${currentDate}`),
        product_sk: state.row.product_sk,
        inventory_location_sk: state.row.inventory_location_sk,
        snapshot_date: currentDate,
        on_hand_qty: nextOnHandQty,
        available_qty: nextAvailableQty,
        inventory_status_code: nextInventoryStatus,
        reserved_qty: nextReservedQty,
        in_transit_qty: nextFuturePendingQty,
        inventory_value_proxy: state.row.inventory_value_proxy,
        node_value_concentration_band: state.row.node_value_concentration_band,
        readiness_flag: nextReadinessFlag,
        record_source_family: "inventory_position_domain",
        source_file_version: generatedVersion,
        record_status: "generated-active",
        publication_safety_flag: "publication_safe",
        load_timestamp_utc: loadTimestampUtc,
      };
    });
}

function computeFuturePendingQtyByPair({ pendingReceipts, currentDate }) {
  const rollup = new Map();

  for (const row of pendingReceipts) {
    if (row.expected_release_date <= currentDate) {
      continue;
    }
    incrementRollup(
      rollup,
      `${row.product_sk}|${row.inventory_location_sk}`,
      toInteger(row.pending_qty),
    );
  }

  return rollup;
}

function rollupByPair(rows, fieldName) {
  const rollup = new Map();
  for (const row of rows) {
    incrementRollup(
      rollup,
      `${row.product_sk}|${row.inventory_location_sk}`,
      toInteger(row[fieldName]),
    );
  }
  return rollup;
}

function incrementRollup(map, key, increment) {
  map.set(key, (map.get(key) ?? 0) + increment);
}

function deriveDemandQty({ currentDate, pairKey, previousRow, accountRule, activeShocks }) {
  const previousQty = Math.max(previousRow?.demand_qty ?? 1, 1);
  const dailyGrowthFactor = 1 + (qoqMidpoint(accountRule?.baseline_qoq_growth_band_code ?? "QOQ_00_02") / 90);
  const seasonalityFactor = seasonalityMultiplier(
    accountRule?.seasonality_profile_code ?? "FLAT_BASELINE",
    currentDate,
  );
  const shockFactor = shockMultiplier(activeShocks, pairKey, currentDate);
  const jitter = 1 + boundedHash(pairKey, currentDate, "qty", 0.03);

  return Math.max(
    1,
    Math.round(previousQty * dailyGrowthFactor * seasonalityFactor * shockFactor * jitter),
  );
}

function qoqMidpoint(code) {
  const map = {
    QOQ_00_02: 0.01,
    QOQ_01_03: 0.02,
    QOQ_02_04: 0.03,
    QOQ_02_045: 0.0325,
  };
  return map[code] ?? 0.01;
}

function seasonalityMultiplier(code, isoDate) {
  const month = Number.parseInt(isoDate.slice(5, 7), 10);

  if (code === "JANUARY_DIP_SPRING_RECOVERY") {
    if (month === 1) {
      return 0.93;
    }
    if (month === 2) {
      return 0.98;
    }
    if ([3, 4, 5].includes(month)) {
      return 1.06;
    }
    return 1.0;
  }

  if (code === "INSTALLATION_SEASON_LIFT") {
    return [4, 5, 6, 7, 8, 9].includes(month) ? 1.08 : 0.98;
  }

  if (code === "QUARTER_END_PUSH") {
    return [3, 6, 9, 12].includes(month) ? 1.08 : 1.0;
  }

  return 1.0;
}

function shockMultiplier(activeShocks, pairKey, currentDate) {
  const shock = activeShocks.find(
    (row) =>
      row.entity_scope_code === "ACCOUNT_PRODUCT"
      && row.entity_key === pairKey
      && row.shock_start_date <= currentDate
      && row.cooldown_end_date >= currentDate,
  );

  if (!shock) {
    return 1.0;
  }

  if (shock.shock_profile_code === "TEMPORARY_DEMAND_DROP") {
    return 0.85;
  }
  if (shock.shock_profile_code === "PROJECT_RAMP_UP") {
    return 1.25;
  }
  return 1.0;
}

function deriveRequestLagDays(orderFrequencyCode) {
  const map = {
    WEEKLY_REPLENISH: 3,
    PROJECT_MILESTONE: 10,
    BATCHED_MONTHLY: 5,
    IRREGULAR: 7,
  };
  return map[orderFrequencyCode] ?? 5;
}

function deriveAvailableQty({ nodeTypeCode, onHandQty, reservedQty, futurePendingQty }) {
  if (nodeTypeCode === "RESTRICTED_AREA") {
    return 0;
  }
  if (nodeTypeCode === "TRANSIT_NODE") {
    return 0;
  }
  if (futurePendingQty > 0 && nodeTypeCode === "THIRD_PARTY_NODE") {
    return Math.max(Math.min(onHandQty - reservedQty, onHandQty), 0);
  }
  return Math.max(onHandQty - reservedQty, 0);
}

function deriveInventoryStatus({ nodeTypeCode, availableQty, futurePendingQty }) {
  if (nodeTypeCode === "TRANSIT_NODE" || futurePendingQty > 0 && nodeTypeCode === "TRANSIT_NODE") {
    return "IN_TRANSIT";
  }
  if (nodeTypeCode === "RESTRICTED_AREA") {
    return "RESTRICTED";
  }
  if (availableQty > 0) {
    return "READY";
  }
  return "AT_RISK";
}

function allowsInboundRelief(nodeTypeCode, receiptFlowType) {
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

function buildGeneratedSourceVersion({ approvedPackage, generationControls }) {
  const approvedVersion =
    approvedPackage.dim_product[0]?.source_file_version ?? "approved_publication";
  const ruleVersion =
    generationControls.rule_account_generation_profile[0]?.rule_version ?? "logic_first_controls";
  return `${approvedVersion}__${ruleVersion}`;
}

function deriveRefreshDates(approvedPackage, windowDays) {
  const latestDate = [
    ...approvedPackage.fact_demand_line.map((row) => row.event_date),
    ...approvedPackage.fact_inventory_snapshot.map((row) => row.snapshot_date),
  ].sort().at(-1);

  const dates = [];
  let current = addIsoDays(latestDate, 1);

  for (let index = 0; index < windowDays; index += 1) {
    dates.push(current);
    current = addIsoDays(current, 1);
  }

  return dates;
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
  }[nodeType] ?? 0;

  return (state.row.available_qty * 10) + nodeScore;
}

function fallbackUnitValue(code) {
  const map = {
    BAND_E1: 23,
    BAND_E2: 37,
    BAND_E3: 66,
    BAND_E4: 109,
    COST_DRIFT_05_09: 44,
  };
  return map[code] ?? 12;
}

function fallbackMarginRate(code) {
  const map = {
    MARGIN_24_29: 0.265,
    MARGIN_26_31: 0.285,
    MARGIN_28_32: 0.30,
    MARGIN_29_33: 0.31,
    MARGIN_32_37: 0.345,
  };
  return map[code] ?? 0.28;
}

function boundedHash(entityKey, currentDate, salt, maxFraction) {
  const digest = createHash("sha256")
    .update(`${HASH_NAMESPACE}|${entityKey}|${currentDate}|${salt}`)
    .digest("hex");
  const raw = Number.parseInt(digest.slice(0, 8), 16) / 0xffffffff;
  return (raw * 2 * maxFraction) - maxFraction;
}

function stableId(prefix, key) {
  const digest = createHash("sha256")
    .update(`${HASH_NAMESPACE}|${prefix}|${key}`)
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();
  return `${prefix}_SK_${digest}`;
}

function stableCode(prefix, key) {
  const digest = createHash("sha256")
    .update(`${HASH_NAMESPACE}|${prefix}|${key}`)
    .digest("hex")
    .slice(0, 6)
    .toUpperCase();
  return `${prefix}_${digest}`;
}

function addIsoDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function toInteger(value) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? Math.trunc(numeric) : 0;
}
