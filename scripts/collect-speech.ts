// Sammelt alles ein, was im Kopfrechen-Training vertont werden muss, und
// schreibt daraus ein Manifest für scripts/generate-training-audio.ts.
//
// Zwei Sorten Audio:
//   1. `numbers`   — die Zahlen 0–100, einzeln gesprochen
//   2. `fragments` — die Textbausteine zwischen den Zahlen, eingesammelt aus
//                    zehntausenden generierten Aufgaben (Aufgabe, Tipp,
//                    Rechenweg). Endliche Menge, weil alle Texte Schablonen
//                    mit eingesetzten Zahlen sind.
//   3. `texts`     — feste Sätze am Stück: Modul-Beschreibungen und die
//                    Trick-Erklärungen. Die haben keine Lücken, also können
//                    sie als ganzer Satz vertont werden (beste Qualität).
//
// Aufruf: npm run collect:speech

import fs from "node:fs";
import path from "node:path";
import { generateTrainingTask } from "../src/data/training/index";
import { TRAINING_MODULES } from "../src/data/training/modules";
import {
  MAX_SPOKEN_NUMBER,
  fragmentKey,
  splitSpeech,
  staticAudioId,
  toSpokenText,
} from "../src/data/training/speech";
import type { Level } from "../src/data/training/types";

const LEVELS: Level[] = ["easy", "normal", "hard"];
/** Stichproben pro (Modul, Level). Hoch genug, dass jede Schablone drankommt. */
const SAMPLES = 4000;

const fragments = new Map<string, { text: string; seen: number; example: string }>();

function collect(text: string, source: string) {
  for (const part of splitSpeech(text)) {
    if (part.kind !== "fragment") continue;
    const existing = fragments.get(part.text);
    if (existing) existing.seen++;
    else fragments.set(part.text, { text: part.text, seen: 1, example: source });
  }
}

for (const mod of TRAINING_MODULES) {
  for (const level of LEVELS) {
    for (let i = 0; i < SAMPLES; i++) {
      const t = generateTrainingTask(mod.id, level);
      collect(t.prompt, `${mod.id}: ${t.prompt}`);
      collect(t.hint, `${mod.id}: ${t.hint}`);
      collect(t.solution, `${mod.id}: ${t.solution}`);
    }
  }
}

// Feste Texte: Modul-Beschreibung + Trick-Erklärungen, jeweils als ganzer Satz.
type StaticText = { id: string; text: string };
const texts: StaticText[] = [];

// Auch feste Sätze gehen durch `toSpokenText`: die Trick-Schritte enthalten
// Terme wie „10 · 7 = 70", die als „10 mal 7 ist 70" gesprochen gehören und
// nicht als „10 Punkt 7 gleich 70".
function spoken(text: string): string {
  return toSpokenText(text, { placeholders: false });
}

for (const mod of TRAINING_MODULES) {
  texts.push({ id: staticAudioId.summary(mod.id), text: spoken(mod.summary) });
  mod.tricks.forEach((trick, ti) => {
    texts.push({ id: staticAudioId.trickTitle(mod.id, ti), text: spoken(`${trick.title}.`) });
    texts.push({ id: staticAudioId.trickIdea(mod.id, ti), text: spoken(trick.idea) });
    trick.steps.forEach((step, si) => {
      texts.push({ id: staticAudioId.trickStep(mod.id, ti, si), text: spoken(step) });
    });
  });
}

const manifest = {
  generatedAt: new Date().toISOString(),
  numbers: Array.from({ length: MAX_SPOKEN_NUMBER + 1 }, (_, n) => n),
  fragments: Array.from(fragments.values())
    .sort((a, b) => b.seen - a.seen)
    .map((f) => ({ key: fragmentKey(f.text), text: f.text, seen: f.seen, example: f.example })),
  texts,
};

const outPath = path.resolve("src/data/training/speech-manifest.json");
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n");

console.log(`Zahlen:     ${manifest.numbers.length}`);
console.log(`Bausteine:  ${manifest.fragments.length}`);
console.log(`Feste Sätze:${String(manifest.texts.length).padStart(4)}`);
console.log(`Gesamt:     ${manifest.numbers.length + manifest.fragments.length + manifest.texts.length} Audio-Dateien`);
console.log(`\n→ ${path.relative(process.cwd(), outPath)}`);

// Schlüssel-Kollisionen wären fatal (zwei Texte, eine Datei).
const keys = new Set<string>();
for (const f of manifest.fragments) {
  if (keys.has(f.key)) {
    console.error(`KOLLISION: ${f.key} (${f.text})`);
    process.exit(1);
  }
  keys.add(f.key);
}
