# MVP Visual Synthesis

Status: first-pass source
Last updated: 2026-04-01

## Placement Decisions

- Boundary view: `technical-method` route and public-site project map
- Operating workflow view: `technical-method` route and Fabric runbook
- Proof surface view: `technical-method` route and interview-facing explanation docs
- Inventory loop example: supporting doc only for now

## Boundary View

```mermaid
flowchart LR
    A[Private preparation] --> B[Governed analytics]
    B --> C[Public site]
    B --> D[Bounded Fabric proof]
```

## Operating Workflow View

```mermaid
flowchart LR
    A[Seed slice] --> B[Generation controls]
    B --> C[Representative package]
    C --> D[Coherence gate]
    D --> E[Fabric refresh]
    E --> F[Semantic model]
    F --> G[Report shell]
```

## Proof Surface View

```mermaid
flowchart TD
    A[Public site] --> B[Case-study route]
    A --> C[Technical-method route]
    C --> D[Bounded Fabric proof]
    D --> E[Public Proof Lakehouse]
    D --> F[Supply Chain Decision Semantic Model]
    D --> G[Supply Chain Decision Proof Report]
```

## Inventory Loop Example

```mermaid
flowchart LR
    A[Opening position] --> B[Inbound receipts]
    B --> C[Serviced demand]
    C --> D[Current snapshot posture]
```
