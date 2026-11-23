import { useEffect } from "react";
import { Delete } from "lucide-react";
import { sfx } from "@/game/sound";

export function NumPad({ value, onChange, onOk, disabled }: { value: string; onChange: (v: string) => void; onOk: () => void; disabled: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (disabled) return;
      if (/^[0-9]$/.test(e.key) && value.length < 3) onChange(value + e.key);
      else if (e.key === "Backspace") onChange(value.slice(0, -1));
      else if (e.key === "Enter" && value) onOk();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [value, onChange, onOk, disabled]);

  const key = "chunky h-[60px] rounded-[18px] bg-white font-display text-3xl font-semibold text-ink";
  const press = (d: string) => {
    if (disabled || value.length >= 3) return;
    sfx.tap();
    onChange(value + d);
  };
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
        <button key={d} className={key} style={{ ["--shade" as string]: "#DCD6F5", ["--depth" as string]: "5px" }} onClick={() => press(d)} disabled={disabled}>
          {d}
        </button>
      ))}
      <button aria-label="Löschen" className={`${key} flex items-center justify-center text-ink-soft`} style={{ ["--shade" as string]: "#DCD6F5", ["--depth" as string]: "5px" }} onClick={() => onChange(value.slice(0, -1))} disabled={disabled}>
        <Delete size={30} />
      </button>
      <button className={key} style={{ ["--shade" as string]: "#DCD6F5", ["--depth" as string]: "5px" }} onClick={() => press("0")} disabled={disabled}>
        0
      </button>
      <button className="chunky h-[60px] rounded-[18px] bg-grape font-display text-2xl font-semibold text-white disabled:opacity-60" style={{ ["--shade" as string]: "#5A2FE0", ["--depth" as string]: "5px" }} onClick={() => value && onOk()} disabled={disabled || !value}>
        OK
      </button>
    </div>
  );
}
