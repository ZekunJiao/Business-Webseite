import { Check, Mail, Phone } from "lucide-react";
import { contact } from "../contact";

export function AuthorBlock({ id }: { id?: string }) {
  const email = contact.email?.trim();
  const phone = contact.phone?.trim();
  return (
    <section className="author-block" id={id} aria-labelledby="author-heading">
      <div className="author-head">
        <span className="author-avatar" aria-hidden="true">
          {contact.name
            .split(" ")
            .map((part) => part[0])
            .join("")}
        </span>
        <div className="author-copy">
          <span className="eyebrow">ÜBER MICH</span>
          <h2 id="author-heading">{contact.name}</h2>
          <span className="author-role">{contact.role}</span>
        </div>
        {(email || phone) && (
          <div className="author-links">
            {email && (
              <a href={`mailto:${email}`}>
                <Mail size={16} />
                {email}
              </a>
            )}
            {phone && (
              <a href={`tel:${phone.replace(/[^+\d]/g, "")}`}>
                <Phone size={16} />
                {phone}
              </a>
            )}
          </div>
        )}
      </div>
      <p className="author-intro">{contact.intro}</p>
      <ul className="author-builds" aria-label="Was ich baue">
        {contact.builds.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="author-columns">
        <div>
          <h3>Zahlen aus Kundenprojekten</h3>
          <dl className="author-results">
            {contact.results.map((result) => (
              <div key={result.value}>
                <dt>{result.value}</dt>
                <dd>{result.label}</dd>
              </div>
            ))}
          </dl>
          <p className="author-track">{contact.trackRecord.join(" · ")}</p>
          <p className="author-note">{contact.resultsNote}</p>
        </div>
        <div>
          <h3>Was du von mir bekommst</h3>
          <ul className="author-strengths">
            {contact.strengths.map((strength) => (
              <li key={strength.title}>
                <Check size={16} aria-hidden="true" />
                <span>
                  <strong>{strength.title}</strong>
                  {strength.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
