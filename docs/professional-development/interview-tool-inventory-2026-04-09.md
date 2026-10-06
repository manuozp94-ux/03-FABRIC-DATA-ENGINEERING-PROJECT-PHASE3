# Interview Tool Inventory

Date: 2026-04-09  
Purpose: keep the tooling story concrete, honest, and easy to explain in a mixed interview panel

## Use Rule

Only mention tools you can explain in plain language.
The point is not to list everything.
The point is to show how your tooling evolved with the maturity of the work.

## Lane 1: Historical Stack

| Tool or Platform | How it appeared in the work | Interview-safe phrasing |
| --- | --- | --- |
| Excel | Early planning, allocation, inventory support, and business-rule tooling | "A lot of the first decision-support tooling was Excel-based, but it was already moving toward repeatable business logic rather than one-off spreadsheets." |
| CSV exports | Main extraction path from the ERP in earlier phases | "I often started from ERP fact extracts in CSV form and then built summarized or rule-driven analytical layers on top." |
| SAP BusinessByDesign | ERP source for operational facts | "I learned how to work from SAP BusinessByDesign extracts and build analytical views around the operational data available there." |
| SharePoint Lists | Backing store for special-pricing agreement and approval workflows | "SharePoint Lists became part of the operational app layer when pricing and approval workflows needed something more structured than spreadsheets alone." |
| Power BI Service | Later BI delivery platform | "We moved more of the recurring analytical layer into Power BI Service as the work matured." |
| Dataflows | Source connection and reusable transformation path | "Dataflows helped move us away from fully manual file-driven reporting paths." |
| Datasets and semantic logic | Reusable modeled layer for reporting | "I started thinking more in terms of reusable semantic logic rather than report-by-report logic." |
| DAX | KPI and measure definition | "DAX became part of codifying business rules and recurring KPI logic in the BI layer." |
| Power Apps | UI layer for special-pricing agreement margin and approval workflows | "I used Power Apps to turn pricing and margin logic into an internal operational application rather than keeping it trapped in spreadsheets." |
| Power Fx | Formula language inside Power Apps | "Inside Power Apps, I used Power Fx as the formula layer behind the app's pricing, margin, and totals logic." |
| Power Automate | Approval and state-change workflow layer | "Power Automate handled workflow and approvals so the application could move from calculation into operational use." |
| OData and REST | Integration path from source systems into reporting-ready models | "I worked with OData and REST style access patterns to make source data more analytics-ready." |
| Workspace separation | Governance and audience control | "We started separating reporting and source logic more deliberately by workspace and business audience." |
| KPI governance | Definition alignment across teams | "A big part of the work was getting sales, supply chain, logistics, and finance to work from more consistent KPI logic." |

## Lane 2: Portfolio Stack

| Tool or Platform | How it appears in the repo | Interview-safe phrasing |
| --- | --- | --- |
| Node.js automation | Repo-side generation, promotion, materialization, and validation scripts | "Node.js handles a lot of the repo-side automation, rule materialization, and promotion flow in the proof." |
| JSON contracts | Explicit shape and governance of dimensions, facts, serving outputs, and runtime assets | "The project is contract-first, so data shape and publication boundaries are explicit instead of implicit." |
| Validation gates | Candidate checks, coherence gates, and release validation | "Unsafe outputs should stop before promotion, so validation is part of the method, not an afterthought." |
| Python Fabric API orchestration | OneLake upload, Lakehouse item creation, pipeline and notebook orchestration | "Python handles the Fabric API side of the proof, including upload and orchestration tasks." |
| PySpark notebooks | Bronze, Silver, and Gold transformation inside Fabric | "PySpark inside the loader notebook performs the medallion-side cleanup and serving derivation." |
| Delta Lakehouse tables | Persisted Fabric tables for Bronze, Silver, Gold, and runtime governance | "The proof lands and transforms data into Lakehouse tables rather than leaving the logic only in the web layer." |
| Semantic model | Downstream analytical model for the proof surface | "The project includes semantic-model alignment so the consumption layer follows the data logic." |
| DAX measure pack | Defined measures for the proof surface | "Measures are explicitly packaged rather than improvised directly in visuals." |
| Report shell | First bounded Power BI or Fabric proof surface | "The report shell stays downstream of the governed model and the Lakehouse serving layer." |
| Astro case-study surface | Business-first public explanation layer | "The web surface explains the business problem and technical method without relying only on a dashboard." |

## Simplest Summary To Say Out Loud

Use this if they ask for your tooling at a high level:

> Historically my work moved from Excel, ERP extracts, Power Platform applications, and Power BI toward more governed BI delivery. In the portfolio project, that same thinking becomes more explicit through contract-first automation, Fabric medallion execution, semantic modeling, and a public-safe case-study surface.

## Relevance To An Azure and SQL to Fabric Transition

If they ask why this stack is relevant to their environment, say:

> What carries over is not only the tool list. It is the ability to interpret source logic, define grains, formalize rules, create reusable layers, and then move those layers into a more governed platform. That is exactly the kind of work a young Fabric environment needs.
