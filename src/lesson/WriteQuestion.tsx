import { useState } from "react";
import { activeProfileId } from "@/game/state";
import { questionCard } from "@/game/strategyCards";
import { RememberStrategy } from "./RememberStrategy";
import { checkQuestion, composeQuestion, startQuestion, type Question } from "@/game/writeQuestion";
import type { WriteQuestionTask } from "@/game/types";
import { DataIconArt } from "@/ui/Detective";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function WriteQuestion({ task, status, onAnswer }: FormatProps<WriteQuestionTask>) {
  const [owner] = useState(activeProfileId);
  const [entry, setEntry] = useState(() => startQuestion(task.preset ?? { a: null, b: null, kind: null }));
  const locked = status !== "ask";
  const solved = status === "right" || status === "reveal";
  const model = composeQuestion(task, entry.question);
  const card = solved && !task.preset ? questionCard(task, entry.question) : null;
  const options = (skip: number | null = null) => task.groups.map((group, i) =>
    <option key={group.icon} value={i} disabled={skip === i}>{group.value} {group.label}</option>);
  const select = "min-h-11 w-full rounded-xl border-2 border-grape-light bg-white px-2";
  function change(question: Question) {
    setEntry(startQuestion(question));
  }
  return <form className="grid gap-3" onSubmit={event => {
    event.preventDefault();
    if (locked || !model || entry.left === null || entry.right === null || !entry.sign || !entry.answer) return;
    const result = checkQuestion(task, entry);
    onAnswer(result.correct, result.hint);
  }}>
    <section className="grid gap-2 rounded-2xl bg-white p-3">
      <h2 className="font-display text-xl">{task.scene === "fruit" ? "Im Obstkorb" : "Im Tierheim"}</h2>
      <div className="grid grid-cols-3 gap-1">{task.groups.map(group =>
        <div key={group.icon} className="grid justify-items-center rounded-xl bg-sun-light py-2 text-sm">
          <DataIconArt icon={group.icon} /><span>{group.value} {group.label}</span></div>)}</div>
    </section>
    {!solved && !task.preset && <fieldset disabled={locked} className="grid grid-cols-2 gap-2">
      <legend>Baue deine Frage</legend>
      {(["a", "b"] as const).map((key, i) => <label key={key}>{i === 0 ? "Erste Gruppe" : "Zweite Gruppe"}
        <select className={select} value={entry.question[key] ?? ""} onChange={e =>
          change({ ...entry.question, [key]: e.target.value === "" ? null : Number(e.target.value) })}>
          <option value="">Gruppe wählen</option>{options(entry.question[key === "a" ? "b" : "a"])}
        </select></label>)}
      <label className="col-span-2">Was möchtest du wissen?
        <select className={select} value={entry.question.kind ?? ""} onChange={e =>
          change({ ...entry.question, kind: e.target.value === "sum" ? "sum" : e.target.value === "difference" ? "difference" : null })}>
          <option value="">Frage wählen</option><option value="sum">Wie viele zusammen?</option><option value="difference">Wie groß ist der Unterschied?</option>
        </select></label>
    </fieldset>}
    {model && <>
      <p className="rounded-2xl bg-grape-light p-3 font-display text-xl">{model.sentence}</p>
      {solved ? <p className="rounded-2xl bg-white p-3 text-center font-display text-xl">
        {task.groups[model.left].value} {model.sign} {task.groups[model.right].value} = {model.value}
      </p> : <>
        <fieldset disabled={locked} className="grid grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)] gap-1">
          <legend>Baue die passende Rechnung</legend>
          <label>Zahl 1<select className={select} value={entry.left ?? ""} onChange={e => setEntry({ ...entry, left: e.target.value === "" ? null : Number(e.target.value) })}>
            <option value="">Wähle</option>{options()}</select></label>
          <label>Zeichen<select className={select} aria-label="Rechenzeichen" value={entry.sign ?? ""} onChange={e =>
            setEntry({ ...entry, sign: e.target.value === "+" ? "+" : e.target.value === "−" ? "−" : null })}>
            <option value="">?</option><option>+</option><option>−</option></select></label>
          <label>Zahl 2<select className={select} value={entry.right ?? ""} onChange={e => setEntry({ ...entry, right: e.target.value === "" ? null : Number(e.target.value) })}>
            <option value="">Wähle</option>{options()}</select></label>
        </fieldset>
        <label>Meine Antwort <input type="text" inputMode="numeric" disabled={locked} value={entry.answer} className="w-20 rounded-xl border-2 border-grape p-2"
          onChange={e => { if (/^\d{0,3}$/.test(e.target.value)) setEntry({ ...entry, answer: e.target.value }); }} /></label>
        <Button type="submit" disabled={locked || entry.left === null || entry.right === null || !entry.sign || !entry.answer}>Antwort prüfen</Button>
      </>}
    </>}
    {card && <RememberStrategy owner={owner} card={card} />}
  </form>;
}
