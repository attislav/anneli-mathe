import { useState } from "react";
import { Button } from "@/ui/Button";
import type { Status } from "./formats";

export function GoalParts({status,onCheck}: {status: Status; onCheck: (left:number,right:string)=>void}) {
  const [left,setLeft] = useState(0), [response,setResponse] = useState("");
  const shown = status === "reveal" ? 3 : left, locked = status !== "ask";
  return <section className="grid gap-2"><p>Lege mindestens zwei Plättchen nach links. Rechts sollen mehr liegen als links.</p>
    <div className="grid grid-cols-2 gap-2">{[shown,10-shown].map((n,i) => <div key={i} className={`rounded-xl p-3 ${i ? "bg-coin-light" : "bg-sky-light"}`}>
      <strong>{i ? "Rechts" : "Links"}</strong><div className="grid grid-cols-5 gap-1" role="img" aria-label={`${n} Plättchen`}>
        {Array.from({length:n},(_,j) => <span key={j} aria-hidden="true" className="aspect-square rounded-full bg-grape" />)}</div></div>)}</div>
    <div className="flex flex-wrap gap-2">{([-1,1] as const).map(d => <button type="button" key={d} disabled={locked || left+d<0 || left+d>10}
      className="min-h-11 rounded-xl bg-white px-2" onClick={() => { setLeft(left+d); setResponse(""); }}>Ein Plättchen nach {d===1?"links":"rechts"}</button>)}</div>
    <label>Wie viele liegen rechts? <input inputMode="numeric" disabled={locked} value={status === "reveal" ? "7" : response} className="min-h-11 w-16 rounded-xl bg-white px-2"
      onChange={e => { if (/^\d{0,2}$/.test(e.target.value)) setResponse(e.target.value); }} /></label>
    {!locked && <Button disabled={response === ""} onClick={() => onCheck(left,response)}>Verteilung prüfen</Button>}
  </section>;
}
