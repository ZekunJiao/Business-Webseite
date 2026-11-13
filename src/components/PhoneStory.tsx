import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  Bell,
  Camera,
  ClipboardList,
  ListEnd,
  Pause,
  Phone,
  PhoneCall,
  PhoneMissed,
  Play,
  RotateCcw,
  Siren,
  UserRoundCheck,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "./ui/button";
import { OverviewFlow } from "./OverviewFlow";
import { phoneStory } from "../phoneStory";
import type { PhoneSpeaker } from "../phoneStory";
import type { OverviewSet } from "../overviewFlows";

type Status = "idle" | "playing" | "paused" | "done";

const { lines, notes } = phoneStory;

const speechSupported =
  typeof window !== "undefined" && "speechSynthesis" in window;

// Deutsche Stimmen, natürlich klingende zuerst (z. B. "Online (Natural)" in
// Edge, Google-Stimmen in Chrome).
function germanVoices(): SpeechSynthesisVoice[] {
  if (!speechSupported) return [];
  const rank = (voice: SpeechSynthesisVoice) =>
    /natural/i.test(voice.name) ? 0 : /google/i.test(voice.name) ? 1 : 2;
  return window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang.toLowerCase().startsWith("de"))
    .sort((a, b) => rank(a) - rank(b));
}

function useGermanVoices() {
  const [voices, setVoices] = useState(germanVoices);
  useEffect(() => {
    if (!speechSupported) return;
    const update = () => setVoices(germanVoices());
    window.speechSynthesis.addEventListener("voiceschanged", update);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", update);
  }, []);
  return voices;
}

export function PhoneStory({ set }: { set: OverviewSet }) {
  const reduced = !!useReducedMotion();
  const voices = useGermanVoices();
  // Neue Stimmen sollen eine laufende Zeile nicht neu starten.
  const voicesRef = useRef(voices);
  voicesRef.current = voices;
  const [status, setStatus] = useState<Status>("idle");
  // Anzahl der bereits sichtbaren Gesprächszeilen
  const [shown, setShown] = useState(0);
  const [sound, setSound] = useState(speechSupported);
  const [technicalOpen, setTechnicalOpen] = useState(false);
  const chatRef = useRef<HTMLOListElement>(null);

  // Spielt die aktuelle Zeile ab (Sprache oder Lesezeit) und blendet danach
  // die nächste ein.
  useEffect(() => {
    if (status !== "playing" || shown === 0) return;
    const line = lines[shown - 1];
    let finished = false;
    const timers: number[] = [];
    const next = () => {
      if (finished) return;
      finished = true;
      if (shown >= lines.length) setStatus("done");
      else setShown(shown + 1);
    };
    const synth = speechSupported ? window.speechSynthesis : null;
    if (sound && synth) {
      const voices = voicesRef.current;
      const utterance = new SpeechSynthesisUtterance(line.text);
      const voice = voiceFor(line.speaker, voices);
      utterance.lang = voice?.lang ?? "de-DE";
      if (voice) utterance.voice = voice;
      utterance.rate = 1.05;
      // Gibt es nur eine Stimme, klingt die Anruferin etwas höher.
      utterance.pitch =
        line.speaker === "caller" && voices.length < 2 ? 1.25 : 1;
      const done = () => timers.push(window.setTimeout(next, 450));
      utterance.onend = done;
      utterance.onerror = done;
      synth.cancel();
      synth.speak(utterance);
      // Falls der Browser das Ende nicht meldet
      timers.push(window.setTimeout(next, line.text.length * 110 + 4000));
    } else {
      timers.push(window.setTimeout(next, 1100 + line.text.length * 38));
    }
    return () => {
      finished = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      synth?.cancel();
    };
  }, [status, shown, sound]);

  useEffect(() => {
    const chat = chatRef.current;
    if (chat) chat.scrollTop = chat.scrollHeight;
  }, [shown, status]);

  const start = () => {
    setShown(1);
    setStatus("playing");
  };
  const showAll = () => {
    setShown(lines.length);
    setStatus("done");
  };
  const primary = () => {
    if (status === "idle" || status === "done") start();
    else setStatus(status === "playing" ? "paused" : "playing");
  };

  const revealed = new Set(
    status === "done"
      ? notes.map((note) => note.id)
      : lines.slice(0, shown).flatMap((line) => line.notes ?? []),
  );
  const noteLabel = (id: string) =>
    notes.find((note) => note.id === id)?.label ?? id;
  const noteValue = (id: string) =>
    notes.find((note) => note.id === id)?.value ?? "";
  const PrimaryIcon =
    status === "playing" ? Pause : status === "done" ? RotateCcw : Play;
  const primaryLabel =
    status === "idle"
      ? "Gespräch anhören"
      : status === "playing"
        ? "Pausieren"
        : status === "paused"
          ? "Fortsetzen"
          : "Noch einmal";

  return (
    <section
      id={set.id}
      className="overview phone-story"
      aria-labelledby={`${set.id}-title`}
      data-reduced={reduced || undefined}
    >
      <div className="overview-head">
        <span className="overview-kicker">
          <span className="status-dot" />
          {set.kicker}
        </span>
        <h3 id={`${set.id}-title`}>{set.title}</h3>
        <p>{set.intro}</p>
      </div>

      <div className="phone-compare">
        <div className="phone-compare-item" data-tone="without">
          <PhoneMissed size={20} aria-hidden="true" />
          <div>
            <strong>Ohne Assistent</strong>
            <p>{phoneStory.without}</p>
          </div>
        </div>
        <div className="phone-compare-item" data-tone="with">
          <PhoneCall size={20} aria-hidden="true" />
          <div>
            <strong>Mit Assistent</strong>
            <p>{phoneStory.with}</p>
          </div>
        </div>
      </div>

      <div className="phone-controls">
        <strong className="phone-example">
          Beispiel 1 von 1 · {phoneStory.headline}
        </strong>
        <div className="phone-control-buttons">
          <Button type="button" onClick={primary}>
            <PrimaryIcon size={16} aria-hidden="true" />
            {primaryLabel}
          </Button>
          {speechSupported ? (
            <Button
              type="button"
              variant="outline"
              aria-pressed={sound}
              onClick={() => setSound((value) => !value)}
            >
              {sound ? (
                <Volume2 size={16} aria-hidden="true" />
              ) : (
                <VolumeX size={16} aria-hidden="true" />
              )}
              {sound ? "Ton an" : "Ton aus"}
            </Button>
          ) : null}
          {status !== "done" ? (
            <Button type="button" variant="outline" onClick={showAll}>
              <ListEnd size={16} aria-hidden="true" />
              Ganzes Gespräch zeigen
            </Button>
          ) : null}
        </div>
      </div>

      <div className="phone-stage">
        <div className="phone-device">
          <div className="phone-screen" data-status={status}>
            {status === "idle" ? (
              <div className="phone-incoming">
                <span className="phone-incoming-time">
                  {phoneStory.callTime}
                </span>
                <span className="phone-ring" aria-hidden="true">
                  <Phone size={30} />
                </span>
                <strong>Eingehender Anruf</strong>
                <span>für {phoneStory.business}</span>
                <span className="phone-incoming-note">
                  Du bist auf der Baustelle und kannst nicht rangehen.
                </span>
                <button
                  type="button"
                  className="phone-accept"
                  onClick={start}
                >
                  <PhoneCall size={18} aria-hidden="true" />
                  Assistent geht ran
                </button>
              </div>
            ) : (
              <>
                <div className="phone-call-head">
                  <span
                    className="phone-live"
                    data-ended={status === "done" || undefined}
                  />
                  <div>
                    <strong>
                      {status === "done" ? "Gespräch beendet" : "Im Gespräch"}
                    </strong>
                    <span>Digitaler Assistent · {phoneStory.business}</span>
                  </div>
                </div>
                <ol
                  ref={chatRef}
                  className="phone-chat"
                  aria-label="Gesprächsverlauf"
                >
                  {lines.slice(0, shown).map((line, index) => (
                    <li key={index} data-speaker={line.speaker}>
                      <span className="phone-speaker">
                        {line.speaker === "assistant"
                          ? "Assistent"
                          : "Anruferin"}
                      </span>
                      <p>{line.text}</p>
                      {line.notes?.length ? (
                        <span className="phone-noted">
                          notiert: {line.notes.map(noteLabel).join(", ")}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ol>
                {status === "done" ? (
                  <div className="phone-push" role="status">
                    <span className="phone-push-app">
                      <Bell size={13} aria-hidden="true" />
                      Telefonassistent · jetzt
                    </span>
                    <strong>
                      <Siren size={15} aria-hidden="true" />
                      Notfall: {phoneStory.headline}
                    </strong>
                    <span>
                      {noteValue("name")} · {noteValue("address")} · Fehler{" "}
                      {noteValue("error")}
                    </span>
                    <span className="phone-push-open">
                      Gerät {noteValue("device")}
                    </span>
                    <span className="phone-push-actions" aria-hidden="true">
                      <span>
                        <Phone size={13} /> Zurückrufen
                      </span>
                      <span>
                        <Camera size={13} /> Foto anfragen
                      </span>
                    </span>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        <div className="phone-note" aria-label="Gesprächsnotiz">
          <div className="phone-note-head">
            <ClipboardList size={18} aria-hidden="true" />
            <strong>Gesprächsnotiz</strong>
            <span>
              {status === "idle"
                ? "wird beim Gespräch mitgeschrieben"
                : status === "done"
                  ? "fertig · an die Bereitschaft geschickt"
                  : "wird mitgeschrieben …"}
            </span>
          </div>
          <dl>
            {notes.map((note) => {
              const visible = revealed.has(note.id);
              return (
                <div
                  key={note.id}
                  data-visible={visible || undefined}
                  data-open={(visible && note.open) || undefined}
                  data-urgent={(visible && note.id === "urgency") || undefined}
                >
                  <dt>{note.label}</dt>
                  <dd>{visible ? note.value : "…"}</dd>
                </div>
              );
            })}
          </dl>
          <p className="phone-note-legend">
            <span aria-hidden="true" /> Orange = noch offen. Hier fragt dein
            Team nach.
          </p>
        </div>
      </div>

      <div className="phone-after">
        <strong>Und danach?</strong>
        <ul>
          <li>
            <ClipboardList size={18} aria-hidden="true" />
            {phoneStory.afterwards[0]}
          </li>
          <li>
            <UserRoundCheck size={18} aria-hidden="true" />
            {phoneStory.afterwards[1]}
          </li>
        </ul>
      </div>

      <details
        className="phone-technical"
        onToggle={(event) => setTechnicalOpen(event.currentTarget.open)}
      >
        <summary>So hängt es technisch zusammen</summary>
        {/* Erst beim Aufklappen rendern, damit die Linien richtig messen. */}
        {technicalOpen ? <OverviewFlow set={set} embedded /> : null}
      </details>
    </section>
  );
}

function voiceFor(
  speaker: PhoneSpeaker,
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  if (speaker === "assistant") return voices[0];
  return voices[1] ?? voices[0];
}
