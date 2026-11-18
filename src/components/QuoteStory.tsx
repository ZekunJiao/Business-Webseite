import { useEffect, useState } from "react";
import {
  Check,
  CheckCheck,
  ClipboardList,
  FileCheck2,
  FileClock,
  History,
  ListEnd,
  Mic,
  NotebookPen,
  Paperclip,
  Pause,
  PenLine,
  Play,
  RotateCcw,
  ScanText,
  Send,
  SkipForward,
  UserRoundCog,
  Tags,
  UserRoundCheck,
  UserRoundSearch,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { ColumnLabel, Marked } from "./storyParts";
import { quoteStory } from "../quoteStory";
import type {
  QuoteInputKind,
  QuoteOrigin,
  QuotePosition,
  QuoteStepKind,
} from "../quoteStory";
import type { OverviewSet } from "../overviewFlows";
import { useMediaQuery } from "../lib/useMediaQuery";
import { useStoryPlayback } from "../lib/useStoryPlayback";

type View = "input" | "assistant" | "result";

const { cases, vatRate } = quoteStory;

// Ab hier zeigt die Bühne eine Spalte mit Umschalter statt drei Spalten.
const TABBED_QUERY = "(max-width: 1100px)";
const STEP_MS = 1700;
const POSITION_MS = 850;
const paragraphTime = (text: string) => 700 + text.length * 18;

const stepIcons: Record<QuoteStepKind, LucideIcon> = {
  read: ScanText,
  crm: UserRoundSearch,
  prices: Tags,
  history: History,
  write: PenLine,
};
const inputIcons: Record<QuoteInputKind, LucideIcon> = {
  voice: Mic,
  notes: NotebookPen,
  sent: Send,
};
const originIcons: Record<QuoteOrigin, LucideIcon> = {
  input: NotebookPen,
  crm: UserRoundSearch,
  prices: Tags,
  history: History,
};
const originNames: Record<QuoteOrigin, string> = {
  input: "aus deiner Notiz",
  crm: "aus deiner Kundenverwaltung",
  prices: "aus deiner Preisliste",
  history: "aus früheren Angeboten",
};
const views: { id: View; label: string }[] = [
  { id: "input", label: "Eingang" },
  { id: "assistant", label: "Assistent" },
  { id: "result", label: "Angebot" },
];

// Feste Balkenhöhen für das Bild der Sprachnotiz (rein dekorativ)
const waveBars = [
  5, 9, 14, 8, 12, 18, 11, 6, 13, 17, 9, 5, 10, 16, 12, 7, 14, 19, 10, 6, 11,
  15, 8, 5, 12, 17, 9, 6,
];

const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});
const amount = new Intl.NumberFormat("de-DE");

// Angebots-Demo in Leserichtung: Eingang, Assistent, Ergebnis für das Team.
export function QuoteStory({ set }: { set: OverviewSet }) {
  const tabbed = useMediaQuery(TABBED_QUERY);
  const [manualView, setManualView] = useState<View | null>(null);
  // Fortschritt: erst die Schritte des Assistenten, dann Positionen/Absätze.
  // Der letzte Schritt ("Schreibt …") bleibt aktiv, während die Zeilen
  // erscheinen, und ist erst am Ende erledigt.
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
    (position) => {
      const entry = cases[position];
      return (
        entry.steps.length -
        1 +
        (entry.positions?.length ?? entry.mail?.paragraphs.length ?? 0)
      );
    },
    (position, current) => {
      const entry = cases[position];
      const write = entry.steps.length - 1;
      return current < write
        ? STEP_MS
        : entry.positions
          ? POSITION_MS
          : paragraphTime(entry.mail?.paragraphs[current - write].text ?? "");
    },
  );

  const item = cases[index];
  const positions = item.positions;
  const paragraphs = item.mail?.paragraphs ?? [];
  const writeAt = item.steps.length - 1;
  const isSent = status === "sent";
  const progress = complete ? total : beat;
  const stepsDone = complete ? item.steps.length : Math.min(progress, writeAt);
  const shownRows = Math.max(0, progress - writeAt);
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

  // Summen: offene Preise und Vorschläge zählen erst nach der Prüfung mit.
  const priceOf = (position: QuotePosition) =>
    position.price ?? (isSent ? position.teamPrice : undefined);
  const counts = (position: QuotePosition) =>
    isSent || position.kind !== "suggestion";
  const net = (positions ?? []).reduce((sum, position) => {
    const price = priceOf(position);
    return counts(position) && price !== undefined
      ? sum + position.quantity * price
      : sum;
  }, 0);
  const hasOpen = !!positions?.some((position) => position.kind === "open");
  const hasSuggestions = !!positions?.some(
    (position) => position.kind === "suggestion",
  );
  const netLabel = isSent
    ? "Netto"
    : hasOpen
      ? "Netto ohne offene Position"
      : hasSuggestions
        ? "Netto ohne Vorschläge"
        : "Netto";

  const InputIcon = inputIcons[item.input.kind];
  const usedOrigins = [...new Set(item.fields.map((field) => field.origin))];
  const resultName = positions ? "Angebotsentwurf" : "Nachfass-Entwurf";

  const inputColumn = (
    <div className="mailbox-column" data-view="input">
      <ColumnLabel number={1}>Das kommt von dir</ColumnLabel>
      <div className="mailbox-panel">
        <ul className="mailbox-list" aria-label="Deine offenen Angebote, Beispiele">
          {cases.map((entry, position) => {
            const active = position === index;
            const EntryIcon = inputIcons[entry.input.kind];
            const [tag, tone] = sent.has(entry.id)
              ? [entry.sentTag, "sent"]
              : finished.has(entry.id) && !(active && working)
                ? ["Entwurf bereit", "ready"]
                : active && working
                  ? ["wird bearbeitet …", "working"]
                  : [entry.tag, "new"];
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  className="mailbox-row"
                  aria-pressed={active}
                  onClick={() => (active ? undefined : play(position))}
                >
                  <span
                    className="mailbox-avatar quote-row-icon"
                    aria-hidden="true"
                  >
                    <EntryIcon size={15} />
                  </span>
                  <span className="mailbox-row-text">
                    <span className="mailbox-row-from">
                      <strong>{entry.subject}</strong>
                      <span className="mailbox-channel">{entry.channel}</span>
                    </span>
                    <span>für {entry.customer}</span>
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
          className="mailbox-mail quote-input"
          key={item.id}
          data-kind={item.input.kind}
          data-marked={marked || undefined}
        >
          <header>
            <h4>
              <InputIcon size={16} aria-hidden="true" />
              {item.input.title}
            </h4>
            <span>{item.input.meta}</span>
          </header>
          {item.input.kind === "voice" ? (
            <div className="quote-wave" aria-hidden="true">
              <Play size={14} />
              <span>
                {waveBars.map((height, position) => (
                  <i key={position} style={{ height }} />
                ))}
              </span>
            </div>
          ) : null}
          {item.input.kind === "notes" ? (
            <ul className="quote-notes">
              {item.input.lines?.map((line) => (
                <li key={line}>
                  <Marked text={line} marks={item.marks} />
                </li>
              ))}
            </ul>
          ) : (
            item.input.lines?.map((line) => (
              <p key={line}>
                <Marked text={line} marks={item.marks} />
              </p>
            ))
          )}
          {item.input.form ? (
            <dl className="mailbox-form">
              {item.input.form.map((field) => (
                <div key={field.label}>
                  <dt>{field.label}</dt>
                  <dd>
                    <Marked text={field.value} marks={item.marks} />
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          {item.input.attachments ? (
            <div className="quote-attachments">
              {item.input.attachments.map((attachment) => (
                <span key={attachment} className="mailbox-attachment">
                  <Paperclip size={14} aria-hidden="true" />
                  {attachment}
                </span>
              ))}
            </div>
          ) : null}
        </article>
      </div>
      <p className="mailbox-hint">
        <span className="mailbox-hint-mark" aria-hidden="true" />
        Markiert: Was der Assistent aus deinen Angaben übernimmt.
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
        aria-label={resultName}
      >
        <div className="mailbox-draft-head">
          <strong>{resultName}</strong>
          <span
            className="mailbox-draft-chip"
            data-tone={isSent ? "sent" : complete ? "ready" : undefined}
          >
            {isSent
              ? "Gesendet von deinem Team"
              : complete
                ? "Wartet auf deine Prüfung"
                : working && progress >= writeAt
                  ? "wird geschrieben …"
                  : "noch leer"}
          </span>
        </div>
        <dl className="mailbox-draft-meta">
          <div>
            <dt>An</dt>
            <dd>{item.customer}</dd>
          </div>
          <div>
            <dt>Betreff</dt>
            <dd>
              {positions
                ? `Angebot ${item.subject}`
                : `Ihr Angebot ${item.subject}`}
            </dd>
          </div>
        </dl>
        {shownRows === 0 ? (
          <p className="mailbox-draft-empty">
            {status === "idle"
              ? positions
                ? "Hier entsteht gleich das Angebot."
                : "Hier entsteht gleich die Nachfrage."
              : "Der Assistent sammelt noch Informationen …"}
          </p>
        ) : positions ? (
          <>
            <ol className="quote-positions">
              {positions.slice(0, shownRows).map((position, number) => {
                const price = priceOf(position);
                const settled = isSent && !!position.kind;
                return (
                  <li
                    key={position.text}
                    data-kind={settled ? "settled" : position.kind}
                  >
                    <span className="quote-position-number" aria-hidden="true">
                      {number + 1}
                    </span>
                    <span className="quote-position-text">
                      {position.kind ? (
                        <span className="quote-position-flag">
                          {settled
                            ? position.kind === "open"
                              ? "Von dir ergänzt"
                              : "Von dir übernommen"
                            : position.kind === "open"
                              ? "Preis prüfen"
                              : "Vorschlag"}
                        </span>
                      ) : null}
                      <strong>{position.text}</strong>
                      <span className="quote-position-calc">
                        {price === undefined
                          ? "steht nicht in deiner Preisliste"
                          : position.unit === "pauschal"
                            ? "pauschal"
                            : `${amount.format(position.quantity)} ${position.unit} × ${euro.format(price)}`}
                        {position.kind === "suggestion" && !settled
                          ? " · in ähnlichen Angeboten enthalten"
                          : null}
                      </span>
                    </span>
                    <span className="quote-position-total">
                      {price === undefined
                        ? "offen"
                        : euro.format(position.quantity * price)}
                    </span>
                  </li>
                );
              })}
            </ol>
            {complete ? (
              <dl className="quote-sums">
                <div>
                  <dt>{netLabel}</dt>
                  <dd>{euro.format(net)}</dd>
                </div>
                <div>
                  <dt>MwSt. {amount.format(vatRate * 100)} %</dt>
                  <dd>{euro.format(net * vatRate)}</dd>
                </div>
                <div className="quote-sums-total">
                  <dt>Brutto</dt>
                  <dd>{euro.format(net * (1 + vatRate))}</dd>
                </div>
              </dl>
            ) : null}
            <p className="quote-price-note">Beispielpreise, frei erfunden.</p>
          </>
        ) : (
          <div className="mailbox-draft-body">
            <p>{item.mail?.salutation}</p>
            {paragraphs.slice(0, shownRows).map((paragraph) =>
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
            {complete ? (
              <p className="mailbox-draft-closing">{quoteStory.closing}</p>
            ) : null}
          </div>
        )}
        {status === "done" ? (
          <div className="mailbox-draft-actions">
            <span>Prüfen, Orange klären, absenden:</span>
            <button type="button" className="mailbox-send" onClick={send}>
              <Send size={16} aria-hidden="true" />
              Prüfen &amp; senden
            </button>
          </div>
        ) : isSent ? (
          <p className="mailbox-draft-sent" role="status">
            <CheckCheck size={18} aria-hidden="true" />
            Von deinem Team geprüft, ergänzt und gesendet.
          </p>
        ) : null}
      </div>

      <div className="story-note" aria-label="Eintrag in deiner Software">
        <div className="story-note-head">
          <ClipboardList size={18} aria-hidden="true" />
          <strong>Eintrag in deiner Software</strong>
          <span>
            {isSent
              ? "gespeichert, z. B. in HERO, ToolTime oder Excel"
              : complete
                ? "vorbereitet · wird mit dem Senden gespeichert"
                : status === "idle"
                  ? "wird beim Bearbeiten ausgefüllt"
                  : "wird ausgefüllt …"}
          </span>
        </div>
        <dl>
          {item.fields.map((field) => {
            const visible = field.step < stepsDone;
            const filled = isSent && !!field.sent;
            const Origin = originIcons[field.origin];
            return (
              <div
                key={field.label}
                data-visible={visible || undefined}
                data-open={(visible && field.open && !filled) || undefined}
                data-filled={filled || undefined}
              >
                <dt>{field.label}</dt>
                <dd key={filled ? "filled" : "value"}>
                  {visible ? (
                    <>
                      {filled ? (
                        <UserRoundCheck
                          size={13}
                          className="mailbox-origin"
                          aria-label="von deinem Team"
                        />
                      ) : (
                        <Origin
                          size={13}
                          className="mailbox-origin"
                          aria-label={originNames[field.origin]}
                        />
                      )}
                      {filled ? field.sent : field.value}
                    </>
                  ) : (
                    "…"
                  )}
                </dd>
              </div>
            );
          })}
          {positions ? (
            <div data-visible={complete || undefined}>
              <dt>Summe</dt>
              <dd>
                {complete
                  ? `${euro.format(net * (1 + vatRate))} brutto${
                      isSent
                        ? ""
                        : hasOpen
                          ? " · ohne offene Position"
                          : hasSuggestions
                            ? " · ohne Vorschläge"
                            : ""
                    }`
                  : "…"}
              </dd>
            </div>
          ) : null}
        </dl>
        <p className="mailbox-legend">
          {usedOrigins.map((origin) => {
            const Origin = originIcons[origin];
            return (
              <span key={origin}>
                <Origin size={13} aria-hidden="true" /> {originNames[origin]}
              </span>
            );
          })}
          <span>
            <i aria-hidden="true" /> noch offen
          </span>
          {isSent ? (
            <span className="mailbox-legend-team">
              <UserRoundCheck size={13} aria-hidden="true" /> von deinem Team
            </span>
          ) : null}
        </p>
      </div>
    </div>
  );

  return (
    <section
      id={set.id}
      className="overview mailbox-story quote-story"
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
          <FileClock size={20} aria-hidden="true" />
          <div>
            <strong>Ohne Assistent</strong>
            <p>{quoteStory.without}</p>
          </div>
        </div>
        <div className="story-compare-item" data-tone="with">
          <FileCheck2 size={20} aria-hidden="true" />
          <div>
            <strong>Mit Assistent</strong>
            <p>{quoteStory.with}</p>
          </div>
        </div>
      </div>

      <div className="story-controls">
        <span className="story-example">
          <strong>
            Beispiel {index + 1} von {cases.length} · {item.headline}
          </strong>
          <span>Anderes Angebot in der Liste anklicken.</span>
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
