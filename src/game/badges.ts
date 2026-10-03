// Abzeichen: Erfolge, die sich aus dem Spielstand ergeben.
//
// Jedes Abzeichen rechnet seinen Fortschritt selbst aus (`progress`). Wer
// es erreicht, bekommt es beim nächsten Lektionsende oder Truhe-Öffnen
// feierlich überreicht (`claimBadges`) — plus ein paar Münzen. Einmal
// verliehen, bleibt es (auch wenn z. B. die Tage-Serie später reißt).

import { STICKERS } from "./collection";
import { levelInfo, streak, totalStars, update, type Reward, type SaveState } from "./state";
import { WORLDS } from "./worlds";

export type BadgeIcon = "star" | "crown" | "book" | "check" | "flame" | "sticker" | "gem" | "palette" | "paw" | "game" | "piggy" | "trophy" | "sunrise" | "target";
export type BadgeTier = "bronze" | "silber" | "gold";

export type Badge = {
  id: string;
  title: string;
  desc: string;
  icon: BadgeIcon;
  tier: BadgeTier;
  /** [geschafft, nötig] */
  progress: (s: SaveState) => [number, number];
};

export const BADGE_COINS = 10;

const tierFor = (i: number, n: number): BadgeTier => (i >= n - 1 ? "gold" : i >= Math.floor(n / 2) ? "silber" : "bronze");

function ladder(prefix: string, icon: BadgeIcon, steps: [number, string][], value: (s: SaveState) => number, desc: (n: number) => string): Badge[] {
  return steps.map(([need, title], i) => ({ id: `${prefix}-${need}`, title, desc: desc(need), icon, tier: tierFor(i, steps.length), progress: (s) => [Math.min(value(s), need), need] }));
}

const masterNodes = (s: SaveState) => Object.values(s.nodes).filter((n) => n.stars[2] === 3).length;
const distinctStickers = (s: SaveState) => Object.values(s.stickers).filter((n) => n > 0).length;
const rareStickers = (s: SaveState) => STICKERS.filter((st) => st.rare && (s.stickers[st.id] ?? 0) > 0).length;
const paintedPages = (s: SaveState) => Object.values(s.fills).filter((f) => Object.keys(f).length >= 3).length;

export const BADGES: Badge[] = [
  ...ladder("sterne", "star", [[10, "Erste Sterne"], [50, "Sternensammler"], [100, "Sternenregen"], [250, "Sternenhimmel"], [500, "Sternenkönig"]], totalStars, (n) => `Sammle ${n} Sterne.`),
  ...WORLDS.map((w, i) => ({
    id: `boss-${w.id}`,
    title: `${w.boss.name} besiegt`,
    desc: `Besiege den Boss im ${w.name}.`,
    icon: "crown" as const,
    tier: tierFor(i, WORLDS.length),
    progress: (s: SaveState): [number, number] => [s.bosses.includes(`${w.id}-boss`) ? 1 : 0, 1],
  })),
  ...ladder("lektionen", "book", [[1, "Los geht's"], [10, "Fleißig"], [25, "Dranbleiber"], [50, "Lernprofi"], [100, "Hundert!"]], (s) => s.stats.lessons, (n) => (n === 1 ? "Schaff deine erste Lektion." : `Schaff ${n} Lektionen.`)),
  ...ladder("richtig", "check", [[50, "Treffsicher"], [250, "Rechenblitz"], [1000, "Tausend Treffer"]], (s) => s.stats.firstTry, (n) => `Löse ${n} Aufgaben gleich beim ersten Versuch.`),
  ...ladder("serie", "flame", [[3, "Drei Tage"], [7, "Eine Woche"], [14, "Zwei Wochen"], [30, "Ein Monat"]], streak, (n) => `Rechne ${n} Tage hintereinander.`),
  ...ladder("sticker", "sticker", [[10, "Stickerheft"], [30, "Stickerjäger"], [60, "Stickerprofi"]], distinctStickers, (n) => `Sammle ${n} verschiedene Sticker.`),
  { id: "selten-1", title: "Glitzerfund", desc: "Finde einen seltenen Glitzer-Sticker.", icon: "gem", tier: "silber", progress: (s) => [Math.min(rareStickers(s), 1), 1] },
  ...ladder("malen", "palette", [[1, "Kleiner Künstler"], [5, "Farbenfroh"]], paintedPages, (n) => (n === 1 ? "Mal ein Ausmalbild aus." : `Mal ${n} Ausmalbilder aus.`)),
  ...ladder("level", "paw", [[5, "Es wächst!"], [10, "Ganz groß"]], (s) => levelInfo(s.xp).level, (n) => `Erreiche Level ${n} — dein Haustier wächst.`),
  { id: "meister-5", title: "Meisterklasse", desc: "Hol 3 Sterne auf der Meister-Stufe bei 5 Aufgaben-Inseln.", icon: "target", tier: "gold", progress: (s) => [Math.min(masterNodes(s), 5), 5] },
  { id: "spiele-2", title: "Spielkind", desc: "Spiel beide Spiele in der Spielhalle.", icon: "game", tier: "bronze", progress: (s) => [Math.min(Object.keys(s.games).length, 2), 2] },
  { id: "spar-500", title: "Sparschwein", desc: "Hab 500 Münzen auf einmal.", icon: "piggy", tier: "silber", progress: (s) => [Math.min(s.coins, 500), 500] },
  { id: "tagesschatz-10", title: "Frühaufsteher", desc: "Öffne 10 Tagesschätze.", icon: "sunrise", tier: "silber", progress: (s) => [Math.min(s.dailyChests, 10), 10] },
];

export function isEarned(s: SaveState, b: Badge): boolean {
  if (s.badges.includes(b.id)) return true;
  const [have, need] = b.progress(s);
  return have >= need;
}

/** Neu erreichte Abzeichen verleihen. Gibt Belohnungen zum Anzeigen zurück. */
export function claimBadges(s: SaveState): Reward[] {
  const fresh = BADGES.filter((b) => !s.badges.includes(b.id) && isEarned(s, b));
  if (fresh.length === 0) return [];
  update((cur) => ({ ...cur, badges: [...cur.badges, ...fresh.map((b) => b.id)], coins: cur.coins + fresh.length * BADGE_COINS }));
  return [...fresh.map((b): Reward => ({ kind: "badge", id: b.id })), { kind: "coins", amount: fresh.length * BADGE_COINS }];
}

export function getBadge(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}
