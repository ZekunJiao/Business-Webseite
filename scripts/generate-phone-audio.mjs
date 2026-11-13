// Erzeugt die Sprachaufnahmen für die Telefon-Demo mit Azure AI Speech
// (HD-Stimmen). Aufruf: `npm run audio:phone`.
//
// Zugang über Umgebungsvariablen oder eine lokale Datei `.env` (nicht im
// Repository, siehe .gitignore):
//   AZURE_SPEECH_KEY           Schlüssel der Speech-Ressource
//   AZURE_SPEECH_REGION        Region mit HD-Stimmen, Standard westeurope
// Optional:
//   PHONE_VOICE_ASSISTANT      Standard de-DE-Florian:DragonHDLatestNeural
//   PHONE_VOICE_CALLER         Standard de-DE-Seraphina:DragonHDLatestNeural
//   --only=3,5                 nur bestimmte Zeilen neu erzeugen (1-basiert)

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "assets", "phone");

const key = process.env.AZURE_SPEECH_KEY;
const region = process.env.AZURE_SPEECH_REGION ?? "westeurope";
if (!key) {
  console.error(
    "AZURE_SPEECH_KEY ist nicht gesetzt (Umgebungsvariable oder .env).",
  );
  process.exit(1);
}

const voices = {
  assistant:
    process.env.PHONE_VOICE_ASSISTANT ?? "de-DE-Florian:DragonHDLatestNeural",
  caller:
    process.env.PHONE_VOICE_CALLER ?? "de-DE-Seraphina:DragonHDLatestNeural",
};
// Höchste MP3-Qualität, die Azure liefert
const outputFormat = "audio-48khz-192kbitrate-mono-mp3";

const escapeXml = (text) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
const only = onlyArg
  ? new Set(onlyArg.slice("--only=".length).split(",").map(Number))
  : null;

const lines = JSON.parse(
  await readFile(join(root, "src", "phoneLines.json"), "utf8"),
);
await mkdir(outDir, { recursive: true });

for (const [index, line] of lines.entries()) {
  const number = index + 1;
  if (only && !only.has(number)) continue;
  const voice = voices[line.speaker];
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="de-DE"><voice name="${voice}">${escapeXml(line.text)}</voice></speak>`;
  const response = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": outputFormat,
        "User-Agent": "business-webseite-phone-demo",
      },
      body: ssml,
    },
  );
  if (!response.ok) {
    console.error(
      `Zeile ${number}: ${response.status} ${response.statusText} ${await response.text()}`,
    );
    if (response.status === 400)
      console.error(
        `Hinweis: HD-Stimmen gibt es nur in bestimmten Regionen (z. B. westeurope, swedencentral, francecentral). Aktuell: ${region}.`,
      );
    process.exit(1);
  }
  const audio = Buffer.from(await response.arrayBuffer());
  const file = join(outDir, `line-${String(number).padStart(2, "0")}.mp3`);
  await writeFile(file, audio);
  console.log(
    `Zeile ${number} (${line.speaker}, ${voice}): ${Math.round(audio.length / 1024)} KB`,
  );
}
