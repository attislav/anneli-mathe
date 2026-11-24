import { useState } from "react";
import { appointments, eventAt, freeQuarters, names, timeRange, transferFits, validStarts } from "@/game/sharedTime";
import type { SharedTimeTask } from "@/game/types";
import type { FormatProps } from "./formats";
import { Button } from "@/ui/Button";

function Timetable({task, changed, marks, toggle}: {
  task: SharedTimeTask; changed: boolean; marks?: number[]; toggle?: (quarter: number) => void;
}) {
  const calendars = ([0, 1] as const).map(person => appointments(task, person, changed));
  return <table className="w-full text-center text-sm"><caption className="pb-1 font-bold">{changed ? "Geänderter" : "Erster"} Nachmittagsplan</caption>
    <thead><tr><th scope="col">Zeit</th>{names.map(name => <th scope="col" key={name}>{name}</th>)}
      {marks && <th scope="col">Beide frei</th>}</tr></thead>
    <tbody>{Array.from({length:task.slots}, (_, quarter) => <tr key={quarter} className="border-t">
      <th scope="row" className="whitespace-nowrap py-1">{timeRange(task, quarter, 1)}</th>
      {calendars.map((events, person) => <td key={person} className={eventAt(events, quarter) ? "bg-sky-light" : ""}>
        {eventAt(events, quarter)?.name ?? "frei"}</td>)}
      {marks && <td><label className="inline-grid min-h-10 min-w-10 place-items-center"><input type="checkbox" checked={marks.includes(quarter)}
        disabled={!toggle} aria-label={timeRange(task, quarter, 1) + " beide frei"} onChange={() => toggle?.(quarter)} /></label></td>}
    </tr>)}</tbody></table>;
}
export function SharedTime({task, status, onAnswer}: FormatProps<SharedTimeTask>) {
  const [marks, setMarks] = useState<number[]>([]);
  const [stage, setStage] = useState<"mark" | "choose" | "change">("mark");
  const [original, setOriginal] = useState<number | null>(null);
  const [keep, setKeep] = useState<boolean | null>(null);
  const [replacement, setReplacement] = useState<number | null | undefined>(undefined);
  const firstStarts = validStarts(task, false), laterStarts = validStarts(task, true);
  const finished = status === "right" || status === "reveal", locked = status !== "ask";
  const changed = stage === "change" || finished;
  const event = task.plans[task.movedPerson][0];
  const range = (start: number) => timeRange(task, start, task.duration);
  const first = stage === "change" && original !== null ? original : firstStarts[0];
  const final = status === "right" ? (keep ? first : replacement) : laterStarts.includes(first) ? first : laterStarts[0];
  function chooseStart(value: number | null | undefined, select: (start: number) => void) {
    return <div className="flex flex-wrap justify-center gap-2">{Array.from({length:task.slots - task.duration + 1}, (_, start) =>
      <button key={start} type="button" disabled={locked} aria-pressed={value === start}
        className={"min-h-10 rounded-xl border px-2 " + (value === start ? "bg-sky-light font-bold" : "bg-white")}
        onClick={() => select(start)}>{range(start)}</button>)}</div>;
  }
  return <section className="grid gap-3">
    <p>Die beiden möchten <strong>{task.duration * 15} Minuten am Stück</strong> lesen.</p>
    {changed && <p className="rounded-xl bg-sun-light p-2">{names[task.movedPerson]} hat jetzt {event.name} von <b>{timeRange(task, task.movedStart, event.length)}</b> Uhr.
      Vorher war das von {timeRange(task, event.start, event.length)} Uhr.</p>}
    <Timetable task={task} changed={changed} marks={stage === "mark" && !finished ? marks : undefined}
      toggle={locked ? undefined : quarter => setMarks(marks.includes(quarter) ? marks.filter(mark => mark !== quarter) : [...marks, quarter])}/>
    {finished ? <div className="rounded-xl bg-leaf-light p-3"><strong>{status === "right" ? "Deine Vereinbarung" : "So passt es"}</strong>
      <p>{stage === "change" ? "Dein erster Termin" : "Ein möglicher erster Termin"} war {range(first)} Uhr.</p>
      <p>{final == null ? "Im neuen Plan ist keine gemeinsame Lücke lang genug." : (final === first ? "Der Termin bleibt bei " : "Neuer Lesetermin: ") + range(final) + " Uhr."}</p></div> :
      stage === "mark" ? <><p>Markiere jede Viertelstunde, in der beide frei sind.</p><Button disabled={locked} onClick={() => {
        const free = freeQuarters(task, false);
        if (marks.length === free.length && marks.every(mark => free.includes(mark))) setStage("choose");
        else onAnswer(false, "Gehe Zeile für Zeile durch. Steht bei beiden Kindern „frei“? Dann setze dort einen Haken.");
      }}>Freie Zeiten prüfen</Button></> :
      stage === "choose" ? <><p>Wähle euren ersten Lesetermin.</p>{chooseStart(original, setOriginal)}
        <Button disabled={locked || original === null} onClick={() => {
          if (original !== null && firstStarts.includes(original)) setStage("change");
          else onAnswer(false, "Prüfe jede Viertelstunde des gewählten Termins. Beide brauchen die ganze Zeit frei.");
        }}>Termin vereinbaren</Button></> :
      <><p>Dein Termin war <strong>{range(first)} Uhr</strong>. Passt er noch?</p>
        <div className="flex justify-center gap-2">{[true,false].map(choice => <button key={String(choice)} type="button"
          className={"rounded-xl border p-2 " + (keep === choice ? "bg-sky-light font-bold" : "")}
          aria-pressed={keep === choice} disabled={locked} onClick={() => {setKeep(choice);setReplacement(undefined);}}>
          {choice ? "Ja, er bleibt" : "Nein"}</button>)}</div>
        {keep === false && <><p>Welcher Termin passt jetzt?</p>{chooseStart(replacement, setReplacement)}
          <button type="button" aria-pressed={replacement === null} disabled={locked}
            className={"rounded-xl border p-2 " + (replacement === null ? "bg-sky-light font-bold" : "")}
            onClick={() => setReplacement(null)}>Kein Termin passt mehr</button></>}
        <Button disabled={locked || keep === null || (keep === false && replacement === undefined)} onClick={() => {
          if (keep !== null && transferFits(task, first, keep, replacement ?? null)) onAnswer(true);
          else onAnswer(false, "Vergleiche zuerst deinen alten Termin mit dem neuen Plan. Suche danach freie Viertelstunden direkt hintereinander.");
        }}>Vereinbarung prüfen</Button></>}
  </section>;
}
