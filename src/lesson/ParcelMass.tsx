import { useState } from "react";
import { stonePile, stoneSum } from "@/game/balance";
import { limitChoices, parcelLimitHint, parcelWeights, weighingHint } from "@/game/parcelMass";
import type { ParcelTask } from "@/game/types";
import { Button } from "@/ui/Button";
import { Scale } from "./Balance";
import type { FormatProps } from "./formats";

export function ParcelMass({task,status,onAnswer}:FormatProps<ParcelTask>) {
  const [pile,setPile]=useState<number[]>([]),[grams,setGrams]=useState(""),[compare,setCompare]=useState(false);
  const [total,setTotal]=useState(""),[choice,setChoice]=useState("");
  const solved=status==="right" || status==="reveal",locked=status!=="ask";
  const weights=parcelWeights(task.level), shown=status==="reveal"?stonePile(task.mass,weights):pile;
  const sum=stoneSum(shown), balanced=sum===task.mass;
  const chip="min-h-11 rounded-xl border-2 bg-white px-3";
  const input=(label:string,value:string,set:(v:string)=>void)=><label>{label} <input className={chip+" w-20"} inputMode="numeric"
    value={value} disabled={locked} onChange={e=>{if(/^\d{0,4}$/.test(e.target.value))set(e.target.value);}}/> g</label>;
  function change(weight:number,add:boolean) {
    setPile(old=>add?[...old,weight]:old.filter((_,i)=>i!==old.indexOf(weight)));
    setGrams("");
  }
  function check(){
    if(locked)return;
    const hint=compare?parcelLimitHint(task,total,choice):weighingHint(task,pile,grams);
    if(hint)onAnswer(false,hint);
    else if(compare)onAnswer(true);
    else setCompare(true);
  }
  return <section className="grid gap-3">
    <Scale left={task.mass} right={sum} labels={["Päckchen","Gewichte"]}/>
    <div className="rounded-xl bg-sky-light p-3"><h3 className="font-bold">Gewichtsstücke rechts</h3>
      {!shown.length?<p>Die Schale ist leer.</p>:<ul className="flex flex-wrap gap-1">
        {shown.map((w,i)=><li key={i} className="rounded-t-lg border-2 border-slate-600 bg-white px-2 py-1 font-bold">{w} g</li>)}</ul>}
    </div>
    {!compare && !solved && <>
      <p>Lege Gewichte auf die Waage, bis beide Schalen gleich hoch sind.</p>
      <fieldset disabled={locked}><legend>Gewicht dazulegen</legend><div className="flex flex-wrap gap-2">
        {weights.map(w=><button type="button" key={w} className={chip} disabled={sum+w>1500} onClick={()=>change(w,true)}>+ {w} g</button>)}</div></fieldset>
      {!!pile.length && <fieldset disabled={locked}><legend>Gewicht wegnehmen</legend><div className="flex flex-wrap gap-2">
        {weights.filter(w=>pile.includes(w)).map(w=><button type="button" key={w} className={chip} onClick={()=>change(w,false)}>− {w} g</button>)}</div></fieldset>}
      {balanced && input("Wie viel wiegt das Päckchen?",grams,setGrams)}
    </>}
    {(compare||solved) && <>
      <p>Dein Päckchen wiegt {task.mass} g. Das zweite wiegt {task.other} g.</p>
      <p className="rounded-xl bg-sun-light p-3">In die Versandtasche dürfen höchstens 1 kg. 1000 g = 1 kg.</p>
      {solved ? <p className="rounded-xl bg-leaf-light p-3">{task.solution}</p>:<>
        {input("Wie viel wiegen beide zusammen?",total,setTotal)}
        <fieldset disabled={locked} className="flex flex-wrap gap-2"><legend>Dürfen beide zusammen in die Tasche?</legend>
          {limitChoices.map(c=><button type="button" key={c.id} className={chip+" aria-pressed:bg-leaf-light"}
            aria-pressed={choice===c.id} onClick={()=>setChoice(c.id)}>{c.label}</button>)}</fieldset></>}
    </>}
    {!solved && (compare || balanced) && <Button disabled={locked || (compare?total==="" || choice==="":grams==="")} onClick={check}>
      {compare?"Versand prüfen":"Masse prüfen"}</Button>}
  </section>;
}
