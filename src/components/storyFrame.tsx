import { Fragment, useEffect, useState } from "react";
import type { ReactNode, RefObject } from "react";
import {
  Check,
  ListEnd,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  UserRoundCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { ColumnLabel } from "./storyParts";
import { useMediaQuery } from "../lib/useMediaQuery";
import type { StoryStatus } from "../lib/useStoryPlayback";
import type { OverviewSet } from "../overviewFlows";
import { StoryTechnical } from "./StoryTechnical";

// Gemeinsamer Rahmen der Demos mit drei Spalten (Eingang, Assistent,
// Ergebnis): Kopf mit Vergleich, Steuerung, Assistentenspalte und die
// Bühne, die auf schmalen Bildschirmen eine Spalte mit Umschalter zeigt.
// Genutzt von den Demos Betriebskosten und Eigentümerversammlung.

export type StoryView = "input" | "assistant" | "result";

// Ab hier zeigt die Bühne eine Spalte mit Umschalter statt drei Spalten.
const TABBED_QUERY = "(max-width: 1100px)";

// Sichtbare Spalte auf schmalen Bildschirmen: folgt dem Ablauf, bis jemand
// selbst umschaltet.
export function useStoryView(autoView: StoryView, index: number) {
  const tabbed = useMediaQuery(TABBED_QUERY);
  const [manualView, setManualView] = useState<StoryView | null>(null);
  useEffect(() => setManualView(null), [autoView, index]);
  return { tabbed, view: manualView ?? autoView, setView: setManualView };
}

export function StoryFrame({
  set,
  className,
  compare,
  example,
  controls,
  stage,
}: {
  set: OverviewSet;
  className: string;
  compare: {
    without: { icon: LucideIcon; text: string };
    with: { icon: LucideIcon; text: string };
  };
  example: { index: number; count: number; headline: string; hint: string };
  controls: ReactNode;
  stage: ReactNode;
}) {
  const WithoutIcon = compare.without.icon;
  const WithIcon = compare.with.icon;
  return (
    <section
      id={set.id}
      className={`overview mailbox-story ${className}`}
      aria-labelledby={`${set.id}-title`}
    >
      <div className="overview-head">
        <span className="overview-kicker">{set.kicker}</span>
        <h3 id={`${set.id}-title`}>{set.title}</h3>
        <p>{set.intro}</p>
      </div>

      <div className="story-compare">
        <div className="story-compare-item" data-tone="without">
          <WithoutIcon size={20} aria-hidden="true" />
          <div>
            <strong>Ohne Assistent</strong>
            <p>{compare.without.text}</p>
          </div>
        </div>
        <div className="story-compare-item" data-tone="with">
          <WithIcon size={20} aria-hidden="true" />
          <div>
            <strong>Mit Assistent</strong>
            <p>{compare.with.text}</p>
          </div>
        </div>
      </div>

      <div className="story-controls">
        <span className="story-example">
          <strong>
            Beispiel {example.index + 1} von {example.count} ·{" "}
            {example.headline}
          </strong>
          <span>{example.hint}</span>
        </span>
        {controls}
      </div>

      {stage}
      <StoryTechnical set={set} />
    </section>
  );
}

// Starten, pausieren, fortsetzen, wiederholen; daneben "Ergebnis zeigen"
// bzw. am Ende "Nächstes Beispiel".
export function StoryButtons({
  status,
  complete,
  onPrimary,
  onNext,
  onShowAll,
}: {
  status: StoryStatus;
  complete: boolean;
  onPrimary: () => void;
  onNext: () => void;
  onShowAll: () => void;
}) {
  const PrimaryIcon =
    status === "playing" ? Pause : complete ? RotateCcw : Play;
  const label =
    status === "idle"
      ? "Assistent starten"
      : status === "playing"
        ? "Pausieren"
        : status === "paused"
          ? "Fortsetzen"
          : "Noch einmal";
  return (
    <div className="story-control-buttons">
      <Button type="button" className="story-primary" onClick={onPrimary}>
        <PrimaryIcon size={16} aria-hidden="true" />
        {label}
      </Button>
      {complete ? (
        <Button type="button" variant="outline" onClick={onNext}>
          <SkipForward size={16} aria-hidden="true" />
          Nächstes Beispiel
        </Button>
      ) : (
        <Button type="button" variant="outline" onClick={onShowAll}>
          <ListEnd size={16} aria-hidden="true" />
          Ergebnis zeigen
        </Button>
      )}
    </div>
  );
}

export type AssistantStep = { kind: string; label: string; result: string };

// Mittlere Spalte: Schritte des Assistenten mit Ergebnis
export function AssistantColumn({
  steps,
  icons,
  status,
  complete,
  stepsDone,
}: {
  steps: AssistantStep[];
  icons: Record<string, LucideIcon>;
  status: StoryStatus;
  complete: boolean;
  stepsDone: number;
}) {
  const working = status === "playing" || status === "paused";
  return (
    <div className="mailbox-column" data-view="assistant">
      <ColumnLabel number={2}>Der Assistent arbeitet</ColumnLabel>
      <div className="mailbox-assistant" data-status={status}>
        <div className="mailbox-assistant-head">
          <span className="mailbox-assistant-icon" aria-hidden="true">
            <UserRoundCog size={18} />
          </span>
          <span>
            <strong>Assistent</strong>
            <span>
              {status === "idle"
                ? "wartet auf den Start"
                : complete
                  ? "fertig"
                  : status === "paused"
                    ? "pausiert"
                    : "arbeitet …"}
            </span>
          </span>
        </div>
        <ol aria-live="polite">
          {steps.map((step, position) => {
            const done = position < stepsDone;
            const current = working && position === stepsDone;
            const Icon = icons[step.kind];
            return (
              <li
                key={step.label}
                data-kind={step.kind}
                data-state={done ? "done" : current ? "current" : "todo"}
              >
                <span className="mailbox-step-icon" aria-hidden="true">
                  <Icon size={18} />
                  {done ? (
                    <span className="mailbox-step-check">
                      <Check size={10} strokeWidth={3.5} />
                    </span>
                  ) : null}
                </span>
                <span className="mailbox-step-text">
                  <strong>{step.label}</strong>
                  {done ? (
                    <span className="mailbox-step-result">{step.result}</span>
                  ) : current ? (
                    <span className="mailbox-step-busy">
                      <i />
                      <i />
                      <i />
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

// Bühne: drei Spalten nebeneinander oder eine Spalte mit Umschalter
export function StoryStage({
  stageRef,
  tabbed,
  view,
  autoView,
  working,
  labels,
  onView,
  columns,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
  tabbed: boolean;
  view: StoryView;
  autoView: StoryView;
  working: boolean;
  labels: Record<StoryView, string>;
  onView: (view: StoryView) => void;
  columns: Record<StoryView, ReactNode>;
}) {
  const order: StoryView[] = ["input", "assistant", "result"];
  return (
    <div className="story-stage mailbox-stage" ref={stageRef}>
      {tabbed ? (
        <>
          <div className="mailbox-views" role="group" aria-label="Ansicht wählen">
            {order.map((entry, position) => (
              <button
                key={entry}
                type="button"
                aria-pressed={view === entry}
                data-active={autoView === entry && working ? true : undefined}
                onClick={() => onView(entry)}
              >
                <span aria-hidden="true">{position + 1}</span>
                {labels[entry]}
              </button>
            ))}
          </div>
          {columns[view]}
        </>
      ) : (
        order.map((entry) => <Fragment key={entry}>{columns[entry]}</Fragment>)
      )}
    </div>
  );
}
