import { chance, pick, randInt, shuffle } from "./random";
import type { Level, TaskDraft } from "./types";

export function numberPairs(target: number, operation: "+" | "·", stride = 1): TaskDraft {
  const pairs: number[][] = [];
  for (let a = stride; a < target; a += stride) {
    const b = operation === "+" ? target - a : target / a;
    if (a < b && Number.isInteger(b) && (operation === "+" || b <= 10)) pairs.push([a, b]);
  }
  const examples = shuffle(pairs).slice(0, 3);
  const cards = examples.flat();
  if (operation === "·") {
    const other = Array.from({ length: 9 }, (_, i) => i + 2).filter(n => !cards.includes(n) && target % n !== 0);
    cards.push(...shuffle(other).slice(0, 2));
  }
  const solutions = examples.map(([a, b]) => `${a} ${operation} ${b} = ${target}`);
  return { format: "number-pairs", operation, target, cards: shuffle(cards),
    question: `Finde zwei verschiedene ${operation === "+" ? "Plusaufgaben" : "Malaufgaben"} mit dem Ergebnis ${target}.`,
    hint: operation === "+" ? `Wähle eine Zahl. Wie viel fehlt von ihr bis ${target}?` : `Wähle eine Zahl. Zähle in ihrer Reihe bis ${target}. Wie viele Schritte sind es?`,
    solution: `${solutions.slice(0, 2).join(". ")}.` };
}

export function sequenceRule(level: Level): TaskDraft {
  const alternating = level >= 4 && chance(0.65);
  const size = pick(level <= 2 ? [1, 2] : [2, 3, 5]);
  const sign = level >= 3 && chance(0.5) ? -1 : 1;
  const first = sign * size;
  const second = alternating ? first + sign : first;
  const start = sign < 0 ? randInt(40, 85) : randInt(1, level <= 2 ? 9 : 40);
  const numbers = [start];
  for (let i = 0; i < 6; i++) numbers.push(numbers[i] + (i % 2 === 0 ? first : second));
  const jump = (n: number) => `${n > 0 ? "+" : "−"}${Math.abs(n)}`;
  const rule = alternating ? `Abwechselnd ${jump(first)}, ${jump(second)}` : `Immer ${jump(first)}`;
  const other = alternating ? `Immer ${jump(first)}` : `Immer ${jump(first + sign)}`;
  const missing = randInt(3, 5);
  const previous = numbers[missing - 1];
  return { format: "sequence-rule", numbers, missing, rule, options: shuffle([rule, other]),
    question: "Welche Regel passt zur Zahlenreihe?",
    hint: `Vergleiche die ersten beiden Sprünge: von ${start} bis ${numbers[1]} und von ${numbers[1]} bis ${numbers[2]}.`,
    solution: `${rule}. Nach ${previous} kommt ${numbers[missing]}, danach ${numbers[missing + 1]}.` };
}
