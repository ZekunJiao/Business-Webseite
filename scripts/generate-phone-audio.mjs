// Erzeugt die Sprachaufnahmen für die Telefon-Demo einmalig mit OpenAI
// Text-to-Speech und speichert sie als MP3 in public/assets/phone/.
// Die Webseite spielt nur diese Dateien ab und ruft keine API auf.
//
// Aufruf: `npm run audio:phone`
// Zugang über die Umgebungsvariable OPENAI_API_KEY oder eine lokale Datei
// `.env` (nicht im Repository, siehe .gitignore).
//
// Vorhandene Dateien werden übersprungen. Neu erzeugen:
//   --only=3,5     nur diese Zeilen (1-basiert), auch wenn sie existieren
//   --force        alle Zeilen
// Optional:
//   OPENAI_TTS_MODEL           Standard gpt-4o-mini-tts
//   PHONE_VOICE_ASSISTANT      Standard cedar (männlich)
//   PHONE_VOICE_CALLER         Standard marin (weiblich)

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "assets", "phone");

const model = process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts";
const voices = {
  assistant: process.env.PHONE_VOICE_ASSISTANT ?? "cedar",
  caller: process.env.PHONE_VOICE_CALLER ?? "marin",
};
const instructions = {
  assistant:
    "Sprich Hochdeutsch ohne Akzent. Du bist ein freundlicher, ruhiger und professioneller Telefonassistent eines Handwerksbetriebs. Natürliches Gesprächstempo, warm und verbindlich, klar verständlich.",
  caller:
    "Sprich Hochdeutsch ohne Akzent. Du bist eine Kundin am Telefon, etwas besorgt, weil die Heizung ausgefallen ist. Alltagssprache, natürlich und echt, nicht übertrieben.",
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
  todo.push({ number, line, file });
}
if (todo.length === 0) {
  console.log(
    "Alle Aufnahmen sind schon vorhanden. Neu erzeugen mit --only=… oder --force.",
  );
  process.exit(0);
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error(
    "OPENAI_API_KEY ist nicht gesetzt (Umgebungsvariable oder .env).",
  );
  process.exit(1);
}

for (const { number, line, file } of todo) {
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      voice: voices[line.speaker],
      input: line.text,
      instructions: instructions[line.speaker],
      response_format: "mp3",
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
    `Zeile ${number} (${line.speaker}, ${voices[line.speaker]}): ${Math.round(audio.length / 1024)} KB gespeichert`,
  );
}
