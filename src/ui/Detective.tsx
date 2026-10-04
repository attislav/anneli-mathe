"use client";

// Detektivbüro: kleine Daten-Symbole, Strichliste und Säulendiagramm
// (auch zum Selberzeichnen).

import type { DataIcon, DataRow } from "@/game/types";

const INK = "#1F2347";

export function DataIconArt({ icon, size = 28 }: { icon: DataIcon; size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" className="shrink-0">
      {icon === "apfel" && (
        <>
          <path d="M16 9 C10 5 4 10 6 18 C8 26 13 28 16 26 C19 28 24 26 26 18 C28 10 22 5 16 9 Z" fill="#E5484D" stroke={INK} strokeWidth="1.6" />
          <path d="M16 9 V4" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M17 6 C20 2 25 4 24 6 C21 8 18 7 17 6 Z" fill="#2BB673" stroke={INK} strokeWidth="1.2" />
        </>
      )}
      {icon === "banane" && <path d="M6 8 C6 20 14 27 26 24 C27 23 27 22 26 21 C17 22 11 17 9 8 C8 6 6 6 6 8 Z" fill="#FFD23F" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />}
      {icon === "birne" && (
        <>
          <path d="M16 6 C12 6 12 11 11 14 C7 17 6 22 9 25 C12 28 20 28 23 25 C26 22 25 17 21 14 C20 11 20 6 16 6 Z" fill="#8FD14F" stroke={INK} strokeWidth="1.6" />
          <path d="M16 6 V3" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
      {icon === "kirsche" && (
        <>
          <path d="M10 20 C12 12 16 6 22 4 M22 20 C21 13 21 8 22 4" stroke="#2BB673" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <circle cx="10" cy="22" r="6" fill="#C81E4A" stroke={INK} strokeWidth="1.6" />
          <circle cx="22" cy="22" r="6" fill="#C81E4A" stroke={INK} strokeWidth="1.6" />
        </>
      )}
      {icon === "traube" && (
        <g fill="#8E5BD8" stroke={INK} strokeWidth="1.3">
          {[[11, 9], [17, 9], [23, 9], [14, 15], [20, 15], [11, 21], [17, 21], [14, 27]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y - 2} r="3.6" />
          ))}
        </g>
      )}
      {icon === "hund" && (
        <>
          <ellipse cx="7" cy="14" rx="4" ry="8" fill="#8C5A2B" stroke={INK} strokeWidth="1.4" />
          <ellipse cx="25" cy="14" rx="4" ry="8" fill="#8C5A2B" stroke={INK} strokeWidth="1.4" />
          <circle cx="16" cy="17" r="10" fill="#D9A066" stroke={INK} strokeWidth="1.6" />
          <circle cx="12.5" cy="15" r="1.6" fill={INK} />
          <circle cx="19.5" cy="15" r="1.6" fill={INK} />
          <ellipse cx="16" cy="20.5" rx="2.4" ry="1.8" fill={INK} />
        </>
      )}
      {icon === "katze" && (
        <>
          <path d="M6 16 L7 4 L14 10 Z M26 16 L25 4 L18 10 Z" fill="#9AA6B8" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
          <circle cx="16" cy="18" r="10" fill="#B8C2D1" stroke={INK} strokeWidth="1.6" />
          <circle cx="12.5" cy="16" r="1.6" fill={INK} />
          <circle cx="19.5" cy="16" r="1.6" fill={INK} />
          <path d="M14.5 20.5 L16 22 L17.5 20.5 M8 20 H12 M20 20 H24" stroke={INK} strokeWidth="1.1" fill="none" strokeLinecap="round" />
        </>
      )}
      {icon === "hase" && (
        <>
          <ellipse cx="12" cy="8" rx="3" ry="7" fill="#FFFFFF" stroke={INK} strokeWidth="1.4" />
          <ellipse cx="20" cy="8" rx="3" ry="7" fill="#FFFFFF" stroke={INK} strokeWidth="1.4" />
          <circle cx="16" cy="20" r="9" fill="#FFFFFF" stroke={INK} strokeWidth="1.6" />
          <circle cx="13" cy="18.5" r="1.5" fill={INK} />
          <circle cx="19" cy="18.5" r="1.5" fill={INK} />
          <ellipse cx="16" cy="22" rx="1.8" ry="1.3" fill="#FF7BA8" />
        </>
      )}
      {icon === "vogel" && (
        <>
          <circle cx="15" cy="17" r="10" fill="#4CC3FF" stroke={INK} strokeWidth="1.6" />
          <path d="M24 15 L30 17 L24 19 Z" fill="#FF9F1C" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <circle cx="19" cy="14" r="1.8" fill={INK} />
          <path d="M8 18 C11 23 15 22 16 19" stroke={INK} strokeWidth="1.4" fill="#2B9BD8" />
        </>
      )}
      {icon === "sonne" && (
        <>
          <g stroke="#E5A100" strokeWidth="2.4" strokeLinecap="round">
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * Math.PI) / 4;
              return <line key={i} x1={16 + Math.cos(a) * 10} y1={16 + Math.sin(a) * 10} x2={16 + Math.cos(a) * 14} y2={16 + Math.sin(a) * 14} />;
            })}
          </g>
          <circle cx="16" cy="16" r="7.5" fill="#FFD23F" stroke={INK} strokeWidth="1.6" />
        </>
      )}
      {(icon === "wolke" || icon === "regen") && (
        <>
          <path d="M8 20 C3 20 3 13 8 13 C9 8 16 6 19 11 C24 9 28 13 26 17 C29 18 28 22 25 22 H9 C8.5 22 8 21 8 20 Z" fill={icon === "regen" ? "#B8C2D1" : "#E9EDF3"} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" transform={icon === "regen" ? "translate(0 -5)" : undefined} />
          {icon === "regen" && <path d="M11 22 l-2 5 M17 22 l-2 5 M23 22 l-2 5" stroke="#2B9BD8" strokeWidth="2.2" strokeLinecap="round" />}
        </>
      )}
    </svg>
  );
}

/** Striche mit Fünferbündeln. */
export function TallyMarks({ value, height = 24 }: { value: number; height?: number }) {
  const groups = Math.floor(value / 5);
  const rest = value % 5;
  const gw = 34;
  const w = groups * gw + rest * 7 + 4;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} width={w} height={height} aria-label={`${value} Striche`} className="shrink-0">
      <g stroke={INK} strokeWidth="2.6" strokeLinecap="round">
        {Array.from({ length: groups }, (_, g) => (
          <g key={g}>
            {[0, 1, 2, 3].map((k) => (
              <line key={k} x1={g * gw + 3 + k * 6} x2={g * gw + 3 + k * 6} y1={3} y2={height - 3} />
            ))}
            <line x1={g * gw} x2={g * gw + 24} y1={height - 5} y2={5} stroke="#E5484D" />
          </g>
        ))}
        {Array.from({ length: rest }, (_, k) => (
          <line key={`r${k}`} x1={groups * gw + 3 + k * 7} x2={groups * gw + 3 + k * 7} y1={3} y2={height - 3} />
        ))}
      </g>
    </svg>
  );
}

export function TallyTable({ rows }: { rows: DataRow[] }) {
  return (
    <div className="flex flex-col divide-y-2 divide-[#EFEAFB]">
      {rows.map((r) => (
        <div key={r.label} className="flex min-h-11 items-center gap-2 py-1.5">
          <DataIconArt icon={r.icon} />
          <span className="w-[6.5rem] shrink-0 text-sm font-extrabold">{r.label}</span>
          <TallyMarks value={r.value} />
        </div>
      ))}
    </div>
  );
}

export const BAR_COLORS = ["#7B4DFF", "#FF5D9E", "#2BB673", "#FF9F1C"];

type ChartProps = {
  rows: DataRow[];
  step: number;
  max: number;
  /** Zum Selberzeichnen: aktuelle Höhen (Werte), Antippen setzt eine Säule. */
  heights?: number[];
  onSet?: (col: number, value: number) => void;
  /** Zielhöhen gestrichelt zeigen (Auflösung). */
  ghost?: boolean;
  disabled?: boolean;
};

/** Säulendiagramm mit Kästchen. Mit `heights`/`onSet` interaktiv. */
export function BarChart({ rows, step, max, heights, onSet, ghost, disabled }: ChartProps) {
  const cells = Math.round(max / step);
  const cellH = Math.min(28, Math.floor(220 / cells));
  const h = cells * cellH;
  const colW = rows.length > 3 ? 52 : 62;
  const labelEvery = cells > 10 ? 2 : 1;
  const values = heights ?? rows.map((r) => r.value);
  return (
    <div className="flex flex-col items-center">
      <div className="flex">
        <div className="relative mr-1 w-8" style={{ height: h }} aria-hidden="true">
          {Array.from({ length: cells + 1 }, (_, i) =>
            i % labelEvery === 0 ? (
              <span key={i} className="absolute right-0 text-xs font-extrabold text-ink-soft" style={{ bottom: i * cellH - 8 }}>
                {i * step}
              </span>
            ) : null,
          )}
        </div>
        <div
          className="relative flex justify-around gap-2 border-b-[3px] border-l-[3px] border-ink px-2"
          style={{ height: h, backgroundImage: `repeating-linear-gradient(to top, #E4E0F5 0 1.5px, transparent 1.5px ${cellH}px)` }}
        >
          {rows.map((r, c) => {
            const v = values[c];
            return (
              <div key={r.label} className="relative" style={{ width: colW }}>
                {ghost && <div className="absolute inset-x-0 bottom-0 rounded-t-md border-[3px] border-dashed border-[#FFB648]" style={{ height: (r.value / step) * cellH }} />}
                <div className="absolute inset-x-0 bottom-0 rounded-t-md transition-[height]" style={{ height: (v / step) * cellH, background: BAR_COLORS[c % BAR_COLORS.length] }} />
                {onSet && (
                  <div className="absolute inset-0 flex flex-col">
                    {Array.from({ length: cells }, (_, k) => {
                      const val = (cells - k) * step;
                      return (
                        <button
                          key={k}
                          disabled={disabled}
                          aria-label={`${r.label} bis ${val}`}
                          onClick={() => onSet(c, v === val ? val - step : val)}
                          style={{ height: cellH }}
                          className="w-full"
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="ml-9 flex justify-around gap-2 px-2 pt-1">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-col items-center" style={{ width: colW }}>
            <DataIconArt icon={r.icon} size={26} />
            <span className="text-center text-[11px] font-extrabold leading-tight">{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
