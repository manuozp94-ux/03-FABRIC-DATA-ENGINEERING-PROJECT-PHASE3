# Power BI Development Portfolio Summary

These redacted screenshots show Power BI reports I developed for sales, margin, point-of-sale, and audit workflows in a distribution business environment. My work focused on transforming operational and financial data into decision-ready reporting, building semantic models and DAX measures, designing interactive report pages, and creating audit views that helped business stakeholders validate results.

Customer names, product names, company branding, IDs, and financial values have been blurred or removed for confidentiality.

## My Role

I worked as the Power BI developer responsible for report design, data modeling, transformation logic, measure development, visual layout, filtering experience, and validation support. The reports were built to help sales, finance, operations, and audit users analyze performance, review detailed transactions, and reconcile business activity across multiple data sources.

## Sales Performance Dashboard

I developed a multi-page Power BI sales dashboard used to analyze invoice volume, open orders, regional performance, customer/account performance, and product/category trends. The report included executive-level KPIs as well as operational detail pages for deeper review.

Key development work included:

- Built interactive pages for sales overview, regional analysis, open orders, invoice volume, and model documentation.
- Created slicers and navigation by year, quarter, month, region, account, customer group, and product.
- Developed KPI views for invoice volume, orders received, top grossing account, top grossing product, and open order amounts.
- Built visuals including pie charts, monthly bar charts, regional map analysis, ranked tables, and detailed transaction tables.
- Modeled related sales, invoice, customer, account, product, pricing, logistics, and report-type data to support cross-page filtering.
- Designed the report so leadership could move from high-level performance to supporting transaction detail in the same Power BI experience.

## Point-of-Sale Analysis Report

I developed a POS analysis report to review sales activity reported through point-of-sale data and compare performance across customers, installers, products, and regions. The report supported sales and finance analysis by summarizing top customers, top products, recent sales history, and detailed POS transactions.

Key development work included:

- Built report pages for POS filters, top grossing sales averages, product performance, customer history, and detailed data review.
- Created visuals for average sales by installer and product, including ranked charts, pie charts, and tabular history views.
- Developed views for four-month sales history by customer, product, and account.
- Added report filters for region, distribution account, installer, product, report year, and report month.
- Supported analysis of account and installer performance while protecting sensitive sales and customer-level detail.
- Organized the report to help users identify sales trends, validate POS activity, and export supporting detail when needed.

## General Margin Report

I developed a General Margin reporting suite to help finance and business users review margin calculations by region, account, and distribution account. The report combined revenue, rebate, SPA, COGS, and margin components into a structured Power BI experience with summary KPIs and detailed reconciliation tables.

Key development work included:

- Built report pages for margin overview, regional margin results, distribution account detail, point-of-sale support, SPA claim archive review, distributor SPA index, and model documentation.
- Developed margin-related measures for net revenue, rebates, SPA, COGS, GM1, GM2, miscellaneous margin components, and blended margin.
- Created KPI cards for high-level financial results and supporting tables for detailed account-level review.
- Added filters for accounting period, branch, region, account, installer, SPA agreement, and product.
- Modeled data across accounting period tables, GL report totals, account information, product information, POS data, SPA claim data, SharePoint archive data, and supporting reference tables.
- Included embedded report notes and business explanations so users could understand how the calculations were intended to be interpreted.

## SPA Claim Audit Report

I developed an SPA claim audit report to help users compare and reconcile SPA-related activity across multiple sources. The report was designed to support audit review by comparing internal SPA claim records, invoice documents, and GL account totals, then surfacing differences for investigation.

Key development work included:

- Built audit views comparing SPA claim archive totals, invoice document amounts, and GL account totals.
- Created reconciliation tables that showed account-level and invoice-level differences.
- Added business-rule documentation directly in the report so users could understand the audit process and validation logic.
- Built filters by accounting period and account to support focused investigation.
- Included detailed transaction views for invoice date, invoice ID, line item, product, invoice description, and net amount.
- Added navigation/action buttons to related audit resources and supporting claim archive materials.
- Designed the report to help finance and audit users identify mismatches, validate SPA credits, and document follow-up needs.

## Data Modeling and Report Architecture

Several screenshots also show the underlying Power BI model views. These demonstrate my work building relationships across operational, financial, and reference tables so the reports could support consistent filtering, detailed analysis, and reusable measures.

The modeling work included:

- Connecting fact-style tables such as sales orders, invoice volume, POS records, GL line items, SPA claims, and margin totals.
- Relating those tables to account, customer, product, accounting period, region, and report reference tables.
- Creating report-specific data structures that supported both summary KPIs and transaction-level drilldown.
- Maintaining model organization so future report pages and measures could be added without rebuilding the semantic layer from scratch.

## Summary

Across these reports, my Power BI development work included end-to-end report delivery: source data preparation, semantic modeling, DAX measure creation, report layout, navigation, filtering, validation, and stakeholder-ready presentation. The reports were designed to support real business workflows, including sales performance tracking, product and customer analysis, margin review, POS validation, and audit reconciliation.
