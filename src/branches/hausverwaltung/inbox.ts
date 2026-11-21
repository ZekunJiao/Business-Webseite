import type { InboxStoryData } from "../../inboxStory";

// Beispielmails für die Posteingang-Demo der Hausverwaltung. Verwaltung,
// Personen, Objekte, Beträge und Unterlagen sind erfunden. Vereinfachte
// Darstellung, keine Rechtsberatung.
export const anfragenStory: InboxStoryData = {
  without:
    "Montags ist das Postfach voll. Für jede Antwort suchen Sie Objekt, Vertrag und Unterlagen zusammen und schreiben von Hand.",
  with: "Zu jeder Mail liegen Objekt, Wohnung, Anliegen und ein Antwortentwurf mit Quelle bereit. Offenes ist markiert.",
  closing: "Mit freundlichen Grüßen\nIhre Hausverwaltung Mustermann",
  labels: {
    crmOrigin: "aus Ihrer Verwaltungssoftware",
    crmLegend: "aus der Verwaltungssoftware",
    formChannel: "über Ihr Kontaktformular",
    resultColumn: "Für Ihr Team vorbereitet",
    sentChip: "Gesendet von Ihrem Team",
    readyChip: "Wartet auf Ihre Prüfung",
    openForTeam: "Ergänzt Ihr Team",
    filledByTeam: "Von Ihrem Team ergänzt",
    sourcePrefix: "aus Ihren Unterlagen:",
    sentNote: "Von Ihrem Team geprüft, ergänzt und gesendet.",
    softwareTitle: "Vorgang in Ihrer Verwaltungssoftware",
    softwareSaved: "gespeichert in Ihrer Verwaltungssoftware",
    byTeam: "von Ihrem Team",
  },
  cases: [
    {
      id: "nachzahlung",
      headline: "Frage zur Betriebskostenabrechnung",
      from: "Petra Wagner",
      initials: "PW",
      time: "09:47",
      subject: "Nachzahlung Betriebskosten: warum so viel?",
      body: [
        "Guten Tag,",
        "ich habe die Betriebskostenabrechnung für 2025 bekommen und soll 384,20 € nachzahlen. Letztes Jahr kam sogar Geld zurück. Wie kommt das? Und kann ich den Betrag in Raten zahlen?",
        "Mit freundlichen Grüßen\nPetra Wagner, Isarstraße 8, Wohnung 1.2",
      ],
      marks: [
        "Betriebskostenabrechnung für 2025",
        "384,20 € nachzahlen",
        "Letztes Jahr kam sogar Geld zurück",
        "in Raten zahlen",
        "Isarstraße 8, Wohnung 1.2",
      ],
      steps: [
        { kind: "read", label: "Liest die Anfrage", result: "Frage zur Nachzahlung, Wunsch nach Raten" },
        { kind: "crm", label: "Sucht in der Verwaltungssoftware", result: "Mieterin seit 2019, WE 1.2, 68 m²" },
        { kind: "docs", label: "Schaut in die Abrechnung", result: "Abrechnung 2025 und Vorjahr" },
        { kind: "write", label: "Schreibt den Entwurf", result: "Antwort mit Erklärung bereit" },
      ],
      fields: [
        { label: "Mieterin", value: "Petra Wagner · WE 1.2, Isarstraße 8", origin: "crm", step: 1 },
        { label: "Anliegen", value: "Nachzahlung 384,20 € erklären, Ratenzahlung", origin: "mail", step: 0 },
        {
          label: "Ursache",
          value: "Heizkosten im Haus +41 %, Vorauszahlung unverändert",
          origin: "crm",
          step: 2,
        },
        {
          label: "Ratenzahlung",
          value: "gewünscht · Entscheidung offen",
          origin: "mail",
          step: 0,
          open: true,
          sent: "2 Raten à 192,10 € · zugesagt",
        },
      ],
      draft: {
        salutation: "Guten Tag Frau Wagner,",
        paragraphs: [
          { text: "vielen Dank für Ihre Nachricht zur Betriebskostenabrechnung 2025." },
          {
            text: "Der Hauptgrund für die Nachzahlung sind die Heizkosten: Sie sind für das ganze Haus um 41 % gestiegen, weil der Gasversorger seinen Arbeitspreis zum 1. Januar erhöht hat. Ihre monatliche Vorauszahlung ist dagegen gleich geblieben.",
            source: "Betriebskostenabrechnung 2025, Isarstraße 8",
          },
          {
            text: "Damit es im nächsten Jahr keine Nachzahlung gibt, passen wir Ihre Vorauszahlung ab dem 1. März um 32 € im Monat an.",
            source: "Mietvertrag WE 1.2, § 4 Betriebskosten",
          },
          {
            text: "Ratenzahlung zusagen oder ablehnen",
            team: "Gern können Sie den Betrag in zwei Raten zahlen: 192,10 € zum 15. März und 192,10 € zum 15. April.",
          },
          { text: "Die Einzelaufstellung finden Sie auf Seite 2 der Abrechnung." },
        ],
      },
    },
    {
      id: "wallbox",
      headline: "Eigentümer fragt nach einer Wallbox",
      from: "Dr. Martin Seidl",
      initials: "MS",
      time: "08:58",
      subject: "Wallbox in der Tiefgarage",
      body: [
        "Sehr geehrte Damen und Herren,",
        "ich möchte an meinem Stellplatz Nr. 14 in der Tiefgarage eine Wallbox installieren lassen. Brauche ich dafür eine Genehmigung der Eigentümergemeinschaft? Die Kosten trage ich selbst.",
        "Mit freundlichen Grüßen\nMartin Seidl, WEG Am Mühlbach 3, Wohnung 4",
      ],
      marks: [
        "Stellplatz Nr. 14 in der Tiefgarage",
        "Wallbox installieren",
        "Genehmigung der Eigentümergemeinschaft",
        "Die Kosten trage ich selbst",
        "WEG Am Mühlbach 3",
      ],
      steps: [
        { kind: "read", label: "Liest die Anfrage", result: "Wallbox am eigenen Stellplatz, Kosten selbst" },
        { kind: "crm", label: "Sucht in der Verwaltungssoftware", result: "Eigentümer WE 4, Stellplatz 14" },
        {
          kind: "docs",
          label: "Schaut in Teilungserklärung und Beschlüsse",
          result: "Bisher kein Beschluss zu Ladestationen",
        },
        { kind: "write", label: "Schreibt den Entwurf", result: "Antwort und TOP-Vorschlag bereit" },
      ],
      fields: [
        { label: "Eigentümer", value: "Dr. Martin Seidl · WE 4, WEG Am Mühlbach 3", origin: "crm", step: 1 },
        { label: "Anliegen", value: "Wallbox an Stellplatz 14, Kosten trägt er selbst", origin: "mail", step: 0 },
        {
          label: "Beschlusslage",
          value: "kein Beschluss zu Ladestationen · Beschluss nötig",
          origin: "crm",
          step: 2,
        },
        {
          label: "Versammlung",
          value: "Antrag als TOP vormerken · Termin offen",
          origin: "crm",
          step: 2,
          open: true,
          sent: "TOP 5 der Versammlung am 12. Mai",
        },
      ],
      draft: {
        salutation: "Sehr geehrter Herr Dr. Seidl,",
        paragraphs: [
          { text: "vielen Dank für Ihre Anfrage zur Wallbox an Ihrem Stellplatz Nr. 14." },
          {
            text: "Eine Wallbox ist eine bauliche Veränderung. Als Eigentümer haben Sie Anspruch darauf, dass die Gemeinschaft sie gestattet. Wie sie eingebaut wird, etwa Leitungsweg und Zähler, beschließt die Eigentümerversammlung.",
            source: "Merkblatt Ladestationen nach § 20 WEG",
          },
          {
            text: "Einen Beschluss zu Ladestationen gibt es in Ihrer Gemeinschaft bisher nicht. Bitte schicken Sie uns dafür das Angebot eines Elektrofachbetriebs mit dem geplanten Leitungsweg.",
            source: "Beschlusssammlung WEG Am Mühlbach 3",
          },
          {
            text: "Termin der nächsten Eigentümerversammlung nennen",
            team: "Wir nehmen Ihren Antrag als TOP 5 in die Versammlung am 12. Mai auf.",
          },
          { text: "Bis zum Beschluss bitten wir Sie, mit dem Einbau zu warten." },
        ],
      },
    },
    {
      id: "schimmel",
      headline: "Schimmel im Bad, mit Foto",
      from: "Aylin Demir",
      initials: "AD",
      time: "07:31",
      subject: "Schaden melden: Schimmel im Bad",
      form: [
        { label: "Name", value: "Aylin Demir" },
        { label: "Adresse", value: "Isarstraße 8, Wohnung 3.1" },
        { label: "Anliegen", value: "Schaden melden" },
        {
          label: "Nachricht",
          value:
            "Im Bad wächst seit zwei Wochen schwarzer Schimmel an der Außenwand hinter der Dusche. Ich lüfte täglich. Mein Sohn hat Asthma, deshalb bitte ich um schnelle Hilfe.",
        },
        { label: "Erreichbar", value: "werktags ab 16 Uhr" },
      ],
      marks: [
        "Isarstraße 8, Wohnung 3.1",
        "schwarzer Schimmel",
        "Außenwand hinter der Dusche",
        "Ich lüfte täglich",
        "Asthma",
        "werktags ab 16 Uhr",
      ],
      attachment: "schimmel_bad.jpg",
      urgent: true,
      steps: [
        { kind: "read", label: "Liest die Meldung", result: "Schimmel an der Außenwand, Foto liegt bei" },
        { kind: "urgent", label: "Prüft die Dringlichkeit", result: "Dringend: Gesundheit betroffen" },
        {
          kind: "crm",
          label: "Sucht in der Verwaltungssoftware",
          result: "2023 schon Schimmel in WE 2.1, gleiche Außenwand",
        },
        { kind: "write", label: "Schreibt den Entwurf", result: "Antwort und Vorgang bereit" },
      ],
      fields: [
        { label: "Mieterin", value: "Aylin Demir · WE 3.1, Isarstraße 8", origin: "crm", step: 2 },
        { label: "Schaden", value: "Schimmel an der Außenwand im Bad, Foto liegt vor", origin: "mail", step: 0 },
        { label: "Dringlichkeit", value: "dringend · Kind mit Asthma", origin: "mail", step: 1, urgent: true },
        { label: "Vorgeschichte", value: "2023 Schimmel in WE 2.1, gleiche Außenwand", origin: "crm", step: 2 },
        {
          label: "Besichtigung",
          value: "werktags ab 16 Uhr · Gutachter und Termin offen",
          origin: "mail",
          step: 0,
          open: true,
          sent: "Do 16:30 Uhr · Bausachverständiger Roth",
        },
      ],
      draft: {
        salutation: "Guten Tag Frau Demir,",
        paragraphs: [
          { text: "vielen Dank für Ihre Meldung und das Foto. Wir kümmern uns vorrangig darum." },
          {
            text: "Bitte wischen Sie die Stelle bis zur Besichtigung nicht ab und lüften Sie weiter wie bisher.",
            source: "Merkblatt Schimmel für Mieter",
          },
          {
            text: "Besichtigung mit Gutachter vorschlagen",
            team: "Am Donnerstag um 16:30 Uhr kommt Herr Roth, Bausachverständiger, zur Besichtigung. Passt Ihnen das?",
          },
          { text: "Nach der Besichtigung melden wir uns mit den nächsten Schritten." },
        ],
      },
    },
  ],
};
