"use client";

// A4-Druckansicht eines Puzzle-Bilds: leer (zum Ausmalen auf Papier) oder bunt.

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Printer } from "lucide-react";
import { loadPaintImage, renderPaint } from "@/game/paint";
import { getPuzzle, isComplete } from "@/game/puzzles";
import { useSave } from "@/game/state";
import { Splash } from "@/ui/chrome";
import { Button } from "@/ui/Button";

function Inner() {
  const params = useSearchParams();
  const router = useRouter();
  const save = useSave();
  const id = params.get("p") ?? "";
  const ops = save?.paint[id];
  // Noch nichts ausgemalt? Dann gibt's die leere Vorlage.
  const colored = params.get("bunt") === "1" && (ops?.length ?? 0) > 0;
  const puzzle = getPuzzle(id);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [painted, setPainted] = useState(false);
  const ready = !colored || painted;

  useEffect(() => {
    if (!colored || !puzzle || !ops) return;
    let alive = true;
    void loadPaintImage(puzzle.src).then((pi) => {
      if (!alive || !canvas.current) return;
      renderPaint(canvas.current, pi, ops);
      setPainted(true);
    });
    return () => {
      alive = false;
    };
  }, [colored, puzzle, ops]);

  if (!save) return <Splash />;
  if (!puzzle || !isComplete(save.puzzles[id])) return <p className="p-8 text-center font-extrabold">Dieses Bild ist noch nicht freigeschaltet.</p>;

  return (
    <main className="min-h-dvh bg-white">
      <style>{"@page { size: A4 portrait; margin: 10mm; } @media print { .no-print { display: none !important; } body { background: #fff !important; } }"}</style>
      <div className="no-print mx-auto flex max-w-xl items-center gap-3 p-4">
        <button onClick={() => router.back()} aria-label="Zurück" className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-mist">
          <ChevronLeft size={26} />
        </button>
        <div className="flex-1 font-display text-xl font-semibold">{puzzle.title}</div>
        <Button tone="leaf" size="md" disabled={!ready} onClick={() => window.print()}>
          <Printer size={20} /> Drucken
        </Button>
      </div>
      <div className="mx-auto flex max-w-[190mm] flex-col items-center">
        {colored ? (
          <canvas ref={canvas} className="h-auto max-h-[265mm] w-full object-contain" aria-label={puzzle.title} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- statischer Export, Bild soll 1:1 gedruckt werden
          <img src={puzzle.src} alt={puzzle.title} className="h-auto max-h-[265mm] w-full object-contain" />
        )}
        <div className="mt-1 text-xs text-ink-soft">Sternenpfad · {puzzle.title}</div>
      </div>
    </main>
  );
}

export default function PrintPage() {
  return (
    <Suspense fallback={<Splash />}>
      <Inner />
    </Suspense>
  );
}
