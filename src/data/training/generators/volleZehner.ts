// Modul 5: Volle Zehner bis 100.
//
// Trick: „Rechne klein, häng die Null an" — 30 + 40 ist 3 + 4 in Zehnern.
// Zusätzlich: Ergänzen zur 100 und Zehnernachbarn einer beliebigen Zahl.

import type { Level, TrainingTask } from "../types";
import { pickOne, randInt, taskId } from "../types";

export function generateVolleZehner(level: Level = "normal"): TrainingTask {
  const form = pickForm(level);

  switch (form) {
    case "plus": {
      const a = randInt(1, 8);
      const b = randInt(1, (level === "easy" ? 9 : 10) - a);
      return make(`${a * 10} + ${b * 10}`, (a + b) * 10, level, {
        hint: `Denk die Nullen weg: ${a} + ${b} = ${a + b}.`,
        solution: `${a} + ${b} = ${a + b}, Null dran: ${(a + b) * 10}.`,
      });
    }
    case "minus": {
      const a = randInt(3, 10);
      const b = randInt(1, a - 1);
      return make(`${a * 10} − ${b * 10}`, (a - b) * 10, level, {
        hint: `Denk die Nullen weg: ${a} − ${b} = ${a - b}.`,
        solution: `${a} − ${b} = ${a - b}, Null dran: ${(a - b) * 10}.`,
      });
    }
    case "to-hundred": {
      const a = randInt(1, 9);
      return make(`${a * 10} + ? = 100`, (10 - a) * 10, level, {
        hint: `In Zehnern gedacht: ${a} + ? = 10. Der Zahlenfreund von ${a} ist ${10 - a}.`,
        solution: `${a * 10} + ${(10 - a) * 10} = 100.`,
      });
    }
    case "gap": {
      const a = randInt(1, 7);
      const b = randInt(1, 9 - a);
      return make(`${a * 10} + ? = ${(a + b) * 10}`, b * 10, level, {
        hint: `In Zehnern: ${a} + ? = ${a + b}. Es fehlen ${b} Zehner.`,
        solution: `${a * 10} + ${b * 10} = ${(a + b) * 10}.`,
      });
    }
    case "neighbour-down": {
      // Welcher Zehner kommt VOR 47?
      const n = randInt(11, 98);
      if (n % 10 === 0) return generateVolleZehner(level);
      const down = Math.floor(n / 10) * 10;
      return make(`Welcher Zehner liegt vor ${n}?`, down, level, {
        hint: `Schau nur auf die Zehner-Stelle von ${n} — die Einer fallen weg.`,
        solution: `Vor ${n} liegt der Zehner ${down}.`,
      });
    }
    case "neighbour-up": {
      const n = randInt(11, 98);
      if (n % 10 === 0) return generateVolleZehner(level);
      const up = (Math.floor(n / 10) + 1) * 10;
      return make(`Welcher Zehner kommt nach ${n}?`, up, level, {
        hint: `Von ${n} sind es noch ${up - n} bis zum nächsten glatten Zehner.`,
        solution: `Nach ${n} kommt der Zehner ${up}.`,
      });
    }
  }
}

type Form = "plus" | "minus" | "to-hundred" | "gap" | "neighbour-down" | "neighbour-up";

function pickForm(level: Level): Form {
  if (level === "easy") return pickOne<Form>(["plus", "plus", "minus", "neighbour-down"]);
  if (level === "hard")
    return pickOne<Form>(["to-hundred", "gap", "gap", "minus", "neighbour-up"]);
  return pickOne<Form>([
    "plus",
    "minus",
    "to-hundred",
    "gap",
    "neighbour-down",
    "neighbour-up",
  ]);
}

function make(
  prompt: string,
  correctAnswer: number,
  level: Level,
  texts: { hint: string; solution: string }
): TrainingTask {
  return {
    id: taskId("vz"),
    moduleId: "volle-zehner",
    prompt,
    correctAnswer,
    level,
    ...texts,
  };
}
