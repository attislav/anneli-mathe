"use client";

import Link from "next/link";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { sfx } from "@/game/sound";

export type Tone = "grape" | "leaf" | "sun" | "coin" | "sky" | "rose" | "white" | "night";

const TONES: Record<Tone, { bg: string; fg: string; shade: string }> = {
  grape: { bg: "var(--color-grape)", fg: "#fff", shade: "var(--color-grape-dark)" },
  leaf: { bg: "var(--color-leaf)", fg: "#fff", shade: "var(--color-leaf-dark)" },
  sun: { bg: "var(--color-sun)", fg: "var(--color-ink)", shade: "var(--color-sun-dark)" },
  coin: { bg: "var(--color-coin)", fg: "#fff", shade: "var(--color-coin-dark)" },
  sky: { bg: "var(--color-sky)", fg: "#fff", shade: "var(--color-sky-dark)" },
  rose: { bg: "var(--color-rose)", fg: "#fff", shade: "var(--color-rose-dark)" },
  white: { bg: "#fff", fg: "var(--color-ink)", shade: "#dcd6f5" },
  night: { bg: "var(--color-night-light)", fg: "#fff", shade: "#191b45" },
};

export function toneStyle(tone: Tone, depth = 6): CSSProperties {
  const t = TONES[tone];
  return { background: t.bg, color: t.fg, ["--shade" as string]: t.shade, ["--depth" as string]: `${depth}px` };
}

type Common = { tone?: Tone; depth?: number; size?: "md" | "lg"; className?: string; children: ReactNode };

const base = "chunky inline-flex items-center justify-center gap-2 rounded-[22px] font-display font-semibold select-none disabled:opacity-50";
const sizes = { md: "h-14 px-5 text-xl", lg: "h-16 px-6 text-2xl" };

export function Button({ tone = "grape", depth = 6, size = "lg", className = "", children, onClick, ...rest }: Common & Omit<ComponentProps<"button">, "children">) {
  return (
    <button
      type="button"
      {...rest}
      onClick={(e) => {
        sfx.tap();
        onClick?.(e);
      }}
      className={`${base} ${sizes[size]} ${className}`}
      style={{ ...toneStyle(tone, depth), ...rest.style }}
    >
      {children}
    </button>
  );
}

export function LinkButton({ tone = "grape", depth = 6, size = "lg", className = "", children, href }: Common & { href: string }) {
  return (
    <Link href={href} onClick={() => sfx.tap()} className={`${base} ${sizes[size]} ${className}`} style={toneStyle(tone, depth)}>
      {children}
    </Link>
  );
}
