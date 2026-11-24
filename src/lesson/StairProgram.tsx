import { useState } from "react";
import { arrows, buildingBlocks, directionWords, moveSquare, nextGoal, runStep, sameSquare, squareName, walk, type Direction, type Square } from "@/game/stairProgram";
import type { StairTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

function Grid({task,completed,wrong,extension,mark,choose}:{task:StairTask;completed:number;wrong?:Direction;extension?:Direction[];mark?:Square|null;choose?:(p:Square)=>void}){
  const spacing=27,margin=19,position=(value:number)=>value*spacing+margin;
  const points=walk(task.start,task.target),cursor=points[Math.min(completed,task.target.length)];
  const polyline=(route:Square[])=>route.map(p=>position(p.x)+","+position(p.y)).join(" ");
  const actual=wrong?moveSquare(cursor,wrong):null;
  return <section className="grid gap-1"><svg viewBox={"0 0 "+(position(task.cols-1)+margin)+" "+(position(task.rows-1)+margin)}
    role="img" aria-label={"Treppenlinie ab "+squareName(task.start)+": "+points.slice(1).map(squareName).join(", ")+". Dein Weg ist bei "+squareName(cursor)+"."}
    className="mx-auto max-h-72 w-full rounded-xl bg-white">
    {Array.from({length:task.cols},(_,x)=><g key={x}><line x1={position(x)} y1={position(0)} x2={position(x)} y2={position(task.rows-1)} stroke="#ccc4d1"/>
      <text x={position(x)} y="12" textAnchor="middle" fontSize="10">{String.fromCharCode(65+x)}</text></g>)}
    {Array.from({length:task.rows},(_,y)=><g key={y}><line x1={position(0)} y1={position(y)} x2={position(task.cols-1)} y2={position(y)} stroke="#ccc4d1"/>
      <text x="5" y={position(y)+3} fontSize="10">{y+1}</text></g>)}
    <polyline points={polyline(points)} fill="none" stroke="#774489" strokeWidth="6" strokeLinejoin="round"/>
    <polyline points={polyline(points.slice(0,completed+1))} fill="none" stroke="#ffd34c" strokeWidth="3"/>
    {extension&&<polyline points={polyline(walk(points.at(-1)!,extension))} stroke="#197466" strokeWidth="4" fill="none" strokeDasharray="5 2"/>}
    {actual&&<line x1={position(cursor.x)} y1={position(cursor.y)} x2={position(actual.x)} y2={position(actual.y)} stroke="#be3030" strokeWidth="3" strokeDasharray="4 2"/>}
    <circle cx={position(task.start.x)} cy={position(task.start.y)} r="5" fill="#fff" stroke="#32283c"/>
    <circle cx={position(cursor.x)} cy={position(cursor.y)} r="4" fill="#32283c"/>
    {mark&&<circle cx={position(mark.x)} cy={position(mark.y)} r="7" fill="none" stroke="#197466" strokeWidth="3"/>}
    {choose&&Array.from({length:task.rows*task.cols},(_,i)=>{const p={x:i%task.cols,y:Math.floor(i/task.cols)};return <rect key={i}
      x={position(p.x)-spacing/2} y={position(p.y)-spacing/2} width={spacing} height={spacing} fill="transparent" onClick={()=>choose(p)}/>;})}
    </svg><details><summary className="cursor-pointer py-1">Treppenlinie als Punktfolge lesen</summary>{points.map(squareName).join(" → ")}</details></section>;
}
export function StairProgram({task,status,onAnswer}:FormatProps<StairTask>){
  const [block,setBlock]=useState<Direction[]>([]),[repeats,setRepeats]=useState("2"),[slot,setSlot]=useState<number|null>(null);
  const [phase,setPhase]=useState<"edit"|"run"|"error"|"predict">("edit"),[completed,setCompleted]=useState(0);
  const [column,setColumn]=useState(""),[row,setRow]=useState("");
  const solved=status==="right"||status==="reveal",locked=status!=="ask",count=Number(repeats);
  const step=runStep(task.target,block,count,completed),next=block[completed%block.length];
  const selected=column!==""&&row!==""?{x:Number(column),y:Number(row)}:null;
  const own=phase==="predict",shownBlock=own?block:buildingBlocks(task.target)[0];
  function advance(){
    if(step!=="match"){setPhase("error");return;}
    const done=completed+1;
    setCompleted(done);
    const following=runStep(task.target,block,count,done);
    if(following==="done")setPhase("predict");
    else if(following==="short"||following==="extra")setPhase("error");
  }
  function change(){
    setSlot(phase==="error"&&step==="wrong"?completed%block.length:null);setPhase("edit");setCompleted(0);
  }
  const goal=nextGoal(task.start,task.target,shownBlock);
  const chosenRepeat=own?count:task.target.length/shownBlock.length;
  if(solved)return <section className="grid gap-2"><p>{own?"Dein Programm":"Ein Beispielprogramm"}: {shownBlock.map(d=>arrows[d]).join(" ")} · {chosenRepeat} Wiederholungen.</p>
    <Grid task={task} completed={task.target.length} extension={shownBlock} mark={goal}/><p>Nach einem weiteren Durchlauf endet die Treppe bei {squareName(goal)}.</p></section>;
  return <section className="grid gap-2"><p>Starte bei {squareName(task.start)}. Fahre die dicke Treppenlinie Kante für Kante nach. Die Pfeile zeigen immer in dieselbe Richtung auf dem Blatt.</p>
    <Grid task={task} completed={completed} wrong={phase==="error"&&step==="wrong"?next:undefined} mark={selected} choose={phase==="predict"&&!locked?p=>{setColumn(String(p.x));setRow(String(p.y));}:undefined}/>
    {phase==="edit"?<><p>Baue eine Pfeilfolge, die sich mindestens zweimal wiederholt. Tippe auf einen gelegten Pfeil zum Ersetzen.</p>
      <div className="flex flex-wrap gap-1">{block.map((direction,i)=><button key={i} type="button" className="min-h-11 min-w-11 rounded border" aria-label={"Befehl "+(i+1)+": "+directionWords[direction]+" ändern"} aria-pressed={slot===i}
        onClick={()=>setSlot(slot===i?null:i)}>{arrows[direction]}</button>)}</div>
      <p>{slot===null?"Nächsten Pfeil anhängen":"Befehl "+(slot+1)+" ersetzen"}</p>
      <div className="flex flex-wrap gap-1">{(Object.keys(arrows) as Direction[]).map(direction=><button type="button" key={direction}
        disabled={locked||(slot===null&&block.length>=Math.floor(task.target.length/2))} className="min-h-11 rounded-xl bg-sky-light px-2"
        onClick={()=>{setBlock(slot===null?[...block,direction]:block.map((previous,i)=>i===slot?direction:previous));setSlot(null);}}>{arrows[direction]} {directionWords[direction]}</button>)}</div>
      <button type="button" className="min-h-11 justify-self-start underline" disabled={!block.length||locked} onClick={()=>{setBlock(block.filter((_,i)=>i!==(slot??block.length-1)));setSlot(null);}}>Pfeil entfernen</button>
      <label>Wiederholungen <input aria-label="Wiederholungen" className="w-16 rounded border p-1" inputMode="numeric" value={repeats} onChange={e=>setRepeats(e.target.value)}/></label>
      <Button disabled={locked||!block.length||!/^\d+$/.test(repeats)||count<2||count>task.target.length} onClick={()=>{setSlot(null);setPhase("run");}}>Programm starten</Button></>:
      <><p>Dein Baustein: {block.map(d=>arrows[d]).join(" ")} · {count} Wiederholungen.</p>
      {phase==="run"?<><p aria-live="polite">{completed} Kanten geprüft. Als Nächstes: Durchlauf {Math.floor(completed/block.length)+1}, Befehl {completed%block.length+1}.</p>
        <Button onClick={advance}>Nächsten Schritt prüfen</Button><button className="min-h-11 underline" onClick={change}>Programm umarbeiten</button></>:
      phase==="error"?<><p role="status">{step==="short"?"Dein Programm ist zu Ende, aber die Treppe geht weiter.":step==="extra"?"Die Treppe ist zu Ende, aber dein Programm läuft weiter.":
        "Erste Abweichung bei Kante "+(completed+1)+": Befehl "+(completed%block.length+1)+" zeigt nach "+directionWords[next]+". Die gestrichelte Linie zeigt deinen Versuch."}</p>
        <Button onClick={change}>Programm umarbeiten</Button></>:
      <><p>Dein Programm passt! Wo landest du, wenn du deinen Baustein vom bisherigen Endpunkt noch einmal ausführst? Tippe den Punkt an oder wähle Spalte und Zeile.</p>
        <div className="flex gap-2">{(["Spalte","Zeile"] as const).map((label,i)=><label key={label}>{label} <select disabled={locked} value={i===0?column:row} onChange={e=>(i===0?setColumn:setRow)(e.target.value)}>
          <option value="">wählen</option>{Array.from({length:i===0?task.cols:task.rows},(_,n)=><option value={n} key={n}>{i===0?String.fromCharCode(65+n):n+1}</option>)}</select></label>)}</div>
        <Button disabled={locked||!selected} onClick={()=>{if(selected){const correct=sameSquare(selected,goal);onAnswer(correct,correct?undefined:"Beginne am Ende der dicken Linie. Gehe jeden Pfeil deines eigenen Bausteins genau einmal weiter.");}}}>Neues Ziel prüfen</Button></>}
      </>}
  </section>;
}
