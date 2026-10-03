// Welt 4 · Einmaleins-Zirkus — Malnehmen verstehen und üben.
//
// Malzeichen ist der Mittelpunkt „·" wie im Schulbuch. Punktefelder zeigen,
// was Malnehmen IST: Reihen mal Spalten — bevor es ans Auswendigwissen geht.

import type { TaskDraft } from "./types";
import { chance, numberOptions, pick, randInt, shuffle } from "./random";
import { chooseFormat, numeric, type GenCtx, type Skill, type Texts } from "./genkit";

/** Rechenaufgabe mit Punktefeld darüber. */
function withDots(ctx: GenCtx, term: string, answer: number, t: Texts, rows: number, cols: number): TaskDraft {
  const format = chooseFormat(ctx, ["choice", "input"]);
  const question = t.question ?? "Wie viel ist das?";
  const visual = { kind: "dots" as const, rows, cols };
  if (format === "choice") {
    return { format: "choice", question, term, visual, options: numberOptions(answer, 0, 100), answer: String(answer), hint: t.hint, solution: t.solution };
  }
  return { format: "input", question, term, visual, answer, hint: t.hint, solution: t.solution };
}

const repeat = (n: number, times: number) => Array.from({ length: times }, () => n).join(" + ");

/** Tipp über die nächste Kernaufgabe (·2, ·5, ·10). */
function neighbourHint(a: number, b: number): string {
  if (a === 1 || a === 2 || a === 5 || a === 10) return `Das ist eine Kernaufgabe: ${a} mal die ${b}.`;
  if (a <= 3) return `Rechne ${a - 1} · ${b} = ${(a - 1) * b}, dann noch einmal ${b} dazu.`;
  if (a === 4) return `Verdopple 2 · ${b} = ${2 * b}: das Doppelte ist ${4 * b}.`;
  if (a <= 7) return `Rechne erst 5 · ${b} = ${5 * b}, dann noch ${a - 5}-mal ${b} dazu.`;
  return `Rechne erst 10 · ${b} = ${10 * b}, dann ${10 - a}-mal ${b} weg.`;
}

const malVerstehen: Skill = {
  id: "malVerstehen",
  title: "Malnehmen verstehen",
  world: "zirkus",
  gen: (ctx) => {
    const { level } = ctx;
    const rows = randInt(2, level <= 2 ? 5 : 6);
    const cols = randInt(2, level <= 2 ? 5 : 8);
    const product = rows * cols;
    if (level === 1) {
      return withDots(ctx, `${repeat(cols, rows)} = ?`, product, {
        question: "Wie viele Punkte sind es?",
        hint: `${rows} Reihen mit je ${cols} Punkten. Zähl in ${cols}er-Schritten.`,
        solution: `${repeat(cols, rows)} = ${product}.`,
      }, rows, cols);
    }
    if (level === 3) {
      const correct = `${rows} · ${cols}`;
      const wrong = [...new Set([`${cols} + ${rows}`, `${rows} + ${cols}`, `${rows} · ${rows}`, `${cols + 1} · ${rows}`])].filter((w) => w !== correct && w !== `${cols} · ${rows}`).slice(0, 3);
      return {
        format: "choice",
        question: "Welche Malaufgabe passt?",
        term: repeat(cols, rows),
        options: shuffle([correct, ...wrong]),
        answer: correct,
        hint: `Wie oft steht die ${cols} da? So oft nimmst du sie mal.`,
        solution: `${rows}-mal die ${cols}: ${correct} = ${product}.`,
      };
    }
    if (level === 5) {
      return numeric(ctx, `${repeat(cols, rows)} = ? · ${cols}`, rows, {
        question: "Welche Zahl fehlt?",
        hint: `Zähl, wie oft die ${cols} dasteht.`,
        solution: `Die ${cols} steht ${rows}-mal da: ${rows} · ${cols}.`,
      });
    }
    return withDots(ctx, `${rows} · ${cols} = ?`, product, {
      hint: `${rows} Reihen mit je ${cols} Punkten: ${repeat(cols, rows)}.`,
      solution: `${rows} · ${cols} = ${product}.`,
    }, rows, cols);
  },
};

const kernaufgaben: Skill = {
  id: "kernaufgaben",
  title: "Kernaufgaben",
  world: "zirkus",
  trick: {
    title: "Die Kernaufgaben",
    example: "1 · 2 · 5 · 10",
    steps: ["Mal 1: die Zahl bleibt, wie sie ist.", "Mal 2: verdoppeln.", "Mal 10: eine Null anhängen.", "Mal 5: die Hälfte von mal 10."],
  },
  gen: (ctx) => {
    const { level } = ctx;
    const k = level === 1 ? pick([2, 10]) : level === 2 ? 5 : pick([1, 2, 5, 10]);
    const n = randInt(1, 10);
    const [a, b] = chance(0.5) ? [n, k] : [k, n];
    const p = a * b;
    const hint = k === 10 ? `Mal 10: hänge an die ${n} eine Null an.` : k === 5 ? `Mal 5 ist die Hälfte von mal 10: ${n} · 10 = ${n * 10}, die Hälfte ist ${p}.` : k === 2 ? `Mal 2 heißt verdoppeln: ${n} + ${n}.` : `Mal 1: die Zahl bleibt gleich.`;
    if (level >= 4) {
      return numeric(ctx, `? · ${k} = ${n * k}`, n, { question: "Welche Zahl fehlt?", hint: `Wie oft passt die ${k} in ${n * k}? Zähl in ${k}er-Schritten.`, solution: `${n} · ${k} = ${n * k}.` });
    }
    return numeric(ctx, `${a} · ${b} = ?`, p, { hint, solution: `${a} · ${b} = ${p}.` });
  },
};

const malReihen: Skill = {
  id: "malReihen",
  title: "Einmaleins-Reihen",
  world: "zirkus",
  trick: {
    title: "Die Nachbaraufgabe",
    example: "6 · 7",
    steps: ["6 · 7 kennst du nicht? Dann such dir eine leichte Nachbarin.", "5 · 7 = 35 — das ist die Hälfte von 10 · 7.", "6 · 7 ist einmal 7 mehr: 35 + 7 = 42."],
  },
  gen: (ctx) => {
    const { level } = ctx;
    const row = level === 1 ? pick([3, 4]) : level === 2 ? pick([3, 4]) : level === 3 ? pick([6, 7]) : level === 4 ? pick([8, 9]) : pick([3, 4, 6, 7, 8, 9]);
    const n = level === 1 ? randInt(1, 5) : randInt(2, 10);
    const [a, b] = [n, row];
    if (level === 5 && chance(0.4)) {
      return numeric(ctx, `? · ${row} = ${n * row}`, n, { question: "Welche Zahl fehlt?", hint: `Geh die ${row}er-Reihe entlang, bis du bei ${n * row} bist.`, solution: `${n} · ${row} = ${n * row}.` });
    }
    return numeric(ctx, `${a} · ${b} = ?`, a * b, { hint: neighbourHint(a, b), solution: `${a} · ${b} = ${a * b}.` });
  },
};

const tauschen: Skill = {
  id: "tauschen",
  title: "Tauschen & Quadrate",
  world: "zirkus",
  gen: (ctx) => {
    const { level } = ctx;
    if (level <= 2) {
      const a = randInt(2, 9);
      let b = randInt(2, 9);
      if (a === b) b = b === 9 ? 8 : b + 1;
      if (level === 1) return numeric(ctx, `${a} · ${b} = ${b} · ?`, a, { question: "Welche Zahl fehlt?", hint: "Beim Malnehmen darfst du die Zahlen tauschen — das Ergebnis bleibt gleich.", solution: `${a} · ${b} = ${b} · ${a} = ${a * b}.` });
      return withDots(ctx, `${b} · ${a} = ?`, a * b, { hint: `Tausch die Aufgabe, wenn's leichter ist: ${a} · ${b} = ${b} · ${a}.`, solution: `${b} · ${a} = ${a * b}.` }, a, b);
    }
    if (level <= 4) {
      const n = level === 3 ? randInt(2, 5) : randInt(6, 10);
      return withDots(ctx, `${n} · ${n} = ?`, n * n, { question: "Eine Quadrat-Aufgabe!", hint: neighbourHint(n, n), solution: `${n} · ${n} = ${n * n}.` }, n, n);
    }
    const b = randInt(3, 9);
    return numeric(ctx, `4 · ${b} = ?`, 4 * b, { hint: `Erst 2 · ${b} = ${2 * b}, dann verdoppeln.`, solution: `2 · ${b} = ${2 * b}, verdoppelt ${4 * b}.` });
  },
};

/** Wer · was jeder tut · Ding (im Satz) · Ding (Nominativ) · Einzahl von „wer". */
const STORIES: [string, string, string, string, string][] = [
  ["Clowns", "jongliert mit", "Bällen", "Bälle", "Clown"],
  ["Seelöwen", "balanciert", "Ringe", "Ringe", "Seelöwe"],
  ["Pferde", "trägt", "Federn", "Federn", "Pferd"],
  ["Akrobaten", "schwingt", "Bänder", "Bänder", "Akrobat"],
  ["Bänke im Zelt", "hat", "Plätze", "Plätze", "Bank"],
];

const malSach: Skill = {
  id: "malSach",
  title: "Zirkus-Rechengeschichten",
  world: "zirkus",
  gen: (ctx) => {
    const { level } = ctx;
    const [who, verb, what, whatNom, one] = pick(STORIES);
    const a = randInt(2, level <= 2 ? 5 : 10);
    const b = level === 1 ? pick([2, 5, 10]) : randInt(2, level <= 3 ? 6 : 10);
    const p = a * b;
    if (level === 5 && chance(0.5)) {
      return numeric(ctx, `? · ${b} = ${p}`, a, {
        question: `Es gibt ${p} ${whatNom}. Zu jedem ${one === "Bank" ? "Platz auf der Bank" : one} gehören ${b}. Für wie viele reicht das?`,
        hint: `Wie oft passt die ${b} in ${p}?`,
        solution: `${a} · ${b} = ${p}.`,
      });
    }
    return numeric(ctx, `${a} · ${b} = ?`, p, {
      question: `${a} ${who}. ${one === "Bank" ? "Jede" : one === "Pferd" ? "Jedes" : "Jeder"} ${verb} ${b} ${what}. Wie viele zusammen?`,
      hint: `${a}-mal die ${b}: ${neighbourHint(a, b)}`,
      solution: `${a} · ${b} = ${p}.`,
    });
  },
};

export const ZIRKUS_SKILLS: Skill[] = [malVerstehen, kernaufgaben, malReihen, tauschen, malSach];
