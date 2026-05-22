// Sound-Effects-Generator (ElevenLabs Sound-Generation API).
// Endpoint: POST /v1/sound-generation — bestätigt auf Free verfügbar.
//
// Output: public/audio/fx/<id>.mp3
//
// Run: node --env-file=.env.local scripts/generate-sound-fx.mjs
//      (legt .env.local an, ELEVENLABS_API_KEY=... muss drinstehen)
//
// Hinweis: kein eigenes char-Budget — Sound-Gen läuft auf separater Quota,
// max 11s pro Clip, max 4-5 Clips für Kapitel 1.

import fs from "node:fs";
import path from "node:path";

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error("Missing ELEVENLABS_API_KEY.");
  process.exit(1);
}

const OUT_DIR = path.resolve("public/audio/fx");
fs.mkdirSync(OUT_DIR, { recursive: true });

// Die 4 Sound-FX für Kapitel 1:
// - bird-chirp: Vogelzwitschern, kurz, mehrfach pro Session abgespielt
// - wind-soft: leiser Hintergrundwind, loopbar, 8-10s
// - bridge-creak: Holz-Knarzen, wenn Anneli auf die Brücke tritt
// - magic-chime: weicher Glöckchen-Klang bei richtiger Antwort / Brücke fertig
const FX = [
  {
    id: "bird-chirp",
    prompt:
      "A short, cheerful little bird chirp — like a friendly cartoon songbird greeting someone. Bright, light, two or three notes, no music behind it.",
    duration_seconds: 2.5,
    prompt_influence: 0.7,
  },
  {
    id: "wind-soft",
    prompt:
      "Soft gentle wind blowing through high-altitude open air, very calming and dreamy, peaceful sky atmosphere, no whistling, no harshness. Looped, ambient.",
    duration_seconds: 8.0,
    prompt_influence: 0.5,
  },
  {
    id: "bridge-creak",
    prompt:
      "A short wooden bridge creak — old wood gently shifting under weight, just once, soft and harmless, not scary.",
    duration_seconds: 2.0,
    prompt_influence: 0.7,
  },
  {
    id: "magic-chime",
    prompt:
      "A soft sparkling magical chime — like a tiny silver bell with shimmer, warm and reassuring, signaling success. Pastel and gentle, not arcade-bright.",
    duration_seconds: 2.0,
    prompt_influence: 0.65,
  },
];

async function generate(fx) {
  const url = "https://api.elevenlabs.io/v1/sound-generation";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: fx.prompt,
      duration_seconds: fx.duration_seconds,
      prompt_influence: fx.prompt_influence,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${errText.slice(0, 300)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const out = path.join(OUT_DIR, `${fx.id}.mp3`);
  fs.writeFileSync(out, buf);
  return out;
}

async function main() {
  let made = 0;
  for (const fx of FX) {
    const out = path.join(OUT_DIR, `${fx.id}.mp3`);
    if (fs.existsSync(out) && !process.env.FORCE) {
      console.log(`skip (exists): ${fx.id}`);
      continue;
    }
    process.stdout.write(`generating ${fx.id} (${fx.duration_seconds}s) ... `);
    try {
      await generate(fx);
      console.log("ok");
      made++;
    } catch (err) {
      console.log("FAILED");
      console.error(err.message);
    }
  }
  console.log(`\nDone. ${made} new, files in ${OUT_DIR}`);
}

main();
