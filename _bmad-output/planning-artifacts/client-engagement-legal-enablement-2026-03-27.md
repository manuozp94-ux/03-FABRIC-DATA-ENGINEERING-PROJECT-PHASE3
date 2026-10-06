# Client Engagement & Legal Enablement

Date: 2026-03-27
Status: Planning artifact
Purpose: Define the reusable client-engagement, service-delivery, and jurisdiction-separated legal-documentation layer that supports future consulting work without expanding the current MVP beyond its intended scope.

## Why This Layer Exists

BMAD already provides strong guardrails for discovery, scope control, PRD development, architecture thinking, and implementation planning. What remains underdeveloped is the operating layer for client engagement:

- how work is scoped with a real client
- how data access and permissions are requested
- how metrics and business definitions are agreed
- how privacy and legal expectations are documented
- how changes, approvals, and handoff are handled

This layer should become a reusable delivery system that can support both:

- the current Fabric portfolio case study as the first exemplar
- future client work in other domains such as marketing, creator analytics, or community-management analytics

## Positioning Relative to the Current MVP

This layer is not part of the core Phase 1 analytical MVP. It sits beside the product as a support and enablement system.

Recommended phasing:

- Phase 1: Minimal public-facing legal readiness only if required for launch
- Phase 2: Shared client-engagement templates plus jurisdiction-separated Mexico and U.S. documentation packs
- Phase 3: Mature client-operating system with reusable agreements, onboarding, delivery, and handoff workflows

## Operating Principles

- Start from a bounded business question, not from tools or dashboards
- Keep raw or sensitive client evidence separate from publishable or client-ready artifacts
- Lock canonical grain and metric definitions early
- Treat privacy, permissions, and platform terms as delivery inputs, not as late-stage cleanup
- Version assumptions, definitions, approvals, and release notes alongside analytical work
- Distinguish internal working artifacts from client-ready deliverables
- Reuse structure and process across domains, but redesign semantics per domain

## Recommended Folder Structure

```text
docs/client-enablement/
  README.md
  shared/
    README.md
    discovery/
      README.md
    delivery/
      README.md
    correspondence/
      README.md
  mx-es/
    README.md
    public-facing/
      README.md
    commercial-private/
      README.md
    references/
      README.md
  us-en/
    README.md
    public-facing/
      README.md
    commercial-private/
      README.md
    references/
      README.md
```

## Shared Reusable Layer

These assets should be domain-agnostic and reused across future client projects.

### Discovery Templates

- client discovery brief
- business objective map
- decision-owner map
- source inventory and access checklist
- KPI dictionary template
- audience or stakeholder assumptions template
- scope boundaries and exclusions template

### Delivery Templates

- canonical grain and data-contract worksheet
- publication-safety and privacy review checklist
- validation runbook
- architecture story template
- release note template
- handoff summary template
- change-request and change-order template

### Correspondence Templates

- proposal cover email
- kickoff email
- data-access request email
- scope clarification email
- review-cycle email
- approval/signoff email
- invoice follow-up and payment reminder templates

## Mexico Pack (`mx-es`)

This pack should be drafted in Spanish and reviewed against current Mexico-law requirements before external use.

### Public-Facing Documents

- `aviso-de-privacidad.md`
- `terminos-del-sitio.md`
- `aviso-de-contacto-y-tratamiento.md`

### Commercial / Private Drafts

- `contrato-prestacion-servicios.md`
- `anexo-alcance-y-entregables.md`
- `plantilla-propuesta-comercial.md`
- `acuerdo-confidencialidad.md`
- `carta-de-onboarding.md`
- `plantilla-cambio-de-alcance.md`
- `plantilla-cierre-y-entrega.md`

### Reference Anchors

These are working legal anchors, not substitutes for legal review:

- Ley Federal de Proteccion de Datos Personales en Posesion de los Particulares (official Cámara de Diputados PDF)
- Lineamientos del Aviso de Privacidad (official DOF publication)
- SAT-facing professional-services and tax-treatment requirements should be checked manually before using commercial templates operationally

## U.S. Pack (`us-en`)

This pack should be drafted in English and reviewed before external use. The U.S. side should not be treated as one universal compliance pack. Contracts and privacy should use a deliberately chosen baseline.

### Public-Facing Documents

- `privacy-policy.md`
- `website-terms.md`
- `contact-and-data-handling-notice.md`

### Commercial / Private Drafts

- `independent-contractor-agreement.md`
- `statement-of-work.md`
- `proposal-template.md`
- `nda-template.md`
- `kickoff-letter.md`
- `change-order-template.md`
- `delivery-and-closeout-template.md`

### Reference Anchors

These are working legal anchors, not substitutes for legal review:

- U.S. Department of Labor guidance on worker misclassification
- IRS independent-contractor guidance
- California privacy baseline for public-site privacy notices and consumer-rights orientation

## What Is Reusable Across Domains

The following should transfer across future client cases:

- evidence-led scoping
- source inventory before design
- canonical grain-first modeling
- KPI definition discipline
- private prep layer vs client-ready layer
- validation checkpoints before release
- versioned change and release history
- signoff checkpoints

## What Must Change Per Client Domain

The following must be redesigned per client and per domain:

- entity model
- KPI definitions
- refresh cadence
- source mix
- privacy and permissions constraints
- audience language
- final delivery surface

For example, a marketing and community-management analytics client would pivot from product/location/inventory entities to content/post/channel/campaign/audience/engagement entities, and from operational readiness metrics to reach, engagement, retention, sentiment, and conversion metrics.

## Suggested Next Artifacts To Create

1. Shared discovery brief
2. Shared KPI dictionary template
3. Shared source inventory checklist
4. Shared validation runbook
5. Mexico public-facing privacy notice draft
6. U.S. public-facing privacy policy draft
7. Mexico commercial services-agreement draft
8. U.S. independent-contractor agreement draft

## Working Legal Note

This layer should be treated as:

- draft documentation
- process scaffolding
- review-ready templates

It should not be presented as formal legal advice or as guaranteed compliance without qualified review in the relevant jurisdiction.
