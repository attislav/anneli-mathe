"use client";

// Ballon-Platzen: Ballons steigen auf. Die Regel oben sagt, welche zählen.
// Goldene Ballons zählen immer. Falsche platzen auch — bringen aber nichts.

import { useEffect, useRef, useState } from "react";
import { chance, pick, randInt } from "@/game/random";
import { sfx } from "@/game/sound";
import { ROUND_SECONDS } from "@/screens/ArcadeScreen";
import { useBackdrop } from "@/ui/chrome";

type Rule = { text: string; make: (hit: boolean) => { label: string }; test: (label: string) => boolean };

const RULES: Rule[] = [
  {
    text: "Platze gerade Zahlen!",
    make: (hit) => {
      const n = randInt(1, 49) * 2 - (hit ? 0 : 1);
      return { label: String(n) };
    },
    test: (l) => Number(l) % 2 === 0,
  },
  {
    text: "Platze Zahlen größer als 50!",
    make: (hit) => ({ label: String(hit ? randInt(51, 99) : randInt(10, 49)) }),
    test: (l) => Number(l) > 50,
  },
  {
    text: "Platze volle Zehner!",
    make: (hit) => {
      if (hit) return { label: String(randInt(1, 9) * 10) };
      let n = randInt(11, 99);
      if (n % 10 === 0) n += 1;
      return { label: String(n) };
    },
    test: (l) => Number(l) % 10 === 0,
  },
  {
    text: "Platze alles, was 10 ergibt!",
    make: (hit) => {
      const a = randInt(1, 9);
      const b = hit ? 10 - a : pick([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== 10 - a));
      return { label: `${a}+${b}` };
    },
    test: (l) => l.split("+").reduce((s, x) => s + Number(x), 0) === 10,
  },
];

const COLORS = ["#FF5D9E", "#4CC3FF", "#6BD66B", "#9B7BFF", "#FF9F1C", "#2EC4B6"];

type Balloon = { id: number; x: number; y: number; speed: number; label: string; color: string; golden: boolean; popped: boolean };

export function Balloons({ onEnd }: { onEnd: (score: number) => void }) {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  useBackdrop("#BFE8FF");
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(ROUND_SECONDS);
  const [firstRule] = useState(() => randInt(0, RULES.length - 1));
  // Alle 15 Sekunden kommt die nächste Regel.
  const ruleIdx = (firstRule + Math.floor((ROUND_SECONDS - time) / 15)) % RULES.length;
  const [flash, setFlash] = useState<{ id: number; text: string; x: number; y: number } | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const scoreRef = useRef(0);
  const ruleRef = useRef(ruleIdx);

  useEffect(() => {
    ruleRef.current = ruleIdx;
  }, [ruleIdx]);

  useEffect(() => {
    const t = setInterval(() => setTime((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (time <= 0) onEnd(scoreRef.current);
  }, [time, onEnd]);

  // Spawnen + Bewegen
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let spawnIn = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      spawnIn -= dt;
      const height = areaRef.current?.clientHeight ?? 600;
      setBalloons((list) => {
        let next = list.map((b) => ({ ...b, y: b.y + b.speed * dt })).filter((b) => b.y < height + 140 && !b.popped);
        if (spawnIn <= 0) {
          spawnIn = 0.65;
          const rule = RULES[ruleRef.current];
          const golden = chance(0.07);
          next = [
            ...next,
            {
              id: nextId.current++,
              x: randInt(4, 80),
              y: -110,
              speed: randInt(70, 125),
              label: golden ? "★" : rule.make(chance(0.45)).label,
              color: pick(COLORS),
              golden,
              popped: false,
            },
          ];
        }
        return next;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pop = (b: Balloon) => {
    if (b.popped) return;
    const rule = RULES[ruleRef.current];
    const gain = b.golden ? 5 : rule.test(b.label) ? 1 : 0;
    if (gain > 0) {
      sfx.pop();
      scoreRef.current += gain;
      setScore(scoreRef.current);
    } else sfx.wrong();
    setFlash({ id: b.id, text: gain > 0 ? `+${gain}` : "nö", x: b.x, y: b.y });
    setBalloons((list) => list.map((x) => (x.id === b.id ? { ...x, popped: true } : x)));
  };

  return (
    <main className="mx-auto flex h-dvh max-w-xl flex-col bg-[#BFE8FF]">
      <div className="z-10 flex items-center justify-between gap-3 bg-white px-4 py-3 shadow-[0_4px_0_rgba(31,35,71,0.08)]">
        <div className="font-display text-2xl font-semibold text-rose">{score}</div>
        <div key={ruleIdx} className="anim-pop flex-1 rounded-full bg-grape px-3 py-2 text-center font-extrabold text-white">
          {RULES[ruleIdx].text}
        </div>
        <div className="w-12 text-right font-display text-2xl font-semibold text-ink">{time}</div>
      </div>
      <div ref={areaRef} className="relative flex-1 overflow-hidden">
        {balloons.map((b) =>
          b.popped ? null : (
            <button
              key={b.id}
              onPointerDown={() => pop(b)}
              aria-label={`Ballon ${b.label}`}
              className="absolute flex flex-col items-center"
              style={{ left: `${b.x}%`, bottom: b.y }}
            >
              <span
                className="flex h-[84px] w-[72px] items-center justify-center rounded-[50%] font-display text-2xl font-semibold text-ink shadow-[inset_-8px_-10px_0_rgba(0,0,0,0.08)]"
                style={{ background: b.golden ? "#FFD23F" : b.color, border: b.golden ? "4px solid #E5A100" : undefined }}
              >
                {b.label}
              </span>
              <span className="h-10 w-0.5 bg-white" />
            </button>
          ),
        )}
        {flash && (
          <span key={flash.id} className="anim-float pointer-events-none absolute font-display text-3xl font-semibold text-grape" style={{ left: `${flash.x}%`, bottom: flash.y + 40 }}>
            {flash.text}
          </span>
        )}
      </div>
    </main>
  );
}
