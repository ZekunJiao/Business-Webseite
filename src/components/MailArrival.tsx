import { DEMO_PLAYBACK_SPEED } from "../lib/demoTiming";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { Mail } from "lucide-react";

function IncomingMail({
  clock,
  index,
}: {
  clock: MotionValue<number>;
  index: number;
}) {
  const start = index * 310;
  const times = [start, start + 200, start + 1040, start + 1430];
  const horizontal = [
    [-108, -72, -15, 0],
    [-12, 8, 0, 0],
    [108, 72, 15, 0],
  ][index];
  const vertical = index === 1 ? [-135, -100, -18, 0] : [-65, -82, -15, 0];
  const x = useTransform(clock, times, horizontal);
  const y = useTransform(clock, times, vertical);
  const opacity = useTransform(clock, times, [0, 1, 1, 0]);
  const scale = useTransform(clock, times, [0.7, 1, 0.85, 0.2]);
  const rotate = useTransform(clock, times, [index === 0 ? -20 : 20, 0, 0, 0]);
  return (
    <motion.span
      className="incoming-mail"
      style={{ x, y, opacity, scale, rotate }}
    >
      <Mail size={19} />
    </motion.span>
  );
}

export function MailArrival({
  running,
  reduced,
  onComplete,
}: {
  running: boolean;
  reduced: boolean;
  onComplete: () => void;
}) {
  const clock = useMotionValue(0);
  const elapsed = useRef(0);
  const complete = useRef(onComplete);
  useEffect(() => {
    complete.current = onComplete;
  }, [onComplete]);
  useEffect(() => {
    if (!running) return;
    if (reduced) {
      complete.current();
      return;
    }
    let frame = 0,
      previous = 0;
    const tick = (now: number) => {
      if (previous)
        elapsed.current += Math.min(now - previous, 100) * DEMO_PLAYBACK_SPEED;
      previous = now;
      clock.set(elapsed.current);
      if (elapsed.current >= 2200) complete.current();
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, reduced, clock]);
  return (
    <>
      <span className="mail-arrival" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <IncomingMail key={index} index={index} clock={clock} />
        ))}
      </span>
      <span className="sr-only" role="status">
        Drei E-Mails treffen im Posteingang ein.
      </span>
    </>
  );
}
