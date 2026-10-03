// Welt 6 · Bäckerei — Teilen: verteilen, aufteilen, halbieren.
//
// Geteilt-Zeichen ist der Doppelpunkt „:" wie im Schulbuch. Jede Geteilt-
// Aufgabe hat eine Mal-Schwester (Umkehraufgabe) — die kennt das Kind schon
// aus dem Zirkus, darum führen alle Tipps über das Malnehmen.

import type { TaskDraft, Treat } from "./types";
import { chance, pick, randInt, shuffle } from "./random";
import { chooseFormat, numeric, type GenCtx, type Skill } from "./genkit";

const TREATS: Record<Treat, { one: string; many: string }> = {
  keks: { one: "Keks", many: "Kekse" },
  muffin: { one: "Muffin", many: "Muffins" },
  brezel: { one: "Brezel", many: "Brezeln" },
};

const divHint = (p: number, d: number) => `Denk an die Mal-Schwester: Wie viel mal ${d} ist ${p}?`;
const divSolution = (p: number, d: number) => `${p / d} · ${d} = ${p}, also ist ${p} : ${d} = ${p / d}.`;

/** Gebäck auf Teller verteilen — zum Legen oder als Rechnung. */
function shareTask(ctx: GenCtx, total: number, plates: number, canLay: boolean): TaskDraft {
  const item = pick(Object.keys(TREATS) as Treat[]);
  const t = TREATS[item];
  const per = total / plates;
  const hint = `Leg reihum auf jeden Teller ${item === "brezel" ? "eine" : "einen"} ${t.one} — so lange, bis nichts mehr übrig ist.`;
  const solution = `${total} : ${plates} = ${per}. Auf jeden Teller kommen ${per} ${per === 1 ? t.one : t.many}.`;
  const format = canLay ? chooseFormat(ctx, ctx.level <= 2 ? ["share"] : ["share", "choice", "input"]) : "input";
  if (format === "share") {
    return { format: "share", question: `Verteile ${total} ${t.many} gerecht auf ${plates} Teller.`, total, plates, item, hint, solution };
  }
  return numeric(ctx, `${total} : ${plates} = ?`, per, { question: `${total} ${t.many}, ${plates} Teller. Wie viele kommen auf jeden?`, hint: divHint(total, plates), solution });
}

const verteilen: Skill = {
  id: "verteilen",
  title: "Gerecht verteilen",
  world: "baeckerei",
  gen: (ctx) => {
    const { level } = ctx;
    const plates = level === 1 ? 2 : level === 2 ? randInt(2, 3) : level === 3 ? randInt(3, 4) : level === 4 ? randInt(2, 5) : randInt(3, 6);
    const per = level <= 2 ? randInt(2, 5) : level === 3 ? randInt(2, 5) : level === 4 ? randInt(3, 6) : randInt(4, 8);
    const total = plates * per;
    return shareTask(ctx, total, plates, plates <= 5 && total <= 24);
  },
};

const halbieren: Skill = {
  id: "halbieren",
  title: "Halbieren",
  world: "baeckerei",
  trick: {
    title: "Halbieren in Teilen",
    example: "36",
    steps: ["Zerleg die Zahl: 36 = 30 + 6.", "Halbiere beide Teile: 30 → 15 und 6 → 3.", "Zusammen: 15 + 3 = 18. Die Hälfte von 36 ist 18."],
  },
  gen: (ctx) => {
    const { level } = ctx;
    const n = level === 1 ? 2 * randInt(1, 5) : level === 2 ? 2 * randInt(6, 10) : level === 3 ? 10 * randInt(2, 10) : 2 * randInt(11, 49);
    const h = n / 2;
    const tens = Math.floor(n / 10) * 10;
    const ones = n % 10;
    const parts = level >= 4 && ones > 0 ? `Halbiere Zehner und Einer einzeln: ${tens} → ${tens / 2} und ${ones} → ${ones / 2}.` : `Welche Zahl und noch einmal dieselbe ergeben ${n}?`;
    if (level === 5 && chance(0.5)) {
      return numeric(ctx, `2 · ? = ${n}`, h, { question: "Welche Zahl wurde verdoppelt?", hint: `Das Doppelte von ? ist ${n} — also suchst du die Hälfte von ${n}. ${parts}`, solution: `${h} + ${h} = ${n}, also 2 · ${h} = ${n}.` });
    }
    return numeric(ctx, `${n} : 2 = ?`, h, { question: `Wie viel ist die Hälfte von ${n}?`, hint: parts, solution: `${h} + ${h} = ${n}, also ist die Hälfte ${h}.` });
  },
};

const DIVISORS: Record<number, number[]> = { 1: [2, 10], 2: [2, 5, 10], 3: [3, 4], 4: [6, 7, 8, 9], 5: [2, 3, 4, 5, 6, 7, 8, 9, 10] };

const geteilt: Skill = {
  id: "geteilt",
  title: "Geteilt rechnen",
  world: "baeckerei",
  trick: {
    title: "Die Umkehraufgabe",
    example: "24 : 6",
    steps: ["Jede Geteilt-Aufgabe hat eine Mal-Schwester.", "24 : 6 fragt: Wie viel mal 6 ist 24?", "4 · 6 = 24 — also ist 24 : 6 = 4."],
  },
  gen: (ctx) => {
    const { level } = ctx;
    const d = pick(DIVISORS[level]);
    const q = randInt(1, level === 1 ? 5 : 10);
    const p = q * d;
    if (level === 5 && chance(0.4)) {
      return numeric(ctx, `${p} : ? = ${q}`, d, { question: "Welche Zahl fehlt?", hint: `Welche Zahl mal ${q} ergibt ${p}?`, solution: `${q} · ${d} = ${p}, also ist ${p} : ${d} = ${q}.` });
    }
    return numeric(ctx, `${p} : ${d} = ?`, q, { hint: divHint(p, d), solution: divSolution(p, d) });
  },
};

const umkehr: Skill = {
  id: "umkehr",
  title: "Mal und Geteilt",
  world: "baeckerei",
  gen: (ctx) => {
    const { level } = ctx;
    const a = level === 1 ? randInt(1, 5) : randInt(2, level <= 2 ? 6 : 10);
    const b = level === 1 ? pick([2, 5, 10]) : randInt(2, level <= 2 ? 6 : 10);
    const p = a * b;
    if (level <= 2) {
      const correct = `${p} : ${b} = ${a}`;
      const isTrue = (x: number, y: number, z: number) => x / y === z;
      const candidates: [number, number, number][] = [
        [p, b, a + 1],
        [p, a, a],
        [a, b, p],
        [p + b, b, a],
        [p, b, b],
        [p - 1, b, a],
      ];
      const wrong = [...new Set(candidates.filter(([x, y, z]) => y > 0 && !isTrue(x, y, z)).map(([x, y, z]) => `${x} : ${y} = ${z}`))].filter((w) => w !== correct).slice(0, 3);
      return {
        format: "choice",
        question: "Welche Geteilt-Aufgabe gehört dazu?",
        term: `${a} · ${b} = ${p}`,
        options: shuffle([correct, ...wrong]),
        answer: correct,
        hint: `In beiden Aufgaben stecken dieselben drei Zahlen: ${a}, ${b} und ${p}. Die größte steht beim Teilen vorne.`,
        solution: `${a} · ${b} = ${p} und ${p} : ${b} = ${a} — eine Familie.`,
      };
    }
    if (level === 3 || (level === 5 && chance(0.5))) {
      return numeric(ctx, `? : ${b} = ${a}`, p, { question: "Welche Zahl fehlt?", hint: `Rechne die Mal-Schwester: ${a} · ${b}.`, solution: `${a} · ${b} = ${p}, also ${p} : ${b} = ${a}.` });
    }
    return numeric(ctx, `${p} : ? = ${a}`, b, { question: "Welche Zahl fehlt?", hint: `Welche Zahl mal ${a} ergibt ${p}?`, solution: `${a} · ${b} = ${p}, also ${p} : ${b} = ${a}.` });
  },
};

const backSach: Skill = {
  id: "backSach",
  title: "Bäckerei-Geschichten",
  world: "baeckerei",
  gen: (ctx) => {
    const { level } = ctx;
    const d = level === 1 ? pick([2, 5, 10]) : randInt(2, level === 2 ? 5 : level === 3 ? 6 : 10);
    const q = randInt(2, level <= 2 ? 5 : 10);
    const p = d * q;
    const kind = level >= 4 ? pick(["verteilen", "aufteilen", "mal", ...(level === 5 ? ["zwei"] : [])]) : pick(["verteilen", "aufteilen"]);
    if (kind === "verteilen") {
      const [what, into, each] = pick([
        ["Brötchen", "Körbe", "jeden Korb"],
        ["Kekse", "Dosen", "jede Dose"],
        ["Brezeln", "Tüten", "jede Tüte"],
      ]);
      return numeric(ctx, `${p} : ${d} = ?`, q, { question: `Bäcker Bruno verteilt ${p} ${what} gerecht auf ${d} ${into}. Wie viele kommen in ${each}?`, hint: divHint(p, d), solution: divSolution(p, d) });
    }
    if (kind === "aufteilen") {
      const [what, box] = pick([
        ["Muffins", "Schachtel"],
        ["Kekse", "Tüte"],
        ["Brötchen", "Korb"],
      ]);
      const article = box === "Korb" ? "einen" : "eine";
      return numeric(ctx, `${p} : ${d} = ?`, q, {
        question: `Es gibt ${p} ${what}. Immer ${d} kommen in ${article} ${box}. Wie viele ${box === "Korb" ? "Körbe" : box === "Tüte" ? "Tüten" : "Schachteln"} werden voll?`,
        hint: `Wie oft passt die ${d} in ${p}? Zähl in ${d}er-Schritten bis ${p}.`,
        solution: divSolution(p, d),
      });
    }
    if (kind === "mal") {
      return numeric(ctx, `${d} · ${q} = ?`, p, { question: `Auf einem Blech liegen ${d} Reihen mit je ${q} Brezeln. Wie viele sind es?`, hint: `${d}-mal die ${q}. Fang mit einer leichten Nachbaraufgabe an.`, solution: `${d} · ${q} = ${p}.` });
    }
    // Zwei Schritte: erst malnehmen, dann teilen.
    const bags = randInt(2, 5);
    const per = 2 * randInt(1, 5);
    const all = bags * per;
    return numeric(ctx, `${bags} · ${per} : 2 = ?`, all / 2, {
      question: `Oma kauft ${bags} Tüten mit je ${per} Brötchen. Sie teilt alle gerecht mit Opa. Wie viele bekommt jeder?`,
      hint: `Erst: Wie viele Brötchen sind es? ${bags} · ${per}. Dann die Hälfte davon.`,
      solution: `${bags} · ${per} = ${all}, die Hälfte ist ${all / 2}.`,
    });
  },
};

export const BAECKEREI_SKILLS: Skill[] = [verteilen, halbieren, geteilt, umkehr, backSach];
