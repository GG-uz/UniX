import { Frame, Notice, Unavailable, panel, input, button } from '@/components/university/Frame';
import { requireProfile } from '@/lib/auth/session';
import { supabase } from '@/lib/supabase/server';
import { param, type Query } from '@/lib/university/data';
import { provision } from '@/lib/university/actions';

async function Provisioning({query}:{query:Promise<Query>}) {
  await requireProfile(['SUPER_ADMIN']);
  const db=await supabase();const result=await db?.from('universities').select('id,name').order('name');
  if(!result?.data)return <Unavailable/>;
  return <form className={`${panel} max-w-xl`} action={provision}>
    <Notice value={param(await query,'notice')}/>
    <p>Сверьте личность и полномочия представителя вне платформы. Назначение действует только в выбранном вузе.</p>
    <label className="block">Подтверждённый UID пользователя<input className={input} name="id" required maxLength={36}/></label>
    <label className="block">Университет<select name="university" className={input} defaultValue="" required>
      <option value="" disabled>Выберите университет</option>{result.data.map(u=><option value={u.id} key={u.id}>{u.name}</option>)}</select></label>
    <button className={button} name="op" value="grant">Назначить администратора</button>{' '}
    <button className="underline" name="op" value="revoke">Отозвать полномочия</button>
  </form>;
}
export default function UniversityAdmins({searchParams}:PageProps<'/admin/universities'>) {
  return <Frame title="Администраторы университетов"><Provisioning query={searchParams}/></Frame>;
}
