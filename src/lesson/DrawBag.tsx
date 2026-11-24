import { useState } from "react";
import { bagHint, bagReason, chanceNames, eventText, nextDrawHint, type BagMark, type ChanceClass } from "@/game/drawBag";
import type { BagTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

const symbols:Record<BagMark,string>={Stern:"★",Kreis:"●",Herz:"♥",Dreieck:"▲"};
const control="min-h-11 rounded-xl border-2 bg-white px-3 aria-pressed:bg-sky-light";
function Tile({mark}:{mark:BagMark}) {
  return <span className="inline-grid min-h-14 min-w-14 place-items-center rounded-lg border-2 border-slate-400 bg-white p-1">
    <b aria-hidden="true" className="text-xl text-indigo-700">{symbols[mark]}</b><small>{mark}</small></span>;
}
export function DrawBag({task,status,onAnswer}:FormatProps<BagTask>) {
  const [stage,setStage]=useState<"guess"|"draw">("guess"),[count,setCount]=useState(0);
  const [answer,setAnswer]=useState(""),[reason,setReason]=useState(""),[seen,setSeen]=useState("");
  const solved=status==="right" || status==="reveal",locked=status!=="ask", first=stage==="guess";
  const event=first?task.first:task.next;
  const progress=solved?3:count;
  function check() {
    if(locked)return;
    const hint=first?bagHint(task.bag,event,answer,reason):nextDrawHint(task,seen,answer,reason);
    if(hint)onAnswer(false,hint);
    else if(first){setStage("draw");setAnswer("");setReason("");}
    else onAnswer(true);
  }
  return <section className="grid gap-3">
    <div className="rounded-3xl border-2 bg-sun-light p-3"><h3 className="font-bold">Im Beutel</h3>
      <ul className="flex flex-wrap gap-1">{task.bag.map((m,i)=><li key={i}><Tile mark={m}/></li>)}</ul></div>
    <p>Alle Plättchen fühlen sich gleich an. Du ziehst blind ein Plättchen und legst es wieder zurück.</p>
    {(!first || solved) && <div className="grid gap-2 rounded-xl bg-leaf-light p-3"><h3 className="font-bold">{solved && count<3?"Beispiel für drei Ziehungen":"Deine Ziehspur"}</h3>
      <ol aria-live="polite" className="flex flex-wrap gap-2">{task.series.slice(0,progress).map((m,i)=><li key={i}>Zug {i+1}<Tile mark={m}/></li>)}</ol>
      {!solved && count<3 && <Button disabled={locked} onClick={()=>setCount(n=>Math.min(3,n+1))}>Zug {count+1}: ziehen und zurücklegen</Button>}
    </div>}
    {solved ? <p className="rounded-xl bg-white p-2">{task.solution}</p>: (first || count===3) && <>
      {!first && <label>Wie oft kam „{eventText(event)}“ in deinen drei Zügen vor? <select value={seen} disabled={locked}
        className={control} onChange={e=>setSeen(e.target.value)}><option value="">Wähle</option>{[0,1,2,3].map(n=><option key={n}>{n}</option>)}</select></label>}
      <fieldset disabled={locked} className="flex flex-wrap gap-1"><legend>{first?"Beim ersten Zug":"Beim nächsten Zug"}: Wie ist es, „{eventText(event)}“ zu ziehen?</legend>
        {(Object.keys(chanceNames) as ChanceClass[]).map(key=><button type="button" key={key} className={control} aria-pressed={answer===key}
          onClick={()=>setAnswer(key)}>{chanceNames[key]}</button>)}</fieldset>
      <fieldset disabled={locked} className="grid gap-1"><legend>Woran erkennst du das im Beutel?</legend>
        {task.reasons.map(key=><button type="button" key={key} className={control} aria-pressed={reason===key} onClick={()=>setReason(key)}>{bagReason(event,key)}</button>)}</fieldset>
      <Button disabled={locked || !answer || !reason || (!first && seen==="")} onClick={check}>{first?"Vorhersage prüfen":"Ziehspur und nächsten Zug prüfen"}</Button>
    </>}
  </section>;
}
