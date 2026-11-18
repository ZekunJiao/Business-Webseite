import { Inbox, PlugZap, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { aiActivityIcons } from "./AiSymbol";
import { techOperations } from "../overviewFlows";
import type { OverviewSet, TechBlock } from "../overviewFlows";

type Row = { key: string; label: string; icon: LucideIcon; block: TechBlock };

// "So hängt es technisch zusammen": vier Bausteine je Anwendungsfall, ohne
// Animation. Aufklappbar über das native details-Element (Tastatur inklusive).
export function StoryTechnical({ set }: { set: OverviewSet }) {
  const rows: Row[] = [
    { key: "input", label: "Eingang", icon: Inbox, block: set.tech.input },
    {
      key: "assistant",
      label: "Assistent",
      icon: aiActivityIcons.idle,
      block: set.tech.assistant,
    },
    {
      key: "connection",
      label: "Anbindung",
      icon: PlugZap,
      block: set.tech.connection,
    },
    {
      key: "operations",
      label: "Datenschutz & Betrieb",
      icon: ShieldCheck,
      block: {
        ...techOperations,
        notes: [
          ...(techOperations.notes ?? []),
          ...(set.tech.operationsNotes ?? []),
        ],
      },
    },
  ];
  return (
    <details className="story-technical">
      <summary>So hängt es technisch zusammen</summary>
      <ul className="tech-blocks">
        {rows.map(({ key, label, icon: Icon, block }) => (
          <li key={key} data-block={key}>
            <span className="tech-block-icon" aria-hidden="true">
              <Icon size={18} />
            </span>
            <strong>{label}</strong>
            <p>{block.text}</p>
            {block.tools.length ? (
              <div className="tech-block-tools">
                <span>Womit</span>
                <ul>
                  {block.tools.map((tool) => (
                    <li key={tool.role + tool.name}>
                      {tool.role}: <strong>{tool.name}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {block.notes?.length ? (
              <ul className="tech-block-notes">
                {block.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </details>
  );
}
