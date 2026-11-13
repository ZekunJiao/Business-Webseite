// Erzeugt die Sprachaufnahmen für die Telefon-Demo einmalig mit ElevenLabs
// und speichert sie als MP3 in public/assets/phone/.
// Die Webseite spielt nur diese Dateien ab und ruft keine API auf.
//
// Aufruf: `npm run audio:phone`
// Zugang über Umgebungsvariablen oder eine lokale Datei `.env` (nicht im
// Repository, siehe .gitignore):
//   ELEVENLABS_API_KEY            API-Schlüssel
// Stimmen-IDs stehen unten im Skript; überschreibbar mit
//   ELEVENLABS_VOICE_ASSISTANT    Stimmen-ID für den Assistenten
//   ELEVENLABS_VOICE_CALLER       Stimmen-ID für die Anruferin
// Optional:
//   ELEVENLABS_MODEL              Standard eleven_v4
//   ELEVENLABS_OUTPUT_FORMAT      Standard mp3_44100_128
//                                 (mp3_44100_192 ab Creator-Tarif)
//
// Stimmen-IDs anzeigen:   npm run audio:phone -- --list-voices
// Vorhandene Dateien werden übersprungen. Neu erzeugen:
//   --only=3,5     nur diese Zeilen (1-basiert), auch wenn sie existieren
//   --force        alle Zeilen

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "assets", "phone");
const api = "https://api.elevenlabs.io";

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error(
    "ELEVENLABS_API_KEY ist nicht gesetzt (Umgebungsvariable oder .env).",
  );
  process.exit(1);
}

if (process.argv.includes("--list-voices")) {
  const response = await fetch(`${api}/v2/voices?page_size=100`, {
    headers: { "xi-api-key": apiKey },
  });
  if (!response.ok) {
    console.error(`${response.status} ${await response.text()}`);
    process.exit(1);
  }
  const { voices } = await response.json();
  for (const voice of voices) {
    const labels = Object.values(voice.labels ?? {}).join(", ");
    console.log(`${voice.voice_id}  ${voice.name}  (${labels})`);
  }
  process.exit(0);
}

const model = process.env.ELEVENLABS_MODEL ?? "eleven_v4";
const outputFormat = process.env.ELEVENLABS_OUTPUT_FORMAT ?? "mp3_44100_128";
// Stimmen-IDs sind nicht geheim und stehen deshalb hier.
const voices = {
  // Sebastian - Calm & Natural
  assistant: process.env.ELEVENLABS_VOICE_ASSISTANT ?? "gzvDGHWqBQM6eoYO11Kp",
  // Mrs. Sophie (Friendly & professional)
  caller: process.env.ELEVENLABS_VOICE_CALLER ?? "R24r0IV80Iw9eyByq1ps",
};
if (!voices.assistant || !voices.caller) {
  console.error(
    "ELEVENLABS_VOICE_ASSISTANT und ELEVENLABS_VOICE_CALLER setzen. IDs anzeigen: npm run audio:phone -- --list-voices",
  );
  process.exit(1);
}
// Etwas weniger Stabilität klingt lebendiger, wie im echten Gespräch.
const voiceSettings = {
  assistant: { stability: 0.5, similarity_boost: 0.75, style: 0.15 },
  caller: { stability: 0.4, similarity_boost: 0.75, style: 0.3 },
};

const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
const only = onlyArg
  ? new Set(onlyArg.slice("--only=".length).split(",").map(Number))
  : null;
const force = process.argv.includes("--force");

const exists = (file) =>
  access(file).then(
    () => true,
    () => false,
  );

const lines = JSON.parse(
  await readFile(join(root, "src", "phoneLines.json"), "utf8"),
);
await mkdir(outDir, { recursive: true });

const todo = [];
for (const [index, line] of lines.entries()) {
  const number = index + 1;
  const file = join(outDir, `line-${String(number).padStart(2, "0")}.mp3`);
  if (only ? !only.has(number) : !force && (await exists(file))) continue;
  todo.push({ index, number, line, file });
}
if (todo.length === 0) {
  console.log(
    "Alle Aufnahmen sind schon vorhanden. Neu erzeugen mit --only=… oder --force.",
  );
  process.exit(0);
}

for (const { index, number, line, file } of todo) {
  const url = `${api}/v1/text-to-speech/${voices[line.speaker]}?output_format=${outputFormat}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: line.text,
      model_id: model,
      language_code: "de",
      voice_settings: voiceSettings[line.speaker],
      // Gesprächskontext für passende Betonung
      previous_text: lines[index - 1]?.text,
      next_text: lines[index + 1]?.text,
    }),
  });
  if (!response.ok) {
    console.error(
      `Zeile ${number}: ${response.status} ${await response.text()}`,
    );
    process.exit(1);
  }
  const audio = Buffer.from(await response.arrayBuffer());
  await writeFile(file, audio);
  console.log(
    `Zeile ${number} (${line.speaker}): ${Math.round(audio.length / 1024)} KB gespeichert`,
  );
}
