import { chance, pick, randInt, shuffle } from "./random";
import type { BasketTask, CalendarTask, CubeTask, Level, TaskDraft } from "./types";

export const ruleLabel = (n: number) => (n < 0 ? `− ${-n}` : `+ ${n}`);

export function machine(level: Level): TaskDraft {
  const magnitude = randInt(2, level <= 2 ? 5 : 12);
  const change = level >= 3 && chance(0.5) ? -magnitude : magnitude;
  const start = randInt(Math.max(1, -change + 1), level <= 2 ? 7 : 30);
  const values = shuffle(Array.from({ length: 10 }, (_, i) => start + i)).slice(0, 4);
  const inputs = values.slice(0, 3).sort((a, b) => a - b);
  const probe = values[3];
  const reverse = level >= 3 && chance(0.6);
  return {
    format: "machine",
    inputs,
    change,
    probe,
    reverse,
    rules: shuffle([change, change + 1, -change]),
    question:
      level === 1
        ? `Die Maschine rechnet immer ${ruleLabel(change)}. Was kommt heraus?`
        : "Was macht die Rechenmaschine mit jeder Zahl?",
    hint: `Vergleiche ${inputs[0]} mit ${inputs[0] + change}. Prüfe den gleichen Schritt in der nächsten Zeile.`,
    solution: `Die Regel ist ${ruleLabel(change)}. Aus ${probe} wird ${probe + change}.`,
  };
}

export function cubeModel(level: Level): TaskDraft {
  const footprint = shuffle([true, true, true, level >= 4 && chance(0.5)]);
  const front = [randInt(1, level <= 2 ? 2 : 3), randInt(2, level <= 2 ? 2 : 3)];
  if (front[0] === front[1]) front[0]--;
  const heights = footprint.map((on, i) => (on ? front[i % 2] : 0));
  return {
    format: "cube-model",
    footprint,
    front,
    question: "Baue ein Würfelhaus, das zu beiden Bildern passt.",
    hint: "Baue nur auf den farbigen Feldern der Draufsicht. Von vorne siehst du in jeder Spalte den höchsten Turm.",
    solution: `Ein möglicher Bauplan: hinten ${heights.slice(0, 2).join(" und ")}, vorne ${heights.slice(2).join(" und ")} Würfel.`,
  };
}

export function fitsViews(task: Pick<CubeTask, "front" | "footprint">, h: number[]) {
  return (
    h.length === 4 &&
    h.every((n, i) => Number.isInteger(n) && n >= 0 && n <= 3 && n > 0 === task.footprint[i]) &&
    task.front.every((n, i) => Math.max(h[i], h[i + 2]) === n)
  );
}

export function plausible(level: Level): TaskDraft {
  const a = randInt(level <= 2 ? 8 : 24, level <= 2 ? 15 : 62);
  const b = randInt(2, Math.min(a - 2, level <= 2 ? 20 - a : 29));
  const add = chance(0.5),
    correct = chance(0.4);
  const answer = add ? a + b : a - b;
  const shown = correct ? answer : add ? a - b : a + b;
  const calculation = `${a} ${add ? "+" : "−"} ${b}`;
  const reason = correct
    ? `Ja. Die Probe stimmt: ${shown} ${add ? "−" : "+"} ${b} = ${a}.`
    : add
      ? `Nein. Beide Bänder zusammen müssen länger als ${a} cm sein.`
      : `Nein. Nach dem Abschneiden muss das Band kürzer als ${a} cm sein.`;
  const other = correct
    ? add
      ? "Nein. Beim Zusammenlegen wird die Länge kleiner."
      : "Nein. Nach dem Abschneiden wird das Band länger."
    : add
      ? "Ja. Zwei Bänder zusammen sind kürzer als das längere Band."
      : "Ja. Durch Abschneiden gewinnt das Band an Länge.";
  return {
    format: "plausible",
    answer,
    calculation,
    unit: "cm",
    reason,
    reasons: shuffle([reason, other]),
    question: add
      ? `Ein Band misst ${a} cm, ein zweites ${b} cm. Zusammen sollen es ${shown} cm sein. Kann das stimmen?`
      : `Ein Band misst ${a} cm. Davon werden ${b} cm abgeschnitten. Es sollen ${shown} cm übrig sein. Kann das stimmen?`,
    hint: "Vergleiche die behauptete Länge mit der Länge des ersten Bandes. Wird es länger oder kürzer?",
    solution: `${reason} ${calculation} = ${answer} cm.`,
  };
}

export const goods = ["Apfel", "Brot", "Möhre"];
export function basketSolutions({ prices, budget }: Pick<BasketTask, "prices" | "budget">) {
  const result: number[][] = [];
  for (let a = 0; a * prices[0] <= budget; a++) {
    for (let b = 0; a * prices[0] + b * prices[1] <= budget; b++) {
      const c = (budget - a * prices[0] - b * prices[1]) / prices[2];
      if (Number.isInteger(c)) result.push([a, b, c]);
    }
  }
  return result;
}
export function baskets(level: Level): TaskDraft {
  const budget = level <= 2 ? 60 : pick([80, 100]);
  const prices = shuffle(
    level <= 2
      ? [20, 30, 40]
      : pick([
          [20, 30, 40],
          [20, 30, 50],
        ]),
  );
  const solutions = basketSolutions({ prices, budget }).map((b) =>
    b
      .map((n, i) => (n ? `${n} × ${goods[i]}` : ""))
      .filter(Boolean)
      .join(" + "),
  );
  return {
    format: "baskets",
    prices,
    budget,
    question: `Finde alle verschiedenen Einkaufskörbe für genau ${budget} ct.`,
    hint: "Beginne ohne Apfel. Probiere danach einen Apfel, dann zwei. Eine Ware darf mehrmals im Korb liegen.",
    solution: `Diese Körbe passen: ${solutions.join("; ")}.`,
  };
}

const weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
export function calendarDates(t: Pick<CalendarTask, "year" | "month" | "day" | "nights">) {
  const start = new Date(Date.UTC(t.year, t.month, t.day));
  const end = new Date(Date.UTC(t.year, t.month, t.day + t.nights));
  return { start, end };
}
export function calendar(level: Level): TaskDraft {
  const year = pick([2027, 2028, 2029, 2030]),
    month = randInt(0, 11);
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const nights = randInt(level <= 2 ? 1 : 3, level <= 2 ? 4 : 7);
  const day = level >= 4 && chance(0.7) ? randInt(days - nights + 1, days) : randInt(1, days - nights);
  const { start, end } = calendarDates({ year, month, day, nights });
  return {
    format: "calendar",
    year,
    month,
    day,
    nights,
    question: `Heute ist ${weekdays[start.getUTCDay()]}, der ${day}. Am nächsten ${weekdays[end.getUTCDay()]} ist der Ausflug. Markiere den Ausflugstag.`,
    hint: "Starte bei Heute. Gehe mindestens einen Tag weiter. Zähle jeden Schritt bis zum gesuchten Wochentag.",
    solution: `Der Ausflug ist am ${end.getUTCDate()}.${end.getUTCMonth() + 1}. Bis dahin sind es ${nights} Nächte.`,
  };
}
