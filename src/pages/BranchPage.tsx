import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { AuthorBlock } from "../components/AuthorBlock";
import { ProcessFaq } from "../components/ProcessFaq";
import { UseCaseStage } from "../components/UseCaseStage";
import { SystemOverview } from "../components/SystemOverview";
import { contact } from "../contact";
import { LegalLinks } from "./LegalPage";
import type { Branch } from "../branches/types";

// Nach dem Sprung zu "Schreib mir" gleich ins erste Feld, nur bei Klick.
const focusContactForm = () =>
  requestAnimationFrame(() =>
    document
      .querySelector<HTMLInputElement>("#schreib-mir input")
      ?.focus({ preventScroll: true }),
  );

// Branchenseite: Einstieg, Anwendungsfälle mit Demos, Gesamtbild, Ablauf und
// FAQ, Abschluss, Vorstellung mit Kontaktformular. Gleicher Aufbau für alle
// Branchen; die Inhalte kommen aus src/branches.
export function BranchPage({ branch }: { branch: Branch }) {
  const { header, hero, closing } = branch;
  const path = branch.paths[0];
  const HeaderIcon = header.icon;
  const proof = hero.proof
    ? branch.author.results.filter((result) => result.teaser)
    : [];
  return (
    <>
      <header className="site-header">
        <a href={path} className="wordmark">
          <span className="brand-mark">
            <HeaderIcon size={19} />
          </span>
          {header.name}
          <span className="header-tag">{header.tag}</span>
        </a>
        <a className="header-link" href={`${path}#ueberblick`}>
          {header.explore} <ArrowUpRight size={16} />
        </a>
        <span className="header-author">
          <span>von {contact.name}</span>
          <a href="#schreib-mir" onClick={focusContactForm}>
            Kontakt
          </a>
        </span>
      </header>
      <main>
        <div className="hero hero-dark">
          <div className="eyebrow hero-eyebrow">{hero.eyebrow}</div>
          <h1>{hero.title}</h1>
          <p>
            {hero.lead[0]}
            <br className="desktop-break" /> {hero.lead[1]}
          </p>
          <div className="hero-cta">
            <Button asChild className="hero-cta-button">
              <a href="#ueberblick">
                {hero.primaryCta}
                <ArrowDown aria-hidden="true" />
              </a>
            </Button>
            <a
              className="hero-cta-link"
              href="#schreib-mir"
              onClick={focusContactForm}
            >
              {hero.secondaryCta}
            </a>
          </div>
          <a className="hero-person" href="#kontakt">
            {contact.photo && (
              <img src={contact.photo} alt="" width="44" height="44" />
            )}
            <span>
              <strong>{contact.name}</strong>
              <span>
                Informatiker (TU München) · AI Transformation Lead bei der BMW
                Group
              </span>
            </span>
          </a>
          {hero.proof && proof.length ? (
            <div className="hero-proof">
              <div className="hero-proof-head">
                <span className="hero-proof-label">{hero.proof.label}</span>
                <a href="#zahlen">
                  {hero.proof.link} <ArrowDown size={14} aria-hidden="true" />
                </a>
              </div>
              <dl>
                {proof.map((result) => (
                  <div key={result.value}>
                    <dt>{result.value}</dt>
                    <dd>{result.teaser}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>
        <UseCaseStage useCases={branch.useCases} />
        <SystemOverview overview={branch.overview} />
        <ProcessFaq process={branch.process} />
        <section className="closing-cta" aria-labelledby="erstgespraech-title">
          <div className="closing-cta-text">
            <span className="closing-cta-kicker">{closing.kicker}</span>
            <h2 id="erstgespraech-title">{closing.title}</h2>
            {closing.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="closing-cta-person">
            <span className="closing-cta-name">
              <strong>{contact.name}</strong>
              <span>{closing.personRole}</span>
            </span>
            <a href="#schreib-mir" onClick={focusContactForm}>
              {closing.cta}
            </a>
          </div>
        </section>
        {/* Detaildemo vorerst ausgeblendet (siehe README). Zum Reaktivieren
        HandwerkWorkflows aus src/components und EmailWorkflowDemo aus
        src/App.tsx hier einbauen:
        <HandwerkWorkflows>
          {(active) => <EmailWorkflowDemo active={active} />}
        </HandwerkWorkflows>
        */}
        <AuthorBlock id="kontakt" author={branch.author} />
        <footer>
          <span>
            {branch.footer} · <a href="/">{contact.name}</a>
          </span>
          <span>
            <LegalLinks />
          </span>
        </footer>
      </main>
    </>
  );
}
