// Lineal (cm) mit Gegenstand darüber — für die Mess-Werkstatt.

import type { RulerItem } from "@/game/types";

const INK = "#1F2347";
export const RULER_PAD = 16;

/** Breite eines Zentimeters in px bei gegebener Gesamtbreite. */
export const cmWidth = (width: number, max: number) => (width - 2 * RULER_PAD) / max;

export function RulerScale({ max, width }: { max: number; width: number }) {
  const u = cmWidth(width, max);
  return (
    <svg viewBox={`0 0 ${width} 56`} width={width} height={56} aria-hidden="true" className="block">
      <rect x="2" y="2" width={width - 4} height="52" rx="8" fill="#FFE7A8" stroke="#E5A100" strokeWidth="2" />
      {Array.from({ length: max * 2 + 1 }, (_, i) => {
        const x = RULER_PAD + (i / 2) * u;
        const big = i % 2 === 0;
        return <line key={i} x1={x} x2={x} y1={2} y2={big ? 22 : 14} stroke={INK} strokeWidth={big ? 2 : 1} />;
      })}
      {Array.from({ length: max + 1 }, (_, i) => (
        <text key={i} x={RULER_PAD + i * u} y={40} textAnchor="middle" fontSize="13" fontWeight="700" fill={INK} fontFamily="var(--font-fredoka), sans-serif">
          {i}
        </text>
      ))}
      <text x={width - 10} y={50} textAnchor="end" fontSize="9" fill={INK}>
        cm
      </text>
    </svg>
  );
}

export function RulerItemArt({ item, from, to, max, width }: { item: RulerItem; from: number; to: number; max: number; width: number }) {
  const u = cmWidth(width, max);
  const x1 = RULER_PAD + from * u;
  const x2 = RULER_PAD + to * u;
  const h = 34;
  return (
    <svg viewBox={`0 0 ${width} ${h}`} width={width} height={h} aria-hidden="true" className="block">
      {item === "stift" && (
        <>
          <rect x={x1} y={10} width={Math.max(4, x2 - x1 - 14)} height={14} fill="#FFC531" stroke={INK} strokeWidth="2" />
          <path d={`M${x2 - 14} 10 L${x2} 17 L${x2 - 14} 24 Z`} fill="#F7C99B" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d={`M${x2 - 4} 15 L${x2} 17 L${x2 - 4} 19 Z`} fill={INK} />
        </>
      )}
      {item === "band" && <rect x={x1} y={11} width={x2 - x1} height={12} rx={3} fill="#FF5D9E" stroke={INK} strokeWidth="2" />}
      {item === "wurm" && (
        <>
          <rect x={x1} y={10} width={x2 - x1} height={14} rx={7} fill="#FF9EC7" stroke={INK} strokeWidth="2" />
          <circle cx={x2 - 6} cy={15} r={1.8} fill={INK} />
        </>
      )}
      {item === "nagel" && (
        <>
          <rect x={x1} y={8} width={5} height={18} rx={1} fill="#9AA6B8" stroke={INK} strokeWidth="1.5" />
          <path d={`M${x1 + 5} 14 H${x2 - 8} L${x2} 17 L${x2 - 8} 20 H${x1 + 5} Z`} fill="#C2CAD6" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
        </>
      )}
      <line x1={x1} x2={x1} y1={0} y2={h} stroke="#7B4DFF" strokeWidth="1" strokeDasharray="3 3" />
      <line x1={x2} x2={x2} y1={0} y2={h} stroke="#7B4DFF" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  );
}
