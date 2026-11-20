import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaults,create,change,matches,phase,pool,standings,groups,validate } from '../src/components/demo-tournaments/model.ts';
const config={...defaults,title:'Fixture',description:'Test'};
const start=(n,format='TEAM',system='knockout')=>{
  let t=create('fixture',{...config,capacity:n,format,system});
  for(const {id} of pool(format).slice(0,n)){
    t=change(t,{type:'apply',participant:id});t=change(t,{type:'approve',participant:id});
  }
  return change(t,{type:'close'});
};
test('windows, correct format, uniqueness, pending does not reserve, capacity and freeze',()=>{
  let t=create('id',{...config,regStart:'2027-03-02',capacity:2});
  const act=(type,id)=>change(t,{type,participant:id});
  assert.equal(act('apply','TEAM-1'),t);t=change(t,{type:'open'});
  assert.equal(act('apply','INDIVIDUAL-1'),t);assert.equal(change(t,{type:'close'}),t);
  t=act('apply','TEAM-1');assert.equal(act('apply','TEAM-1'),t);
  for(const id of ['TEAM-2','TEAM-3','TEAM-4'])t=act('apply',id);
  t=act('reject','TEAM-4');assert.equal(act('apply','TEAM-4'),t);
  t=act('approve','TEAM-1');t=act('approve','TEAM-2');assert.equal(act('approve','TEAM-3'),t);
  t=change(t,{type:'close'});assert.deepEqual(t.entrants,['TEAM-1','TEAM-2']);assert.equal(t.apps[2].status,'rejected');
  assert.equal(act('apply','TEAM-5'),t);assert.equal(change(t,{type:'close'}),t);
  assert.ok(validate({...config,start:'2027-02-30'}));
});
test('2–16 entrants, balanced byes, each playable knockout has two entrants',()=>{
  for(let n=2;n<=16;n++){
    let t=start(n),played=0;const size=2**Math.ceil(Math.log2(n));
    assert.equal(matches(t).filter(m=>m.bye).length,size-n);
    for(const {id} of matches(t)){const m=matches(t).find(x=>x.id===id);if(m.bye){assert.equal(m.score,undefined);continue}
      assert.ok(m.a&&m.b);t=change(t,{type:'score',id,score:{a:1,b:0}});played++;}
    assert.equal(played,n-1);assert.equal(phase(t),'Завершён');
  }
});
test('editing a winner invalidates only its dependent path; unresolved draw cannot advance',()=>{
  let t=start(8);const put=(id,a,b,tie)=>change(t,{type:'score',id,score:{a,b,tie}});
  for(const {id} of matches(t))t=put(id,1,0);
  t=put('k-1-0',3,0);assert.equal(phase(t),'Завершён');
  t=put('k-1-0',1,1);assert.equal(t.scores['k-2-0'],undefined);assert.equal(t.scores['k-3-0'],undefined);
  assert.ok(t.scores['k-2-1']);assert.equal(put('k-3-0',1,0),t);assert.equal(put('k-1-0',1,1,'outsider'),t);
  const first=matches(t)[0];t=put(first.id,1,1,first.b);assert.equal(matches(t).find(m=>m.id==='k-2-0').a,first.b);
});
test('round robin: no repeated pairs or simultaneous participants; draws and edits recalculate table',()=>{
  for(let n=2;n<=16;n++){
    const t=start(n,'INDIVIDUAL','groups');const ms=matches(t);
    for(const [i,g] of groups(t.entrants).entries()){
      const games=ms.filter(m=>m.group===i);const pairs=new Set(games.map(m=>[m.a,m.b].sort().join('/')));
      assert.equal(games.length,g.length*(g.length-1)/2);assert.equal(pairs.size,games.length);
      for(const r of new Set(games.map(m=>m.round))){const players=games.filter(m=>m.round===r).flatMap(m=>[m.a,m.b]);assert.equal(new Set(players).size,players.length);}
    }
  }
  let t=start(2,'INDIVIDUAL','groups');const {id}=matches(t)[0];
  t=change(t,{type:'score',id,score:{a:2,b:2}});
  assert.deepEqual(standings(t.entrants,matches(t)).map(r=>[r.points,r.rank]),[[1,1],[1,1]]);
  t=change(t,{type:'score',id,score:{a:0,b:1}});
  assert.deepEqual(standings(t.entrants,matches(t)).map(r=>[r.points,r.played]),[[3,1],[0,1]]);
  assert.equal(change(t,{type:'slot',id,slot:{date:'2028-01-01',time:'12:00',venue:''}}),t);
});
