import { useState } from "react";
import { collectOrder, wheelProof, wheelRows, type WheelOrder } from "@/game/wheelOrders";
import type { WheelTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

const control = "min-h-11 rounded-lg border-2 bg-white px-2";

export function WheelOrders({task, status, onAnswer}: FormatProps<WheelTask>) {
  const [bikes, setBikes] = useState(0);
  const [trikes, setTrikes] = useState(0);
  const [orders, setOrders] = useState<WheelOrder[]>([]);
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);
  const [marks, setMarks] = useState<(boolean | undefined)[]>([]);
  const rows = wheelRows(task.wheels);
  const solved = status === "right" || status === "reveal";
  const locked = status !== "ask";
  const shownOrders = solved ? rows.flatMap(r => r.bikes === null ? [] : [{bikes:r.bikes, trikes:r.trikes}]) : orders;
  const quantities = (label:string, value:number, max:number, set:(n:number)=>void) =>
    <label className="grid gap-1">{label}<select className={control} value={value} disabled={locked}
      onChange={e => {set(Number(e.target.value)); setMessage("");}}>
      {Array.from({length:max+1},(_,i)=><option key={i}>{i}</option>)}
    </select></label>;

  return <section className="grid gap-3">
    <p className="rounded-xl bg-sky-light p-3">Im Lager liegen <strong>{task.wheels} Räder</strong>. Ein Fahrrad hat 2 Räder, ein Dreirad hat 3. Eine Sorte darf fehlen.</p>
    {!checking && !solved && <>
      <div className="grid grid-cols-2 gap-3">
        {quantities("Fahrräder",bikes,Math.floor(task.wheels/2),setBikes)}
        {quantities("Dreiräder",trikes,rows.length-1,setTrikes)}
      </div>
      <p aria-live="polite">{bikes} · 2 + {trikes} · 3 = {bikes*2+trikes*3} Räder</p>
      <Button disabled={locked} onClick={()=>{
        const result = collectOrder(task.wheels,orders,{bikes,trikes});
        setOrders(result.orders); setMessage(result.message);
      }}>Bestellung prüfen und sammeln</Button>
      <p role="status">{message}</p>
    </>}
    <div className="rounded-xl bg-leaf-light p-3">
      <h3 className="font-bold">Deine gesammelten Bestellungen</h3>
      {shownOrders.length ? <table className="w-full text-center"><thead><tr><th>Fahrräder</th><th>Dreiräder</th></tr></thead>
        <tbody>{shownOrders.map(o=><tr key={o.trikes}><td>{o.bikes}</td><td>{o.trikes}</td></tr>)}</tbody></table> : <p>Hier kommt deine erste passende Bestellung hin.</p>}
    </div>
    {!checking && !solved ? <Button disabled={locked || orders.length === 0} onClick={()=>setChecking(true)}>Habe ich alle gefunden?</Button> : <>
      <h3 className="font-bold">Prüfe jede Dreiradzahl</h3>
      <p>Nach den Dreirädern kommen die Fahrräder. Lassen sich die übrigen Räder paarweise verbauen? Bei 0 Rädern bleibt auch keines übrig.</p>
      {rows.map(row=><fieldset key={row.trikes} disabled={locked} className="rounded-xl border-2 p-2">
        <legend>{row.trikes} {row.trikes===1?"Dreirad":"Dreiräder"} · {task.wheels} − {row.trikes*3} = {row.rest} {row.rest===1?"Rad":"Räder"} übrig</legend>
        {solved ? <p>{row.bikes===null ? "Ein Rad bleibt übrig." : `Passt für ${row.bikes} ${row.bikes===1?"Fahrrad":"Fahrräder"}.`}</p> :
          [true,false].map(pairs=><button type="button" key={String(pairs)} aria-pressed={marks[row.trikes]===pairs}
            className={control+" mr-1 mb-1 aria-pressed:border-sky aria-pressed:bg-sky-light"} onClick={()=>{
              const next = [...marks]; next[row.trikes] = pairs; setMarks(next);
            }}>{pairs ? "Geht paarweise auf" : "Ein Rad bleibt"}</button>)}
      </fieldset>)}
      {!solved && <><button type="button" className="min-h-11 underline" disabled={locked} onClick={()=>setChecking(false)}>Weitere Bestellungen suchen</button>
        <Button disabled={locked || rows.some(row=>marks[row.trikes]===undefined)} onClick={()=>{
          const hint=wheelProof(task.wheels,orders,marks); onAnswer(hint===null,hint??undefined);
        }}>Sammlung und Begründung prüfen</Button></>}
    </>}
  </section>;
}
