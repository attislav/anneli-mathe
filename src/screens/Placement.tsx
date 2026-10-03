"use client";

// Einstufungs-Abenteuer im Onboarding: das Haustier wandert von Welt zu
// Welt, solange die Aufgaben klappen. Keine Tipps, kein „falsch" — nur
// „Weiter". Am Ende steht fest, wo die Reise beginnt.

import { useState } from "react";
import { placementAnswer, placementTask, startPlacement, type PlacementState } from "@/game/placement";
import { sfx } from "@/game/sound";
import type { PetSpecies } from "@/game/collection";
import type { Task } from "@/game/types";
import { WORLDS } from "@/game/worlds";
import { TaskView, type Status } from "@/lesson/formats";
import { Button } from "@/ui/Button";
import { Pet } from "@/ui/Pet";

export function Placement({ species, onDone }: { species: PetSpecies; onDone: (startIndex: number) => void }) {
  const [state, setState] = useState<PlacementState>(startPlacement);
  const [task, setTask] = useState<Task>(() => placementTask(startPlacement()));
  const [status, setStatus] = useState<Status>("ask");

  const onAnswer = (correct: boolean) => {
    if (status !== "ask") return;
    if (correct) sfx.correct();
    else sfx.tap();
    setStatus(correct ? "right" : "reveal");
    const next = placementAnswer(state, correct);
    setTimeout(() => {
      setState(next);
      if (next.start !== null) return;
      if (next.world !== state.world) sfx.chest();
      setTask(placementTask(next));
      setStatus("ask");
    }, 900);
  };

  if (state.start !== null) {
    const world = WORLDS[state.start];
    return (
      <div className="flex w-full flex-col items-center gap-5 text-center">
        <Pet species={species} mood="joy" size={140} className="anim-pop" />
        <h1 className="font-display text-3xl font-semibold">Super gemacht!</h1>
        <p className="text-xl">
          Eure Reise beginnt {state.start === 0 ? "auf der" : "im"}
          <br />
          <span className="font-display text-3xl font-semibold text-sun">{world.name}</span>
        </p>
        {state.start > 0 && <p className="text-white/85">Die Welten davor stehen dir trotzdem offen — zum Wiederholen und Sterne sammeln.</p>}
        <Button tone="sun" className="w-full max-w-sm" onClick={() => onDone(state.start!)}>
          Los geht&apos;s!
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-3">
        <Pet species={species} size={56} className="anim-bob" />
        <div className="flex flex-1 gap-1.5">
          {WORLDS.map((w, i) => (
            <div key={w.id} className="h-3 flex-1 rounded-full" style={{ background: i < state.world ? "#FFC531" : i === state.world ? "#fff" : "rgba(255,255,255,0.25)" }} />
          ))}
        </div>
      </div>
      <div className="text-left">
        <div className="text-sm font-extrabold tracking-wider text-white/75">{WORLDS[state.world].name.toUpperCase()}</div>
        <h1 className="font-display text-[1.6rem] font-semibold leading-tight">{task.question}</h1>
      </div>
      <div className="rounded-[28px] bg-mist p-3 text-ink">
        <TaskView key={task.id} task={task} status={status} onAnswer={onAnswer} />
      </div>
      <button onClick={() => onAnswer(false)} disabled={status !== "ask"} className="self-center font-extrabold text-white/80 underline">
        Weiß ich noch nicht
      </button>
    </div>
  );
}
