import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Atlas, Hero, Mark } from '@/components/ecosystem/Atlas';
import s from '@/components/ecosystem/Atlas.module.css';
import { supabase } from '@/lib/supabase/server';
import { officialEvent } from '@/lib/officialEvent';
import { labels, type Db } from '@/lib/university/data';
import { publicEditorial } from '@/lib/university/editorial';

async function Activity({db,id}:{db:Db;id:string}) {
  const feed=await db.from('challenge_feed').select('id,title,status,created_at',{count:'exact'})
    .or(`creator.eq.${id},target.eq.${id},opponent.eq.${id}`).order('created_at',{ascending:false}).limit(5);
  return <section className={s.section}><h2>История вызовов</h2>
    {feed.error?<p>Лента вызовов пока недоступна. Статистика по вызовам не рассчитана.</p>:
      <><p>Опубликованные вызовы с участием или приглашением вуза: {feed.count??'нет данных'}.</p>
        {feed.data.map(c=><div key={c.id} className={s.row}><b>{c.title}</b><span>{labels[c.status]}</span></div>)}</>}
    <Link className={s.textLink} href={`/challenges?university=${encodeURIComponent(id)}`}>В каталог вызовов →</Link>
  </section>;
}
async function Profile({params}:PageProps<'/universities/[id]'>) {
  const {id}=await params;
  if(!/^[a-zA-Z0-9_-]{1,100}$/.test(id))notFound();
  const db=await supabase();
  const row=await db?.from('universities').select('id,name').eq('id',id).maybeSingle();
  if(!db||!row||row.error)return <p role="status">Профиль университета сейчас недоступен.</p>;
  if(!row.data)notFound();
  const {name}=row.data, inEvent=id==='team'||id==='cau';
  const info=publicEditorial(id);
  return <>
    <div className={s.cover}>
      {info.cover&&<Image src={info.cover} width={1200} height={300} alt="" className={s.coverImage}/>}
      {info.logo?<Image src={info.logo} width={76} height={76} alt={`Логотип: ${name}`}/>:<Mark name={info.abbreviation??name}/>}
      <span className={s.eyebrow}>Университет / {info.abbreviation??id}</span></div>
    <Hero tag="Публичный профиль" title={name}>Запись из справочника UniX. Присутствие в справочнике не означает верификацию представителей.</Hero>
    <div className={s.grid}>
      <section className={s.section}><h2>О вузе</h2><p>{info.description??'Описание вуза пока не опубликовано.'}</p>
        <dl><div className={s.row}><dt>Местоположение</dt><dd>{info.location??'Не указано'}</dd></div>
          {info.abbreviation&&<div className={s.row}><dt>Сокращение</dt><dd>{info.abbreviation}</dd></div>}</dl></section>
      <section className={s.section}><h2>Дисциплины</h2>
        <p>{inEvent?`В согласованном событии: ${officialEvent.discipline}.`:'Подтверждённый список дисциплин пока не опубликован.'}</p></section>
      <section className={s.section}><h2>Представители и капитаны</h2><p>Публичных сведений о верифицированных представителях пока нет.</p></section>
    </div>
    {inEvent&&<section className={s.section}><p className={s.eyebrow}>Согласованное событие</p><h2>{officialEvent.title}</h2>
      <p>{officialEvent.status}</p><Link className={s.textLink} href={officialEvent.href}>Страница события →</Link></section>}
    <Suspense fallback={<p>Загрузка истории вызовов…</p>}><Activity db={db} id={id}/></Suspense>
    <div className={s.grid}>
      <section className={s.section}><h2>Официальные команды</h2><p>Реестр проверенных команд пока не опубликован.</p>
        <Link className={s.textLink} prefetch={false} href="/demo/teams">Посмотреть вымышленные команды в демо →</Link></section>
      <section className={s.section}><h2>Результаты и достижения</h2><p>Нет подтверждённых данных о сыгранных матчах, победах или наградах.</p></section>
    </div>
  </>;
}
export default function University(props:PageProps<'/universities/[id]'>) {
  return <Atlas><Suspense fallback={<p>Загрузка профиля…</p>}><Profile {...props}/></Suspense></Atlas>;
}
