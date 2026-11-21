import type { MeetingStoryData } from "../../meetingStory";

// Beispielmitschnitte für die Versammlungs-Demo der Hausverwaltung.
// Gemeinschaften, Personen, Firmen und Beträge sind erfunden. Abstimmung
// nach Köpfen. Vereinfachte Darstellung, keine Rechtsberatung.
export const versammlungStory: MeetingStoryData = {
  without:
    "Nach der Versammlung: Notizen entziffern, Abstimmungen nachzählen, Beschlüsse sauber formulieren, Aufgaben verteilen. Oft ein ganzer Abend.",
  with: "Protokollentwurf, Einträge für die Beschlusssammlung und Aufgaben liegen bereit. Jede Stelle ist mit dem Mitschnitt verknüpft, Unklares ist markiert.",
  cases: [
    {
      id: "muehlbach",
      headline: "Wallbox-Beschluss, Zählung unklar",
      community: "WEG Am Mühlbach 3",
      kind: "Ordentliche Versammlung",
      date: "12. Mai 2026",
      duration: "1:48 Std.",
      attendance: "17 von 24 Eigentümern anwesend oder vertreten",
      sentTag: "Protokoll versandt",
      marks: [
        "17 von 24 Eigentümern",
        "Das sind 15",
        "Wallbox auf eigene Kosten",
        "Zwölf … dreizehn?",
        "bis Ende Juni zwei Angebote",
      ],
      segments: [
        {
          id: "s1",
          time: "00:04",
          speaker: "Verwalterin Hartmann",
          text: "Guten Abend. Anwesend oder vertreten sind 17 von 24 Eigentümern. Ich eröffne die Versammlung.",
        },
        {
          id: "s2",
          time: "00:21",
          speaker: "Verwalterin Hartmann",
          text: "TOP 3, Nachschüsse aus der Jahresabrechnung 2025. Wer ist dafür? Das sind 15. Dagegen eine Stimme, eine Enthaltung. Angenommen.",
        },
        {
          id: "s3",
          time: "00:58",
          speaker: "Dr. Martin Seidl",
          text: "Ich beantrage, an Stellplatz 14 eine Wallbox auf eigene Kosten einbauen zu dürfen, mit eigenem Zähler.",
        },
        {
          id: "s4",
          time: "01:03",
          speaker: "Verwalterin Hartmann",
          text: "Abstimmung zu TOP 5. Wer ist dafür? Zwölf … dreizehn? Dagegen drei, eine Enthaltung. Damit angenommen.",
        },
        {
          id: "s5",
          time: "01:31",
          speaker: "Beirat Kessler",
          text: "Die Dachrinne über dem Eingang tropft. Kann die Verwaltung bis Ende Juni zwei Angebote einholen?",
        },
      ],
      steps: [
        { kind: "transcribe", label: "Schreibt den Mitschnitt mit", result: "1:48 Std., 6 Sprecher" },
        { kind: "agenda", label: "Ordnet die Tagesordnung zu", result: "TOP 1 bis 7 aus der Einladung" },
        { kind: "votes", label: "Zählt die Abstimmungen", result: "2 Beschlüsse, 1 Zählung unklar" },
        { kind: "tasks", label: "Sammelt Aufgaben und Fristen", result: "3 Aufgaben für die Verwaltung" },
        { kind: "write", label: "Schreibt das Protokoll", result: "Protokoll und Beschlusssammlung bereit" },
      ],
      resolutions: [
        {
          top: "TOP 3",
          title: "Nachschüsse aus der Jahresabrechnung 2025",
          text: "Die Nachschüsse laut Jahresabrechnung 2025 werden beschlossen.",
          votes: "15 Ja · 1 Nein · 1 Enthaltung",
          result: "angenommen",
          segment: "s2",
        },
        {
          top: "TOP 5",
          title: "Wallbox an Stellplatz 14",
          text: "Dr. Martin Seidl darf an Stellplatz 14 auf eigene Kosten eine Wallbox mit eigenem Zähler durch einen Elektrofachbetrieb einbauen lassen.",
          votes: "{?} Ja · 3 Nein · 1 Enthaltung",
          result: "angenommen",
          segment: "s4",
          open: {
            question:
              "Im Mitschnitt nicht eindeutig: 12 oder 13 Ja-Stimmen? Bei 17 Anwesenden passen 13.",
            pending: "12 oder 13",
            options: [
              { label: "13 Ja, passt zu 17 Anwesenden", value: "13" },
              { label: "12 Ja, eine Stimme nicht abgegeben", value: "12" },
            ],
          },
        },
      ],
      tasks: [
        { text: "Gestattung mit Auflagen an Dr. Seidl schicken", owner: "Verwaltung", due: "bis 26. Mai" },
        { text: "Nachschüsse anfordern", owner: "Verwaltung", due: "bis 15. Juni" },
        { text: "Zwei Angebote für die Dachrinne einholen", owner: "Verwaltung", due: "bis 30. Juni" },
      ],
      collectionNext: 14,
    },
    {
      id: "moosburger",
      headline: "Heizungstausch, Termin unklar",
      community: "WEG Moosburger Straße 21",
      kind: "Außerordentliche Versammlung",
      date: "20. Januar 2026",
      duration: "0:58 Std.",
      attendance: "13 von 16 Eigentümern anwesend oder vertreten",
      sentTag: "Protokoll versandt",
      marks: [
        "28 Jahre alt",
        "nur, wenn die Förderung vorher beantragt wird",
        "Dafür 11, dagegen 2",
        "zum 1. März. Oder sagen wir zum 15.?",
        "bis Ende Februar",
      ],
      segments: [
        {
          id: "s1",
          time: "00:02",
          speaker: "Verwalter Berger",
          text: "Die Gasheizung ist 28 Jahre alt. Uns liegen drei Angebote vor, die Übersicht haben Sie mit der Einladung bekommen.",
        },
        {
          id: "s2",
          time: "00:34",
          speaker: "Eigentümerin Lindner",
          text: "Ich bin für die Wärmepumpe von Kraus, aber nur, wenn die Förderung vorher beantragt wird.",
        },
        {
          id: "s3",
          time: "00:41",
          speaker: "Verwalter Berger",
          text: "TOP 1: Auftrag an Kraus Wärmetechnik, Wärmepumpe laut Angebot, 48.600 Euro. Dafür 11, dagegen 2. Angenommen.",
        },
        {
          id: "s4",
          time: "00:52",
          speaker: "Verwalter Berger",
          text: "TOP 2: Sonderumlage 30.000 Euro nach Miteigentumsanteilen, fällig zum 1. März. Oder sagen wir zum 15.? Gut. Dafür 12, dagegen 1.",
        },
        {
          id: "s5",
          time: "00:55",
          speaker: "Verwalter Berger",
          text: "Den Förderantrag stellen wir bis Ende Februar, vor der Auftragsvergabe.",
        },
      ],
      steps: [
        { kind: "transcribe", label: "Schreibt den Mitschnitt mit", result: "0:58 Std., 5 Sprecher" },
        { kind: "agenda", label: "Ordnet die Tagesordnung zu", result: "TOP 1 und 2 aus der Einladung" },
        { kind: "votes", label: "Zählt die Abstimmungen", result: "2 Beschlüsse, 1 Termin unklar" },
        { kind: "tasks", label: "Sammelt Aufgaben und Fristen", result: "3 Aufgaben, eine mit Bedingung" },
        { kind: "write", label: "Schreibt das Protokoll", result: "Protokoll und Beschlusssammlung bereit" },
      ],
      resolutions: [
        {
          top: "TOP 1",
          title: "Erneuerung der Heizung",
          text: "Kraus Wärmetechnik wird laut Angebot mit dem Einbau einer Wärmepumpe beauftragt, 48.600 € brutto. Der Auftrag geht erst nach dem Förderantrag raus.",
          votes: "11 Ja · 2 Nein · 0 Enthaltungen",
          result: "angenommen",
          segment: "s3",
        },
        {
          top: "TOP 2",
          title: "Sonderumlage",
          text: "Zur Finanzierung wird eine Sonderumlage von 30.000 € nach Miteigentumsanteilen erhoben, fällig zum {?}.",
          votes: "12 Ja · 1 Nein · 0 Enthaltungen",
          result: "angenommen",
          segment: "s4",
          open: {
            question:
              "Im Mitschnitt fallen zwei Termine: 1. März im Antrag, 15. März als Nachtrag. Welcher gilt?",
            pending: "1. oder 15. März",
            options: [
              { label: "15. März, zuletzt genannt", value: "15. März 2026" },
              { label: "1. März, wie im Antrag", value: "1. März 2026" },
            ],
          },
        },
      ],
      tasks: [
        { text: "Sonderumlage bei allen Eigentümern anfordern", owner: "Verwaltung", due: "bis 31. Januar" },
        { text: "Förderantrag für die Wärmepumpe stellen", owner: "Verwaltung", due: "bis 28. Februar" },
        { text: "Auftrag an Kraus, erst nach dem Förderantrag", owner: "Verwaltung", due: "ab März" },
      ],
      collectionNext: 6,
    },
    {
      id: "erdinger",
      headline: "Beiratswahl, Name unklar",
      community: "WEG Erdinger Straße 40",
      kind: "Ordentliche Versammlung",
      date: "18. März 2026",
      duration: "2:05 Std.",
      attendance: "22 von 28 Eigentümern anwesend oder vertreten",
      sentTag: "Protokoll versandt",
      marks: [
        "Herr Nguyen, Frau Mayr und Herr Albrecht",
        "einstimmig",
        "schon der zweite",
        "Dafür 19, dagegen 2, eine Enthaltung",
        "sechs Wochen vorher schriftlich",
      ],
      segments: [
        {
          id: "s1",
          time: "00:12",
          speaker: "Verwalterin Hartmann",
          text: "TOP 2, Wahl des Verwaltungsbeirats. Vorgeschlagen sind Herr Nguyen, Frau Mayr und Herr Albrecht. Weitere Vorschläge? Keine.",
        },
        {
          id: "s2",
          time: "00:16",
          speaker: "Verwalterin Hartmann",
          text: "Damit sind alle drei gewählt, einstimmig. Herzlichen Glückwunsch.",
        },
        {
          id: "s3",
          time: "00:48",
          speaker: "Herr Albrecht",
          text: "Die Strangsanierung muss diesen Sommer kommen. Der Wasserschaden in Wohnung 5 war schon der zweite.",
        },
        {
          id: "s4",
          time: "00:55",
          speaker: "Verwalterin Hartmann",
          text: "TOP 4: Strangsanierung, Auftrag an Sanitär Huber laut Angebot vom 3. März, 86.400 Euro, Ausführung Juli bis September. Dafür 19, dagegen 2, eine Enthaltung.",
        },
        {
          id: "s5",
          time: "01:02",
          speaker: "Verwalterin Hartmann",
          text: "Die Mieter in den vermieteten Wohnungen informieren wir sechs Wochen vorher schriftlich.",
        },
      ],
      steps: [
        { kind: "transcribe", label: "Schreibt den Mitschnitt mit", result: "2:05 Std., 7 Sprecher" },
        { kind: "agenda", label: "Ordnet die Tagesordnung zu", result: "TOP 1 bis 6 aus der Einladung" },
        { kind: "votes", label: "Zählt die Abstimmungen", result: "1 Wahl, 1 Beschluss, 1 Name unklar" },
        { kind: "tasks", label: "Sammelt Aufgaben und Fristen", result: "3 Aufgaben für die Verwaltung" },
        { kind: "write", label: "Schreibt das Protokoll", result: "Protokoll und Beschlusssammlung bereit" },
      ],
      resolutions: [
        {
          top: "TOP 2",
          title: "Wahl des Verwaltungsbeirats",
          text: "Gewählt sind Minh Nguyen, {?} und Peter Albrecht.",
          votes: "einstimmig, 22 Ja",
          result: "gewählt",
          segment: "s2",
          open: {
            question:
              "Gesprochen klingt es wie „Maier“. In der Eigentümerliste stehen Andrea Maier (WE 3) und Sabine Mayr (WE 17).",
            pending: "Frau Maier oder Frau Mayr",
            options: [
              { label: "Andrea Maier, WE 3", value: "Andrea Maier" },
              { label: "Sabine Mayr, WE 17", value: "Sabine Mayr" },
            ],
          },
        },
        {
          top: "TOP 4",
          title: "Strangsanierung",
          text: "Sanitär Huber wird laut Angebot vom 3. März mit der Strangsanierung beauftragt, 86.400 € brutto, Ausführung Juli bis September.",
          votes: "19 Ja · 2 Nein · 1 Enthaltung",
          result: "angenommen",
          segment: "s4",
        },
      ],
      tasks: [
        { text: "Neuen Beirat in die Kontaktliste aufnehmen", owner: "Verwaltung", due: "bis 25. März" },
        { text: "Auftrag an Sanitär Huber erteilen", owner: "Verwaltung", due: "bis 31. März" },
        { text: "Mieter schriftlich informieren", owner: "Verwaltung", due: "bis 20. Mai" },
      ],
      collectionNext: 21,
    },
  ],
};
