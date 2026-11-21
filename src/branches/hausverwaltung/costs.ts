import type { CostStoryData } from "../../costStory";

// Beispielbelege für die Betriebskosten-Demo der Hausverwaltung. Objekte,
// Personen, Firmen und Beträge sind erfunden. Vereinfachte Darstellung:
// alles nach Wohnfläche, Heizkosten separat über den Messdienst. Keine
// Rechtsberatung.
export const betriebskostenStory: CostStoryData = {
  without:
    "Jedes Frühjahr: Belege aus Ordnern und Postfach sammeln, Kostenarten zuordnen, Reparaturen heraussuchen und jede Zahl mit dem Vorjahr vergleichen.",
  with: "Die Belege liegen nach Kostenarten sortiert. Nicht Umlagefähiges ist abgetrennt, Auffälliges markiert. Ihr Team entscheidet die offenen Punkte.",
  period: "2025",
  cases: [
    {
      id: "lindenweg",
      headline: "Hausmeisterrechnung mit Reparatur",
      object: "Lindenweg 4",
      subtitle: "6 Wohnungen",
      sentTag: "Freigegeben",
      receipts: [
        { id: "grundsteuer", vendor: "Stadt Freising", text: "Grundsteuerbescheid 2025", amount: 1284, date: "15.02.2025" },
        { id: "wasser", vendor: "Stadtwerke Freising", text: "Wasser und Abwasser 2025", amount: 2946.8, date: "20.01.2026" },
        { id: "muell", vendor: "Landratsamt Freising", text: "Müllgebühren 2025", amount: 864, date: "10.03.2025" },
        { id: "hausmeister", vendor: "Hausservice Wimmer", text: "Hausmeister 2025, inkl. Reparatur Dachrinne", amount: 3120, date: "05.01.2026" },
        { id: "versicherung", vendor: "Isartal Versicherung", text: "Gebäudeversicherung 2025", amount: 1512.3, date: "02.01.2025" },
        { id: "schloss", vendor: "Schlüsseldienst Meier", text: "Haustürschloss getauscht", amount: 245, date: "18.06.2025" },
      ],
      steps: [
        { kind: "read", label: "Liest die Belege", result: "6 Belege, alle für 2025" },
        { kind: "sort", label: "Ordnet die Kostenarten zu", result: "5 umlagefähig, 1 Reparatur" },
        { kind: "period", label: "Prüft Zeiträume und Inhalte", result: "Hausmeisterrechnung mit Reparaturanteil" },
        { kind: "compare", label: "Vergleicht mit dem Vorjahr", result: "Wasser +38 %" },
        { kind: "write", label: "Erstellt die Aufstellung", result: "Aufstellung und Anteile bereit" },
      ],
      lines: [
        { receipt: "grundsteuer", category: "Grundsteuer", amount: 1284, previous: 1284 },
        {
          receipt: "wasser",
          category: "Wasser und Abwasser",
          amount: 2946.8,
          previous: 2135.4,
          hint: "Zählerstände prüfen, bevor die Abrechnung rausgeht",
        },
        { receipt: "muell", category: "Müllbeseitigung", amount: 864, previous: 828 },
        {
          receipt: "hausmeister",
          category: "Hauswart",
          amount: 3120,
          previous: 2690,
          decide: {
            question:
              "Die Rechnung enthält 380 € für die Reparatur der Dachrinne. Reparaturen sind nicht umlagefähig.",
            options: [
              { label: "Reparatur herausrechnen", amount: 2740 },
              { label: "Rechnung ganz umlegen", amount: 3120 },
            ],
          },
        },
        { receipt: "versicherung", category: "Sach- und Haftpflichtversicherung", amount: 1512.3, previous: 1468.2 },
        {
          receipt: "schloss",
          category: "Instandhaltung",
          amount: 245,
          excluded: "Reparatur, trägt der Eigentümer",
        },
      ],
      units: [
        { id: "WE 1.1", tenant: "Novak", area: 58, prepaid: 100 },
        { id: "WE 1.2", tenant: "Hofmann", area: 74, prepaid: 150 },
        { id: "WE 2.1", tenant: "Schuster", area: 66, prepaid: 115 },
        { id: "WE 2.2", tenant: "Yilmaz", area: 72, prepaid: 135 },
        { id: "WE 3.1", tenant: "Bauer", area: 70, prepaid: 135 },
        { id: "WE 3.2", tenant: "Lorenz", area: 72, prepaid: 130 },
      ],
    },
    {
      id: "isarstrasse",
      headline: "Versicherung über den Jahreswechsel",
      object: "Isarstraße 12",
      subtitle: "5 Wohnungen",
      sentTag: "Freigegeben",
      receipts: [
        { id: "grundsteuer", vendor: "Stadt Freising", text: "Grundsteuerbescheid 2025", amount: 1968, date: "15.02.2025" },
        { id: "wasser", vendor: "Stadtwerke Freising", text: "Wasser und Abwasser 2025", amount: 3412.6, date: "20.01.2026" },
        { id: "reinigung", vendor: "Glanzwerk Gebäudereinigung", text: "Treppenhausreinigung 2025", amount: 2380, date: "08.01.2026" },
        { id: "versicherung", vendor: "Isartal Versicherung", text: "Gebäudeversicherung 10/2024 bis 09/2025", amount: 2184, date: "01.10.2024" },
        { id: "strom", vendor: "Stadtwerke Freising", text: "Allgemeinstrom 2025", amount: 486.2, date: "22.01.2026" },
        { id: "verwaltung", vendor: "Hausverwaltung Mustermann", text: "Verwaltergebühr 2025", amount: 1440, date: "31.12.2025" },
      ],
      steps: [
        { kind: "read", label: "Liest die Belege", result: "6 Belege, einer reicht ins Vorjahr" },
        { kind: "sort", label: "Ordnet die Kostenarten zu", result: "5 umlagefähig, Verwaltergebühr nicht" },
        { kind: "period", label: "Prüft Zeiträume und Inhalte", result: "Versicherung 10/2024 bis 09/2025" },
        { kind: "compare", label: "Vergleicht mit dem Vorjahr", result: "keine großen Abweichungen" },
        { kind: "write", label: "Erstellt die Aufstellung", result: "Aufstellung und Anteile bereit" },
      ],
      lines: [
        { receipt: "grundsteuer", category: "Grundsteuer", amount: 1968, previous: 1968 },
        { receipt: "wasser", category: "Wasser und Abwasser", amount: 3412.6, previous: 3380.1 },
        { receipt: "reinigung", category: "Gebäudereinigung", amount: 2380, previous: 2310 },
        {
          receipt: "versicherung",
          category: "Sach- und Haftpflichtversicherung",
          amount: 2184,
          previous: 2098,
          decide: {
            question:
              "Die Police läuft von Oktober 2024 bis September 2025. Drei Monate gehören ins Vorjahr.",
            options: [
              { label: "Anteilig: 9 Monate in 2025", amount: 1638 },
              { label: "Ganz in 2025 abrechnen", amount: 2184 },
            ],
          },
        },
        { receipt: "strom", category: "Allgemeinstrom", amount: 486.2, previous: 512.4 },
        {
          receipt: "verwaltung",
          category: "Verwaltungskosten",
          amount: 1440,
          excluded: "nicht umlagefähig",
        },
      ],
      units: [
        { id: "WE 1", tenant: "Fischer", area: 82, prepaid: 180 },
        { id: "WE 2", tenant: "Wolf", area: 64, prepaid: 145 },
        { id: "WE 3", tenant: "Brandt", area: 91, prepaid: 200 },
        { id: "WE 4", tenant: "Kaya", area: 58, prepaid: 130 },
        { id: "WE 5", tenant: "Zimmermann", area: 75, prepaid: 160 },
      ],
    },
    {
      id: "anger",
      headline: "Rechnung doppelt eingegangen",
      object: "Am Anger 7",
      subtitle: "4 Wohnungen",
      sentTag: "Freigegeben",
      receipts: [
        { id: "garten", vendor: "Grünwerk Gartenpflege", text: "Gartenpflege 2025, inkl. neue Hecke", amount: 1940, date: "14.11.2025" },
        { id: "winter", vendor: "Hausservice Wimmer", text: "Winterdienst 2025, Rechnung 2025-118", amount: 1180, date: "03.12.2025" },
        { id: "winter-post", vendor: "Hausservice Wimmer", text: "Winterdienst 2025, Rechnung 2025-118", amount: 1180, date: "17.12.2025" },
        { id: "grundsteuer", vendor: "Stadt Freising", text: "Grundsteuerbescheid 2025", amount: 1122, date: "15.02.2025" },
        { id: "muell", vendor: "Landratsamt Freising", text: "Müllgebühren 2025", amount: 936, date: "10.03.2025" },
        { id: "kamin", vendor: "Kaminkehrer Lechner", text: "Feuerstättenschau 2025", amount: 164.5, date: "09.09.2025" },
      ],
      steps: [
        { kind: "read", label: "Liest die Belege", result: "6 Belege, zwei mit gleicher Nummer" },
        { kind: "sort", label: "Ordnet die Kostenarten zu", result: "5 umlagefähig, 1 doppelt" },
        { kind: "period", label: "Prüft Zeiträume und Inhalte", result: "Gartenrechnung mit neuer Hecke" },
        { kind: "compare", label: "Vergleicht mit dem Vorjahr", result: "Gartenpflege +48 %" },
        { kind: "write", label: "Erstellt die Aufstellung", result: "Aufstellung und Anteile bereit" },
      ],
      lines: [
        {
          receipt: "garten",
          category: "Gartenpflege",
          amount: 1940,
          previous: 1310,
          decide: {
            question:
              "Die Rechnung enthält 640 € für eine neue Hecke. Ersatz für eingegangene Pflanzen ist umlagefähig, eine Neuanlage nicht.",
            options: [
              { label: "Als Neuanlage herausrechnen", amount: 1300 },
              { label: "Als Ersatz umlegen", amount: 1940 },
            ],
          },
        },
        { receipt: "winter", category: "Winterdienst", amount: 1180, previous: 1095 },
        {
          receipt: "winter-post",
          category: "Winterdienst",
          amount: 1180,
          excluded: "doppelt: gleiche Rechnungsnummer 2025-118",
        },
        { receipt: "grundsteuer", category: "Grundsteuer", amount: 1122, previous: 1122 },
        { receipt: "muell", category: "Müllbeseitigung", amount: 936, previous: 912 },
        { receipt: "kamin", category: "Schornsteinreinigung", amount: 164.5, previous: 164.5 },
      ],
      units: [
        { id: "EG", tenant: "Peters", area: 88, prepaid: 100 },
        { id: "1. OG", tenant: "Graf", area: 76, prepaid: 95 },
        { id: "2. OG", tenant: "Arslan", area: 69, prepaid: 85 },
        { id: "DG", tenant: "Vogel", area: 81, prepaid: 105 },
      ],
    },
  ],
};
