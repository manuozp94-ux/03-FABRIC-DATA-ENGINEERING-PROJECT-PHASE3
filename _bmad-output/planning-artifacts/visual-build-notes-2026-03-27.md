# Visual Build Notes

Date: 2026-03-27
Purpose: Preserve user preferences for the later visual-design and frontend build phase without expanding current architecture scope.

## Current Decision

The current planning priority remains technical architecture first, visual build second.

When the project reaches the visual-build phase, the process should intentionally give the user strong influence over the graphic and aesthetic direction while Codex translates that direction into buildable web implementation.

## Preferred Collaboration Model

- The user should not need deep web-development vocabulary to guide design decisions.
- The user will primarily communicate desired visual direction through references, adjectives, examples, dislikes, mood, and communication goals.
- Codex will translate those inputs into concrete layout, component, styling, interaction, and implementation decisions.
- The visual build should preserve the technical architecture and scope boundaries already established in PRD and architecture planning.

## AI Tools To Use During Visual Build

The following tools are approved as exploration aids for the later visual phase:

- Relume
- Figma Make
- v0

## How These Tools Should Be Used

- Use them to explore layout direction, visual hierarchy, page structure, wireframes, and aesthetic concepts.
- Do not treat them as the source of truth for product architecture.
- Do not let generated visuals override established scope, route responsibilities, accessibility needs, performance constraints, or publication-safety rules.
- Prefer a workflow where visual concepts are generated or explored externally, then reviewed by the user, then translated into repo-native implementation by Codex.

## Interpretation Rule For Later Phases

When the visual build begins:

1. Ask the user for visual references, likes, dislikes, mood, typography direction, color preferences, and examples.
2. If useful, encourage the user to use Relume, Figma Make, or v0 to generate references or rough prototypes.
3. Treat those outputs as design input, not final implementation.
4. Translate approved design direction into maintainable production code inside this repo.

## Practical Reminder

The user wants to trust Codex on web-development decisions while still retaining strong authorship over the website's graphic and aesthetic direction.
