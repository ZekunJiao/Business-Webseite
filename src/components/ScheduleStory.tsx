import { useEffect, useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  CalendarX2,
  Check,
  CheckCheck,
  ListEnd,
  Mail,
  MapPin,
  MessageSquare,
  Pause,
  PenLine,
  Play,
  RotateCcw,
  ScanText,
  Send,
  SkipForward,
  UserRoundCog,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { ColumnLabel, Marked } from "./storyParts";
import { scheduleStory } from "../scheduleStory";
import type { ScheduleCase, ScheduleStepKind } from "../scheduleStory";
import type { OverviewSet } from "../overviewFlows";
import { useMediaQuery } from "../lib/useMediaQuery";
import { useStoryPlayback } from "../lib/useStoryPlayback";

type View = "input" | "assistant" | "result";
type SlotState = "base" | "ghost" | "proposed" | "flag" | "confirmed";
type PlanItem = {
  key: string;
  time: string;
  label: string;
  state: SlotState;
  note?: string;
};

const { cases } = scheduleStory;

// Ab hier zeigt die Bühne eine Spalte mit Umschalter statt drei Spalten.
const TABBED_QUERY = "(max-width: 1100px)";
const STEP_MS = 1700;
const CHANGE_MS = 1300;
const MESSAGE_MS = 1500;

const stepIcons: Record<ScheduleStepKind, LucideIcon> = {
  read: ScanText,
  calendar: CalendarDays,
  skill: Wrench,
  route: MapPin,
  write: PenLine,
};
const views: { id: View; label: string }[] = [
  { id: "input", label: "Eingang" },
  { id: "assistant", label: "Assistent" },
  { id: "result", label: "Plan" },
];

const rowsOf = (entry: ScheduleCase) =>
  entry.changes.length + entry.messages.length;

// Termin-Demo in Leserichtung: Eingang, Assistent, Plan und Nachrichten.
export function ScheduleStory({ set }: { set: OverviewSet }) {
  const tabbed = useMediaQuery(TABBED_QUERY);
  const [manualView, setManualView] = useState<View | null>(null);
  // Fortschritt: erst die Schritte des Assistenten, dann die Änderungen im
  // Plan, dann die Nachrichten. Der letzte Schritt ("Schreibt den Vorschlag")
  // bleibt währenddessen aktiv.
  const {
    index,
    status,
    beat,
    total,
    complete,
    finished,
    sent,
    stageRef,
    play,
    primary,
    showAll,
    send,
  } = useStoryPlayback(
    cases.map((entry) => entry.id),
    (position) => cases[position].steps.length - 1 + rowsOf(cases[position]),
    (position, current) => {
      const entry = cases[position];
      const write = entry.steps.length - 1;
      return current < write
        ? STEP_MS
        : current - write < entry.changes.length
          ? CHANGE_MS
          : MESSAGE_MS;
    },
  );

  const item = cases[index];
  const writeAt = item.steps.length - 1;
  const isSent = status === "sent";
  const progress = complete ? total : beat;
  const stepsDone = complete ? item.steps.length : Math.min(progress, writeAt);
  const shownRows = Math.max(0, progress - writeAt);
  const shownChanges = item.changes.slice(0, shownRows);
  const shownMessages = item.messages.slice(
    0,
    Math.max(0, shownRows - item.changes.length),
  );
  const working = status === "playing" || status === "paused";

  // Schmale Bildschirme: die sichtbare Spalte folgt dem Ablauf.
  const autoView: View =
    complete || (working && progress >= writeAt)
      ? "result"
      : working && stepsDone > 0
        ? "assistant"
        : "input";
  useEffect(() => setManualView(null), [autoView, index]);
  const view = manualView ?? autoView;

  const PrimaryIcon =
    status === "playing" ? Pause : complete ? RotateCcw : Play;
  const primaryLabel =
    status === "idle"
      ? "Assistent starten"
      : status === "playing"
        ? "Pausieren"
        : status === "paused"
          ? "Fortsetzen"
          : "Noch einmal";
  const marked = status !== "idle";

  // Inhalt einer Zelle: bestehende Termine plus die bisher gezeigten
  // Vorschläge. Verschobene Termine bleiben bis zum Senden durchgestrichen
  // an ihrem alten Platz stehen.
  const cell = (tech: string, col: string): PlanItem[] => {
    const items: PlanItem[] = [];
    for (const slot of item.slots) {
      if (slot.tech !== tech || slot.col !== col) continue;
      const change = shownChanges.find(
        (entry) => entry.kind !== "add" && entry.slot === slot.id,
      );
      if (change?.kind === "move") {
        if (!isSent)
          items.push({ key: slot.id, ...slot, state: "ghost", note: "verlegt" });
      } else if (change?.kind === "flag") {
        items.push({
          key: slot.id,
          ...slot,
          state: isSent ? "confirmed" : "flag",
          note: isSent ? change.sent : change.flag,
        });
      } else items.push({ key: slot.id, ...slot, state: "base" });
    }
    shownChanges.forEach((change, position) => {
      if (change.kind === "flag") return;
      if (change.tech !== tech || change.col !== col) return;
      const label =
        change.kind === "add"
          ? change.label
          : (item.slots.find((slot) => slot.id === change.slot)?.label ?? "");
      items.push({
        key: `change-${position}`,
        time: change.time,
        label,
        state: isSent ? "confirmed" : "proposed",
        note: isSent
          ? item.confirmed
          : change.kind === "add"
            ? "Vorschlag"
            : "Vorschlag: hierher",
      });
    });
    return items;
  };

  const inputColumn = (
    <div className="mailbox-column" data-view="input">
      <ColumnLabel number={1}>Das kommt rein</ColumnLabel>
      <div className="mailbox-panel">
        <ul className="mailbox-list" aria-label="Eingang, Beispiele">
          {cases.map((entry, position) => {
            const active = position === index;
            const EntryIcon = entry.channel === "E-Mail" ? Mail : MessageSquare;
            const [tag, tone] = sent.has(entry.id)
              ? [entry.sentTag, "sent"]
              : finished.has(entry.id) && !(active && working)
                ? ["Vorschlag bereit", "ready"]
                : active && working
                  ? ["wird bearbeitet …", "working"]
                  : entry.urgent
                    ? ["Dringend", "urgent"]
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
                    <span className="mailbox-row-from">
                      <strong>{entry.from}</strong>
                      <span className="mailbox-channel">
                        <EntryIcon size={12} aria-hidden="true" />
                        {entry.role}
                      </span>
                    </span>
                    <span>{entry.subject}</span>
                  </span>
                  <span className="mailbox-row-meta">
                    <span className="mailbox-time">{entry.time}</span>
                    <span className="mailbox-tag" data-tone={tone}>
                      {tone === "sent" ? (
                        <CheckCheck size={12} aria-hidden="true" />
                      ) : null}
                      {tag}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <article
          className="mailbox-mail"
          key={item.id}
          data-marked={marked || undefined}
        >
          <header>
            <h4>{item.subject}</h4>
            <span>
              Von: <strong>{item.from}</strong> ({item.role}) · {item.channel} ·
              heute {item.time}
            </span>
          </header>
          {item.body.map((text) => (
            <p key={text}>
              <Marked text={text} marks={item.marks} />
            </p>
          ))}
        </article>
      </div>
      <p className="mailbox-hint">
        <span className="mailbox-hint-mark" aria-hidden="true" />
        Markiert: Was der Assistent aus der Nachricht übernimmt.
      </p>
    </div>
  );

  const assistantColumn = (
    <div className="mailbox-column" data-view="assistant">
      <ColumnLabel number={2}>Der Assistent arbeitet</ColumnLabel>
      <div className="mailbox-assistant" data-status={status}>
        <div className="mailbox-assistant-head">
          <span className="mailbox-assistant-icon" aria-hidden="true">
            <UserRoundCog size={18} />
          </span>
          <span>
            <strong>Assistent</strong>
            <span>
              {status === "idle"
                ? "wartet auf den Start"
                : complete
                  ? "fertig"
                  : status === "paused"
                    ? "pausiert"
                    : "arbeitet …"}
            </span>
          </span>
        </div>
        <ol aria-live="polite">
          {item.steps.map((step, position) => {
            const done = position < stepsDone;
            const current = working && position === stepsDone;
            const Icon = stepIcons[step.kind];
            return (
              <li
                key={step.label}
                data-kind={step.kind}
                data-state={done ? "done" : current ? "current" : "todo"}
              >
                <span className="mailbox-step-icon" aria-hidden="true">
                  <Icon size={18} />
                  {done ? (
                    <span className="mailbox-step-check">
                      <Check size={10} strokeWidth={3.5} />
                    </span>
                  ) : null}
                </span>
                <span className="mailbox-step-text">
                  <strong>{step.label}</strong>
                  {done ? (
                    <span className="mailbox-step-result">{step.result}</span>
                  ) : current ? (
                    <span className="mailbox-step-busy">
                      <i />
                      <i />
                      <i />
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );

  const resultColumn = (
    <div className="mailbox-column" data-view="result">
      <ColumnLabel number={3}>Für dein Team vorbereitet</ColumnLabel>
      <div
        className="mailbox-draft"
        data-state={isSent ? "sent" : complete ? "ready" : undefined}
        aria-label="Einsatzplan und Nachrichten"
      >
        <div className="mailbox-draft-head">
          <strong>Einsatzplan</strong>
          <span
            className="mailbox-draft-chip"
            data-tone={isSent ? "sent" : complete ? "ready" : undefined}
          >
            {isSent
              ? "Von deinem Team bestätigt"
              : complete
                ? "Wartet auf deine Entscheidung"
                : working && progress >= writeAt
                  ? "wird vorbereitet …"
                  : "Stand jetzt"}
          </span>
        </div>

        <table className="schedule-plan">
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">Monteur</span>
              </th>
              {item.columns.map((col) => (
                <th key={col} scope="col">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {item.techs.map((tech) => (
              <tr key={tech.name} data-absent={tech.absent ? true : undefined}>
                <th scope="row">
                  {tech.name}
                  <small>{tech.absent ?? tech.skills}</small>
                </th>
                {item.columns.map((col) => {
                  const items = cell(tech.name, col);
                  return (
                    <td key={col} data-col={col}>
                      {items.length ? (
                        items.map((entry) => (
                          <span
                            key={entry.key}
                            className="schedule-slot"
                            data-state={entry.state}
                          >
                            {entry.note ? <em>{entry.note}</em> : null}
                            <b>{entry.time}</b>
                            <span>{entry.label}</span>
                          </span>
                        ))
                      ) : (
                        <span className="schedule-free">frei</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="schedule-legend">
          <span data-state="proposed">Vorschlag</span>
          <span data-state="ghost">alter Platz</span>
          <span data-state="confirmed">von dir bestätigt</span>
        </p>

        {shownChanges.length ? (
          <div className="schedule-reasons">
            <strong>Warum so?</strong>
            <ul>
              {shownChanges.map((change) => (
                <li key={change.title} data-kind={change.kind}>
                  {change.kind === "flag" ? (
                    <CalendarX2 size={15} aria-hidden="true" />
                  ) : (
                    <CalendarClock size={15} aria-hidden="true" />
                  )}
                  <span>
                    <b>{change.title}</b>
                    {change.reason}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {shownMessages.map((message) => (
          <div key={message.to} className="schedule-message">
            <span className="schedule-message-to">
              <Mail size={13} aria-hidden="true" />
              Nachricht an <strong>{message.to}</strong>
            </span>
            <div className="mailbox-draft-body">
              <p>{message.salutation}</p>
              {message.paragraphs.map((paragraph) =>
                paragraph.team ? (
                  isSent ? (
                    <p key={paragraph.text} className="mailbox-draft-filled">
                      <span>Von dir ergänzt</span>
                      {paragraph.team}
                    </p>
                  ) : (
                    <p key={paragraph.text} className="mailbox-draft-open">
                      <span>Ergänzt dein Team</span>[{paragraph.text}]
                    </p>
                  )
                ) : (
                  <p key={paragraph.text}>{paragraph.text}</p>
                ),
              )}
              <p className="mailbox-draft-closing">{scheduleStory.closing}</p>
            </div>
          </div>
        ))}

        {status === "done" ? (
          <div className="mailbox-draft-actions">
            <span>Prüfen, entscheiden, absenden:</span>
            <button type="button" className="mailbox-send" onClick={send}>
              <Send size={16} aria-hidden="true" />
              Prüfen &amp; senden
            </button>
          </div>
        ) : isSent ? (
          <p className="mailbox-draft-sent" role="status">
            <CheckCheck size={18} aria-hidden="true" />
            Von deinem Team geprüft, entschieden und gesendet.
          </p>
        ) : null}
      </div>
    </div>
  );

  return (
    <section
      id={set.id}
      className="overview mailbox-story schedule-story"
      aria-labelledby={`${set.id}-title`}
    >
      <div className="overview-head">
        <span className="overview-kicker">
          {set.kicker}
        </span>
        <h3 id={`${set.id}-title`}>{set.title}</h3>
        <p>{set.intro}</p>
      </div>

      <div className="story-compare">
        <div className="story-compare-item" data-tone="without">
          <CalendarX2 size={20} aria-hidden="true" />
          <div>
            <strong>Ohne Assistent</strong>
            <p>{scheduleStory.without}</p>
          </div>
        </div>
        <div className="story-compare-item" data-tone="with">
          <CalendarClock size={20} aria-hidden="true" />
          <div>
            <strong>Mit Assistent</strong>
            <p>{scheduleStory.with}</p>
          </div>
        </div>
      </div>

      <div className="story-controls">
        <span className="story-example">
          <strong>
            Beispiel {index + 1} von {cases.length} · {item.headline}
          </strong>
          <span>Andere Nachricht im Eingang anklicken.</span>
        </span>
        <div className="story-control-buttons">
          <Button type="button" className="story-primary" onClick={primary}>
            <PrimaryIcon size={16} aria-hidden="true" />
            {primaryLabel}
          </Button>
          {complete ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => play((index + 1) % cases.length)}
            >
              <SkipForward size={16} aria-hidden="true" />
              Nächstes Beispiel
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={showAll}>
              <ListEnd size={16} aria-hidden="true" />
              Ergebnis zeigen
            </Button>
          )}
        </div>
      </div>

      <div className="story-stage mailbox-stage" ref={stageRef}>
        {tabbed ? (
          <>
            <div
              className="mailbox-views"
              role="group"
              aria-label="Ansicht wählen"
            >
              {views.map((entry, position) => (
                <button
                  key={entry.id}
                  type="button"
                  aria-pressed={view === entry.id}
                  data-active={
                    autoView === entry.id && working ? true : undefined
                  }
                  onClick={() => setManualView(entry.id)}
                >
                  <span aria-hidden="true">{position + 1}</span>
                  {entry.label}
                </button>
              ))}
            </div>
            {view === "input"
              ? inputColumn
              : view === "assistant"
                ? assistantColumn
                : resultColumn}
          </>
        ) : (
          <>
            {inputColumn}
            {assistantColumn}
            {resultColumn}
          </>
        )}
      </div>
    </section>
  );
}
