import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  DEFAULT_SOURCE_DIR,
  OUTPUT_FILENAMES,
  PUBLIC_SALES_START_DATE,
  buildDimensionsToDirectory,
  expandDemandHistoryRecords,
} from "../../platform/fabric/automation/dimension-build-lib.mjs";
import { validatePublicationDimensions } from "../../platform/fabric/validation/validate-dimensions.mjs";

const FIXED_TIMESTAMP = "2026-03-28T20:45:00.000Z";

test("builds public-safe dimensions and facts from the approved source families", async () => {
  const outputDir = await mkdtemp(path.join(os.tmpdir(), "fabric-dimensions-build-"));

  try {
    const customerDemand = await readJsonFile(
      path.join(DEFAULT_SOURCE_DIR, "customer-demand.json"),
    );
    const expectedDemandRowCount = expandDemandHistoryRecords(
      customerDemand,
      FIXED_TIMESTAMP,
    ).length;
    const result = await buildDimensionsToDirectory({
      sourceDir: DEFAULT_SOURCE_DIR,
      outputDir,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });

    assert.equal(result.dimensions.dim_product.length, 5);
    assert.equal(result.dimensions.dim_account.length, 4);
    assert.equal(result.dimensions.dim_inventory_location.length, 7);
    assert.equal(result.dimensions.fact_demand_line.length, expectedDemandRowCount);
    assert.equal(result.dimensions.fact_inventory_inbound.length, 7);
    assert.equal(result.dimensions.fact_inventory_snapshot.length, 7);
    assert.ok(
      result.dimensions.dim_product_family.some(
        (row) => row.product_family_code === "UNCLASSIFIED",
      ),
    );
    assert.ok(
      result.dimensions.dim_product.some(
        (row) => row.product_family_code === "BULKY_ITEM",
      ),
    );
    assert.ok(
      result.dimensions.dim_product.some(
        (row) => row.product_family_code === "KIT_ASSEMBLY",
      ),
    );
    assert.ok(
      result.dimensions.dim_product.some(
        (row) => row.product_family_code === "CONTROLLED_ITEM",
      ),
    );
    assert.ok(
      result.dimensions.dim_account.some(
        (row) => row.account_pattern_class === "RECURRING_SERVICE",
      ),
    );
    assert.ok(
      result.dimensions.dim_account.some(
        (row) => row.account_pattern_class === "PROJECT_BASED",
      ),
    );
    assert.ok(
      result.dimensions.dim_account.some(
        (row) => row.account_pattern_class === "PARTNER_CHANNEL",
      ),
    );
    assert.equal(
      "forecasting_category" in result.dimensions.dim_product[0],
      false,
    );
    assert.equal(
      "planning_model" in result.dimensions.dim_product[0],
      false,
    );
    assert.equal(
      "customer_group" in result.dimensions.dim_account[0],
      true,
    );
    assert.equal(
      "masked_product_code" in result.dimensions.dim_product[0],
      false,
    );
    assert.equal(
      "product_code" in result.dimensions.dim_product[0],
      true,
    );
    assert.equal(
      "product_name" in result.dimensions.dim_product[0],
      true,
    );
    assert.equal(
      "masked_account_code" in result.dimensions.dim_account[0],
      false,
    );
    assert.equal(
      "account_code" in result.dimensions.dim_account[0],
      true,
    );
    assert.equal(
      "location_code" in result.dimensions.dim_inventory_location[0],
      true,
    );
    assert.equal(
      "interchangeability_group_code" in result.dimensions.dim_product[0],
      true,
    );
    assert.equal(
      "substitution_group_proxy" in result.dimensions.dim_product[0],
      false,
    );
    assert.equal(
      "account_pattern_class" in result.dimensions.dim_account[0],
      true,
    );
    assert.ok(
      result.dimensions.dim_account.every(
        (row) =>
          typeof row.customer_group === "string"
          && row.customer_group.length > 0
          && row.account_name.includes(row.customer_group),
      ),
    );
    assert.ok(
      result.dimensions.dim_account.every(
        (row) => !/[A-F0-9]{6}$/.test(row.account_name),
      ),
    );
    assert.ok(
      result.dimensions.dim_product.every(
        (row) => !/[A-F0-9]{6}$/.test(row.product_name),
      ),
    );
    assert.equal(
      "demand_value_proxy" in result.dimensions.fact_demand_line[0],
      true,
    );
    assert.equal(
      "receipt_value_proxy" in result.dimensions.fact_inventory_inbound[0],
      true,
    );
    assert.equal(
      "inventory_value_proxy" in result.dimensions.fact_inventory_snapshot[0],
      true,
    );
    assert.ok(
      result.dimensions.fact_inventory_inbound.every(
        (row) => row.receipt_qty >= 0,
      ),
    );
    assert.ok(
      result.dimensions.fact_inventory_inbound.some(
        (row) => row.receipt_flow_type === "SUPPLIER_RECEIPT",
      ),
    );
    assert.ok(
      result.dimensions.fact_inventory_inbound.some(
        (row) => row.receipt_flow_type === "TRANSFER_IN",
      ),
    );
    assert.ok(
      result.dimensions.fact_demand_line.every(
        (row) => row.event_date >= PUBLIC_SALES_START_DATE,
      ),
    );
    assert.ok(
      result.dimensions.fact_demand_line.some((row) => row.event_date.startsWith("2026-03-")),
    );
    assert.equal(
      result.dimensions.dim_product[0].source_file_version,
      "curated_publication_r2",
    );
    assert.equal(
      result.dimensions.fact_demand_line[0].record_source_family,
      "sales_activity_domain",
    );

    for (const filename of Object.values(OUTPUT_FILENAMES)) {
      const fileContents = await readFile(path.join(outputDir, filename), "utf8");
      assert.ok(fileContents.includes("\n"));
    }
  } finally {
    await rm(outputDir, { recursive: true, force: true });
  }
});

test("validates generated dimensions against masking and contract checks", async () => {
  const outputDir = await mkdtemp(
    path.join(os.tmpdir(), "fabric-dimensions-validate-"),
  );

  try {
    await buildDimensionsToDirectory({
      sourceDir: DEFAULT_SOURCE_DIR,
      outputDir,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });

    const report = await validatePublicationDimensions({
      sourceDir: DEFAULT_SOURCE_DIR,
      outputDir,
    });

    assert.deepEqual(report.errors, []);
  } finally {
    await rm(outputDir, { recursive: true, force: true });
  }
});

test("repeated builds are deterministic when the load timestamp is fixed", async () => {
  const firstOutputDir = await mkdtemp(
    path.join(os.tmpdir(), "fabric-dimensions-first-"),
  );
  const secondOutputDir = await mkdtemp(
    path.join(os.tmpdir(), "fabric-dimensions-second-"),
  );

  try {
    await buildDimensionsToDirectory({
      sourceDir: DEFAULT_SOURCE_DIR,
      outputDir: firstOutputDir,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });
    await buildDimensionsToDirectory({
      sourceDir: DEFAULT_SOURCE_DIR,
      outputDir: secondOutputDir,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });

    for (const filename of Object.values(OUTPUT_FILENAMES)) {
      const firstContents = await readFile(path.join(firstOutputDir, filename), "utf8");
      const secondContents = await readFile(
        path.join(secondOutputDir, filename),
        "utf8",
      );
      assert.equal(secondContents, firstContents);
    }
  } finally {
    await rm(firstOutputDir, { recursive: true, force: true });
    await rm(secondOutputDir, { recursive: true, force: true });
  }
});

test("existing public codes stay stable when new earlier source rows are added", async () => {
  const sourceDir = await mkdtemp(path.join(os.tmpdir(), "fabric-dimensions-source-"));
  const baselineOutputDir = await mkdtemp(
    path.join(os.tmpdir(), "fabric-dimensions-baseline-"),
  );
  const expandedOutputDir = await mkdtemp(
    path.join(os.tmpdir(), "fabric-dimensions-expanded-"),
  );

  try {
    await mkdir(sourceDir, { recursive: true });

    const [
      productInformation,
      customerDemand,
      accountAssignments,
      stockOverview,
      inventoryInbound,
    ] = await Promise.all([
      readJsonFile(path.join(DEFAULT_SOURCE_DIR, "product-information.json")),
      readJsonFile(path.join(DEFAULT_SOURCE_DIR, "customer-demand.json")),
      readJsonFile(path.join(DEFAULT_SOURCE_DIR, "account-assignments.json")),
      readJsonFile(path.join(DEFAULT_SOURCE_DIR, "stock-overview.json")),
      readJsonFile(path.join(DEFAULT_SOURCE_DIR, "inventory-inbound.json")),
    ]);

    await Promise.all([
      writeJsonFile(path.join(sourceDir, "product-information.json"), [
        {
          product_id: "000-prepend-product",
          product_code: "AAA-NEW-001",
          product_name: "Starter Rail Sample",
          forecasting_category: "core",
          product_category: "Long Profile",
          planning_model: "standard",
          weight_value: 5,
          box_qty: 5,
          pallet_qty: 10,
          source_file_version: "product-information-fixture-v2",
          record_status: "active",
        },
        ...productInformation,
      ]),
      writeJsonFile(path.join(sourceDir, "customer-demand.json"), [
        {
          demand_line_id: "000-prepend-demand",
          order_group_code: "AAA-ORDER-00",
          product_id: "000-prepend-product",
          account_id: "000-prepend-account",
          event_date: "2024-01-01",
          requested_delivery_date: "2024-01-06",
          promise_date: "2024-01-05",
          demand_status_code: "open",
          priority_code: "high",
          demand_qty: 9,
          delivered_qty: 1,
          source_file_version: "customer-demand-fixture-v2",
          record_status: "active",
        },
        ...customerDemand,
      ]),
      writeJsonFile(path.join(sourceDir, "account-assignments.json"), [
        {
          account_id: "000-prepend-account",
          account_name: "Alpha Preview Services",
          customer_group: "Field Service",
          service_network_code: "AAA-NET-00",
          fulfillment_context_code: "Direct Service",
          source_file_version: "account-assignments-fixture-v2",
          record_status: "active",
        },
        ...accountAssignments,
      ]),
      writeJsonFile(path.join(sourceDir, "stock-overview.json"), [
        {
          product_id: "000-prepend-product",
          snapshot_date: "2024-01-31",
          site_code: "AAA-SITE-00",
          site_name: "Alpha Inbound Hub",
          location_code: "AAA-LOC-00",
          location_name: "Alpha Transit Lane",
          ownership_model: "internal",
          storage_type: "transit",
          on_hand_qty: 0,
          available_qty: 0,
          reserved_qty: 0,
          in_transit_qty: 12,
          inventory_status_code: "transit",
          logistics_area_code: "AAA-AREA-00",
          source_file_version: "stock-overview-fixture-v2",
          record_status: "active",
        },
        ...stockOverview,
      ]),
      writeJsonFile(path.join(sourceDir, "inventory-inbound.json"), [
        {
          inventory_inbound_id: "000-prepend-inbound",
          product_id: "000-prepend-product",
          receipt_date: "2024-01-02",
          site_code: "AAA-SITE-00",
          location_code: "AAA-LOC-00",
          receipt_qty: 12,
          receipt_flow_type: "supplier_receipt",
          source_file_version: "inventory-inbound-fixture-v2",
          record_status: "active",
        },
        ...inventoryInbound,
      ]),
    ]);

    const baseline = await buildDimensionsToDirectory({
      sourceDir: DEFAULT_SOURCE_DIR,
      outputDir: baselineOutputDir,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });
    const expanded = await buildDimensionsToDirectory({
      sourceDir,
      outputDir: expandedOutputDir,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });

    assertStableCodes(
      baseline.dimensions.dim_product,
      expanded.dimensions.dim_product,
      "product_sk",
      "product_code",
    );
    assertStableCodes(
      baseline.dimensions.dim_account,
      expanded.dimensions.dim_account,
      "account_sk",
      "account_code",
    );
    assertStableCodes(
      baseline.dimensions.dim_inventory_location,
      expanded.dimensions.dim_inventory_location,
      "inventory_location_sk",
      "location_code",
    );
    assertStableCodes(
      baseline.dimensions.fact_inventory_inbound,
      expanded.dimensions.fact_inventory_inbound,
      "inventory_inbound_sk",
      "inventory_inbound_sk",
    );
    assertStableCodes(
      baseline.dimensions.fact_demand_line,
      expanded.dimensions.fact_demand_line,
      "demand_line_sk",
      "demand_line_sk",
    );
  } finally {
    await rm(sourceDir, { recursive: true, force: true });
    await rm(baselineOutputDir, { recursive: true, force: true });
    await rm(expandedOutputDir, { recursive: true, force: true });
  }
});

async function readJsonFile(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeJsonFile(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function assertStableCodes(baselineRows, expandedRows, keyField, codeField) {
  const expandedByKey = new Map(expandedRows.map((row) => [row[keyField], row]));

  for (const baselineRow of baselineRows) {
    const expandedRow = expandedByKey.get(baselineRow[keyField]);
    assert.ok(expandedRow, `Missing ${keyField} ${baselineRow[keyField]} in expanded output`);
    assert.equal(expandedRow[codeField], baselineRow[codeField]);
  }
}
