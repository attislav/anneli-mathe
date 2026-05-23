// Plus bis 20 mit Zehnerübergang.
// Niveau: Übergang Klasse 1 → Klasse 2.
//
// Pädagogisches Ziel: der Zehnerübergang ("erst zur 10, dann den Rest")
// soll geübt werden. Wir bevorzugen daher Aufgaben, bei denen mindestens
// ein Summand ≥ 6 ist und das Ergebnis > 10 — aber nicht ausschließlich,
// damit auch nicht-überschreitende Aufgaben als Auflockerung kommen.
//
// Varianten (M1, 2026-05-23):
//   - "plain"       : a + b = ?
//   - "gap-b"       : a + ? = c (Lücke hinten)
//   - "gap-a"       : ? + b = c (Lücke vorne)
//   - "commutative" : a+b und b+a — gleicher Wert? (hard-only)
//
// Verteilung nach Level:
//   easy:   90 % plain, 10 % gap-b
//   normal: 60 % plain, 25 % gap-b, 15 % gap-a
//   hard:   35 % plain, 25 % gap-b, 25 % gap-a, 15 % commutative

import type { Exercise, Level } from "./types";
import { exerciseId, randInt } from "./types";
import { vignetteAddition } from "./vignettes";

type Form = "a+b" | "a+?" | "?+b" | "commutative";

/**
 * Erzeugt eine Plus-Aufgabe a + b mit 1 ≤ a, b ≤ 18 und a + b ≤ 20.
 */
export function generateAddition20(level: Level = "normal"): Exercise {
  const carryP = level === "easy" ? 0.3 : level === "hard" ? 0.95 : 0.75;
  const wantsCarry = Math.random() < carryP;

  const [a, b] = wantsCarry ? pairWithCarry() : pairWithoutCarry();
  const sum = a + b;

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
        variant: "plain",
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
        variant: "gap-b",
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
        variant: "gap-a",
      };
    }
    case "commutative": {
      // Frage: a+b und b+a — gleicher Wert? Antwort ist immer die Summe
      // (das Kind tippt einfach den Wert, der für beides gilt).
      return {
        id: exerciseId("a20"),
        skill: "addition20",
        prompt: `${a} + ${b}  und  ${b} + ${a}  =  ?`,
        vignette: vignetteAddition({ a, b, sum, form }),
        correctAnswer: sum,
        hint: "Plus dreht sich um — die Reihenfolge ist egal. Beide ergeben dasselbe.",
        level,
        variant: "commutative",
      };
    }
  }
}

function pairWithCarry(): [number, number] {
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
  if (Math.random() < 0.5) {
    const n = randInt(1, 9);
    return Math.random() < 0.5 ? [10, n] : [n, 10];
  }
  const a = randInt(1, 8);
  const b = randInt(1, 10 - a);
  return Math.random() < 0.5 ? [a, b] : [b, a];
}

function pickForm(level: Level): Form {
  const r = Math.random();
  if (level === "hard") {
    if (r < 0.35) return "a+b";
    if (r < 0.6) return "a+?";
    if (r < 0.85) return "?+b";
    return "commutative";
  }
  if (level === "easy") {
    if (r < 0.9) return "a+b";
    return "a+?";
  }
  // normal
  if (r < 0.6) return "a+b";
  if (r < 0.85) return "a+?";
  return "?+b";
}

function hintFor(a: number, b: number): string {
  if (a + b <= 10) return "Beide Summanden zusammen — bleibt noch unter der Zehn.";
  const larger = Math.max(a, b);
  const smaller = Math.min(a, b);
  const toTen = 10 - larger;
  if (toTen > 0 && toTen < smaller) {
    return `Erst zur Zehn: ${larger} + ${toTen} = 10. Dann den Rest dazu.`;
  }
  return "Erst zur Zehn ergänzen, dann den Rest dazu.";
}
