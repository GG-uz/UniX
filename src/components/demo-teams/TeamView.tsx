'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Hero, Mark } from '@/components/ecosystem/Atlas';
import s from '@/components/ecosystem/Atlas.module.css';
import { statuses } from './model';
import { useTeams } from './Store';
import { ProposalForm } from './ProposalForm';

export function TeamView({id,roster=false}:{id:string;roster?:boolean}) {
  const {teams,dispatch}=useTeams(),team=teams.find(t=>t.id===id);
  const [reason,setReason]=useState('');
  if(!team)return <section className={s.section}><h1>Демо-команда не найдена</h1>
    <p>После обновления страницы созданные заявки сбрасываются.</p><Link className={s.textLink} href="/demo/teams">В каталог демокоманд</Link></section>;
  const base=`/demo/teams/${team.id}`,approved=team.status==='verified';
  if(roster)return <>
    <Hero tag="Ведомость / Демо-состав" title={`Состав: ${team.name}`}>{team.university} · {team.discipline}</Hero>
    {approved?<section className={s.section}><h2>Участники · {team.members.length}</h2>{team.members.map(m=><div className={s.row} key={m}>
      <b>{m}</b><span>{m===team.captain?'Капитан в демо':'Участник в демо'}</span></div>)}</section>
      :<p role="status">Состав не опубликован. Он станет виден после одобрения команды в демо.</p>}
    <Link className={s.textLink} href={base}>← Карточка команды</Link>
  </>;
  return <>
    <div className={s.cover}><Mark name={team.name}/><span role="status" className={s.chip}>{statuses[team.status]}</span></div>
    <Hero tag={`Демо-команда / ${team.discipline}`} title={team.name}>{team.university} · {approved?'Может представлять вымышленный вуз в демо.':'Права представлять вуз в демо ещё нет.'}</Hero>
    {team.status==='draft'&&<><h2>Подготовка заявки</h2><ProposalForm team={team}/></>}
    {team.status==='pending'&&<section className={s.section}><p className={s.eyebrow}>Шаг 02 / Решение демо-администрации</p>
      <h2>Рассмотреть предложение</h2><p>Кандидат в капитаны: {team.captain}. Проект состава: {team.members.join(', ')}.</p>
      <p className={s.muted}>Одобрение откроет учебный состав. При отказе студент сможет исправить заявку.</p>
      <label>Причина отказа<select value={reason} onChange={e=>setReason(e.target.value)}>
        <option value="">Выберите, если отклоняете</option>
        <option>Уточните название команды.</option><option>Пересмотрите состав и кандидата в капитаны.</option></select></label>
      <div className={s.actions}><button className={s.primary} onClick={()=>dispatch({type:'approve',id})}>Одобрить в демо</button>
        <button className={s.secondary} disabled={!reason} onClick={()=>dispatch({type:'reject',id,reason})}>Отклонить заявку</button></div>
    </section>}
    {team.status==='rejected'&&<section className={s.section}><h2>Заявка возвращена</h2><p>{team.reason}</p>
      <button className={s.secondary} onClick={()=>{dispatch({type:'revise',id});setReason('');}}>Исправить заявку</button></section>}
    <section className={s.section}><h2>Состав команды</h2>{approved?<><p>Капитан в демо: {team.captain} · Участников: {team.members.length}</p>
      <Link className={s.primary} href={`${base}/roster`}>Открыть состав →</Link></>:<p>Учебный состав не опубликован.</p>}</section>
    <section className={s.section}><h2>Выступления · демо</h2>{team.history.length?<>
      <p>Событий: {team.history.length} · Побед: {team.history.filter(h=>h.outcome==='Победа').length}</p>
      {team.history.map(h=><div key={h.event} className={s.row}><b>{h.event}</b><span>{h.outcome}</span></div>)}</>:<p>Учебных результатов пока нет.</p>}</section>
    <Link className={s.textLink} href="/demo/teams">← Все демо-команды</Link>
  </>;
}
