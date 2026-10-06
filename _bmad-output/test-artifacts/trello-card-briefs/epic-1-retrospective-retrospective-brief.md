# Retrospective Brief: Epic 1 Retrospective

## What This Retrospective Is
Capture what worked, what changed, and what to improve after Epic 1 is complete.

## Current Delivery State
- Retrospective state: Done
- Overall project progress: 34/34 stories done

## Explicit Project Detail
- Card intent: Capture what the epic taught us and what must carry forward into the next one.
- Intended outcome: Epic 1 was meant to produce one bounded, publication-safe analytical package that could be mirrored into the public site without leaking private structure, breaking contracts, or relying on ad hoc release behavior.
- Completed in the epic: Story 1.1 established the governed repo, Astro baseline, and delivery boundaries.
- Completed in the epic: Story 1.2 published safe dimensions with deterministic abstraction rules.
- Completed in the epic: Story 1.3 added bounded facts and proxy metrics with public-safe nomenclature.
- Completed in the epic: Story 1.4 introduced a fail-closed sync from the approved package into the web mirror.
- What went well: The epic stayed disciplined about boundaries. Public delivery, governed publication, and candidate validation remained clearly separated instead of drifting together.
- What went well: The team caught real governance issues during review rather than treating code review as a formality. The two strongest examples were the unrestricted sync boundary in Story 1.4 and the stale success-report path in Story 1.5.
- What went well: The package evolved from dimensions only to a believable analytical slice with facts, proxy metrics, candidate refresh behavior, and a public mirror without introducing runtime sprawl.
- Harder than expected: Naming and abstraction required more iteration than the first pass suggested. Several public field names and taxonomies were technically safe but still too close to the original business language.
- Harder than expected: Governance features were easy to describe but required deeper hardening in practice. The most meaningful review findings were not syntax issues; they were operational boundary problems.
- Harder than expected: The candidate lane created valuable safety, but it also introduced reporting responsibilities. It was not enough to fail safely; the system also had to leave honest evidence behind when a run failed.
- Action item: Product direction: Keep route responsibilities explicit so each Epic 2 page has one primary job in the reading sequence.
- Action item: Content and UX: Translate governed data and technical proof into public language that feels confident, not evasive.
- Action item: Engineering: Continue treating sync, validation, and release behavior as product features, not just internal scripts.
- Action item: Delivery discipline: Keep code review focused on boundary drift, false trust signals, and misleading public language.
- Closing takeaway: Epic 1 delivered the governed spine of the project successfully. The most important result is not only that a safe package exists, but that the project now has believable rules for promotion, validation, evidence, and recovery. That gives Epic 2 a stable surface to build a trustworthy public experience on top of.
