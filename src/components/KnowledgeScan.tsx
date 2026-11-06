import { useEffect, useRef } from "react";
import { motion, useMotionValue } from "motion/react";
import { Sparkles } from "lucide-react";
export type ScanState = {
  phase: "mail" | "knowledge" | "matching" | "done";
  index: number;
  matched: number;
};
type Point = { x: number; y: number };
const mix = (a: Point, b: Point, t: number) => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});
export function KnowledgeScan({
  running,
  finished,
  reduced,
  matches,
  onProgress,
  onComplete,
}: {
  running: boolean;
  finished: boolean;
  reduced: boolean;
  matches: (number | null)[];
  onProgress: (state: ScanState) => void;
  onComplete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null),
    elapsed = useRef(0),
    reported = useRef(""),
    completed = useRef(false),
    callbacks = useRef({ onProgress, onComplete });
  const x = useMotionValue(0),
    y = useMotionValue(0),
    opacity = useMotionValue(0);
  useEffect(() => {
    callbacks.current = { onProgress, onComplete };
  }, [onProgress, onComplete]);
  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host) return;
    if (finished) { elapsed.current = 0; completed.current = false; }
    let frame = 0,
      previous = 0;
    const duration = reduced ? 3200 : 14000;
    const tick = (now: number) => {
      if (previous && running && !finished)
        elapsed.current = Math.min(
          duration,
          elapsed.current + Math.min(now - previous, 100),
        );
      previous = now;
      const p = finished ? 1 : elapsed.current / duration;
      const phase: ScanState["phase"] =
        p < 0.3
          ? "mail"
          : p < 0.43
            ? "knowledge"
            : p < 0.72
              ? "knowledge"
              : p < 1
                ? "matching"
                : "done";
      const index =
        phase === "mail"
          ? Math.min(
              matches.length - 1,
              Math.floor((p / 0.3) * (matches.length + 1)) - 1,
            )
          : phase === "knowledge"
            ? Math.max(
                0,
                Math.min(
                  matches.length - 1,
                  Math.floor(((p - 0.43) / 0.29) * matches.length),
                ),
              )
            : Math.min(
                matches.length - 1,
                Math.floor(((p - 0.72) / 0.28) * matches.length),
              );
      const matched =
        phase === "done"
          ? matches.length
          : phase === "matching"
            ? Math.min(matches.length, index)
            : 0;
      const key = `${phase}-${index}-${matched}`;
      if (reported.current !== key) {
        reported.current = key;
        callbacks.current.onProgress({ phase, index, matched });
      }
      const box = host.getBoundingClientRect();
      const rect = (selector: string) => {
        const el = host.querySelector(selector);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          left: r.left - box.left,
          right: r.right - box.left,
          y: r.top - box.top + r.height / 2,
        };
      };
      const mail = matches.map((_, i) => rect(`[data-mail-question="${i}"]`));
      const kb = matches.map((i) =>
        i === null ? null : rect(`[data-knowledge-source="${i}"]`),
      );
      const sweep = (items: typeof mail, position: number) => {
        const i = Math.max(0, Math.min(items.length - 1, Math.floor(position))),
          t = Math.max(0, Math.min(1, position - i)),
          r = items[i];
        if (!r) return null;
        const start = { x: r.left + 16, y: r.y },
          end = { x: r.right - 16, y: r.y };
        const prev = items[Math.max(0, i - 1)];
        return i > 0 && prev && t < 0.22
          ? mix({ x: prev.right - 16, y: prev.y }, start, t / 0.22)
          : mix(start, end, Math.max(0, (t - 0.22) / 0.78));
      };
      let point: Point | null = null;
      if (p < 0.3)
        point = sweep(
          [rect("[data-mail-intro]"), ...mail],
          (p / 0.3) * (matches.length + 1),
        );
      else if (p < 0.43) {
        const a = mail[mail.length - 1],
          b = kb[0];
        if (a && b) {
          const t = (p - 0.3) / 0.13;
          point = mix(
            { x: a.right - 16, y: a.y },
            { x: b.left + 16, y: b.y },
            t,
          );
          point.y -= Math.sin(t * Math.PI) * 45;
        }
      } else if (p < 0.72)
        point = sweep(kb, ((p - 0.43) / 0.29) * matches.length);
      else if (p < 1) {
        const a = mail[index],
          b = kb[index];
        if (a && b) {
          const t = (((p - 0.72) / 0.28) * matches.length) % 1;
          const previousTarget = kb[index === 0 ? kb.length-1 : index-1];
          point = t < .25 && previousTarget
            ? mix({x:index===0?previousTarget.right-16:previousTarget.left,y:previousTarget.y},{x:a.right,y:a.y},t/.25)
            : mix({x:a.right,y:a.y},{x:b.left,y:b.y},Math.max(0,(t-.25)/.75));
        }
      }
      if (point && !reduced && !finished) {
        x.set(point.x - 18);
        y.set(point.y - 18);
        opacity.set(1);
      } else opacity.set(0);
      // Keep source matching lines anchored while nodes expand or the page resizes.
      host
        .querySelectorAll<SVGPathElement>("[data-scan-connection]")
        .forEach((path) => {
          const i = Number(path.dataset.scanConnection),
            a = mail[i],
            b = kb[i];
          if (a && b) {
            const mid = (a.right + b.left) / 2;
            path.setAttribute(
              "d",
              `M${a.right} ${a.y} C${mid} ${a.y} ${mid} ${b.y} ${b.left} ${b.y}`,
            );
            path.style.opacity = i < matched ? "1" : "0";
          } else path.style.opacity = "0";
        });
      if (p >= 1 && running && !finished && !completed.current) {
        completed.current = true;
        callbacks.current.onComplete();
      }
      if (running && !finished && p < 1) frame = requestAnimationFrame(tick);
    };
    const observer = new ResizeObserver(() => {
      if (!running || finished) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(tick);
      }
    });
    observer.observe(host);
    const refresh = () => {
      if (!running || finished) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(tick);
      }
    };
    window.addEventListener("resize", refresh);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", refresh);
    };
  }, [running, finished, reduced, matches, x, y, opacity]);
  return (
    <div ref={ref} className="knowledge-scan-overlay" aria-hidden="true">
      <svg className="scan-connections">
        {matches.map((_, i) => (
          <path key={i} data-scan-connection={i} />
        ))}
      </svg>
      <motion.div className="ai-scan-cursor" style={{ x, y, opacity }}>
        <Sparkles size={21} />
        <span>KI</span>
      </motion.div>
    </div>
  );
}
