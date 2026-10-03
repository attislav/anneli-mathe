// Eine Figur aus dem Sprite-Atlas als quadratisches Bild.

import type { CSSProperties } from "react";
import { ATLAS1, SPRITES, type SpriteKey } from "@/game/art";

export function Sprite({ name, size, className, style }: { name: SpriteKey; size: number; className?: string; style?: CSSProperties }) {
  const { i } = SPRITES[name];
  const col = i % ATLAS1.cols;
  const row = Math.floor(i / ATLAS1.cols);
  return (
    <div
      role="presentation"
      className={className}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${ATLAS1.url})`,
        backgroundSize: `${ATLAS1.cols * size}px ${ATLAS1.rows * size}px`,
        backgroundPosition: `${-col * size}px ${-row * size}px`,
        backgroundRepeat: "no-repeat",
        ...style,
      }}
    />
  );
}
