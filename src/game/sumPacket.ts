import { chance, pick, randInt } from "./random";
import type { Level, PacketTask } from "./types";

type Packet = Pick<PacketTask, "before" | "changes" | "exact">;
export type PacketStage = "change" | "predict" | "result";
export type PacketEntry = { changed: (number | null)[]; direction: number | null; amount: string; result: string };
export const changeLabel = (n: number) => n < 0 ? `−${-n}` : `+${n}`;

export function packetValues(task: Packet) {
  const [a, b] = task.before, [da, db] = task.changes;
  return { a: a + da, b: b + db, oldSum: a + b, sum: a + b + da + db, delta: da + db };
}

export function checkPacket(task: Packet, stage: PacketStage, entry: PacketEntry): { next?: PacketStage; correct?: boolean; hint?: string } {
  const { delta, sum } = packetValues(task);
  if (task.changes.some((change, i) => change !== 0 && entry.changed[i] !== change))
    return { correct: false, hint: "Schau auf den Auftrag. Welche Zahl soll sich ändern? Achte auf Einer, Zehner und das Vorzeichen." };
  if (stage === "change") return { next: "predict" };
  if (entry.direction !== Math.sign(delta) || (task.exact && delta !== 0 && (!/^\d+$/.test(entry.amount) || Number(entry.amount) !== Math.abs(delta))))
    return { correct: false, hint: "Vergleiche die Zahlen vorher und nachher. Wirken die Änderungen in dieselbe Richtung oder gleichen sie sich aus?" };
  if (stage === "predict") return { next: "result" };
  return /^\d+$/.test(entry.result) && Number(entry.result) === sum ? { correct: true }
    : { correct: false, hint: "Starte bei der Summe der ersten Rechnung und nutze deine Vorhersage." };
}

export function sumPacket(level: Level): Omit<PacketTask, "id" | "skillId" | "level"> {
  const operations = level === 1 ? [-1, 1] : [-10, -1, 1, 10];
  const one = pick(operations);
  const two = level <= 2 ? 0 : level === 3 ? pick([one, -one]) : pick(operations);
  const changes: [number, number] = chance(0.5) ? [one, two] : [two, one];
  const minA = Math.max(0, -changes[0]), minB = Math.max(0, -changes[1]);
  const maxSum = (level === 1 ? 20 : 100) - Math.max(0, one + two);
  const total = randInt(minA + minB, maxSum);
  const a = randInt(minA, total - minB);
  const before: [number, number] = [a, total - a];
  const data = { before, changes, exact: level >= 4 };
  const values = packetValues(data);
  const effect = values.delta === 0 ? "Die Summe bleibt gleich." : `Die Summe wird um ${Math.abs(values.delta)} ${values.delta > 0 ? "größer" : "kleiner"}.`;
  return { ...data, format: "sum-packet", question: "Was passiert mit der Summe?",
    hint: "Beobachte jede Zahl einzeln. Überlege dann, was beide Veränderungen zusammen bewirken.",
    solution: `${a} + ${before[1]} = ${total}. Jetzt: ${values.a} + ${values.b} = ${values.sum}. ${effect}` };
}
