// Eine Figur aus einem Sprite-Atlas als quadratisches Bild.

import type { CSSProperties } from "react";
import { ATLAS1, artSrc, SPRITES, type Atlas, type SpriteKey } from "@/game/art";

type Props = { size: number; className?: string; style?: CSSProperties } & ({ name: SpriteKey } | { atlas: Atlas; index: number });

export function Sprite(props: Props) {
  const { size, className, style } = props;
  const atlas = "atlas" in props ? props.atlas : ATLAS1;
  const i = "atlas" in props ? props.index : SPRITES[props.name].i;
  const col = i % atlas.cols;
  const row = Math.floor(i / atlas.cols);
  return (
    <div
      role="presentation"
      className={className}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${artSrc(atlas) ?? atlas.url})`,
        backgroundSize: `${atlas.cols * size}px ${atlas.rows * size}px`,
        backgroundPosition: `${-col * size}px ${-row * size}px`,
        backgroundRepeat: "no-repeat",
        ...style,
      }}
    />
  );
}
