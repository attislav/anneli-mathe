"use client";

// Adventskalender: 24 Türchen auf einem Winterhimmel. Heute fällige
// Türchen wackeln. In der Eltern-Vorschau steht auf jedem, was drin ist.

import { useState } from "react";
import { ChevronLeft, Coins, Image as ImageIcon, Sparkles, Sticker } from "lucide-react";
import Link from "next/link";
import { canOpen, DOOR_ORDER, doorLabel, doorPlan, openDoor, openedDoors } from "@/game/advent";
import { adventDay } from "@/game/season";
import { sfx } from "@/game/sound";
import type { Reward, SaveState } from "@/game/state";
import { Button } from "@/ui/Button";
import { Confetti, Sheet, useBackdrop } from "@/ui/chrome";
import { RewardCards } from "@/ui/RewardCards";

const DOOR_COLORS = [
  ["#E5484D", "#B33035"],
  ["#2BB673", "#1E8F57"],
  ["#E5A100", "#B07A00"],
  ["#5B6BD6", "#3E4CB0"],
];

function PlanIcon({ n }: { n: number }) {
  const p = doorPlan(n);
  const Icon = p.kind === "coins" ? Coins : p.kind === "sticker" ? Sticker : p.kind === "page" ? ImageIcon : Sparkles;
  return <Icon size={22} strokeWidth={2.4} />;
}

export function AdventScreen({ save, preview }: { save: SaveState; preview: boolean }) {
  useBackdrop("#1B2050");
  const [got, setGot] = useState<{ n: number; rewards: Reward[] } | null>(null);
  const today = adventDay();
  const opened = openedDoors(save);

  return (
    <main className="mx-auto min-h-dvh max-w-xl bg-[#1B2050] px-4 pb-12 pt-5 text-white">
      <div className="flex items-center gap-3">
        <Link href={preview ? "/ich/" : "/"} aria-label="Zurück" className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/10">
          <ChevronLeft size={26} />
        </Link>
        <h1 className="font-display text-3xl font-semibold">Adventskalender</h1>
      </div>
      <p className="mt-2 text-white/80">
        {preview ? "Eltern-Vorschau: So ist der Kalender gefüllt." : today === 0 ? "Ab dem 1. Dezember öffnet sich jeden Tag ein Türchen." : `Heute ist der ${today}. Dezember. Verpasste Türchen darfst du nachholen!`}
      </p>

      <div className="mt-5 grid grid-cols-4 gap-2.5">
        {DOOR_ORDER.map((n, i) => {
          const isOpen = opened.includes(n);
          const ready = !preview && canOpen(save, n);
          const [bg, shade] = DOOR_COLORS[i % DOOR_COLORS.length];
          if (isOpen || preview) {
            return (
              <div key={n} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[18px] border-2 border-dashed border-white/30 bg-white/5 p-1 text-center">
                <span className="font-display text-lg font-semibold text-white/70">{n}</span>
                <span className="text-sun">
                  <PlanIcon n={n} />
                </span>
                {preview && <span className="text-[9px] font-extrabold leading-tight text-white/70">{doorLabel(n)}</span>}
              </div>
            );
          }
          return (
            <button
              key={n}
              disabled={!ready}
              aria-label={`Türchen ${n}${ready ? "" : " (noch zu)"}`}
              onClick={() => {
                const rewards = openDoor(n);
                if (rewards.length) {
                  sfx.chest();
                  setGot({ n, rewards });
                }
              }}
              className={`chunky relative flex aspect-square items-center justify-center rounded-[18px] font-display text-3xl font-semibold ${ready ? "anim-wiggle" : "opacity-80"}`}
              style={{ background: bg, ["--shade" as string]: shade, ["--depth" as string]: "5px" }}
            >
              {n}
              {ready && <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-sun ring-2 ring-[#1B2050]" />}
            </button>
          );
        })}
      </div>

      {got && (
        <>
          <Confetti />
          <Sheet open onClose={() => setGot(null)} tone="bg-grape">
            <div className="flex flex-col items-center gap-4 text-white">
              <h2 className="font-display text-3xl font-semibold">Türchen {got.n}</h2>
              <RewardCards rewards={got.rewards} />
              <Button tone="sun" className="w-full" onClick={() => setGot(null)}>
                Juhu!
              </Button>
            </div>
          </Sheet>
        </>
      )}
    </main>
  );
}
