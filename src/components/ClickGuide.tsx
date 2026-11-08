import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { AiSymbol } from "./AiSymbol";

export type GuideTarget = "mailbox" | "example" | "resume" | "again" | null;
const messages = {
  mailbox: ["Hier geht’s los", "Posteingang öffnen"],
  example: ["Such dir eine Mail aus", "Mit ▶ ein Beispiel starten"],
  resume: ["Hier geht’s weiter", "Das Beispiel fortsetzen"],
  again: ["Noch ein Beispiel?", "Eine andere Mail ausprobieren"],
};

export function ClickGuide({
  target,
  example,
  reduced,
  onActivate,
}: {
  target: GuideTarget;
  example: string;
  reduced: boolean;
  onActivate: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState({
    x: 180,
    y: 20,
    above: false,
    ready: false,
  });
  const [message, setMessage] = useState(messages.mailbox);
  useEffect(() => {
    if (target) setMessage(messages[target]);
  }, [target]);
  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host || !target) return;
    let frame = 0;
    const started = performance.now();
    const measure = () => {
      const destination = host.querySelector(
        target === "mailbox"
          ? ".mailbox .app-tile"
          : `[data-example="${example}"] .mail-play-button`,
      );
      if (!destination) return;
      const box = host.getBoundingClientRect(),
        r = destination.getBoundingClientRect();
      const width = Math.min(250, box.width - 24);
      const height =
        ref.current?.querySelector<HTMLElement>(".click-guide-widget")
          ?.offsetHeight ?? 80;
      const above = box.width < 700;
      const x = Math.max(
        12,
        Math.min(
          box.width - width - 12,
          above ? r.right - box.left - width + 8 : r.right - box.left + 20,
        ),
      );
      const y = Math.max(
        12,
        above
          ? r.top - box.top - height - 22
          : r.top - box.top + r.height / 2 - height / 2,
      );
      setAnchor((old) =>
        old.ready &&
        old.above === above &&
        Math.abs(old.x - x) < 0.5 &&
        Math.abs(old.y - y) < 0.5
          ? old
          : { x, y, above, ready: true },
      );
    };
    // Track the opening window while it settles, then only measure on resize.
    const settle = () => {
      measure();
      if (performance.now() - started < 600)
        frame = requestAnimationFrame(settle);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    const mailbox = host.querySelector(".map-node.mailbox");
    if (mailbox) observer.observe(mailbox);
    window.addEventListener("resize", measure);
    frame = requestAnimationFrame(settle);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [target, example]);
  const visible = !!target && anchor.ready;
  return (
    <div ref={ref} className="click-guide-layer">
      <motion.button
        type="button"
        className={`click-guide-widget ${anchor.above ? "guide-above" : "guide-beside"}`}
        initial={reduced ? false : { x: 180, y: 20, opacity: 0, scale: 0.7 }}
        animate={{
          x: anchor.x,
          y: anchor.y,
          opacity: visible ? 1 : 0,
          scale: visible ? 1 : 0.8,
        }}
        transition={
          reduced
            ? { duration: 0 }
            : {
                x: { type: "spring", stiffness: 85, damping: 17 },
                y: { type: "spring", stiffness: 85, damping: 17 },
                opacity: { duration: 0.18 },
                scale: { duration: 0.2 },
              }
        }
        onClick={() => {
          const destination =
            ref.current?.parentElement?.querySelector<HTMLElement>(
              target === "mailbox"
                ? ".mailbox .app-tile"
                : `[data-example="${example}"] .mail-play-button`,
            );
          destination?.focus({ preventScroll: true });
          onActivate();
        }}
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
        style={{ pointerEvents: visible ? "auto" : "none" }}
      >
        <ArrowLeft
          className="click-guide-pointer"
          size={18}
          aria-hidden="true"
        />
        <motion.span
          className="click-guide-orb"
          aria-hidden="true"
          animate={{ y: !reduced && visible ? [0, -4, 0] : 0 }}
          transition={{
            duration: 2.4,
            repeat: !reduced && visible ? Infinity : 0,
            ease: "easeInOut",
          }}
        >
          <AiSymbol />
        </motion.span>
        <span className="click-guide-bubble">
          <small className="click-guide-state">
            {target === "resume"
              ? "Pausiert"
              : target === "again"
                ? "Abgeschlossen"
                : "Bereit"}
          </small>
          <strong>{message[0]}</strong>
          <span>{message[1]}</span>
        </span>
      </motion.button>
    </div>
  );
}
