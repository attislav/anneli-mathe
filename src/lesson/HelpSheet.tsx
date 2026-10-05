"use client";

// Die Erklär-Karte: öffnet sich direkt über der Aufgabe, wenn ein Kind
// feststeckt oder selbst Hilfe will.
//
// Gibt es Kopfrechentricks für genau diese Aufgabe (tricks.ts), stehen die
// vorne — mit den echten Zahlen, zum Durchblättern („Anderer Trick“). Der
// letzte Schritt endet mit „= ?“: rechnen tut das Kind selbst. Die
// allgemeine Erklärung des Themas gibt es darunter zum Aufklappen.
// Ohne passenden Trick: Erklärung Schritt für Schritt, dann der Tipp.

import { useState } from "react";
import { ChevronDown, RefreshCw, Volume2 } from "lucide-react";
import { petStage } from "@/game/collection";
import { explanationFor, type Explanation } from "@/game/explain";
import { jumpsFor } from "@/game/jumps";
import { levelInfo, type SaveState } from "@/game/state";
import { canReadText, readText, stopReading } from "@/game/taskVoice";
import { tricksFor } from "@/game/tricks";
import type { Task } from "@/game/types";
import { Button } from "@/ui/Button";
import { Sheet } from "@/ui/chrome";
import { NumberJump } from "@/ui/NumberJump";
import { Pet } from "@/ui/Pet";

export function HelpSheet({ task, save, showHint, onClose }: { task: Task; save: SaveState; showHint: boolean; onClose: () => void }) {
  const term = "term" in task ? task.term : undefined;
  const ex = explanationFor(task.skillId);
  const tricks = tricksFor(term);
  const jumps = jumpsFor(term);
  const [pick, setPick] = useState(0);
  const [general, setGeneral] = useState(false);

  const close = () => {
    stopReading();
    onClose();
  };

  const trick = tricks[pick % Math.max(1, tricks.length)];

  return (
    <Sheet open onClose={close} tone="bg-sky-light">
      <div className="flex max-h-[78dvh] flex-col gap-3 overflow-y-auto">
        <div className="flex items-end gap-3">
          {save.profile && <Pet species={save.profile.pet} stage={petStage(levelInfo(save.xp).level)} mood="happy" equipped={save.equipped} size={64} />}
          <div className="mb-3 rounded-[18px] rounded-bl-[4px] bg-white px-4 py-2.5 font-extrabold">{tricks.length > 1 ? "Ich kenne da ein paar Tricks!" : "Ich zeig dir, wie es geht!"}</div>
        </div>

        {trick ? (
          <>
            <div className="rounded-[22px] bg-white p-4 shadow-[0_5px_0_#BFE6FA]">
              <div className="text-sm font-extrabold tracking-wider text-sky-dark">{tricks.length > 1 ? `TRICK ${(pick % tricks.length) + 1} VON ${tricks.length}` : "TRICK"}</div>
              <h2 className="font-display text-2xl font-semibold">{trick.title}</h2>
              <Steps key={trick.id} steps={trick.steps} />
              {trick.id === "zehnerpause" && jumps && (
                <div className="mt-2 flex justify-center rounded-[14px] bg-sky-light px-2 pt-1">
                  <NumberJump jumps={jumps} />
                </div>
              )}
            </div>
            {tricks.length > 1 && (
              <button onClick={() => setPick((n) => n + 1)} className="flex items-center justify-center gap-2 rounded-full bg-white py-2.5 font-extrabold text-sky-dark">
                <RefreshCw size={18} strokeWidth={2.6} /> Anderer Trick
              </button>
            )}
            {ex && (
              <button onClick={() => setGeneral((g) => !g)} className="flex items-center justify-center gap-1 text-sm font-extrabold text-ink-soft">
                Allgemein erklärt: {ex.title} <ChevronDown size={16} className={general ? "rotate-180" : ""} />
              </button>
            )}
            {general && ex && <General ex={ex} />}
            <Button tone="leaf" className="w-full" onClick={close}>
              Jetzt probier ich&apos;s!
            </Button>
          </>
        ) : (
          <ExplainFlow ex={ex} hint={showHint ? task.hint : null} jumps={jumps} onDone={close} />
        )}
      </div>
    </Sheet>
  );
}

/** Schritte als nummerierte Liste (mit Vorlese-Knopf, wenn aufgenommen). */
function Steps({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-2 flex flex-col gap-2">
      {steps.map((step, i) => (
        <li key={i} className="anim-pop flex items-center gap-3 text-[17px] leading-snug" style={{ animationDelay: `${i * 0.12}s` }}>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky font-display text-sm font-semibold text-white">{i + 1}</span>
          <span className={`flex-1 ${i === steps.length - 1 ? "font-extrabold" : ""}`}>{step}</span>
          {canReadText(step) && (
            <button aria-label="Vorlesen" onClick={() => void readText(step)} className="text-sky-dark">
              <Volume2 size={20} />
            </button>
          )}
        </li>
      ))}
    </ol>
  );
}

function General({ ex }: { ex: Explanation }) {
  return (
    <div className="rounded-[18px] bg-white/70 p-3">
      {ex.example && <div className="font-display text-xl font-semibold">{ex.example}</div>}
      <Steps steps={ex.steps} />
    </div>
  );
}

/** Ohne Trick: Erklärung zum Durchtippen, dann der Tipp zur eigenen Aufgabe. */
function ExplainFlow({ ex, hint, jumps, onDone }: { ex: Explanation | null; hint: string | null; jumps: ReturnType<typeof jumpsFor>; onDone: () => void }) {
  const steps = ex?.steps ?? [];
  const [shown, setShown] = useState(1);
  const all = shown >= steps.length;
  return (
    <>
      {ex && (
        <>
          <h2 className="font-display text-2xl font-semibold">{ex.title}</h2>
          {ex.example && <div className="rounded-[22px] bg-white py-3 text-center font-display text-3xl font-semibold shadow-[0_5px_0_#BFE6FA]">{ex.example}</div>}
          <div className="rounded-[18px] bg-white p-3">
            <Steps steps={steps.slice(0, shown)} />
          </div>
        </>
      )}
      {all && hint && (
        <div className="anim-pop rounded-[18px] border-4 border-[#FFB648] bg-[#FFF1DB] p-3">
          <div className="font-display text-lg font-semibold text-[#8A4B00]">Bei deiner Aufgabe:</div>
          <div className="text-[17px] leading-snug text-[#6B3A00]">{hint}</div>
          {jumps && (
            <div className="mt-2 flex justify-center rounded-[14px] bg-white px-2 pt-1">
              <NumberJump jumps={jumps} />
            </div>
          )}
        </div>
      )}
      {all ? (
        <Button tone="leaf" className="w-full" onClick={onDone}>
          Jetzt probier ich&apos;s!
        </Button>
      ) : (
        <Button tone="sky" className="w-full" onClick={() => setShown((n) => n + 1)}>
          Weiter
        </Button>
      )}
    </>
  );
}
