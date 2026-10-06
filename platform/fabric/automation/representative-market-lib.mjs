import { createHash } from "node:crypto";
import path from "node:path";

import {
  buildPublicAccountName,
  buildPublicProductName,
  customerGroupLabel,
  PUBLIC_RELEASE_VERSION,
  PUBLICATION_SAFETY_FLAG,
  REPO_ROOT,
  readJsonFile,
  writeJsonFile,
} from "./dimension-build-lib.mjs";
import {
  buildGenerationControlsToDirectory,
  DEFAULT_GENERATION_CONTROLS_DIR,
} from "./generation-controls-lib.mjs";
import { loadApprovedPublicationPackage, loadGenerationControls } from "./controlled-candidate-refresh-lib.mjs";
import {
  OPERATING_LOOP_PUBLIC_FILENAMES,
  buildOperatingLoopTables,
} from "./operating-loop-lib.mjs";

export const DEFAULT_REPRESENTATIVE_SEED_DIR = path.join(
  REPO_ROOT,
  "platform/fabric/publication/seed",
);
export const DEFAULT_REPRESENTATIVE_SEED_CONTROLS_DIR = DEFAULT_GENERATION_CONTROLS_DIR;
export const DEFAULT_REPRESENTATIVE_OUTPUT_DIR = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-representative/current",
);
export const DEFAULT_REPRESENTATIVE_INTERNAL_DIR = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-representative/internal-controls/current",
);
export const DEFAULT_REPRESENTATIVE_REPORT_PATH = path.join(
  REPO_ROOT,
  "_bmad-output/test-artifacts/fabric-representative/representative-market-report.json",
);

export const REPRESENTATIVE_PUBLIC_FILENAMES = {
  dim_product: "dim_product.json",
  dim_product_family: "dim_product_family.json",
  dim_account: "dim_account.json",
  dim_inventory_location: "dim_inventory_location.json",
  fact_demand_line: "fact_demand_line.json",
  fact_inventory_inbound: "fact_inventory_inbound.json",
  fact_inventory_snapshot: "fact_inventory_snapshot.json",
  ...OPERATING_LOOP_PUBLIC_FILENAMES,
};

export const REPRESENTATIVE_PLAN_FILENAMES = {
  seed_account_archetype: "seed_account_archetype.json",
  seed_product_archetype: "seed_product_archetype.json",
  seed_inventory_location_archetype: "seed_inventory_location_archetype.json",
  plan_account_population: "plan_account_population.json",
  plan_product_population: "plan_product_population.json",
  plan_inventory_location_population: "plan_inventory_location_population.json",
  plan_account_product_eligibility: "plan_account_product_eligibility.json",
  plan_product_location_stocking: "plan_product_location_stocking.json",
};

export const REPRESENTATIVE_TARGET_COUNTS = {
  accounts: {
    RECURRING_SERVICE: 40,
    PROJECT_BASED: 28,
    PARTNER_CHANNEL: 24,
    UNKNOWN: 4,
  },
  products: {
    SMALL_PART: 42,
    KIT_ASSEMBLY: 32,
    BULKY_ITEM: 30,
    CONTROLLED_ITEM: 28,
    UNCLASSIFIED: 8,
  },
  locations: {
    INTERNAL_WAREHOUSE: 4,
    FLOOR_AREA: 3,
    OVERFLOW_AREA: 2,
    THIRD_PARTY_NODE: 3,
    TRANSIT_NODE: 2,
    RESTRICTED_AREA: 1,
    UNKNOWN: 1,
  },
  eligibilityPairs: 640,
  stockingPairsMin: 120,
  stockingPairsMax: 220,
};

export const REPRESENTATIVE_MARKET_RULE_VERSION = "representative_market_r1";
export const REPRESENTATIVE_GENERATION_RULE_VERSION = "representative_market_controls_r1";
export const REPRESENTATIVE_WINDOW = {
  startDate: "2025-10-01",
  endDate: "2026-04-01",
};

const HASH_NAMESPACE = "fabric-bmad-representative-market-v1";

const ACCOUNT_ELIGIBILITY_COUNTS = {
  RECURRING_SERVICE: 8,
  PROJECT_BASED: 7,
  PARTNER_CHANNEL: 5,
  UNKNOWN: 1,
};

const ACCOUNT_FAMILY_QUOTAS = {
  RECURRING_SERVICE: {
    SMALL_PART: 4,
    CONTROLLED_ITEM: 2,
    BULKY_ITEM: 1,
    KIT_ASSEMBLY: 1,
  },
  PROJECT_BASED: {
    KIT_ASSEMBLY: 3,
    BULKY_ITEM: 2,
    CONTROLLED_ITEM: 1,
    SMALL_PART: 1,
  },
  PARTNER_CHANNEL: {
    SMALL_PART: 2,
    BULKY_ITEM: 1,
    KIT_ASSEMBLY: 1,
    CONTROLLED_ITEM: 1,
  },
  UNKNOWN: {
    UNCLASSIFIED: 1,
  },
};

const STOCKING_BASE_COUNTS = {
  SMALL_PART: 2,
  KIT_ASSEMBLY: 1,
  BULKY_ITEM: 1,
  CONTROLLED_ITEM: 1,
  UNCLASSIFIED: 1,
};

const SERVICE_CRITICALITY_BAND = {
  RECURRING_SERVICE: "HIGH",
  PROJECT_BASED: "ELEVATED",
  PARTNER_CHANNEL: "MEDIUM",
  UNKNOWN: "LOW",
};

const ELIGIBILITY_DENSITY_BAND = {
  RECURRING_SERVICE: "DENSE_CORE",
  PROJECT_BASED: "PROJECT_FOCUSED",
  PARTNER_CHANNEL: "CHANNEL_CURATED",
  UNKNOWN: "EDGE_ONLY",
};

const STOCKING_BREADTH_BAND = {
  SMALL_PART: "BROAD",
  KIT_ASSEMBLY: "PROJECT_SCOPED",
  BULKY_ITEM: "SPACE_BOUNDED",
  CONTROLLED_ITEM: "CONTROLLED",
  UNCLASSIFIED: "EDGE_ONLY",
};

const FAMILY_UNIT_VALUE = {
  SMALL_PART: 18,
  KIT_ASSEMBLY: 62,
  BULKY_ITEM: 44,
  CONTROLLED_ITEM: 37,
  UNCLASSIFIED: 24,
};

const FAMILY_MARGIN_RATE = {
  SMALL_PART: 0.32,
  KIT_ASSEMBLY: 0.29,
  BULKY_ITEM: 0.30,
  CONTROLLED_ITEM: 0.285,
  UNCLASSIFIED: 0.26,
};

const ACCOUNT_EVENT_CADENCE_DAYS = {
  RECURRING_SERVICE: 4,
  PROJECT_BASED: 7,
  PARTNER_CHANNEL: 6,
  UNKNOWN: 15,
};

const PRODUCT_FAMILY_EVENT_QTY = {
  SMALL_PART: [10, 34],
  KIT_ASSEMBLY: [2, 8],
  BULKY_ITEM: [4, 14],
  CONTROLLED_ITEM: [3, 10],
  UNCLASSIFIED: [1, 6],
};

const LOCATION_ROLE_PREFERENCE = {
  SMALL_PART: ["INTERNAL_WAREHOUSE", "FLOOR_AREA", "OVERFLOW_AREA", "TRANSIT_NODE"],
  KIT_ASSEMBLY: ["INTERNAL_WAREHOUSE", "THIRD_PARTY_NODE", "FLOOR_AREA"],
  BULKY_ITEM: ["FLOOR_AREA", "OVERFLOW_AREA", "INTERNAL_WAREHOUSE"],
  CONTROLLED_ITEM: ["INTERNAL_WAREHOUSE", "RESTRICTED_AREA", "THIRD_PARTY_NODE"],
  UNCLASSIFIED: ["OVERFLOW_AREA", "UNKNOWN", "INTERNAL_WAREHOUSE"],
};

const LOCATION_DISPLAY = {
  INTERNAL_WAREHOUSE: "Internal Warehouse",
  FLOOR_AREA: "Floor Storage Area",
  OVERFLOW_AREA: "Overflow Area",
  THIRD_PARTY_NODE: "Third-Party Node",
  TRANSIT_NODE: "Transit Node",
  RESTRICTED_AREA: "Restricted Area",
  UNKNOWN: "Unknown Storage Area",
};

const LOCATION_ROLE_DESCRIPTION = {
  INTERNAL_WAREHOUSE:
    "Primary internal service-capable node used for controlled picking, storage, and replenishment execution.",
  FLOOR_AREA:
    "Operational floor storage area used for accessible staging and direct handling without exposing raw warehouse labels.",
  OVERFLOW_AREA:
    "Overflow-oriented storage node used to absorb peaks, bulk buffering, or temporary repositioning demand.",
  THIRD_PARTY_NODE:
    "Partner-operated stocking node used for routed fulfillment or distributed support coverage.",
  TRANSIT_NODE:
    "Transit-oriented handoff area that preserves movement timing without exposing raw dock labels.",
  RESTRICTED_AREA:
    "Restricted access area that holds controlled stock which is not directly service-releasable.",
  UNKNOWN:
    "Fallback location class retained to preserve bounded ambiguity in source-safe storage context.",
};

const RECORD_STATUS = {
  dimension: "expanded-active",
  fact: "generated-active",
};

export function parseRepresentativeMarketArgs(argv = process.argv.slice(2)) {
  const parsed = {
    seedDir: DEFAULT_REPRESENTATIVE_SEED_DIR,
    seedControlsDir: DEFAULT_REPRESENTATIVE_SEED_CONTROLS_DIR,
    outputDir: DEFAULT_REPRESENTATIVE_OUTPUT_DIR,
    internalDir: DEFAULT_REPRESENTATIVE_INTERNAL_DIR,
    reportPath: DEFAULT_REPRESENTATIVE_REPORT_PATH,
    ruleVersion: REPRESENTATIVE_MARKET_RULE_VERSION,
    generationRuleVersion: REPRESENTATIVE_GENERATION_RULE_VERSION,
    loadTimestampUtc: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--") {
      continue;
    }

    if (arg === "--seed-dir") {
      parsed.seedDir = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--seed-controls-dir") {
      parsed.seedControlsDir = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--output") {
      parsed.outputDir = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--internal-output") {
      parsed.internalDir = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--report-path") {
      parsed.reportPath = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--rule-version") {
      parsed.ruleVersion = next;
      index += 1;
      continue;
    }

    if (arg === "--generation-rule-version") {
      parsed.generationRuleVersion = next;
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

export function buildRepresentativeMarket({
  seedPackage,
  seedControls,
  ruleVersion = REPRESENTATIVE_MARKET_RULE_VERSION,
  loadTimestampUtc = new Date().toISOString(),
}) {
  const representativeSourceVersion = buildRepresentativeSourceVersion({
    seedPackage,
    ruleVersion,
  });

  const seedArchetypes = buildSeedArchetypeTables({
    seedPackage,
    seedControls,
    representativeSourceVersion,
    loadTimestampUtc,
  });

  const planAccountPopulation = buildAccountPopulationPlan({
    seedArchetypes,
    representativeSourceVersion,
    loadTimestampUtc,
  });
  const planProductPopulation = buildProductPopulationPlan({
    seedArchetypes,
    representativeSourceVersion,
    loadTimestampUtc,
  });
  const planInventoryLocationPopulation = buildInventoryLocationPopulationPlan({
    seedArchetypes,
    representativeSourceVersion,
    loadTimestampUtc,
  });
  const planAccountProductEligibility = buildAccountProductEligibilityPlan({
    planAccountPopulation,
    planProductPopulation,
    representativeSourceVersion,
    loadTimestampUtc,
  });
  const planProductLocationStocking = buildProductLocationStockingPlan({
    planProductPopulation,
    planInventoryLocationPopulation,
    representativeSourceVersion,
    loadTimestampUtc,
  });

  const representativePackage = buildRepresentativePublicPackage({
    seedPackage,
    planAccountPopulation,
    planProductPopulation,
    planInventoryLocationPopulation,
    planAccountProductEligibility,
    planProductLocationStocking,
    representativeSourceVersion,
    loadTimestampUtc,
  });

  return {
    representativeSourceVersion,
    seedArchetypes,
    plans: {
      plan_account_population: planAccountPopulation,
      plan_product_population: planProductPopulation,
      plan_inventory_location_population: planInventoryLocationPopulation,
      plan_account_product_eligibility: planAccountProductEligibility,
      plan_product_location_stocking: planProductLocationStocking,
    },
    representativePackage,
    metadata: {
      target_account_count: planAccountPopulation.length,
      target_product_count: planProductPopulation.length,
      target_location_count: planInventoryLocationPopulation.length,
      target_eligibility_pairs: planAccountProductEligibility.length,
      target_stocking_pairs: planProductLocationStocking.length,
      representative_source_version: representativeSourceVersion,
    },
  };
}

export async function buildRepresentativeMarketToDirectory(options = {}) {
  const seedDir = options.seedDir ?? DEFAULT_REPRESENTATIVE_SEED_DIR;
  const seedControlsDir =
    options.seedControlsDir ?? DEFAULT_REPRESENTATIVE_SEED_CONTROLS_DIR;
  const outputDir = options.outputDir ?? DEFAULT_REPRESENTATIVE_OUTPUT_DIR;
  const internalDir = options.internalDir ?? DEFAULT_REPRESENTATIVE_INTERNAL_DIR;
  const reportPath = options.reportPath ?? DEFAULT_REPRESENTATIVE_REPORT_PATH;
  const loadTimestampUtc = options.loadTimestampUtc ?? new Date().toISOString();
  const ruleVersion = options.ruleVersion ?? REPRESENTATIVE_MARKET_RULE_VERSION;
  const generationRuleVersion =
    options.generationRuleVersion ?? REPRESENTATIVE_GENERATION_RULE_VERSION;

  const [seedPackage, seedControls] = await Promise.all([
    loadApprovedPublicationPackage(seedDir),
    loadGenerationControls(seedControlsDir),
  ]);

  const result = buildRepresentativeMarket({
    seedPackage,
    seedControls,
    ruleVersion,
    loadTimestampUtc,
  });

  await Promise.all(
    Object.entries(REPRESENTATIVE_PUBLIC_FILENAMES).map(([key, filename]) =>
      writeJsonFile(path.join(outputDir, filename), result.representativePackage[key]),
    ),
  );

  await Promise.all(
    Object.entries(REPRESENTATIVE_PLAN_FILENAMES).map(([key, filename]) => {
      const rows = result.seedArchetypes[key] ?? result.plans[key];
      return writeJsonFile(path.join(internalDir, filename), rows);
    }),
  );

  const generationControlResult = await buildGenerationControlsToDirectory({
    publicationDir: outputDir,
    outputDir: internalDir,
    ruleVersion: generationRuleVersion,
    loadTimestampUtc,
  });

  const report = {
    run_type: "representative_market_materialization",
    seed_dir: seedDir,
    seed_controls_dir: seedControlsDir,
    output_dir: outputDir,
    internal_dir: internalDir,
    report_path: reportPath,
    load_timestamp_utc: loadTimestampUtc,
    metadata: {
      ...result.metadata,
      generated_generation_control_version: generationRuleVersion,
      public_table_counts: Object.fromEntries(
        Object.keys(REPRESENTATIVE_PUBLIC_FILENAMES).map((key) => [
          key,
          result.representativePackage[key].length,
        ]),
      ),
      internal_plan_counts: Object.fromEntries(
        Object.keys(REPRESENTATIVE_PLAN_FILENAMES).map((key) => [
          key,
          (result.seedArchetypes[key] ?? result.plans[key]).length,
        ]),
      ),
      generation_control_counts: Object.fromEntries(
        Object.entries(generationControlResult.controls).map(([key, rows]) => [key, rows.length]),
      ),
    },
  };

  await writeJsonFile(reportPath, report);

  return {
    seedDir,
    seedControlsDir,
    outputDir,
    internalDir,
    reportPath,
    representativePackage: result.representativePackage,
    seedArchetypes: result.seedArchetypes,
    plans: result.plans,
    generationControls: generationControlResult.controls,
    report,
  };
}

function buildSeedArchetypeTables({
  seedPackage,
  seedControls,
  representativeSourceVersion,
  loadTimestampUtc,
}) {
  const accountRuleByKey = new Map(
    seedControls.rule_account_generation_profile.map((row) => [row.account_sk, row]),
  );
  const productRuleByKey = new Map(
    seedControls.rule_product_generation_profile.map((row) => [row.product_sk, row]),
  );

  const seed_account_archetype = seedPackage.dim_account.map((row) => ({
    archetype_account_sk: row.account_sk,
    archetype_account_code: row.account_code,
    customer_group: row.customer_group ?? customerGroupLabel(row.account_pattern_class),
    account_pattern_class: row.account_pattern_class,
    service_network_code: row.service_network_code,
    fulfillment_context_code: row.fulfillment_context_code,
    seasonality_profile_code:
      accountRuleByKey.get(row.account_sk)?.seasonality_profile_code ?? "FLAT_BASELINE",
    baseline_qoq_growth_band_code:
      accountRuleByKey.get(row.account_sk)?.baseline_qoq_growth_band_code ?? "QOQ_00_02",
    order_frequency_code:
      accountRuleByKey.get(row.account_sk)?.order_frequency_code ?? "IRREGULAR",
    source_file_version: representativeSourceVersion,
    load_timestamp_utc: loadTimestampUtc,
  }));

  const seed_product_archetype = seedPackage.dim_product.map((row) => ({
    archetype_product_sk: row.product_sk,
    archetype_product_code: row.product_code,
    product_family_code: row.product_family_code,
    demand_pattern_class: row.demand_pattern_class,
    planning_constraint_class: row.planning_constraint_class,
    inventory_policy_class: row.inventory_policy_class,
    fulfillment_risk_class: row.fulfillment_risk_class,
    lead_time_band: row.lead_time_band,
    criticality_band: row.criticality_band,
    service_profile: row.service_profile,
    value_density_band: row.value_density_band,
    unit_economic_band_code: row.unit_economic_band_code,
    replenishment_posture_code:
      productRuleByKey.get(row.product_sk)?.replenishment_posture_code ?? "REPLENISH_STANDARD",
    target_margin_band_code:
      productRuleByKey.get(row.product_sk)?.target_margin_band_code ?? "MARGIN_28_32",
    source_file_version: representativeSourceVersion,
    load_timestamp_utc: loadTimestampUtc,
  }));

  const seed_inventory_location_archetype = seedPackage.dim_inventory_location.map((row) => ({
    archetype_inventory_location_sk: row.inventory_location_sk,
    node_type_code: row.node_type_code,
    logistics_area_code: row.logistics_area_code,
    location_role_description: row.location_role_description,
    source_file_version: representativeSourceVersion,
    load_timestamp_utc: loadTimestampUtc,
  }));

  return {
    seed_account_archetype,
    seed_product_archetype,
    seed_inventory_location_archetype,
  };
}

function buildAccountPopulationPlan({
  seedArchetypes,
  representativeSourceVersion,
  loadTimestampUtc,
}) {
  const seedByPattern = new Map(
    seedArchetypes.seed_account_archetype.map((row) => [row.account_pattern_class, row]),
  );
  const rows = [];

  for (const [pattern, targetCount] of Object.entries(REPRESENTATIVE_TARGET_COUNTS.accounts)) {
    const seed = seedByPattern.get(pattern);
    for (let ordinal = 1; ordinal <= targetCount; ordinal += 1) {
      const identityKey = `${pattern}|${ordinal}`;
      const suffix = stableSuffix(identityKey);

      rows.push({
        account_sk: stableId("ACC", identityKey),
        account_code: stableDashCode("ACC", identityKey),
        account_name: buildPublicAccountName({
          accountPatternClass: pattern,
          identityKey,
          ordinal,
        }),
        customer_group: customerGroupLabel(pattern),
        parent_archetype_account_sk: seed?.archetype_account_sk ?? null,
        parent_archetype_account_code: seed?.archetype_account_code ?? null,
        clone_ordinal: ordinal,
        account_pattern_class: pattern,
        service_network_code: stableUnderscoreCode("SERVICE_NETWORK", identityKey),
        fulfillment_context_code: deriveFulfillmentContext(pattern, identityKey),
        seasonality_profile_code: seed?.seasonality_profile_code ?? "FLAT_BASELINE",
        baseline_qoq_growth_band_code:
          seed?.baseline_qoq_growth_band_code ?? "QOQ_00_02",
        order_frequency_code: seed?.order_frequency_code ?? "IRREGULAR",
        service_criticality_band: SERVICE_CRITICALITY_BAND[pattern] ?? "LOW",
        eligibility_density_band: ELIGIBILITY_DENSITY_BAND[pattern] ?? "EDGE_ONLY",
        source_file_version: representativeSourceVersion,
        load_timestamp_utc: loadTimestampUtc,
      });
    }
  }

  return rows.sort((left, right) => left.account_sk.localeCompare(right.account_sk));
}

function buildProductPopulationPlan({
  seedArchetypes,
  representativeSourceVersion,
  loadTimestampUtc,
}) {
  const seedByFamily = new Map(
    seedArchetypes.seed_product_archetype.map((row) => [row.product_family_code, row]),
  );
  const rows = [];

  for (const [familyCode, targetCount] of Object.entries(REPRESENTATIVE_TARGET_COUNTS.products)) {
    const seed = seedByFamily.get(familyCode);
    for (let ordinal = 1; ordinal <= targetCount; ordinal += 1) {
      const identityKey = `${familyCode}|${ordinal}`;
      const suffix = stableSuffix(identityKey);

      rows.push({
        product_sk: stableId("PRD", identityKey),
        product_code: stableDashCode("PRD", identityKey),
        product_name: buildPublicProductName({
          productFamilyCode: familyCode,
          identityKey,
          ordinal,
        }),
        parent_archetype_product_sk: seed?.archetype_product_sk ?? null,
        parent_archetype_product_code: seed?.archetype_product_code ?? null,
        clone_ordinal: ordinal,
        product_family_code: familyCode,
        demand_pattern_class: seed?.demand_pattern_class ?? "RECURRING_DEMAND",
        planning_constraint_class: seed?.planning_constraint_class ?? "STANDARD_FLOW",
        inventory_policy_class: seed?.inventory_policy_class ?? "STANDARD_BUFFER",
        fulfillment_risk_class: seed?.fulfillment_risk_class ?? "GENERAL_RISK",
        lead_time_band: seed?.lead_time_band ?? "MEDIUM",
        criticality_band: seed?.criticality_band ?? "STANDARD",
        service_profile: seed?.service_profile ?? "STANDARD_SERVICE",
        value_density_band: seed?.value_density_band ?? "MEDIUM_DENSITY",
        unit_economic_band_code: seed?.unit_economic_band_code ?? "BAND_E2",
        interchangeability_group_code: `INTERCHANGE_GROUP_${String.fromCharCode(65 + (stableIndex(identityKey, 8)))}`,
        stocking_breadth_band: STOCKING_BREADTH_BAND[familyCode] ?? "EDGE_ONLY",
        replenishment_posture_code:
          seed?.replenishment_posture_code ?? "REPLENISH_STANDARD",
        target_margin_band_code:
          seed?.target_margin_band_code ?? "MARGIN_28_32",
        source_file_version: representativeSourceVersion,
        load_timestamp_utc: loadTimestampUtc,
      });
    }
  }

  return rows.sort((left, right) => left.product_sk.localeCompare(right.product_sk));
}

function buildInventoryLocationPopulationPlan({
  seedArchetypes,
  representativeSourceVersion,
  loadTimestampUtc,
}) {
  const seedByNodeType = new Map(
    seedArchetypes.seed_inventory_location_archetype.map((row) => [row.node_type_code, row]),
  );
  const rows = [];

  for (const [nodeTypeCode, targetCount] of Object.entries(REPRESENTATIVE_TARGET_COUNTS.locations)) {
    const seed = seedByNodeType.get(nodeTypeCode);
    for (let ordinal = 1; ordinal <= targetCount; ordinal += 1) {
      const identityKey = `${nodeTypeCode}|${ordinal}`;
      const cluster = stableIndex(identityKey, 6) + 1;
      rows.push({
        inventory_location_sk: stableId("LOC", identityKey),
        site_code: `SITE-${stableCodeSegment(`SITE|${nodeTypeCode}|${cluster}`, 6)}`,
        location_code: stableDashCode("LOC", identityKey),
        location_name: `${LOCATION_DISPLAY[nodeTypeCode] ?? "Location"} ${stableSuffix(identityKey)}`,
        parent_archetype_inventory_location_sk:
          seed?.archetype_inventory_location_sk ?? null,
        clone_ordinal: ordinal,
        site_cluster_ordinal: cluster,
        node_type_code: nodeTypeCode,
        logistics_area_code: stableUnderscoreCode("LOG_AREA", identityKey),
        location_role_description:
          LOCATION_ROLE_DESCRIPTION[nodeTypeCode]
          ?? seed?.location_role_description
          ?? "Bounded synthetic inventory location used for representative market exploration.",
        service_capable_flag: isServiceCapableNode(nodeTypeCode),
        source_file_version: representativeSourceVersion,
        load_timestamp_utc: loadTimestampUtc,
      });
    }
  }

  return rows.sort((left, right) => left.inventory_location_sk.localeCompare(right.inventory_location_sk));
}

function buildAccountProductEligibilityPlan({
  planAccountPopulation,
  planProductPopulation,
  representativeSourceVersion,
  loadTimestampUtc,
}) {
  const productsByFamily = new Map();
  for (const row of planProductPopulation) {
    const bucket = productsByFamily.get(row.product_family_code) ?? [];
    bucket.push(row);
    productsByFamily.set(row.product_family_code, bucket);
  }

  const rows = [];

  for (const account of planAccountPopulation) {
    const familyQuotas = ACCOUNT_FAMILY_QUOTAS[account.account_pattern_class] ?? { UNCLASSIFIED: 1 };
    const seenProducts = new Set();
    let rank = 1;

    for (const [familyCode, quota] of Object.entries(familyQuotas)) {
      const familyPool = productsByFamily.get(familyCode) ?? [];
      const selected = pickDeterministicRows({
        rows: familyPool,
        count: quota,
        seed: `${account.account_sk}|${familyCode}`,
      });

      for (const product of selected) {
        if (seenProducts.has(product.product_sk)) {
          continue;
        }
        seenProducts.add(product.product_sk);
        rows.push({
          account_sk: account.account_sk,
          product_sk: product.product_sk,
          account_pattern_class: account.account_pattern_class,
          product_family_code: product.product_family_code,
          eligibility_rank: rank,
          activation_bias_code: deriveActivationBias(account.account_pattern_class, rank),
          baseline_share_band_code: deriveBaselineShareBand(rank),
          source_file_version: representativeSourceVersion,
          load_timestamp_utc: loadTimestampUtc,
        });
        rank += 1;
      }
    }

    const targetCount = ACCOUNT_ELIGIBILITY_COUNTS[account.account_pattern_class] ?? 1;
    if (seenProducts.size !== targetCount) {
      throw new Error(
        `Eligibility plan drift for ${account.account_sk}: expected ${targetCount}, got ${seenProducts.size}.`,
      );
    }
  }

  return rows.sort((left, right) =>
    `${left.account_sk}|${left.product_sk}`.localeCompare(`${right.account_sk}|${right.product_sk}`),
  );
}

function buildProductLocationStockingPlan({
  planProductPopulation,
  planInventoryLocationPopulation,
  representativeSourceVersion,
  loadTimestampUtc,
}) {
  const locationsByNodeType = new Map();
  for (const row of planInventoryLocationPopulation) {
    const bucket = locationsByNodeType.get(row.node_type_code) ?? [];
    bucket.push(row);
    locationsByNodeType.set(row.node_type_code, bucket);
  }

  const rows = [];

  for (const product of planProductPopulation) {
    const totalCount = STOCKING_BASE_COUNTS[product.product_family_code] ?? 1;
    const preferredNodeTypes = LOCATION_ROLE_PREFERENCE[product.product_family_code] ?? ["INTERNAL_WAREHOUSE"];
    const chosenKeys = new Set();
    let stockingRank = 1;

    for (let index = 0; index < totalCount; index += 1) {
      const nodeType = preferredNodeTypes[index % preferredNodeTypes.length];
      const candidates = locationsByNodeType.get(nodeType) ?? [];
      const location = pickSingleDeterministicRow(candidates, `${product.product_sk}|${nodeType}|${index}`);
      if (!location || chosenKeys.has(location.inventory_location_sk)) {
        continue;
      }
      chosenKeys.add(location.inventory_location_sk);
      rows.push({
        product_sk: product.product_sk,
        inventory_location_sk: location.inventory_location_sk,
        product_family_code: product.product_family_code,
        node_type_code: location.node_type_code,
        stocking_rank: stockingRank,
        primary_service_flag: stockingRank === 1 && location.service_capable_flag,
        source_file_version: representativeSourceVersion,
        load_timestamp_utc: loadTimestampUtc,
      });
      stockingRank += 1;
    }

    if (product.product_family_code === "CONTROLLED_ITEM" && product.clone_ordinal % 4 === 0) {
      const restrictedLocation = pickSingleDeterministicRow(
        locationsByNodeType.get("RESTRICTED_AREA") ?? [],
        `${product.product_sk}|restricted`,
      );
      if (restrictedLocation && !chosenKeys.has(restrictedLocation.inventory_location_sk)) {
        rows.push({
          product_sk: product.product_sk,
          inventory_location_sk: restrictedLocation.inventory_location_sk,
          product_family_code: product.product_family_code,
          node_type_code: restrictedLocation.node_type_code,
          stocking_rank: stockingRank,
          primary_service_flag: false,
          source_file_version: representativeSourceVersion,
          load_timestamp_utc: loadTimestampUtc,
        });
      }
    }

    if (product.product_family_code === "SMALL_PART" && product.clone_ordinal % 6 === 0) {
      const transitLocation = pickSingleDeterministicRow(
        locationsByNodeType.get("TRANSIT_NODE") ?? [],
        `${product.product_sk}|transit`,
      );
      if (transitLocation && !chosenKeys.has(transitLocation.inventory_location_sk)) {
        rows.push({
          product_sk: product.product_sk,
          inventory_location_sk: transitLocation.inventory_location_sk,
          product_family_code: product.product_family_code,
          node_type_code: transitLocation.node_type_code,
          stocking_rank: stockingRank + 1,
          primary_service_flag: false,
          source_file_version: representativeSourceVersion,
          load_timestamp_utc: loadTimestampUtc,
        });
      }
    }
  }

  return rows.sort((left, right) =>
    `${left.product_sk}|${left.inventory_location_sk}`.localeCompare(
      `${right.product_sk}|${right.inventory_location_sk}`,
    ),
  );
}

function buildRepresentativePublicPackage({
  seedPackage,
  planAccountPopulation,
  planProductPopulation,
  planInventoryLocationPopulation,
  planAccountProductEligibility,
  planProductLocationStocking,
  representativeSourceVersion,
  loadTimestampUtc,
}) {
  const dim_account = planAccountPopulation.map((row) => ({
    account_sk: row.account_sk,
    account_code: row.account_code,
    account_name: row.account_name,
    customer_group: row.customer_group,
    account_pattern_class: row.account_pattern_class,
    service_network_code: row.service_network_code,
    fulfillment_context_code: row.fulfillment_context_code,
    record_source_family: "account_reference_domain",
    source_file_version: representativeSourceVersion,
    record_status: RECORD_STATUS.dimension,
    publication_safety_flag: PUBLICATION_SAFETY_FLAG,
    load_timestamp_utc: loadTimestampUtc,
  }));

  const dim_product = planProductPopulation.map((row) => ({
    product_sk: row.product_sk,
    product_code: row.product_code,
    product_name: row.product_name,
    product_family_code: row.product_family_code,
    demand_pattern_class: row.demand_pattern_class,
    planning_constraint_class: row.planning_constraint_class,
    inventory_policy_class: row.inventory_policy_class,
    fulfillment_risk_class: row.fulfillment_risk_class,
    lead_time_band: row.lead_time_band,
    criticality_band: row.criticality_band,
    service_profile: row.service_profile,
    value_density_band: row.value_density_band,
    unit_economic_band_code: row.unit_economic_band_code,
    interchangeability_group_code: row.interchangeability_group_code,
    product_category: row.product_family_code,
    weight_value: deriveProductWeight(row.product_family_code, row.clone_ordinal),
    box_qty: deriveProductBoxQty(row.product_family_code, row.clone_ordinal),
    pallet_qty: deriveProductPalletQty(row.product_family_code, row.clone_ordinal),
    record_source_family: "product_reference_domain",
    source_file_version: representativeSourceVersion,
    record_status: RECORD_STATUS.dimension,
    publication_safety_flag: PUBLICATION_SAFETY_FLAG,
    load_timestamp_utc: loadTimestampUtc,
  }));

  const dim_product_family = seedPackage.dim_product_family.map((row) => ({
    ...row,
    source_file_version: representativeSourceVersion,
    load_timestamp_utc: loadTimestampUtc,
  }));

  const dim_inventory_location = planInventoryLocationPopulation.map((row) => ({
    inventory_location_sk: row.inventory_location_sk,
    site_code: row.site_code,
    location_code: row.location_code,
    location_name: row.location_name,
    node_type_code: row.node_type_code,
    logistics_area_code: row.logistics_area_code,
    location_role_description: row.location_role_description,
    record_source_family: "location_reference_domain",
    source_file_version: representativeSourceVersion,
    record_status: RECORD_STATUS.dimension,
    publication_safety_flag: PUBLICATION_SAFETY_FLAG,
    load_timestamp_utc: loadTimestampUtc,
  }));

  const productByKey = new Map(planProductPopulation.map((row) => [row.product_sk, row]));
  const accountByKey = new Map(planAccountPopulation.map((row) => [row.account_sk, row]));
  const locationByKey = new Map(planInventoryLocationPopulation.map((row) => [row.inventory_location_sk, row]));
  const stockingByProduct = new Map();
  for (const row of planProductLocationStocking) {
    const bucket = stockingByProduct.get(row.product_sk) ?? [];
    bucket.push(row);
    stockingByProduct.set(row.product_sk, bucket);
  }
  const primaryLocationByProduct = new Map();
  for (const [productSk, rows] of stockingByProduct.entries()) {
    const sortedRows = [...rows].sort((left, right) => left.stocking_rank - right.stocking_rank);
    const primary =
      sortedRows.find((row) => row.primary_service_flag)
      ?? sortedRows.find((row) => isServiceCapableNode(row.node_type_code))
      ?? sortedRows[0];
    primaryLocationByProduct.set(productSk, primary.inventory_location_sk);
  }

  const dateRange = enumerateDates(REPRESENTATIVE_WINDOW.startDate, REPRESENTATIVE_WINDOW.endDate);
  const inventoryState = initializeInventoryState({
    planProductPopulation,
    planInventoryLocationPopulation,
    planProductLocationStocking,
  });
  const inboundSchedule = buildInboundSchedule({
    dateRange,
    planProductPopulation,
    planProductLocationStocking,
  });
  const demandSchedule = buildDemandSchedule({
    dateRange,
    planAccountPopulation,
    planAccountProductEligibility,
    productByKey,
  });

  const fact_inventory_inbound = [];
  const fact_demand_line = [];
  const fact_inventory_snapshot = [];

  for (const isoDate of dateRange) {
    const dueInboundRows = inboundSchedule.get(isoDate) ?? [];
    for (const inbound of dueInboundRows) {
      const stateKey = `${inbound.product_sk}|${inbound.inventory_location_sk}`;
      const state = inventoryState.get(stateKey);
      if (!state) {
        continue;
      }
      if (state.location.node_type_code === "TRANSIT_NODE") {
        state.future_in_transit_qty += inbound.receipt_qty;
      } else {
        state.on_hand_qty += inbound.receipt_qty;
      }
      fact_inventory_inbound.push({
        inventory_inbound_sk: stableId("INB", `${stateKey}|${isoDate}|${inbound.receipt_flow_type}`),
        product_sk: inbound.product_sk,
        inventory_location_sk: inbound.inventory_location_sk,
        receipt_date: isoDate,
        receipt_qty: inbound.receipt_qty,
        receipt_flow_type: inbound.receipt_flow_type,
        receipt_value_proxy: Math.round(inbound.receipt_qty * inbound.unit_value),
        record_source_family: "inventory_receipt_domain",
        source_file_version: representativeSourceVersion,
        record_status: RECORD_STATUS.fact,
        publication_safety_flag: PUBLICATION_SAFETY_FLAG,
        load_timestamp_utc: loadTimestampUtc,
      });
    }

    const demandRowsForDate = demandSchedule.get(isoDate) ?? [];
    const openPressureByPair = new Map();

    for (const demand of demandRowsForDate) {
      const account = accountByKey.get(demand.account_sk);
      const product = productByKey.get(demand.product_sk);
      const primaryLocationSk = primaryLocationByProduct.get(demand.product_sk);
      const serviceState = inventoryState.get(`${demand.product_sk}|${primaryLocationSk}`);
      const availableQty = serviceState
        ? deriveAvailableQty({
          nodeTypeCode: serviceState.location.node_type_code,
          onHandQty: serviceState.on_hand_qty,
          reservedQty: serviceState.reserved_qty,
          futurePendingQty: serviceState.future_in_transit_qty,
        })
        : 0;
      const servedQty = Math.min(demand.demand_qty, availableQty);
      const openQty = Math.max(demand.demand_qty - servedQty, 0);

      if (serviceState) {
        serviceState.on_hand_qty = Math.max(serviceState.on_hand_qty - servedQty, 0);
        openPressureByPair.set(
          `${demand.product_sk}|${primaryLocationSk}`,
          (openPressureByPair.get(`${demand.product_sk}|${primaryLocationSk}`) ?? 0) + openQty,
        );
      }

      const unitValue = FAMILY_UNIT_VALUE[product.product_family_code] ?? 20;
      const marginRate = FAMILY_MARGIN_RATE[product.product_family_code] ?? 0.28;
      const demandValueProxy = Math.round(unitValue * demand.demand_qty);
      const grossMarginProxy = Math.round(demandValueProxy * marginRate);

      fact_demand_line.push({
        demand_line_sk: stableId("DMD", `${demand.account_sk}|${demand.product_sk}|${isoDate}`),
        product_sk: demand.product_sk,
        account_sk: demand.account_sk,
        event_date: isoDate,
        requested_delivery_date: addIsoDays(isoDate, deriveRequestLagDays(account.order_frequency_code)),
        demand_status_code: openQty > 0
          ? (servedQty > 0 ? "PARTIALLY_FULFILLED" : "OPEN")
          : "FULFILLED",
        demand_qty: demand.demand_qty,
        delivered_qty: servedQty,
        open_qty: openQty,
        order_group_code: stableUnderscoreCode(
          "ORDER_GROUP",
          `${demand.account_sk}|${demand.product_sk}|${isoDate}`,
        ),
        priority_code: openQty > 0 || demand.demand_qty >= 20 ? "HIGH" : "MEDIUM",
        demand_value_proxy: demandValueProxy,
        gross_margin_proxy: grossMarginProxy,
        record_source_family: "sales_activity_domain",
        source_file_version: representativeSourceVersion,
        record_status: RECORD_STATUS.fact,
        publication_safety_flag: PUBLICATION_SAFETY_FLAG,
        load_timestamp_utc: loadTimestampUtc,
      });
    }

    for (const [stateKey, state] of inventoryState.entries()) {
      const reservedQty = Math.min(
        state.on_hand_qty,
        openPressureByPair.get(stateKey) ?? deriveStandingReservation(state),
      );
      state.reserved_qty = reservedQty;
      const availableQty = deriveAvailableQty({
        nodeTypeCode: state.location.node_type_code,
        onHandQty: state.on_hand_qty,
        reservedQty,
        futurePendingQty: state.future_in_transit_qty,
      });
      const inventoryStatusCode = deriveInventoryStatus({
        nodeTypeCode: state.location.node_type_code,
        availableQty,
        futurePendingQty: state.future_in_transit_qty,
      });
      const readinessFlag =
        inventoryStatusCode === "READY" && availableQty > 0 ? "READY" : "AT_RISK";

      fact_inventory_snapshot.push({
        inventory_snapshot_sk: stableId("INV", `${stateKey}|${isoDate}`),
        product_sk: state.product.product_sk,
        inventory_location_sk: state.location.inventory_location_sk,
        snapshot_date: isoDate,
        on_hand_qty: state.on_hand_qty,
        available_qty: availableQty,
        inventory_status_code: inventoryStatusCode,
        reserved_qty: reservedQty,
        in_transit_qty: state.future_in_transit_qty,
        inventory_value_proxy: Math.round(
          state.on_hand_qty * (FAMILY_UNIT_VALUE[state.product.product_family_code] ?? 20),
        ),
        node_value_concentration_band: deriveNodeValueConcentrationBand(
          state.on_hand_qty * (FAMILY_UNIT_VALUE[state.product.product_family_code] ?? 20),
        ),
        readiness_flag: readinessFlag,
        record_source_family: "inventory_position_domain",
        source_file_version: representativeSourceVersion,
        record_status: RECORD_STATUS.fact,
        publication_safety_flag: PUBLICATION_SAFETY_FLAG,
        load_timestamp_utc: loadTimestampUtc,
      });
    }
  }

  const basePackage = {
    dim_account,
    dim_product,
    dim_product_family,
    dim_inventory_location,
    fact_demand_line,
    fact_inventory_inbound,
    fact_inventory_snapshot,
  };

  return {
    ...basePackage,
    ...buildOperatingLoopTables({
      representativePackage: basePackage,
      planProductLocationStocking,
      representativeSourceVersion,
      loadTimestampUtc,
    }),
  };
}

function initializeInventoryState({
  planProductPopulation,
  planInventoryLocationPopulation,
  planProductLocationStocking,
}) {
  const productByKey = new Map(planProductPopulation.map((row) => [row.product_sk, row]));
  const locationByKey = new Map(
    planInventoryLocationPopulation.map((row) => [row.inventory_location_sk, row]),
  );
  const state = new Map();

  for (const row of planProductLocationStocking) {
    const product = productByKey.get(row.product_sk);
    const location = locationByKey.get(row.inventory_location_sk);
    const baseQty = deriveOpeningOnHand(product.product_family_code, row.stocking_rank, location.node_type_code, row.product_sk);
    const reservedQty = location.node_type_code === "RESTRICTED_AREA"
      ? baseQty
      : Math.min(baseQty, stableIndex(`${row.product_sk}|reserved`, 4));
    const futureTransitQty =
      location.node_type_code === "TRANSIT_NODE"
        ? deriveTransitQty(product.product_family_code, row.product_sk)
        : 0;

    state.set(`${row.product_sk}|${row.inventory_location_sk}`, {
      product,
      location,
      stocking: row,
      on_hand_qty: baseQty,
      reserved_qty: reservedQty,
      future_in_transit_qty: futureTransitQty,
    });
  }

  return state;
}

function buildInboundSchedule({
  dateRange,
  planProductPopulation,
  planProductLocationStocking,
}) {
  const productByKey = new Map(planProductPopulation.map((row) => [row.product_sk, row]));
  const schedule = new Map();

  for (const row of planProductLocationStocking) {
    const product = productByKey.get(row.product_sk);
    const cadence = deriveReceiptCadenceDays(product.product_family_code);
    const offset = stableIndex(`${row.product_sk}|${row.inventory_location_sk}|offset`, cadence);
    const unitValue = FAMILY_UNIT_VALUE[product.product_family_code] ?? 20;

    for (let dayIndex = offset; dayIndex < dateRange.length; dayIndex += cadence) {
      const isoDate = dateRange[dayIndex];
      const bucket = schedule.get(isoDate) ?? [];
      bucket.push({
        product_sk: row.product_sk,
        inventory_location_sk: row.inventory_location_sk,
        receipt_qty: deriveReceiptQty(product.product_family_code, row.product_sk, dayIndex),
        receipt_flow_type: deriveReceiptFlowType(product.product_family_code, row.node_type_code),
        unit_value: unitValue,
      });
      schedule.set(isoDate, bucket);
    }
  }

  return schedule;
}

function buildDemandSchedule({
  dateRange,
  planAccountPopulation,
  planAccountProductEligibility,
  productByKey,
}) {
  const accountByKey = new Map(planAccountPopulation.map((row) => [row.account_sk, row]));
  const schedule = new Map();

  for (const eligibility of planAccountProductEligibility) {
    const account = accountByKey.get(eligibility.account_sk);
    const product = productByKey.get(eligibility.product_sk);
    const cadence = ACCOUNT_EVENT_CADENCE_DAYS[account.account_pattern_class] ?? 10;
    const offset = stableIndex(`${eligibility.account_sk}|${eligibility.product_sk}|cadence`, cadence);

    for (let dayIndex = 0; dayIndex < dateRange.length; dayIndex += 1) {
      if ((dayIndex + offset) % cadence !== 0) {
        continue;
      }

      const isoDate = dateRange[dayIndex];
      const bucket = schedule.get(isoDate) ?? [];
      bucket.push({
        account_sk: eligibility.account_sk,
        product_sk: eligibility.product_sk,
        demand_qty: deriveDemandQty({
          accountPatternClass: account.account_pattern_class,
          productFamilyCode: product.product_family_code,
          isoDate,
          identityKey: `${eligibility.account_sk}|${eligibility.product_sk}|${isoDate}`,
        }),
      });
      schedule.set(isoDate, bucket);
    }
  }

  return schedule;
}

function deriveDemandQty({
  accountPatternClass,
  productFamilyCode,
  isoDate,
  identityKey,
}) {
  const [minQty, maxQty] = PRODUCT_FAMILY_EVENT_QTY[productFamilyCode] ?? [2, 8];
  const span = maxQty - minQty + 1;
  const baseQty = minQty + stableIndex(identityKey, span);
  const seasonalityFactor = representativeSeasonality(accountPatternClass, isoDate);
  const patternFactor = {
    RECURRING_SERVICE: 1.0,
    PROJECT_BASED: 1.18,
    PARTNER_CHANNEL: 1.1,
    UNKNOWN: 0.75,
  }[accountPatternClass] ?? 1.0;

  return Math.max(1, Math.round(baseQty * seasonalityFactor * patternFactor));
}

function representativeSeasonality(accountPatternClass, isoDate) {
  const month = Number.parseInt(isoDate.slice(5, 7), 10);
  const day = Number.parseInt(isoDate.slice(8, 10), 10);

  if (accountPatternClass === "RECURRING_SERVICE") {
    return [3, 4, 5].includes(month) ? 1.06 : 0.98;
  }
  if (accountPatternClass === "PROJECT_BASED") {
    return day >= 10 && day <= 24 ? 1.12 : 0.94;
  }
  if (accountPatternClass === "PARTNER_CHANNEL") {
    return [15, 30, 31].includes(day) ? 1.08 : 1.0;
  }
  return 1.0;
}

function deriveOpeningOnHand(productFamilyCode, stockingRank, nodeTypeCode, identityKey) {
  if (nodeTypeCode === "TRANSIT_NODE") {
    return 0;
  }

  const ranges = {
    SMALL_PART: [36, 110],
    KIT_ASSEMBLY: [6, 18],
    BULKY_ITEM: [10, 30],
    CONTROLLED_ITEM: [5, 16],
    UNCLASSIFIED: [4, 12],
  };
  const [minQty, maxQty] = ranges[productFamilyCode] ?? [4, 12];
  const span = maxQty - minQty + 1;
  const baseQty = minQty + stableIndex(`${identityKey}|${stockingRank}`, span);

  if (nodeTypeCode === "RESTRICTED_AREA") {
    return Math.max(2, Math.round(baseQty * 0.5));
  }
  if (nodeTypeCode === "THIRD_PARTY_NODE") {
    return Math.max(3, Math.round(baseQty * 0.8));
  }
  return baseQty;
}

function deriveTransitQty(productFamilyCode, identityKey) {
  const base = {
    SMALL_PART: 20,
    KIT_ASSEMBLY: 6,
    BULKY_ITEM: 10,
    CONTROLLED_ITEM: 5,
    UNCLASSIFIED: 4,
  }[productFamilyCode] ?? 5;
  return base + stableIndex(`${identityKey}|transit_qty`, base);
}

function deriveStandingReservation(state) {
  if (!isServiceCapableNode(state.location.node_type_code)) {
    return 0;
  }
  return Math.min(state.on_hand_qty, stableIndex(`${state.product.product_sk}|standing`, 4));
}

function deriveAvailableQty({ nodeTypeCode, onHandQty, reservedQty, futurePendingQty }) {
  if (nodeTypeCode === "RESTRICTED_AREA" || nodeTypeCode === "TRANSIT_NODE") {
    return 0;
  }
  if (nodeTypeCode === "THIRD_PARTY_NODE" && futurePendingQty > 0) {
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

function deriveNodeValueConcentrationBand(totalValue) {
  if (totalValue >= 1500) {
    return "NODE_HIGH";
  }
  if (totalValue >= 500) {
    return "NODE_MEDIUM";
  }
  return "NODE_LOW";
}

function deriveProductWeight(productFamilyCode, ordinal) {
  const ranges = {
    SMALL_PART: [1, 3],
    KIT_ASSEMBLY: [6, 15],
    BULKY_ITEM: [12, 24],
    CONTROLLED_ITEM: [2, 8],
    UNCLASSIFIED: [1, 10],
  };
  const [minQty, maxQty] = ranges[productFamilyCode] ?? [1, 10];
  return minQty + stableIndex(`${productFamilyCode}|weight|${ordinal}`, maxQty - minQty + 1);
}

function deriveProductBoxQty(productFamilyCode, ordinal) {
  const ranges = {
    SMALL_PART: [25, 100],
    KIT_ASSEMBLY: [2, 6],
    BULKY_ITEM: [4, 12],
    CONTROLLED_ITEM: [6, 24],
    UNCLASSIFIED: [4, 20],
  };
  const [minQty, maxQty] = ranges[productFamilyCode] ?? [4, 20];
  return minQty + stableIndex(`${productFamilyCode}|box|${ordinal}`, maxQty - minQty + 1);
}

function deriveProductPalletQty(productFamilyCode, ordinal) {
  const ranges = {
    SMALL_PART: [250, 900],
    KIT_ASSEMBLY: [8, 24],
    BULKY_ITEM: [12, 40],
    CONTROLLED_ITEM: [40, 120],
    UNCLASSIFIED: [12, 60],
  };
  const [minQty, maxQty] = ranges[productFamilyCode] ?? [12, 60];
  return minQty + stableIndex(`${productFamilyCode}|pallet|${ordinal}`, maxQty - minQty + 1);
}

function deriveReceiptCadenceDays(productFamilyCode) {
  return {
    SMALL_PART: 8,
    KIT_ASSEMBLY: 14,
    BULKY_ITEM: 12,
    CONTROLLED_ITEM: 10,
    UNCLASSIFIED: 16,
  }[productFamilyCode] ?? 14;
}

function deriveReceiptQty(productFamilyCode, identityKey, dayIndex) {
  const ranges = {
    SMALL_PART: [22, 70],
    KIT_ASSEMBLY: [4, 10],
    BULKY_ITEM: [6, 16],
    CONTROLLED_ITEM: [3, 10],
    UNCLASSIFIED: [4, 12],
  };
  const [minQty, maxQty] = ranges[productFamilyCode] ?? [4, 10];
  const span = maxQty - minQty + 1;
  return minQty + stableIndex(`${identityKey}|receipt|${dayIndex}`, span);
}

function deriveReceiptFlowType(productFamilyCode, nodeTypeCode) {
  if (nodeTypeCode === "TRANSIT_NODE" || nodeTypeCode === "THIRD_PARTY_NODE") {
    return "TRANSFER_IN";
  }
  if (productFamilyCode === "KIT_ASSEMBLY") {
    return "KIT_COMPLETION";
  }
  return "SUPPLIER_RECEIPT";
}

function deriveRequestLagDays(orderFrequencyCode) {
  return {
    WEEKLY_REPLENISH: 3,
    PROJECT_MILESTONE: 10,
    BATCHED_MONTHLY: 5,
    IRREGULAR: 7,
  }[orderFrequencyCode] ?? 5;
}

function deriveBaselineShareBand(rank) {
  if (rank === 1) {
    return "SHARE_35_69";
  }
  if (rank <= 3) {
    return "SHARE_10_34";
  }
  return "SHARE_00_09";
}

function deriveActivationBias(accountPatternClass, rank) {
  if (accountPatternClass === "RECURRING_SERVICE") {
    return rank <= 2 ? "SERVICE_CORE" : "GENERAL_EXTENDED";
  }
  if (accountPatternClass === "PROJECT_BASED") {
    return "PROJECT_ALIGNED";
  }
  if (accountPatternClass === "PARTNER_CHANNEL") {
    return rank <= 2 ? "CHANNEL_CORE" : "GENERAL_EXTENDED";
  }
  return "FALLBACK_EDGE";
}

function deriveFulfillmentContext(pattern, identityKey) {
  if (pattern === "RECURRING_SERVICE") {
    return stableIndex(identityKey, 5) === 0 ? "PARTNER_ROUTED" : "DIRECT_SERVICE";
  }
  if (pattern === "PROJECT_BASED") {
    return stableIndex(identityKey, 2) === 0 ? "PARTNER_ROUTED" : "THIRD_PARTY_ROUTED";
  }
  if (pattern === "PARTNER_CHANNEL") {
    return stableIndex(identityKey, 4) === 0 ? "PARTNER_ROUTED" : "THIRD_PARTY_ROUTED";
  }
  return "UNKNOWN";
}

function pickDeterministicRows({ rows, count, seed }) {
  if (rows.length === 0 || count <= 0) {
    return [];
  }

  const sortedRows = [...rows].sort((left, right) => left.product_sk.localeCompare(right.product_sk));
  const startIndex = stableIndex(seed, sortedRows.length);
  const picks = [];

  for (let offset = 0; offset < sortedRows.length && picks.length < count; offset += 1) {
    picks.push(sortedRows[(startIndex + offset) % sortedRows.length]);
  }

  return picks;
}

function pickSingleDeterministicRow(rows, seed) {
  if (!rows || rows.length === 0) {
    return null;
  }

  const sortedRows = [...rows].sort((left, right) => {
    const leftKey = left.inventory_location_sk ?? left.product_sk ?? "";
    const rightKey = right.inventory_location_sk ?? right.product_sk ?? "";
    return leftKey.localeCompare(rightKey);
  });

  return sortedRows[stableIndex(seed, sortedRows.length)];
}

function buildRepresentativeSourceVersion({ seedPackage, ruleVersion }) {
  const seedVersion =
    seedPackage.dim_product[0]?.source_file_version ?? PUBLIC_RELEASE_VERSION;
  return `${seedVersion}__${ruleVersion}`;
}

function enumerateDates(startIsoDate, endIsoDate) {
  const dates = [];
  let current = startIsoDate;
  while (current <= endIsoDate) {
    dates.push(current);
    current = addIsoDays(current, 1);
  }
  return dates;
}

function stableId(prefix, key) {
  return `${prefix}_SK_${stableCodeSegment(`${prefix}|${key}`, 12)}`;
}

function stableDashCode(prefix, key) {
  return `${prefix}-${stableCodeSegment(`${prefix}|${key}`, 6)}`;
}

function stableUnderscoreCode(prefix, key) {
  return `${prefix}_${stableCodeSegment(`${prefix}|${key}`, 6)}`;
}

function stableSuffix(key) {
  return stableCodeSegment(`suffix|${key}`, 6);
}

function stableCodeSegment(key, length) {
  return createHash("sha256")
    .update(`${HASH_NAMESPACE}|${key}`)
    .digest("hex")
    .slice(0, length)
    .toUpperCase();
}

function stableIndex(key, modulo) {
  if (modulo <= 1) {
    return 0;
  }
  const digest = createHash("sha256")
    .update(`${HASH_NAMESPACE}|${key}`)
    .digest("hex");
  return Number.parseInt(digest.slice(0, 8), 16) % modulo;
}

function isServiceCapableNode(nodeTypeCode) {
  return [
    "INTERNAL_WAREHOUSE",
    "FLOOR_AREA",
    "OVERFLOW_AREA",
    "THIRD_PARTY_NODE",
  ].includes(nodeTypeCode);
}

function addIsoDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function loadRepresentativePlanTables(internalDir = DEFAULT_REPRESENTATIVE_INTERNAL_DIR) {
  const entries = await Promise.all(
    Object.entries(REPRESENTATIVE_PLAN_FILENAMES).map(async ([key, filename]) => [
      key,
      await readJsonFile(path.join(internalDir, filename)),
    ]),
  );

  return Object.fromEntries(entries);
}
