// Passwortschutz für die gesamte Seite (Cloudflare Worker vor den statischen Dateien).
// Das Passwort steht nicht im Repository, sondern als Secret SITE_PASSWORD im
// Cloudflare-Dashboard. Ist es nicht gesetzt, bleibt die Seite gesperrt.
// Lokal (npm run dev / preview) läuft dieser Worker nicht.

type Env = {
  SITE_PASSWORD?: string;
  ASSETS: { fetch(request: Request): Promise<Response> };
};

const REALM = "Geschützter Bereich";

async function digest(value: string): Promise<Uint8Array> {
  const bytes = new TextEncoder().encode(value);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
}

// Vergleich über Hashes gleicher Länge, ohne vorzeitigen Abbruch.
async function samePassword(a: string, b: string): Promise<boolean> {
  const [hashA, hashB] = await Promise.all([digest(a), digest(b)]);
  let diff = 0;
  for (let i = 0; i < hashA.length; i++) diff |= hashA[i] ^ hashB[i];
  return diff === 0;
}

function passwordFrom(header: string | null): string | null {
  if (!header?.startsWith("Basic ")) return null;
  try {
    const bytes = Uint8Array.from(atob(header.slice(6)), (c) =>
      c.charCodeAt(0),
    );
    const decoded = new TextDecoder().decode(bytes);
    // Benutzername wird ignoriert; maßgeblich ist der Teil nach dem ersten ":".
    const separator = decoded.indexOf(":");
    return separator === -1 ? null : decoded.slice(separator + 1);
  } catch {
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const expected = env.SITE_PASSWORD;
    if (!expected) {
      return new Response("Seite ist noch nicht freigeschaltet.", {
        status: 503,
        headers: { "X-Robots-Tag": "noindex, nofollow" },
      });
    }

    const given = passwordFrom(request.headers.get("Authorization"));
    if (given !== null && (await samePassword(given, expected))) {
      const response = await env.ASSETS.fetch(request);
      const protectedResponse = new Response(response.body, response);
      protectedResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
      protectedResponse.headers.set("Cache-Control", "private, no-store");
      return protectedResponse;
    }

    return new Response("Bitte Passwort eingeben.", {
      status: 401,
      headers: {
        "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  },
};
