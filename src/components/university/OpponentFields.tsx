'use client';
import { useState } from 'react';
import type { Entry } from '@/lib/university/data';
import { input } from './Frame';

export function OpponentFields({options}:{options:Entry[]}) {
  const [kind,setKind]=useState('OPEN');
  return <>
    <label className="block">Тип вызова<select className={input} name="kind" value={kind} onChange={e=>setKind(e.target.value)}>
      <option value="OPEN">Открытый — любой другой университет</option><option value="DIRECT">Адресный</option>
    </select></label>
    {kind==='DIRECT'&&<label className="block">Университет соперника<select className={input} name="target" required defaultValue="">
      <option value="" disabled>Выберите университет</option>{options.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
    </select></label>}
  </>;
}
