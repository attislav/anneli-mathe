import { useState } from "react";
import { checkStory, storyAmount, storyUnit } from "@/game/clarifyStory";
import type { ClarifyTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function ClarifyStory({ task, status, onAnswer }: FormatProps<ClarifyTask>) {
  const [opened,setOpened] = useState<number[]>([]), [selected,setSelected] = useState<number[]>([]);
  const [op,setOp] = useState(""), [result,setResult] = useState("");
  const solved = status === "right" || status === "reveal", locked = status !== "ask";
  const tile = "min-h-11 rounded-xl border-2 px-2 py-1 ";
  function toggle(i: number) {
    setSelected(v => v.includes(i) ? v.filter(n => n !== i) : v.length < 2 ? [...v,i] : v);
    setResult(""); setOp("");
  }
  if (solved) return <section className="grid gap-2 rounded-xl bg-leaf-light p-3">
    <p>Diese Rückfrage klärt die Aufgabe: {task.facts[1].what}</p>
    <p>{task.solution}</p>
  </section>;
  return <section className="grid gap-3">
    <p className="rounded-xl bg-sky-light p-3">Das weißt du schon: {task.facts[0].label} · {storyAmount(task.facts[0].value,task.facts[0].unit)}</p>
    <fieldset disabled={locked} className="grid gap-1"><legend>Was möchtest du noch wissen?</legend>
      {task.order.map(i => { const fact = task.facts[i]; return <div key={i} className="rounded-xl bg-white">
        <button type="button" disabled={opened.includes(i)} className={tile+"w-full border-grape-light text-left"}
          onClick={() => setOpened(v => v.includes(i) ? v : [...v,i])}>{fact.what}</button>
        {opened.includes(i) && <p className="p-2" aria-live="polite">{fact.label}: {storyAmount(fact.value,fact.unit)}</p>}</div>; })}
    </fieldset>
    <fieldset disabled={locked} className="grid gap-1"><legend>Wähle zwei Angaben für deine Rechnung.</legend>
      {[0,...opened].map(i => { const f = task.facts[i]; return <button type="button" key={i} aria-pressed={selected.includes(i)}
        disabled={!selected.includes(i) && selected.length===2} className={tile+(selected.includes(i) ? "border-grape bg-grape-light" : "border-transparent bg-white")}
        onClick={() => toggle(i)}>{f.label} · {storyAmount(f.value,f.unit)}</button>; })}
    </fieldset>
    {selected.length === 2 && <fieldset disabled={locked} className="grid gap-1 rounded-xl bg-white p-3"><legend>Meine Rechnung</legend>
      <div className="flex flex-wrap items-center gap-2"><strong>{task.facts[selected[0]].value}</strong>
        <select aria-label="Rechenzeichen" className={tile} value={op} onChange={e => setOp(e.target.value)}>
          <option value="">Zeichen</option><option>+</option><option>−</option></select>
        <strong>{task.facts[selected[1]].value} = </strong><input aria-label="Ergebnis" className={tile+"w-16"} inputMode="numeric"
          value={result} onChange={e => { if (/^\d{0,3}$/.test(e.target.value)) setResult(e.target.value); }} />{storyUnit(task.facts[0].unit,result)}</div>
      <button type="button" className="min-h-11 justify-self-start underline" onClick={() => { setSelected(([a,b]) => [b,a]); setResult(""); }}>Zahlen tauschen</button>
      <Button disabled={!op || result === ""} onClick={() => {
        if (locked) return;
        const hint = checkStory(task,opened,selected,op,result); onAnswer(hint === null,hint ?? undefined);
      }}>Aufgabe prüfen</Button></fieldset>}
  </section>;
}
