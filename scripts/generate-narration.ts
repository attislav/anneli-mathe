// Production narration generator.
// Reads src/data/narration.ts and renders public/audio/{id}.mp3 for each entry.
// Skips entries whose mp3 already exists — delete the file (or all of them) to re-generate.
//
// Run: npm run gen:narration

import fs from "node:fs";
import path from "node:path";
import { NARRATION, NARRATION_DEFAULT_INSTRUCTIONS } from "../src/data/narration";

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error("Missing OPENAI_API_KEY. Did you put it in .env.local?");
  process.exit(1);
}

const MODEL = "gpt-4o-mini-tts";
const VOICE = "fable";
const CONCURRENCY = 4;

const OUT_DIR = path.resolve("public/audio");
fs.mkdirSync(OUT_DIR, { recursive: true });

async function generate(text: string, instructions: string, outPath: string) {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      voice: VOICE,
      input: text,
      instructions,
      response_format: "mp3",
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI ${res.status}: ${errText}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outPath, buf);
}

async function pool<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
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
    const outPath = path.join(OUT_DIR, `${entry.id}.mp3`);
    if (fs.existsSync(outPath)) {
      console.log(`skip   ${entry.id} (already exists)`);
      return false;
    }
    return true;
  });

  if (todo.length === 0) {
    console.log("\nAll audio files already exist. Nothing to do.");
    return;
  }

  console.log(`\nGenerating ${todo.length} new audio file(s) with voice "${VOICE}"...\n`);

  let count = 0;
  await pool(todo, CONCURRENCY, async (entry) => {
    const outPath = path.join(OUT_DIR, `${entry.id}.mp3`);
    const instructions = entry.instructions ?? NARRATION_DEFAULT_INSTRUCTIONS;
    const idx = ++count;
    try {
      await generate(entry.text, instructions, outPath);
      console.log(`[${idx}/${todo.length}] ${entry.id} ok`);
    } catch (err) {
      console.log(`[${idx}/${todo.length}] ${entry.id} FAILED`);
      console.error(err instanceof Error ? err.message : err);
    }
  });

  console.log(`\nDone. Files in ${OUT_DIR}`);
}

main();
