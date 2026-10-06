# FAB001 Three-View Report Contract

- Report: `rpt_fab001_supply_chain_decision`
- Title: `FAB001 Operating Loop Decision Support`
- Label: `bounded proof`

## Intent

Show the three governed dashboard views downstream of the bounded operating loop without replacing the curated website.

## Visuals

### Sales Dashboard

Explain historical sales, consumption, and bounded margin behavior.

1. `card` - **Realized Revenue**
   Measure: `Realized Revenue`
2. `card` - **Realized Gross Margin**
   Measure: `Realized Gross Margin`
3. `card` - **Realized Margin Rate**
   Measure: `Realized Margin Rate`
4. `card` - **Fulfilled Qty**
   Measure: `Fulfilled Qty`
5. `line_chart` - **Realized Revenue Trend**
   Measure: `Realized Revenue`
   Dataset: `fact_sales_realization`
   Axis: `invoice_date`
6. `clustered_bar` - **Revenue by Product Family**
   Measure: `Realized Revenue`
   Dataset: `fact_sales_realization`
   Axis: `dim_product_family[product_family_name]`
7. `clustered_bar` - **Revenue by Account Pattern**
   Measure: `Realized Revenue`
   Dataset: `fact_sales_realization`
   Axis: `dim_account[account_pattern_class]`
8. `table` - **Customer Consumption Detail**
   Dataset: `fact_sales_realization`
   Columns: `dim_account[account_name], dim_account[customer_group], Fulfilled Qty, Realized Revenue, Realized Gross Margin`

### Supply Chain Decision Support

Connect demand pressure, recommendations, purchase orders, supplier lead times, and cost exposure.

1. `card` - **SC Approved Qty**
   Measure: `SC Approved Qty`
2. `card` - **Purchase Ordered Qty**
   Measure: `Purchase Ordered Qty`
3. `card` - **Open Purchase Qty**
   Measure: `Open Purchase Qty`
4. `card` - **Purchase Cost Amount**
   Measure: `Purchase Cost Amount`
5. `card` - **Queue-to-PO Traceability Rate**
   Measure: `Queue-to-PO Traceability Rate`
6. `clustered_bar` - **Open Purchase Cost by Supplier**
   Measure: `Purchase Cost Amount`
   Dataset: `fact_purchase_order_line`
   Axis: `dim_supplier[supplier_name]`
7. `clustered_bar` - **Approved Quantity by Product Family**
   Measure: `SC Approved Qty`
   Dataset: `fact_supply_chain_decision_queue_line`
   Axis: `dim_product_family[product_family_name]`
8. `table` - **Purchase Order Summary**
   Dataset: `fact_purchase_order_line`
   Columns: `purchase_order_code, dim_supplier[supplier_name], purchase_order_status_code, ordered_qty, received_qty, open_qty, purchase_cost_amount_usd`

### Inventory Decision Support

Explain location inventory posture and the logistics actions needed to support service.

1. `card` - **Available Qty**
   Measure: `Available Qty`
2. `card` - **Inventory Exposure**
   Measure: `Inventory Exposure`
3. `card` - **Movement In Transit Qty**
   Measure: `Movement In Transit Qty`
4. `card` - **Active Logistics Action Count**
   Measure: `Active Logistics Action Count`
5. `clustered_bar` - **Inventory Exposure by Location**
   Measure: `Inventory Exposure`
   Dataset: `slv_current_inventory_position`
   Axis: `dim_inventory_location[location_name]`
6. `clustered_bar` - **Approved Logistics Qty by Decision Type**
   Measure: `Logistics Approved Qty`
   Dataset: `fact_logistics_decision_queue_line`
   Axis: `decision_type_code`
7. `table` - **Location Action Summary**
   Dataset: `gold_inventory_location_action_summary`
   Columns: `location_name, action_status, on_hand_qty, available_qty, reserved_qty, in_transit_qty, inventory_value_proxy, active_logistics_action_count`
8. `table` - **Inventory Movement Detail**
   Dataset: `fact_inventory_movement_line`
   Columns: `movement_status_code, movement_type_code, ship_date, expected_arrival_date, movement_qty, in_transit_qty, movement_cost_amount_usd`


## Publication Boundary Notes

- Approved public-safe data only.
- Bounded proof, not an ERP replacement, optimizer, or public BI portal.
- Use request-access or authenticated embedding; do not use anonymous Publish to web.
- Subordinate to the technical-method route.
