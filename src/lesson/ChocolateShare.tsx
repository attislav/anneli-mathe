import { useState } from "react";
import { checkPortions, checkShare, examplePortions, shareWord } from "@/game/chocolate";
import type { ChocolateTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

const colors = ["bg-grape-light", "bg-sky-light", "bg-coin-light", "bg-leaf-light"];
export function ChocolateShare({ task, status, onAnswer }: FormatProps<ChocolateTask>) {
  const [child, setChild] = useState(0);
  const [cells, setCells] = useState<number[]>(() => Array(task.rows * task.cols).fill(-1));
  const [divided, setDivided] = useState(false);
  const [count, setCount] = useState("");
  const [part, setPart] = useState("");
  const solved = status === "right" || status === "reveal", locked = status !== "ask";
  const shown = solved && checkPortions(task, cells) ? examplePortions(task) : cells;
  const tile = "min-h-11 rounded-lg border-2 font-display ";
  function submit() {
    if (locked) return;
    if (!divided) {
      const hint = checkPortions(task, cells);
      if (hint) onAnswer(false, hint);
      else setDivided(true);
      return;
    }
    const hint = checkShare(task, count, part);
    onAnswer(hint === null, hint ?? undefined);
  }
  return <section className="grid gap-3">
    {!solved && !divided && <fieldset disabled={locked} className="flex flex-wrap gap-2">
      <legend>Wähle ein Kind und tippe seine Kästchen an.</legend>
      {colors.slice(0, task.children).map((color, i) => <button type="button" key={i} aria-pressed={child === i}
        className={tile + color + (child === i ? " border-grape px-3" : " border-transparent px-3")} onClick={() => setChild(i)}>Kind {i + 1}</button>)}
    </fieldset>}
    <div className="mx-auto grid w-full max-w-xs gap-1 rounded-2xl bg-amber-900 p-2" role="group" aria-label="Schokoladentafel"
      style={{ gridTemplateColumns: `repeat(${task.cols}, minmax(0, 1fr))` }}>
      {shown.map((v, i) => <button key={i} type="button" disabled={locked || divided} aria-label={`Reihe ${Math.floor(i / task.cols) + 1}, Spalte ${i % task.cols + 1}, ${v < 0 ? "frei" : "Kind " + (v + 1)}`}
        className={tile + (v < 0 ? "border-amber-700 bg-amber-200" : "border-transparent " + colors[v])}
        onClick={() => setCells(cells.map((old, j) => j === i ? old === child ? -1 : child : old))}>{v < 0 ? "·" : v + 1}</button>)}
    </div>
    {!solved && !divided && <p className="text-sm">Eine Zahl zeigt, welchem Kind das Kästchen gehört. Tippe es mit einem anderen Kind an, um es umzuverteilen.</p>}
    {solved ? <p className="rounded-xl bg-white p-3">{task.solution}</p> : divided && <>
      <p>Deine Aufteilung passt. Schau auf die Kästchen mit der 1.</p>
      <label>Wie viele Kästchen bekommt Kind 1? <input value={count} disabled={locked} inputMode="numeric" className="min-h-11 w-16 rounded-xl border-2 border-grape-light px-2"
        onChange={e => { if (/^\d{0,2}$/.test(e.target.value)) setCount(e.target.value); }} /></label>
      <fieldset disabled={locked} className="grid grid-cols-2 gap-2"><legend>Welcher Anteil der ganzen Tafel ist das?</legend>
        {[shareWord(2), shareWord(4)].map(word => <button type="button" key={word} aria-pressed={word === part}
          className={tile + (part === word ? "border-grape bg-grape-light" : "border-transparent bg-white")} onClick={() => setPart(word)}>{word}</button>)}
      </fieldset>
      <button type="button" disabled={locked} className="justify-self-start underline" onClick={() => { setDivided(false); setCount(""); setPart(""); }}>Aufteilung ändern</button>
    </>}
    {!solved && <Button disabled={locked || (divided ? !count || !part : cells.every(v => v < 0))} onClick={submit}>
      {divided ? "Antwort prüfen" : "Aufteilung prüfen"}</Button>}
  </section>;
}
