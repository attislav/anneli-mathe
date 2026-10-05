// Kopfrechentricks für die eigene Aufgabe — mit den echten Zahlen.
//
// Zu einer Aufgabe wie „66 + 9 = ?" gibt es oft mehrere gute Wege:
// Zehner-Pause, „fast 10", Zahlenfreunde … Hier werden alle passenden
// Tricks berechnet. Der letzte Schritt endet immer mit „= ?" — das Kind
// rechnet den letzten Schritt selbst, die Lösung wird nicht verraten.
//
// Wichtig: Jeder letzte Schritt ist ein Rechenausdruck, der genau das
// Ergebnis der Aufgabe hat. `npm run smoke:game` prüft das für alle Aufgaben.

export type Trick = { id: string; title: string; steps: string[] };

type Parsed =
  | { kind: "calc"; a: number; op: "+" | "−" | "·" | ":"; b: number }
  | { kind: "missing"; a: number; op: "+" | "−" | "·" | ":"; c: number; first: boolean }
  | { kind: "double"; a: number }
  | { kind: "half"; a: number };

/** Ergebnis der Aufgabe (für die Prüfung im Smoke-Test). */
export function resultOf(p: Parsed): number {
  if (p.kind === "double") return 2 * p.a;
  if (p.kind === "half") return p.a / 2;
  if (p.kind === "calc") return p.op === "+" ? p.a + p.b : p.op === "−" ? p.a - p.b : p.op === "·" ? p.a * p.b : p.a / p.b;
  // a op ? = c   bzw.   ? op a = c
  const { a, op, c, first } = p;
  if (op === "+") return c - a;
  if (op === "·") return c / a;
  if (op === "−") return first ? c + a : a - c;
  return first ? c * a : a / c;
}

/** „66 + 9 = ?", „35 ct + 20 ct = ? ct", „Doppelt von 7 = ?" … → Zahlen und Rechenart. */
export function parseTerm(raw: string | undefined): Parsed | null {
  if (!raw) return null;
  let t = raw.trim();
  // Gleiche Einheit überall (nur ct oder nur cm)? Dann weg damit.
  for (const unit of ["ct", "cm"]) {
    if (new RegExp(`\\b${unit}\\b`).test(t) && !/€|\bm\b/.test(t)) t = t.replace(new RegExp(`\\s*\\b${unit}\\b`, "g"), "");
  }
  let m = t.match(/^Doppelt von (\d+) = \?$/);
  if (m) return { kind: "double", a: +m[1] };
  m = t.match(/^Hälfte von (\d+) = \?$/);
  if (m) return { kind: "half", a: +m[1] };
  m = t.match(/^(\d+) ([+−·:]) (\d+) = \?$/);
  if (m) return { kind: "calc", a: +m[1], op: m[2] as "+", b: +m[3] };
  m = t.match(/^(\d+) ([+−·:]) \? = (\d+)$/);
  if (m) return { kind: "missing", a: +m[1], op: m[2] as "+", c: +m[3], first: false };
  m = t.match(/^\? ([+−·:]) (\d+) = (\d+)$/);
  if (m) return { kind: "missing", a: +m[2], op: m[1] as "+", c: +m[3], first: true };
  return null;
}

const nextTen = (n: number) => Math.floor(n / 10) * 10 + 10;
const prevTen = (n: number) => Math.floor(n / 10) * 10;

function plusTricks(a: number, b: number): Trick[] {
  const out: Trick[] = [];
  const [big, small] = a >= b ? [a, b] : [b, a];
  const tens = prevTen(small);
  const ones = small % 10;
  // Zwei zweistellige Zahlen: Zehner zu Zehnern, Einer zu Einern
  if (a >= 10 && b >= 10 && a % 10 && b % 10) {
    const z = prevTen(a) + prevTen(b);
    const e = (a % 10) + (b % 10);
    out.push({ id: "stellen", title: "Zehner und Einer getrennt", steps: [`Erst die Zehner: ${prevTen(a)} + ${prevTen(b)} = ${z}.`, `Dann die Einer: ${a % 10} + ${b % 10} = ${e}.${e >= 10 ? ` Das ist mehr als 10 — da steckt noch ein Zehner drin!` : ""}`, `Jetzt beides zusammen: ${z} + ${e} = ?`] });
  }
  // Große Zahl zuerst
  if (a < b && a < 10 && b >= 10) {
    out.push({ id: "tauschen", title: "Große Zahl zuerst", steps: [`Bei Plus darfst du tauschen: ${a} + ${b} ist dasselbe wie ${b} + ${a}.`, `Fang bei der großen Zahl an und zähl ${a} weiter.`, `${b} + ${a} = ?`] });
  }
  // Zehner-Pause (kleine Zahl einstellig)
  if (small < 10 && (big % 10) + small > 10) {
    const ten = nextTen(big);
    const k = ten - big;
    out.push({ id: "zehnerpause", title: "Zehner-Pause", steps: [`Von ${big} bis zum Zehner ${ten} fehlen ${k}.`, `${big} + ${k} = ${ten}. Pause am Zehner!`, `Von der ${small} sind noch ${small - k} übrig: ${ten} + ${small - k} = ?`] });
  }
  // Zweistellig: erst die Zehner, dann die Einer — mit Pause am Zehner, wenn nötig.
  // Angefangen wird bei der ersten Zahl, so wie die Aufgabe dasteht.
  if (small >= 10 && ones) {
    const [start, add] = a >= 10 ? [a, b] : [big, small];
    return [...out, ...stepTricks(start, add), ...plusRest(a, b, big, small)];
  }
  return [...out, ...plusRest(a, b, big, small)];
}

function stepTricks(big: number, small: number): Trick[] {
  const out: Trick[] = [];
  const tens = prevTen(small);
  const ones = small % 10;
  if (ones) {
    const mid = big + tens;
    if ((mid % 10) + ones > 10) {
      const ten = nextTen(mid);
      const k = ten - mid;
      out.push({ id: "zehnerpause", title: "Erst die Zehner, dann Zehner-Pause", steps: [`Zerlege die ${small} in ${tens} und ${ones}. Erst die Zehner: ${big} + ${tens} = ${mid}.`, `Jetzt die ${ones} Einer — bis zum Zehner fehlen ${k}: ${mid} + ${k} = ${ten}. Pause!`, `Von den ${ones} Einern sind noch ${ones - k} übrig: ${ten} + ${ones - k} = ?`] });
    } else {
      out.push({ id: "zehnerEiner", title: "Erst die Zehner, dann die Einer", steps: [`Zerlege die ${small} in ${tens} und ${ones}.`, `Erst die Zehner: ${big} + ${tens} = ${mid}.`, `Dann die Einer: ${mid} + ${ones} = ?`] });
    }
  }
  return out;
}

function plusRest(a: number, b: number, big: number, small: number): Trick[] {
  const out: Trick[] = [];
  // Runden: +9 = +10 − 1, +37 = +40 − 3 (die Zahl, die fast ein Zehner ist)
  const nearly = (x: number) => x % 10 >= 8 || (x >= 10 && x % 10 >= 7);
  const r = nearly(b) ? b : nearly(a) ? a : 0;
  if (r) {
    const other = r === b ? a : b;
    const round = r + (10 - (r % 10));
    const d = round - r;
    out.push({ id: "fast10", title: `Fast ${round}`, steps: [`${r} ist fast ${round}. Rechne erst plus ${round} — das ist leichter.`, `${other} + ${round} = ${other + round}.`, `Das war ${d} zu viel, also ${d} zurück: ${other + round} − ${d} = ?`] });
  }
  // Zahlenfreunde in den Einern
  if ((a >= 10 || b >= 10) && a % 10 && b % 10 && (a % 10) + (b % 10) === 10) {
    out.push({ id: "freunde", title: "Zahlenfreunde finden", steps: [`Schau auf die Einer: ${a % 10} und ${b % 10} sind Zahlenfreunde — zusammen 10!`, `Also gibt es einen Zehner mehr und die Einer sind weg.`, `${prevTen(a)} + ${prevTen(b)} + 10 = ?`] });
  }
  // Fast verdoppeln
  if (big <= 20 && big - small <= 2) {
    if (big === small) out.push({ id: "doppelt", title: "Verdoppeln", steps: [`${a} + ${a} ist das Doppelte von ${a}.`, `Doppelte kann man sich gut merken!`, `${a} + ${a} = ?`] });
    else out.push({ id: "fastDoppelt", title: "Fast verdoppeln", steps: [`${small} und ${big} liegen nah beieinander.`, `Das Doppelte von ${small}: ${small} + ${small} = ${2 * small}.`, `Dann noch ${big - small} dazu: ${2 * small} + ${big - small} = ?`] });
  }
  return out;
}

// Minus wird anders erklärt als Plus: rückwärts, „weg“, und Zehner und Einer
// getrennt nur dann, wenn bei den Einern genug zum Wegnehmen da ist.
function minusTricks(a: number, b: number): Trick[] {
  const out: Trick[] = [];
  const tens = prevTen(b);
  const ones = b % 10;
  // Zehner-Pause rückwärts (einstellig)
  if (b < 10 && a % 10 < b && a % 10 > 0) {
    const ten = prevTen(a);
    const k = a - ten;
    out.push({ id: "zehnerpause", title: "Rückwärts mit Zehner-Pause", steps: [`Minus heißt: rückwärts gehen. Von ${a} zurück bis zum Zehner ${ten} sind es ${k}.`, `${a} − ${k} = ${ten}. Pause am Zehner!`, `Von der ${b} musst du noch ${b - k} wegnehmen: ${ten} − ${b - k} = ?`] });
  }
  if (b >= 10 && ones) {
    const mid = a - tens;
    if (mid % 10 < ones && mid % 10 > 0) {
      // Erst Zehner weg, dann rückwärts mit Pause am Zehner
      const ten = prevTen(mid);
      const k = mid - ten;
      out.push({ id: "zehnerpause", title: "Erst die Zehner weg, dann Zehner-Pause", steps: [`Zerlege die ${b} in ${tens} und ${ones}. Erst die Zehner weg: ${a} − ${tens} = ${mid}.`, `Jetzt ${ones} Einer weg — rückwärts bis zum Zehner sind es ${k}: ${mid} − ${k} = ${ten}. Pause!`, `Von den ${ones} Einern musst du noch ${ones - k} wegnehmen: ${ten} − ${ones - k} = ?`] });
    } else {
      out.push({ id: "zehnerEiner", title: "Erst die Zehner weg, dann die Einer", steps: [`Zerlege die ${b} in ${tens} und ${ones}.`, `Erst die Zehner weg: ${a} − ${tens} = ${mid}.`, `Dann die Einer weg: ${mid} − ${ones} = ?`] });
    }
    // Zehner und Einer getrennt — nur ohne Leihen
    if (a % 10 >= ones && a >= 10) {
      out.push({ id: "stellen", title: "Zehner und Einer getrennt", steps: [`Hier geht das: Von ${a % 10} Einern kannst du ${ones} wegnehmen.`, `Zehner: ${prevTen(a)} − ${tens} = ${prevTen(a) - tens}. Einer: ${a % 10} − ${ones} = ${(a % 10) - ones}.`, `Zusammen: ${prevTen(a) - tens} + ${(a % 10) - ones} = ?`] });
    }
  }
  // Runden: −9 = −10 + 1, −27 = −30 + 3
  if ((ones >= 8 || (b >= 10 && ones >= 7)) && a >= b + 2) {
    const round = b + (10 - ones);
    const d = round - b;
    if (a - round >= 0) out.push({ id: "fast10", title: `Fast ${round}`, steps: [`${b} ist fast ${round}. Nimm erst ${round} weg — das ist leichter.`, `${a} − ${round} = ${a - round}.`, `Das war ${d} zu viel weg, also ${d} wieder dazu: ${a - round} + ${d} = ?`] });
  }
  // Hochzählen: nah beieinander → von b nach a
  if (b >= 10 && a - b <= 15 && a - b > 0) {
    const ten = b % 10 ? nextTen(b) : b;
    if (ten < a) out.push({ id: "ergaenzen", title: "Hochzählen statt wegnehmen", steps: [`${a} und ${b} liegen nah beieinander. Frag: Wie weit ist es von ${b} bis ${a}?`, ten > b ? `Von ${b} bis ${ten} sind es ${ten - b}. Von ${ten} bis ${a} sind es ${a - ten}.` : `Von ${b} bis ${a} zählst du hoch.`, `${ten - b} + ${a - ten} = ?`] });
  }
  // Mit Zahlenfreunden aus der 10
  if (a === 10 && b < 10) {
    out.push({ id: "freunde", title: "Zahlenfreunde", steps: [`Welche Zahl ist der Zahlenfreund von ${b}? Zusammen ergeben sie 10.`, `Halte 10 Finger hoch und klapp ${b} weg.`, `10 − ${b} = ?`] });
  }
  return out;
}

function timesTricks(a: number, b: number): Trick[] {
  const out: Trick[] = [];
  const easy = (n: number) => n === 2 || n === 5 || n === 10 || n === 1;
  // Tauschen, wenn die zweite Zahl leichter ist
  if (easy(a) && !easy(b) && a !== b) {
    out.push({ id: "tauschen", title: "Tauschen", steps: [`Beim Malnehmen darfst du tauschen: ${a} · ${b} = ${b} · ${a}.`, `${b}-mal die ${a} oder ${a}-mal die ${b} — nimm, was leichter ist.`, `${b} · ${a} = ?`] });
  }
  const [x, y] = easy(b) && !easy(a) ? [b, a] : [a, b]; // x = Anzahl, y = was mal genommen wird
  for (const [n, other] of [
    [x, y],
    [y, x],
  ] as const) {
    if (n === 2 && !out.some((t) => t.id === "mal2")) out.push({ id: "mal2", title: "Mal 2 heißt verdoppeln", steps: [`2-mal die ${other} ist das Doppelte von ${other}.`, `Doppelt heißt: zweimal die Zahl.`, `${other} + ${other} = ?`] });
    if (n === 10 && !out.some((t) => t.id === "mal10")) out.push({ id: "mal10", title: "Mal 10: eine Null dran", steps: [`Bei mal 10 wird aus Einern Zehner.`, `${other} Einer werden zu ${other} Zehnern — häng eine 0 an.`, `${other} · 10 = ?`] });
    if (n === 5 && other !== 10 && !out.some((t) => t.id === "mal5")) out.push({ id: "mal5", title: "Mal 5 ist die Hälfte von mal 10", steps: [`Rechne erst mal 10: ${other} · 10 = ${other * 10}.`, `Mal 5 ist die Hälfte davon.`, `${other * 10} : 2 = ?`] });
    if (n === 4 && !out.some((t) => t.id === "mal4")) out.push({ id: "mal4", title: "Mal 4: zweimal verdoppeln", steps: [`Verdopple die ${other}: ${other} + ${other} = ${2 * other}.`, `Und gleich nochmal verdoppeln!`, `${2 * other} + ${2 * other} = ?`] });
    if (n === 9 && !out.some((t) => t.id === "mal9")) out.push({ id: "mal9", title: "Mal 9 ist mal 10 minus einmal", steps: [`Rechne erst mal 10: ${other} · 10 = ${other * 10}.`, `Das ist einmal die ${other} zu viel.`, `${other * 10} − ${other} = ?`] });
    if (n === 8 && other !== 10 && !out.some((t) => t.id === "mal8")) out.push({ id: "mal8", title: "Mal 8 ist das Doppelte von mal 4", steps: [`Rechne erst 4 · ${other} = ${4 * other}.`, `Mal 8 ist doppelt so viel wie mal 4.`, `${4 * other} + ${4 * other} = ?`] });
    if (n === 6 && other !== 10 && !out.some((t) => t.id === "mal6")) out.push({ id: "mal6", title: "Mal 6 ist das Doppelte von mal 3", steps: [`Rechne erst 3 · ${other} = ${3 * other}.`, `Mal 6 ist doppelt so viel wie mal 3.`, `${3 * other} + ${3 * other} = ?`] });
    if ((n === 6 || n === 7 || n === 8) && other !== 5 && other !== 10 && !out.some((t) => t.id === "nachbar5")) {
      out.push({ id: "nachbar5", title: "Von der 5er-Aufgabe aus", steps: [`Leicht ist: 5 · ${other} = ${5 * other}.`, `${n} ist ${n - 5} mehr als 5. Also noch ${n - 5}-mal die ${other} dazu: ${(n - 5) * other}.`, `${5 * other} + ${(n - 5) * other} = ?`] });
    }
  }
  if (a === b && a > 2) out.push({ id: "quadrat", title: "Quadratzahl", steps: [`${a} · ${a} ist eine Quadratzahl: ein Quadrat aus ${a} mal ${a} Punkten.`, `Quadratzahlen lohnt es sich zu merken: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100.`, `${a} · ${a} = ?`] });
  if (x <= 5 && y <= 10 && x > 1) {
    const seq = Array.from({ length: Math.min(x, 4) }, (_, i) => (i + 1) * y);
    out.push({ id: "schritte", title: `In ${y}er-Schritten zählen`, steps: [`${x} · ${y} heißt: ${x}-mal die ${y}.`, `Zähl in ${y}er-Schritten und zähl ${x} Schritte mit: ${seq.join(", ")}${x > 4 ? ", …" : ""}`, `${Array(x).fill(y).join(" + ")} = ?`] });
  }
  return out;
}

function divideTricks(a: number, b: number): Trick[] {
  const out: Trick[] = [];
  out.push({ id: "umkehr", title: "Denk an die Malaufgabe", steps: [`${a} : ${b} fragt: Wie oft passt die ${b} in die ${a}?`, `Also: Welche Zahl mal ${b} ergibt ${a}?  ? · ${b} = ${a}`, `${a} : ${b} = ?`] });
  if (b === 2) out.push({ id: "halbieren", title: "Durch 2 heißt halbieren", steps: [`Teile die ${a} gerecht in zwei Hälften.`, a >= 20 && a % 10 ? `Halbiere Zehner und Einer einzeln: ${prevTen(a)} und ${a % 10}.` : `Welche Zahl plus sich selbst ergibt ${a}?`, `${a} : 2 = ?`] });
  if (b === 10 && a % 10 === 0) out.push({ id: "durch10", title: "Durch 10: die Null weg", steps: [`${a} sind ${a / 10} Zehner.`, `Geteilt durch 10 bleiben die ${a / 10} übrig — die Null fällt weg.`, `${a} : 10 = ?`] });
  if (b === 5 && a % 10 === 0) out.push({ id: "durch5", title: "Durch 5: durch 10 und verdoppeln", steps: [`Erst durch 10: ${a} : 10 = ${a / 10}.`, `Die 5 passt doppelt so oft wie die 10.`, `${a / 10} · 2 = ?`] });
  if (b <= 10 && a / b <= 10) {
    const seq = Array.from({ length: Math.min(a / b, 4) }, (_, i) => (i + 1) * b);
    out.push({ id: "schritte", title: `In ${b}er-Schritten bis ${a}`, steps: [`Zähl in ${b}er-Schritten, bis du bei ${a} bist: ${seq.join(", ")}${a / b > 4 ? ", …" : ""}`, `Wie viele Schritte waren es? So oft passt die ${b} in die ${a}.`, `${a} : ${b} = ?`] });
  }
  return out;
}

function missingTricks(p: Extract<Parsed, { kind: "missing" }>): Trick[] {
  const { a, op, c, first } = p;
  const out: Trick[] = [];
  if (op === "+") {
    if (c > a && c % 10 === 0 && a % 10 && c - a <= 10) out.push({ id: "freunde", title: "Zahlenfreunde", steps: [`Bis zur ${c}: Welcher Zahlenfreund passt zu ${a % 10}?`, `Zahlenfreunde ergeben zusammen 10.`, `10 − ${a % 10} = ?`] });
    const ten = a % 10 ? nextTen(a) : a;
    if (ten < c) out.push({ id: "hochzaehlen", title: "Über den Zehner hochzählen", steps: [`Von ${a} bis ${ten} sind es ${ten - a}.`, `Von ${ten} bis ${c} sind es ${c - ten}.`, `${ten - a} + ${c - ten} = ?`] });
    out.push({ id: "umkehr", title: "Andersrum rechnen", steps: [`Gesucht ist, was zur ${a} dazukommt, damit ${c} herauskommt.`, `Das ist dasselbe wie: ${c} minus ${a}.`, `${c} − ${a} = ?`] });
  } else if (op === "−") {
    if (first) out.push({ id: "umkehr", title: "Andersrum rechnen", steps: [`Von einer Zahl wird ${a} weggenommen, dann bleibt ${c}.`, `Tu die ${a} wieder dazu, dann hast du die Zahl.`, `${c} + ${a} = ?`] });
    else {
      out.push({ id: "umkehr", title: "Andersrum rechnen", steps: [`Von ${a} wird etwas weggenommen, dann bleibt ${c}.`, `Wie weit ist es von ${c} bis ${a}?`, `${a} − ${c} = ?`] });
      const ten = c % 10 ? nextTen(c) : c;
      if (ten < a) out.push({ id: "hochzaehlen", title: "Von unten hochzählen", steps: [`Zähl von ${c} hoch bis ${a}. Von ${c} bis ${ten} sind es ${ten - c}.`, `Von ${ten} bis ${a} sind es ${a - ten}.`, `${ten - c} + ${a - ten} = ?`] });
    }
  } else if (op === "·") {
    out.push({ id: "umkehr", title: "Mit Geteilt rechnen", steps: [`Welche Zahl mal ${a} ergibt ${c}?`, `Das ist die Geteilt-Aufgabe: ${c} durch ${a}.`, `${c} : ${a} = ?`] });
    if (a <= 10 && c / a <= 10) out.push({ id: "schritte", title: `In ${a}er-Schritten`, steps: [`Zähl in ${a}er-Schritten bis ${c}.`, `Wie viele Schritte waren es?`, `${c} : ${a} = ?`] });
  } else {
    if (first) out.push({ id: "umkehr", title: "Mit Mal rechnen", steps: [`Welche Zahl durch ${a} ergibt ${c}?`, `Rechne andersrum mit Mal.`, `${c} · ${a} = ?`] });
    else out.push({ id: "umkehr", title: "Mit Mal rechnen", steps: [`${a} geteilt durch welche Zahl ergibt ${c}?`, `Andersrum: ${c} mal welche Zahl ergibt ${a}? Das ist ${a} durch ${c}.`, `${a} : ${c} = ?`] });
  }
  return out;
}

/** Alle passenden Tricks für eine Aufgabe (leer, wenn keiner passt). */
export function tricksFor(term: string | undefined): Trick[] {
  const p = parseTerm(term);
  if (!p) return [];
  if (p.kind === "double") {
    const a = p.a;
    if (a >= 10 && a % 10) return [{ id: "doppeltZE", title: "Zehner und Einer einzeln", steps: [`Zerlege die ${a} in ${prevTen(a)} und ${a % 10}.`, `Verdopple beide: ${prevTen(a)} + ${prevTen(a)} = ${2 * prevTen(a)} und ${a % 10} + ${a % 10} = ${2 * (a % 10)}.`, `${2 * prevTen(a)} + ${2 * (a % 10)} = ?`] }];
    return [{ id: "doppelt", title: "Verdoppeln", steps: [`Das Doppelte heißt: zweimal die ${a}.`, `Rechne die ${a} plus die ${a}.`, `${a} + ${a} = ?`] }];
  }
  if (p.kind === "half") {
    const a = p.a;
    if (a >= 20 && a % 10 && (prevTen(a) / 10) % 2 === 0 && (a % 10) % 2 === 0)
      return [{ id: "halbZE", title: "Zehner und Einer einzeln", steps: [`Zerlege die ${a} in ${prevTen(a)} und ${a % 10}.`, `Halbiere beide: ${prevTen(a) / 2} und ${(a % 10) / 2}.`, `${prevTen(a) / 2} + ${(a % 10) / 2} = ?`] }];
    return [{ id: "halb", title: "Halbieren", steps: [`Die Hälfte heißt: gerecht in zwei Teile teilen.`, `Welche Zahl plus sich selbst ergibt ${a}?`, `${a} : 2 = ?`] }];
  }
  if (p.kind === "missing") return missingTricks(p);
  if (p.op === "+") return plusTricks(p.a, p.b);
  if (p.op === "−") return minusTricks(p.a, p.b);
  if (p.op === "·") return timesTricks(p.a, p.b);
  return divideTricks(p.a, p.b);
}
