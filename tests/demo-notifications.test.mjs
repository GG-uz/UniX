import {test} from 'node:test';
import assert from 'node:assert/strict';
import {eventPath,examples,filtered,types,update} from '../src/components/demo-notifications/model.ts';
import {seeds} from '../src/components/demo-teams/model.ts';
import {seedTournaments} from '../src/components/demo-tournaments/seed.ts';
import {eloMatches} from '../src/components/demo-rankings/model.ts';

const at='2027-03-01T12:00:00Z';
const received=(list,type,id=type)=>update(list,{kind:'receive',at,id,type});
test('every scenario is fictional, in-app only and points to a supported demo fixture',()=>{
  const tournaments=seedTournaments();
  assert.equal(types.length,9);
  for(const type of types){
    const [n]=received([],type);
    assert.equal(n.recipientId,'demo:visitor');assert.equal(n.deliveryChannel,'in-app');
    assert.equal(n.readAt,null);assert.equal(n.title,examples[type].title);
    const e=n.relatedEntity;
    assert.ok(eventPath(type).startsWith('/demo/'));
    if(e.kind==='team')assert.ok(seeds.some(t=>t.id===e.id));
    else if(e.kind==='tournament')assert.ok(tournaments.some(t=>t.id===e.id));
    else if(e.kind==='match')assert.ok(eloMatches(tournaments).some(m=>m.key===`${e.tournament}:${e.id}`));
    else assert.equal(eventPath(type),`/demo/university-challenges?example=${type}`);
  }
});
test('newest first, repeat delivery is idempotent, filters combine type and read status',()=>{
  let list=received(received([],'elo'),'confirmed');
  list=received(list,'elo');
  assert.deepEqual(list.map(n=>n.id),['confirmed','elo']);
  list=update(list,{kind:'read',id:'elo',at});
  assert.deepEqual(filtered(list,'elo','unread'),[]);
  assert.deepEqual(filtered(list,'all','read').map(n=>n.id),['elo']);
  assert.deepEqual(filtered(list,'all','unread').map(n=>n.id),['confirmed']);
});
test('read-all preserves original read time and clear empties only the local inbox',()=>{
  let list=received(received([],'teamApproved'),'teamRejected');
  list=update(list,{kind:'read',id:'teamRejected',at});
  const later='2027-03-02T12:00:00Z';
  list=update(list,{kind:'readAll',at:later});
  assert.deepEqual(list.map(n=>n.readAt),[at,later]);
  assert.deepEqual(update(list,{kind:'clear'}),[]);
  assert.equal(list.length,2);
});
