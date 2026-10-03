// Münzen und Scheine als Vektor-Grafik — Cent kupfer/gold, Euro zweifarbig,
// Scheine in den echten Grundfarben (5 € grau, 10 € rot, 20 € blau).

const COPPER = ["#E08A4B", "#B5652B"];
const GOLD = ["#F2C14E", "#C99A1E"];

function label(v: number): string {
  return v >= 100 ? `${v / 100} €` : `${v} ct`;
}

export function MoneyPiece({ value, size = 52 }: { value: number; size?: number }) {
  if (value >= 500) {
    const [bg, dark] = value === 500 ? ["#B9BFC9", "#7C8594"] : value === 1000 ? ["#F08C7A", "#C2533F"] : ["#7FB4E8", "#3E77B5"];
    const w = size * 1.7;
    const h = size * 0.95;
    return (
      <svg viewBox="0 0 170 95" width={w} height={h} aria-label={label(value)} role="img">
        <rect x="3" y="3" width="164" height="89" rx="10" fill={bg} stroke={dark} strokeWidth="4" />
        <rect x="14" y="14" width="142" height="67" rx="6" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="3" />
        <circle cx="130" cy="47" r="22" fill="#fff" fillOpacity="0.35" />
        <text x="62" y="62" textAnchor="middle" fontFamily="var(--font-fredoka)" fontWeight="600" fontSize="40" fill="#1F2347">
          {value / 100} €
        </text>
      </svg>
    );
  }
  const euro = value >= 100;
  // Größere Werte → etwas größere Münzen, wie in echt.
  const scale = { 1: 0.72, 2: 0.78, 5: 0.86, 10: 0.8, 20: 0.88, 50: 0.96, 100: 0.92, 200: 1 }[value] ?? 0.9;
  const s = size * scale;
  const [fill, dark] = value < 10 ? COPPER : GOLD;
  return (
    <svg viewBox="0 0 100 100" width={s} height={s} aria-label={label(value)} role="img">
      {euro ? (
        <>
          <circle cx="50" cy="50" r="46" fill={value === 100 ? "#F2C14E" : "#D7DCE4"} stroke="#7C8594" strokeWidth="4" />
          <circle cx="50" cy="50" r="30" fill={value === 100 ? "#D7DCE4" : "#F2C14E"} stroke="#7C8594" strokeWidth="3" />
        </>
      ) : (
        <>
          <circle cx="50" cy="50" r="46" fill={fill} stroke={dark} strokeWidth="4" />
          <circle cx="50" cy="50" r="36" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="3" />
        </>
      )}
      <text x="50" y={euro ? 60 : 58} textAnchor="middle" fontFamily="var(--font-fredoka)" fontWeight="600" fontSize={euro ? 30 : value >= 10 ? 32 : 36} fill="#1F2347">
        {euro ? `${value / 100}€` : value}
      </text>
      {!euro && (
        <text x="50" y="80" textAnchor="middle" fontFamily="var(--font-fredoka)" fontWeight="600" fontSize="14" fill="#1F2347">
          ct
        </text>
      )}
    </svg>
  );
}

export function MoneyRow({ items, size = 52 }: { items: number[]; size?: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {items.map((v, i) => (
        <MoneyPiece key={i} value={v} size={size} />
      ))}
    </div>
  );
}
