# Media Prompt Library

Date: 2026-03-25
Purpose: Maintain reusable prompts and prompt structures for generating visuals, video concepts, social assets, and supporting media tied to the portfolio and brand strategy.

## Prompt Design Rules

Every media prompt should define:
- target audience
- channel
- purpose
- visual tone
- source artifact or message pillar
- CTA context

Media should reinforce one of the following:
- transformation capability
- business value
- technical credibility
- clarity of explanation

## Brand Guardrails

Avoid visuals that suggest:
- generic AI marketing fluff
- fake enterprise screenshots
- identifiable customer or company branding
- exaggerated futuristic imagery with no business relevance

Prefer visuals that suggest:
- structure
- operational complexity
- modern analytical systems
- calm authority
- clarity and intention

## Prompt Templates

### 1. LinkedIn Static Visual Prompt

Use when:
- creating a supporting image for a written LinkedIn post

Template:
- Create a clean professional social visual for LinkedIn.
- Audience: {audience}
- Message: {core_message}
- Tone: analytical, modern, credible, not hype-driven.
- Visual direction: abstract data architecture, operational flows, inventory nodes, product-family structure, and business decision context.
- Avoid logos, identifiable brands, dashboards with readable confidential data, and stock-photo corporate clichés.
- Use a visual style that feels sharp, structured, and calm.
- Include space for a short headline overlay.

### 2. Carousel Concept Prompt

Use when:
- creating a multi-slide educational or narrative LinkedIn carousel

Template:
- Generate a carousel concept for LinkedIn with {n_slides} slides.
- Audience: {audience}
- Goal: {goal}
- Theme: {theme}
- Each slide should have one clear message.
- Style: modern analytical storytelling, clean layouts, strong hierarchy, minimal clutter.
- Suggested sequence: problem, why it matters, framework, example, implication, CTA.

### 3. Short Commercial Video Prompt

Use when:
- generating a promo concept or storyboard for a short commercial clip

Template:
- Create a short professional video concept for {channel}.
- Audience: {audience}
- Goal: communicate the value of a modern Fabric-native analytics transformation.
- Narrative focus: from fragmented operational analytics to governed decision-ready products.
- Visual tone: cinematic but grounded, business-relevant, structured, not flashy for its own sake.
- Show themes such as disconnected files, operational complexity, architecture, inventory readiness, and business value.
- End with a subtle professional CTA.

### 4. Short Tutorial Video Prompt

Use when:
- planning an explainer clip or short educational video

Template:
- Create a short tutorial concept for {topic}.
- Audience: {audience}
- Goal: explain one analytical or architectural idea clearly in under {duration}.
- Visuals should support understanding, using diagrams, clean labels, and simple flow representations.
- Avoid overproduced effects or unrelated motion.
- End with one practical takeaway and a CTA to the broader portfolio.

### 5. Thumbnail Prompt

Use when:
- generating a still image or thumbnail for video content

Template:
- Create a thumbnail concept for a professional analytics video.
- Topic: {topic}
- Style: bold, clean, high contrast, readable at small size.
- Avoid clickbait expressions and generic influencer aesthetics.
- Visual cues may include architecture diagrams, inventory maps, product-family shapes, or abstract data flow imagery.
- Reserve clear space for 3 to 6 words of text.

### 6. Portfolio Launch Prompt

Use when:
- generating visuals for a portfolio or case-study launch post

Template:
- Create a launch visual for a Microsoft Fabric portfolio case study.
- Audience: recruiters, hiring managers, and consulting prospects.
- Message: this is a serious case-study platform grounded in real operational complexity.
- Tone: professional, high-trust, analytical, modern.
- Show transformation from fragmented evidence to a governed analytical product.

### 7. Repurposing Prompt

Use when:
- converting one asset into multiple media formats

Template:
- Starting from this source artifact: {source_artifact}
- Generate ideas for:
  - one LinkedIn visual
  - one short commercial concept
  - one short tutorial concept
  - one carousel concept
- Keep all versions aligned to the same audience and CTA.

## Media Prompt Variables

Recommended reusable variables:
- `{audience}`
- `{channel}`
- `{goal}`
- `{theme}`
- `{core_message}`
- `{topic}`
- `{duration}`
- `{source_artifact}`
- `{cta}`

## Working Rule

No media prompt should be written in isolation.

Every prompt should point back to:
- a portfolio artifact
- a message pillar
- or a conversion goal

If it does not support one of those, it should not be prioritized.
