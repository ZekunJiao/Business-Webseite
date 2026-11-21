// Datenform der Betriebskosten-Demo: Ein Beispiel ist ein Belegstapel für
// ein Objekt. Der Assistent ordnet die Belege Kostenarten zu, trennt nicht
// Umlagefähiges ab, prüft Zeiträume, vergleicht mit dem Vorjahr und
// verteilt die Summe nach Wohnfläche.

export type CostStepKind = "read" | "sort" | "period" | "compare" | "write";

export type CostReceipt = {
  id: string;
  vendor: string;
  text: string;
  amount: number;
  date: string;
};

// Zeile der Aufstellung. Ohne flag: umlagefähig wie belegt.
export type CostLine = {
  receipt: string;
  category: string;
  amount: number;
  previous?: number;
  // Auffällig, ohne Entscheidung (z. B. starke Abweichung zum Vorjahr)
  hint?: string;
  // Nicht umlagefähig oder doppelt: wird abgetrennt
  excluded?: string;
  // Muss das Team entscheiden; die erste Option ist der Vorschlag
  decide?: {
    question: string;
    options: { label: string; amount: number }[];
  };
};

export type CostUnit = {
  id: string;
  tenant: string;
  area: number;
  // Vorauszahlung Betriebskosten im Monat, ohne Heizung
  prepaid: number;
};

export type CostCase = {
  id: string;
  headline: string;
  object: string;
  subtitle: string;
  sentTag: string;
  receipts: CostReceipt[];
  steps: { kind: CostStepKind; label: string; result: string }[];
  lines: CostLine[];
  units: CostUnit[];
};

export type CostStoryData = {
  without: string;
  with: string;
  period: string;
  cases: CostCase[];
};
