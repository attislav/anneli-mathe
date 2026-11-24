import { useState } from "react";
import { checkShopList, shopSolution, type ShopEntry } from "@/game/shopList";
import type { ShopListTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function ShopList({ task, status, onAnswer }: FormatProps<ShopListTask>) {
  const [entry, setEntry] = useState<ShopEntry>(() => ({
    available: task.stores.map(() => null), totals: task.stores.map(() => ""), winner: "", saving: "",
  }));
  const solved = status === "right" || status === "reveal";
  const answer = shopSolution(task);
  const shown = solved ? { available: answer.totals.map(t => t !== null), totals: answer.totals.map(t => String(t ?? "")),
    winner: answer.winner, saving: String(answer.saving) } : entry;
  const ready = entry.available.every((v, i) => v !== null && (!v || entry.totals[i] !== "")) && entry.winner !== "" && entry.saving !== "";
  const field = "min-h-11 rounded-xl border-2 border-grape-light bg-white px-2";
  const money = (label: string, value: string, update: (v: string) => void) => <label className="flex flex-wrap items-center gap-2">
    {label} <input className={field + " w-16"} inputMode="numeric" value={value} onChange={e => {
      if (/^\d{0,3}$/.test(e.target.value)) update(e.target.value);
    }} /> ct</label>;
  return <form className="grid gap-3" onSubmit={e => {
    e.preventDefault();
    if (!ready || status !== "ask") return;
    const result = checkShopList(task, entry);
    onAnswer(result.correct, result.hint);
  }}>
    <section className="rounded-2xl bg-coin-light p-3"><h2 className="font-display text-xl">Dein Einkaufszettel</h2>
      <p>{task.goods.map(g => "1 " + g).join(" · ")}</p></section>
    <fieldset disabled={status !== "ask"} className="grid gap-3">
      {task.stores.map((store, i) => <section key={store.name} className="grid gap-2 rounded-2xl bg-white p-3">
        <h3 className="font-display text-lg">{store.name}</h3>
        <ul>{task.goods.map((g, j) => <li key={g} className="flex justify-between border-b border-grape-light">
          <span>{g}</span><span>{store.prices[j] === null ? "ausverkauft" : store.prices[j] + " ct"}</span></li>)}</ul>
        <label>Gibt es bei {store.name} alles? <select className={field} value={shown.available[i] === null ? "" : String(shown.available[i])}
          onChange={e => { const next = e.target.value;
            setEntry({ ...entry, available: entry.available.map((v, j) => i === j ? next === "" ? null : next === "true" : v),
              totals: entry.totals.map((v, j) => i === j ? "" : v), winner: "", saving: "" });
          }}><option value="">Wähle</option><option value="true">Ja</option><option value="false">Nein</option></select></label>
        {shown.available[i] && money("Summe bei " + store.name, shown.totals[i], value =>
          setEntry({ ...entry, totals: entry.totals.map((v, j) => j === i ? value : v) }))}
      </section>)}
      <label>Wo ist der ganze Einkauf am günstigsten? <select className={field} value={shown.winner} onChange={e => setEntry({ ...entry, winner: e.target.value })}>
        <option value="">Wähle</option>{task.stores.map((s, i) => <option key={s.name} value={i}>{s.name}</option>)}
        <option value="tie">Beide vollständigen Einkäufe kosten gleich viel</option></select></label>
      {money("Wie viel sparst du gegenüber dem anderen vollständigen Einkauf?", shown.saving, saving => setEntry({ ...entry, saving }))}
      {!solved && <Button type="submit" disabled={!ready}>Antwort prüfen</Button>}
    </fieldset>
  </form>;
}
