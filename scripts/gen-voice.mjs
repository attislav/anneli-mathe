// Feste Sätze der App-Stimme (Lob, Begrüßung, Truhe …) mit Gemini TTS erzeugen.
//
//   npm run gen:voice              → fehlende Sätze erzeugen
//   npm run gen:voice -- praise    → nur diese Gruppe (überschreibt)
//
// Der Schlüssel (GEMINI_API_KEY) kommt aus der Umgebung oder .env.local und
// wird NUR hier beim Erzeugen benutzt — die App spielt nur fertige mp3s ab.
// Jede Aufnahme wird zur Kontrolle wieder in Text umgewandelt: Liest die
// Stimme die Regie-Anweisung mit oder verschluckt etwas, wird neu erzeugt.
// Braucht ffmpeg (Stille abschneiden, Lautstärke angleichen, mp3).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { record } from "./voice/tts.mjs";

const OUT = "public/stimme";
const LIST = "src/game/voiceLines.json";

const cfg = JSON.parse(readFileSync("scripts/voice/lines.json", "utf8"));
const only = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });

const counts = {};
for (const [group, lines] of Object.entries(cfg.lines)) {
  let n = 0;
  for (let i = 0; i < lines.length; i++) {
    const out = `${OUT}/${group}-${i}.mp3`;
    const want = only.length ? only.includes(group) : !existsSync(out);
    if (want) {
      process.stdout.write(`${group}-${i} „${lines[i]}“ … `);
      const ok = await record(lines[i], out, { style: cfg.style, voice: cfg.voice, log: (m) => process.stdout.write(m) });
      console.log(ok ? "ok" : "FEHLER");
    }
    // Nur lückenlos vorhandene Sätze zählen — die App wählt aus 0 … n-1.
    if (existsSync(out) && n === i) n++;
  }
  if (n) counts[group] = n;
}

writeFileSync(LIST, JSON.stringify(counts, null, 2) + "\n");
console.log(`${Object.values(counts).reduce((a, b) => a + b, 0)} Sätze fertig → ${LIST}`);
