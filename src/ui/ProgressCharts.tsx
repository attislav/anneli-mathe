"use client";

// Zeitverlauf im Lernbericht: Ø Stufe pro Woche (Linie) und Trefferquote
// pro Woche (Säulen mit 80-%-Ziellinie). Zwei Diagramme statt einer
// Doppelachse; beim Antippen/Überfahren erscheint der genaue Wert.

import { useState } from "react";
import type { WeekPoint } from "@/game/report";

const W = 320;
const H = 150;
const PAD = { l: 28, r: 10, t: 14, b: 22 };
const SERIES = "#7B4DFF";
const GRID = "#E4E0F5";
const MUTED = "#5B5F86";

function x(i: number, n: number) {
  return PAD.l + (n === 1 ? (W - PAD.l - PAD.r) / 2 : (i * (W - PAD.l - PAD.r)) / (n - 1));
}

function Tip({ cx, cy, text }: { cx: number; cy: number; text: string }) {
  const w = text.length * 6.4 + 12;
  const left = Math.min(Math.max(cx - w / 2, 2), W - w - 2);
  // Oben kein Platz → Blase unter den Punkt.
  const top = cy - 30 < 2 ? cy + 10 : cy - 30;
  return (
    <g pointerEvents="none">
      <rect x={left} y={top} width={w} height={20} rx={6} fill="#1F2347" />
      <text x={left + w / 2} y={top + 14} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
        {text}
      </text>
    </g>
  );
}

export function LevelChart({ weeks }: { weeks: WeekPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const y = (lv: number) => PAD.t + ((5 - lv) / 4) * (H - PAD.t - PAD.b);
  const pts = weeks.map((w, i) => (w.level === null ? null : ([x(i, weeks.length), y(w.level)] as const)));
  // Linie nur zwischen Wochen mit Daten; Lücken bleiben Lücken.
  let d = "";
  let pen = false;
  for (const p of pts) {
    if (!p) {
      pen = false;
      continue;
    }
    d += `${pen ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)} `;
    pen = true;
  }
  const last = [...pts.keys()].reverse().find((i) => pts[i]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Durchschnittliche Stufe pro Woche">
      {[1, 2, 3, 4, 5].map((lv) => (
        <g key={lv}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(lv)} y2={y(lv)} stroke={GRID} strokeWidth="1" />
          <text x={PAD.l - 8} y={y(lv) + 4} textAnchor="end" fontSize="10" fill={MUTED}>
            {lv}
          </text>
        </g>
      ))}
      {weeks.map((w, i) => (
        <text key={w.start} x={x(i, weeks.length)} y={H - 6} textAnchor="middle" fontSize="9" fill={MUTED}>
          {w.label}
        </text>
      ))}
      <path d={d} fill="none" stroke={SERIES} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) =>
        p ? (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r={hover === i ? 6 : 4.5} fill={SERIES} stroke="#fff" strokeWidth="2" />
            <rect x={p[0] - 16} y={PAD.t} width={32} height={H - PAD.t - PAD.b} fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={() => setHover(hover === i ? null : i)} />
          </g>
        ) : null,
      )}
      {last !== undefined && hover === null && pts[last] && <Tip cx={pts[last]![0]} cy={pts[last]![1]} text={`Stufe ${weeks[last].level!.toFixed(1)}`} />}
      {hover !== null && pts[hover] && <Tip cx={pts[hover]![0]} cy={pts[hover]![1]} text={`Stufe ${weeks[hover].level!.toFixed(1)} · ${weeks[hover].tasks} Aufg.`} />}
    </svg>
  );
}

export function AccuracyChart({ weeks }: { weeks: WeekPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const h = 110;
  const y = (a: number) => PAD.t + (1 - a) * (h - PAD.t - PAD.b);
  const bw = Math.min(22, ((W - PAD.l - PAD.r) / weeks.length) * 0.55);
  return (
    <svg viewBox={`0 0 ${W} ${h}`} className="w-full" role="img" aria-label="Trefferquote pro Woche">
      {[0, 0.5, 1].map((a) => (
        <g key={a}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(a)} y2={y(a)} stroke={GRID} strokeWidth="1" />
          <text x={PAD.l - 8} y={y(a) + 4} textAnchor="end" fontSize="10" fill={MUTED}>
            {a * 100}
          </text>
        </g>
      ))}
      <line x1={PAD.l} x2={W - PAD.r} y1={y(0.8)} y2={y(0.8)} stroke={MUTED} strokeWidth="1" strokeDasharray="4 4" />
      <text x={W - PAD.r} y={y(0.8) - 4} textAnchor="end" fontSize="9" fill={MUTED}>
        Ziel ≈ 80 %
      </text>
      {weeks.map((w, i) => {
        const cx = x(i, weeks.length);
        return (
          <g key={w.start}>
            {w.acc !== null && <path d={`M${cx - bw / 2} ${y(0)} V${y(w.acc) + 4} q0 -4 4 -4 H${cx + bw / 2 - 4} q4 0 4 4 V${y(0)} Z`} fill={SERIES} opacity={hover === null || hover === i ? 1 : 0.5} />}
            <rect x={cx - 16} y={PAD.t} width={32} height={h - PAD.t - PAD.b} fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={() => setHover(hover === i ? null : i)} />
            <text x={cx} y={h - 6} textAnchor="middle" fontSize="9" fill={MUTED}>
              {w.label}
            </text>
          </g>
        );
      })}
      {hover !== null && weeks[hover].acc !== null && <Tip cx={x(hover, weeks.length)} cy={y(weeks[hover].acc!)} text={`${Math.round(weeks[hover].acc! * 100)} % · ${weeks[hover].tasks} Aufg.`} />}
    </svg>
  );
}
