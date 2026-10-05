"use client";

// Die Weltkarte: alle Welten untereinander, jede mit ihrem gewundenen Pfad.

import { greet } from "@/game/voice";
import { activeSeason, adventDay } from "@/game/season";
import { duePractice, PRACTICE_ID } from "@/game/practice";
import { claimBadges } from "@/game/badges";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Archive, Calculator, Gift, Check, ChevronRight, Lightbulb, Lock, Shuffle } from "lucide-react";
import { TIER_NAMES, type Tier } from "@/game/adaptive";
import { petStage } from "@/game/collection";
import {
  currentNode,
  DAILY_GOAL,
  dailyChestWaiting,
  readSave,
  isNodeDone,
  isNodeOpen,
  levelInfo,
  nodeStars,
  openChest,
  tierOpen,
  worldGate,
  worldStars,
  type Reward,
  type SaveState,
} from "@/game/state";
import { COMING_SOON, WORLDS, type PathNode, type World } from "@/game/worlds";
import { sfx } from "@/game/sound";
import { artSrc, SCENERY, useArtReady, type Atlas } from "@/game/art";
import { ChestArt, StarIcon, StarRow } from "@/ui/art";
import { BottomNav, Confetti, Sheet, TopBar } from "@/ui/chrome";
import { BossArt } from "@/ui/Creatures";
import { Button, LinkButton } from "@/ui/Button";
import { Pet } from "@/ui/Pet";
import { RewardCards } from "@/ui/RewardCards";

const COL = 360;
const STEP_Y = 112;
const TOP_Y = 96;

function nodeX(i: number): number {
  return Math.round(COL / 2 + 92 * Math.sin(i * 0.95));
}

export function PathScreen({ save }: { save: SaveState }) {
  const current = currentNode(save);
  const [sheet, setSheet] = useState<{ world: World; node: PathNode } | null>(null);
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "center" });
  }, []);

  // Einmal pro Besuch begrüßen (pro Kind). Blockt der Browser den Ton,
  // weil noch nicht getippt wurde, versuchen wir es beim nächsten Mal.
  const name = save.profile?.name;
  useEffect(() => {
    const key = `sternenpfad.greeted.${name ?? ""}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {
      return;
    }
    void greet().then((ok) => {
      if (!ok) return;
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        // Ohne Speicher eben jedes Mal begrüßen.
      }
    });
  }, [name]);

  const dailyWaiting = dailyChestWaiting(save);
  const practiceDue = duePractice(save).length;
  const lessonsToday = dailyWaiting ? 0 : save.today.lessons;

  return (
    <div className="min-h-dvh pb-28">
      <TopBar save={save} />

      <div className="mx-3.5 mt-3 flex items-center gap-3 rounded-[20px] bg-white px-4 py-2.5 sm:mx-auto sm:max-w-[548px]">
        <div className={`relative shrink-0 ${dailyWaiting ? "anim-wiggle" : "opacity-60"}`} title={dailyWaiting ? "Tagesschatz wartet" : "Tagesschatz geöffnet"}>
          <ChestArt size={40} open={!dailyWaiting} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-extrabold text-ink-soft">{dailyWaiting ? "Tagesschatz wartet – schaff eine Lektion!" : lessonsToday >= DAILY_GOAL ? "Tagesziel geschafft!" : "Tagesziel"}</div>
          <div className="mt-1 h-3 overflow-hidden rounded-full bg-grape-light">
            <div className="h-full rounded-full bg-grape transition-all" style={{ width: `${Math.min(100, (lessonsToday / DAILY_GOAL) * 100)}%` }} />
          </div>
        </div>
        <div className="font-display text-lg font-semibold">
          {Math.min(lessonsToday, DAILY_GOAL)} / {DAILY_GOAL}
        </div>
      </div>

      <SeasonBanner />

      {practiceDue > 0 && (
        <Link href={`/lektion/?n=${PRACTICE_ID}`} className="anim-pop mx-3.5 mt-2.5 flex items-center gap-3 rounded-[20px] bg-sun-light px-4 py-2.5 sm:mx-auto sm:max-w-[548px]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sun text-ink">
            <Archive size={20} strokeWidth={2.4} />
          </span>
          <span className="flex-1">
            <span className="block font-extrabold">Übungskiste</span>
            <span className="block text-sm text-ink-soft">
              {practiceDue === 1 ? "1 Aufgabe" : `${Math.min(practiceDue, 8)} Aufgaben`} von neulich – nochmal probieren!
            </span>
          </span>
          <ChevronRight size={20} className="text-ink-soft" />
        </Link>
      )}

      <Link href="/training/" className="mx-3.5 mt-2.5 flex items-center gap-3 rounded-[20px] bg-white px-4 py-2.5 sm:mx-auto sm:max-w-[548px]">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf-light text-leaf-dark">
          <Calculator size={20} strokeWidth={2.4} />
        </span>
        <span className="flex-1 font-extrabold">Kopfrechen-Training</span>
        <ChevronRight size={20} className="text-ink-soft" />
      </Link>

      {WORLDS.map((world) => (
        <WorldSection key={world.id} world={world} save={save} current={current?.node.id ?? null} currentRef={currentRef} onPick={(node) => setSheet({ world, node })} />
      ))}

      <div className="mx-3.5 mt-6 grid grid-cols-2 gap-3 sm:mx-auto sm:max-w-[548px]">
        {COMING_SOON.map((name) => (
          <div key={name} className="rounded-[20px] bg-white/60 px-4 py-4 text-center">
            <svg viewBox="0 0 40 28" width="44" height="30" className="mx-auto" aria-hidden="true">
              <path d="M10 26 a8 8 0 0 1 -1 -16 a11 11 0 0 1 21 -2 a9 9 0 0 1 1 18 z" fill="#C9D3E3" />
            </svg>
            <div className="mt-1 font-display text-lg font-semibold text-ink-soft">{name}</div>
            <div className="text-xs text-ink-soft">im Nebel</div>
          </div>
        ))}
      </div>

      {sheet && <NodeSheet save={save} world={sheet.world} node={sheet.node} onClose={() => setSheet(null)} />}
      <BottomNav />
    </div>
  );
}

function WorldSection({
  world,
  save,
  current,
  currentRef,
  onPick,
}: {
  world: World;
  save: SaveState;
  current: string | null;
  currentRef: React.RefObject<HTMLDivElement | null>;
  onPick: (node: PathNode) => void;
}) {
  const gate = worldGate(save, world);
  const { have, max } = worldStars(save, world);
  const height = TOP_Y + (world.nodes.length - 1) * STEP_Y + 90;
  const pts = world.nodes.map((_, i) => [nodeX(i), TOP_Y + i * STEP_Y] as const);
  const d = pts.map(([x, y], i) => (i === 0 ? `M${x} ${y}` : `C${pts[i - 1][0]} ${pts[i - 1][1] + 60} ${x} ${y - 60} ${x} ${y}`)).join(" ");
  const level = levelInfo(save.xp).level;
  const art = useSceneryReady(world);

  return (
    <section className="mt-5 pt-1" style={{ background: gate.open ? world.theme.ground : undefined }}>
      <div className="mx-3.5 mt-2 flex items-center sm:mx-auto sm:max-w-[548px] justify-between rounded-[22px] px-4 py-3 text-white chunky" style={{ background: gate.open ? world.theme.band : "#9AA6B8", ["--shade" as string]: gate.open ? world.theme.bandShade : "#7F8AA0" }}>
        <div>
          <div className="text-xs font-extrabold tracking-[0.15em] opacity-85">WELT {world.index + 1}</div>
          <div className="font-display text-2xl font-semibold leading-tight">{world.name}</div>
          <div className="text-sm opacity-90">{world.tagline}</div>
        </div>
        <div className="flex items-center gap-1 font-display text-lg font-semibold">
          <StarIcon size={20} />
          {have} / {max}
        </div>
      </div>

      {!gate.open ? (
        <div className="mx-3.5 mt-3 flex items-center gap-4 rounded-[22px] bg-white/70 p-5 sm:mx-auto sm:max-w-[548px]">
          <Lock className="shrink-0 text-ink-soft" size={34} />
          <div className="font-extrabold text-ink-soft">
            {gate.reason === "boss" ? `Besiege erst den Boss der Welt davor.` : `Noch ${gate.missing} Sterne sammeln — spiel Lektionen nochmal für mehr Sterne!`}
          </div>
        </div>
      ) : (
        <div className="relative">
          <Scenery world={world} height={height} />
          <div className="relative mx-auto" style={{ width: COL, height }}>
          {!art && <Decor world={world} height={height} />}
          <svg width={COL} height={height} className="absolute inset-0" aria-hidden="true">
            {art && <path d={d} fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="38" strokeLinecap="round" />}
            <path d={d} fill="none" stroke={world.theme.decoDark} strokeOpacity={art ? 0.55 : 0.45} strokeWidth="26" strokeLinecap="round" />
            <path d={d} fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeDasharray="1 20" />
          </svg>
          {world.nodes.map((node, i) => {
            const [x, y] = pts[i];
            const isCurrent = node.id === current;
            const open = isNodeOpen(save, world, i);
            return (
              <div key={node.id} ref={isCurrent ? currentRef : undefined} className="absolute" style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}>
                <NodeButton save={save} world={world} node={node} open={open} current={isCurrent} onPick={() => (open ? onPick(node) : sfx.wrong())} />
                {isCurrent && save.profile && (
                  <div className={`anim-bob pointer-events-none absolute top-1/2 -translate-y-1/2 ${x > COL / 2 ? "right-full mr-3" : "left-full ml-3"}`}>
                    <Pet species={save.profile.pet} stage={petStage(level)} equipped={save.equipped} size={64} />
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
      )}
    </section>
  );
}

function NodeButton({ save, world, node, open, current, onPick }: { save: SaveState; world: World; node: PathNode; open: boolean; current: boolean; onPick: () => void }) {
  const done = isNodeDone(save, node);
  const stars = nodeStars(save, node.id);
  const topTier = stars[2] > 0 ? 2 : stars[1] > 0 ? 1 : 0;

  if (node.kind === "chest") {
    return (
      <button aria-label={!open ? "Schatzkiste, gesperrt" : done ? "Schatzkiste (offen)" : "Schatzkiste"} onClick={onPick} className={`chunky flex h-[74px] w-[74px] items-center justify-center rounded-[24px] ${current ? "anim-shake" : ""}`} style={{ background: !open ? "#E3E8F0" : done ? "#FFE2B8" : "#FF9F1C", ["--shade" as string]: !open ? "#C2CAD6" : "#D97B00" }}>
        {open ? <ChestArt size={52} open={done} /> : <Lock className="text-[#9AA6B8]" size={28} />}
      </button>
    );
  }

  if (node.kind === "boss") {
    return (
      <div className="relative">
        {current && <div className="anim-ring absolute inset-0 rounded-full border-[6px]" style={{ borderColor: world.boss.color }} />}
        <button aria-label={`Boss: ${world.boss.name}`} onClick={onPick} className="chunky flex h-[96px] w-[96px] items-center justify-center rounded-full" style={{ background: open ? world.boss.color : "#C2CAD6", ["--shade" as string]: open ? world.boss.shade : "#9AA6B8", ["--depth" as string]: "7px" }}>
          <BossArt world={world.id} color={open ? world.boss.color : "#C2CAD6"} size={84} mood={done ? "dizzy" : "grin"} />
        </button>
        {done && <div className="absolute -top-6 left-1/2 -translate-x-1/2"><StarRow count={stars[0]} size={18} /></div>}
        {!open && (
          <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white">
            <Lock size={16} className="text-ink-soft" />
          </div>
        )}
      </div>
    );
  }

  const KindIcon = node.kind === "trick" ? Lightbulb : node.kind === "review" ? Shuffle : Check;
  const doneColor = node.kind === "trick" ? ["#4CC3FF", "#2A9FD9"] : node.kind === "review" ? ["#2BB673", "#1E8F57"] : ["#FFC531", "#E5A100"];
  const size = current ? 90 : 72;
  let bg = "#E3E8F0";
  let shade = "#C2CAD6";
  if (current) [bg, shade] = ["#7B4DFF", "#5A2FE0"];
  else if (done) [bg, shade] = doneColor;
  else if (open) [bg, shade] = ["#FFFFFF", "#C9BCFF"];
  const tierRing = topTier === 2 ? "#FFD23F" : topTier === 1 ? "#C7D0E6" : null;

  return (
    <div className="relative flex flex-col items-center">
      {done && (
        <div className="absolute -top-7">
          <StarRow count={stars[topTier]} size={19} />
        </div>
      )}
      {current && <div className="anim-ring absolute rounded-full border-[6px] border-grape" style={{ width: size, height: size }} />}
      <button
        aria-label={`${node.title}${done ? ", geschafft" : open ? "" : ", gesperrt"}`}
        onClick={onPick}
        className="chunky flex items-center justify-center rounded-full"
        style={{ width: size, height: size, background: bg, ["--shade" as string]: shade, boxShadow: tierRing ? `0 0 0 5px ${tierRing}, 0 6px 0 5px ${shade}` : undefined }}
      >
        {!open ? (
          <Lock size={26} className="text-[#9AA6B8]" />
        ) : current ? (
          <StarIcon size={46} className="drop-shadow" />
        ) : (
          <KindIcon size={32} strokeWidth={3} className={done ? "text-white" : "text-grape"} />
        )}
      </button>
      {(current || (open && !done)) && (
        <div className="mt-2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-sm font-extrabold shadow-[0_3px_0_rgba(31,35,71,0.1)]">{node.title}</div>
      )}
    </div>
  );
}

/** `true`, sobald alle drei Landschaftsbilder der Welt geladen sind. */
function useSceneryReady(world: World): boolean {
  const [a, b, c] = SCENERY[world.id] ?? NO_SCENERY;
  const ready = [useArtReady(a), useArtReady(b), useArtReady(c)];
  return SCENERY[world.id] !== undefined && ready.every(Boolean);
}

/** Platzhalter für Welten ohne Landschaftsbilder (Hooks brauchen immer drei). */
const NO_SCENERY: Atlas[] = Array.from({ length: 3 }, (_, i) => ({ local: `/art/none-${i}.webp`, url: "", cols: 1, rows: 1 }));

/** Überblend-Zone zwischen zwei Landschaftsbildern (px). */
const BLEND = 70;

/**
 * Die gemalte Landschaft hinter dem Pfad: drei Bilder übereinander, die
 * weich ineinander übergehen. Auf breiten Bildschirmen bleibt sie mittig und
 * läuft zu den Seiten in die Grundfarbe der Welt aus.
 */
function Scenery({ world, height }: { world: World; height: number }) {
  const ready = useSceneryReady(world);
  if (!ready) return null;
  const panels = SCENERY[world.id] ?? NO_SCENERY;
  const panelH = (height + BLEND * (panels.length - 1)) / panels.length;
  const fade = `linear-gradient(to bottom, transparent, #000 ${BLEND}px, #000 calc(100% - ${BLEND}px), transparent)`;
  return (
    <div aria-hidden="true" className="anim-fade pointer-events-none absolute inset-0 overflow-hidden">
      <div className="scenery relative mx-auto h-full max-w-[600px]">
        {panels.map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- statischer Export, kein Bild-Optimierer
          <img
            key={p.local}
            src={artSrc(p) ?? undefined}
            alt=""
            draggable={false}
            className="absolute left-0 w-full object-cover"
            style={{ top: i * (panelH - BLEND), height: panelH, maskImage: fade, WebkitMaskImage: fade }}
          />
        ))}
      </div>
    </div>
  );
}

function Decor({ world, height }: { world: World; height: number }) {
  const items = Math.floor(height / 140);
  return (
    <svg width={COL} height={height} className="absolute inset-0" aria-hidden="true">
      {Array.from({ length: items }, (_, i) => {
        const y = 90 + i * 140;
        const side = Math.sin((y - TOP_Y) / STEP_Y * 0.95) > 0 ? 34 : COL - 34;
        if (world.id === "wald")
          return (
            <g key={i}>
              <circle cx={side} cy={y} r="22" fill={world.theme.deco} />
              <circle cx={side + (side < COL / 2 ? 16 : -16)} cy={y + 18} r="14" fill={world.theme.decoDark} />
              <rect x={side - 3} y={y + 18} width="6" height="18" rx="3" fill="#6E8B5B" />
            </g>
          );
        if (world.id === "zirkus")
          return (
            <g key={i}>
              <circle cx={side} cy={y} r="16" fill={world.theme.decoDark} />
              <path d={`M${side} ${y + 16} q-4 14 2 28`} stroke="#fff" strokeWidth="2" fill="none" />
              <path d={`M${side + (side < COL / 2 ? 22 : -22)} ${y + 30} l4 9 9 1 -7 6 2 9 -8 -4 -8 4 2 -9 -7 -6 9 -1z`} fill={world.theme.deco} />
            </g>
          );
        if (world.id === "hafen")
          return (
            <g key={i}>
              <path d={`M${side - 24} ${y + 8} H${side + 24} L${side + 16} ${y + 24} H${side - 16} Z`} fill="#B07A4F" />
              <rect x={side - 2} y={y - 26} width="4" height="34" fill="#7A4E2D" />
              <path d={`M${side + 2} ${y - 24} L${side + 20} ${y} H${side + 2} Z`} fill="#fff" />
              <path d={`M${side - 30} ${y + 34} q8 -8 16 0 t16 0 t16 0 t16 0`} stroke={world.theme.decoDark} strokeWidth="4" fill="none" strokeLinecap="round" />
            </g>
          );
        if (world.id === "detektiv")
          return (
            <g key={i}>
              <circle cx={side - 6} cy={y} r="13" fill={world.theme.deco} stroke={world.theme.decoDark} strokeWidth="4" />
              <path d={`M${side + 3} ${y + 9} l12 12`} stroke={world.theme.band} strokeWidth="6" strokeLinecap="round" />
              <g fill={world.theme.decoDark} opacity="0.7">
                <ellipse cx={side - 22} cy={y + 34} rx="5" ry="7" />
                <ellipse cx={side - 8} cy={y + 46} rx="5" ry="7" />
                <ellipse cx={side + 6} cy={y + 36} rx="5" ry="7" />
              </g>
            </g>
          );
        if (world.id === "werkstatt")
          return (
            <g key={i}>
              <rect x={side - 26} y={y - 8} width="52" height="16" rx="3" fill={world.theme.deco} stroke={world.theme.decoDark} strokeWidth="2" />
              <path d={`M${side - 18} ${y - 8} v6 M${side - 9} ${y - 8} v4 M${side} ${y - 8} v6 M${side + 9} ${y - 8} v4 M${side + 18} ${y - 8} v6`} stroke={world.theme.decoDark} strokeWidth="2" />
              <circle cx={side + (side < COL / 2 ? 18 : -18)} cy={y + 32} r="10" fill="none" stroke={world.theme.decoDark} strokeWidth="5" strokeDasharray="5 4" />
            </g>
          );
        if (world.id === "ozean")
          return (
            <g key={i}>
              <path d={`M${side} ${y - 22} l7 14 15 2 -11 10 3 15 -14 -7 -14 7 3 -15 -11 -10 15 -2z`} fill={world.theme.decoDark} />
              <circle cx={side + (side < COL / 2 ? 24 : -24)} cy={y + 30} r="7" fill="none" stroke={world.theme.decoDark} strokeWidth="3" />
              <circle cx={side + (side < COL / 2 ? 14 : -14)} cy={y + 44} r="4" fill="none" stroke={world.theme.decoDark} strokeWidth="2.5" />
            </g>
          );
        if (world.id === "schloss")
          return (
            <g key={i}>
              <rect x={side - 14} y={y - 10} width="28" height="44" fill={world.theme.deco} />
              <path d={`M${side - 18} ${y - 8} L${side} ${y - 34} L${side + 18} ${y - 8} Z`} fill={world.theme.decoDark} />
              <circle cx={side} cy={y + 6} r="8" fill="#fff" />
              <path d={`M${side} ${y + 6} v-5 M${side} ${y + 6} h4`} stroke="#2E3A8C" strokeWidth="2" strokeLinecap="round" />
            </g>
          );
        if (world.id === "baeckerei")
          return (
            <g key={i}>
              <path d={`M${side - 20} ${y + 14} C${side - 34} ${y + 14} ${side - 34} ${y - 4} ${side - 22} ${y - 6} C${side - 14} ${y - 20} ${side + 14} ${y - 20} ${side + 22} ${y - 6} C${side + 34} ${y - 4} ${side + 34} ${y + 14} ${side + 20} ${y + 14} Z`} fill={world.theme.deco} stroke={world.theme.decoDark} strokeWidth="3" />
              <path d={`M${side - 10} ${y - 2} q6 6 12 0 M${side + 2} ${y + 4} q6 6 12 0`} stroke={world.theme.decoDark} strokeWidth="3" fill="none" strokeLinecap="round" />
              <circle cx={side + (side < COL / 2 ? 26 : -26)} cy={y + 36} r="9" fill="#E3A36B" />
            </g>
          );
        if (world.id === "start")
          return (
            <g key={i}>
              <rect x={side - 3} y={y - 6} width="6" height="40" rx="3" fill="#B07A4F" />
              <path d={`M${side} ${y - 6} q-22 -6 -30 8 M${side} ${y - 6} q22 -6 30 8 M${side} ${y - 6} q-10 -18 -26 -16 M${side} ${y - 6} q10 -18 26 -16`} stroke="#2BB673" strokeWidth="7" fill="none" strokeLinecap="round" />
            </g>
          );
        return (
          <g key={i}>
            <path d={`M${side - 18} ${y + 10} q18 -34 36 0 z`} fill={world.theme.deco} stroke="#F2B84B" strokeWidth="3" />
            <path d={`M${side - 26} ${y + 34} q8 -8 16 0 t16 0 t16 0`} stroke={world.theme.decoDark} strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        );
      })}
    </svg>
  );
}

function NodeSheet({ save, world, node, onClose }: { save: SaveState; world: World; node: PathNode; onClose: () => void }) {
  const stars = nodeStars(save, node.id);
  const firstOpenUnfinished = ([0, 1, 2] as Tier[]).filter((t) => tierOpen(save, node.id, t)).find((t) => stars[t] < 3);
  const [tier, setTier] = useState<Tier>(firstOpenUnfinished ?? (([2, 1, 0] as Tier[]).find((t) => tierOpen(save, node.id, t)) ?? 0));
  const [chestRewards, setChestRewards] = useState<Reward[] | null>(null);

  if (node.kind === "chest") {
    const opened = save.chests.includes(node.id);
    return (
      <Sheet open onClose={onClose} tone="bg-coin">
        {chestRewards && <Confetti />}
        <div className="flex flex-col items-center gap-4 text-white">
          {chestRewards ? (
            <>
              <h2 className="font-display text-3xl font-semibold">Juhu!</h2>
              <RewardCards rewards={chestRewards} />
              <Button tone="white" className="w-full" onClick={onClose}>
                Weiter
              </Button>
            </>
          ) : opened ? (
            <>
              <ChestArt size={120} open />
              <h2 className="font-display text-2xl font-semibold">Diese Truhe ist schon leer.</h2>
              <Button tone="white" className="w-full" onClick={onClose}>
                Okay
              </Button>
            </>
          ) : (
            <>
              <h2 className="font-display text-3xl font-semibold">Eine Schatzkiste!</h2>
              <button
                aria-label="Truhe öffnen"
                onClick={() => {
                  sfx.chest();
                  const got = openChest(node, world);
                  setChestRewards([...got, ...claimBadges(readSave())]);
                }}
              >
                <ChestArt size={170} className="anim-shake" />
              </button>
              <p className="font-display text-xl">Tippe zum Öffnen</p>
            </>
          )}
        </div>
      </Sheet>
    );
  }

  if (node.kind === "boss") {
    const beaten = save.bosses.includes(node.id);
    return (
      <Sheet open onClose={onClose} tone="bg-night">
        <div className="flex flex-col items-center gap-3 text-center text-white">
          <BossArt world={world.id} color={world.boss.color} size={150} mood={beaten ? "dizzy" : "grin"} />
          <h2 className="font-display text-3xl font-semibold">{world.boss.name}</h2>
          <p className="text-lg text-white/85">{beaten ? "Schon besiegt! Willst du nochmal?" : "Jede richtige Antwort ist ein Treffer. Besiege den Boss, um die nächste Welt zu öffnen!"}</p>
          <LinkButton href={`/lektion?n=${node.id}&t=0`} tone="rose" className="mt-2 w-full">
            Kämpfen!
          </LinkButton>
        </div>
      </Sheet>
    );
  }

  const kindLabel = node.kind === "trick" ? "Neuer Rechentrick" : node.kind === "review" ? "Gemischte Wiederholung" : "Lektion";
  return (
    <Sheet open onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div>
          <div className="text-sm font-extrabold tracking-wider text-grape">{kindLabel.toUpperCase()}</div>
          <h2 className="font-display text-3xl font-semibold">{node.title}</h2>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {([0, 1, 2] as Tier[]).map((t) => {
            const open = tierOpen(save, node.id, t);
            const active = t === tier;
            return (
              <button
                key={t}
                disabled={!open}
                onClick={() => setTier(t)}
                className={`flex flex-col items-center gap-1 rounded-[20px] border-4 px-1 py-3 ${active ? "border-grape bg-grape-light" : "border-transparent bg-mist"} disabled:opacity-45`}
              >
                <div className="h-6 w-6 rounded-full" style={{ background: ["#E8A06A", "#C7D0E6", "#FFD23F"][t] }} />
                <div className="text-sm font-extrabold">{TIER_NAMES[t]}</div>
                {open ? <StarRow count={stars[t]} size={15} /> : <Lock size={16} className="text-ink-soft" />}
              </button>
            );
          })}
        </div>
        {tier > 0 && <p className="text-center text-sm text-ink-soft">{tier === 1 ? "Profi: größere Zahlen, mehr Knobeln." : "Meister: die schwersten Aufgaben!"}</p>}
        <LinkButton href={`/lektion?n=${node.id}&t=${tier}`} tone="grape" className="w-full">
          Los geht&apos;s!
        </LinkButton>
      </div>
    </Sheet>
  );
}

/** Halloween im Oktober, Adventskalender im Dezember. */
function SeasonBanner() {
  const season = activeSeason();
  if (season === "halloween") {
    return (
      <div className="relative mx-3.5 mt-2.5 overflow-hidden rounded-[20px] bg-[#2E2A4F] px-4 py-3 text-white sm:mx-auto sm:max-w-[548px]">
        <svg viewBox="52 0 68 40" width="68" height="40" aria-hidden="true" className="absolute bottom-3 right-3 opacity-90">
          <path d="M10 18 q6 -9 12 0 q6 -9 12 0 q-6 3 -12 9 q-6 -6 -12 -9 Z M60 8 q5 -7 10 0 q5 -7 10 0 q-5 2 -10 7 q-5 -5 -10 -7 Z" fill="#9B8FD0" />
          <ellipse cx="102" cy="28" rx="14" ry="11" fill="#FF9F1C" />
          <path d="M101 17 q0 -6 4 -8" stroke="#2BB673" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M96 25 l3 -3 l2 3 Z M104 25 l3 -3 l2 3 Z M96 31 q6 4 12 0" stroke="#2E2A4F" strokeWidth="1.6" fill="#2E2A4F" />
        </svg>
        <div className="pr-24 font-display text-xl font-semibold leading-tight text-[#FFB648]">Halloween im Sternenpfad!</div>
        <div className="pr-24 text-sm text-white/80">Gruselig-süße Kürbis-Sticker verstecken sich jetzt in den Truhen.</div>
      </div>
    );
  }
  if (season === "winter" && adventDay() > 0) {
    return (
      <Link href="/advent/" className="anim-pop mx-3.5 mt-2.5 flex items-center gap-3 rounded-[20px] bg-[#1B2050] px-4 py-3 text-white sm:mx-auto sm:max-w-[548px]">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5484D]">
          <Gift size={22} strokeWidth={2.4} />
        </span>
        <span className="flex-1">
          <span className="block font-display text-xl font-semibold">Adventskalender</span>
          <span className="block text-sm text-white/80">Türchen {adventDay()} wartet auf dich!</span>
        </span>
        <ChevronRight size={20} className="text-white/70" />
      </Link>
    );
  }
  return null;
}
