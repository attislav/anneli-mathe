"use client";

// Sammeln: Sticker-Album, Ausmalbilder-Galerie, Laden fürs Haustier.

import { activeSeason, SEASON_NAMES, type SeasonId } from "@/game/season";
import type { CollectionGroup } from "@/game/collection";

const SEASON_GROUPS = (Object.keys(SEASON_NAMES) as SeasonId[]).map((id) => ({ id: id as CollectionGroup, name: SEASON_NAMES[id] }));
import Link from "next/link";
import { useState } from "react";
import { isComplete, PIECES, PUZZLES } from "@/game/puzzles";
import { PuzzleGrid } from "@/ui/PuzzleArt";
import { Lock } from "lucide-react";
import { petStage, SHOP, stickersOf } from "@/game/collection";
import { COLORING_PAGES } from "@/game/coloring";
import { buyItem, levelInfo, toggleEquip, type SaveState } from "@/game/state";
import { sfx } from "@/game/sound";
import { WORLDS } from "@/game/worlds";
import { CoinIcon } from "@/ui/art";
import { BottomNav, Pill, useBackdrop } from "@/ui/chrome";
import { StickerArt } from "@/ui/Creatures";
import { ColoringSvg } from "@/ui/ColoringSvg";
import { Pet } from "@/ui/Pet";

type Tab = "sticker" | "bilder" | "laden";

export function CollectScreen({ save, initialTab = "sticker" }: { save: SaveState; initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  useBackdrop("#FFF1CC");
  return (
    <div className="mx-auto min-h-dvh max-w-xl bg-[#FFF1CC] px-4 pb-28 pt-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Meine Schätze</h1>
        <Pill className="bg-white">
          <CoinIcon size={22} />
          {save.coins}
        </Pill>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1.5 rounded-[18px] bg-white p-1.5" role="tablist">
        {(
          [
            ["sticker", "Sticker"],
            ["bilder", "Malbilder"],
            ["laden", "Laden"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`h-11 rounded-[14px] text-[15px] font-extrabold ${tab === id ? "bg-coin text-white" : "text-ink-soft"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {tab === "sticker" && <Stickers save={save} />}
        {tab === "bilder" && <Pages save={save} />}
        {tab === "laden" && <Shop save={save} />}
      </div>
      <BottomNav />
    </div>
  );
}

function Stickers({ save }: { save: SaveState }) {
  return (
    <>
      {[...WORLDS.map((w) => ({ id: w.id as CollectionGroup, name: w.name })), ...SEASON_GROUPS.filter((g) => activeSeason() === g.id || stickersOf(g.id).some((st) => save.stickers[st.id]))].map((world) => {
        const list = stickersOf(world.id);
        const got = list.filter((s) => save.stickers[s.id]).length;
        return (
          <section key={world.id} className="rounded-[24px] bg-white p-4 shadow-[0_5px_0_#F2D58A]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">{world.name}</h2>
              <div className="flex items-center gap-2 text-sm font-extrabold text-ink-soft">
                {got} / {list.length}
                <div className="h-2.5 w-16 overflow-hidden rounded-full bg-[#F1ECDD]">
                  <div className="h-full rounded-full bg-coin" style={{ width: `${(got / list.length) * 100}%` }} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {list.map((st) => {
                const n = save.stickers[st.id] ?? 0;
                return (
                  <div key={st.id} className={`relative flex h-[84px] flex-col items-center justify-center rounded-2xl ${n ? (st.rare ? "bg-sun-light" : "bg-mist") : "bg-[#F6F3EA]"}`}>
                    <StickerArt sticker={st} size={50} hidden={!n} />
                    <div className={`max-w-full truncate px-1 text-[11px] font-extrabold ${n ? "text-ink" : "text-[#A8A390]"}`}>{n ? st.name : "???"}</div>
                    {n > 1 && <div className="absolute right-1 top-1 rounded-full bg-grape px-1.5 text-[10px] font-extrabold text-white">×{n}</div>}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
      <p className="text-center text-sm text-ink-soft">Sticker gibt es in Truhen nach Lektionen. Doppelte werden zu Münzen.</p>
    </>
  );
}

function Puzzles({ save }: { save: SaveState }) {
  if (PUZZLES.length === 0) return null;
  return (
    <div className="mb-4">
      <h2 className="mb-1 font-display text-2xl font-semibold">Geheime Puzzle-Bilder</h2>
      <p className="mb-3 text-sm text-ink-soft">Sammle alle 9 Teile — dann zeigt sich das Bild und du kannst es ausmalen oder ausdrucken.</p>
      <div className="grid grid-cols-2 gap-3">
        {PUZZLES.map((pz) => {
          const have = save.puzzles[pz.id] ?? [];
          const done = isComplete(have);
          const world = WORLDS.find((w) => w.id === pz.world);
          const body = (
            <>
              <PuzzleGrid puzzle={pz} have={have} width={132} />
              <div className="text-center font-extrabold leading-tight">{done ? pz.title : `${have.length} / ${PIECES} Teile`}</div>
              {!done && world && <div className="text-center text-xs text-ink-soft">Welt {world.index + 1}: {world.name}</div>}
            </>
          );
          return done ? (
            <Link key={pz.id} href={`/malen/?p=${pz.id}`} className="chunky flex flex-col items-center gap-2 rounded-[22px] bg-white p-3" style={{ ["--shade" as string]: "#F2D58A" }}>
              {body}
            </Link>
          ) : (
            <div key={pz.id} className="flex flex-col items-center gap-2 rounded-[22px] bg-white/70 p-3">
              {body}
            </div>
          );
        })}
      </div>
      <h2 className="mb-2 mt-5 font-display text-2xl font-semibold">Ausmalbilder</h2>
    </div>
  );
}

function Pages({ save }: { save: SaveState }) {
  return (
    <>
      <Puzzles save={save} />
      <div className="grid grid-cols-2 gap-3">
        {COLORING_PAGES.map((page) => {
          const unlocked = save.pages.includes(page.id);
          const world = WORLDS.find((w) => w.id === page.world);
          const hint = world ? `Versteckt in einer Truhe im ${world.name}` : page.world === "halloween" ? "Gibt's nur im Oktober im Tagesschatz" : "Versteckt im Adventskalender";
          return unlocked ? (
            <Link key={page.id} href={`/ausmalen?b=${page.id}`} className="chunky flex flex-col items-center gap-2 rounded-[22px] bg-white p-3" style={{ ["--shade" as string]: "#F2D58A" }}>
              <ColoringSvg page={page} fills={save.fills[page.id] ?? {}} size={140} />
              <div className="text-center font-extrabold leading-tight">{page.title}</div>
            </Link>
          ) : (
            <div key={page.id} className="flex flex-col items-center justify-center gap-2 rounded-[22px] bg-white/60 p-3 text-center" style={{ minHeight: 200 }}>
              <Lock className="text-ink-soft" size={30} />
              <div className="text-sm font-extrabold text-ink-soft">{hint}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Shop({ save }: { save: SaveState }) {
  const [msg, setMsg] = useState<string | null>(null);
  const level = levelInfo(save.xp).level;
  return (
    <>
      <div className="flex flex-col items-center rounded-[24px] bg-white p-4 shadow-[0_5px_0_#F2D58A]">
        {save.profile && <Pet species={save.profile.pet} stage={petStage(level)} equipped={save.equipped} mood="joy" size={150} />}
        <div className="font-display text-xl font-semibold">{save.profile?.petName}</div>
        {msg && <div className="anim-pop mt-1 text-sm font-extrabold text-coin-dark">{msg}</div>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {SHOP.map((item) => {
          const owned = save.items.includes(item.id);
          const worn = save.equipped.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => {
                if (owned) {
                  sfx.tap();
                  toggleEquip(item.id);
                  return;
                }
                if (buyItem(item.id)) {
                  sfx.coin();
                  setMsg(`${item.name} gekauft!`);
                } else {
                  sfx.wrong();
                  setMsg(`Dir fehlen noch ${item.price - save.coins} Münzen.`);
                }
              }}
              className={`chunky flex flex-col items-center gap-1 rounded-[22px] border-4 bg-white p-3 ${worn ? "border-leaf" : "border-transparent"}`}
              style={{ ["--shade" as string]: "#F2D58A" }}
            >
              {save.profile && <Pet species={save.profile.pet} equipped={[item.id]} size={74} />}
              <div className="font-extrabold">{item.name}</div>
              {owned ? (
                <div className={`text-sm font-extrabold ${worn ? "text-leaf-dark" : "text-ink-soft"}`}>{worn ? "Trägt es gerade" : "Anziehen"}</div>
              ) : (
                <div className="flex items-center gap-1 font-display text-lg font-semibold">
                  <CoinIcon size={18} />
                  {item.price}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
