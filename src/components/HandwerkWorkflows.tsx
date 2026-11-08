import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { FileText, Mail, Phone } from "lucide-react";
import { Button } from "./ui/button";

const workflows = [
  {
    id: "email",
    label: "E-Mail-Anfragen",
    icon: Mail,
    title: "Vom Posteingang zum Antwortentwurf",
    description:
      "Kunden zuordnen, vorhandenes Wissen nutzen und Antworten vorbereiten.",
  },
  {
    id: "telefonassistenz",
    label: "Telefonassistenz",
    icon: Phone,
    title: "Anrufe entgegennehmen und Anliegen erfassen",
    description:
      "Ein möglicher Ablauf für Fragen, Rückrufwünsche und die Abstimmung von Terminen.",
  },
  {
    id: "angebote",
    label: "Angebote",
    icon: FileText,
    title: "Angebote vorbereiten",
    description:
      "Ein möglicher Ablauf, der Angaben aus Anfragen übernimmt und fehlende Informationen sichtbar macht.",
  },
] as const;
type WorkflowId = (typeof workflows)[number]["id"];

function readWorkflow(): WorkflowId {
  const requested = new URLSearchParams(window.location.search).get("demo");
  return workflows.find((workflow) => workflow.id === requested)?.id ?? "email";
}

export function HandwerkWorkflows({
  children,
}: {
  children: (active: boolean) => ReactNode;
}) {
  const [selected, setSelected] = useState<WorkflowId>(readWorkflow);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  useLayoutEffect(() => {
    const tab =
      tabs.current[workflows.findIndex((workflow) => workflow.id === selected)];
    const strip = tab?.parentElement;
    if (!tab || !strip) return;
    const tabBox = tab.getBoundingClientRect();
    const stripBox = strip.getBoundingClientRect();
    if (tabBox.right > stripBox.right)
      strip.scrollLeft += tabBox.right - stripBox.right;
    if (tabBox.left < stripBox.left)
      strip.scrollLeft -= stripBox.left - tabBox.left;
  }, [selected]);
  useEffect(() => {
    const restore = () => setSelected(readWorkflow());
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);

  const select = (id: WorkflowId) => {
    if (id === selected) return;
    setSelected(id);
    const url = new URL(window.location.href);
    if (id === "email") url.searchParams.delete("demo");
    else url.searchParams.set("demo", id);
    window.history.pushState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  };
  const navigate = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % workflows.length;
    else if (event.key === "ArrowLeft")
      next = (index + workflows.length - 1) % workflows.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = workflows.length - 1;
    else return;
    event.preventDefault();
    select(workflows[next].id);
    tabs.current[next]?.focus();
  };

  return (
    <section
      id="workflow"
      className="workflow-workspace"
      aria-label="Abläufe fürs Handwerk"
    >
      <div className="workflow-tab-bar">
        <div
          className="workflow-tab-list"
          role="tablist"
          aria-label="Workflow auswählen"
        >
          {workflows.map(({ id, label, icon: Icon }, index) => (
            <Button
              key={id}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              type="button"
              variant="ghost"
              role="tab"
              id={`workflow-tab-${id}`}
              aria-controls={`workflow-panel-${id}`}
              aria-selected={selected === id}
              tabIndex={selected === id ? 0 : -1}
              className="workflow-tab"
              onClick={() => select(id)}
              onKeyDown={(event) => navigate(event, index)}
            >
              <Icon size={17} aria-hidden="true" />
              {label}
            </Button>
          ))}
        </div>
      </div>
      {workflows.map(({ id, icon: Icon, title, description }) => (
        <div
          key={id}
          id={`workflow-panel-${id}`}
          role="tabpanel"
          aria-labelledby={`workflow-tab-${id}`}
          tabIndex={0}
          hidden={selected !== id}
          className="workflow-tab-panel"
        >
          <div className="workflow-panel-heading">
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          {id === "email" ? (
            children(selected === "email")
          ) : (
            <div className="workflow-placeholder">
              <span className="workflow-placeholder-icon" aria-hidden="true">
                <Icon size={34} strokeWidth={1.5} />
              </span>
              <span className="workflow-placeholder-status">
                Demo in Vorbereitung
              </span>
              <h3>Hier entsteht ein weiterer Ablauf.</h3>
              <p>
                Dieser Bereich ist vorbereitet. Die interaktive Demonstration
                folgt.
              </p>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
