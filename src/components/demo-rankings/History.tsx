'use client';
import Link from 'next/link';
import { useMemo,useState } from 'react';
import { Hero } from '@/components/ecosystem/Atlas';
import s from '@/components/ecosystem/Atlas.module.css';
import css from './ranking.module.css';
import { useTournaments } from '@/components/demo-tournaments/Store';
import { campuses,formatNames } from '@/components/demo-tournaments/model';
import {
  disciplineOptions,displayElo,eloMatches,resultHistory,summary,type EloMatch,
} from './model';
import { RankingStats } from './Stats';

const num=(value:number)=>Number.isInteger(value)?String(value):value.toFixed(2).replace(/0+$/,'').replace(/\.$/,'');
const fmtElo=(value:number)=>Number.isInteger(displayElo(value))?String(displayElo(value)):displayElo(value).toFixed(1);
const fmtDelta=(value:number)=>`${value>0.0001?'+':value<-0.0001?'−':''}${Math.abs(displayElo(value)).toFixed(1)}`;
type View='elo'|'achievements';

function EloRow({match}:{match:EloMatch}) {
  return <tr>
    <td>{match.date}</td>
    <td><Link className={s.textLink} href={`/demo/tournaments/${match.tournamentId}`}>{match.title}</Link></td>
    <td>{match.discipline}</td>
    <td>{match.aName} — {match.bName}<small className={s.muted}>{match.aUniversity} / {match.bUniversity} · {formatNames[match.format]}</small></td>
    <td>{match.score}<small className={s.muted}>{match.winner?`победа: ${match.winner===match.a?match.aName:match.bName}`:'ничья'}</small></td>
    <td>
      <div className={css.eloCell}><span>{fmtElo(match.eloA)} → {fmtElo(match.afterA)}</span><b className={match.deltaA>=0?css.deltaUp:css.deltaDown}>{fmtDelta(match.deltaA)}</b></div>
      <div className={css.eloCell}><span>{fmtElo(match.eloB)} → {fmtElo(match.afterB)}</span><b className={match.deltaB>=0?css.deltaUp:css.deltaDown}>{fmtDelta(match.deltaB)}</b></div>
    </td>
    <td>
      {match.uniWeight===null
        ?<small className={s.muted}>внутривузовский · Elo вуза не меняется</small>
        :<>
          <div className={css.eloCell}><span>{match.aUniversity}: {fmtElo(match.uniEloA??0)} → {fmtElo(match.uniAfterA??0)}</span><b className={(match.uniDeltaA??0)>=0?css.deltaUp:css.deltaDown}>{fmtDelta(match.uniDeltaA??0)}</b></div>
          <div className={css.eloCell}><span>{match.bUniversity}: {fmtElo(match.uniEloB??0)} → {fmtElo(match.uniAfterB??0)}</span><b className={(match.uniDeltaB??0)>=0?css.deltaUp:css.deltaDown}>{fmtDelta(match.uniDeltaB??0)}</b></div>
        </>}
    </td>
    <td><details><summary>Вес ×{match.weight} · расчёт</summary>
      <p>S = {match.winner===null?'0.5':match.winner===match.a?'1':'0'} для первой стороны.</p>
      <p>Участник: E = {match.expectedA.toFixed(4)}; Δ = 32 × {match.weight} × (S − E) ≈ {fmtDelta(match.deltaA)}.</p>
      {match.uniExpectedA!==null&&match.uniDeltaA!==null&&<p>Вуз: E = {match.uniExpectedA.toFixed(4)}; Δ = 32 × {match.uniWeight} × (S − E) ≈ {fmtDelta(match.uniDeltaA)}.</p>}
    </details></td>
  </tr>;
}

export function History() {
  const {list}=useTournaments();
  const [view,setView]=useState<View>('elo'),[discipline,setDiscipline]=useState('');
  const [format,setFormat]=useState(''),[university,setUniversity]=useState('');
  const [query,setQuery]=useState(''),[onlyConfirmed,setOnlyConfirmed]=useState(false);
  const stats=useMemo(()=>summary(list),[list]);
  const disciplines=useMemo(()=>disciplineOptions(list),[list]);
  const search=query.trim().toLowerCase();
  const games=useMemo(()=>eloMatches(list).filter(game=>
    (!discipline||game.discipline===discipline)&&(!format||game.format===format)&&
    (!university||game.aUniversity===university||game.bUniversity===university)&&
    (!search||[game.title,game.aName,game.bName,game.aUniversity,game.bUniversity,game.discipline]
      .some(value=>value.toLowerCase().includes(search)))
  ),[list,discipline,format,university,search]);
  const results=useMemo(()=>resultHistory(list).filter(result=>
    (!discipline||result.discipline===discipline)&&(!format||result.format===format)&&
    (!university||result.university===university)&&(!onlyConfirmed||result.confirmed)&&
    (!search||[result.title,result.participantName,result.university,result.discipline]
      .some(value=>value.toLowerCase().includes(search)))
  ),[list,discipline,format,university,onlyConfirmed,search]);
  const status=(confirmed:boolean)=>confirmed
    ?<span className={`${css.badge} ${css.badgeOk}`}>подтверждён</span>
    :<span className={`${css.badge} ${css.badgePending}`}>не влияет</span>;
  return <>
    <Hero tag="Рейтинговая лаборатория / История" title="Elo, результаты и статистика">
      Журнал показывает, как каждый подтверждённый матч изменил Elo участников и вузов. Неподтверждённые турниры в Elo не входят; достижения B×K ведутся отдельно.
    </Hero>
    <RankingStats stats={stats}/>
    <div className={css.tabs} aria-label="Вид истории">
      <button className={view==='elo'?s.primary:s.secondary} aria-pressed={view==='elo'} onClick={()=>setView('elo')}>История Elo</button>
      <button className={view==='achievements'?s.primary:s.secondary} aria-pressed={view==='achievements'} onClick={()=>setView('achievements')}>Достижения B×K</button>
    </div>
    <div className={css.filters}>
      <label>Поиск<input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Турнир, участник, вуз"/></label>
      <label>Дисциплина<select value={discipline} onChange={event=>setDiscipline(event.target.value)}>
        <option value="">Все</option>{disciplines.map(item=><option key={item}>{item}</option>)}</select></label>
      <label>Формат<select value={format} onChange={event=>setFormat(event.target.value)}>
        <option value="">Все</option>{Object.entries(formatNames).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
      <label>Университет<select value={university} onChange={event=>setUniversity(event.target.value)}>
        <option value="">Все</option>{campuses.map(item=><option key={item}>{item}</option>)}</select></label>
      {view==='achievements'&&<label className={css.check}><input type="checkbox" checked={onlyConfirmed} onChange={event=>setOnlyConfirmed(event.target.checked)}/> Только подтверждённые</label>}
    </div>
    <p role="status">{view==='elo'?`Матчей Elo: ${games.length}`:`Достижений: ${results.length}`}</p>
    {view==='elo'
      ?<div className={css.tableWrap}><table className={css.table}>
        <caption>Каждый матч пересчитан от 1500 в хронологическом порядке · Elo до → после</caption>
        <thead><tr>{['Дата','Турнир','Дисциплина','Матч','Счёт','Elo участников','Elo вузов','Вес'].map(header=><th key={header} scope="col">{header}</th>)}</tr></thead>
        <tbody>{games.map(match=><EloRow key={match.key} match={match}/>)}</tbody>
      </table>{!games.length&&<p className={css.empty}>Нет матчей по выбранным фильтрам.</p>}</div>
      :<div className={css.tableWrap}><table className={css.table}>
        <caption>Достижения B×K · не входят в Elo</caption>
        <thead><tr>{['Дата','Турнир','Дисциплина','Формат','Участник','Вуз','Место','Очки','Статус'].map(header=><th key={header} scope="col">{header}</th>)}</tr></thead>
        <tbody>{results.map(result=><tr key={result.key}>
          <td>{result.start}</td>
          <td><Link className={s.textLink} href={`/demo/tournaments/${result.tournamentId}`}>{result.title}</Link></td>
          <td>{result.discipline}</td><td>{formatNames[result.format]}</td>
          <td>{result.participantName}</td><td>{result.university}</td>
          <td>{result.placeLabel}</td>
          <td>{result.confirmed?<>{result.points}<small className={s.muted}> · {num(result.base)}×{num(result.factor)}</small></>:'—'}</td>
          <td>{status(result.confirmed)}</td>
        </tr>)}</tbody>
      </table>{!results.length&&<p className={css.empty}>Нет достижений по выбранным фильтрам.</p>}</div>}
    <section className={s.section}><h2>Исправления итогов</h2>
      {list.some(t=>t.corrections?.length)?list.filter(t=>t.corrections?.length).map(t=><div key={t.id}><h3>{t.title}</h3><ol>{t.corrections?.map((entry,i)=><li key={i}>{entry}</li>)}</ol></div>):<p>В этой сессии подтверждённые итоги ещё не исправляли.</p>}
    </section>
    <nav className={s.actions} aria-label="Демо-разделы">
      <Link className={s.textLink} href="/demo/rankings">← К рейтингу</Link>
      <Link className={s.textLink} href="/demo/tournaments">Демо-турниры →</Link>
    </nav>
  </>;
}
