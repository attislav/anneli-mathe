import { useState } from "react";
import type { DigitBuildTask, PairTask, RuleTask } from "@/game/types";
import { Button } from "@/ui/Button";
import { NumPad } from "./NumPad";
import type { FormatProps } from "./formats";

export function DigitBuildView({ task, status, onAnswer }: FormatProps<DigitBuildTask>) {
  const [tens, setTens] = useState<number | null>(null);
  const [found, setFound] = useState<number[]>([]);
  const [notice, setNotice] = useState("");
  const goal = task.digits.length * (task.digits.length - 1);
  function lay(digit: number) {
    setNotice("");
    if (tens === null) {
      setTens(digit);
      return;
    }
    const made = 10 * tens + digit;
    setTens(null);
    if (found.includes(made)) {
      setNotice(`Die ${made} hast du schon. Probiere eine andere Reihenfolge.`);
      return;
    }
    setFound([...found, made]);
    if (found.length + 1 === goal) onAnswer(true);
  }
  return <div className="grid gap-4">
    <div className="rounded-3xl bg-white p-4 text-center">
      <p className="font-display text-3xl">{tens ?? "□"} □</p>
      <p>{tens === null ? "Wähle die Zehnerkarte." : "Wähle die Einerkarte."}</p>
    </div>
    <div className="flex justify-center gap-3">{task.digits.map(digit =>
      <Button key={digit} disabled={status !== "ask" || digit === tens} tone="white" onClick={() => lay(digit)}>{digit}</Button>)}</div>
    <div aria-live="polite" className="rounded-2xl bg-grape/10 p-4 text-center">
      <p className="font-bold">{found.length} von {goal} Zahlen gefunden</p>
      <p className="font-display text-2xl">{[...found].sort((a, b) => a - b).join(" · ")}</p>
      {notice && <p>{notice}</p>}
    </div>
  </div>;
}

export function PairView({ task, status, onAnswer }: FormatProps<PairTask>) {
  const [solved, setSolved] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const locked = status !== "ask";
  function select(n: number) {
    if (selected === null || selected === n) {
      setSelected(selected === n ? null : n);
      return;
    }
    const result = task.operation === "+" ? selected + n : selected * n;
    setSelected(null);
    if (result !== task.target) {
      onAnswer(false, `${selected} ${task.operation} ${n} ergibt ${result}. Gesucht ist ${task.target}. Versuche ein anderes Paar.`);
      return;
    }
    setSolved([...solved, selected, n]);
    if (solved.length === 2) onAnswer(true);
  }
  return <div className="grid gap-4">
    <div aria-live="polite" className="rounded-3xl bg-white p-5 text-center font-display text-2xl">
      {solved.length > 0 && <p className="text-leaf-dark">{solved[0]} {task.operation} {solved[1]} = {task.target}</p>}
      {solved.length === 4 ? <p>{solved[2]} {task.operation} {solved[3]} = {task.target}</p> :
        <p>{selected ?? "?"} {task.operation} ? = {task.target}</p>}
    </div>
    <div className="grid grid-cols-3 gap-3">
      {task.cards.map(n => <Button key={n} tone={selected === n ? "grape" : "white"} aria-pressed={selected === n}
        disabled={locked || solved.includes(n)} onClick={() => select(n)}>{n}</Button>)}
    </div>
    {solved.length < 4 && <p className="text-center font-semibold">Tippe zwei Zahlen für {solved.length ? "die zweite" : "die erste"} Rechnung an.</p>}
  </div>;
}

export function RuleView({ task, status, onAnswer }: FormatProps<RuleTask>) {
  const [found, setFound] = useState(false);
  const [entry, setEntry] = useState("");
  const locked = status !== "ask";
  return <div className="grid gap-4">
    <ol aria-label="Zahlenreihe" className="flex flex-wrap justify-center gap-2 rounded-3xl bg-white p-4">
      {task.numbers.map((n, i) => <li key={i} className={`rounded-xl px-2 py-1 font-display text-2xl ${i === task.missing ? "bg-grape text-white" : ""}`}>
        {i === task.missing ? entry || "?" : n}
      </li>)}
    </ol>
    {found ? <>
      <p className="text-center text-lg font-bold">{task.rule}. Welche Zahl fehlt?</p>
      <NumPad value={entry} onChange={setEntry} disabled={locked} onOk={() => onAnswer(Number(entry) === task.numbers[task.missing],
        `Die Regel stimmt. Starte bei ${task.numbers[task.missing - 1]} und prüfe, welcher Sprung jetzt dran ist.`)} />
    </> : task.options.map(rule => <Button key={rule} disabled={locked} tone="white" onClick={() => {
      if (rule === task.rule) setFound(true);
      else onAnswer(false, task.hint);
    }}>{rule}</Button>)}
  </div>;
}
