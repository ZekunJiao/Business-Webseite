// Erzeugt die Vorschaubilder für geteilte Links (1200 × 630) je Branchenseite
// nach public/og-<name>.png. Gestaltung wie public/og-handwerk.png: Kicker,
// zweizeilige Überschrift (zweite Zeile orange), ein Satz, Foto, Name, Adresse.
//
// Nutzt einen lokal installierten Google Chrome im Headless-Modus; es wird
// nichts heruntergeladen. Pfad zu Chrome bei Bedarf über CHROME_PATH.
//
//   npm run og:images                      fehlende Bilder erzeugen
//   npm run og:images -- --force           alle neu erzeugen
//   npm run og:images -- --only=steuerkanzlei
//
// Texte stehen unten in `images`; Titel und Beschreibung der Linkvorschau
// stehen im Worker (worker/previews.ts) und sollten dazu passen.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const images = {
  hausverwaltung: {
    kicker: "Digitale Abläufe für Hausverwaltungen",
    lines: ["Ihr Büro läuft weiter,", "während Sie unterwegs sind."],
    text: "Interaktive Beispiele: Notfälle, Anfragen, Schäden und Betriebskosten.",
    url: "zekun.de/hausverwaltung",
  },
  steuerkanzlei: {
    kicker: "Digitale Abläufe für Steuerkanzleien",
    lines: ["Weniger Unterbrechungen,", "wenn die Fristen drücken."],
    text: "Interaktive Beispiele: Bescheide, Unterlagen, Mandantenanfragen und Anrufe.",
    url: "zekun.de/steuerkanzlei",
  },
};

const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args
  .find((arg) => arg.startsWith("--only="))
  ?.slice("--only=".length)
  .split(",");

const chrome =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if (!existsSync(chrome)) {
  console.error(`Chrome nicht gefunden: ${chrome}\nPfad über CHROME_PATH angeben.`);
  process.exit(1);
}

const fileUrl = (path) => pathToFileURL(join(root, path)).href;
const escape = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function page({ kicker, lines, text, url }) {
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<style>
  @font-face {
    font-family: "Inter Variable";
    font-weight: 100 900;
    src: url("${fileUrl("node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2")}") format("woff2");
  }
  @font-face {
    font-family: "Inter Variable";
    font-weight: 100 900;
    src: url("${fileUrl("node_modules/@fontsource-variable/inter/files/inter-latin-ext-wght-normal.woff2")}") format("woff2");
    unicode-range: U+0100-024F, U+1E00-1EFF;
  }
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    position: relative;
    padding: 70px 80px 60px;
    font-family: "Inter Variable", sans-serif;
    color: #142b43;
    background:
      radial-gradient(circle at 1060px 120px, #fbe3cf 0, #fbe3cf00 260px),
      #f6f8fa;
  }
  .kicker {
    display: flex; align-items: center; gap: 14px;
    font-size: 22px; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: #9a572d;
  }
  .kicker::before {
    content: ""; width: 10px; height: 10px; border-radius: 50%; background: #df782f;
  }
  h1 {
    margin-top: 26px;
    font-size: 76px; font-weight: 750; line-height: 1.1; letter-spacing: -0.035em;
  }
  h1 span { display: block; white-space: nowrap; }
  h1 span + span { color: #c9612a; }
  p { margin-top: 30px; font-size: 27px; white-space: nowrap; color: #4a5b6e; }
  footer {
    position: absolute; left: 80px; right: 80px; bottom: 60px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .person { display: flex; align-items: center; gap: 18px; }
  .person img {
    width: 64px; height: 64px; border-radius: 50%; object-fit: cover;
    object-position: center 20%; border: 2px solid #dde3ea;
  }
  .person strong { display: block; font-size: 24px; font-weight: 700; }
  .person span { font-size: 19px; color: #627284; }
  .url { font-size: 25px; font-weight: 700; }
</style></head>
<body>
  <div class="kicker">${escape(kicker)}</div>
  <h1>${lines.map((line) => `<span>${escape(line)}</span>`).join("")}</h1>
  <p>${escape(text)}</p>
  <footer>
    <div class="person">
      <img src="${fileUrl("public/assets/zekun-jiao.jpg")}" alt="">
      <div><strong>Zekun Jiao</strong><span>KI und Automatisierung für Betriebe</span></div>
    </div>
    <div class="url">${escape(url)}</div>
  </footer>
</body></html>`;
}

const work = mkdtempSync(join(tmpdir(), "og-images-"));
try {
  for (const [name, image] of Object.entries(images)) {
    if (only && !only.includes(name)) continue;
    const target = join(root, "public", `og-${name}.png`);
    if (existsSync(target) && !force) {
      console.log(`übersprungen (vorhanden): public/og-${name}.png`);
      continue;
    }
    const html = join(work, `${name}.html`);
    writeFileSync(html, page(image));
    execFileSync(chrome, [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--allow-file-access-from-files",
      "--force-device-scale-factor=1",
      "--window-size=1200,630",
      `--screenshot=${target}`,
      pathToFileURL(html).href,
    ], { stdio: "ignore" });
    const size = readFileSync(target).length;
    console.log(`erzeugt: public/og-${name}.png (${Math.round(size / 1024)} KB)`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
