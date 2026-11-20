import css from './ranking.module.css';
import type { summary } from './model';

type Stats=ReturnType<typeof summary>;
export function RankingStats({stats}:{stats:Stats}) {
  return <div className={css.stats}>
    {([['Турниров',stats.tournaments],['Подтверждено',stats.confirmed],['Ожидают',stats.pending],
      ['Матчей Elo',stats.eloMatches],['Достижений B×K',stats.achievements],['Дисциплин',stats.disciplines]] as const)
      .map(([label,value])=><div className={css.stat} key={label}><b>{value}</b><small>{label}</small></div>)}
  </div>;
}
