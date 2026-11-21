// Ablauf der Zusammenarbeit und häufige Fragen für die Branchenseiten.
// Inhalte je Branche in src/branches. Aussagen hier sind Zusagen: Preise
// erst eintragen, wenn das Angebot steht.

import { ChevronDown } from "lucide-react";
import type { Branch } from "../branches/types";

export function ProcessFaq({ process }: { process: Branch["process"] }) {
  const { steps, faqs } = process;
  return (
    <section id="ablauf" className="process" aria-labelledby="ablauf-title">
      <div className="usecases-head">
        <span className="overview-kicker">
          ZUSAMMENARBEIT
        </span>
        <h2 id="ablauf-title">So läuft es ab</h2>
        <p>{process.intro}</p>
      </div>
      <ol className="process-steps">
        {steps.map((step, index) => (
          <li key={step.title}>
            <span className="process-step-number" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <strong>{step.title}</strong>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
      <div className="process-faq">
        <h3>Häufige Fragen</h3>
        {faqs.map((faq) => (
          <details key={faq.question}>
            <summary>
              {faq.question}
              <ChevronDown
                className="process-faq-chevron"
                size={18}
                aria-hidden="true"
              />
            </summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
