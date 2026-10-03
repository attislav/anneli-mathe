// Welt 3 · Piratenhafen — Rechnen mit Geld.
//
// Gerechnet wird in Cent, angezeigt wie im Schulbuch („1,20 €", „2 € 5 ct").
// Kommazahlen tippt hier niemand ein: Antworten sind immer ganze Cent oder
// ganze Euro, damit die Zahlentastatur reicht.

import type { CompareTask, TaskDraft } from "./types";
import { chance, numberOptions, pick, randInt, shuffle } from "./random";
import { chooseFormat, type GenCtx, type Skill, type Texts } from "./genkit";
import { ALL_PIECES, breakDown, COINS_CT, COINS_EURO, fmtEuroCent, fmtMoney, NOTES } from "./money";

/** Wie `numeric`, aber mit optionalem Bild und eigenem Antwortbereich. */
function money(ctx: GenCtx, term: string, answer: number, t: Texts, range: [number, number], items?: number[]): TaskDraft {
  const format = chooseFormat(ctx, ["choice", "input"]);
  const question = t.question ?? "Wie viel ist das?";
  const visual = items ? { kind: "money" as const, items } : undefined;
  if (format === "choice") {
    return { format: "choice", question, term, visual, options: numberOptions(answer, range[0], range[1]), answer: String(answer), hint: t.hint, solution: t.solution };
  }
  return { format: "input", question, term, visual, answer, hint: t.hint, solution: t.solution };
}

function randomPieces(from: number[], count: number, max: number): number[] {
  for (let tries = 0; tries < 50; tries++) {
    const items = Array.from({ length: count }, () => pick(from));
    if (items.reduce((a, b) => a + b, 0) <= max) return items;
  }
  return [from[0]];
}

const byValueDesc = (a: number, b: number) => b - a;

const geldZaehlen: Skill = {
  id: "geldZaehlen",
  title: "Geld zählen",
  world: "hafen",
  trick: {
    title: "Große zuerst",
    example: "50 ct · 20 ct · 5 ct · 2 ct",
    steps: ["Leg die Münzen nach Größe: die größte zuerst.", "Dann zählst du weiter: 50 … 70 … 75 … 77.", "Zusammen sind das 77 Cent."],
  },
  gen: (ctx) => {
    const { level } = ctx;
    let items: number[];
    let inEuro = false;
    if (level === 1) items = randomPieces([1, 2, 5, 10], randInt(2, 4), 20);
    else if (level === 2) items = randomPieces(COINS_CT, randInt(3, 5), 99);
    else if (level === 3) items = [...randomPieces(COINS_EURO, randInt(1, 2), 300), ...randomPieces([5, 10, 20, 50], randInt(1, 3), 95)];
    else if (level === 4) {
      items = [...randomPieces(NOTES.slice(0, 2), randInt(1, 2), 2000), ...randomPieces(COINS_EURO, randInt(1, 3), 600)];
      inEuro = true;
    } else items = [...randomPieces([...COINS_EURO, 500], randInt(1, 3), 900), ...randomPieces(COINS_CT, randInt(2, 4), 99)];
    const sum = items.reduce((a, b) => a + b, 0);
    const sorted = [...items].sort(byValueDesc);
    const shown = level <= 2 ? sorted : shuffle(items);
    const answer = inEuro ? sum / 100 : sum;
    const unit = inEuro ? "€" : "ct";
    let running = 0;
    const steps = sorted.map((v) => fmtMoney((running += v)));
    return money(ctx, `? ${unit}`, answer, {
      question: inEuro ? "Wie viele Euro sind das?" : "Wie viel Cent sind das?",
      hint: `Leg die großen zuerst und zähl weiter: ${steps.slice(0, 3).join(" … ")} …${sum >= 100 && !inEuro ? " Ein Euro sind 100 Cent." : ""}`,
      solution: `${steps.join(" … ")} — zusammen ${inEuro ? `${answer} €` : `${sum} ct`}.`,
    }, [0, inEuro ? 100 : 1000], shown);
  },
};

const geldLegen: Skill = {
  id: "geldLegen",
  title: "Geld legen",
  world: "hafen",
  gen: (ctx) => {
    const { level } = ctx;
    let pieces: number[];
    let target: number;
    if (level === 1) [pieces, target] = [[1, 2, 5, 10], randInt(3, 20)];
    else if (level === 2) [pieces, target] = [COINS_CT, randInt(11, 99)];
    else if (level === 3) [pieces, target] = [[...COINS_CT, ...COINS_EURO], randInt(101, 399)];
    else if (level === 4) [pieces, target] = [[...COINS_EURO, ...NOTES], randInt(6, 40) * 100];
    else [pieces, target] = [ALL_PIECES, randInt(21, 199) * 5];
    const best = breakDown(target, pieces).map(fmtMoney);
    return {
      format: "money-build",
      question: `Lege ${fmtMoney(target)}`,
      target,
      pieces,
      hint: "Nimm zuerst das größte Geldstück, das noch passt. Dann das nächstkleinere.",
      solution: `Zum Beispiel: ${best.join(" + ")}.`,
    };
  },
};

const euroCent: Skill = {
  id: "euroCent",
  title: "Euro und Cent",
  world: "hafen",
  gen: (ctx) => {
    const { level } = ctx;
    const q = "Welche Zahl fehlt?";
    if (level === 1) {
      const e = randInt(1, 5);
      return money(ctx, `${e} € = ? ct`, e * 100, { question: q, hint: "Ein Euro sind 100 Cent.", solution: `${e} € = ${e * 100} ct.` }, [0, 1000]);
    }
    if (level === 2) {
      const e = randInt(1, 9);
      return money(ctx, `${e * 100} ct = ? €`, e, { question: q, hint: "Immer 100 Cent sind ein Euro.", solution: `${e * 100} ct = ${e} €.` }, [0, 20]);
    }
    if (level === 3) {
      const e = randInt(1, 4);
      const c = randInt(1, 19) * 5;
      return money(ctx, `${e} € ${c} ct = ? ct`, e * 100 + c, { question: q, hint: `${e} € sind ${e * 100} ct. Dazu noch ${c} ct.`, solution: `${e * 100} + ${c} = ${e * 100 + c} ct.` }, [0, 1000]);
    }
    if (level === 4) {
      let x = randInt(101, 499);
      if (x % 100 === 0) x += 5;
      const e = Math.floor(x / 100);
      return money(ctx, `${x} ct = ${e} € ? ct`, x % 100, { question: q, hint: `${e} € sind ${e * 100} ct. Wie viel bleibt von ${x} übrig?`, solution: `${x} − ${e * 100} = ${x % 100}, also ${fmtEuroCent(x)}.` }, [0, 99]);
    }
    const cents = randInt(101, 999);
    return money(ctx, `${fmtMoney(cents)} = ? ct`, cents, { question: q, hint: "Vor dem Komma stehen die Euro, dahinter die Cent. Ein Euro sind 100 Cent.", solution: `${fmtMoney(cents)} sind ${cents} ct.` }, [0, 1000]);
  },
};

const ITEMS = ["der Apfel", "die Banane", "das Eis", "der Lolli", "die Brezel", "der Saft", "der Muffin", "der Stift", "der Ball", "das Heft"];

function item(): { name: string; Name: string } {
  const name = pick(ITEMS);
  return { name, Name: name[0].toUpperCase() + name.slice(1) };
}

const einkaufen: Skill = {
  id: "einkaufen",
  title: "Einkaufen",
  world: "hafen",
  trick: {
    title: "Rückgeld: vom Preis aus hochzählen",
    example: "1 € − 35 ct",
    steps: ["Das Eis kostet 35 ct. Du zahlst mit 1 € — das sind 100 ct.", "Zähl vom Preis hoch: von 35 bis 40 sind es 5.", "Von 40 bis 100 sind es 60. Zusammen 65 ct Rückgeld."],
  },
  gen: (ctx) => {
    const { level } = ctx;
    const a = item();
    let b = item();
    while (b.name === a.name) b = item();
    if (level === 1 || level === 3) {
      const pa = level === 1 ? randInt(2, 9) * 5 : randInt(21, 39) * 5;
      const pb = randInt(2, 9) * 5;
      const sum = pa + pb;
      return money(ctx, `${fmtMoney(pa)} + ${fmtMoney(pb)} = ? ct`, sum, {
        question: `${a.Name} kostet ${fmtMoney(pa)}, ${b.name} ${fmtMoney(pb)}. Wie viel zusammen?`,
        hint: pa >= 100 ? `Rechne alles in Cent: ${fmtMoney(pa)} sind ${pa} ct.` : "Zähl die Cent zusammen: erst die Zehner, dann die Einer.",
        solution: `${pa} ct + ${pb} ct = ${sum} ct.`,
      }, [0, 1000]);
    }
    if (level === 2) {
      const p = randInt(3, 19) * 5;
      const next = Math.ceil((p + 1) / 10) * 10;
      return money(ctx, `1 € − ${p} ct = ? ct`, 100 - p, {
        question: `${a.Name} kostet ${p} ct. Du zahlst mit 1 €. Wie viel Rückgeld?`,
        hint: `1 € sind 100 ct. Zähl von ${p} hoch: bis ${next} sind es ${next - p}, dann bis 100 noch ${100 - next}.`,
        solution: `${100 - p} ct, denn ${p} + ${100 - p} = 100.`,
      }, [0, 100]);
    }
    if (level === 4) {
      const pay = pick([5, 10, 20]);
      const p = randInt(1, pay - 1);
      return money(ctx, `${pay} € − ${p} € = ? €`, pay - p, {
        question: `${a.Name} kostet ${p} €. Du zahlst mit ${pay} €. Wie viel Rückgeld?`,
        hint: `Wie viel fehlt von ${p} bis ${pay}?`,
        solution: `${pay} − ${p} = ${pay - p} €.`,
      }, [0, 20]);
    }
    const p = randInt(21, 39) * 5;
    return money(ctx, `2 € − ${fmtMoney(p)} = ? ct`, 200 - p, {
      question: `${a.Name} kostet ${fmtMoney(p)}. Du zahlst mit 2 €. Wie viel Rückgeld?`,
      hint: `Rechne in Cent: 2 € sind 200 ct, ${fmtMoney(p)} sind ${p} ct. Zähl von ${p} bis 200 hoch.`,
      solution: `200 − ${p} = ${200 - p} ct.`,
    }, [0, 200]);
  },
};

const geldVergleichen: Skill = {
  id: "geldVergleichen",
  title: "Was ist mehr?",
  world: "hafen",
  gen: (ctx) => {
    const { level } = ctx;
    let a: number, b: number, left: string, right: string;
    if (level === 1) {
      a = randInt(5, 99);
      b = chance(0.15) ? a : randInt(5, 99);
      [left, right] = [fmtMoney(a), fmtMoney(b)];
    } else if (level === 2) {
      a = 100;
      b = randInt(10, 30) * 5;
      [left, right] = ["1 €", `${b} ct`];
      if (chance(0.5)) [a, b, left, right] = [b, a, right, left];
    } else if (level === 3) {
      a = randInt(101, 399);
      const swapped = Math.floor(a / 100) * 100 + (a % 10) * 10 + Math.floor((a % 100) / 10);
      b = chance(0.4) && swapped !== a ? swapped : chance(0.2) ? a : a + pick([-10, -5, 5, 10, 100]);
      [left, right] = [fmtEuroCent(a), `${b} ct`];
    } else if (level === 4) {
      a = randInt(101, 999);
      b = chance(0.2) ? a : a + pick([-50, -5, 5, 45, 50, 100]);
      [left, right] = [fmtMoney(a), fmtMoney(b)];
    } else {
      a = randInt(101, 499);
      b = chance(0.25) ? a : a + pick([-45, -40, 40, 45]);
      [left, right] = [fmtEuroCent(a), fmtMoney(b)];
    }
    const answer: CompareTask["answer"] = a < b ? "<" : a > b ? ">" : "=";
    return {
      format: "compare",
      question: "Was ist mehr?",
      left,
      right,
      values: [a, b],
      answer,
      hint: "Rechne beide Beträge in Cent um. Ein Euro sind 100 Cent.",
      solution: `${a} ct ${answer} ${b} ct.`,
    };
  },
};

export const HAFEN_SKILLS: Skill[] = [geldZaehlen, geldLegen, euroCent, einkaufen, geldVergleichen];
