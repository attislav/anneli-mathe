// Plus bis 20 mit Zehnerübergang.
// Niveau: Übergang Klasse 1 → Klasse 2.
//
// Pädagogisches Ziel: der Zehnerübergang ("erst zur 10, dann den Rest")
// soll geübt werden. Wir bevorzugen daher Aufgaben, bei denen mindestens
// ein Summand ≥ 6 ist und das Ergebnis > 10 — aber nicht ausschließlich,
// damit auch nicht-überschreitende Aufgaben als Auflockerung kommen.

import type { Exercise } from "./types";
import { exerciseId, randInt } from "./types";

/**
 * Erzeugt eine Plus-Aufgabe a + b mit 1 ≤ a, b ≤ 18 und a + b ≤ 20.
 *
 * In ~75 % der Fälle ist die Aufgabe ein "echter" Zehnerübergang,
 * d.h. a < 10 und b < 10 und a + b > 10. In ~25 % der Fälle eine
 * leichtere Aufgabe ohne Übergang — als Variation und kleines Erfolgserlebnis.
 *
 * Zusätzlich variiert die Form: meistens "a + b = ?", manchmal als Lücke
 * "a + ? = c" oder "? + b = c", damit das Kind in beide Richtungen denkt.
 */
export function generateAddition20(): Exercise {
  const wantsCarry = Math.random() < 0.75;

  const [a, b] = wantsCarry ? pairWithCarry() : pairWithoutCarry();
  const sum = a + b;

  // Aufgabenform wählen. Lücken-Aufgaben sind interessanter, aber nicht
  // jede Lücken-Variante macht Sinn — wir mischen drei Formen.
  const form = pickForm();

  switch (form) {
    case "a+b": {
      return {
        id: exerciseId("a20"),
        skill: "addition20",
        prompt: `${a} + ${b} = ?`,
        correctAnswer: sum,
        hint: hintFor(a, b),
      };
    }
    case "a+?": {
      return {
        id: exerciseId("a20"),
        skill: "addition20",
        prompt: `${a} + ? = ${sum}`,
        correctAnswer: b,
        hint: "Wie viel fehlt von der ersten Zahl bis zur Summe?",
      };
    }
    case "?+b": {
      return {
        id: exerciseId("a20"),
        skill: "addition20",
        prompt: `? + ${b} = ${sum}`,
        correctAnswer: a,
        hint: "Wie viel fehlt vor der zweiten Zahl, damit die Summe stimmt?",
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
function pickForm(): Form {
  const r = Math.random();
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
