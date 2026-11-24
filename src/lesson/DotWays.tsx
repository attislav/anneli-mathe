import { useState } from "react";
import { countHint, partHint, relocateDot } from "@/game/dotWays";
import type { DotWaysTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

type Picture={dots:number[];marked:number[]};
export function DotField({cols,picture,choose,moving=false,compact=false}:{cols:number;picture:Picture;choose?:(n:number)=>void;moving?:boolean;compact?:boolean}){
  return <div role="group" aria-label="Punktefeld" className="grid w-full max-w-md gap-y-1 rounded-xl border-2 bg-white p-1" style={{gridTemplateColumns:"repeat("+cols+", minmax(0,1fr))"}}>
    {Array.from({length:2*cols},(_,n)=>{
      const filled=picture.dots.includes(n),mark=picture.marked.includes(n),col=n%cols;
      const label="Reihe "+(Math.floor(n/cols)+1)+", Platz "+(col+1)+": "+(mark?"markierter Punkt":filled?"Punkt":"leer");
      const cls="grid place-items-center "+(compact?"min-h-6 ":"min-h-10 ")+(cols===10&&col===5?"border-l-2 border-ink/50 pl-1":"");
      const dot=<span aria-hidden="true" className={(compact?"size-3 text-[9px]":"size-5 text-sm")+" grid place-items-center rounded-full border leading-none "+(mark?"bg-grape text-white":filled?"bg-ink":"border-dashed border-ink/40")}>{mark?"✓":""}</span>;
      return choose&&(filled||moving)?<button key={n} type="button" aria-label={label} aria-pressed={mark} className={cls} onClick={()=>choose(n)}>{dot}</button>:
        <span key={n} role="img" aria-label={label} className={cls}>{dot}</span>;
    })}</div>;
}
export function DotResult({task,first,second}:{task:DotWaysTask;first:Picture;second:Picture}){
  const total=task.dots.length;
  const firstOwn=partHint(first.dots,first.marked)===null;
  const a=firstOwn?first.marked:first.dots.slice(0,1);
  const secondOwn=partHint(second.dots,second.marked,a.length)===null;
  const b=secondOwn?second.marked:second.dots.slice(0,a.length===1||a.length===total-1?2:1);
  return <div className="grid grid-cols-2 gap-2">{[a,b].map((selected,i)=><section key={i}><h3 className="font-bold">{(i===0?firstOwn:secondOwn)?"Dein Weg":"Ein Beispiel"} {i+1}</h3>
    <DotField compact cols={task.cols} picture={{dots:i===0?first.dots:second.dots,marked:selected}}/>
    <p>{selected.length} + {total-selected.length} = {total}</p></section>)}</div>;
}
export function DotWays({task,status,onAnswer}:FormatProps<DotWaysTask>){
  const [phase,setPhase]=useState<"estimate"|"first"|"arrange"|"second">("estimate");
  const [estimate,setEstimate]=useState(""),[first,setFirst]=useState<number[]>([]),[second,setSecond]=useState<number[]>([]);
  const [dots,setDots]=useState(()=>[...task.dots]),[source,setSource]=useState<number|null>(null);
  const [rest,setRest]=useState(""),[total,setTotal]=useState("");
  const locked=status!=="ask",initial={dots:task.dots,marked:first},other={dots,marked:second};
  if(status==="right"||status==="reveal")return <section className="grid gap-2"><DotResult task={task} first={initial} second={other}/>
    {estimate!==""&&<p>Deine erste Schätzung: {estimate} Punkte.</p>}</section>;
  if(phase==="estimate")return <section className="grid gap-2"><DotField cols={task.cols} picture={initial}/>
    <label>Wie viele Punkte schätzt du? <input disabled={locked} inputMode="numeric" placeholder="freiwillig" className="w-24 rounded border p-1" value={estimate} onChange={e=>setEstimate(e.target.value)}/></label>
    <Button disabled={locked||(estimate!==""&&!/^\d+$/.test(estimate))} onClick={()=>setPhase("first")}>{estimate===""?"Ohne Schätzung starten":"Schätzung festhalten"}</Button></section>;
  if(phase==="arrange")return <section className="grid gap-2"><h3 className="font-bold">Dein zweites Punktebild</h3><p>Alle Punkte liegen wie zuvor. Du kannst sie dort lassen oder umlegen. Wähle zum Umlegen einen Punkt und dann einen leeren Platz.</p>
    <DotField cols={task.cols} moving picture={{dots,marked:source===null?[]:[source]}} choose={locked?undefined:n=>{
      if(dots.includes(n))setSource(n===source?null:n);else if(source!==null){setDots(relocateDot(dots,source,n,task.cols));setSource(null);}
    }}/><Button disabled={locked} onClick={()=>{setSource(null);setPhase("second");}}>Bild übernehmen</Button></section>;
  const isFirst=phase==="first",pic=isFirst?initial:other,set=isFirst?setFirst:setSecond;
  function check(){
    const hint=partHint(pic.dots,pic.marked,isFirst?undefined:first.length)??countHint(pic.dots,pic.marked,Number(rest),Number(total));
    if(hint){onAnswer(false,hint);return;}
    if(isFirst){setRest("");setTotal("");setPhase("arrange");}else onAnswer(true);
  }
  return <section className="grid gap-2"><h3 className="font-bold">{isFirst?"Dein erster Weg":"Finde zwei andere Gruppengrößen"}</h3>
    {!isFirst&&<p>Vorher: {first.length} + {task.dots.length-first.length}.</p>}
    <p>Markiere eine Gruppe mit Häkchen. Tippe erneut, um einen Punkt aus der Gruppe zu nehmen.</p>
    <DotField cols={task.cols} picture={pic} choose={locked?undefined:n=>{set(pic.marked.includes(n)?pic.marked.filter(k=>k!==n):[...pic.marked,n]);setRest("");}}/>
    <label>Punkte ohne Häkchen <input aria-label="Punkte ohne Häkchen" inputMode="numeric" disabled={locked} className="w-16 rounded border p-1" value={rest} onChange={e=>setRest(e.target.value)}/></label>
    <label>Punkte insgesamt <input aria-label="Punkte insgesamt" inputMode="numeric" disabled={locked} className="w-16 rounded border p-1" value={total} onChange={e=>setTotal(e.target.value)}/></label>
    <Button disabled={locked||!/^\d+$/.test(rest)||!/^\d+$/.test(total)} onClick={check}>{isFirst?"Erste Zerlegung prüfen":"Zweite Zerlegung prüfen"}</Button></section>;
}
