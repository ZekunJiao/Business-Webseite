export const customerExtractions = [
  {
    id: "plant",
    field: "Anlage",
    sources: ["plant"],
    primary: "plant",
    status: "Übernehme Anlagenangaben",
    reference: "Anlagenbeschreibung in der Einleitung",
  },
  {
    id: "photo",
    field: "Rückfrage",
    sources: ["photo"],
    primary: "photo",
    status: "Übernehme Rückfrage",
    reference: "„Ein Typenschildfoto reiche ich bei Bedarf nach.“",
  },
  {
    id: "request",
    field: "Anliegen",
    sources: ["request", "noise"],
    primary: "noise",
    status: "Übernehme Anliegen",
    reference: "Wartungsangebot und Absatz zum Startgeräusch · 2 Textstellen",
  },
  {
    id: "time",
    field: "Zeitfenster",
    sources: ["time"],
    primary: "time",
    status: "Übernehme Zeitfenster",
    reference: "Absatz zu Dienstag- und Freitagsterminen",
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
