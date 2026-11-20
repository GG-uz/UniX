'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import s from '@/components/ecosystem/Atlas.module.css';
import { aliases, blank, campuses, disciplines, valid, type Team } from './model';
import { useTeams } from './Store';

export function ProposalForm({team}:{team?:Team}) {
  const {dispatch}=useTeams(), router=useRouter();
  const [p,set]=useState(()=>team??blank()),[error,setError]=useState('');
  return <form className={`${s.section} ${s.stack} ${s.form}`} onSubmit={e=>{
    e.preventDefault();
    if(!valid(p)){setError('Введите название от 2 до 64 символов и выберите минимум двух участников, включая кандидата в капитаны.');return;}
    const id=team?.id??crypto.randomUUID();
    dispatch({type:'save',id,proposal:p});
    if ((e.nativeEvent as SubmitEvent).submitter?.getAttribute('value')==='submit') dispatch({type:'submit',id});
    if(!team)router.push(`/demo/teams/${id}`);else setError('Изменения сохранены в демо.');
  }}>
    <label>Название команды<input value={p.name} required maxLength={64} minLength={2} onChange={e=>set({...p,name:e.target.value})} placeholder="Придумайте название"/></label>
    <div className={s.fields}>
      <label>Вымышленный вуз<select value={p.university} onChange={e=>set({...p,university:e.target.value})}>{campuses.map(u=><option key={u}>{u}</option>)}</select></label>
      <label>Дисциплина<select value={p.discipline} onChange={e=>set({...p,discipline:e.target.value})}>{disciplines.map(d=><option key={d}>{d}</option>)}</select></label>
    </div>
    <fieldset><legend>Проект состава · минимум два участника</legend>
      <p className={s.muted}>Выберите учебные псевдонимы. Реальные имена не нужны.</p>
      <div className={s.checks}>{aliases.map(m=><label key={m}><input type="checkbox" checked={p.members.includes(m)} disabled={m===p.captain}
        onChange={e=>set({...p,members:e.target.checked?[...p.members,m]:p.members.filter(v=>v!==m)})}/> {m}</label>)}</div>
    </fieldset>
    <label>Кандидат в капитаны<select value={p.captain} onChange={e=>set({...p,captain:e.target.value})}>{p.members.map(m=><option key={m}>{m}</option>)}</select></label>
    <p className={s.muted}>Это предложение в учебном сценарии, а не назначение реального капитана.</p>
    {error&&<p role="status">{error}</p>}
    <div className={s.actions}><button className={s.secondary} type="submit" value="draft">Сохранить черновик</button>
      <button className={s.primary} type="submit" value="submit">Отправить на рассмотрение →</button></div>
  </form>;
}
