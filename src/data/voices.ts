// Voice-Map: zentrale Zuordnung Rolle → ElevenLabs-Stimme.
//
// Warum zentral?
// - Stimme tauschen = nur diese Datei anfassen, kein Refactor durch die Codebase.
// - Story-Beats tragen nur einen `speaker`-Key (z.B. "narrator"), nicht die Voice-ID.
// - Sound-Generation-Scripts lesen hier die ID + Settings.
//
// Voices (ElevenLabs Premade, alle multilingual_v2-fähig):
// - narrator: Sarah     — Mature, Reassuring, Confident. Wärme + Klarheit.
// - book:     Bill      — Wise, Mature, Balanced. Männlich, leicht magisch.
// - bird_pip: Lily      — Velvety Actress, hell, jung, verspielt.
//
// ElevenLabs Free-Tier: 10k chars/Monat. Stand 2026-05-22: 0 verbraucht.
// Sound-Generation läuft auf separatem Budget (laut Doku auf Free verfügbar).

export type Speaker = "narrator" | "book" | "bird_pip";

export type VoiceConfig = {
  /** ElevenLabs Voice-ID — premade. Nicht ändern ohne Test. */
  voiceId: string;
  /** Anzeige-Name für Logs / Debug. */
  displayName: string;
  /** Stability 0-1: höher = weniger Variation, mehr Konsistenz. */
  stability: number;
  /** Similarity-Boost 0-1: höher = näher an Original-Sample. */
  similarityBoost: number;
  /** Style 0-1: Exaggeration des Stils. Default 0 = neutral. */
  style: number;
};

export const VOICES: Record<Speaker, VoiceConfig> = {
  narrator: {
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    displayName: "Sarah",
    stability: 0.55,
    similarityBoost: 0.75,
    style: 0.15,
  },
  book: {
    voiceId: "pqHfZKP75CvOlQylNhV4",
    displayName: "Bill",
    stability: 0.6,
    similarityBoost: 0.7,
    style: 0.25,
  },
  bird_pip: {
    voiceId: "pFZP5JQG7iQjIQuC4Bku",
    displayName: "Lily",
    stability: 0.45,
    similarityBoost: 0.75,
    style: 0.35,
  },
};

/** Audio-Pfad für einen Speaker + Beat-ID. */
export function speakerAudioSrc(speaker: Speaker, id: string): string {
  return `/audio/${speaker}/${id}.mp3`;
}

/** Sound-FX-Pfad. */
export function fxSrc(id: string): string {
  return `/audio/fx/${id}.mp3`;
}

/** Ambient-Music-Pfad. */
export function ambientSrc(id: string): string {
  return `/audio/ambient/${id}.mp3`;
}
