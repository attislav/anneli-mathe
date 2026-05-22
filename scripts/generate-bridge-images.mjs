// Generates the per-bridge state images (broken / repaired) for Sky Kingdom
// AND the Book character asset (replaces lucide BookOpen as the talking book).
//
// Run: OPENAI_API_KEY=... node scripts/generate-bridge-images.mjs
//      or: node --env-file=.env.local scripts/generate-bridge-images.mjs
//      FORCE=1 ... to re-generate existing files.
//
// Output:
//   public/bridges/<id>/broken.png
//   public/bridges/<id>/repaired.png
//   public/characters/book.png
//
// Quality: low (per ROADMAP — gpt-image-2 quality low).

import fs from "node:fs";
import path from "node:path";

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error("Missing OPENAI_API_KEY.");
  process.exit(1);
}

const ROOT_OUT = path.resolve("public");

// Style — locked to match generate-hero-images.mjs.
const STYLE_BASE = [
  "flat 2D illustration in the style of the Netflix series 'Hilda' and 'Moomin'",
  "soft warm pastel palette: mint green, lavender, peach, with turquoise and honey accents",
  "clean shapes, strong silhouettes, gentle outlines, reduced detail, charming and friendly",
  "atmospheric storybook mood, magical adventure feel, inviting and dreamy",
  "no text, no letters, no logos in the image",
].join(", ");

// World context — drilled into every bridge prompt so they all feel like the
// same Sky Kingdom.
const WORLD = [
  "set in a magical Sky Kingdom of small floating pastel islands suspended in a mint-and-lavender sky",
  "warm friendly cartoon birds visible nearby",
  "soft morning clouds drift past",
  "square crop, centered composition, bridge fills the middle of the frame, empty pastel sky in the upper portion for UI overlay",
].join(", ");

// Per-bridge prompts. Each has its own visual identity that maps to the skill.
// `broken` = before Anneli helps. `repaired` = after.
const BRIDGES = [
  {
    id: "steinzaehl",
    name: "Stone Counting Bridge",
    broken:
      "A wide bridge made of round flat stepping stones between two small floating islands. Several stones are missing — visible gaps where you can see down through to the clouds below. A mother bird hovers worriedly at the edge of one gap. The stones are pastel mint and peach, weathered. The mood is gently worried but not scary.",
    repaired:
      "The same wide stepping-stone bridge, now complete — every round stone in place, glowing softly with a magical mint sheen as if just freshly mended. The mother bird stands proudly at the center with a small smile. Tiny pastel sparkles drift up from the seams between stones. The mood is calm, accomplished, warm.",
  },
  {
    id: "holzplanken",
    name: "Wooden Plank Bridge",
    broken:
      "A wooden plank suspension bridge between two floating islands. Several wooden planks in the middle are missing — gaps showing through to the sky below. The rope handrails are intact but the path is broken. A small bird stands at one end, tilting its head at the gaps. Warm honey-colored wood, peach rope.",
    repaired:
      "The same wooden plank bridge, now whole — every plank in place, wood freshly polished, glowing softly with magical golden warmth. The bird on top hops happily across. Tiny pastel sparkles trace the planks. Calm, satisfying.",
  },
  {
    id: "bruechig",
    name: "Crumbling Stone Bridge",
    broken:
      "An ancient arched stone bridge between two floating islands, visibly crumbling — cracks running down its surface, several large stones already fallen and tumbling away into the clouds below. The bridge still stands but looks fragile. Lavender and peach weathered stone. A worried little bird perches on the highest point.",
    repaired:
      "The same arched stone bridge, now beautifully restored — solid, no cracks, every stone in place. A gentle lavender glow runs along the seams where it was mended. The little bird sits proudly at the top. Pastel sparkles drift around the arch. Calm, magical.",
  },
  {
    id: "waage",
    name: "Balance / Scale Bridge",
    broken:
      "A giant magical balance-scale forming a bridge between two floating islands — two large round pastel pans hanging from a tall central pillar, the pans tilted wildly out of balance. Small stones and coins sit unevenly on the pans. A bird hops between the pans, confused. Mint and lavender pastel scale, peach pillar.",
    repaired:
      "The same balance-scale bridge, now in perfect equilibrium — the two pans level and steady, neatly balanced loads on each side, the central pillar glowing softly. The bird stands proudly at the top of the pillar. Pastel sparkles drift around the pans. Calm, satisfying.",
  },
  {
    id: "nachbarn",
    name: "Neighbor Plank Bridge",
    broken:
      "A long wooden plank bridge between floating islands where each plank has a faint hand-painted number on it — but several numbered planks in the middle are missing, leaving gaps. The plank numbers visible read like 10, 20, 30 and so on (rounded tens) in a soft style. A bird hops near a gap, looking puzzled. Mint and honey wood.",
    repaired:
      "The same numbered plank bridge, now complete — every numbered plank in place, the gentle hand-painted numerals visible on the warm wood. A soft lavender glow runs the length of the bridge. The bird hops across happily. Tiny sparkles trace the path.",
  },
  {
    id: "zehner",
    name: "Mirror Bridge",
    broken:
      "A magical mirror bridge between two floating islands — the path is a single beam of pale crystal that should reflect itself perfectly into a second beam below, like a mirror, but the reflection is broken, fragmented into floating crystal shards drifting away. Lavender and turquoise crystal. A bird looks at its broken reflection curiously.",
    repaired:
      "The same mirror bridge, now whole — the upper crystal beam and its perfect mirror reflection below form a complete symmetric path between the islands. The crystal glows softly in lavender and mint. The bird sees its reflection clearly and the two birds mirror each other's pose. Calm, magical, satisfying.",
  },
];

// Book character — used as the talking-book character throughout the app.
// Replaces the lucide BookOpen icon in the floating Book component and intro.
const BOOK = {
  id: "book",
  outDir: "characters",
  size: "1024x1024",
  prompt: [
    "A friendly magical old storybook character, slightly open with warm golden glowing pages, leather cover in deep lavender with peach trim and tiny golden ornaments at the corners. The book has gentle anthropomorphic charm — a hint of two small kind eyes barely visible at the top of the open pages and a tiny upturned smile suggested by the curve of a bookmark ribbon. Magical pastel sparkles drift up from the pages. Centered composition, transparent-feeling pastel background (very soft mint), the book fills most of the frame. Storybook companion character — wise, warm, never scary.",
  ].join(" "),
};

const MODEL = "gpt-image-2";
const QUALITY = "low";
const SIZE = "1024x1024";

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
  let okCount = 0;
  let failCount = 0;
  let skipCount = 0;

  // Per-bridge: broken + repaired.
  for (const bridge of BRIDGES) {
    const outDir = path.join(ROOT_OUT, "bridges", bridge.id);
    fs.mkdirSync(outDir, { recursive: true });
    for (const state of ["broken", "repaired"]) {
      const out = path.join(outDir, `${state}.png`);
      if (fs.existsSync(out) && !process.env.FORCE) {
        console.log(`skip (exists): ${bridge.id}/${state}`);
        skipCount++;
        continue;
      }
      const desc = bridge[state];
      const fullPrompt = `${desc} World: ${WORLD}. Style: ${STYLE_BASE}.`;
      process.stdout.write(
        `generating ${bridge.id}/${state} (${SIZE}, ${QUALITY}) ... `,
      );
      try {
        await generate(fullPrompt, SIZE, out);
        console.log("ok");
        okCount++;
      } catch (err) {
        console.log("FAILED");
        console.error(err.message);
        failCount++;
      }
    }
  }

  // Book character.
  {
    const outDir = path.join(ROOT_OUT, BOOK.outDir);
    fs.mkdirSync(outDir, { recursive: true });
    const out = path.join(outDir, `${BOOK.id}.png`);
    if (fs.existsSync(out) && !process.env.FORCE) {
      console.log(`skip (exists): ${BOOK.outDir}/${BOOK.id}`);
      skipCount++;
    } else {
      const fullPrompt = `${BOOK.prompt} Style: ${STYLE_BASE}.`;
      process.stdout.write(
        `generating ${BOOK.outDir}/${BOOK.id} (${BOOK.size}, ${QUALITY}) ... `,
      );
      try {
        await generate(fullPrompt, BOOK.size, out);
        console.log("ok");
        okCount++;
      } catch (err) {
        console.log("FAILED");
        console.error(err.message);
        failCount++;
      }
    }
  }

  console.log(
    `\nDone. ok=${okCount} fail=${failCount} skip=${skipCount}. Output under ${ROOT_OUT}/bridges and ${ROOT_OUT}/characters.`,
  );
}

main();
