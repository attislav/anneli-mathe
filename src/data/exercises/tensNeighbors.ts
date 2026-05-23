// Zehnernachbarn im Hunderterraum.
// Niveau: Klasse 2.
//
// Mechanik: Eine zweistellige Zahl ist gegeben (z.B. 47). Gefragt ist:
//   - der nächste Zehner DANACH (50) oder
//   - der nächste Zehner DAVOR (40)
//
// Spezialfälle:
//   - reine Zehnerzahlen (z.B. 40) haben "davor" = 30 und "danach" = 50.
//     Damit das eindeutig bleibt, vermeiden wir reine Zehner als Input.
//
// Varianten (M1, 2026-05-23):
//   - "plain"        : Standard-Zehnernachbar (vorher/danach)
//   - "step-before"  : "Welche Zahl liegt 5 vor X?"
//   - "step-after"   : "Welche Zahl liegt 5 nach X?"
//   - "closer-tens"  : "Welcher Zehner ist näher — der davor oder der danach?"
//
// Verteilung:
//   easy:   85 % plain, 15 % step-*
//   normal: 60 % plain, 25 % step-*, 15 % closer-tens
//   hard:   40 % plain, 30 % step-*, 30 % closer-tens

import type { Exercise, Level } from "./types";
import { exerciseId, randInt } from "./types";
import { vignetteNeighbor } from "./vignettes";

type Variant = "plain" | "step-before" | "step-after" | "closer-tens";

/**
 * Erzeugt eine Zehnernachbar-Aufgabe.
 */
export function generateTensNeighbors(level: Level = "normal"): Exercise {
  const variant = pickVariant(level);
  if (variant === "step-before") return buildStep(level, "before");
  if (variant === "step-after") return buildStep(level, "after");
  if (variant === "closer-tens") return buildCloserTens(level);
  return buildPlain(level);
}

function pickVariant(level: Level): Variant {
  const r = Math.random();
  if (level === "easy") {
    if (r < 0.85) return "plain";
    return Math.random() < 0.5 ? "step-before" : "step-after";
  }
  if (level === "hard") {
    if (r < 0.4) return "plain";
    if (r < 0.7) return Math.random() < 0.5 ? "step-before" : "step-after";
    return "closer-tens";
  }
  // normal
  if (r < 0.6) return "plain";
  if (r < 0.85) return Math.random() < 0.5 ? "step-before" : "step-after";
  return "closer-tens";
}

function buildPlain(level: Level): Exercise {
  const value = pickValue(level);
  const neighbor: "before" | "after" = Math.random() < 0.5 ? "before" : "after";
  const tensFloor = Math.floor(value / 10) * 10;
  const tensCeil = tensFloor + 10;
  const correct = neighbor === "before" ? tensFloor : tensCeil;

  const vignette = vignetteNeighbor({ value, neighbor, variant: "tens" });
  const prompt =
    neighbor === "after"
      ? `Welcher Zehner kommt direkt nach ${value}?`
      : `Welcher Zehner liegt direkt vor ${value}?`;

  return {
    id: exerciseId("nb"),
    skill: "tensNeighbors",
    prompt,
    vignette,
    visual: {
      kind: "number-line",
      from: Math.max(0, tensFloor - 5),
      to: Math.min(100, tensCeil + 5),
      markers: [tensFloor, tensCeil],
    },
    correctAnswer: correct,
    hint:
      neighbor === "after"
        ? "Welcher Zehner kommt nach dieser Zahl? Schau auf den vollen Zehner über dir."
        : "Welcher Zehner liegt direkt unter dieser Zahl?",
    level,
    variant: "plain",
  };
}

function buildStep(level: Level, direction: "before" | "after"): Exercise {
  // Welche Zahl liegt 5 vor/nach X? Wir wählen X so, dass die Antwort in [0, 100] bleibt.
  let value: number;
  if (level === "easy") value = randInt(10, 30);
  else if (level === "hard") value = randInt(40, 90);
  else value = randInt(15, 70);

  const correct = direction === "after" ? value + 5 : value - 5;

  // Visuals: number-line um value herum.
  const lo = Math.max(0, value - 10);
  const hi = Math.min(100, value + 10);

  const vignette = vignetteNeighbor({
    value,
    neighbor: direction,
    variant: "step-5",
  });
  const prompt =
    direction === "after"
      ? `Welche Zahl liegt 5 NACH ${value}?`
      : `Welche Zahl liegt 5 VOR ${value}?`;

  return {
    id: exerciseId("nb"),
    skill: "tensNeighbors",
    prompt,
    vignette,
    visual: { kind: "number-line", from: lo, to: hi, markers: [value, correct] },
    correctAnswer: correct,
    hint:
      direction === "after"
        ? "Fünf weiter zählen — ein Sprung weiter als zur nächsten Hand."
        : "Fünf zurück — ein halber Zehner-Sprung.",
    level,
    variant: direction === "after" ? "step-after" : "step-before",
  };
}

function buildCloserTens(level: Level): Exercise {
  // Welcher Zehner ist näher: der davor oder der danach?
  // Wir wählen einen Wert NICHT-genau-bei-5 (damit eindeutig).
  let value: number;
  while (true) {
    const tens = level === "easy" ? randInt(2, 5) : level === "hard" ? randInt(5, 9) : randInt(2, 8);
    const ones = randInt(1, 9);
    if (ones === 5) continue; // mittig → nicht eindeutig
    value = tens * 10 + ones;
    break;
  }

  const tensFloor = Math.floor(value / 10) * 10;
  const tensCeil = tensFloor + 10;
  const onesPart = value - tensFloor;
  // Näher ist der Zehner, dessen Abstand kleiner ist.
  const closer = onesPart < 5 ? tensFloor : tensCeil;

  const vignette = vignetteNeighbor({ value, neighbor: "after", variant: "closer-tens" });
  const prompt = `Welcher Zehner ist NÄHER an ${value}?\n${tensFloor} oder ${tensCeil}?`;

  return {
    id: exerciseId("nb"),
    skill: "tensNeighbors",
    prompt,
    vignette,
    visual: {
      kind: "number-line",
      from: Math.max(0, tensFloor - 2),
      to: Math.min(100, tensCeil + 2),
      markers: [tensFloor, tensCeil],
    },
    correctAnswer: closer,
    hint: "Zähl die Schritte zu jedem Zehner. Wer hat den kürzeren Weg?",
    level,
    variant: "closer-tens",
  };
}

function pickValue(level: Level): number {
  if (level === "easy") {
    const tens = randInt(2, 8);
    const ones = Math.random() < 0.5 ? randInt(1, 2) : randInt(8, 9);
    return tens * 10 + ones;
  }

  if (level === "hard") {
    const tens = randInt(5, 9);
    const ones = randInt(3, 7);
    return tens * 10 + ones;
  }

  const tens = randInt(2, 8);
  const ones = randInt(1, 9);
  return tens * 10 + ones;
}
