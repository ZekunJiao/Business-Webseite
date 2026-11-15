// Absenderangaben und Vorstellung für die Branchenseiten.
// Kontaktfelder bleiben leer, bis echte Angaben eingetragen werden:
// Leere Felder werden auf der Seite nicht angezeigt.
type Contact = {
  name: string;
  role: string;
  intro: string;
  /** Was ich baue, als kurze Stichworte. */
  builds: string[];
  /** Kennzahlen aus Kundenprojekten (Angaben von Zekun Jiao). */
  results: { value: string; label: string }[];
  /** Eine Zeile zum Umfang der bisherigen Kundenarbeit. */
  trackRecord: string[];
  resultsNote: string;
  /** Was die Zusammenarbeit ausmacht. */
  strengths: { title: string; text: string }[];
  email?: string;
  phone?: string;
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
  results: [
    {
      value: "30 von 40",
      label:
        "bisher verpassten Anrufen pro Woche angenommen, jeder mit brauchbarer Gesprächsnotiz",
    },
    {
      value: "8 → 2 Std.",
      label:
        "bis zur ersten hilfreichen Antwort an den Kunden (Median, Geschäftszeiten)",
    },
    {
      value: "5+ Std.",
      label:
        "Bürozeit pro Woche gespart, Prüfung, Korrekturen und Rückrufe schon eingerechnet",
    },
    {
      value: "45 von 50",
      label: "geeigneten Anfragen pro Woche bearbeitet",
    },
  ],
  trackRecord: [
    "6+ bezahlte Projekte in den letzten 12 Monaten",
    "4+ Kunden",
    "Längster Ablauf seit über 12 Monaten im Einsatz",
  ],
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
  email: "",
  phone: "",
};
