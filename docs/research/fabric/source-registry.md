# Microsoft Fabric Official Source Registry

Last seeded: 2026-03-25
Source policy: official Microsoft domains only

## How To Read This Registry

- `Last updated` is filled only when the official page surfaced a specific date during verification.
- `Last verified` is the date the source link and title were checked for this repo.
- `Format` reflects the canonical form to study from. For most Fabric sources, that is a web page rather than a PDF.

## Priority Sources

| ID | Track | Resource | URL | Format | Last updated | Last verified | Why it matters |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FDE-001 | Certification | Microsoft Certified: Fabric Data Engineer Associate | https://learn.microsoft.com/en-us/credentials/certifications/fabric-data-engineer-associate/ | Web | 2026-01-26 | 2026-03-25 | Canonical certification page for the Fabric Data Engineer path. |
| FDE-002 | Certification | Study Guide for Exam DP-700: Implementing Data Engineering Solutions Using Microsoft Fabric | https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/dp-700 | Web | 2026-03-20 | 2026-03-25 | Highest-value exam scope source; good anchor for study planning and gaps. |
| FDE-003 | Fundamentals | Fabric fundamentals documentation | https://learn.microsoft.com/en-us/fabric/fundamentals/ | Web | Not surfaced in quick verification | 2026-03-25 | Main hub for core concepts, onboarding, terminology, and platform orientation. |
| FDE-004 | Training | Get started with Microsoft Fabric | https://learn.microsoft.com/en-us/training/paths/get-started-fabric/ | Web | Not surfaced in quick verification | 2026-03-25 | Broad entry path across analytics, lakehouse, pipelines, RTI, and admin basics. |
| FDE-005 | Data engineering | Fabric Data Engineering documentation | https://learn.microsoft.com/en-us/fabric/data-engineering/ | Web | Not surfaced in quick verification | 2026-03-25 | Primary documentation hub for notebooks, lakehouse, Spark, environments, and engineering workflows. |
| FDE-006 | Training | Implement a Lakehouse with Microsoft Fabric | https://learn.microsoft.com/en-us/training/paths/implement-lakehouse-microsoft-fabric/ | Web | Not surfaced in quick verification | 2026-03-25 | Strong implementation path for medallion, Spark, Delta, and lakehouse fundamentals. |
| FDE-007 | Training | Ingest data with Microsoft Fabric | https://learn.microsoft.com/en-us/training/paths/ingest-data-with-microsoft-fabric/ | Web | Not surfaced in quick verification | 2026-03-25 | Focused path for ingestion, pipelines, dataflows, Spark, and eventhouse entry points. |
| FDE-008 | Training | Orchestrate processes and data movement with Microsoft Fabric | https://learn.microsoft.com/en-us/training/modules/use-data-factory-pipelines-fabric/ | Web | Not surfaced in quick verification | 2026-03-25 | Good module-level source for pipelines and orchestration patterns. |
| FDE-009 | Security | Fabric security documentation | https://learn.microsoft.com/en-us/fabric/security/ | Web | Not surfaced in quick verification | 2026-03-25 | Security and governance hub for access, network, compliance, and Purview integration. |
| FDE-010 | Security | Security in Microsoft Fabric | https://learn.microsoft.com/en-us/fabric/security/security-overview | Web | 2025-05-11 | 2026-03-25 | High-level security posture summary; useful for architecture and governance framing. |
| FDE-011 | Security | Microsoft Fabric security fundamentals | https://learn.microsoft.com/en-us/fabric/security/security-fundamentals | Web | 2025-11-21 | 2026-03-25 | Deeper security architecture reference for admin and enterprise design decisions. |
| FDE-012 | Administration | Manage a Microsoft Fabric environment | https://learn.microsoft.com/en-us/training/paths/manage-microsoft-fabric-environment/ | Web | Not surfaced in quick verification | 2026-03-25 | Covers CI/CD, monitoring, security, and admin tasks in one learning path. |
| FDE-013 | Administration | Administer and govern Microsoft Fabric | https://learn.microsoft.com/en-us/training/paths/microsoft-fabric-admin-governance/ | Web | Not surfaced in quick verification | 2026-03-25 | Strong governance-oriented learning path for policy, monitoring, and secure operations. |
| FDE-014 | Streaming / RTI | Implement Real-Time Intelligence with Microsoft Fabric | https://learn.microsoft.com/en-us/training/paths/explore-real-time-analytics-microsoft-fabric/ | Web | Not surfaced in quick verification | 2026-03-25 | Tracks the streaming and RTI slice of the platform, which now appears in DP-700 scope. |
| FDE-015 | Lakehouse / Spark | Create, configure, and use an environment in Fabric | https://learn.microsoft.com/en-us/fabric/data-engineering/create-and-use-environment | Web | 2026-03-25 | 2026-03-25 | Practical reference for environments, runtimes, libraries, and Spark setup. |

## Downloadable Asset Policy

Do not assume every official study source has a PDF version.

For this repo:

- Use the web page as canonical when no direct downloadable file is published by Microsoft.
- Save a file into `official-assets/` only when Microsoft exposes a direct downloadable asset.
- When adding a file, also add a short metadata note with source URL, fetched date, and why the asset matters.

## Next Notes To Create

Recommended first distilled notes:

1. `dp-700-study-guide.md`
2. `fabric-fundamentals-map.md`
3. `lakehouse-and-ingestion-path.md`
4. `security-and-governance-baseline.md`
