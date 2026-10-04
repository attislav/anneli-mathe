// Puzzle-Ausmalbilder mit GPT-Image erzeugen.
//
//   npm run gen:malvorlagen            → fehlende Bilder erzeugen
//   npm run gen:malvorlagen -- insel   → nur dieses Bild (überschreibt)
//
// Der Schlüssel kommt aus der Umgebung oder aus .env.local (OPENAI_API_KEY)
// und wird NUR hier beim Erzeugen benutzt — nie im Browser.
// Ergebnis: public/malen/<id>.png und die Liste fertiger Bilder in
// src/game/puzzleImages.json (nur die tauchen im Spiel auf).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) {
  console.error("OPENAI_API_KEY fehlt. In .env.local eintragen oder als Umgebungsvariable setzen.");
  process.exit(1);
}
const MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2";
const QUALITY = process.env.OPENAI_IMAGE_QUALITY ?? "medium";

mkdirSync("public/malen", { recursive: true });
const cfg = JSON.parse(readFileSync("scripts/art/malvorlagen.json", "utf8"));
const only = process.argv.slice(2);
const listFile = "src/game/puzzleImages.json";
const done = new Set(existsSync(listFile) ? JSON.parse(readFileSync(listFile, "utf8")) : []);

for (const page of cfg.pages) {
  const out = `public/malen/${page.id}.png`;
  if (only.length ? !only.includes(page.id) : existsSync(out)) {
    if (existsSync(out)) done.add(page.id);
    continue;
  }
  process.stdout.write(`${page.id} … `);
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, prompt: `${cfg.style} ${page.scene}`, size: "1024x1536", quality: QUALITY, n: 1 }),
  });
  if (!res.ok) {
    console.log(`Fehler ${res.status}: ${(await res.text()).slice(0, 300)}`);
    continue;
  }
  const json = await res.json();
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) {
    console.log("keine Bilddaten in der Antwort");
    continue;
  }
  writeFileSync(out, Buffer.from(b64, "base64"));
  done.add(page.id);
  console.log("ok");
}

const order = cfg.pages.map((p) => p.id).filter((id) => done.has(id));
writeFileSync(listFile, JSON.stringify(order, null, 2) + "\n");
console.log(`${order.length} Bilder fertig → ${listFile}`);
