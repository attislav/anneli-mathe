import { useState } from "react";
import { article, lineValue, receiptError, receiptFinding, receiptHint, receiptSum, stock, type ReceiptMark } from "@/game/receipt";
import type { ReceiptTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function Receipt({task,status,onAnswer}:FormatProps<ReceiptTask>){
  const [mark,setMark]=useState<ReceiptMark|null>(null),[correction,setCorrection]=useState("");
  const [paying,setPaying]=useState(false),[total,setTotal]=useState("");
  const solved=status==="right"||status==="reveal", editing=status==="ask"&&!paying;
  const finding=solved?receiptError(task):mark;
  const rows=solved?task.printed.map(line=>task.items.find(item=>item.id===line.id)!):task.printed;
  function select(next:ReceiptMark){setMark(next);setCorrection("");}
  function inspect(){
    if(!mark)return;
    const hint=receiptHint(task,mark,correction===""?null:Number(correction));
    if(hint)onAnswer(false,hint);else setPaying(true);
  }
  const cls="rounded-lg border-2 p-2";
  return <section className="grid gap-3">
    <p>Im Klassenladen zahlst du mit Spielgeld. Vergleiche deinen Einkauf mit dem Bon.</p>
    <div className="grid gap-2 sm:grid-cols-2"><section className="rounded-xl bg-sun-light p-3">
      <h3 className="font-bold">Dein Warenkorb</h3>{task.items.map(row=><p key={row.id}>
        <span aria-hidden="true">{stock[row.id][2].repeat(row.quantity)}</span> {row.quantity} {article(row.id,row.quantity)}</p>)}</section>
      <section className="rounded-xl bg-sky-light p-3"><h3 className="font-bold">Preisschilder</h3>
        {task.items.map(row=><p key={row.id}>1 {article(row.id)} · {row.price} ct</p>)}</section></div>
    <table className="w-full rounded-xl bg-white text-center text-sm"><caption className="font-bold">{solved?(finding==="correct"?"Geprüfter Kassenbon":"Berichtigter Kassenbon"):"Gedruckter Kassenbon"}</caption>
      <thead><tr>{["Artikel","Anzahl","Stückpreis","Zeilensumme"].map(title=><th key={title} scope="col">{title}</th>)}</tr></thead>
      <tbody>{rows.map(row=><tr key={row.id}><th scope="row">{article(row.id)}</th>{(["quantity","price"] as const).map(field=>{
        const chosen=!!finding&&finding!=="correct"&&finding.id===row.id&&finding.field===field;
        const value=row[field]+(field==="price"?" ct":"");
        return <td key={field}>{editing?<button type="button" aria-label={article(row.id)+(field==="price"?", Stückpreis ":", Anzahl ")+value}
          aria-pressed={chosen} className={cls+" min-h-11 "+(chosen?"bg-coin-light":"bg-white")} onClick={()=>select({id:row.id,field})}>{value}</button>:
          <span className={chosen?"font-bold underline":""}>{value}</span>}</td>;
      })}<td>{lineValue(row)} ct</td></tr>)}</tbody>
      <tfoot><tr><th colSpan={3} scope="row">{solved?"Dein Zahlbetrag":"Summe auf dem Bon"}</th><td>{receiptSum(rows)} ct</td></tr></tfoot></table>
    {solved?<p className="rounded-xl bg-leaf-light p-3">{task.solution}</p>:paying?<><p>{receiptFinding(task)}</p><label>Was kostet dein Warenkorb wirklich? <input aria-label="Tatsächlicher Zahlbetrag in Cent" inputMode="numeric"
      className="w-16 rounded border p-1" value={total} disabled={status!=="ask"} onChange={e=>setTotal(e.target.value)}/> ct</label>
      <Button disabled={status!=="ask"||!/^\d+$/.test(total)} onClick={()=>{const ok=Number(total)===receiptSum(task.items);onAnswer(ok,ok?undefined:"Rechne für jeden Artikel Anzahl mal Stückpreis. Zähle diese Beträge zusammen.");}}>Zahlbetrag prüfen</Button></>:
      <><p>Stimmt alles? Sonst tippe auf die falsche Anzahl oder den falschen Stückpreis.</p>
      <button type="button" disabled={!editing} aria-pressed={mark==="correct"} className={cls+(mark==="correct"?" bg-leaf-light":" bg-white")} onClick={()=>select("correct")}>Der Bon stimmt</button>
      {mark&&mark!=="correct"&&<label>{article(mark.id)} · {mark.field==="quantity"?"Richtige Anzahl":"Richtiger Stückpreis in Cent"} <input aria-label="Berichtigter Wert"
        disabled={!editing} inputMode="numeric" className="w-16 rounded border p-1" value={correction} onChange={e=>setCorrection(e.target.value)}/></label>}
      <Button disabled={!editing||!mark||(mark!=="correct"&&!/^\d+$/.test(correction))} onClick={inspect}>Bon prüfen</Button></>}
  </section>;
}
