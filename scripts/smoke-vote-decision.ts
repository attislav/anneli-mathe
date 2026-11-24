import assert from "node:assert/strict";
import { mock } from "node:test";
import { LearningRound } from "../src/game/learningGoals";
import { readSave } from "../src/game/state";
import { checkSurvey } from "../src/game/survey";
import { chartHint, decisionHint, decisionResult, voteTasks } from "../src/game/voteDecision";

export function testVoteDecision(owner:string) {
  const outcomes=new Set<string>();
  for(const counts of [[4,2],[3,3],[3,2],[1,4],[2,4],[5,2]] as const) {
    const [survey,chart,transfer]=voteTasks(counts);
    const [a,b]=counts;
    assert.deepEqual(survey.categories.map(c=>c.label),chart.names);
    assert.deepEqual(chart.names,transfer.names);
    assert.deepEqual(survey.votes,transfer.votes);
    assert.deepEqual(chart.amounts,counts);
    assert.equal(checkSurvey(survey,survey.votes,String(a)).correct,true);
    assert.equal(checkSurvey(survey,survey.votes.map(v=>1-v),String(a)).correct,false);
    assert.ok(chartHint(chart,[a+1,b]));
    assert.ok(chartHint(chart,[a,b-1]));
    assert.equal(chartHint(chart,[a,b]),null);
    assert.equal(transfer.votes[transfer.ticket],0);
    const result=decisionResult(transfer);
    assert.deepEqual(result.changed.map((v,i)=>v!==transfer.votes[i]?i:-1).filter(i=>i>=0),[transfer.ticket]);
    assert.equal(result.first+result.second,a+b);
    assert.deepEqual([result.first,result.second],[a-1,b+1]);
    const winner=a-1===b+1?2:a-1>b+1?0:1;
    assert.equal(result.winner,winner);
    outcomes.add(Math.sign(a-b)+"/"+Math.sign(result.first-result.second));
    const entries=[String(a-1),String(b+1)];
    assert.equal(decisionHint(transfer,1,entries,winner),null);
    assert.ok(decisionHint(transfer,0,entries,winner));
    assert.ok(decisionHint(transfer,1,[String(a),String(b)],winner));
    assert.ok(decisionHint(transfer,1,entries,(winner+1)%3));
  }
  for(const outcome of ["1/0","0/-1","1/-1","1/1"]) assert.ok(outcomes.has(outcome));
  const generatedAnswers=new Set<string>();
  for(let index=0; index<7; index++) {
    const rng=mock.method(Math,"random",()=> (index+0.5)/7);
    try {
      const [,chart,transfer]=voteTasks();
      const [a,b]=chart.amounts;
      const expected=a-1>b+1?"Quelle":a-1<b+1?"Ziel":"Gleichstand";
      assert.equal(["Quelle","Ziel","Gleichstand"][decisionResult(transfer).winner],expected);
      generatedAnswers.add(expected);
    } finally { rng.mock.restore(); }
  }
  assert.deepEqual(generatedAnswers,new Set(["Quelle","Ziel","Gleichstand"]));
  const before=structuredClone(readSave());
  const tasks=voteTasks([1,4]), round=new LearningRound(owner,"votes",tasks);
  for (const [i,task] of tasks.entries()) {
    assert.deepEqual(round.state.task,task);
    round.answer(task.id,i===2);
    round.answer(task.id,true);
    if (i<2) {
      round.advance(task.id);
      round.answer(task.id,false);
      assert.equal(round.state.status,"reveal");
    }
    round.advance(task.id);
  }
  assert.equal(round.state.status,"done");
  const after=readSave();
  assert.deepEqual(after.log.slice(before.log.length).map(e=>[e.s,e.ok]),[["strichliste",0],["bilddiagramme",0],["diagramm",1]]);
  assert.deepEqual({...after,mastery:before.mastery,log:before.log},before);
}
