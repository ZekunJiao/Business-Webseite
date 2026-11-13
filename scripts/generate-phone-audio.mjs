// Erzeugt die Sprachaufnahmen für die Telefon-Demo mit OpenAI Text-to-Speech.
// Aufruf: OPENAI_API_KEY setzen, dann `npm run audio:phone`.
// Der Schlüssel bleibt in der lokalen Umgebung; nur die MP3s werden eingecheckt.
//
// Optional:
//   OPENAI_TTS_MODEL           Standard gpt-4o-mini-tts
//   PHONE_VOICE_ASSISTANT      Standard cedar (männlich)
//   PHONE_VOICE_CALLER         Standard marin (weiblich)
//   --only=3,5                 nur bestimmte Zeilen neu erzeugen (1-basiert)

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "assets", "phone");

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY ist nicht gesetzt.");
  process.exit(1);
}

const model = process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts";
const voices = {
  assistant: process.env.PHONE_VOICE_ASSISTANT ?? "cedar",
  caller: process.env.PHONE_VOICE_CALLER ?? "marin",
};
const instructions = {
  assistant:
    "Sprich Deutsch ohne Akzent. Du bist ein freundlicher, ruhiger und professioneller Telefonassistent eines Handwerksbetriebs. Natürliches Tempo, kurze Pausen, klar verständlich.",
  caller:
    "Sprich Deutsch ohne Akzent. Du bist eine Kundin am Telefon, etwas besorgt, weil die Heizung ausgefallen ist. Alltagssprache, natürlich, nicht übertrieben.",
};

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
  const file = join(outDir, `line-${String(number).padStart(2, "0")}.mp3`);
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
    `Zeile ${number} (${line.speaker}, ${voices[line.speaker]}): ${Math.round(audio.length / 1024)} KB`,
  );
}
