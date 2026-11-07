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
    subject: "Wärmepumpenwartung am Musterweg – Angebot und mögliche Termine",
    sender: "Lena Hoffmann",
    email: "lena.hoffmann@example.com",
    initials: "LH",
    intro:
      "Guten Tag liebes Serviceteam, Sie waren vor zwei Jahren bei uns am Musterweg 14 zur Wartung. Inzwischen ist die nächste Wartung fällig. Die Anlage ist eine Luft/Wasser-Wärmepumpe, Baujahr 2021; die genaue Modellbezeichnung habe ich gerade nicht zur Hand.",
    salutation: "Guten Tag Frau Hoffmann,",
    questions: [
      "Bitte schicken Sie uns ein Angebot für die Wartung. Ein Foto des Typenschilds kann ich Ihnen nachreichen, falls die Angaben in Ihrer Kundenakte nicht ausreichen.",
      "Uns ist aufgefallen, dass die Anlage seit einigen Wochen beim Start gelegentlich lauter wird. Eine Fehlermeldung erscheint nicht. Könnten Sie das bei dem Termin mit prüfen oder muss dafür mehr Zeit eingeplant werden?",
      "Dienstags wäre jemand ab 14 Uhr zu Hause, freitags möglichst vormittags. Bitte stimmen Sie einen konkreten Termin vorher mit uns ab; einen Schlüssel können wir nicht hinterlegen.",
      "Sind Anfahrt und die Prüfung des Geräuschs im Wartungspreis enthalten? Bitte weisen Sie mögliche Zusatzkosten im Angebot separat aus.",
    ],
    answers: [
      "Vielen Dank für Ihre Wartungsanfrage. Wir haben sie Ihrem Kundenvorgang für den Musterweg 14 zugeordnet. Bitte senden Sie uns zur eindeutigen Zuordnung der Anlage noch ein Foto des Typenschilds.",
      "[Fachliche Einschätzung ergänzen: Prüfung des beschriebenen Startgeräuschs und gegebenenfalls zusätzlicher Zeitbedarf.]",
      "Ihre Terminwünsche – dienstags ab 14 Uhr oder freitags vormittags – sowie die notwendige persönliche Abstimmung haben wir vermerkt. Ein konkreter Termin ist damit noch nicht vereinbart.",
      "[Angebot ergänzen: Wartungspreis, Anfahrt und mögliche Zusatzleistungen getrennt ausweisen.]",
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
    subject: "Fragen zu Wartungsumfang, Fremdherstellern und Vorbereitung",
    sender: "Daniel Winter",
    email: "daniel.winter@example.com",
    initials: "DW",
    intro:
      "Guten Tag, wir informieren uns gerade über einen Wartungsservice für unsere Wärmepumpe. Die Anlage wurde von einem anderen Betrieb installiert. Bevor wir eine konkrete Anfrage stellen, hätte ich ein paar allgemeine Fragen zu Ihrem Angebot.",
    salutation: "Guten Tag Herr Winter,",
    questions: [
      "Warten Sie grundsätzlich auch Wärmepumpen, die Sie nicht selbst eingebaut haben? Welche Angaben brauchen Sie, um zu prüfen, ob Sie unser Modell betreuen können?",
      "Was gehört normalerweise zur Wartung? Mir ist wichtig zu verstehen, ob eine Reparatur oder der Austausch von Verschleißteilen bereits dazugehört.",
      "Muss während des Termins jemand zu Hause sein, und welche Unterlagen oder Zugänge sollten wir vorbereiten?",
      "Können Sie vorab einen verbindlichen Preis nennen oder richtet sich das nach Anlage und Aufwand? Im Moment möchten wir nur die Vorgehensweise verstehen und noch keinen Termin buchen.",
    ],
    answers: [
      "Wir prüfen auch Wartungsanfragen für Anlagen, die ein anderer Betrieb installiert hat. Ob wir Ihr Modell betreuen können, klären wir anhand von Hersteller, Modell und Baujahr; ein Foto des Typenschilds hilft bei der Prüfung.",
      "Der Wartungsumfang richtet sich nach der Anlage und dem vereinbarten Angebot. Reparaturen und Ersatzteile gehören nicht automatisch dazu, sondern werden bei Bedarf gesondert angeboten und abgestimmt.",
      "Bitte stellen Sie den Zugang zur Anlage sicher und halten Sie vorhandene Anlagenunterlagen sowie frühere Wartungsnachweise bereit. Eine ansprechbare Person sollte vor Ort sein; abweichende Zugangsregelungen stimmen wir vorab ab.",
      "Ein verbindliches Angebot erstellen wir nach Prüfung der Anlagenangaben und des benötigten Umfangs. Eine konkrete Preis- oder Terminzusage ist mit dieser allgemeinen Auskunft nicht verbunden.",
    ],
    openAnswerIndices: [],
    answerSources: [2, 5, 8, 10],
    crmFields: [],
  },
  unknown: {
    label: "Anfrage mit unklarer Zuordnung",
    subject:
      "Bitte Wartung für das richtige Objekt zuordnen – neue Absenderadresse",
    sender: "Alex Sommer · Objektbetreuung",
    email: "objektservice@example.com",
    initials: "AS",
    intro:
      "Hallo zusammen, ich schreibe heute über unsere neue Sammeladresse. Im vergangenen Jahr war ein Kollege von Ihnen bei einem der von uns betreuten Häuser zur Wartung. Die Rechnung lief vermutlich über die Eigentümerin; eine Kunden- oder Rechnungsnummer habe ich gerade nicht vorliegen.",
    salutation: "Guten Tag,",
    questions: [
      "Es geht entweder um das Haus in der Beispielstraße 8 oder um das Nachbargebäude mit der Nummer 8a. In beiden gibt es eine Heizungsanlage; die Unterlagen liegen bei meiner Kollegin. Können Sie den letzten Einsatz in Ihrer Akte finden?",
      "Für die passende Anlage möchten wir eine erneute Wartung anfragen. Bitte übernehmen Sie die bisherige Rechnungsadresse erst nach Rücksprache – die Zuständigkeit hat sich möglicherweise geändert.",
      "Die Mieter sind tagsüber selten da. Sobald das Objekt geklärt ist, würde ich einen Termin mit Ihnen und der jeweiligen Mietpartei abstimmen. Sagen Sie mir bitte zunächst, welche Angaben Sie zur eindeutigen Zuordnung brauchen.",
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
