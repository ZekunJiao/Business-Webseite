// Kurzer Klingelton, im Browser erzeugt (Web Audio, keine Datei, keine
// Lizenzfrage). Zwei Mal "Brring-brring", zusammen rund 3 Sekunden: Länger
// automatisch abgespielter Ton bräuchte nach WCAG 1.4.2 einen eigenen
// Stopp-Knopf.
//
// Browser spielen Ton erst ab, nachdem jemand auf der Seite geklickt oder
// getippt hat. Vorher wartet ring() auf die erste Eingabe und klingelt dann,
// sofern es bis dahin nicht abgebrochen wurde.

const TONES = [1046, 1318]; // zwei Töne im schnellen Wechsel ergeben das Trillern
const TRILL_S = 0.05;
const BURST_S = 0.35;
const BURST_GAP_S = 0.15;
const CYCLE_PAUSE_S = 1.3;
const CYCLES = 2;
const VOLUME = 0.06;

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

function hasUserActivation() {
  const activation = (navigator as Navigator & {
    userActivation?: { hasBeenActive: boolean };
  }).userActivation;
  // Ohne die Schnittstelle (ältere Browser) einfach versuchen.
  return activation ? activation.hasBeenActive : true;
}

function play(): () => void {
  const Context =
    window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
  if (!Context) return () => {};
  const ctx = new Context();
  const gain = ctx.createGain();
  const oscillator = ctx.createOscillator();
  oscillator.type = "sine";
  oscillator.connect(gain);
  gain.connect(ctx.destination);

  const start = ctx.currentTime + 0.05;
  gain.gain.setValueAtTime(0, start);
  let t = start;
  let end = start;
  for (let cycle = 0; cycle < CYCLES; cycle++) {
    for (let burst = 0; burst < 2; burst++) {
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(VOLUME, t + 0.01);
      for (let step = 0; step * TRILL_S < BURST_S; step++)
        oscillator.frequency.setValueAtTime(
          TONES[step % 2],
          t + step * TRILL_S,
        );
      gain.gain.setValueAtTime(VOLUME, t + BURST_S - 0.01);
      gain.gain.linearRampToValueAtTime(0, t + BURST_S);
      end = t + BURST_S;
      t += BURST_S + BURST_GAP_S;
    }
    t += CYCLE_PAUSE_S - BURST_GAP_S;
  }
  oscillator.start(start);
  oscillator.stop(end + 0.05);
  const close = () => {
    if (ctx.state !== "closed") ctx.close().catch(() => {});
  };
  oscillator.onended = close;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  return () => {
    oscillator.onended = null;
    try {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      oscillator.stop();
    } catch {
      // schon beendet
    }
    close();
  };
}

// Klingelt einmal (sofort oder nach der ersten Eingabe). Gibt eine Funktion
// zurück, die das Klingeln abbricht bzw. das Warten beendet. Ist die erste
// Eingabe ein Klick auf ignore (z. B. "Assistent geht ran"), klingelt es
// nicht mehr.
export function ring(
  ignore?: Element | null,
  // Wird aufgerufen, sobald der Ton tatsächlich startet.
  onPlay?: () => void,
): () => void {
  let stop: (() => void) | null = null;
  let cancelled = false;
  const begin = (event?: Event) => {
    window.removeEventListener("pointerdown", begin);
    window.removeEventListener("keydown", begin);
    if (cancelled) return;
    const target = event?.target;
    if (ignore && target instanceof Node && ignore.contains(target)) return;
    onPlay?.();
    try {
      stop = play();
    } catch {
      stop = null;
    }
  };
  if (hasUserActivation()) begin();
  else {
    window.addEventListener("pointerdown", begin);
    window.addEventListener("keydown", begin);
  }
  return () => {
    cancelled = true;
    window.removeEventListener("pointerdown", begin);
    window.removeEventListener("keydown", begin);
    stop?.();
  };
}
