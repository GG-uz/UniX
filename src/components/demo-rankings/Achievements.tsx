'use client';
import { useMemo,useState } from 'react';
import s from '@/components/ecosystem/Atlas.module.css';
import css from './ranking.module.css';
import {
  achievementStudents,achievementTeams,achievementUniversities,
  type AchievementRow,
} from './model';
import type { Tournament } from '@/components/demo-tournaments/model';

type Kind='universities'|'teams'|'students';
const kinds:[Kind,string][]=[['universities','Университеты'],['teams','Команды'],['students','Студенты']];

function Achievement({row}:{row:AchievementRow}) {
  return <details className={css.row} data-achievement={row.id}>
    <summary>
      <span className={css.rank}>{row.rank}</span>
      <span className={css.who}><b>{row.name}</b></span>
      <span className={css.metric}><b>{row.points}</b><small>очков</small></span>
      <span className={css.metric}><b>{row.counted}</b><small>зачёт</small></span>
      <span className={css.metric}><b>{row.firsts}</b><small>первых</small></span>
      <span className={css.metric}><b>{row.disciplines}</b><small>дисциплин</small></span>
    </summary>
    <div className={css.breakdown}>
      <p className={css.formula}>Достижения B×K не входят в Elo и не суммируются с ним.</p>
      <div className={css.achievementList}>
        {row.results.map(result=><div className={css.achievementResult} key={result.key}>
          <span><b>{result.title}</b><small>{result.start} · {result.discipline} · место {result.placeLabel}</small></span>
          <span>{result.points}<small>{result.base} × {result.factor}</small></span>
        </div>)}
      </div>
      {row.excluded.length>0&&<div className={css.excluded}>
        <b>Не вошло в зачёт</b>
        <ul>{row.excluded.map(item=><li key={item.result.key}>{item.result.title} · место {item.result.placeLabel} · {item.result.points} очков — {item.reason}</li>)}</ul>
      </div>}
    </div>
  </details>;
}
export function Achievements({list,discipline}:{list:Tournament[];discipline:string}) {
  const [kind,setKind]=useState<Kind>('universities');
  const rows=useMemo(()=>{
    if(kind==='universities')return achievementUniversities(list,discipline||undefined);
    if(kind==='teams')return achievementTeams(list,discipline||undefined);
    return achievementStudents(list,discipline||undefined);
  },[list,kind,discipline]);
  return <section className={s.section}>
    <p className={s.eyebrow}>Отдельно от Elo</p>
    <h2>Турнирные достижения B×K</h2>
    <p>Очки за место в подтверждённом турнире. Они показывают достижения, но не меняют Elo и не складываются с ним.</p>
    <nav className={css.tabs} aria-label="Таблица достижений">
      {kinds.map(([key,label])=><button key={key} className={kind===key?s.primary:s.secondary}
        aria-pressed={kind===key} onClick={()=>setKind(key)}>{label}</button>)}
    </nav>
    {rows.length
      ?<div className={css.board} data-achievement-board={kind}>{rows.map(row=><Achievement key={row.id} row={row}/>)}</div>
      :<p className={css.empty}>Нет подтверждённых достижений по этому фильтру.</p>}
  </section>;
}
