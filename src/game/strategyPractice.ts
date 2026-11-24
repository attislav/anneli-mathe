import { LabSession } from "./lab";
import { pick, shuffle, uid } from "./random";
import { activeProfileId, readSave, update } from "./state";
import { strategyKey, type StrategyCard } from "./strategyCards";
import type { SplitTask, WriteQuestionTask } from "./types";
import { questionLimit, sceneCategories } from "./writeQuestion";
import { splitLimits } from "./splitArray";

export function rememberStrategy(owner: string, card: StrategyCard) {
  if (owner !== activeProfileId() || readSave().strategies.some(c => strategyKey(c) === strategyKey(card))) return;
  update(save => ({ ...save, strategies: [...save.strategies, card] }));
}
export function removeStrategy(owner: string, key: string) {
  if (owner === activeProfileId()) update(save => ({ ...save, strategies: save.strategies.filter(c => strategyKey(c) !== key) }));
}
export function strategyExercise(card: StrategyCard): { task: SplitTask | WriteQuestionTask; numbers: number[] } {
  const historic = card.previous ? [card.original, card.previous] : [card.original];
  if (card.kind === "split") {
    const candidates: number[][] = [];
    const other = card.axis === "rows" ? 1 : 0;
    const limits = splitLimits(card.level);
    for (let rows = limits.minRows; rows <= limits.maxRows; rows++) for (let cols = limits.minCols; cols <= limits.maxCols; cols++) {
      const size = [rows, cols];
      if (size[1 - other] > card.line && historic.every(h => h[other] !== size[other] && rows * cols !== h[0] * h[1])) candidates.push(size);
    }
    const distinct = candidates.filter(size => historic.every(h => Math.abs(h[other] - size[other]) >= 2));
    const [rows, cols] = pick(distinct.length ? distinct : candidates);
    return { numbers: [rows, cols], task: { id: uid(), format: "split-array", skillId: "malZerlegen", level: card.level, rows, cols,
      axis: card.axis, presetLine: card.line, question: `Nutze deinen Rechenweg: Teile nach ${card.axis === "rows" ? "Reihe" : "Spalte"} ${card.line}.`,
      hint: "Rechne die beiden Teilfelder einzeln aus.", solution: `${rows} · ${cols} = ${rows * cols}.` } };
  }
  const max = questionLimit(card.level);
  const candidates = Array.from({ length: max - 1 }, (_, i) => i + 2);
  const options = card.icons.map((_, i) => candidates.filter(n => historic.every(h => n !== h[i])));
  const value = (x: number, y: number) => card.operation === "sum" ? x + y : Math.abs(x - y);
  const pairs = options[0].flatMap(a => options[1].filter(b => historic.every(h => value(a, b) !== value(h[0], h[1]))).map(b => [a, b]));
  const numbers = [...pick(pairs), pick(options[2])];
  const groups = shuffle(card.icons.map((icon, i) => ({ icon, label: sceneCategories[card.scene].find(([id]) => id === icon)![1], value: numbers[i] })));
  const preset = { a: groups.findIndex(g => g.icon === card.icons[0]), b: groups.findIndex(g => g.icon === card.icons[1]), kind: card.operation };
  return { numbers, task: { id: uid(), format: "write-question", skillId: "sachaufgaben", level: card.level, scene: card.scene, groups, preset,
    question: "Deine Frage mit neuen Mengen", hint: "Nutze die beiden Gruppen aus deiner Frage und wähle das passende Rechenzeichen.",
    solution: "Rechne mit den neuen Mengen der beiden gewählten Gruppen." } };
}

export class StrategyRound extends LabSession {
  constructor(owner: string, readonly cardKey: string, task: SplitTask | WriteQuestionTask) {
    super(owner, 1, () => task);
  }
}
export function startStrategy(owner: string, key: string): StrategyRound | null {
  if (activeProfileId() !== owner) return null;
  const card = readSave().strategies.find(c => strategyKey(c) === key);
  if (!card) return null;
  const { numbers, task } = strategyExercise(card);
  update(save => ({ ...save, strategies: save.strategies.map(c => strategyKey(c) === key ? { ...c, previous: numbers } : c) }));
  return new StrategyRound(owner, key, task);
}
