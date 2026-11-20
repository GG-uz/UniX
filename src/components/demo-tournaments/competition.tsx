'use client';
import { useState } from 'react';
import s from '@/components/ecosystem/Atlas.module.css';
import css from './competition.module.css';
import { change,groups,pool,standings,type Match,type Tournament } from './model';
import type { Controls } from './TournamentDetail';

type Props=Controls & {games:Match[]};
const name=(t:Tournament,id:string|null)=>id?pool(t.format).find(x=>x.id===id)?.name??'Участник':'Ожидается победитель';
function gameState(t:Tournament,m:Match) {
  return m.bye?'Проход без игры':m.winner||t.system==='groups'&&m.score?'Завершён':m.score?'Нужен тай-брейк':m.a&&m.b?'Предстоит':'Ожидает участников';
}
function ScoreEditor({t,m,send}:Controls & {m:Match}) {
  const [left,setLeft]=useState(String(m.score?.a??'')),[right,setRight]=useState(String(m.score?.b??''));
  const [tie,setTie]=useState(m.score?.tie??''),[confirmed,setConfirmed]=useState(false);
  const a=Number(left),b=Number(right),draw=t.system==='knockout'&&left!==''&&right!==''&&a===b;
  const action={type:'score' as const,id:m.id,score:{a,b,tie:draw&&tie?tie:undefined}};
  const next=change(t,action);
  const resets=Object.keys(t.scores).filter(id=>!next.scores[id]).length;
  return <details className={css.editor}><summary>{m.score?'Исправить результат':'Внести результат'}</summary>
    <form className={s.stack} onSubmit={e=>{
      e.preventDefault();if(left!==''&&right!==''&&(!resets||confirmed))send(action);
    }}>
      <div className={css.scoreFields}>
        <label>{name(t,m.a)}<input aria-label={`Счёт: ${name(t,m.a)}`} type="number" min="0" max="999" required value={left}
          onChange={e=>{setLeft(e.target.value);setConfirmed(false);}}/></label>
        <label>{name(t,m.b)}<input aria-label={`Счёт: ${name(t,m.b)}`} type="number" min="0" max="999" required value={right}
          onChange={e=>{setRight(e.target.value);setConfirmed(false);}}/></label>
      </div>
      {draw&&<label>Исход тай-брейка<select value={tie} onChange={e=>{setTie(e.target.value);setConfirmed(false);}}>
        <option value="">Не определён — не продвигать</option>{[m.a!,m.b!].map(id=><option key={id} value={id}>{name(t,id)}</option>)}</select></label>}
      {resets>0&&<label className={css.warn}><input type="checkbox" required checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>
        {' '}Смена победителя сбросит зависимые результаты: {resets}. Подтверждаю.</label>}
      <button className={s.primary} disabled={!!resets&&!confirmed}>Сохранить счёт</button>
    </form>
  </details>;
}
function MatchCard({t,m,send}:Controls & {m:Match}) {
  return <article className={s.card} data-match={m.id}>
    <p className={s.eyebrow}>{gameState(t,m)}</p>
    {[m.a,m.b].map((p,i)=><div key={i} className={s.row}><b>{p?name(t,p):m.bye?'BYE':name(t,null)}</b>
      <span>{m.score?(i===0?m.score.a:m.score.b):'—'}</span></div>)}
    {m.bye?<p>Свободное место в сетке. Проход без счёта.</p>:m.winner?<p>Победитель: {name(t,m.winner)}</p>:
      m.score&&t.system==='groups'?<p>Ничья · по одному очку</p>:null}
    {m.a&&m.b&&<ScoreEditor key={`${m.a}/${m.b}/${m.score?.a}/${m.score?.b}/${m.score?.tie}`} t={t} m={m} send={send}/>}
  </article>;
}
export function Arena({t,games,send}:Props) {
  if(t.system==='groups')return <div className={s.stack}><p>Круговая система: каждый играет с каждым в своей группе. Победа — 3 очка, ничья — 1. При равенстве очков и разницы счёта место делится.</p>
    {groups(t.entrants).map((ids,i)=><section className={s.section} key={i}><h2>Группа {i+1}</h2>
      <table className={css.table}><caption>Таблица очков · группа {i+1}</caption>
        <thead><tr>{['Место','Участник','Игры','+/−','Очки'].map(x=><th key={x} scope="col">{x}</th>)}</tr></thead>
        <tbody>{standings(ids,games).map(row=><tr key={row.id}><td>{row.rank}</td><th scope="row">{name(t,row.id)}</th><td>{row.played}</td><td>{row.diff}</td><td>{row.points}</td></tr>)}</tbody>
      </table>
      {Array.from(new Set(games.filter(m=>m.group===i).map(m=>m.round))).map(r=><div key={r} className={s.stack}>
        <h3>Тур {r}</h3><div className={s.grid}>{games.filter(m=>m.group===i&&m.round===r).map(m=><MatchCard key={m.id} t={t} m={m} send={send}/>)}</div>
      </div>)}</section>)}</div>;
  const final=games[games.length-1];
  return <div className={s.stack}>
    {final.winner&&<p className={s.cover} role="status"><strong>Победитель демотурнира: {name(t,final.winner)}</strong></p>}
    {Array.from(new Set(games.map(m=>m.round))).map(r=><section className={s.section} key={r}><h2>{r===final.round?'Финал':`Раунд ${r}`}</h2>
      <div className={s.grid}>{games.filter(m=>m.round===r).map(m=><MatchCard key={m.id} t={t} m={m} send={send}/>)}</div></section>)}
  </div>;
}
export function Schedule({t,games,send}:Props) {
  const [onlyNext,setOnlyNext]=useState(true);
  const scheduled=games.filter(m=>!m.bye&&(!onlyNext||!(m.winner||t.system==='groups'&&m.score))).sort((x,y)=>{
    const a=t.slots[x.id],b=t.slots[y.id];return (a?.date||'9999').localeCompare(b?.date||'9999')||
      (a?.time||'99').localeCompare(b?.time||'99')||x.round-y.round||x.group-y.group;
  });
  return <section className={s.section}><h2>Расписание · учебное время Ташкента</h2>
    <label><input type="checkbox" checked={onlyNext} onChange={e=>setOnlyNext(e.target.checked)}/> Только незавершённые встречи</label>
    {!scheduled.length&&<p>Предстоящих матчей нет.</p>}
    {scheduled.map(m=>{const slot=t.slots[m.id];return <article key={m.id} className={s.section}>
      <p className={s.eyebrow}>{t.system==='groups'?`Группа ${m.group+1} · `:''}Тур {m.round} · {gameState(t,m)}</p>
      <h3>{name(t,m.a)} — {name(t,m.b)}</h3><p>{slot?.date||'Дата будет объявлена'} · {slot?.time||'Время будет объявлено'} · {slot?.venue||'Площадка будет объявлена'}</p>
      <details className={css.editor}><summary>Назначить дату и место</summary>
        <form className={s.fields} onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);
          send({type:'slot',id:m.id,slot:{date:String(f.get('date')),time:String(f.get('time')),venue:String(f.get('venue'))}});}}>
          <label>Дата<input name="date" type="date" min={t.start} max={t.end} defaultValue={slot?.date}/></label>
          <label>Время<input name="time" type="time" defaultValue={slot?.time}/></label>
          <label>Площадка<input name="venue" maxLength={100} defaultValue={slot?.venue}/></label>
          <button className={s.secondary}>Сохранить расписание</button></form></details></article>;})}
  </section>;
}
