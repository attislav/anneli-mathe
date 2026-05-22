// Generates a small set of "production" hero images that ship with the app.
// Style locked to match generate-test-images.mjs (Hilda/Moomin vibe).
//
// Run: OPENAI_API_KEY=... node scripts/generate-hero-images.mjs
//      or: node --env-file=.env.local scripts/generate-hero-images.mjs
//
// Output: public/hero/*.png
// Quality: low (per ROADMAP — "gpt-image-2 quality low" in Wo 2)

import fs from "node:fs";
import path from "node:path";

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error("Missing OPENAI_API_KEY.");
  process.exit(1);
}

const OUT_DIR = path.resolve("public/hero");
fs.mkdirSync(OUT_DIR, { recursive: true });

// Style — locked across all hero images for visual consistency.
const STYLE_BASE = [
  "flat 2D illustration in the style of the Netflix series 'Hilda' and 'Moomin'",
  "soft warm pastel palette: mint green, lavender, peach, with turquoise and honey accents",
  "clean shapes, strong silhouettes, gentle outlines, reduced detail, charming and friendly",
  "atmospheric storybook mood, magical adventure feel, inviting and dreamy",
  "no text, no letters, no logos in the image",
].join(", ");

// Anneli — locked appearance.
const ANNELI = [
  "Anneli: a 7-year-old girl with shoulder-length blonde hair, fair skin, warm brown eyes, gentle curious expression",
  "her outfit is a peach-colored cardigan over a mint green dress, dark leggings, sturdy little boots, a small leather satchel at her side",
].join(", ");

const IMAGES = [
  {
    id: "anneli-with-book",
    aspect: "1024x1024",
    prompt: [
      ANNELI,
      "She sits cross-legged on a warm cream-colored floor, holding a glowing magical old book open in her lap. Tiny pastel sparkles drift up from the open pages, hinting that the book is alive and full of worlds.",
      "Soft cozy interior background — out of focus, dreamy. Golden hour light. Hero portrait composition, centered, plenty of space around her for layout.",
    ].join(" "),
  },
  {
    id: "sky-kingdom-vista",
    aspect: "1536x1024",
    prompt: [
      "A vast wide-angle vista of a magical Sky Kingdom: many small floating pastel islands suspended in a soft mint-and-lavender sky, connected by wobbly wooden bridges and stone bridges that have visibly cracked or buckled.",
      "Each island has tiny details: small cottages, trees with peach-colored leaves, flocks of friendly cartoon birds.",
      "Gentle morning clouds drift between the islands. Some bridges are clearly broken — gaps in the path. Storybook composition, plenty of empty sky above for a UI overlay headline.",
      "No characters in foreground. Wide cinematic feel.",
    ].join(" "),
  },
  {
    id: "library-of-worlds",
    aspect: "1536x1024",
    prompt: [
      "Interior of a magical Library of Worlds — tall arched bookshelves stretching upward into warm golden light, ornate wooden ladders, glowing floating books drifting between shelves.",
      "Between the shelves: several tall ornate doorways that are slightly ajar, each revealing a glimpse of a different world beyond (a sky kingdom, a peach desert, an underwater garden — only hinted).",
      "Cozy reading nooks with soft cushions. Lavender, peach and mint pastel light. Wide composition with a clear empty area in the center foreground for Anneli to stand later.",
      "No characters in this image — only the empty inviting library.",
    ].join(" "),
  },
];

const MODEL = "gpt-image-2";
const QUALITY = "low";

async function generate(prompt, size, outPath) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      n: 1,
      size,
      quality: QUALITY,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI ${res.status}: ${text}`);
  }

  const data = await res.json();
  const b64 = data.data[0].b64_json;
  fs.writeFileSync(outPath, Buffer.from(b64, "base64"));
}

async function main() {
  for (const img of IMAGES) {
    const out = path.join(OUT_DIR, `${img.id}.png`);
    if (fs.existsSync(out) && !process.env.FORCE) {
      console.log(`skip (exists): ${img.id}`);
      continue;
    }
    const fullPrompt = `${img.prompt} Style: ${STYLE_BASE}.`;
    process.stdout.write(`generating ${img.id} (${img.aspect}, ${QUALITY}) ... `);
    try {
      await generate(fullPrompt, img.aspect, out);
      console.log("ok");
    } catch (err) {
      console.log("FAILED");
      console.error(err.message);
    }
  }
  console.log(`\nDone. Images in ${OUT_DIR}`);
}

main();
