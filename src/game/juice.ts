import { pick } from "./random";
import type { JuiceTask, Level } from "./types";

// All volumes count half litres. The two rectangular vessels have the same depth.
export const vesselSize = {
  narrow: { width: 48, stepHeight: 24 },
  wide: { width: 72, stepHeight: 16 },
};
export type Vessel = keyof typeof vesselSize;
export const otherVessel = (v: Vessel): Vessel => v === "narrow" ? "wide" : "narrow";
export function litres(halves: number) {
  if (halves === 1) return "½ Liter";
  return `${Math.floor(halves / 2)}${halves % 2 ? "½" : ""} Liter`;
}
export function poured(steps: number[]) { return steps.reduce((sum, n) => sum + n, 0); }
export function addMeasure(steps: number[], measure: 1 | 2, capacity: number) {
  return poured(steps) + measure <= capacity ? [...steps, measure] : steps;
}
export function checkTransfer(task: Pick<JuiceTask, "target" | "source">, amount: number | null, higher: string) {
  if (amount !== task.target) return "Es läuft nichts aus. Überlege, wie viel Saft vor dem Umfüllen im ersten Gefäß ist.";
  if (higher !== (task.source === "narrow" ? "before" : "after"))
    return "Beide Gefäße sind gleich tief. Im schmaleren Gefäß verteilt sich der Saft auf weniger Platz am Boden.";
  return null;
}
export function juice(level: Level): Omit<JuiceTask, "id" | "level" | "skillId"> {
  const target = pick(level === 1 ? [2, 4] : level === 2 ? [2, 3, 4] : level === 3 ? [3, 4, 5] : [4, 5, 6, 7]);
  const capacity = level <= 2 ? 4 : level === 3 ? 6 : 8;
  const source = pick(["narrow", "wide"] as const);
  return { format: "juice", target, capacity, source, question: `Fülle genau ${litres(target)} Saft ab.`,
    hint: "Zwei halbe Liter ergeben einen ganzen Liter. Du kannst die letzte Portion zurücknehmen.",
    solution: `Nach dem Umfüllen sind es wieder ${litres(target)}. Im schmalen Gefäß steht derselbe Saft höher.` };
}
