// Modul 4: Verdoppeln, Halbieren und Nachbaraufgaben.
//
// Tricks: Nachbaraufgabe (6 + 7 = 6 + 6 + 1) und stellenweises Halbieren
// (Hälfte von 48 = Hälfte von 40 + Hälfte von 8).

import type { Level, TrainingTask } from "../types";
import { pickOne, randInt, taskId } from "../types";

export function generateVerdoppeln(level: Level = "normal"): TrainingTask {
  const form = pickForm(level);

  switch (form) {
    case "double": {
      const n = level === "easy" ? randInt(2, 10) : level === "hard" ? randInt(13, 50) : randInt(6, 25);
      return make(`Das Doppelte von ${n}`, n * 2, level, {
        hint: doubleHint(n),
        solution: `${n} + ${n} = ${n * 2}.`,
      });
    }
    case "half": {
      const n =
        level === "easy" ? randInt(1, 10) * 2 : level === "hard" ? randInt(11, 49) * 2 : randInt(5, 24) * 2;
      return make(`Die Hälfte von ${n}`, n / 2, level, {
        hint: halfHint(n),
        solution: `Die Hälfte von ${n} ist ${n / 2}, denn ${n / 2} + ${n / 2} = ${n}.`,
      });
    }
    case "neighbour": {
      // 6 + 7 — Nachbaraufgabe zur Verdopplung
      const n = level === "easy" ? randInt(2, 8) : level === "hard" ? randInt(9, 24) : randInt(4, 12);
      const up = Math.random() < 0.5;
      const a = n;
      const b = up ? n + 1 : n - 1;
      return make(`${a} + ${b}`, a + b, level, {
        hint: `Denk an die Verdopplung: ${n} + ${n} = ${n * 2}. ${b} ist ${up ? "eins mehr" : "eins weniger"}.`,
        solution: `${n * 2} ${up ? "+" : "−"} 1 = ${a + b}.`,
      });
    }
    case "double-gap": {
      // Das Doppelte von ? ist 36
      const n = level === "hard" ? randInt(11, 40) : randInt(3, 15);
      return make(`Das Doppelte von ? ist ${n * 2}`, n, level, {
        hint: `Rückwärts gedacht: welche Zahl plus sich selbst ergibt ${n * 2}? Das ist die Hälfte.`,
        solution: `${n} + ${n} = ${n * 2}, also ist die gesuchte Zahl ${n}.`,
      });
    }
  }
}

type Form = "double" | "half" | "neighbour" | "double-gap";

function pickForm(level: Level): Form {
  if (level === "easy") return pickOne<Form>(["double", "double", "half", "neighbour"]);
  if (level === "hard") return pickOne<Form>(["double", "half", "neighbour", "double-gap", "double-gap"]);
  return pickOne<Form>(["double", "half", "half", "neighbour", "double-gap"]);
}

function make(
  prompt: string,
  correctAnswer: number,
  level: Level,
  texts: { hint: string; solution: string }
): TrainingTask {
  return {
    id: taskId("vd"),
    moduleId: "verdoppeln",
    prompt,
    correctAnswer,
    level,
    ...texts,
  };
}

/**
 * Verdopplungs-Tipp — je nach Zahl die passende Strategie:
 * einstellig direkt, glatte Zehner über die Null-Regel, sonst stellenweise.
 */
function doubleHint(n: number): string {
  if (n < 10) return `${n} + ${n} — zähl die Zahl einfach noch einmal dazu.`;
  if (n % 10 === 0) {
    return `Denk die Null weg: ${n / 10} + ${n / 10} = ${n / 5}. Null wieder dran: ${n * 2}.`;
  }
  const tens = Math.floor(n / 10) * 10;
  const ones = n % 10;
  return `Verdopple erst die Zehner: ${tens} + ${tens} = ${tens * 2}. Dann die Einer: ${ones} + ${ones} = ${ones * 2}.`;
}

/**
 * Halbierungs-Tipp. Bis 20 denkt man über die Verdopplung, darüber
 * stellenweise — und wenn die Zehnerzahl ungerade ist, wird so zerlegt,
 * dass beide Teile sauber halbierbar bleiben (58 → 40 und 18).
 */
function halfHint(n: number): string {
  if (n <= 20) return `Denk rückwärts: welche Zahl ergibt zusammen mit sich selbst ${n}?`;
  const tens = Math.floor(n / 10);
  if (n % 10 === 0 && tens % 2 === 0) {
    return `Denk die Null weg: die Hälfte von ${tens} ist ${tens / 2}. Null wieder dran: ${n / 2}.`;
  }
  if (tens % 2 === 0) {
    const tensPart = tens * 10;
    const ones = n % 10;
    return `Zerlege ${n} in ${tensPart} und ${ones}. Die Hälfte von ${tensPart} ist ${tensPart / 2}, die Hälfte von ${ones} ist ${ones / 2}.`;
  }
  const tensPart = (tens - 1) * 10;
  const rest = n - tensPart;
  return `Zerlege ${n} in ${tensPart} und ${rest} — so lassen sich beide Teile sauber halbieren: ${tensPart / 2} + ${rest / 2}.`;
}
