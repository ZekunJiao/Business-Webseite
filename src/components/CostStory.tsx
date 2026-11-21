import { useEffect, useRef, useState } from "react";
import {
  CalendarRange,
  CheckCheck,
  ClipboardCheck,
  FileStack,
  FileText,
  PenLine,
  ScanText,
  Send,
  Tags,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { ColumnLabel } from "./storyParts";
import {
  AssistantColumn,
  StoryButtons,
  StoryFrame,
  StoryStage,
  useStoryView,
} from "./storyFrame";
import type { StoryView } from "./storyFrame";
import type { CostLine, CostStepKind, CostStoryData } from "../costStory";
import type { OverviewSet } from "../overviewFlows";
import { useStoryPlayback } from "../lib/useStoryPlayback";

const STEP_MS = 1700;
const LINE_MS = 750;

const stepIcons: Record<CostStepKind, LucideIcon> = {
  read: ScanText,
  sort: Tags,
  period: CalendarRange,
  compare: TrendingUp,
  write: PenLine,
};

const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});
const area = new Intl.NumberFormat("de-DE");

// Abweichung zum Vorjahr in Worten
const change = (line: CostLine) => {
  if (line.previous === undefined) return null;
  const percent = Math.round(
    ((line.amount - line.previous) / line.previous) * 100,
  );
  return percent === 0
    ? "wie im Vorjahr"
    : `Vorjahr ${euro.format(line.previous)} · ${percent > 0 ? "+" : "−"}${Math.abs(percent)} %`;
};

// Betriebskosten-Demo in Leserichtung: Belege, Assistent, Aufstellung mit
// Anteil je Wohnung.
export function CostStory({
  set,
  story,
}: {
  set: OverviewSet;
  story: CostStoryData;
}) {
  const { cases } = story;
  // Takte: Schritte bis "Erstellt …", dann je Zeile einer, dann die Anteile.
  const playback = useStoryPlayback(
    cases.map((entry) => entry.id),
    (position) =>
      cases[position].steps.length - 1 + cases[position].lines.length + 1,
    (position, current) =>
      current < cases[position].steps.length - 1 ? STEP_MS : LINE_MS,
  );
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
  } = playback;

  // Entscheidungen des Teams und gewählte Wohnung; gelten für das aktuelle
  // Beispiel und werden bei jedem Neustart verworfen.
  const [reviewing, setReviewing] = useState(false);
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [unitId, setUnitId] = useState<string | null>(null);
  const draftRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!reviewing) return;
    draftRef.current
      ?.querySelector<HTMLElement>("[data-review-field]:checked")
      ?.focus();
  }, [reviewing]);
  const reset = () => {
    setReviewing(false);
    setChoices({});
    setUnitId(null);
  };
  const playCase = (next: number) => {
    reset();
    play(next);
  };
  const onPrimary = () => {
    if (complete) reset();
    primary();
  };

  const item = cases[index];
  const writeAt = item.steps.length - 1;
  const isSent = status === "sent";
  const working = status === "playing" || status === "paused";
  const progress = complete ? total : beat;
  const stepsDone = complete ? item.steps.length : Math.min(progress, writeAt);
  const shownLines = Math.min(
    item.lines.length,
    Math.max(0, progress - writeAt),
  );
  const sharesShown = progress - writeAt > item.lines.length;
  // Belege, die der Assistent genauer prüft, sind ab "Prüft Zeiträume"
  // markiert.
  const flagged = stepsDone >= 3;

  const autoView: StoryView =
    complete || (working && progress >= writeAt)
      ? "result"
      : working && stepsDone > 0
        ? "assistant"
        : "input";
  const { tabbed, view, setView } = useStoryView(autoView, index);

  const receiptOf = (line: CostLine) =>
    item.receipts.find((receipt) => receipt.id === line.receipt)!;
  const decided = reviewing || isSent;
  const choiceOf = (line: CostLine) =>
    decided ? (choices[line.receipt] ?? 0) : 0;
  const amountOf = (line: CostLine) =>
    line.decide ? line.decide.options[choiceOf(line)].amount : line.amount;
  const sum = item.lines.reduce(
    (total, line) => (line.excluded ? total : total + amountOf(line)),
    0,
  );
  const totalArea = item.units.reduce((total, unit) => total + unit.area, 0);
  const unit =
    item.units.find((entry) => entry.id === unitId) ?? item.units[0];
  const share = (sum * unit.area) / totalArea;
  const prepaid = unit.prepaid * 12;
  const balance = prepaid - share;
  const decisions = item.lines.filter((line) => line.decide);
  const sentSummary = decisions
    .map((line) => line.decide!.options[choiceOf(line)].label)
    .join(", ");
  const flaggedReceipts = new Set(
    item.lines
      .filter((line) => line.decide || line.excluded || line.hint)
      .map((line) => line.receipt),
  );

  const inputColumn = (
    <div className="mailbox-column" data-view="input">
      <ColumnLabel number={1}>Das kommt rein</ColumnLabel>
      <div className="mailbox-panel">
        <ul className="mailbox-list" aria-label="Objekte, Beispiele">
          {cases.map((entry, position) => {
            const active = position === index;
            const [tag, tone] = sent.has(entry.id)
              ? [entry.sentTag, "sent"]
              : finished.has(entry.id) && !(active && working)
                ? ["Aufstellung bereit", "ready"]
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
                    <FileStack size={15} />
                  </span>
                  <span className="mailbox-row-text">
                    <span className="mailbox-row-from">
                      <strong>{entry.object}</strong>
                      <span className="mailbox-channel">{entry.subtitle}</span>
                    </span>
                    <span>Betriebskosten {story.period}</span>
                  </span>
                  <span className="mailbox-row-meta">
                    <span className="mailbox-time">
                      {entry.receipts.length} Belege
                    </span>
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

        <div className="mailbox-mail" key={item.id}>
          <header>
            <h4>
              Belege {item.object} · {story.period}
            </h4>
            <span>aus Postfach, Scanner und Verwaltungssoftware</span>
          </header>
          <ul className="cost-receipts">
            {item.receipts.map((receipt) => (
              <li
                key={receipt.id}
                data-flag={
                  (flagged && flaggedReceipts.has(receipt.id)) || undefined
                }
              >
                <FileText size={15} aria-hidden="true" />
                <span className="cost-receipt-text">
                  <strong>{receipt.vendor}</strong>
                  <span>
                    {receipt.text} · {receipt.date}
                  </span>
                </span>
                <span className="cost-receipt-amount">
                  {euro.format(receipt.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mailbox-hint">
        <span className="cost-flag-dot" aria-hidden="true" />
        Markiert: Belege, die der Assistent genauer prüft.
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
        aria-label="Kostenaufstellung"
      >
        <div className="mailbox-draft-head">
          <strong>
            Betriebskosten {item.object} · {story.period}
          </strong>
          <span
            className="mailbox-draft-chip"
            data-tone={isSent ? "sent" : complete ? "ready" : undefined}
          >
            {isSent
              ? "Von Ihrem Team freigegeben"
              : reviewing
                ? "Sie entscheiden gerade"
                : complete
                  ? "Wartet auf Ihre Entscheidung"
                  : working && progress >= writeAt
                    ? "wird erstellt …"
                    : "noch leer"}
          </span>
        </div>

        {shownLines === 0 ? (
          <p className="mailbox-draft-empty">
            {status === "idle"
              ? "Hier entsteht gleich die Aufstellung nach Kostenarten."
              : "Der Assistent sortiert noch die Belege …"}
          </p>
        ) : (
          <ol className="quote-positions cost-lines">
            {item.lines.slice(0, shownLines).map((line, number) => {
              const receipt = receiptOf(line);
              const kind = line.excluded
                ? "declined"
                : line.decide
                  ? isSent
                    ? "settled"
                    : "open"
                  : undefined;
              const flag = line.excluded
                ? "Abgetrennt"
                : line.decide
                  ? isSent
                    ? "Von Ihnen entschieden"
                    : "Entscheiden Sie"
                  : line.hint
                    ? "Auffällig"
                    : null;
              const detail = line.excluded
                ? line.excluded
                : line.decide
                  ? isSent
                    ? line.decide.options[choiceOf(line)].label
                    : line.decide.question
                  : line.hint
                    ? `${change(line)} · ${line.hint}`
                    : change(line);
              return (
                <li
                  key={line.receipt}
                  data-kind={kind}
                  data-hint={(line.hint && !kind) || undefined}
                >
                  <span className="quote-position-number" aria-hidden="true">
                    {number + 1}
                  </span>
                  <span className="quote-position-text">
                    {flag ? (
                      <span className="quote-position-flag">{flag}</span>
                    ) : null}
                    <strong>{line.category}</strong>
                    <span className="quote-position-calc">
                      {receipt.vendor}
                    </span>
                    {detail ? (
                      <span className="cost-line-detail">{detail}</span>
                    ) : null}
                    {reviewing && line.decide ? (
                      <span
                        className="cost-choice"
                        role="radiogroup"
                        aria-label={line.category}
                      >
                        {line.decide.options.map((option, choice) => (
                          <label key={option.label} className="quote-review-check">
                            <input
                              type="radio"
                              name={`cost-${item.id}-${line.receipt}`}
                              data-review-field
                              checked={choiceOf(line) === choice}
                              onChange={() =>
                                setChoices((previous) => ({
                                  ...previous,
                                  [line.receipt]: choice,
                                }))
                              }
                            />
                            {option.label} · {euro.format(option.amount)}
                          </label>
                        ))}
                      </span>
                    ) : null}
                  </span>
                  <span className="quote-position-total">
                    {euro.format(line.excluded ? line.amount : amountOf(line))}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        {shownLines === item.lines.length ? (
          <dl className="quote-sums">
            <div className="quote-sums-total">
              <dt>
                Umlagefähig{" "}
                {decided ? "" : decisions.length ? "(mit Vorschlag)" : ""}
              </dt>
              <dd>{euro.format(sum)}</dd>
            </div>
          </dl>
        ) : null}

        {sharesShown ? (
          <div className="cost-share">
            <span className="schedule-message-to">
              Anteil je Wohnung, nach Wohnfläche ({area.format(totalArea)} m²)
            </span>
            <div
              className="cost-units"
              role="group"
              aria-label="Wohnung wählen"
            >
              {item.units.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  aria-pressed={entry.id === unit.id}
                  onClick={() => setUnitId(entry.id)}
                >
                  {entry.id}
                </button>
              ))}
            </div>
            <dl className="quote-sums" aria-live="polite">
              <div>
                <dt>
                  {unit.id} · {unit.tenant}, {area.format(unit.area)} m²
                </dt>
                <dd>{euro.format(share)}</dd>
              </div>
              <div>
                <dt>Vorauszahlungen 12 × {euro.format(unit.prepaid)}</dt>
                <dd>{euro.format(prepaid)}</dd>
              </div>
              <div
                className="quote-sums-total"
                data-tone={balance < 0 ? "due" : "credit"}
              >
                <dt>{balance < 0 ? "Nachzahlung" : "Guthaben"}</dt>
                <dd>{euro.format(Math.abs(balance))}</dd>
              </div>
            </dl>
          </div>
        ) : null}

        <p className="quote-price-note">
          Vereinfacht: alles nach Wohnfläche, Heizkosten separat über den
          Messdienst. Beispielbeträge, frei erfunden. Keine Rechtsberatung.
        </p>

        {status === "done" && !reviewing ? (
          <div className="mailbox-draft-actions">
            <span>Erst entscheiden Sie den orangen Punkt, dann geben Sie frei.</span>
            <button
              type="button"
              className="mailbox-send"
              onClick={() => setReviewing(true)}
            >
              <ClipboardCheck size={16} aria-hidden="true" />
              Offenen Punkt entscheiden
            </button>
          </div>
        ) : reviewing ? (
          <div className="mailbox-draft-actions quote-review-actions">
            <span>Summe und Anteile rechnen mit Ihrer Wahl.</span>
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
                Aufstellung freigeben
              </button>
            </span>
          </div>
        ) : isSent ? (
          <p className="mailbox-draft-sent" role="status">
            <CheckCheck size={18} aria-hidden="true" />
            Von Ihnen entschieden: {sentSummary}. Aufstellung freigegeben.
          </p>
        ) : null}
      </div>
    </div>
  );

  return (
    <StoryFrame
      set={set}
      className="cost-story"
      compare={{
        without: { icon: FileStack, text: story.without },
        with: { icon: ClipboardCheck, text: story.with },
      }}
      example={{
        index,
        count: cases.length,
        headline: item.headline,
        hint: "Anderes Objekt in der Liste anklicken.",
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
            input: "Belege",
            assistant: "Assistent",
            result: "Aufstellung",
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
