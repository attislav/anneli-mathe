"use client";

// Rahmen-Bausteine: Kopfzeile mit Werten, untere Navigation, Bottom-Sheet,
// Konfetti, Lade-Bildschirm.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Gamepad2, Map as MapIcon, Smile } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { levelInfo, streak, totalStars, type SaveState } from "@/game/state";
import { petStage } from "@/game/collection";
import { CoinIcon, FlameIcon, StarIcon } from "./art";
import { Pet } from "./Pet";

export function Pill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex items-center gap-1.5 rounded-full py-1.5 pl-2 pr-3 font-display text-lg font-semibold ${className}`}>{children}</div>;
}

export function TopBar({ save }: { save: SaveState }) {
  const { level } = levelInfo(save.xp);
  const days = streak(save);
  const playedToday = save.today.lessons > 0;
  return (
    <header className="sticky top-0 z-30 mx-auto flex max-w-xl h-[68px] items-center justify-between rounded-b-[26px] bg-white px-3.5 shadow-[0_4px_0_rgba(31,35,71,0.08)]">
      <Link href="/ich" aria-label="Mein Haustier und Profil" className="relative flex h-12 w-12 items-center justify-center rounded-full bg-rose-light">
        {save.profile && <Pet species={save.profile.pet} stage={petStage(level)} equipped={save.equipped} size={44} />}
        <span className="absolute -bottom-1 -right-1 flex h-[22px] min-w-[22px] items-center justify-center rounded-full border-2 border-white bg-grape px-1 font-display text-[13px] font-semibold text-white">{level}</span>
      </Link>
      <div className="flex gap-2">
        <Pill className="bg-sun-light">
          <StarIcon size={22} />
          {totalStars(save)}
        </Pill>
        <Pill className="bg-coin-light">
          <CoinIcon size={22} />
          {save.coins}
        </Pill>
        <Pill className={playedToday ? "bg-[#FFE4DE]" : "bg-cloud"}>
          <FlameIcon size={22} off={!playedToday} />
          {days}
        </Pill>
      </div>
    </header>
  );
}

const NAV = [
  { href: "/", label: "Pfad", Icon: MapIcon, tint: "text-grape", bg: "bg-grape-light" },
  { href: "/sammeln", label: "Sammeln", Icon: BookOpen, tint: "text-coin-dark", bg: "bg-coin-light" },
  { href: "/spielen", label: "Spielen", Icon: Gamepad2, tint: "text-night", bg: "bg-[#E1E3FA]" },
  { href: "/ich", label: "Ich", Icon: Smile, tint: "text-rose-dark", bg: "bg-rose-light" },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto grid h-[78px] max-w-xl grid-cols-4 items-center rounded-t-[26px] bg-white px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_0_rgba(31,35,71,0.06)]">
      {NAV.map(({ href, label, Icon, tint, bg }) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 text-xs font-extrabold ${active ? tint : "text-ink-soft"}`}>
            <span className={`flex h-[34px] w-14 items-center justify-center rounded-full ${active ? bg : ""}`}>
              <Icon size={24} strokeWidth={2.4} />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sheet({ open, onClose, children, tone = "bg-white" }: { open: boolean; onClose: () => void; children: ReactNode; tone?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Schließen" className="anim-fade absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className={`anim-sheet relative w-full max-w-xl rounded-t-[30px] ${tone} px-5 pb-[calc(28px+env(safe-area-inset-bottom))] pt-6`}>{children}</div>
    </div>
  );
}

const CONFETTI_COLORS = ["#FFD23F", "#FF5D9E", "#4CC3FF", "#6BD66B", "#FF9F1C", "#9B7BFF"];

export function Confetti({ pieces = 40 }: { pieces?: number }) {
  const [items] = useState(() =>
    Array.from({ length: pieces }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      dur: 2.2 + Math.random() * 1.6,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      w: 8 + Math.random() * 6,
      round: Math.random() < 0.4,
    })),
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
      {items.map((c, i) => (
        <span
          key={i}
          className="absolute top-0 block"
          style={{
            left: `${c.left}%`,
            width: c.w,
            height: c.round ? c.w : c.w * 1.8,
            borderRadius: c.round ? "50%" : 3,
            background: c.color,
            animation: `confetti ${c.dur}s ${c.delay}s ease-in both`,
          }}
        />
      ))}
    </div>
  );
}

/** Färbt den ganzen Seitenhintergrund — damit Tablets links/rechts nicht grau bleiben. */
export function useBackdrop(color: string) {
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = color;
    document.documentElement.style.background = color;
    return () => {
      document.body.style.background = prev;
      document.documentElement.style.background = "";
    };
  }, [color]);
}

export function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-grape">
      <StarIcon size={72} className="anim-bob" />
    </div>
  );
}
