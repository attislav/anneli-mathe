// Barrel-Export für die Aufgaben-Generatoren plus Dispatcher.
//
// Stand 2026-05-27:
//   Kapitel 1 (Sky Kingdom): counting20, addition20, subtraction20,
//     compare100, tensNeighbors, doubleHalf — alle 6 implementiert.
//   Zusatz-Skills Kapitel 1 (M5): decompose20, visualCompare20 — Generator-only.
//   Kapitel 2 (Pfirsich-Wüste, M3): addSub100, money, wordProblems100
//     — Generator-only (Brücken-JSONs folgen später).
//
// Jeder Generator akzeptiert optional ein Level ("easy" | "normal" | "hard"),
// gesteuert vom Adaptive-System in BridgeChallenge.

import type { Skill } from "@/data/bridges";
import { generateCounting20 } from "./counting20";
import { generateAddition20 } from "./addition20";
import { generateSubtraction20 } from "./subtraction20";
import { generateCompare100 } from "./compare100";
import { generateTensNeighbors } from "./tensNeighbors";
import { generateDoubleHalf } from "./doubleHalf";
import { generateAddSub100 } from "./addSub100";
import { generateMoney } from "./money";
import { generateWordProblems100 } from "./wordProblems100";
import { generateDecompose20 } from "./decompose20";
import { generateVisualCompare20 } from "./visualCompare20";
import type { Exercise, Level } from "./types";

export type { Exercise, ExerciseVisual, ExerciseVariant, Level } from "./types";
export { generateCounting20 } from "./counting20";
export { generateAddition20 } from "./addition20";
export { generateSubtraction20 } from "./subtraction20";
export { generateCompare100 } from "./compare100";
export { generateTensNeighbors } from "./tensNeighbors";
export { generateDoubleHalf } from "./doubleHalf";
export { generateAddSub100 } from "./addSub100";
export { generateMoney } from "./money";
export { generateWordProblems100 } from "./wordProblems100";
export { generateDecompose20 } from "./decompose20";
export { generateVisualCompare20 } from "./visualCompare20";

/**
 * True, wenn für diesen Skill bereits ein Generator existiert.
 * Aktuell true für alle 11 Skills.
 */
export function hasGeneratorFor(skill: Skill): boolean {
  switch (skill) {
    case "counting20":
    case "addition20":
    case "subtraction20":
    case "compare100":
    case "tensNeighbors":
    case "doubleHalf":
    case "addSub100":
    case "money":
    case "wordProblems100":
    case "decompose20":
    case "visualCompare20":
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
    case "addSub100":
      return generateAddSub100(level);
    case "money":
      return generateMoney(level);
    case "wordProblems100":
      return generateWordProblems100(level);
    case "decompose20":
      return generateDecompose20(level);
    case "visualCompare20":
      return generateVisualCompare20(level);
    default: {
      // Compile-time Erschöpfung: wenn ein neuer Skill hinzukommt,
      // beschwert sich TS hier — kein stilles Durchrutschen.
      const _exhaustive: never = skill;
      throw new Error(`generateExercise: unknown skill ${String(_exhaustive)}`);
    }
  }
}
