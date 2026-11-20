'use client';
import { createContext,useContext,useReducer,type ReactNode,type Dispatch } from 'react';
import { campuses,create,change,defaults,matches,pool,validate,type Tournament,type Action,type Config } from './model';

function filled(id:string,c:Config,count:number) {
  let t=create(id,c);
  for(const p of pool(c.format).slice(0,count)){
    t=change(t,{type:'apply',participant:p.id});t=change(t,{type:'approve',participant:p.id});
  }
  return t;
}
function fixtures():Tournament[] {
  const cup=filled('orbit-cup',{...defaults,title:'Кубок орбит',description:'Учебный командный кубок. Одобрите пятую заявку и закройте регистрацию, чтобы увидеть неполную сетку.',capacity:5},4);
  const logic=filled('logic-lab',{...defaults,title:'Лаборатория логики',description:'Личный круговой турнир: результаты каждого поединка меняют таблицу очков.',
    organizer:campuses[1],format:'INDIVIDUAL',discipline:'Математика',system:'groups',capacity:4},4);
  const sprint=filled('case-sprint',{...defaults,title:'Спринт решений',description:'Завершённый учебный финал по бизнес-кейсам.',
    organizer:campuses[2],discipline:'Бизнес-кейс',capacity:2},2);
  const final=change(sprint,{type:'close'});
  return [change(cup,{type:'apply',participant:'TEAM-5'}),change(logic,{type:'close'}),
    change(final,{type:'score',id:matches(final)[0].id,score:{a:2,b:1}})];
}
type Event={type:'new';id:string;config:Config}|{type:'edit';id:string;action:Action};
const Store=createContext<{list:Tournament[];dispatch:Dispatch<Event>}|null>(null);
export function TournamentStore({children}:{children:ReactNode}) {
  const [list,dispatch]=useReducer((prev:Tournament[],e:Event)=>{
    if(e.type==='new')return validate(e.config)||prev.some(t=>t.id===e.id)?prev:[create(e.id,e.config),...prev];
    return prev.map(t=>t.id===e.id?change(t,e.action):t);
  },undefined,fixtures);
  return <Store.Provider value={{list,dispatch}}>{children}</Store.Provider>;
}
export function useTournaments(){const ctx=useContext(Store);if(!ctx)throw new Error('Missing tournament store');return ctx;}
