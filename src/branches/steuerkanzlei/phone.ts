import { FolderOpen, Phone } from "lucide-react";
import type { PhoneLine, PhoneStoryData } from "../../phoneStory";
import phoneLines from "./phoneLines.json";

// Beispielanruf für die Telefon-Demo der Steuerkanzlei. Kanzlei, Mandant und
// Angaben sind erfunden. Die Gesprächszeilen stehen in phoneLines.json, damit
// später auch das Audio-Skript sie lesen kann. Noch ohne Aufnahmen: Das
// Gespräch läuft im Lesetempo.
export const rueckrufStory: PhoneStoryData = {
  business: "Steuerkanzlei Mustermann",
  caller: { title: "Anrufer", subtitle: "Mandant · Mobilnummer" },
  intro:
    "Ein Mandant ruft an. Alle Leitungen sind besetzt, Frau Berger sitzt im Mandantengespräch.",
  callTime: "Mo · 11:05",
  clock: "11:05",
  day: "Montag",
  headline: "Steuerbescheid mit Nachzahlung",
  lines: phoneLines as PhoneLine[],
  audio: [],
  notes: [
    {
      id: "urgency",
      label: "Dringlichkeit",
      value: "Frist läuft · Bescheid mit Nachzahlung",
    },
    {
      id: "issue",
      label: "Anliegen",
      value:
        "Einkommensteuerbescheid 2025: 2.140 € Nachzahlung, erwartet war eine Erstattung",
    },
    { id: "name", label: "Mandant", value: "Stefan Keller" },
    { id: "date", label: "Bescheid", value: "vom 12. November, per Post" },
    {
      id: "upload",
      label: "Unterlagen",
      value: "lädt den Bescheid heute ins Mandantenportal hoch",
    },
    {
      id: "reason",
      label: "Abweichung",
      value: "Mandant weiß nicht, was abweicht",
      open: true,
    },
    {
      id: "callback",
      label: "Rückruf",
      value: "Frau Berger · heute ab 15 Uhr · Anrufernummer",
    },
  ],
  without: "Ohne Assistent klingelt es weiter, bis er auflegt.",
  noteDone: "fertig · an Frau Berger geschickt",
  openHint: "Hier fragt Ihr Team nach.",
  phone: {
    label: "Handy von Frau Berger",
    note: "Im Mandantengespräch. Das Handy ist stumm.",
    noteDone: "Nach dem Gespräch.",
  },
  push: {
    title: "Rückruf: Steuerbescheid 2025",
    details: "Stefan Keller · 2.140 € Nachzahlung · Bescheid vom 12.11.",
    open: "Abweichung zur Erklärung noch unklar",
    actions: [
      { label: "Zurückrufen", icon: Phone },
      { label: "Akte öffnen", icon: FolderOpen },
    ],
  },
  afterwards: [
    "Die Gesprächsnotiz liegt als Rückrufaufgabe in Ihrer Kanzleisoftware, mit Mandant und Datum des Bescheids.",
    "Frau Berger ruft zurück und prüft den Bescheid. Steuerliche Auskünfte gibt der Assistent nicht.",
  ],
};
