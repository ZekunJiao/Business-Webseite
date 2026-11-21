import { useEffect, useState } from "react";
import {
  BellRing,
  Check,
  CheckCheck,
  CircleHelp,
  FileSearch,
  History,
  Landmark,
  ListEnd,
  Mail,
  MessageSquare,
  Pause,
  PenLine,
  Play,
  ReceiptText,
  RotateCcw,
  Scale,
  ScanText,
  Send,
  SkipForward,
  UserRoundCog,
  TimerOff,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { ColumnLabel, Marked } from "./storyParts";
import type {
  InvoiceCase,
  InvoiceSource,
  InvoiceStepKind,
} from "../invoiceStory";
import type { OverviewSet } from "../overviewFlows";
import type { InvoiceStoryData } from "../invoiceStory";
import { useMediaQuery } from "../lib/useMediaQuery";
import { useStoryPlayback } from "../lib/useStoryPlayback";
import { StoryTechnical } from "./StoryTechnical";

type View = "input" | "assistant" | "result";


// Ab hier zeigt die Bühne eine Spalte mit Umschalter statt drei Spalten.
const TABBED_QUERY = "(max-width: 1100px)";
const STEP_MS = 1700;
const LEDGER_MS = 1200;
const POSITION_MS = 700;
const REASONS_MS = 1300;
const MESSAGE_MS = 1500;

const stepIcons: Record<InvoiceStepKind, LucideIcon> = {
  read: ScanText,
  find: FileSearch,
  match: Scale,
  history: History,
  write: PenLine,
};
const sourceIcons: Record<InvoiceSource, LucideIcon> = {
  person: MessageSquare,
  software: BellRing,
  bank: Landmark,
};
const views: { id: View; label: string }[] = [
  { id: "input", label: "Eingang" },
  { id: "assistant", label: "Assistent" },
  { id: "result", label: "Ergebnis" },
];

const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});
const amount = new Intl.NumberFormat("de-DE");

// Takte nach den Schritten: Zeile in den offenen Posten, Positionen der
// Rechnung, Begründung, Nachrichten.
const positionsOf = (entry: InvoiceCase) => entry.positions?.length ?? 0;
const rowsOf = (entry: InvoiceCase) =>
  1 + positionsOf(entry) + 1 + entry.messages.length;

// Rechnungs-Demo in Leserichtung: Eingang, Assistent, offene Posten mit
// Rechnungsentwurf bzw. Nachricht.
export function InvoiceStory({
  set,
  story,
}: {
  set: OverviewSet;
  story: InvoiceStoryData;
}) {
  const { cases, vatRate, labels } = story;
  const tabbed = useMediaQuery(TABBED_QUERY);
  const [manualView, setManualView] = useState<View | null>(null);
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
      const row = current - (entry.steps.length - 1);
      const count = positionsOf(entry);
      return row < 0
        ? STEP_MS
        : row === 0
          ? LEDGER_MS
          : row <= count
            ? POSITION_MS
            : row === count + 1
              ? REASONS_MS
              : MESSAGE_MS;
    },
  );

  const item = cases[index];
  const positions = item.positions;
  const count = positionsOf(item);
  const writeAt = item.steps.length - 1;
  const isSent = status === "sent";
  const progress = complete ? total : beat;
  const stepsDone = complete ? item.steps.length : Math.min(progress, writeAt);
  const shownRows = Math.max(0, progress - writeAt);
  const ledgerChanged = shownRows >= 1;
  const shownPositions = Math.min(count, Math.max(0, shownRows - 1));
  const reasonsShown = shownRows >= count + 2;
  const shownMessages = item.messages.slice(
    0,
    Math.max(0, shownRows - count - 2),
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

  // Summe der Rechnung: Der Mehraufwand zählt erst nach der Entscheidung.
  const net = (positions ?? []).reduce(
    (sum, position) =>
      isSent || !position.extra
        ? sum + position.quantity * position.price
        : sum,
    0,
  );
  const gross = net * (1 + vatRate);
  const hasExtra = !!positions?.some((position) => position.extra);
  // Ohne Beträge (z. B. Unterlagenliste) entfällt die Betragsspalte.
  const hasAmounts =
    !!positions || item.ledger.some((row) => row.amount !== undefined);

  const inputColumn = (
    <div className="mailbox-column" data-view="input">
      <ColumnLabel number={1}>Das kommt rein</ColumnLabel>
      <div className="mailbox-panel">
        <ul className="mailbox-list" aria-label="Eingang, Beispiele">
          {cases.map((entry, position) => {
            const active = position === index;
            const EntryIcon = sourceIcons[entry.source];
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
                  onClick={() => (active ? undefined : play(position))}
                >
                  <span
                    className={`mailbox-avatar${entry.initials ? "" : " quote-row-icon"}`}
                    aria-hidden="true"
                  >
                    {entry.initials ?? <EntryIcon size={15} />}
                  </span>
                  <span className="mailbox-row-text">
                    <span className="mailbox-row-from">
                      <strong>{entry.from}</strong>
                      <span className="mailbox-channel">{entry.role}</span>
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
              Von: <strong>{item.from}</strong> ({item.role}) · {item.channel}{" "}
              · heute {item.time}
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
        Markiert: Was der Assistent aus der Meldung übernimmt.
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
      <ColumnLabel number={3}>{labels.resultColumn}</ColumnLabel>
      <div
        className="mailbox-draft"
        data-state={isSent ? "sent" : complete ? "ready" : undefined}
        aria-label={`${labels.ledgerTitle} und Entwurf`}
      >
        <div className="mailbox-draft-head">
          <strong>{labels.ledgerTitle}</strong>
          <span
            className="mailbox-draft-chip"
            data-tone={isSent ? "sent" : complete ? "ready" : undefined}
          >
            {isSent
              ? labels.confirmedChip
              : complete
                ? labels.readyChip
                : working && progress >= writeAt
                  ? "wird vorbereitet …"
                  : "Stand jetzt"}
          </span>
        </div>

        <ul className="invoice-ledger">
          {item.ledger.map((row) => {
            const focus = row.id === item.focus.id;
            const state =
              focus && ledgerChanged
                ? isSent
                  ? item.focus.sent
                  : item.focus.proposed
                : row.status;
            const value =
              row.amount ?? (focus && ledgerChanged ? gross : undefined);
            return (
              <li
                key={row.id}
                data-focus={focus || undefined}
                data-tone={state.tone}
              >
                <span className="invoice-ledger-text">
                  <strong>
                    {row.customer} · {row.subject}
                  </strong>
                  <span>{row.number}</span>
                </span>
                {hasAmounts ? (
                  <span className="invoice-ledger-amount">
                    {value === undefined ? "–" : euro.format(value)}
                  </span>
                ) : null}
                <span className="invoice-ledger-status" key={state.label}>
                  {state.label}
                </span>
              </li>
            );
          })}
        </ul>

        {positions && shownPositions > 0 ? (
          <div className="invoice-document">
            <span className="schedule-message-to">
              <ReceiptText size={13} aria-hidden="true" />
              Rechnungsentwurf an <strong>{item.messages[0]?.to}</strong>
            </span>
            <ol className="quote-positions">
              {positions.slice(0, shownPositions).map((position, number) => {
                const settled = isSent && position.extra;
                return (
                  <li
                    key={position.text}
                    data-kind={
                      settled
                        ? "settled"
                        : position.extra
                          ? "suggestion"
                          : undefined
                    }
                  >
                    <span className="quote-position-number" aria-hidden="true">
                      {number + 1}
                    </span>
                    <span className="quote-position-text">
                      {position.extra ? (
                        <span className="quote-position-flag">
                          {settled ? labels.extraSettled : "Nicht im Angebot"}
                        </span>
                      ) : null}
                      <strong>{position.text}</strong>
                      <span className="quote-position-calc">
                        {position.unit === "pauschal"
                          ? "pauschal"
                          : `${amount.format(position.quantity)} ${position.unit} × ${euro.format(position.price)}`}{" "}
                        · {position.note}
                      </span>
                    </span>
                    <span className="quote-position-total">
                      {euro.format(position.quantity * position.price)}
                    </span>
                  </li>
                );
              })}
            </ol>
            {shownPositions === count ? (
              <dl className="quote-sums">
                <div>
                  <dt>
                    {hasExtra && !isSent ? "Netto ohne Mehraufwand" : "Netto"}
                  </dt>
                  <dd>{euro.format(net)}</dd>
                </div>
                <div>
                  <dt>MwSt. {amount.format(vatRate * 100)} %</dt>
                  <dd>{euro.format(net * vatRate)}</dd>
                </div>
                <div className="quote-sums-total">
                  <dt>Brutto</dt>
                  <dd>{euro.format(gross)}</dd>
                </div>
              </dl>
            ) : null}
            <p className="quote-price-note">Beispielbeträge, frei erfunden.</p>
          </div>
        ) : null}

        {reasonsShown ? (
          <div className="schedule-reasons">
            <strong>Warum so?</strong>
            <ul>
              {item.reasons.map((reason) => (
                <li key={reason.title} data-kind={reason.decide ? "flag" : undefined}>
                  {reason.decide ? (
                    <CircleHelp size={15} aria-hidden="true" />
                  ) : (
                    <Check size={15} aria-hidden="true" />
                  )}
                  <span>
                    <b>{reason.title}</b>
                    {reason.text}
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
                      <span>{labels.filledByTeam}</span>
                      {paragraph.team}
                    </p>
                  ) : (
                    <p key={paragraph.text} className="mailbox-draft-open">
                      <span>{labels.openForTeam}</span>[{paragraph.text}]
                    </p>
                  )
                ) : (
                  <p key={paragraph.text}>{paragraph.text}</p>
                ),
              )}
              <p className="mailbox-draft-closing">{story.closing}</p>
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
            {labels.sentNote}
          </p>
        ) : null}
      </div>
    </div>
  );

  return (
    <section
      id={set.id}
      className="overview mailbox-story invoice-story"
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
          <TimerOff size={20} aria-hidden="true" />
          <div>
            <strong>Ohne Assistent</strong>
            <p>{story.without}</p>
          </div>
        </div>
        <div className="story-compare-item" data-tone="with">
          <ReceiptText size={20} aria-hidden="true" />
          <div>
            <strong>Mit Assistent</strong>
            <p>{story.with}</p>
          </div>
        </div>
      </div>

      <div className="story-controls">
        <span className="story-example">
          <strong>
            Beispiel {index + 1} von {cases.length} · {item.headline}
          </strong>
          <span>Andere Meldung im Eingang anklicken.</span>
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
      <StoryTechnical set={set} />
    </section>
  );
}
