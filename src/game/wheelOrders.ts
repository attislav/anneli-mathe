import { pick } from "./random";
import type { Level, WheelTask } from "./types";

export type WheelOrder = { bikes: number; trikes: number };

export function wheelRows(wheels: number) {
  return Array.from({ length: Math.floor(wheels / 3) + 1 }, (_, trikes) => {
    const rest = wheels - 3 * trikes;
    return { trikes, rest, bikes: rest % 2 === 0 ? rest / 2 : null };
  });
}

export function collectOrder(wheels: number, orders: WheelOrder[], order: WheelOrder) {
  const { bikes, trikes } = order;
  if (![bikes,trikes].every(n => Number.isInteger(n) && n >= 0)) return { orders, message: "Wähle für beide Sorten eine Anzahl." };
  const used = 2 * bikes + 3 * trikes;
  if (used !== wheels) return { orders, message: used < wheels ? "Es sind noch Räder übrig. Ändere deine Bestellung." : "So viele Räder sind nicht im Lager. Probiere eine kleinere Bestellung." };
  if (orders.some(o => o.trikes === trikes && o.bikes === bikes)) return { orders, message: "Diese Bestellung hast du schon gesammelt." };
  return { orders: [...orders, order], message: "Deine Bestellung ist in der Sammlung." };
}

export function wheelProof(wheels: number, orders: WheelOrder[], marks: (boolean | undefined)[]) {
  for (const row of wheelRows(wheels)) {
    if (row.bikes !== null && !orders.some(o => o.trikes === row.trikes && o.bikes === row.bikes))
      return "Dir fehlt noch eine Bestellung. Probiere auch Aufträge mit nur einer Sorte und gehe die Dreiradzahlen der Reihe nach durch.";
    if (marks[row.trikes] !== (row.bikes !== null)) return `Prüfe die Zeile für ${row.trikes} ${row.trikes === 1 ? "Dreirad" : "Dreiräder"}. Bilde Paare aus dem Rest. Bleibt ein einzelnes Rad übrig?`;
  }
  return null;
}

export function wheelOrders(level: Level): Omit<WheelTask, "skillId" | "level" | "id"> {
  const wheels = pick(level <= 2 ? [6,8,9] : level === 3 ? [10,11,12,13] : [14,15,16,17,18]);
  const pairs = wheelRows(wheels).filter(row => row.bikes !== null).map(row => `(${row.bikes}, ${row.trikes})`);
  return { format: "wheel-orders", wheels, question: `Die Werkstatt hat ${wheels} Räder. Welche Bestellungen verbrauchen alle Räder?`,
    hint: "Ein Fahrrad braucht zwei Räder, ein Dreirad drei. Eine Sorte darf fehlen.",
    solution: `Alle Bestellungen (Fahrräder, Dreiräder): ${pairs.join(", ")}. Nur ein gerader Rest lässt sich in Fahrradpaare aufteilen. Auch bei 0 bleibt kein Rad übrig.` };
}
