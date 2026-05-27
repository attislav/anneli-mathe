// Visuell-vergleichen bis 20 — Klasse 1.
//
// Pädagogisches Ziel:
//   Mengen mit den Augen erfassen und vergleichen — OHNE Zahlen.
//   Kind sieht zwei (oder drei) Mengen-Cluster ("Wolken mit Vögeln", "Nester
//   mit Eiern") und entscheidet welche Menge größer/kleiner ist.
//
//   Das ist das Vor-Stufe zu compare100 und übt subitizing (Mengen ohne
//   Zählen erkennen) + Mengen-Vergleich.
//
// Mechanik:
//   - Vom Visual her: `{ kind: "stones", groups: [N1, N2] }` (oder 3 Werte
//     bei "multi-pick"). Der bestehende `TapCountInput` rendert das schon
//     mit Cluster-Layout — eine UI-spezifische Komponente kann später
//     hübschere Visuals liefern.
//   - Antwort kodiert als position: 0 = linke Menge, 1 = rechte Menge, 2 = mittlere.
//     Bei "equal"-Frage: -1 = gleich.
//
// Varianten:
//   - "pair-more"   : 2 Mengen, „welche ist mehr?" (Standard, easy/normal)
//   - "pair-less"   : 2 Mengen, „welche ist weniger?"
//   - "multi-pick"  : 3 Mengen, „welche ist die größte?"
//   - "equal-check" : 2 Mengen, „sind beide gleich viele? Ja/Nein"
//                      → kodiert correctAnswer als 1 (gleich) oder 0 (ungleich).
//
// Level-Verteilung:
//   easy:   80 % pair-more, 20 % pair-less. Werte 2..12. Mindestabstand 3.
//   normal: 50 % pair-more, 25 % pair-less, 15 % multi-pick, 10 % equal-check.
//             Werte 3..18. Mindestabstand 1.
//   hard:   30 % pair-more, 20 % pair-less, 30 % multi-pick, 20 % equal-check.
//             Werte 5..20. Mindestabstand 0 (gleich möglich).
//
// HINWEIS: Da das aktuelle Input-System keine direkte "welche von 2 Wolken
// klick"-Komponente hat, präsentieren wir die Aufgabe in der bestehenden
// Number-Keypad/Comp-Symbol-Input-Pipeline: Kind tippt die Anzahl der
// größeren/kleineren Menge ein. Das ist nicht ideal, aber funktioniert
// stand-alone. Eine dedizierte "TapMenge"-Komponente ist im Backlog.

import type { Exercise, ExerciseVariant, Level } from "./types";
import { exerciseId, randInt } from "./types";
import { vignetteVisualCompare20 } from "./vignettes";

type Form = "pair-more" | "pair-less" | "multi-pick" | "equal-check";

export function generateVisualCompare20(level: Level = "normal"): Exercise {
  const form = pickForm(level);

  if (form === "equal-check") return buildEqualCheck(level);
  if (form === "multi-pick") return buildMultiPick(level);
  return buildPair(level, form);
}

function pickForm(level: Level): Form {
  const r = Math.random();
  if (level === "easy") {
    if (r < 0.8) return "pair-more";
    return "pair-less";
  }
  if (level === "hard") {
    if (r < 0.3) return "pair-more";
    if (r < 0.5) return "pair-less";
    if (r < 0.8) return "multi-pick";
    return "equal-check";
  }
  // normal
  if (r < 0.5) return "pair-more";
  if (r < 0.75) return "pair-less";
  if (r < 0.9) return "multi-pick";
  return "equal-check";
}

function buildPair(level: Level, form: "pair-more" | "pair-less"): Exercise {
  const [a, b] = pickPair(level);
  // Kind tippt die Anzahl der gefragten Menge ein.
  const correctAnswer = form === "pair-more" ? Math.max(a, b) : Math.min(a, b);

  const prompt =
    form === "pair-more"
      ? `Welche Menge hat mehr?\nTippe die Anzahl ein.`
      : `Welche Menge hat weniger?\nTippe die Anzahl ein.`;

  return {
    id: exerciseId("vc20"),
    skill: "visualCompare20",
    prompt,
    vignette: vignetteVisualCompare20({ a, b, form, ask: form === "pair-more" ? "more" : "less" }),
    visual: { kind: "stones", groups: [a, b] },
    correctAnswer,
    hint: form === "pair-more"
      ? "Schau, welche Wolke mehr Vögel trägt — zähl wenn du dir unsicher bist."
      : "Welche hat weniger? Manchmal hilft es, paarweise zuzuordnen.",
    level,
    variant: "set-compare" satisfies ExerciseVariant,
  };
}

function buildMultiPick(level: Level): Exercise {
  const values = pickThree(level);
  const sorted = [...values].sort((a, b) => a - b);
  const askLargest = Math.random() < 0.6;
  const correctAnswer = askLargest ? sorted[2] : sorted[0];

  const prompt = askLargest
    ? `Drei Wolken, drei Mengen. Welche ist die größte?\nTippe die Anzahl ein.`
    : `Drei Wolken, drei Mengen. Welche ist die kleinste?\nTippe die Anzahl ein.`;

  return {
    id: exerciseId("vc20"),
    skill: "visualCompare20",
    prompt,
    vignette: vignetteVisualCompare20({
      a: values[0],
      b: values[1],
      c: values[2],
      form: "multi-pick",
      ask: askLargest ? "more" : "less",
    }),
    visual: { kind: "stones", groups: values },
    correctAnswer,
    hint: "Vergleiche zwei, dann den Sieger mit der dritten Menge.",
    level,
    variant: "multi-pick" satisfies ExerciseVariant,
  };
}

function buildEqualCheck(level: Level): Exercise {
  const wantEqual = Math.random() < 0.5;

  const a = randInt(level === "easy" ? 3 : 4, level === "hard" ? 18 : 14);
  let b: number;
  if (wantEqual) {
    b = a;
  } else {
    // dicht dran, damit's nicht trivial wird
    const delta = randInt(1, 2);
    b = Math.random() < 0.5 ? a + delta : a - delta;
    if (b < 1) b = 1;
  }

  // Antwort: 1 = gleich (ja), 0 = ungleich (nein)
  const correctAnswer = a === b ? 1 : 0;

  const prompt = `Sind beide Wolken gleich voll?\nTippe 1 für „ja", 0 für „nein".`;

  return {
    id: exerciseId("vc20"),
    skill: "visualCompare20",
    prompt,
    vignette: vignetteVisualCompare20({ a, b, form: "equal-check", ask: "equal" }),
    visual: { kind: "stones", groups: [a, b] },
    correctAnswer,
    hint: "Wenn beide gleich aussehen — kontroll-zähl einmal. Dann weißt du es genau.",
    level,
    variant: "set-compare" satisfies ExerciseVariant,
  };
}

function pickPair(level: Level): [number, number] {
  const [min, max] = level === "easy" ? [2, 12] : level === "hard" ? [5, 20] : [3, 18];
  const minDelta = level === "easy" ? 3 : level === "hard" ? 1 : 1;

  for (let i = 0; i < 40; i++) {
    const a = randInt(min, max);
    const b = randInt(min, max);
    if (Math.abs(a - b) >= minDelta) return [a, b];
  }
  // Fallback
  return [4, 8];
}

function pickThree(level: Level): number[] {
  const [min, max] = level === "easy" ? [3, 12] : level === "hard" ? [5, 20] : [3, 18];
  const set = new Set<number>();
  while (set.size < 3) {
    set.add(randInt(min, max));
  }
  return [...set];
}
