import { useState } from "react";
import { fenceAnswer, fenceEdges, fenceHint, gardenEdge, gardenSides, type GardenSide } from "@/game/gardenFence";
import type { FenceTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

const address = (y:number,x:number) => String.fromCharCode(65+x)+(y+1);
type GardenProps = { shape:string[]; edges:string[]; active?:string; choose?:(y:number,x:number)=>void };
export function Garden({shape,edges,active,choose}: GardenProps) {
  return <div className="grid w-fit max-w-full bg-sky-light p-1" style={{gridTemplateColumns:`repeat(${shape[0].length},minmax(0,3rem))`}}>
    {shape.flatMap((row,y)=>[...row].map((cell,x)=>{
      const key=address(y,x);
      if (cell!== "#") return <span aria-hidden="true" key={key}/>;
      const fenced=gardenSides.filter(side=>edges.includes(gardenEdge(y,x,side)));
      const colors=gardenSides.map(side=>fenced.includes(side)?"#713f12":"#c2d6a4").join(" ");
      const props={className:"grid h-12 min-w-11 place-items-center border-[3px] bg-leaf-light font-bold",
        style:{borderColor:colors}, "aria-label":`Feld ${key}. ${fenced.length ? "Zaun "+fenced.join(", ") : "Kein Zaunstück"}.`};
      return choose ? <button key={key} type="button" {...props} aria-pressed={active===key}
        onClick={()=>choose(y,x)}><span className={active===key?"rounded bg-white px-1 underline":""}>{key}</span></button>
        : <span key={key} role="img" {...props}>{key}</span>;
    }))}
  </div>;
}

export function GardenFence({task,status,onAnswer}:FormatProps<FenceTask>) {
  const [active,setActive]=useState([0,task.first[0].indexOf("#")]);
  const [edges,setEdges]=useState<string[]>([]);
  const [compare,setCompare]=useState(false);
  const [first,setFirst]=useState(""), [second,setSecond]=useState(""), [relation,setRelation]=useState("");
  const solved=status==="right" || status==="reveal", locked=status!=="ask";
  const control="min-h-11 rounded-lg border-2 bg-white px-3";
  const toggle=(side:GardenSide)=>{
    const edge=gardenEdge(active[0],active[1],side);
    setEdges(old=>old.includes(edge)?old.filter(e=>e!==edge):[...old,edge]);
  };
  function check() {
    const hint=compare ? fenceAnswer(task,first,second,relation) : fenceHint(task.first,edges);
    if (hint) onAnswer(false,hint);
    else if (compare) onAnswer(true);
    else setCompare(true);
  }
  const input=(label:string,value:string,set:(v:string)=>void)=><label>{label} <input inputMode="numeric" disabled={locked}
    className={control+" w-16"} value={value} onChange={e=>{if(/^\d{0,2}$/.test(e.target.value))set(e.target.value);}}/> m</label>;
  return <section className="grid gap-3">
    <h3 className="font-bold">Erstes Beet</h3>
    <p>Jedes grüne Feld ist ein Beetfeld. Jede Seite ist 1 m lang. Zwischen zwei Beetfeldern brauchst du keinen Zaun.</p>
    <Garden shape={task.first} edges={solved?fenceEdges(task.first):edges} active={address(active[0],active[1])}
      choose={compare || locked ? undefined : (y,x)=>setActive([y,x])}/>
    {!compare && !solved && <>
      <p>Wähle ein Feld und lege den Zaun an seine Außenseiten. Drücke eine Seite erneut, um das Stück wegzunehmen.</p>
      <fieldset className="flex flex-wrap gap-2" disabled={locked}><legend>Seiten von Feld {address(active[0],active[1])}</legend>
        {gardenSides.map(side=><button type="button" key={side} className={control+" aria-pressed:bg-leaf-light"}
          aria-pressed={edges.includes(gardenEdge(active[0],active[1],side))} onClick={()=>toggle(side)}>{side}</button>)}
      </fieldset>
    </>}
    {(compare || solved) && <>
      <h3 className="font-bold">Zweites Beet</h3><p>Es hat genauso viele Felder. Wie lang wird hier der Zaun?</p>
      <Garden shape={task.second} edges={solved?fenceEdges(task.second):[]}/>
      {solved ? <p className="rounded-xl bg-leaf-light p-2">{task.solution}</p> : <>
        {input("Zaun am ersten Beet",first,setFirst)}{input("Zaun am zweiten Beet",second,setSecond)}
        <fieldset className="flex flex-wrap gap-2" disabled={locked}><legend>Wie ist der zweite Zaun im Vergleich zum ersten?</legend>
          {["länger","gleich lang","kürzer"].map(value=><button type="button" key={value} className={control+" aria-pressed:bg-leaf-light"}
            aria-pressed={relation===value} onClick={()=>setRelation(value)}>{value}</button>)}</fieldset>
      </>}
    </>}
    {!solved && <Button disabled={locked || (compare?first==="" || second==="" || relation==="":edges.length===0)} onClick={check}>
      {compare?"Vergleich prüfen":"Zaun prüfen"}</Button>}
  </section>;
}
