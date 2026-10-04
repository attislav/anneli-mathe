"use client";

// „Wer spielt?“: Auswahl, wenn mehrere Kinder auf einem Gerät spielen.
// Jedes Kind hat seinen eigenen Spielstand (siehe state.ts).

import { Plus } from "lucide-react";
import { petStage } from "@/game/collection";
import { sfx } from "@/game/sound";
import { addProfile, profileList, switchProfile } from "@/game/state";
import { StarIcon } from "@/ui/art";
import { useBackdrop } from "@/ui/chrome";
import { Pet } from "@/ui/Pet";

const CARD_COLORS = ["#FFE3F0", "#E4F7EC", "#FFF4D6", "#E1E3FA", "#E3F2FF"];

export function ProfilePicker({ onDone }: { onDone?: () => void }) {
  useBackdrop("#7B4DFF");
  const kids = profileList();

  const choose = (id: string) => {
    sfx.tap();
    switchProfile(id);
    onDone?.();
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-6 bg-grape px-5 py-10 text-white">
      <h1 className="font-display text-4xl font-semibold">Wer spielt?</h1>
      <div className="grid w-full grid-cols-2 gap-3">
        {kids.map((k, i) => (
          <button
            key={k.id}
            onClick={() => choose(k.id)}
            className="chunky flex flex-col items-center gap-1 rounded-[26px] p-3 text-ink"
            style={{ background: CARD_COLORS[i % CARD_COLORS.length], ["--shade" as string]: "#5A2FE0" }}
          >
            <Pet species={k.profile.pet} stage={petStage(k.level)} equipped={k.equipped} size={104} />
            <span className="max-w-full truncate font-display text-2xl font-semibold">{k.profile.name}</span>
            <span className="flex items-center gap-2 text-sm font-extrabold text-ink-soft">
              Level {k.level}
              <span className="flex items-center gap-0.5">
                <StarIcon size={16} /> {k.stars}
              </span>
            </span>
          </button>
        ))}
        <button
          onClick={() => {
            sfx.tap();
            addProfile();
            onDone?.();
          }}
          className="flex min-h-[188px] flex-col items-center justify-center gap-2 rounded-[26px] border-4 border-dashed border-white/50 p-3 font-display text-xl font-semibold text-white"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
            <Plus size={36} />
          </span>
          Neues Kind
        </button>
      </div>
    </main>
  );
}
