import { scenarios, sources } from "./data";

// Beispielfälle der Überblick-Animation. Alles ist eine Simulation mit
// erfundenen Beispieldaten; die E-Mail-Fälle nutzen dieselben Szenarien wie
// die Detaildemo.

export type OverviewChannel = "email" | "form";
export type OverviewSystem = "crm" | "knowledge";

export type OverviewStep = {
  // Kurzer Text auf der Linie
  chip: string;
  // Vollständiger Satz für Statuszeile, Handy- und Textansicht
  text: string;
};

export type OverviewCase = {
  id:
    | "email-request"
    | "email-question"
    | "form-request"
    | "email-fault"
    | "form-excel";
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

export const channelNames: Record<OverviewChannel, string> = {
  email: "E-Mail",
  form: "Homepage-Formular",
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
