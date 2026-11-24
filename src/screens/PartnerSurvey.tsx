import {useReducer} from "react";
import {newSurvey,surveyCounts,surveyMove,surveyPrompt,surveyResult,surveyThemes,type LocalSurvey,type SurveyMove} from "@/game/partnerSurvey";
import {votesLabel} from "@/game/pictogram";
import {Button} from "@/ui/Button";

export function PartnerSurvey({onBack}:{onBack:()=>void}){
  const [s,act]=useReducer(surveyMove,undefined,newSurvey);
  return <PartnerSurveyView s={s} act={act} onBack={onBack}/>;
}
export function PartnerSurveyView({s,act,onBack}:{s:LocalSurvey;act:(a:SurveyMove)=>void;onBack:()=>void}){
  const chip="min-h-11 rounded-xl border-2 px-3 py-2 ";
  const counts=surveyCounts(s), max=Math.max(...counts,1);
  const button=(label:string,pressed:boolean,action:SurveyMove,disabled=false)=><button type="button" key={label} disabled={disabled} aria-pressed={pressed}
    className={chip+(pressed?"border-grape bg-grape-light":"border-grape-light bg-white")} onClick={()=>act(action)}>{label}</button>;
  return <main className="mx-auto grid min-h-dvh max-w-xl content-start gap-3 bg-mist p-5">
    <button type="button" className="min-h-11 justify-self-start underline" onClick={onBack}>← Zur Partnerwerkstatt</button>
    <h1 className="font-display text-3xl">{s.phase==="pass"?"Jetzt ist dein Partner dran":"Unsere Umfrage"}</h1>
    {s.phase==="pass"?<>
      <p>Gib das Gerät weiter. Öffne die Aufgabe, wenn du bereit bist.</p>
      <Button onClick={()=>act({type:"open"})}>Ich bin bereit</Button>
    </>:s.phase==="setup"?<>
      <fieldset className="grid gap-1"><legend>Worüber möchtet ihr abstimmen?</legend>
        {(Object.keys(surveyThemes) as (keyof typeof surveyThemes)[]).map(value=>button(surveyThemes[value].title,s.theme===value,{type:"theme",value}))}</fieldset>
      {s.theme&&<fieldset className="grid grid-cols-2 gap-1"><legend>Wähle zwei Möglichkeiten.</legend>
        {surveyThemes[s.theme].options.map(value=>button(value,s.items.includes(value),{type:"item",value},s.items.length===2&&!s.items.includes(value)))}</fieldset>}
      <Button disabled={s.items.length!==2} onClick={()=>act({type:"start"})}>Umfrage beginnen</Button>
    </>:<>
      <h2 className="font-display text-xl">{s.theme&&surveyThemes[s.theme].title}</h2>
      {s.phase==="collect"&&<><p>Frag die Kinder nach ihrer Wahl. Tippe für jede Stimme einmal auf die passende Möglichkeit.</p>
        <div className="grid grid-cols-2 gap-1">{s.items.map((item,i)=><button type="button" key={item} className={chip+"bg-white"} disabled={s.votes.length>=99}
          onClick={()=>act({type:"vote",side:i===0?0:1})}>{item} +1</button>)}</div>
        <p aria-live="polite">{s.items.map((item,i)=>item+" · "+votesLabel(counts[i])).join(" / ")}</p>
        {s.votes.length>=99&&<p>99 Stimmen gesammelt. Jetzt kannst du eine Frage stellen.</p>}
        <button className="min-h-11 underline" disabled={!s.votes.length} onClick={()=>act({type:"undo"})}>Letzte Stimme zurücknehmen</button>
        <Button disabled={!s.votes.length} onClick={()=>act({type:"makeQuestion"})}>Eine Frage stellen</Button></>}
      {s.phase!=="collect"&&<figure className="rounded-xl bg-white p-3"><figcaption>Stimmen in eurer Umfrage</figcaption>
        {s.items.map((name,i)=><div key={name} className="mt-2"><span>{name} · {votesLabel(counts[i])}</span>
          <div className="h-4 rounded bg-mist" aria-hidden="true"><div className={"h-4 rounded "+(i?"bg-grape":"bg-leaf-dark")} style={{width:counts[i]/max*100+"%"}}/></div></div>)}</figure>}
      {s.phase==="author"&&<><fieldset className="grid gap-1"><legend>Welche Frage gibst du weiter?</legend>
        {(["first","second","difference","tie"] as const).map(value=>button(surveyPrompt(s,value),s.kind===value,{type:"kind",value}))}</fieldset>
        <button className="min-h-11 underline" onClick={()=>act({type:"edit"})}>Stimmen ändern</button></>}
      {(s.phase==="author"||s.phase==="solve")&&s.kind&&<>
        <p>{surveyPrompt(s)}</p>
        {s.kind==="tie"?<div className="flex gap-2">{["Ja","Nein"].map(value=>button(value,s.input===value,{type:"answer",value}))}</div>:
          <label>Meine Antwort <input className={chip+"w-20 bg-white"} inputMode="numeric" autoComplete="off" value={s.input} onChange={e=>act({type:"answer",value:e.target.value})}/></label>}
        {s.message&&<p role="status">{s.message}</p>}
        <Button disabled={s.input===""} onClick={()=>act({type:"check"})}>{s.phase==="author"?"Antwort prüfen und verdecken":"Antwort prüfen"}</Button></>}
      {s.phase==="done"&&<><p className="rounded-xl bg-leaf-light p-3">{surveyPrompt(s)} {s.kind==="tie"?surveyResult(s):votesLabel(Number(surveyResult(s)))}.</p>
        <Button onClick={()=>act({type:"swap"})}>Rollen tauschen und neue Umfrage starten</Button></>}
    </>}
  </main>;
}
