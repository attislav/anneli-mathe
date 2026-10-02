// Sticker-Wesen und Bosse — einfache Vektor-Figuren aus Parametern.

import type { Sticker } from "@/game/collection";
import type { WorldId } from "@/game/skills";

export function StickerArt({ sticker, size = 56, hidden = false }: { sticker: Sticker; size?: number; hidden?: boolean }) {
  const body = hidden ? "#E6E1D3" : sticker.color;
  const belly = hidden ? "#E6E1D3" : sticker.belly;
  const [rx, ry] = sticker.shape === "tall" ? [17, 22] : sticker.shape === "wide" ? [24, 16] : [20, 20];
  const cy = 36;
  const top = cy - ry;
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden="true">
      {sticker.rare && !hidden && <circle cx="30" cy="34" r="27" fill="#FFF3BF" />}
      {sticker.ears === "cat" && <path d={`M${30 - rx * 0.7} ${top + 6} L${30 - rx * 0.6} ${top - 9} L${30 - rx * 0.1} ${top + 2} Z M${30 + rx * 0.7} ${top + 6} L${30 + rx * 0.6} ${top - 9} L${30 + rx * 0.1} ${top + 2} Z`} fill={body} />}
      {sticker.ears === "round" && (
        <>
          <circle cx={30 - rx * 0.65} cy={top + 3} r="6" fill={body} />
          <circle cx={30 + rx * 0.65} cy={top + 3} r="6" fill={body} />
        </>
      )}
      {sticker.ears === "antenna" && (
        <g stroke={hidden ? body : "#1F2347"} strokeWidth="2" fill={hidden ? body : sticker.color}>
          <path d={`M24 ${top + 2} L20 ${top - 8} M36 ${top + 2} L40 ${top - 8}`} />
          <circle cx="20" cy={top - 9} r="3" />
          <circle cx="40" cy={top - 9} r="3" />
        </g>
      )}
      {sticker.ears === "horn" && <path d={`M30 ${top - 10} L26 ${top + 3} L34 ${top + 3} Z`} fill={hidden ? body : "#FFD23F"} />}
      <ellipse cx="30" cy={cy} rx={rx} ry={ry} fill={body} />
      <ellipse cx="30" cy={cy + ry * 0.35} rx={rx * 0.6} ry={ry * 0.45} fill={belly} />
      {!hidden && (
        <>
          <circle cx="23" cy={cy - 4} r="5.5" fill="#fff" />
          <circle cx="37" cy={cy - 4} r="5.5" fill="#fff" />
          <circle cx="24" cy={cy - 3} r="2.8" fill="#1F2347" />
          <circle cx="38" cy={cy - 3} r="2.8" fill="#1F2347" />
          <path d={`M26 ${cy + 4} Q30 ${cy + 8} 34 ${cy + 4}`} stroke="#1F2347" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      {hidden && (
        <text x="30" y={cy + 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="#B9B29C" fontFamily="var(--font-fredoka)">
          ?
        </text>
      )}
      {sticker.rare && !hidden && <path d="M50 6 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#FFC531" />}
    </svg>
  );
}

export function BossArt({ world, color, size = 120, mood = "grin" }: { world: WorldId; color: string; size?: number; mood?: "grin" | "ouch" | "dizzy" }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      {world === "start" && (
        <g fill={color} stroke="#1F2347" strokeWidth="3" strokeLinejoin="round">
          <path d="M18 50 Q2 34 14 18 Q22 30 30 26 Q24 40 30 50 Z" />
          <path d="M102 50 Q118 34 106 18 Q98 30 90 26 Q96 40 90 50 Z" />
          <path d="M30 96 L18 110 M42 100 L36 114 M90 96 L102 110 M78 100 L84 114" fill="none" />
        </g>
      )}
      <ellipse cx="60" cy="68" rx="42" ry={world === "start" ? 34 : 40} fill={color} stroke="#1F2347" strokeWidth="3" />
      {world === "wald" && (
        <>
          <path d="M30 34 L34 10 L48 26 L60 6 L72 26 L86 10 L90 34 Z" fill="#FFD23F" stroke="#1F2347" strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="60" cy="84" rx="22" ry="18" fill="#B9A8FF" />
        </>
      )}
      {world === "strand" && (
        <>
          <path d="M20 40 Q60 0 100 40 Z" fill="#1F2347" />
          <rect x="16" y="36" width="88" height="8" rx="4" fill="#1F2347" />
          <circle cx="60" cy="24" r="6" fill="#fff" />
          <path d="M62 56 h16 v10 h-16z" fill="#1F2347" />
        </>
      )}
      {/* Augen */}
      {mood === "dizzy" ? (
        <g stroke="#fff" strokeWidth="4" strokeLinecap="round">
          <path d="M36 54 l12 12 M48 54 l-12 12 M72 54 l12 12 M84 54 l-12 12" />
        </g>
      ) : (
        <>
          <circle cx="44" cy="60" r="11" fill="#fff" />
          {!(world === "strand") && <circle cx="76" cy="60" r="11" fill="#fff" />}
          <circle cx={mood === "ouch" ? 44 : 46} cy={mood === "ouch" ? 63 : 61} r="5" fill="#1F2347" />
          {!(world === "strand") && <circle cx={mood === "ouch" ? 76 : 74} cy={mood === "ouch" ? 63 : 61} r="5" fill="#1F2347" />}
          <path d={mood === "ouch" ? "M32 44 L54 50 M88 44 L66 50" : "M32 48 L54 44 M88 48 L66 44"} stroke="#1F2347" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      {mood === "grin" ? (
        <path d="M40 80 h40 l-4 8 -4 -5 -4 5 -4 -5 -4 5 -4 -5 -4 5 -4 -5 -4 5 z" fill="#fff" stroke="#1F2347" strokeWidth="2" strokeLinejoin="round" />
      ) : (
        <ellipse cx="60" cy="86" rx={mood === "dizzy" ? 10 : 7} ry="6" fill="#1F2347" />
      )}
    </svg>
  );
}
