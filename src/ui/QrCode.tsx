// QR-Code als SVG (ein Pfad, scharf in jeder Größe).

import qrcode from "qrcode-generator";

export function QrCode({ text, size = 300 }: { text: string; size?: number }) {
  const qr = qrcode(0, "L");
  qr.addData(text, "Byte");
  qr.make();
  const n = qr.getModuleCount();
  let d = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
  const q = 4; // Ruhezone
  return (
    <svg viewBox={`${-q} ${-q} ${n + 2 * q} ${n + 2 * q}`} width={size} height={size} shapeRendering="crispEdges" role="img" aria-label="QR-Code mit dem Spielstand" className="rounded-xl bg-white">
      <rect x={-q} y={-q} width={n + 2 * q} height={n + 2 * q} fill="#fff" />
      <path d={d} fill="#000" />
    </svg>
  );
}
