import { useState } from "react";
import { calculation, checkWay, freshWay, methodNames, type Method } from "@/game/twoWays";
import type { TwoWaysTask } from "@/game/types";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function TwoWays({ task, status, onAnswer }: FormatProps<TwoWaysTask>) {
  const [entry, setEntry] = useState(() => freshWay("steps"));
  const [chosen, setChosen] = useState(false);
  const [extra, setExtra] = useState<"off" | "trying" | "done">("off");
  const [hint, setHint] = useState("");
  const resolved = status === "right" || status === "reveal";
  const methods: Method[] = ["steps", "round"];
  const tile = "min-h-11 rounded-xl border-2 px-2 ";
  function choose(method: Method) {
    if (method !== entry.method || !chosen) setEntry(freshWay(method));
    setChosen(true);
  }
  if (resolved && extra !== "trying") return <section className="grid gap-2 rounded-2xl bg-white p-3">
    {methods.map(method => {
      const path = calculation(task, method);
      return <p key={method}><strong>{methodNames[method]}</strong><br />
        {path.term} = {path.middle}<br />{path.middle} {path.sign} {path.amount} = {path.result}</p>;
    })}
    {status === "right" && extra === "off" && <Button onClick={() => {
      choose(entry.method === "steps" ? "round" : "steps"); setExtra("trying"); setHint("");
    }}>Den anderen Weg selbst rechnen</Button>}
    {extra === "done" && <p>Du hast beide Rechenwege ausprobiert.</p>}
  </section>;
  const locked = status !== "ask" && extra !== "trying";
  const path = calculation(task, entry.method);
  const field = (key: "middle" | "amount" | "result", label: string) => <label>{label} <input inputMode="numeric" value={entry[key]}
    className={tile + "w-16 border-grape-light"} onChange={e => { if (/^\d{0,3}$/.test(e.target.value)) {
      setEntry({ ...entry, [key]: e.target.value }); setHint("");
    } }} /></label>;
  return <section className="grid gap-3">
    {extra === "trying" ? <p className="font-display text-xl">{methodNames[entry.method]} ausprobieren</p> :
      <fieldset disabled={locked} className="grid grid-cols-2 gap-2"><legend>Wie möchtest du rechnen?</legend>
        {methods.map(method => <button type="button" key={method} aria-pressed={chosen && entry.method === method} onClick={() => choose(method)}
          className={tile + (chosen && entry.method === method ? "border-grape bg-grape-light" : "border-transparent bg-white")}>{methodNames[method]}</button>)}
      </fieldset>}
    {chosen && <fieldset disabled={locked} className="grid gap-3 rounded-xl bg-white p-3">
      <p>{entry.method === "steps" ? "Rechne zuerst mit den Zehnern der zweiten Zahl." : "Für die Hilfsaufgabe ersetzt du eine Zahl durch einen glatten Zehner."}</p>
      {field("middle", path.term + " =")}
      <div className="flex flex-wrap items-center gap-2">
        <label>Dann <select value={entry.sign} className={tile} onChange={e => { setEntry({ ...entry, sign: e.target.value }); setHint(""); }}>
          <option value="">Zeichen</option><option>+</option><option>−</option></select></label>
        {field("amount", "Wie viel?")}</div>
      {field("result", "Mein Ergebnis")}
      {hint && <p role="status">{hint}</p>}
      <Button disabled={!entry.middle || !entry.sign || !entry.amount || !entry.result} onClick={() => {
        if (locked) return;
        const message = checkWay(task, entry);
        if (extra === "trying") {
          if (message) setHint(message);
          else setExtra("done");
        } else onAnswer(message === null, message ?? undefined);
      }}>Rechenweg prüfen</Button>
    </fieldset>}
    {extra === "trying" && <button type="button" className="min-h-11 underline" onClick={() => {
      choose(entry.method === "steps" ? "round" : "steps"); setExtra("off"); setHint("");
    }}>Beide Rechenwege ansehen</button>}
  </section>;
}
