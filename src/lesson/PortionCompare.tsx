import { useState } from "react";
import { comparisons, comparisonHint, portionHint, portionName, portionSize, validPortion } from "@/game/portionCompare";
import type { PortionBoard, PortionTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

function Choices({value,set,locked}:{value:number|null;set:(v:number)=>void;locked:boolean}){
  return <div className="flex flex-wrap gap-2">{comparisons.map((answer,i)=><button type="button" key={answer} disabled={locked} aria-pressed={value===i}
    className={"min-h-11 rounded-xl border-2 p-2 "+(value===i?"bg-grape-light":"bg-white")} onClick={()=>set(i)}>{answer}</button>)}</div>;
}
export function PortionGrid({board,label,cells,select}:{board:PortionBoard;label:string;cells:number[];select?:(n:number)=>void}){
  return <div role="group" aria-label={label} className="grid w-max gap-px bg-ink p-px" style={{gridTemplateColumns:"repeat("+board.cols+", 2.25rem)"}}>
    {Array.from({length:board.rows*board.cols},(_,i)=>{
      const on=cells.includes(i),name=label+", Reihe "+(Math.floor(i/board.cols)+1)+", Platz "+(i%board.cols+1);
      const cls="grid h-9 w-9 place-items-center "+(on?"bg-grape font-bold text-white":"bg-sun-light");
      return select?<button key={i} type="button" aria-label={name} aria-pressed={on} className={cls} onClick={()=>select(i)}>{on?"✓":""}</button>:
        <span key={i} role="img" aria-label={name+(on?", markiert":", frei")} className={cls}>{on?"✓":""}</span>;
    })}</div>;
}
export function PortionBoards({task,cells,solved,select}:{task:PortionTask;cells:number[][];solved:boolean;select?:(side:number,n:number)=>void}){
  return <div className="flex flex-wrap gap-4">{task.boards.map((board,i)=>{
    const good=validPortion(board,cells[i]),shown=solved&&!good?Array.from({length:portionSize(board)},(_,n)=>n):cells[i];
    const label="Tafel "+(i===0?"A":"B");
    return <section key={label} className="grid content-start gap-1"><h3 className="font-bold">{label} · {portionName(board)}</h3>
      {solved&&<p className="text-sm">{good?"Deine Markierung":"Eine mögliche Markierung"}</p>}
      <PortionGrid board={board} label={label} cells={shown} select={select?n=>select(i,n):undefined}/></section>;
  })}</div>;
}
export function PortionCompare({task,status,onAnswer}:FormatProps<PortionTask>){
  const [phase,setPhase]=useState<"predict"|"mark"|"compare">("predict"),[prediction,setPrediction]=useState<number|null>(null);
  const [cells,setCells]=useState<number[][]>([[],[]]),[winner,setWinner]=useState<number|null>(null);
  const [a,setA]=useState(""),[b,setB]=useState(""),[diff,setDiff]=useState("");
  const solved=status==="right"||status==="reveal",locked=status!=="ask";
  function toggle(side:number,n:number){setCells(cells.map((list,i)=>side!==i?list:list.includes(n)?list.filter(k=>k!==n):[...list,n]));}
  const input=(label:string,value:string,set:(s:string)=>void)=><label>{label} <input aria-label={label} disabled={locked} inputMode="numeric" className="w-14 rounded border p-1" value={value} onChange={e=>set(e.target.value)}/></label>;
  return <section className="grid gap-3"><p>Jedes Kästchen ist gleich groß. Jedes markierte Kästchen zählt als ein Stück Schokolade.</p>
    <PortionBoards task={task} cells={cells} solved={solved} select={phase==="mark"&&!locked?toggle:undefined}/>
    {solved?<><p>{task.solution}</p>{prediction!==null&&<p>Deine erste Vermutung: {comparisons[prediction]}.</p>}</>:
      phase==="predict"?<><p>Was vermutest du: Von welcher Tafel bekommst du mehr Kästchen? Du kannst frei schätzen.</p>
        <Choices value={prediction} set={setPrediction} locked={locked}/><Button disabled={locked||prediction===null} onClick={()=>setPhase("mark")}>Vermutung festhalten</Button></>:
      phase==="mark"?<><p>Markiere auf jeder Tafel ihren Anteil. Du kannst beliebige Kästchen nehmen und wieder abwählen.</p>
        <Button disabled={locked||cells.some(side=>!side.length)} onClick={()=>{const hint=portionHint(task.boards,cells);if(hint)onAnswer(false,hint);else setPhase("compare");}}>Markierungen prüfen</Button></>:
      <>{input("Markierte Kästchen auf A",a,setA)}{input("Markierte Kästchen auf B",b,setB)}<p>Von welcher Tafel bekommst du mehr Kästchen? Oder sind es gleich viele?</p>
        <Choices value={winner} set={setWinner} locked={locked}/>{input("Unterschied in Kästchen",diff,setDiff)}
        <Button disabled={locked||winner===null||![a,b,diff].every(v=>/^\d+$/.test(v))} onClick={()=>{if(winner===null)return;const hint=comparisonHint(task.boards,Number(a),Number(b),winner,Number(diff));onAnswer(!hint,hint??undefined);}}>Vergleich prüfen</Button></>}
  </section>;
}
