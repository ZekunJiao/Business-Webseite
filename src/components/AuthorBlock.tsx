import { Check, Linkedin, Mail, Phone, UserRound } from "lucide-react";
import { contact } from "../contact";
import { ContactForm } from "./ContactForm";

export function AuthorBlock({ id }: { id?: string }) {
  const email = contact.email?.trim();
  const phone = contact.phone?.trim();
  const linkedin = contact.linkedin?.trim();
  const photo = contact.photo?.trim();
  return (
    <section className="author-block" id={id} aria-labelledby="author-heading">
      <div className="author-head">
        {photo ? (
          <img
            className="author-photo"
            src={photo}
            alt={contact.name}
            width={96}
            height={96}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="author-photo author-photo-placeholder" aria-hidden="true">
            <UserRound size={40} strokeWidth={1.5} />
            <small>Foto folgt</small>
          </span>
        )}
        <div className="author-copy">
          <span className="eyebrow">ÜBER MICH</span>
          <h2 id="author-heading">{contact.name}</h2>
          <span className="author-role">{contact.role}</span>
        </div>
        {(email || phone || linkedin) && (
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
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noopener noreferrer">
                <Linkedin size={16} />
                LinkedIn
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
        <div id="zahlen" className="author-numbers">
          <h3>Zahlen aus Kundenprojekten</h3>
          <dl className="author-results">
            {contact.results.map((result) => (
              <div key={result.value}>
                <dt>{result.value}</dt>
                <dd>{result.label}</dd>
                {result.context ? (
                  <dd className="author-result-context">{result.context}</dd>
                ) : null}
                {result.breakdown ? (
                  <dd className="author-breakdown">
                    <details>
                      <summary>{result.breakdown.title}</summary>
                      <table>
                        <tbody>
                          {result.breakdown.rows.map((row) => (
                            <tr key={row.label} data-tone={row.tone}>
                              <th scope="row">
                                {row.label}
                                {row.detail ? <small>{row.detail}</small> : null}
                              </th>
                              <td>{row.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {result.breakdown.notes?.map((note) => (
                        <p key={note}>{note}</p>
                      ))}
                    </details>
                  </dd>
                ) : null}
              </div>
            ))}
          </dl>
          <p className="author-track">{contact.trackRecord}</p>
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
      <div className="author-contact">
        <h3>Schreib mir</h3>
        <p>
          Kurz beschreiben, worum es geht. Ich melde mich in der Regel
          innerhalb eines Werktags.
        </p>
        <ContactForm />
      </div>
    </section>
  );
}
