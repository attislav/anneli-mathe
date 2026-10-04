// Welt 9 · Mess-Werkstatt — Längen: Lineal, cm und m, schätzen, rechnen.

import type { RulerItem, TaskDraft } from "./types";
import { chance, pick, randInt, shuffle } from "./random";
import { chooseFormat, numeric, type Skill } from "./genkit";

const RULER_ITEMS: Record<RulerItem, string> = { stift: "der Stift", band: "das Band", wurm: "der Wurm", nagel: "der Nagel" };

/** „1 m 20 cm", „80 cm", „2 m" */
export function fmtLength(cm: number): string {
  const m = Math.floor(cm / 100);
  const rest = cm % 100;
  if (m === 0) return `${rest} cm`;
  return rest === 0 ? `${m} m` : `${m} m ${rest} cm`;
}

const lineal: Skill = {
  id: "lineal",
  title: "Mit dem Lineal messen",
  world: "werkstatt",
  trick: {
    title: "Lineal richtig anlegen",
    example: "0 cm",
    steps: ["Leg das Lineal so an, dass der Anfang genau bei der 0 ist — nicht beim Rand!", "Lies ab, wo das Ende ist: Das ist die Länge in Zentimetern.", "Fängt etwas nicht bei 0 an? Dann rechne: Ende minus Anfang."],
  },
  gen: (ctx) => {
    const { level } = ctx;
    const max = level <= 2 ? 10 : 15;
    const item = pick(Object.keys(RULER_ITEMS) as RulerItem[]);
    const format = chooseFormat(ctx, level <= 2 ? ["ruler", "choice"] : ["ruler", "choice", "input"]);
    if (format === "ruler") {
      const target = randInt(2, max - 1);
      return {
        format: "ruler",
        question: `Zeichne eine Linie, die ${target} cm lang ist.`,
        target,
        max,
        hint: `Fang bei der 0 an und zähl ${target} große Striche weiter.`,
        solution: `Von 0 bis ${target}: genau ${target} cm.`,
      };
    }
    const from = level >= 4 ? randInt(1, 4) : 0;
    const len = randInt(2, max - 1 - from);
    const to = from + len;
    const d = numeric(ctx, `? cm`, len, {
      question: `Wie lang ist ${RULER_ITEMS[item]}?`,
      hint: from === 0 ? "Schau, bei welcher Zahl das Ende liegt." : `Es fängt bei ${from} an, nicht bei 0! Rechne ${to} − ${from}.`,
      solution: from === 0 ? `Das Ende liegt bei ${to}: ${len} cm.` : `${to} − ${from} = ${len} cm.`,
    }, [0, 20]);
    return { ...d, visual: { kind: "ruler", from, to, max, item } } as TaskDraft;
  },
};

const einheiten: Skill = {
  id: "einheiten",
  title: "Meter und Zentimeter",
  world: "werkstatt",
  gen: (ctx) => {
    const { level } = ctx;
    const hint = "1 m sind 100 cm.";
    if (level === 1) {
      const m = randInt(1, 5);
      return numeric(ctx, `${m} m = ? cm`, m * 100, { hint, solution: `${m} · 100 cm = ${m * 100} cm.` }, [0, 600]);
    }
    if (level === 2) {
      const m = randInt(1, 9);
      return numeric(ctx, `${m * 100} cm = ? m`, m, { hint: `Wie oft passen 100 cm in ${m * 100} cm?`, solution: `${m * 100} cm = ${m} m.` }, [0, 12]);
    }
    if (level === 3) {
      const m = randInt(1, 3);
      const cm = 10 * randInt(1, 9);
      return numeric(ctx, `${m} m ${cm} cm = ? cm`, m * 100 + cm, { hint: `${m} m sind ${m * 100} cm. Dann noch ${cm} cm dazu.`, solution: `${m * 100} + ${cm} = ${m * 100 + cm} cm.` }, [0, 400]);
    }
    if (level === 4) {
      const total = randInt(101, 399);
      const m = Math.floor(total / 100);
      return numeric(ctx, `${total} cm = ${m} m ? cm`, total - m * 100, { question: "Welche Zahl fehlt?", hint: `Nimm die vollen Meter weg: ${total} − ${m * 100}.`, solution: `${total} cm = ${m} m ${total - m * 100} cm.` }, [0, 100]);
    }
    const cm = 10 * randInt(1, 9);
    return numeric(ctx, `${cm} cm + ? cm = 1 m`, 100 - cm, { question: "Wie viel fehlt bis zu einem Meter?", hint: `1 m = 100 cm. Ergänze ${cm} bis 100.`, solution: `${cm} + ${100 - cm} = 100 cm = 1 m.` }, [0, 100]);
  },
};

/** Ding · richtige Länge · Einheit für die Frage */
const THINGS: [string, string, string[]][] = [
  ["ein Bleistift", "15 cm", ["15 m", "1 cm", "150 cm"]],
  ["eine Tür", "2 m", ["2 cm", "20 m", "20 cm"]],
  ["dein Daumen", "5 cm", ["5 m", "50 cm", "1 m"]],
  ["ein Bus", "12 m", ["12 cm", "120 cm", "2 m"]],
  ["ein Tisch", "1 m", ["1 cm", "10 m", "10 cm"]],
  ["ein Heft", "30 cm", ["30 m", "3 cm", "3 m"]],
  ["ein Schlüssel", "6 cm", ["6 m", "60 cm", "1 m"]],
  ["eine Giraffe", "5 m", ["5 cm", "50 m", "50 cm"]],
  ["ein Lineal", "30 cm", ["3 m", "3 cm", "30 m"]],
  ["ein Fußballtor", "7 m", ["7 cm", "70 m", "70 cm"]],
];

const schaetzen: Skill = {
  id: "schaetzen",
  title: "Längen schätzen",
  world: "werkstatt",
  gen: (ctx) => {
    const { level } = ctx;
    if (level >= 4 && chance(0.5)) {
      // Welche Einheit passt?
      const [thing, right] = pick(THINGS);
      const unit = right.endsWith(" m") ? "Meter" : "Zentimeter";
      return { format: "choice", question: `Misst man ${thing} besser in Zentimetern oder in Metern?`, options: ["Zentimeter", "Meter"], answer: unit, hint: "Kleine Dinge misst man in cm, große in m.", solution: `${thing[0].toUpperCase()}${thing.slice(1)} ist etwa ${right} lang — also in ${unit}n.` };
    }
    const [thing, right, wrong] = pick(THINGS);
    const options = shuffle([right, ...wrong.slice(0, level <= 2 ? 1 : 3)]);
    return {
      format: "choice",
      question: `Wie lang ist ${thing} ungefähr?`,
      options,
      answer: right,
      hint: "Stell dir das Ding vor dir vor. Ein Lineal ist 30 cm lang, eine Tür 2 m hoch.",
      solution: `${thing[0].toUpperCase()}${thing.slice(1)} ist etwa ${right} lang.`,
    };
  },
};

const laengenRechnen: Skill = {
  id: "laengenRechnen",
  title: "Mit Längen rechnen",
  world: "werkstatt",
  gen: (ctx) => {
    const { level } = ctx;
    if (level <= 2) {
      const a = randInt(10, level === 1 ? 40 : 80);
      const b = randInt(5, Math.min(40, 99 - a));
      if (chance(0.5)) return numeric(ctx, `${a} cm + ${b} cm = ? cm`, a + b, { question: `Zwei Bänder: ${a} cm und ${b} cm. Wie lang sind beide zusammen?`, hint: `Rechne ${a} + ${b}.`, solution: `${a} + ${b} = ${a + b} cm.` });
      const big = a + b;
      return numeric(ctx, `${big} cm − ${b} cm = ? cm`, a, { question: `Das Brett ist ${big} cm lang. Wir sägen ${b} cm ab. Wie lang ist es noch?`, hint: `Rechne ${big} − ${b}.`, solution: `${big} − ${b} = ${a} cm.` });
    }
    if (level === 3) {
      const cm = 10 * randInt(1, 9);
      return numeric(ctx, `1 m − ${cm} cm = ? cm`, 100 - cm, { question: `Ein Seil ist 1 m lang. Wir schneiden ${cm} cm ab. Wie viel bleibt?`, hint: "1 m = 100 cm.", solution: `100 − ${cm} = ${100 - cm} cm.` });
    }
    const n = randInt(2, 5);
    const each = level === 4 ? pick([10, 20, 25, 50]) : randInt(11, 19);
    return numeric(ctx, `${n} · ${each} cm = ? cm`, n * each, { question: `${n} Holzstäbe, jeder ${each} cm lang, liegen hintereinander. Wie lang ist die Reihe?`, hint: `${n}-mal ${each} cm.`, solution: `${n} · ${each} = ${n * each} cm${n * each >= 100 ? ` = ${fmtLength(n * each)}` : ""}.` }, [0, 120]);
  },
};

const laengenVergleichen: Skill = {
  id: "laengenVergleichen",
  title: "Längen vergleichen",
  world: "werkstatt",
  gen: (ctx) => {
    const { level } = ctx;
    const a = level <= 2 ? 10 * randInt(5, 30) : randInt(101, 350);
    const bb = chance(0.15) ? a : level <= 2 ? 10 * randInt(5, 30) : a + pick([-20, -10, -5, -1, 1, 5, 10, 20, 100]);
    // Ab Stufe 3: eine Seite in m und cm, die andere nur in cm.
    const showA = fmtLength(a);
    const showB = level <= 2 ? fmtLength(bb) : `${bb} cm`;
    return {
      format: "compare",
      question: "Was ist länger?",
      left: showA,
      right: showB,
      values: [a, bb],
      answer: a < bb ? "<" : a > bb ? ">" : "=",
      hint: "Rechne beides in Zentimeter um: 1 m = 100 cm.",
      solution: `${showA} = ${a} cm, ${showB} = ${bb} cm.`,
    };
  },
};

export const WERKSTATT_SKILLS: Skill[] = [lineal, einheiten, schaetzen, laengenRechnen, laengenVergleichen];
