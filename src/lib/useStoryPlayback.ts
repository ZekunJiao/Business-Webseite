import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

export type StoryStatus = "idle" | "playing" | "paused" | "done" | "sent";

// Gemeinsamer Ablauf der Demos mit mehreren Beispielen (Angebote, Termine):
// Ein Beispiel läuft in Takten ("beat") ab, lässt sich pausieren, direkt
// fertig zeigen und am Ende vom Team "senden". Startet einmal von selbst,
// sobald die Bühne gut im Blick ist. Bei reduzierter Bewegung erscheint
// jedes Beispiel direkt fertig.
export function useStoryPlayback(
  ids: string[],
  // Anzahl der Takte eines Beispiels
  totalOf: (index: number) => number,
  // Dauer eines Takts in Millisekunden
  delayOf: (index: number, beat: number) => number,
) {
  const reduced = !!useReducedMotion();
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<StoryStatus>(reduced ? "done" : "idle");
  const [beat, setBeat] = useState(0);
  const [finished, setFinished] = useState<Set<string>>(() => new Set());
  const [sent, setSent] = useState<Set<string>>(() => new Set());
  const stageRef = useRef<HTMLDivElement>(null);
  const autoStarted = useRef(false);

  const id = ids[index];
  const total = totalOf(index);
  const complete = status === "done" || status === "sent";

  useEffect(() => {
    if (status !== "playing") return;
    if (beat >= total) {
      setStatus("done");
      return;
    }
    const timer = window.setTimeout(
      () => setBeat(beat + 1),
      delayOf(index, beat),
    );
    return () => window.clearTimeout(timer);
    // delayOf hängt nur von index und beat ab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, beat, total, index]);

  useEffect(() => {
    if (complete) setFinished((previous) => new Set(previous).add(id));
  }, [complete, id]);

  useEffect(() => {
    const stage = stageRef.current;
    if (reduced || !stage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || autoStarted.current) return;
        autoStarted.current = true;
        setStatus((current) => (current === "idle" ? "playing" : current));
      },
      { rootMargin: "0px 0px -35% 0px" },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, [reduced]);

  const play = (next: number) => {
    autoStarted.current = true;
    setIndex(next);
    setBeat(0);
    setSent((previous) => {
      const copy = new Set(previous);
      copy.delete(ids[next]);
      return copy;
    });
    setStatus(reduced ? "done" : "playing");
  };
  const primary = () => {
    autoStarted.current = true;
    if (status === "idle") setStatus("playing");
    else if (complete) play(index);
    else setStatus(status === "playing" ? "paused" : "playing");
  };
  const showAll = () => {
    autoStarted.current = true;
    setStatus("done");
  };
  const send = () => {
    setSent((previous) => new Set(previous).add(id));
    setStatus("sent");
  };

  return {
    index,
    status,
    beat,
    total,
    complete,
    finished,
    sent,
    stageRef,
    play,
    primary,
    showAll,
    send,
  };
}
