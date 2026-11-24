import { useState } from "react";
import { checkClaim, reasons, verdict, type Pair } from "@/game/parityClaim";
import type { ParityTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

function Counters({ n }: { n: number }) {
  return <span className="inline-flex flex-wrap items-center gap-1" role="img" aria-label={`${n}: ${Math.floor(n / 2)} Paare und ${n % 2} einzelne Plättchen`}>
    {Array.from({ length: Math.ceil(n / 2) }, (_, i) => <span aria-hidden="true" key={i}
      className={"rounded border px-1 " + (2 * i + 1 === n ? "border-amber-600 bg-coin-light" : "border-grape bg-grape-light")}>
      {2 * i + 1 === n ? "●" : "●●"}</span>)}
  </span>;
}
export function ParityClaim({ task, status, onAnswer }: FormatProps<ParityTask>) {
  const [choice, setChoice] = useState("");
  const [pairs, setPairs] = useState<[Pair, Pair]>([[null, null], [null, null]]);
  const [reason, setReason] = useState("");
  const solved = status === "right" || status === "reveal", locked = status !== "ask";
  const count = choice === "manchmal" ? 2 : 1;
  const ready = choice && pairs.slice(0, count).every(pair => pair.every(v => v !== null)) && (count === 2 || reason);
  const tile = "min-h-11 rounded-xl border-2 p-2 ";
  if (solved) return <section className="rounded-xl bg-white p-3">
    <h2 className="font-display text-xl">{verdict(task) === "immer" ? "Immer" : verdict(task) === "manchmal" ? "Manchmal" : "Nie"}</h2>
    <p>{task.solution}</p>
  </section>;
  return <section className="grid gap-3">
    <p>Probiere Zahlen von 1 bis {task.limit} aus. Du darfst eine Zahl zweimal nehmen.</p>
    <fieldset disabled={locked} className="grid grid-cols-3 gap-1"><legend>Was denkst du?</legend>
      {["immer", "manchmal", "nie"].map(word => <button type="button" aria-pressed={choice === word} key={word}
        className={tile + (choice === word ? "border-grape bg-grape-light" : "border-transparent bg-white")} onClick={() => setChoice(word)}>{word}</button>)}
    </fieldset>
    {pairs.slice(0, count).map((pair, row) => <fieldset disabled={locked} key={row} className="grid gap-2 rounded-xl bg-white p-3">
      <legend>{count === 1 ? "Dein Zahlenpaar" : `Zahlenpaar ${row + 1}`}</legend>
      {pair.map((n, col) => <div key={col} className="flex flex-wrap items-center gap-2">
        <label>{col + 1}. Zahl <select className={tile} value={n ?? ""} onChange={e => {
          const updated: Pair = [...pair];
          updated[col] = e.target.value === "" ? null : Number(e.target.value);
          setPairs(row === 0 ? [updated, pairs[1]] : [pairs[0], updated]);
        }}><option value="">Wähle</option>{Array.from({ length: task.limit }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></label>
        {n !== null && <Counters n={n} />}</div>)}
      {pair[0] !== null && pair[1] !== null && <div className="flex flex-wrap items-center gap-2" aria-live="polite">
        <strong>{pair[0]} + {pair[1]} = {pair[0] + pair[1]}</strong><Counters n={pair[0] + pair[1]} /></div>}
    </fieldset>)}
    {choice === "manchmal" ? <p>Zeige ein Beispiel, bei dem die Aussage stimmt, und eins, bei dem sie nicht stimmt.</p> :
      choice && <fieldset disabled={locked} className="grid gap-1"><legend>Was passiert bei allen erlaubten Zahlenpaaren?</legend>
        {Object.entries(reasons).map(([key, text]) => <button type="button" key={key} aria-pressed={reason === key}
          className={tile + "text-left " + (reason === key ? "border-grape bg-grape-light" : "border-transparent bg-white")}
          onClick={() => setReason(key)}>{text}</button>)}</fieldset>}
    <Button disabled={locked || !ready} onClick={() => {
      if (locked || !ready) return;
      const hint = checkClaim(task, choice, pairs[0], pairs[1], reason);
      onAnswer(hint === null, hint ?? undefined);
    }}>Einordnung und Begründung prüfen</Button>
  </section>;
}
