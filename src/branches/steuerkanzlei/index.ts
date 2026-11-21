import {
  Briefcase,
  Calculator,
  CalendarClock,
  FileStack,
  FolderOpen,
  FolderUp,
  Landmark,
  LibraryBig,
  Mail,
  MessagesSquare,
  Phone,
  ScrollText,
} from "lucide-react";
import { flow, llm, techOperations } from "../../overviewFlows";
import type { OverviewSet, TechBlock } from "../../overviewFlows";
import type { Branch } from "../types";
import { rueckrufStory } from "./phone";
import { mandantenStory } from "./inbox";
import { unterlagenStory } from "./documents";
import { bescheidStory } from "./notice";

// Branchenseite /steuerkanzlei. Anrede: Sie. Keine eigenen Kennzahlen,
// solange es kein Kundenprojekt in einer Steuerkanzlei gibt. Kanzleisoftware
// nur als Beispiel im Text, ohne Logos, bis eine Anbindung bestätigt ist.
// Der Assistent gibt keine steuerlichen Auskünfte; er bereitet vor.

// Datenschutz & Betrieb wie techOperations, in der Anrede Sie und mit der
// Verschwiegenheit nach § 62a StBerG
const operations: TechBlock = {
  text: "Server und Ablaufsteuerung in Deutschland, das Sprachmodell in der EU. Was bei einzelnen Diensten abweicht, steht darunter. Nichts wird automatisch gesendet: Antworten, Nachforderungen und Rückrufnotizen entstehen als Entwurf.",
  tools: techOperations.tools,
  notes: [
    "Verpflichtung zur Verschwiegenheit nach § 62a StBerG in Textform, mit Belehrung über die strafrechtlichen Folgen (§ 203 StGB), dazu ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO.",
    "Aufnahmen, Transkripte und Zwischenergebnisse werden nach 30 Tagen automatisch gelöscht, Ablaufprotokolle nach 14 Tagen.",
    "Das Ergebnis liegt in Ihrer Kanzleisoftware und Ihrem Postfach, nicht bei mir.",
    "Azure OpenAI: Training mit Ihren Daten vertraglich ausgeschlossen, Verarbeitung in der EU.",
    "Hetzner, n8n und sipgate: Server, Ablaufsteuerung und Telefonie, ohne KI-Training mit Ihren Daten.",
    "Verschlüsselte Übertragung und Speicherung. Auf Wunsch laufen Ablaufsteuerung und Anbindungen auf Ihrem eigenen Server.",
  ],
};

const postfach = {
  role: "Postfach",
  name: "Microsoft 365 über Graph API oder IMAP",
};

const useCases: OverviewSet[] = [
  {
    id: "bescheide",
    card: {
      title: "Steuerbescheide prüfen",
      teaser:
        "Bescheid mit Erklärung abgleichen, Abweichungen einordnen, Frist berechnen und den Mandanten informieren.",
      icon: ScrollText,
    },
    kicker: "ANWENDUNGSFALL · BESCHEIDPRÜFUNG",
    title: "Der Bescheid ist da. Der Abgleich liegt bereit.",
    intro:
      "Der Assistent gleicht den Bescheid mit Erklärung oder Buchhaltung ab, ordnet jede Abweichung ein, berechnet die Einspruchsfrist und schreibt eine verständliche Mail an den Mandanten. Ob Einspruch oder nicht, entscheidet Ihr Team.",
    story: { kind: "notice", data: bescheidStory },
    tech: {
      input: {
        text: "Bescheide aus Postfach und Mandantenportal, je nach Kanzleisoftware auch als Bescheiddaten.",
        tools: [postfach],
      },
      assistant: {
        text: "Liest den Bescheid samt Erläuterungen, gleicht ihn mit Erklärung oder Buchhaltung ab, ordnet Abweichungen ein und berechnet die Frist.",
        tools: [llm, { role: "Abgleich & Fristen", name: "Python" }],
        notes: [
          "Die Frist rechnet er mit vier Tagen bis zur Bekanntgabe und einem Monat für den Einspruch; fällt das Ende aufs Wochenende oder einen Feiertag, gilt der nächste Werktag. Eingetragen wird sie erst nach Freigabe durch Ihr Team.",
        ],
      },
      connection: {
        text: "Die Mail an den Mandanten liegt als Entwurf im Postfach, Frist und Notiz in Ihrer Kanzleisoftware, je nach Schnittstelle.",
        tools: [flow],
      },
      operations,
    },
  },
  {
    id: "unterlagen",
    card: {
      title: "Fehlende Unterlagen & Belege",
      teaser:
        "Eingänge mit Checkliste und Kontoumsätzen abgleichen und die Nachfrage vorbereiten.",
      icon: FileStack,
    },
    kicker: "ANWENDUNGSFALL · UNTERLAGEN",
    title: "Die Unterlagen kommen rein. Die Nachfrage liegt bereit.",
    intro:
      "Der Assistent erkennt, was ein Mandant geschickt hat, gleicht es mit der Checkliste und den Kontoumsätzen ab und schreibt die Nachfrage für das, was fehlt. Ihr Team entscheidet und sendet selbst.",
    story: { kind: "invoice", data: unterlagenStory },
    tech: {
      input: {
        text: "Mails und Uploads der Mandanten, Hinweise aus Ihrer Fristenkontrolle und die Kontoumsätze.",
        tools: [
          postfach,
          { role: "Kontoumsätze", name: "CAMT.053-Kontoauszug" },
        ],
      },
      assistant: {
        text: "Erkennt die Unterlagen, gleicht sie mit Checkliste, Vorjahr und Kontoumsätzen ab und formuliert die Nachfrage.",
        tools: [llm, { role: "Abgleich", name: "Python" }],
      },
      connection: {
        text: "Die Nachfrage liegt als Entwurf im Postfach, Stand und Wiedervorlage in Ihrer Kanzleisoftware, je nach Schnittstelle.",
        tools: [flow],
      },
      operations,
    },
  },
  {
    id: "anfragen",
    card: {
      title: "Mandantenanfragen",
      teaser:
        "Mails lesen, Mandant und Akte zuordnen, Fristen erkennen und einen Antwortentwurf mit Quelle vorbereiten.",
      icon: MessagesSquare,
    },
    kicker: "ANWENDUNGSFALL · ANFRAGEN",
    title: "Die Frage kommt rein. Die Antwort liegt bereit.",
    intro:
      "Der Assistent liest die Mail, findet Mandant, Akte und das passende Merkblatt und schreibt einen Antwortentwurf. Was steuerlich gilt, prüft Ihr Team, bevor es sendet.",
    story: { kind: "inbox", data: mandantenStory },
    tech: {
      input: {
        text: "Ihr Postfach und Nachrichten aus dem Mandantenportal, je nach Portal.",
        tools: [postfach],
      },
      assistant: {
        text: "Liest Mail und Anhänge, findet Mandant und Akte und schreibt einen Entwurf. Fachliche Aussagen stützt er nur auf Ihre Merkblätter und nennt die Quelle.",
        tools: [llm, { role: "Anhänge & Zuordnung", name: "Python" }],
      },
      connection: {
        text: "Der Entwurf liegt im Postfach, Notiz und Frist in Ihrer Kanzleisoftware, je nach Schnittstelle.",
        tools: [flow],
      },
      operations,
    },
  },
  {
    id: "telefon",
    card: {
      title: "Anrufe, wenn alle Leitungen besetzt sind",
      teaser:
        "Der Assistent nimmt das Anliegen auf und schickt der zuständigen Sachbearbeiterin eine Rückrufnotiz.",
      icon: Phone,
      cta: "Gespräch mitlesen",
    },
    kicker: "ANWENDUNGSFALL · TELEFONASSISTENZ",
    title: "Alle Leitungen besetzt. Der Assistent geht ran.",
    intro:
      "Er fragt Mandant und Anliegen ab, erkennt Fristen und schickt der zuständigen Sachbearbeiterin eine Rückrufnotiz. Steuerliche Auskünfte gibt er nicht.",
    story: { kind: "phone", data: rueckrufStory },
    tech: {
      input: {
        text: "Ihre Nummer bleibt. Anrufe bei besetzt oder außerhalb der Sprechzeiten leitet sie an den Assistenten weiter.",
        tools: [{ role: "Telefonie", name: "sipgate" }],
      },
      assistant: {
        text: "Versteht den Anrufer, fragt Name, Anliegen und Fristen ab und ordnet den Rückruf der zuständigen Person zu.",
        tools: [
          {
            role: "Sprachassistent",
            name: "Anbieter mit Verarbeitung in der EU, Auswahl vor dem Start",
          },
          llm,
        ],
      },
      connection: {
        text: "Ein eigener Dienst legt die Rückrufaufgabe in Ihrer Kanzleisoftware oder in Outlook an. Die Sachbearbeiterin bekommt eine kurze Nachricht.",
        tools: [
          flow,
          { role: "Eigene Anbindung", name: "Python (FastAPI)" },
        ],
      },
      operations,
      operationsNotes: [
        "Am Telefon fragt der Assistent nur Name, Anliegen und Rückrufnummer ab, keine Steuerdaten.",
        "Für Kanzleien nur ein Sprachdienst, der in der EU verarbeitet, nicht mit Ihren Gesprächen trainiert und sich zur Verschwiegenheit verpflichten lässt. Welcher, klären wir vor dem Start und halten es im Vertrag fest.",
        "Anrufer hören zu Beginn, dass ein digitaler Assistent spricht (EU AI Act). Aufgezeichnet wird nur mit Hinweis.",
      ],
    },
  },
];

export const steuerkanzlei: Branch = {
  paths: ["/steuerkanzlei", "/steuerberater"],
  meta: {
    title: "Digitale Abläufe für Steuerkanzleien · Zekun Jiao",
    description:
      "Interaktive Beispiele für den Kanzleialltag: Steuerbescheide prüfen, fehlende Unterlagen, Mandantenanfragen und Anrufe. Von Zekun Jiao.",
  },
  header: {
    icon: Calculator,
    name: "Digitale Abläufe",
    tag: "FÜR STEUERKANZLEIEN",
    explore: "Abläufe entdecken",
  },
  hero: {
    eyebrow: "BEISPIELE FÜR STEUERKANZLEIEN",
    title: "Weniger Unterbrechungen, wenn die Fristen drücken.",
    lead: [
      "Entdecken Sie an Beispielen, wie digitale Abläufe Bescheide, Unterlagen, Mandantenanfragen und Anrufe vorbereiten können.",
      "Steuerlich entscheidet weiterhin Ihr Team.",
    ],
    primaryCta: "Beispiele ansehen",
    secondaryCta: "Kostenlose Prozessanalyse",
  },
  useCases: {
    kicker: "ANWENDUNGSFÄLLE · BEISPIELE",
    title: "Wo ein Assistent in der Kanzlei unterstützen kann",
    intro:
      "Wählen Sie einen Anwendungsfall. Darunter läuft ein Beispiel Schritt für Schritt ab.",
    sets: useCases,
    upcoming: [],
  },
  overview: {
    title: "Ein Assistent, angebunden an Ihre Kanzleisoftware",
    intro:
      "Egal ob Anruf, Mail, Bescheid oder Kontoumsatz: Der Assistent bereitet vor, trägt in Ihre Programme ein, und Ihr Team entscheidet.",
    inputsTitle: "Was reinkommt, z. B.",
    inputs: [
      { name: "Telefon", icon: Phone },
      { name: "E-Mail", icon: Mail },
      { name: "Mandantenportal", icon: FolderUp },
      { name: "Bescheide & Post vom Finanzamt", icon: ScrollText },
      { name: "Kontoumsätze", icon: Landmark },
    ],
    softwareTitle: "Ihre Software & Ihr Wissen",
    integrations: [],
    extras: [
      { name: "Kanzleisoftware, z. B. DATEV, Addison, Agenda", icon: Briefcase },
      { name: "Fristenkontrolle & Kalender", icon: CalendarClock },
      { name: "Mandantenakten & Checklisten", icon: FolderOpen },
      { name: "Merkblätter der Kanzlei", icon: LibraryBig },
    ],
    assistantText: "liest, gleicht ab, bereitet vor",
    teamTitle: "Ihr Team",
    teamText: "prüft, entscheidet und sendet",
  },
  process: {
    intro:
      "Sie legen sich erst fest, wenn Sie den Ablauf an einem Beispiel gesehen haben.",
    steps: [
      {
        title: "Kostenlose Prozessanalyse",
        text: "45 Minuten, vor Ort in München oder online. Sie erzählen, wo in der Kanzlei Zeit verloren geht: Telefon, Mandantenanfragen, fehlende Unterlagen, Belege oder Bescheide. Gemeinsam suchen wir den Ablauf mit dem größten Nutzen.",
      },
      {
        title: "Beispiel mit Ihren Abläufen",
        text: "Ich zeige Ihnen an einem lauffähigen Beispiel, wie es bei Ihnen aussehen würde, mit Ihren Checklisten, Begriffen und Ihrer Software.",
      },
      {
        title: "Einführung und Begleitung",
        text: "Ich richte den Assistenten ein, binde ihn an Ihre Software an und begleite die ersten Wochen. Was nicht passt, passen wir an.",
      },
    ],
    faqs: [
      {
        question: "Wird etwas ohne uns verschickt?",
        answer:
          "Nein. Der Assistent bereitet Antworten, Nachfragen und Rückrufnotizen vor. Geprüft und gesendet wird von Ihrem Team.",
      },
      {
        question: "Gibt der Assistent steuerliche Auskünfte?",
        answer:
          "Nein. Er bereitet Antworten und Abgleiche vor, gestützt auf Ihre Merkblätter und die Mandantenakte, und nennt die Quelle. Was steuerlich gilt, ob Einspruch eingelegt wird und was rausgeht, entscheidet Ihr Team. Am Telefon nimmt er nur das Anliegen auf und kündigt den Rückruf an.",
      },
      {
        question: "Müssen wir unsere Kanzleisoftware wechseln?",
        answer:
          "Nein. Der Assistent arbeitet mit dem, was Sie schon nutzen. Wie er angebunden wird, hängt von den Schnittstellen Ihrer Software und Ihres Mandantenportals ab; das klären wir im ersten Gespräch.",
      },
      {
        question: "Wie ist es mit der Verschwiegenheit?",
        answer:
          "Ich verpflichte mich nach § 62a StBerG in Textform zur Verschwiegenheit, mit Belehrung über die strafrechtlichen Folgen (§ 203 StGB), und schließe zusätzlich einen Vertrag zur Auftragsverarbeitung nach DSGVO. Server, Ablaufsteuerung und Anbindungen laufen in Deutschland, das Sprachmodell in der EU, ohne Training mit Ihren Daten. Auch für den Telefonassistenten setze ich nur einen Sprachdienst mit Verarbeitung in der EU ein.",
      },
      {
        question: "Geht der Assistent bei jedem Anruf ran?",
        answer:
          "Nein. Er nimmt nur Anrufe an, die Sie an ihn weiterleiten, zum Beispiel wenn alle Leitungen besetzt sind oder außerhalb der Sprechzeiten. Zu Beginn sagt er, dass ein digitaler Assistent spricht.",
      },
      {
        question: "Was kostet das?",
        answer:
          "Das hängt vom Ablauf und Ihrer Software ab. Nach dem ersten Gespräch bekommen Sie ein konkretes Angebot.",
      },
    ],
  },
  closing: {
    kicker: "KOSTENLOS · 45 MINUTEN · IN MÜNCHEN ODER ONLINE",
    title: "Reden wir über Ihre Prozesse.",
    paragraphs: [
      "Kein Verkaufsgespräch. Kein Pitch-Deck. Nur ein ehrliches Gespräch darüber, wo Sie Zeit verlieren, und ob ich helfen kann.",
      "Sie gehen mit zwei, drei konkreten Ansatzpunkten raus, auch wenn wir danach nicht zusammenarbeiten.",
    ],
    personRole: "Ihr Ansprechpartner",
    cta: "Prozessanalyse anfragen",
  },
  author: {
    intro:
      "Ich bin Informatiker (Bachelor und Master, TU München) und AI Transformation Lead bei der BMW Group. Dort bringe ich KI in die Fachbereiche: Wir bauen KI-Agenten, die aus sehr großen Datenmengen verständliche Antworten machen. Dieselbe Arbeitsweise bringe ich in Steuerkanzleien wie Ihre.",
    builds: [
      "Telefonassistenz",
      "Posteingang und Antwortentwürfe",
      "Abgleich von Bescheiden, Unterlagen und Belegen",
      "Anbindung an Ihre Kanzleisoftware",
    ],
    results: [],
    resultsNote: "",
    strengthsTitle: "Was Sie von mir bekommen",
    strengths: [
      {
        title: "Konzern-Erfahrung, für Ihre Kanzlei gebaut",
        text: "Was in großen Abteilungen funktioniert, setze ich in der Größe um, die zu Ihrer Kanzlei passt.",
      },
      {
        title: "Ein Ansprechpartner",
        text: "Wer mit Ihnen spricht, baut auch. Keine Übergaben, keine Agentur dazwischen.",
      },
      {
        title: "Erst sehen, dann entscheiden",
        text: "Sie sehen den Ablauf an einem lauffähigen Beispiel, bevor Sie sich festlegen.",
      },
      {
        title: "Ihr Team behält das letzte Wort",
        text: "Der Assistent bereitet vor. Steuerlich entschieden und gesendet wird von Ihnen.",
      },
    ],
    contactTitle: "Prozessanalyse anfragen",
    contactText:
      "Schreiben Sie kurz, wo es bei Ihnen hakt. Ich melde mich in der Regel innerhalb eines Werktags mit Terminvorschlägen.",
    form: {
      submitLabel: "Anfrage senden",
      messagePlaceholder:
        "z. B. „In der Fristenzeit klingelt ständig das Telefon“ oder „Wir laufen Unterlagen hinterher“",
      doneText:
        "Ich melde mich in der Regel innerhalb eines Werktags mit Terminvorschlägen.",
      thanks: "Danke, Ihre Nachricht ist angekommen.",
      privacyNote:
        "Ihre Angaben nutze ich nur, um Ihre Anfrage zu beantworten.",
      errorFallback: "Bitte schreiben Sie mir direkt an",
    },
  },
  footer: "Mögliche Abläufe für den Büroalltag in der Steuerkanzlei",
};
