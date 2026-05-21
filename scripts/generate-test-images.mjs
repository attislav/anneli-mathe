// Quick Style-Test: generates 2 scenes × 4 variations × 2 qualities (low + medium).
// Run: node --env-file=.env.local scripts/generate-test-images.mjs
//
// Output: public/test-images/*.png
// Total: 16 images — compare quality tiers side by side.

import fs from "node:fs";
import path from "node:path";

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error("Missing OPENAI_API_KEY. Did you put it in .env.local?");
  process.exit(1);
}

const OUT_DIR = path.resolve("public/test-images");
fs.mkdirSync(OUT_DIR, { recursive: true });

// Visual style — locked across all images for consistency check.
const STYLE_BASE = [
  "flat 2D illustration in the style of the Netflix series 'Hilda' and 'Moomin'",
  "soft warm pastel palette: mint green, lavender, peach, with turquoise and honey accents",
  "clean shapes, strong silhouettes, gentle outlines, reduced detail, charming and friendly",
  "atmospheric storybook mood, magical adventure feel, inviting and dreamy",
  "no text, no letters, no logos in the image",
].join(", ");

// Main character — locked across all images for identity consistency.
const ANNELI = [
  "the main character is Anneli: a 7-year-old girl with shoulder-length blonde hair, fair skin, warm brown eyes, gentle curious expression",
  "her outfit is a peach-colored cardigan over a mint green dress, dark leggings, sturdy little boots, a small leather satchel at her side",
].join(", ");

const SCENES = [
  {
    id: "library",
    name: "Anneli in der Bibliothek der Welten",
    core: `${ANNELI}. The setting: the interior of a magical Library of Worlds — tall arched bookshelves stretching upward, glowing floating books, ornate wooden ladders, and shimmering doorways embedded between shelves that hint at other worlds beyond. Cozy reading nooks with soft cushions`,
    variants: [
      { id: "a", twist: "Anneli stands in the middle of the library looking up in wonder, golden hour light streaming through tall stained-glass windows" },
      { id: "b", twist: "Anneli sits curled up in a reading nook with a glowing book in her lap, surrounded by magical floating orbs at twilight" },
      { id: "c", twist: "Anneli climbs a tall wooden ladder reaching for a special glowing book, soft mint and peach dawn mist around her" },
      { id: "d", twist: "Anneli walks between two tall shelves, viewed from behind, more stylized graphic composition with simplified shapes" },
    ],
  },
  {
    id: "portal",
    name: "Anneli vor einem magischen Tor",
    core: `${ANNELI}. The setting: a tall ornate doorway standing freely inside the library, the door slightly ajar, revealing a glimpse of a completely different world beyond. The threshold itself glows softly`,
    variants: [
      { id: "a", twist: "Anneli stands hesitating at the doorway, looking into a floating-island sky kingdom in mint and pastel blue beyond" },
      { id: "b", twist: "Anneli reaches out a hand toward the threshold, the world beyond is an underwater garden in lavender and turquoise" },
      { id: "c", twist: "Anneli steps halfway through, peach desert with crystalline plants and a small friendly dragon visible beyond" },
      { id: "d", twist: "Anneli stands silhouetted in the doorway looking back over her shoulder, a cozy pastel forest village with chimney smoke beyond" },
    ],
  },
];

const PREVIEW = process.env.PREVIEW === "1";
const QUALITIES = PREVIEW ? ["low"] : ["low", "medium"];
const MODEL = "gpt-image-2";

async function generate(prompt, quality, outPath) {
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
      size: "1024x1024",
      quality,
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
  // In PREVIEW mode: only the first variant of each scene
  const scenes = PREVIEW
    ? SCENES.map((s) => ({ ...s, variants: s.variants.slice(0, 1) }))
    : SCENES;
  const total = scenes.reduce((n, s) => n + s.variants.length, 0) * QUALITIES.length;
  let count = 0;
  for (const scene of scenes) {
    for (const v of scene.variants) {
      const prompt = `${scene.core}. ${v.twist}. Style: ${STYLE_BASE}.`;
      for (const q of QUALITIES) {
        const name = `${scene.id}-${v.id}-${q}.png`;
        const outPath = path.join(OUT_DIR, name);
        process.stdout.write(`[${++count}/${total}] ${name} ... `);
        try {
          await generate(prompt, q, outPath);
          console.log("ok");
        } catch (err) {
          console.log("FAILED");
          console.error(err.message);
        }
      }
    }
  }
  console.log(`\nDone. Images saved to ${OUT_DIR}`);
}

main();
