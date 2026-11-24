import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {diagramVotes,neededVotes,pictogram,pictureHint,tieQuestion} from "../src/game/pictogram";
import type {Level,PictogramTask} from "../src/game/types";
import {Pictogram,PictureRow} from "../src/lesson/Pictogram";

for(const keyValue of [2,4]) {
  for(let first=0;first<=10;first++) for(let second=0;second<=10;second++) {
    const task:PictogramTask={...pictogram(4),id:"test",level:4,skillId:"bilddiagramme",keyValue,first,second,names:["A","B"]};
    const read=Math.floor(first/2)*keyValue+(first%2)*keyValue/2;
    assert.equal(diagramVotes(first,keyValue),read);
    assert.equal(pictureHint(task,String(read),second),null);
    assert.ok(pictureHint(task,String(read+1),second));
    assert.ok(pictureHint(task,String(read),second+1));
    const required=neededVotes(task);
    assert.equal(required.name,first<=second?"A":"B");
    assert.equal(required.votes,Math.abs(first-second)*keyValue/2);
  }
}
const accessible=renderToStaticMarkup(createElement(PictureRow,{name:"Birnen",halves:3}));
const tied = {...pictogram(1),first:2,second:2,id:"tie",level:1 as const,skillId:"bilddiagramme"};
assert.equal(neededVotes(tied).votes,0);
assert.match(tieQuestion(neededVotes(tied).name),/auch null/);
assert.doesNotMatch(pictureHint(tied,"2",0)!,/halb/i);
assert.match(pictureHint({...tied,level:2},"2",0)!,/halb/i);
assert.ok(accessible.includes("Ein ganzer Kreis und ein halber Kreis"));
assert.ok(!accessible.includes("Stimmen"));
for(const level of [1,2,3,4,5] as Level[]) {
  for(let i=0;i<80;i++) {
    const task={...pictogram(level),id:"example",level,skillId:"bilddiagramme"};
    assert.equal(task.keyValue,level>=4?4:2);
    if(level===1) assert.ok(task.first%2===0 && task.second%2===0);
    assert.ok(Number.isInteger(diagramVotes(task.first,task.keyValue)));
    assert.ok(task.first>=0 && task.second>=0 && task.second<=14);
    if(!i) {
      const render=(status:"ask"|"reveal")=>renderToStaticMarkup(createElement(Pictogram,{task,status,onAnswer(){}}));
      assert.ok(!render("ask").includes(task.solution));
      assert.ok(render("reveal").includes(task.solution));
    }
  }
}
