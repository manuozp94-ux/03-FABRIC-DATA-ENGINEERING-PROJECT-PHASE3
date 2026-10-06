# Interviewer Q and A Sheet

Date: 2026-04-09  
Purpose: provide concise, interview-ready answers for the most likely follow-up questions

## 1. Tell me about yourself.

### Short answer

I am an Analytics Engineer and BI Lead with 7+ years of experience turning fragmented operational logic into governed decision-support systems. I started close to the business in warehouse, supply chain, and customer-facing work, then moved into KPI-driven analysis, BI modernization, and most recently a bounded Fabric proof that formalizes how I approach governance, modeling, and analytical delivery.

### Longer answer

Most of my work starts where operations become hard to read: manual processes, fragmented reporting, competing priorities, and teams working from different definitions of the same problem. My background grew from the floor upward, so I learned the business first, then built tools, then formalized those tools into BI and platform logic. That is why I am especially interested in roles where analytics has to be both technically sound and genuinely usable by the business.

## 2. Why are you a fit for a company moving from Azure and SQL toward Fabric?

### Short answer

Because the hard part is usually not the logo on the platform. The hard part is translating messy source logic into governed layers that stakeholders can trust. That is the pattern I have already been working on for years.

### Longer answer

The company context you described sounds like a relatively young data culture that is still formalizing definitions while moving toward Fabric capacity. That fits my background well. I have already worked through transitions from manual logic to BI logic, from fragmented reporting to more reusable governed layers, and from operational questions to structured semantic delivery. The platform emphasis changes, but the core work of clarifying grain, KPI logic, governance, and adoption is the same.

## 3. What exactly does your Fabric project prove?

### Short answer

It proves my method more than it proves enterprise scale. It is a bounded proof showing contract-first thinking, repo-side governance, Fabric-side medallion execution, semantic alignment, report proof, and release discipline.

### Longer answer

I am careful to describe it as a bounded proof, not a full enterprise platform claim. The project demonstrates how approved inputs, validation gates, Bronze/Silver/Gold responsibilities, runtime governance, semantic modeling, and a public-safe explanation layer can fit together coherently. For interview purposes, it is valuable because it makes my architecture and delivery thinking inspectable.

## 4. How do you use AI in your work without losing ownership?

### Short answer

I use AI as an execution amplifier, not as a replacement for judgment. The important decisions still stay human-led: scope control, architecture, validation gates, and what counts as acceptable proof.

### Longer answer

The strongest evidence of ownership is not that I used AI. It is the points where the work changed direction because judgment mattered. In the repo, the important moments were things like tightening scope, adding coherence gates, correcting the meaning of Bronze and Silver, and stopping the proof from overstating itself. AI helped move faster, but it did not make those decisions for me.

Support reference:

- `docs/professional-development/interview-defense-ai-assisted-bmad-and-repo-shape-2026-04-01.md`

## 5. Why does the repo have so many files?

### Short answer

Because it contains both delivery artifacts and AI-assisted working artifacts. In a standard enterprise environment I would separate those much more aggressively, but I would keep the underlying discipline.

### Longer answer

The useful thing to defend is not the raw file count. The useful thing to defend is the structure behind it: contracts, validation, checkpoints, release discipline, and explicit current-state versus target-state thinking. In a team setting I would keep the signal and reduce the operating exhaust.

Support reference:

- `docs/professional-development/interview-defense-ai-assisted-bmad-and-repo-shape-2026-04-01.md`

## 6. Explain your current versus target Fabric architecture.

### Short answer

Today the repo still governs and approves the bounded input package, while Fabric already executes Bronze, Silver, Gold, runtime governance, semantic modeling, and the proof surface. The target state is a cleaner medallion story where Bronze is more raw-like, Silver owns cleanup and conformance, Gold stays serving, and the long-term public truth comes from a bounded Fabric-derived extract.

### Longer answer

The safest way to explain it is as a two-plane system. The repo is the governance plane for approved inputs, validation, and release state. Fabric is the execution plane for medallion transformation and downstream proof assets. The current implementation is meaningful today, but it is also intentionally transitional, and I can explain that without blurring current state with target state.

Support reference:

- `docs/professional-development/current-vs-target-state-study-guide-2026-04-02.md`
- `docs/professional-development/architecture-digest-fabric-first-medallion-2026-04-02.md`

## 7. What is the strongest throughline across your career?

### Short answer

I keep turning repeated blockers into clearer systems people can use.

### Longer answer

That started as process improvement on the floor, then became Excel-based support tools, then KPI and business-rule tooling, then BI modernization, and now a governed Fabric proof. The tools changed, but the underlying motivation stayed the same: reduce confusion, reduce repeated friction, and help people do their jobs better.

## 8. What are you not claiming?

### Short answer

I am not claiming full enterprise Fabric administration, finance-grade production ownership, or a finished real-time operating platform.

### Longer answer

I prefer to be precise. The portfolio is a bounded proof. The earlier business work was real and cross-functional, but I do not need to exaggerate it into claims I cannot support. I would rather sound exact and credible than oversized and vague.

## 9. How would you approach your first 90 days in this kind of role?

### Short answer

I would start by clarifying business priorities and data definitions, then map current SQL and Azure assets to business questions, then define a staged Fabric landing and serving path so the migration is governed instead of purely technical.

### Longer answer

My first 90 days would focus on understanding the current decision pressure, not only the current stack. I would identify high-value source domains, clarify grains and KPI definitions, map which logic is already reusable versus embedded or fragile, and then help define a staged Fabric path that improves trust and adoption while the platform matures.

## 10. Closing line if the interview is moving fast

Use this:

> My career has been a progression from understanding the work on the ground to formalizing the logic behind it. The platform emphasis is moving toward Fabric, and that is exactly where my recent proof work and my earlier BI modernization experience come together.
