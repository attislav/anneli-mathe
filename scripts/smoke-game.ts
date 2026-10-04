// Smoke-Test der Aufgaben-Generatoren: jede Kompetenz × jede Stufe × viele
// Würfe. Prüft, dass jede Aufgabe in sich stimmig ist (Antwort unter den
// Optionen, Lösung rechnet sich nach, Zahlenstrahl-Ziel liegt auf einem Strich …).
//
//   npm run smoke:game

import { SKILLS } from "../src/game/skills";
import type { Format, Level, TaskDraft } from "../src/game/types";
import { breakDown } from "../src/game/money";

/** „1,20 €", „2 € 5 ct", „35 ct", „3 €" → Cent. */
function cents(s: string): number {
  let m = s.match(/^(\d+),(\d\d) €$/);
  if (m) return Number(m[1]) * 100 + Number(m[2]);
  m = s.match(/^(\d+) € (\d+) ct$/);
  if (m) return Number(m[1]) * 100 + Number(m[2]);
  m = s.match(/^(\d+) €$/);
  if (m) return Number(m[1]) * 100;
  m = s.match(/^(\d+) ct$/);
  if (m) return Number(m[1]);
  return NaN;
}

/** „1 m 20 cm", „120 cm", „2 m" → cm. */
function lengthCm(s: string): number {
  let m = s.match(/^(\d+) m (\d+) cm$/);
  if (m) return Number(m[1]) * 100 + Number(m[2]);
  m = s.match(/^(\d+) m$/);
  if (m) return Number(m[1]) * 100;
  m = s.match(/^(\d+) cm$/);
  if (m) return Number(m[1]);
  return NaN;
}

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
    const expr = term.replace("?", String(x)).replace(/−/g, "-").replace(/·/g, "*").replace(/:/g, "/");
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
  const vis = "visual" in t ? t.visual : undefined;
  if (vis?.kind === "tally" || vis?.kind === "bars") {
    const vals = vis.rows.map((r) => r.value);
    if (new Set(vals).size !== vals.length || vals.some((v) => v <= 0)) fail(skill, level, "Daten doppelt oder ≤ 0", t);
    if (vis.kind === "bars" && vals.some((v) => v > vis.max || v % vis.step !== 0)) fail(skill, level, "Säule passt nicht ins Raster", t);
  }
  switch (t.format) {
    case "choice":
      if (!t.options.includes(t.answer)) fail(skill, level, "Antwort nicht unter den Optionen", t);
      if (new Set(t.options).size !== t.options.length) fail(skill, level, "doppelte Optionen", t);
      if (t.options.length < 2) fail(skill, level, "zu wenige Optionen", t);
      if (t.options.some((o) => /^-/.test(o))) fail(skill, level, "negative Option", t);
      if (t.options.some((o) => /:\d\d Uhr$/.test(o) && !/^(\d|1\d|2[0-3]):[0-5]\d Uhr$/.test(o))) fail(skill, level, "kaputte Uhrzeit", t);
      if (/Rechnung stimmt/.test(t.question)) {
        const ok = (o: string) => {
          const [l, r] = o.replace(/−/g, "-").replace(/·/g, "*").replace(/:/g, "/").split("=");
          return Function(`return (${l}) === (${r})`)() as boolean;
        };
        const odd = t.options.filter((o) => (t.question.includes("nicht") ? !ok(o) : ok(o)));
        if (odd.length !== 1 || odd[0] !== t.answer) fail(skill, level, "Fehler-Detektiv: nicht genau eine passende Rechnung", t);
      }
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
      const [l, r] = t.values ?? [val(t.left), val(t.right)];
      const sym = l < r ? "<" : l > r ? ">" : "=";
      if (sym !== t.answer) fail(skill, level, "Vergleich falsch", t);
      if (t.values && /€|ct/.test(t.left + t.right) && (cents(t.left) !== l || cents(t.right) !== r)) fail(skill, level, "Geldbetrag passt nicht zum Wert", t);
      if (t.values && /\bm\b|cm/.test(t.left + t.right) && (lengthCm(t.left) !== l || lengthCm(t.right) !== r)) fail(skill, level, "Länge passt nicht zum Wert", t);
      break;
    }
    case "money-build":
      if (t.target <= 0) fail(skill, level, "Betrag ≤ 0", t);
      if (breakDown(t.target, t.pieces).reduce((a, b) => a + b, 0) !== t.target) fail(skill, level, "Betrag nicht legbar", t);
      break;
    case "bar-build":
      if (t.rows.some((r) => r.value <= 0 || r.value > t.max || r.value % t.step !== 0)) fail(skill, level, "Säule passt nicht ins Raster", t);
      if (t.max / t.step > 12) fail(skill, level, "zu viele Kästchen", t);
      break;
    case "ruler":
      if (t.target < 1 || t.target > t.max || t.max > 20) fail(skill, level, "Lineal-Ziel ungültig", t);
      break;
    case "mirror": {
      const keys = t.cells.map(([r, c]) => `${r},${c}`);
      if (t.cells.length === 0 || new Set(keys).size !== keys.length) fail(skill, level, "Spiegel-Kästchen leer oder doppelt", t);
      if (t.cells.some(([r, c]) => r < 0 || r >= t.rows || c < 0 || c >= t.half)) fail(skill, level, "Spiegel-Kästchen außerhalb", t);
      break;
    }
    case "pattern": {
      const keys = t.options.map((o) => o.shape + o.color);
      if (new Set(keys).size !== keys.length) fail(skill, level, "doppelte Muster-Optionen", t);
      if (t.answer < 0 || t.answer >= t.options.length || t.options.length < 2) fail(skill, level, "Muster-Antwort ungültig", t);
      break;
    }
    case "clock-set":
      if (t.hour < 1 || t.hour > 12 || t.minute < 0 || t.minute > 55 || t.minute % t.step !== 0) fail(skill, level, "Uhrzeit nicht stellbar", t);
      break;
    case "share":
      if (t.total % t.plates !== 0) fail(skill, level, "nicht gerecht teilbar", t);
      if (t.plates < 2 || t.plates > 5 || t.total > 24 || t.total < t.plates) fail(skill, level, "zu viele Teller/Teile zum Legen", t);
      break;
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
