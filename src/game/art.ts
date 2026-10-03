"use client";

// KI-Bilder (GPT Image 2.5 „Sunburst") als Sprite-Atlas.
//
// Alle Figuren einer Welle liegen in EINER Bilddatei (Zellen à 384 px) —
// ein Download statt fünfzehn, und der Browser cacht ihn. Die Original-
// PNGs und Prompts stehen in `scripts/art/jobs.json`.
//
// Reihenfolge beim Laden: erst die lokale Kopie in `public/art/` (holt
// `npm run art:fetch`), dann das Higgsfield-CDN. Lädt beides nicht, zeigen
// alle Komponenten ihre Vektor-Zeichnung als Fallback.

import { useSyncExternalStore } from "react";

export type Atlas = { local: string; url: string; cols: number; rows: number };

/** Haustiere, Eier, Bosse (Zellen à 384 px). */
export const ATLAS1: Atlas = {
  local: "/art/figuren.webp",
  url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/4c3602f6-051a-4d40-9e27-15a734fc408e.webp",
  cols: 5,
  rows: 3,
};

/** Die 36 Sticker, in derselben Reihenfolge wie `STICKERS` (Zellen à 192 px). */
export const STICKER_ATLAS: Atlas = {
  local: "/art/sticker.webp",
  url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/e3764a9e-6efc-4e4f-9ebd-34156f1e89d3.webp",
  cols: 6,
  rows: 6,
};

/**
 * Pro Figur: Zelle im Atlas, Kopf-Oberkante (`top`) und Augenhöhe (`eye`)
 * als Anteil der Zellenhöhe — damit sitzt Zubehör aus dem Laden auf dem Kopf.
 */
export const SPRITES = {
  "pet-funkel-1": { i: 0, top: 0.034, eye: 0.365 },
  "pet-funkel-2": { i: 1, top: 0.029, eye: 0.354 },
  "pet-funkel-3": { i: 2, top: 0.083, eye: 0.289 },
  "pet-drachi-1": { i: 3, top: 0.026, eye: 0.393 },
  "pet-drachi-2": { i: 4, top: 0.026, eye: 0.312 },
  "pet-drachi-3": { i: 5, top: 0.029, eye: 0.359 },
  "pet-pieps-1": { i: 6, top: 0.076, eye: 0.445 },
  "pet-pieps-2": { i: 7, top: 0.081, eye: 0.396 },
  "pet-pieps-3": { i: 8, top: 0.031, eye: 0.32 },
  "egg-funkel": { i: 9, top: 0, eye: 0 },
  "egg-drachi": { i: 10, top: 0, eye: 0 },
  "egg-pieps": { i: 11, top: 0, eye: 0 },
  "boss-start": { i: 12, top: 0.25, eye: 0.6 },
  "boss-wald": { i: 13, top: 0.03, eye: 0.28 },
  "boss-strand": { i: 14, top: 0.03, eye: 0.2 },
} as const;

export type SpriteKey = keyof typeof SPRITES;

// --- Ladezustand (pro Atlas) -------------------------------------------------

const resolved = new Map<string, string | null>();
const listeners = new Set<() => void>();

function tryLoad(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

function load(atlas: Atlas) {
  if (resolved.has(atlas.local) || typeof window === "undefined") return;
  resolved.set(atlas.local, null);
  void (async () => {
    for (const src of [atlas.local, atlas.url]) {
      if (await tryLoad(src)) {
        resolved.set(atlas.local, src);
        listeners.forEach((l) => l());
        return;
      }
    }
  })();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Die Bildquelle, die geladen hat — oder `null` (noch nicht / gar nicht). */
export function artSrc(atlas: Atlas): string | null {
  return resolved.get(atlas.local) ?? null;
}

/** `true`, sobald der Atlas geladen ist. Vorher und bei Fehlern: Vektor-Fallback. */
export function useArtReady(atlas: Atlas = ATLAS1): boolean {
  load(atlas);
  return useSyncExternalStore(subscribe, () => artSrc(atlas) !== null, () => false);
}
