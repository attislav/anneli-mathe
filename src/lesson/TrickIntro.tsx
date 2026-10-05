"use client";

// Ein Rechentrick, Schritt für Schritt zum Durchtippen — dann geht's los.

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { petStage } from "@/game/collection";
import type { Trick } from "@/game/skills";
import { levelInfo, type SaveState } from "@/game/state";
import { DEVICE_VOICE, speak } from "@/game/speech";
import { say } from "@/game/voice";
import { Button, LinkButton } from "@/ui/Button";
import { Pet } from "@/ui/Pet";
import { useBackdrop } from "@/ui/chrome";

export function TrickIntro({ trick, save, onDone }: { trick: Trick; save: SaveState; onDone: () => void }) {
  const [shown, setShown] = useState(1);
  useBackdrop("#E3F5FF");
  const all = shown >= trick.steps.length;

  useEffect(() => {
    void say("trick");
  }, []);

  useEffect(() => {
    if (save.settings.autoRead) speak(trick.steps[shown - 1]);
  }, [shown, trick, save.settings.autoRead]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-5 bg-sky-light px-4 pb-8 pt-6">
      <LinkButton href="/" tone="white" size="md" className="self-start !h-11 !px-4 !text-base">
        Zurück
      </LinkButton>
      <div className="flex items-end gap-3">
        {save.profile && <Pet species={save.profile.pet} stage={petStage(levelInfo(save.xp).level)} mood="joy" equipped={save.equipped} size={84} />}
        <div className="mb-4 rounded-[18px] rounded-bl-[4px] bg-white px-4 py-3 font-extrabold">Ich zeig dir einen Trick!</div>
      </div>
      <div>
        <div className="text-sm font-extrabold tracking-wider text-sky-dark">RECHENTRICK</div>
        <h1 className="font-display text-3xl font-semibold">{trick.title}</h1>
      </div>
      <div className="rounded-[28px] bg-white py-6 text-center font-display text-6xl font-semibold shadow-[0_6px_0_#BFE6FA]">{trick.example}</div>
      <ol className="flex flex-col gap-3">
        {trick.steps.slice(0, shown).map((step, i) => (
          <li key={i} className="anim-pop flex items-center gap-3 rounded-[20px] bg-white p-4 text-lg">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky font-display text-lg font-semibold text-white">{i + 1}</span>
            <span className="flex-1">{step}</span>
            {DEVICE_VOICE && (
              <button aria-label="Vorlesen" onClick={() => speak(step)} className="text-sky-dark">
                <Volume2 size={22} />
              </button>
            )}
          </li>
        ))}
      </ol>
      <div className="mt-auto">
        {all ? (
          <Button tone="leaf" className="w-full" onClick={onDone}>
            Ausprobieren!
          </Button>
        ) : (
          <Button tone="sky" className="w-full" onClick={() => setShown((n) => n + 1)}>
            Und dann?
          </Button>
        )}
      </div>
    </main>
  );
}
