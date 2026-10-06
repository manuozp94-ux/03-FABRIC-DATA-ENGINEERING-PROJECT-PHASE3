import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ALLOWED_ENTITY_SCOPE_CODES,
  ALLOWED_ACTIVATION_BIAS_CODES,
  ALLOWED_BASELINE_QOQ_GROWTH_BAND_CODES,
  ALLOWED_BASELINE_SHARE_BAND_CODES,
  ALLOWED_ELIGIBILITY_STATUS_CODES,
  ALLOWED_LINE_SPLIT_BEHAVIOR_CODES,
  ALLOWED_RECEIPT_SIZE_BAND_CODES,
  ALLOWED_REPLENISHMENT_TRIGGER_CODES,
  ALLOWED_ORDER_FREQUENCY_CODES,
  ALLOWED_PRICE_REVIEW_CADENCE_CODES,
  ALLOWED_PRICE_STEP_BAND_CODES,
  ALLOWED_REPLENISHMENT_POSTURE_CODES,
  ALLOWED_SEASONALITY_PROFILE_CODES,
  ALLOWED_SHOCK_SENSITIVITY_CLASSES,
  ALLOWED_SHOCK_PROFILE_CODES,
  ALLOWED_TARGET_MARGIN_BAND_CODES,
  ALLOWED_UNIT_COST_DRIFT_BAND_CODES,
  ALLOWED_VOLATILITY_CLASSES,
  DEFAULT_GENERATION_CONTROLS_DIR,
  DEFAULT_PUBLICATION_DIR,
  GENERATION_CONTROL_FILENAMES,
  REQUIRED_GENERATION_CONTROL_FIELDS,
  loadPublicationPackage,
  parseGenerationControlArgs,
} from "../automation/generation-controls-lib.mjs";
import { readJsonFile } from "../automation/dimension-build-lib.mjs";

export async function validateGenerationControls(options = {}) {
  const publicationDir = options.publicationDir ?? DEFAULT_PUBLICATION_DIR;
  const outputDir = options.outputDir ?? DEFAULT_GENERATION_CONTROLS_DIR;
  const publicationPackage = await loadPublicationPackage(publicationDir);
  const controls = await loadGenerationControls(outputDir);
  const diagnostics = [];

  validateArrayPresence(controls, diagnostics);
  validateRequiredFields(controls, diagnostics);
  validateUniqueness(controls, diagnostics);
  validateControlledVocabulary(controls, diagnostics);
  validateCoverageAgainstPublication(controls, publicationPackage, diagnostics);
  validateSeedArithmetic(controls.seed_inventory_position, diagnostics);

  const errors = diagnostics
    .filter((diagnostic) => diagnostic.severity === "error")
    .map(formatDiagnosticMessage);

  return {
    publicationDir,
    outputDir,
    diagnostics,
    errors,
    counts: Object.fromEntries(
      Object.entries(controls).map(([key, rows]) => [key, rows.length]),
    ),
  };
}

export async function main(argv = process.argv.slice(2)) {
  const parsedArgs = parseGenerationControlArgs(argv);
  const report = await validateGenerationControls(parsedArgs);

  if (report.errors.length > 0) {
    for (const error of report.errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return report;
  }

  console.log(`Validated generation controls in ${report.outputDir}`);
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

async function loadGenerationControls(outputDir) {
  const entries = await Promise.all(
    Object.entries(GENERATION_CONTROL_FILENAMES).map(async ([key, filename]) => [
      key,
      await readJsonFile(path.join(outputDir, filename)),
    ]),
  );

  return Object.fromEntries(entries);
}

function validateArrayPresence(controls, diagnostics) {
  for (const [key, rows] of Object.entries(controls)) {
    if (!Array.isArray(rows) || rows.length === 0) {
      pushDiagnostic(diagnostics, {
        ruleId: "artifact.non_empty_array_required",
        artifact: key,
        message: "must be a non-empty array.",
      });
    }
  }
}

function validateRequiredFields(controls, diagnostics) {
  for (const [controlName, rows] of Object.entries(controls)) {
    const requiredFields = REQUIRED_GENERATION_CONTROL_FIELDS[controlName];
    rows.forEach((row, index) => {
      for (const fieldName of requiredFields) {
        if (
          row[fieldName] === undefined ||
          row[fieldName] === null ||
          (typeof row[fieldName] === "string" && row[fieldName].trim() === "")
        ) {
          pushDiagnostic(diagnostics, {
            ruleId: "required_field.missing",
            artifact: `${controlName}[${index}]`,
            message: `is missing required field ${fieldName}.`,
          });
        }
      }
    });
  }
}

function validateUniqueness(controls, diagnostics) {
  assertUnique(controls.rule_account_generation_profile, ["account_sk"], "rule_account_generation_profile", diagnostics);
  assertUnique(controls.rule_product_generation_profile, ["product_sk"], "rule_product_generation_profile", diagnostics);
  assertUnique(
    controls.rule_account_product_eligibility,
    ["account_sk", "product_sk"],
    "rule_account_product_eligibility",
    diagnostics,
  );
  assertUnique(
    controls.seed_inventory_position,
    ["product_sk", "inventory_location_sk", "seed_date"],
    "seed_inventory_position",
    diagnostics,
  );
  assertUnique(
    controls.rule_inventory_inbound,
    ["product_sk", "inventory_location_sk"],
    "rule_inventory_inbound",
    diagnostics,
  );
  assertUnique(
    controls.state_entity_shock,
    ["entity_scope_code", "entity_key", "shock_profile_code", "shock_start_date"],
    "state_entity_shock",
    diagnostics,
  );
  assertUnique(
    controls.state_pending_receipt,
    ["product_sk", "inventory_location_sk", "planned_receipt_date"],
    "state_pending_receipt",
    diagnostics,
  );
}

function validateControlledVocabulary(controls, diagnostics) {
  controls.rule_account_generation_profile.forEach((row, index) => {
    assertAllowedValue(
      row.seasonality_profile_code,
      ALLOWED_SEASONALITY_PROFILE_CODES,
      `rule_account_generation_profile[${index}].seasonality_profile_code`,
      diagnostics,
    );
    assertAllowedValue(
      row.baseline_qoq_growth_band_code,
      ALLOWED_BASELINE_QOQ_GROWTH_BAND_CODES,
      `rule_account_generation_profile[${index}].baseline_qoq_growth_band_code`,
      diagnostics,
    );
    assertAllowedValue(
      row.volatility_class,
      ALLOWED_VOLATILITY_CLASSES,
      `rule_account_generation_profile[${index}].volatility_class`,
      diagnostics,
    );
    assertAllowedValue(
      row.shock_sensitivity_class,
      ALLOWED_SHOCK_SENSITIVITY_CLASSES,
      `rule_account_generation_profile[${index}].shock_sensitivity_class`,
      diagnostics,
    );
    assertAllowedValue(
      row.order_frequency_code,
      ALLOWED_ORDER_FREQUENCY_CODES,
      `rule_account_generation_profile[${index}].order_frequency_code`,
      diagnostics,
    );
    assertAllowedValue(
      row.line_split_behavior_code,
      ALLOWED_LINE_SPLIT_BEHAVIOR_CODES,
      `rule_account_generation_profile[${index}].line_split_behavior_code`,
      diagnostics,
    );
  });

  controls.rule_product_generation_profile.forEach((row, index) => {
    assertAllowedValue(
      row.unit_cost_drift_band_code,
      ALLOWED_UNIT_COST_DRIFT_BAND_CODES,
      `rule_product_generation_profile[${index}].unit_cost_drift_band_code`,
      diagnostics,
    );
    assertAllowedValue(
      row.price_review_cadence_code,
      ALLOWED_PRICE_REVIEW_CADENCE_CODES,
      `rule_product_generation_profile[${index}].price_review_cadence_code`,
      diagnostics,
    );
    assertAllowedValue(
      row.price_step_band_code,
      ALLOWED_PRICE_STEP_BAND_CODES,
      `rule_product_generation_profile[${index}].price_step_band_code`,
      diagnostics,
    );
    assertAllowedValue(
      row.target_margin_band_code,
      ALLOWED_TARGET_MARGIN_BAND_CODES,
      `rule_product_generation_profile[${index}].target_margin_band_code`,
      diagnostics,
    );
    assertAllowedValue(
      row.replenishment_posture_code,
      ALLOWED_REPLENISHMENT_POSTURE_CODES,
      `rule_product_generation_profile[${index}].replenishment_posture_code`,
      diagnostics,
    );
  });

  controls.rule_account_product_eligibility.forEach((row, index) => {
    assertAllowedValue(
      row.eligibility_status_code,
      ALLOWED_ELIGIBILITY_STATUS_CODES,
      `rule_account_product_eligibility[${index}].eligibility_status_code`,
      diagnostics,
    );
    assertAllowedValue(
      row.activation_bias_code,
      ALLOWED_ACTIVATION_BIAS_CODES,
      `rule_account_product_eligibility[${index}].activation_bias_code`,
      diagnostics,
    );
    assertAllowedValue(
      row.baseline_share_band_code,
      ALLOWED_BASELINE_SHARE_BAND_CODES,
      `rule_account_product_eligibility[${index}].baseline_share_band_code`,
      diagnostics,
    );
  });

  controls.rule_inventory_inbound.forEach((row, index) => {
    assertAllowedValue(
      row.preferred_receipt_flow_type,
      ["SUPPLIER_RECEIPT", "TRANSFER_IN", "KIT_COMPLETION", "RETURN_TO_STOCK", "UNKNOWN"],
      `rule_inventory_inbound[${index}].preferred_receipt_flow_type`,
      diagnostics,
    );
    assertAllowedValue(
      row.receipt_size_band_code,
      ALLOWED_RECEIPT_SIZE_BAND_CODES,
      `rule_inventory_inbound[${index}].receipt_size_band_code`,
      diagnostics,
    );
    assertAllowedValue(
      row.replenishment_trigger_code,
      ALLOWED_REPLENISHMENT_TRIGGER_CODES,
      `rule_inventory_inbound[${index}].replenishment_trigger_code`,
      diagnostics,
    );
    if (typeof row.allowed_same_day_relief_flag !== "boolean") {
      pushDiagnostic(diagnostics, {
        ruleId: "type.invalid_boolean",
        artifact: `rule_inventory_inbound[${index}]`,
        message: "must provide boolean allowed_same_day_relief_flag.",
      });
    }
    validateDateText(
      row.effective_start_date,
      `rule_inventory_inbound[${index}].effective_start_date`,
      diagnostics,
    );
  });

  controls.state_entity_shock.forEach((row, index) => {
    assertAllowedValue(
      row.entity_scope_code,
      ALLOWED_ENTITY_SCOPE_CODES,
      `state_entity_shock[${index}].entity_scope_code`,
      diagnostics,
    );
    assertAllowedValue(
      row.shock_profile_code,
      ALLOWED_SHOCK_PROFILE_CODES,
      `state_entity_shock[${index}].shock_profile_code`,
      diagnostics,
    );
    validateDateText(
      row.shock_start_date,
      `state_entity_shock[${index}].shock_start_date`,
      diagnostics,
    );
    validateDateText(
      row.shock_end_date,
      `state_entity_shock[${index}].shock_end_date`,
      diagnostics,
    );
    validateDateText(
      row.recovery_end_date,
      `state_entity_shock[${index}].recovery_end_date`,
      diagnostics,
    );
    validateDateText(
      row.cooldown_end_date,
      `state_entity_shock[${index}].cooldown_end_date`,
      diagnostics,
    );
  });

  controls.state_pending_receipt.forEach((row, index) => {
    assertAllowedValue(
      row.receipt_flow_type,
      ["SUPPLIER_RECEIPT", "TRANSFER_IN", "KIT_COMPLETION", "RETURN_TO_STOCK", "UNKNOWN"],
      `state_pending_receipt[${index}].receipt_flow_type`,
      diagnostics,
    );
    validateDateText(
      row.planned_receipt_date,
      `state_pending_receipt[${index}].planned_receipt_date`,
      diagnostics,
    );
    validateDateText(
      row.expected_release_date,
      `state_pending_receipt[${index}].expected_release_date`,
      diagnostics,
    );
  });
}

function validateCoverageAgainstPublication(controls, publicationPackage, diagnostics) {
  const accountKeys = new Set(publicationPackage.dim_account.map((row) => row.account_sk));
  const productKeys = new Set(publicationPackage.dim_product.map((row) => row.product_sk));
  const locationKeys = new Set(
    publicationPackage.dim_inventory_location.map((row) => row.inventory_location_sk),
  );
  const demandEligibilityKeys = new Set(
    controls.rule_account_product_eligibility.map(
      (row) => `${row.account_sk}|${row.product_sk}`,
    ),
  );
  const seedKeys = new Set(
    controls.seed_inventory_position.map(
      (row) => `${row.product_sk}|${row.inventory_location_sk}|${row.seed_date}`,
    ),
  );

  if (controls.rule_account_generation_profile.length !== accountKeys.size) {
    pushDiagnostic(diagnostics, {
      ruleId: "coverage.account_rule_mismatch",
      artifact: "rule_account_generation_profile",
      message: "must contain one row per approved account.",
    });
  }

  if (controls.rule_product_generation_profile.length !== productKeys.size) {
    pushDiagnostic(diagnostics, {
      ruleId: "coverage.product_rule_mismatch",
      artifact: "rule_product_generation_profile",
      message: "must contain one row per approved product.",
    });
  }

  controls.rule_account_generation_profile.forEach((row, index) => {
    if (!accountKeys.has(row.account_sk)) {
      pushDiagnostic(diagnostics, {
        ruleId: "coverage.unknown_account",
        artifact: `rule_account_generation_profile[${index}]`,
        message: `references unknown account_sk ${row.account_sk}.`,
      });
    }
  });

  controls.rule_product_generation_profile.forEach((row, index) => {
    if (!productKeys.has(row.product_sk)) {
      pushDiagnostic(diagnostics, {
        ruleId: "coverage.unknown_product",
        artifact: `rule_product_generation_profile[${index}]`,
        message: `references unknown product_sk ${row.product_sk}.`,
      });
    }
  });

  controls.rule_inventory_inbound.forEach((row, index) => {
    if (!productKeys.has(row.product_sk)) {
      pushDiagnostic(diagnostics, {
        ruleId: "coverage.unknown_product",
        artifact: `rule_inventory_inbound[${index}]`,
        message: `references unknown product_sk ${row.product_sk}.`,
      });
    }
    if (!locationKeys.has(row.inventory_location_sk)) {
      pushDiagnostic(diagnostics, {
        ruleId: "coverage.unknown_location",
        artifact: `rule_inventory_inbound[${index}]`,
        message: `references unknown inventory_location_sk ${row.inventory_location_sk}.`,
      });
    }
  });

  publicationPackage.fact_demand_line.forEach((row, index) => {
    const key = `${row.account_sk}|${row.product_sk}`;
    if (!demandEligibilityKeys.has(key)) {
      pushDiagnostic(diagnostics, {
        ruleId: "coverage.missing_demand_pair_eligibility",
        artifact: `fact_demand_line[${index}]`,
        message: `does not resolve to an approved rule_account_product_eligibility pair for ${key}.`,
      });
    }
  });

  publicationPackage.fact_inventory_snapshot.forEach((row, index) => {
    const key = `${row.product_sk}|${row.inventory_location_sk}|${row.snapshot_date}`;
    if (!seedKeys.has(key)) {
      pushDiagnostic(diagnostics, {
        ruleId: "coverage.missing_seed_inventory_position",
        artifact: `fact_inventory_snapshot[${index}]`,
        message: `does not resolve to a matching seed_inventory_position row for ${key}.`,
      });
    }
  });

  publicationPackage.fact_inventory_inbound.forEach((row, index) => {
    const key = `${row.product_sk}|${row.inventory_location_sk}`;
    if (
      !controls.rule_inventory_inbound.some(
        (ruleRow) =>
          ruleRow.product_sk === row.product_sk
          && ruleRow.inventory_location_sk === row.inventory_location_sk,
      )
    ) {
      pushDiagnostic(diagnostics, {
        ruleId: "coverage.missing_inbound_rule",
        artifact: `fact_inventory_inbound[${index}]`,
        message: `does not resolve to a matching rule_inventory_inbound row for ${key}.`,
      });
    }
  });

  controls.state_pending_receipt.forEach((row, index) => {
    if (!productKeys.has(row.product_sk)) {
      pushDiagnostic(diagnostics, {
        ruleId: "coverage.unknown_product",
        artifact: `state_pending_receipt[${index}]`,
        message: `references unknown product_sk ${row.product_sk}.`,
      });
    }
    if (!locationKeys.has(row.inventory_location_sk)) {
      pushDiagnostic(diagnostics, {
        ruleId: "coverage.unknown_location",
        artifact: `state_pending_receipt[${index}]`,
        message: `references unknown inventory_location_sk ${row.inventory_location_sk}.`,
      });
    }
  });
}

function validateSeedArithmetic(seedRows, diagnostics) {
  seedRows.forEach((row, index) => {
    if (Number(row.opening_available_qty) > Number(row.opening_on_hand_qty)) {
      pushDiagnostic(diagnostics, {
        ruleId: "arithmetic.invalid_available_qty",
        artifact: `seed_inventory_position[${index}]`,
        message: "has opening_available_qty greater than opening_on_hand_qty.",
      });
    }
  });
}

function validateDateText(isoDate, artifact, diagnostics) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    pushDiagnostic(diagnostics, {
      ruleId: "semantics.invalid_date",
      artifact,
      message: `has invalid ISO date ${isoDate}.`,
    });
  }
}

function assertAllowedValue(value, allowedValues, artifact, diagnostics) {
  if (!allowedValues.includes(value)) {
    pushDiagnostic(diagnostics, {
      ruleId: "vocabulary.unsupported_value",
      artifact,
      message: `has unsupported value ${value}.`,
    });
  }
}

function assertUnique(rows, keyFields, artifact, diagnostics) {
  const seen = new Set();

  rows.forEach((row, index) => {
    const key = keyFields.map((field) => row[field]).join("|");
    if (seen.has(key)) {
      pushDiagnostic(diagnostics, {
        ruleId: "uniqueness.duplicate_key",
        artifact: `${artifact}[${index}]`,
        message: `duplicates key ${key}.`,
      });
      return;
    }

    seen.add(key);
  });
}

function pushDiagnostic(diagnostics, { ruleId, artifact, message, severity = "error" }) {
  diagnostics.push({
    severity,
    rule_id: ruleId,
    artifact,
    message,
  });
}

function formatDiagnosticMessage(diagnostic) {
  return `[${diagnostic.rule_id}] ${diagnostic.artifact} ${diagnostic.message}`;
}
