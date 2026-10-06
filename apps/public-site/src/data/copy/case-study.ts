import type { LocalizedCopy } from "../localized";

const l = (en: string, es: string): LocalizedCopy => ({ en, es });

export const caseStudyPageCopy = {
  meta: {
    title: l("Case Study | Manuel A. Orozco", "Caso | Manuel A. Orozco"),
    routeLabel: l("Case Study", "Caso"),
    routePurpose: l(
      "Open with the business problem, then review the decision, the economic reading, and the supporting evidence.",
      "Abre con el problema de negocio y luego revisa la decisión, la lectura económica y la evidencia de soporte.",
    ),
    pageHeading: l(
      "An inventory-readiness decision story under operating pressure.",
      "Una historia de decisión sobre inventory readiness bajo presión operativa.",
    ),
  },
  hero: {
    eyebrow: l("Featured case", "Caso principal"),
    title: l(
      "When demand, inventory, and service stop telling the same story, teams start making trade-offs in the dark.",
      "Cuando demanda, inventario y servicio dejan de contar la misma historia, los equipos empiezan a tomar trade-offs a ciegas.",
    ),
    summary: l(
      "This case shows how I frame one operating question clearly enough for commercial, supply chain, and logistics teams to work from the same picture.",
      "Este caso muestra cómo encuadro una pregunta operativa con suficiente claridad para que equipos comerciales, de supply chain y de logística trabajen desde la misma lectura.",
    ),
    support: l(
      "It is built to surface the operating trade-off early enough for a team to respond with more clarity.",
      "Está construido para volver visible el trade-off operativo con suficiente anticipación para que un equipo pueda responder con más claridad.",
    ),
  },
  whyItMatters: {
    eyebrow: l("Why this case matters", "Por qué importa este caso"),
    title: l(
      "This is a business decision system first, and a Fabric proof second.",
      "Esto es primero un sistema de decisión de negocio y después una prueba en Fabric.",
    ),
    body: l(
      "The value is not the dashboard itself. The value is making revenue pressure, inventory exposure, and service readiness legible enough to support a better operating decision.",
      "El valor no está en el dashboard por sí mismo. El valor está en volver legible la presión de ingresos, la exposición de inventario y el readiness de servicio para soportar una mejor decisión operativa.",
    ),
    notes: [
      l("Built to support a decision, not to imitate an ERP.", "Construido para apoyar una decisión, no para imitar un ERP."),
      l("Focused on operational trade-offs that a team can actually act on.", "Enfocado en trade-offs operativos sobre los que un equipo realmente puede actuar."),
    ],
  },
  tension: {
    eyebrow: l("Competing priorities", "Prioridades en tensión"),
    heading: l(
      "Each team is reading the same problem through a different KPI.",
      "Cada equipo está leyendo el mismo problema a través de un KPI distinto.",
    ),
    intro: l(
      "These goals are all reasonable and still do not reconcile on their own. The analytical layer helps make the tension visible.",
      "Estas metas son razonables y aun así no se reconcilian solas. La capa analítica ayuda a volver visible esa tensión.",
    ),
    cards: [
      {
        team: l("Sales", "Ventas"),
        target: l("Commercial throughput and service confidence", "Throughput comercial y confianza de servicio"),
        detail: l(
          "Sales wants demand to convert into shipped product without avoidable delays.",
          "Ventas quiere que la demanda se convierta en producto surtido sin retrasos evitables.",
        ),
      },
      {
        team: l("Supply Chain", "Supply Chain"),
        target: l("Lower inventory exposure", "Menor exposición de inventario"),
        detail: l(
          "Supply chain wants tighter inventory posture and fewer positions carrying value without a clear reason.",
          "Supply chain quiere una postura más ajustada de inventario y menos posiciones cargando valor sin una razón clara.",
        ),
      },
      {
        team: l("Logistics", "Logística"),
        target: l("Stable fulfillment flow", "Flujo estable de surtido"),
        detail: l(
          "Logistics wants movement and handoffs to stay dependable across the network.",
          "Logística quiere que el movimiento y los handoffs se mantengan confiables a lo largo de la red.",
        ),
      },
    ],
  },
  decision: {
    eyebrow: l("Primary decision view", "Vista principal de decisión"),
    heading: l(
      "Can the current inventory posture support expected demand without carrying unnecessary exposure?",
      "¿Puede la postura actual de inventario soportar la demanda esperada sin cargar exposición innecesaria?",
    ),
    intro: l(
      "This is the main decision the case is built to support. It does not automate planning; it makes the current posture easier to judge.",
      "Esta es la decisión principal que el caso busca soportar. No automatiza la planeación; vuelve más fácil juzgar la postura actual.",
    ),
    currentReadEyebrow: l("Current read", "Lectura actual"),
    currentReadTitle: l("The package is workable, but tight.", "El paquete es operable, pero ajustado."),
    approvedPackageEyebrow: l("Approved package", "Paquete aprobado"),
    approvedPackageTitle: l("What sits behind this read", "Qué sostiene esta lectura"),
    approvedPackageNote: l(
      "The scope is intentionally narrow: demand pressure, inventory posture, service readiness, and the first action signal that follows from that relationship.",
      "El alcance es intencionalmente estrecho: presión de demanda, postura de inventario, readiness de servicio y la primera señal de acción que se desprende de esa relación.",
    ),
  },
  economic: {
    eyebrow: l("Economic reading", "Lectura económica"),
    heading: l(
      "What the operating picture means financially.",
      "Qué significa financieramente la situación operativa.",
    ),
    intro: l(
      "This layer combines bounded realized metrics with proxy context for demand pressure and inventory exposure. It adds economic consequence without pretending to be invoice-source finance.",
      "Esta capa combina métricas realizadas acotadas con contexto proxy para presión de demanda y exposición de inventario. Agrega consecuencia económica sin fingir ser finanzas invoice-source.",
    ),
    monthlyTrendEyebrow: l("Monthly trend", "Tendencia mensual"),
    unitEconomicsEyebrow: l("Unit economics by family", "Economía unitaria por familia"),
  },
  policy: {
    eyebrow: l("How to read the decision", "Cómo leer la decisión"),
    heading: l(
      "These policy signals keep the interpretation consistent.",
      "Estas señales de política mantienen consistente la interpretación.",
    ),
    intro: l(
      "This is not a full planning engine. It is the reading frame that keeps coverage, readiness, and action signals grounded in the same logic.",
      "Esto no es un motor completo de planeación. Es el marco de lectura que mantiene cobertura, readiness y señales de acción dentro de la misma lógica.",
    ),
    signals: [
      {
        label: l("Inventory policy class", "Clase de política de inventario"),
        note: l(
          "Published directly from the product dimension so buffer-oriented, staged, controlled, and monitor-only behavior stay legible.",
          "Publicado directamente desde la dimensión de producto para que el comportamiento con buffer, por etapas, controlado y de monitoreo siga siendo legible.",
        ),
        source: l("Published field", "Campo publicado"),
      },
      {
        label: l("Target service-level band", "Banda objetivo de nivel de servicio"),
        note: l(
          "Published in the bounded policy reference so readiness can be interpreted without implying a full planning contract.",
          "Publicado en la referencia acotada de política para que el readiness pueda interpretarse sin implicar un contrato completo de planeación.",
        ),
        source: l("Bounded policy reference", "Referencia acotada de política"),
      },
      {
        label: l("Coverage target band", "Banda objetivo de cobertura"),
        note: l(
          "Published so lean, buffered, or controlled expectations stay visible without claiming enterprise-grade optimization logic.",
          "Publicado para que expectativas lean, con buffer o controladas sigan visibles sin reclamar lógica enterprise de optimización.",
        ),
        source: l("Bounded policy reference", "Referencia acotada de política"),
      },
      {
        label: l("Lead-time band", "Banda de lead time"),
        note: l(
          "Published directly from the product dimension so the decision stays honest about what can be replenished quickly and what cannot.",
          "Publicado directamente desde la dimensión de producto para que la decisión siga siendo honesta respecto a qué puede reponerse rápido y qué no.",
        ),
        source: l("Published field", "Campo publicado"),
      },
      {
        label: l("Location role", "Rol de ubicación"),
        note: l(
          "Published directly from the location dimension so the network role remains visible without turning the case into a route-optimization tool.",
          "Publicado directamente desde la dimensión de ubicación para que el rol de red siga visible sin convertir el caso en una herramienta de optimización de rutas.",
        ),
        source: l("Published field", "Campo publicado"),
      },
    ],
  },
  action: {
    eyebrow: l("Action logic", "Lógica de acción"),
    heading: l(
      "The latest snapshot already shows where attention should go first.",
      "El último snapshot ya muestra dónde debería ir primero la atención.",
    ),
    intro: l(
      "The action queue is the shortest path from the operating picture to a next move: hold, monitor, or replenish.",
      "La cola de acciones es el camino más corto de la situación operativa al siguiente movimiento: sostener, monitorear o reponer.",
    ),
  },
  demandSupport: {
    eyebrow: l("Supporting evidence", "Evidencia de soporte"),
    heading: l(
      "The inventory decision gets harder when demand is not evenly distributed.",
      "La decisión de inventario se vuelve más difícil cuando la demanda no se distribuye de forma pareja.",
    ),
    intro: l(
      "These cuts show where the pressure is concentrated so the main decision is not read as a single aggregate only.",
      "Estos cortes muestran dónde se concentra la presión para que la decisión principal no se lea solo como un agregado.",
    ),
    monthPressureEyebrow: l("Current-month pressure", "Presión del mes actual"),
    customerGroupEyebrow: l("Open demand by customer group", "Demanda abierta por grupo de clientes"),
    productFamilyEyebrow: l("Open demand by product family", "Demanda abierta por familia de producto"),
  },
  freshness: {
    eyebrow: l("Freshness and release context", "Frescura y contexto de release"),
    heading: l(
      "This case is current on a governed cadence, not in real time.",
      "Este caso está vigente con una cadencia gobernada, no en tiempo real.",
    ),
    intro: l(
      "The value here is reviewable evidence on a trusted release cadence, not a live operational console.",
      "El valor aquí es evidencia revisable sobre una cadencia confiable de release, no una consola operativa en vivo.",
    ),
  },
  readingPath: {
    eyebrow: l("Reading path", "Ruta de lectura"),
    heading: l("How to move through the case", "Cómo recorrer el caso"),
    intro: l(
      "Start with the business problem, then move to the data slice and finally to the technical method if you want implementation detail.",
      "Empieza por el problema de negocio, después pasa al slice de datos y finalmente al método técnico si quieres detalle de implementación.",
    ),
    steps: [
      {
        title: l("The operating problem", "El problema operativo"),
        summary: l(
          "Revenue, inventory exposure, and service can all look reasonable on their own and still pull the business in different directions.",
          "Ingresos, exposición de inventario y servicio pueden verse razonables por separado y aun así empujar al negocio en direcciones distintas.",
        ),
        cue: l("Start with the decision problem.", "Empieza por el problema de decisión."),
      },
      {
        title: l("The analytical slice", "El slice analítico"),
        summary: l(
          "The public version keeps only the entities and facts needed to connect demand behavior, inventory position, and readiness.",
          "La versión pública conserva solo las entidades y hechos necesarios para conectar comportamiento de demanda, posición de inventario y readiness.",
        ),
        cue: l("Then look at the approved slice.", "Después mira el slice aprobado."),
      },
      {
        title: l("The technical method", "El método técnico"),
        summary: l(
          "Only after the case is clear does it make sense to inspect how the proof was modeled, bounded, and governed.",
          "Solo cuando el caso está claro tiene sentido revisar cómo se modeló, acotó y gobernó la prueba.",
        ),
        cue: l("Go deeper only if you want implementation detail.", "Profundiza solo si quieres detalle de implementación."),
      },
    ],
  },
  boundaries: {
    currentHeading: l("What this version covers", "Qué cubre esta versión"),
    laterHeading: l("What I would deepen next", "Qué profundizaría después"),
    current: [
      l(
        "One primary decision view centered on inventory posture, service readiness, and demand pressure.",
        "Una vista principal de decisión centrada en postura de inventario, readiness de servicio y presión de demanda.",
      ),
      l(
        "A bounded KPI set that remains readable for business stakeholders before they need technical detail.",
        "Un set de KPIs acotado que sigue siendo legible para stakeholders de negocio antes de necesitar detalle técnico.",
      ),
      l(
        "A compact public policy layer that explains how the case should be interpreted.",
        "Una capa compacta de política pública que explica cómo debe interpretarse el caso.",
      ),
    ],
    later: [
      l(
        "A deeper sales-support read with stronger demand concentration, trend, and margin analysis.",
        "Una lectura más profunda de soporte a ventas con mejor análisis de concentración de demanda, tendencia y margen.",
      ),
      l(
        "A logistics-support read with transfer classification and distribution pressure by location.",
        "Una lectura de soporte logístico con clasificación de transferencias y presión de distribución por ubicación.",
      ),
      l(
        "More explicit replenishment logic once the bounded MVP stays coherent.",
        "Lógica más explícita de reposición una vez que el MVP acotado se mantenga coherente.",
      ),
    ],
  },
} as const;
