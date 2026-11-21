import type { ScheduleStoryData } from "../../scheduleStory";

// Beispielfälle für die Schadens-Demo der Hausverwaltung (Darstellung wie
// die Termin-Demo: Eingang, Assistent, Auftragsplan und Nachrichten).
// Verwaltung, Betriebe, Personen, Objekte und Grenzen sind erfunden.
// Vereinfachte Darstellung, keine Rechtsberatung.

// Zeilen des Auftragsplans: kurzer Firmenname, darunter das Gewerk
const betriebe = [
  { name: "Kraus", skills: "Heizung · Wartung" },
  { name: "Huber", skills: "Sanitär · Leckortung" },
  { name: "Lang", skills: "Elektro" },
];

export const schadenStory: ScheduleStoryData = {
  without:
    "Eine Schadensmeldung heißt: Handwerker anrufen, Termin mit dem Mieter abstimmen, Eigentümer informieren. Und vorher klären, wer zahlt.",
  with: "Der Assistent prüft Zuständigkeit und Freigabegrenze, schlägt Betrieb und Termin vor, nennt den Grund dafür und schreibt die Nachrichten an alle Beteiligten.",
  closing: "Mit freundlichen Grüßen\nIhre Hausverwaltung Mustermann",
  labels: {
    resultColumn: "Für Ihr Team vorbereitet",
    planTitle: "Auftragsplan",
    rowHeader: "Handwerksbetrieb",
    sentChip: "Von Ihrem Team beauftragt",
    readyChip: "Wartet auf Ihre Entscheidung",
    confirmedLegend: "von Ihnen bestätigt",
    openForTeam: "Ergänzt Ihr Team",
    filledByTeam: "Von Ihrem Team ergänzt",
    sentNote: "Von Ihrem Team geprüft, entschieden und gesendet.",
  },
  cases: [
    {
      id: "heizung",
      headline: "Heizung ausgefallen",
      from: "Chidi Okafor",
      role: "Mieter",
      initials: "CO",
      channel: "E-Mail",
      time: "07:52",
      subject: "Heizung kalt seit gestern",
      body: [
        "Guten Morgen,",
        "in unserer Wohnung 2.1 sind seit gestern Abend alle Heizkörper kalt. Warmes Wasser haben wir noch.",
        "Wir sind morgen ab 13 Uhr und am Freitag den ganzen Tag zu Hause.",
        "Viele Grüße\nChidi Okafor, Isarstraße 8",
      ],
      marks: [
        "Wohnung 2.1",
        "alle Heizkörper kalt",
        "Warmes Wasser haben wir noch",
        "morgen ab 13 Uhr",
        "am Freitag den ganzen Tag",
      ],
      sentTag: "Beauftragt",
      confirmed: "beauftragt",
      steps: [
        { kind: "read", label: "Liest die Meldung", result: "Heizung WE 2.1 aus, Mieter Do ab 13 Uhr, Fr ganztags" },
        {
          kind: "rules",
          label: "Prüft Zuständigkeit und Freigabe",
          result: "Zentralheizung: Gemeinschaftseigentum. Laut Beschluss vom 14.05.2024 beauftragen Sie bis 1.500 € selbst",
        },
        { kind: "skill", label: "Prüft Wartungsvertrag", result: "Wärmetechnik Kraus betreut die Anlage" },
        { kind: "calendar", label: "Schaut in die Termine der Betriebe", result: "Kraus: Donnerstag ab 13 Uhr frei" },
        { kind: "write", label: "Schreibt Auftrag und Nachrichten", result: "Auftrag und Mieterinfo bereit" },
      ],
      columns: ["Do", "Fr"],
      techs: betriebe,
      slots: [
        { id: "k-do", tech: "Kraus", col: "Do", time: "8–12 Uhr", label: "Wartung Am Mühlbach 3" },
        { id: "k-fr", tech: "Kraus", col: "Fr", time: "ganztägig", label: "Kesseltausch Lindenweg 4" },
        { id: "h-do", tech: "Huber", col: "Do", time: "9–15 Uhr", label: "Strangsanierung Isarstr. 12" },
        { id: "l-fr", tech: "Lang", col: "Fr", time: "10–12 Uhr", label: "Klingelanlage Am Mühlbach 3" },
      ],
      changes: [
        {
          kind: "add",
          tech: "Kraus",
          col: "Do",
          time: "13:00 Uhr",
          label: "Heizung WE 2.1",
          title: "Donnerstag 13:00 Uhr · Wärmetechnik Kraus",
          reason:
            "Kraus wartet die Anlage laut Vertrag und kennt sie. Er ist bis 12 Uhr am Mühlbach, 10 Minuten entfernt. Ab 13 Uhr sind die Mieter zu Hause, das ist der früheste Termin.",
        },
      ],
      messages: [
        {
          to: "Wärmetechnik Kraus",
          salutation: "Sehr geehrter Herr Kraus,",
          paragraphs: [
            {
              text: "wir beauftragen Sie mit der Prüfung der Heizung in der Isarstraße 8, Wohnung 2.1: Seit gestern Abend sind alle Heizkörper kalt, warmes Wasser gibt es noch.",
            },
            { text: "Termin: Donnerstag, 13:00 Uhr. Familie Okafor ist dann zu Hause." },
            {
              text: "Kosten bis 1.500 € netto sind freigegeben. Darüber stimmen Sie sich bitte vorher mit uns ab.",
            },
          ],
        },
        {
          to: "Chidi Okafor",
          salutation: "Guten Tag Herr Okafor,",
          paragraphs: [
            { text: "vielen Dank für Ihre Meldung." },
            {
              text: "Die Firma Wärmetechnik Kraus kommt am Donnerstag um 13:00 Uhr zu Ihnen und sieht sich die Heizung an.",
            },
            {
              text: "Ersatz bei Kälte anbieten?",
              team: "Wird es bis dahin zu kalt, melden Sie sich bitte. Wir bringen Ihnen einen Heizlüfter vorbei.",
            },
          ],
        },
      ],
    },
    {
      id: "wasserfleck",
      headline: "Wasserfleck, Ursache unklar",
      from: "Gerda Lehmann",
      role: "Mieterin",
      initials: "GL",
      channel: "Mieterportal",
      time: "10:14",
      subject: "Wasserfleck an der Küchendecke",
      body: [
        "Hallo,",
        "an meiner Küchendecke ist seit dem Wochenende ein großer Wasserfleck, und er wird langsam größer. Ich glaube, es kommt von oben.",
        "Ich bin vormittags immer da.",
        "Gerda Lehmann, Am Mühlbach 3, Wohnung 2",
      ],
      marks: [
        "Küchendecke",
        "großer Wasserfleck",
        "wird langsam größer",
        "kommt von oben",
        "vormittags",
      ],
      sentTag: "Beauftragt",
      confirmed: "beauftragt",
      steps: [
        { kind: "read", label: "Liest die Meldung", result: "Wasserfleck WE 2, wohl aus WE 5 darüber" },
        {
          kind: "rules",
          label: "Prüft Zuständigkeit",
          result: "Erst Ursache klären: Leitung der Wohnung oder Gemeinschaftseigentum?",
        },
        { kind: "skill", label: "Prüft die Dienstleisterliste", result: "Sanitär Huber: Leckortung" },
        { kind: "calendar", label: "Schaut in die Termine der Betriebe", result: "Huber: Donnerstag 8 Uhr frei" },
        { kind: "write", label: "Schreibt Auftrag und Nachrichten", result: "Auftrag und 2 Nachrichten bereit" },
      ],
      columns: ["Do", "Fr"],
      techs: betriebe,
      slots: [
        { id: "k-do", tech: "Kraus", col: "Do", time: "8–12 Uhr", label: "Wartung Am Mühlbach 3" },
        { id: "k-fr", tech: "Kraus", col: "Fr", time: "ganztägig", label: "Kesseltausch Lindenweg 4" },
        { id: "h-do", tech: "Huber", col: "Do", time: "9–15 Uhr", label: "Strangsanierung Isarstr. 12" },
        { id: "l-fr", tech: "Lang", col: "Fr", time: "10–12 Uhr", label: "Klingelanlage Am Mühlbach 3" },
      ],
      changes: [
        {
          kind: "add",
          tech: "Huber",
          col: "Do",
          time: "7:30 Uhr",
          label: "Leckortung WE 2 und WE 5",
          title: "Donnerstag 7:30 Uhr · Sanitär Huber",
          reason:
            "Huber hat ein Leckortungsgerät und ist ab 9 Uhr in der Isarstraße 12, zehn Minuten entfernt. Frau Lehmann ist vormittags da.",
        },
      ],
      messages: [
        {
          to: "Sanitär Huber",
          salutation: "Sehr geehrter Herr Huber,",
          paragraphs: [
            {
              text: "wir beauftragen Sie mit einer Leckortung Am Mühlbach 3: Wasserfleck an der Küchendecke von Wohnung 2, vermutlich aus Wohnung 5 darüber.",
            },
            {
              text: "Termin: Donnerstag, 7:30 Uhr. Bitte halten Sie fest, ob die Ursache in einer Leitung der Wohnung oder im Gemeinschaftseigentum liegt. Davon hängt ab, wer die Kosten trägt.",
            },
          ],
        },
        {
          to: "Thomas Brandl, Eigentümer WE 5",
          salutation: "Sehr geehrter Herr Brandl,",
          paragraphs: [
            {
              text: "in der Wohnung unter Ihrer zeigt sich ein Wasserfleck an der Küchendecke.",
            },
            {
              text: "Am Donnerstag um 7:30 Uhr sucht die Firma Sanitär Huber nach der Ursache und braucht dafür Zugang zu Ihrer Wohnung.",
            },
            {
              text: "Zugang klären: Schlüssel oder Mieterin?",
              team: "Ihre Mieterin, Frau Kaya, hat zugesagt, um 7:30 Uhr da zu sein.",
            },
          ],
        },
      ],
    },
    {
      id: "absage",
      headline: "Handwerker sagt ab",
      from: "Stefan Kraus",
      role: "Handwerker",
      initials: "SK",
      channel: "E-Mail",
      time: "06:45",
      subject: "Ausfall am Freitag",
      body: [
        "Guten Morgen,",
        "unser Monteur fällt am Freitag krankheitsbedingt aus. Den Kesseltausch im Lindenweg 4 schaffen wir an dem Tag nicht.",
        "Montag hätten wir Zeit, dann müsste aber die Wartung am Mühlbach warten.",
        "Gruß\nStefan Kraus",
      ],
      marks: [
        "fällt am Freitag krankheitsbedingt aus",
        "Kesseltausch im Lindenweg 4",
        "Montag hätten wir Zeit",
        "Wartung am Mühlbach",
      ],
      urgent: true,
      sentTag: "Umgeplant",
      confirmed: "bestätigt",
      steps: [
        { kind: "read", label: "Liest die Absage", result: "Kraus fällt Fr aus: Kesseltausch Lindenweg 4" },
        { kind: "calendar", label: "Schaut in die Termine", result: "Montag frei, wenn die Wartung rückt" },
        {
          kind: "rules",
          label: "Prüft die Dringlichkeit",
          result: "Alte Anlage läuft noch, Wartung ist nicht fällig",
        },
        { kind: "write", label: "Schreibt den Vorschlag", result: "Neuer Plan und 2 Nachrichten bereit" },
      ],
      columns: ["Fr", "Mo"],
      techs: betriebe,
      slots: [
        { id: "k-fr", tech: "Kraus", col: "Fr", time: "ganztägig", label: "Kesseltausch Lindenweg 4" },
        { id: "k-mo", tech: "Kraus", col: "Mo", time: "8–12 Uhr", label: "Wartung Am Mühlbach 3" },
        { id: "h-mo", tech: "Huber", col: "Mo", time: "9–15 Uhr", label: "Strangsanierung Isarstr. 12" },
        { id: "l-fr", tech: "Lang", col: "Fr", time: "10–12 Uhr", label: "Klingelanlage Am Mühlbach 3" },
      ],
      changes: [
        {
          kind: "move",
          slot: "k-fr",
          tech: "Kraus",
          col: "Mo",
          time: "ganztägig",
          title: "Kesseltausch auf Montag",
          reason:
            "Die alte Anlage im Lindenweg läuft noch, ein Werktag später ist vertretbar. Kraus hat Montag Zeit, wenn die Wartung Am Mühlbach rückt.",
        },
        {
          kind: "flag",
          slot: "k-mo",
          flag: "neuer Termin nötig",
          sent: "auf nächste Woche verlegt",
          title: "Wartung Am Mühlbach verschieben",
          reason:
            "Die Wartung ist erst in sechs Wochen fällig. Den neuen Termin legt Ihr Team mit Kraus fest.",
        },
      ],
      messages: [
        {
          to: "Wärmetechnik Kraus",
          salutation: "Guten Tag Herr Kraus,",
          paragraphs: [
            { text: "danke für die frühe Nachricht und gute Besserung an Ihren Monteur." },
            { text: "Wir verschieben den Kesseltausch im Lindenweg 4 auf Montag." },
            {
              text: "Neuen Termin für die Wartung Am Mühlbach vorschlagen",
              team: "Die Wartung Am Mühlbach 3 legen wir auf Dienstag nächster Woche, 8 Uhr.",
            },
          ],
        },
        {
          to: "Mieterinnen und Mieter Lindenweg 4",
          salutation: "Liebe Mieterinnen und Mieter,",
          paragraphs: [
            {
              text: "der Austausch der Heizungsanlage verschiebt sich von Freitag auf Montag. Am Montag gibt es von 8 bis 16 Uhr kein warmes Wasser.",
            },
            { text: "Bis dahin läuft die Heizung wie gewohnt." },
          ],
        },
      ],
    },
  ],
};
