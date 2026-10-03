// Zahlen vergleichen bis 100.
// Niveau: Klasse 2 (Zehner und Einer auseinanderhalten).
//
// Mechanik: zwei zweistellige Zahlen, Kind soll die GRÖSSERE bzw. KLEINERE
// nennen. Antwort = die Zahl selbst (nicht "links/rechts"), damit es zum
// Number-Keypad-Modus passt — der visuelle Drag-Symbol-Modus (<, =, >)
// kommt später als Komponenten-Variante on top.
//
// Pädagogisches Ziel: zuerst Zehner vergleichen, bei Gleichstand Einer.
// Wir bevorzugen darum Paare mit GLEICHEN Zehnern (z.B. 47 vs 42) — das
// ist der lehrreichere Fall.

import type { Exercise, Level } from "./types";
import { exerciseId, randInt } from "./types";
import { vignetteCompare } from "./vignettes";

type CompareForm = "larger" | "smaller";

/**
 * Erzeugt eine Vergleichs-Aufgabe.
 * - "easy": einstellige + zweistellige Zahlen (offensichtlich verschieden).
 * - "normal": zweistellige mit ~50% gleichen Zehnern.
 * - "hard": zweistellige mit ~80% gleichen Zehnern (Einer entscheiden).
 */
export function generateCompare100(level: Level = "normal"): Exercise {
  const [left, right] = pickPair(level);
  const form: CompareForm = Math.random() < 0.65 ? "larger" : "smaller";
  const answer = form === "larger" ? Math.max(left, right) : Math.min(left, right);
  const askLarger = form === "larger";

  const vignette = vignetteCompare({ left, right, askLarger });
  const prompt = askLarger
    ? `Welche Zahl ist größer: ${left} oder ${right}?`
    : `Welche Zahl ist kleiner: ${left} oder ${right}?`;

  return {
    id: exerciseId("cmp"),
    skill: "compare100",
    prompt,
    vignette,
    visual: { kind: "compare", left, right },
    correctAnswer: answer,
    hint: hintFor(left, right, form),
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

function hintFor(left: number, right: number, form: CompareForm): string {
  const tensL = Math.floor(left / 10);
  const tensR = Math.floor(right / 10);
  if (tensL === tensR) {
    return form === "larger"
      ? "Beide haben gleich viele Zehner — schau die Einer an."
      : "Gleiche Zehner. Welche Einerstelle ist kleiner?";
  }
  return form === "larger"
    ? "Schau zuerst die Zehner — wer mehr Zehner hat, ist größer."
    : "Schau die Zehner — wer weniger Zehner hat, ist kleiner.";
}
