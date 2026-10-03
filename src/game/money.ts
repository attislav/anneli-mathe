// Geld: Darstellung und Zerlegung. Gerechnet wird immer in Cent.

/** 35 → „35 ct", 300 → „3 €", 120 → „1,20 €". */
export function fmtMoney(cents: number): string {
  if (cents < 100) return `${cents} ct`;
  if (cents % 100 === 0) return `${cents / 100} €`;
  return `${Math.floor(cents / 100)},${String(cents % 100).padStart(2, "0")} €`;
}

/** 205 → „2 € 5 ct" — so schreibt man es in Klasse 2 oft. */
export function fmtEuroCent(cents: number): string {
  const e = Math.floor(cents / 100);
  const c = cents % 100;
  if (e === 0) return `${c} ct`;
  if (c === 0) return `${e} €`;
  return `${e} € ${c} ct`;
}

export const COINS_CT = [1, 2, 5, 10, 20, 50];
export const COINS_EURO = [100, 200];
export const NOTES = [500, 1000, 2000];
export const ALL_PIECES = [...COINS_CT, ...COINS_EURO, ...NOTES];

/** Betrag gierig in Münzen/Scheine zerlegen, größte zuerst. */
export function breakDown(cents: number, pieces: number[] = ALL_PIECES): number[] {
  const out: number[] = [];
  let rest = cents;
  for (const p of [...pieces].sort((a, b) => b - a)) {
    while (rest >= p) {
      out.push(p);
      rest -= p;
    }
  }
  return out;
}
