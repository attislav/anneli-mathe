import { useState } from "react";
import type { SurveyTask } from "@/game/types";
import { checkSurvey, surveyAnswer, surveyRows } from "@/game/survey";
import { DataIconArt, TallyTable } from "@/ui/Detective";
import { Button } from "@/ui/Button";
import type { FormatProps } from "./formats";

export function ClassSurvey({ task, status, onAnswer }: FormatProps<SurveyTask>) {
  const [assigned, setAssigned] = useState<number[]>(() => task.votes.map(() => -1));
  const [selected, setSelected] = useState(0);
  const [entry, setEntry] = useState("");
  const locked = status !== "ask";
  const displayed = status === "reveal" ? task.votes : assigned;
  const complete = displayed.every(group => group >= 0);
  function place(group: number) {
    const next = assigned.map((old, i) => i === selected ? group : old);
    setAssigned(next);
    setSelected(next.indexOf(-1));
  }
  return <form className="grid gap-3" onSubmit={event => {
    event.preventDefault();
    if (locked || !complete || !entry) return;
    const result = checkSurvey(task, assigned, entry);
    onAnswer(result.correct, result.hint);
  }}>
    <div className="grid grid-cols-3 gap-2" aria-label="Stimmzettel" role="group">
      {task.votes.map((vote, i) => <button key={i} type="button" disabled={locked}
        aria-pressed={i === selected} aria-label={`Zettel ${i + 1}: ${task.categories[vote].label}. ${displayed[i] < 0 ? "Noch nicht sortiert" : "In der Gruppe " + task.categories[displayed[i]].label}`}
        onClick={() => setSelected(i)}
        className={`min-h-14 rounded-xl border-2 p-1 text-sm ${i === selected ? "border-grape bg-grape-light" : "border-white bg-white"}`}>
        <small className="block">Zettel {i + 1}</small>{task.categories[vote].label}
        {displayed[i] >= 0 && <small className="block">→ {task.categories[displayed[i]].label}</small>}
      </button>)}
    </div>
    <p aria-live="polite">{selected >= 0 ? `Wohin gehört Zettel ${selected + 1} mit „${task.categories[task.votes[selected]].label}“?` : "Alle Zettel sind sortiert. Zum Ändern tippe auf einen Zettel."}</p>
    <div className="flex flex-wrap gap-2">
      {task.categories.map(({ label, icon }, i) => <button type="button" key={label} disabled={locked || selected < 0}
        onClick={() => place(i)} className="flex min-h-11 items-center gap-1 rounded-xl bg-sun-light px-3 disabled:opacity-60">
        <DataIconArt icon={icon} size={23} />{label}
      </button>)}
    </div>
    <section aria-label="Deine Strichliste" className="rounded-2xl bg-white p-3"><TallyTable rows={surveyRows(task, displayed)} /></section>
    {complete && <>
      <label className="grid gap-2">{task.followUp}
        <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} disabled={locked}
          className="w-24 rounded-xl border-2 border-grape p-2 text-center font-display text-2xl"
          value={status === "reveal" ? String(surveyAnswer(task)) : entry}
          onChange={event => { if (/^\d{0,2}$/.test(event.target.value)) setEntry(event.target.value); }} />
      </label>
      <Button type="submit" disabled={locked || !entry}>Umfrage prüfen</Button>
    </>}
  </form>;
}
