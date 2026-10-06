# Dimension Build Rules

## Purpose

This document records the public-safe abstraction and classification rules used by Story 1.2 to build the first governed dimensions.

## Public Label Conventions

- `dim_product.product_code` uses a stable hash-derived public code such as `PRD-4D6A2F`.
- `dim_product.product_name` uses family-safe readable labels such as `Service Kit 01`, `Anchor Fastener 08`, `Control Cabinet 03`, or `Unclassified Supply 02`.
- `dim_account.account_code` uses a stable hash-derived public code such as `ACC-8E3A1F`.
- `dim_account.account_name` uses readable public labels such as `North Field Service 01`, `Pacific Project Delivery 06`, or `Metro Channel Support 03`.
- `dim_account.customer_group` is a public-safe readable grouping field derived from account pattern behavior, currently bounded to `Field Service`, `Project Delivery`, `Channel Support`, and `Legacy Coverage`.
- `dim_inventory_location.site_code` uses a stable hash-derived public code such as `SITE-6A3C91`.
- `dim_inventory_location.location_code` uses a stable hash-derived public code such as `LOC-91BF2E`.
- `dim_inventory_location.location_name` uses node-safe labels such as `Transit Node 91BF2E` or `Unknown Inventory Node 7CC9A0`.
- `service_network_code` and `logistics_area_code` are transformed into neutral controlled values instead of copying raw source codes.
- Hash-derived public codes are stable for a given bounded source key, which prevents existing public-safe labels from being renumbered when new source rows appear later.
- `demand_pattern_class`, `planning_constraint_class`, and the supporting proxy columns in `dim_product` are normalized into abstract public-safe vocabularies derived from bounded source behavior rather than copied business taxonomy.
- `account_pattern_class` is normalized into abstract public-safe segments such as `RECURRING_SERVICE`, `PROJECT_BASED`, and `PARTNER_CHANNEL`.

## Explicit Fallbacks

- `product_family_code` may resolve to `UNCLASSIFIED` when source attributes do not support a safe deterministic family assignment.
- `customer_group` uses `Legacy Coverage` when the bounded source record does not support a safer deterministic public grouping.
- `forecasting_category`, `planning_model`, `service_network_code`, `fulfillment_context_code`, `node_type_code`, and `logistics_area_code` use `UNKNOWN` when the bounded source record lacks enough safe deterministic information.
- Numeric quantity attributes default to `0` when the bounded fixture data does not provide a valid non-negative value.

## Product Family Classification Logic

Evaluation order is deterministic and must remain stable:

1. `UNCLASSIFIED` when category, planning model, and forecasting category are all missing.
2. `KIT_ASSEMBLY` when the source category or name signals kit or bundle behavior.
3. `SMALL_PART` when the source category or name signals hardware or fastener behavior, or when `box_qty >= 200`.
4. `CONTROLLED_ITEM` when the planning model is constrained or the forecasting category is special.
5. `BULKY_ITEM` when `weight_value >= 25` or `pallet_qty >= 20`.
6. `STANDARD_COMPONENT` as the default public-safe operational family.

## Product Proxy Attribute Logic

- `demand_pattern_class` abstracts source forecasting behavior into `RECURRING_DEMAND`, `PROJECT_DEMAND`, `EXCEPTION_DEMAND`, or `UNKNOWN`.
- `planning_constraint_class` abstracts source planning behavior into `STANDARD_FLOW`, `PROJECT_SCOPED`, `CONTROLLED_FLOW`, or `UNKNOWN`.
- `inventory_policy_class`, `fulfillment_risk_class`, `lead_time_band`, `criticality_band`, `service_profile`, `value_density_band`, `unit_economic_band_code`, and `interchangeability_group_code` are deterministic public-safe proxies derived from product family, bounded source behavior, and non-sensitive quantity fields.
- `unit_economic_band_code` is synthetic and comparative only. It is not a real cost, price, margin, or profitability field.

## Node Type Vocabulary and Classification Logic

Allowed `node_type_code` values:

- `INTERNAL_WAREHOUSE`
- `THIRD_PARTY_NODE`
- `TRANSIT_NODE`
- `FLOOR_AREA`
- `RESTRICTED_AREA`
- `OVERFLOW_AREA`
- `UNKNOWN`

Evaluation order is deterministic and must remain stable:

1. `THIRD_PARTY_NODE` when ownership indicates external, partner, or 3PL handling.
2. `TRANSIT_NODE` when storage type or location naming indicates transit behavior.
3. `RESTRICTED_AREA` when storage type or naming indicates quarantine or restricted inventory.
4. `OVERFLOW_AREA` when storage type or naming indicates overflow behavior.
5. `FLOOR_AREA` when storage type or naming indicates floor storage behavior.
6. `INTERNAL_WAREHOUSE` when internal ownership or standard rack/bin behavior is present.
7. `UNKNOWN` as the final fallback.

## Publication Safety Guardrail

- Public outputs must preserve operational behavior without exposing raw product codes, branded product names, customer names, site names, warehouse brands, 3PL names, or raw location labels.
- Tracked source-of-truth rule documentation stays under `platform/fabric/contracts/`; private-prep remains a local-only ignored area.
