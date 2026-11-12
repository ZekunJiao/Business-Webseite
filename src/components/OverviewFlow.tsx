import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import {
  // ArrowDown,  (nur für den ausgeblendeten Detaildemo-Link)
  Check,
  LibraryBig,
  Mail,
  Pause,
  Play,
  UserRound,
  UserRoundCheck,
} from "lucide-react";
import { Button } from "./ui/button";
import { aiActivityIcons } from "./AiSymbol";
import { FormWindowIcon } from "./FormWindowIcon";
import type { AiActivity } from "./AiSymbol";
import {
  channelNames,
  overviewCases,
  systemNames,
} from "../overviewFlows";
import type { OverviewCase } from "../overviewFlows";
import { integrations } from "../integrations";
import { useMediaQuery } from "../lib/useMediaQuery";
import {
  OVERVIEW_HOLD_MS,
  OVERVIEW_STEP_MS,
} from "../lib/demoTiming";

type NodeId = string;

// Kurze Zeile unter dem Assistenten: was er in diesem Schritt der Simulation
// tut. Der Text benennt die Handlung des jeweiligen Beispielfalls.
const assistantStatus = (
  item: OverviewCase,
  step: number,
  paused: boolean,
): string => {
  if (paused) return "pausiert";
  if (step === 1 || step === 2) return item.assistantStatus[step - 1];
  return step === 3 ? "fertig" : "";
};

// Statuszeile unter dem Eingangskanal: nur beim aktiven Kanal, über den ganzen
// Fall. Der andere Kanal bleibt leer (reservierte Höhe, nichts springt).
const channelStatus = (
  item: OverviewCase,
  channel: OverviewCase["channel"],
): string => {
  if (item.channel !== channel) return "";
  return channel === "form" ? "Formular ausgefüllt" : "E-Mail eingegangen";
};

// Kurze Zeile unter "Dein Team". Vor dem Ergebnis wartet das Team; sobald der
// Vorschlag da ist, steht der Haken am Symbol und der Fall-Text darunter.
const teamStatus = (
  item: OverviewCase,
  step: number,
  paused: boolean,
): string => {
  if (paused) return "pausiert";
  return step === 3 ? item.teamStatus : "wartet auf Vorschlag";
};

// Rechte Spalte: ein Eintrag je Handwerkersoftware aus src/integrations.ts,
// dazu "andere Programme" und das Betriebswissen. Das Betriebswissen ist
// kein Programm und steht deshalb hinter einem Trenner mit der Überschrift
// "Wissen".
const toolNodes = integrations.map((entry) => ({
  id: `tool:${entry.name}`,
  entry,
}));
const OTHER_NODE = "other";
const KNOWLEDGE_NODE = "knowledge";
const systemIds: NodeId[] = [
  ...toolNodes.map((node) => node.id),
  OTHER_NODE,
  KNOWLEDGE_NODE,
];
const edges: [NodeId, NodeId][] = [
  ["email", "assistant"],
  ["form", "assistant"],
  ...systemIds.flatMap((id): [NodeId, NodeId][] => [
    ["assistant", id],
    [id, "team"],
  ]),
];
const edgeKey = (from: NodeId, to: NodeId) => `${from}>${to}`;
const targetOf = (item: OverviewCase): NodeId =>
  item.system === "knowledge"
    ? KNOWLEDGE_NODE
    : (toolNodes.find((node) => node.entry.name === item.tool)?.id ??
      OTHER_NODE);
const segmentsOf = (item: OverviewCase) => [
  edgeKey(item.channel, "assistant"),
  edgeKey("assistant", targetOf(item)),
  edgeKey(targetOf(item), "team"),
];

// Schritte 0 bis 2 zeichnen je eine Linie, Schritt 3 hält das Ergebnis.
const CASE_MS = OVERVIEW_STEP_MS * 3 + OVERVIEW_HOLD_MS;
const TOTAL_MS = CASE_MS * overviewCases.length;
// Anteil eines Schritts, in dem die Linie gezeichnet wird.
const DRAW_SHARE = 0.75;
// Darunter ist zwischen den Spalten zu wenig Platz für Etiketten auf den Linien.
const NARROW_QUERY = "(max-width: 1320px)";

function locate(elapsed: number) {
  const t = elapsed % TOTAL_MS;
  const c = Math.floor(t / CASE_MS);
  const local = t - c * CASE_MS;
  const s = Math.min(3, Math.floor(local / OVERVIEW_STEP_MS));
  const p = s < 3 ? (local - s * OVERVIEW_STEP_MS) / OVERVIEW_STEP_MS : 1;
  return { c, s, p };
}
const ease = (t: number) => t * t * (3 - 2 * t);

const stepLabels = (item: OverviewCase) => [
  channelNames[item.channel],
  "Assistent",
  item.tool
    ? `${systemNames[item.system]} · ${item.tool}`
    : systemNames[item.system],
  "Dein Team",
];

function CaseSteps({
  item,
  active,
  label,
}: {
  item: OverviewCase;
  // Index des aktuellen Schritts; ohne Angabe sind alle Schritte gleich dargestellt.
  active?: number;
  label?: string;
}) {
  const labels = stepLabels(item);
  return (
    <ol className="overview-steps" aria-label={label}>
      {item.steps.map((step, i) => {
        const state =
          active === undefined
            ? "static"
            : i < active
              ? "done"
              : i === active
                ? "active"
                : "pending";
        return (
          <li key={i} data-state={state}>
            <span className="overview-step-marker" aria-hidden="true">
              {state === "done" ? <Check size={13} /> : i + 1}
            </span>
            <div>
              <strong>{labels[i]}</strong>
              <span>{step.text}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// Alle Fälle als Text: Ersatz bei reduzierter Bewegung und Textalternative.
function OverviewStatic() {
  return (
    <div className="overview-static">
      {overviewCases.map((item) => (
        <article key={item.id} className="overview-static-case">
          <h3>{item.headline}</h3>
          <CaseSteps item={item} />
        </article>
      ))}
    </div>
  );
}

function Node({
  id,
  name,
  caption,
  icon,
  tone,
  current,
  dim,
  activity,
  tileRef,
}: {
  id: NodeId;
  name: string;
  caption: string;
  icon: ReactNode;
  tone: string;
  current: boolean;
  dim: boolean;
  // Optional: Zustand für CSS, z. B. "waiting" beim Team.
  activity?: string;
  tileRef: (element: HTMLElement | null) => void;
}) {
  return (
    <div
      className={`overview-node ${tone}${current ? " current" : ""}${dim ? " dim" : ""}`}
      data-node={id}
      data-activity={activity}
    >
      <div className="overview-tile" ref={tileRef}>
        {icon}
      </div>
      <strong>{name}</strong>
      <span key={caption} className="overview-status-text">
        {caption}
      </span>
    </div>
  );
}

// Kachel der rechten Spalte: Logo oder Name statt Symbol mit Beschriftung.
function SystemTile({
  id,
  tone,
  current,
  dim,
  tileRef,
  status,
  children,
}: {
  id: NodeId;
  tone: string;
  current: boolean;
  dim: boolean;
  tileRef: (element: HTMLElement | null) => void;
  // Optionale Statuszeile unter dem Werkzeug, nur beim leuchtenden Werkzeug.
  status?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`overview-node system ${tone}${current ? " current" : ""}${dim ? " dim" : ""}`}
      data-node={id}
    >
      <div className="overview-tile" ref={tileRef}>
        {children}
        {status ? (
          <span key={status} className="overview-tool-status overview-status-text">
            {status}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function OverviewFlow() {
  const reduced = !!useReducedMotion();
  const narrow = useMediaQuery(NARROW_QUERY);
  const [pos, setPos] = useState({ c: 0, s: 0 });
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const tiles = useRef<Partial<Record<NodeId, HTMLElement | null>>>({});
  const baseRefs = useRef<Record<string, SVGPathElement | null>>({});
  const activeRefs = useRef<Record<string, SVGPathElement | null>>({});
  const lengths = useRef<Record<string, number>>({});
  const elapsed = useRef(0);
  const frame = useRef({ c: 0, s: 0, p: 0 });
  const drawn = !reduced && !narrow;
  const item = overviewCases[pos.c];

  // Setzt Linien und Etikett direkt, ohne React-Rendern pro Frame.
  const apply = useCallback((c: number, s: number, p: number) => {
    frame.current = { c, s, p };
    const segments = segmentsOf(overviewCases[c]);
    const draw = ease(Math.min(1, p / DRAW_SHARE));
    for (const key of Object.keys(activeRefs.current)) {
      const element = activeRefs.current[key];
      const length = lengths.current[key];
      if (!element || !length) continue;
      const index = segments.indexOf(key);
      let progress = 0;
      if (index !== -1)
        progress = s === 3 || index < s ? 1 : index === s ? draw : 0;
      element.style.strokeDashoffset = String(length * (1 - progress));
    }
    const chip = chipRef.current;
    if (!chip) return;
    const element = s < 3 ? activeRefs.current[segments[s]] : null;
    const length = s < 3 ? lengths.current[segments[s]] : 0;
    if (!element || !length) {
      chip.style.opacity = "0";
      return;
    }
    // Das Etikett läuft nur im freien Stück zwischen den Kacheln entlang.
    const half = chip.offsetWidth / 2 + 2;
    const low = half;
    const high = length - half;
    const along = low >= high ? length / 2 : low + (high - low) * draw;
    const point = element.getPointAtLength(along);
    chip.style.transform = `translate(${point.x}px, ${point.y}px) translate(-50%, -50%)`;
    chip.style.opacity = String(
      Math.max(0, Math.min(1, p / 0.12, (1 - p) / 0.1)),
    );
  }, []);

  const measure = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const box = canvas.getBoundingClientRect();
    for (const [from, to] of edges) {
      const key = edgeKey(from, to);
      const a = tiles.current[from]?.getBoundingClientRect();
      const b = tiles.current[to]?.getBoundingClientRect();
      const base = baseRefs.current[key];
      const active = activeRefs.current[key];
      if (!a || !b || !base || !active) continue;
      const sx = a.right - box.left + 8;
      const sy = a.top + a.height / 2 - box.top;
      const tx = b.left - box.left - 8;
      const ty = b.top + b.height / 2 - box.top;
      const bend = Math.max(24, (tx - sx) * 0.5);
      const d = `M ${sx} ${sy} C ${sx + bend} ${sy}, ${tx - bend} ${ty}, ${tx} ${ty}`;
      base.setAttribute("d", d);
      active.setAttribute("d", d);
      const length = active.getTotalLength();
      lengths.current[key] = length;
      active.style.strokeDasharray = String(length);
    }
    apply(frame.current.c, frame.current.s, frame.current.p);
  }, [apply]);

  useLayoutEffect(() => {
    if (!drawn) return;
    measure();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [drawn, measure]);

  // Nur laufen, solange der Abschnitt sichtbar und der Tab aktiv ist.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let intersecting = false;
    const update = () => setVisible(intersecting && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        intersecting = entry.isIntersecting;
        update();
      },
      { threshold: 0.2 },
    );
    observer.observe(root);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    if (reduced || paused || !visible) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      // Der Frame-Zeitstempel kann kurz vor performance.now() liegen.
      elapsed.current += Math.max(0, Math.min(now - last, 100));
      last = now;
      const { c, s, p } = locate(elapsed.current);
      setPos((prev) => (prev.c === c && prev.s === s ? prev : { c, s }));
      apply(c, s, p);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced, paused, visible, apply]);

  const jumpTo = (index: number) => {
    // Pausiert zeigt der Sprung gleich das fertige Ergebnis des Falls.
    const s = paused ? 3 : 0;
    elapsed.current = index * CASE_MS + s * OVERVIEW_STEP_MS;
    setPos({ c: index, s });
    apply(index, s, s === 3 ? 1 : 0);
  };

  if (reduced) {
    return (
      <section
        ref={rootRef}
        id="ueberblick"
        className="overview"
        aria-labelledby="overview-title"
      >
        <OverviewHeading />
        <OverviewStatic />
        <OverviewIntegrations />
      </section>
    );
  }

  const activity: AiActivity = paused
    ? "paused"
    : pos.s === 1
      ? item.system === "knowledge"
        ? "searching"
        : "thinking"
      : pos.s === 2
        ? "writing"
        : "idle";
  const chipText = item.steps[Math.min(pos.s, 2)].chip;
  const AssistantIcon = aiActivityIcons[activity];
  const chipTone = ["in", "ai", "result"][Math.min(pos.s, 2)];
  const registerTile = (id: NodeId) => (element: HTMLElement | null) => {
    tiles.current[id] = element;
  };
  // Ergebnis-Status nur am Ziel-Werkzeug und erst im letzten Schritt.
  const toolStatusOf = (id: NodeId) =>
    pos.s === 3 && targetOf(item) === id ? item.toolStatus : "";
  const isCurrent = (id: NodeId) =>
    (pos.s === 0 && id === item.channel) ||
    (pos.s === 1 && id === "assistant") ||
    (pos.s === 2 && id === targetOf(item)) ||
    (pos.s === 3 && id === "team");

  return (
    <section
      ref={rootRef}
      id="ueberblick"
      className="overview"
      aria-labelledby="overview-title"
    >
      <OverviewHeading />
      <div className="overview-controls">
        <div
          className="overview-cases"
          role="group"
          aria-label="Beispielfall wählen"
        >
          {overviewCases.map((entry, index) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={index === pos.c}
              onClick={() => jumpTo(index)}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
          {paused ? "Fortsetzen" : "Pausieren"}
        </Button>
      </div>
      {drawn ? (
        <div className="overview-canvas" ref={canvasRef} aria-hidden="true">
          <svg className="overview-wires">
            {edges.map(([from, to]) => {
              const key = edgeKey(from, to);
              return (
                <g key={key}>
                  <path
                    className="overview-wire"
                    ref={(element) => {
                      baseRefs.current[key] = element;
                    }}
                  />
                  <path
                    className="overview-wire-active"
                    ref={(element) => {
                      activeRefs.current[key] = element;
                    }}
                  />
                </g>
              );
            })}
          </svg>
          <div className="overview-grid">
            <div className="overview-col">
              <span className="overview-col-label">
                Anliegen kommen an, z.&nbsp;B.
              </span>
              <div className="overview-col-body">
                <Node
                  id="email"
                  name="E-Mail"
                  caption={channelStatus(item, "email")}
                  tone="mail"
                  icon={<Mail size={44} strokeWidth={1.8} />}
                  current={isCurrent("email")}
                  dim={item.channel !== "email"}
                  tileRef={registerTile("email")}
                />
                <Node
                  id="form"
                  name="Formular"
                  caption={channelStatus(item, "form")}
                  tone="form"
                  icon={<FormWindowIcon size={44} strokeWidth={1.5} />}
                  current={isCurrent("form")}
                  dim={item.channel !== "form"}
                  tileRef={registerTile("form")}
                />
              </div>
            </div>
            <div className="overview-col">
              <span className="overview-col-label">Assistent bereitet vor</span>
              <div className="overview-col-body">
                <div
                  className={`overview-node assistant${isCurrent("assistant") ? " current" : ""}`}
                  data-node="assistant"
                  data-activity={activity}
                >
                  <div
                    className="overview-tile"
                    ref={registerTile("assistant")}
                  >
                    <AssistantIcon size={44} strokeWidth={1.8} />
                  </div>
                  <strong>Assistent</strong>
                  <span
                    key={assistantStatus(item, pos.s, paused)}
                    className="overview-assistant-status overview-status-text"
                  >
                    {assistantStatus(item, pos.s, paused)}
                  </span>
                </div>
              </div>
            </div>
            <div className="overview-col systems">
              <span className="overview-col-label">
                Deine Werkzeuge &amp; Wissen, z.&nbsp;B.
              </span>
              <div className="overview-col-body">
                {toolNodes.map(({ id, entry }) => (
                  <SystemTile
                    key={id}
                    id={id}
                    tone={entry.onDark ? "tool on-dark" : "tool"}
                    current={isCurrent(id)}
                    dim={targetOf(item) !== id}
                    status={toolStatusOf(id)}
                    tileRef={registerTile(id)}
                  >
                    {entry.logo ? (
                      <img
                        src={entry.logo}
                        alt=""
                        height="22"
                        style={
                          entry.logoHeight
                            ? { height: entry.logoHeight }
                            : undefined
                        }
                      />
                    ) : (
                      entry.name
                    )}
                  </SystemTile>
                ))}
                <SystemTile
                  id={OTHER_NODE}
                  tone="other"
                  current={isCurrent(OTHER_NODE)}
                  dim={targetOf(item) !== OTHER_NODE}
                  status={toolStatusOf(OTHER_NODE)}
                  tileRef={registerTile(OTHER_NODE)}
                >
                  <img
                    className="overview-excel"
                    src="/assets/integrations/excel.svg"
                    alt=""
                  />
                  Excel &amp; andere
                </SystemTile>
                <div className="overview-divider" aria-hidden="true">
                  <span>Wissen</span>
                </div>
                <SystemTile
                  id={KNOWLEDGE_NODE}
                  tone="knowledge"
                  current={isCurrent(KNOWLEDGE_NODE)}
                  dim={targetOf(item) !== KNOWLEDGE_NODE}
                  status={toolStatusOf(KNOWLEDGE_NODE)}
                  tileRef={registerTile(KNOWLEDGE_NODE)}
                >
                  <LibraryBig size={24} strokeWidth={1.6} />
                  Betriebswissen
                </SystemTile>
              </div>
            </div>
            <div className="overview-col">
              <span className="overview-col-label">Mensch entscheidet</span>
              <div className="overview-col-body">
                <Node
                  id="team"
                  name="Dein Team"
                  caption={teamStatus(item, pos.s, paused)}
                  tone="team"
                  icon={
                    pos.s === 3 ? (
                      <UserRoundCheck size={46} strokeWidth={2} />
                    ) : (
                      <UserRound size={46} strokeWidth={2} />
                    )
                  }
                  current={isCurrent("team")}
                  dim={false}
                  activity={pos.s === 3 && !paused ? "waiting" : "idle"}
                  tileRef={registerTile("team")}
                />
              </div>
            </div>
          </div>
          <div className="overview-chip" data-tone={chipTone} ref={chipRef}>
            {chipText}
          </div>
        </div>
      ) : (
        <div className="overview-narrow" aria-hidden="true">
          <CaseSteps item={item} active={pos.s} />
        </div>
      )}
      <div className="overview-status">
        <span className="status-dot" aria-hidden="true" />
        <strong aria-hidden="true">
          Beispiel {pos.c + 1} von {overviewCases.length} · {item.headline}
        </strong>
        <span className="overview-status-detail" aria-hidden="true">
          {item.steps[pos.s].text}
        </span>
        {/* Link zur Detaildemo vorerst ausgeblendet:
        {item.detailDemo ? (
          <a className="overview-detail-link" href="#workflow">
            Vollständige Demo ansehen
            <ArrowDown size={14} aria-hidden="true" />
          </a>
        ) : null}
        */}
      </div>
      {drawn ? null : <OverviewIntegrations />}
      <div className="sr-only">
        <OverviewStatic />
      </div>
    </section>
  );
}

function OverviewIntegrations() {
  if (integrations.length === 0) return null;
  return (
    <div className="overview-integrations">
      <strong>Anbindbar an Handwerkersoftware, z. B.</strong>
      <ul aria-label="Beispiele für Handwerkersoftware">
        {integrations.map((entry) => (
          <li key={entry.name} className={entry.onDark ? "on-dark" : undefined}>
            {entry.logo ? (
              <img src={entry.logo} alt={entry.name} height="22" />
            ) : (
              entry.name
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function OverviewHeading() {
  return (
    <div className="overview-head">
      <span className="overview-kicker">
        <span className="status-dot" />
        ANWENDUNGSFALL · KUNDENANFRAGEN
      </span>
      <h2 id="overview-title">
        Die Anfrage kommt rein. Die Antwort liegt bereit.
      </h2>
      <p>
        Ob E-Mail oder Formular: Der Assistent erkennt den Kunden, findet die
        passenden Infos in deinen Unterlagen und bereitet Antwort oder Eintrag
        vor. Dein Team prüft und sendet selbst.
      </p>
    </div>
  );
}
