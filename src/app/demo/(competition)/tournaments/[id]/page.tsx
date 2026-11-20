import { Suspense } from 'react';
import { TournamentDetail } from '@/components/demo-tournaments/TournamentDetail';
async function Content({params}:PageProps<'/demo/tournaments/[id]'>){
  return <TournamentDetail id={(await params).id}/>;
}
export default function Page(props:PageProps<'/demo/tournaments/[id]'>){
  return <Suspense fallback={<p>Загрузка турнирной карточки…</p>}><Content {...props}/></Suspense>;
}
