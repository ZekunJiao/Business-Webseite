export type ScenarioId = "partial" | "complete" | "unknown";
type Scenario = {
  label: string;
  subject: string;
  sender: string;
  email: string;
  initials: string;
  intro: string;
  salutation: string;
  questions: string[];
  answers: string[];
  openAnswerIndices: number[];
  answerSources: (number | null)[];
  crmFields: { label: string; value: string }[];
};
// Sämtliche Personen, Adressen, Anlagen und Vorgänge sind fiktive Demodaten.
export const scenarios: Record<ScenarioId, Scenario> = {
  partial: {
    label: "Wartungsanfrage mit Rückfragen",
    subject: "Wartung am Musterweg: Angebot und Termin",
    sender: "Lena Hoffmann",
    email: "lena.hoffmann@example.com",
    initials: "LH",
    intro:
      "Guten Tag, unsere Luft/Wasser-Wärmepumpe am Musterweg 14 braucht wieder eine Wartung. Sie waren vor zwei Jahren schon bei uns. Baujahr: 2021, das genaue Modell muss ich nachsehen.",
    salutation: "Guten Tag Frau Hoffmann,",
    questions: [
      "Bitte senden Sie uns ein Wartungsangebot. Ein Typenschildfoto reiche ich bei Bedarf nach.",
      "Seit einigen Wochen startet die Anlage gelegentlich lauter, ohne Fehlermeldung. Können Sie das mitprüfen? Brauchen Sie dafür mehr Zeit?",
      "Termine passen dienstags ab 14 Uhr oder freitags vormittags. Bitte vorher abstimmen; einen Schlüssel können wir nicht hinterlegen.",
      "Sind Anfahrt und Geräuschprüfung enthalten? Bitte mögliche Zusatzkosten separat ausweisen.",
    ],
    answers: [
      "Ihre Anfrage ist dem Musterweg 14 zugeordnet. Bitte senden Sie uns noch ein Typenschildfoto zur sicheren Zuordnung der Anlage.",
      "[Startgeräusch fachlich einschätzen und zusätzlichen Zeitbedarf klären.]",
      "Dienstags ab 14 Uhr oder freitags vormittags ist vermerkt. Den Termin stimmen wir persönlich ab; er ist noch nicht bestätigt.",
      "[Wartungspreis, Anfahrt und Zusatzleistungen im Angebot getrennt ausweisen.]",
    ],
    openAnswerIndices: [1, 3],
    answerSources: [null, null, null, null],
    crmFields: [
      { label: "Kundin", value: "Lena Hoffmann · Bestandskundin" },
      { label: "Objekt", value: "Musterweg 14" },
      {
        label: "Anlage",
        value:
          "Luft/Wasser-Wärmepumpe · Baujahr 2021 · Modell noch zu bestätigen",
      },
      {
        label: "Anliegen",
        value: "Wartungsangebot und Prüfung eines Startgeräuschs",
      },
      {
        label: "Zeitfenster",
        value: "Di ab 14 Uhr / Fr vormittags · noch kein Termin",
      },
      { label: "Rückfrage", value: "Foto des Typenschilds anfordern" },
      {
        label: "Offen",
        value: "Fachliche Einschätzung, Zeitbedarf und Kostenfreigabe",
      },
    ],
  },
  complete: {
    label: "Mehrteilige allgemeine Frage",
    subject: "Fragen zu Wartung, Vorbereitung und Preis",
    sender: "Daniel Winter",
    email: "daniel.winter@example.com",
    initials: "DW",
    intro:
      "Guten Tag, wir suchen einen Wartungsservice für unsere Wärmepumpe. Sie wurde von einem anderen Betrieb eingebaut. Vor einer Anfrage möchten wir Folgendes klären:",
    salutation: "Guten Tag Herr Winter,",
    questions: [
      "Warten Sie auch fremd installierte Anlagen? Welche Angaben brauchen Sie, um unser Modell zu prüfen?",
      "Was gehört zur Wartung? Sind Reparaturen und Verschleißteile enthalten?",
      "Muss jemand vor Ort sein? Welche Unterlagen und Zugänge sollen wir vorbereiten?",
      "Wie wird der verbindliche Preis ermittelt – nach Anlage und Aufwand? Wir möchten vorerst nur Informationen, keinen Termin.",
    ],
    answers: [
      "Auch fremd installierte Anlagen kommen infrage. Bitte nennen Sie Hersteller, Modell und Baujahr; ein Typenschildfoto hilft. Die Betreuung bestätigen wir nach Prüfung.",
      "Die Wartung richtet sich nach Anlage und Angebot. Reparaturen und Ersatzteile werden bei Bedarf separat angeboten und abgestimmt.",
      "Bitte sorgen Sie für Zugang und eine Ansprechperson vor Ort. Halten Sie Anlagenunterlagen und Wartungsnachweise bereit. Andere Zugangsregelungen stimmen wir vorher ab.",
      "Ein verbindliches Angebot erhalten Sie nach Prüfung von Anlage und Leistungsumfang. Diese Auskunft enthält noch keine Preis- oder Terminzusage.",
    ],
    openAnswerIndices: [],
    answerSources: [2, 5, 8, 10],
    crmFields: [],
  },
  unknown: {
    label: "Anfrage mit unklarer Zuordnung",
    subject: "Neue Mailadresse: Welches Haus wurde gewartet?",
    sender: "Alex Sommer · Objektbetreuung",
    email: "objektservice@example.com",
    initials: "AS",
    intro:
      "Hallo, wir nutzen eine neue Sammeladresse. Sie haben letztes Jahr ein Haus von uns gewartet. Die Rechnung lief wohl über die Eigentümerin; Kunden- und Rechnungsnummer fehlen.",
    salutation: "Guten Tag,",
    questions: [
      "War Ihr Einsatz in der Beispielstraße 8 oder 8a? Beide Häuser haben eine Heizungsanlage. Die Unterlagen liegen bei meiner Kollegin.",
      "Wir möchten eine neue Wartung anfragen. Die Rechnungsadresse könnte sich geändert haben – bitte erst nach Rücksprache übernehmen.",
      "Die Mieter sind tagsüber selten da. Den Termin stimmen wir nach der Zuordnung gemeinsam ab. Welche Angaben brauchen Sie dafür?",
    ],
    answers: [],
    openAnswerIndices: [],
    answerSources: [],
    crmFields: [],
  },
};
export const sources = [
  {
    title: "Kontakt und Erreichbarkeit",
    excerpt:
      "Allgemeine Kontaktwege, telefonische Erreichbarkeit und Zuständigkeiten im Büro. Rückrufwünsche werden mit Name, Kontaktdaten und Anliegen aufgenommen.",
  },
  {
    title: "Heizkörper und Raumtemperatur",
    excerpt:
      "Anfragen zu ungleichmäßig warmen Heizkörpern werden mit Angaben zum betroffenen Raum, zur Heizungsanlage und zum bisherigen Verlauf für das Fachteam erfasst.",
  },
  {
    title: "Anlagen anderer Installationsbetriebe",
    excerpt:
      "Auch Anlagen anderer Installationsbetriebe können angefragt werden. Die Betreuungsmöglichkeit wird anhand von Hersteller, Modell, Baujahr und möglichst einem Typenschildfoto geprüft. Keine pauschale Zusage für jedes Modell.",
  },
  {
    title: "Rechnungen und Zahlungswege",
    excerpt:
      "Rückfragen zu bereits ausgestellten Rechnungen gehen mit Rechnungsnummer und Kundenzuordnung an die Buchhaltung. Zahlungsinformationen werden aus dem jeweiligen Beleg übernommen.",
  },
  {
    title: "Badmodernisierung: Erstgespräch",
    excerpt:
      "Für ein Erstgespräch werden die Wünsche zur Badgestaltung, vorhandene Grundrisse, Fotos und der gewünschte Projektzeitraum gesammelt. Die weitere Planung erfolgt nach persönlicher Abstimmung.",
  },
  {
    title: "Leistungsumfang und Abgrenzung",
    excerpt:
      "Der Wartungsumfang folgt dem anlagenspezifischen Angebot. Reparaturen und Ersatzteile sind nicht automatisch enthalten; zusätzliche Leistungen werden separat angeboten und abgestimmt.",
  },
  {
    title: "Heizungswechsel: Beratung",
    excerpt:
      "Für die Beratung zu einem Heizungswechsel werden Gebäudedaten, das bestehende Heizsystem und die Ziele der Eigentümer aufgenommen. Die technische Auslegung gehört in einen eigenen Beratungsvorgang.",
  },
  {
    title: "Terminabsagen und Verschiebungen",
    excerpt:
      "Änderungswünsche werden dem bestehenden Termin zugeordnet und mit der Einsatzplanung abgestimmt. Eine Verschiebung gilt erst nach ausdrücklicher Bestätigung als vereinbart.",
  },
  {
    title: "Vorbereitung und Zugang",
    excerpt:
      "Zugang zur Anlage sicherstellen, vorhandene Anlagenunterlagen und Wartungsnachweise bereithalten. Eine ansprechbare Person sollte vor Ort sein. Andere Zugangsregelungen werden vorab abgestimmt.",
  },
  {
    title: "Trinkwasserinstallation: Anfragen",
    excerpt:
      "Anliegen zur Trinkwasserinstallation werden getrennt von Heizungswartungen aufgenommen. Für die Vorbereitung werden Objekt, betroffener Bereich und eine Beschreibung des gewünschten Einsatzes benötigt.",
  },
  {
    title: "Angebot und Preisermittlung",
    excerpt:
      "Verbindliche Angebote erst nach Prüfung der Anlagenangaben und des benötigten Leistungsumfangs erstellen. Allgemeine Auskünfte enthalten weder konkrete Preise noch Terminbestätigungen.",
  },
  {
    title: "Dokumentation nach dem Einsatz",
    excerpt:
      "Nach einem abgeschlossenen Einsatz werden Arbeitsbericht und freigegebene Dokumente im zugehörigen Vorgang abgelegt. Fehlende Berichte werden beim zuständigen Team angefragt.",
  },
];
