"use client";

import { useEffect, useRef, useState } from "react";
import { Blocks, BusFront, CalendarDays, Check, Cpu, FlaskConical, Grid3X3, ListChecks, Route, ShoppingBasket, SquarePlus, X } from "lucide-react";
import { LAB_COUNT, LAB_TOPICS, LabRound, type LabTopic } from "@/game/lab";
import { activeProfileId, needsProfilePick, useSave } from "@/game/state";
import { TaskView } from "@/lesson/formats";
import { Button } from "@/ui/Button";
import { BottomNav, Splash } from "@/ui/chrome";
import { Onboarding } from "./Onboarding";
import { ProfilePicker } from "./ProfilePicker";

const cards = {
  survey: { Icon: ListChecks, color: "bg-leaf-light" },
  bus: { Icon: BusFront, color: "bg-sun-light" },
  window: { Icon: Grid3X3, color: "bg-sky-light" },
  machine: { Icon: Cpu, color: "bg-leaf-light" },
  cubes: { Icon: Blocks, color: "bg-grape-light" },
  shopping: { Icon: ShoppingBasket, color: "bg-coin-light" },
  calendar: { Icon: CalendarDays, color: "bg-sky-light" },
  pairs: { Icon: SquarePlus, color: "bg-rose-light" },
  route: { Icon: Route, color: "bg-sun-light" },
};

export function LabScreen() {
  const save = useSave();
  if (!save) return <Splash />;
  if (needsProfilePick()) return <ProfilePicker />;
  if (!save.profile) return <Onboarding />;
  const owner = activeProfileId();
  return <LabMenu key={owner} owner={owner} />;
}

function LabMenu({ owner }: { owner: string }) {
  const [round, setRound] = useState<LabRound | null>(null);
  const start = (topic: LabTopic) => setRound(new LabRound(topic, owner));
  if (round) return <LabActivity key={round.id} round={round}
    onBack={() => setRound(null)} onReplay={() => start(round.topic)} />;
  return <main className="mx-auto min-h-dvh max-w-xl bg-mist px-4 pb-28 pt-6">
    <header className="mb-5 flex items-center gap-4 rounded-3xl bg-leaf-light p-5">
      <FlaskConical aria-hidden size={46} className="shrink-0 text-leaf-dark" />
      <div><h1 className="font-display text-4xl">Mathe-Labor</h1>
        <p>Wähle ein Thema für fünf Aufgaben.</p></div>
    </header>
    <div className="grid gap-3 min-[380px]:grid-cols-2">
      {(Object.keys(LAB_TOPICS) as LabTopic[]).map(topic => {
        const { Icon, color } = cards[topic];
        const { title, prompt } = LAB_TOPICS[topic];
        return <button key={topic} onClick={() => start(topic)}
          className="grid content-start justify-items-start gap-1 rounded-3xl bg-white p-4 text-left shadow-[0_4px_0_#dedbed] focus-visible:outline-4">
          <span className={`mb-1 rounded-2xl p-2.5 ${color}`}><Icon aria-hidden size={28} /></span>
          <span className="font-display text-xl">{title}</span><span className="text-sm text-ink-soft">{prompt}</span>
        </button>;
      })}
    </div>
    <BottomNav />
  </main>;
}

function LabActivity({ round, onBack, onReplay }: { round: LabRound; onBack: () => void; onReplay: () => void }) {
  const [state, setState] = useState(round.state);
  const { task, number, status, firstRight } = state;
  const title = LAB_TOPICS[round.topic].title;
  const heading = useRef<HTMLHeadingElement>(null);
  const feedback = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (status === "ask" || status === "done") heading.current?.focus();
    else feedback.current?.focus();
  }, [task.id, status]);

  if (status === "done") return <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 bg-leaf-light p-6 text-center">
    <Check aria-hidden className="mx-auto rounded-full bg-white p-3 text-leaf-dark" size={64} />
    <h1 tabIndex={-1} ref={heading} className="font-display text-3xl">Runde beendet!</h1>
    <p>{title} · {firstRight} von {LAB_COUNT} gleich beim ersten Versuch gelöst.</p>
    <Button onClick={onReplay}>Noch eine Runde</Button>
    <Button tone="white" onClick={onBack}>Anderes Thema wählen</Button>
  </main>;

  return <main className="mx-auto grid min-h-dvh max-w-xl content-start gap-4 bg-mist p-4 pb-10">
    <header className="flex items-center justify-between gap-2">
      <button onClick={onBack} aria-label="Runde beenden und Thema wählen" className="rounded-2xl bg-white p-3"><X aria-hidden /></button>
      <span className="font-display text-xl">{title}</span><span>{number} von {LAB_COUNT}</span>
    </header>
    <progress value={number - 1} max={LAB_COUNT} aria-label="Erledigte Aufgaben" className="h-3 w-full accent-green-600" />
    <h1 ref={heading} tabIndex={-1} className="font-display text-2xl leading-tight">{task.question}</h1>
    <TaskView key={task.id} task={task} status={status} onAnswer={(correct, hint) => setState(round.answer(task.id, correct, hint))} />
    {status !== "ask" && <div ref={feedback} tabIndex={-1} className="grid gap-3 rounded-3xl bg-white p-4">
      <h2 className="font-display text-xl">{status === "right" ? "Richtig!" : status === "wrong" ? "Ein Tipp für dich" : "So geht es"}</h2>
      {status !== "right" && <p>{status === "wrong" ? state.hint || task.hint : task.solution}</p>}
      <Button size="md" onClick={() => setState(round.advance(task.id))}>
        {status === "wrong" ? "Noch einmal versuchen" : number === LAB_COUNT ? "Runde abschließen" : "Nächste Aufgabe"}
      </Button>
    </div>}
  </main>;
}
