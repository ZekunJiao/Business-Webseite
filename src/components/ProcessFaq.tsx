// Ablauf der Zusammenarbeit und häufige Fragen für die Handwerk-Seite.
// Aussagen hier sind Zusagen: Preise erst eintragen, wenn das Angebot steht.

const steps = [
  {
    title: "Kostenlose Prozessanalyse",
    text: "45 Minuten, vor Ort in München oder online. Du erzählst, wo im Büro Zeit verloren geht: Anrufe, Anfragen, Angebote oder Rechnungen. Gemeinsam suchen wir den Ablauf mit dem größten Nutzen.",
  },
  {
    title: "Beispiel mit euren Abläufen",
    text: "Ich zeige dir an einem lauffähigen Beispiel, wie es bei euch aussehen würde, mit euren Begriffen und eurer Software.",
  },
  {
    title: "Einführung und Begleitung",
    text: "Ich richte den Assistenten ein, binde ihn an eure Software an und begleite die ersten Wochen. Was nicht passt, passen wir an.",
  },
];

const faqs = [
  {
    question: "Wird etwas ohne uns verschickt?",
    answer:
      "Nein. Der Assistent bereitet Antworten, Angebote und Rechnungen vor. Geprüft und gesendet wird von euch.",
  },
  {
    question: "Müssen wir unsere Software wechseln?",
    answer:
      "Nein. Der Assistent arbeitet mit dem, was ihr schon nutzt, zum Beispiel HERO, ToolTime oder Excel.",
  },
  {
    question: "Geht der Assistent bei jedem Anruf ran?",
    answer:
      "Nein. Er nimmt nur Anrufe an, die ihr an ihn weiterleitet, zum Beispiel nach Feierabend oder wenn besetzt ist. Zu Beginn sagt er, dass ein digitaler Assistent spricht.",
  },
  {
    question: "Wie ist es mit dem Datenschutz?",
    answer:
      "Server, Ablaufsteuerung und Anbindungen laufen in Deutschland, das Sprachmodell in der EU, ohne Training mit euren Daten. Beim Telefonassistenten kommen Anbieter aus den USA dazu; was dort gilt, steht je Dienst unter „So hängt es technisch zusammen“. Für die Verarbeitung schließen wir einen Vertrag zur Auftragsverarbeitung nach DSGVO.",
  },
  {
    question: "Was kostet das?",
    answer:
      "Das hängt vom Ablauf und eurer Software ab. Nach dem ersten Gespräch bekommst du ein konkretes Angebot.",
  },
];

export function ProcessFaq() {
  return (
    <section id="ablauf" className="process" aria-labelledby="ablauf-title">
      <div className="usecases-head">
        <span className="overview-kicker">
          ZUSAMMENARBEIT
        </span>
        <h2 id="ablauf-title">So läuft es ab</h2>
        <p>Du legst dich erst fest, wenn du den Ablauf an einem Beispiel gesehen hast.</p>
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
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
