import { useState } from "react";
import { addHeading, checkWays, wayId, wayLabel } from "@/game/wayTable";
import type { WayTableTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function WayTable({ task, onAnswer, status }: FormatProps<WayTableTask>) {
  const [rows, setRows] = useState<number[]>([]), [cols, setCols] = useState<number[]>([]);
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [cell, setCell] = useState<string | null>(null);
  const [count, setCount] = useState(""), [why, setWhy] = useState("");
  const locked = status !== "ask", solved = status === "right" || status === "reveal";
  const ready = rows.length === task.first.length && cols.length === task.second.length;
  const grid = rows.flatMap(a => cols.map(b => wayId(a, b)));
  const active = cell ?? grid.find(key => !entries[key]) ?? grid[0];
  const tile = "min-h-11 rounded-xl border-2 px-2 text-sm ";
  const labels = {
    pairs: "Jeder erste Abschnitt trifft jeden zweiten in genau einem Feld. Ich zähle nur die offenen Wege.",
    parts: "Ich zähle nur die einzelnen Abschnitte aus den Überschriften.",
  };
  function headings(items: string[], order: number[], set: (order: number[]) => void, title: string) {
    return <fieldset disabled={locked} className="rounded-xl bg-white p-2"><legend>{title}</legend>
      {order.length > 0 && <p>{order.map(i => items[i]).join(" · ")}</p>}
      {order.length < items.length ? items.map((name, i) => !order.includes(i) && <button type="button" key={name}
        className={tile + "mr-1 border-grape-light"} onClick={() => set(addHeading(order, i, items.length))}>{name}</button>) :
        <button type="button" className="min-h-11 underline" onClick={() => { set([]); setCell(null); }}>Reihenfolge ändern</button>}
    </fieldset>;
  }
  return <section className="grid gap-3">
    <p>Zur Bibliothek kannst du über {task.first.join(", ")} gehen. Zum Park stehen {task.second.join(", ")} zur Wahl.</p>
    {task.blocked && <p className="rounded-xl bg-coin-light p-2">Heute gesperrt: {wayLabel(task, task.blocked)}. Alle anderen Kombinationen sind offen.</p>}
    {!solved && <>
      {!ready && <p>Tippe die Überschriften in deiner Wunschreihenfolge an. Die letzte ergänzt sich von selbst.</p>}
      <div className="grid gap-1 sm:grid-cols-2">
        {headings(task.first, rows, setRows, "Zeilen · Schule zur Bibliothek")}
        {headings(task.second, cols, setCols, "Spalten · Bibliothek zum Park")}
      </div>
    </>}
    {(ready || solved) && <>
      <table className="w-full table-fixed border-separate border-spacing-0.5 text-center text-xs"><caption>Wege von der Schule über die Bibliothek zum Park</caption>
        <thead><tr><th scope="col">Erster Abschnitt</th>{cols.map(i => <th key={i} scope="col">{task.second[i]}</th>)}</tr></thead>
        <tbody>{rows.map(a => <tr key={a}><th scope="row">{task.first[a]}</th>{cols.map(b => {
          const key = wayId(a,b), value = solved ? key === task.blocked ? "closed" : key : entries[key];
          const text = value ? wayLabel(task, value) : "leer";
          return <td key={b}><button type="button" disabled={locked} aria-label={`Feld ${wayLabel(task,key)}: ${text}`}
            aria-pressed={!solved && active === key} onClick={() => setCell(key)}
            className={"min-h-12 w-full rounded-lg border-2 p-1 " + (!solved && active === key ? "border-grape bg-grape-light" : "border-sky-light bg-white")}>
            {text}</button></td>;
        })}</tr>)}</tbody></table>
      {!solved ? <>
        <fieldset disabled={locked} className="flex flex-wrap gap-1"><legend>Welche Wegkarte gehört ins markierte Feld?</legend>
          {[...task.cards, ...(task.blocked ? ["closed"] : [])].map(card => <button type="button" key={card} className={tile + "border-sky-light bg-white"}
            onClick={() => {
              const next = { ...entries, [active]: card };
              setEntries(next); setCell(grid.find(key => !next[key]) ?? active);
            }}>{wayLabel(task, card)}</button>)}
        </fieldset>
        <label>Wie viele offene Wege gibt es? <input className={tile + "w-14 bg-white"} disabled={locked} inputMode="numeric" value={count}
          onChange={e => { if (/^\d{0,2}$/.test(e.target.value)) setCount(e.target.value); }} /></label>
        <fieldset disabled={locked} className="grid gap-1"><legend>Woher weißt du, dass alle Wege dabei sind?</legend>
          {(task.cards[0].endsWith("/0") ? ["pairs","parts"] as const : ["parts","pairs"] as const).map(key =>
            <button type="button" key={key} aria-pressed={why === key} onClick={() => setWhy(key)}
              className={tile + "text-left " + (why === key ? "border-grape bg-grape-light" : "border-transparent bg-white")}>{labels[key]}</button>)}</fieldset>
        <Button disabled={locked || !count || !why} onClick={() => {
          if (locked) return;
          const hint = checkWays(task, entries, count, why); onAnswer(hint === null, hint ?? undefined);
        }}>Tabelle prüfen</Button>
      </> : <p>{task.solution}</p>}
    </>}
  </section>;
}
