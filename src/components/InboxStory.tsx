import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import {
  BookOpen,
  Check,
  CheckCheck,
  ClipboardList,
  FileImage,
  FileText,
  ListEnd,
  Mail,
  MailOpen,
  MailWarning,
  Pause,
  PenLine,
  Play,
  RotateCcw,
  ScanText,
  Send,
  Siren,
  SkipForward,
  Sparkles,
  UserRoundCheck,
  UserRoundSearch,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { OverviewFlow } from "./OverviewFlow";
import { FormWindowIcon } from "./FormWindowIcon";
import { inboxStory } from "../inboxStory";
import type { InboxCase, InboxOrigin, InboxStepKind } from "../inboxStory";
import type { OverviewSet } from "../overviewFlows";
import { useMediaQuery } from "../lib/useMediaQuery";

type Status = "idle" | "playing" | "paused" | "done" | "sent";
type View = "mail" | "assistant" | "result";

const { cases } = inboxStory;

// Ab hier zeigt die Bühne eine Spalte mit Umschalter statt drei Spalten.
const TABBED_QUERY = "(max-width: 1100px)";
const STEP_MS = 1700;
const paragraphTime = (text: string) => 700 + text.length * 18;

const stepIcons: Record<InboxStepKind, LucideIcon> = {
  read: ScanText,
  crm: UserRoundSearch,
  docs: BookOpen,
  urgent: Siren,
  write: PenLine,
};
const originIcons: Record<InboxOrigin, LucideIcon> = {
  mail: Mail,
  crm: UserRoundSearch,
};
const originNames: Record<InboxOrigin, string> = {
  mail: "aus der Anfrage",
  crm: "aus deiner Kundenverwaltung",
};
const views: { id: View; label: string }[] = [
  { id: "mail", label: "Anfrage" },
  { id: "assistant", label: "Assistent" },
  { id: "result", label: "Entwurf" },
];

// Posteingang-Demo in Leserichtung: Mail, Assistent, Ergebnis für das Team.
export function InboxStory({ set }: { set: OverviewSet }) {
  const reduced = !!useReducedMotion();
  const tabbed = useMediaQuery(TABBED_QUERY);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<Status>(reduced ? "done" : "idle");
  // Fortschritt: erst die Schritte des Assistenten, dann die Absätze
  const [beat, setBeat] = useState(0);
  const [finished, setFinished] = useState<Set<string>>(() => new Set());
  const [sent, setSent] = useState<Set<string>>(() => new Set());
  const [manualView, setManualView] = useState<View | null>(null);
  const [technicalOpen, setTechnicalOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const autoStarted = useRef(false);

  const item = cases[index];
  const paragraphs = item.draft.paragraphs;
  // Der letzte Schritt ("Schreibt den Entwurf") bleibt aktiv, während die
  // Absätze erscheinen, und ist erst am Ende erledigt.
  const writeAt = item.steps.length - 1;
  const total = writeAt + paragraphs.length;
  const complete = status === "done" || status === "sent";
  const progress = complete ? total : beat;
  const stepsDone = complete ? item.steps.length : Math.min(progress, writeAt);
  const shownParagraphs = Math.max(0, progress - writeAt);
  const working = status === "playing" || status === "paused";

  useEffect(() => {
    if (status !== "playing") return;
    if (beat >= total) {
      setStatus("done");
      return;
    }
    const delay =
      beat < writeAt ? STEP_MS : paragraphTime(paragraphs[beat - writeAt].text);
    const timer = window.setTimeout(() => setBeat(beat + 1), delay);
    return () => window.clearTimeout(timer);
  }, [status, beat, total, writeAt, paragraphs]);

  useEffect(() => {
    if (complete) setFinished((previous) => new Set(previous).add(item.id));
  }, [complete, item.id]);

  // Startet einmal von selbst, sobald die Bühne gut im Blick ist.
  useEffect(() => {
    const stage = stageRef.current;
    if (reduced || !stage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || autoStarted.current) return;
        autoStarted.current = true;
        setStatus((current) => (current === "idle" ? "playing" : current));
      },
      { rootMargin: "0px 0px -35% 0px" },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, [reduced]);

  // Schmale Bildschirme: die sichtbare Spalte folgt dem Ablauf.
  const autoView: View =
    complete || (working && progress >= writeAt)
      ? "result"
      : working && stepsDone > 0
        ? "assistant"
        : "mail";
  useEffect(() => setManualView(null), [autoView, index]);
  const view = manualView ?? autoView;

  const play = (next: number) => {
    autoStarted.current = true;
    setIndex(next);
    setBeat(0);
    setSent((previous) => {
      const copy = new Set(previous);
      copy.delete(cases[next].id);
      return copy;
    });
    setStatus(reduced ? "done" : "playing");
  };
  const primary = () => {
    autoStarted.current = true;
    if (status === "idle") setStatus("playing");
    else if (complete) play(index);
    else setStatus(status === "playing" ? "paused" : "playing");
  };
  const showAll = () => {
    autoStarted.current = true;
    setStatus("done");
  };
  const send = () => {
    setSent((previous) => new Set(previous).add(item.id));
    setStatus("sent");
  };

  // Dringende Mails rutschen nach oben, sobald der Assistent sie erkannt hat.
  const urgentStep = item.steps.findIndex((step) => step.kind === "urgent");
  const pinned = (entry: InboxCase) =>
    !!entry.urgent &&
    (finished.has(entry.id) ||
      (entry.id === item.id && urgentStep >= 0 && stepsDone > urgentStep));
  const inbox = [...cases].sort(
    (a, b) => Number(pinned(b)) - Number(pinned(a)),
  );
  const order = inbox.map((entry) => entry.id).join();

  // Umsortieren sanft zeigen: alte Position merken, neue messen und den
  // Unterschied per Transform zurückgleiten lassen.
  const rowRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const rowTops = useRef<Record<string, number>>({});
  useLayoutEffect(() => {
    const rows = Object.entries(rowRefs.current);
    rows.forEach(([id, row]) => {
      if (!row) return;
      const top = row.offsetTop;
      const previous = rowTops.current[id];
      rowTops.current[id] = top;
      if (reduced || previous === undefined || previous === top) return;
      row.animate(
        [
          { transform: `translateY(${previous - top}px)` },
          { transform: "translateY(0)" },
        ],
        { duration: 500, easing: "ease-in-out" },
      );
    });
  }, [order, reduced]);

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

  const mailColumn = (
    <div className="mailbox-column" data-view="mail">
      <ColumnLabel number={1}>Die Anfrage kommt rein</ColumnLabel>
      <div className="mailbox-panel">
        <ul className="mailbox-list" aria-label="Eingang, Beispielanfragen">
          {inbox.map((entry) => {
            const position = cases.indexOf(entry);
            const active = position === index;
            const [tag, tone] = sent.has(entry.id)
              ? ["Beantwortet", "sent"]
              : finished.has(entry.id) && !(active && working)
                ? entry.urgent
                  ? ["Dringend · Entwurf bereit", "urgent"]
                  : ["Entwurf bereit", "ready"]
                : active && working
                  ? pinned(entry)
                    ? ["Dringend", "urgent"]
                    : ["wird bearbeitet …", "working"]
                  : ["Neu", "new"];
            return (
              <li
                key={entry.id}
                ref={(row) => {
                  rowRefs.current[entry.id] = row;
                }}
              >
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
                      <Channel form={!!entry.form} />
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
              Von: <strong>{item.from}</strong>
              {item.form
                ? " über dein Kontaktformular"
                : " per E-Mail"}{" "}
              · heute {item.time}
            </span>
          </header>
          {item.form ? (
            <dl className="mailbox-form">
              {item.form.map((field) => (
                <div key={field.label}>
                  <dt>{field.label}</dt>
                  <dd>
                    <Marked text={field.value} marks={item.marks} />
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            item.body?.map((text) => (
              <p key={text}>
                <Marked text={text} marks={item.marks} />
              </p>
            ))
          )}
          {item.attachment ? (
            <span className="mailbox-attachment">
              <FileImage size={15} aria-hidden="true" />
              {item.attachment}
            </span>
          ) : null}
        </article>
      </div>
      <p className="mailbox-hint">
        <span className="mailbox-hint-mark" aria-hidden="true" />
        Markiert: Was der Assistent aus der Anfrage übernimmt.
      </p>
    </div>
  );

  const assistantColumn = (
    <div className="mailbox-column" data-view="assistant">
      <ColumnLabel number={2}>Der Assistent arbeitet</ColumnLabel>
      <div className="mailbox-assistant" data-status={status}>
        <div className="mailbox-assistant-head">
          <span className="mailbox-assistant-icon" aria-hidden="true">
            <Sparkles size={18} />
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
                    <span className="mailbox-step-result">
                      {step.kind === "docs" ? (
                        <FileText size={13} aria-hidden="true" />
                      ) : null}
                      {step.result}
                    </span>
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
        data-state={status === "sent" ? "sent" : complete ? "ready" : undefined}
        aria-label="Antwortentwurf"
      >
        <div className="mailbox-draft-head">
          <strong>Antwortentwurf</strong>
          {item.urgent && pinned(item) ? (
            <span className="mailbox-draft-chip" data-tone="urgent">
              Dringend
            </span>
          ) : null}
          <span
            className="mailbox-draft-chip"
            data-tone={
              status === "sent" ? "sent" : complete ? "ready" : undefined
            }
          >
            {status === "sent"
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
              ? "Hier entsteht gleich die Antwort."
              : "Der Assistent sammelt noch Informationen …"}
          </p>
        ) : (
          <div className="mailbox-draft-body">
            <p>{item.draft.salutation}</p>
            {paragraphs.slice(0, shownParagraphs).map((paragraph) =>
              paragraph.team ? (
                status === "sent" ? (
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
                <p key={paragraph.text}>
                  {paragraph.text}
                  {paragraph.source ? (
                    <span className="mailbox-source">
                      <FileText size={12} aria-hidden="true" />
                      aus deinen Unterlagen: {paragraph.source}
                    </span>
                  ) : null}
                </p>
              ),
            )}
            {complete ? (
              <p className="mailbox-draft-closing">{inboxStory.closing}</p>
            ) : null}
          </div>
        )}
        {status === "done" ? (
          <div className="mailbox-draft-actions">
            <span>Prüfen, Orange ergänzen, absenden:</span>
            <button type="button" className="mailbox-send" onClick={send}>
              <Send size={16} aria-hidden="true" />
              Prüfen &amp; senden
            </button>
          </div>
        ) : status === "sent" ? (
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
            {status === "sent"
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
            const filled = status === "sent" && !!field.sent;
            const Origin = originIcons[field.origin];
            return (
              <div
                key={field.label}
                data-visible={visible || undefined}
                data-open={(visible && field.open && !filled) || undefined}
                data-urgent={(visible && field.urgent) || undefined}
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
        </dl>
        <p className="mailbox-legend">
          <span>
            <Mail size={13} aria-hidden="true" /> aus der Anfrage
          </span>
          <span>
            <UserRoundSearch size={13} aria-hidden="true" /> aus der
            Kundenverwaltung
          </span>
          <span>
            <i aria-hidden="true" /> noch offen
          </span>
          {status === "sent" ? (
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
          <span>Andere Mail im Posteingang anklicken.</span>
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
              Nächste Mail
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
                  data-active={autoView === entry.id && working ? true : undefined}
                  onClick={() => setManualView(entry.id)}
                >
                  <span aria-hidden="true">{position + 1}</span>
                  {entry.label}
                </button>
              ))}
            </div>
            {view === "mail"
              ? mailColumn
              : view === "assistant"
                ? assistantColumn
                : resultColumn}
          </>
        ) : (
          <>
            {mailColumn}
            {assistantColumn}
            {resultColumn}
          </>
        )}
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

// Eingangsweg einer Anfrage: E-Mail oder Kontaktformular der Homepage
function Channel({ form }: { form: boolean }) {
  return (
    <span className="mailbox-channel" data-channel={form ? "form" : "mail"}>
      {form ? <FormWindowIcon size={12} strokeWidth={2} /> : (
        <Mail size={12} aria-hidden="true" />
      )}
      {form ? "Formular" : "E-Mail"}
    </span>
  );
}

function ColumnLabel({
  number,
  children,
}: {
  number: number;
  children: ReactNode;
}) {
  return (
    <span className="mailbox-column-label">
      <span aria-hidden="true">{number}</span>
      {children}
    </span>
  );
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Hebt die Textstellen hervor, die der Assistent übernimmt. Die Markierung
// erscheint per CSS nacheinander, sobald die Mail data-marked trägt.
function Marked({ text, marks }: { text: string; marks: string[] }) {
  const pattern = new RegExp(`(${marks.map(escape).join("|")})`);
  return text.split(pattern).map((part, position) =>
    marks.includes(part) ? (
      <mark
        key={position}
        style={{ transitionDelay: `${marks.indexOf(part) * 160}ms` }}
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
