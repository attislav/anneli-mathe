"use client";

// Spielstand: ein Objekt, im localStorage gespeichert, über einen kleinen
// Store mit `useSyncExternalStore` an React angebunden.
//
// Bewusst ohne Server: die App ist ein statischer Export. Cloud-Sync kommt
// später (Roadmap Phase 4) — dann wird dieses Objekt nur woanders gespeichert.

import { useSyncExternalStore } from "react";
import { START_MASTERY, type Tier } from "./adaptive";
import { STICKERS, SHOP, type CollectionGroup, type PetSpecies } from "./collection";
import { WORLDS, starNodes, type PathNode, type World } from "./worlds";
import { pick } from "./random";
import { activeSeason } from "./season";
import { isComplete, PIECE_DUPLICATE_COINS, PIECES, puzzleOfWorld } from "./puzzles";
import type { WorldId } from "./skills";
import type { Level, TaskDraft } from "./types";

const KEY = "sternenpfad.v1";

export type Profile = { name: string; pet: PetSpecies; petName: string };

/** `fails`: nicht geschaffte Versuche hintereinander (für „erst die Lektion davor wiederholen"). */
export type NodeProgress = { stars: [number, number, number]; plays: number; fails?: number };

export type SaveState = {
  v: 1;
  profile: Profile | null;
  coins: number;
  xp: number;
  mastery: Record<string, number>;
  nodes: Record<string, NodeProgress>;
  chests: string[];
  bosses: string[];
  skippedWorlds: WorldId[];
  stickers: Record<string, number>;
  pages: string[];
  fills: Record<string, Record<string, string>>;
  mathBonus: string[];
  items: string[];
  equipped: string[];
  pet: { lastFed: string | null; love: number };
  days: string[];
  today: { day: string; lessons: number; arcadeSeconds: number };
  settings: { sound: boolean; voice: boolean; autoRead: boolean; arcadeMinutes: number };
  stats: { tasks: number; firstTry: number; lessons: number };
  games: Record<string, number>;
  /** Verliehene Abzeichen (IDs). */
  badges: string[];
  /** Wie viele Tagesschätze schon geöffnet wurden. */
  dailyChests: number;
  /** Übungskiste: falsch gelöste Aufgaben, die später wiederkommen. */
  practice: PracticeItem[];
  /** Adventskalender: geöffnete Türchen im Jahr `year`. */
  advent: { year: number; opened: number[] };
  /** Antwort-Protokoll für den Lernbericht (nur erste Versuche, die neuesten zuletzt). */
  log: AnswerLog[];
  /** Puzzle-Ausmalbilder: gesammelte Teile (0–8) pro Bild. */
  puzzles: Record<string, number[]>;
  /** Ausgemalte Puzzle-Bilder: Farbeimer-Klicks [x, y, Farbe] in Bild-Pixeln. */
  paint: Record<string, PaintOp[]>;
};

export type PaintOp = [number, number, string];

/**
 * Eine erste Antwort. Kurz gehalten, weil es viele werden:
 * t = Zeitpunkt (Sekunden), s = Kompetenz, l = Stufe, ok = 1/0,
 * ms = Antwortzeit, p = 1 in der Übungskiste.
 */
export type AnswerLog = { t: number; s: string; l: number; ok: 0 | 1; ms: number; p?: 1 };
export const LOG_MAX = 1500;

/** Eine Aufgabe in der Übungskiste. `box` 0–2: nach 1, 3, 7 Tagen wieder dran. */
export type PracticeItem = { key: string; task: TaskDraftWithSkill; box: number; due: string };
export type TaskDraftWithSkill = TaskDraft & { skillId: string; level: Level };

export function emptyState(): SaveState {
  return {
    v: 1,
    profile: null,
    coins: 0,
    xp: 0,
    mastery: {},
    nodes: {},
    chests: [],
    bosses: [],
    skippedWorlds: [],
    stickers: {},
    pages: [],
    fills: {},
    mathBonus: [],
    items: [],
    equipped: [],
    pet: { lastFed: null, love: 0 },
    days: [],
    today: { day: "", lessons: 0, arcadeSeconds: 0 },
    settings: { sound: true, voice: true, autoRead: false, arcadeMinutes: 15 },
    stats: { tasks: 0, firstTry: 0, lessons: 0 },
    games: {},
    badges: [],
    dailyChests: 0,
    practice: [],
    advent: { year: 0, opened: [] },
    log: [],
    puzzles: {},
    paint: {},
  };
}

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Store

let state: SaveState | null = null;
const listeners = new Set<() => void>();

// --- Mehrere Kinder pro Gerät ------------------------------------------------
//
// Jedes Kind hat seinen eigenen Spielstand unter eigenem Schlüssel. Das
// erste Kind („main“) nutzt den alten Schlüssel weiter, damit bestehende
// Spielstände ohne Umzug erhalten bleiben. Ein kleiner Index merkt sich,
// welche Kinder es gibt und wer gerade spielt.

const INDEX_KEY = "sternenpfad.profiles";
const PICKED_KEY = "sternenpfad.picked";
const MAIN_ID = "main";

type ProfileIndex = { active: string; ids: string[] };

let index: ProfileIndex | null = null;

const keyFor = (id: string) => (id === MAIN_ID ? KEY : `${KEY}.${id}`);

function getIndex(): ProfileIndex {
  if (index) return index;
  index = { active: MAIN_ID, ids: [MAIN_ID] };
  try {
    const raw = window.localStorage.getItem(INDEX_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ProfileIndex;
      if (Array.isArray(parsed.ids) && parsed.ids.length > 0) {
        index = { ids: parsed.ids, active: parsed.ids.includes(parsed.active) ? parsed.active : parsed.ids[0] };
      }
    }
  } catch {
    // dann eben nur ein Kind
  }
  return index;
}

function setIndex(next: ProfileIndex): void {
  index = next;
  try {
    window.localStorage.setItem(INDEX_KEY, JSON.stringify(next));
  } catch {
    // nicht schlimm
  }
}

function parseSave(raw: string | null): SaveState | null {
  if (!raw) return null;
  const parsed = JSON.parse(raw) as Partial<SaveState>;
  if (parsed.v !== 1) return null;
  return { ...emptyState(), ...parsed, settings: { ...emptyState().settings, ...parsed.settings } };
}

function load(): SaveState {
  try {
    const s = parseSave(window.localStorage.getItem(keyFor(getIndex().active)));
    if (s) return rollDay(s);
  } catch {
    // privater Modus oder kaputter Eintrag — dann eben frisch
  }
  return emptyState();
}

/** Neuer Tag → Tageszähler zurücksetzen. */
function rollDay(s: SaveState): SaveState {
  const day = todayKey();
  if (s.today.day === day) return s;
  return { ...s, today: { day, lessons: 0, arcadeSeconds: 0 } };
}

function get(): SaveState {
  if (state === null) state = load();
  return state;
}

export function update(fn: (s: SaveState) => SaveState): void {
  state = fn(rollDay(get()));
  try {
    window.localStorage.setItem(keyFor(getIndex().active), JSON.stringify(state));
  } catch {
    // Speichern fehlgeschlagen — Spiel läuft trotzdem weiter
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** `null` beim Server-Render und im ersten Client-Render (Hydration). */
export function useSave(): SaveState | null {
  return useSyncExternalStore(subscribe, get, () => null);
}

export function readSave(): SaveState {
  return get();
}

// ---------------------------------------------------------------------------
// Ableitungen

export function nodeStars(s: SaveState, nodeId: string): [number, number, number] {
  return s.nodes[nodeId]?.stars ?? [0, 0, 0];
}

export function bestStars(s: SaveState, nodeId: string): number {
  return Math.max(...nodeStars(s, nodeId));
}

/** Gesamtsterne: alle Stufen zählen — Profi- und Meister-Runden bringen also extra Sterne. */
export function totalStars(s: SaveState): number {
  let sum = 0;
  for (const p of Object.values(s.nodes)) sum += p.stars.reduce((a, b) => a + b, 0);
  return sum;
}

export function worldStars(s: SaveState, world: World): { have: number; max: number } {
  const nodes = starNodes(world);
  return { have: nodes.reduce((a, n) => a + bestStars(s, n.id), 0), max: nodes.length * 3 };
}

export function isNodeDone(s: SaveState, node: PathNode): boolean {
  if (node.kind === "chest") return s.chests.includes(node.id);
  if (node.kind === "boss") return s.bosses.includes(node.id);
  return bestStars(s, node.id) > 0;
}

export type WorldGate = { open: true } | { open: false; reason: "boss" | "stars"; missing?: number };

export function worldGate(s: SaveState, world: World): WorldGate {
  if (world.index === 0) return { open: true };
  const prev = WORLDS[world.index - 1];
  if (s.skippedWorlds.includes(prev.id)) return { open: true };
  const bossId = prev.nodes[prev.nodes.length - 1].id;
  if (!s.bosses.includes(bossId)) return { open: false, reason: "boss" };
  const missing = world.starsToEnter - totalStars(s);
  if (missing > 0) return { open: false, reason: "stars", missing };
  return { open: true };
}

export function isNodeOpen(s: SaveState, world: World, index: number): boolean {
  if (!worldGate(s, world).open) return false;
  if (s.skippedWorlds.includes(world.id)) return true;
  if (index === 0) return true;
  return isNodeDone(s, world.nodes[index - 1]);
}

/** Der nächste offene, noch nicht geschaffte Knoten. */
export function currentNode(s: SaveState): { world: World; node: PathNode; index: number } | null {
  for (const world of WORLDS) {
    // Übersprungene Welten bleiben offen, sind aber nicht „dran".
    if (!worldGate(s, world).open || s.skippedWorlds.includes(world.id)) continue;
    for (let i = 0; i < world.nodes.length; i++) {
      if (isNodeOpen(s, world, i) && !isNodeDone(s, world.nodes[i])) return { world, node: world.nodes[i], index: i };
    }
  }
  return null;
}

export function tierOpen(s: SaveState, nodeId: string, tier: Tier): boolean {
  return tier === 0 || nodeStars(s, nodeId)[tier - 1] === 3;
}

export function levelInfo(xp: number): { level: number; into: number; need: number } {
  let level = 1;
  let rest = xp;
  let need = 80;
  while (rest >= need) {
    rest -= need;
    level++;
    need = 60 + level * 20;
  }
  return { level, into: rest, need };
}

export function streak(s: SaveState): number {
  const set = new Set(s.days);
  const d = new Date();
  if (!set.has(todayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(todayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export const DAILY_GOAL = 3;

// ---------------------------------------------------------------------------
// Belohnungen

export type Reward =
  | { kind: "coins"; amount: number }
  | { kind: "sticker"; id: string; duplicate: boolean }
  | { kind: "page"; id: string }
  | { kind: "badge"; id: string }
  /** Tagesschatz: die erste Lektion des Tages gibt extra. */
  | { kind: "daily" }
  /** Ein Teil eines Puzzle-Ausmalbilds (0–8). */
  | { kind: "piece"; puzzle: string; piece: number; duplicate: boolean };

const DUPLICATE_COINS = 15;

/** Würfelt einen Sticker der Welt — neue sind wahrscheinlicher, seltene seltener. */
export function rollSticker(s: SaveState, world: CollectionGroup, allowRare: boolean): Reward {
  const pool = STICKERS.filter((st) => st.world === world && (allowRare || !st.rare || Math.random() < 0.12));
  const fresh = pool.filter((st) => !s.stickers[st.id]);
  const chosen = fresh.length > 0 && Math.random() < 0.8 ? pick(fresh) : pick(pool);
  return { kind: "sticker", id: chosen.id, duplicate: (s.stickers[chosen.id] ?? 0) > 0 };
}

/** Würfelt ein Puzzle-Teil der Welt — fehlende Teile sind wahrscheinlicher. Komplett → nichts mehr. */
export function rollPiece(s: SaveState, world: WorldId): Reward | null {
  const puzzle = puzzleOfWorld(world);
  if (!puzzle) return null;
  const have = s.puzzles[puzzle.id] ?? [];
  if (isComplete(have)) return null;
  const missing = Array.from({ length: PIECES }, (_, i) => i).filter((i) => !have.includes(i));
  const piece = Math.random() < 0.75 ? pick(missing) : Math.floor(Math.random() * PIECES);
  return { kind: "piece", puzzle: puzzle.id, piece, duplicate: have.includes(piece) };
}

/** Puzzle-Teil anhängen, falls die Welt eins hat (würfelt gegen den Stand inkl. bisheriger Belohnungen). */
function addPiece(s: SaveState, rewards: Reward[], world: WorldId): void {
  const r = rollPiece(applyRewards(s, rewards), world);
  if (r) rewards.push(r);
}

export function applyRewards(s: SaveState, rewards: Reward[]): SaveState {
  let next = { ...s, stickers: { ...s.stickers }, pages: [...s.pages], puzzles: { ...s.puzzles } };
  for (const r of rewards) {
    if (r.kind === "coins") next = { ...next, coins: next.coins + r.amount };
    if (r.kind === "sticker") {
      next.stickers[r.id] = (next.stickers[r.id] ?? 0) + 1;
      if (r.duplicate) next = { ...next, coins: next.coins + DUPLICATE_COINS };
    }
    if (r.kind === "page" && !next.pages.includes(r.id)) next.pages.push(r.id);
    if (r.kind === "daily") next = { ...next, dailyChests: next.dailyChests + 1 };
    if (r.kind === "piece") {
      const have = next.puzzles[r.puzzle] ?? [];
      if (r.duplicate || have.includes(r.piece)) next = { ...next, coins: next.coins + PIECE_DUPLICATE_COINS };
      else next.puzzles[r.puzzle] = [...have, r.piece];
    }
  }
  return next;
}

// ---------------------------------------------------------------------------
// Aktionen

export function markPlayedToday(s: SaveState): SaveState {
  const day = todayKey();
  return s.days.includes(day) ? s : { ...s, days: [...s.days, day].slice(-400) };
}

/** Neues Profil. `skipped`: Welten, die die Einstufung schon als geschafft erkannt hat. */
export function createProfile(profile: Profile, skipped: WorldId[] = [], mastery: Record<string, number> = {}): void {
  update((s) => ({ ...s, profile, coins: s.coins || 50, skippedWorlds: skipped, mastery: { ...s.mastery, ...mastery } }));
}

export type LessonOutcome = {
  node: PathNode;
  world: World;
  tier: Tier;
  stars: number;
  coins: number;
  xp: number;
  tasks: number;
  firstTry: number;
  mastery: Record<string, number>;
  rewards: Reward[];
  /** Nicht geschafft (0 Sterne): zählt nicht fürs Tagesziel und nicht als Lektion. */
  passed: boolean;
};

export function recordLesson(o: LessonOutcome): void {
  update((s) => {
    const prev = nodeStars(s, o.node.id);
    const stars: [number, number, number] = [...prev];
    stars[o.tier] = Math.max(stars[o.tier], o.stars);
    let next: SaveState = {
      ...s,
      xp: s.xp + o.xp,
      coins: s.coins + o.coins,
      mastery: { ...s.mastery, ...o.mastery },
      nodes: o.node.practice ? s.nodes : { ...s.nodes, [o.node.id]: { stars, plays: (s.nodes[o.node.id]?.plays ?? 0) + 1, fails: o.passed ? 0 : (s.nodes[o.node.id]?.fails ?? 0) + 1 } },
      today: { ...s.today, lessons: s.today.lessons + (o.passed ? 1 : 0) },
      stats: { tasks: s.stats.tasks + o.tasks, firstTry: s.stats.firstTry + o.firstTry, lessons: s.stats.lessons + (o.passed ? 1 : 0) },
    };
    if (o.node.kind === "boss" && !next.bosses.includes(o.node.id)) next.bosses = [...next.bosses, o.node.id];
    next = applyRewards(next, o.rewards);
    return markPlayedToday(next);
  });
}

export const DAILY_COINS = 25;

/** Ist heute noch keine Lektion geschafft? Dann wartet der Tagesschatz. */
export function dailyChestWaiting(s: SaveState): boolean {
  return s.today.day !== todayKey() || s.today.lessons === 0;
}

/** Belohnung fürs Lektionsende — wird VOR dem Öffnen der Truhe gewürfelt. */
export function lessonRewards(s: SaveState, node: PathNode, world: World, firstTime: boolean): Reward[] {
  const rewards: Reward[] = [];
  const halloween = activeSeason() === "halloween";
  if (dailyChestWaiting(s)) {
    rewards.push({ kind: "daily" }, rollSticker(s, halloween ? "halloween" : world.id, true), { kind: "coins", amount: DAILY_COINS });
    if (halloween && !s.pages.includes("kuerbis")) rewards.push({ kind: "page", id: "kuerbis" });
    addPiece(s, rewards, world.id);
    // Folgende Sticker gegen den Stand NACH dem Tagesschatz würfeln (sonst zweimal „neu").
    s = applyRewards(s, rewards);
  }
  if (node.kind === "boss") {
    if (firstTime && node.coloring) rewards.push({ kind: "page", id: node.coloring });
    rewards.push(rollSticker(s, world.id, true));
    addPiece(s, rewards, world.id);
    rewards.push({ kind: "coins", amount: 50 });
    return rewards;
  }
  if (firstTime || Math.random() < 0.45) rewards.push(rollSticker(s, halloween && Math.random() < 0.35 ? "halloween" : world.id, false));
  if (Math.random() < (firstTime ? 0.5 : 0.2)) addPiece(s, rewards, world.id);
  rewards.push({ kind: "coins", amount: firstTime ? 20 : 10 });
  return rewards;
}

export function openChest(node: PathNode, world: World): Reward[] {
  const s = get();
  if (s.chests.includes(node.id)) return [];
  const rewards: Reward[] = [];
  if (node.coloring) rewards.push({ kind: "page", id: node.coloring });
  rewards.push(rollSticker(s, world.id, true));
  addPiece(s, rewards, world.id);
  rewards.push({ kind: "coins", amount: 40 });
  update((cur) => markPlayedToday({ ...applyRewards(cur, rewards), chests: [...cur.chests, node.id] }));
  return rewards;
}

export function saveFills(pageId: string, fills: Record<string, string>): void {
  update((s) => ({ ...s, fills: { ...s.fills, [pageId]: fills } }));
}

export function claimMathBonus(pageId: string, amount: number): boolean {
  const s = get();
  if (s.mathBonus.includes(pageId)) return false;
  update((cur) => ({ ...cur, coins: cur.coins + amount, mathBonus: [...cur.mathBonus, pageId] }));
  return true;
}

export function spendCoins(amount: number): boolean {
  if (get().coins < amount) return false;
  update((s) => ({ ...s, coins: s.coins - amount }));
  return true;
}

export function buyItem(id: string): boolean {
  const item = SHOP.find((i) => i.id === id);
  const s = get();
  if (!item || s.items.includes(id) || s.coins < item.price) return false;
  update((cur) => ({ ...cur, coins: cur.coins - item.price, items: [...cur.items, id], equipped: equipInto(cur.equipped, id) }));
  return true;
}

function equipInto(equipped: string[], id: string): string[] {
  const slot = SHOP.find((i) => i.id === id)?.slot;
  return [...equipped.filter((e) => SHOP.find((i) => i.id === e)?.slot !== slot), id];
}

export function toggleEquip(id: string): void {
  update((s) => ({ ...s, equipped: s.equipped.includes(id) ? s.equipped.filter((e) => e !== id) : equipInto(s.equipped, id) }));
}

export const FEED_COST = 10;

export function feedPet(): boolean {
  const s = get();
  if (s.coins < FEED_COST) return false;
  update((cur) => ({ ...cur, coins: cur.coins - FEED_COST, pet: { lastFed: todayKey(), love: cur.pet.love + 1 } }));
  return true;
}

export function addArcadeSeconds(sec: number): void {
  update((s) => ({ ...s, today: { ...s.today, arcadeSeconds: s.today.arcadeSeconds + sec } }));
}

export function recordGame(game: string, score: number): void {
  update((s) => ({ ...s, games: { ...s.games, [game]: Math.max(s.games[game] ?? 0, score) } }));
}

export function updateSettings(patch: Partial<SaveState["settings"]>): void {
  update((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}

/** Spielstand von einem anderen Gerät übernehmen (ersetzt den aktuellen). */
export function replaceSave(incoming: Partial<SaveState>): void {
  update(() => ({ ...emptyState(), ...incoming, v: 1, settings: { ...emptyState().settings, ...incoming.settings } }));
}

export function savePaint(puzzleId: string, ops: PaintOp[]): void {
  update((s) => ({ ...s, paint: { ...s.paint, [puzzleId]: ops } }));
}

export function logAnswer(entry: AnswerLog): void {
  update((s) => ({ ...s, log: [...s.log, entry].slice(-LOG_MAX) }));
}

/** Spielstand des aktuellen Kindes löschen. Gibt es weitere Kinder, verschwindet es ganz. */
export function resetAll(): void {
  if (profileList().length > 1) removeProfile(getIndex().active);
  else update(() => emptyState());
}

// ---------------------------------------------------------------------------
// Kinder verwalten

export type ProfileEntry = { id: string; profile: Profile; level: number; stars: number; equipped: string[]; active: boolean };

/** Spielstand eines Kindes lesen, ohne zu wechseln (z. B. für den Lernbericht). */
export function readProfileSave(id: string): SaveState | null {
  if (id === getIndex().active) return get();
  try {
    return parseSave(window.localStorage.getItem(keyFor(id)));
  } catch {
    return null;
  }
}

/** Alle Kinder mit fertigem Profil. */
export function profileList(): ProfileEntry[] {
  const { ids, active } = getIndex();
  return ids.flatMap((id) => {
    const s = readProfileSave(id);
    if (!s?.profile) return [];
    return [{ id, profile: s.profile, level: levelInfo(s.xp).level, stars: totalStars(s), equipped: s.equipped, active: id === active }];
  });
}

function markPicked(): void {
  try {
    window.sessionStorage.setItem(PICKED_KEY, "1");
  } catch {
    // egal
  }
}

/** Beim App-Start fragen „Wer spielt?“ — nur wenn es mehrere Kinder gibt, einmal pro Sitzung. */
export function needsProfilePick(): boolean {
  if (profileList().length < 2) return false;
  try {
    return window.sessionStorage.getItem(PICKED_KEY) !== "1";
  } catch {
    return false;
  }
}

export function switchProfile(id: string): void {
  const idx = getIndex();
  if (!idx.ids.includes(id)) return;
  markPicked();
  setIndex({ ...idx, active: id });
  state = null;
  listeners.forEach((l) => l());
}

/** Neues, leeres Kind anlegen und dorthin wechseln — danach läuft das Onboarding. */
export function addProfile(): void {
  const idx = getIndex();
  // Ein angefangenes, nie fertig gewordenes Kind wiederverwenden.
  const empty = idx.ids.find((id) => !readProfileSave(id)?.profile);
  const id = empty ?? `k${Date.now().toString(36)}`;
  setIndex({ active: idx.active, ids: empty ? idx.ids : [...idx.ids, id] });
  switchProfile(id);
}

/** Onboarding für ein weiteres Kind abbrechen. */
export function cancelNewProfile(): void {
  const idx = getIndex();
  const back = profileList()[0];
  if (!back || readSave().profile) return;
  removeProfile(idx.active, back.id);
}

/** Ein Kind samt Spielstand vom Gerät entfernen. */
export function removeProfile(id: string, next?: string): void {
  const idx = getIndex();
  try {
    window.localStorage.removeItem(keyFor(id));
  } catch {
    // egal
  }
  const ids = idx.ids.filter((x) => x !== id);
  if (ids.length === 0) ids.push(MAIN_ID);
  const active = idx.active === id ? (next && ids.includes(next) ? next : ids[0]) : idx.active;
  setIndex({ active, ids });
  state = null;
  listeners.forEach((l) => l());
}

/** Spielstand von einem anderen Gerät als weiteres Kind hinzufügen. */
export function importAsNewProfile(incoming: Partial<SaveState>): void {
  addProfile();
  replaceSave(incoming);
}

/** Andere Tabs halten (z. B. nach einem Wechsel) den gleichen Stand. */
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === INDEX_KEY || e.key === keyFor(getIndex().active)) {
      index = null;
      state = null;
      listeners.forEach((l) => l());
    }
  });
}

export function masteryOf(s: SaveState, skill: string): number {
  return s.mastery[skill] ?? START_MASTERY;
}
