// Puzzle-Bild als 3×3-Raster: gesammelte Teile zeigen ihren Bildausschnitt,
// fehlende ein Fragezeichen.

import { PIECES, type Puzzle } from "@/game/puzzles";

export function PuzzleGrid({ puzzle, have, width = 150, highlight }: { puzzle: Puzzle; have: number[]; width?: number; highlight?: number }) {
  const h = (width * 3) / 2;
  return (
    <div className="grid grid-cols-3 gap-[2px] overflow-hidden rounded-xl bg-[#C9C2EA]" style={{ width, height: h }} aria-label={`${have.length} von ${PIECES} Teilen`}>
      {Array.from({ length: PIECES }, (_, i) => {
        const owned = have.includes(i);
        const col = i % 3;
        const row = Math.floor(i / 3);
        return owned ? (
          <div
            key={i}
            className={`bg-white ${highlight === i ? "anim-pop outline outline-4 -outline-offset-4 outline-sun" : ""}`}
            style={{ backgroundImage: `url(${puzzle.src})`, backgroundSize: "300% 300%", backgroundPosition: `${col * 50}% ${row * 50}%` }}
          />
        ) : (
          <div key={i} className="flex items-center justify-center bg-[#EFEBFF] font-display font-semibold text-[#B9AEE8]" style={{ fontSize: width / 7 }}>
            ?
          </div>
        );
      })}
    </div>
  );
}

/** Ein einzelnes Teil (für die Belohnungs-Karte). */
export function PuzzlePiece({ puzzle, piece, size = 68 }: { puzzle: Puzzle; piece: number; size?: number }) {
  const col = piece % 3;
  const row = Math.floor(piece / 3);
  return (
    <div
      className="rounded-xl border-4 border-sun bg-white"
      style={{ width: (size * 2) / 3, height: size, backgroundImage: `url(${puzzle.src})`, backgroundSize: "300% 300%", backgroundPosition: `${col * 50}% ${row * 50}%` }}
      aria-hidden="true"
    />
  );
}
