import { useEffect, useRef } from "react";
import { motion, useMotionValue } from "motion/react";
import { AiSymbol } from "./AiSymbol";
import {
  customerExtractions,
  type ExtractionState,
} from "../customerExtraction";

export function CustomerConnections({
  running,
  finished,
  reduced,
  inspected,
  onProgress,
  onComplete,
}: {
  running: boolean;
  finished: boolean;
  reduced: boolean;
  inspected: string | null;
  onProgress: (state: ExtractionState) => void;
  onComplete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0),
    reported = useRef(""),
    completed = useRef(false);
  const callbacks = useRef({ onProgress, onComplete });
  callbacks.current = { onProgress, onComplete };
  const x = useMotionValue(0),
    y = useMotionValue(0),
    opacity = useMotionValue(0),
    statusX = useMotionValue(0);
  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host) return;
    let frame = 0,
      previous = 0;
    const tick = (now: number) => {
      if (previous && running && !finished)
        elapsed.current = Math.min(
          11200,
          elapsed.current + Math.min(now - previous, 100),
        );
      previous = now;
      const done = finished || reduced || elapsed.current >= 10400;
      const index = Math.min(3, Math.floor(elapsed.current / 2600));
      const local = elapsed.current - index * 2600;
      const phase: ExtractionState["phase"] = done
        ? "done"
        : local < 700
          ? "source"
          : local < 1800
            ? "transfer"
            : "capture";
      const count = done ? 4 : index + (phase === "capture" ? 1 : 0);
      const key = `${index}-${count}-${phase}`;
      if (key !== reported.current) {
        reported.current = key;
        callbacks.current.onProgress({ index, completed: count, phase });
      }
      const box = host.getBoundingClientRect();
      const mobile = window.matchMedia("(max-width: 760px)").matches;
      const status = ref.current?.querySelector("[data-transfer-status]");
      const statusText = `${!running && !finished ? "Pausiert · " : ""}${done ? "Angaben übernommen" : customerExtractions[index].status}`;
      if (status && status.textContent !== statusText)
        status.textContent = statusText;
      const current = done ? null : customerExtractions[index];
      const active = inspected ?? current?.id;
      host.querySelectorAll<HTMLElement>("[data-crm-source]").forEach((el) => {
        const extraction = customerExtractions.find(
          (item) => item.id === active,
        );
        el.toggleAttribute(
          "data-extraction-active",
          !!extraction?.sources.some((id) => id === el.dataset.crmSource),
        );
      });
      let cursor: { x: number; y: number } | null = null;
      customerExtractions.forEach((item, i) => {
        const target = host.querySelector<HTMLElement>(
          `[data-crm-field-id="${item.id}"]`,
        );
        const sources = host.querySelectorAll<HTMLElement>(
          `[data-crm-source="${item.primary}"]`,
        );
        const source = sources[sources.length - 1];
        const selected = active === item.id;
        target?.toggleAttribute("data-extraction-active", selected);
        const reveal =
          done || i < index
            ? 1
            : i === index
              ? Math.max(0, Math.min(1, (local - 1800) / 600))
              : 0;
        target?.style.setProperty("--extraction-reveal", String(reveal));
        const paths = ref.current?.querySelectorAll<SVGPathElement>(
          `[data-extraction-line="${item.id}"]`,
        );
        paths?.forEach((path) => {
          const originId = path.dataset.secondary ? "request" : item.primary;
          const origins = host.querySelectorAll<HTMLElement>(
            `[data-crm-source="${originId}"]`,
          );
          const origin = origins[origins.length - 1];
          const group = path.parentElement;
          if (!origin || !target || !source) {
            group?.setAttribute("opacity", "0");
            return;
          }
          const a = origin.getBoundingClientRect(),
            b = target.getBoundingClientRect();
          const edge =
            origin.closest(".mail-question,p")?.getBoundingClientRect().right ??
            a.right;
          const sx = edge - box.left + 4,
            sy = a.top + a.height / 2 - box.top;
          const tx = b.left - box.left - 5,
            ty = b.top + b.height / 2 - box.top;
          const bend = Math.max(12, (tx - sx) * 0.45);
          path.setAttribute(
            "d",
            `M${sx} ${sy} C${sx + bend} ${sy} ${tx - bend} ${ty} ${tx} ${ty}`,
          );
          const progress =
            done || i < index || (i === index && phase === "capture")
              ? 1
              : i === index && phase === "transfer"
                ? (local - 700) / 1100
                : 0;
          const length = path.getTotalLength();
          path.style.strokeDasharray = `${length}`;
          path.style.strokeDashoffset = `${length * (1 - progress)}`;
          group?.setAttribute(
            "opacity",
            mobile || (path.dataset.secondary && !selected)
              ? "0"
              : progress > 0
                ? selected
                  ? "1"
                  : ".22"
                : "0",
          );
          const dots = group?.querySelectorAll("circle");
          dots?.[0]?.setAttribute("cx", String(sx));
          dots?.[0]?.setAttribute("cy", String(sy));
          dots?.[1]?.setAttribute("cx", String(tx));
          dots?.[1]?.setAttribute("cy", String(ty));
          if (dots?.[1]) dots[1].style.opacity = progress >= 1 ? "1" : "0";
          if (!path.dataset.secondary && !done && i === index) {
            const p = path.getPointAtLength(
              length * Math.max(0, Math.min(1, (local - 700) / 1100)),
            );
            cursor = { x: p.x, y: p.y };
          }
        });
      });
      if (cursor && !mobile && !reduced && !done) {
        const point = cursor as { x: number; y: number };
        x.set(point.x - 26);
        y.set(point.y - 26);
        statusX.set(
          Math.max(12, Math.min(box.width - 212, point.x - 100)) -
            (point.x - 26),
        );
        opacity.set(1);
      } else opacity.set(0);
      if (
        (reduced || elapsed.current >= 11200) &&
        running &&
        !finished &&
        !completed.current
      ) {
        completed.current = true;
        callbacks.current.onComplete();
      }
      if (running && !finished && !completed.current)
        frame = requestAnimationFrame(tick);
    };
    const refresh = () => {
      if (!running || finished) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(tick);
      }
    };
    const observer = new ResizeObserver(refresh);
    observer.observe(host);
    host
      .querySelectorAll(".map-node,.app-window")
      .forEach((el) => observer.observe(el));
    const mutations = new MutationObserver(refresh);
    mutations.observe(host, { childList: true, subtree: true });
    window.addEventListener("resize", refresh);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
      window.removeEventListener("resize", refresh);
      host
        .querySelectorAll("[data-extraction-active]")
        .forEach((el) => el.removeAttribute("data-extraction-active"));
    };
  }, [running, finished, reduced, inspected, x, y, opacity, statusX]);
  return (
    <div
      ref={ref}
      className="knowledge-scan-overlay customer-transfer"
      aria-hidden="true"
    >
      <svg className="scan-connections customer-transfer-lines">
        {customerExtractions.flatMap((item) =>
          [false, ...(item.id === "request" ? [true] : [])].map((secondary) => (
            <g key={item.id + secondary}>
              <path
                data-extraction-line={item.id}
                data-secondary={secondary ? "true" : undefined}
              />
              <circle r="2.5" />
              <circle r="3" />
            </g>
          )),
        )}
      </svg>
      <motion.div
        className="ai-scan-cursor"
        data-running={running && !finished}
        style={{ x, y, opacity }}
      >
        <AiSymbol />
        <motion.span
          data-transfer-status
          className="ai-current-status"
          style={{ x: statusX }}
        >
          Angaben übernehmen
        </motion.span>
      </motion.div>
    </div>
  );
}
