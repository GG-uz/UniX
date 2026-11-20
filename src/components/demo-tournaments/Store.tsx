'use client';
import { createContext,useContext,useReducer,type ReactNode,type Dispatch } from 'react';
import { change,create,validate,type Tournament,type Action,type Config } from './model';
import { seedTournaments } from './seed';

type Event={type:'new';id:string;config:Config}|{type:'edit';id:string;action:Action};
const Store=createContext<{list:Tournament[];dispatch:Dispatch<Event>}|null>(null);
export function TournamentStore({children}:{children:ReactNode}) {
  const [list,dispatch]=useReducer((prev:Tournament[],e:Event)=>{
    if(e.type==='new')return validate(e.config)||prev.some(t=>t.id===e.id)?prev:[create(e.id,e.config),...prev];
    return prev.map(t=>t.id===e.id?change(t,e.action):t);
  },undefined,seedTournaments);
  return <Store.Provider value={{list,dispatch}}>{children}</Store.Provider>;
}
export function useTournaments(){const ctx=useContext(Store);if(!ctx)throw new Error('Missing tournament store');return ctx;}
