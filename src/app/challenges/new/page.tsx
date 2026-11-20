import { notFound, redirect } from 'next/navigation';
import { randomUUID } from 'node:crypto';
import { Frame, Notice, Unavailable, panel, input, button } from '@/components/university/Frame';
import { OpponentFields } from '@/components/university/OpponentFields';
import { directories, entryName, param, represents, viewer, type Query } from '@/lib/university/data';
import { createChallenge } from '@/lib/university/actions';

async function Editor({query}:{query:Promise<Query>}) {
  const {db,access,signedIn}=await viewer();
  if(!signedIn)redirect('/auth/login');
  if(!db||!access)return <Unavailable/>;
  if(!represents(access))notFound();
  const dirs=await directories(db);if(!dirs)return <Unavailable/>;
  return <form action={createChallenge} className={`${panel} max-w-xl`}>
    <Notice value={param(await query,'notice')}/>
    <p>От имени: <strong>{entryName(dirs.universities,access.university)}</strong></p>
    <input type="hidden" name="id" value={randomUUID()}/>
    <label className="block">Дисциплина<select name="discipline" className={input} required>
      {dirs.disciplines.filter(d=>represents(access,d.id)).map(d=><option value={d.id} key={d.id}>{d.name}</option>)}
    </select></label>
    <OpponentFields options={dirs.universities.filter(u=>u.id!==access.university)}/>
    <label className="block">Название<input className={input} name="title" required maxLength={120}/></label>
    <label className="block">Описание<textarea className={input} name="description" maxLength={2000}/></label>
    <label className="block">Предложенная дата (необязательно)<input type="date" className={input} name="date"/></label>
    <label className="block">Место (необязательно)<input className={input} name="venue" maxLength={160}/></label>
    <p>Приём ответов — до 30 дней, но не позже конца предложенного дня по Ташкенту.</p>
    <button className={button}>{access.admin||!access.approval?'Опубликовать':'Отправить на согласование'}</button>
  </form>;
}
export default function NewChallenge({searchParams}:PageProps<'/challenges/new'>) {
  return <Frame title="Новый вызов"><Editor query={searchParams}/></Frame>;
}
