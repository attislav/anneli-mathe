"use client";

// Zehner-Turm: Oben schwebt ein Zahlen-Klotz herunter. Tippe den Turm an,
// auf den er soll. Ergibt ein Turm genau 10, knallt er und gibt Punkte.
// Zu viel? Der Turm wackelt nur — der Klotz bleibt, kein Abzug.

import { useEffect, useRef, useState } from "react";
import { chance, pick, randInt } from "@/game/random";
import { sfx } from "@/game/sound";
import { ROUND_SECONDS } from "@/screens/ArcadeScreen";
import { useBackdrop } from "@/ui/chrome";

const POINTS = 10;
const UNIT = 24; // Höhe eines Einer-Feldes im Turm (px)
const POP_MS = 650;

// Jede Zahl hat ihre Farbe — im Turm und beim fallenden Klotz gleich.
const BLOCK: Record<number, { bg: string; shade: string; text: string }> = {
  1: { bg: "#FFFFFF", shade: "#C2CAD6", text: "#1F2347" },
  2: { bg: "#FF5D9E", shade: "#C93B77", text: "#FFFFFF" },
  3: { bg: "#4CC3FF", shade: "#2A9FD9", text: "#FFFFFF" },
  4: { bg: "#FFC531", shade: "#E5A100", text: "#1F2347" },
  5: { bg: "#2BB673", shade: "#1E8F57", text: "#FFFFFF" },
  6: { bg: "#FF9F1C", shade: "#D97B00", text: "#FFFFFF" },
  7: { bg: "#7B4DFF", shade: "#5A2FE0", text: "#FFFFFF" },
  8: { bg: "#FF6B3D", shade: "#C94A22", text: "#FFFFFF" },
  9: { bg: "#2EC4B6", shade: "#1F978C", text: "#FFFFFF" },
};

type Tower = { pieces: number[]; popping: boolean };
type Falling = { id: number; value: number; y: number; dur: number };
type Flash = { id: number; text: string; x: number; big: boolean };

const sum = (t: Tower) => t.pieces.reduce((s, n) => s + n, 0);

// Meist ein Klotz, der irgendwo genau zur 10 ergänzt — sonst einer, der
// wenigstens auf einen Turm passt. So kommt man nie ganz fest.
function nextValue(towers: Tower[]): number {
  const free = towers.filter((t) => !t.popping);
  const open = free.map(sum).filter((s) => s > 0 && s < 10);
  if (open.length && chance(0.55)) return 10 - pick(open);
  const fits = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((v) => free.some((t) => sum(t) + v <= 10));
  return fits.length ? pick(fits) : randInt(1, 9);
}

// Je länger gespielt, desto schneller fällt der Klotz; ab 20 s gibt es einen vierten Turm.
const fallSeconds = (elapsed: number) => Math.max(2.6, 7 - elapsed * 0.075);
const towerCount = (elapsed: number) => (elapsed >= 20 ? 4 : 3);

export function TenTower({ onEnd }: { onEnd: (score: number) => void }) {
  useBackdrop("#24275E");
  const [time, setTime] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [towers, setTowers] = useState<Tower[]>(() => Array.from({ length: 4 }, () => ({ pieces: [], popping: false })));
  const [falling, setFalling] = useState<Falling | null>(null);
  const [preview, setPreview] = useState(() => randInt(1, 9));
  const [flash, setFlash] = useState<Flash | null>(null);

  const scoreRef = useRef(0);
  const towersRef = useRef(towers);
  const fallingRef = useRef<Falling | null>(null);
  const previewRef = useRef(preview);
  const elapsedRef = useRef(0);
  const nextId = useRef(0);
  const flashId = useRef(0);
  const waitRef = useRef(0.6); // Pause bis zum nächsten Klotz (s)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const count = towerCount(ROUND_SECONDS - time);

  const commitTowers = (next: Tower[]) => {
    towersRef.current = next;
    setTowers(next);
  };
  const commitFalling = (next: Falling | null) => {
    fallingRef.current = next;
    setFalling(next);
  };

  useEffect(() => {
    const t = setInterval(() => setTime((s) => s - 1), 1000);
    const pending = timers.current;
    return () => {
      clearInterval(t);
      pending.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (time <= 0) onEnd(scoreRef.current);
  }, [time, onEnd]);

  // Fallen + neue Klötze
  useEffect(() => {
    let raf = 0;
    let last = -1;
    const loop = (now: number) => {
      const dt = last < 0 ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsedRef.current += dt;
      const b = fallingRef.current;
      if (b) {
        const y = b.y + dt / b.dur;
        if (y >= 1) {
          // Unten angekommen, ohne Turm: verschwindet einfach. Kein Abzug.
          sfx.tap();
          setFlash({ id: flashId.current++, text: "vorbei", x: 50, big: false });
          commitFalling(null);
          waitRef.current = 0.4;
        } else {
          commitFalling({ ...b, y });
        }
      } else {
        waitRef.current -= dt;
        if (waitRef.current <= 0) {
          const value = previewRef.current;
          const upcoming = nextValue(towersRef.current.slice(0, towerCount(elapsedRef.current)));
          previewRef.current = upcoming;
          setPreview(upcoming);
          commitFalling({ id: nextId.current++, value, y: 0, dur: fallSeconds(elapsedRef.current) });
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const place = (idx: number, el: HTMLElement) => {
    const b = fallingRef.current;
    const tower = towersRef.current[idx];
    if (!b || !tower || tower.popping) return;
    const total = sum(tower) + b.value;
    const x = ((idx + 0.5) / count) * 100;
    if (total > 10) {
      // Sanftes Nein: Turm wackelt, Klotz fällt weiter.
      sfx.wrong();
      el.querySelector("[data-tower]")?.animate(
        [{ transform: "rotate(0)" }, { transform: "rotate(-6deg)" }, { transform: "rotate(6deg)" }, { transform: "rotate(-3deg)" }, { transform: "rotate(0)" }],
        { duration: 450, easing: "ease-in-out" },
      );
      setFlash({ id: flashId.current++, text: "zu viel", x, big: false });
      return;
    }
    const pieces = [...tower.pieces, b.value];
    commitFalling(null);
    if (total === 10) {
      sfx.combo();
      scoreRef.current += POINTS;
      setScore(scoreRef.current);
      setFlash({ id: flashId.current++, text: `${pieces.join("+")} = 10`, x, big: true });
      commitTowers(towersRef.current.map((t, i) => (i === idx ? { pieces, popping: true } : t)));
      timers.current.push(
        setTimeout(() => {
          sfx.pop();
          commitTowers(towersRef.current.map((t, i) => (i === idx ? { pieces: [], popping: false } : t)));
        }, POP_MS),
      );
      waitRef.current = 0.45;
    } else {
      sfx.tap();
      commitTowers(towersRef.current.map((t, i) => (i === idx ? { ...t, pieces } : t)));
      waitRef.current = 0.25;
    }
  };

  return (
    <main className="mx-auto flex h-dvh max-w-xl flex-col bg-night text-white select-none">
      <div className="z-10 flex items-center justify-between gap-3 bg-night-light px-4 py-3">
        <div className="w-16 font-display text-2xl font-semibold text-sun">{score}</div>
        <div className="flex-1 rounded-full bg-grape px-3 py-2 text-center font-extrabold">Mach jeden Turm genau 10!</div>
        <div className="w-16 text-right font-display text-2xl font-semibold">{time}</div>
      </div>

      {/* Fall-Zone */}
      <div className="relative min-h-[170px] flex-1 overflow-hidden">
        <div className="absolute right-3 top-3 flex flex-col items-center gap-1 text-xs font-extrabold text-[#C3C6F0]">
          danach
          <Block value={preview} size={40} />
        </div>
        {falling && (
          <div
            key={falling.id}
            className="pointer-events-none absolute left-1/2"
            style={{ top: `calc(${falling.y} * (100% - 96px) + 4px)`, transform: "translateX(-50%)" }}
          >
            <div className="anim-pop">
              <Block value={falling.value} size={84} />
            </div>
          </div>
        )}
        {flash && (
          <span
            key={flash.id}
            className={`anim-float pointer-events-none absolute bottom-4 -translate-x-1/2 whitespace-nowrap font-display font-semibold ${flash.big ? "text-4xl text-sun" : "text-2xl text-[#C3C6F0]"}`}
            style={{ left: `${flash.x}%` }}
          >
            {flash.text}
          </span>
        )}
      </div>

      {/* Türme */}
      <div className="flex items-end justify-center gap-3 px-3 pb-6">
        {towers.slice(0, count).map((t, i) => {
          const s = sum(t);
          return (
            <button
              key={i}
              onPointerDown={(e) => place(i, e.currentTarget)}
              aria-label={`Turm ${i + 1}, Summe ${s}`}
              className="flex max-w-[120px] flex-1 touch-manipulation flex-col items-center gap-2"
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full font-display text-3xl font-semibold transition-colors ${t.popping ? "bg-sun text-night" : "bg-white text-ink"}`}
              >
                {s}
              </span>
              <span
                data-tower
                className="relative block w-full origin-bottom rounded-[20px] bg-night-light p-1.5"
                style={{ boxShadow: "0 6px 0 #171A45" }}
              >
                {t.popping && <span className="anim-ring absolute inset-0 rounded-[20px] border-[6px] border-sun" />}
                <span
                  className="relative flex flex-col-reverse gap-[3px] overflow-hidden rounded-[14px]"
                  style={{
                    height: UNIT * 10 + 27,
                    background: `repeating-linear-gradient(to top, #2E3270 0 ${UNIT}px, #24275E ${UNIT}px ${UNIT + 3}px)`,
                    transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
                    transform: t.popping ? "scale(1.06)" : "scale(1)",
                    filter: t.popping ? "brightness(1.25)" : undefined,
                  }}
                >
                  {t.pieces.map((n, k) => (
                    <span
                      key={k}
                      className="anim-pop flex w-full shrink-0 items-center justify-center rounded-[10px] font-display text-xl font-semibold"
                      style={{
                        height: UNIT * n + 3 * (n - 1),
                        background: BLOCK[n].bg,
                        color: BLOCK[n].text,
                        boxShadow: `inset 0 -5px 0 ${BLOCK[n].shade}`,
                      }}
                    >
                      {n}
                    </span>
                  ))}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </main>
  );
}

function Block({ value, size }: { value: number; size: number }) {
  const c = BLOCK[value];
  return (
    <div
      className="flex items-center justify-center rounded-[22%] font-display font-semibold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.55,
        background: c.bg,
        color: c.text,
        boxShadow: `inset 0 -${Math.round(size / 10)}px 0 ${c.shade}, 0 ${Math.round(size / 14)}px 0 rgba(0,0,0,0.25)`,
      }}
    >
      {value}
    </div>
  );
}
