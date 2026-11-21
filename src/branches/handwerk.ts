import {
  CalendarDays,
  Landmark,
  LibraryBig,
  Mail,
  MessageSquare,
  Mic,
  Phone,
} from "lucide-react";
import { FormWindowIcon } from "../components/FormWindowIcon";
import { contact } from "../contact";
import { integrations } from "../integrations";
import {
  overviewSets,
  upcomingUseCases,
  useCaseSection,
} from "../overviewFlows";
import type { Branch } from "./types";

// Branchenseite /handwerk. Anwendungsfälle und Demos in src/overviewFlows.ts,
// Kennzahlen und Vorstellung in src/contact.ts.
export const handwerk: Branch = {
  paths: ["/handwerk", "/workflow"],
  meta: {
    title: "Digitale Abläufe fürs Handwerk · Zekun Jiao",
    description:
      "Interaktive Beispiele für den Büroalltag im Handwerk: Anrufe, Anfragen, Angebote, Termine und Rechnungen. Von Zekun Jiao.",
  },
  header: {
    icon: Mail,
    name: "Digitale Abläufe",
    tag: "FÜRS HANDWERK",
    explore: "Abläufe entdecken",
  },
  hero: {
    eyebrow: "BEISPIELE FÜR HANDWERKSBETRIEBE",
    title: "Dein Büro läuft weiter, während du auf der Baustelle bist.",
    lead: [
      "Entdecke an Beispielen, wie digitale Abläufe deinen Büroalltag unterstützen können.",
      "Dein Team bleibt am Steuer: Es prüft und entscheidet selbst.",
    ],
    primaryCta: "Beispiele ansehen",
    secondaryCta: "Kostenlose Prozessanalyse",
    proof: { label: "Aus einem Kundenprojekt", link: "Wie gemessen" },
  },
  useCases: {
    ...useCaseSection,
    sets: overviewSets,
    upcoming: upcomingUseCases,
  },
  overview: {
    title: "Ein Assistent, angebunden an deine Software",
    intro:
      "Egal ob Anruf, Mail oder Notiz vom Termin: Der Assistent bereitet vor, trägt in eure Programme ein, und dein Team entscheidet.",
    inputsTitle: "Was reinkommt, z. B.",
    inputs: [
      { name: "Telefon", icon: Phone },
      { name: "E-Mail", icon: Mail },
      { name: "Homepage-Formular", icon: FormWindowIcon, strokeWidth: 1.8 },
      { name: "Sprachnotiz vom Termin", icon: Mic },
      { name: "Nachrichten von Kunden und Team", icon: MessageSquare },
      { name: "Zahlungseingänge", icon: Landmark },
    ],
    softwareTitle: "Deine Software & dein Wissen",
    integrations,
    extras: [
      { name: "Excel & andere", image: "/assets/integrations/excel.svg" },
      { name: "Kalender", icon: CalendarDays },
      { name: "Betriebswissen & Preisliste", icon: LibraryBig },
    ],
    assistantText: "liest, ordnet zu, bereitet vor",
    teamTitle: "Dein Team",
    teamText: "prüft und sendet selbst",
  },
  process: {
    intro:
      "Du legst dich erst fest, wenn du den Ablauf an einem Beispiel gesehen hast.",
    steps: [
      {
        title: "Kostenlose Prozessanalyse",
        text: "45 Minuten, vor Ort in München oder online. Du erzählst, wo im Büro Zeit verloren geht: Anrufe, Anfragen, Angebote oder Rechnungen. Gemeinsam suchen wir den Ablauf mit dem größten Nutzen.",
      },
      {
        title: "Beispiel mit euren Abläufen",
        text: "Ich zeige dir an einem lauffähigen Beispiel, wie es bei euch aussehen würde, mit euren Begriffen und eurer Software.",
      },
      {
        title: "Einführung und Begleitung",
        text: "Ich richte den Assistenten ein, binde ihn an eure Software an und begleite die ersten Wochen. Was nicht passt, passen wir an.",
      },
    ],
    faqs: [
      {
        question: "Wird etwas ohne uns verschickt?",
        answer:
          "Nein. Der Assistent bereitet Antworten, Angebote und Rechnungen vor. Geprüft und gesendet wird von euch.",
      },
      {
        question: "Müssen wir unsere Software wechseln?",
        answer:
          "Nein. Der Assistent arbeitet mit dem, was ihr schon nutzt, zum Beispiel HERO, ToolTime oder Excel.",
      },
      {
        question: "Geht der Assistent bei jedem Anruf ran?",
        answer:
          "Nein. Er nimmt nur Anrufe an, die ihr an ihn weiterleitet, zum Beispiel nach Feierabend oder wenn besetzt ist. Zu Beginn sagt er, dass ein digitaler Assistent spricht.",
      },
      {
        question: "Wie ist es mit dem Datenschutz?",
        answer:
          "Server, Ablaufsteuerung und Anbindungen laufen in Deutschland, das Sprachmodell in der EU, ohne Training mit euren Daten. Beim Telefonassistenten kommen Anbieter aus den USA dazu; was dort gilt, steht je Dienst unter „So hängt es technisch zusammen“. Für die Verarbeitung schließen wir einen Vertrag zur Auftragsverarbeitung nach DSGVO.",
      },
      {
        question: "Was kostet das?",
        answer:
          "Das hängt vom Ablauf und eurer Software ab. Nach dem ersten Gespräch bekommst du ein konkretes Angebot.",
      },
    ],
  },
  closing: {
    kicker: "KOSTENLOS · 45 MINUTEN · IN MÜNCHEN ODER ONLINE",
    title: "Reden wir über deine Prozesse.",
    paragraphs: [
      "Kein Verkaufsgespräch. Kein Pitch-Deck. Nur ein ehrliches Gespräch darüber, wo du Zeit verlierst, und ob ich helfen kann.",
      "Du gehst mit zwei, drei konkreten Ansatzpunkten raus, auch wenn wir danach nicht zusammenarbeiten.",
    ],
    personRole: "Dein Ansprechpartner",
    cta: "Prozessanalyse anfragen",
  },
  author: {
    intro: contact.intro,
    builds: contact.builds,
    results: contact.results,
    resultsNote: contact.resultsNote,
    strengthsTitle: "Was du von mir bekommst",
    strengths: contact.strengths,
    contactTitle: "Prozessanalyse anfragen",
    contactText:
      "Schreib kurz, wo es bei euch hakt. Ich melde mich in der Regel innerhalb eines Werktags mit Terminvorschlägen.",
    form: {
      submitLabel: "Anfrage senden",
      messagePlaceholder:
        "z. B. „Nach Feierabend verpassen wir viele Anrufe“ oder „Angebote schreiben dauert zu lange“",
      doneText:
        "Ich melde mich in der Regel innerhalb eines Werktags mit Terminvorschlägen.",
      thanks: "Danke, deine Nachricht ist angekommen.",
      privacyNote:
        "Deine Angaben nutze ich nur, um deine Anfrage zu beantworten.",
      errorFallback: "Bitte schreib mir direkt an",
    },
  },
  footer: "Mögliche Abläufe für den Büroalltag im Handwerk",
};
