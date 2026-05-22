"use client";

import { useCallback, useEffect, useRef } from "react";
import { fxSrc } from "@/data/voices";

type FxId = "bird-chirp" | "wind-soft" | "bridge-creak" | "magic-chime";

/**
 * Hook für kurze Sound-Effekte (kein loop, kein State).
 *
 * Lädt die Audio-Objekte einmal beim Mount und cached sie pro Komponente,
 * damit `play("magic-chime")` keinen Roundtrip braucht. Wenn die mp3 (noch)
 * nicht im public-Tree liegt, scheitert `.play()` leise — keine Konsolen-
 * Fehler, keine UI-Bruch.
 *
 * Verwendung:
 *   const playFx = useSoundFx();
 *   playFx("magic-chime");
 *
 * Volumes:
 *   - magic-chime: 0.5 (gut hörbar, aber nicht laut)
 *   - bird-chirp:  0.4
 *   - bridge-creak: 0.3 (Atmosphäre, nicht erschreckend)
 *   - wind-soft:   0.25 (Hintergrund-Layer falls ohne AmbientPlayer benutzt)
 */
const FX_VOLUMES: Record<FxId, number> = {
  "magic-chime": 0.5,
  "bird-chirp": 0.4,
  "bridge-creak": 0.3,
  "wind-soft": 0.25,
};

export function useSoundFx() {
  const cache = useRef<Partial<Record<FxId, HTMLAudioElement>>>({});

  useEffect(() => {
    // Pre-load on mount — kostet nichts, macht Plays instant.
    (Object.keys(FX_VOLUMES) as FxId[]).forEach((id) => {
      if (cache.current[id]) return;
      try {
        const audio = new Audio(fxSrc(id));
        audio.preload = "auto";
        audio.volume = FX_VOLUMES[id];
        cache.current[id] = audio;
      } catch {
        // ignore (SSR safety net)
      }
    });
    return () => {
      Object.values(cache.current).forEach((a) => a?.pause());
      cache.current = {};
    };
  }, []);

  return useCallback((id: FxId) => {
    const cached = cache.current[id];
    if (cached) {
      try {
        cached.currentTime = 0;
        cached.play().catch(() => {
          // Autoplay-Policy oder Datei fehlt — beides okay, kein UI-Impact.
        });
        return;
      } catch {
        // ignore
      }
    }
    // Lazy-Fallback wenn Cache leer ist (z.B. erster Klick vor Mount).
    try {
      const audio = new Audio(fxSrc(id));
      audio.volume = FX_VOLUMES[id];
      audio.play().catch(() => {});
    } catch {
      // ignore
    }
  }, []);
}
