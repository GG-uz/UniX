'use client';

import React from 'react';
import Link from 'next/link';
import { useAppState } from '@/context/AppStateContext';
import { Swords, CheckCircle2, Clock, Trophy, ArrowRight } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';

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
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Live Challenge Feed &amp; Match Ticker
            </h3>
          </div>
          <Link
            href="/challenges"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            All Challenges <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Active Open Challenge Card */}
          {openChallenges.slice(0, 2).map((match) => (
            <div
              key={match.id}
              className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20 text-[10px] uppercase">
                    Open Challenge
                  </span>
                  <span className="text-neutral-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(match.scheduledDate)} {formatTime(match.scheduledDate)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{match.challengerTeam.logoUrl}</span>
                  <div>
                    <div className="text-sm font-bold text-white">{match.challengerTeam.name}</div>
                    <div className="text-[11px] text-neutral-400">{match.challengerTeam.universityName}</div>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 line-clamp-2 italic mb-3">
                  &ldquo;{match.description}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">{match.venue.name}</span>
                <Link
                  href="/challenges"
                  className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-white font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <Swords className="w-3 h-3" />
                  Accept
                </Link>
              </div>
            </div>
          ))}

          {/* Recent Match Result Card */}
          {recentCompleted.slice(0, 1).map((match) => (
            <div
              key={match.id}
              className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 text-[10px] uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Final Score
                  </span>
                  <span className="text-neutral-400 text-[11px]">
                    {formatDate(match.scheduledDate)}
                  </span>
                </div>

                <div className="py-2 flex items-center justify-around bg-neutral-950/60 rounded-xl border border-neutral-800/80 my-2">
                  <div className="text-center">
                    <div className="text-lg">{match.challengerTeam.logoUrl}</div>
                    <div className="text-xs font-bold text-white">{match.challengerTeam.name.split(' ')[0]}</div>
                    <div className="text-lg font-black text-amber-400">{match.scoreTeam1 ?? 0}</div>
                  </div>
                  <div className="text-xs font-bold text-neutral-400">VS</div>
                  <div className="text-center">
                    <div className="text-lg">{match.opponentTeam?.logoUrl ?? '🛡️'}</div>
                    <div className="text-xs font-bold text-white">{match.opponentTeam?.name.split(' ')[0] ?? 'Rival'}</div>
                    <div className="text-lg font-black text-amber-400">{match.scoreTeam2 ?? 0}</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-400">
                <span>{match.venue.name}</span>
                <Link href="/leaderboards" className="text-amber-400 hover:underline">
                  View Standings
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
