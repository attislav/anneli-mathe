// Modul 6: Plus und Minus im Hunderterraum.
//
// Trick: „Erst Zehner, dann Einer" — die zweite Zahl wird in Zehner und
// Einer zerlegt und in zwei Schritten gerechnet. Bei Zehnerüberschreitung
// zusätzlich: „Am Zehner Pause machen".
//
// Level-Steuerung:
//   easy   — ZE ± E und ZE ± Z, nie über einen Zehner
//   normal — Mischung, ca. die Hälfte mit Zehnerüberschreitung
//   hard   — überwiegend ZE ± ZE mit Überschreitung, dazu Lücken-Aufgaben

import type { Level, TrainingTask } from "../types";
import { pickOne, randInt, taskId } from "../types";

export function generateBis100(level: Level = "normal"): TrainingTask {
  const form = pickForm(level);

  switch (form) {
    case "plus-ones": {
      // ZE + E. `crossing` entscheidet, ob dabei ein Zehner überschritten wird.
      const crossing = level !== "easy" && Math.random() < 0.6;
      const a = randInt(21, 90);
      const ones = a % 10;
      // Überschreitung braucht ones ≥ 1 (sonst gibt es kein b ≤ 9),
      // Nicht-Überschreitung braucht ones ≤ 8. Sonst: neu würfeln.
      if (crossing ? ones === 0 : ones === 9) return generateBis100(level);
      const b = crossing ? randInt(10 - ones, 9) : randInt(1, 9 - ones);
      const sum = a + b;
      const toTen = 10 - ones;
      return make(`${a} + ${b}`, sum, level, {
        hint: crossing
          ? `Von ${a} bis ${a + toTen} sind es ${toTen}. Zerlege die ${b} in ${toTen} und ${b - toTen}.`
          : `Die Zehner bleiben stehen: ${ones} + ${b} = ${ones + b}.`,
        solution: `${a} + ${b} = ${sum}.`,
      });
    }
    case "minus-ones": {
      // ZE − E, analog zu plus-ones mit Unterschreitung statt Überschreitung.
      const crossing = level !== "easy" && Math.random() < 0.6;
      const a = randInt(21, 99);
      const ones = a % 10;
      if (crossing ? ones === 9 : ones === 0) return generateBis100(level);
      const b = crossing ? randInt(ones + 1, 9) : randInt(1, ones);
      const diff = a - b;
      const fullTen = Math.floor(a / 10) * 10;
      return make(`${a} − ${b}`, diff, level, {
        hint: !crossing
          ? `Die Zehner bleiben stehen: ${ones} − ${b} = ${ones - b}.`
          : ones === 0
            ? `${a} ist ein glatter Zehner. Nimm einen ganzen Zehner weg: ${a} − 10 = ${a - 10}. Davon gibst du ${10 - b} wieder zurück.`
            : `Geh erst runter auf ${fullTen} — das sind ${ones}. Dann noch ${b - ones} weiter zurück.`,
        solution: `${a} − ${b} = ${diff}.`,
      });
    }
    case "plus-tens": {
      const a = randInt(11, 79);
      const b = randInt(1, Math.floor((99 - a) / 10)) * 10;
      return make(`${a} + ${b}`, a + b, level, {
        hint: `Nur die Zehner ändern sich: ${Math.floor(a / 10)} + ${b / 10} = ${Math.floor(a / 10) + b / 10} Zehner. Die ${a % 10} bleibt hinten stehen.`,
        solution: `${a} + ${b} = ${a + b}.`,
      });
    }
    case "minus-tens": {
      const a = randInt(31, 99);
      const b = randInt(1, Math.floor(a / 10) - 1) * 10;
      return make(`${a} − ${b}`, a - b, level, {
        hint: `Nur die Zehner ändern sich: ${Math.floor(a / 10)} − ${b / 10} = ${Math.floor(a / 10) - b / 10} Zehner.`,
        solution: `${a} − ${b} = ${a - b}.`,
      });
    }
    case "plus-full": {
      // 43 + 25 — Zehner und Einer in zwei Schritten
      const a = randInt(21, 69);
      const bTens = randInt(1, Math.min(3, Math.floor((98 - a) / 10))) * 10;
      const bOnes = randInt(1, 9);
      const b = bTens + bOnes;
      if (a + b > 100) return generateBis100(level);
      return make(`${a} + ${b}`, a + b, level, {
        hint: `Zerlege ${b} in ${bTens} und ${bOnes}. Erst ${a} + ${bTens} = ${a + bTens}.`,
        solution: `${a} + ${bTens} = ${a + bTens}, dann + ${bOnes} = ${a + b}.`,
      });
    }
    case "minus-full": {
      const a = randInt(45, 99);
      const bTens = randInt(1, Math.min(3, Math.floor(a / 10) - 1)) * 10;
      const bOnes = randInt(1, 9);
      const b = bTens + bOnes;
      if (a - b < 1) return generateBis100(level);
      return make(`${a} − ${b}`, a - b, level, {
        hint: `Zerlege ${b} in ${bTens} und ${bOnes}. Erst ${a} − ${bTens} = ${a - bTens}.`,
        solution: `${a} − ${bTens} = ${a - bTens}, dann − ${bOnes} = ${a - b}.`,
      });
    }
    case "gap": {
      // 47 + ? = 62
      const a = randInt(21, 79);
      const b = randInt(5, Math.min(30, 99 - a));
      return make(`${a} + ? = ${a + b}`, b, level, {
        hint: `Geh in Schritten: von ${a} bis ${Math.ceil((a + 1) / 10) * 10} sind es ${Math.ceil((a + 1) / 10) * 10 - a}. Wie weit ist es von da bis ${a + b}?`,
        solution: `${a} + ${b} = ${a + b}.`,
      });
    }
  }
}

type Form =
  | "plus-ones"
  | "minus-ones"
  | "plus-tens"
  | "minus-tens"
  | "plus-full"
  | "minus-full"
  | "gap";

function pickForm(level: Level): Form {
  if (level === "easy")
    return pickOne<Form>(["plus-ones", "minus-ones", "plus-tens", "minus-tens"]);
  if (level === "hard")
    return pickOne<Form>(["plus-full", "plus-full", "minus-full", "minus-full", "gap", "gap"]);
  return pickOne<Form>([
    "plus-ones",
    "minus-ones",
    "plus-tens",
    "minus-tens",
    "plus-full",
    "minus-full",
    "gap",
  ]);
}

function make(
  prompt: string,
  correctAnswer: number,
  level: Level,
  texts: { hint: string; solution: string }
): TrainingTask {
  return {
    id: taskId("b100"),
    moduleId: "bis100",
    prompt,
    correctAnswer,
    level,
    ...texts,
  };
}
