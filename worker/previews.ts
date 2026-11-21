// Linkvorschau je Branchenseite (WhatsApp, LinkedIn, E-Mail-Programme).
// Die Seite wird ohne Server-Rendering ausgeliefert, index.html enthält die
// Angaben für /handwerk. Für die Pfade unten tauscht der Worker Titel,
// Beschreibung und Open-Graph-Angaben im ausgelieferten HTML aus. Adresse
// und Bild verweisen auf den aufgerufenen Host, damit auch die Testadresse
// eine passende Vorschau zeigt.
//
// Titel und Beschreibung entsprechen `meta` in src/branches/…; bei
// Änderungen dort hier nachziehen. Bilder: npm run og:images.

type Preview = {
  // Hauptadresse der Seite (weitere Pfade leiten im Browser darauf um)
  path: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  image: string;
  imageAlt: string;
};

const hausverwaltung: Preview = {
  path: "/hausverwaltung",
  title: "Digitale Abläufe für Hausverwaltungen · Zekun Jiao",
  description:
    "Interaktive Beispiele für den Verwaltungsalltag: Notfälle am Telefon, Anfragen, Schäden, Betriebskosten und Eigentümerversammlungen. Von Zekun Jiao.",
  ogTitle: "Ihr Büro läuft weiter, während Sie unterwegs sind.",
  ogDescription:
    "Interaktive Beispiele: Notfälle, Anfragen, Schäden, Betriebskosten und Eigentümerversammlungen. Von Zekun Jiao.",
  image: "/og-hausverwaltung.png",
  imageAlt:
    "Ihr Büro läuft weiter, während Sie unterwegs sind. Zekun Jiao, zekun.de/hausverwaltung",
};

const steuerkanzlei: Preview = {
  path: "/steuerkanzlei",
  title: "Digitale Abläufe für Steuerkanzleien · Zekun Jiao",
  description:
    "Interaktive Beispiele für den Kanzleialltag: Steuerbescheide prüfen, fehlende Unterlagen, Mandantenanfragen und Anrufe. Von Zekun Jiao.",
  ogTitle: "Weniger Unterbrechungen, wenn die Fristen drücken.",
  ogDescription:
    "Interaktive Beispiele: Bescheide, Unterlagen, Mandantenanfragen und Anrufe. Von Zekun Jiao.",
  image: "/og-steuerkanzlei.png",
  imageAlt:
    "Weniger Unterbrechungen, wenn die Fristen drücken. Zekun Jiao, zekun.de/steuerkanzlei",
};

const previews: Record<string, Preview> = {
  "/hausverwaltung": hausverwaltung,
  "/steuerkanzlei": steuerkanzlei,
  "/steuerberater": steuerkanzlei,
};

// Passt die Vorschau an, wenn der Pfad eine eigene hat und die Antwort eine
// HTML-Seite ist. Sonst bleibt die Antwort unverändert.
export function withPreview(request: Request, response: Response): Response {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const preview = previews[path];
  const type = response.headers.get("Content-Type") ?? "";
  if (!preview || request.method !== "GET" || !type.includes("text/html"))
    return response;

  const content = (value: string) => ({
    element(element: { setAttribute(name: string, value: string): void }) {
      element.setAttribute("content", value);
    },
  });
  return new HTMLRewriter()
    .on("title", {
      element(element) {
        element.setInnerContent(preview.title);
      },
    })
    .on('meta[name="description"]', content(preview.description))
    .on('meta[property="og:url"]', content(`${url.origin}${preview.path}`))
    .on('meta[property="og:title"]', content(preview.ogTitle))
    .on('meta[property="og:description"]', content(preview.ogDescription))
    .on('meta[property="og:image"]', content(`${url.origin}${preview.image}`))
    .on('meta[property="og:image:alt"]', content(preview.imageAlt))
    .transform(response);
}
