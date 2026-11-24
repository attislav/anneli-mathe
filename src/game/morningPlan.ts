import { busTime } from "./busTable";
import { pick, randInt } from "./random";
import type { Level, MorningTask } from "./types";

type Plan = Pick<MorningTask, "start" | "duration" | "step" | "fixed" | "activities">;
type Follow = Plan & Pick<MorningTask, "follow" | "target">;
export function planSlots(p: Plan) {
  return Array.from({ length: p.duration / p.step }, (_, i) => p.start + i * p.step);
}
export function checkPlan(p: Plan, starts: (number | null)[]) {
  if (starts.length !== p.activities.length || starts.some(t => t === null)) return "Wähle für jede Tätigkeit eine Startzeit.";
  const blocks = [{ name: "Morgenkreis", from: p.fixed, to: p.fixed + p.step }];
  for (const [i, a] of p.activities.entries()) {
    const from = starts[i]!, to = from + a.duration;
    if (!Number.isInteger(from) || from < p.start || to > p.start + p.duration || (from - p.start) % p.step !== 0)
      return `Plane „${a.name}“ ganz innerhalb deines Vormittags ein. Es dauert ${a.duration} Minuten.`;
    const clash = blocks.find(block => from < block.to && block.from < to);
    if (clash) return `„${a.name}“ und „${clash.name}“ überschneiden sich. Verschiebe eine Tätigkeit.`;
    blocks.push({ name: a.name, from, to });
  }
  if (starts[0]! > starts[1]!) return `Plane zuerst „${p.activities[0].name}“ und danach „${p.activities[1].name}“.`;
  return null;
}
export function followValue(p: Follow, starts: number[]) {
  const start = starts[p.target];
  if (p.follow === "end") return start + p.activities[p.target].duration;
  const ends = [p.start, p.fixed + p.step, ...p.activities.map((a, i) => starts[i] + a.duration)];
  return start - Math.max(...ends.filter(t => t <= start));
}
export function examplePlan(p: Plan) {
  const slots = planSlots(p);
  function place(starts: number[]): number[] | undefined {
    if (starts.length === p.activities.length) return checkPlan(p, starts) ? undefined : starts;
    for (const slot of slots) {
      const found = place([...starts, slot]);
      if (found) return found;
    }
  }
  const plan = place([]);
  if (!plan) throw new Error("Für diesen Vormittag gibt es keinen passenden Plan.");
  return plan;
}
export function morningPlan(level: Level): Omit<MorningTask, "id" | "skillId" | "level"> {
  const step = level <= 2 ? 15 : level === 3 ? 10 : 5;
  const duration = level === 1 ? 60 : 90;
  const start = randInt(8, 10) * 60 + pick([0, 15, 30]);
  const fixed = start + randInt(0, duration / step - 1) * step;
  const names = pick([["Bild malen", "Bild zeigen", "Buch lesen"], ["Samen säen", "Beet gießen", "Buch lesen"],
    ["Karte basteln", "Karte schreiben", "Tisch decken"]]);
  const amounts = level === 1 ? [1, 1] : level === 2 ? [1, 2] : level === 3 ? [1, 2, 1] : [2, 3, randInt(2, 4)];
  const activities = amounts.map((n, i) => ({ name: names[i], duration: n * step }));
  return { format: "morning-plan", start, duration, step, fixed, activities, target: randInt(0, activities.length - 1),
    follow: level >= 3 && pick([true, false]) ? "pause" : "end", question: "Wie planst du deinen Vormittag?",
    hint: `Der Morgenkreis beginnt um ${busTime(fixed)} Uhr und dauert ${step} Minuten. Halte diese Zeit frei.`,
    solution: "Auf der Zeitleiste siehst du, wann die Tätigkeiten beginnen und enden." };
}
