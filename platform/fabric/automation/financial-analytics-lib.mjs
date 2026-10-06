import { createHash } from "node:crypto";
import path from "node:path";

import {
  PUBLICATION_SAFETY_FLAG,
  PUBLIC_SALES_START_DATE,
  REPO_ROOT,
  readJsonFile,
  writeJsonFile,
} from "./dimension-build-lib.mjs";

export const DEFAULT_PUBLICATION_DIR = path.join(
  REPO_ROOT,
  "platform/fabric/publication/current",
);
export const DEFAULT_FINANCIAL_CONTROLS_DIR = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-representative/internal-controls/current",
);
export const DEFAULT_FINANCIAL_FOUNDATION_DIR = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-financial/current",
);
export const DEFAULT_FINANCIAL_FOUNDATION_REPORT_PATH = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-financial/foundation-report.json",
);
export const FINANCIAL_FOUNDATION_VERSION = "financial_foundation_r1";
export const OPEN_ENDED_EFFECTIVE_END_DATE = "9999-12-31";
export const FINANCIAL_FOUNDATION_FILENAMES = {
  dim_pricing_context: "dim_pricing_context.json",
  dim_cost_context: "dim_cost_context.json",
  fact_cost_history: "fact_cost_history.json",
  fact_price_list_history: "fact_price_list_history.json",
  fact_sales_realization: "fact_sales_realization.json",
};

const PRIVATE_NAMESPACE = "fabric-platform-dev-bmad-financial-foundation-v1";

const PRICING_CONTEXT_PROFILES = {
  "Field Service": {
    account_pattern_class: "RECURRING_SERVICE",
    channel_code: "DIRECT_SERVICE",
    market_region_code: "MX_PUBLIC",
    pricing_tier_code: "SERVICE_PRIORITY",
    price_context_uplift_pct: 0.015,
    bounded_discount_rate_pct: 0.02,
  },
  "Project Delivery": {
    account_pattern_class: "PROJECT_BASED",
    channel_code: "PROJECT_DIRECT",
    market_region_code: "MX_PUBLIC",
    pricing_tier_code: "PROJECT_PROGRAM",
    price_context_uplift_pct: -0.015,
    bounded_discount_rate_pct: 0.04,
  },
  "Channel Support": {
    account_pattern_class: "PARTNER_CHANNEL",
    channel_code: "PARTNER_RESALE",
    market_region_code: "MX_PUBLIC",
    pricing_tier_code: "CHANNEL_SUPPORT",
    price_context_uplift_pct: -0.035,
    bounded_discount_rate_pct: 0.07,
  },
  "Legacy Coverage": {
    account_pattern_class: "UNKNOWN",
    channel_code: "LEGACY_SUPPORT",
    market_region_code: "MX_PUBLIC",
    pricing_tier_code: "LEGACY_MAINTAIN",
    price_context_uplift_pct: 0,
    bounded_discount_rate_pct: 0.01,
  },
};

const COST_CONTEXT_PROFILES = {
  REPLENISH_STANDARD: {
    supply_node_class: "STANDARD_NETWORK",
    valuation_method_code: "STANDARD",
    procurement_profile_code: "CORE_PROCUREMENT",
  },
  REPLENISH_COORDINATED: {
    supply_node_class: "COORDINATED_NETWORK",
    valuation_method_code: "STANDARD",
    procurement_profile_code: "COORDINATED_SUPPLY",
  },
  REPLENISH_DENSE: {
    supply_node_class: "DENSE_PICK_NETWORK",
    valuation_method_code: "STANDARD",
    procurement_profile_code: "FAST_MOVING_PROCUREMENT",
  },
  REPLENISH_PALLET: {
    supply_node_class: "BULK_STORAGE_NETWORK",
    valuation_method_code: "STANDARD",
    procurement_profile_code: "BULK_PROCUREMENT",
  },
  REPLENISH_CONTROLLED: {
    supply_node_class: "CONTROLLED_ACCESS_NETWORK",
    valuation_method_code: "STANDARD",
    procurement_profile_code: "CONTROLLED_PROCUREMENT",
  },
};

const COST_DRIFT_MIDPOINTS = {
  COST_DRIFT_04_08: 0.06,
  COST_DRIFT_05_09: 0.07,
  COST_DRIFT_06_10: 0.08,
  COST_DRIFT_07_12: 0.095,
  COST_DRIFT_08_13: 0.105,
};

const PRICE_STEP_MIDPOINTS = {
  PRICE_STEP_02_035: 0.0275,
  PRICE_STEP_025_04: 0.0325,
  PRICE_STEP_03_045: 0.0375,
  PRICE_STEP_03_05: 0.04,
  PRICE_STEP_035_055: 0.045,
};

const TARGET_MARGIN_MIDPOINTS = {
  MARGIN_24_29: 0.265,
  MARGIN_26_31: 0.285,
  MARGIN_28_32: 0.3,
  MARGIN_29_33: 0.31,
  MARGIN_32_37: 0.345,
};

const UNIT_COST_BY_BAND = {
  BAND_E0: 8,
  BAND_E1: 14,
  BAND_E2: 24,
  BAND_E3: 40,
  BAND_E4: 65,
};

export function parseFinancialFoundationArgs(argv = process.argv.slice(2)) {
  const parsed = {
    publicationDir: DEFAULT_PUBLICATION_DIR,
    controlsDir: DEFAULT_FINANCIAL_CONTROLS_DIR,
    outputDir: DEFAULT_FINANCIAL_FOUNDATION_DIR,
    reportPath: DEFAULT_FINANCIAL_FOUNDATION_REPORT_PATH,
    foundationVersion: FINANCIAL_FOUNDATION_VERSION,
    loadTimestampUtc: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--") {
      continue;
    }

    if (arg === "--input") {
      parsed.publicationDir = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--controls") {
      parsed.controlsDir = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--output") {
      parsed.outputDir = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--report") {
      parsed.reportPath = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--foundation-version") {
      parsed.foundationVersion = next;
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

export async function loadFinancialFoundationInputs({
  publicationDir = DEFAULT_PUBLICATION_DIR,
  controlsDir = DEFAULT_FINANCIAL_CONTROLS_DIR,
} = {}) {
  const [dim_account, dim_product, fact_demand_line, rule_product_generation_profile] = await Promise.all([
    readJsonFile(path.join(publicationDir, "dim_account.json")),
    readJsonFile(path.join(publicationDir, "dim_product.json")),
    readJsonFile(path.join(publicationDir, "fact_demand_line.json")),
    readJsonFile(path.join(controlsDir, "rule_product_generation_profile.json")),
  ]);

  return {
    dim_account,
    dim_product,
    fact_demand_line,
    rule_product_generation_profile,
  };
}

export function buildFinancialFoundation(inputs, options = {}) {
  const publicationPackage = inputs;
  const loadTimestampUtc =
    options.loadTimestampUtc
    ?? deriveLatestLoadTimestamp([
      publicationPackage.dim_account,
      publicationPackage.dim_product,
      publicationPackage.fact_demand_line,
      publicationPackage.rule_product_generation_profile,
    ]);
  const foundationVersion = options.foundationVersion ?? FINANCIAL_FOUNDATION_VERSION;
  const timelineEndDate = deriveTimelineEndDate(loadTimestampUtc);

  const pricingContexts = buildPricingContexts({
    accounts: publicationPackage.dim_account,
    foundationVersion,
    loadTimestampUtc,
  });
  const costContexts = buildCostContexts({
    productRules: publicationPackage.rule_product_generation_profile,
    foundationVersion,
    loadTimestampUtc,
  });
  const productRulesByProductKey = new Map(
    publicationPackage.rule_product_generation_profile.map((row) => [row.product_sk, row]),
  );
  const pricingContextByGroup = new Map(
    pricingContexts.map((row) => [row.customer_group, row]),
  );
  const costContextByPosture = new Map(
    costContexts.map((row) => [row.replenishment_posture_code, row]),
  );

  const fact_cost_history = buildCostHistory({
    products: publicationPackage.dim_product,
    productRulesByProductKey,
    costContextByPosture,
    timelineEndDate,
    foundationVersion,
    loadTimestampUtc,
  });

  const fact_price_list_history = buildPriceHistory({
    accounts: publicationPackage.dim_account,
    products: publicationPackage.dim_product,
    productRulesByProductKey,
    pricingContextByGroup,
    factCostHistory: fact_cost_history,
    timelineEndDate,
    foundationVersion,
    loadTimestampUtc,
  });

  const fact_sales_realization = buildSalesRealization({
    demandLines: publicationPackage.fact_demand_line,
    accounts: publicationPackage.dim_account,
    products: publicationPackage.dim_product,
    productRulesByProductKey,
    pricingContextByGroup,
    costContextByPosture,
    factCostHistory: fact_cost_history,
    factPriceListHistory: fact_price_list_history,
    foundationVersion,
    loadTimestampUtc,
  });

  return {
    dim_pricing_context: pricingContexts,
    dim_cost_context: costContexts,
    fact_cost_history,
    fact_price_list_history,
    fact_sales_realization,
    report: buildFoundationReport({
      publicationPackage,
      pricingContexts,
      costContexts,
      fact_cost_history,
      fact_price_list_history,
      fact_sales_realization,
      timelineEndDate,
      foundationVersion,
      loadTimestampUtc,
    }),
  };
}

export async function buildFinancialFoundationToDirectory(options = {}) {
  const publicationDir = options.publicationDir ?? DEFAULT_PUBLICATION_DIR;
  const controlsDir = options.controlsDir ?? DEFAULT_FINANCIAL_CONTROLS_DIR;
  const outputDir = options.outputDir ?? DEFAULT_FINANCIAL_FOUNDATION_DIR;
  const reportPath = options.reportPath ?? DEFAULT_FINANCIAL_FOUNDATION_REPORT_PATH;
  const inputs = await loadFinancialFoundationInputs({ publicationDir, controlsDir });
  const foundation = buildFinancialFoundation(inputs, options);

  await Promise.all([
    ...Object.entries(FINANCIAL_FOUNDATION_FILENAMES).map(([key, filename]) =>
      writeJsonFile(path.join(outputDir, filename), foundation[key]),
    ),
    writeJsonFile(reportPath, foundation.report),
  ]);

  return {
    publicationDir,
    controlsDir,
    outputDir,
    reportPath,
    foundation,
  };
}

function buildPricingContexts({ accounts, foundationVersion, loadTimestampUtc }) {
  const seenGroups = new Map();
  for (const account of accounts) {
    if (!seenGroups.has(account.customer_group)) {
      seenGroups.set(account.customer_group, account);
    }
  }

  return [...seenGroups.values()]
    .sort((left, right) => left.customer_group.localeCompare(right.customer_group))
    .map((account) => {
      const profile = PRICING_CONTEXT_PROFILES[account.customer_group] ?? {
        account_pattern_class: account.account_pattern_class,
        channel_code: "GENERAL_ACCOUNT",
        market_region_code: "MX_PUBLIC",
        pricing_tier_code: "GENERAL_TIER",
        price_context_uplift_pct: 0,
        bounded_discount_rate_pct: 0.02,
      };

      return {
        pricing_context_sk: stableFinancialKey("PRC", account.customer_group),
        customer_group: account.customer_group,
        account_pattern_class: profile.account_pattern_class,
        channel_code: profile.channel_code,
        market_region_code: profile.market_region_code,
        pricing_tier_code: profile.pricing_tier_code,
        price_context_uplift_pct: roundDecimal(profile.price_context_uplift_pct, 4),
        bounded_discount_rate_pct: roundDecimal(profile.bounded_discount_rate_pct, 4),
        currency_code: "USD",
        foundation_version: foundationVersion,
        publication_safety_flag: PUBLICATION_SAFETY_FLAG,
        load_timestamp_utc: loadTimestampUtc,
      };
    });
}

function buildCostContexts({ productRules, foundationVersion, loadTimestampUtc }) {
  const seenPostures = new Set();

  return [...productRules]
    .filter((row) => {
      if (seenPostures.has(row.replenishment_posture_code)) {
        return false;
      }
      seenPostures.add(row.replenishment_posture_code);
      return true;
    })
    .sort((left, right) =>
      left.replenishment_posture_code.localeCompare(right.replenishment_posture_code),
    )
    .map((row) => {
      const profile = COST_CONTEXT_PROFILES[row.replenishment_posture_code] ?? {
        supply_node_class: "GENERAL_NETWORK",
        valuation_method_code: "STANDARD",
        procurement_profile_code: "GENERAL_PROCUREMENT",
      };

      return {
        cost_context_sk: stableFinancialKey("CCT", row.replenishment_posture_code),
        replenishment_posture_code: row.replenishment_posture_code,
        supply_node_class: profile.supply_node_class,
        valuation_method_code: profile.valuation_method_code,
        procurement_profile_code: profile.procurement_profile_code,
        currency_code: "USD",
        foundation_version: foundationVersion,
        publication_safety_flag: PUBLICATION_SAFETY_FLAG,
        load_timestamp_utc: loadTimestampUtc,
      };
    });
}

function buildCostHistory({
  products,
  productRulesByProductKey,
  costContextByPosture,
  timelineEndDate,
  foundationVersion,
  loadTimestampUtc,
}) {
  const rows = [];

  for (const product of [...products].sort((left, right) => left.product_sk.localeCompare(right.product_sk))) {
    const productRule = productRulesByProductKey.get(product.product_sk);
    if (!productRule) {
      throw new Error(`Missing product generation rule for ${product.product_sk}`);
    }

    const costContext = costContextByPosture.get(productRule.replenishment_posture_code);
    if (!costContext) {
      throw new Error(`Missing cost context for posture ${productRule.replenishment_posture_code}`);
    }

    const cadenceMonths = deriveCostCadenceMonths(productRule.unit_cost_drift_band_code);
    const periodStarts = generatePeriodStarts(
      PUBLIC_SALES_START_DATE,
      timelineEndDate,
      cadenceMonths,
    );
    const annualDriftMidpoint =
      COST_DRIFT_MIDPOINTS[productRule.unit_cost_drift_band_code]
      ?? COST_DRIFT_MIDPOINTS.COST_DRIFT_05_09;
    const baseUnitCost = UNIT_COST_BY_BAND[product.unit_economic_band_code] ?? 10;

    for (const [index, effectiveStartDate] of periodStarts.entries()) {
      const effectiveEndDate = deriveEffectiveEndDate(periodStarts, index);
      const driftWeight =
        0.85 + (stableFraction(`${product.product_sk}|${effectiveStartDate}|cost`) * 0.3);
      const periodicDriftRate = annualDriftMidpoint * (cadenceMonths / 12) * driftWeight;
      const unitCostAmount = roundMoney(baseUnitCost * ((1 + periodicDriftRate) ** index));

      rows.push({
        cost_history_sk: stableFinancialKey(
          "CST",
          `${product.product_sk}|${costContext.cost_context_sk}|${effectiveStartDate}`,
        ),
        product_sk: product.product_sk,
        cost_context_sk: costContext.cost_context_sk,
        currency_code: "USD",
        unit_cost_amount: unitCostAmount,
        cost_method_code: costContext.valuation_method_code,
        effective_start_date: effectiveStartDate,
        effective_end_date: effectiveEndDate,
        unit_cost_drift_band_code: productRule.unit_cost_drift_band_code,
        cost_review_cadence_code: cadenceMonths === 3 ? "QUARTERLY" : "SEMIANNUAL",
        derivation_basis_code: "RULE_DERIVED_COST_HISTORY",
        foundation_version: foundationVersion,
        publication_safety_flag: PUBLICATION_SAFETY_FLAG,
        load_timestamp_utc: loadTimestampUtc,
      });
    }
  }

  return rows;
}

function buildPriceHistory({
  accounts,
  products,
  productRulesByProductKey,
  pricingContextByGroup,
  factCostHistory,
  timelineEndDate,
  foundationVersion,
  loadTimestampUtc,
}) {
  const uniqueCustomerGroups = [...new Set(accounts.map((row) => row.customer_group))].sort();
  const costHistoryByProductKey = groupBy(factCostHistory, (row) => row.product_sk);
  const rows = [];

  for (const product of [...products].sort((left, right) => left.product_sk.localeCompare(right.product_sk))) {
    const productRule = productRulesByProductKey.get(product.product_sk);
    if (!productRule) {
      throw new Error(`Missing product generation rule for ${product.product_sk}`);
    }
    const priceCadenceMonths =
      productRule.price_review_cadence_code === "QUARTERLY" ? 3 : 6;
    const periodStarts = generatePeriodStarts(
      PUBLIC_SALES_START_DATE,
      timelineEndDate,
      priceCadenceMonths,
    );
    const productCostHistory = costHistoryByProductKey.get(product.product_sk) ?? [];
    const priceStepMidpoint =
      PRICE_STEP_MIDPOINTS[productRule.price_step_band_code]
      ?? PRICE_STEP_MIDPOINTS.PRICE_STEP_025_04;
    const targetMarginMidpoint =
      TARGET_MARGIN_MIDPOINTS[productRule.target_margin_band_code]
      ?? TARGET_MARGIN_MIDPOINTS.MARGIN_28_32;

    for (const customerGroup of uniqueCustomerGroups) {
      const pricingContext = pricingContextByGroup.get(customerGroup);
      if (!pricingContext) {
        throw new Error(`Missing pricing context for ${customerGroup}`);
      }

      for (const [index, effectiveStartDate] of periodStarts.entries()) {
        const effectiveEndDate = deriveEffectiveEndDate(periodStarts, index);
        const effectiveCost =
          resolveEffectiveCostAmount(productCostHistory, effectiveStartDate)
          ?? (UNIT_COST_BY_BAND[product.unit_economic_band_code] ?? 10);
        const reviewWeight =
          0.9 + (stableFraction(`${product.product_sk}|${pricingContext.pricing_context_sk}|${effectiveStartDate}|price`) * 0.2);
        const reviewAdjustment = 1 + (priceStepMidpoint * reviewWeight * index * 0.25);
        const baselinePrice = effectiveCost / (1 - targetMarginMidpoint);
        const listPriceAmount = roundMoney(
          baselinePrice
          * reviewAdjustment
          * (1 + pricingContext.price_context_uplift_pct),
        );

        rows.push({
          price_history_sk: stableFinancialKey(
            "PRH",
            `${product.product_sk}|${pricingContext.pricing_context_sk}|${effectiveStartDate}`,
          ),
          product_sk: product.product_sk,
          pricing_context_sk: pricingContext.pricing_context_sk,
          currency_code: "USD",
          list_price_amount: listPriceAmount,
          price_basis_code: "LIST_PRICE",
          effective_start_date: effectiveStartDate,
          effective_end_date: effectiveEndDate,
          price_review_cadence_code: productRule.price_review_cadence_code,
          price_step_band_code: productRule.price_step_band_code,
          target_margin_band_code: productRule.target_margin_band_code,
          derivation_basis_code: "RULE_DERIVED_PRICE_HISTORY",
          foundation_version: foundationVersion,
          publication_safety_flag: PUBLICATION_SAFETY_FLAG,
          load_timestamp_utc: loadTimestampUtc,
        });
      }
    }
  }

  return rows;
}

function buildFoundationReport({
  publicationPackage,
  pricingContexts,
  costContexts,
  fact_cost_history,
  fact_price_list_history,
  fact_sales_realization,
  timelineEndDate,
  foundationVersion,
  loadTimestampUtc,
}) {
  return {
    report_type: "fabric_financial_foundation_report",
    status: "completed",
    foundation_version: foundationVersion,
    recorded_at_utc: loadTimestampUtc,
    timeline_start_date: PUBLIC_SALES_START_DATE,
    timeline_end_date: timelineEndDate,
    counts: {
      dim_account: publicationPackage.dim_account.length,
      dim_product: publicationPackage.dim_product.length,
      dim_pricing_context: pricingContexts.length,
      dim_cost_context: costContexts.length,
      fact_cost_history: fact_cost_history.length,
      fact_price_list_history: fact_price_list_history.length,
      fact_sales_realization: fact_sales_realization.length,
    },
    current_boundary: {
      price_history_status: "effective_dated_rule_derived",
      cost_history_status: "effective_dated_rule_derived",
      sales_realization_status: "fulfilled_line_effective_dated_rule_resolved",
      financial_claim_boundary:
        "effective-dated price and cost are now resolved into fulfilled-line sales realization, but the layer is still bounded and not raw invoice-source finance",
    },
  };
}

function buildSalesRealization({
  demandLines,
  accounts,
  products,
  productRulesByProductKey,
  pricingContextByGroup,
  costContextByPosture,
  factCostHistory,
  factPriceListHistory,
  foundationVersion,
  loadTimestampUtc,
}) {
  const accountByKey = new Map(accounts.map((row) => [row.account_sk, row]));
  const productByKey = new Map(products.map((row) => [row.product_sk, row]));
  const costHistoryByProductKey = groupBy(factCostHistory, (row) => row.product_sk);
  const priceHistoryByProductAndContext = groupBy(
    factPriceListHistory,
    (row) => `${row.product_sk}|${row.pricing_context_sk}`,
  );

  return [...demandLines]
    .filter((row) => Number(row.delivered_qty ?? 0) > 0)
    .sort((left, right) => left.demand_line_sk.localeCompare(right.demand_line_sk))
    .map((row) => {
      const account = accountByKey.get(row.account_sk);
      const product = productByKey.get(row.product_sk);
      if (!account || !product) {
        throw new Error(`Missing account or product context for demand line ${row.demand_line_sk}`);
      }

      const productRule = productRulesByProductKey.get(row.product_sk);
      if (!productRule) {
        throw new Error(`Missing product rule for demand line ${row.demand_line_sk}`);
      }

      const pricingContext = pricingContextByGroup.get(account.customer_group);
      if (!pricingContext) {
        throw new Error(`Missing pricing context for customer group ${account.customer_group}`);
      }

      const costContext = costContextByPosture.get(productRule.replenishment_posture_code);
      if (!costContext) {
        throw new Error(`Missing cost context for posture ${productRule.replenishment_posture_code}`);
      }

      const realizationDate = row.event_date;
      const deliveredQty = Number(row.delivered_qty ?? 0);
      const resolvedPrice = resolveEffectiveRow(
        priceHistoryByProductAndContext.get(`${row.product_sk}|${pricingContext.pricing_context_sk}`) ?? [],
        realizationDate,
      );
      const resolvedCost = resolveEffectiveRow(
        costHistoryByProductKey.get(row.product_sk) ?? [],
        realizationDate,
      );

      if (!resolvedPrice || !resolvedCost) {
        throw new Error(`Missing effective price or cost resolution for demand line ${row.demand_line_sk}`);
      }

      const grossRevenueAmount = roundMoney(deliveredQty * Number(resolvedPrice.list_price_amount ?? 0));
      const discountAmount = roundMoney(grossRevenueAmount * Number(pricingContext.bounded_discount_rate_pct ?? 0));
      const netRevenueAmount = roundMoney(grossRevenueAmount - discountAmount);
      const unitCostAmount = Number(resolvedCost.unit_cost_amount ?? 0);
      const cogsAmount = roundMoney(deliveredQty * unitCostAmount);
      const grossMarginAmount = roundMoney(netRevenueAmount - cogsAmount);

      return {
        sales_realization_sk: stableFinancialKey("SLS", row.demand_line_sk),
        demand_line_sk: row.demand_line_sk,
        product_sk: row.product_sk,
        account_sk: row.account_sk,
        pricing_context_sk: pricingContext.pricing_context_sk,
        cost_context_sk: costContext.cost_context_sk,
        invoice_date: realizationDate,
        fulfilled_qty: deliveredQty,
        unit_price_amount: Number(resolvedPrice.list_price_amount ?? 0),
        gross_revenue_amount: grossRevenueAmount,
        discount_amount: discountAmount,
        net_revenue_amount: netRevenueAmount,
        unit_cost_amount: unitCostAmount,
        cogs_amount: cogsAmount,
        gross_margin_amount: grossMarginAmount,
        gross_margin_pct: safeRatio(grossMarginAmount, netRevenueAmount),
        price_realization_pct: safeRatio(netRevenueAmount, grossRevenueAmount),
        currency_code: "USD",
        derivation_basis_code: "FULFILLMENT_LINE_RULE_RESOLVED",
        foundation_version: foundationVersion,
        publication_safety_flag: PUBLICATION_SAFETY_FLAG,
        load_timestamp_utc: loadTimestampUtc,
      };
    });
}

function deriveTimelineEndDate(loadTimestampUtc) {
  const date = new Date(loadTimestampUtc);
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-01`;
}

function deriveLatestLoadTimestamp(collections) {
  const candidates = collections
    .flat()
    .map((row) => row.load_timestamp_utc)
    .filter((value) => typeof value === "string" && value.length > 0)
    .sort();

  return candidates.at(-1) ?? new Date().toISOString();
}

function deriveCostCadenceMonths(unitCostDriftBandCode) {
  return [
    "COST_DRIFT_07_12",
    "COST_DRIFT_08_13",
  ].includes(unitCostDriftBandCode)
    ? 3
    : 6;
}

function generatePeriodStarts(startDate, endDateInclusive, cadenceMonths) {
  const starts = [];
  let cursor = startDate;

  while (cursor <= endDateInclusive) {
    starts.push(cursor);
    cursor = addMonths(cursor, cadenceMonths);
  }

  return starts;
}

function deriveEffectiveEndDate(periodStarts, index) {
  const nextStart = periodStarts[index + 1];
  if (!nextStart) {
    return OPEN_ENDED_EFFECTIVE_END_DATE;
  }
  return subtractDays(nextStart, 1);
}

function resolveEffectiveCostAmount(productCostHistory, effectiveStartDate) {
  const match = [...productCostHistory]
    .filter((row) => row.effective_start_date <= effectiveStartDate)
    .sort((left, right) => left.effective_start_date.localeCompare(right.effective_start_date))
    .at(-1);

  return match?.unit_cost_amount ?? null;
}

function addMonths(dateString, months) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + months, day));
  return date.toISOString().slice(0, 10);
}

function subtractDays(dateString, days) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function stableFinancialKey(prefix, value) {
  const digest = createHash("sha256")
    .update(`${PRIVATE_NAMESPACE}|${prefix}|${value}`)
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();

  return `${prefix}_SK_${digest}`;
}

function stableFraction(value) {
  const digest = createHash("sha256")
    .update(`${PRIVATE_NAMESPACE}|fraction|${value}`)
    .digest("hex")
    .slice(0, 8);

  return parseInt(digest, 16) / 0xffffffff;
}

function roundMoney(value) {
  return roundDecimal(value, 2);
}

function roundDecimal(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function resolveEffectiveRow(rows, effectiveDate) {
  return [...rows]
    .filter((row) =>
      row.effective_start_date <= effectiveDate
      && effectiveDate <= row.effective_end_date
    )
    .sort((left, right) => left.effective_start_date.localeCompare(right.effective_start_date))
    .at(-1);
}

function safeRatio(numerator, denominator) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return 0;
  }
  return numerator / denominator;
}

function groupBy(rows, keySelector) {
  const groups = new Map();

  for (const row of rows) {
    const key = keySelector(row);
    const bucket = groups.get(key) ?? [];
    bucket.push(row);
    groups.set(key, bucket);
  }

  return groups;
}
