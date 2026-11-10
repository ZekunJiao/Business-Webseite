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
  ArrowDown,
  Check,
  ClipboardList,
  ContactRound,
  LibraryBig,
  Mail,
  Pause,
  Play,
  UserRoundCheck,
} from "lucide-react";
import { Button } from "./ui/button";
import { AiSymbol } from "./AiSymbol";
import type { AiActivity } from "./AiSymbol";
import {
  channelNames,
  overviewCases,
  systemNames,
} from "../overviewFlows";
import type { OverviewCase } from "../overviewFlows";
import { integrations, integrationsNote } from "../integrations";
import { useMediaQuery } from "../lib/useMediaQuery";
import { OVERVIEW_HOLD_MS, OVERVIEW_STEP_MS } from "../lib/demoTiming";

type NodeId = "email" | "form" | "assistant" | "crm" | "knowledge" | "team";

const edges: [NodeId, NodeId][] = [
  ["email", "assistant"],
  ["form", "assistant"],
  ["assistant", "crm"],
  ["assistant", "knowledge"],
  ["crm", "team"],
  ["knowledge", "team"],
];
const edgeKey = (from: NodeId, to: NodeId) => `${from}>${to}`;
const segmentsOf = (item: OverviewCase) => [
  edgeKey(item.channel, "assistant"),
  edgeKey("assistant", item.system),
  edgeKey(item.system, "team"),
];

// Schritte 0 bis 2 zeichnen je eine Linie, Schritt 3 hält das Ergebnis.
const CASE_MS = OVERVIEW_STEP_MS * 3 + OVERVIEW_HOLD_MS;
const TOTAL_MS = CASE_MS * overviewCases.length;
// Anteil eines Schritts, in dem die Linie gezeichnet wird.
const DRAW_SHARE = 0.75;
// Darunter ist zwischen den Spalten zu wenig Platz für Etiketten auf den Linien.
const NARROW_QUERY = "(max-width: 1100px)";

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
  systemNames[item.system],
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
  tileRef,
}: {
  id: NodeId;
  name: string;
  caption: string;
  icon: ReactNode;
  tone: string;
  current: boolean;
  dim: boolean;
  tileRef: (element: HTMLElement | null) => void;
}) {
  return (
    <div
      className={`overview-node ${tone}${current ? " current" : ""}${dim ? " dim" : ""}`}
      data-node={id}
    >
      <div className="overview-tile" ref={tileRef}>
        {icon}
      </div>
      <strong>{name}</strong>
      <span>{caption}</span>
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
        <OverviewFoot />
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
  const chipTone = ["in", "ai", "result"][Math.min(pos.s, 2)];
  const registerTile = (id: NodeId) => (element: HTMLElement | null) => {
    tiles.current[id] = element;
  };
  const isCurrent = (id: NodeId) =>
    (pos.s === 0 && id === item.channel) ||
    (pos.s === 1 && id === "assistant") ||
    (pos.s === 2 && id === item.system) ||
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
              <span className="overview-col-label">Anliegen kommen rein</span>
              <div className="overview-col-body">
                <Node
                  id="email"
                  name="E-Mail"
                  caption="Posteingang"
                  tone="mail"
                  icon={<Mail size={34} strokeWidth={1.5} />}
                  current={isCurrent("email")}
                  dim={item.channel !== "email"}
                  tileRef={registerTile("email")}
                />
                <Node
                  id="form"
                  name="Formular"
                  caption="auf der Homepage"
                  tone="form"
                  icon={<ClipboardList size={34} strokeWidth={1.5} />}
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
                >
                  <div
                    className="overview-tile"
                    ref={registerTile("assistant")}
                  >
                    <AiSymbol activity={activity} />
                  </div>
                  <strong>Assistent</strong>
                  <span>Beispiel, simuliert</span>
                </div>
              </div>
            </div>
            <div className="overview-col">
              <span className="overview-col-label">Eure Werkzeuge</span>
              <div className="overview-col-body">
                <Node
                  id="crm"
                  name="Kundenverwaltung"
                  caption="z. B. Excel oder Software"
                  tone="crm"
                  icon={<ContactRound size={34} strokeWidth={1.5} />}
                  current={isCurrent("crm")}
                  dim={item.system !== "crm"}
                  tileRef={registerTile("crm")}
                />
                <Node
                  id="knowledge"
                  name="Betriebswissen"
                  caption="Interne Dokumente"
                  tone="knowledge"
                  icon={<LibraryBig size={34} strokeWidth={1.5} />}
                  current={isCurrent("knowledge")}
                  dim={item.system !== "knowledge"}
                  tileRef={registerTile("knowledge")}
                />
              </div>
            </div>
            <div className="overview-col">
              <span className="overview-col-label">Mensch entscheidet</span>
              <div className="overview-col-body">
                <Node
                  id="team"
                  name="Dein Team"
                  caption="prüft und sendet selbst"
                  tone="team"
                  icon={<UserRoundCheck size={34} strokeWidth={1.5} />}
                  current={isCurrent("team")}
                  dim={false}
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
      <div className="overview-status" aria-hidden="true">
        <span className="status-dot" />
        <strong>
          Beispiel {pos.c + 1} von {overviewCases.length} · {item.headline}
        </strong>
        <span className="overview-status-detail">{item.steps[pos.s].text}</span>
      </div>
      <OverviewIntegrations />
      <OverviewFoot detail={item.detailDemo} />
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
      <small>{integrationsNote}</small>
    </div>
  );
}

function OverviewHeading() {
  return (
    <div className="overview-head">
      <span className="overview-kicker">
        <span className="status-dot" />
        MÖGLICHER ABLAUF
      </span>
      <h2 id="overview-title">Vom Anliegen zur geprüften Antwort</h2>
      <p>
        Anfragen kommen per E-Mail oder über das Formular auf der Homepage
        herein. Ein Assistent bereitet sie vor, dein Team prüft und
        entscheidet.
      </p>
    </div>
  );
}

function OverviewFoot({ detail }: { detail?: boolean }) {
  return (
    <div className="demo-bottom overview-foot">
      <span>Beispielhafte Simulation · Daten sind erfunden · Nichts wird gesendet</span>
      {detail === undefined ? null : detail ? (
        <a className="overview-detail-link" href="#workflow">
          Detaildemo ansehen
          <ArrowDown size={14} aria-hidden="true" />
        </a>
      ) : (
        <span>Dafür gibt es noch keine Detaildemo.</span>
      )}
    </div>
  );
}
