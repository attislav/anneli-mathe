import {useState} from "react";
import {comparisonHint,comparisonText,inverseOptions,largeName,missingValue,models,type Comparison} from "@/game/comparisonClinic";
import type {ComparisonTask} from "@/game/types";
import {Button} from "@/ui/Button";
import type {FormatProps} from "./formats";

function Rows({c,large,marks,locked,toggle}:{c:Comparison;large:string;marks:number[];locked:boolean;toggle?:(n:number)=>void}){
  return <div className="grid gap-2 rounded-xl bg-sky-light p-3">
    <p>Reihenbild: Der blaue Streifen steht bei beiden für gleich viele Sticker.</p>
    {[true,false].map(long=><div key={String(long)} className="grid gap-1">
      <b>{(long?large:large&&c.names.find(name=>name!==large))||"Name offen"} · {long?"längere":"kürzere"} Reihe</b>
      <div className="grid grid-cols-[4rem_repeat(6,minmax(0,1fr))] items-center gap-0.5"><span className="rounded bg-sky px-1 py-1 text-center text-sm">gleich viele</span>
        {long&&Array.from({length:6},(_,i)=><button key={i} type="button" disabled={locked} aria-pressed={marks.includes(i)}
          aria-label={"Zusätzlicher Sticker "+(i+1)} onClick={()=>toggle?.(i)}
          className={"min-h-11 rounded border "+(marks.includes(i)?"bg-sun-light font-bold":"bg-white")}>{marks.includes(i)?"●":"○"}</button>)}</div></div>)}
  </div>;
}
function ComparisonWork({c,status,onAnswer,model=false}:{c:Comparison;status:FormatProps<ComparisonTask>["status"];onAnswer:(correct:boolean,hint?:string)=>void;model?:boolean}){
  const [large,setLarge]=useState(""),[marks,setMarks]=useState<number[]>([]),[value,setValue]=useState(""),[inverse,setInverse]=useState(-1);
  const locked=status!=="ask",finished=status==="right"||status==="reveal";
  const shownMarks=finished?Array.from({length:c.gap},(_,i)=>i):marks;
  return <section className="grid gap-3">{!finished&&<fieldset><legend>Wer gehört an die längere Reihe?</legend>
    {c.names.map(name=><button type="button" key={name} disabled={locked} aria-pressed={large===name} onClick={()=>setLarge(name)}
      className={"mr-2 min-h-11 rounded-xl border px-3 "+(large===name?"bg-grape-light":"bg-white")}>{name}</button>)}</fieldset>}
    {!finished&&<p>Markiere am Ende der längeren Reihe für jeden zusätzlichen Sticker ein Kästchen. Beginne direkt am blauen Streifen.</p>}
    <Rows c={c} large={finished?largeName(c):large} marks={shownMarks} locked={locked} toggle={i=>setMarks(marks.includes(i)?marks.filter(n=>n!==i):[...marks,i])}/>
    {finished?<p>{c.names[c.knownFirst?1:0]} hat {missingValue(c)} Sticker. {inverseOptions(c)[0]}
      {" "}{c.small} + {c.gap} = {c.small+c.gap}. {c.small+c.gap} − {c.gap} = {c.small}.</p>:
    <><label>Wie viele Sticker hat {c.names[c.knownFirst?1:0]}? <input className="w-16 rounded border p-2" inputMode="numeric" disabled={locked}
      value={value} onChange={event=>setValue(event.target.value)}/></label>
      {!model&&<fieldset><legend>Welcher Satz sagt es vom anderen Kind aus?</legend>{c.optionOrder.map(index=><label key={index} className="flex min-h-11 items-center gap-2">
        <input type="radio" name="inverse-story" checked={inverse===index} disabled={locked} onChange={()=>setInverse(index)}/>{inverseOptions(c)[index]}</label>)}</fieldset>}
      <Button disabled={locked||!large||!value||(!model&&inverse<0)} onClick={()=>{
        const hint=comparisonHint(c,large,marks,value,inverse,model);
        onAnswer(hint===null,hint??undefined);
      }}>{model?"Am Beispiel prüfen":"Antwort und Satz prüfen"}</Button></>}
  </section>;
}
export function ComparisonStory({task,status,onAnswer}:FormatProps<ComparisonTask>){
  return <ComparisonWork c={task} status={status} onAnswer={onAnswer}/>;
}
export function ComparisonModel({back,next}:{back:()=>void;next:(model:Comparison)=>void}){
  const [index,setIndex]=useState(0),[done,setDone]=useState(false),[hint,setHint]=useState("");
  const c=models[index];
  return <main className="mx-auto grid min-h-dvh max-w-xl content-start gap-3 bg-mist p-5">
    <button type="button" onClick={back} className="min-h-11 justify-self-start underline">← Zur Sprechstunde</button>
    <h1 className="font-display text-3xl">Mehr als, weniger als – wer hat wie viele?</h1>
    <p>{index===0?"Lea hat 14 Sticker. Das sind vier mehr als bei Tom. Wie viele Sticker hat Tom?":comparisonText(c)}</p>
    <ComparisonWork key={index} c={c} model status={done?"right":"ask"} onAnswer={(ok,message)=>{setDone(ok);setHint(message??"");}}/>
    <p role="status">{hint}</p>{done&&<Button onClick={()=>next(c)}>Jetzt selbst vergleichen</Button>}
    <button type="button" className="min-h-11 underline" onClick={()=>{setIndex(1-index);setDone(false);setHint("");}}>Anderes Beispiel untersuchen</button>
  </main>;
}
