"use client";

// Puzzle-Bild ausmalen: Farbe wählen, Fläche antippen (Farbeimer).
// Drucken öffnet die A4-Ansicht — leer zum Ausmalen auf Papier oder bunt.

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Printer, Undo2 } from "lucide-react";
import { loadPaintImage, regionAt, renderPaint, type PaintImage } from "@/game/paint";
import { getPuzzle, isComplete } from "@/game/puzzles";
import { savePaint, type PaintOp, type SaveState } from "@/game/state";
import { sfx } from "@/game/sound";
import { Button, LinkButton } from "@/ui/Button";
import { useBackdrop } from "@/ui/chrome";
import { PALETTE } from "./ColoringScreen";

export function PaintScreen({ save, puzzleId }: { save: SaveState; puzzleId: string }) {
  const puzzle = getPuzzle(puzzleId);
  if (!puzzle || !isComplete(save.puzzles[puzzleId])) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-display text-2xl">Dieses Bild hast du noch nicht komplett gesammelt.</p>
        <LinkButton href="/sammeln">Zur Sammlung</LinkButton>
      </main>
    );
  }
  return <Painter puzzleId={puzzle.id} title={puzzle.title} src={puzzle.src} initial={save.paint[puzzle.id] ?? []} />;
}

function Painter({ puzzleId, title, src, initial }: { puzzleId: string; title: string; src: string; initial: PaintOp[] }) {
  useBackdrop("#E3F5FF");
  const canvas = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<PaintImage | null>(null);
  const [ops, setOps] = useState<PaintOp[]>(initial);
  const [color, setColor] = useState(PALETTE[2][1]);

  useEffect(() => {
    let alive = true;
    void loadPaintImage(src).then((pi) => alive && setImg(pi));
    return () => {
      alive = false;
    };
  }, [src]);

  useEffect(() => {
    if (img && canvas.current) renderPaint(canvas.current, img, ops);
  }, [img, ops]);

  const commit = (next: PaintOp[]) => {
    setOps(next);
    savePaint(puzzleId, next);
  };

  const tap = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!img) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * img.w);
    const y = Math.round(((e.clientY - r.top) / r.height) * img.h);
    if (regionAt(img, x, y) < 0) return;
    sfx.pop();
    commit([...ops, [x, y, color]]);
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-3 bg-sky-light px-4 pb-8 pt-4">
      <div className="flex items-center gap-3">
        <LinkButton href="/sammeln" tone="white" size="md" className="!h-11 !w-11 !px-0" depth={4}>
          <ChevronLeft size={26} strokeWidth={3} className="text-ink-soft" />
        </LinkButton>
        <h1 className="font-display text-2xl font-semibold">{title}</h1>
      </div>

      <div className="flex justify-center rounded-[28px] bg-white p-2 shadow-[0_6px_0_#BFE6FA]">
        {img ? (
          <canvas ref={canvas} onPointerDown={tap} aria-label={`Ausmalbild ${title}`} className="h-auto w-full max-w-[420px] touch-manipulation rounded-[20px]" />
        ) : (
          <div className="flex aspect-[2/3] w-full max-w-[420px] items-center justify-center font-extrabold text-ink-soft">Bild wird geladen …</div>
        )}
      </div>

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
        <Button tone="white" size="md" disabled={ops.length === 0} onClick={() => commit(ops.slice(0, -1))}>
          <Undo2 size={20} /> Zurück
        </Button>
        <Button tone="white" size="md" disabled={ops.length === 0} onClick={() => commit([])}>
          Alles löschen
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <LinkButton href={`/drucken/?p=${puzzleId}`} tone="leaf" size="md">
          <Printer size={20} /> Leer drucken
        </LinkButton>
        <LinkButton href={`/drucken/?p=${puzzleId}&bunt=1`} tone="sky" size="md">
          <Printer size={20} /> Bunt drucken
        </LinkButton>
      </div>
    </main>
  );
}
