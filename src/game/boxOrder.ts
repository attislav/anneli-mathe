import { pick, shuffle } from "./random";
import type { BoxOrderTask, Level } from "./types";

export const boxes = ["A", "B", "C"] as const;
export type Box = typeof boxes[number];
export type Pair = [Box, Box];
export type Observation = { left: Box; right: Box; heavier: Box };
export type Decision = "enough" | Pair;
type Scenario = "chain" | "shared-heavy" | "shared-light";
const samePair = (first: Pair, second: Pair) =>
  (first[0] === second[0] && first[1] === second[1]) || (first[0] === second[1] && first[1] === second[0]);

export function weigh(order: Box[], pair: Pair): Observation {
  const [left, right] = pair;
  return { left, right, heavier: order.indexOf(left) > order.indexOf(right) ? left : right };
}
export function lighter(observation: Observation): Box {
  return observation.heavier === observation.left ? observation.right : observation.left;
}
export function evidence(order: Box[], scenario: Scenario): Pair[] {
  const [light, middle, heavy] = order;
  if (scenario === "shared-heavy") return [[light, heavy], [middle, heavy]];
  if (scenario === "shared-light") return [[light, middle], [light, heavy]];
  return [[light, middle], [middle, heavy]];
}
export function neededPair(observations: Observation[]): Pair | null {
  const [first, second] = observations;
  if (first.heavier === second.heavier) return [lighter(first), lighter(second)];
  if (lighter(first) === lighter(second)) return [first.heavier, second.heavier];
  return null;
}
export function decisionHint(observations: Observation[], decision: Decision) {
  const needed = neededPair(observations);
  if (!needed) return decision === "enough" ? null : "Schau, ob du schon eine Kette von leicht bis schwer bilden kannst.";
  if (decision === "enough") {
    const relation = observations[0].heavier === observations[1].heavier ? "leichter" : "schwerer";
    return "Zwei Kisten sind beide "+relation+" als die dritte. Welche von diesen beiden ist leichter?";
  }
  return samePair(needed, decision) ? null : "Diese beiden Kisten hast du schon verglichen. Für welches Paar fehlt ein Vergleich?";
}
export function rankingHint(order: Box[], proposed: Box[], proof: number[], observations: Observation[]) {
  if (proposed.length !== 3 || order.some((box, index) => proposed[index] !== box))
    return "Beginne mit der leichtesten Kiste. Lies dann ab, welche als Nächstes kommt.";
  const steps: Pair[] = [[order[0], order[1]], [order[1], order[2]]];
  const justified = proof.length === 2 && steps.every(pair => proof.some(index => {
    const observation = observations[index];
    return observation && samePair(pair, [observation.left, observation.right]);
  }));
  return justified ? null : "Suche den Vergleich zwischen der ersten und zweiten Kiste und den zwischen der zweiten und dritten.";
}
export function boxOrder(level: Level): Omit<BoxOrderTask, "id" | "skillId" | "level"> {
  const order = shuffle(boxes);
  const scenarios: Scenario[] = level === 1 ? ["chain"] : level === 2 ? ["chain", "shared-heavy"] : ["chain", "shared-heavy", "shared-light"];
  const pairs = evidence(order, pick(scenarios));
  const observations = (level >= 3 ? shuffle(pairs) : pairs).map(([left, right]) =>
    weigh(order, pick([true, false]) ? [left, right] : [right, left]));
  const missing = neededPair(observations);
  return { format: "box-order", order, observations, question: "Welche Kiste ist leichter?",
    hint: "Die schwere Schale hängt tiefer. Vergleiche die Buchstaben auf den beiden Waagen.",
    solution: (missing ? "Ein Vergleich zwischen "+missing[0]+" und "+missing[1]+" hat noch gefehlt. " : "Die beiden ersten Wägungen reichen aus. ")+
      order[0]+" ist leichter als "+order[1]+". "+order[1]+" ist leichter als "+order[2]+". Die Reihenfolge ist "+order.join(" → ")+"." };
}
