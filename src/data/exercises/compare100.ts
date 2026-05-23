// Zahlen vergleichen bis 100.
// Niveau: Klasse 2 (Zehner und Einer auseinanderhalten).
//
// Mechanik: zwei zweistellige Zahlen, Kind setzt das richtige Symbol
// (<, =, >) dazwischen. Die Brücke 4 nutzt den `compare-symbol`-Input-Mode
// (Drag/Tap auf eines der drei Symbole), siehe `CompareSymbolInput.tsx`.
//
// `correctAnswer` ist als Symbol-Code kodiert:
//   -1 = links < rechts
//    0 = links = rechts
//    1 = links > rechts
//
// Pädagogisches Ziel: zuerst Zehner vergleichen, bei Gleichstand Einer.
// Wir bevorzugen darum Paare mit GLEICHEN Zehnern (z.B. 47 vs 42) — das
// ist der lehrreichere Fall.
//
// Varianten (M1, 2026-05-23):
//   - "pair"          : klassisch (Standard)
//   - "set"           : zwei Sets (Nester/Wolken) — bleibt Symbol-Vergleich,
//                       andere Vignette
//   - "multi-pick"    : aus 3 Werten den größten/kleinsten. Da der
//                       compare-symbol-Input nur -1/0/1 kennt, kodieren wir
//                       die Antwort als Position der gefragten Zahl im
//                       Display-Vergleich (links/mitte/rechts). UI braucht
//                       eine Anpassung für Multi-Pick. Wir liefern das Field
//                       trotzdem, damit BridgeChallenge oder ein späterer
//                       Input-Mode es lesen kann — `multi-pick` Aufgaben
//                       werden aktuell als Pair-Vergleich der zwei
//                       Extreme dargestellt (kleinste vs größte).
//
// Verteilung:
//   easy:   85 % pair, 15 % set
//   normal: 60 % pair, 25 % set, 15 % multi-pick
//   hard:   45 % pair, 25 % set, 30 % multi-pick

import type { Exercise, Level } from "./types";
import { exerciseId, randInt } from "./types";
import { vignetteCompare } from "./vignettes";

type Variant = "pair" | "set" | "multi-pick";

/**
 * Erzeugt eine Vergleichs-Aufgabe.
 * - "easy": einstellige + zweistellige Zahlen (offensichtlich verschieden).
 * - "normal": zweistellige mit ~50% gleichen Zehnern, gelegentlich Gleichheit.
 * - "hard": zweistellige mit ~80% gleichen Zehnern (Einer entscheiden).
 */
export function generateCompare100(level: Level = "normal"): Exercise {
  const variant = pickVariant(level);
  if (variant === "multi-pick") return buildMultiPick(level);
  // "set" und "pair" verwenden beide den Pair-Mechanismus, nur die Vignette
  // unterscheidet sich.
  return buildPair(level, variant);
}

function pickVariant(level: Level): Variant {
  const r = Math.random();
  if (level === "easy") {
    if (r < 0.85) return "pair";
    return "set";
  }
  if (level === "hard") {
    if (r < 0.45) return "pair";
    if (r < 0.7) return "set";
    return "multi-pick";
  }
  // normal
  if (r < 0.6) return "pair";
  if (r < 0.85) return "set";
  return "multi-pick";
}

function buildPair(level: Level, variant: "pair" | "set"): Exercise {
  const [left, right] = pickPair(level);
  const compareResult: -1 | 0 | 1 = left < right ? -1 : left > right ? 1 : 0;

  const vignette = vignetteCompare({ left, right, askLarger: true, variant });
  const prompt = `${left}   ?   ${right}`;

  return {
    id: exerciseId("cmp"),
    skill: "compare100",
    prompt,
    vignette,
    visual: { kind: "compare", left, right },
    correctAnswer: compareResult,
    hint: hintFor(left, right),
    level,
    variant: variant === "set" ? "set-compare" : "plain",
  };
}

function buildMultiPick(level: Level): Exercise {
  // Wir erzeugen 3 verschiedene zweistellige Zahlen, finden Min und Max.
  // Da das aktuelle Input-UI (compare-symbol) nur -1/0/1 versteht,
  // präsentieren wir Min vs Max als Pair-Vergleich, kommunizieren aber
  // im prompt die drei Werte. Das Kind sieht alle drei, vergleicht aber
  // letztlich die zwei Extreme.
  const values = pickThreeValues(level);
  const sorted = [...values].sort((a, b) => a - b);
  const small = sorted[0];
  const big = sorted[2];
  const pick: "smallest" | "largest" = Math.random() < 0.5 ? "smallest" : "largest";

  // Antwort: wir vergleichen `small` vs `big` als Pair.
  // small < big → result -1. Das bleibt konsistent mit compare-symbol.
  const compareResult: -1 | 0 | 1 = -1;
  const vignette = vignetteCompare({
    left: small,
    right: big,
    askLarger: pick === "largest",
    variant: "multi-pick",
    values,
    pick,
  });

  const prompt =
    pick === "largest"
      ? `Welche ist die größte?\n${values.join("   ")}\nVergleiche: ${small}   ?   ${big}`
      : `Welche ist die kleinste?\n${values.join("   ")}\nVergleiche: ${small}   ?   ${big}`;

  return {
    id: exerciseId("cmp"),
    skill: "compare100",
    prompt,
    vignette,
    visual: { kind: "compare", left: small, right: big },
    correctAnswer: compareResult,
    hint: "Schau zuerst die Zehner. Die größte Zahl hat die meisten Zehner.",
    level,
    variant: "multi-pick",
  };
}

function pickThreeValues(level: Level): number[] {
  const range = level === "easy" ? [11, 50] : level === "hard" ? [40, 99] : [11, 99];
  const set = new Set<number>();
  while (set.size < 3) {
    set.add(randInt(range[0], range[1]));
  }
  return [...set];
}

function pickPair(level: Level): [number, number] {
  if (level === "easy") {
    const small = randInt(2, 9);
    const big = randInt(20, 99);
    return Math.random() < 0.5 ? [small, big] : [big, small];
  }

  if (level !== "hard" && Math.random() < 0.12) {
    const eq = randInt(11, 99);
    return [eq, eq];
  }

  const sameTens = level === "hard" ? Math.random() < 0.8 : Math.random() < 0.5;

  if (sameTens) {
    const tens = randInt(2, 9);
    const onesA = randInt(0, 9);
    let onesB = randInt(0, 9);
    while (onesA === onesB) onesB = randInt(0, 9);
    return [tens * 10 + onesA, tens * 10 + onesB];
  }

  const a = randInt(11, 99);
  let b = randInt(11, 99);
  while (Math.floor(a / 10) === Math.floor(b / 10) || a === b) {
    b = randInt(11, 99);
  }
  return [a, b];
}

function hintFor(left: number, right: number): string {
  if (left === right) {
    return "Beide sind gleich viele — schau noch einmal genau hin. Welches Zeichen passt dann?";
  }
  const tensL = Math.floor(left / 10);
  const tensR = Math.floor(right / 10);
  if (tensL === tensR) {
    return "Beide haben gleich viele Zehner — schau die Einer an. Die Spitze zeigt zur kleineren Zahl.";
  }
  return "Schau zuerst die Zehner — wer mehr Zehner hat, ist größer. Die Spitze des Zeichens zeigt zur kleineren Zahl.";
}
