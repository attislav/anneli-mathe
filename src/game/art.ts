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
import type { WorldId } from "./genkit";

export type Atlas = { local: string; url: string; cols: number; rows: number };

/** Haustiere, Eier, Bosse (Zellen à 384 px). */
export const ATLAS1: Atlas = {
  local: "/art/figuren.webp",
  url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/4c3602f6-051a-4d40-9e27-15a734fc408e.webp",
  cols: 5,
  rows: 3,
};

/** Belohnungs-Icons (Zellen à 256 px), Reihenfolge wie `scripts/art/icons.json`. Liegt nur lokal. */
export const ICON_ATLAS: Atlas = { local: "/art/icons.webp", url: "/art/icons.webp", cols: 4, rows: 2 };
export const ICONS = { chest: 0, "chest-open": 1, coin: 2, star: 3, "star-empty": 4, flame: 5, "flame-off": 6 } as const;

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

/**
 * Landschaften hinter dem Pfad: pro Welt drei Bilder (9:16) von oben nach
 * unten, die ineinander überblenden. Originale in `scripts/art/backgrounds.json`.
 */
export const SCENERY: Partial<Record<WorldId, Atlas[]>> = {
  start: [
    { local: "/art/welt-start-1.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/b86519ae-271d-47a8-9c4b-e1aba5587887.webp", cols: 1, rows: 1 },
    { local: "/art/welt-start-2.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/f627b42e-b081-4814-a831-ca9797aa21ba.webp", cols: 1, rows: 1 },
    { local: "/art/welt-start-3.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/7ee00998-1983-4976-8aa7-3fd4d98bcfbe.webp", cols: 1, rows: 1 },
  ],
  wald: [
    { local: "/art/welt-wald-1.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/2ebc80ca-f4a1-4206-a72c-1e949626a242.webp", cols: 1, rows: 1 },
    { local: "/art/welt-wald-2.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/55ffc2c1-2932-40ff-9ed2-500edb541768.webp", cols: 1, rows: 1 },
    { local: "/art/welt-wald-3.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/f61f1940-56ad-4fbf-8054-50db938c8679.webp", cols: 1, rows: 1 },
  ],
  strand: [
    { local: "/art/welt-strand-1.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/48eaa9bb-c8d9-49a8-82f6-c0fb521a1371.webp", cols: 1, rows: 1 },
    { local: "/art/welt-strand-2.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/e6bbd949-7f5d-4229-b3be-9800965b0b2c.webp", cols: 1, rows: 1 },
    { local: "/art/welt-strand-3.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/11fca841-bc2e-45ab-bcbe-506b373e633f.webp", cols: 1, rows: 1 },
  ],
  hafen: [
    { local: "/art/welt-hafen-1.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/0736833a-aee0-41a4-b99e-043b22b5ea09.webp", cols: 1, rows: 1 },
    { local: "/art/welt-hafen-2.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/bbb6b32c-7767-40a3-a6ab-f6263dd9d946.webp", cols: 1, rows: 1 },
    { local: "/art/welt-hafen-3.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/adffa04f-066b-4bce-afb1-da7f85555444.webp", cols: 1, rows: 1 },
  ],
  zirkus: [
    { local: "/art/welt-zirkus-1.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/2e998c69-8ae6-4ccd-9d2c-9289def6ce8f.webp", cols: 1, rows: 1 },
    { local: "/art/welt-zirkus-2.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/d29d5b6f-b481-44b3-8859-a6cac5f0cd12.webp", cols: 1, rows: 1 },
    { local: "/art/welt-zirkus-3.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/adc1d03b-3417-4532-a24a-5ebfed45c964.webp", cols: 1, rows: 1 },
  ],
  baeckerei: [
    { local: "/art/welt-baeckerei-1.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/7a78faeb-8047-498f-bfcf-ad1afcbae50d.webp", cols: 1, rows: 1 },
    { local: "/art/welt-baeckerei-2.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/e0d8f50e-f594-493d-b585-39ea4e1753f5.webp", cols: 1, rows: 1 },
    { local: "/art/welt-baeckerei-3.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/8d42442b-3990-479d-9435-56272ad9d997.webp", cols: 1, rows: 1 },
  ],
  schloss: [
    { local: "/art/welt-schloss-1.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/b2b20d82-b67f-409f-802f-cff0fc19c699.webp", cols: 1, rows: 1 },
    { local: "/art/welt-schloss-2.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/ce3b6809-107c-46e6-beba-da1b7f0618bd.webp", cols: 1, rows: 1 },
    { local: "/art/welt-schloss-3.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/965febac-9a48-4a48-810d-007947a5c89b.webp", cols: 1, rows: 1 },
  ],
  ozean: [
    { local: "/art/welt-ozean-1.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/83983f06-ddf0-448f-9fd0-76d803cf8162.webp", cols: 1, rows: 1 },
    { local: "/art/welt-ozean-2.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/d1ad941e-d748-4f9f-8e2d-648300d4ca6a.webp", cols: 1, rows: 1 },
    { local: "/art/welt-ozean-3.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/5816a4e7-1eb0-4740-b98f-0da9f58e48e9.webp", cols: 1, rows: 1 },
  ],
  werkstatt: [
    { local: "/art/welt-werkstatt-1.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/8a04ee7f-4e85-4f82-aabb-3d7acbc168d3.webp", cols: 1, rows: 1 },
    { local: "/art/welt-werkstatt-2.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/69c3cdd8-a15e-476e-bb94-6fa5bcb9da7e.webp", cols: 1, rows: 1 },
    { local: "/art/welt-werkstatt-3.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/17df5836-4d83-4843-ab1c-0127b379054e.webp", cols: 1, rows: 1 },
  ],
  detektiv: [
    { local: "/art/welt-detektiv-1.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/1ab33bf0-50e8-437c-96d2-641a6f355bb8.webp", cols: 1, rows: 1 },
    { local: "/art/welt-detektiv-2.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/58978f9b-0c92-4a3a-be11-db50c672677b.webp", cols: 1, rows: 1 },
    { local: "/art/welt-detektiv-3.webp", url: "https://d2ol7oe51mr4n9.cloudfront.net/user_34CpzANSYTN5lT5oWjDUu48FOVp/848e5c67-cdf1-4ab8-806a-6da94651a37b.webp", cols: 1, rows: 1 },
  ],
};

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
