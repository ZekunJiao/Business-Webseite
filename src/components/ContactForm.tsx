import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { contact } from "../contact";

// Kontaktformular (zweiter Kontaktweg neben der E-Mail, § 5 DDG).
// Sendet an den Worker (POST /api/kontakt), der die Nachricht per
// Cloudflare Email Routing an das Postfach weiterleitet.
// Lokal unter `npm run dev` gibt es keinen Worker; dann erscheint der Fehlerhinweis.

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm({ id }: { id?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const email = contact.email?.trim();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("sending");
    try {
      const response = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(String(response.status));
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent")
    return (
      <div className="contact-form contact-form-done" id={id} role="status">
        <strong>Danke, deine Nachricht ist angekommen.</strong>
        <p>Ich melde mich in der Regel innerhalb eines Werktags.</p>
      </div>
    );

  return (
    <form className="contact-form" id={id} onSubmit={submit}>
      <div className="contact-form-row">
        <label>
          Name
          <input name="name" autoComplete="name" required maxLength={120} />
        </label>
        <label>
          E-Mail
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={200}
          />
        </label>
      </div>
      <label>
        Telefon <span className="contact-form-optional">(optional, für Rückruf)</span>
        <input name="phone" type="tel" autoComplete="tel" maxLength={40} />
      </label>
      <label>
        Nachricht
        <textarea name="message" required rows={5} maxLength={5000} />
      </label>
      {/* Für Menschen unsichtbar; Spam-Bots füllen es aus. */}
      <label className="contact-form-trap" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="contact-form-actions">
        <button type="submit" disabled={status === "sending"}>
          <Send size={16} aria-hidden="true" />
          {status === "sending" ? "Wird gesendet …" : "Nachricht senden"}
        </button>
        <p className="contact-form-note">
          Deine Angaben nutze ich nur, um deine Anfrage zu beantworten.
          Mehr dazu in der <a href="/datenschutz">Datenschutzerklärung</a>.
        </p>
      </div>
      {status === "error" ? (
        <p className="contact-form-error" role="alert">
          Die Nachricht konnte nicht gesendet werden.
          {email ? (
            <>
              {" "}
              Bitte schreib mir direkt an <a href={`mailto:${email}`}>{email}</a>.
            </>
          ) : null}
        </p>
      ) : null}
    </form>
  );
}
