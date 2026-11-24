import { useState } from "react";
import { missingIndex, repeatBand, ribbonHint, signs, smallestUnit } from "@/game/patternRibbon";
import type { RibbonTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

function Choices({palette,select,pressed,disabled}:{palette:number[];select:(n:number)=>void;pressed?:number|null;disabled:boolean}){
  return <div className="flex flex-wrap gap-2">{palette.map(n=><button key={n} type="button" disabled={disabled} aria-pressed={pressed===undefined?undefined:pressed===n}
    className={"min-h-11 rounded-xl border-2 p-2 "+(pressed===n?"bg-grape-light":"bg-white")} onClick={()=>select(n)}><span aria-hidden="true">{signs[n][0]}</span> {signs[n][1]}</button>)}</div>;
}
export function RibbonBand({band,size=0,hidden=-1}:{band:number[];size?:number;hidden?:number}){
  return <ol aria-label="Musterband von links nach rechts" className="flex flex-wrap gap-y-1 rounded-xl bg-sun-light p-2">{band.map((n,i)=>
    <li key={i} aria-label={(i+1)+". "+(size>0&&i%size===0?"Baustein beginnt, ":"")+(hidden===i?"verdecktes Zeichen":signs[n][1])}
      className={"grid min-h-9 w-8 place-items-center text-xl "+(size>0&&i%size===0?"border-l-2 border-ink":"")}>
      <span aria-hidden="true">{hidden===i?"?":signs[n][0]}</span></li>)}</ol>;
}
export function RibbonSolution({task,own}:{task:RibbonTask;own:number[]}){
  const designed=own.length>=task.min,unit=designed?own:task.palette.slice(0,task.min);
  const piece=smallestUnit(unit),band=repeatBand(unit),index=missingIndex(unit,task.offset);
  return <section className="grid gap-2"><h3 className="font-bold">{designed?"Dein Musterband":"Ein Beispielband"}</h3>
    <RibbonBand band={band} size={piece.length}/><p>Kürzester Baustein: {piece.map(n=>signs[n][1]).join(" · ")}. Er passt {band.length/piece.length} Mal.</p>
    <p>An Stelle {index+1} gehört das Zeichen {signs[band[index]][1]}.</p></section>;
}
export function PatternRibbon({task,status,onAnswer}:FormatProps<RibbonTask>){
  const [unit,setUnit]=useState<number[]>([]),[phase,setPhase]=useState<"build"|"group"|"find">("build");
  const [size,setSize]=useState<number|null>(null),[copies,setCopies]=useState(""),[answer,setAnswer]=useState<number|null>(null);
  if(status==="reveal"||status==="right")return <RibbonSolution task={task} own={unit}/>;
  const locked=status!=="ask",band=repeatBand(unit);
  if(phase==="build")return <section className="grid gap-3"><p>Lege {task.min===task.max?task.min:task.min+" bis "+task.max} Zeichen in eine Reihe. Du darfst ein Zeichen öfter nehmen.</p>
    <Choices palette={task.palette} select={n=>setUnit([...unit,n])} disabled={locked||unit.length===task.max}/>
    <p>Dein Baustein: {unit.length?unit.map(n=>signs[n][1]).join(" · "):"noch leer"}</p>
    <button type="button" disabled={locked||!unit.length} className="min-h-11 justify-self-start underline" onClick={()=>setUnit(unit.slice(0,-1))}>Letztes Zeichen zurücknehmen</button>
    <Button disabled={locked||unit.length<task.min} onClick={()=>setPhase("group")}>Band dreimal legen</Button></section>;
  if(phase==="group")return <section className="grid gap-3"><p>Dein Baustein liegt dreimal hintereinander. Wie viele Zeichen braucht der kürzeste Baustein?</p>
    <div className="flex gap-2">{unit.map((_,i)=><button key={i} type="button" disabled={locked} aria-pressed={size===i+1}
      className={"min-h-11 min-w-11 rounded-xl border-2 "+(size===i+1?"bg-grape-light":"bg-white")} onClick={()=>setSize(i+1)}>{i+1}</button>)}</div>
    <RibbonBand band={band} size={size??0}/>
    <label>Wie oft passt dein kurzer Baustein genau ins Band? <input aria-label="Anzahl der Bausteine" disabled={locked} inputMode="numeric" value={copies} onChange={e=>setCopies(e.target.value)} className="w-16 rounded border p-1"/></label>
    <Button disabled={locked||size===null||!/^\d+$/.test(copies)} onClick={()=>{if(size===null)return;const hint=ribbonHint(unit,size,Number(copies));if(hint)onAnswer(false,hint);else setPhase("find");}}>Einteilung prüfen</Button></section>;
  const index=missingIndex(unit,task.offset);
  return <section className="grid gap-3"><p>Beginne links und lies dein Band. Welches Zeichen fehlt an Stelle {index+1}?</p>
    <RibbonBand band={band} hidden={index} size={size??0}/><Choices palette={task.palette} select={setAnswer} pressed={answer} disabled={locked}/>
    <Button disabled={locked||answer===null} onClick={()=>{const ok=answer===band[index];onAnswer(ok,ok?undefined:"Vergleiche dieselbe Stelle im ersten Baustein.");}}>Zeichen prüfen</Button></section>;
}
