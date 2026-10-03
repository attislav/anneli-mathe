// Holt die Bild-Atlanten vom Higgsfield-CDN nach public/art/ — danach lädt
// die App die Bilder vom eigenen Server statt von fremden.
//
//   npm run art:fetch && git add public/art && git commit -m "Bilder lokal"

import { mkdirSync, writeFileSync } from "node:fs";
import { readFileSync } from "node:fs";

const src = readFileSync("src/game/art.ts", "utf8");
const pairs = [...src.matchAll(/local: "\/art\/([^"]+)",\s*url: "([^"]+)"/g)];
mkdirSync("public/art", { recursive: true });
for (const [, file, url] of pairs) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(`public/art/${file}`, buf);
  console.log(`public/art/${file}  ${(buf.length / 1024).toFixed(0)} KB`);
}
