# Fabric Bootstrap and Control Plane Package

This package defines the public-safe bootstrap contract for the first live Fabric proof path in Phase 3.

It documents the generic Microsoft Entra and Microsoft Fabric control-plane pattern that remains safe to publish while environment-bound execution stays outside the active public surface.

## What Is Confirmed In This Repo

- `env.template` is the canonical placeholder-only environment contract for Fabric bootstrap.
- `validate_access.sh` is the canonical validation-only helper for the `FABRIC_*` contract.
- The retained public control-plane path uses Microsoft Entra service-principal client credentials to mint a short-lived Fabric bearer token at runtime.
- The current Phase 3 workspace is reachable through the Fabric REST API with the configured app registration.
- The public repo still does not retain live deployment helpers, embed-token services, detailed parity traces, or report-definition payloads.

## What Is Not Retained In This Repo

- live secrets
- live report item identifiers until created
- live embed-token code using private configuration
- detailed workspace inventories beyond bounded validation
- raw report definitions tied to unsafe business context

## Public-Safe Control Plane Model

| Plane | Public artifact in this repo | Purpose |
| --- | --- | --- |
| Identity contract | `env.template` | defines the `FABRIC_*` environment contract without live values |
| Bootstrap validation | `validate_access.sh` | validates the contract before live use |
| Technical proof route | `apps/public-site/src/pages/technical-method.astro` | explains the bounded proof surface and publication boundary |
| Live deployment execution | external runtime or later-phase private helper set | creates items, deploys reports, and issues embed tokens |

## Canonical Authentication Pattern

1. A secure local shell or runner provides:
   - `FABRIC_TENANT_ID`
   - `FABRIC_CLIENT_ID`
   - `FABRIC_CLIENT_SECRET`
   - `FABRIC_WORKSPACE_ID`
2. The caller mints a Fabric token from:
   - `https://login.microsoftonline.com/<tenant>/oauth2/v2.0/token`
   - `grant_type=client_credentials`
   - `scope=https://api.fabric.microsoft.com/.default`
3. The token is then used against:
   - `https://api.fabric.microsoft.com/v1/workspaces/<workspace-id>/...`

## Environment Contract

### Required

- `FABRIC_TENANT_ID`
- `FABRIC_CLIENT_ID`
- `FABRIC_CLIENT_SECRET`
- `FABRIC_WORKSPACE_ID`

### Optional or later-phase

- `FABRIC_WORKSPACE_NAME`
- `FABRIC_WAREHOUSE_NAME`
- `FABRIC_WAREHOUSE_DATABASE`
- `FABRIC_WAREHOUSE_SQL_ENDPOINT`
- `POWERBI_REPORT_ID`
- `POWERBI_PAGE_NAME`
- `FABRIC_BEARER_TOKEN`
- `FABRIC_API_BASE_URL`
- `SQLCMD_BIN`

## Current Readiness

At the time this package was created:

- tenant token minting succeeded
- workspace item enumeration succeeded
- the target workspace was reachable and empty

That means the bootstrap contract is viable, but the report artifact still needs to be created.

## Boundary Rule

The bootstrap package may validate access and document the control-plane pattern.
It must not become the place where private deployment internals, unsafe publish flows, or broad workspace dumps are retained.
