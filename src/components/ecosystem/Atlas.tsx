import Link from 'next/link';
import type { ReactNode } from 'react';
import s from './Atlas.module.css';

export function Atlas({children,demo=false}:{children:ReactNode;demo?:boolean}) {
  return <div className={s.page}>
    {demo && <aside className={s.bar}><div>ДЕМО · данные вымышлены</div></aside>}
    <div className={s.wrap}>
      <nav aria-label="Университеты и команды" className={s.nav}>
        <Link href="/universities" prefetch={false}>Университеты</Link>
        <Link href="/demo/teams" prefetch={false}>Демо-команды</Link>
        <Link href={demo?'/demo/university-challenges':'/challenges'} prefetch={false}>{demo?'Демо вызовов':'Вызовы'}</Link>
      </nav>
      {children}
    </div>
  </div>;
}
export function Hero({tag,title,children}:{tag:string;title:string;children:ReactNode}) {
  return <header className={s.hero}><p className={s.eyebrow}>{tag}</p><h1>{title}</h1><p>{children}</p></header>;
}
export function Mark({name}:{name:string}) {
  const letters=/^[A-Z]{2,4}$/.test(name)?name:name.trim().split(/\s+/).slice(0,2).map(word=>word[0]).join('').toUpperCase();
  return <span className={s.mark} aria-hidden="true">{letters}</span>;
}
