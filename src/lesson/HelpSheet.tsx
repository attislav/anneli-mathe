"use client";

// Die Erklär-Karte: öffnet sich direkt über der Aufgabe, wenn ein Kind
// feststeckt oder selbst Hilfe will. Erst die Regel Schritt für Schritt zum
// Durchtippen, dann ein Tipp mit den Zahlen der eigenen Aufgabe — aber nicht
// die Lösung. Danach probiert das Kind selbst weiter.

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { petStage } from "@/game/collection";
import { explanationFor } from "@/game/explain";
import { levelInfo, type SaveState } from "@/game/state";
import { canReadText, readText, stopReading } from "@/game/taskVoice";
import type { Task } from "@/game/types";
import { Button } from "@/ui/Button";
import { Sheet } from "@/ui/chrome";
import { Pet } from "@/ui/Pet";

export function HelpSheet({ task, save, showHint, onClose }: { task: Task; save: SaveState; showHint: boolean; onClose: () => void }) {
  const ex = explanationFor(task.skillId);
  const steps = ex?.steps ?? [];
  const [shown, setShown] = useState(1);
  const all = shown >= steps.length;

  const close = () => {
    stopReading();
    onClose();
  };

  return (
    <Sheet open onClose={close} tone="bg-sky-light">
      <div className="flex max-h-[75dvh] flex-col gap-3 overflow-y-auto">
        <div className="flex items-end gap-3">
          {save.profile && <Pet species={save.profile.pet} stage={petStage(levelInfo(save.xp).level)} mood="happy" equipped={save.equipped} size={64} />}
          <div className="mb-3 rounded-[18px] rounded-bl-[4px] bg-white px-4 py-2.5 font-extrabold">Ich zeig dir, wie es geht!</div>
        </div>

        {ex && (
          <>
            <h2 className="font-display text-2xl font-semibold">{ex.title}</h2>
            {ex.example && <div className="rounded-[22px] bg-white py-3 text-center font-display text-3xl font-semibold shadow-[0_5px_0_#BFE6FA]">{ex.example}</div>}
            <ol className="flex flex-col gap-2">
              {steps.slice(0, shown).map((step, i) => (
                <li key={i} className="anim-pop flex items-center gap-3 rounded-[18px] bg-white p-3 text-[17px] leading-snug">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky font-display text-base font-semibold text-white">{i + 1}</span>
                  <span className="flex-1">{step}</span>
                  {canReadText(step) && (
                    <button aria-label="Vorlesen" onClick={() => void readText(step)} className="text-sky-dark">
                      <Volume2 size={20} />
                    </button>
                  )}
                </li>
              ))}
            </ol>
          </>
        )}

        {all && showHint && (
          <div className="anim-pop rounded-[18px] border-4 border-[#FFB648] bg-[#FFF1DB] p-3">
            <div className="font-display text-lg font-semibold text-[#8A4B00]">Bei deiner Aufgabe:</div>
            <div className="text-[17px] leading-snug text-[#6B3A00]">{task.hint}</div>
          </div>
        )}

        {all ? (
          <Button tone="leaf" className="w-full" onClick={close}>
            Jetzt probier ich&apos;s!
          </Button>
        ) : (
          <Button tone="sky" className="w-full" onClick={() => setShown((n) => n + 1)}>
            Weiter
          </Button>
        )}
      </div>
    </Sheet>
  );
}
