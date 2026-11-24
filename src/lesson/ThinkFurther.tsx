import { useState } from "react";
import type { FurtherQuestion } from "@/game/thinkFurther";
import { Button } from "@/ui/Button";

export function ThinkFurther({item}:{item:FurtherQuestion}) {
  const [stage,setStage]=useState<"offer"|"predict"|"look"|"skip">("offer");
  const [guess,setGuess]=useState("");
  if(stage==="skip") return null;
  if(stage==="offer") return <button type="button" className="min-h-11 rounded-xl bg-white p-3 font-bold" onClick={()=>setStage("predict")}>
    Freiwillig weiterdenken: Was ändert sich, wenn …?</button>;
  return <section className="grid gap-3 rounded-xl bg-white p-3 text-left">
    <h2 className="font-display text-xl">Was ändert sich, wenn …?</h2>
    <p>{item.source}</p>
    <p><strong>Vorher</strong> · {item.before}</p>
    <p>{item.question}</p>
    {stage==="predict" ? <>
      <fieldset className="flex flex-wrap gap-2"><legend>Was vermutest du?</legend>
        {item.choices.map(choice=><button type="button" key={choice} aria-pressed={guess===choice}
          className="min-h-11 rounded-xl border-2 px-3 aria-pressed:bg-sky-light" onClick={()=>setGuess(choice)}>{choice}</button>)}</fieldset>
      <Button disabled={!guess} onClick={()=>setStage("look")}>Mit meiner Vermutung vergleichen</Button>
      <button type="button" className="min-h-11 underline" onClick={()=>setStage("skip")}>Überspringen</button>
    </> : <div className="grid gap-2" aria-live="polite">
      <p>Deine Vermutung: {guess}.</p>
      <p><strong>Nachher</strong> · {item.after}</p><p>{item.why}</p>
      <button type="button" className="min-h-11 underline" onClick={()=>{setGuess("");setStage("predict");}}>Noch einmal probieren</button>
    </div>}
  </section>;
}
