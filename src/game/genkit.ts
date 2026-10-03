// Bausteine für die Aufgaben-Generatoren: Typen, Formatwahl, Zahlenmauer.
// Getrennt von skills.ts, damit Welt-Module (z. B. skillsHafen.ts) sie
// nutzen können, ohne einen Import-Kreis zu bauen.

import type { Format, Level, TaskDraft } from "./types";
import { chance, numberOptions, pick, randInt } from "./random";

export type WorldId = "start" | "wald" | "strand" | "hafen" | "zirkus" | "baeckerei" | "schloss" | "ozean";

export type Trick = {
  title: string;
  example: string;
  steps: string[];
};

export type GenCtx = {
  level: Level;
  /** Formate, die gerade zu oft dran waren — wenn möglich vermeiden. */
  avoid: Format[];
};

export type Skill = {
  id: string;
  title: string;
  world: WorldId;
  trick?: Trick;
  gen: (ctx: GenCtx) => TaskDraft;
};

// ---------------------------------------------------------------------------
// Bausteine

export type Texts = { question?: string; hint: string; solution: string };

export function chooseFormat(ctx: GenCtx, formats: Format[]): Format {
  const allowed = formats.filter((f) => !ctx.avoid.includes(f));
  const list = allowed.length > 0 ? allowed : formats;
  // Antippen ist leichter als Eintippen: auf niedrigen Stufen öfter.
  if (list.includes("choice") && list.includes("input")) {
    const choiceShare = [0, 0.7, 0.6, 0.45, 0.35, 0.3][ctx.level];
    if (list.length === 2) return chance(choiceShare) ? "choice" : "input";
  }
  return pick(list);
}

/** Rechenaufgabe mit einer Zahl als Antwort — als Antippen oder Eintippen. */
export function numeric(ctx: GenCtx, term: string, answer: number, t: Texts, range: [number, number] = [0, 100]): TaskDraft {
  const format = chooseFormat(ctx, ["choice", "input"]);
  const question = t.question ?? "Wie viel ist das?";
  if (format === "choice") {
    return { format: "choice", question, term, options: numberOptions(answer, range[0], range[1]), answer: String(answer), hint: t.hint, solution: t.solution };
  }
  return { format: "input", question, term, answer, hint: t.hint, solution: t.solution };
}

/** Zahlenmauer aus der untersten Reihe bauen, ein Feld verstecken. */
export function wall(bottom: number[], hide: "top" | "middle" | "bottom"): { rows: (number | null)[][]; answer: number; hint: string; solution: string } {
  const full: number[][] = [bottom];
  while (full[0].length > 1) {
    const below = full[0];
    full.unshift(below.slice(1).map((n, i) => below[i] + n));
  }
  const rowIdx = hide === "top" ? 0 : hide === "bottom" ? full.length - 1 : 1;
  const colIdx = randInt(0, full[rowIdx].length - 1);
  const answer = full[rowIdx][colIdx];
  const rows = full.map((row, r) => row.map((n, c) => (r === rowIdx && c === colIdx ? null : n)));

  let hint: string;
  let solution: string;
  if (rowIdx < full.length - 1) {
    const l = full[rowIdx + 1][colIdx];
    const r = full[rowIdx + 1][colIdx + 1];
    hint = `Zwei Steine nebeneinander ergeben zusammen den Stein darüber. Rechne ${l} + ${r}.`;
    solution = `${l} + ${r} = ${answer}.`;
  } else {
    // Unterster Stein: über den Elternstein zurückrechnen.
    const useLeftParent = colIdx > 0;
    const parentCol = useLeftParent ? colIdx - 1 : colIdx;
    const parent = full[rowIdx - 1][parentCol];
    const sibling = useLeftParent ? full[rowIdx][colIdx - 1] : full[rowIdx][colIdx + 1];
    hint = `Der Stein darüber ist ${parent}. Daneben liegt schon ${sibling}. Wie viel fehlt bis ${parent}?`;
    solution = `${parent} − ${sibling} = ${answer}.`;
  }
  return { rows, answer, hint, solution };
}

export const nextTen = (n: number) => Math.floor(n / 10) * 10 + 10;
export const tensOf = (n: number) => Math.floor(n / 10) * 10;
