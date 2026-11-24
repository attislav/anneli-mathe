import { useState } from "react";
import { endFace, faceNames, guidedStart, moveNames, nextGuided, positions, type CubePath, type Face } from "@/game/rollCube";
import type { RollCubeTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

const visibleSides: {face:Face; polygon:string; x:number; y:number; fill:string}[] = [
  { face:"top", polygon:"12,48 58,20 144,20 98,48", x:78, y:38, fill:"#f8edbc" },
  { face:"front", polygon:"12,48 98,48 98,130 12,130", x:55, y:90, fill:"#d7ecff" },
  { face:"right", polygon:"98,48 144,20 144,102 98,130", x:121, y:80, fill:"#e2d6f3" },
];
const hiddenSides: Face[] = ["left", "back", "bottom"];
export function CubeView({face}:{face:Face}) {
  return <figure className="rounded-xl bg-white p-3">
    <div className="flex flex-wrap items-center gap-3">
      <svg aria-hidden="true" width="162" height="142" viewBox="0 0 162 142">
        {visibleSides.map(side=><g key={side.face}><polygon points={side.polygon} fill={side.fill} stroke="#453755" strokeWidth="2"/>
          <text x={side.x} y={side.y} textAnchor="middle" fontSize="12" fill="#241e2c">{side.face==="front"?"vorne":faceNames[side.face]}</text>
          {face===side.face && <text x={side.x+ (side.face==="top"?25:0)} y={side.y+(side.face==="top"?0:22)} fill="#51346d" textAnchor="middle" fontSize="20">★</text>}</g>)}
      </svg>
      <div><p className="text-sm font-bold">Verdeckte Flächen</p>{hiddenSides.map(side=><p key={side}>{faceNames[side]} {side===face?"★":""}</p>)}</div>
    </div><figcaption aria-live="polite" className="font-bold">Der Stern liegt {faceNames[face]}.</figcaption>
  </figure>;
}
function Directions({path}:{path:CubePath}){
  return <ol className="flex flex-wrap gap-2">{path.moves.map((move,index)=><li key={index} className="rounded-xl bg-sun-light px-2 py-1">{index+1}. {moveNames[move]}</li>)}</ol>;
}
function FaceChoice({selected,choose,disabled}:{selected:Face|null;choose:(face:Face)=>void;disabled:boolean}){
  return <div className="grid grid-cols-2 gap-2">{(Object.keys(faceNames) as Face[]).map(face=><button type="button" key={face} disabled={disabled}
    aria-pressed={selected===face} className={"min-h-11 rounded-xl border-2 p-1 "+(selected===face?"bg-grape-light":"bg-white")}
    onClick={()=>choose(face)}>{faceNames[face]}</button>)}</div>;
}
export function RollCube({task,status,onAnswer}:FormatProps<RollCubeTask>){
  const [guided,setGuided]=useState(guidedStart);
  const [chosen,setChosen]=useState<Face|null>(null);
  const locked=status!=="ask";
  const act=(action:Parameters<typeof nextGuided>[2])=>setGuided(current=>nextGuided(current,task.practice,action));
  if(status==="right"||status==="reveal")return <section className="grid gap-2"><h3 className="font-bold">Der neue Weg</h3>
    <Directions path={task.transfer}/><CubeView face={endFace(task.transfer)}/><p>{task.solution}</p></section>;
  const transfer=guided.phase==="transfer",path=transfer?task.transfer:task.practice;
  const face=transfer?path.start:positions(path)[guided.completed];
  return <section className="grid gap-3"><h3 className="font-bold">{transfer?"Neuer Weg":"Erster Weg zum Ausprobieren"}</h3>
    <p>Du sitzt vor dem Tisch. Vorne ist bei dir, hinten ist von dir weg. Bei jedem Schritt kippt der Würfel über eine Kante.</p>
    <CubeView face={face}/><Directions path={path}/>
    {guided.phase==="predict"?<><p>Wo liegt der Stern am Ende? Vermute zuerst.</p>
      <FaceChoice selected={guided.prediction} choose={act} disabled={locked}/>
      <Button disabled={locked||!guided.prediction} onClick={()=>act("start")}>Vermutung ausprobieren</Button></>:
    guided.phase==="roll"?<><p aria-live="polite">{guided.completed} von {path.moves.length} Schritten gekippt.</p>
      {guided.completed<path.moves.length?<Button disabled={locked} onClick={()=>act("tilt")}>Jetzt {moveNames[path.moves[guided.completed]]} kippen</Button>:
        <><p>Deine Vermutung war: {faceNames[guided.prediction!]}.</p><Button disabled={locked} onClick={()=>act("continue")}>Neuen Weg selbst lösen</Button>
          <button type="button" disabled={locked} className="min-h-11 underline" onClick={()=>act("repeat")}>Kippen noch einmal ansehen</button></>}</>:
      <><p>Der Würfel steht wieder am Start. Wo liegt der Stern nach diesem neuen Weg?</p>
        <FaceChoice selected={chosen} choose={setChosen} disabled={locked}/><Button disabled={locked||chosen===null} onClick={()=>{
          const correct=chosen===endFace(path);onAnswer(correct,correct?undefined:task.hint);
        }}>Endlage prüfen</Button></>}
  </section>;
}
