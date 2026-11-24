import { randInt } from "./random";
import type { Level, SplitAxis, SplitTask } from "./types";

type Field = Pick<SplitTask, "rows" | "cols" | "axis">;
export type SplitEntry = { axis: SplitAxis; line: number | null; first: string; second: string; total: string };
export function newSplit(axis: SplitAxis, line: number | null = null): SplitEntry {
  return { axis, line, first: "", second: "", total: "" };
}
export function parts(field: Field, axis: SplitAxis, line: number | null) {
  if (line === null || !Number.isInteger(line) || line < 1 || line >= field[axis] || field.axis !== "either" && axis !== field.axis) return null;
  const first = axis === "rows" ? [line, field.cols] : [field.rows, line];
  const second = axis === "rows" ? [field.rows - line, field.cols] : [field.rows, field.cols - line];
  return [first, second].map(([rows, cols]) => ({ rows, cols, value: rows * cols }));
}
export function checkSplit(task: Field, entry: SplitEntry) {
  const fields = parts(task, entry.axis, entry.line);
  if (!fields) return { correct: false, hint: "Wähle eine Trennlinie zwischen zwei Reihen oder Spalten." };
  const labels = entry.axis === "rows" ? ["oben", "unten"] : ["links", "rechts"];
  for (const [i, value] of [entry.first, entry.second].entries()) {
    if (!/^\d+$/.test(value) || Number(value) !== fields[i].value) return { correct: false,
      hint: `Schau auf den Teil ${labels[i]}. Zähle seine Reihen und die Punkte in jeder Reihe. Multipliziere die beiden Zahlen.` };
  }
  if (!/^\d+$/.test(entry.total) || Number(entry.total) !== task.rows * task.cols)
    return { correct: false, hint: "Beide Teilfelder stimmen. Zähle ihre Ergebnisse zusammen." };
  return { correct: true };
}

export function splitLimits(level: Level) {
  return { minRows: level < 3 ? 3 : 4, maxRows: [4, 5, 6, 8, 10][level - 1],
    minCols: level === 1 ? 2 : level === 2 ? 3 : 4, maxCols: [4, 5, 7, 8, 10][level - 1] };
}

export function splitArray(level: Level): Omit<SplitTask, "id" | "level" | "skillId"> {
  const limits = splitLimits(level);
  const rows = randInt(limits.minRows, limits.maxRows);
  const cols = randInt(limits.minCols, limits.maxCols);
  return { rows, cols, axis: level === 1 ? "rows" : level === 2 ? "cols" : "either", format: "split-array",
    question: "Wie kannst du das Mal-Feld zerlegen?", hint: "Teile das Feld so, dass du die beiden kleinen Malaufgaben gut rechnen kannst.",
    solution: `Alle Punkte zusammen: ${rows} · ${cols} = ${rows * cols}.` };
}
