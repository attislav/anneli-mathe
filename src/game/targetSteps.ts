import { pick, shuffle } from "./random";
import type { Level, TargetStepsTask } from "./types";

export type Sign = "+" | "−";
export type FirstStep = { first:number; second:number; sign:Sign };
export type Route = FirstStep & { lastSign:Sign };
type Board = Pick<TargetStepsTask,"cards"|"limit"|"target">;
export const operate = (a:number, sign:Sign, b:number) => sign==="+" ? a+b : a-b;
const valid = (n:number, limit:number) => Number.isInteger(n) && n>=0 && n<=limit;
export function intermediate(board:Board, step:FirstStep) {
  const {first,second,sign}=step;
  if(first===second || !valid(first,2) || !valid(second,2))return null;
  const mid=operate(board.cards[first],sign,board.cards[second]);
  return valid(mid,board.limit)?mid:null;
}
export function remaining(board:Board,step:FirstStep) {
  return board.cards[3-step.first-step.second];
}
export function solves(board:Board,route:Route) {
  const mid=intermediate(board,route);
  return mid!==null && operate(mid,route.lastSign,remaining(board,route))===board.target;
}
export function possibleRoutes(board:Board) {
  const routes:Route[]=[];
  const signs:Sign[]=["+","−"];
  for (const first of [0,1,2]) for(const second of [0,1,2])
    for (const sign of signs) for (const lastSign of signs) {
      const route={first,second,sign,lastSign};
      if(solves(board,route))routes.push(route);
    }
  return routes;
}
export function equations(board:Board,route:Route) {
  const mid=intermediate(board,route);
  return [board.cards[route.first]+" "+route.sign+" "+board.cards[route.second]+" = "+mid,
    mid+" "+route.lastSign+" "+remaining(board,route)+" = "+board.target];
}

// In each triple the first two cards can be added, or one can be used after
// subtracting the third. The zero-target examples allow two subtraction orders.
const materials = [
  [[3,4,2],[2,3,2],[3,4,7],[5,3,1]],
  [[8,7,3],[6,9,6],[8,5,13],[9,6,4]],
  [[14,11,6],[16,12,7],[13,17,13],[11,15,26]],
  [[27,23,8],[32,17,12],[22,26,22],[21,27,48]],
  [[45,36,18],[38,46,25],[32,47,32],[38,44,82]],
];
export function targetSteps(level:Level):Omit<TargetStepsTask,"id"|"level"|"skillId"> {
  const [a,b,c]=pick(materials[level-1]);
  const target=a+b-c, limit=[10,20,40,70,100][level-1], cards=shuffle([a,b,c]);
  const board={cards,target,limit};
  return {format:"target-steps",...board,question:"Erreiche die "+target+" mit allen drei Karten.",
    hint:"Überlege rückwärts: Welche Zahl brauchst du vor der letzten Karte?",
    solution:"Ein möglicher Weg: "+equations(board,possibleRoutes(board)[0]).join(". ")+"."};
}
