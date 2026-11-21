// Welt 11 · Sternen-Expedition — Klasse-3-Vorschau für Überflieger:
// Zahlen bis 1000. Hunderter, Zehner, Einer; Zahlenstrahl bis 1000;
// vergleichen; mit Hundertern und Zehnern rechnen; bis zum Hunderter ergänzen.

import type { TaskDraft } from "./types";
import { chance, pick, randInt, shuffle } from "./random";
import { chooseFormat, numeric, type Skill } from "./genkit";

const R1000: [number, number] = [0, 1000];

/** „3 H 4 Z 7 E" — Hunderter, Zehner, Einer. */
const hze = (n: number) => `${Math.floor(n / 100)} H ${Math.floor(n / 10) % 10} Z ${n % 10} E`;

const hunderter: Skill = {
  id: "hunderter",
  title: "Hunderter, Zehner, Einer",
  world: "expedition",
  trick: {
    title: "Hunderter, Zehner, Einer",
    example: "347 = 300 + 40 + 7",
    steps: [
      "Eine dreistellige Zahl hat drei Plätze: Hunderter, Zehner, Einer.",
      "Bei 347 steht vorne die 3: drei Hunderter, also 300.",
      "Dann die 4: vier Zehner, also 40. Und hinten 7 Einer.",
      "Zusammen: 300 + 40 + 7 = 347.",
    ],
  },
  gen: (ctx) => {
    const { level } = ctx;
    const h = randInt(1, 9);
    const z = level <= 1 ? 0 : randInt(level >= 4 ? 0 : 1, 9);
    const e = level <= 1 ? 0 : randInt(level >= 4 ? 0 : 1, 9);
    const n = level === 1 ? h * 100 + 10 * randInt(0, 9) : h * 100 + z * 10 + e;
    const form = level <= 2 ? pick(["build", "count"] as const) : pick(["build", "count", "split", "digit"] as const);
    if (form === "build") {
      const hint = `${Math.floor(n / 100)} Hunderter sind ${Math.floor(n / 100) * 100}. Dann die Zehner und Einer dazu.`;
      return numeric(ctx, `${hze(n)} = ?`, n, { question: "Welche Zahl ist das?", hint, solution: `${Math.floor(n / 100) * 100} + ${(Math.floor(n / 10) % 10) * 10} + ${n % 10} = ${n}.` }, R1000);
    }
    if (form === "count") {
      return numeric(ctx, `${n} = ? H ${Math.floor(n / 10) % 10} Z ${n % 10} E`, Math.floor(n / 100), {
        question: "Wie viele Hunderter hat die Zahl?",
        hint: "Die Hunderter stehen ganz vorne.",
        solution: `${n}: vorne steht die ${Math.floor(n / 100)} — also ${Math.floor(n / 100)} Hunderter.`,
      }, [0, 10]);
    }
    if (form === "split") {
      const tens = (Math.floor(n / 10) % 10) * 10;
      const rest = n - tens;
      return numeric(ctx, `${n} = ${Math.floor(n / 100) * 100} + ? + ${n % 10}`, tens, {
        question: "Welche Zahl fehlt?",
        hint: `Schau auf die Mitte von ${n}: Das sind die Zehner.`,
        solution: `${n} − ${rest} = ${tens}. ${Math.floor(n / 100) * 100} + ${tens} + ${n % 10} = ${n}.`,
      }, R1000);
    }
    // Welche Zahl hat … Zehner? → Auswahl aus vertauschten Ziffern
    const digits = [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10];
    const variants = new Set<number>([n]);
    const perms = [
      [digits[0], digits[2], digits[1]],
      [digits[1], digits[0], digits[2]],
      [digits[2], digits[1], digits[0]],
      [digits[1], digits[2], digits[0]],
    ];
    for (const p of perms) {
      const v = p[0] * 100 + p[1] * 10 + p[2];
      if (p[0] > 0 && variants.size < 4) variants.add(v);
    }
    let bump = 1;
    while (variants.size < 4) {
      variants.add(n + bump * 100 <= 999 ? n + bump * 100 : n - bump * 100);
      bump++;
    }
    return {
      format: "choice",
      question: `Welche Zahl hat ${hze(n).replace(/ H /, " Hunderter, ").replace(/ Z /, " Zehner und ").replace(/ E$/, " Einer")}?`,
      options: shuffle([...variants]).map(String),
      answer: String(n),
      hint: "Erst die Hunderter, dann die Zehner, dann die Einer — in dieser Reihenfolge von vorne nach hinten.",
      solution: `${hze(n)} schreibt man ${n}.`,
    };
  },
};

const zahlenstrahl1000: Skill = {
  id: "zahlenstrahl1000",
  title: "Zahlenstrahl bis 1000",
  world: "expedition",
  gen: (ctx) => {
    const { level } = ctx;
    const format = chooseFormat(ctx, level <= 2 ? ["number-line"] : ["number-line", "choice", "input"]);
    if (format === "number-line") {
      let from: number;
      let step: number;
      if (level <= 2) {
        from = 0;
        step = 100;
      } else if (level <= 4) {
        from = randInt(0, 9) * 100;
        step = 10;
      } else {
        from = randInt(0, 9) * 100 + randInt(0, 9) * 10;
        step = 1;
      }
      const to = from + 10 * step;
      const k = randInt(1, 9);
      const target = from + k * step;
      const labels = level <= 1 ? [from, from + 5 * step, to] : [from, to];
      return {
        format: "number-line",
        question: `Wo liegt die ${target}?`,
        from,
        to,
        step,
        labels,
        target,
        hint: `Jeder Strich ist ${step} mehr. Zähl von ${from} in ${step}er-Schritten.`,
        solution: `${from} + ${k} · ${step} = ${target}.`,
      };
    }
    // Nachbarhunderter / Nachbarzehner
    const n = randInt(101, 989);
    if (n % 10 === 0) return zahlenstrahl1000.gen(ctx);
    if (chance(0.5)) {
      const up = Math.ceil(n / 100) * 100;
      return numeric(ctx, `${n} → ?`, up, {
        question: `Welcher Hunderter kommt nach ${n}?`,
        hint: `Die Hunderter sind 100, 200, 300 … Welcher ist der nächste nach ${n}?`,
        solution: `${Math.floor(n / 100) * 100} < ${n} < ${up}. Der nächste Hunderter ist ${up}.`,
      }, R1000);
    }
    const down = Math.floor(n / 10) * 10;
    return numeric(ctx, `? ← ${n}`, down, {
      question: `Welcher Zehner kommt vor ${n}?`,
      hint: `Mach die Einer zu 0: Aus ${n} wird …`,
      solution: `${down} < ${n} < ${down + 10}. Der Zehner davor ist ${down}.`,
    }, R1000);
  },
};

const vergleichen1000: Skill = {
  id: "vergleichen1000",
  title: "Vergleichen bis 1000",
  world: "expedition",
  gen: (ctx) => {
    const { level } = ctx;
    let a = randInt(100, 999);
    let b: number;
    if (level <= 2) b = randInt(100, 999);
    else if (level <= 3) b = Math.floor(a / 100) * 100 + randInt(0, 99); // gleicher Hunderter
    else b = (a % 10) * 100 + (Math.floor(a / 10) % 10) * 10 + Math.floor(a / 100); // Zahlendreher
    if (b < 100) b = a + (chance(0.5) ? 10 : -10);
    if (level >= 5 && chance(0.5)) {
      // Rechnung gegen Zahl
      const x = randInt(1, 8) * 100;
      const y = randInt(1, 9 - x / 100) * 100;
      b = x + y + pick([-10, 0, 10]);
      const left = `${x} + ${y}`;
      const sum = x + y;
      const answer = sum < b ? "<" : sum > b ? ">" : "=";
      return { format: "compare", question: "Größer, kleiner oder gleich?", left, right: String(b), answer, hint: `Rechne erst ${x} + ${y} aus.`, solution: `${x} + ${y} = ${sum}. ${sum} ${answer} ${b}.` };
    }
    if (a === b) a = Math.min(999, a + 1);
    const answer = a < b ? "<" : a > b ? ">" : "=";
    const sameH = Math.floor(a / 100) === Math.floor(b / 100);
    return {
      format: "compare",
      question: "Größer, kleiner oder gleich?",
      left: String(a),
      right: String(b),
      answer,
      hint: sameH ? "Die Hunderter sind gleich — dann vergleiche die Zehner." : "Schau zuerst auf die Hunderter, ganz vorne.",
      solution: `${a} ${answer} ${b}.`,
    };
  },
};

const hunderterRechnen: Skill = {
  id: "hunderterRechnen",
  title: "Rechnen mit Hundertern",
  world: "expedition",
  trick: {
    title: "Hunderter wie Einer",
    example: "300 + 400 = 700",
    steps: [
      "Hunderter rechnest du wie Einer — nur mit zwei Nullen dran.",
      "3 + 4 = 7. Also 3 Hunderter + 4 Hunderter = 7 Hunderter.",
      "300 + 400 = 700.",
    ],
  },
  gen: (ctx): TaskDraft => {
    const { level } = ctx;
    if (level === 1) {
      const a = randInt(1, 8);
      const b = randInt(1, 9 - a);
      if (chance(0.5)) return numeric(ctx, `${a * 100} + ${b * 100} = ?`, (a + b) * 100, { hint: `Denk an ${a} + ${b} = ${a + b}. Dann zwei Nullen dran.`, solution: `${a} + ${b} = ${a + b}, also ${(a + b) * 100}.` }, R1000);
      return numeric(ctx, `${(a + b) * 100} − ${b * 100} = ?`, a * 100, { hint: `Denk an ${a + b} − ${b} = ${a}. Dann zwei Nullen dran.`, solution: `${a + b} − ${b} = ${a}, also ${a * 100}.` }, R1000);
    }
    if (level === 2) {
      // Hunderter + Zehner/Einer: 400 + 35
      const h = randInt(1, 9) * 100;
      const r = randInt(11, 99);
      if (chance(0.5)) return numeric(ctx, `${h} + ${r} = ?`, h + r, { hint: `Die ${r} kommt einfach hinten an die ${h} dran.`, solution: `${h} + ${r} = ${h + r}.` }, R1000);
      return numeric(ctx, `${h + r} − ${r} = ?`, h, { hint: `Nimm die ${r} hinten weg.`, solution: `${h + r} − ${r} = ${h}.` }, R1000);
    }
    if (level === 3) {
      // Zehner dazu/weg ohne Übergang: 340 + 50
      const h = randInt(1, 9);
      const z1 = randInt(1, 8);
      const z2 = randInt(1, 9 - z1);
      const e = randInt(0, 9);
      const a = h * 100 + z1 * 10 + e;
      if (chance(0.5)) return numeric(ctx, `${a} + ${z2 * 10} = ?`, a + z2 * 10, { hint: `Nur die Zehner ändern sich: ${z1} + ${z2} = ${z1 + z2}.`, solution: `${a} + ${z2 * 10} = ${a + z2 * 10}.` }, R1000);
      const big = h * 100 + (z1 + z2) * 10 + e;
      return numeric(ctx, `${big} − ${z2 * 10} = ?`, big - z2 * 10, { hint: `Nur die Zehner ändern sich: ${z1 + z2} − ${z2} = ${z1}.`, solution: `${big} − ${z2 * 10} = ${big - z2 * 10}.` }, R1000);
    }
    if (level === 4) {
      // Hunderter dazu/weg zu einer beliebigen Zahl: 356 + 200
      const a = randInt(101, 699);
      const b = randInt(1, Math.floor((999 - a) / 100)) * 100;
      if (chance(0.5)) return numeric(ctx, `${a} + ${b} = ?`, a + b, { hint: `Nur die Hunderter ändern sich: ${Math.floor(a / 100)} + ${b / 100}.`, solution: `${a} + ${b} = ${a + b}.` }, R1000);
      return numeric(ctx, `${a + b} − ${b} = ?`, a, { hint: `Nur die Hunderter ändern sich: ${Math.floor((a + b) / 100)} − ${b / 100}.`, solution: `${a + b} − ${b} = ${a}.` }, R1000);
    }
    // Stufe 5: Zehner über den Hunderter: 380 + 50
    const h = randInt(1, 8);
    const z1 = randInt(5, 9);
    const z2 = randInt(10 - z1 + 1, 9);
    const a = h * 100 + z1 * 10;
    const toH = (h + 1) * 100 - a;
    return numeric(ctx, `${a} + ${z2 * 10} = ?`, a + z2 * 10, {
      hint: `Erst bis zum Hunderter: ${a} + ${toH} = ${(h + 1) * 100}. Dann noch ${z2 * 10 - toH}.`,
      solution: `${a} + ${toH} = ${(h + 1) * 100}, ${(h + 1) * 100} + ${z2 * 10 - toH} = ${a + z2 * 10}.`,
    }, R1000);
  },
};

const ergaenzen1000: Skill = {
  id: "ergaenzen1000",
  title: "Ergänzen bis 1000",
  world: "expedition",
  gen: (ctx) => {
    const { level } = ctx;
    if (level === 1) {
      const a = randInt(1, 9) * 100;
      return numeric(ctx, `${a} + ? = 1000`, 1000 - a, { question: "Wie viel fehlt bis 1000?", hint: `Denk an ${a / 100} + ? = 10.`, solution: `${a / 100} + ${10 - a / 100} = 10, also ${a} + ${1000 - a} = 1000.` }, R1000);
    }
    if (level === 2) {
      const h = randInt(1, 9) * 100;
      const z = randInt(1, 9) * 10;
      const a = h + z;
      const up = h + 100;
      return numeric(ctx, `${a} + ? = ${up}`, up - a, { question: `Wie viel fehlt bis ${up}?`, hint: `Schau nur auf die Zehner: ${z / 10} + ? = 10.`, solution: `${a} + ${up - a} = ${up}.` }, [0, 100]);
    }
    if (level === 3) {
      const a = randInt(1, 9) * 100 + randInt(1, 9) * 10;
      return numeric(ctx, `${a} + ? = 1000`, 1000 - a, {
        question: "Wie viel fehlt bis 1000?",
        hint: `Erst bis zum nächsten Hunderter: ${a} + ${Math.ceil(a / 100) * 100 - a} = ${Math.ceil(a / 100) * 100}. Dann bis 1000.`,
        solution: `${Math.ceil(a / 100) * 100 - a} + ${1000 - Math.ceil(a / 100) * 100} = ${1000 - a}.`,
      }, R1000);
    }
    if (level === 4) {
      const a = randInt(101, 989);
      if (a % 100 === 0) return ergaenzen1000.gen(ctx);
      const up = Math.ceil(a / 100) * 100;
      return numeric(ctx, `${a} + ? = ${up}`, up - a, { question: `Wie viel fehlt bis ${up}?`, hint: `Erst bis zum nächsten Zehner, dann bis ${up}.`, solution: `${a} + ${up - a} = ${up}.` }, [0, 100]);
    }
    const a = randInt(101, 989);
    if (a % 10 === 0) return ergaenzen1000.gen(ctx);
    const up = Math.ceil(a / 100) * 100;
    return numeric(ctx, `${a} + ? = 1000`, 1000 - a, {
      question: "Wie viel fehlt bis 1000?",
      hint: `Erst bis ${up}: Das sind ${up - a}. Dann von ${up} bis 1000: ${1000 - up}.`,
      solution: `${up - a} + ${1000 - up} = ${1000 - a}.`,
    }, R1000);
  },
};

export const EXPEDITION_SKILLS: Skill[] = [hunderter, zahlenstrahl1000, vergleichen1000, hunderterRechnen, ergaenzen1000];
