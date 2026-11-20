'use client';
import Link from 'next/link';
import {useRef,useState} from 'react';
import {eventPath,examples,filtered,types,type DemoNotification,type ExampleType,type Status} from './model';
import {useDemoInbox} from './Store';
import css from './inbox.module.css';

export function Messages({items,onNavigate,onOpen,onRead}:{items:DemoNotification[];onNavigate?:()=>void;onOpen?:(n:DemoNotification)=>void;onRead?:()=>void}){
  const {dispatch}=useDemoInbox();
  const [open,setOpen]=useState<string|null>(null);
  const read=(id:string)=>dispatch({kind:'read',id,at:new Date().toISOString()});
  return <ul className={css.list}>{items.map(n=><li key={n.id}>
    <small>{n.readAt?'Прочитано':'● Не прочитано'} · <time dateTime={n.createdAt}>{new Date(n.createdAt).toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'})}</time></small>
    <button className={css.subject} aria-expanded={onOpen?undefined:open===n.id} onClick={()=>{if(onOpen)onOpen(n);else setOpen(open===n.id?null:n.id);read(n.id);}}>{n.title}</button>
    {open===n.id&&<p>{n.message}</p>}
    <div className={css.actions}>
      <Link href={eventPath(n.type)} onClick={()=>{read(n.id);onNavigate?.();}}>К событию<span className="sr-only">: {n.title}</span></Link>
      {!n.readAt&&<button onClick={e=>{
        if(onRead)onRead();else e.currentTarget.closest('li')?.querySelector('button')?.focus();
        read(n.id);
      }}>Прочитать<span className="sr-only">: {n.title}</span></button>}
    </div>
  </li>)}</ul>;
}
function ReadAll(){
  const {list,dispatch}=useDemoInbox();
  return <button disabled={!list.some(n=>!n.readAt)} onClick={()=>dispatch({kind:'readAll',at:new Date().toISOString()})}>Прочитать все</button>;
}
export function NotificationPanel({close}:{close:()=>void}){
  const {list}=useDemoInbox();
  return <section id="demo-inbox-panel" aria-label="Последние демоуведомления" className={`${css.surface} ${css.panel}`}>
    <small>ДЕМО · данные вымышлены</small><h2>Последние уведомления</h2>
    {list.length?<Messages items={list.slice(0,5)} onNavigate={close}/>:<p>Уведомлений пока нет. Получите первое в демосценарии.</p>}
    <div className={css.actions}><ReadAll/><Link href="/demo/notifications" onClick={close}>Открыть центр</Link></div>
  </section>;
}
export function NotificationCenter(){
  const {list,dispatch}=useDemoInbox();
  const [sample,setSample]=useState<ExampleType>('challengeNew');
  const [type,setType]=useState<ExampleType|'all'>('all'),[status,setStatus]=useState<Status>('all');
  const [notice,setNotice]=useState('');
  const [selected,setSelected]=useState<string|null>(null);
  const selectedMessage=list.find(n=>n.id===selected);
  const count=useRef<HTMLParagraphElement>(null);
  const reader=useRef<HTMLHeadingElement>(null);
  const seq=useRef(0);
  const shown=filtered(list,type,status);
  function clear(){
    dispatch({kind:'clear'});setSelected(null);setType('all');setStatus('all');setSample('challengeNew');seq.current=0;setNotice('Демоуведомления очищены.');
  }
  return <div className={css.center}>
    <section id="scenario" className={css.surface}><h2>Получить демоуведомление</h2>
      <p>Выберите событие, затем откройте колокольчик вверху страницы. Примеры вымышлены; при обновлении страницы сообщения исчезнут.</p>
      <div className={css.actions}><label>Демособытие<select value={sample} onChange={e=>setSample(e.target.value as ExampleType)}>
        {types.map(k=><option key={k} value={k}>{examples[k].title}</option>)}</select></label>
        <button onClick={()=>{
          dispatch({kind:'receive',type:sample,id:crypto.randomUUID(),at:new Date().toISOString()});
          setNotice(`Получено: ${examples[sample].title}. Пример №${++seq.current}.`);
        }}>Получить уведомление</button></div>
      <p role="status">{notice}</p>
    </section>
    <section className={css.surface}><h2>Входящие</h2>
      <div className={css.actions}><label>Тип<select value={type} onChange={e=>setType(e.target.value as typeof type)}>
        <option value="all">Все типы</option>{types.map(k=><option key={k} value={k}>{examples[k].title}</option>)}</select></label>
        <label>Статус<select value={status} onChange={e=>setStatus(e.target.value as Status)}>
          <option value="all">Все статусы</option><option value="unread">Непрочитанные</option><option value="read">Прочитанные</option></select></label>
      </div>
      <div className={css.actions}><ReadAll/><button onClick={clear} disabled={!list.length}>Очистить демоуведомления</button></div>
      <p ref={count} tabIndex={-1} role="status">Показано: {shown.length}. Непрочитанных всего: {list.filter(n=>!n.readAt).length}.</p>
      {selectedMessage&&<article aria-label="Открытое сообщение"><h3 ref={reader} tabIndex={-1}>{selectedMessage.title}</h3>
        <p>{selectedMessage.message}</p><div className={css.actions}><Link href={eventPath(selectedMessage.type)}>К событию</Link>
          <button onClick={()=>{count.current?.focus();setSelected(null);}}>Закрыть сообщение</button></div></article>}
      {shown.length?<Messages items={shown} onOpen={n=>{setSelected(n.id);requestAnimationFrame(()=>reader.current?.focus());}}
        onRead={()=>count.current?.focus()}/>:!list.length?<p>Уведомлений пока нет. <a href="#scenario">Перейти к демосценарию</a></p>:
        <p>Нет совпадений. <button onClick={()=>{setType('all');setStatus('all');}}>Сбросить фильтры</button></p>}
    </section>
  </div>;
}
