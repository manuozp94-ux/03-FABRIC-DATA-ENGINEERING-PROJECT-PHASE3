# Architecture Self-Review Questions

Date: 2026-04-02  
Purpose: give you a lightweight self-check before and after major architecture changes

## Use this when

- a story changes the meaning of a data layer
- you feel the repo is getting harder to explain
- you want to make sure you still understand the project without relying on the assistant

## Questions

1. Can I explain where the base fact rows are generated today?
2. Can I explain what Bronze, Silver, and Gold each mean in this project?
3. Can I explain what is implemented today versus what is target-state only?
4. Can I explain why the public-site mirror is now considered transitional?
5. Can I explain what has to happen before the site can read a Fabric-derived serving extract?
6. Can I explain why Epic 6 is paused behind Epic 7?
7. Can I explain the project in under two minutes without opening the repo?

## If the answer is “no”

Go back to these documents in order:

1. [architecture-digest-fabric-first-medallion-2026-04-02.md](/Users/manuel.orozco/Desktop/CODEX%20PROJECTS/03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3/docs/professional-development/architecture-digest-fabric-first-medallion-2026-04-02.md)
2. [medallion-responsibilities-study-guide-2026-04-02.md](/Users/manuel.orozco/Desktop/CODEX%20PROJECTS/03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3/docs/professional-development/medallion-responsibilities-study-guide-2026-04-02.md)
3. [current-vs-target-state-study-guide-2026-04-02.md](/Users/manuel.orozco/Desktop/CODEX%20PROJECTS/03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3/docs/professional-development/current-vs-target-state-study-guide-2026-04-02.md)
4. [architecture-teach-back-playbook-2026-04-02.md](/Users/manuel.orozco/Desktop/CODEX%20PROJECTS/03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3/docs/professional-development/architecture-teach-back-playbook-2026-04-02.md)
