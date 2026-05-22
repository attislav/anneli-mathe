// Minus bis 20 mit Zehnerübergang.
// Niveau: Übergang Klasse 1 → Klasse 2.
//
// Pädagogisches Ziel wie bei addition20: der Zehnerübergang
// ("erst zur 10 runter, dann den Rest") wird gezielt geübt.
// Wir bevorzugen also Aufgaben a − b mit 10 < a ≤ 18 und Ergebnis < 10
// — das erzwingt den Übergang.

import type { Exercise, Level } from "./types";
import { exerciseId, randInt } from "./types";
import { vignetteSubtraction } from "./vignettes";

/**
 * Erzeugt eine Minus-Aufgabe a − b mit:
 *   - 0 ≤ Ergebnis ≤ 18
 *   - a ≤ 20
 *
 * Level beeinflusst die Borrow-Wahrscheinlichkeit:
 *   - "easy":   25 % Zehnerübergang
 *   - "normal": 75 % Zehnerübergang
 *   - "hard":   95 % Zehnerübergang, Lücken-Aufgaben häufiger
 *
 * Aufgabenformen: "a − b = ?", "a − ? = c", "? − b = c".
 */
export function generateSubtraction20(level: Level = "normal"): Exercise {
  const borrowP = level === "easy" ? 0.25 : level === "hard" ? 0.95 : 0.75;
  const wantsBorrow = Math.random() < borrowP;
  const [a, b] = wantsBorrow ? pairWithBorrow() : pairWithoutBorrow();
  const diff = a - b;

  const form = pickForm(level);

  switch (form) {
    case "a-b": {
      return {
        id: exerciseId("s20"),
        skill: "subtraction20",
        prompt: `${a} − ${b} = ?`,
        vignette: vignetteSubtraction({ a, b, diff, form }),
        correctAnswer: diff,
        hint: hintFor(a, b),
        level,
      };
    }
    case "a-?": {
      return {
        id: exerciseId("s20"),
        skill: "subtraction20",
        prompt: `${a} − ? = ${diff}`,
        vignette: vignetteSubtraction({ a, b, diff, form }),
        correctAnswer: b,
        hint: "Wie viel musst du wegnehmen, damit das Ergebnis stimmt?",
        level,
      };
    }
    case "?-b": {
      return {
        id: exerciseId("s20"),
        skill: "subtraction20",
        prompt: `? − ${b} = ${diff}`,
        vignette: vignetteSubtraction({ a, b, diff, form }),
        correctAnswer: a,
        hint: "Welche Zahl ergibt nach dem Minus den richtigen Rest?",
        level,
      };
    }
  }
}

function pairWithBorrow(): [number, number] {
  // a in 11..18, b so dass a − b in 1..9 → echter Zehnerübergang.
  while (true) {
    const a = randInt(11, 18);
    const b = randInt(a - 9, a - 1); // diff in 1..9
    if (b >= 2 && b <= 9) return [a, b];
  }
}

function pairWithoutBorrow(): [number, number] {
  // Entweder Ergebnis ≥ 10 ODER a ≤ 10 (kein Übergang nötig).
  if (Math.random() < 0.5) {
    // a in 11..20, Ergebnis ≥ 10 → b klein
    const a = randInt(11, 20);
    const b = randInt(1, a - 10);
    return [a, b];
  }
  // a ≤ 10, b ≤ a
  const a = randInt(3, 10);
  const b = randInt(1, a);
  return [a, b];
}

type Form = "a-b" | "a-?" | "?-b";
function pickForm(level: Level): Form {
  const r = Math.random();
  if (level === "hard") {
    if (r < 0.35) return "a-b";
    if (r < 0.7) return "a-?";
    return "?-b";
  }
  if (level === "easy") {
    if (r < 0.85) return "a-b";
    return "a-?";
  }
  if (r < 0.6) return "a-b";
  if (r < 0.8) return "a-?";
  return "?-b";
}

function hintFor(a: number, b: number): string {
  const diff = a - b;
  if (a <= 10) return "Hier kommst du nicht unter die Zehn — einfach Stück für Stück.";
  if (diff >= 10) return "Du brauchst die Zehn nicht zu unterschreiten.";
  // Klassischer Übergangstipp: erst zur 10 runter, dann der Rest.
  const toTen = a - 10; // 1..8
  const rest = b - toTen; // > 0, weil diff < 10
  return `Erst zur Zehn: ${a} − ${toTen} = 10. Dann ${rest} weiter nach unten.`;
}
