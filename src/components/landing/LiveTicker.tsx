'use client';

import React from 'react';
import Link from 'next/link';
import { useAppState } from '@/context/AppStateContext';
import { Swords, CheckCircle2, Clock, Trophy, ArrowRight } from 'lucide-react';
import { formatDate, formatTime, getDisciplineLabel } from '@/lib/utils';

export const LiveTicker: React.FC = () => {
  const { matches } = useAppState();

  const openChallenges = matches.filter((m) => m.status === 'OPEN');
  const recentCompleted = matches.filter((m) => m.status === 'COMPLETED');

  return (
    <section className="py-12 bg-neutral-900/30 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Демонстрационные данные: вызовы и итоги матчей
            </h3>
          </div>
          <Link
            href="/challenges"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            Все вызовы <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Active Open Challenge Cards */}
          {openChallenges.slice(0, 2).map((match) => (
            <div
              key={match.id}
              className="p-4 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-[10px] uppercase">
                    Ждет соперника
                  </span>
                  <span className="text-neutral-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(match.scheduledDate)} {formatTime(match.scheduledDate)}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-2xl">{match.challengerTeam.logoUrl}</span>
                  <div>
                    <div className="text-sm font-bold text-white">{match.challengerTeam.name}</div>
                    <div className="text-[11px] text-amber-400 font-semibold">{match.challengerTeam.universityName}</div>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 line-clamp-2 italic mb-3">
                  &ldquo;{match.description}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-neutral-400">
                  {getDisciplineLabel(match.sportType)}
                </span>
                <Link
                  href="/challenges"
                  className="px-3 py-1 rounded-xl bg-amber-500 text-neutral-950 font-bold text-[11px] hover:bg-amber-400 transition-colors flex items-center gap-1"
                >
                  <Swords className="w-3 h-3" /> Принять
                </Link>
              </div>
            </div>
          ))}

          {/* Recent Completed Result Card */}
          {recentCompleted.slice(0, 1).map((match) => (
            <div
              key={match.id}
              className="p-4 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20 text-[10px] uppercase">
                    Завершенный матч
                  </span>
                  <span className="text-neutral-400 text-[11px]">{formatDate(match.scheduledDate)}</span>
                </div>

                <div className="flex items-center justify-between my-2 p-2 bg-neutral-950 rounded-2xl border border-neutral-800">
                  <div className="text-center flex-1">
                    <div className="text-base">{match.challengerTeam.logoUrl}</div>
                    <div className="text-xs font-bold text-white truncate">{match.challengerTeam.name}</div>
                    <div className="text-[10px] text-neutral-400">{match.challengerTeam.universityName}</div>
                  </div>

                  <div className="px-2 text-center">
                    <div className="text-base font-black text-amber-400">
                      {match.scoreTeam1 ?? 0} : {match.scoreTeam2 ?? 0}
                    </div>
                    <div className="text-[9px] text-neutral-500 uppercase font-bold">Итог</div>
                  </div>

                  <div className="text-center flex-1">
                    <div className="text-base">{match.opponentTeam?.logoUrl ?? '🛡️'}</div>
                    <div className="text-xs font-bold text-white truncate">
                      {match.opponentTeam?.name ?? 'Соперник'}
                    </div>
                    <div className="text-[10px] text-neutral-400">{match.opponentTeam?.universityName}</div>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 line-clamp-1 italic text-center">
                  &ldquo;{match.description}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-neutral-400">
                  {getDisciplineLabel(match.sportType)}
                </span>
                <Link
                  href="/leaderboards"
                  className="text-amber-400 hover:text-amber-300 font-bold text-[11px] flex items-center gap-1"
                >
                  <Trophy className="w-3 h-3" /> Таблица Лиги
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
