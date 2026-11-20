'use client';
import Link from 'next/link';
import { useMemo,useState } from 'react';
import { Hero } from '@/components/ecosystem/Atlas';
import s from '@/components/ecosystem/Atlas.module.css';
import css from './ranking.module.css';
import { useTournaments } from '@/components/demo-tournaments/Store';
import {
  displayElo,disciplineOptions,eloStudents,eloTeams,eloUniversities,summary as buildSummary,
  type EloRow,
} from './model';
import { Achievements } from './Achievements';
import { Method } from './Method';
import { RankingStats } from './Stats';

type Tab='universities'|'teams'|'students'|'achievements'|'method';
const tabs:[Tab,string][]=[
  ['universities','Университеты'],['teams','Команды'],['students','Студенты'],
  ['achievements','Достижения B×K'],['method','Как считается'],
];
const fmtElo=(value:number)=>Number.isInteger(displayElo(value))?String(displayElo(value)):displayElo(value).toFixed(1);
const fmtDelta=(value:number)=>`${value>0?'+':''}${displayElo(value).toFixed(1)}`;
const record=(row:EloRow)=>`${row.wins}–${row.draws}–${row.losses}`;

function MatchList({row}:{row:EloRow}) {
  if(!row.matches.length)return <p className={css.muted}>Подтверждённых зачётных матчей пока нет.</p>;
  return <div className={css.matchList}>
    {row.matches.slice(0,8).map(match=>{
      const university=row.kind==='UNIVERSITY';
      const home=university?match.aUniversity===row.id:match.a===row.id;
      const opponent=university?(home?match.bUniversity:match.aUniversity):(home?match.bName:match.aName);
      const opponentUniversity=university?'':(home?match.bUniversity:match.aUniversity);
      const before=university?(home?match.uniEloA:match.uniEloB):(home?match.eloA:match.eloB);
      const after=university?(home?match.uniAfterA:match.uniAfterB):(home?match.afterA:match.afterB);
      const delta=university?(home?match.uniDeltaA:match.uniDeltaB):(home?match.deltaA:match.deltaB);
      if(before===null||after===null||delta===null)return null;
      return <div className={css.match} key={match.key}>
        <span><b>{match.title}</b><small>{match.date} · {match.discipline} · тур {match.round}</small></span>
        <span>vs {opponent}{opponentUniversity&&<small>{opponentUniversity}</small>}</span>
        <span className={delta>=0?css.deltaUp:css.deltaDown}><b>{fmtDelta(delta)}</b><small>{fmtElo(before)} → {fmtElo(after)}</small></span>
        <span className={css.weight}>×{university?match.uniWeight:match.weight}<small>вес пары</small></span>
      </div>;
    })}
  </div>;
}
function Row({row,discipline,note}:{row:EloRow;discipline:string;note:string}) {
  const neutral=row.byDiscipline.filter(item=>item.played===0).length;
  return <details className={css.row} data-row={row.id}>
    <summary>
      <span className={css.rank}>{row.rank??'—'}</span>
      <span className={css.who}><b>{row.name}</b>
        {row.university!==row.name&&<small>{row.university}</small>}
        {row.rank===null&&<small className={css.unranked}>без места · нет зачётных матчей</small>}
      </span>
      <span className={css.metric}><b>{fmtElo(row.elo)}</b><small>ELO</small></span>
      <span className={css.metric}><b>{row.played}</b><small>матчей</small></span>
      <span className={css.metric}><b>{row.coverage}</b><small>охват</small></span>
      <span className={css.metric}><b>{record(row)}</b><small>В–Н–П</small></span>
    </summary>
    <div className={css.breakdown}>
      <p className={css.formula}>{note}</p>
      {row.played===0
        ?<p className={css.empty}>Нет подтверждённых зачётных матчей. Elo хранится нейтральным: 1500. Место не присваивается.</p>
        :<>
          {!discipline&&<>
            <h3 className={css.detailTitle}>Elo по дисциплинам</h3>
            <div className={css.disciplineList}>
              {row.byDiscipline.filter(item=>item.played>0).map(item=>
                <div className={css.discipline} key={item.discipline}>
                  <span>{item.discipline}<small>{item.played} матчей · {item.wins}–{item.draws}–{item.losses}</small></span>
                  <b>{fmtElo(item.elo)}</b>
                </div>)}
            </div>
            {neutral>0&&<p className={css.muted}>Ещё {neutral} дисциплин без матчей: нейтральные 1500.</p>}
          </>}
          <h3 className={css.detailTitle}>Последние изменения</h3>
          <MatchList row={row}/>
          {row.matches.length>8&&<p className={css.muted}>Показаны 8 последних из {row.matches.length}. Полный журнал — в истории.</p>}
        </>}
    </div>
  </details>;
}
function Board({rows,discipline,note,scope}:{rows:EloRow[];discipline:string;note:string;scope:string}) {
  if(!rows.length)return <p className={css.empty}>Нет данных по этому фильтру.</p>;
  return <div className={css.board} data-board={scope}>
    {rows.map(row=><Row key={row.id} row={row} discipline={discipline} note={note}/>)}
  </div>;
}

export function RankingHub() {
  const {list}=useTournaments();
  const [tab,setTab]=useState<Tab>('universities'),[discipline,setDiscipline]=useState('');
  const stats=useMemo(()=>buildSummary(list),[list]);
  const disciplines=useMemo(()=>disciplineOptions(list),[list]);
  const rows=useMemo(()=>{
    if(tab==='universities')return eloUniversities(list,discipline||undefined);
    if(tab==='teams')return eloTeams(list,discipline||undefined);
    if(tab==='students')return eloStudents(list,discipline||undefined);
    return [];
  },[list,tab,discipline]);
  const title=tab==='universities'?`Университеты${discipline?` · ${discipline}`:''}`:
    tab==='teams'?`Команды${discipline?` · ${discipline}`:''}`:
    tab==='students'?`Студенты${discipline?` · ${discipline}`:''}`:
    tab==='achievements'?`Достижения B×K${discipline?` · ${discipline}`:''}`:'Как считается Elo';
  const note=tab==='universities'
    ?discipline?'Elo вуза в дисциплине. Один межвузовский матч обновляет пару вузов один раз.'
      :'Среднее Elo по фиксированному перечню из 6 дисциплин; несыгранные направления — 1500.'
    :discipline?'Elo участника в дисциплине. Повторные пары в 30 дней получают меньший вес.'
      :'Среднее Elo по фиксированному перечню из 6 дисциплин; несыгранные направления — 1500.';
  return <>
    <Hero tag="Рейтинговая лаборатория / Демо" title="Рейтинг UniX">
      Elo — сила соперников и результат каждого матча. Турнирные достижения B×K считаются отдельно и не прибавляются к Elo. Только подтверждённые итоги; BYE не участвует.
    </Hero>
    <RankingStats stats={stats}/>
    {stats.pending>0&&<p className={css.pending}>Завершено, но не подтверждено: <b>{stats.pending}</b>. Эти итоги не влияют ни на Elo, ни на достижения. <Link className={s.textLink} href="/demo/rankings/history">Открыть историю</Link>.</p>}
    <nav className={css.tabs} aria-label="Разделы рейтинга">
      {tabs.map(([key,label])=><button key={key} className={tab===key?s.primary:s.secondary} aria-pressed={tab===key}
        onClick={()=>setTab(key)}>{label}</button>)}
    </nav>
    {tab!=='method'&&<div className={css.filters}>
      <label>Дисциплина
        <select value={discipline} onChange={event=>setDiscipline(event.target.value)}>
          <option value="">Все дисциплины</option>
          {disciplines.map(item=><option key={item} value={item}>{item}</option>)}
        </select></label>
      {discipline&&<button className={s.secondary} onClick={()=>setDiscipline('')}>Показать общий рейтинг</button>}
    </div>}
    {tab==='method'
      ?<Method/>
      :tab==='achievements'
        ?<Achievements list={list} discipline={discipline}/>
        :<section className={s.section}><h2>{title}</h2>
          <Board rows={rows} discipline={discipline} note={note} scope={`${tab}-${discipline||'all'}`}/>
        </section>}
    <nav className={s.actions} aria-label="Демо-разделы">
      <Link className={s.textLink} href="/demo/rankings/history">История Elo и достижений →</Link>
      <Link className={s.textLink} href="/demo/tournaments">Демо-турниры →</Link>
    </nav>
  </>;
}
