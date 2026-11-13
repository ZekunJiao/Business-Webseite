// Beispielmails für die Posteingang-Demo. Betrieb, Personen, Adressen und
// Anlagen sind erfunden. Quellen verweisen auf Titel aus dem Betriebswissen
// (sources in data.ts).

export type InboxField = {
  label: string;
  value: string;
  // Index des Assistenten-Schritts, nach dem die Angabe feststeht
  step: number;
  // Fehlende oder zu klärende Angabe, orange markiert
  open?: boolean;
  urgent?: boolean;
};

export type DraftParagraph = {
  text: string;
  // Platzhalter, den das Team ergänzt
  open?: boolean;
  source?: string;
};

export type InboxCase = {
  id: string;
  // Kurzname für Posteingang und Beispielzähler
  label: string;
  headline: string;
  from: string;
  via?: string;
  initials: string;
  time: string;
  subject: string;
  body: string[];
  attachment?: string;
  urgent?: boolean;
  steps: { label: string; detail: string }[];
  fields: InboxField[];
  draft: {
    salutation: string;
    paragraphs: DraftParagraph[];
  };
};

export const inboxStory = {
  business: "Haustechnik Muster",
  without:
    "Mails sammeln sich im Postfach. Abends suchst du Kundendaten und Unterlagen zusammen und schreibst jede Antwort von Hand.",
  with: "Zu jeder Mail liegen Kunde, Anliegen und ein Antwortentwurf bereit. Offenes ist markiert. Dein Team prüft und sendet.",
  closing: ["Viele Grüße", "Ihr Team von Haustechnik Muster"],
  afterwards: [
    "Der Eintrag landet in deiner Software, z. B. HERO, ToolTime oder Excel.",
    "Dein Team prüft den Entwurf, ergänzt Offenes und sendet selbst. Nichts geht automatisch raus.",
  ],
  cases: [
    {
      id: "neu",
      label: "Neue Anfrage",
      headline: "Badsanierung über das Kontaktformular",
      from: "Thomas Brandt",
      via: "Kontaktformular der Homepage",
      initials: "TB",
      time: "07:42",
      subject: "Kontaktformular: Badsanierung",
      body: [
        "Guten Tag,",
        "wir möchten unser Bad im Obergeschoss modernisieren, etwa 8 m². Die Badewanne soll raus, stattdessen hätten wir gern eine bodengleiche Dusche. Das Haus ist von 1978.",
        "Können Sie uns ein Angebot machen? Für eine Besichtigung sind wir werktags ab 17 Uhr zu Hause.",
        "Viele Grüße\nThomas Brandt\nAm Anger 3, Freising",
      ],
      steps: [
        {
          label: "Mail gelesen",
          detail: "Neue Anfrage: Badsanierung mit Besichtigungswunsch",
        },
        {
          label: "Kundenverwaltung geprüft",
          detail: "Kein Eintrag gefunden: neuer Kunde",
        },
        {
          label: "Betriebswissen durchsucht",
          detail: "Passend: „Badmodernisierung: Erstgespräch“",
        },
        {
          label: "Entwurf geschrieben",
          detail: "Antwort und neuer Eintrag liegen bereit",
        },
      ],
      fields: [
        { label: "Kunde", value: "Thomas Brandt · neu angelegt", step: 1 },
        { label: "Objekt", value: "Am Anger 3, Freising · Baujahr 1978", step: 0 },
        {
          label: "Anliegen",
          value: "Bad im OG, ca. 8 m²: Wanne raus, bodengleiche Dusche",
          step: 0,
        },
        {
          label: "Besichtigung",
          value: "werktags ab 17 Uhr · noch kein Termin",
          step: 0,
        },
        {
          label: "Offen",
          value: "Fotos, Grundriss und Wunschzeitraum anfragen",
          step: 2,
          open: true,
        },
      ],
      draft: {
        salutation: "Guten Tag Herr Brandt,",
        paragraphs: [
          { text: "vielen Dank für Ihre Anfrage zur Modernisierung Ihres Bades." },
          {
            text: "Damit wir die Besichtigung gut vorbereiten können, senden Sie uns bitte ein paar Fotos vom jetzigen Bad und, falls vorhanden, einen Grundriss. Bis wann soll das Bad fertig sein?",
            source: "Badmodernisierung: Erstgespräch",
          },
          {
            text: "Besichtigungstermin werktags ab 17 Uhr aus dem Kalender vorschlagen.",
            open: true,
          },
          {
            text: "Ein Angebot erstellen wir Ihnen nach der Besichtigung.",
            source: "Angebot und Preisermittlung",
          },
        ],
      },
    },
    {
      id: "wartung",
      label: "Wartung & Termin",
      headline: "Wartungswunsch einer Bestandskundin",
      from: "Lena Hoffmann",
      initials: "LH",
      time: "09:15",
      subject: "Wartung Wärmepumpe Musterweg 14",
      body: [
        "Guten Tag,",
        "unsere Wärmepumpe am Musterweg 14 braucht wieder eine Wartung. Seit ein paar Wochen läuft sie beim Starten lauter als sonst. Können Sie sich das dabei mit ansehen?",
        "Termine passen uns dienstags ab 14 Uhr oder freitags vormittags. Bitte schicken Sie uns vorher ein Angebot.",
        "Viele Grüße\nLena Hoffmann",
      ],
      steps: [
        {
          label: "Mail gelesen",
          detail: "Wartung, Geräusch prüfen, Terminwunsch, Angebot",
        },
        {
          label: "Kundenverwaltung geprüft",
          detail: "Bestandskundin, Anlage am Musterweg 14 gefunden",
        },
        {
          label: "Betriebswissen durchsucht",
          detail: "Passend: „Leistungsumfang und Abgrenzung“",
        },
        {
          label: "Entwurf geschrieben",
          detail: "Antwort und Eintrag liegen bereit",
        },
      ],
      fields: [
        { label: "Kundin", value: "Lena Hoffmann · Bestandskundin", step: 1 },
        {
          label: "Anlage",
          value: "Luft/Wasser-Wärmepumpe, Baujahr 2021 · Modell nicht hinterlegt",
          step: 1,
          open: true,
        },
        { label: "Anliegen", value: "Wartung, lauteres Anlaufen mitprüfen", step: 0 },
        {
          label: "Zeitfenster",
          value: "Di ab 14 Uhr oder Fr vormittags · noch kein Termin",
          step: 0,
        },
        {
          label: "Offen",
          value: "Typenschildfoto anfragen, Zeitbedarf für die Geräuschprüfung",
          step: 2,
          open: true,
        },
      ],
      draft: {
        salutation: "Guten Tag Frau Hoffmann,",
        paragraphs: [
          {
            text: "danke für Ihre Nachricht. Die Wartung Ihrer Wärmepumpe am Musterweg 14 nehmen wir gern auf. Das lautere Anlaufen sehen wir uns dabei mit an.",
          },
          {
            text: "Damit wir das passende Material dabeihaben, senden Sie uns bitte ein Foto vom Typenschild der Anlage.",
          },
          {
            text: "Im Angebot weisen wir Wartung, Anfahrt und mögliche Zusatzleistungen getrennt aus. Reparaturen und Ersatzteile stimmen wir vorher mit Ihnen ab.",
            source: "Leistungsumfang und Abgrenzung",
          },
          {
            text: "Termin dienstags ab 14 Uhr oder freitags vormittags aus dem Kalender vorschlagen.",
            open: true,
          },
        ],
      },
    },
    {
      id: "stoerung",
      label: "Störung",
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
      attachment: "Foto_Display.jpg",
      urgent: true,
      steps: [
        {
          label: "Mail gelesen",
          detail: "Störung: kein Warmwasser, Foto im Anhang",
        },
        {
          label: "Dringlichkeit erkannt",
          detail: "Als dringend markiert und oben einsortiert",
        },
        {
          label: "Kundenverwaltung geprüft",
          detail: "Bestandskunde mit Wartungsvertrag, Gerät hinterlegt",
        },
        {
          label: "Entwurf geschrieben",
          detail: "Antwort und Eintrag liegen bereit",
        },
      ],
      fields: [
        {
          label: "Dringlichkeit",
          value: "Dringend · heute klären",
          step: 1,
          urgent: true,
        },
        {
          label: "Kunde",
          value: "Markus Weber, Birkenweg 5 · Wartungsvertrag",
          step: 2,
        },
        { label: "Anlage", value: "Gas-Brennwertgerät, Baujahr 2015", step: 2 },
        {
          label: "Anliegen",
          value: "Fehleranzeige, kein Warmwasser · Foto vom Display",
          step: 0,
        },
        { label: "Erreichbar", value: "heute ab 13 Uhr", step: 0 },
        {
          label: "Offen",
          value: "Einsatz einplanen, Fehlercode auf dem Foto prüfen",
          step: 2,
          open: true,
        },
      ],
      draft: {
        salutation: "Guten Tag Herr Weber,",
        paragraphs: [
          {
            text: "danke für Ihre Meldung und das Foto. Wir haben Ihre Störung als dringend aufgenommen.",
          },
          {
            text: "Einsatz heute ab 13 Uhr prüfen und Uhrzeit nennen.",
            open: true,
          },
          {
            text: "Ob der Einsatz unter Ihren Wartungsvertrag fällt, klären wir nach der Prüfung vor Ort.",
            source: "Leistungsumfang und Abgrenzung",
          },
        ],
      },
    },
  ] satisfies InboxCase[] as InboxCase[],
};
