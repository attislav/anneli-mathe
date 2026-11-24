import { useState } from "react";
import { balanceHint, stonePile, stoneSum, tilt } from "@/game/balance";
import type { BalanceTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function Scale({left,right}: {left:number;right:number}) {
  const position = tilt(left,right);
  const d = position==="balanced" ? 0 : position==="left" ? 12 : -12;
  const text = position==="balanced" ? "Beide Seiten sind gleich schwer." : position==="left" ? "Die linke Seite ist schwerer und hängt tiefer." : "Die rechte Seite ist schwerer und hängt tiefer.";
  return <figure className="rounded-xl bg-white p-2 text-center">
    <svg aria-hidden="true" className="mx-auto w-full max-w-sm" viewBox="0 0 240 95">
      <path d="M120 32 L106 87 H134 Z" fill="#68539b"/>
      <line x1="51" y1={34+d} x2="189" y2={34-d} stroke="#49376d" strokeWidth="5" strokeLinecap="round"/>
      {[[51,34+d],[189,34-d]].map(([x,y],i)=><g key={i}>
        <path d={`M${x-36} ${y+24} L${x} ${y} L${x+36} ${y+24}`} fill="none" stroke="#49376d" strokeWidth="2"/>
        <path d={`M${x-36} ${y+24} h72 q-4 18 -36 18 t-36 -18`} fill={i?"#ffd46e":"#9ecdf7"}/>
        <text x={x} y={y+37} textAnchor="middle" fontSize="12" fill="#302747">{i ? right : left}</text></g>)}
      <circle cx="120" cy="34" r="5" fill="#49376d"/>
    </svg><figcaption aria-live="polite">Links {left}, rechts {right}. {text}</figcaption>
  </figure>;
}
export function Balance({task,status,onAnswer}: FormatProps<BalanceTask>) {
  const [piles,setPiles]=useState([task.base,task.start]), [changing,setChanging]=useState(false);
  const target=stoneSum(task.base), solved=status==="right" || status==="reveal", locked=status!=="ask";
  const goal=target+task.change, example=stonePile(goal,task.stones);
  const shown = status==="reveal" ? [example,example] : piles;
  const tile="min-h-11 rounded-xl border-2 px-2 ";
  function edit(side:number,value:number,add:boolean) {
    setPiles(old=>old.map((pile,i)=>{
      if(i!==side) return pile;
      if(add) return stoneSum(pile)+value<=task.limit ? [...pile,value] : pile;
      const index=pile.indexOf(value);
      return pile.filter((_,j)=>j!==index);
    }));
  }
  function check() {
    if(locked) return;
    const hint=balanceHint(target,piles[0],piles[1],changing?task.change:undefined);
    if(hint) onAnswer(false,hint);
    else if(!changing) setChanging(true);
    else onAnswer(true);
  }
  return <section className="grid gap-3">
    <Scale left={stoneSum(shown[0])} right={stoneSum(shown[1])}/>
    {!solved && <p className="rounded-xl bg-sun-light p-3">{changing ?
      `Beide Schalen hatten den Wert ${target}. ${task.change>0?"Erhöhe":"Verringere"} den Wert jeder Schale um ${Math.abs(task.change)}. Du darfst Steine wegnehmen und durch andere ersetzen.` :
      "Die linke Schale bleibt stehen. Lege rechts Steine dazu oder nimm welche weg, bis beide Seiten gleich schwer sind."}</p>}
    {shown.map((pile,i)=><section key={i} className={`grid gap-2 rounded-xl p-3 ${i?"bg-coin-light":"bg-sky-light"}`}>
      <h2 className="font-display text-lg">{i?"Rechte":"Linke"} Schale</h2>
      {pile.length ? <div className="flex flex-wrap gap-1" role="group" aria-label="Zahlensteine in der Schale">
        {pile.length<=12 ? pile.map((n,j)=><span key={j} className="rounded-md border border-grape bg-white px-2 font-bold">{n}</span>) :
          task.stones.filter(n=>pile.includes(n)).map(n=><span key={n} className="rounded-md border border-grape bg-white px-2">{pile.filter(v=>v===n).length} × {n}</span>)}
      </div> : <p>Leer · Wert 0</p>}
      {!solved && (changing || i===1) && <fieldset disabled={locked} className="grid gap-2"><legend>Steine {i?"rechts":"links"} ändern</legend>
        <div className="flex flex-wrap gap-1">{task.stones.map(n=><button type="button" key={n} disabled={stoneSum(pile)+n>task.limit}
          aria-label={`${i?"Rechts":"Links"} einen ${n}er-Stein dazu`} className={tile+"bg-white"} onClick={()=>edit(i,n,true)}>+{n}</button>)}</div>
        <div className="flex flex-wrap gap-1">{task.stones.filter(n=>pile.includes(n)).map(n=><button type="button" key={n}
          aria-label={`${i?"Rechts":"Links"} einen ${n}er-Stein wegnehmen`} className={tile+"bg-white"} onClick={()=>edit(i,n,false)}>−{n}</button>)}</div>
      </fieldset>}
    </section>)}
    {solved ? <p>{task.solution}</p> : <Button disabled={locked} onClick={check}>{changing?"Änderung prüfen":"Gleichgewicht prüfen"}</Button>}
  </section>;
}
