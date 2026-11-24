import { useReducer, useState } from "react";
import { clueText, fitsClue } from "@/game/numberDetective";
import { freshRiddle, riddleMove, starts, type RiddleAction, type RiddleState } from "@/game/partnerRiddle";
import { pick } from "@/game/random";
import type { NumberClue } from "@/game/types";
import { Button } from "@/ui/Button";

function Composer({numbers,add}:{numbers:number[];add:(clue:NumberClue)=>void}){
  const [kind,setKind]=useState<NumberClue["kind"]>("range");
  const [low,setLow]=useState(numbers[0]),[high,setHigh]=useState(numbers[3]);
  const [digit,setDigit]=useState(numbers[0]%10),[second,setSecond]=useState(-1),[even,setEven]=useState(true);
  const digits=[...new Set(numbers.map(n=>n%10))].sort((a,b)=>a-b);
  const options=(values:number[])=>values.map(value=><option key={value} value={value}>{value}</option>);
  function compose(){
    if(kind==="range")add({kind,lo:low,hi:high});
    else if(kind==="parity")add({kind,even});
    else add({kind,digits:second===-1?[digit]:[digit,second].sort((a,b)=>a-b)});
  }
  return <fieldset className="grid gap-2 rounded-xl bg-white p-3"><legend className="font-bold">Einen Hinweis bauen</legend>
    <label>Art des Hinweises <select value={kind} onChange={e=>setKind(e.target.value as NumberClue["kind"])} className="rounded border p-2">
      <option value="range">Zahlenbereich</option><option value="ends">Endziffer</option><option value="parity">Gerade oder ungerade</option></select></label>
    {kind==="range"?<div className="flex flex-wrap gap-2"><label>Von <select value={low} onChange={e=>{const value=Number(e.target.value);setLow(value);if(high<value)setHigh(value);}}>{options(numbers)}</select></label>
      <label>bis <select value={high} onChange={e=>setHigh(Number(e.target.value))}>{options(numbers.filter(n=>n>=low))}</select></label></div>:
      kind==="ends"?<div className="flex flex-wrap gap-2"><label>Endet auf <select value={digit} onChange={e=>{const value=Number(e.target.value);setDigit(value);if(second===value)setSecond(-1);}}>{options(digits)}</select></label>
        <label>oder auf <select value={second} onChange={e=>setSecond(Number(e.target.value))}><option value={-1}>keine weitere Ziffer</option>{options(digits.filter(n=>n!==digit))}</select></label></div>:
      <label>Die Zahl ist <select value={even?"even":"odd"} onChange={e=>setEven(e.target.value==="even")}><option value="even">gerade</option><option value="odd">ungerade</option></select></label>}
    <Button tone="sky" onClick={compose}>Hinweis hinzufügen</Button></fieldset>;
}
export function PartnerRiddle({onBack}:{onBack:()=>void}){
  const [state,act]=useReducer(riddleMove,undefined,()=>freshRiddle());
  return <RiddleView state={state} act={act} onBack={onBack}/>;
}
export function RiddleView({state,act,onBack}:{state:RiddleState;act:(action:RiddleAction)=>void;onBack:()=>void}){
  const {phase,clues,secret,near}=state;
  const author=phase==="write"||phase==="ready";
  return <main className="mx-auto grid min-h-dvh max-w-xl content-start gap-3 bg-mist p-5">
    <button type="button" className="min-h-11 justify-self-start rounded-xl bg-white px-3" onClick={onBack}>← Zur Partnerwerkstatt</button>
    <h1 className="font-display text-3xl">{phase==="pass"?"Gerät weitergeben":author?"Erfinde ein eindeutiges Zahlenrätsel":phase==="done"?"Rätsel gelöst!":"Löse das Zahlenrätsel"}</h1>
    {phase==="pass"?<><p>Jetzt ist das andere Kind dran. Öffne das Rätsel, wenn du bereit bist.</p><Button onClick={()=>act({type:"open"})}>Rätsel öffnen</Button></>:
      <>{(phase==="write"||phase==="solve")&&<><p>{author?"Wähle deine Geheimzahl. Baue zwei oder drei Hinweise. Erst zusammen sollen sie genau deine Zahl verraten.":"Welche Zahl passt zu allen Hinweisen?"}</p>
        <div className="grid grid-cols-4 gap-1">{state.numbers.map(value=><button type="button" key={value} aria-pressed={(author?secret:state.guess)===value}
          className={"min-h-11 rounded-xl border-2 "+((author?secret:state.guess)===value?"bg-grape-light":"bg-white")}
          onClick={()=>act({type:author?"secret":"guess",value})}>{value}</button>)}</div></>}
      {author&&secret!==null&&<p>Deine Geheimzahl: <b>{secret}</b></p>}
      {clues.length>0&&<ol className="grid gap-1">{clues.map((clue,i)=><li key={i} className="rounded-lg bg-white p-2">{i+1}. {clueText(clue)}
        {phase==="write"&&<button aria-label={"Hinweis "+(i+1)+" entfernen"} className="ml-2 min-h-11 underline" onClick={()=>act({type:"remove",value:i})}>Entfernen</button>}</li>)}</ol>}
      {phase==="write"&&<>{clues.length<3&&<Composer numbers={state.numbers} add={clue=>act({type:"add",clue})}/>}<Button onClick={()=>act({type:"check"})}>Rätsel prüfen</Button></>}
      {phase==="ready"&&<><p>Genau deine Zahl passt. Dein Rätsel ist bereit.</p><Button onClick={()=>act({type:"pass"})}>Rätsel übergeben</Button>
        <button className="min-h-11 underline" onClick={()=>act({type:"edit"})}>Hinweise ändern</button></>}
      {phase==="solve"&&<Button disabled={state.guess===null} onClick={()=>act({type:"solve"})}>Zahl prüfen</Button>}
      {phase==="explain"&&<><p>Deine Zahl {state.guess} passt. Warum scheidet die {near} aus? Wähle einen Hinweis, den sie verletzt.</p>
        {clues.map((clue,i)=><button key={i} type="button" className={"min-h-11 rounded-lg p-2 text-left "+(state.reason===i?"bg-grape-light":"bg-white")}
          aria-pressed={state.reason===i} onClick={()=>act({type:"reason",value:i})}>{clueText(clue)}</button>)}
        <Button disabled={state.reason===null} onClick={()=>act({type:"explain"})}>Begründung prüfen</Button></>}
      {phase==="done"&&<><p>Von den zwölf Zahlen passt nur die {secret} zu allen Hinweisen.</p><p>Die {near} scheidet aus. Folgende Hinweise passen nicht zu ihr:</p>
        <ul>{clues.filter(clue=>!fitsClue(near!,clue)).map(clue=><li key={clueText(clue)}>{clueText(clue)}</li>)}</ul>
        <Button onClick={()=>act({type:"reset",start:pick(starts)})}>Rollen tauschen · neues Rätsel</Button></>}
      {state.message&&<p role="status" className="rounded-lg bg-sun-light p-2">{state.message}</p>}</>}
  </main>;
}
