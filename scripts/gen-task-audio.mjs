// Vertont die Aufgaben-Bausteine (Zahlen + Satzstücke) mit der App-Stimme.
//
//   npm run collect:task-speech   → scripts/voice/task-manifest.json (was gebraucht wird)
//   npm run gen:task-audio        → fehlende Bausteine aufnehmen
//   npm run gen:task-audio -- --force   → alles neu
//
// Ergebnis: public/stimme/aufgabe/n/<zahl>.mp3, public/stimme/aufgabe/t/<key>.mp3
// und src/game/taskSpeechAvail.json (was fertig ist — nur Aufgaben, deren
// Bausteine ALLE da sind, bekommen in der App einen Vorlese-Knopf).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { record } from "./voice/tts.mjs";

const { voice } = JSON.parse(readFileSync("scripts/voice/lines.json", "utf8"));
const manifest = JSON.parse(readFileSync("scripts/voice/task-manifest.json", "utf8"));
const force = process.argv.includes("--force");
const PARALLEL = 6;
// Kurz halten und „nur den Text" betonen — bei langen Regie-Texten und kurzen
// Wörtern erfindet das Modell sonst ganze Sätze dazu.
const BASE = "A kind, calm primary school teacher. Natural German, clear and friendly.";
const ONLY = "Read ONLY the transcript, word for word, nothing else.";
const STYLE = {
  whole: `${BASE} ${ONLY}`,
  part: `${BASE} Neutral, even intonation. ${ONLY}`,
};

/** Zahl als deutsches Wort (0–1000) — Ziffern liest das Modell unzuverlässig. */
const ONES = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"];
const TENS = ["", "", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"];
function numberWord(n) {
  if (n === 1000) return "tausend";
  if (n >= 100) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    return `${h === 1 ? "" : ONES[h]}hundert${rest ? numberWord(rest) : ""}`;
  }
  if (n < 20) return ONES[n];
  const o = n % 10;
  return o ? `${o === 1 ? "ein" : ONES[o]}und${TENS[Math.floor(n / 10)]}` : TENS[Math.floor(n / 10)];
}

mkdirSync("public/stimme/aufgabe/n", { recursive: true });
mkdirSync("public/stimme/aufgabe/t", { recursive: true });

const jobs = [
  ...manifest.numbers.map((n) => ({ out: `public/stimme/aufgabe/n/${n}.mp3`, text: `${numberWord(n)}.`, opts: { style: STYLE.part, number: n } })),
  ...manifest.texts.map((t) => ({ out: `public/stimme/aufgabe/t/${t.key}.mp3`, text: t.text, opts: { style: t.whole ? STYLE.whole : STYLE.part } })),
].filter((j) => force || !existsSync(j.out));

console.log(`${jobs.length} Aufnahmen …`);
let done = 0;
const failed = [];
async function worker() {
  for (let job = jobs.shift(); job; job = jobs.shift()) {
    const notes = [];
    const ok = await record(job.text, job.out, { ...job.opts, voice, log: (m) => notes.push(m) });
    done++;
    if (!ok) failed.push(job.text);
    if (!ok || notes.length) console.log(`${ok ? "ok" : "FEHLER"} „${job.text}“ ${notes.join("")}`);
    if (done % 25 === 0) console.log(`… ${done} fertig`);
  }
}
await Promise.all(Array.from({ length: PARALLEL }, worker));

const avail = {
  n: manifest.numbers.filter((n) => existsSync(`public/stimme/aufgabe/n/${n}.mp3`)),
  t: manifest.texts.map((t) => t.key).filter((k) => existsSync(`public/stimme/aufgabe/t/${k}.mp3`)),
};
writeFileSync("src/game/taskSpeechAvail.json", JSON.stringify(avail) + "\n");
console.log(`Fertig: ${avail.n.length} Zahlen, ${avail.t.length} Textbausteine. Fehlgeschlagen: ${failed.length}`);
if (failed.length) console.log(failed.join(" | "));
