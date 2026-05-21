"use client";

import { forwardRef } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export const MathInput = forwardRef<HTMLInputElement, Props>(function MathInput(
  { className = "", ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      type="number"
      inputMode="numeric"
      autoComplete="off"
      className={
        "w-24 rounded-2xl bg-[var(--color-paper)] px-4 py-3 text-center text-3xl font-semibold tabular-nums text-[var(--color-ink)] shadow-[var(--shadow-soft)] outline-none ring-2 ring-transparent focus:ring-[var(--color-lavender-deep)] " +
        className
      }
      {...rest}
    />
  );
});
