import { randInt, shuffle } from "./random";
import type { Level, ShopListTask } from "./types";

type Catalog = Pick<ShopListTask, "goods" | "stores">;
export type ShopEntry = { available: (boolean | null)[]; totals: string[]; winner: string; saving: string };

export function shopSolution({ stores }: Catalog) {
  const totals = stores.map(store => store.prices.every(p => p !== null) ? store.prices.reduce<number>((sum, price) => sum + (price ?? 0), 0) : null);
  const complete = totals.flatMap((total, index) => total === null ? [] : [{ total, index }]).sort((a, b) => a.total - b.total);
  const [low, high] = complete;
  return { totals, winner: low.total === high.total ? "tie" : String(low.index), saving: high.total - low.total };
}

export function checkShopList(task: Catalog, entry: ShopEntry) {
  const answer = shopSolution(task);
  for (const [i, total] of answer.totals.entries()) {
    const name = task.stores[i].name;
    if (entry.available[i] !== (total !== null)) return { correct: false, hint: `Vergleiche deinen Zettel mit dem Angebot von ${name}. Gibt es wirklich jede Ware?` };
    if (total !== null && (!/^\d+$/.test(entry.totals[i]) || Number(entry.totals[i]) !== total))
      return { correct: false, hint: `Rechne bei ${name} alle Preise auf deinem Zettel zusammen.` };
  }
  if (entry.winner !== answer.winner) return { correct: false, hint: "Vergleiche die beiden Summen für den ganzen Zettel. Sind sie verschieden oder gleich?" };
  if (!/^\d+$/.test(entry.saving) || Number(entry.saving) !== answer.saving)
    return { correct: false, hint: "Wie viele Cent fehlen von der kleineren Summe bis zur größeren? Sind beide gleich, sparst du nichts." };
  return { correct: true };
}

export function shopList(level: Level): Omit<ShopListTask, "id" | "skillId" | "level"> {
  const goods = shuffle(["Apfel", "Birne", "Banane", "Brötchen", "Karotte", "Pflaume"]).slice(0, level <= 2 ? 2 : 3);
  const names = shuffle(["Sonnenladen", "Mondladen", "Sternladen"]);
  const prices = () => goods.map(() => level === 1 ? randInt(1, 4) * 5 : level <= 3 ? randInt(1, 6) * 5 : randInt(5, 33));
  const stores: ShopListTask["stores"] = names.slice(0, 2).map(name => ({ name, prices: prices() }));
  if (level >= 3) {
    const missing = randInt(0, goods.length - 1);
    stores.push({ name: names[2], prices: goods.map((_, i) => i === missing ? null : Math.min(...stores.map(s => s.prices[i]!))) });
  }
  const task = { goods, stores: shuffle(stores) };
  const { totals, winner, saving } = shopSolution(task);
  const sums = task.stores.map((store, i) => totals[i] === null ? `${store.name}: ${goods[store.prices.indexOf(null)]} fehlt.` :
    `${store.name}: ${store.prices.join(" + ")} = ${totals[i]} ct.`).join(" ");
  const result = winner === "tie" ? "Beide vollständigen Einkäufe kosten gleich viel." : `Bei ${task.stores[Number(winner)].name} ist der ganze Einkauf günstiger.`;
  return { ...task, format: "shop-list", question: "Wo bekommst du alle Waren auf deinem Zettel am günstigsten?",
    hint: "Schau für jeden Laden nach, ob alle Waren da sind. Addiere dann die Preise für den ganzen Zettel.",
    solution: `${sums} ${result} Du sparst ${saving} ct.` };
}
