import {useState} from "react";
import {cornerKind,cornerName,cornerSetFits,paperPolygon,paperView,rightCorners,type CornerKind,type Point} from "@/game/foldCorner";
import type {CornerTask} from "@/game/types";
import {Button} from "@/ui/Button";
import type {FormatProps} from "./formats";

const labels={right:"passt genau",wide:"weiter",narrow:"weniger weit"};
const observation={right:"Die zweite Papierkante liegt auf der zweiten Seite der Figur.",
  wide:"Die zweite Papierkante liegt noch in der blauen Innenfläche. Die Figur reicht über die Papierecke hinaus.",
  narrow:"Die zweite Papierkante ragt aus der blauen Innenfläche heraus. Die Figur endet schon davor."};
type Side="previous"|"next";
export function CornerPicture({points,vertex,side,marks}:{points:Point[];vertex:number|null;side:Side|null;marks:number[]}){
  const x=points.map(p=>p[0]),y=points.map(p=>p[1]);
  const cx=(Math.min(...x)+Math.max(...x))/2,cy=(Math.min(...y)+Math.max(...y))/2;
  const {left,top,span}=paperView(points);
  const unit=span/100;
  const paper=vertex!==null&&side?paperPolygon(points,vertex,side).map(p=>p.join(",")).join(" "):"";
  return <svg viewBox={[left,top,span,span].join(" ")} role="img" aria-label={"Blaue Innenfläche. Die Ecken heißen "+points.map((_,i)=>cornerName(i)).join(", ")+
    (vertex!==null&&side?". Falt-Ecke an "+cornerName(vertex)+". "+observation[cornerKind(points,vertex)]:"")+
    (marks.length?". Markiert: "+marks.map(cornerName).join(", "):"")} className="mx-auto w-full max-w-80 rounded-xl bg-white">
    <polygon points={points.map(p=>p.join(",")).join(" ")} fill="#bddff5" stroke="#294269" strokeWidth={unit}/>
    {paper&&<polygon points={paper} fill="#ffda69" fillOpacity=".58" stroke="#864e00" strokeDasharray={unit*2+" "+unit} strokeWidth={unit}/>}
    {points.map(([x,y],i)=>{
      const dx=x-cx,dy=y-cy,r=Math.hypot(dx,dy)||1;
      return <g key={i}><circle cx={x} cy={y} r={unit*(vertex===i?1.8:1.15)} fill={marks.includes(i)?"#16614b":"#294269"}/>
        <text x={x+dx/r*unit*4.5} y={y+dy/r*unit*4.5} dominantBaseline="central" textAnchor="middle" fontSize={unit*4.6}
          fontWeight="bold">{cornerName(i)}{marks.includes(i)?" ✓":""}</text></g>;
    })}</svg>;
}
export function FoldCorner({task,status,onAnswer}:FormatProps<CornerTask>){
  const [transfer,setTransfer]=useState(false),[vertex,setVertex]=useState<number|null>(null),[side,setSide]=useState<Side|null>(null);
  const [answer,setAnswer]=useState<CornerKind|null>(null),[marks,setMarks]=useState<number[]>([]),[none,setNone]=useState(false);
  const locked=status!=="ask",finished=status==="reveal"||status==="right";
  const points=transfer||finished?task.second:task.first;
  const shown=finished?rightCorners(points):marks;
  const next=(step:number)=>vertex===null?"":cornerName((vertex+step+points.length)%points.length);
  return <section className="grid gap-3">
    {finished&&!transfer&&<><strong>Papierprobe an der ersten Figur</strong><CornerPicture points={task.first} vertex={vertex??0} side={side??"next"} marks={[]}/>
      <p>Ecke {cornerName(vertex??0)}: {labels[cornerKind(task.first,vertex??0)]}. {observation[cornerKind(task.first,vertex??0)]}</p></>}
    <p>{finished?"Rechte Ecken der zweiten Figur":transfer?"Neue Figur: Markiere alle Ecken, in die deine Falt-Ecke genau passt. Du kannst jede Ecke prüfen.":"Wähle eine Ecke der blauen Figur. Lege deine quadratische Papierecke mit einer Kante an."}</p>
    <CornerPicture points={points} vertex={finished?null:vertex} side={finished?null:side} marks={shown}/>
    {finished?<p>{shown.length?"Hier passt die Falt-Ecke genau: "+shown.map(cornerName).join(", ")+".":"Hier passt die Falt-Ecke an keiner Ecke genau."}</p>:<>
      <fieldset><legend>Ecke für die Papierprobe</legend>{points.map((_,i)=><button type="button" disabled={locked} aria-pressed={vertex===i}
        className={"mr-1 min-h-11 min-w-11 rounded-lg border "+(vertex===i?"bg-sky-light":"bg-white")} key={i}
        onClick={()=>{setVertex(i);setSide(null);setAnswer(null);}}>{cornerName(i)}</button>)}</fieldset>
      {vertex!==null&&<fieldset><legend>In welche Richtung legst du die Papierkante?</legend>{(["previous","next"] as const).map(s=>
        <button type="button" disabled={locked} aria-pressed={side===s} key={s} className={"mr-1 min-h-11 rounded-lg border px-2 "+(side===s?"bg-sun-light":"bg-white")}
          onClick={()=>setSide(s)}>Von {cornerName(vertex)} nach {next(s==="next"?1:-1)}</button>)}</fieldset>}
      {vertex!==null&&side&&<details><summary className="min-h-10 cursor-pointer">Papierprobe in Worten</summary>{observation[cornerKind(points,vertex)]}</details>}
      {!transfer&&vertex!==null&&side&&<><fieldset><legend>Vergleiche die Öffnung der Figur mit der Papierecke.</legend>
        {(Object.keys(labels) as CornerKind[]).map(k=><button type="button" disabled={locked} key={k} aria-pressed={answer===k}
          className={"mr-1 rounded-lg border px-2 py-2 "+(answer===k?"bg-grape-light":"bg-white")} onClick={()=>setAnswer(k)}>{labels[k]}</button>)}</fieldset>
        <Button disabled={locked||!answer} onClick={()=>{
          if(answer!==cornerKind(points,vertex)){onAnswer(false,"Schau am zweiten Papierrand: Wo endet die blaue Innenfläche?");return;}
          setTransfer(true);setSide(null);setVertex(null);setAnswer(null);
        }}>Ecke prüfen</Button></>}
      {transfer&&<><fieldset><legend>Hier passt die Falt-Ecke genau</legend>{points.map((_,i)=><label key={i} className="mr-2 inline-flex min-h-11 items-center gap-1">
        <input type="checkbox" disabled={locked} checked={marks.includes(i)} onChange={()=>{setNone(false);setMarks(marks.includes(i)?marks.filter(m=>m!==i):[...marks,i]);}}/>{cornerName(i)}</label>)}
        <label className="inline-flex min-h-11 items-center gap-1"><input type="checkbox" disabled={locked} checked={none} onChange={()=>{setNone(!none);setMarks([]);}}/>Keine Ecke</label></fieldset>
        <Button disabled={locked||(!none&&!marks.length)} onClick={()=>onAnswer(cornerSetFits(points,marks),"Prüfe jede Ecke einzeln. An einer rechten Ecke liegen beide Papierkanten auf den Seiten der Figur.")}>Markierungen prüfen</Button></>}
    </>}
  </section>;
}
