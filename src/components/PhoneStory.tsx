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
  Sparkles,
  UserRound,
  UserRoundCheck,
  Volume2,
  VolumeX,
} from "lucide-react";
import { OverviewFlow } from "./OverviewFlow";
import { phoneStory } from "../phoneStory";
import type { PhoneSpeaker } from "../phoneStory";
import type { OverviewSet } from "../overviewFlows";
import { useMediaQuery } from "../lib/useMediaQuery";

type Status = "idle" | "playing" | "paused" | "done";

const { lines, notes } = phoneStory;

const speakerName: Record<PhoneSpeaker, string> = {
  assistant: "Assistent",
  caller: "Anruferin",
};

// Ab hier stehen Telefonat und Handy untereinander (siehe index.css).
const STACKED_QUERY = "(max-width: 900px)";
// Startet eine Aufnahme nicht in dieser Zeit, läuft die Demo ohne Ton weiter.
const AUDIO_START_TIMEOUT_MS = 6000;
const LINE_GAP_MS = 350;

const readingTime = (text: string) => 1100 + text.length * 38;
const clock = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

// Länge der Aufnahmen aus den Metadaten; fehlt eine, gilt die Lesezeit.
function useLineDurations() {
  const [durations, setDurations] = useState<(number | null)[]>(() =>
    lines.map(() => null),
  );
  useEffect(() => {
    const players = phoneStory.audio.map((src, index) => {
      const audio = new Audio();
      audio.preload = "metadata";
      audio.onloadedmetadata = () =>
        setDurations((prev) =>
          prev.map((value, i) => (i === index ? audio.duration : value)),
        );
      audio.src = src;
      return audio;
    });
    return () => players.forEach((audio) => audio.removeAttribute("src"));
  }, []);
  return durations;
}

export function PhoneStory({ set }: { set: OverviewSet }) {
  const reduced = !!useReducedMotion();
  const stacked = useMediaQuery(STACKED_QUERY);
  const [status, setStatus] = useState<Status>("idle");
  // Anzahl der bereits gesprochenen bzw. sichtbaren Zeilen
  const [shown, setShown] = useState(0);
  const [sound, setSound] = useState(true);
  const [audioFailed, setAudioFailed] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [technicalOpen, setTechnicalOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const myPhoneRef = useRef<HTMLDivElement>(null);
  const durations = useLineDurations();
  const totalSeconds = () =>
    Math.round(
      lines.reduce(
        (sum, line, index) =>
          sum +
          (durations[index] ?? readingTime(line.text) / 1000) +
          LINE_GAP_MS / 1000,
        0,
      ),
    );

  // Spielt die aktuelle Zeile ab (Aufnahme oder Lesezeit) und geht danach
  // zur nächsten. Pause hält die Aufnahme an derselben Stelle an.
  useEffect(() => {
    if (status !== "playing" || shown === 0) return;
    const index = shown - 1;
    const timers: number[] = [];
    let finished = false;
    const next = () => {
      if (finished) return;
      finished = true;
      timers.push(
        window.setTimeout(() => {
          if (shown >= lines.length) setStatus("done");
          else setShown(shown + 1);
        }, LINE_GAP_MS),
      );
    };
    const audio = audioRef.current;
    if (!sound || audioFailed || !audio) {
      timers.push(window.setTimeout(next, readingTime(lines[index].text)));
      return () => timers.forEach((timer) => window.clearTimeout(timer));
    }
    const fail = () => {
      if (!finished) setAudioFailed(true);
    };
    const source = new URL(phoneStory.audio[index], window.location.href)
      .href;
    if (audio.src !== source) audio.src = source;
    audio.onended = next;
    audio.onerror = fail;
    const started = () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.length = 0;
    };
    audio.addEventListener("playing", started, { once: true });
    timers.push(window.setTimeout(fail, AUDIO_START_TIMEOUT_MS));
    audio.play().catch(fail);
    return () => {
      finished = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      audio.removeEventListener("playing", started);
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
    };
  }, [status, shown, sound, audioFailed]);

  // Gesprächsdauer
  useEffect(() => {
    if (status !== "playing") return;
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  // Untereinander: nach dem Gespräch zum eigenen Handy scrollen.
  useEffect(() => {
    if (status !== "done" || !stacked || shown === 0) return;
    myPhoneRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  }, [status, stacked, reduced, shown]);

  const start = () => {
    const audio = audioRef.current;
    if (audio) audio.removeAttribute("src");
    setAudioFailed(false);
    setSeconds(0);
    setShown(1);
    setStatus("playing");
  };
  const showAll = () => {
    audioRef.current?.pause();
    setShown(lines.length);
    setSeconds((s) => Math.max(s, totalSeconds()));
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
  const revealedNotes = notes.filter((note) => revealed.has(note.id));
  const noteLabel = (id: string) =>
    notes.find((note) => note.id === id)?.label ?? id;
  const noteValue = (id: string) =>
    notes.find((note) => note.id === id)?.value ?? "";
  const current = shown > 0 ? lines[shown - 1] : null;
  const speaking = status === "playing" ? current?.speaker : undefined;
  const earlier = lines.slice(0, Math.max(0, shown - 1)).reverse();
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
  const callState =
    status === "idle"
      ? "Klingelt …"
      : status === "done"
        ? "Beendet"
        : status === "paused"
          ? "Pausiert"
          : "Verbunden";

  return (
    <section
      id={set.id}
      className="overview phone-story"
      aria-labelledby={`${set.id}-title`}
    >
      <div className="phone-story-head">
        <span className="overview-kicker">
          <span className="status-dot" />
          {set.kicker}
        </span>
        <h3 id={`${set.id}-title`}>{set.title}</h3>
      </div>
      <audio ref={audioRef} preload="none" />

      <div className="story-stage phone-stage">
        <div className="phone-main">
          <div className="call-panel" data-status={status}>
            <div className="call-panel-head">
              <span className="call-panel-label">Das Telefonat</span>
              <span className="call-state" data-status={status}>
                <span className="call-state-dot" aria-hidden="true" />
                {callState}
              </span>
              <span className="call-timer" aria-hidden="true">
                {status === "idle" ? phoneStory.callTime : clock(seconds)}
              </span>
              {status !== "idle" ? (
                <div className="call-controls">
                  <button
                    type="button"
                    className="call-control"
                    onClick={primary}
                    aria-label={primaryLabel}
                    title={primaryLabel}
                  >
                    <PrimaryIcon size={16} aria-hidden="true" />
                    <span>{primaryLabel}</span>
                  </button>
                  <button
                    type="button"
                    className="call-control"
                    aria-pressed={sound}
                    onClick={() => setSound((value) => !value)}
                    aria-label={sound ? "Ton ausschalten" : "Ton einschalten"}
                    title={sound ? "Ton ausschalten" : "Ton einschalten"}
                  >
                    {sound ? (
                      <Volume2 size={16} aria-hidden="true" />
                    ) : (
                      <VolumeX size={16} aria-hidden="true" />
                    )}
                  </button>
                  {status !== "done" ? (
                    <button
                      type="button"
                      className="call-control"
                      onClick={showAll}
                    >
                      <ListEnd size={16} aria-hidden="true" />
                      <span>Zum Ergebnis</span>
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            {sound && audioFailed && status !== "idle" ? (
              <p className="phone-audio-notice" role="status">
                <VolumeX size={15} aria-hidden="true" />
                Ton konnte nicht abgespielt werden. Die Mitschrift läuft ohne Ton.
              </p>
            ) : null}

            <div className="call-people">
              <Participant
                speaker="caller"
                title="Anruferin"
                subtitle="Kundin · Mobilnummer"
                speaking={speaking === "caller"}
                ringing={status === "idle"}
              />
              <span className="call-line" aria-hidden="true" />
              <Participant
                speaker="assistant"
                title="Digitaler Assistent"
                subtitle={phoneStory.business}
                speaking={speaking === "assistant"}
                ringing={false}
              />
            </div>

            {status === "idle" ? (
              <div className="call-start">
                <p>
                  Eine Kundin ruft an. Du bist auf der Baustelle und kannst nicht
                  rangehen.
                </p>
                <button type="button" className="phone-accept" onClick={start}>
                  <PhoneCall size={18} aria-hidden="true" />
                  Assistent geht ran
                </button>
                <span className="call-start-without">
                  <PhoneMissed size={14} aria-hidden="true" />
                  {phoneStory.without}
                </span>
              </div>
            ) : (
              <div className="call-subtitles">
                <span className="call-subtitles-label">Live-Mitschrift</span>
                {current ? (
                  <div
                    className="call-current"
                    data-speaker={current.speaker}
                    key={shown}
                    aria-live="polite"
                  >
                    <strong>{speakerName[current.speaker]}</strong>
                    <p>{current.text}</p>
                    {current.notes?.length ? (
                      <span className="call-noted">
                        notiert: {current.notes.map(noteLabel).join(", ")}
                      </span>
                    ) : null}
                  </div>
                ) : null}
                {earlier.length ? (
                  <ol className="call-earlier" aria-label="Bisher gesagt">
                    {earlier.slice(0, 3).map((line) => (
                      <li key={line.text} data-speaker={line.speaker}>
                        <strong>{speakerName[line.speaker]}:</strong> {line.text}
                      </li>
                    ))}
                  </ol>
                ) : null}
                {status === "done" ? (
                  <details className="call-transcript">
                    <summary>Ganze Mitschrift</summary>
                    <ol>
                      {lines.map((line) => (
                        <li key={line.text} data-speaker={line.speaker}>
                          <strong>{speakerName[line.speaker]}:</strong>{" "}
                          {line.text}
                        </li>
                      ))}
                    </ol>
                  </details>
                ) : null}
              </div>
            )}
          </div>
          <p className="phone-example">
            Beispiel · {phoneStory.headline} · Stimmen KI-generiert
          </p>

          <div className="story-note phone-note" aria-label="Gesprächsnotiz">
            <div className="story-note-head">
              <ClipboardList size={18} aria-hidden="true" />
              <strong>Gesprächsnotiz</strong>
              <span>
                {status === "idle"
                  ? "Wird während des Anrufs ausgefüllt."
                  : status === "done"
                    ? "fertig · an die Bereitschaft geschickt"
                    : "wird mitgeschrieben …"}
              </span>
            </div>
            {revealedNotes.length ? (
              <dl>
                {revealedNotes.map((note) => (
                  <div
                    key={note.id}
                    data-visible
                    data-open={note.open || undefined}
                    data-urgent={note.id === "urgency" || undefined}
                  >
                    <dt>{note.label}</dt>
                    <dd>{note.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {revealedNotes.some((note) => note.open) ? (
              <p className="story-note-legend">
                <span aria-hidden="true" /> Orange = noch offen. Hier fragt
                dein Team nach.
              </p>
            ) : null}
          </div>
        </div>

        <div className="my-phone-column" ref={myPhoneRef}>
          <span className="call-panel-label">Dein Handy</span>
          <div className="phone-device">
            <div className="phone-screen">
              <div className="lock-screen">
                <span className="lock-day">{phoneStory.day}</span>
                <span className="lock-clock">{phoneStory.clock}</span>
                <span className="lock-note">
                  {status === "done"
                    ? "Du bist auf der Baustelle."
                    : "Du bist auf der Baustelle. Das Handy bleibt in der Tasche."}
                </span>
              </div>
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
            </div>
          </div>
        </div>
      </div>

      <div className="story-after">
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
        className="story-technical"
        onToggle={(event) => setTechnicalOpen(event.currentTarget.open)}
      >
        <summary>So hängt es technisch zusammen</summary>
        {/* Erst beim Aufklappen rendern, damit die Linien richtig messen. */}
        {technicalOpen ? <OverviewFlow set={set} embedded /> : null}
      </details>
    </section>
  );
}

function Participant({
  speaker,
  title,
  subtitle,
  speaking,
  ringing,
}: {
  speaker: PhoneSpeaker;
  title: string;
  subtitle: string;
  speaking: boolean;
  ringing: boolean;
}) {
  const Icon = speaker === "assistant" ? Sparkles : UserRound;
  return (
    <div
      className="call-person"
      data-speaker={speaker}
      data-speaking={speaking || undefined}
      data-ringing={ringing || undefined}
    >
      <span className="call-avatar">
        <Icon size={26} aria-hidden="true" />
      </span>
      <strong>{title}</strong>
      <span>{subtitle}</span>
      <span className="call-wave" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}
