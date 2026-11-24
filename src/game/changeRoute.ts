import { pick, uid } from "./random";
import type { DrawRouteTask, RouteTurnTask } from "./types";

export const fountain=4;
export const cellName=(cell:number)=>String.fromCharCode(65+cell%3)+(Math.floor(cell/3)+1);
export const routeText=(route:number[])=>route.map(cellName).join(" → ");
export function routeStep(a:number,b:number,closed:readonly number[] = []) {
  if (![a,b].every(n=>Number.isInteger(n) && n>=0 && n<9)) return false;
  if (closed.length===2 && ((a===closed[0] && b===closed[1]) || (a===closed[1] && b===closed[0]))) return false;
  return Math.abs(a%3-b%3)+Math.abs(Math.floor(a/3)-Math.floor(b/3))===1;
}
function pathBetween(start:number,goal:number,closed:number[] = []) {
  const queue=[[start]], seen=new Set([start]);
  for(const path of queue) {
    const end=path.at(-1)!;
    if(end===goal) return path;
    for(let n=0;n<9;n++) if(!seen.has(n) && routeStep(end,n,closed)) {
      seen.add(n);queue.push([...path,n]);
    }
  }
  throw new Error("Kein Umweg auf dem Plan");
}
export function routeProblem(task:DrawRouteTask,route:number[]) {
  if(route[0]!==task.start || route.some((n,i)=>i>0 && !routeStep(route[i-1],n,task.closed)))
    return "Gehe immer nur auf das nächste Nachbarfeld. Die Baustelle ist in beiden Richtungen gesperrt.";
  if(task.via && !route.includes(fountain)) return "Besuche auf deinem Weg den Brunnen bei B2.";
  if(route.at(-1)!==task.goal) return `Gehe weiter bis zum Park bei ${cellName(task.goal)}.`;
  return null;
}
export function routeTurn(route:number[]) {
  const at=route.indexOf(fountain), heading=route[at]-route[at-1], next=route[at+1]-route[at];
  const compass=[-3,1,3,-1];
  return ["geradeaus","rechts","zurück","links"][(compass.indexOf(next)-compass.indexOf(heading)+4)%4];
}
export function routeFollowUps(route:number[]):[RouteTurnTask,DrawRouteTask] {
  const at=route.indexOf(fountain), goal=route.at(-1)!;
  const closed=[fountain,route[at+1]], example=pathBetween(fountain,goal,closed);
  const turn:RouteTurnTask={id:uid(),format:"route-turn",skillId:"standpunkte",level:2,route,
    question:"Wie gehst du am Brunnen weiter?",hint:"Stell dir vor, du gehst zum Brunnen. Wohin zeigt deine Nase, wenn du dort ankommst?",
    solution:`Du kommst von ${cellName(route[at-1])}. In deiner Blickrichtung geht es ${routeTurn(route)} nach ${cellName(route[at+1])}.`};
  const detour:DrawRouteTask={id:uid(),format:"draw-route",skillId:"rasterwege",level:3,start:fountain,goal,via:false,closed,example,
    question:"Baustelle! Finde vom Brunnen einen neuen Weg zum Park.",hint:"Der Weg über die rote Sperre ist zu. Probiere ein anderes Nachbarfeld.",
    solution:"Ein möglicher Umweg: "+routeText(example)+"."};
  return [turn,detour];
}
export function routeTasks(start=pick([0,2,6,8])):[DrawRouteTask,RouteTurnTask,DrawRouteTask] {
  const goal=8-start, example=[...pathBetween(start,fountain),...pathBetween(fountain,goal).slice(1)];
  return [{id:uid(),format:"draw-route",level:2,skillId:"rasterwege",start,goal,via:true,closed:[],example,
    question:"Gehe von der Schule über den Brunnen zum Park.",hint:"Wähle benachbarte Felder. Am Brunnen bei B2 gehst du weiter zum Park.",
    solution:"Ein möglicher Weg: "+routeText(example)+"."},...routeFollowUps(example)];
}
