import { Mail, Phone } from "lucide-react";
import { contact } from "../contact";

export function AuthorBlock({ id }: { id?: string }) {
  const email = contact.email?.trim();
  const phone = contact.phone?.trim();
  return (
    <section className="author-block" id={id} aria-label="Über mich und Kontakt">
      <span className="author-avatar" aria-hidden="true">
        {contact.name
          .split(" ")
          .map((part) => part[0])
          .join("")}
      </span>
      <div className="author-copy">
        <strong>{contact.name}</strong>
        <span className="author-role">{contact.role}</span>
        <p>{contact.intro}</p>
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
    </section>
  );
}
