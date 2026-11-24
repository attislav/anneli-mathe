import { useState } from "react";
import { cornerCell, needs, packs, purchase, ReadingRound, roomLabel } from "@/game/readingCorner";
import { Button } from "@/ui/Button";

const basketCount=(n:number)=>n+" "+(n===1?"Bücherkorb":"Bücherkörbe");

function Floor({round,cells,choose}:{round:ReadingRound;cells:number[];choose?:(n:number)=>void}){
  return <div aria-label="Raumplan" className="grid grid-cols-3 gap-1">{Array.from({length:9},(_,n)=>{
    const label=roomLabel(round.setup,n),mat=cells.includes(n);
    const content=<><b>{cornerCell(n)}</b> · {label}{mat?" · Matte":""}</>;
    const cls="min-h-12 rounded-lg border p-1 text-sm "+(mat?"bg-leaf-light":"bg-white");
    return choose?<button key={n} type="button" className={cls} aria-pressed={mat} onClick={()=>choose(n)}>{content}</button>:<span key={n} className={cls}>{content}</span>;
  })}</div>;
}
export function CornerNote({round,completed}:{round:ReadingRound;completed:number}){
  if(!completed)return null;
  const {cells,setup,order,examples}=round,need=needs(setup,cells.length);
  const total=purchase(completed>=3?order:[0,0,0,0]),remaining=setup.budget-total.price;
  return <section className="grid gap-2 rounded-xl bg-sun-light p-3"><h2 className="font-bold">Unser Leseeckenplan</h2>
    <p>{examples.has(1)?"Beispiel-Grundriss":"Dein Grundriss"} · {cells.length} Matten für {2*cells.length} Kinder</p><Floor round={round} cells={cells}/>
    {completed>=2&&<p>{examples.has(2)?"Vorgerechneter Bedarf":"Dein Einkaufszettel"}: {2*cells.length} − {setup.stockC} = {need.cushions} Kissen und {cells.length} − {setup.stockB} = {basketCount(need.baskets)} fehlen.</p>}
    {completed>=3&&<><h3 className="font-bold">{round.ownOrder?"Deine Bestellung":"Beispielbestellung"}</h3><ul>{order.map((n,i)=>n>0?<li key={i}>{n} × Packung „{packs[i].label}“ · {n*packs[i].price} €</li>:null)}</ul>
      <p>Geliefert: {total.cushions} Kissen und {basketCount(total.baskets)}. Für später übrig: {total.cushions-need.cushions} Kissen und {basketCount(total.baskets-need.baskets)}.</p>
      <p>{examples.has(3)?"Vorgerechnetes Restgeld":"Dein Restgeld"}: {setup.budget} € − {total.price} € = {remaining} €.</p></>}
  </section>;
}
export function ReadingWork({round,refresh}:{round:ReadingRound;refresh:()=>void}){
  const [cells,setCells]=useState<number[]>([]),[c,setC]=useState(""),[b,setB]=useState("");
  const [counts,setCounts]=useState([0,0,0,0]),[left,setLeft]=useState("");
  const {number,status,task}=round.state,s=round.setup,locked=status!=="ask",id=task.id;
  if(status==="right"||status==="reveal")return null;
  if(number===1)return <section className="grid gap-2"><p>Lege zwei oder drei Matten. Eine liegt am Fenster auf {cornerCell(s.window)}. Tür, Laufweg und Regal bleiben frei. Tippe ein Feld zum Legen oder Wegnehmen an.</p>
    <Floor round={round} cells={cells} choose={locked?undefined:n=>setCells(cells.includes(n)?cells.filter(k=>k!==n):[...cells,n])}/>
    <Button disabled={locked||!cells.length} onClick={()=>{round.submit(id,{step:1,cells});refresh();}}>Grundriss prüfen</Button></section>;
  const entry=(label:string,value:string,set:(v:string)=>void)=><label>{label} <input aria-label={label} inputMode="numeric" className="w-16 rounded border p-1" disabled={locked} value={value} onChange={e=>set(e.target.value)}/></label>;
  if(number===2)return <section className="grid gap-3"><p>Auf jeder Matte lesen zwei Kinder. Jedes Kind braucht ein Kissen. Jede Matte bekommt einen Bücherkorb.</p>
    <p>Im Vorrat: {s.stockC} Kissen und {basketCount(s.stockB)}.</p>
    {entry("Fehlende Kissen",c,setC)}{entry("Fehlende Bücherkörbe",b,setB)}
    <Button disabled={locked||!/^\d+$/.test(c)||!/^\d+$/.test(b)} onClick={()=>{round.submit(id,{step:2,cushions:Number(c),baskets:Number(b)});refresh();}}>Bedarf prüfen</Button></section>;
  const total=purchase(counts);
  return <section className="grid gap-2"><p>Du hast {s.budget} €. Bestelle genug für deinen Einkaufszettel. Zusätzliche Kissen oder Körbe dürft ihr behalten.</p>
    {packs.map((p,i)=><div key={p.label} className="flex items-center justify-between gap-2 rounded-xl bg-white p-2">
      <span>Packung: <b>{p.label}</b> · {p.price} €</span>
      <span className="flex items-center gap-2">{[-1,1].map(delta=><button type="button" key={delta} aria-label={p.label+" · eine Packung "+(delta<0?"weniger":"mehr")}
        disabled={locked||(delta<0?counts[i]===0:counts[i]>=Math.floor(s.budget/p.price))}
        className="min-h-11 min-w-11 rounded bg-sky-light" onClick={()=>{setCounts(counts.map((v,j)=>j===i?v+delta:v));setLeft("");}}>{delta<0?"−":"+"}</button>)}<strong>{counts[i]} ×</strong></span></div>)}
    <p aria-live="polite">Deine Packungen enthalten {total.cushions} Kissen und {basketCount(total.baskets)}.</p>
    {entry("Wie viele Euro bleiben übrig?",left,setLeft)}
    <Button disabled={locked||!/^\d+$/.test(left)} onClick={()=>{round.submit(id,{step:3,counts,left:Number(left)});refresh();}}>Bestellung prüfen</Button></section>;
}
