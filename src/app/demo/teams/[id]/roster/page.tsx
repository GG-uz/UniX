import { Suspense } from 'react';
import { TeamView } from '@/components/demo-teams/TeamView';
async function Roster({params}:PageProps<'/demo/teams/[id]/roster'>) {
  return <TeamView id={(await params).id} roster/>;
}
export default function RosterPage(props:PageProps<'/demo/teams/[id]/roster'>) {
  return <Suspense fallback={<p>Загрузка состава…</p>}><Roster {...props}/></Suspense>;
}
