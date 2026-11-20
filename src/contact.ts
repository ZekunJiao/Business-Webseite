// Absenderangaben und Vorstellung für die Branchenseiten.
// Kontaktfelder bleiben leer, bis echte Angaben eingetragen werden:
// Leere Felder werden auf der Seite nicht angezeigt.
// Zeile einer Rechnung oder Aufteilung. tone "total" ist die Ergebniszeile,
// "team" eine Anfrage, die bewusst beim Team landet.
type BreakdownRow = {
  label: string;
  detail?: string;
  value: string;
  tone?: "total" | "team";
};

type Result = {
  value: string;
  label: string;
  /** Kurzfassung für den Einstieg der Branchenseite. Ohne teaser: nur unten. */
  teaser?: string;
  context?: string;
  breakdown?: { title: string; rows: BreakdownRow[]; notes?: string[] };
};

type Contact = {
  name: string;
  role: string;
  intro: string;
  /** Was ich baue, als kurze Stichworte. */
  builds: string[];
  /**
   * Kennzahlen aus Kundenprojekten (Angaben von Zekun Jiao). value und label
   * sind auf einen Blick lesbar; context nennt klein darunter, woher die Zahl
   * stammt; breakdown klappt die Rechnung bzw. Aufteilung auf.
   */
  results: Result[];
  // Leer = Zeile wird nicht angezeigt.
  trackRecord: string;
  resultsNote: string;
  /** Was die Zusammenarbeit ausmacht. */
  strengths: { title: string; text: string }[];
  /**
   * Porträtfoto, Pfad relativ zu public/ (z. B. "/assets/zekun-jiao.jpg").
   * Leer: An seiner Stelle steht ein Platzhalter.
   */
  photo?: string;
  email?: string;
  phone?: string;
  /** Vollständige Profil-URL, z. B. "https://www.linkedin.com/in/…". */
  linkedin?: string;
  /**
   * Ladungsfähige Anschrift für Impressum und Datenschutzerklärung
   * (kein Postfach). Leer: Die Rechtsseiten zeigen einen Hinweis „folgt“.
   */
  address?: { street: string; postalCode: string; city: string };
  /** Umsatzsteuer-ID nach § 27a UStG, nur falls vorhanden. */
  vatId?: string;
};

export const contact: Contact = {
  name: "Zekun Jiao",
  role: "KI und Automatisierung für Betriebe",
  intro:
    "Ich bin Informatiker (Bachelor und Master, TU München) und AI Transformation Lead bei der BMW Group. Dort bringe ich KI in die Fachbereiche: Wir bauen KI-Agenten, die aus sehr großen Datenmengen verständliche Antworten machen. Dieselbe Arbeitsweise bringe ich in Betriebe wie deinen.",
  builds: [
    "Telefonassistenz",
    "Posteingang und Antwortentwürfe",
    "KI-Agenten",
    "Anbindung an deine Software",
  ],
  // Rechnungen von Hand nachgerechnet (Stand: Angaben vom 15.11.2026).
  // Bei Änderungen alle Zeilen einer Kachel neu rechnen.
  results: [
    {
      value: "30 von 40",
      label:
        "bisher verpassten Anrufen pro Woche nimmt der Assistent an, jeden mit verwertbarer Gesprächsnotiz",
      context:
        "Wärmepumpenbetrieb in München, 12 Mitarbeiter · je 4 Wochen vor und nach der Einführung",
      breakdown: {
        title: "So gerechnet",
        rows: [
          {
            label: "Vorher: unbeantwortete Anrufe",
            detail: "Anrufliste der Telefonanlage, 4 Wochen",
            value: "163 ≈ 40 pro Woche",
          },
          {
            label: "Nachher: vom Assistenten angenommen",
            detail: "Protokoll des Assistenten, 4 Wochen",
            value: "134",
          },
          {
            label: "davon sofort aufgelegt oder verwählt",
            value: "− 14",
          },
          {
            label: "mit verwertbarer Notiz",
            value: "120 ≈ 30 pro Woche",
            tone: "total",
          },
        ],
        notes: [
          "Verwertbar heißt: Name, Rückrufnummer und Anliegen sind erfasst.",
          "Die übrigen rund 10 pro Woche: Der Anrufer legt vor der Ansage auf oder ruft außerhalb der Weiterleitungszeiten an.",
        ],
      },
    },
    {
      value: "8 → 2 Std.",
      label: "bis zur ersten Antwort auf E-Mails und Formularanfragen",
      context:
        "3 Betriebe · Median aus 90 Anfragen vorher und 512 nachher · nur Geschäftszeiten (Mo–Fr 7–17 Uhr)",
      breakdown: {
        title: "So gemessen",
        rows: [
          {
            label: "Vorher: Median",
            detail:
              "Stichprobe von 90 Anfragen (30 je Betrieb), 4 Wochen vor der Einführung",
            value: "8,1 Std.",
          },
          {
            label: "Nachher: Median",
            detail: "alle 512 Anfragen der ersten 4 Wochen",
            value: "1,9 Std.",
            tone: "total",
          },
        ],
        notes: [
          "Betriebe: SHK, Elektro und Photovoltaik.",
          "Median statt Durchschnitt, weil einzelne Anfragen über das Wochenende den Durchschnitt verzerren.",
          "Gezählt werden Geschäftsstunden: Eine Mail um 16 Uhr, beantwortet am nächsten Tag um 8 Uhr, zählt als 2 Stunden.",
          "Eingangs- und Antwortzeit stammen aus dem Postfach.",
        ],
      },
    },
    {
      value: "45 von 50",
      label:
        "geeigneten Anfragen pro Woche mit Entwurf vorbereitet. Der Rest geht bewusst an dein Team.",
      teaser:
        "Anfragen pro Woche per E-Mail und Formular bereitet der Assistent vor",
      context:
        "SHK-Betrieb in München, 9 Mitarbeiter, 1 Bürokraft in Teilzeit · 4 Wochen · Protokoll des Assistenten, abgeglichen mit dem Posteingang",
      breakdown: {
        title: "So aufgeteilt",
        rows: [
          {
            label: "Entwurf vorbereitet",
            value: "180",
          },
          {
            label: "Kunde unklar → dein Team prüft",
            value: "11",
            tone: "team",
          },
          {
            label: "Beschwerde → direkt an dich",
            value: "6",
            tone: "team",
          },
          {
            label: "nur Anhang ohne Text → dein Team prüft",
            value: "4",
            tone: "team",
          },
          {
            label: "Geeignete Anfragen in 4 Wochen",
            detail: "Kundenanliegen per E-Mail oder Kontaktformular",
            value: "201",
            tone: "total",
          },
        ],
        notes: [
          "180 von 201 sind 89,6 %, im Schnitt 45 von 50 pro Woche.",
          "Nicht gezählt: Lieferantenrechnungen, Newsletter, Bewerbungen und Spam, rund 30 Mails pro Woche.",
        ],
      },
    },
    {
      value: "5+ Std.",
      label:
        "Bürozeit pro Woche gespart, Prüfung, Korrekturen und Rückrufe schon abgezogen",
      teaser: "Bürozeit pro Woche gespart",
      context: "derselbe SHK-Betrieb · erste 4 Wochen ab März 2026",
      breakdown: {
        title: "So gerechnet",
        rows: [
          {
            label: "Vorher",
            detail:
              "45 Anfragen × 12 Min. (lesen 2, Kunde suchen 4, Antwort schreiben 6)",
            value: "540 Min.",
          },
          {
            label: "Mit Assistent",
            detail: "45 Anfragen × 4 Min. (Entwurf prüfen, ergänzen, senden)",
            value: "− 180 Min.",
          },
          {
            label: "Korrekturen und Rückrufe",
            detail: "falsch zugeordnet oder Kunde fragt nach",
            value: "− 45 Min.",
          },
          {
            label: "Gespart pro Woche",
            value: "315 Min. ≈ 5,25 Std.",
            tone: "total",
          },
        ],
        notes: [
          "Die Bürokraft hat in je einer Woche vor und nach der Einführung 20 Anfragen gestoppt. Korrekturen und Rückrufe stammen aus ihren Notizen.",
        ],
      },
    },
  ],
  // Vorübergehend ausgeblendet. Zum Einblenden wieder eintragen:
  // "Seit Februar 2026 habe ich sechs bezahlte Projekte für vier Kunden umgesetzt."
  trackRecord: "",
  resultsNote:
    "Werte aus bisherigen Kundenprojekten. Was bei dir möglich ist, hängt von deinem Betrieb ab.",
  strengths: [
    {
      title: "Konzern-Erfahrung, für deinen Betrieb gebaut",
      text: "Was in großen Abteilungen funktioniert, setze ich in der Größe um, die zu deinem Büro passt.",
    },
    {
      title: "Ein Ansprechpartner",
      text: "Wer mit dir spricht, baut auch. Keine Übergaben, keine Agentur dazwischen.",
    },
    {
      title: "Erst sehen, dann entscheiden",
      text: "Du siehst den Ablauf an einem lauffähigen Beispiel, bevor du dich festlegst.",
    },
    {
      title: "Dein Team behält das letzte Wort",
      text: "Der Assistent bereitet vor. Geprüft und gesendet wird von euch.",
    },
  ],
  photo: "/assets/zekun-jiao.jpg",
  email: "zekun@zekun.de",
  phone: "",
  linkedin: "https://www.linkedin.com/in/zekun-jiao/",
  address: { street: "Königsdorferstraße 7", postalCode: "81371", city: "München" },
  vatId: "",
};
