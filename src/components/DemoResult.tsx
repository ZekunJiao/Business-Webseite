import { Check, Mail } from "lucide-react";
import type { ScenarioId } from "../data";

type ResultStep = { label: string; text: string };

function resultSteps(
  scenario: ScenarioId,
  relevant: number,
  total: number,
  open: number,
): { title: string; steps: ResultStep[] } {
  if (scenario === "partial")
    return {
      title: "Aus einer Mail wurde ein Vorschlag für dein Team",
      steps: [
        {
          label: "Erkannt",
          text: "Wartungsanfrage mit vier Fragen von einer Bestandskundin.",
        },
        {
          label: "Zugeordnet",
          text: "Neuer Vorgang bei der Kundin. Anlage, Anliegen und Zeitfenster stehen darin.",
        },
        {
          label: "Vorbereitet",
          text: `Antwortentwurf mit Rückfrage zum Typenschild. ${open} Punkte bleiben bewusst offen.`,
        },
        {
          label: "Dein Team",
          text: "Prüft, ergänzt die offenen Punkte und sendet selbst. Nichts wurde versendet.",
        },
      ],
    };
  if (scenario === "complete")
    return {
      title: "Aus einer Frage wurde ein Antwortentwurf mit Quellen",
      steps: [
        {
          label: "Erkannt",
          text: "Allgemeine Frage ohne Bezug zu einer Kundin oder einem Vorgang.",
        },
        {
          label: "Nachgeschlagen",
          text: `${relevant} von ${total} Dokumenten im Betriebswissen passen. Die übrigen wurden nicht gebraucht.`,
        },
        {
          label: "Vorbereitet",
          text: "Antwortentwurf, bei dem jeder Absatz auf seine Quelle verweist.",
        },
        {
          label: "Dein Team",
          text: "Prüft die Antwort und sendet selbst. Nichts wurde versendet.",
        },
      ],
    };
  return {
    title: "Bei unklarem Absender wird nichts geraten",
    steps: [
      {
        label: "Erkannt",
        text: "Anfrage ohne Kunden- oder Rechnungsnummer. Es bleibt offen, welches Haus gemeint ist.",
      },
      {
        label: "Nicht zugeordnet",
        text: "Es wurde weder ein Kunde zugeordnet noch ein Entwurf erstellt.",
      },
      {
        label: "Dein Team",
        text: "Klärt die Zuordnung und antwortet danach selbst.",
      },
    ],
  };
}

export function DemoResult({
  scenario,
  relevantSources,
  totalSources,
  openAnswers,
}: {
  scenario: ScenarioId;
  relevantSources: number;
  totalSources: number;
  openAnswers: number;
}) {
  const { title, steps } = resultSteps(
    scenario,
    relevantSources,
    totalSources,
    openAnswers,
  );
  return (
    <section className="demo-result" aria-label="Ergebnis des Beispiels">
      <div className="demo-result-head">
        <span className="demo-result-badge">
          <Check size={15} />
          Ergebnis
        </span>
        <h3>{title}</h3>
      </div>
      <ol className="demo-result-steps">
        {steps.map((step) => (
          <li key={step.label}>
            <strong>{step.label}</strong>
            <span>{step.text}</span>
          </li>
        ))}
      </ol>
      <p className="demo-result-note">
        <Mail size={14} />
        Beispiel mit erfundenen Daten. Fragen oder Ideen für deinen Betrieb?{" "}
        <a href="#kontakt">So erreichst du mich</a>
      </p>
    </section>
  );
}
