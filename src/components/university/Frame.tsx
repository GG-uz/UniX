import Link from 'next/link';
import { Suspense, type ReactNode } from 'react';
export const input='block mt-1 w-full min-w-0 rounded-lg border border-neutral-600 bg-neutral-900 px-3 py-2 text-white';
export const button='inline-block rounded-lg bg-amber-400 px-4 py-2 font-semibold text-neutral-950';
export const link='font-semibold underline underline-offset-4';
export const panel='space-y-3 rounded-xl border border-neutral-700 p-4';
export function Frame({title,children}:{title:string;children:ReactNode}) {
  return <section className="mx-auto max-w-6xl space-y-6 px-4 py-10">
    <h1 className="text-3xl font-bold">{title}</h1>
    <Suspense fallback={<p>Загрузка…</p>}>{children}</Suspense>
  </section>;
}
export function Notice({value}:{value:string}) {
  if(value==='saved') return <p role="status">Изменения сохранены.</p>;
  if(value==='failed') return <p role="alert">Не удалось выполнить действие. Проверьте поля, статус вызова и свои полномочия.</p>;
  return null;
}
export function Unavailable() {return <p role="status">Модуль вызовов пока недоступен. <Link className={link} href="/demo/challenges">Открыть демо-доску</Link></p>;}
