import {
  CalendarDays,
  FileText,
  MessagesSquare,
  Phone,
  ReceiptText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { scenarios, sources } from "./data";

// Beispielfälle der Überblick-Animation. Alles ist eine Simulation mit
// erfundenen Beispieldaten; die E-Mail-Fälle nutzen dieselben Szenarien wie
// die Detaildemo.

export type OverviewChannel = "email" | "form" | "phone";
export type OverviewSystem = "crm" | "knowledge";

export type OverviewStep = {
  // Kurzer Text auf der Linie
  chip: string;
  // Vollständiger Satz für Statuszeile, Handy- und Textansicht
  text: string;
};

export type OverviewCase = {
  id: string;
  channel: OverviewChannel;
  system: OverviewSystem;
  // Name eines Eintrags aus src/integrations.ts, der in diesem Beispiel
  // leuchtet. Nur für system "crm". Beispiel, keine Aussage über einen Kunden.
  // Namen ohne Eintrag dort (z. B. "Excel") leuchten in der Kachel
  // "Excel & andere".
  tool?: string;
  label: string;
  headline: string;
  // Eingang, Assistent, System, Team
  steps: [OverviewStep, OverviewStep, OverviewStep, OverviewStep];
  // Statuszeile unter "Dein Team" im letzten Schritt, z. B. "prüft die Anfrage".
  // Wird unverändert angezeigt.
  teamStatus: string;
  // Statuszeile unter dem Assistenten in Schritt 2 und 3, z. B.
  // "erkennt die Kundin …" und "bereitet die Anfrage vor …".
  assistantStatus: [string, string];
  // Statuszeile unter dem leuchtenden Werkzeug im letzten Schritt. Nutzt den
  // Begriff des jeweiligen Werkzeugs (z. B. "Projekt" bei HERO).
  toolStatus: string;
  // Gibt es dazu eine ausführliche Demo weiter unten?
  detailDemo: boolean;
};

const matchedSources = new Set(
  scenarios.complete.answerSources.filter((i): i is number => i !== null),
).size;

const teamStep = {
  chip: "Team prüft",
  text: "Dein Team prüft, ergänzt Offenes und sendet selbst. Nichts wird automatisch verschickt.",
};

// Karte in der Übersicht der Anwendungsfälle
export type UseCaseCard = {
  title: string;
  teaser: string;
  icon: LucideIcon;
};

// Ein Anwendungsfall: Karte, Überschrift, Fälle und die gezeigten Eingänge.
export type OverviewSet = {
  // Wert für ?anwendungsfall=, Anker und Basis für die Beschriftungs-ID
  id: string;
  card: UseCaseCard;
  kicker: string;
  title: string;
  intro: string;
  channels: OverviewChannel[];
  cases: OverviewCase[];
  // Zeile "Anbindbar an Handwerkersoftware" auf schmalen Bildschirmen
  showIntegrations: boolean;
};

export const channelNames: Record<OverviewChannel, string> = {
  email: "E-Mail",
  form: "Homepage-Formular",
  phone: "Telefon",
};

export const systemNames: Record<OverviewSystem, string> = {
  crm: "Kundenverwaltung",
  knowledge: "Betriebswissen",
};

export const overviewCases: OverviewCase[] = [
  {
    id: "email-request",
    teamStatus: "prüft das Angebot",
    assistantStatus: ["erkennt die Kundin …", "bereitet das Angebot vor …"],
    toolStatus: "Angebotsentwurf angelegt",
    channel: "email",
    system: "crm",
    tool: "plancraft",
    label: "E-Mail: Wartungsanfrage",
    headline: "Wartungsanfrage per E-Mail",
    steps: [
      {
        chip: "Wartungsanfrage",
        text: `${scenarios.partial.sender} fragt per E-Mail nach Wartung, Angebot und Termin.`,
      },
      {
        chip: "Kundin gefunden",
        text: "Der Assistent erkennt die Absenderin als Bestandskundin.",
      },
      {
        chip: "Angebotsentwurf bereit",
        text: "Ein Angebotsentwurf liegt bereit. Offene Punkte, etwa das Typenschildfoto, sind markiert.",
      },
      teamStep,
    ],
    detailDemo: true,
  },
  {
    id: "email-question",
    teamStatus: "prüft den Entwurf",
    assistantStatus: ["sucht im Betriebswissen …", "schreibt einen Entwurf …"],
    toolStatus: "Entwurf mit Quellen",
    channel: "email",
    system: "knowledge",
    label: "E-Mail: Allgemeine Frage",
    headline: "Allgemeine Frage per E-Mail",
    steps: [
      {
        chip: "Fragen zur Wartung",
        text: `${scenarios.complete.sender} stellt eine mehrteilige Frage zu Wartung, Vorbereitung und Preis.`,
      },
      {
        chip: `${matchedSources} relevante Dokumente gefunden`,
        text: `Der Assistent sucht im Betriebswissen: ${matchedSources} von ${sources.length} Dokumenten passen zur Frage.`,
      },
      {
        chip: "Antwort mit Quellen",
        text: "Ein Antwortentwurf entsteht. Jeder Absatz verweist auf seine Quelle.",
      },
      teamStep,
    ],
    detailDemo: true,
  },
  {
    id: "form-request",
    teamStatus: "prüft den Vorschlag",
    assistantStatus: ["übernimmt die Angaben …", "bereitet den Vorschlag vor …"],
    toolStatus: "Anfrage angelegt",
    channel: "form",
    system: "crm",
    tool: "ToolTime",
    label: "Formular: Neue Anfrage",
    headline: "Neue Anfrage über die Homepage",
    steps: [
      {
        chip: "Neue Anfrage",
        text: "Eine Anfrage kommt über das Formular auf der Homepage herein (Beispiel).",
      },
      {
        chip: "Angaben übernommen",
        text: "Die Angaben aus dem Formular werden den passenden Feldern zugeordnet.",
      },
      {
        chip: "Vorschlag bereit",
        text: "In der Kundenverwaltung liegt ein Vorschlag bereit. Fehlende Angaben sind markiert.",
      },
      {
        chip: "Team prüft",
        text: "Dein Team prüft, fragt bei Bedarf nach und meldet sich selbst.",
      },
    ],
    detailDemo: false,
  },
  {
    id: "email-fault",
    teamStatus: "prüft das Projekt",
    assistantStatus: ["ordnet den Kunden zu …", "bereitet das Projekt vor …"],
    toolStatus: "Projekt angelegt",
    channel: "email",
    system: "crm",
    tool: "HERO",
    label: "E-Mail: Störungsmeldung",
    headline: "Störungsmeldung per E-Mail",
    steps: [
      {
        chip: "Störungsmeldung",
        text: "Eine Bestandskundin schreibt, ihre Heizung zeige einen Fehler an, und hängt ein Foto an (Beispiel).",
      },
      {
        chip: "Kunde zugeordnet",
        text: "Der Assistent erkennt die Dringlichkeit und ordnet die Meldung dem passenden Kunden zu.",
      },
      {
        chip: "Projekt vorbereitet",
        text: "In HERO liegt ein Projekt zur Prüfung bereit. Fehlende Angaben, etwa die Gerätenummer, sind markiert.",
      },
      {
        chip: "Team prüft",
        text: "Dein Team prüft, plant den Termin und antwortet selbst. Nichts wird automatisch verschickt.",
      },
    ],
    detailDemo: false,
  },
  {
    id: "form-excel",
    teamStatus: "prüft die Zeile",
    assistantStatus: ["ordnet die Spalten zu …", "bereitet die Zeile vor …"],
    toolStatus: "Zeile eingetragen",
    channel: "form",
    system: "crm",
    tool: "Excel",
    label: "Formular: Anfrage in Excel",
    headline: "Anfrage über die Homepage landet in Excel",
    steps: [
      {
        chip: "Badsanierung",
        text: "Eine Anfrage zur Badsanierung kommt über das Formular auf der Homepage herein (Beispiel).",
      },
      {
        chip: "Spalten zugeordnet",
        text: "Der Assistent ordnet die Angaben den Spalten der bestehenden Anfragenliste zu.",
      },
      {
        chip: "Zeile vorbereitet",
        text: "In der Excel-Liste liegt eine neue Zeile bereit. Unklare Felder sind markiert.",
      },
      {
        chip: "Team prüft",
        text: "Dein Team prüft die Zeile, fragt bei Bedarf nach und meldet sich selbst.",
      },
    ],
    detailDemo: false,
  },
];

// Telefonassistenz: Beispielanrufe ohne reale Personen oder Ergebnisse. Der
// Assistent nimmt auf und bereitet vor; Entscheidung und Rückruf bleiben beim
// Team.
export const phoneCases: OverviewCase[] = [
  {
    id: "phone-appointment",
    teamStatus: "prüft den Termin",
    assistantStatus: ["nimmt das Anliegen auf …", "bereitet den Termin vor …"],
    toolStatus: "Terminvorschlag angelegt",
    channel: "phone",
    system: "crm",
    tool: "ToolTime",
    label: "Anruf: Terminwunsch",
    headline: "Terminwunsch am Telefon",
    steps: [
      {
        chip: "Terminwunsch",
        text: "Eine Bestandskundin ruft an und möchte einen Wartungstermin (Beispiel).",
      },
      {
        chip: "Anliegen aufgenommen",
        text: "Der Assistent nimmt das Gespräch an, fragt Anliegen und Wunschzeitraum ab und ordnet den Anruf der Kundin zu.",
      },
      {
        chip: "Terminvorschlag bereit",
        text: "In ToolTime liegt ein Terminvorschlag bereit. Offene Punkte sind markiert.",
      },
      {
        chip: "Team prüft",
        text: "Dein Team prüft den Vorschlag, bestätigt den Termin und meldet sich selbst.",
      },
    ],
    detailDemo: false,
  },
  {
    id: "phone-fault",
    teamStatus: "ruft zurück",
    assistantStatus: ["fragt das Fehlerbild ab …", "bereitet das Projekt vor …"],
    toolStatus: "Projekt angelegt",
    channel: "phone",
    system: "crm",
    tool: "HERO",
    label: "Anruf: Störung",
    headline: "Störungsmeldung am Telefon",
    steps: [
      {
        chip: "Heizung ausgefallen",
        text: "Eine Kundin meldet am Telefon, dass ihre Heizung ausgefallen ist (Beispiel).",
      },
      {
        chip: "Dringlichkeit erkannt",
        text: "Der Assistent fragt Adresse und Fehlerbild ab, erkennt die Dringlichkeit und ordnet den Anruf dem passenden Kunden zu.",
      },
      {
        chip: "Projekt vorbereitet",
        text: "In HERO liegt ein Projekt mit Gesprächsnotiz bereit. Fehlende Angaben, etwa die Gerätenummer, sind markiert.",
      },
      {
        chip: "Team ruft zurück",
        text: "Dein Team prüft die Meldung, ruft zurück und entscheidet selbst über den Einsatz.",
      },
    ],
    detailDemo: false,
  },
  {
    id: "phone-question",
    teamStatus: "liest die Notiz",
    assistantStatus: ["sucht im Betriebswissen …", "schreibt die Notiz …"],
    toolStatus: "Notiz mit Quelle",
    channel: "phone",
    system: "knowledge",
    label: "Anruf: Allgemeine Frage",
    headline: "Allgemeine Frage am Telefon",
    steps: [
      {
        chip: "Frage zur Wartung",
        text: "Ein Interessent fragt am Telefon nach Ablauf und Dauer einer Wartung (Beispiel).",
      },
      {
        chip: "Antwort gefunden",
        text: "Der Assistent sucht im Betriebswissen und antwortet nur mit Inhalten, die dein Team dafür bereitgestellt hat.",
      },
      {
        chip: "Notiz mit Quelle",
        text: "Eine Gesprächsnotiz hält Frage und Antwort fest und verweist auf die Quelle.",
      },
      {
        chip: "Team liest mit",
        text: "Dein Team liest die Notiz, ergänzt Offenes und meldet sich bei Bedarf selbst.",
      },
    ],
    detailDemo: false,
  },
  {
    id: "phone-afterhours",
    teamStatus: "ruft zurück",
    assistantStatus: ["nimmt den Rückrufwunsch auf …", "trägt den Rückruf ein …"],
    toolStatus: "Rückruf eingetragen",
    channel: "phone",
    system: "crm",
    tool: "Excel",
    label: "Anruf: Nach Feierabend",
    headline: "Anruf außerhalb der Geschäftszeiten",
    steps: [
      {
        chip: "Anruf nach Feierabend",
        text: "Nach Feierabend ruft ein Kunde an und erreicht im Büro niemanden (Beispiel).",
      },
      {
        chip: "Rückrufwunsch aufgenommen",
        text: "Der Assistent nimmt Name, Anliegen und Rückrufnummer auf.",
      },
      {
        chip: "Rückruf eingetragen",
        text: "In der Rückrufliste (z. B. Excel) liegt ein neuer Eintrag bereit. Unklare Angaben sind markiert.",
      },
      {
        chip: "Team ruft zurück",
        text: "Dein Team sieht die Liste am nächsten Morgen und ruft selbst zurück.",
      },
    ],
    detailDemo: false,
  },
];

// Kopf über den Karten
export const useCaseSection = {
  kicker: "ANWENDUNGSFÄLLE · BEISPIELE",
  title: "Wo ein Assistent im Büro unterstützen kann",
  intro:
    "Wähle einen Anwendungsfall. Darunter läuft ein Beispiel Schritt für Schritt ab.",
};

// Weitere Anwendungsfälle, für die es noch keine Demo gibt. Die Karten sind
// sichtbar, aber nicht auswählbar.
export const upcomingUseCases: UseCaseCard[] = [
  {
    title: "Angebote vorbereiten",
    teaser: "Angaben aus Anfragen übernehmen, Offenes sichtbar machen.",
    icon: FileText,
  },
  {
    title: "Termine & Einsätze planen",
    teaser: "Terminwünsche sammeln und Vorschläge vorbereiten.",
    icon: CalendarDays,
  },
  {
    title: "Rechnungen & Erinnerungen",
    teaser: "Offene Posten im Blick behalten, Erinnerungen vorbereiten.",
    icon: ReceiptText,
  },
];

export const overviewSets: OverviewSet[] = [
  {
    id: "anfragen",
    card: {
      title: "Anfragen beantworten",
      teaser:
        "E-Mails und Formulare erkennen, zuordnen und Antwort oder Eintrag vorbereiten.",
      icon: MessagesSquare,
    },
    kicker: "ANWENDUNGSFALL · KUNDENANFRAGEN",
    title: "Die Anfrage kommt rein. Die Antwort liegt bereit.",
    intro:
      "Ob E-Mail oder Formular: Der Assistent erkennt den Kunden, findet die passenden Infos in deinen Unterlagen und bereitet Antwort oder Eintrag vor. Dein Team prüft und sendet selbst.",
    channels: ["email", "form"],
    cases: overviewCases,
    showIntegrations: true,
  },
  {
    id: "telefon",
    card: {
      title: "Anrufe annehmen",
      teaser:
        "Auch nach Feierabend: Anliegen aufnehmen, Termin oder Rückruf vorbereiten.",
      icon: Phone,
    },
    kicker: "ANWENDUNGSFALL · TELEFONASSISTENZ",
    title: "Der Anruf kommt rein. Die Notiz liegt bereit.",
    intro:
      "Der Assistent nimmt den Anruf an, fragt das Wichtige ab, gleicht es mit deinen Unterlagen ab und legt Notiz, Terminvorschlag oder Rückruf an. Dein Team prüft und meldet sich selbst.",
    channels: ["phone"],
    cases: phoneCases,
    showIntegrations: false,
  },
];
