import { mkdir, readFile, rename, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  OUTPUT_FILENAMES,
  REPO_ROOT,
  readJsonFile,
  writeJsonFile,
} from "./dimension-build-lib.mjs";
import { DEFAULT_FINANCIAL_FOUNDATION_DIR } from "./financial-analytics-lib.mjs";
import { OPERATING_LOOP_PUBLIC_FILENAMES } from "./operating-loop-lib.mjs";

export const DEFAULT_PUBLIC_SERVING_EXTRACT_CONTRACT_REFERENCE =
  "platform/fabric/contracts/public-serving-extract-contract.md";
export const DEFAULT_GOLD_REFERENCE_DIR = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-proof/fab001/current/reference/gold",
);
export const DEFAULT_APPROVED_PUBLICATION_DIR = path.join(
  REPO_ROOT,
  "platform/fabric/publication/current",
);
export const DEFAULT_PUBLIC_SERVING_EXTRACT_DIR = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-public-serving-extract/current",
);
export const DEFAULT_PUBLIC_SERVING_EXTRACT_REPORT_PATH = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-public-serving-extract/materialization-report.json",
);
export const DEFAULT_WEB_PUBLIC_SERVING_EXTRACT_DIR = path.join(
  REPO_ROOT,
  "apps/public-site/src/data/public-serving/current",
);
export const DEFAULT_CURRENT_RELEASE_POINTER_PATH = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/release-ledger/current-release.json",
);
export const DEFAULT_FINANCIAL_FOUNDATION_INPUT_DIR = DEFAULT_FINANCIAL_FOUNDATION_DIR;

export const PUBLIC_SERVING_EXTRACT_FILENAMES = [
  "action-queue.json",
  "decision-summary.json",
  "demand-support-account-pattern.json",
  "demand-support-product-family.json",
  "financial-summary.json",
  "manifest.json",
  "monthly-financial-trend.json",
  "operating-loop-summary.json",
  "purchase-order-summary.json",
  "public-policy-reference.json",
  "source-slice-summary.json",
  "inventory-location-action-summary.json",
  "inventory-movement-summary.json",
  "logistics-decision-queue-summary.json",
  "sales-dashboard-summary.json",
  "sales-fulfillment-summary.json",
  "supply-chain-decision-queue-summary.json",
  "unit-economics-reference.json",
].sort();

const PUBLICATION_TABLE_METADATA = {
  dim_product: {
    countLabel: "product entities",
    domain: "Product reference domain",
    purpose:
      "Carries product classes, policy signals, lead-time bands, and the public product identifiers used by the case.",
  },
  dim_product_family: {
    countLabel: "family entities",
    domain: "Classification reference domain",
    purpose:
      "Keeps the product-family layer explicit so demand and inventory can still be grouped into interpretable classes.",
  },
  dim_account: {
    countLabel: "account entities",
    domain: "Account reference domain",
    purpose:
      "Carries public-safe customer patterns so the demand view can explain commercial pressure without exposing identities.",
  },
  dim_inventory_location: {
    countLabel: "location entities",
    domain: "Location reference domain",
    purpose:
      "Keeps site and node-role context visible so the case still reads as multi-location inventory support.",
  },
  fact_demand_line: {
    countLabel: "demand lines",
    domain: "Sales activity domain",
    purpose:
      "Supplies the demand-history and open-demand pressure that feed the supporting sales-side read of the case.",
  },
  fact_inventory_inbound: {
    countLabel: "approved inbound receipts",
    domain: "Inventory receipt domain",
    purpose:
      "Carries approved inbound movement so the public slice can explain how inventory enters the bounded loop.",
  },
  fact_inventory_snapshot: {
    countLabel: "inventory positions",
    domain: "Inventory position domain",
    purpose:
      "Supplies the current inventory posture, availability, and readiness state used by the primary decision view.",
  },
  dim_service_region: {
    countLabel: "service regions",
    domain: "Public-safe service-region domain",
    purpose:
      "Supports regional dashboard slicing without exposing real geography.",
  },
  dim_supplier: {
    countLabel: "supplier entities",
    domain: "Supplier reference domain",
    purpose:
      "Supports bounded replenishment analysis without exposing real supplier identities.",
  },
  rule_supplier_product_lead_time: {
    countLabel: "supplier-product lead-time rules",
    domain: "Supply-chain planning rules",
    purpose:
      "Defines allowed supplier, product, and receiving-location lead-time rules for purchase-order planning.",
  },
  rule_location_transfer_lead_time: {
    countLabel: "location transfer rules",
    domain: "Logistics planning rules",
    purpose:
      "Defines bounded origin-destination transfer lead times for inventory movement planning.",
  },
  rule_location_service_lead_time: {
    countLabel: "service lead-time rules",
    domain: "Fulfillment planning rules",
    purpose:
      "Defines bounded fulfillment-location service timing by public-safe service region.",
  },
  fact_supply_chain_decision_queue_line: {
    countLabel: "supply-chain decision lines",
    domain: "Supply-chain recommendation domain",
    purpose:
      "Carries replenishment recommendations before they become purchase-order execution facts.",
  },
  fact_logistics_decision_queue_line: {
    countLabel: "logistics decision lines",
    domain: "Logistics recommendation domain",
    purpose:
      "Carries transfer and fulfillment recommendations before they become movement or fulfillment events.",
  },
  fact_purchase_order_line: {
    countLabel: "purchase-order lines",
    domain: "Purchase-order execution domain",
    purpose:
      "Shows which approved replenishment decisions became bounded purchase-order line events.",
  },
  fact_purchase_order_status_history: {
    countLabel: "purchase-order status rows",
    domain: "Purchase-order status domain",
    purpose:
      "Keeps traceability between planned, ordered, and received purchase-order states.",
  },
  fact_inventory_movement_line: {
    countLabel: "inventory movement lines",
    domain: "Inventory movement execution domain",
    purpose:
      "Shows bounded transfer shipments, in-transit quantities, and receipts between public-safe locations.",
  },
  fact_sales_fulfillment_line: {
    countLabel: "sales fulfillment lines",
    domain: "Sales fulfillment execution domain",
    purpose:
      "Ties demand lines to inventory consumption, delivered quantity, backorder quantity, and bounded COGS.",
  },
};

export function parsePublicServingExtractArgs(argv = process.argv.slice(2)) {
  const parsed = {
    goldReferenceDir: DEFAULT_GOLD_REFERENCE_DIR,
    approvedPublicationDir: DEFAULT_APPROVED_PUBLICATION_DIR,
    outputDir: DEFAULT_PUBLIC_SERVING_EXTRACT_DIR,
    reportPath: DEFAULT_PUBLIC_SERVING_EXTRACT_REPORT_PATH,
    siteOutputDir: DEFAULT_WEB_PUBLIC_SERVING_EXTRACT_DIR,
    currentReleasePointerPath: DEFAULT_CURRENT_RELEASE_POINTER_PATH,
    financialFoundationDir: DEFAULT_FINANCIAL_FOUNDATION_INPUT_DIR,
    recordedAtUtc: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--") {
      continue;
    }
    if (arg === "--gold-reference-dir") {
      parsed.goldReferenceDir = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--approved-publication-dir") {
      parsed.approvedPublicationDir = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--output-dir") {
      parsed.outputDir = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--report-path") {
      parsed.reportPath = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--site-output-dir") {
      parsed.siteOutputDir = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--current-release-pointer-path") {
      parsed.currentReleasePointerPath = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--financial-foundation-dir") {
      parsed.financialFoundationDir = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--recorded-at-utc") {
      parsed.recordedAtUtc = next;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

export async function materializeFabricPublicServingExtract(options = {}) {
  const goldReferenceDir = path.resolve(options.goldReferenceDir ?? DEFAULT_GOLD_REFERENCE_DIR);
  const approvedPublicationDir = path.resolve(
    options.approvedPublicationDir ?? DEFAULT_APPROVED_PUBLICATION_DIR,
  );
  const outputDir = path.resolve(options.outputDir ?? DEFAULT_PUBLIC_SERVING_EXTRACT_DIR);
  const reportPath = path.resolve(options.reportPath ?? DEFAULT_PUBLIC_SERVING_EXTRACT_REPORT_PATH);
  const siteOutputDir = path.resolve(
    options.siteOutputDir ?? DEFAULT_WEB_PUBLIC_SERVING_EXTRACT_DIR,
  );
  const currentReleasePointerPath = path.resolve(
    options.currentReleasePointerPath ?? DEFAULT_CURRENT_RELEASE_POINTER_PATH,
  );
  const financialFoundationDir = path.resolve(
    options.financialFoundationDir ?? DEFAULT_FINANCIAL_FOUNDATION_INPUT_DIR,
  );
  const recordedAtUtc = options.recordedAtUtc ?? new Date().toISOString();

  const [
    actionQueueRows,
    decisionSummaryRows,
    accountPatternRows,
    productFamilyRows,
    policyRows,
    supplyChainDecisionQueueSummaryRows,
    purchaseOrderSummaryRows,
    logisticsDecisionQueueSummaryRows,
    inventoryMovementSummaryRows,
    salesFulfillmentSummaryRows,
    salesDashboardSummaryRows,
    inventoryLocationActionSummaryRows,
  ] = await Promise.all([
    readCsvRows(path.join(goldReferenceDir, "gold_supply_chain_action_queue.csv")),
    readCsvRows(path.join(goldReferenceDir, "gold_supply_chain_decision_summary.csv")),
    readCsvRows(path.join(goldReferenceDir, "gold_demand_support_account_pattern.csv")),
    readCsvRows(path.join(goldReferenceDir, "gold_demand_support_product_family.csv")),
    readCsvRows(path.join(goldReferenceDir, "gold_public_policy_reference.csv")),
    readOptionalCsvRows(path.join(goldReferenceDir, "gold_supply_chain_decision_queue_summary.csv")),
    readOptionalCsvRows(path.join(goldReferenceDir, "gold_purchase_order_summary.csv")),
    readOptionalCsvRows(path.join(goldReferenceDir, "gold_logistics_decision_queue_summary.csv")),
    readOptionalCsvRows(path.join(goldReferenceDir, "gold_inventory_movement_summary.csv")),
    readOptionalCsvRows(path.join(goldReferenceDir, "gold_sales_fulfillment_summary.csv")),
    readOptionalCsvRows(path.join(goldReferenceDir, "gold_sales_dashboard_summary.csv")),
    readOptionalCsvRows(path.join(goldReferenceDir, "gold_inventory_location_action_summary.csv")),
  ]);
  const publicationTables = await loadApprovedPublicationTables(approvedPublicationDir);
  const financialFoundationTables = await loadFinancialFoundationTables(financialFoundationDir);
  const currentReleasePointer = await readOptionalJsonFile(currentReleasePointerPath);

  if (decisionSummaryRows.length === 0) {
    throw new Error("Public serving extract requires a non-empty gold_supply_chain_decision_summary.");
  }

  const decisionSummary = buildDecisionSummary({
    goldDecisionSummary: decisionSummaryRows[0],
    demandLines: publicationTables.fact_demand_line,
    inventorySnapshots: publicationTables.fact_inventory_snapshot,
  });
  const financialSummary = buildFinancialSummary({
    decisionSummary,
    demandLines: publicationTables.fact_demand_line,
    inventorySnapshots: publicationTables.fact_inventory_snapshot,
    salesRealization: financialFoundationTables.fact_sales_realization,
  });
  const monthlyFinancialTrend = buildMonthlyFinancialTrend({
    demandLines: publicationTables.fact_demand_line,
    inventorySnapshots: publicationTables.fact_inventory_snapshot,
    salesRealization: financialFoundationTables.fact_sales_realization,
  });
  const unitEconomicsReference = buildUnitEconomicsReference({
    products: publicationTables.dim_product,
    productFamilies: publicationTables.dim_product_family,
    demandLines: publicationTables.fact_demand_line,
    inventorySnapshots: publicationTables.fact_inventory_snapshot,
  });
  const sourceSliceSummary = buildSourceSliceSummary({
    publicationTables,
    decisionSummary,
  });
  const publicPolicyReference = dedupeRows(policyRows, [
    "inventory_policy_class",
    "inventory_policy_label",
    "criticality_band",
    "target_service_level_band",
    "coverage_target_band",
    "lead_time_band",
    "service_profile",
  ]);
  const operatingLoopSummary = buildOperatingLoopSummary({
    publicationTables,
    supplyChainDecisionQueueSummaryRows,
    purchaseOrderSummaryRows,
    logisticsDecisionQueueSummaryRows,
    inventoryMovementSummaryRows,
    salesFulfillmentSummaryRows,
    salesDashboardSummaryRows,
    inventoryLocationActionSummaryRows,
  });

  const outputBundle = {
    "decision-summary.json": decisionSummary,
    "action-queue.json": actionQueueRows,
    "demand-support-account-pattern.json": accountPatternRows,
    "demand-support-product-family.json": productFamilyRows,
    "financial-summary.json": financialSummary,
    "monthly-financial-trend.json": monthlyFinancialTrend,
    "operating-loop-summary.json": operatingLoopSummary,
    "supply-chain-decision-queue-summary.json": supplyChainDecisionQueueSummaryRows,
    "purchase-order-summary.json": purchaseOrderSummaryRows,
    "logistics-decision-queue-summary.json": logisticsDecisionQueueSummaryRows,
    "inventory-movement-summary.json": inventoryMovementSummaryRows,
    "sales-fulfillment-summary.json": salesFulfillmentSummaryRows,
    "sales-dashboard-summary.json": salesDashboardSummaryRows,
    "inventory-location-action-summary.json": inventoryLocationActionSummaryRows,
    "public-policy-reference.json": publicPolicyReference,
    "source-slice-summary.json": sourceSliceSummary,
    "unit-economics-reference.json": unitEconomicsReference,
  };

  const repoFiles = Object.entries(outputBundle).map(([filename, value]) => ({
    filename,
    row_count: Array.isArray(value) ? value.length : 1,
    path: toRepoRelative(path.join(outputDir, filename)),
  }));
  const manifest = {
    report_type: "fab001_public_serving_extract_manifest",
    generated_at_utc: recordedAtUtc,
    contract_reference: DEFAULT_PUBLIC_SERVING_EXTRACT_CONTRACT_REFERENCE,
    release_id: currentReleasePointer?.release_id ?? null,
    derivation_mode: "fabric_reference_gold_local_extract",
    source_gold_reference_dir: toRepoRelative(goldReferenceDir),
    approved_bronze_input_dir: toRepoRelative(approvedPublicationDir),
    financial_foundation_dir: toRepoRelative(financialFoundationDir),
    extract_dir: toRepoRelative(outputDir),
    site_mirror_dir: toRepoRelative(siteOutputDir),
    active_public_source_mode: "fabric_serving_extract",
    files: repoFiles,
  };

  await writeJsonBundle(outputDir, {
    ...outputBundle,
    "manifest.json": manifest,
  });
  await writeJsonBundle(siteOutputDir, {
    ...outputBundle,
    "manifest.json": manifest,
  });

  const report = {
    report_type: "fab001_public_serving_extract_materialization",
    recorded_at_utc: recordedAtUtc,
    contract_reference: DEFAULT_PUBLIC_SERVING_EXTRACT_CONTRACT_REFERENCE,
    release_id: currentReleasePointer?.release_id ?? null,
    status: "produced_from_reference_gold",
    produced: true,
    active_public_source_mode: "fabric_serving_extract",
    target_public_source_mode: "fabric_serving_extract",
    active_reference: toRepoRelative(siteOutputDir),
    note:
      "The public site now consumes a bounded Fabric-derived serving extract mirrored into the site repo. The extract is currently produced from bounded Gold reference outputs while the approved repo package remains the Bronze-input provenance source.",
    materialization_report_path: toRepoRelative(reportPath),
    extract_dir: toRepoRelative(outputDir),
    site_mirror_dir: toRepoRelative(siteOutputDir),
    source_gold_reference_dir: toRepoRelative(goldReferenceDir),
    approved_bronze_input_dir: toRepoRelative(approvedPublicationDir),
    financial_foundation_dir: toRepoRelative(financialFoundationDir),
    files: repoFiles.map((file) => ({
      ...file,
      site_path: toRepoRelative(path.join(siteOutputDir, file.filename)),
    })),
    note:
      "The public site now consumes a bounded Fabric-derived serving extract mirrored into the site repo from governed Gold-reference artifacts.",
  };
  await writeJsonFile(reportPath, report);

  return {
    materialization_report: report,
    materialization_report_path: reportPath,
    extract_dir: outputDir,
    site_mirror_dir: siteOutputDir,
  };
}

async function loadApprovedPublicationTables(approvedPublicationDir) {
  const publicationFilenames = {
    ...OUTPUT_FILENAMES,
    ...OPERATING_LOOP_PUBLIC_FILENAMES,
  };
  const entries = await Promise.all(
    Object.entries(publicationFilenames).map(async ([tableName, filename]) => [
      tableName,
      await readJsonFile(path.join(approvedPublicationDir, filename)),
    ]),
  );
  return Object.fromEntries(entries);
}

async function loadFinancialFoundationTables(financialFoundationDir) {
  const entries = await Promise.all(
    [
      "dim_pricing_context",
      "dim_cost_context",
      "fact_cost_history",
      "fact_price_list_history",
      "fact_sales_realization",
    ].map(async (tableName) => [
      tableName,
      await readJsonFile(path.join(financialFoundationDir, `${tableName}.json`)),
    ]),
  );
  return Object.fromEntries(entries);
}

function buildDecisionSummary({ goldDecisionSummary, demandLines, inventorySnapshots }) {
  const latestDemandMonth = goldDecisionSummary.latest_demand_month ?? "";
  const totalDemandValueProxy = demandLines.reduce(
    (sum, row) => sum + Number(row.demand_value_proxy ?? 0),
    0,
  );
  const latestMonthDemandLines = latestDemandMonth
    ? demandLines.filter((row) => String(row.event_date ?? "").startsWith(latestDemandMonth))
    : [];
  const latestMonthOpenQty = latestMonthDemandLines.reduce(
    (sum, row) => sum + Number(row.open_qty ?? 0),
    0,
  );
  const latestMonthDemandValueProxy = latestMonthDemandLines.reduce(
    (sum, row) => sum + Number(row.demand_value_proxy ?? 0),
    0,
  );
  const latestInventoryDate = goldDecisionSummary.latest_inventory_date ?? "";
  const currentSnapshots = latestInventoryDate
    ? inventorySnapshots.filter((row) => row.snapshot_date === latestInventoryDate)
    : inventorySnapshots;

  return {
    ...goldDecisionSummary,
    total_demand_value_proxy: totalDemandValueProxy,
    latest_demand_month_open_qty: latestMonthOpenQty,
    latest_demand_month_demand_value_proxy: latestMonthDemandValueProxy,
    current_position_count: currentSnapshots.length,
  };
}

function buildSourceSliceSummary({ publicationTables, decisionSummary }) {
  const publicationOrder = [
    "dim_product",
    "dim_product_family",
    "dim_account",
    "dim_inventory_location",
    "fact_demand_line",
    "fact_inventory_inbound",
    "fact_inventory_snapshot",
    ...Object.keys(OPERATING_LOOP_PUBLIC_FILENAMES),
  ];
  const publicationTimestamps = publicationOrder
    .flatMap((tableName) =>
      publicationTables[tableName].map((row) => row.load_timestamp_utc).filter(Boolean),
    )
    .sort();
  const publicationVersions = uniqueValues(
    publicationOrder.flatMap((tableName) =>
      publicationTables[tableName].map((row) => row.source_file_version ?? ""),
    ),
  );
  const reportedDates = uniqueValues([
    ...publicationTables.fact_demand_line.map((row) => row.event_date ?? ""),
    ...publicationTables.fact_inventory_inbound.map((row) => row.receipt_date ?? ""),
    ...publicationTables.fact_inventory_snapshot.map((row) => row.snapshot_date ?? ""),
  ]).sort();
  const publicationTableRows = publicationOrder.map((tableName) => {
    const metadata = PUBLICATION_TABLE_METADATA[tableName];
    const rows = publicationTables[tableName];
    const sourceFamily = rows[0]?.record_source_family ?? "unknown_source_family";
    return {
      table_name: tableName,
      row_count: rows.length,
      count_label: metadata.countLabel,
      domain: metadata.domain,
      purpose: metadata.purpose,
      source_family_code: sourceFamily,
      source_family_label: titleCaseCode(sourceFamily),
    };
  });

  return {
    report_type: "fab001_public_serving_source_slice",
    generated_from_publication_dir: "platform/fabric/publication/current",
    latest_approved_refresh_utc:
      decisionSummary.latest_approved_refresh_utc
      ?? publicationTimestamps.at(-1)
      ?? null,
    latest_published_reporting_date: reportedDates.at(-1) ?? null,
    publication_versions: publicationVersions,
    total_rows: publicationTableRows.reduce((sum, row) => sum + row.row_count, 0),
    publication_tables: publicationTableRows,
    published_source_families: uniqueValues(
      publicationTableRows.map((row) => row.source_family_label),
    ),
    example_transformations: {
      account_public_form:
        publicationTables.dim_account[0]?.account_name ?? "North Field Service 01",
      location_public_form:
        publicationTables.dim_inventory_location[0]?.location_name ?? "Transit Node",
      product_public_form:
        publicationTables.dim_product[0]?.product_name ?? "Service Kit 01",
    },
  };
}

function buildOperatingLoopSummary({
  publicationTables,
  supplyChainDecisionQueueSummaryRows,
  purchaseOrderSummaryRows,
  logisticsDecisionQueueSummaryRows,
  inventoryMovementSummaryRows,
  salesFulfillmentSummaryRows,
  salesDashboardSummaryRows,
  inventoryLocationActionSummaryRows,
}) {
  const operatingTableNames = Object.keys(OPERATING_LOOP_PUBLIC_FILENAMES);
  const operatingRows = operatingTableNames.map((tableName) => ({
    table_name: tableName,
    row_count: publicationTables[tableName]?.length ?? 0,
  }));

  return {
    report_type: "fab001_public_serving_operating_loop_summary",
    loop_status: "materialized_bounded_proof_v1",
    decision_to_execution_boundary:
      "Recommendations are separate from purchase-order, movement, and fulfillment execution facts.",
    operating_loop_table_count: operatingTableNames.length,
    operating_loop_total_rows: operatingRows.reduce((sum, row) => sum + row.row_count, 0),
    operating_loop_tables: operatingRows,
    supply_chain_decision_queue_summary_rows: supplyChainDecisionQueueSummaryRows.length,
    purchase_order_summary_rows: purchaseOrderSummaryRows.length,
    logistics_decision_queue_summary_rows: logisticsDecisionQueueSummaryRows.length,
    inventory_movement_summary_rows: inventoryMovementSummaryRows.length,
    sales_fulfillment_summary_rows: salesFulfillmentSummaryRows.length,
    sales_dashboard_summary_rows: salesDashboardSummaryRows.length,
    inventory_location_action_summary_rows: inventoryLocationActionSummaryRows.length,
    public_safety_note:
      "Supplier, region, location, and account surfaces remain synthetic and public-safe.",
  };
}

function buildFinancialSummary({ decisionSummary, demandLines, inventorySnapshots, salesRealization }) {
  const totalDemandValueProxy =
    Number(decisionSummary.total_demand_value_proxy ?? 0);
  const totalOpenDemandValueProxy =
    Number(decisionSummary.total_open_demand_value_proxy ?? 0);
  const totalGrossMarginProxy = demandLines.reduce(
    (sum, row) => sum + Number(row.gross_margin_proxy ?? 0),
    0,
  );
  const totalOpenGrossMarginProxy = demandLines.reduce(
    (sum, row) => sum + inferOpenGrossMarginProxy(row),
    0,
  );
  const totalInventoryExposure =
    Number(decisionSummary.total_inventory_exposure ?? 0);
  const latestDemandMonth = decisionSummary.latest_demand_month ?? "";
  const latestMonthDemandLines = latestDemandMonth
    ? demandLines.filter((row) => String(row.event_date ?? "").startsWith(latestDemandMonth))
    : [];
  const latestMonthDemandValueProxy = latestMonthDemandLines.reduce(
    (sum, row) => sum + Number(row.demand_value_proxy ?? 0),
    0,
  );
  const latestMonthOpenDemandValueProxy = latestMonthDemandLines.reduce(
    (sum, row) => sum + inferOpenDemandValueProxy(row),
    0,
  );
  const latestMonthGrossMarginProxy = latestMonthDemandLines.reduce(
    (sum, row) => sum + Number(row.gross_margin_proxy ?? 0),
    0,
  );
  const latestMonthOpenGrossMarginProxy = latestMonthDemandLines.reduce(
    (sum, row) => sum + inferOpenGrossMarginProxy(row),
    0,
  );
  const latestInventoryMonth = String(decisionSummary.latest_inventory_date ?? "").slice(0, 7);
  const monthEndSnapshots = latestInventoryMonth
    ? latestSnapshotsForMonth(inventorySnapshots, latestInventoryMonth)
    : [];
  const latestMonthInventoryExposure = monthEndSnapshots.reduce(
    (sum, row) => sum + Number(row.inventory_value_proxy ?? 0),
    0,
  );
  const latestMonthAvailableQty = monthEndSnapshots.reduce(
    (sum, row) => sum + Number(row.available_qty ?? 0),
    0,
  );
  const totalRealizedRevenueAmount = salesRealization.reduce(
    (sum, row) => sum + Number(row.net_revenue_amount ?? 0),
    0,
  );
  const totalRealizedCogsAmount = salesRealization.reduce(
    (sum, row) => sum + Number(row.cogs_amount ?? 0),
    0,
  );
  const totalRealizedGrossMarginAmount = salesRealization.reduce(
    (sum, row) => sum + Number(row.gross_margin_amount ?? 0),
    0,
  );
  const latestMonthSalesRealization = latestDemandMonth
    ? salesRealization.filter((row) => String(row.invoice_date ?? "").startsWith(latestDemandMonth))
    : [];
  const latestMonthRealizedRevenueAmount = latestMonthSalesRealization.reduce(
    (sum, row) => sum + Number(row.net_revenue_amount ?? 0),
    0,
  );
  const latestMonthRealizedGrossMarginAmount = latestMonthSalesRealization.reduce(
    (sum, row) => sum + Number(row.gross_margin_amount ?? 0),
    0,
  );

  return {
    report_type: "fab001_public_serving_financial_summary",
    latest_approved_refresh_utc: decisionSummary.latest_approved_refresh_utc ?? null,
    latest_demand_month: latestDemandMonth || null,
    total_demand_value_proxy: totalDemandValueProxy,
    total_open_demand_value_proxy: totalOpenDemandValueProxy,
    total_gross_margin_proxy: totalGrossMarginProxy,
    total_open_gross_margin_proxy: totalOpenGrossMarginProxy,
    implied_margin_rate_proxy: safeRatio(totalGrossMarginProxy, totalDemandValueProxy),
    implied_open_margin_rate_proxy: safeRatio(totalOpenGrossMarginProxy, totalOpenDemandValueProxy),
    total_realized_revenue_amount: totalRealizedRevenueAmount,
    total_realized_cogs_amount: totalRealizedCogsAmount,
    total_realized_gross_margin_amount: totalRealizedGrossMarginAmount,
    realized_margin_rate: safeRatio(totalRealizedGrossMarginAmount, totalRealizedRevenueAmount),
    total_inventory_exposure: totalInventoryExposure,
    inventory_to_total_demand_ratio: safeRatio(totalInventoryExposure, totalDemandValueProxy),
    inventory_to_open_demand_ratio: safeRatio(totalInventoryExposure, totalOpenDemandValueProxy),
    inventory_gap_to_open_demand_proxy:
      totalInventoryExposure - totalOpenDemandValueProxy,
    latest_month_demand_value_proxy: latestMonthDemandValueProxy,
    latest_month_open_demand_value_proxy: latestMonthOpenDemandValueProxy,
    latest_month_gross_margin_proxy: latestMonthGrossMarginProxy,
    latest_month_open_gross_margin_proxy: latestMonthOpenGrossMarginProxy,
    latest_month_realized_revenue_amount: latestMonthRealizedRevenueAmount,
    latest_month_realized_gross_margin_amount: latestMonthRealizedGrossMarginAmount,
    latest_month_inventory_exposure: latestMonthInventoryExposure,
    latest_month_available_qty: latestMonthAvailableQty,
    latest_month_margin_rate_proxy: safeRatio(
      latestMonthGrossMarginProxy,
      latestMonthDemandValueProxy,
    ),
    latest_month_realized_margin_rate: safeRatio(
      latestMonthRealizedGrossMarginAmount,
      latestMonthRealizedRevenueAmount,
    ),
    latest_month_inventory_to_demand_ratio: safeRatio(
      latestMonthInventoryExposure,
      latestMonthDemandValueProxy,
    ),
  };
}

function buildMonthlyFinancialTrend({ demandLines, inventorySnapshots, salesRealization }) {
  const demandByMonth = new Map();

  for (const row of demandLines) {
    const month = String(row.event_date ?? "").slice(0, 7);
    if (!month) {
      continue;
    }
    const bucket = demandByMonth.get(month) ?? {
      month,
      open_qty: 0,
      demand_value_proxy: 0,
      open_demand_value_proxy: 0,
      gross_margin_proxy: 0,
      open_gross_margin_proxy: 0,
    };
    bucket.open_qty += Number(row.open_qty ?? 0);
    bucket.demand_value_proxy += Number(row.demand_value_proxy ?? 0);
    bucket.open_demand_value_proxy += inferOpenDemandValueProxy(row);
    bucket.gross_margin_proxy += Number(row.gross_margin_proxy ?? 0);
    bucket.open_gross_margin_proxy += inferOpenGrossMarginProxy(row);
    demandByMonth.set(month, bucket);
  }

  const inventoryByMonth = buildMonthEndInventoryRollup(inventorySnapshots);
  const realizationByMonth = new Map();

  for (const row of salesRealization) {
    const month = String(row.invoice_date ?? "").slice(0, 7);
    if (!month) {
      continue;
    }
    const bucket = realizationByMonth.get(month) ?? {
      realized_revenue_amount: 0,
      realized_cogs_amount: 0,
      realized_gross_margin_amount: 0,
      fulfilled_qty: 0,
    };
    bucket.realized_revenue_amount += Number(row.net_revenue_amount ?? 0);
    bucket.realized_cogs_amount += Number(row.cogs_amount ?? 0);
    bucket.realized_gross_margin_amount += Number(row.gross_margin_amount ?? 0);
    bucket.fulfilled_qty += Number(row.fulfilled_qty ?? 0);
    realizationByMonth.set(month, bucket);
  }

  const months = [...new Set([...demandByMonth.keys(), ...inventoryByMonth.keys()])].sort();

  return months.map((month) => {
    const demand = demandByMonth.get(month) ?? {
      open_qty: 0,
      demand_value_proxy: 0,
      open_demand_value_proxy: 0,
      gross_margin_proxy: 0,
      open_gross_margin_proxy: 0,
    };
    const inventory = inventoryByMonth.get(month) ?? {
      snapshot_date: null,
      month_end_inventory_exposure: 0,
      month_end_available_qty: 0,
      month_end_position_count: 0,
    };
    const realization = realizationByMonth.get(month) ?? {
      realized_revenue_amount: 0,
      realized_cogs_amount: 0,
      realized_gross_margin_amount: 0,
      fulfilled_qty: 0,
    };

    return {
      month,
      snapshot_date: inventory.snapshot_date,
      open_qty: demand.open_qty,
      demand_value_proxy: demand.demand_value_proxy,
      open_demand_value_proxy: demand.open_demand_value_proxy,
      gross_margin_proxy: demand.gross_margin_proxy,
      open_gross_margin_proxy: demand.open_gross_margin_proxy,
      realized_revenue_amount: realization.realized_revenue_amount,
      realized_cogs_amount: realization.realized_cogs_amount,
      realized_gross_margin_amount: realization.realized_gross_margin_amount,
      fulfilled_qty: realization.fulfilled_qty,
      month_end_inventory_exposure: inventory.month_end_inventory_exposure,
      month_end_available_qty: inventory.month_end_available_qty,
      month_end_position_count: inventory.month_end_position_count,
      implied_margin_rate_proxy: safeRatio(
        demand.gross_margin_proxy,
        demand.demand_value_proxy,
      ),
      realized_margin_rate: safeRatio(
        realization.realized_gross_margin_amount,
        realization.realized_revenue_amount,
      ),
      inventory_to_demand_ratio: safeRatio(
        inventory.month_end_inventory_exposure,
        demand.demand_value_proxy,
      ),
      inventory_to_open_demand_ratio: safeRatio(
        inventory.month_end_inventory_exposure,
        demand.open_demand_value_proxy,
      ),
    };
  });
}

function buildUnitEconomicsReference({
  products,
  productFamilies,
  demandLines,
  inventorySnapshots,
}) {
  const familyLookup = new Map(
    productFamilies.map((row) => [row.product_family_code, row.product_family_name]),
  );
  const productLookup = new Map(products.map((row) => [row.product_sk, row]));

  const demandByProduct = new Map();
  for (const row of demandLines) {
    const bucket = demandByProduct.get(row.product_sk) ?? {
      demand_value_proxy: 0,
      open_demand_value_proxy: 0,
      gross_margin_proxy: 0,
    };
    bucket.demand_value_proxy += Number(row.demand_value_proxy ?? 0);
    bucket.open_demand_value_proxy += inferOpenDemandValueProxy(row);
    bucket.gross_margin_proxy += Number(row.gross_margin_proxy ?? 0);
    demandByProduct.set(row.product_sk, bucket);
  }

  const latestSnapshotDate = uniqueValues(
    inventorySnapshots.map((row) => row.snapshot_date ?? ""),
  ).sort().at(-1) ?? "";
  const currentInventoryByProduct = new Map();
  for (const row of inventorySnapshots) {
    if ((row.snapshot_date ?? "") !== latestSnapshotDate) {
      continue;
    }
    currentInventoryByProduct.set(
      row.product_sk,
      (currentInventoryByProduct.get(row.product_sk) ?? 0) + Number(row.inventory_value_proxy ?? 0),
    );
  }

  const familyBuckets = new Map();
  for (const product of products) {
    const familyCode = product.product_family_code ?? "UNCLASSIFIED";
    const familyName = familyLookup.get(familyCode) ?? titleCaseCode(familyCode);
    const unitCost = syntheticUnitCost(product.unit_economic_band_code);
    const standardPrice = syntheticStandardPrice(unitCost);
    const demand = demandByProduct.get(product.product_sk) ?? {
      demand_value_proxy: 0,
      open_demand_value_proxy: 0,
      gross_margin_proxy: 0,
    };
    const bucket = familyBuckets.get(familyCode) ?? {
      product_family_code: familyCode,
      product_family_label: familyName,
      product_count: 0,
      unit_cost_min: Number.POSITIVE_INFINITY,
      unit_cost_max: 0,
      standard_price_min: Number.POSITIVE_INFINITY,
      standard_price_max: 0,
      demand_value_proxy: 0,
      open_demand_value_proxy: 0,
      gross_margin_proxy: 0,
      current_inventory_exposure: 0,
    };

    bucket.product_count += 1;
    bucket.unit_cost_min = Math.min(bucket.unit_cost_min, unitCost);
    bucket.unit_cost_max = Math.max(bucket.unit_cost_max, unitCost);
    bucket.standard_price_min = Math.min(bucket.standard_price_min, standardPrice);
    bucket.standard_price_max = Math.max(bucket.standard_price_max, standardPrice);
    bucket.demand_value_proxy += demand.demand_value_proxy;
    bucket.open_demand_value_proxy += demand.open_demand_value_proxy;
    bucket.gross_margin_proxy += demand.gross_margin_proxy;
    bucket.current_inventory_exposure += currentInventoryByProduct.get(product.product_sk) ?? 0;
    familyBuckets.set(familyCode, bucket);
  }

  return [...familyBuckets.values()]
    .map((bucket) => ({
      ...bucket,
      unit_cost_min: Number.isFinite(bucket.unit_cost_min) ? bucket.unit_cost_min : 0,
      standard_price_min: Number.isFinite(bucket.standard_price_min)
        ? bucket.standard_price_min
        : 0,
      implied_margin_rate_proxy: safeRatio(
        bucket.gross_margin_proxy,
        bucket.demand_value_proxy,
      ),
    }))
    .sort((left, right) => right.open_demand_value_proxy - left.open_demand_value_proxy);
}

function buildMonthEndInventoryRollup(inventorySnapshots) {
  const latestDateByMonth = new Map();
  for (const row of inventorySnapshots) {
    const snapshotDate = String(row.snapshot_date ?? "");
    const month = snapshotDate.slice(0, 7);
    if (!month) {
      continue;
    }
    const currentLatest = latestDateByMonth.get(month);
    if (!currentLatest || snapshotDate > currentLatest) {
      latestDateByMonth.set(month, snapshotDate);
    }
  }

  const rollup = new Map();
  for (const row of inventorySnapshots) {
    const snapshotDate = String(row.snapshot_date ?? "");
    const month = snapshotDate.slice(0, 7);
    if (!month || latestDateByMonth.get(month) !== snapshotDate) {
      continue;
    }
    const bucket = rollup.get(month) ?? {
      snapshot_date: snapshotDate,
      month_end_inventory_exposure: 0,
      month_end_available_qty: 0,
      month_end_position_count: 0,
    };
    bucket.month_end_inventory_exposure += Number(row.inventory_value_proxy ?? 0);
    bucket.month_end_available_qty += Number(row.available_qty ?? 0);
    bucket.month_end_position_count += 1;
    rollup.set(month, bucket);
  }

  return rollup;
}

function latestSnapshotsForMonth(inventorySnapshots, month) {
  const candidates = inventorySnapshots.filter((row) =>
    String(row.snapshot_date ?? "").startsWith(month),
  );
  const latestDate = uniqueValues(candidates.map((row) => row.snapshot_date ?? ""))
    .sort()
    .at(-1);
  return latestDate
    ? candidates.filter((row) => row.snapshot_date === latestDate)
    : [];
}

function inferOpenDemandValueProxy(row) {
  const demandQty = Number(row.demand_qty ?? 0);
  const openQty = Number(row.open_qty ?? 0);
  const demandValueProxy = Number(row.demand_value_proxy ?? 0);

  if (demandQty <= 0 || openQty <= 0 || demandValueProxy <= 0) {
    return 0;
  }

  return Math.round((demandValueProxy / demandQty) * openQty);
}

function inferOpenGrossMarginProxy(row) {
  const demandQty = Number(row.demand_qty ?? 0);
  const openQty = Number(row.open_qty ?? 0);
  const grossMarginProxy = Number(row.gross_margin_proxy ?? 0);

  if (demandQty <= 0 || openQty <= 0 || grossMarginProxy <= 0) {
    return 0;
  }

  return Math.round((grossMarginProxy / demandQty) * openQty);
}

function safeRatio(numerator, denominator) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return 0;
  }
  return numerator / denominator;
}

function syntheticUnitCost(unitEconomicBandCode) {
  return {
    BAND_E0: 8,
    BAND_E1: 14,
    BAND_E2: 24,
    BAND_E3: 40,
    BAND_E4: 65,
  }[unitEconomicBandCode] ?? 10;
}

function syntheticStandardPrice(unitCost) {
  return Math.round(unitCost * 1.65);
}

async function writeJsonBundle(destinationDir, files) {
  const destinationParentDir = path.dirname(destinationDir);
  const stageDir = path.join(
    destinationParentDir,
    `.serving-stage-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  );

  await mkdir(destinationParentDir, { recursive: true });
  await mkdir(stageDir, { recursive: true });

  try {
    for (const [filename, value] of Object.entries(files)) {
      await writeJsonFile(path.join(stageDir, filename), value);
    }

    await rm(destinationDir, { recursive: true, force: true });
    await rename(stageDir, destinationDir);
  } catch (error) {
    await rm(stageDir, { recursive: true, force: true });
    throw error;
  }
}

async function readCsvRows(filePath) {
  const text = await readFile(filePath, "utf8");
  const records = parseCsv(text.replace(/\r\n/g, "\n"));
  if (records.length === 0) {
    return [];
  }

  const [header, ...rows] = records;
  return rows
    .filter((row) => row.some((value) => value !== ""))
    .map((row) =>
      Object.fromEntries(
        header.map((columnName, index) => [
          columnName,
          coerceCsvValue(row[index] ?? ""),
        ]),
      ),
    );
}

async function readOptionalCsvRows(filePath) {
  try {
    return await readCsvRows(filePath);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

function parseCsv(text) {
  const rows = [];
  let currentRow = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === "\"") {
      if (insideQuotes && nextCharacter === "\"") {
        currentValue += "\"";
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (character === "," && !insideQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if (character === "\n" && !insideQuotes) {
      currentRow.push(currentValue);
      rows.push(currentRow);
      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += character;
  }

  if (currentValue !== "" || currentRow.length > 0) {
    currentRow.push(currentValue);
    rows.push(currentRow);
  }

  return rows;
}

function coerceCsvValue(value) {
  if (value === "") {
    return "";
  }
  if (/^-?\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }
  if (/^-?\d+\.\d+$/.test(value)) {
    return Number.parseFloat(value);
  }
  if (value === "true" || value === "false") {
    return value === "true";
  }
  return value;
}

function dedupeRows(rows, keyColumns) {
  const seen = new Set();
  const deduped = [];

  for (const row of rows) {
    const key = keyColumns.map((columnName) => row[columnName] ?? "").join("|");
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(row);
  }

  return deduped;
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function titleCaseCode(value) {
  return String(value)
    .toLowerCase()
    .split("_")
    .map((segment) => `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`)
    .join(" ");
}

async function readOptionalJsonFile(filePath) {
  try {
    return await readJsonFile(filePath);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

function toRepoRelative(targetPath) {
  const resolved = path.resolve(targetPath);
  if (!resolved.startsWith(REPO_ROOT)) {
    return targetPath;
  }
  return path.relative(REPO_ROOT, resolved).split(path.sep).join("/");
}

async function main(argv = process.argv.slice(2)) {
  const parsed = parsePublicServingExtractArgs(argv);
  const result = await materializeFabricPublicServingExtract(parsed);
  console.log(`Materialized Fabric public serving extract to ${result.extract_dir}`);
  console.log(`Mirrored Fabric public serving extract to ${result.site_mirror_dir}`);
  console.log(`Wrote report ${result.materialization_report_path}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
