import { useState } from "react";
import { addMeasure, checkTransfer, litres, otherVessel, poured, vesselSize, type Vessel } from "@/game/juice";
import type { JuiceTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function JuiceVessels({ capacity, first, amounts }: { capacity: number; first: Vessel; amounts: [number, number] }) {
  const bottom = capacity * vesselSize.narrow.stepHeight + 12;
  return <svg role="img" className="mx-auto block w-full max-w-sm" viewBox={`0 0 260 ${bottom + 35}`}
    aria-label={[first, otherVessel(first)].map((v, i) => `Gefäß ${i+1}, ${v === "narrow" ? "schmal" : "breit"}, ${litres(amounts[i])}. Fassungsvermögen ${litres(capacity)}.`).join(" ")}>
    {([first, otherVessel(first)] as const).map((v, i) => {
      const { width, stepHeight } = vesselSize[v], x = 34 + 126*i, y = bottom-capacity*stepHeight;
      return <g key={v} aria-hidden="true">
        <rect x={x} y={y} width={width} height={bottom-y} fill="white" />
        <rect x={x} y={bottom-amounts[i]*stepHeight} width={width} height={amounts[i]*stepHeight} fill="#ffba49" />
        <path d={`M ${x} ${y} V ${bottom} H ${x+width} V ${y}`} fill="none" stroke="#43355c" strokeWidth="2" />
        {Array.from({ length: capacity+1 }, (_, h) => <g key={h}>
          <path d={`M ${x} ${bottom-h*stepHeight} h ${h % 2 ? 5 : 10}`} stroke="#43355c" />
          {h % 2 === 0 && <text x={x-3} y={bottom-h*stepHeight+3} textAnchor="end" fontSize="10">{h/2} l</text>}
        </g>)}
        <text x={x+width/2} y={bottom+20} textAnchor="middle" fontSize="12">{i === 0 ? "Erstes" : "Zweites"} Gefäß</text>
      </g>;
    })}
  </svg>;
}
export function Juice({ task, status, onAnswer }: FormatProps<JuiceTask>) {
  const [steps, setSteps] = useState<number[]>([]);
  const [predict, setPredict] = useState(false);
  const [amount, setAmount] = useState<number | null>(null), [higher, setHigher] = useState("");
  const total = poured(steps), solved = status === "right" || status === "reveal", locked = status !== "ask";
  const tile = "min-h-11 rounded-xl border-2 px-2 ";
  function check() {
    if (locked) return;
    if (!predict) {
      if (total === task.target) setPredict(true);
      else onAnswer(false, `In deinem Gefäß sind ${litres(total)}. Vergleiche die Menge mit dem Auftrag. Du kannst auch die letzte Portion zurücknehmen.`);
    } else {
      const hint = checkTransfer(task, amount, higher);
      onAnswer(hint === null, hint ?? undefined);
    }
  }
  return <section className="grid gap-3">
    <JuiceVessels capacity={task.capacity} first={task.source} amounts={solved ? [0,task.target] : [total,0]} />
    <p>Von Strich zu Strich ist es ein halber Liter. Die Gefäße sind gleich tief.</p>
    {solved ? <p className="rounded-xl bg-white p-3">{total !== task.target && "So sieht die passende Füllung aus. "}Vorher: {litres(task.target)} im ersten Gefäß. Jetzt: {litres(task.target)} im zweiten Gefäß.</p> :
      !predict ? <>
        <fieldset disabled={locked} className="flex flex-wrap gap-2"><legend>Gieße Saft ins erste Gefäß.</legend>
          {([1,2] as const).map(n => <button key={n} type="button" className={tile + "bg-coin-light"}
            disabled={total+n > task.capacity} onClick={() => setSteps(prev => addMeasure(prev, n, task.capacity))}>+ {litres(n)}</button>)}
          <button type="button" className={tile + "bg-white"} disabled={!steps.length} onClick={() => setSteps(prev => prev.slice(0,-1))}>Letzte Portion zurück</button>
        </fieldset>
        <p aria-live="polite">Im ersten Gefäß: {litres(total)} von {litres(task.capacity)}.</p>
        <Button disabled={locked || !steps.length} onClick={check}>Füllung prüfen</Button>
      </> : <>
        <p>Du gießt gleich den ganzen Saft ins zweite Gefäß. Kein Tropfen geht verloren.</p>
        <label>Wie viel kommt dort an? <select disabled={locked} className={tile + "bg-white"} value={amount ?? ""} onChange={e => setAmount(e.target.value === "" ? null : Number(e.target.value))}>
          <option value="">Menge wählen</option>{Array.from({ length: task.capacity+1 }, (_, n) => <option key={n} value={n}>{litres(n)}</option>)}</select></label>
        <fieldset disabled={locked} className="grid gap-1"><legend>Wann steht der Saft höher?</legend>
          {([["before","Vor dem Umfüllen"],["after","Nach dem Umfüllen"],["same","Beide Male gleich hoch"]] as const).map(([value,label]) =>
            <button type="button" aria-pressed={value===higher} key={value} className={tile + (value === higher ? "border-grape bg-grape-light" : "border-transparent bg-white")}
              onClick={() => setHigher(value)}>{label}</button>)}</fieldset>
        <Button disabled={locked || amount === null || !higher} onClick={check}>Umfüllen und prüfen</Button>
        <button type="button" disabled={locked} className="min-h-11 underline" onClick={() => { setPredict(false); setAmount(null); setHigher(""); }}>Füllung ändern</button>
      </>}
  </section>;
}
