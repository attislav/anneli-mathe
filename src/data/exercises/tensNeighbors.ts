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

import type { Exercise, Level } from "./types";
import { exerciseId, randInt } from "./types";
import { vignetteNeighbor } from "./vignettes";

/**
 * Erzeugt eine Zehnernachbar-Aufgabe.
 * - "easy": Zahl ist nahe an einem Zehner (z.B. 42 → 40; 49 → 50).
 * - "normal": Zahl liegt mittig zwischen zwei Zehnern (z.B. 46, 53).
 * - "hard": Zahlen über 60 + bevorzugt das schwierigere "davor"/"danach"-Paar.
 */
export function generateTensNeighbors(level: Level = "normal"): Exercise {
  const value = pickValue(level);
  const neighbor: "before" | "after" = Math.random() < 0.5 ? "before" : "after";
  const tensFloor = Math.floor(value / 10) * 10;
  const tensCeil = tensFloor + 10;
  const correct = neighbor === "before" ? tensFloor : tensCeil;

  const vignette = vignetteNeighbor({ value, neighbor });
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
  };
}

function pickValue(level: Level): number {
  if (level === "easy") {
    // Knapp an einem Zehner: 1 weg vom unteren oder oberen Zehner.
    const tens = randInt(2, 8); // 20..80
    const ones = Math.random() < 0.5 ? randInt(1, 2) : randInt(8, 9);
    return tens * 10 + ones;
  }

  if (level === "hard") {
    // Zahlen 51..99, Mittelbereich 4..6 oder 5..7 der Einer.
    const tens = randInt(5, 9);
    const ones = randInt(3, 7);
    return tens * 10 + ones;
  }

  // normal: 21..89, beliebige Einer 1..9
  const tens = randInt(2, 8);
  const ones = randInt(1, 9);
  return tens * 10 + ones;
}
