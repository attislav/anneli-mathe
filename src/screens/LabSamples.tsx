import { useState } from "react";
import { LAB_TOPICS } from "@/game/lab";
import { areaSamples, sampleAction, SampleVisit, sampleFeedback, type SampleArea } from "@/game/labSamples";
import { LAB_GROUPS, type LabTopic } from "@/game/schoolSelection";
import { Button } from "@/ui/Button";

export function LabSamples({ visit, onStart }: { visit: SampleVisit; onStart: (topic: LabTopic) => void }) {
  const [open, setOpen] = useState(false);
  const [area, setArea] = useState<SampleArea | null>(null);
  const [sample, setSample] = useState<ReturnType<SampleVisit["next"]> | null>(null);
  const [answer, setAnswer] = useState<string | null | undefined>();
  function next(group: SampleArea) {
    setArea(group); setSample(visit.next(group)); setAnswer(undefined);
  }
  const option = "min-h-11 rounded-xl border-2 border-leaf-light bg-white px-3 py-2 text-left";
  return <div className="mt-3">
    <button type="button" aria-expanded={open} className="min-h-11 rounded-xl bg-white px-3 font-display" onClick={() => setOpen(!open)}>
      Was möchte ich üben?</button>
    {open && <section className="mt-2 grid gap-2 rounded-xl bg-white/75 p-3">
      {!area ? <>
        <p>Wähle einen Bereich und probiere eine kurze Aufgabe aus.</p>
        <div className="grid gap-1 sm:grid-cols-2">{LAB_GROUPS.map(group =>
          <button type="button" className={option} key={group.title} onClick={() => setArea(group.title)}>{group.title}</button>)}</div>
      </> : !sample ? <>
        <h2 className="font-display text-xl">{area}</h2><p>Was möchtest du ausprobieren?</p>
        {areaSamples(area).map(item => <button type="button" key={item.topic} className={option} onClick={() => {
          setSample(visit.choose(area, item)); setAnswer(undefined);
        }}>{sampleAction[item.topic]}</button>)}
        <button type="button" className={option} onClick={() => setArea(null)}>Zur Bereichswahl</button>
      </> : <>
        <h2 className="font-display text-xl">{sample.question}</h2>
        {sample.picture && <div role="img" aria-label={sample.picture.label} className="grid justify-self-start gap-1 rounded-xl bg-white p-2">
          {sample.picture.rows.map((row, i) => <div aria-hidden="true" key={i} className="flex gap-1">
            {row.map((cell, j) => <span className="min-w-6 rounded bg-sky-light px-1 text-center" key={j}>{cell}</span>)}</div>)}</div>}
        {answer === undefined ? <>
          <div className="flex flex-wrap gap-1">{sample.options.map(word =>
            <button type="button" className={option} key={word} onClick={() => setAnswer(word)}>{word}</button>)}</div>
          <button type="button" className="min-h-11 justify-self-start underline" onClick={() => setAnswer(null)}>Weiß ich noch nicht</button>
        </> : <>
          <p aria-live="polite">{sampleFeedback(sample, answer)}</p>
          <p className="text-sm">{LAB_TOPICS[sample.topic].title} · 5 Aufgaben</p>
          <Button onClick={() => onStart(sample.topic)}>Damit weiterüben</Button>
        </>}
        <div className="flex flex-wrap gap-2">
          <button type="button" className={option} onClick={() => next(area)}>Andere Probe</button>
          <button type="button" className={option} onClick={() => { setArea(null); setSample(null); }}>Zur Bereichswahl</button>
        </div>
      </>}
    </section>}
  </div>;
}
