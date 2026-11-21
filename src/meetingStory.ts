// Datenform der Versammlungs-Demo: Ein Beispiel ist der Mitschnitt einer
// Eigentümerversammlung. Der Assistent erkennt Tagesordnungspunkte,
// Beschlüsse mit Abstimmung und Aufgaben mit Fristen und schreibt daraus
// Protokoll und Einträge für die Beschlusssammlung.

export type MeetingStepKind =
  | "transcribe"
  | "agenda"
  | "votes"
  | "tasks"
  | "write";

// Ausschnitt aus dem Mitschnitt
export type MeetingSegment = {
  id: string;
  time: string;
  speaker: string;
  text: string;
};

// Unklare Stelle, die das Team klärt. Im Beschluss steht dafür "{?}" in
// text oder votes; bis zur Klärung erscheint dort pending.
export type MeetingOpen = {
  question: string;
  pending: string;
  options: { label: string; value: string }[];
};

export type MeetingResolution = {
  top: string;
  title: string;
  text: string;
  votes: string;
  result: string;
  // Stelle im Mitschnitt, an der abgestimmt wurde
  segment: string;
  open?: MeetingOpen;
};

export type MeetingTask = { text: string; owner: string; due: string };

export type MeetingCase = {
  id: string;
  headline: string;
  community: string;
  kind: string;
  date: string;
  duration: string;
  attendance: string;
  sentTag: string;
  marks: string[];
  segments: MeetingSegment[];
  steps: { kind: MeetingStepKind; label: string; result: string }[];
  resolutions: MeetingResolution[];
  tasks: MeetingTask[];
  // Nächste freie Nummer in der Beschlusssammlung
  collectionNext: number;
};

export type MeetingStoryData = {
  without: string;
  with: string;
  cases: MeetingCase[];
};
