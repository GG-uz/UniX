'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Hero, Mark } from '@/components/ecosystem/Atlas';
import s from '@/components/ecosystem/Atlas.module.css';
import { campuses, disciplines, statuses } from '@/components/demo-teams/model';
import { useTeams } from '@/components/demo-teams/Store';

export default function DemoTeams() {
  const {teams}=useTeams();
  const [search,setSearch]=useState(''),[campus,setCampus]=useState(''),[discipline,setDiscipline]=useState(''),[status,setStatus]=useState('');
  const filtered=teams.filter(t=>t.name.toLowerCase().includes(search.trim().toLowerCase()) && (!campus||t.university===campus)
    && (!discipline||t.discipline===discipline) && (!status||t.status===status));
  return <>
    <Hero tag="Лаборатория UniX / Команды" title="Команды университетов">Познакомьтесь с вымышленными составами или пройдите путь своей команды: от черновика до решения демо-администрации.</Hero>
    <div className={s.actions}><Link href="/demo/teams/new" className={s.primary}>Предложить команду →</Link>
      <span className={s.muted}>Прогресс хранится до обновления страницы в этом разделе.</span></div>
    <div className={s.fields}>
      <label>Название<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Найти команду"/></label>
      <label>Университет<select value={campus} onChange={e=>setCampus(e.target.value)}><option value="">Все вузы</option>{campuses.map(c=><option key={c}>{c}</option>)}</select></label>
      <label>Дисциплина<select value={discipline} onChange={e=>setDiscipline(e.target.value)}><option value="">Все дисциплины</option>{disciplines.map(d=><option key={d}>{d}</option>)}</select></label>
      <label>Статус<select value={status} onChange={e=>setStatus(e.target.value)}><option value="">Все статусы</option>{Object.entries(statuses).map(([id,text])=><option key={id} value={id}>{text}</option>)}</select></label>
    </div>
    <div className={s.actions}><p role="status" className={s.muted}>Найдено команд: {filtered.length}</p>
      {(search||campus||discipline||status)&&<button className={s.secondary} onClick={()=>{setSearch('');setCampus('');setDiscipline('');setStatus('');}}>Сбросить фильтры</button>}
    </div>
    {filtered.length?<div className={s.grid}>{filtered.map(t=><Link key={t.id} href={`/demo/teams/${t.id}`} className={s.card}>
      <div className={s.row}><Mark name={t.name}/><span className={s.chip}>{statuses[t.status]}</span></div>
      <h2>{t.name}</h2><span>{t.university}</span><small>{t.discipline} · Карточка →</small>
    </Link>)}</div>:<p>Попробуйте другое название или снимите фильтры.</p>}
  </>;
}
