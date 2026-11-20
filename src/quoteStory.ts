// Beispielfälle für die Angebots-Demo. Betrieb, Personen, Adressen,
// Leistungen und Preise sind erfunden (Beispielpreise).

// Woher eine Angabe stammt
export type QuoteOrigin = "input" | "crm" | "prices" | "history";

export type QuoteStepKind = "read" | "crm" | "prices" | "history" | "write";

export type QuoteInputKind = "voice" | "notes" | "sent";

export type QuotePosition = {
  text: string;
  quantity: number;
  unit: string;
  // Einzelpreis netto in Euro. Fehlt er, ist die Position offen.
  price?: number;
  // "open": Preis steht nicht in der Preisliste, das Team trägt ihn ein.
  // "suggestion": Vorschlag aus ähnlichen Angeboten, das Team entscheidet.
  kind?: "open" | "suggestion";
  // Preis, den das Team bei einer offenen Position einträgt
  teamPrice?: number;
};

export type QuoteParagraph = {
  text: string;
  // Offene Stelle: text ist der Hinweis, team der Satz, den das Team ergänzt
  team?: string;
};

export type QuoteField = {
  label: string;
  value: string;
  origin: QuoteOrigin;
  // Index des Assistenten-Schritts, nach dem die Angabe feststeht
  step: number;
  open?: boolean;
  // Wert nach dem Senden, wenn das Team die Stelle geklärt hat
  sent?: string;
  // Beschriftung nach dem Senden, falls sich die Bedeutung ändert ("Offen")
  sentLabel?: string;
};

export type QuoteCase = {
  id: string;
  headline: string;
  customer: string;
  initials: string;
  subject: string;
  // Zeitangabe in der Liste
  time: string;
  // Kennzeichen in der Liste: Art des Eingangs und Ausgangsstatus
  channel: string;
  tag: string;
  // Kennzeichen nach dem Senden
  sentTag: string;
  input: {
    kind: QuoteInputKind;
    title: string;
    meta: string;
    lines?: string[];
    form?: { label: string; value: string }[];
    attachments?: string[];
  };
  // Textstellen, die der Assistent beim Lesen markiert
  marks: string[];
  steps: { kind: QuoteStepKind; label: string; result: string }[];
  // Entweder ein Angebot mit Positionen oder eine Nachfass-Mail
  positions?: QuotePosition[];
  mail?: { salutation: string; paragraphs: QuoteParagraph[] };
  fields: QuoteField[];
};

export const quoteStory = {
  without:
    "Notizen vom Termin bleiben liegen. Angebote schreibst du abends, Positionen gehen unter, und bei verschickten Angeboten hakt niemand nach.",
  with: "Aus deiner Notiz wird ein Angebotsentwurf mit deinen Preisen. Fehlendes ist markiert, offene Angebote kommen von selbst wieder hoch.",
  closing: "Viele Grüße\nIhr Team von Haustechnik Mustermann",
  vatRate: 0.19,
  cases: [
    {
      id: "termin",
      headline: "Vom Vor-Ort-Termin zum Angebot",
      customer: "Thomas Brandt",
      initials: "TB",
      subject: "Badsanierung",
      time: "Di 18:05",
      channel: "Deine Sprachnotiz",
      tag: "Neu",
      sentTag: "Gesendet",
      input: {
        kind: "voice",
        title: "Deine Sprachnotiz",
        meta: "Von dir diktiert · Dienstag 18:05 · nach dem Termin bei Thomas Brandt",
        lines: [
          "Besichtigung bei Brandt, Am Anger 3. Bad im Obergeschoss, 8 Quadratmeter.",
          "Wanne raus, dafür bodengleiche Dusche, 90 auf 120, mit Glasabtrennung.",
          "Fliesen komplett neu: Boden 8 Quadratmeter, Wand etwa 22. Waschtisch und WC bleiben.",
          "Altes Material nehmen wir mit. Start wäre ab März möglich.",
        ],
        attachments: ["4 Fotos", "Aufmaß-Skizze"],
      },
      marks: [
        "Brandt, Am Anger 3",
        "8 Quadratmeter",
        "Wanne raus",
        "bodengleiche Dusche, 90 auf 120",
        "Glasabtrennung",
        "Wand etwa 22",
        "Altes Material nehmen wir mit",
        "ab März",
      ],
      steps: [
        { kind: "read", label: "Hört die Sprachnotiz ab", result: "Leistungen und Maße erkannt" },
        { kind: "crm", label: "Findet Kunde und Anfrage", result: "Thomas Brandt, Anfrage Badsanierung" },
        { kind: "prices", label: "Sucht Positionen in deiner Preisliste", result: "5 von 6 Positionen mit Preis" },
        { kind: "history", label: "Vergleicht mit ähnlichen Angeboten", result: "Keine Position fehlt" },
        { kind: "write", label: "Schreibt das Angebot", result: "Angebotsentwurf bereit" },
      ],
      positions: [
        { text: "Badewanne und Altfliesen demontieren", quantity: 1, unit: "pauschal", price: 680 },
        { text: "Bodengleiche Dusche 90 × 120 cm inkl. Abdichtung", quantity: 1, unit: "Stück", price: 1850 },
        { text: "Bodenfliesen liefern und verlegen", quantity: 8, unit: "m²", price: 95 },
        { text: "Wandfliesen liefern und verlegen", quantity: 22, unit: "m²", price: 89 },
        { text: "Glasabtrennung 120 cm", quantity: 1, unit: "Stück", kind: "open", teamPrice: 740 },
        { text: "Bauschutt entsorgen", quantity: 1, unit: "pauschal", price: 240 },
      ],
      fields: [
        { label: "Kunde", value: "Thomas Brandt · Am Anger 3, Freising", origin: "crm", step: 1 },
        { label: "Leistung", value: "Badsanierung OG, ca. 8 m², bodengleiche Dusche", origin: "input", step: 0 },
        { label: "Ausführung", value: "ab März möglich", origin: "input", step: 0 },
        {
          label: "Offen",
          value: "Preis Glasabtrennung fehlt in der Preisliste",
          origin: "prices",
          step: 2,
          open: true,
          sent: "Preis Glasabtrennung eingetragen",
          sentLabel: "Geprüft",
        },
      ],
    },
    {
      id: "vollstaendig",
      headline: "Nichts vergessen",
      customer: "Sabine Krüger",
      initials: "SK",
      subject: "Heizungstausch",
      time: "Mi 07:40",
      channel: "Deine Stichpunkte",
      tag: "Neu",
      sentTag: "Gesendet",
      input: {
        kind: "notes",
        title: "Deine Stichpunkte",
        meta: "Von dir getippt · Mittwoch 07:40 · für das Angebot an Sabine Krüger",
        lines: [
          "Krüger, Lindenstraße 8, Erding",
          "Gaskessel von 1998 raus",
          "Luft/Wasser-Wärmepumpe 8 kW, Außenaufstellung",
          "Pufferspeicher 200 l",
          "Inbetriebnahme und Einweisung",
        ],
      },
      marks: [
        "Krüger, Lindenstraße 8, Erding",
        "Gaskessel von 1998 raus",
        "Wärmepumpe 8 kW",
        "Außenaufstellung",
        "Pufferspeicher 200 l",
        "Inbetriebnahme und Einweisung",
      ],
      steps: [
        { kind: "read", label: "Liest deine Stichpunkte", result: "Heizungstausch, 4 Positionen" },
        { kind: "crm", label: "Findet die Kundin", result: "Sabine Krüger, Bestandskundin" },
        { kind: "prices", label: "Sucht Positionen in deiner Preisliste", result: "4 von 4 Positionen mit Preis" },
        { kind: "history", label: "Vergleicht mit ähnlichen Angeboten", result: "3 Positionen fehlen" },
        { kind: "write", label: "Schreibt das Angebot", result: "Entwurf mit 3 Vorschlägen bereit" },
      ],
      positions: [
        { text: "Gaskessel demontieren", quantity: 1, unit: "pauschal", price: 450 },
        { text: "Luft/Wasser-Wärmepumpe 8 kW liefern und montieren", quantity: 1, unit: "Stück", price: 14900 },
        { text: "Pufferspeicher 200 l", quantity: 1, unit: "Stück", price: 1280 },
        { text: "Inbetriebnahme und Einweisung", quantity: 1, unit: "pauschal", price: 390 },
        { text: "Altkessel entsorgen", quantity: 1, unit: "pauschal", price: 180, kind: "suggestion" },
        { text: "Hydraulischer Abgleich", quantity: 1, unit: "pauschal", price: 520, kind: "suggestion" },
        { text: "Fundament für das Außengerät", quantity: 1, unit: "Stück", price: 640, kind: "suggestion" },
      ],
      fields: [
        { label: "Kundin", value: "Sabine Krüger · Bestandskundin", origin: "crm", step: 1 },
        { label: "Objekt", value: "Lindenstraße 8, Erding", origin: "input", step: 0 },
        { label: "Leistung", value: "Heizungstausch auf Wärmepumpe 8 kW", origin: "input", step: 0 },
        {
          label: "Vorschläge",
          value: "3 Positionen aus ähnlichen Angeboten · noch zu entscheiden",
          origin: "history",
          step: 3,
          open: true,
          sent: "3 Positionen übernommen",
        },
      ],
    },
    {
      id: "nachfassen",
      headline: "Nachfassen",
      customer: "Jürgen Maier",
      initials: "JM",
      subject: "Enthärtungsanlage",
      time: "vor 8 Tagen",
      channel: "Euer Angebot",
      tag: "8 Tage offen",
      sentTag: "Nachgefasst",
      input: {
        kind: "sent",
        title: "Angebot A-0131 · Enthärtungsanlage einbauen",
        meta: "Von euch gesendet an Jürgen Maier",
        form: [
          { label: "Gesendet", value: "vor 8 Tagen per E-Mail" },
          { label: "Summe", value: "2.640,00 € netto" },
          { label: "Gültig", value: "30 Tage ab Versand" },
          { label: "Seitdem", value: "Keine Antwort, kein Anruf vermerkt" },
        ],
      },
      marks: ["vor 8 Tagen", "30 Tage", "Keine Antwort"],
      steps: [
        { kind: "read", label: "Prüft deine offenen Angebote", result: "Seit 8 Tagen ohne Antwort" },
        { kind: "history", label: "Schaut in den Verlauf", result: "Kein Kontakt seit dem Versand" },
        { kind: "write", label: "Schreibt die Nachfrage", result: "Entwurf und Wiedervorlage bereit" },
      ],
      mail: {
        salutation: "Guten Tag Herr Maier,",
        paragraphs: [
          {
            text: "vor gut einer Woche haben wir Ihnen unser Angebot für den Einbau der Enthärtungsanlage geschickt. Ist es gut bei Ihnen angekommen?",
          },
          {
            text: "Falls Sie Fragen zu einzelnen Positionen haben oder etwas anpassen möchten, melden Sie sich gern.",
          },
          {
            text: "Rückruf oder Termin anbieten",
            team: "Ich rufe Sie am Donnerstag gegen 16 Uhr kurz an, falls Ihnen das passt.",
          },
        ],
      },
      fields: [
        { label: "Angebot", value: "A-0131 · Enthärtungsanlage", origin: "crm", step: 0 },
        { label: "Kunde", value: "Jürgen Maier · Bestandskunde", origin: "crm", step: 0 },
        { label: "Stand", value: "gesendet vor 8 Tagen · keine Antwort", origin: "history", step: 1 },
        {
          label: "Wiedervorlage",
          value: "noch offen",
          origin: "history",
          step: 1,
          open: true,
          sent: "Donnerstag 16 Uhr · Rückruf",
        },
      ],
    },
  ] as QuoteCase[],
};
