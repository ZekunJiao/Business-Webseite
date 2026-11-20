import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import {
  ArrowDown,
  CalendarDays,
  Landmark,
  LibraryBig,
  Mail,
  MessageSquare,
  Mic,
  Phone,
  UserRoundCheck,
} from "lucide-react";
import { aiActivityIcons } from "./AiSymbol";
import { FormWindowIcon } from "./FormWindowIcon";
import { integrations } from "../integrations";
import { useMediaQuery } from "../lib/useMediaQuery";

// Gesamtbild für alle Anwendungsfälle: was reinkommt, der Assistent, deine
// Software und dein Team. Keine Beispielfälle; nur ein leiser Datenpunkt
// läuft ab und zu von einem Eingang über den Assistenten und ein Programm
// zum Team. Die Linien werden einmal und bei Größenänderung vermessen.

// Nur Eingänge, die auch in den Demos vorkommen.
const inputs: { name: string; icon: ReactNode }[] = [
  { name: "Telefon", icon: <Phone size={18} /> },
  { name: "E-Mail", icon: <Mail size={18} /> },
  {
    name: "Homepage-Formular",
    icon: <FormWindowIcon size={18} strokeWidth={1.8} />,
  },
  { name: "Sprachnotiz vom Termin", icon: <Mic size={18} /> },
  {
    name: "Nachrichten von Kunden und Team",
    icon: <MessageSquare size={18} />,
  },
  { name: "Zahlungseingänge", icon: <Landmark size={18} /> },
];

const AssistantIcon = aiActivityIcons.idle;
// Darunter stehen die Spalten untereinander, ohne Linien.
const STACKED_QUERY = "(max-width: 1100px)";

// Ablauf eines Datenpunkts in ms: Eingang → Assistent, kurz halten,
// Assistent → Programm, Programm → Team, Pause bis zum nächsten.
const PACKET = { in: 1500, hold: 600, out: 1200, team: 1000, gap: 1400 };
const PACKET_MS =
  PACKET.in + PACKET.hold + PACKET.out + PACKET.team + PACKET.gap;
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
const pick = (count: number, not: number) => {
  if (count < 2) return 0;
  const next = Math.floor(Math.random() * (count - 1));
  return next >= not ? next + 1 : next;
};

export function SystemOverview() {
  const stacked = useMediaQuery(STACKED_QUERY);
  const reduced = !!useReducedMotion();
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const measure = useCallback(() => {
    const canvas = canvasRef.current;
    const svg = svgRef.current;
    if (!canvas || !svg) return;
    const box = canvas.getBoundingClientRect();
    const rect = (selector: string) =>
      Array.from(canvas.querySelectorAll<HTMLElement>(selector)).map(
        (element) => element.getBoundingClientRect(),
      );
    const [assistant] = rect("[data-wire='assistant']");
    const [systems] = rect("[data-wire='systems']");
    const [team] = rect("[data-wire='team']");
    if (!assistant || !systems || !team) return;
    const midY = (r: DOMRect) => r.top + r.height / 2 - box.top;
    const x = (value: number) => value - box.left;
    const curve = (sx: number, sy: number, tx: number, ty: number) => {
      const bend = (tx - sx) * 0.55;
      return `C ${sx + bend} ${sy}, ${tx - bend} ${ty}, ${tx} ${ty}`;
    };
    // Kreis des Assistenten: Linien enden geordnet auf seinem Rand, statt
    // alle in einem Punkt. Gleiche Reihenfolge oben/unten, damit sich keine
    // Linien kreuzen.
    const cx = x(assistant.left + assistant.width / 2);
    const cy = midY(assistant);
    const radius = assistant.width / 2 + 6;
    const onCircle = (index: number, count: number, side: -1 | 1) => {
      const spread = Math.min(1.1, 0.22 * (count - 1)); // Bogen in Radiant
      const angle =
        count > 1 ? -spread / 2 + (spread * index) / (count - 1) : 0;
      return {
        px: cx + side * radius * Math.cos(angle),
        py: cy + radius * Math.sin(angle),
      };
    };
    const paths: { d: string; seg: string }[] = [];
    const dots: [number, number][] = [];

    // Links: kurzes gerades Stück bis zu einer gemeinsamen Kante, dann Kurve.
    const inputs = rect("[data-wire='input']");
    const edge = Math.max(...inputs.map((r) => x(r.right))) + 16;
    inputs.forEach((r, i) => {
      const sx = x(r.right) + 4;
      const sy = midY(r);
      const { px, py } = onCircle(i, inputs.length, -1);
      paths.push({
        d: `M ${sx} ${sy} L ${edge} ${sy} ${curve(edge, sy, px, py)}`,
        seg: "in",
      });
      dots.push([sx, sy]);
    });

    // Rechts: vom Kreis zur linken Kante des Software-Kastens.
    const items = rect("[data-wire='system']");
    const tx = x(systems.left);
    items.forEach((r, i) => {
      const { px, py } = onCircle(i, items.length, 1);
      paths.push({ d: `M ${px} ${py} ${curve(px, py, tx, midY(r))}`, seg: "out" });
      dots.push([tx, midY(r)]);
    });

    // Vom Kasten zum Team.
    const sx = x(systems.right);
    const ty = midY(team);
    paths.push({
      d: `M ${sx} ${midY(systems)} ${curve(sx, midY(systems), x(team.left) - 8, ty)}`,
      seg: "team",
    });
    dots.push([sx, midY(systems)]);

    svg.innerHTML =
      paths
        .map(
          ({ d, seg }) =>
            `<path class="system-wire" data-seg="${seg}" d="${d}" />`,
        )
        .join("") +
      dots
        .map(
          ([cx, cy]) =>
            `<circle class="system-wire-dot" cx="${cx}" cy="${cy}" r="3" />`,
        )
        .join("") +
      `<circle class="system-packet" r="4" />`;
  }, []);

  useLayoutEffect(() => {
    if (stacked) return;
    measure();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [stacked, measure]);

  // Datenpunkt: läuft nur, solange das Bild sichtbar und der Tab aktiv ist.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (stacked || reduced || !canvas) return;
    let raf = 0;
    let running = false;
    let visible = false;
    let last = 0;
    let elapsed = 0;
    let cycle = -1;
    let from = -1;
    let to = -1;
    let active: Element | null = null;

    const frame = (now: number) => {
      elapsed += Math.min(now - last, 100);
      last = now;
      const svg = svgRef.current;
      const packet = svg?.querySelector<SVGCircleElement>(".system-packet");
      const ins = svg?.querySelectorAll<SVGPathElement>("[data-seg='in']");
      const outs = svg?.querySelectorAll<SVGPathElement>("[data-seg='out']");
      const team = svg?.querySelector<SVGPathElement>("[data-seg='team']");
      if (packet && ins?.length && outs?.length && team) {
        const current = Math.floor(elapsed / PACKET_MS);
        if (current !== cycle) {
          cycle = current;
          from = pick(ins.length, from);
          to = pick(outs.length, to);
        }
        let t = elapsed % PACKET_MS;
        let path: SVGPathElement | null = null;
        let progress = 0;
        const steps: [number, SVGPathElement | null][] = [
          [PACKET.in, ins[from]],
          [PACKET.hold, null],
          [PACKET.out, outs[to]],
          [PACKET.team, team],
        ];
        let holdAt: SVGPathElement | null = ins[from];
        for (const [duration, segment] of steps) {
          if (t < duration) {
            path = segment;
            progress = t / duration;
            break;
          }
          t -= duration;
          if (segment) holdAt = segment;
        }
        const inGap = elapsed % PACKET_MS >= PACKET_MS - PACKET.gap;
        const shown = path ?? (inGap ? null : holdAt);
        if (active !== shown) {
          active?.classList.remove("is-active");
          shown?.classList.add("is-active");
          active = shown;
        }
        if (shown) {
          const length = shown.getTotalLength();
          const point = shown.getPointAtLength(
            path ? easeInOut(progress) * length : length,
          );
          packet.setAttribute("cx", String(point.x));
          packet.setAttribute("cy", String(point.y));
          // Am Anfang einblenden, nach dem Team ausblenden
          const fade =
            path === ins[from]
              ? Math.min(1, progress * 6)
              : path === team
                ? Math.min(1, (1 - progress) * 4)
                : 1;
          packet.style.opacity = String(fade);
        } else {
          packet.style.opacity = "0";
        }
      }
      raf = requestAnimationFrame(frame);
    };
    const update = () => {
      const run = visible && !document.hidden;
      if (run === running) return;
      running = run;
      if (run) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else cancelAnimationFrame(raf);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        update();
      },
      { threshold: 0.2 },
    );
    observer.observe(canvas);
    document.addEventListener("visibilitychange", update);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      active?.classList.remove("is-active");
    };
  }, [stacked, reduced]);

  const arrow = stacked ? (
    <span className="system-arrow" aria-hidden="true">
      <ArrowDown size={18} />
    </span>
  ) : null;

  return (
    <section
      id="zusammenhang"
      className="system-overview"
      aria-labelledby="zusammenhang-title"
    >
      <div className="usecases-head">
        <span className="overview-kicker">SO HÄNGT ALLES ZUSAMMEN</span>
        <h2 id="zusammenhang-title">
          Ein Assistent, angebunden an deine Software
        </h2>
        <p>
          Egal ob Anruf, Mail oder Notiz vom Termin: Der Assistent bereitet vor,
          trägt in eure Programme ein, und dein Team entscheidet.
        </p>
      </div>
      <div className="system-canvas" ref={canvasRef}>
        {stacked ? null : (
          <svg className="system-wires" ref={svgRef} aria-hidden="true" />
        )}
        <div className="system-col">
          <h3>Was reinkommt, z.&nbsp;B.</h3>
          <ul className="system-inputs">
            {inputs.map((input) => (
              <li key={input.name} data-wire="input">
                <span className="system-icon" aria-hidden="true">
                  {input.icon}
                </span>
                {input.name}
              </li>
            ))}
          </ul>
        </div>
        {arrow}
        <div className="system-col system-col-center">
          <h3 className="sr-only">Assistent</h3>
          <div className="system-assistant">
            <span
              className="system-assistant-icon"
              data-wire="assistant"
              aria-hidden="true"
            >
              <AssistantIcon size={40} strokeWidth={1.8} />
            </span>
            <strong>Assistent</strong>
            <span>liest, ordnet zu, bereitet vor</span>
          </div>
        </div>
        {arrow}
        <div className="system-col">
          <h3>Deine Software &amp; dein Wissen</h3>
          <ul className="system-systems" data-wire="systems">
            {integrations.map((entry) => (
              <li key={entry.name} data-wire="system">
                {entry.logo ? (
                  <img
                    src={entry.logo}
                    alt={entry.name}
                    style={
                      entry.logoHeight
                        ? { height: entry.logoHeight * 0.8 }
                        : undefined
                    }
                  />
                ) : (
                  entry.name
                )}
              </li>
            ))}
            <li data-wire="system">
              <img
                className="system-excel"
                src="/assets/integrations/excel.svg"
                alt=""
              />
              Excel &amp; andere
            </li>
            <li data-wire="system">
              <span className="system-icon" aria-hidden="true">
                <CalendarDays size={18} />
              </span>
              Kalender
            </li>
            <li data-wire="system">
              <span className="system-icon" aria-hidden="true">
                <LibraryBig size={18} />
              </span>
              Betriebswissen &amp; Preisliste
            </li>
          </ul>
        </div>
        {arrow}
        <div className="system-col system-col-center">
          <h3 className="sr-only">Dein Team</h3>
          <div className="system-team">
            <span
              className="system-team-icon"
              data-wire="team"
              aria-hidden="true"
            >
              <UserRoundCheck size={36} strokeWidth={1.9} />
            </span>
            <strong>Dein Team</strong>
            <span>prüft und sendet selbst</span>
          </div>
        </div>
      </div>
    </section>
  );
}
