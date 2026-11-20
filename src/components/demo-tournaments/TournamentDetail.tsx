'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Hero } from '@/components/ecosystem/Atlas';
import s from '@/components/ecosystem/Atlas.module.css';
import { useTournaments } from './Store';
import { approved,formatNames,isConfirmed,matches,phase,pool,registrationOpen,systemNames,type Action,type Tournament } from './model';
import { Arena,Schedule } from './competition';
import { EventContext } from '../demo-notifications/EventContext';

export type Controls={t:Tournament;send:(a:Action)=>void};
const applicationNames={pending:'На рассмотрении',approved:'Одобрена',rejected:'Отклонена'};

function Applications({t,send}:Controls){
  const options=pool(t.format),[id,setId]=useState(options[0].id);
  const existing=t.apps.find(a=>a.id===id),open=registrationOpen(t),free=t.capacity-approved(t);
  return <section className={`${s.section} ${s.stack}`}><h2>Регистрация участников</h2>
    <p>Приём: {t.regStart} — {t.regEnd}. Одобрено: {approved(t)} / {t.capacity}. {t.entrants.length?'Регистрация закрыта.':`Свободных мест: ${free}.`}</p>
    {t.today<t.regStart&&<button className={s.secondary} onClick={()=>send({type:'open'})}>Перейти к открытию регистрации · {t.regStart}</button>}
    {open&&<div className={s.fields}><label>{t.format==='TEAM'?'Демо-команда':'Демо-студент'}
      <select value={id} onChange={e=>setId(e.target.value)}>{options.map(p=><option key={p.id} value={p.id}>{p.name} · {p.university}</option>)}</select></label>
      <button className={s.primary} disabled={!!existing||free===0} onClick={()=>send({type:'apply',participant:id})}>
        {existing?'Заявка уже подана':free===0?'Мест нет':'Подать заявку'}</button></div>}
    <h3>Заявки · {t.apps.length}</h3>
    {!t.apps.length&&<p className={s.muted}>Пока нет заявок. Отправьте первую от участника, затем рассмотрите её как демо-организатор.</p>}
    {t.apps.map(app=><div key={app.id} data-app={app.id} className={s.row}>
      <b>{options.find(p=>p.id===app.id)?.name}</b><span>{applicationNames[app.status]}</span>
      {open&&app.status==='pending'&&<div className={s.actions}>
        <button className={s.secondary} disabled={free<=0} onClick={()=>send({type:'approve',participant:app.id})}>Одобрить</button>
        <button className={s.secondary} onClick={()=>send({type:'reject',participant:app.id})}>Отклонить</button></div>}
    </div>)}
    {open&&<><p className={s.muted}>Для старта нужны минимум два одобренных участника. Закрытие фиксирует состав, отклоняет оставшиеся заявки и переводит учебную дату на начало турнира.</p>
      <button className={s.primary} disabled={approved(t)<2} onClick={()=>send({type:'close'})}>Закрыть регистрацию и сформировать {t.system==='knockout'?'сетку':'группы'}</button></>}
  </section>;
}
function ResultsStatus({t,send}:Controls){
  if(!matches(t).length)return null;
  const complete=phase(t)==='Завершён',confirmed=isConfirmed(t),stale=!!t.confirmed&&!confirmed;
  return <section className={`${s.section} ${s.stack}`} data-results-status>
    <p className={s.eyebrow}>Демо-рейтинг</p><h2>Итоги и подтверждение</h2>
    {confirmed?<p role="status">Итоги подтверждены. Турнир участвует в демо-рейтинге.</p>:
      complete?<>
        <p>{stale?'Результаты изменились: турнир исключён из рейтинга до повторного подтверждения.':'Итоги не подтверждены и не влияют на рейтинг.'}</p>
        <button className={s.primary} onClick={()=>send({type:'confirm'})}>{stale?'Подтвердить заново':'Подтвердить итоги'}</button>
      </>:<p>Подтверждение станет доступно после завершения всех матчей. Незавершённая сетка или ничья без тай-брейка не подтверждаются.</p>}
    <Link className={s.textLink} href="/demo/rankings">Открыть демо-рейтинг →</Link>
  </section>;
}
export function TournamentDetail({id}:{id:string}){
  const {list,dispatch}=useTournaments();const t=list.find(v=>v.id===id);
  const [tab,setTab]=useState<'overview'|'games'|'schedule'>('overview');
  if(!t)return <section className={s.section}><h1>Демо-турнир не найден</h1><EventContext available={{}}/><p>Созданные турниры сбрасываются при обновлении страницы.</p><Link className={s.textLink} href="/demo/tournaments">К каталогу</Link></section>;
  const send=(action:Action)=>{dispatch({type:'edit',id,action});if(action.type==='close')setTab('games');};
  const games=matches(t),result=phase(t);
  return <>
    <Hero tag={`Турнирная карточка / ${result}${isConfirmed(t)?' · подтверждён':''}`} title={t.title}>{t.description}</Hero>
    <EventContext available={{confirmed:isConfirmed(t),registered:t.entrants.includes('TEAM-1'),upcoming:t.start==='2027-03-08'&&result!=='Завершён'}}/>
    <div className={s.cover}><div><p className={s.eyebrow}>Учебная дата · {t.today}</p><b>{t.organizer}</b></div>
      <div><b>{t.discipline} · {formatNames[t.format]}</b><p>{systemNames[t.system]} · {t.start} — {t.end}</p></div></div>
    <nav className={s.actions} aria-label="Разделы турнира">{([['overview','Заявки'],['games',t.system==='knockout'?'Сетка и результаты':'Группы и результаты'],['schedule','Расписание']] as const)
      .map(([k,label])=><button key={k} className={tab===k?s.primary:s.secondary} aria-pressed={tab===k} onClick={()=>setTab(k)}>{label}</button>)}</nav>
    {tab==='overview'?<Applications t={t} send={send}/>:!games.length?<p role="status">После закрытия регистрации здесь появятся раунды и матчи.</p>:
      tab==='games'?<Arena t={t} games={games} send={send}/>:<Schedule t={t} games={games} send={send}/>}
    {tab!=='overview'&&games.length>0&&<ResultsStatus t={t} send={send}/>}
    <Link href="/demo/tournaments" className={s.textLink}>← Все турниры</Link>
  </>;
}
