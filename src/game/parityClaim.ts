import { pick } from "./random";
import type { Level, PairRule, ParityTask } from "./types";

type Claim = Pick<ParityTask, "rule" | "evenSum" | "limit">;
export type Pair = [number | null, number | null];
export const premises: Record<PairRule, string> = {
  even: "Beide Zahlen sind gerade.", odd: "Beide Zahlen sind ungerade.", mixed: "Eine Zahl ist gerade, die andere ungerade.",
  any: "Du darfst zwei beliebige Zahlen nehmen.", "one-even": "Mindestens eine Zahl ist gerade.", "one-odd": "Mindestens eine Zahl ist ungerade.",
};
export const reasons = {
  even: "Beide Zahlen bestehen aus ganzen Plättchenpaaren. Zusammen bleibt kein Plättchen übrig.",
  odd: "Bei jeder Zahl bleibt ein Plättchen übrig. Die beiden einzelnen Plättchen bilden zusammen ein neues Paar.",
  mixed: "Bei einer Zahl bleibt ein Plättchen übrig, bei der anderen keines. Zusammen bleibt genau eines übrig.",
};
export function allowedPair({ rule, limit }: Claim, pair: Pair): pair is [number, number] {
  const [a, b] = pair;
  if (a === null || b === null || !pair.every(n => Number.isInteger(n) && n! >= 1 && n! <= limit)) return false;
  const odds = a % 2 + b % 2;
  switch (rule) {
    case "even": return odds === 0;
    case "odd": return odds === 2;
    case "mixed": return odds === 1;
    case "one-even": return odds < 2;
    case "one-odd": return odds > 0;
    case "any": return true;
  }
}
export function verdict({ rule, evenSum }: Claim) {
  if (rule === "any" || rule === "one-even" || rule === "one-odd") return "manchmal";
  return (rule !== "mixed") === evenSum ? "immer" : "nie";
}
export function checkClaim(claim: Claim, choice: string, first: Pair, second: Pair, reason: string) {
  const correct = verdict(claim);
  if (choice !== correct) return "Probiere weitere erlaubte Zahlenpaare. Wann stimmt die Aussage?";
  if (!allowedPair(claim, first) || (choice === "manchmal" && !allowedPair(claim, second))) return `Prüfe deine Zahlenpaare: ${premises[claim.rule]}`;
  if (choice === "manchmal") {
    if ((first[0] + first[1]) % 2 === (second[0]! + second[1]!) % 2)
      return "Suche ein Paar, bei dem die Aussage stimmt, und eins, bei dem sie nicht stimmt.";
  } else if (reason !== claim.rule) return "Eine Rechnung zeigt nur ein Beispiel. Was passiert bei allen erlaubten Zahlen mit den einzelnen Plättchen?";
  return null;
}
export function parityClaim(level: Level): Omit<ParityTask, "id" | "level" | "skillId"> {
  const simple: PairRule[] = ["even", "odd", "any"];
  const rule = pick(level <= 2 ? simple : [...simple, "mixed", "one-even", "one-odd"] as PairRule[]);
  const evenSum = pick([true, false]), limit = level === 1 ? 4 : level <= 3 ? 6 : 10;
  const claim = { rule, evenSum, limit };
  const result = verdict(claim);
  const explanation = rule in reasons ? reasons[rule as keyof typeof reasons] :
    rule === "one-odd" ? "1 + 1 ist gerade, 1 + 2 ist ungerade." : "2 + 2 ist gerade, 2 + 1 ist ungerade.";
  return { ...claim, format: "parity-claim", question: `${premises[rule]} Die Summe ist ${evenSum ? "gerade" : "ungerade"}. Stimmt das immer, manchmal oder nie?`,
    hint: "Lege die Plättchen jeder Zahl als Paare. Schau, welche Einzelplättchen beim Zusammenlegen übrig bleiben.",
    solution: `Die Aussage stimmt ${result}. ${explanation}` };
}
