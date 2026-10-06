import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ALLOWED_ACCOUNT_PATTERN_CLASSES,
  ALLOWED_CRITICALITY_BANDS,
  ALLOWED_DEMAND_PATTERN_CLASSES,
  ALLOWED_DEMAND_STATUS_CODES,
  ALLOWED_FULFILLMENT_RISK_CLASSES,
  ALLOWED_INVENTORY_POLICY_CLASSES,
  ALLOWED_RECEIPT_FLOW_TYPES,
  ALLOWED_INVENTORY_STATUS_CODES,
  ALLOWED_LEAD_TIME_BANDS,
  ALLOWED_NODE_TYPES,
  ALLOWED_NODE_VALUE_CONCENTRATION_BANDS,
  ALLOWED_PLANNING_CONSTRAINT_CLASSES,
  ALLOWED_PRIORITY_CODES,
  ALLOWED_READINESS_FLAGS,
  ALLOWED_SERVICE_PROFILES,
  ALLOWED_UNIT_ECONOMIC_BAND_CODES,
  ALLOWED_VALUE_DENSITY_BANDS,
  DEFAULT_OUTPUT_DIR,
  DEFAULT_SOURCE_DIR,
  OUTPUT_FILENAMES,
  PUBLIC_SALES_START_DATE,
  PRODUCT_FAMILY_PROFILES,
  REQUIRED_FIELDS,
  classifyNodeType,
  classifyProductFamily,
  expandDemandHistoryRecords,
  loadSourceFamilies,
  parseBuildArgs,
  readJsonFile,
} from "../automation/dimension-build-lib.mjs";

export async function validatePublicationDimensions(options = {}) {
  const outputDir = options.outputDir ?? DEFAULT_OUTPUT_DIR;
  const sourceDir = options.sourceDir ?? DEFAULT_SOURCE_DIR;
  const sourceFamilies = await loadSourceFamilies(sourceDir);
  const dimensions = await loadDimensionOutputs(outputDir);
  const diagnostics = [];

  validateArrayPresence(dimensions, diagnostics);
  validateRequiredFields(dimensions, diagnostics);
  validateUniqueness(dimensions, diagnostics);
  validateControlledVocabulary(dimensions, diagnostics);
  validateCrossTableConsistency(dimensions, sourceFamilies, diagnostics);
  validateMasking(dimensions, sourceFamilies, diagnostics);

  const errors = diagnostics
    .filter((diagnostic) => diagnostic.severity === "error")
    .map(formatDiagnosticMessage);

  return {
    outputDir,
    sourceDir,
    diagnostics,
    errors,
    counts: Object.fromEntries(
      Object.entries(dimensions).map(([key, rows]) => [key, rows.length]),
    ),
  };
}

export async function main(argv = process.argv.slice(2)) {
  const parsedArgs = parseBuildArgs(argv);
  const report = await validatePublicationDimensions(parsedArgs);

  if (report.errors.length > 0) {
    for (const error of report.errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return report;
  }

  console.log(`Validated governed publication package in ${report.outputDir}`);
  for (const [key, count] of Object.entries(report.counts)) {
    console.log(`- ${key}: ${count} rows`);
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

async function loadDimensionOutputs(outputDir) {
  const entries = await Promise.all(
    Object.entries(OUTPUT_FILENAMES).map(async ([key, filename]) => [
      key,
      await readJsonFile(path.join(outputDir, filename)),
    ]),
  );

  return Object.fromEntries(entries);
}

function validateArrayPresence(dimensions, errors) {
  for (const [key, rows] of Object.entries(dimensions)) {
    if (!Array.isArray(rows) || rows.length === 0) {
      pushDiagnostic(errors, {
        ruleId: "artifact.non_empty_array_required",
        artifact: key,
        message: "must be a non-empty array.",
      });
    }
  }
}

function validateRequiredFields(dimensions, errors) {
  for (const [dimensionName, rows] of Object.entries(dimensions)) {
    const requiredFields = REQUIRED_FIELDS[dimensionName];
    rows.forEach((row, index) => {
      for (const fieldName of requiredFields) {
        if (
          row[fieldName] === undefined ||
          row[fieldName] === null ||
          (typeof row[fieldName] === "string" && row[fieldName].trim() === "")
        ) {
          pushDiagnostic(errors, {
            ruleId: "required_field.missing",
            artifact: `${dimensionName}[${index}]`,
            message: `is missing required field ${fieldName}.`,
          });
        }
      }
    });
  }
}

function validateUniqueness(dimensions, errors) {
  assertUnique(dimensions.dim_product, "product_sk", "dim_product", errors);
  assertUnique(dimensions.dim_product, "product_code", "dim_product", errors);
  assertUnique(
    dimensions.dim_product_family,
    "product_family_code",
    "dim_product_family",
    errors,
  );
  assertUnique(dimensions.dim_account, "account_sk", "dim_account", errors);
  assertUnique(dimensions.dim_account, "account_code", "dim_account", errors);
  assertUnique(
    dimensions.dim_inventory_location,
    "inventory_location_sk",
    "dim_inventory_location",
    errors,
  );
  assertUnique(
    dimensions.dim_inventory_location,
    "location_code",
    "dim_inventory_location",
    errors,
  );
  assertUnique(dimensions.fact_demand_line, "demand_line_sk", "fact_demand_line", errors);
  assertUnique(
    dimensions.fact_inventory_inbound,
    "inventory_inbound_sk",
    "fact_inventory_inbound",
    errors,
  );
  assertUnique(
    dimensions.fact_inventory_snapshot,
    "inventory_snapshot_sk",
    "fact_inventory_snapshot",
    errors,
  );
}

function validateControlledVocabulary(dimensions, errors) {
  dimensions.dim_inventory_location.forEach((row, index) => {
    if (!ALLOWED_NODE_TYPES.includes(row.node_type_code)) {
      pushDiagnostic(errors, {
        ruleId: "vocabulary.unsupported_value",
        artifact: `dim_inventory_location[${index}]`,
        message: `has unsupported node_type_code ${row.node_type_code}.`,
      });
    }
  });

  dimensions.dim_product.forEach((row, index) => {
    if (!PRODUCT_FAMILY_PROFILES[row.product_family_code]) {
      pushDiagnostic(errors, {
        ruleId: "vocabulary.unsupported_value",
        artifact: `dim_product[${index}]`,
        message: `has unsupported product_family_code ${row.product_family_code}.`,
      });
    }
    assertAllowedValue(
      row.demand_pattern_class,
      ALLOWED_DEMAND_PATTERN_CLASSES,
      `dim_product[${index}].demand_pattern_class`,
      errors,
    );
    assertAllowedValue(
      row.planning_constraint_class,
      ALLOWED_PLANNING_CONSTRAINT_CLASSES,
      `dim_product[${index}].planning_constraint_class`,
      errors,
    );
    assertAllowedValue(
      row.inventory_policy_class,
      ALLOWED_INVENTORY_POLICY_CLASSES,
      `dim_product[${index}].inventory_policy_class`,
      errors,
    );
    assertAllowedValue(
      row.fulfillment_risk_class,
      ALLOWED_FULFILLMENT_RISK_CLASSES,
      `dim_product[${index}].fulfillment_risk_class`,
      errors,
    );
    assertAllowedValue(
      row.lead_time_band,
      ALLOWED_LEAD_TIME_BANDS,
      `dim_product[${index}].lead_time_band`,
      errors,
    );
    assertAllowedValue(
      row.criticality_band,
      ALLOWED_CRITICALITY_BANDS,
      `dim_product[${index}].criticality_band`,
      errors,
    );
    assertAllowedValue(
      row.service_profile,
      ALLOWED_SERVICE_PROFILES,
      `dim_product[${index}].service_profile`,
      errors,
    );
    assertAllowedValue(
      row.value_density_band,
      ALLOWED_VALUE_DENSITY_BANDS,
      `dim_product[${index}].value_density_band`,
      errors,
    );
    assertAllowedValue(
      row.unit_economic_band_code,
      ALLOWED_UNIT_ECONOMIC_BAND_CODES,
      `dim_product[${index}].unit_economic_band_code`,
      errors,
    );
  });

  dimensions.dim_account.forEach((row, index) => {
    assertAllowedValue(
      row.account_pattern_class,
      ALLOWED_ACCOUNT_PATTERN_CLASSES,
      `dim_account[${index}].account_pattern_class`,
      errors,
    );
  });

  dimensions.fact_demand_line.forEach((row, index) => {
    assertAllowedValue(
      row.demand_status_code,
      ALLOWED_DEMAND_STATUS_CODES,
      `fact_demand_line[${index}].demand_status_code`,
      errors,
    );
    if (row.priority_code !== undefined) {
      assertAllowedValue(
        row.priority_code,
        ALLOWED_PRIORITY_CODES,
        `fact_demand_line[${index}].priority_code`,
        errors,
      );
    }
  });

  dimensions.fact_inventory_snapshot.forEach((row, index) => {
    assertAllowedValue(
      row.inventory_status_code,
      ALLOWED_INVENTORY_STATUS_CODES,
      `fact_inventory_snapshot[${index}].inventory_status_code`,
      errors,
    );
    if (row.readiness_flag !== undefined) {
      assertAllowedValue(
        row.readiness_flag,
        ALLOWED_READINESS_FLAGS,
        `fact_inventory_snapshot[${index}].readiness_flag`,
        errors,
      );
    }
    if (row.node_value_concentration_band !== undefined) {
      assertAllowedValue(
        row.node_value_concentration_band,
        ALLOWED_NODE_VALUE_CONCENTRATION_BANDS,
        `fact_inventory_snapshot[${index}].node_value_concentration_band`,
        errors,
      );
    }
  });

  dimensions.fact_inventory_inbound.forEach((row, index) => {
    assertAllowedValue(
      row.receipt_flow_type,
      ALLOWED_RECEIPT_FLOW_TYPES,
      `fact_inventory_inbound[${index}].receipt_flow_type`,
      errors,
    );
  });
}

function validateCrossTableConsistency(dimensions, sourceFamilies, errors) {
  const publicationLoadTimestamp =
    dimensions.fact_demand_line[0]?.load_timestamp_utc
    ?? dimensions.fact_inventory_snapshot[0]?.load_timestamp_utc
    ?? dimensions.dim_product[0]?.load_timestamp_utc;
  const familyCodes = new Set(
    dimensions.dim_product_family.map((row) => row.product_family_code),
  );

  dimensions.dim_product.forEach((row, index) => {
    if (!familyCodes.has(row.product_family_code)) {
      pushDiagnostic(errors, {
        ruleId: "relationship.missing_dimension_reference",
        artifact: `dim_product[${index}]`,
        message: `references missing family ${row.product_family_code}.`,
      });
    }
  });

  if (dimensions.dim_product.length !== sourceFamilies.productInformation.length) {
    pushDiagnostic(errors, {
      ruleId: "coherence.row_count_mismatch",
      artifact: "dim_product",
      message: "row count must match Product Information source count.",
    });
  }
  if (dimensions.dim_account.length !== sourceFamilies.accountAssignments.length) {
    pushDiagnostic(errors, {
      ruleId: "coherence.row_count_mismatch",
      artifact: "dim_account",
      message: "row count must match Account Assignments source count.",
    });
  }
  if (dimensions.dim_inventory_location.length !== sourceFamilies.stockOverview.length) {
    pushDiagnostic(errors, {
      ruleId: "coherence.row_count_mismatch",
      artifact: "dim_inventory_location",
      message: "row count must match Stock Overview source count.",
    });
  }
  const expectedDemandRows = expandDemandHistoryRecords(
    sourceFamilies.customerDemand,
    publicationLoadTimestamp,
  ).length;
  if (dimensions.fact_demand_line.length !== expectedDemandRows) {
    pushDiagnostic(errors, {
      ruleId: "coherence.row_count_mismatch",
      artifact: "fact_demand_line",
      message: "row count must match the synthetic public sales series.",
    });
  }
  if (dimensions.fact_inventory_snapshot.length !== sourceFamilies.stockOverview.length) {
    pushDiagnostic(errors, {
      ruleId: "coherence.row_count_mismatch",
      artifact: "fact_inventory_snapshot",
      message: "row count must match Stock Overview source count.",
    });
  }
  if (dimensions.fact_inventory_inbound.length !== sourceFamilies.inventoryInbound.length) {
    pushDiagnostic(errors, {
      ruleId: "coherence.row_count_mismatch",
      artifact: "fact_inventory_inbound",
      message: "row count must match Inventory Inbound source count.",
    });
  }

  const sourceNeedsUnclassified = sourceFamilies.productInformation.some(
    (record) => classifyProductFamily(record) === "UNCLASSIFIED",
  );
  if (
    sourceNeedsUnclassified &&
    !dimensions.dim_product_family.some(
      (row) => row.product_family_code === "UNCLASSIFIED",
    )
  ) {
    pushDiagnostic(errors, {
      ruleId: "coherence.expected_fallback_missing",
      artifact: "dim_product_family",
      message: "expected an UNCLASSIFIED product family row but none was produced.",
    });
  }

  const sourceNeedsUnknownNode = sourceFamilies.stockOverview.some(
    (record) => classifyNodeType(record) === "UNKNOWN",
  );
  if (
    sourceNeedsUnknownNode &&
    !dimensions.dim_inventory_location.some((row) => row.node_type_code === "UNKNOWN")
  ) {
    pushDiagnostic(errors, {
      ruleId: "coherence.expected_fallback_missing",
      artifact: "dim_inventory_location",
      message: "expected an UNKNOWN inventory node row but none was produced.",
    });
  }

  const sourceNeedsUnknownAccount = sourceFamilies.accountAssignments.some(
    (record) =>
      !record.customer_group ||
      !record.service_network_code ||
      !record.fulfillment_context_code,
  );
  if (
    sourceNeedsUnknownAccount &&
    !dimensions.dim_account.some(
      (row) =>
        row.account_pattern_class === "UNKNOWN" ||
        row.service_network_code === "UNKNOWN" ||
        row.fulfillment_context_code === "UNKNOWN",
    )
  ) {
    pushDiagnostic(errors, {
      ruleId: "coherence.expected_fallback_missing",
      artifact: "dim_account",
      message: "expected at least one UNKNOWN account fallback value but none was produced.",
    });
  }

  const productKeys = new Set(dimensions.dim_product.map((row) => row.product_sk));
  const accountKeys = new Set(dimensions.dim_account.map((row) => row.account_sk));
  const locationKeys = new Set(
    dimensions.dim_inventory_location.map((row) => row.inventory_location_sk),
  );

  dimensions.fact_demand_line.forEach((row, index) => {
    if (!productKeys.has(row.product_sk)) {
      pushDiagnostic(errors, {
        ruleId: "relationship.missing_dimension_reference",
        artifact: `fact_demand_line[${index}]`,
        message: `references missing dim_product key ${row.product_sk}.`,
      });
    }
    if (!accountKeys.has(row.account_sk)) {
      pushDiagnostic(errors, {
        ruleId: "relationship.missing_dimension_reference",
        artifact: `fact_demand_line[${index}]`,
        message: `references missing dim_account key ${row.account_sk}.`,
      });
    }
    if (row.open_qty !== Math.max(row.demand_qty - row.delivered_qty, 0)) {
      pushDiagnostic(errors, {
        ruleId: "coherence.invalid_derived_value",
        artifact: `fact_demand_line[${index}]`,
        message: "has invalid open_qty derivation.",
      });
    }
    if (!isIsoDate(row.event_date)) {
      pushDiagnostic(errors, {
        ruleId: "semantics.invalid_date",
        artifact: `fact_demand_line[${index}]`,
        message: `has invalid event_date ${row.event_date}.`,
      });
    }
    if (row.event_date < PUBLIC_SALES_START_DATE) {
      pushDiagnostic(errors, {
        ruleId: "semantics.date_before_public_window",
        artifact: `fact_demand_line[${index}]`,
        message: `has event_date before public sales start ${PUBLIC_SALES_START_DATE}.`,
      });
    }
    if (!isIsoDate(row.requested_delivery_date)) {
      pushDiagnostic(errors, {
        ruleId: "semantics.invalid_date",
        artifact: `fact_demand_line[${index}]`,
        message: `has invalid requested_delivery_date ${row.requested_delivery_date}.`,
      });
    }
    if (row.promise_date !== undefined && !isIsoDate(row.promise_date)) {
      pushDiagnostic(errors, {
        ruleId: "semantics.invalid_date",
        artifact: `fact_demand_line[${index}]`,
        message: `has invalid promise_date ${row.promise_date}.`,
      });
    }
  });

  dimensions.fact_inventory_snapshot.forEach((row, index) => {
    if (!productKeys.has(row.product_sk)) {
      pushDiagnostic(errors, {
        ruleId: "relationship.missing_dimension_reference",
        artifact: `fact_inventory_snapshot[${index}]`,
        message: `references missing dim_product key ${row.product_sk}.`,
      });
    }
    if (!locationKeys.has(row.inventory_location_sk)) {
      pushDiagnostic(errors, {
        ruleId: "relationship.missing_dimension_reference",
        artifact: `fact_inventory_snapshot[${index}]`,
        message: `references missing dim_inventory_location key ${row.inventory_location_sk}.`,
      });
    }
    if (!isIsoDate(row.snapshot_date)) {
      pushDiagnostic(errors, {
        ruleId: "semantics.invalid_date",
        artifact: `fact_inventory_snapshot[${index}]`,
        message: `has invalid snapshot_date ${row.snapshot_date}.`,
      });
    }
  });

  dimensions.fact_inventory_inbound.forEach((row, index) => {
    if (!productKeys.has(row.product_sk)) {
      pushDiagnostic(errors, {
        ruleId: "relationship.missing_dimension_reference",
        artifact: `fact_inventory_inbound[${index}]`,
        message: `references missing dim_product key ${row.product_sk}.`,
      });
    }
    if (!locationKeys.has(row.inventory_location_sk)) {
      pushDiagnostic(errors, {
        ruleId: "relationship.missing_dimension_reference",
        artifact: `fact_inventory_inbound[${index}]`,
        message: `references missing dim_inventory_location key ${row.inventory_location_sk}.`,
      });
    }
    if (!isIsoDate(row.receipt_date)) {
      pushDiagnostic(errors, {
        ruleId: "semantics.invalid_date",
        artifact: `fact_inventory_inbound[${index}]`,
        message: `has invalid receipt_date ${row.receipt_date}.`,
      });
    }
    if (row.receipt_qty < 0) {
      pushDiagnostic(errors, {
        ruleId: "coherence.invalid_derived_value",
        artifact: `fact_inventory_inbound[${index}]`,
        message: "has negative receipt_qty.",
      });
    }
  });
}

function validateMasking(dimensions, sourceFamilies, errors) {
  const serializedOutput = JSON.stringify(dimensions).toLowerCase();
  const sensitiveValues = [
    ...sourceFamilies.productInformation.flatMap((record) => [
      record.product_id,
      record.product_code,
      record.product_name,
    ]),
    ...sourceFamilies.accountAssignments.flatMap((record) => [
      record.account_id,
      record.account_name,
    ]),
    ...sourceFamilies.customerDemand.flatMap((record) => [
      record.demand_line_id,
      record.order_group_code,
    ]),
    ...sourceFamilies.stockOverview.flatMap((record) => [
      record.site_code,
      record.site_name,
      record.location_code,
      record.location_name,
    ]),
    ...sourceFamilies.inventoryInbound.flatMap((record) => [
      record.inventory_inbound_id,
      record.product_id,
      record.site_code,
      record.location_code,
    ]),
  ]
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .map((value) => value.toLowerCase());

  for (const sensitiveValue of sensitiveValues) {
    if (serializedOutput.includes(sensitiveValue)) {
      pushDiagnostic(errors, {
        ruleId: "publication.sensitive_source_value_exposed",
        artifact: "publication_package",
        message: `still exposes sensitive source value: ${sensitiveValue}`,
      });
    }
  }
}

function assertUnique(rows, fieldName, dimensionName, errors) {
  const seenValues = new Set();

  rows.forEach((row, index) => {
    const value = row[fieldName];
    if (seenValues.has(value)) {
      pushDiagnostic(errors, {
        ruleId: "uniqueness.duplicate_value",
        artifact: `${dimensionName}[${index}]`,
        message: `duplicates ${fieldName} value ${value}.`,
      });
      return;
    }
    seenValues.add(value);
  });
}

function assertAllowedValue(value, allowedValues, fieldName, errors) {
  if (!allowedValues.includes(value)) {
    pushDiagnostic(errors, {
      ruleId: "vocabulary.unsupported_value",
      artifact: fieldName,
      message: `has unsupported value ${value}.`,
    });
  }
}

function isIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
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
