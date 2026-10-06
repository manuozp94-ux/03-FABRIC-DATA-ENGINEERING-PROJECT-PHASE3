import type { LocalizedCopy } from "../localized";

const l = (en: string, es: string): LocalizedCopy => ({ en, es });

export const contactPageCopy = {
  meta: {
    title: l("Contact | Manuel A. Orozco", "Contacto | Manuel A. Orozco"),
    description: l(
      "A direct route for hiring conversations, recruiter outreach, and selected consulting work tied to this portfolio.",
      "Una ruta directa para conversaciones de hiring, outreach de recruiters y consultoría selecta ligada a este portafolio.",
    ),
    routeLabel: l("Contact", "Contacto"),
    routePurpose: l(
      "Use this page for role-fit, problem-fit, and next-step conversations connected to the work on this site.",
      "Usa esta página para conversaciones sobre role fit, problem fit y siguientes pasos conectados al trabajo de este sitio.",
    ),
    pageHeading: l(
      "A direct next step for hiring and serious portfolio conversations.",
      "Un siguiente paso directo para hiring y conversaciones serias de portafolio.",
    ),
  },
  hero: {
    eyebrow: l("Contact", "Contacto"),
    title: l(
      "If the work looks relevant, the next step should be a concrete professional conversation.",
      "Si el trabajo se ve relevante, el siguiente paso debería ser una conversación profesional concreta.",
    ),
    body: l(
      "The clearest next step is usually a hiring conversation about role fit, operating problems, and the kind of analytics work you need done.",
      "El siguiente paso más claro normalmente es una conversación de hiring sobre role fit, problemas operativos y el tipo de trabajo analítico que necesitas.",
    ),
    ctaLabel: l("See next-step guidance", "Ver guía de siguiente paso"),
    privacyLabel: l("Read privacy notice", "Leer aviso de privacidad"),
  },
  fit: {
    eyebrow: l("Good-fit roles and conversations", "Roles y conversaciones con buen fit"),
    items: [
      l(
        "Senior Analytics Engineer, Analytics Engineer, BI Lead, or Fabric Data Engineer roles where business framing matters as much as implementation.",
        "Roles de Senior Analytics Engineer, Analytics Engineer, BI Lead o Fabric Data Engineer donde el framing de negocio importa tanto como la implementación.",
      ),
      l(
        "Hiring-manager or recruiter conversations tied to decision support, operational analytics, or reporting that needs stronger trust and structure.",
        "Conversaciones con hiring managers o recruiters ligadas a decision support, analítica operativa o reporting que necesita más confianza y estructura.",
      ),
      l(
        "Selected consulting conversations around operational reporting, decision support, and governed delivery.",
        "Conversaciones selectas de consultoría sobre reporting operativo, decision support y delivery gobernado.",
      ),
    ],
  },
  reachOut: {
    eyebrow: l("Best way to reach out", "Mejor forma de contactarme"),
    title: l(
      "Use LinkedIn or the same professional thread that brought you here.",
      "Usa LinkedIn o el mismo hilo profesional que te trajo aquí.",
    ),
    body: l(
      "If you reach out, tell me what role or problem you want to discuss. That makes it easier to start in the right place.",
      "Si me contactas, dime qué rol o problema quieres discutir. Eso facilita empezar por el lugar correcto.",
    ),
    note: l(
      "That keeps the contact path direct and proportionate to the scope of this site.",
      "Eso mantiene la ruta de contacto directa y proporcional al alcance de este sitio.",
    ),
  },
  notices: {
    eyebrow: l("Public site notices", "Avisos del sitio público"),
    title: l("Support pages", "Páginas de soporte"),
    body: l(
      "The site includes short privacy and usage notices so visitors can understand how contact interactions are handled without turning the portfolio into a legal portal.",
      "El sitio incluye avisos breves de privacidad y uso para que visitantes entiendan cómo se manejan las interacciones de contacto sin convertir el portafolio en un portal legal.",
    ),
    privacyLabel: l("Privacy", "Privacidad"),
    termsLabel: l("Terms", "Términos"),
  },
  boundary: {
    title: l("No public form in this release", "No hay formulario público en este release"),
    body: l(
      "If that changes later, privacy, contact handling, and technical setup should be updated together instead of piecemeal.",
      "Si eso cambia después, privacidad, manejo de contacto y setup técnico deben actualizarse juntos y no por partes.",
    ),
  },
} as const;
