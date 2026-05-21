"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Volume2 } from "lucide-react";

type Props = {
  /** Path to the mp3, relative to /public, e.g. "/audio/intro-book-greeting.mp3" */
  src: string;
  /** Optional accessible label. */
  label?: string;
  /** Visual variant. */
  variant?: "soft" | "primary";
};

export function AudioButton({ src, label = "Vorlesen", variant = "soft" }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // Pause when src changes (different audio loaded)
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, [src]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Browsers can refuse playback without user gesture; we got one (the click), so this should not happen.
      });
    } else {
      audio.pause();
    }
  }

  const styles =
    variant === "primary"
      ? "bg-[var(--color-lavender-deep)] text-white"
      : "bg-[var(--color-lavender)] text-[var(--color-lavender-deep)]";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={playing ? `${label} stoppen` : label}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-[var(--shadow-soft)] transition-transform hover:scale-110 ${styles}`}
    >
      {playing ? <Pause size={18} /> : <Volume2 size={18} />}
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
    </button>
  );
}
