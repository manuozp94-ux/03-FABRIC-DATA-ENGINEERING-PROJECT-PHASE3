# Future Integration Decisions

Date: 2026-03-26
Purpose: Capture later-phase integration ideas that should be remembered without pulling them into the current MVP scope.

## Decision: CRM Platform as a Future Integration

### Current Decision

Do not make an actual CRM platform part of the current MVP.

Treat CRM as an optional future integration or second case-study extension.

### Why It Is Deferred

- The current MVP already has a sufficient account-context story through masked account and assignment data.
- The core MVP value is still the demand-to-inventory-readiness analytical story, not CRM system integration.
- Adding a live CRM platform now would increase setup, masking, and scope complexity faster than it would improve the MVP proof.

### When To Revisit

Revisit this idea when one of the following becomes a priority:

- demonstrating source-system integration as a portfolio strength
- showing CRM-to-Fabric ingestion patterns
- connecting account, opportunity, or service context to demand behavior
- creating a second case study focused on cross-system operational analytics

### Guardrails For Future Use

- CRM must remain outside current MVP scope unless the scope is formally expanded.
- Any CRM-loaded data must be masked or synthetic enough to prevent re-identification through account graphs, contact details, or opportunity histories.
- CRM should strengthen the analytical story, not replace it.
- If implemented later, position it as an integration extension rather than proof that the MVP requires a CRM to function.

### Preferred Future Positioning

If this is implemented later, frame it as:

- "optional future integration"
- "Phase 2 extension"
- or "separate CRM-to-Fabric case study"

### Practical Platform Note

If the project eventually includes a real CRM platform, prefer options that already have direct or clearly documented Microsoft Fabric connector support so the integration is easier to explain and defend.

Previously reviewed official Microsoft Learn references:

- Salesforce Objects connector: https://learn.microsoft.com/en-us/fabric/data-factory/connector-salesforce-objects-overview
- Dataverse connector: https://learn.microsoft.com/en-us/fabric/data-factory/connector-dataverse-overview
- Dynamics CRM connector: https://learn.microsoft.com/en-us/fabric/data-factory/connector-dynamics-crm-overview
- Fabric copy job connector overview: https://learn.microsoft.com/en-us/fabric/data-factory/copy-job-support
