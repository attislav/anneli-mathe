// Gebäck und Teller für die Bäckerei-Welt (Vektor, eigene Zeichnung).

import type { Treat } from "@/game/types";

export function TreatIcon({ item, size = 32 }: { item: Treat; size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      {item === "keks" && (
        <>
          <circle cx="20" cy="21" r="16" fill="#E3A36B" stroke="#9A5524" strokeWidth="2" />
          <circle cx="14" cy="16" r="2.6" fill="#5A3418" />
          <circle cx="24" cy="14" r="2.2" fill="#5A3418" />
          <circle cx="26" cy="25" r="2.6" fill="#5A3418" />
          <circle cx="15" cy="27" r="2" fill="#5A3418" />
        </>
      )}
      {item === "muffin" && (
        <>
          <path d="M9 22 H31 L28 37 H12 Z" fill="#7B4DFF" stroke="#4A2BB0" strokeWidth="2" strokeLinejoin="round" />
          <path d="M15 22 L16 37 M20 22 V37 M25 22 L24 37" stroke="#B9A8FF" strokeWidth="1.6" />
          <path d="M6 23 Q4 14 12 12 Q14 4 21 6 Q29 4 30 12 Q37 14 34 23 Z" fill="#FF9EC7" stroke="#C93B77" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="20" cy="6" r="3.4" fill="#FF5D5D" />
        </>
      )}
      {item === "brezel" && (
        <path
          d="M20 33 C8 33 4 24 7 17 C10 9 19 9 20 17 C21 9 30 9 33 17 C36 24 32 33 20 33 Z M13 30 L20 20 L27 30"
          fill="none"
          stroke="#B4652A"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function PlateArt({ width = 96 }: { width?: number }) {
  return (
    <svg viewBox="0 0 96 30" width={width} height={(width * 30) / 96} aria-hidden="true">
      <ellipse cx="48" cy="16" rx="46" ry="13" fill="#FFFFFF" stroke="#C2CAD6" strokeWidth="2" />
      <ellipse cx="48" cy="15" rx="32" ry="8" fill="#F4F1FF" />
    </svg>
  );
}
