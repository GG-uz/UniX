import Link from 'next/link';
import { Suspense } from 'react';
import { Atlas, Hero, Mark } from '@/components/ecosystem/Atlas';
import s from '@/components/ecosystem/Atlas.module.css';
import { supabase } from '@/lib/supabase/server';

async function Directory({searchParams}:PageProps<'/universities'>) {
  const {q}=await searchParams;
  const search=typeof q==='string'?q.trim().slice(0,100):'';
  const db=await supabase();
  const result=await db?.from('universities').select('id,name').order('name');
  if(!result?.data)return <p role="status">Справочник временно недоступен. Попробуйте позже.</p>;
  const entries=result.data.filter(u=>`${u.name} ${u.id}`.toLowerCase().includes(search.toLowerCase()));
  return <>
    <form action="/universities" className={s.fields}><label>Поиск по названию или коду
      <input name="q" type="search" defaultValue={search} maxLength={100} placeholder="Например, TEAM"/></label>
      <div className={s.actions}><button className={s.primary}>Найти</button>{search&&<Link className={s.textLink} href="/universities">Сбросить</Link>}</div>
    </form>
    {!result.data.length?<p>Справочник пока пуст.</p>:!entries.length?<p>Университетов по этому запросу не найдено.</p>:
      <><p className={s.eyebrow}>Найдено: {entries.length}</p><div className={s.grid}>
        {entries.map(u=><Link className={s.card} key={u.id} href={`/universities/${encodeURIComponent(u.id)}`}>
          <Mark name={u.name}/><h2>{u.name}</h2><small>Профиль университета →</small>
        </Link>)}</div></>}
  </>;
}
export default function Universities(props:PageProps<'/universities'>) {
  return <Atlas><Hero tag="UniX / Справочник" title="Университеты">Откройте профиль вуза, чтобы посмотреть опубликованные события и университетские вызовы.</Hero>
    <Suspense fallback={<p>Загрузка справочника…</p>}><Directory {...props}/></Suspense></Atlas>;
}
