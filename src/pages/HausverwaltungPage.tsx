import { ArrowDown, Building2, Layers3, Play, UserRound } from "lucide-react";

const sections = [
  {
    icon: Layers3,
    title: "Anwendungsfälle",
    description:
      "Hier ist Platz für ausgewählte Aufgaben und wiederkehrende Anliegen im Verwaltungsalltag.",
  },
  {
    icon: Play,
    title: "Interaktive Demos",
    description:
      "Hier werden später Beispiele zeigen, wie Informationen verarbeitet und Ergebnisse vorbereitet werden.",
  },
  {
    icon: UserRound,
    title: "Über mich & Kontakt",
    description:
      "Hier folgen die persönliche Vorstellung und eine Möglichkeit, ins Gespräch zu kommen.",
  },
];

export default function HausverwaltungPage() {
  return (
    <div className="property-template">
      <header className="site-header">
        <a href="/hausverwaltung" className="wordmark">
          <span className="brand-mark">
            <Building2 size={19} />
          </span>
          Hausverwaltung
          <span className="header-tag">VORLAGE</span>
        </a>
        <a className="header-link" href="/hausverwaltung#bereiche">
          Bereiche ansehen <ArrowDown size={16} aria-hidden="true" />
        </a>
      </header>
      <main>
        <div className="hero">
          <div className="eyebrow hero-eyebrow">
            <span /> EINE EIGENE SEITE FÜR HAUSVERWALTUNGEN
          </div>
          <h1>
            Hausverwaltung.
            <br />
            <span>Raum für Ihre Abläufe.</span>
          </h1>
          <p>
            Dieser Einstieg ist in Vorbereitung.
            <br />
            Inhalte und Demonstrationen werden noch ergänzt.
          </p>
        </div>
        <section
          id="bereiche"
          className="property-template-sections"
          aria-label="Vorbereitete Seitenbereiche"
        >
          {sections.map(({ icon: Icon, title, description }) => (
            <section className="property-template-card" key={title}>
              <span className="property-template-icon" aria-hidden="true">
                <Icon size={23} strokeWidth={1.6} />
              </span>
              <span className="property-template-label">IN VORBEREITUNG</span>
              <h2>{title}</h2>
              <p>{description}</p>
            </section>
          ))}
        </section>
        <footer>
          <span>Hausverwaltung · Vorlagenseite</span>
          <span>Inhalte folgen.</span>
        </footer>
      </main>
    </div>
  );
}
