"use client";

// Vorlese-Funktion fürs Kopfrechen-Training.
//
// Zwei Wege, in dieser Reihenfolge:
//
//  1. Vorproduzierte Gemini-Clips. Feste Sätze liegen am Stück
//     (`/audio/training/text/...`), Aufgaben und Tipps werden aus Zahlen
//     und Textbausteinen zusammengesetzt und hintereinander abgespielt.
//  2. Die Sprachausgabe des Geräts. Greift, solange die Clips noch nicht
//     erzeugt sind (`npm run gen:training-audio`) oder eine Datei fehlt.
//     Ohne diesen Fallback wäre die App zwischen Code-Stand und
//     Audio-Stand stumm.
//
// Bewusst KEIN API-Aufruf zur Laufzeit: die App ist ein statischer Export,
// es gibt keinen Server, der einen Schlüssel halten könnte.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  partAudioSrc,
  speechPlainText,
  splitSpeech,
  staticAudioSrc,
  type SpeechPart,
} from "@/data/training/speech";

/** Ein Audio-Element je Datei — einmal geladen, beliebig oft abgespielt. */
const audioCache = new Map<string, HTMLAudioElement>();
/** Dateien, die es nachweislich nicht gibt. Kein zweiter Fehlversuch. */
const missing = new Set<string>();

function getAudio(src: string): HTMLAudioElement {
  const cached = audioCache.get(src);
  if (cached) return cached;
  const audio = new Audio(src);
  audio.preload = "auto";
  audioCache.set(src, audio);
  return audio;
}

/** Spielt eine Datei zu Ende. Wirft, wenn sie fehlt oder nicht abspielbar ist. */
function playClip(src: string): Promise<void> {
  if (missing.has(src)) return Promise.reject(new Error(`fehlt: ${src}`));
  const audio = getAudio(src);
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("error", onError);
    };
    const onEnd = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      missing.add(src);
      reject(new Error(`fehlt: ${src}`));
    };
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("error", onError);
    audio.currentTime = 0;
    audio.play().catch((err) => {
      cleanup();
      reject(err);
    });
  });
}

/** Fügt Sätze für die Gerätestimme zusammen, ohne doppelte Satzpunkte. */
function joinSentences(texts: string[]): string {
  return texts.map((t) => (/[.!?]$/.test(t.trim()) ? t.trim() : `${t.trim()}.`)).join(" ");
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Sprachausgabe des Geräts — Fallback, wenn Clips fehlen. */
function speakWithDevice(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

function stopDevice(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}

export type SpeechHandle = {
  /** Liest einen dynamischen Text vor (Aufgabe, Tipp, Rechenweg). */
  speak: (text: string) => void;
  /** Liest einen festen Text vor — eine Datei, ganzer Satz. */
  speakStatic: (id: string, text: string) => void;
  /** Liest mehrere feste Texte nacheinander vor (ganzer Trick am Stück). */
  speakStaticSequence: (items: { id: string; text: string }[]) => void;
  /** Bricht ab, egal auf welchem Weg gerade gesprochen wird. */
  stop: () => void;
  /** Läuft gerade eine Ausgabe? */
  speaking: boolean;
};

export function useSpeech(): SpeechHandle {
  const [speaking, setSpeaking] = useState(false);
  // Jede Ausgabe bekommt eine Nummer; eine ältere Sequenz erkennt daran,
  // dass sie überholt wurde, und bricht nach dem laufenden Clip ab.
  const runId = useRef(0);

  const stopAll = useCallback(() => {
    runId.current++;
    stopDevice();
    for (const audio of audioCache.values()) {
      if (!audio.paused) audio.pause();
    }
    setSpeaking(false);
  }, []);

  // Beim Verlassen der Seite nicht weiterreden.
  useEffect(() => () => stopAll(), [stopAll]);

  const playParts = useCallback(
    async (parts: SpeechPart[], fallbackText: string) => {
      runId.current++;
      const myRun = runId.current;
      stopDevice();
      setSpeaking(true);

      try {
        for (const part of parts) {
          if (runId.current !== myRun) return;
          if (part.kind === "pause") {
            await wait(part.ms);
            continue;
          }
          const src = partAudioSrc(part);
          if (!src) continue;
          await playClip(src);
        }
      } catch {
        // Mindestens ein Clip fehlt → lieber den ganzen Satz mit der
        // Gerätestimme, als ihn halb vorgelesen abzubrechen.
        if (runId.current === myRun) speakWithDevice(fallbackText);
      } finally {
        if (runId.current === myRun) setSpeaking(false);
      }
    },
    []
  );

  const speak = useCallback(
    (text: string) => {
      const parts = splitSpeech(text);
      void playParts(parts, speechPlainText(parts));
    },
    [playParts]
  );

  const speakStatic = useCallback(
    (id: string, text: string) => {
      runId.current++;
      const myRun = runId.current;
      stopDevice();
      setSpeaking(true);
      playClip(staticAudioSrc(id))
        .catch(() => {
          if (runId.current === myRun) speakWithDevice(text);
        })
        .finally(() => {
          if (runId.current === myRun) setSpeaking(false);
        });
    },
    []
  );

  const speakStaticSequence = useCallback(
    (items: { id: string; text: string }[]) => {
      if (items.length === 0) return;
      runId.current++;
      const myRun = runId.current;
      stopDevice();
      setSpeaking(true);

      void (async () => {
        try {
          for (const item of items) {
            if (runId.current !== myRun) return;
            await playClip(staticAudioSrc(item.id));
            await wait(220); // Atempause zwischen den Sätzen
          }
        } catch {
          // Fehlt ein Clip, liest die Gerätestimme den Rest am Stück vor.
          if (runId.current === myRun) speakWithDevice(joinSentences(items.map((i) => i.text)));
        } finally {
          if (runId.current === myRun) setSpeaking(false);
        }
      })();
    },
    []
  );

  return { speak, speakStatic, speakStaticSequence, stop: stopAll, speaking };
}

// ----- Auto-Vorlesen ---------------------------------------------------------

const AUTO_KEY = "anneli.training.autoread.v1";

/**
 * „Aufgaben automatisch vorlesen" — Anneli soll die Aufgabe hören können,
 * ohne jedes Mal auf den Lautsprecher zu tippen. Default: aus, damit die App
 * nicht ungefragt lospoltert.
 */
export function loadAutoRead(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(AUTO_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveAutoRead(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AUTO_KEY, enabled ? "1" : "0");
  } catch {
    // Storage aus — dann gilt die Einstellung eben nur für diese Sitzung.
  }
}
