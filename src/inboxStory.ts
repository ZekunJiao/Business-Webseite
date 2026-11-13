// Beispielmails für die Posteingang-Demo. Betrieb, Personen, Adressen,
// Anlagen und Unterlagen sind erfunden.

// Woher eine Angabe im Eintrag stammt
export type InboxOrigin = "mail" | "crm";

export type InboxStepKind = "read" | "crm" | "docs" | "urgent" | "write";

export type InboxField = {
  label: string;
  value: string;
  origin: InboxOrigin;
  // Index des Assistenten-Schritts, nach dem die Angabe feststeht
  step: number;
  // Fehlende oder zu klärende Angabe, orange markiert
  open?: boolean;
  urgent?: boolean;
  // Wert nach dem Senden, wenn das Team die Stelle ergänzt hat
  sent?: string;
};

export type DraftParagraph = {
  text: string;
  // Dokument aus den Unterlagen des Betriebs
  source?: string;
  // Offene Stelle: text ist der Hinweis, team der Satz, den das Team ergänzt
  team?: string;
};

export type InboxCase = {
  id: string;
  headline: string;
  from: string;
  initials: string;
  // Uhrzeit, der Posteingang ist danach sortiert (neueste oben)
  time: string;
  subject: string;
  // Entweder Mailtext oder ausgefülltes Kontaktformular
  body?: string[];
  form?: { label: string; value: string }[];
  // Textstellen, die der Assistent beim Lesen markiert
  marks: string[];
  attachment?: string;
  urgent?: boolean;
  steps: { kind: InboxStepKind; label: string; result: string }[];
  fields: InboxField[];
  draft: { salutation: string; paragraphs: DraftParagraph[] };
};

export const inboxStory = {
  without:
    "Mails sammeln sich. Abends suchst du Kundendaten und Unterlagen zusammen und schreibst jede Antwort von Hand.",
  with: "Zu jeder Mail liegen Kunde, Anliegen und ein Antwortentwurf bereit. Offenes ist markiert.",
  closing: "Viele Grüße\nIhr Team von Haustechnik Muster",
  cases: [
    {
      id: "neu",
      headline: "Neue Anfrage über das Kontaktformular",
      from: "Thomas Brandt",
      initials: "TB",
      time: "09:15",
      subject: "Neue Anfrage: Badsanierung",
      form: [
        { label: "Name", value: "Thomas Brandt" },
        { label: "Adresse", value: "Am Anger 3, Freising" },
        { label: "Anliegen", value: "Badsanierung" },
        {
          label: "Nachricht",
          value:
            "Bad im Obergeschoss, etwa 8 m². Die Badewanne soll raus, wir hätten gern eine bodengleiche Dusche. Das Haus ist von 1978. Können Sie uns ein Angebot machen?",
        },
        { label: "Besichtigung", value: "werktags ab 17 Uhr" },
      ],
      marks: [
        "Thomas Brandt",
        "Am Anger 3, Freising",
        "Badsanierung",
        "etwa 8 m²",
        "bodengleiche Dusche",
        "von 1978",
        "werktags ab 17 Uhr",
      ],
      steps: [
        { kind: "read", label: "Liest die Anfrage", result: "Badsanierung, Besichtigung gewünscht" },
        { kind: "crm", label: "Sucht in der Kundenverwaltung", result: "Kein Eintrag: neuer Kunde" },
        { kind: "docs", label: "Schaut in deine Unterlagen", result: "Merkblatt Badsanierung" },
        { kind: "write", label: "Schreibt den Entwurf", result: "Antwort und neuer Eintrag bereit" },
      ],
      fields: [
        { label: "Kunde", value: "Thomas Brandt · neu angelegt", origin: "crm", step: 1 },
        { label: "Objekt", value: "Am Anger 3, Freising · Baujahr 1978", origin: "mail", step: 0 },
        {
          label: "Anliegen",
          value: "Bad im OG, ca. 8 m²: Wanne raus, bodengleiche Dusche",
          origin: "mail",
          step: 0,
        },
        {
          label: "Besichtigung",
          value: "werktags ab 17 Uhr · Termin noch offen",
          origin: "mail",
          step: 0,
          open: true,
          sent: "Di 17:30 Uhr · vorgeschlagen",
        },
      ],
      draft: {
        salutation: "Guten Tag Herr Brandt,",
        paragraphs: [
          { text: "vielen Dank für Ihre Anfrage zur Badsanierung." },
          {
            text: "Damit wir die Besichtigung gut vorbereiten können, schicken Sie uns bitte ein paar Fotos vom jetzigen Bad und, falls vorhanden, einen Grundriss.",
            source: "Merkblatt Badsanierung",
          },
          {
            text: "Besichtigungstermin werktags ab 17 Uhr vorschlagen",
            team: "Gern kommen wir am Dienstag um 17:30 Uhr zur Besichtigung vorbei.",
          },
          {
            text: "Ein Angebot erstellen wir Ihnen nach der Besichtigung.",
            source: "Preise und Angebote",
          },
        ],
      },
    },
    {
      id: "wartung",
      headline: "Wartungswunsch einer Bestandskundin",
      from: "Lena Hoffmann",
      initials: "LH",
      time: "08:30",
      subject: "Wartung Wärmepumpe Musterweg 14",
      body: [
        "Guten Tag,",
        "unsere Wärmepumpe am Musterweg 14 braucht wieder eine Wartung. Seit ein paar Wochen läuft sie beim Starten lauter als sonst. Können Sie sich das dabei mit ansehen?",
        "Termine passen uns dienstags ab 14 Uhr oder freitags vormittags.",
        "Viele Grüße\nLena Hoffmann",
      ],
      marks: [
        "Wärmepumpe",
        "Musterweg 14",
        "Wartung",
        "lauter als sonst",
        "dienstags ab 14 Uhr",
        "freitags vormittags",
      ],
      steps: [
        { kind: "read", label: "Liest die Mail", result: "Wartung, Geräusch, Terminwunsch" },
        { kind: "crm", label: "Sucht in der Kundenverwaltung", result: "Bestandskundin, Anlage hinterlegt" },
        { kind: "docs", label: "Schaut in deine Unterlagen", result: "Leistungen Wartung" },
        { kind: "write", label: "Schreibt den Entwurf", result: "Antwort und Eintrag bereit" },
      ],
      fields: [
        { label: "Kundin", value: "Lena Hoffmann · Bestandskundin", origin: "crm", step: 1 },
        {
          label: "Anlage",
          value: "Wärmepumpe, Baujahr 2021 · Modell fehlt",
          origin: "crm",
          step: 1,
          open: true,
        },
        { label: "Anliegen", value: "Wartung, lauteres Anlaufen mitprüfen", origin: "mail", step: 0 },
        {
          label: "Zeitfenster",
          value: "Di ab 14 Uhr oder Fr vormittags · Termin noch offen",
          origin: "mail",
          step: 0,
          open: true,
          sent: "Di 14:30 Uhr · vorgeschlagen",
        },
      ],
      draft: {
        salutation: "Guten Tag Frau Hoffmann,",
        paragraphs: [
          {
            text: "danke für Ihre Nachricht. Die Wartung Ihrer Wärmepumpe am Musterweg 14 übernehmen wir gern und sehen uns das lautere Anlaufen dabei mit an.",
          },
          {
            text: "Damit wir das passende Material dabeihaben, schicken Sie uns bitte ein Foto vom Typenschild.",
          },
          {
            text: "Reparaturen und Ersatzteile sind in der Wartung nicht enthalten. Falls nötig, stimmen wir sie vorher mit Ihnen ab.",
            source: "Leistungen Wartung",
          },
          {
            text: "Termin dienstags ab 14 Uhr oder freitags vormittags vorschlagen",
            team: "Als Termin schlagen wir Dienstag um 14:30 Uhr vor.",
          },
        ],
      },
    },
    {
      id: "stoerung",
      headline: "Störungsmeldung mit Foto",
      from: "Markus Weber",
      initials: "MW",
      time: "06:58",
      subject: "Heizung zeigt Fehler, kein warmes Wasser",
      body: [
        "Hallo,",
        "unsere Heizung zeigt seit heute Morgen einen Fehler an, ein Foto vom Display hängt an. Die Heizkörper werden noch warm, aber es kommt kein warmes Wasser mehr.",
        "Können Sie heute noch jemanden schicken? Wir sind ab 13 Uhr zu Hause.",
        "Gruß\nMarkus Weber, Birkenweg 5",
      ],
      marks: [
        "einen Fehler an",
        "Foto vom Display",
        "kein warmes Wasser",
        "heute noch",
        "ab 13 Uhr",
        "Birkenweg 5",
      ],
      attachment: "Foto_Display.jpg",
      urgent: true,
      steps: [
        { kind: "read", label: "Liest die Mail", result: "Störung, kein Warmwasser, Foto" },
        { kind: "urgent", label: "Erkennt die Dringlichkeit", result: "Dringend: nach oben sortiert" },
        { kind: "crm", label: "Sucht in der Kundenverwaltung", result: "Wartungsvertrag, Gerät hinterlegt" },
        { kind: "write", label: "Schreibt den Entwurf", result: "Antwort und Eintrag bereit" },
      ],
      fields: [
        {
          label: "Dringlichkeit",
          value: "Dringend · heute klären",
          origin: "mail",
          step: 1,
          urgent: true,
        },
        { label: "Kunde", value: "Markus Weber, Birkenweg 5 · Wartungsvertrag", origin: "crm", step: 2 },
        { label: "Anlage", value: "Gas-Brennwertgerät, Baujahr 2015", origin: "crm", step: 2 },
        { label: "Anliegen", value: "Fehleranzeige, kein Warmwasser", origin: "mail", step: 0 },
        {
          label: "Erreichbar",
          value: "heute ab 13 Uhr · Einsatz noch offen",
          origin: "mail",
          step: 0,
          open: true,
          sent: "Einsatz heute 13–15 Uhr · zugesagt",
        },
      ],
      draft: {
        salutation: "Guten Tag Herr Weber,",
        paragraphs: [
          {
            text: "danke für Ihre Meldung und das Foto. Wir haben die Störung als dringend aufgenommen.",
          },
          {
            text: "Einsatz heute ab 13 Uhr prüfen und Uhrzeit nennen",
            team: "Unser Techniker kommt heute zwischen 13 und 15 Uhr bei Ihnen vorbei.",
          },
          {
            text: "Ob der Einsatz unter Ihren Wartungsvertrag fällt, klären wir vor Ort.",
            source: "Leistungen Wartung",
          },
        ],
      },
    },
  ] as InboxCase[],
};
