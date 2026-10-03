"use client";

// Abzeichen als Medaillen: Band oben, runde Plakette mit Bild.
// Noch nicht erreicht: grau, mit Fortschrittsbalken.

import { useState } from "react";
import { BookOpen, CircleCheck, Crown, Flame, Gamepad2, Gem, Palette, PawPrint, PiggyBank, Star, Sticker, Sunrise, Target, Trophy } from "lucide-react";
import { BADGES, isEarned, type Badge, type BadgeIcon, type BadgeTier } from "@/game/badges";
import type { SaveState } from "@/game/state";
import { Sheet } from "./chrome";

const ICONS: Record<BadgeIcon, typeof Star> = {
  star: Star,
  crown: Crown,
  book: BookOpen,
  check: CircleCheck,
  flame: Flame,
  sticker: Sticker,
  gem: Gem,
  palette: Palette,
  paw: PawPrint,
  game: Gamepad2,
  piggy: PiggyBank,
  trophy: Trophy,
  sunrise: Sunrise,
  target: Target,
};

const TIER: Record<BadgeTier, { face: string; rim: string; ribbon: string }> = {
  bronze: { face: "#F4B183", rim: "#C9773F", ribbon: "#4CC3FF" },
  silber: { face: "#E3E8F0", rim: "#9AA6B8", ribbon: "#7B4DFF" },
  gold: { face: "#FFE066", rim: "#E5A100", ribbon: "#FF5D9E" },
};

export function BadgeMedal({ badge, earned, size = 72 }: { badge: Badge; earned: boolean; size?: number }) {
  const t = earned ? TIER[badge.tier] : { face: "#E3E8F0", rim: "#C2CAD6", ribbon: "#C2CAD6" };
  const Icon = ICONS[badge.icon];
  return (
    <div className="relative" style={{ width: size, height: size * 1.15 }}>
      <svg viewBox="0 0 100 115" width={size} height={size * 1.15} aria-hidden="true" className="absolute inset-0">
        <path d="M30 0 H48 L40 40 H22 Z" fill={t.ribbon} />
        <path d="M70 0 H52 L60 40 H78 Z" fill={t.ribbon} opacity="0.8" />
        <circle cx="50" cy="68" r="44" fill={t.rim} />
        <circle cx="50" cy="68" r="36" fill={t.face} />
      </svg>
      <Icon className="absolute left-1/2 -translate-x-1/2" style={{ top: size * 0.42, color: earned ? t.rim : "#9AA6B8" }} size={size * 0.38} strokeWidth={2.4} />
    </div>
  );
}

export function BadgesSection({ save }: { save: SaveState }) {
  const [open, setOpen] = useState<Badge | null>(null);
  const earned = BADGES.filter((b) => isEarned(save, b)).length;
  return (
    <div className="mt-4 rounded-[24px] bg-white p-4">
      <div className="flex items-baseline justify-between">
        <div className="font-display text-2xl font-semibold">Abzeichen</div>
        <div className="font-extrabold text-ink-soft">
          {earned} / {BADGES.length}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-x-2 gap-y-3 sm:grid-cols-5">
        {BADGES.map((b) => {
          const ok = isEarned(save, b);
          return (
            <button key={b.id} onClick={() => setOpen(b)} className="flex flex-col items-center gap-1" aria-label={`${b.title}${ok ? "" : " (noch nicht)"}`}>
              <BadgeMedal badge={b} earned={ok} size={58} />
              <span className={`text-center text-[11px] font-extrabold leading-tight ${ok ? "text-ink" : "text-ink-soft/70"}`}>{b.title}</span>
            </button>
          );
        })}
      </div>
      {open && (
        <Sheet open onClose={() => setOpen(null)}>
          <BadgeDetail badge={open} save={save} />
        </Sheet>
      )}
    </div>
  );
}

function BadgeDetail({ badge, save }: { badge: Badge; save: SaveState }) {
  const ok = isEarned(save, badge);
  const [have, need] = badge.progress(save);
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <BadgeMedal badge={badge} earned={ok} size={110} />
      <h2 className="font-display text-2xl font-semibold">{badge.title}</h2>
      <p className="text-ink-soft">{badge.desc}</p>
      {ok ? (
        <p className="font-extrabold text-leaf-dark">Geschafft!</p>
      ) : (
        <div className="w-full max-w-xs">
          <div className="h-3 overflow-hidden rounded-full bg-mist">
            <div className="h-full rounded-full bg-grape" style={{ width: `${(have / need) * 100}%` }} />
          </div>
          <div className="mt-1 text-sm font-extrabold text-ink-soft">
            {have} / {need}
          </div>
        </div>
      )}
    </div>
  );
}
