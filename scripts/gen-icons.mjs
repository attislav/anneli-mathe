// Belohnungs-Icons (Truhe, Münze, Stern, Flamme) mit GPT-Image erzeugen und
// zu EINEM Atlas zusammensetzen: public/art/icons.webp.
//
//   npm run gen:icons            → fehlende Icons erzeugen, Atlas bauen
//   npm run gen:icons -- coin    → dieses Icon neu erzeugen (überschreibt)
//
// Originale liegen in scripts/art/icons/ (nicht im Spiel, nur zum Neubauen).
// Der Schlüssel (OPENAI_API_KEY) wird NUR hier benutzt. Braucht ImageMagick.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2.5-sunburst";
const QUALITY = process.env.OPENAI_IMAGE_QUALITY ?? "low";
const CELL = 256;
const DIR = "scripts/art/icons";

const cfg = JSON.parse(readFileSync("scripts/art/icons.json", "utf8"));
const only = process.argv.slice(2);
mkdirSync(DIR, { recursive: true });
mkdirSync("public/art", { recursive: true });

for (const cell of cfg.cells.filter((c) => c.prompt)) {
  const out = `${DIR}/${cell.id}.png`;
  if (only.length ? !only.includes(cell.id) : existsSync(out)) continue;
  if (!KEY) {
    console.error("OPENAI_API_KEY fehlt.");
    process.exit(1);
  }
  process.stdout.write(`${cell.id} … `);
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, prompt: `${cfg.style} ${cell.prompt}`, size: "1024x1024", quality: QUALITY, background: "transparent", n: 1 }),
  });
  if (!res.ok) {
    console.log(`Fehler ${res.status}: ${(await res.text()).slice(0, 300)}`);
    continue;
  }
  const b64 = (await res.json()).data?.[0]?.b64_json;
  if (!b64) {
    console.log("keine Bilddaten");
    continue;
  }
  writeFileSync(out, Buffer.from(b64, "base64"));
  console.log("ok");
}

// Jede Zelle: Motiv freistellen, auf die Zelle einpassen. Graue Varianten
// („noch nicht verdient“) werden aus dem farbigen Original abgeleitet.
const tiles = [];
for (const cell of cfg.cells) {
  const src = `${DIR}/${cell.from ?? cell.id}.png`;
  if (!existsSync(src)) throw new Error(`${src} fehlt`);
  const tile = `${DIR}/.tile-${cell.id}.png`;
  const gray = cell.from ? ["-colorspace", "Gray", "-colorspace", "sRGB", "-channel", "RGB", "-evaluate", "multiply", "0.82", "-channel", "A", "-evaluate", "multiply", "0.85", "+channel"] : [];
  execFileSync("convert", [src, "-trim", "+repage", ...gray, "-resize", `${CELL - 12}x${CELL - 12}`, "-background", "none", "-gravity", "center", "-extent", `${CELL}x${CELL}`, tile]);
  tiles.push(tile);
}
const rows = Math.ceil(tiles.length / cfg.cols);
execFileSync("montage", [...tiles, "-tile", `${cfg.cols}x${rows}`, "-geometry", `${CELL}x${CELL}+0+0`, "-background", "none", "-quality", "88", "-define", "webp:alpha-quality=90", "public/art/icons.webp"]);
tiles.forEach((t) => rmSync(t));
console.log(`public/art/icons.webp (${cfg.cols}×${rows}): ${cfg.cells.map((c) => c.id).join(", ")}`);
