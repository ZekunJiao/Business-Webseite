// Beispielfälle für die Rechnungs-Demo. Betrieb, Personen, Rechnungen und
// Beträge sind erfunden (Beispielbeträge). Vereinfachte Darstellung, keine
// Rechts- oder Steuerberatung.

export type InvoiceStepKind = "read" | "find" | "match" | "history" | "write";

// Woher der Auslöser kommt
export type InvoiceSource = "person" | "software" | "bank";

export type LedgerTone =
  | "missing"
  | "open"
  | "overdue"
  | "paid"
  | "proposed"
  | "confirmed";

export type LedgerStatus = { label: string; tone: LedgerTone };

// Zeile in der Liste "Offene Posten"
export type LedgerRow = {
  id: string;
  number: string;
  customer: string;
  subject: string;
  // Bruttobetrag in Euro. Fehlt er, wird er aus den Positionen berechnet.
  amount?: number;
  status: LedgerStatus;
};

export type InvoicePosition = {
  text: string;
  quantity: number;
  unit: string;
  // Einzelpreis netto in Euro
  price: number;
  // Beleg, z. B. "wie im Angebot" oder "laut Stundenzettel"
  note: string;
  // Nicht im Angebot enthalten: Das Team entscheidet, ob berechnet wird.
  extra?: boolean;
};

export type InvoiceMessage = {
  to: string;
  salutation: string;
  // team: Satz, den das Team an einer offenen Stelle ergänzt
  paragraphs: { text: string; team?: string }[];
};

export type InvoiceCase = {
  id: string;
  headline: string;
  // Eingang: wer oder was meldet sich, in welcher Rolle, über welchen Weg
  from: string;
  role: string;
  source: InvoiceSource;
  initials?: string;
  channel: string;
  time: string;
  subject: string;
  body: string[];
  marks: string[];
  // Kennzeichen in der Liste links nach dem Senden
  sentTag: string;
  steps: { kind: InvoiceStepKind; label: string; result: string }[];
  ledger: LedgerRow[];
  // Betroffene Zeile und ihr Status als Vorschlag bzw. nach dem Senden
  focus: { id: string; proposed: LedgerStatus; sent: LedgerStatus };
  positions?: InvoicePosition[];
  reasons: { title: string; text: string; decide?: boolean }[];
  messages: InvoiceMessage[];
};

const kruger: LedgerRow = {
  id: "kruger",
  number: "R-0207",
  customer: "Sabine Krüger",
  subject: "Heizungstausch",
  amount: 21848.4,
  status: { label: "offen · fällig in 9 Tagen", tone: "open" },
};
const scholz: LedgerRow = {
  id: "scholz",
  number: "R-0201",
  customer: "Familie Scholz",
  subject: "Thermentausch",
  amount: 4403,
  status: { label: "bezahlt", tone: "paid" },
};

export const invoiceStory = {
  without:
    "Der Auftrag ist fertig, die Rechnung schreibst du Wochen später. Wer nicht zahlt, fällt erst auf, wenn das Konto leer wird.",
  with: "Die Rechnung liegt als Entwurf bereit, sobald der Auftrag fertig ist. Überfällige Rechnungen und unpassende Zahlungen kommen von selbst hoch.",
  closing: "Viele Grüße\nIhr Team von Haustechnik Muster",
  vatRate: 0.19,
  cases: [
    {
      id: "rechnung",
      headline: "Rechnung nach Auftragsende",
      from: "Miriam",
      role: "deine Monteurin",
      source: "person",
      initials: "M",
      channel: "Nachricht",
      time: "16:10",
      subject: "Bad Brandt ist fertig",
      body: [
        "Das Bad bei Brandt ist fertig und abgenommen, Herr Brandt hat unterschrieben.",
        "Alles wie im Angebot. Zusätzlich mussten wir den Estrich ausgleichen, das waren 2 Stunden extra.",
        "Stundenzettel und Fotos sind hochgeladen.",
      ],
      marks: [
        "fertig und abgenommen",
        "wie im Angebot",
        "Estrich ausgleichen",
        "2 Stunden extra",
        "Stundenzettel",
      ],
      sentTag: "Berechnet",
      steps: [
        { kind: "read", label: "Liest die Fertigmeldung", result: "Abgenommen, 2 Std. Mehraufwand" },
        { kind: "find", label: "Findet Auftrag und Angebot", result: "Angebot A-0142, 6 Positionen" },
        { kind: "match", label: "Gleicht Stunden und Material ab", result: "6 wie im Angebot, 1 zusätzlich" },
        { kind: "history", label: "Prüft den Verlauf", result: "Mehraufwand war nicht vereinbart" },
        { kind: "write", label: "Schreibt den Entwurf", result: "Rechnungsentwurf bereit" },
      ],
      ledger: [
        {
          id: "brandt",
          number: "R-0208",
          customer: "Thomas Brandt",
          subject: "Badsanierung",
          status: { label: "fertig · noch keine Rechnung", tone: "missing" },
        },
        kruger,
        scholz,
      ],
      focus: {
        id: "brandt",
        proposed: { label: "Rechnungsentwurf", tone: "proposed" },
        sent: { label: "gesendet · fällig in 14 Tagen", tone: "confirmed" },
      },
      positions: [
        { text: "Badewanne und Altfliesen demontieren", quantity: 1, unit: "pauschal", price: 680, note: "wie im Angebot" },
        { text: "Bodengleiche Dusche 90 × 120 cm inkl. Abdichtung", quantity: 1, unit: "Stück", price: 1850, note: "wie im Angebot" },
        { text: "Bodenfliesen liefern und verlegen", quantity: 8, unit: "m²", price: 95, note: "wie im Angebot" },
        { text: "Wandfliesen liefern und verlegen", quantity: 22, unit: "m²", price: 89, note: "wie im Angebot" },
        { text: "Glasabtrennung 120 cm", quantity: 1, unit: "Stück", price: 740, note: "wie im Angebot" },
        { text: "Bauschutt entsorgen", quantity: 1, unit: "pauschal", price: 240, note: "wie im Angebot" },
        { text: "Estrich ausgleichen", quantity: 2, unit: "Std.", price: 62, note: "laut Stundenzettel", extra: true },
      ],
      reasons: [
        {
          title: "6 Positionen wie im Angebot A-0142",
          text: "Stundenzettel und Materialliste passen zu den angebotenen Mengen.",
        },
        {
          title: "Mehraufwand 2 Std. · bitte entscheiden",
          text: "Der Estrichausgleich steht im Stundenzettel, aber nicht im Angebot. Eine Absprache mit Herrn Brandt ist nicht notiert.",
          decide: true,
        },
      ],
      messages: [
        {
          to: "Thomas Brandt",
          salutation: "Guten Tag Herr Brandt,",
          paragraphs: [
            { text: "vielen Dank für Ihren Auftrag. Anbei erhalten Sie die Rechnung für Ihre Badsanierung." },
            {
              text: "Mehraufwand erklären oder weglassen",
              team: "Zusätzlich enthalten sind zwei Stunden für den Ausgleich des Estrichs, der vor dem Fliesen nötig war.",
            },
          ],
        },
      ],
    },
    {
      id: "erinnerung",
      headline: "Zahlungserinnerung",
      from: "Deine Software",
      role: "Offene Posten",
      source: "software",
      channel: "Hinweis",
      time: "07:00",
      subject: "Rechnung R-0196 überfällig",
      body: [
        "Rechnung R-0196 an Familie Aydin über 285,60 € ist seit 14 Tagen fällig.",
        "Kein Zahlungseingang auf dem Konto.",
      ],
      marks: ["R-0196", "Familie Aydin", "285,60 €", "seit 14 Tagen", "Kein Zahlungseingang"],
      sentTag: "Erinnert",
      steps: [
        { kind: "read", label: "Liest den Hinweis", result: "R-0196 seit 14 Tagen überfällig" },
        { kind: "find", label: "Findet Auftrag und Rechnung", result: "Wartung Aydin, 285,60 €" },
        { kind: "match", label: "Gleicht mit dem Konto ab", result: "Kein Eingang, auch kein Teilbetrag" },
        { kind: "history", label: "Prüft den Verlauf", result: "Keine Reklamation, erste Erinnerung" },
        { kind: "write", label: "Schreibt den Entwurf", result: "Erinnerung und Wiedervorlage bereit" },
      ],
      ledger: [
        {
          id: "aydin",
          number: "R-0196",
          customer: "Familie Aydin",
          subject: "Wartung",
          amount: 285.6,
          status: { label: "überfällig seit 14 Tagen", tone: "overdue" },
        },
        kruger,
        scholz,
      ],
      focus: {
        id: "aydin",
        proposed: { label: "Erinnerung vorbereitet", tone: "proposed" },
        sent: { label: "erinnert · Wiedervorlage in 7 Tagen", tone: "confirmed" },
      },
      reasons: [
        {
          title: "Freundlicher Ton, keine Mahngebühr",
          text: "Es ist die erste Erinnerung. Familie Aydin hat die letzten drei Rechnungen pünktlich bezahlt.",
        },
        {
          title: "Keine Reklamation offen",
          text: "Zum Auftrag gibt es keine Beschwerde und keine offene Rückfrage. Sonst würde der Assistent keine Erinnerung vorbereiten, sondern bei dir nachfragen.",
        },
      ],
      messages: [
        {
          to: "Familie Aydin",
          salutation: "Guten Tag Familie Aydin,",
          paragraphs: [
            {
              text: "vielleicht ist es im Alltag untergegangen: Unsere Rechnung R-0196 über 285,60 € für die Wartung ist noch offen.",
            },
            {
              text: "Bitte überweisen Sie den Betrag in den nächsten 7 Tagen. Falls Sie schon gezahlt haben, ist diese Nachricht erledigt.",
            },
          ],
        },
      ],
    },
    {
      id: "zahlung",
      headline: "Zahlung passt nicht",
      from: "Bankkonto",
      role: "Zahlungseingang",
      source: "bank",
      channel: "Kontoauszug",
      time: "09:20",
      subject: "Eingang 3.078,77 €",
      body: [
        "Eingang: 3.078,77 € von Jürgen Maier.",
        "Verwendungszweck: R-0203 abzgl. 2 % Skonto.",
        "Buchungstag: der 19.",
      ],
      marks: ["3.078,77 €", "Jürgen Maier", "R-0203", "2 % Skonto", "der 19."],
      sentTag: "Geklärt",
      steps: [
        { kind: "read", label: "Liest den Zahlungseingang", result: "3.078,77 € von Jürgen Maier" },
        { kind: "find", label: "Findet Auftrag und Rechnung", result: "R-0203 über 3.141,60 €" },
        { kind: "match", label: "Gleicht den Betrag ab", result: "62,83 € fehlen: 2 % abgezogen" },
        { kind: "history", label: "Prüft den Verlauf", result: "Skontofrist endete am 12." },
        { kind: "write", label: "Schreibt den Entwurf", result: "Zuordnung und Nachricht bereit" },
      ],
      ledger: [
        {
          id: "maier",
          number: "R-0203",
          customer: "Jürgen Maier",
          subject: "Enthärtungsanlage",
          amount: 3141.6,
          status: { label: "offen · fällig in 3 Tagen", tone: "open" },
        },
        kruger,
        scholz,
      ],
      focus: {
        id: "maier",
        proposed: { label: "Zahlung zugeordnet · 62,83 € fehlen", tone: "proposed" },
        sent: { label: "Restbetrag 62,83 € angefordert", tone: "confirmed" },
      },
      reasons: [
        {
          title: "Zahlung gehört zu R-0203",
          text: "Absender und Verwendungszweck passen. Der Betrag entspricht der Rechnung abzüglich 2 %.",
        },
        {
          title: "Skonto nicht berechtigt · bitte entscheiden",
          text: "Laut Rechnung galt Skonto bei Zahlung bis zum 12. Das Geld kam am 19. Offen bleiben 62,83 €: nachfordern oder aus Kulanz ausbuchen.",
          decide: true,
        },
      ],
      messages: [
        {
          to: "Jürgen Maier",
          salutation: "Guten Tag Herr Maier,",
          paragraphs: [
            { text: "vielen Dank für Ihre Zahlung von 3.078,77 € zur Rechnung R-0203." },
            {
              text: "Entscheiden: 62,83 € nachfordern oder ausbuchen",
              team: "Die Skontofrist war am 12. abgelaufen. Bitte überweisen Sie den Restbetrag von 62,83 € noch nach.",
            },
          ],
        },
      ],
    },
  ] as InvoiceCase[],
};
