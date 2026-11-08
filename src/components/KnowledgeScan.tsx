import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue } from "motion/react";
import { AiSymbol } from "./AiSymbol";
export type ScanState = {
  phase: "mail" | "knowledge" | "matching" | "done";
  index: number;
  matched: number;
};
type Point = { x: number; y: number };
type ScanRect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  y: number;
};
const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
const mix = (a: Point, b: Point, t: number) => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});
// Shuffle height bands so each run explores the whole surface in a new order.
// Keep these routes for the lifetime of the run so pause/resume never jumps.
function createWanderRoute(): Point[] {
  const bands = [0, 1, 2, 3, 4, 5, 6];
  for (let i = bands.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bands[i], bands[j]] = [bands[j], bands[i]];
  }
  const side = Math.random() < 0.5 ? 0 : 1;
  return bands.map((band, i) => ({
    x:
      (i + side) % 2 === 0
        ? 0.12 + Math.random() * 0.3
        : 0.58 + Math.random() * 0.3,
    y: 0.06 + ((band + 0.2 + Math.random() * 0.6) / bands.length) * 0.88,
  }));
}
// A continuous curve through random points, independent of paragraphs or files.
function wander(route: Point[], progress: number): Point {
  const position = clamp(progress) * (route.length - 1);
  const i = Math.min(route.length - 2, Math.floor(position));
  const t = position - i;
  const p0 = route[Math.max(0, i - 1)],
    p1 = route[i],
    p2 = route[i + 1],
    p3 = route[Math.min(route.length - 1, i + 2)];
  const axis = (key: keyof Point) =>
    clamp(
      0.5 *
        (2 * p1[key] +
          (-p0[key] + p2[key]) * t +
          (2 * p0[key] - 5 * p1[key] + 4 * p2[key] - p3[key]) * t * t +
          (-p0[key] + 3 * p1[key] - 3 * p2[key] + p3[key]) * t * t * t),
      0.03,
      0.97,
    );
  return { x: axis("x"), y: axis("y") };
}
function inside(
  rect: ScanRect | null,
  route: Point[],
  progress: number,
): Point | null {
  if (!rect) return null;
  const point = wander(route, progress);
  const insetX = Math.min(26, (rect.right - rect.left) / 4);
  const insetY = Math.min(26, (rect.bottom - rect.top) / 4);
  return {
    x: rect.left + insetX + point.x * (rect.right - rect.left - 2 * insetX),
    y: rect.top + insetY + point.y * (rect.bottom - rect.top - 2 * insetY),
  };
}
function fly(from: Point, to: Point, progress: number): Point {
  const t = clamp(progress);
  const point = mix(from, to, t * t * (3 - 2 * t));
  point.y -= Math.sin(t * Math.PI) * 30;
  return point;
}
export function KnowledgeScan({
  running,
  finished,
  reduced,
  matches,
  status,
  onProgress,
  onComplete,
}: {
  running: boolean;
  finished: boolean;
  reduced: boolean;
  matches: (number | null)[];
  status: string;
  onProgress: (state: ScanState) => void;
  onComplete: () => void;
}) {
  const [routes] = useState(() => ({
    mail: createWanderRoute(),
    knowledge: createWanderRoute(),
  }));
  const ref = useRef<HTMLDivElement>(null),
    elapsed = useRef(0),
    reported = useRef(""),
    completed = useRef(false),
    callbacks = useRef({ onProgress, onComplete });
  const x = useMotionValue(0),
    y = useMotionValue(0),
    statusX = useMotionValue(0),
    opacity = useMotionValue(0);
  useEffect(() => {
    callbacks.current = { onProgress, onComplete };
  }, [onProgress, onComplete]);
  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host) return;
    if (finished) {
      elapsed.current = 0;
      completed.current = false;
    }
    let frame = 0,
      previous = 0;
    const duration = reduced ? 3200 : 24000;
    const tick = (now: number) => {
      if (previous && running && !finished)
        elapsed.current = Math.min(
          duration,
          elapsed.current + Math.min(now - previous, 100),
        );
      previous = now;
      const p = finished ? 1 : elapsed.current / duration;
      const phase: ScanState["phase"] =
        p < 0.3 ? "mail" : p < 0.72 ? "knowledge" : p < 1 ? "matching" : "done";
      const index =
        phase === "matching" || phase === "done"
          ? Math.min(
              matches.length - 1,
              Math.floor(((p - 0.72) / 0.28) * matches.length),
            )
          : -1;
      const matched =
        phase === "done"
          ? matches.length
          : phase === "matching"
            ? Math.min(matches.length, index)
            : 0;
      const key = `${phase}-${index}-${matched}`;
      if (reported.current !== key) {
        reported.current = key;
        if (ref.current) ref.current.dataset.scanPhase = phase;
        callbacks.current.onProgress({ phase, index, matched });
      }
      const box = host.getBoundingClientRect();
      const rect = (selector: string): ScanRect | null => {
        const el = host.querySelector(selector);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          left: r.left - box.left,
          right: r.right - box.left,
          top: r.top - box.top,
          bottom: r.bottom - box.top,
          y: r.top - box.top + r.height / 2,
        };
      };
      const mail = matches.map((_, i) => rect(`[data-mail-question="${i}"]`));
      const kb = matches.map((i) =>
        i === null ? null : rect(`[data-knowledge-source="${i}"]`),
      );
      const mailArea = rect("[data-mail-scan-area]");
      const knowledgeArea = rect("[data-knowledge-scan-area]");
      let point: Point | null = null;
      if (p < 0.3) point = inside(mailArea, routes.mail, p / 0.3);
      else if (p < 0.39) {
        const a = inside(mailArea, routes.mail, 1),
          b = inside(knowledgeArea, routes.knowledge, 0);
        if (a && b) {
          point = fly(a, b, (p - 0.3) / 0.09);
        }
      } else if (p < 0.72)
        point = inside(knowledgeArea, routes.knowledge, (p - 0.39) / 0.33);
      else if (p < 1) {
        const a = mail[index],
          b = kb[index];
        if (a && b) {
          const t = (((p - 0.72) / 0.28) * matches.length) % 1;
          const previousSource = kb[index - 1];
          const previousTarget =
            index === 0
              ? inside(knowledgeArea, routes.knowledge, 1)
              : previousSource
                ? { x: previousSource.left, y: previousSource.y }
                : null;
          point =
            t < 0.3 && previousTarget
              ? fly(previousTarget, { x: a.right, y: a.y }, t / 0.3)
              : fly(
                  { x: a.right, y: a.y },
                  { x: b.left, y: b.y },
                  (t - 0.3) / 0.7,
                );
        }
      }
      if (point && !reduced && !finished) {
        x.set(point.x - 26);
        y.set(point.y - 26);
        statusX.set(clamp(point.x - 100, 12, box.width - 212) - (point.x - 26));
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
    const mutations = new MutationObserver(() => {
      if (!running || finished) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(tick);
      }
    });
    mutations.observe(host, { childList: true, subtree: true });
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
      mutations.disconnect();
      window.removeEventListener("resize", refresh);
    };
  }, [running, finished, reduced, matches, routes, x, y, statusX, opacity]);
  return (
    <div ref={ref} className="knowledge-scan-overlay" aria-hidden="true">
      <svg className="scan-connections">
        {matches.map((_, i) => (
          <path key={i} data-scan-connection={i} />
        ))}
      </svg>
      <motion.div
        className="ai-scan-cursor"
        data-running={running && !finished}
        style={{ x, y, opacity }}
      >
        <AiSymbol />
        <motion.span className="ai-current-status" style={{ x: statusX }}>
          {status}
        </motion.span>
      </motion.div>
    </div>
  );
}
