import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  Check,
  CheckCheck,
  CircleAlert,
  CircleHelp,
  ClipboardCheck,
  FileSearch,
  History,
  Mail,
  PenLine,
  Scale,
  ScanText,
  ScrollText,
  Send,
  TimerOff,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
import type { NoticeStepKind, NoticeStoryData } from "../noticeStory";
import type { OverviewSet } from "../overviewFlows";
import { useStoryPlayback } from "../lib/useStoryPlayback";

const STEP_MS = 1700;
const ROW_MS = 1100;
const BLOCK_MS = 1400;

const stepIcons: Record<NoticeStepKind, LucideIcon> = {
  read: ScanText,
  compare: Scale,
  history: History,
  deadline: CalendarClock,
  write: PenLine,
};

// Bescheid-Demo in Leserichtung: Bescheid, Assistent, Abgleich mit Frist
// und Mail an den Mandanten. Feste Beschriftungen in der Anrede Sie.
export function NoticeStory({
  set,
  story,
}: {
  set: OverviewSet;
  story: NoticeStoryData;
}) {
  const { cases } = story;
  // Takte: Schritte bis "Schreibt …", je Zeile des Abgleichs einer, dann
  // Frist und Mail.
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
      cases[position].steps.length - 1 + cases[position].rows.length + 2,
    (position, current) => {
      const entry = cases[position];
      const row = current - (entry.steps.length - 1);
      return row < 0 ? STEP_MS : row < entry.rows.length ? ROW_MS : BLOCK_MS;
    },
  );

  // Entscheidung des Teams; gilt für das aktuelle Beispiel und wird bei
  // jedem Neustart verworfen. Das Kennzeichen nach der Freigabe bleibt.
  const [reviewing, setReviewing] = useState(false);
  const [choice, setChoice] = useState(0);
  const [sentTags, setSentTags] = useState<Record<string, string>>({});
  const draftRef = useRef<HTMLDivElement>(null);
  const reset = () => {
    setReviewing(false);
    setChoice(0);
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
  const decision = item.decision;
  const writeAt = item.steps.length - 1;
  const isSent = status === "sent";
  const working = status === "playing" || status === "paused";
  const progress = complete ? total : beat;
  const stepsDone = complete ? item.steps.length : Math.min(progress, writeAt);
  const shown = Math.max(0, progress - writeAt);
  const shownRows = item.rows.slice(0, shown);
  const deadlineShown = shown > item.rows.length;
  const mailShown = shown > item.rows.length + 1;
  const chosen = decision?.options[choice];

  const release = () => {
    setReviewing(false);
    setSentTags((previous) => ({
      ...previous,
      [item.id]: chosen?.tag ?? item.sentTag,
    }));
    send();
  };

  const autoView: StoryView =
    complete || (working && progress >= writeAt)
      ? "result"
      : working && stepsDone > 0
        ? "assistant"
        : "input";
  const { tabbed, view, setView } = useStoryView(autoView, index);

  const inputColumn = (
    <div className="mailbox-column" data-view="input">
      <ColumnLabel number={1}>Das kommt rein</ColumnLabel>
      <div className="mailbox-panel">
        <ul className="mailbox-list" aria-label="Bescheide, Beispiele">
          {cases.map((entry, position) => {
            const active = position === index;
            const [tag, tone] = sent.has(entry.id)
              ? [sentTags[entry.id] ?? entry.sentTag, "sent"]
              : finished.has(entry.id) && !(active && working)
                ? ["Abgleich bereit", "ready"]
                : active && working
                  ? ["wird geprüft …", "working"]
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
                    <ScrollText size={15} />
                  </span>
                  <span className="mailbox-row-text">
                    <span className="mailbox-row-from">
                      <strong>{entry.client}</strong>
                      <span className="mailbox-channel">{entry.channel}</span>
                    </span>
                    <span>{entry.kind}</span>
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
          className="mailbox-mail notice-document"
          key={item.id}
          data-marked={status !== "idle" || undefined}
        >
          <header>
            <h4>{item.notice.title}</h4>
            <span>
              {item.notice.authority} · vom {item.notice.date} · für{" "}
              <strong>{item.client}</strong>
            </span>
          </header>
          <dl className="notice-lines">
            {item.notice.lines.map((line) => (
              <div key={line.label}>
                <dt>
                  <Marked text={line.label} marks={item.marks} />
                </dt>
                <dd>
                  <Marked text={line.value} marks={item.marks} />
                </dd>
              </div>
            ))}
          </dl>
          <div className="notice-explanation">
            <strong>Erläuterungen</strong>
            {item.notice.explanation.map((text) => (
              <p key={text}>
                <Marked text={text} marks={item.marks} />
              </p>
            ))}
          </div>
        </article>
      </div>
      <p className="mailbox-hint">
        <span className="mailbox-hint-mark" aria-hidden="true" />
        Markiert: Was der Assistent aus dem Bescheid übernimmt.
      </p>
    </div>
  );

  // Absatz aus der Entscheidung: offen, in der Auswahl oder entschieden
  const decisionParagraph = () => {
    if (!decision || !chosen) return null;
    if (isSent) {
      return (
        <p key="decision" className="mailbox-draft-filled">
          <span>Von Ihrem Team entschieden</span>
          {chosen.paragraph}
        </p>
      );
    }
    if (reviewing) {
      return (
        <div key="decision" className="mailbox-draft-open notice-review">
          <span>{decision.question}</span>
          <span
            className="cost-choice"
            role="radiogroup"
            aria-label={decision.question}
          >
            {decision.options.map((option, position) => (
              <label key={option.label} className="quote-review-check">
                <input
                  type="radio"
                  name={`notice-${item.id}`}
                  data-review-field
                  checked={choice === position}
                  onChange={() => setChoice(position)}
                />
                {option.label}
              </label>
            ))}
          </span>
          <p className="notice-review-preview">{chosen.paragraph}</p>
        </div>
      );
    }
    return (
      <p key="decision" className="mailbox-draft-open">
        <span>Entscheidet Ihr Team · {decision.question}</span>[
        {decision.options.map((option) => option.label).join(" oder ")}]
      </p>
    );
  };

  const resultColumn = (
    <div className="mailbox-column" data-view="result">
      <ColumnLabel number={3}>Für Ihr Team vorbereitet</ColumnLabel>
      <div
        className="mailbox-draft"
        ref={draftRef}
        data-state={isSent ? "sent" : complete ? "ready" : undefined}
        aria-label="Abgleich und Mail an den Mandanten"
      >
        <div className="mailbox-draft-head">
          <strong>Abgleich mit {item.compareWith}</strong>
          <span
            className="mailbox-draft-chip"
            data-tone={isSent ? "sent" : complete ? "ready" : undefined}
          >
            {isSent
              ? "Von Ihrem Team freigegeben"
              : reviewing
                ? "Sie entscheiden gerade"
                : complete
                  ? decision
                    ? "Wartet auf Ihre Entscheidung"
                    : "Wartet auf Ihre Prüfung"
                  : working && progress >= writeAt
                    ? "wird vorbereitet …"
                    : "noch leer"}
          </span>
        </div>

        {shown === 0 ? (
          <p className="mailbox-draft-empty">
            {status === "idle"
              ? "Hier entsteht gleich der Abgleich."
              : "Der Assistent liest noch den Bescheid …"}
          </p>
        ) : (
          <>
            <div className="notice-summary" data-tone={item.summary.tone}>
              <span>
                <small>{item.summary.before.label}</small>
                <strong>{item.summary.before.value}</strong>
              </span>
              <ArrowRight size={16} aria-hidden="true" />
              <span>
                <small>{item.summary.after.label}</small>
                <strong>{item.summary.after.value}</strong>
              </span>
            </div>
            <ol className="notice-rows" aria-label="Abgleich Zeile für Zeile">
              {shownRows.map((row) => {
                const RowIcon =
                  row.tone === "same"
                    ? Check
                    : row.tone === "error"
                      ? CircleAlert
                      : CircleHelp;
                return (
                  <li key={row.label} data-tone={row.tone}>
                    <RowIcon
                      className="notice-row-icon"
                      size={15}
                      aria-hidden="true"
                    />
                    <span className="notice-row-main">
                      <span className="notice-row-head">
                        <strong>{row.label}</strong>
                        <span className="notice-effect">
                          {row.tone === "same"
                            ? item.sameLabel
                            : row.tone === "error"
                              ? `Fehler · ${row.effect}`
                              : row.effect}
                        </span>
                      </span>
                      {row.tone === "same" ? null : (
                        <span className="notice-values">
                          <span>
                            {item.columns[0]}: <b>{row.declared}</b>
                          </span>
                          <span>
                            {item.columns[1]}: <b>{row.assessed}</b>
                          </span>
                        </span>
                      )}
                      {row.note ? (
                        <span className="notice-note">{row.note}</span>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ol>
          </>
        )}

        {deadlineShown ? (
          <div className="notice-deadline">
            <span className="schedule-message-to">
              <CalendarClock size={13} aria-hidden="true" />
              <strong>Frist</strong>
              <span className="notice-deadline-state">
                {isSent
                  ? "eingetragen in Ihrer Fristenkontrolle"
                  : "wird mit der Freigabe eingetragen"}
              </span>
            </span>
            <dl>
              {item.deadline.map((entry) => (
                <div key={entry.label}>
                  <dt>{entry.label}</dt>
                  <dd>{entry.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        {mailShown ? (
          <div className="schedule-message notice-mail">
            <span className="schedule-message-to">
              <Mail size={13} aria-hidden="true" />
              Mail an <strong>{item.mail.to}</strong>
            </span>
            <div className="mailbox-draft-body">
              <p>{item.mail.salutation}</p>
              {item.mail.paragraphs.map((paragraph) =>
                paragraph === "{decision}" ? (
                  decisionParagraph()
                ) : (
                  <p key={paragraph}>{paragraph}</p>
                ),
              )}
              <p className="mailbox-draft-closing">{story.closing}</p>
            </div>
          </div>
        ) : null}

        <p className="quote-price-note">
          Beispiel, frei erfunden. Vereinfachte Darstellung, keine
          Steuerberatung.
        </p>

        {status === "done" && !reviewing ? (
          <div className="mailbox-draft-actions">
            {decision ? (
              <>
                <span>
                  Erst entscheiden Sie, wie die Kanzlei reagiert, dann geben
                  Sie frei.
                </span>
                <button
                  type="button"
                  className="mailbox-send"
                  onClick={() => setReviewing(true)}
                >
                  <ClipboardCheck size={16} aria-hidden="true" />
                  Entscheiden
                </button>
              </>
            ) : (
              <>
                <span>Prüfen, Frist eintragen, absenden:</span>
                <button type="button" className="mailbox-send" onClick={release}>
                  <Send size={16} aria-hidden="true" />
                  Prüfen &amp; senden
                </button>
              </>
            )}
          </div>
        ) : reviewing ? (
          <div className="mailbox-draft-actions quote-review-actions">
            <span>Die Mail passt sich Ihrer Wahl an.</span>
            <span className="quote-review-buttons">
              <Button type="button" variant="outline" onClick={reset}>
                Abbrechen
              </Button>
              <button type="button" className="mailbox-send" onClick={release}>
                <Send size={16} aria-hidden="true" />
                Freigeben
              </button>
            </span>
          </div>
        ) : isSent ? (
          <p className="mailbox-draft-sent" role="status">
            <CheckCheck size={18} aria-hidden="true" />
            {chosen
              ? `Von Ihnen entschieden: ${chosen.label}. Frist eingetragen, Mail gesendet.`
              : "Von Ihrem Team geprüft. Frist eingetragen, Mail gesendet."}
          </p>
        ) : null}
      </div>
    </div>
  );

  return (
    <StoryFrame
      set={set}
      className="notice-story"
      compare={{
        without: { icon: TimerOff, text: story.without },
        with: { icon: FileSearch, text: story.with },
      }}
      example={{
        index,
        count: cases.length,
        headline: item.headline,
        hint: "Anderen Bescheid in der Liste anklicken.",
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
            input: "Bescheid",
            assistant: "Assistent",
            result: "Abgleich",
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
