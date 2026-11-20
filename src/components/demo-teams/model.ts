// Fictional, local-only fixtures. IDs do not reference Supabase users or universities.
export const campuses = ['Академия «Орион»', 'Институт «Спектр»', 'Университет «Вектор»'];
export const disciplines = ['Футбол', 'Шахматы', 'Математика', 'Физика', 'IT-хакатон', 'Бизнес-кейс', 'Другая дисциплина'];
export const aliases = ['Комета', 'Фотон', 'Импульс', 'Радар', 'Зенит', 'Искра'];
export const statuses = {
  draft: 'Черновик', pending: 'На рассмотрении', verified: 'Одобрена в демо', rejected: 'Отклонена',
};
export type Status = keyof typeof statuses;
export type Proposal = {
  name: string; university: string; discipline: string; captain: string; members: string[];
};
export type Team = Proposal & {
  id: string; status: Status; reason: string;
  history: { event: string; outcome: 'Победа' | 'Участие' }[];
};
export const blank = (): Proposal => ({
  name: '', university: campuses[0], discipline: disciplines[0], captain: aliases[0], members: [aliases[0], aliases[1]],
});
export function valid(p: Proposal) {
  return p.name.trim().length >= 2 && p.name.trim().length <= 64 && campuses.includes(p.university)
    && disciplines.includes(p.discipline) && p.members.length >= 2 && p.members.includes(p.captain)
    && new Set(p.members).size === p.members.length && p.members.every(m=>aliases.includes(m));
}
export const seeds: Team[] = [
  { ...blank(), id: 'orbit', name: 'Орбита', university: campuses[0], discipline: 'IT-хакатон', status: 'verified',
    reason: '', history: [{event:'Учебный спринт «Прототип»',outcome:'Победа'},{event:'Учебная лаборатория идей',outcome:'Участие'}] },
  { ...blank(), id: 'tangent', name: 'Касательная', university: campuses[1], discipline:'Математика', status:'pending',reason:'',history:[] },
  { ...blank(), id: 'relay', name: 'Эстафета', university: campuses[2], discipline:'Футбол', status:'draft',reason:'',history:[] },
  { ...blank(), id: 'impulse', name:'Точка роста', university:campuses[0],discipline:'Бизнес-кейс',status:'rejected',
    reason:'Уточните название команды перед повторной подачей.',history:[] },
];
export type Mutation =
  | { type:'save'; id:string; proposal:Proposal }
  | { type:'submit'|'approve'|'revise'; id:string }
  | { type:'reject'; id:string; reason:string };

export function updateTeams(teams: Team[], action: Mutation): Team[] {
  const team = teams.find(t=>t.id===action.id);
  if(action.type==='save') {
    if ((team && team.status!=='draft') || !valid(action.proposal)) return teams;
    const draft:Team={...action.proposal,name:action.proposal.name.trim(),id:action.id,status:'draft',reason:'',history:[]};
    return team ? teams.map(t=>t===team?draft:t) : [draft,...teams];
  }
  if(!team) return teams;
  let status:Status, reason='';
  if(action.type==='submit' && team.status==='draft' && valid(team)) status='pending';
  else if(action.type==='approve' && team.status==='pending') status='verified';
  else if(action.type==='reject' && team.status==='pending' && action.reason.trim()) {
    status='rejected'; reason=action.reason.trim().slice(0,200);
  } else if(action.type==='revise' && team.status==='rejected') status='draft';
  else return teams;
  return teams.map(t=>t===team?{...t,status,reason}:t);
}
