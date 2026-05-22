// Production narration generator (ElevenLabs).
// Reads src/data/narration.ts + src/data/voices.ts and renders
// public/audio/<speaker>/<id>.mp3 for each entry.
//
// Skips entries whose mp3 already exists — delete the file (or the whole
// public/audio/ tree) to regenerate.
//
// Run: npm run gen:narration:el
//
// Cost:
//   ElevenLabs Free Tier zählt nur die *Eingabe-chars*. Wir bauen
//   vor dem Senden eine Summe und brechen mit Fehler ab, wenn ein
//   Budget-Limit überschritten würde. Default-Budget = 3000 chars
//   pro Run — schützt vor versehentlichem Vollzitieren.

import fs from "node:fs";
import path from "node:path";
import { NARRATION } from "../src/data/narration";
import { VOICES } from "../src/data/voices";

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error("Missing ELEVENLABS_API_KEY. Did you put it in .env.local?");
  process.exit(1);
}

const MODEL_ID = "eleven_multilingual_v2";
const OUTPUT_FORMAT = "mp3_44100_128";
const BUDGET_CHAR_LIMIT = Number(process.env.BUDGET_CHARS ?? 3000);
const CONCURRENCY = 3; // freundlich zur Free-Tier-Rate

const OUT_BASE = path.resolve("public/audio");

async function generate(
  text: string,
  voiceId: string,
  stability: number,
  similarityBoost: number,
  style: number,
  outPath: string,
) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${OUTPUT_FORMAT}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": API_KEY!,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: {
        stability,
        similarity_boost: similarityBoost,
        style,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${errText.slice(0, 300)}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outPath, buf);
}

async function pool<T>(
  items: T[],
  limit: number,
  worker: (item: T, idx: number) => Promise<void>,
) {
  const queue = items.map((item, idx) => ({ item, idx }));
  const workers = Array.from({ length: limit }, async () => {
    while (queue.length > 0) {
      const next = queue.shift();
      if (!next) return;
      await worker(next.item, next.idx);
    }
  });
  await Promise.all(workers);
}

async function main() {
  const todo = NARRATION.filter((entry) => {
    const voice = VOICES[entry.speaker];
    if (!voice) {
      console.warn(`SKIP (no voice for speaker "${entry.speaker}"): ${entry.id}`);
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

  const totalChars = todo.reduce((sum, e) => sum + e.text.length, 0);
  console.log(`\n${todo.length} new file(s), ~${totalChars} chars total.`);
  if (totalChars > BUDGET_CHAR_LIMIT) {
    console.error(
      `\nBudget exceeded: ${totalChars} chars > ${BUDGET_CHAR_LIMIT} char limit.\n` +
        `Override with BUDGET_CHARS=10000 (ElevenLabs Free monthly cap).`,
    );
    process.exit(2);
  }

  let count = 0;
  let failed = 0;
  await pool(todo, CONCURRENCY, async (entry) => {
    const voice = VOICES[entry.speaker]!;
    const outPath = path.join(OUT_BASE, entry.speaker, `${entry.id}.mp3`);
    const idx = ++count;
    try {
      await generate(
        entry.text,
        voice.voiceId,
        voice.stability,
        voice.similarityBoost,
        voice.style,
        outPath,
      );
      console.log(
        `[${idx}/${todo.length}] ${entry.speaker}/${entry.id} ok (${voice.displayName}, ${entry.text.length} chars)`,
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
