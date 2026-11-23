import { useState } from "react";
import type { Task } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";
import { NumPad } from "./NumPad";
import { NumberJump } from "@/ui/NumberJump";

type Props<F extends Task["format"]> = FormatProps<Extract<Task, { format: F }>>;

const panel = "flex flex-col items-center gap-4 rounded-[28px] bg-white p-4 text-center shadow-[0_6px_0_#E4E0F5]";
const equation = "font-display text-3xl font-semibold";
const instruction = "text-lg font-semibold";

export function JumpView({ task, status, onAnswer }: Props<"ten-jump">) {
  const [first, setFirst] = useState(0);
  const [landing, setLanding] = useState("");
  const distance = Math.abs(task.delta);
  const forward = task.delta > 0;
  const sign = forward ? "+" : "−";
  const middle = task.start + Math.sign(task.delta) * first;
  const remaining = distance - first;
  const locked = status !== "ask";
  return <fieldset disabled={locked} className={panel}>
    <p className={equation}>{task.start} {sign} {distance}</p>
    {first > 0 && remaining > 0 && <NumberJump jumps={[{ from: task.start, to: middle }, { from: middle, to: task.start + task.delta }]} />}
    <p className={instruction}>Wie viele Schritte sind es bis zum Zehner?</p>
    <div className="flex max-w-full flex-wrap justify-center gap-1" role="group" aria-label="Länge des ersten Sprungs">
      {Array.from({ length: distance }, (_, i) => <button key={i} type="button"
        aria-label={`Erster Sprung: ${i + 1} Schritte`} aria-pressed={i + 1 === first}
        onClick={() => { setFirst(i + 1); setLanding(""); }}
        className={`h-11 w-11 rounded-full border-2 font-bold ${i < first ? "border-grape bg-grape text-white" : "border-grape/30 bg-white"}`}>{i + 1}</button>)}
    </div>
    <p aria-live="polite" className="rounded-2xl bg-grape/10 px-4 py-3 text-xl">
      {task.start} {sign} {first} = {middle} · Noch {remaining} Schritte
    </p>
    {first > 0 && <div className="grid w-full max-w-sm gap-3">
      <p className={instruction}>Wo landest du? <output className="text-grape">{landing || "?"}</output></p>
      <NumPad value={landing} onChange={setLanding} disabled={locked}
        onOk={() => onAnswer(middle % 10 === 0 && Number(landing) === task.start + task.delta,
          middle % 10 === 0 ? `Dein erster Sprung stimmt. Gehe von ${middle} noch ${remaining} Schritte ${forward ? "vor" : "zurück"}.` :
            `Dein erster Sprung landet auf ${middle}. Ändere ihn so, dass die Zahl auf 0 endet.`)} />
    </div>}
  </fieldset>;
}

export function ExchangeView({ task, status, onAnswer }: Props<"exchange">) {
  const [traded, setTraded] = useState(false);
  const [taken, setTaken] = useState<number[]>([]);
  const removed = taken.length;
  const rods = Math.floor(task.start / 10) - Number(traded);
  const units = task.start % 10 + (traded ? 10 : 0);
  const locked = status !== "ask";
  return <fieldset disabled={locked} className={panel}>
    <p className={equation}>{task.start} − {task.take}</p>
    <p className={instruction}>Tippe Einer an, um sie wegzunehmen.</p>
    <div className="flex flex-wrap justify-center gap-2" aria-label={`${rods} Zehnerstangen`}>
      {Array.from({ length: rods }, (_, i) => <span key={i} className="grid grid-rows-10 gap-px rounded bg-sky-800 p-px" aria-hidden="true">
        {Array.from({ length: 10 }, (_, j) => <i key={j} className="h-2 w-3 bg-sky-300" />)}
      </span>)}
    </div>
    <Button size="md" tone="sky" disabled={locked || traded} onClick={() => setTraded(true)}>1 Zehner in 10 Einer tauschen</Button>
    <div className="flex max-w-sm flex-wrap justify-center gap-1" role="group" aria-label="Einer">
      {Array.from({ length: units }, (_, i) => <button key={i} aria-label={taken.includes(i) ? "Einer zurücklegen" : "Einen Einer wegnehmen"}
        aria-pressed={taken.includes(i)} onClick={() => setTaken(taken.includes(i) ? taken.filter(unit => unit !== i) : [...taken, i])}
        className={`grid h-11 w-11 place-items-center rounded-xl bg-amber-50 ${taken.includes(i) ? "opacity-25" : ""}`}>
        <span className="h-4 w-4 rounded-sm border border-amber-700 bg-amber-400" />
      </button>)}
    </div>
    <p aria-live="polite">{removed} weggenommen · {rods} Zehner und {units - removed} Einer übrig</p>
    <div className="flex flex-wrap justify-center gap-3">
      <Button size="md" tone="white" onClick={() => { setTaken([]); setTraded(false); }}>Neu legen</Button>
      <Button size="md" disabled={locked || !removed} onClick={() => onAnswer(removed === task.take,
        removed < task.take && units === removed ? task.hint :
        `Du hast ${removed} weggenommen. Es sollen ${task.take} sein. ${removed > task.take ? "Tippe blasse Einer an, um sie zurückzulegen." : "Tippe weitere Einer an."}`)}>Prüfen</Button>
    </div>
  </fieldset>;
}

export function ArrayView({ task, status, onAnswer }: Props<"turn-array">) {
  const [rows, setRows] = useState(0);
  const [turned, setTurned] = useState(false);
  const [answer, setAnswer] = useState("");
  const shownRows = turned ? task.cols : rows;
  const shownCols = turned ? rows : task.cols;
  const total = task.rows * task.cols;
  const locked = status !== "ask";
  return <fieldset disabled={locked} className={panel}>
    <p className={equation}>{turned ? `${task.cols} · ${rows}` : `${task.rows} · ${task.cols}`}</p>
    <p className={instruction}>{turned ? "Jede Reihe ist jetzt eine Gruppe." : `Lege ${task.rows} Reihen mit je ${task.cols} Punkten.`}</p>
    <div className="flex min-h-16 flex-col justify-center gap-1 rounded-2xl bg-grape/10 p-3" aria-label={`${shownRows} Reihen mit je ${shownCols} Punkten`}>
      {shownRows === 0 && <span>Hier kommen deine Reihen hin.</span>}
      {Array.from({ length: shownRows }, (_, r) => <div key={r} className="flex justify-center gap-2 rounded-lg bg-white px-3 py-1">
        {Array.from({ length: shownCols }, (_, c) => <i key={c} className="h-4 w-4 rounded-full bg-grape" />)}
      </div>)}
    </div>
    {turned ? <>
      <p className={instruction}>{total} Punkte in {task.cols} gleichen Gruppen. Wie viele pro Gruppe?</p>
      <p className={equation}>{total} : {task.cols} = <output className="text-grape">{answer || "?"}</output></p>
      <div className="w-full max-w-sm">
        <NumPad value={answer} onChange={setAnswer} disabled={locked} onOk={() => onAnswer(Number(answer) === task.rows,
          "Schau dir nur eine weiße Reihe an. Wie viele Punkte liegen in dieser Gruppe?")} />
      </div>
    </> : <>
      <div className="flex flex-wrap justify-center gap-3">
        <Button size="md" tone="white" disabled={!rows} onClick={() => setRows(rows - 1)}>− Reihe</Button>
        <Button size="md" tone="sky" disabled={rows >= 7} onClick={() => setRows(rows + 1)}>+ Reihe</Button>
      </div>
      <Button disabled={locked || !rows} onClick={() => {
        if (rows === task.rows) setTurned(true);
        else onAnswer(false, `Du hast ${rows} Reihen gelegt. Es sollen ${task.rows} sein. ${rows < task.rows ? "Lege noch Reihen dazu." : "Nimm Reihen weg."}`);
      }}>Feld drehen</Button>
    </>}
  </fieldset>;
}
