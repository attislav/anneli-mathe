// Quick TTS test: same sample text, 4 OpenAI voices, to pick a narrator.
// Run: node --env-file=.env.local scripts/generate-narration-test.mjs
//
// Output: public/test-audio/{voice}.mp3

import fs from "node:fs";
import path from "node:path";

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error("Missing OPENAI_API_KEY. Did you put it in .env.local?");
  process.exit(1);
}

const OUT_DIR = path.resolve("public/test-audio");
fs.mkdirSync(OUT_DIR, { recursive: true });

const MODEL = "gpt-4o-mini-tts";

// The 4 voices we want to compare. OpenAI offers more; these are the warmest narrator-fit ones.
// Pass VOICES env to override, e.g. VOICES=ash,ballad,sage,echo npm run gen:test-audio
const VOICES = (process.env.VOICES ?? "nova,shimmer,coral,fable")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);

// Sample text: a Buch line that carries the persona (witty, warm, mildly cheeky).
const SAMPLE_TEXT = `Na endlich! Ich dachte schon, du machst mich nie auf. Komm mit, Anneli — ich zeige dir, wo wir sind. Du wirst staunen.`;

// Tonality instruction — gpt-4o-mini-tts uses this to steer style.
const INSTRUCTIONS = `
Speak in German with warmth and a hint of playful cheekiness — like a witty
older book sharing a secret with a 7-year-old child. Conversational tone, not
theatrical. Slightly conspiratorial but always kind. Speak clearly enough for
a young child to follow.
`.trim();

async function generate(voice) {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      voice,
      input: SAMPLE_TEXT,
      instructions: INSTRUCTIONS,
      response_format: "mp3",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI ${res.status}: ${text}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  const outPath = path.join(OUT_DIR, `${voice}.mp3`);
  fs.writeFileSync(outPath, buf);
  return outPath;
}

async function main() {
  console.log(`Sample: "${SAMPLE_TEXT}"\n`);
  await Promise.all(
    VOICES.map(async (voice, i) => {
      process.stdout.write(`[${i + 1}/${VOICES.length}] ${voice} ... `);
      try {
        await generate(voice);
        console.log("ok");
      } catch (err) {
        console.log("FAILED");
        console.error(err.message);
      }
    })
  );
  console.log(`\nDone. Files in ${OUT_DIR}`);
}

main();
