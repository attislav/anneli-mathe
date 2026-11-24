import { useState } from "react";
import { codeClue, codeExpression, codeHint, witnessHint } from "@/game/symbolCode";
import type { CodeTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

const symbols = { Sonne:"☀", Mond:"☾" };
function WithSigns({text}:{text:string}) {
  return <>{text.split(/(Sonne|Mond)/).map((word,i)=>
    word==="Sonne" || word==="Mond" ? <span key={i} className="inline-flex items-center gap-1">
      <b className={word==="Sonne"?"text-amber-700":"text-indigo-700"} aria-hidden="true">{symbols[word]}</b>{word}</span> : word)}</>;
}

export function SymbolCode({task,status,onAnswer}:FormatProps<CodeTask>) {
  const [advanced,setAdvanced]=useState(false);
  const [pairs,setPairs]=useState([["",""],["",""]]);
  const [decoded,setDecoded]=useState(["",""]);
  const [result,setResult]=useState("");
  const locked=status!=="ask", solved=status==="right" || status==="reveal";
  const explore=task.explore && !advanced && !solved, total=task.sun+task.moon;
  const expression=codeExpression(task);
  const control="min-h-11 w-16 rounded-lg border-2 bg-white px-2";
  const pairInputs=(title:string,values:string[],update:(next:string[])=>void)=><fieldset disabled={locked} className="flex flex-wrap gap-3 rounded-xl bg-white p-2">
    <legend className="font-bold">{title}</legend>
    {["Sonne","Mond"].map((name,i)=><label key={name}><WithSigns text={name}/> <input aria-label={title+" · "+name} className={control}
      value={values[i]} inputMode="numeric" onChange={e=>{const next=e.target.value;if(/^\d?$/.test(next))update(values.map((old,j)=>i===j?next:old));}}/></label>)}
  </fieldset>;
  function check(){
    const hint=explore ? witnessHint(total,pairs[0],pairs[1]) : codeHint(task,decoded,result);
    if(hint) onAnswer(false,hint);
    else if(explore) setAdvanced(true);
    else onAnswer(true);
  }
  return <section className="grid gap-3">
    <p>Jedes Zeichen steht für eine Ziffer von 0 bis 9. Sonne und Mond dürfen auch die gleiche Ziffer haben.</p>
    <div className="rounded-xl bg-sky-light p-3"><h3 className="font-bold">Erster Hinweis</h3>
      <WithSigns text={"Sonne + Mond = "+total}/></div>
    {explore ? <>
      <p>Reicht das zum Entschlüsseln? Zeige mit zwei verschiedenen Vorschlägen, dass beide passen.</p>
      {pairs.map((pair,i)=><div key={i}>{pairInputs("Vorschlag "+(i+1),pair,next=>setPairs(old=>old.map((v,j)=>i===j?next:v)))}</div>)}
    </> : <>
      {task.explore && <p className="rounded-xl bg-leaf-light p-2">{advanced
        ? `Deine Vorschläge passen beide: ${pairs[0].join(" + ")} = ${total} und ${pairs[1].join(" + ")} = ${total}.`
        : (()=>{const a=Math.max(0,total-9);return `Beide Vorschläge passen zum ersten Hinweis: ${a} + ${total-a} und ${a+1} + ${total-a-1}.`;})()}</p>}
      <div className="rounded-xl bg-sky-light p-3"><h3 className="font-bold">Zweiter Hinweis</h3><WithSigns text={codeClue(task)}/></div>
      {solved ? <p className="rounded-xl bg-leaf-light p-3"><WithSigns text={task.solution}/></p> : <>
        {pairInputs("Dein Zeichencode",decoded,setDecoded)}
        <label className="rounded-xl bg-white p-2"><WithSigns text={expression.text}/> = <input aria-label="Ergebnis der neuen Rechnung"
          disabled={locked} className={control} value={result} inputMode="numeric" onChange={e=>{if(/^\d{0,2}$/.test(e.target.value))setResult(e.target.value);}}/></label>
      </>}
    </>}
    {!solved && <Button disabled={locked || (explore?pairs.flat().includes(""):decoded.includes("") || result==="")} onClick={check}>
      {explore?"Vorschläge prüfen":"Zeichencode prüfen"}</Button>}
  </section>;
}
