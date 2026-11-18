import { useCallback, useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
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
// Software und dein Team. Bewusst statisch: keine Beispielfälle, keine
// Animation. Die Linien werden einmal und bei Größenänderung vermessen.

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

export function SystemOverview() {
  const stacked = useMediaQuery(STACKED_QUERY);
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
    const curve = (sx: number, sy: number, tx: number, ty: number) => {
      const bend = Math.max(20, (tx - sx) * 0.5);
      return `M ${sx} ${sy} C ${sx + bend} ${sy}, ${tx - bend} ${ty}, ${tx} ${ty}`;
    };
    const paths: string[] = [];
    const ax = assistant.left - box.left - 8;
    const ay = midY(assistant);
    for (const r of rect("[data-wire='input']"))
      paths.push(curve(r.right - box.left + 6, midY(r), ax, ay));
    const bx = assistant.right - box.left + 8;
    for (const r of rect("[data-wire='system']"))
      paths.push(curve(bx, ay, systems.left - box.left - 2, midY(r)));
    paths.push(
      curve(
        systems.right - box.left + 6,
        midY(systems),
        team.left - box.left - 8,
        midY(team),
      ),
    );
    svg.innerHTML = paths
      .map((d) => `<path class="system-wire" d="${d}" />`)
      .join("");
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
