import {
  CalendarDays,
  FileText,
  MessagesSquare,
  Phone,
  ReceiptText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Technische Bausteine je Anwendungsfall. Ein Satz in Alltagssprache, dazu
// die eingesetzten Dienste mit ihrer Rolle ("Womit") und optional Hinweise.
// Nur Dienste eintragen, die tatsächlich im Einsatz sind (Angaben von Zekun
// Jiao). Ist tools leer, entfällt die Zeile "Womit".
export type TechTool = { role: string; name: string };
export type TechBlock = { text: string; tools: TechTool[]; notes?: string[] };
export type TechBlocks = {
  input: TechBlock;
  assistant: TechBlock;
  connection: TechBlock;
  // Zusätzliche Hinweise zu Datenschutz & Betrieb nur für diesen
  // Anwendungsfall; sie stehen unter den gemeinsamen aus techOperations.
  operationsNotes?: string[];
};

const llm: TechTool = {
  role: "Sprachmodell",
  name: "GPT über Azure OpenAI (EU)",
};
const flow: TechTool = {
  role: "Ablaufsteuerung",
  name: "n8n, selbst gehostet",
};

// Datenschutz & Betrieb: gilt für alle Anwendungsfälle.
export const techOperations: TechBlock = {
  text: "Server und Daten in der EU. Nichts wird automatisch gesendet: Antworten, Angebote und Erinnerungen entstehen als Entwurf.",
  tools: [
    { role: "Server", name: "Hetzner in Deutschland" },
    { role: "Sprachmodell", name: "Azure OpenAI, EU-Rechenzentrum" },
  ],
  notes: [
    "Aufnahmen, Transkripte und Zwischenergebnisse werden nach 30 Tagen automatisch gelöscht, Ablaufprotokolle nach 14 Tagen.",
    "Das Ergebnis liegt in eurer Software, nicht bei mir.",
    "Kein Training mit euren Daten: bei Azure OpenAI vertraglich ausgeschlossen, bei anderen Diensten, wo möglich, abgeschaltet.",
    "Auftragsverarbeitungsvertrag nach Art. 28 DSGVO, verschlüsselte Übertragung und Speicherung.",
    "Auf Wunsch laufen Ablaufsteuerung und Anbindungen auf eurem eigenen Server.",
  ],
};

// Karte in der Übersicht der Anwendungsfälle
export type UseCaseCard = {
  title: string;
  teaser: string;
  icon: LucideIcon;
  // Aufforderung auf der Karte, Standard "Beispiel ansehen"
  cta?: string;
};

// Ein Anwendungsfall: Karte, Überschrift und technische Bausteine.
export type OverviewSet = {
  // Wert für ?anwendungsfall=, Anker und Basis für die Beschriftungs-ID
  id: string;
  card: UseCaseCard;
  kicker: string;
  title: string;
  intro: string;
  // Bausteine unter "So hängt es technisch zusammen"
  tech: TechBlocks;
};

// Kopf über den Karten
export const useCaseSection = {
  kicker: "ANWENDUNGSFÄLLE · BEISPIELE",
  title: "Wo ein Assistent im Büro unterstützen kann",
  intro:
    "Wähle einen Anwendungsfall. Darunter läuft ein Beispiel Schritt für Schritt ab.",
};

// Weitere Anwendungsfälle, für die es noch keine Demo gibt. Die Karten sind
// sichtbar, aber nicht auswählbar.
export const upcomingUseCases: UseCaseCard[] = [];

export const overviewSets: OverviewSet[] = [
  {
    id: "telefon",
    card: {
      title: "Kein Anruf geht verloren",
      teaser:
        "Der Assistent geht ran, wenn du nicht kannst, und schickt dir eine kurze Notiz aufs Handy.",
      icon: Phone,
      cta: "Gespräch anhören",
    },
    kicker: "ANWENDUNGSFALL · TELEFONASSISTENZ",
    title: "Feierabend im Büro. Der Assistent geht ran.",
    intro:
      "Er fragt das Wichtige ab, erkennt Notfälle und schickt dir eine kurze Zusammenfassung aufs Handy. Dein Team ruft zurück und entscheidet.",
    tech: {
      input: {
        text: "Deine Nummer bleibt. Anrufe, die niemand annimmt oder die auf besetzt treffen, leitet sie an den Assistenten weiter.",
        tools: [{ role: "Telefonie", name: "sipgate" }],
      },
      assistant: {
        text: "Versteht die Anruferin, fragt Adresse und Fehlerbild ab und erkennt Notfälle nach deinen Regeln.",
        tools: [
          {
            role: "Sprachassistent",
            name: "ElevenLabs Agents oder Vapi mit Deepgram",
          },
          llm,
        ],
      },
      connection: {
        text: "Ein eigener Dienst legt den Vorgang in deiner Software an, du bekommst eine kurze Nachricht aufs Handy.",
        tools: [
          flow,
          { role: "Eigene Anbindung", name: "Python (FastAPI)" },
          {
            role: "Nachricht aufs Handy",
            name: "WhatsApp Business über 360dialog, alternativ SMS",
          },
        ],
      },
      operationsNotes: [
        "Der Sprachassistent ist ein US-Anbieter; EU-Datenhaltung gibt es meist nur in höheren Tarifen.",
        "Anrufer hören zu Beginn, dass ein digitaler Assistent spricht (EU AI Act). Aufgezeichnet wird nur mit Hinweis.",
        "Die WhatsApp-Nachricht läuft über Meta und enthält deshalb nur eine kurze Zusammenfassung ohne sensible Details. Wer das nicht möchte, bekommt SMS oder E-Mail.",
      ],
    },
  },
  {
    id: "anfragen",
    card: {
      title: "Anfragen beantworten",
      teaser:
        "Mails lesen, Kunden zuordnen und einen Antwortentwurf vorbereiten.",
      icon: MessagesSquare,
    },
    kicker: "ANWENDUNGSFALL · KUNDENANFRAGEN",
    title: "Die Anfrage kommt rein. Die Antwort liegt bereit.",
    intro:
      "Der Assistent liest die Mail, findet Kunde und passende Unterlagen und schreibt einen Antwortentwurf. Dein Team prüft und sendet selbst.",
    tech: {
      input: {
        text: "Dein Postfach und das Formular deiner Homepage.",
        tools: [
          {
            role: "Postfach",
            name: "Microsoft 365 über Graph API oder IMAP, z. B. IONOS",
          },
          { role: "Formular", name: "WordPress (Contact Form 7) per Webhook" },
        ],
      },
      assistant: {
        text: "Liest Mail und Anhänge, findet oder legt den Kunden an und schreibt einen Entwurf mit Quelle.",
        tools: [llm, { role: "Anhänge & Kundenzuordnung", name: "Python" }],
      },
      connection: {
        text: "Der Entwurf liegt im Postfach, der Vorgang in deiner Software.",
        tools: [flow],
      },
    },
  },
  {
    id: "angebote",
    card: {
      title: "Angebote vorbereiten",
      teaser:
        "Aus der Notiz vom Termin wird ein Angebotsentwurf. Offene Angebote gehen nicht unter.",
      icon: FileText,
    },
    kicker: "ANWENDUNGSFALL · ANGEBOTE",
    title: "Du warst beim Kunden. Das Angebot liegt bereit.",
    intro:
      "Der Assistent macht aus deiner Notiz einen Angebotsentwurf mit deinen Preisen, weist auf fehlende Positionen hin und erinnert an offene Angebote. Dein Team prüft und sendet selbst.",
    tech: {
      input: {
        text: "Sprachnotiz oder Stichpunkte vom Handy, per WhatsApp.",
        tools: [{ role: "Eingang", name: "WhatsApp" }],
      },
      assistant: {
        text: "Wandelt die Sprachnotiz in Text um und gleicht die Positionen mit der Preisliste deines Großhändlers ab.",
        tools: [
          { role: "Spracherkennung", name: "Whisper über Azure (EU)" },
          llm,
          { role: "Preisabgleich", name: "Python mit DATANORM-Preisliste" },
        ],
      },
      connection: {
        text: "Angebotsentwurf in deiner Software.",
        tools: [
          flow,
          { role: "Software", name: "z. B. Lexware Office über dessen API" },
        ],
      },
      operationsNotes: [
        "Die Sprachnotiz kommt per WhatsApp herein; umgewandelt wird sie über Azure in der EU.",
      ],
    },
  },
  {
    id: "termine",
    card: {
      title: "Termine & Einsätze planen",
      teaser: "Termine finden, Notfälle einschieben, Ausfälle auffangen.",
      icon: CalendarDays,
    },
    kicker: "ANWENDUNGSFALL · TERMINE & EINSÄTZE",
    title: "Der Plan ändert sich. Der Vorschlag liegt bereit.",
    intro:
      "Der Assistent schaut in den Kalender, prüft, wer es kann und wer in der Nähe ist, und bereitet Plan und Kundennachrichten vor. Dein Team entscheidet und sendet selbst.",
    tech: {
      input: {
        text: "Nachrichten von Kunden und Monteuren.",
        tools: [],
      },
      assistant: {
        text: "Sucht freie Zeitfenster inklusive Fahrzeit und prüft, wer es kann und wer in der Nähe ist.",
        tools: [
          llm,
          {
            role: "Zeitfenster & Fahrzeit",
            name: "Python mit Google Maps Routes API",
          },
          {
            role: "Terminbestätigung",
            name: "Python, als Entwurf zur Freigabe",
          },
        ],
      },
      connection: {
        text: "Vorschlag im Kalender bzw. in der Plantafel deiner Software, dazu die Terminbestätigung als Entwurf. Dein Team gibt sie frei.",
        tools: [
          flow,
          {
            role: "Kalender",
            name: "Outlook (Microsoft 365) oder Plantafel der Handwerkersoftware, je nach Schnittstelle",
          },
        ],
      },
      operationsNotes: [
        "Für die Fahrzeit geht nur die Adresse an Google Maps, ohne Namen oder Anliegen.",
      ],
    },
  },
  {
    id: "rechnungen",
    card: {
      title: "Rechnungen & Erinnerungen",
      teaser:
        "Rechnung nach Auftragsende, offene Posten und Zahlungen im Blick.",
      icon: ReceiptText,
    },
    kicker: "ANWENDUNGSFALL · RECHNUNGEN & ERINNERUNGEN",
    title: "Der Auftrag ist fertig. Die Rechnung liegt bereit.",
    intro:
      "Der Assistent gleicht Angebot, Stunden und Zahlungseingänge ab, bereitet Rechnung oder Erinnerung vor und nennt den Grund dafür. Dein Team entscheidet und sendet selbst.",
    tech: {
      input: {
        text: "Fertigmeldung, Hinweis aus der Software, Zahlungseingang vom Konto.",
        tools: [
          {
            role: "Zahlungseingänge",
            name: "Lexware Office über API oder CAMT.053-Kontoauszug",
          },
        ],
      },
      assistant: {
        text: "Gleicht Betrag, Rechnungsnummer und Verwendungszweck ab, ordnet Unklares zu und formuliert die Erinnerung.",
        tools: [llm, { role: "Abgleich", name: "Python" }],
      },
      connection: {
        text: "Rechnungs- oder Erinnerungsentwurf in deiner Software.",
        tools: [flow],
      },
    },
  },
];
