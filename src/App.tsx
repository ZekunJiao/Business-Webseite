import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Mail,
  FilePenLine,
  UserRoundCheck,
  Play,
  Pause,
  Check,
  ChevronDown,
  BookOpen,
  CircleHelp,
  ArrowUpRight,
  LibraryBig,
  Inbox,
  Folder,
  X,
  Sparkles,
  ContactRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { scenarios, sources } from "./data";
import { DraftWriter } from "./components/DraftWriter";
import { KnowledgeScan } from "./components/KnowledgeScan";
import type { ScanState } from "./components/KnowledgeScan";
import { customerExtractions, initialExtraction } from "./customerExtraction";
import { CustomerConnections } from "./components/CustomerConnections";
import { CustomerWorkspace } from "./components/CustomerWorkspace";
import { MailArrival } from "./components/MailArrival";
import { SourceMatchStamp } from "./components/SourceMatchStamp";
import { ClickGuide } from "./components/ClickGuide";
import type { GuideTarget } from "./components/ClickGuide";
import type { ScenarioId } from "./data";
function crmCopy(text: string, fragments: string[][]) {
  const parts: ReactNode[] = [];
  let offset = 0;
  for (const [id, quote] of fragments) {
    const start = text.indexOf(quote, offset);
    if (start < 0) continue;
    parts.push(text.slice(offset, start));
    parts.push(
      <span key={start} className="crm-source-fragment" data-crm-source={id}>
        {quote}
      </span>,
    );
    offset = start + quote.length;
  }
  parts.push(text.slice(offset));
  return parts;
}
type AppNode = "mailbox" | "knowledge" | "crm" | "draft";
const stageTitles = [
  "E-Mail auswählen",
  "Kundenwissen abgleichen",
  "Antwort vorbereiten",
  "Entwurf prüfen",
];
function OutlookLogo() {
  return (
    <img
      className="outlook-logo"
      src="/assets/outlook.svg"
      alt="Microsoft Outlook"
      width="56"
      height="52"
    />
  );
}
function MapConnections({
  step,
  destination,
  playing,
  unknown,
  reduced,
}: {
  step: number;
  destination: AppNode;
  playing: boolean;
  unknown: boolean;
  reduced: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [paths, setPaths] = useState<
    { id: string; d: string; active: boolean; index: number }[]
  >([]);
  useLayoutEffect(() => {
    const svg = ref.current,
      parent = svg?.parentElement;
    if (!svg || !parent) return;
    let frame = 0;
    const measure = () => {
      const box = parent.getBoundingClientRect();
      const anchor = (id: string, side: "left" | "right") => {
        const el = parent.querySelector(`.map-node.${id} .app-tile`);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: (side === "right" ? r.right : r.left) - box.left,
          y: r.top + r.height / 2 - box.top,
        };
      };
      const result = [];
      for (const branch of ["knowledge", "crm"])
        for (const index of [0, 1]) {
          const from = anchor(index === 0 ? "mailbox" : branch, "right"),
            to = anchor(index === 0 ? branch : "draft", "left");
          if (from && to) {
            const mid = (from.x + to.x) / 2;
            result.push({
              id: branch + index,
              d: `M${from.x} ${from.y} H${mid} V${to.y} H${to.x}`,
              active: branch === destination,
              index,
            });
          }
        }
      setPaths(result);
    };
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    observer.observe(parent);
    parent
      .querySelectorAll(".map-node,.app-tile")
      .forEach((e) => observer.observe(e));
    measure();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [destination]);
  return (
    <svg ref={ref} className="branch-wires" aria-hidden="true">
      {paths.map((p) => (
        <g key={p.id}>
          <path
            className={`wire-base ${p.active ? "chosen-wire" : "unused-wire"}`}
            d={p.d}
          />
          <motion.path
            d={p.d}
            className="wire-active"
            initial={false}
            animate={{
              pathLength:
                p.active && step > p.index && !(unknown && p.index === 1)
                  ? 1
                  : 0,
            }}
            transition={{ duration: reduced ? 0 : 0.5 }}
          />
          {playing && !reduced && p.active && step === p.index && (
            <motion.path
              d={p.d}
              className="wire-pulse"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </g>
      ))}
    </svg>
  );
}
export function EmailWorkflowDemo({
  initialScenario = "partial",
}: {
  initialScenario?: ScenarioId;
}) {
  const [scenario, setScenario] = useState<ScenarioId>(initialScenario),
    [step, setStep] = useState(0),
    [playbackRun, setPlaybackRun] = useState(0),
    [playing, setPlaying] = useState(false),
    [runStarted, setRunStarted] = useState(false),
    [opened, setOpened] = useState<AppNode[]>([]),
    [source, setSource] = useState<number | null>(null),
    [selected, setSelected] = useState<number | null>(null);
  const [mailArrival, setMailArrival] = useState<
    "idle" | "manual" | "playback"
  >("idle");
  const [extraction, setExtraction] = useState(initialExtraction);
  const [inspectedField, setInspectedField] = useState<string | null>(null);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const mailboxOpen = opened.includes("mailbox");
  const [scan, setScan] = useState<ScanState>({
    phase: "mail",
    index: -1,
    matched: 0,
  });
  const reduced = useReducedMotion(),
    data = scenarios[scenario],
    unknown = scenario === "unknown",
    last = unknown ? 1 : 3,
    isRequest = scenario !== "complete",
    destination: AppNode = isRequest ? "crm" : "knowledge";
  const knowledgeFiltered =
    !isRequest && (step > 1 || (step === 1 && scan.phase === "done"));
  const relevantSourceCount = new Set(
    data.answerSources.filter((i) => i !== null),
  ).size;
  const guideTarget: GuideTarget =
    playing || mailArrival !== "idle"
      ? null
      : !mailboxOpen
        ? "mailbox"
        : !runStarted
          ? "example"
          : step < last
            ? "resume"
            : "again";
  const guideScenario: ScenarioId =
    guideTarget === "again"
      ? scenario === "partial"
        ? "complete"
        : "partial"
      : scenario;
  const scanStatus =
    step === 2
      ? "Schreibe Antwortentwurf aus Betriebswissen"
      : step > 2 || scan.phase === "done"
        ? "Passende Quellen gefunden"
        : scan.phase === "mail"
          ? "Untersuche Mail-Inhalt"
          : scan.phase === "knowledge"
            ? "Durchsuche Betriebswissen"
            : "Ordne passende Quellen zu";
  const reveal = (id: AppNode) =>
    setOpened((v) => (v.includes(id) ? v : [...v, id]));
  useEffect(() => {
    if (!playing) return;
    if (step === 0) {
      if (mailArrival !== "idle") return;
      if (!mailboxOpen) {
        setMailArrival("playback");
        return;
      }
    }
    const id: AppNode =
      step === 0 ? "mailbox" : step === 1 ? destination : "draft";
    setOpened((v) => (v.includes(id) ? v : [...v, id]));
    if (step >= last) {
      setPlaying(false);
      return;
    }
    if (step === 1 && !isRequest) {
      setOpened((v) => [...new Set<AppNode>([...v, "mailbox", "knowledge"])]);
      return;
    }
    if (step === 1 && scenario === "partial") return;
    if (step === 2 && !isRequest) return;
    const timer = setTimeout(
      () => setStep((s) => s + 1),
      step === 0 ? 6000 : 4500,
    );
    return () => clearTimeout(timer);
  }, [
    playing,
    step,
    last,
    destination,
    playbackRun,
    isRequest,
    mailArrival,
    mailboxOpen,
  ]);
  const choose = (id: ScenarioId, autoplay = false) => {
    setRunStarted(autoplay);
    setMailArrival("idle");
    setPlaying(autoplay);
    if (autoplay) setPlaybackRun((run) => run + 1);
    setExtraction(initialExtraction);
    setInspectedField(null);
    setHoveredField(null);
    setScenario(id);
    setStep(0);
    setSource(null);
    setSelected(null);
    setScan({ phase: "mail", index: -1, matched: 0 });
    setOpened(["mailbox"]);
  };
  const playExample = (id: ScenarioId) => {
    if (id === scenario && runStarted && step < last) {
      setPlaying((p) => !p);
    } else {
      choose(id, true);
    }
  };
  const toggle = (id: AppNode) => {
    setPlaying(false);
    if (id === "mailbox" && !mailboxOpen) {
      setMailArrival((current) => (current === "idle" ? "manual" : "idle"));
      return;
    }
    setMailArrival("idle");
    setOpened((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  };
  const inspect = (i: number) => {
    setSelected(i);
    setPlaying(false);
    reveal(destination);
  };
  const animate = {
    initial: reduced ? false : { opacity: 0, y: -6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0 },
    transition: { duration: reduced ? 0 : 0.2 },
  } as const;
  function node(
    id: AppNode,
    label: string,
    icon: ReactNode,
    content: ReactNode,
  ) {
    const expanded = opened.includes(id),
      active =
        (id === "mailbox" && step === 0) ||
        (id === destination && step === 1) ||
        (id === "draft" && step >= 2);
    return (
      <div
        className={`map-node ${id} ${(id === "crm" || id === "knowledge") && id !== destination ? "alternative-node" : ""} ${active ? "current" : ""} ${expanded ? "expanded" : ""}`}
      >
        <div className="node-anchor">
          {(id === "crm" || id === "knowledge") && (
            <span className="branch-label">
              {id === "crm" ? "Anfrage" : "Allgemeine Frage"}
            </span>
          )}
          <Button
            variant="outline"
            className="app-tile"
            onClick={() => toggle(id)}
            aria-label={`${label} ${expanded ? "zuklappen" : "aufklappen"}`}
            aria-expanded={expanded}
            aria-busy={
              id === "mailbox" && mailArrival !== "idle" ? true : undefined
            }
            aria-controls={`${id}-content`}
          >
            {id !== "mailbox" && <span className="port port-in" />}
            {icon}
            {id === "mailbox" && mailArrival !== "idle" && (
              <MailArrival
                running={mailArrival === "manual" || playing}
                reduced={!!reduced}
                onComplete={() => {
                  setMailArrival("idle");
                  reveal("mailbox");
                }}
              />
            )}
            <span className="expand-indicator">
              <ChevronDown size={13} />
            </span>
            {id !== "draft" && <span className="port port-out" />}
          </Button>
          <span className="app-name">{label}</span>
          <span className="app-caption">
            {id === "mailbox"
              ? "Microsoft Outlook"
              : id === "crm"
                ? "Excel · Handwerkersoftware · CRM"
                : id === "knowledge"
                  ? "Interne Dokumente"
                  : "Microsoft Outlook"}
          </span>
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div
              {...animate}
              id={`${id}-content`}
              className={`app-window ${id}-window`}
            >
              <div className="app-titlebar">
                {id === "crm" ? (
                  <ContactRound size={16} />
                ) : id === "knowledge" ? (
                  <LibraryBig size={16} />
                ) : (
                  <img
                    src="/assets/outlook.svg"
                    width="20"
                    height="19"
                    alt=""
                  />
                )}
                <strong>
                  {id === "crm"
                    ? "Kunden & Aufträge"
                    : id === "knowledge"
                      ? "Betriebswissen"
                      : "Outlook"}
                </strong>
                <span>
                  {id === "mailbox"
                    ? "Posteingang"
                    : id === "draft"
                      ? "Entwürfe"
                      : ""}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="close-window"
                  aria-label={`${label} schließen`}
                  onClick={() => toggle(id)}
                >
                  <X size={14} />
                </Button>
              </div>
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
  return (
    <section className="demo map-demo" aria-label="Interaktive E-Mail-Demo">
      <div className={`map-canvas ${playing ? "is-playing" : ""}`}>
        <ClickGuide
          target={guideTarget}
          example={guideScenario}
          reduced={!!reduced}
          onActivate={() =>
            guideTarget === "mailbox"
              ? toggle("mailbox")
              : playExample(guideScenario)
          }
        />
        {runStarted && (
          <div className="map-status" role="status">
            <span className={`status-dot ${playing ? "running" : ""}`} />
            {unknown && step === 1
              ? "Kundenzuordnung offen"
              : step === 1
                ? isRequest
                  ? scenario === "partial"
                    ? extraction.phase === "done"
                      ? "Angaben übernommen"
                      : customerExtractions[extraction.index].status
                    : "Kunde und Vorgang zuordnen"
                  : "Betriebswissen nachschlagen"
                : stageTitles[step]}
            <span className="map-status-detail">
              {playing
                ? "Wird verarbeitet"
                : step < last
                  ? "Pausiert"
                  : unknown
                    ? "Manuelle Prüfung"
                    : "Abgeschlossen"}
            </span>
          </div>
        )}
        {!isRequest && step >= 1 && (
          <div className="scan-description" role="status">
            <Sparkles size={14} />
            {scanStatus}
            {!playing && step === 1 && <span> · pausiert</span>}
          </div>
        )}
        {scenario === "partial" && step >= 1 && (
          <CustomerConnections
            key={`extraction-${playbackRun}`}
            running={playing && step === 1}
            finished={step > 1}
            reduced={!!reduced}
            inspected={hoveredField ?? inspectedField}
            onProgress={setExtraction}
            onComplete={() => setStep(2)}
          />
        )}
        {!isRequest && step >= 1 && (
          <KnowledgeScan
            key={`${scenario}-${playbackRun}`}
            running={playing && step === 1}
            finished={step > 1}
            reduced={!!reduced}
            matches={data.answerSources}
            status={`${!playing && step === 1 ? "Pausiert · " : ""}${scanStatus}`}
            onProgress={setScan}
            onComplete={() => setStep(2)}
          />
        )}
        {!isRequest && step >= 2 && (
          <DraftWriter
            key={`writer-${scenario}-${playbackRun}`}
            running={playing && step === 2}
            finished={step > 2}
            reduced={!!reduced}
            answers={data.answers}
            matches={data.answerSources}
            onComplete={() => setStep(3)}
          />
        )}
        <div className="map-layout">
          <MapConnections
            step={step}
            destination={destination}
            playing={playing}
            unknown={unknown}
            reduced={!!reduced}
          />
          {node(
            "mailbox",
            "Posteingang",
            <OutlookLogo />,
            <>
              <div className="outlook-folder">
                <Inbox size={15} />
                <strong>Posteingang</strong>
                <span>3 Beispiele</span>
              </div>
              <div className="inbox-guide-space" aria-hidden="true" />
              <div className="mail-list" aria-label="Beispielmails">
                {(Object.keys(scenarios) as ScenarioId[]).map((id, i) => (
                  <div
                    key={id}
                    data-example={id}
                    className={`inbox-mail-row ${id === scenario ? "chosen" : ""}`}
                  >
                    <button
                      className={`inbox-mail ${id === scenario ? "chosen" : ""}`}
                      aria-pressed={id === scenario}
                      onClick={() => choose(id)}
                    >
                      <span className="unread-dot" />
                      <span className="mail-list-copy">
                        <span className="mail-list-top">
                          <strong>{scenarios[id].sender}</strong>
                          <time>{["09:41", "09:28", "08:56"][i]}</time>
                        </span>
                        <span className="mail-subject">
                          {scenarios[id].subject}
                        </span>
                        <span className="mail-preview">
                          {scenarios[id].questions[0]}
                        </span>
                      </span>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`mail-play-button ${!playing ? "next-action" : ""}`}
                      aria-label={`${id === scenario && runStarted && step < last ? (playing ? "Beispiel pausieren" : "Beispiel fortsetzen") : "Beispiel abspielen"}: ${scenarios[id].subject}`}
                      title={
                        id === scenario && playing
                          ? "Beispiel pausieren"
                          : "Beispiel für diese Mail starten"
                      }
                      onClick={() => playExample(id)}
                    >
                      {id === scenario && playing ? (
                        <Pause size={15} />
                      ) : (
                        <Play size={15} />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
              <div
                data-mail-scan-area
                onMouseOver={(event) => {
                  if (scenario !== "partial") return;
                  const source = (
                    event.target as HTMLElement
                  ).closest<HTMLElement>("[data-crm-source]");
                  const index = customerExtractions.findIndex((item) =>
                    item.sources.some((id) => id === source?.dataset.crmSource),
                  );
                  if (index >= 0 && (step > 1 || extraction.completed > index))
                    setHoveredField(customerExtractions[index].id);
                }}
                onMouseOut={() =>
                  scenario === "partial" && setHoveredField(null)
                }
                className={`mail-reader ${!isRequest && step === 1 && scan.phase === "mail" ? "scan-surface-active" : ""}`}
              >
                <div className="reader-meta">
                  <span className="avatar">{data.initials}</span>
                  <div>
                    <strong>{data.sender}</strong>
                    <small>{data.email}</small>
                  </div>
                </div>
                <h3>{data.subject}</h3>
                <p data-mail-intro>
                  {scenario === "partial"
                    ? crmCopy(data.intro, [
                        ["plant", "Luft/Wasser-Wärmepumpe am Musterweg 14"],
                        [
                          "plant",
                          "Baujahr: 2021, das genaue Modell muss ich nachsehen.",
                        ],
                      ])
                    : data.intro}
                </p>
                {data.questions.map((q, i) => {
                  const sourceIndex = data.answerSources[i];
                  const matchedArticle =
                    sourceIndex == null ? null : sources[sourceIndex];
                  return (
                    <button
                      key={q}
                      data-mail-question={i}
                      className={`mail-question ${selected === i ? "linked" : ""} ${!isRequest && step >= 1 && (step > 1 || scan.matched > i) ? "ai-matched" : ""}`}
                      onClick={() => inspect(i)}
                    >
                      <span className="mail-question-copy">
                        {scenario === "partial"
                          ? crmCopy(
                              q,
                              i === 0
                                ? [
                                    [
                                      "request",
                                      "Bitte senden Sie uns ein Wartungsangebot.",
                                    ],
                                    [
                                      "photo",
                                      "Ein Typenschildfoto reiche ich bei Bedarf nach.",
                                    ],
                                  ]
                                : i === 1
                                  ? [["noise", q]]
                                  : i === 2
                                    ? [["time", q]]
                                    : [],
                            )
                          : q}
                      </span>
                      {!isRequest &&
                        step >= 1 &&
                        matchedArticle &&
                        (step > 1 || scan.matched > i) && (
                          <SourceMatchStamp
                            concern={i + 1}
                            article={matchedArticle.title}
                            running={playing}
                            reduced={!!reduced}
                          />
                        )}
                    </button>
                  );
                })}
                <p>
                  Vielen Dank und freundliche Grüße
                  <br />
                  {data.sender}
                </p>
              </div>
            </>,
          )}
          <div className="branch-stack">
            {node(
              "knowledge",
              "Wissensbasis",
              <span className="knowledge-symbol">
                <LibraryBig size={43} strokeWidth={1.4} />
              </span>,
              <>
                {isRequest && (
                  <div className="branch-explanation">
                    Alternative für allgemeine Fragen. Diese Anfrage läuft über
                    die Kundenverwaltung.
                  </div>
                )}
                <div className="knowledge-folder">
                  <Folder size={16} />
                  <span>Freigegebenes Betriebswissen</span>
                  <Badge variant="outline">{sources.length} Dokumente</Badge>
                </div>
                <div
                  data-knowledge-scan-area
                  className={`knowledge-documents ${!isRequest && step === 1 && scan.phase === "knowledge" ? "scan-surface-active" : ""}`}
                >
                  {sources.map((s, i) => {
                    const concernIndex = data.answerSources.indexOf(i);
                    const matched =
                      !isRequest &&
                      step >= 1 &&
                      concernIndex >= 0 &&
                      (step > 1 || scan.matched > concernIndex);
                    return (
                      <div
                        data-knowledge-source={i}
                        className={`source-document ${matched ? "ai-matched" : ""} ${knowledgeFiltered && !matched ? "source-not-relevant" : ""} ${selected !== null && data.answerSources[selected] === i ? "linked" : ""}`}
                        key={s.title}
                      >
                        <button
                          onClick={() => {
                            setSource(source === i ? null : i);
                            setSelected(concernIndex < 0 ? null : concernIndex);
                            setPlaying(false);
                          }}
                          aria-expanded={source === i}
                        >
                          <span className="document-icon">
                            <BookOpen size={19} />
                          </span>
                          <span>
                            <strong>{s.title}</strong>
                            <small>
                              {matched
                                ? `Passt zu Anliegen ${concernIndex + 1}`
                                : knowledgeFiltered
                                  ? "Für diese Mail nicht benötigt"
                                  : "Interne Wissensquelle"}
                            </small>
                          </span>
                          <ChevronDown size={14} />
                        </button>
                        {source === i && (
                          <motion.p {...animate}>{s.excerpt}</motion.p>
                        )}
                      </div>
                    );
                  })}
                </div>
                {knowledgeFiltered && (
                  <div className="knowledge-filter-result" role="status">
                    <Check size={17} />
                    <div>
                      <strong>
                        {relevantSourceCount} von {sources.length} Dokumenten
                        relevant
                      </strong>
                      <span>
                        {sources.length - relevantSourceCount} weitere Dateien
                        für diese Mail nicht benötigt.
                      </span>
                    </div>
                  </div>
                )}
                <div className="app-footnote">
                  Quellen aufklappen und Informationen nachlesen.
                </div>
              </>,
            )}
            {node(
              "crm",
              "Kunden & Aufträge",
              <span className="crm-symbol">
                <ContactRound size={43} strokeWidth={1.4} />
                <span className="crm-folder-icon">
                  <Folder size={18} />
                </span>
              </span>,
              <>
                <div className="crm-section-heading">
                  <Folder size={16} />
                  <strong>Anfragen</strong>
                  <Badge variant="outline">
                    {isRequest && step >= 1 && !unknown
                      ? "1 neuer Vorgang"
                      : "Beispielansicht"}
                  </Badge>
                </div>
                {!isRequest ? (
                  <div className="draft-empty">
                    <ContactRound size={30} />
                    <h3>Alternative für Anfragen</h3>
                    <p>
                      Diese Mail ist eine allgemeine Frage. Sie nutzt die
                      Wissensbasis. Wähle eine Wartungsanfrage, um Kunden und
                      Vorgänge anzusehen.
                    </p>
                  </div>
                ) : unknown && step >= 1 ? (
                  <div className="knowledge-warning">
                    <CircleHelp size={18} />
                    <span>
                      Absender nicht eindeutig zugeordnet. Die Anfrage wird zur
                      manuellen Prüfung markiert; es entsteht kein automatischer
                      Entwurf.
                    </span>
                  </div>
                ) : (
                  <CustomerWorkspace
                    key={scenario}
                    processed={step >= 1}
                    extraction={
                      step > 1 || scenario !== "partial"
                        ? { ...extraction, completed: 4, phase: "done" }
                        : extraction
                    }
                    extracting={scenario === "partial" && step === 1}
                    running={playing}
                    inspected={hoveredField ?? inspectedField}
                    onSelectField={(id) =>
                      setInspectedField((current) =>
                        current === id ? null : id,
                      )
                    }
                    onHoverField={setHoveredField}
                    onInteract={() => setPlaying(false)}
                  />
                )}
                <div className="app-footnote">
                  Simulierte Kundenverwaltung · fiktive Daten
                </div>
              </>,
            )}
          </div>
          {node(
            "draft",
            "Antwortentwurf",
            <span className="draft-symbol">
              <OutlookLogo />
              <span>
                <FilePenLine size={18} />
              </span>
            </span>,
            <>
              {step >= 2 && !unknown ? (
                <>
                  <div className="draft-ribbon">
                    <FilePenLine size={15} />
                    <span>
                      {step === 3
                        ? "In Entwürfen gespeichert"
                        : isRequest
                          ? "Antwort vorbereitet"
                          : "AI schreibt den Entwurf …"}
                    </span>
                  </div>
                  <div className="draft-fields">
                    <div>
                      <span>An</span>
                      <strong>{data.email}</strong>
                    </div>
                    <div>
                      <span>Betreff</span>
                      <strong>AW: {data.subject}</strong>
                    </div>
                  </div>
                  <div className="draft-body">
                    <p>{data.salutation}</p>
                    {data.answers.map((answer, i) => (
                      <button
                        key={answer}
                        onClick={() => {
                          setSelected(i);
                          setPlaying(false);
                          reveal(destination);
                          const sourceIndex = data.answerSources[i];
                          if (!isRequest && sourceIndex != null)
                            setSource(sourceIndex);
                        }}
                        data-draft-answer={i}
                        className={`draft-answer ${data.openAnswerIndices.includes(i) ? "missing" : ""} ${selected === i ? "linked" : ""}`}
                      >
                        {!isRequest ? (
                          <span className="draft-writing-copy">
                            <span
                              className="draft-writing-space"
                              aria-hidden="true"
                            >
                              {answer}
                            </span>
                            <span
                              className="draft-writing-text"
                              data-draft-writing-text={i}
                              aria-hidden="true"
                            />
                            <span className="sr-only">{answer}</span>
                          </span>
                        ) : (
                          answer
                        )}
                      </button>
                    ))}
                    <p
                      style={
                        !isRequest && step === 2
                          ? { visibility: "hidden" }
                          : undefined
                      }
                    >
                      Freundliche Grüße
                      <br />
                      Ihr Serviceteam
                    </p>
                  </div>
                  <div
                    className="draft-review"
                    style={
                      !isRequest && step === 2
                        ? { visibility: "hidden" }
                        : undefined
                    }
                  >
                    <UserRoundCheck size={19} />
                    <div>
                      <strong>
                        {scenario === "partial"
                          ? `${data.openAnswerIndices.length} Ergänzungen offen`
                          : "Bereit für deine Prüfung"}
                      </strong>
                      <p>
                        {scenario === "partial"
                          ? "Technische Rückfrage und Angebot ergänzen, Antwort prüfen und selbst versenden."
                          : "Antwort prüfen und selbst versenden."}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="draft-empty">
                  <FilePenLine size={34} strokeWidth={1.3} />
                  <h3>
                    {unknown && step >= 1
                      ? "Zuordnung erforderlich"
                      : "Hier entsteht die Antwort"}
                  </h3>
                  <p>
                    {unknown && step >= 1
                      ? "Die Mail wurde zur manuellen Prüfung markiert. Es wurde kein Entwurf erstellt."
                      : "Öffne den Posteingang und starte ein Beispiel mit ▶ neben einer Mail."}
                  </p>
                </div>
              )}
            </>,
          )}
        </div>
        <div className="canvas-caption">
          <Sparkles size={14} />
          <span>
            Ein Klick auf ein Symbol öffnet das System. Die Linien zeigen den
            Weg der Informationen.
          </span>
        </div>
      </div>
      <div className="demo-bottom">
        <span>
          <CircleHelp size={15} />
          Anfragen zu Kunden und Vorgängen. Allgemeine Fragen zur Wissensbasis.
        </span>
        <span>Prüfung und Versand bleiben bei deinem Team.</span>
      </div>
    </section>
  );
}
export default function App() {
  return (
    <>
      <header className="site-header">
        <a href="#" className="wordmark">
          <span className="brand-mark">
            <Mail size={19} />
          </span>
          E-Mail-Assistenz
          <span className="header-tag">WORKFLOW-DEMO</span>
        </a>
        <a className="header-link" href="#workflow">
          Demo entdecken <ArrowUpRight size={16} />
        </a>
      </header>
      <main>
        <div className="hero">
          <div className="eyebrow hero-eyebrow">
            <span />
            WENIGER ROUTINE. MEHR ZEIT FÜRS HANDWERK.
          </div>
          <h1>
            Vom Posteingang
            <br />
            zum <span>Antwortentwurf.</span>
          </h1>
          <p>
            Kundenfragen verstehen. Vorhandenes Wissen nutzen.
            <br className="desktop-break" /> Antworten vorbereiten – mit deinem
            Team am Steuer.
          </p>
          <div className="hero-meta">
            <span>
              <Check size={15} />
              Nachvollziehbare Antworten
            </span>
            <span>
              <Check size={15} />
              Offene Punkte sichtbar
            </span>
            <span>
              <Check size={15} />
              Menschliche Prüfung
            </span>
          </div>
        </div>
        <div id="workflow">
          <EmailWorkflowDemo />
        </div>
        <footer>
          <span>Eine mögliche Lösung für wiederkehrende Kundenanfragen.</span>
          <span>Beispieldemo · Keine echten Kundendaten</span>
        </footer>
      </main>
    </>
  );
}
