import { pick } from "./random";
import type { GeoBoardTask, Level } from "./types";

const x=(p:number)=>p%4, y=(p:number)=>Math.floor(p/4);
export const pegName=(p:number)=>String.fromCharCode(65+x(p))+(y(p)+1);
const turn=(a:number,b:number,c:number)=>(x(b)-x(a))*(y(c)-y(a))-(y(b)-y(a))*(x(c)-x(a));
const cross=(a:number,b:number,c:number,d:number)=>turn(a,b,c)*turn(a,b,d)<0 && turn(c,d,a)*turn(c,d,b)<0;
export function pegSides(points:number[]) {
  return points.map((p,i)=>{const next=points[(i+1)%points.length];return Math.abs(x(next)-x(p))+Math.abs(y(next)-y(p));});
}
export function pegHint(points:number[],width:number,height:number) {
  if(points.length!==4 || points.some(n=>!Number.isInteger(n)||n<0||n>=16))return "Wähle vier Eckpunkte auf dem Brett.";
  if(new Set(points).size!==4)return "Jede Ecke braucht einen eigenen Punkt. Das Band schließt sich von selbst.";
  const [a,b,c,d]=points;
  if(cross(a,b,c,d)||cross(b,c,d,a))return "Dein Band kreuzt sich. Gehe an den Seiten außen herum von Ecke zu Ecke.";
  if(points.some((p,i)=>turn(p,points[(i+1)%4],points[(i+2)%4])===0))return "Drei Punkte liegen auf einer Linie. An jeder Ecke soll das Band abbiegen.";
  if(points.some((p,i)=>x(p)!==x(points[(i+1)%4]) && y(p)!==y(points[(i+1)%4])))return "Eine Seite liegt schräg. Lege alle Seiten entlang der Rasterlinien.";
  const [first,second]=pegSides(points);
  if(!(first===width && second===height || first===height && second===width))
    return `Deine ersten beiden Seiten sind ${first} und ${second} Punktabstände lang. Gesucht sind ${width} und ${height}.`;
  return null;
}
export const exampleBand=(width:number,height:number)=>[0,width,4*height+width,4*height];
export function geoBoard(level:Level):Omit<GeoBoardTask,"id"|"level"|"skillId"> {
  const [width,height]=level===1?[1,2]:pick(level===2?[[1,2],[1,3]]:[[1,2],[2,3],[1,3]]);
  const side=level===1?1:pick([1,2]);
  return {format:"geo-board",width,height,side,question:"Spanne auf dem Geobrett zuerst ein Rechteck und dann ein Quadrat.",
    hint:"Von einem Punkt zum nächsten ist es ein Abstand. An jeder Ecke biegst du im rechten Winkel ab.",
    solution:`Das Rechteck braucht zweimal die Seitenlänge ${width} und zweimal ${height}. Beim Quadrat sind alle vier Seiten ${side} ${side===1?"Punktabstand":"Punktabstände"} lang.`};
}
