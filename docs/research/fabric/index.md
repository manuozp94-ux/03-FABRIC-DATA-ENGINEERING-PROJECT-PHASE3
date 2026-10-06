# Microsoft Fabric Research Hub

Last seeded: 2026-03-25
Owner: Manuel
Scope: official Microsoft Fabric learning and documentation sources for study, implementation, and portfolio alignment

## Purpose

This folder is the working research hub for Microsoft Fabric study material in this repo.

It is intentionally links-first and notes-first:

- Keep official source URLs and verification dates in a registry.
- Distill each important source into short notes we can actually reuse.
- Save files in `official-assets/` only when Microsoft publishes a direct downloadable asset such as a PDF, poster, or workbook.
- Avoid bulk mirroring of Microsoft Learn HTML pages because the content changes often and stale copies become misleading quickly.

## Folder Layout

- `source-registry.md`: curated list of official Microsoft Learn sources and certification resources.
- `distilled-notes/`: short summaries, study notes, decision takeaways, and gap tracking.
- `official-assets/`: only direct-download official files and their metadata.

## Starter Tracks

The current starter set is organized around the areas most relevant to this project:

1. Certification and exam prep
2. Fabric fundamentals
3. Data engineering and lakehouse implementation
4. Ingestion and orchestration
5. Security, governance, and administration
6. Real-Time Intelligence

## Working Rules

- Prefer official Microsoft Learn and Microsoft certification pages.
- Record `last updated` only when the source explicitly surfaces it.
- Always record `last verified` when we manually check a source.
- Write distilled notes in our own words.
- Treat web pages as canonical; local files are convenience artifacts only.

## Suggested Next Moves

1. Extend the note set beyond the seeded DP-700 study guide note.
2. Create a note that maps DP-700 topics to this repo's Fabric implementation goals.
3. Add direct-download assets only if Microsoft provides them as standalone files.
4. Refresh `source-registry.md` before major study sprints.

## Quick Links

- [Source Registry](./source-registry.md)
- [Distilled Notes](./distilled-notes/README.md)
- [Seeded DP-700 Note](./distilled-notes/dp-700-study-guide.md)
- [Official Assets Policy](./official-assets/README.md)
