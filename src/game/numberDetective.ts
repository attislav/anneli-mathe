import { pick, randInt, shuffle } from "./random";
import type { DetectiveTask, Level, NumberClue } from "./types";

export function fitsClue(n: number, clue: NumberClue) {
  if (clue.kind === "range") return n >= clue.lo && n <= clue.hi;
  if (clue.kind === "ends") return clue.digits.includes(n % 10);
  return (n % 2 === 0) === clue.even;
}
export function clueText(clue: NumberClue) {
  if (clue.kind === "range") return `Die Zahl liegt im Bereich ${clue.lo} bis ${clue.hi}.`;
  if (clue.kind === "ends") return `Die Zahl endet auf ${clue.digits.join(" oder ")}.`;
  return `Die Zahl ist ${clue.even ? "gerade" : "ungerade"}.`;
}
export function checkMarking(remaining: number[], clue: NumberClue, marked: number[]) {
  const keep = remaining.filter(n => fitsClue(n, clue));
  return keep.length === marked.length && keep.every(n => marked.includes(n));
}
export function numberDetective(level: Level): Omit<DetectiveTask, "id" | "skillId" | "level"> {
  const rows = level <= 2 ? 2 : 3;
  const start = 1 + 10 * randInt(0, 10 - rows) + randInt(0, 6);
  const numbers = Array.from({ length: 4 * rows }, (_, i) => start + 10 * Math.floor(i / 4) + i % 4);
  const row = randInt(0, rows - 1), col = randInt(0, 3);
  const secret = numbers[4 * row + col], lo = numbers[4 * row];
  const clues: NumberClue[] = [{ kind: "range", lo, hi: lo + 3 }];
  if (level <= 2) clues.push({ kind: "ends", digits: [secret % 10] });
  else {
    // Two adjacent columns always have opposite parity, including the 9/0 boundary.
    const pair = lo + 2 * Math.floor(col / 2);
    clues.push({ kind: "ends", digits: [pair % 10, (pair + 1) % 10] }, { kind: "parity", even: secret % 2 === 0 });
  }
  const excluded = pick(numbers.filter(n => clues.filter(c => !fitsClue(n, c)).length === (level >= 4 ? 2 : 1)));
  const reason = clues.find(c => !fitsClue(excluded, c))!;
  return { format: "number-detective", numbers, clues: shuffle(clues), excluded,
    question: "Welche Geheimzahl passt zu allen Hinweisen?",
    hint: "Lies einen Hinweis. Behalte von den übrigen Zahlen alle, zu denen er passt.",
    solution: `Nur die ${secret} passt zu allen Hinweisen. Zur ${excluded} passt dieser Hinweis nicht: „${clueText(reason)}“` };
}
