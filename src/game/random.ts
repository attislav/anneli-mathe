// Kleine Zufalls-Helfer für die Generatoren.

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(arr: readonly T[]): T {
  if (arr.length === 0) throw new Error("pick: leeres Array");
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function uid(prefix = "t"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function chance(p: number): boolean {
  return Math.random() < p;
}

/**
 * Vier Antwort-Optionen: die richtige plus typische Fehler.
 * Ablenker sind bewusst „nah dran" (±1, ±10, Zahlendreher) — so lernt die
 * App aus der Wahl etwas über den Denkfehler, und Raten lohnt sich nicht.
 */
export function numberOptions(answer: number, min = 0, max = 100): string[] {
  const candidates = new Set<number>();
  const swapped = answer >= 10 && answer < 100 && answer % 10 !== 0 ? (answer % 10) * 10 + Math.floor(answer / 10) : null;
  const pool = [answer + 1, answer - 1, answer + 10, answer - 10, answer + 2, answer - 2];
  if (swapped !== null && swapped !== answer) pool.unshift(swapped);
  for (const n of shuffle(pool.slice(0, 3)).concat(pool.slice(3))) {
    if (n >= min && n <= max && n !== answer) candidates.add(n);
    if (candidates.size === 3) break;
  }
  let fill = 3;
  while (candidates.size < 3) {
    const n = answer + fill;
    if (n >= min && n <= max && n !== answer) candidates.add(n);
    fill = fill > 0 ? -fill : -fill + 1;
  }
  return shuffle([answer, ...candidates]).map(String);
}
