'use client';

import React from 'react';
import Link from 'next/link';
import { LeaderboardTable } from '@/components/leaderboards/LeaderboardTable';
import { Trophy } from 'lucide-react';

export default function LeaderboardsPage() {
  return (
    <div className="py-12 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5" />
              Демонстрационные данные · Пример зачёта
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Рейтинг Вузов &amp; Турнирная Таблица
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Сводная таблица по результатам спортивных дерби, олимпиадных матбоев, хакатонов и кейс-чемпионатов среди университетов Ташкента (TEAM University, WIUT, Inha, MDIST, Amity, ТУИТ).
          </p>
          <Link href="/demo/rankings" className="text-sm text-amber-400 underline">Открыть демо-рейтинг Elo →</Link>
        </div>

        {/* Top 3 Spotlight Podium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Champion #1 */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-500/10 to-neutral-900 border border-amber-500/40 relative overflow-hidden flex flex-col justify-between shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  🏆 #1 Место • Футбол 5x5
                </span>
                <h3 className="text-xl font-black text-white mt-1">TEAM Titans FC</h3>
                <div className="text-xs text-amber-400 font-bold">TEAM University</div>
              </div>
              <span className="text-3xl">⚡</span>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-between items-end">
              <div>
                <div className="text-xs text-neutral-400">Статистика: 9В - 1Н - 1П</div>
                <div className="text-xs text-emerald-400 font-bold">Винрейт: 88%</div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-amber-400">28</span>
                <span className="text-xs text-neutral-400 ml-1">очков</span>
              </div>
            </div>
          </div>

          {/* Champion #2 */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-neutral-800/40 to-neutral-900 border border-neutral-700 relative overflow-hidden flex flex-col justify-between shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  🥈 #1 Место • IT &amp; Хакатоны
                </span>
                <h3 className="text-xl font-black text-white mt-1">TEAM AI Innovators</h3>
                <div className="text-xs text-amber-400 font-bold">TEAM University</div>
              </div>
              <span className="text-3xl">💻</span>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-between items-end">
              <div>
                <div className="text-xs text-neutral-400">Статистика: 8В - 0Н - 2П</div>
                <div className="text-xs text-emerald-400 font-bold">Винрейт: 80%</div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white">24</span>
                <span className="text-xs text-neutral-400 ml-1">очка</span>
              </div>
            </div>
          </div>

          {/* Champion #3 */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-orange-950/20 to-neutral-900 border border-orange-800/40 relative overflow-hidden flex flex-col justify-between shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-400">
                  🥉 #1 Место • Математика
                </span>
                <h3 className="text-xl font-black text-white mt-1">TEAM Quantum Math</h3>
                <div className="text-xs text-amber-400 font-bold">TEAM University</div>
              </div>
              <span className="text-3xl">📐</span>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-between items-end">
              <div>
                <div className="text-xs text-neutral-400">Статистика: 7В - 2Н - 1П</div>
                <div className="text-xs text-emerald-400 font-bold">Винрейт: 75%</div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-amber-400">23</span>
                <span className="text-xs text-neutral-400 ml-1">очка</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full Interactive Table */}
        <LeaderboardTable />
      </div>
    </div>
  );
}
