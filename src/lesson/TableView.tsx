import { useState } from "react";
import { Apple, BookOpen, Clock, CupSoda, KeyRound, Pencil, UserRound } from "lucide-react";
import { checkView, LOOKS, ownView, SIDES } from "@/game/tableView";
import type { TableItem, TableSide, ViewpointTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

const icons = { Tasse: CupSoda, Buch: BookOpen, Schlüssel: KeyRound, Apfel: Apple, Stift: Pencil, Uhr: Clock };
const arrows = { unten: "↑", oben: "↓", links: "→", rechts: "←" };
const places = ["oben links", "oben rechts", "unten links", "unten rechts"];
const marker = { unten: "col-start-2 row-start-3", oben: "col-start-2 row-start-1", links: "col-start-1 row-start-2", rechts: "col-start-3 row-start-2" };

function TablePicture({ items, side }: { items: TableItem[]; side?: TableSide }) {
  return <div className="mx-auto grid w-full max-w-xs grid-cols-[2.5rem_1fr_2.5rem] grid-rows-[auto_1fr_auto] items-center justify-items-center gap-1">
    {side && <span className={`flex items-center rounded-lg bg-grape-light px-1 ${marker[side]}`}
      aria-label={`Mila steht ${side}, Blick nach ${LOOKS[side]}`} role="img">
      <UserRound aria-hidden size={18} /><b aria-hidden>{arrows[side]}</b></span>}
    <div role="group" aria-label="Tisch in der Draufsicht" className="col-start-2 row-start-2 grid w-full grid-cols-2 gap-1 rounded-2xl bg-[#d1aa78] p-2">
      {items.map((item, i) => {
        const Icon = icons[item];
        return <span key={item} className="grid justify-items-center rounded-lg bg-white py-1 text-sm">
          <span className="sr-only">{places[i]}: </span><Icon aria-hidden size={24} />{item}</span>;
      })}
    </div>
  </div>;
}

export function TableView({ task, status, onAnswer }: FormatProps<ViewpointTask>) {
  const [pair, setPair] = useState<(TableItem | null)[]>([null, null]);
  const [slot, setSlot] = useState(0);
  const [side, setSide] = useState<TableSide | null>(null);
  const solved = status === "right" || status === "reveal";
  const locked = status !== "ask";
  const own = ownView(task.items, task.side);
  const button = "min-h-11 rounded-xl border-2 border-grape-light bg-white px-2 aria-pressed:border-grape aria-pressed:bg-grape-light";
  function fill(item: TableItem) {
    const next = [...pair];
    if (next[1 - slot] === item) next[1 - slot] = next[slot];
    next[slot] = item;
    setPair(next);
    setSlot(1 - slot);
  }
  return <div className="grid gap-3">
    <section className="grid gap-2 rounded-2xl bg-white p-3 text-center">
      <h2 className="font-display text-lg">Blick von oben</h2>
      <TablePicture items={task.items} side={!task.reverse || solved ? task.side : undefined} />
      {(!task.reverse || solved) && <p>Mila steht {task.side} und schaut nach {LOOKS[task.side]}.</p>}
    </section>
    {solved ? <section className="grid gap-2 rounded-2xl bg-sky-light p-3 text-center">
      <h2 className="font-display text-lg">So sieht Mila den Tisch</h2>
      <p>Drehe den Plan so, dass Mila unten steht. Die untere Reihe ist ihr am nächsten.</p>
      <TablePicture items={own} side="unten" />
      <p>Links: {own[2]} · Rechts: {own[3]}</p>
    </section> : <>
      {task.reverse ? <>
        <p className="rounded-2xl bg-sky-light p-3">Mila sieht an der nahen Kante links: {own[2]}. Rechts: {own[3]}.</p>
        <div role="group" aria-label="Milas Standort wählen" className="grid grid-cols-2 gap-2">{SIDES.map(place =>
          <button type="button" key={place} className={button} disabled={locked} aria-pressed={side === place} onClick={() => setSide(place)}>{place}</button>)}</div>
      </> : <>
        <div role="group" aria-label="Platz an Milas Kante wählen" className="grid grid-cols-2 gap-2">
          {["Links", "Rechts"].map((label, i) => <button key={label} className={button} type="button" disabled={locked}
            aria-pressed={slot === i} onClick={() => setSlot(i)}>{label}: {pair[i] ?? "?"}</button>)}
        </div>
        <p aria-live="polite">Wähle das Ding für Milas {slot === 0 ? "linke" : "rechte"} Seite.</p>
        <div className="grid grid-cols-2 gap-2">{task.items.map(item =>
          <button key={item} type="button" className={button} disabled={locked} onClick={() => fill(item)}>{item}</button>)}</div>
      </>}
      <Button disabled={locked || (task.reverse ? !side : pair.some(item => !item))} onClick={() => {
        const result = checkView(task, pair, side);
        onAnswer(result.correct, result.hint);
      }}>Ansicht prüfen</Button>
    </>}
  </div>;
}
