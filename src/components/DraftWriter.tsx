import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue } from "motion/react";
import { AiSymbol } from "./AiSymbol";
import { keepCursorClear } from "../lib/keepCursorClear";

export function DraftWriter({
  running,
  finished,
  reduced,
  answers,
  matches,
  onComplete,
}: {
  running: boolean;
  finished: boolean;
  reduced: boolean;
  answers: string[];
  matches: (number | null)[];
  onComplete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0);
  const complete = useRef(false);
  const callback = useRef(onComplete);
  const [status, setStatus] = useState("Sammle Betriebswissen");
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const opacity = useMotionValue(0),
    statusX = useMotionValue(0);
  useEffect(() => {
    callback.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host) return;
    // Reading the source and flying to the draft precede each paragraph.
    const durations = answers.map(
      (answer) => 1800 + (answer.length / 42) * 1000,
    );
    const duration = durations.reduce((a, b) => a + b, 0);
    let frame = 0,
      previous = 0;
    const tick = (now: number) => {
      if (previous && running && !finished)
        elapsed.current = Math.min(
          duration,
          elapsed.current + Math.min(now - previous, 100),
        );
      previous = now;
      const done = finished || reduced || elapsed.current >= duration;
      let remaining = elapsed.current,
        index = 0;
      while (index < durations.length - 1 && remaining >= durations[index]) {
        remaining -= durations[index++];
      }
      const writing = remaining >= 1800;
      setStatus(
        done
          ? "Entwurf vorbereitet"
          : `${running ? "" : "Pausiert · "}${writing ? "Schreibe Antwort" : "Sammle Betriebswissen"} · ${index + 1}/${answers.length}`,
      );
      const box = host.getBoundingClientRect();
      const texts = answers.map((_, i) =>
        host.querySelector<HTMLElement>(`[data-draft-writing-text="${i}"]`),
      );
      texts.forEach((el, i) => {
        if (!el) return;
        const count =
          done || i < index
            ? answers[i].length
            : i === index
              ? Math.max(0, Math.floor(((remaining - 1800) / 1000) * 42))
              : 0;
        const text = answers[i].slice(0, count);
        if (el.textContent !== text) el.textContent = text;
      });
      host
        .querySelectorAll<HTMLElement>("[data-knowledge-source]")
        .forEach((el) => {
          el.toggleAttribute(
            "data-writer-active",
            !done && Number(el.dataset.knowledgeSource) === matches[index],
          );
        });
      const target = texts[index];
      const source = host.querySelector<HTMLElement>(
        `[data-knowledge-source="${matches[index]}"]`,
      );
      if (!done && target && source && !reduced) {
        const a = source.getBoundingClientRect(),
          b = target.getBoundingClientRect();
        let px = a.left + a.width * 0.65,
          py = a.top + a.height / 2;
        if (remaining >= 900 && remaining < 1800) {
          const t = (remaining - 900) / 900;
          const ease = t * t * (3 - 2 * t);
          px += (b.left - px) * ease;
          py += (b.top + 12 - py) * ease;
          py -= Math.sin(t * Math.PI) * 25;
        } else if (writing) {
          // Track the actual final visible character, including wrapped lines.
          const node = target.firstChild;
          if (node?.textContent?.length) {
            const range = document.createRange();
            range.setStart(node, node.textContent.length - 1);
            range.setEnd(node, node.textContent.length);
            const end = range.getBoundingClientRect();
            px = end.right + 12;
            py = end.top + end.height / 2;
          } else {
            px = b.left;
            py = b.top + 12;
          }
        } else {
          px += Math.sin(remaining / 200) * 14;
        }
        const safe = keepCursorClear(
          {
            x: Math.max(26, Math.min(box.width - 36, px - box.left)),
            y: py - box.top,
          },
          host,
        );
        if (safe) {
          x.set(safe.x - 26);
          y.set(safe.y - 26);
          statusX.set(
            Math.max(12, Math.min(box.width - 212, safe.x - 100)) - x.get(),
          );
          opacity.set(1);
        } else opacity.set(0);
      } else opacity.set(0);
      ref.current
        ?.querySelectorAll<SVGPathElement>("[data-draft-connection]")
        .forEach((path, i) => {
          const a = host
            .querySelector(`[data-knowledge-source="${matches[i]}"]`)
            ?.getBoundingClientRect();
          const b = host
            .querySelector(`[data-draft-answer="${i}"]`)
            ?.getBoundingClientRect();
          if (a && b && (done || i < index || (i === index && writing))) {
            const x1 = a.right - box.left,
              x2 = b.left - box.left,
              mid = (x1 + x2) / 2;
            const y1 = a.top + a.height / 2 - box.top,
              y2 = b.top + b.height / 2 - box.top;
            path.setAttribute(
              "d",
              `M${x1} ${y1} C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`,
            );
            path.style.opacity = "1";
          } else path.style.opacity = "0";
        });
      if (done && running && !finished && !complete.current) {
        complete.current = true;
        callback.current();
      }
      if (running && !done) frame = requestAnimationFrame(tick);
    };
    const refresh = () => {
      if (!running || finished) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(tick);
      }
    };
    const observer = new ResizeObserver(refresh);
    observer.observe(host);
    host.querySelectorAll(".map-node").forEach((el) => observer.observe(el));
    window.addEventListener("resize", refresh);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", refresh);
      host
        .querySelectorAll("[data-writer-active]")
        .forEach((el) => el.removeAttribute("data-writer-active"));
    };
  }, [running, finished, reduced, answers, matches, x, y, opacity, statusX]);

  return (
    <div
      ref={ref}
      className="knowledge-scan-overlay draft-writer"
      aria-hidden="true"
    >
      <svg className="scan-connections">
        {answers.map((_, i) => (
          <path key={i} data-draft-connection={i} />
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
