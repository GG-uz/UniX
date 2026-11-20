'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hero } from '@/components/ecosystem/Atlas';
import s from '@/components/ecosystem/Atlas.module.css';
import { useTournaments } from '@/components/demo-tournaments/Store';
import { campuses,day,defaults,disciplines,formatNames,systemNames,validate,type Config } from '@/components/demo-tournaments/model';

export default function NewTournament(){
  const [c,set]=useState<Config>({...defaults}),[error,notify]=useState('');
  const {dispatch}=useTournaments(),router=useRouter();
  return <><Hero tag="Демо-организатор / Новый турнир" title="Соберите свой турнир">Укажите правила приёма и проведения. Учебная дата: {day}. Всё останется в памяти этого раздела.</Hero>
    <form className={`${s.section} ${s.stack} ${s.form}`} onSubmit={e=>{
      e.preventDefault();const problem=validate(c);if(problem){notify(problem);return;}
      const id=crypto.randomUUID();dispatch({type:'new',id,config:c});router.push(`/demo/tournaments/${id}`);
    }}>
      <label>Название турнира<input required minLength={2} maxLength={80} value={c.title} onChange={e=>set({...c,title:e.target.value})}/></label>
      <label>Описание<textarea required maxLength={600} value={c.description} onChange={e=>set({...c,description:e.target.value})}/></label>
      <div className={s.fields}><label>Вуз-организатор<select value={c.organizer} onChange={e=>set({...c,organizer:e.target.value})}>{campuses.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Дисциплина<select value={c.discipline} onChange={e=>set({...c,discipline:e.target.value})}>{disciplines.map(x=><option key={x}>{x}</option>)}</select></label></div>
      <div className={s.fields}><label>Формат участия<select value={c.format} onChange={e=>set({...c,format:e.target.value as Config['format']})}>{Object.entries(formatNames).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
        <label>Система проведения<select value={c.system} onChange={e=>set({...c,system:e.target.value as Config['system']})}>{Object.entries(systemNames).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label></div>
      <label>Количество мест<input type="number" min="2" max="16" required value={c.capacity||''} onChange={e=>set({...c,capacity:Number(e.target.value)})}/></label>
      <div className={s.fields}>{([['regStart','Регистрация с'],['regEnd','Регистрация до'],['start','Начало турнира'],['end','Конец турнира']] as const).map(([key,label])=><label key={key}>{label}
        <input type="date" required value={c[key]} onChange={e=>set({...c,[key]:e.target.value})}/></label>)}</div>
      {error&&<p role="alert">{error}</p>}<button className={s.primary}>Создать демо-турнир</button>
    </form></>;
}
