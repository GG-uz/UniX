import type { Metadata } from 'next';
import { History } from '@/components/demo-rankings/History';

export const metadata:Metadata={title:'Демо-рейтинг · история'};
export default function Page(){return <History/>;}
