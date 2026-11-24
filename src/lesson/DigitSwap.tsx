import { useState } from "react";
import { exampleCards, signed, swapChangeHint, swapLayoutHint, swapValues } from "@/game/digitSwap";
import type { SwapTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function DigitSwap({task,status,onAnswer}:FormatProps<SwapTask>) {
  const [cards,setCards]=useState<number[]>([]),[prediction,setPrediction]=useState(""),[swapped,setSwapped]=useState(false);
  const [tens,setTens]=useState(""),[ones,setOnes]=useState("");
  const solved=status==="right" || status==="reveal", locked=status!=="ask", hint=swapLayoutHint(task,cards);
  const shown=solved && hint?exampleCards(task):cards, ready=shown.length===2;
  const values=ready?swapValues(task,shown):null;
  const chip="min-h-11 rounded-xl border-2 bg-white px-2 aria-pressed:bg-sky-light";
  function check(){
    if(locked || !values)return;
    if(hint)onAnswer(false,hint);
    else if(!swapped) {
      if(prediction!==values.relation)onAnswer(false,"Vergleiche die jetzige Zehnerkarte mit der Karte, die nach vorne wandert.");
      else setSwapped(true);
    } else {
      const wrong=swapChangeHint(task,cards,tens,ones);
      onAnswer(!wrong,wrong??undefined);
    }
  }
  const slot=(i:number)=>shown[i]===undefined?"–":task.digits[shown[i]];
  const field=(label:string,value:string,set:(v:string)=>void,step:number)=><label>{label} <select className={chip} disabled={locked} value={value}
    onChange={e=>set(e.target.value)}><option value="">Wähle</option>{Array.from({length:17},(_,i)=>(i-8)*step).map(n=><option key={n} value={n}>{signed(n)}</option>)}</select></label>;
  return <section className="grid gap-3">
    <p>Lege eine Startzahl von {task.min} bis {task.max}. Auch nach dem Tausch soll sie zweistellig sein.</p>
    {!solved && !swapped && <fieldset disabled={locked} className="flex flex-wrap gap-2"><legend>Wähle zuerst die Zehnerkarte, dann die Einerkarte.</legend>
      {task.digits.map((d,i)=><button key={i} type="button" className={chip+" min-w-11 font-display text-xl"}
        disabled={cards.includes(i)||cards.length===2} aria-label={`Karte ${i+1}: Ziffer ${d}`} aria-pressed={cards.includes(i)}
        onClick={()=>{setCards([...cards,i]);setPrediction("");}}>{d}</button>)}</fieldset>}
    <div className="rounded-xl bg-sky-light p-3"><h3 className="font-bold">{solved && hint?"Eine mögliche Startzahl":"Deine Startzahl"}</h3>
      <p>Zehner {slot(0)} · Einer {slot(1)}</p></div>
    {!solved && !swapped && <>
      <button type="button" className="min-h-11 underline" disabled={locked || !cards.length} onClick={()=>{setCards(cards.slice(0,-1));setPrediction("");}}>Letzte Karte zurücknehmen</button>
      {ready && hint && <p role="status">{hint}</p>}
      {ready && !hint && <fieldset disabled={locked} className="flex flex-wrap gap-2"><legend>Wie wird die Zahl nach dem Tausch?</legend>
        {["größer","kleiner","gleich groß"].map(v=><button type="button" key={v} className={chip} aria-pressed={v===prediction} onClick={()=>setPrediction(v)}>{v}</button>)}</fieldset>}
    </>}
    {(swapped||solved) && values && <>
      <div className="rounded-xl bg-leaf-light p-3"><h3 className="font-bold">Nach dem Platztausch</h3>
        <p>{values.start} → {values.end} · Jetzt steht {slot(1)} bei den Zehnern und {slot(0)} bei den Einern.</p></div>
      {solved?<p>{values.end} ist {values.relation} {values.relation==="gleich groß"?"wie":"als"} {values.start}. Zehnerwert: {signed(values.tens)}. Einerwert: {signed(values.ones)}.</p>:
        <><p>Wie ändern sich die beiden Werte? Plus bedeutet mehr, Minus weniger und 0 gleich viel.</p>
          {field("Änderung beim Zehnerwert",tens,setTens,10)}{field("Änderung beim Einerwert",ones,setOnes,1)}</>}
    </>}
    {!solved && <Button disabled={locked || !ready || !!hint || (swapped?tens===""||ones==="":!prediction)} onClick={check}>
      {swapped?"Änderungen prüfen":"Vermutung prüfen und tauschen"}</Button>}
  </section>;
}
