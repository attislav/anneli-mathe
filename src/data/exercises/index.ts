// Barrel-Export für die Aufgaben-Generatoren plus Dispatcher.
//
// Stand 2026-05-21: alle sechs Generatoren implementiert.
// Jeder Generator akzeptiert optional ein Level ("easy" | "normal" | "hard"),
// gesteuert vom Adaptive-System in BridgeChallenge.

import type { Skill } from "@/data/bridges";
import { generateCounting20 } from "./counting20";
import { generateAddition20 } from "./addition20";
import { generateSubtraction20 } from "./subtraction20";
import { generateCompare100 } from "./compare100";
import { generateTensNeighbors } from "./tensNeighbors";
import { generateDoubleHalf } from "./doubleHalf";
import type { Exercise, Level } from "./types";

export type { Exercise, ExerciseVisual, ExerciseVariant, Level } from "./types";
export { generateCounting20 } from "./counting20";
export { generateAddition20 } from "./addition20";
export { generateSubtraction20 } from "./subtraction20";
export { generateCompare100 } from "./compare100";
export { generateTensNeighbors } from "./tensNeighbors";
export { generateDoubleHalf } from "./doubleHalf";

/**
 * True, wenn für diesen Skill bereits ein Generator existiert.
 * Aktuell true für alle Skills aus Kapitel 1.
 */
export function hasGeneratorFor(skill: Skill): boolean {
  switch (skill) {
    case "counting20":
    case "addition20":
    case "subtraction20":
    case "compare100":
    case "tensNeighbors":
    case "doubleHalf":
      return true;
    default:
      return false;
  }
}

/**
 * Erzeugt eine neue Aufgabe für den gegebenen Skill auf dem gewünschten Level.
 */
export function generateExercise(skill: Skill, level: Level = "normal"): Exercise {
  switch (skill) {
    case "counting20":
      return generateCounting20(level);
    case "addition20":
      return generateAddition20(level);
    case "subtraction20":
      return generateSubtraction20(level);
    case "compare100":
      return generateCompare100(level);
    case "tensNeighbors":
      return generateTensNeighbors(level);
    case "doubleHalf":
      return generateDoubleHalf(level);
    default: {
      // Compile-time Erschöpfung: wenn ein neuer Skill hinzukommt,
      // beschwert sich TS hier — kein stilles Durchrutschen.
      const _exhaustive: never = skill;
      throw new Error(`generateExercise: unknown skill ${String(_exhaustive)}`);
    }
  }
}
