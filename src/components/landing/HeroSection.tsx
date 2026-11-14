'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SportType } from '@/types';
import {
  Trophy,
  Swords,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState<SportType>('FOOTBALL');
  const [selectedDate, setSelectedDate] = useState('2026-11-14');

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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Collegiate Season 2026/2027 Open</span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-300">Mandatory Prepayment Guarantee</span>
          </div>
        </div>

        {/* Main Punchy Heading */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight sm:leading-none">
            Rival Universities.{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Verified Arenas.
            </span>{' '}
            Zero No-Shows.
          </h1>
          <p className="text-base sm:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            The dedicated matchmaking and slot booking network for university student teams. Challenge rivals in Football, Basketball & Volleyball with guaranteed prepaid reservations.
          </p>
        </div>

        {/* Quick Search & Matchmaker Console */}
        <div className="mt-10 max-w-3xl mx-auto bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Quick Matchmaker & Arena Discovery
            </span>
            <span className="text-neutral-400 hidden sm:inline">Strict 48h cancellation protection enabled</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Sport Selector */}
            <div className="sm:col-span-5 bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 flex flex-col justify-center">
              <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Select Sport</label>
              <div className="flex gap-1.5">
                {(['FOOTBALL', 'BASKETBALL', 'VOLLEYBALL'] as SportType[]).map((sport) => (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => setSelectedSport(sport)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                      selectedSport === sport
                        ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    {sport === 'FOOTBALL' ? '⚽ Football' : sport === 'BASKETBALL' ? '🏀 Basket' : '🏐 Volley'}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selector */}
            <div className="sm:col-span-3 bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 flex flex-col justify-center">
              <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-neutral-400" /> Match Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
              />
            </div>

            {/* Action Buttons */}
            <div className="sm:col-span-4 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => handleQuickSearch('challenges')}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold text-xs rounded-xl py-3 px-3 flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-lg shadow-orange-500/20"
              >
                <Swords className="w-4 h-4 text-neutral-950" />
                Find Rival
              </button>
              <button
                type="button"
                onClick={() => handleQuickSearch('venues')}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded-xl py-3 px-3 flex items-center justify-center gap-1.5 transition-colors border border-neutral-700"
              >
                <MapPin className="w-4 h-4 text-amber-400" />
                Book Arena
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic High-Impact Metric Counter */}
        <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 text-center hover:border-neutral-700 transition-colors">
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">18+</div>
            <div className="text-xs font-medium text-neutral-400 mt-1 uppercase tracking-wider">
              Active Universities
            </div>
            <div className="text-[11px] text-amber-400/80 mt-0.5">HSE, Bauman, MSU, MIPT</div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 text-center hover:border-neutral-700 transition-colors">
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">34</div>
            <div className="text-xs font-medium text-neutral-400 mt-1 uppercase tracking-wider">
              Upcoming Matches
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5">100% Prepayment Locked</div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 text-center hover:border-neutral-700 transition-colors">
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">14</div>
            <div className="text-xs font-medium text-neutral-400 mt-1 uppercase tracking-wider">
              Partner Arenas
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Dynamo, Luzhniki, Spartak</div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 text-center hover:border-neutral-700 transition-colors">
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">0%</div>
            <div className="text-xs font-medium text-neutral-400 mt-1 uppercase tracking-wider">
              No-Show Rate
            </div>
            <div className="text-[11px] text-amber-400 mt-0.5">Guaranteed by 48h Escrow</div>
          </div>
        </div>
      </div>
    </section>
  );
};
