"use client";

// Spielstand: ein Objekt, im localStorage gespeichert, über einen kleinen
// Store mit `useSyncExternalStore` an React angebunden.
//
// Bewusst ohne Server: die App ist ein statischer Export. Cloud-Sync kommt
// später (Roadmap Phase 4) — dann wird dieses Objekt nur woanders gespeichert.

import { useSyncExternalStore } from "react";
import { START_MASTERY, type Tier } from "./adaptive";
import { STICKERS, SHOP, type PetSpecies } from "./collection";
import { WORLDS, starNodes, type PathNode, type World } from "./worlds";
import { pick } from "./random";
import type { WorldId } from "./skills";
import type { Level, TaskDraft } from "./types";

const KEY = "sternenpfad.v1";

export type Profile = { name: string; pet: PetSpecies; petName: string };

export type NodeProgress = { stars: [number, number, number]; plays: number };

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
  settings: { sound: boolean; autoRead: boolean; arcadeMinutes: number };
  stats: { tasks: number; firstTry: number; lessons: number };
  games: Record<string, number>;
  /** Verliehene Abzeichen (IDs). */
  badges: string[];
  /** Wie viele Tagesschätze schon geöffnet wurden. */
  dailyChests: number;
  /** Übungskiste: falsch gelöste Aufgaben, die später wiederkommen. */
  practice: PracticeItem[];
};

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
    settings: { sound: true, autoRead: false, arcadeMinutes: 15 },
    stats: { tasks: 0, firstTry: 0, lessons: 0 },
    games: {},
    badges: [],
    dailyChests: 0,
    practice: [],
  };
}

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Store

let state: SaveState | null = null;
const listeners = new Set<() => void>();

function load(): SaveState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SaveState>;
      if (parsed.v === 1) return rollDay({ ...emptyState(), ...parsed, settings: { ...emptyState().settings, ...parsed.settings } });
    }
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
    window.localStorage.setItem(KEY, JSON.stringify(state));
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
  | { kind: "daily" };

const DUPLICATE_COINS = 15;

/** Würfelt einen Sticker der Welt — neue sind wahrscheinlicher, seltene seltener. */
export function rollSticker(s: SaveState, world: WorldId, allowRare: boolean): Reward {
  const pool = STICKERS.filter((st) => st.world === world && (allowRare || !st.rare || Math.random() < 0.12));
  const fresh = pool.filter((st) => !s.stickers[st.id]);
  const chosen = fresh.length > 0 && Math.random() < 0.8 ? pick(fresh) : pick(pool);
  return { kind: "sticker", id: chosen.id, duplicate: (s.stickers[chosen.id] ?? 0) > 0 };
}

export function applyRewards(s: SaveState, rewards: Reward[]): SaveState {
  let next = { ...s, stickers: { ...s.stickers }, pages: [...s.pages] };
  for (const r of rewards) {
    if (r.kind === "coins") next = { ...next, coins: next.coins + r.amount };
    if (r.kind === "sticker") {
      next.stickers[r.id] = (next.stickers[r.id] ?? 0) + 1;
      if (r.duplicate) next = { ...next, coins: next.coins + DUPLICATE_COINS };
    }
    if (r.kind === "page" && !next.pages.includes(r.id)) next.pages.push(r.id);
    if (r.kind === "daily") next = { ...next, dailyChests: next.dailyChests + 1 };
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
      nodes: o.node.practice ? s.nodes : { ...s.nodes, [o.node.id]: { stars, plays: (s.nodes[o.node.id]?.plays ?? 0) + 1 } },
      today: { ...s.today, lessons: s.today.lessons + 1 },
      stats: { tasks: s.stats.tasks + o.tasks, firstTry: s.stats.firstTry + o.firstTry, lessons: s.stats.lessons + 1 },
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
  if (dailyChestWaiting(s)) {
    rewards.push({ kind: "daily" }, rollSticker(s, world.id, true), { kind: "coins", amount: DAILY_COINS });
    // Folgende Sticker gegen den Stand NACH dem Tagesschatz würfeln (sonst zweimal „neu").
    s = applyRewards(s, rewards);
  }
  if (node.kind === "boss") {
    if (firstTime && node.coloring) rewards.push({ kind: "page", id: node.coloring });
    rewards.push(rollSticker(s, world.id, true));
    rewards.push({ kind: "coins", amount: 50 });
    return rewards;
  }
  if (firstTime || Math.random() < 0.45) rewards.push(rollSticker(s, world.id, false));
  rewards.push({ kind: "coins", amount: firstTime ? 20 : 10 });
  return rewards;
}

export function openChest(node: PathNode, world: World): Reward[] {
  const s = get();
  if (s.chests.includes(node.id)) return [];
  const rewards: Reward[] = [];
  if (node.coloring) rewards.push({ kind: "page", id: node.coloring });
  rewards.push(rollSticker(s, world.id, true));
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

export function resetAll(): void {
  update(() => emptyState());
}

export function masteryOf(s: SaveState, skill: string): number {
  return s.mastery[skill] ?? START_MASTERY;
}
