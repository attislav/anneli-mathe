"use client";

import type { InputMode } from "@/data/bridges";
import type { InputProps } from "./types";
import { TapCountInput } from "./TapCountInput";
import { NumberKeypadInput } from "./NumberKeypadInput";
import { CompareSymbolInput } from "./CompareSymbolInput";
import { NumberLineInput } from "./NumberLineInput";
import { MirrorInput } from "./MirrorInput";

export type { InputProps, InputStatus } from "./types";

/**
 * Dispatcher: rendert die passende Input-Komponente für den Brücken-Modus.
 *
 * Speech-Mode (Brücke 2, addition20) ist Static-Export-blockiert — siehe
 * `InputMode`-JSDoc in `src/data/bridges.ts`. Wir fallen darum auf das
 * Keypad zurück, falls eine Brücke `speech` vorgibt.
 */
export function BridgeInput({ mode, ...props }: InputProps & { mode: InputMode }) {
  switch (mode) {
    case "tap-count":
      return <TapCountInput {...props} />;
    case "keypad":
    case "speech":
      // TODO speech (Brücke 2): braucht SSR (Whisper-Route),
      // aktuell deaktiviert → Keypad-Fallback.
      return <NumberKeypadInput {...props} />;
    case "compare-symbol":
      return <CompareSymbolInput {...props} />;
    case "number-line":
      return <NumberLineInput {...props} />;
    case "mirror":
      return <MirrorInput {...props} />;
    default: {
      const _exhaustive: never = mode;
      throw new Error(`BridgeInput: unbekannter Modus ${String(_exhaustive)}`);
    }
  }
}
