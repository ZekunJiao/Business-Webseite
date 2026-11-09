import { DEMO_PLAYBACK_SPEED } from "../lib/demoTiming";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValue } from "motion/react";

export function SourceMatchStamp({
  concern,
  article,
  running,
  reduced,
}: {
  concern: number;
  article: string;
  running: boolean;
  reduced: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const stampRef = useRef<HTMLSpanElement>(null);
  const elapsed = useRef(0);
  const startY = useRef(0);
  const [settled, setSettled] = useState(reduced || !running);
  const y = useMotionValue(0),
    fontSize = useMotionValue(25),
    opacity = useMotionValue(0.2),
    rotate = useMotionValue(-7),
    lineHeight = useMotionValue(1.25);
  const label = `Anliegen ${concern} → ${article}`;

  useLayoutEffect(() => {
    const root = ref.current,
      stamp = stampRef.current;
    const question = root?.closest(".mail-question");
    const copy = question?.querySelector(".mail-question-copy");
    if (!root || !stamp || !question || !copy) return;
    const footer = root.getBoundingClientRect(),
      paragraph = copy.getBoundingClientRect();
    // Center the translucent stamp on its own paragraph, keeping its top inside it.
    startY.current = Math.max(
      question.getBoundingClientRect().top - footer.top + 4,
      paragraph.top - footer.top + (paragraph.height - stamp.offsetHeight) / 2,
    );
    y.set(startY.current);
  }, [y]);

  useEffect(() => {
    if (settled) return;
    if (reduced) {
      setSettled(true);
      return;
    }
    if (!running) return;
    let frame = 0,
      previous = 0;
    const tick = (now: number) => {
      if (previous)
        elapsed.current += Math.min(now - previous, 100) * DEMO_PLAYBACK_SPEED;
      previous = now;
      const progress = Math.min(1, elapsed.current / 1550);
      // Let the large stamp register, then shrink and glide into the footer.
      const t = Math.max(0, (progress - 0.18) / 0.82);
      const ease = t * t * (3 - 2 * t);
      y.set(startY.current * (1 - ease));
      fontSize.set(25 - 13 * ease);
      lineHeight.set(1.25 + 0.25 * ease);
      rotate.set(-7 * (1 - ease));
      opacity.set(0.2 + 0.8 * ease);
      if (progress >= 1) setSettled(true);
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, reduced, settled, y, fontSize, lineHeight, rotate, opacity]);

  return (
    <span
      ref={ref}
      className="source-match"
      data-stamp-state={settled ? "settled" : "stamping"}
    >
      <span className="scan-match-label" style={{ opacity: settled ? 1 : 0 }}>
        {label}
      </span>
      {!settled && (
        <motion.span
          ref={stampRef}
          className="source-match-stamp"
          aria-hidden="true"
          style={{ y, fontSize, lineHeight, opacity, rotate }}
        >
          {label}
        </motion.span>
      )}
    </span>
  );
}
