import { pick, randInt } from "./random";
import type { Level, TwoWaysTask } from "./types";

type Problem = Pick<TwoWaysTask, "a" | "b" | "minus" | "roundFirst">;
export type Method = "steps" | "round";
export const methodNames = { steps: "Schrittweise", round: "Runde Hilfsaufgabe" };
export const freshWay = (method: Method) => ({ method, middle: "", sign: "", amount: "", result: "" });
export function calculation(p: Problem, method: Method) {
  const op = p.minus ? "−" : "+";
  const result = p.a + (p.minus ? -p.b : p.b);
  let left = p.a, right = Math.floor(p.b / 10) * 10;
  if (method === "round") {
    left = p.roundFirst ? Math.round(p.a / 10) * 10 : p.a;
    right = p.roundFirst ? p.b : Math.round(p.b / 10) * 10;
  }
  const middle = left + (p.minus ? -right : right), delta = result - middle;
  return { term: `${left} ${op} ${right}`, middle, result, sign: delta > 0 ? "+" : "−", amount: Math.abs(delta) };
}
export function checkWay(p: Problem, entry: ReturnType<typeof freshWay>) {
  const answer = calculation(p, entry.method);
  const matches = (v: string, n: number) => /^\d+$/.test(v) && Number(v) === n;
  if (!matches(entry.middle, answer.middle)) return `Rechne zuerst ${answer.term}. Welches Zwischenergebnis erhältst du?`;
  if (entry.sign !== answer.sign || !matches(entry.amount, answer.amount)) return entry.method === "steps" ?
    "Die Zehner sind geschafft. Welche Einer musst du noch dazuzählen oder abziehen?" :
    "Vergleiche die Hilfsaufgabe mit dem Original. Ist ihr Ergebnis zu groß oder zu klein? Gleiche den Unterschied aus.";
  if (!matches(entry.result, answer.result)) return "Wende deinen letzten Schritt auf das Zwischenergebnis an.";
  return null;
}
export function twoWays(level: Level): Omit<TwoWaysTask, "id" | "level" | "skillId"> {
  const minus = level >= 3 && (level === 3 || pick([true, false]));
  const near = level === 1 || level === 3 ? 9 : level === 2 ? pick([1,9]) : pick([1,2,8,9]);
  const roundFirst = !minus || near < 5;
  const a = randInt(minus ? 5 : 2, minus ? 8 : 5) * 10 + (roundFirst ? near : randInt(2,7));
  const b = randInt(1, 3) * 10 + (roundFirst ? randInt(2,7) : near);
  const p = { a, b, minus, roundFirst };
  const result = calculation(p, "steps").result;
  return { ...p, format: "two-ways", question: `Wie rechnest du ${a} ${minus ? "−" : "+"} ${b}?`,
    hint: "Wähle einen Weg und rechne zuerst bis zum Zwischenergebnis.",
    solution: `Beide Wege führen zum Ergebnis ${result}.` };
}
