import type { DataIcon, Level, SplitAxis, SplitTask, WriteQuestionTask } from "./types";
import { composeQuestion, questionLimit, sceneCategories, type Question } from "./writeQuestion";
import { splitLimits } from "./splitArray";

type Source = { original: number[]; previous?: number[]; level: Level };
export type StrategyCard = Source & (
  { kind: "split"; axis: SplitAxis; line: number } |
  { kind: "question"; scene: WriteQuestionTask["scene"]; operation: "sum" | "difference"; icons: DataIcon[] }
);
export function strategyKey(card: StrategyCard) {
  return card.kind === "split" ? JSON.stringify([card.kind, card.axis, card.line]) :
    JSON.stringify([card.kind, card.scene, card.operation, ...card.icons.slice(0, 2).sort()]);
}
export function strategyTitle(card: StrategyCard) {
  if (card.kind === "split") return `Mal-Feld nach ${card.axis === "rows" ? "Reihe" : "Spalte"} ${card.line} teilen`;
  const names = card.icons.slice(0, 2).map(icon => sceneCategories[card.scene].find(([id]) => id === icon)![1]);
  return `${card.scene === "fruit" ? "Obstkorb" : "Tierheim"}: ${names.join(" und ")} – ${card.operation === "sum" ? "zusammenzählen" : "vergleichen"}`;
}
export function splitCard(task: SplitTask, axis: SplitAxis, line: number): StrategyCard {
  return { kind: "split", axis, line, original: [task.rows, task.cols], level: task.level };
}
export function questionCard(task: WriteQuestionTask, question: Question): StrategyCard | null {
  if (!composeQuestion(task, question) || question.a === null || question.b === null || !question.kind) return null;
  const ids = [question.a, question.b, ...task.groups.map((_, i) => i).filter(i => i !== question.a && i !== question.b)];
  return { kind: "question", scene: task.scene, operation: question.kind, icons: ids.map(i => task.groups[i].icon),
    original: ids.map(i => task.groups[i].value), level: task.level };
}
export function normalizeCards(value: unknown): StrategyCard[] {
  if (!Array.isArray(value)) return [];
  const result = new Map<string, StrategyCard>();
  for (const c of value) {
    if (!c || !Number.isInteger(c.level) || c.level < 1 || c.level > 5) continue;
    const split = c.kind === "split";
    if (!split && (c.kind !== "question" || !["sum", "difference"].includes(c.operation) || !["fruit", "pets"].includes(c.scene))) continue;
    if (split && (!["rows", "cols"].includes(c.axis) || !Number.isInteger(c.line) || c.line < 1 || c.line > 9)) continue;
    if (split && (c.level === 1 && c.axis !== "rows" || c.level === 2 && c.axis !== "cols")) continue;
    const limits = splitLimits(c.level);
    const numbersOk = (ns: unknown) => Array.isArray(ns) && ns.length === (split ? 2 : 3) &&
      ns.every(n => Number.isInteger(n) && n >= 2 && n <= (split ? 10 : questionLimit(c.level))) &&
      (!split || (ns[0] >= limits.minRows && ns[0] <= limits.maxRows && ns[1] >= limits.minCols && ns[1] <= limits.maxCols && ns[c.axis === "rows" ? 0 : 1] > c.line));
    if (!numbersOk(c.original)) continue;
    if (!split && (!Array.isArray(c.icons) || c.icons.length !== 3 || new Set(c.icons).size !== 3 ||
      !c.icons.every((id: unknown) => sceneCategories[c.scene as "pets" | "fruit"].some(([icon]) => icon === id)))) continue;
    const card: StrategyCard = { ...c, previous: numbersOk(c.previous) ? c.previous : undefined };
    if (!result.has(strategyKey(card))) result.set(strategyKey(card), card);
  }
  return [...result.values()];
}
