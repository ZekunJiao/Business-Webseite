import { Sparkles } from "lucide-react";

export function AiSymbol() {
  return (
    <span className="ai-symbol" aria-hidden="true">
      <span className="ai-symbol-icon">
        <Sparkles size={30} />
      </span>
      <strong className="ai-symbol-label">AI</strong>
    </span>
  );
}
