# Fabric-First Medallion Vocabulary

Status: active terminology reference
Last updated: 2026-04-14

## Purpose

This file locks the canonical vocabulary for the current transition and the intended Fabric-first medallion direction.

Use these terms consistently across:

- active roadmap and story files
- contracts and runbooks
- automation docs
- public technical narrative

## Canonical Terms

### Safe source fixtures

Public-safe fixture inputs stored in the repo.

These are bounded seeds used to create archetypes and rules.
They are not raw enterprise source systems and not the final public truth.

### Seed archetype package

The small bounded package built in the repo from the safe source fixtures.

Purpose:

- provide a deterministic archetype set
- support generation rules and representative expansion
- remain separate from later public-serving truth

### Approved Bronze input package

The repo-approved package intended to feed Fabric Bronze.

During the current transition this package still sits at:

- `platform/fabric/publication/current/`

But its intended meaning is no longer “final public truth.”
Its intended meaning is:

- approved bounded input to the Fabric medallion path

### Fabric Bronze

The landed raw-like package inside Fabric.

Target meaning:

- the first bounded platform landing layer
- controlled realism traces may still be present here
- it is not yet the fully conformed analytical surface

### Fabric Silver

The conformance and cleanup layer inside Fabric.

Target meaning:

- normalization
- cleanup
- bounded deduplication
- schema alignment
- reference enrichment
- analytical interpretation needed before serving

### Fabric Gold

The serving and KPI-support layer inside Fabric.

Target meaning:

- decision-support outputs
- semantic-friendly aggregates
- bounded support tables

Gold is downstream of Silver and should not own the cleanup work that properly belongs in Silver.

### Fabric public serving extract

A bounded clean extract derived from Fabric serving outputs for public-site consumption.

Target meaning:

- future public/site truth
- downstream of the Fabric medallion path
- not a direct mirror of the repo-approved Bronze input package

### Runtime governance

The Fabric-side control plane for the bounded proof.

Includes:

- pipeline orchestration
- notebook execution identity
- `ctrl_*` runtime tables
- release linkage and recovery pointers

### Operating loop

The bounded decision and execution loop that explains how operational pressure becomes
analytical evidence.

Canonical sequence:

- demand pressure
- supply-chain or logistics recommendation
- approved order, movement, or fulfillment event
- inventory effect
- Gold serving output
- dashboard or public-site explanation

The operating loop is simulated and governed. It is not a transactional ERP, writeback
system, optimizer, or live control tower.

### Decision queue

An advisory queue of recommended supply-chain or logistics actions.

Decision queues do not change inventory by themselves.
They become inventory-relevant only when tied to an execution fact such as a purchase
order, inventory movement, or sales fulfillment event.

### Supply-chain decision queue

A recommendation lane for replenishment and purchase-order decisions.

Typical decisions:

- purchase product from a bounded supplier
- monitor a product-location risk
- defer replenishment when risk is not strong enough

### Logistics decision queue

A recommendation lane for inventory movement and final sales fulfillment decisions.

Typical decisions:

- transfer product between locations
- fulfill demand from an available location
- hold or monitor inventory when movement is not justified

### Purchase order line

An execution fact created from an approved supply-chain decision.

It represents a bounded product, supplier, receiving-location, quantity, cost, and
expected receipt date. It should not be collapsed into `fact_inventory_inbound`.

### Purchase order status history

The status trace for a purchase-order line.

It explains whether a line is planned, ordered, partially received, received, or
cancelled.

### Inventory movement line

An execution fact for inventory transferred between public-safe locations.

It should track origin, destination, shipped quantity, received quantity, in-transit
quantity, and expected arrival timing.

### Sales fulfillment line

An execution fact that ties a demand line to inventory consumption.

It explains which location fulfilled demand, when the shipment happened, how much was
fulfilled, and what quantity remains backordered.

### Supplier-product lead time

A governed rule that maps supplier, product, and receiving location to expected purchase
lead time and ordering constraints.

This is a public-safe supplier rule, not a real supplier contract.

### Location-transfer lead time

A governed rule that maps origin and destination inventory locations to expected
transfer timing.

It supports logistics planning without publishing real routes.

### Location-service lead time

A governed rule that maps a fulfillment location to a public-safe service region or
account service pattern.

It supports final sales fulfillment timing without publishing real customer geography.

### Public-safe service region

A deterministic synthetic region used for dashboard slicing.

It may preserve operational behavior, but it must not expose real customer, branch,
warehouse, supplier, or delivery geography.

## Defaults locked by this vocabulary

- Row generation remains repo-side for now.
- Fabric-native row generation is not yet claimed as active scope.
- Bronze realism is intentionally minimal and bounded:
  - naming drift
  - missing fields
  - mild duplicates
  - limited date or code inconsistency
- Public truth is downstream in Fabric, and the active site-facing source is the bounded Fabric serving extract.
- The repo publication mirror remains available only as a retained fallback boundary.
- The next visible win is a clearer operating loop, not more dashboard pages for their own sake.
- Recommendations and execution facts must stay separate so the proof does not imply every analytical signal became operational action.
