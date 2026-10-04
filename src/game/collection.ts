// Sammelbares: Sticker, Haustiere, Laden-Artikel.

import type { WorldId } from "./skills";
import type { SeasonId } from "./season";

/** Sticker und Ausmalbilder gehören zu einer Welt oder einem Saison-Event. */
export type CollectionGroup = WorldId | SeasonId;

// ---------------------------------------------------------------------------
// Sticker — kleine Fabelwesen, 12 pro Welt, 2 davon selten (Glitzer).

export type StickerShape = "round" | "tall" | "wide";
export type Sticker = {
  id: string;
  world: CollectionGroup;
  name: string;
  color: string;
  belly: string;
  shape: StickerShape;
  ears: "cat" | "round" | "antenna" | "horn" | "none";
  rare: boolean;
};

const S = (world: CollectionGroup, name: string, color: string, belly: string, shape: StickerShape, ears: Sticker["ears"], rare = false): Sticker => ({
  id: `${world}-${name.toLowerCase().replace(/[^a-zäöüß]/g, "")}`,
  world,
  name,
  color,
  belly,
  shape,
  ears,
  rare,
});

export const STICKERS: Sticker[] = [
  S("start", "Plusi", "#FF9F1C", "#FFE2B8", "round", "cat"),
  S("start", "Minu", "#4CC3FF", "#D3F1FF", "round", "round"),
  S("start", "Zehni", "#6BD66B", "#D9F7D9", "tall", "antenna"),
  S("start", "Krabbi", "#FF5D5D", "#FFD1D1", "wide", "antenna"),
  S("start", "Muschla", "#FF9EC7", "#FFE3F0", "wide", "none"),
  S("start", "Sandi", "#F2C14E", "#FFF1C4", "round", "round"),
  S("start", "Wellchen", "#2EC4B6", "#C9F4EF", "tall", "none"),
  S("start", "Koko", "#B07A4F", "#EBD3BF", "round", "cat"),
  S("start", "Pünktchen", "#9B7BFF", "#E6DEFF", "round", "antenna"),
  S("start", "Sternfisch", "#FFD23F", "#FFF3BF", "wide", "horn"),
  S("start", "Glitzerkrebs", "#FF5D9E", "#FFD6E7", "wide", "horn", true),
  S("start", "Perli", "#E4E8F7", "#FFFFFF", "round", "round", true),

  S("wald", "Zahlix", "#9B7BFF", "#E6DEFF", "round", "cat", true),
  S("wald", "Moosi", "#6BD66B", "#D9F7D9", "round", "round"),
  S("wald", "Pilzi", "#FF5D5D", "#FFE3E3", "tall", "none"),
  S("wald", "Eichi", "#B07A4F", "#EBD3BF", "round", "round"),
  S("wald", "Fuchsi", "#FF9F1C", "#FFF1DE", "tall", "cat"),
  S("wald", "Hoppel", "#C9B8A6", "#FFFFFF", "tall", "cat"),
  S("wald", "Igelchen", "#8A6A55", "#E9D9CC", "wide", "none"),
  S("wald", "Blattwurm", "#2BB673", "#BFF0D6", "wide", "antenna"),
  S("wald", "Glühwürmi", "#FFD23F", "#FFF7CC", "round", "antenna"),
  S("wald", "Rabe Rudi", "#3B3F6B", "#9EA3D1", "tall", "none"),
  S("wald", "Schnecki", "#FF9EC7", "#FFE8F2", "wide", "antenna"),
  S("wald", "Silberhirsch", "#C7D0E6", "#FFFFFF", "tall", "horn", true),

  S("strand", "Kraki", "#FF5D9E", "#FFD6E7", "round", "none"),
  S("strand", "Robbi", "#8FA3B8", "#E3EAF2", "wide", "round"),
  S("strand", "Pelli", "#FFFFFF", "#FFE7A8", "tall", "none"),
  S("strand", "Quallo", "#B9A8FF", "#EEE9FF", "tall", "antenna"),
  S("strand", "Schildi", "#2BB673", "#FFE7A8", "wide", "none"),
  S("strand", "Möwi", "#E9EEF5", "#FFFFFF", "round", "none"),
  S("strand", "Seepferdi", "#FF9F1C", "#FFE2B8", "tall", "horn"),
  S("strand", "Kugelfisch", "#FFD23F", "#FFF3BF", "round", "antenna"),
  S("strand", "Delfi", "#4CC3FF", "#D3F1FF", "wide", "none"),
  S("strand", "Korallix", "#FF7A59", "#FFD9CC", "round", "horn"),
  S("strand", "Regenbogenfisch", "#7B4DFF", "#FFD6F0", "wide", "horn", true),
  S("strand", "Goldmuschel", "#FFC531", "#FFF3BF", "wide", "none", true),

  S("hafen", "Papagei Pip", "#2BB673", "#FFD23F", "round", "horn"),
  S("hafen", "Käpt'n Krebs", "#FF5D5D", "#FFD1D1", "wide", "antenna"),
  S("hafen", "Ankerli", "#5B6B8C", "#C9D3E3", "tall", "none"),
  S("hafen", "Münzi", "#F2C14E", "#FFF3BF", "round", "round"),
  S("hafen", "Fässchen", "#B07A4F", "#EBD3BF", "tall", "none"),
  S("hafen", "Segeli", "#FFFFFF", "#D3F1FF", "tall", "horn"),
  S("hafen", "Kompassi", "#C99A1E", "#FFF1C4", "round", "antenna"),
  S("hafen", "Möwe Mia", "#E9EEF5", "#FFFFFF", "round", "none"),
  S("hafen", "Krake Kalle", "#9B7BFF", "#E6DEFF", "round", "none"),
  S("hafen", "Schatzi", "#FF9F1C", "#FFE2B8", "wide", "none"),
  S("hafen", "Goldpapagei", "#FFC531", "#FFF3BF", "round", "horn", true),
  S("hafen", "Diamantkrabbe", "#7FDBFF", "#E3F5FF", "wide", "horn", true),

  S("zirkus", "Clown Kringel", "#FF5D5D", "#FFE3E3", "round", "round"),
  S("zirkus", "Seelöwe Sami", "#5B6B8C", "#C9D3E3", "tall", "none"),
  S("zirkus", "Ponny", "#FFFFFF", "#FFE3F0", "tall", "horn"),
  S("zirkus", "Jongli", "#FF9F1C", "#FFE2B8", "round", "antenna"),
  S("zirkus", "Löwe Leo", "#F2C14E", "#FFF1C4", "round", "cat"),
  S("zirkus", "Popcorni", "#FFF1C4", "#FFFFFF", "round", "none"),
  S("zirkus", "Ballonia", "#FF5D9E", "#FFD6E7", "tall", "antenna"),
  S("zirkus", "Elefantino", "#9AA6B8", "#E3E8F0", "wide", "round"),
  S("zirkus", "Akroba", "#7B4DFF", "#E6DEFF", "tall", "cat"),
  S("zirkus", "Zuckerwatte", "#FF9EC7", "#FFE8F2", "round", "none"),
  S("zirkus", "Sternenclown", "#FFD23F", "#FFF7CC", "round", "horn", true),
  S("zirkus", "Regenbogen-Einhorn", "#E6DEFF", "#FFFFFF", "tall", "horn", true),

  S("baeckerei", "Brezelchen", "#C8763A", "#F7C99B", "wide", "none"),
  S("baeckerei", "Krümel", "#E3A36B", "#FFF1E0", "round", "round"),
  S("baeckerei", "Muffi", "#FF9EC7", "#FFE8F2", "round", "antenna"),
  S("baeckerei", "Teigling", "#F7E6C4", "#FFFFFF", "round", "none"),
  S("baeckerei", "Hörnchen", "#E5A100", "#FFF1C4", "wide", "horn"),
  S("baeckerei", "Mehlmaus", "#E3E8F0", "#FFFFFF", "round", "round"),
  S("baeckerei", "Zimtschnecke", "#B07A4F", "#EBD3BF", "round", "antenna"),
  S("baeckerei", "Erdbeertörtchen", "#FF5D5D", "#FFE3E3", "tall", "none"),
  S("baeckerei", "Baguetti", "#D9A066", "#FFF1E0", "tall", "cat"),
  S("baeckerei", "Schoko-Keks", "#7A4E2D", "#D9B89A", "round", "cat"),
  S("baeckerei", "Goldbrezel", "#FFC531", "#FFF3BF", "wide", "horn", true),
  S("baeckerei", "Zuckerfee", "#E6DEFF", "#FFFFFF", "tall", "antenna", true),

  S("schloss", "Tickli", "#5B6BD6", "#DDE2FF", "round", "antenna"),
  S("schloss", "Tacki", "#FF5D5D", "#FFD1D1", "round", "round"),
  S("schloss", "Zahnrädchen", "#C99A1E", "#FFF1C4", "round", "horn"),
  S("schloss", "Sanduhri", "#F2C14E", "#FFF7CC", "tall", "none"),
  S("schloss", "Kuckuck Kuno", "#B07A4F", "#EBD3BF", "round", "cat"),
  S("schloss", "Pendeline", "#9B7BFF", "#E6DEFF", "tall", "antenna"),
  S("schloss", "Burggeist Bo", "#E9EEF5", "#FFFFFF", "tall", "none"),
  S("schloss", "Turmdrache", "#2BB673", "#D9F7D9", "wide", "horn"),
  S("schloss", "Mondi", "#24275E", "#C9D0FF", "round", "cat"),
  S("schloss", "Weckerle", "#FF9F1C", "#FFE2B8", "round", "round"),
  S("schloss", "Sternenuhr", "#FFC531", "#FFF3BF", "round", "horn", true),
  S("schloss", "Kristallkönigin", "#7FDBFF", "#E3F5FF", "tall", "antenna", true),

  S("ozean", "Seesternchen", "#FF9F1C", "#FFE2B8", "round", "horn"),
  S("ozean", "Quallina", "#FF9EC7", "#FFE8F2", "tall", "antenna"),
  S("ozean", "Dreieckfisch", "#4CC3FF", "#D3F1FF", "wide", "none"),
  S("ozean", "Kugelfisch Kuno", "#FFC531", "#FFF3BF", "round", "round"),
  S("ozean", "Seepferdchen", "#9B7BFF", "#E6DEFF", "tall", "horn"),
  S("ozean", "Würfelkrabbe", "#FF5D5D", "#FFD1D1", "wide", "antenna"),
  S("ozean", "Muschelmia", "#F7C99B", "#FFF1E0", "wide", "none"),
  S("ozean", "Wabenschnecke", "#2BB673", "#D9F7D9", "round", "antenna"),
  S("ozean", "Spiegelrochen", "#5B6B8C", "#C9D3E3", "wide", "none"),
  S("ozean", "Delfi", "#7FDBFF", "#E3F5FF", "tall", "none"),
  S("ozean", "Perlenmuschel", "#F4F1FF", "#FFFFFF", "wide", "horn", true),
  S("ozean", "Regenbogenwal", "#9BE3EC", "#FFFFFF", "wide", "round", true),

  S("werkstatt", "Schraubi", "#9AA6B8", "#E3E8F0", "round", "antenna"),
  S("werkstatt", "Hammerhans", "#D9822B", "#F7C99B", "tall", "none"),
  S("werkstatt", "Maßbandmaus", "#FFC531", "#FFF3BF", "round", "round"),
  S("werkstatt", "Zahnradzwerg", "#C99A1E", "#FFF1C4", "round", "horn"),
  S("werkstatt", "Linealix", "#FFE7A8", "#FFFFFF", "tall", "antenna"),
  S("werkstatt", "Hobelchen", "#B07A4F", "#EBD3BF", "wide", "none"),
  S("werkstatt", "Robbi", "#4CC3FF", "#D3F1FF", "round", "antenna"),
  S("werkstatt", "Zangenzora", "#FF5D5D", "#FFD1D1", "wide", "horn"),
  S("werkstatt", "Magnetmo", "#E5484D", "#9AA6B8", "round", "horn"),
  S("werkstatt", "Pinselpia", "#9B7BFF", "#E6DEFF", "tall", "cat"),
  S("werkstatt", "Goldschraube", "#FFC531", "#FFF7CC", "round", "horn", true),
  S("werkstatt", "Erfinderin Eule", "#7B4DFF", "#E6DEFF", "round", "cat", true),

  S("detektiv", "Lupinchen", "#6B4F3A", "#D8C3A5", "round", "round"),
  S("detektiv", "Spürnase", "#D9A066", "#F7E1C4", "wide", "round"),
  S("detektiv", "Schnüffel", "#8C5A2B", "#EBD3BF", "round", "cat"),
  S("detektiv", "Fußspur-Fritz", "#3A3E85", "#C9CCF2", "tall", "none"),
  S("detektiv", "Rätselrabe", "#1F2347", "#9AA6B8", "round", "horn"),
  S("detektiv", "Notizia", "#FFE7A8", "#FFFFFF", "tall", "antenna"),
  S("detektiv", "Strichlisti", "#7B4DFF", "#E6DEFF", "round", "antenna"),
  S("detektiv", "Säulchen", "#FF5D9E", "#FFE0EE", "tall", "none"),
  S("detektiv", "Codeknacker", "#2BB673", "#CFF5E1", "wide", "horn"),
  S("detektiv", "Mantelmaus", "#C99A1E", "#FFF1C4", "round", "round"),
  S("detektiv", "Goldene Lupe", "#FFC531", "#FFF7CC", "round", "horn", true),
  S("detektiv", "Meisterdetektivin", "#FF9F1C", "#FFE2B8", "round", "cat", true),

  // Saison: Halloween (gibt es nur im Oktober)
  S("halloween", "Kürbi", "#FF9F1C", "#FFE2B8", "round", "antenna"),
  S("halloween", "Gespensti", "#F4F1FF", "#FFFFFF", "tall", "none"),
  S("halloween", "Fledermausi", "#5B4B8A", "#C9BFF0", "wide", "cat"),
  S("halloween", "Hexenkätzchen", "#2E2A4F", "#9B8FD0", "round", "cat"),
  S("halloween", "Spinni", "#7B4DFF", "#E6DEFF", "round", "antenna"),
  S("halloween", "Mondkürbis", "#FFC531", "#FFF3BF", "round", "horn", true),

  // Saison: Winter (Adventskalender)
  S("winter", "Schneemann Schnuppi", "#FFFFFF", "#E3F5FF", "round", "none"),
  S("winter", "Rentier Rudi", "#B07A4F", "#EBD3BF", "tall", "horn"),
  S("winter", "Pinguin Pino", "#24275E", "#FFFFFF", "tall", "none"),
  S("winter", "Eisbärchen", "#F4F1FF", "#FFFFFF", "round", "round"),
  S("winter", "Lebkuchi", "#C8763A", "#F7C99B", "wide", "round"),
  S("winter", "Schneeflocki", "#7FDBFF", "#E3F5FF", "round", "antenna"),
  S("winter", "Glitzerstern", "#FFD23F", "#FFF7CC", "round", "horn", true),
  S("winter", "Weihnachtswichtel", "#FF5D5D", "#FFE3E3", "tall", "horn", true),
];

export function stickersOf(world: CollectionGroup): Sticker[] {
  return STICKERS.filter((s) => s.world === world);
}

// ---------------------------------------------------------------------------
// Haustiere

export type PetSpecies = "funkel" | "drachi" | "pieps";

export const PETS: Record<PetSpecies, { label: string; color: string; belly: string; accent: string; egg: string; eggSpots: string }> = {
  funkel: { label: "Flausch-Katze", color: "#FF8FC2", belly: "#FFD3E6", accent: "#FF6FA8", egg: "#FFD3E6", eggSpots: "#FF8FC2" },
  drachi: { label: "Mini-Drache", color: "#5ACB7A", belly: "#D6F5C9", accent: "#2E9E52", egg: "#D6F5C9", eggSpots: "#5ACB7A" },
  pieps: { label: "Wolken-Eule", color: "#6FB8FF", belly: "#DDEFFF", accent: "#3F8FE0", egg: "#DDEFFF", eggSpots: "#6FB8FF" },
};

/** Entwicklungsstufe aus dem Spieler-Level. */
export function petStage(level: number): 1 | 2 | 3 {
  if (level >= 10) return 3;
  if (level >= 5) return 2;
  return 1;
}

export const PET_STAGE_NAMES = ["", "Baby", "Kind", "Groß"] as const;

// ---------------------------------------------------------------------------
// Laden: Zubehör fürs Haustier

export type ShopItem = { id: string; name: string; price: number; slot: "head" | "face" | "neck" };

export const SHOP: ShopItem[] = [
  { id: "schleife", name: "Schleife", price: 60, slot: "head" },
  { id: "schal", name: "Regenbogen-Schal", price: 80, slot: "neck" },
  { id: "brille", name: "Sternenbrille", price: 100, slot: "face" },
  { id: "zauberhut", name: "Zauberhut", price: 120, slot: "head" },
  { id: "fliege", name: "Fliege", price: 70, slot: "neck" },
  { id: "krone", name: "Goldkrone", price: 250, slot: "head" },
];
