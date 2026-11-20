'use client';
import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import { seeds, updateTeams, type Team, type Mutation } from './model';

const Store=createContext<{teams:Team[];dispatch:Dispatch<Mutation>}|null>(null);
export function TeamStore({children}:{children:ReactNode}) {
  const [teams,dispatch]=useReducer(updateTeams,seeds);
  return <Store.Provider value={{teams,dispatch}}>{children}</Store.Provider>;
}
export function useTeams() {
  const value=useContext(Store);
  if(!value)throw new Error('TeamStore required');
  return value;
}
