import { useState } from "react";
import { divisionHint, meanings, modelDivisionHint, placeCounter } from "@/game/divisionClinic";
import type { DivisionMeaningTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

const chip="min-h-11 rounded-xl border-2 bg-white px-2 aria-pressed:bg-sky-light";
function MeaningFields({entry,meaning,setEntry,setMeaning,disabled=false}:{entry:string;meaning:string;setEntry:(v:string)=>void;setMeaning:(v:string)=>void;disabled?:boolean}) {
  return <fieldset disabled={disabled} className="grid gap-2"><legend>Dein Ergebnis</legend>
    <label>Anzahl <input inputMode="numeric" className={chip+" w-16"} value={entry} onChange={e=>{if(/^\d{0,2}$/.test(e.target.value))setEntry(e.target.value);}}/></label>
    <div className="flex gap-2">{meanings.map(v=><button type="button" key={v} aria-pressed={meaning===v} className={chip} onClick={()=>setMeaning(v)}>{v}</button>)}</div>
  </fieldset>;
}
export function DivisionModel({onBack,onNext}:{onBack:()=>void;onNext:()=>void}) {
  const [stage,setStage]=useState<"share"|"group"|"link">("share"),[plates,setPlates]=useState([0,0,0]);
  const [entry,setEntry]=useState(""),[meaning,setMeaning]=useState(""),[hint,setHint]=useState(""),[linked,setLinked]=useState(false);
  const remaining=12-plates.reduce((a,b)=>a+b,0),share=stage==="share";
  function reset(){
    setPlates(share?[0,0,0]:[]);setHint("");setEntry("");setMeaning("");
  }
  function check(){
    if(stage==="link")return;
    const note=modelDivisionHint(stage,plates,entry,meaning);
    if(note){setHint(note);return;}
    setStage(share?"group":"link");setHint("");setEntry("");setMeaning("");
    if(share)setPlates([]);
  }
  return <main className="mx-auto grid min-h-dvh max-w-xl content-start gap-3 bg-mist p-5">
    <button type="button" className="min-h-11 justify-self-start underline" onClick={onBack}>← Zur Sprechstunde</button>
    <h1 className="font-display text-2xl">Was zählt die Geteilt-Aufgabe?</h1>
    {stage!=="share" && <p className="rounded-xl bg-sky-light p-2">12 : 3 = 4 Plättchen je Teller. Du hast zwölf Plättchen gleich auf drei Teller verteilt.</p>}
    <p>{share?"Verteile zwölf Plättchen gleich auf drei Teller. Wie viele liegen auf einem Teller?":stage==="group"?
      "Nimm dieselben zwölf Plättchen zurück. Stelle selbst Teller hin und lege auf jeden vier. Wie viele Teller brauchst du?":
      "12 : 4 = 3 Teller. Welche Malrechnung beschreibt dein Material?"}</p>
    {stage!=="link" && <p aria-live="polite">Im Vorrat: {remaining} Plättchen</p>}
    <div className="grid grid-cols-2 gap-2">{plates.map((count,i)=><div key={i} className="grid gap-1 rounded-3xl border-2 bg-white p-2">
      <strong>Teller {i+1}</strong><span role="img" aria-label={count+" Plättchen"} className="min-h-6 text-grape">{count?"● ".repeat(count):"leer"}</span>
      {stage!=="link" && <div className="flex gap-1">{([1,-1] as const).map(step=><button type="button" key={step} className={chip}
        aria-label={`Auf Teller ${i+1} ein Plättchen ${step===1?"dazulegen":"wegnehmen"}`} disabled={step===1?!remaining:count===0}
        onClick={()=>{setPlates(old=>placeCounter(old,i,step));setHint("");}}>{step===1?"+1":"−1"}</button>)}</div>}
    </div>)}</div>
    {stage==="group" && <div className="flex flex-wrap gap-2"><button type="button" className={chip} disabled={plates.length>=12}
      onClick={()=>{setPlates([...plates,0]);setHint("");}}>Teller dazustellen</button>
      <button type="button" className={chip} disabled={!plates.includes(0)} onClick={()=>{setPlates(plates.filter((_,i)=>i!==plates.lastIndexOf(0)));setHint("");}}>Leeren Teller wegnehmen</button></div>}
    {stage!=="link"?<>
      <MeaningFields entry={entry} meaning={meaning} setEntry={setEntry} setMeaning={setMeaning}/>
      <div className="flex flex-wrap gap-2"><Button disabled={!entry||!meaning} onClick={check}>Material prüfen</Button>
        <button type="button" className={chip} onClick={reset}>Neu legen</button></div>
    </>:linked?<><p>Drei Teller mit vier Plättchen ergeben zwölf. Beide Geteilt-Aufgaben gehören dazu.</p><Button onClick={onNext}>Mit neuen Zahlen selbst rechnen</Button></>:
      <div className="flex flex-wrap gap-2">{["3 · 4 = 12","3 · 12 = 36","4 · 3 = 12"].map((v,i)=><button type="button" key={v} className={chip} onClick={()=>{
        if(i!==1){setLinked(true);setHint("");}else setHint("Welche beiden Zahlen stehen für die Teller und für die Plättchen je Teller?");
      }}>{v}</button>)}</div>}
    {hint && <p role="status">{hint}</p>}
  </main>;
}
export function DivisionMeaning({task,status,onAnswer}:FormatProps<DivisionMeaningTask>) {
  const [entry,setEntry]=useState(""),[meaning,setMeaning]=useState("");
  const solved=status==="reveal"||status==="right";
  return <section className="grid gap-3"><p className="rounded-xl bg-white p-3 font-display text-xl">{task.total} : {task.divisor} = ?</p>
    {solved?<p>{task.solution}</p>:<>
      <MeaningFields entry={entry} meaning={meaning} setEntry={setEntry} setMeaning={setMeaning} disabled={status!=="ask"}/>
      <Button disabled={status!=="ask" || !entry || !meaning} onClick={()=>{const hint=divisionHint(task,entry,meaning);onAnswer(!hint,hint??undefined);}}>Ergebnis prüfen</Button></>}
  </section>;
}
