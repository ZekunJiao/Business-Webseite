// Beispielanruf für die Telefon-Demo. Betrieb, Anruferin und Angaben sind
// erfunden. Der Assistent stellt sich als digitaler Assistent vor.

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
  headline: "Heizung ausgefallen",
  lines: [
    {
      speaker: "assistant",
      text: "Guten Abend, hier ist der digitale Assistent von Haustechnik Muster. Das Team ist gerade nicht erreichbar. Worum geht es?",
    },
    {
      speaker: "caller",
      text: "Hallo, unsere Heizung ist seit heute früh komplett aus. Warmes Wasser haben wir auch keins.",
      notes: ["issue"],
    },
    {
      speaker: "assistant",
      text: "Das klingt dringend. Darf ich Ihren Namen und Ihre Adresse aufnehmen?",
      notes: ["urgency"],
    },
    {
      speaker: "caller",
      text: "Sabine Krüger, Lindenstraße 12 in Freising.",
      notes: ["name", "address"],
    },
    {
      speaker: "assistant",
      text: "Danke. Zeigt die Heizung eine Fehlermeldung an?",
    },
    {
      speaker: "caller",
      text: "Da steht F 28. Welches Gerät das genau ist, weiß ich leider nicht.",
      notes: ["error", "device"],
    },
    {
      speaker: "assistant",
      text: "Kein Problem. Ich gebe Ihre Angaben sofort an den Bereitschaftsdienst weiter. Er meldet sich unter der Nummer, von der Sie anrufen.",
      notes: ["callback"],
    },
    {
      speaker: "caller",
      text: "Super, vielen Dank!",
    },
  ] satisfies PhoneLine[],
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
