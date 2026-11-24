import { useState } from "react";
import { familyHint, familyLines, familyText, type FamilyLine } from "@/game/factFamily";
import type { FamilyTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

type Slots = [number | null, FamilyLine["op"] | null, number | null, number | null];
const blank = (): Slots => [null,null,null,null];
export function FactFamily({ task, status, onAnswer }: FormatProps<FamilyTask>) {
  const [whole, setWhole] = useState<number | null>(null), [building, setBuilding] = useState(false);
  const [slots, setSlots] = useState<Slots>(blank), [active,setActive] = useState(0);
  const [saved,setSaved] = useState<FamilyLine[]>([]), [note,setNote] = useState("");
  const solved = status === "right" || status === "reveal", locked = status !== "ask";
  const [x,y] = task.parts, sum = x+y, lines = familyLines(task);
  const chip = "min-h-11 min-w-11 rounded-xl border-2 px-2 ";
  function place(value: number | FamilyLine["op"]) {
    const next: Slots = [...slots];
    if (active === 1 && typeof value === "string") next[1] = value;
    else if (typeof value === "number" && (active === 0 || active === 2 || active === 3)) next[active] = value;
    else return;
    setSlots(next); setNote("");
    const empty = next.indexOf(null);
    if (empty !== -1) setActive(empty);
  }
  function collect() {
    const [a,op,b,c] = slots;
    if (locked || a === null || op === null || b === null || c === null) return;
    const line = {a,op,b,c};
    const hint = familyHint(task,line,saved);
    if (hint) {
      if (saved.some(l => familyText(l) === familyText(line))) setNote(hint);
      else onAnswer(false,hint);
      return;
    }
    const next = [...saved,line];
    setSaved(next); setSlots(blank()); setActive(0); setNote("");
    if (next.length === lines.length) onAnswer(true);
  }
  return <section className="grid gap-3">
    <figure className="grid gap-1 rounded-xl bg-white p-3 text-center">
      <figcaption>Teil-Ganzes-Bild</figcaption>
      <div className="rounded-t-lg border-2 border-grape p-1 font-bold">Ganzes: {building || solved ? sum : "?"}</div>
      <div className="flex h-8 overflow-hidden rounded-b-lg border" aria-hidden="true">{task.parts.map((v,i) => <div key={i}
        style={{ flexGrow: v, flexBasis: 0 }} className={i ? "border-l bg-coin-light" : "bg-sky-light"} />)}</div>
      <div className="flex justify-between gap-1"><span className="rounded bg-sky-light px-2">Linker Teil: {x}</span>
        <span className="rounded bg-coin-light px-2">Rechter Teil: {y}</span></div>
    </figure>
    {solved ? <div className="rounded-xl bg-white p-3">{lines.map(l => <p key={familyText(l)}>{familyText(l)}</p>)}
      {x===y && <p>Die Teile sind gleich groß. Beim Tauschen entsteht dieselbe Rechnung. Deshalb gibt es hier nur zwei verschiedene Rechnungen.</p>}</div> :
      !building ? <fieldset disabled={locked} className="grid gap-2"><legend>Welche Zahl ist das Ganze?</legend>
        <div className="flex gap-2">{task.cards.map(n => <button key={n} type="button" aria-pressed={n === whole}
          className={chip + (n === whole ? "border-grape bg-grape-light" : "border-transparent bg-white")} onClick={() => setWhole(n)}>{n}</button>)}</div>
        <Button disabled={whole === null} onClick={() => { if (whole === sum) setBuilding(true); else onAnswer(false,"Zähle beide Teile zusammen. Welche Zahl erhältst du?"); }}>Ganzes prüfen</Button>
      </fieldset> : <>
        <p>{x === y ? "Beide Teile sind gleich groß. Beim Tauschen bekommst du dieselben Zahlen. Finde zwei verschiedene Rechnungen." :
          "Finde alle vier verschiedenen Rechnungen. Du darfst mit jeder anfangen."}</p>
        <fieldset disabled={locked} className="grid gap-2 rounded-xl bg-white p-3">
          <legend>Baue deine Rechnung aus Karten.</legend>
          <div className="flex flex-wrap items-center gap-1">{slots.map((value,i) => <span key={i}>
            {i===3 && " = "}<button type="button" aria-pressed={active===i} aria-label={`${["Erste Zahl","Rechenzeichen","Zweite Zahl","Ergebnis"][i]}: ${value ?? "leer"}`}
              className={chip + (active===i ? "border-grape bg-grape-light" : "border-grape-light bg-white")} onClick={() => setActive(i)}>{value ?? "?"}</button></span>)}</div>
          <div className="flex flex-wrap gap-2" aria-label={active===1 ? "Zeichenkarten" : "Zahlenkarten"}>
            {(active === 1 ? ["+","−"] as const : task.cards).map(v => <button type="button" className={chip+"border-sky-light bg-sky-light"} key={v} onClick={() => place(v)}>{v}</button>)}
          </div>
          <Button disabled={slots.includes(null)} onClick={collect}>Rechnung sammeln</Button>
        </fieldset>
        <div aria-live="polite">{note && <p>{note}</p>}<p>{saved.length} von {lines.length} Rechnungen gesammelt</p>
          {saved.map(l => <p key={familyText(l)}>{familyText(l)}</p>)}</div>
      </>}
  </section>;
}
