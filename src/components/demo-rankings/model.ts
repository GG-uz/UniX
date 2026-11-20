import { campuses,disciplines,groups,isConfirmed,matchMoment,matches,phase,places,pool,type Format,type Match,type Tournament } from '../demo-tournaments/model.ts';

// ---------------------------------------------------------------------------
// Elo: primary strength rating. Every value is rebuilt from confirmed matches,
// so corrections and repeated confirmations never stack.
// ---------------------------------------------------------------------------
export const START_ELO = 1500;
export const ELO_K = 32;
export const REPEAT_WINDOW_DAYS = 30;
export const ELO_WEIGHTS = [1, 0.5, 0.25, 0] as const;
// Fixed season list: an unplayed discipline keeps the neutral value 1500.
export const RATING_DISCIPLINES = disciplines.filter(d => d !== 'Другая дисциплина');

const DAY = 86_400_000;
const dayNumber = (date:string) => Date.parse(`${date}T00:00:00Z`) / DAY;
function withinWindow(a:string, b:string) {
  return Math.abs(dayNumber(a) - dayNumber(b)) <= REPEAT_WINDOW_DAYS;
}
function repeatWeight(count:number) {
  return ELO_WEIGHTS[Math.min(count, ELO_WEIGHTS.length - 1)];
}
export function expectedScore(ratingA:number, ratingB:number) {
  return 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
}
export function eloDelta(ratingA:number, ratingB:number, scoreA:number, weight=1) {
  return ELO_K * weight * (scoreA - expectedScore(ratingA, ratingB));
}
export const displayElo = (value:number) => Math.round(value * 10) / 10;

export type EloPoint = {discipline:string;elo:number;played:number;wins:number;draws:number;losses:number};
export type EloMatch = {
  key:string;order:number;tournamentId:string;title:string;date:string;discipline:string;
  format:Format;round:number;group:number;a:string;b:string;aName:string;bName:string;
  aUniversity:string;bUniversity:string;score:string;winner:string|null;
  eloA:number;eloB:number;expectedA:number;weight:number;deltaA:number;deltaB:number;
  afterA:number;afterB:number;
  uniWeight:number|null;uniEloA:number|null;uniEloB:number|null;uniExpectedA:number|null;
  uniDeltaA:number|null;uniDeltaB:number|null;uniAfterA:number|null;uniAfterB:number|null;
  confirmed:true;
};
type Replay = {
  events:EloMatch[];
  participants:Record<Format,Map<string,EloPoint>>;
  universities:Map<string,EloPoint>;
};
type RawEvent = {t:Tournament;m:Match;people:Map<string,{id:string;name:string;university:string}>;scoreA:number;score:{a:number;b:number;tie?:string}};

function emptyState() {return new Map<string,EloPoint>();}
const uniKey = (discipline:string, campus:string) => `${discipline}\u0000${campus}`;
function readPoint(state:Map<string,EloPoint>, discipline:string, id:string):EloPoint {
  return state.get(uniKey(discipline, id)) ?? {discipline, elo:START_ELO, played:0, wins:0, draws:0, losses:0};
}
function writePoint(state:Map<string,EloPoint>, discipline:string, id:string, point:EloPoint) {
  state.set(uniKey(discipline, id), point);
}
function playPoint(current:EloPoint, result:number, delta:number):EloPoint {
  return {
    discipline:current.discipline,
    elo:current.elo + delta,
    played:current.played + 1,
    wins:current.wins + (result === 1 ? 1 : 0),
    draws:current.draws + (result === 0.5 ? 1 : 0),
    losses:current.losses + (result === 0 ? 1 : 0),
  };
}

function rawEvents(list:Tournament[]):RawEvent[] {
  const rows:RawEvent[]=[];
  for(const t of list) {
    if(!isConfirmed(t)||phase(t)!=='Завершён')continue;
    const people=new Map(pool(t.format).map(p=>[p.id,p]));
    for(const m of matches(t)) {
      const score=m.score;
      if(m.bye||!m.a||!m.b||!score)continue;
      const winner=m.winner;
      // A resolved knockout tie-break is a win/loss; an ordinary group draw is 0.5.
      const scoreA = winner ? (winner === m.a ? 1 : 0) :
        score.a === score.b ? 0.5 : score.a > score.b ? 1 : 0;
      rows.push({t,m,people,scoreA,score});
    }
  }
  return rows.sort((a,b)=>matchMoment(a.t,a.m).localeCompare(matchMoment(b.t,b.m))||
    a.t.id.localeCompare(b.t.id)||a.m.round-b.m.round||a.m.group-b.m.group||a.m.id.localeCompare(b.m.id));
}

export function replayElo(list:Tournament[]):Replay {
  const participants={TEAM:emptyState(),INDIVIDUAL:emptyState()};
  const universities=emptyState(),events:EloMatch[]=[];
  const pairLog=new Map<string,string[]>(),uniPairLog=new Map<string,string[]>();
  const countWithin=(log:Map<string,string[]>,key:string,date:string)=>
    (log.get(key)??[]).filter(previous=>withinWindow(previous,date)).length;
  const remember=(log:Map<string,string[]>,key:string,date:string)=>{
    log.set(key,[...(log.get(key)??[]),date]);
  };

  rawEvents(list).forEach(({t,m,people,scoreA,score},order)=>{
    const discipline=t.discipline, format=t.format, date=matchMoment(t,m).slice(0,10);
    const state=participants[format];
    const a=m.a!, b=m.b!;
    const beforeA=readPoint(state,discipline,a), beforeB=readPoint(state,discipline,b);
    const pairKey=`${discipline}\u0000${format}\u0000${[a,b].sort().join('\u0000')}`;
    const weight=repeatWeight(countWithin(pairLog,pairKey,date));
    const expectedA=expectedScore(beforeA.elo,beforeB.elo);
    const deltaA=ELO_K*weight*(scoreA-expectedA), deltaB=-deltaA;
    if(weight>0){
      writePoint(state,discipline,a,playPoint(beforeA,scoreA,deltaA));
      writePoint(state,discipline,b,playPoint(beforeB,1-scoreA,deltaB));
    }
    remember(pairLog,pairKey,date);

    const personA=people.get(a),personB=people.get(b);
    const aUniversity=personA?.university??'—',bUniversity=personB?.university??'—';
    let uniWeight:number|null=null,uniEloA:number|null=null,uniEloB:number|null=null;
    let uniExpectedA:number|null=null,uniDeltaA:number|null=null,uniDeltaB:number|null=null;
    let uniAfterA:number|null=null,uniAfterB:number|null=null;
    // One inter-campus match updates the university pair once; intra-campus play is excluded.
    if(aUniversity!==bUniversity&&aUniversity!=='—'&&bUniversity!=='—') {
      const uKey=`${discipline}\u0000${[aUniversity,bUniversity].sort().join('\u0000')}`;
      uniWeight=Math.min(weight,repeatWeight(countWithin(uniPairLog,uKey,date)));
      const uniBeforeA=readPoint(universities,discipline,aUniversity);
      const uniBeforeB=readPoint(universities,discipline,bUniversity);
      uniEloA=uniBeforeA.elo;uniEloB=uniBeforeB.elo;
      uniExpectedA=expectedScore(uniBeforeA.elo,uniBeforeB.elo);
      uniDeltaA=ELO_K*uniWeight*(scoreA-uniExpectedA);uniDeltaB=-uniDeltaA;
      uniAfterA=uniBeforeA.elo+uniDeltaA;uniAfterB=uniBeforeB.elo+uniDeltaB;
      if(uniWeight>0){
        writePoint(universities,discipline,aUniversity,playPoint(uniBeforeA,scoreA,uniDeltaA));
        writePoint(universities,discipline,bUniversity,playPoint(uniBeforeB,1-scoreA,uniDeltaB));
      }
      remember(uniPairLog,uKey,date);
    }

    events.push({
      key:`${t.id}:${m.id}`,order,tournamentId:t.id,title:t.title,date,discipline,format,
      round:m.round,group:m.group,a,b,aName:personA?.name??a,bName:personB?.name??b,
      aUniversity,bUniversity,score:`${score.a}:${score.b}`,winner:m.winner,
      eloA:beforeA.elo,eloB:beforeB.elo,expectedA,weight,deltaA,deltaB,
      afterA:beforeA.elo+deltaA,afterB:beforeB.elo+deltaB,
      uniWeight,uniEloA,uniEloB,uniExpectedA,uniDeltaA,uniDeltaB,uniAfterA,uniAfterB,
      confirmed:true,
    });
  });
  return {events,participants,universities};
}

export function eloMatches(list:Tournament[]) {
  return [...replayElo(list).events].sort((a,b)=>b.date.localeCompare(a.date)||b.order-a.order);
}

export type EloBreakdown = {discipline:string;elo:number;played:number;wins:number;draws:number;losses:number};
export type EloRow = {
  id:string;name:string;university:string;kind:'TEAM'|'INDIVIDUAL'|'UNIVERSITY';
  elo:number;rank:number|null;played:number;wins:number;draws:number;losses:number;
  disciplines:number;coverage:string;byDiscipline:EloBreakdown[];matches:EloMatch[];
};

function occupation(rows:EloRow[]) {
  const ranked=rows.filter(row=>row.played>0).sort((a,b)=>
    displayElo(b.elo)-displayElo(a.elo)||b.wins-a.wins||b.played-a.played||a.name.localeCompare(b.name,'ru'));
  let rank=0;
  ranked.forEach((row,index)=>{
    if(index===0||displayElo(row.elo)!==displayElo(ranked[index-1].elo))rank=index+1;
    row.rank=rank;
  });
  const unranked=rows.filter(row=>row.played===0).sort((a,b)=>a.name.localeCompare(b.name,'ru'));
  for(const row of unranked)row.rank=null;
  return [...ranked,...unranked];
}
function breakdown(state:Map<string,EloPoint>,discipline:string[],id:string):EloBreakdown[] {
  return discipline.map(name=>{
    const point=readPoint(state,name,id);
    return {discipline:name,elo:point.elo,played:point.played,wins:point.wins,draws:point.draws,losses:point.losses};
  });
}
function total(row:EloBreakdown[]) {
  return row.reduce((sum,item)=>({
    elo:sum.elo+item.elo,played:sum.played+item.played,wins:sum.wins+item.wins,
    draws:sum.draws+item.draws,losses:sum.losses+item.losses,
  }),{elo:0,played:0,wins:0,draws:0,losses:0});
}
function participantRows(list:Tournament[],format:Format,discipline?:string):EloRow[] {
  const replay=replayElo(list),state=replay.participants[format];
  const scope=discipline?[discipline]:RATING_DISCIPLINES;
  return occupation(pool(format).map(person=>{
    const parts=breakdown(state,scope,person.id),sum=total(parts);
    const elo=sum.elo/parts.length;
    return {
      id:person.id,name:person.name,university:person.university,kind:format,elo,
      rank:null,played:sum.played,wins:sum.wins,draws:sum.draws,losses:sum.losses,
      disciplines:parts.filter(item=>item.played>0).length,
      coverage:`${parts.filter(item=>item.played>0).length}/${parts.length}`,
      byDiscipline:parts,
      matches:replay.events.filter(event=>event.format===format&&(!discipline||event.discipline===discipline)&&
        (event.a===person.id||event.b===person.id)).reverse(),
    };
  }));
}
function universityRows(list:Tournament[],discipline?:string):EloRow[] {
  const replay=replayElo(list),state=replay.universities;
  const scope=discipline?[discipline]:RATING_DISCIPLINES;
  return occupation(campuses.map(campus=>{
    const parts=breakdown(state,scope,campus),sum=total(parts);
    const elo=sum.elo/parts.length;
    return {
      id:campus,name:campus,university:campus,kind:'UNIVERSITY' as const,elo,
      rank:null,played:sum.played,wins:sum.wins,draws:sum.draws,losses:sum.losses,
      disciplines:parts.filter(item=>item.played>0).length,
      coverage:`${parts.filter(item=>item.played>0).length}/${parts.length}`,
      byDiscipline:parts,
      matches:replay.events.filter(event=>(!discipline||event.discipline===discipline)&&event.uniWeight!==null&&
        (event.aUniversity===campus||event.bUniversity===campus)).reverse(),
    };
  }));
}
export function eloTeams(list:Tournament[],discipline?:string) {return participantRows(list,'TEAM',discipline);}
export function eloStudents(list:Tournament[],discipline?:string) {return participantRows(list,'INDIVIDUAL',discipline);}
export function eloUniversities(list:Tournament[],discipline?:string) {return universityRows(list,discipline);}

export function summary(list:Tournament[]) {
  const finished=list.filter(t=>phase(t)==='Завершён');
  const confirmed=finished.filter(isConfirmed);
  const official=confirmedResults(list);
  const events=replayElo(list).events;
  return {
    tournaments:list.length,finished:finished.length,confirmed:confirmed.length,
    pending:finished.length-confirmed.length,results:official.length,
    unconfirmed:allResults(list).length-official.length,
    eloMatches:events.filter(event=>event.weight>0).length,
    achievements:official.length,
    universities:new Set(official.map(r=>r.university)).size,
    disciplines:new Set(official.map(r=>r.discipline)).size,
    teams:new Set(official.filter(r=>r.format==='TEAM').map(r=>r.participantId)).size,
    students:new Set(official.filter(r=>r.format==='INDIVIDUAL').map(r=>r.participantId)).size,
  };
}

// ---------------------------------------------------------------------------
// Achievements: separate B(place) x K(field) points. Never added to Elo.
// ---------------------------------------------------------------------------
export const RESULT_LIMIT = 3, TOURNAMENT_LIMIT = 2, DISCIPLINE_LIMIT = 3;

function baseAt(place:number) {
  if(place === 1)return 100;
  if(place === 2)return 70;
  if(place <= 4)return 50;
  if(place <= 8)return 35;
  return 20;
}
export function baseFor(positions:number[]) {
  return positions.reduce((sum,position)=>sum + baseAt(position), 0) / positions.length;
}
export function fieldFactor(entrants:number) {
  if(entrants <= 3)return .6;
  if(entrants <= 5)return .8;
  if(entrants <= 8)return 1;
  if(entrants <= 12)return 1.1;
  return 1.25;
}
export function pointsFor(positions:number[], entrants:number) {
  return Math.round(baseFor(positions) * fieldFactor(entrants));
}
function placeLabel(positions:number[]) {
  const first=positions[0],last=positions[positions.length-1];
  return first === last ? String(first) : `${first}–${last}`;
}
export type Result = {
  key:string;tournamentId:string;title:string;start:string;end:string;discipline:string;
  format:Format;system:Tournament['system'];participantId:string;participantName:string;
  university:string;place:number;positions:number[];placeLabel:string;field:number;
  base:number;factor:number;points:number;confirmed:boolean;
};
export function resultsFor(t:Tournament):Result[] {
  if(phase(t) !== 'Завершён' || !t.entrants.length)return [];
  const people=new Map(pool(t.format).map(person=>[person.id,person])),confirmed=isConfirmed(t);
  return places(t).map(place=>{
    const field=t.system==='groups'?groups(t.entrants).find(ids=>ids.includes(place.id))!.length:t.entrants.length;
    const person=people.get(place.id),base=baseFor(place.positions),factor=fieldFactor(field);
    return {
      key:`${t.id}:${place.id}`,tournamentId:t.id,title:t.title,start:t.start,end:t.end,
      discipline:t.discipline,format:t.format,system:t.system,participantId:place.id,
      participantName:person?.name??place.id,university:person?.university??'—',place:place.rank,
      positions:place.positions,placeLabel:placeLabel(place.positions),field,
      base,factor,points:pointsFor(place.positions,field),confirmed,
    };
  });
}
export function allResults(list:Tournament[]) {return list.flatMap(resultsFor);}
export function confirmedResults(list:Tournament[]) {return allResults(list).filter(result=>result.confirmed);}
export type Excluded = {result:Result;reason:string};
export type AchievementRow = {
  id:string;name:string;university:string;points:number;rank:number;counted:number;
  firsts:number;best:number;disciplines:number;results:Result[];excluded:Excluded[];
};
function pick(results:Result[], limit:number, perTournament:number) {
  const sorted=[...results].sort((a,b)=>b.points-a.points||a.start.localeCompare(b.start)||a.key.localeCompare(b.key));
  const picked:Result[]=[],counts=new Map<string,number>(),reasons=new Map<string,string>();
  for(const result of sorted) {
    if(picked.length >= limit) {reasons.set(result.key,`лимит ${limit} результатов`);continue;}
    const used=counts.get(result.tournamentId) ?? 0;
    if(used >= perTournament) {reasons.set(result.key,`не более ${perTournament} из одного турнира`);continue;}
    picked.push(result);counts.set(result.tournamentId,used + 1);
  }
  const excluded=sorted.filter(result=>!picked.includes(result))
    .map(result=>({result,reason:reasons.get(result.key) ?? `лимит ${limit} результатов`}));
  return {picked,excluded,sorted};
}
function achievementRow(id:string,name:string,university:string,picked:Result[],excluded:Excluded[],disciplines:number):AchievementRow {
  return {
    id,name,university,points:picked.reduce((sum,result)=>sum + result.points,0),rank:0,
    counted:picked.length,firsts:picked.filter(result=>result.place === 1).length,
    best:picked.reduce((best,result)=>Math.max(best,result.points),0),disciplines,results:picked,excluded,
  };
}
function finishAchievements(rows:AchievementRow[]) {
  rows.sort((a,b)=>b.points-a.points||b.firsts-a.firsts||b.best-a.best||b.counted-a.counted||
    a.name.localeCompare(b.name,'ru'));
  let rank=0;
  rows.forEach((row,index)=>{
    if(index === 0 || row.points !== rows[index-1].points)rank=index + 1;
    row.rank=rank;
  });
  return rows;
}
function achievementParticipants(list:Tournament[], format:Format, discipline?:string) {
  const results=confirmedResults(list).filter(result=>result.format === format && (!discipline || result.discipline === discipline));
  const grouped=new Map<string,Result[]>(),people=new Map(pool(format).map(person=>[person.id,person]));
  for(const result of results)grouped.set(result.participantId,[...(grouped.get(result.participantId) ?? []),result]);
  return finishAchievements([...grouped].map(([id,own])=>{
    const {picked,excluded}=pick(own,RESULT_LIMIT,1),person=people.get(id);
    return achievementRow(id,person?.name??id,person?.university??'—',picked,excluded,
      new Set(picked.map(result=>result.discipline)).size);
  }));
}
export function achievementTeams(list:Tournament[], discipline?:string) {return achievementParticipants(list,'TEAM',discipline);}
export function achievementStudents(list:Tournament[], discipline?:string) {return achievementParticipants(list,'INDIVIDUAL',discipline);}
export function achievementUniversities(list:Tournament[], discipline?:string):AchievementRow[] {
  const results=confirmedResults(list).filter(result=>!discipline || result.discipline === discipline);
  return finishAchievements(campuses.map(campus=>{
    const own=results.filter(result=>result.university === campus);
    if(discipline) {
      const {picked,excluded}=pick(own,RESULT_LIMIT,TOURNAMENT_LIMIT);
      return achievementRow(campus,campus,campus,picked,excluded,picked.length ? 1 : 0);
    }
    const grouped=new Map<string,Result[]>();
    for(const result of own)grouped.set(result.discipline,[...(grouped.get(result.discipline) ?? []),result]);
    const byDiscipline=[...grouped].map(([name,rows])=>{
      const selected=pick(rows,RESULT_LIMIT,TOURNAMENT_LIMIT);
      return {name,...selected,score:selected.picked.reduce((sum,result)=>sum + result.points,0)};
    }).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,'ru'));
    const selected=byDiscipline.slice(0,DISCIPLINE_LIMIT),rest=byDiscipline.slice(DISCIPLINE_LIMIT);
    const picked=selected.flatMap(item=>item.picked);
    const excluded=[
      ...selected.flatMap(item=>item.excluded),
      ...rest.flatMap(item=>item.sorted.map(result=>({result,reason:'дисциплина вне топ-3'}))),
    ];
    return achievementRow(campus,campus,campus,picked,excluded,selected.length);
  }).filter(row=>row.counted > 0));
}

export function disciplineOptions(list:Tournament[]) {
  const found=new Set([...RATING_DISCIPLINES,...allResults(list).map(result=>result.discipline)]);
  return [...found].sort((a,b)=>a.localeCompare(b,'ru'));
}
export function resultHistory(list:Tournament[]) {
  return allResults(list).sort((a,b)=>b.start.localeCompare(a.start)||a.title.localeCompare(b.title,'ru')||
    a.placeLabel.localeCompare(b.placeLabel,'ru')||a.participantName.localeCompare(b.participantName,'ru'));
}
