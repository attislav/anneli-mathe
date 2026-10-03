// Zeigt, was in einer Truhe war: Sticker, Ausmalbild, Münzen.

import { STICKERS } from "@/game/collection";
import { getPage } from "@/game/coloring";
import type { Reward } from "@/game/state";
import { ChestArt, CoinIcon } from "./art";
import { StickerArt } from "./Creatures";
import { ColoringSvg } from "./ColoringSvg";
import { BadgeMedal } from "./Badges";
import { getBadge } from "@/game/badges";

export function RewardCards({ rewards }: { rewards: Reward[] }) {
  const coins = rewards.reduce((a, r) => a + (r.kind === "coins" ? r.amount : r.kind === "sticker" && r.duplicate ? 15 : 0), 0);
  // Viele Abzeichen auf einmal (z. B. nach einem Update): nur zwei zeigen, Rest zusammenfassen.
  const badgeIds = rewards.filter((r) => r.kind === "badge").map((r) => r.id);
  const hiddenBadges = Math.max(0, badgeIds.length - 2);
  const shown = rewards.filter((r) => r.kind !== "badge" || badgeIds.indexOf(r.id) < 2);
  return (
    <div className="flex w-full flex-col gap-3">
      {shown.map((r, i) => {
        if (r.kind === "page") {
          const page = getPage(r.id);
          if (!page) return null;
          return (
            <Card key={i} delay={i}>
              <div className="shrink-0 overflow-hidden rounded-2xl bg-mist">
                <ColoringSvg page={page} fills={{}} size={68} />
              </div>
              <div>
                <div className="text-xs font-extrabold tracking-wider text-grape">NEUES AUSMALBILD</div>
                <div className="font-display text-xl font-semibold">{page.title}</div>
              </div>
            </Card>
          );
        }
        if (r.kind === "daily") {
          return (
            <Card key={i} delay={i}>
              <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl bg-sun-light">
                <ChestArt size={58} open />
              </div>
              <div>
                <div className="text-xs font-extrabold tracking-wider text-coin-dark">TAGESSCHATZ</div>
                <div className="font-display text-xl font-semibold">Erste Lektion heute!</div>
              </div>
            </Card>
          );
        }
        if (r.kind === "badge") {
          const b = getBadge(r.id);
          if (!b) return null;
          return (
            <Card key={i} delay={i}>
              <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl bg-grape-light">
                <BadgeMedal badge={b} earned size={50} />
              </div>
              <div>
                <div className="text-xs font-extrabold tracking-wider text-grape">NEUES ABZEICHEN</div>
                <div className="font-display text-xl font-semibold">{b.title}</div>
              </div>
            </Card>
          );
        }
        if (r.kind === "sticker") {
          const st = STICKERS.find((s) => s.id === r.id);
          if (!st) return null;
          return (
            <Card key={i} delay={i}>
              <div className={`flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl ${st.rare ? "bg-sun-light" : "bg-mist"}`}>
                <StickerArt sticker={st} size={60} />
              </div>
              <div>
                <div className={`text-xs font-extrabold tracking-wider ${st.rare ? "text-coin-dark" : "text-leaf-dark"}`}>
                  {r.duplicate ? "STICKER (HAST DU SCHON)" : st.rare ? "SELTENER STICKER" : "NEUER STICKER"}
                </div>
                <div className="font-display text-xl font-semibold">{st.name}</div>
                {r.duplicate && <div className="text-sm text-ink-soft">wird zu 15 Münzen</div>}
              </div>
            </Card>
          );
        }
        return null;
      })}
      {hiddenBadges > 0 && (
        <Card delay={shown.length}>
          <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl bg-grape-light font-display text-2xl font-semibold text-grape">+{hiddenBadges}</div>
          <div>
            <div className="text-xs font-extrabold tracking-wider text-grape">WEITERE ABZEICHEN</div>
            <div className="font-display text-xl font-semibold">Schau unter „Ich“ nach!</div>
          </div>
        </Card>
      )}
      {coins > 0 && (
        <Card delay={rewards.length}>
          <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl bg-coin-light">
            <CoinIcon size={44} />
          </div>
          <div className="font-display text-2xl font-semibold">+{coins} Münzen</div>
        </Card>
      )}
    </div>
  );
}

function Card({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <div className="anim-pop flex items-center gap-4 rounded-[22px] bg-white p-3 text-ink" style={{ animationDelay: `${delay * 0.15}s` }}>
      {children}
    </div>
  );
}
