// Saison-Events: Halloween (Oktober) und Winter mit Adventskalender (Dezember).

export type SeasonId = "halloween" | "winter";

export const SEASON_NAMES: Record<SeasonId, string> = { halloween: "Halloween", winter: "Winterzauber" };

/** Welches Event läuft gerade? Halloween: 1.10.–3.11., Winter: 1.12.–26.12. */
export function activeSeason(d = new Date()): SeasonId | null {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (m === 10 || (m === 11 && day <= 3)) return "halloween";
  if (m === 12 && day <= 26) return "winter";
  return null;
}

/** Heutiger Advents-Tag (1–24), sonst 0. */
export function adventDay(d = new Date()): number {
  return d.getMonth() === 11 ? Math.min(24, d.getDate()) : 0;
}
