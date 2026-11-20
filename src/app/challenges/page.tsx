import Link from 'next/link';
import { Frame, Notice, input, button, link, panel } from '@/components/university/Frame';
import { viewer, directories, param, labels, represents, canAccept, entryName, type Challenge, type Query } from '@/lib/university/data';
import { acceptChallenge } from '@/lib/university/actions';

function CatalogUnavailable() {
  return <div className={panel} role="status">
    <h2 className="text-xl font-bold">Реальные университетские вызовы пока недоступны</h2>
    <p>Не удалось загрузить каталог из базы данных. Интерактивное демо доступно отдельно.</p>
  </div>;
}

async function Board({query}:{query:Promise<Query>}) {
  const s=await query;const {db,access}=await viewer();
  if(!db)return <CatalogUnavailable/>;
  const dirs=await directories(db);if(!dirs)return <CatalogUnavailable/>;
  const discipline=param(s,'sport'),uni=param(s,'university'),kind=param(s,'kind'),status=param(s,'status'),date=param(s,'date');
  const page=Math.max(1,Math.min(10000,Number.parseInt(param(s,'page'),10)||1));
  let request=db.from('challenge_feed').select('*').order('created_at',{ascending:false}).order('id');
  if(dirs.disciplines.some(d=>d.id===discipline))request=request.eq('discipline',discipline);
  if(dirs.universities.some(u=>u.id===uni)&&/^[\w-]+$/.test(uni))request=request.or(`creator.eq.${uni},target.eq.${uni},opponent.eq.${uni}`);
  if(['OPEN','DIRECT'].includes(kind))request=request.eq('kind',kind);
  if(['OPEN','ACCEPTED','EXPIRED','CANCELLED'].includes(status))request=request.eq('status',status);
  if(/^\d{4}-\d{2}-\d{2}$/.test(date))request=request.eq('proposed_date',date);
  const {data,error}=await request.range((page-1)*24,page*24);
  if(error||!data)return <CatalogUnavailable/>;
  const pager=(n:number)=>`/challenges?${new URLSearchParams({sport:discipline,university:uni,kind,status,date,page:String(n)})}`;
  return <>
    <Notice value={param(s,'notice')}/>
    <nav className="flex flex-wrap items-center gap-4">
      {represents(access)&&<><Link className={button} href="/challenges/new">Создать вызов</Link>
        <Link className={link} href="/university/dashboard">Кабинет университета</Link></>}
      <Link className={link} href="/universities">Университеты</Link>
    </nav>
    <form className={`${panel} grid gap-3 sm:grid-cols-2 lg:grid-cols-3`} action="/challenges">
      <label>Дисциплина<select className={input} name="sport" defaultValue={discipline}><option value="">Все дисциплины</option>
        {dirs.disciplines.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
      <label>Университет<select className={input} name="university" defaultValue={uni}><option value="">Все университеты</option>
        {dirs.universities.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
      <label>Тип<select className={input} name="kind" defaultValue={kind}><option value="">Все типы</option><option value="OPEN">Открытый</option><option value="DIRECT">Адресный</option></select></label>
      <label>Статус<select className={input} name="status" defaultValue={status}><option value="">Все статусы</option>
        {['OPEN','ACCEPTED','CANCELLED','EXPIRED'].map(x=><option key={x} value={x}>{labels[x]}</option>)}</select></label>
      <label>Предложенная дата<input className={input} type="date" name="date" defaultValue={date}/></label>
      <button className={button}>Показать</button>
    </form>
    {!data.length&&<p role="status">{discipline||uni||kind||status||date||page>1
      ? <>По этим условиям вызовов нет. <Link className={link} href="/challenges">Сбросить фильтры</Link></>
      : 'Каталог доступен. Пока ни один университет не опубликовал вызов.'}</p>}
    <div className="grid gap-4 md:grid-cols-2">{(data as Challenge[]).slice(0,24).map(c=><article key={c.id} className={panel}>
      <p>{entryName(dirs.disciplines,c.discipline)} · {labels[c.status]}</p>
      <h2 className="break-words text-xl font-bold">{c.title}</h2>
      <p>{entryName(dirs.universities,c.creator)} — {entryName(dirs.universities,c.opponent??c.target??'Любой университет')}</p>
      <p className="break-words">{c.description}</p>
      <p>Создан: {new Date(c.created_at).toLocaleDateString('ru-RU',{timeZone:'Asia/Tashkent'})}
        {c.proposed_date&&` · Предложенная дата: ${c.proposed_date}`}{c.venue&&` · ${c.venue}`}</p>
      {canAccept(access,c)&&<form action={acceptChallenge}><input type="hidden" name="id" value={c.id}/>
        <button className={button}>{access?.admin||!access?.approval?'Принять вызов':'Предложить принятие'}</button></form>}
    </article>)}</div>
    <nav className="flex gap-4">{page>1&&<Link className={link} href={pager(page-1)}>Назад</Link>}
      {data.length>24&&<Link className={link} href={pager(page+1)}>Далее</Link>}</nav>
  </>;
}
export default function ChallengesPage({searchParams}:PageProps<'/challenges'>) {
  return <Frame title="Университетские вызовы">
    <p>Реальный каталог · здесь отображаются только опубликованные университетские вызовы.</p>
    <nav aria-label="Демонстрационные разделы" className="flex flex-wrap gap-4">
      <Link className={link} href="/demo/university-challenges">Попробовать интерактивное демо</Link>
      <Link className={link} href="/demo/challenges">Демо-доска матчей</Link>
    </nav>
    <Board query={searchParams}/>
  </Frame>;
}
