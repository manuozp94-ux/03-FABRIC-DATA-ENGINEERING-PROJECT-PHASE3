import type { LocalizedCopy } from "../localized";

const l = (en: string, es: string): LocalizedCopy => ({ en, es });

export const homePageCopy = {
  meta: {
    title: l("Manuel A. Orozco | Analytics Engineer", "Manuel A. Orozco | Analytics Engineer"),
    routeLabel: l("Home", "Inicio"),
    routePurpose: l(
      "Start here for a quick read on what Manuel does, then use the case study and technical method as proof.",
      "Empieza aquí para entender rápido qué hace Manuel y luego usa el caso y el método técnico como prueba.",
    ),
    pageHeading: l(
      "Decision-ready analytics for operational teams.",
      "Analítica lista para decidir para equipos operativos.",
    ),
  },
  hero: {
    eyebrow: l("Professional profile", "Perfil profesional"),
    role: l(
      "Analytics Engineer, BI Lead | Microsoft Fabric & Power Platform",
      "Analytics Engineer, BI Lead | Microsoft Fabric y Power Platform",
    ),
    summary: l(
      "I help teams turn operational ambiguity into analytics they can use to decide with more confidence.",
      "Ayudo a los equipos a convertir ambigüedad operativa en analítica que puedan usar para decidir con más confianza.",
    ),
    support: l(
      "My work sits where business analysis, analytics engineering, and delivery discipline need to line up. I care about whether a team can actually use what gets built.",
      "Mi trabajo vive donde business analysis, analytics engineering y disciplina de delivery necesitan alinearse. Me importa si un equipo realmente puede usar lo que se construye.",
    ),
    caseCta: {
      label: l("View the case study", "Ver el caso"),
      helper: l(
        "Start here for the business problem, the decision, and the outcome.",
        "Empieza aquí para ver el problema de negocio, la decisión y el resultado.",
      ),
    },
    methodCta: {
      label: l("See the technical method", "Ver el método técnico"),
      helper: l(
        "Go here for the data model, governance choices, and Fabric execution.",
        "Ve aquí para revisar el modelo de datos, las decisiones de gobernanza y la ejecución en Fabric.",
      ),
    },
  },
  profile: {
    eyebrow: l("What I bring", "Qué aporto"),
    title: l(
      "Business framing, analytics engineering, and delivery discipline in one profile.",
      "Business framing, analytics engineering y disciplina de delivery en un solo perfil.",
    ),
  },
  credibilitySignals: [
    l("Decision support", "Decision support"),
    l("Analytics engineering", "Analytics engineering"),
    l("BI leadership", "Liderazgo BI"),
    l("Microsoft Fabric and Power Platform", "Microsoft Fabric y Power Platform"),
  ],
  whatIDo: {
    eyebrow: l("What I do", "Qué hago"),
    heading: l(
      "I work on analytics problems that sit close to operations.",
      "Trabajo sobre problemas analíticos que están cerca de la operación.",
    ),
    body: l(
      "That usually means fragmented reporting, competing priorities, and teams that need one shared view before they can act.",
      "Eso normalmente significa reporting fragmentado, prioridades en tensión y equipos que necesitan una sola vista compartida antes de actuar.",
    ),
  },
  capabilityCards: [
    {
      title: l("Decision framing", "Framing de decisión"),
      body: l(
        "I translate operational ambiguity into questions a team, a model, and a dashboard can all work from.",
        "Traduzco ambigüedad operativa en preguntas desde las que un equipo, un modelo y un dashboard sí pueden trabajar.",
      ),
    },
    {
      title: l("Analytics products", "Productos analíticos"),
      body: l(
        "I build views, models, and reporting layers that help people decide, not just inspect numbers.",
        "Construyo vistas, modelos y capas de reporting que ayudan a decidir, no solo a inspeccionar números.",
      ),
    },
    {
      title: l("Execution in Fabric", "Ejecución en Fabric"),
      body: l(
        "My technical background spans BI, modeling, and data engineering, and I can execute that work end to end in environments like Microsoft Fabric.",
        "Mi experiencia técnica abarca BI, modelado y data engineering, y puedo ejecutar ese trabajo de punta a punta en entornos como Microsoft Fabric.",
      ),
    },
  ],
  howIWork: {
    eyebrow: l("How I work", "Cómo trabajo"),
    heading: l(
      "I start with the decision and build the analytical path behind it.",
      "Empiezo por la decisión y construyo el camino analítico detrás de ella.",
    ),
    principles: [
      l(
        "Clarify the operating question before choosing a metric, a model, or a visual.",
        "Aclaro la pregunta operativa antes de elegir una métrica, un modelo o una visual.",
      ),
      l(
        "Make definitions, refresh rules, and boundaries visible so trust does not depend on guesswork.",
        "Hago visibles las definiciones, las reglas de refresh y los boundaries para que la confianza no dependa de adivinar.",
      ),
      l(
        "Use technical depth where it improves the decision, not where it only adds noise.",
        "Uso profundidad técnica donde mejora la decisión, no donde solo agrega ruido.",
      ),
    ],
  },
  featuredCase: {
    eyebrow: l("Featured proof", "Prueba principal"),
    title: l("Inventory Readiness Decision Case", "Caso de decisión sobre inventory readiness"),
    intro: l(
      "This case is the clearest way to show how I connect business framing, analytical modeling, and governed delivery in one piece of work.",
      "Este caso es la forma más clara de mostrar cómo conecto business framing, modelado analítico y delivery gobernado en una sola pieza de trabajo.",
    ),
    signals: [
      l(
        "A business problem about demand pressure, inventory exposure, and service risk.",
        "Un problema de negocio sobre presión de demanda, exposición de inventario y riesgo de servicio.",
      ),
      l(
        "A governed data path from approved inputs to a public-safe decision view.",
        "Un camino de datos gobernado desde inputs aprobados hasta una vista de decisión public-safe.",
      ),
      l(
        "A bounded case with enough technical depth to inspect the work, not just the output.",
        "Un caso acotado con suficiente profundidad técnica para revisar el trabajo, no solo el output.",
      ),
    ],
    cta: l("Go to the case study", "Ir al caso"),
  },
  nextStep: {
    eyebrow: l("Where to go next", "A dónde ir después"),
    title: l(
      "Choose the path that matches what you want to understand first.",
      "Elige la ruta que mejor encaja con lo que quieres entender primero.",
    ),
    body: l(
      "Start with the case if you want the business story. Open the technical method if you want the implementation logic behind it.",
      "Empieza por el caso si quieres la historia de negocio. Abre el método técnico si quieres la lógica de implementación detrás.",
    ),
    cards: [
      {
        label: l("Start with the case study", "Empezar por el caso"),
        helper: l(
          "For the business context, the decision, and the trade-off.",
          "Para el contexto de negocio, la decisión y el trade-off.",
        ),
        href: "/case-study",
      },
      {
        label: l("Open the technical method", "Abrir el método técnico"),
        helper: l(
          "For analytics engineering, Fabric execution, and governed delivery details.",
          "Para analytics engineering, ejecución en Fabric y detalles de delivery gobernado.",
        ),
        href: "/technical-method",
      },
      {
        label: l("Contact and opportunities", "Contacto y oportunidades"),
        helper: l(
          "For role fit, hiring conversations, or selected consulting work.",
          "Para conversaciones sobre roles, hiring o consultoría selecta.",
        ),
        href: "/contact",
      },
    ],
  },
} as const;
