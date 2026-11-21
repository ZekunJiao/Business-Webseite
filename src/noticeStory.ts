// Datenform der Bescheid-Demo: Ein Beispiel ist ein Steuerbescheid. Der
// Assistent gleicht ihn mit Erklärung oder Buchhaltung ab, ordnet jede
// Abweichung ein, berechnet die Einspruchsfrist und schreibt eine Mail an den
// Mandanten. Wie die Kanzlei reagiert, entscheidet das Team.

export type NoticeStepKind =
  | "read"
  | "compare"
  | "history"
  | "deadline"
  | "write";

// same: wie erklärt · deviation: Abweichung mit Begründung · error: Fehler
// des Finanzamts
export type NoticeTone = "same" | "deviation" | "error";

export type NoticeRow = {
  label: string;
  declared: string;
  assessed: string;
  tone: NoticeTone;
  // Wirkung der Abweichung, z. B. "+ 380 € Steuer"
  effect?: string;
  // Einordnung durch den Assistenten
  note?: string;
};

export type NoticeOption = {
  label: string;
  // Absatz der Mail, der an die Stelle von "{decision}" tritt
  paragraph: string;
  // Kennzeichen in der Liste nach der Freigabe
  tag: string;
};

export type NoticeCase = {
  id: string;
  headline: string;
  client: string;
  kind: string;
  // Eingangsweg, z. B. "Mandantenportal"
  channel: string;
  time: string;
  notice: {
    title: string;
    authority: string;
    date: string;
    lines: { label: string; value: string }[];
    explanation: string[];
  };
  // Textstellen, die der Assistent beim Lesen markiert
  marks: string[];
  steps: { kind: NoticeStepKind; label: string; result: string }[];
  // Spaltenköpfe des Abgleichs, z. B. ["Erklärung", "Bescheid"]
  columns: [string, string];
  // Überschrift "Abgleich mit …" und Kennzeichen unveränderter Zeilen
  compareWith: string;
  sameLabel: string;
  summary: {
    before: { label: string; value: string };
    after: { label: string; value: string };
    // due: es kostet mehr als erwartet · credit: Erstattung wie erwartet
    tone: "due" | "credit";
  };
  rows: NoticeRow[];
  deadline: { label: string; value: string }[];
  // Ohne decision gibt das Team die Mail direkt frei.
  decision?: { question: string; options: NoticeOption[] };
  sentTag: string;
  mail: { to: string; salutation: string; paragraphs: string[] };
};

export type NoticeStoryData = {
  without: string;
  with: string;
  closing: string;
  cases: NoticeCase[];
};
