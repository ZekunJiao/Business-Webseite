import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowDown, UserRoundCheck } from "lucide-react";
import { aiActivityIcons } from "./AiSymbol";
import { useMediaQuery } from "../lib/useMediaQuery";
import type { Branch } from "../branches/types";

// Gesamtbild für alle Anwendungsfälle: was reinkommt, der Assistent, deine
// Software und dein Team. Keine Beispielfälle; nur ein leiser Datenpunkt
// läuft ab und zu von einem Eingang über den Assistenten und ein Programm
// zum Team. Die Linien werden einmal und bei Größenänderung vermessen.

const AssistantIcon = aiActivityIcons.idle;
// Darunter stehen die Spalten untereinander, ohne Linien.
const STACKED_QUERY = "(max-width: 1180px)";

// Ein Datenpunkt fährt ohne Halt: Eingang → (hinter dem Assistenten durch)
// → Programm → (hinter dem Kasten durch) → Team, danach eine Pause.
// Solange er beim Assistenten ist und zum Programm fährt, dreht sich das
// Zahnrad; kommt er beim Team an, blinkt der Haken kurz auf.
const TRAVEL_MS = 5400;
const GAP_MS = 1600;
const PACKET_MS = TRAVEL_MS + GAP_MS;
// Drehtempo des Zahnrads in Grad pro Millisekunde
const COG_SPEED = 0.22;
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
const pick = (count: number, not: number) => {
  if (count < 2) return 0;
  if (not < 0 || not >= count) return Math.floor(Math.random() * count);
  const next = Math.floor(Math.random() * (count - 1));
  return next >= not ? next + 1 : next;
};

export function SystemOverview({
  overview,
}: {
  overview: Branch["overview"];
}) {
  const { inputs, integrations, extras } = overview;
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
    const lit = new Set<Element>();
    const clear = () => {
      lit.forEach((path) => path.classList.remove("is-active"));
      lit.clear();
    };
    const assistantIcon = canvas.querySelector<HTMLElement>(
      "[data-wire='assistant']",
    );
    const teamIcon = canvas.querySelector<HTMLElement>("[data-wire='team']");
    let cog = 0;
    let spin = 0;
    let checked = false;
    const setChecked = (value: boolean) => {
      if (!teamIcon || value === checked) return;
      checked = value;
      teamIcon.toggleAttribute("data-checked", value);
    };

    const frame = (now: number) => {
      // Der Frame-Zeitstempel kann kurz vor performance.now() liegen.
      const step = Math.max(0, Math.min(now - last, 100));
      elapsed += step;
      last = now;
      let working = false;
      const svg = svgRef.current;
      const packet = svg?.querySelector<SVGCircleElement>(".system-packet");
      const ins = svg?.querySelectorAll<SVGPathElement>("[data-seg='in']");
      const outs = svg?.querySelectorAll<SVGPathElement>("[data-seg='out']");
      const team = svg?.querySelector<SVGPathElement>("[data-seg='team']");
      if (packet && ins?.length && outs?.length && team) {
        const current = Math.floor(elapsed / PACKET_MS);
        if (current !== cycle || !ins[from] || !outs[to]) {
          cycle = current;
          from = pick(ins.length, from);
          to = pick(outs.length, to);
          clear();
          setChecked(false);
        }
        const t = elapsed % PACKET_MS;
        if (t >= TRAVEL_MS) {
          packet.style.opacity = "0";
          clear();
          setChecked(true);
        } else {
          // Strecke aus drei Linien und zwei geraden Stücken, die hinter
          // Assistent und Kasten liegen. Gleichmäßiges Tempo über alles.
          const route = [ins[from], outs[to], team];
          const lengths = route.map((path) => path.getTotalLength());
          const ends = route.map((path, i) => [
            path.getPointAtLength(0),
            path.getPointAtLength(lengths[i]),
          ]);
          const gapA = Math.hypot(
            ends[1][0].x - ends[0][1].x,
            ends[1][0].y - ends[0][1].y,
          );
          const gapB = Math.hypot(
            ends[2][0].x - ends[1][1].x,
            ends[2][0].y - ends[1][1].y,
          );
          const parts = [lengths[0], gapA, lengths[1], gapB, lengths[2]];
          let distance =
            easeInOut(t / TRAVEL_MS) * parts.reduce((a, b) => a + b, 0);
          let index = 0;
          while (index < parts.length - 1 && distance > parts[index]) {
            distance -= parts[index];
            index += 1;
          }
          // Beim Assistenten (letztes Stück der Eingangslinie) bis zum
          // Programm arbeitet er.
          working =
            index === 1 ||
            index === 2 ||
            (index === 0 && distance > parts[0] * 0.8);
          let point: { x: number; y: number };
          if (index % 2 === 0) {
            const path = route[index / 2];
            point = path.getPointAtLength(distance);
            if (!lit.has(path)) {
              path.classList.add("is-active");
              lit.add(path);
            }
          } else {
            const a = ends[(index - 1) / 2][1];
            const b = ends[(index + 1) / 2][0];
            const share = parts[index] ? distance / parts[index] : 1;
            point = { x: a.x + (b.x - a.x) * share, y: a.y + (b.y - a.y) * share };
          }
          packet.setAttribute("cx", String(point.x));
          packet.setAttribute("cy", String(point.y));
          const share = t / TRAVEL_MS;
          packet.style.opacity = String(
            Math.min(1, share * 12, (1 - share) * 12),
          );
        }
      }
      // Zahnrad läuft weich an und aus, ohne zurückzuspringen.
      spin += ((working ? COG_SPEED : 0) - spin) * Math.min(1, step / 250);
      cog = (cog + spin * step) % 360;
      assistantIcon?.style.setProperty("--cog", `${cog}deg`);
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
      clear();
      setChecked(false);
      assistantIcon?.style.removeProperty("--cog");
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
        <h2 id="zusammenhang-title">{overview.title}</h2>
        <p>{overview.intro}</p>
      </div>
      <div className="system-canvas" ref={canvasRef}>
        {stacked ? null : (
          <svg className="system-wires" ref={svgRef} aria-hidden="true" />
        )}
        <div className="system-col">
          <h3>{overview.inputsTitle}</h3>
          <ul className="system-inputs">
            {inputs.map(({ name, icon: Icon, strokeWidth }) => (
              <li key={name} data-wire="input">
                <span className="system-icon" aria-hidden="true">
                  <Icon size={18} strokeWidth={strokeWidth} />
                </span>
                {name}
              </li>
            ))}
          </ul>
        </div>
        {arrow}
        <div className="system-col system-col-center">
          <h3 className="sr-only">Digitaler Assistent</h3>
          <div className="system-assistant">
            <span
              className="system-assistant-icon"
              data-wire="assistant"
              aria-hidden="true"
            >
              <AssistantIcon size={40} strokeWidth={1.8} />
            </span>
            <strong>Digitaler Assistent</strong>
            <span>{overview.assistantText}</span>
          </div>
        </div>
        {arrow}
        <div className="system-col">
          <h3>{overview.softwareTitle}</h3>
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
            {extras.map(({ name, icon: Icon, image }) => (
              <li key={name} data-wire="system">
                {image ? (
                  <img className="system-excel" src={image} alt="" />
                ) : Icon ? (
                  <span className="system-icon" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                ) : null}
                {name}
              </li>
            ))}
          </ul>
        </div>
        {arrow}
        <div className="system-col system-col-center">
          <h3 className="sr-only">{overview.teamTitle}</h3>
          <div className="system-team">
            <span
              className="system-team-icon"
              data-wire="team"
              aria-hidden="true"
            >
              <UserRoundCheck size={36} strokeWidth={1.9} />
            </span>
            <strong>{overview.teamTitle}</strong>
            <span>{overview.teamText}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
