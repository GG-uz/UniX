import Link from 'next/link';
import { Frame, link, Unavailable } from '@/components/university/Frame';
import { supabase } from '@/lib/supabase/server';

async function Directory() {
  const db=await supabase();
  const result=await db?.from('universities').select('id,name').order('name');
  if(!result?.data)return <Unavailable/>;
  return <ul className="grid gap-3 sm:grid-cols-2">{result.data.map(u=><li key={u.id}>
    <Link className={link} href={`/challenges?university=${encodeURIComponent(u.id)}`}>{u.name}</Link>
  </li>)}</ul>;
}
export default function UniversitiesPage() {
  return <Frame title="Справочник университетов"><Directory/></Frame>;
}
