// Geld — Cent & Euro (Klasse 2, Kapitel 2 Pfirsich-Wüste).
//
// Pädagogisches Ziel:
//   - Cent-Beträge addieren/subtrahieren (5 Cent + 20 Cent)
//   - Verständnis: 1 Euro = 100 Cent
//   - Einfache Wechsel-Aufgaben: 1 Euro − 30 Cent = 70 Cent
//
// Die Antwort ist IMMER eine Zahl in Cent (für Konsistenz mit dem
// existierenden Number-Input). UI kann das später in "70 Cent" rendern.
//
// Stufen (Level):
//   easy:   beides in Cent, Werte 5/10/20/50, Summe ≤ 100. Nur Plus.
//   normal: Cent-Werte 5..95, Plus + Minus, gelegentlich „1 Euro − x Cent"
//   hard:   Euro/Cent gemischt („1 Euro 20 Cent + 50 Cent"), Werte bis 200 Cent
//
// Vignetten setzen Beträge in die Karawanenmarkt-Welt.

import type { Exercise, Level } from "./types";
import { exerciseId, randInt, pickOne } from "./types";
import { formatCent, vignetteMoney } from "./vignettes";

type Op = "plus" | "minus";

// Übliche Münzwerte in Cent — passen zu echten Euro-Münzen.
const COIN_VALUES = [1, 2, 5, 10, 20, 50] as const;

export function generateMoney(level: Level = "normal"): Exercise {
  const op: Op = level === "easy" ? "plus" : Math.random() < 0.5 ? "plus" : "minus";

  const [a, b, result] = pickValues(level, op);

  const scale: "cent-only" | "euro-cent" =
    level === "hard" && (a >= 100 || b >= 100) ? "euro-cent" : "cent-only";

  const opSymbol = op === "plus" ? "+" : "−";

  // Prompt: kindgerecht in Cent/Euro formatiert, Antwort als reine Cent-Zahl.
  const prompt = `${formatCent(a)} ${opSymbol} ${formatCent(b)} = ?  (in Cent)`;

  return {
    id: exerciseId("mon"),
    skill: "money",
    prompt,
    vignette: vignetteMoney({ a, b, result, op, scale }),
    correctAnswer: result,
    hint: hintFor(a, b, op),
    level,
    variant: "context",
  };
}

function pickValues(level: Level, op: Op): [number, number, number] {
  if (level === "easy") {
    // Plus, Münz-Werte, Summe ≤ 100.
    for (let i = 0; i < 30; i++) {
      const a = pickOne(COIN_VALUES);
      const b = pickOne(COIN_VALUES);
      if (a + b <= 100) return [a, b, a + b];
    }
    return [10, 20, 30];
  }

  if (level === "hard") {
    // Werte bis 200 Cent, häufig „1 Euro x Cent".
    if (op === "plus") {
      for (let i = 0; i < 30; i++) {
        const a = randInt(20, 150);
        const b = randInt(10, 150);
        if (a + b <= 200) return [a, b, a + b];
      }
    } else {
      for (let i = 0; i < 30; i++) {
        const a = randInt(50, 200);
        const b = randInt(10, a - 5);
        return [a, b, a - b];
      }
    }
    return [120, 50, 170];
  }

  // normal
  if (op === "plus") {
    // Wahrscheinlich Münz-Summen oder krummere Werte bis 100.
    for (let i = 0; i < 30; i++) {
      const usableCoins = Math.random() < 0.6;
      const a = usableCoins ? pickOne(COIN_VALUES) * randInt(1, 3) : randInt(5, 80);
      const b = usableCoins ? pickOne(COIN_VALUES) * randInt(1, 3) : randInt(5, 80);
      if (a + b <= 100) return [a, b, a + b];
    }
    return [25, 30, 55];
  }
  // Minus: oft „1 Euro − x Cent" (=100 − x).
  if (Math.random() < 0.4) {
    const b = pickOne([10, 20, 25, 30, 40, 50, 60, 70, 80, 90] as const);
    return [100, b, 100 - b];
  }
  for (let i = 0; i < 30; i++) {
    const a = randInt(30, 100);
    const b = randInt(5, a - 5);
    return [a, b, a - b];
  }
  return [80, 30, 50];
}

function hintFor(a: number, b: number, op: Op): string {
  if (op === "plus") {
    if (a + b === 100) return "Zwei Werte, die zusammen genau 1 Euro ergeben — denk in vollen Zehnern.";
    if (a < 100 && b < 100) return "Wie bei Plus bis 100 — erst die Zehner, dann die Einer.";
    return "Wechsle 1 Euro in 100 Cent, dann zähl die Cent zusammen.";
  }
  if (a === 100) return "1 Euro sind 100 Cent. Was bleibt übrig, wenn du den Cent-Betrag abziehst?";
  return "Wie bei Minus bis 100 — manchmal musst du einen Zehner aufbrechen.";
}
