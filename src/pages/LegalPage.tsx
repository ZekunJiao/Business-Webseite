import type { ReactNode } from "react";
import { contact } from "../contact";

// Impressum (§ 5 DDG) und Datenschutzerklärung (Art. 13 DSGVO).
// Angaben kommen aus src/contact.ts. Stand bei inhaltlichen Änderungen anpassen.
const STAND = "November 2026";

export type LegalKind = "impressum" | "datenschutz";

export function LegalLinks() {
  return (
    <span className="legal-links">
      <a href="/impressum">Impressum</a>
      <a href="/datenschutz">Datenschutz</a>
    </span>
  );
}

function Address() {
  const a = contact.address;
  const complete =
    a && a.street.trim() && a.postalCode.trim() && a.city.trim() ? a : null;
  return (
    <p>
      {contact.name}
      <br />
      {complete ? (
        <>
          {complete.street}
          <br />
          {complete.postalCode} {complete.city}
        </>
      ) : (
        <span className="legal-missing">Anschrift folgt</span>
      )}
      <br />
      Deutschland
    </p>
  );
}

function EmailLink() {
  const email = contact.email?.trim();
  return email ? (
    <a href={`mailto:${email}`}>{email}</a>
  ) : (
    <span className="legal-missing">E-Mail-Adresse folgt</span>
  );
}

function Impressum() {
  const phone = contact.phone?.trim();
  const vatId = contact.vatId?.trim();
  return (
    <>
      <h2>Angaben gemäß § 5 DDG</h2>
      <Address />
      <h2>Kontakt</h2>
      <p>
        E-Mail: <EmailLink />
        {phone ? (
          <>
            <br />
            Telefon: {phone}
          </>
        ) : null}
      </p>
      {vatId ? (
        <>
          <h2>Umsatzsteuer-ID</h2>
          <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {vatId}</p>
        </>
      ) : null}
      <h2>Verbraucherstreitbeilegung</h2>
      <p>
        Ich bin nicht bereit und nicht verpflichtet, an Streitbeilegungs­verfahren
        vor einer Verbraucher­schlichtungsstelle teilzunehmen.
      </p>
    </>
  );
}

function Datenschutz() {
  return (
    <>
      <p>
        Diese Seite erklärt, welche personenbezogenen Daten beim Besuch dieser
        Website verarbeitet werden. Kurz gesagt: Es gibt keine Cookies, kein
        Tracking, keine Analysewerkzeuge und keine eingebundenen Inhalte von
        Drittanbietern. Schriften, Bilder und Tonaufnahmen werden von dieser
        Website selbst ausgeliefert.
      </p>

      <h2>1. Verantwortlicher</h2>
      <Address />
      <p>
        E-Mail: <EmailLink />
      </p>

      <h2>2. Hosting und Server-Protokolle</h2>
      <p>
        Die Website wird über Cloudflare ausgeliefert (Cloudflare, Inc., 101
        Townsend St, San Francisco, CA 94107, USA). Beim Aufruf verarbeitet
        Cloudflare technisch notwendige Daten, insbesondere Ihre IP-Adresse,
        Datum und Uhrzeit, die aufgerufene Adresse, den Referrer sowie Angaben
        zu Browser und Betriebssystem. Das dient der Auslieferung der Seite,
        der Stabilität und dem Schutz vor Angriffen.
      </p>
      <p>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Mein berechtigtes
        Interesse liegt in einer sicheren und zuverlässigen Bereitstellung der
        Website. Mit Cloudflare besteht ein Vertrag zur Auftragsverarbeitung
        nach Art. 28 DSGVO. Eine Übermittlung in die USA ist möglich;
        Cloudflare ist nach dem EU-US Data Privacy Framework zertifiziert
        (Art. 45 DSGVO). Die Daten werden nur so lange gespeichert, wie es für
        diese Zwecke erforderlich ist.
      </p>

      <h2>3. Zugangsschutz</h2>
      <p>
        Solange die Website mit einem Passwort geschützt ist, speichert Ihr
        Browser die eingegebenen Zugangsdaten für die Dauer der Sitzung, um
        weitere Seitenaufrufe zu ermöglichen. Dabei werden keine weiteren
        Daten über Sie erhoben. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
      </p>

      <h2>4. Kontakt per E-Mail</h2>
      <p>
        Wenn Sie mir eine E-Mail schreiben, verarbeite ich Ihre Angaben (zum
        Beispiel Name, E-Mail-Adresse und Inhalt der Nachricht), um Ihre
        Anfrage zu beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b
        DSGVO, wenn Ihre Anfrage auf einen Vertrag zielt, sonst Art. 6 Abs. 1
        lit. f DSGVO. Ich lösche die Daten, sobald sie dafür nicht mehr nötig
        sind, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.
      </p>

      <h2>5. Interaktive Beispiele</h2>
      <p>
        Die Beispiele auf dieser Website laufen vollständig in Ihrem Browser.
        Es werden dabei keine Eingaben an mich oder an Dritte übertragen. Die
        gezeigten Personen, Betriebe und Nachrichten sind erfunden.
      </p>

      <h2>6. Link zu LinkedIn</h2>
      <p>
        Auf dieser Website gibt es einen einfachen Link zu meinem
        LinkedIn-Profil. Es ist kein LinkedIn-Plugin eingebunden; Daten
        werden erst übertragen, wenn Sie den Link anklicken. Ab dann gilt die
        Datenschutzerklärung von LinkedIn (LinkedIn Ireland Unlimited
        Company, Wilton Place, Dublin 2, Irland).
      </p>

      <h2>7. Ihre Rechte</h2>
      <p>Sie haben jederzeit das Recht auf</p>
      <ul>
        <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO),</li>
        <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO),</li>
        <li>Löschung (Art. 17 DSGVO),</li>
        <li>Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
        <li>Datenübertragbarkeit (Art. 20 DSGVO) und</li>
        <li>
          Widerspruch gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1
          lit. f DSGVO (Art. 21 DSGVO).
        </li>
      </ul>
      <p>
        Wenden Sie sich dafür formlos an die oben genannte E-Mail-Adresse.
        Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde
        beschweren (Art. 77 DSGVO), etwa bei der Behörde an Ihrem Wohnort.
      </p>
    </>
  );
}

const pages: Record<LegalKind, { title: string; body: () => ReactNode }> = {
  impressum: { title: "Impressum", body: Impressum },
  datenschutz: { title: "Datenschutzerklärung", body: Datenschutz },
};

export default function LegalPage({ kind }: { kind: LegalKind }) {
  const { title, body: Body } = pages[kind];
  return (
    <main className="legal-page">
      <a className="legal-back" href="/">
        ← {contact.name}
      </a>
      <h1>{title}</h1>
      <Body />
      <p className="legal-stand">Stand: {STAND}</p>
      <footer>
        <span>{contact.name} · Software, KI und Automatisierung</span>
        <LegalLinks />
      </footer>
    </main>
  );
}
