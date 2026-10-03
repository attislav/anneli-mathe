// Analoge Uhr (Vektor). Kurzer Zeiger dunkelblau, langer Zeiger rot —
// dieselben Farben haben die Knöpfe beim Uhr-Stellen.

export const HOUR_COLOR = "#2E3A8C";
export const MINUTE_COLOR = "#E5484D";

export function ClockFace({ hour, minute, size = 200 }: { hour: number; minute: number; size?: number }) {
  const hAngle = ((hour % 12) + minute / 60) * 30;
  const mAngle = minute * 6;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label="Uhr">
      <circle cx="100" cy="100" r="96" fill="#5B6BD6" />
      <circle cx="100" cy="100" r="86" fill="#FFFFFF" />
      {Array.from({ length: 60 }, (_, i) => {
        const big = i % 5 === 0;
        const a = (i * 6 * Math.PI) / 180;
        const r1 = big ? 72 : 78;
        return <line key={i} x1={100 + r1 * Math.sin(a)} y1={100 - r1 * Math.cos(a)} x2={100 + 83 * Math.sin(a)} y2={100 - 83 * Math.cos(a)} stroke={big ? "#1F2347" : "#C2CAD6"} strokeWidth={big ? 3 : 1.5} strokeLinecap="round" />;
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1;
        const a = (n * 30 * Math.PI) / 180;
        return (
          <text key={n} x={100 + 58 * Math.sin(a)} y={100 - 58 * Math.cos(a)} textAnchor="middle" dominantBaseline="central" fontSize="19" fontWeight="700" fill="#1F2347" fontFamily="var(--font-fredoka), sans-serif">
            {n}
          </text>
        );
      })}
      <line x1="100" y1="100" x2="100" y2="52" stroke={HOUR_COLOR} strokeWidth="9" strokeLinecap="round" transform={`rotate(${hAngle} 100 100)`} />
      <line x1="100" y1="100" x2="100" y2="26" stroke={MINUTE_COLOR} strokeWidth="5" strokeLinecap="round" transform={`rotate(${mAngle} 100 100)`} />
      <circle cx="100" cy="100" r="7" fill="#1F2347" />
    </svg>
  );
}
