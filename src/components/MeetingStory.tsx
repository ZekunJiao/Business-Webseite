import { useEffect, useRef, useState } from "react";
import {
  AudioLines,
  BookMarked,
  CheckCheck,
  ClipboardCheck,
  ListOrdered,
  ListTodo,
  Mic,
  NotebookPen,
  PenLine,
  Play,
  Send,
  Vote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { Button } from "./ui/button";
import { ColumnLabel, Marked } from "./storyParts";
import {
  AssistantColumn,
  StoryButtons,
  StoryFrame,
  StoryStage,
  useStoryView,
} from "./storyFrame";
import type { StoryView } from "./storyFrame";
import type {
  MeetingResolution,
  MeetingStepKind,
  MeetingStoryData,
} from "../meetingStory";
import type { OverviewSet } from "../overviewFlows";
import { useStoryPlayback } from "../lib/useStoryPlayback";

const STEP_MS = 1700;
const ITEM_MS = 1300;

const stepIcons: Record<MeetingStepKind, LucideIcon> = {
  transcribe: AudioLines,
  agenda: ListOrdered,
  votes: Vote,
  tasks: ListTodo,
  write: PenLine,
};

// Feste Balkenhöhen für das Bild des Mitschnitts (rein dekorativ)
const waveBars = [
  6, 11, 15, 8, 13, 18, 10, 6, 12, 16, 9, 5, 11, 17, 13, 7, 15, 19, 9, 6, 12,
  14, 8, 5, 13, 16, 10, 6,
];

// Versammlungs-Demo in Leserichtung: Mitschnitt, Assistent, Protokoll mit
// Beschlüssen, Aufgaben und Einträgen für die Beschlusssammlung.
export function MeetingStory({
  set,
  story,
}: {
  set: OverviewSet;
  story: MeetingStoryData;
}) {
  const { cases } = story;
  const reduced = !!useReducedMotion();
  // Takte: Schritte bis "Schreibt …", je Beschluss einer, dann Aufgaben
  // und Beschlusssammlung.
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
    (position) =>
      cases[position].steps.length - 1 + cases[position].resolutions.length + 2,
    (position, current) =>
      current < cases[position].steps.length - 1 ? STEP_MS : ITEM_MS,
  );

  // Klärung des Teams und verknüpfte Stelle im Mitschnitt; gelten für das
  // aktuelle Beispiel und werden bei jedem Neustart verworfen.
  const [reviewing, setReviewing] = useState(false);
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [linked, setLinked] = useState<string | null>(null);
  const draftRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLOListElement>(null);
  const reset = () => {
    setReviewing(false);
    setChoices({});
    setLinked(null);
  };
  const playCase = (next: number) => {
    reset();
    play(next);
  };
  const onPrimary = () => {
    if (complete) reset();
    primary();
  };
  useEffect(() => {
    if (!reviewing) return;
    draftRef.current
      ?.querySelector<HTMLElement>("[data-review-field]:checked")
      ?.focus();
  }, [reviewing]);

  const item = cases[index];
  const writeAt = item.steps.length - 1;
  const isSent = status === "sent";
  const working = status === "playing" || status === "paused";
  const progress = complete ? total : beat;
  const stepsDone = complete ? item.steps.length : Math.min(progress, writeAt);
  const shown = Math.max(0, progress - writeAt);
  const shownResolutions = item.resolutions.slice(0, shown);
  const tasksShown = shown > item.resolutions.length;
  const collectionShown = shown > item.resolutions.length + 1;

  // Während der Assistent schreibt, leuchtet die Stelle des neuesten
  // Beschlusses im Mitschnitt; danach die, die jemand anklickt.
  const activeSegment =
    linked ??
    (working && shownResolutions.length
      ? shownResolutions[shownResolutions.length - 1].segment
      : null);

  const autoView: StoryView =
    complete || (working && progress >= writeAt)
      ? "result"
      : working && stepsDone > 0
        ? "assistant"
        : "input";
  const { tabbed, view, setView } = useStoryView(autoView, index);

  // Sprung zur Stelle im Mitschnitt; auf schmalen Bildschirmen zuerst zur
  // Spalte "Mitschnitt".
  const showSegment = (segment: string) => {
    setLinked(segment);
    if (tabbed) setView("input");
  };
  useEffect(() => {
    if (!linked) return;
    const target = transcriptRef.current?.querySelector<HTMLElement>(
      `[data-segment="${linked}"]`,
    );
    target?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "nearest",
    });
    target?.focus({ preventScroll: true });
  }, [linked, view, reduced]);

  const decided = reviewing || isSent;
  const choiceOf = (resolution: MeetingResolution) =>
    decided ? (choices[resolution.top] ?? 0) : 0;
  const openResolutions = item.resolutions.filter((entry) => entry.open);
  const sentSummary = openResolutions
    .map((entry) => entry.open!.options[choiceOf(entry)].label)
    .join(", ");

  // Setzt die geklärte oder noch offene Angabe an die Stelle von "{?}".
  const fill = (text: string, resolution: MeetingResolution) => {
    const parts = text.split("{?}");
    if (parts.length === 1 || !resolution.open) return text;
    const value = decided
      ? resolution.open.options[choiceOf(resolution)].value
      : `[${resolution.open.pending}]`;
    return (
      <>
        {parts[0]}
        <span
          className="meeting-fill"
          data-state={isSent ? "settled" : reviewing ? "review" : "open"}
        >
          {value}
        </span>
        {parts[1]}
      </>
    );
  };

  const inputColumn = (
    <div className="mailbox-column" data-view="input">
      <ColumnLabel number={1}>Das kommt rein</ColumnLabel>
      <div className="mailbox-panel">
        <ul className="mailbox-list" aria-label="Versammlungen, Beispiele">
          {cases.map((entry, position) => {
            const active = position === index;
            const [tag, tone] = sent.has(entry.id)
              ? [entry.sentTag, "sent"]
              : finished.has(entry.id) && !(active && working)
                ? ["Entwurf bereit", "ready"]
                : active && working
                  ? ["wird bearbeitet …", "working"]
                  : ["Neu", "new"];
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  className="mailbox-row"
                  aria-pressed={active}
                  onClick={() => (active ? undefined : playCase(position))}
                >
                  <span
                    className="mailbox-avatar quote-row-icon"
                    aria-hidden="true"
                  >
                    <Mic size={15} />
                  </span>
                  <span className="mailbox-row-text">
                    <span className="mailbox-row-from">
                      <strong>{entry.community}</strong>
                    </span>
                    <span>{entry.kind}</span>
                  </span>
                  <span className="mailbox-row-meta">
                    <span className="mailbox-time">{entry.date}</span>
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
          className="mailbox-mail quote-input"
          key={item.id}
          data-marked={status !== "idle" || undefined}
        >
          <header>
            <h4>
              <Mic size={16} aria-hidden="true" />
              Mitschnitt · {item.kind}
            </h4>
            <span>
              {item.date} · {item.attendance}
            </span>
          </header>
          <div className="quote-wave" aria-hidden="true">
            <Play size={14} />
            <span>
              {waveBars.map((height, position) => (
                <i key={position} style={{ height }} />
              ))}
            </span>
          </div>
          <ol
            className="meeting-transcript"
            ref={transcriptRef}
            aria-label="Ausschnitte aus dem Mitschnitt"
          >
            {item.segments.map((segment) => (
              <li
                key={segment.id}
                data-segment={segment.id}
                data-linked={segment.id === activeSegment || undefined}
                tabIndex={-1}
              >
                <span className="meeting-time">{segment.time}</span>
                <span>
                  <strong>{segment.speaker}</strong>
                  <Marked text={segment.text} marks={item.marks} />
                </span>
              </li>
            ))}
          </ol>
        </article>
      </div>
      <p className="mailbox-hint">
        <span className="mailbox-hint-mark" aria-hidden="true" />
        Markiert: Was der Assistent ins Protokoll übernimmt. Mitgeschnitten
        wird nur mit Zustimmung aller Anwesenden.
      </p>
    </div>
  );

  const resultColumn = (
    <div className="mailbox-column" data-view="result">
      <ColumnLabel number={3}>Für Ihr Team vorbereitet</ColumnLabel>
      <div
        className="mailbox-draft"
        ref={draftRef}
        data-state={isSent ? "sent" : complete ? "ready" : undefined}
        aria-label="Protokollentwurf"
      >
        <div className="mailbox-draft-head">
          <strong>Protokollentwurf</strong>
          <span
            className="mailbox-draft-chip"
            data-tone={isSent ? "sent" : complete ? "ready" : undefined}
          >
            {isSent
              ? "Von Ihrem Team freigegeben"
              : reviewing
                ? "Sie klären gerade"
                : complete
                  ? "Wartet auf Ihre Prüfung"
                  : working && progress >= writeAt
                    ? "wird geschrieben …"
                    : "noch leer"}
          </span>
        </div>
        <dl className="mailbox-draft-meta">
          <div>
            <dt>Objekt</dt>
            <dd>{item.community}</dd>
          </div>
          <div>
            <dt>Termin</dt>
            <dd>
              {item.kind}, {item.date}
            </dd>
          </div>
        </dl>

        {shown === 0 ? (
          <p className="mailbox-draft-empty">
            {status === "idle"
              ? "Hier entsteht gleich das Protokoll."
              : "Der Assistent hört noch den Mitschnitt durch …"}
          </p>
        ) : (
          <ol className="meeting-resolutions">
            {shownResolutions.map((resolution) => {
              const open = resolution.open;
              const segment = item.segments.find(
                (entry) => entry.id === resolution.segment,
              )!;
              return (
                <li
                  key={resolution.top}
                  data-kind={open ? (isSent ? "settled" : "open") : undefined}
                >
                  <div className="meeting-resolution-head">
                    <span className="meeting-top">{resolution.top}</span>
                    <strong>{resolution.title}</strong>
                    <span className="meeting-result">{resolution.result}</span>
                  </div>
                  <p>{fill(resolution.text, resolution)}</p>
                  <p className="meeting-votes">
                    Abstimmung: {fill(resolution.votes, resolution)}
                  </p>
                  {open && !isSent && !reviewing ? (
                    <p className="meeting-question">{open.question}</p>
                  ) : null}
                  {open && reviewing ? (
                    <span
                      className="cost-choice"
                      role="radiogroup"
                      aria-label={`${resolution.top}: ${open.question}`}
                    >
                      {open.options.map((option, choice) => (
                        <label key={option.label} className="quote-review-check">
                          <input
                            type="radio"
                            name={`meeting-${item.id}-${resolution.top}`}
                            data-review-field
                            checked={choiceOf(resolution) === choice}
                            onChange={() =>
                              setChoices((previous) => ({
                                ...previous,
                                [resolution.top]: choice,
                              }))
                            }
                          />
                          {option.label}
                        </label>
                      ))}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    className="meeting-jump"
                    aria-pressed={linked === segment.id}
                    onClick={() => showSegment(segment.id)}
                  >
                    <AudioLines size={14} aria-hidden="true" />
                    Im Mitschnitt bei {segment.time}
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        {tasksShown ? (
          <div className="meeting-tasks">
            <span className="schedule-message-to">
              <ListTodo size={13} aria-hidden="true" />
              <strong>Aufgaben aus der Versammlung</strong>
            </span>
            <ul>
              {item.tasks.map((task) => (
                <li key={task.text}>
                  <span>{task.text}</span>
                  <span className="meeting-task-meta">
                    {task.owner} · {task.due}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="quote-price-note">
          Beispiel, frei erfunden. Abstimmung nach Köpfen. Keine Rechtsberatung.
        </p>

        {status === "done" && !reviewing ? (
          <div className="mailbox-draft-actions">
            <span>Erst klären Sie die orange Stelle, dann geben Sie frei.</span>
            <button
              type="button"
              className="mailbox-send"
              onClick={() => setReviewing(true)}
            >
              <ClipboardCheck size={16} aria-hidden="true" />
              Unklare Stelle klären
            </button>
          </div>
        ) : reviewing ? (
          <div className="mailbox-draft-actions quote-review-actions">
            <span>Tipp: „Im Mitschnitt“ springt zur Stelle.</span>
            <span className="quote-review-buttons">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setReviewing(false);
                  setChoices({});
                }}
              >
                Abbrechen
              </Button>
              <button
                type="button"
                className="mailbox-send"
                onClick={() => {
                  setReviewing(false);
                  send();
                }}
              >
                <Send size={16} aria-hidden="true" />
                Protokoll freigeben
              </button>
            </span>
          </div>
        ) : isSent ? (
          <p className="mailbox-draft-sent" role="status">
            <CheckCheck size={18} aria-hidden="true" />
            Von Ihnen geklärt: {sentSummary}. Protokoll freigegeben.
          </p>
        ) : null}
      </div>

      <div
        className="story-note"
        aria-label="Einträge für die Beschlusssammlung"
      >
        <div className="story-note-head">
          <BookMarked size={18} aria-hidden="true" />
          <strong>Beschlusssammlung</strong>
          <span>
            {isSent
              ? "eingetragen in Ihrer Verwaltungssoftware"
              : collectionShown
                ? "vorbereitet · wird mit der Freigabe eingetragen"
                : status === "idle"
                  ? "wird beim Bearbeiten ausgefüllt"
                  : "wird ausgefüllt …"}
          </span>
        </div>
        <dl>
          {item.resolutions.map((resolution, number) => (
            <div
              key={resolution.top}
              data-visible={collectionShown || undefined}
              data-open={
                (collectionShown && !!resolution.open && !isSent) || undefined
              }
              data-filled={(isSent && !!resolution.open) || undefined}
            >
              <dt>Nr. {item.collectionNext + number}</dt>
              <dd>
                {collectionShown
                  ? `${item.date} · ${resolution.top} · ${resolution.title} · ${resolution.result}${
                      resolution.open && !isSent ? " · Angabe offen" : ""
                    }`
                  : "…"}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mailbox-legend">
          <span>
            <i aria-hidden="true" /> noch offen
          </span>
        </p>
      </div>
    </div>
  );

  return (
    <StoryFrame
      set={set}
      className="meeting-story"
      compare={{
        without: { icon: NotebookPen, text: story.without },
        with: { icon: BookMarked, text: story.with },
      }}
      example={{
        index,
        count: cases.length,
        headline: item.headline,
        hint: "Andere Versammlung in der Liste anklicken.",
      }}
      controls={
        <StoryButtons
          status={status}
          complete={complete}
          onPrimary={onPrimary}
          onNext={() => playCase((index + 1) % cases.length)}
          onShowAll={showAll}
        />
      }
      stage={
        <StoryStage
          stageRef={stageRef}
          tabbed={tabbed}
          view={view}
          autoView={autoView}
          working={working}
          labels={{
            input: "Mitschnitt",
            assistant: "Assistent",
            result: "Protokoll",
          }}
          onView={setView}
          columns={{
            input: inputColumn,
            assistant: (
              <AssistantColumn
                steps={item.steps}
                icons={stepIcons}
                status={status}
                complete={complete}
                stepsDone={stepsDone}
              />
            ),
            result: resultColumn,
          }}
        />
      }
    />
  );
}
