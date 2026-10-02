"use client";

// Ausmalen: Farbe wählen, Fläche antippen. Im Rechen-Malbild steht auf jeder
// Fläche eine Aufgabe — das Ergebnis sagt, welche Farbe hingehört.

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { getPage, type ColoringPage } from "@/game/coloring";
import { claimMathBonus, saveFills, type SaveState } from "@/game/state";
import { pick, randInt, shuffle } from "@/game/random";
import { sfx } from "@/game/sound";
import { Button, LinkButton } from "@/ui/Button";
import { Confetti, useBackdrop } from "@/ui/chrome";
import { ColoringSvg } from "@/ui/ColoringSvg";

const PALETTE: [string, string][] = [
  ["Hellblau", "#8ED8FF"],
  ["Weiß", "#FFFFFF"],
  ["Lila", "#9B7BFF"],
  ["Türkis", "#2EC4B6"],
  ["Grün", "#6BD66B"],
  ["Rosa", "#FF9EC7"],
  ["Orange", "#FF9F1C"],
  ["Gelb", "#FFD23F"],
  ["Rot", "#FF5D5D"],
  ["Braun", "#B07A4F"],
  ["Dunkellila", "#7B4DFF"],
  ["Nachtblau", "#2B2E6E"],
  ["Hellgelb", "#FFF1C4"],
  ["Hellrosa", "#FFE3F0"],
  ["Hellviolett", "#E6DEFF"],
  ["Dunkelblau", "#3B3F8F"],
];

const MATH_BONUS = 25;

/** Rechen-Malbild: jede Vorschlagsfarbe bekommt eine Zahl, jede Fläche eine Aufgabe dazu. */
function buildMath(page: ColoringPage) {
  const colors = [...new Set(Object.values(page.regions).map((r) => r.color))];
  const numbers = shuffle(Array.from({ length: 11 }, (_, i) => i + 8)).slice(0, colors.length);
  const legend = colors.map((c, i) => ({ color: c, n: numbers[i] })).sort((a, b) => a.n - b.n);
  const labels: Record<string, string> = {};
  for (const [id, r] of Object.entries(page.regions)) {
    if (!r.label) continue;
    const n = legend.find((l) => l.color === r.color)!.n;
    if (Math.random() < 0.6) {
      const a = randInt(Math.max(1, n - 9), n - 1);
      labels[id] = `${a}+${n - a}`;
    } else {
      const b = randInt(1, 9);
      labels[id] = `${n + b}−${b}`;
    }
  }
  return { legend, labels };
}

export function ColoringScreen({ save, pageId }: { save: SaveState; pageId: string }) {
  const page = getPage(pageId);
  if (!page || !save.pages.includes(pageId)) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-display text-2xl">Dieses Bild ist noch in einer Truhe versteckt.</p>
        <LinkButton href="/sammeln">Zur Sammlung</LinkButton>
      </main>
    );
  }
  return <Canvas save={save} page={page} />;
}

function Canvas({ save, page }: { save: SaveState; page: ColoringPage }) {
  useBackdrop("#E3F5FF");
  const [fills, setFills] = useState<Record<string, string>>(save.fills[page.id] ?? {});
  const [color, setColor] = useState(PALETTE[2][1]);
  const [math, setMath] = useState(false);
  const [bonus, setBonus] = useState(false);
  const [mathSet] = useState(() => buildMath(page));

  const paint = (region: string) => {
    sfx.pop();
    const next = { ...fills, [region]: color };
    setFills(next);
    saveFills(page.id, next);
    if (math) {
      const solved = Object.keys(mathSet.labels).every((id) => next[id] === page.regions[id].color);
      if (solved && claimMathBonus(page.id, MATH_BONUS)) {
        sfx.fanfare();
        setBonus(true);
      }
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-3 bg-sky-light px-4 pb-8 pt-4">
      {bonus && <Confetti />}
      <div className="flex items-center gap-3">
        <LinkButton href="/sammeln" tone="white" size="md" className="!h-11 !w-11 !px-0" depth={4}>
          <ChevronLeft size={26} strokeWidth={3} className="text-ink-soft" />
        </LinkButton>
        <h1 className="font-display text-2xl font-semibold">{page.title}</h1>
      </div>

      <div className="grid grid-cols-2 gap-1.5 rounded-[18px] bg-white p-1.5">
        {[false, true].map((m) => (
          <button key={String(m)} onClick={() => setMath(m)} className={`h-11 rounded-[14px] font-extrabold ${math === m ? "bg-grape text-white" : "text-ink-soft"}`}>
            {m ? "Rechen-Malbild" : "Frei malen"}
          </button>
        ))}
      </div>

      <div className="flex justify-center rounded-[28px] bg-white p-2 shadow-[0_6px_0_#BFE6FA]">
        <ColoringSvg page={page} fills={fills} onRegion={paint} labels={math ? mathSet.labels : undefined} className="h-auto w-full max-w-[420px]" />
      </div>

      {math ? (
        <div className="flex flex-wrap gap-1.5">
          {mathSet.legend.map((l) => (
            <button key={l.n} onClick={() => setColor(l.color)} className={`flex items-center gap-1.5 rounded-full border-2 bg-white py-1 pl-1 pr-3 font-display text-lg font-semibold ${color === l.color ? "border-ink" : "border-transparent"}`}>
              <span className="h-6 w-6 rounded-full border-2 border-ink" style={{ background: l.color }} />
              {l.n}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-center font-extrabold text-ink-soft">Tippe eine Farbe, dann eine Fläche im Bild.</p>
      )}
      {bonus && <div className="anim-pop rounded-[18px] bg-leaf px-4 py-3 text-center font-display text-xl font-semibold text-white">Alles richtig! +{MATH_BONUS} Münzen</div>}
      {math && !bonus && save.mathBonus.includes(page.id) && <p className="text-center text-sm text-ink-soft">Den Bonus für dieses Bild hast du schon.</p>}

      <div className="grid grid-cols-8 gap-2">
        {PALETTE.map(([name, hex]) => (
          <button
            key={hex}
            aria-label={name}
            onClick={() => setColor(hex)}
            className="aspect-square rounded-full border-4 shadow-[0_3px_0_rgba(31,35,71,0.15)] transition-transform"
            style={{ background: hex, borderColor: color === hex ? "#1F2347" : "#fff", transform: color === hex ? "scale(1.12)" : undefined }}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          tone="white"
          size="md"
          onClick={() => {
            setFills({});
            saveFills(page.id, {});
          }}
        >
          Alles löschen
        </Button>
        <Button
          tone="leaf"
          size="md"
          onClick={() => {
            const regions = Object.keys(page.regions);
            const next = Object.fromEntries(regions.map((r) => [r, pick(PALETTE)[1]]));
            setFills(next);
            saveFills(page.id, next);
            sfx.combo();
          }}
        >
          Zauberfarben
        </Button>
      </div>
    </main>
  );
}
