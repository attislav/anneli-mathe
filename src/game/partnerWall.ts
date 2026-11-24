export const wallPositions = ["unten links", "unten in der Mitte", "unten rechts", "Mitte links", "Mitte rechts", "an der Spitze"];
export const wallRows = [[5], [3, 4], [0, 1, 2]];
export const freshWall = () => ({
  phase: "write" as "write" | "choose" | "pass" | "solve" | "done", stones: Array<string>(6).fill(""),
  hidden: null as number | null, guess: "", message: "",
});
type Wall = ReturnType<typeof freshWall>;
type Action = { type: "stone"; at: number; value: string } | { type: "hide"; at: number } | { type: "guess"; value: string }
  | { type: "check" | "edit" | "pass" | "open" | "solve" | "swap" };
export function wallProblem(stones: string[]) {
  const values = stones.map(Number);
  if (stones.length !== 6 || stones.slice(0, 3).some((s,i) => !/^\d+$/.test(s) || values[i] < 1 || values[i] > 20))
    return "Wähle unten für jeden Stein eine Zahl von 1 bis 20.";
  for (const [at, a, b] of [[3,0,1],[4,1,2],[5,3,4]]) {
    if (!/^\d+$/.test(stones[at]) || values[at] !== values[a] + values[b])
      return `Prüfe den Stein ${wallPositions[at]}. Zähle die beiden Steine direkt darunter zusammen.`;
  }
  return null;
}
export function wallMove(s: Wall, action: Action): Wall {
  switch (action.type) {
    case "stone":
      return s.phase === "write" && action.at >= 0 && action.at < 6 && /^\d{0,2}$/.test(action.value) ?
        { ...s, stones: s.stones.map((n,i) => i === action.at ? action.value : n), message: "" } : s;
    case "check": {
      if (s.phase !== "write") return s;
      const problem = wallProblem(s.stones);
      return problem ? { ...s, message: problem } : { ...s, phase: "choose", message: "", stones: s.stones.map(n => String(Number(n))) };
    }
    case "edit": return s.phase === "choose" ? { ...s, phase: "write", hidden: null, message: "" } : s;
    case "hide": return s.phase === "choose" && Number.isInteger(action.at) && action.at >= 0 && action.at < 6 ? { ...s, hidden: action.at } : s;
    case "pass": return s.phase === "choose" && s.hidden !== null ? { ...s, phase: "pass" } : s;
    case "open": return s.phase === "pass" ? { ...s, phase: "solve" } : s;
    case "guess": return s.phase === "solve" && /^\d{0,2}$/.test(action.value) ? { ...s, guess: action.value, message: "" } : s;
    case "solve":
      if (s.phase !== "solve" || s.hidden === null || !s.guess) return s;
      if (Number(s.guess) === Number(s.stones[s.hidden])) return { ...s, phase: "done", message: "" };
      return { ...s, message: s.hidden < 3 ?
        "Schau auf den Stein direkt darüber. Ziehe den bekannten Nachbarstein ab." : "Zähle die beiden Steine direkt unter der Lücke zusammen." };
    case "swap": return s.phase === "done" ? freshWall() : s;
  }
}
export type PartnerState = Wall;
export type PartnerAction = Action;
