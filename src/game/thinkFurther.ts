import { busJourney, busTime } from "./busTable";
import { cellName, fountain, routeTurn } from "./changeRoute";
import type { LearningRound } from "./learningGoals";
import { decisionResult } from "./voteDecision";

export type FurtherQuestion = { source:string; before:string; question:string; choices:string[]; answer:string; after:string; why:string };
const digitPair=(left:number,right:number)=>`Links ${left}, rechts ${right}`;

export function thinkFurther(round:LearningRound):FurtherQuestion {
  const [first,second,last]=round.tasks;
  const ordered=(choices:string[])=>round.furtherOrder.map(i=>choices[i]);
  const sourceId=round.goal==="votes"?last.id:first.id;
  const source=round.revealed.has(sourceId)?"Aus der gezeigten Lösung":"Aus deiner gelösten Aufgabe";
  if(round.goal==="numbers" && second.format==="fact-family") {
    const [left,right]=second.parts, answer=digitPair(left+1,right-1);
    return {source,before:digitPair(left,right)+". Zusammen sind es 10 Plättchen.",
      question:"Ein Plättchen wandert von rechts nach links. Wie liegen die Plättchen jetzt?",
      choices:ordered([digitPair(left+1,right),answer,digitPair(left,right-1)]),answer,after:answer+". Zusammen sind es wieder 10.",
      why:"Links kommt genau das Plättchen hinzu, das rechts weggeht."};
  }
  if(round.goal==="times" && first.format==="bus-table") {
    const {departure,arrival,duration}=busJourney(first);
    const answer=busTime(arrival+5)+" Uhr";
    return {source,before:`Von ${first.stops[first.from]} nach ${first.stops[first.to]}: Abfahrt ${busTime(departure)} Uhr, Ankunft ${busTime(arrival)} Uhr.`,
      question:`Der Bus fährt erst um ${busTime(departure+5)} Uhr los. Die Fahrt dauert wieder ${duration} Minuten. Wann kommt er an?`,
      choices:ordered([arrival-5,arrival,arrival+5].map(t=>busTime(t)+" Uhr")),answer,
      after:`Abfahrt ${busTime(departure+5)} Uhr, Ankunft ${answer}.`,
      why:"Wenn die Fahrt gleich lang dauert, verschiebt sich mit dem Start auch die Ankunft um fünf Minuten."};
  }
  if(round.goal==="routes" && second.format==="route-turn") {
    const route=second.route, at=route.indexOf(fountain), prev=route[at-1], next=route[at+1], other=8-prev;
    const answer=routeTurn([other,fountain,next]);
    const facing:Record<number,string>={1:"unten ↓",3:"rechts →",5:"links ←",7:"oben ↑"};
    return {source,before:`Am Brunnen B2 kamst du von ${cellName(prev)} und blicktest auf dem Plan nach ${facing[prev]}. Nach ${cellName(next)} ging es ${routeTurn(route)}.`,
      question:`Jetzt kommst du von gegenüber, aus ${cellName(other)}, und blickst am Brunnen nach ${facing[other]}. Wie gehst du von B2 wieder nach ${cellName(next)}?`,
      choices:["links","geradeaus","rechts","zurück"],answer,
      after:`Von ${cellName(other)} über B2 nach ${cellName(next)} geht es ${answer}.`,
      why:"Du willst zum selben Nachbarfeld. Weil du andersherum am Brunnen stehst, ändert sich die Richtung aus deiner Sicht."};
  }
  if(round.goal==="votes" && last.format==="vote-change") {
    const {first:a,second:b}=decisionResult(last);
    const preferred=round.preferredVoteSource;
    const from=[a,b][preferred]>0?preferred:1-preferred,to=1-from, afterA=a+(to===0?1:-1), afterB=b+(to===1?1:-1);
    const choices=[...last.names,"Gleichstand"],answer=choices[afterA===afterB?2:afterA>afterB?0:1];
    const tally=(x:number,y:number)=>`${last.names[0]}: ${x}, ${last.names[1]}: ${y}.`;
    return {source,before:"Nach dem ersten Wechsel: "+tally(a,b),
      question:`Ein weiterer Stimmzettel wandert von ${last.names[from]} zu ${last.names[to]}. Wer liegt danach vorn?`,
      choices:ordered(choices),answer,after:tally(afterA,afterB)+" Ergebnis: "+answer+".",
      why:`Eine Gruppe verliert eine Stimme, die andere gewinnt dieselbe Stimme. Insgesamt bleiben es ${a+b}.`};
  }
  throw new Error("Unbekannte Lernverbindung");
}
