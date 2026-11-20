'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Hero } from '@/components/ecosystem/Atlas';
import s from '@/components/ecosystem/Atlas.module.css';
import { useTournaments } from '@/components/demo-tournaments/Store';
import { approved,campuses,disciplines,formatNames,phase,systemNames } from '@/components/demo-tournaments/model';

export default function Catalog(){
  const {list}=useTournaments();const empty={q:'',discipline:'',org:'',format:'',status:''};
  const [filters,set]=useState(empty);
  const rows=list.filter(t=>t.title.toLowerCase().includes(filters.q.trim().toLowerCase())&&
    (!filters.discipline||t.discipline===filters.discipline)&&(!filters.org||t.organizer===filters.org)&&
    (!filters.format||formatNames[t.format]===filters.format)&&(!filters.status||phase(t)===filters.status));
  return <><Hero tag="Турнирная лаборатория / Каталог" title="Демо-турниры">От первой заявки до финала: попробуйте роль организатора или пройдите соревнование за вымышленного участника.</Hero>
    <div className={s.actions}><Link className={s.primary} href="/demo/tournaments/new">Создать турнир →</Link>
      <span className={s.muted}>Вход не требуется. Обновление страницы сбросит изменения.</span></div>
    <div className={s.fields}><label>Поиск<input type="search" value={filters.q} onChange={e=>set({...filters,q:e.target.value})} placeholder="Название турнира"/></label>
      {([['discipline','Дисциплина',disciplines],['org','Вуз-организатор',campuses],['format','Участие',Object.values(formatNames)],
        ['status','Статус',['Предстоящий','Идёт','Завершён']]] as const).map(([key,label,options])=>
        <label key={key}>{label}<select value={filters[key]} onChange={e=>set({...filters,[key]:e.target.value})}>
          <option value="">Все</option>{options.map(x=><option key={x}>{x}</option>)}</select></label>)}</div>
    <div className={s.actions}><p role="status">Найдено: {rows.length}</p>{Object.values(filters).some(Boolean)&&
      <button className={s.secondary} onClick={()=>set(empty)}>Сбросить фильтры</button>}</div>
    <div className={s.grid}>{rows.map(t=><Link key={t.id} className={s.card} href={`/demo/tournaments/${t.id}`}>
      <span className={s.eyebrow}>{phase(t)} · {formatNames[t.format]}</span><h2>{t.title}</h2>
      <p>{t.discipline} · {systemNames[t.system]}</p><p>{t.organizer}</p>
      <small>{t.start} — {t.end}</small><div className={s.row}><b>Участники: {approved(t)} / {t.capacity}</b>
        <span>{t.entrants.length?'Приём закрыт':`Свободно: ${t.capacity-approved(t)}`}</span></div>
    </Link>)}</div>
  </>;
}
