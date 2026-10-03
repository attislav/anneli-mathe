// Formen und Körper für den Formen-Ozean (Vektor, eigene Zeichnung).

import type { ShapeId, ShapeItem, SolidId } from "@/game/types";

const INK = "#1F2347";

function poly(n: number, r: number, rot = -90): string {
  return Array.from({ length: n }, (_, i) => {
    const a = ((rot + (360 / n) * i) * Math.PI) / 180;
    return `${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

export function ShapeIcon({ shape, color, size = 48, rotate = 0 }: { shape: ShapeId; color: string; size?: number; rotate?: number }) {
  const common = { fill: color, stroke: INK, strokeWidth: 4, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}>
      {shape === "kreis" && <circle cx="50" cy="50" r="40" {...common} />}
      {shape === "dreieck" && <polygon points={poly(3, 44, -90)} transform="translate(0 6)" {...common} />}
      {shape === "quadrat" && <rect x="14" y="14" width="72" height="72" rx="4" {...common} />}
      {shape === "rechteck" && <rect x="6" y="26" width="88" height="48" rx="4" {...common} />}
      {shape === "fuenfeck" && <polygon points={poly(5, 43)} transform="translate(0 3)" {...common} />}
      {shape === "sechseck" && <polygon points={poly(6, 43, 0)} {...common} />}
    </svg>
  );
}

/** Formen nebeneinander oder (scatter) wild verteilt wie im Meer. */
export function ShapeGroup({ items, scatter }: { items: ShapeItem[]; scatter?: boolean }) {
  if (!scatter) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        {items.map((it, i) => (
          <ShapeIcon key={i} shape={it.shape} color={it.color} size={44 * (it.size ?? 1)} />
        ))}
      </div>
    );
  }
  // Feste, aber unregelmäßige Plätze: 4 × 3 Raster mit Versatz je Index.
  return (
    <div className="relative mx-auto h-[200px] w-full max-w-[320px]">
      {items.map((it, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const jx = ((i * 37) % 17) - 8;
        const jy = ((i * 53) % 15) - 7;
        return (
          <div key={i} className="absolute" style={{ left: `calc(${col * 25 + 2}% + ${jx}px)`, top: row * 64 + 6 + jy }}>
            <ShapeIcon shape={it.shape} color={it.color} size={50} rotate={((i * 47) % 50) - 25} />
          </div>
        );
      })}
    </div>
  );
}

export function SolidArt({ solid, size = 160 }: { solid: SolidId; size?: number }) {
  const s = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      {solid === "wuerfel" && (
        <>
          <polygon points="30,45 75,45 75,95 30,95" fill="#4CC3FF" {...s} />
          <polygon points="30,45 50,25 95,25 75,45" fill="#9EE0FF" {...s} />
          <polygon points="75,45 95,25 95,75 75,95" fill="#2A9FD9" {...s} />
        </>
      )}
      {solid === "quader" && (
        <>
          <polygon points="15,55 85,55 85,95 15,95" fill="#FF9F1C" {...s} />
          <polygon points="15,55 35,35 105,35 85,55" fill="#FFC680" {...s} />
          <polygon points="85,55 105,35 105,75 85,95" fill="#D97B00" {...s} />
        </>
      )}
      {solid === "kugel" && (
        <>
          <defs>
            <radialGradient id="kugel-g" cx="0.35" cy="0.35" r="0.75">
              <stop offset="0" stopColor="#FFD6E7" />
              <stop offset="1" stopColor="#FF5D9E" />
            </radialGradient>
          </defs>
          <circle cx="60" cy="62" r="42" fill="url(#kugel-g)" {...s} />
        </>
      )}
      {solid === "zylinder" && (
        <>
          <path d="M25 30 V90 A35 12 0 0 0 95 90 V30" fill="#2BB673" {...s} />
          <ellipse cx="60" cy="30" rx="35" ry="12" fill="#7DDBA8" {...s} />
        </>
      )}
      {solid === "kegel" && (
        <>
          <path d="M60 12 L22 92 A38 13 0 0 0 98 92 Z" fill="#9B7BFF" {...s} />
          <path d="M22 92 A38 13 0 0 1 98 92" fill="none" stroke={INK} strokeWidth="2" strokeDasharray="5 5" />
        </>
      )}
      {solid === "pyramide" && (
        <>
          <polygon points="60,14 20,90 70,104" fill="#FFC531" {...s} />
          <polygon points="60,14 70,104 102,84" fill="#E5A100" {...s} />
        </>
      )}
    </svg>
  );
}
