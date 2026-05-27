// Zerlegen bis 20 — Klasse 1 / Übergang Klasse 2.
//
// Pädagogisches Ziel:
//   Zerlegen einer Zahl in zwei Summanden — die Grundlage des Zehnerübergangs.
//   "8 = 5 + ?", "10 = 3 + ?", "14 = 8 + ?".
//   Eine sichere Zerlegung der 10 ist die wichtigste Klasse-1-Fähigkeit für
//   späteren Plus/Minus-mit-Übergang.
//
// Varianten:
//   - "gap-b"      : a + ? = total  (Standard)  — z.B. "5 + ? = 8"
//   - "gap-a"      : ? + b = total  (selten, sonst zu nah an gap-b)
//   - "decomp"     : "Zerlege 10 in zwei Teile. Eine Hälfte ist 4. Wie groß
//                    ist die andere?"  (sprachlicher Frame, sonst wie gap-b)
//   - "ten-pair"   : nur Zehner-Paare (3+? = 10) — easy-default,
//                    der pädagogisch wichtigste Fall.
//
// Level-Verteilung:
//   easy:   60 % ten-pair, 30 % gap-b (total ≤ 10), 10 % decomp.
//   normal: 25 % ten-pair, 45 % gap-b, 20 % decomp, 10 % gap-a. total ≤ 20.
//   hard:   10 % ten-pair, 40 % gap-b, 25 % gap-a, 25 % decomp. total 11..20.

import type { Exercise, Level } from "./types";
import { exerciseId, randInt } from "./types";
import { vignetteDecompose20 } from "./vignettes";

type Form = "gap-b" | "gap-a" | "decomp" | "ten-pair";

export function generateDecompose20(level: Level = "normal"): Exercise {
  const form = pickForm(level);
  const [total, a, b] = pickValues(level, form);

  if (form === "ten-pair") {
    // total = 10 garantiert, prompt = "a + ? = 10"
    return {
      id: exerciseId("dec"),
      skill: "decompose20",
      prompt: `${a} + ? = 10`,
      vignette: vignetteDecompose20({ total, a, b, form }),
      correctAnswer: b,
      hint: hintTenPair(a),
      level,
      variant: "gap-b",
    };
  }

  if (form === "gap-a") {
    return {
      id: exerciseId("dec"),
      skill: "decompose20",
      prompt: `? + ${b} = ${total}`,
      vignette: vignetteDecompose20({ total, a, b, form }),
      correctAnswer: a,
      hint: `Was ergibt mit ${b} zusammen ${total}?`,
      level,
      variant: "gap-a",
    };
  }

  if (form === "decomp") {
    // Sprachliche Frage: "Zerlege total in zwei Teile. Eine ist a. Wie groß ist die andere?"
    return {
      id: exerciseId("dec"),
      skill: "decompose20",
      prompt: `Zerlege ${total} in zwei Teile.\nEin Teil ist ${a}. Wie groß ist der andere?`,
      vignette: vignetteDecompose20({ total, a, b, form }),
      correctAnswer: b,
      hint: hintFor(total, a),
      level,
      variant: "context",
    };
  }

  // form === "gap-b"
  return {
    id: exerciseId("dec"),
    skill: "decompose20",
    prompt: `${a} + ? = ${total}`,
    vignette: vignetteDecompose20({ total, a, b, form }),
    correctAnswer: b,
    hint: hintFor(total, a),
    level,
    variant: "gap-b",
  };
}

function pickForm(level: Level): Form {
  const r = Math.random();
  if (level === "easy") {
    if (r < 0.6) return "ten-pair";
    if (r < 0.9) return "gap-b";
    return "decomp";
  }
  if (level === "hard") {
    if (r < 0.1) return "ten-pair";
    if (r < 0.5) return "gap-b";
    if (r < 0.75) return "gap-a";
    return "decomp";
  }
  // normal
  if (r < 0.25) return "ten-pair";
  if (r < 0.7) return "gap-b";
  if (r < 0.9) return "decomp";
  return "gap-a";
}

function pickValues(level: Level, form: Form): [number, number, number] {
  // [total, a, b] mit a + b = total

  if (form === "ten-pair") {
    const a = randInt(1, 9);
    return [10, a, 10 - a];
  }

  const totalRange: [number, number] =
    level === "easy" ? [5, 10] : level === "hard" ? [11, 20] : [8, 18];

  const total = randInt(totalRange[0], totalRange[1]);

  // a zwischen 1 und total-1, b ist der Rest.
  // Für „decomp"-Frame: ausschließen dass a == total/2 (zu „trivial-symmetrisch") außer easy.
  let a = randInt(1, total - 1);
  if (form === "decomp" && level !== "easy" && total % 2 === 0 && a === total / 2) {
    a = a + (Math.random() < 0.5 ? -1 : 1);
    if (a < 1) a = 1;
    if (a > total - 1) a = total - 1;
  }
  return [total, a, total - a];
}

function hintTenPair(a: number): string {
  if (a === 5) return "5 und 5 sind zusammen die 10.";
  if (a < 5) return `${a} braucht noch viel — denk an deine Finger: wenn ${a} unten sind, sind ${10 - a} oben.`;
  return `${a} ist schon nah an der 10. Zähl: ${a + 1}, ${a + 2}, ${a + 3} …`;
}

function hintFor(total: number, a: number): string {
  if (total === 10) return hintTenPair(a);
  if (total <= 10) return `${a} und wie viele machen ${total}? Zähl mit den Fingern.`;
  // total > 10: über Zehnerübergang denken
  const toTen = 10 - a;
  if (a < 10 && toTen > 0) {
    return `Erst von ${a} bis zur 10 — das sind ${toTen}. Dann ${total - 10} weiter.`;
  }
  return `Zähl von ${a} weiter bis ${total}.`;
}
