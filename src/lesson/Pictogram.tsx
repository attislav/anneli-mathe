import { useState } from "react";
import { diagramVotes, neededVotes, pictureHint, tieQuestion, votesLabel } from "@/game/pictogram";
import type { PictogramTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

function Dot({half=false}: {half?:boolean}) {
  return <svg aria-hidden="true" className="h-7 w-7 shrink-0 text-grape" viewBox="0 0 24 24">{half ?
    <path d="M12 2a10 10 0 0 0 0 20Z" fill="currentColor"/> : <circle cx="12" cy="12" r="10" fill="currentColor"/>}</svg>;
}
export function PictureRow({name,halves}: {name:string;halves:number}) {
  const full=Math.floor(halves/2);
  return <div className="rounded-xl bg-white p-2"><h3 className="font-bold">{name}</h3>
    <div className="flex min-h-8 flex-wrap items-center gap-1" role="img" aria-label={`${full===1?"Ein ganzer Kreis":full+" ganze Kreise"}${halves%2?" und ein halber Kreis":""}`}>
      {Array.from({length:full},(_,i)=><Dot key={i}/>)}{halves%2!==0 && <Dot half/>}{halves===0 && <span aria-hidden="true">Keine Kreise</span>}
    </div></div>;
}
export function Pictogram({task,status,onAnswer}:FormatProps<PictogramTask>) {
  const [read,setRead]=useState(""), [built,setBuilt]=useState(0), [compare,setCompare]=useState(false), [answer,setAnswer]=useState("");
  const solved=status==="right"||status==="reveal", locked=status!=="ask", needed=neededVotes(task);
  const chip="min-h-11 rounded-lg border-2 bg-white px-2 ";
  const input=(label:string,value:string,set:(v:string)=>void)=><label>{label} <input value={value} disabled={locked} inputMode="numeric"
    className={chip+"w-16"} onChange={e=>{if(/^\d{0,2}$/.test(e.target.value))set(e.target.value);}}/></label>;
  function check(){
    if(locked)return;
    if(!compare){
      const hint=pictureHint(task,read,built);
      if(hint)onAnswer(false,hint);else setCompare(true);
    }else{
      const valid=/^\d+$/.test(answer)&&Number(answer)===needed.votes;
      onAnswer(valid,valid?undefined:"Lass die andere Reihe unverändert. Zähle von der kleineren Stimmenzahl bis zur größeren weiter.");
    }
  }
  return <section className="grid gap-3"><h2 className="font-display text-xl">{task.title}</h2>
    <div className="rounded-xl bg-sky-light p-2"><strong>Legende</strong>
      <p className="flex items-center gap-1"><Dot/> Ein ganzer Kreis bedeutet {votesLabel(task.keyValue)}.</p>
      {task.level>1 && <p className="flex items-center gap-1"><Dot half/> Ein halber Kreis bedeutet {votesLabel(task.keyValue/2)}.</p>}</div>
    <PictureRow name={task.names[0]} halves={task.first}/>
    {!compare&&!solved && input(`Wie viele Stimmen hat „${task.names[0]}“?`,read,setRead)}
    <PictureRow name={task.names[1]} halves={solved?task.second:built}/>
    {!solved && !compare && <>
      <p>Lege für „{task.names[1]}“ genau {votesLabel(diagramVotes(task.second,task.keyValue))}.</p>
      <fieldset disabled={locked} className="flex flex-wrap gap-1"><legend>Kreise legen oder wegnehmen</legend>
        {(task.level===1?[2,-2]:[2,1,-1,-2]).map(step=><button type="button" key={step} className={chip} disabled={built+step<0||built+step>14}
          onClick={()=>setBuilt(n=>Math.max(0,Math.min(14,n+step)))}>{step>0?"+":"−"} {Math.abs(step)===2?"ganzer Kreis":"halber Kreis"}</button>)}</fieldset>
    </>}
    {solved?<p className="rounded-xl bg-leaf-light p-3">{task.solution}</p>:compare && <>
      <p>Die andere Reihe bleibt unverändert.</p>
      {input(tieQuestion(needed.name),answer,setAnswer)}
      <button type="button" className="min-h-11 underline" disabled={locked} onClick={()=>{setCompare(false);setAnswer("");}}>Diagramm ändern</button>
    </>}
    {!solved && <Button disabled={locked||(compare?answer==="":read==="")} onClick={check}>{compare?"Antwort prüfen":"Diagramm prüfen"}</Button>}
  </section>;
}
