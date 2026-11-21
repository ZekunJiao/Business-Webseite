import {
  Building2,
  CalendarDays,
  Calculator,
  FileStack,
  LibraryBig,
  Mail,
  MessageSquare,
  MessagesSquare,
  Phone,
  ScrollText,
  Users,
  Wrench,
} from "lucide-react";
import { FormWindowIcon } from "../../components/FormWindowIcon";
import { flow, llm, techOperations } from "../../overviewFlows";
import type { OverviewSet, TechBlock } from "../../overviewFlows";
import type { Branch } from "../types";
import { notfallStory } from "./phone";
import { anfragenStory } from "./inbox";
import { schadenStory } from "./damage";
import { betriebskostenStory } from "./costs";
import { versammlungStory } from "./meeting";

// Branchenseite /hausverwaltung. Anrede: Sie. Keine eigenen Kennzahlen,
// solange es kein Kundenprojekt in einer Hausverwaltung gibt. Software nur
// als Beispiel im Text, ohne Logos, bis die Anbindung bestätigt ist.

// Datenschutz & Betrieb wie techOperations, in der Anrede Sie
const operations: TechBlock = {
  text: "Server und Ablaufsteuerung in Deutschland, das Sprachmodell in der EU. Was bei einzelnen Diensten abweicht, steht darunter. Nichts wird automatisch gesendet: Antworten, Aufträge und Nachrichten entstehen als Entwurf.",
  tools: techOperations.tools,
  notes: [
    "Aufnahmen, Transkripte und Zwischenergebnisse werden nach 30 Tagen automatisch gelöscht, Ablaufprotokolle nach 14 Tagen.",
    "Das Ergebnis liegt in Ihrer Software, nicht bei mir.",
    "Azure OpenAI, auch die Spracherkennung Whisper: Training mit Ihren Daten vertraglich ausgeschlossen, Verarbeitung in der EU.",
    "Hetzner, n8n und sipgate: Server, Ablaufsteuerung und Telefonie, ohne KI-Training mit Ihren Daten.",
    "Auftragsverarbeitungsvertrag nach Art. 28 DSGVO, verschlüsselte Übertragung und Speicherung.",
    "Auf Wunsch laufen Ablaufsteuerung und Anbindungen auf Ihrem eigenen Server.",
  ],
};

const useCases: OverviewSet[] = [
  {
    id: "notfall",
    card: {
      title: "Notfälle außerhalb der Sprechzeiten",
      teaser:
        "Der Assistent nimmt den Anruf an, erkennt den Notfall und informiert Ihre Bereitschaft.",
      icon: Phone,
      cta: "Gespräch anhören",
    },
    kicker: "ANWENDUNGSFALL · TELEFONASSISTENZ",
    title: "Sonntagabend, Wasserschaden. Der Assistent geht ran.",
    intro:
      "Er fragt Objekt, Wohnung und Schaden ab, erkennt den Notfall und schickt Ihrer Bereitschaft eine kurze Zusammenfassung aufs Handy. Ihr Team ruft zurück und entscheidet.",
    story: { kind: "phone", data: notfallStory },
    tech: {
      input: {
        text: "Ihre Nummer bleibt. Anrufe außerhalb der Sprechzeiten oder bei besetzt leitet sie an den Assistenten weiter.",
        tools: [{ role: "Telefonie", name: "sipgate" }],
      },
      assistant: {
        text: "Versteht den Anrufer, fragt Objekt, Wohnung und Schaden ab und erkennt Notfälle nach Ihren Regeln.",
        tools: [
          {
            role: "Sprachassistent",
            name: "ElevenLabs Agents oder Vapi mit Deepgram",
          },
          llm,
        ],
      },
      connection: {
        text: "Ein eigener Dienst legt den Vorgang in Ihrer Verwaltungssoftware an, je nach Schnittstelle. Die Bereitschaft bekommt eine kurze Nachricht aufs Handy.",
        tools: [
          flow,
          { role: "Eigene Anbindung", name: "Python (FastAPI)" },
          {
            role: "Nachricht aufs Handy",
            name: "WhatsApp Business über 360dialog, alternativ SMS",
          },
        ],
      },
      operations,
      operationsNotes: [
        "ElevenLabs: Training mit Ihren Gesprächen per Einstellung abgeschaltet, die Daten liegen in den USA.",
        "Vapi und Deepgram: Training und Speicherort klären wir vor dem Start und halten sie im Auftragsverarbeitungsvertrag fest.",
        "Anrufer hören zu Beginn, dass ein digitaler Assistent spricht (EU AI Act). Aufgezeichnet wird nur mit Hinweis.",
        "Die WhatsApp-Nachricht läuft über 360dialog und Meta und enthält deshalb nur eine kurze Zusammenfassung ohne sensible Details. Was dort gespeichert wird, klären wir vor dem Start. Wer das nicht möchte, bekommt SMS oder E-Mail.",
      ],
    },
  },
  {
    id: "anfragen",
    card: {
      title: "Mieter- und Eigentümeranfragen",
      teaser:
        "Mails lesen, Objekt und Vertrag zuordnen und einen Antwortentwurf mit Quelle vorbereiten.",
      icon: MessagesSquare,
    },
    kicker: "ANWENDUNGSFALL · ANFRAGEN",
    title: "Die Anfrage kommt rein. Die Antwort liegt bereit.",
    intro:
      "Der Assistent liest die Mail, findet Objekt, Wohnung und die passenden Unterlagen und schreibt einen Antwortentwurf. Ihr Team prüft und sendet selbst.",
    story: { kind: "inbox", data: anfragenStory },
    tech: {
      input: {
        text: "Ihr Postfach und das Kontaktformular Ihrer Homepage.",
        tools: [
          {
            role: "Postfach",
            name: "Microsoft 365 über Graph API oder IMAP, z. B. IONOS",
          },
          { role: "Formular", name: "per Webhook" },
        ],
      },
      assistant: {
        text: "Liest Mail und Anhänge, findet Objekt, Wohnung und Vertrag und schreibt einen Entwurf mit Quelle.",
        tools: [llm, { role: "Anhänge & Zuordnung", name: "Python" }],
      },
      connection: {
        text: "Der Entwurf liegt im Postfach, der Vorgang in Ihrer Verwaltungssoftware, je nach Schnittstelle.",
        tools: [flow],
      },
      operations,
    },
  },
  {
    id: "schaden",
    card: {
      title: "Schäden & Handwerkeraufträge",
      teaser:
        "Zuständigkeit klären, Handwerker beauftragen, Mieter und Eigentümer informieren.",
      icon: Wrench,
    },
    kicker: "ANWENDUNGSFALL · SCHADENSMELDUNGEN",
    title: "Der Schaden ist gemeldet. Der Auftrag liegt bereit.",
    intro:
      "Der Assistent prüft Zuständigkeit und Freigabegrenze, schlägt Betrieb und Termin vor und schreibt die Nachrichten an Handwerker, Mieter und Eigentümer. Ihr Team entscheidet und sendet selbst.",
    story: { kind: "schedule", data: schadenStory },
    tech: {
      input: {
        text: "Schadensmeldungen per E-Mail oder Mieterportal, Nachrichten von Handwerksbetrieben.",
        tools: [
          {
            role: "Postfach",
            name: "Microsoft 365 über Graph API oder IMAP",
          },
        ],
      },
      assistant: {
        text: "Prüft Zuständigkeit und Freigabegrenze nach Ihren Regeln, wählt den Betrieb aus Ihrer Dienstleisterliste und sucht einen Termin.",
        tools: [llm, { role: "Regeln & Terminsuche", name: "Python" }],
      },
      connection: {
        text: "Auftrag und Nachrichten als Entwurf, der Vorgang in Ihrer Verwaltungssoftware. Ihr Team gibt sie frei.",
        tools: [
          flow,
          { role: "Kalender", name: "Outlook (Microsoft 365)" },
        ],
      },
      operations,
    },
  },
  {
    id: "betriebskosten",
    card: {
      title: "Betriebskostenabrechnung vorbereiten",
      teaser:
        "Belege zuordnen, nicht Umlagefähiges abtrennen, Auffälliges markieren.",
      icon: Calculator,
    },
    kicker: "ANWENDUNGSFALL · BETRIEBSKOSTEN",
    title: "Die Belege sind da. Die Aufstellung liegt bereit.",
    intro:
      "Der Assistent ordnet jeden Beleg einer Kostenart zu, trennt Reparaturen und Doppeltes ab, prüft Zeiträume und vergleicht mit dem Vorjahr. Ihr Team entscheidet die offenen Punkte.",
    story: { kind: "costs", data: betriebskostenStory },
    tech: {
      input: {
        text: "Belege aus Postfach und Scanner, dazu die Vorjahreswerte aus Ihrer Verwaltungssoftware.",
        tools: [
          {
            role: "Postfach",
            name: "Microsoft 365 über Graph API oder IMAP",
          },
        ],
      },
      assistant: {
        text: "Liest die Belege, ordnet sie den Kostenarten der Betriebskostenverordnung zu, prüft Zeiträume und vergleicht mit dem Vorjahr.",
        tools: [llm, { role: "Belege lesen & rechnen", name: "Python" }],
      },
      connection: {
        text: "Die Aufstellung geht als Entwurf in Ihre Verwaltungssoftware, je nach Schnittstelle. Abrechnen und versenden tut Ihr Team dort.",
        tools: [flow],
      },
      operations,
    },
  },
  {
    id: "versammlung",
    card: {
      title: "Eigentümerversammlung protokollieren",
      teaser: "Vom Mitschnitt zu Protokoll, Beschlusssammlung und Aufgaben.",
      icon: Users,
    },
    kicker: "ANWENDUNGSFALL · EIGENTÜMERVERSAMMLUNG",
    title: "Die Versammlung ist vorbei. Das Protokoll liegt bereit.",
    intro:
      "Der Assistent erkennt Beschlüsse und Abstimmungen, sammelt Aufgaben mit Fristen und verknüpft jede Stelle mit dem Mitschnitt. Ihr Team klärt Unklares und gibt frei.",
    story: { kind: "meeting", data: versammlungStory },
    tech: {
      input: {
        text: "Mitschnitt der Versammlung, dazu Einladung und Tagesordnung.",
        tools: [],
      },
      assistant: {
        text: "Wandelt den Mitschnitt in Text um, ordnet ihn der Tagesordnung zu, zählt Abstimmungen und sammelt Aufgaben.",
        tools: [{ role: "Spracherkennung", name: "Whisper über Azure (EU)" }, llm],
      },
      connection: {
        text: "Protokollentwurf als Dokument, Beschlüsse und Aufgaben in Ihrer Verwaltungssoftware, je nach Schnittstelle.",
        tools: [flow],
      },
      operations,
      operationsNotes: [
        "Mitgeschnitten wird nur, wenn alle Anwesenden zu Beginn zustimmen.",
      ],
    },
  },
];

export const hausverwaltung: Branch = {
  paths: ["/hausverwaltung"],
  meta: {
    title: "Digitale Abläufe für Hausverwaltungen · Zekun Jiao",
    description:
      "Interaktive Beispiele für den Verwaltungsalltag: Notfälle am Telefon, Anfragen, Schäden, Betriebskosten und Eigentümerversammlungen. Von Zekun Jiao.",
  },
  header: {
    icon: Building2,
    name: "Digitale Abläufe",
    tag: "FÜR HAUSVERWALTUNGEN",
    explore: "Abläufe entdecken",
  },
  hero: {
    eyebrow: "BEISPIELE FÜR HAUSVERWALTUNGEN",
    title: "Ihr Büro läuft weiter, während Sie im Objekt unterwegs sind.",
    lead: [
      "Entdecken Sie an Beispielen, wie digitale Abläufe Ihren Verwaltungsalltag unterstützen können.",
      "Ihr Team bleibt am Steuer: Es prüft und entscheidet selbst.",
    ],
    primaryCta: "Beispiele ansehen",
    secondaryCta: "Kostenlose Prozessanalyse",
  },
  useCases: {
    kicker: "ANWENDUNGSFÄLLE · BEISPIELE",
    title: "Wo ein Assistent in der Verwaltung unterstützen kann",
    intro:
      "Wählen Sie einen Anwendungsfall. Darunter läuft ein Beispiel Schritt für Schritt ab.",
    sets: useCases,
    upcoming: [],
  },
  overview: {
    title: "Ein Assistent, angebunden an Ihre Verwaltungssoftware",
    intro:
      "Egal ob Anruf, Mail oder Schadensmeldung: Der Assistent bereitet vor, trägt in Ihre Programme ein, und Ihr Team entscheidet.",
    inputsTitle: "Was reinkommt, z. B.",
    inputs: [
      { name: "Telefon", icon: Phone },
      { name: "E-Mail", icon: Mail },
      { name: "Kontaktformular", icon: FormWindowIcon, strokeWidth: 1.8 },
      { name: "Mieterportal", icon: MessageSquare },
      { name: "Nachrichten von Handwerkern", icon: Wrench },
    ],
    softwareTitle: "Ihre Software & Ihr Wissen",
    integrations: [],
    extras: [
      { name: "Verwaltungssoftware, z. B. Domus, PowerHaus, Karthago", icon: Building2 },
      { name: "Kalender", icon: CalendarDays },
      { name: "Teilungserklärung & Beschlusssammlung", icon: ScrollText },
      { name: "Mietverträge & Abrechnungen", icon: FileStack },
      { name: "Dienstleisterliste & Merkblätter", icon: LibraryBig },
    ],
    assistantText: "liest, ordnet zu, bereitet vor",
    teamTitle: "Ihr Team",
    teamText: "prüft und sendet selbst",
  },
  process: {
    intro:
      "Sie legen sich erst fest, wenn Sie den Ablauf an einem Beispiel gesehen haben.",
    steps: [
      {
        title: "Kostenlose Prozessanalyse",
        text: "45 Minuten, vor Ort in München oder online. Sie erzählen, wo im Büro Zeit verloren geht: Anrufe, Mieteranfragen, Schadensmeldungen oder Abrechnungen. Gemeinsam suchen wir den Ablauf mit dem größten Nutzen.",
      },
      {
        title: "Beispiel mit Ihren Abläufen",
        text: "Ich zeige Ihnen an einem lauffähigen Beispiel, wie es bei Ihnen aussehen würde, mit Ihren Begriffen und Ihrer Software.",
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
          "Nein. Der Assistent bereitet Antworten, Aufträge und Nachrichten vor. Geprüft und gesendet wird von Ihrem Team.",
      },
      {
        question: "Müssen wir unsere Verwaltungssoftware wechseln?",
        answer:
          "Nein. Der Assistent arbeitet mit dem, was Sie schon nutzen. Wie er angebunden wird, hängt von den Schnittstellen Ihrer Software ab; das klären wir im ersten Gespräch.",
      },
      {
        question: "Beantwortet der Assistent Rechtsfragen?",
        answer:
          "Nein. Er bereitet Antworten mit Quelle vor, zum Beispiel aus Mietvertrag, Teilungserklärung oder Beschlusssammlung. Was gilt und was rausgeht, entscheidet Ihr Team.",
      },
      {
        question: "Geht der Assistent bei jedem Anruf ran?",
        answer:
          "Nein. Er nimmt nur Anrufe an, die Sie an ihn weiterleiten, zum Beispiel außerhalb der Sprechzeiten oder wenn besetzt ist. Zu Beginn sagt er, dass ein digitaler Assistent spricht.",
      },
      {
        question: "Wie ist es mit dem Datenschutz bei Mieterdaten?",
        answer:
          "Server, Ablaufsteuerung und Anbindungen laufen in Deutschland, das Sprachmodell in der EU, ohne Training mit Ihren Daten. Beim Telefonassistenten kommen Anbieter aus den USA dazu; was dort gilt, steht je Dienst unter „So hängt es technisch zusammen“. Für die Verarbeitung schließen wir einen Vertrag zur Auftragsverarbeitung nach DSGVO.",
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
      "Ich bin Informatiker (Bachelor und Master, TU München) und AI Transformation Lead bei der BMW Group. Dort bringe ich KI in die Fachbereiche: Wir bauen KI-Agenten, die aus sehr großen Datenmengen verständliche Antworten machen. Dieselbe Arbeitsweise bringe ich in Hausverwaltungen wie Ihre.",
    builds: [
      "Telefonassistenz",
      "Posteingang und Antwortentwürfe",
      "KI-Agenten",
      "Anbindung an Ihre Verwaltungssoftware",
    ],
    results: [],
    resultsNote: "",
    strengthsTitle: "Was Sie von mir bekommen",
    strengths: [
      {
        title: "Konzern-Erfahrung, für Ihre Verwaltung gebaut",
        text: "Was in großen Abteilungen funktioniert, setze ich in der Größe um, die zu Ihrem Büro passt.",
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
        text: "Der Assistent bereitet vor. Geprüft und gesendet wird von Ihnen.",
      },
    ],
    contactTitle: "Prozessanalyse anfragen",
    contactText:
      "Schreiben Sie kurz, wo es bei Ihnen hakt. Ich melde mich in der Regel innerhalb eines Werktags mit Terminvorschlägen.",
    form: {
      submitLabel: "Anfrage senden",
      messagePlaceholder:
        "z. B. „Nach 17 Uhr erreicht uns niemand mehr“ oder „Montags ist das Postfach voll“",
      doneText:
        "Ich melde mich in der Regel innerhalb eines Werktags mit Terminvorschlägen.",
      thanks: "Danke, Ihre Nachricht ist angekommen.",
      privacyNote:
        "Ihre Angaben nutze ich nur, um Ihre Anfrage zu beantworten.",
      errorFallback: "Bitte schreiben Sie mir direkt an",
    },
  },
  footer: "Mögliche Abläufe für den Büroalltag in der Hausverwaltung",
};
