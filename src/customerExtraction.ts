// Reihenfolge = Reihenfolge der Übernahme. "info" sind Angaben aus der Mail,
// "task" sind daraus abgeleitete Aufgaben.
export const customerExtractions = [
  {
    id: "plant",
    group: "info",
    field: "Anlage",
    sources: ["plant"],
    primary: "plant",
    status: "Übernehme Anlagenangaben",
    reference: "Anlagenbeschreibung in der Einleitung",
  },
  {
    id: "request",
    group: "info",
    field: "Anliegen",
    sources: ["request", "noise"],
    primary: "noise",
    status: "Übernehme Anliegen",
    reference: "Wartungsangebot und Absatz zum Startgeräusch · 2 Textstellen",
  },
  {
    id: "time",
    group: "info",
    field: "Zeitfenster",
    sources: ["time"],
    primary: "time",
    status: "Übernehme Zeitfenster",
    reference: "Absatz zu Dienstag- und Freitagsterminen",
  },
  {
    id: "photo",
    group: "task",
    field: "Rückfrage an Kundin",
    sources: ["photo"],
    primary: "photo",
    status: "Übernehme Rückfrage",
    reference: "„Ein Typenschildfoto reiche ich bei Bedarf nach.“",
  },
] as const;
export type ExtractionState = {
  index: number;
  completed: number;
  phase: "source" | "transfer" | "capture" | "done";
};
export const initialExtraction: ExtractionState = {
  index: 0,
  completed: 0,
  phase: "source",
};
