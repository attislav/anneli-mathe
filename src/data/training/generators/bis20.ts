// Modul 2: Plus und Minus bis 20 OHNE Zehnerübergang.
//
// Trick: „Die Zehn bleibt stehen" — nur die Einer werden gerechnet.
// Bewusst kein Übergang: der kommt erst in Modul 3.

import type { Level, TrainingTask } from "../types";
import { pickOne, randInt, taskId } from "../types";

export function generateBis20(level: Level = "normal"): TrainingTask {
  const form = pickForm(level);

  switch (form) {
    case "plus": {
      // 13 + 5 — Einer bleiben unter 10
      const ones = randInt(1, 8);
      const b = randInt(1, 9 - ones);
      const a = 10 + ones;
      return make(`${a} + ${b}`, a + b, level, {
        hint: `Die Zehn bleibt stehen. Rechne nur ${ones} + ${b} = ${ones + b}.`,
        solution: `Die Zehn bleibt stehen: ${ones} + ${b} = ${ones + b}. Also ${a} + ${b} = ${a + b}.`,
      });
    }
    case "minus": {
      // 18 − 5
      const ones = randInt(2, 9);
      const a = 10 + ones;
      const b = randInt(1, ones);
      return make(`${a} − ${b}`, a - b, level, {
        hint: `Die Zehn bleibt stehen. Rechne nur ${ones} − ${b} = ${ones - b}.`,
        solution: `Die Zehn bleibt stehen: ${ones} − ${b} = ${ones - b}. Also ${a} − ${b} = ${a - b}.`,
      });
    }
    case "plus-ten": {
      // 7 + 10 / 10 + 7
      const n = randInt(2, 9);
      const flipped = Math.random() < 0.5;
      return make(flipped ? `10 + ${n}` : `${n} + 10`, 10 + n, level, {
        hint: `Zehn dazu heißt: die Einer bleiben gleich, vorne kommt die 1 hin.`,
        solution: `${n} und eine Zehn — das ist ${10 + n}.`,
      });
    }
    case "minus-ten": {
      // 16 − 10
      const n = randInt(1, 9);
      return make(`${10 + n} − 10`, n, level, {
        hint: `Nimm die ganze Zehn weg — dann bleiben nur die Einer übrig.`,
        solution: `${10 + n} − 10 = ${n}.`,
      });
    }
    case "gap": {
      // 12 + ? = 17
      const ones = randInt(1, 7);
      const a = 10 + ones;
      const b = randInt(1, 9 - ones);
      return make(`${a} + ? = ${a + b}`, b, level, {
        hint: `Von ${ones} bis ${ones + b} fehlt: ${b}. Die Zehn ändert sich nicht.`,
        solution: `${a} + ${b} = ${a + b}.`,
      });
    }
    case "diff-to-ten": {
      // 17 − ? = 10  (Rückweg zur glatten Zehn — bereitet Modul 3 vor)
      const ones = randInt(1, 9);
      return make(`${10 + ones} − ? = 10`, ones, level, {
        hint: `Wie viele Einer musst du wegnehmen, damit nur noch die glatte 10 übrig ist?`,
        solution: `${10 + ones} − ${ones} = 10.`,
      });
    }
  }
}

type Form = "plus" | "minus" | "plus-ten" | "minus-ten" | "gap" | "diff-to-ten";

function pickForm(level: Level): Form {
  if (level === "easy") return pickOne<Form>(["plus-ten", "minus-ten", "plus", "minus"]);
  if (level === "hard") return pickOne<Form>(["gap", "gap", "diff-to-ten", "plus", "minus"]);
  return pickOne<Form>(["plus", "plus", "minus", "minus", "plus-ten", "gap", "diff-to-ten"]);
}

function make(
  prompt: string,
  correctAnswer: number,
  level: Level,
  texts: { hint: string; solution: string }
): TrainingTask {
  return {
    id: taskId("b20"),
    moduleId: "bis20",
    prompt,
    correctAnswer,
    level,
    ...texts,
  };
}
