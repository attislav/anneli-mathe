// Verdoppeln und Halbieren bis 100.
// Niveau: Klasse 2.
//
// Mechanik: gegeben eine Zahl, gefragt ist das Doppelte ODER die Hälfte.
// Halbieren funktioniert nur sauber für gerade Zahlen — wir generieren
// daher Halbierungs-Aufgaben nur mit geraden Werten.
//
// Varianten (M1, 2026-05-23):
//   - "plain"     : Standard verdoppeln/halbieren
//   - "quarter"   : Hälfte von Hälfte = Viertel (value/4, value muss durch 4 teilbar)
//   - "quadruple" : Doppelt von Doppelt = ×4
//   - "mix"       : Anneli verdoppelt X, Pip halbiert das Ergebnis → bleibt X.
//                   ABER: wir variieren mit Offset, sodass das Ergebnis nicht
//                   trivial dasselbe ist. Variante: "verdoppelt, dann halbiert" =
//                   wieder X (lehrreich: Operationen heben sich auf!). Variante
//                   B: "halbiert, dann verdoppelt + 2" = X+2.
//
// Verteilung:
//   easy:   90 % plain, 10 % quarter/quadruple
//   normal: 65 % plain, 15 % quarter, 10 % quadruple, 10 % mix
//   hard:   40 % plain, 20 % quarter, 20 % quadruple, 20 % mix

import type { Exercise, Level } from "./types";
import { exerciseId, randInt } from "./types";
import { vignetteDoubleHalf } from "./vignettes";

type Mode = "double" | "half";
type Variant = "plain" | "quarter" | "quadruple" | "mix";

/**
 * Erzeugt eine Verdoppeln/Halbieren-Aufgabe.
 */
export function generateDoubleHalf(level: Level = "normal"): Exercise {
  const variant = pickVariant(level);
  if (variant === "quarter") return buildQuarter(level);
  if (variant === "quadruple") return buildQuadruple(level);
  if (variant === "mix") return buildMix(level);
  return buildPlain(level);
}

function pickVariant(level: Level): Variant {
  const r = Math.random();
  if (level === "easy") {
    if (r < 0.9) return "plain";
    return Math.random() < 0.5 ? "quarter" : "quadruple";
  }
  if (level === "hard") {
    if (r < 0.4) return "plain";
    if (r < 0.6) return "quarter";
    if (r < 0.8) return "quadruple";
    return "mix";
  }
  // normal
  if (r < 0.65) return "plain";
  if (r < 0.8) return "quarter";
  if (r < 0.9) return "quadruple";
  return "mix";
}

function buildPlain(level: Level): Exercise {
  const mode: Mode = Math.random() < 0.5 ? "double" : "half";
  const value = pickValue(mode, level);
  const correct = mode === "double" ? value * 2 : value / 2;

  const vignette = vignetteDoubleHalf({ value, mode, variant: "plain" });
  const prompt =
    mode === "double" ? `Das Doppelte von ${value} ist?` : `Die Hälfte von ${value} ist?`;

  return {
    id: exerciseId("dh"),
    skill: "doubleHalf",
    prompt,
    vignette,
    visual: { kind: "mirror", value, mode },
    correctAnswer: correct,
    hint: hintFor(mode, value),
    level,
    variant: "plain",
  };
}

function buildQuarter(level: Level): Exercise {
  // Hälfte von Hälfte → muss durch 4 teilbar sein.
  let value: number;
  if (level === "easy") value = randInt(1, 5) * 4; // 4..20
  else if (level === "hard") value = randInt(6, 20) * 4; // 24..80
  else value = randInt(3, 12) * 4; // 12..48

  const correct = value / 4;

  const vignette = vignetteDoubleHalf({ value, mode: "half", variant: "quarter" });
  const prompt = `Die Hälfte von der Hälfte von ${value} ist?`;

  return {
    id: exerciseId("dh"),
    skill: "doubleHalf",
    prompt,
    vignette,
    visual: { kind: "mirror", value, mode: "half" },
    correctAnswer: correct,
    hint: `Erst halbieren: ${value / 2}. Dann nochmal halbieren.`,
    level,
    variant: "quarter",
  };
}

function buildQuadruple(level: Level): Exercise {
  // Doppelt von Doppelt → value × 4. Begrenzung so dass 4×value ≤ 100.
  let value: number;
  if (level === "easy") value = randInt(2, 6); // 8..24
  else if (level === "hard") value = randInt(10, 24); // 40..96
  else value = randInt(5, 15); // 20..60

  const correct = value * 4;

  const vignette = vignetteDoubleHalf({ value, mode: "double", variant: "quadruple" });
  const prompt = `Das Doppelte vom Doppelten von ${value} ist?`;

  return {
    id: exerciseId("dh"),
    skill: "doubleHalf",
    prompt,
    vignette,
    visual: { kind: "mirror", value, mode: "double" },
    correctAnswer: correct,
    hint: `Erst verdoppeln: ${value * 2}. Dann nochmal verdoppeln.`,
    level,
    variant: "quadruple",
  };
}

function buildMix(level: Level): Exercise {
  // Anneli verdoppelt X, Pip halbiert das Ergebnis — Antwort ist X selbst.
  // Variation: 50% reine "verdoppelt-dann-halbiert" (Antwort = X),
  //            50% "halbiert-dann-verdoppelt" (X gerade, Antwort = X).
  let value: number;
  if (level === "easy") value = randInt(4, 12);
  else if (level === "hard") value = randInt(20, 50);
  else value = randInt(8, 30);

  // Für die "halbiert-dann-verdoppelt"-Variante muss value gerade sein.
  // Sicherheitshalber gerade machen.
  if (value % 2 !== 0) value += 1;

  const flavor: "double-then-half" | "half-then-double" = Math.random() < 0.5
    ? "double-then-half"
    : "half-then-double";

  const correct = value; // beide Operationen heben sich auf

  const vignette = vignetteDoubleHalf({ value, mode: "double", variant: "mix" });
  const prompt =
    flavor === "double-then-half"
      ? `Anneli verdoppelt ${value}.\nPip halbiert das Ergebnis.\nWas bleibt?`
      : `Anneli halbiert ${value}.\nPip verdoppelt das Ergebnis.\nWas bleibt?`;

  return {
    id: exerciseId("dh"),
    skill: "doubleHalf",
    prompt,
    vignette,
    visual: { kind: "mirror", value, mode: "double" },
    correctAnswer: correct,
    hint: "Verdoppeln und Halbieren heben sich gegenseitig auf. Was geht rein, kommt raus.",
    level,
    variant: "mix",
  };
}

function pickValue(mode: Mode, level: Level): number {
  if (mode === "double") {
    if (level === "easy") return randInt(2, 10);
    if (level === "hard") return randInt(13, 49);
    return randInt(6, 25);
  }
  if (level === "easy") return randInt(1, 10) * 2;
  if (level === "hard") return randInt(11, 49) * 2;
  return randInt(5, 20) * 2;
}

function hintFor(mode: Mode, value: number): string {
  if (mode === "double") {
    if (value <= 5) return `${value} und nochmal ${value} dazu.`;
    return `${value} + ${value} — erst zur Zehn ergänzen, dann den Rest.`;
  }
  if (value <= 10) return `${value} fair in zwei Teile aufteilen.`;
  return `Teile ${value} in zwei gleiche Hälften. Tipp: ${value} = ${Math.floor(value / 2)} + ${Math.ceil(value / 2)}.`;
}
