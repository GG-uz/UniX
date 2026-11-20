import { test } from 'node:test';
import assert from 'node:assert/strict';
import { campuses,change,create,defaults,groups,isConfirmed,matches,phase,places,pool,signature } from '../src/components/demo-tournaments/model.ts';
import {
  ELO_K,ELO_WEIGHTS,REPEAT_WINDOW_DAYS,RATING_DISCIPLINES,START_ELO,
  achievementTeams,achievementUniversities,achievementStudents,allResults,baseFor,confirmedResults,
  disciplineOptions,displayElo,eloDelta,eloMatches,eloStudents,eloTeams,eloUniversities,expectedScore,
  fieldFactor,pointsFor,replayElo,resultHistory,resultsFor,summary,
} from '../src/components/demo-rankings/model.ts';
import { seedTournaments } from '../src/components/demo-tournaments/seed.ts';

let seq=0;
const close=(a,b,eps=1e-6,label='')=>assert.ok(Math.abs(a-b)<=eps,`${label} ${a} != ${b}`);
function higher(m,t) {
  const order=pool(t.format);
  return order.findIndex(p=>p.id===m.a)<order.findIndex(p=>p.id===m.b)?{a:2,b:0}:{a:0,b:2};
}
function draw() {return {a:1,b:1};}
function play(n,options={}) {
  const format=options.format??'TEAM',system=options.system??'knockout';
  const start=options.start??'2027-03-08',end=options.end??start;
  const id=options.id??`fixture-${++seq}`;
  let t=create(id,{...defaults,title:id,description:'Fixture',format,system,capacity:n,
    regEnd:'2027-03-07',start,end});
  const people=options.ids
    ? options.ids.map(person=>pool(format).find(candidate=>candidate.id===person))
    : pool(format).slice(options.offset??0,(options.offset??0)+n);
  for(const person of people) {
    t=change(t,{type:'apply',participant:person.id});
    t=change(t,{type:'approve',participant:person.id});
  }
  t=change(t,{type:'close'});
  let guard=0;
  while(phase(t)!=='Завершён'&&guard++<80) {
    const game=matches(t).find(m=>!m.bye&&m.a&&m.b&&!m.score);
    if(!game)break;
    t=change(t,{type:'score',id:game.id,score:(options.decide??higher)(game,t)});
  }
  return options.confirm===false?t:change(t,{type:'confirm'});
}
function eventFor(list,id) {
  return eloMatches(list).find(event=>event.tournamentId===id);
}
function chronological(list) {
  return [...eloMatches(list)].sort((a,b)=>a.date.localeCompare(b.date)||a.order-b.order);
}

test('Elo constants, expected score and delta follow the approved table',()=>{
  assert.equal(START_ELO,1500);assert.equal(ELO_K,32);assert.equal(REPEAT_WINDOW_DAYS,30);
  assert.deepEqual([...ELO_WEIGHTS],[1,.5,.25,0]);
  assert.equal(RATING_DISCIPLINES.length,6);assert.ok(RATING_DISCIPLINES.includes('Образование'));
  assert.ok(!RATING_DISCIPLINES.includes('Другая дисциплина'));
  close(expectedScore(1600,1400),.7597469,1e-6,'E 1600/1400');
  close(expectedScore(1600,1600),.5,1e-9,'E equal');
  close(eloDelta(1600,1400,1),7.6881,1e-3,'win vs weak');
  close(eloDelta(1600,1400,0),-24.3119,1e-3,'loss vs weak');
  close(eloDelta(1600,1800,1),24.3119,1e-3,'win vs strong');
  close(eloDelta(1600,1800,0),-7.6881,1e-3,'loss vs strong');
  assert.ok(eloDelta(1600,1800,1)>eloDelta(1600,1400,1));
  assert.ok(eloDelta(1600,1400,0)<eloDelta(1600,1800,0));
  assert.ok(eloDelta(1600,1800,1)>0);assert.ok(eloDelta(1600,1400,0)<0);
  close(eloDelta(1600,1800,.5)+eloDelta(1800,1600,.5),0,1e-9,'draw zero sum');
});

test('first match updates participants and their university exactly once',()=>{
  const cup=play(2,{id:'elo-first'}),events=eloMatches([cup]);
  assert.equal(events.length,1);
  const event=events[0];
  assert.equal(event.weight,1);assert.equal(event.uniWeight,1);
  close(event.deltaA,16,1e-9);
  assert.equal(event.afterA,1516);assert.equal(event.afterB,1484);
  assert.equal(event.uniAfterA,1516);assert.equal(event.uniAfterB,1484);
  const teams=eloTeams([cup],'Футбол'),uni=eloUniversities([cup],'Футбол');
  assert.equal(teams.find(row=>row.id==='TEAM-1')?.elo,1516);
  assert.equal(teams.find(row=>row.id==='TEAM-2')?.elo,1484);
  assert.equal(teams.find(row=>row.id==='TEAM-1')?.rank,1);
  assert.equal(teams.find(row=>row.id==='TEAM-2')?.rank,2);
  const orbit=uni.find(row=>row.id===campuses[0]),spectrum=uni.find(row=>row.id===campuses[1]);
  assert.equal(orbit?.elo,1516);assert.equal(spectrum?.elo,1484);
  assert.equal(orbit?.played,1);assert.equal(spectrum?.played,1);
  assert.equal(uni.find(row=>row.id===campuses[2])?.played,0);
  assert.equal(uni.find(row=>row.id===campuses[2])?.rank,null);
});

test('draw between equals keeps 1500 and shares first place',()=>{
  const group=play(2,{system:'groups',decide:draw}),events=eloMatches([group]);
  assert.equal(events.length,1);assert.equal(events[0].expectedA,.5);
  assert.equal(events[0].deltaA,0);assert.equal(events[0].afterA,1500);assert.equal(events[0].afterB,1500);
  const rows=eloTeams([group],'Футбол');
  const first=rows.find(row=>row.id==='TEAM-1'),second=rows.find(row=>row.id==='TEAM-2');
  assert.equal(first?.rank,1);assert.equal(second?.rank,1);
  assert.equal(first?.draws,1);assert.equal(second?.draws,1);
  assert.equal(first?.wins,0);assert.equal(first?.losses,0);
});

test('repeat meetings in 30 days use weights 1, 0.5, 0.25, 0 and then reset',()=>{
  const list=[
    play(2,{id:'repeat-1',start:'2027-03-08'}),
    play(2,{id:'repeat-2',start:'2027-03-09'}),
    play(2,{id:'repeat-3',start:'2027-03-10'}),
    play(2,{id:'repeat-4',start:'2027-03-11'}),
  ];
  const events=chronological(list);
  assert.deepEqual(events.map(event=>event.weight),[1,.5,.25,0]);
  assert.equal(events[3].deltaA,0);assert.equal(events[3].afterA,events[3].eloA);
  const far=play(2,{id:'repeat-far',start:'2027-05-01',end:'2027-05-01'});
  const farEvent=eventFor([...list,far],'repeat-far');
  assert.equal(farEvent?.weight,1);
});

test('a repeated university pair is damped even when the participant pair is new',()=>{
  const first=play(2,{id:'uni-repeat-1',start:'2027-03-08'}); // Орион vs Спектр
  const second=play(2,{id:'uni-repeat-2',start:'2027-03-09',ids:['TEAM-4','TEAM-5']}); // Орион vs Спектр
  const events=chronological([first,second]);
  assert.equal(events[1].weight,1);assert.equal(events[1].uniWeight,.5);
  close(events[1].uniDeltaA,32*.5*(1-expectedScore(1516,1484)),1e-9);
  const uni=eloUniversities([first,second],'Футбол');
  const orbit=uni.find(row=>row.id===campuses[0]);
  assert.equal(orbit?.played,2);
  close(orbit?.elo??0,1516+events[1].uniDeltaA,1e-9);
});

test('intra-campus matches change participants but never the university pool',()=>{
  const internal=play(2,{id:'intra',ids:['TEAM-1','TEAM-4']}); // both Орион
  const teams=eloTeams([internal],'Футбол'),uni=eloUniversities([internal],'Футбол');
  assert.equal(teams.find(row=>row.id==='TEAM-1')?.elo,1516);
  assert.equal(teams.find(row=>row.id==='TEAM-4')?.elo,1484);
  for(const campus of campuses) {
    const row=uni.find(item=>item.id===campus);
    assert.equal(row?.elo,1500);assert.equal(row?.played,0);assert.equal(row?.rank,null);
  }
});

test('university played counts inter-campus matches, not participants or duplicated results',()=>{
  const cup=play(4,{id:'uni-count'}); // Орион, Спектр, Вектор, Орион
  const uni=eloUniversities([cup],'Футбол');
  assert.equal(uni.find(row=>row.id===campuses[0])?.played,1); // только финал
  assert.equal(uni.find(row=>row.id===campuses[1])?.played,2); // полуфинал + финал
  assert.equal(uni.find(row=>row.id===campuses[2])?.played,1); // полуфинал
  const events=eloMatches([cup]);
  assert.equal(events.filter(event=>event.uniWeight!==null).length,2);
  const orbitEvents=events.filter(event=>event.uniWeight!==null&&
    (event.aUniversity===campuses[0]||event.bUniversity===campuses[0]));
  assert.equal(orbitEvents.length,1);
  assert.equal(orbitEvents[0].uniDeltaA!==null,true);
});

test('overall Elo averages the fixed discipline list with neutral 1500',()=>{
  const cup=play(2,{id:'overall'});
  const teams=eloTeams([cup]),uni=eloUniversities([cup]);
  const orbit=teams.find(row=>row.id==='TEAM-1');
  assert.equal(orbit?.coverage,'1/6');assert.equal(orbit?.disciplines,1);
  close(orbit?.elo??0,(1516+5*1500)/6,1e-9);
  assert.equal(teams.find(row=>row.id==='TEAM-3')?.played,0);
  assert.equal(teams.find(row=>row.id==='TEAM-3')?.rank,null);
  assert.equal(teams.find(row=>row.id==='TEAM-3')?.coverage,'0/6');
  const uniOrbit=uni.find(row=>row.id===campuses[0]);
  close(uniOrbit?.elo??0,(1516+5*1500)/6,1e-9);
  assert.equal(uniOrbit?.coverage,'1/6');
});

test('correction recomputes the whole chronology, including later matches',()=>{
  const first=play(2,{id:'chronology-1',start:'2027-03-08'}); // TEAM-1 beats TEAM-2
  const second=play(2,{id:'chronology-2',start:'2027-03-09',ids:['TEAM-1','TEAM-3']});
  const initial=chronological([first,second]);
  assert.equal(initial.length,2);
  const final=matches(first).at(-1);
  const edited=change(first,{type:'score',id:final.id,score:{a:0,b:2}});
  assert.equal(isConfirmed(edited),false);
  assert.equal(eloMatches([edited,second]).length,1);
  const onlySecond=chronological([edited,second]);
  assert.equal(onlySecond[0].tournamentId,'chronology-2');
  close(onlySecond[0].eloA,1500,1e-9);assert.equal(onlySecond[0].deltaA,16);
  const reconfirmed=change(edited,{type:'confirm'});
  const replay=chronological([reconfirmed,second]);
  assert.equal(replay.length,2);
  const later=replay.find(event=>event.tournamentId==='chronology-2');
  close(later.eloA,1484,1e-9);
  close(later.deltaA,32*(1-expectedScore(1484,1500)),1e-9);
  close(later.afterA,1484+later.deltaA,1e-9);
  assert.ok(later.afterA<1516);
});

test('BYE and unconfirmed matches never enter Elo',()=>{
  const bracket=play(3,{id:'bye'});
  assert.equal(matches(bracket).filter(match=>match.bye).length,1);
  assert.equal(eloMatches([bracket]).length,2);
  assert.ok(eloMatches([bracket]).every(event=>event.a&&event.b));
  const pending=play(2,{id:'pending',confirm:false});
  assert.equal(eloMatches([pending]).length,0);
  assert.ok(eloTeams([pending],'Футбол').every(row=>row.played===0&&row.rank===null));
  const confirmed=change(pending,{type:'confirm'});
  assert.equal(eloMatches([confirmed]).length,1);
});

test('a resolved knockout tie-break is a win, a group draw is 0.5',()=>{
  let cup=play(2,{id:'tiebreak',decide:()=>({a:1,b:1})});
  // The knockout draw cannot advance without a tie-break, so it is not confirmed.
  assert.equal(isConfirmed(cup),false);
  cup=change(cup,{type:'score',id:matches(cup).at(-1).id,score:{a:1,b:1,tie:'TEAM-2'}});
  const confirmed=change(cup,{type:'confirm'});
  const event=eloMatches([confirmed])[0];
  assert.equal(event.winner,'TEAM-2');assert.equal(event.deltaA,-16);
  const group=play(2,{id:'group-draw',system:'groups',decide:draw});
  assert.equal(eloMatches([group])[0].deltaA,0);
});

test('achievement points stay separate from Elo',()=>{
  const cup=play(2,{id:'achievements'});
  const teams=achievementTeams([cup],'Футбол'),uni=achievementUniversities([cup],'Футбол');
  const winner=teams.find(row=>row.id==='TEAM-1'),runner=teams.find(row=>row.id==='TEAM-2');
  assert.equal(winner?.points,60);assert.equal(runner?.points,42);
  assert.equal(winner?.points,pointsFor([1],2));
  const orbit=uni.find(row=>row.id===campuses[0]),spectrum=uni.find(row=>row.id===campuses[1]);
  assert.equal(orbit?.points,60);assert.equal(spectrum?.points,42);
  assert.equal(orbit?.points,60);assert.notEqual(orbit?.points,1516);
  const eloRow=eloTeams([cup],'Футбол').find(row=>row.id==='TEAM-1');
  assert.equal(eloRow?.elo,1516);
  const stats=summary([cup]);
  assert.equal(stats.eloMatches,1);assert.equal(stats.achievements,2);
});

test('achievement B x K and result limits keep their original values',()=>{
  assert.equal(fieldFactor(2),.6);assert.equal(fieldFactor(5),.8);
  assert.equal(fieldFactor(8),1);assert.equal(fieldFactor(12),1.1);assert.equal(fieldFactor(16),1.25);
  assert.equal(pointsFor([1],8),100);assert.equal(pointsFor([2],4),56);
  assert.equal(pointsFor([3,4],8),50);assert.equal(pointsFor([1,2],4),68);
  assert.equal(pointsFor([5,6,7,8],16),44);
  assert.equal(baseFor([1,2,3,4]),67.5);
  const many=[];
  for(let i=0;i<6;i++)many.push(play(2,{start:`2027-03-${String(8+i).padStart(2,'0')}`}));
  const team=achievementTeams(many,'Футбол').find(row=>row.id==='TEAM-1');
  assert.equal(team?.counted,3);assert.equal(team?.points,180);
  assert.equal(team?.excluded.length,3);
  const uni=achievementUniversities(many,'Футбол').find(row=>row.id===campuses[0]);
  assert.equal(uni?.counted,3);assert.equal(uni?.points,180);
  assert.equal(new Set(uni?.results.map(result=>result.tournamentId)).size,3);
});

test('achievement tables still cap a university at two results per tournament',()=>{
  const cup=play(8,{id:'cap'});
  const row=achievementUniversities([cup],'Футбол').find(item=>item.id===campuses[0]);
  assert.ok(row);
  assert.equal(row.results.filter(result=>result.tournamentId===cup.id).length,2);
  assert.equal(row.results.length,2);
});

test('equal achievement points share a place despite tie-break columns',()=>{
  const group=play(4,{system:'groups',decide:draw});
  const rows=achievementUniversities([group],'Футбол');
  const second=rows.find(row=>row.id===campuses[1]),third=rows.find(row=>row.id===campuses[2]);
  assert.ok(second&&third);assert.equal(second.points,third.points);
  assert.equal(second.rank,third.rank);assert.equal(second.rank,2);
});

test('knockout places cover every entrant, ignore BYE and require completion',()=>{
  for(let n=2;n<=16;n++) {
    const t=play(n),rows=places(t),results=resultsFor(t),bracket=2**Math.ceil(Math.log2(n));
    assert.equal(rows.length,n);assert.equal(results.length,n);
    assert.equal(new Set(rows.map(row=>row.id)).size,n);
    assert.equal(matches(t).filter(match=>match.bye).length,bracket-n);
    const positions=[...new Set(rows.flatMap(row=>row.positions))].sort((a,b)=>a-b);
    assert.deepEqual(positions,Array.from({length:n},(_,i)=>i+1));
  }
  let t=create('incomplete',{...defaults,title:'Incomplete',description:'Fixture',capacity:8,
    regEnd:'2027-03-07',start:'2027-03-08',end:'2027-03-10'});
  for(const person of pool('TEAM').slice(0,8)) {
    t=change(t,{type:'apply',participant:person.id});t=change(t,{type:'approve',participant:person.id});
  }
  t=change(t,{type:'close'});t=change(t,{type:'score',id:matches(t)[0].id,score:{a:1,b:0}});
  assert.deepEqual(places(t),[]);assert.deepEqual(resultsFor(t),[]);
  assert.equal(change(t,{type:'confirm'}),t);
});

test('group places recalculate from matches and ties share every occupied position',()=>{
  const drawn=play(4,{system:'groups',decide:draw}),rows=places(drawn);
  assert.deepEqual(rows.map(row=>row.rank),[1,1,1,1]);
  assert.deepEqual(rows[0].positions,[1,2,3,4]);
  assert.ok(resultsFor(drawn).every(result=>result.points===54));
  const decisive=play(4,{system:'groups'});
  assert.deepEqual(places(decisive).map(row=>row.rank).sort((a,b)=>a-b),[1,2,3,4]);
  const five=play(5,{system:'groups'});
  assert.equal(places(five).length,5);
  for(const [index,ids] of groups(five.entrants).entries()) {
    const games=matches(five).filter(match=>match.group===index);
    const pairs=new Set(games.map(match=>[match.a,match.b].sort().join('/')));
    assert.equal(games.length,ids.length*(ids.length-1)/2);assert.equal(pairs.size,games.length);
  }
});

test('confirmation remains idempotent and is revoked only when results change',()=>{
  const original=play(8,{id:'confirm'}),final=matches(original).at(-1);
  const preserved=change(original,{type:'score',id:final.id,score:{a:(final.score?.a??2)+1,b:final.score?.b??0}});
  assert.equal(isConfirmed(preserved),true);
  const semi=matches(original).find(match=>match.id==='k-2-0');
  const flipped=change(original,{type:'score',id:semi.id,score:{a:semi.score.b,b:semi.score.a}});
  assert.equal(isConfirmed(flipped),false);
  assert.equal(flipped.scores['k-3-0'],undefined);
  assert.equal(phase(flipped),'Идёт');
  assert.equal(change(flipped,{type:'confirm'}),flipped);
});

test('seeded demos include confirmed Elo, an unconfirmed result and no real universities',()=>{
  const list=seedTournaments(),finished=list.filter(t=>phase(t)==='Завершён');
  assert.equal(list.length,10);assert.equal(finished.length,8);
  assert.equal(finished.filter(isConfirmed).length,7);
  assert.equal(list.find(t=>t.id==='case-sprint')?.confirmed,undefined);
  const stats=summary(list);
  assert.equal(stats.confirmed,7);assert.equal(stats.pending,1);
  assert.equal(stats.disciplines,6);assert.ok(stats.achievements>0);
  assert.ok(stats.eloMatches>0);
  assert.ok(!eloMatches(list).some(event=>event.tournamentId==='case-sprint'));
  const universities=eloUniversities(list);
  assert.equal(universities.length,3);
  assert.ok(universities.every(row=>row.played>0));
  for(const discipline of RATING_DISCIPLINES)
    assert.ok(confirmedResults(list).some(result=>result.discipline===discipline));
  assert.ok(eloTeams(list).some(row=>row.played>0));
  assert.ok(eloStudents(list).some(row=>row.played>0));
  assert.equal(resultHistory(list).length,allResults(list).length);
  assert.ok(disciplineOptions(list).includes('Образование'));
  assert.ok(confirmedResults(list).every(result=>campuses.includes(result.university)));
  const replay=replayElo(list);
  assert.ok(replay.events.length>0);
  assert.ok(replay.events.every(event=>event.weight>=0&&event.weight<=1));
});

test('group awards use the local field, not the full entry list',()=>{
  const winners=resultsFor(play(16,{system:'groups'})).filter(r=>r.place===1);
  assert.equal(winners.length,4);
  assert.ok(winners.every(r=>r.field===4&&r.points===80));
});

test('a changed outcome invalidates confirmation even when all student places stay unchanged',()=>{
  const t=play(4,{system:'groups',format:'INDIVIDUAL'});
  const m=matches(t).find(m=>[m.a,m.b].includes('INDIVIDUAL-1')&&[m.a,m.b].includes('INDIVIDUAL-4'));
  const edited=change(t,{type:'score',id:m.id,score:{a:1,b:1}});
  assert.deepEqual(places(t),places(edited));
  assert.notEqual(signature(t),signature(edited));
  assert.equal(achievementStudents([edited]).length,0);
  assert.equal(eloMatches([edited]).length,0);
});

test('moving a scheduled match changes its position across tournaments and needs confirmation',()=>{
  const first=play(2,{id:'scheduled',start:'2027-03-08',end:'2027-03-12'});
  const second=play(2,{id:'interleaved',start:'2027-03-09'});
  const scheduled=change(first,{type:'slot',id:matches(first)[0].id,slot:{date:'2027-03-10',time:'11:00',venue:''}});
  assert.equal(isConfirmed(scheduled),false);
  const fixed=change(scheduled,{type:'confirm'});
  assert.equal(fixed.corrections.length,2);
  const events=replayElo([fixed,second]).events;
  assert.deepEqual(events.map(e=>e.tournamentId),['interleaved','scheduled']);
  assert.deepEqual(events.map(e=>e.eloA),[1500,1516]);
});

test('zero-weight matches remain in the ledger but not the counted record',()=>{
  const cups=Array.from({length:4},(_,i)=>play(2,{id:`zero-${i}`}));
  assert.equal(eloMatches(cups).length,4);
  assert.equal(summary(cups).eloMatches,3);
  assert.equal(eloTeams(cups,'Футбол')[0].played,3);
  assert.equal(eloUniversities(cups,'Футбол')[0].played,3);
  assert.ok(eloStudents(cups).every(r=>r.rank===null));
});

test('displayElo rounds to one decimal for ranking and presentation',()=>{
  assert.equal(displayElo(1502.666666),1502.7);
  assert.equal(displayElo(1516),1516);
  const cup=play(2,{id:'display'});
  const row=eloTeams([cup],'Футбол').find(item=>item.id==='TEAM-1');
  assert.equal(displayElo(row.elo),1516);
});
