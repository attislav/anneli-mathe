// Die Kompetenzen (Skills) und ihre Aufgaben-Generatoren.
//
// Jede Kompetenz hat 5 Stufen. Die Engine (adaptive.ts) entscheidet, welche
// Stufe dran ist — der Generator würfelt dazu eine passende Aufgabe und
// sucht ein Format aus (Antippen, Eintippen, Legen, Mauer …).
//
// Regeln für alle Generatoren:
//   - Tipp wendet den Rechentrick auf GENAU diese Zahlen an.
//   - Rechenweg zeigt den Weg, nicht nur das Ergebnis.
//   - Minuszeichen ist immer „−" (U+2212), nicht der Bindestrich.

import { chance, pick, randInt, shuffle } from "./random";
import { chooseFormat, nextTen, numeric, tensOf, wall, type Skill } from "./genkit";
import { HAFEN_SKILLS } from "./skillsHafen";

export type { GenCtx, Skill, Texts, Trick, WorldId } from "./genkit";

// ---------------------------------------------------------------------------
// Welt 0 · Startinsel

const freunde10: Skill = {
  id: "freunde10",
  title: "Zahlenfreunde",
  world: "start",
  gen: (ctx) => {
    const { level } = ctx;
    const target = level >= 4 ? 20 : 10;
    const a = target === 10 ? randInt(1, 9) : level === 4 ? randInt(11, 19) : randInt(1, 19);
    const ans = target - a;
    const hint =
      target === 10
        ? `Halte 10 Finger hoch und klapp ${a} weg. Wie viele stehen noch?`
        : a > 10
          ? `Die ${a} hat schon einen Zehner. Von ${a - 10} bis 10 fehlen ${10 - (a - 10)}.`
          : `Erst bis zur 10 sind es ${10 - a}. Dann noch 10 bis zur 20.`;
    const solution = `${a} + ${ans} = ${target}.`;
    const form = level === 1 || level === 4 ? "gap" : pick(["gap", "front", "minus"] as const);
    const term = form === "gap" ? `${a} + ? = ${target}` : form === "front" ? `? + ${a} = ${target}` : `${target} − ${a} = ?`;
    return numeric(ctx, term, ans, { question: "Welche Zahl fehlt?", hint, solution }, [0, 20]);
  },
};

const plus20: Skill = {
  id: "plus20",
  title: "Plus & Minus bis 20",
  world: "start",
  gen: (ctx) => {
    const { level } = ctx;
    if (level >= 3 && chance(0.3)) {
      const bottom = level >= 4 ? [randInt(1, 6), randInt(1, 6), randInt(1, 6)] : [randInt(2, 9), randInt(1, 9)];
      const w = wall(bottom, level >= 4 && chance(0.5) ? "bottom" : "top");
      return { format: "wall", question: "Welche Zahl fehlt in der Mauer?", rows: w.rows, answer: w.answer, hint: w.hint, solution: w.solution };
    }
    if (level === 1) {
      const a = randInt(1, 8);
      const b = randInt(1, 10 - a);
      return numeric(ctx, `${a} + ${b} = ?`, a + b, { hint: `Starte bei ${a} und zähl ${b} weiter.`, solution: `${a} + ${b} = ${a + b}.` }, [0, 20]);
    }
    if (level === 2) {
      const a = randInt(3, 10);
      const b = randInt(1, a - 1);
      return numeric(ctx, `${a} − ${b} = ?`, a - b, { hint: `Starte bei ${a} und geh ${b} zurück.`, solution: `${a} − ${b} = ${a - b}.` }, [0, 20]);
    }
    const o = randInt(1, 8);
    const a = 10 + o;
    if (level === 3 || (level === 5 && chance(0.3))) {
      const b = randInt(1, 9 - o);
      return numeric(ctx, `${a} + ${b} = ?`, a + b, { hint: `Die 10 bleibt stehen: ${o} + ${b} = ${o + b}.`, solution: `${a} + ${b} = ${a + b}.` }, [0, 20]);
    }
    const b = randInt(1, o);
    if (level === 4 || chance(0.5)) {
      return numeric(ctx, `${a} − ${b} = ?`, a - b, { hint: `Die 10 bleibt stehen: ${o} − ${b} = ${o - b}.`, solution: `${a} − ${b} = ${a - b}.` }, [0, 20]);
    }
    return numeric(ctx, `${a - b} + ? = ${a}`, b, { question: "Welche Zahl fehlt?", hint: `Wie viele fehlen von ${a - b} bis ${a}? Zähl weiter.`, solution: `${a - b} + ${b} = ${a}.` }, [0, 20]);
  },
};

const uebergang20: Skill = {
  id: "uebergang20",
  title: "Über die 10 springen",
  world: "start",
  trick: {
    title: "Erst zur 10, dann weiter",
    example: "8 + 5",
    steps: ["Wie viel fehlt von 8 bis zur 10? Genau 2.", "8 + 2 = 10. Von der 5 sind jetzt noch 3 übrig.", "10 + 3 = 13. Fertig!"],
  },
  gen: (ctx) => {
    const { level } = ctx;
    const plus = level <= 2 || (level === 4 && chance(0.5)) || (level === 5 && chance(0.5));
    if (plus) {
      const a = level === 1 ? randInt(8, 9) : randInt(5, 9);
      const b = randInt(11 - a, 9);
      const sum = a + b;
      const to10 = 10 - a;
      const hint = `Erst bis zur 10: ${a} + ${to10} = 10. Dann noch ${b - to10} dazu.`;
      const solution = `${a} + ${to10} = 10, 10 + ${b - to10} = ${sum}.`;
      if (level === 5) return numeric(ctx, `${a} + ? = ${sum}`, b, { question: "Welche Zahl fehlt?", hint: `Von ${a} bis 10 sind es ${to10}, von 10 bis ${sum} noch ${sum - 10}.`, solution: `${to10} + ${sum - 10} = ${b}, also ${a} + ${b} = ${sum}.` }, [0, 20]);
      return numeric(ctx, `${a} + ${b} = ?`, sum, { hint, solution }, [0, 20]);
    }
    const a = randInt(11, 17);
    const o = a - 10;
    const b = randInt(o + 1, 9);
    const diff = a - b;
    const hint = `Erst runter zur 10: ${a} − ${o} = 10. Dann noch ${b - o} weg.`;
    const solution = `${a} − ${o} = 10, 10 − ${b - o} = ${diff}.`;
    if (level === 5) return numeric(ctx, `${a} − ? = ${diff}`, b, { question: "Welche Zahl fehlt?", hint: `Von ${diff} bis 10 sind es ${10 - diff}, von 10 bis ${a} noch ${o}.`, solution: `${10 - diff} + ${o} = ${b}, also ${a} − ${b} = ${diff}.` }, [0, 20]);
    return numeric(ctx, `${a} − ${b} = ?`, diff, { hint, solution }, [0, 20]);
  },
};

const doppelt: Skill = {
  id: "doppelt",
  title: "Verdoppeln & Halbieren",
  world: "start",
  gen: (ctx) => {
    const { level } = ctx;
    if (level <= 2 || level === 4) {
      const n = level === 1 ? randInt(1, 5) : level === 2 ? randInt(6, 10) : randInt(11, 25);
      const t = tensOf(n);
      const o = n % 10;
      const hint = n < 10 ? `Doppelt heißt: zweimal die ${n}. Rechne ${n} + ${n}.` : `Verdopple Zehner und Einer einzeln: ${t} + ${t} = ${2 * t} und ${o} + ${o} = ${2 * o}.`;
      const term = chance(0.5) ? `${n} + ${n} = ?` : `Doppelt von ${n} = ?`;
      return numeric(ctx, term, 2 * n, { question: "Wie viel ist das Doppelte?", hint, solution: `${n} + ${n} = ${2 * n}.` });
    }
    const half = level === 3 ? randInt(1, 10) : randInt(10, 50);
    const n = half * 2;
    const t = tensOf(n);
    const o = n % 10;
    const hint = n <= 20 ? `Welche Zahl plus sich selbst ergibt ${n}?` : `Halbiere Zehner und Einer einzeln: die Hälfte von ${t} ist ${t / 2}, die Hälfte von ${o} ist ${o / 2}.`;
    return numeric(ctx, `Hälfte von ${n} = ?`, half, { question: "Wie viel ist die Hälfte?", hint, solution: `${half} + ${half} = ${n}, also ist die Hälfte ${half}.` });
  },
};

// ---------------------------------------------------------------------------
// Welt 1 · Zahlenwald

const zehnerEiner: Skill = {
  id: "zehnerEiner",
  title: "Zehner & Einer",
  world: "wald",
  trick: {
    title: "Stangen und Würfel",
    example: "34",
    steps: ["Eine lange Stange sind 10 Würfel — ein Zehner.", "Die 3 vorne sagt: 3 Stangen, also 30.", "Die 4 hinten sagt: 4 einzelne Würfel.", "30 und 4 sind zusammen 34."],
  },
  gen: (ctx) => {
    const { level } = ctx;
    const max = level === 1 ? 39 : level === 2 ? 59 : 99;
    const format = chooseFormat(ctx, level <= 3 ? ["tens-ones", "choice", "input"] : ["tens-ones", "input", "choice"]);
    const n = randInt(11, max);
    const t = Math.floor(n / 10);
    const o = n % 10;
    if (format === "tens-ones") {
      return { format, question: `Lege die Zahl ${n}`, target: n, hint: `Die ${t} vorne sagt dir die Zehner-Stangen, die ${o} hinten die Einer-Würfel.`, solution: `${n} sind ${t} Zehner und ${o} Einer.` };
    }
    if (level >= 4) {
      // Bündeln: 2 Zehner + 15 Einer
      const tt = randInt(1, 6);
      const oo = randInt(11, 19);
      const sum = tt * 10 + oo;
      const hint = `Aus 10 Einern wird ein Zehner. ${oo} Einer sind 1 Zehner und ${oo - 10} Einer.`;
      const solution = `${tt} Zehner + ${oo} Einer = ${tt + 1} Zehner + ${oo - 10} Einer = ${sum}.`;
      if (format === "input") return { format, question: "Welche Zahl ist das?", term: `${tt} Z + ${oo} E = ?`, answer: sum, hint, solution };
      // Typischer Fehler: Ziffern einfach hintereinander schreiben (2 Z + 15 E → 215).
      const options = shuffle([sum, sum - 10, sum + 10, Number(`${tt}${oo}`)]).map(String);
      return { format: "choice", question: "Welche Zahl ist das?", term: `${tt} Z + ${oo} E`, options, answer: String(sum), hint, solution };
    }
    if (format === "input") {
      return { format, question: "Welche Zahl ist das?", term: `${t} Z + ${o} E = ?`, answer: n, hint: `${t} Zehner sind ${t * 10}. Dazu ${o} Einer.`, solution: `${t * 10} + ${o} = ${n}.` };
    }
    const askTens = chance(0.5);
    const answer = askTens ? t : o;
    const options = shuffle(Array.from(new Set([answer, askTens ? o : t, answer + 1, Math.max(0, answer - 1), answer + 2])).slice(0, 4)).map(String);
    return {
      format: "choice",
      question: askTens ? `Wie viele Zehner hat die ${n}?` : `Wie viele Einer hat die ${n}?`,
      term: String(n),
      options,
      answer: String(answer),
      hint: askTens ? "Die Zehner stehen vorne." : "Die Einer stehen hinten.",
      solution: `${n} sind ${t} Zehner und ${o} Einer.`,
    };
  },
};

const zahlenstrahl: Skill = {
  id: "zahlenstrahl",
  title: "Zahlenstrahl",
  world: "wald",
  gen: (ctx) => {
    const { level } = ctx;
    let from: number, to: number, step: number, labels: number[];
    if (level === 1) [from, to, step, labels] = [0, 10, 1, [0, 5, 10]];
    else if (level === 2) [from, to, step, labels] = [0, 100, 10, [0, 50, 100]];
    else if (level === 3) {
      from = randInt(1, 5) * 10;
      [to, step, labels] = [from + 40, 5, [from, from + 40]];
    } else if (level === 4) {
      from = randInt(1, 8) * 10;
      [to, step, labels] = [from + 10, 1, [from, from + 10]];
    } else [from, to, step, labels] = [0, 100, 10, [0, 100]];
    const candidates: number[] = [];
    for (let v = from + step; v < to; v += step) if (!labels.includes(v)) candidates.push(v);
    const target = pick(candidates);
    const k = (target - from) / step;
    return {
      format: "number-line",
      question: `Wo liegt die ${target}?`,
      from,
      to,
      step,
      labels,
      target,
      hint: step === 1 ? `Jeder Strich ist 1 weiter. Zähl ab ${from}.` : `Jeder Strich ist ${step} weiter. Zähl ab ${from} in ${step}er-Schritten.`,
      solution: `${target} ist der ${k}. Strich nach ${from}.`,
    };
  },
};

function compareSym(a: number, b: number): "<" | ">" | "=" {
  return a < b ? "<" : a > b ? ">" : "=";
}

const vergleichen: Skill = {
  id: "vergleichen",
  title: "Größer oder kleiner?",
  world: "wald",
  gen: (ctx) => {
    const { level } = ctx;
    let left: string, right: string, lv: number, rv: number, hint: string;
    if (level <= 3) {
      if (level === 1) {
        lv = randInt(1, 20);
        rv = chance(0.15) ? lv : randInt(1, 20);
      } else if (level === 2) {
        lv = randInt(10, 99);
        rv = chance(0.1) ? lv : randInt(10, 99);
      } else {
        lv = randInt(12, 98);
        const swap = lv % 10 !== 0 && Math.floor(lv / 10) !== lv % 10 && chance(0.5);
        rv = swap ? (lv % 10) * 10 + Math.floor(lv / 10) : tensOf(lv) + randInt(0, 9);
      }
      left = String(lv);
      right = String(rv);
      hint = level === 1 ? "Welche Zahl kommt beim Zählen später? Die ist größer." : "Schau zuerst auf die Zehner. Sind die gleich, entscheiden die Einer.";
    } else {
      const a = randInt(2, 8) * 10;
      const b = randInt(1, 9);
      lv = a + b;
      left = `${a} + ${b}`;
      if (level === 4) {
        rv = lv + pick([-1, 0, 1, 10, -10]);
        right = String(rv);
      } else {
        const c = tensOf(lv) + 10;
        const d = c - lv + pick([-1, 0, 1]);
        rv = c - d;
        right = `${c} − ${d}`;
      }
      hint = `Rechne zuerst aus: ${left} = ${lv}.`;
    }
    const answer = compareSym(lv, rv);
    return {
      format: "compare",
      question: "Größer, kleiner oder gleich?",
      left,
      right,
      answer,
      hint,
      solution: `${lv} ${answer} ${rv}${answer === "=" ? " — beide sind gleich groß." : answer === "<" ? " — links ist kleiner." : " — links ist größer."}`,
    };
  },
};

const nachbarn: Skill = {
  id: "nachbarn",
  title: "Nachbarzahlen",
  world: "wald",
  gen: (ctx) => {
    const { level } = ctx;
    if (level === 3) {
      let n = randInt(11, 98);
      if (n % 10 === 0) n += 3;
      const lo = tensOf(n);
      const correct = `${lo} und ${lo + 10}`;
      const wrong = [...new Set([`${lo - 10} und ${lo}`, `${lo} und ${n + 1}`, `${n - 1} und ${n + 1}`, `${lo + 10} und ${lo + 20}`])].filter((w) => w !== correct).slice(0, 3);
      return { format: "choice", question: `Welche Zehner-Nachbarn hat die ${n}?`, term: String(n), options: shuffle([correct, ...wrong]), answer: correct, hint: `Zehner-Nachbarn sind volle Zehner. Welcher kommt vor ${n}, welcher danach?`, solution: `${n} liegt zwischen ${lo} und ${lo + 10}.` };
    }
    if (level === 5) {
      const wide = chance(0.5);
      const a = wide ? randInt(1, 9) * 10 : randInt(10, 97);
      const b = wide ? a + 10 : a + 2;
      const mid = (a + b) / 2;
      return numeric(ctx, `${a} … ? … ${b}`, mid, { question: `Welche Zahl liegt genau in der Mitte?`, hint: wide ? `Zwischen zwei Zehnern liegt die Mitte bei der 5.` : `Zähl von ${a} einen Schritt weiter.`, solution: `${mid} liegt genau zwischen ${a} und ${b}.` });
    }
    const max = level === 1 ? 19 : 99;
    let n = randInt(2, max);
    if (level === 4) n = chance(0.5) ? randInt(1, 9) * 10 + 9 : randInt(2, 9) * 10;
    const after = level === 1 ? true : level === 4 ? n % 10 === 9 : chance(0.5);
    const ans = after ? n + 1 : n - 1;
    return numeric(ctx, after ? `${n}, ?` : `?, ${n}`, ans, {
      question: after ? `Welche Zahl kommt direkt nach ${n}?` : `Welche Zahl kommt direkt vor ${n}?`,
      hint: after ? `Zähl von ${n} einen Schritt weiter.` : `Zähl von ${n} einen Schritt zurück.`,
      solution: after ? `Nach ${n} kommt ${ans}.` : `Vor ${n} kommt ${ans}.`,
    });
  },
};

const reihen: Skill = {
  id: "reihen",
  title: "Zahlenreihen",
  world: "wald",
  gen: (ctx) => {
    const { level } = ctx;
    let step: number, start: number;
    if (level === 1) [step, start] = [1, randInt(1, 15)];
    else if (level === 2) [step, start] = [2, randInt(0, 12)];
    else if (level === 3) {
      step = pick([5, 10]);
      start = step === 5 ? randInt(0, 10) * 5 : randInt(0, 5) * 10;
    } else if (level === 4) {
      step = -pick([2, 5, 10]);
      start = randInt(60, 99);
      if (step === -5) start = tensOf(start) + 5;
      if (step === -10) start = tensOf(start);
    } else {
      step = pick([3, 4, 10, 11]);
      start = randInt(1, 30);
    }
    const seq = [0, 1, 2, 3].map((i) => start + i * step);
    const ans = start + 4 * step;
    const sign = step > 0 ? "+" : "−";
    return numeric(ctx, `${seq.join(", ")}, ?`, ans, {
      question: "Wie geht die Reihe weiter?",
      hint: `Wie groß ist der Sprung von ${seq[0]} zu ${seq[1]}?`,
      solution: `Immer ${sign} ${Math.abs(step)}: ${seq[3]} ${sign} ${Math.abs(step)} = ${ans}.`,
    }, [0, 200]);
  },
};

const geradeUngerade: Skill = {
  id: "geradeUngerade",
  title: "Gerade & ungerade",
  world: "wald",
  gen: (ctx) => {
    const { level } = ctx;
    const hint = "Schau nur auf die letzte Ziffer: 0, 2, 4, 6 und 8 sind gerade.";
    if (level <= 2) {
      const n = randInt(1, level === 1 ? 20 : 99);
      const answer = n % 2 === 0 ? "gerade" : "ungerade";
      return { format: "choice", question: `Ist die ${n} gerade oder ungerade?`, term: String(n), options: ["gerade", "ungerade"], answer, hint, solution: `${n} endet auf ${n % 10} — also ${answer}.` };
    }
    const wantEven = chance(0.5);
    const pickN = (even: boolean) => {
      const n = randInt(10, 99);
      return n % 2 === 0 === even ? n : n + 1;
    };
    const answer = pickN(wantEven);
    const others = new Set<number>();
    while (others.size < 3) {
      const n = pickN(!wantEven);
      if (n !== answer && n <= 100) others.add(n);
    }
    const word = wantEven ? "gerade" : "ungerade";
    return { format: "choice", question: `Welche Zahl ist ${word}?`, options: shuffle([answer, ...others]).map(String), answer: String(answer), hint, solution: `${answer} endet auf ${answer % 10} — also ${word}.` };
  },
};

// ---------------------------------------------------------------------------
// Welt 2 · Plus-Minus-Strand

const zehnerPlus: Skill = {
  id: "zehnerPlus",
  title: "Mit Zehnern rechnen",
  world: "strand",
  gen: (ctx) => {
    const { level } = ctx;
    if (level <= 2) {
      const a = randInt(1, 8);
      const b = level === 1 ? randInt(1, 9 - a) : randInt(1, a - 1 || 1);
      const plus = level === 1;
      const res = plus ? a + b : a - b;
      if (!plus && a === 1) return zehnerPlus.gen(ctx);
      return numeric(ctx, `${a * 10} ${plus ? "+" : "−"} ${b * 10} = ?`, res * 10, {
        hint: `Rechne mit den Zehnern wie mit kleinen Zahlen: ${a} ${plus ? "+" : "−"} ${b} = ${res}. Also ${res * 10}.`,
        solution: `${a * 10} ${plus ? "+" : "−"} ${b * 10} = ${res * 10}.`,
      });
    }
    const a = randInt(11, 89);
    const o = a % 10;
    const plus = level === 3 || (level === 5 && chance(0.5));
    const maxTens = plus ? Math.floor((99 - a) / 10) : Math.floor(a / 10) - 1;
    if (maxTens < 1 || o === 0) return zehnerPlus.gen(ctx);
    const b = randInt(1, maxTens) * 10;
    const res = plus ? a + b : a - b;
    const sym = plus ? "+" : "−";
    const hint = `Nur die Zehner ändern sich, die ${o} hinten bleibt stehen.`;
    if (level === 5) return numeric(ctx, `${a} ${sym} ? = ${res}`, b, { question: "Welche Zahl fehlt?", hint: `Die Einer sind gleich geblieben. Wie viele Zehner sind ${plus ? "dazugekommen" : "weggegangen"}?`, solution: `${a} ${sym} ${b} = ${res}.` });
    return numeric(ctx, `${a} ${sym} ${b} = ?`, res, { hint, solution: `${a} ${sym} ${b} = ${res}.` });
  },
};

const einerPlus: Skill = {
  id: "einerPlus",
  title: "Einer dazu und weg",
  world: "strand",
  gen: (ctx) => {
    const { level } = ctx;
    if (level <= 3) {
      const plus = level === 1 || (level === 3 && chance(0.5));
      const t = randInt(2, 9) * 10;
      const o = plus ? randInt(0, 7) : randInt(2, 9);
      const a = t + o;
      const b = plus ? randInt(1, 9 - o) : randInt(1, o);
      const res = plus ? a + b : a - b;
      const sym = plus ? "+" : "−";
      return numeric(ctx, `${a} ${sym} ${b} = ?`, res, { hint: `Die Zehner bleiben stehen: ${o} ${sym} ${b} = ${plus ? o + b : o - b}.`, solution: `${a} ${sym} ${b} = ${res}.` });
    }
    const plus = level === 4 || chance(0.5);
    const a = plus ? randInt(21, 64) : randInt(46, 99);
    const ao = a % 10;
    const bT = randInt(1, plus ? Math.floor((99 - a) / 10) : Math.floor(a / 10) - 1) * 10;
    const bO = plus ? randInt(0, 9 - ao) : randInt(0, ao);
    const b = bT + bO;
    if (b < 11 || bO === 0) return einerPlus.gen(ctx);
    const res = plus ? a + b : a - b;
    const sym = plus ? "+" : "−";
    const step1 = plus ? a + bT : a - bT;
    return numeric(ctx, `${a} ${sym} ${b} = ?`, res, {
      hint: `Erst die Zehner: ${a} ${sym} ${bT} = ${step1}. Dann die Einer.`,
      solution: `${a} ${sym} ${bT} = ${step1}, ${step1} ${sym} ${bO} = ${res}.`,
    });
  },
};

const ergaenzen: Skill = {
  id: "ergaenzen",
  title: "Ergänzen",
  world: "strand",
  gen: (ctx) => {
    const { level } = ctx;
    const form = level === 1 ? "ten" : level === 2 ? "hundredTens" : level === 3 ? pick(["ten", "hundredTens"] as const) : level === 4 ? "hundred" : pick(["hundred", "minus"] as const);
    if (form === "ten") {
      const a = randInt(11, 98);
      if (a % 10 === 0) return ergaenzen.gen(ctx);
      const t = nextTen(a);
      return numeric(ctx, `${a} + ? = ${t}`, t - a, { question: "Welche Zahl fehlt?", hint: `Wie viele Einer fehlen von ${a % 10} bis 10?`, solution: `${a} + ${t - a} = ${t}.` });
    }
    if (form === "hundredTens") {
      const a = randInt(1, 9) * 10;
      return numeric(ctx, `${a} + ? = 100`, 100 - a, { question: "Welche Zahl fehlt?", hint: `Denk an Zahlenfreunde: ${a / 10} + ${10 - a / 10} = 10.`, solution: `${a} + ${100 - a} = 100.` });
    }
    const a = randInt(11, 89);
    if (a % 10 === 0) return ergaenzen.gen(ctx);
    const t = nextTen(a);
    const ans = 100 - a;
    const hint = `Erst bis zum nächsten Zehner: ${a} + ${t - a} = ${t}. Dann bis 100: noch ${100 - t}.`;
    const solution = `${t - a} + ${100 - t} = ${ans}, also ${a} + ${ans} = 100.`;
    if (form === "minus") return numeric(ctx, `100 − ? = ${a}`, ans, { question: "Welche Zahl fehlt?", hint: `Wie viel fehlt von ${a} bis 100? ${hint}`, solution });
    return numeric(ctx, `${a} + ? = 100`, ans, { question: "Welche Zahl fehlt?", hint, solution });
  },
};

const mauern: Skill = {
  id: "mauern",
  title: "Zahlenmauern",
  world: "strand",
  gen: (ctx) => {
    const { level } = ctx;
    const q = "Welche Zahl fehlt in der Mauer?";
    let w;
    if (level === 1) w = wall([randInt(2, 10), randInt(2, 10)], "top");
    else if (level === 2) w = wall([randInt(1, 10), randInt(1, 10), randInt(1, 10)], "top");
    else if (level === 3) w = wall([randInt(3, 15), randInt(3, 15)], "bottom");
    else if (level === 4) w = wall([randInt(2, 20), randInt(2, 20), randInt(2, 20)], pick(["middle", "bottom"] as const));
    else w = wall([randInt(5, 30), randInt(5, 30), randInt(5, 30)], pick(["top", "middle", "bottom"] as const));
    return { format: "wall", question: q, rows: w.rows, answer: w.answer, hint: w.hint, solution: w.solution };
  },
};

const uebergang100: Skill = {
  id: "uebergang100",
  title: "Über den Zehner",
  world: "strand",
  trick: {
    title: "Am Zehner Pause machen",
    example: "38 + 5",
    steps: ["Von 38 bis zum nächsten Zehner fehlen 2.", "38 + 2 = 40. Pause am Zehner!", "Von der 5 sind noch 3 übrig: 40 + 3 = 43."],
  },
  gen: (ctx) => {
    const { level } = ctx;
    const form = level === 1 ? "plusE" : level === 2 ? "minusE" : level === 3 ? "plusZE" : level === 4 ? "minusZE" : pick(["plusE", "minusE", "plusZE", "minusZE", "gap"] as const);
    if (form === "plusE") {
      const a = randInt(12, 88);
      const o = a % 10;
      if (o < 2) return uebergang100.gen(ctx);
      const b = randInt(11 - o, 9);
      const to = 10 - o;
      return numeric(ctx, `${a} + ${b} = ?`, a + b, { hint: `Erst bis zum Zehner: ${a} + ${to} = ${a + to}. Dann noch ${b - to}.`, solution: `${a} + ${to} = ${a + to}, ${a + to} + ${b - to} = ${a + b}.` });
    }
    if (form === "minusE") {
      const a = randInt(21, 98);
      const o = a % 10;
      if (o === 0 || o === 9) return uebergang100.gen(ctx);
      const b = randInt(o + 1, 9);
      return numeric(ctx, `${a} − ${b} = ?`, a - b, { hint: `Erst runter zum Zehner: ${a} − ${o} = ${a - o}. Dann noch ${b - o} weg.`, solution: `${a} − ${o} = ${a - o}, ${a - o} − ${b - o} = ${a - b}.` });
    }
    if (form === "plusZE") {
      const a = randInt(15, 69);
      const ao = a % 10;
      if (ao < 2) return uebergang100.gen(ctx);
      const bO = randInt(11 - ao, 9);
      const bT = randInt(1, Math.max(1, Math.floor((100 - a - bO) / 10))) * 10;
      if (a + bT + bO > 100) return uebergang100.gen(ctx);
      const s1 = a + bT;
      return numeric(ctx, `${a} + ${bT + bO} = ?`, s1 + bO, { hint: `Erst die Zehner: ${a} + ${bT} = ${s1}. Dann ${s1} + ${bO} — Pause am Zehner!`, solution: `${a} + ${bT} = ${s1}, ${s1} + ${bO} = ${s1 + bO}.` });
    }
    if (form === "minusZE") {
      const a = randInt(41, 98);
      const ao = a % 10;
      if (ao === 9) return uebergang100.gen(ctx);
      const bO = randInt(ao + 1, 9);
      const bT = randInt(1, Math.floor(a / 10) - 2) * 10;
      if (bT < 10) return uebergang100.gen(ctx);
      const s1 = a - bT;
      return numeric(ctx, `${a} − ${bT + bO} = ?`, s1 - bO, { hint: `Erst die Zehner weg: ${a} − ${bT} = ${s1}. Dann noch ${bO} weg — Pause am Zehner!`, solution: `${a} − ${bT} = ${s1}, ${s1} − ${bO} = ${s1 - bO}.` });
    }
    const a = randInt(23, 78);
    const b = randInt(6, 19);
    const sum = a + b;
    if (sum % 10 === 0 || tensOf(a) === tensOf(sum)) return uebergang100.gen(ctx);
    const t = nextTen(a);
    return numeric(ctx, `${a} + ? = ${sum}`, b, { question: "Welche Zahl fehlt?", hint: `Von ${a} bis ${t} sind es ${t - a}, von ${t} bis ${sum} noch ${sum - t}.`, solution: `${t - a} + ${sum - t} = ${b}.` });
  },
};

export const SKILLS: Record<string, Skill> = Object.fromEntries(
  [freunde10, plus20, uebergang20, doppelt, zehnerEiner, zahlenstrahl, vergleichen, nachbarn, reihen, geradeUngerade, zehnerPlus, einerPlus, ergaenzen, mauern, uebergang100, ...HAFEN_SKILLS].map((s) => [s.id, s]),
);

export function getSkill(id: string): Skill {
  const s = SKILLS[id];
  if (!s) throw new Error(`Unbekannte Kompetenz: ${id}`);
  return s;
}
