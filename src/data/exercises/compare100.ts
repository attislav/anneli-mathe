// Zahlen vergleichen bis 100.
// Niveau: Klasse 2 (Zehner und Einer auseinanderhalten).
//
// Mechanik: zwei zweistellige Zahlen, Kind setzt das richtige Symbol
// (<, =, >) dazwischen. Die Brücke 4 nutzt den `compare-symbol`-Input-Mode
// (Drag/Tap auf eines der drei Symbole), siehe `CompareSymbolInput.tsx`.
//
// `correctAnswer` ist als Symbol-Code kodiert:
//   -1 = links < rechts
//    0 = links = rechts
//    1 = links > rechts
//
// Pädagogisches Ziel: zuerst Zehner vergleichen, bei Gleichstand Einer.
// Wir bevorzugen darum Paare mit GLEICHEN Zehnern (z.B. 47 vs 42) — das
// ist der lehrreichere Fall.

import type { Exercise, Level } from "./types";
import { exerciseId, randInt } from "./types";
import { vignetteCompare } from "./vignettes";

/**
 * Erzeugt eine Vergleichs-Aufgabe.
 * - "easy": einstellige + zweistellige Zahlen (offensichtlich verschieden).
 * - "normal": zweistellige mit ~50% gleichen Zehnern, gelegentlich Gleichheit.
 * - "hard": zweistellige mit ~80% gleichen Zehnern (Einer entscheiden).
 */
export function generateCompare100(level: Level = "normal"): Exercise {
  const [left, right] = pickPair(level);
  const compareResult: -1 | 0 | 1 = left < right ? -1 : left > right ? 1 : 0;

  const vignette = vignetteCompare({ left, right, askLarger: true });
  const prompt = `${left}   ?   ${right}`;

  return {
    id: exerciseId("cmp"),
    skill: "compare100",
    prompt,
    vignette,
    visual: { kind: "compare", left, right },
    correctAnswer: compareResult,
    hint: hintFor(left, right),
    level,
  };
}

function pickPair(level: Level): [number, number] {
  if (level === "easy") {
    // Eine einstellig, eine zweistellig — sehr offensichtlich.
    const small = randInt(2, 9);
    const big = randInt(20, 99);
    return Math.random() < 0.5 ? [small, big] : [big, small];
  }

  // ~10% Gleichheits-Fall ab "normal" — das = ist eine eigene Lern-Erfahrung.
  if (level !== "hard" && Math.random() < 0.12) {
    const eq = randInt(11, 99);
    return [eq, eq];
  }

  const sameTens = level === "hard" ? Math.random() < 0.8 : Math.random() < 0.5;

  if (sameTens) {
    // Gleiche Zehner, verschiedene Einer — der lehrreiche Fall.
    const tens = randInt(2, 9);
    const onesA = randInt(0, 9);
    let onesB = randInt(0, 9);
    while (onesA === onesB) onesB = randInt(0, 9);
    return [tens * 10 + onesA, tens * 10 + onesB];
  }

  // Unterschiedliche Zehner.
  const a = randInt(11, 99);
  let b = randInt(11, 99);
  while (Math.floor(a / 10) === Math.floor(b / 10) || a === b) {
    b = randInt(11, 99);
  }
  return [a, b];
}

function hintFor(left: number, right: number): string {
  if (left === right) {
    return "Beide sind gleich viele — schau noch einmal genau hin. Welches Zeichen passt dann?";
  }
  const tensL = Math.floor(left / 10);
  const tensR = Math.floor(right / 10);
  if (tensL === tensR) {
    return "Beide haben gleich viele Zehner — schau die Einer an. Die Spitze zeigt zur kleineren Zahl.";
  }
  return "Schau zuerst die Zehner — wer mehr Zehner hat, ist größer. Die Spitze des Zeichens zeigt zur kleineren Zahl.";
}
