import { Check, Linkedin, Mail, Phone, UserRound } from "lucide-react";
import { contact } from "../contact";
import { ContactForm } from "./ContactForm";
import type { Branch } from "../branches/types";

// Vorstellung, Kennzahlen und Kontaktformular am Ende einer Branchenseite.
// Persönliche Angaben aus src/contact.ts, Texte je Branche aus author.
export function AuthorBlock({
  id,
  author,
}: {
  id?: string;
  author: Branch["author"];
}) {
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
      <p className="author-intro">{author.intro}</p>
      <ul className="author-builds" aria-label="Was ich baue">
        {author.builds.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="author-columns">
        {author.results.length ? (
          <div id="zahlen" className="author-numbers">
            <h3>Zahlen aus Kundenprojekten</h3>
            <dl className="author-results">
              {author.results.map((result) => (
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
            {contact.trackRecord?.trim() ? (
              <p className="author-track">{contact.trackRecord}</p>
            ) : null}
            <p className="author-note">{author.resultsNote}</p>
          </div>
        ) : null}
        <div>
          <h3>{author.strengthsTitle}</h3>
          <ul className="author-strengths">
            {author.strengths.map((strength) => (
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
      <div id="schreib-mir" className="author-contact">
        <h3>{author.contactTitle}</h3>
        <p>{author.contactText}</p>
        <ContactForm {...author.form} />
      </div>
    </section>
  );
}
