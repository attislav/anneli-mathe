"use client";

// Ergebnis einer Lektion: Sterne, Werte, Level-Balken, Truhe zum Antippen.

import { useEffect, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { PASS_SHARE, type Tier } from "@/game/adaptive";
import { petStage } from "@/game/collection";
import type { Reward, SaveState } from "@/game/state";
import { sfx } from "@/game/sound";
import { say } from "@/game/voice";
import type { PathNode, World } from "@/game/worlds";
import { ChestArt, CoinIcon, StarIcon } from "@/ui/art";
import { Button, LinkButton } from "@/ui/Button";
import { Confetti, useBackdrop } from "@/ui/chrome";
import { BossArt } from "@/ui/Creatures";
import { Pet } from "@/ui/Pet";
import { RewardCards } from "@/ui/RewardCards";

export type Outcome = {
  stars: number;
  coins: number;
  xp: number;
  firstTry: number;
  done: number;
  rewards: Reward[];
  levelBefore: number;
  levelAfter: { level: number; into: number; need: number };
  bestStreak: number;
};

const TITLES = ["", "Geschafft!", "Super gemacht!", "Perfekt!"];

export function ResultView({ outcome, node, world, save, onReplay }: { outcome: Outcome; node: PathNode; world: World; tier: Tier; save: SaveState; onReplay: (easier: boolean) => void }) {
  const [open, setOpen] = useState(false);
  useBackdrop("#7B4DFF");
  const levelUp = outcome.levelAfter.level > outcome.levelBefore;
  const page = outcome.rewards.find((r) => r.kind === "page");
  const isBoss = node.kind === "boss";

  useEffect(() => {
    void say(isBoss ? "boss" : levelUp ? "levelup" : `result${outcome.stars}`);
  }, [isBoss, levelUp, outcome.stars]);

  if (outcome.stars === 0 && !isBoss) return <NotYet outcome={outcome} save={save} onReplay={onReplay} />;

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-xl flex-col items-center gap-3 overflow-hidden bg-grape px-4 pb-6 pt-6 text-white">
      <Confetti />
      {isBoss ? (
        <div className="flex flex-col items-center">
          <BossArt world={world.id} color={world.boss.color} size={84} mood="dizzy" />
          <h1 className="font-display text-3xl font-semibold">{world.boss.name} ist besiegt!</h1>
        </div>
      ) : (
        <h1 className="font-display text-4xl font-semibold">{TITLES[outcome.stars]}</h1>
      )}

      <div className="flex items-end gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="anim-pop" style={{ animationDelay: `${0.15 + i * 0.35}s`, marginBottom: i === 1 ? 18 : 0 }}>
            <StarIcon size={i === 1 ? 88 : 68} empty={i >= outcome.stars} />
          </div>
        ))}
      </div>

      <div className="grid w-full grid-cols-3 gap-2.5">
        <Stat icon={<CoinIcon size={26} />} value={`+${outcome.coins}`} label="Münzen" />
        <Stat icon={<Check size={26} strokeWidth={3.5} className="text-leaf" />} value={`${outcome.firstTry} / ${outcome.done}`} label="gleich richtig" />
        <Stat icon={<span className="font-display text-xl text-sky-dark">XP</span>} value={`+${outcome.xp}`} label="Erfahrung" />
      </div>

      <div className="w-full">
        <div className="mb-1.5 flex justify-between text-sm font-extrabold">
          <span>{levelUp ? `Level ${outcome.levelAfter.level} erreicht!` : `Level ${outcome.levelAfter.level}`}</span>
          <span>
            {outcome.levelAfter.into} / {outcome.levelAfter.need}
          </span>
        </div>
        <div className="h-3.5 overflow-hidden rounded-full bg-grape-dark">
          <div className="h-full rounded-full bg-sun transition-all duration-700" style={{ width: `${(outcome.levelAfter.into / outcome.levelAfter.need) * 100}%` }} />
        </div>
      </div>

      {levelUp && save.profile && (
        <div className="anim-pop flex items-center gap-3 rounded-[22px] bg-white/15 px-4 py-2">
          <Pet species={save.profile.pet} stage={petStage(outcome.levelAfter.level)} mood="joy" equipped={save.equipped} size={52} />
          <div className="font-extrabold">
            {save.profile.petName} freut sich mit dir!
            {petStage(outcome.levelAfter.level) > petStage(outcome.levelBefore) && <div className="text-sun">Es ist gewachsen!</div>}
          </div>
        </div>
      )}

      <div className="flex w-full flex-1 flex-col items-center justify-center">
        {!open ? (
          <button
            onClick={() => {
              sfx.chest();
              void say("chest");
              setOpen(true);
            }}
            className="flex flex-col items-center gap-2"
          >
            <ChestArt size={120} className="anim-shake" />
            <span className="font-display text-2xl font-semibold">Tippe auf die Truhe!</span>
          </button>
        ) : (
          <RewardCards rewards={outcome.rewards} />
        )}
      </div>

      <div className="flex w-full flex-col gap-3">
        {open && page && (
          <LinkButton href={`/ausmalen?b=${page.id}`} tone="sun">
            Jetzt ausmalen
          </LinkButton>
        )}
        <div className="flex gap-3">
          <Button tone="white" className="w-20 shrink-0" onClick={() => onReplay(false)} aria-label="Nochmal spielen">
            <RotateCcw size={26} strokeWidth={3} className="text-grape" />
          </Button>
          <LinkButton href="/" tone="white" className="flex-1 !text-grape">
            Weiter
          </LinkButton>
        </div>
      </div>
    </main>
  );
}

/** Nicht geschafft: keine Sterne, keine Truhe — freundlich, und gleich etwas leichter nochmal. */
function NotYet({ outcome, save, onReplay }: { outcome: Outcome; save: SaveState; onReplay: (easier: boolean) => void }) {
  const need = Math.ceil(outcome.done * PASS_SHARE);
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-5 bg-grape px-5 pb-8 pt-8 text-center text-white">
      {save.profile && <Pet species={save.profile.pet} stage={petStage(outcome.levelAfter.level)} mood="think" equipped={save.equipped} size={110} />}
      <h1 className="font-display text-4xl font-semibold">Noch nicht ganz!</h1>
      <div className="flex items-end gap-1.5 opacity-70">
        {[0, 1, 2].map((i) => (
          <StarIcon key={i} size={i === 1 ? 64 : 50} empty />
        ))}
      </div>
      <p className="text-lg font-extrabold">
        {outcome.firstTry} von {outcome.done} gleich richtig.
        <br />
        Für Sterne und die Truhe brauchst du mindestens {need}.
      </p>
      <p className="text-white/85">Lass uns nochmal üben — diesmal etwas leichter. Wenn du nicht weiterweißt, hilft dir die Glühbirne!</p>
      <div className="mt-2 flex w-full flex-col gap-3">
        <Button tone="sun" className="w-full" onClick={() => onReplay(true)}>
          Nochmal üben
        </Button>
        <LinkButton href="/" tone="white" className="w-full !text-grape">
          Zum Pfad
        </LinkButton>
      </div>
    </main>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-[20px] bg-white px-1.5 py-3 text-ink shadow-[0_5px_0_#5A2FE0]">
      <div className="flex h-7 items-center">{icon}</div>
      <div className="font-display text-2xl font-semibold">{value}</div>
      <div className="text-xs font-extrabold text-ink-soft">{label}</div>
    </div>
  );
}
