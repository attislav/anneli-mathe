// Modul 1: Zahlenfreunde bis 10.
//
// Trick: die fünf Zehner-Paare (1+9, 2+8, 3+7, 4+6, 5+5).
// Aufgabenformen: Ergänzen zur 10, Zerlegen kleiner Zahlen, kurze Ketten.

import type { Level, TrainingTask } from "../types";
import { pickOne, randInt, taskId } from "../types";

export function generateZahlenfreunde(level: Level = "normal"): TrainingTask {
  const form = pickForm(level);

  switch (form) {
    case "to-ten": {
      // 7 + ? = 10
      const a = randInt(1, 9);
      const b = 10 - a;
      return make(`${a} + ? = 10`, b, level, {
        hint: `Von ${a} bis 10 ${b === 1 ? "fehlt noch ein Schritt" : `fehlen noch ${b} Schritte`}. Zähl an den Fingern weiter.`,
        solution: `${a} + ${b} = 10 — ${a} und ${b} sind Zahlenfreunde.`,
      });
    }
    case "ten-minus": {
      // 10 − 4 = ?
      const a = randInt(1, 9);
      return make(`10 − ${a}`, 10 - a, level, {
        hint: `Wenn du von 10 die ${a} wegnimmst, bleibt der Zahlenfreund von ${a} übrig.`,
        solution: `10 − ${a} = ${10 - a}.`,
      });
    }
    case "small-sum": {
      // 3 + 4 = ? (Summe bis 10)
      const a = randInt(1, 8);
      const b = randInt(1, 10 - a);
      return make(`${a} + ${b}`, a + b, level, {
        hint: `Fang bei ${Math.max(a, b)} an und zähl ${Math.min(a, b)} weiter.`,
        solution: `${a} + ${b} = ${a + b}.`,
      });
    }
    case "small-diff": {
      // 8 − 3 = ?
      const a = randInt(4, 10);
      const b = randInt(1, a - 1);
      return make(`${a} − ${b}`, a - b, level, {
        hint: `Geh von ${a} aus ${b} Schritte zurück.`,
        solution: `${a} − ${b} = ${a - b}.`,
      });
    }
    case "chain": {
      // 3 + 4 + 2 = ? — Ketten, bewusst so gebaut, dass zwei Summanden 10 ergeben
      const a = randInt(2, 7);
      const b = 10 - a; // a + b = 10
      const c = randInt(1, 5);
      return make(`${a} + ${b} + ${c}`, 10 + c, level, {
        hint: `${a} und ${b} sind Zahlenfreunde — zusammen 10. Dann nur noch ${c} dazu.`,
        solution: `${a} + ${b} = 10, und 10 + ${c} = ${10 + c}.`,
      });
    }
  }
}

type Form = "to-ten" | "ten-minus" | "small-sum" | "small-diff" | "chain";

function pickForm(level: Level): Form {
  if (level === "easy") return pickOne<Form>(["to-ten", "to-ten", "small-sum", "ten-minus"]);
  if (level === "hard") return pickOne<Form>(["to-ten", "ten-minus", "chain", "chain", "small-diff"]);
  return pickOne<Form>(["to-ten", "to-ten", "ten-minus", "small-sum", "small-diff"]);
}

function make(
  prompt: string,
  correctAnswer: number,
  level: Level,
  texts: { hint: string; solution: string }
): TrainingTask {
  return {
    id: taskId("zf"),
    moduleId: "zahlenfreunde",
    prompt,
    correctAnswer,
    level,
    ...texts,
  };
}
