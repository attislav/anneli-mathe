"use client";

// Spielhalle: Mini-Spiele gegen Münzen, mit Tageslimit von den Eltern.

import Link from "next/link";
import { Clock, Lock } from "lucide-react";
import type { SaveState } from "@/game/state";
import { CoinIcon } from "@/ui/art";
import { BottomNav, Pill, useBackdrop } from "@/ui/chrome";

export const GAME_COST = 20;
export const ROUND_SECONDS = 60;

export function arcadeSecondsLeft(save: SaveState): number {
  return Math.max(0, save.settings.arcadeMinutes * 60 - save.today.arcadeSeconds);
}

const GAMES = [
  { href: "/spielen/ballons", name: "Ballon-Platzen", color: "#FF5D9E", shade: "#C93B77", art: "balloons" },
  { href: "/spielen/memory", name: "Rechen-Memory", color: "#4CC3FF", shade: "#2A9FD9", art: "cards" },
] as const;

export function ArcadeScreen({ save }: { save: SaveState }) {
  const left = arcadeSecondsLeft(save);
  useBackdrop("#24275E");
  const total = save.settings.arcadeMinutes * 60;
  const minutes = Math.ceil(left / 60);
  return (
    <div className="mx-auto min-h-dvh max-w-xl bg-night px-4 pb-28 pt-5 text-white">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Spielhalle</h1>
        <Pill className="bg-night-light">
          <CoinIcon size={22} />
          {save.coins}
        </Pill>
      </div>

      <div className="mt-4 flex items-center gap-4 rounded-[22px] bg-night-light p-4">
        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-sun p-3 text-night">
          <Clock size={28} strokeWidth={2.6} />
        </div>
        <div className="flex-1">
          <div className="font-display text-xl font-semibold">{left > 0 ? `Heute noch ${minutes} ${minutes === 1 ? "Minute" : "Minuten"}` : "Für heute ist Schluss!"}</div>
          <div className="my-1.5 h-2.5 overflow-hidden rounded-full bg-night">
            <div className="h-full rounded-full bg-sun" style={{ width: `${total ? (left / total) * 100 : 0}%` }} />
          </div>
          <div className="text-xs text-[#C3C6F0]">{left > 0 ? `Eine Runde dauert 1 Minute und kostet ${GAME_COST} Münzen.` : "Morgen ist die Spielhalle wieder offen."}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {GAMES.map((g) => (
          <Link key={g.href} href={g.href} className="chunky flex h-[170px] flex-col justify-between rounded-[24px] p-3.5" style={{ background: g.color, ["--shade" as string]: g.shade }}>
            {g.art === "balloons" ? (
              <svg viewBox="0 0 80 60" width="84" height="62" aria-hidden="true">
                <ellipse cx="22" cy="22" rx="14" ry="17" fill="#FFD23F" />
                <path d="M22 39 Q20 50 24 58" stroke="#fff" strokeWidth="2" fill="none" />
                <ellipse cx="52" cy="18" rx="13" ry="16" fill="#fff" />
                <path d="M52 34 Q54 46 50 58" stroke="#fff" strokeWidth="2" fill="none" />
                <text x="22" y="28" fontFamily="var(--font-fredoka)" fontWeight="600" fontSize="16" fill="#1F2347" textAnchor="middle">7</text>
                <text x="52" y="24" fontFamily="var(--font-fredoka)" fontWeight="600" fontSize="15" fill="#1F2347" textAnchor="middle">12</text>
              </svg>
            ) : (
              <svg viewBox="0 0 80 60" width="84" height="62" aria-hidden="true">
                <rect x="4" y="8" width="30" height="42" rx="6" fill="#fff" transform="rotate(-8 19 28)" />
                <rect x="42" y="8" width="30" height="42" rx="6" fill="#7B4DFF" />
                <text x="19" y="34" fontFamily="var(--font-fredoka)" fontWeight="600" fontSize="14" fill="#1F2347" textAnchor="middle" transform="rotate(-8 19 28)">6+4</text>
                <path d="M57 20l2.4 5 5.4.6-4 3.8 1 5.4-4.8-2.6-4.8 2.6 1-5.4-4-3.8 5.4-.6z" fill="#FFD23F" />
              </svg>
            )}
            <div>
              <div className="font-display text-xl font-semibold leading-tight">{g.name}</div>
              <div className="flex items-center gap-1 text-sm font-extrabold">
                <CoinIcon size={15} /> {GAME_COST}
                {save.games[g.href] ? <span className="ml-auto opacity-90">Rekord {save.games[g.href]}</span> : null}
              </div>
            </div>
          </Link>
        ))}
        {["Zehner-Turm", "Sternen-Rakete"].map((name) => (
          <div key={name} className="flex h-[170px] flex-col justify-between rounded-[24px] border-[3px] border-dashed border-[#5B60A8] bg-night-light p-3.5 text-[#C3C6F0]">
            <Lock size={36} />
            <div>
              <div className="font-display text-xl font-semibold text-white">{name}</div>
              <div className="text-sm font-extrabold">kommt bald</div>
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}
