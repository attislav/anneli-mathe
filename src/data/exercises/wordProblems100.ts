// Sachaufgaben bis 100 — Kapitel 2 Pfirsich-Wüste.
//
// Pädagogisches Ziel:
//   Aus einem Mini-Text die richtige Rechenoperation erkennen
//   und die Aufgabe lösen. Klassisches Klasse-2-Format.
//
// Format:
//   Der Prompt IST die Sachaufgabe — kein nackter Term, keine zusätzlichen
//   Visualisierungen. Vignette und Prompt sind hier identisch (die Vignette
//   trägt den Aufgaben-Text), darüber zeigt die UI keinen extra Story-Beat.
//
// Stufen (Level):
//   easy:   1-Schritt-Aufgabe, Zahlen 5..30, oft Plus.
//   normal: 1-Schritt-Aufgabe, Zahlen 10..70, Plus + Minus gleich verteilt.
//   hard:   Zahlen bis 99, oft mit Zehnerübergang, ggf. zwei-Schritt-Hinweis
//           (z.B. „… und dann …").
//
// Variante (`context`) markiert die Aufgabe als Sachaufgabe.

import type { Exercise, Level } from "./types";
import { exerciseId, randInt } from "./types";
import { vignetteWordProblem } from "./vignettes";

type Op = "plus" | "minus";

export function generateWordProblems100(level: Level = "normal"): Exercise {
  const op: Op = level === "easy"
    ? Math.random() < 0.7 ? "plus" : "minus"
    : Math.random() < 0.5 ? "plus" : "minus";

  const [a, b, result] = pickPair(level, op);
  const text = vignetteWordProblem({ a, b, result, op });

  // Prompt = der Sachaufgaben-Text selbst.
  return {
    id: exerciseId("wp100"),
    skill: "wordProblems100",
    // Vignette UND Prompt — die UI rendert Vignette eh oberhalb des Prompts;
    // wir zeigen den Text einmal als Vignette, im Prompt fragen wir explizit
    // nach der Zahl. Doppelung vermeiden.
    prompt: `Frage: Wie viele?`,
    vignette: text,
    correctAnswer: result,
    hint: hintFor(op, a, b),
    level,
    variant: "context",
  };
}

function pickPair(level: Level, op: Op): [number, number, number] {
  const [min, max] = rangeFor(level);

  if (op === "plus") {
    for (let i = 0; i < 30; i++) {
      const a = randInt(min, max);
      const b = randInt(min, max);
      if (a + b <= 99 && a + b >= min) return [a, b, a + b];
    }
    return [10, 15, 25];
  }
  for (let i = 0; i < 30; i++) {
    const a = randInt(min + 5, max);
    const b = randInt(min, a - min);
    if (a - b >= 0) return [a, b, a - b];
  }
  return [20, 10, 10];
}

function rangeFor(level: Level): [number, number] {
  if (level === "easy") return [5, 30];
  if (level === "hard") return [10, 90];
  return [10, 70];
}

function hintFor(op: Op, a: number, b: number): string {
  if (op === "plus") {
    return `Wie viele zusammen? — Rechne ${a} + ${b}.`;
  }
  return `Wie viele bleiben? — Rechne ${a} − ${b}.`;
}
