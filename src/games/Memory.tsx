"use client";

// Rechen-Memory: Aufgabe und Ergebnis sind ein Paar. Je weniger Züge, desto mehr Punkte.

import { useEffect, useState } from "react";
import { randInt, shuffle } from "@/game/random";
import { sfx } from "@/game/sound";
import { useBackdrop } from "@/ui/chrome";

type Card = { id: number; pair: number; face: string; isTask: boolean };

function makeDeck(): Card[] {
  const results = shuffle(Array.from({ length: 15 }, (_, i) => i + 6)).slice(0, 6);
  const cards: Card[] = [];
  results.forEach((r, pair) => {
    const plus = Math.random() < 0.6;
    const a = plus ? randInt(1, r - 1) : randInt(1, 9);
    cards.push({ id: pair * 2, pair, face: plus ? `${a}+${r - a}` : `${r + a}−${a}`, isTask: true });
    cards.push({ id: pair * 2 + 1, pair, face: String(r), isTask: false });
  });
  return shuffle(cards);
}

export function Memory({ onEnd }: { onEnd: (score: number) => void }) {
  const [deck] = useState(makeDeck);
  useBackdrop("#4CC3FF");
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open.map((id) => deck.find((c) => c.id === id)!);
    const t = setTimeout(
      () => {
        if (a.pair === b.pair) setMatched((m) => [...m, a.pair]);
        setOpen([]);
      },
      a.pair === b.pair ? 350 : 900,
    );
    if (a.pair === b.pair) sfx.correct();
    return () => clearTimeout(t);
  }, [open, deck]);

  useEffect(() => {
    if (matched.length === 6) {
      const t = setTimeout(() => onEnd(Math.max(10, 100 - Math.max(0, moves - 6) * 6)), 600);
      return () => clearTimeout(t);
    }
  }, [matched, moves, onEnd]);

  const flip = (c: Card) => {
    if (open.length >= 2 || open.includes(c.id) || matched.includes(c.pair)) return;
    sfx.tap();
    const next = [...open, c.id];
    if (next.length === 2) setMoves((m) => m + 1);
    setOpen(next);
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-4 bg-sky px-4 py-5">
      <div className="flex items-center justify-between text-white">
        <h1 className="font-display text-2xl font-semibold">Rechen-Memory</h1>
        <div className="font-display text-xl font-semibold">{moves} Züge</div>
      </div>
      <p className="font-extrabold text-white">Finde die Aufgabe und ihr Ergebnis!</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {deck.map((c) => {
          const up = open.includes(c.id) || matched.includes(c.pair);
          const done = matched.includes(c.pair);
          return (
            <button
              key={c.id}
              onClick={() => flip(c)}
              aria-label={up ? c.face : "verdeckte Karte"}
              className="chunky flex aspect-[3/4] items-center justify-center rounded-[20px] font-display text-3xl font-semibold transition-colors"
              style={{
                background: done ? "#2BB673" : up ? "#fff" : "#7B4DFF",
                color: done ? "#fff" : "#1F2347",
                ["--shade" as string]: done ? "#1E8F57" : up ? "#BFE6FA" : "#5A2FE0",
              }}
            >
              {up ? (
                c.face
              ) : (
                <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">
                  <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" fill="#FFD23F" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </main>
  );
}
