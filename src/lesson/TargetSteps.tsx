import { useState } from "react";
import { equations, intermediate, possibleRoutes, remaining, solves, type FirstStep, type Route, type Sign } from "@/game/targetSteps";
import type { TargetStepsTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

const signs:Sign[]=["+","−"];
function Signs({value,choose}:{value:Sign|null;choose:(s:Sign)=>void}) {
  return <div className="flex gap-2">{signs.map(sign=><button type="button" key={sign} aria-label={sign==="+"?"Plus":"Minus"} aria-pressed={value===sign} onClick={()=>choose(sign)}
    className={"min-w-12 rounded-xl border-2 p-2 text-lg font-bold "+(value===sign?"bg-sky-light":"bg-white")}>{sign}</button>)}</div>;
}
export function TargetRoute({task,route,title}:{task:TargetStepsTask;route:Route;title:string}) {
  return <section className="rounded-xl bg-leaf-light p-3"><h3 className="font-bold">{title}</h3>
    {equations(task,route).map((line,i)=><p key={i}>{line}</p>)}</section>;
}
function Workbench({task,disabled,otherMid,grade}:{task:TargetStepsTask;disabled:boolean;otherMid?:number;grade:(route:Route|null,message:string)=>void}) {
  const [order,setOrder]=useState<number[]>([]),[sign,setSign]=useState<Sign|null>(null),[mid,setMid]=useState(""),
    [confirmed,setConfirmed]=useState<FirstStep|null>(null),[lastSign,setLastSign]=useState<Sign|null>(null),[prediction,setPrediction]=useState("");
  function restart(){setOrder([]);setSign(null);setMid("");setConfirmed(null);setLastSign(null);setPrediction("");}
  function checkFirst() {
    if(order.length!==2 || !sign)return;
    const step={first:order[0],second:order[1],sign};
    const result=intermediate(task,step);
    if(result===null)return grade(null,"Der Zwischenstand muss zwischen 0 und "+task.limit+" liegen. Tausche Karten oder Zeichen.");
    if(Number(mid)!==result)return grade(null,"Prüfe deine erste Rechnung noch einmal.");
    if(result===otherMid)return grade(null,"Diesen Zwischenstand hattest du schon. Lege die ersten beiden Karten anders.");
    setConfirmed(step);
  }
  function checkLast() {
    if(!confirmed||!lastSign)return;
    const route={...confirmed,lastSign};
    if(!solves(task,route))return grade(null,"Mit dieser letzten Rechnung erreichst du die Zielzahl noch nicht. Ändere das Zeichen oder lege die Karten neu.");
    if(Number(prediction)!==Math.abs(task.target-Number(mid)))return grade(null,"Dein Zeichen passt. Zähle vom Zwischenstand bis zur Zielzahl: Wie weit ist der Weg?");
    grade(route,"");
  }
  return <fieldset disabled={disabled} className="grid gap-2"><legend className="font-bold">Zielzahl {task.target} · Zahlen von 0 bis {task.limit}</legend>
    {!confirmed?<><p>Wähle zuerst die Startkarte und dann die zweite Karte.</p><div className="flex flex-wrap gap-2">{task.cards.map((n,i)=>
      <button type="button" key={i} disabled={order.includes(i)||order.length===2} onClick={()=>setOrder([...order,i])} className="grid min-w-14 rounded-xl border-2 bg-sun-light p-2">
        <small>Karte {String.fromCharCode(65+i)}</small><b>{n}</b></button>)}</div><Signs value={sign} choose={setSign}/>
      <label>{order.length?task.cards[order[0]]:"□"} {sign??"…"} {order.length===2?task.cards[order[1]]:"□"} = <input aria-label="Mein Zwischenstand" type="text" inputMode="numeric" className="w-16 rounded border p-1" value={mid} onChange={e=>setMid(e.target.value)}/></label>
      <Button disabled={order.length!==2||!sign||!/^\d+$/.test(mid)} onClick={checkFirst}>Zwischenstand prüfen</Button></>:
      <><p>Dein erster Schritt: {task.cards[confirmed.first]} {confirmed.sign} {task.cards[confirmed.second]} = {mid}.</p>
      <p>Dein Ziel ist {task.target}. Wie weit ist es von {mid} bis dorthin?</p>
      <label>Meine Vorhersage: <input type="text" inputMode="numeric" aria-label="Meine Vorhersage" className="w-16 rounded border p-1" value={prediction} onChange={e=>setPrediction(e.target.value)}/> Schritte.</label>
      <p>Übrig ist die {remaining(task,confirmed)}. Mit welchem Zeichen erreichst du dein Ziel?</p><Signs value={lastSign} choose={setLastSign}/>
      <Button disabled={!lastSign||!/^\d+$/.test(prediction)} onClick={checkLast}>Weg prüfen</Button></>}
    <button type="button" className="justify-self-start rounded p-2 underline" onClick={restart}>Karten neu legen</button></fieldset>;
}
export function TargetSteps({task,status,onAnswer}:FormatProps<TargetStepsTask>) {
  const [original,setOriginal]=useState<Route|null>(null),[extra,setExtra]=useState(false),[second,setSecond]=useState<Route|null>(null),[message,setMessage]=useState("");
  if(status==="reveal")return <TargetRoute task={task} route={possibleRoutes(task)[0]} title="Ein möglicher Weg"/>;
  if(status==="right"&&original)return <div className="grid gap-3"><TargetRoute task={task} route={original} title="Dein Weg"/>
    {second?<TargetRoute task={task} route={second} title="Dein zweiter Weg"/>:extra?<><p>Finde einen anderen Zwischenstand.</p>
      <Workbench task={task} disabled={false} otherMid={intermediate(task,original)??undefined} grade={(route,hint)=>{setMessage(hint);if(route)setSecond(route);}}/>
      <p role="status">{message}</p></>:<Button onClick={()=>setExtra(true)}>Anderen Weg ausprobieren</Button>}</div>;
  return <Workbench task={task} disabled={status!=="ask"} grade={(route,hint)=>{if(route)setOriginal(route);onAnswer(!!route,hint);}}/>;
}
