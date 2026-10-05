// Sprünge auf dem Zahlenstrahl für Plus/Minus über den Zehner:
// 66 + 9 → 66 ─(+4)→ 70 ─(+5)→ ?   (der Zehner als Zwischenstopp).

export type Jump = { from: number; to: number };

/** „66 + 9 = ?" → die Sprünge, oder null, wenn die Aufgabe nicht passt. */
export function jumpsFor(term: string | undefined): Jump[] | null {
  const m = term?.match(/^(\d+) ([+−]) (\d+) = \?$/);
  if (!m) return null;
  const a = Number(m[1]);
  const b = Number(m[3]);
  const plus = m[2] === "+";
  const end = plus ? a + b : a - b;
  if (end < 0 || b === 0) return null;
  const jumps: Jump[] = [];
  let at = a;
  // Erst die Zehner am Stück, dann die Einer mit Pause am Zehner.
  const tens = Math.floor(b / 10) * 10;
  if (tens > 0) {
    jumps.push({ from: at, to: plus ? at + tens : at - tens });
    at = jumps[0].to;
  }
  const ones = b - tens;
  if (ones > 0) {
    const ten = plus ? Math.ceil((at + 1) / 10) * 10 : Math.floor((at - 1) / 10) * 10;
    const crosses = plus ? at + ones > ten : at - ones < ten;
    if (crosses && ten !== at) {
      jumps.push({ from: at, to: ten });
      at = ten;
    }
    jumps.push({ from: at, to: end });
  }
  // Ohne Zehner-Übergang hilft das Bild kaum.
  return jumps.length >= 2 ? jumps : null;
}
