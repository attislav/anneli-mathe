// Zeichnet ein Ausmalbild aus seinen Ebenen — als Vorschau oder zum Antippen.

import type { ColoringPage, Layer, Shape } from "@/game/coloring";

type Props = {
  page: ColoringPage;
  fills: Record<string, string>;
  size?: number;
  onRegion?: (region: string) => void;
  /** Rechen-Malbild: Beschriftung pro Fläche. */
  labels?: Record<string, string>;
  className?: string;
};

function ShapeEl({ shape, ...p }: { shape: Shape } & React.SVGAttributes<SVGElement>) {
  switch (shape.t) {
    case "path":
      return <path d={shape.d} {...p} />;
    case "circle":
      return <circle cx={shape.cx} cy={shape.cy} r={shape.r} {...p} />;
    case "ellipse":
      return <ellipse cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} {...p} />;
    case "rect":
      return <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.rx} {...p} />;
  }
}

export function ColoringSvg({ page, fills, size = 340, onRegion, labels, className }: Props) {
  const stroke = size < 120 ? 5 : 3;
  return (
    <svg viewBox="0 0 340 340" width={size} height={size} className={className} role={onRegion ? "img" : undefined} aria-label={page.title}>
      {page.layers.map((layer: Layer, i) => {
        if (layer.strokeOnly) return <ShapeEl key={i} shape={layer.shape} fill="none" stroke="#1F2347" strokeWidth={stroke} strokeLinecap="round" pointerEvents="none" />;
        if (layer.fixed) return <ShapeEl key={i} shape={layer.shape} fill={layer.fixed} pointerEvents="none" />;
        const region = layer.region!;
        return (
          <ShapeEl
            key={i}
            shape={layer.shape}
            fill={fills[region] ?? "#FFFFFF"}
            stroke="#1F2347"
            strokeWidth={stroke}
            strokeLinejoin="round"
            style={{ transition: "fill 0.25s ease", cursor: onRegion ? "pointer" : undefined }}
            onClick={onRegion ? () => onRegion(region) : undefined}
          />
        );
      })}
      {labels && (
        <g pointerEvents="none" fontFamily="var(--font-fredoka)" fontWeight="600" fontSize="17" textAnchor="middle">
          {Object.entries(labels).map(([region, text]) => {
            const pos = page.regions[region]?.label;
            if (!pos) return null;
            return (
              <text key={region} x={pos[0]} y={pos[1] + 6} fill="#1F2347" stroke="#fff" strokeWidth="4" paintOrder="stroke">
                {text}
              </text>
            );
          })}
        </g>
      )}
    </svg>
  );
}
