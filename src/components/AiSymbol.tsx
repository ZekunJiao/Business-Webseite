import { BrainCircuit, Pause, PenLine, Search, Sparkles } from "lucide-react";

export type AiActivity =
  "idle" | "thinking" | "searching" | "matching" | "writing" | "paused";

export function AiSymbol({ activity = "idle" }: { activity?: AiActivity }) {
  const Icon =
    activity === "thinking"
      ? BrainCircuit
      : activity === "searching"
        ? Search
        : activity === "writing"
          ? PenLine
          : activity === "paused"
            ? Pause
            : Sparkles;
  return (
    <span className="ai-symbol" data-activity={activity} aria-hidden="true">
      <span className="ai-symbol-icon">
        <Icon size={22} />
      </span>
      <strong className="ai-symbol-label">AI</strong>
    </span>
  );
}
