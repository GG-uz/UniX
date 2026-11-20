import type { ReactNode } from 'react';
import { Atlas } from '@/components/ecosystem/Atlas';
import { TeamStore } from '@/components/demo-teams/Store';

export default function DemoTeamsLayout({children}:{children:ReactNode}) {
  return <Atlas demo><TeamStore>{children}</TeamStore></Atlas>;
}
