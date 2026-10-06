import { createHash } from "node:crypto";

import {
  PUBLICATION_SAFETY_FLAG,
} from "./dimension-build-lib.mjs";

export const OPERATING_LOOP_PUBLIC_FILENAMES = {
  dim_service_region: "dim_service_region.json",
  dim_supplier: "dim_supplier.json",
  rule_supplier_product_lead_time: "rule_supplier_product_lead_time.json",
  rule_location_transfer_lead_time: "rule_location_transfer_lead_time.json",
  rule_location_service_lead_time: "rule_location_service_lead_time.json",
  fact_supply_chain_decision_queue_line: "fact_supply_chain_decision_queue_line.json",
  fact_logistics_decision_queue_line: "fact_logistics_decision_queue_line.json",
  fact_purchase_order_line: "fact_purchase_order_line.json",
  fact_purchase_order_status_history: "fact_purchase_order_status_history.json",
  fact_inventory_movement_line: "fact_inventory_movement_line.json",
  fact_sales_fulfillment_line: "fact_sales_fulfillment_line.json",
};

export const OPERATING_LOOP_RULE_VERSION = "operating_loop_v1";

const HASH_NAMESPACE = "fabric-bmad-operating-loop-v1";

const SERVICE_REGION_LABELS = [
  "North Corridor",
  "Harbor Line",
  "Metro East",
  "Central Ridge",
  "South Gate",
  "West Junction",
  "River Bend",
  "Summit Point",
];

const SUPPLIER_BLUEPRINTS = [
  ["CORE_SUPPLIER", "HIGH"],
  ["CORE_SUPPLIER", "MEDIUM"],
  ["SPECIALTY_SUPPLIER", "HIGH"],
  ["SPECIALTY_SUPPLIER", "MEDIUM"],
  ["TRANSFER_SOURCE", "HIGH"],
  ["TRANSFER_SOURCE", "MEDIUM"],
  ["BACKUP_SUPPLIER", "MEDIUM"],
  ["BACKUP_SUPPLIER", "LOW"],
];

const FAMILY_UNIT_VALUE = {
  SMALL_PART: 18,
  KIT_ASSEMBLY: 62,
  BULKY_ITEM: 44,
  CONTROLLED_ITEM: 37,
  UNCLASSIFIED: 24,
  STANDARD_COMPONENT: 28,
};

const SERVICE_CAPABLE_NODE_TYPES = new Set([
  "INTERNAL_WAREHOUSE",
  "FLOOR_AREA",
  "OVERFLOW_AREA",
  "THIRD_PARTY_NODE",
]);

export function buildOperatingLoopTables({
  representativePackage,
  planProductLocationStocking = [],
  representativeSourceVersion,
  loadTimestampUtc,
}) {
  const products = representativePackage.dim_product;
  const accounts = representativePackage.dim_account;
  const locations = representativePackage.dim_inventory_location;
  const demandLines = representativePackage.fact_demand_line;
  const inventorySnapshots = representativePackage.fact_inventory_snapshot;
  const source_file_version = `${representativeSourceVersion}__${OPERATING_LOOP_RULE_VERSION}`;

  const productByKey = new Map(products.map((row) => [row.product_sk, row]));
  const accountByKey = new Map(accounts.map((row) => [row.account_sk, row]));
  const locationByKey = new Map(locations.map((row) => [row.inventory_location_sk, row]));
  const dim_service_region = buildServiceRegions({ source_file_version, loadTimestampUtc });
  const serviceRegionCodes = dim_service_region.map((row) => row.service_region_code);
  const dim_supplier = buildSuppliers({
    serviceRegionCodes,
    source_file_version,
    loadTimestampUtc,
  });
  const dimSupplierByClass = groupBy(dim_supplier, (row) => row.supplier_class);
  const stockingRows = normalizeStockingRows({
    planProductLocationStocking,
    inventorySnapshots,
    productByKey,
    locationByKey,
  });

  const rule_supplier_product_lead_time = buildSupplierProductLeadTimes({
    stockingRows,
    productByKey,
    dimSupplierByClass,
    source_file_version,
    loadTimestampUtc,
  });
  const supplierRuleByPair = new Map(
    rule_supplier_product_lead_time.map((row) => [
      `${row.product_sk}|${row.receiving_inventory_location_sk}`,
      row,
    ]),
  );
  const rule_location_transfer_lead_time = buildLocationTransferLeadTimes({
    locations,
    source_file_version,
    loadTimestampUtc,
  });
  const transferRuleByPair = new Map(
    rule_location_transfer_lead_time.map((row) => [
      `${row.origin_inventory_location_sk}|${row.destination_inventory_location_sk}`,
      row,
    ]),
  );
  const rule_location_service_lead_time = buildLocationServiceLeadTimes({
    locations,
    serviceRegionCodes,
    source_file_version,
    loadTimestampUtc,
  });
  const serviceRuleByLocationRegion = new Map(
    rule_location_service_lead_time.map((row) => [
      `${row.fulfillment_inventory_location_sk}|${row.service_region_code}`,
      row,
    ]),
  );

  const latestSnapshotDate = latestValue(inventorySnapshots, "snapshot_date");
  const latestInventoryRows = inventorySnapshots.filter(
    (row) => row.snapshot_date === latestSnapshotDate,
  );
  const openDemandByProduct = rollupOpenDemandByProduct(demandLines);
  const primaryLocationByProduct = buildPrimaryLocationByProduct(latestInventoryRows, locationByKey);
  const decisionDate = latestSnapshotDate;

  const fact_supply_chain_decision_queue_line = buildSupplyChainDecisionQueue({
    latestInventoryRows,
    openDemandByProduct,
    productByKey,
    locationByKey,
    supplierRuleByPair,
    decisionDate,
    source_file_version,
    loadTimestampUtc,
  });
  const fact_purchase_order_line = buildPurchaseOrderLines({
    decisionRows: fact_supply_chain_decision_queue_line,
    supplierRuleByPair,
    productByKey,
    source_file_version,
    loadTimestampUtc,
  });
  const fact_purchase_order_status_history = buildPurchaseOrderStatusHistory({
    purchaseOrderRows: fact_purchase_order_line,
    source_file_version,
    loadTimestampUtc,
  });
  const logisticsBuild = buildLogisticsDecisionQueue({
    demandLines,
    latestInventoryRows,
    openDemandByProduct,
    productByKey,
    accountByKey,
    locationByKey,
    primaryLocationByProduct,
    transferRuleByPair,
    serviceRuleByLocationRegion,
    serviceRegionCodes,
    decisionDate,
    source_file_version,
    loadTimestampUtc,
  });
  const fact_logistics_decision_queue_line = logisticsBuild.decisionRows;
  const fact_inventory_movement_line = buildInventoryMovementLines({
    logisticsRows: fact_logistics_decision_queue_line,
    transferRuleByPair,
    productByKey,
    source_file_version,
    loadTimestampUtc,
  });
  const fact_sales_fulfillment_line = buildSalesFulfillmentLines({
    demandLines,
    productByKey,
    accountByKey,
    primaryLocationByProduct,
    serviceRuleByLocationRegion,
    serviceRegionCodes,
    source_file_version,
    loadTimestampUtc,
  });

  return {
    dim_service_region,
    dim_supplier,
    rule_supplier_product_lead_time,
    rule_location_transfer_lead_time,
    rule_location_service_lead_time,
    fact_supply_chain_decision_queue_line,
    fact_logistics_decision_queue_line,
    fact_purchase_order_line,
    fact_purchase_order_status_history,
    fact_inventory_movement_line,
    fact_sales_fulfillment_line,
  };
}

function buildServiceRegions({ source_file_version, loadTimestampUtc }) {
  return SERVICE_REGION_LABELS.map((label, index) => ({
    service_region_code: regionCode(label),
    service_region_label: label,
    service_region_class: index % 3 === 0
      ? "LOGISTICS_SERVICE_REGION"
      : "COMMERCIAL_SERVICE_REGION",
    record_source_family: "service_region_reference_domain",
    source_file_version,
    record_status: "active",
    publication_safety_flag: PUBLICATION_SAFETY_FLAG,
    load_timestamp_utc: loadTimestampUtc,
  }));
}

function buildSuppliers({ serviceRegionCodes, source_file_version, loadTimestampUtc }) {
  return SUPPLIER_BLUEPRINTS.map(([supplierClass, reliabilityBand], index) => {
    const identityKey = `${supplierClass}|${index + 1}`;
    return {
      supplier_sk: stableId("SUP", identityKey),
      supplier_code: stableDashCode("SUP", identityKey),
      supplier_name: `${titleCaseCode(supplierClass)} ${String(index + 1).padStart(2, "0")}`,
      supplier_class: supplierClass,
      supplier_reliability_band: reliabilityBand,
      service_region_code: serviceRegionCodes[index % serviceRegionCodes.length] ?? "UNKNOWN",
      currency_code: "USD",
      record_source_family: "supplier_reference_domain",
      source_file_version,
      record_status: "active",
      publication_safety_flag: PUBLICATION_SAFETY_FLAG,
      load_timestamp_utc: loadTimestampUtc,
    };
  });
}

function buildSupplierProductLeadTimes({
  stockingRows,
  productByKey,
  dimSupplierByClass,
  source_file_version,
  loadTimestampUtc,
}) {
  return stockingRows.map((row) => {
    const product = productByKey.get(row.product_sk) ?? {};
    const supplierClass = supplierClassForProduct(product);
    const suppliers = dimSupplierByClass.get(supplierClass) ?? [];
    const fallbackSuppliers = dimSupplierByClass.get("BACKUP_SUPPLIER") ?? [];
    const supplier =
      pickDeterministicRow(suppliers, `${row.product_sk}|${row.inventory_location_sk}`)
      ?? pickDeterministicRow(fallbackSuppliers, `${row.product_sk}|fallback`);
    const leadTimeDays = leadTimeDaysForProduct(product, row.node_type_code);
    const orderMultiple = orderMultipleForFamily(product.product_family_code);
    return {
      supplier_product_lead_time_rule_sk: stableRuleId(
        "SPLT_RULE",
        `${supplier?.supplier_sk}|${row.product_sk}|${row.inventory_location_sk}`,
      ),
      supplier_sk: supplier?.supplier_sk,
      product_sk: row.product_sk,
      receiving_inventory_location_sk: row.inventory_location_sk,
      lead_time_days: leadTimeDays,
      minimum_order_qty: minimumOrderQtyForFamily(product.product_family_code),
      order_multiple_qty: orderMultiple,
      preferred_supplier_flag: row.stocking_rank === 1,
      effective_start_date: "2025-10-01",
      effective_end_date: "2026-12-31",
      rule_version: OPERATING_LOOP_RULE_VERSION,
      publication_safety_flag: PUBLICATION_SAFETY_FLAG,
      load_timestamp_utc: loadTimestampUtc,
    };
  }).sort((left, right) =>
    `${left.product_sk}|${left.receiving_inventory_location_sk}`.localeCompare(
      `${right.product_sk}|${right.receiving_inventory_location_sk}`,
    ),
  );
}

function buildLocationTransferLeadTimes({ locations, source_file_version, loadTimestampUtc }) {
  const rows = [];
  for (const origin of locations) {
    for (const destination of locations) {
      if (origin.inventory_location_sk === destination.inventory_location_sk) {
        continue;
      }
      rows.push({
        location_transfer_lead_time_rule_sk: stableRuleId(
          "LTLT_RULE",
          `${origin.inventory_location_sk}|${destination.inventory_location_sk}`,
        ),
        origin_inventory_location_sk: origin.inventory_location_sk,
        destination_inventory_location_sk: destination.inventory_location_sk,
        transfer_mode_code: transferModeForLocations(origin, destination),
        transfer_lead_time_days: transferLeadTimeDays(origin, destination),
        transit_buffer_days: stableIndex(`${origin.inventory_location_sk}|${destination.inventory_location_sk}|buffer`, 2),
        effective_start_date: "2025-10-01",
        effective_end_date: "2026-12-31",
        rule_version: OPERATING_LOOP_RULE_VERSION,
        publication_safety_flag: PUBLICATION_SAFETY_FLAG,
        load_timestamp_utc: loadTimestampUtc,
      });
    }
  }
  return rows;
}

function buildLocationServiceLeadTimes({
  locations,
  serviceRegionCodes,
  source_file_version,
  loadTimestampUtc,
}) {
  return locations
    .filter((location) => SERVICE_CAPABLE_NODE_TYPES.has(location.node_type_code))
    .flatMap((location) =>
      serviceRegionCodes.map((serviceRegionCode, index) => ({
        location_service_lead_time_rule_sk: stableRuleId(
          "LSLT_RULE",
          `${location.inventory_location_sk}|${serviceRegionCode}`,
        ),
        fulfillment_inventory_location_sk: location.inventory_location_sk,
        service_region_code: serviceRegionCode,
        service_lead_time_days:
          1 + stableIndex(`${location.inventory_location_sk}|${serviceRegionCode}|service`, 6),
        service_priority_code: index % 4 === 0 ? "PRIMARY" : index % 4 === 1 ? "SECONDARY" : "BACKUP",
        effective_start_date: "2025-10-01",
        effective_end_date: "2026-12-31",
        rule_version: OPERATING_LOOP_RULE_VERSION,
        publication_safety_flag: PUBLICATION_SAFETY_FLAG,
        load_timestamp_utc: loadTimestampUtc,
      })),
    );
}

function buildSupplyChainDecisionQueue({
  latestInventoryRows,
  openDemandByProduct,
  productByKey,
  locationByKey,
  supplierRuleByPair,
  decisionDate,
  source_file_version,
  loadTimestampUtc,
}) {
  const candidates = latestInventoryRows
    .filter((row) => SERVICE_CAPABLE_NODE_TYPES.has(locationByKey.get(row.inventory_location_sk)?.node_type_code))
    .map((row) => {
      const openDemandQty = openDemandByProduct.get(row.product_sk)?.open_qty ?? 0;
      const shortfallQty = Math.max(openDemandQty - Number(row.available_qty ?? 0), 0);
      return { row, openDemandQty, shortfallQty };
    })
    .filter(({ row, shortfallQty }) =>
      shortfallQty > 0 || row.readiness_flag !== "READY" || Number(row.available_qty ?? 0) <= 5,
    )
    .sort((left, right) =>
      right.shortfallQty - left.shortfallQty
      || Number(left.row.available_qty ?? 0) - Number(right.row.available_qty ?? 0),
    )
    .slice(0, 48);

  return candidates.map(({ row, shortfallQty }, index) => {
    const product = productByKey.get(row.product_sk) ?? {};
    const supplierRule = supplierRuleByPair.get(`${row.product_sk}|${row.inventory_location_sk}`);
    const multiple = supplierRule?.order_multiple_qty ?? orderMultipleForFamily(product.product_family_code);
    const rawQty = Math.max(
      shortfallQty,
      supplierRule?.minimum_order_qty ?? minimumOrderQtyForFamily(product.product_family_code),
    );
    const recommendedQty = roundUpToMultiple(rawQty, multiple);
    const approved = index < 24;
    const plannedOrderDate = addIsoDays(decisionDate, -stableIndex(`${row.product_sk}|po_age`, 5));
    const expectedReceiptDate = addIsoDays(plannedOrderDate, supplierRule?.lead_time_days ?? 7);
    return {
      supply_chain_decision_line_sk: stableId("SCQ", `${row.product_sk}|${row.inventory_location_sk}|${decisionDate}`),
      decision_date: plannedOrderDate,
      decision_type_code: "PURCHASE_ORDER",
      recommendation_status_code: approved ? "APPROVED" : "RECOMMENDED",
      product_sk: row.product_sk,
      receiving_inventory_location_sk: row.inventory_location_sk,
      supplier_sk: supplierRule?.supplier_sk,
      recommended_qty: recommendedQty,
      approved_qty: approved ? recommendedQty : 0,
      planned_order_date: plannedOrderDate,
      expected_receipt_date: expectedReceiptDate,
      cost_amount_usd: roundMoney(recommendedQty * unitCostForProduct(product)),
      decision_reason_code: shortfallQty > 0 ? "OPEN_DEMAND_PRESSURE" : "READINESS_RISK",
      source_file_version,
      publication_safety_flag: PUBLICATION_SAFETY_FLAG,
      load_timestamp_utc: loadTimestampUtc,
    };
  });
}

function buildPurchaseOrderLines({
  decisionRows,
  supplierRuleByPair,
  productByKey,
  source_file_version,
  loadTimestampUtc,
}) {
  return decisionRows
    .filter((row) => row.recommendation_status_code === "APPROVED" && row.decision_type_code === "PURCHASE_ORDER")
    .map((row) => {
      const product = productByKey.get(row.product_sk) ?? {};
      const supplierRule = supplierRuleByPair.get(
        `${row.product_sk}|${row.receiving_inventory_location_sk}`,
      );
      const unitCost = unitCostForProduct(product);
      const status = row.expected_receipt_date <= row.planned_order_date
        ? "RECEIVED"
        : "ORDERED";
      return {
        purchase_order_line_sk: stableId("POL", row.supply_chain_decision_line_sk),
        purchase_order_code: `PO-${stableCodeSegment(`PO|${row.supply_chain_decision_line_sk}`, 8)}`,
        supply_chain_decision_line_sk: row.supply_chain_decision_line_sk,
        product_sk: row.product_sk,
        supplier_sk: row.supplier_sk ?? supplierRule?.supplier_sk,
        receiving_inventory_location_sk: row.receiving_inventory_location_sk,
        order_date: row.planned_order_date,
        planned_receipt_date: row.expected_receipt_date,
        expected_release_date: row.expected_receipt_date,
        ordered_qty: row.approved_qty,
        received_qty: status === "RECEIVED" ? row.approved_qty : 0,
        open_qty: status === "RECEIVED" ? 0 : row.approved_qty,
        unit_cost_amount: unitCost,
        purchase_cost_amount_usd: roundMoney(row.approved_qty * unitCost),
        purchase_order_status_code: status,
        currency_code: "USD",
        source_file_version,
        publication_safety_flag: PUBLICATION_SAFETY_FLAG,
        load_timestamp_utc: loadTimestampUtc,
      };
    });
}

function buildPurchaseOrderStatusHistory({
  purchaseOrderRows,
  source_file_version,
  loadTimestampUtc,
}) {
  return purchaseOrderRows.flatMap((row) => {
    const plannedStart = `${row.order_date}T08:00:00.000Z`;
    const orderedStart = `${row.order_date}T12:00:00.000Z`;
    const rows = [
      {
        purchase_order_status_history_sk: stableId("POH", `${row.purchase_order_line_sk}|1`),
        purchase_order_line_sk: row.purchase_order_line_sk,
        purchase_order_status_code: "PLANNED",
        status_sequence: 1,
        status_start_at_utc: plannedStart,
        status_end_at_utc: orderedStart,
        status_reason_code: "ORDER_PLANNED",
        source_file_version,
        publication_safety_flag: PUBLICATION_SAFETY_FLAG,
        load_timestamp_utc: loadTimestampUtc,
      },
      {
        purchase_order_status_history_sk: stableId("POH", `${row.purchase_order_line_sk}|2`),
        purchase_order_line_sk: row.purchase_order_line_sk,
        purchase_order_status_code: row.purchase_order_status_code,
        status_sequence: 2,
        status_start_at_utc: orderedStart,
        status_reason_code: row.purchase_order_status_code === "RECEIVED" ? "FULL_RECEIPT" : "ORDER_PLACED",
        source_file_version,
        publication_safety_flag: PUBLICATION_SAFETY_FLAG,
        load_timestamp_utc: loadTimestampUtc,
      },
    ];
    return rows;
  });
}

function buildLogisticsDecisionQueue({
  demandLines,
  latestInventoryRows,
  openDemandByProduct,
  productByKey,
  accountByKey,
  locationByKey,
  primaryLocationByProduct,
  transferRuleByPair,
  serviceRuleByLocationRegion,
  serviceRegionCodes,
  decisionDate,
  source_file_version,
  loadTimestampUtc,
}) {
  const transferRows = buildTransferDecisionRows({
    latestInventoryRows,
    openDemandByProduct,
    productByKey,
    locationByKey,
    transferRuleByPair,
    decisionDate,
    source_file_version,
    loadTimestampUtc,
  });
  const fulfillmentRows = demandLines
    .filter((row) => Number(row.open_qty ?? 0) > 0 || Number(row.delivered_qty ?? 0) > 0)
    .sort((left, right) => right.event_date.localeCompare(left.event_date))
    .slice(0, 72)
    .map((row, index) => {
      const account = accountByKey.get(row.account_sk) ?? {};
      const serviceRegionCode = serviceRegionForKey(account.service_network_code ?? row.account_sk, serviceRegionCodes);
      const locationSk = primaryLocationByProduct.get(row.product_sk);
      const serviceRule = serviceRuleByLocationRegion.get(`${locationSk}|${serviceRegionCode}`);
      const recommendedQty = Number(row.open_qty ?? 0) || Number(row.delivered_qty ?? 0);
      return {
        logistics_decision_line_sk: stableId("LGQ", `${row.demand_line_sk}|fulfillment`),
        decision_date: row.event_date,
        decision_type_code: "FINAL_SALE_FULFILLMENT",
        recommendation_status_code: index < 48 ? "APPROVED" : "RECOMMENDED",
        product_sk: row.product_sk,
        origin_inventory_location_sk: locationSk,
        demand_line_sk: row.demand_line_sk,
        account_sk: row.account_sk,
        recommended_qty: recommendedQty,
        approved_qty: index < 48 ? recommendedQty : 0,
        planned_execution_date: row.event_date,
        expected_completion_date: addIsoDays(row.event_date, serviceRule?.service_lead_time_days ?? 3),
        cost_amount_usd: roundMoney(recommendedQty * unitCostForProduct(productByKey.get(row.product_sk))),
        decision_reason_code: Number(row.open_qty ?? 0) > 0 ? "FULFILL_OPEN_DEMAND" : "SERVICE_LEAD_TIME_RISK",
        source_file_version,
        publication_safety_flag: PUBLICATION_SAFETY_FLAG,
        load_timestamp_utc: loadTimestampUtc,
      };
    });

  return {
    decisionRows: [...transferRows, ...fulfillmentRows],
  };
}

function buildTransferDecisionRows({
  latestInventoryRows,
  openDemandByProduct,
  productByKey,
  locationByKey,
  transferRuleByPair,
  decisionDate,
  source_file_version,
  loadTimestampUtc,
}) {
  const byProduct = groupBy(latestInventoryRows, (row) => row.product_sk);
  const rows = [];
  for (const [productSk, productRows] of byProduct.entries()) {
    const serviceRows = productRows.filter((row) =>
      SERVICE_CAPABLE_NODE_TYPES.has(locationByKey.get(row.inventory_location_sk)?.node_type_code),
    );
    if (serviceRows.length < 2) {
      continue;
    }
    const high = [...serviceRows].sort((left, right) =>
      Number(right.available_qty ?? 0) - Number(left.available_qty ?? 0),
    )[0];
    const low = [...serviceRows].sort((left, right) =>
      Number(left.available_qty ?? 0) - Number(right.available_qty ?? 0),
    )[0];
    if (!high || !low || high.inventory_location_sk === low.inventory_location_sk) {
      continue;
    }
    const openDemandQty = openDemandByProduct.get(productSk)?.open_qty ?? 0;
    const transferQty = Math.min(
      Math.max(Math.round(Number(high.available_qty ?? 0) * 0.15), 1),
      Math.max(openDemandQty - Number(low.available_qty ?? 0), 1),
    );
    if (transferQty <= 0) {
      continue;
    }
    const transferRule = transferRuleByPair.get(`${high.inventory_location_sk}|${low.inventory_location_sk}`);
    const product = productByKey.get(productSk) ?? {};
    rows.push({
      logistics_decision_line_sk: stableId("LGQ", `${productSk}|${high.inventory_location_sk}|${low.inventory_location_sk}`),
      decision_date: decisionDate,
      decision_type_code: "INVENTORY_TRANSFER",
      recommendation_status_code: rows.length < 16 ? "APPROVED" : "RECOMMENDED",
      product_sk: productSk,
      origin_inventory_location_sk: high.inventory_location_sk,
      destination_inventory_location_sk: low.inventory_location_sk,
      recommended_qty: transferQty,
      approved_qty: rows.length < 16 ? transferQty : 0,
      planned_execution_date: decisionDate,
      expected_completion_date: addIsoDays(decisionDate, transferRule?.transfer_lead_time_days ?? 3),
      cost_amount_usd: roundMoney(transferQty * unitCostForProduct(product)),
      decision_reason_code: "TRANSFER_BALANCE",
      source_file_version,
      publication_safety_flag: PUBLICATION_SAFETY_FLAG,
      load_timestamp_utc: loadTimestampUtc,
    });
    if (rows.length >= 24) {
      break;
    }
  }
  return rows;
}

function buildInventoryMovementLines({
  logisticsRows,
  transferRuleByPair,
  productByKey,
  source_file_version,
  loadTimestampUtc,
}) {
  return logisticsRows
    .filter((row) => row.decision_type_code === "INVENTORY_TRANSFER" && row.recommendation_status_code === "APPROVED")
    .map((row, index) => {
      const transferRule = transferRuleByPair.get(
        `${row.origin_inventory_location_sk}|${row.destination_inventory_location_sk}`,
      );
      const product = productByKey.get(row.product_sk) ?? {};
      const status = index % 3 === 0 ? "RECEIVED" : "IN_TRANSIT";
      const receivedQty = status === "RECEIVED" ? row.approved_qty : 0;
      return {
        inventory_movement_line_sk: stableId("MOV", row.logistics_decision_line_sk),
        logistics_decision_line_sk: row.logistics_decision_line_sk,
        product_sk: row.product_sk,
        origin_inventory_location_sk: row.origin_inventory_location_sk,
        destination_inventory_location_sk: row.destination_inventory_location_sk,
        ship_date: row.planned_execution_date,
        expected_arrival_date: row.expected_completion_date,
        actual_arrival_date: status === "RECEIVED" ? row.expected_completion_date : undefined,
        movement_qty: row.approved_qty,
        shipped_qty: row.approved_qty,
        received_qty: receivedQty,
        in_transit_qty: row.approved_qty - receivedQty,
        unit_cost_amount: unitCostForProduct(product),
        movement_cost_amount_usd: roundMoney(row.approved_qty * unitCostForProduct(product)),
        movement_status_code: status,
        movement_type_code:
          transferRule?.transfer_mode_code === "CONTROLLED_TRANSFER"
            ? "CONTROLLED_TRANSFER"
            : "INVENTORY_TRANSFER",
        source_file_version,
        publication_safety_flag: PUBLICATION_SAFETY_FLAG,
        load_timestamp_utc: loadTimestampUtc,
      };
    });
}

function buildSalesFulfillmentLines({
  demandLines,
  productByKey,
  accountByKey,
  primaryLocationByProduct,
  serviceRuleByLocationRegion,
  serviceRegionCodes,
  source_file_version,
  loadTimestampUtc,
}) {
  return demandLines
    .filter((row) => Number(row.delivered_qty ?? 0) > 0 || Number(row.open_qty ?? 0) > 0)
    .map((row) => {
      const product = productByKey.get(row.product_sk) ?? {};
      const account = accountByKey.get(row.account_sk) ?? {};
      const locationSk = primaryLocationByProduct.get(row.product_sk);
      const serviceRegionCode = serviceRegionForKey(account.service_network_code ?? row.account_sk, serviceRegionCodes);
      const serviceRule = serviceRuleByLocationRegion.get(`${locationSk}|${serviceRegionCode}`);
      const unitCost = unitCostForProduct(product);
      const fulfilledQty = Number(row.delivered_qty ?? 0);
      const backorderedQty = Number(row.open_qty ?? 0);
      const serviceLeadTimeDays = serviceRule?.service_lead_time_days ?? 3;
      const plannedDeliveryDate = addIsoDays(row.event_date, serviceLeadTimeDays);
      return {
        sales_fulfillment_line_sk: stableId("FUL", row.demand_line_sk),
        demand_line_sk: row.demand_line_sk,
        product_sk: row.product_sk,
        account_sk: row.account_sk,
        fulfillment_inventory_location_sk: locationSk,
        ship_date: row.event_date,
        planned_delivery_date: plannedDeliveryDate,
        actual_delivery_date: fulfilledQty > 0 ? plannedDeliveryDate : undefined,
        fulfilled_qty: fulfilledQty,
        backordered_qty: backorderedQty,
        service_lead_time_days: serviceLeadTimeDays,
        unit_cost_amount: unitCost,
        cogs_amount: roundMoney(fulfilledQty * unitCost),
        fulfillment_status_code: backorderedQty > 0
          ? (fulfilledQty > 0 ? "SHIPPED" : "BACKORDERED")
          : "DELIVERED",
        source_file_version,
        publication_safety_flag: PUBLICATION_SAFETY_FLAG,
        load_timestamp_utc: loadTimestampUtc,
      };
    });
}

function normalizeStockingRows({
  planProductLocationStocking,
  inventorySnapshots,
  productByKey,
  locationByKey,
}) {
  if (planProductLocationStocking.length > 0) {
    return planProductLocationStocking.map((row) => ({
      ...row,
      location: locationByKey.get(row.inventory_location_sk),
    }));
  }
  const latestSnapshotDate = latestValue(inventorySnapshots, "snapshot_date");
  const latestRows = inventorySnapshots.filter((row) => row.snapshot_date === latestSnapshotDate);
  return latestRows.map((row, index) => ({
    product_sk: row.product_sk,
    inventory_location_sk: row.inventory_location_sk,
    product_family_code: productByKey.get(row.product_sk)?.product_family_code ?? "UNCLASSIFIED",
    node_type_code: locationByKey.get(row.inventory_location_sk)?.node_type_code ?? "UNKNOWN",
    stocking_rank: index + 1,
    primary_service_flag: index === 0,
  }));
}

function buildPrimaryLocationByProduct(latestInventoryRows, locationByKey) {
  const byProduct = groupBy(latestInventoryRows, (row) => row.product_sk);
  return new Map(
    [...byProduct.entries()].map(([productSk, rows]) => {
      const chosen =
        rows
          .filter((row) => SERVICE_CAPABLE_NODE_TYPES.has(locationByKey.get(row.inventory_location_sk)?.node_type_code))
          .sort((left, right) => Number(right.available_qty ?? 0) - Number(left.available_qty ?? 0))[0]
        ?? rows[0];
      return [productSk, chosen?.inventory_location_sk];
    }),
  );
}

function rollupOpenDemandByProduct(demandLines) {
  const rollup = new Map();
  for (const row of demandLines) {
    const bucket = rollup.get(row.product_sk) ?? { open_qty: 0, open_value: 0 };
    bucket.open_qty += Number(row.open_qty ?? 0);
    bucket.open_value += Number(row.demand_value_proxy ?? 0);
    rollup.set(row.product_sk, bucket);
  }
  return rollup;
}

function supplierClassForProduct(product) {
  if (product.product_family_code === "CONTROLLED_ITEM") {
    return "SPECIALTY_SUPPLIER";
  }
  if (product.product_family_code === "UNCLASSIFIED") {
    return "BACKUP_SUPPLIER";
  }
  return "CORE_SUPPLIER";
}

function transferModeForLocations(origin, destination) {
  if (origin.node_type_code === "THIRD_PARTY_NODE" || destination.node_type_code === "THIRD_PARTY_NODE") {
    return "THIRD_PARTY_TRANSFER";
  }
  if (origin.node_type_code === "RESTRICTED_AREA" || destination.node_type_code === "RESTRICTED_AREA") {
    return "CONTROLLED_TRANSFER";
  }
  if (origin.node_type_code === "TRANSIT_NODE" || destination.node_type_code === "TRANSIT_NODE") {
    return "EXPEDITED_TRANSFER";
  }
  return "STANDARD_TRANSFER";
}

function transferLeadTimeDays(origin, destination) {
  const base = origin.site_code === destination.site_code ? 1 : 3;
  return base + stableIndex(`${origin.inventory_location_sk}|${destination.inventory_location_sk}`, 4);
}

function leadTimeDaysForProduct(product, nodeTypeCode) {
  const base = {
    SHORT: 4,
    MEDIUM: 8,
    LONG: 14,
    UNKNOWN: 10,
  }[product.lead_time_band] ?? 8;
  return base + (nodeTypeCode === "THIRD_PARTY_NODE" ? 2 : 0);
}

function minimumOrderQtyForFamily(productFamilyCode) {
  return {
    SMALL_PART: 40,
    KIT_ASSEMBLY: 6,
    BULKY_ITEM: 10,
    CONTROLLED_ITEM: 8,
    UNCLASSIFIED: 4,
    STANDARD_COMPONENT: 12,
  }[productFamilyCode] ?? 8;
}

function orderMultipleForFamily(productFamilyCode) {
  return {
    SMALL_PART: 10,
    KIT_ASSEMBLY: 2,
    BULKY_ITEM: 2,
    CONTROLLED_ITEM: 2,
    UNCLASSIFIED: 1,
    STANDARD_COMPONENT: 4,
  }[productFamilyCode] ?? 1;
}

function unitCostForProduct(product = {}) {
  const baseValue = FAMILY_UNIT_VALUE[product.product_family_code] ?? 28;
  const costFactor = product.product_family_code === "CONTROLLED_ITEM" ? 0.72 : 0.68;
  return roundMoney(baseValue * costFactor);
}

function serviceRegionForKey(key, serviceRegionCodes) {
  if (!serviceRegionCodes.length) {
    return "UNKNOWN";
  }
  return serviceRegionCodes[stableIndex(String(key), serviceRegionCodes.length)];
}

function regionCode(label) {
  return `REGION_${stableCodeSegment(`region|${label}`, 6)}`;
}

function stableId(prefix, key) {
  return `${prefix}_SK_${stableCodeSegment(`${prefix}|${key}`, 12)}`;
}

function stableRuleId(prefix, key) {
  return `${prefix}_${stableCodeSegment(`${prefix}|${key}`, 12)}`;
}

function stableDashCode(prefix, key) {
  return `${prefix}-${stableCodeSegment(`${prefix}|${key}`, 6)}`;
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

function pickDeterministicRow(rows, seed) {
  if (!rows?.length) {
    return null;
  }
  return [...rows].sort((left, right) =>
    stableId("SORT", JSON.stringify(left)).localeCompare(stableId("SORT", JSON.stringify(right))),
  )[stableIndex(seed, rows.length)];
}

function groupBy(rows, keyFn) {
  const grouped = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    const bucket = grouped.get(key) ?? [];
    bucket.push(row);
    grouped.set(key, bucket);
  }
  return grouped;
}

function latestValue(rows, fieldName) {
  return rows.map((row) => row[fieldName]).filter(Boolean).sort().at(-1) ?? "";
}

function addIsoDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function roundUpToMultiple(value, multiple) {
  return Math.ceil(value / multiple) * multiple;
}

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

function titleCaseCode(value) {
  return String(value)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
