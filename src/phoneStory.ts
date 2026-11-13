// Beispielanruf für die Telefon-Demo. Betrieb, Anruferin und Angaben sind
// erfunden. Der Assistent stellt sich als digitaler Assistent vor.
// Die Gesprächszeilen stehen in phoneLines.json, damit auch das Audio-Skript
// (scripts/generate-phone-audio.mjs) sie lesen kann.

import phoneLines from "./phoneLines.json";

export type PhoneSpeaker = "assistant" | "caller";

export type PhoneNoteField = {
  id: string;
  label: string;
  value: string;
  // Fehlende oder zu klärende Angabe, orange markiert
  open?: boolean;
};

export type PhoneLine = {
  speaker: PhoneSpeaker;
  text: string;
  // Notizfelder, die nach dieser Zeile feststehen
  notes?: string[];
};

export const phoneStory = {
  business: "Haustechnik Muster",
  caller: "Sabine Krüger",
  callTime: "Di · 18:47",
  // Sperrbildschirm "Dein Handy"
  clock: "18:47",
  day: "Dienstag",
  headline: "Heizung ausgefallen",
  lines: phoneLines as PhoneLine[],
  // Vorab erzeugte Sprachaufnahmen je Zeile (npm run audio:phone)
  audio: phoneLines.map(
    (_, index) =>
      `/assets/phone/line-${String(index + 1).padStart(2, "0")}.mp3`,
  ),
  notes: [
    { id: "urgency", label: "Dringlichkeit", value: "Notfall · Bereitschaft informiert" },
    { id: "issue", label: "Anliegen", value: "Heizung aus seit heute früh, kein Warmwasser" },
    { id: "name", label: "Name", value: "Sabine Krüger" },
    { id: "address", label: "Adresse", value: "Lindenstraße 12, Freising" },
    { id: "error", label: "Fehlercode", value: "F 28" },
    {
      id: "device",
      label: "Gerät",
      value: "unbekannt · Typenschildfoto anfragen",
      open: true,
    },
    { id: "callback", label: "Rückruf", value: "Anrufernummer" },
  ] satisfies PhoneNoteField[],
  // Ohne und mit Assistent, ohne Zahlen
  without:
    "Die Mailbox springt an. Ob jemand draufspricht oder gleich den nächsten Betrieb anruft, weißt du nicht.",
  with: "Der Assistent geht ran, fragt das Wichtige ab und erkennt den Notfall. Du bekommst eine kurze Notiz aufs Handy.",
  afterwards: [
    "Die Gesprächsnotiz liegt in deiner Software, z. B. HERO, ToolTime oder Excel.",
    "Dein Team ruft zurück und entscheidet über den Einsatz. Zugesagt wird nichts ohne euch.",
  ],
};
