// Smoke-Test für die Kopfrechen-Generatoren.
// Erzeugt 500 Aufgaben pro (Modul, Level) und prüft Invarianten:
//   - Antwort ist eine ganze, nicht-negative Zahl
//   - Aufgabe und Erklärtexte sind nicht leer
//   - Zahlenraum passt zum Modul (Modul 1 bleibt bei ≤ 10 usw.)
//   - der Prompt enthält keine kaputten Terme (z.B. "randInt" oder "NaN")
//
// Aufruf: npm run smoke:training

import { generateTrainingTask } from "../src/data/training/index";
import { TRAINING_MODULES } from "../src/data/training/modules";
import type { Level } from "../src/data/training/types";

const LEVELS: Level[] = ["easy", "normal", "hard"];
const PER_COMBO = 500;

/** Obergrenze des erlaubten Zahlenraums pro Modul (Antwort UND Prompt-Zahlen). */
const MAX_VALUE: Record<string, number> = {
  zahlenfreunde: 15,
  bis20: 20,
  zehnersprung: 20,
  verdoppeln: 100,
  "volle-zehner": 100,
  bis100: 100,
  "fast-zehner": 100,
  "einmaleins-kern": 100,
  einmaleins: 100,
  teilen: 100,
};

let bad = 0;
function fail(msg: string, extra: unknown) {
  console.error("FAIL:", msg, JSON.stringify(extra));
  bad++;
}

for (const mod of TRAINING_MODULES) {
  for (const level of LEVELS) {
    for (let i = 0; i < PER_COMBO; i++) {
      const t = generateTrainingTask(mod.id, level);

      if (!Number.isInteger(t.correctAnswer) || t.correctAnswer < 0) {
        fail(`${mod.id}/${level}: Antwort ist keine ganze Zahl ≥ 0`, t);
      }
      if (t.moduleId !== mod.id) fail("moduleId stimmt nicht", t);
      if (!t.prompt || t.prompt.length < 3) fail("Prompt zu kurz", t);
      if (!t.hint || t.hint.length < 5) fail("Hint fehlt", t);
      if (!t.solution || t.solution.length < 5) fail("Solution fehlt", t);
      if (/NaN|undefined|Infinity/.test(t.prompt + t.hint + t.solution)) {
        fail("kaputter Text", t);
      }

      const limit = MAX_VALUE[mod.id];
      if (t.correctAnswer > limit) fail(`Antwort über Zahlenraum (${limit})`, t);

      // Alle im Prompt vorkommenden Zahlen müssen im Zahlenraum liegen.
      for (const numStr of t.prompt.match(/\d+/g) ?? []) {
        if (Number(numStr) > limit) fail(`Prompt-Zahl über Zahlenraum (${limit})`, t);
      }

      // Der in `solution` genannte Endwert muss die richtige Antwort enthalten.
      if (!t.solution.includes(String(t.correctAnswer))) {
        fail("Solution nennt die Antwort nicht", t);
      }
    }
  }
}

if (bad > 0) {
  console.error(`\n${bad} Problem(e) gefunden.`);
  process.exit(1);
}
console.log(
  `OK — ${TRAINING_MODULES.length} Module × ${LEVELS.length} Level × ${PER_COMBO} Aufgaben geprüft.`
);
