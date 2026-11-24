import { pick } from "./random";
import type { Level, OpenVoteTask } from "./types";

export type VoteClaim = "possible"|"certain"|"tie";
export type VoteSituation = { claim:VoteClaim; first:number; second:number; open:number };
export type VoteProof = "example"|"best"|"worst"|"odd"|"gap"|"counted";
export const voteKey=(vote:VoteSituation)=>[vote.claim,vote.first,vote.second,vote.open].join("/");
export function voteTruth(vote:VoteSituation) {
  if(vote.claim==="possible") return vote.first+vote.open>vote.second;
  if(vote.claim==="certain") return vote.first>vote.second+vote.open;
  return Math.abs(vote.first-vote.second)<=vote.open && (vote.first+vote.second+vote.open)%2===0;
}
export function provesVote(vote:VoteSituation,yes:boolean,toFirst:number,proof:VoteProof) {
  if(yes!==voteTruth(vote)||!Number.isInteger(toFirst)||toFirst<0||toFirst>vote.open) return false;
  const left=vote.first+toFirst,right=vote.second+vote.open-toFirst;
  if(proof==="counted") return vote.open===0;
  if(proof==="example") return vote.claim==="possible"&&yes&&left>right ||
    vote.claim==="certain"&&!yes&&left<=right || vote.claim==="tie"&&yes&&left===right;
  if(proof==="best") return vote.claim==="possible"&&!yes&&toFirst===vote.open&&left<=right;
  if(proof==="worst") return vote.claim==="certain"&&yes&&toFirst===0&&left>right;
  if(proof==="odd") return vote.claim==="tie"&&!yes&&(left+right)%2===1;
  return vote.claim==="tie"&&!yes&&Math.abs(vote.first-vote.second)>vote.open &&
    (vote.first>vote.second?toFirst===0:toFirst===vote.open);
}
export function voteEvidence(vote:VoteSituation) {
  for(const proof of ["counted","example","best","worst","gap","odd"] as const){
    for(let toFirst=0;toFirst<=vote.open;toFirst++) if(provesVote(vote,voteTruth(vote),toFirst,proof)) return {proof,toFirst};
  }
  throw new Error("Kein Beleg für diese Stimmenfrage.");
}
export function voteReasons(vote:VoteSituation,names:readonly string[]):Partial<Record<VoteProof,string>> {
  const example=vote.claim==="tie"?"In meiner Verteilung haben beide gleich viele Stimmen.":
    vote.claim==="certain"?names[0]+" liegt in meinem Beispiel gleichauf oder hinten.":names[0]+" liegt in meinem Beispiel vorn.";
  const reasons:Partial<Record<VoteProof,string>>={example};
  if(vote.claim==="possible") reasons.best="Selbst mit allen offenen Stimmen gewinnt "+names[0]+" nicht.";
  if(vote.claim==="certain") reasons.worst="Sogar mit allen offenen Stimmen für "+names[1]+" bleibt "+names[0]+" vorn.";
  if(vote.claim==="tie"){
    reasons.odd="Die ganze Klasse hat eine ungerade Anzahl Stimmen. Zwei gleich große Gruppen gehen nicht auf.";
    reasons.gap="Alle offenen Stimmen gehen an die Gruppe mit weniger Stimmen. Sie holt den Vorsprung trotzdem nicht auf.";
  }
  if(vote.open===0) reasons.counted="Alle Stimmen sind ausgezählt. Die beiden Zahlen zeigen das Endergebnis.";
  return reasons;
}
export function openVotes(level:Level,previous:VoteSituation[]=[]):Omit<OpenVoteTask,"id"|"skillId"|"level"> {
  const leastUsed=Math.min(...(["possible","certain","tie"] as const).map(claim=>previous.filter(v=>v.claim===claim).length));
  const claim=pick((["possible","certain","tie"] as const).filter(claim=>claim!==previous.at(-1)?.claim && previous.filter(v=>v.claim===claim).length===leastUsed));
  const options:VoteSituation[]=[];
  for(let total=12;total<=(level<=2?15:20);total++) for(let open=0;open<=(level<=2?3:6);open++){
    for(let first=1;first<total-open;first++){
      const vote={claim,open,first,second:total-open-first};
      if(Math.abs(first-vote.second)<=open+3&&!previous.some(old=>voteKey(old)===voteKey(vote))) options.push(vote);
    }
  }
  const yes=pick([true,false]);
  const vote=pick(options.filter(v=>voteTruth(v)===yes));
  const names=pick([["Malen","Basteln"],["Vorlesen","Singen"],["Turnen","Tanzen"]]);
  const question=claim==="tie"?"Ist ein Gleichstand noch möglich?":claim==="certain"?"Gewinnt "+names[0]+" sicher?":"Kann "+names[0]+" gewinnen?";
  return {format:"open-votes",...vote,names,question,
    hint:"Probiere zuerst alle offenen Stimmen auf einer Seite und dann auf der anderen. Ein Gleichstand ist kein Sieg.",
    solution:"Vergleiche die möglichen Endstände der ganzen Klasse."};
}
