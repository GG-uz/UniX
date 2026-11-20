import type { Metadata } from 'next';
import { RankingHub } from '@/components/demo-rankings/RankingHub';

export const metadata:Metadata={title:'Демо-рейтинг UniX'};
export default function Page(){return <RankingHub/>;}
