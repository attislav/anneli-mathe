"use client";

// Farbeimer für KI-Linienbilder.
//
// Das Bild wird einmal in Flächen zerlegt: Alles Dunkle ist Linie, jede
// zusammenhängende helle Fläche bekommt eine Nummer. Antippen färbt die
// ganze Fläche. Gespeichert werden nur die Klicks ([x, y, Farbe]), damit
// der Spielstand klein bleibt; beim Öffnen werden sie neu abgespielt.

import type { PaintOp } from "./state";

/** Ab dieser Helligkeit (0–255) ist ein Pixel keine Linie mehr. */
const LINE = 150;

export type PaintImage = {
  w: number;
  h: number;
  /** Helligkeit pro Pixel (0 = schwarz). */
  lum: Uint8ClampedArray;
  /** Flächen-Nummer pro Pixel, -1 = Linie. */
  label: Int32Array;
};

export async function loadPaintImage(src: string): Promise<PaintImage> {
  const img = new Image();
  img.src = src;
  await img.decode();
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(0, 0, w, h).data;
  const lum = new Uint8ClampedArray(w * h);
  for (let i = 0; i < w * h; i++) lum[i] = (px[i * 4] * 299 + px[i * 4 + 1] * 587 + px[i * 4 + 2] * 114) / 1000;
  return { w, h, lum, label: labelRegions(lum, w, h) };
}

function labelRegions(lum: Uint8ClampedArray, w: number, h: number): Int32Array {
  const label = new Int32Array(w * h).fill(-2);
  const stack = new Int32Array(w * h);
  let next = 0;
  for (let start = 0; start < w * h; start++) {
    if (label[start] !== -2) continue;
    if (lum[start] < LINE) {
      label[start] = -1;
      continue;
    }
    let top = 0;
    stack[top++] = start;
    label[start] = next;
    const visit = (q: number) => {
      if (label[q] !== -2) return;
      if (lum[q] < LINE) {
        label[q] = -1;
        return;
      }
      label[q] = next;
      stack[top++] = q;
    };
    while (top > 0) {
      const p = stack[--top];
      const x = p % w;
      if (x > 0) visit(p - 1);
      if (x < w - 1) visit(p + 1);
      if (p >= w) visit(p - w);
      if (p < w * (h - 1)) visit(p + w);
    }
    next++;
  }
  return label;
}

/** Fläche unter einem Punkt — trifft man genau eine Linie, wird in der Nähe gesucht. */
export function regionAt(pi: PaintImage, x: number, y: number): number {
  const { w, h, label } = pi;
  for (let r = 0; r <= 6; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const xx = Math.round(x) + dx;
        const yy = Math.round(y) + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const l = label[yy * w + xx];
        if (l >= 0) return l;
      }
    }
  }
  return -1;
}

function hexRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Klicks in Flächenfarben übersetzen (spätere Klicks überschreiben frühere). */
export function regionColors(pi: PaintImage, ops: PaintOp[]): Map<number, string> {
  const colors = new Map<number, string>();
  for (const [x, y, color] of ops) {
    const l = regionAt(pi, x, y);
    if (l >= 0) colors.set(l, color);
  }
  return colors;
}

/** Bild mit Farben auf eine Leinwand (in Originalgröße) zeichnen. */
export function renderPaint(canvas: HTMLCanvasElement, pi: PaintImage, ops: PaintOp[]): void {
  const { w, h, lum, label } = pi;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const out = ctx.createImageData(w, h);
  const d = out.data;
  const rgb = new Map<number, [number, number, number]>();
  for (const [l, c] of regionColors(pi, ops)) rgb.set(l, hexRgb(c));
  for (let i = 0; i < w * h; i++) {
    const v = lum[i];
    const c = label[i] >= 0 ? rgb.get(label[i]) : undefined;
    // Kanten-Pixel (grau) dunkeln die Farbe ab, damit die Linien weich bleiben.
    const k = v / 255;
    d[i * 4] = c ? c[0] * k : v;
    d[i * 4 + 1] = c ? c[1] * k : v;
    d[i * 4 + 2] = c ? c[2] * k : v;
    d[i * 4 + 3] = 255;
  }
  ctx.putImageData(out, 0, 0);
}
