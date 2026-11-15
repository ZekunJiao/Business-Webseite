// Beispielfälle für die Termin-Demo. Betrieb, Monteure, Kunden, Adressen und
// Termine sind erfunden.

export type ScheduleStepKind = "read" | "calendar" | "skill" | "route" | "write";

// Bestehender Termin im Plan
export type ScheduleSlot = {
  id: string;
  tech: string;
  // Spalte des Plans, z. B. "Di" oder "Heute"
  col: string;
  time: string;
  label: string;
};

// Vorschlag des Assistenten. title und reason erscheinen unter dem Plan
// als Begründung.
export type ScheduleChange = { title: string; reason: string } & (
  | { kind: "add"; tech: string; col: string; time: string; label: string }
  // Bestehenden Termin an einen anderen Platz setzen
  | { kind: "move"; slot: string; tech: string; col: string; time: string }
  // Termin, für den es keinen Platz gibt: Das Team entscheidet.
  | { kind: "flag"; slot: string; flag: string; sent: string }
);

export type ScheduleMessage = {
  to: string;
  salutation: string;
  // team: Satz, den das Team an einer offenen Stelle ergänzt
  paragraphs: { text: string; team?: string }[];
};

export type ScheduleCase = {
  id: string;
  headline: string;
  // Eingang: wer schreibt, in welcher Rolle, über welchen Weg
  from: string;
  role: string;
  initials: string;
  channel: string;
  time: string;
  subject: string;
  body: string[];
  marks: string[];
  urgent?: boolean;
  // Kennzeichen in der Liste nach dem Senden
  sentTag: string;
  // Kennzeichen an neuen Terminen nach dem Senden
  confirmed: string;
  steps: { kind: ScheduleStepKind; label: string; result: string }[];
  columns: string[];
  techs: { name: string; skills: string; absent?: string }[];
  slots: ScheduleSlot[];
  changes: ScheduleChange[];
  messages: ScheduleMessage[];
};

const techs = [
  { name: "Jonas", skills: "Wärmepumpe, Gas" },
  { name: "Miriam", skills: "Wärmepumpe, Gas, Bad" },
  { name: "Erik", skills: "Sanitär, Bad" },
];

export const scheduleStory = {
  without:
    "Termine klären kostet Anrufe. Ein Notfall oder eine Krankmeldung wirft den Tag um, und du telefonierst allen hinterher.",
  with: "Der Assistent schlägt vor, wer wann fährt, nennt den Grund dafür und schreibt die Nachrichten an die betroffenen Kunden.",
  closing: "Viele Grüße\nIhr Team von Haustechnik Muster",
  cases: [
    {
      id: "termin",
      headline: "Termin finden",
      from: "Lena Hoffmann",
      role: "Kundin",
      initials: "LH",
      channel: "E-Mail",
      time: "08:30",
      subject: "Wartung Wärmepumpe",
      body: [
        "Guten Tag,",
        "die Wartung unserer Wärmepumpe am Musterweg 14 steht wieder an.",
        "Uns passt es dienstags ab 14 Uhr oder freitags vormittags.",
        "Viele Grüße\nLena Hoffmann",
      ],
      marks: [
        "Wartung unserer Wärmepumpe",
        "Musterweg 14",
        "dienstags ab 14 Uhr",
        "freitags vormittags",
      ],
      sentTag: "Angeboten",
      confirmed: "vorgemerkt",
      steps: [
        { kind: "read", label: "Liest den Terminwunsch", result: "Wartung, Di ab 14 Uhr oder Fr vormittags" },
        { kind: "calendar", label: "Schaut in den Kalender", result: "2 freie Fenster gefunden" },
        { kind: "skill", label: "Prüft, wer es kann", result: "Jonas und Miriam: Wärmepumpe" },
        { kind: "route", label: "Prüft Fahrweg und Material", result: "Di: Jonas ist 5 Minuten entfernt" },
        { kind: "write", label: "Schreibt den Vorschlag", result: "2 Termine und Nachricht bereit" },
      ],
      columns: ["Di", "Fr"],
      techs,
      slots: [
        { id: "j-di", tech: "Jonas", col: "Di", time: "8–13 Uhr", label: "Wartung Ahornweg 3" },
        { id: "j-fr", tech: "Jonas", col: "Fr", time: "11–15 Uhr", label: "Inbetriebnahme Krüger" },
        { id: "m-di", tech: "Miriam", col: "Di", time: "9–16 Uhr", label: "Badsanierung Brandt" },
        { id: "m-fr", tech: "Miriam", col: "Fr", time: "ganztägig", label: "Urlaub" },
        { id: "e-di", tech: "Erik", col: "Di", time: "8–12 Uhr", label: "Rohrbruch Schulstraße" },
        { id: "e-fr", tech: "Erik", col: "Fr", time: "8–15 Uhr", label: "Baustelle Lindenstraße" },
      ],
      changes: [
        {
          kind: "add",
          tech: "Jonas",
          col: "Di",
          time: "14:30 Uhr",
          label: "Wartung Hoffmann",
          title: "Dienstag 14:30 Uhr · Jonas",
          reason:
            "Jonas hat die Wärmepumpen-Schulung und ist bis 13 Uhr im Ahornweg, 5 Minuten vom Musterweg entfernt.",
        },
        {
          kind: "add",
          tech: "Jonas",
          col: "Fr",
          time: "9:00 Uhr",
          label: "Wartung Hoffmann",
          title: "Freitag 9:00 Uhr · Jonas",
          reason:
            "Jonas ist freitags bis 11 Uhr frei. Miriam hat Urlaub, Erik hat keine Wärmepumpen-Schulung.",
        },
      ],
      messages: [
        {
          to: "Lena Hoffmann",
          salutation: "Guten Tag Frau Hoffmann,",
          paragraphs: [
            { text: "gern übernehmen wir die Wartung Ihrer Wärmepumpe am Musterweg 14." },
            {
              text: "Wir können Ihnen zwei Termine anbieten: Dienstag um 14:30 Uhr oder Freitag um 9:00 Uhr. Die Wartung dauert etwa 90 Minuten.",
            },
            { text: "Geben Sie uns kurz Bescheid, welcher Termin Ihnen besser passt." },
          ],
        },
      ],
    },
    {
      id: "notfall",
      headline: "Notfall einschieben",
      from: "Markus Weber",
      role: "Kunde",
      initials: "MW",
      channel: "E-Mail",
      time: "06:58",
      subject: "Heizung zeigt Fehler",
      body: [
        "Hallo,",
        "unsere Heizung zeigt seit heute Morgen einen Fehler an, es kommt kein warmes Wasser mehr.",
        "Können Sie heute noch jemanden schicken? Wir sind ab 13 Uhr zu Hause.",
        "Gruß\nMarkus Weber, Birkenweg 5",
      ],
      marks: ["kein warmes Wasser", "heute noch", "ab 13 Uhr", "Birkenweg 5"],
      urgent: true,
      sentTag: "Umgeplant",
      confirmed: "eingeplant",
      steps: [
        { kind: "read", label: "Liest die Störungsmeldung", result: "Dringend: kein Warmwasser, ab 13 Uhr" },
        { kind: "calendar", label: "Schaut in den Kalender", result: "Heute kein freies Fenster" },
        { kind: "skill", label: "Prüft, wer es kann", result: "Jonas und Miriam: Gasgeräte" },
        { kind: "route", label: "Prüft Fahrweg und Material", result: "Miriam: 10 Minuten, Teile im Wagen" },
        { kind: "write", label: "Schreibt den Vorschlag", result: "Umplanung und 2 Nachrichten bereit" },
      ],
      columns: ["Heute früh", "Heute ab 13 Uhr", "Morgen"],
      techs,
      slots: [
        { id: "j-1", tech: "Jonas", col: "Heute früh", time: "8–12 Uhr", label: "Heizungstausch Krüger" },
        { id: "j-2", tech: "Jonas", col: "Heute ab 13 Uhr", time: "13–16 Uhr", label: "Heizungstausch Krüger" },
        { id: "m-1", tech: "Miriam", col: "Heute früh", time: "8–11 Uhr", label: "Wartung Schulstraße 2" },
        { id: "m-2", tech: "Miriam", col: "Heute ab 13 Uhr", time: "13:30 Uhr", label: "Wartung Aydin" },
        { id: "m-3", tech: "Miriam", col: "Morgen", time: "ab 10 Uhr", label: "Baustelle Lindenstraße" },
        { id: "e-1", tech: "Erik", col: "Heute früh", time: "8–12 Uhr", label: "Badsanierung Brandt" },
        { id: "e-2", tech: "Erik", col: "Heute ab 13 Uhr", time: "13–17 Uhr", label: "Badsanierung Brandt" },
      ],
      changes: [
        {
          kind: "add",
          tech: "Miriam",
          col: "Heute ab 13 Uhr",
          time: "13:30 Uhr",
          label: "Störung Weber",
          title: "Heute 13:30 Uhr · Miriam fährt zu Weber",
          reason:
            "Miriam kennt Gas-Brennwertgeräte und ist am Vormittag in der Schulstraße, 10 Minuten vom Birkenweg. Die üblichen Ersatzteile für das Gerät liegen in ihrem Wagen.",
        },
        {
          kind: "move",
          slot: "m-2",
          tech: "Miriam",
          col: "Morgen",
          time: "8:00 Uhr",
          title: "Wartung Aydin · auf morgen 8:00 Uhr",
          reason:
            "Die Wartung bei Familie Aydin ist nicht dringend und passt morgen vor Miriams Baustelle. Der Heizungstausch und die Badsanierung lassen sich nicht unterbrechen.",
        },
      ],
      messages: [
        {
          to: "Markus Weber",
          salutation: "Guten Tag Herr Weber,",
          paragraphs: [
            {
              text: "unsere Monteurin kommt heute um 13:30 Uhr zu Ihnen in den Birkenweg 5 und sieht sich die Heizung an.",
            },
          ],
        },
        {
          to: "Familie Aydin",
          salutation: "Guten Tag Familie Aydin,",
          paragraphs: [
            {
              text: "wegen eines Notfalls müssen wir Ihren Wartungstermin heute um 13:30 Uhr leider verschieben.",
            },
            { text: "Passt Ihnen morgen um 8:00 Uhr? Falls nicht, rufen Sie uns gern an." },
          ],
        },
      ],
    },
    {
      id: "ausfall",
      headline: "Monteur fällt aus",
      from: "Erik",
      role: "dein Monteur",
      initials: "E",
      channel: "Nachricht",
      time: "06:40",
      subject: "Krankmeldung",
      body: [
        "Morgen zusammen,",
        "mich hat es erwischt, Fieber. Ich falle heute aus, morgen wahrscheinlich auch.",
        "Bei Brandt bin ich gestern bis zu den Bodenfliesen gekommen, das Material liegt vor Ort.",
      ],
      marks: [
        "falle heute aus",
        "morgen wahrscheinlich auch",
        "bis zu den Bodenfliesen",
        "Material liegt vor Ort",
      ],
      sentTag: "Umgeplant",
      confirmed: "eingeplant",
      steps: [
        { kind: "read", label: "Liest die Krankmeldung", result: "Erik fällt heute und morgen aus" },
        { kind: "calendar", label: "Schaut in den Kalender", result: "3 Termine betroffen" },
        { kind: "skill", label: "Prüft, wer es kann", result: "Jonas: Wartung · Miriam: Bad" },
        { kind: "route", label: "Prüft Fahrweg und Material", result: "Material liegt schon bei Brandt" },
        { kind: "write", label: "Schreibt den Vorschlag", result: "Umplanung und 2 Nachrichten bereit" },
      ],
      columns: ["Heute", "Morgen"],
      techs: [
        techs[0],
        techs[1],
        { ...techs[2], absent: "krank gemeldet" },
      ],
      slots: [
        { id: "j-1", tech: "Jonas", col: "Heute", time: "8–13 Uhr", label: "Heizungstausch Krüger" },
        { id: "j-2", tech: "Jonas", col: "Morgen", time: "8–16 Uhr", label: "Heizungstausch Krüger" },
        { id: "m-1", tech: "Miriam", col: "Heute", time: "8–11 Uhr", label: "Wartung Schulstraße 2" },
        { id: "m-2", tech: "Miriam", col: "Morgen", time: "8–16 Uhr", label: "Baustelle Lindenstraße" },
        { id: "e-1", tech: "Erik", col: "Heute", time: "8–12 Uhr", label: "Badsanierung Brandt" },
        { id: "e-2", tech: "Erik", col: "Heute", time: "14:00 Uhr", label: "Wartung Aydin" },
        { id: "e-3", tech: "Erik", col: "Morgen", time: "8–16 Uhr", label: "Badsanierung Brandt" },
      ],
      changes: [
        {
          kind: "move",
          slot: "e-2",
          tech: "Jonas",
          col: "Heute",
          time: "14:00 Uhr",
          title: "Wartung Aydin · übernimmt Jonas, Uhrzeit bleibt",
          reason: "Jonas ist ab 13 Uhr frei und macht Wartungen an Gasgeräten.",
        },
        {
          kind: "move",
          slot: "e-1",
          tech: "Miriam",
          col: "Heute",
          time: "12–16 Uhr",
          title: "Badsanierung Brandt · heute ab 12 Uhr mit Miriam",
          reason:
            "Miriam macht Badsanierungen und ist ab 11 Uhr frei. Das Material liegt schon vor Ort.",
        },
        {
          kind: "flag",
          slot: "e-3",
          flag: "offen: niemand frei",
          sent: "auf Donnerstag verlegt",
          title: "Badsanierung Brandt morgen · bitte entscheiden",
          reason:
            "Morgen sind Jonas und Miriam den ganzen Tag gebunden. Vorschlag: den Tag mit Herrn Brandt auf Donnerstag verlegen.",
        },
      ],
      messages: [
        {
          to: "Thomas Brandt",
          salutation: "Guten Tag Herr Brandt,",
          paragraphs: [
            {
              text: "unser Monteur ist heute krank. Damit es bei Ihnen weitergeht, kommt heute ab 12 Uhr unsere Kollegin Miriam.",
            },
            {
              text: "Morgigen Arbeitstag klären",
              team: "Den morgigen Arbeitstag holen wir am Donnerstag nach.",
            },
          ],
        },
        {
          to: "Familie Aydin",
          salutation: "Guten Tag Familie Aydin,",
          paragraphs: [
            {
              text: "Ihr Wartungstermin heute um 14:00 Uhr bleibt bestehen. Statt Erik kommt unser Kollege Jonas.",
            },
          ],
        },
      ],
    },
  ] as ScheduleCase[],
};
