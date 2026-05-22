// Production narration generator (OpenAI gpt-4o-mini-tts) — speaker-aware.
//
// Warum nicht ElevenLabs?
// ElevenLabs Free-Tier blockt unsere VPS-IP-Range („detected_unusual_activity"
// → 401). Bevor wir auf Creator-Tier ($) hochziehen, nutzen wir OpenAI mit
// 3 verschiedenen Stimmen — bringt 80% des Effekts (verschiedene Stimmen pro
// Rolle) und kostet uns nichts Neues.
//
// Reads src/data/narration.ts + src/data/voices.ts (für die Voice-Rolle pro
// Speaker; das OpenAI-Mapping steht weiter unten in dieser Datei) und rendert
// public/audio/<speaker>/<id>.mp3.
//
// Skips entries whose mp3 already exists.
//
// Run: npm run gen:narration:oai

import fs from "node:fs";
import path from "node:path";
import { NARRATION } from "../src/data/narration";
import type { Speaker } from "../src/data/voices";

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error("Missing OPENAI_API_KEY. Did you put it in .env.local?");
  process.exit(1);
}

const MODEL = "gpt-4o-mini-tts";
const CONCURRENCY = 4;

// OpenAI-Voice + Style-Anweisung pro Rolle.
// Voices ausgewählt aus dem TTS-Test (siehe scripts/generate-narration-test.mjs).
const OPENAI_VOICE_MAP: Record<
  Speaker,
  { voice: string; instructions: string }
> = {
  narrator: {
    voice: "sage",
    instructions: `
Speak in German with warmth and gentle authority — like a kind storyteller
reading aloud to a 7-year-old. Soft, clear pronunciation, neither dramatic
nor flat. Light pacing.
    `.trim(),
  },
  book: {
    voice: "ballad",
    instructions: `
Speak in German with warmth and a hint of playful cheekiness — like a witty
older book sharing a secret with a 7-year-old child. Conversational tone,
not theatrical. Slightly conspiratorial but always kind. Speak clearly
enough for a young child to follow.
    `.trim(),
  },
  bird_pip: {
    voice: "coral",
    instructions: `
Speak in German with bright, lighthearted energy — like a friendly little
bird-companion encouraging a 7-year-old. Slightly higher, quick but clear,
warm and full of smile. Never anxious, never dramatic.
    `.trim(),
  },
};

const OUT_BASE = path.resolve("public/audio");

async function generate(
  text: string,
  voice: string,
  instructions: string,
  outPath: string,
) {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      voice,
      input: text,
      instructions,
      response_format: "mp3",
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI ${res.status}: ${errText.slice(0, 300)}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outPath, buf);
}

async function pool<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
) {
  const queue = [...items];
  const workers = Array.from({ length: limit }, async () => {
    while (queue.length > 0) {
      const next = queue.shift();
      if (next === undefined) return;
      await worker(next);
    }
  });
  await Promise.all(workers);
}

async function main() {
  const todo = NARRATION.filter((entry) => {
    const mapping = OPENAI_VOICE_MAP[entry.speaker];
    if (!mapping) {
      console.warn(`SKIP (no OpenAI mapping for "${entry.speaker}"): ${entry.id}`);
      return false;
    }
    const dir = path.join(OUT_BASE, entry.speaker);
    fs.mkdirSync(dir, { recursive: true });
    const outPath = path.join(dir, `${entry.id}.mp3`);
    if (fs.existsSync(outPath)) {
      console.log(`skip   ${entry.speaker}/${entry.id}`);
      return false;
    }
    return true;
  });

  if (todo.length === 0) {
    console.log("\nAll audio files already exist. Nothing to do.");
    return;
  }

  console.log(`\nGenerating ${todo.length} new audio file(s)...\n`);

  let count = 0;
  let failed = 0;
  await pool(todo, CONCURRENCY, async (entry) => {
    const mapping = OPENAI_VOICE_MAP[entry.speaker]!;
    const outPath = path.join(OUT_BASE, entry.speaker, `${entry.id}.mp3`);
    const idx = ++count;
    try {
      await generate(entry.text, mapping.voice, mapping.instructions, outPath);
      console.log(
        `[${idx}/${todo.length}] ${entry.speaker}/${entry.id} ok (${mapping.voice})`,
      );
    } catch (err) {
      failed++;
      console.log(`[${idx}/${todo.length}] ${entry.speaker}/${entry.id} FAILED`);
      console.error(err instanceof Error ? err.message : err);
    }
  });

  console.log(`\nDone. ${count - failed} ok, ${failed} failed. Files in ${OUT_BASE}/`);
  if (failed > 0) process.exit(1);
}

main();
