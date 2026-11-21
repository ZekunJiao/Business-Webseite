// Worker vor den statischen Dateien.
// 1. Die Seite ist öffentlich (kein Passwort), soll aber vorerst nicht in
//    Suchmaschinen erscheinen: Jede Antwort trägt "X-Robots-Tag: noindex,
//    nofollow". Zum Freigeben die Zeile mit set("X-Robots-Tag", …) entfernen.
// 2. POST /api/kontakt nimmt das Kontaktformular entgegen und schickt es über
//    Cloudflare Email Routing (Binding KONTAKT_MAIL, siehe wrangler.jsonc) an
//    das hinterlegte Postfach. Nachrichten werden nicht gespeichert.
// 3. Vorerst leitet die Startseite "/" vorübergehend (302) auf /handwerk um.
//    Zum Abschalten HOME_REDIRECT_FROM auf null setzen.
// 4. Branchenseiten mit eigener Linkvorschau bekommen Titel, Beschreibung
//    und Vorschaubild im HTML ausgetauscht (worker/previews.ts).
// Lokal (npm run dev / preview) läuft dieser Worker nicht; `npx wrangler dev`
// nach `npm run build` startet ihn mit simuliertem Mailversand.

import { EmailMessage } from "cloudflare:email";
import { withPreview } from "./previews";

const HOME_REDIRECT_FROM: string | null = "/";

type Env = {
  ASSETS: { fetch(request: Request): Promise<Response> };
  KONTAKT_MAIL: { send(message: EmailMessage): Promise<void> };
  /** Absender, muss zu einer Domain mit aktivem Email Routing gehören. */
  KONTAKT_FROM: string;
  /** Empfänger, muss in Email Routing als Zieladresse bestätigt sein. */
  KONTAKT_TO: string;
};

const LIMITS = { name: 120, email: 200, phone: 40, message: 5000 };
const EMAIL_PATTERN = /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/;

function base64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

// Betreff mit Umlauten nach RFC 2047.
function encodeHeader(text: string): string {
  return `=?UTF-8?B?${base64(text)}?=`;
}

function field(data: Record<string, unknown>, key: keyof typeof LIMITS) {
  const value = data[key];
  return typeof value === "string" ? value.trim() : "";
}

function json(status: number, body: object): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  // Nur Formulare von dieser Website annehmen.
  const origin = request.headers.get("Origin");
  if (origin && URL.parse(origin)?.host !== new URL(request.url).host)
    return json(403, { ok: false });

  let data: Record<string, unknown>;
  try {
    data = (await request.json()) as Record<string, unknown>;
  } catch {
    return json(400, { ok: false });
  }

  // Verstecktes Feld ausgefüllt: vermutlich ein Bot. Still verwerfen.
  if (typeof data.website === "string" && data.website.trim())
    return json(200, { ok: true });

  const name = field(data, "name");
  const email = field(data, "email");
  const phone = field(data, "phone");
  const message = field(data, "message");
  const tooLong = (Object.keys(LIMITS) as (keyof typeof LIMITS)[]).some(
    (key) => field(data, key).length > LIMITS[key],
  );
  if (!name || !message || !EMAIL_PATTERN.test(email) || tooLong)
    return json(400, { ok: false });
  // Zeilenumbrüche in Kopfzeilen-Werten verhindern.
  if (/[\r\n]/.test(name + email + phone)) return json(400, { ok: false });

  const body = [
    `Name: ${name}`,
    `E-Mail: ${email}`,
    `Telefon: ${phone || "nicht angegeben"}`,
    "",
    message,
    "",
    "--",
    "Gesendet über das Kontaktformular auf zekun.de.",
    "Wenn du auf diese E-Mail antwortest, geht die Antwort direkt an den Absender.",
  ].join("\r\n");
  const domain = env.KONTAKT_FROM.split("@")[1];
  const raw = [
    `From: ${encodeHeader("Kontaktformular")} <${env.KONTAKT_FROM}>`,
    `To: <${env.KONTAKT_TO}>`,
    `Reply-To: ${encodeHeader(name)} <${email}>`,
    `Subject: ${encodeHeader(`Anfrage über die Website: ${name}`)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${domain}>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    base64(body).replace(/.{76}/g, "$&\r\n"),
  ].join("\r\n");

  try {
    await env.KONTAKT_MAIL.send(
      new EmailMessage(env.KONTAKT_FROM, env.KONTAKT_TO, raw),
    );
  } catch (error) {
    console.error("Kontaktformular: Versand fehlgeschlagen", error);
    return json(502, { ok: false });
  }
  return json(200, { ok: true });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    const response =
      pathname === HOME_REDIRECT_FROM
        ? Response.redirect(new URL(`/handwerk${url.search}`, url), 302)
        : pathname === "/api/kontakt"
        ? request.method === "POST"
          ? await handleContact(request, env)
          : new Response(null, { status: 405, headers: { Allow: "POST" } })
        : withPreview(request, await env.ASSETS.fetch(request));
    const headed = new Response(response.body, response);
    headed.headers.set("X-Robots-Tag", "noindex, nofollow");
    return headed;
  },
};
