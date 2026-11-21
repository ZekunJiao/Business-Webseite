import { Phone, Wrench } from "lucide-react";
import type { PhoneLine, PhoneStoryData } from "../../phoneStory";
import phoneLines from "./phoneLines.json";

// Beispielanruf für die Telefon-Demo der Hausverwaltung. Verwaltung,
// Anrufer, Objekt und Angaben sind erfunden. Die Gesprächszeilen stehen in
// phoneLines.json, damit auch das Audio-Skript sie lesen kann.
export const notfallStory: PhoneStoryData = {
  business: "Hausverwaltung Mustermann",
  caller: { title: "Anrufer", subtitle: "Mieter · Mobilnummer" },
  intro:
    "Ein Mieter ruft an. Es ist Sonntagabend, im Büro ist niemand mehr.",
  callTime: "So · 21:40",
  clock: "21:40",
  day: "Sonntag",
  headline: "Wasser tropft durch die Decke",
  lines: phoneLines as PhoneLine[],
  // Vorab erzeugte Sprachaufnahmen je Zeile
  // (npm run audio:phone -- --story=hausverwaltung)
  audio: phoneLines.map(
    (_, index) =>
      `/assets/phone/hausverwaltung/line-${String(index + 1).padStart(2, "0")}.mp3`,
  ),
  notes: [
    { id: "urgency", label: "Dringlichkeit", value: "Notfall · Wasserschaden" },
    {
      id: "issue",
      label: "Anliegen",
      value: "Wasser tropft von der Decke im Bad, läuft die Wand herunter",
    },
    { id: "name", label: "Mieter", value: "Jonas Becker" },
    {
      id: "unit",
      label: "Wohnung",
      value: "Isarstraße 8, Freising · 2. OG, WE 2.3",
    },
    {
      id: "advice",
      label: "Hinweis gegeben",
      value: "Sicherung fürs Bad aus, Handtücher auslegen",
    },
    {
      id: "above",
      label: "Wohnung darüber",
      value: "WE 3.3 · niemand öffnet",
      open: true,
    },
    {
      id: "callback",
      label: "Rückruf",
      value: "Bereitschaft informiert · ruft unter der Anrufernummer zurück",
    },
  ],
  without: "Ohne Assistent hört er jetzt nur die Ansage mit den Sprechzeiten.",
  noteDone: "fertig · an die Bereitschaft geschickt",
  openHint: "Hier fragt Ihr Team nach.",
  phone: {
    label: "Ihr Bereitschaftshandy",
    note: "Sonntag. Das Büro ist nicht besetzt.",
    noteDone: "Sonntag.",
  },
  push: {
    title: "Notfall: Wasserschaden",
    details: "Jonas Becker · Isarstraße 8, WE 2.3 · Wasser aus der Decke im Bad",
    open: "WE 3.3 darüber nicht erreichbar",
    actions: [
      { label: "Zurückrufen", icon: Phone },
      { label: "Notdienst", icon: Wrench },
    ],
  },
  afterwards: [
    "Die Gesprächsnotiz liegt als Vorgang in Ihrer Verwaltungssoftware, mit Objekt und Wohnung.",
    "Ihre Bereitschaft ruft zurück und entscheidet über den Notdienst. Beauftragt wird nichts ohne Sie.",
  ],
};
