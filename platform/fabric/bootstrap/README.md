# Fabric Bootstrap

Status: active bootstrap reference
Last updated: 2026-03-30

## Purpose

This folder holds the public-safe bootstrap contract for the first live Fabric proof path in Phase 3.

It is intentionally limited to:

- placeholder-only environment structure
- access validation
- authentication and boundary notes

It does not retain:

- live secrets
- live deployment helpers
- private workspace internals
- report-definition payloads tied to unsafe business context

## Files

- `env.template`: canonical placeholder-only `FABRIC_*` contract
- `validate_access.sh`: validation-only helper for the `FABRIC_*` contract
- `ARCHITECTURE_AUTH_PACKAGE.md`: public-safe explanation of the bootstrap and control-plane pattern
- `migration_notes.md`: notes on what was reused from previous project phases and what remains intentionally external

## Current position

Confirmed in this repo:

- service-principal token minting against the Fabric API is the canonical control-plane path
- workspace targeting is part of the required contract
- the current Phase 3 workspace is reachable with the configured app registration

Still external by design:

- live report creation
- embed-token issuance
- capacity-specific embedding setup
- any private deployment or publishing helpers

## Usage

1. Keep live values outside Git.
2. Load the values locally into your shell.
3. Run `validate_access.sh`.
4. Use the validated contract to build the bounded Fabric proof path.
