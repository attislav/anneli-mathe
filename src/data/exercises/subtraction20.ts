// Minus bis 20 mit Zehnerübergang.
// Niveau: Übergang Klasse 1 → Klasse 2.
//
// Pädagogisches Ziel wie bei addition20: der Zehnerübergang
// ("erst zur 10 runter, dann den Rest") wird gezielt geübt.
// Wir bevorzugen also Aufgaben a − b mit 10 < a ≤ 18 und Ergebnis < 10
// — das erzwingt den Übergang.
//
// Varianten (M1, 2026-05-23):
//   - "plain"   : a − b = ?
//   - "gap-b"   : a − ? = c (Lücke hinten)
//   - "gap-a"   : ? − b = c (Lücke vorne)
//   - "context" : Sachaufgabe "Anneli hatte a Federn, hat noch c — wie viele verloren?"
//                 (Antwort: a − c = b; löst die Lücke implizit)
//
// Verteilung:
//   easy:   90 % plain, 10 % gap-b
//   normal: 55 % plain, 25 % gap-b, 15 % gap-a, 5 % context
//   hard:   25 % plain, 25 % gap-b, 25 % gap-a, 25 % context

import type { Exercise, Level } from "./types";
import { exerciseId, randInt } from "./types";
import { vignetteSubtraction } from "./vignettes";

type Form = "a-b" | "a-?" | "?-b" | "context";

/**
 * Erzeugt eine Minus-Aufgabe a − b mit:
 *   - 0 ≤ Ergebnis ≤ 18
 *   - a ≤ 20
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
        variant: "plain",
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
        variant: "gap-b",
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
        variant: "gap-a",
      };
    }
    case "context": {
      // Sachaufgaben-Form: Start a, Rest diff → Gefragt ist die verlorene Menge b.
      return {
        id: exerciseId("s20"),
        skill: "subtraction20",
        prompt: `Start: ${a}, jetzt nur noch: ${diff}.\nWie viele sind weg?`,
        vignette: vignetteSubtraction({ a, b, diff, form }),
        correctAnswer: b,
        hint: "Vom Start zur jetzigen Anzahl — die Differenz ist die Antwort.",
        level,
        variant: "context",
      };
    }
  }
}

function pairWithBorrow(): [number, number] {
  while (true) {
    const a = randInt(11, 18);
    const b = randInt(a - 9, a - 1);
    if (b >= 2 && b <= 9) return [a, b];
  }
}

function pairWithoutBorrow(): [number, number] {
  if (Math.random() < 0.5) {
    const a = randInt(11, 20);
    const b = randInt(1, a - 10);
    return [a, b];
  }
  const a = randInt(3, 10);
  const b = randInt(1, a);
  return [a, b];
}

function pickForm(level: Level): Form {
  const r = Math.random();
  if (level === "hard") {
    if (r < 0.25) return "a-b";
    if (r < 0.5) return "a-?";
    if (r < 0.75) return "?-b";
    return "context";
  }
  if (level === "easy") {
    if (r < 0.9) return "a-b";
    return "a-?";
  }
  // normal
  if (r < 0.55) return "a-b";
  if (r < 0.8) return "a-?";
  if (r < 0.95) return "?-b";
  return "context";
}

function hintFor(a: number, b: number): string {
  const diff = a - b;
  if (a <= 10) return "Hier kommst du nicht unter die Zehn — einfach Stück für Stück.";
  if (diff >= 10) return "Du brauchst die Zehn nicht zu unterschreiten.";
  const toTen = a - 10;
  const rest = b - toTen;
  return `Erst zur Zehn: ${a} − ${toTen} = 10. Dann ${rest} weiter nach unten.`;
}
