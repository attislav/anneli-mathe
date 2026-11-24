import { useId, useState } from "react";
import { cardLabel, countedSlots, patterns, slotFor, slotLabels, sortedAnswer, countQuestion, countingHint, placementIssue } from "@/game/attributeSort";
import type { AttributeCard, AttributeTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

function Picture({card}:{card:AttributeCard}){
  const id=useId();
  const fill=card.pattern==="plain"?"white":"url(#"+id+")";
  return <svg aria-hidden="true" viewBox="0 0 40 40" width="36" height="36">
    <defs><pattern id={id} patternUnits="userSpaceOnUse" width="7" height="7"><rect width="7" height="7" fill="white"/>
      {card.pattern==="dots"?<circle cx="3" cy="3" r="1.5" fill="#294875"/>:<path d="M0 3.5h7" stroke="#294875" strokeWidth="2"/>}</pattern></defs>
    <g fill={fill} stroke="#294875" strokeWidth="2.5">
      {card.shape==="Kreis"?<circle cx="20" cy="20" r="16"/>:card.shape==="Quadrat"?<rect x="4" y="4" width="32" height="32"/>:<path d="M20 3L37 36H3Z"/>}
    </g></svg>;
}
export function AttributeSort({task,status,onAnswer}:FormatProps<AttributeTask>){
  const [places,setPlaces]=useState<Record<number,number>>({}),[selected,setSelected]=useState<number|null>(null);
  const [counting,setCounting]=useState(false),[guess,setGuess]=useState("");
  const solved=status==="right"||status==="reveal",canMove=status==="ask"&&!counting;
  const visible=(c:AttributeCard)=>solved?slotFor(task,c):places[c.id];
  const labels=slotLabels(task);
  function checkPlacement(){
    const issue=placementIssue(task,places);
    if(issue){setSelected(issue.card);onAnswer(false,issue.hint);return;}
    setSelected(null);setCounting(true);
  }
  function card(c:AttributeCard){
    const content=<><Picture card={c}/><span><small>Karte {c.id}</small><br/>{cardLabel(c)}</span></>;
    const cls="flex min-h-11 items-center gap-1 rounded-lg border-2 p-1 text-left text-xs "+(selected===c.id?"border-grape bg-grape-light":"border-mist bg-white");
    return canMove?<button type="button" key={c.id} className={cls} aria-pressed={selected===c.id} onClick={()=>setSelected(c.id)}>{content}</button>:
      <div key={c.id} className={cls}>{content}</div>;
  }
  return <section className="grid gap-3"><p>Die beiden Eigenschaften sind <b>{task.shape}</b> und <b>{patterns[task.pattern]}</b>.</p>
    {!counting&&!solved&&<><p>Wähle eine Karte und lege sie in ein Feld. Du kannst sie später umlegen.</p>
      <div className="flex flex-wrap gap-1">{task.cards.filter(c=>visible(c)===undefined).map(card)}</div>
      <p aria-live="polite">{selected===null?"Wähle eine Karte.":"Karte "+selected+" ist ausgewählt."}</p></>}
    <div className="grid grid-cols-2 gap-2">{[3,2,1,0].map(slot=><section key={slot} className="rounded-xl border-2 border-sky-light bg-white p-2">
      <h3 className="text-sm font-bold">{labels[slot]}</h3><div className="grid gap-1">{task.cards.filter(c=>visible(c)===slot).map(card)}</div>
      {canMove&&<button type="button" className="min-h-11 rounded-lg bg-sky-light px-2 text-sm" aria-label={"Karte ablegen: "+labels[slot]} disabled={selected===null}
        onClick={()=>{if(selected!==null){setPlaces({...places,[selected]:slot});setSelected(null);}}}>Hier ablegen</button>}</section>)}</div>
    {solved?<p>{countQuestion(task)} <strong>{sortedAnswer(task)}.</strong> Gezählt wurden „{labels[countedSlots(task)[0]]}“ und „{labels[3]}“.</p>:
      counting?<><label>{countQuestion(task)} <input aria-label="Anzahl der Karten" className="w-16 rounded border p-1" inputMode="numeric"
        disabled={status!=="ask"} value={guess} onChange={e=>setGuess(e.target.value)}/></label>
      <Button disabled={status!=="ask"||!/^\d+$/.test(guess)} onClick={()=>{const hint=countingHint(task,Number(guess));onAnswer(!hint,hint??undefined);}}>Prüfen</Button>
      <button type="button" disabled={status!=="ask"} className="min-h-11 underline" onClick={()=>{setCounting(false);setGuess("");}}>Sortierung ändern</button></>:
      <Button disabled={!canMove||task.cards.some(c=>places[c.id]===undefined)} onClick={checkPlacement}>Weiter zum Zählen</Button>}
  </section>;
}
