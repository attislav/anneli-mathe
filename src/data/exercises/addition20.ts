// Plus bis 20 mit Zehnerübergang.
// Niveau: Übergang Klasse 1 → Klasse 2.
//
// Pädagogisches Ziel: der Zehnerübergang ("erst zur 10, dann den Rest")
// soll geübt werden. Wir bevorzugen daher Aufgaben, bei denen mindestens
// ein Summand ≥ 6 ist und das Ergebnis > 10 — aber nicht ausschließlich,
// damit auch nicht-überschreitende Aufgaben als Auflockerung kommen.

import type { Exercise, Level } from "./types";
import { exerciseId, randInt } from "./types";
import { vignetteAddition } from "./vignettes";

/**
 * Erzeugt eine Plus-Aufgabe a + b mit 1 ≤ a, b ≤ 18 und a + b ≤ 20.
 *
 * Level beeinflusst die Carry-Wahrscheinlichkeit:
 *   - "easy":   30 % Zehnerübergang
 *   - "normal": 75 % Zehnerübergang
 *   - "hard":   95 % Zehnerübergang, Lücken-Aufgaben häufiger
 *
 * Aufgabenform: "a + b = ?", "a + ? = c" oder "? + b = c".
 */
export function generateAddition20(level: Level = "normal"): Exercise {
  const carryP = level === "easy" ? 0.3 : level === "hard" ? 0.95 : 0.75;
  const wantsCarry = Math.random() < carryP;

  const [a, b] = wantsCarry ? pairWithCarry() : pairWithoutCarry();
  const sum = a + b;

  // Aufgabenform wählen. Lücken-Aufgaben sind interessanter, aber nicht
  // jede Lücken-Variante macht Sinn — wir mischen drei Formen.
  const form = pickForm(level);

  switch (form) {
    case "a+b": {
      return {
        id: exerciseId("a20"),
        skill: "addition20",
        prompt: `${a} + ${b} = ?`,
        vignette: vignetteAddition({ a, b, sum, form }),
        correctAnswer: sum,
        hint: hintFor(a, b),
        level,
      };
    }
    case "a+?": {
      return {
        id: exerciseId("a20"),
        skill: "addition20",
        prompt: `${a} + ? = ${sum}`,
        vignette: vignetteAddition({ a, b, sum, form }),
        correctAnswer: b,
        hint: "Wie viel fehlt von der ersten Zahl bis zur Summe?",
        level,
      };
    }
    case "?+b": {
      return {
        id: exerciseId("a20"),
        skill: "addition20",
        prompt: `? + ${b} = ${sum}`,
        vignette: vignetteAddition({ a, b, sum, form }),
        correctAnswer: a,
        hint: "Wie viel fehlt vor der zweiten Zahl, damit die Summe stimmt?",
        level,
      };
    }
  }
}

function pairWithCarry(): [number, number] {
  // Beide Summanden 2..9, Summe 11..18, mindestens einer ≥ 6 für echten Übergang.
  while (true) {
    const a = randInt(2, 9);
    const b = randInt(2, 9);
    const sum = a + b;
    if (sum > 10 && sum <= 18 && (a >= 6 || b >= 6)) {
      return Math.random() < 0.5 ? [a, b] : [b, a];
    }
  }
}

function pairWithoutCarry(): [number, number] {
  // Summe bis 10 ODER einer der Summanden ist die 10 selbst (10 + n).
  if (Math.random() < 0.5) {
    // 10 + n
    const n = randInt(1, 9);
    return Math.random() < 0.5 ? [10, n] : [n, 10];
  }
  // a + b ≤ 10
  const a = randInt(1, 8);
  const b = randInt(1, 10 - a);
  return Math.random() < 0.5 ? [a, b] : [b, a];
}

type Form = "a+b" | "a+?" | "?+b";
function pickForm(level: Level): Form {
  const r = Math.random();
  if (level === "hard") {
    // Mehr Lücken-Varianten — die fordern stärker.
    if (r < 0.35) return "a+b";
    if (r < 0.7) return "a+?";
    return "?+b";
  }
  if (level === "easy") {
    // Fast nur die Standard-Form.
    if (r < 0.85) return "a+b";
    return "a+?";
  }
  if (r < 0.6) return "a+b";
  if (r < 0.8) return "a+?";
  return "?+b";
}

function hintFor(a: number, b: number): string {
  if (a + b <= 10) return "Beide Summanden zusammen — bleibt noch unter der Zehn.";
  // Klassischer Zehnerübergangstipp.
  const larger = Math.max(a, b);
  const smaller = Math.min(a, b);
  const toTen = 10 - larger;
  if (toTen > 0 && toTen < smaller) {
    return `Erst zur Zehn: ${larger} + ${toTen} = 10. Dann den Rest dazu.`;
  }
  return "Erst zur Zehn ergänzen, dann den Rest dazu.";
}
