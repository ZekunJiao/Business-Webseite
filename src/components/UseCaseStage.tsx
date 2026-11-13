import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { OverviewFlow } from "./OverviewFlow";
import { PhoneStory } from "./PhoneStory";
import { InboxStory } from "./InboxStory";
import {
  overviewSets,
  upcomingUseCases,
  useCaseSection,
} from "../overviewFlows";

const PARAM = "anwendungsfall";

// Auswahl aus ?anwendungsfall=…, sonst aus einem alten Anker wie #telefon.
function readSelected(): { id: string; linked: boolean } {
  const known = (id: string | null | undefined) =>
    overviewSets.find((set) => set.id === id)?.id;
  const fromParam = known(
    new URLSearchParams(window.location.search).get(PARAM),
  );
  if (fromParam) return { id: fromParam, linked: true };
  const fromHash = known(window.location.hash.slice(1));
  if (fromHash) return { id: fromHash, linked: true };
  return { id: overviewSets[0].id, linked: false };
}

// Karten für alle Anwendungsfälle, darunter eine Bühne mit genau einer
// Überblick-Animation für den gewählten Fall.
export function UseCaseStage() {
  const reduced = !!useReducedMotion();
  const [selected, setSelected] = useState(() => readSelected().id);
  const stageRef = useRef<HTMLDivElement>(null);
  const set = overviewSets.find((entry) => entry.id === selected)!;

  const showStage = (force: boolean) => {
    const stage = stageRef.current;
    if (!stage) return;
    // Nur scrollen, wenn die Bühne nicht ohnehin im Blick ist.
    if (!force && stage.getBoundingClientRect().top < window.innerHeight * 0.6)
      return;
    stage.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  };

  // Direktlink: nach dem Laden zur Bühne springen.
  useEffect(() => {
    if (readSelected().linked) showStage(true);
    const restore = () => setSelected(readSelected().id);
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);

  const select = (id: string) => {
    if (id === selected) return;
    setSelected(id);
    const url = new URL(window.location.href);
    if (id === overviewSets[0].id) url.searchParams.delete(PARAM);
    else url.searchParams.set(PARAM, id);
    if (overviewSets.some((entry) => `#${entry.id}` === url.hash))
      url.hash = "";
    window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
    requestAnimationFrame(() => showStage(false));
  };

  return (
    <section
      id="ueberblick"
      className="usecases"
      aria-labelledby="ueberblick-title"
    >
      <div className="usecases-head">
        <span className="overview-kicker">
          <span className="status-dot" />
          {useCaseSection.kicker}
        </span>
        <h2 id="ueberblick-title">{useCaseSection.title}</h2>
        <p>{useCaseSection.intro}</p>
      </div>
      <div
        className="usecase-cards"
        role="group"
        aria-label="Anwendungsfall wählen"
      >
        {overviewSets.map((entry) => {
          const Icon = entry.card.icon;
          const active = entry.id === selected;
          return (
            <button
              key={entry.id}
              type="button"
              className="usecase-card"
              aria-pressed={active}
              aria-controls="anwendungsfall-buehne"
              onClick={() => select(entry.id)}
            >
              <span className="usecase-card-icon">
                <Icon size={20} aria-hidden="true" />
              </span>
              <strong>{entry.card.title}</strong>
              <span className="usecase-card-teaser">{entry.card.teaser}</span>
              <span className="usecase-card-tag">
                {active ? "Wird unten gezeigt" : (entry.card.cta ?? "Beispiel ansehen")}
              </span>
            </button>
          );
        })}
        {upcomingUseCases.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="usecase-card usecase-card-upcoming"
              aria-disabled="true"
            >
              <span className="usecase-card-icon">
                <Icon size={20} aria-hidden="true" />
              </span>
              <strong>{card.title}</strong>
              <span className="usecase-card-teaser">{card.teaser}</span>
              <span className="usecase-card-tag">In Vorbereitung</span>
            </div>
          );
        })}
      </div>
      <div
        ref={stageRef}
        id="anwendungsfall-buehne"
        className="usecase-stage"
      >
        {set.id === "telefon" ? (
          <PhoneStory key={set.id} set={set} />
        ) : set.id === "anfragen" ? (
          <InboxStory key={set.id} set={set} />
        ) : (
          <OverviewFlow key={set.id} set={set} />
        )}
      </div>
    </section>
  );
}
