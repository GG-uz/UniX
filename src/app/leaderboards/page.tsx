'use client';

import React from 'react';
import { LeaderboardTable } from '@/components/leaderboards/LeaderboardTable';
import { Trophy, Award, Flame, Shield, TrendingUp } from 'lucide-react';

export default function LeaderboardsPage() {
  return (
    <div className="py-12 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5" />
            Official Collegiate Standings
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Inter-University Championship Standings
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Live rankings aggregated from official matches played across certified arenas. Track team form, points, and qualification for the Annual Winter Super Cup.
          </p>
        </div>

        {/* Top 3 Spotlight Podium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Champion #1 */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-500/10 to-neutral-900 border border-amber-500/40 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  🏆 Rank #1 • Basketball
                </span>
                <h3 className="text-xl font-black text-white mt-1">MIPT Quantum Hawks</h3>
                <div className="text-xs text-neutral-400">Moscow Inst. Physics &amp; Tech</div>
              </div>
              <span className="text-3xl">⚡</span>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-between items-end">
              <div>
                <div className="text-xs text-neutral-400">Record: 9W - 0D - 1L</div>
                <div className="text-xs text-emerald-400 font-semibold">Win Rate: 90%</div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-amber-400">27</span>
                <span className="text-xs text-neutral-400 ml-1">pts</span>
              </div>
            </div>
          </div>

          {/* Champion #2 */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-neutral-800/40 to-neutral-900 border border-neutral-700 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  🥈 Rank #1 • Football
                </span>
                <h3 className="text-xl font-black text-white mt-1">HSE Eagles FC</h3>
                <div className="text-xs text-neutral-400">HSE University</div>
              </div>
              <span className="text-3xl">🦅</span>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-between items-end">
              <div>
                <div className="text-xs text-neutral-400">Record: 8W - 2D - 1L</div>
                <div className="text-xs text-emerald-400 font-semibold">Win Rate: 82%</div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-200">26</span>
                <span className="text-xs text-neutral-400 ml-1">pts</span>
              </div>
            </div>
          </div>

          {/* Champion #3 */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-orange-500/10 to-neutral-900 border border-orange-500/30 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-400">
                  🥉 Rank #1 • Volleyball
                </span>
                <h3 className="text-xl font-black text-white mt-1">ITMO CyberSpikes</h3>
                <div className="text-xs text-neutral-400">ITMO University</div>
              </div>
              <span className="text-3xl">🏐</span>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-between items-end">
              <div>
                <div className="text-xs text-neutral-400">Record: 8W - 0D - 2L</div>
                <div className="text-xs text-emerald-400 font-semibold">Win Rate: 80%</div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-orange-400">24</span>
                <span className="text-xs text-neutral-400 ml-1">pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Interactive Table */}
        <LeaderboardTable />
      </div>
    </div>
  );
}
