"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const MUTE_KEY = "anneli.ambient.muted.v1";
const DEFAULT_VOLUME = 0.18; // dezent — Hintergrund, kein Vordergrund

type Props = {
  /** Pfad zur loopbaren Ambient-mp3, z.B. "/audio/ambient/sky-kingdom.mp3". */
  src: string;
  /** Optionales Label für den Mute-Toggle (Screenreader). */
  label?: string;
};

/**
 * Dezenter Ambient-Music-Player für ganze Welten (z.B. Sky Kingdom).
 *
 * Verhalten:
 *  - Auto-Play bei Mount (sofern der Browser es ohne Geste erlaubt; sonst
 *    startet er beim ersten Klick auf den Mute-Toggle).
 *  - Volume 0.18 — bewusst leise, damit Voice-Narration darüber hörbar bleibt.
 *  - Loop, fade-in über 1.5s.
 *  - Mute-State in localStorage persistiert — wenn Anneli's Mama es einmal
 *    ausstellt, bleibt es aus.
 *  - Schwebender Mute-Button rechts unten (nicht über Story-Buch-UI).
 *
 * Wenn die Datei (noch) nicht existiert, scheitert das `<audio>` leise —
 * keine Fehler in der Konsole, keine UI-Bruch.
 */
export function AmbientPlayer({ src, label = "Hintergrund-Musik" }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);

  // Mute-Preference laden (client-side).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(MUTE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMuted(stored === "1");
    } catch {
      // ignore — Privacy-Mode etc.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, []);

  // Play/Pause + Volume-Fade an Mute-State angleichen.
  useEffect(() => {
    if (!ready) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = true;

    if (muted) {
      audio.pause();
      return;
    }

    // Versuche zu spielen — fail silently wenn Autoplay-Policy blockt.
    audio.volume = 0;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.catch(() => {
        // Browser blocked autoplay — wird durch Mute-Klick aufgelöst.
      });
    }
    // Fade-in über 1.5s, in 15 Schritten.
    let step = 0;
    const target = DEFAULT_VOLUME;
    const handle = window.setInterval(() => {
      step++;
      if (!audioRef.current) return window.clearInterval(handle);
      audioRef.current.volume = Math.min(target, (target / 15) * step);
      if (step >= 15) window.clearInterval(handle);
    }, 100);
    return () => window.clearInterval(handle);
  }, [muted, ready]);

  function toggle() {
    setMuted((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }

  return (
    <>
      <audio ref={audioRef} src={src} preload="auto" />
      <button
        type="button"
        onClick={toggle}
        aria-label={muted ? `${label} einschalten` : `${label} ausschalten`}
        title={muted ? `${label} einschalten` : `${label} leise drehen`}
        className="fixed bottom-44 right-6 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[var(--color-lavender-deep)] shadow-[var(--shadow-soft)] backdrop-blur transition-transform hover:scale-110"
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </>
  );
}
