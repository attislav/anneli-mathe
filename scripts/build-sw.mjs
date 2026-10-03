// Erzeugt nach `next build` den Service Worker `out/sw.js`.
//
// Der Service Worker legt beim ersten Besuch ALLE Dateien der App in den
// Cache (Seiten, Skripte, Schriften, Icons, die Bild-Atlanten). Danach
// startet Sternenpfad auch ohne Netz — wichtig fürs Tablet im Auto oder
// im Urlaub. Die Versionsnummer ist ein Hash über die Dateiliste: jeder
// neue Build räumt den alten Cache auf.
//
//   npm run build   (läuft automatisch nach next build)

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const OUT = "out";
// Alter Story-/Trainings-Code — nicht verlinkt, also nicht vorab laden.
const SKIP = [/^quest\//, /^training\//, /^audio\//, /^bridges\//, /^hero\//, /^characters\//, /^(file|globe|next|vercel|window)\.svg$/, /^sw\.js$/, /^404/, /^_not-found\//];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [relative(OUT, p).split("\\").join("/")];
  });
}

const files = walk(OUT)
  .filter((f) => !SKIP.some((re) => re.test(f)))
  .sort();

const hash = createHash("sha256");
for (const f of files) hash.update(f).update(readFileSync(join(OUT, f)));
const version = hash.digest("hex").slice(0, 12);

const urls = files.map((f) => "/" + f.replace(/(^|\/)index\.html$/, "$1"));
const art = readFileSync("src/game/art.ts", "utf8").match(/https:\/\/[^"]+\.webp/g) ?? [];

const template = readFileSync("scripts/sw-template.js", "utf8");
writeFileSync(join(OUT, "sw.js"), template.replace("__VERSION__", version).replace("__PRECACHE__", JSON.stringify(urls)).replace("__ART__", JSON.stringify(art)));
console.log(`sw.js: ${urls.length} Dateien + ${art.length} Bild-Atlanten, Version ${version}`);
