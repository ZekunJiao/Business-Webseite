import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Check,
  CircleHelp,
  FilePenLine,
  Inbox,
  LibraryBig,
  ContactRound,
  RotateCcw,
  UserRoundCheck,
} from "lucide-react";
import { Button } from "./ui/button";
import { DemoResult } from "./DemoResult";
import { scenarios, sources } from "../data";
import type { ScenarioId } from "../data";
import { customerExtractions } from "../customerExtraction";

const scenarioIds = Object.keys(scenarios) as ScenarioId[];

function Step({
  index,
  title,
  caption,
  icon,
  children,
  reduced,
}: {
  index: number;
  title: string;
  caption: string;
  icon: ReactNode;
  children: ReactNode;
  reduced: boolean;
}) {
  return (
    <motion.section
      className="mobile-step"
      id={`mobile-step-${index}`}
      aria-labelledby={`mobile-step-title-${index}`}
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <header>
        <span className="mobile-step-number" aria-hidden="true">
          {index}
        </span>
        <div>
          <h3 id={`mobile-step-title-${index}`}>{title}</h3>
          <span>{caption}</span>
        </div>
        {icon}
      </header>
      {children}
    </motion.section>
  );
}

export function MobileEmailFlow({
  initialScenario = "partial",
}: {
  initialScenario?: ScenarioId;
}) {
  const reduced = !!useReducedMotion();
  const [scenario, setScenario] = useState<ScenarioId>(initialScenario);
  const [step, setStep] = useState(0);
  const touched = useRef(false);
  const data = scenarios[scenario];
  const unknown = scenario === "unknown";
  const isRequest = scenario !== "complete";
  const last = unknown ? 1 : 3;
  const relevantIndexes = [
    ...new Set(data.answerSources.filter((i): i is number => i !== null)),
  ];
  const nextLabel = [
    unknown
      ? "Absender prüfen"
      : isRequest
        ? "Kundin zuordnen"
        : "Betriebswissen nutzen",
    "Antwort vorbereiten",
    "Ergebnis ansehen",
  ][step];
  useEffect(() => {
    if (!touched.current) return;
    const id = step >= last ? "mobile-result" : `mobile-step-${step + 1}`;
    document
      .getElementById(id)
      ?.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
  }, [step, last, reduced]);
  const choose = (id: ScenarioId) => {
    touched.current = false;
    setScenario(id);
    setStep(0);
  };
  const advance = () => {
    touched.current = true;
    setStep((s) => Math.min(last, s + 1));
  };
  const infoFields = customerExtractions.filter((e) => e.group === "info");
  const taskFields = customerExtractions.filter((e) => e.group === "task");
  const fieldList = (items: (typeof customerExtractions)[number][]) => (
    <dl className="mobile-fields">
      {items.map((item) => {
        const field = data.crmFields.find((f) => f.label === item.field);
        return (
          <div key={item.id}>
            <dt>
              {item.field}
              <Check size={14} aria-hidden="true" />
            </dt>
            <dd>{field?.value}</dd>
            <small>Quelle: {item.reference}</small>
          </div>
        );
      })}
    </dl>
  );
  return (
    <section
      className="demo mobile-demo"
      aria-label="Interaktive E-Mail-Demo, vereinfacht für kleine Bildschirme"
    >
      <div className="mobile-demo-body">
        <p className="mobile-demo-intro">
          Wähle eine Beispielmail. Dann gehst du Schritt für Schritt durch den
          Ablauf.
        </p>
        <div className="mobile-mail-choice" role="group" aria-label="Beispielmail">
          {scenarioIds.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={id === scenario}
              onClick={() => choose(id)}
            >
              <strong>{scenarios[id].sender}</strong>
              <span>{scenarios[id].subject}</span>
            </button>
          ))}
        </div>
        <Step
          key={`${scenario}-1`}
          index={1}
          title="Mail im Posteingang"
          caption="Microsoft Outlook"
          icon={<Inbox size={18} aria-hidden="true" />}
          reduced={reduced}
        >
          <div className="mobile-mail">
            <strong>{data.sender}</strong>
            <small>{data.email}</small>
            <h4>{data.subject}</h4>
            <p>{data.intro}</p>
            {data.questions.map((q) => (
              <p key={q}>{q}</p>
            ))}
          </div>
        </Step>
        {step >= 1 && (
          <Step
            key={`${scenario}-2`}
            index={2}
            title={isRequest ? "Kundenverwaltung" : "Betriebswissen"}
            caption={
              isRequest
                ? "z. B. Excel oder Handwerkersoftware"
                : "Interne Dokumente"
            }
            icon={
              isRequest ? (
                <ContactRound size={18} aria-hidden="true" />
              ) : (
                <LibraryBig size={18} aria-hidden="true" />
              )
            }
            reduced={reduced}
          >
            {unknown ? (
              <div className="mobile-warning">
                <CircleHelp size={18} />
                <span>
                  Absender nicht eindeutig zugeordnet. Die Anfrage wird zur
                  manuellen Prüfung markiert. Es entsteht kein automatischer
                  Entwurf.
                </span>
              </div>
            ) : isRequest ? (
              <>
                <p className="mobile-status">
                  <Check size={15} />
                  Absender erkannt · Kundin zugeordnet
                </p>
                <p className="mobile-record">
                  <strong>Neue Wartungsanfrage</strong>
                  <span>Neu · Prüfung offen · noch kein Auftrag</span>
                </p>
                <h4>Angaben aus der E-Mail</h4>
                {fieldList(infoFields)}
                <h4>Aufgaben</h4>
                {fieldList(taskFields)}
              </>
            ) : (
              <>
                <p className="mobile-status">
                  <Check size={15} />
                  {relevantIndexes.length} von {sources.length} Dokumenten
                  passen zur Mail
                </p>
                <ul className="mobile-sources">
                  {relevantIndexes.map((i) => (
                    <li key={i}>{sources[i].title}</li>
                  ))}
                </ul>
              </>
            )}
          </Step>
        )}
        {step >= 2 && !unknown && (
          <Step
            key={`${scenario}-3`}
            index={3}
            title="Antwortentwurf"
            caption="Microsoft Outlook · nicht gesendet"
            icon={<FilePenLine size={18} aria-hidden="true" />}
            reduced={reduced}
          >
            <div className="mobile-draft">
              <p>{data.salutation}</p>
              {data.answers.map((answer, i) => (
                <p
                  key={answer}
                  className={
                    data.openAnswerIndices.includes(i)
                      ? "mobile-answer missing"
                      : "mobile-answer"
                  }
                >
                  {answer}
                </p>
              ))}
              <p>
                Freundliche Grüße
                <br />
                Ihr Serviceteam
              </p>
            </div>
            {data.openAnswerIndices.length > 0 && (
              <p className="draft-legend">
                <span aria-hidden="true" />
                Orange = noch offen. Hier ergänzt dein Team.
              </p>
            )}
            <p className="mobile-review">
              <UserRoundCheck size={17} />
              Prüfung und Versand bleiben bei deinem Team.
            </p>
          </Step>
        )}
        {step >= last && (
          <div id="mobile-result" className="mobile-result">
            <DemoResult
              scenario={scenario}
              relevantSources={relevantIndexes.length}
              totalSources={sources.length}
              openAnswers={data.openAnswerIndices.length}
            />
          </div>
        )}
        <div className="mobile-actions">
          {step < last ? (
            <Button className="mobile-next" onClick={advance}>
              Weiter: {nextLabel}
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              className="mobile-next"
              variant="outline"
              onClick={() => choose(scenario)}
            >
              <RotateCcw size={15} />
              Noch einmal von vorn
            </Button>
          )}
        </div>
      </div>
      <div className="demo-bottom">
        <span>Beispieldemo · Daten sind erfunden · Nichts wird gesendet</span>
      </div>
    </section>
  );
}
