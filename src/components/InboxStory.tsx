import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  BookOpen,
  Check,
  ClipboardList,
  FileImage,
  ListEnd,
  LoaderCircle,
  MailOpen,
  MailWarning,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import { Button } from "./ui/button";
import { OverviewFlow } from "./OverviewFlow";
import { inboxStory } from "../inboxStory";
import type { OverviewSet } from "../overviewFlows";

type Status = "idle" | "playing" | "paused" | "done";

const { cases } = inboxStory;

const STEP_MS = 1500;
const paragraphTime = (text: string) => 700 + text.length * 18;

// Posteingang-Demo: links die Mail und was der Assistent tut, rechts
// Antwortentwurf und Eintrag für das Team.
export function InboxStory({ set }: { set: OverviewSet }) {
  const reduced = !!useReducedMotion();
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<Status>(reduced ? "done" : "idle");
  // Fortschritt: erst die Schritte des Assistenten, dann die Absätze
  const [beat, setBeat] = useState(0);
  const [finished, setFinished] = useState<Set<string>>(() => new Set());
  const [technicalOpen, setTechnicalOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const autoStarted = useRef(false);

  const item = cases[index];
  const paragraphs = item.draft.paragraphs;
  // Der letzte Schritt ("Entwurf geschrieben") bleibt aktiv, während die
  // Absätze erscheinen, und ist erst am Ende erledigt.
  const writeAt = item.steps.length - 1;
  const total = writeAt + paragraphs.length;
  const progress = status === "done" ? total : beat;
  const stepsDone =
    status === "done" ? item.steps.length : Math.min(progress, writeAt);
  const shownParagraphs = Math.max(0, progress - writeAt);

  useEffect(() => {
    if (status !== "playing") return;
    if (beat >= total) {
      setStatus("done");
      return;
    }
    const delay =
      beat < writeAt
        ? STEP_MS
        : paragraphTime(paragraphs[beat - writeAt].text);
    const timer = window.setTimeout(() => setBeat(beat + 1), delay);
    return () => window.clearTimeout(timer);
  }, [status, beat, total, writeAt, paragraphs]);

  useEffect(() => {
    if (status === "done")
      setFinished((previous) => new Set(previous).add(item.id));
  }, [status, item.id]);

  // Startet einmal von selbst, sobald die Demo im Blick ist.
  useEffect(() => {
    const stage = stageRef.current;
    if (reduced || !stage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || autoStarted.current) return;
        autoStarted.current = true;
        setStatus((current) => (current === "idle" ? "playing" : current));
      },
      { threshold: 0.35 },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, [reduced]);

  const play = (next: number) => {
    autoStarted.current = true;
    setIndex(next);
    setBeat(0);
    setStatus(reduced ? "done" : "playing");
  };
  const primary = () => {
    autoStarted.current = true;
    if (status === "idle") setStatus("playing");
    else if (status === "done") play(index);
    else setStatus(status === "playing" ? "paused" : "playing");
  };
  const showAll = () => {
    autoStarted.current = true;
    setStatus("done");
  };

  const PrimaryIcon =
    status === "playing" ? Pause : status === "done" ? RotateCcw : Play;
  const primaryLabel =
    status === "idle"
      ? "Assistent starten"
      : status === "playing"
        ? "Pausieren"
        : status === "paused"
          ? "Fortsetzen"
          : "Noch einmal";
  const working = status === "playing" || status === "paused";
  const writing = working && progress >= writeAt;
  const draftReady = status === "done";

  return (
    <section
      id={set.id}
      className="overview mailbox-story"
      aria-labelledby={`${set.id}-title`}
    >
      <div className="overview-head">
        <span className="overview-kicker">
          <span className="status-dot" />
          {set.kicker}
        </span>
        <h3 id={`${set.id}-title`}>{set.title}</h3>
        <p>{set.intro}</p>
      </div>

      <div className="story-compare">
        <div className="story-compare-item" data-tone="without">
          <MailWarning size={20} aria-hidden="true" />
          <div>
            <strong>Ohne Assistent</strong>
            <p>{inboxStory.without}</p>
          </div>
        </div>
        <div className="story-compare-item" data-tone="with">
          <MailOpen size={20} aria-hidden="true" />
          <div>
            <strong>Mit Assistent</strong>
            <p>{inboxStory.with}</p>
          </div>
        </div>
      </div>

      <div className="story-controls">
        <span className="story-example">
          <strong>
            Beispiel {index + 1} von {cases.length} · {item.headline}
          </strong>
          <span>Klicke im Posteingang auf eine andere Mail.</span>
        </span>
        <div className="story-control-buttons">
          <Button type="button" className="story-primary" onClick={primary}>
            <PrimaryIcon size={16} aria-hidden="true" />
            {primaryLabel}
          </Button>
          {status !== "done" ? (
            <Button type="button" variant="outline" onClick={showAll}>
              <ListEnd size={16} aria-hidden="true" />
              Ergebnis zeigen
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => play((index + 1) % cases.length)}
            >
              <SkipForward size={16} aria-hidden="true" />
              Nächstes Beispiel
            </Button>
          )}
        </div>
      </div>

      <div className="story-stage mailbox-stage" ref={stageRef}>
        <div className="mailbox-column">
          <span className="call-panel-label">Dein Posteingang</span>
          <div className="mailbox-panel">
            <ul className="mailbox-list" aria-label="Posteingang, Beispielmails">
              {cases.map((entry, position) => {
                const active = position === index;
                const ready =
                  finished.has(entry.id) && !(active && status !== "done");
                const [tag, tone] = ready
                  ? entry.urgent
                    ? ["Dringend · Entwurf bereit", "urgent"]
                    : ["Entwurf bereit", "ready"]
                  : active && working
                    ? ["wird bearbeitet …", "working"]
                    : ["Neu", "new"];
                return (
                  <li key={entry.id}>
                    <button
                      type="button"
                      className="mailbox-row"
                      aria-pressed={active}
                      onClick={() => (active ? undefined : play(position))}
                    >
                      <span className="mailbox-avatar" aria-hidden="true">
                        {entry.initials}
                      </span>
                      <span className="mailbox-row-text">
                        <strong>{entry.from}</strong>
                        <span>{entry.subject}</span>
                      </span>
                      <span className="mailbox-row-meta">
                        <span className="mailbox-time">{entry.time}</span>
                        <span className="mailbox-tag" data-tone={tone}>
                          {tag}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <article className="mailbox-mail" key={item.id}>
              <header>
                <h4>{item.subject}</h4>
                <span>
                  Von: <strong>{item.from}</strong>
                  {item.via ? ` über ${item.via}` : null} · heute{" "}
                  {item.time}
                </span>
              </header>
              {item.body.map((text) => (
                <p key={text}>{text}</p>
              ))}
              {item.attachment ? (
                <span className="mailbox-attachment">
                  <FileImage size={15} aria-hidden="true" />
                  {item.attachment}
                </span>
              ) : null}
            </article>
          </div>

          <div className="mailbox-assistant" data-status={status}>
            <div className="mailbox-assistant-head">
              <span className="mailbox-assistant-icon" aria-hidden="true">
                <Sparkles size={16} />
              </span>
              <strong>Assistent</strong>
              <span>
                {status === "idle"
                  ? "wartet auf den Start"
                  : status === "done"
                    ? "fertig · wartet auf dein Team"
                    : status === "paused"
                      ? "pausiert"
                      : "arbeitet …"}
              </span>
            </div>
            <ol aria-live="polite">
              {item.steps.map((step, position) => {
                const done = position < stepsDone;
                const current =
                  status === "playing" && position === stepsDone;
                return (
                  <li
                    key={step.label}
                    data-state={done ? "done" : current ? "current" : "todo"}
                  >
                    <span className="mailbox-step-mark" aria-hidden="true">
                      {done ? (
                        <Check size={13} strokeWidth={3} />
                      ) : current ? (
                        <LoaderCircle size={14} />
                      ) : (
                        position + 1
                      )}
                    </span>
                    <span>
                      <strong>{step.label}</strong>
                      {done ? <span>{step.detail}</span> : null}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <div className="mailbox-column">
          <span className="call-panel-label">Vorbereitet für dein Team</span>
          <div
            className="mailbox-draft"
            data-ready={draftReady || undefined}
            aria-label="Antwortentwurf"
          >
            <div className="mailbox-draft-head">
              <strong>Antwortentwurf</strong>
              {item.urgent && stepsDone >= 2 ? (
                <span className="mailbox-draft-chip" data-tone="urgent">
                  Dringend
                </span>
              ) : null}
              <span className="mailbox-draft-chip">
                {draftReady
                  ? "Bereit zur Prüfung · nicht gesendet"
                  : writing
                    ? "wird geschrieben …"
                    : "noch leer"}
              </span>
            </div>
            <dl className="mailbox-draft-meta">
              <div>
                <dt>An</dt>
                <dd>{item.from}</dd>
              </div>
              <div>
                <dt>Betreff</dt>
                <dd>AW: {item.subject}</dd>
              </div>
            </dl>
            {shownParagraphs === 0 ? (
              <p className="mailbox-draft-empty">
                {status === "idle"
                  ? "Der Entwurf erscheint hier, sobald der Assistent die Mail bearbeitet hat."
                  : "Der Assistent liest die Mail und sucht passende Informationen …"}
              </p>
            ) : (
              <div className="mailbox-draft-body">
                <p>{item.draft.salutation}</p>
                {paragraphs.slice(0, shownParagraphs).map((paragraph) =>
                  paragraph.open ? (
                    <p key={paragraph.text} className="mailbox-draft-open">
                      <span>Ergänzt dein Team</span>[{paragraph.text}]
                    </p>
                  ) : (
                    <p key={paragraph.text}>
                      {paragraph.text}
                      {paragraph.source ? (
                        <span className="mailbox-source">
                          <BookOpen size={12} aria-hidden="true" />
                          Quelle: {paragraph.source}
                        </span>
                      ) : null}
                    </p>
                  ),
                )}
                {draftReady ? (
                  <p className="mailbox-draft-closing">
                    {inboxStory.closing.join("\n")}
                  </p>
                ) : null}
              </div>
            )}
            <p className="mailbox-draft-foot">
              <UserRoundCheck size={16} aria-hidden="true" />
              Dein Team prüft, ergänzt Offenes und sendet selbst.
            </p>
          </div>

          <div className="story-note" aria-label="Eintrag in deiner Software">
            <div className="story-note-head">
              <ClipboardList size={18} aria-hidden="true" />
              <strong>Eintrag in deiner Software</strong>
              <span>
                {status === "done"
                  ? "vorbereitet · wartet auf Freigabe"
                  : status === "idle"
                    ? "wird bei der Bearbeitung ausgefüllt"
                    : "wird ausgefüllt …"}
              </span>
            </div>
            <dl>
              {item.fields.map((field) => {
                const visible = field.step < stepsDone;
                return (
                  <div
                    key={field.label}
                    data-visible={visible || undefined}
                    data-open={(visible && field.open) || undefined}
                    data-urgent={(visible && field.urgent) || undefined}
                  >
                    <dt>{field.label}</dt>
                    <dd>{visible ? field.value : "…"}</dd>
                  </div>
                );
              })}
            </dl>
            <p className="story-note-legend">
              <span aria-hidden="true" /> Orange = noch offen. Hier ergänzt
              oder fragt dein Team nach.
            </p>
          </div>
        </div>
      </div>

      <div className="story-after">
        <strong>Und danach?</strong>
        <ul>
          <li>
            <ClipboardList size={18} aria-hidden="true" />
            {inboxStory.afterwards[0]}
          </li>
          <li>
            <UserRoundCheck size={18} aria-hidden="true" />
            {inboxStory.afterwards[1]}
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
