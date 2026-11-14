'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/AppStateContext';
import { DISCIPLINE_LIST } from '@/types';
import { Trophy, Medal, Award, Flame } from 'lucide-react';
import { getDisciplineLabel } from '@/lib/utils';

export const LeaderboardTable: React.FC = () => {
  const { teams } = useAppState();
  const [selectedSport, setSelectedSport] = useState<string>('ALL');

  const filteredTeams = teams
    .filter((t) => selectedSport === 'ALL' || t.sportType === selectedSport)
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="space-y-6">
      {/* Category Tabs & Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-400">Дисциплина:</span>
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="py-2 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">🏆 Все направления ({DISCIPLINE_LIST.length})</option>
            {DISCIPLINE_LIST.map((d) => (
              <option key={d.type} value={d.type}>
                {d.icon} {d.labelRu}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-neutral-400 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-500" />
          <span>Система очков: Победа = 3 очка • Ничья = 1 очко • Поражение = 0</span>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="rounded-3xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-neutral-950/80 border-b border-neutral-800 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-4 sm:px-6 w-16 text-center">Место</th>
                <th className="py-4 px-4 sm:px-6">Вуз &amp; Команда</th>
                <th className="py-4 px-4 sm:px-6">Дисциплина</th>
                <th className="py-4 px-4 sm:px-6 text-center">Игр</th>
                <th className="py-4 px-4 sm:px-6 text-center">В - Н - П</th>
                <th className="py-4 px-4 sm:px-6 text-center">Форма</th>
                <th className="py-4 px-4 sm:px-6 text-right font-black text-amber-400">Очки</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-medium">
              {filteredTeams.map((team, idx) => {
                const rank = idx + 1;
                const totalPlayed = team.matchesWon + team.matchesLost + team.matchesDrawn;
                const isTeamUni = team.universityName.includes('TEAM');

                return (
                  <tr
                    key={team.id}
                    className={`hover:bg-neutral-800/40 transition-colors ${
                      isTeamUni ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    {/* Rank Badge */}
                    <td className="py-4 px-4 sm:px-6 text-center">
                      {rank === 1 ? (
                        <div className="w-7 h-7 mx-auto rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-xs">
                          🥇
                        </div>
                      ) : rank === 2 ? (
                        <div className="w-7 h-7 mx-auto rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/40 flex items-center justify-center font-black text-xs">
                          🥈
                        </div>
                      ) : rank === 3 ? (
                        <div className="w-7 h-7 mx-auto rounded-full bg-orange-700/20 text-orange-400 border border-orange-700/40 flex items-center justify-center font-black text-xs">
                          🥉
                        </div>
                      ) : (
                        <span className="font-bold text-neutral-400">#{rank}</span>
                      )}
                    </td>

                    {/* Team & University */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl shrink-0">{team.logoUrl || '🛡️'}</span>
                        <div>
                          <div className="font-black text-white flex items-center gap-1.5">
                            {team.name}
                            {isTeamUni && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 border border-amber-500/30 text-amber-400">
                                Мой Вуз
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-400">{team.universityName}</div>
                        </div>
                      </div>
                    </td>

                    {/* Discipline */}
                    <td className="py-4 px-4 sm:px-6">
                      <span className="px-2.5 py-1 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-neutral-300">
                        {getDisciplineLabel(team.sportType)}
                      </span>
                    </td>

                    {/* Games Played */}
                    <td className="py-4 px-4 sm:px-6 text-center font-semibold text-neutral-300">
                      {totalPlayed}
                    </td>

                    {/* W - D - L */}
                    <td className="py-4 px-4 sm:px-6 text-center font-bold text-white text-xs">
                      <span className="text-emerald-400">{team.matchesWon}</span> -{' '}
                      <span className="text-neutral-400">{team.matchesDrawn}</span> -{' '}
                      <span className="text-red-400">{team.matchesLost}</span>
                    </td>

                    {/* Recent Form */}
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {team.recentForm.map((f, i) => (
                          <span
                            key={i}
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                              f === 'W'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : f === 'D'
                                ? 'bg-neutral-700/40 text-neutral-300 border border-neutral-600'
                                : 'bg-red-500/20 text-red-400 border border-red-500/40'
                            }`}
                          >
                            {f === 'W' ? 'В' : f === 'D' ? 'Н' : 'П'}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Total Points */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <span className="text-base font-black text-amber-400">
                        {team.totalPoints}
                      </span>
                      <span className="text-[11px] text-neutral-400 ml-1">очков</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
