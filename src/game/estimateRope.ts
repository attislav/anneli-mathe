import { randInt } from "./random";
import type { Level, RopeTask } from "./types";

type Rope = Pick<RopeTask, "length" | "unit">;
export function estimateRope(level: Level): Omit<RopeTask, "id" | "level" | "skillId"> {
  const unit = level >= 4 ? 2 : 1;
  const units = level <= 2 ? randInt(3, 8) : randInt(6, level === 5 ? 12 : 10);
  return { format: "estimate-rope", length: unit * units, extent: unit === 2 ? 26 : 12, unit,
    question: "Wie lang ist die Schnur im Modell? Schätze zuerst.",
    hint: "Starte am linken Ende der Schnur. Lege jede neue Einheit direkt an die vorige.",
    solution: `${units} Stücke zu je ${unit} cm ergeben ${units * unit} cm.` };
}

export function wholeCm(value: string): number | null {
  return /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : null;
}

export function checkCoverage(task: Rope, starts: number[]): string | undefined {
  let end = 0;
  for (const start of [...starts].sort((a, b) => a - b)) {
    if (!Number.isInteger(start) || start < 0 || start + task.unit > task.length) return "Ein Messstück ragt über die Schnur hinaus.";
    if (start < end) return "Zwei Messstücke überlappen sich. Lege sie Kante an Kante.";
    if (start > end) return "Zwischen den Messstücken ist eine Lücke. Beginne links und schließe sie.";
    end = start + task.unit;
  }
  if (end !== task.length) return "Die Messstücke reichen noch nicht bis zum Ende der Schnur.";
}

export function checkRope(task: Rope, starts: number[], estimate: number, length: string, difference: string) {
  const issue = checkCoverage(task, starts);
  if (issue) return { correct: false, hint: issue };
  if (wholeCm(length) !== task.length) return { correct: false, hint: `Zähle deine Messstücke. Jedes ist im Modell ${task.unit} cm lang.` };
  if (wholeCm(difference) !== Math.abs(estimate - task.length))
    return { correct: false, hint: "Vergleiche deinen Tipp mit der Messung. Ziehe die kleinere Zahl von der größeren ab." };
  return { correct: true };
}
