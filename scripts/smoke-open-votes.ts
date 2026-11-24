import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import { openVotes, provesVote, voteEvidence, voteKey, voteTruth, type VoteSituation } from "../src/game/openVotes";
import { OpenVotes } from "../src/lesson/OpenVotes";

for(let total=12;total<=20;total++) for(let open=0;open<=6;open++) for(let first=1;first<total-open;first++){
  const second=total-open-first;
  const outcomes=Array.from({length:open+1},(_,added)=>first+added-(second+open-added));
  for(const claim of ["possible","certain","tie"] as const){
    const vote={first,second,open,claim};
    const yes=claim==="possible"?outcomes.some(diff=>diff>0):claim==="certain"?outcomes.every(diff=>diff>0):outcomes.includes(0);
    assert.equal(voteTruth(vote),yes);
    const model=voteEvidence(vote);
    assert.ok(provesVote(vote,yes,model.toFirst,model.proof));
    for(const [added,diff] of outcomes.entries()){
      assert.equal(provesVote(vote,yes,added,"example"),claim==="possible"&&yes&&diff>0||claim==="certain"&&!yes&&diff<=0||claim==="tie"&&yes&&diff===0);
      for(const proof of ["example","best","worst","odd","gap","counted"] as const)assert.ok(!provesVote(vote,!yes,added,proof));
    }
  }
}
const tie:VoteSituation={claim:"tie",first:8,second:3,open:2};
assert.ok(provesVote(tie,false,1,"odd")&&provesVote(tie,false,0,"gap"));
assert.ok(!provesVote(tie,false,1,"gap"));
const possible:VoteSituation={claim:"possible",first:6,second:6,open:4};
assert.ok(provesVote(possible,true,3,"example")&&provesVote(possible,true,4,"example"));
assert.ok(!provesVote(possible,true,2,"example"));
for(const level of [1,2,3,4,5] as const) for(const seed of [0,.23,.5,.76,.99]){
  const previous:VoteSituation[]=[];
  const random=Math.random;
  try{
    Math.random=()=>seed;
    for(let i=0;i<5;i++){
      const vote=openVotes(level,previous);
      assert.notEqual(vote.claim,previous.at(-1)?.claim);
      assert.ok(!previous.some(old=>voteKey(old)===voteKey(vote)));
      assert.ok(vote.first+vote.second+vote.open>=12&&vote.first+vote.second+vote.open<=20);
      previous.push(vote);
    }
  }finally{Math.random=random;}
  assert.equal(new Set(previous.map(v=>v.claim)).size,3);
}
const task={...openVotes(3),...possible,names:["Malen","Singen"],level:3 as const,skillId:"offeneStimmen",id:"test"};
const start=renderToStaticMarkup(createElement(OpenVotes,{task,status:"ask",onAnswer(){}}));
const end=renderToStaticMarkup(createElement(OpenVotes,{task,status:"reveal",onAnswer(){}}));
assert.ok(start.includes("Malen eine offene Stimme geben")&&start.includes("Antwort und Beleg prüfen"));
assert.ok(end.includes("Eine mögliche Verteilung")&&end.includes("liegt in meinem Beispiel vorn."));

