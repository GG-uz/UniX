import type { ReactNode } from 'react';
import { Atlas } from '@/components/ecosystem/Atlas';
import { TournamentStore } from '@/components/demo-tournaments/Store';
export default function Layout({children}:{children:ReactNode}) {
  return <Atlas demo><TournamentStore>{children}</TournamentStore></Atlas>;
}
