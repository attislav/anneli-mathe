"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SCHOOL_PATH, SchoolRound } from "@/game/schoolAssignment";
import { ReportPracticeRound } from "@/game/reportPractice";
import { LAB_GROUPS } from "@/game/schoolSelection";
import { Blocks, BusFront, CalendarDays, Check, Cpu, FlaskConical, Grid3X3, ListChecks, Route, ShoppingBasket, SquarePlus, X } from "lucide-react";
import { LAB_TOPICS, LabRound, type LabTopic } from "@/game/lab";
import { TripRound } from "@/game/classTrip";
import { DivisionClinicRound } from "@/game/divisionClinic";
import { ClinicRound } from "@/game/clinic";
import { StrategyRound } from "@/game/strategyPractice";
import { busTime } from "@/game/busTable";
import { fmtMoney } from "@/game/money";
import { activeProfileId, needsProfilePick, useSave } from "@/game/state";
import { TaskView } from "@/lesson/formats";
import { Button } from "@/ui/Button";
import { BottomNav, Splash } from "@/ui/chrome";
import { Onboarding } from "./Onboarding";
import { ProfilePicker } from "./ProfilePicker";
import { SampleVisit } from "@/game/labSamples";
import { LabSamples } from "./LabSamples";
import { PartnerWall } from "./PartnerWall";
import { PartnerSurvey } from "./PartnerSurvey";
import { PartnerTrail } from "./PartnerTrail";
import { lastLabArea, learningGoals, LearningRound, rememberLabArea, type LearningGoal } from "@/game/learningGoals";
import { DrawRoute } from "@/lesson/ChangeRoute";
import { GoalParts } from "@/lesson/GoalParts";
import { LabNoteRound, removeLabNote } from "@/game/labNoteRound";
import type { LabNote } from "@/game/labNotes";
import { ThinkFurther } from "@/lesson/ThinkFurther";
import { thinkFurther } from "@/game/thinkFurther";

const cards = {
  questions: { Icon: ListChecks, color: "bg-grape-light" },
  split: { Icon: Grid3X3, color: "bg-leaf-light" },
  rope: { Icon: Route, color: "bg-sun-light" },
  viewpoint: { Icon: Route, color: "bg-sky-light" },
  packets: { Icon: SquarePlus, color: "bg-grape-light" },
  tiles: { Icon: Blocks, color: "bg-coin-light" },
  survey: { Icon: ListChecks, color: "bg-leaf-light" },
  bus: { Icon: BusFront, color: "bg-sun-light" },
  window: { Icon: Grid3X3, color: "bg-sky-light" },
  detective: { Icon: ListChecks, color: "bg-sky-light" },
  chocolate: { Icon: Grid3X3, color: "bg-coin-light" },
  morning: { Icon: ListChecks, color: "bg-sky-light" },
  claims: { Icon: ListChecks, color: "bg-grape-light" },
  ways: { Icon: Route, color: "bg-leaf-light" },
  methods: { Icon: SquarePlus, color: "bg-coin-light" },
  map: { Icon: Grid3X3, color: "bg-sky-light" },
  juice: { Icon: FlaskConical, color: "bg-coin-light" },
  tower: { Icon: Blocks, color: "bg-sky-light" },
  family: { Icon: SquarePlus, color: "bg-sky-light" },
  clarify: { Icon: ListChecks, color: "bg-grape-light" },
  rest: { Icon: Blocks, color: "bg-coin-light" },
  balance: { Icon: SquarePlus, color: "bg-sky-light" },
  weekly: { Icon: CalendarDays, color: "bg-sky-light" },
  code: { Icon: Cpu, color: "bg-grape-light" },
  receipt: { Icon: ShoppingBasket, color: "bg-coin-light" },
  attributes: { Icon: Grid3X3, color: "bg-grape-light" },
  targetSteps: { Icon: SquarePlus, color: "bg-sky-light" },
  pegs: { Icon: Grid3X3, color: "bg-sun-light" },
  strips: { Icon: Blocks, color: "bg-grape-light" },
  estimateLine: { Icon: Route, color: "bg-sky-light" },
  folds: { Icon: Grid3X3, color: "bg-grape-light" },
  bag: { Icon: ListChecks, color: "bg-sun-light" },
  swap: { Icon: SquarePlus, color: "bg-sky-light" },
  parcels: { Icon: ShoppingBasket, color: "bg-coin-light" },
  fence: { Icon: Grid3X3, color: "bg-leaf-light" },
  wheels: { Icon: ListChecks, color: "bg-sky-light" },
  recipe: { Icon: ShoppingBasket, color: "bg-leaf-light" },
  pictures: { Icon: ListChecks, color: "bg-grape-light" },
  machine: { Icon: Cpu, color: "bg-leaf-light" },
  cubes: { Icon: Blocks, color: "bg-grape-light" },
  shopping: { Icon: ShoppingBasket, color: "bg-coin-light" },
  shops: { Icon: ListChecks, color: "bg-coin-light" },
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
  return <LabMenu key={owner} owner={owner} topics={save.schoolTopics} notes={save.labNotes} />;
}

export function LabMenu({ owner, topics, notes=[] }: { owner: string; topics: LabTopic[]; notes?:LabNote[] }) {
  const [partner, setPartner] = useState<"menu"|"wall"|"survey"|"trail"|null>(null);
  const [visit] = useState(() => new SampleVisit());
  const [size,setSize]=useState<1|5>(5);
  const [area, setArea] = useState(() => lastLabArea(owner));
  const group = LAB_GROUPS[area];
  const [round, setRound] = useState<LabRound | TripRound | LearningRound | LabNoteRound | null>(null);
  const chooseArea = (i: number) => { setArea(i); rememberLabArea(owner,i); };
  const start = (topic: LabTopic, length:1|5) => {
    chooseArea(LAB_GROUPS.findIndex(g => (g.topics as readonly LabTopic[]).includes(topic)));
    setRound(new LabRound(topic, owner,length));
  };
  const startTrip = () => setRound(new TripRound(owner));
  const startGoal = (goal: LearningGoal) => setRound(new LearningRound(owner,goal));
  if (partner === "wall") return <PartnerWall onBack={() => setPartner("menu")} />;
  if (partner === "survey") return <PartnerSurvey onBack={() => setPartner("menu")} />;
  if (partner === "trail") return <PartnerTrail onBack={() => setPartner("menu")} />;
  if (partner === "menu") return <main className="mx-auto grid min-h-dvh max-w-xl content-start gap-3 bg-mist p-5">
    <button className="min-h-11 justify-self-start underline" onClick={()=>setPartner(null)}>← Zum Labor</button>
    <h1 className="font-display text-3xl">Partnerwerkstatt</h1><p>Ein Kind bereitet vor, das andere löst. Danach könnt ihr tauschen.</p>
    <Button onClick={()=>setPartner("wall")}>Meine Zahlenmauer</Button>
    <Button tone="sky" onClick={()=>setPartner("survey")}>Unsere Umfrage</Button>
    <Button tone="white" onClick={()=>setPartner("trail")}>Eine Fehlerspur bauen</Button>
  </main>;
  if (round) return <LabActivity key={round.id} round={round}
    onBack={() => setRound(null)} onReplay={round instanceof LabNoteRound ? () => setRound(null) : round instanceof TripRound ? startTrip : round instanceof LearningRound ? () => startGoal(round.goal) : () => setRound(round.replay())} />;
  return <main className="mx-auto min-h-dvh max-w-xl bg-mist px-4 pb-28 pt-6">
    <header className="mb-5 rounded-3xl bg-leaf-light p-5">
      <div className="flex items-center gap-4"><FlaskConical aria-hidden size={46} className="shrink-0 text-leaf-dark" />
        <div><h1 className="font-display text-4xl">Mathe-Labor</h1>
          <p>Wähle einen Lernbereich und probiere eine Aufgabe aus.</p></div></div>
      <LabSamples visit={visit} size={size} onStart={start} />
    </header>
    {notes.length>0 && <details className="mb-3 rounded-xl bg-white px-3">
      <summary className="cursor-pointer py-3 font-bold">Mein Merkzettel ({notes.length})</summary>
      <ul className="grid gap-2 pb-3">{notes.map(note=><li key={note.topic} className="grid gap-1 rounded-xl border-2 p-1"><button type="button"
        aria-label={LAB_TOPICS[note.topic].title+" auf Stufe "+note.level+" üben"}
        className="grid min-h-11 w-full rounded-xl bg-sky-light p-2 text-left" onClick={()=>setRound(new LabNoteRound(owner,note))}>
        <strong>{LAB_TOPICS[note.topic].title} · Stufe {note.level}</strong><span>{LAB_TOPICS[note.topic].prompt}</span></button>
        <button type="button" className="min-h-11 justify-self-start px-2 underline" aria-label={LAB_TOPICS[note.topic].title+" vom Merkzettel nehmen"}
          onClick={()=>removeLabNote(owner,note)}>Vom Merkzettel nehmen</button></li>)}</ul>
    </details>}
    <Link href={SCHOOL_PATH} className="mb-2 block rounded-2xl bg-grape-light px-4 py-2">
      <span className="font-display text-xl">Mein Schulauftrag</span>
      <span className="ml-2 text-sm">{topics.length ? topics.map(t => LAB_TOPICS[t].title).join(" · ") : "Themen auswählen"}</span>
    </Link>
    <details className="mb-4 rounded-xl bg-white px-3"><summary className="cursor-pointer py-3">Projekte und Hilfen</summary>
      <div className="grid grid-cols-2 gap-1 pb-3">
        <button className="min-h-11 rounded-xl bg-sun-light px-2" onClick={startTrip}>Unser Klassenausflug</button>
        <button className="min-h-11 rounded-xl bg-sky-light px-2" onClick={() => setPartner("menu")}>Partnerwerkstatt</button>
        <Link className="rounded-xl bg-mist p-2 text-center" href="/labor/rechenwege/">Meine Rechenwege</Link>
        <Link className="rounded-xl bg-mist p-2 text-center" href="/labor/sprechstunde/">Mathe-Sprechstunde</Link>
      </div></details>
    <fieldset className="mb-4 grid grid-cols-2 gap-2"><legend className="font-display text-xl">Lernbereich wählen</legend>
      {LAB_GROUPS.map((g,i) => <button key={g.title} type="button" aria-pressed={area===i} onClick={() => chooseArea(i)}
        className={"min-h-12 rounded-xl border-2 px-2 " + (area===i ? "border-grape bg-grape-light" : "border-transparent bg-white")}>{g.title}</button>)}
    </fieldset>
    <section key={group.title} className="mb-5">
      <h2 className="mb-2 font-display text-xl">{group.title}</h2>
      {(Object.keys(learningGoals) as LearningGoal[]).filter(key => learningGoals[key].area === area).map(key =>
        <button key={key} className="mb-3 w-full rounded-2xl bg-sun-light p-3 text-left" onClick={() => startGoal(key)}>
          <strong>{learningGoals[key].title}</strong> · 3 Aufgaben</button>)}
      <fieldset className="mb-2 flex flex-wrap gap-2"><legend className="text-sm font-bold">Umfang für die Einzelthemen</legend>
        {([1,5] as const).map(n=><label key={n} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-white px-3">
          <input type="radio" name="einzelthemen-umfang" checked={size===n} onChange={()=>setSize(n)}/>
          {n===1?"Eine Aufgabe":"Fünf Aufgaben"}</label>)}</fieldset>
      <div className="grid gap-3 min-[380px]:grid-cols-2">
      {group.topics.map(topic => {
        const { Icon, color } = cards[topic];
        const { title, prompt } = LAB_TOPICS[topic];
        return <button key={topic} onClick={() => start(topic,size)}
          className="grid content-start justify-items-start gap-1 rounded-3xl bg-white p-4 text-left shadow-[0_4px_0_#dedbed] focus-visible:outline-4">
          <span className={`mb-1 rounded-2xl p-2.5 ${color}`}><Icon aria-hidden size={28} /></span>
          <span className="font-display text-xl">{title}</span><span className="text-sm text-ink-soft">{prompt}</span>
        </button>;
      })}
      </div>
    </section>
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

export function LabActivity({ round, onBack, onReplay }: { round: LabRound | TripRound | SchoolRound | ClinicRound | DivisionClinicRound | StrategyRound | LearningRound | LabNoteRound; onBack: () => void; onReplay: () => void }) {
  const [state, setState] = useState(round.state);
  const [remembered,setRemembered]=useState("");
  const { task, number, status, firstRight } = state;
  const trip = round instanceof TripRound ? round : null;
  const school = round instanceof SchoolRound ? round : null;
  const clinic = round instanceof ClinicRound || round instanceof DivisionClinicRound;
  const savedStrategy = round instanceof StrategyRound;
  const title = round instanceof LabNoteRound ? LAB_TOPICS[round.note.topic].title : round instanceof LabRound ? LAB_TOPICS[round.topic].title : round instanceof LearningRound ? learningGoals[round.goal].title :
    school ? "Mein Schulauftrag" : clinic ? "Mathe-Sprechstunde" : savedStrategy ? "Mein Rechenweg" : "Unser Klassenausflug";
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
    {school && <ul className="grid gap-1 rounded-2xl bg-white p-4 text-left">
      {[...school.results].map(([topic, right]) => <li key={topic}>{LAB_TOPICS[topic].title}: {right} von 2 beim ersten Versuch</li>)}
    </ul>}
    <p>{title} · {firstRight} von {round.count} {round.count===1?"Aufgabe":"Aufgaben"} gleich beim ersten Versuch gelöst.</p>
    {round instanceof LearningRound && <ThinkFurther key={round.id} item={thinkFurther(round)}/>}
    {round instanceof ReportPracticeRound ? <Button onClick={onBack}>Zum Mathe-Labor</Button> :
      round instanceof LabNoteRound ? <><Button onClick={()=>{round.finish(true);onBack();}}>Auf meinem Merkzettel behalten</Button>
      <Button tone="white" onClick={()=>{round.finish(false);onBack();}}>Abhaken und vom Merkzettel nehmen</Button></> :
      <><Button onClick={onReplay}>{round instanceof LabRound && round.size===1 ? "Noch eine neue Aufgabe zu diesem Thema" : trip ? "Neuen Ausflug planen" : clinic || savedStrategy ? "Mit anderen Zahlen üben" : "Noch eine Runde"}</Button>
    <Button tone="white" onClick={onBack}>{school ? "Auftrag ansehen und ändern" : trip ? "Zurück zum Labor" : clinic ? "Zur Sprechstunde" : savedStrategy ? "Zu meinen Rechenwegen" : "Anderes Thema wählen"}</Button></>}
  </main>;

  return <main className="mx-auto grid min-h-dvh max-w-xl content-start gap-4 bg-mist p-4 pb-10">
    <header className="flex items-center justify-between gap-2">
      <button onClick={onBack} aria-label="Runde beenden und Thema wählen" className="rounded-2xl bg-white p-3"><X aria-hidden /></button>
      <span className="font-display text-xl">{title}</span><span>Aufgabe {number} von {round.count}</span>
    </header>
    <progress value={number - 1} max={round.count} aria-label="Erledigte Aufgaben" className="h-3 w-full accent-green-600" />
    {trip && <TripNote round={trip} completed={number - 1 + Number(status === "right" || status === "reveal")} />}
    <h1 ref={heading} tabIndex={-1} className="font-display text-2xl leading-tight">{task.question}</h1>
    {trip && number === 1 && <table className="rounded-xl bg-white text-center">
      <caption>Fahrplan zum Museum</caption>
      <thead><tr><th scope="col">Bus</th><th scope="col">Abfahrt Schule</th><th scope="col">Ankunft Museum</th></tr></thead>
      <tbody>{trip.plan.timetable.map(bus => <tr key={bus.name}><th scope="row">{bus.name}</th><td>{busTime(bus.departure)}</td><td>{busTime(bus.arrival)}</td></tr>)}</tbody>
    </table>}
    {round instanceof LearningRound && round.goal === "numbers" && number === 1 ?
      <GoalParts key={task.id} status={status} onCheck={(left,right) => setState(round.submitParts(task.id,left,right))} /> :
      round instanceof LearningRound && round.goal === "routes" && number === 1 && task.format === "draw-route" ?
      <DrawRoute key={task.id} task={task} status={status} onRoute={route => setState(round.submitRoute(task.id,route))}
        onAnswer={(correct,hint) => setState(round.answer(task.id,correct,hint))}/> :
      <TaskView key={task.id} task={task} status={status} onAnswer={(correct, hint) => setState(round.answer(task.id, correct, hint))} />}
    {status !== "ask" && <div ref={feedback} tabIndex={-1} className="grid gap-3 rounded-3xl bg-white p-4">
      <h2 className="font-display text-xl">{status === "right" ? "Richtig!" : status === "wrong" ? "Ein Tipp für dich" : "So geht es"}</h2>
      {status !== "right" && <p>{status === "wrong" ? state.hint || task.hint : task.solution}</p>}
      {round instanceof LabRound && (status==="right" || status==="reveal") &&
        <button type="button" className="min-h-11 rounded-xl border-2 px-2" disabled={remembered===task.id}
          onClick={()=>{if(round.remember(task.id))setRemembered(task.id);}}>{remembered===task.id?"Auf deinem Merkzettel":"Das möchte ich nochmal üben"}</button>}
      <Button size="md" onClick={() => setState(round.advance(task.id))}>
        {status === "wrong" ? "Noch einmal versuchen" : number === round.count ? (trip ? "Ausflugsplan ansehen" : "Runde abschließen") : "Nächste Aufgabe"}
      </Button>
    </div>}
  </main>;
}
