export const fabricProofAliases = {
  workspace: {
    alias: "Fabric Proof Workspace",
    technical: "fabric-portfolio-proof-dev",
    description: "The bounded Fabric workspace used for the live proof stack shown on the technical-method route.",
  },
  proofFamily: {
    alias: "Fabric Proof Family",
    technical: "fab001",
    description: "The short proof family identifier used across bounded bundle, semantic, and report artifacts.",
  },
  lakehouse: {
    alias: "Public Proof Lakehouse",
    technical: "lh_fab001_public_proof",
    description: "The Lakehouse that lands the coherence-approved public-safe package for the live proof path.",
  },
  semanticModel: {
    alias: "Supply Chain Decision Semantic Model",
    technical: "sm_fab001_supply_chain_decision",
    description: "The semantic layer that sits on top of the bounded proof Lakehouse for the inventory-readiness case.",
  },
  report: {
    alias: "Supply Chain Decision Proof Report",
    technical: "rpt_fab001_supply_chain_decision",
    description: "The current saved report shell used as the live proof surface for the MVP.",
  },
  notebook: {
    alias: "Loader Notebook",
    technical: "nb_fab001_lakehouse_loader",
    description: "The notebook-first loading path that refreshes the bounded Fabric proof tables.",
  },
  page: {
    alias: "Supply Chain Decision View",
    technical: "Supply Chain Decision View",
    description: "The first bounded report page kept aligned to the governed serving layer.",
  },
} as const;
