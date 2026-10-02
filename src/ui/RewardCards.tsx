// Zeigt, was in einer Truhe war: Sticker, Ausmalbild, Münzen.

import { STICKERS } from "@/game/collection";
import { getPage } from "@/game/coloring";
import type { Reward } from "@/game/state";
import { CoinIcon } from "./art";
import { StickerArt } from "./Creatures";
import { ColoringSvg } from "./ColoringSvg";

export function RewardCards({ rewards }: { rewards: Reward[] }) {
  const coins = rewards.reduce((a, r) => a + (r.kind === "coins" ? r.amount : r.kind === "sticker" && r.duplicate ? 15 : 0), 0);
  return (
    <div className="flex w-full flex-col gap-3">
      {rewards.map((r, i) => {
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
