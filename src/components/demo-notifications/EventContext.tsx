'use client';
import Link from 'next/link';
import {usePathname,useSearchParams} from 'next/navigation';
import {Suspense,type ReactNode} from 'react';
import {examples,eventPath,types,type ExampleType} from './model';
import css from './inbox.module.css';

type Props={available:Partial<Record<ExampleType,boolean>>;detail?:ReactNode};
function Context({available,detail}:Props){
  const key=useSearchParams().get('example'),path=usePathname();
  if(!key)return null;
  const type=types.find(t=>t===key);
  const valid=type&&eventPath(type).split('?')[0]===path&&available[type];
  return <section className={css.surface} aria-label="Связанное демособытие">
    <small>ДЕМО · данные вымышлены</small>
    {valid?<><h2>{examples[type].title}</h2><p>{examples[type].message}</p>{detail}</>:
      <p>Состояние демособытия изменилось или пример недоступен. Выберите другой пример в центре.</p>}
    <Link href="/demo/notifications">← В центр демоуведомлений</Link>
  </section>;
}
export function EventContext(props:Props){
  return <Suspense fallback={null}><Context {...props}/></Suspense>;
}
