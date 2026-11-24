import { pick } from "./random";
import type { FenceTask, Level } from "./types";

export const gardenSides = ["oben","rechts","unten","links"] as const;
export type GardenSide = typeof gardenSides[number];
export function gardenEdge(y: number, x: number, side: GardenSide) {
  if (side === "oben" || side === "unten") return `h:${y + Number(side === "unten")}:${x}`;
  return `v:${y}:${x + Number(side === "rechts")}`;
}
export function fenceEdges(shape: string[]) {
  const counts = new Map<string, number>();
  shape.forEach((row,y)=>[...row].forEach((cell,x)=>{
    if (cell !== "#") return;
    for (const side of gardenSides) {
      const edge = gardenEdge(y,x,side);
      counts.set(edge,(counts.get(edge) ?? 0)+1);
    }
  }));
  return [...counts].filter(([,count])=>count===1).map(([edge])=>edge);
}
export function fenceHint(shape: string[], selected: string[]) {
  const border = fenceEdges(shape);
  if (selected.some(edge=>!border.includes(edge))) return "Zwischen zwei Beetfeldern steht kein Zaun. Nimm die Kante dort wieder weg.";
  if (border.some(edge=>!selected.includes(edge))) return "Gehe am Rand entlang. Auch an einer Ecke nach innen braucht das Beet einen Zaun.";
  return null;
}
export function compareFences(a: number,b: number) {
  return b>a ? "länger" : b<a ? "kürzer" : "gleich lang";
}
export function fenceAnswer(task: FenceTask, first:string, second:string, comparison:string) {
  const a=fenceEdges(task.first).length, b=fenceEdges(task.second).length;
  if (!/^\d+$/.test(first) || Number(first)!==a) return "Zähle die Zaunstücke um das erste Beet. Jedes Stück ist einen Meter lang.";
  if (!/^\d+$/.test(second) || Number(second)!==b) return "Gehe einmal ganz um das zweite Beet und zähle jede Außenkante.";
  return comparison===compareFences(a,b) ? null : "Vergleiche die Meterzahlen. Welcher Zaun braucht mehr Stücke?";
}
const beds = [
  [["##","##"],["####"]],
  [["##","#."],["##",".#"]],
  [["###","..#"],["##","##"]],
  [["###","##."],["###","#.#"]],
  [["###","###"],["####",".##."]],
] as const;
export function gardenFence(level: Level): Omit<FenceTask,"skillId"|"level"|"id"> {
  const pair = pick(level<=2 ? beds.slice(0,3) : beds);
  const [first,second] = pick([pair,[pair[1],pair[0]]]).map(rows=>[...rows]);
  const a=fenceEdges(first).length, b=fenceEdges(second).length;
  return {format:"garden-fence",first,second,question:"Wo braucht das Beet einen Zaun?",
    hint:"Wähle ein Beetfeld und dann eine seiner Seiten. Ein Zaunstück gehört dorthin, wo das Beet aufhört.",
    solution:`Der erste Zaun misst ${a} m, der zweite ${b} m. Der zweite Zaun ist ${compareFences(a,b)}. Jedes Zaunstück ist 1 m lang.`};
}
