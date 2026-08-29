// Modul 3: Zehnerübergang bis 20.
//
// Trick: „Zwischenstopp auf der 10" — die zweite Zahl wird so zerlegt,
// dass man zuerst genau auf der 10 landet.
//
// Das ist DAS Kern-Modul für den Übergang Klasse 2. Deshalb erzeugen wir
// hier ausschließlich Aufgaben MIT Übergang (sonst wäre es Modul 2).

import type { Level, TrainingTask } from "../types";
import { pickOne, randInt, taskId } from "../types";

export function generateZehnersprung(level: Level = "normal"): TrainingTask {
  const form = pickForm(level);

  switch (form) {
    case "plus": {
      const [a, b] = plusPairWithCarry(level);
      const toTen = 10 - a;
      const rest = b - toTen;
      return make(`${a} + ${b}`, a + b, level, {
        hint: `Von ${a} bis 10 fehlen ${toTen}. Zerlege die ${b} in ${toTen} und ${rest}.`,
        solution: `${a} + ${toTen} = 10, dann 10 + ${rest} = ${a + b}.`,
      });
    }
    case "minus": {
      const [a, b] = minusPairWithBorrow(level);
      const toTen = a - 10;
      const rest = b - toTen;
      return make(`${a} − ${b}`, a - b, level, {
        hint: `Von ${a} bis 10 sind es ${toTen} zurück. Zerlege die ${b} in ${toTen} und ${rest}.`,
        solution: `${a} − ${toTen} = 10, dann 10 − ${rest} = ${a - b}.`,
      });
    }
    case "plus-gap": {
      // 8 + ? = 15
      const [a, b] = plusPairWithCarry(level);
      const toTen = 10 - a;
      return make(`${a} + ? = ${a + b}`, b, level, {
        hint: `Erst von ${a} auf 10 — das sind ${toTen}. Und von 10 auf ${a + b} noch ${a + b - 10}.`,
        solution: `${toTen} + ${a + b - 10} = ${b}. Also ${a} + ${b} = ${a + b}.`,
      });
    }
    case "minus-gap": {
      // 15 − ? = 7
      const [a, b] = minusPairWithBorrow(level);
      const toTen = a - 10;
      return make(`${a} − ? = ${a - b}`, b, level, {
        hint: `Von ${a} runter auf 10 sind ${toTen}. Von 10 runter auf ${a - b} noch ${10 - (a - b)}.`,
        solution: `${toTen} + ${10 - (a - b)} = ${b}. Also ${a} − ${b} = ${a - b}.`,
      });
    }
  }
}

/** a + b mit echtem Übergang: a, b ≤ 9, Summe 11..18. */
function plusPairWithCarry(level: Level): [number, number] {
  // easy: kleiner Rest über der 10 (z.B. 9 + 3), hard: „mittige" Aufgaben (7 + 8)
  while (true) {
    const a = randInt(level === "easy" ? 6 : 3, 9);
    const b = randInt(2, 9);
    const sum = a + b;
    if (sum <= 10 || sum > 18) continue;
    if (level === "easy" && sum > 14) continue;
    if (level === "hard" && (a < 5 || b < 5)) continue;
    return [a, b];
  }
}

/** a − b mit echtem Rückschritt über die 10: 11 ≤ a ≤ 18, b ≤ 9, Ergebnis < 10. */
function minusPairWithBorrow(level: Level): [number, number] {
  while (true) {
    const a = randInt(11, 18);
    const b = randInt(2, 9);
    const result = a - b;
    if (result >= 10 || result < 1) continue;
    if (level === "easy" && b > 6) continue;
    if (level === "hard" && b < 5) continue;
    return [a, b];
  }
}

type Form = "plus" | "minus" | "plus-gap" | "minus-gap";

function pickForm(level: Level): Form {
  if (level === "easy") return pickOne<Form>(["plus", "plus", "minus"]);
  if (level === "hard") return pickOne<Form>(["plus", "minus", "plus-gap", "minus-gap"]);
  return pickOne<Form>(["plus", "plus", "minus", "minus", "plus-gap"]);
}

function make(
  prompt: string,
  correctAnswer: number,
  level: Level,
  texts: { hint: string; solution: string }
): TrainingTask {
  return {
    id: taskId("zs"),
    moduleId: "zehnersprung",
    prompt,
    correctAnswer,
    level,
    ...texts,
  };
}
