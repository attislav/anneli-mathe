import { useSave } from "@/game/state";
import { strategyKey, type StrategyCard } from "@/game/strategyCards";
import { rememberStrategy } from "@/game/strategyPractice";

export function RememberStrategy({ owner, card }: { owner: string; card: StrategyCard }) {
  const save = useSave();
  const saved = save?.strategies.some(c => strategyKey(c) === strategyKey(card));
  return <button type="button" className="min-h-11 rounded-xl bg-sky-light px-4" disabled={saved}
    onClick={() => rememberStrategy(owner, card)}>{saved ? "Weg gemerkt" : "Diesen Weg merken"}</button>;
}
