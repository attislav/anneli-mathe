import { pick, shuffle } from "./random";
import type { Level, MapPlace, SiteMapTask } from "./types";

export const landmarks = {
  library: { name: "Bücherei", symbol: "Buch" }, park: { name: "Park", symbol: "Baum" },
  cafe: { name: "Café", symbol: "Tasse" }, station: { name: "Bahnhof", symbol: "Zug" }, pool: { name: "Schwimmbad", symbol: "Wellen" },
} as const;
type MapData = Pick<SiteMapTask, "size" | "target" | "cells" | "closed" | "anchor" | "mode">;
export const mapCoordinate = (size: number, cell: number) => "ABCD"[cell % size] + (1 + Math.floor(cell / size));
export function directNeighbor(size: number, a: number, b: number, closed: [number, number] | null) {
  if (closed && (closed[0] === a && closed[1] === b || closed[0] === b && closed[1] === a)) return false;
  return Math.abs(a % size - b % size) + Math.abs(Math.floor(a / size) - Math.floor(b / size)) === 1;
}
export function siteMatches(p: MapData) {
  const anchor = p.anchor === null ? -1 : p.cells.indexOf(p.anchor);
  return p.cells.flatMap((place, i) => place === p.target && (p.mode !== "neighbor" || directNeighbor(p.size, i, anchor, p.closed)) ? [i] : []);
}
export function checkSite(p: MapData, answer: string) {
  return p.mode === "place" ? answer === p.target : answer === mapCoordinate(p.size, siteMatches(p)[0]);
}
export function siteMap(level: Level): Omit<SiteMapTask, "id" | "level" | "skillId"> {
  const size = level <= 2 ? 3 : 4;
  const locations = shuffle(Array.from({ length: size * size }, (_, i) => i));
  const places = shuffle(Object.keys(landmarks) as MapPlace[]);
  const [target, landmark, ...others] = places;
  const cells: (MapPlace | null)[] = Array(size * size).fill(null);
  const mode = level >= 4 ? "neighbor" : pick(["place", "coordinate"] as const);
  const anchor = mode === "neighbor" ? landmark : null;
  let closed: [number, number] | null = null;
  if (anchor) {
    const center = locations[0];
    cells[center] = anchor;
    const sides = locations.filter(i => directNeighbor(size, center, i, null));
    cells[sides[0]] = target;
    const other = level === 5 ? sides[1] : pick(locations.filter(i => i !== center && !sides.includes(i)));
    cells[other] = target;
    if (level === 5) closed = [center, other];
  } else { cells[locations[0]] = target; cells[locations[1]] = landmark; }
  const open = locations.filter(i => cells[i] === null);
  others.forEach((place, i) => { cells[open[i]] = place; });
  const data: MapData = { size, cells, target, mode, closed, anchor };
  const where = mapCoordinate(size, siteMatches(data)[0]);
  const named = landmarks[target];
  const question = mode === "place" ? `Welcher Ort liegt auf ${where}?` : anchor ?
    `Suche „${named.name}“ direkt neben „${landmarks[anchor].name}“. Welche Koordinate hat dieser Ort?` :
    `In welchem Feld findest du „${named.name}“?`;
  const hint = mode === "place" ? "Lies zuerst den Spaltenbuchstaben und dann die Zeilenzahl. Vergleiche das Zeichen dort mit der Legende." :
    anchor ? "Direkte Nachbarn teilen eine Seite. Prüfe, ob diese Seite offen ist." : "Suche das Zeichen aus der Legende. Lies oben den Buchstaben und links die Zahl.";
  return { ...data, format: "site-map", question, hint,
    solution: `Auf ${where} siehst du das Zeichen „${named.symbol}“. Laut Legende steht es für „${named.name}“.${anchor ? ` Dieses Feld teilt eine offene Seite mit „${landmarks[anchor].name}“.` : ""}` };
}
