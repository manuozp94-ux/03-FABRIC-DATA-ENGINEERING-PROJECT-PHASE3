# Fabric Compatibility Layer

Status: active compatibility layer with Epic 7 correction in progress
Last updated: 2026-04-02

## Purpose

This folder holds the bounded compatibility surface that turns the repo-approved input package into a Fabric-ready proof path.

Current roadmap note:

- The existing compatibility path remains valid as bounded proof evidence.
- The active correction now goes further: the repo-approved package should be treated as the approved Bronze input, Silver should own cleanup/conformance in Fabric, Gold should remain serving, and the long-term public truth should come from a bounded Fabric-derived serving extract.

The intent is explicit:

- do not calculate the core analytical view in Astro
- keep the repo-approved package as the governed input contract
- land that contract into a medallion-aligned Fabric proof path
- define the semantic model, measures, and first report page outside the web layer

## What lives here

- `scripts/land_fab001_lakehouse_tables.py`
  - exports the repo-approved Bronze input package into a notebook-first medallion bundle
  - writes Bronze as the transported seed plus local Silver/Gold reference outputs for verification
  - can optionally create the target Fabric Lakehouse

- `scripts/deploy_fab001_semantic_models.py`
  - generates the semantic-model contract and measure pack for the first proof surface

- `scripts/populate_fab001_core_visual_page.py`
  - generates the report-page contract for the first bounded Power BI / Fabric page

- `contracts/`
  - checked-in contracts for the semantic layer and first report page

## Current implemented shape

- Bronze: bounded raw-like transport copies of the 7 approved repo tables
- Silver: notebook-derived proof tables that now clean, normalize, conform, and enrich Bronze inside Fabric
- Gold: notebook-derived serving outputs used by the first bounded proof page

## Target shape now active in roadmap

- the repo `current` package should be treated as the approved Bronze input package during transition
- Bronze should preserve bounded controlled-realism traces rather than reading as the final clean public truth
- Silver should become the explicit cleanup and conformance layer inside Fabric
- Gold should remain the serving layer
- a real Fabric pipeline and runtime governance should continue to orchestrate and record the bounded runtime path
- runtime governance should explicitly record whether the Fabric public serving extract was produced and which public source mode is active
- the long-term public truth should come from a bounded Fabric-derived serving extract rather than from a direct repo mirror

## Bronze note

Current implemented truth:

- Fabric proof Bronze is now a landed bounded raw-like transport derived from the approved repo package.
- That means the current proof path is closer to the intended medallion teaching surface, but the repo package still remains the upstream approval plane during transition.

Target direction:

- Upstream private preparation and repo-side approval should preserve minimal controlled-realism traces in the approved Bronze input package.
- Fabric Bronze should land that bounded raw-like input.
- Fabric Silver should perform the meaningful cleanup and conformance work.

## Contract stance

The contract does **not** live in the CSV files.

- Canonical row contracts stay in `platform/fabric/contracts/*.schema.json`
- Fabric-side medallion intent lives in `05-compat/contracts/fab001_medallion_contract.json`
- The semantic layer contract lives in `05-compat/contracts/fab001_semantic_model_contract.json`
- The bounded runtime orchestration contract lives in `05-compat/contracts/fab001_runtime_pipeline_contract.json`
- CSV is only the bounded transport format for getting approved Bronze input rows into Fabric quickly
- The bounded target is contract-first governance plus runtime execution inside Fabric, with public truth eventually sourced from a bounded Fabric-derived serving extract

## First proof target

- Lakehouse: `lh_fab001_public_proof`
- Semantic model: `sm_fab001_supply_chain_decision`
- Report: `rpt_fab001_supply_chain_decision`
- First page: `Supply Chain Decision View`

## Important boundary

This layer is for the bounded Fabric proof only.
It must stay subordinate to the curated website and must use only approved
public-safe data.
