import { Suspense } from 'react';
import { TeamView } from '@/components/demo-teams/TeamView';
async function Detail({params}:PageProps<'/demo/teams/[id]'>) {
  return <TeamView id={(await params).id}/>;
}
export default function TeamPage(props:PageProps<'/demo/teams/[id]'>) {
  return <Suspense fallback={<p>Загрузка карточки…</p>}><Detail {...props}/></Suspense>;
}
