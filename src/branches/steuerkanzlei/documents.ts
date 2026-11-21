import type { InvoiceCase, InvoiceLabels, LedgerRow } from "../../invoiceStory";
import type { InvoiceStoryData } from "../../invoiceStory";

// Beispielfälle „Fehlende Unterlagen“ für die Steuerkanzlei. Nutzt die
// Rechnungs-Demo: Statt offener Posten zeigt die Liste den Stand der
// Unterlagen je Mandant, ohne Beträge. Kanzlei, Mandanten und Angaben sind
// erfunden. Vereinfachte Darstellung, keine Steuerberatung.

const roth: LedgerRow = {
  id: "roth",
  number: "Mandant 20152",
  customer: "Familie Roth",
  subject: "Einkommensteuer 2025",
  status: { label: "vollständig", tone: "paid" },
};
const weber: LedgerRow = {
  id: "weber",
  number: "Mandant 30214",
  customer: "Weber Elektro GmbH",
  subject: "Buchhaltung Oktober",
  status: { label: "Belege erwartet", tone: "open" },
};

const labels: InvoiceLabels = {
  ledgerTitle: "Unterlagen je Mandant",
  resultColumn: "Für Ihr Team vorbereitet",
  confirmedChip: "Von Ihrem Team bestätigt",
  readyChip: "Wartet auf Ihre Entscheidung",
  extraSettled: "Von Ihnen übernommen",
  openForTeam: "Ergänzt Ihr Team",
  filledByTeam: "Von Ihrem Team ergänzt",
  sentNote: "Von Ihrem Team geprüft, entschieden und gesendet.",
};

const cases: InvoiceCase[] = [
  {
    id: "checkliste",
    headline: "Unterlagen mit der Checkliste abgleichen",
    from: "Sandra Huber",
    role: "Mandantin",
    source: "person",
    initials: "SH",
    channel: "E-Mail",
    time: "08:42",
    subject: "Unterlagen für die Steuererklärung 2025",
    body: [
      "Hallo Frau Berger, anbei wie besprochen meine Unterlagen: Lohnsteuerbescheinigung, Spendenquittungen und die Rechnung vom Maler.",
      "Die Nebenkostenabrechnung habe ich noch nicht, die kommt erst im Dezember.",
    ],
    marks: [
      "Lohnsteuerbescheinigung",
      "Spendenquittungen",
      "Rechnung vom Maler",
      "Nebenkostenabrechnung",
      "erst im Dezember",
    ],
    sentTag: "Angefordert",
    steps: [
      { kind: "read", label: "Liest Mail und Anhänge", result: "3 Unterlagen erkannt" },
      { kind: "find", label: "Findet Mandantin und Checkliste", result: "Einkommensteuer 2025, Liste aus dem Vorjahr" },
      { kind: "match", label: "Gleicht mit der Checkliste ab", result: "7 von 9 da, 2 fehlen" },
      { kind: "history", label: "Prüft das Vorjahr", result: "Kinderbetreuung 2024, Kind jetzt in der Schule" },
      { kind: "write", label: "Schreibt den Entwurf", result: "Nachforderung bereit" },
    ],
    ledger: [
      {
        id: "huber",
        number: "Mandantin 20417",
        customer: "Sandra Huber",
        subject: "Einkommensteuer 2025",
        status: { label: "4 von 9 Unterlagen", tone: "missing" },
      },
      roth,
      weber,
    ],
    focus: {
      id: "huber",
      proposed: { label: "7 von 9 da · Nachforderung vorbereitet", tone: "proposed" },
      sent: { label: "angefordert · Wiedervorlage 15. Dezember", tone: "confirmed" },
    },
    reasons: [
      {
        title: "3 Unterlagen abgelegt",
        text: "Lohnsteuerbescheinigung, Spendenquittungen und Malerrechnung liegen jetzt in der Akte.",
      },
      {
        title: "2 Unterlagen fehlen noch",
        text: "Nebenkostenabrechnung und Jahresbescheinigung der Bank waren im Vorjahr dabei. Die Nebenkostenabrechnung kommt laut Mail im Dezember.",
      },
      {
        title: "Kinderbetreuung 2025? · bitte entscheiden",
        text: "2024 gab es Kosten für den Kindergarten. Laut Akte kam die Tochter im September 2025 in die Schule. Ob es danach noch Hort- oder Betreuungskosten gab, ist offen.",
        decide: true,
      },
    ],
    messages: [
      {
        to: "Sandra Huber",
        salutation: "Guten Tag Frau Huber,",
        paragraphs: [
          {
            text: "vielen Dank für Ihre Unterlagen. Lohnsteuerbescheinigung, Spendenquittungen und Malerrechnung haben wir abgelegt.",
          },
          {
            text: "Für Ihre Erklärung 2025 fehlen uns noch die Nebenkostenabrechnung, sobald sie da ist, und die Jahresbescheinigung Ihrer Bank.",
          },
          {
            text: "Kinderbetreuung nachfragen oder weglassen",
            team: "Hatten Sie 2025 auch nach der Einschulung Kosten für Hort oder Betreuung? Dann schicken Sie uns bitte die Rechnungen mit.",
          },
        ],
      },
    ],
  },
  {
    id: "erinnerung",
    headline: "Unterlagen seit Wochen offen",
    from: "Ihre Kanzleisoftware",
    role: "Fristenkontrolle",
    source: "software",
    channel: "Hinweis",
    time: "07:00",
    subject: "Unterlagen Tobias Lang seit 6 Wochen offen",
    body: [
      "Einkommensteuer 2025 für Tobias Lang: Unterlagen am 8. Oktober angefordert.",
      "Seitdem kein Eingang. Wiedervorlage heute.",
    ],
    marks: ["Tobias Lang", "am 8. Oktober angefordert", "kein Eingang"],
    sentTag: "Erinnert",
    steps: [
      { kind: "read", label: "Liest den Hinweis", result: "Seit 6 Wochen kein Eingang" },
      { kind: "find", label: "Findet Mandant und Anforderung", result: "3 Unterlagen fehlen" },
      { kind: "match", label: "Prüft Postfach und Portal", result: "Nichts eingegangen, auch nicht im Portal" },
      { kind: "history", label: "Prüft den Verlauf", result: "Vorjahr: erst nach 2 Erinnerungen und einem Anruf" },
      { kind: "write", label: "Schreibt den Entwurf", result: "Erinnerung bereit" },
    ],
    ledger: [
      {
        id: "lang",
        number: "Mandant 20561",
        customer: "Tobias Lang",
        subject: "Einkommensteuer 2025",
        status: { label: "5 von 8 · seit 6 Wochen offen", tone: "overdue" },
      },
      roth,
      weber,
    ],
    focus: {
      id: "lang",
      proposed: { label: "Erinnerung vorbereitet", tone: "proposed" },
      sent: { label: "erinnert · Wiedervorlage in 14 Tagen", tone: "confirmed" },
    },
    reasons: [
      {
        title: "Freundliche Erinnerung mit Liste",
        text: "Herr Lang bekommt die drei fehlenden Unterlagen noch einmal als Liste, mit dem Hinweis aufs Mandantenportal.",
      },
      {
        title: "Zusätzlich anrufen? · bitte entscheiden",
        text: "Im Vorjahr kamen die Unterlagen erst nach zwei Erinnerungen und einem Anruf. Ob Frau Berger diesmal gleich anruft, entscheiden Sie.",
        decide: true,
      },
    ],
    messages: [
      {
        to: "Tobias Lang",
        salutation: "Guten Tag Herr Lang,",
        paragraphs: [
          {
            text: "Anfang Oktober haben wir Sie um Unterlagen für Ihre Steuererklärung 2025 gebeten. Bisher fehlen uns noch die Lohnsteuerbescheinigung, die Jahresbescheinigung Ihrer Bank und die Beitragsbescheinigung Ihrer Berufsunfähigkeitsversicherung.",
          },
          {
            text: "Am einfachsten laden Sie alles im Mandantenportal hoch.",
          },
          {
            text: "Anruf ankündigen oder weglassen",
            team: "Frau Berger ruft Sie außerdem in der nächsten Woche kurz an, damit wir alles rechtzeitig fertig bekommen.",
          },
        ],
      },
    ],
  },
  {
    id: "belege",
    headline: "Kontoumsätze ohne Beleg",
    from: "Bankkonto",
    role: "Kontoumsätze Oktober",
    source: "bank",
    channel: "Kontoauszug",
    time: "06:30",
    subject: "Café Lindner: 4 Umsätze ohne Beleg",
    body: [
      "Kontoumsätze Oktober für Café Lindner übernommen.",
      "Ohne Beleg: Metro 189,00 €, Amazon 64,90 €, K-Tec Kassensysteme 149,00 €, Tankstelle 38,50 €.",
    ],
    marks: [
      "Café Lindner",
      "Metro 189,00 €",
      "Amazon 64,90 €",
      "K-Tec Kassensysteme 149,00 €",
      "Tankstelle 38,50 €",
    ],
    sentTag: "Nachgefragt",
    steps: [
      { kind: "read", label: "Liest die Kontoumsätze", result: "4 Umsätze ohne Beleg" },
      { kind: "find", label: "Sucht Belege in Postfach und Portal", result: "Metro-Rechnung im Postfach gefunden" },
      { kind: "match", label: "Gleicht mit dem Vormonat ab", result: "K-Tec: monatliche Rate, Vertrag in der Akte" },
      { kind: "history", label: "Prüft die Akte", result: "Kein Firmenfahrzeug hinterlegt" },
      { kind: "write", label: "Schreibt den Entwurf", result: "Zuordnung und Rückfrage bereit" },
    ],
    ledger: [
      {
        id: "lindner",
        number: "Mandant 30152",
        customer: "Café Lindner",
        subject: "Buchhaltung Oktober",
        status: { label: "4 Umsätze ohne Beleg", tone: "missing" },
      },
      weber,
      roth,
    ],
    focus: {
      id: "lindner",
      proposed: { label: "2 zugeordnet · 2 Rückfragen", tone: "proposed" },
      sent: { label: "Rückfrage gesendet · Wiedervorlage in 7 Tagen", tone: "confirmed" },
    },
    reasons: [
      {
        title: "Metro 189,00 € · Beleg gefunden",
        text: "Die Rechnung kam am 14. Oktober per Mail. Betrag und Datum passen.",
      },
      {
        title: "K-Tec 149,00 € · laufender Vertrag",
        text: "Monatliche Rate für das Kassensystem wie in den Vormonaten. Der Vertrag liegt in der Akte.",
      },
      {
        title: "Amazon 64,90 € · Rechnung fehlt",
        text: "Ohne Rechnung kein Vorsteuerabzug. Herr Lindner wird um die Rechnung gebeten.",
      },
      {
        title: "Tankstelle 38,50 € · bitte entscheiden",
        text: "In der Akte ist kein Firmenfahrzeug hinterlegt. Nachfragen oder gleich als Privatentnahme buchen?",
        decide: true,
      },
    ],
    messages: [
      {
        to: "Markus Lindner",
        salutation: "Guten Tag Herr Lindner,",
        paragraphs: [
          {
            text: "für die Buchhaltung Oktober fehlt uns noch die Rechnung zu Amazon, 64,90 € am 17. Oktober. Sie finden sie in Ihrem Amazon-Konto unter „Bestellungen“.",
          },
          {
            text: "Tankstelle nachfragen oder als privat buchen",
            team: "Zur Tankstelle, 38,50 € am 22. Oktober: War das eine private Fahrt? Dann buchen wir den Betrag als Privatentnahme.",
          },
          {
            text: "Am einfachsten laden Sie die Rechnung im Mandantenportal hoch.",
          },
        ],
      },
    ],
  },
];

export const unterlagenStory: InvoiceStoryData = {
  without:
    "Unterlagen kommen nach und nach. Was schon da ist, steht verteilt in Mails, Portal und Akte, und jede Nachfrage schreiben Sie von Hand.",
  with: "Jeder Eingang wird mit Checkliste und Kontoumsätzen abgeglichen. Was fehlt, steht in einer Nachfrage bereit, die Ihr Team nur noch prüft.",
  closing: "Mit freundlichen Grüßen\nIhre Steuerkanzlei Mustermann",
  // Ohne Positionen ungenutzt; gehört zur Datenform der Rechnungs-Demo.
  vatRate: 0.19,
  labels,
  cases,
};
