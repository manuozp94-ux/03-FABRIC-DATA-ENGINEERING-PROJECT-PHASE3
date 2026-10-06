# Fabric Proof Alias Map

Date: 2026-04-01
Status: active documentation alias layer

## Rule

Technical identifiers remain the source of truth for automation and live Fabric items.
Aliases exist to improve human-facing explanation in docs, diagrams, interviews, and public technical narrative.

## Canonical Alias Map

| Alias | Technical identifier | Usage rule |
| --- | --- | --- |
| Fabric Proof Workspace | `fabric-portfolio-proof-dev` | Use in human-facing architecture explanations. |
| Fabric Proof Family | `fab001` | Use when describing the bounded proof package family. |
| Public Proof Lakehouse | `lh_fab001_public_proof` | Use in docs and diagrams; keep technical id where precision matters. |
| Supply Chain Decision Semantic Model | `sm_fab001_supply_chain_decision` | Use in docs and interviews; keep technical id in automation contexts. |
| Supply Chain Decision Proof Report | `rpt_fab001_supply_chain_decision` | Use in route copy and proof docs. |
| Loader Notebook | `nb_fab001_lakehouse_loader` | Use in runbook prose; keep technical id for scripts and API traces. |
| Supply Chain Decision View | `Supply Chain Decision View` | This is already the human-facing page name and can stay unchanged. |

## Application Rules

- Prefer aliases in `technical-method`, project-map prose, and proof summaries.
- Prefer technical ids in scripts, manifests, fetched artifacts, and API-oriented runbooks.
- When both are useful, present alias first and technical id in parentheses.

## Non-Goals

- This map does not authorize live renames.
- This map does not replace existing contracts or fetched artifact names.
