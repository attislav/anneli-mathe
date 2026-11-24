import { pick, shuffle } from "./random";
import type { Level, WayTableTask } from "./types";

type MapData = Pick<WayTableTask, "first" | "second" | "blocked">;
export const wayId = (a: number, b: number) => a + "/" + b;
export function wayCards(task: Pick<MapData, "first" | "second">) {
  return task.first.flatMap((_, i) => task.second.map((_, j) => wayId(i, j)));
}
export function wayLabel(task: MapData, id: string) {
  if (id === "closed") return "gesperrt";
  const [a, b] = id.split("/").map(Number);
  return `${task.first[a]} → ${task.second[b]}`;
}
export function addHeading(order: number[], id: number, length: number) {
  if (order.includes(id) || id < 0 || id >= length) return order;
  const next = [...order, id];
  if (next.length === length - 1) next.push(Array.from({ length }, (_, i) => i).find(i => !next.includes(i))!);
  return next;
}
export function checkWays(task: MapData, entries: Record<string, string>, count: string, why: string) {
  const keys = wayCards(task), seen = new Set<string>();
  for (const key of keys) {
    const card = entries[key];
    if (!card) return `Bei ${wayLabel(task, key)} fehlt noch eine Karte.`;
    if (key === task.blocked && card !== "closed") return `Die Kombination ${wayLabel(task, key)} ist gesperrt. Markiere ihr Feld als gesperrt.`;
    if (card === "closed" && key !== task.blocked) return `Der Weg ${wayLabel(task, key)} ist offen. Welche Karte passt?`;
    if (card === task.blocked) return `Die Karte ${wayLabel(task, card)} zeigt die gesperrte Kombination.`;
    if (seen.has(card)) return `Die Karte ${wayLabel(task, card)} kommt doppelt vor. Prüfe ihre beiden Felder.`;
    seen.add(card);
  }
  const wrong = keys.find(key => key !== task.blocked && entries[key] !== key);
  if (wrong) return `Beim Feld ${wayLabel(task, wrong)} müssen beide Abschnitte zu den Überschriften passen.`;
  if (!/^\d+$/.test(count) || Number(count) !== keys.length - Number(task.blocked !== null))
    return "Zähle die offenen Wege Zeile für Zeile. Jeder davon zählt genau einmal.";
  if (why !== "pairs") return "Schau, wie jede Zeile alle Spalten kreuzt. Was bedeutet ein Feld für einen ganzen Weg?";
  return null;
}
export function wayTable(level: Level): Omit<WayTableTask, "id" | "skillId" | "level"> {
  const first = shuffle(["Tor", "Teich", "Brücke", "Kirche"]).slice(0, level >= 3 ? 3 : 2);
  const second = shuffle(["Brunnen", "Wiese", "Hof", "Turm"]).slice(0, level >= 2 ? 3 : 2);
  const cards = shuffle(wayCards({ first, second }));
  const blocked = level >= 4 ? pick(cards) : null;
  const total = cards.length - Number(blocked !== null);
  return { format: "way-table", first, second, blocked, cards,
    question: "Welche Wege führen von der Schule über die Bibliothek zum Park?",
    hint: "Lies zuerst den Weg zur Bibliothek aus der Zeile. Die Spalte zeigt den Weg weiter zum Park.",
    solution: `Es gibt ${first.length} erste und ${second.length} zweite Abschnitte. In jedem Feld treffen sich genau zwei Abschnitte. ${first.length} × ${second.length}${blocked ? " − 1" : ""} = ${total} offene Wege.` };
}
