// Plus & Minus bis 100 — Klasse-2-Standard, ohne und mit Zehnerübergang.
// Niveau: Mitte Klasse 2 (Kapitel 2 der Story, Pfirsich-Wüste).
//
// Pädagogisches Ziel: Übergang vom 20er-Raum in den 100er-Raum.
// Erst innerhalb voller Zehner (40+30, 80-20), dann mit Zehnerübergang
// (47+8, 53-7, 38+27, 64-29).
//
// Varianten:
//   - "plain" : a + b = ? / a − b = ?
//   - "gap-b" : a + ? = c / a − ? = c
//   - "gap-a" : ? + b = c / ? − b = c
//
// Level-Verteilung:
//   easy:
//     - Zahlen 10..50
//     - 70 % ohne Übergang (Zehner+Zehner oder ohne Carry)
//     - 90 % plain, 10 % gap-b
//   normal:
//     - Zahlen 10..80
//     - 50 % mit Übergang
//     - 60 % plain, 25 % gap-b, 15 % gap-a
//   hard:
//     - Zahlen 20..99
//     - 85 % mit Übergang
//     - 40 % plain, 30 % gap-b, 30 % gap-a

import type { Exercise, Level } from "./types";
import { exerciseId, randInt } from "./types";
import { vignetteAddSub100 } from "./vignettes";

type Form = "plain" | "gap-a" | "gap-b";
type Op = "plus" | "minus";

export function generateAddSub100(level: Level = "normal"): Exercise {
  const op: Op = Math.random() < 0.5 ? "plus" : "minus";
  const [a, b] = pickPair(level, op);
  const result = op === "plus" ? a + b : a - b;
  const form = pickForm(level);

  if (op === "plus") {
    return buildPlus(a, b, result, form, level);
  }
  return buildMinus(a, b, result, form, level);
}

function buildPlus(a: number, b: number, sum: number, form: Form, level: Level): Exercise {
  switch (form) {
    case "plain":
      return {
        id: exerciseId("as100"),
        skill: "addSub100",
        prompt: `${a} + ${b} = ?`,
        vignette: vignetteAddSub100({ a, b, result: sum, op: "plus", form }),
        correctAnswer: sum,
        hint: hintPlus(a, b),
        level,
        variant: "plain",
      };
    case "gap-b":
      return {
        id: exerciseId("as100"),
        skill: "addSub100",
        prompt: `${a} + ? = ${sum}`,
        vignette: vignetteAddSub100({ a, b, result: sum, op: "plus", form }),
        correctAnswer: b,
        hint: "Wie viel fehlt von der ersten Zahl bis zur Summe? Zähl in Zehnern, dann den Rest.",
        level,
        variant: "gap-b",
      };
    case "gap-a":
      return {
        id: exerciseId("as100"),
        skill: "addSub100",
        prompt: `? + ${b} = ${sum}`,
        vignette: vignetteAddSub100({ a, b, result: sum, op: "plus", form }),
        correctAnswer: a,
        hint: "Welche Zahl ergibt mit der zweiten Zahl die Summe?",
        level,
        variant: "gap-a",
      };
  }
}

function buildMinus(a: number, b: number, diff: number, form: Form, level: Level): Exercise {
  switch (form) {
    case "plain":
      return {
        id: exerciseId("as100"),
        skill: "addSub100",
        prompt: `${a} − ${b} = ?`,
        vignette: vignetteAddSub100({ a, b, result: diff, op: "minus", form }),
        correctAnswer: diff,
        hint: hintMinus(a, b),
        level,
        variant: "plain",
      };
    case "gap-b":
      return {
        id: exerciseId("as100"),
        skill: "addSub100",
        prompt: `${a} − ? = ${diff}`,
        vignette: vignetteAddSub100({ a, b, result: diff, op: "minus", form }),
        correctAnswer: b,
        hint: "Wie viel musst du wegnehmen, damit das Ergebnis stimmt?",
        level,
        variant: "gap-b",
      };
    case "gap-a":
      return {
        id: exerciseId("as100"),
        skill: "addSub100",
        prompt: `? − ${b} = ${diff}`,
        vignette: vignetteAddSub100({ a, b, result: diff, op: "minus", form }),
        correctAnswer: a,
        hint: "Welche Zahl ergibt nach dem Minus den richtigen Rest?",
        level,
        variant: "gap-a",
      };
  }
}

function pickPair(level: Level, op: Op): [number, number] {
  const carryP = level === "easy" ? 0.3 : level === "hard" ? 0.85 : 0.5;
  const wantsCarry = Math.random() < carryP;

  if (op === "plus") {
    if (wantsCarry) return pairPlusCarry(level);
    return pairPlusNoCarry(level);
  }
  if (wantsCarry) return pairMinusBorrow(level);
  return pairMinusNoBorrow(level);
}

function pairPlusNoCarry(level: Level): [number, number] {
  // Zehner-Vielfache oder ohne Überschreiten der Einer.
  // Beispiel: 40+30, 25+4, 60+12 (sofern <100 und kein Carry).
  for (let i = 0; i < 50; i++) {
    const [maxA, minA] = rangeFor(level);
    const a = randInt(minA, maxA);
    const aOnes = a % 10;
    const maxB = Math.min(99 - a, 9 - aOnes + (level === "easy" ? 10 : 30));
    if (maxB < 1) continue;
    const b = randInt(1, maxB);
    // Kein Carry: (a%10) + (b%10) ≤ 9
    if ((aOnes + (b % 10)) <= 9 && a + b <= 99) return [a, b];
  }
  // Fallback: glatte Zehner
  const a = randInt(2, 8) * 10;
  const b = randInt(1, 9) * 10;
  if (a + b > 99) return [a, 99 - a];
  return [a, b];
}

function pairPlusCarry(level: Level): [number, number] {
  // Carry: a%10 + b%10 > 9, Ergebnis ≤ 99.
  for (let i = 0; i < 50; i++) {
    const [maxA, minA] = rangeFor(level);
    const a = randInt(minA, maxA);
    const aOnes = a % 10;
    if (aOnes < 2) continue;
    const minBOnes = 10 - aOnes;
    if (minBOnes > 9) continue;
    const bOnes = randInt(minBOnes, 9);
    const maxBTens = Math.floor((99 - a) / 10);
    if (maxBTens < 0) continue;
    const bTens = randInt(0, maxBTens) * 10;
    const b = bTens + bOnes;
    if (b < 1) continue;
    if (a + b > 99) continue;
    return [a, b];
  }
  // Fallback
  return [47, 8];
}

function pairMinusNoBorrow(level: Level): [number, number] {
  for (let i = 0; i < 50; i++) {
    const [maxA, minA] = rangeFor(level);
    const a = randInt(Math.max(minA, 10), maxA);
    const aOnes = a % 10;
    const maxB = Math.min(a, aOnes + (level === "easy" ? 0 : 20));
    if (maxB < 1) continue;
    const b = randInt(1, maxB);
    if ((b % 10) <= aOnes && a - b >= 0) return [a, b];
  }
  return [50, 20];
}

function pairMinusBorrow(level: Level): [number, number] {
  // Borrow: a%10 < b%10, a > b.
  for (let i = 0; i < 50; i++) {
    const [maxA, minA] = rangeFor(level);
    const a = randInt(Math.max(minA, 12), maxA);
    const aOnes = a % 10;
    if (aOnes > 7) continue;
    const minBOnes = aOnes + 1;
    if (minBOnes > 9) continue;
    const bOnes = randInt(minBOnes, 9);
    const maxBTens = Math.min(Math.floor((a - bOnes) / 10), 9);
    if (maxBTens < 0) continue;
    const bTens = randInt(0, maxBTens) * 10;
    const b = bTens + bOnes;
    if (b < 1 || b >= a) continue;
    return [a, b];
  }
  return [53, 7];
}

function rangeFor(level: Level): [number, number] {
  // [max, min] — Reihenfolge im pickPair-Code rückwärts, hier so retournieren
  // dass [maxA, minA] geliefert wird.
  if (level === "easy") return [50, 10];
  if (level === "hard") return [99, 20];
  return [80, 10];
}

function pickForm(level: Level): Form {
  const r = Math.random();
  if (level === "easy") return r < 0.9 ? "plain" : "gap-b";
  if (level === "hard") {
    if (r < 0.4) return "plain";
    if (r < 0.7) return "gap-b";
    return "gap-a";
  }
  if (r < 0.6) return "plain";
  if (r < 0.85) return "gap-b";
  return "gap-a";
}

function hintPlus(a: number, b: number): string {
  const aOnes = a % 10;
  const bOnes = b % 10;
  if (aOnes + bOnes <= 9) {
    return "Erst die Zehner zusammen, dann die Einer dazu.";
  }
  return `Erst zum nächsten Zehner: ${a} + ${10 - aOnes} = ${a + (10 - aOnes)}. Dann den Rest.`;
}

function hintMinus(a: number, b: number): string {
  const aOnes = a % 10;
  const bOnes = b % 10;
  if (bOnes <= aOnes) {
    return "Erst die Zehner abziehen, dann die Einer.";
  }
  return `Erst zum vorherigen Zehner: ${a} − ${aOnes} = ${a - aOnes}. Dann den Rest weiter weg.`;
}
