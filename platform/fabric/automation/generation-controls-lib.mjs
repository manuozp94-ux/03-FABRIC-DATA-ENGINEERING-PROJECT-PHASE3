import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  PUBLIC_SALES_START_DATE,
  REPO_ROOT,
  readJsonFile,
  writeJsonFile,
} from "./dimension-build-lib.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));

export const DEFAULT_PUBLICATION_DIR = path.join(
  REPO_ROOT,
  "platform/fabric/publication/current",
);
export const DEFAULT_GENERATION_CONTROLS_DIR = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-candidate/internal-controls/current",
);
export const GENERATION_CONTROL_RULE_VERSION = "logic_first_controls_r1";
export const OPEN_ENDED_EFFECTIVE_END_DATE = "9999-12-31";

export const GENERATION_CONTROL_FILENAMES = {
  rule_account_generation_profile: "rule_account_generation_profile.json",
  rule_product_generation_profile: "rule_product_generation_profile.json",
  rule_account_product_eligibility: "rule_account_product_eligibility.json",
  seed_inventory_position: "seed_inventory_position.json",
  rule_inventory_inbound: "rule_inventory_inbound.json",
  state_entity_shock: "state_entity_shock.json",
  state_pending_receipt: "state_pending_receipt.json",
};

export const REQUIRED_GENERATION_CONTROL_FIELDS = {
  rule_account_generation_profile: [
    "account_sk",
    "account_pattern_class",
    "seasonality_profile_code",
    "baseline_qoq_growth_band_code",
    "volatility_class",
    "shock_sensitivity_class",
    "order_frequency_code",
    "line_split_behavior_code",
    "effective_start_date",
    "effective_end_date",
    "rule_version",
  ],
  rule_product_generation_profile: [
    "product_sk",
    "product_family_code",
    "unit_cost_drift_band_code",
    "price_review_cadence_code",
    "price_step_band_code",
    "target_margin_band_code",
    "replenishment_posture_code",
    "lead_time_band",
    "criticality_band",
    "effective_start_date",
    "effective_end_date",
    "rule_version",
  ],
  rule_account_product_eligibility: [
    "account_sk",
    "product_sk",
    "eligibility_status_code",
    "activation_bias_code",
    "baseline_share_band_code",
    "effective_start_date",
    "effective_end_date",
    "rule_version",
  ],
  seed_inventory_position: [
    "product_sk",
    "inventory_location_sk",
    "seed_date",
    "opening_on_hand_qty",
    "opening_available_qty",
    "opening_reserved_qty",
    "opening_in_transit_qty",
    "opening_inventory_status_code",
    "opening_readiness_flag",
    "rule_version",
  ],
  rule_inventory_inbound: [
    "product_sk",
    "inventory_location_sk",
    "preferred_receipt_flow_type",
    "allowed_same_day_relief_flag",
    "receipt_size_band_code",
    "replenishment_trigger_code",
    "lead_time_offset_days",
    "approval_lag_days",
    "cooldown_days",
    "effective_start_date",
    "effective_end_date",
    "rule_version",
  ],
  state_entity_shock: [
    "entity_scope_code",
    "entity_key",
    "shock_profile_code",
    "shock_start_date",
    "shock_end_date",
    "recovery_end_date",
    "cooldown_end_date",
    "state_version",
  ],
  state_pending_receipt: [
    "product_sk",
    "inventory_location_sk",
    "planned_receipt_date",
    "expected_release_date",
    "receipt_flow_type",
    "pending_qty",
    "state_version",
  ],
};

export const ALLOWED_SEASONALITY_PROFILE_CODES = [
  "JANUARY_DIP_SPRING_RECOVERY",
  "INSTALLATION_SEASON_LIFT",
  "QUARTER_END_PUSH",
  "FLAT_BASELINE",
];
export const ALLOWED_BASELINE_QOQ_GROWTH_BAND_CODES = [
  "QOQ_00_02",
  "QOQ_01_03",
  "QOQ_02_04",
  "QOQ_02_045",
];
export const ALLOWED_VOLATILITY_CLASSES = ["LOW", "MEDIUM", "HIGH"];
export const ALLOWED_SHOCK_SENSITIVITY_CLASSES = ["LOW", "MEDIUM", "HIGH"];
export const ALLOWED_ORDER_FREQUENCY_CODES = [
  "IRREGULAR",
  "BATCHED_MONTHLY",
  "WEEKLY_REPLENISH",
  "PROJECT_MILESTONE",
];
export const ALLOWED_LINE_SPLIT_BEHAVIOR_CODES = [
  "SINGLE_LINE_ONLY",
  "CHANNEL_CONSOLIDATED",
  "SERVICE_THRESHOLD_SPLIT",
  "PROJECT_STEP_SPLIT",
];
export const ALLOWED_UNIT_COST_DRIFT_BAND_CODES = [
  "COST_DRIFT_04_08",
  "COST_DRIFT_05_09",
  "COST_DRIFT_06_10",
  "COST_DRIFT_07_12",
  "COST_DRIFT_08_13",
];
export const ALLOWED_PRICE_REVIEW_CADENCE_CODES = [
  "QUARTERLY",
  "SEMIANNUAL",
];
export const ALLOWED_PRICE_STEP_BAND_CODES = [
  "PRICE_STEP_02_035",
  "PRICE_STEP_025_04",
  "PRICE_STEP_03_045",
  "PRICE_STEP_03_05",
  "PRICE_STEP_035_055",
];
export const ALLOWED_TARGET_MARGIN_BAND_CODES = [
  "MARGIN_24_29",
  "MARGIN_26_31",
  "MARGIN_28_32",
  "MARGIN_29_33",
  "MARGIN_32_37",
];
export const ALLOWED_REPLENISHMENT_POSTURE_CODES = [
  "REPLENISH_CONTROLLED",
  "REPLENISH_COORDINATED",
  "REPLENISH_DENSE",
  "REPLENISH_PALLET",
  "REPLENISH_STANDARD",
];
export const ALLOWED_ELIGIBILITY_STATUS_CODES = [
  "OBSERVED_ACTIVE",
  "OBSERVED_FALLBACK",
];
export const ALLOWED_ACTIVATION_BIAS_CODES = [
  "CHANNEL_CORE",
  "FALLBACK_EDGE",
  "GENERAL_EXTENDED",
  "PROJECT_ALIGNED",
  "SERVICE_CORE",
];
export const ALLOWED_BASELINE_SHARE_BAND_CODES = [
  "SHARE_00_09",
  "SHARE_10_34",
  "SHARE_35_69",
  "SHARE_70_100",
];
export const ALLOWED_RECEIPT_SIZE_BAND_CODES = [
  "RECEIPT_01_05",
  "RECEIPT_06_15",
  "RECEIPT_16_50",
  "RECEIPT_51_PLUS",
];
export const ALLOWED_REPLENISHMENT_TRIGGER_CODES = [
  "COVERAGE_REPLENISH",
  "PROJECT_STAGE_PULL",
  "DENSE_PICK_TOP_UP",
  "PALLET_REBALANCE",
  "CONTROLLED_RELEASE",
  "FALLBACK_REVIEW",
];
export const ALLOWED_ENTITY_SCOPE_CODES = [
  "ACCOUNT_PRODUCT",
  "PRODUCT_LOCATION",
];
export const ALLOWED_SHOCK_PROFILE_CODES = [
  "PROJECT_RAMP_UP",
  "TEMPORARY_DEMAND_DROP",
  "SUPPLY_TIGHTNESS",
  "COST_SURGE_WINDOW",
];

const ACCOUNT_RULES = {
  RECURRING_SERVICE: {
    seasonality_profile_code: "JANUARY_DIP_SPRING_RECOVERY",
    baseline_qoq_growth_band_code: "QOQ_02_04",
    volatility_class: "LOW",
    shock_sensitivity_class: "LOW",
    order_frequency_code: "WEEKLY_REPLENISH",
    line_split_behavior_code: "SERVICE_THRESHOLD_SPLIT",
  },
  PROJECT_BASED: {
    seasonality_profile_code: "INSTALLATION_SEASON_LIFT",
    baseline_qoq_growth_band_code: "QOQ_01_03",
    volatility_class: "HIGH",
    shock_sensitivity_class: "HIGH",
    order_frequency_code: "PROJECT_MILESTONE",
    line_split_behavior_code: "PROJECT_STEP_SPLIT",
  },
  PARTNER_CHANNEL: {
    seasonality_profile_code: "QUARTER_END_PUSH",
    baseline_qoq_growth_band_code: "QOQ_02_045",
    volatility_class: "MEDIUM",
    shock_sensitivity_class: "MEDIUM",
    order_frequency_code: "BATCHED_MONTHLY",
    line_split_behavior_code: "CHANNEL_CONSOLIDATED",
  },
  UNKNOWN: {
    seasonality_profile_code: "FLAT_BASELINE",
    baseline_qoq_growth_band_code: "QOQ_00_02",
    volatility_class: "MEDIUM",
    shock_sensitivity_class: "LOW",
    order_frequency_code: "IRREGULAR",
    line_split_behavior_code: "SINGLE_LINE_ONLY",
  },
};

const PRODUCT_RULES = {
  STANDARD_COMPONENT: {
    unit_cost_drift_band_code: "COST_DRIFT_05_09",
    price_review_cadence_code: "SEMIANNUAL",
    price_step_band_code: "PRICE_STEP_025_04",
    target_margin_band_code: "MARGIN_28_32",
    replenishment_posture_code: "REPLENISH_STANDARD",
  },
  KIT_ASSEMBLY: {
    unit_cost_drift_band_code: "COST_DRIFT_06_10",
    price_review_cadence_code: "SEMIANNUAL",
    price_step_band_code: "PRICE_STEP_03_045",
    target_margin_band_code: "MARGIN_29_33",
    replenishment_posture_code: "REPLENISH_COORDINATED",
  },
  SMALL_PART: {
    unit_cost_drift_band_code: "COST_DRIFT_04_08",
    price_review_cadence_code: "SEMIANNUAL",
    price_step_band_code: "PRICE_STEP_02_035",
    target_margin_band_code: "MARGIN_32_37",
    replenishment_posture_code: "REPLENISH_DENSE",
  },
  BULKY_ITEM: {
    unit_cost_drift_band_code: "COST_DRIFT_07_12",
    price_review_cadence_code: "QUARTERLY",
    price_step_band_code: "PRICE_STEP_035_055",
    target_margin_band_code: "MARGIN_24_29",
    replenishment_posture_code: "REPLENISH_PALLET",
  },
  CONTROLLED_ITEM: {
    unit_cost_drift_band_code: "COST_DRIFT_08_13",
    price_review_cadence_code: "QUARTERLY",
    price_step_band_code: "PRICE_STEP_03_05",
    target_margin_band_code: "MARGIN_26_31",
    replenishment_posture_code: "REPLENISH_CONTROLLED",
  },
  UNCLASSIFIED: {
    unit_cost_drift_band_code: "COST_DRIFT_05_09",
    price_review_cadence_code: "SEMIANNUAL",
    price_step_band_code: "PRICE_STEP_025_04",
    target_margin_band_code: "MARGIN_26_31",
    replenishment_posture_code: "REPLENISH_STANDARD",
  },
};

export function parseGenerationControlArgs(argv = process.argv.slice(2)) {
  const parsed = {
    publicationDir: DEFAULT_PUBLICATION_DIR,
    outputDir: DEFAULT_GENERATION_CONTROLS_DIR,
    ruleVersion: GENERATION_CONTROL_RULE_VERSION,
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

    if (arg === "--output") {
      parsed.outputDir = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--rule-version") {
      parsed.ruleVersion = next;
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

export async function loadPublicationPackage(publicationDir = DEFAULT_PUBLICATION_DIR) {
  const entries = await Promise.all(
    Object.entries({
      dim_account: "dim_account.json",
      dim_product: "dim_product.json",
      dim_inventory_location: "dim_inventory_location.json",
      fact_inventory_inbound: "fact_inventory_inbound.json",
      fact_demand_line: "fact_demand_line.json",
      fact_inventory_snapshot: "fact_inventory_snapshot.json",
    }).map(async ([key, filename]) => [
      key,
      await readJsonFile(path.join(publicationDir, filename)),
    ]),
  );

  return Object.fromEntries(entries);
}

export function buildGenerationControls(publicationPackage, options = {}) {
  const ruleVersion = options.ruleVersion ?? GENERATION_CONTROL_RULE_VERSION;
  const sourceFileVersion = deriveSourceFileVersion(publicationPackage);
  const loadTimestampUtc =
    options.loadTimestampUtc ?? deriveLatestLoadTimestamp(publicationPackage);

  return {
    rule_account_generation_profile: buildAccountGenerationProfiles({
      accounts: publicationPackage.dim_account,
      sourceFileVersion,
      loadTimestampUtc,
      ruleVersion,
    }),
    rule_product_generation_profile: buildProductGenerationProfiles({
      products: publicationPackage.dim_product,
      sourceFileVersion,
      loadTimestampUtc,
      ruleVersion,
    }),
    rule_account_product_eligibility: buildAccountProductEligibility({
      demandLines: publicationPackage.fact_demand_line,
      accounts: publicationPackage.dim_account,
      products: publicationPackage.dim_product,
      sourceFileVersion,
      loadTimestampUtc,
      ruleVersion,
    }),
    seed_inventory_position: buildSeedInventoryPositions({
      inventorySnapshots: publicationPackage.fact_inventory_snapshot,
      sourceFileVersion,
      loadTimestampUtc,
      ruleVersion,
    }),
    rule_inventory_inbound: buildInventoryInboundRules({
      inventoryInbound: publicationPackage.fact_inventory_inbound,
      inventorySnapshots: publicationPackage.fact_inventory_snapshot,
      products: publicationPackage.dim_product,
      inventoryLocations: publicationPackage.dim_inventory_location,
      sourceFileVersion,
      loadTimestampUtc,
      ruleVersion,
    }),
    state_entity_shock: buildEntityShockState({
      demandLines: publicationPackage.fact_demand_line,
      inventorySnapshots: publicationPackage.fact_inventory_snapshot,
      products: publicationPackage.dim_product,
      sourceFileVersion,
      loadTimestampUtc,
      ruleVersion,
    }),
    state_pending_receipt: buildPendingReceiptState({
      inventoryInbound: publicationPackage.fact_inventory_inbound,
      inventorySnapshots: publicationPackage.fact_inventory_snapshot,
      products: publicationPackage.dim_product,
      inventoryLocations: publicationPackage.dim_inventory_location,
      sourceFileVersion,
      loadTimestampUtc,
      ruleVersion,
    }),
  };
}

export async function buildGenerationControlsToDirectory(options = {}) {
  const publicationDir = options.publicationDir ?? DEFAULT_PUBLICATION_DIR;
  const outputDir = options.outputDir ?? DEFAULT_GENERATION_CONTROLS_DIR;
  const publicationPackage = await loadPublicationPackage(publicationDir);
  const controls = buildGenerationControls(publicationPackage, options);

  await Promise.all(
    Object.entries(GENERATION_CONTROL_FILENAMES).map(([key, filename]) =>
      writeJsonFile(path.join(outputDir, filename), controls[key]),
    ),
  );

  return {
    publicationDir,
    outputDir,
    controls,
  };
}

function buildAccountGenerationProfiles({
  accounts,
  sourceFileVersion,
  loadTimestampUtc,
  ruleVersion,
}) {
  return [...accounts]
    .sort((left, right) => left.account_sk.localeCompare(right.account_sk))
    .map((account) => {
      const accountRule =
        ACCOUNT_RULES[account.account_pattern_class] ?? ACCOUNT_RULES.UNKNOWN;

      return {
        account_sk: account.account_sk,
        account_code: account.account_code,
        account_pattern_class: account.account_pattern_class,
        seasonality_profile_code: accountRule.seasonality_profile_code,
        baseline_qoq_growth_band_code: accountRule.baseline_qoq_growth_band_code,
        volatility_class: accountRule.volatility_class,
        shock_sensitivity_class: accountRule.shock_sensitivity_class,
        order_frequency_code: accountRule.order_frequency_code,
        line_split_behavior_code: accountRule.line_split_behavior_code,
        effective_start_date: PUBLIC_SALES_START_DATE,
        effective_end_date: OPEN_ENDED_EFFECTIVE_END_DATE,
        rule_version: ruleVersion,
        source_file_version: sourceFileVersion,
        load_timestamp_utc: loadTimestampUtc,
      };
    });
}

function buildProductGenerationProfiles({
  products,
  sourceFileVersion,
  loadTimestampUtc,
  ruleVersion,
}) {
  return [...products]
    .sort((left, right) => left.product_sk.localeCompare(right.product_sk))
    .map((product) => {
      const productRule =
        PRODUCT_RULES[product.product_family_code] ?? PRODUCT_RULES.UNCLASSIFIED;

      return {
        product_sk: product.product_sk,
        product_code: product.product_code,
        product_family_code: product.product_family_code,
        unit_cost_drift_band_code: productRule.unit_cost_drift_band_code,
        price_review_cadence_code: productRule.price_review_cadence_code,
        price_step_band_code: productRule.price_step_band_code,
        target_margin_band_code: productRule.target_margin_band_code,
        replenishment_posture_code: productRule.replenishment_posture_code,
        lead_time_band: product.lead_time_band,
        criticality_band: product.criticality_band,
        effective_start_date: PUBLIC_SALES_START_DATE,
        effective_end_date: OPEN_ENDED_EFFECTIVE_END_DATE,
        rule_version: ruleVersion,
        source_file_version: sourceFileVersion,
        load_timestamp_utc: loadTimestampUtc,
      };
    });
}

function buildAccountProductEligibility({
  demandLines,
  accounts,
  products,
  sourceFileVersion,
  loadTimestampUtc,
  ruleVersion,
}) {
  const accountByKey = new Map(accounts.map((row) => [row.account_sk, row]));
  const productByKey = new Map(products.map((row) => [row.product_sk, row]));
  const pairRollups = new Map();
  const accountTotals = new Map();

  for (const row of demandLines) {
    const pairKey = `${row.account_sk}|${row.product_sk}`;
    const rollup = pairRollups.get(pairKey) ?? {
      account_sk: row.account_sk,
      product_sk: row.product_sk,
      observed_demand_qty: 0,
      observed_line_count: 0,
      first_observed_event_date: row.event_date,
      last_observed_event_date: row.event_date,
    };

    rollup.observed_demand_qty += toInteger(row.demand_qty);
    rollup.observed_line_count += 1;
    rollup.first_observed_event_date =
      row.event_date < rollup.first_observed_event_date
        ? row.event_date
        : rollup.first_observed_event_date;
    rollup.last_observed_event_date =
      row.event_date > rollup.last_observed_event_date
        ? row.event_date
        : rollup.last_observed_event_date;
    pairRollups.set(pairKey, rollup);
    accountTotals.set(
      row.account_sk,
      (accountTotals.get(row.account_sk) ?? 0) + toInteger(row.demand_qty),
    );
  }

  return [...pairRollups.values()]
    .sort((left, right) =>
      `${left.account_sk}|${left.product_sk}`.localeCompare(
        `${right.account_sk}|${right.product_sk}`,
      ),
    )
    .map((pair) => {
      const account = accountByKey.get(pair.account_sk);
      const product = productByKey.get(pair.product_sk);
      const accountTotalDemandQty = accountTotals.get(pair.account_sk) ?? pair.observed_demand_qty;
      const share = accountTotalDemandQty > 0
        ? pair.observed_demand_qty / accountTotalDemandQty
        : 0;

      return {
        account_sk: pair.account_sk,
        account_code: account?.account_code ?? "UNKNOWN",
        product_sk: pair.product_sk,
        product_code: product?.product_code ?? "UNKNOWN",
        eligibility_status_code:
          account?.account_pattern_class === "UNKNOWN" ||
          product?.product_family_code === "UNCLASSIFIED"
            ? "OBSERVED_FALLBACK"
            : "OBSERVED_ACTIVE",
        activation_bias_code: deriveActivationBiasCode({
          accountPatternClass: account?.account_pattern_class ?? "UNKNOWN",
          productFamilyCode: product?.product_family_code ?? "UNCLASSIFIED",
        }),
        baseline_share_band_code: deriveBaselineShareBandCode(share),
        observed_demand_qty: pair.observed_demand_qty,
        observed_line_count: pair.observed_line_count,
        first_observed_event_date: pair.first_observed_event_date,
        last_observed_event_date: pair.last_observed_event_date,
        effective_start_date: pair.first_observed_event_date,
        effective_end_date: OPEN_ENDED_EFFECTIVE_END_DATE,
        rule_version: ruleVersion,
        source_file_version: sourceFileVersion,
        load_timestamp_utc: loadTimestampUtc,
      };
    });
}

function buildSeedInventoryPositions({
  inventorySnapshots,
  sourceFileVersion,
  loadTimestampUtc,
  ruleVersion,
}) {
  return [...inventorySnapshots]
    .sort((left, right) =>
      `${left.product_sk}|${left.inventory_location_sk}`.localeCompare(
        `${right.product_sk}|${right.inventory_location_sk}`,
      ),
    )
    .map((snapshot) => ({
      product_sk: snapshot.product_sk,
      inventory_location_sk: snapshot.inventory_location_sk,
      seed_date: snapshot.snapshot_date,
      opening_on_hand_qty: toInteger(snapshot.on_hand_qty),
      opening_available_qty: toInteger(snapshot.available_qty),
      opening_reserved_qty: toInteger(snapshot.reserved_qty),
      opening_in_transit_qty: toInteger(snapshot.in_transit_qty),
      opening_inventory_status_code: snapshot.inventory_status_code,
      opening_readiness_flag: snapshot.readiness_flag,
      source_inventory_snapshot_sk: snapshot.inventory_snapshot_sk,
      rule_version: ruleVersion,
      source_file_version: sourceFileVersion,
      load_timestamp_utc: loadTimestampUtc,
    }));
}

function buildInventoryInboundRules({
  inventoryInbound,
  inventorySnapshots,
  products,
  inventoryLocations,
  sourceFileVersion,
  loadTimestampUtc,
  ruleVersion,
}) {
  const productByKey = new Map(products.map((row) => [row.product_sk, row]));
  const locationByKey = new Map(
    inventoryLocations.map((row) => [row.inventory_location_sk, row]),
  );
  const inboundByPair = new Map();

  for (const row of inventoryInbound) {
    const key = `${row.product_sk}|${row.inventory_location_sk}`;
    const existing = inboundByPair.get(key);
    if (!existing || row.receipt_qty > existing.receipt_qty) {
      inboundByPair.set(key, row);
    }
  }

  const pairs = new Map();

  for (const row of inventorySnapshots) {
    pairs.set(`${row.product_sk}|${row.inventory_location_sk}`, {
      product_sk: row.product_sk,
      inventory_location_sk: row.inventory_location_sk,
    });
  }
  for (const row of inventoryInbound) {
    pairs.set(`${row.product_sk}|${row.inventory_location_sk}`, {
      product_sk: row.product_sk,
      inventory_location_sk: row.inventory_location_sk,
    });
  }

  return [...pairs.values()]
    .sort((left, right) =>
      `${left.product_sk}|${left.inventory_location_sk}`.localeCompare(
        `${right.product_sk}|${right.inventory_location_sk}`,
      ),
    )
    .map((pair) => {
      const product = productByKey.get(pair.product_sk);
      const location = locationByKey.get(pair.inventory_location_sk);
      const observedInbound = inboundByPair.get(
        `${pair.product_sk}|${pair.inventory_location_sk}`,
      );
      const preferredReceiptFlowType =
        observedInbound?.receipt_flow_type ?? deriveDefaultReceiptFlowType(product?.product_family_code);

      return {
        product_sk: pair.product_sk,
        inventory_location_sk: pair.inventory_location_sk,
        preferred_receipt_flow_type: preferredReceiptFlowType,
        allowed_same_day_relief_flag: allowsSameDayRelief({
          receiptFlowType: preferredReceiptFlowType,
          nodeTypeCode: location?.node_type_code ?? "UNKNOWN",
        }),
        receipt_size_band_code: deriveReceiptSizeBandCode(observedInbound?.receipt_qty ?? 0),
        replenishment_trigger_code: deriveReplenishmentTriggerCode({
          productFamilyCode: product?.product_family_code ?? "UNCLASSIFIED",
          nodeTypeCode: location?.node_type_code ?? "UNKNOWN",
        }),
        lead_time_offset_days: deriveLeadTimeOffsetDays({
          leadTimeBand: product?.lead_time_band ?? "MEDIUM",
          nodeTypeCode: location?.node_type_code ?? "UNKNOWN",
        }),
        approval_lag_days: deriveApprovalLagDays({
          receiptFlowType: preferredReceiptFlowType,
          nodeTypeCode: location?.node_type_code ?? "UNKNOWN",
        }),
        cooldown_days: deriveInboundCooldownDays({
          productFamilyCode: product?.product_family_code ?? "UNCLASSIFIED",
          nodeTypeCode: location?.node_type_code ?? "UNKNOWN",
        }),
        effective_start_date: PUBLIC_SALES_START_DATE,
        effective_end_date: OPEN_ENDED_EFFECTIVE_END_DATE,
        rule_version: ruleVersion,
        source_file_version: sourceFileVersion,
        load_timestamp_utc: loadTimestampUtc,
      };
    });
}

function buildEntityShockState({
  demandLines,
  inventorySnapshots,
  products,
  sourceFileVersion,
  loadTimestampUtc,
  ruleVersion,
}) {
  const productByKey = new Map(products.map((row) => [row.product_sk, row]));
  const latestDemandByPair = new Map();

  for (const row of demandLines) {
    const key = `${row.account_sk}|${row.product_sk}`;
    const existing = latestDemandByPair.get(key);
    if (!existing || row.event_date > existing.event_date) {
      latestDemandByPair.set(key, row);
    }
  }

  const shockRows = [];

  for (const row of latestDemandByPair.values()) {
    if (row.open_qty <= 0 || row.demand_status_code === "FULFILLED") {
      continue;
    }

    shockRows.push({
      entity_scope_code: "ACCOUNT_PRODUCT",
      entity_key: `${row.account_sk}|${row.product_sk}`,
      shock_profile_code: "TEMPORARY_DEMAND_DROP",
      shock_start_date: row.event_date,
      shock_end_date: addIsoDays(row.event_date, 30),
      recovery_end_date: addIsoDays(row.event_date, 60),
      cooldown_end_date: addIsoDays(row.event_date, 90),
      state_version: ruleVersion,
      source_file_version: sourceFileVersion,
      load_timestamp_utc: loadTimestampUtc,
    });
  }

  for (const row of inventorySnapshots) {
    if (!(row.readiness_flag === "AT_RISK" || row.inventory_status_code !== "READY")) {
      continue;
    }

    const product = productByKey.get(row.product_sk);
    const supplyCooldownDays =
      product?.product_family_code === "CONTROLLED_ITEM" ? 120 : 90;

    shockRows.push({
      entity_scope_code: "PRODUCT_LOCATION",
      entity_key: `${row.product_sk}|${row.inventory_location_sk}`,
      shock_profile_code: "SUPPLY_TIGHTNESS",
      shock_start_date: row.snapshot_date,
      shock_end_date: addIsoDays(row.snapshot_date, 30),
      recovery_end_date: addIsoDays(row.snapshot_date, 90),
      cooldown_end_date: addIsoDays(row.snapshot_date, supplyCooldownDays),
      state_version: ruleVersion,
      source_file_version: sourceFileVersion,
      load_timestamp_utc: loadTimestampUtc,
    });
  }

  return shockRows.sort((left, right) =>
    `${left.entity_scope_code}|${left.entity_key}`.localeCompare(
      `${right.entity_scope_code}|${right.entity_key}`,
    ),
  );
}

function buildPendingReceiptState({
  inventoryInbound,
  inventorySnapshots,
  products,
  inventoryLocations,
  sourceFileVersion,
  loadTimestampUtc,
  ruleVersion,
}) {
  const productByKey = new Map(products.map((row) => [row.product_sk, row]));
  const locationByKey = new Map(
    inventoryLocations.map((row) => [row.inventory_location_sk, row]),
  );
  const inboundByPair = new Map();

  for (const row of inventoryInbound) {
    inboundByPair.set(`${row.product_sk}|${row.inventory_location_sk}`, row);
  }

  return inventorySnapshots
    .filter((row) => toInteger(row.in_transit_qty) > 0)
    .sort((left, right) =>
      `${left.product_sk}|${left.inventory_location_sk}`.localeCompare(
        `${right.product_sk}|${right.inventory_location_sk}`,
      ),
    )
    .map((snapshot) => {
      const pairKey = `${snapshot.product_sk}|${snapshot.inventory_location_sk}`;
      const inbound = inboundByPair.get(pairKey);
      const product = productByKey.get(snapshot.product_sk);
      const location = locationByKey.get(snapshot.inventory_location_sk);
      const receiptFlowType =
        inbound?.receipt_flow_type ?? deriveDefaultReceiptFlowType(product?.product_family_code);
      const approvalLagDays = deriveApprovalLagDays({
        receiptFlowType,
        nodeTypeCode: location?.node_type_code ?? "UNKNOWN",
      });

      return {
        product_sk: snapshot.product_sk,
        inventory_location_sk: snapshot.inventory_location_sk,
        planned_receipt_date: snapshot.snapshot_date,
        expected_release_date: addIsoDays(snapshot.snapshot_date, Math.max(approvalLagDays, 1)),
        receipt_flow_type: receiptFlowType,
        pending_qty: toInteger(snapshot.in_transit_qty),
        state_version: ruleVersion,
        source_file_version: sourceFileVersion,
        load_timestamp_utc: loadTimestampUtc,
      };
    });
}

function deriveActivationBiasCode({ accountPatternClass, productFamilyCode }) {
  if (
    accountPatternClass === "RECURRING_SERVICE"
    && ["STANDARD_COMPONENT", "SMALL_PART"].includes(productFamilyCode)
  ) {
    return "SERVICE_CORE";
  }

  if (
    accountPatternClass === "PROJECT_BASED"
    && ["KIT_ASSEMBLY", "BULKY_ITEM", "CONTROLLED_ITEM"].includes(productFamilyCode)
  ) {
    return "PROJECT_ALIGNED";
  }

  if (accountPatternClass === "PARTNER_CHANNEL") {
    return "CHANNEL_CORE";
  }

  if (accountPatternClass === "UNKNOWN" || productFamilyCode === "UNCLASSIFIED") {
    return "FALLBACK_EDGE";
  }

  return "GENERAL_EXTENDED";
}

function deriveBaselineShareBandCode(share) {
  if (share >= 0.70) {
    return "SHARE_70_100";
  }

  if (share >= 0.35) {
    return "SHARE_35_69";
  }

  if (share >= 0.10) {
    return "SHARE_10_34";
  }

  return "SHARE_00_09";
}

function deriveDefaultReceiptFlowType(productFamilyCode) {
  switch (productFamilyCode) {
    case "KIT_ASSEMBLY":
      return "KIT_COMPLETION";
    case "BULKY_ITEM":
      return "TRANSFER_IN";
    case "SMALL_PART":
    case "STANDARD_COMPONENT":
    case "CONTROLLED_ITEM":
      return "SUPPLIER_RECEIPT";
    default:
      return "UNKNOWN";
  }
}

function deriveReceiptSizeBandCode(receiptQty) {
  const quantity = toInteger(receiptQty);

  if (quantity >= 51) {
    return "RECEIPT_51_PLUS";
  }
  if (quantity >= 16) {
    return "RECEIPT_16_50";
  }
  if (quantity >= 6) {
    return "RECEIPT_06_15";
  }
  return "RECEIPT_01_05";
}

function deriveReplenishmentTriggerCode({ productFamilyCode, nodeTypeCode }) {
  if (productFamilyCode === "KIT_ASSEMBLY") {
    return "PROJECT_STAGE_PULL";
  }
  if (productFamilyCode === "SMALL_PART") {
    return "DENSE_PICK_TOP_UP";
  }
  if (productFamilyCode === "BULKY_ITEM" || nodeTypeCode === "OVERFLOW_AREA") {
    return "PALLET_REBALANCE";
  }
  if (productFamilyCode === "CONTROLLED_ITEM" || nodeTypeCode === "RESTRICTED_AREA") {
    return "CONTROLLED_RELEASE";
  }
  if (productFamilyCode === "UNCLASSIFIED" || nodeTypeCode === "UNKNOWN") {
    return "FALLBACK_REVIEW";
  }
  return "COVERAGE_REPLENISH";
}

function deriveLeadTimeOffsetDays({ leadTimeBand, nodeTypeCode }) {
  const baseDays = {
    SHORT: 3,
    MEDIUM: 7,
    LONG: 14,
    UNKNOWN: 7,
  }[leadTimeBand] ?? 7;

  const nodeAdjustment = {
    INTERNAL_WAREHOUSE: 0,
    FLOOR_AREA: 0,
    OVERFLOW_AREA: 1,
    THIRD_PARTY_NODE: 2,
    TRANSIT_NODE: 3,
    RESTRICTED_AREA: 4,
    UNKNOWN: 2,
  }[nodeTypeCode] ?? 2;

  return baseDays + nodeAdjustment;
}

function deriveApprovalLagDays({ receiptFlowType, nodeTypeCode }) {
  if (receiptFlowType === "KIT_COMPLETION") {
    return 0;
  }
  if (nodeTypeCode === "RESTRICTED_AREA") {
    return 3;
  }
  if (nodeTypeCode === "TRANSIT_NODE" || nodeTypeCode === "THIRD_PARTY_NODE") {
    return 2;
  }
  if (receiptFlowType === "TRANSFER_IN") {
    return 1;
  }
  if (nodeTypeCode === "UNKNOWN") {
    return 2;
  }
  return 0;
}

function deriveInboundCooldownDays({ productFamilyCode, nodeTypeCode }) {
  if (productFamilyCode === "CONTROLLED_ITEM") {
    return 14;
  }
  if (productFamilyCode === "BULKY_ITEM" || nodeTypeCode === "OVERFLOW_AREA") {
    return 10;
  }
  if (nodeTypeCode === "TRANSIT_NODE" || nodeTypeCode === "THIRD_PARTY_NODE") {
    return 7;
  }
  return 5;
}

function allowsSameDayRelief({ receiptFlowType, nodeTypeCode }) {
  if (nodeTypeCode === "RESTRICTED_AREA" || nodeTypeCode === "TRANSIT_NODE") {
    return false;
  }
  if (nodeTypeCode === "THIRD_PARTY_NODE" && receiptFlowType === "TRANSFER_IN") {
    return false;
  }
  if (receiptFlowType === "KIT_COMPLETION") {
    return true;
  }
  return ["INTERNAL_WAREHOUSE", "FLOOR_AREA", "OVERFLOW_AREA"].includes(nodeTypeCode);
}

function addIsoDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function deriveSourceFileVersion(publicationPackage) {
  const versions = new Set();

  for (const rows of Object.values(publicationPackage)) {
    for (const row of rows) {
      if (row.source_file_version) {
        versions.add(row.source_file_version);
      }
    }
  }

  return [...versions].sort().at(-1) ?? "unknown_source_version";
}

function deriveLatestLoadTimestamp(publicationPackage) {
  const timestamps = [];

  for (const rows of Object.values(publicationPackage)) {
    for (const row of rows) {
      if (row.load_timestamp_utc) {
        timestamps.push(row.load_timestamp_utc);
      }
    }
  }

  return timestamps.sort().at(-1) ?? new Date().toISOString();
}

function toInteger(value) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? Math.trunc(numeric) : 0;
}

export const __testing = {
  ACCOUNT_RULES,
  PRODUCT_RULES,
  addIsoDays,
  allowsSameDayRelief,
  deriveApprovalLagDays,
  deriveActivationBiasCode,
  deriveBaselineShareBandCode,
  deriveDefaultReceiptFlowType,
  deriveInboundCooldownDays,
  deriveLatestLoadTimestamp,
  deriveLeadTimeOffsetDays,
  deriveReceiptSizeBandCode,
  deriveReplenishmentTriggerCode,
  deriveSourceFileVersion,
};
