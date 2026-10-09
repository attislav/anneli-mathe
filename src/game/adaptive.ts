// Adaptive Schwierigkeit.
//
// Jede Kompetenz hat einen Können-Wert zwischen 1 und 5 (`mastery`).
// Nach jeder Aufgabe, die beim ERSTEN Versuch gelöst wurde: +0,2.
// Nach einem Fehler im ersten Versuch: −0,8.
//
// Diese „Treppe" pendelt sich genau dort ein, wo 80 % der Aufgaben im
// ersten Versuch klappen (0,2 · 0,8 = 0,8 · 0,2). Das ist die Zone, in der
// es fordert, aber nicht frustriert.
//
// Dazu kommt die Stufe der Lektion (Bronze/Silber/Gold) und ein kurzer
// Schwung innerhalb der Lektion: 3 richtig in Folge → eine Stufe schwerer,
// 2 Fehler in Folge → eine Stufe leichter.

import type { Level } from "./types";

export const START_MASTERY = 2;
const UP = 0.2;
const DOWN = 0.8;

export type Tier = 0 | 1 | 2;
export const TIER_NAMES = ["Entdecker", "Profi", "Meister"] as const;

const TIER_RANGE: Record<Tier, [Level, Level]> = {
  0: [1, 3],
  1: [2, 4],
  2: [3, 5],
};

export function updateMastery(m: number, firstTryCorrect: boolean): number {
  const next = firstTryCorrect ? m + UP : m - DOWN;
  return Math.min(5, Math.max(1, Math.round(next * 100) / 100));
}

export function levelFor(mastery: number, tier: Tier, bias: number): Level {
  const [min, max] = TIER_RANGE[tier];
  const raw = Math.round(mastery + bias + tier * 0.5);
  return Math.min(max, Math.max(min, raw)) as Level;
}

/** Gewichtete Wahl: schwächere Kompetenzen kommen in Mix-Lektionen öfter dran. */
export function pickWeakSkill(skills: string[], mastery: Record<string, number>): string {
  const weights = skills.map((s) => 6 - (mastery[s] ?? START_MASTERY));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < skills.length; i++) {
    r -= weights[i];
    if (r <= 0) return skills[i];
  }
  return skills[skills.length - 1];
}

/** Sterne aus der Erst-Versuch-Quote. */
/** Sterne für eine Lektion. 0 = nicht geschafft (weniger als die Hälfte gleich richtig) — dann gibt es auch keine Belohnung. */
export const PASS_SHARE = 0.5;
export function starsFor(firstTry: number, total: number): 0 | 1 | 2 | 3 {
  const q = total === 0 ? 0 : firstTry / total;
  if (q >= 0.85) return 3;
  if (q >= 0.7) return 2;
  if (q >= PASS_SHARE) return 1;
  return 0;
}
