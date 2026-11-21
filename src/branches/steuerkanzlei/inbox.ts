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
      id: "homeoffice",
      headline: "Kann ich das absetzen?",
      from: "Julia Brandl",
      initials: "JB",
      time: "09:12",
      subject: "Monitor und Bürostuhl fürs Homeoffice",
      body: [
        "Hallo Frau Berger,",
        "ich habe mir dieses Jahr fürs Homeoffice einen Monitor für 329 € und einen Bürostuhl für 389 € gekauft. Ich arbeite drei Tage pro Woche von zu Hause. Kann ich das in der Steuererklärung angeben?",
        "Viele Grüße\nJulia Brandl",
      ],
      marks: [
        "Monitor für 329 €",
        "Bürostuhl für 389 €",
        "drei Tage pro Woche von zu Hause",
        "in der Steuererklärung angeben",
      ],
      steps: [
        { kind: "read", label: "Liest die Anfrage", result: "Frage zu Arbeitsmitteln und Homeoffice" },
        { kind: "crm", label: "Sucht in der Kanzleisoftware", result: "Mandantin seit 2021, Arbeitnehmerin" },
        { kind: "docs", label: "Schaut in die Merkblätter", result: "Werbungskosten und Homeoffice-Pauschale" },
        { kind: "write", label: "Schreibt den Entwurf", result: "Antwort mit Quelle bereit" },
      ],
      fields: [
        { label: "Mandantin", value: "Julia Brandl · Einkommensteuer, Arbeitnehmerin", origin: "crm", step: 1 },
        { label: "Anliegen", value: "Monitor und Bürostuhl absetzen, Homeoffice 3 Tage pro Woche", origin: "mail", step: 0 },
        {
          label: "Einordnung",
          value: "Arbeitsmittel unter 800 € netto, Homeoffice-Pauschale möglich",
          origin: "crm",
          step: 2,
        },
        {
          label: "Homeoffice-Tage 2026",
          value: "Anzahl fehlt · Rückfrage",
          origin: "mail",
          step: 0,
          open: true,
          sent: "Rückfrage gestellt",
        },
      ],
      draft: {
        salutation: "Guten Tag Frau Brandl,",
        paragraphs: [
          { text: "vielen Dank für Ihre Frage." },
          {
            text: "Monitor und Bürostuhl können Sie als Arbeitsmittel angeben, wenn Sie sie fast nur beruflich nutzen. Weil beide unter 800 € netto kosten, zählen sie voll im Jahr des Kaufs. Bitte heben Sie die Rechnungen auf.",
            source: "Merkblatt Werbungskosten für Arbeitnehmer",
          },
          {
            text: "Für jeden Tag, an dem Sie überwiegend zu Hause arbeiten, gibt es außerdem die Homeoffice-Pauschale von 6 €, höchstens 1.260 € im Jahr. Steuerlich wirkt sich das aus, soweit Ihre Werbungskosten zusammen über dem Arbeitnehmer-Pauschbetrag von 1.230 € liegen.",
            source: "Merkblatt Homeoffice-Pauschale",
          },
          {
            text: "Rückfrage zu den Homeoffice-Tagen",
            team: "Damit wir die Pauschale richtig ansetzen: An wie vielen Tagen haben Sie 2026 ungefähr zu Hause gearbeitet?",
          },
          { text: "Alles Weitere besprechen wir gern bei Ihrer Erklärung für 2026." },
        ],
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
