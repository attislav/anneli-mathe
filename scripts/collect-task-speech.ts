// Sammelt alle Bausteine ein, die zum Vorlesen der Aufgaben, Tipps und Lösungen nötig sind, und
// schreibt sie nach scripts/voice/task-manifest.json (Vorlage für
// `npm run gen:task-audio`). Würfelt dafür sehr viele Aufgaben pro
// Kompetenz und Stufe — die Texte sind Schablonen, die Menge ist endlich.
//
//   npm run collect:task-speech

import fs from "node:fs";
import { SKILLS } from "../src/game/skills";
import type { Level } from "../src/game/types";
import { taskPieces, textPieces } from "../src/game/taskSpeech";

/** Sachaufgaben und Kombinatorik haben hunderte Namen/Dinge-Kombinationen — kommen später. */
const LATER = new Set(["sachaufgaben", "kombinatorik"]);
const RUNS = 2000;

const numbers = new Set<number>();
const texts = new Map<string, { text: string; whole: boolean; seen: number }>();

for (const skill of Object.values(SKILLS)) {
  if (LATER.has(skill.id)) continue;
  for (const level of [1, 2, 3, 4, 5] as Level[]) {
    for (let i = 0; i < RUNS; i++) {
      const t = skill.gen({ level, avoid: [] });
      const all = [taskPieces({ question: t.question, term: "term" in t ? (t.term as string | undefined) : undefined }), textPieces(t.hint), textPieces(t.solution)];
      for (const pieces of all) for (const p of pieces) {
        if (p.kind === "number") numbers.add(p.value);
        if (p.kind === "text") {
          const e = texts.get(p.key);
          if (e) e.seen++;
          // „whole" = ganze Frage ohne Zahl (Frage-Melodie), sonst ein Satzstück.
          else texts.set(p.key, { text: p.text, whole: pieces.length === 1 || /[?!]$/.test(p.text), seen: 1 });
        }
      }
    }
  }
}

const manifest = {
  _info: "Erzeugt von `npm run collect:task-speech`. Vorlage für `npm run gen:task-audio`.",
  numbers: [...numbers].sort((a, b) => a - b),
  texts: [...texts.entries()].sort((a, b) => b[1].seen - a[1].seen).map(([key, v]) => ({ key, text: v.text, whole: v.whole })),
};
fs.writeFileSync("scripts/voice/task-manifest.json", JSON.stringify(manifest, null, 1) + "\n");
console.log(`${manifest.numbers.length} Zahlen, ${manifest.texts.length} Textbausteine → scripts/voice/task-manifest.json`);
