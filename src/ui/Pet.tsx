// Das Haustier — drei Arten, drei Entwicklungsstufen, Zubehör aus dem Laden.
// Platzhalter-Vektoren, bis die KI-Bilder da sind; die Schnittstelle
// (Art, Stufe, Stimmung, Zubehör) bleibt dann gleich.

import { PETS, type PetSpecies } from "@/game/collection";

export type Mood = "happy" | "joy" | "think" | "sleepy";

type Props = {
  species: PetSpecies;
  stage?: 1 | 2 | 3;
  mood?: Mood;
  equipped?: string[];
  size?: number;
  className?: string;
};

export function Pet({ species, stage = 1, mood = "happy", equipped = [], size = 96, className }: Props) {
  const p = PETS[species];
  const has = (id: string) => equipped.includes(id);
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} aria-hidden="true">
      {stage === 3 && (
        <g fill="#FFD23F">
          <path d="M14 30 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" />
          <path d="M104 22 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
          <path d="M108 86 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2z" />
        </g>
      )}

      {/* Art-spezifisches hinter dem Körper */}
      {species === "drachi" && (
        <>
          <path d={stage >= 2 ? "M92 90 Q122 96 114 66 Q108 84 90 80Z" : "M94 92 Q112 96 108 80 Q102 88 92 84Z"} fill={p.color} stroke={p.accent} strokeWidth="2" />
          {stage >= 2 && <path d="M22 70 Q4 54 14 40 Q20 58 30 62Z M98 70 Q116 54 106 40 Q100 58 90 62Z" fill={p.belly} stroke={p.accent} strokeWidth="2" />}
        </>
      )}
      {species === "pieps" && <path d="M22 66 Q10 86 26 100 Q30 84 30 70Z M98 66 Q110 86 94 100 Q90 84 90 70Z" fill={p.accent} />}
      {species === "funkel" && stage >= 2 && <path d="M92 96 Q118 100 112 74 Q106 70 104 78 Q108 92 90 88Z" fill={p.color} />}

      {/* Ohren / Hörner */}
      {species === "funkel" && (
        <>
          <path d="M28 46 L34 14 L54 36 Z" fill={p.color} />
          <path d="M92 46 L86 14 L66 36 Z" fill={p.color} />
          <path d="M34 38 L37 24 L46 34 Z" fill={p.accent} />
          <path d="M86 38 L83 24 L74 34 Z" fill={p.accent} />
        </>
      )}
      {species === "drachi" && (
        <>
          <path d="M40 36 L34 12 L52 30 Z" fill="#FFD23F" stroke="#E5A100" strokeWidth="2" strokeLinejoin="round" />
          <path d="M80 36 L86 12 L68 30 Z" fill="#FFD23F" stroke="#E5A100" strokeWidth="2" strokeLinejoin="round" />
        </>
      )}
      {species === "pieps" && (
        <>
          <path d="M30 42 L24 16 L48 32 Z" fill={p.accent} />
          <path d="M90 42 L96 16 L72 32 Z" fill={p.accent} />
        </>
      )}

      <circle cx="60" cy="68" r="40" fill={p.color} />
      <ellipse cx="60" cy="82" rx="24" ry="18" fill={p.belly} />
      {species === "pieps" && <path d="M48 80 q6 5 12 0 q6 5 12 0 M48 90 q6 5 12 0 q6 5 12 0" stroke={p.color} strokeWidth="2.5" fill="none" strokeLinecap="round" />}

      {/* Augen */}
      {mood === "joy" ? (
        <g stroke="#1F2347" strokeWidth="4" fill="none" strokeLinecap="round">
          <path d="M38 62 Q46 52 54 62" />
          <path d="M66 62 Q74 52 82 62" />
        </g>
      ) : mood === "sleepy" ? (
        <g stroke="#1F2347" strokeWidth="4" fill="none" strokeLinecap="round">
          <path d="M38 60 Q46 66 54 60" />
          <path d="M66 60 Q74 66 82 60" />
        </g>
      ) : (
        <>
          <circle cx="46" cy="60" r={species === "pieps" ? 12 : 10} fill="#fff" />
          <circle cx="74" cy="60" r={species === "pieps" ? 12 : 10} fill="#fff" />
          <circle cx={mood === "think" ? 49 : 47} cy={mood === "think" ? 57 : 61} r="5.5" fill="#1F2347" />
          <circle cx={mood === "think" ? 77 : 75} cy={mood === "think" ? 57 : 61} r="5.5" fill="#1F2347" />
          <circle cx="49" cy="58" r="1.8" fill="#fff" />
          <circle cx="77" cy="58" r="1.8" fill="#fff" />
        </>
      )}
      <circle cx="33" cy="74" r="5.5" fill="#FF5D9E" opacity="0.45" />
      <circle cx="87" cy="74" r="5.5" fill="#FF5D9E" opacity="0.45" />

      {/* Mund / Schnabel */}
      {species === "pieps" ? (
        <path d="M54 70 L66 70 L60 80 Z" fill="#FF9F1C" stroke="#D97B00" strokeWidth="1.5" strokeLinejoin="round" />
      ) : mood === "joy" ? (
        <path d="M50 72 Q60 86 70 72 Z" fill="#1F2347" />
      ) : mood === "think" ? (
        <circle cx="60" cy="76" r="3.5" fill="#1F2347" />
      ) : (
        <path d="M51 74 Q60 82 69 74" stroke="#1F2347" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      )}
      {species === "funkel" && (
        <g stroke={p.accent} strokeWidth="2" strokeLinecap="round">
          <path d="M20 70 H32 M21 78 L32 75 M100 70 H88 M99 78 L88 75" />
        </g>
      )}

      {/* Zubehör */}
      {has("schal") && (
        <g>
          <path d="M26 92 Q60 108 94 92 L92 100 Q60 116 28 100 Z" fill="#FF5D5D" />
          <path d="M28 100 Q60 116 92 100 L90 104 Q60 118 30 104Z" fill="#FFD23F" />
          <path d="M76 104 L84 120 L72 118 Z" fill="#4CC3FF" />
        </g>
      )}
      {has("fliege") && <path d="M60 98 L44 90 L44 106 Z M60 98 L76 90 L76 106 Z" fill="#7B4DFF" stroke="#5A2FE0" strokeWidth="2" strokeLinejoin="round" />}
      {has("brille") && (
        <g fill="none" stroke="#1F2347" strokeWidth="3">
          <path d="M46 48 l3 6 6 1 -4.5 4 1 6 -5.5 -3 -5.5 3 1 -6 -4.5 -4 6 -1z" fill="#FF9EC7" fillOpacity="0.55" />
          <path d="M74 48 l3 6 6 1 -4.5 4 1 6 -5.5 -3 -5.5 3 1 -6 -4.5 -4 6 -1z" fill="#FF9EC7" fillOpacity="0.55" />
          <path d="M54 60 H66" />
        </g>
      )}
      {has("schleife") && <path d="M60 30 L42 20 L42 40 Z M60 30 L78 20 L78 40 Z" fill="#FF5D9E" stroke="#C93B77" strokeWidth="2" strokeLinejoin="round" />}
      {has("zauberhut") && (
        <g>
          <path d="M60 0 L80 34 H40 Z" fill="#7B4DFF" />
          <rect x="32" y="30" width="56" height="8" rx="4" fill="#5A2FE0" />
          <circle cx="58" cy="16" r="2.5" fill="#FFD23F" />
          <circle cx="66" cy="26" r="2" fill="#FFD23F" />
        </g>
      )}
      {has("krone") && <path d="M38 34 L40 12 L50 24 L60 6 L70 24 L80 12 L82 34 Z" fill="#FFD23F" stroke="#E5A100" strokeWidth="2.5" strokeLinejoin="round" />}
    </svg>
  );
}

export function Egg({ species, size = 110, className }: { species: PetSpecies; size?: number; className?: string }) {
  const p = PETS[species];
  return (
    <svg viewBox="0 0 100 120" width={size} height={(size * 120) / 100} className={className} aria-hidden="true">
      <path d="M50 6 C78 6 94 52 94 76 C94 102 74 116 50 116 C26 116 6 102 6 76 C6 52 22 6 50 6 Z" fill={p.egg} stroke={p.accent} strokeWidth="3" />
      <circle cx="34" cy="50" r="8" fill={p.eggSpots} />
      <circle cx="64" cy="36" r="6" fill={p.eggSpots} />
      <circle cx="70" cy="76" r="10" fill={p.eggSpots} />
      <circle cx="36" cy="92" r="6" fill={p.eggSpots} />
    </svg>
  );
}
