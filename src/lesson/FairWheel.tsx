import { useState } from "react";
import { fairnessHint, initialChoice, reasons, symbolNames, transferHint, type SymbolFace } from "@/game/fairWheel";
import type { FairWheelTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

const glyphs={star:"★",moon:"☾"};
const point=(angle:number,radius:number)=>[100+radius*Math.sin(angle),100-radius*Math.cos(angle)];
export function ChanceWheel({title,fields,change}:{title:string;fields:SymbolFace[];change?:(index:number)=>void}){
  return <figure className="grid justify-items-center gap-1"><figcaption className="font-bold">{title}</figcaption>
    <div role="group" aria-label={title} className="relative aspect-square w-full max-w-56">
      <svg viewBox="0 0 200 200" className="block h-full w-full" role={change?undefined:"img"} aria-hidden={change?true:undefined}
        aria-label={change?undefined:fields.map((face,i)=>"Feld "+(i+1)+": "+symbolNames[face]).join(". ")}>
        {fields.map((face,index)=>{
          const start=2*Math.PI*index/fields.length,end=2*Math.PI*(index+1)/fields.length;
          const [x,y]=point((start+end)/2,63);
          return <g key={index}><path d={"M100 100 L"+point(start,96).join(" ")+" A96 96 0 0 1 "+point(end,96).join(" ")+" Z"}
            stroke="#392d44" strokeWidth="1.5" fill={face==="star"?"#fff0b9":"#d9eaff"}/>
            <text x={x} y={y+6} textAnchor="middle" fontSize="25" fill="#322345">{glyphs[face]}</text>
            <text x={x} y={y+18} textAnchor="middle" fontSize="10" fill="#322345">{index+1}</text></g>;
        })}<circle cx="100" cy="100" r="4" fill="#392d44"/>
      </svg>{change&&fields.map((face,index)=>{
        const [x,y]=point(2*Math.PI*(index+.5)/fields.length,63);
        return <button type="button" key={index} aria-label={"Feld "+(index+1)+": "+symbolNames[face]+" wechseln"}
          style={{left:x/2+"%",top:y/2+"%"}} className="absolute size-11 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-4 focus-visible:outline-grape"
          onClick={()=>change(index)}/>;
      })}
    </div></figure>;
}
function Choices<T extends string>({options,selected,choose,locked}:{options:readonly (readonly [T,string])[];selected:T|null;choose:(value:T)=>void;locked:boolean}){
  return <div className="flex flex-wrap gap-2">{options.map(([value,label])=><button key={value} type="button" disabled={locked} aria-pressed={value===selected}
    className={"min-h-11 rounded-xl border-2 p-2 "+(value===selected?"bg-grape-light":"bg-white")} onClick={()=>choose(value)}>{label}</button>)}</div>;
}
export function FairWheel({task,status,onAnswer}:FormatProps<FairWheelTask>){
  const [phase,setPhase]=useState<"inspect"|"build"|"compare">("inspect");
  const [prediction,setPrediction]=useState<"star"|"moon"|"equal"|null>(null);
  const [fields,setFields]=useState<SymbolFace[]>(()=>[...task.initial]),[reason,setReason]=useState<number|null>(null);
  const [choice,setChoice]=useState<"first"|"second"|"equal"|null>(null),[a,setA]=useState(""),[b,setB]=useState("");
  const solved=status==="right"||status==="reveal",locked=status!=="ask";
  const own=phase!=="inspect"&&initialChoice(fields)==="equal";
  const example=task.initial.map((_,index):SymbolFace=>index<task.initial.length/2?"star":"moon");
  if(solved)return <section className="grid gap-2"><ChanceWheel title={own?"Dein faires Rad":"Ein mögliches faires Rad"} fields={own?fields:example}/>
    <div className="grid grid-cols-2 gap-2"><ChanceWheel title="Rad A" fields={task.first}/><ChanceWheel title="Rad B" fields={task.second}/></div><p>{task.solution}</p></section>;
  const numberField=(label:string,value:string,set:(value:string)=>void)=><label>{label} <input aria-label={label} inputMode="numeric" disabled={locked}
    className="w-14 rounded border p-1" value={value} onChange={e=>set(e.target.value)}/></label>;
  return <section className="grid gap-3"><p>Alle Felder sind gleich groß. Bei einem Dreh hat jedes Feld dieselbe Chance, getroffen zu werden.</p>
    {phase==="compare"?<><div className="grid grid-cols-2 gap-2"><ChanceWheel title="Rad A" fields={task.first}/><ChanceWheel title="Rad B" fields={task.second}/></div>
      <p>Auf welchem Rad hat der Stern die bessere Chance?</p><Choices selected={choice} choose={setChoice} locked={locked}
        options={[["first","Rad A"],["second","Rad B"],["equal","Beide gleich"]] as const}/>
      {numberField("Sternfelder auf Rad A",a,setA)}{numberField("Sternfelder auf Rad B",b,setB)}
      <Button disabled={locked||!choice||![a,b].every(value=>/^\d+$/.test(value))} onClick={()=>{if(choice){const hint=transferHint(task.first,task.second,Number(a),Number(b),choice);onAnswer(!hint,hint??undefined);}}}>Vergleich prüfen</Button></>:
      <><ChanceWheel title={phase==="inspect"?"Ausgangsrad":"Dein Rad"} fields={fields} change={phase==="build"&&!locked?index=>{
        setFields(fields.map((face,i)=>i!==index?face:face==="star"?"moon":"star"));
      }:undefined}/>
      {phase==="inspect"?<><p>Welches Zeichen hat hier die bessere Chance?</p>
        <Choices selected={prediction} choose={setPrediction} locked={locked} options={[["star","Stern"],["moon","Mond"],["equal","Beide gleich"]] as const}/>
        <Button disabled={locked||!prediction} onClick={()=>{if(prediction!==initialChoice(fields))onAnswer(false,"Vergleiche, wie viele Felder Stern und Mond zeigen.");else setPhase("build");}}>Ausgangsrad prüfen</Button></>:
        <><p>Gib Stern und Mond dieselbe Chance. Tippe auf ein Zeichen, um es zu wechseln. Ein faires Rad darf so bleiben.</p>
          <fieldset className="grid gap-1"><legend>Was macht dein Rad fair?</legend>{task.reasonOrder.map(index=><label key={index} className="flex min-h-11 items-center gap-2">
            <input name="wheel-reason" type="radio" disabled={locked} checked={reason===index} onChange={()=>setReason(index)}/>{reasons[index]}</label>)}</fieldset>
          <Button disabled={locked||reason===null} onClick={()=>{if(reason!==null){const hint=fairnessHint(fields,reason);if(hint)onAnswer(false,hint);else setPhase("compare");}}}>Mein Rad prüfen</Button></>}
      </>}
  </section>;
}
