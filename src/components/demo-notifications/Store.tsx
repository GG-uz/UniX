'use client';
import { createContext,useContext,useReducer,type Dispatch,type ReactNode } from 'react';
import { update,type Action,type DemoNotification } from './model';

const Store=createContext<{list:DemoNotification[];dispatch:Dispatch<Action>}|null>(null);
export function DemoNotificationsProvider({children}:{children:ReactNode}) {
  const [list,dispatch]=useReducer(update,[]);
  return <Store.Provider value={{list,dispatch}}>{children}</Store.Provider>;
}
export function useDemoInbox(){
  const value=useContext(Store);
  if(!value)throw new Error('Missing DemoNotificationsProvider');
  return value;
}
