import type { LocalizedCopy } from "../localized";

const l = (en: string, es: string): LocalizedCopy => ({ en, es });

export const technicalMethodPageCopy = {
  meta: {
    title: l("Technical Method | Manuel A. Orozco", "Método Técnico | Manuel A. Orozco"),
    routeLabel: l("Technical Method", "Método Técnico"),
    routePurpose: l(
      "Use this page to inspect how the proof was bounded, governed, and connected to the business story.",
      "Usa esta página para revisar cómo la prueba fue acotada, gobernada y conectada con la historia de negocio.",
    ),
    pageHeading: l(
      "How the public proof stays reviewable, bounded, and technically credible.",
      "Cómo la prueba pública se mantiene revisable, acotada y técnicamente creíble.",
    ),
  },
  hero: {
    eyebrow: l("Technical method", "Método técnico"),
    title: l(
      "This page shows why the proof is trustworthy and where its boundaries are.",
      "Esta página muestra por qué la prueba es confiable y dónde están sus límites.",
    ),
    note: l(
      "A technical reviewer should be able to see the data path, the evidence boundary, and the governance choices without digging through internal materials.",
      "Un reviewer técnico debería poder ver el camino de datos, el boundary de evidencia y las decisiones de gobernanza sin tener que excavar en materiales internos.",
    ),
    whyItMattersEyebrow: l("Why it matters", "Por qué importa"),
    whyItMattersBody: l(
      "It gives enough technical evidence to inspect the work without burying the public site in internal detail.",
      "Da suficiente evidencia técnica para revisar el trabajo sin enterrar el sitio público en detalle interno.",
    ),
  },
  evidenceStats: {
    publishedTablesNote: l(
      "The public route reads a bounded serving extract plus source-slice metadata derived downstream from Fabric Gold.",
      "La ruta pública lee un serving extract acotado más metadata del source slice derivada aguas abajo desde Fabric Gold.",
    ),
    publishedRowsNote: l(
      "Enough volume to support the case without pretending to expose a whole enterprise history.",
      "Volumen suficiente para sostener el caso sin fingir que se expone toda una historia enterprise.",
    ),
    latestRefreshNote: l(
      "The technical route reflects the current governed serving extract and its approved-input provenance, not an unreviewed candidate run.",
      "La ruta técnica refleja el serving extract gobernado actual y su proveniencia de input aprobado, no una corrida candidata sin revisar.",
    ),
    policyProfilesNote: l(
      "A compact policy layer stays visible so readiness and coverage can be interpreted without reopening raw operational facts.",
      "Una capa compacta de política sigue visible para que readiness y coverage puedan interpretarse sin reabrir hechos operativos raw.",
    ),
  },
  methodOverview: {
    eyebrow: l("Method overview", "Resumen del método"),
    heading: l("What sits behind the public route", "Qué se encuentra detrás de la ruta pública"),
    intro: l(
      "The public site is the front door. Under it sits a governed package, a Fabric execution path, and a bounded extract built for review.",
      "El sitio público es la puerta de entrada. Debajo vive un paquete gobernado, una ruta de ejecución en Fabric y un extract acotado construido para revisión.",
    ),
    panels: [
      {
        title: l("The public source is the bounded serving extract", "La fuente pública es el bounded serving extract"),
        body: l(
          "The web experience reads a Fabric-derived serving extract mirrored into the site repo. That keeps the story grounded in governed evidence.",
          "La experiencia web lee un serving extract derivado de Fabric y espejeado en el repo del sitio. Eso mantiene la historia anclada en evidencia gobernada.",
        ),
      },
      {
        title: l("Bronze, Silver, and Gold have distinct responsibilities", "Bronze, Silver y Gold tienen responsabilidades distintas"),
        body: l(
          "Bronze lands the approved input, Silver handles cleanup and conformance, and Gold supports the serving layer that feeds the public extract.",
          "Bronze aterriza el input aprobado, Silver se encarga de limpieza y conformidad, y Gold soporta la capa de serving que alimenta el extract público.",
        ),
      },
      {
        title: l("Validation happens before promotion", "La validación ocurre antes de la promoción"),
        body: l(
          "Candidate refreshes stop before promotion. The public route should reflect approved evidence, not ad hoc release behavior.",
          "Los refreshes candidatos se detienen antes de la promoción. La ruta pública debe reflejar evidencia aprobada, no comportamiento ad hoc de release.",
        ),
      },
      {
        title: l("Non-public working material stays out", "El material de trabajo no público se queda fuera"),
        body: l(
          "This route explains the method behind the public proof. It does not expose every internal asset used to build it.",
          "Esta ruta explica el método detrás de la prueba pública. No expone cada asset interno usado para construirla.",
        ),
      },
      {
        title: l("The live Fabric proof stays subordinate", "La prueba live en Fabric se mantiene subordinada"),
        body: l(
          "The site is intentionally web-first. Fabric appears here as bounded technical proof, not as a separate public BI portal.",
          "El sitio es deliberadamente web-first. Fabric aparece aquí como prueba técnica acotada, no como un portal público separado de BI.",
        ),
      },
    ],
  },
  visualSynthesis: {
    eyebrow: l("Visual synthesis", "Síntesis visual"),
    heading: l(
      "A few compressed views explain the proof faster than a large architecture diagram.",
      "Unas cuantas vistas comprimidas explican la prueba más rápido que un gran diagrama de arquitectura.",
    ),
    intro: l(
      "These views are there to orient a reviewer quickly, not to replace the case or the technical evidence below.",
      "Estas vistas están ahí para orientar rápido a un reviewer, no para reemplazar el caso ni la evidencia técnica que aparece después.",
    ),
  },
  sourceSlice: {
    eyebrow: l("Approved source slice", "Source slice aprobado"),
    heading: l(
      "This case is built from a bounded set of public-safe source domains.",
      "Este caso está construido desde un conjunto acotado de dominios fuente public-safe.",
    ),
    intro: l(
      "The site does not need every internal source to explain the case. It needs the slice that supports the business question honestly.",
      "El sitio no necesita cada fuente interna para explicar el caso. Necesita el slice que soporta honestamente la pregunta de negocio.",
    ),
    boundaryHeading: l("What the public source boundary means", "Qué significa el boundary público de fuentes"),
  },
  zoneBoundary: {
    eyebrow: l("Three-zone boundary", "Boundary de tres zonas"),
    heading: l(
      "Non-public working material, governed analytics, and public delivery each have different jobs.",
      "El material de trabajo no público, la analítica gobernada y la entrega pública tienen trabajos distintos.",
    ),
    intro: l(
      "The proof stays credible only if those zones remain distinct.",
      "La prueba solo se mantiene creíble si esas zonas siguen siendo distintas.",
    ),
    cards: [
      {
        title: l("Private preparation zone", "Zona de preparación privada"),
        detail: l(
          "Historical reconstruction, overlap cleanup, raw interpretation, and sensitive business logic stay here. This zone prepares the case but is not part of the public surface.",
          "Aquí viven reconstrucción histórica, limpieza de traslapes, interpretación raw y lógica sensible de negocio. Esta zona prepara el caso, pero no forma parte de la superficie pública.",
        ),
      },
      {
        title: l("Governed analytics zone", "Zona de analítica gobernada"),
        detail: l(
          "Contracts, validated dimensions and facts, candidate refreshes, and approved packages live here. This is the controlled boundary between preparation and explanation.",
          "Aquí viven contratos, dimensiones y hechos validados, refreshes candidatos y paquetes aprobados. Este es el boundary controlado entre preparación y explicación.",
        ),
      },
      {
        title: l("Public delivery zone", "Zona de entrega pública"),
        detail: l(
          "The website reads a bounded Fabric-derived serving extract mirrored into the site repo. The approved repo package still matters as Bronze-input provenance, not as final public truth.",
          "El sitio lee un serving extract acotado derivado de Fabric y espejeado en el repo del sitio. El paquete aprobado en repo sigue importando como proveniencia de input Bronze, no como verdad pública final.",
        ),
      },
    ],
  },
  treatment: {
    eyebrow: l("Treatment categories", "Categorías de tratamiento"),
    heading: l(
      "The public model uses explicit transformation types, not one vague idea of masking.",
      "El modelo público usa tipos explícitos de transformación, no una idea vaga de masking.",
    ),
    intro: l(
      "Some elements can be published directly. Others are abstracted, grouped, or excluded to preserve the business behavior without exposing enterprise identity.",
      "Algunos elementos pueden publicarse directamente. Otros se abstraen, agrupan o excluyen para preservar el comportamiento de negocio sin exponer identidad enterprise.",
    ),
    categories: [
      {
        title: l("Public", "Público"),
        summary: l("Already safe enough to publish directly", "Ya suficientemente seguro para publicar directamente"),
        detail: l(
          "These fields describe operational behavior without carrying enterprise identity.",
          "Estos campos describen comportamiento operativo sin cargar identidad enterprise.",
        ),
      },
      {
        title: l("Masked", "Enmascarado"),
        summary: l("Identity-bearing labels replaced with stable neutral labels", "Etiquetas con identidad reemplazadas por etiquetas neutras estables"),
        detail: l(
          "Customer names, site names, and branded product labels become public-safe labels that preserve role and behavior.",
          "Nombres de clientes, sitios y productos con marca se vuelven etiquetas public-safe que preservan rol y comportamiento.",
        ),
      },
      {
        title: l("Economic layer", "Capa económica"),
        summary: l("Bounded realized metrics plus proxy context", "Métricas realizadas acotadas más contexto proxy"),
        detail: l(
          "The case combines fulfilled-line realized revenue, COGS, and gross margin with proxy comparative context for demand pressure and exposure.",
          "El caso combina ingresos, COGS y margen bruto realizados a nivel de líneas cumplidas con contexto proxy comparativo para presión de demanda y exposición.",
        ),
      },
      {
        title: l("Aggregated", "Agregado"),
        summary: l("Compressed views that explain patterns", "Vistas comprimidas que explican patrones"),
        detail: l(
          "The site surfaces grouped views such as demand concentration by family or customer group instead of every exploratory readout.",
          "El sitio muestra vistas agrupadas como concentración de demanda por familia o grupo de clientes en vez de cada readout exploratorio.",
        ),
      },
      {
        title: l("Omitted", "Omitido"),
        summary: l("Left out of the public package entirely", "Dejado completamente fuera del paquete público"),
        detail: l(
          "Raw filenames, internal references, person names, and disallowed commercial detail are excluded instead of weakly redacted.",
          "Raw filenames, referencias internas, nombres de personas y detalle comercial no permitido se excluyen en vez de redacción débil.",
        ),
      },
      {
        title: l("Non-public only", "Solo no público"),
        summary: l("Needed to prepare the case, but kept outside the public product", "Necesario para preparar el caso, pero fuera del producto público"),
        detail: l(
          "Intermediate QA work, non-public source handling notes, and reusable internal heuristics stay in the working layer.",
          "El trabajo intermedio de QA, las notas no públicas sobre fuentes y las heurísticas internas reutilizables se quedan en la capa de trabajo.",
        ),
      },
    ],
  },
  exampleTransformations: {
    eyebrow: l("Concrete examples", "Ejemplos concretos"),
    heading: l(
      "A raw business element becomes public-safe by preserving role and behavior, not identity.",
      "Un elemento de negocio raw se vuelve public-safe preservando rol y comportamiento, no identidad.",
    ),
    intro: l(
      "The examples below use only the approved public form. They show the transformation type without revealing the original private label.",
      "Los ejemplos de abajo usan solo la forma pública aprobada. Muestran el tipo de transformación sin revelar la etiqueta privada original.",
    ),
  },
  simplifications: {
    eyebrow: l("Public-safe simplifications", "Simplificaciones public-safe"),
    heading: l(
      "The public release is intentionally simpler than a private operating environment.",
      "El release público es intencionalmente más simple que un entorno operativo privado.",
    ),
    intro: l(
      "These simplifications keep the case legible and publication-safe while preserving the analytical questions that matter.",
      "Estas simplificaciones mantienen el caso legible y publication-safe mientras preservan las preguntas analíticas que importan.",
    ),
    items: [
      l("Exact customer, site, and product identities are replaced with stable neutral public labels.", "Las identidades exactas de clientes, sitios y productos se reemplazan por etiquetas públicas neutrales y estables."),
      l("The economic reading mixes bounded realized metrics with proxy comparative context instead of claiming raw invoice-source enterprise finance.", "La lectura económica mezcla métricas realizadas acotadas con contexto comparativo proxy en vez de afirmar finanzas enterprise raw invoice-source."),
      l("The current web experience favors grouped interpretation over full unrestricted diagnostics or ad hoc drillthrough.", "La experiencia web actual favorece la interpretación agrupada sobre diagnósticos completos sin restricción o drillthrough ad hoc."),
      l("The case-study route uses a bounded policy reading layer instead of claiming a full planning engine or optimization system.", "La ruta del caso usa una capa acotada de lectura de política en vez de afirmar un motor completo de planeación u optimización."),
      l("Private reconstruction logic, raw source lineage, and reusable internal delivery leverage remain outside the public release.", "La lógica privada de reconstrucción, la lineage raw de fuentes y el delivery leverage interno reutilizable quedan fuera del release público."),
    ],
  },
  grain: {
    eyebrow: l("Core grain", "Grano central"),
    heading: l(
      "The case stays readable because the model rests on three fact grains and a bounded set of supporting dimensions.",
      "El caso sigue siendo legible porque el modelo descansa sobre tres granos de hechos y un conjunto acotado de dimensiones de apoyo.",
    ),
    intro: l(
      "The design is contract-first rather than ad hoc. Demand, inbound inventory, and current inventory posture stay distinct and complementary.",
      "El diseño es contract-first y no ad hoc. La demanda, el inventario inbound y la postura actual de inventario se mantienen distintos y complementarios.",
    ),
    statements: [
      l("Demand is modeled at demand-line grain with event and requested-delivery context.", "La demanda se modela en grano de demand line con contexto de evento y requested delivery."),
      l("Approved inbound inventory is modeled at receipt-event grain with product-location context.", "El inventario inbound aprobado se modela en grano de receipt event con contexto producto-ubicación."),
      l("Inventory is modeled at product-location snapshot grain for the latest approved position.", "El inventario se modela en grano de snapshot producto-ubicación para la posición aprobada más reciente."),
      l("Dimensions preserve stable product, family, account, and location context around those three fact grains.", "Las dimensiones preservan contexto estable de producto, familia, cuenta y ubicación alrededor de esos tres granos de hechos."),
    ],
  },
  modeledEntities: {
    eyebrow: l("Modeled entities", "Entidades modeladas"),
    heading: l(
      "The analytical slice uses a bounded representative market on purpose.",
      "El slice analítico usa deliberadamente un mercado representativo acotado.",
    ),
    intro: l(
      "These seven published tables reflect the approved representative package while the seed-archetype source remains separate.",
      "Estas siete tablas publicadas reflejan el paquete representativo aprobado mientras la fuente seed-archetype permanece separada.",
    ),
  },
  questionMapping: {
    eyebrow: l("Business-question mapping", "Mapeo de preguntas de negocio"),
    heading: l(
      "The public outputs are tied to explicit questions, entities, and measures.",
      "Los outputs públicos están ligados a preguntas, entidades y medidas explícitas.",
    ),
    intro: l(
      "The route does not join data ad hoc at display time. It explains how a bounded model supports a small set of business questions.",
      "La ruta no une datos ad hoc al momento de mostrarlos. Explica cómo un modelo acotado soporta un conjunto pequeño de preguntas de negocio.",
    ),
  },
  technicalEvidence: {
    eyebrow: l("Technical evidence bundle", "Paquete de evidencia técnica"),
    heading: l(
      "This route carries a compact proof bundle instead of relying on implied technical credibility.",
      "Esta ruta carga un paquete compacto de prueba en vez de depender de credibilidad técnica implícita.",
    ),
    intro: l(
      "What matters here is enough evidence to support trust, not a full public operations console.",
      "Lo que importa aquí es suficiente evidencia para sostener confianza, no una consola pública completa de operaciones.",
    ),
  },
  proofCoverage: {
    eyebrow: l("DP-700-relevant proof coverage", "Cobertura de prueba relevante para DP-700"),
  },
  boundedProof: {
    eyebrow: l("Bounded proof surface", "Superficie acotada de prueba"),
    heading: l(
      "The live Power BI or Fabric proof is connected here, but the website remains the primary public surface.",
      "La prueba live de Power BI o Fabric está conectada aquí, pero el sitio sigue siendo la superficie pública principal.",
    ),
    intro: l(
      "The proof appears as supporting technical evidence, not as a separate public BI portal.",
      "La prueba aparece como evidencia técnica de soporte, no como un portal público separado de BI.",
    ),
  },
  proofNaming: {
    eyebrow: l("Proof naming layer", "Capa de nombres de prueba"),
    heading: l(
      "Human-facing aliases keep the proof readable without renaming live technical artifacts.",
      "Los aliases orientados a humanos mantienen legible la prueba sin renombrar artefactos técnicos live.",
    ),
  },
  evidenceBoundary: {
    eyebrow: l("Evidence boundary policy", "Política de boundary de evidencia"),
    heading: l(
      "Public proof, public-safe operations, and private-only assets are treated as different classes on purpose.",
      "Prueba pública, operación public-safe y activos solo privados se tratan como clases distintas a propósito.",
    ),
    intro: l(
      "That separation is what keeps the public story inspectable without exposing the full internal operating system behind it.",
      "Esa separación es lo que mantiene inspeccionable la historia pública sin exponer todo el sistema operativo interno que la sostiene.",
    ),
  },
  boundaryLists: {
    includedHeading: l("Included in Phase 1", "Incluido en Fase 1"),
    excludedHeading: l("Intentionally left out", "Intencionalmente dejado fuera"),
    included: [
      l("Bounded serving-extract outputs and source-slice metadata that support the case-study slice", "Outputs del serving extract acotado y metadata del source slice que soportan el slice del caso"),
      l("The public/private boundary used to prepare the shareable version", "El boundary público/privado usado para preparar la versión compartible"),
      l("Validation, candidate, and approved-package discipline at a summary level", "Disciplina de validación, candidato y paquete aprobado a nivel de resumen"),
      l("A bounded Power BI / Fabric report shell tied to the approved proof workspace", "Un report shell acotado de Power BI / Fabric ligado al workspace aprobado de prueba"),
      l("A compact explanation of what the public model is trying to prove", "Una explicación compacta de lo que el modelo público intenta probar"),
    ],
    excluded: [
      l("Full internal documentation archives", "Archivos completos de documentación interna"),
      l("Sensitive source logic and raw private identifiers", "Lógica sensible de fuentes e identificadores privados raw"),
      l("A complete certification-prep or Fabric feature catalog", "Un catálogo completo de preparación de certificación o features de Fabric"),
      l("Every operational or governance artifact created during development", "Cada artefacto operativo o de gobernanza creado durante el desarrollo"),
    ],
  },
  cta: {
    heading: l("Next route options", "Siguientes rutas"),
    body: l(
      "Go back to the case if you want the business read. Use contact if you want to turn the portfolio into a real conversation.",
      "Vuelve al caso si quieres la lectura de negocio. Usa contacto si quieres convertir el portafolio en una conversación real.",
    ),
    primary: l("Back to case study", "Volver al caso"),
    secondary: l("Go to contact", "Ir a contacto"),
  },
} as const;
