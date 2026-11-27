import type { InboxStoryData } from "../../inboxStory";

// Beispielmails für die Posteingang-Demo der Steuerkanzlei. Kanzlei,
// Mandanten, Beträge und Unterlagen sind erfunden. Vereinfachte Darstellung,
// keine Steuerberatung.
export const mandantenStory: InboxStoryData = {
  without:
    "Mandanten schreiben zwischen zwei Erklärungen. Für jede Antwort suchen Sie Akte, Merkblatt und Frist zusammen und schreiben von Hand.",
  with: "Zu jeder Mail liegen Mandant, Anliegen und ein Antwortentwurf mit Quelle bereit. Offenes und Fristen sind markiert.",
  closing: "Mit freundlichen Grüßen\nIhre Steuerkanzlei Mustermann",
  labels: {
    crmOrigin: "aus Ihrer Kanzleisoftware",
    crmLegend: "aus der Kanzleisoftware",
    formChannel: "über Ihr Mandantenportal",
    resultColumn: "Für Ihr Team vorbereitet",
    sentChip: "Gesendet von Ihrem Team",
    readyChip: "Wartet auf Ihre Prüfung",
    openForTeam: "Ergänzt Ihr Team",
    filledByTeam: "Von Ihrem Team ergänzt",
    sourcePrefix: "aus Ihren Unterlagen:",
    sentNote: "Von Ihrem Team geprüft, ergänzt und gesendet.",
    softwareTitle: "Notiz in Ihrer Kanzleisoftware",
    softwareSaved: "gespeichert in Ihrer Kanzleisoftware",
    byTeam: "von Ihrem Team",
  },
  cases: [
    {
      id: "e-rechnung",
      headline: "Anfrage auf Albanisch: E-Rechnung ab 2027",
      from: "Arben Krasniqi",
      initials: "AK",
      time: "09:12",
      subject: "Fatura elektronike nga janari?",
      body: [
        "Përshëndetje,",
        "kam dëgjuar që nga janari duhet të dërgojmë fatura elektronike. A vlen kjo edhe për ne? Ne punojmë kryesisht për kompani ndërtimi, por edhe për klientë privatë. Faturat i bëjmë tani me Word dhe i dërgojmë si PDF.",
        "Faleminderit,\nArben Krasniqi, Krasniqi Fliesenbau GmbH",
      ],
      marks: [
        "nga janari",
        "fatura elektronike",
        "kompani ndërtimi",
        "klientë privatë",
        "Word dhe i dërgojmë si PDF",
      ],
      steps: [
        {
          kind: "read",
          label: "Liest die Anfrage",
          result: "Sprache erkannt: Albanisch · übersetzt · Frage zur E-Rechnung ab 2027",
        },
        {
          kind: "crm",
          label: "Sucht in der Kanzleisoftware",
          result: "Krasniqi Fliesenbau GmbH, Buchhaltung und Lohn · Umsatz 2025 ca. 1,2 Mio €",
        },
        { kind: "docs", label: "Schaut in die Merkblätter", result: "E-Rechnung: Pflichten ab 2027" },
        {
          kind: "write",
          label: "Schreibt den Entwurf",
          result: "Deutsch zur Prüfung, Albanisch für den Mandanten",
        },
      ],
      fields: [
        {
          label: "Mandant",
          value: "Krasniqi Fliesenbau GmbH · Arben Krasniqi · Buchhaltung, Lohn",
          origin: "crm",
          step: 1,
        },
        {
          label: "Anliegen (übersetzt)",
          value: "Gilt die E-Rechnungspflicht ab Januar auch für uns?",
          origin: "mail",
          step: 0,
        },
        {
          label: "Umsatz 2026",
          value: "bis Oktober ca. 1,0 Mio € · voraussichtlich über 800.000 €",
          origin: "crm",
          step: 1,
        },
        {
          label: "Einordnung",
          value:
            "Bei mehr als 800.000 € Vorjahresumsatz müssen Rechnungen an Firmenkunden ab 1.1.2027 als E-Rechnung ausgestellt werden. Rechnungen an Privatkunden sind ausgenommen. Ein PDF aus Word ist keine E-Rechnung.",
          origin: "crm",
          step: 2,
        },
        {
          label: "Rechnungsprogramm",
          value: "Word · nicht geeignet, Umstellung nötig",
          origin: "mail",
          step: 0,
          open: true,
        },
        {
          label: "Beratungsanlass",
          value: "Umstellung auf ein Rechnungsprogramm mit E-Rechnung anbieten",
          origin: "crm",
          step: 2,
          open: true,
        },
      ],
      draft: {
        salutation: "Guten Tag Herr Krasniqi,",
        paragraphs: [
          {
            text: "danke für Ihre Frage. Nach unseren Unterlagen liegt Ihr Umsatz 2026 voraussichtlich über 800.000 €. Dann müssen Sie ab 1. Januar 2027 Rechnungen an Firmenkunden als E-Rechnung ausstellen. Ein PDF aus Word reicht dafür nicht mehr. Für Privatkunden ändert sich nichts.",
            source: "Merkblatt E-Rechnung",
          },
          {
            text: "Wir schlagen ein kurzes Gespräch vor, um ein passendes Rechnungsprogramm auszuwählen. Passt Ihnen nächste Woche?",
          },
        ],
        closing: "Viele Grüße\nIhre Steuerkanzlei Mustermann",
      },
      foreign: {
        lang: "sq",
        badge: "Shqip",
        translationLabel: "Übersetzung (Deutsch)",
        translation: [
          "Hallo, ich habe gehört, dass wir ab Januar elektronische Rechnungen schicken müssen. Gilt das auch für uns? Wir arbeiten hauptsächlich für Baufirmen, aber auch für Privatkunden. Unsere Rechnungen machen wir im Moment mit Word und schicken sie als PDF.",
        ],
        tabs: ["Deutsch (zur Prüfung)", "Shqip (an Mandanten)"],
        draft: {
          salutation: "Përshëndetje z. Krasniqi,",
          paragraphs: [
            "faleminderit për pyetjen. Sipas të dhënave tona, qarkullimi juaj për vitin 2026 me shumë gjasë do të jetë mbi 800.000 €. Prandaj, nga 1 janari 2027 faturat për kompanitë duhet t'i lëshoni si fatura elektronike. Një PDF nga Word nuk mjafton më. Për klientët privatë nuk ndryshon asgjë.",
            "Ju propozojmë një bisedë të shkurtër për të zgjedhur një program të përshtatshëm faturimi. A ju përshtatet java e ardhshme?",
          ],
          closing: "Me respekt\nSteuerkanzlei Mustermann",
        },
      },
    },
    {
      id: "minijob",
      headline: "Neue Aushilfe für die Lohnabrechnung",
      from: "Markus Lindner",
      initials: "ML",
      time: "08:31",
      subject: "Neue Aushilfe ab Dezember",
      body: [
        "Hallo zusammen,",
        "ab 1. Dezember fängt bei uns eine Aushilfe an: Mia Schneider, als Minijob mit 450 € im Monat. Was braucht ihr von mir, damit das mit der Lohnabrechnung klappt?",
        "Grüße\nMarkus Lindner, Café Lindner",
      ],
      marks: [
        "ab 1. Dezember",
        "Mia Schneider",
        "Minijob mit 450 € im Monat",
        "Lohnabrechnung",
        "Café Lindner",
      ],
      steps: [
        { kind: "read", label: "Liest die Anfrage", result: "Neue Aushilfe ab 1. Dezember, Minijob" },
        { kind: "crm", label: "Sucht in der Kanzleisoftware", result: "Café Lindner, Lohn monatlich, 6 Beschäftigte" },
        { kind: "docs", label: "Schaut in die Checklisten", result: "Checkliste Neueinstellung Minijob" },
        { kind: "write", label: "Schreibt den Entwurf", result: "Antwort mit Unterlagenliste bereit" },
      ],
      fields: [
        { label: "Mandant", value: "Café Lindner · Markus Lindner, Lohn monatlich", origin: "crm", step: 1 },
        { label: "Neue Aushilfe", value: "Mia Schneider, ab 1. Dezember", origin: "mail", step: 0 },
        { label: "Vergütung", value: "450 € im Monat, Minijob", origin: "mail", step: 0 },
        {
          label: "Stundenlohn und Arbeitszeit",
          value: "fehlen · nötig für den Mindestlohn",
          origin: "mail",
          step: 0,
          open: true,
          sent: "Rückfrage gestellt",
        },
      ],
      draft: {
        salutation: "Guten Tag Herr Lindner,",
        paragraphs: [
          {
            text: "vielen Dank für Ihre Nachricht. Damit wir Frau Schneider zum 1. Dezember anmelden können, brauchen wir bis zum 25. November den Personalfragebogen mit Steuer-ID, Sozialversicherungsnummer und Krankenkasse.",
            source: "Checkliste Neueinstellung Minijob",
          },
          {
            text: "Minijobber sind grundsätzlich rentenversicherungspflichtig. Möchte Frau Schneider sich befreien lassen, legen Sie bitte ihren unterschriebenen Antrag bei.",
            source: "Merkblatt Minijob",
          },
          {
            text: "Rückfrage zu Stundenlohn und Arbeitszeit",
            team: "Bitte nennen Sie uns noch den Stundenlohn und die geplanten Stunden im Monat, damit wir den Mindestlohn prüfen können.",
          },
        ],
      },
    },
    {
      id: "finanzamt",
      headline: "Schreiben vom Finanzamt, mit Frist",
      from: "Helga Neumann",
      initials: "HN",
      time: "07:54",
      subject: "Schreiben vom Finanzamt",
      form: [
        { label: "Name", value: "Helga Neumann" },
        { label: "Mandantennummer", value: "20388" },
        { label: "Anliegen", value: "Schreiben vom Finanzamt" },
        {
          label: "Nachricht",
          value:
            "Das Finanzamt will Nachweise für die Handwerkerkosten 2025 sehen, bis 4. Dezember. Ich weiß nicht, was ich schicken soll. Das Schreiben hänge ich an.",
        },
      ],
      marks: [
        "Helga Neumann",
        "Schreiben vom Finanzamt",
        "Nachweise für die Handwerkerkosten 2025",
        "bis 4. Dezember",
      ],
      attachment: "finanzamt_rueckfrage.pdf",
      urgent: true,
      steps: [
        { kind: "read", label: "Liest Nachricht und Schreiben", result: "Rückfrage zur Erklärung 2025" },
        { kind: "urgent", label: "Prüft die Frist", result: "Dringend: Antwort bis 4. Dezember" },
        {
          kind: "crm",
          label: "Sucht in der Kanzleisoftware",
          result: "Malerrechnung in der Akte, Überweisung fehlt",
        },
        { kind: "write", label: "Schreibt den Entwurf", result: "Antwort und Frist bereit" },
      ],
      fields: [
        { label: "Mandantin", value: "Helga Neumann · Einkommensteuer 2025", origin: "crm", step: 2 },
        { label: "Anliegen", value: "Finanzamt fordert Nachweise für Handwerkerkosten", origin: "mail", step: 0 },
        { label: "Frist", value: "Antwort ans Finanzamt bis 4. Dezember", origin: "mail", step: 1, urgent: true },
        { label: "In der Akte", value: "Malerrechnung 2.380 €, Zahlungsnachweis fehlt", origin: "crm", step: 2 },
        {
          label: "Antwort ans Finanzamt",
          value: "Termin offen · Frau Berger prüft",
          origin: "crm",
          step: 2,
          open: true,
          sent: "bis 1. Dezember durch die Kanzlei",
        },
      ],
      draft: {
        salutation: "Guten Tag Frau Neumann,",
        paragraphs: [
          {
            text: "vielen Dank, dass Sie uns das Schreiben gleich geschickt haben. Wir kümmern uns darum und antworten dem Finanzamt für Sie.",
          },
          {
            text: "Die Rechnung des Malerbetriebs liegt uns vor. Handwerkerkosten erkennt das Finanzamt aber nur an, wenn sie überwiesen wurden. Bitte schicken Sie uns deshalb den Kontoauszug mit der Überweisung.",
            source: "Merkblatt Handwerkerleistungen",
          },
          {
            text: "Termin für die Antwort ans Finanzamt nennen",
            team: "Wir antworten dem Finanzamt bis zum 1. Dezember. Dafür bräuchten wir den Kontoauszug bis zum 28. November.",
          },
          { text: "Bei Fragen erreichen Sie Frau Berger direkt." },
        ],
      },
    },
  ],
};
