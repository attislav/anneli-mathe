import { useState } from "react";
import { bedAnswer, bedArea, bedBetween, bedCells, measureBed, outlineIssue, possibleBeds, sizeKey, type Bed } from "@/game/equalFence";
import type { EqualFenceTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

function coordinate(cell:number, grid:number) {
  return String.fromCharCode(65+cell%grid) + (1+Math.floor(cell/grid));
}
function BedSummary({bed}:{bed:Bed}) {
  return <span className="inline-grid gap-1"><span>{bed.width} × {bed.height} · {bed.width*bed.height} Kästchen</span>
    <span aria-hidden className="grid w-fit border border-leaf-dark" style={{gridTemplateColumns:"repeat("+bed.width+", .7rem)"}}>
      {Array.from({length:bed.width*bed.height},(_,i)=><span key={i} className="h-3 border border-white bg-leaf-dark"/>)}</span></span>;
}
export function EqualFence({task,status,onAnswer}:FormatProps<EqualFenceTask>) {
  const grid=task.fence/2-1;
  const possibilities=possibleBeds(task.fence);
  const [found,setFound]=useState<Bed[]>([]);
  const [first,setFirst]=useState<number|null>(null),[last,setLast]=useState<number|null>(null);
  const [marks,setMarks]=useState<number[]>([]),[count,setCount]=useState("");
  const [choice,setChoice]=useState("");
  const finished=status==="right" || status==="reveal", locked=status!=="ask";
  const bed=first!==null&&last!==null?bedBetween(first,last,grid):null;
  const cells=bed?bedCells(bed,grid):[];
  const issue=bed?outlineIssue(bed,task.fence,found):null;
  const required=task.mode==="largest"?possibilities.length:2;
  const complete=found.length===required;
  const examples=[...found,...possibilities.filter(example=>!found.some(saved=>sizeKey(saved)===sizeKey(example)))].slice(0,required);
  const largest=possibilities.at(-1)!;
  function reset(){setFirst(null);setLast(null);setMarks([]);setCount("");}
  function touch(cell:number){
    if(first===null) setFirst(cell);
    else if(last===null) setLast(cell);
    else setMarks(marks.includes(cell)?marks.filter(mark=>mark!==cell):[...marks,cell]);
  }
  return <section className="grid gap-3"><p>Du hast <strong>{task.fence} Zaunstücke</strong>. {task.mode==="largest"?"Baue alle verschiedenen rechteckigen Beete.":"Baue zwei verschiedene rechteckige Beete."} Jede Kästchenseite braucht ein Stück.</p>
    {task.mode==="plants"&&<p>Du möchtest {task.plants} Pflanzen setzen. Jede Pflanze braucht ein Kästchen. Kästchen dürfen frei bleiben.</p>}
    {!finished && !complete && <>
      <p aria-live="polite">{first===null?"Tippe ein Eckkästchen an.":last===null?"Erste Ecke: "+coordinate(first,grid)+". Tippe das gegenüberliegende Eckkästchen an.":issue??"Markiere im Beet alle Innenkästchen. Tippe zum Korrigieren noch einmal."}</p>
      <div role="group" aria-label="Karopapier mit beschrifteten Feldern" className="mx-auto grid w-full max-w-80"
        style={{gridTemplateColumns:"repeat("+grid+", minmax(0,1fr))"}}>
        {Array.from({length:grid*grid},(_,cell)=>{
          const inside=cells.includes(cell), marked=marks.includes(cell);
          const x=cell%grid,y=Math.floor(cell/grid);
          return <button type="button" key={cell} disabled={locked || !!issue || (!!bed&&!inside)}
            aria-label={coordinate(cell,grid)+(inside?", im Beet":"")} aria-pressed={bed?marked:first===cell}
            className={"aspect-square border text-xs "+(marked?"bg-leaf-dark text-white":inside||first===cell?"bg-leaf-light":"bg-white")}
            style={inside&&bed?{borderLeftWidth:x===bed.left?3:1,borderRightWidth:x===bed.left+bed.width-1?3:1,
              borderTopWidth:y===bed.top?3:1,borderBottomWidth:y===bed.top+bed.height-1?3:1}:undefined}
            onClick={()=>touch(cell)}>{coordinate(cell,grid)}{marked?" ✓":""}</button>;
        })}
      </div>
      {first!==null&&<button type="button" disabled={locked} className="min-h-10 underline" onClick={reset}>Ecken neu setzen</button>}
      {bed&&!issue&&<><p>Dein Beet ist {bed.width} Kästchen breit und {bed.height} Kästchen lang.</p>
        <label>Wie viele Kästchen sind innen? <input value={count} disabled={locked} inputMode="numeric" className="w-16 rounded-lg border-2 p-2"
          onChange={event=>setCount(event.target.value)}/></label>
        <Button disabled={locked || !count} onClick={()=>{
          const issue=measureBed(bed,grid,task.fence,marks,count,found);
          if(issue) onAnswer(false,issue);
          else {setFound([...found,bed]);reset();}
        }}>Beet prüfen</Button></>}
    </>}
    {(found.length>0||finished)&&<div className="rounded-xl bg-white p-3"><strong>{finished&& !complete?(task.mode==="largest"?"Alle möglichen Beete":"Zwei mögliche Beete"):"Deine Beete"}</strong>
      <ul className="flex flex-wrap gap-4">{(finished?examples:found).map(example=><li key={sizeKey(example)}><BedSummary bed={example}/>
        {finished&&!found.includes(example)&&<small className="block">Beispiel</small>}</li>)}</ul></div>}
    {!finished&&found.length>0&&!complete&&<p>Welche andere Form kannst du mit denselben Zaunstücken bauen?</p>}
    {!finished&&complete&&<><p>{task.question}</p>
      {task.mode==="difference"?<label>Unterschied in Kästchen <input value={choice} inputMode="numeric" disabled={locked}
        className="w-16 rounded-lg border-2 p-2" onChange={event=>setChoice(event.target.value)}/></label>:
      <div className="flex flex-wrap gap-2">{found.map(example=><button type="button" disabled={locked} key={sizeKey(example)} aria-pressed={choice===sizeKey(example)}
        className={"rounded-xl border p-2 "+(choice===sizeKey(example)?"bg-sky-light":"bg-white")} onClick={()=>setChoice(sizeKey(example))}>
        {example.width} × {example.height}</button>)}
        {task.mode==="plants"&&<button type="button" disabled={locked} aria-pressed={choice==="none"} className={"rounded-xl border p-2 "+(choice==="none"?"bg-sky-light":"bg-white")}
          onClick={()=>setChoice("none")}>Keines meiner Beete</button>}</div>}
      <Button disabled={locked||!choice} onClick={()=>onAnswer(bedAnswer(task,found,choice),task.mode==="difference"?"Wie viele Kästchen fehlen vom kleineren bis zum größeren Beet?":"Vergleiche die gezählten Innenkästchen deiner Beete.")}>Beete vergleichen</Button></>}
    {finished&&task.mode==="largest"&&<p className="rounded-xl bg-leaf-light p-3">Die kurzen Seiten sind der Reihe nach {possibilities.map(example=>example.width).join(", ")} Kästchen lang.
      Machst du sie noch länger, bekommst du eine schon gefundene Form gedreht. Am meisten Platz hat das Beet mit {sizeKey(largest)} Kästchen:
      {" "}{largest.width*largest.height} Innenkästchen.</p>}
    {finished&&task.mode==="difference"&&<p>Die Beete haben {bedArea(examples[0])} und {bedArea(examples[1])} Innenkästchen. Der Unterschied beträgt {Math.abs(bedArea(examples[0])-bedArea(examples[1]))}.</p>}
    {finished&&task.mode==="plants"&&<div>{status==="right"&&<p>Deine Wahl: {choice==="none"?"Keines meiner Beete":choice}.</p>}
      {examples.map(example=><p key={sizeKey(example)}>{sizeKey(example)} hat {bedArea(example)} Plätze. {bedArea(example)>=task.plants?"Das reicht":"Das reicht nicht"} für {task.plants} Pflanzen.</p>)}</div>}
  </section>;
}
