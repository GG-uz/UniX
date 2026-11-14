'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/AppStateContext';
import { SportType, Team } from '@/types';
import { Trophy, Medal, Award, Flame, TrendingUp } from 'lucide-react';

export const LeaderboardTable: React.FC = () => {
  const { teams } = useAppState();
  const [selectedSport, setSelectedSport] = useState<string>('ALL');

  const filteredTeams = teams
    .filter((t) => selectedSport === 'ALL' || t.sportType === selectedSport)
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="space-y-6">
      {/* Sport Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900 border border-neutral-800">
          {['ALL', 'FOOTBALL', 'BASKETBALL', 'VOLLEYBALL'].map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedSport === sport
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {sport === 'ALL' ? '🏆 All Sports' : sport === 'FOOTBALL' ? '⚽ Football' : sport === 'BASKETBALL' ? '🏀 Basketball' : '🏐 Volleyball'}
            </button>
          ))}
        </div>

        <div className="text-xs text-neutral-400 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-500" />
          <span>Official Points System: Win = 3 pts • Draw = 1 pt • Loss = 0 pts</span>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="rounded-3xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-neutral-950/80 border-b border-neutral-800 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-4 sm:px-6 w-16 text-center">Rank</th>
                <th className="py-4 px-4 sm:px-6">University &amp; Team</th>
                <th className="py-4 px-4 sm:px-6">Discipline</th>
                <th className="py-4 px-4 sm:px-6 text-center">Played</th>
                <th className="py-4 px-4 sm:px-6 text-center">W - D - L</th>
                <th className="py-4 px-4 sm:px-6 text-center">Recent Form</th>
                <th className="py-4 px-4 sm:px-6 text-right font-black text-amber-400">Total Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-medium">
              {filteredTeams.map((team, idx) => {
                const rank = idx + 1;
                const totalPlayed = team.matchesWon + team.matchesLost + team.matchesDrawn;

                return (
                  <tr
                    key={team.id}
                    className={`hover:bg-neutral-800/40 transition-colors ${
                      rank === 1
                        ? 'bg-amber-500/5'
                        : rank === 2
                        ? 'bg-neutral-800/20'
                        : rank === 3
                        ? 'bg-orange-500/5'
                        : ''
                    }`}
                  >
                    {/* Rank Badge */}
                    <td className="py-4 px-4 sm:px-6 text-center">
                      {rank === 1 ? (
                        <div className="w-7 h-7 mx-auto rounded-full bg-amber-500 text-neutral-950 font-black flex items-center justify-center text-xs shadow-lg shadow-amber-500/30">
                          1
                        </div>
                      ) : rank === 2 ? (
                        <div className="w-7 h-7 mx-auto rounded-full bg-slate-300 text-neutral-950 font-black flex items-center justify-center text-xs">
                          2
                        </div>
                      ) : rank === 3 ? (
                        <div className="w-7 h-7 mx-auto rounded-full bg-amber-700 text-white font-black flex items-center justify-center text-xs">
                          3
                        </div>
                      ) : (
                        <span className="font-bold text-neutral-400">{rank}</span>
                      )}
                    </td>

                    {/* University & Team */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{team.logoUrl || '🛡️'}</span>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            {team.name}
                            {rank === 1 && (
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                                League Leader
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-400 font-semibold flex items-center gap-1.5 mt-0.5">
                            <span className="text-amber-400/90">{team.universityName}</span>
                            <span className="text-neutral-600">•</span>
                            <span className="text-neutral-400">Capt: {team.captainName}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Sport */}
                    <td className="py-4 px-4 sm:px-6">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {team.sportType}
                      </span>
                    </td>

                    {/* Played */}
                    <td className="py-4 px-4 sm:px-6 text-center font-bold text-neutral-300">
                      {totalPlayed}
                    </td>

                    {/* W - D - L */}
                    <td className="py-4 px-4 sm:px-6 text-center font-bold">
                      <span className="text-emerald-400">{team.matchesWon}</span>
                      <span className="text-neutral-500 mx-1">-</span>
                      <span className="text-neutral-400">{team.matchesDrawn}</span>
                      <span className="text-neutral-500 mx-1">-</span>
                      <span className="text-red-400">{team.matchesLost}</span>
                    </td>

                    {/* Form Pills */}
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {team.recentForm.map((f, fIdx) => (
                          <span
                            key={fIdx}
                            className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black ${
                              f === 'W'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : f === 'D'
                                ? 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                                : 'bg-red-500/20 text-red-400 border border-red-500/40'
                            }`}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Total Points */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <span className="text-base sm:text-lg font-black text-amber-400">
                        {team.totalPoints}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-semibold ml-1">pts</span>
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
