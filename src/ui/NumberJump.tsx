// Sprung-Bild auf dem Zahlenstrahl für Plus/Minus über den Zehner:
// 66 + 9 → 66 ─(+4)→ 70 ─(+5)→ ?   (der Zehner als Zwischenstopp).
// Zeigt den Weg, aber nicht das Ergebnis.

import type { Jump } from "@/game/jumps";

export function NumberJump({ jumps }: { jumps: Jump[] }) {
  const stops = [jumps[0].from, ...jumps.map((j) => j.to)];
  const W = 320;
  const pad = 26;
  const x = (i: number) => pad + (i * (W - 2 * pad)) / (stops.length - 1);
  return (
    <svg viewBox={`0 0 ${W} 96`} width="100%" className="max-w-[360px]" role="img" aria-label="Sprünge auf dem Zahlenstrahl">
      <line x1={8} y1={62} x2={W - 8} y2={62} stroke="#9AA6B8" strokeWidth={3} strokeLinecap="round" />
      {jumps.map((j, i) => {
        const x1 = x(i);
        const x2 = x(i + 1);
        const mid = (x1 + x2) / 2;
        const d = j.to - j.from;
        return (
          <g key={i}>
            <path d={`M${x1} 58 Q${mid} 10 ${x2} 58`} fill="none" stroke="#FF9F1C" strokeWidth={3.5} strokeLinecap="round" />
            <path d={`M${x2 - 7} 50 L${x2} 58 L${x2 + 2} 48`} fill="none" stroke="#FF9F1C" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
            <rect x={mid - 22} y={14} width={44} height={24} rx={12} fill="#FFF1DB" />
            <text x={mid} y={32} textAnchor="middle" fontSize={17} fontWeight={800} fill="#B35F00">
              {d > 0 ? `+${d}` : `−${-d}`}
            </text>
          </g>
        );
      })}
      {stops.map((n, i) => {
        const last = i === stops.length - 1;
        return (
          <g key={i}>
            <circle cx={x(i)} cy={62} r={6} fill={last ? "#7B4DFF" : "#2BB673"} />
            <text x={x(i)} y={88} textAnchor="middle" fontSize={18} fontWeight={800} fill={last ? "#7B4DFF" : "#1F2547"}>
              {last ? "?" : n}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
