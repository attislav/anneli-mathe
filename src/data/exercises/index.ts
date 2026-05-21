// Barrel-Export für die Aufgaben-Generatoren plus Dispatcher.
//
// Stand 2026-05-21: drei von sechs Generatoren implementiert.
// Die fehlenden (`compare100`, `tensNeighbors`, `doubleHalf`) folgen in
// späteren Sprint-Slots — bis dahin wirft der Dispatcher einen klaren
// Fehler, damit das in der UI nicht stillschweigend zu falschem Verhalten
// führt.

import type { Skill } from "@/data/bridges";
import { generateCounting20 } from "./counting20";
import { generateAddition20 } from "./addition20";
import { generateSubtraction20 } from "./subtraction20";
import type { Exercise } from "./types";

export type { Exercise, ExerciseVisual } from "./types";
export { generateCounting20 } from "./counting20";
export { generateAddition20 } from "./addition20";
export { generateSubtraction20 } from "./subtraction20";

/**
 * True, wenn für diesen Skill bereits ein Generator existiert.
 * BridgeChallenge kann damit entscheiden, ob es den echten Generator
 * oder den alten Placeholder benutzt.
 */
export function hasGeneratorFor(skill: Skill): boolean {
  return skill === "counting20" || skill === "addition20" || skill === "subtraction20";
}

/**
 * Erzeugt eine neue Aufgabe für den gegebenen Skill.
 * Wirft, wenn der Skill noch keinen Generator hat — die UI soll
 * vorher `hasGeneratorFor` prüfen.
 */
export function generateExercise(skill: Skill): Exercise {
  switch (skill) {
    case "counting20":
      return generateCounting20();
    case "addition20":
      return generateAddition20();
    case "subtraction20":
      return generateSubtraction20();
    default:
      throw new Error(`generateExercise: no generator yet for skill "${skill}"`);
  }
}

// TODO(autonight): Vitest/Jest aktuell nicht im Stack. Bevor weitere
// Generatoren dazukommen, mindestens eine Test-Infrastruktur entscheiden
// (Vitest würde sich gut mit Next 16/Tailwind 4 vertragen). Geplante Tests:
//   - generateCounting20: total in [6,20], groups summieren zu total
//   - generateAddition20: a+b ≤ 20, correctAnswer paßt zur Form
//   - generateSubtraction20: 0 ≤ diff ≤ 18, correctAnswer paßt zur Form
