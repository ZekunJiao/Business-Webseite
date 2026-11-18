import { BrainCircuit, ListChecks, Pause, PenLine, Search, UserRoundCog } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AiActivity =
  "idle" | "thinking" | "searching" | "matching" | "writing" | "paused";

// Symbol je Tätigkeit; auch die Überblick-Animation nutzt diese Zuordnung.
export const aiActivityIcons: Record<AiActivity, LucideIcon> = {
  idle: UserRoundCog,
  thinking: BrainCircuit,
  searching: Search,
  matching: ListChecks,
  writing: PenLine,
  paused: Pause,
};

export function AiSymbol({ activity = "idle" }: { activity?: AiActivity }) {
  const Icon = aiActivityIcons[activity];
  return (
    <span className="ai-symbol" data-activity={activity} aria-hidden="true">
      <span className="ai-symbol-icon">
        <Icon size={22} />
      </span>
      <strong className="ai-symbol-label">KI</strong>
    </span>
  );
}
