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
  id: "email-request" | "email-question" | "form-request";
  channel: OverviewChannel;
  system: OverviewSystem;
  // Name eines Eintrags aus src/integrations.ts, der in diesem Beispiel
  // leuchtet. Nur für system "crm". Beispiel, keine Aussage über einen Kunden.
  tool?: string;
  label: string;
  headline: string;
  // Eingang, Assistent, System, Team
  steps: [OverviewStep, OverviewStep, OverviewStep, OverviewStep];
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
        chip: "Anfrage angelegt",
        text: "Ein Vorschlag für eine neue Anfrage liegt bereit. Offene Punkte, etwa das Typenschildfoto, sind markiert.",
      },
      teamStep,
    ],
    detailDemo: true,
  },
  {
    id: "email-question",
    channel: "email",
    system: "knowledge",
    label: "E-Mail: Allgemeine Frage",
    headline: "Allgemeine Frage per E-Mail",
    steps: [
      {
        chip: "Mehrteilige Frage",
        text: `${scenarios.complete.sender} stellt eine mehrteilige Frage zu Wartung, Vorbereitung und Preis.`,
      },
      {
        chip: `${matchedSources} von ${sources.length} Dokumenten`,
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
    channel: "form",
    system: "crm",
    tool: "ToolTime",
    label: "Formular: Neue Anfrage",
    headline: "Neue Anfrage über die Homepage",
    steps: [
      {
        chip: "Formular ausgefüllt",
        text: "Eine Anfrage kommt über das Formular auf der Homepage herein (Beispiel).",
      },
      {
        chip: "Angaben übernommen",
        text: "Die Angaben aus dem Formular werden den passenden Feldern zugeordnet.",
      },
      {
        chip: "Anfrage angelegt",
        text: "In der Kundenverwaltung entsteht eine neue Anfrage. Fehlende Angaben sind markiert.",
      },
      {
        chip: "Team prüft",
        text: "Dein Team prüft, fragt bei Bedarf nach und meldet sich selbst.",
      },
    ],
    detailDemo: false,
  },
];
