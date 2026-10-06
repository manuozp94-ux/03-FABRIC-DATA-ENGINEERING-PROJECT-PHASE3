import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(MODULE_DIR, "../../..");
export const DEFAULT_SOURCE_DIR = path.join(
  REPO_ROOT,
  "tests/publication/fixtures/source-safe",
);
export const DEFAULT_OUTPUT_DIR = path.join(
  REPO_ROOT,
  "platform/fabric/publication/current",
);
export const PUBLICATION_SAFETY_FLAG = "publication_safe";
export const PUBLIC_RELEASE_VERSION = "curated_publication_r2";
export const PUBLIC_SALES_START_DATE = "2024-01-01";

const PRIVATE_NAMESPACE = "fabric-platform-dev-bmad-dimension-build-v1";
const PUBLIC_RECORD_FAMILIES = {
  dim_product: "product_reference_domain",
  dim_product_family: "classification_reference_domain",
  dim_account: "account_reference_domain",
  dim_inventory_location: "location_reference_domain",
  fact_demand_line: "sales_activity_domain",
  fact_inventory_inbound: "inventory_receipt_domain",
  fact_inventory_snapshot: "inventory_position_domain",
};

export const OUTPUT_FILENAMES = {
  dim_product: "dim_product.json",
  dim_product_family: "dim_product_family.json",
  dim_account: "dim_account.json",
  dim_inventory_location: "dim_inventory_location.json",
  fact_demand_line: "fact_demand_line.json",
  fact_inventory_inbound: "fact_inventory_inbound.json",
  fact_inventory_snapshot: "fact_inventory_snapshot.json",
};

export const REQUIRED_FIELDS = {
  dim_product: [
    "product_sk",
    "product_code",
    "product_name",
    "product_family_code",
    "demand_pattern_class",
    "planning_constraint_class",
    "inventory_policy_class",
    "fulfillment_risk_class",
    "lead_time_band",
    "criticality_band",
    "service_profile",
    "value_density_band",
    "unit_economic_band_code",
    "interchangeability_group_code",
    "product_category",
    "weight_value",
    "box_qty",
    "pallet_qty",
    "record_source_family",
    "source_file_version",
    "publication_safety_flag",
  ],
  dim_product_family: [
    "product_family_code",
    "product_family_name",
    "family_description",
    "storage_profile",
    "handling_profile",
    "synthetic_margin_band_code",
    "publication_safety_flag",
  ],
  dim_account: [
    "account_sk",
    "account_code",
    "account_name",
    "customer_group",
    "account_pattern_class",
    "service_network_code",
    "fulfillment_context_code",
    "record_source_family",
    "source_file_version",
    "publication_safety_flag",
  ],
  dim_inventory_location: [
    "inventory_location_sk",
    "site_code",
    "location_code",
    "location_name",
    "node_type_code",
    "logistics_area_code",
    "location_role_description",
    "publication_safety_flag",
  ],
  fact_demand_line: [
    "demand_line_sk",
    "product_sk",
    "account_sk",
    "event_date",
    "requested_delivery_date",
    "demand_status_code",
    "demand_qty",
    "delivered_qty",
    "open_qty",
    "record_source_family",
    "source_file_version",
    "publication_safety_flag",
  ],
  fact_inventory_inbound: [
    "inventory_inbound_sk",
    "product_sk",
    "inventory_location_sk",
    "receipt_date",
    "receipt_qty",
    "receipt_flow_type",
    "record_source_family",
    "source_file_version",
    "publication_safety_flag",
  ],
  fact_inventory_snapshot: [
    "inventory_snapshot_sk",
    "product_sk",
    "inventory_location_sk",
    "snapshot_date",
    "on_hand_qty",
    "available_qty",
    "inventory_status_code",
    "record_source_family",
    "source_file_version",
    "publication_safety_flag",
  ],
};

export const ALLOWED_NODE_TYPES = [
  "INTERNAL_WAREHOUSE",
  "THIRD_PARTY_NODE",
  "TRANSIT_NODE",
  "FLOOR_AREA",
  "RESTRICTED_AREA",
  "OVERFLOW_AREA",
  "UNKNOWN",
];

export const ALLOWED_PRODUCT_FAMILY_CODES = [
  "STANDARD_COMPONENT",
  "KIT_ASSEMBLY",
  "SMALL_PART",
  "BULKY_ITEM",
  "CONTROLLED_ITEM",
  "UNCLASSIFIED",
];

export const ALLOWED_DEMAND_PATTERN_CLASSES = [
  "RECURRING_DEMAND",
  "PROJECT_DEMAND",
  "EXCEPTION_DEMAND",
  "UNKNOWN",
];

export const ALLOWED_PLANNING_CONSTRAINT_CLASSES = [
  "STANDARD_FLOW",
  "PROJECT_SCOPED",
  "CONTROLLED_FLOW",
  "UNKNOWN",
];

export const ALLOWED_INVENTORY_POLICY_CLASSES = [
  "GENERAL_STOCK",
  "STAGE_AND_COORDINATE",
  "HIGH_DENSITY_BIN",
  "PALLET_BUFFER",
  "CONTROLLED_STOCK",
  "UNKNOWN",
];

export const ALLOWED_FULFILLMENT_RISK_CLASSES = [
  "STANDARD_RISK",
  "COORDINATION_RISK",
  "PICK_DENSITY_RISK",
  "SPACE_RISK",
  "CONTROL_RISK",
  "UNKNOWN",
];

export const ALLOWED_LEAD_TIME_BANDS = ["SHORT", "MEDIUM", "LONG", "UNKNOWN"];
export const ALLOWED_CRITICALITY_BANDS = [
  "BASELINE",
  "ELEVATED",
  "HIGH",
  "UNKNOWN",
];
export const ALLOWED_SERVICE_PROFILES = [
  "STANDARD_SERVICE",
  "PROJECT_SERVICE",
  "DENSE_PICK_SERVICE",
  "BULK_SERVICE",
  "CONTROLLED_SERVICE",
  "UNKNOWN",
];
export const ALLOWED_VALUE_DENSITY_BANDS = [
  "LOW_DENSITY",
  "MEDIUM_DENSITY",
  "HIGH_DENSITY",
  "UNKNOWN",
];
export const ALLOWED_UNIT_ECONOMIC_BAND_CODES = [
  "BAND_E0",
  "BAND_E1",
  "BAND_E2",
  "BAND_E3",
  "BAND_E4",
];
export const ALLOWED_ACCOUNT_PATTERN_CLASSES = [
  "RECURRING_SERVICE",
  "PROJECT_BASED",
  "PARTNER_CHANNEL",
  "UNKNOWN",
];
export const ALLOWED_DEMAND_STATUS_CODES = [
  "OPEN",
  "PARTIALLY_FULFILLED",
  "FULFILLED",
  "CANCELLED",
  "UNKNOWN",
];
export const ALLOWED_PRIORITY_CODES = ["LOW", "MEDIUM", "HIGH", "UNKNOWN"];
export const ALLOWED_INVENTORY_STATUS_CODES = [
  "READY",
  "AT_RISK",
  "IN_TRANSIT",
  "RESTRICTED",
  "UNKNOWN",
];
export const ALLOWED_RECEIPT_FLOW_TYPES = [
  "SUPPLIER_RECEIPT",
  "TRANSFER_IN",
  "KIT_COMPLETION",
  "RETURN_TO_STOCK",
  "UNKNOWN",
];
export const ALLOWED_READINESS_FLAGS = ["READY", "AT_RISK", "NOT_READY", "UNKNOWN"];
export const ALLOWED_NODE_VALUE_CONCENTRATION_BANDS = [
  "NODE_LOW",
  "NODE_MEDIUM",
  "NODE_HIGH",
  "NODE_UNKNOWN",
];

export const PRODUCT_FAMILY_PROFILES = {
  STANDARD_COMPONENT: {
    product_family_name: "Standard Components",
    family_description:
      "General components that support baseline replenishment and stable operational planning.",
    storage_profile: "general_storage",
    handling_profile: "standard_handling",
    synthetic_margin_band_code: "BAND_M2",
    public_item_label: "Standard Component",
    product_category: "STANDARD_COMPONENT",
  },
  KIT_ASSEMBLY: {
    product_family_name: "Kit Assemblies",
    family_description:
      "Grouped multi-part items that require coordinated staging and completion handling.",
    storage_profile: "bin_and_staging",
    handling_profile: "multi_part_pick",
    synthetic_margin_band_code: "BAND_M3",
    public_item_label: "Kit Assembly",
    product_category: "KIT_ASSEMBLY",
  },
  SMALL_PART: {
    product_family_name: "Small Parts",
    family_description:
      "High-count compact parts that favor dense storage and count-sensitive replenishment.",
    storage_profile: "small_parts_bin",
    handling_profile: "count_sensitive_pick",
    synthetic_margin_band_code: "BAND_M1",
    public_item_label: "Small Part",
    product_category: "SMALL_PART",
  },
  BULKY_ITEM: {
    product_family_name: "Bulky Items",
    family_description:
      "Items whose storage or movement emphasizes space usage and pallet-oriented handling.",
    storage_profile: "pallet_forward",
    handling_profile: "forklift_assisted",
    synthetic_margin_band_code: "BAND_M2",
    public_item_label: "Bulky Item",
    product_category: "BULKY_ITEM",
  },
  CONTROLLED_ITEM: {
    product_family_name: "Controlled Items",
    family_description:
      "Items governed by controlled planning logic, restricted handling, or exception management.",
    storage_profile: "controlled_access",
    handling_profile: "exception_managed",
    synthetic_margin_band_code: "BAND_M4",
    public_item_label: "Controlled Item",
    product_category: "CONTROLLED_ITEM",
  },
  UNCLASSIFIED: {
    product_family_name: "Unclassified Items",
    family_description:
      "Fallback family used when bounded source attributes do not support a safe deterministic assignment.",
    storage_profile: "unknown",
    handling_profile: "unknown",
    synthetic_margin_band_code: "BAND_M0",
    public_item_label: "Unclassified Item",
    product_category: "UNCLASSIFIED",
  },
};

export const CUSTOMER_GROUP_PROFILES = {
  RECURRING_SERVICE: {
    customer_group: "Field Service",
  },
  PROJECT_BASED: {
    customer_group: "Project Delivery",
  },
  PARTNER_CHANNEL: {
    customer_group: "Channel Support",
  },
  UNKNOWN: {
    customer_group: "Legacy Coverage",
  },
};

const PUBLIC_ACCOUNT_REGION_TOKENS = [
  "North Corridor",
  "Harbor Line",
  "Metro East",
  "Central Ridge",
  "South Gate",
  "West Junction",
  "River Bend",
  "Summit Point",
];

const PUBLIC_PRODUCT_NAME_STEMS = {
  STANDARD_COMPONENT: [
    "Core Rail Module",
    "Support Base Module",
    "Anchor Service Unit",
    "Standard Mount Module",
  ],
  KIT_ASSEMBLY: [
    "Field Retrofit Kit",
    "Relay Conversion Kit",
    "Access Upgrade Kit",
    "Service Junction Kit",
    "Control Retrofit Kit",
  ],
  SMALL_PART: [
    "Anchor Fastener Pack",
    "Bracket Hardware Set",
    "Service Clamp Pack",
    "Mounting Bolt Kit",
    "Alignment Shim Pack",
  ],
  BULKY_ITEM: [
    "Pallet Support Frame",
    "Storage Rail Module",
    "Bulk Support Cradle",
    "Lift-Assist Assembly",
    "Forward Stock Frame",
  ],
  CONTROLLED_ITEM: [
    "Flow Control Module",
    "Protected Relay Unit",
    "Restricted Access Assembly",
    "Secure Drive Module",
    "Guarded Valve Kit",
  ],
  UNCLASSIFIED: [
    "General Service Item",
    "Legacy Support Item",
    "Utility Stock Item",
    "Reference Supply Item",
  ],
};

export function parseBuildArgs(argv) {
  const parsed = {
    sourceDir: DEFAULT_SOURCE_DIR,
    outputDir: DEFAULT_OUTPUT_DIR,
    loadTimestampUtc: undefined,
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

    if (arg === "--output") {
      parsed.outputDir = path.resolve(next);
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

export async function readJsonFile(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export async function writeJsonFile(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function loadSourceFamilies(sourceDir = DEFAULT_SOURCE_DIR) {
  const [
    productInformation,
    customerDemand,
    accountAssignments,
    stockOverview,
    inventoryInbound,
  ] =
    await Promise.all([
      readJsonFile(path.join(sourceDir, "product-information.json")),
      readJsonFile(path.join(sourceDir, "customer-demand.json")),
      readJsonFile(path.join(sourceDir, "account-assignments.json")),
      readJsonFile(path.join(sourceDir, "stock-overview.json")),
      readJsonFile(path.join(sourceDir, "inventory-inbound.json")),
    ]);

  return {
    productInformation,
    customerDemand,
    accountAssignments,
    stockOverview,
    inventoryInbound,
  };
}

export function buildAllDimensions(sourceFamilies, options = {}) {
  const loadTimestampUtc = options.loadTimestampUtc ?? new Date().toISOString();

  const dim_product = buildProductDimension(
    sourceFamilies.productInformation,
    loadTimestampUtc,
  );
  const dim_product_family = buildProductFamilyDimension(loadTimestampUtc, dim_product);
  const dim_account = buildAccountDimension(
    sourceFamilies.accountAssignments,
    loadTimestampUtc,
  );
  const dim_inventory_location = buildInventoryLocationDimension(
    sourceFamilies.stockOverview,
    loadTimestampUtc,
  );
  const fact_demand_line = buildDemandFact(sourceFamilies.customerDemand, loadTimestampUtc, {
    dim_product,
    dim_account,
  });
  const fact_inventory_inbound = buildInventoryInboundFact(
    sourceFamilies.inventoryInbound,
    loadTimestampUtc,
    {
      dim_product,
      dim_inventory_location,
    },
  );
  const fact_inventory_snapshot = buildInventorySnapshotFact(
    sourceFamilies.stockOverview,
    loadTimestampUtc,
    {
      dim_product,
      dim_inventory_location,
    },
  );

  return {
    dim_product,
    dim_product_family,
    dim_account,
    dim_inventory_location,
    fact_demand_line,
    fact_inventory_inbound,
    fact_inventory_snapshot,
  };
}

export async function buildDimensionsToDirectory(options = {}) {
  const sourceDir = options.sourceDir ?? DEFAULT_SOURCE_DIR;
  const outputDir = options.outputDir ?? DEFAULT_OUTPUT_DIR;
  const sourceFamilies = await loadSourceFamilies(sourceDir);
  const dimensions = buildAllDimensions(sourceFamilies, {
    loadTimestampUtc: options.loadTimestampUtc,
  });

  await mkdir(outputDir, { recursive: true });

  await Promise.all(
    Object.entries(OUTPUT_FILENAMES).map(([key, filename]) =>
      writeJsonFile(path.join(outputDir, filename), dimensions[key]),
    ),
  );

  return {
    sourceDir,
    outputDir,
    dimensions,
  };
}

export function classifyProductFamily(record) {
  const category = upperText(record.product_category);
  const name = upperText(record.product_name);
  const planningModel = upperText(record.planning_model);
  const forecastingCategory = upperText(record.forecasting_category);
  const boxQty = toInteger(record.box_qty);
  const palletQty = toInteger(record.pallet_qty);
  const weightValue = toNumber(record.weight_value);

  if (!category && !planningModel && !forecastingCategory) {
    return "UNCLASSIFIED";
  }

  if (
    category.includes("KIT") ||
    name.includes("KIT") ||
    name.includes("BUNDLE")
  ) {
    return "KIT_ASSEMBLY";
  }

  if (
    category.includes("HARDWARE") ||
    name.includes("FASTENER") ||
    boxQty >= 200
  ) {
    return "SMALL_PART";
  }

  if (
    planningModel.includes("CONSTRAINED") ||
    forecastingCategory.includes("SPECIAL")
  ) {
    return "CONTROLLED_ITEM";
  }

  if (weightValue >= 25 || palletQty >= 20) {
    return "BULKY_ITEM";
  }

  return "STANDARD_COMPONENT";
}

export function classifyNodeType(record) {
  const ownershipModel = upperText(record.ownership_model);
  const storageType = upperText(record.storage_type);
  const locationName = upperText(record.location_name);

  if (
    ownershipModel.includes("THIRD") ||
    ownershipModel.includes("3PL") ||
    ownershipModel.includes("EXTERNAL")
  ) {
    return "THIRD_PARTY_NODE";
  }

  if (storageType.includes("TRANSIT") || locationName.includes("TRANSIT")) {
    return "TRANSIT_NODE";
  }

  if (
    storageType.includes("RESTRICT") ||
    locationName.includes("RESTRICTED") ||
    locationName.includes("QUARANTINE")
  ) {
    return "RESTRICTED_AREA";
  }

  if (storageType.includes("OVERFLOW") || locationName.includes("OVERFLOW")) {
    return "OVERFLOW_AREA";
  }

  if (storageType.includes("FLOOR") || locationName.includes("FLOOR")) {
    return "FLOOR_AREA";
  }

  if (
    ownershipModel.includes("INTERNAL") ||
    storageType.includes("RACK") ||
    storageType.includes("BIN")
  ) {
    return "INTERNAL_WAREHOUSE";
  }

  return "UNKNOWN";
}

function buildProductDimension(records, loadTimestampUtc) {
  const sortedRecords = [...records].sort((left, right) =>
    sourceProductKey(left).localeCompare(sourceProductKey(right)),
  );
  const familyOrdinalByCode = new Map();

  return sortedRecords.map((record) => {
    const sourceKey = sourceProductKey(record);
    const familyCode = classifyProductFamily(record);
    const familyProfile = PRODUCT_FAMILY_PROFILES[familyCode];
    const familyOrdinal = (familyOrdinalByCode.get(familyCode) ?? 0) + 1;
    familyOrdinalByCode.set(familyCode, familyOrdinal);
    const productCode = stableMaskedCode("PRD", sourceKey);
    const demandPatternClass = normalizeDemandPatternClass(
      record.forecasting_category,
    );
    const planningConstraintClass = normalizePlanningConstraintClass(
      record.planning_model,
    );
    const inventoryPolicyClass = deriveInventoryPolicyClass({
      familyCode,
      demandPatternClass,
      planningConstraintClass,
    });
    const fulfillmentRiskClass = deriveFulfillmentRiskClass({
      familyCode,
      demandPatternClass,
      planningConstraintClass,
    });
    const leadTimeBand = deriveLeadTimeBand({
      familyCode,
      demandPatternClass,
      planningConstraintClass,
    });
    const criticalityBand = deriveCriticalityBand({
      familyCode,
      demandPatternClass,
      planningConstraintClass,
    });
    const serviceProfile = deriveServiceProfile({
      familyCode,
      demandPatternClass,
      planningConstraintClass,
    });
    const valueDensityBand = deriveValueDensityBand({
      familyCode,
      weightValue: toNumber(record.weight_value),
      boxQty: toInteger(record.box_qty),
    });
    const unitEconomicBandCode = deriveUnitEconomicBandCode({
      familyCode,
      criticalityBand,
      valueDensityBand,
    });
    const interchangeabilityGroupCode = deriveInterchangeabilityGroupCode(familyCode);

    return {
      product_sk: stablePublicKey("PRD", sourceKey),
      product_code: productCode,
      product_name: buildPublicProductName({
        productFamilyCode: familyCode,
        identityKey: sourceKey,
        ordinal: familyOrdinal,
      }),
      product_family_code: familyCode,
      demand_pattern_class: demandPatternClass,
      planning_constraint_class: planningConstraintClass,
      inventory_policy_class: inventoryPolicyClass,
      fulfillment_risk_class: fulfillmentRiskClass,
      lead_time_band: leadTimeBand,
      criticality_band: criticalityBand,
      service_profile: serviceProfile,
      value_density_band: valueDensityBand,
      unit_economic_band_code: unitEconomicBandCode,
      interchangeability_group_code: interchangeabilityGroupCode,
      product_category: familyProfile.product_category,
      weight_value: toNumber(record.weight_value),
      box_qty: toInteger(record.box_qty),
      pallet_qty: toInteger(record.pallet_qty),
      record_source_family: PUBLIC_RECORD_FAMILIES.dim_product,
      source_file_version: PUBLIC_RELEASE_VERSION,
      record_status: normalizeRecordStatus(record.record_status),
      publication_safety_flag: PUBLICATION_SAFETY_FLAG,
      load_timestamp_utc: loadTimestampUtc,
    };
  });
}

function buildProductFamilyDimension(loadTimestampUtc, productRows) {
  const usedFamilyCodes = [...new Set(productRows.map((row) => row.product_family_code))].sort(
    familyCodeSort,
  );

  return usedFamilyCodes.map((familyCode) => {
    const familyProfile = PRODUCT_FAMILY_PROFILES[familyCode];

    return {
      product_family_code: familyCode,
      product_family_name: familyProfile.product_family_name,
      family_description: familyProfile.family_description,
      storage_profile: familyProfile.storage_profile,
      handling_profile: familyProfile.handling_profile,
      synthetic_margin_band_code: familyProfile.synthetic_margin_band_code,
      record_source_family: PUBLIC_RECORD_FAMILIES.dim_product_family,
      source_file_version: PUBLIC_RELEASE_VERSION,
      record_status: "derived-active",
      publication_safety_flag: PUBLICATION_SAFETY_FLAG,
      load_timestamp_utc: loadTimestampUtc,
    };
  });
}

function buildAccountDimension(records, loadTimestampUtc) {
  const sortedRecords = [...records].sort((left, right) =>
    sourceAccountKey(left).localeCompare(sourceAccountKey(right)),
  );
  const patternOrdinalByClass = new Map();

  return sortedRecords.map((record) => {
    const sourceKey = sourceAccountKey(record);
    const accountCode = stableMaskedCode("ACC", sourceKey);
    const rawNetwork = nonEmptyText(record.service_network_code);
    const accountPatternClass = normalizeAccountPatternClass(
      record.customer_group,
      record.fulfillment_context_code,
    );
    const patternOrdinal = (patternOrdinalByClass.get(accountPatternClass) ?? 0) + 1;
    patternOrdinalByClass.set(accountPatternClass, patternOrdinal);

    return {
      account_sk: stablePublicKey("ACC", sourceKey),
      account_code: accountCode,
      account_name: buildPublicAccountName({
        accountPatternClass,
        identityKey: sourceKey,
        ordinal: patternOrdinal,
      }),
      customer_group: customerGroupLabel(accountPatternClass),
      account_pattern_class: accountPatternClass,
      service_network_code: rawNetwork
        ? stableMaskedCode("SERVICE_NETWORK", rawNetwork, "_")
        : "UNKNOWN",
      fulfillment_context_code: normalizeFulfillmentContext(
        record.fulfillment_context_code,
      ),
      record_source_family: PUBLIC_RECORD_FAMILIES.dim_account,
      source_file_version: PUBLIC_RELEASE_VERSION,
      record_status: normalizeRecordStatus(record.record_status),
      publication_safety_flag: PUBLICATION_SAFETY_FLAG,
      load_timestamp_utc: loadTimestampUtc,
    };
  });
}

function buildInventoryLocationDimension(records, loadTimestampUtc) {
  const sortedRecords = [...records].sort((left, right) =>
    sourceLocationKey(left).localeCompare(sourceLocationKey(right)),
  );

  return sortedRecords.map((record) => {
    const sourceKey = sourceLocationKey(record);
    const locationCode = stableMaskedCode("LOC", sourceKey);
    const nodeTypeCode = classifyNodeType(record);
    const rawSiteCode = nonEmptyText(record.site_code);
    const rawLogisticsAreaCode = nonEmptyText(record.logistics_area_code);

    return {
      inventory_location_sk: stablePublicKey("LOC", sourceKey),
      site_code: rawSiteCode
        ? stableMaskedCode("SITE", rawSiteCode)
        : "SITE-UNKNOWN",
      location_code: locationCode,
      location_name: `${nodeTypeLabel(nodeTypeCode)} ${suffix(
        locationCode,
      )}`,
      node_type_code: nodeTypeCode,
      logistics_area_code: rawLogisticsAreaCode
        ? stableMaskedCode("LOG_AREA", rawLogisticsAreaCode, "_")
        : "UNKNOWN",
      location_role_description: nodeRoleDescription(nodeTypeCode),
      record_source_family: PUBLIC_RECORD_FAMILIES.dim_inventory_location,
      source_file_version: PUBLIC_RELEASE_VERSION,
      record_status: normalizeRecordStatus(record.record_status),
      publication_safety_flag: PUBLICATION_SAFETY_FLAG,
      load_timestamp_utc: loadTimestampUtc,
    };
  });
}

function buildDemandFact(records, loadTimestampUtc, dimensions) {
  const sortedRecords = expandDemandHistoryRecords(records, loadTimestampUtc).sort(
    (left, right) => sourceDemandLineKey(left).localeCompare(sourceDemandLineKey(right)),
  );
  const productKeys = new Set(dimensions.dim_product.map((row) => row.product_sk));
  const accountKeys = new Set(dimensions.dim_account.map((row) => row.account_sk));
  const productBandByKey = new Map(
    dimensions.dim_product.map((row) => [row.product_sk, row.unit_economic_band_code]),
  );
  const productMarginBandByKey = new Map(
    dimensions.dim_product.map((row) => [
      row.product_sk,
      PRODUCT_FAMILY_PROFILES[row.product_family_code].synthetic_margin_band_code,
    ]),
  );

  return sortedRecords.map((record) => {
    const productSk = resolveProductSk(record, productKeys);
    const accountSk = resolveAccountSk(record, accountKeys);
    const demandQty = toInteger(record.demand_qty);
    const deliveredQty = toInteger(record.delivered_qty);
    const openQty = Math.max(demandQty - deliveredQty, 0);
    const demandValueProxy = deriveDemandValueProxy({
      unitEconomicBandCode: productBandByKey.get(productSk) ?? "BAND_E0",
      demandQty,
      openQty,
    });
    const grossMarginProxy = deriveGrossMarginProxy({
      demandValueProxy,
      syntheticMarginBandCode: productMarginBandByKey.get(productSk) ?? "BAND_M0",
    });

    return {
      demand_line_sk: stablePublicKey("DMD", sourceDemandLineKey(record)),
      product_sk: productSk,
      account_sk: accountSk,
      event_date: normalizeDate(record.event_date),
      requested_delivery_date: normalizeDate(record.requested_delivery_date),
      demand_status_code: normalizeDemandStatusCode(record.demand_status_code, {
        demandQty,
        deliveredQty,
        openQty,
      }),
      demand_qty: demandQty,
      delivered_qty: deliveredQty,
      open_qty: openQty,
      order_group_code: normalizeOrderGroupCode(record.order_group_code),
      promise_date: normalizeOptionalDate(record.promise_date),
      priority_code: normalizePriorityCode(record.priority_code, {
        demandQty,
        openQty,
      }),
      demand_value_proxy: demandValueProxy,
      gross_margin_proxy: grossMarginProxy,
      record_source_family: PUBLIC_RECORD_FAMILIES.fact_demand_line,
      source_file_version: PUBLIC_RELEASE_VERSION,
      record_status: normalizeRecordStatus(record.record_status),
      publication_safety_flag: PUBLICATION_SAFETY_FLAG,
      load_timestamp_utc: loadTimestampUtc,
    };
  });
}

function buildInventorySnapshotFact(records, loadTimestampUtc, dimensions) {
  const sortedRecords = [...records].sort((left, right) =>
    sourceInventorySnapshotKey(left).localeCompare(sourceInventorySnapshotKey(right)),
  );
  const productRowsByKey = new Map(dimensions.dim_product.map((row) => [row.product_sk, row]));
  const locationRowsByKey = new Map(
    dimensions.dim_inventory_location.map((row) => [row.inventory_location_sk, row]),
  );

  return sortedRecords.map((record) => {
    const productSk = resolveProductSk(record, productRowsByKey.keys());
    const locationSk = resolveLocationSk(record, locationRowsByKey.keys());
    const productRow = productRowsByKey.get(productSk);
    const locationRow = locationRowsByKey.get(locationSk);
    const onHandQty = toInteger(record.on_hand_qty);
    const reservedQty = toInteger(record.reserved_qty);
    const inTransitQty = toInteger(record.in_transit_qty);
    const availableQty =
      nonEmptyText(record.available_qty) !== null
        ? toInteger(record.available_qty)
        : Math.max(onHandQty - reservedQty, 0);
    const inventoryStatusCode = normalizeInventoryStatusCode(record.inventory_status_code, {
      availableQty,
      inTransitQty,
      nodeTypeCode: locationRow?.node_type_code ?? "UNKNOWN",
    });
    const nodeAdjustment = nodeTypeMarginAdjustment(
      locationRow?.node_type_code ?? "UNKNOWN",
    );
    const inventoryValueProxy = deriveInventoryValueProxy({
      unitEconomicBandCode: productRow?.unit_economic_band_code ?? "BAND_E0",
      availableQty,
      inTransitQty,
      nodeTypeMarginAdjustment: nodeAdjustment,
    });

    return {
      inventory_snapshot_sk: stablePublicKey("INV", sourceInventorySnapshotKey(record)),
      product_sk: productSk,
      inventory_location_sk: locationSk,
      snapshot_date: normalizeDate(loadTimestampUtc),
      on_hand_qty: onHandQty,
      available_qty: availableQty,
      inventory_status_code: inventoryStatusCode,
      reserved_qty: reservedQty,
      in_transit_qty: inTransitQty,
      inventory_value_proxy: inventoryValueProxy,
      node_value_concentration_band: deriveNodeValueConcentrationBand({
        inventoryValueProxy,
        availableQty,
      }),
      readiness_flag: deriveReadinessFlag(inventoryStatusCode, availableQty),
      record_source_family: PUBLIC_RECORD_FAMILIES.fact_inventory_snapshot,
      source_file_version: PUBLIC_RELEASE_VERSION,
      record_status: normalizeRecordStatus(record.record_status),
      publication_safety_flag: PUBLICATION_SAFETY_FLAG,
      load_timestamp_utc: loadTimestampUtc,
    };
  });
}

function buildInventoryInboundFact(records, loadTimestampUtc, dimensions) {
  const sortedRecords = [...records].sort((left, right) =>
    sourceInventoryInboundKey(left).localeCompare(sourceInventoryInboundKey(right)),
  );
  const productRowsByKey = new Map(dimensions.dim_product.map((row) => [row.product_sk, row]));
  const locationRowsByKey = new Map(
    dimensions.dim_inventory_location.map((row) => [row.inventory_location_sk, row]),
  );

  return sortedRecords.map((record) => {
    const productSk = resolveProductSk(record, productRowsByKey.keys());
    const locationSk = resolveLocationSk(record, locationRowsByKey.keys());
    const productRow = productRowsByKey.get(productSk);
    const locationRow = locationRowsByKey.get(locationSk);
    const receiptQty = toInteger(record.receipt_qty);
    const receiptValueProxy = deriveInventoryValueProxy({
      unitEconomicBandCode: productRow?.unit_economic_band_code ?? "BAND_E0",
      availableQty: receiptQty,
      inTransitQty: 0,
      nodeTypeMarginAdjustment: nodeTypeMarginAdjustment(
        locationRow?.node_type_code ?? "UNKNOWN",
      ),
    });

    return {
      inventory_inbound_sk: stablePublicKey("INB", sourceInventoryInboundKey(record)),
      product_sk: productSk,
      inventory_location_sk: locationSk,
      receipt_date: normalizeDate(record.receipt_date),
      receipt_qty: receiptQty,
      receipt_flow_type: normalizeReceiptFlowType(record.receipt_flow_type),
      receipt_value_proxy: receiptValueProxy,
      record_source_family: PUBLIC_RECORD_FAMILIES.fact_inventory_inbound,
      source_file_version: PUBLIC_RELEASE_VERSION,
      record_status: normalizeRecordStatus(record.record_status),
      publication_safety_flag: PUBLICATION_SAFETY_FLAG,
      load_timestamp_utc: loadTimestampUtc,
    };
  });
}

export function expandDemandHistoryRecords(records, loadTimestampUtc) {
  const refreshDate = parseIsoDate(normalizeDate(loadTimestampUtc));
  const refreshMonthStart = startOfUtcMonth(refreshDate);

  return records.flatMap((record) => {
    const archetypeKey = sourceDemandLineKey(record);
    const baseDate = maxUtcDate(
      parseIsoDate(normalizeDate(record.event_date)),
      parseIsoDate(PUBLIC_SALES_START_DATE),
    );
    const requestLagDays = Math.max(
      daysBetweenUtc(
        parseIsoDate(normalizeDate(record.event_date)),
        parseIsoDate(normalizeDate(record.requested_delivery_date)),
      ),
      2,
    );
    const promiseLagDays = nonEmptyText(record.promise_date)
      ? Math.max(
          daysBetweenUtc(
            parseIsoDate(normalizeDate(record.event_date)),
            parseIsoDate(normalizeDate(record.promise_date)),
          ),
          1,
        )
      : Math.max(requestLagDays - 1, 1);
    const monthlyOccurrences = [];
    let cursor = startOfUtcMonth(baseDate);

    while (cursor < refreshMonthStart) {
      const occurrenceDate = withUtcDay(cursor, baseDate.getUTCDate());
      if (occurrenceDate >= baseDate) {
        monthlyOccurrences.push({
          cadence: "MONTHLY",
          occurrenceDate,
          periodKey: toIsoMonth(occurrenceDate),
        });
      }
      cursor = addUtcMonths(cursor, 1);
    }

    const currentMonthOccurrences = [];
    for (let dayOffset = 0; dayOffset <= refreshDate.getUTCDate() - 1; dayOffset += 1) {
      const occurrenceDate = addUtcDays(refreshMonthStart, dayOffset);
      if (occurrenceDate >= baseDate) {
        currentMonthOccurrences.push({
          cadence: "CURRENT_MONTH",
          occurrenceDate,
          periodKey: toIsoDate(occurrenceDate),
        });
      }
    }

    const occurrences = [...monthlyOccurrences, ...currentMonthOccurrences];

    return occurrences.map((occurrence, occurrenceIndex) =>
      materializeDemandOccurrence({
        record,
        archetypeKey,
        baseDate,
        requestLagDays,
        promiseLagDays,
        refreshDate,
        occurrence,
        occurrenceIndex,
      }),
    );
  });
}

function materializeDemandOccurrence({
  record,
  archetypeKey,
  baseDate,
  requestLagDays,
  promiseLagDays,
  refreshDate,
  occurrence,
  occurrenceIndex,
}) {
  const occurrenceDateText = toIsoDate(occurrence.occurrenceDate);
  const monthIndex = monthsBetweenUtc(baseDate, occurrence.occurrenceDate);
  const baseDemandQty = Math.max(toInteger(record.demand_qty), 1);
  const quantityShift = positiveHashNumber(`${archetypeKey}|${occurrence.periodKey}|qty`, 5) - 2;
  const trendShift = Math.floor(monthIndex / 4);
  const cadenceBoost = occurrence.cadence === "CURRENT_MONTH" ? 1 : 0;
  const demandQty = Math.max(baseDemandQty + quantityShift + trendShift + cadenceBoost, 1);
  const isCurrentMonth = startOfUtcMonth(occurrence.occurrenceDate).getTime()
    === startOfUtcMonth(refreshDate).getTime();
  const remainingOpenQty = isCurrentMonth
    ? Math.min(
        demandQty,
        1 + positiveHashNumber(`${archetypeKey}|${occurrence.periodKey}|open`, 3),
      )
    : occurrenceIndex % 5 === 0
      ? 0
      : Math.min(demandQty, positiveHashNumber(`${archetypeKey}|${occurrence.periodKey}|tail`, 2));
  const deliveredQty = Math.max(demandQty - remainingOpenQty, 0);
  const requestedDeliveryDate = addUtcDays(occurrence.occurrenceDate, requestLagDays);
  const promiseDate = addUtcDays(occurrence.occurrenceDate, promiseLagDays);

  return {
    ...record,
    demand_line_id: `${archetypeKey}::${occurrence.periodKey}`,
    order_group_code: `${nonEmptyText(record.order_group_code) ?? archetypeKey}::${occurrence.periodKey}`,
    event_date: occurrenceDateText,
    requested_delivery_date: toIsoDate(requestedDeliveryDate),
    promise_date: deliveredQty >= demandQty ? toIsoDate(promiseDate) : undefined,
    demand_status_code: deliveredQty >= demandQty ? "fulfilled" : "open",
    priority_code:
      occurrence.cadence === "CURRENT_MONTH"
        ? "high"
        : demandQty >= 18
          ? "high"
          : demandQty >= 10
            ? "medium"
            : "low",
    demand_qty: demandQty,
    delivered_qty: deliveredQty,
    record_status: "active",
  };
}

function stableMaskedCode(prefix, sourceKey, separator = "-", length = 6) {
  const digest = createHash("sha256")
    .update(`${PRIVATE_NAMESPACE}|MASK|${prefix}|${sourceKey}`)
    .digest("hex")
    .slice(0, length)
    .toUpperCase();
  return `${prefix}${separator}${digest}`;
}

export function sourceProductKey(record) {
  return (
    nonEmptyText(record.product_id) ??
    nonEmptyText(record.product_code) ??
    nonEmptyText(record.product_name) ??
    "PRODUCT-UNKNOWN"
  );
}

export function sourceAccountKey(record) {
  return (
    nonEmptyText(record.account_id) ??
    nonEmptyText(record.account_name) ??
    "ACCOUNT-UNKNOWN"
  );
}

export function sourceLocationKey(record) {
  const siteCode = nonEmptyText(record.site_code) ?? "SITE-UNKNOWN";
  const locationCode =
    nonEmptyText(record.location_code) ??
    nonEmptyText(record.location_name) ??
    "LOCATION-UNKNOWN";
  return `${siteCode}::${locationCode}`;
}

function sourceDemandLineKey(record) {
  return (
    nonEmptyText(record.demand_line_id) ??
    `${sourceProductKey(record)}::${sourceAccountKey(record)}::${normalizeDate(
      record.event_date,
    )}::${normalizeDate(record.requested_delivery_date)}`
  );
}

function sourceInventorySnapshotKey(record) {
  return `${sourceProductKey(record)}::${sourceLocationKey(record)}::${normalizeDate(
    record.snapshot_date,
  )}`;
}

function sourceInventoryInboundKey(record) {
  return (
    nonEmptyText(record.inventory_inbound_id) ??
    `${sourceProductKey(record)}::${sourceLocationKey(record)}::${normalizeDate(
      record.receipt_date,
    )}::${upperText(record.receipt_flow_type) || "UNKNOWN"}`
  );
}

function normalizeDemandPatternClass(value) {
  const text = upperText(value);

  if (text.includes("SPECIAL")) {
    return "EXCEPTION_DEMAND";
  }
  if (text.includes("PROJECT")) {
    return "PROJECT_DEMAND";
  }
  if (text.includes("CORE") || text.includes("STANDARD")) {
    return "RECURRING_DEMAND";
  }

  return "UNKNOWN";
}

function normalizePlanningConstraintClass(value) {
  const text = upperText(value);

  if (text.includes("CONSTRAINED")) {
    return "CONTROLLED_FLOW";
  }
  if (text.includes("PROJECT")) {
    return "PROJECT_SCOPED";
  }
  if (text.includes("STANDARD")) {
    return "STANDARD_FLOW";
  }

  return "UNKNOWN";
}

function resolveProductSk(record, availableKeys) {
  const resolved = stablePublicKey("PRD", sourceProductKey(record));
  return ensureKeyOrFallback(resolved, availableKeys, stablePublicKey("PRD", "PRODUCT-UNKNOWN"));
}

function resolveAccountSk(record, availableKeys) {
  const resolved = stablePublicKey("ACC", sourceAccountKey(record));
  return ensureKeyOrFallback(resolved, availableKeys, stablePublicKey("ACC", "ACCOUNT-UNKNOWN"));
}

function resolveLocationSk(record, availableKeys) {
  const resolved = stablePublicKey("LOC", sourceLocationKey(record));
  return ensureKeyOrFallback(
    resolved,
    availableKeys,
    stablePublicKey("LOC", "SITE-UNKNOWN::LOCATION-UNKNOWN"),
  );
}

function ensureKeyOrFallback(resolvedKey, availableKeys, fallbackKey) {
  const keySet = availableKeys instanceof Set ? availableKeys : new Set(availableKeys);
  if (keySet.has(resolvedKey)) {
    return resolvedKey;
  }
  return fallbackKey;
}

function normalizeDemandStatusCode(value, quantities) {
  const text = upperText(value);
  if (text.includes("CANCEL")) {
    return "CANCELLED";
  }
  if (quantities.openQty <= 0 && quantities.demandQty > 0) {
    return "FULFILLED";
  }
  if (quantities.deliveredQty > 0 && quantities.openQty > 0) {
    return "PARTIALLY_FULFILLED";
  }
  if (text.includes("OPEN") || quantities.openQty > 0) {
    return "OPEN";
  }
  return "UNKNOWN";
}

function normalizeInventoryStatusCode(value, state) {
  const text = upperText(value);
  if (text.includes("TRANSIT") || state.nodeTypeCode === "TRANSIT_NODE") {
    return "IN_TRANSIT";
  }
  if (text.includes("RESTRICT") || state.nodeTypeCode === "RESTRICTED_AREA") {
    return "RESTRICTED";
  }
  if (state.availableQty > 0) {
    return "READY";
  }
  if (state.inTransitQty > 0) {
    return "IN_TRANSIT";
  }
  if (text.includes("RISK") || state.availableQty === 0) {
    return "AT_RISK";
  }
  return "UNKNOWN";
}

function normalizeReceiptFlowType(value) {
  const text = upperText(value);
  if (text.includes("TRANSFER")) {
    return "TRANSFER_IN";
  }
  if (text.includes("KIT") || text.includes("ASSEMB")) {
    return "KIT_COMPLETION";
  }
  if (text.includes("RETURN")) {
    return "RETURN_TO_STOCK";
  }
  if (text.includes("SUPPLIER") || text.includes("VENDOR") || text.includes("PO")) {
    return "SUPPLIER_RECEIPT";
  }
  return "UNKNOWN";
}

function normalizePriorityCode(value, quantities) {
  const text = upperText(value);
  if (text.includes("HIGH") || quantities.openQty >= 20) {
    return "HIGH";
  }
  if (text.includes("LOW")) {
    return "LOW";
  }
  if (text.includes("MED") || quantities.openQty > 0) {
    return "MEDIUM";
  }
  return "UNKNOWN";
}

function normalizeOrderGroupCode(value) {
  const text = upperText(value);
  if (!text) {
    return undefined;
  }
  return stableMaskedCode("ORDER_GROUP", text, "_");
}

function normalizeOptionalDate(value) {
  return nonEmptyText(value) ? normalizeDate(value) : undefined;
}

function normalizeDate(value) {
  const text = nonEmptyText(value);
  if (!text) {
    return "1970-01-01";
  }
  const parsed = new Date(text);
  if (Number.isNaN(parsed.valueOf())) {
    return "1970-01-01";
  }
  return parsed.toISOString().slice(0, 10);
}

function parseIsoDate(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

function toIsoDate(value) {
  return value.toISOString().slice(0, 10);
}

function toIsoMonth(value) {
  return toIsoDate(value).slice(0, 7);
}

function startOfUtcMonth(value) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), 1));
}

function addUtcDays(value, days) {
  return new Date(value.getTime() + days * 24 * 60 * 60 * 1000);
}

function addUtcMonths(value, months) {
  const targetMonthStart = new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + months, 1),
  );
  return targetMonthStart;
}

function withUtcDay(monthStart, preferredDay) {
  const lastDay = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return new Date(
    Date.UTC(
      monthStart.getUTCFullYear(),
      monthStart.getUTCMonth(),
      Math.min(Math.max(preferredDay, 1), lastDay),
    ),
  );
}

function daysBetweenUtc(left, right) {
  return Math.round((right.getTime() - left.getTime()) / (24 * 60 * 60 * 1000));
}

function monthsBetweenUtc(left, right) {
  return (
    (right.getUTCFullYear() - left.getUTCFullYear()) * 12
    + (right.getUTCMonth() - left.getUTCMonth())
  );
}

function maxUtcDate(left, right) {
  return left.getTime() >= right.getTime() ? left : right;
}

function deriveDemandValueProxy({ unitEconomicBandCode, demandQty, openQty }) {
  const unitCost = syntheticUnitCost(unitEconomicBandCode);
  const unitPrice = syntheticStandardPrice(unitCost);
  return Math.round(unitPrice * Math.max(openQty, demandQty, 0));
}

function deriveGrossMarginProxy({ demandValueProxy, syntheticMarginBandCode }) {
  const ratio = {
    BAND_M0: 0.08,
    BAND_M1: 0.12,
    BAND_M2: 0.18,
    BAND_M3: 0.24,
    BAND_M4: 0.3,
  }[syntheticMarginBandCode] ?? 0.1;
  return Math.round(demandValueProxy * ratio);
}

function deriveInventoryValueProxy({
  unitEconomicBandCode,
  availableQty,
  inTransitQty,
  nodeTypeMarginAdjustment,
}) {
  const unitCost = syntheticUnitCost(unitEconomicBandCode);
  return Math.round(unitCost * (availableQty + inTransitQty) * nodeTypeMarginAdjustment);
}

function deriveNodeValueConcentrationBand({ inventoryValueProxy, availableQty }) {
  if (inventoryValueProxy <= 0 && availableQty <= 0) {
    return "NODE_UNKNOWN";
  }
  if (inventoryValueProxy >= 900) {
    return "NODE_HIGH";
  }
  if (inventoryValueProxy >= 300) {
    return "NODE_MEDIUM";
  }
  return "NODE_LOW";
}

function deriveReadinessFlag(inventoryStatusCode, availableQty) {
  if (inventoryStatusCode === "READY" && availableQty > 0) {
    return "READY";
  }
  if (inventoryStatusCode === "AT_RISK" || availableQty === 0) {
    return "AT_RISK";
  }
  if (inventoryStatusCode === "RESTRICTED" || inventoryStatusCode === "IN_TRANSIT") {
    return "NOT_READY";
  }
  return "UNKNOWN";
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

function nodeTypeMarginAdjustment(nodeTypeCode) {
  return {
    INTERNAL_WAREHOUSE: 1,
    FLOOR_AREA: 0.95,
    OVERFLOW_AREA: 0.9,
    THIRD_PARTY_NODE: 1.08,
    TRANSIT_NODE: 0.85,
    RESTRICTED_AREA: 1.12,
    UNKNOWN: 1,
  }[nodeTypeCode] ?? 1;
}

function deriveInventoryPolicyClass({
  familyCode,
  demandPatternClass,
  planningConstraintClass,
}) {
  if (familyCode === "CONTROLLED_ITEM" || planningConstraintClass === "CONTROLLED_FLOW") {
    return "CONTROLLED_STOCK";
  }
  if (familyCode === "KIT_ASSEMBLY" || demandPatternClass === "PROJECT_DEMAND") {
    return "STAGE_AND_COORDINATE";
  }
  if (familyCode === "SMALL_PART") {
    return "HIGH_DENSITY_BIN";
  }
  if (familyCode === "BULKY_ITEM") {
    return "PALLET_BUFFER";
  }
  if (familyCode === "STANDARD_COMPONENT") {
    return "GENERAL_STOCK";
  }
  return "UNKNOWN";
}

function deriveFulfillmentRiskClass({
  familyCode,
  demandPatternClass,
  planningConstraintClass,
}) {
  if (familyCode === "CONTROLLED_ITEM" || planningConstraintClass === "CONTROLLED_FLOW") {
    return "CONTROL_RISK";
  }
  if (familyCode === "KIT_ASSEMBLY" || demandPatternClass === "PROJECT_DEMAND") {
    return "COORDINATION_RISK";
  }
  if (familyCode === "SMALL_PART") {
    return "PICK_DENSITY_RISK";
  }
  if (familyCode === "BULKY_ITEM") {
    return "SPACE_RISK";
  }
  if (familyCode === "STANDARD_COMPONENT") {
    return "STANDARD_RISK";
  }
  return "UNKNOWN";
}

function deriveLeadTimeBand({
  familyCode,
  demandPatternClass,
  planningConstraintClass,
}) {
  if (familyCode === "CONTROLLED_ITEM" || planningConstraintClass === "CONTROLLED_FLOW") {
    return "LONG";
  }
  if (familyCode === "KIT_ASSEMBLY" || demandPatternClass === "PROJECT_DEMAND") {
    return "LONG";
  }
  if (familyCode === "BULKY_ITEM") {
    return "MEDIUM";
  }
  if (familyCode === "STANDARD_COMPONENT" || familyCode === "SMALL_PART") {
    return "SHORT";
  }
  return "UNKNOWN";
}

function deriveCriticalityBand({
  familyCode,
  demandPatternClass,
  planningConstraintClass,
}) {
  if (familyCode === "CONTROLLED_ITEM" || planningConstraintClass === "CONTROLLED_FLOW") {
    return "HIGH";
  }
  if (familyCode === "KIT_ASSEMBLY" || familyCode === "BULKY_ITEM" || demandPatternClass === "PROJECT_DEMAND") {
    return "ELEVATED";
  }
  if (familyCode === "STANDARD_COMPONENT" || familyCode === "SMALL_PART") {
    return "BASELINE";
  }
  return "UNKNOWN";
}

function deriveServiceProfile({
  familyCode,
  demandPatternClass,
  planningConstraintClass,
}) {
  if (familyCode === "CONTROLLED_ITEM" || planningConstraintClass === "CONTROLLED_FLOW") {
    return "CONTROLLED_SERVICE";
  }
  if (familyCode === "KIT_ASSEMBLY" || demandPatternClass === "PROJECT_DEMAND") {
    return "PROJECT_SERVICE";
  }
  if (familyCode === "SMALL_PART") {
    return "DENSE_PICK_SERVICE";
  }
  if (familyCode === "BULKY_ITEM") {
    return "BULK_SERVICE";
  }
  if (familyCode === "STANDARD_COMPONENT") {
    return "STANDARD_SERVICE";
  }
  return "UNKNOWN";
}

function deriveValueDensityBand({ familyCode, weightValue, boxQty }) {
  if (familyCode === "UNCLASSIFIED" || (weightValue === 0 && boxQty === 0)) {
    return "UNKNOWN";
  }
  if (familyCode === "BULKY_ITEM") {
    return "LOW_DENSITY";
  }

  const densityScore = boxQty / Math.max(weightValue, 1);
  if (densityScore >= 50) {
    return "HIGH_DENSITY";
  }
  if (densityScore >= 5) {
    return "MEDIUM_DENSITY";
  }
  return "LOW_DENSITY";
}

function deriveUnitEconomicBandCode({
  familyCode,
  criticalityBand,
  valueDensityBand,
}) {
  if (familyCode === "UNCLASSIFIED") {
    return "BAND_E0";
  }
  if (criticalityBand === "HIGH") {
    return "BAND_E4";
  }
  if (familyCode === "KIT_ASSEMBLY" || criticalityBand === "ELEVATED") {
    return "BAND_E3";
  }
  if (familyCode === "STANDARD_COMPONENT" || valueDensityBand === "MEDIUM_DENSITY") {
    return "BAND_E2";
  }
  return "BAND_E1";
}

function deriveInterchangeabilityGroupCode(familyCode) {
  return {
    STANDARD_COMPONENT: "INTERCHANGE_GROUP_A",
    KIT_ASSEMBLY: "INTERCHANGE_GROUP_B",
    SMALL_PART: "INTERCHANGE_GROUP_C",
    BULKY_ITEM: "INTERCHANGE_GROUP_D",
    CONTROLLED_ITEM: "INTERCHANGE_GROUP_E",
    UNCLASSIFIED: "INTERCHANGE_GROUP_Z",
  }[familyCode];
}

function normalizeAccountPatternClass(customerGroupValue, fulfillmentContextValue) {
  const customerGroup = upperText(customerGroupValue);
  const fulfillmentContext = upperText(fulfillmentContextValue);

  if (customerGroup.includes("PROJECT")) {
    return "PROJECT_BASED";
  }
  if (
    fulfillmentContext.includes("PARTNER") ||
    fulfillmentContext.includes("THIRD")
  ) {
    return "PARTNER_CHANNEL";
  }
  if (
    customerGroup.includes("FIELD") ||
    customerGroup.includes("MAINTENANCE")
  ) {
    return "RECURRING_SERVICE";
  }

  return "UNKNOWN";
}

export function customerGroupLabel(accountPatternClass) {
  return (
    CUSTOMER_GROUP_PROFILES[accountPatternClass]?.customer_group
    ?? CUSTOMER_GROUP_PROFILES.UNKNOWN.customer_group
  );
}

export function buildPublicAccountName({
  accountPatternClass,
  identityKey,
  ordinal,
}) {
  const regionToken =
    PUBLIC_ACCOUNT_REGION_TOKENS[
      positiveHashNumber(`account-region|${accountPatternClass}|${identityKey}`, PUBLIC_ACCOUNT_REGION_TOKENS.length)
    ];

  return `${regionToken} ${customerGroupLabel(accountPatternClass)} ${paddedOrdinal(ordinal)}`;
}

export function buildPublicProductName({
  productFamilyCode,
  identityKey,
  ordinal,
}) {
  const nameStems =
    PUBLIC_PRODUCT_NAME_STEMS[productFamilyCode]
    ?? PUBLIC_PRODUCT_NAME_STEMS.UNCLASSIFIED;
  const stem =
    nameStems[
      positiveHashNumber(`product-stem|${productFamilyCode}|${identityKey}`, nameStems.length)
    ];

  return `${stem} ${paddedOrdinal(ordinal)}`;
}

function normalizeFulfillmentContext(value) {
  const text = upperText(value);

  if (text.includes("THIRD")) {
    return "THIRD_PARTY_ROUTED";
  }
  if (text.includes("PARTNER")) {
    return "PARTNER_ROUTED";
  }
  if (text.includes("DIRECT")) {
    return "DIRECT_SERVICE";
  }

  return "UNKNOWN";
}

function normalizeRecordStatus(value) {
  return nonEmptyText(value)?.toLowerCase() ?? "active";
}

function stablePublicKey(prefix, value) {
  const digest = createHash("sha256")
    .update(`${PRIVATE_NAMESPACE}|${prefix}|${value}`)
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();
  return `${prefix}_SK_${digest}`;
}

function positiveHashNumber(seed, modulo) {
  const digest = createHash("sha256").update(seed).digest("hex").slice(0, 8);
  return Number.parseInt(digest, 16) % modulo;
}

function familyCodeSort(left, right) {
  const ordering = Object.keys(PRODUCT_FAMILY_PROFILES);
  return ordering.indexOf(left) - ordering.indexOf(right);
}

function nodeTypeLabel(nodeTypeCode) {
  return {
    INTERNAL_WAREHOUSE: "Internal Warehouse Area",
    THIRD_PARTY_NODE: "External Logistics Node",
    TRANSIT_NODE: "Transit Node",
    FLOOR_AREA: "Floor Storage Area",
    RESTRICTED_AREA: "Restricted Inventory Area",
    OVERFLOW_AREA: "Overflow Inventory Area",
    UNKNOWN: "Unknown Inventory Node",
  }[nodeTypeCode];
}

function nodeRoleDescription(nodeTypeCode) {
  return {
    INTERNAL_WAREHOUSE:
      "Primary internal storage and picking area within the governed readiness model.",
    THIRD_PARTY_NODE:
      "External logistics partner node used to preserve service behavior without exposing partner identity.",
    TRANSIT_NODE:
      "Transit-oriented handoff area that preserves movement timing without exposing raw dock labels.",
    FLOOR_AREA:
      "Floor storage area used for overflow-ready or non-racked operational staging.",
    RESTRICTED_AREA:
      "Restricted inventory area that preserves controlled-access behavior in a publication-safe form.",
    OVERFLOW_AREA:
      "Overflow inventory area used when stock exceeds standard storage placement.",
    UNKNOWN:
      "Fallback inventory node used when the bounded source record does not safely resolve to a known node type.",
  }[nodeTypeCode];
}

function nonEmptyText(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function upperText(value) {
  return nonEmptyText(value)?.toUpperCase() ?? "";
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function toInteger(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : 0;
}

function suffix(maskedCode) {
  return maskedCode.split("-").at(-1);
}

function paddedOrdinal(value) {
  return String(Math.max(1, value)).padStart(2, "0");
}
