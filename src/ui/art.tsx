"use client";

// Kleine Grafiken: Stern, Münze, Truhe, Flamme. Als KI-Bild aus dem
// Icon-Atlas (`npm run gen:icons`); bis er geladen ist (und falls er nicht
// lädt), die gezeichnete Vektor-Version.
// System-Icons (Schließen, Lautsprecher …) kommen aus lucide-react.

import { artSrc, ICON_ATLAS, ICONS, useArtReady } from "@/game/art";

type P = { size?: number; className?: string };

/** Ein Icon aus dem Atlas — als <span>, damit es auch mitten im Text sitzen darf. */
function AtlasIcon({ icon, size, className }: { icon: keyof typeof ICONS; size: number; className?: string }) {
  const i = ICONS[icon];
  const { cols, rows } = ICON_ATLAS;
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        flexShrink: 0,
        width: size,
        height: size,
        backgroundImage: `url(${artSrc(ICON_ATLAS)})`,
        backgroundSize: `${cols * size}px ${rows * size}px`,
        backgroundPosition: `${-(i % cols) * size}px ${-Math.floor(i / cols) * size}px`,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}

export function StarIcon({ size = 24, className, empty = false }: P & { empty?: boolean }) {
  if (useArtReady(ICON_ATLAS)) return <AtlasIcon icon={empty ? "star-empty" : "star"} size={size} className={className} />;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path
        d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"
        fill={empty ? "rgba(255,255,255,0.85)" : "#FFC531"}
        stroke={empty ? "#C2CAD6" : "#E5A100"}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CoinIcon({ size = 24, className }: P) {
  if (useArtReady(ICON_ATLAS)) return <AtlasIcon icon="coin" size={size} className={className} />;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" fill="#FF9F1C" stroke="#D97B00" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="5.5" fill="none" stroke="#FFD08A" strokeWidth="2" />
    </svg>
  );
}

export function FlameIcon({ size = 24, className, off = false }: P & { off?: boolean }) {
  if (useArtReady(ICON_ATLAS)) return <AtlasIcon icon={off ? "flame-off" : "flame"} size={size} className={className} />;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path
        d="M12 2c1.2 3.6 5.5 5.6 5.5 10.6A5.5 5.5 0 0 1 6.5 12.6c0-2.2 1-3.8 2.2-4.8 0 2 1 3.2 2.2 3.2 0-3.2-.8-5.6 1.1-9z"
        fill={off ? "#C2CAD6" : "#FF6B3D"}
        stroke={off ? "#9AA6B8" : "#D9461A"}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChestArt({ size = 120, open = false, className }: P & { open?: boolean }) {
  if (useArtReady(ICON_ATLAS)) return <AtlasIcon icon={open ? "chest-open" : "chest"} size={size} className={className} />;
  return (
    <svg viewBox="0 0 120 110" width={size} height={(size * 110) / 120} className={className} aria-hidden="true">
      {open ? (
        <>
          <circle cx="60" cy="48" r="34" fill="#FFF3C4" opacity="0.8" />
          <path d="M12 44 L22 12 H98 L108 44 Z" fill="#FFB648" stroke="#B35F00" strokeWidth="4" strokeLinejoin="round" />
        </>
      ) : (
        <path d="M10 58 V44 a24 24 0 0 1 24 -24 h52 a24 24 0 0 1 24 24 V58 Z" fill="#FFB648" stroke="#B35F00" strokeWidth="4" strokeLinejoin="round" />
      )}
      <rect x="10" y="54" width="100" height="48" rx="10" fill="#FF9F1C" stroke="#B35F00" strokeWidth="4" />
      <rect x="52" y={open ? 54 : 20} width="16" height={open ? 48 : 82} fill="#FFD23F" />
      <rect x="48" y="48" width="24" height="22" rx="6" fill="#FFF3C4" stroke="#B35F00" strokeWidth="3" />
    </svg>
  );
}

/** Ein Stern-Trio für Ergebnisse und Knoten. */
export function StarRow({ count, size = 20, gap = 1 }: { count: number; size?: number; gap?: number }) {
  return (
    <div className="flex items-end justify-center" style={{ gap }}>
      {[0, 1, 2].map((i) => (
        <StarIcon key={i} size={i === 1 ? size * 1.15 : size} empty={i >= count} />
      ))}
    </div>
  );
}
