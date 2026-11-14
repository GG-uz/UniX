'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SportType, DISCIPLINE_LIST } from '@/types';
import {
  Sparkles,
  Zap,
  Swords,
  MapPin,
  Calendar,
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState<SportType>('FOOTBALL');
  const [selectedDate, setSelectedDate] = useState('2026-11-20');

  const handleQuickSearch = (target: 'venues' | 'challenges') => {
    router.push(`/${target}?sport=${selectedSport}&date=${selectedDate}`);
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-neutral-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-neutral-950 to-neutral-950">
      {/* Background Decorative Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#26262615_1px,transparent_1px),linear-gradient(to_bottom,#26262615_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Tag Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Сезон 2026/2027: Спорт &amp; Наука</span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-300">Гарантия брони: До 300 000 сум/час</span>
          </div>
        </div>

        {/* Main Heading */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight sm:leading-none">
            Вузы Ташкента.{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Спорт &amp; Научные Битвы.
            </span>{' '}
            0% Срывов.
          </h1>
          <p className="text-base sm:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Платформа для студенческих команд: бросайте вызов вузам (TEAM University, WIUT, Inha, MDIST, Amity, ТУИТ) в <strong className="text-amber-400 font-bold">Футболе, Математике, Физике, Химии и IT-Хакатонах</strong> с защищенной предоплатой площадок.
          </p>
        </div>

        {/* Quick Search & Matchmaker Console */}
        <div className="mt-10 max-w-3xl mx-auto bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-2xl backdrop-blur-md">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Быстрый подбор соперника или площадки
            </span>
            <span className="text-neutral-400 hidden sm:inline text-[11px]">
              Защита отмены 48ч активна
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Discipline Selector */}
            <div className="sm:col-span-5 bg-neutral-950 border border-neutral-800 rounded-2xl p-2.5 flex flex-col justify-center">
              <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1">
                Дисциплина / Проект
              </label>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value as SportType)}
                className="bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer"
              >
                {DISCIPLINE_LIST.map((d) => (
                  <option key={d.type} value={d.type} className="bg-neutral-900 text-white">
                    {d.icon} {d.labelRu}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="sm:col-span-3 bg-neutral-950 border border-neutral-800 rounded-2xl p-2.5 flex flex-col justify-center">
              <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1">
                Дата игры
              </label>
              <div className="flex items-center gap-1.5 text-white">
                <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer w-full"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sm:col-span-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickSearch('challenges')}
                className="w-full h-full py-3 px-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Swords className="w-4 h-4" />
                <span>Найти соперника</span>
              </button>
              <button
                onClick={() => handleQuickSearch('venues')}
                className="w-full h-full py-3 px-2 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 border border-neutral-700 active:scale-95 transition-all cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Найти слот</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Metric Counters */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 text-center">
            <div className="text-2xl sm:text-3xl font-black text-white">12+</div>
            <div className="text-[11px] font-bold text-neutral-400 mt-1 uppercase">Вузов Ташкента</div>
            <div className="text-[10px] text-amber-400 font-semibold mt-0.5">вкл. TEAM University</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 text-center">
            <div className="text-2xl sm:text-3xl font-black text-amber-400">9 Направлений</div>
            <div className="text-[11px] font-bold text-neutral-400 mt-1 uppercase">Спорт, Наука &amp; IT</div>
            <div className="text-[10px] text-neutral-400">Матбои, Хакатоны, Футбол</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 text-center">
            <div className="text-2xl sm:text-3xl font-black text-white">≤ 300 000 сум</div>
            <div className="text-[11px] font-bold text-neutral-400 mt-1 uppercase">Макс. ставка в час</div>
            <div className="text-[10px] text-emerald-400 font-semibold">Доступно студентам</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 text-center">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">100%</div>
            <div className="text-[11px] font-bold text-neutral-400 mt-1 uppercase">Явка на матчи</div>
            <div className="text-[10px] text-neutral-400">Политика отмены 48ч</div>
          </div>
        </div>
      </div>
    </section>
  );
};
