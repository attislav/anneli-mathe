"use client";

import { useEffect, useRef, useState } from "react";
import { Blocks, BusFront, CalendarDays, Check, Cpu, FlaskConical, Grid3X3, ListChecks, Route, ShoppingBasket, SquarePlus, X } from "lucide-react";
import { LAB_TOPICS, LabRound, type LabTopic } from "@/game/lab";
import { TripRound } from "@/game/classTrip";
import { busTime } from "@/game/busTable";
import { fmtMoney } from "@/game/money";
import { activeProfileId, needsProfilePick, useSave } from "@/game/state";
import { TaskView } from "@/lesson/formats";
import { Button } from "@/ui/Button";
import { BottomNav, Splash } from "@/ui/chrome";
import { Onboarding } from "./Onboarding";
import { ProfilePicker } from "./ProfilePicker";

const cards = {
  tiles: { Icon: Blocks, color: "bg-coin-light" },
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
  const [round, setRound] = useState<LabRound | TripRound | null>(null);
  const start = (topic: LabTopic) => setRound(new LabRound(topic, owner));
  const startTrip = () => setRound(new TripRound(owner));
  if (round) return <LabActivity key={round.id} round={round}
    onBack={() => setRound(null)} onReplay={round instanceof TripRound ? startTrip : () => start(round.topic)} />;
  return <main className="mx-auto min-h-dvh max-w-xl bg-mist px-4 pb-28 pt-6">
    <header className="mb-5 flex items-center gap-4 rounded-3xl bg-leaf-light p-5">
      <FlaskConical aria-hidden size={46} className="shrink-0 text-leaf-dark" />
      <div><h1 className="font-display text-4xl">Mathe-Labor</h1>
        <p>Wähle ein Projekt oder übe ein Thema mit fünf Aufgaben.</p></div>
    </header>
    <button onClick={startTrip} className="mb-4 flex w-full items-center gap-3 rounded-3xl bg-sun-light p-4 text-left">
      <BusFront aria-hidden size={36} className="shrink-0" />
      <span><span className="block font-display text-2xl">Unser Klassenausflug</span>Plane Bus, Wartezeit und Picknick.</span>
    </button>
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

function TripNote({ round, completed }: { round: TripRound; completed: number }) {
  const { appointment, chosen, wait, budget, snacks } = round.plan;
  return <section aria-label="Ausflugszettel" className="grid gap-1 rounded-2xl bg-sun-light p-4 text-left">
    <h2 className="font-display text-xl">Unser Ausflugszettel</h2>
    <p>Führung im Museum um {busTime(appointment)} Uhr</p>
    {completed >= 1 && <p>{chosen.name} · Schule {busTime(chosen.departure)} → Museum {busTime(chosen.arrival)} Uhr</p>}
    {completed >= 2 && <p>Wartezeit am Museum: {wait} Minuten</p>}
    {completed >= 3 && <p>Picknick: {snacks.join(" und ")} für {fmtMoney(budget)}</p>}
  </section>;
}

function LabActivity({ round, onBack, onReplay }: { round: LabRound | TripRound; onBack: () => void; onReplay: () => void }) {
  const [state, setState] = useState(round.state);
  const { task, number, status, firstRight } = state;
  const trip = round instanceof TripRound ? round : null;
  const title = round instanceof LabRound ? LAB_TOPICS[round.topic].title : "Unser Klassenausflug";
  const heading = useRef<HTMLHeadingElement>(null);
  const feedback = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (status === "ask" || status === "done") heading.current?.focus();
    else feedback.current?.focus();
  }, [task.id, status]);

  if (status === "done") return <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 bg-leaf-light p-6 text-center">
    <Check aria-hidden className="mx-auto rounded-full bg-white p-3 text-leaf-dark" size={64} />
    <h1 tabIndex={-1} ref={heading} className="font-display text-3xl">{trip ? "Euer Ausflug ist geplant!" : "Runde beendet!"}</h1>
    {trip && <TripNote round={trip} completed={round.count} />}
    <p>{title} · {firstRight} von {round.count} gleich beim ersten Versuch gelöst.</p>
    <Button onClick={onReplay}>{trip ? "Neuen Ausflug planen" : "Noch eine Runde"}</Button>
    <Button tone="white" onClick={onBack}>{trip ? "Zurück zum Labor" : "Anderes Thema wählen"}</Button>
  </main>;

  return <main className="mx-auto grid min-h-dvh max-w-xl content-start gap-4 bg-mist p-4 pb-10">
    <header className="flex items-center justify-between gap-2">
      <button onClick={onBack} aria-label="Runde beenden und Thema wählen" className="rounded-2xl bg-white p-3"><X aria-hidden /></button>
      <span className="font-display text-xl">{title}</span><span>{number} von {round.count}</span>
    </header>
    <progress value={number - 1} max={round.count} aria-label="Erledigte Aufgaben" className="h-3 w-full accent-green-600" />
    {trip && <TripNote round={trip} completed={number - 1 + Number(status === "right" || status === "reveal")} />}
    <h1 ref={heading} tabIndex={-1} className="font-display text-2xl leading-tight">{task.question}</h1>
    {trip && number === 1 && <table className="rounded-xl bg-white text-center">
      <caption>Fahrplan zum Museum</caption>
      <thead><tr><th scope="col">Bus</th><th scope="col">Abfahrt Schule</th><th scope="col">Ankunft Museum</th></tr></thead>
      <tbody>{trip.plan.timetable.map(bus => <tr key={bus.name}><th scope="row">{bus.name}</th><td>{busTime(bus.departure)}</td><td>{busTime(bus.arrival)}</td></tr>)}</tbody>
    </table>}
    <TaskView key={task.id} task={task} status={status} onAnswer={(correct, hint) => setState(round.answer(task.id, correct, hint))} />
    {status !== "ask" && <div ref={feedback} tabIndex={-1} className="grid gap-3 rounded-3xl bg-white p-4">
      <h2 className="font-display text-xl">{status === "right" ? "Richtig!" : status === "wrong" ? "Ein Tipp für dich" : "So geht es"}</h2>
      {status !== "right" && <p>{status === "wrong" ? state.hint || task.hint : task.solution}</p>}
      <Button size="md" onClick={() => setState(round.advance(task.id))}>
        {status === "wrong" ? "Noch einmal versuchen" : number === round.count ? (trip ? "Ausflugsplan ansehen" : "Runde abschließen") : "Nächste Aufgabe"}
      </Button>
    </div>}
  </main>;
}
