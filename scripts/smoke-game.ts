// Smoke-Test der Aufgaben-Generatoren: jede Kompetenz × jede Stufe × viele
// Würfe. Prüft, dass jede Aufgabe in sich stimmig ist (Antwort unter den
// Optionen, Lösung rechnet sich nach, Zahlenstrahl-Ziel liegt auf einem Strich …).
//
//   npm run smoke:game

import { SKILLS } from "../src/game/skills";
import type { Format, Level, TaskDraft } from "../src/game/types";

const RUNS = 3000;
const errors: string[] = [];
const formats = new Map<string, Set<Format>>();

const seen = new Set<string>();
function fail(skill: string, level: number, msg: string, t: TaskDraft) {
  const key = `${skill} L${level}: ${msg}`;
  if (seen.has(key)) return;
  seen.add(key);
  errors.push(`${key} → ${JSON.stringify(t)}`);
}

/** Rechnet einen Term mit genau einem „?" aus, indem es alle Kandidaten probiert. */
function solveTerm(term: string): number[] {
  const hits: number[] = [];
  if (!term.includes("=")) return hits;
  for (let x = 0; x <= 200; x++) {
    const expr = term.replace("?", String(x)).replace(/−/g, "-");
    const [l, r] = expr.split("=");
    try {
      if (Function(`return (${l}) === (${r})`)()) hits.push(x);
    } catch {
      return [];
    }
  }
  return hits;
}

function check(skill: string, level: Level, t: TaskDraft) {
  if (!t.question || !t.hint || !t.solution) fail(skill, level, "Text fehlt", t);
  if (/NaN|undefined/.test(JSON.stringify(t))) fail(skill, level, "NaN/undefined", t);
  switch (t.format) {
    case "choice":
      if (!t.options.includes(t.answer)) fail(skill, level, "Antwort nicht unter den Optionen", t);
      if (new Set(t.options).size !== t.options.length) fail(skill, level, "doppelte Optionen", t);
      if (t.options.length < 2) fail(skill, level, "zu wenige Optionen", t);
      if (t.options.some((o) => /^-/.test(o))) fail(skill, level, "negative Option", t);
      if (t.term?.includes("?") && t.term.includes("=")) {
        const sol = solveTerm(t.term);
        if (sol.length && !sol.includes(Number(t.answer))) fail(skill, level, `Term ergibt ${sol}`, t);
      }
      break;
    case "input": {
      if (!t.term.includes("?")) fail(skill, level, "kein ? im Term", t);
      if (t.answer < 0 || !Number.isInteger(t.answer)) fail(skill, level, "Antwort keine natürliche Zahl", t);
      const sol = solveTerm(t.term);
      if (sol.length && !sol.includes(t.answer)) fail(skill, level, `Term ergibt ${sol}`, t);
      break;
    }
    case "tens-ones":
      if (t.target < 1 || t.target > 99) fail(skill, level, "Ziel außerhalb 1–99", t);
      break;
    case "number-line":
      if ((t.target - t.from) % t.step !== 0 || t.target <= t.from || t.target >= t.to) fail(skill, level, "Ziel nicht auf einem inneren Strich", t);
      if ((t.to - t.from) / t.step > 10) fail(skill, level, "zu viele Striche", t);
      break;
    case "wall": {
      const nulls = t.rows.flat().filter((n) => n === null).length;
      if (nulls !== 1) fail(skill, level, `${nulls} Lücken`, t);
      const full = t.rows.map((r) => r.map((n) => (n === null ? t.answer : n)));
      for (let r = 0; r < full.length - 1; r++)
        full[r].forEach((n, c) => {
          if (n !== full[r + 1][c] + full[r + 1][c + 1]) fail(skill, level, "Mauer rechnet nicht", t);
        });
      if (t.answer < 0) fail(skill, level, "negative Lücke", t);
      break;
    }
    case "compare": {
      const val = (s: string) => Function(`return ${s.replace(/−/g, "-")}`)() as number;
      const l = val(t.left);
      const r = val(t.right);
      const sym = l < r ? "<" : l > r ? ">" : "=";
      if (sym !== t.answer) fail(skill, level, "Vergleich falsch", t);
      break;
    }
  }
}

for (const skill of Object.values(SKILLS)) {
  formats.set(skill.id, new Set());
  for (const level of [1, 2, 3, 4, 5] as Level[]) {
    for (let i = 0; i < RUNS; i++) {
      let t: TaskDraft;
      try {
        t = skill.gen({ level, avoid: [] });
      } catch (e) {
        errors.push(`${skill.id} L${level}: wirft ${(e as Error).message}`);
        break;
      }
      formats.get(skill.id)!.add(t.format);
      check(skill.id, level, t);
    }
  }
}

for (const [id, f] of formats) console.log(`${id.padEnd(16)} ${[...f].join(", ")}`);
if (errors.length) {
  console.error(`\n${errors.length} Fehler:\n` + errors.join("\n"));
  process.exit(1);
}
console.log(`\nOK — ${Object.keys(SKILLS).length} Kompetenzen × 5 Stufen × ${RUNS} Aufgaben.`);
