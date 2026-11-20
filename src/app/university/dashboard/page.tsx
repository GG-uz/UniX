import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Frame, Notice, Unavailable, button, input, link, panel } from '@/components/university/Frame';
import { directories, entryName, labels, param, represents, viewer, type Dashboard, type Entry, type Query } from '@/lib/university/data';
import { manageUniversity } from '@/lib/university/actions';

function Command({id,op,children}:{id:string;op:string;children:string}) {
  return <form action={manageUniversity}><input type="hidden" name="id" value={id}/>
    <button name="op" value={op} className={link}>{children}</button></form>;
}
async function Workspace({query}:{query:Promise<Query>}) {
  const {db,access:a,signedIn}=await viewer();
  if(!signedIn)redirect('/auth/login');
  if(!db||!a)return <Unavailable/>;
  if(!represents(a))notFound();
  const s=await query,name=param(s,'name').trim();
  const [dirs, result, candidates]=await Promise.all([directories(db),db.rpc('uc_dashboard'),
    a.admin&&name.length>=2&&name.length<=100?db.rpc('uc_candidates',{p_name:name}):{data:[],error:null}]);
  if(!dirs||result.error||candidates.error)return <Unavailable/>;
  const {roster,requests,activity}=result.data as Dashboard;
  return <>
    <Notice value={param(s,'notice')}/>
    <p><strong>{entryName(dirs.universities,a.university)}</strong> · {a.admin?'Администратор университета':'Назначенный капитан'}</p>
    {!!a.disciplines.length&&<p>Ваши дисциплины: {a.disciplines.map(d=>entryName(dirs.disciplines,d)).join(', ')}</p>}
    <nav className="flex flex-wrap gap-4"><Link href="/challenges/new" className={button}>Создать вызов</Link>
      <Link href="/challenges" className={link}>Доска вызовов</Link></nav>
    <section className={panel}><h2 className="text-xl font-bold">Полномочия капитанов</h2>
      {a.admin?<form className="space-y-2" action={manageUniversity}>
        <label>Порядок действий<select name="mode" className={input} defaultValue={a.approval?'required':'independent'}>
          <option value="required">Требуется согласование администрации</option>
          <option value="independent">Капитаны действуют самостоятельно</option></select></label>
        <p>Новый режим применяется к новым действиям. Ожидающие заявки требуют отдельного решения.</p>
        <button className={button} name="op" value="mode">Сохранить режим</button>
      </form>:<p>{a.approval?'Ваши предложения рассматривает администрация.':'В назначенных дисциплинах вы действуете самостоятельно.'}</p>}
    </section>
    {a.admin&&<section className={panel}><h2 className="text-xl font-bold">Назначенные капитаны</h2>
      {roster.length===0&&<p>Назначений пока нет.</p>}
      {roster.map(r=><div key={r.id} className="flex flex-wrap justify-between gap-2">
        <span>{r.name} · {entryName(dirs.disciplines,r.discipline)}</span><Command op="revoke" id={r.id}>Отозвать назначение</Command>
      </div>)}
      <form><label>Найти студента своего вуза по имени<input name="name" className={input} minLength={2} maxLength={100} required defaultValue={name}/></label>
        <button className={link}>Найти</button></form>
      {name.length>=2&&!candidates.data.length&&<p>Кандидатов не найдено.</p>}
      {(candidates.data as {id:string;full_name:string}[]).map(p=><form key={p.id} className={panel} action={manageUniversity}>
        <strong>{p.full_name}</strong><input type="hidden" name="id" value={p.id}/>
        <label className="block">Дисциплина<select className={input} name="discipline" required>{dirs.disciplines.map((d:Entry)=>
          <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
        <button name="op" value="appoint" className={button}>Назначить капитаном</button>
      </form>)}
    </section>}
    <section className={panel}><h2 className="text-xl font-bold">{a.admin?'Заявки университета':'Мои заявки'}</h2>
      {!requests.length&&<p>Заявок пока нет.</p>}
      {requests.map(r=><div key={r.id} className="border-t border-neutral-700 py-3">
        <p>{r.kind==='CREATE'?'Публикация':'Принятие'}: <b>{r.title}</b> · {entryName(dirs.disciplines,r.discipline)} · {labels[r.status]}</p>
        <p>{r.name} · {entryName(dirs.universities,r.creator)} — {entryName(dirs.universities,r.target??'Любой университет')}</p>
        <p className="break-words">{r.description}{r.date&&` · ${r.date}`}{r.venue&&` · ${r.venue}`}</p>
        {a.admin&&r.status==='PENDING'&&<div className="flex gap-4"><Command op="approve" id={r.id}>Одобрить</Command>
          <Command op="reject" id={r.id}>Отклонить</Command></div>}
      </div>)}
    </section>
    <section className={panel}><h2 className="text-xl font-bold">Последние вызовы университета</h2>
      {!activity.length&&<p>Вызовов пока нет.</p>}
      {activity.map(c=><div key={c.id} className="border-t border-neutral-700 py-3">
        <strong>{c.title}</strong> · {labels[c.status]}<p>{entryName(dirs.universities,c.creator)} — {entryName(dirs.universities,c.opponent??c.target??'Любой университет')}</p>
        {a.admin&&a.university===c.creator&&['OPEN','PENDING_APPROVAL'].includes(c.status)&&<Command op="cancel" id={c.id}>Отменить вызов</Command>}
      </div>)}
    </section>
  </>;
}
export default function UniversityDashboard({searchParams}:PageProps<'/university/dashboard'>) {
  return <Frame title="Кабинет университета"><Workspace query={searchParams}/></Frame>;
}
