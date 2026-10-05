"use client";

// Die App-Stimme: fertig aufgenommene Sätze (Lob, Trost, Begrüßung …) aus
// `public/stimme/<gruppe>-<n>.mp3`. Erzeugt mit `npm run gen:voice` aus
// `scripts/voice/lines.json` — zur Laufzeit wird keine API gerufen.
// Pro Gruppe wird zufällig ein Satz gespielt, aber nie zweimal derselbe hintereinander.

import lines from "./voiceLines.json";
import { readSave } from "./state";

const COUNTS: Record<string, number> = lines;
const last: Record<string, number> = {};
let current: HTMLAudioElement | null = null;

/** Einen Satz der Gruppe sprechen. Gibt zurück, ob er wirklich abgespielt wird. */
export function say(group: string): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  const n = COUNTS[group];
  if (!n || !readSave().settings.voice) return Promise.resolve(false);
  let i = Math.floor(Math.random() * n);
  if (n > 1 && i === last[group]) i = (i + 1) % n;
  last[group] = i;
  stopVoice();
  const audio = new Audio(`/stimme/${group}-${i}.mp3`);
  current = audio;
  // Ohne vorheriges Tippen blockt der Browser den Ton — dann eben still.
  return audio.play().then(
    () => true,
    () => false,
  );
}

export function stopVoice(): void {
  current?.pause();
  current = null;
}

/** Begrüßung, mit Namen, wenn es für diesen Namen eigene Aufnahmen gibt. */
export function greet(name?: string): Promise<boolean> {
  const slug = (name ?? "").trim().toLowerCase().replace(/[^a-z]/g, "");
  return say(COUNTS[`greet-${slug}`] ? `greet-${slug}` : "greet");
}
